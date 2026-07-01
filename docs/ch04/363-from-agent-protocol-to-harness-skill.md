# From Agent Protocol to Harness Skill

## Ch04.363 From Agent Protocol to Harness Skill

> 📊 Level ⭐⭐ | 7.2KB | `entities/from-agent-protocol-to-harness-skill.md`

→ （无原始来源）

## 核心内容
### 协议层：MCP 与 A2A
**MCP (Model Context Protocol)**
MCP 是 Agent 与外部工具之间的通信协议，解决"如何让 Agent 调用工具"的问题：

- 工具发现（Tool Discovery）
- 工具调用（Tool Invocation）
- 结果返回（Result Schema）
**A2A (Agent-to-Agent Protocol)**
A2A 是 Agent 之间的通信协议，解决"如何让 Agent 与其他 Agent 协作"的问题：

- 任务委托（Task Delegation）
- 结果聚合（Result Aggregation）
- 状态同步（State Synchronization）

### 技能层：Harness Skill Architecture
Harness 技能架构将 Agent 的能力封装为可配置的技能单元：

- **Skill Definition**：技能的能力边界定义（输入/输出/前置条件）
- **Skill Harness**：技能执行的环境配置（工具+知识库+验证器）
- **Skill Composition**：多技能的组合规则（顺序/并行/条件触发）

### 演进路径
```    
Agent Protocol → MCP Tool Calling → A2A Collaboration → Harness Skill    
```    
协议层解决连通性问题，技能层解决能力复用问题。

## 深度分析
1. **MCP 的出现填补了"工具调用"协议层的空白**。在 MCP 出现之前，每个 Agent 框架（LangChain、LlamaIndex、AutoGen）都自己定义工具调用的格式和流程，导致工具开发者的实现只能适配特定框架。MCP 作为通用协议，使得工具开发者只需实现一次，即可被任何支持 MCP 的 Agent 调用。这是协议标准化的典型价值——降低生态系统的交易成本。
2. **A2A 与 MCP 的分工体现了"工具"与"协作"的概念分离**。MCP 处理 Agent 与世界的接口（Tools），A2A 处理 Agent 与 Agent 的接口（Collaborators）。这种分离是正确抽象——工具是相对静态的能力扩展，Agent 协作是动态的意图协商。将两者混用（如用 MCP 协议实现 Agent 间通信）会导致协议语义混乱和扩展性瓶颈。
3. **Harness Skill 是 Agent 架构从"单体"向"微服务"演进的里程碑**。单体 Agent 将所有能力（prompt、tools、memory、guardrails）耦合在一起，升级任何一部分都需要修改整体。Harness Skill 将技能封装为独立单元，通过 Skill Manifest 声明能力边界和依赖关系，支持运行时动态加载和组合。这与软件架构从单体到微服务的演进路径高度相似。
4. **Skill Composition 的核心挑战是"依赖冲突"而非"接口不兼容"**。当多个 Skill 同时修改同一个状态（如对话历史、工具列表）时，执行顺序和优先级变得关键。早期 Skill Composition 方案关注接口契约（Interface Contract），但实际失败案例更多来自运行时依赖冲突（Runtime Dependency Conflict），例如 Skill A 需要在 Skill B 之前执行但 B 先获得了执行权。当前研究焦点转向 Skill 间的动态协调协议。

## 实践启示
1. **新 Agent 项目应从支持 MCP 的框架入手**。MCP 已获得主流 Agent 框架（LangChain、LlamaIndex、AgentSDK）的广泛支持。在项目启动时选择 MCP 原生支持的框架，可以直接复用社区已有的 MCP Tool 生态，避免重复造轮子。建议在 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 框架下设计 Agent 架构。
2. **A2A 适用于跨组织边界的 Agent 协作场景**。当 Agent 需要与外部合作伙伴的 Agent 进行安全受控的信息交换时，A2A 提供了标准化的委托-结果协议。建议在 A2A 之上构建业务级的任务编排层，而非直接暴露 A2A 协议给业务调用方——后者会导致业务逻辑与通信协议耦合。
3. **设计 Skill 时，优先声明前置条件（Precondition）和后置结果（Postcondition）**。Skill 的能力边界比 Skill 的实现细节更重要。例如：RAG-Skill 的 Precondition 是"存在向量数据库"，Postcondition 是"返回 top-k 相关文档"。这种声明式描述使得 Skill 组合时可以做前置条件检查，避免运行时错误。详细可参考 。
4. **避免在单一 Skill 内实现过多功能，保持 Skill 的单一职责**。当一个 Skill 变得臃肿时，应该拆分为多个细粒度 Skill。经验法则是：如果一个 Skill 的工具列表超过 7 个，或者 prompt 长度超过 2000 tokens，应该考虑拆分。细粒度 Skill 更容易测试、版本管理和独立演进。
5. **建立 Skill 版本管理和回滚机制**。当 Skill 升级导致回归问题时，需要能快速回退到历史版本。建议每个 Skill 维护独立的版本号（语义化版本），并在 Agent 初始化时锁定 Skill 版本。运行时动态加载最新 Skill 版本的功能应仅在充分测试后开启。

## 相关实体
- [Agent Harness 架构](ch03/044-agent.md)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch11/209-openclaw.md)
- [Claude Code 源码核心机制详解](ch03/074-claude-code.md)
- [你不知道的 Agent 原理架构与工程实践](ch04/304-agent-principle-architecture-engineering-practice.md)
- [柚漫剧 AI 全流程提效拆解](ch04/150-ai.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](ch04/192-tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Design Patterns for AI Agents 2026](ch04/150-ai.md)

- [Agent架构关键变化：Harness正在成为新后端](ch03/044-agent.md)
- [harness-engineering-systematic-explainer](ch05/036-harness-engineering-systematic-explainer.md)
- [claude-code-7-layer-memory-architecture](ch01/869-claude-code-7-layer-memory-architecture.md)
- [AI Agent 工程师能力地图](ch04/150-ai.md)
- [huashu-design 2.0 — agent skill 反收敛三套逻辑](https://github.com/QianJinGuo/wiki/blob/main/entities/huashu-design-2-0-flower-uncle-3-patterns.md)
- [introducing the mdn mcp server](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-mdn-mcp-server-2026.md)
- [当 agentic ai 重塑生产关系：智能体浪潮下的企业战略与行动框架](ch04/150-ai.md)

---

