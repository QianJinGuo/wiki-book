# Client-Side Load Balancing at a Million Requests Per Second

## Ch11.167 Client-Side Load Balancing at a Million Requests Per Second

> 📊 Level ⭐⭐ | 6.5KB | `entities/zalando-client-side-load-balancing-million-rps.md`

# Client-Side Load Balancing at a Million Requests Per Second

Zalando 在百万 RPS 级别的客户端负载均衡工程实践，从服务发现到连接管理的完整技术栈。

## 核心内容

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

We wrote it as a standalone, framework-free JVM module with the long-term intention of lifting it out of this service. Its only real dependency is a small zero-allocation hashing library, for the xxHash64 that matches Skipper; everything else, the ring, the occupancy accounting, the bounded-load 

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/zalando-client-side-load-balancing-million-rps.md)

---

