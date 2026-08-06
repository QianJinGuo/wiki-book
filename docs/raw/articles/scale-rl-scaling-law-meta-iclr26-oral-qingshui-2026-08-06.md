---
source_url: https://www.xiaohongshu.com/explore/6a73ee93000000002c005d87
ingested: 2026-08-06
sha256: e2dd472ba8f5a64290f8825b7dfd7e0d81468c6e7e0e759ac4c26fa4f5a66fe4
title: "ICLR26 Oral：把 LLM 强化学习从玄学变科学——The Art of Scaling RL Compute for LLMs"
author: 清水
source: 小红书 (XHS)
type: raw
tags: [reinforcement-learning, scaling-law, rl-training, meta, iclr, grpo, dapo]
---

# ICLR26 Oral：把 LLM 强化学习从玄学变科学——The Art of Scaling RL Compute for LLMs

> 原始来源：https://www.xiaohongshu.com/explore/6a73ee93000000002c005d87
> 作者：清水（小红书论文解读号，2026-08）
> 论文：The Art of Scaling Reinforcement Learning Compute for LLMs
> 团队：Meta + UT 奥斯汀 + 哈佛，约 40 万 GPU 小时实验

## 背景：RL 训练全靠试错

预训练有成熟缩放定律，算力多少性能能提前预判；但 RL（推理能力关键阶段）全靠试错——OpenAI、DeepSeek 动辄十万 GPU 小时砸进去，没法提前预判收益。小实验看着强，拉大算力直接拉胯，纯纯烧钱赌运气。

## 突破一：S 型缩放预测公式（替代预训练幂律）

RL 性能有天花板（通过率最高 100%），**Sigmoid 曲线完美拟合**。三个核心参数一眼看懂训练上限：
- **A**：性能天花板（渐近通过率，**最关键**——优先拉高 A）
- **B**：算力效率（数值越大，同等算力涨分越快）
- **Cmid**：达到一半收益需要的算力

只用前期少量小算力数据就能精准外推十万 GPU 小时的最终效果。实测：8B 模型前 5 万小时数据，完美预测 10 万小时训练结果。

## 突破二：ScaleRL 通用训练配方（碾压 GRPO/DAPO）

整合最优组件，稳定性 + 上限双第一：
- **PipelineRL-8 异步流水线**：减少 GPU 空转
- **CISPO 损失**：对超参不敏感、训练不崩溃
- **LM 头 FP32 精度**：解决数值误差，直接拉高天花板
- **零方差样本过滤 + 易题目剔除**：不浪费算力
- **强制思考截断**：避免无限长推理拖垮训练

## 实测结论

1. **不是所有算法上限一样**：DAPO/GRPO 天花板远低于 ScaleRL——小算力好看的方法，拉满算力会被反超（bitter lesson）
2. **大部分 trick 只提升效率 B，改变不了最终天花板 A**；只有损失函数、FP32、PipelineRL 能拉高 A
3. **模型越大、批次越大、思考越长，天花板越高**，只是前期涨分慢
4. **17B MoE 模型只用 1/6 算力，就能超过 8B 稠密模型最终效果**

## 行业意义

1. 小实验室不用盲烧卡：小规模实验预判大算力收益
2. 统一 LLM 推理 RL 训练标准，替代各家零散偏方
3. 开源拟合代码，所有人都能复现缩放预测

（End）
