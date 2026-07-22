---
source: wechat
source_url: https://mp.weixin.qq.com/s/gjxhwjKMZfztSo5ZclNsfA
ingested: 2026-07-10
feed_name: 科技充电站
wechat_mp_fakeid: MP_WXS_3237134318
source_published: 2026-05-23
sha256: db8c0c39bb652352039de88e6f3a8089f10d9346170d9eced8838d177c94bac7
---

# 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime ！

嗨，大家好，我是行小招。

我以前看 Codex，体感上很容易把它理解成一个更强的 CLI，或者一个带 GUI 的代码助手，但把这三份资料和 OpenAI 官方 App Server 文档放在一起看完后，我的判断变了：Codex 真正要做的不是某一个端，而是一套围绕 agent runtime 展开的多端系统。

这句话挺关键。因为只看 Codex App，你会觉得它是一个桌面工作台。只看 Codex CLI，你会觉得它是终端里的 coding agent，只看 Web，你又会觉得它是云端 PR 工厂。

但这些表面后面，其实有一条共同的主线：同一个 Codex harness，同一套 thread / turn / item 抽象，同一个 app-server 协议面，再叠上不同端的交互方式。

说白了，Codex 最值得看的地方，不是它又多了一个 App，而是 OpenAI 正在把 coding agent 做成一个可嵌入、可远控、可审计、可扩展的运行时。

##  Codex 现在不是一个端，而是一组端

先把 Codex 的产品形态拆开看：

端  |  主要用途  |  更像什么
---|---|---
Codex Web / Cloud  |  云端并行任务、GitHub PR、后台 code review  |  OpenAI 托管的 agent runner
Codex App  |  桌面 command center，多线程、多 worktree、多项目  |  本地 agent 工作台
Codex CLI / TUI  |  终端交互、本地代码修改、命令执行  |  面向工程师的原生入口
Codex IDE Extension  |  VS Code、Cursor、Windsurf 等 IDE 内协作  |  编辑器里的 agent 面板
Codex Exec  |  CI、脚本化、一次性任务  |  自动化命令入口
Codex SDK  |  程序化控制 Codex  |  给业务系统接入的开发包
Codex MCP Server  |  把 Codex 暴露给其他 agent harness  |  一个可调用的 coding tool
GitHub Action  |  在 CI 里跑 Codex  |  把 Codex 接进流水线

OpenAI 官方那篇 App Server 工程文章里，有一句话很明确：Codex exists across many different surfaces，web app、CLI、IDE extension、Codex macOS app，背后都由同一个 Codex harness 驱动。

这就解释了一个现象：为什么 Codex 的端越来越多，但不是每个端都从头造一遍。

** 端是入口，harness 才是身体。  **

##  一张图看 Codex 的整体分层

我会把 Codex 分成四层：客户端表面、协议与集成层、本地 runtime、OpenAI 后端与云端环境。

这里最容易误解的是 App Server：

它不是传统意义上的业务后端，也不是简单的 HTTP API。它更像一个本地 agent runtime 的控制接口：客户端通过 JSON-RPC 发起 thread、turn、approval、工具调用，App Server 再把这些请求翻译成 Codex Core 能理解的内部操作。

OpenAI 官方还特别说，它们最早也试过把 Codex 暴露成 MCP server，但 VS Code 这种富交互场景需要 streaming、diff、approval、workspace exploration。MCP 的语义不够贴，所以才演进出了 App Server。

这个选择非常现实，MCP 适合“把 Codex 当工具调用”，App Server 适合“把 Codex 当一个完整 runtime 驱动”。

##  Codex App 是 command center，不是壳子

OpenAI 官网对 Codex App 的定位是 command center for agentic coding，这个词挺准。

App 不是把 CLI 套个 GUI，它真正要解决的是：当你同时跑多个 agent、多个项目、多个 worktree、多个云端任务时，人怎么管得住。

Codex App 这层大概率要承担这些事情：

能力  |  它解决的问题
---|---
多 thread 工作台  |  多个任务同时跑，人不用在终端窗口里迷路
Worktrees  |  一个项目多个分支并行改，降低互相污染
Cloud tasks  |  把长任务丢到云端，机器睡了也能继续
In-app browser / computer use  |  让 Codex 能看到和操作真实页面
Automations  |  把重复任务变成可调度流程
Appshots  |  把运行现场变成可复现上下文
Commands  |  把常用动作固化成入口

这和传统 IDE 插件不是一个方向，IDE 插件更强调“我正在这段代码里，帮我改”，Codex App 更强调“我有一堆 agent 在工作，帮我看住这些任务”。

我自己对这个形态的体感是：它有点像从“单兵作战”切到“塔台调度”，以前一个 terminal 一个任务，挺直接，现在是多个 agent 在本地、云端、worktree 里并行跑，没一个 command center，人很快就会乱。

** 多 agent 时代，UI 的核心不是聊天框，而是任务控制台。  **

##  App Server 才是 Codex App 的关键底座

从客户端到 app-server，可以这么理解：

