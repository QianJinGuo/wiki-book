---
source: wechat
source_url: https://mp.weixin.qq.com/s/iqSixiNP9lxNKg7aVfHFCQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-10
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-05-06
sha256: 8491562b140678154bfd0ad1bcf5ac0ecfb615cab4523b1d79bce75e82ce92ee
---
review_value: 5
review_confidence: 10
review_recommendation: worth-reading
review_stars: 3ingested: 2026-05-10
# Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台
架构师（JiaGouX）  我们都是架构师！
架构未来，你来不来？
* * *
今天，看了 Boris Cherny 在 Sequoia AI Ascent 2026 上这场访谈，又顺手把前面几篇 [ Claude Code ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409043&idx=1&sn=6453858afff384ca9e3709c07f61c1c3&scene=21#wechat_redirect>) 、 [ Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect>) 、 [ 上下文 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 和 [ Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409252&idx=1&sn=3be9425812905ebca39f5e5c3b16fb2f&scene=21#wechat_redirect>) 的稿子翻回来对了一下。
老实说，看完之后第一感受是：这件事好像不太能只放在“AI 写代码更快了”这个框里理解。
访谈里当然有不少容易传播的点。
Claude Code 怎么从 Anthropic Labs 那个三人小组长出来，前半年为什么几乎没有 PMF，为什么 Opus 4 之后曲线突然起飞，Boris 现在又是怎么从手机管理几百个 Agent、一天合掉几十个 PR。
这些都值得看。
产品悬置：能力溢出之后，产品形态才突然成立
这张图可以先帮我们抓住一个背景：Claude Code 的爆发，不太像传统 SaaS 那种一步步验证需求、慢慢打磨 PMF 的路径。
它更像是先赌模型能力会越过某个点，然后提前把产品形态放在那里。前半年不好用，不代表方向错了；等模型能力上来，原来有点超前的交互，突然就成立了。
但我更想顺着它再往里聊一层。
如果只读成“Boris 不亲手写代码了”，这件事很容易滑向职业焦虑那一类讨论。可放到我们这几个月一直在梳理的那条线里， [ Agent Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect>) 、 [ 上下文工作集 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 、 [ Subagents ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 、 [ Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408639&idx=1&sn=ad325d5fa3dd0e112d62b0e34ea3c48a&scene=21#wechat_redirect>) 、 [ 过程资产 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409178&idx=1&sn=6ab1bf7946b83e32b5e660b0db411982&scene=21#wechat_redirect>) ，它其实指向一个更偏工程的问题：
** 开发工具的中心，正在从 IDE 里的光标，慢慢挪到管理 Agent 工作流的那块控制台上。  **
以前我们问的是：  AI 能不能帮工程师更快地写代码。
现在问题慢慢变成：人怎么把目标讲清楚，Agent 怎么持续执行，系统怎么记录过程，风险动作怎么审批，最后结果怎么验证和回滚。
这就不只是 Claude Code 一家的产品变化了。
更像是软件工程控制点的一次迁移。
巧的是，同一场大会上 Karpathy 那场关于 Software 3.0 的演讲，从另一个角度说的也是这件事：执行层被模型快速突破之后，方向层反而更难了。我们 5 月 1 日那篇《 [ Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 》就是顺着这条线写的，这次 Boris 的访谈算是在工程实践这一侧给它补了个具体注脚。
* * *
##  太长不看版
* • Boris Cherny 那句 “coding is solved” 要拆开理解。代码生成在主流场景里确实变强了，但工程里的治理、验证、责任边界还在。
* • Claude Code 的变化不只是补全代码，而是把 Agent 放进仓库、终端、Git、CI、PR 这些真实链路里。
* • 我最想继续看的词是 Loop。它让 Agent 从一次回答，变成持续观察、执行、修复和汇报的工作进程。
* • 这和我们前面写的 Claude Code 源码、长任务、Prompt Caching、上下文工作集、Subagents、Harness、Skills、过程资产是同一条线。
* • 下一代开发工具可能不只是 IDE，也不只是 Terminal，而是能管理 Agent 工作流的控制台。
* • 工程师的价值不会因为少写代码消失，但会更多落到目标、边界、验证、风险和系统所有权上。
* * *
##  写代码少了，不等于工程少了
Boris 在访谈里有一句被引用得很多：  对他自己来说，coding 已经 100% solved。
这句话传播力很强，也很容易引起争论。
我觉得还是先把它拆开看比较好。
Claude Code 自己的代码库主栈是 TypeScript 和 React，正好踩在模型最熟悉的那块分布里。Boris 又在 Anthropic 内部用着最新模型、最新工具、最新流程，整个团队的工作方式都是围着 Claude Code 重新搭起来的。
在这个环境里，他把大部分代码执行交给 Agent，是合情合理的。
但换到另一些场景，事情就没这么简单。
比如一个跑了三十年的 C++ 系统，一个强合规的银行核心，一个嵌入式固件项目，或者一个上线窗口非常窄的生产系统，问题就不只是“代码能不能生成”了。
它还要回答：
历史设计为什么是今天这样。
哪些边界不能动。
变更怎么过审。
数据风险怎么隔离。
失败以后谁来负责。
线上事故怎么回滚。
审计记录怎么留下来。
所以我更愿意把这句话说得保守一点：
** 代码生成正在快速变便宜，软件工程没有因此变简单。  **
很多时候反而是反过来的，Agent 能做的越多，治理问题暴露得越早。
弱一点的补全工具，最多写坏几行代码。一个能读仓库、改文件、跑命令、连 Slack、查数据库、修 CI、开 PR 的 Agent，已经不是普通插件了。
它更像一个新的工程参与者。
这时候只问“模型会不会写代码”，就不够了。
更贴近工程的问题是：它在什么边界里写，怎么知道写对了，错了又怎么停下来。
这层意思其实我们在《 [ 你的AI-First对了吗? 让我们一起看看你的软件工程成熟度 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409030&idx=1&sn=e435a8b1fca46cea3e5514f0541d3a17&scene=21#wechat_redirect>) 》里已经聊过了。模型能力越往上走，差距反而越多落到“工程那一面”。Boris 这次访谈更像是把它推到了一个更日常的现场。
软件版的活字印刷术
Boris 用过印刷术这个类比，我觉得方向是能理解的：当构建软件的成本下降，软件创造会从少数人的专业技能，慢慢变成更多人的基础能力。
但这不等于专业工程会消失。印刷术普及之后，写作没有消失，编辑、出版、版权和审查反而变复杂了。软件也类似，代码更容易生成之后，系统设计、质量控制和责任边界会更重要。
##  Claude Code 这次让我重新看了一眼“工具”这个词
过去几年，AI 编程工具很大一部分想象还是围绕光标展开。
人在 IDE 里停下，模型补下一行。人在函数里写注释，模型补函数体。人在报错处问一句，模型解释原因。
这个阶段里，人是中心，模型是贴在旁边的加速器。
Claude Code 的结构往前走了一步。
Anthropic 官方对它的定位是  agentic coding system  。它可以读取代码库，跨文件修改，运行测试，并在修改文件或执行命令前请求明确权限。
这几个词放在一起，意思就变了。
它不是“猜下一行”。
它是在一个真实工作空间里行动。
旧的开发路径大概是：
人理解需求。
人打开文件。
人写代码。
人跑测试。
人修 bug。
人提交 PR。
新的路径更接近：
人定义目标。
Agent 读取上下文。
Agent 制定计划。
Agent 修改代码。
Agent 运行测试。
Agent 根据失败继续修。
人审查 diff、命令、风险和最终结果。
人决定是否合并。
这里最关键的变化，不是代码作者换了。
而是人的控制点换了。
过去开发者主要控制文件、函数、命令和光标。现在很多时候，开发者控制的是目标、约束、权限、预算、验证和审查。
所以  “程序员变成管理 Agent”  这句话有道理，但如果只停在这层，还是会漏掉一部分变化。
更准确一点说，软件开发的交互界面，正在从编辑器交互，变成工作流控制。
从输入预测到自主代理
这张图把差别说得比较直观：  “系统架构师”  。
输入预测时代，模型更像一个跟着光标走的补全器。自主代理时代，它开始自己读上下文、找文件、跑命令、修失败、再把结果交给人审查。
这时候“工具”这个词也要变一下。它不是一个浮在 IDE 旁边的按钮，而是一整套让 Agent 能进入工程链路的运行环境。
##  关于Loop
Boris 讲了很多很容易被传播的数字。
几百个 Agent。
几千个夜间任务。
一天处理 150 个 PR。
这些数字当然会先抓住注意力。
重构个人工作流：告别键盘
但放到架构视角里，我更想多看一眼的是 Loop。
他现在很多任务已经不是“一次 prompt 得到一次回答”。比如盯 PR，自动修 CI，自动 rebase；比如持续观察某个测试是不是 flaky；比如每隔一段时间从 Twitter 把对 Claude Code 的反馈拉回来，聚类整理之后再发给他。
这些事都不是聊天。
它们更像长期跑着的工作进程。
普通 AI 对话是：
我问一次。
你答一次。
上下文停在那里。
Agent Loop 是：
我定义目标。
你定期观察。
你持续执行。
你发现异常。
你尝试修复。
你记录过程。
你把关键结果推给我。
我只在需要判断、审批、取舍的时候介入。
这个变化很重要。
用 Loop 构建长期运行的代理系统
因为一旦 Agent 变成长期进程，开发工具展示“模型说了什么”就不太够了。
它还要让人看见：
Agent 正在做什么。
跑到哪一步。
失败几次。
改了哪些文件。
调用了哪些工具。
花了多少 Token。
有没有触碰危险资源。
哪些动作需要人工确认。
这就把 IDE 推到了一个新位置。
以前 IDE 是写代码的地方。
以后它很可能变成 Agent 工作流的观察台、调度台和审查台。
这也是我说“Agent 控制台”的原因。
未来已来，等待执行
这张图我挺喜欢。
它没有把 Agent 写成一个万能按钮，而是把重点放在三件事上：  重构工作流，升级团队拓扑，重新聚焦领域。
看起来像几行命令，但我看到的不是  “敲一下，未来就自动执行”。
我读到的反而是另一层意思：  AI 走到 Agent 这一步，最后还是要回到人怎么组织工作。
这就让我想到我们《架构师》一直挂在嘴边的那几句话：
我们都是架构师。
架构未来，你来不来？
以前说“我们都是架构师”，多少还有一点理想化。
毕竟很多人会觉得，  架构是架构师、技术负责人、平台团队的事，和每天写需求、改 Bug、做交付的人隔着一层。
但 Agent 进来以后，这层距离在变短。
你让它做什么，不只是写一句 Prompt。
你要把需求拆到它能理解的程度，把上下文交给它，把边界说清楚，把风险点留给人看，把结果接回团队原来的流程里。
这里面每一步，其实都是架构。
模型可以帮我们省掉很多手工活，但它不会天然知道一个团队最在乎什么，也不会替我们承担一次错误上线、一次权限放大、一次领域误解带来的后果。
所以“架构未来，你来不来？”放在这里，更像是在提醒我们自己：
未来不是等模型变强以后自然发生的。它需要一群做工程的人，一点点把人、Agent、流程、权限和领域知识重新摆好。
能不能摆得顺，可能就是接下来几年软件团队拉开差距的地方。
##  这条线和前面几篇正好接上了
回头看最近一段时间我们在《架构师》里梳理的内容，Boris 这场访谈像是一个汇合点。
4 月初我们拆 Claude Code 源码《 [ Claude Code 源码架构解析：从启动、Prompt 到权限管道 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408943&idx=1&sn=99626f852eba63c7a5134c976b9f031d&scene=21#wechat_redirect>) 》时，主要在看一个本地 Agent Runtime 怎么启动，怎么装配 Prompt，怎么进入主循环，怎么把权限管道挡在工具调用前面。
那时更关心的是：  Claude Code 为什么能跑起来。
之后写长任务《 [ Claude Code 长任务为什么不容易跑偏 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) 》、Prompt Caching《 [ Claude Code 为什么缓存命中率能做到 92% ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409101&idx=1&sn=5c1ac7bd71b07c4767c19dc53d5a6c13&scene=21#wechat_redirect>) 》、上下文工作集《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》和 Subagents《 [ Subagents 详解：Claude Code 如何避免上下文污染 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》，思路慢慢往外走了一层。
Agent 不是靠一次聪明回答完成复杂任务，而是靠上下文、状态、压缩、隔离和验证，把一个任务撑到最后。
再往后看 Harness，《 [ 模型差距在缩小，Harness 差距在放大 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408973&idx=1&sn=e147f34daa2d9e3ea431d985b08486e5&scene=21#wechat_redirect>) 》和《 [ Agent Harness 综述 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect>) 》这两篇里，我的理解又变了一次。
同一个模型放进不同 Coding Agent，体感差距往往不在模型本身，而在模型外面那套运行底座：工具怎么定义，上下文怎么取，状态怎么留，权限怎么管，失败怎么恢复。
到 前两天《 [ 从 30 分钟手搓 Agent，到 Harness 成为"新后端" ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 》时，这个问题已经接到了后端边界。
Agent 会读状态、写状态、开任务、查日志、恢复失败。后端如果继续把它当一个普通的外部 API 调用方来看，会越来越吃力。
Cursor 的 Harness 复盘《 [ Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 》又帮我们补了一层运营视角。
Harness 一旦承重，就要像线上系统一样持续评估、观测、回滚，也要在模型升级之后及时清掉那些已经过时的补丁。
这两天再看 Boris 讲 Loop、并行 Agent、手机里的 session、Anthropic 内部流程，前面这些线索就被放进了同一张图里。
源码里的主循环、上下文工作集、Subagents、Harness、Skills、过程资产，并不是几件分散的事。
它们都在给 Agent 补同一套底座。
所以这篇我不太想停在访谈摘要那一层。
更想顺着前面这条线再往下走一步：
** 当 Agent 从“回答者”变成“执行者”，软件工程要补一套新的工作系统。  **
Boris 这场访谈，把这个问题推到了更日常的工作方式里。
它不是只发生在未来某个宏大的时刻，而是先从修 CI、整理反馈、开 PR、写 SQL、查数据、改文档这些不起眼的事情开始。
##  SaaS 不会简单消失，但入口会被重排
Boris 还谈了 SaaS 护城河。
他借用 Hamilton Helmer 的 Seven Powers 框架，说 AI 会削弱 switching cost 和 process power，网络效应、规模经济、独占资源这些仍然有效。
商业护城河的消亡与重塑
这句话如果直接简化成“SaaS 要完了”，会少掉很多企业软件里的现实约束。
我更愿意这样理解：
** 很多 SaaS 不会消失，但会从人的前台入口，退到 Agent 的后台能力层。  **
过去人每天打开 CRM、Jira、Notion、Google Docs、Excel、ERP、BI，在不同界面之间切来切去。
Agent 出现以后，用户可能只在一个工作台里说：
查一下这个客户最近三个月的沟通记录。
把风险点列出来。
更新 CRM。
生成跟进计划。
同步到 Slack。
月底汇总到经营报表。
这时候 Salesforce 还在，Jira 还在，Google Docs 还在，数据库也还在。
变化是：人不一定再直接操作它们。
Agent 成了入口。
这也是为什么 MCP 和 Computer Use 都重要。
MCP、API 与 Computer Use 正在重塑知识工作入口
有稳定接口的系统，通过 MCP、API、CLI 暴露能力。没有接口、没有文档、甚至只能点界面的老系统，短期可能要靠 Computer Use 兜底。
但不管是哪条路，核心都是一样的：
外部系统要变成 Agent 可理解、可调用、可审计、可治理的能力。
过去企业软件竞争的是界面、流程、模板、审批体验。
以后很多场景会竞争能力目录、权限边界、数据质量、审计记录和被 Agent 调用时的可靠性。
能被安全调用的系统，会继续留在工作流里。
只能靠人点界面的系统，存在感可能会慢慢往后退。
SaaS 价值正在被重新估价
这里我会稍微保守一点。
AI 会降低软件构建成本，但企业软件的价值不只在“功能能不能做出来”。数据口径、权限体系、审计链路、业务关系、合同和组织习惯，这些东西不会一夜之间消失。
所以更像是价值重排：单纯靠功能堆叠的 SaaS 压力会更大，能掌握数据、流程、领域结果和合规责任的系统，位置反而会更清楚。
创业者的黄金时代：小团队的速度优势被放大
这也是为什么 Boris 会提到小团队的机会。
我不想把它写成“大公司一定输，小公司一定赢”。
现实没这么简单。但有一点很明显：当构建成本下降，小团队从 0 到 1 的速度会变快；而大组织要改流程、改权限、改考核、改协作习惯，速度不会跟模型升级一样快。
##  模型升级很快，组织升级没那么快
Boris 有个判断我觉得很值得琢磨。
Anthropic 内部真正领先的地方，不一定是模型本身，而是组织流程。
他提到，Anthropic 内部已经把 Claude 用到很多环节。Agent 会通过 Slack 和其他人的 Agent 沟通。SQL 由模型写，代码也大量由模型生成。
这类说法要打个边界。
外部团队不能直接把 Anthropic 的内部状态照搬到银行、医院、制造业、政务系统，甚至也不能照搬到一个已经运转十年的中大型 SaaS 公司。
Anthropic 的优势不只是用了 Claude。
它的组织、产品、模型、权限、团队文化和工具链，都是围绕这件事长出来的。
很多公司现在的问题是：模型接进来了，组织没变。
工程师还是按老流程排需求、写代码、提测、上线、修线上问题。AI 只是某个环节里的辅助工具。
这样也会有提升，但和 Boris 描述的那种工作方式，不是一回事。
如果 Agent 真要进入组织，就会冒出一堆新问题：
哪些任务可以交给 Agent 常驻。
哪些任务只能由人触发。
Agent 能不能直接开 PR。
谁审查 Agent 的输出。
Agent 之间能不能互相发消息。
跨团队问题谁来兜底。
失败日志归谁看。
成本预算按人算，还是按任务算。
一个 Loop 跑坏了，谁有权限停掉它。
这些不是模型能力问题。
这是组织设计问题。
组织结构的演化：从专业孤岛到跨学科融合
Claude Code 团队里，工程经理、产品经理、设计师、数据科学家、财务、用户研究都在写代码。这个细节很有意思。
它不是说每个人都要变成传统意义上的软件工程师，而是说代码正在变成团队里更多角色共同使用的一种表达方式。以前靠工单和口头描述转一圈的事情，现在有些角色可以自己先跑出一个可验证的原型。
这会改变团队拓扑。
过去是专业孤岛之间互相交接。以后更像是每个角色都保留自己的专业深度，同时具备一点把想法落成软件的能力。
真正的鸿沟不在技术，而在组织架构与业务流程
模型升级可能几周一次。
组织升级往往按季度、按年算。
所以“大家都能拿到同一个模型”，不代表差距会很快抹平。
更慢的是流程、责任、权限、文化和评估体系。
##  最后还是回到工程师/架构师自己
我不太愿意把这类访谈直接写成职业替代故事。
Boris 自己今年 2 月在 X 上回应过类似问题，原话大致是："Someone has to prompt the Claudes, talk to customers, coordinate with other teams, decide what to build next. Engineering is changing and great engineers are more important than ever." Simon Willison 当时也把这条转到了自己的 weblog 上。换成更日常的说法就是：总得有人去 prompt Claude，去跟客户聊，去协调团队，去决定下一步做什么；工程在变，但优秀工程师反而更重要。
这句话更贴近我自己的体会。
因为写代码只是工程工作的一部分。
更难的往往是：
什么问题值得做。
需求背后真正约束是什么。
哪些方案现在能落地。
哪些风险不能接受。
这个变更会不会影响旧用户。
哪个指标能证明它真的变好。
什么时候该停下来。
什么时候要推翻重来。
Agent 可以生成代码，但它很难  自动  拥有这些上下文。
尤其在复杂业务里，最值钱的不是“知道某个 API 怎么写”，而是知道这套系统为什么长成这样，哪些历史约束还没消失，哪些业务规则不能靠表面文档理解。
领域专家的胜利：深度业务知识加自主代理
这一点和图里的会计软件例子很像。
未来最懂会计软件的人，未必是最会写前端和后端的人，而可能是一个熟悉税务逻辑、业务流程和用户痛点的资深会计，再加上一套足够好用的 Agent 工作系统。
这不是在贬低工程能力。
恰恰相反，越是这种场景，工程能力越要往系统边界、数据模型、权限、验证和长期可维护性上走。
所以工程师能力会从“亲手生产代码”，更多转向“拥有系统结果”。
这听起来有点抽象，换成日常工作，会越来越体现在这些地方：
把一个含糊需求整理成 Agent 可以执行的规格。
把大任务切成几个互不污染的工作单元。
判断 Agent 的方案是否漏了关键边界。
设计测试和评估，让结果自己说话。
看懂 diff 背后的架构影响。
区分哪些动作可以自动，哪些需要人工确认。
把一次成功经验沉淀成团队 Skill 或 Runbook。
这些能力过去也重要。
只是过去它们经常被大量手写代码的工作量盖住。
现在代码生成变快，这些判断反而露出来了。
这对很多工程师来说，需要一点时间适应。
毕竟亲手写出代码，是我们进入这一行很重要的成就感来源。把越来越多执行交给 Agent，不只是效率变化，也会改变工程师对自己角色的理解。
但换个角度看，这也可能是一件好事。
样板代码、重复修改、机械排障、低风险迁移慢慢被 Agent 接过去以后，人可以把更多精力放回那些更难、也更有价值的问题：
要做什么。
为什么做。
边界在哪。
怎么证明它对。
出错时怎么收回来。
这才是 Claude Code 这次给我的提醒。
我不太想把重点放在“以后还写不写代码”上。
更值得研究的，是软件工程正在从代码生产，慢慢走向 Agent 工作系统的设计。
Karpathy 在那场演讲末尾有一句话我隔几天就会想起来一次：“你可以外包思考，但你不能外包理解。”用在 Boris 这条线上同样合适。
这条线，才刚刚开始。
* * *
原视频链接：
https://www.youtube.com/watch?v=SlGRN8jh2RI
参考资料：
* • Andrej Karpathy：《Sequoia Ascent 2026: Software 3.0, Agentic Engineering, and Jagged Intelligence》，https://karpathy.bearblog.dev/sequoia-ascent-2026/
* • Anthropic Claude Code 产品页，https://www.anthropic.com/product/claude-code
* • Anthropic Claude Code MCP 文档，https://docs.anthropic.com/en/docs/claude-code/mcp
* • ITPro：Claude Code creator Boris Cherny says software engineers are "more important than ever"，https://www.itpro.com/software/development/claude-code-creator-boris-cherny-says-software-engineers-are-more-important-than-ever-as-ai-transforms-the-profession-but-anthropic-ceo-dario-amodei-still-thinks-full-automation-is-coming
* • Simon Willison：A quote from Boris Cherny，https://simonwillison.net/2026/Feb/14/boris/
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