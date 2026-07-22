# PromptQueue + OpenGorilla 集成 — AI-Native 异步任务引擎与自进化认知层

## Ch01.225 PromptQueue + OpenGorilla 集成 — AI-Native 异步任务引擎与自进化认知层

> 📊 Level ⭐⭐ | 23.6KB | `entities/promptqueue-async-task-queue-opengorilla-integration.md`

# PromptQueue + OpenGorilla 集成 — AI-Native 异步任务引擎与自进化认知层

## 一句话

> **PromptQueue = "BullMQ meets AI"** — 把消息队列的可靠性带入 LLM 调用；**OpenGorilla** = 认知记忆层 — 让每一次任务执行都成为自进化数据

由 **jinguo** 独立设计开发，**2 天 38 commits 完成 7,760 行 TypeScript**，Monorepo 4 包架构（Hono API + Worker + Next.js 15 Dashboard + CLI），测试覆盖率 ~33%。OpenGorilla 集成让系统"越用越聪明"。

## 架构图
→ [C4 架构图](assets/c4/promptqueue-async-task-queue-opengorilla-integration-c4.html)

## 相关实体
- [Schemaflow Openai Cookbook Staged Agentic Workflow](../ch04/235-agentic.html)
- [Prompt Context Harness Three Evolutions](../ch05/018-harness.html)
- [From Prompt To Harness Claude Official](../ch05/018-harness.html)
- [Claude Code Large Codebase Harness Configuration](../ch03/076-claude-code.html)
- [Openai Skills Shell Compaction Agent Primitives](../ch05/025-openai-skills-shell-compaction-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/promptqueue-opengorilla-project-analysis-ljguo.md)

## 一、立项背景（Purpose）

### 1.1 解决的 3 个核心痛点

| 痛点 | 现状 | PromptQueue 解法 |
|---|---|---|
| **同步阻塞** | LLM API 单次 30–120s，并发即耗光 HTTP 连接 | 异步队列，Worker 并发模型 |
| **状态缺失** | 原生 API 无任务/重试/优先级概念 | 7 状态机 + 5 级优先级 + 3 种重试策略 |
| **多模型碎片** | Anthropic / OpenAI / Gemini 协议不同 | Provider Plugin 接口 + 一行配置热切换 |

> "**不是给 LLM API 套壳，而是把队列工程的成熟模式引入 LLM。**"

### 1.2 目标用户

| 角色 | 场景 |
|---|---|
| 后端开发者 | LLM 调用从同步改异步，解耦请求响应 |
| **AI Agent 构建者** | **多轮 tool loop + HITL** 的执行基础设施 |
| SRE / DevOps | 监控队列深度/延迟/成功率/成本 |
| 产品团队 | Dashboard 实时观测 AI 工作流 |

---

## 二、整体架构（4 层分离）

```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Hono API    │────▶│  SQLite  │────▶│  Worker  │
│ (SDK/HTTP│     │  (REST)      │     │  (Queue)  │     │  (Loop)  │
└──────────┘     └──────────────┘     │  Priority │     └─────┬────┘
      ▲           Webhook/SSE        │  Status  │     ┌──────▼──────┐
      │                              └──────────┘     │  Provider   │
      │                                               │  Adapter    │
      │                                               │ Anthropic   │
      │                                               │ OpenAI      │
      │                                               │ Gemini      │
      │                                               │ LiteLLM     │
      │                                               └─────────────┘
      └────────────────────────────────────────────────SSE/事件流
```

### 2.1 4 层职责

| 层 | 职责 | 可替换性 |
|---|---|---|
| **API 层** (Hono) | REST + 认证 + 限流 + SSE | → Fastify/Express |
| **存储层** (better-sqlite3) | 任务持久化 + 状态机 + 事件 | → PostgreSQL（接口已就位） |
| **Worker 层** (自研) | 并发 + 重试 + 超时 + 回调 | → BullMQ |
| **Provider 层** (Plugin) | LLM 适配 + Tool Loop + 定价 | **热插拔** |

### 2.2 Monorepo 4 包结构

```
packages/
├── core/          # 共享类型、Zod Schema、常量（零依赖）
├── server/        # Hono API + Worker + Provider + Tools + OG Client
├── dashboard/     # Next.js 15 dark-theme 仪表盘
└── cli/           # Commander CLI + serve 命令
```

**依赖方向严格单向**：`core ← server ← cli/dashboard`，无循环依赖

---

## 三、核心功能矩阵

### 3.1 任务生命周期（7 状态机）

```
pending → running → completed
                  → failed → [retry] → pending
                  → timed_out
                  → cancelled
                  → waiting_for_input → running
```