官方工程文章把 App Server 进程拆成四块：stdio reader、Codex message processor、thread manager、core threads。

这四块串起来，逻辑就很清楚了：

客户端不直接操作 Rust Core：客户端只说：我要 start 一个 thread，我要 resume，一个 turn 开始了，我要 approve 这个命令，或者 interrupt 当前任务。

App Server 负责翻译：它把外部 JSON-RPC 请求转换成内部 core operation，再把内部事件流转成 UI 能稳定消费的 notification。

我本机也核了一下，当前安装的是  ` codex-cli 0.133.0  ` ，  ` codex app-server --help  ` 里已经能看到  ` daemon  ` 、  ` proxy  ` 、  ` generate-ts  ` 、  ` generate-json-schema  ` ，监听方式支持  ` stdio://  ` 、  ` unix://  ` 、  ` ws://IP:PORT  ` 和  ` off  ` 。

这说明 App Server 已经不是一个“顺手给 IDE 用一下”的小接口，而是在变成 Codex 多端统一协议面。

##  Thread、Turn、Item，是 Codex 的三层会话模型

Codex 不是简单的一问一答，它把会话拆成三个 primitive。

Thread 是一条可持久化的 Codex 会话：它能 resume、fork、archive，也能让客户端断线后重新接上。

Turn 是一次用户输入触发的完整任务：一个 turn 里面可能有推理、计划、搜索、读文件、跑命令、改代码、申请用户确认。

Item 是最小事件单元：它可以是 agent message、plan delta、command execution output、file patch、MCP tool call、approval request。

这个抽象很重要，因为富客户端如果只拿到“最终答案”，就做不出好体验，它需要知道：现在执行到了哪一步，哪个命令正在跑，哪个 diff 被生成，哪个操作需要用户确认。

这也是 App Server 选择 JSON-RPC event stream 的原因，一个用户请求会产生一串事件，客户端要边接边渲染。

##  一次 turn 的真实流转

App Server 的时序大概是这样：

这个模型和普通 chat API 最大的区别是：它不是“请求进去，答案出来”，它更像一个任务运行时，客户端一直在订阅运行现场。

所以 Codex App 才能展示进度、diff、执行日志、approval、thread 状态，Web 端也能断线重连，因为状态不在浏览器 tab 里。

这点官方文章讲得也很清楚：Codex Web 的 worker 会在容器里启动 App Server binary，并维护长期 JSON-RPC over stdio，浏览器只通过 Codex backend 的 HTTP / SSE 看事件，网页关掉以后，任务还能继续跑。

这就是 Codex Web 和本地 App 的共同点：都在围绕 App Server 和 Codex harness 做封装，只是运行位置不同。

##  CLI、Exec、SDK、MCP，各有自己的位置

Codex 的集成能力很丰富，但不能混着用，不同入口解决的是不同问题。

集成方式  |  适合场景  |  代价
---|---|---
` codex app-server  ` |  富客户端、IDE、桌面 App、远程控制台  |  要自己处理 JSON-RPC 绑定
` codex mcp-server  ` |  已经有 MCP workflow，只想把 Codex 当 tool  |  会损失一些 Codex 特有的 thread / diff / approval 语义
` codex exec --json  ` |  CI、脚本、一次性自动化、reviewer MVP  |  会话控制能力比 app-server 弱
TypeScript SDK  |  Node 服务里程序化控制 Codex  |  底层还是 spawn CLI + JSONL
GitHub Action  |  PR 流水线  |  适合 CI，不适合富交互

这里我最建议记住一个判断：

别一上来就说“我要接 App Server”，如果只是给 PR 做一轮只读 review，  ` codex exec --json --output-schema  ` 反而最省心，能跑通、能回滚、能进 CI。

但如果你要做自己的 Codex App、IDE 插件、远程 agent 控制台，那就别绕了，App Server 才是正路。

##  沙箱、approval 和本地状态，决定它能不能进生产

Codex 和很多 coding agent 的差别，不只是模型能力，还有本地运行边界。

本地 CLI 里能看到三档 sandbox：

sandbox  |  含义  |  适合场景
---|---|---
` read-only  ` |  只读探索，不改文件  |  review、理解代码、风险分析
` workspace-write  ` |  工作区可写，外部资源受限  |  日常开发、测试修复
` danger-full-access  ` |  不隔离  |  外部已经有容器保护的 CI

` codex exec --help  ` 里也能看到这些参数：  ` --sandbox  ` 、  ` --ask-for-approval  ` 、  ` --output-schema  ` 、  ` --ephemeral  ` 、  ` --json  ` 、  ` --image  ` 、  ` --cd  ` 、  ` --add-dir  ` 。

这说明 Codex 的使用姿势不是“让 AI 随便跑”，更合理的是给不同任务不同边界。

比如 code review：默认  ` read-only  ` ，输出结构化 findings，比如自动修复：  ` workspace-write  ` ，但高风险命令要审批，比如 CI 里的临时容器：可以考虑更宽的权限，但容器本身要短命、可销毁。

