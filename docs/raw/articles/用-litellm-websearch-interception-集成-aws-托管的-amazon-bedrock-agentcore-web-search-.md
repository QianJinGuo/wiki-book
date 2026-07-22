---
title: "用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力"
source_url: "https://aws.amazon.com/cn/blogs/china/litellm-websearch-interception-integration-aws-managed-amazon"
source: wechat
ingested: 2026-07-05T04:04:31Z
sha256: a7a29feac9909cc0a352e0c338f9d399ef30894eb5f7ddce1ba354f5fecc7bf2
vxc: 72
stars: 4
_provider: deepseek
---
# 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

摘要：在不修改客户端、不 fork LiteLLM 源码的前提下，将 LiteLLM 的 websearch interception 搜索后端 从自建 SearXNG 替换为 Amazon Bedrock AgentCore Web Search——一项 AWS 全托管、由 Amazon 自营 web 索引在 AWS 基础设施内服务搜索查询（查询不发往第三方搜索引擎）的 Web 搜索服务。文末给出 进阶用法：将其暴露为 MCP server，使没有 AWS 凭证的客户端 （如 OpenAI Codex）也能通过一个 LiteLLM virtual key 进行调用。

**目录**

01 引言

02 方案概述与原理

03 架构图

04 前置条件与创建 Gateway

05 核心实现

06 部署到 EKS

07 验证

08 进阶用法：暴露成 MCP server 给无凭证客户端

09 局限与注意事项

10 常见问题（FAQ）

11 参考

* * *

## **1\. 引言**

在不修改客户端、不 fork LiteLLM 源码的前提下，将 LiteLLM 的 websearch interception 搜索后端 从自建 SearXNG 替换为 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) Web Search——一项 AWS 全托管、由 Amazon 自营 web 索引在 AWS 基础设施内服务搜索查询（查询不发往第三方搜索引擎）的 Web 搜索服务。文末给出 进阶用法：将其暴露为 MCP server，使没有 AWS 凭证的客户端 （如 OpenAI Codex）也能通过一个 LiteLLM virtual key 进行调用。

本文所有命令均经过真实环境验证。文中的账号 ID、Gateway ID、IAM role 名、域名均已替换为占位符 <ACCOUNT_ID> / <GATEWAY_ID> 等，请按实际环境替换。

测试环境与版本（务必对齐，尤其 LiteLLM 版本——见第 4 节关于私有方法签名的说明）：

组件 | 版本 / 位置  
---|---  
LiteLLM Proxy | v1.84.3（镜像 ghcr.io/berriai/litellm-database:v1.84.3）  
运行平台 | Amazon EKS @ ap-southeast-1  
Bedrock 模型 | Claude on Amazon Bedrock  
AgentCore Web Search | Amazon Bedrock AgentCore Gateway @ us-east-1  
  
本文实现针对 LiteLLM v1.84.3。_execute_search 是父类的内部方法，其返回签名在不同 LiteLLM 版本之间可能变化（见第 4 节与第 8 节）。升级 LiteLLM 镜像前务必重新确认签名并重新执行验证。

## **2\. 方案概述与原理**

### 2.1 问题背景

