# ClickHouse Ingestion at Scale: An Open-Source Zepto Engineering Story

> 📊 Level ⭐⭐⭐ | 10.8KB

[![Image 1: Zepto Tech](https://miro.medium.com/v2/da:true/resize:fill:64:64/0*Zdo4al9KE5LuqNxm)](https://medium.com/@tech.culture?source=post_page---byline--7f57309e2175---------------------------------------)

![Image 2](https://miro.medium.com/v2/resize:fit:700/0*RaaiaRuTYvCKxyMs.png)

Much like our journey described in[_Debezium at Scale_](https://blog.zeptonow.com/debezium-at-scale-an-open-source-cdc-story-from-zepto-aa4b12e32bf7), our architecture relies heavily on real-time data flow. To understand user journeys, track operational metrics, and power our growth, we built **Lucid** — Zepto’s completely in-house product analytics engine designed to replace Mixpanel.

Lucid captures millions of events per minute, routes them through Kafka, and dumps them into ClickHouse to give us lightning-fast, high-precision insights without the third-party SaaS pricing trap. We use **Confluent Cloud** to manage our Kafka infrastructure and the**in-house** ClickHouse Sink Connector. It was seamless — until our scale broke the default physics.

Every hyper-growth engineering team eventually hits a wall where managed abstractions turn from a blessing into a bottleneck. For us, that wall appeared right at the intersection of Apache Kafka and ClickHouse.

To ingest billions of events into ClickHouse for **Lucid** at a sustained throughput of **10 MB/s (peaking up to 15–20 MB/s),** we hit a wall with Confluent Cloud’s managed infrastructure because its managed nature restricted our access to low-level broker and connector tuning. Instead of migrating our entire Kafka ecosystem, we proved our batching hypothesis on an In-house Kafka Proof-of-Concept, and then built that buffering logic directly into the open-source ClickHouse Kafka Connect framework. By rewriting core parts of the connector, we boosted ingestion by **45%**, eliminated crippling GC pauses, and drastically reduced ClickHouse insert pressure.

This is the story of how we overcame the **black box of managed cloud**, the hidden performance killers we found in the open-source connector, and the two major pull requests we merged to fix them and contribute back to the community.

## 深度分析

### The architecture and the shape of the load

**Lucid** is Zepto's fully in-house product-analytics engine, built to replace Mixpanel: it captures millions of events per minute, routes them through Kafka, and lands them in ClickHouse for low-latency insight without third-party SaaS pricing. The managed half of the stack is Confluent Cloud; the owned half is an in-house ClickHouse Sink Connector. The load that eventually broke the defaults: billions of events at a sustained **10 MB/s, peaking at 15–20 MB/s**.

### The wall was a flush policy, not a throughput ceiling

Facing consumer-group lag, the team first suspected broker-side fetch limits — KIP-541 caps `fetch.max.bytes` at 55 MB by default in open-source Kafka. Confluent Cloud's Kora engine exposes no one-to-one equivalent: it enforces cluster capacity guardrails, partition-level ingress/egress limits, and connector throughput limits instead. That suspect was wrong. A "5 Whys" chain ran the symptom down into the code — the cluster threw `Too many parts in order by` because a columnar store that thrives on large, infrequent inserts was receiving thousands of tiny inserts per minute; those existed because the sink's flush cadence was hard-wired to the consumer's `poll()` loop, so `ClickHouseSinkTask.java` flushed exactly as many rows as a single poll returned (a 500-record poll flushed 500 records). Every consumer override was tried (`fetch.min.bytes`, `fetch.max.wait.ms`, `max.poll.records`, timeouts) and none closed the gap: with broker fetch capped at 20–55 MB and an average record of ~3 KB, the ceiling was ~7,000–18,000 records per poll, ~7,000–9,000 in practice — one `poll()` cycle cannot mathematically assemble the batch ClickHouse wants, which is why Kafka Connect has no native connector-level batch control. The generalizable reading: the engine was never too slow; the abstraction's default policy simply did not match the workload's shape.

### The fix path: prove it cheaply, then change the open core

Three steps, in increasing cost. First, an in-house Kafka PoC: with the low-level polling and fetch knobs finally under their control, the pipeline stabilized instantly — hypothesis proven, and a wholesale migration off Confluent Cloud ruled out in the same breath. Second, PR #658 moved buffering inside the connector and decoupled flushing from the `poll()` lifecycle with two new knobs: `bufferCount` (records to accumulate across multiple polls before flushing) and `bufferFlushTime` (maximum wait in milliseconds). INSERTs hitting ClickHouse dropped by more than an order of magnitude, the too-many-parts errors vanished, and cluster health stabilized. Third, PR #676 removed a silent CPU killer: worker CPU pegged at ~80% with runaway GC, and the flame graph pointed at JSON serialization rather than network I/O or compression. The connector was instantiating per-call Gson objects for every record and doing Struct → UTF-16 Java String → `.getBytes(UTF_8)`, allocating gigabytes of throwaway strings per minute on the hottest path; it was replaced by a shared static Jackson `ObjectMapper` using `writeValueAsBytes()` (straight to UTF-8 bytes) plus a custom `JsonSerializer<Struct>`. Net outcome: ingestion up roughly **45%**, GC pauses eliminated, ClickHouse insert pressure drastically reduced.

### Open source as the escape hatch from a managed ceiling

Three exits existed: buy a bigger managed tier, migrate the entire Kafka estate, or change the software underneath. The first does not remove the mismatch — the guardrails still hide the knobs that matter; the second is a platform-scale migration the team declined; the third was taken, and was only available because the ClickHouse Kafka Connect framework is open source. They could rewrite batching semantics inside the sink task, replace the hot-path serializer, and kill per-call allocation — none of which a managed connector exposes as configuration. The cost is real (fork maintenance, upstream review latency, divergence risk); the return is a permanent configuration surface instead of a support ticket, merged back so the community inherits it. Both root causes were independently corroborated: discussion #400 showed consumer-level fetch overrides cannot accumulate batches without broker-side tuning, and a commenter on PR #658 reported production v1.3.5 issuing one INSERT per partition per poll (~45 partitions per task), collapsing overnight throughput to ~750 records/s against a ~50K/s recovery need. Read beside Zepto's own [Real-Time Personalisation at Scale](https://github.com/QianJinGuo/wiki-public/blob/main/entities/zepto-real-time-personalisation-dual-sequence-ranker.md), this is the ingestion half of the same in-house-infrastructure bet; it also rhymes with [Building Jaeger's ClickHouse Backend](https://github.com/QianJinGuo/wiki-public/blob/main/entities/23-building-jaegers-clickhouse-backend-8-6x-compression-on-10-million-spans.md), where ClickHouse wins come from matching write shape to the storage engine, and with the [Storage/Workload Architecture Taxonomy](https://github.com/QianJinGuo/wiki-public/blob/main/entities/storage-workload-architecture-taxonomy-vanlightly.md), which frames the split between a platform's guardrails and the workload semantics you actually need to control.

## 实践启示

1. **Treat batch size and flush interval as first-class capacity parameters** — for a columnar sink, flush policy is a bigger lever than raw broker or database throughput.
2. **Run the "5 Whys" down to the code line before buying more capacity.** "Too many parts" resolved to `poll()` coupling in `ClickHouseSinkTask.java`, not to "ClickHouse is too slow"; do the arithmetic (record size × fetch cap) to prove one poll can never satisfy the sink.
3. **Prove the hypothesis on a throwaway PoC first.** A small in-house Kafka cluster found the knobs in hours and simultaneously ruled out the expensive migration.
4. **Profile before optimizing, and suspect serialization on hot paths.** A throughput cap that looked like network I/O was GC churn from per-record Gson instances and UTF-16 → UTF-8 conversion; prefer direct-to-bytes serializers and shared static mappers.
5. **Know where the door is in a managed abstraction.** When a managed connector becomes the ceiling, check whether the open-source dependency beneath it can be changed before paying for a higher tier or migrating.
6. **Quantify the result and push the fix upstream.** Measured gains (≈45% ingestion, GC pauses gone, order-of-magnitude fewer inserts) plus merged PRs turn a fragile local patch into permanent product capability, with community threads supplying independent validation.

## The Inciting Incident: The Confluent Cloud Black Box

→ [原文存档](https://blog.zepto.com/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story-7f57309e2175)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

