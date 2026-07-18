# 淘宝闪购爆品团精排 Scaling Up 迭代实践

## Ch01.1298 淘宝闪购爆品团精排 Scaling Up 迭代实践

> 📊 Level ⭐⭐⭐⭐ | 6.3KB | `entities/taobao-flash-sale-ranking-scaling-up-2026.md`

> 阿里云开发者团队李伟康撰写的淘宝闪购爆品团频道排序模型升级实践，核心是将 DLRM 架构的碎片化模块堆叠重构为 Token-Based RankMixer 统一主干，经过三期迭代从 85M 参数扩展到 243M 参数，取得稳定线上收益。

## 背景与动机

淘宝闪购爆品团业务的旧排序模型长期采用"堆模块"模式：Embedding 和 Sequence 层之后串联 EPNet、多层 PLE、Task Specific Net、Task Bias Net、ResFlow Tower 等模块。每个模块各自解决过局部问题，但整体呈现 **结构碎片化、计算冗余、维护成本高、扩展性差** 四大问题。

重构的核心思路不是继续加模块，而是将主干从传统 DLRM 范式切换为 **Token-Based RankMixer** 架构，用统一的 Token-Mixing 主干自动学习高阶组合。

## 架构设计

新模型保留 Embedding 和 Sequence 层，将序列和非序列特征聚合后 concat，切割为指定维度的 Token，进入多层 RankMixer，最后接 MMCN Task Tower 分别预测 CTR、Item CTCVR 和 Shop CTCVR。

每个 RankMixer Block 由两个核心组件构成：

- **Token Mixer** — 跨 Token 信息混合
- **PerToken FFN** — Token 内部非线性变换

## 结构消融关键结论

### 负采样
随机负采样不适合当前样本分布，**保留全量负样本 + Loss 加权** 更稳，AUC +0.1%。随机采样会丢失 Hard Negatives、破坏概率校准。

### 多任务学习
ESMM 约束虽带来 CTCVR AUC +0.2% 但损失 CTR AUC -0.4%。**GradNorm** 通过动态 Loss 权重平衡多任务学习节奏，CTR AUC +0.7%，不改变模型结构，但训练 GFLOPs 约翻倍。

### 序列层
HSTU (AUC -0.44%) 和 STCA (AUC -0.32%) 均负收益，**Gated Attention** 在 MHA/ETA 后增加 Gating 机制 AUC +0.06%，是唯一正收益方案。

### Tokenization
四种方案对比：Auto-Split 最差，**Pad-Split**（zero padding 后切割）持平 Group-wise 但实现更简单，差异在万分位。Token 粒度：16×320 优于 32×160，AUC +0.14%。

### RankMixer 层数
2 层 baseline → 4 层 AUC +0.21%（显著）→ 6 层 +0.12%（边际递减）。当前 PostNorm 下 4 层是最优选择。有趣发现：丢失 Mixup 后 Add & Norm 反而 AUC +0.2%，补回后下降 — 残差对齐与 Mixup 语义重组不兼容。

### Dense FFN vs Sparse MoE
- **SwiGLU D→4/3D** 零成本替换（同 76M/1.7GFLOPs），AUC +0.07%
- **AFFN v2** 性价比最高，额外 19M/0.34GFLOPs，AUC +0.13%
- **Sparse MoE** 在 16 Token 配置下全线负收益，未超过 Dense，Dense 仍是当前主线

### Task Tower
输入方式：Mean Pooling < TSAP < **Flat Concat**（保留完整 Token 表达）。反直觉发现：TSAP 参数量更小但 RT 增加 5ms，Flat 更适合 GPU 计算。

Tower 结构：MLP baseline → ResFlow MLP (AUC +0.07%) → **MMCN** (AUC +0.32%)，4-head 交叉结构是收益最明显的方案。MMCN 维度从 [1024,512,256,128] 扩到 [4096,2048,1024,512] 时 AUC +0.21%，继续扩到 5 层训练 NaN。

## 三期迭代实验

| 阶段 | 时间 | 配置 | 参数量 | GFLOPs | 核心收益 |
|------|------|------|--------|--------|----------|
| 一期 | 2026-04-09 | 4 层 RankMixer + 3×MMCN, Token 32×160 | 85M→107M | 2.82→2.26 | CTCVR AUC +0.6%, 页面导购率 +0.97%, 人均G +1.14% |
| 二期 | 2026-05-07 | 2 层 RankMixer, Token 16×320, GradNorm | ~107M | 2.26→4.78训练 | CTR AUC +0.7%, 吞吐量 +12%, 人均订单 +0.32% |
| 三期 | 2026-05-21 | 4 层 RankMixer, Tower 扩维 | 107M→243M | 2.26→5.18 | CTCVR AUC +0.37%, 导购率 +0.44% |

三期模型迁移至超抢手业务：CTCVR AUC +0.66%, CTR AUC +1.6%, 页面导购率 +1.09%, 人均G +1.16%。

## 关键经验

- Scaling Up 不是简单堆参数，而是让主干、计算形态、Task Tower 都适合放大
- Sparse MoE 不是加上就一定涨 — 推荐场景下 Token 数量、位置语义、路由稳定性都影响效果
- FLOPs/参数量与线上 RT/吞吐量不总是强正相关（TSAP 现象）
- 旧模型的问题通常是**整体结构碎片化**而非单个模块失效

## 后续方向

短期：探索更优 PerToken FFN、推理侧优化（算子融合/量化）。中长期：跟进 TokenMixer-Large/UniMixer/TokenFormer，在更大规模下重探 Sparse MoE。

## 关联条目

- [推荐系统进入大模型时刻：昇腾 NPU 如何支撑千亿级生成式推荐落地](ch01/567-scaling.html) — 华为 Fuxi 推荐系统 Scaling Law 实践，与本篇淘宝爆品团形成对比视角（生成式推荐 vs Token-Based DLRM 替换）
- [OneReason：快手 Reasoning Recommender System 实践](../ch05/086-ai.html) — 快手的推理型推荐系统，与淘宝 Token-Based RankMixer 分别探索推荐模型的不同演进方向

## 退出

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/taobao-flash-sale-product-group-ranking-scaling-up-2026-07-16.md)

---

