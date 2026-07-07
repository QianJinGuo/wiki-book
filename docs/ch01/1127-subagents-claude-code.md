# Subagents 详解：Claude Code 如何避免上下文污染

## Ch01.1127 Subagents 详解：Claude Code 如何避免上下文污染

> 📊 Level ⭐⭐⭐ | 43.1KB | `entities/subagents-详解claude-code-如何避免上下文污染.md`

[Subagents 详解Claude Code 如何避免上下文污染](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/subagents-详解claude-code-如何避免上下文污染.md)

架构师（JiaGouX）  我们都是架构师！
架构未来，你来不来？

#

* * *
昨天在梳理 Agent Harness 的上下文管理，我一直在想一个很小但很真实的场景：
一个 Claude Code 会话跑了半小时，模型读了几十个文件，查了很多次 ` grep ` 、 ` find ` 、 ` ls ` ，中间还跑过测试、看过日志、改过方案。等真正要写代码或做决策时，窗口里已经塞满了你再也不会回头看的中间过程。
这不是「上下文窗口不够大」这么简单。
更靠谱的说法是，很多长会话把探索过程、任务状态、文件事实和最终判断全混在了同一个窗口里。窗口看起来很热闹，真正有用的工作集反而越来越脏。
后来看到 Daniel San 那条关于 Claude Code Subagents 的帖子，正好把这个问题落到了一个很具体的机制上：会污染主窗口的探索过程，扔到独立的子代理里跑，主代理只拿回结果。
Subagent 把探索过程留在独立窗口，只把结果交回主会话
正好在想这件事，就多看了两眼。它有意思的地方倒不是 Subagent 又多了一种用法，而是把这几天一直在聊的那条线，落到了一个很具体的动作上。
前面写过，多智能体架构先看上下文边界。也聊过，Agent Harness 里的上下文，不太适合继续当聊天记录看，更像一个随时维护的工作集。
Subagents 正好卡在这两个问题中间。它的价值倒不在于让系统「看起来更像团队」，更多是把那些必须发生、但留在主窗口里就是污染的探索过程，放到独立工作区里跑完。
回头看这两个月 Claude Code 的相关讨论，主线其实在悄悄换：从「模型会不会写代码」，慢慢挪到「上下文、权限、工具、知识和验证边界能不能管住」。Subagents 算是其中一块拼图。

* * *

##  太长不看
先放结论。

* • Claude Code 的 Subagent 更适合理解成独立工作区，不要先把它想成「多一个人帮忙」。
* • 它最有价值的地方是隔离、压缩、并行：子代理自己搜索、读取、验证，主会话只拿回结论。
* • 长会话里最容易污染上下文的，往往不是最终代码，而是一次性的搜索结果、测试日志、目录列表和排查分支。
* • Claude Code 自带 Explore、Plan 这类内置子代理，已经帮你把最脏的探索阶段挡在主窗口之外。
* • 默认的 fresh subagent 适合把探索过程隔离出去；fork subagent 适合在必要时继承父会话完整背景，但它会放弃一部分输入隔离。
* •  ` description  ` 不是装饰字段，它是路由契约。写得越清楚，Claude Code 越容易把任务派给对的子代理。
* • Subagents 不是万能架构。上下文切不干净、需要反复协商、多个阶段高度共享状态的任务，留在主循环里反而更稳。
所以从我的角度看，Subagent 与其当成「多智能体的表演」，不如当成 Agent Harness 的一种上下文卫生工具，定位会更稳。

* * *

