# 使用 Amazon S3 Tables 优化数据湖：从Hudi 迁移到托管 Iceberg

> 📊 Level ⭐⭐⭐ | 14.5KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/using-amazon-s3-tables-optimize-data-lake-hudi-migration-managed-iceberg)

## 使用 Amazon S3 Tables 优化数据湖：从Hudi 迁移到托管 Iceberg

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

某全球领先的零售品牌在 AWS 中国区运营着支撑核心业务的数据湖平台。随着数据规模增长，基于 Apache Hudi 0.12.x 构建的 ETL 管道面临版本老化、并发写入不稳定、运维复杂度高等挑战。本文介绍该客户如何通过迁移到 Amazon S3 Tables（AWS 原生托管的 Apache Iceberg 服务），结合按场景选择最优存储格式的混合策略，实现关键作业性能提升最高达 8 倍、ETL 月度成本降低 72%。

## **二、Amazon S3 Tables 介绍**

Amazon S3 Tables 是 AWS 提供的托管 Apache Iceberg 表存储服务。它将 Iceberg 表格式的开放性与 S3 的规模和持久性相结合，为分析工作负载提供原生的 ACID 事务、Time Travel 和与 AWS 分析服务（Athena、Redshift、Glue）的深度集成。

S3 Tables 提供了一条低运维的迁移路径——无需自建 Hive Metastore 或管理 Iceberg Catalog，AWS 原生处理元数据管理和查询集成。

目前Amazon S3 Tables在中国区两个区域均可使用。

## **三、面临的挑战**

客户的数据湖平台包含数十个 Airflow DAG 和数百个 AWS Glue 作业，采用 ODS / DW / DM 三层架构。核心事实表日增量约数千万行，下游驱动近 20 个分析宽表为 BI 报表提供数据。

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

## Compaction 调度示例（每周日凌晨），优化后单文件平均大小从 9 MB 提升到 224 MB。

**4.4.2 write.distribution-mode 配置注意事项**

在 S3 Tables 中使用 createOrReplace 方式写入

---

## 深度分析

### 托管 Iceberg 与自托管 Hudi 的权衡

权衡的核心不是"Iceberg 比 Hudi 好"，而是托管表服务与自托管表格式对特定工作负载的匹配度。自托管 Hudi 0.12.x 的痛点是结构性的：社区停止积极维护、跨大版本升级有格式不兼容风险、HiveSyncTool 并发写冲突迫使关键作业降并行度；而 S3 Tables 把 Catalog、元数据一致性、Athena 集成全部托管，自建则需自建 Hive Metastore 或维护 Glue Catalog 同步。 但托管并非处处占优：全量覆盖场景下 MERGE 语义导致全表扫描 + 写入放大，Trend 类作业反比 Hudi 慢 1.4-2.7×。 结论：需要增量合并的表才值得托管表格式，覆盖型表直接写 Parquet + Glue Catalog 更快（快 22%-94%）。 这一"延迟合并"思想与 [Write-Ahead Intent Log](https://github.com/QianJinGuo/wiki-public/blob/main/entities/write-ahead-intent-log-a-foundation-for-efficient-cdc-at-scale.md) 一脉相承。

### Compaction 与文件尺寸经济学

S3 Tables 每次增量提交都产生新文件，首次全量写入实测产生数千个 ~9 MB 小文件。治理组合拳分三层：分区粒度从 year/month/day 收敛到 year/month；显式 `repartition` 控制文件大小（目标 200-256 MB/文件）；每周 Compaction 兜底，单文件平均从 9 MB 提升到 224 MB。 经济账清晰：Compaction 周一次开销小于总节省的 1%，而不治理则查询端 IO 放大持续放大每次读取成本——写入端一次 repartition 优于事后反复合并。月度成本降 72% 的真正来源并非格式切换本身，而是高效 IO 让大表以更少 DPU 完成：两张最大 DM 表降配（DPU 降 2-6 倍）合计贡献 72% 节省。 思路与 [AI 成本优化框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md) 的"先降单位成本"同理。

### 迁移风险与回滚

策略是"新建并行"：为每个作业新建独立版本，旧 Hudi 版本完全不动，新版本验证环境稳定运行 30 天后下线旧版——零停机、可回滚（旧版始终可用，发现问题立即切回）、可验证（同源双跑、逐行对比）。执行上分批解锁：风险最高、价值最大的核心 DW → 下游 DM 链路先行，稳定后推 ODS 层及其余链路。 正确性靠四道工序兜底：双跑验证、Athena 基准对比、逐日对比 Job（行数/金额/分维度）、差异溯源——0.05% 行数差等微小差异均可追溯到上游数据版本而非迁移逻辑（参见 [数据质量框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/data-quality-framework.md)）。

## 实践启示

1. **按写入模式选格式，拒绝一刀切**：增量 MERGE 场景选托管 Iceberg，全量覆盖场景直接写 Parquet——混合方案比"全部 Iceberg"更优，覆盖表用 Iceberg 反倒退 1.4-2.7×。
2. **文件尺寸治理前置到写入端**：分区粒度收敛 + 显式 repartition（200-256 MB/文件）+ 每周 Compaction 三件事缺一不可，写入端一次控制优于事后反复合并。
3. **大规模迁移用"新建并行"而非原地升级**：旧版不动、双跑 30 天、逐行对比后切换，回滚成本为零；先迁风险最高、价值最大的链路，以其结果解锁后续批次。
4. **格式切换是资源右配的窗口**：迁移后重新评估每个作业的 DPU 配置——成本节省主要来自"用对格式后发现不需要那么多资源"。
5. **托管平台隐式行为靠双跑实测**：`write.distribution-mode` 被忽略、MERGE 主键基数冲突这类怪癖文档不会提醒，验证环境并行双跑是最便宜的暴露手段。
6. **数据正确性验证先于性能优化**：先确保结果正确（双跑 + 逐行对比 + 差异可溯源），再追求性能与成本收益。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

