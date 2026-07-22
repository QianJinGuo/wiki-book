---
title: "Loop Engineering：5 类循环 + 6 个生产硬边界 + 从 Loop 到 Graph"
source_url: "https://mp.weixin.qq.com/s/RF2DVQCl-lSf-huPZRY57w"
ingested: 2026-06-26
sha256: ""
type: raw
---

# Loop Engineering：5 类循环 + 6 个生产硬边界 + 从 Loop 到 Graph

过去 1-2 个星期，Loop Engineering 的讨论明显升温。看起来是一个新词在扩散，实际指向的是同一个老问题：Agent 做完一步之后，系统到底怎样决定下一步。

有人从 coding agent 的日常使用讲，有人从 Harness 和 worktree 讲，也有人从执行图、自我改进和长期记忆讲。入口不一样，问题是一致的：反馈能不能稳定地进入下一轮动作。

## Loop 在 Agent 工程链路中的位置

Prompt 决定任务怎么开始，Context 决定 Agent 看见什么，Harness 决定 Agent 怎么运行，Environment 决定 Agent 面对什么反馈，Loop 决定这些反馈怎样进入下一步。

Loop 更像一个可接手的小系统：把目标、动作、反馈、验证、状态和停止条件组织在一起。

## 最小 Loop：Think、Act、Observe

最小的 Agent Loop：Think（根据目标和上下文判断下一步）→ Act（调用工具或执行动作）→ Observe（读取动作返回的结果）→ Verify（判断结果是否接近目标）→ Repeat（继续、停止或升级给人）。

早期 ReAct（Reasoning + Acting）就是这个思路。模型不是一次性给答案，而是一边推理，一边行动。行动之后拿到新观察，再继续推理。

今天大家重新讨论 Loop Engineering，是因为任务变长了。过去一轮对话就能解决的问题，现在任务变成几十分钟、几个小时，甚至跨天运行。Agent 要读仓库、跑命令、开 PR、看 CI、处理 review、记录状态、下一轮接着做。

## 为什么现在突然热

Steipete：与其一轮轮提示 coding agent，不如设计能够提示 agent 的 loop。

Boris Cherny：他不再主要 prompt Claude，而是写 loop，让 loop 去提示 Claude 并决定下一步。

Addy Osmani：automation、worktree、skills、plugins/connectors、sub-agents，再加上 memory/state。

背后的变化：人不再每一步都亲自敲下一条 prompt，而是把"下一步怎么产生"写进系统。

过去：人 → prompt → Agent → 输出 → 人再 prompt
现在：触发器 → Goal → Agent → 工具 → 反馈 → 验证器 → 状态 → 下一轮

## 三层判断：什么时候用 Loop

| 层 | 适用场景 |
|---|---|
| 单步可解决 | 用 prompt 就好 |
| 固定步骤可解决 | 用普通 workflow 更便宜 |
| 下一步要根据上一轮反馈决定 | 才需要 Loop |

一个任务适不适合 Loop，看三个条件：重复出现、每轮结果可检查、失败后能恢复或交还给人。缺任何一个，先用更简单的办法。

## 五类 Loop：从 ReAct 到 Self-Harness

### 1. ReAct Loop：边做边看

基础款。模型每一步都根据观察结果决定下一步。优点是灵活，适合未知路径。缺点：上下文越来越长，步骤依赖不清楚，失败恢复容易变成原地重试。

### 2. Plan-and-Execute Loop：先排路线，再分步执行

先生成计划，再按计划执行。比 ReAct 更可控，因为步骤被提前拆出来。代价：如果早期计划错了，后面会沿着错误路线继续走。适合相对明确的任务。

### 3. Reflection / Evaluation Loop：做完以后有人挑毛病

执行后加一层评估。评估者可以是测试、规则、截图比对、类型检查，也可以是另一个 reviewer agent。

普通团队更适合先落地的，往往是这一类。很多 Agent 输出真正麻烦的地方，不在生成，而在生成以后没人可靠地验。把执行者和评估者拆开，质量会稳很多。

### 4. Goal / Long-running Loop：目标持续存在

Codex 的 Goal 文档里有一个关键点：Goal 有完成条件、验证方式和约束，不是无边界后台自治。

长任务最怕两件事：做着做着忘了最初目标；遇到阻塞就把计划当结果交回来。Goal 类 Loop 要解决的，就是让 Agent 能跨多轮、多次上下文压缩、多次工具调用，仍然围绕同一个完成条件推进。

### 5. Optimization / Self-Harness Loop：从失败里改系统

系统开始允许 Agent 根据失败证据提出 Harness 修改，但修改能不能晋升，要靠独立评估和回归测试。有复利的，是让同类任务以后少犯同一个错。

## 生产级 Loop 的六个硬边界

### 1. 验证

Loop 不能只靠模型说"我完成了"。要有外部证据：测试通过、lint 通过、类型检查通过、截图符合预期、链接检查通过、评审意见被处理、产物写到约定目录。

验证越清楚，Loop 越容易停止。验证越模糊，Loop 越容易变成"看起来很努力"。

Martin Fowler：要同时设计 feedforward 和 feedback。规则只负责行动前的约束，传感器才负责把行动后的事实带回来。

### 2. 停止

停止条件至少三类：目标达成、预算耗尽、连续无进展。

预算不只是钱，至少包括：token 预算、时间预算、工具调用预算、可接受 diff 大小、人工 review 预算。

### 3. 状态

