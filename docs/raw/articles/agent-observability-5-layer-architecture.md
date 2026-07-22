---
title: "Agent可观测体系拆解"
source_url: "https://www.xiaohongshu.com/explore/6a044cb40000000036033a76"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, agent, observability, llmops, evaluation, trace, monitoring]
ingested: 2026-07-02
sha256: e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6
---

# Agent可观测体系拆解

## Agent 生产翻车三大问题

1. 突然乱调用工具
2. 用户问 A 却回答 B（RAG 召回 vs 模型幻觉）
3. 成本暴涨，哪个子 Agent 在烧钱

## 五层可观测体系

### 1. 运行层 + 遥测采集层
把"过程"变成数据。Agent 的每一次推理、工具调用、检索、子 Agent 协作，都要被无侵入地采集。

### 2. 数据处理管道
原始 trace 包含：用户隐私（手机号、地址）、模型返回的杂乱内容、工具返回的冗余 JSON。
管道要做：清洗、脱敏、关联聚合。

### 3. 评测层 + 评测引擎
引入生产环境自动评测 + LLM-as-a-Judge。五维评分：
- **正确性**（答案对不对）
- **相关性**（有没有胡扯）
- **幻觉检测**（事实冲突）
- **工具选择**（该用计算器却问了 LLM）
- **计划质量**（多步任务是不是走偏了）

### 4. 数据存储与处理层
| 数据类型 | 存储方案 | 选型理由 |
|---------|---------|---------|
| Trace | ClickHouse | 写入快，按 trace_id 点查快 |
| 日志 | Loki | 便宜，与 Prometheus 生态一体 |
| 向量 | Vector DB | 追溯检索片段 |
| 评测结果 | PostgreSQL | 支持 score + model_name + version 索引 |

### 5. 可视化与消费层
- 开发人员：Trace 详情、单步耗时、工具调用参数
- 运维：告警（幻觉率 >5% / 单次 cost >$0.5）、仪表盘
- 产品/管理：成本趋势、质量分数、用户满意度
- 安全/合规：审计日志、隐私泄漏检测结果

## 最难的事：评测基准不漂移

1. LLM-as-a-Judge 觉得好的答案，换了 Judge 模型又不认
2. 优化了 Correlation，却伤害了 Plan Quality

解决办法：
- 固定若干个黄金评测集（永不变化）
- 每次评测同时跑黄金集 + 生产采样，看"相对退化"
