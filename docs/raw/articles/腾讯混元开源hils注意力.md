---
title: "腾讯混元开源HiLS注意力：8K训练直接外推到4M，还把长文本推理提速到15.7倍"
source_url: "https://mp.weixin.qq.com/s/P8wjdSKjJk4jR6NhpmsV3g"
source: "Hyman的杂货铺（微信公众号）"
source_author: "Hyman"
ingested: 2026-07-09
sha256: "41b2039681e483c5366943fbf030420825dd9457edda8521e8f709cda75826f1"
type: raw-source
status: ingested
review_value: 8
review_confidence: 8
review_stars: 4
tags: [attention-mechanism, sparse-attention, long-context, tencent, hunyuan, open-source, inference-acceleration]
---

# 腾讯混元开源HiLS注意力：8K训练直接外推到4M，还把长文本推理提速到15.7倍

> **来源**：Hyman的杂货铺（微信公众号）| 2026-07-09 07:30 北京
> **论文**：Hierarchical Sparse Attention Done Right: Toward Infinite Context Modeling
> **论文链接**：https://arxiv.org/abs/2607.02980
> **Github**：https://github.com/Tencent-Hunyuan/HiLS-Attention

## 核心问题

稀疏注意力在长上下文场景中常"看漏信息"——chunk 选择时，分数参与了检索却没真正参与最终前向权重，语言建模损失很难反向教会"该选谁"。HiLS 解决了这个训练闭环缺口。

## 技术方案

### 可学习 chunk 质量代理

用 LogSumExp 一阶近似，将 chunk 质量写成线性可计算代理：
- **可学习的压缩 chunk key**（替代均值池化，更有表达力的 chunk 表示）
- **熵项校准**（在"均匀分布"和"尖峰分布"之间自适应补偿）

### 层级 softmax 分解

注意力 = 块内分配 × 块间分配。块间分配项可学习 chunk 质量代理直接影响最终注意力权重，使下游 LM loss 反向优化路由本身。

### 训练策略

两条路径：
1. **轻量改造**：冻结基座，只训练 landmark token + 低秩查询校准（Q-Cal），新增参数不到 1%
2. **全参数继续训练**：与 HoPE 位置编码配合

## 关键结果

| 指标 | 数值 |
|------|------|
| 8K 训练 → 4M 外推检索准确率 | 90%+（512 倍外推） |
| 512K 预填充加速 | 约 13.5× |
| 512K 解码加速 | 约 15.7× |
| 7B 长上下文检索平均分 | 97.42（全注意力基线 33.50） |
| General/Math/Code | 与基座接近，无副作用 |

## 价值判断

- **方法价值**：路由学习纳入 LM 主损失，补上稀疏注意力训练闭环缺口
- **工程价值**：低成本改造现有全注意力模型
- **系统价值**：速度提升来自算法和 kernel 协同
- **边界**：主要在语言建模和长上下文任务验证，多模态和复杂 Agent 场景还需后续证据；chunk 路由超参数仍需细调
