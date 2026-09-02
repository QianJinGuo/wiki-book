---
title: "终局奖励之后：从Apodex 1.1看长程 Agentic RL 如何分配credit"
source_url: "https://mp.weixin.qq.com/s/wPP8ae2SJ4DfTGVRSwstug"
ingested: "2026-09-03"
sha256: "3809370ed1e1705df837fa4c54557765aceb94e79e53d5a951377ee79e0d4f27"
author: "haotian"
account: "大模型智能"
source_account: "青稞AI"
tags: [credit-assignment, agentic-rl, pivot-rl, sao, value-pretrain, apodex, long-horizon, reinforcement-learning]
---

# 终局奖励之后：从Apodex 1.1看长程 Agentic RL 如何分配credit

> **来源**：大模型智能（青稞AI，haotian）
> **时间**：2026-09-03
> **关联**：Apodex 1.1 Technical Report、Pivot-RL、SAO、value-pretrain

## 核心问题

长程 Agentic RL 中，一个 0/1 终局 reward 应该怎样分配给前面几十轮的决策？把终局 reward 无差别广播给整条轨迹，真正决定结果的少数决策会被大量普通 token 淹没，已经正确的前缀也可能因后期失误一起受惩罚。

## 两级 Credit Assignment

| 层级 | 方法 | 核心问题 | 输出 |
|------|------|----------|------|
| 轨迹片段 | Pivot-RL | 哪个中间状态之后的行为值得重训？ | 需要局部优化的 pivot/continuation |
| 片段内部的 token | SAO | 每个生成 token 应获得多少 credit？ | token-level advantage |

Pivot-RL 先在长轨迹上"圈出重点"，SAO 再在重点片段内部做更细的 advantage estimation。

## Pivot-RL：把终局 reward 定位到关键片段

从当前 policy 自己的 rollout 轨迹中定位候选中间状态，从候选状态展开多条局部 continuation，用 reward mean 和 variance 筛选训练状态。全成功或全失败时组内信号为零，mixed outcomes 对应可区分好坏 continuation 的局部训练信号。

关键设计：
- **functional-equivalent reward**：奖励功能上能把任务继续做对的动作，不复现原轨迹动作字符串
- **corrective hint**：只用于指明局部修正方向，不是 prediction target，推理时不提供
- 局部化 credit assignment 自然产生不规则的异步 rollout 流

## SAO：Single-Rollout Asynchronous Optimization

将采样单位改为每个 prompt 一条 rollout，样本完成后即可进入训练，不再依赖同一 prompt 下其他 rollout 作为 baseline。用 value model 估计 baseline，通过 GAE 计算 token-level advantage。

**Skip-Observation GAE**：直接跨过 observation，将当前 action 末端连接到下一个 action 起点。Credit 在模型真正生成的 action 之间传播，不经过外部环境返回的 token。"给 policy 的决策分配 credit，而不是给环境 observation 分配 credit。"

**异步训练处理 policy lag**：保存采样时 token log-probability 计算 importance ratio，双边 token-level clipping 屏蔽偏离信赖域的更新。

## Value Pretrain：SAO 的 value-model 训练

三类衔接设计：①缓解 cold start ②每次 policy update 对 value model 更新两次 ③frozen-attention 降低梯度不稳定。

## 分层 Credit Assignment 路径

Task verifier 判断整条任务成功与否 → Pivot-RL 定位关键片段 → SAO 在片段内做 token-level advantage estimation → value-pretrain 为 SAO 提供可靠初始 value model。两者不是互相替代的 RL loss，而是两种不同粒度、可互补的 credit-assignment 方法。