许多团队通过 [LiteLLM](<https://docs.litellm.ai/>) 代理统一接入 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 上的 Claude。 但 Claude on Bedrock 不具备原生的 server-side web search——模型无法像调用工具一样自动联网搜索。 LiteLLM 为此提供了 websearch interception 机制：客户端照常发送普通对话请求，LiteLLM 在服务端 拦截模型产生的 web_search 工具调用、代为执行一次搜索、将结果拼接回上下文后再交由模型续写。整个 过程对客户端（如 Claude Code）完全透明、无需任何改动。

该机制默认的搜索后端是自建的 SearXNG（一款开源元搜索引擎，需自行以容器方式部署并维护）。 SearXNG 后端的搭建（启动容器、开启 JSON 输出、在 LiteLLM 中配置 search_provider: searxng） 属于 LiteLLM 原生支持的标准流程，可参考 [LiteLLM 官方文档](<https://docs.litellm.ai/docs/>) 中 web search / search tools 一节；本文不展开 SearXNG 自建步骤，而聚焦于「将后端替换为 AgentCore」 这一增量改动。

本文要回答的问题是：

能否将该搜索后端从「自行维护一套 SearXNG」替换为「AWS 全托管的 Amazon Bedrock AgentCore Web Search」？

替换后的收益：免于维护搜索引擎、搜索查询由 Amazon 自营索引在 AWS 基础设施内服务（不发往第三方搜索引擎）、结果附带来源引用、按调用计费。

### 2.2 三个关键事实（决定实现路径）

经逐层确认，得到以下三条结论，它们直接决定了实现路径：

**① Amazon Bedrock AgentCore Web Search 的形态**

它并非独立的 REST API，而是 AgentCore Gateway 上的一个 MCP 连接器（工具协议为 MCP， 鉴权方式为 AWS_IAM / SigV4），仅在 us-east-1 提供。query 上限 200 字符，maxResults 取值 1–25 （默认 10），按查询次数计费。

**② LiteLLM 的 search_provider 为封闭枚举**

LiteLLM 源码中合法的搜索 provider 是一组硬编码值（perplexity、tavily、searxng、exa_ai、 brave 等），不包含 AgentCore，也未提供自定义注册入口。因此无法通过修改配置项将 interception 指向 AgentCore。

**③ interception 的搜索逻辑收敛于单一方法**

LiteLLM 的 WebSearchInterceptionLogger 是一个标准 CustomLogger，在「拦截 → 搜索 → 拼接 → 续写」的整套 agentic loop 中，实际执行搜索的仅有 _execute_search 一个方法。

说明：interception 机制本身为非流式。 LiteLLM 在 pre-call hook 中会主动将 stream=True 改为 stream=False——因为必须获取完整响应才能拦截到模型产生的 tool_use。 替换搜索后端不改变这一行为。若需求是「流式 + 搜索」，请参见第 7 节的客户端 MCP 方案。

### 2.3 实现方案：子类化并重写 _execute_search

综合上述三条，最轻量的接入方式既非 fork LiteLLM，也非修改枚举，而是：

继承 WebSearchInterceptionLogger，仅重写 _execute_search 一个方法，将该次搜索 改为「通过 SigV4 调用 AgentCore 的 MCP 端点」。其余的 agentic loop 与消息拼接逻辑全部复用父类。

方案 | 客户端改动 | 透明自动搜索 | 修改 LiteLLM 源码 | 维护成本 | 结论  
---|---|---|---|---|---  
维持 SearXNG | 无 |  | 无 | 中（需自维护搜索引擎） | 基线  
暴露为 MCP 工具 | 需声明工具 |  | 无 | 中 | 不满足「零改动」  
Fork 并新增 agentcore provider | 无 |  | 需 fork | 高（需 rebase 上游） | 过重  
子类化并重写 _execute_search | 无 |  | 无需 | 低 | 采用  
  
### 2.4 搜索后端横向对比：AgentCore vs SearXNG vs 主流托管 API

上一节解决的是「如何接入」，本节回答「为何选择 AgentCore，而非 LiteLLM 原生支持的那些 托管搜索 API」。

LiteLLM interception 原生支持的搜索 provider 是一组硬编码枚举（共 17 个），涵盖 perplexity、tavily、exa_ai、brave、serper、searxng、duckduckgo 等， 但不包含 Amazon Bedrock AgentCore，也未提供自定义注册入口——这正是本文采用子类化方案 绕过枚举限制的原因。

维度 | AgentCore Web Search | SearXNG（自建） | exa / tavily / perplexity（托管 API）  
---|---|---|---  
接入方式 | 子类化重写（本文） | LiteLLM 原生 provider searxng | LiteLLM 原生 provider  
是否需自维护搜索引擎 | 否（AWS 托管） | 是（需自行运行容器并维护索引引擎） | 否  
是否需外部 API Key | 否（基于 IRSA / IAM） | 否 | 是（需第三方账号、API Key 与充值）  
查询去向 | 不发往第三方搜索引擎（query 在 AWS 基础设施内服务） | 取决于自建出口 | 发往第三方服务商  
鉴权模型 | AWS SigV4（IAM/IRSA） | 无 / 自定义 | 第三方 API Key  
计费 | 按查询次数（计入 AWS 账单） | 自建成本（算力 / 带宽） | 第三方按查询或订阅计费  
结果来源引用 | 有 | 取决于上游引擎 | 有  
区域限制 | 仅 us-east-1（本文已处理跨区） | 自建可任意区域 | 由服务商决定  
  
选择 AgentCore 的理由：对于已深度使用 AWS / Bedrock 的团队，它免去了自维护搜索引擎的负担、 搜索查询由 Amazon 自营 web 索引在 AWS 基础设施内服务（不发往第三方搜索引擎）、可复用 IAM/IRSA 鉴权、 计费并入 AWS 账单，无需再引入第三方 API Key 与账号。代价是仅支持 us-east-1（需跨区签名）以及按查询计费。

## **3\. 架构图**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-1.png>) [图1]  
---  
  
要点：LiteLLM Pod 运行于 ap-southeast-1，而 AgentCore 仅在 us-east-1，故为跨区调用—— SigV4 的 region 固定签为 us-east-1，身份使用 Pod 的 IRSA（无需在 Pod 内存放任何 AK/SK）。

## **4\. 前置条件与创建 Gateway**

### 4.1 环境前置

前置 | 要求 | 检查  
---|---|---  
AWS CLI | ≥ 2.35.7（connector target 需要） | aws –version  
区域 | 必须 us-east-1（AgentCore 仅此区） | —  
LiteLLM Proxy | 已接 Bedrock 的 LiteLLM（本文 v1.84.3） | 已有的生产代理即可  
Pod 身份 | LiteLLM Pod 的 serviceaccount 绑定到一个 IAM role（IRSA / Pod Identity） | EKS 标准做法  
  
CLI 版本是最常见的故障点：低于 2.35.7 会报 Unknown parameter … must be one of: openApiSchema,smithyModel,lambda,mcpServer,apiGateway （缺少 connector）。bedrock-agentcore-control 的 API 模型仅随 aws-cli v2 分发，通过 pip 安装的 boto3（即便版本很新）也不包含该模型。升级方式：
    
    
    curl -s "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o /tmp/AWSCLIV2.pkg
    sudo installer -pkg /tmp/AWSCLIV2.pkg -target /
    aws --version   # 确认 ≥ 2.35.7
    

### 4.2 创建 AgentCore Web Search Gateway

如果还没有 Gateway，按以下三步从零创建（已有则跳到 4.3）。

**① 创建 Gateway 服务角色——Gateway 通过 assume 该角色调用 Web Search：**
    
    
    aws iam create-role --role-name AgentCoreWebSearchGatewayRole \
      --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"bedrock-agentcore.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
    
    aws iam put-role-policy --role-name AgentCoreWebSearchGatewayRole \
      --policy-name WebSearchPerms \
      --policy-document '{"Version":"2012-10-17","Statement":[
        {"Effect":"Allow","Action":"bedrock-agentcore:InvokeGateway",
         "Resource":"arn:aws:bedrock-agentcore:us-east-1:<ACCOUNT_ID>:gateway/*"},
        {"Effect":"Allow","Action":"bedrock-agentcore:InvokeWebSearch",
         "Resource":"arn:aws:bedrock-agentcore:us-east-1:aws:tool/web-search.v1"}]}'
    

