# Multi-Agent 架构：Factory Mission 系统的方法论

## Ch04.587 Multi-Agent 架构：Factory Mission 系统的方法论

> 📊 Level ⭐⭐⭐ | 15.3KB | `entities/multi-agent-mission-factory-luke-aiengineer.md`

# Multi-Agent 架构：Factory Mission 系统的方法论

> 来源：AI Engineer 频道 YouTube 演讲整理（微信公众号"AI 寒武纪"）
> 演讲者：Luke Alvoeiro（Block → 开源 Goose 43.9k★ → Factory CTO）
> 产品：Factory Droid（15 亿美元估值，Series C）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/multi-agent-mission-factory-luke-aiengineer.md)

## 摘要

Luke Alvoeiro 在 AI Engineer 大会上系统阐述了 Factory Mission 系统的设计哲学——当 Agent 需要完成比单个 Agent 难一两个数量级的任务时，组织方式比单点智能更重要。本文整合其演讲的核心内容：五种 Multi-Agent 协作策略、Orchestrator/Worker/Validator 三角架构、Validation Contract 与结构化 Handoff、"串行优于并行"的反直觉结论、Droid Whispering 模型选择策略，以及声明式编排逻辑。

## 核心要点

- **核心判断**：今天软件工程的瓶颈不再是智能，而是人的注意力。一个工程师手头可能积压 50 个 feature，但每天真正能往前推的只有两三件——今天的模型已经聪明到足以搞定方案，真正缺的是监督它们落地所需的人力带宽。
- **五种 Multi-Agent 协作策略**：Delegation（委派）、Creator-Verifier（创建者+验证者）、Direct Communication（直接通信）、Negotiation（协商）、Broadcast（广播），Mission 采用了其中四种。
- **三角架构**：Orchestrator（规划）+ Workers（实现，每个 feature 一个 worker）+ Validators（scrutiny + user testing，对抗性设计）。
- **Validation Contract 核心概念**：在代码写下去之前就把正确性定义清楚；写在实现之后的测试抓不到 bug，只是在确认已经做出的决定。
- **串行优于并行**：软件工程类任务不适合纯并行；Mission 采用"feature 层面串行 + 只读操作定点内部并行"，纸面更慢但错误率大幅下降。
- **Droid Whispering**：给不同角色挑不同模型——Orchestrator 用慢模型推理，Worker 用快模型生成，Validator 用最精确模型；并刻意用不同厂商避免同向偏见。
- **声明式编排**：编排逻辑几乎全写在 prompt 和 skill 里，整套 feature 拆解约 700 行文本；改四句话就能大幅改变执行策略。
- **Mission 克隆 Slack 数字**：以前 5 人团队同时推 10 条工作流，现在推 30 条；代码库 50% 是测试代码，覆盖率 90%；真实耗时主要在 user testing validator 等待交互。

## 深度分析

### 1. 瓶颈转移：从"模型智能"到"治理带宽"

Luke 开篇抛出的判断是软件工程协作的关键转折：当模型智能本身已经足够，关键瓶颈转移到**人的注意力带宽**。 这意味着 Multi-Agent 系统的核心价值不是"更多 AI 并行"，而是"用更少的人类监督同时驱动更多工作流"。Factory 用 30 条工作流替代 5 人团队 10 条工作流的数字（人效 6 倍提升），其本质是把"5 人各推 2 条"的人力监督模式重构为"1 人监督 30 个 Agent Mission"的杠杆模式。

这一观察与 [Agent 记忆系统工程实践](ch03/045-agent.md) 中关于"过程资产积累"的方向一致——治理带宽的瓶颈不能只靠堆人来突破，必须靠结构化的 Handoff 机制和 Validation Contract 来降低单次审查的认知负担。

### 2. 五种协作策略的工程取舍

Luke 列出的五种 Multi-Agent 策略并非等价的选项，而是各有适用场景的工程取舍：

- **Delegation（委派）**：父 Agent 派生子 Agent 取返回值，这是最常见的 sub-agent + coding tool call 模式——本质是函数调用语义。
- **Creator-Verifier（创建者+验证者）**：核心收益是"新鲜上下文更容易挑出问题"——验证者不带着实现者的先入为主，得以保持对抗性。Factory Mission 的 Validator 双轨制（scrutiny + user testing）就是这种思想的延伸。
- **Direct Communication（直接通信）**：Agent 互发私信、无中央协调者——状态散落多条对话，Mission 明确放弃。
- **Negotiation（协商）**：围绕共享资源（同一 API、同一代码块）的多方博弈，正和交易场景适用。
- **Broadcast（广播）**：一对多的状态更新/共享约束下发，对长任务连贯性至关重要。

