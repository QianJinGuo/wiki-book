---
title: "Claude Code vs Hermes: 一个是工程师, 一个是 Runtime"
source: "https://mp.weixin.qq.com/s/A0PAkMjeKdmJRAW-voJbzg"
source_type: wechat
author: "小黑 (AI Native 软件工程)"
ingested: 2026-06-10
sha256: 91f4ed99fcfab27212b4ca3034fd5ea3ac6d08a2a49d86159c201e72844a8590
confidence: 9
value: 8
stars: 4
description: "Claude Code (Session 生命周期) vs Hermes (Goal 生命周期) 6 维对比 + 状态模型差异 + 常见错配模式 + Harness (执行层) vs Persistent Runtime (系统层) 上下层关系 + '土问题' 选型决策"
created: 2026-06-10
---

## Claude Code: 工程师, 不是员工

**设计中心**: **repo-centric**, 适合在已 checkout 的代码库工作.

**入口**: Terminal CLI / VS Code extension / Cursor / JetBrains / desktop app / browser.
**安装**: `curl -fsSL https://claude.ai/install.sh | bash`

**体验核心**: 不是"陪你聊天", 而是"**进入你的工程现场**".

**价值来源**: 一段**高密度、强约束、可审核**的协作. 人说清楚目标 → Claude Code 进入 repo → 改 → 人 diff/test/PR 流程把关.

**Human-in-loop 是设计选择** (不是缺陷): 最后一公里责任留给工程师, **不能把 review 权限彻底让出去**.

### Routines: 触发方式扩展, 不改根本生命周期

**2026-04-14 进入 research preview**. 支持:
- scheduled cloud sessions
- API triggers
- GitHub event automation
- 运行在 Anthropic-managed infrastructure
- **routines run even when your computer is off**

> 但**不会**因此归类为 Persistent Runtime. Routines 扩展的是**触发方式**, 不是根本生命周期.

**Routine 实际还是 finite session**:
- 每天审 PR 的 Routine → 触发 → 读 repo → 检查 → 建议 → 结束
- 不会自然积累状态 / 不会自然记得 reviewer 偏好 / 不会自然记得 flaky test 历史
- 这些都要靠 **CLAUDE.md / repo 文档 / --resume / --continue** 显式传递

> **核心比喻**: Claude Code 很像一个你可以反复召唤的**资深工程师**. 你给上下文, 它进入现场; 你不给, 它不会假装自己一直在公司工位上坐着.

**强项场景** (希望系统有明确边界):
- 复杂多文件重构
- 测试生成
- PR review
- repo understanding
- 任何"可关停"的工程任务

> **金句**: 边界感是软件工程的一部分, 尤其在权限/合规/生产风险都存在的环境里. **不要把"会话结束"理解成短板**, 它是 Claude Code 把自己定位为工程师, 而不是员工的证据.

---

## Hermes: Runtime, 不是助手

**起点**: 不是一个 IDE 里的 coding assistant, 而是**单进程 gateway 里的 persistent agent**. 入口: Telegram / Discord / Slack / WhatsApp / Signal / CLI. 部署: 5 美元 VPS / GPU cluster / serverless.

> 部署形态本身就在表达一种**系统观**: agent 应该活在你工作的地方, 而不是只活在一次 IDE 会话里.

**核心架构**: **single-agent persistent loop** — input → process → state evolution → next action. 没有 swarm 叙事, 也不是把十几个 agent 拼成编排层. 每个任务流经**同一个循环**, 循环不因聊天窗口关闭就终止.

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

你不是每次来都发一个 prompt, 而是在 runtime 里**挂一个目标**, 让它围绕这个目标持续调整状态.

**作者实际用法**:
- 监控开源仓库里和 tool execution 相关的新提交, 每周摘要
- security-relevant commit 立即 Telegram ping
- 任务应该被建模成"持续目标": 定期检查 / 过滤事件 / 关联历史 / 决定是否通知 / 保留判断依据

