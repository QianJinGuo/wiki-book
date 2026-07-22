---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-1
ingested: 2026-07-15
feed_name: AWS China Blog
source_published: 2026-07-15
sha256: a87b873b78e6e05ef3fdc42d13cbe6e10686e384804dec6f1d04e9b03a1a801c
---

# 从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（一）：数据迁移与同步

摘要：本系列基于实际 POC 验证，完整介绍从自建 Elasticsearch 8.17 迁移到 Amazon OpenSearch Service 的实践，涵盖 Logstash 数据同步、向量索引迁移与 Amazon Bedrock Titan V2 集成、以及查询兼容性验证与 BBoss 框架应用层适配三个关键环节。作为系列开篇，本文先解决第一个挑战——数据迁移与同步；向量索引迁移与 Embedding 模型切换将在第二篇展开，查询兼容性与应用适配则在第三篇展开。  
  
**目录**

01 一、引言

02 二、背景与需求

03 三、迁移方案选型与策略

04 四、整体架构与迁移流程

05 五、Migration Assistant 部署与配置要点

06 六、迁移验证

07 七、小结

08 八、相关链接

* * *

## 一、引言

本文是”从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践”系列的第一篇。系列共三篇：（一）数据迁移与同步；[（二）向量索引迁移与 Amazon Bedrock 集成](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-2>)；[（三）查询兼容性验证与 BBoss 应用适配](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-3>)。本篇聚焦数据迁移方案选型、全量与增量同步的组合策略，以及数据一致性验证。

## 二、背景与需求

在企业搜索服务的实际运维中，自建 Elasticsearch（以下简称 ES）集群面临版本升级困难、跨云迁移复杂、向量搜索能力受限等挑战。本文以一个典型场景为例：在云上使用 Elasticsearch 8.17 承载核心搜索业务，数据规模约 1TB，包含多个查询模板，其中部分使用 k-NN 向量搜索（1024 维 Embedding）。业务需要将搜索服务迁移到 Amazon OpenSearch Service（以下简称 AOS），同时将 Embedding 模型从原有方案切换到 Amazon Bedrock Titan Text Embeddings V2。

迁移面临三个核心挑战：

  * 数据同步：ES 8.x 是 Elastic 公司在 OpenSearch 分叉（基于 ES 7.10）之后发布的版本，其 snapshot 不能通过 OpenSearch 原生 _snapshot/_restore API 直接恢复。需要选择合适的数据迁移工具，确保包括向量数据在内的全量数据零损耗迁移。
  * 查询兼容性：k-NN 向量搜索的查询语法在 Elasticsearch 和 OpenSearch 之间存在结构性差异，需要逐一改写并验证。
  * Embedding 模型切换：从第三方 Embedding 服务切换到 Amazon Bedrock Titan V2 后，向量空间不同，需要制定分阶段切换策略。



本系列基于实际 POC 验证，完整介绍从自建 Elasticsearch 8.17 迁移到 Amazon OpenSearch Service 的实践，涵盖 Logstash 数据同步、向量索引迁移与 Amazon Bedrock Titan V2 集成、以及查询兼容性验证与 BBoss 框架应用层适配三个关键环节。作为系列开篇，本文先解决第一个挑战——数据迁移与同步；向量索引迁移与 Embedding 模型切换将在第二篇展开，查询兼容性与应用适配则在第三篇展开。

## 三、迁移方案选型与策略

### 3.1 迁移方案对比

针对 Elasticsearch 8.x 到 Amazon OpenSearch Service 的数据迁移，AWS 提供了多种方案：

方案 | 适用场景 | 优势 | 限制  
---|---|---|---  
Migration Assistant (RFS 全量 + Traffic Replayer 增量) | 大数据量（TB 级）、需要零停机 | 高吞吐、支持流量捕获与回放、官方推荐 | 部署复杂度较高，需要 Kubernetes 环境（推荐 EKS）  
Logstash + opensearch output | 中小数据量、需要增量同步 | 配置简单、支持多 pipeline、灵活过滤 | 不支持删除同步、大数据量性能受限  
Reindex-from-Remote | 小数据量、网络直连 | 无需额外组件 | 需要源集群可达、不适合跨云  
  
