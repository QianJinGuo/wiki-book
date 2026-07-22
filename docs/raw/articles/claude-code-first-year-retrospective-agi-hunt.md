---
title: "Claude Code 之父一周年回顾：下一年的形态，一定跟现在完全不同"
source_url: "https://mp.weixin.qq.com/s/OXXZdKfBwFJJK14kKBJ5Kw"
source: wechat
ingested:2026-06-10
sha256:b52db641e005a02de59848388311bafab94d331e029231d1af2d6b18c51e6e58
type: source
tags: [wechat, claude-code, boris-cherny, cat-wu, anthropic, anniversary, retrospective, routines, auto-mode, agent-view, dynamic-workflows, source-leak, kairos, undercover-mode, voice-mode, remote-control, agi-hunt]
---

# Claude Code 之父一周年回顾

>公众号：AGI Hunt / BorisNCat
>视频：Boris Cherny + Cat Wu2026-06录制的回顾视频（YouTube原片 https://www.youtube.com/watch?v=Hth_tLaC2j8）
>原文发布：2026-06-10

## 一句话

Claude Code 从2025-02 Slack内部演示只收到两个赞，到2026-06 一周年时变成 PM 在写代码、工程师在手机上写代码、Agent 在自动修 bug 的 AI编程基础设施。Boris Cherny（负责人）+ Cat Wu（产品负责人）回顾一年心路历程，给出10 个章节的完整时间线 +多个内部故事。

##01两个赞的起点

-2025 年2 月 Claude Code 以 Research Preview身份登场，搭配 Claude3.7 Sonnet——一个能在终端里跟 Claude聊天、编辑文件、跑 bash 的 CLI工具
-当时 Slack内部演示只收到两个赞
-2025 年5 月22 日 Claude4家族（Opus4 + Sonnet4）发布，Claude Code正式发布
- "从那天起，一切开始加速"

##02验证才是关键

-过去一年 Boris 在 Claude Code 上学到的最重要理念：**每次 Claude犯错，不要告诉它下次怎么做，而是让它把经验写进 CLAUDE.md 或做成 Skill**——"如果你能做到这点，Claude就能一直跑下去"
- 但真正让 Agent 能长时间自主运行的，是**验证**
-开发者想到的验证是单元测试、lint、类型检查。**Agent层面的验证完全是另一回事**：Agent能不能自己跑起来，验证自己写的东西？
- Boris回忆的震惊瞬间：Opus4刚出时，他让 Claude写一个功能然后自己测试——Claude打开了一个 Claude CLI，在 bash 里自己测试了自己写的功能
- 现在这是常规操作：iOS模拟器、Android模拟器、桌面端的 computer use循环跑验证
- Cat团队的"桌面开发 Skill"：Claude 用 computer use 在应用里点来点去，测试新 UX，发现 bug 就修，修完再验证
-遇到预发布环境问题：让 Claude 去读 Slack看看是不是环境挂了，解决后更新 Skill
- **一个自我进化的闭环**

##03人人都在写代码

- Boris特别兴奋：他的 PM（Cat）在写代码
- Cat："现在更重要的是你有什么 idea。如果你有产品 sense、有业务 context、懂设计和用户，你反而能做出更好的东西"
- 企业客户反复看到的模式：先是工程师用上 Claude Code，旁边的人凑过来说"这东西好厉害，我也试试"
-设计师直接在代码里改 UI、PM 在应用里改功能、财务团队跑预测模型、数据科学家屏幕上全是 Claude Code
- Boris第一次看到设计师 Megan提 PR："天哪 Megan 为什么在提 PR？她说'我就是在修个按钮'。代码写得还挺好的"
- Boris 判断："未来每个人都既是 PM又是工程师。产品团队写代码，DevRel写代码，设计团队写代码"
-工程师越来越多地端到端交付产品，从想法到实现到发布到和法务、市场协调，一个人走完全流程

##04Routines 的威力

