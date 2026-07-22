---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/using-amazon-s3-tables-optimize-data-lake-hudi-migration-managed-iceberg
ingested: 2026-07-09
feed_name: AWS China Blog
source_published: 2026-07-08
sha256: "c09225d24d1bec2c2c66984a662b866f33e40208cc9930c16b823f54ca1174b5"
---

# 使用 Amazon S3 Tables 优化数据湖：从Hudi 迁移到托管 Iceberg

摘要：某零售品牌因 Hudi 0.12.x 版本老化、并发冲突和全量覆盖场景低效，迁移至 Amazon S3 Tables。团队采用混合策略：DW 层用 S3 Tables 实现增量 MERGE，DM 层全量覆盖表直接写 Parquet。通过新旧并行分批迁移，最终核心作业性能提升最高 8 倍，ETL 月度成本降低 72%。  
  
**目录**

01 一、引言

02 二、Amazon S3 Tables 介绍

03 三、面临的挑战

04 四、解决方案：S3 tables + 按场景选格式的混合架构

05 五、性能对比

06 六、成本效益

07 七、数据质量验证

08 八、经验总结

09 九、相关服务

* * *

## **一、引言**

某全球领先的零售品牌在 AWS 中国区运营着支撑核心业务的数据湖平台。随着数据规模增长，基于 Apache Hudi 0.12.x 构建的 ETL 管道面临版本老化、并发写入不稳定、运维复杂度高等挑战。本文介绍该客户如何通过迁移到 [Amazon S3](<https://aws.amazon.com/cn/s3/>) Tables（AWS 原生托管的 Apache Iceberg 服务），结合按场景选择最优存储格式的混合策略，实现关键作业性能提升最高达 8 倍、ETL 月度成本降低 72%。

## **二、Amazon S3 Tables 介绍**

Amazon S3 Tables 是 AWS 提供的托管 Apache Iceberg 表存储服务。它将 Iceberg 表格式的开放性与 S3 的规模和持久性相结合，为分析工作负载提供原生的 ACID 事务、Time Travel 和与 AWS 分析服务（Athena、Redshift、Glue）的深度集成。

S3 Tables 提供了一条低运维的迁移路径——无需自建 Hive Metastore 或管理 Iceberg Catalog，AWS 原生处理元数据管理和查询集成。

目前Amazon S3 Tables在中国区两个区域均可使用。

## **三、面临的挑战**

客户的数据湖平台包含数十个 Airflow DAG 和数百个 [AWS Glue](<https://aws.amazon.com/cn/glue/>) 作业，采用 ODS / DW / DM 三层架构。核心事实表日增量约数千万行，下游驱动近 20 个分析宽表为 BI 报表提供数据。

使用 Apache Hudi 0.12.x 面临的核心挑战：

  * 版本老化风险：Hudi 0.12.x 社区已停止积极维护，跨大版本升级到 0.14 或 1.0 需要大量兼容性测试，且有数据格式不兼容的风险。
  * 并发写入不稳定：HiveSyncTool 在多个作业并发写入同一表时频繁报冲突错误，导致关键 Trend 类作业必须降低并行度才能稳定运行。
  * DM 层架构不匹配：近 20 个 DM 表中绝大部分为全量覆盖模式（每次运行重算整表），但 Hudi 仍然使用 MERGE 语义——先读目标表再写入，产生不必要的 IO 开销。
  * 计算资源利用率低：受上述问题影响，部分大表作业需分配数百 DPU 才能在可接受时间内完成。



## **四、解决方案：S3 tables + 按场景选格式的混合架构**

### 4.1 方案核心

我们并没有简单地将所有表”从 Hudi 换到 Iceberg”，而是根据每张表的实际写入模式做了差异化选择：

数据层 | 写入模式 | 格式 | 理由  
---|---|---|---  
DW 层 | 增量 MERGE（upsert） | Amazon S3 Tables | 需要 ACID、Time Travel、增量合并能力  
DM 层 | 全量覆盖（overwrite） | Parquet 直写 + Glue Catalog | 无需 MERGE，极简高效，避免小文件  
DM 层 | 增量 upsert | Amazon S3 Tables | 唯一需要增量合并的 DM 表  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/屏幕截图-2026-07-07-165114.png>)  
---  
  
### 4.2 为什么选择 Amazon S3 Tables而非自建 Iceberg

功能 | 自建 Iceberg | Amazon S3 Tables  
---|---|---  
Catalog 管理 | 需自建 Hive Metastore 或配置 Glue Catalog 同步 | 原生集成，零配置  
Athena 查询 | 需额外配置 | 直接 SQL 查询  
运维复杂度 | 自行管理版本、元数据一致性 | AWS 托管  
  
### 4.3 迁移策略：新旧并行，30天稳定后切换

为每个需要迁移的作业新建独立版本，旧 Hudi 版本完全不动。新版本在验证环境稳定运行 30 天后，可下线旧版。这个迁移策略可保：1. 零停机：新旧版本并行运行，业务无感知；2. 可回滚：旧版始终可用，发现问题立即切回； 3. 可验证：同源数据双跑，结果可逐行对比。

分批执行

批次 | 范围 | 说明  
---|---|---  
第一批 | 核心事实表 DW → 全部下游 DM | 风险最高、价值最大的链路先行验证  
第二批 | 核心表上游 ODS 层 | 第一批稳定后接续  
第三批起 | 其余业务链路 | 依前批验证结果逐步解锁  
  
### 4.4 S3 tables 实践经验

**4.4.1 小文件管理**

Amazon S3 Tables 每次增量提交都会产生新数据文件。如果不加控制，频繁的增量写入会导致大量小文件（实测首次全量写入曾产生数千个 ~9 MB 文件），显著影响后续查询性能。

解决方案：

1\. 调整分区粒度：从 year/month/day 改为 year/month，减少分区数量

2\. 显式 repartition：写入前手动控制输出文件数量和大小
    
    
    # 写入前显式控制文件大小，目标 200-256 MB/文件
    partition_fields = ["year", "month"]
    df = df.repartition(*[col(f) for f in partition_fields])
    

3\. 定期 Compaction：配置每周调度合并小文件

# Compaction 调度示例（每周日凌晨），优化后单文件平均大小从 9 MB 提升到 224 MB。

**4.4.2 write.distribution-mode 配置注意事项**

在 S3 Tables 中使用 createOrReplace 方式写入时，table properties 中设置的 write.distribution-mode=hash 会被忽略。

解决方案：不依赖 table property，在 create_or_replace() 前手动执行 df.repartition(*partition_fields)。

**4.4.3 MERGE 操作的主键去重**

当使用 MERGE INTO 时，如果 source DataFrame 中存在重复主键，会触发 MERGE_CARDINALITY_VIOLATION 错误。

解决方案：在执行 MERGE 前对 source 进行主键去重：
    
    
    df_source = df_source.dropDuplicates(pk_cols)
    

**4.4.4 全量覆盖表不适合S3 tables**

问题 | 影响  
---|---  
MERGE INTO 每次读整张目标表 | 全量覆盖场景下，产生多余的全表扫描 IO  
每次写入累积小文件 | 需额外 Compaction 运维  
Trend 类作业比 Hudi 更慢 | 1.4–2.7× 退化  
  
## **五、性能对比**

### 5.1 DW 层增量作业：核心事实表增量运行所需 DPU 减半，运行时间持平

场景 | S3 Tables (Iceberg) | Hudi 基线 | 收益  
---|---|---|---  
全量初始化 | ~60 min, DPU 减半 | ~60 min | 成本降 50%  
日增量运行 | ~7-8 min, DPU 减半 | ~7-8 min | 成本降 50%  
  
### 5.2 DM 层：对于需要增量合并的 DM 表，迁移到 S3 Tables 后性能显著提升（相同资源配置）

作业类型 | S3 Tables | Hudi 基线 | 提升  
---|---|---|---  
运营分析概览 | 3 min | 15 min | 5×  
门店月度运营 | 4 min | 34 min | 8×  
KPI 分析 | 4 min | 24 min | 6×  
商品销售明细 | 9 min | 33 min | 3.6×  
交易汇总 | 26 min (DPU×30) | 29 min (DPU×60) | 快且资源减半  
  
### 5.3 DM 层全量覆盖表：对于不需要增量合并的全量覆盖表，Parquet 比 Iceberg 更快

作业类型 | Parquet | S3 Tables (Iceberg) | 结论  
---|---|---|---  
周趋势分析 | 2.5 min | 43 min | 快 94% *  
月趋势分析 | 5.8 min | 34 min | 快 83%  
日趋势分析 | 4.2 min | 14 min | 快 70%  
库存分析 | 3.6 min (DPU×5) | 5.4 min (DPU×10) | 快 32%，资源降 75%  
商品销售 | 7.2 min (DPU×20) | 9.2 min (DPU×40) | 快 22%，资源降 50%  
  
*: 因为 Iceberg 的 MERGE 语义导致了全表扫描 + 写入放大，而不是 Iceberg 格式本身慢。

## **六、成本效益**

整体 Glue ETL 月度成本降低约 72%，年化节省显著。成本节省的主要来源并非格式切换本身，而是 S3 Tables的高效 IO 使得大表可以用更少的 DPU 在更短时间内完成。其中两张最大的 DM 表通过资源降配（DPU 降低 2-6 倍），合计贡献了总节省的 72%。

优化杠杆 | 机制  
---|---  
DW 层 DPU 减半 | S3 Tables 写入效率高于 Hudi 0.12.x  
DM 大表 DPU 大幅降低 | Parquet 直写无 MERGE 开销，同等数据量用更少资源  
Trend 类作业从 43 min → 2.5 min | 避免全量覆盖表的 MERGE 语义  
新增 Compaction 成本 | 每周一次，开销小于节省的 1%  
  
## **七、数据质量验证**

迁移过程中，我们通过以下方法确保数据正确性：

  1. 双跑验证：Hudi 和 S3 Tables/Parquet 作业同时运行（消费相同数据源）
  2. Athena 基准对比：查询 Hudi 表聚合数据作为正确性基准
  3. 逐日对比 Job：开发专用对比作业，检查行数、金额总量、分维度明细
  4. 差异溯源：所有发现的微小差异（如 0.05% 行数差）均可追溯到上游数据版本差异，非迁移代码逻辑问题



## **八、经验总结**

1\. 按写入模式选择格式，不要一刀切：增量合并（Upsert/MERGE）场景选 S3 Tables；全量覆盖场景选 Parquet 直写。混合方案比”全部 Iceberg”更优。

2\. S3 Tables 小文件需主动管理：配置合理分区粒度 + 显式 repartition + 定期 Compaction 是三件必做的事。

3\. “新建并行”是大规模迁移最安全的策略：不修改现有代码，新建独立版本双跑验证，稳定后切换。零停机、可回滚。

4\. 迁移是资源右配的机会：格式切换后，务必重新评估每个作业的 DPU 配置。大部分成本节省来自”用对格式后发现原来不需要那么多资源”。

5\. 数据正确性验证先于性能优化：先确保结果正确（双跑 + 逐行对比），再追求性能和成本。

**下一步行动：**

**相关产品：**

  * [Amazon S3 Tables](<https://aws.amazon.com/cn/s3/features/tables/>)— 在 Amazon S3 中使用完全托管的 Apache Iceberg 表大规模存储表格数据
  * [Amazon Glue](<https://aws.amazon.com/cn/glue/?p=bl_pr_glue_l=2>) — 简单、可扩展的无服务器数据集成
  * [Amazon Athena](<https://aws.amazon.com/cn/athena/?p=bl_pr_athena_l=3>) — 使用 SQL 在 S3 中查询数据
  * [Amazon Redshift](<https://aws.amazon.com/cn/redshift/?p=bl_pr_redshift_l=4>) — 经济高效的数据仓库



**相关文章：**

  * [S3 Tables 实战：两种方案，把 MySQL 数据实时”搬”进 S3 Tables](<https://aws.amazon.com/cn/blogs/china/s3-tables-solution-mysql-real-time-s3-tables/?p=bl_ar_l=1>)
  * [快速打通AWS Marketplace SaaS集成流程 （实战指南）](<https://aws.amazon.com/cn/blogs/china/quickly-enable-aws-marketplace-saas-integration-workflow-practical-guide/?p=bl_ar_l=2>)
  * [向量存储成本降低 85%：用 Amazon S3 Vectors 构建企业级多平台统一知识库](<https://aws.amazon.com/cn/blogs/china/build-enterprise-grade-multi-platform-unified-knowledge-base-with-amazon-s3-vectors/?p=bl_ar_l=3>)
  * [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](<https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=4>)
  * [推出 S3 Files：使 S3 存储桶能够以文件系统形式直接访问](<https://aws.amazon.com/cn/blogs/china/launching-s3-files-making-s3-buckets-accessible-as-file-systems/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 谢燕敏

 亚马逊云科技解决方案架构师，负责零售客户架构咨询和设计，同时致力于亚马逊云科技在国内和全球企业客户的应用和推广。拥有多年分布式应用开发和云平台运维开发经验。

### 华成

亚马逊云科技客户解决方案经理，目前在亚马逊云科技主要支持泛零售行业的客户。通过运用云相关解决方案等帮助客户在迁移到亚马逊云和云上运维期间实现自身的业务价值，帮助客户成功。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
