# Building Jaeger’s ClickHouse backend: 8.6× compression on 10 million spans

> 📊 Level ⭐⭐⭐ | 13.8KB

*Mahad Zaryab (Jaeger maintainer, Software Engineer at Meta) · CNCF blog · 2026-06-23. ClickHouse ships as an alpha storage backend in Jaeger v2.18.0.*

## 摘要

Jaeger v2.18.0 finally ships ClickHouse as a native storage backend, closing a request maintainers had fielded for years. The author's argument is architectural rather than feature-level: trace data is append-only, highly repetitive along a handful of dimensions (service, operation, status code, tag key), and therefore a poor match for systems that spend work maintaining per-document inverted indexes. The real substance of the post is the schema argument — whether to sort spans by `trace_id` for fast `GetTrace`, or by `(service_name, name, start_time)` for fast search — resolved by measuring how asymmetric the two losses actually are. On a single node holding 10 million spans across 1 million traces, the backend ingested more than 50k spans/sec, compressed the spans table 8.6× (roughly 6 GiB down to about 722 MiB), and served trace retrieval in about 100 ms with most searches under 50 ms.

## 核心要点

- **8.6× compression on the spans table**: "nearly 6 GiB" of span data reduced to "roughly 722 MiB" on disk in the benchmark.
- **10 million spans across 1 million traces, single node**: that is the entire benchmark footprint — not a cluster test.
- **More than 50k spans/sec** sustained ingestion on that single node.
- **Primary key is not a uniqueness constraint**: it defines on-disk sort order and backs a sparse index with one entry per 8,192-row granule, which is why choosing it is "the single highest-leverage decision in the schema."
- **Chosen sort order `(service_name, name, start_time)`**: queries filtering service + operation + time window become direct primary-key lookups.
- **Rejected sort order `trace_id`**: trace spans land contiguously (single seek + sequential read), but `service_name` / `operation_name` filters cannot use the primary index at all.
- **Measured asymmetry**: sorting by `trace_id` gave ~27 ms trace retrieval but ~880 ms search; re-sorting gave ~100 ms retrieval and ~140 ms multi-filter search.
- **`bloom_filter` skip index on `trace_id`**: lets the engine prove a granule cannot contain a given ID without reading it.
- **`trace_id_timestamps` materialized view**: supplies each matching trace's time bounds so the follow-up `GetTraces` call can prune partitions and granules.
- **Five attribute levels** (resource, scope, span, event, link) with one `Nested` column per primitive type (Bool, Int64, Float64, String, plus Bytes/Slice/Map), disambiguated by an `attribute_metadata` table.
- **Alpha in v2.18.0**, with native SPM methods computing service-level latency, call rate, and error rate from spans without an external metrics pipeline.

## 深度分析

### The sort key is the schema

ClickHouse differs from a B-tree store in a way that reorganises the whole design: the primary key does not enforce uniqueness, it declares the physical order of rows and seeds a sparse index — one entry per 8,192-row granule. Everything downstream follows from that. Compression ratio depends on how many consecutive rows share a value; skip-index usefulness depends on whether predicates correlate with the sort order; and query latency is largely a question of how many granules the engine can eliminate before reading. Picking the sort key is therefore not a tuning knob but the schema's thesis statement.

The two candidates map onto the two query families Jaeger actually serves. `GetTrace` wants every span of one trace adjacent, which `trace_id` ordering delivers as one seek plus a sequential read. Search wants service, operation, and time window, which `(service_name, name, start_time)` delivers as a prefix lookup. The two orders are close to mutually exclusive, and the post is candid that the constraints "don't all pull in the same direction."

### Why the asymmetry decided it

The benchmark made the tradeoff legible instead of rhetorical. Under `trace_id` ordering, retrieval cost 27 ms and search cost 880 ms. Under `(service_name, name, start_time)`, retrieval rose to about 100 ms while multi-filter search fell to about 140 ms. In ratio terms the search path gained roughly 6.3× while the trace path lost roughly 3.7× — but the ratios matter less than the absolute numbers. 100 ms is comfortably inside an interactive budget; 880 ms is not.

There is a second, structural reason the trade is lopsided. The trace path is recoverable because the caller already knows the exact key it wants — a `trace_id` is a precise, high-selectivity predicate that an auxiliary structure can shortcut. The search path is not recoverable in the same way: a service-and-time-window query has no single key to look up, so once the sort order stops matching it, every candidate granule must be read. Degrading the recoverable path and protecting the unrecoverable one is the actual decision rule here, and it generalises well beyond Jaeger.

### Two cheap mechanisms instead of one expensive index

Rather than accept the regression, the design buys the trace path back twice. A `bloom_filter` skip index on `trace_id` gives a per-granule probabilistic membership test: a negative answer is definitive, so the engine can drop a granule without reading it, and a false positive only costs an unnecessary read. The `trace_id_timestamps` materialized view attacks the same problem from the other side — the search path first learns when each matching trace occurred, and that time information lets the subsequent `GetTraces` call prune partitions and granules before touching the spans table.

