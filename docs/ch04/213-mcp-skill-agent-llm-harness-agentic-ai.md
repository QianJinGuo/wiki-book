# MCP · Skill · Agent · LLM · Harness — 一张图讲清：Agentic AI 系统如何真正落地

## Ch04.213 MCP · Skill · Agent · LLM · Harness — 一张图讲清：Agentic AI 系统如何真正落地

> 📊 Level ⭐⭐ | 11.0KB | `entities/agentic-ai-system-architecture-harness-skill-mcp.md`

# MCP · Skill · Agent · LLM · Harness — 一张图讲清：Agentic AI 系统如何真正落地

> 作者：霍旭东（ThinkingInDev），2026-04-29

Agent → LLM → Skill → MCP → External World
逐层下沉：Agent（任务编排）→ LLM（认知推理）→ Skill（能力封装）→ MCP（连接协议）→ External（真实世界）
External → MCP → Skill → Agent → Memory → LLM

## 相关实体
- [Code As Agent Harness Survey](../ch09/052-code-as-agent-harness.html)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](../ch05/018-harness.html)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](../ch05/018-harness.html)
- [From Agent Protocol To Harness Skill](ch04/394-from-agent-protocol-to-harness-skill.html)
- [Ai Skill Skill Creator 源码拆解](../ch01/592-skill-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-ai-system-architecture-harness-skill-mcp.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)
## 核心架构（三层结构）

### 1. 能力执行主链
Agent → LLM → Skill → MCP → External World
逐层下沉：Agent（任务编排）→ LLM（认知推理）→ Skill（能力封装）→ MCP（连接协议）→ External（真实世界）

### 2. 认知-行动-记忆闭环
External → MCP → Skill → Agent → Memory → LLM
不是一次调用，而是持续迭代的闭环系统。对应ReAct / Plan-Execute / Reflexion范式。

### 3. 横切全局的Runtime（Harness）
Harness = AI系统的操作系统，覆盖所有层，不在链路上。

## 逐层拆解

### L4：Agent（应用与编排层）
核心结构：State → Planner → Executor → Verifier → Reflector
职责：任务拆解、工具选择、多轮执行、结果校验、反思优化
本质：LLM的"具身执行体"

### L3：LLM（认知引擎）
能力：理解(NLU)、推理(Reasoning)、规划(Planning)、生成(Generation)
注意：LLM不负责执行、不直接操作世界；它只负责"决定怎么做"

### L2：Skill（能力SDK）
Skill = 可复用的业务能力封装 = Tool + 语义 + 流程 + 组合能力
包括：数据分析、报表生成、订单处理、文档处理等

### L1：MCP（连接与协议层）
本质：AI世界的"统一接口标准"
解决问题：工具调用不统一、权限混乱、数据格式不一致
核心能力：Tool Schema、能力发现、权限控制、数据规范、连接管理

### L0：External World（外部世界）
数据库、ERP/CRM、SaaS、API、文件系统、人工流程
关键认知：AI不创造价值，它只是调度价值

## Memory 分层

| 类型 | 用途 | 归属 |
|------|------|------|
| 短期记忆（Session Memory） | 当前任务上下文、对话历史 | Agent（控制流程） |
| 长期记忆（RAG） | 向量数据库、知识库 | LLM（增强认知） |

## Harness 的六大职责

1. 调度（Scheduler）：多任务执行、Agent编排、并发控制
2. 执行控制（Execution Control）：超时控制、重试机制、熔断策略
3. 可观测性（Observability）：Tracing、Logging、Metrics
4. 评测（Eval）：离线评估、在线反馈、A/B Test
5. 安全治理（Governance）：权限控制、数据安全、内容安全、合规
6. 资源管理（Resource）：Token控制、成本管理、限流

## 典型执行流程（闭环）

1. 用户输入需求 → Agent 理解并拆解任务 → LLM 推理与规划
2. Agent 选择 Skill/Tool → 通过 MCP 调用外部能力
3. 执行并获取结果 → Verifier 校验 → Reflector 反思优化
4. 写入 Memory → 输出最终结果

## 关键认知

- "从Demo到生产"的分水岭不在模型，而在架构设计
- LLM负责思考，Agent负责执行，Skill提供能力，MCP连接世界，Harness让一切变得可控
- 不是一次调用，而是循环收敛

## 深度分析

### 1. 分层架构是 Agentic AI 系统从 Demo 走向生产的核心约束

