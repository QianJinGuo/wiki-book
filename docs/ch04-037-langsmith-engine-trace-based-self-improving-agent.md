# LangSmith Engine: Trace-Based Self-Improving Agent

## Ch04.037 LangSmith Engine: Trace-Based Self-Improving Agent

> 📊 Level ⭐⭐ | 26.6KB | `entities/langsmith-engine-self-improving-agent-trace-based.md`

# LangSmith Engine: Trace-Based Self-Improving Agent

> 来源：分析 LangChain LangSmith Engine 的工程化自改进路径——从线上 trace 自动发现问题并转化为 issue / evaluator / 回归测试
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/langsmith-engine-self-improving-agent-trace-based.md)

## 摘要

文章指出 Agent 工程化的关键问题：**上线后的持续改进机制**。区别于"让模型自己进化"的传统思路（Hermes Agent 的定时任务总结经验），LangSmith Engine 提供更工程化的路径——**让系统从线上失败中持续学习**。核心流程：失败 trace → trajectory 压缩 → Screener 粗筛 → Investigator 调查 → 归类成 issue → 生成 evaluator + regression assertions → 沉淀为长期记忆。核心产出不是 trace 而是 issue。

## 核心要点

- **核心认知反转**：Agent 上线后，团队真正需要的不是更多日志，而是**从失败中建立反馈闭环的系统**
- **Agent 自改进的工程化路径**：线上 trace → 发现失败模式 → 归类成 issue → 生成 evaluator → 沉淀 regression example → 推动修复 → 进入下一轮测试
- **核心产出不是 trace 而是 issue**：trace 是事实记录，issue 是工程对象（分配优先级、绑定证据、生成 evaluator、补测试样例、交给修复流程）
- **整体架构三阶段**：Screener 粗筛 → Investigator 调查 → 沉淀（生成 evaluator + regression + 修复任务）
- **trajectory 压缩**：把完整 trace 压缩成行为骨架（role / latency_ms / tool_name / chars / status），不用具体文本就能识别异常形状
- **Screener 设计原则**：任务窄（只看是否值得进一步调查，不做根因分析），可并行，宁可多报不漏报
- **核心工程原则**：**便宜模型负责扩大覆盖，强模型负责关键判断**
- **issue taxonomy 必须预设**：agent_looping / incorrect_tool_args / missing_tool / tool_error_not_handled / grounding_failure / hallucination / pii_leak / inefficient_execution / final_answer_mismatch —— 不让 Agent 自由发挥，否则标签体系混乱
- **两类 Evaluator**：结构型（看 trace 结构，重复工具调用/参数 schema 错误）+ 语义型（LLM-as-judge，回答忠实度/答非所问/幻觉）
- **Evaluator 必须验证后才能使用**：在已知失败 trace 上跑一遍，确认能命中问题
- **Assertion-based regression**：不写死完整标准答案（Agent 正确回答可能多种表达），只写关键约束（must_cite_X / must_not_recommend_Y）
- **发现问题 ≠ 修复问题**：拆成两个角色——Issue Agent 负责发现/归类/生成测试资产；Fix Agent 负责基于 issue 改 prompt/工具 schema/业务代码
- **长期记忆：Agent Overview**：诊断 Agent 的 AGENTS.md，含 Agent Purpose / Expected Tools / Known Failure Modes / User Preferences
- **MVP 路径**：失败 trace → trajectory → recurring issue → regression assertions，第一版不自动修复也不自动创建 evaluator
- **飞轮断言**：bad case → issue → evaluator → regression test，谁让这个飞轮转得更快，谁的系统就能更快成熟

## 深度分析

### 一、Agent 上线后的问题形态变化

**Demo 阶段 vs 上线阶段**：

Demo 阶段 Agent 出错通常好处理——回答错了改 prompt / 工具调用错了改工具描述 / 流程走不通补节点 / 某个 case 不稳定单独调一下。

真正上线后，麻烦变成另一种形态。最消耗团队时间的往往**不是某一次答错，而是同一类错误换着壳反复出现**：

