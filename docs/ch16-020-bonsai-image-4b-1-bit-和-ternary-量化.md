## Ch16.020 Bonsai Image 4B: 1-bit 和 Ternary 量化

> 📊 Level ⭐⭐⭐ | 4.4KB | `entities/bonsai-image-4b-quantization.md`

# Bonsai Image 4B: 1-bit 和 Ternary 量化

> **Background**: 本文档基于对外部技术来源的评分入库建立，v×c=7×7=49。

## 核心要点

1-bit 和 Ternary 量化图像扩散模型 Bonsai Image 4B 的技术发布，8.3x 和 6.4x 相比 FP16 的压缩比

---

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-1-bit-and-ternary-bonsai-image-4b-image-generati-352fe9.md)

## 深度分析

**1. Group-wise Scaling Factor 是量化质量的关键**

1-bit 和 Ternary 量化的核心不在于简单地将权重二值化或三值化，而在于保留了 FP16 分组缩放因子。每个权重分组拥有独立的缩放系数，使得 1-bit 模型实际达到 1.125 有效位数，Ternary 模型达到 1.71 有效位数。这种设计在极端压缩下仍能保留大部分模型能力，是 Bonsai 系列的核心技术路径。

**2. Precision-sensitive Projection Layers 保留策略**

虽然主体 transformer 权重被压缩到 1-bit 或 Ternary，但约 5% 的投影层（projection layers）被保留为 FP16 精度。原文指出这些是"precision-sensitive"的组件，表明并非所有权重对量化同等敏感。这一发现意味着未来量化研究可以针对不同层类型采取差异化的精度策略。

**3. Ternary 的 {−1, 0, +1} 提供了重要的表征灵活性**

相比 1-bit 的 {−1, +1}，Ternary 加入了 0 状态，形成 {−1, 0, +1}。这一额外的中间态显著提升了视觉质量和提示词忠实度：Ternary 保留了原模型的 95% 性能，而 1-bit 仅有 88%。零值状态在稀疏计算中有潜在优势，可以在推理时跳过零值计算，进一步提升效率。

**4. 质量–体积 Pareto 前沿的实质性推进**

Bonsai Image 4B 在 6.4x 压缩下仅损失 5% 质量（GenEval 0.723 vs 0.819），而体积相似的 BK-SDM-Small（0.98GB）仅保留 42% 性能。这说明 Bonsai 的量化不是以线性质量损失为代价，而是在相同体积下实现了能力的大幅跃升，重新定义了"小模型能做什么"的标准。

**5. iPhone 部署验证了移动端可行性的临界点**

Bonsai Image 4B 是其参数级别上首个直接在 iPhone 上运行的图像生成模型。在 iPhone 17 Pro Max 上生成 512x512 图像仅需 9.4 秒，这意味着移动端图像生成的交互延迟已进入可接受范围。平均活跃内存 1.5–1.96GB 的表现证明极量化和架构共同构成了移动部署的可行路径。

## 实践启示

**1. 优先考虑 Ternary 量化作为质量–压缩平衡点**

如果应用场景对图像质量有要求，Ternary 的 6.4x 压缩比和 95% 性能保留是更优选择。只有在极端内存约束（如 1GB 以下 transformer）时，才考虑 1-bit 方案。Apache 2.0 许可下可直接商用，无需考虑授权成本。

**2. 结合 [Ai Infra Llm Efficient Inference Vllm](ch01-865-memory-in-the-llm-era-modular-architectures-and-strategies.html) 进一步降低推理延迟**

虽然 Bonsai 本身已针对 Apple Silicon（MLX）和 CUDA（Gemlite）做了 kernel 优化，但在端侧部署时可结合推理优化技术（如批处理策略、KV cache 管理）进一步提升吞吐。Bonsai Studio iOS app 的部署案例提供了参考实现路径。

**3. 利用文本编码器 offloading 策略降低运行时内存**

在 512x512 图像生成时，平均活跃内存（1.5GB / 1.96GB）显著小于总部署 payload（3.42GB / 3.88GB），因为文本编码器在提示词编码完成后即可卸载。这一策略可直接应用于类似架构的部署优化，在长 prompt 场景下收益尤其明显。

**4. 关注 zero-state 的稀疏计算加速潜力**

Ternary 权重中的零值可以在推理时跳过相关计算，结合稀疏 kernel 可能实现进一步加速。这意味着在设计端侧推理 engine 时，应考虑对 {0} 值的条件分支优化或 mask 化处理。

**5. 评估跨平台推理栈的统一抽象层**

Bonsai 同时支持 Apple Silicon（MLX）和 CUDA（Gemlite），对于需要跨平台部署的团队，建议关注 MLX（Apple）和 Gemlite（NVIDIA）背后的底层 kernel 差异，或探索如 llama.cpp 风格的统一推理抽象，以同时覆盖手机端和桌面端 GPU 场景。

## 相关实体

- MOC

---
