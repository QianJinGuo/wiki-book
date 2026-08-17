---
title: "Full-bandwidth Transformer：Latent Feedback 拓宽自回归解码反馈通道"
created: 2026-08-17
updated: 2026-08-17
type: raw-article
tags: [raw, article, transformer, architecture, latent-feedback, arxiv]
source_url: https://arxiv.org/abs/2608.08888
source: arxiv
arxiv_id: 2608.08888
authors: [Xi Wang, Ziyang Cai, Zheng Zhan, Harry Dong, Ying Fan, Gustavo de Rosa, Tim Pearce, John Langford]
sha256: 05713308ba7a67841b92e013dac81d3334fd736ba35505eeeddc47f8ff004418
---

# Full-Bandwidth Transformer：Latent Feedback 拓宽自回归解码反馈通道

arXiv:2608.08888 [cs.AI]，2026-08-09 提交，作者 Xi Wang 等 8 人。

## Abstract（原文）

Autoregressive transformers compute along two axes: horizontally across generated tokens, and vertically through model depth. Dense attention gives each token broad horizontal access to the past, but the vertical feedback channel between decoding steps remains narrow: only the sampled token returns to the bottom of the stack, while the top-layer hidden state is discarded. We introduce the *full-bandwidth transformer*, which widens this channel with *latent feedback*: at each decoding step, the previous top-layer hidden state is fused with the sampled token embedding through a gated linear unit and fed back as the next input. Latent feedback lets non-verbalized computation re-enter the stack with a renewed depth budget, while preserving the standard transformer architecture, KV cache, and language-modeling objective. To train full-bandwidth transformers without losing parallel teacher forcing, we use a scheduled multi-pass objective that introduces latent feedback late in pretraining and mixes a small fraction of deeper feedback passes for stability. We train 1B-parameter full-bandwidth transformers up to 400B tokens and find that latent feedback improves validation loss, 5-shot language-model evaluation, math and coding generation, and instruction-tuned performance. With negligible per-token decoding overhead, full-bandwidth transformers match or approach standard transformers trained with roughly 1.5× more tokens, and manage to produce shorter reasoning traces at equal or better accuracy.

## 核心贡献

- **问题**：自回归 Transformer 的解码步间垂直反馈通道狭窄——只有采样 token 回到栈底，顶层隐状态被丢弃。非言语化的计算（latent computation）无法重新进入计算栈。
- **方法**：full-bandwidth transformer 用 *latent feedback* 拓宽该通道——每个解码步将上一层的顶层隐状态与采样 token embedding 通过门控线性单元（GLU）融合后作为下一输入。保持标准架构、KV cache 与 LM 目标不变。
- **训练**：scheduled multi-pass objective——预训练后期引入 latent feedback，混合小比例更深反馈 pass 以保稳定性（保留并行 teacher forcing）。
- **结果**：1B 参数训练至 400B tokens，latent feedback 提升验证损失、5-shot 语言模型评估、数学与代码生成、指令微调性能。每 token 解码开销可忽略，以约 1.5× 更多 token 训练的 Transformer 相当或接近，且推理轨迹更短、精度持平。

## 意义

这是自回归架构侧的「垂直反馈带宽」补全——与「水平方向」的 attention 访问历史能力并列，研究解码栈顶（未言语化计算）的回流路径。对推理效率（更短 reasoning trace）与训练效率（1.5× token 等价）均有直接价值。

doi: https://doi.org/10.48550/arXiv.2608.08888