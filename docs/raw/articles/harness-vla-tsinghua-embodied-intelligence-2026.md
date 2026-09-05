---
source_url: "https://mp.weixin.qq.com/s/jt5KZ0pYDzUn7i4u6Nn3qg"
title: "具身智能或进入token时代，清华团队提出Harness VLA引领范式变迁"
source: "机器之心"
author: "机器之心"
ingested: 2026-07-22
sha256: f7b295e1862c324f9e6738e6ce62418de9c9dde303a58a743b4a9c5ca8921264
type: raw-article
tags: [harness, vla, embodied, robotics, tsinghua, open-source]
---

# 具身智能或进入token时代，清华团队提出Harness VLA引领范式变迁

> 机器之心发布

## 摘要

今天，清华大学于超教授团队联合正行创新、无问芯穹，正式发布并开源 Harness VLA，这一技术成果首次将数字智能中广泛应用的 Harness Layer 引入具身智能系统，在保持 VLA 模型冻结的基础上，通过 Agentic Planner 对模型调用、任务执行和失败恢复进行统一组织，让机器人从「依赖单一端到端模型」迈向「模型能力与系统能力协同工作」的新架构，显著提升机器人在复杂真实环境中的泛化能力。

在更具挑战性的 LIBERO-Pro 扰动评测中，Harness VLA 将成功率提升至 82.4%，显著超过 Pi_RLinf（50%）、NVIDIA Cap-X（18.2%）和 Berkeley RATS（43.8%），验证了「模型 + 系统」的新一代机器人智能架构的可行性。

更重要的是，Harness 并非针对某一特定模型设计，而是一种面向系统层的通用框架。除了 VLA，它同样能够与 WAM 等具身基础模型结合，通过统一的任务执行层释放不同基础模型的能力，为未来具身智能系统提供更加通用的组织方式。

## 背景：VLA 的泛化困境

过去两年，Vision-Language-Action（VLA）模型几乎已经把机器人操作的标准 Benchmark 的成功率做到了接近饱和。例如，在 LIBERO 130 个任务中训练的 Pi 0.5 模型，平均成功率高达 96%。但当把同样的模型部署在有目标重绑定与布局扰动的 LIBERO Pro 环境中，96% 成功率锐降至 50%。

尽管动作依然流畅，局部操作本身也没有明显错误，但由于目标绑定、空间关系或任务阶段判断出现偏差，最终整个任务仍然会失败。这也是当前 VLA 最核心的挑战之一：泛化能力不足。模型能够完成训练过的任务，却很难稳定适应真实环境中的细微变化。

## 核心洞察：数字智能的 Harness Layer 类比

面对这一问题，一个自然的思路是继续扩大模型规模、收集更多数据。但数字智能的发展提供了一个值得借鉴的答案。以 Claude Code、Codex 等 Coding Agent 为代表的新一代 AI 系统，能力提升并不仅仅来自更大的语言模型，更来自模型之外新增的一层执行组织系统（Harness Layer）。语言模型负责生成，而 Harness 持续维护上下文、调用工具、处理失败，并决定模型在什么时候、以什么方式参与任务。

## Harness VLA 架构

Harness VLA 给出的核心答案不是训练一个更大的端到端 VLA，而是让冻结的 VLA 专注于最擅长的接触密集操作，并通过一层 Harness Layer 学会如何组织、调用和复用它。

### 两层 Primitive

- **VLA_ACT Primitive**: 封装底层 VLA，主要负责抓取、放置、按钮按压、抽屉/门操作等难以解析建模的接触密集行为
- **Analytic Primitives**: MOVE_TO、ROTATE_WRIST、SET_GRIPPER、RELEASE 等，负责稳定的空间移动、位姿调整、运输和释放

### Agentic Planner

真正的关键不只是把这些 Primitive 放在一起，而是让 Agentic Planner 在闭环交互中学习它们的使用边界：哪些阶段应交给 Analytic Primitive，哪些局部接触应交给 VLA_ACT Primitive，VLA_ACT Primitive 调用前需要怎样调整视角和预接触位姿，以及一次接触失败后应如何重新 Staging 并再次尝试。

