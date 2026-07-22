---
title: "TMAP 平台图生视频推理加速实践"
source_url: "https://mp.weixin.qq.com/s/H7KdJqOINbyDRmVh71ikSg"
source_account: "大淘宝技术"
author: "用户&内容技术"
ingested: 2026-07-22
type: raw-article
tags: [video-generation, inference-acceleration, deepspeed-ulysses, sageattention, quantization, dpcache, taobao]
review_value: 7
review_confidence: 8
review_vxc: 56
review_decision: raw-only
sha256: 58b1b9584d1f6733b21cdccbcce3589a914a46387598bdd3d7d916dbb9be635a
---

# TMAP 平台图生视频推理加速实践

> **来源**：大淘宝技术，2026-07-22
> **评分**：v=7, c=8, v×c=56 → **Raw only**（高质量工程实践，核心 Agent/Harness 主题外，暂存）

大淘宝技术 TMAP 平台与"淘宝法象"视频生成算法团队合作，从多卡并行、Attention 加速、量化加速、缓存加速四方向优化图生视频推理。

## 核心成果

- **4.87×** 推理加速（除多卡外）
- 推理成本压缩至 **< 0.15 元/秒**
- 生成质量肉眼不可区分

## 技术方案

### 多卡并行：DeepSpeed Ulysses 序列并行
- 将线性层和注意力层计算量均分到所有设备
- 通信重叠优化：重构 all2all 通信流程与前序计算重叠
- 选型依据：降低单条视频延迟、易于结合量化/缓存

### Attention 加速：SageAttention
- 结合 Ulysses 序列并行的 head 级并行特性
- 层间选择性量化方案，保持视频质量无损

### 量化加速：W8A8/W8A16 混合量化
- 解决显存溢出问题
- 消除 CPU Offload 开销

### 缓存加速：DPCache
- 自研基于**动态规划与路径感知成本张量**的缓存方案
- 比 TeaCache 和 TaylorSeer 更优的全局最优调度与加速效果
