# Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly

## Ch01.458 Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly

> 📊 Level ⭐⭐ | 10.2KB | `entities/storage-workload-architecture-taxonomy-vanlightly.md`

# Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly

Jack Van Lightly 提出的存储/工作负载架构分类法，系统化梳理数据库和存储系统的架构模式。

## 核心内容

_The lines between transactional systems, analytical systems, hybrid systems, and shared storage architectures are getting blurry. This post proposes a small taxonomy for describing the different ways systems, workloads, storage tiers, visibility, and durable copies relate to each other._

OLTP, OLAP, HTAP, and now LTAP?

We can think of the first two as two types of workload which have specialized query engines and storage systems to support them. OLTP such as the RDBMS like Postgres and MySQL use row-based storage engines. OLAP, such as Clickhouse, cloud data warehouse and the lakehouse use column-based storage.

HTAP is a hybrid workload system: one system -> both transactional and analytical workloads. The HTAP system therefore has specialized storage and specialized query engine to stitch together the row-based and columnar data.

So far, we’re dealing with a single system. A Postgres (OLTP), a Clickhouse (OLAP), a SingleStore or TiDB (HTAP).

So what is the recent Databricks’ LTAP announcement? LTAP is the two workloads (OLTP and OLAP) but also two systems (e.g. Postgres and lakehouse/Spark) and some blend of two different storage systems.

As well single single vs multi-system, single vs multi-workload, there are other relevant concepts such as tiering and materialization:

*   Tiering

    *   A single system can tier (move) data from hot to cold storage (for cost efficiency). One system, one copy, two tiers.

    *   Hot and cold might be the same storage format (both row-based or both columnar), or might be different formats (hot is row-based, cold is columnar).

    *   We can have two systems share the same storage tier. System A tiers (move) hot data to the storage of System B. Two systems, one copy, though System B doesn’t see the newest data yet which only exists on A.

*   Materializing

    *   One system can materialize (copy) data into another system. Two systems, two copies.

Note when I say “copy of the data”, I mean durable copy, so caching doesn’t count. If the number of copies really matters to you as a metric, then maybe caching does count, depending on how much cached data you need to make it work? If only life were simpler.

It would be nice to have some shared vocabulary around this, so we can talk about system architecture more easily. So I defined some terms last year for this, and expanded it as seen below.

_Vis means Visibility (when is data available in the other workload)._

The broad classification scheme:

*   **Single tier,**one system, one workload. _Example: Postgres with SSD, single tier CockroachDB, standard Kafka cluster._

*   **Internal Tiering,**one system,one workload, commonly tiers from hot to cold storage for cost efficiency, e.g. hot=SSD, cold=S3. Though tiering could also serve other purposes than cost. _Example: Apache Kafka tiered storage, ClickHouse MergeTree tiered storage._

*   **Hybrid (HTAP),**One system,two workloads, dual-format possibly with different tiers, e.g. hot row-based data on SSD, long-term columnar data on S3. Two sub-categories**:**

    *   **Freshness-by-composition**: In order for consistency across OLTP/OLAP workloads, either data is written to both formats synchronously (allowing OLAP queries to hit column-store alone), or data is asynchronously replicated to the column-store and merge-on-read is used to present a consistent view. _Example: SingleStore, Snowflake Hybrid tables, SAP Hana Column Store._

    *   **Freshness-by-catchup:**OLAP queries routed to columnar-store which is replicated to asynchronously from the row-store. Consistency is a dial, where stronger consistency requires a “freshness by catch-up” approach, where the query is only served once the columnar store has reached the query LSN. _Example: PolarDB-IMCI with Intelligent Routing, TiDB/TiFlash._

*   **Materializing**, two workloads, two systems, two copies. System A copies data to System B. Each system is dedicated to one workload, with specialized query engine and storage. _Example: ETL in general, many Kafka-compatible services have automatic Iceberg materialization of topics e.g. Confluent Tableflow, Databricks Synced tables asynchronously materialize from lakehouse to lakebase (Postgres)._

*   **Shared Tiering**, two workloads, two systems. one copy across hot tier + shared colder tier (e.g. hot row-based data on SSD for System A, colder columnar data on S3 for System A + B). Example: Apache Fluss tiers hot data (Fluss servers) to lakehouse (lakehouse is a shared tier), LTAP.