状态不能只活在上下文里。一个能长期运行的 Loop，要把状态写到系统里：当前目标、已尝试路径、已失败方案、关键证据、当前阻塞、下一步计划、人工决策。

Mem0：token-rich loop 会把大量历史都塞进上下文，容易贵、慢、溢出；token-poor loop 成本低，但需要更好的记忆和摘要层。

### 4. 恢复

普通 Agent Loop 的恢复经常是无边界的。失败了就再试，再失败就换个说法再试。但系统不知道哪些路径已经失败，也不知道什么时候该升级。

恢复协议：同一错误最多重试几次、同一命令是否允许原参数重跑、工具失败后是否进入替代路径、产物丢失后如何恢复、超过阈值时交还给谁。

### 5. 隔离

只要 Loop 会写文件、跑命令、改配置，隔离就不是可选项。多个 Agent 或多个循环同时跑时，最先失控的往往不是模型，而是工作区。

隔离至少回答四个问题：它在哪个分支或 worktree 做事、它能访问哪些目录和凭据、它产生的副作用在哪里、它失败后怎么清理。

### 6. 观测

生产级 Loop 要能回答：本轮为什么启动、调用了哪些工具、工具参数是什么、返回结果是什么、Agent 怎样解释这个结果、哪个检查让它继续或停止、当前使用的是哪一版规则/Skill/Harness。

Loop 跑完以后，系统不能只留下一个"成功"或"失败"。它要留下人能复盘的证据链。

## Loop 和 Harness 的边界

Harness 规定 Agent 怎么跑。Loop 规定反馈怎么进入下一步。Environment 规定反馈来自什么世界。

Loop 更像 Harness 的运行节奏。没有 Harness，Loop 只是模型在聊天框里反复自说自话。没有 Loop，Harness 只是一次性工作台。

## 从 Loop 到 Graph

From Agent Loops to Structured Graphs 把普通 Agent Loop 看成一种"单 ready unit 调度器"：任意时刻只有一个可执行单元，下一步做什么，主要靠 LLM 在上下文里判断。

问题：依赖关系不可见、恢复策略不可控、历史不断变化，调试困难。

Structured Graph Harness 把控制流从隐含上下文里拿出来，放到显式 DAG 里。

复杂 Loop 到最后，可能不会继续长成更长的聊天记录，而会长成更明确的执行图、状态机和调度协议。Graph、state machine、workflow、DAG 这些老东西，可能会重新回来。

## Agentic Harness Engineering 的三个可观测性

| 可观测性 | 工程含义 | 没有它会怎样 |
|----------|----------|--------------|
| Component observability | 每个可编辑 Harness 组件都有文件级表示，可以修改、回滚、对比 | 修改边界不清，最后只会不断加 prompt |
| Experience observability | 原始轨迹被压成分层证据，能追到失败根因 | 日志太长，真正有用的信号被淹没 |
| Decision observability | 每次修改都带预测，下一轮用结果验证 | 改动看起来合理，但不知道是否真的有效 |

## 开源项目该看什么

| 项目 | 更值得看的点 | 对 Loop 的启发 |
|------|-------------|----------------|
| Codex CLI / Codex Goals | 本地 coding agent、Goal、线程内持久目标、证据检查 | 目标要变成可验证的完成合同 |
| OpenHands / Agent Canvas | agent server、automation server、Docker/VM/云端 backend | Loop 进入团队后，需要控制台、后端和运行隔离 |
| PydanticAI | 类型安全、依赖注入、eval、OTel tracing、durable execution、human approval | Agent framework 不只是包模型，还是把工具、输出和状态变成可验证对象 |
| OpenAI Agents SDK | agents、handoffs、guardrails、sessions、tracing、sandbox agents | 多 Agent 工作流要先把交接、护栏、会话和沙箱边界写清楚 |

## 第一条 Loop 怎么落地

团队第一次试 Loop，入口最好小一点：文档链接检查、CI 失败分流、flaky test 归类、依赖升级预检查、issue 自动补充复现信息、PR review comment 小范围修复、线上错误日报归类。

共同点：反馈明确，风险可控，动作范围窄，容易停止。

### Loop 合同模板

名称、触发、目标、输入、范围、工具、验证、停止、升级、状态、清理——这份合同的价值不在多一个文档，而在让边界提前暴露出来。

### CI 分流 Loop 示例

| 分类 | 证据 | 后续动作 |
|------|------|----------|
| 环境问题 | runner 异常、依赖下载失败、网络超时 | 只开运维/平台 issue |
| flaky test | 近几天同测例间歇失败 | 标记 flaky，附历史失败链接 |
| 最近提交引入 | 失败首次出现在某个 commit 后 | 开隔离 worktree 尝试复现 |
| 旧问题复现 | 历史 issue 或日志已有同类失败 | 关联旧 issue，不重复修 |
| 无法判断 | 证据不足或日志矛盾 | 交还给人 |

## 参考资料

- Addy Osmani, Loop Engineering
- Firecrawl, Loop Engineering: Should You Stop Prompting Agents and Start Designing Loops
- Oracle, What Is the AI Agent Loop?
- OpenAI, Harness engineering: leveraging Codex in an agent-first world
- Martin Fowler, Harness engineering for coding agent users
- DataScienceDojo, Agentic Loops: From ReAct to Loop Engineering
- Mem0, Loop Engineering for AI Agents: Memory-First Design
- Hu Wei, From Agent Loops to Structured Graphs
- Jiahang Lin et al., Agentic Harness Engineering
