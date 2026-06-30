# Loop Engineering: 把反馈循环放进工程现场

## Ch05.004 Loop Engineering: 把反馈循环放进工程现场

> 📊 Level ⭐⭐ | 28.3KB | `entities/loop-engineering-feedback-control-system.md`

# Loop Engineering: 把反馈循环放进工程现场

2026 年 6 月，Anthropic Claude Code 创建者 Boris Cherny 和 OpenAI 「龙虾之父」Peter Steinberger 同时在公开场合提出一个新范式——**Loop Engineering**。核心命题：**开发者不再手动给编程 Agent 写提示词，而是设计一套循环机制，让这些循环去提示 Agent 并判断下一步**。 这个范式在 Claude Code 已落地的 `/loop` 命令、OpenAI 的 Codex `/goal`、Hermes Agent 的 cronjob 系统中已可看到雏形。本文综合 3 篇深度文章（InfoQ 报道、Peter 本人论述、若飞工程现场分析）还原 Loop Engineering 的完整图景。

---

## 范式核心：从 Prompt 到 Loop 的跃迁

旧模式（人驱动循环）：
> 人 → 提示 → Agent → 输出 → 人审查 → 人修正 → 重复

新模式（循环驱动）：
> 人设定目标 → 循环运行 → Agent 发现 → 规划 → 执行 → 验证 → 迭代 → 完成

关键区别：**提示给 Agent 的是指令，循环给 Agent 的是一份工作**。 提示词解决的是「下一句话怎么说」，Loop 解决的是「这件事怎么持续做、怎么知道做对、什么时候停」。 这种抽象层级的提升不是「更复杂的自动化」，而是「把对话式 prompt 升级为可工程化的控制系统」。

## 范式细节

### Loop 的五样必备 + 一条状态记忆

若飞（架构师 JiaGouX 主笔）总结 Loop 工程必须包含 6 个组件：

1. **自动触发**（cron、`/goal`、`/loop`、`/schedule`）——Loop 不能依赖人按下回车
2. **隔离工作区**（worktree、临时分支）——避免并发覆盖
3. **过程资产**（Skills、规则、模板）——不每轮重新解释上下文
4. **外部连接**（MCP、插件、CLI）——否则只能看本地文件
5. **独立验证**（sub-agent/reviewer/测试）——避免「自写自审」的反馈缺失
6. **状态记忆**（plan.md、issue、日志）——让下一轮能接上前一轮

这个清单与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md) 的核心组件（tool / context / verifier）有强对应关系，但**Loop 比 Harness 高一层**：Harness 管「这一次任务怎么跑」，Loop 管「这类任务怎么持续发生」。

### 单 Agent 循环 vs Fleet 循环

Peter Steinberger 把 Loop 分为两个规模：

- **单 Agent 循环**：一个 Agent 独立运行整个周期（调研→起草→检查→修正→再运行）。适用：聚焦任务、明确目标、有限范围。
- **Fleet 循环**：编排者 Agent 拆目标→专业 Agent 各负责一步→子 Agent 做细粒度工作→评估门禁控质量。适用：复杂项目、跨领域协作、规模化任务。

两个规模对应 [Agent 自我改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md) 的不同实现路径：单 Agent 是「单点迭代」，Fleet 是「分布式迭代」。

### 反馈闭环：Loop 不是 cron

最常见的误解是把 Loop 当成 cron——「每 5 分钟让 Agent 重做一次」。这种「open-loop」（无反馈的循环）会失败，因为 Agent 会在循环中不断重复并自我确认错误。 真正的 Loop Engineering 是 **closed-loop**（有反馈）：

- **Stop condition**（停止条件）：测试通过、目标达成、超出预算、回滚触发
- **Verifier gate**（验证门禁）：每个 loop 周期必须有独立验证（test/review/sub-agent），不能让 Agent 自审
- **Rollback mechanism**（回滚机制）：当循环发现产出质量恶化时，能回到上一个好状态
- **Human-in-the-loop**（人工介入）：当 loop 自身无法判断时（如遇到价值观冲突、不可逆动作）必须交给人

