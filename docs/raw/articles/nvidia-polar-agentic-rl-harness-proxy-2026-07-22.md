---
title: "NVIDIA 开源 Agentic RL 框架 Polar：支持任意 Harness，零改动 Agent 代码"
source_url: "https://mp.weixin.qq.com/s/4zWgu2bso9U07L3nU7-2Rw"
source_account: "大模型前线观察"
author: "大模型前线观察"
ingested: 2026-07-22
type: raw-article
tags: [nvidia, polar, agentic-rl, reinforcement-learning, rollout, harness, harness-as-environment, proxy, prefix-merging]
review_value: 7
review_confidence: 5
review_vxc: 35
review_decision: raw-only
---

# NVIDIA 开源 Agentic RL 框架 Polar：支持任意 Harness

> **来源**：大模型前线观察
> **评分**：v=7, c=5, v×c=35 → **Raw only**

Polar 是 NVIDIA 研究团队开源的 RL Rollout 框架，核心思路：不在 Agent 内部改动，而是寄生在模型调用边界。

## 核心设计：Proxy 模式

每个基于 LLM 的 Agent 最终都要调模型接口。Polar 在这个边界上插一个 Proxy，把 Agent 的模型 base URL 指向 Polar Gateway，Agent 框架本身零改动。

## 结果数据

| Agent 框架 | 基础得分 | Polar RL 后 | 提升 |
|-----------|---------|-------------|------|
| Codex | 3.8% | 26.4% | +22.6pp |
| Claude Code | 29.8% | 34.6% | +4.8pp |
| Qwen Code | 34.6% | 35.2% | +0.6pp |
| Pi | 34.2% | 40.4% | +6.2pp |

## prefix_merging 效率提升

| 指标 | 传统 per_request | Polar prefix_merging |
|------|-----------------|---------------------|
| Trainer updates | 1,185 | 218 |
| 耗时 | 189.5 min | 35.2 min |
| 加速比 | — | 5.39× |
| GPU 利用率 | 20.4% | 87.7% |

## 三大核心能力

1. **Harness as Environment** — 任何 Agent harness 只需改模型 endpoint 即可对接 RL 训练
2. **Smart Rollout Pipeline** — 自动管理轨迹采集、缓存合并、奖励计算
3. **Rollout as a Service** — 解耦 rollout 与训练，支持异步扩展