**关键设计**：`waiting_for_input` 状态下 **Worker 释放并发槽位**，用户响应后**重新获取槽位恢复执行**。不是阻塞等待，是真正的异步回调

### 3.2 Tool Loop — Worker-owned（**核心差异化**）

**PromptQueue = Worker 是 Tool 的治理者（Governor）**，与 LangChain 等框架的 Provider-owned 模式截然不同：

| 模式 | 框架 | Tool 治理权 | 可观测性 |
|---|---|---|---|
| **Provider-owned** | LangChain / CrewAI | Agent 框架内部 | **黑盒** |
| **Worker-owned** | **PromptQueue** | **Worker（治理者）** | **可审计/限流/超时/记录每次 tool call** |

**Tool Loop 实例**：
```
Agent: "I need to read src/index.ts"  →  tool_call: read_file
Worker: executes read_file tool        →  tool_result: <content>
Agent: "Now I'll summarize it"         →  text: "Summary: ..."
Worker: records complete, fires webhook
```

**4 类 Built-in Tools**：

| Tool | 功能 | 安全机制 |
|---|---|---|
| `execute_command` | Shell 命令 | **白名单/黑名单** + 超时 |
| `read_file` | 文件读取 | `resolve()` + allowed-paths 前缀匹配防路径穿越 |
| `write_file` | 文件写入 | 同上 + 大小限制 |
| `ask_user` | **HITL 提问** | Promise 阻塞 + PendingInputStore + 超时 3600s |

### 3.3 Human-in-the-Loop（**基础设施级**）

1. LLM 调 `ask_user` tool（如 "用哪个分支名？"）
2. **Worker 释放并发槽位** → 任务进入 `waiting_for_input`
3. Dashboard 显示输入 UI → 用户回复
4. `POST /tasks/:id/input` → Worker **重新获取槽位** → 继续执行
5. **SSE 实时推送** 全部 tool_call / tool_result / text 事件

> "**HITL 不是 feature，是 Agent 能跑生产环境的必要条件。**"

### 3.4 Provider 架构（Plugin 热插拔）

```
ProviderAdapter (接口契约)
  ├── AnthropicProvider       — REST API，单轮
  ├── AnthropicSDKProvider    — SDK 流式 + Tool Loop
  ├── OpenAIProvider          — OpenAI Chat Completions
  ├── ClaudeCodeProvider      — CLI-based（本地模型）
  └── MockProvider            — 测试/开发用
```

新增 Provider **只需实现接口 + 注册**，核心架构零改动

### 3.5 企业级运维能力（10 项）

| 能力 | 实现 |
|---|---|
| **优先级调度** | 5 级：Critical(1) → Best-Effort(5)，同优先级 FIFO |
| **指数退避重试** | 3 种策略：exponential / linear / fixed，**含 jitter** |
| **超时控制** | **Task 级 + Tool 级**，双重 |
| **Token 追踪** | 每 task 记录 input/output |
| **成本追踪** | 按模型定价表自动计算 USD |
| **SSE 推送** | 实时事件流，**8 种事件类型** |
| **Webhook 回调** | 任务完成自动 POST |
| **Rate Limiting** | API 级别 |
| **优雅关闭** | **SIGTERM → drain Worker → close HTTP → close DB** |
| **认证** | Bearer Token 中间件 |

---

## 四、OpenGorilla 集成（**AI-Native 知识层**）

> "**每一次任务执行都是一次学习，形成自进化的 AI Agent 基础设施。**"

### 4.1 4 大集成能力

| 能力 | 阶段 | 作用 |
|---|---|---|
| **Context Enrichment** | 执行前 | 自动注入相关历史经验和技能到 system prompt |
| **Experience Capture** | 执行后 | 自动记录结果，构建**经验库** |
| **Result Verification** | 执行后 | 校验对齐度 / 完整性 / 模糊度 |
| **Smart Routing** | 执行前 | 根据任务难度**自动推荐模型层级** |

### 4.2 自进化闭环

```
[任务进入] → Context Enrichment (注入相关经验)
         → Smart Routing (推荐模型)
         → Worker 调 LLM (Tool Loop)
         → Result Verification (校验)
         → Experience Capture (沉淀经验)
         → 下次任务: 更丰富的 context
```

> 传统 LLM 调用每次都是**冷启动**，PromptQueue + OG 组合让系统**越用越聪明**

---

## 五、5 大核心 Insight

### Insight 1: LLM 调用本质是队列问题

> 大多数开发者把 LLM 调用当 RPC，但**高延迟 / 不可靠 / 需要重试 / 需要优先级** → 更接近**消息队列场景**

