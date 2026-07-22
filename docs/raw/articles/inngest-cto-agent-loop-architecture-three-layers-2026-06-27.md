---
title: "Agent Loop 架构：Loop + Skill + Orchestrator 三层模型"
source_url: https://mp.weixin.qq.com/s/0vELFAO3AM3Dw2YuZzSm8A
author: Inngest CTO
published: 2026-06-27
ingested: 2026-06-27
type: raw
tags: [agent-loop, durable-execution, orchestration, skill, checkpoint, self-building-agent, inngest]
review_value: 8
review_confidence: 9
review_recommendation: ingest
sha256: pending
---

> 来源：Inngest CTO 文章（经翻译整理）

Agent Loop 架构三层模型：Loop（cron + 决策者）→ Skill（耐久 workflow）→ Orchestrator（执行引擎）。

核心论点：
- 耐久性不是 loop 的一个属性，它属于支撑 loop 的整个执行层
- "放进容器里跑"只能给你 uptime，不能给你正确性
- step 级 checkpoint 不只是正确性功能，也能省钱（避免重复 LLM 调用）
- agent 可以编写自己的耐久 skill 并部署到编排引擎（orchestration-aware agent）
- 每个 skill 都是被编码成可执行基础设施的组织知识，会复利

三层架构：
1. Loop = cron + LLM 决策者 + 耐久执行步骤
2. Skill = 耐久 workflow，可重试、可组合、可独立部署
3. Orchestrator = 调度、执行步骤、管理重试、并发限制、存储历史、热部署

耐久执行六要素：Independent step retry / Sub-agent lifecycle / Guaranteed event delivery / Post-hoc observability / Hot-deploy without downtime / Concurrency control

自建 Skill Agent 流程：人提需求 → agent 编写 skill → agent 部署（sidecar 热加载）→ skill 自主运行 → review loop 评估表现 → agent 迭代改进

复利框架（引用 Satya Nadella）：人力资本 + token capital 一起复利。护城河不是模型，而是 loop。

参考：Matt Van Horn agent loop 演进 / Addy Osmani loop engineering / @runes_leo "管理 agent loop 成本最高"