- 工具参数偶尔传错
- 该调用工具时没有调用
- Agent 反复调了很多次工具，任务却没有推进
- 最终回答看似完成，但和工具返回结果对不上
- 用户反馈不好，但 trace 里没有明显 exception
- 修了一个 case，过几天又出现一个相似 case

**这类问题最难受的地方**：不像传统 bug 那样容易复现。单条 trace 只是失败，但放到大量线上 trace 里看可能代表一类稳定模式。人不可能每天逐条翻完所有 trace。

**团队容易陷入的循环**：线上出问题 → 开发去翻 trace → 修了一个 case 过几天又冒类似 case → 想补 eval 但不知道从哪条真实失败开始 → 想优化 prompt 又搞不清是 prompt / 工具 schema / 上下文组织哪个的问题。

**关键断言**："Agent 真正进入生产环境后，团队需要的不只是 trace 可视化，而是一个自动复盘系统——能从大量 trace 里找出反复出现的问题，并把这些问题沉淀成后续可以测试、可以监控、可以修复的工程资产。"

### 二、Self-Improving Agent 的工程化路径

**澄清"自改进"定义**：不一定是模型参数层面的自我训练，也不一定是 Agent 自己修改自己。在真实工程里更可控的自改进路径是：

```
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
```

**这个过程看起来没有"模型自我进化"那么科幻，但它更接近当前 Agent 工程的真实需求**。上线后 Agent 系统最需要解决的是：失败能不能被发现、被归类——然后最关键——能不能被转化成测试和修复。

**前两件事还算好做，难的是第三件**：线上 bad case 如果只是日志里的一条记录，很快就会被遗忘；只有被转成 issue、evaluator 和 regression example，才真正进入团队的长期改进循环。**这才是 Agent 自改进在工程上的现实落点**。

### 三、为什么 issue 比 trace 更重要

很多团队做 Agent 监控时第一反应是做 trace dashboard——能看到一次 Agent 调用了哪些工具、走了哪些步骤、最终怎么回答。但 dashboard 解决的是"看见问题"，**不是"沉淀问题"**。

**真正有价值的产出应该是结构化 issue**——某类反复出现的 Agent 失败模式，加上证据和后续动作：

```json
{
  "name": "Agent 重复调用搜索工具但没有推进任务",
  "category": "agent_looping",
  "severity": "high",
  "traces": ["trace_001", "trace_018", "trace_043"],
  "actions": [
    "增加循环检测 evaluator",
    "补充回归测试样例",
    "检查工具调用策略"
  ]
}
```

**重要的不是 trace_001 单独出错了一次，而是多条 trace 共同暴露出一个模式**：Agent 在搜索工具上陷入循环，既没有带来新信息，也没有推动任务完成。对工程团队来说，真正需要修的不是某个孤立 case，而是**这种反复出现的问题类型**。

**核心断言**："**Trace 是事实记录，issue 是工程对象。**只有变成 issue，后面才能分配优先级、绑定证据、生成 evaluator、补测试样例、交给修复流程。"

### 四、整体架构：Screener → Investigator → 沉淀

**第一步：trace → trajectory 压缩**

完整 trace 太长（含几十轮消息、多次工具调用、工具返回、中间状态、最终回答），不能一开始就全部塞给模型。第一步不是分析而是压缩——把完整 trace 压缩成 trajectory（trace 的行为骨架），不保留完整文本，只保留角色、工具名、延迟、内容长度、调用状态。

```json
[
  { "role": "human", "chars": 142 },
  { "role": "ai", "latency_ms": 1820 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 340 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 312 },
  { "role": "tool", "tool_name": "search_db", "latency_ms": 298 },
  { "role": "ai", "latency_ms": 2100 }
]
```

这段 trajectory 没有具体文本，但已能看出异常：Agent 连续调用了三次同一个工具。可能是 Agent 没理解工具返回 / prompt 缺少停止条件 / 工具结果没被正确写回上下文。

**Trajectory 的价值**：用很低的成本保留 trace 的行为形状，让系统先判断哪些 trace 值得进一步分析。

**第二步：Screener 粗筛**

生产环境里可能不是几十条 trace 而是几千几万条。主 Agent 不应该亲自读每一条，应该先用 Screener 做粗筛。