Migration Assistant for Amazon OpenSearch Service 是 AWS 官方推荐的迁移方案。其核心组件 Reindex-from-Snapshot (RFS) 能够直接从 ES 8.x 的 snapshot 中解析 Lucene 文件、提取文档并重新索引到目标集群，支持 ES 8.x 到 OpenSearch 2.x/3.x 的跨版本迁移。根据 [AWS 官方测试](<https://aws.amazon.com/blogs/big-data/accelerate-your-migration-to-amazon-opensearch-service-with-reindexing-from-snapshot/>)，5 TiB 数据（39 亿文档）在 15 节点 r7gd.16xlarge 目标集群、200 个 RFS worker 下的迁移仅需约 35 分钟。

### 3.2 按索引类型制定迁移策略

确定迁移工具后，还需按索引类型制定具体策略。从 ES 8.x 迁移到 AOS 3.x 时，普通索引和向量索引的迁移复杂度存在显著差异。普通索引的 mapping 完全兼容，可以直接搬运；而向量索引除了 mapping 转换（`dense_vector` → `knn_vector`）外，还面临一个核心决策：迁移后是否继续使用原有的 Embedding 模型？

这一决策之所以重要，是因为向量数据的价值完全依赖于生成它的 Embedding 模型。不同模型产生的向量处于不同的语义空间——即使维度相同，数值含义也完全不同，不能混合使用。如果迁移后需要切换 Embedding Provider（例如从第三方服务切换到 Amazon Bedrock Titan V2），则不能简单搬运原有向量了事，还需要规划全量重新 Embedding 的路径。

**3.2.1 普通索引迁移策略**

普通索引（text、keyword、date、数值类型等）的迁移相对简单，mapping 完全兼容：

  * Mapping 无需修改：text、keyword、date、date_nanos、数值类型在 AOS 3.x 中完全兼容
  * 查询零改动：painless 脚本、function_score、multi_match、highlight、聚合等均无需改写
  * RFS 自动处理 metadata：包括 index settings、mappings、aliases、templates



**3.2.2 向量索引迁移策略（概述）**

向量索引（`dense_vector`）的迁移需要额外处理 mapping 转换和 HNSW 图重建，且取决于前述的核心决策——是否更换 Embedding 模型——由此分为两条路线：

路线 | 适用场景 | 要点  
---|---|---  
路线 A：保留原有 Embedding 模型 | 继续使用原 Embedding 模型，迁移后行为不变 | 预建 knn_vector mapping，向量数据原样搬运、零损耗  
路线 B：迁移时更换 Embedding 模型 | 借迁移升级模型（如切换到 Amazon Bedrock Titan V2）、换厂商或升级维度 | 普通索引照搬，向量索引全量重建  
  
路线 A 下向量数据可由 RFS / Logstash 原样搬运，关键前提是在 AOS 预建索引时将 `dense_vector` 改为 `knn_vector` 并指定引擎与 `space_type`；路线 B 则跳过原向量、读取文本字段调用新模型重新生成。两条路线的详细操作步骤、注意事项，以及 Amazon Bedrock 集成的两种方式，详见本系列第二篇[《从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（二）：向量索引迁移与 Amazon Bedrock 集成》](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-2>)。

**3.2.3 迁移策略决策树**
    
    
    ES 7.10+ / 8.x → AOS 3.x
    ├─ 普通索引（text/keyword/date/数值）
    │   └─ RFS 直接迁移，mapping 自动转换，查询零改动
    └─ 向量索引（dense_vector）
        └─ 是否更换 Embedding 模型？
            ├─ 否 → 路线 A：预建 knn_vector mapping + RFS/Logstash 原样搬运向量
            └─ 是 → 路线 B：普通索引照搬，向量索引全量重建
    

至于应用层的查询语法差异与改动量，将在本系列第三篇[《从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（三）：查询兼容性验证与 BBoss 应用适配》](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-3>)中展开。

三篇文章的内容可以参考以下全图：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/15/elasticsearch-migration-amazon-opensearch-service-1-new.png>) [图1]  
---  
  
## 四、整体架构与迁移流程