##  同一条线索
这两个月翻 Claude Code 相关的讨论，会看到不少表面不同、底子相近的经验。
Kaxil Naik 有条长帖讲得很扎实。他是 Apache Airflow 的 PMC member 和 core committer，也在 Astronomer 做工程管理。他现在的工作流里，Skills、Hooks、MCP、CLI、Subagents、Agent teams 都在用。
帖子里他没有去比哪个模型最强，结论反而落在一句话上：Harness matters more than the model。
放到本文的语境里大致是这意思：模型能力当然重要，但长任务能不能稳定跑下去，更多看外面那层 harness。规则怎么沉淀，工具怎么暴露，权限怎么限制，失败怎么被发现，探索过程怎么隔离，这些细节往往才是分水岭。
同一条帖里他还提到一个挺扎心的点：Agent 失败很多时候不是「程序崩了」，而是「看起来挺对，差点就发出去了」。这也是我自己用得越久越警惕的地方。Subagents 当然能提速，但我更看重它让每一段工作有边界、有证据、有回收结果，最后仍然回到人来判断。
还有一条流传不少的帖子也说到类似意思：项目一大，就需要 separation of concerns。  ` CLAUDE.md  ` 放标准和约束，skills 放可复用流程，hooks 放自动检查，Subagents 放隔离任务。
听上去像方法论，做起来其实很工程。如果所有东西都堆在同一段对话里，Agent 早晚会变成一锅粥。问题往往不在模型不懂，而在你给它的工作区已经没有边界。
Metabase 团队那篇复盘也是同一条线：在一个 50 万行的 Clojure 后端代码库上，他们做了 10 个 custom subagents。原因不复杂，大代码库每个子系统都有自己的习惯和坑，Claude 每次为了理解一个子系统都要重新搜索、读取、摸索，这些探索会很快吃掉主上下文。他们的解法不是再加一个更全能的 Agent，而是按领域把工作边界拆成更具体的子代理。
把这些材料放在一起看，我反倒不太想把本文写成一篇 Subagents 功能介绍。
更值得留意的是另一层信号：2026 年了， AI 编程工作流越来越像在给模型设计一套运行时。模型负责推理，外面这层 harness 负责把环境整理成它能稳定工作的样子。这个分工，去年还不太说得清，现在大家都在补。

* * *

##  长会话为什么会变脏
做过稍长一点 Claude Code 任务的人，大概都有过类似体感。
刚开始，窗口很清爽。用户目标、项目结构、关键文件、约束条件都还清楚。
跑着跑着，模型开始探索：
    grep -R "AuthService" .
    find . -name "*.ts"
    ls packages/api/src
    npm test -- auth
这些动作没有问题。甚至可以说，它们是 Agent 真正能干活的前提。
问题在于，每一次工具调用的输入和输出，都会进入会话历史。
短任务里这不算什么。模型看一眼目录，读两个文件，做一个小修复，窗口足够用。
任务一长，情况就变了。
几十次搜索结果、重复的目录列表、被截断的日志、已经排除掉的代码路径，全都堆在同一段上下文里。真正有价值的信息，反而被低密度内容稀释。
Daniel San 在原帖里给了一个很直观的数字：半小时之后，你可能已经积累了 80k token 的噪音，这些信息你再也不会回头去看一遍。
更麻烦的是压缩。
当上下文接近上限，系统会做 compaction，把前面的内容压成摘要。压缩本身不是坏事，但如果窗口里大部分都是一次性探索痕迹，摘要就很容易把「无用噪音」和「关键事实」混在一起。
最后主 Agent 看到的是一段看似完整、实际变薄的历史。关键决策的依据可能在压缩中被磨掉，剩下的只是一个貌似合理的总结。
这也是前面说「上下文不能当聊天记录」的原因。聊天记录只管保存发生过什么，工作集得关心的是下一轮推理到底需要什么。
Subagent 正好挡住了其中一类污染：那些必须做、但做完之后不值得长期留在主窗口里的探索过程。

* * *

