---
title: "RL训练一层就够了！单层RL超越全参数训练，跨任务跨模型跨算法全部验证"
source_url: "https://mp.weixin.qq.com/s/u6-CbyiQ-uhXi6cwyNlomA"
source_site: "机器之心"
author: "张子健等（明尼苏达大学、北京大学、Amazon）"
ingested: "2026-07-08"
sha256: "9aa384a3e721d92a0c20f657163c88b33fded731eb43fa6edb35e6de4ff516ab"
type: raw
tags:
  - rl
  - transformer
  - layer-contribution
  - grpo
  - llm-training
  - post-training
  - arxiv
---

> 论文标题：《Is One Layer Enough? Training a Single Transformer Layer Can Match Full-Parameter RL Training》
> 论文链接：https://arxiv.org/abs/2607.01232

## 背景与动机

现有的 RL 后训练方法（如 GRPO、Dr. GRPO、GiGPO）统一更新所有 Transformer 层，隐含假设每一层对 RL 收益的贡献是均等的。来自明尼苏达大学、北京大学和亚马逊的团队挑战了这一假设。

## 核心方法：层贡献度（Layer Contribution）

提出指标 C(k)：冻结除第 k 层以外的所有参数，仅用 RL 训练该层，将其性能提升与全参数 RL 基线对比。

C(k) = (S_k - S_base) / (S_full - S_base)

C(k) > 1.0 表示单层训练超越全参数 RL。

## 关键发现

### 发现一：中间层主导 RL 收益

在所有 7 个模型上（Qwen3 1.7B/4B/8B、Qwen2.5 1.5B/3B/DeepSeek-Distilled-7B），位于网络深度 **40–60%** 的层始终拥有最高的层贡献度，靠近输入端和输出端的层贡献显著偏低。该规律具有跨数据集、跨任务、跨模型家族、跨 RL 算法的高度一致性。

### 发现二：单层训练可以超越全参数 RL

在测试的每一个模型上，最佳单层都达到或超过了全参数训练（C ≥ 1.0）。例如 Qwen3-1.7B 上仅训练 Layer 10 达到 C = 1.14。

### 深入分析：不是参数变化量，而是参数空间质量

- 全参数训练下各层权重变化均匀，但贡献度高度不均匀——两者脱钩
- 单层训练时高贡献层和低贡献层经历了相似幅度的权重变化，却产生了截然不同的性能结果
- 层贡献度反映的是一层参数子空间**捕获 RL 改进的有效性**，而非参数变化的幅度

## 实用策略

1. **层自适应学习率**：对高贡献层使用更高学习率，在所有模型规模上均带来稳定提升
2. **层选择性训练**：仅训练贡献度最高的 k 层。Qwen3-8B 仅训练 top-10 层 → 69.11%（全参数 RL 为 66.43%）
3. **零分析启发式**：不需要层贡献度信息，直接选择中间 5 层训练。在所有三个模型规模上均超越全参数 RL 基线

## 总结

1. RL 收益高度集中在一小部分中间层，训练单个层即可匹敌甚至超越全参数 RL
2. 层贡献度具有一致的结构，是预训练模型的内在属性
3. 简单的基于层贡献度的训练策略均持续超越标准全参数 RL 训练
