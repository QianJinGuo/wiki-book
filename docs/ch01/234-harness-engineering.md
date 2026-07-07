# 开启Harness Engineering探索之旅

## Ch01.234 开启Harness Engineering探索之旅

> 📊 Level ⭐ | 2.3KB | `entities/开启harness-engineering探索之旅.md`

# 开启Harness Engineering探索之旅

**来源**: 腾讯技术工程

**发布日期**: 2026-06-29

**原文链接**: https://mp.weixin.qq.com/s/uhc7_-0Vm_cw9p17b9VyJA

---

作者：fanniemeng

过去两年，AI Coding 从"能写出能跑的代码"走到"能放手让它写一整段功能"。但把这个能力放进真实业务、放进多人协作、放进存量系统里跑时我们发现一件怪事——AI 写得越快，整体节奏并没有同步加快。盘点下来，单看"AI 写出来的代码占比"这个数字一路走高，可真正落到版本节奏上，提效却远没有这个数字好看。出码率和提效之间，裂开了一道缝。从 OpenAI Codex 团队那篇 Harness 工程博客里反复强调的一个观察——"早期进展比预期慢，并不是因为 Codex 不具备相应的能力，而是因为环境的规范不够明确"——开始，整个行业都在补同一件事：给模型搭一套能稳定干活的"工作环境"。这一层最近被业界命名为 Harness Engineering——它不是教模型怎么回答，而是设计模型怎么工作。 在这里，也分享下我们的探索之旅，是踩过的坑、做过的取舍、和到现在还没解决的问题。

### 序章：Harness Engineering 是怎么"结晶"出来的

0.1 先把话说清楚：Harness 到底是什么

Harness Engineering 一句话能讲完：

不是教模型"怎么回答"，而是设计模型"怎么工作"。

用一个正在被广泛引用的等式表达就是：

Agent = Model（模型）+ Harness（模型外的运行框架）

命名者 Mitchell Hashimoto 给出的定义更朴素，也更直指核心：

"It is the idea that anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again."—— 每当你发现 Agent 犯了一个错，你就花时间在它外面工程化一个方案，让它永远不再犯同样的错。

它把工程关注点从"模型 这一句 说得对不对"，挪到了"模型这

---