### Insight 2: Tool 的治理权必须在 Worker

LangChain 在 Agent 框架内执行 Tool → 黑盒。PromptQueue 把治理权交还 Worker → 可审计/限流/超时/记录每次 tool call → **Agent 安全性和可审计性的关键决策**

### Insight 3: HITL 不是 feature 是基础设施

异步暂停/恢复 + 槽位管理 + Dashboard UI + 超时保护 → **Agent 能跑生产环境的必要条件**

### Insight 4: 经验即资产

> "**OpenGorilla 集成体现了'每一次任务执行都是一次学习'的理念。**"

### Insight 5: 简单架构最可维护

**SQLite + 单进程 + 零外部依赖** — 不需要 Redis / PostgreSQL / Docker Compose。**`pnpm serve` 一条命令启动全部**。简单 = 可靠 + 易部署 + 低维护

---

## 六、竞品差异化

| 维度 | 原生 LLM API | LangChain / CrewAI | **PromptQueue** |
|---|---|---|---|
| 异步化 | ❌ 自建 | 部分 | ✅ **原生** |
| 优先级调度 | ❌ | ❌ | ✅ **5 级** |
| Provider 热插拔 | ❌ | 中间层耦合 | ✅ **Plugin** |
| Tool Loop | ❌ | 框架内置但不透明 | ✅ **Worker-owned** |
| HITL | ❌ | ❌ | ✅ **原生** |
| 成本追踪 | ❌ | 有限 | ✅ **按模型定价自动算 USD** |
| SSE 实时推送 | ❌ | 框架层 | ✅ **原生 + 8 事件** |
| 可视化 Dashboard | ❌ | ❌ | ✅ **dark-theme** |
| 服务式部署 | ❌ | Python 生态 | ✅ **Node.js 单进程零依赖** |

---

## 七、量化价值

| 指标 | 提升 |
|---|---|
| **吞吐量** | 5–10x（异步化消除 HTTP 阻塞） |
| **运维成本** | -60%+（内置重试/超时/状态/Dashboard） |
| **模型切换成本** | 归零（统一 Provider 接口） |
| **Agent 开发周期** | -50%（Tool Loop + HITL 开箱即用） |

---

## 八、测试 & 工程纪律

### 8.1 测试策略

- **SQLite** → in-memory (`createDatabase()`)，避免文件系统依赖
- **API** → `app.request()`，避免真实 HTTP 服务器
- **Provider** → Mock 对象，避免真实 API 调用
- **集成测试** → 完整任务流 / 取消流 / 优先级排序 / **HITL 流程**

### 8.2 Git 纪律

- **38 个原子化 commit**
- **Conventional Commits**（feat / fix / docs）
- **Lore Decision Protocol**（记录约束 + 被拒绝方案 + 置信度 + 作用域风险）

---

## 九、展望（Roadmap）

| 阶段 | 时间 | 方向 |
|---|---|---|
| **短期** | 1–3 月 | PostgreSQL 后端 / BullMQ 集成 / 更多 Provider / 分布式 Worker / **WebSocket (SSE 升级)** |
| **中期** | 3–6 月 | **Workflow 编排（DAG 任务图）** / 多租户 RBAC / OpenTelemetry / npm SDK / Plugin Marketplace |
| **长期** | 6–12 月 | **AI Agent 运行平台** / 多模态支持 / **Self-healing 自适应重试** / 跨集群联邦调度 |

---

## 十、核心金句

- "**不是给 LLM API 套壳，而是把队列工程的成熟模式引入 LLM**"
- "**Worker 是 Tool 的治理者 (Governor)**"
- "**HITL 不是 feature，是 Agent 能跑生产环境的必要条件**"
- "**每一次任务执行都是一次学习**"
- "**传统 LLM 调用每次都是冷启动**"
- "**简单 = 可靠 + 易部署 + 低维护**"
- "**不是又一个 LLM API 封装库，不是又一个 Agent 框架，是面向 AI-Native 时代的异步任务基础设施**"
- "**PromptQueue 是 AI-Native 应用的异步执行引擎**"

---

## 与已有实体的关系

- **OpenGorilla 集成** ↔ `Hermes Agent Skill Crossover Optimization` — **同源自进化主题**：
  - **OG Experience Capture** = 任务级经验沉淀
  - **Hermes Skill 互优化** = Skill 级自进化
  - 共同点：**每 N 次执行 → 沉淀为下次调用的 context**