YC CEO Garry Tan 在转发相关讨论时提醒：**不要把 Agent 变成「富士康工厂」式的重复劳动机器**。Agent 应该是「智能、有思考能力、且并不危险的」，开发者应该让它们承担更多工作，而不是只是重复执行同一个动作。 这个提醒本质上是说：**Loop 应该是「带反馈的智能循环」而非「机械重复的自动化」**。

### 成本结构：被忽视的隐形障碍

Peter 评论区最常见的反驳是「你说得轻松，你有无限 OpenAI 额度」——这是 Loop Engineering 的核心隐性障碍。 成本结构参考：

- 单 Agent 循环（中等任务）：5-20 万 token / 次
- Fleet 循环（编排者 + 3 专业 Agent）：50-200 万 token / 次
- 每天定时循环：每周数百万 token

这个成本让 Loop Engineering 在「正常 API 预算」下几乎不可行。**低成本模型 + 百万级上下文**（DeepSeek / Kimi / MiniMax 类）的出现让 Agent 循环在经济上变得可行。 这一点对 [AI R&D 瓶颈迁移](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-r-and-d-bottleneck-shift.md) 框架也有印证：当 verifier 的成本下降时，loop 才能规模化。

## 现实案例

### Claude Code /loop

Claude Code 的 `/loop` 命令是 Loop Engineering 的最早期产品化落地：开发者设置一个「每 N 分钟执行某 prompt」的循环，让 Claude Code 自动迭代（重构 + 测 + 改 + 测）。但 2026 Q1 后 Anthropic 加入了 Review Mode（human-in-the-loop）——纯 loop 不再是默认推荐。^[entities/claude-code-core-internals]

### OpenAI Codex /goal

Codex 的 `/goal` 命令是 Fleet Loop 的早期形态：编排者 Agent 接受大目标后，拆任务给子 Agent，每个子 Agent 运行自己的 loop（写代码→测→改），子 Agent 完成后编排者收口。

### Hermes Agent cronjob

Hermes Agent 的 cronjob + skill 系统本质是 Loop Engineering 的一种实现：cron 是「自动触发」，skill 是「过程资产」，working set + autoCompact 是「状态记忆」，lint + pre-commit gate 是「独立验证」。但 Hermes 的 loop 是「**外部编排 loop**」而非「Agent 内部 loop」——区别是「loop 控制器在 Agent 外部（如 cron、CI 调度）vs 内部（如 sub-agent）」。^[entities/hermes-agent]

## 局限与反对声音

Loop Engineering 的第一个局限是**成本失控**。即使有低成本模型，长时间运行的 loop 累计 token 消耗仍然可能让一个月的 AI 预算在 1 周内耗尽。务实策略：每个 loop 必须有 **budget cap**（token/time/cost 三维上限）+ **metrics 监控**（成功率、回归率、token 效率）。^[concepts/ai-r-and-d-bottleneck-shift] 第二个局限是**反馈循环本身的偏差累积**——如果 verifier 设计有缺陷，loop 会「错误地确认错误」并越走越偏。[Verifier-driven development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) 是应对：每个 verifier 必须有独立 ground truth，不能让 verifier 也变成 LLM 循环。^[concepts/verifier-driven-development] 第三个反对意见：Loop Engineering 是「过度工程」——简单任务直接对话式 prompt 更高效，只有「重复性高 + 有明确成功标准 + 需要可审计性」的任务才适合 loop。判断标准：任务的「重复频率 × 失败成本」乘积超过某阈值才值得 loop 化。

### 第 4 来源补强：Samuel McDonnell "泼冷水" 视角（深思圈翻译/评论）

Samuel McDonnell（也是 Dynamic Workflows 那篇的 AI 工程师）2026-06 对 Boris/Peter 范式的批评**比上面三条更尖锐、更根本**——它直接质疑整个 Loop Engineering 叙事的**盲点**。

**核心命题：「一个 loop = 生成器 + 验证器，瓶颈从来不在生成器这一侧」**——把 Boris/Peter 的"提示词 → 循环"叙事翻转：Boris/Peter 重点讲"怎么搭循环"，Samuel 指出**真正决定产出质量的是循环里的"验证器"那半**，而三段式框架（2024 写 prompt / 2025 并行 agent / 2026 搭循环）把这一半藏起来了。

