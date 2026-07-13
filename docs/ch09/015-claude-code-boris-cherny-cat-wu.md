# Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线

## Ch09.015 Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线

> 📊 Level ⭐⭐ | 26.3KB | `entities/claude-code-first-year-retrospective-boris-cat-2026.md`

# Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线

## 摘要

2025 年 2 月，Claude Code 以 Claude 3.7 Sonnet 的附属 CLI 工具身份在 Slack 内部演示，只收到两个赞。2026 年 6 月一周年时，Claude Code 已经从一个终端对话工具演变为 AI 编程基础设施——PM 在写代码、工程师在手机上写代码、Agent 在自动修 bug。由 Boris Cherny（技术负责人）和 Cat Wu（产品负责人）共同录制的回顾视频，系统复盘了从 Research Preview 到 AI 编程平台的完整一年演进路径，涵盖 10 个核心章节：起点与验证机制的设计、Routines 和 Auto Mode 的工程哲学、Loop 和手机编程的认知跃迁、Context 极简主义的实践智慧，以及 2026 年 3 月源码泄露风波的完整内幕。这份回顾不仅是一份产品总结，更是一部关于 AI 原生产品开发的实战教科书。

## 核心要点

1. **验证比指令更重要**：Boris 学到的最重要经验——每次 Claude 犯错，不要告诉它下次怎么做，而是让它把经验写进 CLAUDE.md 或做成 Skill，「如果你能做到这点，Claude 就能一直跑下去」
2. **自我验证是 Agent 超越工具的关键时刻**：Opus 4 刚发布时，Claude 已经能够打开 Claude CLI，在 bash 里自己测试自己写的功能——这标志着 Agent 从「执行单元」变成「自包含的执行系统」
3. **Routines 让 Claude 从同步工具变成异步基础设施**：当 Claude 可以监听 GitHub issues 并自动提交修复 PR 时，工程师的角色从「执行者」变成「编排者」
4. **Auto Mode 反直觉的安全性论证**：把安全审查委托给 Sonnet 4.6 模型而非让用户逐条点同意，实际上更安全——「人的本性就是这样，当你 99% 的请求都点同意时，眼睛就走神了」
5. **一年后的使用方式肯定跟现在完全不同**：Agent 运行时间越来越长，越来越自主，同时运行成百上千个 Agent 早就不稀奇，Claude Code 的形态一年后必然面目全非

## 深度分析

### 01 两个赞的起点：起点低不是坏事

2025 年 2 月，Claude Code 以 Research Preview 身份登场，搭配 Claude 3.7 Sonnet——一个能在终端里跟 Claude 聊天、编辑文件、跑 bash 的 CLI 工具。在 Slack 内部的演示只收到两个赞。

这个细节常被解读为「起点低」的故事，但其实更准确的解读是：**发布时机比产品成熟度更重要**。Claude Code 选择在模型能力刚好达到「可用的最低门槛」时发布，而不是等到功能完备时才发布。2025 年 5 月 22 日 Claude 4 家族（Opus 4 + Sonnet 4）发布，Claude Code 正式发布，从那天起一切开始加速。

这揭示了一个 AI 原生产品开发的铁律：**不要等到产品完美再发布，而要在模型能力刚好支撑核心场景时就发布**。Claude Code 的赌注是 Claude 4 家族会带来模型能力的跃升，从而让产品体验随之跃升。事实正是如此。

### 02 验证才是关键：让 Agent 从错误中进化

#### 2.1 从「告诉它怎么做」到「让它自己学会」

过去一年 Boris 在 Claude Code 上学到的最重要理念是：**每次 Claude 犯错，不要告诉它下次怎么做，而是让它把经验写进 CLAUDE.md 或做成 Skill**。

传统的 human-in-the-loop 反馈是：人类发现错误，告诉 Claude 哪里错了，Claude 改正。这个模式在单次任务中有效，但在长期运行中效率极低——每次错误都需要人类介入，无法 scale。

Boris 发现的更优模式是：Claude 犯错后，让它自己分析错误原因，然后更新 CLAUDE.md（项目级记忆文件）或创建 Skill（可复用工具）。这样，下次遇到类似情况，Claude 就能自主规避，而不是重复犯错。用 Boris 的话说：「如果你能做到这点，Claude 就能一直跑下去。」

#### 2.2 自我验证：Agent 的关键时刻

真正让 Agent 能长时间自主运行的，是**验证**机制。开发者理解的验证是单元测试、lint、类型检查——这些是代码级别的检查。但 Agent 层面的验证完全是另一回事：**Agent 能不能自己跑起来，验证自己写的东西？**

