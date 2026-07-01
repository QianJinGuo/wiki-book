# Agent 的骨架:Agent Runtime 7 大职责 + 3 主流框架对比 (LangGraph / OpenAI Agents SDK / 自研)

## Ch04.093 Agent 的骨架:Agent Runtime 7 大职责 + 3 主流框架对比 (LangGraph / OpenAI Agents SDK / 自研)

> 📊 Level ⭐⭐ | 16.1KB | `entities/agent-runtime-7-responsibilities-secondcurve-2026.md`

# Agent 的骨架：Agent Runtime 7 大职责 + 3 主流框架对比

> [!quote] 一句话定义
> Runtime 是**驱动 Agent Loop 运转的执行框架**,负责把 LLM、工具、状态、权限和日志串成一个可运行的系统。**LLM 是引擎,Runtime 是底盘。没有底盘,引擎再好也上不了路。**

2026-06-05 21:50,公众号「工程师的第二曲线」(作者: 二曲线工程师)发布 Agent 工程系列第 4 篇《Agent 的骨架:一文讲透 Agent Runtime》。前 3 篇已发布(Agent Loop / Context Engineering / Tool Calling),后续 9 篇待发(Memory / Trace / HITL / Eval / Multi-Agent / Planning / RAG / Prompt Engineering / 安全 Guardrail)。本文定位**通用 Agent Runtime 概念入门视角**,以 7 大职责框架 + 3 主流框架对比 + 有/无 Runtime 对比,搭建 Agent Runtime 的完整知识图谱。

## 核心定位:Runtime 是 Agent 的"底盘"

**无 Runtime 的 Agent 困境**(真实痛点):

- 工具调用失败了,没人处理,Loop 直接崩
- 跑了十几轮还没结束,没有终止条件
- 出了问题想排查,没有任何日志
- 敏感操作被 LLM 随意调用,没有权限控制

> **代码能跑,但像一辆没有底盘的车——引擎有了,但传动、刹车、仪表盘全都缺。**

**对照代码**:

```python
# 无 Runtime
while True:
    action = llm.call(context)
    result = tool.run(action)
    context.append(result)
# 工具失败直接抛异常/没有日志/没有权限控制/不知道什么时候结束/无从排查
# 这是一个脚本,不是一个系统

# 有 Runtime
# 同样的 Loop,但每一步都有人兜底——
# 工具调用前校验权限,执行结果写入 Trace,
# 异常触发重试或终止,敏感操作等待人工确认
# 这才是一个可以交付、可以维护、可以信任的系统
```

## Runtime 7 大职责 + 1 复杂 Agent 扩展层

### 1. 工具管理 (ToolRegistry)

Runtime **统一注册和管理工具**,把当前可用工具的 schema 提供给模型。**模型只需要基于这些描述决定是否调用,不需要知道工具怎么实现的**。这是 LLM 与工具实现的**解耦层**。

### 2. 上下文组装 (Context Engineering 执行层)

每轮调用 LLM 之前,Runtime 把 **System Prompt + 执行历史 + 工具定义 + 当前状态** 拼成完整 Context。**这是 Context Engineering 的执行层**(第 2 篇主题的工程实现)。

### 3. 状态管理 (State)

**当前跑到第几轮、已收集哪些信息、任务进展** — Runtime 维护运行时状态。**LLM 每次调用都是无状态的,状态要靠外部系统保存**。这是 Memory 体系(第 5 篇)的运行时基础。

### 4. 终止判断 (Termination)

**4 类终止条件**:

| 终止条件 | 触发场景 |
|---------|---------|
| 达到最大轮数 | 防无限 loop |
| 模型返回最终答案 | 任务完成 |
| 不再请求工具调用 | 推理结束 |
| 工具连续失败 | 错误累积 |

> **没有明确的终止条件,Loop 就可能无限跑下去。**

### 5. 风险控制 (Guardrail)

Runtime 在 LLM 和工具执行之间做一层**拦截**:

- 哪些操作需要**人工审批**
- 哪些工具有**调用频率限制**
- 哪些参数需要**脱敏处理**

**防止 Agent 做出不该做的事** — 这是 HITL(第 7 篇)+ 安全 Guardrail(第 13 篇)在 Runtime 层的实现。

### 6. Trace (链路追踪)

每一轮的 LLM 输出、工具返回、状态变化 — Runtime 记录为**完整执行链路**。**没有 Trace,出了问题就是黑盒,什么都查不了**。这是第 6 篇《黑匣子:Trace 与可观测性》主题的执行层。

### 7. 可观测性 (Observability)

基于 Trace 数据,实时看到 Agent 的运行状态、历史行为、异常信号。**Trace 是记录,Observability 是在这些记录上建立的"眼睛"**。这两者**必须配套使用**:Trace 提供数据,Observability 提供分析。

### 8. (复杂 Agent 扩展) 路由 (Router)

> **简单 Agent 可以不单独设计 Router,由提示词和工具选择承担简单分发;复杂 Agent 有多个 workflow 时,才需要显式路由。**

