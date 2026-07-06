# 多 Agent 不是虚拟公司：从 Anthropic 五种模式看信息流怎么设计

## Ch01.1025 多 Agent 不是虚拟公司：从 Anthropic 五种模式看信息流怎么设计

> 📊 Level ⭐⭐ | 3.5KB | `entities/多-agent-不是虚拟公司从-anthropic-五种模式看信息流怎么设计.md`

# 多 Agent 不是虚拟公司：从 Anthropic 五种模式看信息流怎么设计

**来源**: 架构师

**发布日期**: 2026-04-18

**原文链接**: https://mp.weixin.qq.com/s/fMPSK00Lxb0uv90sun_BYQ

---

# 

架构师（JiaGouX）

我们都是架构师！

架构未来，你来不来？

这几天 Anthropic 发了一篇文章，专门讲多 Agent 协调模式。

标题看起来很朴素：《Multi-agent coordination patterns: Five approaches and when to use them》。五种模式、适用场景、什么时候该从一种演进到另一种。

如果只把它当成一篇“多 Agent 五种架构总结”，其实有点可惜。

我读完更强烈的感觉是：Anthropic 真正想提醒的，是另一件更工程化的事：

多 Agent 的难点不在于给模型分配几个角色，而在于把任务拆到合适的上下文边界里，再让信息流、验证和停止机制能稳稳接住。

这和最近社区里很流行的一类说法正好相反。

很多多 Agent 教程喜欢把系统画成一个 虚拟公司 ：一个 Agent 当产品经理，一个当架构师，一个当开发，一个当测试。图很好看，故事也很好懂。CrewAI、MetaGPT 这类框架之所以积累了大量用户，很大程度上就是因为这个直觉太好解释了。

但有意思的是，Anthropic、OpenAI、Google 三家在构建自己的生产级 Agent 系统时，没有一家采用“虚拟公司”模式。

Anthropic 用的是 orchestrator-worker 并行探索，OpenAI Codex 靠的是 spec 文件 + skills + compaction，Google Gemini CLI 走的是 Conductor 扩展 + 持久化 Markdown 文件。

三家的做法虽然不一样，但都没有出现“PM Agent 交给 Dev Agent 再交给 QA Agent”这种流水线。

这或许不是巧合。

LLM 系统真正卡住的地方，往往不是“岗位不够齐”，而是上下文丢失、信息传递失真、验证标准模糊、循环不收敛。

所以今天不打算把 Anthropic 的文章只是翻译一下。我更想借它来理清一个思路：

多 Agent 架构不是组织架构，首先是信息架构。

## 太长不看版

- • Anthropic 总结了五种多 Agent 协调模式：生成-验证、编排-子 Agent、Agent 团队、消息总线、共享状态。

- • 这五种模式表面是在讲“Agent 怎么协作”，底层其实是在回答三个问题：上下文边界怎么切，信息怎么流，系统什么时候停。

- • 大多数团队未必需要一上来做复杂的“虚拟公司式 Agent 团队”。从单 Agent 或编排-子 Agent 开始，通常更稳。

- • Generator-Verifier 的关键不是“两个 Agent”，而是可检查的验收标准。没有标准，验证 Agent 只是一个更贵的橡皮图章。

- • Orchestrator-Subagent 适合短任务、独立探索和清晰边界。Claude Code 的 subagent 就是典型例子。但它会遇到信息瓶颈。

- • Agent Teams 适合长期、独立、可分区的任务，比如大代码库迁移。前提是任务边界足够硬，否则多个 worker 会互相打架。

- • Message Bus 适合事件驱动流水线。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/多-agent-不是虚拟公司从-anthropic-五种模式看信息流怎么设计.md)

---

