# Ch14 数据工程

> AI 的燃料：实时入湖、流处理、数据质量

> 本章收录 **29 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 26 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |

---

## 导读

没有好数据，就没有好模型。

本章覆盖 AI 系统背后的数据工程：阿里云 Kafka × Iceberg 零 ETL 实时入湖、CDC（Change Data Capture）的 Write-Ahead Log 设计、ClickHouse 大规模摄取、以及 TiDB Cloud 的 Agent-Native 数据库设计。

数据工程看似"底层"，但它直接决定了 RAG 的检索质量、训练数据的新鲜度、以及 Agent 能否访问实时业务数据。

如果你的 AI 系统表现不佳，先检查数据管道，再检查模型。

---

## Ch14.001 DDoSing Software Delivery Pipelines

→ [独立页面](ch14-001-ddosing-software-delivery-pipelines.html)

## Ch14.002 ClickHouse Ingestion at Scale: An Open-Source Zepto Engineering Story

→ [独立页面](ch14-002-clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story.html)

## Ch14.003 Data for AI：明其所耗，知其所因！让每一分 Token 消耗都可量化的全栈实践

→ [独立页面](ch14-003-data-for-ai-明其所耗-知其所因-让每一分-token-消耗都可量化的全栈实践.html)

## Ch14.004 阿里云 Kafka × Iceberg 零 ETL 实时入湖：ApsaraMQ for Kafka × OSS Tables 架构减法

→ [独立页面](ch14-004-阿里云-kafka-iceberg-零-etl-实时入湖-apsaramq-for-kafka-oss-tables-架构减法.html)

## Ch14.005 Good QC for RL Data

→ [独立页面](ch14-005-good-qc-for-rl-data.html)

## Ch14.006 Kimi K2.6 Agent Database：Agent-native时代的数据基础设施竞争

→ [独立页面](ch14-006-kimi-k2-6-agent-database-agent-native时代的数据基础设施竞争.html)

## Ch14.007 Kimi K2.6背后的Agent Database：Agent-native 时代的数据Infra竞争，跟过去30年有何不同

→ [独立页面](ch14-007-kimi-k2-6背后的agent-database-agent-native-时代的数据infra竞争-跟过去30年有何不同.html)

## Ch14.008 Databricks Storage Ecosystem & OpenSharing：企业数据治理从 Migrate Everything 到 Govern Everything 的范式转变

→ [独立页面](ch14-008-databricks-storage-ecosystem-opensharing-企业数据治理从-migrate-everything-到-govern-eve.html)

## Ch14.009 London's police asked Big Tech for comms data over 700,000 times last year

→ [独立页面](ch14-009-london-s-police-asked-big-tech-for-comms-data-over-700-000-times-last-year.html)

## Ch14.010 AI-Enhanced Data Solutions with Database 26ai

→ [独立页面](ch14-010-ai-enhanced-data-solutions-with-database-26ai.html)

## Ch14.011 EVA-Bench Data 2.0: 3 Domains, 121 Tools, 213 Scenarios

→ [独立页面](ch14-011-eva-bench-data-2-0-3-domains-121-tools-213-scenarios.html)

## Ch14.012 LiveKit Agents 语音 AI 框架工程解析

→ [独立页面](ch14-012-livekit-agents-语音-ai-框架工程解析.html)

## Ch14.013 Lightfield AI pipeline generation

→ [独立页面](ch14-013-lightfield-ai-pipeline-generation.html)

## Ch14.014 Amazon Quick: Accelerating the path from enterprise data to AI-powered decisions

→ [独立页面](ch14-014-amazon-quick-accelerating-the-path-from-enterprise-data-to-ai-powered-decisions.html)

## Ch14.015 verify-data：一个端到端的数据验数 Agent Skill

→ [独立页面](ch14-015-verify-data-一个端到端的数据验数-agent-skill.html)

## Ch14.016 LiveKit Agents：给大模型接上麦克风，没你想的那么简单

→ [独立页面](ch14-016-livekit-agents-给大模型接上麦克风-没你想的那么简单.html)

## Ch14.017 Goodfire Predictive Data Debugging：可解释性指导 Post-Training 数据塑形

→ [独立页面](ch14-017-goodfire-predictive-data-debugging-可解释性指导-post-training-数据塑形.html)

## Ch14.018 基于 Amazon Kinesis Data Streams 实现 DynamoDB 历史数据清理与增量同步

→ [独立页面](ch14-018-基于-amazon-kinesis-data-streams-实现-dynamodb-历史数据清理与增量同步.html)

## Ch14.019 Stop Giving Your Agents Database Credentials — Agent Data Governance Patterns

→ [独立页面](ch14-019-stop-giving-your-agents-database-credentials-agent-data-governance-patterns.html)

## Ch14.020 AI 驱动的大数据工程：从平台驱动到 AIDLC 的范式迁移

→ [独立页面](ch14-020-ai-驱动的大数据工程-从平台驱动到-aidlc-的范式迁移.html)

## Ch14.021 SQL NOT IN 与 NULL 的经典陷阱：De Morgan 定律到解析器行为

→ [独立页面](ch14-021-sql-not-in-与-null-的经典陷阱-de-morgan-定律到解析器行为.html)

## Ch14.022 GitHub Multilingual Repositories Dataset — 4000 万仓库多语言元数据

→ [独立页面](ch14-022-github-multilingual-repositories-dataset-4000-万仓库多语言元数据.html)

## Ch14.023 DataComp for Language Models

→ [独立页面](ch14-023-datacomp-for-language-models.html)

## Ch14.024 Transforming rare cancer research with Amazon Quick: Integrating biomedical databases for breakthrough discoveries

→ [独立页面](ch14-024-transforming-rare-cancer-research-with-amazon-quick-integrating-biomedical-datab.html)

## Ch14.025 Amazon Quick integration with time-series databases for market intelligence using MCP

→ [独立页面](ch14-025-amazon-quick-integration-with-time-series-databases-for-market-intelligence-usin.html)

## Ch14.026 Metric Semantic Layer: How Lyft Governs and Scales Key Data Definitions

→ [独立页面](ch14-026-metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.html)

## Ch14.027 Write-Ahead Intent Log: a Foundation for Efficient CDC at Scale

→ [独立页面](ch14-027-write-ahead-intent-log-a-foundation-for-efficient-cdc-at-scale.html)

## Ch14.028 The Data Operating System for the Foundation Model Era — Data Juicer

→ [独立页面](ch14-028-the-data-operating-system-for-the-foundation-model-era-data-juicer.html)

## Ch14.029 ai 驱动的大数据工程 从平台驱动到 aidlc 的范式迁移

→ [独立页面](ch14-029-ai-驱动的大数据工程-从平台驱动到-aidlc-的范式迁移.html)

