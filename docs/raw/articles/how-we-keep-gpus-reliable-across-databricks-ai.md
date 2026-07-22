---
title: "How we keep GPUs reliable across Databricks AI"
source_url: "https://www.databricks.com/blog/how-we-keep-gpus-reliable-across-databricks-ai"
ingested: 2026-07-02T11:40:01Z
sha256: placeholder
type: raw
tags: [newsletter, raw]
---

# How we keep GPUs reliable across Databricks AI

Title: How we keep GPUs reliable across Databricks AI

URL Source: https://www.databricks.com/blog/how-we-keep-gpus-reliable-across-databricks-ai

Published Time: 2026-07-01T23:00:00+0000

Markdown Content:
Distributed GPU training has become routine across the industry. Teams now train foundation models, fine-tune frontier-scale models, build large vision systems, and run deep recommender networks at scales that were once the domain of frontier labs alone.

Building GPU infrastructure that can meet today's scale requires getting a lot of things right: detecting the failures that take down a run, surfacing the slow degradations that never announce themselves, validating fabric health across thousands of links, scheduling around hardware that will eventually fail, and recovering cleanly when it does. Many of these are foundational, and the harder problems higher up the stack depend on them.

At Databricks AI, we run training workloads at massive scale every week, where failures show up continuously across hardware, fabric, and software. This series covers what it takes to keep GPUs reliable at this scale, starting with the foundation in this first post: the failure modes you encounter running GPUs, the diverse workloads that surface them, and the multi-stage health check system that catches them. Training is the most demanding workload class and the focus here, though the same engineering serves inference and other GPU workloads at Databricks.

## How GPUs fail under training load

Most GPU failures at scale fall into three categories: crashed jobs, silent slowdowns, and numerical corruption. Crashed jobs are the easy case, in the sense that you know immediately when one happens. The harder failures are workloads that complete with wrong numbers in the model, or run at degraded performance for hours without anyone noticing.

**Crashed jobs.** Distributed training jobs crash for many reasons: a GPU degrading or falling off the bus, RDMA fabric issues, an I/O system hang, a CPU-side rank diverging from the others. From the workload's perspective, almost all of these surface as the same thing: the job crashing with the dreaded [NCCL watchdog timeout](https://pytorch.org/blog/flight-recorder-a-new-lens-for-understanding-nccl-watchdog-timeouts/) message in the logs. Every rank blocks on the same collective, the watchdog eventually kills the job, and you restart from the last checkpoint. But the timeout itself tells you almost nothing about the root cause. Diagnosing what actually went wrong often means tracing across hardware, fabric, filesystem, and software layers from a stack trace that only shows the symptom.

**Silent slowdowns.** A silently degraded GPU can continue to make training progress, with logs looking fine and loss still trending down. However, the throughput is bottlenecked on the slowest GPU, wasting compute and money. These slowdowns come from hardware running in a degraded state, where thermal sensors trip under sustained load, interconnect links downgrade after persistent errors, or memory bandwidth drops as faults accumulate. Each shows up in different hardware-level signals, e.g. [DCGM](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html) throttle reasons like `HW_SLOWDOWN` or `HW_THERMAL_SLOWDOWN` for thermal, or link health for interconnects.

**Numerical corruption.** Modern GPUs use Error Correction Code (ECC) to detect and automatically correct many transient memory faults without interrupting training. However, not all faults can be recovered. Corruption may originate in memory, interconnects, kernels, or software layers and can propagate before it is detected or contained. In those cases, training may stop immediately or continue with incorrect values. Failures can appear as NaN losses, unstable convergence, or model quality regressions that are only discovered later.

## Our approach to GPU reliability

GPU hardware failure event rates can be an order of magnitude higher than
