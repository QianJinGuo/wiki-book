---
title: "一个多 Agent 零人工运维系统的设计复盘：4 个 Agent、7 个 Skill 与 9 条工程判断"
source_url: "https://mp.weixin.qq.com/s/oxIuX6WJhSmzh_0gdxFi8w"
author: 席翁 / 盈楹 (GOAI 大赛)
platform: WeChat
ingested: 2026-07-29
slug: opspilot-zero-multi-agent-ops-9-judgments
sha256: 4924f5c88debe736a6dda35745e47211de8dda89013a7ad8ce7cb1ed2a0f6f4f
---

OpsPilot Zero —— 一个刻意做小的多 Agent 零人工运维 Demo，面向 GOAI 大赛 Agent Infra 赛道的最小参考实现。

## 系统架构

4 个 Agent 顺序协作：
- **Alert Intake Agent**：归并客诉/告警/监控信号为可追踪的事故对象
- **RCA Analyst Agent**：关联日志/Trace/配置变更/慢 SQL/Runbook，排序根因候选
- **Remediation Planner Agent**：生成修复计划+回滚点+风险分级
- **Recovery Verifier Agent**：执行自动化动作+探针验证+事故报告

7 个 Skill：alert-fusion、impact-mapping、log-trace-rca、data-advisor、remediation-plan、risk-guard、recovery-verify

## 9 条工程判断

1. Skill 必须有 Guardrail 段（不允许单条证据下结论）
2. 至少两条独立证据才能给结论
3. 风险分级做 L0-L3 四档（只读/可回滚/需人审/仅生成方案）
4. Mock 与真实工具共用 Schema
5. Prompt/Skill/AgentSpec 必须走向 Registry
6. 报告必须有"缺失证据"段
7. "跑一次"和"跑一万次"是两个工程问题（评估集/稳定性/幂等性）
8. 可回滚性比自动化率更重要
9. 承认边界比假装全能更有工程价值

## 局限
数据全 mock、Spec 全内联、无评估集、无 Trace 看板、仅单一云环境

## 场景验证
db.pool.maxSize 误改和慢 SQL 两种事故，mock 环境下 12 分钟全流程闭环
