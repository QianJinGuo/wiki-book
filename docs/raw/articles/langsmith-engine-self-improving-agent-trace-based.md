---
source_url: https://unknown/langsmith-engine-self-improving-agent-trace-based
tags: [article]
ingested: 2026-05-01
sha256: c0e9df5ddc32d4655ca6870f4c813cbd0e0553004268f1323bc260029a6301e6
---
模型和 Agent 的自改进一直是 AI 领域的热门方向。

我自己最初理解 Self-Improving Agent，想的也是模型总结经验、生成 Skill，或者在交互中不断积累记忆。Hermes Agent 就是这条路：定时任务把对话历史总结成 Skill，让 Agent 在未来任务中复用。

但对于真正上线的 Agent，还有一条更工程化、也更现实的自改进路径：不是让模型自己进化，而是让系统从线上失败中持续学习。

最近 LangChain 推出的 LangSmith Engine，给了一个很好的参考方向：它不是直接训练模型，也不是单纯做 trace dashboard，而是让一个 Agent 跑在另一个 Agent 的 trace 之上，自动发现反复出现的问题，再把这些问题转成 issue、evaluator、回归测试样例和修复建议。

 LangSmith Engine指出了 Agent 工程化里一个关键问题：

Agent 上线之后，团队真正需要的不是更多日志，而是一个能从失败中建立反馈闭环的系统。




Agent 上线后，问题会变得不一样

Demo 阶段，Agent 出错通常还比较好处理。

回答错了就改 prompt，工具调用错了就改工具描述，流程走不通就补一个节点，某个 case 不稳定就单独调一下。

但真正上线以后，麻烦会变成另一种形态。

最消耗团队时间的，往往不是某一次答错，而是同一类错误换着壳反复出现：

工具参数偶尔传错；
该调用工具时没有调用；
Agent 反复调了很多次工具，任务却没有推进；
最终回答看似完成，但和工具返回结果对不上；
用户反馈不好，但 trace 里没有明显 exception；
修了一个 case，过几天又出现一个相似 case。

这类问题最难受的地方在于，它不像传统 bug 那样容易复现。

单条 trace 看起来只是一次失败，但放到大量线上 trace 里看，它可能代表一类稳定的模式。问题是，人不可能每天逐条翻完所有 trace。

于是团队很容易陷入循环：

线上出问题，开发去翻 trace；修了一个 case，过几天又冒出一个类似 case；想补 eval，但不知道该从哪条真实失败开始补；想优化 prompt，又搞不清到底是 prompt 的问题、工具 schema 的问题，还是上下文组织的问题。

所以，Agent 真正进入生产环境后，团队需要的不只是 trace 可视化，而是一个自动复盘系统。

它要能从大量 trace 里找出反复出现的问题，并把这些问题沉淀成后续可以测试、可以监控、可以修复的工程资产。




Self-Improving Agent，让系统持续从失败中总结、吸收经验

这里先澄清一点。所谓 Agent 自改进，不一定是模型参数层面的自我训练，也不一定是 Agent 自己修改自己。

在真实工程里，更可控的自改进路径通常是：

线上 trace
  ↓
发现失败模式
  ↓
归类成 issue
  ↓
生成 evaluator
  ↓
沉淀 regression example
  ↓
推动 prompt / tool schema / code 修复
  ↓
进入下一轮测试和监控

这个过程看起来没有“模型自我进化”那么科幻，但它更接近当前 Agent 工程的真实需求。

因为上线后的 Agent 系统，最需要解决的是：失败能不能被发现、被归类——然后，最关键的一步——能不能被转化成测试和修复。

前两件事还算好做，难的是第三件。一个线上 bad case 如果只是日志里的一条记录，很快就会被遗忘；只有它被转成 issue、evaluator 和 regression example，才真正进入团队的长期改进循环。

这才是 Agent 自改进在工程上的现实落点。

核心产出不是 trace，而是 issue

很多团队做 Agent 监控时，第一反应是做 trace dashboard。

Dashboard 当然有用，它能让你看到一次 Agent 调用了哪些工具、走了哪些步骤、最终怎么回答。但 dashboard 解决的是“看见问题”，不是“沉淀问题”。真正有价值的产出，不应该是一堆原始 trace，而应该是结构化 issue。

