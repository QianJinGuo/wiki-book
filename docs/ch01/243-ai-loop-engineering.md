# 一文看懂 AI 编程智能体工程化新范式：Loop Engineering

## Ch01.243 一文看懂 AI 编程智能体工程化新范式：Loop Engineering

> 📊 Level ⭐ | 2.3KB | `entities/一文看懂-ai-编程智能体工程化新范式loop-engineering.md`

# 一文看懂 AI 编程智能体工程化新范式：Loop Engineering

**来源**: 技术极简主义

**发布日期**: 2026-06-12

**原文链接**: https://mp.weixin.qq.com/s/2W45sMEP282_Kcz8AOYOYg

---

过去两年，我们谈 AI 编程，最常说的词是 Prompt Engineering。

怎么把需求讲清楚？怎么给足上下文？怎么让 AI 一次生成更接近可用的代码？这些问题当然重要。但当 AI 编程智能体越来越强，真正的控制点正在发生变化。

以前，我们像是在一轮一轮地「指挥」AI：你写一句提示词，它回一段代码；你指出问题，它再改一版。整个过程里，人始终站在每一轮交互的入口处。

现在，一个新的思路开始出现：与其每次都手动提示智能体，不如设计一个系统，让这个系统去发现任务、分配任务、检查结果、记录状态，并决定下一步。

AI 编程的关键能力，正在从「写好提示词」升级为「设计可持续运转的智能体工作系统」。

这个工程化新范式，就是最近被频繁讨论的 Loop Engineering 。

## 为什么 Prompt Engineering 不够用了？

Peter Steinberger 最近说过一句话：

You shouldn’t be prompting coding agents anymore. You should be designing loops that prompt your agents.

大意是：你不应该再只是提示编程智能体了，你应该设计能够提示智能体的循环。

Claude Code 负责人 Boris Cherny 也表达过类似观点：

I don’t prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops.

这两句话背后，其实指向同一个趋势：AI 编程协作的重心，正在从「人反复输入 Prompt」转向「人设计一个持续运行的工作循环」。

为什么会有这个变化？

因为真实的软件开发，从来都不只是一次问答。它包含需求澄清、方案设计、代码修改、测试验证、错误修复、文档更新、代码审查、发布

---

