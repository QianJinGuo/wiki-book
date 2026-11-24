# Every Team is Building the Same Cache — TierFS

> 📊 Level ⭐⭐⭐ | 13.5KB

> **来源**: [Every Team is Building the Same Cache — TierFS](https://tierfs.com/blog/every-team-builds-the-same-cache.html)

Why infrastructure teams keep solving the same storage problem from scratch, and what would happen if they didn't have to.

If you work at a company that runs serious compute workloads in the cloud, there's a good chance one of your engineers has spent the last quarter building a cache.

Not on purpose, exactly. Nobody set out to build a cache. The project was supposed to be about something else — getting an inference cluster online, scaling training across more GPUs, making the agent platform feel snappier. But somewhere in the middle of it, somebody noticed that pulling 70 GB of model weights from S3 every time a replica came up was taking ten minutes, and that wasn't going to work, and so they wrote a thing. A script that pre-warms a local NVMe drive. A sidecar container that pulls from S3 once and shares to peers. A Redis-backed lookup that hands out cached file paths. The thing has different names at different companies. It's always there.

We've talked to engineers at several different neocloud and AI infrastructure teams in the last few months. Every single one has built some version of this. None of them are particularly proud of it. It's not the work they wanted to be doing; it's the work that turned out to be in the way of the work they wanted to be doing. And when you ask them about it, they all say roughly the same thing: _"yeah, we should probably open-source it, but it's pretty specific to our setup."_

That's the part that keeps catching our attention. Many teams, many versions of the same thing, none of them confident their version is good enough to share. Meanwhile every new team starting up does the same thing again, because they have to.

## The shape of the problem

The actual problem is simple enough to state in a sentence: compute is fast, networks are slow, and the same data gets read many times.

This is, of course, the reason caches exist. It's also a problem that's getting worse rather than better as workloads change. The compute side keeps getting more ephemeral — sandboxes that spin up for a task and disappear, inference replicas that come and go with traffic, training jobs that claim GPUs for an afternoon. The data side keeps getting larger — model weights that used to be 1 GB are now 70 GB or 700 GB, datasets that used to fit on a laptop now span buckets. And the same data gets touched, over and over, by different instances of compute that don't share state.

If you run a single big stable cluster, you can paper over this. Pre-stage the data, keep it warm, never let the working set go cold. If you run an ephemeral fleet — which everyone is moving toward, because it's cheaper and more flexible — you can't. Every new compute instance starts cold, and the cost of starting cold dominates the cost of doing the actual work.

So you build a cache. Or, more often, you build several caches, in succession, because the first version handles the easy case and then breaks when the workload gets weirder. The pattern goes something like:

First, somebody adds a local NVMe cache on each compute node. Works great. Hit rates are high, latency drops, everyone's happy. Then the fleet grows, and you notice that every new node is pulling the same data from S3, and your S3 bill is going up, and you're hitting rate limits. So somebody builds a peer-to-peer layer — nodes ask each other for cached data before going to S3. Works great, for a while. Then the fleet becomes truly ephemeral — sandboxes spin up and disappear — and the local caches never get warm enough to matter, and the peer fabric is too thin because half the peers don't exist by the time you check. So somebody builds a dedicated cache cluster, separate from the compute, that stays warm and gets hit by everybody.

This is the arc. We've seen it told to us by different people who didn't realize they were describing the same arc. The endpoint is roughly: local cache, peer cache, dedicated cache tier, falling back to the actual data store as a last resort. Three layers. Same shape every time. Different code every time.

## Why does it keep happening

You'd think, given that everyone ends up at the same place, somebody would have built the thing and shared it by now. And to be fair, some pieces exist. The cloud providers ship their own managed-cache products in front of object storage, but each one is tied to its provider. Several open-source projects have built filesystem-shaped abstractions over object stores, each with its own trade-offs in data format, deployment model, or feature gating. There are options. None of them are quite the thing the agentic stack needs.

So everyone keeps building. And the builds are private, because they're _"specific to our setup,"_ even though when you look at them they're 80% the same code with different names.

There's an interesting question buried in here, which is: why are we still doing this in 2026? The obvious answer is that the infrastructure layer underneath compute hasn't kept up with the compute layer itself. Kubernetes solved how to schedule containers. Terraform solved how to provision infrastructure. The agent frameworks solved how to orchestrate language models. The piece in the middle — _how does the right data get to the right compute fast enough to matter_ — is still being solved one company at a time, badly.

The deeper answer is that this kind of infrastructure has historically been hard to do well in the open. Storage systems are operationally tricky. Caching is full of subtle correctness bugs. Distributed protocols have a long tail of failure modes. The companies that have the expertise to build it well also have a business reason to keep it private. The companies that would benefit from a shared solution don't have the expertise to build one. There's a gap.

We think the gap can close. That's mostly what we want to talk about.

## What we're working on

We're building TierFS, an open-source filesystem 

## 深度分析

### 1. The three-layer arc is convergent evolution, not design

The most striking fact in the article is that teams who never spoke to each other independently walked the same progression: local NVMe cache on each node, then a peer-to-peer sharing layer to cut S3 egress and rate limits, then a dedicated cache cluster that stays warm for the whole fleet. Each layer gets added only when the previous one's failure mode is actually felt — local caches work until the fleet grows, peer fabric works until compute turns ephemeral and "half the peers don't exist by the time you check." That convergence means the shape is not a design choice anyone is making; it is the emergent optimum for "compute fast, networks slow, same data read many times" under an ephemeral fleet. A shape rediscovered independently N times is a specification waiting for an implementation, not an open research question.

### 2. The gap is organizational, not technical

The article's own diagnosis of "why are we still doing this in 2026" is unusually precise: the expertise to build the data layer well sits inside companies that also have a business reason to keep it private, while the companies who would benefit from a shared version lack the expertise to build one. The private builds are "80% the same code with different names," so what is missing is not novelty but trust — the operational credibility that lets teams hand real workloads to infrastructure nobody owns. This is the same dynamic that made POSIX, TCP, and DNS win: a primitive becomes infrastructure when its value is ubiquity rather than a proprietary edge, which is why the authors argue for an Apache-licensed, community-run implementation.

### 3. Data portability is the portability that never shipped

Compute portability is real (containers and orchestration solved it), network portability is real (DNS and service meshes got most of the way), but data portability still means "copy your data into whichever cloud you're using this week." Worse, each platform keeps re-fragmenting the layer: AWS and GCP push their own managed file systems, Modal has Volumes and CloudBucketMounts, E2B has its own model — so every workload move re-learns the data layer, and every new platform rebuilds the same primitive because the existing ones are platform-specific. TierFS's actual bet is that a mount point is the right abstraction boundary: the same config file and the same `/mnt/data` semantics on a laptop, a sandbox, or a production cluster, with the caching layers (local NVMe → peer → dedicated tier) hidden underneath. If that holds, "which cloud am I on" stops being an API question and becomes a config file.

### 4. Ephemeral compute inverts the caching assumptions

Classic cache design assumes long-lived consumers that amortize warm-up cost. Agent-era compute breaks that assumption twice: sandboxes spin up for a single task and disappear, and inference replicas scale with traffic, so any per-node warm cache is structurally useless — instances die before they get warm. This is exactly the workload profile of [Agent 沙箱与执行容器](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md): execution environments that are provisioned, used, and destroyed per task. The consequence is that for sandbox-style fleets the architecture conversation should start at the dedicated-cache-tier layer, not at the local-NVMe layer — the arc described in the article is what happens when teams discover this one step at a time.

## 实践启示

1. **Diagnose which layer you actually need before building**: if your compute is a stable cluster, pre-staging data beats building any cache; if your compute is genuinely ephemeral, start from a shared warm cache tier design instead of re-walking the local → peer → dedicated arc one painful step at a time.
2. **Treat "it's too specific to our setup" with suspicion**: the article's interviews show the private builds are ~80% identical; the reusable core is the layering shape (local + peer + dedicated, falling back to the store), not anyone's code.
3. **Prefer mount-point interfaces over platform-native data APIs**: keeping workloads on a filesystem abstraction like `/mnt/data` is what makes a workload movable between Modal, E2B, neoclouds, and Kubernetes without re-learning the data layer.
4. **For agent platform builders, start at the wrong end of the arc**: sandbox fleets ([Agent 沙箱与执行容器](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)) never live long enough to warm per-node caches, so plan the dedicated cache tier (or a mount-in frontend) from day one rather than after the S3 bill and rate limits arrive.
5. **Mind the alpha's constraints before adopting TierFS**: it is currently single-node, read-only, with basic POSIX surface — the peer cache layer, dedicated cache tier, and write support are roadmap items, so it is a design-direction signal today, not a production dependency.

→ [原文存档](https://tierfs.com/blog/every-team-builds-the-same-cache.html)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