##  Subagent 的价值不是「多开一个 Agent」
Claude Code 官方文档里对 Subagent 的描述其实很直白：当一个 side task 会把主会话塞满搜索结果、日志或文件内容，而且这些东西后面不一定会再引用时，就让 Subagent 在自己的上下文里完成工作，只把 summary 返回主会话。
这句话基本把边界讲完了。
我自己更倾向于把它当成「一次独立的工作区调用」来理解：子代理有自己的上下文窗口、自己的系统提示词、自己的工具集合和权限范围。主代理把任务派出去，它独立把活儿干完，最后只交回一份总结。
主 Agent 把探索、计划、审查交给不同 Subagent，最后只收回结果
这件事真正值钱的地方，可以分成三层来看。
第一层是隔离。子代理有自己的上下文窗口。它为了查清某个问题，可以读 20 个文件、跑 30 次搜索、看一堆日志。主会话完全不用看这些过程，只接收最后相关的结论、证据和风险。
第二层是压缩。子代理返回的是最终结果，不是完整探索轨迹。一段低密度过程被自然压成了高密度信号。按原帖的说法，原本主窗口里 50 次工具调用的过程，最后只剩 3 行结论，其余中间状态全部丢弃。这里的省 token 是其次，主要是保护主 Agent 的注意力。
第三层是并行。如果几条调查路径互不依赖，就可以并行跑。一个子代理看认证模块，一个看数据库迁移，一个看 API 调用链，最后由主 Agent 汇总。
不过 Subagent 也不是哪里都好用。我自己用下来的体会是，它最适合「独立调查、结果回收」这一类任务。如果一项任务需要频繁来回讨论，或者规划、实现、测试之间共享大量中间状态，硬切出去反而会增加交接成本。
跟前面聊 Sub-Agent VS Agent Team 时的判断是一致的：能按上下文边界切开的，才适合交给 Subagent；切不开的时候，多一个 Agent 不见得是好事。

* * *

##  一个 Subagent 文件长什么样
Claude Code 的 Subagent 可以用一个带 frontmatter 的 Markdown 文件定义。
原帖给了一个代码审查的例子，大致是这种形态：
    ---
    name: code-reviewer
    description: Review code quality, security, and maintainability after code changes.
    tools: Read, Grep, Glob, Bash
    model: sonnet
    ---
    You are a senior code reviewer.
    When invoked:
    1. Run git diff to inspect recent changes
    2. Focus only on modified files
    3. Start the review immediately
Claude Code 会自动扫描这些文件，根据  ` description  ` 决定什么时候调用哪个子代理。
文件可以放在不同位置，按从高到低的优先级大致是：

* • 组织级 managed settings：跨团队统一下发；
* •  ` --agents  ` CLI flag：当前会话临时注入；
* •  ` .claude/agents/  ` ：项目级，适合纳入版本控制，团队共享；
* •  ` ~/.claude/agents/  ` ：个人级，跨项目可用；
* • 插件目录：随插件分发。
如果多个子代理同名，优先级更高的位置会生效。
Subagent 放在哪里，决定它服务谁
手工写文件是一种方式，也可以直接用 Claude Code 的  ` /agents  ` 界面来创建、查看和管理。对团队来说，我更喜欢先把项目级 agent 放进  ` .claude/agents/  ` ，等模式稳定以后再沉淀成团队规范。
这里最值得留意的不是文件格式，而是  ` description  ` 。
很多人会把它当成普通说明。放在 Agent 系统里，它其实是路由信号。Claude Code 要判断什么时候该调用哪个子代理，靠的就是这段描述。
描述写得太宽，比如「help with code」，就容易变成什么都能接、什么都接不稳。描述写得太窄，又可能永远触发不了。
我会把它写成三类信息：

* • 这个子代理负责什么问题；
* • 什么时候应该调用它；
* • 它不负责什么。
比如一个更稳的审查代理，可以把描述写成：
    description: Review modified backend code for security, correctness, and maintainability. Use after implementation, not for planning or feature design.
这比「code reviewer」四个字有用得多。
因为它不仅告诉模型「这是审查」，还告诉模型「实现后使用」「不负责规划」。边界越清楚，路由越稳。
这一点也能接上 Kaxil 那条帖子里的判断：好的 skill、hook、subagent，其实都是在把工程判断编码下来。
以前这些判断藏在人的脑子里，靠 code review、口头提醒、团队习惯来传。现在它们慢慢挪到了 Markdown、工具描述、hooks 和 agent 配置里。这部分东西的权重，在 Agent 工作流里只会越来越高。

* * *

