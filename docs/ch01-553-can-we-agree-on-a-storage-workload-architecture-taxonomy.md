# Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly

## Ch01.553 Can We Agree on a Storage/Workload Architecture Taxonomy? — Jack Vanlightly

> 📊 Level ⭐⭐ | 6.6KB | `entities/storage-workload-architecture-taxonomy-vanlightly.md`

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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/storage-workload-architecture-taxonomy-vanlightly.md)

---