**② 创建 Gateway（关键参数：–authorizer-type AWS_IAM）**
    
    
    aws bedrock-agentcore-control create-gateway \
      --name websearch-gw \
      --role-arn "arn:aws:iam::<ACCOUNT_ID>:role/AgentCoreWebSearchGatewayRole" \
      --protocol-type MCP \
      --authorizer-type AWS_IAM \
      --region us-east-1
    # 返回 gatewayId / gatewayUrl，等 status=READY 后记下 <GATEWAY_ID>
    

选择 AWS_IAM 而非 CUSTOM_JWT：可省去自建 IdP（如 Cognito）与 token 刷新，直接使用 AWS 凭证（调用方的 IAM/IRSA）进行签名。

**③ 添加 Web Search connector target**
    
    
    aws bedrock-agentcore-control create-gateway-target \
      --gateway-identifier <GATEWAY_ID> \
      --name web-search-tool \
      --target-configuration '{"mcp":{"connector":{"source":{"connectorId":"web-search"},
        "configurations":[{"name":"WebSearch","parameterValues":{}}]}}}' \
      --credential-provider-configurations '[{"credentialProviderType":"GATEWAY_IAM_ROLE"}]' \
      --region us-east-1
    

target 名 web-search-tool 与工具名 WebSearch 组合后，实际工具全名为 web-search-tool___WebSearch（三个下划线），即第 4 节代码中的 AGENTCORE_WS_TOOL_NAME。 如需服务端域名黑名单，可在 parameterValues 内添加 “domainFilter”:{“exclude”:[“blocked-1.com”]}，该限制对模型不可见，由服务端强制执行。