- Cat团队工程师负责 Voice Mode，在所有产品线上线了语音功能
- 设了第一个 Routine：自动监听所有关于 Voice Mode 的 GitHub issue 和 bug report，主动捡起问题，提交修复 PR，ping工程师 review
-想到：不只是 Voice Mode，其他反馈也是——又设了一个 Routine：监控所有超过5 小时没人回应的 bug report，自动提交修复
- Cat亲身体验：她发了一个小功能，有个边界情况她没注意到，有人报了 bug，她打算晚上修——结果她的 Claude告诉她："等等，另一个 Claude 已经修了"
-工程师根本没手动修，是 Routine 自动处理
- Boris："Claude 现在经常告诉我：'别人的 Claude 已经修过了'。回想一下以前，你得自己回复 code review，自己修 CI，自己 rebase。这些我已经很久很久没做过了"
- **Routine 的意义**：Agent SDK 是让 Claude Code 可编程化的第一步，但一开始大家不知道拿它干什么。Routine 是第一个"显而易见的应用场景"，它让 Claude **从同步工具变成了异步基础设施**

##05最爱 Auto Mode

- Boris 最爱的功能不是 plan mode，是 auto mode
- "更新的模型其实已经不需要 planning步骤了。Opus4 到4.5时期还需要，但从4.6 开始，尤其是4.7，模型直接就能干活"
- Auto mode逻辑：把权限判断交给另一个模型（Sonnet4.6）去做安全审查，而不是让用户逐条点同意
- Boris第一次听到方案时觉得不靠谱："把 prompt路由给一个模型来判断安全性？不可能行的"——结果实际一试，效果出奇的好
- **反直觉的安全论点**：auto mode 比手动审核每一条权限提示更安全
- "人的本性就是这样，当你99% 的请求都点同意时，眼睛就走神了。Auto mode让你只关注真正重要的事情"
- 上线 auto mode 的工程：收集成千上万条 Agent 运行轨迹，让 auto mode分类器判断安全性；请红队人员做 prompt注入攻击；让内部团队亲自尝试攻击
- 所有发现的问题都变成了 eval，用来持续提升安全性
- Cat："这不只是防范已知漏洞，而是防范我们能构造出的最聪明的攻击"

##06Loop 和手机编程

- Boris过去一年半经历了两次大的认知跃迁：
1. 从「我写代码」变成「我跟 Agent说话，Agent写代码」
2. 从「我跟 Agent说话」变成「我跟 Loop 或 Routine说话，它来调度 Agent」
- "我不再跟 Agent 直接对话了，我跟 Loop 对话，Loop替我调度 Claude。一年半就经历了两次大跃迁，这速度太疯狂了"
-以前开6 个终端标签，6 个 git checkout同一个仓库，来回切换
- 现在一个标签，**用 Agent View 看所有后台 Agent 的状态**，用桌面应用（自动管理 worktree）
- 最让他意外：**现在大概一半的工程工作是在手机上完成的**
- "我会在电脑上启动一些 Agent，然后用 Remote Control 从手机接管。出去买杯咖啡，看看 Agent 的进展，可能再启动一个新 Agent。有时候跟人聊天聊出了一个 idea，直接用 Voice Mode告诉 Claude去做"
- Cat记得 Boris 开始这么干的时候："你会把电脑留在办公室，屏幕锁着，插着电，然后就走了。一开始我以为你忘拿了，第二天又这样，第三天还这样。但你一直在提 PR……后来你回复我说：'我在沙发上写代码呢'"

##07Context极简主义

-怎么做 context engineering？Boris 的回答有点颠覆：
- "以前 Sonnet3.5时代你得做 prompt engineering，Opus4时代你得做 context engineering。**但现在的模型，这些都不需要了**"
- Boris 的做法：给模型最少的 system prompt，最少的 tools，让模型自己去找需要的 context
- Cat 自称 "context minimalist"："告诉模型它需要知道的，剩下的让它自己搞定。给模型太多 context，就像在微观管理它。有时候模型知道更好的方法来达到同一个目标"
- Boris总结的大趋势：Agent 运行时间越来越长，越来越自主，一次跑几十、几百甚至几千个 Agent早就不稀奇
- "一年后的使用方式肯定跟现在完全不一样。如果一年后还是这些东西，我反而会觉得奇怪"

##08源码泄露风波（视频里未聊到的另一件大事）