_Potentially, additional categories could hypothetically exist: Shared-Sync-RR and Shared-Sync-MM. Two systems, two workloads, one synchronous storage (each write is immediately visible in the other system). Read-replica (RR) variant has one master system and one read-only system (e.g. writes to Postgres are_**_immediately_**_visible for reads in lakehouse). Multi-master (MM) allows both systems to write (hard!!)._

At the time of writing the details on LTAP are scarce, but it seems like LTAP will fall into Shared Tiering. The thing that differentiates HTAP from LTAP is that HTAP is a single hybrid system which makes data visible to both transactional and analytical queries at the same time. LTAP is a way of unifying the data of two different systems (each targeting a different workload) and sharing the colder data such that there is no (durable) data copy required. It is fundamentally asynchronous: hottest data is only in System A and the remaining colder data is stored in System B but made available to System A (as it’s cold tier).

Of course LTAP could potentially move towards the hypothetical category _Shared-Sync-RR_, given both systems exist in the same platform, then it gets murky again because its one platform, its veering towards HTAP (Hybrid).

One thing that the marketing material of unified OLTP-OLAP system commonly glosses over are the different data models used in each, such as Third Normal Form (3NF) common in OLTP and Kimball (star and snowflake 

## 深度分析

### 从 OLTP/OLAP 到 HTAP/LAP 的分类演化

Vanlightly 的分类法揭示了存储架构从单维分类（OLTP vs OLAP）到多维分类（系统数 × 工作负载数 × 存储副本数）的演化路径。关键洞察是：当系统数和工作负载数同时增加时，数据一致性问题变得极其复杂——HTAP 在单系统内解决一致性（通过 dual-format 或 merge-on-read），LTAP 在跨系统间解决一致性（通过共享冷存储层）。 这种分类框架为评估新数据库产品提供了清晰的定位坐标。

### Freshness-by-Composition vs Freshness-by-Catchup 的工程权衡

HTAP 的两个子分类代表了数据新鲜度的两种根本性实现策略：**Freshness-by-composition**（同步写入两种格式，OLAP 查询直接命中列存储）和 **Freshness-by-catchup**（异步复制，查询等待列存储追上行存储的 LSN）。 前者延迟更低但写入成本更高，后者写入更高效但查询一致性需要额外协调。这种权衡决定了 HTAP 系统的适用场景——高频写入场景倾向 catchup，低延迟查询场景倾向 composition。

### 共享分层（Shared Tiering）作为 LTAP 的核心模式

LTAP 的本质是**共享分层**——两个系统（OLTP + OLAP）共享一个冷存储层（如 S3 上的列存储），热数据仅存在于 OLTP 系统中。 这与 materializing（两个系统各有一份数据副本）形成关键区别：shared tiering 通过共享存储避免了数据复制的存储成本，但引入了跨系统数据可见性延迟。

### 数据模型差异的被忽视问题

文章指出统一 OLTP-OLAP 系统的营销材料通常回避一个关键差异：**数据模型**。OLTP 使用第三范式（3NF），OLAP 使用星型/雪花模型（Kimball）。 这种差异不仅是存储格式（行 vs 列）的问题，更是查询模式和索引策略的根本性分歧。任何声称"统一两者"的系统都必须在某一层面做出妥协。

### 分类法的边界案例与未来扩展

Vanlightly 承认分类法存在边界案例（如 LTAP 可能演化为 Shared-Sync-RR），并提出了两个假设类别（Shared-Sync-RR 和 Shared-Sync-MM）。 这种开放性态度反映了存储架构的快速演化——新的系统设计不断突破现有分类边界，分类法需要持续更新。

## 实践启示

1. **评估数据库产品时使用多维分类框架**：不要仅看"OLTP"或"OLAP"标签，要从系统数、工作负载数、存储副本数、数据可见性延迟等多个维度定位产品。
2. **HTAP 的选择取决于一致性需求**：高频写入场景选择 Freshness-by-catchup（如 TiDB/TiFlash），低延迟查询场景选择 Freshness-by-composition（如 SingleStore）。
3. **跨系统数据共享优先考虑 Shared Tiering**：当两个系统需要共享数据时，Shared Tiering 比 Materializing 更节省存储成本，但需要接受数据可见性延迟。
4. **不要忽视数据模型差异**：OLTP 的 3NF 和 OLAP 的 Kimball 模型在查询模式和索引策略上根本不同，统一系统必须在某一层面妥协。
5. **存储架构决策应考虑未来扩展性**：选择支持分层、物化、共享等多种数据流模式的系统，避免因架构锁定而无法适应业务变化。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/storage-workload-architecture-taxonomy-vanlightly.md)

---