创建阶段的两个常见问题：① 添加 –read-only 会导致连接成功但工具列表为空——WebSearch 不带 readOnlyHint，会被过滤器误删，不应添加；② 调用方签名时 –service 必须为 bedrock-agentcore，否则返回 403。

### 4.3 给调用方（LiteLLM Pod）加权限

LiteLLM Pod 所用 IAM role 需要一条最小权限策略，只允许调用那个 Gateway：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "bedrock-agentcore:InvokeGateway",
          "Resource": "arn:aws:bedrock-agentcore:us-east-1:<ACCOUNT_ID>:gateway/<GATEWAY_ID>"
        }
      ]
    }
    aws iam put-role-policy \
      --role-name <LITELLM_POD_IAM_ROLE> \
      --policy-name InvokeAgentCoreWebSearchGW \
      --policy-document file://litellm-agentcore-policy.json
    

AgentCore Web Search 的鉴权是 per-invocation 针对 Gateway ARN 的，因此只需 bedrock-agentcore:InvokeGateway 这一个动作。

## **5\. 核心实现**

新建一个 callback 模块 agentcore_websearch.py，继承父类、仅重写 _execute_search， 在其中通过 SigV4 调用 AgentCore 的 MCP 端点。以下为关键骨架（略去错误处理细节）：
    
    
    import os, json, datetime, urllib.request
    import boto3
    from botocore.auth import SigV4Auth
    from botocore.awsrequest import AWSRequest
    from litellm.integrations.websearch_interception.handler import (
        WebSearchInterceptionLogger,
    )
    
    REGION    = os.environ.get("AGENTCORE_WS_REGION", "us-east-1")
    MCP_URL   = os.environ["AGENTCORE_WS_MCP_URL"]
    TOOL_NAME = os.environ.get(
        "AGENTCORE_WS_TOOL_NAME", "web-search-tool___WebSearch"
    )
    
    class AgentCoreWebSearchLogger(WebSearchInterceptionLogger):
        """仅重写搜索步骤，其余 interception 逻辑全部复用父类。"""
    
        def _sigv4_post(self, payload: dict) -> dict:
            body = json.dumps(payload)
            req = AWSRequest(method="POST", url=MCP_URL, data=body,
                             headers={"Content-Type": "application/json",
                                      "Accept": "application/json"})
            # 凭证走默认链：Pod 内即为 IRSA，无需显式 AK/SK
            creds = boto3.Session().get_credentials()
            SigV4Auth(creds, "bedrock-agentcore", REGION).add_auth(req)
            r = urllib.request.urlopen(
                urllib.request.Request(MCP_URL, data=body.encode(),
                                       headers=dict(req.headers)), timeout=60)
            return json.loads(r.read())
    
        def _execute_search(self, query: str) -> str:
            query = query[:200]                       # AgentCore 上限 200 字符
            payload = {
                "jsonrpc": "2.0", "id": 1, "method": "tools/call",
                "params": {"name": TOOL_NAME,
                           "arguments": {"query": query, "maxResults": 10}},
            }
            resp = self._sigv4_post(payload)
            inner = json.loads(resp["result"]["content"][0]["text"])
            # 拼接为「Title / URL / Snippet」格式文本，回注给模型
            lines = []
            for it in inner.get("results", []):
                lines.append(f"Title: {it.get('title')}\n"
                             f"URL: {it.get('url')}\n"
                             f"Snippet: {it.get('text','')[:500]}\n")
            return "\n".join(lines)
    
    # 模块级实例，config.yaml 用 "模块名.实例名" 引用
    agentcore_websearch_logger = AgentCoreWebSearchLogger(
        enabled_providers=["bedrock", "bedrock_converse"]
    )
    

