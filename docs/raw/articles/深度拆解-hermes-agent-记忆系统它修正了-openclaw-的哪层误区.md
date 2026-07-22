---

title: "深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？"
type: source
tags: [wechat, ai-agent, engineering, agent-tools, aws]
source: wechat
source_url: "https://mp.weixi"
ingested: 2026-05-16
fetcher: wechat-mp-rss
sha256: f21039c77fd604e29a4ac6af6745f711b6279c9d7335c87cd5f70c93752399f1
sha256: bde73cb2e3ac46a034823972739716ee1e38dfb22029147587fb8d9614dfa4b4
sha256: 66df0b4821783878b94d2b8ff7cdfb3e4d839e5e0e0e829c571ed44c5918ce6a

---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/0n5aw2I0yoyHS7W5fQ6ydA
ingested: 2026-05-16
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-04-30
---
# 深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？
架构师（JiaGouX）  我们都是架构师！
架构未来，你来不来？
* * *
今天，看到 Manthan Gupta 那篇文章标题里的  ` Fixes What OpenClaw Got Wrong  ` ，我第一反应：是不是“又要站队了”？
OpenClaw 这一波能火，本身就说明大家真有一个需求：想要一个长期在线、能用工具、能跨会话协作的个人 Agent。
Karpathy 2 月提到自己买 Mac mini 研究  ` claws  ` ，这事我一直记得。这条推文本身不夸张，真正有意思的是它把一个变化说得很直观：个人 Agent 正在从浏览器里的聊天窗口，慢慢挪到本地机器、工具、文件和私密数据旁边。
一旦 Agent 站到这个位置，问题就变了。
我们不只是在问“它聪不聪明”，也在问“能不能信任它长期记住我、代表我调用工具、处理我的上下文”。
[ Hermes 最近被反复拿来和 OpenClaw ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409010&idx=1&sn=04b9836fa07ff877c459e300707ddcff&scene=21#wechat_redirect>) 比，表面看是功能对比，往下看其实是另一件事：它把“记忆”的成本账算得更细。
一个 Agent 每天都在和我们协作，它当然要记得人和环境。但问题是：记在哪里？每轮都带着，还是需要时再找？保存事实、保存历史、保存做法，是不是同一件事？
前面整理《 [ Claude Code 长任务为什么不容易跑偏 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) 》时，我已经开始把“记忆”和“上下文治理”分开看。后来写《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》和《 [ Subagents 详解：Claude Code 如何避免上下文污染 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》，这条线更清楚了一些。
今天，算是沿着同一条线再往前一步。
Agent 想跑长，不能只靠更大的窗口，也不能只靠一句“永久记忆”。它得知道长期资产该怎么分层：哪些常驻提示词，哪些留在历史档案，哪些沉淀成下次可复用的方法。
也就是说，我更愿意把这件事看成两套思路的对照，而不是写成 Hermes 赢了、OpenClaw 输了。
更有用的看法是：OpenClaw 把“长期在线的 Agent”推到了大众视野里，Hermes 则提供了一个更在意提示词缓存的记忆样本。
Manthan 这篇文章最有意思的地方，也在这里。Hermes 没把记忆做成一个大口袋，而是拆成了几种成本和用途完全不同的机制。
它没有试图把所有历史都塞进一个越来越大的记忆库里。它的做法更克制：  ** 让系统提示词前缀尽量稳定，把必须常驻的事实压到很小，把历史、流程和深层用户建模放到各自的位置。  **
如果说上下文管理解决的是“当前这一轮该看什么”，Hermes 的记忆系统进一步回答的是：  ** 跨过这一轮之后，什么东西值得留下来，应该留在哪一层。  **
* * *
##  太长不看
先放几个结论，后面逐个拆。
* • Hermes 没有一套单一记忆系统。更准确地说，它有一组分层的连续性机制：  ` MEMORY.md  ` /  ` USER.md  ` 、  ` session_search  ` 、skills，以及可选的 Honcho。
* •  ` MEMORY.md  ` 和  ` USER.md  ` 是热记忆，只放每次都值得带上的高价值事实，默认只有 2,200 字符和 1,375 字符。
* • 这两个文件在会话开始时作为 frozen snapshot 注入系统提示词。会话中途写入会落盘，但不会立刻改掉当前系统提示词，主要是为了保护 prompt cache。
* •  ` session_search  ` 才是长尾回忆系统。历史会话存在 SQLite 里，用 FTS5 搜索，再截断、摘要后交给主模型。
* • 长对话压缩前，Hermes 会先做一次 memory flush，让模型在历史被压缩前把真正值得长期保存的事实写进记忆。
* • Skills 是程序性记忆，记录“这类事下次怎么做”，而不是记录“这次聊了什么”。
* • Honcho 这类外部记忆层更适合做深层用户建模，但它也被放在不会频繁破坏系统提示词缓存的位置。
* • 放到工程里看，Hermes 和 OpenClaw 真正值得比较的，是谁把不同长期资产放在了更合适的位置，而不只是“谁更会记”。
* * *
##  先把“记忆”这个词拆开
聊 Agent 记忆时，我自己通常会先停一下。
一说记忆，很多人脑子里会同时想到用户偏好、历史会话、文件笔记、向量检索、长期画像、自动总结、workflow、skills。最后所有东西都进了一个大口袋，名字都叫 memory。
工程上这样做，后面很容易乱。
因为这些东西的更新频率、召回方式、风险边界都不一样。
用户偏好可能每次都要带着。比如用户不喜欢长篇解释，或者某个项目总是用  ` pnpm test  ` 。
历史会话不该每次都带着。上个月修过一个 Docker 网络问题，只有用户问起“上次那个怎么处理的”时才需要找回来。
做事流程又是另一种东西。比如一次复杂 code review 的检查顺序、一个发布失败的排查路径、一个数据清洗任务的固定步骤。它不只是“发生过什么”，更像“下次遇到类似问题可以怎么做”。
Hermes 好看的一点，就在于它没有把这些东西混在一起。
可以先用一张很小的表记住：
要记住的问题  |  Hermes 里更接近的位置
---|---
每轮都应该知道的事实和偏好  |  ` MEMORY.md  ` /  ` USER.md  `
以前聊过什么、做过什么  |  ` session_search  `
这类任务下次怎么做  |  skills
更深的用户画像和跨平台连续性  |  Honcho 等外部 provider
这张表不复杂，但它能把很多 Agent 记忆讨论从“要不要更长”，拉回“该放哪一层”。
图 1 先把这几层压成一张图。
Hermes 的四层记忆：不是一个大口袋
_ 图 1：事实、历史、流程和用户建模，不适合都塞进同一个 memory 口袋。  _
Garry Tan 开源 GBrain 时，用的是一个很有吸引力的说法：让 OpenClaw 或 Hermes Agent 能对 10,000 多个 Markdown 文件做 total recall。这个需求很真实。个人 Agent 用久以后，大家都会想要一个能记住资料、项目和旧想法的外脑。
但这也把问题推到了另一面：  ** 能回忆一切，不等于每轮都应该携带一切。  **
Letta 4 月初发 Context Constitution，也是在讲相近的问题：Agent 要通过主动管理上下文来学习，不能只靠短会话里的临时表现。换句话说，“记忆”正在从产品卖点变成运行时设计问题。
Hermes 的记忆系统，正好可以当作这条线上的一个剖面。
* * *
##  Hermes 最先保护的是稳定前缀
理解 Hermes 的记忆系统，先要看它到底把什么发给模型。
原文里整理的系统提示词结构大致是这样：
    默认 Agent 身份  
    工具使用行为 guidance  
    可选 Honcho 集成块  
    可选系统消息  
    冻结的 MEMORY.md 快照  
    冻结的 USER.md 快照  
    Skills index  
    上下文文件，比如 AGENTS.md、SOUL.md、.cursorrules  
    日期、时间和平台提示  
    对话历史  
    当前用户消息
这个顺序很关键。
如果前面的系统提示词部分频繁变化，模型供应商侧的 prompt caching 就很难命中。
每一轮都把新的记忆、检索结果、用户画像、历史摘要塞进 system prompt，看起来信息更足，实际会把成本和延迟一起抬上去。
所以 Hermes 的方向很清楚：
** 稳定的东西放前面，动态的东西放后面；每轮都要看的信息尽量短，偶尔才用的信息走工具。  **
这也是为什么它的内置记忆这么小。
它当然能存更多，只是更在意控制什么东西配得上进入系统提示词。
这点和前面聊 Agent Harness 的工作集很像。窗口不是仓库，系统提示词更不是仓库里的黄金地段。能放进去的，必须足够稳定、足够高频、足够值得。
这张图可以更直观看到 Hermes 的取舍。
Hermes 为什么不轻易改系统提示词
_ 图 2：稳定前缀尽量走缓存，动态召回尽量靠工具和当前轮次承接。  _
* * *
##  ` MEMORY.md  ` 和  ` USER.md  ` ：热记忆只放高价值事实
Hermes 的内置长期记忆由两个文件组成：
* •  ` ~/.hermes/memories/MEMORY.md  `
* •  ` ~/.hermes/memories/USER.md  `
` MEMORY.md  ` 放的是 Agent 侧笔记，比如环境事实、项目约定、工具怪癖、反复踩过的坑。
` USER.md  ` 放的是用户画像，比如偏好、沟通风格、身份信息和稳定工作习惯。
默认容量很小：
* •  ` MEMORY.md  ` ：2,200 字符。
* •  ` USER.md  ` ：1,375 字符。
两者加起来，也就一张很短的工作卡片。
原文里有个说法，很值得留意：Hermes 使用字符限制，而不是 token 限制。这让它不需要依赖某个模型的 tokenizer，就能控制记忆大小。实现看上去朴素，但很符合运行时系统的取舍：稳定、可预测、少耦合。
文件格式也很简单，条目之间用  ` §  ` 分隔。没有上来就做复杂向量库，也没有把记忆写成一个难以人工审查的内部格式。
这层 memory 真正要看的，是写入边界。
Hermes 鼓励保存：
* • 用户偏好；
* • 环境事实；
* • 反复出现的修正；
* • 稳定约定；
* • 以后每次都可能影响行为的高价值信息。
它明确不鼓励保存：
* • 当前任务进度；
* • 本次会话结果；
* • 临时 TODO；
* • 一次性排查路径；
* • 只是为了证明“我做完了”的日志。
这条边界看着细，其实很关键。
很多 Agent 系统的记忆之所以越用越乱，就是因为它把“应该长期影响行为的事实”和“当时发生过的流水账”混在一起。时间一长，模型每次启动都背着一堆已经过期、低密度、上下文不完整的信息。
Hermes 对这两个文件的态度更像对待运行时资产。
会话开始时，它把  ` MEMORY.md  ` 和  ` USER.md  ` 加载进系统提示词，并冻结成快照。会话中途如果通过  ` memory  ` 工具写入新内容，新内容会立刻落盘，但不会立刻改掉当前会话已经构建好的 system prompt。
这看起来有点反直觉。
用户刚刚纠正了偏好，为什么不马上进入提示词？
答案还是缓存和稳定性。
Hermes 选择让当前会话继续使用稳定前缀，新写入的记忆等下一次会话，或者压缩触发 prompt rebuild 时再进入系统提示词。它牺牲了一点即时性，换来更稳定的缓存命中和更可控的提示词结构。
这也是我觉得 Hermes 这层设计比较工程化的地方：  它没有把“记住”写成一个浪漫能力，而是在问一个很具体的问题：  记住之后，会不会破坏当前运行时的成本模型？
* * *
##  ` memory  ` 工具：小工具背后是系统提示词安全
Hermes 管理这两个文件，靠一个  ` memory  ` 工具。
工具动作很少：
* •  ` add  `
* •  ` replace  `
* •  ` remove  `
这里没有复杂的“读”动作，因为当前记忆已经在会话开始时注入过了。模型不需要再读一遍  ` MEMORY.md  ` 才知道它记了什么。
` replace  ` 和  ` remove  ` 的交互也很实用：它们用子字符串匹配。模型不需要记住一个内部 ID，只要拿现有条目里一段唯一文本，就能替换或删除。
这类细节很小，但对 Agent 工具很关键。工具如果需要模型维护太多内部状态，错误率会很快上去。
再看安全边界。
Hermes 会拒绝重复条目，也会在写入记忆前检查危险内容，包括提示词注入、凭证泄露、SSH 后门暗示、不可见 Unicode 字符等模式。
原因很直接：  ** 写进 memory 的内容，未来可能进入 system prompt。  **
普通日志里混进一句恶意文本，影响范围通常有限。长期记忆里混进一句“忽略之前的所有指令”，它就可能在后续很多会话里反复污染系统状态。
很多自建 Agent 记忆系统，容易低估这一点。
记忆不是普通数据库字段。只要它会被模型读到，并且会影响模型后续行为，它就属于提示词供应链的一部分。写入、更新、删除、审计都要按这个级别看。
* * *
##  ` session_search  ` ：档案室不等于随身备忘录
如果  ` MEMORY.md  ` 和  ` USER.md  ` 是热记忆，  ` session_search  ` 就更像档案室。
Hermes 会把过去的会话存到  ` ~/.hermes/state.db  ` 。里面有 sessions、messages、FTS5 全文索引，还通过  ` parent_session_id  ` 保留会话之间的 lineage。
当模型需要回忆以前聊过什么时，更稳的路径不是去翻那张小小的  ` MEMORY.md  ` 卡片。
更合适的路径大概是：
1. 1\. 用 FTS5 在历史消息里搜索。
2. 2\. 按 session 聚合结果。
3. 3\. 解析父子会话关系。
4. 4\. 加载最相关的会话。
5. 5\. 在匹配点附近截断 transcript。
6. 6\. 用便宜的辅助模型做 focused summary。
7. 7\. 把压缩后的回顾交还给主模型。
这条链路比“直接把所有历史都存进 memory”麻烦很多，但边界也清楚很多。
` MEMORY.md  ` 负责“我每次都要知道什么”。
` session_search  ` 负责“用户说上次那个问题时，我怎么找回来”。
这两类问题放在同一个存储和召回策略里，迟早会互相干扰。
放到前几天的 [ 上下文管理 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 主线上看，这其实很一致：历史会话是窗口外事实层，模型窗口只是它在当前轮次里的一个投影。需要哪一段，就切哪一段；需要压缩，就先摘要再交给主模型。
档案室很重要，但没人会把档案室背在身上。
* * *
##  压缩前的 memory flush：真正值钱的是迁移状态
长会话一定会遇到压缩。
压缩本身不稀奇。真正难的是：压完以后，Agent 还能不能继续干活。
Hermes 的做法里，有一个我很喜欢的动作：压缩前先做 memory flush。
当会话太长、系统准备压缩中间历史时，它会先给模型一个专门指令，大意是：
    会话即将被压缩。  
    请先保存任何值得长期记住的内容。  
    优先保存用户偏好、修正和重复模式，不要保存一次性的任务细节。
然后它运行一次额外模型调用，而且只开放  ` memory  ` 工具。
这一步的价值不在于“又多总结了一次”。它更像一次 checkpoint：趁历史还没被压薄，先把未来可能还会用到的稳定事实挪到更可靠的位置。
压缩完成后，Hermes 会让缓存的系统提示词失效并重建。这样，压缩前刚写入的 durable memory 就能进入新的稳定提示词快照。
整个流程大致是：
    长会话  
    -> 压缩前保存稳定事实  
    -> 压缩旧历史  
    -> 重建提示词  
    -> 带着更新后的热记忆继续
这和前面聊 Agent Harness 上下文管理时的判断完全一致：  ** 会话压缩不能只理解成把历史变短，它更应该是把任务状态迁移到更稳定的位置。  **
区别在于，Hermes 把这件事落到了 memory 工具和 prompt rebuild 里。
这也能接上我们之前 3 月 [ 关于 1M 上下文 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409066&idx=1&sn=e28eab3e566c87ef7ecc4dc50ade1f3f&scene=21#wechat_redirect>) 的讨论。Matt Pocock 做长上下文代码实验时提到，任务进入很长上下文后，模型的决策质量和指令跟随会明显变差；Oren Melamed 接着给了一个很工程化的判断：多个边界清楚的 sub-agent，往往比一个硬吃超长上下文的 Agent 更稳。
这个观点放在记忆系统里也成立。窗口变大只是把“塞不下”往后推了一段，真正重要的还是工作集有没有被打理好。
这和我们前面的《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》其实是同一层问题。窗口里留下来的，不应该是发生过的一切，而应该是下一轮推理真的要用的工作集。
当然，这里也有边界。
memory flush 仍然依赖模型判断“什么值得记住”。模型可能漏掉，也可能写入过度概括的内容。所以这一步不能替代结构化状态管理、事件日志和人工审查。
但从运行时设计看，这个动作方向是对的：别等历史已经被摘要磨薄了，才发现关键事实没留下来。
* * *
##  Skills：Agent 也要记住做事方法
Hermes 的记忆故事不止事实和历史。
它还有 skills。
Skills 放在  ` ~/.hermes/skills/  ` ，原文把它称为 procedural memory，也就是程序性记忆。
这个词用得挺准。
事实记忆回答“环境是什么、用户偏好是什么”。
会话检索回答“以前发生过什么”。
Skills 回答的是“下次遇到类似任务，应该怎么做”。
比如：
* • 复杂 PR review 应该先看哪些文件；
* • 某类部署失败先查哪些日志；
* • 某个团队的数据导出流程怎么跑；
* • 一个反复出现的问题，哪些修复路径已经验证过，哪些不要再试。
这类知识如果只留在聊天记录里，下次很难稳定复用。如果塞进  ` MEMORY.md  ` ，又会挤占本来就很小的热记忆空间。
更合理的做法，是把它沉淀成一个可维护的 skill。
Hermes 也没有把所有 skill 内容都塞进提示词。它注入的是紧凑的 skills index，真正需要时再加载完整 skill。
这和 Claude Code Subagents 的思路也能接上：主上下文只应该保留当前推理需要的高密度信息。探索过程、历史细节、完整流程文档，都应该在需要时按边界拿出来，而不是常驻主窗口。
我更愿意把 skills 看成 Agent Runtime 里的 SOP。
它的价值不在“越来越有灵性”这种叙事上，而在于把团队和系统已经验证过的做事方法，变成可检索、可更新、可审查的运行时资产。
Kaxil Naik 那篇关于 AI coding agents 的长帖，和这里也能对上。他说自己几个月几乎不手写代码，真正投入最多的是 skills、hooks、CLI、MCP 和 Subagents 这些外围结构。这个经验很有代表性：模型负责推理，长期工作流靠的是把人的判断编码进可复用资产里。
那句“harness matters more than the model”我觉得挺实在。模型当然重要，但真正把长期工作撑起来的，往往是模型外面的结构。
这也能接上《 [ 拆解 Hermes Agent 的三层学习机制 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409017&idx=1&sn=02cae5fcaf4095d5bda9299e1051e826&scene=21#wechat_redirect>) 》。当时我更关注的是 Hermes 如何把事实、历史和流程拆开；这次再看，重点又往前走了一点：这些层怎么和提示词缓存、压缩、外部 provider 放在一条运行时链路里。
这里还有一个风险：  错误经验也可能被固化。
一个写坏的 skill，比一段普通错误回复更麻烦。普通错误回复过去就过去了，skill 会在未来反复触发。所以 skill 必须有生命周期：能创建，能修补，能删除，能标注适用范围，最好还能附带验证步骤和失败模式。
这是“Agent 会学习”真正难的地方。
学习不是只会多写几段总结。学习意味着系统有能力区分哪些经验可复用，并且愿意在经验过时后把它改掉。
* * *
##  Honcho：深层用户建模也要守住缓存边界
Hermes 还有一个可选层：Honcho。
如果说本地 memory 是一张短卡片，session_search 是档案室，skills 是流程库，那 Honcho 更像外部用户模型。
它可以做跨会话用户建模、跨机器和跨平台连续性、语义搜索，以及对用户或 AI peer 的更深层推断。
这里最值得看的，是 Hermes 把 Honcho 接进来的方式。
第一轮会话里，预取到的 Honcho 上下文可以被织入系统提示词。
后续轮次里，Hermes 尽量不改稳定 system prompt，而是把 Honcho recall 附加到当前用户消息附近，在 API 调用时动态提供。
这样做的好处很明确：
* • 稳定前缀继续稳定；
* • prompt cache 仍然能发挥作用；
* • 后台预取到的新上下文可以服务下一轮；
* • 深层用户建模不会每轮都改写系统提示词。
这又回到 Hermes 反复在做的取舍：动态召回可以有，但稳定前缀不要随便动。
我对这层会更谨慎一点。
深层用户建模有价值，尤其是跨设备、跨产品、长周期协作时。但它也会带来更重的治理问题：用户是否知道哪些信息被保存，哪些结论被推断，怎么删除，跨平台同步时权限怎么处理，外部 provider 出错时如何回滚。
所以 Honcho 适合被看成增强层，不适合一开始就当成所有 Agent 的默认记忆底座。
多数团队先把热记忆、历史检索、压缩迁移和 skill 生命周期做好，收益可能更直接。
* * *
##  它修正的，是 OpenClaw 容易被误读的那层记忆观
Manthan 用了一个很强的说法：Hermes 修正了 OpenClaw 做错的地方。
放到工程里，我觉得应该把这句话收得更稳妥一点。
Hermes 和 OpenClaw 的差别，不是简单的谁有记忆、谁没有记忆。我们之前拆 OpenClaw 时也说过，它有 Markdown 记忆、工作区文件、记忆搜索、压缩前的静默刷写、Honcho 相关能力，也在往更完整的 memory plane 演进。
真正需要被修正的，是一种很容易出现的记忆观：
> 只要把更多东西存下来、搜回来、塞给模型，Agent 就会越来越好用。
这个想法有一半是对的。
长期 Agent 确实需要记忆。GBrain 这类工具受关注，也说明“总回忆”是一个真实需求。OpenClaw 把长期在线、工作区记忆、跨入口协作这些能力带火，也不是偶然。
但另一半问题也绕不开：更多记忆会带来更多成本。
每次都带进提示词，会破坏缓存和注意力；全部交给历史搜索，召回质量和摘要质量就成了瓶颈；流程经验如果只留在 transcript 里，下次很难稳定复用；如果把错误经验沉淀成 skill，又会在未来反复误导 Agent。
Hermes 的回答更像是：先别急着记更多，先问这条信息属于哪一层。
更准确的差别在系统重心。
OpenClaw 更厚在 gateway、workspace、入口治理、会话和 memory plane。它很关心多入口、多 agent、工作区隔离、可控执行、可审计和可恢复。
Hermes 更厚在一个 cache-aware 的执行型 runtime：小型热记忆、会话检索、skills、压缩前 flush、外部 provider，通过一条更集中的链路串起来。
如果用一句话压一下，大概是这样：
** OpenClaw 更像把长期状态放进工作区和记忆平面里管理；Hermes 更像先保护提示词稳定性，再把长期资产拆到热记忆、档案室、流程库和外部模型里。  **
这不是谁绝对更好。
换成一张图，大概是这样的关系：
Hermes 与 OpenClaw 的系统重心差异
_ 图 3：OpenClaw 更像控制面样本，Hermes 更像 cache-aware runtime 样本。  _
如果目标是做一个多入口、长期在线、强治理的 Agent Gateway，OpenClaw 那套控制面和工作区边界很有价值。
如果目标是做一个本地执行型 Agent，强调缓存成本、长任务连续性、过程经验沉淀，Hermes 的分层就很值得研究。
更值得带走的，是它们都在往同一个方向收敛：Agent 不能再只靠一个越来越长的聊天历史活着。它需要窗口外的状态层，也需要能把状态分门别类地放好。
Anthropic 4 月推出 [ Claude Managed Agents ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408997&idx=1&sn=705380d312800e5ddc36b14f64112ea7&scene=21#wechat_redirect>) 时，Lance Martin 的表述也落在这个方向：用户定义 agent 配置和任务，底层 harness 与托管基础设施负责长任务可靠性。
大厂、开源项目和个人工作流其实都在补同一层东西：  把模型放进一个能长期运行、能恢复、能审计、能分层管理上下文的系统里。
* * *
##  落到自研，先看几个不起眼的小边界
如果现在要给自己的 Agent 系统补一套记忆能力，我不会先上复杂向量库，也不会一开始就做深层用户画像。
更稳妥的做法，可能是先问几个很小的问题。
** 第一，什么信息配得上进入热记忆？  **
热记忆要小。用户偏好、环境事实、稳定约定可以进。任务进度、完成日志、一次性 TODO 最好留在别的层。
一旦它会进入 system prompt，就要按提示词供应链来做输入校验、安全扫描和可删除能力。
** 第二，历史会话有没有档案层？  **
历史没必要都压进 memory。更稳的是保存完整事件或消息，再提供关键词搜索、按 session 聚合、局部截断和摘要召回。
用户问“上次那个问题”时，系统应该能查，而不是让模型凭印象猜。
** 第三，压缩前有没有状态迁移动作？  **
长任务压缩之前，最好有一轮明确的 durable state extraction。哪些偏好、修正、稳定事实要留下来，哪些只是本轮任务细节，最好在历史被压薄之前处理。
** 第四，流程经验有没有自己的位置？  **
如果一个问题反复出现，或者一次任务沉淀出可复用方法，光写进总结不太够。更好的位置是 skill、runbook、项目规则、测试脚本或 CI。
流程经验要能版本化、能修补、能删除。
** 第五，外部用户建模是否真的需要？  **
Honcho、Mem0 这类外部记忆层不是没价值，但它们会引入隐私、权限、同步和解释问题。先确认热记忆、历史检索和 skill 层已经清楚，再考虑是否需要更深的用户模型。
** 第六，系统有没有观测记忆怎么被使用？  **
至少要知道：哪些条目进了 prompt，哪些内容来自历史检索，哪些 skill 被触发，压缩前写了什么，外部 provider 返回了什么。
记忆如果不可观测，最后很容易变成一团没人敢删的旧状态。
* * *
##  写在最后
把最近关于Agent的内容，放在一起看，脉络其实挺清楚。
[ 多智能体先看上下文边界 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect>) ，再决定要几个 Agent。
[ 长任务先看每轮工作集怎么整理 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) ，再讨论窗口够不够大。
[ Subagent 的价值在于隔离一次性探索 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) ，主窗口只留下可用结果。
今天看 Hermes，问题又往下沉了一层：跨会话以后，哪些东西要被保存，哪些东西只需要能搜回来，哪些东西应该变成下次可复用的做事方法。
这几件事其实都在讲同一个方向。
Agent 的工程化，已经不是给模型喂更多上下文就完事。它越来越像在设计一套运行时：窗口里放什么，窗口外存什么，压缩时迁移什么，失败后恢复什么，长期资产怎么被更新和删除。
Hermes 的记忆系统让我多看一眼，就是因为它把这件事做得很克制。
它没有把“记住更多”当成目标。
它更像是在反复问：这条信息应该在哪一层，以什么成本，被谁召回，什么时候过期。
正如我们之前讲到的，《 [ 记住不难，想起才难：Clawdbot 的内存架构与压缩前刷新 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408224&idx=1&sn=c6b910eefd2f8ffeb845c0a716af1ef3&scene=21#wechat_redirect>) 》。
这也是我现在更愿意采用的判断：  ** 好的 Agent 记忆，重点在于用正确的层级和成本，记住正确的东西。  **
* * *
##  相关推文
* • 《 [ Sub-Agent VS Agent Team：多智能体架构和上下文边界 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect>) 》
* • 《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》
* • 《 [ Subagents 详解：Claude Code 如何避免上下文污染 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》
* • 《 [ 拆解 Hermes Agent 的三层学习机制：OpenClaw 加自总结 Skills 后，差异还剩什么？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409017&idx=1&sn=02cae5fcaf4095d5bda9299e1051e826&scene=21#wechat_redirect>) 》
* * *
##  参考资料
* • Manthan Gupta：  ` I Read Hermes Agent's Memory System, and It Fixes What OpenClaw Got Wrong  ` ，https://x.com/manthanguptaa/status/2034849672985288957
* • Andrej Karpathy：关于  ` claws  ` 与本地个人 Agent 运行时的讨论，https://x.com/karpathy/status/2024987174077432126
* • Garry Tan：GBrain / OpenClaw 与 Hermes Agent total recall 讨论，https://x.com/garrytan/status/2042497872114090069
* • Letta：  ` The Context Constitution  ` ，https://x.com/Letta_AI/status/2039813750879105072
* • Kaxil Naik：  ` I Haven't Written a Line of Code in 4 Months  ` ，https://x.com/kaxil/status/2037503513350005134
* • Oren Melamed / Matt Pocock：关于 1M context 与 sub-agents 的讨论，https://x.com/OrenMe/status/2034727197605232810
* • Lance Martin：Claude Managed Agents 发布讨论，https://x.com/RLanceMartin/status/2041930946019295245
* • Hermes Agent GitHub README：https://github.com/NousResearch/hermes-agent
* • Hermes Memory 文档：https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
* • Hermes Skills 文档：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
* • Hermes Sessions 文档：https://hermes-agent.nousresearch.com/docs/user-guide/sessions
* • Hermes Honcho 文档：https://hermes-agent.nousresearch.com/docs/user-guide/features/honcho
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