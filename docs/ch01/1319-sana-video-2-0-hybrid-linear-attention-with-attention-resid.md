# SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

## Ch01.1319 SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

> 📊 Level ⭐⭐⭐ | 1.6KB | `entities/sana-video-2-hybrid-linear-attention-video-generation.md`

# SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

SANA-Video 2.0 是 NVIDIA Research 推出的高效视频生成模型，支持 720p 分辨率视频生成。其核心技术是 Hybrid Linear Attention（混合线性注意力）和 Attention Residuals（注意力残差）机制，在保持生成质量的同时大幅降低计算成本。

## 核心技术

**Hybrid Linear Attention（混合线性注意力）**：结合了标准 Softmax Attention 与 Linear Attention（线性注意力），在长序列场景下利用 Linear Attention 的 O(n) 复杂度优势，在短序列/局部区域保留 Softmax Attention 的表达能力。这种混合设计使得模型能够高效处理视频帧序列的长程依赖。

**Attention Residuals（注意力残差）**：通过残差连接机制增强注意力层的梯度流动，改善训练稳定性和生成质量。

## 技术意义

SANA-Video 2.0 代表了视频生成模型在效率与质量之间权衡的最新进展。混合注意力架构为解决扩散模型在视频生成中的计算瓶颈提供了实用方案。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sana-video-2-hybrid-linear-attention-video-generation.md)

---

