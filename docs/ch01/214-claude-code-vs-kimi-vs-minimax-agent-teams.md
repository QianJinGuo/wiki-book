# Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

## Ch01.214 Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

> 📊 Level ⭐ | 2.5KB | `entities/claude-code-vs-kimi-vs-minimaxagent-teams-到底拼的是什么.md`

# Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

**来源**: 科技充电站

**发布日期**: 2026-05-21

**原文链接**: https://mp.weixin.qq.com/s/uYPjM9ldS7-fkNKGAk1_mA

---

大家好，我是行小招。

最近 Agent Teams 这个概念又热起来了，Claude Code 在推 agent teams，Kimi K2.5 直接把 Agent Swarm 做成了一个模型能力，MiniMax Mavis 则把 Owner、Worker、Verifier 这一套做成了产品里的协作机制。

我看完这几家的实现后，体感很明确：Agent Teams 不是让一堆 agent 坐在一起开会，也不是把 prompt 写成“你是架构师、你是测试、你是安全专家”这么简单。

真正有价值的 Agent Teams，拼的是外面那层 harness，说白了：模型负责聪明，harness 负责管住聪明，没有 harness，多 agent 很容易变成一群很贵的复读机。

我现在用 AI 写代码、查资料、做自动化，最烦的不是它不会，而是它跑着跑着就失忆、停住、跑偏。

一个复杂任务给出去，本来有 7 个步骤，它做到第 3 个就开始问“是否继续”，这不是它不努力，而是单 agent 对“任务到底结束没结束”没有物理感知，只能在上下文里猜。

更麻烦的是长任务：日志、网页、报错、搜索结果一多，context 就开始腐烂，前面约束过的东西，它后面可能忘了，前面定好的风格，它后面可能变了，尼玛就像一个人加班到凌晨三点，嘴上说自己没问题，手已经开始乱敲了。

还有一个很现实的体验：如果 agent 接在 IM 或 IDE 里，用户想要的是秒回，后台任务想要的是几分钟甚至几十分钟，单 agent 把这俩线程混在一起，就很容易出现两种结果，要么秒回一堆废话，要么半天没动静。

所以 Agent Teams 的第一性问题，不是“能不能多开几个 agent”，而是：谁来决定任务怎么拆，谁来决定什么时候停，谁来隔离上下文，谁来验收结果。

多 agent 的价值，不在于人多，而在于能不能把混乱变成流程。

## Harness 才是主角

这里有个很关键的公式：Agent =

---

