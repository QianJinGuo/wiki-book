# Gemma 4 Technical Report

## Ch01.044 Gemma 4 Technical Report

> 📊 Level ⭐ | 8.2KB | `entities/2607.02770v1.md`

# Gemma 4 Technical Report

**URL:** [https://arxiv.org/html/2607.02770v1](https://arxiv.org/html/2607.02770v1)
**Slug:** `2607.02770v1`
**Score:** v×c=81 (value=9, confidence=9)
**Stars:** 5
**Tags:** newsletter, ai, model, google, deepmind, llm, multimodal
**Ingested:** 2026-07-09 18:59 UTC

## 摘要

Gemma 4 是 Google DeepMind 推出的新一代开源权重、原生多模态语言模型家族。该系列覆盖从 2.3B 到 31B 参数的密集（Dense）和混合专家（MoE）架构，在文本、图像和音频三种模态上实现前沿性能。相比 Gemma 3，Gemma 4 引入了思考模式（Thinking Mode）、无编码器统一架构（Encoder-Free Architecture）、长上下文效率优化（p-RoPE + KV Cache Sharing）、量化感知训练（QAT）以及多 Token 预测草稿头（MTP Drafter）等关键创新。Gemma 4 31B 在 Arena 文本评测中以 Elo 1451 成为领先的密集开源模型，以不到 1/10 的参数匹配或超越更大模型的表现。

## 核心要点

- **架构多样性**：包含 5 个版本——E2B（2.3B有效参数）、E4B（4.5B有效）、12B（密集）、26B-A4B（MoE，3.8B激活/26B总参）、31B（密集）。E2B 和 E4B 使用每层嵌入（Per-Layer Embeddings）设计。
- **思考模式**：所有 IT 模型支持在回答前生成推理轨迹（Reasoning Trace），大幅提升数学和编程领域的表现。AIME 2026 无工具场景下 31B 达 89.2%，较 Gemma 3 27B 的 20.8% 提升超过 4 倍。
- **无编码器架构**：12B 模型采用全新的统一无编码器范式，以 35M 参数的轻量投影模块替代 550M 视觉编码器，以 640 维向量投影替代 305M 音频编码器，大幅减少内存碎片和推理开销。
- **长上下文优化**：采用 5:1 局部滑动窗口与全局注意力比例（E2B 为 4:1），结合 p-RoPE 位置编码（p=0.25）和 KV Cache 共享，将全局 KV Cache 减少 37.5%。128K 上下文下 RULER 准确率达 96.4%（31B）。
- **计算效率**：提供 QAT 量化版本（移动端 int2/int4 + int8，Q4_0 块量化），31B 模型从 64GB 降至 19.2GB。MTP 草稿头支持投机解码以加速推理。
- **训练基础设施**：使用 TPUv5p 和 TPUv6e，最大规模达 12,288 芯片。采用 Slice-Granularity Elasticity 应对局部硬件故障，ZeRO-3 分片优化器状态。

## 深度分析

### 1. 从 Gemma 3 到 Gemma 4 的架构跃迁

Gemma 4 并非简单缩放 Gemma 3，而是在架构层面进行了多项根本性重新设计。最显著的变化是引入了 **思考模式**——模型在回答前输出推理轨迹。这一能力使 Gemma 4 31B 在 AIME 2026 上达到 89.2%（较 Gemma 3 的 20.8%），在 GPQA Diamond 上达 84.3%（较 42.4%），在 LiveCodeBench v6 上达 80.0%（较 29.1%）。值得注意的是，E2B（2.3B 有效参数）在多数基准上已接近或超越 Gemma 3 27B，体现了架构效率的巨大提升。

**MoE 与密集架构的权衡**：26B-A4B MoE 变体激活仅 3.8B 参数，以 4B 激活参数达到接近 31B 密集模型的性能（AIME: 88.3% vs 89.2%，MMLU Pro: 82.6% vs 85.2%）。这使 MoE 在推理效率上具有显著优势，特别适合边缘部署场景。

### 2. 无编码器架构的突破性设计

12B 模型的 **无编码器统一架构** 是该报告中最具前瞻性的设计之一。核心思路是：

- **视觉**：将 48×48×3 RGB 图像块直接以 35M 参数的大矩阵乘法（Large Matmul）投影到 LLM 嵌入空间，添加 2D 坐标位置嵌入后送入主模型。完全消除了 ViT 编码器的依赖。
- **音频**：40ms 16kHz 音频块（640 维向量）直接投影到 LLM 嵌入空间，消除 USM 编码器。音频作为时序序列，不需要额外位置编码。

这种方法在不使用专用视觉/音频编码器的情况下，仍然在 MMMU Pro（69.1%）、MATH-Vision（79.7%）、CoVoST 翻译任务上表现竞争力。这意味着未来的多模态模型可能彻底告别独立编码器，实现更统一、更高效的架构。

### 3. 推理效率的多维度优化

Gemma 4 在推理效率上的优化策略值得业界借鉴：

1. **注意力层优化**：5:1 局部/全局注意力比 + p-RoPE（p=0.25）使全局 KV Cache 减少 37.5%。全局层复用 Key 作为 Value（除 E2B/E4B 外），进一步节省内存。
2. **量化感知训练**：移动端量化（int2/int4 混合 + int8 激活）和 Q4_0 块量化两种方案。音频编码器从 Gemma 3n 的 390MB 降至 87MB（降低 78%），同时翻译和转写性能分别提升 12%/17%。
3. **投机解码**：MTP 草稿头使用 4 层 Transformer 块（维度 256/1024）交叉注意力到主模型 KV。E2B/E4B 草稿头使用 top-k 聚类投影（d×262k → d×4k）大幅降低解码开销。

### 4. 开源生态的战略定位

Gemma 4 以 Apache 2.0 协议发布，是 Google 在开源 AI 领域的战略布局。其在 Arena 上的定位（31B 密集模型 Elo 1451，26B MoE 1438）直面 DeepSeek V4、Kimi K2.5、Qwen 3.5 等开源竞品。关键差异点在于：

- **多模态原生支持**：Gemma 4 从预训练阶段就融合文本、图像、音频，而非后期拼装
- **边缘部署友好**：完整的量化工具链和 2.3B 起的最小规模支持从手机到服务器的全场景
- **安全性投入**：继承 Gemini 的安全评估框架和训练时缓解措施，所有测试在不使用安全过滤器的情况下进行

## 实践启示

1. **思考模式成为标配**：Gemma 4 展示了思考模式在密集小模型上的巨大潜力。E2B（2.3B）在 AIME 上 37.5% 的表现远超许多更大规模的无思考模型。团队在技术选型时应默认启用思考模式，仅在延迟敏感场景考虑关闭。

2. **无编码器架构可能是未来方向**：12B 的编码器自由设计验证了消除专用编码器的可行性。新的多模态项目应考虑从单一投影层开始，而非假设 ViT 或 USM 编码器是必须的。

3. **KV Cache 优化是长上下文的关键瓶颈**：5:1 局部-全局混合注意力 + p-RoPE + Key-as-Value 的组合在 128K 上表现优秀（RULER 96.4%）。实现长上下文时，注意力机制的选择比单纯的窗口大小更关键。

4. **QAT 比 PTQ 更适合边缘部署**：Gemma 4 在训练中嵌入量化感知，使量化版本在各场景下保持高精度。计划部署到移动端或边缘设备的团队应考虑 QAT 而非事后量化。

5. **MTP 草稿头是经济实惠的加速方案**：以极小参数量的草稿头（E2B 仅 76M）实现投机解码，是性价比最高的推理加速方式，尤其适合批量推理场景。

## 相关实体

- **Gemma 3 Technical Report** — 前代架构的基线对比（无独立实体页面）
- [DeepSeek V4](ch01/669-deepseek-v4.html) — 同期 MoE 开源模型竞品
- [Kimi K2.5](ch01/403-kimi.html) — 同期视觉智能开源模型
- **Qwen 3.5 Omni** — 同期全模态开源模型（无独立实体页面）
- [Mixture of Experts (MoE)](https://github.com/QianJinGuo/wiki/blob/main/concepts/moe-mixture-of-experts-2025.md) — MoE 架构概念
- [Speculative Decoding](https://github.com/QianJinGuo/wiki/blob/main/concepts/speculative-decoding.md) — 投机解码原理
- **Quantization-Aware Training (QAT)** — 量化感知训练方法论（无独立概念页面）
- [Claude Opus 4.7](ch01/951-claude.html) — 闭源竞品参考
- **Gemma 3n** — 前代音频编码器架构对比（无独立实体页面）

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/2607.02770v1.md)

---

