---
title: "Databend on AWS：面向 AI 的多模态一体化数仓亮相 2026 亚马逊云科技中国峰会"
source_url: "https://mp.weixin.qq.com/s/9ju1Gc_IiQobTJ7k5pyE9w"
ingested: 2026-06-30
sha256: 39ba1f9f5f213f9f188895ae0cb7c6265a65b41773d2fe64695b3f900a5a59d1
type: raw
tags: [databend, aws, lakehouse, agent, trace, memory, vector-search, full-text-search, s3, graviton, bedrock, mcp, ai-udf, real-time-analytics, agentic-ai]
author: Databend
---

6 月 24 日，为期两天的 2026 亚马逊云科技中国峰会在上海世博中心圆满落幕。本届峰会以 "Agentic Now, Go Build" 为主题，聚焦智能体 AI、云原生架构与企业级数据平台等热门方向。

Databend 携面向 AI 时代的数据基础设施方案——"Databend on AWS：面向 AI 的多模态一体化数仓"精彩亮相。

## 用 AI 原生 SQL 驱动 Agent 特征工程

Databend 围绕"用 AI 原生 SQL 驱动 Agent 特征工程"进行产品展示。重点呈现了如何基于 AWS 构建一套"Agent-Ready"的数据平台能力：

- **Amazon S3** 对象存储作为开放的数据基石
- **Amazon EC2 Graviton** 实例提供高性价比计算资源
- **Databend Cloud** 将 SQL 分析、JSON 处理、全文检索、向量检索、实时增量入库与 AI 调用能力融合为统一体验

通过与 Amazon Lambda、Amazon Bedrock 等 AWS 服务的无缝集成，Databend 允许开发者在数据平台内部直接完成 AI UDF（用户自定义函数）处理。同时通过支持 MCP 协议，Agent 可以更自然、高效地查询和调用底层数据。传统多套系统协同的特征工程链路，可收敛为更轻量的"Task + Stream"模式，特征迭代周期从"天级"缩短至"分钟级"。

## Databend on AWS：一份数据，同时支撑分析、检索与 AI 召回

Databend 的核心策略是用一份数据，统一服务数仓分析、Agent 可观测性与 AI 召回。结构化数据、半结构化 JSON、向量数据和全文索引可共存于对象存储之上，由同一 SQL 引擎进行查询和处理。

能力矩阵：
- 高性能 SQL 分析与向量化执行引擎
- VARIANT JSON 原生半结构化数据处理
- 全文检索与倒排索引（Inverted Index）
- 向量检索与向量索引（Vector Index）
- Task + Stream 实时增量数据入库
- 基于对象存储的低成本、弹性扩缩容架构

## 现场 Demo

### Demo 1：Agent Trace 分析与评估归因

Databend 已支撑头部大模型公司的 Agent 轨迹数据底座，生产环境中承载日均数百 TB 级数据写入。核心能力：
- VARIANT 类型原生存取大 JSON 对象
- json_transform 函数库内完成数据清洗与转换
- 虚拟加速列和倒排索引提升检索效率
- JSON Path 级别的 RBAC 和数据脱敏
- 基于 S3 与存算分离架构实现低成本长期保存与高并发持续写入

一份 Trace 数据同时服务于 Eval、Replay、归因分析和训练反馈。

### Demo 2：Agent Memory 大规模召回

当记忆条目达到百亿级别时，传统架构常因向量索引与全文索引分属不同系统导致数据存两份、检索跨系统"两跳"、结果口径难对齐。

Databend 的 Memory Recall 方案将原文、向量和全文索引置于同一张表中，通过单条 SQL 即可完成过滤、召回与匹配的全流程：

| 指标 | 传统架构 | Databend |
|------|---------|----------|
| p99 延迟 | 9.3 秒 | 0.85 秒 |
| 年度总成本 | 31.5 万美元 | 3.7 万美元（约 1/8） |

## 客户案例：沉浸式翻译的实时日志分析平台

北京推文信息科技有限公司旗下的沉浸式翻译（双语对照网页翻译插件）使用 Databend Cloud on AWS 搭建实时日志分析平台：

- 通过 AWS Marketplace 开通 Databend Cloud
- Amazon S3 作为日志中转层
- Vector 组件将日志写入 S3
- Databend Task + COPY INTO 机制实时装载数据
- 预计计算与存储成本降低 80%

## 总结

Databend 与 AWS 的深度结合：基于 S3 原生的云原生架构，将 SQL、JSON、全文、向量、实时入库和 AI 能力融于一个开放、高性能、低成本的统一数据底座。

> 当 Agentic AI 从 Demo 走向生产环境，企业需要的不仅是一个更聪明的模型，而是一套能支撑 Agent 安全、稳定、低成本运行的数据基础设施。
