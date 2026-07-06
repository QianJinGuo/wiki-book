---
source: newsletter
source_url: https://blogs.nvidia.com/blog/blackwell-mlperf-training-6-0/
ingested: 2026-06-18
sha256: 84fa8e6d8dd031afeea60dc4bfdc39d3be352a36240d3354e9fe7f4e6665e5a0
feed_name: NVIDIA Blog
source_published: 2026-06-18
---

Title: Fastest, Largest, Strongest: NVIDIA Blackwell Sweeps MLPerf Training 6.0

URL Source: http://blogs.nvidia.com/blog/blackwell-mlperf-training-6-0/

Published Time: 2026-06-16T15:00:36+00:00

Markdown Content:
Every breakthrough AI model starts the same way: with a training run. The infrastructure running those training jobs shapes everything: how fast teams can iterate, what scale of model they can build and whether those jobs complete reliably.

As models grow in size, complexity and intelligence, the demands on training infrastructure are also rising.

In MLPerf Training 6.0 — the latest of a series of rigorous, peer-reviewed industry benchmarks for evaluating AI training performance — the NVIDIA Blackwell platform led across every category, demonstrating:

*   Fastest time to train on every benchmark
*   Largest-scale training across 8,192 GPUs using NVIDIA Blackwell NVL72 systems
*   The only platform with submissions across all seven benchmarks in the suite

NVIDIA brings together performance, scale and reliability in a single platform engineered through extreme codesign to enable AI model builders to launch frontier models faster, minimize training costs and start generating revenue early.

## **Performance: Fastest Time to Train on Every Benchmark**

