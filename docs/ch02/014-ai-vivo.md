# AI 导购在 vivo 官网的落地实践

> 📊 Level ⭐⭐⭐ | 9.2KB

> -> [原文存档](https://mp.weixin.qq.com/s/ureOXhYFIJrUlZdL9JvEFQ)

## vivo AI 导购落地实践

## 一句话

vivo 团队在官网 APP 落地 AI 导购 agent：FastText 小模型做意图分类（10ms）+ RAG 知识库 + 双智能体（参数解读/商品推荐）+ 结构化输出，首字符 2.5s 内。

## 架构亮点

- **FastText 意图分类**：CPU 推理 10ms，解决率高
- **推荐思路**：将手机列表随 Prompt 给大模型，而非人工打标签规则——兼容开放性用户问题
- **结构化输出关键设计**：推荐场景要求模型第一句直接给出手机名 → 才能立刻请求商品接口
- **安全兜底**：内容审核接入蓝心运营平台

## 效果

- 首字符响应速度 2.5s 内
- AB 实验对 GMV 和解决率正向贡献

## 一句话

FastText + RAG + 结构化输出 = 垂直电商 AI 导购 agent 的生产级工程实现。

## 深度分析

vivo 官网 AI 导购 agent 是一份少见的**消费级电商 agent 全链路工程样本**：从意图识别到生成、从知识供给到结构化输出、从安全兜底到 AB 实验验证，每一层都有明确的选型理由和可量化的结果。整体链路为用户输入 → FastText 意图识别（参数解读/商品推荐二分类）→ 对应智能体 → RAG 知识库检索 → 大模型生成 → 结构化输出（商品卡片 + 流式文字 + 相关帖子），首字符响应 2.5s 内，AB 实验对 GMV 和解决率均有正向贡献。与开放域对话产品不同，垂直电商导购的场景边界、商品目录和评价指标都是封闭可控的，这让它成为观察"agent 如何在约束条件下做成一件事"的理想样本。

### 1. 分层推理：小模型路由 + 大模型生成，各占其位

架构上最值得复用的是**推理成本的分层**。FastText 做手机参数解读 / 手机商品推荐的两分类，CPU 推理每次约 10ms，训练侧超参数（lr=0.5、dim=200、ws=5、epoch=50、wordNgrams=3、minn/maxn=3-6、softmax 损失）针对窄域语料做了充分调优。这里的关键判断是：**电商导购的意图空间天然封闭**——用户要么问参数、要么要推荐，二分类即可覆盖路由需求，无需为意图识别引入大模型。10ms 的路由成本几乎可以忽略，等于把 2.5s 首字符预算几乎全部留给大模型流式生成与接口调用，这是首屏延迟能压进 2.5s 的结构性原因。当然，两分类意味着更复杂的混合意图（既问参数又求推荐）会被强行归入单边，系统依赖兜底与转人工路径消化这类边界情况——意图分类只需"足够好"，真正的理解仍交给下游大模型，这正是分层设计的分工本质。

### 2. 推荐范式反转：商品列表进 Prompt，而非标签规则

传统电商推荐的惯用做法是人工打标签 + 规则引擎关联，vivo 反其道而行：把推荐手机列表作为"补充知识1"直接随 Prompt 交给大模型，配合上下文（补充知识2）与用户原始问题（补充知识3），让模型自行理解和推荐。约束面包括只推荐 vivo/iQOO、智能客服官方回答兜底、Markdown 格式输出并加粗突出商品名。这一范式的优势在于对开放性用户问题的兼容——用户问法不受预设标签体系覆盖度的限制；同时把维护成本从"持续运营标签体系"转移到"管理 Prompt 内的商品列表"，后者对自营团队而言迭代节奏快得多。代价是商品列表规模受上下文窗口约束，因此更适合 SKU 有限的垂直自营场景（如 vivo 官网），而非万级商品池的开放平台；官方客服回答兜底则提供了优雅降级路径，避免模型幻觉直接触达用户。 该思路的 Prompt 组织方法可参见 [Prompt Engineering Fundamentals](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md)。

### 3. 双知识库 RAG：按"评测/参数/卖点/对比"组织领域事实

参数解读智能体的链路是"获取机型 + 模块信息语料 → 拼接 Prompt → RAG 检索 → 大模型生成"，Prompt 遵循角色定义 + 任务边界 + 输出格式 + 示例引导四原则。知识库拆成两库：商品推荐知识库（每款手机的卖点 + 评测数据）与商品评测知识库（拟人化测评描述），整体按评测 / 参数 / 卖点 / 对比分析四个维度组织。**按服务对象拆库**是一个值得注意的决策——推荐与解读由不同智能体消费，语料分开建设可以避免检索时互相污染。更值得注意的是**拟人化测评描述的语料设计**：让检索命中的片段天然贴近导购话术而非干瘪的参数表——RAG 的输出风格实际由知识库的写作风格预先决定，这比在 Prompt 里要求"语气亲切"更可控。这与 [Rag Retrieval Augmented Generation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rag-retrieval-augmented-generation.md) 中知识供给质量决定生成质量的判断一致。

### 4. 结构化输出与安全：接口驱动的输出约束 + 三层防线

推荐场景的关键设计是**强制模型第一句话直接给出手机名称**——拿到名称后才能请求商品接口获取价格/图片/名称/评论。这是典型的接口驱动设计：先确定下游要调用的接口及其入参，再反向约束模型输出格式，保证输出可被系统解析而非仅供人阅读。完整输出三件套：商品卡片（接口获取）+ SSE 流式文字（端侧做缓存队列平滑）+ 相关帖子（RAG 匹配相关社区帖子），兼顾即时性与信息完整性；端侧缓存队列平滑解决的是分片 token 渲染不连贯的体验问题，属于流式落地的通用细节。安全侧投入 1.6W 条测试语料（伦理道德、低俗、不良引导等），三层策略：模型控制 + 边界关键字转人工 + 蓝心运营平台内容审核兜底——模型层控制无法覆盖的输入靠规则与平台审核接住，形成纵深防御；对面向公网流量的消费级 agent，安全投入规模与功能本身同等重要，这批语料同时构成可持续回归的安全基线。

综合来看，vivo 案例的方法论可以压缩为一句话：**把确定性交给小模型和知识库，把开放性交给大模型，把不可控交给兜底**。意图路由、商品接口、参数语料都是确定性组件，追求的是速度与准确；用户问法与生成表达是开放部分，交给大模型消化；幻觉、边界请求与违规内容则由官方回答兜底、转人工与平台审核层层接住。三层各司其职，才使得一个功能范围收敛的导购 agent 能以 2.5s 首字符的体验跑通 GMV 正向的完整闭环。

## 实践启示

1. **分层架构优先**：用小模型处理简单任务（意图分类、路由），大模型专注生成。可显著降低延迟和成本。
2. **接口驱动Prompt设计**：先明确需要调用的外部接口，再反向设计Prompt约束，确保模型输出能被系统解析和使用。
3. **结构化输出的价值**：流式输出 + 商品卡片 + 相关帖子组合，既满足即时性需求，又提供完整信息。
4. **安全投入不可忽视**：1.6W 条测试语料 + 三层防护是生产级别的安全基线。
5. **AB 实验验证价值**：GMV 和解决率的双重正向贡献是 AI 导购项目成功的核心指标。

## 相关实体
- [Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)
- [Wangyunhe Harness Optimization Agentsoul](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code开发负责人-为何放弃rag而选择agentic-search.md)
- [Integrate Atlassian Confluence Cloud With Amazon Quick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/integrate-atlassian-confluence-cloud-with-amazon-quick.md)
- [Rag Vs Llm Wiki Enterprise Knowledge Base](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rag-vs-llm-wiki-enterprise-knowledge-base.md)

→ [原文存档](https://mp.weixin.qq.com/s/ureOXhYFIJrUlZdL9JvEFQ)
- [电商 ai 操作系统崛起：从「工具人」到「all in one」+ 行业 knowhow skill 化 + 5 巨头](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md)

---

