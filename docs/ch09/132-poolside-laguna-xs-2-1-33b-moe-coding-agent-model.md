# Poolside Laguna XS 2.1: 33B MoE Coding Agent Model

## Ch09.132 Poolside Laguna XS 2.1: 33B MoE Coding Agent Model

> 📊 Level ⭐⭐ | 5.8KB | `entities/poolside-laguna-xs-2-1-coding-agent-model-2026.md`

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

## 深度分析

### 1. MoE 架构的高效激活比是本地编码代理的关键设计选择

Laguna XS 2.1 的 33B 总参数中仅激活 3B/词元，11:1 的稀疏激活比使其在本地硬件上运行时能够维持低延迟推理。与稠密 7B 模型相比，其在 SWE-bench 上具有更高的知识容量；与稠密 70B 模型相比，其推理速度更快、内存占用更低。这是当前开源 Agentic Coding 模型中最激进的激活比设计之一，直接决定了其在开发者本地工作站上的实用性。

### 2. 专注 Agentic Coding 基准的定向优化策略

XS 2.1 相比 XS.2 在架构层面未做改动，全部改进来自 SWE-bench Multilingual (+5.4pts 至 63.1%) 和 Terminal-Bench 2.0 等 Agentic Coding 场景的定向优化。这种"架构冻结、数据驱动"的策略表明 Poolside 的模型迭代重心已从预训练规模化转向 Agent 场景的对齐与微调——这与通用基座模型的迭代路线形成鲜明对比。

### 3. 开源 DFlash Speculator 解决本地推理速度瓶颈

本地编码代理的最大痛点之一是推理速度。Poolside 同时开源了 DFlash speculator 模型，通过投机解码使本地推理 tok/s 翻倍。这解决了 MoE 模型在 CPU 卸载和内存带宽受限场景下的一个关键系统级瓶颈，表明模型层优化与推理系统层优化需要协同进行才能实现实用的本地 Agent 体验。

### 4. 完全宽松许可与差异化定价策略

OpenMDW-1.1 许可证赋予了开发者最大的使用自由度，而 API 定价中 cache-read token 仅 $0.05/1M（为输出 token 的 1/4）则针对 Agentic Coding 场景中大量重复上下文（项目文件、系统提示）做了优化。这说明 Poolside 从产品设计之初就考虑到了 Coding Agent 的典型 token 消耗模式。

### 5. 与开源 Agent 生态系统深度集成

支持 vLLM、SGLang、TensorRT-LLM、Ollama 和 HuggingFace Transformers 等主流推理框架，意味着开发者可以无缝接入 [Claude Code](../ch03/076-claude-code.html)、[Codex](../ch01/509-codex.html) 或其他支持 BYOM 的 Agent 系统，而不受限于 Poolside 自身的工具链。这种生态兼容策略有助于其在快速演变的开源 Agent 工具链中保持长期相关性。

## 实践启示

1. **选择 MoE 模型时关注激活参数而非总参数**：33B 总参数但仅激活 3B 意味着在本地部署时实际需要的显存和算力远低于同尺寸稠密模型，这是评估 Coding Agent 模型实用性时的关键指标。

2. **Speculator 模型的边际收益可能超过主模型升级**：DFlash 使推理速度翻倍，这一改进在用户体验上的感知提升（延迟降低 50%）可能比 SWE-bench 上 +5.4pts 的改进更为显著。评估 Coding Agent 时，应将推理速度与准确率视为同等重要的维度。

3. **Agentic Coding 场景的定价应匹配其使用模式**：Coding Agent 会在多次交互中重复发送项目上下文（System Prompt、CLAUDE.md 等），cache-read 友好型定价模型可降低 50%+ 的实际使用成本。采购 API 时应关注 caching tier 定价而非仅看输入/输出价格。

4. **开源 Coding Agent 模型正在形成分层竞争格局**：Laguna XS 2.1 (63.1% SWE-bench ML) 与 [DeepSeek](../ch01/389-deepseek.html)、Qwen 等国产模型之间的差距正在收窄，开发者应基于本地部署成本、推理速度和特定语言/框架的支持度做综合选型，而非仅看单点基准分数。

5. **256K 上下文对 Coding Agent 的实际意义**：256K 上下文足够覆盖中等规模项目的完整代码库，使得 Agent 可以在不依赖 RAG 或分块策略的情况下处理大多数仓库。这一能力与 Agentic Coding 工作流的深度集成比单纯的基准分数更重要。

## wiki 定位

Laguna XS 2.1 是 Agentic Coding 领域当前最具竞争力的开源模型之一，在 SWE-bench Multilingual 上达到 63.1%，与 gpt-oss 等闭源模型在相同量级竞争。重点关注其 MoE 架构的高效性（3B 激活 vs 33B 总参数）和对本地部署的生态系统支持。

## 相关实体

- [Codex 五层架构](../ch01/509-codex.html)
- [Claude Code 深度架构分析](../ch03/076-claude-code.html)
- [Pi Agent](../ch04/347-pi-agent.html)
- [LLM Post-Training](../ch01/882-llm.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/poolside-laguna-xs-2-1-2026.md)

---