一个 issue 可以理解为：某类反复出现的 Agent 失败模式，加上证据和后续动作。

例如：

{
  "name": "Agent 重复调用搜索工具但没有推进任务",
  "category": "agent_looping",
  "severity": "high",
  "traces": ["trace_001", "trace_018", "trace_043"],
  "actions": [
    "增加循环检测 evaluator",
    "补充回归测试样例",
    "检查工具调用策略"
  ]
}

这里重要的不是 trace_001 单独出错了一次，而是多条 trace 共同暴露出一个模式：Agent 在搜索工具上陷入循环，既没有带来新信息，也没有推动任务完成。

对工程团队来说，真正需要修的通常不是某个孤立 case，而是这种反复出现的问题类型。这也是为什么 issue 比 trace 更重要。Trace 是事实记录，issue 是工程对象。只有变成 issue，后面才能分配优先级、绑定证据、生成 evaluator、补测试样例、交给修复流程。

整体架构：先筛选，再调查，最后沉淀

一个基于 trace 的自改进 Agent，流程大概是这样的：

第一步，把完整 trace 压缩成轻量的行为轨迹，因为完整 trace 太长，不能一开始就全部塞给模型。

第二步，用 Screener 快速扫描大量 trace，找出可疑样本，但不急着做根因分析。

然后，Investigator 加载完整 trace、工具参数、工具返回和必要代码上下文，判断问题是否真实存在。

最后是沉淀，把确认后的问题转成 issue，并围绕 issue 生成 evaluator、回归样例和修复任务。

整体流程可以抽象成这样：




这个架构有一个关键设计：发现问题和修复问题要分开。

Issue Agent 负责发现问题、归类问题、生成测试资产；Fix Agent 则基于 issue、证据 trace 和代码上下文，去改 prompt、工具 schema 或业务代码。

这样职责更清楚，也更容易评估每个环节的质量。

为什么要先把 trace 压缩成 trajectory？

先说成本问题。生产环境里的 trace 往往很长，尤其是复杂 Agent，一条 trace 可能包含几十轮消息、多次工具调用、工具返回、中间状态和最终回答。

如果每次都把完整 trace 丢给模型，系统很快就会被上下文长度和调用成本拖垮。

所以第一步不是分析，而是压缩。可以把完整 trace 压缩成 trajectory，也就是 trace 的行为骨架。它不保留完整文本，只保留角色、工具名、延迟、内容长度、调用状态等信息。

例如：

[
  { "role": "human", "chars": 142 },
  { "role": "ai", "latency_ms": 1820 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 340 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 312 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 298 },
  { "role": "ai", "latency_ms": 2100 }
]

这段 trajectory 没有任何具体文本，但已经能看出异常：Agent 连续调用了三次同一个工具。这可能是 Agent 没有理解工具返回，也可能是 prompt 缺少停止条件，或者工具结果没有被正确写回上下文。

trajectory 的价值就在这里：它用很低的成本保留了 trace 的行为形状，让系统可以先判断哪些 trace 值得进一步分析。

Screener：不要一上来就做根因分析

再说规模问题。生产环境里可能不是几十条 trace，而是几千条、几万条。这时候，主 Agent 不应该亲自读每一条，而应该先用 Screener 做粗筛。

Screener 的任务要非常窄。它不需要分析根因，不需要生成修复方案，也不需要创建 issue，只需要判断：这条 trace 是否值得进一步调查？

输出格式最好固定，例如：

trace_001 | agent_looping | search_db 连续调用 3 次，疑似循环
trace_018 | incorrect_tool_args | 工具调用后立即失败，疑似参数错误
trace_043 | missing_tool | 用户问题需要查库，但没有调用检索工具
CLEAN: 47

粗筛阶段可以并行处理，每个 Screener 负责一批 trajectory。

粗筛不追求一步到位，目的是用较低成本缩小搜索空间。宁可多报一点，也不要漏掉明显问题，后面还有 Investigator 负责过滤误报。

这也是一个重要的工程原则：便宜模型负责扩大覆盖，强模型负责关键判断。

Investigator：从异常形状走向问题归因

粗筛只能发现异常形状，不能确认问题是否真实存在，更不能判断根因。

这就需要 Investigator 来接手。

