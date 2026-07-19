# Claude Code Agent Teams 架构分析

## Ch09.052 Claude Code Agent Teams 架构分析

> 📊 Level ⭐⭐ | 11.6KB | `entities/claude-code-agent-teams-architecture.md`

## 核心结论

Claude Code Agent Teams 把多 agent 协作做成了一套**本地 runtime**：一个 lead、多个独立 Claude Code session、一个共享 task list、一个 mailbox、再加 hooks 做质量检查点。

**判断**：Agent Teams 目前是 experimental，不适合直接当生产级编排内核，但它把下一代 coding agent runtime 的骨架暴露得非常清楚。

## 三种多 agent 形态的边界

| 形态 | 核心用途 | 通信方式 | 生命周期 | 适合场景 |
|------|---------|---------|---------|---------|
| **Subagent** | 单点委派 | 只回 parent | 任务完成即结束 | 查询、review、测试 |
| **Agent Teams** | 自动协作 | teammate 之间可通信 | 独立 session，持续互动 | 并行探索、跨模块协作、争议验证 |
| **Agent View** | 人工调度 | 人和 session 交互 | background session | 人同时管多个任务 |

## 四大架构组件

### Team Lead
主 Claude Code session，负责创建 team、spawn teammates、协调任务、汇总结果。

### Teammates
独立 Claude Code instances，各自执行任务。每个 teammate 有自己的 context window，可互相发消息、看共享任务列表、自己 claim task。

### Task List（协作核心）
共享任务列表，官方 task 状态：`pending → in progress → completed`。Task 可有依赖关系，被 blocked 的 task 不能被 claim。Claim 用 file locking 防抢。

关键数据结构：
```json
{
  "id": "task-001",
  "team": "auth-refactor",
  "status": "pending",
  "owner": null,
  "blockedBy": [],
  "artifacts": [],
  "acceptanceCriteria": ["List security risks", "Classify severity", "Propose fixes"]
}
```

### Mailbox
Agent 之间消息系统，teammates 可按名字互发消息，消息自动送达，不需要 lead 轮询。

**注意**：Mailbox 是协调通道，不是共享上下文。大段搜索结果、测试日志、完整代码 diff 不应通过 message 乱飞——只适合传结论摘要、artifact pointer、阻塞点、请求动作。

## Hooks：质量检查点

三个关键 hook：

| Hook | 触发点 | 能做什么 |
|------|--------|---------|
| `TeammateIdle` | teammate 即将 idle | 返回 exit code 2，继续工作 |
| `TaskCreated` | task 创建时 | 返回 exit code 2，阻止创建 |
| `TaskCompleted` | task 标记完成时 | 返回 exit code 2，阻止完成 |

这本质上是 **harness 质量验收机制**：模型说"完成了"不算，外部规则允许完成，才算完成。

## Context 隔离是最大价值

每个 teammate 有独立 context window。Spawn 时加载 CLAUDE.md、MCP servers、skills 和 lead 的 spawn prompt，**不继承 lead 的 conversation history**。

价值不是"更聪明"，而是降低上下文互相污染。

## 权限继承的坑

Teammates 初始使用 lead 的 permission settings。如果 lead 用 `--dangerously-skip-permissions`，teammates 也会继承。

建议用 **capability lease**：
```json
{
  "agentId": "worker-auth-reviewer",
  "allowedTools": ["read_file", "grep", "run_test"],
  "deniedTools": ["write_file", "deploy", "db_write"],
  "allowedPaths": ["src/auth/**", "tests/auth/**"]
}
```

## 官方限制（不适合生产的原因）

| 限制 | 架构含义 |
|------|---------|
| in-process teammates 不支持 /resume 和 /rewind | 不能当可靠持久 worker |
| task status 可能滞后 | task state 需要外部 monitor 纠偏 |
| shutdown 可能慢 | 需要 lease timeout 和强制 kill |
| 一个 lead 同时只能管一个 team | 不支持复杂组织结构 |
| 不支持 nested teams | teammate 不能继续 spawn team |
| spawn 时不能设置 per-teammate permission mode | 生产权限模型要自己做 |

