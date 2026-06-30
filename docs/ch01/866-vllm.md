# vLLM

## Ch01.866 vLLM

> 📊 Level ⭐⭐ | 1.5KB | `entities/vllm.md`

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

- [vLLM 高效推理](ch04/310-ai.md)
- [ServiceNow vLLM Correctness](ch01/890-llm.md)
- [vLLM v0 to v1 Correctness](ch01/890-llm.md)

## 应用场景

- 企业级 LLM 部署和服务
- 需要高吞吐量的在线推理服务
- 多模型统一推理网关
- 成本敏感的 GPU 资源优化

---

