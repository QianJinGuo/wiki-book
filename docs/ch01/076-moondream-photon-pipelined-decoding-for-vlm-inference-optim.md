# Moondream Photon: Pipelined Decoding for VLM Inference Optimization

> 📊 Level ⭐⭐ | 12.0KB

Moondream 的 Photon 推理引擎通过 **pipelined decoding** 技术消除 GPU bubble（GPU 空转），在 NVIDIA B200 上实现 VLM 推理约 33ms 延迟，decode 吞吐提升高达 35%。这项技术的核心洞察是：当 GPU 等待 CPU 完成 token 提交/规划/启动工作（housekeeping）时，GPU 处于空闲状态，这就是 GPU bubble。Photon 通过重叠 CPU 和 GPU 工作来消除这个气泡。

## GPU Bubble 的根因

在典型的 autoregressive decode 循环中：GPU 执行大量数学运算产生下一个 token，但 CPU 也要做不少管理工作——选择下一个请求、设置 GPU 所需的元数据、从模型输出中选择实际 token 并记录等。问题是单个 token 的 GPU 工作量很小，而 CPU 的 housekeeping 是每次循环的固定开销。如果 GPU 必须等待 CPU 完成这些工作才能开始下一个 token，GPU 就会在每个循环中部分空闲。

## 三个核心机制

### 1. Ping-Pong Slots（双缓冲槽）

Photon 维护两个 decode slot，交替使用。当 GPU 在 slot A 上执行当前 forward 时，CPU 在处理 slot B 的上一步结果。每个 slot 包含输入暂存区、模型输出区（logits）、采样 token 落地区、以及 KV cache 书签。这些缓冲区在启动时一次性分配，运行时不做 GPU 内存分配以避免设备同步。固定缓冲区地址也允许将 decode 步骤捕获为 CUDA graph 重放，减少 kernel launch 开销。

关键设计：两个 slot 共享同一个 compute stream（非 GPU 并行），但 device-to-host copy 使用独立的 copy stream，使得 GPU 可以忙于下一个 forward 的同时完成上一步结果的回传。

### 2. Forward Now, Sample Later（先算后采）

下一个 forward 不依赖 CPU 对上一个 token 的处理，但采样（sampling）却依赖——特别是 constrained decoding 场景下（Moondream 的空间能力返回结构化输出：point 返回坐标、detect 返回框、segment 返回轮廓），step t+1 的 sampling mask 取决于 step t 采出的 token。

调度 tick 分三个阶段：
1. **Launch**：立即启动 t+1 的 forward（不依赖 mask，立即执行）
2. **Commit**：等待 step t 的 in-flight copy 完成，推进 decode 状态
3. **Finalize**：当前状态确定后，构建 mask 并采样 t+1

这种 "commit-before-finalize" 顺序意味着 GPU 在 commit 阶段已经在运行 t+1 forward，commit 从关键路径消失。

### 3. Zombies（僵尸序列）

当序列在 step t 遇到 stop token 但已经编入 step t+1 的 batch 时——你不能取消已启动的 GPU 工作。Photon 通过两个 per-sequence 字段处理：`finalized`（触发 EOS 后设为 true）和 `inflight_refs`（仍在引用该序列的 in-flight 步骤数）。已 finalize 的序列不会被立即拆除，而是无害地随车同行，直到 `inflight_refs` 归零才释放 KV pages 和 LoRA slot。

## Prefill 共享同一 Pipeline

Photon 不分离 prefill 和 decode pipeline。prefill 只是同一个 two-slot pipeline 中的另一种 `kind="prefill"` launch。昂贵的 prefill forward 在 GPU 上运行时，CPU 可以同时 commit decode 结果；下一个 decode forward 运行时，CPU 可以完成刚注入的 prefill 请求的准入处理。

这对短输出场景（如只生成 3 个 token 的请求）尤为重要——请求几乎全部生命周期都在 prefill 和准入阶段，共享 pipeline 使得 CPU bookkeeping 被重叠掉而非串行化。

## 性能效果

Pipelined decoding 在 Photon 上实现最高 **35% 的 decode 吞吐提升**。技术适用范围广泛：任何有 per-step CPU bookkeeping 的 autoregressive 模型（constrained decoding、调度、流式输出）都能从 CPU/GPU 工作重叠中获益。

## 与现有推理优化技术的区别

Moondream Photon 的 pipelined decoding 与传统的推理优化方法（如 [LLM Inference Pipeline](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-inference-pipeline-internals.md) 中 covered 的 continuous batching、PagedAttention、speculative decoding）的区别在于：它解决的是**CPU-GPU 间同步开销**问题，而非模型计算效率或显存管理问题。Pipelined decoding 可以与这些技术正交组合，产生叠加效果。

## 深度分析

### Why the bubble is structural, not incidental

The GPU bubble in autoregressive decode is not a bug that a faster CPU or better driver would remove — it is a structural consequence of the decode loop's dependency chain. A single token's GPU work is tiny (one forward through a small VLM), while CPU housekeeping — selecting the next request, assembling metadata, picking the token out of logits, recording it — is a fixed per-step cost. Any design where the plan for step t+1 waits on the committed result of step t forces a baton-pass: launch → run → sync → commit → plan → launch, with the GPU parked during every CPU segment. The insight behind pipelined decoding is that only *sampling* truly depends on the previous token; the next *forward* does not, because it can read the just-sampled token directly from GPU memory. Everything else (detokenization, streaming, done-detection) is bookkeeping that can slide off the critical path. This reframing — separate the true data dependency from the bookkeeping dependency — is what turns an inherently serial loop into a pipelined one.

