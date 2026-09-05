---
title: "ModelExpress: Distributing Model Artifacts at the Speed of Light"
source_url: "https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/"
source: newsletter
sha256: b7c7892314388c83d10fb1acaa7a9e87ae4cc53a2d4b8a35fee69a52d3160001
ingested: 2026-07-28
---

---
source_url: https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/
source: nvidia
title: "ModelExpress: Distributing Model Artifacts at the Speed of Light"
---







Markdown Content:
[![Image 2: Home](https://developer-blogs.nvidia.com/wp-content/themes/nvidia/dist/images/nvidia-logo_28b633c7.svg)](https://developer.nvidia.com/ "Home")[DEVELOPER](https://developer.nvidia.com/ "Home")

*   [Home](https://developer.nvidia.com/ "Home")
*   [Blog](https://developer.nvidia.com/blog "Blog")
*   [Forums](https://forums.developer.nvidia.com/ "Forums")
*   [Docs](https://docs.nvidia.com/ "Docs")
*   [Downloads](https://developer.nvidia.com/downloads "Downloads")
*   [Training](https://www.nvidia.com/en-us/training/ "Training")

*      
*   [Join](https://developer.nvidia.com/login)
*   [](https://developer.nvidia.com/login)

[Technical Blog](https://developer.nvidia.com/blog)

[Subscribe](https://developer.nvidia.com/email-signup)

[Related Resources](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#main-content-end)

[Agentic AI / Generative AI](https://developer.nvidia.com/blog/category/generative-ai/)

# ModelExpress: Distributing Model Artifacts at the Speed of Light

![Image 3](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image5-11-1024x576.jpg)

 Jul 24, 2026 

 By [Hyunjae Woo](https://developer.nvidia.com/blog/author/hwoo/ "Posts by Hyunjae Woo"), [Kavin Krishnan](https://developer.nvidia.com/blog/author/kavink/ "Posts by Kavin Krishnan"), [Nicholas Noble](https://developer.nvidia.com/blog/author/nnoble/ "Posts by Nicholas Noble"), [Zheng Luo](https://developer.nvidia.com/blog/author/zheluo/ "Posts by Zheng Luo") and [Ganesh Kudleppanavar](https://developer.nvidia.com/blog/author/ganeshku/ "Posts by Ganesh Kudleppanavar")

+14

 Like 

[Discuss (0)](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#entry-content-comments)

*   [L](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [T](https://twitter.com/intent/tweet?text=ModelExpress%3A+Distributing+Model+Artifacts+at+the+Speed+of+Light+%7C+NVIDIA+Technical+Blog+https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [F](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [R](https://www.reddit.com/submit?url=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F&title=ModelExpress%3A+Distributing+Model+Artifacts+at+the+Speed+of+Light+%7C+NVIDIA+Technical+Blog)
*   [E](mailto:?subject=I'd%20like%20to%20share%20a%20link%20with%20you&body=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)

AI-Generated Summary

Like

Dislike

*   NVIDIA ModelExpress (MX) efficiently accelerates the model weight lifecycle by selecting the fastest available path for loading model weights, prioritizing direct GPU-to-GPU P2P RDMA transfers via NIXL, and reducing reliance on object storage and host memory.
*   MX employs advanced strategies including multithreaded streaming, atomic distributed caching, GPUDirect Storage, and runtime path selection to optimize cold starts, minimize redundant data movement, and automate optimal transfer methods across diverse cluster environments.
*   The platform enables rapid weight and kernel cache artifact transfer, supports receiver-driven RL refit workflows, integrates with vLLM, SGLang, Dynamo, and llm-d, and incorporates optimizations such as VMM arena registration to significantly reduce startup and registration overheads in production LLM deployments.

AI-generated content may summarize information incompletely. Verify important information. [Learn more](https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/)

Every byte moved has a cost. As model checkpoints grow to hundreds of gigabytes or even a terabyte, that cost adds up quickly. To make things even worse, moving these model weights around the cluster is extremely common. For instance, a cold start may pull weights from remote storage into GPU memory; autoscaling and rolling updates must populate each new replica; and RL post-training continuously moves updated weights from trainers to roll out workers. These may look like different workflows, but they impose the same recurring tax: time spent moving weights before useful work can begin.

## ModelExpress: Accelerating the model weight lifecycle[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#modelexpress_accelerating_the_model_weight_lifecycle)

NVIDIA ModelExpress (MX) is built around a simple idea: Before loading a model, first ask where a compatible copy of its weights already lives. Rather than treating every replica as an independent cold start, MX chooses the fastest available source and transfer path.

When a serving peer already holds compatible weights in GPU, MX transfers them directly from GPU to GPU over P2P RDMA via NVIDIA Inference Xfer Library ([NIXL](https://github.com/ai-dynamo/nixl)), bypassing redundant access to object storage, local disk, and host memory. When no peer is available, MX bootstraps from the fastest supported path by streaming from an object store without landing on disk or reading local files directly into GPU memory.

MX transfers DeepSeek-V4 Pro weights and JIT Kernel cache artifacts from a serving replica into a fresh replica in under 10 seconds, reducing the total startup time to 1 minute 44 seconds from 8 minutes**.**The rest of the post shows how MX selects the fastest available path to GPU memory, prioritizing P2P RDMA from a serving replica and eliminating redundant downloads and copies along the way. It then extends the same approach to reusing kernel caches and distributing RL weight updates.

![Image 5: An overview of ModelExpress. The control plane discovers compatible sources through Redis or Kubernetes metadata. The data plane transfers weights along a probed priority chain— moves weights directly from a serving peer over GPUDirect RDMA through NIXL, streams them from object storage through ModelStreamer, or reads them from local storage through GDS.
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image2-14.webp)

_Figure 1. Overview of ModelExpress_

## Accelerating every stage from remote storage to GPU memory[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#accelerating_every_stage_from_remote_storage_to_gpu_memory)

Every new worker must get its weights from one of three places: remote storages (e.g. HF or S3), local storage, or another worker already serving the model. For the first worker, there is no peer yet, so it must bootstrap from storage. MX can stream the checkpoints from object storage or load it from fast local storage, removing avoidable copies along either path.

Once that first worker is serving, the preferred source changes. Its weights are already resident, post-processed, and laid out in GPU memory, so every compatible worker after it should load directly from that peer over P2P RDMA. MX makes this transition automatically: bootstrap once from storage, then scale out GPU to GPU, falling back to storage only when no compatible peer is available.

### Starting the first worker: Bootstrap from storage[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#starting_the_first_worker_bootstrap_from_storage)

**Remote object storage to GPU: Avoiding local disk**

When the checkpoint lives in a cloud bucket and you would rather not provision and manage a disk cache tier, MX uses the [Model Streamer](https://github.com/run-ai/runai-model-streamer) to pull safetensors through a reusable CPU staging buffer and into GPU. The checkpoint never lands on local disk, eliminating the intermediate download, reload, and storage volume.

Model Streamer uses a multithreaded tensor reader to fetch tensor ranges concurrently across checkpoint shards. As tensors arrive, it pipelines remote reads with GPU placement: completed tensors are passed to the inference engine while later tensors are still being fetched. This keeps the storage, network, and GPU copy paths busy while reusing a bounded amount of host memory.

In tensor-parallel deployments, the participating ranks divide the remote reads and share the results, typically over NCCL, instead of having every rank download the full checkpoint independently. MX connects this distributed stream directly to the inference engine’s weight loader, preparing the first worker to become the P2P source for every compatible replica that follows.

**Cluster ingress: Download once, not N times**

When a cluster maintains a shared disk cache tier (e.g. persistent volumes in K8s), MX ensures that the fleet populates it only once. If 10 replicas concurrently want to fetch the 806 GiB DeepSeek-V4 Pro model, they will need to pull roughly 8 TiB of identical data across the network while competing for the same ingress bandwidth. The MX Model Cache Service collapses those requests into one coordinated download: an atomic claim in Metadata Store selects a downloader, while the remaining replicas track its progress and reuse the cached copy. The cluster pays the external download cost once, then every replica can begin from the same cached checkpoint.

**Local storage to GPU: Bypassing host-memory staging**

When GPUDirect Storage (GDS) is supported in the system, MX reads checkpoint files directly from local storage into GPU memory through NIXL’s multithreaded GDS backend. NIXL executes batched tensor reads in parallel directly into GPU memory, bypassing host memory and the staging copy required by a conventional loader. Users don’t need to enable GDS explicitly: MX detects the capability automatically and falls back to another loading strategy when it is unavailable.

**Local storage to GPU: Pipelining local reads with ModelStreamer**

MX can also load local checkpoints through ModelStreamer. Multiple OS threads read safetensors concurrently into a configurable CPU buffer while completed tensors move to the GPU and later reads continue in parallel. Unlike GDS, this path still stages through host memory, but it overlaps disk I/O with GPU placement, benefits from the OS page cache, and provides a portable fast path when direct storage-to-GPU access is unavailable.

### Starting every worker after the first: Fetch from a serving peer[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#starting_every_worker_after_the_first_fetch_from_a_serving_peer)

This is the key feature of MX. Once another replica is already serving the same model, the weights have completed most of their journey: they are resident in GPU memory, post-processed, and laid out for the inference engine. MX treats that replica as a live weight source. After confirming compatibility, it transfers the tensors directly from the source GPU to the target GPU. Once its weights are loaded, the new replica joins the source pool, giving subsequent replicas another peer to load from. With every successful transfer, that pool grows alongside the deployment, turning scale-out into GPU-to-GPU fan-out instead of repeated cold loads.

The MX control plane discovers compatible peers, exchanges transfer metadata, and tracks source readiness, but never handles the weight bytes themselves. On the data plane, MX uses NIXL as a default transfer engine whose pluggable backends allow for peak performance across a variety of networks, such as Infiniband, RoCE, NVLink, EFA, etc. MX has a first-class transport interface that allows libraries such as `fabric-lib` and standalone Mooncake to integrate with MX.

![Image 7: A diagram illustrating how a new engine replica discovers and fetches model weights directly from the source over RDMA via NIXL, with the new replica joining the source pool to enable fan-out scaling.
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image4-14.webp)

_Figure 2. Peer-to-peer GPUDirect RDMA weight transfer via NIXL_

Before any transfer begins, MX computes an `mx_source_id` from the model and runtime settings that determine tensor layout, then considers only peers with a matching ID. The control plane discovers those peers through Redis, Kubernetes CRDs, or `k8s-service` (serverless) metadata backends.

### Optimizing NIXL memory registration overhead[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#optimizing_nixl_memory_registration_overhead)

Before NIXL can RDMA a tensor, the GPU memory backing it has to be registered: an `ibv_reg_mr` call that returns the Remote Key (rkey) used for remote access. A large model has tens of thousands of tensors, and registering them one at a time is slow enough to show up in the budget. By default, MX registers each tensor individually. Two opt-in strategies reduce that registration cost:

*   **Pool registration** registers each underlying `cudaMalloc` allocation once instead of each tensor, cutting registration count by 80 to 99 percent on typical models with no change to transfer semantics.
*   **VMM arena registration** goes further. It installs a `CUDAPluggableAllocator` that routes every load-time allocation into a single 16 TiB virtual-address arena, then registers the whole used range as one dmabuf-backed memory region at end of load. Registration collapses from one call per tensor to one call, total; each tensor descriptor simply carries an offset into that single region.

Using DeepSeek-V4-Pro TP=8 on the vLLM engine, as shown in Figure 3, below, we measured the average NIXL registration time for each approach.

![Image 9: A bar chart comparing NIXL memory registration times for DeepSeek-V4-Pro (TP=8 on vLLM) across three strategies: per-tensor registration (baseline), pool registration, and VMM arena registration (fastest).
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image3-13.webp)

_Figure 3. NIXL memory registration optimization_

### Runtime path selection and safe fallback[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#runtime_path_selection_and_safe_fallback)

At startup, MX probes the available capabilities, automatically skipping any path the environment does not support. The first applicable strategy runs in the current priority order: `P2P RDMA -> ModelStreamer -> GDS -> default loader (host-staged POSIX I/O)`. If a path is unavailable or fails before modifying the model state, MX falls through automatically. If a failure occurs after weights have begun landing, it reinitializes the model before continuing, so partially written weights are never served.

P2P retries alternate peers only for metadata failures before transfer begins, and the native loader remains the final fallback. This capability-driven design keeps the MX core hardware and software agnostic, with platform-specific fast paths enabled only where supported.

### End-to-end results[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#end-to-end_results)

We ran DeepSeek-V4-Pro on an 8xB200 GPU node with NVIDIA ConnectX-7 NICs and compared the total model loading time across different cold start scenarios. Each replica used vLLM 0.23.0 with TP=8 and `--enable-flashinfer-autotune`. See Figure 4, below.

![Image 11: A bar chart comparing total model loading time for DeepSeek-V4-Pro on an 8xB200 node across four paths: P2P RDMA, ModelStreamer, GDS, and default host-staged POSIX I/O.
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image1-13.webp)

_Figure 4. End-to-end cold start model loading time comparing HF vs ModelStreamer (S3) vs Disk vs P2P RDMA_

## Warm, not just loaded: Inheriting the compiled kernels[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#warm_not_just_loaded_inheriting_the_compiled_kernels)

Getting weights into GPU memory is critical, but a loaded model is not yet ready to serve. During its first forward passes, the engine JIT-compiles and autotunes kernels (e.g. torch.compile, Triton, DeepGEMM, TileLang, and etc.) and captures CUDA graphs for the exact model, dtype, quantization, and GPU. For models such as DeepSeek-V4 Pro, this can take several minutes and can become the dominant startup cost once MX reduces weight-loading latency (see Figure 5, below).

![Image 13: A stacked bar chart showing that after ModelExpress eliminates weight-loading latency, JIT kernel compilation (torch.compile, Triton, DeepGEMM, etc.) becomes the dominant startup cost for DeepSeek-V4-Pro.](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image8-1.webp)

_Figure 5. Startup time breakdown of DeepSeek-V4 Pro (TP=8 vLLM)_

That repeated warmup is avoidable. When the model, software stack, and GPU architecture match, one replica can pay the compilation cost and the rest can inherit the resulting caches.

MX’s Artifact Transfer API packages these file-backed artifacts, transfers them directly between registered host-memory buffers over NIXL’s CPU-to-CPU RDMA path, then verifies and installs them in the target engine’s cache directory. This eliminates the need for a shared ReadWriteMany (RWX) volume in Kubernetes, while an artifact-specific `mx_source_id` prevents reuse across incompatible replicas. MX detects standard cache locations automatically when a Redis or Kubernetes metadata backend is configured.

We ran using the same setup to measure how much the kernel artifact transfer can reduce the startup time. The artifact-enabled run transferred the Triton/DeepGEMM/TileLang/CuTe DSL/FlashInfer caches. The chart compares the major startup stages and total wall-clock time from process start until the API was ready.

![Image 15: A grouped bar chart comparing total startup time of disk baseline and ModelExpress P2P RDMA with and without the artifact transfer mechanism, showing that inheriting Triton, DeepGEMM, TileLang, CuTe DSL, and FlashInfer kernel caches significantly reduces wall-clock time to API ready.
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image6-8.webp)

_Figure 6. Total startup time reduction with ModelExpress_

## When the weights change every Step: RL post-training[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#when_the_weights_change_every_step_rl_post-training)

Everything so far assumes a model’s weights are fixed once loaded. RL post-training breaks that assumption. A trainer updates the policy every step, and the inference actors generating rollouts must pick up those weights before the next round of generation. As with inference startup, weight movement is on the critical path in RL: rollout workers wait while updated weights move from the trainer’s distributed layout (whether FSDP/DTensor shards or Megatron TP, PP, and EP partitions) into the inference engine’s layout.

![Image 17: A diagram showing the ModelExpress RL refit flow, where trainer ranks advertise tensor ownership to the control plane for source discovery and rollout workers pull updated weight bytes directly from trainer ranks over NIXL.
](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/image7-4.webp)

_Figure 7. ModelExpress makes RL refit receiver-driven_

MX drives the refit through the following four stages:

1.   **Publish:** Each trainer rank advertises the tensors or shards it already owns, together with metadata describing their shape, dtype, placement, and parameter mapping to MX.
2.   **Discover:** A rollout worker looks up the requested weight version and its available sources through MX.
3.   **Plan:** The receiver maps the published ownership information onto its own target layout and identifies which sources contain the required tensors or ranges.
4.   **Pull, convert, and load:** The receiver issues one-sided reads directly against those sources.

MX includes the core building blocks for receiver-driven refit, and customers are evaluating them in active integrations. We are also testing delta weight diff refits for cross-cluster weight transfer, a technique used by Fireworks/Cursor, Cognition, and more in recent RL runs.

## Contributing to Dynamo and our roadmap[](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#contributing_to_dynamo_and_our_roadmap)

MX has native integrations with vLLM and SGLang and supports serving frameworks including Dynamo and llm-d.

The Dynamo open source community is actively working toward deeper TensorRT-LLM integration and broader inference capabilities. Explore the current Dynamo documentation and[roadmap](https://github.com/ai-dynamo/modelexpress#roadmap), try the available workflows in your own environment, and contribute feedback to help shape the project’s direction.

_**Acknowledgments**_

_ModelExpress is a team effort. Thank you to the rest of the MX team, Zhongdongming Dai and Tanushriya Singh for their core work on the project. We’re grateful to Itay Neeman, Anish Maddipoti, Istvan Haller, and Omri Kahalon for their guidance on the project’s technical direction, and Will Eaton at Red Hat for his support on the llm-d integration._

[Discuss (0)](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/#entry-content-comments)

+14

 Like 

## Tags

[Agentic AI / Generative AI](https://developer.nvidia.com/blog/category/generative-ai/) | [Data Center / Cloud](https://developer.nvidia.com/blog/category/data-center-cloud/) | [Developer Tools & Techniques](https://developer.nvidia.com/blog/category/development/) | [General](https://developer.nvidia.com/blog/recent-posts/?industry=General) | [Cloud Services](https://developer.nvidia.com/blog/recent-posts/?industry=Cloud+Services) | [Dynamo](https://developer.nvidia.com/blog/recent-posts/?products=Dynamo) | [GPUDirect](https://developer.nvidia.com/blog/recent-posts/?products=GPUDirect) | [Intermediate Technical](https://developer.nvidia.com/blog/recent-posts/?learning_levels=Intermediate+Technical) | [Deep dive](https://developer.nvidia.com/blog/recent-posts/?content_types=Deep+dive) | [AI Foundation Models](https://developer.nvidia.com/blog/tag/ai-foundation-models/) | [AI Inference](https://developer.nvidia.com/blog/tag/ai-inference-microservices/) | [Inference Performance](https://developer.nvidia.com/blog/tag/inference-performance/) | [LLMs](https://developer.nvidia.com/blog/tag/large-language-models/)

## About the Authors

![Image 19: Avatar photo](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/cropped-hyunjae_headshot.JPG-131x131.webp)

**About Hyunjae Woo**

 Hyunjae Woo is a senior systems software engineer on NVIDIA's Dynamo team, working on distributed LLM inference systems. His current work focuses on fast model weight transfer across the inference stack, using fast fabrics like InfiniBand and P2P RDMA to push the hardware to its limits. Hyunjae holds a master's and bachelor's from the University of Michigan. 

[View all posts by Hyunjae Woo](https://developer.nvidia.com/blog/author/hwoo/)

![Image 21: Avatar photo](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/cropped-Krishnan-131x131.webp)

**About Kavin Krishnan**

 Kavin Krishnan is a deep learning systems software engineer at NVIDIA, where he has spent 6 years accelerating distributed inference at scale. As a member of the founding team of ModelExpress, he helped develop a fast P2P solution for reducing cold-start latency for distributed LLM workloads. His current work focuses on optimizing weight refits between trainers and generators in post-training reinforcement learning workflows. He holds a master’s degree in machine learning from Georgia Tech. 

[View all posts by Kavin Krishnan](https://developer.nvidia.com/blog/author/kavink/)

![Image 23: Avatar photo](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/cropped-Noble-131x131.webp)

**About Nicholas Noble**

 Nicolas Noble is a senior software engineer on NVIDIA's Dynamo team, working on distributed LLM inference infrastructure. He created the initial version of ModelExpress, the first piece of code in the project, and works across the benchmarking and runtime pieces around it, leveraging his experience from video game development to squeeze as much performance as possible out of the software and hardware stack. Nicolas studied in his home country, France, where he holds a degree from the University of Lorraine. 

[View all posts by Nicholas Noble](https://developer.nvidia.com/blog/author/nnoble/)

![Image 25: Avatar photo](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/cropped-ZhengIMG_6502-131x131.webp)

**About Zheng Luo**

 Zheng Luo is a senior software engineer on NVIDIA’s Dynamo team, where he works on distributed systems for large language model inference. His current focus is reducing LLM inference startup latency and productionizing these optimizations across widely used open-source inference frameworks. Previously, he developed and operated a large-scale inference fleet serving frontier models. Zheng holds a master’s degree from the University of California, Irvine, and a bachelor’s degree from Fudan University in Shanghai. 

[View all posts by Zheng Luo](https://developer.nvidia.com/blog/author/zheluo/)

![Image 27: Avatar photo](https://developer-blogs.nvidia.com/wp-content/uploads/2024/07/GaneshKudleppanavar-131x131.jpg)

**About Ganesh Kudleppanavar**

 Ganesh Kudleppanavar is a system software manager and engineering leader at NVIDIA, focused on the performance, efficiency, and safety of machine learning and generative AI models. He leads teams driving model benchmarking, faster model loading and weight delivery, and programmable safety guardrails for LLM based applications across the inference stack. Ganesh holds a Master of Science in electrical engineering from California State University, Long Beach. 

[View all posts by Ganesh Kudleppanavar](https://developer.nvidia.com/blog/author/ganeshku/)

## Comments

### Start the discussion at [forums.developer.nvidia.com](https://forums.developer.nvidia.com/t/modelexpress-distributing-model-artifacts-at-the-speed-of-light/378074)

## Related posts

![Image 29](https://developer-blogs.nvidia.com/wp-content/uploads/2026/05/NVIDIA-Dynamo-Snapshot-660x370.jpg)

### NVIDIA Dynamo Snapshot: Fast Startup for Inference Workloads on Kubernetes

[NVIDIA Dynamo Snapshot: Fast Startup for Inference Workloads on Kubernetes](https://developer.nvidia.com/blog/nvidia-dynamo-snapshot-fast-startup-for-inference-workloads-on-kubernetes/)

![Image 31](https://developer-blogs.nvidia.com/wp-content/uploads/2026/02/genai-visual-mixture-of-experts-3105423-e1772062206929-658x370.webp)

### Maximizing GPU Utilization with NVIDIA Run:ai and NVIDIA NIM

[Maximizing GPU Utilization with NVIDIA Run:ai and NVIDIA NIM](https://developer.nvidia.com/blog/maximizing-gpu-utilization-with-nvidia-runai-and-nvidia-nim/)

![Image 33](https://developer-blogs.nvidia.com/wp-content/uploads/2025/09/ai-model-representation-660x370-jpg.webp)

### Reducing Cold Start Latency for LLM Inference with NVIDIA Run:ai Model Streamer

[Reducing Cold Start Latency for LLM Inference with NVIDIA Run:ai Model Streamer](https://developer.nvidia.com/blog/reducing-cold-start-latency-for-llm-inference-with-nvidia-runai-model-streamer/)

![Image 35](https://developer-blogs.nvidia.com/wp-content/uploads/2025/08/GPU-Memory-Swap-660x370-png.webp)

### Cut Model Deployment Costs While Keeping Performance With GPU Memory Swap

[Cut Model Deployment Costs While Keeping Performance With GPU Memory Swap](https://developer.nvidia.com/blog/cut-model-deployment-costs-while-keeping-performance-with-gpu-memory-swap/)

![Image 37: Decorative image of TensorRT workflow on a black background.](https://developer-blogs.nvidia.com/wp-content/uploads/2024/06/tensorrt-featured-660x370.png)

### Maximum Performance and Minimum Footprint for AI Apps with NVIDIA TensorRT Weight-Stripped Engines

[Maximum Performance and Minimum Footprint for AI Apps with NVIDIA TensorRT Weight-Stripped Engines](https://developer.nvidia.com/blog/maximum-performance-and-minimum-footprint-for-ai-apps-with-nvidia-tensorrt-weight-stripped-engines/)

## Related posts

![Image 39: Decorative image.](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/World-Record-660x370.jpg)

### Setting a World Record for MoE Pre-Training on NVIDIA GB300 NVL72

[Setting a World Record for MoE Pre-Training on NVIDIA GB300 NVL72](https://developer.nvidia.com/blog/setting-a-world-record-for-moe-pre-training-on-nvidia-gb300-nvl72/)

![Image 41](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/nvlinkimage1_16x9-660x370.jpeg)

### NVIDIA NVLink: The Scale-Up Network for AI Factories

[NVIDIA NVLink: The Scale-Up Network for AI Factories](https://developer.nvidia.com/blog/nvidia-nvlink-the-scale-up-network-for-ai-factories/)

![Image 43: Decorative image.](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/Bluefield-4-660x370.jpg)

### Scaling Agentic AI Factories Through Extreme Co-Design with NVIDIA BlueField

[Scaling Agentic AI Factories Through Extreme Co-Design with NVIDIA BlueField](https://developer.nvidia.com/blog/scaling-agentic-ai-factories-through-extreme-co-design-with-nvidia-bluefield/)

![Image 45](https://developer-blogs.nvidia.com/wp-content/uploads/2026/04/biomolecule-1-660x370.png)

### A Practical Guide to GPU-Initiated Communication for Molecular Dynamics at Scale

[A Practical Guide to GPU-Initiated Communication for Molecular Dynamics at Scale](https://developer.nvidia.com/blog/a-practical-guide-to-gpu-initiated-communication-for-molecular-dynamics-at-scale/)

![Image 47: An image of a 6G network.](https://developer-blogs.nvidia.com/wp-content/uploads/2026/07/telco-tech-blog-header-ai-native-ran-blog-3840x2160-5427300-660x370.jpg)

### Maximize Spectral Efficiency with AI-Native RAN and NVIDIA AI Aerial

[Maximize Spectral Efficiency with AI-Native RAN and NVIDIA AI Aerial](https://developer.nvidia.com/blog/maximize-spectral-efficiency-with-ai-native-ran-and-nvidia-ai-aerial/)

*   [![Image 48: NVIDIA GTC Berlin 2026](https://developer-blogs.nvidia.com/wp-content/uploads/2026/06/gtc26-berlin-open-reg-mktg-kit-tech-blog-1360x180-1.webp)](https://www.nvidia.com/gtc/)
*   [![Image 49: NVIDIA at SIGGRAPH 2026](https://developer-blogs.nvidia.com/wp-content/uploads/2026/06/Copy-of-siggraph26-email-footer-1360x180-1.webp)](https://www.nvidia.com/en-us/events/siggraph)

Sign up for NVIDIA News

[Subscribe](https://developer.nvidia.com/email-signup)

Follow NVIDIA Developer

[](https://www.facebook.com/NVIDIAAI/ "Facebook")[](https://www.instagram.com/nvidiadeveloper "Instagram")[](https://www.linkedin.com/company/nvidia-ai "LinkedIn")[](https://twitter.com/NVIDIAAIDev "Twitter")[](https://www.youtube.com/user/NVIDIADeveloper "YouTube")

Find more news and tutorials on [NVIDIA Technical Blog](https://developer.nvidia.com/blog)

*   [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/)
*   [Your Privacy Choices](https://www.nvidia.com/en-us/about-nvidia/privacy-center/)
*   [Terms of Use](https://developer.nvidia.com/legal/terms)
*   [Accessibility](https://www.nvidia.com/en-us/about-nvidia/accessibility/)
*   [Corporate Policies](https://www.nvidia.com/en-us/about-nvidia/company-policies/)
*   [Contact](https://developer.nvidia.com/contact)

Copyright © 2026 NVIDIA Corporation 

Close Previous

![Image 51](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/)

![Image 53](https://developer.nvidia.com/blog/modelexpress-distributing-model-artifacts-at-the-speed-of-light/)

Next

*   [L](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [T](https://twitter.com/intent/tweet?text=ModelExpress%3A+Distributing+Model+Artifacts+at+the+Speed+of+Light+%7C+NVIDIA+Technical+Blog+https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [F](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)
*   [R](https://www.reddit.com/submit?url=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F&title=ModelExpress%3A+Distributing+Model+Artifacts+at+the+Speed+of+Light+%7C+NVIDIA+Technical+Blog)
*   [E](mailto:?subject=I'd%20like%20to%20share%20a%20link%20with%20you&body=https%3A%2F%2Fdeveloper.nvidia.com%2Fblog%2Fmodelexpress-distributing-model-artifacts-at-the-speed-of-light%2F)

*      
*   [Join](https://developer.nvidia.com/login)
*   [](https://developer.nvidia.com/login)

*   [Home](https://developer.nvidia.com/ "Home")
*   [Blog](https://developer.nvidia.com/blog "Blog")
*   [Forums](https://forums.developer.nvidia.com/ "Forums")
*   [Docs](https://docs.nvidia.com/ "Docs")
*   [Downloads](https://developer.nvidia.com/downloads "Downloads")
*   [Training](https://www.nvidia.com/en-us/training/ "Training")

NVIDIA uses cookies to improve your experience on our web site. We and our third-party partners also use cookies and other tools to collect and record information you provide as well as information about your interactions with our websites for performance improvement, analytics, and to assist in marketing efforts. By clicking "Accept All", you consent to our use of cookies and other tools as described in our [Cookie Policy](https://www.nvidia.com/en-us/about-nvidia/cookie-policy/). You can manage your cookie settings by clicking on "Manage Settings." By continuing to use this site or by clicking one of the buttons below, you agree to our [Terms of Service](https://www.nvidia.com/en-us/about-nvidia/terms-of-service/) (which contains important waivers). Please see our [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/) for more information on our privacy practices.

We have detected the Global Privacy Control (GPC) signal and recorded your rejection of all optional cookies on this site for this browser. You can manage your cookie settings by clicking on "Manage Settings". Please see our [Cookie Policy](https://www.nvidia.com/en-us/about-nvidia/cookie-policy/) for more information. To opt out of non-cookie personal information "sales" / "sharing" for targeted advertising purposes, please visit the [NVIDIA Preference Center](https://www.nvidia.com/en-us/about-nvidia/privacy-center/). Please see our [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/) for more information on our privacy practices.

We have detected the Global Privacy Control Signal (GPC) and have opted you out of all optional cookies on this browser. You can manage your cookie settings by clicking on "Manage Settings". Please see our [Cookie Policy](https://www.nvidia.com/en-us/about-nvidia/cookie-policy/) for more information. We have also opted you out of "sharing"/"sales" of personal information outside of cookies. You can manage these settings in the NVIDIA [NVIDIA Preference Center](https://www.nvidia.com/en-us/privacy-center/). Please see our [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/) for more information.

We have detected the Global Privacy Control Signal (GPC) and have opted you out of all optional cookies on this browser. You can manage your cookie settings by clicking on "Manage Settings". Please see our [Cookie Policy](https://www.nvidia.com/en-us/about-nvidia/cookie-policy/) for more information. We have also opted you out of "sharing"/"sales" of personal information outside of cookies which overrides at least one of your previous settings. You can manage them in the [NVIDIA Preference Center](https://www.nvidia.com/en-us/privacy-center/). Please see our [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/) for more information.

Manage Settings

Reject Optional Accept All

![Image 55: Company Logo](https://cdn.cookielaw.org/logos/10ddf4ca-c072-45d0-b3ac-eead0ed93db0/6e17f6e4-c77b-4a11-9f34-c107c42e4bfc/7981.png)

Cookie Settings

We and our third-party partners (including social media, advertising, and analytics partners) use cookies and other tracking technologies to collect, store, monitor, and process certain information about you when you visit our website. The information collected might relate to you, your preferences, or your device. We use that information to make the site work, analyze performance and traffic on our website, provide a more personalized web experience, and assist in our marketing efforts.

Under certain privacy laws, you have the right to direct us not to "sell" or "share" your personal information for targeted advertising. To opt-out of the "sale" and "sharing" of personal information through cookies, you must opt-out of optional cookies using the toggles below. To opt out of the "sale" and "sharing" of data collected by other means (e.g., online forms) you must also update your data sharing preferences through the [NVIDIA Preference Center](https://www.nvidia.com/en-us/about-nvidia/privacy-center/).

Click on the different category headings below to find out more and change the settings according to your preference. You cannot opt out of Required Cookies as they are deployed to ensure the proper functioning of our website (such as prompting the cookie banner and remembering your settings, etc.). By clicking "Save and Accept" or "Decline All" at the bottom, you consent to the use of cookies and other tools as described in our [Cookie Policy](https://www.nvidia.com/en-us/about-nvidia/cookie-policy/) in accordance with your settings and accept our [Terms of Service](https://www.nvidia.com/en-us/about-nvidia/terms-of-service/) (which contains important waivers). For more information about our privacy practices, please see our [Privacy Policy](https://www.nvidia.com/en-us/about-nvidia/privacy-policy/).

Required Cookies

Always Active

These cookies enable core functionality such as security, network management, and accessibility. These cookies are required for the site to function and cannot be turned off.

Cookies Details

Performance Cookies

- [x] Performance Cookies 

These cookies are used to provide quantitative measures of our website visitors, such as the number of times you visit, time on page, your mouse movements, scrolling, clicks and keystroke activity on the websites; other browsing, search, or product research behavior; and what brought you to our site. These cookies may store a unique ID so that our system will remember you when you return. Information collected with these cookies is used to measure and find ways to improve website performance.

Cookies Details

Personalization Cookies

- [x] Personalization Cookies 

These cookies collect data about how you have interacted with our website to help us improve your web experience, such as which pages you have visited. These cookies may store a unique ID so that our system will remember you when you return. They may be set by us or by third party providers whose services we have added to our pages. These cookies enable us to provide enhanced website functionality and personalization as well as make the marketing messages we send to you more relevant to your interests. If you do not allow these cookies, then some or all of these services may not function properly.

Cookies Details

Advertising Cookies

- [x] Advertising Cookies 

These cookies record your visit to our websites, the pages you have visited and the links you have followed to influence the advertisements that you see on other websites. These cookies and the information they collect may be managed by other companies, including our advertising partners, and may be used to build a profile of your interests and show you relevant advertising on other sites. We and our advertising partners will use this information to make our websites and the advertising displayed on it, more relevant to your interests.

Cookies Details

Cookie List

Clear
*   - [x] checkbox label label 

Apply Cancel

Consent Leg.Interest

- [x] checkbox label label

- [x] checkbox label label

- [x] checkbox label label

Decline All Save and Accept

[![Image 56: Powered by Onetrust](https://cdn.cookielaw.org/logos/static/powered_by_logo.svg)](https://www.onetrust.com/solutions/consent-and-preferences/)
