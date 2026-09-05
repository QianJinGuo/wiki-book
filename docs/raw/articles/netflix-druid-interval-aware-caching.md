---
source: rss
source_url: https://netflixtechblog.com/stop-answering-the-same-question-twice-interval-aware-caching-for-druid-at-netflix-scale-22fadc9b840e?source=rss----2615bd06b42e---4
ingested: 2026-06-07
feed_name: Netflix Tech Blog
source_published: 2026-04-06
sha256: c2dd1941ed96eaba638995e709241a5211b71cca38c1e464a201aad34285f2ae
---

# Stop Answering the Same Question Twice: Interval-Aware Caching for Druid at Netflix Scale

_By_[ _Ben Sykes_](<https://www.linkedin.com/in/sykesb/>)

In a [previous post](<https://netflixtechblog.com/how-netflix-uses-druid-for-real-time-insights-to-ensure-a-high-quality-experience-19e1e8568d06>), we described how Netflix uses Apache Druid to ingest millions of events per second and query trillions of rows, providing the real-time insights needed to ensure a high-quality experience for our members. Since that post, our scale has grown considerably.

With our database holding over 10 trillion rows and regularly ingesting up to 15 million events per second, the value of our real-time data is undeniable. But this massive scale introduced a new challenge: queries. The live show monitoring, dashboards, automated alerting, canary analysis, and A/B test monitoring that are built on top of Druid became so heavily relied upon that the repetitive query load started to become a scaling concern in itself.

This post describes an experimental caching layer we built to address this problem, and the trade-offs we chose to accept.

### **The Problem**

Our internal dashboards are heavily used for real-time monitoring, especially during high-profile live shows or global launches. A typical dashboard has 10+ charts, each triggering one or more Druid queries; one popular dashboard with 26 charts and stats generates 64 queries per load. When dozens of engineers view the same dashboards and metrics for the same event, the query volume quickly becomes unmanageable.

Take the popular dashboard above: 64 queries per load, refreshing every 10 seconds, viewed by 30 people. That’s 192 queries per second from one dashboard, mostly for nearly identical data. We still need Druid capacity for automated alerting, canary analysis, and ad-hoc queries. And because these dashboards request a rolling last-few-hours window, each refresh changes slightly as the time range advances.

Druid’s built-in caches are effective. Both the full-result cache and the per-segment cache. But neither is designed to handle the continuous, overlapping time-window shifts inherent to rolling-window dashboards. The full-result cache misses for two reasons.

  * If the time window shifts even slightly, the query is different, so it’s a cache miss.
  * Druid deliberately refuses to cache results that involve realtime segments (those still being indexed), because it values deterministic, stable cache results and query correctness over a higher cache hit rate.



The per-segment cache does help avoid redundant scans on historical nodes, but we still need to collect those cached segment results from each data node and merge them in the brokers with data from the realtime nodes for every query.

During major shows, rolling-window dashboards can generate a flood of near-duplicate queries that Druid’s caches mostly miss, creating heavy redundant load. At our scale, solving this by simply adding more hardware is prohibitively expensive.

We needed a smarter approach.

### The Insight

When a dashboard requests the last 3 hours of data, the vast majority of that data, everything except the most recent few minutes, is already settled. The data from 2 hours ago won’t change.

What if we could remember the older portions of the result and only ask Druid for the part that’s actually new?

This is the core idea behind a new caching service that understands the structure of Druid queries and serves previously-seen results from cache while fetching only the freshest portion from Druid.

### **A Deliberate Trade-Off**

Before diving into the implementation, it’s worth being explicit about the trade-off we’re making. Caching query results introduces some staleness, specifically, up to 5 seconds for the newest data. This is acceptable for most of our operational dashboards, which refresh every 10 to 30 seconds. In practice, many of our queries already set an end time of now-1m or now-5s to avoid the “flappy tail” that can occur with currently-arriving data.

Since our end-to-end data pipeline latency is typically under 5 seconds at P90, a 5-second cache TTL on the freshest data introduces negligible additional staleness on top of what’s already inherent in the system. We decided it was better to accept this small amount of staleness in exchange for significantly lower query load on Druid. But a 5s cache on its own is not very useful.

### Exponential TTLs

Not all data points are equally trustworthy. In real-time analytics, there’s a well-known late-arriving data problem. Events can arrive out of order or be delayed in the ingestion pipeline. A data point from 30 seconds ago might still change as late-arriving events trickle in. A data point from 30 minutes ago is almost certainly final.

We use this observation to set cache TTLs that increase exponentially with the age of the data. Data less than 2 minutes old gets a minimum TTL of 5 seconds. After that, the TTL doubles for each additional minute of age: 10 seconds at 2 minutes old, 20 seconds at 3 minutes, 40 seconds at 4 minutes, and so on, up to a maximum TTL of 1 hour.

The effect is that fresh data cycles through the cache rapidly, so any corrections from late-arriving events in the most recent couple of minutes are picked up quickly. Older data lingers much longer, because our confidence in its accuracy grows with time.

For a 3-hour rolling window, the exponential TTL ensures the vast majority of the query is served from the cache, leaving Druid to only scan the most recent, unsettled data.

### **Bucketing**

If we were to use a single-level cache key for the query and interval, similar to Druid’s existing result-level cache, we wouldn’t be able to extract only the relevant time range from cached results. A shifted window means a different key, which means a cache miss.

Instead, we use a map-of-maps. The top-level key is the query hash without the time interval; the inner keys are timestamps bucketed to the query granularity (or 1 minute, whichever is larger) and encoded as big-endian bytes so lexicographic order matches time. This enables efficient range scans; fetching all cached buckets between times A and B for a query hash. A 3-hour query at 1-minute granularity becomes 180 independent cached buckets, each with its own TTL; when the window shifts (e.g., 30 seconds later), we reuse most buckets from cache and only query Druid for the new data.

### **How It Works**

Today, the cache runs as an external service integrated transparently by intercepting requests at the Druid Router and redirecting them to the cache. If the cache fully satisfies a request, it returns the result; otherwise it shrinks the time interval to the uncached portion and calls back into the Router, bypassing the redirect to query Druid normally. Non-cached requests (e.g., metadata queries or queries without time group-bys) pass straight through to Druid unchanged.

This intercepting proxy design allows us to enable or disable caching without any client changes and is a key to its adoption. We see this setup as temporary while we work out a way to better integrate this capability into Druid more natively.

When a cacheable query arrives, those that are grouping-by time (timeseries, groupBy), the cache performs the following steps.

**Parsing and Hashing.** We parse each incoming query to extract the time interval, granularity, and structure, then compute a SHA-256 hash of the query with the time interval and parts of the context removed. That hash is the cache key: it encodes _what_ is being asked (datasource, filters, aggregations, granularity) but not _when_ , so the same logical query over different overlapping time windows maps to the same cache entry. There are some context properties that can alter the response structure or contents, so these are included in the cache-key.

**Cache Lookup.** Using the cache key, we fetch cached points within the requested range, but only if they’re contiguous from the start. Because bucket TTLs can expire unevenly, gaps can appear; when we hit a gap, we stop and fetch all newer data from Druid. This guarantees a complete, unbroken result set while sending at most one Druid query, rather than “filling gaps” with multiple small, fragmented queries that would increase Druid load.

**Fetching the Missing Tail.** On a partial cache hit (e.g., 2h 50m of a 3h window), we rebuild the query with a narrowed interval for the missing 10 minutes and send only that to Druid. Since Druid then scans just the recent segments for a small time range, the query is usually faster and cheaper than the original.

**Combining.** The cached data and fresh data are concatenated, sorted by timestamp, and returned to the client. From the client’s perspective, the response looks identical to what Druid would have returned, same JSON format, same fields.

**Asynchronous Caching.** The fresh data from Druid is parsed into individual time-granularity buckets and written back to the cache asynchronously, so we don’t add latency to the response path.

### Negative Caching

Some metrics are sparse. Certain time buckets may genuinely have no data. Without special handling, the cache would treat these empty buckets as gaps and re-query Druid for them every time.

We handle this by caching empty sentinel values for time buckets where Druid returned no data. Our gap-detection logic recognizes these empty entries as valid cached data rather than missing data, preventing needless re-queries for naturally sparse metrics.

However, we’re careful not to negative-cache trailing empty buckets. If a query returns data up to minute 45 and nothing after, we only cache empty entries for gaps _between_ data points, not after the last one. This avoids incorrectly caching “no data” for time periods where events simply haven’t arrived yet, which would exacerbate the chart delays of late arriving data.

### The Storage Layer

For the backing store, we use Netflix’s [Key-Value Data Abstraction Layer (KVDAL)](<https://netflixtechblog.com/introducing-netflixs-key-value-data-abstraction-layer-1ea8a0a11b30>), backed by Cassandra. KVDAL provides a two-level map abstraction, a natural fit for our needs. The outer key is the query hash, and the inner keys are timestamps. Crucially, KVDAL supports independent TTLs on each inner key-value pair, eliminating the need for us to manage cache eviction manually.

This two-level structure gives us efficient range queries over the inner keys, which is exactly what we need for partial cache lookups: “give me all cached buckets between time A and time B for query hash X.”

### **Results**

The biggest win is during high-volume events (e.g., live shows): when many users view the same dashboards, the cache serves most identical queries as full hits, so the query rate reaching Druid is essentially the same with 1 viewer or 100. The scaling bottleneck moves from Druid’s query capacity to the much cheaper-to-scale cache, and with ~5.5 ms P90 cache responses, dashboards load faster for everyone.

On a typical day, 82% of real user queries get at least a partial cache hit, and 84% of result data is served from cache. As a result, the queries that reach Druid scan much narrower time ranges, touching fewer segments and processing less data, freeing Druid to focus on aggregating the newest data instead of repeatedly re-querying historical segments.

An experiment validated this, showing about a 33% drop in queries to Druid and a 66% improvement in overall P90 query times. It also cut result bytes and segments queried, and in some cases, enabling the cache reduced result bytes by more than 14x. Caveat: the size of these gains depends heavily on how similar and repetitive the query workload is.

### Looking Ahead

This caching layer is still experimental, but results are promising and we’re exploring next steps. We’ve added partial support for templated SQL so dashboard tools can benefit without writing native Druid queries.

Longer term, we’d like interval-aware caching to be built into Druid: an external proxy adds infrastructure to manage, extra network hops, and workarounds (like SQL templating) to extract intervals. Implemented inside Druid, it could be more efficient, with direct access to the query planner and segment metadata, and benefit the broader community without custom infrastructure. We’d likely ship it as an opt-in, configurable, result-level cache in the Brokers, with metrics to tune TTLs and measure effectiveness. Please leave a comment if you have a use-case that could benefit from this feature.

More broadly, this strategy, splitting time-series results into independently cached, granularity-aligned buckets with age-based exponential TTLs, isn’t Druid-specific and could apply to any time-series database with frequent overlapping-window queries.

### Summary

As more Netflix teams rely on real-time analytics, query volume grows too. Dashboards are essential at our scale, but their popularity can become a scaling bottleneck. By inserting an intelligent cache between dashboards and Druid, one that understands query structure, breaks results into granularity-aligned buckets, and trades a small amount of staleness for much lower Druid load, we’ve increased query capacity without scaling infrastructure proportionally, and hope to deliver these benefits to the Druid community soon as a built-in Druid feature.

Sometimes the best way to handle a flood of queries is to stop answering the same question twice.

* * *

[Stop Answering the Same Question Twice: Interval-Aware Caching for Druid at Netflix Scale](<https://netflixtechblog.com/stop-answering-the-same-question-twice-interval-aware-caching-for-druid-at-netflix-scale-22fadc9b840e>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
