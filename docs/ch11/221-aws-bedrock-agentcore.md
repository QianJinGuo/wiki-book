# AWS Bedrock AgentCore

## Ch11.221 AWS Bedrock AgentCore

> 📊 Level ⭐⭐ | 3.8KB | `entities/aws-bedrock-agentcore.md`

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

## 深度分析

### 六大原语的设计哲学

AgentCore 的六大原语（Sandbox、Memory、Gateway、Browser、Identity、Observability）并非随意堆砌，而是覆盖了 Agent 从执行环境到外部交互、从状态管理到安全治理的完整生命周期。Sandbox 提供隔离执行空间，解决代码 Agent 的安全风险；Memory 赋予 Agent 跨会话的上下文保持能力；Gateway 通过 MCP 协议标准化工具调用接口；Browser 扩展 Agent 的信息获取渠道；Identity 解决 Agent 身份认证与授权问题；Observability 提供行为可追溯性。这六者共同构成了 Agent 生产化部署的"操作系统层"。

### 与 MCP 生态的关系

AgentCore 的 Gateway 原语直接对接 MCP（Model Context Protocol），这意味着它天然支持 MCP 生态中的工具和服务。MCP 作为开放标准，使得 AgentCore 可以跨平台调用工具，而不必绑定 AWS 原生服务。这种开放性降低了供应商锁定风险，同时让 Agent 能够利用社区积累的 MCP 工具生态。

### 企业级部署的权衡

AgentCore 提供了完整的生产级基础设施，但这也意味着更高的复杂度和学习成本。对于简单的单 Agent 场景，直接调用 LLM API 可能更轻量；但对于需要多 Agent 协作、安全审计、身份管理、可观测性的企业场景，AgentCore 的六大原语提供了开箱即用的解决方案。其核心价值在于将 Agent 基础设施的重复性工作抽象为平台能力，让开发者专注于 Agent 行为逻辑本身。

## 实践启示

1. **渐进式采用**：不需要一次性启用所有六大原语。从 Sandbox + Gateway 开始（最基础的安全执行和工具调用），逐步加入 Memory、Observability、Identity 等高级能力
2. **MCP 优先**：优先使用 MCP 协议集成外部工具，而非 AWS 原生 API。MCP 生态正在快速增长，社区工具支持度不断提高
3. **Observability 先行**：在生产环境中，Observability 原语应优先启用。Agent 行为的不确定性使得监控和追踪成为故障排查的核心手段
4. **Identity 不可跳过**：即使在小规模部署中，Identity 原语也不应跳过。Agent 权限管理是安全基线，后期补充的成本远高于前期集成

## 应用场景

AgentCore 适用于需要生产级基础设施的企业级 Agent 部署，特别是：
- 需要安全沙箱执行的代码 Agent
- 需要外部工具集成的 MCP Agent
- 需要多 Agent 协作的复杂工作流

---