Boris 回忆了他在 Opus 4 刚发布时的一个震惊瞬间：他让 Claude 写一个功能，然后让它自己测试。Claude 打开了一个 Claude CLI，在 bash 里自己测试了自己写的功能。

这个画面在今天已经是常规操作——iOS 模拟器、Android 模拟器、桌面端的 computer use 循环跑验证。但在当时，这个观察预示了 Agent 能力的一个根本性跃迁：**Agent 不再是「执行人类指令的工具」，而是「能够自主运行并验证结果的执行系统」**。

Cat 团队的「桌面开发 Skill」是另一个例子：Claude 用 computer use 在应用里点来点去，测试新 UX，发现 bug 就修，修完再验证。整个过程不需要人类参与，Claude 是自己的 QA。当遇到预发布环境问题时，Claude 被引导去读 Slack 看看是不是环境挂了，解决后更新 Skill。这是一个**自我进化的闭环**。

### 03 人人都在写代码：新分工的浮现

#### 3.1 PM、设计师、财务都在写代码

Boris 在回顾中最兴奋的观察是：他的 PM（Cat）自己在写代码。Cat 的说法更加直接：「现在更重要的是你有什么 idea。如果你有产品 sense、有业务 context、懂设计和用户，你反而能做出更好的东西。」

Claude Code 在企业客户中反复呈现一种模式扩散路径：先是工程师用上 Claude Code，旁边的人凑过来说「这东西好厉害，我也试试」——然后设计师直接在代码里改 UI、PM 在应用里改功能、财务团队跑预测模型、数据科学家屏幕上全是 Claude Code。

Boris 第一次看到设计师 Megan 提交 PR 时发出惊叹：「天哪 Megan 为什么在提 PR？」Megan 说「我就是在修个按钮」。代码写得还挺好的。

这预示了 Boris 对未来工作分工的判断：「未来每个人都既是 PM 又是工程师。产品团队写代码，DevRel 写代码，设计团队写代码。」工程师越来越多地端到端交付产品，从想法到实现到发布到和法务、市场协调，一个人走完全流程。

#### 3.2 代码能力的民主化

这个趋势的深层含义是：**当 AI 能够承担代码实现的细节工作时，代码能力的门槛从「会编程」变成了「有想法」**。懂产品、懂用户、懂业务的人能够借助 AI 工具将想法变成可运行的软件，而不需要掌握编程语言的语法细节。这与桌面出版时代的历史类似——当 PageMaker 让非设计师也能做出版时，行业并没有消灭设计师这个角色，而是扩大了创作的参与群体。

### 04 Routines 的威力：Agent 从同步工具变成异步基础设施

#### 4.1 第一个 Routine：Voice Mode 的自动运维

Cat 团队的工程师负责 Voice Mode，在所有产品线上线了语音功能。他们设置了第一个 Routine：自动监听所有关于 Voice Mode 的 GitHub issue 和 bug report，主动捡起问题，提交修复 PR，ping 工程师 review。

这个 Routine 的设计逻辑很简单：当用户报告 Voice Mode 的 bug 时，一个 Routine 自动创建任务，Claude 分析问题，写修复代码，跑测试，然后提交 PR，同时通知相关工程师。整个过程是异步的——工程师不需要盯着 issue 列表，不需要手动分诊，不需要自己写修复。

Cat 团队想到扩展：不只是 Voice Mode，其他反馈也是。于是又设了一个 Routine：监控所有超过 5 小时没人回应的 bug report，自动提交修复。

#### 4.2 Cat 亲历的震撼时刻

Cat 亲身体验了 Routine 的威力：她发了一个小功能，有个边界情况她没注意到，有人报了 bug，她打算晚上修——结果她的 Claude 告诉她：「等等，另一个 Claude 已经修了。」工程师根本没手动修，是 Routine 自动处理的。

Boris 对此的感慨更为深刻：「Claude 现在经常告诉我：'别人的 Claude 已经修过了'。回想一下以前，你得自己回复 code review，自己修 CI，自己 rebase。这些我已经很久很久没做过了。」

#### 4.3 Routine 的本质：让 Claude 从同步工具变成异步基础设施

Boris 在回顾中总结了 Routine 的意义：「Agent SDK 是让 Claude Code 可编程化的第一步，但一开始大家不知道拿它干什么。Routine 是第一个'显而易见的应用场景'，它让 Claude **从同步工具变成了异步基础设施**。」

