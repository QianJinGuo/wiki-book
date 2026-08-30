---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-practice-validation
ingested: 2026-08-30
feed_name: AWS China Blog
source_published: 2026-08-28
sha256: ef8a4eb38bb3db6a
---

|---|---|---  
集成 | 把 AgentCore 的某个能力当工具，塞进 Dify 流程里（比如让 Dify 节点去调 AgentCore Browser 抓网页，或把代码执行底座换成 AgentCore Code Interpreter） | 还是 Dify 平台 | 后续文章讨论  
承载 / 运行 | 把在 Dify 编排好的整条 workflow，放到 AgentCore Runtime 上去跑 | AgentCore Runtime | 本文主题  
  
前者是 Dify 调 AWS，后者是 AWS 跑 Dify 编排好的流程。本文讲的是后者：workflow 继续在 Dify 上设计，运行底座放到 AgentCore Runtime 上。这里说的迁移指运行底座的承载方式，不是让团队离开 Dify。集成方向（让 Dify 平台照常运行，把其中某类能力交给 AgentCore）是另一个独立话题，我们会在后续文章单独展开。

## **三、关键洞察：Dify 的[工作流](<https://aws.amazon.com/cn/what-is/workflow/>)引擎已经解耦成一个库**

这条迁移路径的前提是一个发现：新版 Dify 已经把工作流执行引擎从平台里抽了出来，做成一个独立的 [Python](<https://aws.amazon.com/cn/what-is/python/>) 包 graphon。迁移一条 workflow 因此不再等于搬整个 Dify 平台，而是 `pip install graphon` 再带上那份 DSL。迁移的性质从重平台搬迁变成了装一个库加适配少数几个节点。

需要说明的是，这是一个基于源码与包结构的工程发现，不是 Dify 官方文档给出的承诺。截至本文校对，Dify 官方文档并未把 graphon 作为可独立运行工作流的方案对外宣传。graphon 由 Dify 背后的 GitHub 组织 langgenius 维护，自我定位是 “a Python graph execution engine for agentic [AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) workflows”，并明确支持用 `graphon.dsl.loads()` 导入 Dify DSL。但它仍在快速演进（详见选型建议一节的版本风险提示），用在严肃场景前请自行核对当时的源码与版本。

引擎对外的接口只有几行：
    
    
    from graphon.dsl import importer
    # dsl_yaml 就是你从 Dify 画布导出的那份 DSL
    engine = importer.loads(dsl_yaml, start_inputs={...}, credentials={...})
    for event in engine.run():        # Generator[GraphEngineEvent]
        ...                            # 逐节点的事件流：开始、成功、失败、结束
    

`loads()` 内部做的事，本质上是把 YAML 翻译成一张可调度的图：
    
    
    loads(dsl)
      → _parse_yaml()            # yaml → dict
      → inspect()/_build_plan()  # 识别 app 类型，提取 graph_config（nodes/edges）
      → Graph.init(graph_config) # nodes/edges → 图对象
      → GraphEngine(graph, ...)  # 返回可运行引擎
    

让 Dify 的 workflow 跑起来因此不需要 Flask、[数据库](<https://aws.amazon.com/cn/what-is/database/>)、Celery，也不需要整个 Dify Web 平台，只需要 graphon 这个库加那份 DSL YAML。它是一个库依赖而不是一个平台，这正是它能装进 AgentCore Runtime 的原因。

## **四、一条真实 workflow 长什么样：20 步 KYB 尽调**

为了让结论不停留在玩具级别，我们构造了一条业务上有意义、结构上足够复杂的 workflow：收单商户 KYB（Know Your Business）准入尽调。

它有 20 个业务节点，加上多个 END 出口共 23 节点、23 边，覆盖了 Dify workflow 里大部分复杂节点类型：调模型（[LLM](<https://aws.amazon.com/cn/what-is/large-language-model/>)×6）、调代码（CODE×5）、调知识库（knowledge-retrieval×2）、多路判断（IF/ELSE×3，含一个三分支）、模板渲染（TEMPLATE×2）。它对应一条完整的风控链路。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/27/amazon-bedrock-agentcore-practice-validation-1.png>) [图 1：20 步 KYB 商户准入尽调 workflow 的 DAG]  
---  
  
把这份 DSL 喂给 graphon 做一次静态检查（`importer.inspect()`），结果如下：
    
    
    INSPECT OK
      kind: app
      load_status: unsupported
      load_reason: Unsupported node types: knowledge-retrieval
      nodes: 23   edges: 23
    

23 个节点里，除了 knowledge-retrieval，整条流程的结构（START、CODE、IF_ELSE、TEMPLATE、END，以及 LLM）graphon 原生就支持。迁移的结构部分几乎不需要额外工作，真正要处理的只有少数几类节点。下一节看具体是哪几类。

## **五、迁移的三个现实约束**

graphon 内置的 DSL 节点工厂叫 SlimDslNodeFactory，只实现了一部分节点。读它 `create_node()` 的 match 分支，迁移要面对的三个约束就清楚了。

节点类型 | 开箱即用 | 执行方式 | 是否需要外部 daemon  
---|---|---|---  
START / END / ANSWER | 是 | 引擎内置 | 否  
IF_ELSE（判断分支） | 是 | 内置 IfElseNode | 否  
TEMPLATE_TRANSFORM | 是 | 内置 Jinja2 | 否  
CODE（调代码） | 是 | SandboxCodeExecutor | 否（但需代码沙箱）  
LLM（调模型） | 是 | SlimLLM | 是  
TOOL | 是 | SlimToolNodeRuntime | 是  
KNOWLEDGE_RETRIEVAL（知识库） | 否，不在 slim 工厂 | 落到 _ 分支报 node.unsupported_type | —  
QUESTION_CLASSIFIER / HTTP / LOOP / AGENT 等 | 否，不在 slim 工厂 | 同上 | —  
  
从这张表可以提炼出三个约束。

约束一，纯逻辑节点无需改动。 START、END、IF_ELSE、TEMPLATE 由引擎内置直接执行，迁移零成本。这也是上一节 inspect 几乎全部支持的原因。

约束二，LLM 和 TOOL 节点默认要外挂一个 daemon。 slim 工厂默认把 LLM 节点装配成 SlimLLM，它底层会 fork 一个外部二进制：
    
    
    SlimLLM → SlimClient → subprocess(dify-plugin-daemon-slim) → 模型 provider 插件 → 真实模型 API
    

这是 Dify 原生调模型的方式，通过插件 daemon 对接各家模型。但 daemon 是 Dify 原生调模型方式的必需品，不是迁移 DSL 本身的必需品。LLM 节点可以换一种方式落地，绕开 daemon，这正是下文的做法。

约束三，知识库节点不在 slim 工厂的内置范围内。 slim 工厂的定位本就是精简内核，knowledge-retrieval 默认不在覆盖范围内，需要自己补一个。我们把它接到 [Amazon S3 Vectors](<https://aws.amazon.com/cn/s3/features/vectors/>) 作为向量检索后端。

这三个约束决定了迁移真正要做的事：纯逻辑节点不动，LLM 节点自己实现模型调用绕开 daemon，知识库节点补一个 S3 Vectors 后端。下面看具体做法。

## **六、统一入口契约：全部适配收敛在一个装配函数里**

对外是一个标准的 AgentCore agent，迁移的全部适配都收敛在 `build_engine()` 函数内部：
    
    
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    app = BedrockAgentCoreApp()
    @app.entrypoint
    def handler(payload):
        # payload = 商户 KYB 申请信息（company_name / reg_no / legal_person / ...）
        engine = build_engine(KYB_DSL, start_inputs=payload)   # ← 迁移适配都在这里
        events = []
        for ev in engine.run():
            events.append(serialize(ev))
        return {"events": events, "result": extract_outputs(events)}
    if __name__ == "__main__":
        app.run(port=8080)   # AgentCore Runtime 期望 8080
    

这就是 AgentCore Runtime 要的全部：一个 `@app.entrypoint` 装饰的函数，加上 `app.run(8080)`。引擎输出一串事件（节点开始、成功、失败、结束），既能一次性聚合成结果返回，也能逐节点流式输出做实时展示。

`build_engine()` 的核心就是用什么 node factory 来装配引擎，业务逻辑和 DSL 完全不用动。

## **七、迁移做法：自定义 node factory**

### 7.1 定位

LLM 节点的模型实例由我们自己实现，可以指向 Bedrock，也可以指向任意一家第三方模型 [API](<https://aws.amazon.com/cn/what-is/api/>)；knowledge-retrieval 节点接 S3 Vectors。DSL 一行不改，不需要 daemon。

### 7.2 核心机制：继承 slim 工厂，只覆盖需要覆盖的节点

做法的核心是一个子类 PocNodeFactory，继承 graphon 的 SlimDslNodeFactory，只覆盖三类节点，其余全部委托父类：
    
    
    class PocNodeFactory(SlimDslNodeFactory):
        """覆盖 LLM / knowledge-retrieval / CODE，其余委托父类。"""
        def create_node(self, node_config):
            node_type = _node_data_payload(node_config["data"])["type"]
            if node_type == BuiltinNodeTypes.KNOWLEDGE_RETRIEVAL:
                return self._create_knowledge_node(node_config)   # → S3 Vectors
            if node_type == BuiltinNodeTypes.LLM:
                return self._create_bedrock_llm_node(node_config)  # → 直连 Bedrock，不走 daemon
            if node_type == BuiltinNodeTypes.CODE:
                return self._create_code_node(node_config)         # → 进程内执行器
            return super().create_node(node_config)                # START/END/IF_ELSE/TPL 原样用 graphon
    

三处覆盖各自解决前面的一个约束：

  * LLM 节点：复用父类装配 LLMNode 的方式，唯一改动是把 model_instance 从 SlimLLM 换成我们自己的 BedrockLLM（boto3 直连 Bedrock），从而绕开 daemon，LLM 调用直接打到 Bedrock。要换成别的第三方模型，再写一个对应的 provider 类即可，DSL 不动。
  * knowledge-retrieval 节点：换成 S3VectorsKnowledgeNode，查询落到 S3 Vectors，向量检索前先用 Bedrock Titan 把 query 转成 embedding。
  * CODE 节点：父类用的 SandboxCodeExecutor 依赖一个外部 Dify sandbox HTTP 服务，PoC 环境没有，于是换成进程内的受限执行器；其余装配（数据校验、资源限制）仍沿用 graphon。生产环境下也可以考虑在 AgentCore Code Interpreter 里执行。



START、END、IF_ELSE、TEMPLATE、ANSWER 这些节点未做任何改动，全用 graphon 原生实现。只有需要落地到 AWS 的那几类节点才需要自定义。

### 7.3 整体架构

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/27/amazon-bedrock-agentcore-practice-validation-2.png>) [图 2：迁移方案的整体架构]  
---  
  
整条路径是：Dify 画布导出 DSL，AgentCore Runtime 里 graphon 引擎解析执行，节点分别落到 Bedrock（模型）、S3 Vectors（知识库）和本地执行器（代码）。

### 7.4 知识库节点：自定义 graphon 节点 + S3 Vectors 后端

slim 工厂不支持 knowledge-retrieval 节点，我们自定义一个 `S3VectorsKnowledgeNode`（继承 graphon 的 Node），对齐 Dify 该节点的输入输出契约：按 query_variable_selector 从变量池取 query，用 dataset_ids 定位知识库，检索后输出 result 对象数组，供后续 LLM 节点消费。

检索后端直接用 boto3 的 s3vectors 客户端：查询前先用 Bedrock Titan 把 query 转成 embedding，再调 `query_vectors` 做向量近邻检索（cosine）；灌库、建索引同样是裸 boto3（`put_vectors` / `create_index`）。这样知识库节点不引入 Dify 的 core.rag.* 模块，容器保持在纯 graphon 量级、不额外变重。

代价是这里做了务实简化：只实现 single + 向量语义检索，没有做 Dify 原生的 multiple / rerank 检索链路（见 10.3），需要时再按 Dify 的检索法补齐。此外 S3 Vectors 是纯向量库，不支持全文检索；如需全文或混合检索（关键词 + 语义），换用 [OpenSearch](<https://aws.amazon.com/cn/what-is/opensearch/>)、[PostgreSQL](<https://aws.amazon.com/cn/what-is/data-management/>) 等后端即可，不影响本文的迁移做法。

如果确实要复用 Dify 原生的 single / multiple / rerank 检索编排，另一条路是实现一个 Dify 向量后端（`BaseVector` 接口，通过 entry points 注册），让 Dify 的 `core.rag` 检索链路来调它。要说明的是：无论走哪条路，graphon 侧的自定义知识节点都得保留——因为 slim 工厂本就不认 knowledge-retrieval 节点，这块躲不掉；`BaseVector` 方式只是把节点内部的检索实现换成调 `core.rag`。它的代价是多写一个后端、并把 Dify 的 `core.rag.*` 拖进依赖（容器变重），但这些都是进程内的代码与依赖，不会引入额外进程或 daemon。

## **八、部署与验证**

我们把这套做法完整部署到 AgentCore Runtime 上跑通了一遍，这里说明部署形态和验证方式，方便你照着复现。

部署形态如下（区域 ap-northeast-1 东京）。

项 | 值  
---|---  
镜像平台 | linux/arm64（AgentCore Runtime 强制 ARM64）  
部署方式 | container（自带 Dockerfile，CodeBuild 云端跨平台构建 ARM64）  
工具链 | bedrock-agentcore-starter-toolkit 0.2.10，[CLI](<https://aws.amazon.com/cn/what-is/cli/>) 子命令 configure / deploy / invoke / status  
  
验证方式是构造 5 个 mock 商户，让它们分别命中 DAG 的 5 条不同路径：低风险通过、中风险转人工、高风险拒绝、信息不一致打回、注册号异常打回。本地和云端远程调用两处跑下来，同样 5 个商户都走对了相同出口。这说明的不只是”能跑到 END”，而是所有判断分支、所有节点类型在 AgentCore 上都被真实执行并走对了路。

部署关键命令（脱敏后）：
    
    
    # configure（非交互）：指定入口、区域、容器部署
    agentcore configure \
      --entrypoint src/poc_a/agent.py --name pocakyb \
      --region ap-northeast-1 --deployment-type container \
      --disable-otel --disable-memory --non-interactive
    # deploy：真实创建 ECR + Runtime，CodeBuild 云端构建 ARM64 镜像
    agentcore deploy --auto-update-on-conflict
    # invoke：远程调用，传入一个商户 JSON
    agentcore invoke '<merchant-json>'
    

## **九、延伸能力：DSL 双向闭环**

做 PoC 的过程中，我们还验证了一件事：同一份 DSL 既能导回 Dify 画布里看图，又能喂回 AgentCore 跑，形成一个闭环。

具体做法是把教学版 DSL 用一个转换脚本补全成 Dify 0.6.0 的导入格式（补齐 position、sourceHandle 等画布 UI 字段），然后验证了两个方向：

  * 成功导入一台全新的 Dify 实例，23 节点、23 边、4 出口全部正确渲染；
  * 同一份文件喂回 build_engine，graphon 照样装配成 23 节点的引擎（含自定义的 Bedrock LLM 节点和 S3 Vectors 知识节点）。



能闭环的原因是，Dify 平台的导入服务和 AgentCore 路线用的是同一个 graphon 引擎。Dify 导出格式只是教学版 DSL 的超集，多出来的 position、handle 等 UI 字段 graphon 直接忽略。

这说明迁移是无损且可逆的：可以在 Dify 画布上继续维护、评审这条流程，同时在 AgentCore 上运行它，两边是同一张图、同一套业务逻辑。设计期的可视化工具和运行期的托管底座不必二选一。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/27/amazon-bedrock-agentcore-practice-validation-3.png>) [图 3：DSL 在 Dify 画布与 AgentCore Runtime 之间的双向闭环]  
---  
  
这里有一个需要注意的细节：DSL 里的 dataset_ids（知识库引用）是两套系统的耦合点。AgentCore 侧用一份映射把它指向 S3 Vectors 的 index，Dify 侧则要求它是工作区里真实的 dataset UUID。导入 Dify 时若填的是占位字符串，会被清空。这不影响看图和在 AgentCore 上运行，但若要在 Dify 内也真正检索，需要回填真实 UUID。

## **十、选型建议与边界**

### 10.1 适用范围

这套做法最适合两类情况：客户的模型用某个第三方模型 API，或本来就想把模型调用统一收敛到 Bedrock 与 AgentCore。它依赖少、容器轻、已实跑验证。要换成别的模型 provider，只需再写一个对应的 provider 类，DSL 和业务逻辑都不用动。

要先说清工作量边界：graphon 的 slim 工厂原生只内置约 8 种节点，本文 PoC 又额外覆盖了 LLM、知识库、CODE 三类。如果你要迁移的 workflow 用到 QUESTION_CLASSIFIER、HTTP_REQUEST、LOOP、ITERATION、AGENT 等其它节点，则需要照本文的做法自行扩展工厂。建议动手前先用 `importer.inspect()` 体检你的 DSL，看 load_reason 列出哪些节点还不支持。

### 10.2 版本与稳定性提示

这条迁移路线的根基 graphon 仍处在快速演进期，把它用于生产前请正视以下几点。

  * 版本跳动快：PoC 期间用的是 0.4.0，本文校对时 PyPI 上已是 0.6.0，且历史上有版本因 hash mismatch 被 yank 过。务必锁定版本并跟踪上游变更，不要浮动依赖。
  * 不是 Dify 官方迁移方案：graphon 本身是 langgenius（Dify 背后的组织）维护的[开源](<https://aws.amazon.com/cn/what-is/open-source/>)图执行引擎，也确实支持 `loads()` 导入 Dify DSL；但”脱离 Dify 平台、独立运行整条 workflow 作为迁移运行底座”这一用途，并非 Dify 官方文档承诺。上游随时可能调整接口，例如 `importer.loads` 的签名、slim 工厂的节点覆盖范围。



### 10.3 生产化前需要补齐的点

本文 PoC 为聚焦主干做了几处简化，直接上生产前请逐条补齐。

---|---|---  
1 | DSL 里的 model 块对 AgentCore 是装饰性的（实跑读的是代码里写死的 model id，provider/name 只给 Dify 画布看） | 让 AgentCore 侧也按 DSL 的 model 配置动态选模型  
2 | CODE 节点用进程内执行器替代 Dify sandbox | 评估安全边界，必要时接入真正的沙箱服务，也可以考虑在 AgentCore Code Interpreter 里执行  
3 | 知识库 rerank 暂缓，只做 single + semantic search（YAGNI） | 按需补齐 Dify 原生的 multiple / rerank 检索  
4 | 20 步含多次 LLM 调用，需关注 Runtime 执行时长 / 超时上限 | 评估 AgentCore Runtime 超时，必要时拆分长流程  
  
## **十一、结语**

回到最初的问题：Dify 上编排好的 workflow，能不能迁到 AgentCore Runtime 上跑，值不值得迁？

在这个 PoC 的范围内，答案是可以，代价也比预期小。关键在于 Dify 的工作流引擎已经解耦成了独立的 graphon 库，迁移因此从搬整个平台变成装一个库加适配少数几类节点。一条 20 步、含调模型、调代码、调知识库、多路判断的 KYB 尽调流程，一行业务逻辑不改，就通过自定义 node factory 跑在了 AgentCore Runtime 上，云端 5 条路径全部验证通过；同一份 DSL 还能导回 Dify 画布看图。

这条路也有边界：根基仍在快速演进，并非官方迁移方案，节点覆盖有限。它已被验证可行，但生产化前需要锁版本、补节点、跟上游，不是开箱即用的产品。它更不是用 AgentCore 取代 Dify。Dify 在可视化编排、画布评审、快速迭代上的价值依然成立，本文做的是给画布上那条已成型的流程多准备一个云原生的运行底座：设计在 Dify，运行在 AgentCore。

本文讲的是把整条 workflow 搬到 AgentCore Runtime 上运行。另一个方向是让 Dify 平台照常运行，只把其中某类能力（例如代码执行底座）交给 AgentCore，我们会在后续文章单独展开。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon S3 Vectors](<https://aws.amazon.com/cn/s3/features/vectors/?p=bl_pr_s3-vectors_l=3>) — 云原生向量存储
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=4>) — 加快代理投入生产的速度
  * [AWS CodeBuild](<https://aws.amazon.com/cn/codebuild/?p=bl_pr_codebuild_l=5>) — 构建和测试代码



**相关文章：**

  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=1>)
  * [地理空间 AI 智能体（Code Agent）中国区部署实践](<https://aws.amazon.com/cn/blogs/china/ai-intelligent-code-agent-deploy-practice/?p=bl_ar_l=2>)
  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=3>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/?p=bl_ar_l=4>)
  * [从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（三）：查询兼容性验证与 BBoss 应用适配](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-3/?p=bl_ar_l=5>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 郑金霞

亚马逊云计算解决方案架构师，主看金融行业的支付和量化，之前在公有云厂商做计算/网络/存储控制面和 agent 端开发，容器服务平台控制面开发，DevOps 平台开发。

### 李阳

亚马逊云科技解决方案架构师，拥有 18 年软件研发架构经验，历任大学教师、华为、百度、腾讯核心技术岗位，专注高可用高性能分布式系统架构设计，致力于帮助客户在 AWS 上构建稳定、弹性、高性能的技术底座。

### 蔡国梁

蔡国梁，AWS解决方案架构师，负责基于AWS云计算方案架构的咨询和设计，在国内推广AWS云平台技术和各种解决方案。具有十年以上云计算领域工作经验，目前专注于AWS金融行业解决方案架构设计。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---