# Claude Code vs Hermes — Session 工程师 vs Goal Runtime

## Ch01.319 Claude Code vs Hermes — Session 工程师 vs Goal Runtime

> 📊 Level ⭐⭐ | 16.0KB | `entities/claude-code-vs-hermes-session-vs-goal-lifecycle.md`

# Claude Code vs Hermes — Session 工程师 vs Goal Runtime

> **核心**: Claude Code 生命周期单元 = **session** / Hermes 生命周期单元 = **goal**. 不是能力对比, 是**两套完全不同的工程取舍**:
> - 前者把可靠性建立在**清晰边界**上
> - 后者把价值建立在**边界之后仍能继续演化**上
>
> **架构判断**: 正确问题不是 "Claude Code or Hermes", 而是 "你的问题的**生命周期单元**是什么?"

## 6 维对比表 (核心)

| 维度 | Claude Code | Hermes |
|------|------|------|
| **生命周期单元** | Session: 启动/工作/审核/结束 | Goal: 分配/持久/演化/达成/转向 |
| **状态模型** | 会话内上下文 + /compact + --continue/--resume | **SQLite + FTS5** 跨会话 + 摘要 + 技能 + 用户模型演化 |
| **触发方式** | 人发起, CLI/IDE/桌面/Routines/API/GitHub | IM/CLI/cron/子代理/长期目标持续触发 |
| **上下文跨度** | 当前 repo + 当前任务 | 跨会话/跨应用/跨时间 |
| **人机关系** | **Human-in-loop 的工程师** | **Goal-in-loop 的 Runtime** |
| **设计中心** | repo-centric (进入工程现场) | 单进程 gateway (活在工作现场) |

> **真正分叉**: 当一次交互结束后, 系统假设**世界也结束**了吗?
> - **Session 模型**: 上下文是临时工作内存, 系统不承担长期责任, 长期责任被转移到 repo 和人类流程
> - **Goal 模型**: 上下文是运行时状态, 决定下一次什么时候醒来/查什么/通知谁/历史判断带回当前行动

---

## Claude Code: 工程师, 不是员工

### 关键特性

- **设计中心**: repo-centric — 适合在已 checkout 代码库工作
- **入口**: Terminal CLI / VS Code extension / Cursor / JetBrains / desktop app / browser
- **安装**: `curl -fsSL https://claude.ai/install.sh | bash`
- **体验核心**: 不是"陪你聊天", 而是"**进入你的工程现场**"
- **Human-in-loop 是设计选择** (不是缺陷): 最后一公里责任留给工程师, review 权限不能彻底让出

### Routines: 触发方式扩展, 不改根本生命周期

**2026-04-14 进入 research preview**:
- scheduled cloud sessions / API triggers / GitHub event automation
- Anthropic-managed infrastructure
- **routines run even when your computer is off**

**Routine 仍然 = finite session**:
- 每天审 PR → 触发 → 读 repo → 检查 → 建议 → 结束
- 不会自然积累状态 / 不会自然记得 reviewer 偏好 / 不会自然记得 flaky test 历史
- 需靠 **CLAUDE.md / repo 文档 / --resume / --continue** 显式传递

> **核心比喻**: Claude Code 很像一个你可以**反复召唤的资深工程师**. 你给上下文, 它进入现场; 你不给, 它不会假装自己一直在公司工位上坐着.

### 强项场景 (希望系统有明确边界)
- 复杂多文件重构
- 测试生成
- PR review
- repo understanding
- 任何"可关停"的工程任务

> **金句**: 边界感是软件工程的一部分, 尤其在权限/合规/生产风险都存在的环境里. **不要把"会话结束"理解成短板** — 它是 Claude Code 把自己定位为工程师, 而不是员工的证据.

---

## Hermes: Runtime, 不是助手

### 关键架构

- **部署形态**: 单进程 gateway (不是 IDE 内 coding assistant)
- **入口**: Telegram / Discord / Slack / WhatsApp / Signal / CLI
- **部署位置**: 5 美元 VPS / GPU cluster / serverless
- **核心架构**: **single-agent persistent loop** — input → process → state evolution → next action
- **没有 swarm 叙事**, 也不是把十几个 agent 拼成编排层

> **Runtime 定义**: 不是"更会聊天的助手", 而是承载**状态/调度/环境连接/持续执行**的系统层.

### 关键组件 (源码视角)

| 组件 | 职责 |
|------|------|
| `run_agent.py` | 核心 conversation loop |
| `hermes_state.py` | SQLite session/state |
| `context_compressor.py` | 有损摘要 |
| `memory_manager.py` | 记忆管理 |

**SQLite + FTS5** 不是把聊天记录存起来当纪念册, 而是让 agent 能**跨会话检索/压缩/把过去重新带回当前行动**.

### /goal 命令 (哲学差异最显著功能)

> v2026.5.7 加入. 含义不是"记一条待办", 而是**把 agent 锁定到一个跨 turn 的目标**:
> **"the agent doesn't forget what you asked it to do"**

