# AWS Bedrock AgentCore

## Ch11.233 AWS Bedrock AgentCore

> 📊 Level ⭐⭐ | 1.6KB | `entities/aws-bedrock-agentcore.md`

AWS Bedrock AgentCore 是 AWS 推出的 Agent 基础设施平台，旨在为开发者提供生产级 AI Agent 部署能力。通过 `CreateHarness` 和 `InvokeHarness` 两个核心 API，覆盖 Agent 运行所需的六大基础设施原语。

## 核心能力

- **Sandbox 运行时**：安全隔离的代码执行环境
- **Memory**：Agent 记忆管理，支持短期和长期记忆
- **Gateway**：MCP 协议网关，连接外部工具和服务
- **Browser**：浏览器自动化能力
- **Identity**：Agent 身份认证和授权
- **Observability**：Agent 行为监控和追踪

## 相关实体

- [AgentCore Harness GA](ch04/503-agent.md)
- [AgentCore Harness](ch04/503-agent.md)
- [AgentCore Identity Security](ch04/503-agent.md)
- [Bedrock Multi-Agent](ch04/503-agent.md)
- [AgentCore Browser](ch04/503-agent.md)

## 应用场景

AgentCore 适用于需要生产级基础设施的企业级 Agent 部署，特别是：
- 需要安全沙箱执行的代码 Agent
- 需要外部工具集成的 MCP Agent
- 需要多 Agent 协作的复杂工作流

---