##  内置 Explore 和 Plan：把脏活挡在主窗口外
不一定要先自己写一堆 Subagent 才能享受到隔离的好处。Claude Code 已经自带了几个最常用的内置子代理，开箱即用，原帖里重点提到两个：Explore 和 Plan。
Explore 负责搜索和理解代码库，不做修改。它会在自己的窗口里跑 grep、find、ls、glob 这一类命令，主会话只拿到「相关结果」。那些没匹配上的、看了又排除的、扫了一眼就过的中间噪音，全部留在子代理的窗口里。
Plan 负责在 plan mode 下做上下文调查。它读取文件、理解架构、梳理约束，然后输出一份分步实施方案。中间过程主 Agent 完全看不到，只看到最终的计划文档。
这两个内置子代理背后的设计，挺值得借鉴。长任务里最「脏」的部分，往往在探索阶段，倒不一定在执行阶段。
执行阶段会留下比较明确的产出：改了哪些文件、跑了哪些测试、还剩什么问题。探索阶段则相反，会产生大量临时路径：看过但无关的文件、试过但排除的方向、搜出来又没用的匹配项。这些东西对当下探索有价值，对后续主任务价值很低。让它们在子代理的独立窗口里出现，结束后只返回几条干净结论，主窗口才不会被磨花。
这一点和写系统时处理日志的逻辑很像。日志要有，但不会全塞进业务对象里。该查的时候能查，做决策时只带摘要。

* * *

##  Fork 很强，但别把它当默认
Subagent 默认是 fresh context。
它只拿到主 Agent 给它的任务描述，在独立窗口里完成工作。这样最干净，也最符合「隔离探索过程」的目标。
但原帖重点提到一个新能力：fork。
如果主会话已经投入了很多上下文，比如很长的项目理解、历史讨论和约束条件，子代理从空白开始可能要重新构建背景，成本高，也容易漏掉关键前提。
这时可以用：
    export CLAUDE_CODE_FORK_SUBAGENT=1
设置之后，所有新启动的子代理都默认 fork 父会话的完整上下文。也可以更精细一点，只在需要时通过  ` /fork  ` 斜杠命令按需复制。
官方文档里说明了这一点：forked subagent 需要 Claude Code v2.1.117 或之后版本，仍属于 experimental。它会继承父会话到当前为止的完整上下文，看到相同的系统提示词、工具、模型和消息历史。它自己的工具调用仍然留在子代理里，最终只把结果返回主会话。
Daniel San 还提到 fork 的一个隐藏好处：fork 出来的子代理跟父代理共享 prompt cache 前缀，第二个之后的子代理在输入 token 上的成本可以低大概 10 倍。这对并行跑多个分支方案很重要。
总结一下 fork 出来的子代理的特性：

* • 继承复制时刻父代理的完整对话历史；
* • 与父代理共享 prompt cache 前缀，输入 token 成本显著降低；
* • 工具调用仍然隔离在子代理内部，不污染父会话；
* • 只把最终总结回写到父会话。
这解决了一个很真实的问题：
有些子任务如果不继承背景，根本没法独立完成。比如你已经和主 Agent 梳理了半天迁移方案，现在想让几个分支方案并行验证。让每个子代理从零读项目，反而浪费。
但我不会把 fork 当默认。
原因也很简单：fork 复制的不只是有用背景，也会复制噪音。
如果父窗口已经很脏，fork 只是把这份脏工作集复制给更多子代理。每个子代理看似「知道得更多」，实际可能一起被旧状态、无关日志和过期判断拖住。
所以我更倾向于这样用：
场景  |  更适合的方式
---|---
查找代码模式、搜索影响面、阅读一批文件  |  fresh Subagent
安全审查、性能审查、测试覆盖率检查  |  fresh Subagent + 明确任务描述
已经有很长项目背景，子任务必须继承这些约束  |  按需 fork
想从同一个起点并行比较几个方案  |  fork 可以考虑
子任务之间需要持续共享中间状态  |  不适合普通 Subagent，考虑主循环或共享状态结构
父窗口已经很乱，只是想并行加速  |  先清理主任务，再考虑拆分
说回到我自己怎么用：能用最小上下文说清的任务，尽量就不开 fork。fork 留给那些「不继承背景就完成不了」的子任务比较合适，别拿来当上下文管理的默认手段。

* * *