**两个经实测确认的关键点**

  1. 实际工具名为 web-search-tool___WebSearch（即连接器 target 名 web-search-tool + 三个下划线 + WebSearch），而非 AWS 文档示例中的 WebSearch。更换 Gateway 时应先通过 tools/list 列出实际工具名。
  2. _execute_search 在 v1.84.3 返回 str；更高版本可能返回 (str, SearchResponse) 元组。 该方法属于内部方法，升级 LiteLLM 前务必重新确认其签名（见第 8 节）。



## **6\. 部署到 EKS**

### 6.1 让 LiteLLM 加载自定义 callback（注意：不依赖 PYTHONPATH）

LiteLLM 以 “模块名.实例名” 的形式解析 callback。此处有一个容易忽略的细节：

LiteLLM 的 get_instance_fn 在 proxy 模式下（config_file_path 恒为 /app/config/config.yaml）会强制在 config.yaml 所在目录按相对路径查找 <模块名>.py，并完全忽略 PYTHONPATH。若将 .py 单独挂载到其他位置并设置 PYTHONPATH，会导致 ImportError: Could not find module file /app/config/agentcore_websearch.py，Pod 进入 CrashLoop。

正确做法：将 agentcore_websearch.py 放入 与 config.yaml 相同的 ConfigMap，二者一同挂载至 /app/config，模块即位于其查找目录内：
    
    
    kubectl -n litellm create configmap litellm-config \
      --from-file=config.yaml=/path/to/config.yaml \
      --from-file=agentcore_websearch.py=agentcore_websearch.py \
      --dry-run=client -o yaml | kubectl apply -f -
    

### 6.2 改 config.yaml 的 callbacks
    
    
    litellm_settings:
      callbacks:
        # 移除原 SearXNG 的：- websearch_interception
        - agentcore_websearch.agentcore_websearch_logger
    

二者不可同时启用——均会拦截 Bedrock 的 web_search，存在冲突。

### 6.3 注入环境变量并滚动重启
    
    
    env:
      - name: AGENTCORE_WS_REGION
        value: us-east-1
      - name: AGENTCORE_WS_MCP_URL
        value: https://<GATEWAY_ID>.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp
      - name: AGENTCORE_WS_TOOL_NAME
        value: web-search-tool___WebSearch
    kubectl -n litellm rollout restart deployment/litellm
    kubectl -n litellm rollout status  deployment/litellm
    

重启后若 3 个 Pod 全部处于 Running、日志出现 Application startup complete 且无 ImportError， 即表明代码加载成功。