Router 负责**判断用户意图、分发到对应 workflow**。这是第 9 篇《Multi-Agent》主题在 Runtime 层的体现。

## 3 主流框架对比

| 框架 | 结构 | 适用场景 | 特点 |
|------|------|---------|------|
| **LangGraph** | 图结构 workflow(节点=LLM/工具,边=状态转移) | 流程复杂、分支多 | 可视化 workflow |
| **OpenAI Agents SDK** | Runner 驱动 Loop + tools 统一注册 + handoff 机制 | 多 Agent 协作 | 接口简洁,上手快 |
| **自研 Runtime** | 按需裁剪每个模块 | 深度定制需求 | 可控性最强,代价是工程细节自处理 |

> **框架选哪个,取决于你的场景复杂度和对可控性的要求。但无论选哪个,背后解决的都是同一批问题。**

## Runtime 价值的核心洞察

> **LLM 可以被替换,但不是无成本的替换**:不同模型的工具调用格式、上下文窗口、推理风格和稳定性都会影响系统表现。**Runtime 的价值在于,把这些差异尽量封装起来,让 Agent 系统更稳、更安全、更好维护。**

Runtime 是**模型可替换性的工程保障** — 这与 [纳德拉「Token 资本」论](ch04/150-ai.md) 的"模型可替换性是 Token 资本型企业的主权测试"哲学同源 — 都是"系统层把模型差异封装"的工程范式。

## 与现有实体的交叉对比

**同主题(Agent Runtime)**:

- vs **[若飞 Fable 5 Runtime Contract 工程化拆解](ch04/503-agent.md)** — 若飞文是**Runtime Contract 框架**(Task Brief 9 字段 / 能力路由 8 维度 / 状态账本 5 类),**深度工程协议视角**;本文是**7 职责概念入门视角** + **3 主流框架对比**。两者**完全互补**: 若飞 = Runtime **如何被设计** (契约层);二曲线 = Runtime **包含什么职责** + **用什么框架实现** (职责 + 工具层)
- vs **[阿里云云原生安全护栏三域演进](ch04/150-ai.md)** — 那是从云资源到 AI 模型到模型间路由的**三域护栏**;本文的"风险控制"职责是 Guardrail 的**单点实现**视角

**Agent Loop / Context / Tool 系列**(本文 7 职责的前 3 块与这些 entity 强相关):

- vs **[阿里云 Agent 演化四阶段六维度](ch04/503-agent.md)** — 阿里云是**演化阶段视角**;本文是**职责解剖视角**。两者都讲 Runtime 但切入维度不同
- vs **[Harness Engineering Framework](ch05/061-harness-engineering.md)** — Harness 是 Runtime 的**外壳**;Runtime 是 Harness 的**内脏**。Runtime 7 职责 = Harness 的实现细节
- vs **[Agent Harness 架构设计与生产实践](ch04/503-agent.md)** — Production 视角更全;本文是入门视角

**框架生态**(本文 3 主流框架):

- vs **[Google Agent Executor Distributed Runtime](ch04/503-agent.md)** — Google 自家 Runtime 实现;与本文 LangGraph / OpenAI SDK 平行
- vs **[Anthropic Claude Managed Agents Platform](ch04/340-anthropic-claude-managed-agents-platform-launch.md)** — Anthropic Managed Agents 视角
- vs **[Amazon Bedrock AgentCore Runtime 深度分析](ch04/503-agent.md)** — AWS Bedrock AgentCore 视角;与本文 LangGraph / OpenAI SDK 平行
- vs **[AgentCore Harness](ch04/503-agent.md)** / **[AgentCore Managed Harness](ch04/209-agentcore-managed-harness.md)** — AWS 实现的 8 职责具体形态

**Runtime 7 职责 ↔ 二曲线系列 13 篇主题映射**(本文是系列 4/13,后续 9 篇已规划):

| 本文 Runtime 职责 | 对应系列后续篇 | 状态 |
|----------------|--------------|------|
| 工具管理 | 第 3 篇 Tool Calling | ✅ |
| 上下文组装 | 第 2 篇 Context Engineering | ✅ |
| 状态管理 | 第 5 篇 Memory 体系 | 即将 |
| 终止判断 | 第 7 篇 HITL | 即将 |
| 风险控制 | 第 13 篇 安全 Guardrail | 即将 |
| Trace | 第 6 篇 Trace 与可观测性 | 即将 |
| Router | 第 9 篇 Multi-Agent | 即将 |

## 深度分析

### 1. 七职责是通用"契约清单",不是某一框架的私有设计

7 大职责（工具管理 / 上下文组装 / 状态管理 / 终止判断 / 风险控制 / Trace / 可观测性）本质上是 **Agent Runtime 的概念性契约** — 无论用 LangGraph、OpenAI Agents SDK 还是自研 Runtime，都必须回答这 7 个问题。这一结论与 [若飞 Fable 5 Runtime Contract](ch04/503-agent.md) 的"工程契约"思路同源：二曲线给出**职责层面的概念契约**（"要做什么"），若飞给出**协议层面的工程契约**（"怎么做"）。两者结合构成完整的 Runtime 设计图谱。

