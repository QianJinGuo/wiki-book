# Residual Context Diffusion (RCD)：Apple 残差上下文扩散语言模型

## Ch01.1187 Residual Context Diffusion (RCD)：Apple 残差上下文扩散语言模型

> 📊 Level ⭐⭐⭐ | 2.5KB | `entities/residual-context-diffusion-apple-ml-2026-07.md`

# Residual Context Diffusion (RCD)：Apple 残差上下文扩散语言模型

> **核心洞察**：Residual Context Diffusion (RCD) 提出了一种新颖的模块，将扩散语言模型(dLLM)中丢弃的低置信度 token 表示转化为上下文残差并重新注入到去噪步骤中，在 AIME 等挑战性任务上近乎将基准精度翻倍，同时减少 4-5 倍去噪步数。

## 背景

扩散大语言模型(dLLM)已成为纯自回归语言模型的有前途替代方案，因为它们可以并行解码多个 token。然而，最先进的块级 dLLM 依赖于"remasking"机制——只解码最自信的 token，丢弃其余的——这实际上浪费了计算量。

## 核心方法：RCD

RCD 的核心洞察在于：被丢弃的 token 表示仍然保留了对后续解码迭代有用的上下文信息。RCD 模块将这些丢弃的 token 表示转换为上下文残差(contextual residuals)，并在下一个去噪步骤中重新注入。

**关键技术特点**：
- 使用解耦的两阶段训练流水线绕过反向传播相关的内存瓶颈
- 仅需约 10 亿 token 即可将标准 dLLM 高效转换为 RCD 范式
- 在前沿 dLLM 上以极小的额外计算开销实现 5-10 个百分点的精度提升

## 实验结果

- 在长 CoT 推理(SDAR)和短 CoT 指令跟随(LLaDA)模型上均验证有效
- 在最具挑战性的 AIME 任务上，RCD 近乎将基线精度翻倍
- 在相同精度水平下，去噪步数减少 4-5 倍
- 由 UC Berkeley 和 Apple 联合研究团队完成

## 意义

RCD 为扩散语言模型的推理效率提供了一个实用改进方向，特别适用于需要高精度推理能力的场景。与 `diffusion-language-models` 和 [推理优化](ch01/590-llm.md) 相关。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/residual-context-diffusion-apple-ml-2026-07.md)

---