文章提出的五层架构（Agent → LLM → Skill → MCP → External World）揭示了一个关键事实：Agentic AI 系统的复杂度不来自模型本身，而来自层次之间的协作与边界定义。 这与 Anthropic 在《Building effective agents》中提到的"复杂任务需要明确边界和工具定义"高度一致。分层架构的本质是**关注点分离**（Separation of Concerns），使得每一层可以独立演进而不过度耦合。

### 2. Harness 作为"操作系统"类比，揭示了 Runtime 层的基础设施价值

文章将 Harness 比喻为 AI 系统的操作系统，覆盖所有层，不在链路上。 这个类比极其精准——如同 Linux 调度进程、 管理资源、提供安全边界一样，Harness 负责调度多 Agent、执行控制、可观测性、评测、安全治理和资源管理。这与我在实践中观察到的现象吻合：团队往往在模型能力上投入过多，却在 Harness 层面缺乏基础能力建设，导致系统难以Scale。

### 3. Memory 的分层设计（短期/长期）是 Agent 保持上下文一致性的关键

文章明确区分了 Session Memory（Agent 控制流程）和 RAG（LLM 增强认知），指出这是两个不同层次、不同职责的记忆系统。 这个设计避免了许多 Agent 实现中的"记忆混乱"问题——将上下文管理（短期）和知识检索（长期）解耦，使各自优化成为可能。Michael Phi 在《How Agents Work》中也强调了这种分层记忆机制对多轮对话一致性的重要性。

### 4. MCP 作为"统一接口标准"解决了 AI 工具生态的碎片化问题

文章指出 MCP 解决的核心问题是：工具调用不统一、权限混乱、数据格式不一致。 这对应了当前 AI 工具生态的真实痛点——每个模型提供商、每个框架都有自己的 Tool Schema，导致 Agent 跨平台迁移成本极高。MCP 的价值类似于 USB 接口在设备连接领域的革命性意义：一旦普及，工具互操作性将大幅提升。

### 5. "AI 不创造价值，它只是调度价值"是 Agentic AI 落地的本质认知

文章在 L0 层明确提出这一关键认知，AI 系统的价值来源是外部世界（数据库、ERP、API 等），而非 AI 本身。 这个观点与 Andrej Karpathy 关于"Software 2.0"和"AI as API orchestrator"的表述一致。Agent 的核心竞争力不是"思考"，而是在正确的时间调度正确的工具完成正确的任务。

## 实践启示

### 1. 架构设计先于模型选型

从 Demo 到生产的分水岭不在模型能力，而在架构设计。 在投入大模型微调之前，应先明确五层架构中每一层的职责边界和交互协议。团队应先回答：我们的 Agent 如何分层？Harness 需要承担哪些职责？Skill 如何抽象和复用？

### 2. 构建分层的 Memory 策略，避免用 RAG 解决所有记忆问题

Session Memory（短期）和 RAG（长期）服务不同目的，不应混用。 在设计 Agent 时，应为短期上下文分配独立的内存管理机制（如滑动窗口或结构化状态），为长期知识配置专用向量检索。二者需要不同的更新策略和容量管理。

### 3. 重视 Harness 层的基础设施投入，尤其是可观测性和评测

Harness 的六大职责中，可观测性（Tracing/Logging/Metrics）和评测（Eval）是 most neglected 但最关键的。 缺乏可观测性意味着 Agent 的决策过程是一个黑箱，难以排查错误和持续优化。建议从第一天就将 tracing 集成到 Agent 执行链路中。

### 4. 通过 MCP 协议化工具接口，提升 Agent 的工具互操作性

在设计 Skill/Tool 时，应优先遵循 MCP 的 Tool Schema 标准，而非私有定义。 这将使 Agent 具备跨平台工具调用能力，降低未来切换模型提供商或扩展工具集的成本。如果 MCP 尚不成熟，至少应设计一套自己的工具接口规范（Schema + 权限 + 数据格式）。

### 5. 采用闭环执行范式（ReAct/Plan-Execute），而非单次 LLM 调用

Agentic AI 的核心不是"一次调用得到答案"，而是"循环收敛"——通过 Verifier 校验和 Reflector 反思持续优化结果。 在实现 Agent 时，应设计执行循环机制，包含：Planner（规划）→ Executor（执行）→ Verifier（校验）→ Reflector（反思）的标准流程，而非简单的 prompt → LLM → response 路径。

---

