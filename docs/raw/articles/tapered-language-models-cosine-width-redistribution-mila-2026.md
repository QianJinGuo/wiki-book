sha256: fc77f231df9bfb19bf4c9beda8cc4336005b57643565cf08f3d9b727da1f95b7
---
title: "Tapered Language Models：锥形参数分配的免费午餐"
source_url: "https://mp.weixin.qq.com/s/6Tg-XzoKjoxEdHWZo8lAWw"
author: "机器之心 / Mila-魁北克人工智能研究所、康奈尔大学、蒙特利尔大学"
published: 2026-06-29
ingested: 2026-06-29
type: raw-article
language: zh
tags: [architecture, parameter-efficiency, transformer, tapering, zero-cost-improvement]
---

# Tapered Language Models：锥形参数分配

**论文**: https://arxiv.org/abs/2606.23670

## 核心问题

Transformer 及几乎所有后续架构都采用均匀层结构——每层参数量完全相同。但层重要性不均匀：
- 提前退出实验：模型未到最后一层答案已定型
- 层剪枝：砍掉后面层，表现几乎不受影响
- 可解释性：浅层抓语法，深层处理语义

**核心疑问**：既然层重要性不均匀，为什么"脑容量"要均匀分配？

## Tapered Language Models (TLMs)

选定模型中决定参数量的维度（如 FFN 宽度），沿深度方向单调递减，保证平均宽度 = 原固定值。

总参数量和计算量完全不变，分布形状从"长方形"变"楔形"。

### 三种递减曲线
- **线性递减**：匀速关店
- **S 形递减**：突然集中闭店，中段急速收缩
- **余弦递减**：两头平缓，中段逐渐收紧

### 实验结果

440M Transformer：余弦递减最优配置（前段 1.5x，后段 0.5x），困惑度 16.28 → 14.44，改善 **1.84 个点**，零额外参数和 FLOPs。

### 跨架构验证

同一配置（余弦递减 1.5/0.5）搬到：
- 带门控机制的注意力模型
- Hope-attention（自我修改记忆）
- Titans（神经长期记忆）

760M 和 1.3B 两个规模，四种架构、两种规模，八组对比中锥形化模型全部提升。

长文本检索（Needle-in-a-Haystack）确认不牺牲长上下文能力。

## 原因解释

测量 GPT-2 每层 FFN 输出与已有信息流的相似度：越往深处，新写入内容与已有信息越像。后段层更多在"重复强调"而非"创造"新理解。

把容量从前段挪到后段 = 把资源给真正用得上的地方。

## 核心观点

零成本替代方案：不换架构、不加参数，只换分配"形状"。