**开放 vs 封闭循环**：开放循环给 agent 大片探索空间、产出真正新颖的结果，但烧 token 失控且评判标准松时变成"喷废料的机器"；封闭循环每步提前钉死、每步评估、能在正常预算内跑出真实结果。**Samuel 的硬判断：今天真正能出活的是带评估闸门的封闭循环**——"自主性不是原因，评估闸门才是"。

**内循环 vs 外循环**：内循环（任务内 self-test）已成熟，大多数 agent 现在都会写测试跑测试；但**外循环（跨会话持久化教训）还只搭了一半**——"把对的教训、用对的颗粒度、写到对的地方，比听起来难得多，大量价值现在正摊在桌上没人捡"。SKILL.md / AGENTS.md 就是外循环的家，**仓库不遗忘，但模型遗忘**。

**"绿色 ≠ 正确"**：Bun 75 万行 Rust 移植，99.8% 测试通过 + Anthropic 自承认"还没上生产"。Samuel 说"这是整个发布里最诚实的一句话"——99.8% 跑分说明复现了旧测试描述过的行为，但**生产是那些还没人写过测试的行为**。"一个跑成绿色的循环，不是一个正确的循环。它只是一个满足了你给它的那个验证器的循环。产出的质量，被那个验证器的质量封顶——一分都高不上去"。

**深思圈的反转洞察**：在写作/策略/设计/品味领域，"验证器"恰恰就是人类判断——"你以为你在搭循环，其实你只是把'自己看一眼'换了个名字"。外循环的"教训持久化"也存在**递归验证问题**：判断哪条教训是对的本身就是一次验证，**一条错的教训被持久化会毒化后续所有运行**。**最大收获的反转**：不是去搭循环，而是反过来——"在你给 AI 套上循环之前，先老实问自己一句——这件事，我有没有一个真能信的验证器？没有的话，自动化的不是产出，是更快的错"。

**Samuel 的最后一句**（值得抄）："agent 时代的管理，不是招到能干的工人。工人既能干又便宜。它是设计他们在其中运行的约束——和管人，从来是同一件事。别再设计提示词，去设计验证者"。 这与 Peter 的"经济可行性取决于验证成本"（深度分析第 5 节）和 entity 第 122 行"优先设计 verifier，再设计 loop"在三个不同视角下**互相印证**。

## 与相邻概念的区分
Loop Engineering vs **Cron Job**：cron 是「定时触发」（机械），loop 是「反馈驱动触发」（智能）。cron 适合周期性维护（每天清理日志），loop 适合持续推进（修复 CI 失败直到全绿）。Loop Engineering vs **Harness Engineering**：harness 管单次任务的运行时（agent loop、tool、verifier），loop 管一类任务的持续运行机制（自动触发、状态记忆、跨次协调）。Loop 是 harness 的「**编排层**」。 Loop Engineering vs **AutoML/AutoResearch**：AutoML 是「自动调模型超参」（机器学习领域），Loop Engineering 是「自动调 Agent 工作流」（LLM 时代）。两者都用反馈循环，但 Loop 的反馈对象是「任务执行结果」而非「模型参数」。

## 深度分析

### 1. Loop Engineering 是 Prompt Engineering 的范式跃迁

Prompt Engineering 的本质是「用自然语言描述指令」，每一次交互都是独立的事件——无法积累状态、无法跨次记忆、无法判断「什么时候停」。Loop Engineering 把控制逻辑从语言层抽离出来，写进代码层面：触发条件、验证门禁、停止条件、回滚机制全部可版本化、可审计、可复用。这意味着 AI 工程师的角色从「写提示词的人」演化为「设计控制系统架构的人」——与 [agentic engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md) 的整体升级路径完全一致。

### 2. 人 → Agent 循环的反转：控制流从外到内

传统开发流程中，人站在循环外控制 Agent：人出题 → Agent 答题 → 人判断 → 人修正。Loop Engineering 把控制流翻转：人设计循环机制并设定目标后，循环本身驱动 Agent 持续工作。这个反转的关键在于**状态记忆**（plan.md、issue 日志）——没有它，下一轮循环就无法「接上前一轮」，Loop 就退化为「每轮独立运行」的无记忆重复。[Agent 自我改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md) 中的「度量驱动迭代」在这里得到了直接印证：没有基线数据，loop 不知道自己是进还是退。

