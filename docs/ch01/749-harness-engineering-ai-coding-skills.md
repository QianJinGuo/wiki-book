# Harness Engineering：长程自动化 AI Coding / Skills 开发实践

## Ch01.749 Harness Engineering：长程自动化 AI Coding / Skills 开发实践

> 📊 Level ⭐⭐ | 6.0KB | `entities/harness-engineering长程自动化-ai-coding-skills-开发实践.md`

# Harness Engineering：长程自动化 AI Coding / Skills 开发实践

# Harness Engineering：长程自动化 AI Coding / Skills 开发实践

---
source: wechat
source_url: https://mp.weixin.qq.com/s/mSjb20PDsfiK88C9AQB7og
ingested: 2026-07-05
source_published: 2026年6月9日 20:43
---

# Harness Engineering：长程自动化 AI Coding / Skills 开发实践

这是2026年的第21篇文章

 本文阅读时间：约20分钟 

# 01

# Harness Engineering 是什么？

Harness Engineering，本质上是在为 Agent 构建一个能够持续感知、持续反馈、持续优化的自主演进环境。

它是通过约束机制、反馈闭环、工作流编排、效果评估以及持续优化循环等能力，将 Agent 的运行过程纳入一个可观测、可控制、可迭代的系统工程框架之中。目标是在长程和复杂场景下，让 Agent 不仅能够执行任务，更能够感知执行状态、评估执行效果、捕捉优化方向，并据此不断调整策略，从而实现自我迭代并交付高质量结果。

Harness Engineering 和 Prompt Engineering、Context Engneering 并不是互斥的概念，而是发展阶段和嵌套关系，更像是随着 AI 能力的提升、基础设施的完善，一种重要性和关注点自然而然地升维。

02Harness Engineering 聚焦方向

当前 Harness Engineering 的主要实践基本在 AI Coding （但任何一个 AI 应用本身都包含 harness）领域，2026年2月底开始受到广泛关注，OpenAI 、 Anthropic、Stripe 等在 2、3 月份都做了一些相关实践分享。总结下来，大家的实践重点聚焦以下几个方向：

#### 

上下文控制

Agent 应能够恰当的获取需要的上下文，不多不少。

专业 Agent 分工协作

不同 Agent 专注于特定领域、接受特定上下文， 优于一个关注全链路的通用 Agent。

评估反馈

真正拉开差距的，是为 agent 配备一个足够挑剔、能够感知运行环境的评估模块，它知道明确目标，同时知道怎么客观结构化的评估结果。

结构化执行回路 

适度编排 Agent 执行工作流，在关键节点增加人类审查，重点关注目标和结果的正确性。

应用环境对 Agent 的可读性

持续把应用本身（UI、日志...）暴露给 Agent，变成 Agent 可检查、可验证、可修改的形态。

# 03

# 我们的实践

我们在 AI Coding 和 Skills 开发两个方向上进行了探索。

设定两个核心目标

#### 1.Agents 长时自主运行，自我反馈、自我改进，产出稳定可靠。

更深入的自动化来处理复杂任务，反馈和优化循环真正转起来（3小时以上不中断），让睡前设定目标醒来验收工作成为可能。否则如果 Agent 经常执行中断，需要人类介入，那人类很难高并发的处理不同的任务，就会落入大家调侃的现象： Agent 运行时刷刷手机，然后不时抬头看看屏幕，检查“它还在干活吗”“要不要介入”。

#### 2.人类只需深度参与设定目标和验收结果；无需过程的100%掌控，更多校验约束的遵循。

长时自任务 Agent 的产能爆炸，人类的工作负荷基本不可能校验 Agent 的每一项产出。人类应集中精力校验最初的目标和最终结果的准确性。过程中的细节校验交给专门的 Agent，给出报告，人类更多校验约束遵循情况，有没有遵循架构规范、接口规范等等。

这很像人类团队协作中管理者和员工的工作模式：管理者关注任务的两端，偶尔看下过程；如果员工是个新手就多看看，员工是成熟的老手就少看看。

这要求人类要转变思维，成为 Agents 的管理者，放弃一些过程掌控感。

比如 code review，AI 几乎短时间编写了100%的代码，我们 review 代码中的每一个细节几乎不可能，人类的阅读理解速度是线性的，而 AI 的生成速度是指数级的，像以前一样去 code review，那我们无疑会成为人 + AI 协作中的瓶颈。

回想一下，大模型时代之前我们为什么总是强调 code review ？就是因为 code review 总做不好；为什么做不好？因为读别人写的代码太耗精力。

读懂别人的代码，相当于跟着别人的思路在我们脑子里再写一遍。很多时候开发者耗时许久才思考出的一个巧妙解法（就几行莫名其妙的代码），作者本人不仔细讲一遍的话，他人几乎理解不了。没有背景对齐，review 只能

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering长程自动化-ai-coding-skills-开发实践.md)

---

