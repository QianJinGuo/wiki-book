# PyTorch 2.12 Release Blog

## Ch01.184 PyTorch 2.12 Release Blog

> 📊 Level ⭐⭐ | 27.0KB | `entities/pytorch-2-12-release.md`

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
Workloads which previously took minutes (because PyTorch was inefficiently dispatching each matrix solve individually) now run in seconds by using cuSolver's syevj_batched kernel, which is designed to process many small/medium matrices as a single GPU operation. These gains are especially relevant for scientific computing and machine learning workloads that rely on eigendecompositions of batched matrices. ([example usage in the doc](https://docs.pytorch.org/docs/2.11/generated/torch.linalg.eigh.html))
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
Control flow regions using torch.cond can now be captured and replayed as part of CUDA Graphs. Previously, data-dependent control flow forced fallback to CUDA graph trees because branching was evaluated on the CPU. By leveraging CUDA 12.4's conditional IF nodes, torch.cond branches are now evaluated entirely on the GPU within a single graph capture.
This was contributed by Daniel Galvez and Ting-Yang Kuei (NVIDIA) (PR #168912), with Inductor ordering support added by Paul Zhang (Meta) (PR #179457). This currently works with the eager and cudagraphs backends; Inductor support is planned for a future release.
**FMA-based addcdiv lowering for XPU**
Inductor now uses fused multiply-add (FMA) instructions for addcdiv operations, achieving bitwise numerical parity with eager CUDA execution while preserving Triton kernel fusion benefits.
`addcdiv` is a fused arithmetic operation (`result = input + value × (tensor1 / tensor2)`)that sits at the heart of many optimizer update rules, including Adam, AdamW, and RMSprop. Previously, Inductor's lowering used separate multiply and divide instructions, introducing small floating-point rounding differences compared to eager mode. These differences accumulate over thousands of training steps, making it difficult to validate that compiled models produce numerically identical results.
This was first implemented for CUDA by Michael Lazos (Meta) (PR #174912), then extended to XPU by Guangye Yu (Intel) (PR #176163), fixing several numerical correctness issues on Intel GPUs. Anyone using `torch.compile` with optimizer-heavy training loops now gets compiled performance without sacrificing numerical reproducibility — on both NVIDIA and Intel hardware.

### **Distributed Training**
**ProcessGroup support in custom ops**
Custom operators can now accept ProcessGroup objects directly as arguments rather than requiring callers to convert them to string group names and looking them up in a global registry. All c10d functional collective ops (all_reduce, reduce_scatter, etc) have been updated to accept both ProcessGroup objects directly and the string names. Contributed by Aaron Orenstein (Meta) (PR #172795).
**Multi-GPU/multi-node profiling improvements**
PyTorch Profiler Events API now exposes flow IDs, flow types, activity types, unfinished events, and Python function events — bringing events() to parity with the Chrome trace JSON output and enabling richer programmatic post-hoc analysis. In addition it is now possible to correlate NCCL collective traces across ranks using a new seq_num field – all ranks participating in the same collective share the same sequence number within a process group. Together these changes significantly improve the tooling for debugging distributed training performance across multiple GPUs and nodes. API enrichment by Ryan Zhang (Meta) (PR #177888) and NCCL seq_num added by Marvin Dsouza (Meta) (PR #177148).
**FlightRecorder: ncclx + gloo Backends**
FlightRecorder's trace analyzer now supports ncclx and gloo backends alongside the existing nccl and xccl backends, enabling distributed communication tracing across a broader set of collective backends. Additionally, FlightRecorder now recognizes torchcomms operations (e.g., all_gather_single, reduce_scatter_v, barrier) that were previously untracked. A race condition that could cause an infinite loop when multiple process groups concurrently accessed the FlightRecorder singleton was also fixed in this cycle. Backend allowlist added by Lily Janjigian (Meta) (PR #180268), with torchcomms operation support by Tushar Jain (PR #178359).

## **Platform Related Updates**
### **CUDA**
**CUDA Graph kernel annotations**
`torch.cuda.graph` now accepts an enable_annotations kwarg that injects annotation metadata (e.g., collective op names, process groups, message sizes) into individual kernels within captured CUDA graphs. After post-processing tracer with a companion post-processing script (python -m torch.cuda._annotate_cuda_graph_trace)annotations are merged into traces. These annotations appear in Perfetto/Chrome profiler traces, making it significantly easier to understand what each kernel in a replayed graph is doing. Contributed by Shangdi Yu (Meta) (PR #179768).
**CUDA Green Context workqueue limit**
CUDA Green Contexts now support specifying a workqueue limit, giving finer-grained control over GPU resource partitioning. This experimental feature allows users to constrain the number of concurrent work submissions within a green context, enabling more predictable resource sharing across concurrent workloads. Contributed by Matthias Jouanneaux (NVIDIA) (PR #177242).

### **ROCm**
**ROCm: Expandable segments**
AMD GPUs (ROCm >= 7.02) now support expandable memory segments in PyTorch's caching allocator, matching the CUDA feature that reduces memory fragmentation by dynamically growing allocations via virtual memory APIs. Added by Prachi Gupta (AMD) (PR #173330)
**ROCm: rocSHMEM support**
rocSHMEM support enables symmetric memory collective operations (torch.ops.symm_mem.*) on AMD GPUs, porting the NVSHMEM-based on-GPU communication primitives — including point-to-point, broadcast, all-to-all, and MoE-oriented 2D AllToAllv — to ROCm. The rocSHMEM implementation uses a dedicated compilation unit to handle API and warp-size differences between NVSHMEM and rocSHMEM. Contributed by Prachi Gupta (PR #173518).
**ROCm: hipSPARSELt and FP8 semi-structured sparsity**
hipSPARSELt is now enabled by default in PyTorch builds on ROCm >= 7.12, bringing semi-structured (2:4) sparsity support to AMD GPUs. FP8 (float8_e4m3fn) inputs are also now supported through hipSPARSELt on MI350X (gfx950), with FP32 output. This enables the same torch._cslt_sparse_mm sparsity acceleration path that was previously CUDA-only. hipSPARSELt enabled by rraminen (AMD) (PR #170852), with FP8 semi-structured sparsity added by Benji Beck (Meta) (PR #179310).
**ROCm: Inductor FlexAttention pipelining**
FlexAttention on AMD GPUs now uses two-stage pipelining in the Triton backend, delivering 5-26% speedups across a range of attention patterns (causal, alibi, sliding window) and shapes on MI350X. This was a one-line configuration change (num_stages=1 to 2) that unlocks more efficient memory-compute overlap. Contributed by nithinsubbiah (PR #176676).

### **Apple MPS**
**MPS: Metal-4 offline shader compilation**
Apple Silicon binary wheels now ship with ahead-of-time-compiled Metal-4 shaders, built on macOS 26 with the metal-4 standard. This eliminates the runtime shader compilation overhead on first run, reducing startup latency for MPS workloads. A companion API (`torch._C._mps_loadMetalllib`) was also added for loading pre-compiled .metallib blobs directly, supporting the Triton Apple MPS backend's compile-time metallib workflow. Contributed by Isalia20 (Irakli Salia) (PR #179378).

## **Deprecations and Breaking Changes**
#### **Distributed: Planned Breaking Changes for torchcomms**
We've been working hard on integrating torchcomms directly into PyTorch Distributed so everyone can get the benefits out of the box. In an upcoming release (2.13+) we're planning on using torchcomms by default, which includes some breaking changes to how ProcessGroups operate. We aim to make these changes work automatically for most models and fix any incompatibilities in the ecosystem, but nevertheless, some models will be impacted.
We're still polishing torchcomms but you can use it right now and get access to the new APIs, fault tolerance, window, scalability, and debuggability features. To get started, `pip install torchcomms` and set `TORCH_DISTRIBUTED_USE_TORCHCOMMS=1`.
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

## 深度分析
**1. 硬件无关性（Hardware-Agnostic）战略的系统性推进**
PyTorch 2.12最核心的主题是"硬件无关性"战略的系统性落地：`torch.accelerator.Graph`统一了跨后端（CUDA/XPU/out-of-tree）的图捕获和重放API，`torch.export`支持的MX量化格式对ARM/AMD/Apple等异构硬件有重大意义，Inductor的FMA优化从CUDA扩展到XPU。这条演进路径从2.10（跨后端性能原语）到2.11（分布式可微集合通信）再到2.12，清晰地描绘了PyTorch从" NVIDIA的深度学习框架"向"跨硬件统一平台"的战略转型。这一转型的驱动力是AI计算从单一的GPU集群向CPU+GPU+专用加速器（XPU/TPU/Apple Silicon/NPU）的异构化演进——PyTorch必须跟上硬件多样化的趋势，否则将被边缘化。
**2. 100x加速的启示：底层计算库的路径依赖问题**
Batched `linalg.eigh`从MAGMA后端迁移到cuSolver后端带来100x加速——这个数字背后揭示了一个深刻的技术债问题：PyTorch的高级API（`torch.linalg.eigh`）在底层调度了不同时代的计算库（MAGMA是早期的CPU/GPU混合线性代数库），而这些库的调度策略可能早已过时。这个案例提示：在深度学习框架中，算子层对底层数学库的选择和调度策略需要持续审视；来自科学计算领域的成熟库（如MAGMA）未必是为深度学习 workloads 优化的。对于框架开发者，这意味着定期基准测试和后端调度策略更新应当成为常规维护工作，而非一次性决策。
**3. Microscaling量化支持：LLM部署的关键拼图**
MX量化格式（MXFP4/MXFP6/MXFP8）是LLM推理量化的重要方向，它通过共享块级缩放因子（`float8_e8m0fnu` dtype）实现比per-token或per-channel量化更激进的压缩。在2.12之前，`torch.export`无法处理这种dtype，导致使用MX量化的模型无法通过标准PyTorch流程导出部署。这对于edge AI和成本敏感的推理场景是关键的堵点。ARM贡献的这个PR（#176270）补上了这个缺口，意味着PyTorch生态的模型导出工具链对现代量化格式的覆盖已经基本完整。
**4. torch.cond进入CUDA Graph：编译优化的一件式和破坏式的权衡**
torch.cond控制流终于可以在CUDA Graph中捕获——这是CUDA Graph能力的重大扩展。CUDA Graph通过减少CPU-GPU同步开销提升性能，但此前无法处理数据依赖的控制流（必须降级到图树）。利用CUDA 12.4的条件IF节点实现GPU端分支判断，解决了这个限制。值得注意的限制：目前仅支持eager和cudagraphs后端，Inductor支持在未来的release中计划。这个功能说明PyTorch正在逐步将"编译优化"和"运行时灵活性"之间的边界向外推——通过利用硬件新能力（如CUDA 12.4的条件IF）而非牺牲灵活性来实现性能提升。
**5. torchcomms整合：分布式训练通信层的架构重构**
PyTorch 2.12为torchcomms集成做了铺垫——计划在2.13+将torchcomms设为默认，废弃现有的c10d后端。这是分布式训练通信层的重大架构重构：torchcomms提供更现代的API、容错能力、窗口机制和可扩展性。关键变化包括：ProcessGroup必须eager初始化、P2P操作不再保证并发运行、torchcomms将成为必需依赖包。这个变化的幅度意味着一些现有模型将需要适配，但对于整个分布式训练生态而言，从长期技术债（如Gloo后端的设计局限）中解脱出来的价值远大于短期迁移成本。
**6. ROCm生态的追赶：从"可用"到"好用"的跨越**
2.12对ROCm的支持做了实质性增强：expandable memory segments（对标CUDA的VMM）、rocSHMEM（NVSHMEM的AMD移植版）、hipSPARSELt+FP8半结构化稀疏、FlexAttention两阶段流水线。这些改进不是简单的"移植"，而是针对AMD GPU架构特性的深度优化（如warp size差异的处理）。加上Intel XPU后端的支持，PyTorch正在从"NVIDIA的框架"转变为"AMD+NVIDIA+Intel+Apple的统一平台"。对于多硬件部署的团队，这是重要的生态利好。

## 实践启示
**1. 升级评估清单：torchcomms和CUDA 12.8的影响**
计划升级到PyTorch 2.12的团队应当立即评估两个潜在的破坏性变化：第一，torchcomms的引入将改变ProcessGroup的工作方式，使用自定义ProcessGroup或依赖Gloo/ncclx后端的分布式代码需要提前适配，建议设置`TORCH_DISTRIBUTED_USE_TORCHCOMMS=1`在测试环境中运行；第二，CUDA 12.8 wheel已废弃，运行在旧GPU架构（Pascal/Volta）上的系统需要切换到CUDA 12.6 wheel。升级前应在类似生产环境配置中做完整的回归测试，特别是涉及torch.compile的数值正确性验证。
**2. 分布式训练性能调试的新工具**
2.12的FlightRecorder现在支持ncclx和gloo后端，加上新增的seq_num字段（用于跨rank关联NCCL集合操作），这使得分布式训练调试能力大幅提升。实践建议：使用PyTorch Profiler的事件API（events()方法）进行编程式事后分析，比Chrome trace更灵活；利用新的seq_num字段关联多个GPU上的同一集合操作，快速定位通信瓶颈。FlightRecorder的race condition修复（多ProcessGroup并发访问时的无限循环）意味着之前依赖FlightRecorder做分布式调试的团队可以更放心地使用多后端配置。
**3. torch.compile数值正确性验证的更新检查清单**
Inductor的addcdiv降低从分离的乘除指令改为FMA指令——这个变化解决了数千步训练后数值漂移的问题。对于使用`torch.compile`+Adam/AdamW/RMSprop等optimizer-heavy训练循环的团队，这是重要的正确性改进。实践建议：在2.12上重新运行原有的数值正确性验证测试（如果之前因数值差异而跳过）；对于科学计算场景使用`torch.linalg.eigh`（特别是batch模式）的团队，cuSolver后端切换可能带来不同的数值行为，建议重新验证。
**4. Apple Silicon ML工作流的改进**
Metal-4离线着色器编译消除了首次运行的着色器编译开销——对于MPS（Metal Performance Shaders）后端用户，这意味着MPS工作负载的启动延迟大幅降低。实践建议：Apple Silicon用户应当尽快升级到2.12以获得改善的启动性能；如果正在使用Triton Apple MPS后端，新加入的`torch._C._mps_loadMetalllib` API允许直接加载预编译的.metallib文件，这对于需要确定性编译时间的CI/CD流程特别有价值。
**5. 框架选型的长期趋势考量**
PyTorch 2.x系列的演进方向（硬件无关性、编译优化、生产就绪）提示了一个框架选型的重要考量：继续使用TorchScript（已废弃）还是迁移到torch.export/EXIR？答案是明确的——TorchScript的废弃已经不是"警告"而是"进行时"，新项目应直接使用torch.export，已有项目应制定迁移路径。这不仅是PyTorch内部的技术演进，也是整个行业从"研究优先"向"研究+生产并重"转变的体现——选择框架时其生产生态的成熟度应当与技术先进性放在同等重要的位置。
**6. 异构硬件训练的框架能力对齐**
对于同时使用NVIDIA和AMD GPU的团队（如超算环境），2.12的ROCm改进使得AMD的FlexAttention流水线、稀疏计算和内存管理能力与NVIDIA侧的对应能力差距显著缩小。实践建议：不要假设两个平台的能力完全对等，继续为不同硬件维护不同的代码路径，但可以利用2.12新的`torch.accelerator.Graph`统一API逐步收敛代码——为新硬件支持使用统一的`torch.accelerator.Graph`接口，保留后端特定实现但统一对外API。
## 相关实体
- [Pytorch 2 12 Release Blog](ch01/186-pytorch-2-12-release-blog.md)
- [Pytorch212Releaseblogpytorch](https://github.com/QianJinGuo/wiki/blob/main/entities/pytorch212releaseblogpytorch.md)
- [Pytorch212Releaseblogpytorch](https://github.com/QianJinGuo/wiki/blob/main/entities/pytorch212releaseblogpytorch.md)
- [Llm From Scratch 7 Stage Pytorch Tutorial](ch01/890-llm.md)
- [Deepseek V4 Triton Fp4 Optimization](ch01/528-deepseek-v4.md)

---