这个转变的深层含义是：Claude Code 不再是一个「你调用，它执行，你等待」的同步工具，而是一个「你设定目标，它在后台持续运行、监控事件、自动响应」的异步基础设施。Routine 是 Claude Code 作为 AI 编程平台的关键里程碑。

### 05 最爱 Auto Mode：反直觉的安全论证

#### 5.1 Auto Mode 的工程实现

Boris 最爱的功能不是 plan mode，是 auto mode。他的理由是：「更新的模型其实已经不需要 planning 步骤了。Opus 4 到 4.5 时期还需要，但从 4.6 开始，尤其是 4.7，模型直接就能干活。」

Auto mode 的逻辑是：把权限判断交给另一个模型（Sonnet 4.6）去做安全审查，而不是让用户逐条点同意。这个设计在 Boris 第一次听到方案时觉得不靠谱：「把 prompt 路由给一个模型来判断安全性？不可能行的。」结果实际一试，效果出奇的好。

#### 5.2 反直觉的安全论点

Auto mode 背后有一个深刻的反直觉论证：**auto mode 比手动审核每一条权限提示更安全**。

Boris 的论点是：「人的本性就是这样，当你 99% 的请求都点同意时，眼睛就走神了。Auto mode 让你只关注真正重要的事情。」当用户习惯了点「允许」之后，权限提示就不再起到真正的安全审查作用——用户只是在机械地放行。Auto mode 把有限的注意力资源集中在真正异常的请求上。

#### 5.3 Auto Mode 的工程严谨性

Auto mode 的上线过程体现了极高的工程严谨性：
1. 收集成千上万条 Agent 运行轨迹
2. 让 auto mode 分类器判断安全性
3. 请红队人员做 prompt 注入攻击
4. 让内部团队亲自尝试攻击

所有发现的问题都变成了 eval（评估测试），用来持续提升安全性。Cat 的一句话精准概括了这个理念：「这不只是防范已知漏洞，而是防范我们能构造出的最聪明的攻击。」

### 06 Loop 和手机编程：两次认知跃迁

#### 6.1 两次大跃迁

Boris 过去一年半经历了两次大的认知跃迁：
1. **从「我写代码」变成「我跟 Agent 说话，Agent 写代码」**——这是 Claude Code 最初解决的问题
2. **从「我跟 Agent 说话」变成「我跟 Loop 或 Routine 说话，它来调度 Agent」**——这是 2026 年的新范式

「我不再跟 Agent 直接对话了，我跟 Loop 对话，Loop 替我调度 Claude。一年半就经历了两次大跃迁，这速度太疯狂了。」

#### 6.2 手机编程的日常化

在日常工作方式上，Boris 的变化同样惊人：以前开 6 个终端标签，6 个 git checkout 同一个仓库，来回切换；现在一个标签，用 Agent View 看所有后台 Agent 的状态，用桌面应用（自动管理 worktree）处理。

最让他意外的是：**现在大概一半的工程工作是在手机上完成的**。他会用 Remote Control 从手机接管在电脑上启动的 Agent。出去买杯咖啡，看看 Agent 的进展，可能再启动一个新 Agent。有时候跟人聊天聊出了一个 idea，直接用 Voice Mode 告诉 Claude 去做。

Cat 对 Boris 最早开始这样干的印象很深：「你会把电脑留在办公室，屏幕锁着，插着电，然后就走了。一开始我以为你忘拿了，第二天又这样，第三天还这样。但你一直在提 PR……后来你回复我说：'我在沙发上写代码呢'。」

### 07 Context 极简主义：让模型自己找 context

#### 7.1 Context engineering 的演进

怎么做 context engineering？Boris 的回答有点颠覆：「以前 Sonnet 3.5 时代你得做 prompt engineering，Opus 4 时代你得做 context engineering。**但现在的模型，这些都不需要了**。」

Boris 的做法是给模型最少的 system prompt，最少的 tools，让模型自己去找需要的 context。Cat 自称「context minimalist」：「告诉模型它需要知道的，剩下的让它自己搞定。给模型太多 context，就像在微观管理它。有时候模型知道更好的方法来达到同一个目标。」

#### 7.2 大趋势的判断

Boris 总结的大趋势是：**Agent 运行时间越来越长，越来越自主，一次跑几十、几百甚至几千个 Agent 早就不稀奇**。在这个趋势下，context 的管理方式必须改变——不能靠人工把 context 塞进 prompt，而要让模型具备自主获取所需 context 的能力。

「一年后的使用方式肯定跟现在完全不一样。如果一年后还是这些东西，我反而会觉得奇怪。」