##  看见上下文：context-timeline 钩子
Subagent 跑起来之后还有一个现实问题：从控制台你很难看清主代理上下文的状态，更看不清并行运行的几个子代理在做什么。
Daniel San 自己开发了一个 hook 来解决这件事，叫  ** context-timeline  ** 。
安装命令很简单：
    npx claude-code-templates@latest --hook monitoring/context-timeline
它做的事不复杂：会话一开启就启动，用时间轴的方式展示主代理的上下文窗口，以及子代理如何在各自独立窗口里运行。每个正在跑的子代理状态都实时显示，等它执行完毕，返回给主代理的内容也会同步呈现。
这种工具看起来不起眼，但对长会话的可观测性很有帮助。当你能清楚看到「主窗口现在有什么」「子代理在跑什么」「它最终交回了什么」，你才能真正信任这套委派关系。
如果不打算装新工具，至少也建议在 Claude Code 里养成一个习惯：定期用  ` /context  ` 这类命令观察主窗口的占用，发现某段时间塞了大量探索痕迹，就主动把它委派出去。

* * *

##  我自己常放的几个 Subagents
如果要往项目里真的放几个  ` .claude/agents/  ` ，我倾向于先从很少的几个开始。
第一类是代码审查。
它适合独立，因为审查者不需要知道主 Agent 的所有中间想法，只需要看到 diff、相关文件、项目规则和测试结果。返回时最好带文件路径、问题等级、证据和建议，不要只写「整体没问题」。
第二类是影响面分析。
比如改一个接口、删一个字段、迁移一个配置项。子代理可以专门搜索引用、调用链、测试覆盖和文档残留。它的输出是「哪些地方受影响」，不是「我读了哪些文件」。
第三类是测试诊断。
测试失败时，主 Agent 往往会被日志淹没。让子代理单独看失败日志、定位可能原因、给出最小复现路径，再把结论还给主 Agent，会干净很多。
第四类是文档一致性检查。
代码改完后，另一个子代理去看 README、AGENTS.md、配置说明、示例命令有没有过期。这类工作边界清楚，也不需要和主 Agent 长时间共享状态。
但我不会一开始就建十几个。
Subagent 也是接口。接口太多，路由就会变复杂，维护成本也会上来。先放两三个高频、边界清楚、收益稳定的，跑一段时间再加。
一个我比较喜欢的 Subagent 模板，会刻意写清四件事：
    ---
    name: backend-impact-analyzer
    description: Analyze the impact of backend API or schema changes. Use before implementation or after changing shared contracts. Do not modify files.
    tools: Read, Grep, Glob
    model: sonnet
    ---
    You analyze impact scope for backend changes.
    Return:
    1. Affected files and why they matter
    2. Compatibility risks
    3. Tests that should be added or updated
    4. Unknowns that require human or main-agent confirmation
    Do not edit files.
    Do not propose broad refactors.
这里有几个细节：

* •  ` Do not modify files  ` 写进描述和正文，避免分析代理越权执行；
* • 工具集只给  ` Read, Grep, Glob  ` ，从权限层面就堵住「顺手改一改」的可能；
* • 输出格式要求「受影响文件、兼容风险、测试、未知项」，方便主 Agent 继续用；
* • 明确不要做大重构，减少子代理跑偏。
这类约束看起来啰嗦，但对 Agent 很有用。不显式写出来，它常常会自己补一套更模糊的版本。

* * *

