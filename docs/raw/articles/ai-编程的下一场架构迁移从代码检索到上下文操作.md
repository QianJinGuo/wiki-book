---
title: AI 编程的下一场架构迁移：从代码检索，到上下文操作
source_url: https://mp.weixin.qq.com/s/HLqHRQ33xkBQSW778mIzsQ
publish_date: 2026-05-16
tags: [wechat, article, claude, openai, agent, harness, rag, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 40ea957b2e0a0455fdac78abbf391213bc6e3684f69a8a132fcfb263d66f64a9
---

Harness 模块  |  主要职责
---|---
Search Harness  |  搜索文件、符号、日志、提交历史、外部文档
Read Harness  |  控制读取粒度、分页、preview，避免上下文爆炸
Execution Harness  |  运行测试、lint、typecheck、脚本和本地服务
Memory Harness  |  保存项目约定、架构决策、反复出现的纠错经验
Compaction Harness  |  长任务中压缩历史，保留关键状态和下一步
Isolation Harness  |  用 subagent、sandbox、worktree 隔离任务和风险
Policy Harness  |  管权限、审批、凭证、危险命令和审计
Evaluation Harness  |  用测试、线上信号、代码保留率和失败分类评估质量
Agent Harness 承重层
Anthropic 文档把 Claude Code 称为 Claude 外面的 agentic harness，提供工具、上下文管理和执行环境，让语言模型变成 coding agent。这个定义很重要。
模型负责推理，Harness 负责让推理接上真实工程。
Cursor 的 Harness 复盘也在讲同一件事。它们不只看模型分数，还看离线评测、线上 A/B、Keep Rate、用户后续反应、工具错误率、cache hit rate。对 Cursor 来说，一个 Agent 版本更准确的发布单元，是“模型 + Harness”。
OpenAI Codex 和 GitHub Copilot cloud agent 则把这条线往工程流程里推。Codex 的云端任务跑在独立 sandbox 里，可以读写文件、运行测试、给出 PR；GitHub Copilot cloud agent 在 GitHub Actions 驱动的环境里研究仓库、创建计划、修改代码、运行测试和 linter，并把结果放进 PR 流程。
这说明 AI Coding 的战场正在从“编辑器里补全几行代码”，转向 branch、worktree、sandbox、test、PR、review、CI 这些工程主流程。
所以未来 AI 编程工具的护城河，大概率不会只是聊天框。
** 真正难的是 Harness：谁能把 Agent 的搜索、执行、验证、权限、上下文和协作流程组织成稳定系统。  **
* * *
##  从 Vibe Coding 到 Agentic Engineering
说到这里，还是要回到 [ Agentic Engineering ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 。
Simon Willison 最近用 Agentic Engineering 这个词，来指代专业工程师使用 Claude Code、OpenAI Codex 这类 coding agents 来构建软件。这类工具的关键特征，不只是生成代码，还能执行代码、跑测试、根据反馈独立迭代。
这和 Vibe Coding 的边界不太一样。
Vibe Coding 更适合原型、个人工具、低风险探索。它让想法更快变成可运行的东西，这件事本身就很有价值。
Agentic Engineering 关心的则是另一件事：这个结果能不能被审查、被测试、被回滚、被维护，能不能在团队里继续被拥有。这也是我们在《 [ Agent 时代，架构师应该学什么 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409241&idx=1&sn=1b06c60be86aee50e5289694343124f2&scene=21#wechat_redirect>) 》里反复回到的问题。
放到本文这条线里看，两者的差别可以这么理解：
Vibe Coding 关心“能不能做出来”。
Agentic Engineering 关心“做出来以后，系统和团队还能不能接得住”。
Claude Code 的 Agentic Search、Cursor 的 semantic search、Codex 的 cloud sandbox、GitHub 的 PR 工作流，看起来是不同产品的不同功能。往下一层看，它们其实都在把 Agent 推进真实工程系统。
一旦 Agent 进入工程系统，问题就不再只是模型会不会写代码。
还要回答：
* • 它怎么获得上下文？
* • 它怎么验证假设？
* • 它怎么隔离探索过程？
* • 它怎么压缩长期任务？
* • 它怎么调用确定性工具？
* • 它怎么留下审计和证据？
* • 它怎么在出错时停下来、回滚或交给人？
这些问题都不是“RAG 和 Grep 谁赢了”能回答的。
它们属于架构问题。
Martin Fowler 给我的提醒也在这里。AI 进入研发链路以后，最大的变化不是我们终于可以少写几行代码，而是一个非确定性的执行者进入了原本依赖确定性反馈的工程系统。搜索、编辑、运行测试这些动作都可以交给 Agent，但目标、边界、验证和责任链不能跟着一起丢。
* * *
##  写在最后
写到这里，我自己越来越倾向于把这次争论看成一个信号，而不是一场胜负。
表面上大家在争 RAG、Grep、Agentic Search 谁更先进。
往深一层看，是 AI 编程工具正在从“模型拿到上下文后生成答案”，慢慢变成“Agent 在工程现场里持续操作上下文”。
这也是我这段时间一直绕回去的那条线： [ 上下文不是聊天记录 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) ， [ Subagent 不是多智能体炫技 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) ， [ Prompt Cache 不只是省钱小技巧 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408819&idx=1&sn=f0c65045a197c9a3a6ca5b19faeae4da&scene=21#wechat_redirect>) ， [ Codex 也不是云端版自动补全 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect>) 。
它们其实都在指向同一个变化：
** AI 编程的核心能力，正在从代码生成，迁移到对上下文、工具、执行环境和验证闭环的组织能力上。  **
RAG 还会继续存在，语义索引也会继续存在，Grep、glob、ripgrep 这些老工具更会继续存在。
真正会变的，是它们不再孤立地作为“检索模块”坐在那里，而会被放进 Agent 的工程循环里，被 Harness 调度、约束、观察和评估。
对架构师来说，接下来更值得花力气练的能力，可能不是追一个又一个新名词。
而是把这个问题想清楚：
当 Agent 可以自己搜索、阅读、执行、验证、修改系统时，我们到底要给它怎样的上下文边界、工具边界、权限边界和验证边界？
这个问题答得越清楚，AI Coding 就越像工程，而不是魔法。
* * *
##  参考来源
* • Latent Space: Claude Code: Anthropic's Agent in Your Terminal
https://www.latent.space/p/claude-code
* • Anthropic Claude Code Docs: How Claude Code works
https://code.claude.com/docs/en/how-claude-code-works
* • Anthropic Claude Code Docs: Explore the context window
https://code.claude.com/docs/en/context-window
* • Anthropic Claude Code Docs: Subagents
https://code.claude.com/docs/en/sub-agents
* • Anthropic Docs: Prompt caching
https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
* • Cursor: Improving agent with semantic search
https://cursor.com/blog/semsearch
* • Cursor: Continually improving our agent harness
https://cursor.com/blog/continually-improving-agent-harness
* • OpenAI: Introducing Codex
https://openai.com/index/introducing-codex/
* • OpenAI Codex
https://openai.com/codex/
* • GitHub Docs: Copilot cloud agent
https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent
* • GitHub Blog: Agent HQ
https://github.blog/news-insights/company-news/pick-your-agent-use-claude-and-codex-on-agent-hq/
* • Simon Willison: Writing about Agentic Engineering Patterns
https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/
* • GrepRAG: An Empirical Study and Optimization of Grep-Like Retrieval for Code Completion
https://arxiv.org/abs/2601.23254
如喜欢本文，请点击右上角，把文章分享到朋友圈
如有想了解学习的技术点，请留言给若飞安排分享
** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **
** ·END·  **
    **相关阅读：**
[刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect>)
[大家都在讲 Harness，但它到底该怎么理解](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect>)
[模型越来越强，为什么大家却开始重写 Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect>)
[如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect>)
[Claude Code高手的 8 个 Claude Code 实战习惯](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408884&idx=1&sn=6a2fa56f70f15cdd75eb5c2b12e687ef&scene=21#wechat_redirect>)
[别从 README 开始：一个架构师会怎样翻 Codex 仓库](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect>)
[Spec 不是代码的替代品，它是 AI Coding 的上下文管理层](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408860&idx=1&sn=b882b2ee97e3f798fea96e68d27c7071&scene=21#wechat_redirect>)
[如何让 Agents 自己设计、升级 Agents](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408848&idx=1&sn=aabf785116e9849dbd301a4f7c477181&scene=21#wechat_redirect>)
[OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408832&idx=1&sn=ef00408738c853ea2e94be58c0612e51&scene=21#wechat_redirect>)
[Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408200&idx=1&sn=2f2cce7dfcbdb0766eac3590f777a17b&scene=21#wechat_redirect>)
[一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408189&idx=1&sn=7d4f7a442a22af37f95c46ff1048a3df&scene=21#wechat_redirect>)
[Claude Code 最佳实践：把上下文变成生产力（团队可落地版）](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408183&idx=1&sn=0b6f1437465d3a61118db688cc889b17&scene=21#wechat_redirect>)
[把 AI 当成新同事：Agent Coding 的上下文与验证体系](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408169&idx=1&sn=7bba1377a31ffa0ce68932935c8d923a&scene=21#wechat_redirect>)
[一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408161&idx=1&sn=85aaff6f2f779e53b6ae9c5e1f003269&scene=21#wechat_redirect>)
[2026年生活重启指南](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408141&idx=1&sn=e1e64ad73d25414957aa5206ca969fc3&scene=21#wechat_redirect>)
[我真不敢相信，AI 先加速的是工程师。](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408153&idx=1&sn=d33b48464de93a2573a0a0cb025ada9e&scene=21#wechat_redirect>)
[扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408128&idx=1&sn=1b6c640de61986d1364847bffb2cd28f&scene=21#wechat_redirect>)
[Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408114&idx=1&sn=29a754281cd07c16b6191c6d146c5837&scene=21#wechat_redirect>)
[Anthropic官方万字长文：AI Agent评估的系统化方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408107&idx=1&sn=905552d68f5b174fd9548360bdea4448&scene=21#wechat_redirect>)
[银弹还是枷锁？Claude Agent SDK 的架构真相](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408084&idx=1&sn=82f274ba084f9c289e2d141aad0c088b&scene=21#wechat_redirect>)
[Claude Code创始人亲授13条使用技巧](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408076&idx=1&sn=f139e90d699b528e80e79c558eed42ee&scene=21#wechat_redirect>)
[Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408028&idx=1&sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&scene=21#wechat_redirect>)
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
** 架构师  **
我们都是架构师！
**** 关注  ** 架构师(JiaGouX)，添加“星标”  **
** 获取每天 AI 技术干货，一起成为牛逼架构师  **
** AI/Agent群请  ** ** 加若飞：  ** ** 1321113940  ** ** 进群  **
投稿、合作、版权等邮箱：  ** admin@137x.com  **