本案例采用 [Migration Assistant for Amazon OpenSearch Service](<https://docs.aws.amazon.com/solutions/latest/migration-assistant-for-amazon-opensearch-service/solution-overview.html>) 进行迁移，通过 RFS 完成全量数据回填，通过 Capture Proxy + Traffic Replayer 实现增量流量同步，实现零停机迁移。

**注意：**

截至 2026 年 7 月，官方开源代码在管控功能上存在已知缺陷，官方 [PR #3203](<https://github.com/opensearch-project/opensearch-migrations/pull/3203>) 已修复该问题。本文仅以演示为主，实际使用请留意 [opensearch-migrations](<https://github.com/opensearch-project/opensearch-migrations>) 官方最新代码。

### 4.1 架构概览

Migration Assistant 部署在 [Amazon EKS](<https://aws.amazon.com/cn/eks/>) 上，通过 Argo Workflows 编排整个迁移流程。核心组件包括 Capture Proxy（流量捕获）、Kafka（流量缓存）、RFS Workers（全量回填）和 Traffic Replayer（增量重放）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/15/elasticsearch-migration-amazon-opensearch-service-1-1.png>) [图2]  
---  
  
### 4.2 Traffic Replayer 的适用限制

[Traffic Replayer](<https://docs.aws.amazon.com/solutions/latest/migration-assistant-for-amazon-opensearch-service/using-traffic-replayer.html>) 通过重放捕获的 HTTP 请求来同步增量数据。由于并非所有写入操作都是幂等的，以下场景不适合使用 Capture & Replay：

场景 | 问题  
---|---  
不指定 document ID 的写入（`POST /index/_doc`） | 重放会生成重复文档  
Script Update（`ctx._source.counter += 1`） | 重放导致累加值偏大  
带乐观锁的写入（`if_seq_no / if_primary_term`） | 重放会报版本冲突  
  
官方文档说明：”Automatically generated document IDs are not preserved during replay—clients must explicitly provide document IDs to maintain consistency between source and target.” 此外，官方建议实时流量不超过 4 TB/天。

### 4.3 迁移执行流程（人工审批模式）

生产环境建议配置 skipApprovals: false，在关键节点暂停等待人工确认：

步骤 | 类型 | 操作  
---|---|---  
1\. 部署 Kafka + Capture Proxy | 自动 | Workflow 自动完成  
2\. 切换应用流量到 Capture Proxy | ★人工 | 修改应用连接地址到 Proxy LB  
3\. 确认流量已切换，审批创建快照 | ★人工 | `workflow approve step ...`  
4\. 创建 Snapshot 到 S3 | 自动 | Workflow 调用 ES `_snapshot` API  
5\. Evaluate Metadata（评估转换） | 自动 | 分析 mapping 兼容性  
6\. 检查评估报告，审批应用变更 | ★人工 | `workflow approve step evaluatemetadata...`  
7\. Migrate Metadata 到目标端 | 自动 | 创建索引/模板/别名  
8\. 检查目标端索引结构，审批回填 | ★人工 | `workflow approve step migratemetadata...`  
9\. Document Backfill (RFS) | 自动 | 从 S3 snapshot 批量回填文档  
10\. 对比文档数，审批启动 Replay | ★人工 | 确认回填完成、数量一致  
11\. 启动 Traffic Replayer | 自动 | 消费 Kafka 重放增量到目标端  
12\. 确认追平，最终切换到目标端 | ★人工 | Kafka lag=0 后切换 DNS/LB  
  
步骤 2 是零停机的关键：必须在 Snapshot 创建之前将流量切到 Proxy，否则切换窗口期的写入会丢失（既不在 Snapshot 里，也没被 Proxy 捕获）。

### 4.4 轻量增量方案：Logstash

Capture Proxy + Traffic Replayer 能够实现严格的零停机迁移，但接入成本不低: 需要在源端前置部署 Capture Proxy 并将应用写入流量切换过去，还要运行 Kafka 缓存流量。对于可以接受短暂只读窗口、或迁移窗口期写入量不大的场景，使用 Logstash 做增量同步是一种更轻量的替代方案，无需改动源端流量路径。

其思路是：在 RFS 完成全量回填后，用 Logstash 的 `elasticsearch input` 按时间字段（如 `range+ schedule`定时拉取最近时间窗口）从源集群增量读取数据，再通过 `logstash-output-opensearch` 幂等写入目标端（保留原始 _id，按文档 ID 覆盖写入，避免重复）。整个过程不接触源端写入链路，部署和回滚都更简单。

两种增量方案的对比如下：

维度 | Traffic Replayer（MA 内置） | Logstash  
---|---|---  
停机要求 | 零停机 | 需短暂只读窗口或容忍少量延迟  
源端改动 | 需前置 Capture Proxy、切换写入流量 | 无需改动源端，旁路拉取  
依赖组件 | Capture Proxy + Kafka | 仅 Logstash  
同步机制 | 重放捕获的写入请求（保证顺序） | 按时间字段定时拉取增量  
删除同步 | 支持（重放 delete 请求） | 不支持（仅新增/更新）  
适用场景 | 严格零停机、写入量大 | 接入成本敏感、可容忍小延迟  
  
需要注意的是，Logstash 增量依赖文档上的时间字段来界定”增量范围”，且不同步删除操作。若源端存在物理删除或无可靠时间字段的索引，仍需结合 Traffic Replayer 或在切换前做一次全量校验。将数据写入 Amazon OpenSearch Service [需使用官方的 logstash-output-opensearch](<https://github.com/opensearch-project/logstash-output-opensearch>) 插件，其安装与参数配置详见 [OpenSearch 官方文档](<https://opensearch.org/docs/latest/tools/logstash/ship-to-opensearch/>)。

## 五、Migration Assistant 部署与配置要点

Migration Assistant 的完整部署步骤（CloudFormation 一键 bootstrap、EKS 集群创建、迁移控制台接入、Workflow 提交与监控）以官方文档为准，详见 [Migration Assistant 部署指南](<https://docs.aws.amazon.com/solutions/latest/migration-assistant-for-amazon-opensearch-service/deploy-the-solution.html>)与 [opensearch-migrations 项目](<https://github.com/opensearch-project/opensearch-migrations>)。本节仅说明实际迁移中容易踩坑、需要重点关注的两处配置。

源端 S3 快照仓库：RFS 从 S3 读取快照，因此源端 ES 需先注册 S3 快照仓库。ES 8.x 已内置 `repository-s3` 模块，通过 `elasticsearch-keystore` 写入 AWS 凭证、`reload secure settings` 后，调用 `_snapshot` API 注册仓库即可；仓库的 `bucket` 需与 Migration Assistant 部署时创建的 S3 桶一致。

**Workflow 关键配置项**

Migration Assistant 通过 Argo Workflows 编排迁移，提交前需在配置中关注以下几项：

配置项 | 说明  
---|---  
`skipApprovals: false` | 启用人工审批，在关键节点暂停等待确认（生产环境推荐）  
`allowInsecure: true` | 跳过 TLS 证书验证（适用于源端自签证书场景）  
`clusterAwarenessAttributes: 3` | 适配目标端 3-AZ 集群的 replica 要求  
`indexAllowlist` | 只迁移指定索引，避免迁移系统索引  
  
配置完成后，通过迁移控制台提交 Workflow 并监控进度，在各审批节点确认后推进（审批流程见上一节）。具体命令参见上述官方文档。

## 六、迁移验证

本节按三个维度依次验证迁移结果：首先验证数据迁移的完整性（全量回填、增量同步、零停机切换能否端到端跑通），再评估导入性能（不同数据量与配置下的吞吐与耗时），最后核验数据一致性（源端与目标端逐字段是否相同）。查询层面的兼容性验证（共 26 种查询场景）将在本系列第三篇展开。本节涉及的测试索引预建语句、监控与校验脚本，均可在本系列[示例代码仓库](<https://github.com/aws-samples/sample-es-to-aos-migration-demos>)获取。

### 6.1 数据迁移完整性验证（全量 + 增量 + 零停机）

一次完整的零停机迁移由三部分组成：RFS 全量回填存量数据、迁移窗口期的增量同步、以及切换前的最终追平。在本案例中，全量数据由 RFS 从 S3 snapshot 回填；迁移窗口期的增量写入由 Capture Proxy 捕获、Kafka 缓存、Traffic Replayer 重放追平（对于中小数据量、无需严格零停机的场景，增量同步也可改用更轻量的 Logstash 定时拉取，两种方案的对比见”三、整体架构与迁移流程”中的”轻量增量方案：Logstash”）。

为验证整个流程的正确性，在 RFS 全量回填期间持续通过 Capture Proxy 向源端写入数据，模拟迁移窗口期的实时业务流量；Traffic Replayer 启动后自动重放并追平增量。

验证结果如下：

验证项 | 结果  
---|---  
存量数据一致性 | 源端 500 条 = 目标端 500 条  
增量数据同步 | 源端 1254 条 = 目标端 1254 条  
文档内容抽样对比 | 完全一致  
源端服务中断 | 无中断  
Workflow 总耗时（演示环境，小数据量） | ~8 分钟  
  
结果表明，全量与增量数据在目标端完全对齐，源端服务在整个迁移过程中持续可用、无中断。上表为小数据量场景下的端到端演示，用于验证迁移流程的完整性与正确性；TB 级数据的回填性能见下文导入性能测试。

### 6.2 导入性能测试

迁移流程跑通后，进一步评估不同数据量下的导入性能。

针对小数据量场景，使用 `bench_normal_5g` 索引（3.9 GB / 362 万文档）在同一 VPC 环境下对比了两种迁移方式：

方式 | 数据量 | 耗时 | 吞吐  
---|---|---|---  
Reindex-from-Remote (5 slices) | 3.9 GB / 362 万文档 | 110s | 32,899 docs/s  
RFS (5 workers) | 3.9 GB / 362 万文档 | ~15min（含 snapshot） | —  
  
在该数据量下，Reindex-from-Remote 由于省去快照环节，整体耗时更短；RFS 的吞吐优势主要体现在大数据量与跨版本迁移场景。

针对大数据量场景，使用 1.3 TB 历史 snapshot 进行 RFS 导入测试，以验证其跨版本迁移能力与吞吐表现。测试数据流如下，目标索引在导入前预先创建，并关闭副本、放大 refresh 间隔以提升写入吞吐：
    
    
    S3 Snapshot → RFS Workers (解析 Lucene segments) → AOS 写入 (replica=0) → 设置 replica=2
    PUT /fruits
    {
      "settings": {
        "number_of_shards": 163,
        "number_of_replicas": 0,
        "refresh_interval": "60s",
        "index.translog.flush_threshold_size": "1gb"
      }
    }
    

不同 worker 数与副本配置下的性能对比如下（本次测试目标集群为 r7g.4xlarge × 5；官方 benchmark 目标集群为 r7gd.16xlarge × 15 数据节点 + m7g.large × 3 主节点）：

测试场景 | 目标集群 | 数据量 | Workers | Replica | 导入耗时 | 吞吐  
---|---|---|---|---|---|---  
AWS 官方 benchmark | r7gd.16xlarge × 15 | 5 TiB | 200 | 0 | ~35 min | 2,497 MiB/s  
Round 1 (baseline) | r7g.4xlarge × 5 | 1.2 TB | 30 | 1 | 102 min | ~400 MB/s*  
Round 2 (replica=0) | r7g.4xlarge × 5 | 1.2 TB | 30 | 0 | 73 min | ~282 MB/s  
Round 3 (优化参数) | r7g.4xlarge × 5 | 1.2 TB | 20 | 0 | 101 min | ~203 MB/s  
  
*Round 1 的吞吐包含副本写入（实际写入 2.4 TB）。本次测试中目标集群 CPU 利用率在 Round 1、Round 2 达到 95–99%，Round 3 降至 62–73%。

导入完成后将副本数设置为 2，副本复制耗时如下：

数据量 | 复制量 (×2副本) | 耗时  
---|---|---  
1.2 TB | 2.4 TB | ~113 min  
  
测试结论：

  * 迁移吞吐的主要瓶颈在目标集群的计算能力。本次测试使用的是小规模验证集群（r7g.4xlarge × 5），吞吐显著低于官方 benchmark 所用的大规模集群（r7gd.16xlarge × 15）；RFS 的导入吞吐主要随目标集群的节点数与计算规模扩展。
  * 生产环境迁移建议在导入阶段设置 replica=0、refresh_interval ≥ 60s，待全量导入完成后再恢复副本数，以获得更高的写入吞吐。
  * RFS 支持 ES 6.8 / 7.x / 8.x 到 AOS 2.x / 3.x 的跨版本迁移，且无需源集群保持在线。



### 6.3 数据一致性验证

使用 Migration Assistant (RFS) 将 Elasticsearch 8.17 的测试索引迁移至 Amazon OpenSearch Service 3.3，覆盖普通索引与向量索引两类场景，验证数据一致性与 mapping 自动转换。结果如下表所示：

索引 | 类型 | 文档数 | 大小 | Mapping 转换 | 结果  
---|---|---|---|---|---  
bench_normal_5g | 普通 | 3,626,000 | 3.9 GB | 无需转换 | 数据100% 一致  
bench_vector_5g | 向量 (128维) | 2,074,000 | 3.3 GB | dense_vector → knn_vector (自动) | 原向量100% 一致  
kb_docs | 向量 (1024维) | 2,724 | 65 MB | dense_vector → knn_vector (自动) | 原向量100% 一致  
  
经 5% 随机抽样（约 28.5 万条文档）逐字段比对，源端与目标端数据完全一致；RFS 在迁移过程中自动完成 `dense_vector` 到 `knn_vector` (faiss / cosinesimil) 的 mapping 转换，无需人工干预。

需要说明的是，对于向量索引，”一致”指的是原始向量数据（float 数组）在源端与目标端逐字段完全相同；而 k-NN 搜索结果由于目标端会重建 HNSW 图，可能与源端存在微小差异（分数差异通常在 0.0–0.2%，Top-K 排序基本一致），这一点属于近似最近邻算法的固有特性而非数据损耗，详见本系列第二篇。

## 七、小结

本文作为系列开篇，介绍了从自建 Elasticsearch 8.17 迁移到 Amazon OpenSearch Service 的数据迁移方案选型与实践：

  * 方案选型：对比了 Migration Assistant、Logstash、Reindex-from-Remote 三种方案，推荐 Migration Assistant (RFS 全量 + Traffic Replayer 增量) 作为 TB 级零停机迁移的首选
  * 索引分类处理：普通索引 mapping 完全兼容可直接迁移；向量索引需根据 Embedding 模型策略选择搬运或重建方案
  * 迁移实操：通过 Migration Assistant EKS 方案完成部署，RFS 全量回填存量数据，Traffic Replayer 同步增量流量，验证了零停机迁移能力
  * 数据验证：存量数据和实时写入数据在目标端完全一致，源端服务全程无中断



本系列后续两篇将分别展开：第二篇介绍向量索引迁移的两条路线与基于 Amazon Bedrock Titan V2 的集成、全量 Embedding 切换；第三篇介绍查询兼容性验证与基于 BBoss 框架的低改动应用适配。

**下一步行动：**

**相关产品：**

  * [Amazon OpenSearch](<https://aws.amazon.com/cn/opensearch-service/?p=bl_pr_opensearch_l=1>) — 搜索和分析引擎
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=3>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=4>) — 托管式 Kubernetes 服务
  * [Amazon CloudFormation](<https://aws.amazon.com/cn/cloudformation/?p=bl_pr_cloudformation_l=5>) — 基础设施即代码服务



**相关文章：**

  * [使用Logstash在线迁移 Amazon OpenSearch Service](<https://aws.amazon.com/cn/blogs/china/using-logstash-for-online-migration-of-amazon-opensearch-service/?p=bl_ar_l=1>)
  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=2>)
  * [基于 Amazon Kinesis Data Streams 实现 DynamoDB 历史数据清理与增量同步](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-kinesis-data-streams-implement-dynamodb/?p=bl_ar_l=3>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=4>)
  * [从IDC到云上GPU：基于 Amazon EKS 的大模型推理混合云弹性部署实践](<https://aws.amazon.com/cn/blogs/china/idc-gpu-based-on-amazon-eks-large-model-inference-hybrid-cloud-elastic-deploy-practice/?p=bl_ar_l=5>)



## 八、相关链接

  * [Migration Assistant for Amazon OpenSearch Service](<https://docs.aws.amazon.com/solutions/latest/migration-assistant-for-amazon-opensearch-service/solution-overview.html>)
  * [Accelerate your migration to Amazon OpenSearch Service with Reindexing-from-Snapshot](<https://aws.amazon.com/blogs/big-data/accelerate-your-migration-to-amazon-opensearch-service-with-reindexing-from-snapshot/>)
  * [Amazon OpenSearch Service 开发者指南](<https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html>)
  * [本系列示例代码仓库](<https://github.com/aws-samples/sample-es-to-aos-migration-demos>)
  * [基于 Amazon OpenSearch 的 Apache Solr 迁移方案设计及实现](<https://aws.amazon.com/cn/blogs/china/design-and-implementation-of-apache-solr-migration-scheme-based-on-amazon-opensearch/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 苏志勇

亚马逊云科技迁移解决方案架构师，主要负责企业上云跨云迁移相关的技术支持工作。曾担任研发工程师、解决方案架构师等职位，在 IT 专业服务和企业应用架构方面拥有多年的实践经验。

### 邢悦

亚马逊云科技迁移解决方案架构师，主要负责企业上云跨云迁移相关的技术支持工作。在制造、保险、物流等行业拥有10多年的研发和架构设计经验。

### 马佳

亚马逊云科技解决方案架构师，负责基于亚马逊云科技云平台解决方案的设计和咨询，亚马逊云科技人工智能机器学习领域成员。在机器学习、深度学习及自动驾驶感知领域，拥有丰富的理论及算法实践工程经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