### 08 源码泄露风波：59.8MB 的工程复杂度展示

#### 8.1 事件经过

2026 年 3 月 31 日，Anthropic 通过 npm 包 `@anthropic-ai/claude-code` v2.1.88 不小心发布了一个 59.8MB 的 JavaScript source map 文件。安全研究员 Chaofan Shou 在 X 上公开了这个发现，瞬间引爆整个开发者社区。

泄露的根本原因是技术性的：Claude Code 基于 Bun 构建（Anthropic 2025 年底收购了 Bun），Bun 默认会生成 source map，但没人在 `.npmignore` 里排除它。结果是 51.2 万行未混淆的 TypeScript 代码，约 1900 个文件，就这样暴露了。

#### 8.2 社区扒出的核心发现

从泄露代码中，社区研究者扒出了多项关键发现：

**KAIROS（未发布的自主守护进程）**：源码中被引用了 150 多次。能在后台以 daemon 方式持续运行，自动监听 GitHub webhook、发送推送通知，甚至有一个 `autoDream` 功能在空闲时自动整合记忆。这个未发布的功能让外界第一次看到了 Claude Code 在「长期运行 Agent」方向上的探索。

**Undercover Mode（约 90 行代码）**：Anthropic 员工操作非内部仓库时自动激活，去掉 commit 里的 `Co-Authored-By` 署名，禁止提及内部代号和未发布模型。这是一种保护内部开发实践的机制。

**内部模型代号**：Tengu 是 Claude Code 项目代号，Fennec 是 Opus 4.6，Capybara 疑似 Mythic 模型。

**44 个隐藏功能开关和 20+ 未发布功能**：Claude Code 的功能矩阵远比公开版本丰富。

#### 8.3 事件处理与后续

Boris 对此事件的回应体现了 Anthropic 的工程文化：「这是一个人为错误。没有人因此被开除，犯错的人仍然拥有公司的完全信任。这是一个流程漏洞，任何人都可能犯。」

Anthropic 发了 DMCA 取消通知，但误伤了约 8100 个仓库，包括自家开源仓库的合法 fork——后来撤回了大部分通知。一个被下架前的 mirror 仓库积累了 41,500 个 fork，韩国开发者做了「claw-code」的 Python 重写版，2 小时内拿到 75,000 个 GitHub star。

泄露还发现了多个严重漏洞（CVE-2025-59536、CVE-2026-21852 等），涉及 RCE 和 API token 窃取，后续版本已修复。

#### 8.4 意外的价值

从另一个角度看，这次泄露让社区第一次看到 Claude Code 内部的工程复杂度：40 多个注册工具、5 种 context 压缩策略、23 个 bash 安全检查、14 个缓存破坏向量。这些数字揭示了一个外界之前没有意识到的现实：**Claude Code 的工程量远超一个简单 CLI 工具的范畴，它是一个高度复杂的 AI 编程平台**。

### 09 完整时间线：从 Research Preview 到 AI 编程平台

| 时间 | 里程碑 |
|------|--------|
| 2025-02 | Claude Code 以 Research Preview 身份登场，搭配 Claude 3.7 Sonnet |
| 2025-05-22 | Claude 4 家族发布，Claude Code 正式发布 |
| 2025-09 | Claude Code 2.0：Checkpoints + VS Code 扩展 + Hooks 系统 + GitHub Actions 集成 + Agent SDK |
| 2025-10 | Claude Code 登陆网页端（claude.ai/code），沙箱隔离 + Skills 系统上线 |
| 2025-11 | Opus 4.5：67% 降价 + context compaction |
| 2026-01 | v2.1.0：1096 个 commit 合入一个版本，Skills 增强 + /teleport + 多语言支持 |
| 2026-02 | Opus 4.6 + Agent Teams：多个 Claude 实例并行协作，Remote Control 从手机管理 Agent |
| 2026-03 | Voice Mode + /loop + auto mode 相继登场，Routine 让 Agent 从同步变异步，源码泄露 |
| 2026-04 | 桌面应用重新设计，Routines 正式发布，worktree 隔离，Opus 4.7 成为新默认模型，push notifications |
| 2026-05 | Agent View 上线，Opus 4.8 发布，Dynamic Workflows 让 Claude 编排成百上千个子 Agent 并行工作 |
| 2026-06 | Boris Cherny + Cat Wu 录制一周年回顾视频 |

### 10 下一年：形态一定跟现在完全不同

Boris 的预言：「一年后的使用方式如果还跟现在一样，我反而会觉得奇怪。Agent 运行时间越来越长，越来越自主，同时跑几百上千个 Agent 早就不稀奇了。**下一年的形态，一定跟现在完全不同**。」