**Screener 任务要非常窄**：不需要分析根因、不需要生成修复方案、不需要创建 issue，只判断——这条 trace 是否值得进一步调查？输出格式最好固定：

```
trace_001 | agent_looping | search_db 连续调用 3 次，疑似循环
trace_018 | incorrect_tool_args | 工具调用后立即失败，疑似参数错误
trace_043 | missing_tool | 用户问题需要查库，但没有调用检索工具
CLEAN: 47
```

**粗筛阶段可并行处理**（每个 Screener 负责一批 trajectory）。**粗筛不追求一步到位**，目的是用较低成本缩小搜索空间。宁可多报也不漏报，后面还有 Investigator 过滤误报。

**核心工程原则**：**便宜模型负责扩大覆盖，强模型负责关键判断**。

**第三步：Investigator 调查**

Screener 找出可疑 trace 后，Investigator 加载完整 trace + 工具参数 + 工具返回 + 必要代码上下文。它要回答的问题不是"这条 trace 看起来怪不怪"，而是：

1. 这个问题是否真实存在
2. 多条 trace 是否属于同一类失败
3. 证据是否充分
4. 问题更可能来自哪里

例如：多条 trace 中 Agent 都把"当前用户"、"me"传给 `user_id` 字段，但工具实际要求 UUID。这不只是"工具调用失败"，而是可进一步归因：工具 schema 描述不清楚 / 上下文里的 user_id 没被模型正确识别 / 参数校验失败后 Agent 没根据错误信息自我修正。**这类分析比简单打 `tool_error` 标签有价值得多，因为它开始接近真正可修复的问题**。

### 五、Issue 分类必须收敛

这类系统容易犯的错误：让 Agent 自己随意发明问题类型。短期看灵活，但长期会让标签体系混乱，出现大量含义重叠、无法统计、无法评估的分类。

**反例**（含义重叠、无法统计）：
```
bad_answer
tool_problem
agent_confusion
wrong_action
not_good
```

**正例**（预设稳定 issue taxonomy）：
```
agent_looping
incorrect_tool_args
missing_tool
tool_error_not_handled
grounding_failure
hallucination
pii_leak
inefficient_execution
final_answer_mismatch
```

分类收敛之后，issue 才能被统计、排序、分派：`incorrect_tool_args` 多 → 工具 schema 或参数构造有问题；`missing_tool` 多 → 工具选择策略有问题；`grounding_failure` 多 → 回答与工具结果之间缺少约束；`agent_looping` 多 → planner/停止条件/重试策略需要优化。

**这一步看起来只是分类，实际上决定了系统能否长期运行**——没有稳定 taxonomy 的自改进系统，很快会变成另一堆难以管理的噪音。

### 六、Evaluator 与回归测试

**发现问题不是终点，防止复发才是目的**。如果系统只是发现 issue，价值还不够——重要的是同类问题下次出现时能不能自动发现？这就需要 evaluator。

**两类 Evaluator**：

- **结构型 evaluator**：适合检测重复工具调用、工具报错未处理、参数 schema 错误、调用次数过多等问题。这类问题不需要理解语义，只要看 trace 结构就能判断
- **语义型 evaluator**：适合判断回答是否忠实于工具结果、是否答非所问、是否产生幻觉，通常需要 LLM-as-judge

**Evaluator 不能只生成不验证**——看起来合理的 evaluator 可能根本抓不住 evidence trace，或上线后制造大量误报。因此真正使用之前至少要先在已知失败 trace 上跑一遍，确认能命中问题。

**这一步很关键**：把"LLM 生成了一个看起来合理的检查器"变成"这个检查器至少能抓住已知失败样例"——**这是从分析走向工程闭环的关键一步**。

**Assertion-based regression（不写死完整标准答案）**：

不建议写死完整标准答案，因为 Agent 正确回答可能有很多种表达方式。写死输出容易误伤正确回答。更好的方式是写 assertion：

工具返回：`{"max_connections": 4096, "strict_mode": "deprecated"}`，但 Agent 最终回答建议开启 `strict_mode`，还把 `max_connections` 说成了 1024。

