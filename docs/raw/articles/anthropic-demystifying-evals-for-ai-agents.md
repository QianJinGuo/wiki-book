---
title: "anthropic demystifying evals for ai agents"
source_url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
tags: [anthropic, claude]
ingested: 2026-05-01
sha256: 9d67b72967a1404d403f481a4a3dcb83b8d8cd63e7a5ce8248f0d7d9b7ed0e22
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# Anthropic Demystifying Evals for AI Agents
## Core definitions
- task: 一个定义了输入与成功标准的测试用例
- trial: 同一 task 的一次尝试；因为输出有随机性，应该多 trial
- grader: 对 agent 某个方面打分的评分逻辑
- transcript / trace / trajectory: 完整执行轨迹
- outcome: 最终环境状态，而不只是 agent 的口头回答
- evaluation harness: 负责运行 task、记录轨迹、打分和汇总结果的基础设施
- agent harness: 让模型成为 agent 的执行脚手架
## Best-practice takeaways
- 评估 agent 时要同时看 transcript 和 outcome
- 自动评估、生产监控、人类复核应该组合使用
- 尽早开始，小样本也有价值
- 失败案例应不断回流成测试集
- 没有单一评估层能捕获全部问题
## Why it matters for this vault
`wiki-evolver` 不是单轮问答，而是多步 orchestration。因此评估不能只问“答案看起来好不好”，还要看：
- 是否选对 leverage track
- 是否产生 durable outcome
- 是否更新 index/log/navigation
- 是否完成 validation closeout