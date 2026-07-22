---
title: "langsmith evaluation concepts"
source_url: https://docs.smith.langchain.com/evaluation-concepts
ingested: 2026-05-01
sha256: a1f5b3745e9ce0d62bbd1186d1b536ee6a1d2b459f21ad8d79a89c9b8d7c8f33
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---
# LangSmith Evaluation Concepts
## Core takeaways
- 先定义什么叫“good”，再评估
- 对 agent 要拆成 output、retrieval、tool invocation、trajectory 等关键部件
- 先用 5-10 个 curated examples 定义 ground truth
- offline evaluation 适合 benchmarking / regression / backtesting
- online evaluation 适合生产监控与异常发现
- 两者应形成闭环：线上问题 -> 线下数据集 -> 回归验证
## Why it matters for this vault
`wiki-evolver` 当前最适合先做 offline benchmarking：
- 当前 vault 任务可被整理成小规模 curated suite
- 先比较 with/without skill
- 等以后真的高频运行后，再考虑 online monitoring