### 3. 本质是控制论：反馈回路比循环本身更重要

Loop Engineering 的核心不是「让 Agent 反复运行」，而是**「让 Agent 的每次运行都有反馈」**。控制论视角下：verifier 是传感器（感知输出质量），停止条件是比较器（判断是否达标），预算 cap 是 fuse（防止成本失控），回滚机制是安全阀（恢复上一好状态）。这与 [Verifier-driven development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) 完全对齐——verifier 不只是「检查工具」，而是整个控制系统的信号源。如果 verifier 本身有偏差，整个 loop 会在错误方向上自我强化。

### 4. Loop 与 Harness 是层次关系，不是竞争关系

Harness Engineering 管「单次任务怎么跑」（agent loop、tool、context、verifier 的运行时编排），Loop Engineering 管「一类任务怎么持续跑」（跨次协调、自动触发、状态记忆）。两者是垂直层次：Loop 是 Harness 的「编排层」。这解释了为什么 Hermes Agent 的 cronjob + skill 系统是 Loop Engineering 的一种实现——它把 loop 控制器放在 Agent 外部（cron 调度），而非 Agent 内部（sub-agent 自循环）。

### 5. 经济可行性取决于验证成本，而非模型成本

Peter Steinberger 提出的成本结构揭示了一个反直觉事实：Loop Engineering 的经济瓶颈不是「模型贵」，而是「verifier 成本高」——因为 loop 的每一次迭代都需要独立验证。当 [AI R&D 瓶颈迁移](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-r-and-d-bottleneck-shift.md) 框架说「当 verifier 的成本下降时，loop 才能规模化」，正是这个意思：DeepSeek / Kimi / MiniMax 等低成本模型解决了「执行成本」，但 verifier 的设计质量和调用频率才是真正的规模化瓶颈。

## 实践启示

**判断标准：任务的「重复频率 × 失败成本」乘积超过阈值才值得 loop 化。** 单纯重复性高但失败成本低的任务（如每天定时清理日志）适合 cron，不适合 loop；只有重复性高且失败成本高、或需要可审计性的任务（CI 失败修复、依赖升级、跨服务迁移）才值得投入 loop 工程化成本。

**优先设计 verifier，再设计 loop。** 许多团队先搭 loop 框架再补 verifier，这是本末倒置。verifier 是控制系统的信号源——如果信号本身不可靠，整个反馈回路都会失效。verifier 必须有独立 ground truth（测试、类型检查、结构化输出规则），不能让 Agent 自审。

**每个 loop 必须有三维预算上限：token 数量、时间长度、累计成本。** 没有 budget cap 的 loop 等同于没有熔断器的电路——一次大规模任务失败就可能耗尽整月预算。务实的做法是「先用最小 loop 验证价值，再逐步扩大规模」。

**在 loop 设计阶段就定义人工介入点，而不是在运行时临时决定。** 不可逆操作（删除资源、修改生产配置、回滚数据库）必须有人工 gate；可逆操作（写代码、生成文档、运行测试）可以让 loop 自主执行。[Verifier-driven development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) 强调的「每个 AI 产出必须有 verifier」，在 loop 场景下进一步延伸为「每个 AI 决策都必须有决策边界」。

**从单 Agent loop 起步验证假设，再扩展到 Fleet 编排。** 初期投入一个明确目标（修复 CI 失败直到全绿），跑通完整闭环（触发→执行→验证→停止），拿到 token 消耗和成功率数据后，再评估是否需要 Fleet 编排复杂任务。过早引入多 Agent 编排会增加状态协调成本，掩盖核心问题。

**（第 4 来源补强）在搭循环之前先问一句：我有没有一个真能信的验证器？** Samuel McDonnell + 深思圈的反转洞察——在代码、编译、测试、lint 等有客观 ground truth 的领域，"设计验证者"是金科玉律；但在写作、策略、设计、品味等"验证者就是人类判断"的领域，搭循环往往只是把"自己看一眼"换了名字。**搭 loop 的前置条件不是"任务重复"，而是"验证器可独立 ground truth"。** 没有这个前置条件，自动化的不是产出，是更快的错。