### 两阶段生命周期

1. **探索式自举阶段**（Exploratory Bootstrapping Phase）：通过环境反馈不断试错，记录成功的 Primitive 组合轨迹，并将其抽象为 Task Specific Memory；同时把跨任务可复用的成功规则和失败模式沉淀到 Global Memory 中。
2. **严格的部署评估阶段**（Deployment Evaluation Phase）：在新的布局或任务扰动测试下，Agentic Planner 不会机械地重复旧坐标，而是利用当前观测重新绑定目标和空间位置，再根据已有 Memory 组织 Analytic Primitive 与 VLA_ACT Primitive 的组合。

底层 VLA 始终保持冻结，但 VLA 被调用的时机、条件和上下文不断被 Harness 优化。

## 实验结果

### LIBERO-Pro

| 方法 | 成功率 |
|------|--------|
| Frozen VLA (Pi_RLinf) | 50.0% |
| Harness VLA (CC) | **82.4%** |
| NVIDIA Cap-X | 18.2% |
| Berkeley RATS | 43.8% |

涵盖 SPATIAL、OBJECT、GOAL 和 LIBERO-10 四类任务，分别考虑指令重定向（T）和位置交换（S）两类扰动。

### RoboCasa365

家庭厨房长程任务，使用冻结的 RLDX-1 模型：

| 场景 | RLDX 基线 | Harness VLA |
|------|-----------|-------------|
| ATOMIC-SEEN | 60% | **91.6%** |
| COMPOSITE-SEEN | 21.3% | **56.3%** |
| COMPOSITE-UNSEEN | 5% | **15%** |

### RoboTwin C2R

从 Clean 场景到 Randomized 场景的零样本迁移：
- Harness VLA: **58.4%**
- pi0.5: 47.9%
- GR00T-N1.7: 20.7%
- StarVLA: 10.6%

### 零样本评估（LIBERO-Pro Goal）

Harness VLA 在不依赖记忆检索的零样本设定下也优于 Cap-X：
- 位置交换（Pos-S）: 31.0%（Cap-X 25.6%）
- 指令重定向（Task-T）: 79.0%（Cap-X 16.8%）

## 设计哲学：82.4% 背后的三件事

### 1. 让 VLA 作用在正确的目标上

当指令重新指定目标或物体交换位置后，Harness VLA 会由 Agentic Planner 根据当前任务指令和 RGB-D 观测重新判断应该操作谁、目标位于哪里，再据此组织后续动作，而非像端到端 VLA 那样延续训练时熟悉的目标。

### 2. 让 VLA 在合适的状态中被调用和再次调用

Harness 学到的不是新的底层动作技能，而是如何为 Frozen VLA 创造更合适的调用条件。调用前先调整空间关系和视角；调用后根据反馈决定是否需要重新调整状态再次调用。

### 3. Analytic Primitives 将非接触执行从 VLA 中剥离

机器人任务并不是从头到尾都需要学习型视觉运动控制。真正依赖 VLA 的通常是局部接触密集阶段，而大量中间过程更适合由稳定、可控、可重复的 Analytic Primitives 完成。

## RPent 开源生态

Harness VLA 正式开源，并作为 RPent（Recursive Physical Agent，https://github.com/RLinf/RPent）开源生态中的首个核心项目发布。RPent 是由清华大学于超教授团队联合正行创新、无问芯穹共同发起的新一代具身智能开源项目。此前推出的 RLinf 已成为全球首个面向具身智能大规模强化学习的开源基础设施，GitHub Star 超过 4,100，入选 PyTorch Ecosystem，并被 NVIDIA 官方收录。

RPent 以「服务化、标准化、组合化」为核心设计理念，将模型、机器人、技能、记忆与环境统一纳入智能体基础设施。

## 链接

- 论文: https://arxiv.org/pdf/2607.08448
- 项目主页: https://harnessvla.github.io/
- GitHub (RPent): https://github.com/RLinf/RPent
