---
title: "RSIBench：探索 Agent 自我改进的新基础设施"
source_url: "https://www.xiaohongshu.com/discovery/item/6a699801000000000f015440"
source_site: "xiaohongshu.com"
source_account: "VibeHooper"
author: "VibeHooper"
ingested: 2026-07-31
sha256: "60a4f13ea76979a66db818b0f7c848bd2cf1ff52f0d2093f2627be738b17d789"
type: raw-article
tags: [rsi, recursive-self-improvement, benchmark, autoresearch, post-training, synthetic-data, infrastructure]
---

# RSIBench：探索 Agent 自我改进的新基础设施

最近 Agent benchmark 进入了一个越来越拥挤的阶段。

- 一类是 **Frontier-style benchmark**：题目非常难，但背后需要大量人工设计、维护和标注。
- 另一类是 **Post-training benchmark**：更关注真实任务和基础设施，让模型自己探索、学习和优化。

我们更看好第二条路线。但我们发现，目前很多 post-training benchmark 还有两个问题：

1. 很多本可以作为 service 提供的环境，仍然被设计成静态任务。这不仅浪费模型算力，也容易让模型学会 hack benchmark，而不是真正提升能力。
2. 当环境没有充分隔离时，优化很容易退化成"刷规则"，而不是能力进化。

## RSIBench 核心想法

把训练、评估、服务环境全部拆开，通过 API 提供给 agent，让 agent 可以像研究者一样自由探索：

- 改数据
- 改训练方法
- 改模型结构
- 改优化算法

最终目标是构建一个 autoresearch 平台，让 AI agent 能够持续实验和迭代自己的能力。

## 首个场景：RSIBench-Data

先从高 ROI 场景开始：RSIBench-Data 让 agent 自动探索合成数据生成、数据优化和 post-training pipeline。

一个有意思的实验：我们尝试让 K26 训练 K26（32k instruct）。

结果发现：
- ✅ 模型确实可以优化自己的数据生成流程和数据格式
- ❌ 但还无法稳定超过最初的 base model

这也说明：真正意义上的 Recursive Self-Improvement（RSI）还很远，但探索方向正在逐渐清晰。

## 链接

- Paper: https://arxiv.org/abs/2607.25886
- Code: RSIBench-Data
- Web: http://rsibench.co/
