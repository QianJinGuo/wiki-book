---
source_url: "https://blog.zepto.com/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story-7f57309e2175""
ingested: 2026-06-26
sha256: f5cdf1dd2f70953b
---

# ClickHouse Ingestion at Scale: An Open-Source Zepto Engineering Story


Published Time: 2026-06-17T08:59:02Z

Markdown Content:
[![Image 1: Zepto Tech](https://miro.medium.com/v2/da:true/resize:fill:64:64/0*Zdo4al9KE5LuqNxm)](https://medium.com/@tech.culture?source=post_page---byline--7f57309e2175---------------------------------------)

8 min read

5 days ago

Press enter or click to view image in full size

![Image 2](https://miro.medium.com/v2/resize:fit:700/0*RaaiaRuTYvCKxyMs.png)

Much like our journey described in[_Debezium at Scale_](https://blog.zeptonow.com/debezium-at-scale-an-open-source-cdc-story-from-zepto-aa4b12e32bf7), our architecture relies heavily on real-time data flow. To understand user journeys, track operational metrics, and power our growth, we built **Lucid** — Zepto’s completely in-house product analytics engine designed to replace Mixpanel.

Lucid captures millions of events per minute, routes them through Kafka, and dumps them into ClickHouse to give us lightning-fast, high-precision insights without the third-party SaaS pricing trap. We use **Confluent Cloud** to manage our Kafka infrastructure and the**in-house** ClickHouse Sink Connector. It was seamless — until our scale broke the default physics.

Every hyper-growth engineering team eventually hits a wall where managed abstractions turn from a blessing into a bottleneck. For us, that wall appeared right at the intersection of Apache Kafka and ClickHouse.

To ingest billions of events into ClickHouse for **Lucid** at a sustained throughput of **10 MB/s (peaking up to 15–20 MB/s),** we hit a wall with Confluent Cloud’s managed infrastructure because its managed nature restricted our access to low-level broker and connector tuning. Instead of migrating our entire Kafka ecosystem, we proved our batching hypothesis on an In-house Kafka Proof-of-Concept, and then built that buffering logic directly into the open-source ClickHouse Kafka Connect framework. By rewriting core parts of the connector, we boosted ingestion by **45%**, eliminated crippling GC pauses, and drastically reduced ClickHouse insert pressure.

This is the story of how we overcame the **black box of managed cloud**, the hidden performance killers we found in the open-source connector, and the two major pull requests we merged to fix them and contribute back to the community.

## The Inciting Incident: The Confluent Cloud Black Box

Confluent Cloud is an incredible platform for getting off the ground quickly. But as our event volume skyrocketed, we noticed lag accumulating on our consumer groups.

When you operate at scale, tuning becomes everything. We initially suspected the bottleneck was tied to broker-side fetch limits. In open-source Kafka, [**KIP-541**](https://ossip.dev/kips/KIP-541.html)sets the default _fetch.max.bytes_ to **55MB** to protect brokers from rogue consumers. We thought this was our culprit and wanted to tune these low-level broker settings to optimize for ClickHouse’s unique ingestion patterns.

But Confluent Cloud is a fully managed SaaS service, by design, it operates as a black box. Through our own deep dive into Confluent Cloud’s underlying architecture (**the Kora engine**), we realized it doesn’t have a **1–1 match** for these open-source Kafka configs. Because it is fully managed, CC relies on strict cluster capacity guardrails, partition-level ingress/egress limits, and connector throughput limits to protect the environment.

The broker-side batch size is limited only by cluster capacity. To get the ingestion speed we needed, our focus had to shift to connector poll configurations and scaling up tasks to bypass the CC connector throughput limits.

_We were driving a sports car, but we were locked out of the engine bay. We couldn’t tune the broker, so we had to adjust how we drove_.

## The In-house Kafka Proof of Concept

We suspected that if we could just control the batch sizes and flush intervals, we could stabilize the pipeline. To prove this hypothesis, we spun up a quick poc on In-house Kafka.

It gave us the configuration knobs we needed. We tuned the low-level polling and fetching behaviour, and instantly, the pipeline stabilized. The hypothesis was proven.

But migrating our massive production Kafka infrastructure off Confluent Cloud wasn’t a path we wanted to take. We started looking into whether we could force Kafka Connect itself to batch records. We weren’t alone in this struggle. In a[community discussion (#400)](https://github.com/ClickHouse/clickhouse-kafka-connect/discussions/400), another engineer noticed that standard Kafka Connect consumer overrides like _fetch.max.wait.ms_ and _fetch.min.bytes_ were failing to accumulate large enough batches without tuning broker configs for ClickHouse before flushing.

The maintainers clarified that Kafka Connect’s out-of-the-box polling behaviour fundamentally lacks native connector-level batch size controls. When you pair this lack of connector-level batching with Confluent Cloud’s strict broker-level limits, you are stuck. As we pointed out in that very thread: _“In Confluent Cloud, how can this problem be solved without batching?”_

The answer was simple: it couldn’t.

**The Decision:** Since we couldn’t tune the cloud environment, and Kafka Connect lacked the native capabilities, we had to shift our focus and build custom buffering intelligence directly into the open-source ClickHouse connector itself.

## Trial 1: The “Too Many Parts” Problem

Before our buffering implementation, the ClickHouse cluster was throwing alarms constantly. The error logs were flooded with:

DB::Exception: Too many parts in order by…
## The 5 Whys: Uncovering the Polling Flaw

To get to the root of the issue, we ran a quick “5 Whys” analysis:

1.   **Why is the ClickHouse cluster choking?** Because it’s throwing constant “_Too many parts in order by_” exceptions.
2.   **Why are there too many parts?** Because ClickHouse (a columnar DB that thrives on large, infrequent inserts) is receiving thousands of tiny inserts per minute.
3.   **Why are we doing tiny inserts?** Because the ClickHouse Kafka sink connector is flushing data too frequently.
4.   **Why is it flushing so frequently?** Because when we looked at the [_ClickHouseSinkTask.java_](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/src/main/java/com/clickhouse/kafka/connect/sink/ClickHouseSinkTask.java), we found that the flush behaviour was strictly coupled to the Kafka consumer’s _poll()_ loop. If a poll returned 500 records, it immediately flushed 500 records.
5.   **Why can’t we just configure the poll to return larger batches?** We tried. We maxed out every consumer override we could throw at the connector

consumer.override.fetch.min.bytes

consumer.override.fetch.max.wait.ms

consumer.override.request.timeout.ms

consumer.override.max.poll.records

consumer.override.max.poll.interval.ms

consumer.override.session.timeout.ms

consumer.override.heartbeat.interval.ms
But math always wins. Our broker’s `fetch.max.bytes` were rigidly capped around 20–55 MB per fetch. With an average record size of **~3 KB**, the theoretical maximum ranged from roughly **7,000 to 18,000** records per poll. In practice, due to partition-level fetch limits and consumer behaviour, we typically observed **7,000–9,000** records per poll. It was mathematically impossible to build a batch large enough to satisfy ClickHouse within a single _poll()_ cycle. Confluent Cloud’s managed guardrails only made this worse, restricting our ability to dictate the broker-side fetch sizes needed to close the gap.

## Get Zepto Tech’s stories in your inbox

Join Medium for free to get updates from this writer.

Remember me for faster sign in

Our motivation for the fix drew philosophical inspiration from Confluent’s well-known article on[Kafka consumer multi-threaded messaging](https://www.confluent.io/blog/kafka-consumer-multi-threaded-messaging/). While that post focuses on spawning multiple worker threads to process messages(eg: IO-bound processing) truly independently of the main polling thread, the underlying principle is identical: **you must decouple the strict, synchronous cadence of the poll() loop from your downstream processing and I/O strategy.**

## The Fix: Decoupling Polling from Flushing ([PR #658](https://github.com/ClickHouse/clickhouse-kafka-connect/pull/658))

We needed a buffer that transcended the _poll()_ lifecycle. We dove into the codebase and introduced an internal buffering implementation.

We added two new configuration options:

*   _bufferCount_: The number of records to accumulate across _multiple_ poll calls before flushing.
*   _bufferFlushTime_: The maximum time in milliseconds to wait before flushing, regardless of the count.

By accumulating records in memory and flushing them as a single large batch, we reduced the number of _INSERT_ queries hitting ClickHouse by over an order of magnitude. The _Too many parts errors_ vanished, and cluster health stabilized.

**Community Validation:** We weren’t the only ones suffering from this. In the [PR comment](https://github.com/ClickHouse/clickhouse-kafka-connect/pull/658#issuecomment-4013479232) for our buffering fix, another GitHub user, highlighted exactly how this lack of buffering destroyed throughput. They noted that running **v1.3.5** in production, the connector was making one ClickHouse INSERT _per partition per poll cycle_. With ~45 partitions per task, this resulted in severe degradation during low traffic, dropping to ~750 records/sec overnight when they needed ~50K records/sec just to recover from the peak-hour backlog. They urged the maintainers to prioritise our PR, validating that we had directly addressed the root cause.

## Trial 2: The Silent CPU Killer

We resolved the database pressure, but our throughput remained inexplicably capped. Our Kafka Connect worker CPU usage was pegged at 80%, and Garbage Collection (GC) pauses were out of control.

We attached a profiler, expecting to see network I/O or compression as the culprit. Instead, the flame graph pointed directly to JSON serialisation.

## The Culprit: Gson and UTF-16 String Allocations

The open-source connector was using Google’s Gson library for JSON serialisation (doInsertJsonV1/V2). For every single record, the connector instantiated per-call Gson instances and executed a fundamentally expensive operation:

1.   It serialized the Java Struct into a UTF-16 Java String.
2.   It then called _.getBytes(StandardCharsets.UTF\_8)_ to convert that String into a byte array for the network payload.

At million of events per minute, allocating and destroying gigabytes of intermediate UTF-16 String objects was completely overwhelming the JVM Garbage Collector. It was a massive GC churn on the hottest path in the application.

## The Fix: Jackson writeValueAsBytes ([PR #676](https://github.com/ClickHouse/clickhouse-kafka-connect/pull/676))

We ripped out the per-call Gson instances and replaced them with a shared, static Jackson _ObjectMapper_.

Jackson has a massive advantage here: writeValueAsBytes(). This method serialises Java objects _directly_ into UTF-8 byte arrays, completely bypassing the intermediate UTF-16 String allocation.

String gsonString = gson.toJson(cleanupExtraFields(data, table), gsonType);

byte[] bytes = gsonString.getBytes(StandardCharsets.UTF_8);// After (The Jackson Speed Demon):

Map<String, Object> cleaned = cleanupExtraFields(data, table);

byte[] bytes = OBJECT_MAPPER.writeValueAsBytes(cleaned);
We also registered a custom _JsonSerializer<Struct>_ so Jackson could cleanly serialize Kafka Connect Struct objects as `_{field: value}`_ JSON (replacing Gson’s reflection-based internals, which exposed schema data).

## The Impact

The performance gains were staggering. Production measurements showed:

Press enter or click to view image in full size

Press enter or click to view image in full size

![Image 3](https://miro.medium.com/v2/resize:fit:700/0*FwkJNuo9m6JYEU9c.png)

## The Return: Contributing Back

We didn’t just patch
