---
source_url: https://mp.weixin.qq.com/s/H28NkOwoyfb9AaCUykrx_Q
title: "看完 Claude Code Agent Teams，我更确定接下来拼的是 Agent Runtime，技术拆解：Lead、Task List、Mailbox 和 Hooks 是什么东西"
author: 行小招
account: 科技充电站
published: 2026-05-22
source: wechat
tags: [claude-code, agent-teams, multi-agent, runtime, orchestration]
created: 2026-05-23
sha256: 344e6d9ccf17ab4d6909a089785e0bed64e532f42890d5cd14160731846c29e0

---

# 看完 Claude Code Agent Teams，我更确定接下来拼的是 Agent Runtime，技术拆解：Lead、Task List、Mailbox 和 Hooks 是什么东西

嗨，大家好，我是行小招。

Claude Code 的 Agent Teams，最有价值的地方不是"多开几个 Claude"，而是它把多 agent 协作做成了一套本地 runtime：一个 lead，多个独立 Claude Code session，一个共享 task list，一个 mailbox，再加 hooks 做质量检查点。

这句话很关键，因为很多人一看到 Agent Teams，就会自然脑补成"几个 agent 在群里开会"。但 Claude Code 这套东西，明显不是纯 prompt 层的角色扮演，它更像一个很轻量的本地协作系统。

先说结论：**Agent Teams 目前还是 experimental，不适合直接当生产级编排内核，但它把下一代 coding agent runtime 的骨架暴露得非常清楚。**

## 先把三种多 agent 分清楚

Claude Code 现在至少有三种"并行工作"的形态，很多误解就出在这里。

Subagent 是主 session 通过 `Agent` 工具拉起一个子任务，它有自己的 context window，干完以后只把结果返回给 parent。它适合"帮我 review 一下这段代码""跑一组测试""查一下某个模块"这种 focused task。

Agent Teams 是更重的一层：它不是一个 session 里的临时子任务，而是多个独立 Claude Code instances 组成团队。每个 teammate 都有自己的 context window，可以互相发消息，可以看共享任务列表，还可以自己 claim task。

Agent View 又是另一回事，它是人类管理多个 background sessions 的控制台，不是 Agent Teams 的 runtime。官方也明确说，subagents 和 teammates 不会作为独立 row 出现在 Agent View 里。

这三者的边界，可以这么看：

| 形态 | 核心用途 | 通信方式 | 生命周期 | 适合场景 |
|------|---------|---------|---------|---------|
| Subagent | 单点委派 | 只回 parent | 任务完成即结束 | 查询、review、测试 |
| Agent Teams | 自动协作 | teammate 之间可通信 | 独立 session，可持续互动 | 并行探索、跨模块协作、争议验证 |
| Agent View | 人工调度 | 人和 session 交互 | background session | 人同时管多个任务 |

**别把 subagent 当团队，也别把 Agent View 当 runtime，它们解决的是三类完全不同的问题。**

## Agent Teams 的开启方式

Agent Teams 默认是关闭的，因为它还是实验功能。官方要求 Claude Code `v2.1.32` 或更高版本，并且要设置环境变量：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

你也可以在命令行里临时设置：

```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

启动方式也挺 Claude Code：不是写 YAML workflow，而是直接用自然语言说：

```
Create an agent team to review PR #142.
Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

官方说有两种启动路径：你明确要求创建 team，或者 Claude 判断任务适合并行后提出创建 team，但必须经过用户确认。它不会偷偷创建 team。

这个设计很现实，因为 Agent Teams 很贵，也有 coordination overhead。顺手开 5 个 teammate，看着很爽，账单也会很爽。

## 官方架构：Lead、Teammates、Task List、Mailbox

Claude Code Agent Teams 的核心架构其实不复杂，真正厉害的是它把这些东西落到了本地 runtime 里。

官方给出的组件是这四个：

| 组件 | 作用 |
|------|------|
| Team lead | 主 Claude Code session，负责创建 team、spawn teammates、协调任务、汇总结果 |
| Teammates | 独立 Claude Code instances，各自执行任务 |
| Task list | 共享任务列表，teammates claim 和 complete task |
| Mailbox | agent 之间的消息系统 |

本地状态也有明确路径：

```
~/.claude/teams/{team-name}/config.json
~/.claude/tasks/{team-name}/
```

`config.json` 是 Claude Code 自动生成和维护的，里面会有 `members` array、teammate name、agent ID、agent type、session ID、tmux pane ID 等运行时状态。官方特别提醒：不要手改，也不要提前写一个项目级 `.claude/teams/teams.json`，它不认。

