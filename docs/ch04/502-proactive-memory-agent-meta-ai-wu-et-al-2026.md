# Proactive Memory Agent — Meta AI (Wu et al. 2026)

## Ch04.502 Proactive Memory Agent — Meta AI (Wu et al. 2026)

> 📊 Level ⭐⭐ | 5.3KB | `entities/remember-when-it-matters-proactive-memory-agent-long-horizon-wu-meta-2026.md`

# Proactive Memory Agent — Meta AI (Wu et al. 2026)

> **背景**：本篇整理自 Meta AI 的论文 "Remember When It Matters: Proactive Memory Agent for Long-Horizon Agents"（arXiv:2607.08716），提出了一种独立运行的记忆 Agent 架构，通过在长程任务中实施选择性干预来对抗「行为状态衰减」（behavioral state decay）问题。

## 核心发现：Behavioral State Decay

长程 Agent 任务中存在一种隐藏失效模式——随着轨迹（trajectory）的持续增长，任务需求、环境事实、先前的尝试记录、诊断结论以及未完成的子目标等信息会逐渐被埋没在上下文窗口中，最终无法影响决策。论文将此称为 **behavioral state decay**（行为状态衰减）。

这与 [记忆衰减](https://github.com/QianJinGuo/wiki/blob/main/concepts/memory-consolidation-decay.md) 的概念在认知层面有相似性，但在 Agent 系统中表现为信息在上下文窗口中的「被动沉没」而非主动遗忘。

## 架构设计：双阶段记忆干预

论文提出了一个与 Action Agent 并行运行的独立 Memory Agent，核心架构分为两个阶段：

### Phase 1：记忆管理（Memory Management）
Memory Agent 从 Action Agent 的最近轨迹中提取关键状态信息，更新结构化记忆库（Structured Memory Bank）。此过程与 Action Agent 的动作选择完全解耦。

### Phase 2：干预选择（Intervention Selection）
Memory Agent 判断是否需要注入记忆驱动的提醒（memory-grounded reminder）到 Action Agent 的上下文中。它可以选择：
- **注入提醒**：当检测到行为状态衰减已影响决策质量时
- **保持静默**：当前 Agent 能自行维持有效决策状态

## 选择性干预 > 被动检索

这是一项与现有 [工作集 vs 长程记忆](https://github.com/QianJinGuo/wiki/blob/main/concepts/working-set-vs-long-term-memory.md) 讨论密切相关的关键发现：

论文通过消融实验比较了多种记忆策略：

| 策略 | 效果 |
|------|------|
| **选择性干预**（论文方案） | **最优** —— 只在必要时注入提醒 |
| 被动记忆暴露（passive bank exposure） | 次优 —— 信息被淹没 |
| 始终注入（always-on injection） | 信息过载，反而降低性能 |
| 顾问式指导（advisor-only guidance） | 不如直接干预有效 |
| 通用检索（general retrieval） | 无针对性，效果最差 |

## 与现有记忆架构的关系

该论文的工作与 wiki 中已有的大量记忆系统研究形成互补：

- [AGENT MEMORY MODULAR FRAMEWORK](ch04/099-agent-memory.html) 和 [Agent Memory Architecture](ch04/403-perplexity-brain-self-improving-agent-memory-architecture.html) 主要关注记忆存储的层次化结构，而这篇论文聚焦于记忆的 **主动干预时机**；
- [Hermes Agent Memory System](../ch03/091-hermes-agent.html) 的三层架构侧重持久化存储，论文的贡献在于何时以及如何 **注入记忆**；
- [Memory Source Provenance](https://github.com/QianJinGuo/wiki/blob/main/concepts/memory-source-provenance.md) 关注记忆的来源可信度，这篇论文关注的是注入的 **时机选择**；
- [Agent Memory Injection](ch04/099-agent-memory.html) 从注入维度角度探讨了相似主题。

## 开放权重训练

作为开放权重记忆策略的初步探索，论文在 SETA 基准上使用 SFT 和 GRPO 训练 Qwen3.5-27B，验证了：
- GRPO 训练提升了验证奖励
- 训练后的记忆策略部分迁移到了 Terminal-Bench 任务

## 评价与局限

该论文为长程 Agent 任务中的记忆管理提供了一个清晰的问题定义（behavioral state decay）和实用的解决方案（双阶段记忆干预）。其 Plug-and-Play 设计使其可直接用于现有 Agent Harness。主要局限包括：
- 仅在两个基准上评估，泛化性待验证
- 开放权重记忆策略的迁移能力有限（"partial transfer"）
- 未与 [Context Management](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-management-agent-systems.md) 系统做详细对比

## 相关实体

- [Agentic RL Frameworks Long-Horizon Wolfe 2026](ch04/537-agentic-rl.html)
- [RoadmapBench Long-Horizon Benchmark](ch04/251-roadmapbench-long-horizon-agentic-software-development.html)
- [Memory Agent Systems Cobanov](ch04/559-memory-agent-systems-cobanov.html)
- [Agent Memory Storage Six Schools](ch04/099-agent-memory.html)
- [Self-Evolution GUI Agents Memory](../ch03/046-agent.html)
- [State of Memory in Agent Harness Mem0 2026](../ch05/039-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/remember-when-it-matters-proactive-memory-agent-long-horizon-wu-meta-2026.md)

---