##  最容易踩的坑
Subagent 本身不复杂，真正容易出问题的是使用姿势。
** 第一个坑，是把委派写得太含糊。  **
「帮我看一下这个模块有没有问题」这种任务，子代理大概率会发散。更好的写法是：「只检查认证模块最近 diff 中的安全风险，重点看 token 校验、权限绕过和敏感日志，返回 P0/P1/P2 级别问题。」
任务越具体，子代理越像工具。任务越含糊，子代理越像另一个会跑偏的聊天窗口。
** 第二个坑，是让子代理返回太多过程。  **
如果子代理把所有搜索结果、完整日志、读过的文件都倒回主窗口，隔离价值就没了。
主 Agent 需要的是结论、证据、下一步动作。必要时带 2 到 3 个文件锚点就够了。
** 第三个坑，是把需要共享状态的任务硬切出去。  **
比如一个复杂重构，前端、后端、测试、文档每一步都互相影响。你强行拆成四个彼此隔离的 Subagents，最后会花更多成本做合并和纠偏。
这种任务也可以并行，但要先设计共享状态层、契约和回滚点。普通 Subagent 更适合「独立调查，结果回收」。
** 第四个坑，是 fork 上瘾。  **
fork 很强，但它解决的是「必要背景继承」，不是「上下文管理」。一个长期依赖 fork 的工作流，往往说明任务委派还不够清楚，或者稳定知识还没有沉淀到文件、规则和工具里。
更好的方向，是把可复用背景写进  ` .claude/agents/  ` 、AGENTS.md、项目文档、测试和脚本。让子代理按需读取，而不是每次复制整段父会话。

* * *

##  总的来看
把最近几篇放在一起看，线索其实很一致。
[ 多智能体架构先看上下文边界 ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect) 。上下文管理要把聊天记录改造成工作集。Subagent 则是其中一个相当实用的执行机制：一次性探索放进独立窗口，主窗口只留下结果。
所以 Subagent 不只是 Claude Code 的一个功能点。它背后是 Agent 系统在补的一层能力：模型负责推理，外面这层 harness 负责管理工作区。
哪些内容进窗口，哪些内容留在窗口外，哪些探索可以丢弃，哪些状态必须持久化，哪些任务适合 fork，哪些任务只能共享状态。这些问题不会因为模型窗口变大而消失。窗口越大，反而越需要打理。
更大的窗口很容易给人一种错觉：什么都能塞，什么都先留着。但长任务真正需要的不是「记住一切」，而是在每一轮调用前，把该看的东西摆到模型面前，把不该干扰它的东西挡在外面。
这也是 Kaxil 那句 Harness matters more than the model 让我多看了好几眼的原因。模型当然重要。只是到了长任务、多人协作、大代码库和生产系统里，模型外面的结构会越来越决定下限。
如果说 2025 年很多人还在比较模型聪不聪明，2026 年更值得盯的，可能是这些看起来朴素的东西：

* •  ` .claude/agents/  ` 里的子代理边界；
* •  ` CLAUDE.md  ` 里的项目规则；
* • hooks 里的硬约束；
* • MCP 和 CLI 里的工具契约；
* • compaction、fork、summary、memory 这些上下文管理策略；
* • 人类工程师最后怎么 review、怎么承担责任。
这些东西不热闹，但它们让 Agent 从「能演示」走向「能长期用」。

* * *

##  写在最后
如果现在要在 Claude Code 里上手 Subagents，我自己不会一上来就搭一套复杂的 Agent Team，也不会一口气写一堆角色。
更稳妥的起点，是几个最朴素的子代理：一个只做代码审查，一个只做影响面搜索，一个只做测试失败诊断。先把它们扔进  ` .claude/agents/  ` 里跑一跑，观察两件事就够了：

* • 主会话是不是少了大量无用搜索和日志；
* • 子代理返回的结论，主 Agent 能不能直接接着用。
这两件事如果都成立，基本可以确认它在帮你改善上下文工作集。坦率说，我自己在 description 这一项上就反复改过好几版，到现在也不能说调到了最稳的状态。
至于 fork、prompt cache、context-timeline 这些能力，可以放到后面再补。它们都很有价值，但前提是先把最基础的边界切对。
回头看，长任务跑不稳，原因往往不是少了一个更聪明的模型，更多是窗口里堆了太多本该用完就丢的东西。
参考来源：

* • Daniel San，  ` Keep your Claude Code context clean with Subagents  ` ，2026-04-27 03:35，https://x.com/dani_avila7/status/2048486242321662189
* • Claude Code Docs，  ` Create custom subagents  ` ，https://code.claude.com/docs/en/sub-agents
* • Kaxil Naik，  ` I Haven't Written a Line of Code in 4 Months (But I Ship More Than Ever)  ` ，2026-03-27，https://x.com/kaxil/status/2037503513350005134
* • tut_ml，关于 Claude Code separation of concerns 的推文，2026-03-01，https://x.com/tut_ml/status/2028073256683794535
* • Metabase，  ` How we built ten custom subagents to tame a 500K-line Clojure codebase  ` ，2026-04-16，https://www.metabase.com/blog/ten-custom-subagents