**这点很重要：Claude Code 的 Agent Teams 不是配置驱动的静态 workflow，而是运行时动态生成的本地 team state。**

## 生命周期：从创建团队到清理现场

官方 Tools Reference 里能看到相关工具：

| 工具 | 作用 |
|------|------|
| TeamCreate | 创建 agent team |
| TeamDelete | 解散 team，清理 teammate processes |
| SendMessage | 给 teammate 发消息，也能 resume subagent |
| TaskCreate | 创建 task |
| TaskGet | 获取 task 详情 |
| TaskList | 列出 task |
| TaskUpdate | 更新 task 状态、依赖、详情，或删除 task |

这些工具不是让用户手写调用的，通常是 Claude 自己根据任务去用。但从实现角度看，它已经把 team runtime 的原语暴露出来了。

## Task list 才是协作核心

Agent Teams 不是靠聊天推动的，真正推动协作的是 shared task list。

官方定义的 task 状态有三种：`pending → in progress → completed`

Task 还可以有依赖关系，一个 pending task 如果依赖没完成，就不能被 claim。Lead 可以显式分配任务，也可以让 teammate 完成手头任务后自己 claim 下一个 unassigned、unblocked task。

官方还提到一个关键细节：claim task 会用 file locking，防止多个 teammates 同时抢同一个任务。

这就不是"你们几个讨论一下"了，而是：**共享任务板 + 独立 worker session + 消息通道 + lead 汇总**

如果抽象成数据结构，大概长这样：

```json
{
  "id": "task-001",
  "team": "auth-refactor",
  "title": "Audit token refresh flow",
  "description": "Review src/auth/token.ts and identify security risks.",
  "status": "pending",
  "owner": null,
  "blockedBy": [],
  "artifacts": [],
  "acceptanceCriteria": [
    "List security risks with file paths",
    "Classify severity",
    "Propose concrete fixes"
  ],
  "createdAt": "2026-05-21T10:00:00+08:00",
  "updatedAt": "2026-05-21T10:00:00+08:00"
}
```

这个设计给我的启发很直接：如果你要做自己的超级 Agent，不能只靠 prompt 里的 todo，必须有正式的 Task Ledger。任务状态、依赖、owner、验收标准、产物指针，都要落盘。

## Mailbox 是协调通道，不是共享上下文

Mailbox 是 Agent Teams 里另一个关键点。官方说 teammates 可以按名字给其他 teammate 发消息，消息会自动送达，不需要 lead 轮询。

但这里要打个补丁：官方只确认了 Mailbox 是 messaging system，没有公开承诺具体 inbox 文件结构。社区文章里有人观察到 `.claude/teams/<team_id>/inbox/` 或类似路径，也观察到消息可能以 `<teammate-message>` 注入 conversation history，但这些都不是官方稳定契约。

| 信息 | 可信度 |
|------|--------|
| teammate 可以互相发消息 | 官方确认 |
| lead 不需要 polling，消息自动送达 | 官方确认 |
| 具体 inbox 文件路径 | 社区观察，不建议依赖 |
| XML 注入格式 | 社区观察，不建议依赖 |

**这里最容易踩坑的是：把 Mailbox 当成共享上下文。**

千万别这么干。大段搜索结果、测试日志、完整代码 diff，都不应该通过 message 乱飞。Message 只适合传协调信息：结论摘要、artifact pointer、阻塞点、请求动作。

否则你只是把 context pollution 从主 session 搬到了 agent-to-agent 消息里，纯纯换个地方爆炸。

## Context 隔离是最大价值

官方明确说，每个 teammate 都有自己的 context window。Spawn 时，teammate 会加载常规项目上下文，比如 `CLAUDE.md`、MCP servers、skills，也会收到 lead 的 spawn prompt，但不会继承 lead 的 conversation history。

这就是 Agent Teams 比"几个角色 prompt"更有价值的地方。

Subagent 也有独立 context，但 subagent 只把最终结果回给 parent。Teammate 是一个完整 Claude Code session，可以持续互动，可以跟别人通信，可以自己 claim task。

所以它的价值不是"更聪明"，而是降低上下文互相污染。一个 security reviewer 不需要知道 UI 细节，一个 performance reviewer 也不需要吃下完整安全审计过程。

**真正的团队分工，先从 context 隔离开始。**

## Hooks 是质量检查点

Claude Code Agent Teams 还有一个非常关键的治理点：hooks。

官方提到三个跟 team 相关的 hook：

| Hook | 触发点 | 能做什么 |
|------|--------|---------|
| TeammateIdle | teammate 即将 idle | 返回 exit code 2，让反馈送回 teammate，继续工作 |
| TaskCreated | task 创建时 | 返回 exit code 2，阻止创建并给反馈 |
| TaskCompleted | task 标记完成时 | 返回 exit code 2，阻止完成并给反馈 |