## **7\. 验证**

### 7.1 链路验证（独立 SigV4 探测）

先不接入 LiteLLM，使用一段独立脚本（boto3 + SigV4）直接请求 Gateway 的 MCP 端点，确认链路与协议：
    
    
    # 在 Pod 内执行，走 IRSA 身份
    kubectl -n litellm exec <POD> -- python3 /tmp/probe.py "latest AWS news 2026"
    # → tools/list 返回工具名 web-search-tool___WebSearch
    # → tools/call HTTP 200，返回真实搜索结果
    

若返回 HTTP 200 且包含真实结果，表明 IRSA 跨区 SigV4 链路已完全打通。 （若返回 403 Insufficient permissions，表明链路与签名正确，仅缺少第 3 节的 IAM 权限。）

### 7.2 生产切换验证（端到端）

切换 callback 并重启后，从客户端发送一次携带 web_search 的真实请求，从三个维度交叉验证：

维度 | 验证方式 | 结果  
---|---|---  
interception 生效 | /v1/messages 请求的 input_tokens 明显增大（搜索内容已注入上下文），且回答为最新信息 |   
出站调用 | 在 Pod 内以 DEBUG 抓取 botocore：AssumeRoleWithWebIdentity → 跨区 bedrock-agentcore 签名 → POST /mcp 200 |   
AgentCore 侧 | CloudWatch AWS/Bedrock-AgentCore 的 tools/call Invocations 计数随测试增长 |   
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-2.png>) [图2：CloudWatch AgentCore 指标（tools/call 的 Invocations、Latency、Duration）]  
---  
  
安全提示：DEBUG 级 botocore 日志会打印临时 STS 凭证（约 1 小时后过期）。请仅在临时排查时 开启 DEBUG，排查完毕即关闭，生产环境保持 INFO，且不得将此类日志发布至公开渠道。

AgentCore Gateway 的请求 / 响应体日志默认不开启（CloudWatch 默认仅有 Metrics）。如需查看 每次搜索的 query 与结果，需手动开启 vended log delivery（依次执行 put-delivery-source、 put-delivery-destination、create-delivery 三步），日志将写入 /aws/vendedlogs/bedrock-agentcore/gateway/APPLICATION_LOGS/<GATEWAY_ID>。

## **8\. 进阶用法：暴露成 MCP server 给无凭证客户端**

第 2–7 节解决的是「Claude 发送普通请求 → 网关自动补充搜索、客户端无需改动」（代价为非流式）。

此外还有一类常见诉求：

不具备 AWS 凭证的客户端（如 OpenAI Codex、CI），希望将 AgentCore Web Search 挂载为 MCP 工具使用，但不愿在每台客户端上配置 AWS AK/SK。

直连 AgentCore 的 MCP 端点需要 SigV4（即客户端须持有 AWS 凭证）。解决方式并非另起一台代理服务器， 而是让已有的 LiteLLM 网关将 AgentCore 注册为一个后端 MCP server：对外以 LiteLLM virtual key 鉴权，对内由 Pod 的 IRSA 完成 SigV4 签名。LiteLLM 原生支持 aws_sigv4 类型的 MCP 后端 （UI 上对应的选项标签为 “AWS SigV4 (Bedrock AgentCore MCPs)”）。
    
    
    无凭证客户端 (Codex / CI)
          │  Authorization: Bearer sk-<virtual key>   ← 复用 virtual key，无 AWS 凭证
          ▼
    LiteLLM 网关  /mcp/   (持 IRSA)
          │  注册的 MCP server: auth_type=aws_sigv4
          │  用 Pod IRSA → SigV4 → us-east-1            ← 凭证集中在网关
          ▼
    AgentCore Web Search MCP  (同一个 Gateway / 同一条 InvokeGateway 权限)

### 8.1 在 LiteLLM 注册 MCP server

