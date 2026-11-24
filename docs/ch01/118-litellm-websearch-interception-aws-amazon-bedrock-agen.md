# 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

> 📊 Level ⭐⭐⭐ | 12.8KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/litellm-websearch-interception-integration-aws-managed-amazon)

## 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

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

在不修改客户端、不 fork LiteLLM 源码的前提下，将 LiteLLM 的 websearch interception 搜索后端 从自建 SearXNG 替换为 Amazon Bedrock AgentCore Web Search——一项 AWS 全托管、由 Amazon 自营 web 索引在 AWS 基础设施内服务搜索查询（查询不发往第三方搜索引擎）的 Web 搜索服务。文末给出 进阶用法：将其暴露为 MCP server，使没有 AWS 凭证的客户端 （如 OpenAI Codex）也能通过一个 LiteLLM virtual key 进行调用。

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

许多团队通过 LiteLLM 代理统一接入 Amazon Bedrock 上的 Claude。 但 Claude on Bedrock 不具备原生的 server-side web search——模型无法像调用工具一样自动联网搜索。 LiteLLM 为此提供了 websearch interception 机制：客户端照常发送普通对话请求，LiteLLM 在服务端 拦截模型产生的 web_search 工具调用、代为执行一次搜索、将结果拼接回上下文后再交由模型续写。整个 过程对客户端（如 Claude Code）完全透明、无需任何改动。

该机制默认的搜索后端是自建的 SearXNG（一款开源元搜索引擎，需自行以容器方式部署并维护）。 SearXNG 后端的搭建（启动容器、开启 JSON 输出、在 LiteLLM 中配置 search_provider: searxng） 属于 LiteLLM 原生支持的标准流程，可参考 LiteLLM 官方文档 中 web search / search tools 一节；本文不展开 SearXNG 自建步骤，而聚焦于「将后端替换为 AgentCore」 这一增量改动。

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

### 2.3 实现方案：子类化并重写 _exe

---
## 深度分析

### 拦截架构：为何只重写一个方法即可集成

websearch interception 由标准 CustomLogger（WebSearchInterceptionLogger）实现，agentic loop 为「拦截模型产生的 web_search 工具调用 → 代为执行搜索 → 结果拼接回上下文 → 模型续写」，真正执行搜索的逻辑收敛于单一私有方法 _execute_search。最小切口即继承后仅重写此方法，其余复用父类，无需 fork 或改封闭的 search_provider 枚举。另一约束：interception 强制非流式——pre-call hook 把 stream=True 改为 False，必须拿到完整响应才能捕获 tool_use。

### AgentCore Web Search 的形态与接入

它不是独立 REST API，而是 AgentCore Gateway 上的 MCP 连接器：协议 MCP、鉴权 AWS_IAM/SigV4、仅 us-east-1，query ≤200 字符、maxResults 1–25（默认 10）、按查询计费。接入三步：建 Gateway 服务角色、create-gateway（--authorizer-type AWS_IAM，免自建 IdP）、create-gateway-target 加 web-search connector。实测细节：工具全名为 <target名>___WebSearch（三下划线），换 Gateway 前先 tools/list；target 加 --read-only 会导致工具列表为空。。

### 请求/响应拦截的机制细节

_execute_search 以 SigV4 手工签名 POST 到 Gateway /mcp 端点：凭证取 botocore 默认链（Pod 内即 IRSA，无 AK/SK），service 必须为 bedrock-agentcore，region 固定签 us-east-1 处理跨区。请求体为 JSON-RPC tools/call；响应解析 result.content[0].text 后二次 json.loads，把每条结果格式化为 Title/URL/Snippet（截断 500 字符）回注模型。

### 权衡：interception vs 客户端 MCP 工具

四条路径对比：维持 SearXNG（基线，需自维护）、暴露为 MCP 工具（客户端需声明工具）、fork 新增 provider（需 rebase 上游，过重）、子类化重写（采用）。选 AgentCore 而非原生 17 个托管 provider 的理由：免维护、查询留在 AWS 基础设施内、复用 IAM/IRSA、计费并入 AWS 账单；代价是仅 us-east-1 与按查询计费。取舍：interception 透明但强制非流式、大上下文耗时长（需对齐超时）；客户端 MCP 可流式但需声明工具。

## 实践启示

1. **最小切口优先于 fork**：枚举不含目标后端时，找逻辑收敛点（此处为唯一的 _execute_search）做单方法重写；并将其视为不稳定 API，升级前先用 inspect.signature 确认返回签名。
2. **凭证集中在网关而非客户端**：Pod 用 IRSA 即可完成跨区 SigV4，无需 AK/SK；IAM 只需 InvokeGateway 一个动作，签名 service 写错直接 403。
3. **部署细节决定成败**：LiteLLM proxy 模式强制在 config.yaml 同目录查找 callback 模块并完全忽略 PYTHONPATH，.py 必须与 config.yaml 同一 ConfigMap，否则 ImportError 进 CrashLoop。
4. **按查询计费必须配额管控**：注册为后端 MCP server 后，用 MCP Access Group + virtual key 形成授权闭环并关闭 Allow All Keys；IP 过滤与 key 授权是独立机制，成本控制应依靠后者。
5. **分两段验证链路**：先在 Pod 内用独立 SigV4 脚本走 tools/list → tools/call（200 即链路通，403 仅缺 IAM），再端到端用 input_tokens 增大 + CloudWatch Invocations 交叉验证；DEBUG botocore 日志会打印 STS 临时凭证，仅限临时排查。
6. **合规与可观测性**：条款禁止批量存储结果或构建竞争性索引、要求保留来源引用；Gateway 请求/响应日志默认关闭，需三步开启 vended log delivery 才能看到每次 query。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

