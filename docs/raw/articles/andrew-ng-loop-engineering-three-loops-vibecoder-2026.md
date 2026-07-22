---
title: "吴恩达这次把 Loop Engineering 讲清楚了"
source_url: "https://mp.weixin.qq.com/s/PXje68ENgNi5tuGdEeZ8SA"
publish_date: 2026-07-01
tags: [wechat, vibecoder, loop-engineering, andrew-ng, feedback-loop, product-development]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5
---

# 吴恩达这次把 Loop Engineering 讲清楚了

来源：VibeCoder / Vibe编码
解读 Andrew Ng 在 The Batch 上关于 Loop Engineering 的文章

## 三层产品开发反馈循环

Andrew Ng 把 Loop Engineering 拆成三层产品开发反馈循环：

### 内层：Agentic Coding Loop（分钟级）
给 Agent 产品规格 + evals，Agent 就能写代码、跑测试、看页面、修 bug，继续下一轮。这个循环可以很快，几分钟一轮。

**停止条件至关重要**：
- 循环没有 eval，就不知道什么时候该停
- 没有预算（时间/token/尝试次数），就可能一直尝试
- 没有验证者，就会把自己的结论当完成
- 没有人读 diff，理解债会越滚越大

### 中层：Developer Feedback Loop（小时级）
开发者定期看当前产品，改功能、改交互、改视觉、改用户流，再把新的判断变成规格交给 Agent。节奏通常是几十分钟到几个小时。

### 外层：External Feedback Loop（天/周级）
真实用户、alpha 测试、生产数据、A/B 测试反过来影响产品愿景。这个循环慢得多，可能要几天甚至几周。

## 核心论点

### Context Advantage（上下文优势）> Taste（品味）

Andrew Ng 把人的贡献重新定义：不是"品味"，而是"上下文优势"——人知道用户是谁、业务约束、产品场景、哪些需求是噪音。这些上下文，当前 AI 系统不会天然知道。

### Prompt Engineering → Loop Engineering

以前重点在 prompt：描述需求、拆任务、减少误解。Loop Engineering 关注的是：能不能让系统自己提出下一步、自己执行、自己验证、自己记录状态，然后在需要人判断时停下来。

### 人的价值换了位置

人不该只做手工 QA。现在 Agent 自测能力上来后，人继续只盯bug就浪费了。更该看的是：这个功能要不要做、UI是否顺手、用户流有没有绕、规格是否写错了。

## 实践建议

1. 先选一个能验证的窄任务——写清楚输入、输出、边界、验收方式
2. 把测试、lint、浏览器检查、截图检查、日志断言接上去
3. 给预算——时间、token、尝试次数，超预算就停
4. 执行者和验证者拆开——验证者不能只复述执行者的结论
5. 中层设节奏——每半小时或每两小时审一次
6. 外层反馈尽早开——找几个真实用户比本地继续修细节更有信息量
