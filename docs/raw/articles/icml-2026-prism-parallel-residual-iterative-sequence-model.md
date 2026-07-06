---
title: "ICML 2026 | 当线性注意力学会"写入前思考"：并行化的多步记忆写入"
source_url: "https://mp.weixin.qq.com/s/luHnepErnw3Ujfjcr5YIQg"
author: "腾讯广告技术"
feed: "大模型智能"
publish_time: "2026-06-11"
ingested: 2026-06-11
sha256: "9df9b76935cb159b7c81e8bb1a5fd3da74fe3f4a42aa7ddab5792f3dd506b6ba"
type: raw
tags: [icml-2026, prismatic-attention, prsm, linear-attention, gdn, ttt, sequence-model, recommendation, parallel-scan, memory-writing, mixed-architecture]
review_value: 8
review_confidence: 9
review_stars: 5
sources: []
---

# ICML 2026 | PRISM: Parallel Residual Iterative Sequence Model

> 腾讯广告技术 / 北京大学 | 2026-06-11
> 论文: [PRISM: Parallel Residual Iterative Sequence Model](https://arxiv.org/) (ICML 2026)

## 概述

Transformer 的 self-attention 计算开销随序列长度呈 O(n²) 增长，推荐领域被迫做各种妥协（cross-attention、截断、压缩），损失长程行为模式。线性注意力（Linear Attention）天然 O(n) 复杂度是更匹配的底层架构，但每步只能做 rank-1 浅层写入；TTT（Test-Time Training）有多步深度写入能力却因串行依赖慢 174 倍。

腾讯广告技术团队与北京大学合作提出 **PRISM**（Parallel Residual Iterative Sequence Model）——在线性注意力的 O(n) 复杂度下实现 TTT 级别多步深度写入。

## 背景：无限背包 vs 有限背包

- **Transformer 无限背包**：每个 token 的 KV 完整保存，O(n²) 计算
- **线性复杂度模型有限背包**：固定大小状态矩阵 S 压缩所有历史信息，O(n) 复杂度

有限背包 = RNN 递推，天然串行。并行化的数学技巧：**Parallel Scan**——当递推满足线性结构（A_t, B_t 只依赖当前输入，不依赖 S_t）时，可将串行递推改写为结合律运算，用 parallel prefix sum 方式并行计算。N 步串行在 O(log N) 深度完成，总计算量变 O(n·log N)，但 GPU 墙钟时间大幅缩短。

## Rank-1 写入瓶颈

GDN 每步做 rank-1 更新：ΔS = γ · (v · k^T)。"擦"是全局 scalar gate 控制衰减，"写"每次只能写入一个 rank-1 外积（两个向量乘积），相当于只改动了记忆矩阵"一行"。如果 token 语义是多维度的，rank-1 无法同时在多个维度上做精细调整。

**核心矛盾**：背包有限，每次只允许写一行。

## TTT 的突破与代价

TTT 把记忆状态从线性矩阵升级为 MLP 权重，每来一个 token 做多步梯度下降，带来显著质量提升。但每步梯度依赖当前权重，打破 parallel scan 前提——每个 token 要串行跑一遍梯度下降循环，HBM↔SRAM 搬运次数从 O(n) 退化到 O(n²)，实测慢 174 倍。

## 关键洞察

TTT-MLP 的高表达力来自"步长 × 残差 × 方向"模式：
- **步长**：每个 hidden unit activation，控制写入强度
- **残差**：还没写好的部分，逐步递减
- **方向**：写入方向，每步不同

高表达力与串行瓶颈是同一根因（权重每步更新）的两面：
1. **Token 间串行**：遗忘/写入耦合（A 瓶颈）+ 残差依赖历史状态（B 瓶颈）
2. **Step 间串行**：方向与残差同步耦合（C 瓶颈）——最核心矛盾

## PRISM 设计

### 核心迭代形式

PRISM 显式构造 TTT-MLP 的多步迭代模式：ΔS = Σ_{l=0}^{L-1} α_l · r_l · u_l · v^T

- α_l: 更新步长
- r_l: 显式残差迭代
- u_l: learned key projection（多方向）
- v: 基础方向

与 TTT-MLP 的对应：hidden layer 方向 → learned projection；随 W₂ 更新递减 → 显式残差迭代；方向残差同步耦合 → **方向和残差解耦（可并行）**

### 消除 Token 间串行

- **遗忘/写入分离**：遗忘项保持与 GDN 一致，所有非线性操作限制在写入项内
- **局部 Anchor 代理**：用短卷积（ShortConv）计算的局部历史状态替代全局 S，所有 token 迭代可同时运行
- 复用 Mamba 的 scan kernel

### 消除 Step 间串行

- **Direction chain 解耦**：anchor 是预先给定的局部统计量，所有 L 个方向同时算出
- **Residual chain 线性化**：GELU 非线性吸收进 preconditioner，迭代退化为纯 element-wise 线性递推，得到闭合式

### 架构形式

ΔS = ΔS_gdn + ΔS_residual

第一步退化为 GDN 标准写入，后续步以不到 10% 参数增量叠加低秩修正。L=1 时精确退化为 GDN。

## 实验结果

### 序列推荐（Amazon 基准）

| 模型 | Books H@200 | Movies H@200 | Elec H@200 | Throughput (token/s) |
|------|-------------|--------------|------------|---------------------|
| GLA | 0.0879 | 0.1193 | 0.1196 | 57.4K |
| GDN | 0.1214 | 0.1241 | 0.1333 | 57.2K |
| TTT | 0.1255 | 0.1288 | 0.1344 | 0.34K |
| **PRISM** | **0.1258** | **0.1411** | **0.1409** | **57.3K** |
| HSTU (Transformer) | 0.1224 | 0.1399 | 0.1407 | 18.2K |

PRISM 匹配 TTT 质量且吞吐量比 TTT 快 **174 倍**，超越 GDN 1-2 个百分点，略超 Transformer。

### 语言建模（SlimPajama 2B, 130M 参数）

PRISM 在 WikiText PPL、LAMBADA PPL 和 9 项 Zero-Shot 任务平均准确率上均最优，领先 GDN 3.2 个百分点。

### 消融实验

- 单步 solver (L=1) 训练 PPL 几乎等于完整版，但 Avg ACC 跌 2.9 个百分点——**rank-L 的价值不在 next-token prediction，而在精确长程检索**
- Shared-K vs base-K：solver 复用 GDN base key 则大幅退化（-1.5）——**solver 需要自己的方向空间**

## 延伸思考

### 混合架构是必然

有限背包终究有限。PRISM 用 ShortConv 计算局部 anchor 近似残差，短卷积窗口只覆盖最近 3-4 个 token，跨数千步长程依赖近似质量必然下降。

在 PRISM 层之间穿插少量 Transformer 层——后者充当全局、非线性的历史状态精确计算器，补偿 anchor 在长程上的近似误差。**Transformer 是 ShortConv anchor 的全局升级版**。

这解释了为什么 Jamba、Zamba、Griffin 等最强长序列模型都采用混合架构：有限背包 + 无限背包在架构层面互补，前者提供 O(n) 高速处理，后者提供精确长程检索。

### 线性注意力的 LoRA

PRISM 的"基础迭代 + low rank 旁路"形式与 LoRA 非常相似——这启发了一个参数高效微调思路：冻结基础迭代过程，只在写入支路加 PRISM 风格残差拟合旁路。第一步退化为原模型标准写入（不破坏预训练知识），闭合式（不增加训练时间），满足 LoRA 两个关键要求：参数高效 + 不损害原模型能力。

## 结论

PRISM 验证了"写入前思考"范式在线性注意力模型中的可行性：通过分析 TTT-MLP 梯度结构揭示"步长 × 残差 × 方向"模式，在线性状态上显式重建并通过 anchor 代理和闭合式预计算实现完全并行。最终架构极简——GDN + 非线性旁路，训练速度 GDN 同级，参数增量 <10%。

## 参考

- [1] Sun et al. "Learning to (Learn at Test Time): RNNs with Expressive Hidden States." NeurIPS 2024 (TTT)
- [2] Yang et al. "Gated Delta Networks with Pairwise Tokenized Graphs." NeurIPS 2024 (GDN)
- [3] Katharopoulos et al. "Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention." ICML 2020