测试样例不需要规定完整标准答案，只写关键约束：

```json
[
  {
    "key": "must_cite_max_connections_4096",
    "comment": "回答必须说明 max_connections 是 4096"
  },
  {
    "key": "must_not_recommend_strict_mode",
    "comment": "回答不能建议开启已经废弃的 strict_mode"
  }
]
```

**核心断言**：我们关心的不是每个字是否一样，而是**关键事实、关键约束、关键行为是否满足**。线上 bad case 不再只是日志里的一次失败，而是可以进入测试集，成为以后修改 prompt/工具/模型/workflow 时的回归保护。

### 七、为什么不要一开始就自动修代码

很多人看到这里会自然想到：既然系统已经发现问题了，为什么不直接让 Agent 改 prompt 或代码？这个方向可以做，但**不建议一开始就追求全自动修复**。

**核心原因**：发现问题和修复问题是两类任务——发现问题需要看 trace、做聚类、找证据、生成 evaluator 和测试样例；修复问题需要理解代码结构、prompt 位置、工具 schema、测试边界和改动影响。如果放在同一个 Agent 里很容易出问题：

- trace 没看清就开始改
- issue 没归类就直接 patch
- evaluator 没验证就结束
- 修复建议看似合理但缺少证据支撑

**更稳妥的方式是拆成两个角色**：

- **Issue Agent**：负责发现问题、生成 evaluator 和测试样例
- **Fix Agent**：基于 issue、证据 trace 和代码上下文提出修改建议

主流程更稳定，修复流程也更容易被人工 review。**对于生产环境来说，这比端到端全自动更可靠**。

### 八、Agent Overview：诊断 Agent 的长期记忆

诊断 Agent 不能每次都从零开始。它需要知道：被诊断 Agent 是做什么的 / 正常 trace 长什么样 / 常见失败模式有哪些 / 团队更关心哪些问题 / 哪些 issue 已处理过 / 哪些问题不值得反复提醒。

**这些信息可以沉淀成 Agent Overview 文件**——可以理解为给诊断 Agent 看的 AGENTS.md：

```markdown
# Agent Overview

## Agent Purpose
这个 Agent 用于回答内部配置查询，并给出配置建议。

## Expected Tools
- get_config: 查询配置
- search_docs: 检索文档
- validate_config: 校验配置

## Known Failure Modes
- 偶尔会推荐已经废弃的配置项
- search_docs 可能被重复调用
- 最终回答有时会漏掉工具返回的关键数值

## User Preferences
- deprecated 配置建议属于高优先级问题
- 单次延迟波动不需要创建 issue
- 同类问题至少出现两次再归类
```

**Overview 既是 instruction 也是 memory**：诊断 Agent 每次运行时都可读取它，理解当前项目背景和团队偏好。当用户关闭 issue、接受 evaluator、拒绝某类建议时，这些反馈也可以写回 overview，让下一轮分析更贴近团队真实需求。

**核心动机**："我自己最怕的是幻觉——Agent 回答看起来没问题，但悄悄和工具结果对不上。每个团队怕的不一样，有的怕 PII 泄露，有的怕成本跑飞。诊断 Agent 不能只知道通用失败模式，还要逐渐学会这个项目自己的偏好。"

### 九、MVP 演进路径

如果团队想自己实现类似系统，不需要一开始就做完整。**最小版本只需跑通一条链路**：

```
失败 trace → trajectory → recurring issue → regression assertions
```

第一版只需四件事：
1. 拉取最近一批失败 trace 或低分 trace
2. 把完整 trace 压缩成 trajectory
3. 用 Agent 聚类出 recurring issue
4. 为每个 issue 生成 regression assertions

**第一版甚至可以不自动修复，也不自动创建 evaluator**。只要能稳定地把线上失败转成 issue 和测试样例，就已经很有价值。

**后续逐步增加**：evaluator 自动生成 → evaluator 自动验证 → issue 去重合并 → Agent Overview 记忆 → Fix Agent 修复建议 → 自动创建 PR。

**核心断言**：这个演进顺序更符合工程系统的成熟路径——**先把观察和沉淀做好，再逐步提高自动化程度，而不是一开始就追求端到端全自动**。

