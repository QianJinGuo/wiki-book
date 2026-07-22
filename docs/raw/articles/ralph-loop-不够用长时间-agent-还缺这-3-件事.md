---
title: Ralph Loop 不够用：长时间 Agent 还缺这 3 件事
source_url: https://mp.weixin.qq.com/s/2ql-DDr2d4bemwq3dr0ElA
publish_date: 2026-05-14
tags: [wechat, article, claude, openai, gpt, agent, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: d2886be0f12110579475e6ac80ab91f97ae9d61df7acc026f0eb5f22c4d085ee
---
# Ralph Loop 不够用：长时间 Agent 还缺这 3 件事
导读：Jarrod Watts 作为 Monad 首席 AI 工程师，详细分析了 Codex /goal 长运行 agent 机制，发现其本质是重复提示循环加 SQLite 跟踪，但易导致歧义随迭代 compounding，影响最终输出质量。
作者提出了一种优化工作流：前期通过 “interview/grill-me” 阶段大幅降低任务模糊性，将目标拆解为里程碑，再用主编排器+ sub-agent（实现者+评审者）模式，并维护 GOAL.md、STANDARDS.md 等持久化记忆文件实现跨上下文连续性。
> ** 作者介绍  ** ** Jarrod Watts  ** 是 Monad 首席 AI 工程师（Lead AI Engineer），专注 AI agent 系统、长运行编码 agent 及开发者工具。曾从事全栈开发与 DevRel，热衷开源分享实践经验，GitHub 活跃于 Claude/Code AI 项目，帮助开发者构建高效自主 agent 工作流。
Goal
过去几个月，我一直在用长时间运行的 agent 做各种支线任务实验，其中包括  攻克 Anthropic 的招聘挑战  [1]  。
我逐渐意识到，「长时间运行的 agent」之所以有效，原因非常直接，它们花了更多 token。或者，如果你是研究员，可以说它们在「扩展测试时计算」。
这听起来可能有点蠢，但它确实有效。举个例子，在 BrowseComp 基准上，Sonnet 4.6 多花 10 倍 token，分数提高了大约 10 个百分点：
第 45 页：  https://www-cdn.anthropic.com/bbd8ef16d70b7a1665f14f306ee88b53f686aa75.pdf  [2]
不过，当你的任务所需上下文远远超出 agent 的上下文窗口容量时，这套办法就开始失效了。
为了解决这个问题，今年早些时候我们看到了类似 Ralph Wiggum loop 的东西。它最初的形式，其实就是把同一个 prompt 放进循环里反复运行。
上周，Codex 团队发布了  ** goals  ** ，这是一个为长时间运行 agent 内置的系统，可以连续运行几天，直到达成你想要的目标。
image.png
> 5 月 1 日
>
> /goal 也进入了 Codex CLI 0.128.0。这是我们对 Ralph loop 的理解：让一个 goal 跨越多轮持续存在。在达成之前不要停。由我的同事、OpenAI 导师 Eric Traut 构建，也就是 Pyright 那位。能每天一起工作的 GOAT 之一。
我对此非常兴奋，毕竟我也很喜欢 GPT 5.5，但实际用下来结果让我相当失望。
由于 Codex 完全开源，我们可以直接看到它底层到底怎么工作。我确实这么做了。下面是我学到的东西，以及为什么我认为自己的长时间运行 agent 工作流更好。
###  Codex Goals 是怎么工作的
如果你还没试过，goal 试图用一发完成更有野心的任务。你可以在 Codex CLI 里运行  ` /goal <your goal> ` ，让它连续跑几个小时，甚至几天。
在底层，goals 功能使用了一个简单的 SQLite 设计。Codex 会创建一张  ` thread_goals  ` 表，把你创建的每个新 goal 存成一行。每一行包含该 goal 的目标、ID、状态，以及一个可选的 token 预算。
当 Codex 开始为了达成你的 goal 而构建时，它会使用一些新工具，包括  ` get_goal  ` 和  ` update_goal  ` ，用来记录进展，并更新数据库里 goal 的状态。
之后，Codex 会使用一个相当标准的 Ralph loop，也就是反复提示同一件事，prompt 如下：
    Continue working toward the active thread goal.  
    <untrusted_objective>  
    Ship the benchmark article with real Goal-mode evidence.  
    </untrusted_objective>  
    Budget:  
    - Time spent pursuing goal: XX seconds  
    - Tokens used: XX  
    - Token budget: XX  
    - Tokens remaining: XX  
    Before deciding that the goal is achieved, perform a completion audit against the actual current state.  
这解决了一个烦人的问题，Codex 不会每 15 分钟停下来问你能不能继续  ** 🥺  ** ** 👉  ** ** 👈  ** **，**但我不认为这是让 agent 长时间运行的有效方式。
###  我认为 /goal 缺了什么
我非常喜欢长时间运行 agent 这个想法。它是我们距离那个目标最近的东西：让 agent 真的能「构建一个 100 万 MRR 的 B2B SaaS，并且不犯错」。
但是，到目前为止，我使用 Codex 的 /goal 功能体验相当令人失望。它有着我在构建许多失败的长时间运行 agent 工作流后发现的同样缺陷。
我有这种感受主要有三个原因：
1. 模糊性会复利增长
2. 多 agent 更强
3. 跨上下文记忆有效
这些经验是我过去几个月学到的。下面我会展开细节，并分享一个我最终摸索出来、自己确实喜欢的工作流。
###  模糊性会复利增长
让 LLM 在循环里运行，意味着每一轮输出都会变成下一轮输入。这会对后续每一次迭代产生复利效应。
当你要求模型从头到尾构建某个东西时，它会做出无数决定。到了某个时刻，它通常会做出一个你自己不会做的决定。之后的每一份工作，都可能在方向上开始偏移。
这和现实生活并没有什么不同。如果你用模糊需求让别人帮你构建东西，又没有来回沟通的机会，最后大概率拿不到你脑子里想象的结果。
由于 AI 目前似乎还没有品味，要避免这种情况非常困难，除非你写出极其详细的 prompt，尽可能减少出错空间。
在我自己的长时间运行 agent 策略里，我会使用这个  ` /interview  ` skill 的一个变体，尽量降低模糊性。它非常类似  Matt Pocock 的「grill-me」skill  [3]  。
image.png
> 2025 年 12 月 31 日
>
> 我构建了一个自定义 Claude Code 命令  ` /interview  ` ，用来创建防弹级规格说明。• 用 plan mode 创建计划 • 运行  ` /interview  ` 命令 • Claude 提出 20 到 50 个澄清问题 • Claude 根据你的回答更新计划文件。非常适合消除任何模糊性！
我会在「设置阶段」做这件事，在让 agent 运行任何代码之前，先大量投入一个确实会发生用户交互的前置阶段。只有在这之后，才开始任何自主 agent 循环。
经过这个相当严格的过程后，goal 才会变得真正具体而详细，并被拆分为若干里程碑，每个里程碑由一个个独立任务组成。
「设置阶段」prompt 的片段
根据我的经验，这一步非常、非常、非常重要。它会迫使  ** 你  ** ，而不只是 agent，去思考「我到底想要什么？」
几乎每次运行这一步，Codex 都会问我问题，并提出一些我完全没考虑过的假设。但那些细节往往又出奇地重要，值得在一开始就思考并做出决定。
我理解这件事的方式，是把它想象成一棵潜在结果树。每个分支都是一个需要做出的决定，最终一路通向你的目标结果。
image.png
如果前期没有澄清，这些决定就会由 agent 来做。你最终得到的，只是近乎无限种可能结果中的一种。它也许会稍微有点像你提出的要求，但未必是你真正想要的东西。
而在前期多花时间，会给  ** 你  ** 一个机会，在长时间运行的 agent 流程开始之前，就通过剪掉那些远离你设想的分支来校正方向。
###  多 agent 优势
研究和我自己的经验都发现，使用 orchestrator <> subagent 关系下的多个 agent，比只使用一个优秀 agent 更强。
第 39 页
第 39 页：  https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf  [4]
显然，这会消耗更多 token。但如果 token 对你不是问题，它确实会改善结果。
本质上，这就是扩展 token 消耗的「横向」方式。与其让一个聪明的单体 agent 花更多 token 思考，不如让多个聪明 agent 一起花更多时间思考。
我做了一张图，用 Patrick Star 来解释这件事：
image.png
我在自己的长时间运行 agent 工作流里，是让主 long-running agent 充当 orchestrator。它可以针对每个独立任务，自由创建 subagent 小队。
这些小队一起工作，交付比单个 agent 更高质量的结果。通常我会让其中一个负责实现，另一个负责 review。
具体做法是，让 agent 实现它被分配到的任务。这个任务在规划阶段已经被拆成小块、可完成的工作。完成后，它会把结果交给 reviewer subagent。
reviewer，嗯，就负责 review。两个 agent 会围绕修复和改进来回迭代，直到它们都对代码质量满意。到那个时候，它们再向主 orchestrator 汇报工作已完成。
Boris，也就是 Claude Code 的创建者，在这里说得很优雅：
image.png
> 3 月 10 日
>
> 大体上，你往一个编程问题里投入的 token 越多，结果就越好。我们称之为 test time compute。让结果更好的一种方式，是使用独立的上下文窗口。这就是 subagent 有效的原因，也解释了为什么一个 agent 会引入 bug，而另一个……
我发现这非常有用，因为它能让 agent 带着新鲜视角看问题，不受先前偏见影响。比如，一个 review agent 第一次看到这段代码，可以进行目标明确、相对不带偏见的 review。
这很重要，因为当上下文窗口变得混乱时，agent，尤其是 Claude，经常会自我说服，相信一些完全错误的东西。
我最初创建  Claude Delegator  [5]  就是为了做这件事，让 Codex review Claude 的工作。但自从 GPT 5.5 之后，只要不是前端界面设计，我就把所有事情都交给 GPT 5.5 xHigh。前端设计我会用 Claude Design。
###  跨上下文记忆
给 agent 一个可以跨上下文窗口存储记忆的地方，并强制它们在每个新上下文窗口读取这些记忆，对 agent 和人类都很有帮助。它能让大家理解当前进展到哪里。
在我的长时间运行 agent 工作流里，规划阶段之后，我会要求 agent 创建、读取并维护三个文件：
1. ` GOAL.md  ` ：我们想达成的顶层目标。
2. ` STANDARDS.md  ` ：必须遵守的、不可协商的代码质量标准。
3. ` IMPLEMENT.md  ` ：工作流说明，例如使用多个 agent 做 review、编写测试、验证工作，诸如此类。
4. ` PROGRESS.md  ` ：持续更新的日志，记录已经做出的决策和已经完成的工作。
我会要求新的 agent 阅读所有这些文件，立刻理解之前的 agent 已经做过哪些决策、推进了哪些进展，并以与这些进展一致的方式行动。
当然，当你告诉 agent 太多事情时，它们并不总是会听。所以这些更像是指导原则，不能保证永远有效。但总体上，它们确实能帮助流程运转。
###  结语
我对长时间运行的 agent 非常兴奋。随着模型不断变好，我们或许真的能够 one-shot 出一些东西。这是一个疯狂到难以想象的想法。
过去几个月，我一直在实验如何让它们真正工作，并持续在这里记录我的学习过程。如果你对我当前的 long-running setup 好奇，并想自己试试，这里是链接：  https://github.com/jarrodwatts/long-running-agent-skill/tree/main  [6]
它被打包成一个  ` SKILL.md  ` ，可以很容易地接入 Claude/Codex。但我推荐在 Codex App 里配合 GPT 5.5 xHigh 使用，因为 Codex App 对 subagent 工作流有很好的可视化。
这个 skill 还包含一些很酷的功能，比如使用 git worktrees 在 subagent 小队之间并行化工作。我已经用它跑过一些长任务，产出了非常扎实、可以继续打磨的项目基础模块。
希望你喜欢！
###  参考阅读
* [ 我给Hermes配了4个Agent，真正有用的是这些事 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565121&idx=1&sn=8424d6b044700615b93a25721598ff84&scene=21#wechat_redirect>)
* [ Agent架构关键变化：Harness正在成为新后端 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565116&idx=1&sn=d0fb3f7e76e84e6a2cb048a1e77f1222&scene=21#wechat_redirect>)
* [ 明星开源项目，为什么开始离开 GitHub？ ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565111&idx=1&sn=0b3a58feae246791f2fead8d1b969b13&scene=21#wechat_redirect>)
* [ 300万人在存的Claude提示词 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565104&idx=1&sn=7699e8f06a56d11d91eb161c4ac93aaf&scene=21#wechat_redirect>)
####  References
1. 攻克 Anthropic 的招聘挑战:  https://x.com/jarrodwatts/status/2015599956024021211
2. https://www-cdn.anthropic.com/bbd8ef16d70b7a1665f14f306ee88b53f686aa75.pdf:  https://www-cdn.anthropic.com/bbd8ef16d70b7a1665f14f306ee88b53f686aa75.pdf
3. Matt Pocock 的「grill-me」skill:  https://www.aihero.dev/my-grill-me-skill-has-gone-viral
4. https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf:  https://www-cdn.anthropic.com/0dd865075ad3132672ee0ab40b05a53f14cf5288.pdf
5. Claude Delegator:  https://github.com/jarrodwatts/claude-delegator/
6. https://github.com/jarrodwatts/long-running-agent-skill/tree/main:  https://github.com/jarrodwatts/long-running-agent-skill/tree/main
如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 GIAC 深圳站值得关注。这次大会会集中讨论智能应用开发、架构演进，以及来自一线实践的经验与案例。
识别二维码可申请大会体验门票，点击