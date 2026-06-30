# Agent 开发应小步快跑：第一个 Agent 只需做一件事（哪怕很烂）

## Ch04.166 Agent 开发应小步快跑：第一个 Agent 只需做一件事（哪怕很烂）

> 📊 Level ⭐⭐ | 12.2KB | `entities/agent-development-crawl-walk-run-crewai-iterative.md`

# Agent 开发应小步快跑：第一个 Agent 只需做一件事（哪怕很烂）

> **核心论点**：传统软件开发周期强调一次设计、覆盖所有边界情形（design for scale from day one）；而 Agent 系统应采用**小步快跑**（crawl, walk, run）迭代方法——第一个 Agent 做一件事、做得很烂，但能上线、能从真实执行中学习。CrewAI 基于 2B+ agentic executions 提炼的实战方法论。

> **来源**：CrewAI Blog（blog.crewai.com），发布于 2026-01-29。原文链接：[Your First AI Agent Should Do One Thing Badly](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/your-first-ai-agent-should-do-one-thing-badly.md)

## 背景：POC 墓地现象

工程师训练要求预先考虑边界情形、为规模化设计。但这套传统思路在 Agent 系统上**反向生效**：

- **典型失败模式**：技能娴熟的工程师一上来就设计理想系统——研究员 Agent → 规划 Agent → 执行 Agent → 质量检查 Agent，文档详尽、图示精致、错误处理复杂
- **3 个月后**：项目仍卡在开发阶段，README 完美，**生产流量为 0、ROI 为 0**
- **根因**：在不理解系统时优化系统——为不会发生的错误写错误处理，错过真正会发生的失败，为不知道是否值得 scale 的东西建 scale

> "They are stuck in POC purgatory aren't less capable, the problem is they're optimizing for a system they don't yet understand." 

## 高风险领域的"小步快跑"实证：医疗人员资质核验

Healthcare staffing 公司面对的核心问题：每次 onboarding 医生需要核验执照、查询医疗委员会、检查制裁清单、验证身份——多数据源、动辄数天，延误会有超越收入损失的后果。

**CrewAI 推荐路径**（与传统相反）：
1. **不**自动化整个 onboarding 流水线
2. **只**做一件事：背景核验工作流
3. 初始版本：收集医生数据 → 查询相关源 → 输出 JSON → 做决策 → 推送到 Snowflake
4. **不**覆盖所有 edge case
5. 几周内交付（而非数月规划）

**结果演进**：
- 第一周：单点 MVP，可运行但不可信
- 几周后：实际生产流量，开始加 hallucination 检测 guardrails、审计追踪、合规流程
- 几月后：流程从数天压缩到数小时
- 已有第二个 use case 在开发中

**反模式**（如果一开始就加所有 checks/balances）：
- 错过实际用例和架构改进的机会
- 类似传统应用在解决性能问题前就加缓存——优化方向反了

## "If I Were Starting Today" 五条原则

CrewAI 给新手的具体建议（来自经过验证的工程经验）：

### 1. Narrow scoped agents, fewer tasks, this week not this quarter
- 目标**不**是构建令人印象深刻的东西
- 目标是**能尽快 ship 的东西**——几周内能从中学习
- 如果超过几周，你**正在构建得太多**
- **迭代成本低**到不利用就是浪费

### 2. Human in the loop is a feature, not a limitation
- 起点：尽量多的人工审核
- 这是构建反馈循环的**核心机制**——人会告诉你**实际**错在哪（不是你想象的错在哪）
- 信任度渐进曲线：**100% 人工 → 80% → 50% → 完全自主**
- 每降一档都必须由数据证明（准确率、错误率、用户投诉率）

### 3. Make failure satisfyingly obvious
- **不要**早期建复杂的 error recovery
- **要**明显的 error surfacing——看清单失败，看懂失败
- 传统软件：graceful degradation（优雅降级）
- Agent 系统：**早期大声失败**——看清失败以修根因
- 后期再补 error recovery（先理解失败模式）

### 4. Weekly iteration vs quarterly roadmaps
- 每周看上周**实际**失败的地方
- 锐化 prompt、修模糊点、加 guardrails
- 关注**真实问题出现**的地方
- 用好所有 control levers（prompt、tool selection、guardrail、human review、retry、escalation）

### 5. Add agents when you have evidence, not intuition
- "我觉得需要 validator" → **猜测**，不要做
- "47% 错误是格式问题，validator 能抓住" → **数据**，可以做
- Multi-agent 架构强大但**乘法增加调试面**
- 把复杂度视为**赚来的特权**：先证明需要，才增加

> "Multi-agent architectures can be powerful but they also multiply the debugging surface area, so think about these systems progression as you earning your way into that complexity by proving you need it first." 

## 为什么这种反直觉的方法有效

Agent 系统的力量来源：能编排智能并指向复杂/模糊问题
Agent 系统的特殊性：行为**从 prompt + tool + data + MCP + model 的交互中涌现**
**不能**在前面完全 spec 行为，因为行为从交互中涌现
**唯一**理解交互的方式：用真实输入跑，看会发生什么

