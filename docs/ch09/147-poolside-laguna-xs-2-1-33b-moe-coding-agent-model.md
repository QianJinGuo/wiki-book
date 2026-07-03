# Poolside Laguna XS 2.1: 33B MoE Coding Agent Model

## Ch09.147 Poolside Laguna XS 2.1: 33B MoE Coding Agent Model

> 📊 Level ⭐⭐ | 1.6KB | `entities/poolside-laguna-xs-2-1-coding-agent-model-2026.md`

# Poolside Laguna XS 2.1: 33B MoE Coding Agent Model

> **Background**: Poolside 发布了 Laguna XS 2.1，一个 33B 总参数（3B 激活/词元）的 MoE 模型，专为 Agentic Coding 和长周期本地编码任务设计。

## 架构与基准

- 33B 总参数，3B 激活参数/词元（MoE）
- 与 XS.2 相同架构，主要改进在 Agentic Coding 基准
- SWE-bench Multilingual: **63.1%**（+5.4pts）
- Terminal-Bench 2.0 也有明显提升
- 256K 上下文长度

## 部署与生态

支持 vLLM、SGLang、TensorRT-LLM、HuggingFace Transformers、Ollama。提供三种量化版本：FP8、INT4、NVFP4。开源 DFlash speculator 模型使本地推理 tok/s 翻倍。

- 许可证：**OpenMDW-1.1**（完全宽松）
- API 定价：$0.10/$0.20/$0.05 每 1M token（输入/输出/cache-read）
- 通过 OpenRouter 和 poolside API 提供服务

## wiki 定位

Laguna XS 2.1 是 Agentic Coding 领域当前最具竞争力的开源模型之一，在 SWE-bench Multilingual 上达到 63.1%，与 gpt-oss 等闭源模型在相同量级竞争。重点关注其 MoE 架构的高效性（3B 激活 vs 33B 总参数）和对本地部署的生态系统支持。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/poolside-laguna-xs-2-1-2026.md)

---

