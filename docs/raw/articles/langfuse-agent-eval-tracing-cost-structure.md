---
title: "做Agent评测的几个反直觉感悟"
source_url: "https://www.xiaohongshu.com/explore/6a14f1040000000008025eea"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, agent, eval, tracing, langfuse, cost]
ingested: 2026-07-02
sha256: f8a3c7b2e7d1f4a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
---

# 做Agent评测的几个反直觉感悟

最近拿 langfuse 做 Evals 遇到了点棘手的事，每次都是从用户的 badcase 入手去做归因，但是这些 bad case 通常都有这样一些特征：极端边界、模型幻觉、技术修复 ROI 高、偶发。而且那么长的 tracing 链条，尽管修好了这些 badcase 还可能产生更高的 token 成本…

然后系统地扒了下 langfuse 源码，梳理了下产品经理看 Tracing 的一些方法论：

**Key Takeaways：**

一个 Agent 如果为了给出更稳的答案，每次都做 8 次检索、3 次 rerank、5 次模型调用，demo 会显得很聪明，线上却可能变成不可承受的成本结构。Trace 能把这个问题暴露出来：不是总成本高，而是哪一个 Observation 让成本失控；不是整体慢，而是哪一步阻塞了用户等待。

这会带来一个反直觉判断：**有些质量优化看似提升答案，实际是在破坏产品可规模化性。**

- 把更多上下文塞进 prompt，短期可能提升准确率，但 token 成本和 latency 会上升
- 引入更强 judge 或更多 self-check，也可能让体验等待变长

Tracing 的价值，是让这些取舍不再停留在架构师脑中，而变成产品评审中可以讨论的线索。