Screener 找出可疑 trace 后，Investigator 才加载完整 trace，查看用户输入、模型中间回复、工具参数、工具返回、最终回答，以及必要的 prompt、代码或工具 schema。

它要回答的问题不是“这条 trace 看起来怪不怪”，而是：这个问题是否真实存在，多条 trace 是否属于同一类失败，证据是否充分，问题更可能来自哪里。

比如，多条 trace 中 Agent 都把 "当前用户"、"me" 传给 user_id 字段，但工具实际要求的是 UUID。

这就不只是“工具调用失败”，而可以进一步归因：工具 schema 描述不清楚，或者上下文里的 user_id 没有被模型正确识别，或者参数校验失败后 Agent 没有根据错误信息自我修正。

这类分析比简单打一个 tool_error 标签有价值得多，因为它开始接近真正可修复的问题。

issue 分类要收敛，不要让 Agent 自由发挥

这类系统很容易犯一个错误：让 Agent 自己随意发明问题类型。短期看很灵活，但长期会让标签体系变得混乱，出现大量含义重叠、无法统计、无法评估的分类。

比如：

bad_answer
tool_problem
agent_confusion
wrong_action
not_good

这些标签看起来都能描述问题，但对工程系统没有太大价值。更好的做法是预设一组稳定的 issue taxonomy，例如：

agent_looping
incorrect_tool_args
missing_tool
tool_error_not_handled
grounding_failure
hallucination
pii_leak
inefficient_execution
final_answer_mismatch

分类收敛之后，issue 才能被统计、排序和分派。比如 incorrect_tool_args 多，通常说明工具 schema 或参数构造有问题；missing_tool 多，说明工具选择策略有问题；grounding_failure 多，说明回答与工具结果之间缺少约束；agent_looping 多，则说明 planner、停止条件或重试策略需要优化。

这一步看起来只是分类，但实际上决定了系统能否长期运行。没有稳定 taxonomy 的自改进系统，很快会变成另一堆难以管理的噪音。

发现问题不是终点，防止复发才是目的

如果系统只是发现 issue，那价值还不够。真正重要的是：同类问题下次出现时，能不能自动发现？

这就需要 evaluator，Evaluator 可以分成两类。

一类是结构型 evaluator，适合检测重复工具调用、工具报错未处理、参数 schema 错误、调用次数过多等问题。这类问题不需要理解语义，只要看 trace 结构就能判断。

另一类是语义型 evaluator，适合判断回答是否忠实于工具结果、是否答非所问、是否产生幻觉，通常需要 LLM-as-judge。

但 evaluator 不能只生成不验证。

一个看起来合理的 evaluator，可能根本抓不住 evidence trace，也可能上线后制造大量误报。因此，真正使用之前，至少要先在已知失败 trace 上跑一遍，确认它能命中问题。

这一步很关键，因为它把“LLM 生成了一个看起来合理的检查器”，变成了“这个检查器至少能抓住已知失败样例”。

这也是从分析走向工程闭环的关键一步。

把线上失败转成回归测试

除了 evaluator，issue 还应该沉淀成 regression example，也就是把真实线上失败加入离线测试集。但这里不建议写死完整标准答案，因为 Agent 的正确回答可能有很多种表达方式。如果要求输出完全一致，测试会变得僵硬，也容易误伤正确回答。

更好的方式是写 assertion。

比如工具返回：

{
  "max_connections": 4096,
  "strict_mode": "deprecated"
}

但 Agent 最终回答里建议开启 strict_mode，还把 max_connections 说成了 1024。

那么测试样例不需要规定完整标准答案，只需要写出关键约束：

[
  {
    "key": "must_cite_max_connections_4096",
    "comment": "回答必须说明 max_connections 是 4096"
  },
  {
    "key": "must_not_recommend_strict_mode",
    "comment": "回答不能建议开启已经废弃的 strict_mode"
  }
]

这种 assertion-based regression 更适合 Agent 测试。

因为我们关心的不是每个字是否一样，而是关键事实、关键约束和关键行为是否满足。

这样一来，线上 bad case 就不再只是日志里的一次失败，而是可以进入测试集，成为以后修改 prompt、工具、模型或 workflow 时的回归保护。

为什么不要一开始就自动修代码？