The economics are the interesting part: both mechanisms are auxiliary structures over an existing table, not a second copy of the data, and both are paid for on write rather than on every read. Compared with the alternative — keeping `trace_id` order and accepting 880 ms searches — this is close to free. ClickHouse also makes the pattern cheap by construction, since materialized views incrementally transform inserts into target tables rather than requiring a batch job.

### Typed attributes and the five-level ambiguity

Jaeger v1 stored tags as strings. The v2 reader API accepts a typed map whose values may be Bool, Int64, Float64, String, or a complex type such as Bytes, Slice, or Map, and the storage layer cannot collapse that back to strings without losing filter semantics. The schema answers with one `Nested` column per primitive type, repeated at each of the five levels — resource, scope, span, event, and link — effectively a small table inside every row.

That solves storage but creates a resolution problem at query time. For a filter like `http.status_code=200`, nothing in the request says whether "200" is a string or an integer, nor whether the attribute was recorded on the span or inherited from the resource. The same logical key can legitimately live in `str_attributes` or `int_attributes` at any of five levels, and different services may make different choices. Without extra metadata the reader would have to scan every type/level combination. The `attribute_metadata` table, populated by materialized views off the spans table, lets the reader resolve the key first and then query only the columns where that key was actually observed.

The residual cost is honest and worth stating: attribute-only searches cannot use the primary index, because the index is built around top-level structural fields — service, operation, time. The post's guidance is therefore not "attributes are indexed" but "always combine attribute filters with structural ones," which is a design constraint pushed onto users rather than solved by the engine.

### What the benchmark does and does not establish

The benchmark reports ingestion throughput — more than 50k spans/sec — but says nothing about part counts, batch sizes, flush intervals, or merge behaviour. For a columnar store that is the half of the system most likely to bite in production: too many small inserts create too many parts, and the merge backlog becomes the real latency source. The post does not claim otherwise; it simply leaves the write path as the next thing to characterise, and the alpha label is consistent with that.

The broader caveat is scale. The framing promises compression "for billions of spans," while the measurement covers 10 million spans and 1 million traces on one node. Those are different regimes: 8.6× is a property of how repetitive this dataset is, and low-cardinality columns like service name and status code compress far better than high-cardinality ones like span IDs or free-text tags. There are no numbers for replication, high availability, retention or TTL behaviour, cluster query fan-out, or compression measured across the whole footprint rather than the spans table alone.

What survives those caveats is the shape of the decision rather than its magnitudes. The 27 ms versus 880 ms gap is not noise — it follows mechanically from whether the sort order matches the predicate, and it would appear in any dataset with the same query mix. The specific latencies will move with cardinality, disk, and concurrency; the asymmetry will not.

## 实践启示

1. **Choose the sort key by pricing the loss, not by ranking query popularity.** The question is not which query runs most often but which degradation is tolerable in absolute terms — 100 ms passes an interactive test, 880 ms fails it, regardless of traffic mix.
2. **Degrade the recoverable access path, protect the unrecoverable one.** A known-key lookup can be shortcut by a skip index or a lookup table; a multi-dimensional filter cannot. Sort for the query that has no fallback.
3. **Recover a lost path with auxiliary structures before duplicating data.** A `bloom_filter` skip index plus a small materialized view bought back most of the trace path at write cost, with no second copy of the spans.
4. **Treat attribute-only queries as an anti-pattern in the schema, not a feature gap.** If the primary index covers service/operation/time, require those predicates alongside attribute filters, and document the rule where query authors will read it.
5. **Resolve polymorphic fields through metadata, not wider queries.** One `attribute_metadata` table beats scanning five levels times four type columns, and it keeps the read path's column count proportional to what was observed.
6. **Do not size a deployment from this benchmark.** Single node, 10M spans, alpha, no HA or retention data — reproduce the measurement at your own cardinality and write rate before committing retention policy to it.

## 相关实体

- [ClickHouse Ingestion at Scale: An Open-Source Zepto Engineering Story](https://github.com/QianJinGuo/wiki-public/blob/main/entities/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story.md) — the write path, batching, and part management that this post leaves under-described.
- [Observability Platform](https://github.com/QianJinGuo/wiki-public/blob/main/entities/observability-platform.md) — where a trace store sits relative to metrics, logs, and the SPM layer built on top of spans.
- [Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](https://github.com/QianJinGuo/wiki-public/blob/main/entities/dynamically-splitting-wide-partitions-in-cassandra-for-time-.md) — the operational tax on the Cassandra path that columnar ordering avoids.
- [elasticpp：重塑 Elasticsearch 查询性能的 C++ 内核引擎](https://github.com/QianJinGuo/wiki-public/blob/main/entities/elasticpp重塑elasticsearch查询性能的c内核引擎.md) — the inverted-index side of the tradeoff, and what it costs to make it fast.
- [OpenTelemetry eBPF Instrumentation (OBI)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-telemetry-ebpf-instrumentation-obi-zero-code-observability-aliyun-2026.md) — a zero-code source of the span volume this backend has to absorb.
- [LLM 可观测性 4 层模型与工具栈](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-observability-4-layer-model.md) — how trace storage fits the broader telemetry stack.

→ [原文存档](https://cncf.io/blog/2026/06/23/building-jaegers-clickhouse-backend-8-6x-compression-on-10-million-spans/)

---