Cat 的判断：「这些想法不会只从我们这里来，而是会从整个社区里涌现出来。」

Claude Code 用一年时间，从两个 Slack 点赞走到了一个 PM 在写代码、工程师在手机写代码、Agent 在自动修 bug 的世界。这条路的方向不是线性的，而是持续加速的认知跃迁。每一次跃迁都重新定义了「使用计算机」和「写代码」的含义。

## 实践启示

1. **Agent 的进化路径是自我验证 → 自我记忆 → 自我调度**：从「每次告诉它怎么做」到「让它自己学会」，再到「让 Agent 调度 Agent」，这是 Agent 系统成熟度的三阶段
2. **验证闭环是 Agent 长期自主运行的前提**：没有可靠验证机制的 Agent 系统无法 scale，因为每次错误都需要人工介入
3. **Routines 是将 AI 能力规模化的第一个显而易见的应用**：当你需要持续监控某个事件源并自动响应时，Routine 是比手动触发更scalable 的方案
4. **Auto Mode 的安全设计揭示了 AI-native 安全范式**：不是靠人类逐条审批，而是靠 AI 模型做安全判断——前提是积累足够多的真实轨迹数据
5. **「人人都写代码」时代需要新的工程教育思维**：不是每个人都要学会编程语法，而是要学会用自然语言表达意图和验收标准
6. **Context 极简主义是 Agent 产品设计的反直觉原则**：给模型太多 context 反而会限制其自主推理能力，要相信模型知道如何获取所需信息

## 相关实体

- [Loop Engineering Addy Osmani Challengehub](../ch05/007-loop-engineering.html) — Loop 架构的工程实践
- [Boris Cherny 新访谈开发工具正在从 Ide 变成 Agent 控制台](../ch03/045-agent.html) — Boris Cherny 对开发工具演进方向的判断
- [Claude Opus 4 7 Launch](../ch01/852-claude-opus-4-7.html) — Opus 4.7 的能力跃升
- [Anthropic 95Pct Data Analysis Skill Stack Architecture](../ch01/893-anthropic.html) — Skills 系统的架构设计
- [Anthropic Mcp Revisited Tool Search Code Orchestration](../ch07/016-anthropic-mcp.html) — 工具调用与代码编排
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html) — Claude Code 源码的工程实现深度解读
- [Kimi Work Beta Foundation Model Company Advantage](https://github.com/QianJinGuo/wiki/blob/main/entities/kimi-work-beta-foundation-model-company-advantage.md) — 模型公司做 Agent 的战略逻辑
- [Anthropic Biology Agent Data Infrastructure Virbench](../ch01/893-anthropic.html) — 数据基础设施对 Agent 能力的影响
- [claude code 一周年回顾：boris cherny + cat wu 对话](../ch03/075-claude-code.html)

## 第 2 来源 — 2026-06-30：子智能体默认后台运行

2026 年 6 月 30 日，Claude Code 创造者 Boris Cherny 宣布下一版 Claude Code 的子智能体默认在后台运行。用户可以边跟 Claude 聊天，子智能体在后台完成代码重构、测试，并开出 PR。

这一功能是 Claude Code 三条演进路线的集大成：4 月的 **Routines**（定时任务 + 事件触发）、5 月底的 **Dynamic workflows**（Ultracode——一个 AI 写编排脚本，子智能体分阶段推进并行验证）、以及现在的**后台子智能体默认运行**（无需手动指定「去后台跑」，它天生就在后台跑）。

**Spotify 实战**：Spotify 工程副总裁 Niklas Gustavsson 披露了一组关键数据——Spotify 每天生产环境部署约 4500 次，73% 的 PR 由 AI 辅助完成。其超过 2000 万行代码的超级单体仓库中，工程师同时开 5 到 10 个 Claude 会话各自对应独立 git 工作树，多个智能体在后台并行干活，自己只负责看 diff、做决策。Niklas 给同行的建议是「代码库越一致、工具链越统一，Claude 在里面的表现就越好」。

**组织影响**：Anthropic 增长团队已转向多招产品经理——每位工程师产出翻三倍，PM 与工程师配比从 1:8 变为 1:20。Boris Cherny 本人已八个月没手写过代码，有时管理数千甚至上万个 AI 智能体。他总结「当后台子智能体成为标配，写代码不再是工程师最重要的事情，决定干什么、判断对不对才是」。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-background-sub-agents-boris-cherny-2026.md)

---