- 不是每次来都发一个 prompt
- 而是在 runtime 里**挂一个目标**, 让它围绕这个目标持续调整状态
- **作者实际用法**: 监控开源仓库 + 每周摘要 + security commit 立即 Telegram ping

### Runtime 能力栈

- **cron scheduler**: 自然语言 daily reports / nightly backups / weekly audits
- **子代理**: 并行 workstream spawn isolated subagents
- **70+ tools / 28 toolsets**
- **6 类终端后端**: local / Docker / SSH / Singularity / Modal / Daytona
- **多模型**: OpenRouter 200+ / OpenAI / Anthropic / 本地 endpoint

### Honcho dialectic user modeling

Persistent agent 如果只记住聊天历史**还不够**, 还要逐步理解**用户偏好/判断方式/风险边界**. 否则长期在线只会长期打扰你.

> 跨会话用户理解, 在短 session 里是**锦上添花**; **在 persistent runtime 里是生存条件**.

### 学习 loop (经验沉淀为 skill)

- FTS5 搜索过去对话 + LLM summarization 压回当前上下文
- 一次失败/修复/用户纠正, 变成后续执行的**真实约束**
- **经验沉淀**放进 runtime 的日常行为

### IM-native 是架构选择 (不是 UI 选择)

> 一个长期运行的 agent 需要出现在**真实事件发生**的地方: 群里 @, 服务器告警, GitHub webhook, 用户在路上用手机补一句约束.

IDE 是工程现场, 但不是人的全部工作现场. **Hermes 真正想解决的, 是"AI 如何持续待在环境里工作"**.

---

## 容易踩的坑: 错配思维

### 错配 1: 用 Claude Code 思维用 Hermes

- 把每次对话当成独立任务: 问 / 等 / 关
- 不设 /goal / 不维护长期状态 / 不用 cron / 不让 IM 与工具形成回路
- **结果**: 一个更贵、更复杂、偶尔还会主动想太多的 Claude Code

> **Hermes 正确打开方式**: 需要被分配"**长期责任**", 而不只是"即时问题". 告诉它**目标/边界/通知条件/检查频率/失败处理**. 最适合的不是"帮我改这个文件", 而是"接下来两周持续帮我维护这个自动化链路, 发现异常先定位, 不能修再叫我".

### 错配 2: 用 Hermes 思维用 Claude Code

- 期待 Claude Code 记得一周前上下文
- 期待它自然继承上次临时决策
- 期待它在没触发时主动推进
- **结果**: 新 session 重新读 repo, 误判"没记忆"

> Claude Code 从没承诺自己是**长期运行的状态机**. 你应该给它 **CLAUDE.md** 维护 repo 内工程约定; 延续用 --resume / --continue; 会话太长用 /compact; 定时触发用 **Routines**. **把它当成"在明确工作包里极强的工程师", 不是"默认常驻的运营同事"**.

### Operating Contract 模板 (选型前)

| 工具 | 管理维度 |
|------|------|
| **Claude Code** | 每类任务的输入 / 允许执行的命令 / 交付物 / review 方式 |
| **Hermes** | 长期目标 / 触发条件 / 升级路径 / 记忆边界 / 什么时候必须停下来问人 |

> 前者管理**一次协作的质量**, 后者管理**长期运行的风险**.

---

## "土问题" 选型决策 (可立即应用)

> **如果我三天不打开这个工具, 它应该继续工作吗?**
> 这个问题比模型榜单更快暴露真实需求.

- **答案 = 否** → Claude Code 这类 session-driven 工具往往更干净
- **答案 = 是** → 需要 Hermes 这种 persistent runtime, 或者至少要自己搭一层状态/调度/记忆/通知系统

**流水线组合也合理**: Hermes 负责**发现事件 + 维护目标**, Claude Code 负责**某次具体工程执行里把代码改干净**.

---

## Harness 系列 → Persistent Runtime 系列 (上下层关系)

### Harness 系列 (单 repo / 单 session) — 5 子系统

1. **Instructions** — prompt 怎么写
2. **State** — 上下文怎么压缩
3. **Verification** — 测试怎么跑
4. **Scope** — 任务边界
5. **Session Lifecycle** — 会话开始/结束/压缩

> 解决: "**一次执行如何不跑偏**"

### Persistent Runtime 系列 (跨 session / 跨 repo / 跨时间)

- agent 如何长期保持目标
- 如何在环境里接收事件
- 如何维护自己的状态
- 如何在不打扰人的情况下推进事情

> **不是替代关系**. Persistent Runtime 不是把 Harness 扔掉, 而是**把 Harness 放进每一次执行单元里**.

**Harness = 执行层的工程纪律, Persistent Runtime = 系统层的生命周期设计**:
- Claude Code 把 Harness 价值放大到**单次工程协作**
- Hermes 把这些纪律嵌进**更长的运行循环**

> **金句**: Harness 关心的是"**这一刀能不能切准**", Persistent Runtime 关心的是"**这台机器能不能连续切一周, 而且知道什么时候该停**". 前者偏工程方法, 后者偏系统架构. 混在一起讲, 会让人以为只要 prompt 写好就能长期自治; 分开讲, 才能看到长期自治还需要状态/调度/权限/记忆/通知/自我维护.