> "That's not a limitation of the technology. That's just how it works. And once you embrace that, shipping becomes a lot more straightforward." 

## 与 wiki 现有实体的差异化

| 维度 | 本实体（CrewAI crawl-walk-run） | 现有 agent-* 实体 |
|------|--------------------------------|------------------|
| **方法论焦点** | 单点切入 + 迭代上生产（crawl-walk-run） | 多 Agent 架构设计、12 组件、harness 框架 |
| **核心反模式** | POC 墓地：规划完美、零生产流量 | 多 Agent 早 over-engineer、协调复杂度失控 |
| **可证伪依据** | 2B+ executions 经验 + 医疗实证 | 理论框架、案例研究 |
| **目标读者** | 第一次建 Agent 的团队 | 建生产级多 Agent 系统的团队 |
| **Harness 关系** | Harness 是迭代的产物（先跑起来再加） | Harness 是开始设计前就要有的 |

**关键互补点**：本实体的"先做一件事"是**进入**复杂 harness 体系的入门路径。读完 `agent-harness-12-components-7-decisions` 之类的设计参考后，**如何**开始是本实体回答的问题。

## 实践启示（5 条可执行项）

1. **第一个 Agent 限定 1 个 narrow 任务**——不是大系统的一个模块，是**可独立交付的端到端闭环**
2. **First month KPI = 上线而非完成度**——衡量"satisfied with what's shipped"而非"satisfied with completeness"
3. **人工审核率记录为指标**——100% → 80% → 50% 的下降曲线本身就是质量信号
4. **每周 review 真实失败**——不要看 demo 跑通，看生产流量里的失败模式
5. **加 multi-agent 之前列出证据**——>30% 错误能归因到当前单 agent 能力上限，才考虑拆分

## 与相关 entity 的关系

- `[Agent Harness 12 Components 7 Decisions](ch04/503-agent.md)` — 复杂多 Agent 系统的设计参考（harness 12 组件 + 7 决策），本实体的下游
- `[Agent Harness Engineering Survey 2026](ch04/503-agent.md)` — Harness Engineering 综述，提供"harness 是什么"的理论基础
- `[Agent Development Crawl Walk Run Crewai Iterative](ch04/310-ai.md)` — 当前实体（CrewAI 实证方法论）

## 深度分析

### 1. Crawl-Walk-Run：AI agent 开发的阶段性框架
CrewAI 的 Crawl-Walk-Run 框架为 AI agent 开发提供了一个渐进式路径：Crawl（单一简单任务）→ Walk（多步流程）→ Run（自主 agent）。这一框架的核心价值在于避免"一步到位"的失败——大多数 agent 项目失败是因为试图直接构建自主 agent 而没有先验证基础组件。

### 2. 与 `How We Built Cognitive Memory For Agentic Systems` 的互补性
Crawl-Walk-Run 是 agent 开发的方法论，Cognitive Memory 是 agent 的记忆基础设施——两者在工程实践层面互补。先用 Crawl-Walk-Run 确定你需要什么能力，再用 Cognitive Memory 提供跨 run 的学习能力。

### 3. 迭代开发的核心：从失败中学习
CrewAI 的迭代方法论强调从每次运行中学习——不是一次性完美设计，而是持续改进。这与 `Agent Reliability Engineering Skillify Continuous Improvement` 中的持续改进理念一致。

### 4. "Walk"阶段是关键过渡点
从 Crawl（单一任务）到 Walk（多步流程）是最难的跳跃——单一任务的错误是局部的，多步流程的错误会传播和放大。这一阶段需要投入最多的时间和测试。

### 5. Run 阶段的信任建立
自主 agent 的信任建立需要渐进的自主权授予——先在受控环境中运行，逐步扩大权限范围。这与 `Agent Security Three Step Sequence Harness Governance Identity Crewai` 中的治理框架一致。

## 实践启示

### 1. 从 Crawl 开始：先验证单一任务的成功率
不要跳过 Crawl 阶段。先确认 agent 能可靠地完成单一简单任务（如"提取文章标题"），再扩展到多步流程。

### 2. Walk 阶段：重点投资错误处理和恢复
多步流程的核心挑战是错误传播——每一步的错误都会影响后续步骤。投入最多时间在 Walk 阶段的错误处理和恢复机制。

### 3. Run 阶段：渐进式自主权授予
自主 agent 不应一次性获得所有权限——从"建议行动"到"自动执行低风险操作"到"自动执行所有操作"，逐步扩大自主权。

### 4. 每个阶段定义明确的成功指标
Crawl：单一任务准确率 >90%；Walk：多步流程完成率 >80%；Run：自主执行成功率 >70%——明确的指标使得阶段间转换有据可依。

### 5. 用 Cognitive Memory 支持跨 run 学习
在 Run 阶段引入跨 run 的记忆系统（如 CrewAI Cognitive Memory），使 agent 能从历史运行中学习和改进。

## 原文链接

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/your-first-ai-agent-should-do-one-thing-badly.md)

---