## 设计借鉴：混合架构

建议采用**外层固定状态机 + 内层按需拉 Agent Team** 的混合架构：

- 固定流程阶段（TechPlan、CodeReview）按需拉 team
- 每个 worker 必须产出 artifact，不只是发消息
- Message 只传 artifact pointer，避免 Mailbox 变成第二个 context 污染场所

## 深度分析

### 1. Task List 的设计哲学：从"聊天协调"到"结构化协调"

Claude Code Agent Teams 最核心的设计决策是把 **task list 而非 mailbox 当作协作主轴**。这是一个非常清醒的架构选择。

大多数 multi-agent 系统默认用消息流来协调：agent A 发消息给 agent B，B 处理完再回复。但消息驱动的协调有一个根本缺陷——**它依赖 agent 的自我管理能力**。Agent 必须记住自己收到了什么、承诺了什么、还没完成什么。对于有限 context window 的系统来说，这是隐性负担。

Task list 把协调状态外置了：pending / in_progress / completed 是客观事实，不依赖任何一个 agent 的记忆。这和操作系统调度器的思路完全一致——**把协作状态变成第一等公民**。

关键细节：task 有 `blockedBy` 依赖、被 file locking 保护 claim 操作、有 `acceptanceCriteria` 作为完成标准。这三点让 task list 不仅是"待办清单"，而是一个**可执行的工作契约**。

### 2. Mailbox 的精准定位：避免重蹈覆辙

文章反复警告不要把 Mailbox 当成共享上下文，这个提醒非常及时。

在单 agent 系统里，context pollution 是主要风险。引入多 agent 后，开发者本能地会想："让 agent 之间共享更多信息"——但如果这个共享是通过 mailbox 传递大段内容实现的，Mailbox 就变成了**第二个 context pollution 场所**，而且更难追踪（因为消息在 agent 之间流转，污染路径不透明）。

正确的设计是：
- **Message = 协调信号**（结论、artifact pointer、阻塞通知、行动请求）
- **Artifact = 实际产出**（代码、报告、测试结果、结构化数据）

这是 CAD（Communicating Sequential Processes）的核心理念：进程间只传递消息，不传递状态。

### 3. Hooks 的意义：从"自评"到"他评"

Hooks 把 task 完成从 agent 自主判断变成了**外部可干预的事件**。这是引入 human-in-the-loop 思维的第一步。

| Hook | 事件 | 可能的外部干预 |
|------|------|--------------|
| TeammateIdle | Agent 准备 idle | 强制继续、重新分配任务 |
| TaskCreated | Task 刚创建 | 阻止无效 task 的创建 |
| TaskCompleted | Task 标记完成 | 驳回未达标的完成 |

这个模式的本质是 **two-phase commit**——agent 说"完成了"，只是 prepare phase；外部 hook 说"通过了"，才是 commit phase。没有这个机制，多 agent 系统很容易陷入"大家都觉得自己完成了"的集体幻觉。

### 4. Context 隔离作为价值主张

文章指出了 Subagent vs Agent Teams 的本质区别：Subagent 把结果返回 parent 就结束，Teammate 是**独立可持续的 session**。

这个区别的工程意义在于：Subagent 适合"一次性的、结果导向的任务"；Teammate 适合"需要持续推理、动态响应的任务"。

Context 隔离不只是防止污染，还有另一层价值：**它让并行变得真正安全**。如果两个 agent 共享 context，对同一个文件的并发修改会导致 race condition 或 context 错乱。隔离后，每个 agent 的编辑空间在理论上不重叠（如果 task 分配得当），并行才是真的并行。

### 5. 权限继承的坑与 capability lease 模式

