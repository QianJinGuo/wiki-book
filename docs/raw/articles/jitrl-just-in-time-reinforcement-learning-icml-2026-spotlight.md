---
title: "ICML 2026 Spotlight｜Agentic RL 下半场：JitRL——无需梯度更新的即时强化学习"
source_url: "https://mp.weixin.qq.com/s/8hBKVQsjqPka0w9FxVNhaA"
author: "李一博 (NUS PhD, first author) / AI TIME"
platform: WeChat
ingested: 2026-07-29
slug: jitrl-just-in-time-reinforcement-learning-icml-2026-spotlight
sha256: 529665b5f52fda3183cde6f89909b4f7bcbe8c94e46f13f19adf52f43e0df09e
---

论文标题：Just-In-Time Reinforcement Learning: Continual Learning in LLM Agents Without Gradient Updates
论文机构：National University of Singapore
发表会议：ICML 2026 Spotlight
代码仓库：https://github.com/liushiliushi/JitRL
Arxiv：https://arxiv.org/abs/2601.18510

## 一句话

JitRL 把强化学习从"训练时改权重"搬到了"测试时改 logits"。给定当前状态，它从记忆库检索相似的历史轨迹，估出每个候选动作的优势 Â，再用一条加法规则更新 logits：z'(s, a) = z(s, a) + β · Â(s, a)。作者从理论上证明了这条加法规则正是 KL 约束下策略优化目标的精确闭式解。

## 背景与动机

LLM Agent 权重一旦部署就被冻结了，无法像人类一样"现学现用"。Hendrycks 等人在 2025 年提出的 AGI Score 也印证了：当前 AI 系统最大的短板正是持续学习新信息的能力。

现有两条路都不顺：
- 传统 RL：通过策略梯度不断更新权重，但代价高、需要海量数据、容易灾难性遗忘
- 上下文学习（ICL）：把过去的经验写进 prompt，但长序列交互中上下文越堆越长，模型反而抓不住重点，更缺少 RL 那种掌握"只可意会"技能的普适性

JitRL 给出第三条路：不重新训练，也不更新任何梯度，维护一块"非参数记忆"，在推理时检索相关经验、现场估计动作优势，并把优势直接加到大模型的输出 logits 上。

## 方法

### 核心思想

标准 RL 在训练时用历史轨迹做策略梯度更新；JitRL 把这套逻辑搬到测试时。维护动态记忆库，存 <状态, 动作, 回报>三元组。遇到当前状态时做三件事：
1. 检索：从记忆库捞出与当前状态相似的历史经验
2. 估计优势：用这些经验现场算出每个候选动作的优势
3. 调整 logits：把优势值直接加到模型输出 logits 上（零梯度更新）

### 记忆构建

每个 episode 结束后，基于 LLM 的 Evaluator 回看整条轨迹，给每一步动作打分（step-wise reward），借助大模型自身的反思能力解决长轨迹的信用分配问题。打完分后用折扣因子把即时奖励聚合成折扣回报 G_t，以 (s_t, a_t, G_t) 形式存入记忆。

### 测试时价值估计

推理时，把当前观测抽象成结构化状态 s，检索 top-k 个最相似的邻居 N(s)：
- 状态价值 V(s)：邻域内所有回报的平均
- 动作价值 Q(s, a)：邻域内执行了同一动作的样本回报平均
- 没见过的动作：用"不确定性下的乐观主义"给一个探索奖励 α/|N(s)|（记忆越稀疏奖励越大、鼓励探索）
- 优势：Â(s, a) = Q(s, a) - V(s)

### 理论保证

加法更新规则并非启发式，而是有严格理论依据。作者把推理时的调整建模成带 KL 约束的优化问题：在最大化期望优势的同时限制新策略别偏离原模型 π_θ 太远（保住语言连贯性）。它的闭式解是：π*(a|s) ∝ π_θ(a|s) · exp(β · A(s, a))，取对数后正好变成加法 logits 更新规则（定理 4.1）。

进一步证明：价值与优势估计会收敛到真实值（定理 4.2），整体策略更新会收敛到最优策略（定理 4.3）——在非平稳设定下也成立。

## 实验与结果

### 环境
- WebArena：真实网页环境，复杂 DOM 树中执行连续动作
- Jericho：纯文本交互冒险游戏（Library、Zork1、Zork3）

### 对比方法
- Training-free：Static、Memory、Reflexion、AWM、EvoTest
- Weight-update：SFT、WebRL、GRPO

### 关键结果
- WebArena 全面领先 training-free 方法。Shopping 域相比 Static 提升高达 +73.2%
- 反超 weight-update 的 WebRL，成本便宜 30 倍（$9900 vs $290）
- Jericho 三款游戏："前 10-15 个 episode 快速起飞，越往后与基线差距越大"

## 意义

1. 把持续学习的成本量级打了下来——weight-update 方法动辄上万美元的训练开销，被可检索的非参数记忆替代
2. 把"改 logits"从经验技巧提升为有最优性保证的操作，可解释、可迁移
3. 实验上刷新 training-free SOTA，反超重金训练的 WebRL
