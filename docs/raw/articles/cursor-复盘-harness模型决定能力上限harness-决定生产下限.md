---

title: "Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限"
type: source
tags: [ai-agent, engineering, wechat]
source: wechat
source_url: "https://mp.weixi"
ingested: 2026-05-16
fetcher: wechat-mp-rss
sha256: 02d9671271db676b30dd51963f90fc52580f2b61bc1b40e1c0344cfbbae17824

---
source: wechat
source_url: https://mp.weixin.qq.com/s/jHW0mBxbCC7czYy1fHrr4A
ingested: 2026-05-16
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-05-03
---
# Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限
架构师（JiaGouX）  我们都是架构师！
架构未来，你来不来？
* * *
最近把前面几篇 Harness 文章翻回来，我发现自己一直在绕一个很朴素的问题打转。
同一个模型，放进不同 Coding Agent，体感为什么差那么多？
4 月初整理《 [ 模型差距在缩小，Harness 差距在放大 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408973&idx=1&sn=e147f34daa2d9e3ea431d985b08486e5&scene=21#wechat_redirect>) 》时，我还主要是在外层找答案：Repo Context、结构化工具、工作记忆、缓存策略、Subagents。这些东西加起来，确实会让同一个模型像换了一种工作方式。
后来写《 [ Agent Harness 综述 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect>) 》，又多看清了一层。
Harness 不只是“工具多一点”。它更像模型和真实交付之间那套运行系统：主循环、工具、上下文、状态、权限、验证，一环扣一环。
再到昨天的《 [ Harness 正在成为新后端 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 》，问题就走到了后端边界：Agent 会读状态、写状态、开任务、查日志、恢复失败，后端要开始对 Agent 可见、可调用、可追踪。
写到这里，我自己其实还有一块没想清楚：
Harness 一旦开始承重，靠什么持续变好？
凭手感改 Prompt、加工具、换模型，看上去都在动。可团队怎么知道它真的没退化？
正好 Cursor 最近发布了《Continually improving our agent harness》。我第一次读，没觉得它有多“惊艳”。它开头那句话甚至很简单：他们构建 Agent Harness 的方式，和构建任何有野心的软件产品没有本质区别。
但读第二遍时，我反而觉得这句话很重。
Cursor 不是在讲一个新概念，也不是在重新解释 Agent 由什么组成。它是在讲一件更日常、也更难的事：
当这些组件都开始承重，团队怎么持续运营它。
里面有几件事，和我原来想得不太一样：CursorBench 之后，他们仍然很看重线上 A/B；可靠性指标不是只看总错误率，而是按模型和工具拆开；新模型上线前要重新调一遍 Harness，不是只改一个  ` model id  ` ；用户中途切模型这个看起来很自然的功能，实际会给 Harness 带来不小的迁移压力。
所以我现在会把这句话说得更保守一点：
模型强不强，用户能感受到。
但一个 Agent 能不能长期稳定，要看背后那套 Harness 能不能跑通工程闭环：可评估、可观测、可回滚，也能跟着模型一起演进。
* * *
##  太长不看
* • 这次重点不在解释 Harness 是什么，而在回答一个更实际的问题：当 Harness 开始承重，团队怎么持续运营它。
* • Agent 质量不能只看模型分数。更准确的发布单元，是“模型 + Harness”的组合。
* • Cursor 早期靠大量静态上下文和护栏兜底，现在更多转向动态上下文。模型变强以后，旧护栏要定期重测，有些该删掉。
* • 评估 Agent 不能只看 benchmark。Cursor 用 CursorBench 做离线评测，也用线上 A/B、Keep Rate、用户后续回复语义来判断真实质量。
* • 工具错误不是小问题。错误会留在上下文里，污染后续决策，所以 tool reliability 本身就是 Agent 质量工程。
* • 一套 Harness 很难通吃所有模型。OpenAI、Anthropic 等模型对工具格式、提示词、消息顺序、缓存和中途接手历史的反应都不一样。
* • 多智能体未来的重点不在角色数量，而在 Harness 能不能调度谁、怎么描述任务、怎么合并结果。
* • 对自研 Agent 团队来说，比“更长 Prompt”更早要补的，可能是一套 Harness 运行闭环：评测、告警、错误分类、模型适配、上下文预算、发布回滚和旧补丁清理。
* * *
##  先把 Harness 当线上系统看
把 Harness 当后端看，我一开始也有点犹豫。毕竟它不是传统意义上的 API 服务，也不一定有数据库、队列和接口层。
但后端里最麻烦的事，放到 Harness 上也很像。
真正怕的不是慢一点，而是团队不知道它什么时候慢、为什么慢、影响谁、能不能回滚。
一次 Prompt 调整可能让整体 token 更省，但某类长任务开始少读关键上下文。
一次工具描述压缩可能拉高缓存命中率，但某个模型开始乱传参数。
用户中途切模型这个功能上线后，看着更自由，实际带来缓存失效、历史分布错位、工具形态不匹配。这些问题不一定会立刻反映在总指标里。
Cursor 没把 Harness 写成  “设计完一次就稳定存在”的架构层  ，而是把它当成一个  持续运行、持续实验、持续修正的软件产品  。
每次调整都该有假设、有实验、有指标、有观测、有回滚。这个表述听着不新鲜，但放在 Agent 语境里，其实挺扎眼。很多团队改 Prompt、加工具、换模型，确实还没有走到这套流程。
文章里还透露了一个目标三角：  更快、更聪明、更省 token。
这三件事天然在打架。塞更多上下文，模型会变聪明，但会变慢、变贵；压一下系统提示，能省钱、命中缓存，但模型可能开始乱传参；多加几道护栏，可靠性上来了，可一旦模型升级，老护栏又会变成限速带。
Harness 的日常工作，就是在这个三角里找  平衡。
找平衡不稀奇。难的是没有评测、没有切片观测、没有可回滚的发布单元时，每一步都只能凭手感。
Cursor 这次让我多想的一点，是它把这种手感做成了可重复的工程动作。
自制图：Agent Harness 的持续运营闭环
我把这一层压成了上面这张图。这里的重点不是流程图本身，而是发布习惯：一次 Harness 改动，先说清假设，再跑离线评测，再看线上反馈和错误切片，最后决定回滚、调优，还是清掉旧补丁。
* * *
##  这条线走到这里，问题变了
"模型决定能力上限，Harness 决定生产下限"，  这话听上去像在分高下，其实不是。
模型重要，这点没什么好争的。它决定系统能理解多复杂的任务，能不能在陌生问题里做像样的推理，能不能把代码、文档、日志和用户意图揉在一起看。
没有这个底子，外面做得再精细，也只是流程自动化。
但“生产下限”讲的是另一件事。
上下文不完整、工具超时、日志很脏、用户需求含糊、模型中途切换、缓存突然失效时，系统还能不能把任务稳稳带下去。
回头看，前面几篇其实都在围着这个问题转。
《 [ AI-First 不是多装几个 Agent ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409030&idx=1&sn=e435a8b1fca46cea3e5514f0541d3a17&scene=21#wechat_redirect>) 》讲的是团队层面的变化。不是给每个人发一个 Copilot 就算 AI-First，而是测试、部署、回滚、监控和线上信号都要重新接上。
《 [ Prompt Caching ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409101&idx=1&sn=5c1ac7bd71b07c4767c19dc53d5a6c13&scene=21#wechat_redirect>) 》表面在讲省钱，实际在讲上下文的物理顺序：稳定的东西往前放，会变的东西往后长。缓存命中率不是单独的计费技巧，它经常反映出上下文结构干不干净。
《 [ 上下文管理：聊天记录还是工作集 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》说的是另一层：上下文窗口不该背全部历史，它更适合承载当前推理。真正的会话状态，要落到窗口外的 session、文件、索引、记忆和事件日志里。
《 [ Subagents 详解 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》讲的是隔离。子代理的价值，首先不是“多一个角色”，而是把低密度探索挡在主上下文外面。
到《 [ Harness 正在成为新后端 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409226&idx=1&sn=44b6970c052445e3bdb3023d28c73d51&scene=21#wechat_redirect>) 》，这条线又走到后端边界。Agent 会读状态、写状态、开任务、查日志、恢复失败，后端就要开始对 Agent 可见、可调用、可追踪。
到”Cursor 的复盘“这里，就更加顺了。
前面更多是在拆 Agent 的运行时由什么组成；Cursor 这次讲的是，这套运行时怎么被长期维护：评测、线上实验、错误分类、模型适配、缓存成本、退化告警、云端 Agent 自动查日志。
网上几条讨论也能放在一起看。Tobi Lütke 更偏爱  ` context engineering  ` 这个说法，因为关键不是写一句漂亮 prompt，而是把任务所需的上下文组织到模型能解决问题的程度。Kaxil Naik 那条 Claude Code 长帖说得更直接：他这几个月迭代最多的不是模型，而是 skills、hooks、CLI、MCP、Subagents。
我越看越觉得，这件事有点像给 Agent 补一层  SRE  。
对，SRE。不是多一个运维岗位，而是那套工程习惯：失败要留下结构化痕迹，退化要能切片定位，模型升级要重检旧规则，任务结果要能回到真实流程里验证。
这块听起来不如“多智能体自动开发一整套系统”刺激。
但 Agent 真要进生产，缺的往往就是这一层。
* * *
##  上下文少塞一点，现场多取一点
Cursor 回顾了一个很有代表性的变化。
2024 年末他们刚做编程 Agent 时，模型自己选择上下文的能力还弱，Harness 要做很多兜底：每次编辑后把 lint 和类型错误回灌给 Agent；如果它请求的读取行数太少，就替它改写读取请求；限制单轮工具调用次数；会话开始就塞进目录结构、语义匹配代码片段、用户附件的压缩版本。
这些做法在当时合理。早期模型不会自己找信息，只能提前把可能用得上的东西放进窗口里。代价是窗口越来越像杂物间，token 越来越贵。
到现在，Cursor 保留的静态上下文已经少很多，主要是操作系统、git 状态、当前和最近查看的文件这类低成本、高价值的信息。更多能力转去做动态上下文，让 Agent 在工作过程中按需拉取。
Cursor 官方图：从 upfront context 到 dynamic context
这张图里我最在意的，不是多了几个外部引用，而是上下文的进入方式变了。大块信息不必提前塞进窗口，可以在模型需要时，通过引用去拉 MCP 工具、活跃终端、历史对话这些外部信息。
信息没有消失，只是从“提前塞满窗口”变成“按需进入现场”。
这和我一开始的直觉相反：  上下文不是越多越好，而是越会取越好。
很多团队做 Agent 的第一直觉，是把资料全塞进去：项目结构、十几份文档、几百行规则、整段会话历史。看起来模型“拥有更多上下文”，实际上更容易抓不住重点。Chroma 的 Context Rot 研究和 Liu 等人的《Lost in the Middle》都提示过：长窗口不等于均匀可用，干扰信息和位置效应都会让模型表现明显下降。
更接近事实的类比，是一个优秀助理的办公桌：当前任务需要的放在手边，暂时用不到的留在抽屉里，需要时再取。Cursor 从静态上下文转向动态上下文，做的就是这件事。
这条线和前面聊过的上下文管理正好接上：上下文窗口不该继续当聊天记录，也不该当资料仓库。它更像运行时工作集。每一轮模型调用前，Harness 都要决定什么靠近模型，什么留在窗口外，什么压缩，什么通过工具再取。
但这里面还埋着一个更深的变化：模型变强以后，Harness 不只要会加护栏，也要会拆护栏。
Anthropic 在《Harnessing Claude’s intelligence》里讲过类似意思。很多 Harness 组件其实都编码了一句隐含假设：这件事 Claude 现在还做不好，所以系统要替它做。
但模型能力会变。
当模型已经能自己管某类上下文、自己决定要保留的记忆、自己判断什么时候开一个 fresh subagent，旧 Harness 逻辑就可能从护栏变成负担。
这是很多团队没及时做的事。当年为解决真实问题加进去的 Prompt、规则、工具包装、流程限制，一年后可能只是历史补丁，继续留着不一定更安全，反而压住了新模型本来更顺手的做法。
我现在会给 Harness 增加一个固定动作：每次主力模型升级后，做一次 dead weight 清理。
* • 哪些规则是为老模型补短板的？
* • 哪些工具包装可以退回成通用工具？
* • 哪些静态上下文可以改成动态拉取？
* • 哪些中间结果还需要回到模型窗口，哪些可以留在执行环境？
* • 哪些压缩、重置、提醒机制已经不再承重？
我的理解不是追求  “薄 Harness”  ，而是让 Harness 的厚度始终和当前模型能力匹配。
* * *
##  评估不能只停在跑分
我读 Cursor 时，最先停下来的其实是评估这一段。
他们没有只讲公开 benchmark。Cursor 之前专门写过 CursorBench，意思很直接：公开 benchmark 有价值，但很难完全对齐真实开发者的使用方式。
真实任务通常更脏。用户描述不完整，代码库有历史包袱，任务跨多个文件，环境里有日志和外部服务，Agent 还要自己探索路径。很多公开评测偏 bug fixing，或者任务描述太完整，和真实使用拉得太远。
CursorBench 的做法，是基于真实 Cursor 会话构造内部评测，覆盖正确性、代码质量、效率和交互行为，再持续刷新任务集，跟上开发者用 Agent 的方式变化。
但离线评测也不够。一个 Agent 的输出看起来正确，不代表用户真的觉得好用；一个离线 grader 给高分的改动，可能在真实产品里让用户返工更多。所以 Cursor 叠上了线上实验。
延迟、token 效率、工具调用次数、缓存命中率这些常规指标都有价值，但它们还够不到“Agent 有没有真的把事情做好”这个问题。
Cursor 另外看了两个代理指标：
* •  ** Keep Rate  ** ：Agent 生成的一组代码改动，过一段固定时间后还有多少留在用户代码库里。被用户很快删掉、改掉、回滚，就是初始质量不够好的强信号。
* •  ** 后续反应判读  ** ：用模型读取用户对 Agent 初始输出的下一句话，从语义上判断用户是否满意。继续做下一个功能，是任务完成；贴回一段 stack trace，通常说明它没完成。
这个思路很值得迁移。放到  客服 Agent  ，Keep Rate 可以变成“回答后用户是否继续追问同一问题”“是否转人工”“是否重复投诉”；放到  写作 Agent  ，是“生成段落最终保留比例”“标题是否被直接采用”“改稿轮数有没有减少”；放到  数据分析 Agent  ，是“生成 SQL 有没有被执行”“图表有没有进入报告”“用户有没有回到同一问题反复修正”。
指标名字不是重点。重点是评估从“输出看起来不错”，移到“结果在真实流程里有没有留下来”。
从这里再看 《 [ Agentic Engineering 和 Vibe Coding ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409219&idx=1&sn=faa35c5f162f4830e1c90933fc95bad1&scene=21#wechat_redirect>) 》，差别会更明显。
Vibe Coding 关心当下跑起来没有；Agentic Engineering 关心这段输出能不能被审查、被测试、被保留、被维护。Addy Osmani 写 Agentic Engineering 时把边界说得很清楚：AI 可以做实现，但人要拥有架构、质量和正确性。
这里的“拥有”不只是看一眼代码，而是把规格、review、测试、CI、监控这些工程闭环接上。Cursor 这套评估体系，差不多就是这个闭环在 Agent 产品侧的一种落地。
* * *
##  工具报错，会把上下文弄脏
Cursor 复盘里反复出现一个词：  context rot。
工具调用失败的影响往往不止当下那一轮。失败信息会留在上下文里，消耗 token，也可能污染后续判断。一个错误参数、一次 grep 超时、一段错误日志、一条供应商异常返回，都可能在接下来几轮推理里继续发酵。
人类工程师看到错误，通常能归类：这是环境问题，这是权限问题，这是命令写错，这是服务商挂了，这是我刚才走错路。模型不一定。如果 Harness 不把错误变成清晰的结构化信号，模型可能会基于错误前提继续往下走。
Cursor 在这一层的做法很像 SRE。未知错误默认是 Harness 的 bug，任何工具的未知错误率超过阈值就告警；预期内的错误按成因分类：
* •  ` InvalidArguments  ` ：模型传参错；
* •  ` UnexpectedEnvironment  ` ：上下文里的环境假设和真实环境矛盾；
* •  ` ProviderError  ` ：  ` GenerateImage  ` 、  ` WebSearch  ` 这类工具提供方异常；
* •  ` UserAborted  ` ：用户主动中止；
* •  ` Timeout  ` ：超时。
更细一层，他们不看一个总错误率，而是按每个工具、每个模型分别计算基线。同一个工具，不同模型出错的频率本来就不一样。
Cursor 官方图：工具调用未知错误率下降
这张工具错误率图说明了一件事：可靠性被压到了具体工具维度的未知错误率上。glob、grep、read、shell 各有自己的曲线。治理对象从“Agent 偶尔会失败”，变成了可拆分、可追踪、可复盘的工程指标。
这里有个很朴素的判断：  Agent 的错误不是均匀分布的。
某个模型更容易把 patch 格式写错；另一个更容易过度调用搜索；某个工具在大仓库里更容易超时；某个版本的工具描述可能让模型在参数边界上出问题。
只看总量，很容易被平均数骗过去。
更糟的情况，是很多团队没意识到的：Harness 改着改着，某些场景会偷偷退化。你优化了 Python，Rust 路径掉了 5%；你压了系统提示词，模型开始在 grep 上乱传参数；你换了一版缓存友好的结构，长任务的关键事实悄悄从窗口里掉了。总指标看不出来，因为东边亮西边暗，平均下来岁月静好。
这套路前端同学应该很熟。盯性能光看 P50 没用，得看 P99，得按机型、地区、网络拆开看。Agent 也一样：模型 × 工具 × 任务类型 × 代码语言 × 仓库规模，每多一个切片维度，就多一份让 bug 提前暴露的概率。平均数是用来骗自己的。
这也解释了为什么 Cursor 还会每周跑一次配了专门 skill 的 Automation，让模型自己去查日志、找新增或激增的问题、创建或更新带调查信息的工单，再用 Cloud Agents 批量推动修复。
看着像炫技，但只要日志、错误、工具调用、会话状态本来就结构化到 Agent 能读懂，用 Agent 维护 Agent Harness 就顺理成章。
反过来，如果底层记录只是一堆混在一起的文本，它最后也只能写出一段“疑似问题”的总结。
很多团队做 Agent，第一反应是加工具、加 Prompt、换模型。
其实可以先补一件更土的事：  把工具错误分类做起来，  哪怕只有五类，也比一团“tool failed”强。然后按模型、工具、任务类型、代码语言、仓库规模切片看。切片一出来，很多“模型怎么又变笨了”的抱怨，就会变成可以排查的问题。
* * *
##  换模型，不只是改一个 model id
做 Agent 平台时，很多人有一个自然冲动：把模型抽象掉，上层统一任务接口，下层随时换 Claude、GPT、Gemini、开源模型。听着很美。Cursor 的经验把这个幻想拆了一半：  Harness 抽象可以模型无关，但每个模型都需要深度定制。
OpenAI 的模型训练时更习惯基于 patch 的方式编辑文件，Anthropic 的模型更习惯字符串替换。两边理论上都能用两种工具，但给它不熟悉的形态，会多消耗 reasoning token，也更容易出错。所以 Cursor 给每个模型配置的是它训练时更熟悉的工具格式。
提示词也一样。OpenAI 模型偏字面理解、强指令遵循；Claude 对模糊指令更宽容，更偏直觉。不同提供商、不同版本，都可能需要不同的 Prompt。这已经超出“Prompt 小技巧”的范畴，是发布纪律。
新模型进来，Cursor 会从最接近的现有模型 Harness 出发，跑离线评测、内部 dogfooding，找它的困惑点，调 Prompt 和工具形态，反复迭代，直到模型-Harness 组合可发布。发布单元不是单独的模型，是模型-Harness 组合。
Composer 2 技术报告也能对上：Cursor 在训练 Composer 2 时，用的是和部署等价的 Cursor Harness 工具与结构。模型和 Harness 不只是上线时拼在一起，训练、评测、部署里都开始耦合。
这件事业内有个说法，  叫模型和 Harness 的共同进化。
Anthropic 反复讲过：模型在 post-training 阶段就会把特定的 Harness 形态纳入训练循环，Claude Code 学到的是它训练时配对的那套 Harness，所以哪怕你只动一下工具实现的细节，性能就可能掉。
反过来也成立。Manus 团队公开过半年里 Harness 重构五次的经历，每次都在做减法：复杂的工具定义换成通用 shell 执行，专门的“管理 Agent”换成结构化的交接消息。模型变强了，旧的脚手架就该被拆掉。
我会用一个很土的办法看 Harness 设计有没有跟上模型：
模型变强一档时，性能能不能自然提升，而不是复杂度再加一层？
如果可以，这套设计大概率还有弹性。
如果每次都要再叠一层规则、再补一段 prompt、再加一个 fallback Agent 才能稳住，那它可能已经在变成下一轮要被清理的历史补丁。
这就带来一个现实问题：同一个模型，离开它熟悉的 Harness，表现可能变差；同一套 Harness，换一个模型，也可能暴露新问题。用户中途切模型时这一点尤其明显。
Cursor 官方图：中途切模型后的工具历史不匹配
Cursor 提到两个挑战。  一是新模型要接手一段由另一个模型生成的对话历史。这段历史里的工具调用形态、提示风格、上下文分布，可能都不是它训练时见过的样子。  旧模型用过的  ` Grep  ` 、  ` StrReplace  ` ，新模型接手后可能根本不属于自己的工具集。Cursor 会加一段接班指令，告诉模型自己是在中途接管，并避免调用历史里出现过但不在自己工具集里的工具。这件事更像一次运行时迁移，不能只当成普通续聊。
二是缓存是提供商和模型特定的。  中途切模型会让缓存未命中，第一轮更慢、更贵。用摘要缓解可以省钱，但复杂任务里摘要又容易丢关键细节。所以 Cursor 的建议很克制：没有明确理由，复杂会话最好保持在同一个模型里。
另一种绕过去的办法，是用子 Agent。给某个模型开一个 fresh context 的 subagent，从新窗口开始做特定任务，而不是强行接管一段别人留下的历史。
这和 Claude Code Subagents 文档里的思路一致：子代理的价值不只是并行，还包括上下文隔离。高输出、强探索、需要专门 Prompt 的任务，放进子窗口里跑，主窗口只拿回结果。
所以多模型策略不该只做成一个下拉框。  更稳的设计，是给每个模型一套可版本化的 Harness 配置：工具形态、工具描述、Prompt 结构、上下文预算、错误基线、缓存策略、适合任务、不适合任务、中途切换规则、子 Agent 调度方式。做不到这一步，所谓“多模型支持”更多只是 API 聚合。
* * *
##  多 Agent 的难点，在调度和隔离
Cursor 文章结尾给了一个判断：  AI 辅助软件工程会走向多智能体。一个负责规划，一个负责快速编辑，一个负责调试，系统在专业化 Agent 和 Subagent 之间委派任务。
这话很容易被读成“多 Agent 要来了”。但 Cursor 更强调的是后半句：  系统要知道调度哪个 Agent、怎么按它的优势描述任务、怎么把结果整合回一个连贯工作流。
我理解下来，这仍然是 Harness 的事。
这和前面写《 [ Sub-Agent VS Agent Team ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect>) 》的判断一致。多智能体不是虚拟公司，不是给模型起几个角色名让它们开会。能按上下文边界切开的，才值得拆；能独立探索、独立验证、只返回高密度结果的，才适合交给 Subagent；需要频繁协商、共享大量中间状态、规划和实现强耦合的任务，留在主循环里可能更稳。
Claude Code 的 Subagents 文档把边界写得很实在：
* • 适合隔离高输出任务，比如测试、日志、文档查找；
* • 适合并行研究独立模块；
* • 适合给子任务专门的工具权限、模型和提示词；
* • 不适合需要频繁来回讨论、多阶段共享大量上下文、或者只是很小的目标修改。
它更像运行时问题，不是组织学问题。每多一个 Agent，系统就多一份上下文、多一份工具权限、多一份中间输出、多一份成本和失败可能。如果 Harness 没有调度、隔离、摘要、合并、追踪、权限和评估，多智能体只会把一个窗口里的混乱，扩散到多个窗口。
所以多智能体更接近 Harness 能力的自然延伸：先把单 Agent 的上下文、工具、验证、错误和发布纪律做稳，再把可隔离的部分拆出去。顺序反了，很容易得到一套看起来像组织结构、实际上没有工程边界的系统。
* * *
##  第一版 Harness，先把这些土动作跑起来
如果今天参与一个团队的第一版 Agent Harness，我大概率不会先写一份更长的系统 Prompt，也不会先把多 Agent 角色设计得很复杂。
我会先补一套朴素的运行纪律。
Agent 进生产后最先暴露的问题，往往不是“模型完全不会”，而是：它有时做得很好，有时悄悄退化；有时工具错了，有时上下文脏了；换个模型就不稳定；看似完成的任务，第二天全被用户改掉。
第一版先不用追求漂亮。能把这十件事跑起来，就已经比很多 demo 靠近生产一步。
###  1\. 先分任务类型，晚一点再分角色
最先要识别的是任务类型，而不是一上来就设计“规划师、执行者、审查者”这种角色。
比如信息检索、代码修改、测试修复、日志排查、设计评审、文档整理、长任务续写、高风险操作。任务类型清楚了，再决定谁来做、用什么模型、给哪些工具、用什么上下文、结果怎么验收。
###  2\. 每类任务都要看结果有没有留下
“用户满意吗”这种反馈可以留着，但不够。还要看结果有没有被保留。
代码有没有留在仓库里，文档有没有进入定稿，SQL 有没有复用，工单有没有关闭，客服回答有没有减少二次追问。质量指标最好来自用户真实行为，不只来自模型自评。
###  3\. 离线回归和线上反馈一起看
离线评测负责快速回归，线上反馈负责校准真实体验。只看离线容易优化到 benchmark，只看线上又定位成本太高、缺少可重复实验。更稳的做法是保留一批可回放任务，再用线上数据持续补充新的失败样本。
###  4\. 工具错误要分类，别只记一句失败
最起码分出参数错误、权限错误、环境错误、依赖缺失、超时、外部服务错误、用户中止、未知错误。未知错误按 bug 处理；预期错误按模型、工具、任务类型分别建基线，超过基线再告警。
###  5\. 把上下文预算摆到台面上
每个 Agent、每类工具输出、每个子任务，都要有上下文预算。工具输出过大时只给 preview，完整结果落到文件或服务端；文件读取默认分页，超限给可行动提示；会话压缩不能只写漂亮摘要，要保住当前任务状态、未完成事项、错误修复和关键文件事实。
一句话：窗口只承载当前推理，不负责保存全部历史。
###  6\. 模型适配要有版本
每个主力模型都要有自己的 Prompt 版本、工具 schema 版本、上下文策略、错误基线、适合任务列表、禁用任务列表、缓存策略、切换策略。换模型不该只是改一个  ` model id  ` 。
###  7\. 中途切模型，按状态迁移处理
复杂任务中途切模型本质是状态迁移。要么同一模型跑完整段任务，要么通过摘要和接班指令迁移，要么用 subagent 从 fresh context 开新任务。它不太适合被包装成“无成本的用户体验”。
###  8\. Subagent 描述要像路由规则
子代理的描述更接近调度信号，不能只当说明文字写。至少要说清三件事：负责什么问题、什么时候调用、不负责什么。一句“help with code”等于没有边界。
###  9\. 模型升级后，顺手清旧补丁
检查那些曾经为老模型加的规则、压缩、重置、流程和工具包装：该留的留，该删的删，能下沉到确定性工具里的就下沉，能还给模型的就还给模型。Harness 不是越薄越好，也不是越厚越稳，最怕的是厚得没有理由。
###  10\. 失败要沉淀进 Harness
Addy Osmani 在 Harness Engineering 里有个很实用的说法：每次 Agent 犯错，都应该反向沉淀成一条 Harness 设计。
它不知道团队约定，就写进  ` AGENTS.md  ` 或项目规则；乱跑高风险命令，就加 hook 拦截；总是提前结束，就补完成条件和验证回路；反复在某个工具上传错参数，就改 schema、描述和错误返回。
这才是  Harness 的复利。
比起把失败先归因到“模型还不够强”、然后继续等下一代模型，我更愿意先把这些脏活补上。
* * *
##  最后说点实在的
读完 Cursor 这份复盘，我最大的感受反而很平。
它没有给一个神奇功能，也没有把 Agent 写成什么新物种。它只是把 Agent 从“智能体产品”拉回到“软件系统”。
系统要能看见自己什么时候变差。
要能定位是哪个工具、哪个模型、哪个任务类型出了问题。
要能把错误从上下文噪音变成结构化信号。
要能把线上反馈带回离线评测。
要能为每个模型维护适合它的 Harness。
也要能在新模型变强后，删掉旧补丁。
放在 2026 年这个时间点，比起讨论"接哪个最强模型"、"要不要上多智能体"，几个更朴素的问题可能更值得先问：
* • 一次 Harness 改动到底有没有变好，我们怎么知道？
* • 它把平均值拉上去，是不是同时让某类任务退化了？我们看得见吗？
* • 工具失败污染了上下文，我们能分类、告警、恢复吗？
* • 明天换模型，发布流程是按"模型-Harness 组合"走的，还是只改个 model id？
* • 多个 Agent 同时跑，谁产生了什么结果、哪些被合并、哪些被丢弃，我们查得到吗？
这些问题都不刺激。
但凡有一条说不清，Agent 大概率还是离不开 demo 阶段。
Cursor 这次让我愿意反复看的地方，也正在这里：它把这些朴素的工程问题，老老实实写了出来。
* * *
##  参考资料
* • Cursor：《Continually improving our agent harness》https://cursor.com/blog/continually-improving-agent-harness
* • Cursor：《Build programmatic agents with the Cursor SDK》https://cursor.com/blog/typescript-sdk
* • Cursor：《How we compare model quality in Cursor》https://cursor.com/blog/cursorbench
* • Cursor：《Improving Cursor’s agent for OpenAI Codex models》https://cursor.com/blog/codex-model-harness
* • Cursor Research：《Composer 2 Technical Report》https://arxiv.org/abs/2603.24477
* • Anthropic：《Harnessing Claude’s intelligence》https://claude.com/blog/harnessing-claudes-intelligence
* • Claude Code Docs：Subagents https://code.claude.com/docs/en/sub-agents
* • Claude Code Docs：Subagents in the SDK https://code.claude.com/docs/en/agent-sdk/subagents
* • Addy Osmani：《Agentic Engineering》https://addyosmani.com/blog/agentic-engineering/
* • Addy Osmani：《Agent Harness Engineering》https://addyosmani.com/blog/agent-harness-engineering/
* • Akshay Pachaar 关于 Agent Harness 的 X 讨论：https://x.com/akshay_pachaar/status/2042586319390674994
* • Andrej Karpathy 关于 Agentic Engineering 的 X 讨论：https://x.com/karpathy/status/2019137879310836075
* • Kaxil Naik 关于 Claude Code、skills、hooks 和 harness 的 X 长帖：https://x.com/kaxil/status/2037503513350005134
* • Tobi Lütke 关于 context engineering 的 X 讨论：https://x.com/tobi/status/1935533422589399127
* • Cursor 官方 X：https://x.com/cursor_ai/status/2049901436918436249
* • Chroma Research：《Context Rot: How Increasing Input Tokens Impacts LLM Performance》https://www.trychroma.com/research/context-rot
* • Liu et al.：《Lost in the Middle: How Language Models Use Long Contexts》https://arxiv.org/abs/2307.03172
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