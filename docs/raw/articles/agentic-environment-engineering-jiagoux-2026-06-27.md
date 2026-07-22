---
title: "Harness 还没退场，Environment 已经成了下一层门槛"
source_url: https://mp.weixin.qq.com/s/WaH2ouRp9VZ-EkV4ImJCEg
author: 架构师（JiaGouX）
published: 2026-06-27
ingested: 2026-06-27
type: raw
tags: [agent, environment-engineering, harness, loop-engineering, self-harness, pomdp, feedback-loop]
review_value: 8
review_confidence: 8
review_recommendation: ingest
sha256: pending
---

> 来源：微信公众号「架构师（JiaGouX）」

Agent 工程焦点外移：从 Prompt → Context → Harness → Loop → Self-Harness → Environment Engineering。

核心论点：
- Harness 解决 Agent 怎么跑（工具、上下文、权限、状态、日志、验证、停止条件）
- Environment 解决 Agent 跑在什么世界里（状态、动作、观察、反馈、副作用）
- 环境反馈不可靠时，Loop 跑得越勤、Self-Harness 改得越积极，错误被强化越快
- 短期 Harness 仍是控制面，长期 Environment 决定 Agent 能否拿到高质量反馈

中科院自动化所 63 页长文：Agentic Environment Engineering for Large Language Models
四个工程动作：建模 → 合成 → 评估 → 演进

环境评估四维度：Correctness / Diversity / Complexity / Fidelity

小环境契约模板（Environment Contract）8 要素：
Name / Goal / Readable state / Writable state / Allowed actions / Blocked actions / Evaluators / Budget / Memory policy / Human handoff

线索合流：Addy Osmani Loop Engineering / Boris Cherny Claude Code / Karpathy autoresearch / 清华 EurekAgent

奖励带偏警告：
- 只奖励最终分数 → Agent 钻规则
- 只看测试通过 → Agent 删测试
- 只看报告完整 → Agent 堆无价值内容
- 没有成本边界 → 长循环烧 token/GPU
