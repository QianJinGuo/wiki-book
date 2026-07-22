---
title: "How we made WINDOW JOIN parallel and vectorized"
sha256: de5e2adbd9bbcdeed0dcc8408b672380695540deafd217be8c4a5a48ee43ae31
source: newsletter
source_url: "https://questdb.com/blog/window-join-parallel-vectorized/"
url: "https://questdb.com/blog/window-join-parallel-vectorized/"
fetcher: jina
review_value: 8
review_confidence: 9
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-14
created: 2026-05-14
updated: 2026-05-14
---
Published Time: 2026-05-12T00:00:00Z
Markdown Content:
QuestDB is the open-source time-series database for demanding workloads—from trading floors to mission control. It delivers ultra-low latency, high ingestion throughput, and a multi-tier storage engine. Native support for Parquet and SQL keeps your data portable, AI-ready—no vendor lock-in.
* * *
Consider a workload that comes up constantly on a trading desk: for every executed trade, attach the average bid and ask within a 1-second window around the trade. Without a dedicated operator it takes two joins, an [ASOF JOIN](https://questdb.com/docs/query/sql/asof-join/) for the carry-forward quote at the window start plus a range join for the rows inside the window, stitched with UNION ALL and folded with a GROUP BY:
WITH prevailing AS (
SELECT t.orig_ts ts, t.symbol, p.bid, p.ask
FROM (
(SELECT (timestamp - 1000000) AS ts, symbol,
timestamp AS orig_ts
FROM trades) TIMESTAMP(ts)
) t
ASOF JOIN prices p ON p.sym = t.symbol
),
in_window AS (
SELECT t.timestamp ts, t.symbol, p.bid, p.ask
FROM trades t
JOIN prices p ON p.sym = t.symbol
WHERE p.ts > t.timestamp - 1000000
AND p.ts <= t.timestamp + 1000000
)
SELECT ts, symbol, avg(bid) avg_bid, avg(ask) avg_ask
FROM (SELECT * FROM prevailing UNION ALL SELECT * FROM in_window)
GROUP BY ts, symbol;
This works, but it's a lot of SQL for a simple operation. The ASOF JOIN and the range JOIN walk the prices table independently even though they are answering two halves of the same question, and the range JOIN forces the planner to hash on `sym` and then re-filter every matched pair against the BETWEEN predicate. The outer GROUP BY over `ts` is a hash aggregation that has to materialize a row per `(ts, symbol)` pair, which works out to 50 million groups in our test data. There is nothing here for the optimizer to fuse, parallelize cleanly, or vectorize.
[WINDOW JOIN](https://questdb.com/docs/query/sql/window-join/) is QuestDB's dedicated syntax for aggregating one table over a time window around each row of another. The same query, dedicated operator:
SELECT t.*, avg(p.bid) avg_bid, avg(p.ask) avg_ask
FROM trades t
WINDOW JOIN prices p
ON p.sym = t.symbol
RANGE BETWEEN 1 second PRECEDING AND 1 second FOLLOWING;
Now the operator knows what it is doing: for every row on the left-hand side of the join (LHS - `trades` here), find rows on the right-hand side (RHS - `prices`) whose timestamp falls inside a `[lo, hi]` window around the LHS timestamp, restrict to matching symbol keys, and reduce them with a batch of aggregate functions.
Making that fast comes down to two pieces: data-level parallelism over the LHS, plus a low-cardinality fast path that copies values into contiguous buffers so the SIMD aggregation kernels we already ship for SAMPLE BY run on window slices unchanged. Benchmarked against Timescale, DuckDB, and ClickHouse on a 50M-row `trades` table joined to a 150M-row `prices` table, the parallel + SIMD path runs **5.0x** faster than QuestDB's own single-threaded fallback and **25x** faster than ClickHouse's best rewrite.
## [Data-level parallelism](https://questdb.com/blog/window-join-parallel-vectorized/#data-level-parallelism)
QuestDB stores data in append-only column files, partitioned by time. The query engine reads them as a sequence of _page frames_: contiguous, columnar slabs of memory that map directly onto file pages. Filtering and aggregation both work at this granularity: a page frame is the unit of dispatch to a worker thread.
WINDOW JOIN follows the same model. The LHS table is sliced into page frames; each worker takes a frame and is responsible for producing the aggregate result for every LHS row in that frame. To do that it needs the RHS rows that fall inside the union of all windows the frame covers.
Concretely, for a frame whose LHS timestamps run from `tLo` to `tHi` with a `[-w_lo, +w_hi]` window, the worker needs RHS rows in `[tLo - w_lo, tHi + w_hi]`. Locating that slice cheaply is what makes the parallel plan viable, and the enabler is QuestDB's storage layout: rows in both tables are kept in [designated timestamp](https://questdb.com/docs/concepts/designated-timestamp/) order on disk, so the RHS slice for any time range collapses to a single binary search per worker rather than a scan per LHS row.
Then, _for the join keys present in the LHS frame_, the worker builds a small in-memory index from the RHS slice: a per-key list of RHS timestamps, plus per-key arrays of the values to aggregate. Once that index is built, the inner loop over LHS rows is just two binary searches per row, one for the window's low bound and one for its high, followed by an aggregate over the resulting contiguous range. Both binary searches walk forward monotonically, so they amortize across rows in the same frame.
Roughly:
LHS page frames
┌─────┬─────┬─────┬─────┬─────┐
│ F0 │ F1 │ F2 │ F3 │ ... │
└──┬──┴──┬──┴──┬──┴──┬──┴─────┘
│ │ │ │
┌──────┴┐ ┌──┴───┐ │ │
│worker0│ │worker1│ ... │ workers pulled from a shared pool
└───┬───┘ └──┬────┘ │ one frame at a time
│ │ │
┌───────┴───────┐│ ┌───────┴───────┐
│ RHS slice + ││ │ RHS slice + │
│ per-key ││ │ per-key │
│ value arrays ││ │ value arrays │
└───────┬───────┘│ └───────┬───────┘
│ │ │
▼ ▼ ▼
┌───────────────────────────────────┐
│ for each LHS row in frame: │
│ bsearch lo, bsearch hi, │
│ aggregate(value_array[lo:hi]) │
└───────────────────────────────────┘
The reduce step is per-frame and lock-free; workers do not share any mutable state across frames. That covers the outer parallelism. The inner loop, where each LHS row aggregates its RHS slice, is where SIMD comes in.
## [The low-cardinality-key fast path](https://questdb.com/blog/window-join-parallel-vectorized/#the-low-cardinality-key-fast-path)
For low-cardinality equality joins paired with vectorizable aggregates, we copy the RHS values into per-key contiguous buffers so the SIMD kernels we already ship for SAMPLE BY can run on the window slice unchanged.
The SIMD kernels are hand-tuned `sum`, `avg`, `min`, `max`, and a few others that munch eight doubles per loop iteration, but only on _contiguous_ arrays. The RHS rows in a window are not contiguous; they are scattered across page frames, threaded through mixed columns. Our first cut just walked the matching rows one at a time and called `computeBatch` per row. Correct, but it left those kernels on the table.
The query shape that makes the extra pass worth it is the most common one in practice: a low-cardinality equality join (the canonical `p.sym = t.symbol` case) and an aggregated numeric column. With few distinct keys, the per-key value buffers fit in cache, and the cost of materializing them is more than recouped by handing each window slice to a vectorized aggregate.
The fast path is gated on two conditions: the query has to use aggregates we have vectorized implementations for (the `sum` / `avg` / `min` / `max` / `count` family over numeric types), and the join condition has to fit the low-cardinality shape that the planner recognizes (today, single-symbol equi-joins). When both hold, the worker iterates its RHS slice once to build the per-key timestamp index _and_ copy the aggregated columns into per-key value buffers in the same pass. The buffers are typed and packed: all `bid` values for symbol `AAPL` land in one contiguous block of doubles, in RHS timestamp order. For queries that don't qualify, we skip the buffer copy entirely and fall back to the scalar `computeBatch` loop.
Once the inner loop reaches an LHS row, the per-key value buffer is already laid out the way SIMD wants it. The two binary searches give us `[rowLo, rowHi)`_into the buffer_, and we hand the slice straight to the vectorized aggregate:
for (int i = 0; i < groupByFuncCount; i++) {
groupByFunctions.getQuick(i).computeBatch(
value,
bufferStart(i) + typeSize * rowLo,
(int) (rowHi - rowLo),
0
);
}
The extra pass over the RHS slice is not free; it reads each RHS column twice (once to put the values into the per-key buffer, once for the aggregate to consume them). For a generic plan that would be worse. But:
1.   The aggregate loop in QuestDB is SIMD-bound on the input _if_ the input is contiguous, and otherwise call-bound on `computeBatch` per row. On doubles, AVX2 buys us about an order of magnitude here.
2.   The RHS columns are read sequentially with prefetching, which is the case the memory subsystem is happiest with.
3.   The per-key value buffers are sized to the RHS slice for the current LHS frame, so the working set stays in L2/L3.
It took some staring at flame graphs to convince ourselves the second pass was the right call. Once we did, the fast path beat the scalar path even on small frames, and the gap widened as the LHS frame got bigger, because more LHS rows shared the same indexed buffer.
The general-predicate path still exists for queries that do not qualify for the fast path. It runs the scalar `computeBatch` loop without the buffer-copy step. EXPLAIN shows you which path your query is on:
Async Window Fast Join workers: 23
vectorized: true
symbol: symbol=sym
window lo: 1000000 preceding (include prevailing)
window hi: 1000000 following
PageFrame
Row forward scan
Frame forward scan on: trades
PageFrame
Row forward scan
Frame forward scan on: prices
The fast variant is `Async Window Fast Join` (parallel) or `Window Fast Join` (serial), with `vectorized: true` when SIMD kernels are engaged for your aggregates. Adding a non-vectorizable aggregate flips `vectorized: false` on the same operator; switching the join key off a symbol column falls back to `Async Window Join` entirely.
## [The SIMD (AVX2) hot loop](https://questdb.com/blog/window-join-parallel-vectorized/#the-simd-(avx2)-hot-loop)
Once the slice is contiguous, the aggregation is the same C++ kernel that SAMPLE BY uses. Take the canonical query the operator was designed for:
SELECT t.timestamp, avg(p.bid)
FROM trades t
WINDOW JOIN prices p
ON p.sym = t.symbol
RANGE BETWEEN 1 second PRECEDING AND 1 second FOLLOWING;
Once the per-key value buffer is built, the per-LHS-row work is just `avg(double)` over a contiguous slice of it. `avg` decomposes into a sum plus a count of non-null values (`avg = sum / count`, and nulls in QuestDB are encoded as NaN), so what actually runs is a fused sum + NaN-count kernel called `sumDoubleAcc`. The hot loop processes eight doubles per iteration on AVX2:
; sumDoubleAcc, AVX2 hot loop body (rax = &d[i+8], rcx = i)
.Lloop:
vmovupd ymm3, [rax-0xfa0] ; load d[i+4..i+7]
vcmpunordpd ymm1, ymm3, ymm3 ; NaN mask, lane 1
vmovupd ymm2, [rax-0xfc0] ; load d[i..i+3]
vcmpunordpd ymm0, ymm2, ymm2 ; NaN mask, lane 0
vpcmpgtq ymm3, ymm8, ymm1 ; widen mask, lane 1
add rcx, 0x8 ; i += 8
vandpd ymm1, ymm1, ymm9 ; mask & 1 (count step), lane 1
add rax, 0x40 ; ptr += 8 doubles
vpcmpgtq ymm2, ymm8, ymm0 ; widen mask, lane 0
vandnpd ymm3, ymm3, [rax-0xfe0] ; (~mask) & d -> zero NaNs, lane 1
vandnpd ymm2, ymm2, [rax-0x1000] ; (~mask) & d -> zero NaNs, lane 0
vandpd ymm0, ymm0, ymm9 ; mask & 1, lane 0
vpaddq ymm4, ymm4, ymm1 ; nan_count += 1 per NaN, lane 1
vaddpd ymm5, ymm5, ymm3 ; sum += value, lane 1
vaddpd ymm6, ymm6, ymm2 ; sum += value, lane 0
vpaddq ymm7, ymm7, ymm0 ; nan_count += 1 per NaN, lane 0
cmp rcx, r8
jl .Lloop
Eight doubles per iteration, no branches, no scatter. Each iteration loads two 4-double lanes, builds a NaN mask per lane, uses the mask to zero out NaNs before adding the values into a running sum, and uses the same mask to bump a running NaN counter. After the loop, a horizontal reduce folds the eight lanes into a scalar sum and a scalar NaN count, and a scalar tail handles the `< 8`-element remainder. The non-null count `avg` needs is just the input size minus the NaN count.
For `min` and `max` the structure is identical: the same load and NaN-mask pattern, with `vminpd` / `vmaxpd` replacing `vaddpd`. `count` is even simpler: it's just the running NaN counter, subtracted from the input size.
## [Comparison with other databases](https://questdb.com/blog/window-join-parallel-vectorized/#comparison-with-other-databases)
The query we benchmark wraps the WINDOW JOIN in a top-10 so every join output row has to be considered for the heap but only ten small rows go back to the client. This isolates the engine cost from the cost of streaming 50 million result rows over the wire:
SELECT ts, symbol,
avg_bid, min_bid, max_bid,
avg_ask, min_ask, max_ask
FROM (
SELECT t.timestamp ts, t.symbol,
avg(p.bid) avg_bid, min(p.bid) min_bid, max(p.bid) max_bid,
avg(p.ask) avg_ask, min(p.ask) min_ask, max(p.ask) max_ask
FROM trades t
WINDOW JOIN prices p
ON p.sym = t.symbol
RANGE BETWEEN 1 second PRECEDING AND 1 second FOLLOWING
EXCLUDE PREVAILING
)
ORDER BY avg_bid + avg_ask DESC
LIMIT 10;
Scale: 50M trades (1000 zipfian symbols) stepped over one day, against 150M prices stepped with microsecond-scale jitter over the same window. Unlike the intro form, which defaulted to INCLUDE PREVAILING, we use EXCLUDE PREVAILING here because INCLUDE PREVAILING would force every rewrite on the other engines to also locate the last RHS row strictly before the window start, adding a second lookup per trade without changing the underlying operation. The aggregate set is also chosen for fairness: `min` and `max` are not prefix-sum decomposable, so the other engines cannot reach for the cumulative-diff ASOF JOIN trick that makes the `avg`-only variant much cheaper to fake on engines without a window-join operator.
Timescale, DuckDB, and ClickHouse do not have a direct WINDOW JOIN equivalent, so each one gets the most efficient rewrite we could find: a range join + GROUP BY for Timescale, and a window function over UNION ALL for DuckDB and ClickHouse. We did our best on each (idiomatic shapes, the right indexes and clustering, parallelism knobs cranked where they helped), but it is possible there is a faster shape we did not try. The [full scripts](https://github.com/puzpuzpuz/window-join-bench) are available, and per-engine query texts are in [_How the workload is run_](https://questdb.com/blog/window-join-parallel-vectorized/#how-the-workload-is-run) below. If you can get a better number out of any of these engines, we would like to hear about it.
### [Results](https://questdb.com/blog/window-join-parallel-vectorized/#results)
Run on a workstation: AMD Ryzen 9 7900 (12 cores / 24 threads), 64 GB RAM, NVMe SSD, Ubuntu 24.04. Best wall time across three to five runs per engine, in seconds. `DNF` rows hit the 30-minute cap; once a run hit the cap we did not waste time on subsequent runs.
![Image 1: Log-scale bar chart of the three benchmark runs that completed inside the 30-minute cap: QuestDB parallel + SIMD at 13.69 s, QuestDB single-thread at 67.97 s, and ClickHouse window function over UNION ALL at 347.63 s](https://questdb.com/images/blog/2026-05-12/results-chart.svg)
| Engine | Wall time (s) | vs QuestDB |
| --- | --- | --- |
| QuestDB (WINDOW JOIN, parallel + SIMD) | 13.69 | 1.00x |
| QuestDB (WINDOW JOIN, single-thread + SIMD) | 67.97 | 4.96x |
| ClickHouse (window function over UNION ALL) | 347.63 | 25.4x |
| DuckDB (window function over UNION ALL) | DNF (>30 m) | n/a |
| Timescale (range join + GROUP BY, parallel) | DNF (disk) | n/a |
### [Reading the results](https://questdb.com/blog/window-join-parallel-vectorized/#reading-the-results)
The most informative comparison is the one inside QuestDB. The parallel and single-threaded numbers share the same plan shape, the same vectorized inner kernel, and the same query. The only difference is whether the data-level parallelism is engaged. So the 5.0x gap between them is a direct measurement of what worker-pool parallelism buys us. It is not linear in the worker count, and the reason is the outer `ORDER BY avg_bid + avg_ask DESC LIMIT 10`. The Sort + Limit is serial in both configurations, and at this scale it takes time comparable to the parallel WINDOW JOIN phase itself: once the join phase shrinks under parallel execution, the Sort + Limit stays put and ends up dominating a growing fraction of the wall-clock number. With 23 worker threads, that [Amdahl](https://en.wikipedia.org/wiki/Amdahl%27s_law) ceiling is why we see a 5.0x speedup rather than something closer to the core count: the join scales the way you would hope, but the rest of the plan does not. (Flipping the query to INCLUDE PREVAILING typically adds 5-10% on top of these numbers for QuestDB, for the extra strictly-before lookup per LHS row. The same flip is a much heavier change for the rewrite-based plans: the prevailing price is an ASOF-style per-trade lookup that does not fold into the window function over UNION ALL or the range join + GROUP BY shape, so it has to be bolted on as a second pass.)
QuestDB's parallel path against the other engines closes the gap through three combined effects: a dedicated operator that knows the window structure rather than reconstructing it from a general-purpose range join, data-level parallelism over the LHS table, and handing contiguous slices to a vectorized kernel for the inner aggregate.
ClickHouse was the only other engine to complete the benchmark inside the cap, using a window function over a UNION ALL of trades and prices. A single sort + sliding-window aggregate over a unioned stream is the right plan shape for this workload, and it lands in the same order of magnitude as QuestDB's _single-threaded_ baseline (347.63s versus 67.97s).
It is still 25x the parallel + SIMD number, though, which is where the operator-specific work in QuestDB pays off: even with the right plan shape, a general-purpose window operator over a unioned stream cannot match the data-level parallelism plus contiguous-slice SIMD that the dedicated operator gets to take for granted.
DuckDB ran the same window-function-over-UNION ALL rewrite but did not finish inside the cap. The initial parallel partitioned-sort phase used 22 cores and ~22 GB RSS comfortably under the 50 GB memory budget (no spill), but the per-partition windowed aggregate is then served by one thread per partition. With 1000 zipfian symbols and 24 cores, the long tail of large partitions can no longer keep the workers fed, and the heaviest few partitions end up serializing the tail of the query.
Timescale did not finish either. Its range join + GROUP BY rewrite gets 12-way parallelism with the planner knobs cranked, and the plan does the right _shape_ of work: a Parallel Index Scan into `prices` feeding a Partial HashAggregate per worker. But the partial HashAggregate over ~50 million groups blows past `work_mem` and spills temp files past the 541 GB of free disk we had on the box, crashing the run at about six minutes in. The root cause is the same shape as DuckDB's tail: a general-purpose range join has to materialize every overlapping pair before the GROUP BY can fold them, where a window-shaped join operator would fold rows _as_ it walks the range and never produce the intermediate at all.
### [How the workload is run](https://questdb.com/blog/window-join-parallel-vectorized/#how-the-workload-is-run)
Engine versions: QuestDB 9.3.5, TimescaleDB 2.26.x on PostgreSQL 17, DuckDB 1.5.2, and ClickHouse 26.4. This is a workstation-class repro; the scale is sized to fit in RAM on this box. The relative shape of the results should hold on larger hardware; absolute numbers will scale with the engine's parallel efficiency. All engines run with their default configurations except where noted: TimescaleDB is auto-tuned by `timescaledb-tune`, ClickHouse needs ORDER BY tuning on `MergeTree`, and QuestDB's serial baseline needs the parallel WINDOW JOIN switch turned off in `server.conf`.
The full schema definitions, data generators, and per-engine query scripts live in [the benchmark repo](https://github.com/puzpuzpuz/window-join-bench). Each script creates the schema and loads the data if missing, then executes the query three to five times (five for QuestDB's parallel sweep, three elsewhere) and prints the best wall time.
**QuestDB** uses the WINDOW JOIN query shown at the start of _Comparison with other databases_ unchanged.
**TimescaleDB** runs a range join + GROUP BY rewrite with all parallelism knobs forced on (`parallel_setup_cost = 0`, `parallel_tuple_cost = 0`, `min_parallel_table_scan_size = 0`, `max_parallel_workers_per_gather = 12`). That plan does get a Parallel Index Scan, but the per-worker `Partial HashAggregate` over ~50 M groups blows past `work_mem` and spills temp files until the disk fills up:
SELECT ts, symbol,
avg_bid, min_bid, max_bid,
avg_ask, min_ask, max_ask
FROM (
SELECT t.ts, t.symbol,
avg(p.bid) AS avg_bid, min(p.bid) AS min_bid, max(p.bid) AS max_bid,
avg(p.ask) AS avg_ask, min(p.ask) AS min_ask, max(p.ask) AS max_ask
FROM trades t
LEFT JOIN prices p
ON p.sym = t.symbol
AND p.ts >= t.ts - INTERVAL '1 second'
AND p.ts <= t.ts + INTERVAL '1 second'
GROUP BY t.ts, t.symbol
) sub
ORDER BY (avg_bid + avg_ask) DESC
LIMIT 10;
A lateral-subquery shape against a `(sym, ts DESC)` index on `prices` looks more idiomatic on a hypertable, but it relies on PostgreSQL's lateral nested loop, which is single-threaded by design. At parity scale it ran an order of magnitude slower than the range join + parallel hash aggregate plan, so we dropped it for the full run.
For **DuckDB** the closest structural analog to a window join is a window function over a UNION ALL that tags trades and prices into a single stream, runs the windowed `avg` / `min` / `max` of `bid` and `ask` partitioned by `sym` and ordered by `ts`, and keeps only the trade rows. Trade rows carry `NULL``bid`/`ask` in the stream, so when no in-window price exists the windowed aggregates over NULLs evaluate to NULL, matching QuestDB's EXCLUDE PREVAILING output. DuckDB accepts `INTERVAL` range offsets natively, so no microsecond cast is needed:
WITH stream AS (
SELECT ts, sym, bid, ask, FALSE AS is_trade FROM prices
UNION ALL
SELECT ts, symbol AS sym, NULL::DOUBLE AS bid, NULL::DOUBLE AS ask, TRUE FROM trades
)
SELECT ts, symbol,
avg_bid, min_bid, max_bid,
avg_ask, min_ask, max_ask
FROM (
SELECT ts, sym AS symbol, is_trade,
avg(bid) OVER w AS avg_bid,
min(bid) OVER w AS min_bid,
max(bid) OVER w AS max_bid,
avg(ask) OVER w AS avg_ask,
min(ask) OVER w AS min_ask,
max(ask) OVER w AS max_ask
FROM stream
WINDOW w AS (
PARTITION BY sym
ORDER BY ts
RANGE BETWEEN INTERVAL 1 SECOND PRECEDING AND INTERVAL 1 SECOND FOLLOWING
)
) sub
WHERE is_trade
ORDER BY (avg_bid + avg_ask) DESC
LIMIT 10;
**ClickHouse** runs the same window-function-over-UNION ALL shape as the DuckDB rewrite. The `MergeTree ORDER BY (sym, ts)` clustering on both tables is essential here so the per-partition sort and windowed aggregate can stream linearly. ClickHouse window functions require numeric range offsets, so timestamps are pre-converted to microseconds:
WITH stream AS (
SELECT toUnixTimestamp64Micro(ts) AS ts_us, sym, bid, ask, 0 AS is_trade
FROM prices
UNION ALL
SELECT toUnixTimestamp64Micro(ts) AS ts_us, symbol AS sym,
CAST(NULL AS Nullable(Float64)) AS bid,
CAST(NULL AS Nullable(Float64)) AS ask,
1 AS is_trade
FROM trades
)
SELECT ts_us, symbol,
avg_bid, min_bid, max_bid,
avg_ask, min_ask, max_ask
FROM (
SELECT ts_us, sym AS symbol, is_trade,
avg(bid) OVER w AS avg_bid,
min(bid) OVER w AS min_bid,
max(bid) OVER w AS max_bid,
avg(ask) OVER w AS avg_ask,
min(ask) OVER w AS min_ask,
max(ask) OVER w AS max_ask
FROM stream
WINDOW w AS (
PARTITION BY sym
ORDER BY ts_us
RANGE BETWEEN 1000000 PRECEDING AND 1000000 FOLLOWING
)
)
WHERE is_trade = 1
ORDER BY (avg_bid + avg_ask) DESC
LIMIT 10;
## [More WINDOW JOIN use cases](https://questdb.com/blog/window-join-parallel-vectorized/#more-window-join-use-cases)
The trades-and-quotes pattern is the canonical example, but the operator handles other shapes too:
*   Window bounds can be constants, LHS columns, or expressions.
*   One-sided windows (PRECEDING AND PRECEDING, FOLLOWING AND FOLLOWING) are supported.
*   INCLUDE PREVAILING / EXCLUDE PREVAILING controls whether the carry-forward quote (the most recent RHS row at or before the window start) fills the start of the window when no in-window row already covers it.
*   Supported aggregates are `sum`, `avg`, `count`, `min`, `max`, `first`, `last`, `first_not_null`, `last_not_null`.
A one-sided example, anchoring a trade count to news arrivals:
SELECT n.ts, n.headline, count(*) trades_5m
FROM news n
WINDOW JOIN trades t
ON t.symbol = n.symbol
RANGE BETWEEN 0 FOLLOWING AND 5 minutes FOLLOWING
EXCLUDE PREVAILING;
For more market-data patterns, see our [Capital Markets Recipes](https://questdb.com/docs/cookbook/sql/finance/).
## [What's next?](https://questdb.com/blog/window-join-parallel-vectorized/#what's-next?)
This is one piece of a broader effort to make temporal operators first-class in QuestDB. WINDOW JOIN was the obvious next step after ASOF JOIN; [HORIZON JOIN](https://questdb.com/docs/query/sql/horizon-join/), which gives you P&L-style markouts at multiple fixed horizons after every event, is already in 9.3.5, and the _next_ post in this series will be on how we built and optimized it.
For the full grammar and a longer list of examples, see the [documentation page](https://questdb.com/docs/query/sql/window-join/). And if you have a window-shaped query that does not fit the patterns above, we would love to hear about it.
As usual, we encourage you to try the latest [QuestDB release](https://github.com/questdb/questdb) and share your feedback on our [Community Forum](https://community.questdb.com/). You can also play with our [live demo](https://demo.questdb.io/) to see how fast it executes your queries.