Factory Mission 选择 4/5 而放弃 Direct Communication 的决策揭示了一个工程原则：**协调 overhead 是分布式系统的主要税负**。Mission 通过 Orchestrator 中央化所有协调，把状态收敛到单一真相源，避免了 Direct Communication 难以做对的同步成本。

### 3. Validation Contract：把正确性锚定在实现之前

这是 Factory Mission 系统最值得借鉴的设计。Luke 指出："写在实现之后的测试抓不到 bug，它们只是在确认已经做出的决定。" 这句话点中了 LLM 编程的核心陷阱——Agent 既写实现又写测试时，测试会顺着实现反向捏造，变得没有对抗性。

**Validation Contract 的工程意义**：
- **时间锚点前置**：在 Orchestrator 阶段就把"正确性"写成可执行的断言清单，而不是等到 Worker 写完代码再补测试。
- **独立于实现的锚点**：这些断言描述"代码本该实现什么"而非"代码实际做了什么"，是判断 Worker 输出的客观标准。
- **可扩展断言库**：复杂项目可能有几百条断言，每个 feature 分配一条或多条必须满足的断言。

配合机制是**结构化 Handoff**——Worker 做完 feature 时填写详细文档：完成项 / 未完成项 / 跑过哪些命令及退出码 / 发现的问题 / SOP 遵守情况。**关键原则：错误在里程碑边界被捕获，纠错工作被明确界定，不依赖 Agent "记得"发生过什么，靠强制写下来。**

这一设计与 [Harness 状态边界与失败闭环](ch05/009-harness.md) 中强调的"边界即文档"的工程哲学一致——Agent 系统的可靠性不来自 Agent 自身的记忆，而来自跨边界时强制落盘的中间表示。

### 4. "串行优于并行"的反直觉结论

Luke 给出了违反直觉的工程结论：软件工程类任务**不适合纯并行**。 原因是 Agent 并行时会互相踩改动、重复做事、做出互相冲突的架构决定、协调 overhead 吃掉速度收益。

Mission 的解法是**精准混合**：
- **feature 层面串行**：同一时刻只有一个 Worker 或一个 Validator 在跑。
- **允许并行的只有两类**：feature 内部的只读操作（搜索代码库、查 API 文档）+ Validator 内部的只读操作（多个 code review 同时进行）。

**整体原则：串行执行 + 定点内部并行**。纸面更慢，但错误率大幅下降，长任务里正确性不断复利。

这与 [Claude Code Agent Teams 任务分解](ch03/075-claude-code.md) 中"任务分解策略决定 Agent 协作模式"的判断相互印证——并行不是越多越好，而是要在不引入冲突的边界内最大化吞吐。

### 5. Droid Whispering：用异构模型对抗同质偏见

Luke 的模型选择策略（"Droid Whispering"）遵循**角色 × 模型能力**的最优匹配：
- **Orchestrator**：慢速、审慎的推理 → 慢模型（深度优先）
- **Worker**：快速的代码流畅度和创造力 → 快模型（广度优先）
- **Validator**：精确的指令遵循 → 最精确的模型（确定性优先）

**更深一层**：刻意用**不同模型厂商**做验证，避免同一份训练数据带来的同向偏见。Luke 直接点出："你被某一家模型锁定，这个家族最弱的能力就是你系统的天花板。"

这与 [AgentOps on Bedrock](ch04/277-ai.md) 中关于"多模型编排降低单点故障"的设计哲学一致——异构性是鲁棒性的来源。

### 6. 声明式编排：用 Prompt 写逻辑而非代码

Mission 的编排逻辑几乎全写在 prompt 和 skill 里，避免硬编码状态机。整套 feature 拆解和失败处理约 **700 行文本**，改四句话就能大幅改变执行策略。

Worker 行为由 Orchestrator 每个 Mission 动态定义的 skill 驱动，确定性代码层非常薄，只做 bookkeeping（跑验证、交接阻塞时进度）。Luke 的总结极其精炼："**mission 负责提供纪律，模型负责提供智能。**"

