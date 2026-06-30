# Building Jaeger’s ClickHouse backend: 8.6× compression on 10 million spans

## Ch01.041 Building Jaeger’s ClickHouse backend: 8.6× compression on 10 million spans

> 📊 Level ⭐ | 8.1KB | `entities/23-building-jaegers-clickhouse-backend-8-6x-compression-on-10-million-spans.md`

# Building Jaeger’s ClickHouse backend: 8.6× compression on 10 million spans

> **来源**: [Building Jaeger’s ClickHouse backend: 8.6× compression on 10 million spans](https://cncf.io/blog/2026/06/23/building-jaegers-clickhouse-backend-8-6x-compression-on-10-million-spans/)

Published Time: 2026-06-23T11:00:00+00:00

Markdown Content:
Posted on June 23, 2026 by Mahad Zaryab, CNCF Jaeger Project Maintainer and Software Engineer at Meta

CNCF projects highlighted in this post

[![Image 1: Jaeger logo](https://landscape.cncf.io/logos/5877af58428f6cd35e6dc2df2afe82af3b90853bd191670a60111e6e8c01ea54.svg)](https://www.cncf.io/projects/jaeger "Go to Jaeger")

As someone who’s been maintaining[Jaeger](https://www.jaegertracing.io/), I’ve watched users request[ClickHouse](https://clickhouse.com/)support consistently over the past few years. With Jaeger v2.18.0, we’ve finally delivered it. What excites me most isn’t just that ClickHouse is available—it’s that its architecture is practically custom-built for telemetry at scale. It swallows massive, append-only write streams and handles complex analytical aggregations in milliseconds, offering teams a highly efficient, production-grade storage backend.

For those new to the project, Jaeger is a graduated Cloud Native Computing Foundation (CNCF)distributed tracing platform built to monitor and troubleshoot complex microservices. It tracks requests across service boundaries to expose latency bottlenecks and root causes, ultimately reducing a team’s mean time to repair (MTTR). By natively integrating ClickHouse, Jaeger can now leverage columnar storage to deliver blazing-fast query performance and high-ratio data compression for billions of spans.

In this post, I’ll explain why ClickHouse is a strong choice for storing traces, how the schema is designed under the hood, and how you can start using it with Jaeger today.

## Why columnar storage wins

At its core, the tracing problem is twofold: storing massive volumes of semi-structured event data and then searching that data quickly across multiple dimensions—service, operation, tags, duration, time range, and trace ID. Cassandra and Elasticsearch have served the Jaeger community well, but they come with operational costs. Indexing overhead adds latency and expense. Scaling becomes complex. Retention decisions force painful tradeoffs.

### High-throughput ingest and low-latency queries

ClickHouse is a column-oriented[OLAP database](https://thenewstack.io/how-to-run-olap-and-oltp-together-without-resource-contention/)designed for exactly these constraints: high-throughput ingestion, aggressive compression, and fast analytical queries. For tracing, this is nearly ideal. Trace data is repetitive by nature—the same service names, operation names, status codes, and tags appear over and over. A columnar layout thrives on that repetition.[](https://cncf.io/?utm_content=sponsor+module)

> “Trace data is repetitive by nature—the same service names, operation names, status codes, and tags appear over and over. A columnar layout thrives on that repetition.”

### Compression that actually matters

We measured significant compression gains on trace data. Service names like “auth-service” or “payment-gateway” appear hundreds of thousands of times. Same with operation names, tag keys, and status codes. In a row-oriented database, that redundancy goes uncompressed. In a column-oriented one, ClickHouse groups identical values, making them trivial to compress. The result? An 8.6× compression ratio on the spans table in our benchmarks.

### Real-time analytics

ClickHouse also opens the door to more complex analytical queries on trace data. Because aggregations are highly efficient on columnar storage, Jaeger v2.18 includes native ClickHouse SPM methods to directly compute service-level latency, call rates, and error rates from your stored spans. This allows teams to generate core health and performance metrics for their microservices straight from their trace data, without needing an external metrics pipeline.

## Designing the schema

Schema design was where things got tricky. We needed to optimize for Jaeger’s core query patterns: trace lookup by trace ID, service, and operation; attribute filtering; time-range queries; and the aggregation powering the[Service Performance Monitoring (SPM)](https://www.jaegertracing.io/docs/2.17/architecture/spm/)feature. These constraints don’t all pull in the same direction.

There’s an excellent earlier[post](https://medium.com/jaegertracing/making-design-decisions-for-clickhouse-as-a-core-storage-backend-in-jaeger-62bf90a979d)by Ha Anh Vu that benchmarked ClickHouse schemas for Jaeger v1, and that work laid the foundation. However, Jaeger v2 adopts the OpenTelemetry data model, which forces us to revisit several decisions.

The design space is documented in detail in an[Architectural Decision Record (ADR)](https://github.com/jaegertracing/jaeger/blob/v2.18.0/docs/adr/008-clickhouse-storage-schema.md). The sections below walk through some of the key decisions worth understanding.

### Trade-offs in primary key

In ClickHouse, the primary key isn’t a uniqueness constraint. Instead, it defines the on-disk sort order and powers a sparse index (one index per 8,192-row granule). Picking it is the single highest-leverage decision in the schema.

We had two candidates for choosing a primary key:

1.   **Optimize for trace retrieval:**sort by trace_id. Every span of a trace lands in one contiguous block, so GetTrace is a single seek + sequential read. However, search queries pay for this optimization, as the service_name and operation_name filters cannot use the primary key index at all.
2.   **Optimize for search (chosen):**sort by (service_name, name, start_time). Search queries that filter by service, operation, and a time window become direct primary-key lookups.

The decision came down to an asymmetric trade-off. Sorting by trace_id makes search performance terrible, but sorting by (service_name, name, start_time) hurts trace retrieval much less, because we can recover most of the lost performance with two cheap mechanisms:

1.   A bloom_filter skip index on trace_id, which lets the engine prove a granule can’t contain a given ID without reading it.
2.  

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/23-building-jaegers-clickhouse-backend-8-6x-compression-on-10-million-spans.md)

---

