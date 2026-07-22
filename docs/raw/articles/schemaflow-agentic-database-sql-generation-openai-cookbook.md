---
title: "SchemaFlow: Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails"
source: rss
source_url: https://developers.openai.com/cookbook/examples/partners/schemaflow_design_guide/schemaflow_cookbook
ingested: 2026-06-09
sha256: pending
author: OpenAI Cookbook (partner: SchemaFlow)
tags: [agent, harness, openai, sql, eval, ratchet, pydantic, guardrails]
type: article
review_value: 8
review_confidence: 9
review_recommendation: strong
review_stars: 4
---

# SchemaFlow: Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails

> 原文存档：OpenAI Cookbook 合作伙伴示例，演示 staged agentic workflow 用于数据库变更影响分析 + SQL 生成 + 评估护栏。

## 核心定位

OpenAI 官方 Cookbook 的 SchemaFlow 合作伙伴案例，展示**生产级 agentic workflow 的完整架构**——从 PDF 文档 RAG 检索、staged 任务拆分、SQL 生成、影响分析到 Promptfoo 评估护栏。这是 OpenAI 在"agent harness engineering"上的范本演示。

## 关键设计模式

- **Staged agentic workflow**：5 阶段流水线（Parse Change Request → Impact Analysis → SQL Generation → Validation → Eval），每阶段独立可观测
- **Pydantic schema 强类型约束**：所有 stage 输出用 Pydantic model 校验，类型错误立即重试
- **PDF RAG context**：将数据库 schema PDF 文档分块向量化，作为 LLM 上下文的一部分
- **Promptfoo eval guardrails**：用 Promptfoo 做 SQL 安全/正确性评估，失败时阻断执行

## 评估护栏

- **SQL injection detection**：Promptfoo rules 检测危险模式（`DROP TABLE`、`DELETE FROM` 无 WHERE 等）
- **Schema drift check**：生成的 SQL 与目标 DB schema 实时比对
- **Cost/latency budgets**：每个 stage 单独监控 token 用量和响应时间
- **Regression suite**：固定测试集确保迭代不破坏已有功能

## 实践启示

1. **Harness = staged pipeline + 强类型 schema + 评估门**：不是单次 LLM 调用，而是 5 个独立 stage 串起来的工程化系统
2. **官方 Cookbook 是 harness 范本**：Anthropic、OpenAI 都在用 staged agentic workflow 解决复杂任务，单 prompt 是 2024 范式
3. **Eval guardrails 不是可选**：生产 SQL 生成必须配合 Promptfoo 之类的 evaluator，否则 hallucination 直接进生产库

## 原文链接

[SchemaFlow Cookbook](https://developers.openai.com/cookbook/examples/partners/schemaflow_design_guide/schemaflow_cookbook)
