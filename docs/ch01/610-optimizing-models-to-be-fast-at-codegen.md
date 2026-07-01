# Optimizing Models to Be Fast at Codegen

## Ch01.610 Optimizing Models to Be Fast at Codegen

> 📊 Level ⭐⭐ | 6.5KB | `entities/morphllm-codegen-inference-optimization.md`

# Optimizing Models to Be Fast at Codegen

Morphllm shows how to exploit the structure of code editing tasks for LLM inference acceleration. Core insight: code edits have high locality -- agents reread the same repo each turn, context overlaps heavily with the previous turn, and edits are mostly incremental copies of the file.

## Core Findings

### 1. Incremental Context Strategy
Traditional inference stacks discard all KV cache each turn, treating every token as new input. Morphllm exploits code editing locality:
- Edits only affect local regions of a file
- Unmodified portions' KV cache can be reused across turns
- Dramatically reduces redundant computation

### 2. Structural Properties of Code Edits
- An edit is mostly a copy of the file it edits
- Agents reread the same repo every turn with high context overlap
- Generic inference stacks cannot exploit this structure

### 3. Inference Performance Gains
By identifying "unchanged" vs "changed" portions of code edits:
- KV cache reuse across turns
- Incremental computation (only process changed tokens)
- Significant latency and compute cost reduction

## Differentiation from General Inference Optimization

| Dimension | Morphllm | General (vLLM/TensorRT) |
|-----------|----------|------------------------|
| Target | Code editing agents | General LLM inference |
| Structure exploited | Edit locality + context overlap | Batching + model parallelism |
| KV cache strategy | Cross-turn reuse | Intra-turn reuse |
| Optimization level | Application layer (agent loop) | System layer (GPU/kernel) |

## 深度分析

### 推测解码的定制化是核心竞争力

通用推测解码（speculative decoding）使用现成的 draft 模型，接受率仅 1.93x；而针对目标模型的编码输出专门训练的 draft 模型可达 3.07x——**相同目标模型、相同设置，仅 draft 训练数据不同就带来 59% 的性能差距**。Morphllm 的核心洞察是：代码编辑任务具有极高的模板复用性（edit mostly copies the file），因此用代码 diff 数据训练的 draft 模型比用互联网文本训练的通用 draft 模型预测准确率高得多。EAGLE-3 和 DFlash 等架构是公开的，但"为你的目标模型训练专属 draft"这一步才是真正的护城河。

### 前缀缓存命中率决定廉价 GPU 的可行性

编程流量的前缀 token 共享率高达 97%，prompt 长度是输出的 37x 到 2494x。这意味着缓存前缀的收益极大——但缓存只在 lookup、eviction、copy 和 attention 操作在目标 GPU 上都足够快时才有价值。默认 kernel 针对 H100 调优，移植到其他架构时性能可能降至最优的 7%。Morphllm 通过自动化 kernel 搜索（而非手写）解决了这个问题：在廉价 GPU 上自动搜索正确且更快的 kernel 实现。

### 跨机器 TCP 前缀缓存突破 NVLink 限制

没有 NVLink 的廉价 GPU（如 RTX PRO 6000），PCIe 带宽仅为 NVLink 的 1/14，tensor parallelism 的 all-reduce 开销从 8-11% 飙升至 40-75%。标准方案是购买 NVLink，Morphllm 的方案是：(1) 通过 compute overlap 隐藏 PCIe all-reduce 延迟；(2) 通过 TCP 跨机器共享前缀缓存。关键在于，TCP 传输虽然比 RDMA 慢一个数量级，但只要缓存命中率足够高，从邻居机器通过 TCP 获取缓存比本地重计算更快——省去 prefill 的收益弥补了慢传输的开销。

### Chinchilla 法则在推测解码场景下失效

Chinchilla scaling law 建议约 20 tokens/parameter 为计算最优，但这假设训练是主要成本。对于"训练一次、服务数十亿次"的推测解码模型，最优解大幅偏向**小模型、过度训练**的方向。Llama 3 在 15T tokens 上仍在提升（超出 Chinchilla 点两个数量级），SmolLM2 1.7B 训练到 11T tokens（约 6500 tokens/parameter）。这为专门训练推测解码 draft 模型提供了理论依据。

### "单一工作负载"策略的工程启示

Morphllm 的三个技术选择——训练专属推测器、自动搜索 kernel、编写跨机器 interconnect——全部指向同一个工作负载：编码 agent。这种"单一工作负载、深度优化"策略与通用推理框架（vLLM、TensorRT）的"广覆盖、浅优化"形成鲜明对比。结果是：相同开源权重、相同廉价 GPU，Morphllm 的速度远超通用栈。代价是失去通用性——但编码 agent 是 AI 中最高吞吐量的工作负载，市场规模足以支撑这种专注。

## 实践启示

1. **编码 agent 推理应优先考虑专用栈而非通用推理框架**：如果目标工作负载是编码 agent，使用 Morphllm 等专用栈可获得 2-3x 的性能提升。通用框架（vLLM/TensorRT）在编码任务上浪费了大量可利用的结构。

2. **训练专属推测解码 draft 模型**：通用 draft 模型在编码任务上的接受率仅为专用 draft 的 63%。投入小模型训练（draft 通常 <1B 参数）的 ROI 极高，因为推理成本被数十亿次调用摊薄。

3. **不要低估廉价 GPU 的推理潜力**：RTX PRO 6000（$7K）在 Morphllm 的优化下可达 162 tok/s（80B MoE），超过 H100（$25K）的 120 tok/s。关键不是硬件规格，而是 kernel 和缓存策略是否针对目标硬件优化。

4. **前缀缓存命中率是编码 agent 推理的核心指标**：编码 agent 的 prompt 重复率极高（97% 前缀共享），缓存命中率从 20% 提升到 75% 可带来数倍的吞吐量提升。监控并优化这一指标比优化模型本身更有效。

5. **考虑跨机器缓存共享的架构**：对于多 GPU 部署，即使没有 NVLink，通过 TCP 共享前缀缓存也能显著降低 time-to-first-token（最高 84%）。前提是缓存命中率足够高，使得 TCP 获取优于本地重计算。

## Related
- [NVIDIA Enpire agent self-improvement](ch03/044-agent.md)

---