这与 [Harness Engineering Core Patterns](ch03/075-claude-code.md) 中关于"声明式优先于命令式"的设计原则形成强对应——编排层应当尽量薄，复杂逻辑让模型在 prompt 中处理，这样模型升级能自动带动系统升级。

### 7. Mission 克隆 Slack 的实战数字揭示的真相

Luke 公开的 Mission 实战数字值得仔细解读：

- **60/60 分配**：60% 时间在 implementation，60% token 消耗也在 implementation——验证与实现几乎对等，不是简单的"主从关系"。
- **追加 feature**：几乎每个里程碑都要追加 follow-up feature 来修——说明 LLM 编程的"首次正确率"仍有限，必须在结构上预留迭代空间。
- **50% 测试代码**：代码库一半是测试，覆盖率 90%——这是 Mission 把"测试即文档"做到极致的体现。
- **成本结构**：绝大部分 wall clock time 不在生成 token，而在 user testing validator 等待交互——这暴露了 Agent 系统当前最大的延迟来源是**外部 I/O 等待**而非模型推理。
- **人力效率**：5 人 10 条 → 1 人 30 条，6 倍杠杆。
- **代码库反向演进**：mission 跑完比开工时更干净——过程资产（测试、skill 文件、结构性产物）全留下。

## 实践启示

### 1. Multi-Agent 系统的设计起点

不要从"并行多少 Agent"开始设计，而要从**任务边界定义**开始。Factory Mission 的教训是：

- **Orchestrator 必须先于 Worker**：没有清晰的"什么算做完"，Worker 再多也是浪费 token。
- **Validator 必须独立于 Worker**：让同一模型既做实现又做验证，丧失系统里最重要的对抗性红利。
- **Handoff 必须结构化**：最低成本、最容易落地的改造——至少包含完成项/未完成项/执行命令及退出码/发现的问题/SOP 遵守情况。

### 2. 串行优于并行的工程含义

不要被"10 个 Agent 同时跑 = 10 倍吞吐"的直觉误导。**真正的速度来自正确性复利**：

- 软件工程任务优先串行，只在只读操作和验证内部并行。
- 协调 overhead 是隐藏税，必须显式测量。
- "等一等"往往比"乱一起跑"更快到达终点。

### 3. Validation Contract 可迁移出 Coding 场景

这一思想**可以推广到所有需要"先定义对错"的任务**——做报告生成、市场研究、多日复杂流程自动化时，都可以先写几百条断言，把"怎样算做完"锁死在实现前面。

### 4. Droid Whispering 的成本工程意义

不同角色用不同模型本质上是**把成本花在刀刃上**：

- 慢推理只用在 Orchestrator 这种"决策频次低但决策质量高"的环节。
- 快生成只用在 Worker 这种"决策频次高但单次决策容错"的环节。
- 验证用最强模型，且刻意换厂商——把"偏见审计"做进架构层。

### 5. 声明式编排的迁移门槛

"用 prompt 写编排逻辑"对工程团队的能力要求与传统代码完全不同：

- 需要团队具备**将流程意图翻译为自然语言约束**的能力。
- 需要建立**版本化的 prompt / skill 库**而非简单的代码仓库。
- 需要**声明式优先于命令式**的纪律——能用 prompt 表达就别写状态机。

## 相关实体

- [Factory Missions Multi-Agent Shipping](ch03/045-agent.md)——同主题的姊妹篇
- [Claude Code Agent Teams 任务分解](ch03/075-claude-code.md)——任务分解策略的另一视角
- [Harness Engineering Core Patterns](ch03/075-claude-code.md)——声明式编排的工程哲学
- [OpenClaw 多 Agent 团队实践](ch04/044-openclaw-multi-agent-team-practice-v2.md)——多 Agent 落地的国内实践
- [Claude Managed Agents 企业自托管](ch03/045-agent.md)——Multi-Agent 的企业部署形态
- [Agent 记忆系统工程实践](ch03/045-agent.md)——过程资产积累的方向
- [Harness 状态边界与失败闭环](ch05/009-harness.md)——边界即文档的工程哲学
- [AgentOps on Bedrock](ch04/277-ai.md)——多模型编排降低单点故障

---