-2026 年3 月31 日，Anthropic 通过 npm 包 `@anthropic-ai/claude-code` v2.1.88 不小心发布了一个59.8MB 的 JavaScript source map 文件
- 安全研究员 Chaofan Shou 在 X 上公开了这个发现，瞬间引爆整个开发者社区
-泄露的根本原因：Claude Code 基于 Bun 构建（Anthropic2025 年底收购了 Bun），Bun 默认会生成 source map，但……**没人在 `.npmignore` 里排除它**
-51.2 万行未混淆的 TypeScript 代码，约1900 个文件，就这样暴露了
-社区从中扒出：
 - **KAIROS**（未发布的自主守护进程）：源码中被引用了150多次。能在后台 daemon方式持续运行，自动监听 GitHub webhook、发送推送通知，甚至有一个 `autoDream` 功能在空闲时自动整合记忆
 - **Undercover Mode**（约90 行代码）：Anthropic员工操作非内部仓库时自动激活，去掉 commit里的 `Co-Authored-By`署名，禁止提及内部代号和未发布模型
 -内部模型代号：Tengu 是 Claude Code 项目代号，Fennec 是 Opus4.6，Capybara疑似 Mythos 模型
 -44 个隐藏功能开关，20多个未发布功能
- Boris回应："这是一个人为错误。没有人因此被开除，犯错的人仍然拥有公司的完全信任。这是一个流程漏洞，任何人都可能犯"
- Anthropic发了 DMCA取消通知，但误伤了约8100 个仓库，包括自家开源仓库的合法 fork——后来撤回大部分通知
- 一个 mirror仓库在被下架前积累了41,500 个 fork，韩国开发者做了"claw-code"的 Python 重写版，2小时内拿到75,000 个 GitHub star
-泄露后发现多个严重漏洞（CVE-2025-59536、CVE-2026-21852 等），涉及 RCE 和 API token窃取，后续版本修复
- 但从另一个角度看，这次泄露让社区第一次看到 Claude Code内部的工程复杂度：40多个注册工具，5 种 context压缩策略，23 个 bash 安全检查，14 个缓存破坏向量

##09一年功能速览（完整时间线）

- **2025-02**：Claude Code 以 Research Preview身份登场，搭配 Claude3.7 Sonnet（终端 CLI工具）
- **2025-05-22**：Claude4家族发布，Claude Code正式发布
- **2025-09**：Claude Code2.0 发布——Checkpoints + VS Code扩展 + Hooks 系统 + GitHub Actions集成 + Agent SDK
- **2025-10**：Claude Code登陆网页端（claude.ai/code），沙箱隔离 + Skills 系统上线
- **2025-11**：Opus4.5带来67%降价 + context compaction
- **2026-01**：v2.1.0 发布，1096 个 commit 合入一个版本。Skills增强 + /teleport + 多语言支持
- **2026-02**：Opus4.6 + Agent Teams 发布，多个 Claude 实例并行协作。Remote Control 从手机管理 Agent
- **2026-03**：Voice Mode + /loop + auto mode相继登场。Routine 让 Agent 从同步变异步。源码泄露（v2.1.88 source map）
- **2026-04**：桌面应用重新设计，Routines正式发布，worktree隔离。Opus4.7 成为新默认模型，带来 push notifications
- **2026-05**：Agent View 上线，Opus4.8 发布，Dynamic Workflows 让 Claude编排成百上千个子 Agent 并行工作
- **2026-06**：Boris Cherny + Cat Wu录制1周年回顾视频（本文素材）

##10下一年

- Boris："一年后的使用方式如果还跟现在一样，我反而会觉得奇怪。Agent 运行时间越来越长，越来越自主，同时跑几百上千个 Agent早就不稀奇了。**下一年的形态，一定跟现在完全不同**"
- Cat："这些想法不会只从我们这里来，而是会从整个社区里涌现出来"
- 从两个 Slack点赞到人人写代码，Claude Code 用一年走完了大多数产品一辈子都走不完的路

## 相关链接

- YouTube视频原片：https://www.youtube.com/watch?v=Hth_tLaC2j8
- Claude Code官方文档：https://code.claude.com/docs/en/overview
- ClaudeDevs推文：https://x.com/ClaudeDevs/status/2064032814392352816
