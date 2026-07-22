---
source_url: "https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-consistent-hash-load-balancing-after.png?imwidth=1320#previewimage"
ingested: 2026-06-26
sha256: 0184c525bb603dd0
---

![Image 1: Client-Side Load Balancing](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-consistent-hash-load-balancing-after.png?imwidth=1320#previewimage)

Our busiest API ran its high-volume internal traffic through the cluster's shared edge ingress load balancer. For years we could never be sure whether a latency spike came from our own code or from reusing that shared edge router internally.

In a [previous post](https://engineering.zalando.com/posts/2025/03/event-driven-to-api.html), we described how we built Zalando's Product Read API (PRAPI), serving millions of requests per second with single-digit-millisecond latency across 25 European markets. Every product page, search result, and checkout depends on it. A brief degradation has measurable impact on sales, resulting in high performance and availability requirements. The low latency is achieved through consistent-hash routing: [Skipper](https://github.com/zalando/skipper), the cluster's edge load balancer, routes the same product ID to the same pod(s), helping to leverage pod-local caches in the underlying application. The routing infrastructure for this API matters.

On launch, Skipper handled both edge routing and the internal traffic between our batching and single-get components. It was always my intention that client-side load balancing (CSLB) would replace the latter, and I had hoped it would be a fast-follow. But Skipper was fast, adding only a couple of hundred microseconds to each request, and the team was understandably reluctant to introduce significant change to a working system. Over the years, as incidents accumulated where the root cause was never quite clear (Skipper, or PRAPI?), it became harder to ignore the structural problem. For a single batch-of-100 request, PRAPI had a 100x exposure to Skipper. When Skipper sneezed, PRAPI got the flu.

Some of those incidents, it would later turn out, were neither Skipper nor PRAPI. But we had no way to see that until we owned the routing decision, and the detailed logs that came with it.

## Skipper and the Fan-Out Problem

Skipper is Zalando's open-source Kubernetes ingress controller and HTTP router. It handles edge load balancing brilliantly: consistent-hash routing, bounded load protection, fade-in for new pods. We contributed key features to Skipper ourselves, including [minimising cache loss during scaling](https://github.com/zalando/skipper/issues/1712) and [preventing overload from hyped products](https://github.com/zalando/skipper/issues/1769). We still use Skipper for all single-product GET requests today.

The problem was our batch endpoint. PRAPI's product-sets component unpacks a single batch request into up to 100 parallel downstream calls to individual products pods. Each of those 100 calls transits Skipper. Skipper adds only a couple of hundred microseconds per hop, but a batch waits on up to a hundred of those hops at once, so its latency tracks the slowest of the hundred, not the typical one. And Skipper is shared infrastructure: we run on the same fleet as the rest of our cluster, on a global configuration we inherit rather than set.

![Image 2: Product-sets fan-out diagram](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-consistent-hash-load-balancing-before.png?imwidth=1320#center)

Product-sets fan-out through the ingress load balancer

During incidents, we could never be certain whether latency spikes originated in Skipper or in our own code. It sat in the hot path of every request, we did not run it, and we could not cleanly separate its behaviour from ours. Even when Skipper was fast, that shared fate was the problem.

We decided that for high fan-out internal traffic, the routing decision should live inside the calling process itself. Edge traffic, where Skipper excels, should stay exactly where it is. We were not replacing Skipper; we were graduating the internal fan-out path to a client-side load balancer that runs inside the process.

![Image 3: Direct routing diagram](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-consistent-hash-load-balancing-after.png?imwidth=1320#center)

Product-sets routing directly to products pods

## Building the Same Hash Ring

We did not need client-side balancing in the abstract, we needed the exact same ring as Skipper, in our own process. The most critical constraint was therefore hash parity. During migration, both Skipper and our client-side load balancer would route requests to the same pool of products pods. If the hash rings disagreed, a product that Skipper routes to pod A might be routed to pod B by our library. That would split caches and double DynamoDB load, exactly the opposite of what we wanted.

We implemented the same algorithm Skipper uses: [xxHash64](https://github.com/zalando/skipper/blob/master/loadbalancer/algorithm.go) on a configurable virtual-node ring. Each endpoint URL is placed at 100 positions on a 64-bit hash ring, matching Skipper's default. When a request comes in, the product ID is hashed and a binary search on the ring finds the nearest endpoint clockwise.

This means that adding or removing an endpoint remaps only about 1/N of keys, minimising cache churn. And because both Skipper and our library use the same hash function and the same number of virtual nodes, they produce identical rings for the same set of pods. A bank of unit tests pins this down: they assert our ring places the same keys on the same endpoints as Skipper's algorithm for any pod set, and run on every build, so a later change cannot silently drift from Skipper. We confirmed it held in production too, during the canary: cache hit ratios stayed identical on both paths.

We wrote it as a standalone, framework-free JVM module with the long-term intention of lifting it out of this service. Its only real dependency is a small zero-allocation hashing library, for the xxHash64 that matches Skipper; everything else, the ring, the occupancy accounting, the bounded-load math, is the JDK standard library. The Kubernetes client and Micrometer sit at the edges, for discovery and metrics.

## Kubernetes Discovery

Our load balancer needs to know which pods exist. The initial approach was polling the Kubernetes EndpointSlice API every few seconds, but polling was a pattern we had learned to treat with respect. Zalando had previously experienced incidents where Akka Cluster deployments polling the Kubernetes API at high frequency had taken out the control plane entirely. PRAPI runs on hundreds of product-sets pods; hundreds of pods polling independently, each on their own schedule, is exactly the kind of aggregate that causes those incidents.

We switched to a watch-based Kubernetes informer. On startup it lists the current EndpointSlices to seed the ring, then holds a persistent watch that streams changes in real time. A 2-second debounce coalesces rapid changes during scale-ups into a single ring update, preventing the ring from rebuilding once per pod.

```
informer (list + watch)
  |-- on startup: list current EndpointSlices, seed the ring
  +-- then stream add / update / delete events

on each event:
  |-- update the local per-slice cache
  +-- schedule applyLocalState() with a 2s debounce
        +-- the debounce folds a rolling deploy's churn into a single ring update
```

If the Kubernetes API becomes unavailable, the last good endpoint set remains in place. The load balancer never presents an empty ring due to a transient API blip. Staleness is handled by connection errors at the HTTP layer and the caller's retry logic.

## Fixing the Pipeline First

One thing had to come first, because none of what follows was possible until we fixed it. Every fade-in curve, load-signal experiment, and zone trial needed many small, fast deployments. On the pipeline we started with, we could manage one a day at best, and even that often tripped alarms on the way out.

The pipeline had degraded over years of accumulated caution. Every manual approval gate and 180-second sleep had been added in response to some past incident, until the cumulative result was slower and more fragile than the system it protected. Builds took 21 minutes. A single feature deploy meant babysitting traffic steps for an entire workday; the median run took 4 hours and 49 minutes, and the worst on record was 4 days and 21 hours.

The fix was three PRs. Build caching cut wall time from 21 minutes to 12. We collapsed 40-plus manual traffic steps into a single CI/CD step. The approval gates came out, replaced by a sequenced market-group rollout (test -> eu-0 -> eu-1 -> eu-2) that uses the smaller regions as an alarm buffer before the critical eu-2 region. Median deployment time fell from 289 minutes to 128.

![Image 4: CI/CD pipeline run durations before and after](https://img01.ztat.net/engineering-blog/posts/2026/06/images/prapi-pipeline-improvements.png?imwidth=1320#center)

CI/CD pipeline run durations, down from a worst case of nearly five days to an hour or two

Once the team trusted the pipeline, the pace changed: small, reversible steps replaced big, risky batches. And it was not just mine to use: within weeks other engineers were running their own experiments in parallel, on cache tuning and beyond, because the cost of trying something had collapsed. Everything that follows in this post was built on that velocity.

## Rolling It Out Safely

We built three toggles for the rollout:

*   **`CSLB_ENABLED`**: a boolean off switch
*   **`CSLB_PERCENTAGE`**: a 0-100 traffic ramp controlling what fraction of requests use client-side routing vs the Skipper fallback
*   **Implicit Skipper fallback**: any request not routed client-side, or any client-side routing failure, falls through to Skipper transparently

We rolled out incrementally: 1% in our canary market group, then 10%, 50%, and finally 100% across all market groups. At each step we compared latency, error rates, and cache hit ratios between the two paths.

The effect was immediate. Latency dropped. Spikes that we had attributed to "the network" or "something in the stack" disappeared. At peak, over a million requests per second were re-routed off Skipper.

![Image 5: Requests per second through Skipper](https://img01.ztat.net/engineering-blog/posts/2026/06/images/skipper-rps-total-drop.png?imwidth=1320#center)

Requests per second through Skipper: peaks approaching a million collapse to near zero after the CSLB cutover

![Image 6: product-offers latency before and after CSLB](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-before-after-latency.png?imwidth=1320#center)

product-offers latency before and after CSLB: daily spikes flatten to a steady baseline

At 100%, the Skipper fallback path still exists in code but is never hit. It remains as an emergency off switch: one ConfigMap change (rolled out via blue-green deployment) and all traffic flows through Skipper again.

The immediate win was stability. But removing a million requests per second from shared infrastructure had a side effect we had not anticipated: Skipper's fleet for our routes scaled down from over 50 pods to a minimum of 8. What started as a latency and operability project had become a cost project. And owning the load balancer meant we could keep going.

![Image 7: Daily Skipper node-group cost](https://img01.ztat.net/engineering-blog/posts/2026/06/images/skipper-cost-drop.png?imwidth=1320#center)

Daily Skipper node-group cost falling from around $450 to roughly $110 a day after the CSLB cutover

## Eliminating Scale-Up Spikes: N-Ring Fade-In

Now we could ship and measure quickly. The first target was scale-up spikes, long accepted as an unfortunate constant. The team was cautious about autoscaler sensitivity for good reason. Although we had taken Skipper out of the fan-out path, the cold-cache problem on scale-up remained.

When the Horizontal Pod Autoscaler adds 50 new pods, a naive implementation routes their full share of traffic to them immediately. Those pods have cold caches, so all fifty miss into DynamoDB at once, and the read burst spikes latency across the fleet.

Skipper has a fade-in mechanism to address this: a probabilistic pre-filter that runs before the consistent-hash ring and adds or removes new pods during fade. While this works well, it often means that new pods are warmed with products they may not serve once the fade completes.

Our optimisation is N-ring fade-in. Each scale event creates a new ring that is a superset of the established ring. The new ring fades in independently over a configurable window (default 30 seconds) using a ^2.5 curve (slow start, rapid finish):

| Elapsed | Progress | Traffic share |
| --- | --- | --- |
| 3 s | 10 % | 0.3 % |
| 9 s | 30 % | 4.9 % |
| 15 s | 50 % | 17.7 % |
| 21 s | 70 % | 41.0 % |
| 27 s | 90 % | 76.8 % |
| 30 s | 100 % | 100 % |

If a second scale event arrives while the first is still fading in, each gets its own independent window. A ring near completion is never disrupted by a new scale event arriving on top of it. Traffic is shared between the established ring and any fading rings, and each fading ring becomes the new established ring once its fade completes, replacing the one before it. Pod deletions are applied immediately to all rings. All of it sits behind a single atomic reference: each change swaps in a fresh immutable snapshot of the ring set, so every routing decision reads one consistent version without blocking on the updates.

![Image 8: N-ring fade-in diagram](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-n-ring-fade-in.png?imwidth=1320#center)

N-ring fade-in: each scale event adds a ring, newest on the right, taking a growing share of traffic as it establishes

Because pods are assigned identical positions in all rings, the traffic they receive during fade-in is exactly the traffic they will serve at steady state. They warm up with the right products. No wasted cache entries, no eviction churn.

![Image 9: Products cache size per pod during a scale-up](https://img01.ztat.net/engineering-blog/posts/2026/06/images/scale-up-caches-filling-slowly.png?imwidth=1320#center)

Products cached per pod during a scale-up: new pods start near empty and climb to the established band, warming only products they will keep

## Taming Pod Occupancy with Bounded Load

With fade-in eliminating scale-up spikes, the next target was steady-state load. Some pods ran hot while others sat nearly idle, and to even that out we first had to measure how busy a pod really was. The obvious signal turned out to be the wrong one.

The obvious signal is in-flight requests: the number of calls open to a pod at any instant. [Skipper's bounded load](https://opensource.zalando.com/skipper/reference/filters/#consistenthashbalancefactor) ran on exactly this, and we kept it on a short leash: a balance factor of 1.10, so a pod could sit only ten percent above the fleet average before the ring redistributed its keys. We had to keep it that tight, because in-flight cannot tell a hot-cache pod racing through a thousand one-millisecond hits apart from a pod backed up on slow cache misses. By the raw count the two look alike. To stop the strugglers from tipping over we held the whole fleet back and scaled out early, so pods with hot caches were never allowed to do the extra work they could easily absorb.

In-flight has a quieter blind spot too: it is a local, instantaneous number. Each load balancer instance sees only its own calls, never a pod's true load, and between bursts the count drops to zero even when a pod has been busy all along. So we reached for a different signal: occupancy, seconds of work per second. Accumulate the time a pod spends serving requests over a window, divide by the window length, and a pod busy for a full second out of every second reads 1.0. Because it is grounded in time rather than in a snapshot count, it holds steady between bursts and rises with the real work a pod is doing, whoever sent it.

We had never graphed occupancy before. The first time we did, the gap was stark. By in-flight the pods looked tight and even. By occupancy they were spread from 0.40 to 1.30: hot-cache pods coasting near the floor while cache-miss pods ran near their ceiling. The imbalance had been there the whole time, hidden behind a signal that could not see it. That spread is why we had to scale so aggressively at 50% CPU, keeping many pods underused just to protect the outliers.

![Image 10: Per-pod occupancy before optimisation](https://img01.ztat.net/engineering-blog/posts/2026/06/images/backend-pod-occupancy-before.png?imwidth=1320#center)

Per-pod occupancy before optimisation: a wide spread from roughly 0.4 to 1.3, idle pods alongside hot ones

Acting on that signal is the bounded-load mechanism: when a pod exceeds the balance factor times the average load, the ring walks clockwise to a less-loaded candidate. Rebuilding it inside CSLB gave us the chance to feed it something better than in-flight, and getting that signal right took two tries.

### The Throughput Mistake

My first attempt used a sliding window counting requests per second (throughput) as the load signal for bounded-load decisions. The theory was sound: measure how many requests a pod is handling over a time window, and walk past it when the count is too high.

This approach was not good enough in practice. Providing that look-back window did help with approximating global load from a local vantage point, but throughput is not a good measure of load. For our cache-hit-dominated workload, where a typical request returns in about a millisecond, the request rate badly overstated load. A pod serving a thousand requests a second looks busy by throughput, but with each one gone in a millisecond it averages only about one request in flight, an occupancy of 1.0. The bounded-load walk triggered constantly, scattering requests across the ring and cratering our cache hit rates.

### Little's Law

The fix came from queueing theory. [Little's Law](https://en.wikipedia.org/wiki/Little%27s_law) states that average concurrency equals arrival rate multiplied by average service time: $L = \lambda W$. Instead of counting request arrivals, we accumulate request duration in a sliding time window and divide by the window length:

```
occupancy = total_occupied_time / window_duration
```

This gives us seconds of work per second, the truest picture of actual load:

| Signal | Reported load | Reasoning |
| --- | --- | --- |
| In-flight | 0 | sampled between bursts, nothing is open |
| Throughput | 1,000 | requests per second, regardless of duration |
| **Occupancy** | **~1.0** | 1,000 x 1 ms = 1.0 s of work per second |

The window itself is short: 150 milliseconds, split into five 30-millisecond buckets that slide forward as time passes. We sized it a little longer than a single request's own timeout, so a request that has just finished still sits inside the window when the next routing decision reads it.

We use a composite signal, `max(inflight, occupancy)`, that catches both slow in-flight requests that have not completed (occupancy would not see them yet) and bursty fast requests where in-flight drops to zero between bursts (occupancy captures them).

We then weight that signal by latency, an idea borrowed from [Finagle](https://twitter.github.io/finagle/guide/Clients.html): a pod's cost is its concurrency multiplied by its latency relative to the cluster average.

```
effectiveLoad = max(inflight, occupancy) x min(podLatency / globalLatency, 5)
```

A pod at the cluster average is neutral. One running twice as slow weighs twice as much, so the bounded-load walk routes around it. The multiplier caps at 5x, so no single slow pod can flood the rest of the fleet by making every other pod look cheap by comparison. One case matters most for resilience: a pod with in-flight requests but no completed responses has no latency to measure, so we treat it as stuck and apply the full 5x at once.

The walk always weighs a pod against the cluster average, so the signal is clearest with two pods side by side in the same window:

```
100 ms window
         +-------------------------------+
  pod A  | [][][][][][][][][][]          |   ten 1 ms cache hits
  pod B  | [][] [ M ][ M ][ M ]          |   two hits, three slow misses
         +-------------------------------+
            [] = 1 ms hit      [ M ] = ~100 ms miss to DynamoDB

  cluster average latency = 1 ms;  pod B's misses drag its own to 60 ms

  pod A:  base load 0.1  x  min( 1/1, 5) = 1.0   =   0.1   keep
  pod B:  base load 3.0  x  min(60/1, 5) = 5.0   =  15.0   reroute
```

Pod B is serving fewer requests than pod A, but three of them are cache misses to DynamoDB at around 100 ms each. They lift its base load to 3.0 and drag its latency to sixty times the baseline, far enough to pin the multiplier at its 5x cap. Its effective load lands at 15 against pod A's 0.1, so the walk skips pod B and routes its keys to the pod with headroom.

This is the signal the hardening section leans on later. When a pod sits on a briefly frozen node and stops responding, it trips that stuck-pod case, its effective load jumps to the cap, and traffic moves off it on its own.

### Capping the Walk

There is a failure mode hiding in the walk itself. When many pods slow down at once, say a brief network disruption pushes a whole group of them over the threshold together, a naive walk would traverse the entire ring looking for a pod under the line, flinging the request as far from its cache home as possible at the worst possible moment, and doing it for every request at the same time. So the walk is capped at ten hops. If it cannot find a pod under threshold within ten, it stops and routes to the least-loaded pod it has seen. The request stays near where it belongs, and a transient blip can no longer turn a slow patch into a ring-wide stampede.

Seeing this at all is a dividend of owning the algorithm. The walk used to happen inside shared infrastructure we did not run, so we could never measure how far it travelled. Now we emit the distance on every request and graph it, and in steady state the cap is nowhere near binding: even the 99th percentile of requests walks only four pods. The cap is configurable, so if telemetry ever shows real traffic pressing against it, we can raise it. For now, ten gives us comfortable headroom.

![Image 11: Bounded-load walk distance by percentile](https://img01.ztat.net/engineering-blog/posts/2026/06/images/cslb-bounded-load-walk-percentiles.png?imwidth=1320#center)

Bounded-load walk distance by percentile: half of all requests walk nowhere, and even p99 stops at four, well inside the ten-hop cap

### The Impact

Pod occupancy tightened from a 0.40-1.30 range to a band between 0.60 and 0.90.

With the variance eliminated, we could finally stop guarding against a blind spot. We loosened the bounded-load factor from the cautious 1.10 we had lived with under in-flight to 1.25, letting hot-cache pods hold their keys and do more of the work they had headroom for, and we raised the Horizontal Pod Autoscaler threshold from 50% CPU to 65% CPU. We no longer needed to scale early to protect against outlier pods, because occupancy now showed us which pods were genuinely busy.

Scaling at 65% resulted in over 25% fewer pods. Occupancy shifted to a healthy band between 1.0 and 1.5, and cost savings reached over $1,000 per day.

![Image 12: Per-pod occupancy after optimisation](https://img01.ztat.net/engineering-blog/posts/2026/06/images/backend-pod-occupancy-after.png?imwidth=1320#center)

Per-pod occupancy after optimisation: a tight band, every pod now running hotter and more evenly

So far, client-side load balancing had eliminated Skipper's scaling costs and then trimmed our own pod fleet. But there was one more cost we had not yet addressed.

## AZ-Aware Routing

The final frontier was availability-zone-aware routing. We had high hopes for it, and it is also the one part of this story we eventually paused, but it forced the hardest engineering in the project, so it is worth the walk. Removing Skipper from the fan-out path had already done more than cut compute. Because the shared Skipper hop so often crossed zone boundaries, dropping it quietly trimmed our inter-AZ data-transfer bill as well. If that alone saved so much, how much more could we save by keeping each product-sets request inside its own zone?

![Image 13: EC2-Other cost drop](https://img01.ztat.net/engineering-blog/posts/2026/06/images/ec2-other-cost-drop.png?imwidth=1320#center)

EC2-Other cost (mostly inter-AZ data transfer) drops sharply once CSLB removed the Skipper hop, while DynamoDB stays flat

In a three-AZ Kubernetes cluster, roughly two-thirds of hops cross zone boundaries. Each cross-zone hop incurs data-transfer cost, and at millions of requests per second that adds up to hundreds of dollars per day. Keeping traffic within the same AZ reduces both cross-zone latency and transfer cost. The challenge is that naive zone isolation causes cache fragmentation when the local zone has too few pods, and if the local zone degrades (a noisy neighbour, an AZ-local issue, or cold caches after a deployment) you need to detect it and fall back automatically.

### Fading In, Carefully

We did not flip zone affinity on all at once. After an initial all-zone delay, so local caches warm on real traffic first, the local fraction ramps from a 1% floor up to its ceiling on the same ^2.5 curve as the scale-up fade-in.

A latency health factor runs on top of the ramp: it compares smoothed local and all-zone response times, and if local latency drifts more than a configured margin above all-zone (35% in our setup), it suppresses local traffic back toward a 1% probe floor. Those probes keep the comparison fresh, so when latency recovers the system restores local traffic on its own, with no operator and no external health check.

That initial delay was hard won. The first time we enabled zone affinity there was no delay and no health factor: the switch flipped on deployment and local pods suddenly owned all of their zone's traffic. In cross-zone mode a pod warms roughly a third of the catalogue; with zone affinity on from the start, they needed all of it at once. During the blue-green traffic switch, the new stack's cache hit rates began collapsing and alarms fired. We cut traffic back to the old stack before the ramp completed. Local pods need to warm on cross-zone traffic first, so their existing cache slice is full before zone affinity starts adding to it.

### Bounded Load Across Two Rings

At first, with the careful fade-in in place, the zone trial behaved exactly as the theory predicted. As local traffic ramped up, the cache hit rate dipped, the number of products held in each pod's cache rose, and the DynamoDB read rate climbed. All three were expected: concentrating a zone's traffic on fewer pods means each pod covers a larger slice of the catalogue, so it caches more and misses to DynamoDB more often. We had modelled this. Nothing to worry about.

Except the DynamoDB read rate did not rise a little. It exploded, far past anything the model accounted for.

The culprit was bounded load, the very mechanism we built earlier for occupancy, now reading the wrong baseline. Bounded load walks a pod when its load exceeds a multiple of the average, and the average it should compare against depends on the routing mode: in plain all-zone routing the right divisor is the global pod count, while in full local-zone routing it is the local pod count. During fade-in we are neither. A local pod legitimately carries more than a global-only pod, because it sits in both rings at once, serving its share of the fraction routed locally and its share of the fraction that still spreads across every zone. My first version judged every pod against a single naive cluster-wide average, so the instant zone affinity engaged, every local pod looked overloaded. The walk spilled their keys around the ring chasing headroom that did not exist, cache locality collapsed, and the misses stampeded into DynamoDB. The fix was to compute the threshold from the load a pod is actually expected to carry under the current split:

```
loadPerLocalPod  = (totalLoad x localWeight)        / localPodCount
loadPerGlobalPod = (totalLoad x (1 - localWeight))  / allPodCount
threshold        = (loadPerLocalPod + loadPerGlobalPod) x balanceFactor
```

Here `totalLoad` is what this client process observes across all pods, its own local view rather than a cluster-wide figure. A local pod's expected load is the sum of both terms, because it draws traffic from both rings. As the local weight ramps from 1% to its ceiling during fade-in, the threshold tracks it, so bounded load only fires on a genuine outlier rather than on the asymmetry that zone affinity creates on purpose.

![Image 14: DynamoDB read capacity during the buggy zone-affinity trial](https://img01.ztat.net/engineering-blog/posts/2026/06/images/dynamodb-read-rate-explosion.png?imwidth=1320#center)

DynamoDB reads during the buggy zone-affinity trial: a calm baseline near 50K explodes toward 400K, then settles once the threshold accounted for both rings

### When Two Fade-Ins Collide

Zone fade-in does not run in isolation. Pods are still being added and removed all the time, each new one carrying its own N-ring scale-up fade-in. So at any given moment a pod can be fading in to the ring while the ring itself is fading from all-zone to local. The two mechanisms have to compose cleanly: a freshly added pod must warm up gradually and land in the right place in the local-versus-all-zone split, all while the zone ramp and the latency health factor shift underneath it.

Getting that seam right was harder than either piece in isolation. Our early trials surfaced a string of subtle bugs at exactly this junction: the zone ramp flapping when health briefly dipped, suppression that would not release, a completed fade-in being re-triggered by a scale event landing on top of it. Each was a small fix on its own. But every trial that surfaced one tripped a real production alert. I watched these rollouts go out myself, late into the evening, finger on the off switch and there for every alert, but that is a price you pay deliberately.

That is why zone-aware routing is the one part of this story not currently running in production. The algorithm works and the safeguards are now in place, but rather than keep spending on-call goodwill chasing the long tail of edge cases, we switched it off and will pick the trial back up after a few consecutive weeks of 100% on-call team health. Whether it pays for itself is a question we have yet to answer.

## Hardening the Fan-Out Path

Going direct meant owning resilience too. Once product-sets called products pods without Skipper in between, every retry, every timeout, and every overload decision was ours to tune. So we hardened the fan-out path.

We tightened the retry policy to a single fast retry with a few milliseconds of jittered backoff. It fires only on transport failures and 5xx responses, never on a 4xx or a 404, which are answers, not failures. And each retry resolves against an exclude set of the URLs already tried, so a retry never lands on the same pod twice. A retry is a hop to a different pod, and often a different node.

We added a FIFO buffer in front of the fan-out. A single batch can unpack into dozens of parallel calls, and under a spike those calls can overrun the outbound concurrency limit and overwhelm the products fleet. An overload filter sheds brand-new inbound requests with a 503 and a Retry-After once outbound in-flight requests cross a hard cap; the FIFO buffer sits just beneath that cap and briefly queues already-admitted fan-outs instead of letting them pile straight onto the wire. The queue drains itself: as in-flight requests complete, the next queued fan-out is released.

And we leaned on the latency-weighted load signal from earlier. A pod that slows down has its effective load multiplied, so the bounded-load walk steers around it before it can drag the whole fan-out into its tail.

The last change sounds mundane and paid off the most: we logged more. Every outbound error now records the exact destination, the pod IP we were calling and the node that pod was running on. For the first time we could see precisely where every failure landed.

That visibility surfaced something we had only ever seen as noise. Every so often a short burst of timeouts hits, lasts a couple of seconds, and clears on its own. With the node on every log line the shape was unmistakable, and it showed from both sides. Sometimes every failing call shared the node our own pod was calling from, fanning out to a scattered set of perfectly healthy destinations. Other times every failing call was aimed at the handful of product pods sitting on one node, from callers spread across the cluster. Either way the common factor was a node, not a pod: for a couple of seconds its network simply stops, inbound and outbound, then recovers as if nothing happened. It is not Skipper, since we saw the same shape back when this traffic still flowed through it, and it is not the application on top, since the JVM logs stay quiet through the bursts, the pods keep CPU headroom, and the sockets stay healthy. Whatever it is sits below us, at the node or network layer.

![Image 15: product-sets timeouts grouped by source node](https://img01.ztat.net/engineering-blog/posts/2026/06/images/node-freeze-errors-by-node.png?imwidth=1320#center)

Product-sets timeouts grouped by source node: one node produced 1,909 errors in a 2 second period. Node IPs partially redacted

The good news is that PRAPI barely notices, because the freeze cuts both ways and the load balancer handles each. When the frozen node is hosting product pods, every caller reaching for them times out at once; the latency multiplier and the stuck-pod cap see those pods go silent and steer traffic to healthy pods elsewhere, and the retry lands on a different pod on a different node. When it is hosting our own product-sets pods, we cannot route around it, those pods are stuck whichever destination they pick, but it stays contained: only the few pods on that one node, for the two or three seconds it lasts, while the rest of the fleet carries on. The FIFO buffer and the inflight cap keep them from compounding the freeze into a self-inflicted retry storm, holding the backlog until the node recovers. The freezes still happen, and occasionally a few nodes even freeze in lockstep, but we have not had an incident attributed to them in weeks. What used to be a 3am page is now a faint wobble on a graph.

What trips the freeze at the node level is our infrastructure team's to pin down. Whatever the cause, the difference for PRAPI is that it no longer depends on the answer.

## Lessons

**Cache locality and traffic isolation pull in opposite directions.** Consistent hashing is what provides that locality: the same key always reaches the same pod. AZ affinity trades cache locality for zone cost savings. Bounded-load redirection trades it for more even load distribution. Before enabling either, check whether each partition has enough nodes to cover the hot product set. If not, you are trading one cost for another.

**A slow deployment pipeline makes every deployment more risky.** Teams respond to a slow pipeline by bundling more changes into each deploy, so every painful run carries more work. Larger batches are harder to diagnose when something goes wrong. A pipeline that defaults to action (small increments, automated alarm buffers, no manual gates) is structurally safer than one that defaults to inaction.

**Owning the routing decision means owning the telemetry.** The single most valuable change in the whole project was not an algorithm. It was adding the destination pod and node to one error log line, which let us finally see a fault that shared infrastructure had hidden for years.

**Owning the routing decision also means owning a new failure surface.** The ring can go stale if the Kubernetes API stalls, hundreds of pods now hold watch connections, reading EndpointSlices needs its own RBAC, and the load balancer pages us now instead of another team. We mitigated each one, a last-good ring that never empties, a watch instead of polling, an instant fallback to Skipper, but the complexity is real and it is permanently ours.

**Pulling routing in-process means owning its performance.** That code now runs on every request, millions a second at peak, so its CPU cost is ours. We profiled the running service in production with Java Flight Recorder and kept the hot path lock-free and allocation-light, tolerating a few milliseconds of metric staleness rather than contending on a shared cache line.

Taking a million requests per second off shared infrastructure dropped Skipper's fleet from over 50 pods to 8. Occupancy-based bounded load took out another 25% of pods, and over $1,000 a day with them. In under seven weeks, the rebuilt pipeline carried more than 100 pull requests into production, each deploying on merge, nine of them on the busiest day. We have not had a load-balancing incident since the migration, and AZ-aware routing is the one bet still on the table, paused but not abandoned.

## What's Next

The obvious unfinished thread is zone-aware routing. We will restart the trial once we can give it a clean run, this time with every safeguard (the latency health factor, the hardened retries, the FIFO buffer) in place from the first ramp rather than bolted on after the first incident.

The economics are uncertain. Pinning traffic to a single zone means fewer pods share each product's cache, so the catalogue fragments and DynamoDB read costs rise; we have measured that increase in every previous trial. Against it sits the inter-AZ data-transfer saving. We do not yet know which number wins, and the honest answer is that it depends on scale. A zone only holds enough pods to cover the hot set once traffic is high, so the saving grows with load: at normal volume it may barely break even, but during a peak event like Cyber Week, when traffic and pod counts are at their highest, the same mechanism could save a great deal. Proving that carefully, and quietly this time, is the next chapter.

## Should You Build Your Own?

For almost everyone, the answer is don't. A mature proxy like Skipper or Envoy gives you consistent-hash routing out of the box, maintained by someone else and hardened by thousands of other users. The Kubernetes client libraries make the mechanics look easy: watching EndpointSlices and standing up a ring is a weekend, not a quarter. But that ease is exactly the lure of Not Invented Here syndrome, and the build is the easy part; owning it forever is the cost.

We built one because we sat at a real edge case: a single internal path at over a million requests per second, where one shared hop multiplied our exposure a hundred-fold. If you are genuinely there, a few things made the difference: put it behind a runtime toggle with fallback to the proxy you are replacing, so a bad rollout is a config change and not an incident; profile the real thing in production, not a benchmark; and replace only the path that needs it, not the proxy wholesale. We still route every edge request through Skipper.

## Acknowledgements

Thank you to the SPP Product Data Serving team, who reviewed the risky changes, watched the dashboards through every ramp, and stayed ready on the rollbacks. Work like this, shipping and reverting and shipping again in production, is only possible with a team that backs experiments instead of fearing them. Thanks also to the two SPP principal engineers, Domagoj Trsan and Francis Moloney, who both tolerated and reviewed dozens of these pull requests in a short period of time.

* * *

_We're hiring! Do you like working in an ever evolving organization such as Zalando? Consider joining our teams as a [Backend Engineer](https://jobs.zalando.com/en/jobs?category=Software+Engineering+-+Backend&utm\_source=eng\_blog&utm\_content=client-side-load-balancing)!_

* * *

## **Related posts**

## [From Event-Driven Chaos to a Blazingly Fast Serving API](https://engineering.zalando.com/posts/2025/03/event-driven-to-api.html)

In this post, we explain how we replaced an event-driven system with a high performance API capable of serving... [Read more...](https://engineering.zalando.com/posts/2025/03/event-driven-to-api.html)

![Image 16: photo of Conor Gallagher](https://img01.ztat.net/engineering-blog/authors/images/conor-gallagher.jpg?imwidth=80)

![Image 17: photo of Giorgio Carta](https://img01.ztat.net/engineering-blog/authors/images/giorgio-carta.jpg?imwidth=80)

Mar 07

2025

## [Contributing to Debezium: Fixing Logical Replication at Scale](https://engineering.zalando.com/posts/2025/12/contributing-to-debezium.html)

How we contributed two features to Debezium to solve WAL growth and enable safer logical replication for our event... [Read more...](https://engineering.zalando.com/posts/2025/12/contributing-to-debezium.html)

![Image 18: photo of Conor Gallagher](https://img01.ztat.net/engineering-blog/authors/images/conor-gallagher.jpg?imwidth=80)

Dec 19

2025

## [Rejecting Invalid Ingress Routes at Apply Time](https://engineering.zalando.com/posts/2026/04/skipper-validating-admission-webhook.html)

How Zalando used Skipper as a validating admission webhook to reject invalid filters and predicates at apply time,... [Read more...](https://engineering.zalando.com/posts/2026/04/skipper-validating-admission-webhook.html)

![Image 19: photo of Veronika Volokitina](https://img01.ztat.net/engineering-blog/authors/images/veronika-volokitina.jpg?imwidth=80)

Apr 09

2026
