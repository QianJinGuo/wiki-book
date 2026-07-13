# Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据

## Ch01.391 Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据

> 📊 Level ⭐⭐ | 12.5KB | `entities/claude-code-agent-teams-task-decomposition-ruofei.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-agent-teams-task-decomposition-ruofei.md)

# Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据

## 核心问题

多开几个 Agent 并不会自动变成团队协作。它更可能变成五段上下文、五份半成品、五处文件冲突，以及一个人类最后回来收拾现场。

**关键判断**：一段工程工作，能不能被拆成几个边界清楚、互相不踩、最后能合回来的工作面。

## 三种协作结构

Subagents、Agent View、Agent Teams 不按 Level 1/2/3 排队，它们解决的是不同问题：

| 能力 | 价值 | 适合场景 |
|------|------|----------|
| **Subagent** | 把主会话不需要长期保留的噪声隔离掉 | 只读调研、审查；主会话只拿回结论和证据 |
| **Agent View** | 让几个独立 session 在后台跑 | 彼此不需要交流的任务 |
| **Agent Teams** | 共享任务和成员之间的直接通信 | 跨层、跨文件、有依赖的工作 |

## 什么时候该用 Agent Teams

**判断顺序**：
1. 只读调研/审查 → Subagent
2. 互不依赖的小任务 → Agent View
3. 多个 session 都要改代码 → Worktrees（文件隔离比角色名更重要）
4. 跨层有依赖要共享 → Agent Teams

**一句话**：能隔离的先隔离；需要共享状态、依赖协调和成员通信时，再用 Agent Teams。

## Agent Teams 多出来的是「协作状态」

Agent Teams 由多个 Claude Code session 组成：lead 拆解分配、teammates 各自执行、task list 记录依赖状态、permissions 限制权限、review gates 统一验收。

**核心洞察**：没有这层状态，多 Agent 会变成"岗位扮演"。团队感不来自名字，而来自信息能不能正确流动，任务能不能被阻塞和解锁，结果能不能被统一验收。

## 并行之前，先问四个工程问题

1. **文件边界能不能切开？** 两个 teammate 同时改同一个文件最容易互相覆盖
2. **信息依赖是单向的，还是来回的？** 双向依赖才需要 Agent Teams
3. **验收证据是什么？** diff、测试、类型检查、截图、日志、PR 评论、风险清单最后要归到同一处
4. **权限和预算怎么收住？** 先把允许和禁止写进设置

## 团队 Prompt 模板

```
GOAL: 实现一个最小可用的用户登录流程
SCOPE: backend/frontend/tests 各有明确文件边界
WORKSTREAMS: 每个 teammate 有明确文件所有权，不跨范围修改
DEPENDENCIES: frontend 依赖 backend 接口契约，tests 依赖两者最终接口
PERMISSIONS: 允许读代码/改 scope 内文件/跑局部测试；禁止读 .env/改迁移/git push
REVIEW GATES: diff 摘要 + 测试结果 + 风险清单 + lead 汇总后才算完成
STOP: 发现 scope 外修改先停下说明，不自行扩大范围
```

## 落地前检查清单

- 目标：一句话说不清，就先别拆
- 文件边界：每个 teammate 能改哪些文件？哪些不能碰？
- 依赖顺序：谁等谁的接口/类型/审查结论？
- 权限边界：.env、迁移、git push、外部服务访问权限
- 验收证据：至少要有一组能复核的证据

## 深度分析

### 协作结构的本质区别

三种模式并非递进关系，而是对应不同复杂度的工作场景：

- **Subagent** 解决的是信息过滤问题——主会话不需要知道调研过程，只需要结论。它是一种"单向信息压缩"机制。
- **Agent View** 解决的是并行执行问题——多个独立任务同时跑，彼此不通信、不等待。它是一种"空间隔离"机制。
- **Agent Teams** 解决的是状态同步问题——任务之间有依赖，成员之间要通信，lead 需要统一验收。它是一种"协同协调"机制。

### 文件边界是团队协作的第一约束

若飞将"文件边界能不能切开"作为四个工程问题之首，这是因为文件冲突是多 Agent 协作中最常见、最难修复的错误。当两个 teammate 同时修改同一个文件时，后写入的版本会覆盖先写入的版本，导致其中一个 teammate 的工作完全丢失。

Worktrees（git worktree）通过创建独立的工作目录来解决文件隔离问题，这比通过 role naming 或 permission 设置来约束更可靠——因为它从文件系统层面杜绝了冲突可能。

### 双向依赖才是 Agent Teams 的适用场景

若飞明确区分了单向依赖和双向依赖：

- 单向依赖（"帮我看看这个模块有没有安全问题"）→ Subagent 足够，因为主会话只需要结果，不需要和 Subagent 持续交互
- 双向依赖（"后端接口变了，前端要调整，测试要同步，审查发现的风险还要反向影响实现"）→ 才需要 Agent Teams，因为涉及多轮信息交换和状态同步

这个判断标准直接决定了是否需要引入 Agent Teams 的协作开销。

### 证据链是验收的核心

若飞强调"验收证据要归到同一处"，这触及了多 Agent 协作中最容易被忽视的问题：每个 teammate 都说自己完成了，但完成的依据是什么？

diff 摘要、测试结果、风险清单需要汇总到 lead 那里，由 lead 统一判断是否可以宣布完成。这个机制防止了"局部完成但整体未完成"的局面——每个 teammate 的产出必须能被验证、对比和整合。

### 若飞主线：从单 Agent 到多工作面的范式转变

若飞将今年的分析主线串联起来：

- 2 月：Agent Teams，"默认串行，显式协作"
- 4 月：多 Agent 五种模式，上下文边界和信息流
- 5 月：Karpathy / Claude Code 大代码库 / Skills / Codex 工作现场 / Claude 工作流

这条主线的演进方向是把问题从"一个 Agent 怎么干活"推进到"多个工作面怎么同时推进"。这反映了一个根本性变化：Coding Agent 的工作单位正在从"一个会话"变成"一组有边界、有依赖、有验收标准的工作面"。

## 实践启示

### 1. 用排除法决定是否上 Agent Teams

在考虑 Agent Teams 之前，先问自己三个问题：
- 任务能否完全并行、彼此不通信？→ 用 Agent View
- 只需要单向信息提取、不需要持续交互？→ 用 Subagent
- 需要共享状态、多轮交互、统一验收？→ 才考虑 Agent Teams

Agent Teams 的协作开销最高，只有在前两种模式都不适用时才值得引入。

### 2. 文件边界优先于角色分配

很多团队在设计多 Agent 协作时首先想到的是给每个 Agent 分配一个"角色"（前端 Agent、后端 Agent、测试 Agent），但若飞提醒：文件边界比角色名更重要。

原因在于：角色是软约束，文件是硬约束。一个 Agent 可以"被告知"不要修改某个文件，但它仍然可能因为上下文中看到相关代码而无意中做出修改。Worktrees 从文件系统层面杜绝了这种可能，是更可靠的隔离机制。

### 3. 四个工程问题要在启动前全部回答

并行之前的四个工程问题（文件边界、信息依赖、验收证据、权限预算）不是可选的检查项，而是启动 Agent Teams 的前提条件。任何一个问题没有清晰答案，就不应该启动并行。

特别是验收证据——如果没有明确最终归到哪处、多 teammate 的产出如何整合，就贸然启动多 Agent，结果必然是每个人都说完成了但整体无法收敛。

### 4. STOP 条件要明确写在 Prompt 里

若飞的团队 Prompt 模板中有一条"STOP"指令：发现 scope 外修改先停下说明，不自行扩大范围。

这条指令的重要性在于：多 Agent 协作中，一个 teammate 擅自扩大范围的影响会被放大——它不仅破坏了自己的 scope，还可能破坏其他 teammate 的依赖假设。在 Prompt 中明确写入这一条，等于给每个 teammate 一个"只做分内事"的硬约束。

### 5. 配置参数不能想当然

若飞在文末专门列出了几个常见的配置错误：

- 环境变量不能写成 `VAR = 1`，正确 shell 写法是 `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- `--max-budget-usd` 是 CLI 在 print mode 下的预算上限，不是 Agent Teams 专用参数
- Agent View 的后台 session 是本机 supervisor 托管，不是关机以后还能继续跑
- `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` 控制模型 reasoning 行为，不是 Agent Teams 开关

这些细节看似琐碎，但在实际运行中，配置错误会导致整个协作机制无法启动或产生预期之外的行为。

## 若飞今年的主线

本文接续了若飞从 2 月到 5 月的分析主线（Agent Teams → 多 Agent 模式 → 上下文边界 → 工作现场 → 工作流），把问题从"一个 Agent 怎么干活"推进到"多个工作面怎么同时推进"。

**核心变化**：Coding Agent 的工作单位在变——从交给一个会话，变成拆成几个工作面：谁读现状、谁改哪部分、谁验证、谁审查，哪些信息需要共享，哪些文件不能碰，失败以后怎么回退，最后用什么证据判断完成。
## 相关实体
- [Claude Code Agent View Huashu](../ch09/001-claude-code-agent-view.html)
- [Claude Code 7 Layer Memory Architecture](../ch03/075-claude-code.html)
- [Claude Code Agent Teams Architecture](ch01/391-claude-code-agent-teams.html)
- [Claude Code Deep Architecture Analysis](../ch03/075-claude-code.html)
- [Claude Code Official Plugins Anthropic](../ch03/075-claude-code.html)
- [claude code 多智能体协作体系设计：从单agent到多agent工作流](../ch03/075-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

