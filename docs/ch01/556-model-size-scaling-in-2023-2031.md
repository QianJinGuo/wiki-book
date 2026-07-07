# Model Size Scaling in 2023-2031

## Ch01.556 Model Size Scaling in 2023-2031

> 📊 Level ⭐⭐ | 7.8KB | `entities/model-size-scaling-in-2023-2031.md`

# Model Size Scaling in 2023-2031

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/model-size-scaling-in-2023-2031.md)

## 摘要

本文从 HBM（高带宽内存）带宽约束出发，系统性推演 2023-2031 年间 LLM 模型规模的可行上界。核心论点是：token 生成速度受限于 HBM 读取权重 + KV-cache 的时间，结合 pipeline 并行度和预训练计算量，可以推导出每年的模型参数天花板。研究发现，2027 年起预训练数据不足成为主约束，模型被迫比无限数据情景大 4 倍，与 Chinchilla scaling law 的"数据墙"预测一致。

## 核心要点

### HBM 读取时间：模型规模的物理约束

token 生成速度的根本物理约束是 HBM 读取速度。当模型足够大，需要在单次前向传播中读取超过一半的 HBM 权重时，token 生成时间至少为 HBM 栈全量读取时间 × pipeline stage 数。

各代硬件的 HBM 全量读取时间：

| 芯片 | HBM 配置 | 全量读取时间 |
|------|----------|------------|
| H100 | 5×8-Hi HBM3, 0.8 TB/s | 20 ms |
| H200 | 6×12-Hi HBM3 | 30 ms |
| GB200 | 4×8-Hi HBM3E, 1.0 TB/s | 24 ms |
| GB300 | 4×12-Hi HBM3E | 36 ms |
| Rubin (2026) | 4×12-Hi HBM4, 2.75 TB/s | 13 ms |
| Rubin Ultra | 12-Hi HBM4E, 3.6-4.0 TB/s | 12-13 ms |
| Feynman Y1 (2028) | 2×16-Hi HBM4E | 16 ms |
| Feynman Y2 (2029) | HBM5, 5.6 TB/s | 14 ms |

关键观察：GB300 的 HBM 读取时间（36 ms）是 Rubin（13 ms）的近 3 倍，这种差异直接影响 pipeline 深度和可服务模型的规模上限。

### Pipeline 并行度：不是 FLOPs，而是 HBM 读取速度决定模型大小

以 80 tokens/s 为目标（含 3x speculative decoding/MTP 加速），每 37.5 ms 需要生成一个 token。在 pipeline 中，请求遍历 N 个 rack 时，需要读取所有 rack 的权重（N × 半栈时间），加上 KV-cache 的 1/N 读取（半栈时间总计）。

以 GB200 Oberon 为例：12 ms 花在 KV-cache 读取（与 pipeline 长度无关），剩余 25.5 ms 用于权重读取（每 stage 12 ms），因此最多 2 个 stage。

各代硬件的最大 pipeline 深度：
- **H100**：最多 2 台服务器
- **H200**：最多 1 台服务器
- **GB200 Oberon**：最多 2 个 rack
- **GB300 Oberon**：最多 1 个 rack
- **Rubin/Rubin Ultra**：最多 4 个 rack
- **8x Kyber + Feynman Y1**：最多 3 个系统
- **8x Kyber + Feynman Y2**：最多 4 个系统

### 模型规模推演：从 10T 到 1.4 千万亿

结合 pipeline 约束和预训练计算量，各年份的模型参数天花板（FP4 总参数）：

| 年份 | 预训练 FLOPs | 活跃参数 | Sparsity | 总参数 | 硬件 |
|------|-------------|---------|----------|--------|------|
| 2023 | 2.1e25 | 170B | 8x | 1.3T | H100 |
| 2024 | 2e26 | 530B | 8x | 4.2T | H100/H200 |
| 2025 | 6e26 | 900B | 8x | 7.2T | GB200 |
| 2026 | 1.3e27 | 1.3T | 8x | 10T | GB200/GB300 |
| 2027 | 6e27 | 3.8T | 8x | 30T | Rubin |
| 2028 | 2e28 | 7.9T | 30x | 240T | Rubin Ultra Kyber |
| 2029 | 8e28 | 22T | 30x | 650T | Feynman Y1 |
| 2030 | 1e29 | 26T | 30x | 790T | Feynman Y1/Y2 |
| 2031 | 2.2e29 | 48T | 30x | 1.4 千万亿 | Feynman Y2 |

