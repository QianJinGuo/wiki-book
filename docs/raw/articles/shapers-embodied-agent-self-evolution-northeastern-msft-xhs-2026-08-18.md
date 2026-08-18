---
title: "微软团队推出具身 Agent 自进化框架 SHAPER"
source_url: https://www.xiaohongshu.com/explore/6a81bd23000000002403c4cb
source: xiaohongshu
author: AIChannel（大模型知识分享）
publish_date: 2026-08-18
ingested: 2026-08-18
type: raw-article
tags: [agent, embodied, self-evolution, xiaohongshu, shaper, microsoft, paper]
sha256: 370ef25e2190f4326f97a0c47ea551fbf2c59b698e51110d963132cd2b43849b
review_value: 6
review_confidence: 5
---
# 微软团队推出具身 Agent 自进化框架 SHAPER

> AIChannel（大模型知识分享解读号）解读东北大学+微软 SHAPER 论文。

## 背景
- 具身 agent 多构建为围绕基础模型的系统，性能取决于模型权重 + 围绕模型的技能/上下文/动作接口/执行 harness。
- SFT/RL 可让 agent 适应新环境，但需额外数据/奖励/训练；免训练代码中心方法依赖可编程机器人 API，在固定接口场景可能不可用。

## SHAPER
- 用于免训练具身适应的自进化框架。保持模型参数冻结，通过在目标环境 rollout 演化可复用的技能和上下文代码 harness，改进非参数化 agent 系统。
- 同一冻结模型同时充当规划者和优化者，不更新参数持续优化外部技能和上下文代码 harness。

## 评估
- 在 VLABench 和 ESI-Bench 评估，覆盖不同底层动作接口的具身 agent；对比纯执行、SFT、无验证器选择/投票等 test-time-scaling 基线。
- 结论：当模型训练成本高/不可用/不理想时，skill 与 harness 联合优化是实现自进化具身 agent 的实用路径。
