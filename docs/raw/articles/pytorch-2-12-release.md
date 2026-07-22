---
title: "PyTorch 2.12 Release Blog"
source: newsletter
source_url: https://pytorch.org/blog/pytorch-2-12-release-blog
tags: [pytorch, deep-learning]
url: https://pytorch.org/blog/pytorch-2-12-release-blog
created: 2026-05-14
updated: 2026-05-14
sha256: 404e4729a3defe545f5e4c9b5940481c71f7ee715be1a36329b58568589d94f3
---
# PyTorch 2.12 Release Blog
Markdown Content:
### Featured projects
*   [![Image 1: PyTorch logo](https://pytorch.org/wp-content/uploads/2026/05/PyTorch-Logo-2022_RGB_PyTorchLogo_Horiz_fullColor_RGB2-300x84.png)](https://pytorch.org/projects/pytorch/ "PyTorch")
We are excited to announce the release of PyTorch® 2.12 ([release notes](https://github.com/pytorch/pytorch/releases/tag/v2.12.0))!
The PyTorch 2.12 release features the following changes:
*   Batched `linalg.eigh` on CUDA is up to 100x faster due to updated cuSolver backend selection
*   New `torch.accelerator.Graph` API unifies graph capture and replay across CUDA, XPU, and out-of-tree backends
*   `torch.export.save` now supports Microscaling (MX) quantization formats, enabling full export of aggressively compressed models
*   Adagrad now supports `fused=True`, joining Adam, AdamW, and SGD with a single-kernel optimizer implementation
*   `torch.cond` control flow can now be captured and replayed inside CUDA Graphs
*   ROCm users gain expandable memory segments, rocSHMEM symmetric memory collectives, and FlexAttention pipelining
This release is composed of 2,926 commits from 457 contributors since PyTorch 2.11. We want to sincerely thank our dedicated community for your contributions. As always, we encourage you to try these out and report any issues as we improve 2.12. More information about how to get started with the PyTorch 2-series can be found at our [Getting Started](https://pytorch.org/get-started/pytorch-2-x/) page.
Have questions? Join us on Wednesday, May 20 at 10 am PST for a live Q&A with panelists Joe Spisak, Andrey Talman, and Alban Desmaison, and moderator Chris Gottbrath. We will provide a brief overview of the release and answer your questions live.[Register now.](https://pytorch.org/event/pytorch-2-12-release-live-qa/)
Throughout the 2.x series, PyTorch has been evolving from a research-first framework into a unified, hardware-agnostic platform for production training and inference at scale. [PyTorch 2.10](https://pytorch.org/blog/pytorch-2-10-release-blog/)laid the groundwork with cross-backend performance primitives and the formal deprecation of TorchScript. [PyTorch 2.11](https://pytorch.org/blog/pytorch-2-11-release-blog/) expanded that foundation with differentiable collectives for distributed training, FlashAttention-4 on next-generation GPUs, and broader export coverage.
PyTorch 2.12 continues this direction: a new device-agnostic torch.accelerator.Graph API unifies graph capture and replay across CUDA, XPU, and out-of-tree backends; batched eigenvalue decomposition is up to 100x faster; and torch.export now supports Microscaling quantization formats for deploying aggressively compressed models. Across these releases, PyTorch is becoming faster across backends and usable in a wider variety of platforms as it continues to enable AI innovation.
### **Performance Features**
**Up to 100x faster batched eigendecomposition on CUDA (`linalg.eigh`)**
The backend selection for linalg.eigh on CUDA has been overhauled. The legacy MAGMA backend was deprecated in favor of cuSolver (PR #174619 by Grayson Derossi), and the cuSolver dispatch heuristics were updated to use syevj_batched unconditionally (PR #175403 by Johannes Z). For batched symmetric/Hermitian eigenvalue problems, this yields up to 100x speedups over the previous release, resolving longstanding performance gaps with CuPy. 
Workloads which previously took minutes (because PyTorch was inefficiently dispatching each matrix solve individually) now run in seconds by using cuSolver’s syevj_batched kernel, which is designed to process many small/medium matrices as a single GPU operation. These gains are especially relevant for scientific computing and machine learning workloads that rely on eigendecompositions of batched matrices. ([example usage in the doc](https://docs.pytorch.org/docs/2.11/generated/torch.linalg.eigh.html))
**Fused Adagrad optimizer**
The Adagrad optimizer now supports fused=True, performing the entire optimizer step in a single CUDA kernel rather than launching separate kernels for each operation. This reduces kernel launch overhead and memory traffic. Adagrad joins Adam, AdamW, and SGD in offering a fused variant. The underlying CUDA kernel was contributed by @MeetThePatel in the 2.11 cycle (PR #159008), with the Python frontend exposing it to users finalized by Jane Xu in 2.12 (PR #177672).
### **Compilation and export across hardware**
**`torch.accelerator.Graph`: Device Agnostic Accelerator Graph Capture and Stream API**
`torch.accelerator.Graph` is a new device-agnostic API for graph capture and replay, providing a unified abstraction over backend-specific implementations such as `torch.xpu.XPUGraph`. Each backend can register its own implementation through a lightweight GraphImplInterface, preserving backend autonomy while enabling a consistent user-facing API. 
Alongside this, `c10::Stream` and `torch. Stream` now exposes an `is_capturing()` method, replacing the device-specific `is_current_stream_capturing` with a backend-agnostic alternative. Stream context manager reentrance was also fixed. Together, these changes bring cross-backend parity to stream and graph management, with initial support for the XPU backend and extensibility to out-of-tree backends via `PrivateUse1`. 
Contributed by Guangye Yu (Intel) across six PRs, anchored by the C++  interface (PR #171269) and Python frontend (PR #171285). ([usage example in docstring](https://github.com/pytorch/pytorch/blob/1d803512199040e98738e95d0dc074acbde9fb5c/torch/accelerator/graphs.py#L11-L48))
**`torch.export` now supports Microscaling (MX) quantization formats**
As models move from research to production, `torch.export` is the standard path for serializing PyTorch models for deployment. However, models using Microscaling (MX) quantization — an increasingly popular technique for reducing model size and inference cost — could not previously be exported because `torch.export.save` did not handle the `float8_e8m0fnu` dtype used as the shared block-scale exponent in MX formats (MXFP4, MXFP6, MXFP8).
In PyTorch 2.12, `torch.export.save` and `torch.export.load` now correctly serialize and deserialize tensors with this dtype, unblocking the full export-to-deployment workflow for models leveraging Microscaling quantization. This is particularly relevant for teams deploying large language models to cost-constrained or edge environments where aggressive quantization is essential. Contributed by Chizkiyahu Raful (ARM) (PR #176270).
**Capture Control flow with torch.cond within CUDA Graph**
Control-flow regions using torch.cond can now be captured and replayed as part of CUDA Graphs. Previously, data-dependent control flow forced fallback to CUDA graph trees because branching was evaluated on the CPU. By leveraging CUDA 12.4’s conditional IF nodes, torch.cond branches are now evaluated entirely on the GPU within a single graph capture. 
This was contributed by Daniel Galvez and Ting-Yang Kuei (NVIDIA) (PR #168912), with Inductor ordering support added by Paul Zhang (Meta) (PR #179457). This currently works with the eager and cudagraphs backends; Inductor support is planned for a future release.
**FMA-based addcdiv lowering for XPU**
Inductor now uses fused multiply-add (FMA) instructions for addcdiv operations, achieving bitwise numerical parity with eager CUDA execution while preserving Triton kernel fusion benefits.
`addcdiv` is a fused arithmetic operation (`result = input + value × (tensor1 / tensor2)`)that sits at the heart of many optimizer update rules, including Adam, AdamW, and RMSprop. Previously, Inductor’s lowering used separate multiply and divide instructions, introducing small floating-point rounding differences compared to eager mode. These differences accumulate over thousands of training steps, making it difficult to validate that compiled models produce numerically identical results.
This was first implemented for CUDA by Michael Lazos (Meta) (PR #174912), then extended to XPU by Guangye Yu (Intel) (PR #176163), fixing several numerical correctness issues on Intel GPUs. Anyone using `torch.compile` with optimizer-heavy training loops now gets compiled performance without sacrificing numerical reproducibility — on both NVIDIA and Intel hardware.
### **Distributed Training**
**ProcessGroup support in custom ops**
Custom operators can now accept ProcessGroup objects directly as arguments rather than requiring callers to convert them to string group names and looking them up in a global registry. All c10d functional collective ops (all_reduce, reduce_scatter, etc) have been updated to accept both ProcessGroup objects directly and the string names. Contributed by Aaron Orenstein (Meta) (PR #172795).
**Multi-GPU/multi-node profiling improvements**
PyTorch Profiler Events API now exposes flow IDs, flow types, activity types, unfinished events, and Python function events — bringing events() to parity with the Chrome trace JSON output and enabling richer programmatic post-hoc analysis. In addition it is now possible to correlate NCCL collective traces across ranks using a new seq_num field – all ranks participating in the same collective share the same sequence number within a process group. Together these changes significantly improve the tooling for debugging distributed training performance across multiple GPUs and nodes. API enrichment by Ryan Zhang (Meta) (PR #177888) and NCCL seq_num added by Marvin Dsouza (Meta) (PR #177148).
**FlightRecorder: ncclx + gloo Backends**
FlightRecorder’s trace analyzer now supports ncclx and gloo backends alongside the existing nccl and xccl backends, enabling distributed communication tracing across a broader set of collective backends. Additionally, FlightRecorder now recognizes torchcomms operations (e.g., all_gather_single, reduce_scatter_v, barrier) that were previously untracked. A race condition that could cause an infinite loop when multiple process groups concurrently accessed the FlightRecorder singleton was also fixed in this cycle. Backend allowlist added by Lily Janjigian (Meta) (PR #180268), with torchcomms operation support by Tushar Jain (PR #178359).
## **Platform Related Updates**
### **CUDA**
**CUDA Graph kernel annotations**
`torch.cuda.graph` now accepts an enable_annotations kwarg that injects annotation metadata (e.g., collective op names, process groups, message sizes) into individual kernels within captured CUDA graphs. After post-processing tracer with a companion post-processing script (python -m torch.cuda._annotate_cuda_graph_trace)annotations are merged into traces. These annotations appear in Perfetto/Chrome profiler traces, making it significantly easier to understand what each kernel in a replayed graph is doing. Contributed by Shangdi Yu (Meta) (PR #179768).
**CUDA Green Context workqueue limit**
CUDA Green Contexts now support specifying a workqueue limit, giving finer-grained control over GPU resource partitioning. This experimental feature allows users to constrain the number of concurrent work submissions within a green context, enabling more predictable resource sharing across concurrent workloads. Contributed by Matthias Jouanneaux (NVIDIA) (PR #177242).
### **ROCm**
**ROCm: Expandable segments**
AMD GPUs (ROCm >= 7.02) now support expandable memory segments in PyTorch’s caching allocator, matching the CUDA feature that reduces memory fragmentation by dynamically growing allocations via virtual memory APIs. Added by Prachi Gupta (AMD) (PR #173330)
**ROCm: rocSHMEM support**
rocSHMEM support enables symmetric memory collective operations (torch.ops.symm_mem.*) on AMD GPUs, porting the NVSHMEM-based on-GPU communication primitives — including point-to-point, broadcast, all-to-all, and MoE-oriented 2D AllToAllv — to ROCm. The rocSHMEM implementation uses a dedicated compilation unit to handle API and warp-size differences between NVSHMEM and rocSHMEM. Contributed by Prachi Gupta (PR #173518).
**ROCm: hipSPARSELt and FP8 semi-structured sparsity**
hipSPARSELt is now enabled by default in PyTorch builds on ROCm >= 7.12, bringing semi-structured (2:4) sparsity support to AMD GPUs. FP8 (float8_e4m3fn) inputs are also now supported through hipSPARSELt on MI350X (gfx950), with FP32 output. This enables the same torch._cslt_sparse_mm sparsity acceleration path that was previously CUDA-only. hipSPARSELt enabled by rraminen (AMD) (PR #170852), with FP8 semi-structured sparsity added by Benji Beck (Meta) (PR #179310).
**ROCm: Inductor FlexAttention pipelining**
FlexAttention on AMD GPUs now uses two-stage pipelining in the Triton backend, delivering 5-26% speedups across a range of attention patterns (causal, alibi, sliding window) and shapes on MI350X. This was a one-line configuration change (num_stages=1 to 2) that unlocks more efficient memory-compute overlap. Contributed by nithinsubbiah (PR #176676).
### **Apple MPS**
**MPS: Metal-4 offline shader compilation**
Apple Silicon binary wheels now ship with ahead-of-time-compiled Metal-4 shaders, built on macOS 26 with the metal-4 standard. This eliminates the runtime shader compilation overhead on first run, reducing startup latency for MPS workloads. A companion API (`torch._C._mps_loadMetalllib`) was also added for loading pre-compiled .metallib blobs directly, supporting the Triton Apple MPS backend’s compile-time metallib workflow. Contributed by Isalia20 (Irakli Salia) (PR #179378).
## **Deprecations and Breaking Changes**
#### **Distributed: Planned Breaking Changes for torchcomms**
We’ve been working hard on integrating torchcomms directly into PyTorch Distributed so everyone can get the benefits out of the box. In an upcoming release (2.13+) we’re planning on using torchcomms by default, which includes some breaking changes to how ProcessGroups operate. We aim to make these changes work automatically for most models and fix any incompatibilities in the ecosystem, but nevertheless, some models will be impacted.
We’re still polishing torchcomms but you can use it right now and get access to the new APIs, fault tolerance, window, scalability, and debuggability features. To get started, `pip install torchcomms` and set `TORCH_DISTRIBUTED_USE_TORCHCOMMS=1`.
See [https://github.com/meta-pytorch/torchcomms](https://github.com/meta-pytorch/torchcomms) for more details.
Key changes:
*   Eager Initialization: We will require all ProcessGroup/communicators to be eagerly initialized during dist.init_process_group and only support a single backend device. This means that the device will have to be specified during initialization.
*   P2P operations: We aim to make each ProcessGroup/communicator match 1:1 with the underlying communicator. This means that P2P operations issued on the same group/stream will not be guaranteed to run concurrently. Concurrent P2P operations will be required to use the batch APIs or a separate group/communicator.
*   torchcomms dependency: We plan to make torchcomms a required package for PyTorch Distributed and deprecate the existing c10d::Backends in favor of a single, more modern communication definition.
The torchcomms integration is being led by the PyTorch Distributed team, with groundwork in 2.12, including backend wrapper refactoring by Yifan Mao (PR #177157) and FlightRecorder integration by Tushar Jain (PR #175270).
**Torchscript is now Deprecated**
Torchscript was deprecated in 2.10 and[torch.export](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/export.html) should be used to replace the jit trace and script APIs, and [Executorch](https://docs.pytorch.org/executorch/stable/index.html) should be used to replace the embedded runtime. For more details, see[this talk](https://youtu.be/X2YbbDmCsOI?si=8s6Ue3BKIa_FYUne&t=903)from PTC.
**Deprecation of the CUDA 12.8 Wheel**
Starting with PyTorch 2.12, the CUDA 12.8 binary wheel is deprecated and will no longer be published as part of the standard release matrix. The default wheel remains CUDA 13.0 (via `pip install torch` from PyPI), and CUDA 13.2 has been added as an experimental build.
Users running on older architectures (e.g., Pascal, Volta) should switch to the CUDA 12.6 wheel, which remains supported in this release. Users running on newer GPUs (e.g., Blackwell) should use the CUDA 13.0+ wheels; note that this requires an NVIDIA driver upgrade to 580.65.06 (Linux) or 580.88 (Windows).