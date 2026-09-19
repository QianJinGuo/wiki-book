# Ch14 数据工程

> AI 的燃料：实时入湖、流处理、数据质量

> 本章收录 **26 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 3 |
| ⭐⭐ 工程师 | 需编程基础 | 2 |
| ⭐⭐⭐ 专家 | 需ML基础 | 16 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 4 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 1 |

---

## 导读

没有好数据，就没有好模型。

本章覆盖 AI 系统背后的数据工程：阿里云 Kafka × Iceberg 零 ETL 实时入湖、CDC（Change Data Capture）的 Write-Ahead Log 设计、ClickHouse 大规模摄取、以及 TiDB Cloud 的 Agent-Native 数据库设计。

数据工程看似"底层"，但它直接决定了 RAG 的检索质量、训练数据的新鲜度、以及 Agent 能否访问实时业务数据。

如果你的 AI 系统表现不佳，先检查数据管道，再检查模型。

---



---

## 本章内容

### ⭐ 入门（3 篇）

- [001. 使用 Amazon S3 Tables 优化数据湖：从Hudi 迁移到托管 Iceberg](ch14/001-amazon-s3-tables-hudi-iceberg)
- [002. Amazon Quick: Accelerating the path from enterprise data to AI-powered decisions](ch14/002-amazon-quick-accelerating-the-path-from-enterprise-data-to)
- [003. nOps FinOps Agent 架构：语义层驱动的数据分析 Agent 设计](ch14/003-nops-finops-agent-agent)

### ⭐⭐ 工程师（2 篇）

- [004. 构建 AI 时代的知识底座：直播数据 LLM Wiki 实践](ch14/004-ai-llm-wiki)
- [005. GitHub Multilingual Repositories Dataset — 4000 万仓库多语言元数据](ch14/005-github-multilingual-repositories-dataset-4000)

### ⭐⭐⭐ 专家（16 篇）

- [006. ai 驱动的大数据工程 从平台驱动到 aidlc 的范式迁移](ch14/006-ai-aidlc)
- [007. Kimi K2.6背后的Agent Database：Agent-native 时代的数据Infra竞争，跟过去30年有何不同](ch14/007-kimi-k2-6-agent-database-agent-native-infra-30)
- [008. Databricks Storage Ecosystem & OpenSharing：企业数据治理从 Migrate Everything 到 Govern Everything 的范式转变](ch14/008-databricks-storage-ecosystem-opensharing-migrate-everyth)
- [009. Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly](ch14/009-can-we-agree-on-a-storage-workload-architecture-taxonomy)
- [010. ClickHouse Ingestion at Scale: An Open-Source Zepto Engineering Story](ch14/010-clickhouse-ingestion-at-scale-an-open-source-zepto-engineer)
- [011. Write-Ahead Intent Log: a Foundation for Efficient CDC at Scale](ch14/011-write-ahead-intent-log-a-foundation-for-efficient-cdc-at-sc)
- [012. The Data Operating System for the Foundation Model Era — Data Juicer](ch14/012-the-data-operating-system-for-the-foundation-model-era-dat)
- [013. Amazon Quick integration with time-series databases for market intelligence using MCP](ch14/013-amazon-quick-integration-with-time-series-databases-for-mark)
- [014. Metric Semantic Layer: How Lyft Governs and Scales Key Data Definitions](ch14/014-metric-semantic-layer-how-lyft-governs-and-scales-key-data)
- [015. verify-data：一个端到端的数据验数 Agent Skill](ch14/015-verify-data-agent-skill)
- [016. LiveKit Agents：给大模型接上麦克风，没你想的那么简单](ch14/016-livekit-agents)
- [017. DDoSing Software Delivery Pipelines](ch14/017-ddosing-software-delivery-pipelines)
- [018. Goodfire Predictive Data Debugging：可解释性指导 Post-Training 数据塑形](ch14/018-goodfire-predictive-data-debugging-post-training)
- [019. Stop Giving Your Agents Database Credentials — Agent Data Governance Patterns](ch14/019-stop-giving-your-agents-database-credentials-agent-data-go)
- [020. Amazon Redshift 推出集成数据湖查询引擎的 Graviton RG 实例](ch14/020-amazon-redshift-graviton-rg)
- [021. SQL NOT IN 与 NULL 的经典陷阱：De Morgan 定律到解析器行为](ch14/021-sql-not-in-null-de-morgan)

### ⭐⭐⭐⭐ 科学家（4 篇）

- [022. Data for AI：明其所耗，知其所因！让每一分 Token 消耗都可量化的全栈实践](ch14/022-data-for-ai-token)
- [023. Good QC for RL Data](ch14/023-good-qc-for-rl-data)
- [024. EVA-Bench Data 2.0: 3 Domains, 121 Tools, 213 Scenarios](ch14/024-eva-bench-data-2-0-3-domains-121-tools-213-scenarios)
- [025. Moneyball for Physical AI](ch14/025-moneyball-for-physical-ai)

### ⭐⭐⭐⭐⭐ 大师（1 篇）

- [026. 阿里云 Kafka × Iceberg 零 ETL 实时入湖：ApsaraMQ for Kafka × OSS Tables 架构减法](ch14/026-kafka-iceberg-etl-apsaramq-for-kafka-oss-tables)


---

## 本章收束

如果 AI 系统表现不佳，先检查数据管道，再检查模型。这一章证明了一件事：实时、干净、有语义的数据层不是"底层杂活"，而是 RAG 的检索质量、Agent 的业务理解、训练数据的新鲜度共同的地基。数据工程的水平，就是 AI 系统的天花板。

---
