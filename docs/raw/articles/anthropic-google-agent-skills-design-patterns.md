---
title: 从 Anthropic 到 Google：Agent Skills 正在进入“设计模式”阶段
source_url: https://mp.weixin.qq.com/s/cnbhqqyxLK8l3DjE-X82qQ
source: wechat
publish_date: 2026-05-09
tags: [wechat, article, claude, openai, agent, harness, coding, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 2cfa2733b6a50ba21f6d109cf996935ccbbcdb3fc47e5036ae5c8f65fb536545
---
# 从 Anthropic 到 Google：Agent Skills 正在进入“设计模式”阶段
架构师（JiaGouX）  我们都是架构师！    
架构未来，你来不来？ 
* * *
Google Cloud Tech 前些日子发布了一篇 Agent Skill 设计模式文章：《5 Agent Skill design patterns every ADK developer should know》。 
文章把常见 Skill 分成 5 类：Tool Wrapper、Generator、Reviewer、Inversion、Pipeline。 
现在回头看，5 个名字本身可能没有那么重要。 
五一期间，重新读了一遍，更在意的是另一件事：  Skills 的讨论，正在从“格式怎么写”，继续走到“工作流怎么设计”。 
放在过去几个月一直梳理的 Skills 线索里，它的价值不在“又多了五个名词”，而在于补上了另一块缺口。 
回头看 Anthropic 这条主线。从去年 10 月正式推出 [ Agent Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408393&idx=1&sn=d12788e94562bbce6022d27ed22d03ce&scene=21#wechat_redirect>) 开始，社区其实一直在回答几个基础问题：格式怎么组织、机制怎么加载、经验怎么被 Claude 发现。 
Simon Willison 当时那句广为流传的话：  **   
**
** “Claude Skills are awesome, maybe a bigger deal than MCP”  ** 。 
话糙理不糙：Skill 的厉害之处不在协议有多复杂，而在它把扩展模型能力这件事简化成了“一个 Markdown 文件 + 可选脚本”，把难的部分交给了 LLM Harness 和它能调用的环境。 
这些问题讲清楚以后，新的问题就出来了： 
同样是一个  ` SKILL.md  ` ，里面到底该写成手册、模板、清单、访谈流程，还是多阶段流水线？ 
Google 这份材料把问题问到了下一层： 
** Anthropic 解决了 Skill 的格式和运行机制，Google 补上了 Skill 的内容设计模式。  **
当  ` SKILL.md  ` 的格式已经有共识，难点就转到了内部：这个 Skill 的工作流逻辑，到底该怎么设计。 
同样都叫  ` SKILL.md  ` ，一个 FastAPI 规范 Skill、一个报告生成 Skill、一个代码审查 Skill、一个需求访谈 Skill，内部运行逻辑完全不一样。外面看起来都是 Markdown，真正决定效果的是：它到底在约束哪类任务，如何切上下文，在哪里停下来，怎么验证结果。 
沿着这条线看，Google 的 5 个模式就不只是“五个分类”。它更像是在回答：团队经验进入 Agent 运行时以后，内部会长成哪些稳定结构。 
* * *
##  太长不看 
  * • Anthropic 解决了 Skill 的格式、加载和跨产品使用问题；Google 这篇更像是在补“内容怎么设计”的模式语言。半年时间，Skills 已经从 Simon Willison 当时一句“可能比 MCP 更大的事”，变成了 30 多个 Agent 工具共用的接口。 
  * • Skill 不只是“复用提示词”，更像一份可触发、可维护、可审查的过程资产；Zak El Fassi 把这套做法叫 Skills-Driven Development，朴素但能复利。 
  * • Google 提到的 5 个模式，其实对应 5 类常见失败：缺领域知识、输出漂移、检查标准混乱、需求没问清、复杂流程跳步骤。 
  * •  ` description  ` 是路由契约，不是简介；  ` references/  ` 、  ` assets/  ` 、  ` scripts/  ` 是把大知识、模板和确定性动作从主提示里拆出去。 
  * • 写 Skill 时，先判断任务形态会更稳：知识注入、模板生成、审查评分、需求访谈，还是多阶段流程。 
  * • 对团队来说，更值得沉淀的不是“有多少 Skill”，而是每个 Skill 的触发边界、输入边界、验证标准、失败处理和版本治理。 
* * *
##  这条线我们已经聊过不少 
把这件事放回我们最近几个月的线索里，会更容易看清。 
2 月拆 [ Anthropic 官方 33 页指南 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408372&idx=1&sn=130b7168be5d53c99f7bc7d98e54a447&scene=21#wechat_redirect>) 时，我们主要看的是 Skill 的基本位置：MCP 解决“能连什么”，Skills 解决“连上之后怎么把事办成”。那次其实是在回答：Skill 适合什么场景，为什么渐进式披露重要，为什么不能把所有内容都塞进一个  ` SKILL.md  ` 。 
过了几天，我们又按 [ 第一性原理拆了一遍 Claude Agent Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408393&idx=1&sn=d12788e94562bbce6022d27ed22d03ce&scene=21#wechat_redirect>) 。那次更关心底层机制：按需注入到底怎么发生，  ` description  ` 为什么像路由规则，工具权限为什么不能随便放开。说白了，是在看 Skill 怎么被 Claude 找到、加载，并临时改变执行上下文。 
3 月拆 [ Anthropic 官方仓库里的 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408639&idx=1&sn=ad325d5fa3dd0e112d62b0e34ea3c48a&scene=21#wechat_redirect>) ` [ frontend-design ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408639&idx=1&sn=ad325d5fa3dd0e112d62b0e34ea3c48a&scene=21#wechat_redirect>) ` ，问题又具体了一点：一个真实 Skill 内部到底长什么样？为什么它只有几十行，却能明显改变 Claude 生成界面的质量？拆完以后，我更确定，Skill 的价值不在“多一份知识”，而在把一类重复任务压成可版本化、可评审、可演进的稳定入口。 
后来读 [ Anthropic 内部如何使用 Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408824&idx=1&sn=f8e9dd4bfa0a9ed4db1b5821678c5583&scene=21#wechat_redirect>) ，视角就转到了团队侧。一个 Skill 可以从一段说明开始，但真正拉开差距的，往往是脚本、参考资料、hooks、模板、gotchas 和日志这些外围结构。它把团队经验从“某个人知道怎么做”，变成 Agent 能稳定复用的工作单元。 
再到 4 月聊 [ Hermes Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409130&idx=1&sn=29576ecf2bb5e765e21d4d42ff6d284e&scene=21#wechat_redirect>) ，我们换了一个词来理解它：过程资产。Memory 回答“环境和偏好是什么”，Session Search 回答“过去发生过什么”，Skill 回答的是“这类事以后怎么做”。这个分层立住以后，很多“记忆系统”的讨论就清楚了。 
后来整理 [ Cursor Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 和 [ Agent 时代架构师能力 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409241&idx=1&sn=1b06c60be86aee50e5289694343124f2&scene=21#wechat_redirect>) 这条线时，问题又接到了 Harness：Agent 产品能不能长期稳定，不只看模型，也看 Harness 能不能形成工程闭环。评测、线上实验、错误分类、模型适配、上下文调整、工具可靠性，这些都要有人持续维护。 
所以 Google 这 5 个模式接进来，位置其实很自然。 
它不是在重新定义 Skill，也不是在替代 Anthropic 的规范。它补的是下一层问题：  ** 当 Skill 已经成为过程资产，这个资产内部该按什么结构组织。  **
* * *
##  Anthropic 讲清了容器，Google 补上了模式 
Anthropic Skills 吸引我的，并不是它多了一个新文件格式。 
更关键的是，Anthropic 把 Agent 能复用的经验，压进了一种很简单的形态：一个文件夹，一个  ` SKILL.md  ` ，再加上可选的参考资料、脚本和模板。 
官方文档里有几个关键点： 
  * • Skill 是包含 instructions、scripts、resources 的文件夹； 
  * • Claude 会在相关任务里自动发现和加载 Skill； 
  * •  ` description  ` 决定它什么时候被触发； 
  * • 通过渐进式披露，先加载少量元信息，需要时再加载完整说明和支撑文件； 
  * • 同一个 Skill 可以在 Claude apps、Claude Code 和 API 里使用，但不同 surface 的分发和运行环境并不完全一样。 
这些机制解决的是“Skill 怎么被看见、怎么被加载、怎么不撑爆上下文”。 
但机制稳定以后，很快会遇到下一层问题：  ** 同一个格式，装进去的工作流质量差别很大。  **
一个团队把 API 规范塞进 Skill，可能写成一本手册；另一个团队把发布流程塞进 Skill，可能写成 12 步命令；第三个团队把代码审查塞进 Skill，可能写成一份清单。它们都能跑，但效果会差很多。 
这里的差别在于，Skill 不是普通文档。 
普通文档主要给人读，允许人自己补上下文、自己判断顺序、自己决定什么时候停。 
Skill 是给 Agent 在运行时读的。它要参与决策，进入上下文，影响工具调用，甚至影响文件修改和发布动作。 
Skill 里的很多句子，都在承担运行时职责： 
  * • 触发词会影响它是否被加载； 
  * • 步骤顺序会影响 Agent 是否跳步； 
  * • 检查清单会影响它怎么评价结果； 
  * • 负面约束会影响它有没有越权； 
  * • 支撑文件会影响上下文是否被撑爆； 
  * • 脚本会影响哪些动作可以确定性执行。 
放到工程系统里看，Skill 更接近“过程资产”，而不是“提示词模板”。 
提示词模板解决的是一次对话怎么说。 
过程资产解决的是这类事情以后怎么做。 
Google 这份材料的增量就在这里。 
它不再重点解释  ` SKILL.md  ` 怎么打包，而是把 Skill 内部常见的任务结构，拆成 5 种设计模式。Anthropic 先把“容器”讲清楚了，Google 这次更像是在讨论“容器里会出现哪些结构”。 
* * *
##  5 个模式，其实是 5 类失败修复 
Google 这篇文章把模式分得很清楚： 
模式  |  解决的问题  |  更像什么   
---|---|---  
Tool Wrapper  |  Agent 不懂某个库、框架或团队规范  |  按需加载的领域手册   
Generator  |  每次输出结构都不稳定  |  带模板的填空流程   
Reviewer  |  审查标准混在提示词里，难复用  |  可替换的评分清单   
Inversion  |  Agent 没问清需求就开始生成  |  需求访谈器   
Pipeline  |  复杂任务容易跳步骤  |  带检查点的工作流   
只把这张表当分类表看，会有点可惜。 
** 每个模式背后，都对应一种 Agent 常见失败。  **
###  缺领域知识，就用 Tool Wrapper 
Tool Wrapper 是最容易理解的模式。 
如果把 FastAPI、Terraform、Pandas、React Server Components 这类规范都塞进系统提示词，窗口很快会变重。更合适的方式，是把它们整理成 Skill，只有用户真的要写、审查或调试对应技术时再加载。 
这里的关键不是“让 Agent 变专家”，而是控制上下文进入方式。 
长期稳定、低频使用、领域很明确的知识，适合放在  ` references/  ` 。  ` SKILL.md  ` 只负责触发和导向：什么时候读哪份参考，读完以后按什么规则应用。 
这和上下文工作集是一条线。上下文窗口不适合当资料仓库，大块知识留在外面，需要时再取，系统会轻很多。 
###  输出不稳定，就用 Generator 
Generator 解决的是另一类问题：Agent 每次都能写，但每次格式都不一样。 
报告、PR 描述、架构评审、周报、API 文档、事故复盘，都容易出现这种情况。一次看着不错，十次放在一起就乱。 
Generator 的思路很朴素：  ` assets/  ` 放模板，  ` references/  ` 放风格指南，  ` SKILL.md  ` 负责协调加载、补齐变量、填充模板。 
这里最值得借鉴的是分工。 
模板写在大段提示词里，后面很难维护；风格只靠模型自己“理解”，输出也容易漂。更可靠的做法，是模板归模板，风格指南归风格指南，缺失变量单独补齐，该保留的章节就保留。 
如果团队已经有稳定文档格式，Generator 是最容易落地的一类 Skill。 
###  标准会变，就用 Reviewer 
Reviewer 模式我觉得很适合工程团队。 
代码审查、安全审查、Prompt 审查、架构方案审查，都要分开两件事： 
  * • 怎么审； 
  * • 审什么。 
前者是流程，后者是清单。 
把两者混在一个系统提示词里，早期能跑，后期很难维护。先审 Python 风格，再审 OWASP，后来又加数据权限，最后提示词越写越长，也没人知道哪条规则还在生效。 
Reviewer 的做法是把标准放进  ` references/review-checklist.md  ` ，Skill 只规定审查协议：先读代码，理解目的，再按清单检查，按严重程度输出，解释为什么有问题，给具体修复建议。 
这和软件工程里的测试、Lint、静态扫描很像。 
清单可以版本化，可以替换，可以按项目分层。Agent 负责应用标准，不负责临时发明标准。 
###  需求不清，就用 Inversion 
Inversion 很容易被低估。 
很多 Agent 失败，不是模型不会做，而是太早开始做。用户一句“帮我设计一个系统”，它立刻开始画架构、选数据库、列服务，一口气说完，看起来很完整，实际上很多关键约束都没问。 
Inversion 把流程倒过来：Agent 先当采访者。 
比如项目规划 Skill 可以规定，先问清问题、用户、规模，再问部署环境、技术栈、非协商约束。不到这些阶段完成，不进入最终方案合成。 
这里最重要的是门控。 
“如果需要可以提问”通常不够。Agent 很容易觉得自己已经知道了，然后继续生成。更可靠的是明确阶段、退出条件，以及什么时候不能继续。 
这类 Skill 特别适合高风险、高模糊度任务：架构设计、需求分析、迁移规划、安全评估、企业流程自动化。 
###  流程复杂，就用 Pipeline 
Pipeline 解决的是跳步骤。 
文档生成、发布、数据迁移、代码重构、Incident 复盘，都不是“一次输出”能解决的任务。它们需要先清点，再生成，再确认，再组装，再质检。 
Pipeline 的关键是检查点。 
Google 的示例里，文档流水线先解析公开 API，列成清单，让用户确认；再生成 docstring；确认后才能进入组装；最后按质量清单检查。 
这类模式看上去有点重，但放到生产流程里很现实。 
复杂任务最怕的不是慢，而是 Agent 把前置条件跳过去，直接给一个看起来完整、实际未经验证的结果。 
##  Skill 和 Harness 是一回事的两面 
前几天梳理 [ Cursor Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 时，我一直在想一个问题： [ Agent 产品怎么持续变好？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409144&idx=1&sn=0d15111cf536be0d6aa1946d5a225ae9&scene=21#wechat_redirect>)
Cursor 给出的答案不是“换更强模型”这么简单，而是把 Harness 当成持续运营的软件产品：评测、线上实验、错误分类、模型适配、上下文调整、工具可靠性，每一项都要看。 
Skill 放在这条线里，位置会更清楚。 
Harness 负责运行时主循环：上下文怎么组，工具怎么调，状态怎么留，错误怎么反馈，权限怎么收口。 
Skill 负责把某类可复用方法带进运行时：这类 API 怎么写，这类文档怎么生成，这类代码怎么审，这类需求怎么问，这类流程怎么跑。 
可以这样理解：  Skill 是 Harness 可以按需加载的过程模块。 
这也解释了为什么 Claude Code 官方文档会把几个扩展点分得很细：  ` CLAUDE.md  ` 处理常驻上下文，Skills 处理按需知识和工作流，MCP 连接外部系统，Subagents 做上下文隔离，Hooks 做自动化和强制约束。 
它们不是互相替代。 
一个真实工作流很可能长这样： 
  * •  ` CLAUDE.md  ` 写项目基本规则； 
  * • Skill 写发布、审查、排障流程； 
  * • MCP 暴露数据库、工单、日志系统； 
  * • Subagent 隔离调查任务； 
  * • Hook 在保存后跑 lint，或阻断危险命令。 
这时 Skill 就不再是“多一份提示词”，而是运行底座里的一个可组合部件。 
网上几条讨论也在往这个方向走。 
Tobi Lütke 很早就说过，他更喜欢  ` context engineering  ` 这个词，因为关键能力是把任务所需上下文组织到模型“有机会解决”的程度。这个说法放到 Skill 里也成立：Skill 不是让提示词更漂亮，而是把上下文、约束、模板和检查点组织成一个可触发的工作单元。 
Kaxil Naik 最近那条 Claude Code 长帖更直接。他是 Apache Airflow 的 PMC member，也在 Astronomer 做工程管理。他说自己几个月没有手写代码，但花了大量时间迭代 Skills、Hooks、CLI、MCP 和集成，让 Agent 按他的工作方式运转。 
这句话值得停一下。 
当一个资深工程师说“Skill is the code”，它不是在说 Markdown 比代码神奇。更准确的理解是：过去写在手里、脑子里、团队习惯里的工作方式，正在被写成 Agent 可执行的接口。 
类似的判断也出现在另一个独立开发者身上。Zak El Fassi 三月的《SkDD: Skills-Driven Development》：他在每一次构建循环里加了一个判断：“这件事，要不要变成一个 Skill？” 
如果是，写一个  ` SKILL.md  ` ，下次 Agent 自己就能找到、加载、执行。 
一个看起来不起眼的小决定，几个月后就会变成一份越长越厚的过程资产清单。他自己博客的发布、newsletter、内容日历、X 分发，背后都是这套机制在跑。 
我们前几篇聊 [ Karpathy 那次访谈 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 时，也提到他强调的 [ “Agentic Engineering” —— 别只盯着 Vibe Coding 这种入口体验 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) ，真正决定上限的是把工作流、评测、上下文管理写成长期可运营的工程。 
Skill 正好是 Agentic Engineering 里最朴素的一块砖：它不是模型层的能力，而是工程层的接口。 
这就是 Skill 变重的地方。 
* * *
##  落到团队里，先从窄流程开始 
如果一个团队准备沉淀第一个 Skill，我自己的倾向是从一个很窄的流程开始，而不是先做“全能开发助手”。 
比如： 
  * • 固定服务的发布检查； 
  * • 某个框架的代码审查； 
  * • 数据口径变更评审； 
  * • Incident 复盘模板； 
  * • PR 合并前安全检查； 
  * • 客户方案生成前的信息收集。 
这类流程有两个好处：足够高频，能复用；边界又足够窄，方便验证。 
我现在会先问 6 个问题，把边界大致切出来。 
###  1\. 它什么时候该触发？ 
` description  ` 更像路由契约。 
如果只写“帮助处理部署相关任务”，触发边界会很虚。 
更清楚的写法，是说明具体场景：当用户要发布 Next.js 服务到 Vercel、检查预览环境、处理构建失败、回滚部署时使用。 
触发范围太宽，Agent 会乱用；太窄，又可能用不上。这里需要一点真实使用日志，不能全靠想象。 
###  2\. 它属于哪种模式？ 
这里可以先不急着写正文。 
先问一句：这个 Skill 主要是在注入知识、生成模板、审查结果、收集需求，还是跑流程？ 
如果是知识注入，主体更接近 Tool Wrapper。 
如果是输出格式稳定，主体更接近 Generator。 
如果是质量门禁，主体更接近 Reviewer。 
如果是模糊需求，前面先放 Inversion。 
如果有多阶段和验收点，再上 Pipeline。 
很多 Skill 写乱，是因为一个文件里同时想当手册、模板、审查器、项目经理和安全员。 
###  3\. 哪些东西适合拆出去？ 
` SKILL.md  ` 如果无限变长，很快会变成另一个系统提示词。 
稳定但很长的规范，放  ` references/  ` 。 
固定输出模板，放  ` assets/  ` 。 
确定性、重复性、容易出错的动作，尽量放  ` scripts/  ` 。 
主文件只保留路由、流程、边界和加载规则。 
渐进式披露的价值也在这里：让 Agent 先知道有这项能力，再在真正需要时加载细节。上下文不是免费空间，放进去的每一段都要有理由。 
###  4\. 哪些步骤需要停下来？ 
生产级 Skill 通常需要检查点。 
比如： 
  * • 需求没问完，不生成架构方案； 
  * • API 清单没确认，不生成最终文档； 
  * • 测试没跑过，不宣称修复完成； 
  * • 风险项没分级，不进入发布建议； 
  * • 破坏性操作没确认，不执行。 
这类门控一旦写得含糊，Agent 很容易自己补完后面的步骤。能落到“禁止继续”的地方，就把禁止继续的条件写清楚。 
###  5\. 失败以后怎么走？ 
很多 Skill 只写成功路径。 
现实里最常见的是失败路径：依赖没装、环境变量缺失、测试超时、API 返回 403、用户给的信息不够、文件结构和预期不一致。 
一个好 Skill 至少要把几件事说清楚： 
  * • 怎么识别失败； 
  * • 失败时先收集什么证据； 
  * • 哪些可以自动重试； 
  * • 哪些需要停下来问人； 
  * • 哪些动作不能为了完成任务而绕过去。 
这里越具体，Agent 越不容易靠猜。 
###  6\. 它怎么被版本化和审查？ 
Skill 一旦进入团队工作流，就更接近代码资产，而不是临时文档。 
尤其是 Reviewer、Pipeline、带脚本的 Skill，不能靠“某次用着不错”就长期留着。 
至少可以加几件事： 
  * • 每个 Skill 有 owner； 
  * • 每次修改走 review； 
  * • 高风险 Skill 有测试样例； 
  * • 关键流程有变更记录； 
  * • 废弃规则定期清理； 
  * • 第三方 Skill 默认不信任，先读再启用。 
这部分听起来没那么兴奋，但很关键。 
坏提示词影响一次对话，坏 Skill 可能影响一串同类任务。 
* * *
##  最怕的是把一次经验固化成长期规则 
写 [ Hermes Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409130&idx=1&sn=29576ecf2bb5e765e21d4d42ff6d284e&scene=21#wechat_redirect>) 时，我最警惕的就是这件事。 
Agent 能自动沉淀 Skill 很诱人。复杂任务做完以后，自动把成功路径写成下次可复用流程，听起来就是自我进化。 
但这里有个代价：错误经验也可能被沉淀。 
一次误判，如果只发生在当前会话，影响有限。它如果被写进 Skill，以后每次类似任务都会更快走向同一个错误。 
所以过程资产需要治理。 
至少要区分： 
来源  |  信任策略   
---|---  
官方内置 Skill  |  可以较高信任，但仍要看版本   
团队自写 Skill  |  走 review、测试和变更记录   
Agent 自动生成 Skill  |  默认草稿，需要有人确认   
社区第三方 Skill  |  默认不信任，先做安全审查   
带脚本 Skill  |  按可执行代码对待，不按普通文档对待   
这里有个边界不能含糊。 
` SKILL.md  ` 是 Markdown，但它会影响 Agent 的行为。只要 Agent 能调工具、读文件、改代码、发请求，Skill 就可能间接影响真实系统。 
Claude Code 文档里有一句很实在的话：  如果某条规则每次都要成立，更适合用 Hook 这类确定性机制强制，而不是只写在提示或 Skill 里。 
这就是工程边界。 
Skill 适合让 Agent 理解和应用流程。安全底线、危险命令阻断、权限控制、审计记录，更适合下沉到确定性更强的层。 
* * *
##  从“写提示词”到“设计工作流” 
把 Google 的 5 个模式和 Anthropic 的 Skills 规范放在一起看，我觉得 Agent 工程正在过一个分界点。 
早期大家关心的是怎么把一句 prompt 写好。 
后来开始关心上下文怎么组织，工具怎么暴露，Subagent 怎么隔离，MCP 怎么接外部系统。 
现在 Skill 这条线又多了一层：  团队经验、流程、清单、模板、排障方法，开始被做成模型可发现、可加载、可执行的工作单元。 
这不是文档形式的小变化。 
它意味着工程团队要开始回答一些更传统、也更麻烦的问题： 
  * • 哪些经验值得沉淀？ 
  * • 哪些规则常驻，哪些按需加载？ 
  * • 哪些判断交给模型，哪些动作交给脚本？ 
  * • 哪些流程需要检查点？ 
  * • 哪些 Skill 可以自动更新，哪些需要人工审查？ 
  * • 模型升级以后，旧 Skill 还适不适合？ 
我越来越觉得，Agent 时代的架构师，不能只看模型，也不能只追框架。 
更耐用的能力，是把这些工作流拆成边界清楚、可组合、可观测、可回滚的系统部件。 
Skill 正好是一个很小的入口。 
它小到一个文件就能开始，低门槛到 Markdown 就能写；但只要它进入真实工作流，背后很快就会牵出  上下文、工具、权限、评估、版本和治理。 
回头看 Anthropic 在 去年 10 月放出 Skills 时，社区里其实有不少声音说"这不就是几行 Markdown 吗"。 
半年过去再看，整个生态——从 Claude Code、Codex CLI 到 Cursor、Gemini CLI，再到 Vercel、Trail of Bits、Hugging Face、Sentry 这些产品方——全部都在围绕同一个  ` SKILL.md  ` 文件做工程。 
Google 这次出 5 个模式，更像是把这件事从"实验性玩法"，正式拉进了"该有自己设计模式语言"的阶段。 
到这里，  ` SKILL.md  ` 就不太适合继续被看成一段更长的提示词。 
更准确的看法是：它是团队经验进入 Agent 运行时的一种接口。 
接口一旦出现，后面拼的就不只是文采，而是工程设计。 
这个正是我们需要从架构角度来深入考量的。 
* * *
##  参考资料 
  * • Google Cloud Tech：《5 Agent Skill design patterns every ADK developer should know》    
https://x.com/GoogleCloudTech/status/2033953579824758855 
  * • Claude 官方博客：Introducing Agent Skills    
https://claude.com/blog/skills 
  * • Claude Code Docs：Extend Claude with skills    
https://code.claude.com/docs/en/skills 
  * • Claude API Docs：Agent Skills    
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview 
  * • Anthropic 官方 PDF：The Complete Guide to Building Skills for Claude    
https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf 
  * • Simon Willison：Claude Skills are awesome, maybe a bigger deal than MCP    
https://simonwillison.net/2025/Oct/16/claude-skills/ 
  * • Zak El Fassi：SkDD: Skills-Driven Development    
https://zakelfassi.com/skdd-skills-driven-development 
  * • Tobi Lütke 关于 context engineering 的讨论    
https://x.com/tobi/status/1935533422589399127 
  * • Kaxil Naik 关于 Claude Code、Skills、Hooks、MCP 的实践长帖    
https://x.com/kaxil/status/2037503513350005134 
  *   
如喜欢本文，请点击右上角，把文章分享到朋友圈 
如有想了解学习的技术点，请留言给若飞安排分享 
** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **
** ·END·  **
        **相关阅读：**
  * * [如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect>)
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
                * [刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect>)
                * [大家都在讲 Harness，但它到底该怎么理解](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect>)
                * [模型越来越强，为什么大家却开始重写 Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect>)
    **  
    **
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢! 
** 架构师  **
我们都是架构师！ 
**** 关注  ** 架构师(JiaGouX)，添加“星标”  **
** 获取每天 AI 技术干货，一起成为牛逼架构师  **
** AI/Agent群请  ** ** 加若飞：  ** ** 1321113940  ** ** 进群  **
投稿、合作、版权等邮箱：  ** admin@137x.com  **