**（第 4 来源补强）内循环配齐后，外循环才是真正的价值洼地。** Samuel 指出"大量价值现在正摊在（外循环）桌上没人捡"——把对的教训、用对的颗粒度、写到对的地方，比听起来难得多。但同时存在**递归验证陷阱**：判断哪条教训是对的本身就是一次验证，**一条错的教训被持久化会毒化后续所有运行**。外循环设计的核心不是"持久化"，是"持久化的质量"——教训文档需要双向校验（写入前的 ground truth 校验 + 写入后的运行时验证）。

**（第 4 来源补强）"绿色 ≠ 正确"——把测试通过率视为必要条件，不是充分条件。** Bun 75 万行移植 99.8% 通过 + Anthropic 自承认"还没上生产"是这个原则最权威的当代证据。**每个团队应该有意识地保留"测试套件之外"的真实验证渠道**：canary 流量、人工 review、用户反馈、A/B 实验——这些是测试套件"封顶产出质量"之外，**唯一能突破封顶**的渠道。

### 第 5 来源补强：5 决策框架 + 3 重陷阱（AutoResearch × Claude Code 对照）

第 5 来源（技术公众号"架构师带你玩转 AI"）以 Karpathy 的 AutoResearch 和 Claude Code 为双案例，提炼出 Loop 设计的 **5 个核心决策** 和 **3 重系统性陷阱**。

**AutoResearch vs Claude Code 对比表**（量化了 Loop + Harness 的层次关系）：

| 维度 | AutoResearch | Claude Code |
|------|-------------|-------------|
| 循环逻辑占比 | 极小（3 文件结构） | ~1.6%（queryLoop()） |
| 基础设施 | git commit/revert + 固定时间窗 | 权限系统 + 上下文压缩 + 子 Agent + 沙箱 + 持久化 |
| 终止条件 | 1-2 个 | 5 个 |
| 权限模型 | 无（全自动） | 7 种渐进模式 |
| 上下文管理 | 无（每轮独立） | 5 层渐进压缩管线 |

这个表印证了 [VILA-Lab 1.6% vs 98.4%](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-engineering-truth-1.6-98.4.md) 的核心发现：**循环决策逻辑应该占代码总量的 < 10%，复杂度放在循环之外的基础设施里**。

**5 个核心决策**（设计任何 Loop 前必须回答的问题）：

1. **终止条件——何时停止？** 四种类型：目标达成（val_bpb 不再改进）、资源耗尽（5 分钟窗口）、质量劣化（连续 N 次无改进）、主动中断（abort controller）。关键原则：**如果你说不清楚终止条件是什么，那就不要开始这个循环。**
2. **检查点——何时需要人工审批？** AutoResearch 不需要（ratchet 保底），Claude Code 分层（deny-first + 7 种权限模式）。踩坑数据：用户对权限弹窗的批准率高达 93%——**不要把安全性押宝在"用户会仔细审查"上**。
3. **回退策略——出错怎么办？** Ratchet（只前进，AutoResearch）、Rollback（回滚）、Retry（重试）、Branch（分支并行）。选择依据：目标函数是否明确且单调。
4. **循环粒度——一步做多少工作？** AutoResearch 选粗粒度（完整实验是原子操作），Claude Code 选细粒度（单工具调用）。选择依据：任务可分解性高 → 细粒度；任务已稳定 → 粗粒度。
5. **子任务委派——何时派发子 Agent？** 条件：耗时 > 5 分钟、需要独立上下文、多子任务可并行。代价：Agent Teams 模式消耗约 7 倍标准会话 token。原则：**只在"并行收益 > 协调成本"时才拆分。**

**场景决策对照表**：

| 场景 | 终止条件 | 检查点 | 回退策略 | 粒度 | 子 Agent |
|------|---------|--------|---------|------|---------|
| ML 实验优化 | 时间耗尽/无改进 | 无 | Ratchet | 完整实验 | 否 |
| 代码生成 | 测试全部通过 | 高风险操作前 | Branch | 多步 plan | 大重构时 |
| 数据处理 | 质量指标达标 | 每 10 个产出抽查 | Retry | 单步执行 | 否 |
| 研究综述 | 信息饱和 | 方向选择时 | Rollback | 搜索-阅读循环 | 多主题并行时 |

