# Code as Agent Harness 综述

## Ch09.051 Code as Agent Harness 综述

> 📊 Level ⭐⭐ | 11.8KB | `entities/code-as-agent-harness-survey.md`

## 核心框架
论文（102页，UIUC+Meta+斯坦福）提出三层结构：
| 层级 | 内容 |
|------|------|
| **Harness Interface** | 代码作为推理媒介、行动边界、环境建模 |
| **Harness Mechanisms** | Planning、Memory、Tool Use、PEV Loop、AHE |
| **Scaling Harness** | 多智能体围绕共享代码协作 |

## 关键洞察
### 代码作为 Harness 的三个自然属性
1. **可执行**：能跑起来，能产生结果
2. **可检查**：中间状态、错误、日志、diff、trace 都能被读取
3. **有状态**：文件、仓库、测试结果、运行环境能跨步骤保留

### PEV 控制循环
- **Plan**：形成变更契约（读集、写集、验收条件、风险边界）
- **Execute**：在沙箱和权限边界内执行
- **Verify**：用确定性传感器（测试、类型检查、fuzzer、CI）判断状态是否可接受

### AHE（Agentic Harness Engineering）
不修改业务代码，而是根据 deep telemetry 调整 Harness 本身：工具 schema、检索策略、记忆规则、沙箱配置、验证器、权限层级、多 Agent 拓扑。
deep telemetry 记录：提示词、检索内容、token 成本、工具参数、延迟、编辑文件、命令输出、测试结果、栈信息、分支决策、被拒绝方案、人工干预。

### 多 Agent 协作模式
- Program synthesis / understanding / verification / execution / planning agents
- 四种互动：协同生成、批评修复、对抗验证、推理辩论
- 共享代码状态的事务语义是核心难点

## 代表系统
| 场景 | 系统 |
|------|------|
| 代码助手 | SWE-agent, OpenHands, Claude Code, Codex, Copilot |
| GUI/OS Agent | WebArena, OSWorld, BrowserGym, AndroidWorld |
| 科学发现 | AI Scientist, AI co-scientist, AlphaEvolve |
| 具身智能 | Voyager (Minecraft 技能库) |
| 形式化证明 | Lean, Coq, Isabelle |

## 开放问题
1. **Harness-level evaluation**：不能只看最终成功率，要问用了多少工具、失败后是否换策略
2. **Oracle adequacy**：绿色测试不等于语义正确，验证栈需有作用域声明
3. **Self-evolving Harness**：Harness mutation 应有变更契约、回归集、canary、回滚
4. **Transactional shared state**：多 Agent 围绕共享代码协作需要事务语义
5. **Human-in-the-loop**：审批、拒绝、例外应成为 Harness 持久状态
6. **Multimodal Harness**：截图、视频帧、bbox、传感器等多模态证据需要压缩和验证

## 工程实践原则
1. Agent 的核心资产不是聊天记录，而是可执行状态（文件、测试、日志、计划、权限、审批、轨迹）
2. 工具调用要有生命周期：前置校验、执行隔离、后置清洗、记忆更新、验证触发
3. 计划必须可审查，像变更契约而非隐藏的模型内部推理
4. 记忆要有写入门槛，不经验证的经验会污染未来决策
5. 验证要有证据包：通过什么检查、没覆盖什么风险都要可追溯
6. Harness 变化要跑回归，自我优化在可评估、可回滚时才有工程价值

## 深度分析
### Harness 作为认知架构
Code as Agent Harness 的本质是将代码从"工具"提升为"认知基础设施"。传统观点认为模型是智能的来源，代码只是执行载体。但这篇综述提供了一个更具工程意义的视角：模型是推理引擎，而 Harness 才是经验累积和行为约束的载体。 ^[code-as-agent-harness-survey-2026]
这意味着 Agent 的能力边界不取决于模型有多强，而取决于 Harness 能保留多少可验证的经验。一个 7B 模型配合完善的 Harness，可能比 70B 模型配合简陋 Harness 表现更稳定。关键变量从"模型参数"转向了"Harness 设计的精密程度"。

### PEV 循环与确定性验证的深层含义
PEV（Plan-Execute-Verify）框架的深层逻辑是：将模型生成的不确定性，通过确定性验证转化为可信赖的状态转移。不确定性不会消失，但被隔离在 Execute 阶段，并通过 Verify 阶段的质量门控。
这与传统的"模型越强越好"假设不同。即使模型有 99% 的生成质量，Agent 系统仍然需要验证层，因为那 1% 的错误在代码执行语境下可能是致命的（删除生产库、无限循环、权限泄露）。

