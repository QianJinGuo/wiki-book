---
source_url: https://arxiv.org/abs/2608.01964
ingested: 2026-09-01
sha256: ce534c4fd69b47086b724cdcf7af10faad54f44b025c13bd67ab6975d58f200a
source_published: 2026-08-03
title: "LongHorizon-Harness: Advancing LongHorizon Agents for Real-World Tasks"
author: "Ziyu Ma, Hailang Huang, Shun Zou, Yong Wang, Shidong Yang, Yiming Hu, Fei Wei, Xiangxiang Chu"
feed_name: arXiv
---

# LongHorizon-Harness: Advancing LongHorizon Agents for Real-World Tasks

> arXiv:2608.01964v1 [cs.CV] 3 Aug 2026
> DreamX Team, Alibaba Group
> GitHub: https://github.com/AMAP-ML/LongHorizon-Harness
> Website: https://lh-harness.pages.dev

## 摘要

大语言模型（LLM）Agent 日益承担需要持续推理、工具使用和跨多步修正的长时程任务。然而，现有 agent harness 在不断增长的上下文中维护任务执行、任务状态和完成评估，使状态难以追踪，且允许错误的自我评估传播到后续决策中。本文将长时程执行重新定义为任务状态管理问题，提出 LongHorizon-Harness，在执行之外显式维护任务状态，仅用从环境独立验证的事实来更新状态。

## 核心方法：Manage-Execute-Audit (MEA) 循环

LongHorizon-Harness 通过 MEA 循环处理长时程任务：

**Manager（管理者）**：读取当前任务状态，定义一个子任务及其依赖、约束和验收标准。Manager 不直接接触计算环境——不能观察应用状态、检查工作区内容、调用 GUI/CLI 工具或修改环境。其决策完全基于任务状态和审计员记录的环境证据。

任务状态是结构化记录集合：requirement（目标/约束）、artifact（执行中创建/修改的输出）、fact（后续轮次需要的环境信息）。每条记录标记为 completed/pending/blocked/untrusted，保留审计证据引用。Manager 不直接改变持久状态——记录仅在有清洁审计证据支持时才标记为 completed。

**Executor（执行者）**：在全新、有预算限制的上下文中执行子任务，是唯一被允许有意修改环境的角色。每轮执行结束后，原始交互轨迹和内部推理被丢弃，仅转发执行报告 oi 供审计。GUI 和 CLI 执行者通过不同环境接口操作，harness 仅暴露分配给所选执行者角色的环境接口和工具集。

**Auditor（审计者）**：只读角色，独立检查环境以确定发生了什么变化、完成了什么、哪些需求未满足。审计报告记录三类发现：完成状态（complete/incomplete/blocked）、完整性状态（clean/suspect/violation）、以及事实发现。审计结论必须基于直接从环境获取的证据，而非执行者的完成声明。

**AgentAdapter**：轻量级适配层，支持可互换的模型和 harness 后端，无需修改其原生 agent 循环。支持 Claude Opus、GPT、Qwen 等模型，以及 Codex CLI、Claude Code、OpenClaw、Hermes Agent 等 harness。

## 三大挑战

1. **复合错误与目标漂移**：早期动作或决策中的错误沿轨迹累积，扭曲后续选择，逐渐将 agent 偏离原始目标
2. **上下文腐烂**：交互历史增长后，相关信息越来越难检索和使用，性能在上下文利用率超过临界阈值后急剧下降
3. **任务状态丢失**：长时程任务需要准确且最新的任务状态才能完成，但 agent 往往无法在整个执行过程中恢复、保留和更新此状态

## 现有 harness 的结构性局限

1. 任务执行和任务状态管理共享同一增长的上下文——agent 用同一上下文执行任务和维护状态，增长的执行历史使任务状态越来越难追踪
2. 任务执行和完成评估保持耦合——agent 执行每个子任务并判断是否完成，错误判断可能被记录为任务状态的一部分并用作后续决策的前提

## 实验结果

### WeaveBench（114 任务，GUI+CLI 协调）

| 模型 | Harness | PassRate | Overall |
|------|---------|----------|---------|
| Qwen 3.7-Plus | Claude Code（基线） | 51.8% | 0.702 |
| Qwen 3.7-Plus | LongHorizon-Harness (Claude Code) | **80.7%** | **0.835** |
| Claude Opus 4.7 | Claude Code（官方） | 41.2% | — |

LongHorizon-Harness 将 Qwen 3.7-Plus 的 WeaveBench PassRate 从 51.8% 提升到 80.7%，几乎翻倍了 Claude Opus 4.7 官方最佳结果 41.2%。在所有八个任务领域均有提升。

### Terminal-Bench 2.1

| 模型 | Harness | Success Rate |
|------|---------|-------------|
| Qwen 3.7-Plus | Claude Code（基线） | 69.7% |
| Qwen 3.7-Plus | LongHorizon-Harness (Claude Code) | **77.2%** |

### OSWorld 2.0（108 桌面工作流任务，中位人工完成时间 ~1.6 小时）

| 模型 | Harness | Binary | Partial |
|------|---------|--------|---------|
| Qwen 3.7-Plus | 基线 | 2.8% | 21.5% |
| Qwen 3.7-Plus | LongHorizon-Harness | **8.3%** | **35.2%** |

OSWorld 2.0 34 任务子集（Claude Opus 4.7）：从 20.0% 提升到 34.3%。

## 关键设计洞察

1. **状态外置**：任务状态在执行之外显式维护，仅用独立验证的事实更新——executor 的声明不直接改变持久状态
2. **新鲜上下文执行**：每轮 executor 在全新上下文中运行，不接收前几轮的原始交互轨迹——只有审计报告跨轮持久化
3. **审计隔离**：审计者独立检查环境，结论基于直接环境证据而非执行者声明——检测到工作区变更时记录为完整性违规
4. **可互换后端**：AgentAdapter 让同一框架支持不同模型和 harness，证明增益来自框架设计而非特定模型能力

## 实现细节

- Executor 每轮预算 1800 秒，Manager 和 Auditor 各 300 秒
- 支持 GUI 和 CLI 两种执行者角色，根据子任务所需的主要环境转换路由
- 审计报告是唯一的跨轮记忆，executor 的原始交互轨迹每轮丢弃