### Runtime 能力栈

- **cron scheduler**: 自然语言安排 daily reports / nightly backups / weekly audits
- **子代理**: 并行 workstream spawn isolated subagents
- **70+ tools / 28 toolsets**
- **6 类终端后端**: local / Docker / SSH / Singularity / Modal / Daytona
- **多模型**: OpenRouter 200+ models / OpenAI / Anthropic / 本地 endpoint / hermes model 可切换

### Honcho dialectic user modeling

Persistent agent 如果只记住聊天历史**还不够**, 它要逐步理解**用户偏好/判断方式/风险边界**. 否则长期在线只会长期打扰你.

> 跨会话用户理解, 在短 session 里是锦上添花; **在 persistent runtime 里是生存条件**.

### 学习 loop (经验沉淀为 skill)

- 从经验创建 skills, 使用中改进
- FTS5 搜索过去对话 + LLM summarization 把相关历史压回当前上下文
- 一次失败 / 一次修复 / 一次用户纠正, 变成后续执行的**真实约束**

### IM-native 是架构选择 (不是 UI 选择)

> 一个长期运行的 agent 需要出现在**真实事件发生**的地方: 群里有人 @, 服务器告警弹出, GitHub webhook 触发, 用户在路上用手机补一句约束.

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

对 **Claude Code** 写清楚:
- 每类任务的**输入**
- 允许执行的**命令**
- **交付物**
- **review 方式**

> 前者管理的是**一次协作的质量**.

对 **Hermes** 写清楚:
- **长期目标**
- **触发条件**
- **升级路径**
- **记忆边界**
- 什么时候必须**停下来问人**

> 后者管理的是**长期运行的风险**.

---

## "土问题" 选型决策 (可立即应用)

> **如果我三天不打开这个工具, 它应该继续工作吗?**
> 这个问题比模型榜单更快暴露真实需求.

- **答案 = 否** → Claude Code 这类 session-driven 工具往往更干净
- **答案 = 是** → 需要 Hermes 这种 persistent runtime, 或者至少要自己搭一层状态/调度/记忆/通知系统

**流水线组合也合理**: Hermes 负责**发现事件 + 维护目标**, Claude Code 负责**某次具体工程执行里把代码改干净**.

---

## Harness 系列 → Persistent Runtime 系列 (上下层关系)

**Harness 系列** (单 repo / 单 session): 5 个子系统:
1. **Instructions** — prompt 怎么写
2. **State** — 上下文怎么压缩
3. **Verification** — 测试怎么跑
4. **Scope** — 任务边界
5. **Session Lifecycle** — 会话开始/结束/压缩

> 解决: "**一次执行如何不跑偏**"

**Persistent Runtime 系列** (跨 session / 跨 repo / 跨时间) 核心问题:
- agent 如何长期保持目标
- 如何在环境里接收事件
- 如何维护自己的状态
- 如何在不打扰人的情况下推进事情

> **不是替代关系**. Persistent Runtime 不是把 Harness 扔掉, 而是**把 Harness 放进每一次执行单元里**.

**Harness 是执行层的工程纪律, Persistent Runtime 是系统层的生命周期设计**:
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

## 跨实体关联

- [[entities/hermes-agent-9-module-architecture|Hermes 9 Module 架构]] — 源码级实现细节
- [[entities/harness-engineering-7-layers-openclaw-hermes-claude-code|Harness 7 Layers OpenClaw/Hermes/Claude Code]] — 3 工具 harness 视角对比 (互补)
- [[entities/harness-engineering-framework|Harness Engineering 概念框架]] — Harness 系列根基
- [[entities/claude-code-routines|Claude Code Routines]] — 触发方式扩展
- [[entities/hermes-agent-goal-runtime-architecture|Hermes Goal Runtime 架构]] — Goal-in-loop 实现

→ [[raw/articles/claude-code-vs-hermes-engineer-vs-runtime-lifecycle|原文存档]]