### Pipelined decoding vs. conventional autoregressive VLM serving

Conventional serving engines run the decode loop in blocking mode: the GPU idles while the CPU commits results and plans the next step, and the cost is paid on every single step, which is brutal for VLMs emitting short structured outputs where per-step overhead dominates actual compute. Photon's pipelined loop instead keeps forwards running back-to-back and overlaps CPU work underneath them. The contrast with other optimization families is worth spelling out: continuous batching raises throughput by packing many requests into one forward, PagedAttention raises it by eliminating KV-memory fragmentation, speculative decoding cuts latency by trading extra compute for fewer sequential steps — but none of them touch the CPU-GPU synchronization seam. Pipelined decoding attacks exactly that seam, which is why it composes orthogonally with all three (see [LLM Inference Pipeline Internals](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-inference-pipeline-internals.md) and [Speculative Decoding](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/speculative-decoding.md) for the orthogonal families). The 35% decode-throughput ceiling also tells you something about the bubble's size: CPU housekeeping was occupying roughly a quarter to a third of each loop iteration.

### Ping-pong slots: double buffering as the enabling substrate

The pipelined schedule is only safe if two adjacent steps don't share mutable state. Photon's two-slot ping-pong design is classic double buffering applied to the decode loop: while the GPU runs step t+1's forward on slot B, the CPU processes slot A's results. Two details make it work well. First, all buffers are allocated once at startup — no per-step GPU allocation means no device synchronization mid-loop, which would silently reintroduce a bubble. Second, fixed buffer addresses are a precondition for capturing the decode step as a CUDA graph and replaying it, stacking kernel-launch-overhead savings on top of bubble elimination. Notably, the two slots share one compute stream (no GPU parallelism is claimed or needed), while the device-to-host copy of the sampled token moves to a separate copy stream — the entire design exists so the CPU can lag one step behind the GPU without either waiting for the other.

### Forward now, sample later: splitting the dependency at its weakest joint

Constrained decoding is the case that seems to forbid pipelining: in Moondream's spatial skills (point → coordinate, detect → boxes, segment → outline), the sampling mask for step t+1 depends on the token sampled at step t. Photon's resolution is a three-phase scheduler tick — Launch (start t+1's forward immediately, since the forward needs no mask), Commit (wait for the in-flight copy of step t and advance decode state), Finalize (build the mask and sample t+1). The ordering trick is "commit-before-finalize": the GPU is already executing t+1's forward while the commit happens, so commit vanishes from the critical path even though sampling remains correctly ordered. The general lesson is to locate the *narrowest* true dependency and schedule everything else around it — the dependency lives in sampling, not in the forward, and the pipeline is shaped accordingly.

### Zombies: the cleanup tax of running ahead

Running one step ahead creates a new problem that blocking loops never have: a sequence that hits its stop token at step t is already baked into step t+1's launched forward, and you cannot un-launch GPU work. Photon's answer is to let finished sequences "ride along" as zombies until the pipeline drains, tracked by two per-sequence fields — `finalized` (set after EOS or length cap) and `inflight_refs` (count of in-flight steps still referencing the sequence). KV pages and LoRA slots are released only when `inflight_refs` hits zero. This is the standard price of speculative execution: wasted compute on dead sequences plus deferred reclamation, traded against eliminating the bubble every step. The trade is clearly favorable at small VLM scale, where one wasted forward is cheap and a per-step stall is not — the same calculus would look different for large models where a zombie's KV footprint and forward cost are substantial.

### How the three mechanisms interlock

The three mechanisms are not independent features but a closed system. Ping-pong slots provide the memory-safety substrate that makes any overlap possible at all. Forward-now-sample-later defines *what* runs ahead (the forward) and *what* stays ordered (sampling under constrained decoding), converting the strongest-looking dependency into a schedulable one. Zombies close the loop by making it safe to run ahead past sequence termination. Remove any one and the pipeline breaks: without slots, step t+1 overwrites step t's unread results; without the launch/finalize split, constrained decoding forces a full stop at every structured-output step; without zombies, finalized sequences are either torn down while still referenced (corruption) or block slot reuse (stall). Prefill sharing the same two-slot pipeline extends the same logic across request admission — and matters most for short-output requests that spend nearly their whole life in prefill, which is exactly the regime Moondream's realtime spatial skills live in.

## 相关实体
- [LLM Inference Pipeline Internals](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-inference-pipeline-internals.md)
- [MorphLLM Inference Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/entities/morphllm-codegen-inference-optimization.md)
- [Tencent Hunyuan Hopper Inference Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-hunyuan-hy3-preview-hopper-inference-optimization.md)
- [LLaVA-OneVision VLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llava-onevision-2-full-frame-rate-vlm-glintlab.md)
- [高德 VLM 生产实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-saojie-image-selection-hermesagent-vlm-production-2026.md)

→ [原文存档](https://moondream.ai/blog/popping-the-gpu-bubble)

---

