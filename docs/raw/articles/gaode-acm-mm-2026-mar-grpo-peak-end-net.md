---
source_url: https://mp.weixin.qq.com/s/I4g2n7JeM7rmT-HEv0ByNg
ingested: 2026-07-16
sha256: 968548f2791e3139f69d81e551ba36e40db563407d4682d9c30ca9d62fb3e251
source_published: 2026-07-16
title: "ACM MM 2026｜高德2篇论文被收录，覆盖自回归图像生成、强化学习、视频美学评估方向"
author: 高德技术
feed_name: 高德技术
---

## 论文01：MAR-GRPO: Stabilized GRPO for AR-Diffusion Hybrid Image Generation

- 技术领域：自回归图像生成、强化学习
- 论文：https://arxiv.org/abs/2604.06966
- 代码：https://github.com/AMAP-ML/mar-grpo

MAR（Masked Autoregressive）模型结合了大型 AR Transformer 和轻量级扩散解码器。端到端 GRPO 应用于 MAR 导致训练不稳定，根因是扩散头在联合训练中引入极大随机性和梯度噪声。

**MAR-GRPO 关键技术**：
1. **冻结扩散头参数**：仅优化 AR 主干，提供稳定优化目标
2. **多轨迹期望估计（MTE）**：相同 AR 潜变量采样多条扩散轨迹，计算期望值引导优化，降低梯度噪声
3. **基于不确定性的局部优化**：估算每个 Token 方差，仅对不确定性最高的前 k% 应用多轨迹期望优化
4. **一致性感知 Token 选择**：过滤优化方向与生成内容不一致的 Token

在 HPSv2 人类偏好评分、提示词遵循、空间结构理解等方面超越端到端 GRPO 基线。

## 论文02：Peak-End-Net: A Peak-End Rule Inspired Framework for Generalizable Video Aesthetic Assessment

- 技术领域：视频美学评估
- 论文：https://arxiv.org/pdf/2607.13941
- 代码：https://github.com/AMAP-ML/Peak-End-Net

基于心理学的**峰终定律**（peak-end rule）：人们对一段体验的总体评价取决于显著时刻和结束阶段。

**方法设计**：
1. 将图像美学评价（IAA）知识迁移至视频美学评价
2. 预训练 IAA 评价头生成帧级美学先验，识别关键时刻
3. 美学节奏编码器建模审美质量随时间的连续演化
4. 动态门控融合机制优化整体评价结果，增强分布鲁棒性

骨干网络为冻结的 ViT，仅训练少量参数。在 VADB（域内）和 DIVIDE-3K（跨域）上取得 SOTA。
