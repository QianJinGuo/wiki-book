---
title: "AutoResearch 下一阶段：异步大规模多 Agent 协作"
created: 2026-05-28
updated: 2026-05-28
type: raw
tags: [autoresearch, multi-agent, karpathy, async-collaboration, AGI]
sources:
  - https://mp.weixin.qq.com/s/ThK4Kn54UN6cHDkX6JgkGg
review_value: 8
review_confidence: 8
sha256: 5b8c9915f029c8b184dd0bae297e6e00f1eb44563b270037d4e324fcefab86c5
---

## 核心内容

### AutoResearch 当前状态
- Karpathy 把 autoresearch 项目整理成独立精简仓库
- 核心：nanochat LLM 训练代码压缩到单 GPU、单文件、约 630 行
- 运行逻辑：人负责迭代 prompt（.md 文件），AI agent 负责迭代训练代码（.py 文件）
- 目标：让 agent 在零人工介入下无限期推进研究
- 每次 LLM 训练恰好跑 5 分钟，agent 在 git feature branch 上自主循环，持续积累 commit
- 仓库：https://github.com/karpathy/autoresearch

### 下一阶段：异步大规模 Agent 协作
**目标**：不是模拟一个博士生，而是模拟一个由博士生组成的研究社区。

现有代码是同步的，沿单一研究方向串行增长 commit。但原始仓库更像一颗种子——从中可以长出来自各个 agent、面向不同研究方向或不同计算平台的 commit。

**核心问题**：Git/GitHub 有一个隐含假设——存在一个主分支，其他分支只是临时分叉出去再合并回来。但在这个场景里，你根本不想合并，只想吸纳和积累各条分支上的 commit。

**轻量原型方案**：
- agent 把一夜运行的结果整理成摘要发到 GitHub Discussion
- 或者开一个 PR 保留精确 commit 记录
- 下一个 agent 用 GitHub CLI 读取 Discussion 和 PR 获取灵感，跑完自己的研究后，再贡献一篇发现报告回去

链接：https://github.com/karpathy/autoresearch/discussions/43

Karpathy 原话："这是一个比 autoresearch 仓库本身更大的想法——agent 原则上可以轻松管理和协作处理跨任意分支结构的数千个 commit。当智能、注意力和执行力不再是瓶颈，现有的协作抽象会承受越来越大的压力。"

### 附：AGI 时间线赌注
- Hyperbolic 联合创始人兼 CTO Yuchen Jin 曾和马斯克打赌：如果 AI 在做 AI 研究和工程方面能超过 Andrej Karpathy，那就算 AGI，他赌这件事 2026 年不会发生
- 现在他说自己开始觉得可能要输了
- 因为 Andrej Karpathy 可能已经构建出了 AGI 原型——代码不重要，重要的伟大的构想
- 现在问题成了成千上万的 Agent 如何协作，或许 2026 年会有答案

### 暴力搜索种子训练神经网络脑洞
在那个神经网络架构下，验证损失的全局最小值就藏在权重空间某处。而在整数空间里，某个随机种子可以直接把它给你。用暴力搜索种子来训练神经网络——Karpathy 觉得这个思路值得被正式化。