### 2. 状态管理 + 终止判断 = 运行时"自控"机制,是 Second Curve 的核心

[阿里云 Agent 演化四阶段六维度](ch04/503-agent.md) 从演化视角揭示 Agent 向自主化演进的路径；本文则从 Runtime 职责视角拆解**自控的两个支点**：状态管理（记录"跑到哪里了"）+ 终止判断（决定"何时停下来"）。没有这两个支点，Agent Loop 只能在无边界状态下运行 — 这正是"第二曲线"设计中最容易被忽视、也最容易出生产事故的环节。

### 3. Router 是复杂度的分水岭:简单 Agent 用提示词路由,复杂 Agent 才需要显式 Router

本文将 Router 定性为"复杂 Agent 扩展层"而非第 8 个必备职责，这一判断具有重要的工程意义：**Router 的必要性是 Agent 复杂度阈值的结果，而不是功能丰富度的标志**。这与 [Agent Harness 架构设计与生产实践](ch04/503-agent.md) 的"按需引入复杂度"原则一致 — 过早引入 Router 会增加不必要的状态空间，早期 Agent 应该用提示词 + 工具选择承担简单分发。

### 4. Trace ↔ 可观测性 是同一数据流的两个齿轮,必须配套设计

本文清晰区分了 **Trace（记录）和 Observability（分析）**：Trace 提供原始执行链路数据，Observability 在这些数据之上构建监控与告警。[langgraph-state-machine-under-the-hood](ch04/186-langgraph.md) 等框架的实践也印证了这一点 — 没有 Trace，Observability 就是无源之水；没有 Observability，Trace 只是无人阅读的日志。两者是 Runtime 可观测性职责的不可分割两面。

### 5. Runtime 是模型可替换性的工程底座,与"Token 资本"哲学异曲同工

本文核心洞察 — **Runtime 把 LLM 差异封装在执行层，让业务不被任一模型锁定** — 与 [纳德拉「Token 资本」论](ch04/150-ai.md) 的"模型可替换性是主权测试"哲学在工程层面高度吻合。[Harness Engineering Framework](ch05/061-harness-engineering.md) 将 Runtime 定位为 Harness 的内脏，而 Runtime 的模型隔离能力正是 Harness 层实现"模型无关性"的底层机制。

## 实践启示(5 条 actionable)

- **从 7 职责自检 Runtime**: 任何 Agent 项目,从这 7 项 + 1 扩展层自检 Runtime 完整度 — 缺哪项就补哪项
- **优先用 LangGraph 做 workflow 复杂场景**: 流程分支多、状态机复杂 → LangGraph 图结构可视化
- **优先用 OpenAI Agents SDK 做多 Agent 协作**: handoff 机制内置,省自研
- **深度定制需求才自研 Runtime**: 工程成本 vs 灵活性 trade-off,小团队优先用框架
- **Runtime 是模型可替换性的工程保障**: 把 LLM 差异封装在 Runtime 层,业务不被任一模型锁定 — 印证 [纳德拉「Token 资本」论](ch04/150-ai.md) 的"可替换性是主权"哲学

## 局限性 / 需关注的边界

- **本文是入门视角**: 7 职责是"至少要有"清单,不是"全部要有"清单 — 真实生产 Runtime 远比 7 职责复杂
- **3 主流框架对比浅尝辄止**: LangGraph / OpenAI SDK / 自研的 trade-off 仅 1-2 句,深度对比需各框架官方文档
- **未涉及 prompt injection / 越权 / 隐私等高级 Guardrail**: 本文风险控制仅 1 段;深度安全参考 [阿里云安全护栏三域](ch04/150-ai.md)
- **本文发布于 2026-06-05,早于若飞 Runtime Contract 文(2026-06-14)**: 时间上若飞受本文"Runtime 是什么"基础铺垫,后提出"Runtime Contract"上层抽象 — 形成"概念 → 协议"演化的 9 天跨度
- **系列第 5-13 篇未发布**: 7 职责对应的 Memory / HITL / Guardrail / Trace 等深度篇未出,读者需补充

## 相关实体

- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-runtime-7-responsibilities-secondcurve-2026.md)
- [若飞 Fable 5 Runtime Contract](ch04/503-agent.md)
- [阿里云安全护栏三域](ch04/150-ai.md)
- [阿里云 Agent 演化四阶段](ch04/503-agent.md)
- [Harness Engineering Framework](ch05/061-harness-engineering.md)
- [Agent Harness 架构设计与生产实践](ch04/503-agent.md)
- [Google Agent Executor Runtime](ch04/503-agent.md)
- [Anthropic Claude Managed Agents](ch04/340-anthropic-claude-managed-agents-platform-launch.md)
- [Amazon Bedrock AgentCore Runtime](ch04/503-agent.md)
- [AgentCore Harness](ch04/503-agent.md)
- [纳德拉「Token 资本」论](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

