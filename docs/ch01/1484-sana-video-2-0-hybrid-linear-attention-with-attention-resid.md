# SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

## Ch01.1484 SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

> 📊 Level ⭐⭐⭐ | 8.1KB | `entities/sana-video-2-hybrid-linear-attention-video-generation.md`

# SANA-Video 2.0: Hybrid Linear Attention with Attention Residuals for Efficient Video Generation

> SANA-Video 2.0 是 NVIDIA Research（Efficient AI Team 与新加坡实验室）推出的高效视频生成模型系列（5B 和 14B 参数），支持 720p 分辨率视频在单张 H100 GPU 上生成。其核心技术是 Hybrid Linear-Softmax Attention（混合线性-软最大化注意力）和 Block Attention Residuals（注意力残差）机制，在匹配全 Softmax 视频 DiT 生成质量的同时，实现 3.2× 的注意力层加速。结合 Sol-Engine 全栈优化后，5B 模型流水线可在 13.06 秒内生成 720p/5s 视频，比 Wan 2.2-A14B 快 120 倍。

## 摘要

SANA-Video 2.0 是 NVIDIA 在视频生成效率-质量权衡方面的最新进展。传统视频扩散 Transformer 面临的两难困境是：Softmax Attention 提供高质量但计算复杂度随序列长度呈 O(N²) 增长，Linear Attention 具有 O(N) 复杂度但表达能力受限。SANA-Video 2.0 的混合线性-软注意力在 3:1 比例下交替使用门控线性注意力与门控软注意力锚点，在保留线性注意力长序列优势的同时恢复全秩 token 交互——通过从零训练而非将预训练模型线性化，让模型完整学习混合注意力模式。在低分辨率代理研究中，25% Softmax 被确定为最优的质效权衡点。

## 核心要点

- **混合线性-软注意力（Hybrid Linear-Softmax Attention）**：以 3:1 比例交替使用门控线性注意力（O(N) 复杂度）与门控软注意力锚点（恢复全秩 token 交互），解决了纯线性注意力表达受限的问题
- **块注意力残差（Block Attention Residuals / AttnRes）**：将已完成块的 attention summary 路由到后续线性层，实现锚点特征复用，深层有效秩提升约 12%
- **性能指标**：VBench 总分 84.30，480p/40 步仅需 13.2 秒（单 H100）；编译后 DiT 前向传播比匹配的全 Softmax 基线在 720p/60s 下快 3.2×，差距随视频时长扩大
- **Sol-Engine 全栈加速**：内核融合、缓存和稀疏注意力进一步加速，5B 流水线达 13.06 秒（720p/5s），比 Wan 2.2-A14B 快 120 倍
- **统一架构**：5B 和 14B 两种规模的模型共享架构设计，14B 模型在质量上更具竞争力

## 深度分析

### 效率-质量权衡的架构创新

SANA-Video 2.0 的核心架构创新在于：不将线性注意力视为 Softmax 注意力的替代品，而是将其作为组合架构中的组件。混合线性-软注意力通过两种机制弥补纯线性注意力的表达能力损失：

**周期性全秩锚点**：每 4 层中插入 1 层门控软注意力（3:1 比例），这些"锚点"层恢复被线性注意力丢失的全秩 token 交互信息。锚点输出的丰富表示通过残差连接向前传播，影响后续线性层的计算。

**块注意力残差（AttnRes）**：一个更细粒度的改进——每一层的 attention 输出被切片为多个块，已完成块的 summary 被直接路由到后续层的计算中。这种架构类似于 Transformer 层间的残差连接，但作用在 attention 特征层面而非整个隐藏状态。实验表明 AttnRes 使深层有效秩提升约 12%，意味着注意力头的表示多样性显著改善。

### 从零训练的 hybrid 设计

与许多高效注意力方案不同，SANA-Video 2.0 选择从零训练完整的混合架构，而非将预训练模型线性化。这一设计决策的核心理由在于：线性化预训练模型会继承原有注意力模式的权重分布，而混合架构需要模型在训练过程中自适应地学习何时依赖线性注意力的效率、何时依赖软注意力的表达力。从零训练允许模型更好地"理解"混合模式的切换策略。

低分辨率代理研究（proxy study）是确定混合比例的关键方法：在较低分辨率下快速评估不同 Softmax 比例（12.5%、25%、50%、100%）对生成质量的影响。25% Softmax（即每 4 层 1 层 Softmax）被确定为最优权衡点——在质量上接近全 Softmax 基线，效率上接近全 Linear 基线。

### Sol-Engine 全栈优化的协同效应

SANA-Video 2.0 的效率优势不仅来自注意力架构创新，还得益于与 Sol-Engine 的全栈协同优化。Sol-Engine 提供的三层加速（内核融合减少 kernel launch 开销、KV 缓存减少冗余计算、稀疏注意力进一步降低注意力计算量）在硬件友好的线性注意力基础上额外带来 3.58× 加速。这表明：**高效的架构设计 + 硬件感知的工程优化 = 数量级级别的性能提升**。当两者协同设计时（而非架构和工程分离开发），可以获得远超各自独立提升的乘积效应。

### 与扩散模型中效率优化趋势的关系

SANA-Video 2.0 代表了视频生成模型效率优化的一个重要趋势：不再单一追求更小的模型或更少的步数，而是从注意力机制本身入手降低单步计算成本。这与 [MoE 架构](ch01/1409-moe-architecture.html)的稀疏激活思路类似——不是在推理时减少模型参数量，而是让每次计算本身更高效。同时，混合注意力的思路与 [Tencent Hunyuan HILS 注意力](ch01/903-hils-attention.html) 的层级路由注意力形成互补：前者在单层内混合两种注意力机制，后者在不同层之间路由 token 到不同的注意力处理路径。

## 实践启示

1. **高效率架构需要从零训练**：将高效注意力机制作为"补丁"应用于预训练模型往往只能获得次优效果。SANA-Video 2.0 的经验表明，从零训练完整混合架构可以让模型更好地适应注意力模式的切换策略。

2. **代理研究是架构探索的必备工具**：在低分辨率下快速评估不同设计选择的质效比，可以大幅缩短研究周期。25% Softmax 比例的确定正是基于代理研究的系统化探索。

3. **架构与工程的协同优化 > 两者独立优化**：高效的注意力架构使 Sol-Engine 的工程优化效果倍增（3.58× vs 单独架构带来的 3.2×）。在 AI 基础设施设计中，硬件架构与算法架构的协同设计应成为标准实践。

4. **视频生成正在从"能否生成"进入"效率竞争"阶段**：SANA-Video 2.0 在单张 H100 上实现 720p 视频生成的能力标志着视频生成模型开始走向实际应用部署。效率优化将成为未来竞争的主战场。

5. **残差机制可以超越层间连接**：AttnRes 展示了一个有趣的方向——残差连接的作用可以从层间特征传播扩展到注意力特征复用。这一思路可能对 Transformer 架构的进一步改进有启发意义。

## 相关实体

- [MoE 架构](ch01/1409-moe-architecture.html) — 另一种通过稀疏激活提升推理效率的方法
- [Tencent Hunyuan HILS Attention](ch01/903-hils-attention.html) — 层级路由注意力，与混合注意力思路互补
- [Speculative Decoding](ch01/1197-spec.html) — 推理加速的另一个重要方向
- [EchoGen](ch01/1114-20.html) — ICLR 2026 VAR 主体驱动生成，另一个关注效率-质量权衡的生成模型

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sana-video-2-hybrid-linear-attention-video-generation.md)

---

