# 微软 Agent Framework 全栈指南：从 Hello Agent 到生产托管（Python）

## Ch01.597 微软 Agent Framework 全栈指南：从 Hello Agent 到生产托管（Python）

> 📊 Level ⭐⭐ | 6.0KB | `entities/microsoft-agent-framework-python-full-guide-zizhi.md`

Agent Framework 是微软面向 .NET / Python 的统一 Agent 开发框架，承接 Semantic Kernel 与 AutoGen 的核心能力，并新增：
| 模块 | 职责 |
|------|------|
| Agents | LLM 推理 + 工具/MCP 调用 + 响应生成 |
| Workflows | 图式多步编排，类型安全路由、检查点、人机协同 |
| Hosting | 将 Agent 暴露为 HTTP / A2A / OpenAI 兼容 / Serverless 等形态 |

底层公共能力：Model Client（多厂商模型接入）、AgentSession（会话状态）、ContextProvider（记忆与上下文注入）、Middleware（拦截与治理）、MCP Client（工具生态对接）。

**选型原则：**

- 开放对话、自主调工具 → Agent
- 步骤固定、要强控执行顺序 → Workflow
- 纯确定性逻辑 → 普通函数，不必上 Agent

## 相关实体
- Microsoft Agent Framework Python Zizhi
- [Harness Engineering Framework](../ch05-041-harness-engineering-概念框架/)
- [Agentscope Java Harness Framework Enterprise Distributed](../ch03-048-agentscope-java-harness-framework-2-0-企业级-agent-分布式场景的-har/)
- [要实现一个工作流选择 Agent Skills 还是 Ai 表格](../ch04-192-要实现一个工作流选择-agent-skills-还是-ai-表格/)
- [Agent Harness 12 Components 7 Decisions](../ch04-061-一篇看懂-agent-harness-的结构-12组件-7决策完整框架/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/microsoft-agent-framework-python-full-guide-zizhi.md)

## 深度分析

微软 Agent Framework 的推出代表了微软在 Agent 开发领域的战略整合。通过承接 Semantic Kernel 的编排能力与 AutoGen 的多 Agent 协作机制，Framework 在单一技术栈内覆盖了从单 Agent 推理到多步编排再到服务暴露的完整能力链。这种整合并非简单合并，而是在架构层面重新划分了 Agent（开放域推理+工具自主选择）、Workflow（确定性多步编排）和 Hosting（标准化暴露）三个清晰层次，解决了此前微软 Agent 工具链碎片化的问题。

框架的工具集成体系体现了对函数调用模式的成熟理解。`@tool` 装饰器配合 Pydantic `Field` 描述构建了一套自文档化的 schema，直接输入模型的 function definition，弥合了开发者意图与模型理解之间的语义鸿沟。`approval_mode` 的设计引入了一个关键的安全边界机制——在本地 Demo 可用 `never_require` 直接执行，生产环境切换为 `always_require` 或自定义审批流，这一模式与 DevSecOps 的"安全默认"理念一致。

Session 与 Provider 体系揭示了框架对状态管理的分层思考。`AgentSession` 解决同会话内的上下文连续性，`ContextProvider` 与 `HistoryProvider` 则将状态扩展到跨会话持久化和审计层面。文章明确指出只应有一个 `HistoryProvider` 设置 `load_messages=True`，以避免重复回放——这看似工程细节，实则反映了"单一真相来源"的分布式系统设计原则，在跨进程部署时尤为重要。

Workflow 与 Agent 的边界设计反映了生产系统的真实复杂性。将 Workflow 包装为 AIAgent 以接入 A2A/OpenAI 兼容端点的能力，承认了生产环境中确定性管道与开放域 Agent 并存的现实。6 种托管形态（A2A Protocol、OpenAI 兼容端点、Azure Functions Durable、AG-UI 等）的并立，为不同场景提供了差异化选择，但也带来了协议选型的认知负担。

生产 checklist 将凭证管理、工具安全、合规评估和可观测性作为必须项而非可选项，这些往往是架构文档忽略但生产环境致命的细节。特别是第三方 MCP 的数据出境问题，在当前监管环境下已非"建议"而是"必须评估"。Checkpoint 对长流程恢复的支持，则解决了 AI Native 应用不同于传统软件的 Stateful 运维挑战。

## 实践启示

1. **从最小可行 Agent 起步，但尽早确立凭证与安全策略**：框架的 `pip install agent-framework` 到首 Agent 运行路径极短，但 `.env` 不自动加载、默认 `never_require` 等开发友好设计必须在原型阶段就切换为生产策略。

2. **工具定义质量决定模型调用准确率**：Pydantic `Field` 的 description 和 docstring 会直接进入模型的 function schema，描述质量对工具调用准确率有显著影响，应投入与 API 设计同等的工程注意力。

3. **分布式部署时 Session 与 Provider 必须对接外部存储**：文章明确警告 Session 作为进程内对象在分布式场景下的局限性，生产部署应从第一天将 Redis 或数据库作为 Session 后端。

4. **渐进式架构演进路径**：对于已有 Semantic Kernel 或 AutoGen 投入的团队，Agent Framework 提供了向前兼容的渐进迁移策略——新服务优先试点，同时保持对旧框架的安全支持窗口。

5. **协议选型应基于生态位置而非技术偏好**：A2A Protocol 面向多 Agent 系统间互调，OpenAI 兼容端点面向已有 Chat Completions 集成的生态，Azure Functions 面向 Serverless 长时任务——选型决策应基于组织的技术生态位而非技术新鲜度。

---

