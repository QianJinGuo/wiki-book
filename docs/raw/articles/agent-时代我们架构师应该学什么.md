---
source: wechat
source_url: https://mp.weixin.qq.com/s/Litoqoj9WHmV1wCnxybdVQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-09
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-05-04
sha256: 8aac88ca90a1eefc2038e1de7ddff6222f2dc520a28114cbaef99ab8f346b22e
---
review_value: 6
review_confidence: 10
review_recommendation: worth-reading
review_stars: 3ingested: 2026-05-10
# Agent 时代，我们架构师应该学什么？
架构师（JiaGouX）  我们都是架构师！    
架构未来，你来不来？ 
* * *
这两天朋友丢过来一篇 Rohit 写的长文，讲 2026 年做 AI Agent 该学什么、构建什么、跳过什么。我一边读，一边把里面提到的框架、论文和网上讨论顺手过了一遍，信息量确实不小。 
读到后面，我被提醒了一件更现实的事：Agent 这个领域变化太快。今天讲 LangGraph，明天讲 Mastra，后天又冒出一个新的 Agent SDK；模型也一样，这周这个工具调用更稳，下周另一个长上下文更强。真按这个节奏追，很容易被新闻流带着跑。 
于是我想换个角度聊： 
** Agent 时代，架构师到底应该学什么，哪些能力半年后还站得住？  **
这里先把范围收窄一点：不追框架名单，先看 Agent 进入真实系统之后会遇到的那些问题。上下文怎么管，工具怎么设计，评估怎么做，状态怎么留，Harness 怎么演化，权限怎么收口，成本怎么算，经验怎么沉淀成团队资产。 
这也和我们今年的很多内容互相印证：从《 [ 你的AI-First对了吗? ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409030&idx=1&sn=e435a8b1fca46cea3e5514f0541d3a17&scene=21#wechat_redirect>) 》到 [ Karpathy 的 Agentic Engineering ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) ，从 [ Prompt Caching ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409101&idx=1&sn=5c1ac7bd71b07c4767c19dc53d5a6c13&scene=21#wechat_redirect>) 到 [ 上下文工作集 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) ，从 [ Subagents ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 到 [ 过程资产 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409144&idx=1&sn=0d15111cf536be0d6aa1946d5a225ae9&scene=21#wechat_redirect>) ，再到《 [ Harness 正在成为新后端 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 》和 [ Cursor Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 复盘。 
角度不同，底下说的都是同一件事：  Agent 不再只是"更快生成一次结果"的工具，它已经在进入真实工程链路。  一旦进入链路，问题就不只是模型回答得对不对，而是整个系统能不能让它稳定、可控、可验证地工作下去。 
* * *
##  太长不看 
  * • 比框架清单更值得补的，是能跨模型、跨框架复用的工程能力。 
  * • 先练筛选：看一个新东西半年后还在不在、能不能接进来、能不能被 trace 和 eval 证明有用。 
  * • 上下文按运行时工作集设计，比当聊天记录或资料仓库更顺。 
  * • 工具更像业务接口，五到十个边界清楚的工具通常胜过二十个模糊工具。 
  * • 评估前置，否则团队很容易只靠体感讨论 Agent 有没有变好。 
  * • Harness 在变重，状态、工具、权限、验证、回滚、成本、模型适配都会落到它身上。 
  * • 多 Agent 看上下文边界和读写边界，角色分工放到后面。 
  * • 起点最好是一个窄目标、可度量、可回滚的小闭环。 
Agent 时代，架构师更值得沉淀的系统能力 
* * *
##  筛选比路线图更耐用 
读完这批材料以后，深有体会：  在 Agent 这个领域，filter 比 feed 更重要。 
过去学一个技术栈，路径相对稳定，语言、框架、数据库、缓存、消息队列、部署、监控，慢慢补就行。Agent 不太一样，表层抖得太厉害。模型一变，工具调用能力跟着变；上下文窗口一变，压缩策略要重看；供应商 API 一变，工具 schema、缓存、超时、成本都跟着动。今天看着完整的框架，半年后可能就变成一层很薄的包装。 
所以我现在看一个新东西，会先用几个问题过一遍： 
问题  |  怎么看   
---|---  
半年后它还重要吗  |  是包装层，还是协议、状态、沙箱、评估这种底层能力   
能接进现有系统吗  |  要不要推翻已有的日志、权限、配置、重试和部署   
解决什么失败模式  |  是真实生产里的痛，还是 demo 里的新鲜感   
能被评估吗  |  能不能用 trace 和样本证明它让 Agent 变好   
不用半年损失多大  |  多数新框架晚点看没关系，稳定原语错过了才麻烦   
这里的关键词是  "半衰期"  。模型封装层、CLI 参数、某个"类 Devin 产品"的半衰期通常很短；协议、状态、沙箱、评估、工具契约这些东西，半衰期会长很多。换成架构师能听懂的话：  前者更多是工具选择，后者会慢慢变成系统能力。 
我现在看 Agent 的新东西，基本就分成两类：一类是帮团队更快试一下，一类是会改变团队以后构建系统的方式。前者用就行，后者才值得沉淀。 
这种克制本身也不容易。Hacker News 上当周爆火的框架，前两周经常很热闹，每个人都说得头头是道；半年后回头看，里面有不少已经没人维护了，当初热情推荐的人也早换了方向。能在最热的时候记得说一句"我半年后再看"，其实挺难。 
* * *
##  上下文：当成运行时工作集去管 
如果只能先补一个能力，我会  从上下文开始。先看上下文，再看 prompt。 
Agent 跑长任务时，很多失败表面看是"模型没想明白"，往里看常常是上下文坏了：目标被工具输出淹没；旧错误一直留在窗口里；一次性搜索结果挤掉了关键文件事实；会话压缩把用户最初的约束磨平了；子任务的探索过程没有隔离，主会话越跑越脏。 
这也是我之前写《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》一直想说的事，上下文窗口更像运行时工作集，不太适合继续当聊天记录看。 
这个视角一旦放稳，很多设计就跟着变。我不太会再把所有资料一股脑塞进去，每一轮会先问几句：当前这一轮推理最需要哪几块信息？哪些只要摘要？哪些大对象应该留在文件、数据库或检索系统里？工具输出给 preview 就够，还是要完整展开？历史压缩之后，任务还能不能继续推进？子 Agent 探索出来的内容，主 Agent 要的是过程，还是只要结论和证据？ 
把这些问题答清楚以后，Agent 的体感会明显变稳。原因不一定是模型突然变聪明了，而是它终于不用在一堆低密度信息里找路。 
我会把上下文分成几层来看： 
层级  |  适合承载什么   
---|---  
模型窗口  |  当前目标、关键约束、最近观察、下一步决策需要的信息   
会话状态  |  任务计划、已完成动作、待办、错误修复、用户意图   
文件/数据库  |  大对象、日志、代码、历史文档、可回放事实   
项目规范  |  AGENTS.md、README、Runbook、团队约定、验收标准   
工具层  |  检索、分页、验证、写入、权限受控的动作   
之前看 [ Claude Code 92% 的缓存命中率 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409101&idx=1&sn=5c1ac7bd71b07c4767c19dc53d5a6c13&scene=21#wechat_redirect>) ，我觉得最值得抠的不是"缓存省了多少钱"，而是它把稳定内容和动态内容分得很干净：系统规则、工具定义、项目约定这种稳定前缀尽量不乱动；任务历史、工具输出、用户补充这种动态内容往后长，必要时再压缩、分页、转存。缓存命中率只是结果，背后靠的是上下文结构先干净。 
所以这里说的上下文工程，不太像 prompt 的升级版，更像 Agent 的运行时内存管理：什么靠近模型，什么留在窗口外，什么长期稳定，什么按需拉取。 
* * *
##  工具：当成业务接口来设计 
Agent 能不能进入业务，最后要看工具。模型在窗口里推理，跟系统接触的地方，就是工具调用。 
很多团队一开始把工具理解成"给模型接几个 API"。这个理解做 demo 够用，撑不到生产。模型不是人类工程师。人看到  ` 400 Bad Request  ` 会自己翻文档、查日志、改参数；模型看到一条含糊的错误，常常会在同一个错误方向上接着试。它靠的就是工具的名字、描述、参数、返回和错误消息来理解外部世界。 
这里有一个挺实用的经验：五到十个命名清楚、边界清楚的工具，通常比二十个互相重叠的工具更稳。工具一多，模型容易在相似能力之间摇摆；描述一虚，模型容易误用；返回一长，后续上下文容易变脏。 
所以 Agent 的工具不是能力展示柜，更像一组给模型调用的业务接口。一个好工具至少要让模型看懂这几件事：什么时候该用，什么时候不该用，参数到底填什么，返回里哪些是关键结果，失败以后下一步怎么修，危险动作有没有权限和确认。 
我自己现在会把工具描述当成一份很小的接口文档来写。  写宽了模型会滥用，写窄了模型不敢用，返回太多窗口会变脏，错误太抽象模型会重复犯错。这些细节单看都不起眼，加在一起就会决定一个 Agent 跑得稳不稳。 
工具层能沉淀下来的资产  ，通常不在"接了多少个工具"，而是这些不显眼的东西：命名干净、参数边界明确、错误消息可执行、返回格式有上限、大结果可分页和可继续读取、危险操作按权限分级、每次调用都进 trace。把这些做好，prompt 反而能少写一点，因为系统本身已经在教模型怎么干活。 
再往协议层看，  MCP 现在挺值得关注。它不只是"生态热"，更重要的是它把工具、资源、能力边界拆开，让 Agent 不必靠一堆自定义胶水代码去理解外部系统。协议最后会不会完全统一，还要继续观察；但"把能力暴露成模型可理解、权限可治理、调用可追踪的接口"这个方向，我觉得是稳的。 
* * *
##  评估：少靠体感说对不对 
Agent 系统最麻烦的地方在于，它很多时候不会显式崩掉，而是给一个看上去挺像答案的答案：代码能跑一部分，客服回复也挺得体，报告结构完整，SQL 看着也合理。但放进流程以后才发现，用户还在反复追问，代码第二天就被人删了，报告结论经不起追溯，SQL 跑出来的数据口径不对。 
所以评估如果放到 Agent 上线后再补，会有点晚。更稳的做法是上线之前就先做一版，哪怕粗糙。 
公开 benchmark 可以参考，但替不了团队确认真实业务里 Agent 到底有没有变好。团队自己的评估集，  最好从真实 trace 里长出来。  第一次上线前哪怕只有五十条样本，也比没有强；以后每次失败就把样本补进去，每次改 prompt、换模型、改工具、调上下文压缩，都跑一遍。 
把 eval 类比成 Agent 的单元测试，我觉得这个比喻很到位。它不保证系统永远正确，但至少能让团队知道：这次改动有没有把昨天还正常的能力搞坏。 
没有这层东西，团队很容易陷在体感讨论里。换了模型，感觉更聪明；压短了系统提示，感觉更省；改了工具描述，感觉更顺。但具体哪类任务变好了，哪类任务退化了，谁也说不清。评估的价值就在这里：它把讨论从"感觉好像更聪明"拉回到具体问题。哪类任务退化了？哪个工具开始传错参数？哪个模型容易被长上下文干扰？哪次压缩丢了关键约束？哪类用户反馈说明结果根本没完成？ 
Cursor其实也是这样做的：《 [ Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) 》 
不同业务的指标当然不一样，但思路是相通的： 
场景  |  值得看的信号   
---|---  
编程 Agent  |  代码保留率、测试通过率、返工次数、回滚率   
客服 Agent  |  同一问题是否继续追问、是否转人工、投诉是否减少   
写作 Agent  |  段落保留率、改稿轮数、标题采用率   
数据分析 Agent  |  SQL 是否被执行、图表是否进入报告、结论是否被修正   
运维 Agent  |  告警是否恢复、误操作率、回滚次数、MTTR 变化   
这块最值得沉淀的，其实不是某个评估平台，而是样本、标签、失败分类、验收标准，以及团队愿意把 Agent 当成一个会退化的软件系统来运营。 
* * *
##  Harness：模型外面那层运行底座 
最近一段时间，我一直在梳理 Harness，越写越觉得它不是 Agent 外面薄薄一层壳，而是模型和真实工作之间的运行底座。 
前面写《 [ Harness 正在成为新后端 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 》时，我是从后端视角看这件事：  Agent 正在变成一种新的调用方。  后端如果只是给它暴露几个 API，很快就会遇到状态、权限、trace、恢复分散在不同系统里的问题。放到今天这个问题里，它提醒我：只比较模型本身不够，还得看模型外面的运行底座。 
短任务里，Harness 看着像执行壳  ；长任务一跑起来，它就会撞上后端同样的问题：状态、队列、日志、权限、恢复、审计、成本。Agent 进入生产以后，Harness 处理的问题已经超出了"怎么调模型"，它在回答"系统怎么处理这个新调用方"。 
模型决定能力上限  ，这个自不用说。但一个 Agent 能不能长期稳定，往往看 Harness 能不能把这些脏活处理好：每轮上下文怎么组织，工具怎么暴露，状态怎么保存，失败怎么重试，结果怎么验证，权限怎么收口，日志怎么回放，模型怎么切换，成本怎么观察，老规则什么时候清理。 
这里有一个很扎实的分工：  模型负责选下一步，Harness 负责验证、执行、捕获输出、决定反馈、设置检查点、必要时调度子任务。这个分工一旦看清楚，就不会再把 Agent 质量简单归因到模型版本上。 
[ Cursor Harness 复盘 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409236&idx=1&sn=71ae43ca6ec5b3cb1f82c258b1542271&scene=21#wechat_redirect>) ，我后来又把思路理了一遍。它值得反复读的地方，不在新概念，而在一个 Agent 产品团队怎么持续运营自己的运行底座：离线评测、线上实验、错误分类、模型适配、上下文调整、缓存成本、工具可靠性，每一项都不轻松。 
它给我的提醒很直接： 
** Agent 产品的质量很难只按模型版本讨论，更准确的发布单元，是模型加 Harness 的组合。  **
同一个模型，放在不同的上下文策略、工具契约、评估体系和权限边界里，表现差得很远。这也是为什么自研 Agent 团队特别容易低估自己的工作，大家总觉得核心在模型公司那边，自己只是"接一下 API"。但只要进入真实业务，团队自己的 Harness 很快就开始承重，它在决定任务怎么跑、怎么停、怎么恢复、怎么审计、怎么回滚。 
还有一个细节我想多说一句：  模型升级以后，Harness 不一定只需要加东西，有时也要删东西。  很多旧 prompt、旧工具包装、旧规则，原本是为老模型补短板加上去的；模型能力变强以后，它们可能反而成了负担。所以每次主力模型升级，我会顺手做一次清理：哪些静态上下文可以改成动态拉取？哪些工具包装可以退回更通用的接口？哪些系统提示其实是在限制新模型？哪些错误处理逻辑已经不再承重？哪些压缩策略正在伤害任务状态？ 
这件事没什么戏剧性，但要长期运营 Agent，靠的往往就是这种持续的小闭环。 
* * *
##  状态：让 Agent 跑完以后留下些什么 
模型本身不保存状态。长任务如果只靠聊天历史硬撑，很快就会被工具输出、用户补充、压缩摘要和错误日志冲散。 
更稳的做法是把窗口只当当前推理层，把任务状态放到窗口外。  文件系统、数据库、session 事件日志、checkpoint、任务计划、memory 文件、沙箱目录，这些都可以是状态层的一部分。 
这也是为什么 Claude Code、Cursor、Devin、Aider、OpenHands 这一类 Coding Agent 都绕不开文件系统。文件系统看着不新，但它有几个朴素的好处：  可 diff、可回滚、可审查、可复现。 
这一层也能和之前讨论的过程资产放在一起看。《 [ Agent 的下一步不是更长记忆，而是会维护过程资产 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409130&idx=1&sn=29576ecf2bb5e765e21d4d42ff6d284e&scene=21#wechat_redirect>) 》里我把 Memory、Session Search、Skill 分开看：事实记忆回答"环境和偏好是什么"，会话检索回答"过去发生过什么"，过程资产回答"这类事以后怎么做"。现在 AGENTS.md 和 Skills 在普及，我更确定这条线还会继续往前走。Agent 长期变好，靠的不只是记住更多聊天历史，还得把高频流程、验证方法、排障经验、项目约定写成它和人都能复用的资产。 
所以这件事也不能简化成"给 Agent 加一个记忆库"。更关键的是把几类状态边界先拆清楚： 
状态类型  |  适合放哪里   
---|---  
当前推理状态  |  模型窗口   
任务进度  |  session、task plan、checkpoint   
可回放事实  |  文件、数据库、trace   
团队经验  |  AGENTS.md、Skill、Runbook、Checklist   
用户偏好  |  小型记忆或用户画像   
这些边界拆清楚了，Agent 才有机会跑得更久。 
* * *
##  任务边界：先看隔离，再谈角色 
多 Agent 最容易被讲成"虚拟公司"：产品经理、工程师、QA、运维各自一份角色，看着热闹。但真到生产里，更值得关心的是边界。 
之前写《 [ Subagents 详解：Claude Code 如何避免上下文污染 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》时，我把 Subagent 放在一个很小的场景里看：搜索、阅读、验证这些探索过程必须发生，但如果全留在主窗口里，后面要做决定时，主会话会越来越脏。 
所以我现在看多 Agent，还是会先看上下文边界。 
一个子任务如果只是查证、对比、验证，最后只需要把结论和证据带回来，Subagent 是合适的。它首先省下的不是"人手"，而是主上下文的干净程度。 
要不要拆，我会看几件事：这段任务是不是独立调查？会不会污染主上下文？子 Agent 是只读，还是会写共享状态？几个子任务之间有没有强依赖？最终结果由谁合并、谁负责写入？ 
边界清楚的，Subagent 很有价值：它把搜索、读取、验证、对比这些低密度探索放进独立窗口，主 Agent 只拿回结论、证据和风险。边界不清的，多一个 Agent 只会多一层不确定性。 
所以默认单 Agent 起步，仍然是更稳的选择。等上下文压力、串行工具延迟、任务异质性真的出现了，再上 orchestrator-subagent。为了架构看着先进而提前拆，最后往往只是把错误并行化。 
* * *
##  权限和沙箱：安全最好早一点进设计 
Agent 一旦能读文件、写代码、跑命令、调数据库、访问浏览器，安全就不能后补。 
这块没有什么花活，基本功还是那些：文件读写范围、命令执行白名单或审批、网络出口控制、密钥作用域、工具权限分级、危险动作二次确认、沙箱隔离、trace 和审计、回滚路径。 
我不太相信"先跑起来，等客户安全审计再补"那套打法。 
Agent 的风险不是企业客户来了才出现的，只要它开始调工具、处理数据、执行动作，风险就已经在系统里了。  这也是架构师最好提前介入的地方。如果权限、沙箱、审计、回滚都留到产品快上线时再补，后面会非常被动。 
* * *
##  落地：从一个小闭环开始 
如果一个团队现在准备认真做 Agent，我不会建议先搭一个"万能平台"。这个说法听着有野心，但很容易让团队一开始就被抽象拖住。 
我会从一个窄目标开始。最好是业务已经在意、现在有人在做、重复度高、结果能验证的任务：某类客服工单分流、固定报告生成、代码库小迁移、销售线索初筛、某类告警排查、合同初审，都行。 
这跟《 [ 你的AI-First对了吗? 让我们一起看看你的软件工程成熟度 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409030&idx=1&sn=e435a8b1fca46cea3e5514f0541d3a17&scene=21#wechat_redirect>) 》是一条线。AI-First 难的不在"多装几个 Agent"，而在需求、测试、发布、灰度、监控、回滚这些软件工程能力，能不能重新串成一个 Agent 也能读、能跑、能被约束的系统。这条链路如果没有，Agent 做得越快，下游验证和回滚越容易被拖爆。 
第一版目标如果只写"提升效率"，通常太虚。最好写成具体的验收口径：自动解决率到多少；人工复核时间降多少；返工率低于多少；错误类型主要有哪些；失败之后怎么回滚。 
然后搭一个很小的闭环： 
  1. 1\. 一个明确目标； 
  2. 2\. 一个单 Agent 主循环； 
  3. 3\. 三到七个边界清楚的工具； 
  4. 4\. 一个窗口外状态层； 
  5. 5\. 一个沙箱； 
  6. 6\. 一套 trace； 
  7. 7\. 五十条左右的初始评估样本； 
  8. 8\. 一个能回滚的发布方式。 
多 Agent 和长期记忆可以晚一点。Agent 早期最值钱的地方，不在它会做多少事，而在团队能不能看清它怎么失败。 
第一批失败会告诉团队下一步该补什么：上下文污染就补分页、压缩、动态拉取、Subagent；工具乱用就改工具描述、参数、错误消息；结果不稳定就补评估样本和验收器；任务跑不长就把状态移到窗口外；权限风险高就先收工具和沙箱；成本失控就看缓存命中、重试循环和工具返回大小。 
所以，之前才会有《 [ 30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409091&idx=1&sn=3c40343aefdf11fdb208588a44033e14&scene=21#wechat_redirect>) 》的想法。 
让失败模式拉着架构长出来，比一开始就预制一整套理想平台要稳得多。 
* * *
##  有些东西可以晚一点 
最后说几个可以先放一放的。这部分我不想写成黑名单，很多东西不是没价值，只是没必要一开始就上。 
** 包装层很厚的新框架  ** ，可以先观察一段。如果它只是把现有模型、工具调用和 prompt 模板重新包了一层，同时还要求团队换掉日志、权限、配置、重试和部署，迁移成本很可能高过收益。 
** 复杂记忆系统  ** 也可以晚一点。多数团队一开始缺的是上下文分层、工具检索、trace、session、文件状态和评估，并不缺"长期记忆"。说不清它解决哪类真实失败时，先别加。 
** 多 Agent  ** [ 不必一开始就按角色搭 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect>) 。先画上下文边界和读写边界，再决定要不要拆。能独立调查、只读、结果可汇总的，交给 Subagent；需要频繁共享中间状态的，留在主循环里反而更稳。 
** 公开 benchmark  ** 能提供参考，但替不了内部评估。真实业务里上下文更脏，用户意图更残缺，权限限制更多，历史包袱也更多。最后能不能上线，还是要回到自己的 trace 和 eval。 
** 模型  ** 也是。我倾向于季度级别地重评估，而不是每周追榜。锁定一段时间，让团队围绕当前模型把 Harness、工具、评估跑稳；到了固定周期，再用自己的 eval 跑一遍新模型。这样既不放弃模型进步，也不让发布节奏被每次新品带着跑。 
我现在对这些东西的态度比较简单：不是否定，只是先排序。能沉淀成系统能力的先做，只能增加表层复杂度的，晚一点也不亏。 
* * *
##  写在最后 
回到开头：  Agent 时代，架构师应该学什么？ 
我现在的回答大概是这样：  学会给模型设计一个可靠的工作环境。 
这个环境里有上下文、有工具、有状态、有权限、有评估、有 trace，也有一套不断清理旧补丁、能适配新模型的运行底座。 
这些东西看着都不刺激，但它们会留下来。框架会换，模型会换，榜单会换；只要 Agent 还要进入真实系统，去读上下文、调工具、写状态、跑循环、接受评估、承担权限风险，这些工程能力就会继续承重。 
架构师不用追每个新名词。更重要的是分得出哪些会留下来，然后把它们做成团队资产。  这不是最热闹的一条路，但对要把 Agent 放进生产系统的人来说，可能是更耐用的那条。 
* * *
##  参考资料 
  * • Rohit：What to Learn, Build, and Skip in AI Agents (2026)，https://x.com/rohit4verse/status/2049548305408131349 
  * • Anthropic：Effective context engineering for AI agents，https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents 
  * • Anthropic：Writing effective tools for agents，https://www.anthropic.com/engineering/writing-tools-for-agents 
  * • Anthropic：How we built our multi-agent research system，https://www.anthropic.com/engineering/multi-agent-research-system 
  * • Cognition：Don't Build Multi-Agents，https://cognition.ai/blog/dont-build-multi-agents 
  * • Cursor：Continually improving our agent harness，https://cursor.com/blog/continually-improving-agent-harness 
  * • Simon Willison：Agents are models using tools in a loop，https://simonwillison.net/2025/May/22/tools-in-a-loop/ 
  * • Harrison Chase：Continual learning for AI agents，https://www.xrticles.com/article/continual-learning-for-ai-agents 
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