还有一个容易被忽略的点：Codex 不是无状态工具，  ` CODEX_HOME  ` 里有 config、auth、sessions、history、logs、sqlite 状态，官方文档也把 config、auth、thread persistence 当成 harness 的组成部分。

这对企业集成很关键，你不能让所有业务 agent 共享同一个全局  ` ~/.codex  ` ，否则登录态、配置、历史、插件和规则全混在一起，后面排查会很痛苦。

更稳的做法是：每个业务 runtime 给独立  ` CODEX_HOME  ` ，每个项目有自己的 AGENTS.md，每类任务有自己的 sandbox 和 approval policy。

##  App Server 协议面已经很大

我本机用  ` codex app-server generate-json-schema --experimental  ` 拉了一份 schema，能看到 v2 里已经不只是  ` thread/start  ` 和  ` turn/start  ` 。

它还包括这些能力：

协议能力  |  说明
---|---
Thread lifecycle  |  start、resume、turns list、items list、archive / unarchive
Turn control  |  start、steer、interrupt、compact
Item stream  |  started、completed、agentMessage delta、plan delta
Command execution  |  exec、write stdin、terminate、terminal interaction
File system  |  read、copy、metadata、create directory
Approval  |  command、file change、permissions、tool input
Models / account  |  model list、rate limits、login
MCP / plugins / skills / apps  |  外部工具、插件、skills、connector 管理
Remote control  |  远程控制状态
Realtime  |  语音列表、realtime closed 等实验能力

这也是我说它是 runtime 的原因，

如果只是一个聊天接口，不需要这么多东西，只有当你要控制一个真实 agent 在真实工程目录里跑起来，才需要 thread、turn、item、command、file、approval、MCP、plugin、rate limit、remote control 这些完整部件。

##  我会怎么理解 Codex App 的系统架构

把所有东西合在一起，Codex App 的架构可以这样看：

这张图里，Codex App 的价值不是“发 prompt”，它真正做的是把一串底层事件变成一个人能理解、能控制的工作台。

一个 agent 在跑测试，另一个 agent 在改 UI，第三个 agent 在云端做 PR review，人不可能只靠聊天记录管理这些事情。你需要 timeline、diff、terminal、approval、worktree、cloud status、automation history。

这就是 Codex App 这个形态的合理性。

##  对第三方系统来说，Codex 最适合当什么

如果你在做自己的 Super Agent、OpenClaw、Claude Code 插件、内部研发助手，我觉得 Codex 最适合扮演三种角色。

第一种，代码 reviewer：

只读沙箱 + 结构化输出 + 必要时跑测试，它不一定要改代码，但它可以给出可追溯的 findings，这里  ` codex exec --json --output-schema  ` 很适合。

第二种，本地执行 worker：

当你的主 agent 擅长规划，但不想直接碰本地 shell 和文件系统，可以把局部任务委托给 Codex，Codex 的优势是本地执行、沙箱、approval、diff 都是现成的。

第三种，富客户端 runtime：

如果你要做一个自己的桌面 App 或企业 IDE 集成，不要自己造 agent loop，直接接 App Server，把精力放在 UI、权限、日志、策略和业务流程上。

这三种角色不能混为一谈，

我的建议很直接：MVP 先用 exec，不要上来就 app-server，等你确认业务价值，再把长会话、断线恢复、富交互这些搬到 app-server。

##  总结

Codex App 不是一个孤立产品，它是 Codex 多端架构里的一个富客户端，而 Codex 多端架构的中心，是同一套 harness 和 App Server。

CLI 负责本地终端体验，exec 负责自动化，MCP server 负责被其他 agent 调用，SDK 负责程序化封装，Web / Cloud 负责托管环境，App 负责把多线程、多 worktree、多云端任务组织成一个人能看懂的控制台。

所以我现在看 Codex，已经不太把它当“另一个 AI 写代码工具”了，

更准确的说法是：Codex 在把 AI 写代码这件事，从模型能力，往 runtime 能力上推。

模型当然重要，但当大家都有强模型以后，真正拉开差距的，会是 sandbox、state、protocol、tooling、observability、integration surface，还有最朴素的一件事：这个 agent 跑起来以后，人到底还能不能管得住。

** 下一阶段拼的不是谁会写代码，而是谁能把 agent 变成可靠的工程系统。  **

* * *

资料参考：

* • OpenAI Codex App Server 工程文章：https://openai.com/index/unlocking-the-codex-harness/
* • OpenAI Codex CLI 文档：https://developers.openai.com/codex/cli
* • OpenAI Codex App Server 文档：https://developers.openai.com/codex/app-server
* • OpenAI Codex SDK 文档：https://developers.openai.com/codex/sdk
* • OpenAI Codex 官网：https://openai.com/codex/

* * *

我是行小招，持续探索 AI 在个人和企业中的落地场景，交给 AI 的是任务，留给自己的是思考。欢迎转发给你身边做技术和产品的同学，一起追逐这个时代！
