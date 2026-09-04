# LongHorizon-Harness: Advancing LongHorizon Agents for Real-World Tasks

> 📊 Level ⭐⭐ | 8.2KB | `entities/longhorizon-harness-mea-alibaba-dreamx-arxiv-2026-09-01.md`

# LongHorizon-Harness: Advancing LongHorizon Agents for Real-World Tasks

→ [原文存档](https://arxiv.org/abs/2608.01964)

## 摘要

LongHorizon-Harness（Alibaba DreamX，arXiv:2608.01964）把长时程执行重框架为**任务状态管理问题**：症结不在模型推理，而在跨长执行如何追踪与更新状态。现有 harness 把执行、状态维护、完成评估耦合进同一段日益增长的历史——累积错误的轨迹，同时成为下一决策依赖的记忆。

其解法是 **Manage-Execute-Audit (MEA)** 循环：规划、执行、验证三职物理分离，各轮之间只持久化审计员经环境核实的事实；每轮在全新、预算受限的上下文中执行，前轮原始轨迹即丢弃——把"长时程"拆成一串短而可验证的步骤。

WeaveBench 上 Qwen 3.7-Plus 的 PassRate 从 51.8% 跃至 **80.7%**，约为官方 Opus 4.7（41.2%）两倍；Terminal-Bench 2.1 69.7%→77.2%，OSWorld 2.0 2.8%→8.3%。框架可跑在 Claude Code、Codex CLI、OpenClaw、Hermes Agent 之上。

## 核心要点

- **MEA 三职分离**：Manager 规划但绝不触碰环境，Executor 是唯一可改环境的角色，Auditor 只读地以环境证据核实。三者互相制衡，错误无法在无证据下写回状态。
- **状态外置**：需求/工件/事实三条结构化记录各自标记 completed/pending/blocked/untrusted，仅在有清洁审计证据时标记 completed。
- **新鲜上下文执行**：每轮 Executor 在全新、预算受限上下文中运行，前轮轨迹与内部推理丢弃，只转执行报告给审计；审计报告是唯一跨轮记忆。
- **审计隔离与证据信任根**：Auditor 结论源于直接环境证据而非 Executor 自述；检测到工作区变更按 clean/suspect/violation 记完整性违规。
- **可互换后端（AgentAdapter）**：轻量适配层使同一框架支持 Claude Opus、GPT、Qwen 及 Codex CLI、Claude Code、OpenClaw、Hermes Agent——增益来自框架而非特定模型。
- **三大失败源**：复合错误与目标漂移、上下文腐烂（利用率超临界后性能骤降）、任务状态丢失——框定全篇靶心。

## 深度分析

### LongHorizon-Harness architecture

架构刻意反单块：不做累积交谈记录的单循环，而把长时程执行建模为**状态转移系统**。Manager 读当前状态定义带依赖、约束与验收标准的子任务，交由在全新预算上下文（Executor 1800s/轮，Manager/Auditor 各 300s）中运行的 Executor；后者是唯一可改环境的角色，harness 只暴露其对应接口与工具集（GUI/CLI）。

其"harness 结构而非模型决定长时程可靠性"的立场，呼应 [Harness 工程综述](../ch05/026-harness-engineering.html) 与 [Harness 12 组件与 7 决策](../ch05/035-agent-harness.html) 的共识；"分开执行与受控上下文"的直觉同 [上下文管理工作集](../ch05/035-agent-harness.html)，只读审计则直接回应 [上下文漂移与工具幻觉](../ch03/004-agent.html)。

### The MEA method

**Manage**——Manager 永不触碰环境：不观应用状态、不查工作区、不调 GUI/CLI，只凭结构化状态（需求=目标/约束、工件=产出、事实=后续所需环境信息）决策——"无手的规划者"把规划与片面的环境读取隔开，防漂移于源头。**Execute**——干净底座的 Executor 每轮丢弃原始轨迹与内部推理，只转执行报告 `oi` 供审计，从根部对抗上下文腐烂。**Audit**——只读 Auditor 独立勘察环境，判定完成（complete/incomplete/blocked）、完整性（clean/suspect/violation）与事实发现，结论须来自直接环境证据而非 Executor 声明——即 agent 循环的"两人规则"，令"错误自评传播到下游"的病根失去立足点。

### Goal emulation

论文点名的三大挑战——复合错误累积成目标漂移、上下文腐烂、任务状态丢失——对应记忆文献的已知失败；"任务状态丢失"把长时程重框架为**记忆/调度问题而非推理问题**，与 [记忆的核心矛盾：上下文调度](097-agent-memory.html) 及 [Long-Horizon 与 Agentic RL](204-agentic-rl.html) 的处境一致。MEA 的目标仿拟靠把目标外置为持久、证据门控的状态，而非指望单一模型留在上下文中：Manager 每轮从状态重推下一步，原目标即便执行上下文被刻意丢弃也能存活——**以状态而非记忆做意图保持**，正区别于 [harness 深度拆解](../ch05/035-agent-harness.html) 的单块模式。

### Results vs baselines

三基准口径一致：**同一模型只换 harness 即获大幅增益**。WeaveBench（114 任务，GUI+CLI 协调）Qwen 3.7-Plus 从 Claude Code 基线 51.8%/0.702 升至 80.7%/0.835，八个领域全提升，约为官方 Opus 4.7（41.2%）两倍；Terminal-Bench 2.1 69.7%→77.2%；OSWorld 2.0（108 工作流，中位人工≈1.6h）binary 2.8%→8.3%、partial 21.5%→35.2%，其中 34 任务子集用 Opus 4.7 由 20.0%→34.3%。

最有力的对照是 AgentAdapter 的模型/harness 可互换性：弱模型与不同后端下增益依旧，故提升归因于框架而非模型——这是"harness 工程是长时程真实性能一阶杠杆"的干净证据，与 [Microsoft/Google harness 论文](../ch05/008-harness.html) 和 [Agentic RL 框架经验](204-agentic-rl.html) 互相印证。

## 实践启示

1. **「计划的人」与「动手的人」分离**：规划者永不触碰环境，是最廉价的防目标漂移纪律——把隐性错误源头抬到可审计的位置。
2. **状态是唯一跨轮记忆，原始轨迹该丢就丢**：持久化的不是长执行史，而是审计过的需求/工件/事实；新鲜上下文执行从根部缓解上下文腐烂。
3. **结论必须追溯到环境证据**：完成与否由独立、只读、只凭直接证据的角色判断；执行者自述永不能直接改状态——agent 循环的"两人规则"。
4. **换后端验证框架价值**：借 AgentAdapter 在多种模型与 harness 上复跑，可把"框架有效"与"模型强"区分开。

## 相关实体

- [Harness 工程综述](../ch05/026-harness-engineering.html) — "长时程可靠性取决于 harness 结构"的体系化地图。
- [Harness 12 组件与 7 决策](../ch05/035-agent-harness.html) — MEA 是"状态管理+评估"两块的落地实例。
- [上下文管理工作集](../ch05/035-agent-harness.html) — 分享"分开执行与记忆"的直觉。
- [Long-Horizon 与 Agentic RL](204-agentic-rl.html) — 从训练侧处理长时程，可对照。

---

