sha256: 31efdbac981c407c64e137e4cf08854171f30ff168c591bbcffdfc52b6675a62
---
title: "Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环"
source: wechat
url: https://mp.weixin.qq.com/s/z3TtIusf6nS6py0FLYplhQ
publish_date: "2026-07-01"
ingest_date: "2026-07-01"
vxc: 72
stars: 4
---

# Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环

今天，Anthropic 发布了 Fable 5，它在几乎所有测试过的基准上都达到顶尖水平，在软件工程、知识工作、科学研究和视觉任务上表现尤其出色。

image.png

任务越长、越复杂，Fable 5 相比其他模型的领先幅度就越大。

发布如此强大的模型也伴随着风险。如果没有防护措施，Fable 5 在网络安全等领域的能力可能遭到滥用，造成严重损害。

针对少数几类主题的查询，系统会改用 Claude 次强的模型 Opus 4.8 来响应。

Fable 5 的防护机制会检测与网络安全、生物与化学、蒸馏相关的请求。每当发生回退时，用户都会收到提示，平均发生在不到 5% 的会话中。

Claude 会继续完善这些防护措施，减少误判。

同时也面向一小部分网络防御人员和关键基础设施提供方推出 Claude Mythos 5。Mythos 5 与 Fable 5 共享同一个底层模型，但在部分领域放宽了防护限制。

很快，计划通过更广泛的可信访问计划扩大 Mythos 5 的访问范围，用于防御性网络安全工作和生物医学研究。

Claude Fable 5 今天已在所有平台可用。Claude Mythos 5 目前仅限 Glasswing 合作伙伴使用，直到 Anthropic 扩大可信访问计划。

接下来是官方工程师 @RLanceMartin 介绍如何设计循环的教程

##  使用 Fable 5 设计循环

像 Claude Fable 5 这样的 Mythos-class 模型，已经改变了 Anthropic 许多人的工作方式。我想分享两个技巧，帮助你更好地使用这类模型。

** 自我纠正循环  **

最近大家对循环很感兴趣。  @bcherny  [1]  提到过  [2]  ，“我的工作就是写循环”。让模型围绕评测进行迭代优化，是提升任务表现的常见做法：Claude Code 里的  /goal  [3]  和  Claude Managed Agents 里的 Outcomes  [4]  ，都是能让你把这套通用方法应用到具体任务上的原语。

正如我们在  提示词指南  [5]  中提到的，Fable 5 擅长在循环中自我纠正。设计良好的目标或评分标准，会给 Claude 的运行环境加入反馈。这样 Claude 就能运行任务，通过目标或评分标准收集反馈，自我纠正，并持续推进，直到满足目标或评分标准为止。

Image

我分享一个用来测试 Fable 的玩具示例：  Parameter Golf  [6]  是一个开源 ML 工程挑战，目标是在 8xH100 上于 10 分钟内训练出最佳模型，并且模型产物要控制在 16MB 内。

它有点像  @karpathy  [7]  的  autoresearch  [8]  项目：它测试的是一个 Agent（智能体）编辑基础训练代码的能力，包括修改单个  ` train_gpt.py  ` 文件、启动训练、轮询日志、读取分数，并决定下一步该运行什么实验。

我用  Claude Managed Agents  [9]  （CMA）在这个挑战上比较了 Fable 5 和 Opus 4.7。CMA 提供  Agent 运行框架以及托管沙箱  [10]  ，因此很适合 Fable 5 这类长时间运行任务。针对 Parameter Golf，我让 CMA 通过  自托管沙箱  [11]  访问 8xH100 GPU。

一个微妙但重要的点是：由谁来做评判很关键。我们看到，模型在评判自己输出时会遇到问题。Prithvi Rajasekaran  在这篇文章中  [12]  写过这一点。

Image

我们发现，对于 Fable 5，验证器子 Agent  通常优于  [5]  自我批判，因为评分发生在一个独立的上下文窗口中。CMA 里的  Outcomes  [4]  会通过生成一个评分子 Agent 来处理这件事。

每次测试中，我都提供一份评分标准文件，其中包含九条可验证的标准，例如运行基线、运行 20 个实验等。然后，我让 Parameter Golf 最多运行 8 小时。Outcomes 评分器会确认所有实验标准都已满足，才允许 Claude 停止工作。

Fable 5 对训练流水线的改进幅度约为 Opus 4.7 的 6 倍。如果把实验分为两类：结构性实验（如架构改动）和标量实验（如调整常数），Fable 5 更倾向于押注更大的结构性改动。它还表现出很强的韧性，例如在量化回归中坚持推进，最终取得了最大收益。

Opus 4.7 的第一次实验带来了一点小收益，之后几乎所有实验都沿着同一个模板推进：调整一个标量、测量结果，如果为正就保留。

** 记忆  **

