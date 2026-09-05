---
title: Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重
source_url: https://mp.weixin.qq.com/s/Ya0M9C-TBY_d3lzcmipRDA
publish_date: 2026-05-09
tags: [wechat, article, claude, openai, agent, harness, rag, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: ce599133a2b74e60f49a55bd6654a7eb8f11ad616f1e13e4c15bbee738cd4db8
---
# Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重
架构师（JiaGouX）  我们都是架构师！    
架构未来，你来不来？ 
* * *
五一期间抽空把 Martin Fowler 在 The Pragmatic Engineer 播客那场两个多小时的访谈又听了一遍，顺手对了一下他后来写的几段 AI 研发随笔、OpenAI 的 Harness Engineering 那篇、LangChain 给 Agent Harness 下的定义，以及最近网上围绕 Karpathy、Boris Cherny、Agentic Engineering 的一些零散讨论。 
听完之后，让我反复琢磨的，反倒不是“AI 是软件工程最大变化”这句话本身。 
这句话分量当然在。Fowler 经历过面向对象、敏捷、重构、企业架构这些软件工程史上的拐点，他说这是自己职业生涯里最大的一次变化，多少是要听一下的。 
不过更打动我的，是他把这件事压回到一个更老、也更朴素的问题上： 
** 软件工程过去几十年都建立在一台确定性机器上。现在，我们把一个非确定性的协作者接进了研发链路。  **
这个角度一摆出来，很多看上去特别热闹的新词，反而能各归各位。 
Vibe Coding、Agentic Engineering、Context Engineering、Harness Engineering、Subagents、Skills、Agent 控制台，其实不是各讲各的热点。绕来绕去，大多都在回答同一个问题： 
当 AI 不只是补全两行代码，而是开始读仓库、改文件、调工具、跑测试、开 PR、查日志、修 CI 的时候，整个研发系统怎么消化这种非确定性。 
这篇就不做访谈的逐段复述了，原访谈很长，感兴趣的同学可以直接戳文末链接。 
我想顺着这条线，把一个我们这阵子在我们《架构师》里反复绕回去的老问题再串一下：  为什么这一年 AI 研发的重点，正在悄悄从“让模型更会写代码”，挪到“把非确定性包进一个可验证、可回滚、可治理的工程系统里”。 
过去几个月，我们一直沿着 [ Claude Code ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408943&idx=1&sn=99626f852eba63c7a5134c976b9f031d&scene=21#wechat_redirect>) 、 [ Coding Agent ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408973&idx=1&sn=e147f34daa2d9e3ea431d985b08486e5&scene=21#wechat_redirect>) 、 [ Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 、 [ 过程资产 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 、 [ 上下文工作集 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 这条线往下梳理。单独看，每个话题都有自己的切口；放在 Fowler 这个提醒下面看，它们其实都在补同一块工程拼图。 
AI 研发主线从代码生成更快转向非确定性进入工程系统 
* * *
##  太长不看版 
  * • Fowler 这次让我最受用的，不是“AI 带来更高抽象”这一层，而是他把变化压回到“软件工程第一次大规模面对一个非确定性协作者”这件事上。 
  * • Vibe Coding 的边界其实挺清楚：原型、一次性工具上很好用；一旦做成长期资产，难的就变成学习循环、代码所有权和系统可理解性。 
  * • TDD、重构、CI、静态检查不仅没过时，反而更扛事了。AI 生成越快，确定性反馈越值钱。 
  * • Harness 不只是个新包装词。把它当成“非确定性适配层”更顺手：上下文、工具、权限、测试、观测、垃圾回收都在这层承重。 
  * • Agentic Engineering 的重点不是把人从工程里抽走，而是把人的工作往目标、边界、验证、治理和经验沉淀这边挪。 
  * • 团队这边可以先慢一点：与其急着搭“全自动 AI 团队”，不如先把六件小事补上——小切片、强验证、仓库内知识、权限边界、错误分类、持续清理。 
* * *
##  Fowler 说的不是“再高一层抽象” 
这一年多，圈子里很多人喜欢把 AI Coding 类比成当年从汇编语言到高级语言的那次跃迁。 
这个类比有用，但也容易让人会错意。 
从汇编到 Fortran、C、Java，确实是抽象层次上移。工程师不用再天天盯着寄存器和指令集，可以用更接近业务逻辑的语言去表达程序。 
但这条路有个隐含前提：底下那台机器，仍然是确定性的。 
代码怎么编译，测试怎么跑，函数在相同输入下输出什么，CI 为什么红了，这些事情不一定简单，但原则上是可复现、可定位、可推导的。 
LLM 带来的麻烦，不只是又叠了一层抽象那么轻。 
你给它同一个目标，它可能用不同路径完成；你让它解释一次失败，它可能解释得有鼻子有眼，却根本没回到真实环境验证；你让它就改一小处，它可能顺手把旁边几处“看起来也该优化”的地方一起动了。 
这就是 Fowler 反复强调的那层变化：我们不再只是用一门更高级的语言去操作一台确定性机器，而是把一个概率性系统直接放进了工程过程里。 
放到这个角度看，过去几个月很多争论其实可以收敛一些。 
不是  “AI 到底会不会取代程序员”  这种粗线条问题。 
而是几个更具体的小问题： 
  * • 这段非确定性输出，怎么进入一个确定性的验证链路？ 
  * • 这次成功，是偶然跑通，还是可以被下一次复现？ 
  * • 它犯过的错，能不能变成下次自动生效的工程约束？ 
  * • 它看不见的信息，能不能变成仓库内、版本化、可检索的上下文？ 
  * • 它触碰高风险资源时，系统有没有一个模型绕不过去的边界？ 
这些问题一出现，讨论就从“提示词写得好不好”，进入了真正的软件工程。 
* * *
##  Vibe Coding 的边界，是学习循环 
Fowler 对 Vibe Coding 的态度挺克制。 
探索、原型、一次性脚本、临时工具，他承认它很好用。这一点我自己也很认。 
这一年我们在《架构师》里前前后后聊过 [ Claude Code ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) 、 [ Karpathy ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 、 [ Boris ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409270&idx=1&sn=37a9663c8a6cd37d9e17dea59d65f4b1&scene=21#wechat_redirect>) 、 [ Cursor ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 、 [ Hermes ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409178&idx=1&sn=6ab1bf7946b83e32b5e660b0db411982&scene=21#wechat_redirect>) ，从没把 Vibe Coding 当玩具看。包括我自己，也经常在  Vibe Coding  。它确实把软件创造的下限拉低了一截——以前不值得排期的小工具，现在一个下午能跑起来；以前根本不写代码的人，也能把一个想法做成能点一点的东西。 
不过 Fowler 提醒的另一半也得放在桌面上：长期资产没办法只靠“感觉差不多能跑”。 
因为软件工程里藏着一条很隐蔽的学习循环。 
你写代码、读反馈、理解系统、修正设计；    
你读别人的代码，知道边界在哪、哪个抽象不能乱动；    
你亲手做一次重构，才会分清哪些依赖是历史包袱，哪些约束是真正的业务规则。 
如果 AI 写完之后，人不看、不理解，也不 review，只是在报错时继续往上加 prompt，这条循环就被悄悄掐断了。 
短期看，人是显得更快了。 
放长一点看，系统会慢慢变成另一种东西——“能跑，但没人真正理解”。等到哪天复杂度超过模型单次能搞定的范围，团队往往只剩两种动作：要么继续让模型蒙，要么推倒重来。 
这也是 [ Karpathy ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 一周年回看 Vibe Coding 时，值得单独停下来看的地方。他开始更偏好 [ Agentic Engineering ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 这个说法，背后已经塞进了方法、纪律和经验，而不只是“让 agent 替你写两行”。 
我们之前聊 [ AI-First ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409030&idx=1&sn=e435a8b1fca46cea3e5514f0541d3a17&scene=21#wechat_redirect>) 、聊 [ Google 工程师把日常工作自动化掉 80% ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409043&idx=1&sn=6453858afff384ca9e3709c07f61c1c3&scene=21#wechat_redirect>) 后还剩什么，其实也在绕这个问题：模型可以帮你提速做你已经会做的事，但它替不了工程师身上那条学习循环。 
如果硬要把这件事压成一句口语，我自己更愿意这么说： 
** Vibe Coding 解决的是怎么把东西做出来。Agentic Engineering 关心的是，做出来之后，人和系统还能不能继续拥有它。  **
“拥有”不是版权意义上的那种，而是工程意义上的：知道它为什么这样设计、怎么验证、出事了怎么回滚，下次再做同类任务时，能少踩一次坑。 
* * *
##  测试和重构不是旧时代的包袱 
Fowler 是《重构》的作者  ，访谈里聊到 AI 时代的重构，自然顺过来了。 
但他给出的方向，一点都不怀旧。 
AI 生成代码越快，越要把变更切小。 
听起来像老生常谈，但放到 Agent 语境里，意思已经悄悄变了。 
以前小步提交，是为了让人类工程师 review 更轻、回滚更容易。 
放到现在，小切片还多承担了一件事：限制模型一次性发散的半径。 
一个 Agent，如果一次改 20 个文件、顺手重命名几个概念、再把测试补一遍，乍看很能干，review 的时候却很难判断每一步到底是不是必要。你也分不清，它到底是顺着真实约束在走，还是在用一个看着合理的故事，把变更串起来。 
更稳一点的做法，还是薄切片： 
  * • 先让它只理解一段逻辑； 
  * • 再让它只改一个边界； 
  * • 改完马上跑测试、类型检查、lint； 
  * • 能用 IDE 确定性重构工具做的，不要让模型凭文本猜； 
  * • 需要模型参与时，让模型生成意图或计划，执行交给更确定的工具。 
这里有一个挺重要的取舍：LLM 很擅长从一个模糊意图里给你拉出一个起点，但它不应该替代所有确定性工具。 
像跨文件重命名、抽取函数、移动类、格式化、依赖边界检查，这些事 IDE、编译器、静态分析工具已经磨了二十年。让模型重新发明一遍，未必更聪明，反而更容易跑偏。Fowler 自己也举过那个例子：让 LLM 跨文件改一个类名，可能烧掉一整月十分之一的 token 都没改完，而 ReSharper 这种工具一秒钟就搞定。 
所以我越来越倾向于把 AI Coding 看成两层叠加： 
** 模型负责理解意图、探索路径，确定性工具负责执行、校验和收口。  **
这也是 Fowler 那句“不要让 LLM 做可以确定性计算的事”背后真正的工程味道。 
如果一个答案能由程序算出来，就让程序算；    
如果一个变更能由重构工具完成，就让重构工具做；    
如果一个风险能由测试、类型、策略、权限系统提前挡住，就别只靠 prompt 祈祷模型这次听话。 
* * *
##  Harness 是非确定性的适配层 
顺着前面这条线，就走到了 Harness 这个词上。 
这阵子，Harness 算是我们公众号架构师绕得最频繁的一个词。 
前面我们有时从 Coding Agent 的模块拆，有时从上下文工作集拆，有时从 Subagents、Skills、Cursor 复盘、Agent 新后端这些角度拆。每个切口看的是一小块，但 Fowler 这条线，正好把它们收到了一句话上： 
** Harness 是把非确定性能力接入工程系统的那层适配层。  **
Harness 作为非确定性能力与确定性工程系统之间的适配/承重层 
它不是某一个具体的框架，也不只是多写几条规则。 
LangChain 那篇《The Anatomy of an Agent Harness》把公式写得很直接：Agent = Model + Harness。模型出智能，Harness 让智能真正能用上。文件系统、工具、沙箱、状态、子代理、钩子、验证、长任务控制，都得算到 Harness 这一层。 
OpenAI 的 Harness Engineering 那篇文章，则把这个事推到了更工程化的另一面。 
他们在 Codex 的实践里反复在讲几件很朴素的事： 
  * • 计划是第一等工程资产，复杂任务的执行计划和决策日志要进仓库； 
  * • 文档不能只活在 Slack、Google Docs 或者人的脑子里，Agent 看不见，就等于不存在； 
  * • 架构规则要交给 linter 和 CI 机械执行，不能只写在 wiki 里； 
  * • 技术债要靠持续的小 PR 一直清，而不是攒成一个大坑等专项治理； 
  * • 人的品味和边界，要尽量编码到仓库里，让后面跑的 Agent 自动继承。 
Mitchell Hashimoto 那篇《My AI Adoption Journey》也很适合摆在这边看。 
他不是从“AI 要改变一切”这种大判断写起，而是从自己一开始的低效、怀疑、试错写起。一路走下来，他给自己总结了一个很朴素的动作：Engineer the Harness。Agent 犯错以后，不光是这次手工修掉，而是把“怎么防止同类错误再发生”的机制补回系统里。可能是一条  ` AGENTS.md  ` 规则，可能是一个截图脚本、过滤测试的脚本，也可能是一个更方便 Agent 自己验证结果的小工具。 
这类经验我觉得是真正值钱的。 
因为它把 Harness 从一个高大上的概念，拉回到了工程师每天能做的小动作上：一次失败，换一条以后自动生效的约束。 
这和 Fowler / Thoughtworks 那篇 Harness Engineering 后来给出的拆法也能对得上：上下文工程、架构约束、代码库垃圾回收，外加 guides 和 sensors 这组控制视角。 
我自己习惯把这几个词翻得更土一点： 
  * • guides 是事前引导：规则、文档、工具描述、架构边界、任务模板； 
  * • sensors 是事后感知：测试、lint、日志、指标、评估器、错误分类、用户反馈； 
  * • garbage collection 是持续清理：删掉旧补丁、订正文档、扔掉不再适合新模型的护栏。 
这几样东西放在一起，才比较像一套能长期跑下去的系统。 
否则所谓 Agent，很容易就只是“一个能调用工具的聊天框”而已。 
* * *
##  最危险的不是模型犯错，而是系统相信它没犯错 
AI 写错代码本身不新鲜。 
真正麻烦的是：它错得很像对。 
它会解释。    
它会道歉。    
它会告诉你测试通过了。    
它会给一段看上去逻辑挺顺的原因。    
甚至会顺手把一个错误，包装成“我已经修复”的状态。 
Fowler 自己在访谈里就讲过那个让人哭笑不得的例子：让 LLM 在配置注释里写上当天的日期，它写成了上次的；指出来，它认真道歉，然后改成了昨天的。这种小事都能 gaslight 你，更别说复杂的代码改动。 
所以在 Agent 系统里，安全感不能来自模型的语气。 
只能来自外部反馈。 
落到软件工程里，这些反馈其实都很具体：测试有没有过，类型对不对，依赖边界有没有被破掉，敏感操作有没有走审批，日志里有没有冒出异常，PR 合进去之后代码是不是很快又被用户删掉，线上指标有没有跟着抖。 
Cursor 的 Harness 工程复盘讲的也是这件事，我们之前专门拆过这套打法。 
他们不只看 benchmark，还看真实用户有没有保留 Agent 生成的代码，看用户下一句是不是继续报错，看工具的 unknown error rate 是不是按模型和工具切片在涨。这个思路很工程，也很朴素： 
不要只问“模型觉得自己做完了没”。 
要看结果到底有没有在真实流程里留下来。 
安全这一块，逻辑是一样的。 
Simon Willison 2025 年提过一个 “lethal trifecta”：私有数据、不可信内容、对外通信能力。一旦这三个能力同时出现在一个 Agent 上，prompt injection 就有机会变成数据外泄路径。 
这不是写一句“不要泄露用户数据”就能挡掉的事。 
Agent 越有用，越容易同时碰到数据、网页、邮件、Slack、数据库、API、文件系统。能力越连通，边界越要机械化。 
所以在 Agent 系统里，权限不应该是产品设置页里一个 checkbox，而是 Harness 的核心结构。 
模型可以提出动作；    
系统决定这个动作能不能执行；    
高风险动作必须走审批；    
不可信输入和私有数据之间要做隔离；    
对外通信要有可审计的出口；    
失败要留下结构化的痕迹。 
这些听起来都不太性感，但 Agent 想从 demo 阶段走进生产环境，大概就要从这些不性感的地方一节一节补上去。 
* * *
##  工程师没有消失，只是进入了中间循环 
Fowler 在 2026 年 3 月那篇 Fragments 里，转述了 Annie Vella 对 158 位工程师的一项研究，里面有个挺好用的词：supervisory engineering work。 
粗暴翻一下，就是“监督式工程工作”。 
过去我们习惯讲内循环和外循环。 
内循环是写代码、跑测试、调试；    
外循环是提交、review、CI/CD、发布、观测。 
AI 接进来之后，好像在中间又长出来一层：工程师要定义任务、组织上下文、监督 Agent 执行、评估输出、把这次的错纠正为下一次的规则，再把经验沉回系统。 
这和我们这阵子陆续观察到的方向是同一件事的不同侧面：Agent 能做的事情变多以后，人的位置在往后挪。 
Google 工程师把日常工作自动化掉一大半之后，剩下的是判断、拆解和验证；Karpathy 讲 Agentic Engineering，强调的是方法和纪律；Cursor 复盘 Harness，关心的是线上反馈和持续运营；Boris Cherny 的工作流，则把开发工具从 IDE 推向了 Agent 控制台。 
Boris 现在的状态也能拿来对一下。他已经不太是坐在 IDE 里一行一行敲代码了，更多是在管一批 Agent：分发任务、看 PR、处理 CI、在手机上审批合并。但如果只是把它理解成“程序员转岗去管 AI”，又把这件事看浅了。 
更准确的说法是，人的控制点换了位置。 
工程师从控制光标进入目标、边界、验证和系统演进的中间循环 
过去控制的是光标。    
现在控制的是目标、边界、权限、验证和系统演进。 
这并不是工程含量被稀释了。 
很多时候，工程含量反而更集中了。 
因为写代码这件事本身变便宜以后，真正贵的东西就被暴露出来：需求有没有说清楚，边界稳不稳，抽象能不能扛住未来的变化，测试有没有盖住关键风险，工具能不能给出可信反馈，架构规则是不是机器能执行的。 
这也是为什么我一直不太喜欢“程序员要不要转型去做产品经理”这种说法。 
产品判断当然重要，但软件系统不会因为 AI 会写代码就自动变简单。 
相反，非确定性一旦进入研发链路，架构、测试、可观测性、安全、治理这些老问题，都被放大了一圈。 
工程师仍然在工程里。 
只是很多手工动作会被压缩掉，系统设计和反馈设计会被往前提一截。 
* * *
##  想动手的话，可以先从六件小事开始 
上面写了那么多，如果直接翻成“我们要建一个 Agentic Engineering 平台”，多半会走偏。 
很多团队其实还远没到需要一个宏大 Agent 控制台的阶段，也用不着一上来就跑几十个后台 Agent。 
更现实一点的起点，是先把现有研发系统整理到 Agent 能稳定工作的程度。 
我自己手头如果要重新捋一遍，大概会先看下面这六件不太起眼的小事。 
###  1\. 把任务切小 
我一般不会一上来就把“重构整个模块”丢给 Agent。 
先从那种可以独立验证的小任务下手：补一个测试、修一个边界明确的 bug、解释一段调用链、替换一个确定性 API、清理某一类 lint 问题。 
切片越小，review 越轻，回滚越简单，出错时也更容易定位是哪一步出了问题。 
###  2\. 把知识放回仓库 
Agent 看不到人开过的会、聊过的天，也读不到你脑子里那段“当时为什么这么设计”的历史。 
重要的设计决策、约束、运行方式、目录边界、踩过的坑，尽量都变成仓库里的文档、规则文件、执行计划、ADR。 
这不是为了文档好看，而是为了让人和 Agent 能在同一个地方拿到上下文。越往后，仓库里的那份知识越像 Agent 的工作记忆：它能不能找到，能不能理解，能不能被验证，会直接影响它能走多远。 
###  3\. 让验证先跑起来 
没有测试，就先补关键路径上的测试；    
没有类型约束，就先补一层边界校验；    
没有 lint，就先把最能挡事故的几条规则配上；    
没有架构边界检查，就先把最危险的那个依赖方向挡住。 
Agent 自动化能走多远，很多时候就看反馈能多快回来。 
###  4\. 权限按风险分层 
读文件、写文件、跑测试、改依赖、连数据库、发外部请求、删除数据、合并 PR，这些动作不应该挂在同一档权限上。 
低风险动作可以自动放过；    
中风险动作要确认；    
高风险动作必须审批、记录、可回滚。 
这不是不信任模型，是正常的软件工程边界，跟人也是这么做的。 
###  5\. 错误要分类 
不要只留一句干巴巴的  ` tool failed  ` 。 
至少分清：参数错误、环境错误、权限错误、超时、供应商错误、用户中止、测试失败、验证失败。 
错误一旦分清楚，很多“模型又不行了”就会变成一个可以排查的具体问题。 
###  6\. 把经验写回 Harness 
Agent 犯一次错，人手工把它修掉，当然没问题。 
但更值钱的动作是再多走一步：这次为什么会出错，下次能不能让它更难发生。 
可能是补一条测试，    
可能是加一条 lint，    
可能是改一段任务模板，    
可能是补一条文档索引，    
可能是做一个工具参数校验，    
也可能是加一个审批规则。 
这就是 Harness 一点点变好的方式。 
不是某一次设计完就万事大吉，而是在每次失败之后，再往系统里多塞一点确定性。 
* * *
##  写在最后 
Fowler 在他自己那些随笔里，其实一直挺谨慎。 
他没有声称自己知道 AI 会把软件工程带去哪儿，也没把某一种工具、某一套方法包装成标准答案。他更像是在不停提醒：现在还很早，别被那个平均数骗了，别把不同工作流混在一起比较，更别因为模型语气流畅就放弃验证。 
这种谨慎，我自己挺受用的。 
过去这一年多，AI Coding 的讨论很容易在两个极端之间来回摆。 
一边说代码已经不重要了；    
另一边说 AI 写的都是垃圾。 
放回真实工程里看，两边其实都说得有点粗。 
更贴近现实的那种变化，可能就是几句很普通的话： 
代码生成在变便宜，但软件工程的责任并没有消失；    
模型能力在变强，但确定性反馈反而比以前更要紧；    
Agent 能接更多任务，但系统边界得画得更清楚；    
人少敲一点代码，但要更认真地去设计目标、上下文、验证和回滚。 
这也是我们这一年顺着 Claude Code、Karpathy、Harness、Skills、Cursor 和 Boris 这几条线梳理下来，慢慢形成的一种共同体感： 
AI 研发真正的主线，可能不是把工程师从系统里抽走，而是把工程经验一点点沉进系统，让一个非确定性的协作者，在一组确定性的边界里安心工作。 
这件事听起来，确实没有“一个人带几百个 Agent”那么带感。 
但大概更接近我们接下来这几年真正要补的功课。 
* * *
##  参考来源 
  * • The Pragmatic Engineer 访谈转录：How AI will change software engineering - with Martin Fowler  [1] 
  * • Martin Fowler 随笔：Some thoughts on LLMs and Software Development  [2] 
  * • Martin Fowler Fragments：March 16, 2026  [3] 
  * • Martin Fowler / Birgitta Böckeler：Harness engineering for coding agent users  [4] 
  * • Mitchell Hashimoto：My AI Adoption Journey  [5] 
  * • OpenAI：Harness engineering: leveraging Codex in an agent-first world  [6] 
  * • LangChain：The Anatomy of an Agent Harness  [7] 
  * • Simon Willison：The lethal trifecta for AI agents  [8] 
  * • D3 Alpha 对 Karpathy X 讨论的转述：From Vibe Coding to Agentic Engineering  [9] 
  * • Benzinga 对 Karpathy X 讨论的转述：The Man Who Coined Vibe Coding Says the Next Big Thing Is Agentic Engineering  [10] 
####  引用链接 
` [1]  ` How AI will change software engineering - with Martin Fowler:  _ https://www.becurious.to/shows/the-pragmatic-engineer/episodes/the-pragmatic-engineer-how-ai-will-change-software-engineering-with-martin-fowler-substack/transcript  _   
` [2]  ` Some thoughts on LLMs and Software Development:  _ https://martinfowler.com/articles/202508-ai-thoughts.html  _   
` [3]  ` March 16, 2026:  _ https://martinfowler.com/fragments/2026-03-16.html  _   
` [4]  ` Harness engineering for coding agent users:  _ https://martinfowler.com/articles/harness-engineering.html  _   
` [5]  ` My AI Adoption Journey:  _ https://mitchellh.com/writing/my-ai-adoption-journey  _   
` [6]  ` Harness engineering: leveraging Codex in an agent-first world:  _ https://openai.com/index/harness-engineering/  _   
` [7]  ` The Anatomy of an Agent Harness:  _ https://www.langchain.com/blog/the-anatomy-of-an-agent-harness  _   
` [8]  ` The lethal trifecta for AI agents:  _ https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/  _   
` [9]  ` From Vibe Coding to Agentic Engineering:  _ https://blog.d3alpha.com/news/from-vibe-coding-to-agentic-engineering-karpathy-reflects-on-one-year-of-ai-driven-development-and-the-future-of-code-orchestration  _   
` [10]  ` The Man Who Coined Vibe Coding Says the Next Big Thing Is Agentic Engineering:  _ https://www.benzinga.com/news/topics/26/02/50862150/the-man-who-coined-vibe-coding-says-the-next-big-thing-is-agentic-engineering  _   
如喜欢本文，请点击右上角，把文章分享到朋友圈 
如有想了解学习的技术点，请留言给若飞安排分享 
** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **
** ·END·  **
    **相关阅读：**
        * [刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect>)
        * [大家都在讲 Harness，但它到底该怎么理解](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect>)
        * [模型越来越强，为什么大家却开始重写 Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect>)
        * [如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect>)
        * [Claude Code高手的 8 个 Claude Code 实战习惯](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408884&idx=1&sn=6a2fa56f70f15cdd75eb5c2b12e687ef&scene=21#wechat_redirect>)
        * [别从 README 开始：一个架构师会怎样翻 Codex 仓库](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect>)
        * [Spec 不是代码的替代品，它是 AI Coding 的上下文管理层](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408860&idx=1&sn=b882b2ee97e3f798fea96e68d27c7071&scene=21#wechat_redirect>)
        * [如何让 Agents 自己设计、升级 Agents](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408848&idx=1&sn=aabf785116e9849dbd301a4f7c477181&scene=21#wechat_redirect>)
        * [OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408832&idx=1&sn=ef00408738c853ea2e94be58c0612e51&scene=21#wechat_redirect>)
        * [Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408200&idx=1&sn=2f2cce7dfcbdb0766eac3590f777a17b&scene=21#wechat_redirect>)
        * [一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408189&idx=1&sn=7d4f7a442a22af37f95c46ff1048a3df&scene=21#wechat_redirect>)
        * [Claude Code 最佳实践：把上下文变成生产力（团队可落地版）](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408183&idx=1&sn=0b6f1437465d3a61118db688cc889b17&scene=21#wechat_redirect>)
        * [把 AI 当成新同事：Agent Coding 的上下文与验证体系](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408169&idx=1&sn=7bba1377a31ffa0ce68932935c8d923a&scene=21#wechat_redirect>)
        * [一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408161&idx=1&sn=85aaff6f2f779e53b6ae9c5e1f003269&scene=21#wechat_redirect>)
        * [2026年生活重启指南](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408141&idx=1&sn=e1e64ad73d25414957aa5206ca969fc3&scene=21#wechat_redirect>)
        * [我真不敢相信，AI 先加速的是工程师。](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408153&idx=1&sn=d33b48464de93a2573a0a0cb025ada9e&scene=21#wechat_redirect>)
        * [扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408128&idx=1&sn=1b6c640de61986d1364847bffb2cd28f&scene=21#wechat_redirect>)
        * [Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408114&idx=1&sn=29a754281cd07c16b6191c6d146c5837&scene=21#wechat_redirect>)
        * [Anthropic官方万字长文：AI Agent评估的系统化方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408107&idx=1&sn=905552d68f5b174fd9548360bdea4448&scene=21#wechat_redirect>)
        * [银弹还是枷锁？Claude Agent SDK 的架构真相](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408084&idx=1&sn=82f274ba084f9c289e2d141aad0c088b&scene=21#wechat_redirect>)
        * [Claude Code创始人亲授13条使用技巧](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408076&idx=1&sn=f139e90d699b528e80e79c558eed42ee&scene=21#wechat_redirect>)
        * [Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408028&idx=1&sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&scene=21#wechat_redirect>)
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢! 
** 架构师  **
我们都是架构师！ 
**** 关注  ** 架构师(JiaGouX)，添加“星标”  **
** 获取每天 AI 技术干货，一起成为牛逼架构师  **
** AI/Agent群请  ** ** 加若飞：  ** ** 1321113940  ** ** 进群  **
投稿、合作、版权等邮箱：  ** admin@137x.com  **