## 相关推文
* • 《 [ Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远 ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect) 》
* • 《 [ MCP 退潮后，CLI 又成了王？一套更务实的判断框架 ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408377&idx=1&sn=6be411740b1243bbe7cfe24890db5958&scene=21#wechat_redirect) 》
* • 《 [ 再看 Hermes Skills：Agent 如何自我进化？ ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409130&idx=1&sn=29576ecf2bb5e765e21d4d42ff6d284e&scene=21#wechat_redirect) 》
* • 《 [ Agent 的下一步不是更长记忆，而是会维护过程资产 ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect) 》
* • 《 [ 如何为 Agent 设计产品？ ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409144&idx=1&sn=0d15111cf536be0d6aa1946d5a225ae9&scene=21#wechat_redirect) 》
* [ Agent Harness 上下文管理：聊天记录还是工作集？ ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b)
* [ Sub-Agent VS Agent Team：多智能体架构和上下文边界 ](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409155&idx=1&sn=9f539bb63197dd513ab0901cd55b1112&scene=21#wechat_redirect)
* * *
如喜欢本文，请点击右上角，把文章分享到朋友圈
如有想了解学习的技术点，请留言给若飞安排分享
** 因公众号更改推送规则，请点"在看"并加"星标"第一时间获取精彩技术分享  **
** ·END·  **
    **相关阅读：**
[刚刚，Claude Code"代码泄露"背后：如何重新看 Agent Harness](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect)
[大家都在讲 Harness，但它到底该怎么理解](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect)
[模型越来越强，为什么大家却开始重写 Harness](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect)
[如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect)
[Claude Code高手的 8 个 Claude Code 实战习惯](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408884&idx=1&sn=6a2fa56f70f15cdd75eb5c2b12e687ef&scene=21#wechat_redirect)
[别从 README 开始：一个架构师会怎样翻 Codex 仓库](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect)
[Spec 不是代码的替代品，它是 AI Coding 的上下文管理层](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408860&idx=1&sn=b882b2ee97e3f798fea96e68d27c7071&scene=21#wechat_redirect)
[如何让 Agents 自己设计、升级 Agents](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408848&idx=1&sn=aabf785116e9849dbd301a4f7c477181&scene=21#wechat_redirect)
[OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408832&idx=1&sn=ef00408738c853ea2e94be58c0612e51&scene=21#wechat_redirect)
[Claude Skills 入门：把"会用 AI"变成"可复制的工程能力"](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408200&idx=1&sn=2f2cce7dfcbdb0766eac3590f777a17b&scene=21#wechat_redirect)
[一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408189&idx=1&sn=7d4f7a442a22af37f95c46ff1048a3df&scene=21#wechat_redirect)
[Claude Code 最佳实践：把上下文变成生产力（团队可落地版）](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408183&idx=1&sn=0b6f1437465d3a61118db688cc889b17&scene=21#wechat_redirect)
[把 AI 当成新同事：Agent Coding 的上下文与验证体系](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408169&idx=1&sn=7bba1377a31ffa0ce68932935c8d923a&scene=21#wechat_redirect)
[一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408161&idx=1&sn=85aaff6f2f779e53b6ae9c5e1f003269&scene=21#wechat_redirect)
[2026年生活重启指南](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408141&idx=1&sn=e1e64ad73d25414957aa5206ca969fc3&scene=21#wechat_redirect)
[我真不敢相信，AI 先加速的是工程师。](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408153&idx=1&sn=d33b48464de93a2573a0a0cb025ada9e&scene=21#wechat_redirect)
[扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408128&idx=1&sn=1b6c640de61986d1364847bffb2cd28f&scene=21#wechat_redirect)
[Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把"可控"做成产品](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408114&idx=1&sn=29a754281cd07c16b6191c6d146c5837&scene=21#wechat_redirect)
[Anthropic官方万字长文：AI Agent评估的系统化方法论](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408107&idx=1&sn=905552d68f5b174fd9548360bdea4448&scene=21#wechat_redirect)
[银弹还是枷锁？Claude Agent SDK 的架构真相](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408084&idx=1&sn=82f274ba084f9c289e2d141aad0c088b&scene=21#wechat_redirect)
[Claude Code创始人亲授13条使用技巧](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408076&idx=1&sn=f139e90d699b528e80e79c558eed42ee&scene=21#wechat_redirect)
[Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案](https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408028&idx=1&sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&scene=21#wechat_redirect)
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
** 架构师  **
我们都是架构师！

* * *

## 深度分析
Subagents机制揭示了当前AI编程工具的一个核心工程挑战：**上下文污染问题**。当Claude Code运行超过半小时后，主窗口可能积累80k token的噪音——搜索结果、日志、目录列表等一次性信息填满了窗口，而真正重要的项目事实和决策依据反而被稀释。这种"变脏"的过程不是简单的上下文溢出，而是信息密度的恶化。
Subagent的核心价值在于**主动的信息过滤和压缩**。它不是简单地把任务分派给多个Agent，而是建立了一种上下文工作区的边界管理机制：探索性工作在独立窗口完成，主窗口只接收高密度的结论。Kaxil Naik的那句"Harness matters more than the model"点出了本质——模型能力固然重要，但长任务能否稳定运行更多取决于外围的工程结构。
Daniel San的fork机制提供了一种条件性继承能力：当前缀prompt cache共享时，后续子代理的输入token成本降低约10倍。但这也带来一个警示——fork复制的不仅是有用背景，也会复制噪音。当父窗口已经积累了大量无用信息时，fork只是在传播这种污染。
description字段的本质是**路由契约**而非说明文档。它告诉Claude Code何时应该调用这个子代理、它负责什么、不负责什么。这种明确的边界声明对于多Agent系统的稳定性至关重要——越清楚的边界，系统越容易做出正确的调度决策。

## 实践启示
**理解Subagent的适用边界：**

- Subagent最适合"独立调查、结果回收"类型的任务——代码审查、影响面分析、测试诊断、文档一致性检查
- Subagent不适合需要频繁协商、高度共享状态、多阶段迭代的任务。这类任务留在主循环更稳定
- 区分"探索性"工作和"执行性"工作：探索性工作（搜索、读取、排查）应该隔离在子代理；执行性工作（修改、测试、部署）适合在主循环
**正确使用fork机制：**

- fork是"必要背景继承"的工具，不是上下文管理的默认手段
- fork的正确使用场景：主会话已经积累了大量项目背景，子任务必须继承这些约束才能独立完成
- fork的错误使用场景：父窗口已经很乱，只是想并行加速（应该先清理父窗口）
- 使用fork后注意观察：子代理是否也开始出现同样的噪音问题
**设计有效的Subagent description：**

- 应该包含三类信息：这个子代理负责什么问题、什么时候应该调用它、它不负责什么
- 避免太宽的描述（如"help with code"），会导致子代理什么都能接但什么都不稳
- 避免太窄的描述，可能导致子代理永远不被触发
- 在description中明确约束（如"Do not modify files"）比在正文中更有效
**建立可观测性：**

- 使用context-timeline hook或定期执行`/context`命令观察主窗口占用
- 当发现主窗口塞满探索痕迹时，主动委派给子代理
- 关注子代理返回结论的质量——主Agent能否直接使用这些结论
**从少开始，逐步沉淀：**

- 建议先从2-3个高频、边界清楚、收益稳定的子代理开始
- 观察主会话是否减少了无用搜索和日志
- 观察子代理返回的结论是否主Agent能直接使用
- 模式稳定后再考虑沉淀为团队规范
## 相关实体
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道 V2](../ch05/038-agent-harness.html)
- [Subagents 详解Claude Code 如何避免上下文污染 V2](../ch03/075-claude-code.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](../ch03/075-claude-code.html)
- [Claude Code Source Architecture](../ch03/075-claude-code.html)
- [Skill System Design Three Way Comparison](../ch04/262-skill.html)

---