字段 | 值 | 说明  
---|---|---  
Server Name | agentcore_websearch |   
Transport | Streamable HTTP（即 http） |   
URL | https://<GATEWAY_ID>.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp |   
Auth Type | AWS SigV4 (Bedrock AgentCore MCPs) |   
AWS Region | us-east-1 | service name 默认 bedrock-agentcore，可省  
AK/SK / Role | 全部留空 | 留空即走 Pod IRSA 默认凭证链  
  
凭证机制（已经源码确认）：当不填写 AK/SK 时，LiteLLM 回落至 botocore 默认凭证链，自动拾取 EKS 注入的 web-identity provider（IRSA）。aws_role_name 仅在需要「二跳 AssumeRole」时填写—— 若 Pod 的 IRSA role 本身已具备 InvokeGateway 权限，留空即可。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-3.png>) [图3：注册完成后的 MCP server 概览（Transport / Authentication / Host URL）]  
---  
  
### 8.2 以 access group 限定调用范围（控制成本的关键）

AgentCore Web Search 按查询计费，因此必须限定仅特定 key 可调用，否则任意 key 均可产生计费：

  1. 为 server 挂载一个 MCP Access Group，例如 paid_search；
  2. 确认 Allow All LiteLLM Keys 处于关闭状态；
  3. 在 Keys 页面，为相应的 virtual key 在 MCP Access Groups 中勾选 paid_search。



由此 server  paid_search  key 形成闭环：仅授权的 key 可调用，其余 key 无法访问。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-4.png>) [图4：MCP server 的访问控制设置（Allow All Keys=Disabled、Access Groups=paid_search、Allowed Tools、Network=Public）]  
---  
  
IP 过滤 ≠ key 授权：LiteLLM MCP server 另有一个 available_on_public_internet（UI 中称 “Internal network only”）开关，它按来源 IP 放行， 与 key 授权是两套相互独立的机制。若客户端从公网访问网关，该开关必须保持「公网可达」，否则 公网来源会被 IP 过滤拦截并返回 403 ip_filtering。成本与流量控制应依靠 access group + key，而非 IP。

### 8.3 客户端连接

客户端 MCP 配置指向 LiteLLM 的 MCP 端点（注意 URL 必须包含 /mcp/ 路径），以 virtual key 鉴权：
    
    
    URL:  https://<your-litellm-domain>/mcp/
    Header: Authorization: Bearer sk-<virtual-key>
    

客户端全程无需任何 AWS 凭证。

配置完成后，客户端即可像调用普通工具一样发起搜索。下图为一次实际调用：客户端发出请求后，经由 LiteLLM 的 MCP 网关调用到 agentcore_websearch 暴露的 WebSearch 工具（可见完整工具名与 query / maxResults 参数），整个过程不涉及任何 AWS 凭证。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-5.png>) [图5：客户端经 LiteLLM MCP 调用 AgentCore WebSearch 工具（含工具名与参数）]  
---  
  
工具返回后，模型据此组织出包含最新信息的回答，印证搜索结果已成功注入：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/litellm-websearch-interception-integration-aws-managed-amazon-6.png>) [图6：模型基于实时搜索结果生成的回答]  
---  
  
## **9\. 局限与注意事项**

  * 非流式：interception 机制强制非流式（见 1.2）。大上下文叠加搜索的请求耗时较长，需注意 将入口层（ALB/CloudFront）与 LiteLLM 的超时上限对齐。如需流式 + 搜索，请采用第 7 节的客户端 MCP 方案。
  * 仅 us-east-1：AgentCore Web Search 仅在 us-east-1 提供，本方案已处理跨区 SigV4。
  * query / maxResults 限制：query ≤ 200 字符、maxResults 取值 1–25，代码已做截断与默认值处理。
  * 依赖内部方法签名：_execute_search 是父类的内部方法，返回签名随版本变化。升级 LiteLLM 前务必重新确认：


    
    
    python3 -c "from litellm.integrations.websearch_interception.handler import \
    WebSearchInterceptionLogger; import inspect; \
    print(inspect.signature(WebSearchInterceptionLogger._execute_search))"
    

  * 计费与条款：AgentCore Web Search 按查询计费；使用条款禁止批量存储结果或构建竞争性索引， 并要求保留来源引用。