- **Tool Loop Worker-owned** ↔ `Is Grep All You Need Pwc Retrieval Harness Coupling` — 都是"harness 治理 tool call"思路
- **HITL 释放槽位** ↔ `Anthropic Claude Cowork Task Boundary 5 Signals 6 Stages` — Cowork "6 阶段" 包含审批门，PQ 把 HITL 做到基础设施
- **Provider Plugin 热插拔** ↔ `Microsoft Agent Framework Tools Overview Provider Matrix` — MAF 也主张多 Provider 抽象
- **优先级调度 + 重试** ↔ 经典 BullMQ 设计 — **PQ = BullMQ 思想 + LLM 适配**

## 概念对比（vs LangChain 生态）

| 维度 | LangChain / CrewAI | **PromptQueue** |
|---|---|---|
| **核心定位** | Agent 框架 | **异步任务基础设施** |
| **Tool 治理** | Provider-owned（黑盒） | **Worker-owned（可审计）** |
| **HITL** | 需外挂 | **基础设施级原生** |
| **状态** | 无 | **7 状态机** |
| **调度** | 同步/部分 | **5 级优先级 + 3 重试** |
| **运维面板** | 无 | **Next.js 15 Dashboard** |
| **部署** | Python 多进程 | **`pnpm serve` 单进程零依赖** |
| **知识层** | 无 | **OpenGorilla 4 能力集成** |

## 概念对比（OpenGorilla vs 通用 Self-Evolving Agent 论文）

| 维度 | Hermes Skill 互优化 | OpenGorilla (in PromptQueue) |
|---|---|---|
| **优化对象** | Skill Markdown | **任务执行经验 + Context** |
| **进化粒度** | 4 轮互优化 / 棘轮 | **每次任务执行后** 沉淀 |
| **评估机制** | 9 维 rubric 独立评分 | **Result Verification**（对齐/完整/模糊） |
| **失败归因** | 4 类分支（执行失误 vs 技能缺陷 vs 新发现 vs 优化机会） | **未细化**（可能改进方向） |
| **触发时机** | 显式 invoke Darwin/SkillEvolver | **任务完成自动触发 Experience Capture** |

## 用户/项目元信息

- **作者**: jinguo (个人项目)
- **开发周期**: 2026-06-01 至 2026-06-02（**2 天 38 commits**）
- **代码规模**: 7,760 行 TypeScript（含 2,554 行测试，**~33% 测试覆盖率**）
- **技术栈**: TypeScript + Hono + Next.js 15 + SQLite + Anthropic SDK + Turborepo pnpm monorepo
- **部署**: Node.js 单进程，零外部依赖，`pnpm serve` 启动

> "**PromptQueue 是 AI-Native 应用的异步执行引擎 — 把消息队列的可靠性带入 LLM 调用，让 AI Agent 能跑生产。**"

---

## 深度分析

### 1. 队列思维对 LLM 调用的范式重塑

PromptQueue 最深刻的洞察在于：**高延迟、不可靠、需要重试和优先级调度这些 LLM 调用的本质特性，使得它比 RPC 更接近消息队列场景** 。传统 RPC 思维下，开发者习惯同步等待一个响应，但 LLM 调用的 30–120s 延迟会直接击垮 HTTP 连接池。队列模型天然解决了这个问题——请求入队即可释放 HTTP 连接，Worker 从队列拉取任务并发处理。

这种范式转换的副产品是**可观测性的质变**：任务状态（pending/running/completed/failed）不再是一个黑盒，而是 SQLite 中可查询、可筛选的7状态机记录。配合 SSE 8种事件类型，开发者第一次对 LLM 调用拥有了完整的追踪能力。

### 2. Worker-owned Tool Loop 的架构意义

PromptQueue 将 Tool 治理权赋予 Worker 而非 Provider，这是一个**架构立场宣言** 。在 LangChain/CrewAI 等框架中，Tool 执行发生在 Agent 框架内部，对外部观察者而言是黑盒——无法限流、无法超时控制、无法审计每一次 tool call。而 PromptQueue 的 Worker 作为独立进程，能够：

- 在每一次 tool_call 执行前后注入日志和校验逻辑
- 对危险操作（execute_command）实施白名单/黑名单控制
- 对 tool_call 实施独立超时（与 Task 级超时形成双重保护）
- 记录完整执行轨迹供 Experience Capture 回溯

这意味着 PromptQueue 的 Tool Loop 不仅可观测，而且是**主动治理**的——Worker 是裁判而非记分员。

### 3. HITL 作为生产级 Agent 的必要条件

jinguo 在原文中明确指出："HITL 不是 feature，是 Agent 能跑生产环境的必要条件" 。这个判断值得深入拆解：生产环境中，任何涉及金额、法律、内容发布的 Agent 都必然面临合规边界——AI 不应该在没有人审核的情况下自动执行不可逆操作。

