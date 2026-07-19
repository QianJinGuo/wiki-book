# vLLM

## Ch01.903 vLLM

> 📊 Level ⭐⭐ | 4.4KB | `entities/vllm.md`

vLLM 是一个高性能的 LLM 推理和服务引擎，由 UC Berkeley 开发并开源。它通过创新的内存管理和批处理技术，显著提升大语言模型的推理吞吐量。

## 核心技术

- **PagedAttention**：类似操作系统虚拟内存的 KV Cache 管理，消除内存碎片
- **连续批处理（Continuous Batching）**：动态插入新请求，最大化 GPU 利用率
- **张量并行（Tensor Parallelism）**：多 GPU 分布式推理
- **前缀缓存（Prefix Caching）**：共享相同前缀的请求复用 KV Cache

## 性能特点

- 吞吐量比 HuggingFace Transformers 高 2-24 倍
- 支持主流开源模型（LLaMA、Mistral、Qwen、DeepSeek 等）
- 兼容 OpenAI API 格式
- 放弃 beam search 换取更高的吞吐量

## 相关实体

- [vLLM 高效推理](ch01/860-ai-infra.html)
- [ServiceNow vLLM Correctness](ch01/903-vllm.html)
- [vLLM v0 to v1 Correctness](ch01/903-vllm.html)
## 深度分析

### PagedAttention 的核心突破：虚拟内存思想在推理中的迁移

vLLM 最核心的创新 PagedAttention 将操作系统的虚拟内存管理思想迁移到 LLM 推理中。传统推理引擎为每个请求预分配连续的 KV cache 空间，导致严重的内存碎片——实际利用率通常只有 20-40%。PagedAttention 将 KV cache 划分为固定大小的 block（类似内存页），通过 block table 实现逻辑地址到物理地址的映射，使内存利用率提升到 95% 以上。这一思想虽然简单，但工程实现挑战极大：需要精确管理 block 的分配、释放、共享和写时复制（Copy-on-Write），同时保持推理延迟的可预测性。

### 连续批处理：动态调度取代静态等待

vLLM 的连续批处理（Continuous Batching）是另一个关键性能来源。传统批处理需要等待一个 batch 中的所有请求完成才能开始下一个 batch，导致 GPU 在 batch 末尾阶段利用率下降。连续批处理允许新请求动态插入到正在执行的 batch 中，同时允许已完成的请求提前退出（preemption 机制），最大化 GPU 的持续利用率。这一技术使得 vLLM 的吞吐量比静态批处理方案高出 2-24 倍。

### 前缀缓存的适用边界

vLLM 的前缀缓存（Prefix Caching）在共享 prompt 前缀的场景下效果显著（如 system prompt 相同的多轮对话、相同 instruction 的批量推理）。但在 prompt 前缀差异较大的场景中，缓存命中率低，反而增加了 block table 的管理开销。实际部署中需要根据应用场景评估是否启用前缀缓存，以及设置合适的缓存淘汰策略。

### 正确性与性能的权衡

vLLM 放弃 beam search 换取高吞吐量是一个重要的设计决策。beam search 虽然能提升生成质量，但会显著增加推理延迟和显存占用。对于大多数在线推理场景（聊天、代码生成、内容创作），greedy 或 sampling 策略已经足够。vLLM 的这一取舍反映了 LLM 推理引擎从"学术评估"到"生产部署"的范式转变：在工程实践中，可预测的延迟和高吞吐量往往比极致的生成质量更重要。

## 实践启示

1. **部署配置**：根据模型大小选择合适的并行策略。7B 以下模型用单卡即可；13B-70B 模型用 tensor parallelism（2-4 卡）；70B+ 模型需要 4-8 卡 TP + pipeline parallelism
2. **量化配合**：vLLM 支持 AWQ/GPTQ 量化模型，4-bit 量化可将显存需求降低约 60%，是成本敏感场景的首选方案
3. **前缀缓存调优**：对于多轮对话场景，务必启用前缀缓存并设置合理的 max_num_batched_tokens 参数
4. **监控指标**：关注 P50/P99 TTFT（首 token 延迟）和 ITL（inter-token latency），而非仅看吞吐量。TTFT 影响用户体验，ITL 影响流式输出的流畅度
5. **版本升级**：vLLM v1 相比 v0 在调度器架构上有重大重构，建议新部署直接使用 v1 版本

## 应用场景

vLLM 适用于：
- 企业级 LLM 部署和服务
- 需要高吞吐量的在线推理服务
- 多模型统一推理网关
- 成本敏感的 GPU 资源优化

---