这其实就是 harness 里的质量验收机制。模型说"完成了"不算，外部规则允许完成，才算完成。

伪代码大概是这样：

```typescript
type TaskStatus =
  | "pending"
  | "in_progress"
  | "completion_requested"
  | "completed"
  | "rejected";

async function completeTask(taskId: string, agentId: string, artifactRefs: string[]) {
  const task = await taskStore.get(taskId);

  await taskStore.update(taskId, {
    status: "completion_requested",
    completedBy: agentId,
    artifactRefs,
  });

  const checkResult = await runHook("TaskCompleted", {
    task,
    agentId,
    artifactRefs,
  });

  if (checkResult.decision === "block") {
    await taskStore.update(taskId, {
      status: "in_progress",
      rejectionReason: checkResult.feedback,
    });

    await messageBus.send({
      to: agentId,
      type: "verifier_feedback",
      content: checkResult.feedback,
    });

    return;
  }

  await taskStore.update(taskId, {
    status: "completed",
    verifiedAt: new Date().toISOString(),
  });
}
```

这个模式值得抄。代码任务跑测试，研究任务查引用，文档任务查格式，PR review 查 evidence。只要没有外部检查，多 agent 很容易变成多个 agent 一起说"我觉得可以"。

## Plan approval：轻量审批，但不是人类审批

Agent Teams 支持让 teammate 先 plan，再 implement。

流程是：teammate 先进入 read-only plan mode，计划完成后向 lead 发起 plan approval request。Lead 可以批准，也可以带 feedback 拒绝。拒绝后 teammate 继续改计划，批准后才开始实现。

这设计挺好，但有一个边界：官方说 lead 的审批是自主完成的，也就是 lead 自己判断要不要 approve。

所以它适合低风险任务，比如重构一个局部模块、写一个测试计划、做一轮 review。但如果涉及数据库 schema、线上发布、支付链路、权限、用户隐私、删除操作，lead approval 不能代替 human approval。

我会把它拆成三级：

- 低风险：Leader auto approve
- 中风险：Verifier approve
- 高风险：Human approve

这也是我为什么一直说，Agent Teams 的重点不是"团队感"，而是 governance。

## 权限继承有坑

官方权限模型有个很危险的点：teammates 初始使用 lead 的 permission settings。如果 lead 用了 `--dangerously-skip-permissions`，teammates 也会继承这个模式。

Spawn 以后可以改单个 teammate 的 mode，但不能在 spawn 时设置 per-teammate mode。

这对个人 CLI 可能还 OK，但对生产系统就挺吓人了。你想想，一个 lead 是 full access，结果所有 teammate 一出生也 full access，那多 agent 的破坏半径直接乘以 N。

更合理的做法是 capability lease：

```json
{
  "agentId": "worker-auth-reviewer",
  "role": "security-reviewer",
  "allowedTools": ["read_file", "grep", "run_test"],
  "deniedTools": ["write_file", "deploy", "db_write"],
  "allowedPaths": ["src/auth/**", "tests/auth/**"],
  "expiresAt": "2026-05-21T11:00:00+08:00",
  "budget": {
    "maxTokens": 200000,
    "maxToolCalls": 80,
    "maxWallClockSeconds": 1800
  }
}
```

**别让 worker 隐式继承 leader 权限。权限要显式、可审计、可撤销。**

## 显示模式：in-process 和 split panes

Agent Teams 有两种 display mode：

| 模式 | 说明 |
|------|------|
| in-process | 所有 teammates 在主 terminal 内运行，用 Shift+Down 切换 |
| split panes | 每个 teammate 一个 pane，需要 tmux 或 iTerm2 |

默认是 auto：如果已经在 tmux session 里，就倾向 split panes，否则用 in-process。

tmux 分屏的体感肯定很爽，因为你可以同时看到每个 teammate 在干什么。但从架构上看，这只是 observability UI，不是核心 runtime。

如果做自己的系统，应该把它拆成：Claude Code 用终端分屏，是因为它是 CLI 产品。企业级 Agent Teams 最终一定需要 operator console、event replay、cost dashboard 和 artifact browser。

## 成本：别把 Teams 当默认模式

官方成本文档里有个数字很醒目：teammates 在 plan mode 下，Agent Teams 大约会用标准 session 的 **7x tokens**。原因很简单，每个 teammate 都是一个独立 Claude instance，都有自己的 context window。

所以 Agent Teams 不能当默认模式。

我会这么分：