## 深度分析

### 数据墙：2027 年后的核心约束

本文最具洞察力的发现是：**从 2027 年起，预训练数据不足取代计算能力成为模型规模的主要约束**。

推导逻辑：
- 假设可用的独特预训练数据上限为 200T tokens
- Chinchilla scaling law 的 compute optimal 比率在 8x sparsity 下为 120 tokens/param，在 30x sparsity 下为 240 tokens/param
- 当计算量要求的训练 tokens 超过 200T 时，必须通过**增加活跃参数 + 重复数据 epochs** 来补偿

以 2031 年为例：2.2e29 FLOPs 在 30x sparsity 下要求 3,000T 训练 tokens，是可用数据的 15 倍。模型被迫拥有 48T 活跃参数（而非 compute optimal 的 12T），并用 200T 独特 tokens 训练 3.9 个 epochs。

这一发现的深远影响：
1. **模型规模的"通胀"**：模型不是因为需要更大而变大，而是因为数据不足被迫膨胀
2. **数据质量 > 数据数量**：高质量独特数据将成为最稀缺的战略资源
3. **Scaling law 的修正**：Chinchilla scaling law 在数据受限时需要修正

### 2024 年：模型最受硬件约束的一年

2024 年是模型最受 scale-up 系统约束的一年。compute optimal 的模型（530B 活跃参数，4.2T 总参数）即使在 FP4 下也远超 2 台 H100 服务器的 1.3T 约束或 1 台 H200 服务器的 1.1T 约束。

这解释了为什么 GPT-4.5 如果比 compute optimal 更快（在 GB200 Oberon 可用之前），它可能实际上更小。这也说明了为什么 2024 年的模型在速度和成本上面临巨大压力。

### Sparsity 作为参数放大器

Sparsity 从 8x 到 30x 的演进是模型规模膨胀的关键驱动因素：
- **8x sparsity**：活跃参数占总参数的 12.5%，2023-2027 年适用
- **30x sparsity**：活跃参数占总参数的 3.3%，2028 年起适用

更高的 sparsity 使得在保持活跃参数可控的前提下大幅增加总参数成为可能，从而在推理时保持合理的速度。但这需要 MoE（Mixture of Experts）架构的支持。

### 预训练计算的增长轨迹

预训练计算的增长基于以下假设：
- 3 个月预训练周期，40% FLOP/s 利用率
- FP8 训练（Nvidia 在 Rubin 中押注 FP8，FP8/BF16 性能比从 2 提升到 4.4）
- 全球 AI 计算从 2027 年底的 10 GW 增长到 2030 年的 40 GW

这一增长轨迹意味着 AI 公司的一方计算资源从 2025 年底的 1-2 GW 增长到 2027 年底的 10 GW，再到 2030 年的 40 GW。

## 实践启示

1. **Pipeline 并行度是硬约束**：不是 FLOPs 决定模型大小，而是 HBM 读取速度 × pipeline stage 数。在选择推理硬件时，HBM 带宽比计算峰值更重要
2. **数据墙比计算墙先到**：2027 年起，独特训练数据的稀缺将成为模型能力增长的主要瓶颈。投资数据获取、清洗、合成将成为关键竞争力
3. **Sparsity 架构是必经之路**：从 8x 到 30x sparsity 的演进需要 MoE 架构的支持，这对模型设计和推理基础设施都有深远影响
4. **Rubin 是关键转折点**：HBM4 的 13 ms 读取时间（相比 GB300 的 36 ms）将彻底改变推理经济学，使得更长 pipeline 和更大模型变得可行
5. **Speculative decoding/MTP 是必备技术**：3x 加速假设意味着没有这些技术，可服务模型的规模将大幅缩减

## 相关实体

- [Moebius](https://github.com/QianJinGuo/wiki/blob/main/entities/moebius.md) — 模型压缩的极端案例（0.22B 替代 11.9B）
- MoE（Mixture of Experts）架构是 Sparsity 实现的核心技术
- Chinchilla Scaling Law 是本文修正和扩展的理论基础
- [模型服务路由](../ch11/174-state-of-routing-in-model-serving.md) — 推理时的模型选择策略

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/model-size-scaling-in-2023-2031.md)

---