> "Claude Code vs Hermes" 这个标题其实有点**误导**, 但很有用. 它逼我们把两类系统放在一起看, 然后意识到: 它们**不是同一个抽象层上的竞争者**.

> 你不会问"**工程师和 runtime 谁更强**". 你会问: 这个问题需要**一个人**来完成一段明确工作, 还是需要**一个系统**持续承载一个目标?

---

## 结尾: 先问生命周期, 再问工具

> **正确问题**: 不是 "Claude Code or Hermes", 而是 "你的问题的**生命周期单元**是什么?"

- **Session** → Claude Code 很强. 复杂重构 / 测试生成 / PR review / 代码理解 / 清晰边界 Routines 自动化
- **Goal** → Hermes 才开始显示价值. 持续在线 / 状态维护 / 跨会话检索 / 调度任务 / IM + 工具连接

> **把 Claude Code 当工程师**, 你会用得很舒服. **把 Hermes 当 Runtime**, 你才不会浪费它.

**作者判断标准**:
- 强 review / 强确定性 / 强 repo 现场感 → **先交给 Claude Code**
- 跨天 / 跨系统 / 跨通知渠道持续推进 → **才交给 Hermes**
- 两个系统放同一条流水线**完全合理**

---

## 与其他对比实体的关系

| 实体 | 角度 | 互补性 |
|------|------|------|
| [Harness 7 Layers OpenClaw/Hermes/Claude Code](../ch05/068-harness-engineering.html) | 3 工具 × 7 层 harness 视角 | **互补** (本实体: 2 工具 × 6 维生命周期) |
| [Hermes 9 Module 架构](ch01/724-9.html) | Hermes 源码级 | 互补 (本实体: 跨工具对比) |
| [Claude Code Agentic Harness](../ch03/067-claude-code-agent.html) | CC 内部 harness 模式 | 互补 (本实体: CC vs Hermes 外部对比) |
| [Hermes Goal Runtime 架构](../ch04/361-hermes-agent-goal.html) | Goal-in-loop 实现 | **直接相关** (本实体 Goal 概念的实现) |

## 深度分析

### 核心观点：生命周期单元决定工具基因

Session 和 Goal 是两套完全不同的**生命周期抽象**，不是同一抽象层上的两种实现：

- **Session 模型**：世界在会话结束时假设为"静止"——上下文是临时工作内存，长期责任转移给 repo 和人类流程
- **Goal 模型**：世界在会话结束后继续——上下文是运行时状态，决定下一次何时醒来、查什么、通知谁

这一差异解释了为什么两个系统在人机关系、状态模型、触发方式上全部走向不同分支。

### 技术要点：Human-in-loop vs Goal-in-loop 是设计选择，不是能力缺陷

Claude Code 的 Human-in-loop 把最后一公里责任留给工程师，是**刻意设计的可靠性边界**；Hermes 的 Goal-in-loop 把长期目标挂载在 runtime 状态里，是**刻意设计的持续性**。两者在各自的设计语境里都是正确的——混淆两者才是"错配思维"的根源。

[Harness Engineering](../ch05/068-harness-engineering.html) 关心的是"这一刀能不能切准"；Persistent Runtime 关心的是"这台机器能不能连续切一周，而且知道什么时候该停"。前者偏工程方法，后者偏系统架构。

### 实践价值：流水线组合是最优解

**真正的最优解往往不是二选一，而是流水线组合**：

- Hermes 负责**发现事件 + 维护目标**（IM-native + cron + Goal 挂载）
- Claude Code 负责**某次具体工程执行里把代码改干净**（repo-centric + Human-in-loop review）

这条组合的合理性来自两个系统根本不在同一个抽象层——它们是**上下层关系**，不是竞争关系。

---

## 实践启示

1. **选型前先问"三天不打开，它应该继续工作吗"**——这个问题比模型榜单更快暴露真实需求。答案是"否"→ Session 工具；"是"→ Persistent Runtime

2. **不要把 Claude Code 当成常驻运营同事**——用它提供 CLAUDE.md 维护工程约定，用 /resume / --continue 延续上下文，定时触发用 Routines；把它定位成"在明确工作包里极强的工程师"

3. **Hermes 的正确打开方式是分配长期责任**——告诉它目标/边界/通知条件/检查频率/失败处理；最适合的场景是"接下来两周持续帮我维护这条自动化链路，发现异常先定位，不能修再叫我"

4. **Operating Contract 要按生命周期单元分开写**——Claude Code 管每类任务的输入/允许执行的命令/交付物/review 方式；Hermes 管长期目标/触发条件/升级路径/记忆边界/什么时候必须停下来问人

5. **Harness 和 Persistent Runtime 是上下层关系**——不要把 Harness 扔掉，而是把它放进每一次执行单元里；Claude Code 把 Harness 价值放大到单次工程协作，Hermes 把这些纪律嵌进更长的运行循环

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-vs-hermes-engineer-vs-runtime-lifecycle.md)

---