- 单 Agent：默认路径
- Subagent：低成本并行辅助
- Agent Team：高价值复杂任务才启用
- 固定流程编排：研发需求交付主干
- Verifier / Check：所有模式都需要

一个粗糙的判断函数可以这样：

```typescript
function shouldUseAgentTeam(task: Task): boolean {
  const score =
    weight(task.estimatedFilesTouched > 8, 2) +
    weight(task.requiresParallelResearch, 2) +
    weight(task.hasMultipleIndependentModules, 2) +
    weight(task.requiresAdversarialReview, 2) +
    weight(task.riskLevel >= "medium", 1) -
    weight(task.isSequential, 2) -
    weight(task.editsSameFileHeavily, 2);

  return score >= 4;
}
```

说白了：能单 agent 做的别组队，能 subagent 做的别上 Teams，只有并行探索、跨模块拆分、对抗 review 这类任务，Agent Teams 才真香。

## 官方限制决定了它还不是生产内核

| 限制 | 架构含义 |
|------|---------|
| in-process teammates 不支持 /resume 和 /rewind | 不能当可靠持久 worker |
| task status 可能滞后 | task state 需要外部 monitor 纠偏 |
| shutdown 可能慢 | 需要 lease timeout 和强制 kill |
| 一个 lead 同时只能管一个 team | 不支持复杂组织结构 |
| 不支持 nested teams | teammate 不能继续 spawn team |
| lead 固定，不能转移 leadership | leader failover 要外部 runtime |
| spawn 时不能设置 per-teammate permission mode | 生产权限模型要自己做 |
| split panes 依赖 tmux / iTerm2 | UI 不能绑定终端能力 |

所以我的判断很明确：Claude Code Agent Teams 是很好的产品原型和设计灵感，但不适合照搬成生产编排内核。

## 如果我自己做，会怎么借鉴

我会采用一个混合架构：外层固定状态机，内层按需拉 Agent Team。

研发交付这种场景，不应该一上来 dynamic team。更稳的是固定流程：

每个阶段里，如果出现并行价值，再拉 team。比如 TechPlan 阶段，让 architect、risk-reviewer、implementation-estimator 并行；CodeReview 阶段，让 security-reviewer、performance-reviewer、test-reviewer 对抗检查。

这里还有一个 Claude Code 没完全补齐的点：每个 worker 必须产出 artifact，不只是发消息。

```json
{
  "artifactId": "review-security-001",
  "type": "review_report",
  "producer": "security-reviewer",
  "taskId": "task-auth-review",
  "summary": "Found two medium issues in token refresh handling.",
  "evidence": [
    {
      "file": "src/auth/token.ts",
      "line": 87,
      "claim": "Refresh token accepted without rotation check"
    }
  ],
  "verdict": "needs_fix",
  "createdAt": "2026-05-21T10:20:00+08:00"
}
```

Message 里只传 artifact pointer：

```json
{
  "to": "team-lead",
  "type": "artifact_ready",
  "artifactId": "review-security-001",
  "summary": "Security review complete, needs_fix"
}
```

这个模式才能避免 Mailbox 变成第二个垃圾场。

## 我的判断

Claude Code Agent Teams 最值得看的，不是它能不能自动拉几个 teammate，而是它把多 agent 协作拆成了几个非常明确的工程部件：

- Team lead
- Independent teammate sessions
- Shared task list
- Mailbox
- Hooks / quality checks
- Local state
- Display / observability
- Permission inheritance
- Cost boundary

这些东西合在一起，才叫 Agent Teams。少了 task list，就是群聊；少了 mailbox，就是外包；少了 hooks，就是自嗨；少了权限和成本边界，就是烧钱加扩大事故半径。

我现在对它的评价是：方向非常对，产品形态很超前，但现阶段更像一个可运行的设计样板，而不是可直接照搬的生产级编排层。

对个人开发者来说，它已经能解决不少复杂 review、并行调研、跨模块拆分的问题。对想做超级 Agent 的人来说，它真正的价值是告诉你：**多 agent 的重点从来不是"多"，而是能不能被管住。**

管不住，5 个 teammate 只是 5 倍混乱。管得住，3 个 teammate 才像一个团队。

---

资料参考：

- Claude Code Agent Teams 官方文档：https://code.claude.com/docs/en/agent-teams
- Claude Code Tools Reference：https://code.claude.com/docs/en/tools-reference
- Claude Code Costs：https://code.claude.com/docs/en/costs
- Claude Code Agent View：https://code.claude.com/docs/en/agent-view
- Claude Code Subagents：https://docs.anthropic.com/en/docs/claude-code/sub-agents