**3 重陷阱**（循环放大效率，也放大风险）：

1. **验证困境（Verification Gap）**：循环产出速度远超人类审查带宽。MSR 研究数据：**56.1% 的 AI agent commit 降低了代码可维护性**——超过一半的"改进"实际上在堆积技术债。对策：分层验证（自动门控 → 质量阈值监控 → 人工 10% 抽查）。
2. **人类不懂 Agent 产物（Comprehension Debt）**：Shen & Tamkin（2026）研究：AI 辅助条件下，开发者代码理解力测试得分**低 17%**。He et al.（2025）对 807 个仓库的因果分析：采用 AI 编码工具后代码复杂度显著上升，**初始速度提升在 3 个月后消散至基线**。短期效率提升被长期维护成本吃掉。对策：强制理解环节（AI 必须解释为什么这样改）。
3. **放弃自主思考（Cognitive Surrender）**：Anthropic 内部对 132 名工程师的调查揭示"**监督悖论**"——过度依赖 AI 可能萎缩你监督 AI 所需的技能。对策：每周至少手动完成一次核心任务，定期盲测对比。

**Loop + Harness 一体两面**（ETCLOVG 视角）：Loop 只影响 C（Context）和 L（Lifecycle）两层，而 Harness 覆盖全部七层（E/T/C/L/O/V/G）。结论：**没有 harness 的 loop 就像没有刹车的跑车——跑得越快，越危险。**

## 时间线与生态

- **2024 Q4-2025 Q1**：Claude Code 发布 `/loop` 命令（早期 loop 形态）
- **2026 Q1**：Codex 发布 `/goal` 命令（Fleet loop 早期）
- **2026 Q2**：Boris Cherny + Peter Steinberger 公开力挺 Loop Engineering 范式
- **2026 Q2**：若飞《Loop Engineering 详解》系统化论述（控制层 / 闭环 / 预算 / 验证 / 状态 / 人在场 / 试点 / 收束 8 步框架）
- **2026-06**：Samuel McDonnell 发布《My Thoughts on Loop Engineering》，指出"生成器 vs 验证器"二元论与"绿色 ≠ 正确"原则，附 Bun 75 万行 Rust 移植 99.8% 通过 + Anthropic 自承认"还没上生产"案例；深思圈（深思SenseAI）翻译并补充"在搭循环之前先问验证器"反转洞察与"外循环教训持久化的递归验证问题"

预期 2026 下半年：Loop Engineering 会成为继 Prompt Engineering 之后的「必备技能」——招聘 JD 会从「prompt engineer」转向「loop engineer」或「agent workflow designer」。这个转变和 [agentic engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md) 的整体趋势一致：从「写 prompt」到「设计持续运行的智能系统」。

## 与库内相关实体的交叉

- [Claude Code Dynamic Workflows Multi Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-multi-agent-orchestration.md)：Bun→Rust 75 万行移植使用的 Claude Code Dynamic Workflows（10 大实战场景 + Thariq 6 模式 + 3 类失败模式）
- [Verifier Driven Development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md)：Verifier-driven Development（"每个 AI 产出必须有 verifier"，与本文"verifier 封顶产出质量"互相印证）
- [Ai R And D Bottleneck Shift](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-r-and-d-bottleneck-shift.md)：AI R&D 瓶颈迁移（"当 verifier 的成本下降时，loop 才能规模化"，与本文"经济可行性取决于验证成本"同源）
- [Agent Self Improvement Loops](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)：Agent 自我改进循环（与本文"外循环 = 教训持久化"深度交叉）
- [Three Tools Comet Openspec Superpowers Ai Coding Shuge 2026 06 17](https://github.com/QianJinGuo/wiki/blob/main/entities/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md)：同日入库的 Comet 工程取舍深度文，含完整的 harness 工程取舍 + 9 平台 PreToolUse Hook 嵌套 Skill 触发规范

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/loop-engineering.md)

---

