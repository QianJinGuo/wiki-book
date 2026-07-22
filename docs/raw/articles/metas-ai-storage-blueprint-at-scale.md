---
title: "Meta’s AI Storage Blueprint at Scale"
source_url: "https://engineering.fb.com/2026/07/01/data-infrastructure/metas-ai-storage-blueprint-at-scale/"
ingested: 2026-07-02T11:40:01Z
sha256: placeholder
type: raw
tags: [newsletter, raw]
---

# Meta’s AI Storage Blueprint at Scale

Title: Meta’s AI Storage Blueprint at Scale

URL Source: https://engineering.fb.com/2026/07/01/data-infrastructure/metas-ai-storage-blueprint-at-scale/

Published Time: 2026-07-01T16:00:36+00:00

Markdown Content:
Over the past several years, model capabilities and training dataset sizes have experienced exponential growth. During the past year or so, the time between new-frontier-model releases has gone down from months to weeks. Reliable and fast access to storage is important to both the speed and computational cost of this AI innovation. If AI is the brain, storage is the memory: Capability and speed are highly dependent on the size of memory and speed of retrieval.

Yet while AI compute performance has roughly tripled every two years, storage and interconnect performance growth have been more modest. As a result, storage bottlenecks continue to be one of the primary contributors to GPU stalls for AI workloads, directly impacting expenditures and time to market. Aside from GPU utilization, storage architecture also directly impacts the speed of iteration in AI research; with GPUs increasingly becoming geo-distributed and dataset sizes increasingly becoming massive, researchers spend a significant amount of time ingesting and moving data across regions, thus impacting research velocity. In this blog post, we discuss how Meta’s BLOB-storage architecture evolved to address two primary challenges: maximizing GPU utilization and maximizing research velocity.

[Video 3](https://www.youtube.com/watch?v=0NZHPasMqYE)

## Storage Architecture Overview

Meta operates hundreds of exabyte-scale storage clusters that serve all of Meta’s external and internal products, including Facebook, Instagram, Reality Labs, Meta AI, Ads, Data Warehouse, and internal Databases. Our storage service exposes object storage, file systems, and block-device APIs, and these API abstractions are built on top of a horizontally scalable foundational block layer called Tectonic. The Tectonic layer is a regional, multi-tenant storage fabric that provides high durability and availability leveraging erasure-coding techniques, supports tiering across media types (e.g., HDD and flash), and manages smart placement of hot, cold, and warm data for efficient utilization of I/O across tenants. The BLOB-storage layers that operate on top of Tectonic expose a global, infinitely scalable storage fabric, and expose policies that let users make tradeoffs between durability and availability.

In a previous [@Scale talk titled, “Training Llama: A Storage Perspective,”](https://atscaleconference.com/videos/training-llama-a-storage-perspective/) we discussed how Meta trained Llama directly over the Tectonic block layer by exposing an NFS-like FileSystem interface on top of it. While this architecture continues to be used widely within Meta, our modern training stack has been migrating slowly on top of the BLOB-storage interface, as is the case across the industry. This transition is motivated by the need for unified storage access to massive data lakes in the BLOB-storage layer as well as the need for high performance.

## Maximizing GPU Utilization

Modern AI workloads are “data hungry” and have very different workload characteristics than traditional web applications: bursty and sustained high throughput, predictable and bounded pMax latencies, and variable I/O patterns. The focus for BLOB storage, in recent years, has largely shifted to maximizing GPU utilization.

## Why Latency Matters

To see why bounded and low-pMax latencies are important, let’s consider model training. During that training, hundreds of thousands of GPUs iterate over vast amounts of data in storage multiple times (i.e., over multiple epochs), and the GPUs train datasets in batches. Periodically, after every certain number of steps or batches, the GPUs synchronize their state among themselves. If one GPU is slow, this step will slow down all GPUs as well as the entire training.

Figure 1 shows a data-load