### AHE 的工程哲学
Agentic Harness Engineering（AHE）提出的"根据 deep telemetry 调整 Harness 而非业务代码"是一个认识论反转：
1. **故障归因反转**：当 Agent 失败时，首先问"Harness 设计是否有问题"而非"模型是否不够强"
2. **优化目标反转**：不是让模型学会更多技能，而是让 Harness 更精准地调用现有技能
3. **学习载体反转**：学习发生在 Harness 配置层面，而非模型权重层面
这代表了一种更务实的 AI 工程路线：在模型能力短期无法显著提升的约束下，系统层面的精细化设计可能是突破口。

### 多 Agent 协作的核心矛盾
论文指出多 Agent 围绕共享代码协作的核心难点是"事务语义"。这揭示了一个根本张力：

- Agent 需要并发执行以提高效率
- 但代码状态的并发修改缺乏原子性保证
- 现有的串行执行方案牺牲了效率，换取了确定性
这是一个尚未被解决的问题，类似于分布式系统中的 CAP 定理——在一致性、可用性、分区容错性之间需要权衡。多 Agent Coding Agent 的工程实践还处于"先跑通再优化"的阶段。

### 与"Software 2.0"的承继关系
Code as Agent Harness 可以被视为 Software 2.0（以神经网络替代手工规则）的自我镜像：Software 2.0 用数据驱动的权重替代手工代码，而 Code as Agent Harness 用结构化的 Harness 替代手工的模型调用逻辑。
两条路线都在探索"如何让机器替代人工做设计决策"，但 Code as Agent Harness 更关注运行时的反馈闭环，而非训练阶段的价值对齐。这是两条互补的自动化路径。

## 实践启示
### 对 Agent 开发者的建议
1. **优先完善 Harness，而非追逐更强模型**：如果你的 Agent 经常在相似任务上失败，第一反应应该是检查 Harness 设计（验证器、记忆管理、权限控制），而不是换用更大的模型
2. **Plan 必须结构化**：变更契约（读集、写集、验收条件、风险边界）应该被显式序列化和检查，而非留在模型的隐式推理中
3. **验证器即知识库**：测试、类型检查、静态分析不只是质量门控，它们是 Agent 理解"什么是对的"的首要来源
4. **Deep telemetry 是优化的前提**：没有记录就谈不上优化。每个工具调用、每次状态变更、每次失败尝试都值得被结构化保存
5. **多 Agent 协作要预设冲突解决策略**：不要假设协同会自然顺畅——共享代码状态需要显式的仲裁机制（乐观锁、悲观锁、或串行化执行）
6. **Harness 变化必须可回归**：每次调整工具 schema、检索策略或验证规则时，都应该有一组基准测试来验证变化没有引入退化

### 对 AI 工程基础设施的启示
1. **评价体系要从"最终准确率"转向"过程指标"**：工具调用效率、策略切换频率、验证覆盖率、平均步数等过程指标比单一的成功率更能反映系统质量
2. **沙箱和权限控制是刚需**：没有隔离的执行环境，Coding Agent 在生产级任务上是危险的。Harness 必须内置危险命令的识别和拦截能力
3. **记忆系统的写入要有审计**：不是所有经验都值得被记住，未经验证的"经验"会污染未来的决策路径
4. **Human-in-the-loop 应该是持久状态而非临时干预**：审批记录、例外处理应该成为可查询的系统状态，而非一次性的人工介入
5. **AHE 理念适用于所有 Agent 系统**：即使不实现完整的 AHE 框架，"观测-诊断-调整-验证"的循环思路也适用于任何生产级 Agent 系统的持续优化

## 关联阅读
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/code-as-agent-harness-survey-2026.md)

## 相关实体
- [Design Patterns for AI Agents 2026](../ch04/094-design-patterns-for-ai-agents-2026-4-5-reflection.html)
- [Agent Harness 架构](../ch05/039-agent-harness.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/682-karpathy-vibe-coding-agentic-engineering.html)
- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [Agent架构关键变化：Harness正在成为新后端](../ch05/018-harness.html)
- [harness-engineering-systematic-explainer](../ch05/116-harness-engineering.html)

- [Claude Code 架构深度解析](../ch03/076-claude-code.html)
- [Claude Code Prompt 提示词体系源码解析](ch09/060-claude-code-prompt.html)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](../ch03/076-claude-code.html)
- [AgentCore Managed Harness](../ch04/656-agentcore-harness.html)
- [gsd-get-shit-done-context-management-tool](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md)
- [AI Agent 工程师能力地图](../ch04/030-ai-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