很多人看到这里会自然想到：既然系统已经发现问题了，为什么不直接让 Agent 改 prompt 或代码？

这个方向当然可以做，但不建议一开始就追求全自动修复。

原因是，发现问题和修复问题是两类任务。

发现问题需要看 trace、做聚类、找证据、生成 evaluator 和测试样例；修复问题需要理解代码结构、prompt 位置、工具 schema、测试边界和改动影响。

如果放在同一个 Agent 里，很容易出现几个问题：trace 没看清就开始改，issue 没归类就直接 patch，evaluator 没验证就结束，修复建议看似合理但缺少证据支撑。

更稳妥的方式是拆成两个角色：

Issue Agent 负责发现问题、生成 evaluator 和测试样例。

Fix Agent 基于 issue、证据 trace 和代码上下文提出修改建议。

这样做的好处是，主流程更加稳定，修复流程也更容易被人工 review。

对于生产环境来说，这比端到端全自动更可靠。

还需要一个长期记忆：Agent Overview

诊断 Agent 不能每次都从零开始。

它需要知道被诊断的 Agent 是做什么的，正常 trace 长什么样，常见失败模式有哪些，团队更关心哪些问题，哪些 issue 已经处理过，哪些问题不值得反复提醒。

这些信息可以沉淀成一个 Agent Overview 文件。

你可以把它理解成给诊断 Agent 看的 AGENTS.md。

例如：

# Agent Overview

## Agent Purpose
这个 Agent 用于回答内部配置查询，并给出配置建议。

## Expected Tools
- get_config：查询配置
- search_docs：检索文档
- validate_config：校验配置

## Known Failure Modes
- 偶尔会推荐已经废弃的配置项
- search_docs 可能被重复调用
- 最终回答有时会漏掉工具返回的关键数值

## User Preferences
- deprecated 配置建议属于高优先级问题
- 单次延迟波动不需要创建 issue
- 同类问题至少出现两次再归类

这个 overview 既是 instruction，也是 memory。诊断 Agent 每次运行时都可以读取它，从而理解当前项目的背景和团队偏好。

当用户关闭 issue、接受 evaluator、拒绝某类建议时，这些反馈也可以写回 overview，让下一轮分析更贴近团队真实需求。

这部分很重要。我自己最怕的是幻觉——Agent 回答看起来没问题，但悄悄和工具结果对不上。每个团队怕的不一样，有的怕 PII 泄露，有的怕成本跑飞。诊断 Agent 不能只知道通用失败模式，还要逐渐学会这个项目自己的偏好。

一个可落地的 MVP

如果团队想自己实现类似系统，不需要一开始就做得很完整。

最小版本只需要跑通一条链路：

失败 trace → trajectory → recurring issue → regression assertions

也就是说，第一版只需要做四件事：拉取最近一批失败 trace 或低分 trace，把完整 trace 压缩成 trajectory，用 Agent 聚类出 recurring issue，再为每个 issue 生成 regression assertions。

第一版甚至可以不自动修复，也不自动创建 evaluator。

只要能稳定地把线上失败转成 issue 和测试样例，就已经很有价值。




后续再逐步增加 evaluator 自动生成、evaluator 自动验证、issue 去重合并、Agent Overview 记忆、Fix Agent 修复建议和自动创建 PR。

这个演进顺序也更符合工程系统的成熟路径：

先把观察和沉淀做好，再逐步提高自动化程度，而不是一开始就追求端到端全自动。

总结：成熟 Agent 团队，比拼的是从失败中学习的速度

基于 trace 的自改进 Agent，真正有价值的地方不在于“模型能不能自己变聪明”，而在于它能不能把线上失败持续转化成工程资产。

过去，一个线上 bad case 可能只是日志里的一条记录，开发者看过、修过，很快被遗忘。

但在这套机制下，同一条 bad case 可以变成结构化 issue、evaluator、regression example、修复建议，最后沉淀成长期记忆。一次线上失败，进入五个地方。

这才是 Agent 工程里更现实的自改进路径：让系统持续从失败中总结、吸收经验，减少重复犯错。

把 bad case 变成 issue，把 issue 变成 evaluator，把 evaluator 变成 regression test，这是 Agent 迭代的飞轮。谁能让这个飞轮转得更快，谁的系统就能更快成熟。