权限继承是一个**静默的、难以察觉的安全风险**。开发者通常不会在 spawn 时想到权限问题，而 `--dangerously-skip-permissions` 在 lead 上使用时，所有 teammate 都会隐式继承这个危险能力。

文章提出的 capability lease 模式是一个很好的防御性设计：
```json
{
  "allowedTools": [...],
  "deniedTools": [...],
  "allowedPaths": [...],
  "expiresAt": "...",
  "budget": {...}
}
```

这比 RBAC 更细粒度，因为 RBAC 通常是静态的，而 capability lease 可以是**临时的、任务相关的、有预算上限的**。

### 6. Plan Approval 的三级风险分类

文章提出的三级审批（Lead auto approve / Verifier approve / Human approve）本质上是一个**风险路由**机制：

- 低风险（局部重构、测试）：AI 自主决定
- 中风险（跨模块改动、PR review）：Verifier hook 把关
- 高风险（数据库 schema、线上发布、支付）：人类审批

这个框架的可操作性强——关键是如何定义"风险级别"。一个实用的判断维度：
- **影响范围**：改动影响几个模块 / 几个服务 / 线上 production
- **可逆性**：改动是否可 rollback
- **暴露面**：是否有外部用户数据参与

## 实践启示

### 对于使用 Claude Code Agent Teams 的开发者

1. **从单 agent 开始，只有满足以下条件才上 Teams**：
   - 任务需要并行独立探索（不是顺序依赖的）
   - 任务有清晰可拆分的边界
   - 任务的风险级别在可接受范围内

2. **所有 teammate 必须产出 artifact**，不鼓励"我 review 完了"这种结论性消息——没有 artifact pointer 的结论在后续流程里无法追溯。

3. **永远用 capability lease 而非继承权限**。Spawn 前先想：这个 teammate 最多能做什么？允许写文件吗？允许调用 deploy 吗？

4. **在 Plan approval 阶段投入足够时间**。Teammate 的 plan 实际上是对任务理解的第一性检验——如果 plan 本身就有漏洞，实现阶段会浪费大量资源。

### 对于构建自己的 Agent Orchestration 系统的架构师

1. **Task List 是协作的核心**，不要用消息流替代它。Task 必须有：唯一 ID、状态、owner、blockedBy 依赖、acceptanceCriteria、artifacts。

2. **Mailbox 只传协调信号**，所有实际产出通过 artifact 系统管理。设计一个 artifact registry，每个 artifact 有 producer、type、evidence、createdAt。

3. **引入 external verifier hooks**。不要信任 agent 自己的"完成"判断。通过 hooks 把验收逻辑 externalize——代码任务跑测试，研究任务查引用，文档任务查格式。

4. **设计 permission boundary 时假设最坏情况**：如果一个 teammate 被攻破或者 prompt injection，它的破坏半径能有多大？用 capability lease 把这个半径限制在最小必要范围。

5. **Display mode 和 runtime 是两件事**。Claude Code 用 tmux 分屏是 CLI 产品的自然选择。企业级系统需要的是 operator console、event replay、cost dashboard——这些是独立的 UI 层，不应该耦合进 runtime。

6. **成本控制要有硬性边界**。Agent Teams 的 token 开销是标准 session 的 7x（在 plan mode 下）。实现一个 `shouldUseAgentTeam()` 函数，在 spawn 前做判断——不是所有复杂任务都需要动态 team，固定状态机 + 按需拉 team 的混合架构更可持续。

## 相关实体
- [Claude Code Agent Teams Task Decomposition Ruofei](../ch01/371-claude-code-agent-teams.html)
- [Claude Code Dynamic Workflows Multi Agent Orchestration](ch09/089-claude-code-dynamic-workflows.html)
- [Claude Code Agent View](ch09/001-claude-code-agent-view.html)
- [Claude Code Agent View Huashu](ch09/001-claude-code-agent-view.html)
- [Claude Code Architecture](../ch03/076-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-agent-teams-xingxiaozhao.md)
- [routa 多智能体协同交付平台](../ch03/046-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

