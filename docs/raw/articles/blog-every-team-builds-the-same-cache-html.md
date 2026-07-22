---
title: "Every Team is Building the Same Cache — TierFS"
source_url: "https://tierfs.com/blog/every-team-builds-the-same-cache.html"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 2602e974e39554f900b994a975d2980d6d8cb2c316da7e03972b879fe68aabb8
---

# Every Team is Building the Same Cache — TierFS


Published Time: Thu, 25 Jun 2026 21:41:37 GMT

Markdown Content:
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

We're building TierFS, an open-source filesystem in Rust that you can mount in front of any S3-compatible storage. The pitch is straightforward: you point it at a bucket, you mount it at `/mnt/data`, your code reads files. Underneath, TierFS handles the caching — local NVMe on each node, peer sharing across a cluster, and an optional dedicated cache tier when you have ephemeral compute that needs a warm cache to land on. The data in your bucket stays exactly as you uploaded it, so other tools can still see it. There's no proprietary format, no lock-in, no enterprise tier behind a paywall.

The idea isn't novel. The shape is the shape that's already been figured out by every team that's built this privately. What's new is doing it as a single open-source project that anyone can run on any infrastructure — your laptop, a single VPS, a Kubernetes cluster, a fleet of neocloud GPU boxes, on-prem hardware. The same mount, the same caching behavior, the same configuration, anywhere.

This matters more than it might sound. The current state of the world is that each cloud provider, each neocloud, each AI platform has its own opinions about how to inject data into compute.

AWS wants you to use their managed file system. GCP wants you to use theirs. Modal wants you to use Volumes and CloudBucketMounts. E2B has its own model. Every time your workload moves from one environment to another, you re-learn the data layer. Every time a new platform comes online, it builds its own version of the same primitive, because the existing ones are platform-specific.

The version we want to exist is the one that doesn't care where it's running. Same filesystem, same cache, same behavior, whether you're on a laptop or a sandbox or a production cluster. The neocloud doesn't have to build it. You don't have to build it. It just exists, you mount it, you move on.

## Why open source

A lot of infrastructure that should be common goes private because the company that built it can extract margin from keeping it private. That's a legitimate move; we don't begrudge anyone doing it. But we think there's a class of infrastructure where being shared is the whole point of being good — where the value is in the ubiquity, not in the proprietary edge.

Files have been the universal interface to data for fifty years. The reason filesystems are useful is that everything uses them. The reason POSIX won is that you could write a program against POSIX and have it run anywhere. The cache layer underneath ephemeral compute should have the same property. It shouldn't matter whose code is running it; it should be the thing everyone uses, the way everyone uses TCP or DNS or the kernel.

That probably means it needs to be open source, Apache-licensed, run by a community rather than a company, and good enough operationally that teams trust it with real workloads. None of that is easy, and we're not claiming TierFS is there yet. It isn't. The alpha is single-node and read-only and has all the rough edges you'd expect from a project that's been in development for a few months. But it's where we're trying to get, and we think the destination is worth the work.

## What this looks like in practice

The version we want, eventually, is something like this. You install TierFS on a machine — a laptop, a GPU node, a sandbox runtime, whatever you've got. You give it a config file that says _"here's an S3 bucket, here's a cache directory, mount it at `/mnt/data`."_ You run a single command. Now your code can read files from `/mnt/data` as if they were local. The first read of a file pulls from S3 and caches it. The second read is from NVMe. If you're in a cluster, the second read might be from a peer node that already had it. If you've configured a dedicated cache tier, you might be reading from there. Your code doesn't know or care.

You move the same code to a different environment — a Modal sandbox, an E2B container, a CoreWeave VM, a Kubernetes pod. You bring the same config file. You run the same command. Your code reads from `/mnt/data` again. Same behavior. Same cache semantics. Same everything.

This is what cloud infrastructure has, kind of, been promising for fifteen years, and what it has consistently failed to deliver for the data layer. Compute portability is real — containers and orchestration solved it. Network portability is real — service meshes and modern DNS got most of the way there. Data portability still mostly means _"copy your data into whichever cloud you're using this week."_ It shouldn't.

## What's next

The alpha works today against S3-compatible storage. Single node, local NVMe cache, basic POSIX surface. It's enough to be useful for some workloads and not enough for most. Over the next year we're building out the peer cache layer, the dedicated cache tier, write support, and — most interestingly to us — support for sources beyond object stores. The cache infrastructure stays the same; the breadth of what's mountable grows.

That last part is the longer-term vision, and it's the thing that turns TierFS from _"a cache for object storage"_ into _"a universal data layer for the compute platforms we're actually building now."_ The cache is what makes it fast. The unified interface is what makes it useful. Both matter.

If any of this resonates — if you've built one of these caches yourself, or if you're about to, or if you're a team that's wishing somebody else would already — we'd love to hear from you. [hello@tierfs.com](mailto:hello@tierfs.com) goes straight to us. Comments, war stories, and pointed criticism all welcome.

The longer we wait to build this once, in the open, the more times every new team will build it again from scratch.

∎