但更关键的是**异步暂停/恢复机制**本身的价值：传统框架的 HITL 往往是同步阻塞的（LLM 等待用户输入时整个线程挂起），这在高并发场景下是灾难性的。PromptQueue 的 `waiting_for_input` 状态让 Worker **释放并发槽位**——任务排队等待用户输入，但 Worker 线程可以处理其他任务。用户响应后，任务重新进入调度队列，等有可用槽位时再恢复执行。这才是真正适合生产环境的 HITL 基础设施。

### 4. OpenGorilla 自进化闭环的实践价值

OpenGorilla 的 Context Enrichment + Experience Capture + Result Verification + Smart Routing 构成了一个**完整的学习-适应循环** 。传统 LLM 调用是冷启动的——每一次任务都从相同的 system prompt 开始，不利用历史执行经验。而 PromptQueue + OG 的组合让系统呈现"越用越聪明"的特性：

- 第 N 次执行类似任务时，Context Enrichment 自动注入第 N-1 次的相关经验和技能
- Result Verification 在任务完成后校验对齐度/完整性/模糊度，不合格则触发经验重评
- Smart Routing 根据任务难度动态推荐模型，避免用 GPT-4 处理简单问题

这个闭环的商业价值在于：**AI 系统的边际成本随使用量递减**——初期需要较高模型成本解决的任务，在积累足够经验后可以降级到更便宜的模型处理。

### 5. SQLite 单进程架构的工程哲学

"不需要 Redis / PostgreSQL / Docker Compose，`pnpm serve` 一条命令启动全部" ——这个设计选择背后是清醒的工程哲学：**简单性是最可维护性**。在 PromptQueue 的场景下，SQLite 的局限并非瓶颈：

- SQLite 支持 10万+ 并发连接（读），而主流 LLM API 的 QPS 上限本身就远低于此
- 分布式 Worker 可以通过多进程 + 共享 SQLite（ WAL 模式）实现横向扩展
- 当 PostgreSQL 成为必要时，存储层抽象已经就位（Provider 接口已就位）

这是典型的"先简单后扩展"思维：用 SQLite 快速启动，积累线上数据后再按需升级存储层。

---

## 实践启示

### 1. 用队列思维重构 LLM 调用链路

如果你的应用目前是同步调用 LLM API（直接 `await openai.chat.completions.create(...)`），**这是需要立即重构的信号**：任何超过 10 QPS 的 LLM 调用场景都应该引入异步队列。你的应用层只需要关注"提交任务"和"接收结果"，中间的调度、重试、超时都由队列处理。在 PromptQueue 的架构中，这个收益是 5–10x 的吞吐量提升 。

### 2. 将 Tool 治理权从框架内部移到独立 Worker

如果你的 Agent 项目依赖 LangChain 或类似框架，且对 Tool 调用缺乏可见性，**考虑将 Tool 治理权外置**：让 Worker 进程成为 Tool 执行的唯一入口，框架只负责 prompt 组装和结果解析。这样你可以对每一次 tool_call 实施安全策略（命令白名单、路径限制、超时控制），而不必依赖框架的内置机制。PromptQueue 的 Worker-owned 模式提供了可以直接借鉴的架构模板。

### 3. 把 HITL 设计为基础设施而非可选功能

任何面向用户的 AI Agent 都应该在**第一版就包含 HITL 机制**，而不是事后打补丁。最小可行实现需要：异步暂停/恢复（不是同步阻塞）、用户输入 UI（Dashboard 或 Web 界面）、超时保护（防止用户不响应导致任务永久挂起）。PromptQueue 的 `waiting_for_input` 状态 + Dashboard HITL 输入 UI 是一个完整的参考实现 。

### 4. 搭建经验沉淀机制提升模型利用效率

**不要让每一次 LLM 调用都是冷启动**。即使没有完整的 OpenGorilla 集成，也可以用最小方式搭建经验沉淀：每次任务完成后，将 system prompt + 用户 query + 执行结果摘要存入向量数据库，下次类似任务时通过语义检索注入相关 context。这能显著提升模型在专业领域的表现，同时降低复杂任务的平均模型成本。

### 5. 优先简单架构，用数据驱动升级决策

**不要过度工程化存储层选型**：在没有实际并发压力数据之前，用 SQLite 单进程启动是正确选择。只有当队列深度开始成为瓶颈、SQLite 的写入 TPS 无法支撑业务量时，才有必要切换到 PostgreSQL + Redis 的更重方案。PromptQueue 的存储层抽象（接口已就位）让这个升级成本极低——**先跑通业务，再按需扩展**。

---