### 十、核心飞轮

基于 trace 的自改进 Agent，真正有价值的地方不在于"模型能不能自己变聪明"，而在于能不能把线上失败持续转化成工程资产。

过去：一个线上 bad case 可能只是日志里的一条记录，开发者看过、修过，很快被遗忘。

**但在这套机制下，同一条 bad case 可以变成结构化 issue、evaluator、regression example、修复建议，最后沉淀成长期记忆**。**一次线上失败，进入五个地方**。

**飞轮断言**："把 bad case 变成 issue，把 issue 变成 evaluator，把 evaluator 变成 regression test，这是 Agent 迭代的飞轮。**谁能让这个飞轮转得更快，谁的系统就能更快成熟**。"

## 实践启示

- **核心认知反转**：Agent 上线后需要的不是更多日志，而是从失败中建立反馈闭环的系统
- **核心产出是 issue 而非 trace**：issue 是工程对象（可分配优先级、绑定证据、生成 evaluator、补测试、修复），trace 只是事实记录
- **三阶段架构**：Screener 粗筛（窄任务/并行/便宜模型/宁可多报）→ Investigator 调查（加载完整上下文/真实根因）→ 沉淀（evaluator + regression + 修复任务）
- **trajectory 压缩优先**：完整 trace 太长，先压缩成行为骨架（role/tool_name/latency/chars/status）再分析
- **Issue taxonomy 必须预设**：9 类稳定分类（agent_looping / incorrect_tool_args / missing_tool / tool_error_not_handled / grounding_failure / hallucination / pii_leak / inefficient_execution / final_answer_mismatch），不让 Agent 自由发挥
- **两类 Evaluator 区分**：结构型（看 trace 结构）+ 语义型（LLM-as-judge）；必须先在已知失败 trace 上验证
- **Assertion-based regression**：不写死完整标准答案，只写关键约束（must_cite_X / must_not_recommend_Y）
- **Issue Agent 与 Fix Agent 分离**：避免 trace 没看清就开始改 / issue 没归类就直接 patch / evaluator 没验证就结束 / 修复建议缺证据支撑
- **Agent Overview 作为诊断 Agent 的 AGENTS.md**：含 Agent Purpose / Expected Tools / Known Failure Modes / User Preferences；用户反馈写回 overview 让下一轮分析贴近团队偏好
- **MVP 演进**：先跑通 trace → trajectory → issue → regression assertions 四件事，不追求全自动
- **便宜模型/强模型分工**：便宜模型扩大覆盖（粗筛），强模型做关键判断（调查 + 修复）
- **飞轮节奏决定成熟速度**：bad case → issue → evaluator → regression test 的飞轮转得越快系统越成熟

## 相关实体

- [Hermes Agent Operator](/ch04-418-hermes-agent/) — "模型侧自改进"路径（定时任务把对话总结成 Skill），与本文"系统侧自改进"互补
- [Agent Evolution 四阶段六维](/ch04-134-agent-evolution-four-stages-and-six-dimensions-alibaba-clo/) — 第四阶段"自进化 Agent"包含本文的系统侧自改进机制
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/) — Harness 第五层"评估与观测"对应本文的 trace 分析
- [Agent YAML 评测](/ch01-746-从手动到自动化-用agenteval构建agent评测体系/) — YAML-driven evaluation 是 Evaluator 工程化的一种
- [Claude Code 深度解析](/ch01-558-claude-code-harness-深度分析/) — Claude Code 的评估观测层工程实践
- [深入理解 Claude Code Harness](/ch01-167-深入理解-claude-code-源码中的-agent-harness-构建之道/) — Plan Mode + Tasks 系统的"避免问题复发"机制
- [OpenClaw 完整指南](/ch04-199-openclaw-完全指南/) — 开源 Agent 的故障处理与自我恢复机制
- [Agent 记忆系统实践](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/) — Agent Overview 是 Memory 模块的诊断侧应用- [langchain × fireworks 100x cheaper trace judge — 通用 trace 评估](/ch04-438-langchain-fireworks-100x-cheaper-trace-judge-通用-trace-评估/)

---