MLPerf Training 6.0 added two new [mixture-of-experts](https://www.nvidia.com/en-us/glossary/mixture-of-experts/) (MoE) pretraining workloads to the suite: DeepSeek-V3 671B and GPT-OSS-20B, reflecting the growing centrality of MoE architectures. The NVIDIA platform was the only one to be submitted across every benchmark, and delivered the fastest time to train on all seven.

![Image 1](https://blogs.nvidia.com/wp-content/uploads/2026/06/end-to-end-graphics-mlperf-6.0-training-charts-5311563-v6_Slide2.jpg)

This round, NVIDIA submitted results on both NVIDIA GB200 NVL72 and GB300 NVL72 rack-scale systems. Within each rack-scale system, fifth-generation NVIDIA NVLink Switches connect all 72 GPUs with high bandwidth, into a unified pool of compute and memory, enabling them to act as one giant GPU.

Large-scale MoE training faces the same all-to-all communication challenge as [MoE inference](https://blogs.nvidia.com/blog/mixture-of-experts-frontier-models/) — tokens must be routed across GPUs to reach the right expert subnetwork — and NVLink’s bandwidth advantage is what makes that fast and efficient at scale.

NVIDIA also showcased NVFP4 training methods that increase performance while meeting strict accuracy requirements across large- and small-scale pretraining as well as fine-tuning workloads. NVIDIA continues to push low-precision training innovation across different model architectures, most recently using NVFP4 to pretrain the massive 550-billion-parameter [NVIDIA Nemotron 3 Ultra](https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/) model.

**NVIDIA GB300 NVL72 Delivered up to 1.6x Performance Over GB200 NVL72:**In this round, GB300 NVL72 delivered up to 1.6x faster training than GB200 NVL72 at the same scale. Key Blackwell Ultra capabilities such as higher compute density with NVFP4, expanded memory capacity and a higher power ceiling that lets the GPU sustain peak performance drive this improvement.

![Image 2](https://blogs.nvidia.com/wp-content/uploads/2026/06/end-to-end-graphics-mlperf-6.0-training-charts-5311563-v7-slide1.jpg)

## **Scale: Largest Blackwell Cluster in MLPerf Training**

To support distributed training at scale, NVIDIA offers two complementary scale-out networking platforms — [NVIDIA Quantum InfiniBand](https://www.nvidia.com/en-us/networking/quantum2/) and [NVIDIA Spectrum-X Ethernet](https://www.nvidia.com/en-us/networking/spectrumx/) — giving data centers the flexibility to build large-scale clusters optimized for their infrastructure.

On DeepSeek-V3 671B, the largest MoE model in the suite, NVIDIA scaled its submission to 8,192 GPUs using GB200 NVL72 systems, the largest-scale Blackwell-based submission in MLPerf Training to date.

NVIDIA also submitted results at 5,120 GPUs with NVIDIA GB200 NVL72 systems on Llama 3.1 405B, one of the largest dense LLMs in the suite.

![Image 3](https://blogs.nvidia.com/wp-content/uploads/2026/06/end-to-end-graphics-mlperf-6.0-training-charts-5311563-v6_Slide3.jpg)

This round’s results also reflect the deep co-engineering between NVIDIA and its partners on system architecture, networking and software:

*   Microsoft Azure scaled Llama 3.1 405B training to 8,192 GPUs using GB200 NVL72 systems, and reached the reference quality target in 7.07 minutes, the fastest time to train for this benchmark.
*   CoreWeave delivered the fastest time to train for DeepSeek-V3 671B, reaching the quality target in 2.02 minutes at 8,192-GPU scale using GB300 NVL72 systems connected with Spectrum-X Ethernet networking.

## **At-Scale Reliability: Built for Production**

In production training environments, runs can span weeks or months across hundreds of thousands of GPUs. At that scale, effective training throughput depends on both the performance of the system and the resiliency that makes it reproducible over time.

The MLPerf Training v6.0 results above speak to the performance of NVIDIA’s platform. For resiliency, NVIDIA’s platform is engineered across two dimensions:

*   **Fewer interruptions**: NVIDIA GPUs are built to avoid failures before they occur. Before a GPU reaches a data center, NVIDIA screens it across 30+ manufacturing test stages to catch potential faults early. Once deployed, the Reliability, Availability and Serviceability Engine monitors nearly the entire chip, and self-healing capabilities automatically route around detected faults without interrupting the workload. At the network level, Spectrum-X Ethernet reroutes around failed links in milliseconds, keeping the fabric healthy without disrupting the job.
*   **Faster recovery when interruptions happen**: NVIDIA Resiliency Extension, or NVRx, minimizes the time lost when faults do occur, with capabilities spanning fault detection, recovery and health monitoring across the cluster. It automatically detects and manages underperforming nodes before they slow the rest of the cluster down. When a node experiences an interruption, rather than restarting the entire job, the system resumes from a recent checkpoint, aka a saved snapshot of the training state.

## **Frontier AI Built on NVIDIA**

NVIDIA ecosystem partners also participated extensively this round, with compelling submissions from 19 organizations, including ASUSTeK, Microsoft Azure, Cisco, CoreWeave, Dell Technologies, Fujitsu, Giga Computing, Google Cloud, Hewlett Packard Enterprise, Inventec, Krai, Lambda, Nebius, Netweb Technologies India Ltd., Quanta Cloud Computing (QCT), ScitiX, Supermicro and TTA. Many of these partners are running some of the most demanding AI training workloads on NVIDIA infrastructure.

CoreWeave, which houses its NVIDIA infrastructure within Dell PowerRack systems with Dell PowerEdge servers, is home to several of these workloads. [Cohere achieved 3x faster training on GB200 NVL72](https://www.coreweave.com/resources/case-studies/cohere-accelerates-training-of-north-agentic-ai-for-enterprise) for its North agentic AI platform. Midjourney,which trained its v8 image generation model on a Blackwell cluster, is now scaling a large fleet of Blackwell Ultra GPUs on CoreWeave to train upcoming image and video models.

[On Google Cloud, Thinking Machines Lab](https://www.googlecloudpresscorner.com/2026-04-22-Thinking-Machines-Expands-Use-of-Google-Cloud-AI-Hypercomputer) saw 2x faster training and serving speeds on GB300 NVL72 compared with prior-generation GPUs, accelerating frontier model research and reinforcement learning workflows.

Nebius, running NVIDIA Blackwell and Blackwell Ultra infrastructure on its AI cloud, [enabled Higgsfield](https://www.nvidia.com/en-us/case-studies/higgsfield/) to reduce model training time by 30%, supporting a platform that now serves 22 million users and generates over 6 million pieces of AI content per day.

For a deeper technical look at the MLPerf Training 6.0 results and the optimizations behind them, read this [technical blog](https://developer.nvidia.com/blog/nvidia-blackwell-tops-mlperf-training-6-0-with-industry-leading-scale-and-performance/).