记忆是  Fable 擅长的另一个领域  [13]  。我们可以把它看成跨会话的外层循环：Claude 在一次会话中写入记忆，这些记忆可以在后续会话中检索出来。

@pgasawa  [14]  和团队最近发布了 Continual Learning Bench 1.0，所以我想用它来对比 Fable 5 和更早的模型。

> 5 月 5 日
>
> 今天，我们发布 Continual Learning Bench 1.0：第一个用于衡量 AI 系统在真实线上环境中如何持续进步的基准。目前的基准都假设模型是无状态的，每个样本彼此独立，一旦系统完成一个任务，它就会像……

我比较了 Fable 5、Opus 4.7 和 Sonnet 4.6 在该基准中一项任务上的表现：任务要求 Agent 在可以访问 SQL 数据库的情况下，依次回答一系列问题。每个问题都是一个独立的 Agent 会话，并且系统会提供记忆。

为此，我使用了带有  记忆功能  [15]  的 CMA，它让每个 Agent 都能访问一个可跨会话共享的挂载文件系统。

Image

在这项任务中，有效使用记忆通常需要经历一个递进过程：① 失败，答错并记录下来；② 调查，在继续之前弄清楚为什么错；③ 验证，把诊断变成经过检查的事实；④ 提炼，把验证结果转化为通用规则；⑤ 查阅，读取规则，而不是重新推导一遍。

Sonnet 4.6 大约停在 ① 阶段：它的存储内容是一串失败笔记和未验证的猜测，例如”也许应该用 prc，不该用 prc_usd？”。它很少查阅之前的笔记。要提升表现，需要加入任务特定的记忆指令。

Opus 4.7 大约停在 ③ 阶段：它会创建一个带有不确定性标记的 schema 参考，例如”prc 可能以美分计价？验证一下。”，但验证覆盖率很低，只覆盖 7-33% 的问题，中位数约为 17%。

Fable 5 往往能完成这个递进过程：在最强的一些运行中，验证覆盖率最高达到 73%，即 30 个问题中的 22 个，并且它会把学到的知识提炼成有助于未来任务的通用规则。

与其直接提示和引导 Fable 5，不如设计循环，让模型根据环境反馈自我纠正（例如通过 /goal 或 Outcomes），并管理自己的上下文（例如通过记忆）。

我这里只分享了几个自己做过的小规模实验，但建议你亲自用 Fable 5 测试有挑战性的任务，并用循环来做自我纠正或记忆管理。

要开始使用，可以阅读我们的  文档  [5]  ，或者询问最新版 Claude Code。它可以使用我们内置的  /claude-api  [16]  技能，告诉你 Fable 5 的相关内容，例如提示词最佳实践、/goal、Claude Managed Agents 或其他 API 功能。

##  参考阅读

* [ AI 真的跑进业务了吗？GIAC 2026 深圳站 15 大专题全日程来了 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565274&idx=1&sn=bd7a6eca65363370092d937874decd0a&scene=21#wechat_redirect>)
* [ 为什么 2026 年真正重要的是 Harness Engineering？ ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565270&idx=1&sn=87cf28e201330046e90da0afd70925d8&scene=21#wechat_redirect>)
* [ 从 Harness 到动态工作流：Claude Code 多智能体任务编排的新范式 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565245&idx=1&sn=8eb02e3dd4aec584f75ec752c6919313&scene=21#wechat_redirect>)
* [ 自我进化的 Agent Skill：微软 SkillOpt 到底解决了什么？ ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565230&idx=1&sn=de72009ff180a0d1694f2b0c7d4d7260&scene=21#wechat_redirect>)

####  References

1. @bcherny:  https://x.com/@bcherny
2. 提到过:  https://x.com/sairahul1/status/2064279904989147577?s=20
3. /goal:  https://code.claude.com/docs/en/goal
4. Claude Managed Agents 里的 Outcomes:  https://platform.claude.com/docs/en/managed-agents/define-outcomes
5. 提示词指南:  https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
6. Parameter Golf:  https://github.com/openai/parameter-golf
7. @karpathy:  https://x.com/@karpathy
8. autoresearch:  https://github.com/karpathy/autoresearch
9. Claude Managed Agents:  https://platform.claude.com/docs/en/managed-agents/overview
10. Agent 运行框架以及托管沙箱:  https://www.anthropic.com/engineering/managed-agents
11. 自托管沙箱:  https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes
12. 在这篇文章中:  https://www.anthropic.com/engineering/harness-design-long-running-apps
13. Fable 擅长的另一个领域:  https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
14. @pgasawa:  https://x.com/@pgasawa
15. 记忆功能:  https://platform.claude.com/docs/en/managed-agents/memory
16. /claude-api:  https://github.com/anthropics/skills/tree/main/skills/claude-api

如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 GIAC 深圳站值得关注。这次大会会集中讨论智能应用开发、架构演进，以及来自一线实践的经验与案例。

识别二维码可申请大会体验门票，点击
