# 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

## Ch01.910 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

> 📊 Level ⭐⭐ | 4.6KB | `entities/用-litellm-websearch-interception-集成-aws-托管的-amazon-bedrock-agentcore-web-search-.md`

# 用 LiteLLM WebSearch Interception 集成 AWS 托管的 Amazon Bedrock AgentCore Web Search 能力

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

该机制默认的搜索后端是自建的 SearXNG（一款开源元搜索引擎，需自行以容器方式部署并维护）。 SearXNG 后端的搭建（启动容器、开启 JSON 输出、在 LiteLLM 中配置 search_provider: searxng） 属于 LiteLLM 原生支持的标准流程，可参考 [LiteLLM 官方文档](<https://docs.litellm.ai/docs/>) 中 web search / search tools 一节；本文不展

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/用-litellm-websearch-interception-集成-aws-托管的-amazon-bedrock-agentcore-web-search-.md)

---