## **10\. 常见问题（FAQ）**

Q：Pod 出现 CrashLoop，报 Could not find module file /app/config/agentcore_websearch.py？ A：通常是因为将 .py 挂载到了其他位置并设置了 PYTHONPATH。LiteLLM 强制在 config.yaml 同目录查找模块， 并忽略 PYTHONPATH。应将 .py 放入与 config.yaml 相同的 ConfigMap（见 5.1）。

Q：tools/call 报告工具不存在？ A：工具名并非 WebSearch，而是 <连接器 target 名>___WebSearch，本文环境中为 web-search-tool___WebSearch。请先通过 tools/list 列出实际工具名。

Q：Pod 内调用报 403 Insufficient permissions？ A：链路与签名均正确，缺少的是 IAM 权限。请为 Pod 的 IRSA role 添加第 3 节的 InvokeGateway 策略。 （注意 IAM 权限传播存在延迟，添加后可能需重试数次。）

Q：第 7 节客户端无法连接，或报 403 ip_filtering？ A：两个常见原因：① 客户端 URL 缺少 /mcp/ 路径；② server 的 “Internal network only” 已开启，而 访问来自公网——公网客户端应保持公网可达，详见 7.2。

Q：替换搜索后端能否解决非流式问题？ A：不能。非流式由 interception 机制本身决定（须获取完整响应才能拦截 tool_use），与搜索后端是 SearXNG 还是 AgentCore 无关。如需流式，只能采用客户端 MCP 方案（第 7 节）。

## **11\. 参考**

  * [LiteLLM 文档](<https://docs.litellm.ai/>)
  * [Amazon Bedrock AgentCore（控制台/文档入口）](<https://aws.amazon.com/bedrock/>)
  * [LiteLLM MCP 网关与访问控制](<https://docs.litellm.ai/docs/mcp>)



**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=2>) — 加快代理投入生产的速度
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=3>) — 身份管理和访问权限
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=4>) — 托管式 Kubernetes 服务
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具



**相关文章：**

  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=1>)
  * [推出 OpenClaw on Amazon Lightsail，用于运行您的自主私有人工智能代理](<https://aws.amazon.com/cn/blogs/china/introducing-openclaw-on-amazon-lightsail-to-run-your-autonomous-private-ai-agents/?p=bl_ar_l=2>)
  * [别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/?p=bl_ar_l=3>)
  * [Amazon Nova Lite Fine-Tuning: 高性价比的视觉检测模型微调案例与实践](<https://aws.amazon.com/cn/blogs/china/amazon-nova-lite-fine-tuning-cost-effective-vision-detection-model-tuning-case-and-practice/?p=bl_ar_l=4>)
  * [基于 Amazon CloudFront 和 Lambda@Edge 实现失败请求的完整记录与异步重放](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-cloudfront-lambda-edge-implement/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 韩坤尧

亚马逊云科技解决方案架构师，负责基于亚马逊云科技方案架构的咨询、设计和评估。在运维、安全、网络方面有丰富的经验，目前侧重于AI/大数据领域的研究。在加入 AWS 之前曾就职于 Juniper、Cisco 等公司，担任高级系统工程师，主要服务于国内外企业客户。

### 张振华

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构和设计，在 Edge、Serverless 、容器化，微服务架构，云原生 DevOps 等方向具有丰富的实践经验。自加入亚马逊云科技后，专注于游戏行业，以及 GenAI 在游戏行业的应用。

### 马卫军

AWS 中国团队的解决方案架构师，负责基于AWS的云计算方案架构咨询和设计。有丰富的数据仓库以及大数据开发和架构设计经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
