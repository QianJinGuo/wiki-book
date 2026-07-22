---
title: "大模型训练省钱秘籍：清华POPO一招组级回放，把浪费的算力全部捡回来"
source_url: "https://mp.weixin.qq.com/s/3vzTIiAgp3BID9E1lO5MhQ"
author: "POPO团队投稿 / 量子位"
feed_name: "量子位 | QbitAI"
publish_date: 2026-07-05
created: 2026-07-05
ingested: 2026-07-05
tags: [llm, rlvr, grpo, dapo, popo, off-policy, reinforcement-learning, training, efficiency, reasoning, tsinghua, wechat]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 8f465e93c3617d6e8e3a457ffa73155441c31cb4004def9e7a1e0982bb7d0404
---

# 大模型训练省钱秘籍：清华POPO一招组级回放，把浪费的算力全部捡回来

##### POPO团队 投稿
量子位 | 公众号 QbitAI

大模型做强化学习后训练，最贵的是什么？

很多时候，不只是反向传播，而是一次又一次让模型生成长链推理答案，也就是rollout。

尤其在 RLVR（Reinforcement Learning with Verifiable Rewards，可验证奖励强化学习）里，模型需要对每个prompt生成多条回答，再根据答案是否正确获得奖励。

看起来很自然：答案对了给1，错了给0，然后让模型从奖励里学习。

但真实训练中有一个很容易被忽略的问题：

**并不是每一组rollout都真的有训练信号。**

如果一个prompt下的多条回答全部正确，奖励全是1；如果全部错误，奖励全是0。对于GRPO这类组内归一化算法来说，这两种情况都会导致reward方差为0，优势项几乎消失。

换句话说，模型花了大量算力生成答案，但这些样本对参数更新几乎没有贡献。

针对这一问题，来自清华大学自动化系的研究者提出了 **POPO（Group Prioritized Off-Policy Optimization）** ，一个面向LLM reasoning RLVR训练的高效off-policy优化框架。

一句话概括：**POPO不再为无效样本额外做更多rollout，而是把当前batch里的无效组替换成最近缓存过的高质量有效组，并通过解耦式off-policy重要性采样稳定更新，从而用更少rollout获得接近DAPO的训练效果。**

实验显示，在数学推理、数值规划、视觉几何三类任务上，POPO都能显著提升RL微调效率。在DeepScaleR数学任务上，POPO只使用约30%的rollout预算，就能达到与高资源DAPO接近的性能；在DSR-7B上，POPO的数学分布内平均分达到**63.3**，略高于DAPO的**63.2**，但训练时间从DAPO的**55h**降到**34h**。

## RLVR有奖励，但很多样本其实"学不到东西"

RLVR的核心优势，是奖励可以被自动验证。

在GRPO等方法中，模型通常会对同一个prompt生成一组回答，然后在组内计算相对优势。

如果这组回答中有的对、有的错，奖励有差异，模型就能知道哪些轨迹更值得强化。

但如果一组回答全部正确，或者全部错误，奖励没有方差，组内相对优势就会退化。

论文把这种情况定义为 **ineffective sample（无效样本）**：**当同一个prompt的response group中所有回答奖励方差为0时，这个样本对RLVR优化几乎没有有效训练信号。**

这类无效样本在RLVR中非常常见。太简单的题全部答对，太难的题全部答错。两者都会消耗rollout，却无法提供有效梯度。

## 现有方法的局限

| 方法 | 思路 | 代价 |
|------|------|------|
| Active sampling (DAPO) | 扩大候选batch，额外rollout，过滤无效组 | 需要大量额外rollout |
| Predictive sampling (MoPPS) | rollout前预测prompt成功率，优先选中难度 | 成功率漂移快，历史信息稀疏 |
| Trajectory replay | 缓存历史成功轨迹，失败时插入 | 组内一致性被破坏，off-policy bias难处理 |

## 核心方法：组级回放 + 解耦式off-policy优化

### 设计一：Prioritized Group Replay（优先级组回放）

POPO维护一个小型replay buffer，存放最近训练过程中遇到的有效response group。

每步训练时：
1. 模型先正常对当前batch做rollout
2. 根据奖励方差把response group分成有效组和无效组
3. 保留有效组
4. 对于无效组，从replay buffer中取出最近的有效组补齐

**为什么是组级而不是轨迹级？** 历史成功轨迹插入会破坏组内一致性——不同时间点的策略数据混在一起，组内归一化优势估计失效。POPO在group级别回放，一整组responses来自同一个历史策略，组内reward方差非零，且可清晰做off-policy校正。

**选择标准**：(1) 质量——只缓存奖励方差非零的有效组；(2) off-policiness——优先回放最近存入的（FIFO buffer），作为低成本off-policy距离近似。

### 设计二：Decoupled Off-Policy Optimization（解耦式off-policy优化）

回放组是历史策略生成的off-policy数据，不能简单当on-policy数据训练。

POPO把两个角色拆开：
- **行为策略**：说明回放数据由哪个历史策略生成
- **近端约束策略**：约束当前更新不要偏离最近旧策略太远

使用重要性采样校正off-policy bias，同时保持trust-region约束。

## 实验设置

三类reasoning任务：

| 任务 | 模型 | 数据集 |
|------|------|--------|
| 数学推理 | DeepSeek-R1-Distill-Qwen-1.5B/7B | DeepScaleR (40k数学题) |
| 数值规划 | Qwen2.5-3B | Countdown-34 |
| 视觉几何 | Qwen2.5-VL-3B-Instruct | Geometry3k |

对比基线：GRPO、DAPO、MoPPS、ARPO、ReMix、REPO、RR、GRESO。

## 主要结果

| 任务 | 指标 | POPO | DAPO | GRPO |
|------|------|------|------|------|
| DSR-7B 分布内 | 平均分 | **63.3** | 63.2 | — |
| DSR-7B 训练时间 | 小时 | **34h** | 55h | — |
| Countdown | 准确率 | 60.4 | 61.5 | — |
| Countdown | rollout数 | **205k** | 877k | — |
| Countdown | 训练时间 | **3.2h** | 5.6h | — |
| Geometry | 准确率 | 50.0 | 50.6 | — |
| Geometry | rollout数 | **492k** | 1438k | — |
| Geometry | 训练时间 | **6.8h** | 11.2h | — |

POPO通常只需要 **40%-70%** 的训练步数就达到GRPO的最终性能，用约**30%** 的DAPO rollout预算达到接近DAPO的表现。

## 消融实验关键结论

- **POPO-KL**（KL选择replay group）：效果接近，但计算更贵（3.2h vs 4.8h）
- **GRPO-filter**（只过滤不补齐）：略好于GRPO但不如POPO
- **POPO-ineff**（不区分有效/无效组）：性能下降
- **POPO-stale(10)**（从久远历史回放）：性能崩溃
- **POPO-π_old**（回放数据当on-policy）：性能崩溃
- **完整POPO**（解耦式off-policy）：表现最好

## 兼容性实验

- 不同response group size (k=4/8/16/32) 下均稳定优于GRPO
- 与RLOO和PPO结合均有提升
- 与MoPPS等主动采样方法可叠加

## 核心贡献

> 很多rollout并不是因为答案错了才没价值，而是因为一整组答案没有差异，导致算法学不到相对偏好。

POPO的思路：少浪费——训练过程中已经见过有效组，就把最近的高质量有效组缓存起来，替换当前batch中没有训练信号的无效组。为保持稳定性，进一步在group级别保留行为策略一致性，通过解耦式重要性采样修正off-policy bias。
