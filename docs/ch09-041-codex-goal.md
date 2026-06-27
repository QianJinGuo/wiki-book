# Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本

## Ch09.041 Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本

> 📊 Level ⭐⭐ | 12.3KB | `entities/codex-goal-source-code-deep-dive.md`

# Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-goal-source-code-deep-dive.md)

## 摘要

阿里技术麦艮廷 2026-05-23 的源码深度解析。Codex `/goal` 不是 Todo、不是 prompt、不是一句"继续做到完成"，而是一套 **thread_goals 表 + 状态机 + 预算账本 + 自动续跑机制**。它把"目标"工程化为一个数据库对象，带四态状态机（active/paused/budget_limited/complete）、三权分立（get/create/update）、七项自动续跑前置条件、多边界 token 记账、以及 `<untrusted_objective>` 防 prompt injection 的边界标签。

## 深度分析

### 1. 核心结论：目标是数据库对象，不是 prompt

`/goal` 最反直觉的设计是把"目标"当作**第一类持久对象**，而不是对话上下文里的一个变量：

- 它有自己的表（thread_goals）
- 它有自己的状态机（4 个状态 + 转移条件）
- 它有自己的预算账本（token 计数 + 时间计数）
- 它有自己的续跑协议（七项前置条件 + 自动触发）

这套设计的目标是让"长任务失真"变成可控工程问题。

### 2. thread_goals 表（完整源码）

```sql
CREATE TABLE thread_goals (
    thread_id TEXT PRIMARY KEY NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    goal_id TEXT NOT NULL,
    objective TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'budget_limited', 'complete')),
    token_budget INTEGER,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    time_used_seconds INTEGER NOT NULL DEFAULT 0,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
);
```

关键设计点：

- **goal_id**：每次创建/替换目标生成新 goal_id，用 `expected_goal_id` 保护异步错位（用户中途替换目标时，旧 turn 的账不会糊到新 goal）
- **四个状态**：`active / paused / budget_limited / complete`——`budget_limited ≠ complete`，避免预算用完后自欺欺人写漂亮总结

把目标存进数据库而不是塞进 prompt 的好处：可以被查询、被回滚、被审计。

### 3. 三个 Goal 工具的权限设计

| 工具 | 权限 |
|------|------|
| `get_goal` | 读取目标状态 |
| `create_goal` | 仅用户/系统明确要求时创建；已有 goal 时创建失败（不覆盖） |
| `update_goal` | **只能把 status 改成 "complete"**（不能暂停/恢复/改 objective） |

**权限拆分的工程哲学**：

- 模型负责理解目标和判断完成
- 用户负责暂停/恢复/清除/替换目标
- 系统负责记账（预算到了自动改成 budget_limited）

模型不能自己暂停或修改目标，只能宣布完成——这条边界避免了"模型累了所以放弃"或"模型觉得目标不对所以擅改"这两个常见失控。

### 4. 自动续跑的 7 个前提条件

源码中的条件检查（全部满足才会续跑）：

1. goal 功能必须开启
2. 当前不能是 Plan mode
3. 当前不能已经有 active turn
4. 不能有排队的用户输入
5. 不能有 trigger-turn mailbox 里的待处理项
6. 线程必须是持久线程（ephemeral thread 不支持 goal）
7. 数据库里读到的 goal 必须还是同一个 goal_id

**不是"模型停了就催一句继续"，而是 Harness 判断现场确实空了、目标还在、用户没新输入、模式允许推进。** 这种"现场清空 → 状态合法 → 才续跑"的链式检查比简单的 `while not done: continue` 健壮得多。

### 5. Budget 账本：边界记账时机

不是在最后算总账，而是在多个边界上记账：

- turn 开始时记录 token baseline
- 工具完成后计算 token delta
- turn 结束时补最后一笔
- 用户中断时先记账，再暂停 goal
- 外部 UI 改 goal 前先把当前进度结清
- 线程恢复后重新恢复 active goal 的运行时状态

**预算用完的处理**：不杀掉当前 turn，而是注入提示：

> "目标已经达到 token 预算。不要再为这个 goal 开始新的实质工作。尽快收尾，总结进展、剩余工作和下一步。"

注意是 **steer（转向）** 而不是 **abort（中止）**——这避免了"写到一半突然被砍"导致的状态半成品问题。

### 6. objective 长度限制：4000 字符

超过则提示用户把长说明放进文件，用 `/goal follow the instructions in docs/goal.md` 引用。

设计理由：

- goal 不应该变成第二个超长 prompt
- 目标本身保持短，详细要求放在可维护文件里
- 文件可被 Git 管、被人改、被 Agent 读

这条边界防止 `/goal` 退化成"超长 prompt 换皮"，迫使团队把"目标"和"任务说明"分离。

### 7. `<untrusted_objective>` 安全防护

```xml
<untrusted_objective>
{{ objective }}
</untrusted_objective>
```

objective 是**用户数据**，不是更高优先级的系统指令。目标可以告诉模型要做什么，但不能趁机变成 prompt injection。这条边界把"目标内容"和"系统提示词"在 token 序列上做了结构区分。

### 8. Completion Audit 的真实含义

不是简单问"你觉得做完了吗"，而是要求拿目标逐项对照**现实证据**：

- 把目标重述成具体交付物或成功标准
- 建 prompt-to-artifact checklist
- 检查相关文件、命令输出、测试结果、PR 状态
- **不要把"做了很多""测试过了""看起来差不多"当成完成证据**
- 有缺口就继续做，不要标记完成

这是 `update_goal` 工具能"宣布完成"的硬性前置检查。

### 9. Plan mode 会忽略 goal continuation

Plan mode 让模型先想清楚，不要自己动手。active goal 不能在后台自己跑。这条边界避免了"用户让模型先规划，但模型因为 goal 还 active 所以又开始执行"的冲突。

### 10. 状态栏不是装饰

TUI 显示：

- `Pursuing goal (40K / 50K)`
- `Goal paused (/goal resume)`
- `Goal unmet (4K / 5K tokens)`
- `Goal achieved (10h 12m)`

把目标状态变成**用户可见的契约**。用户可以随时看到当前进度、剩余预算、目标状态，而不是只能从对话末尾推断。

### 11. 源码细节速查

- `MAX_THREAD_GOAL_OBJECTIVE_CHARS = 4000`
- budget limit 会 **steer** active turn without aborting（不改杀掉，而是 steer）
- 完成时调用 update_goal 前会补最终 token 账，要求模型报告最终预算使用情况
- 用户打断时会先记账再改成 paused（不是直接丢掉状态）

## 实践启示

1. **目标是数据库对象，不是 prompt 变量**：把目标持久化、可查询、可回滚是长任务失真的根解。任何让 agent 跑 30 分钟以上的 harness 都应该考虑这个抽象。

2. **三权分立 = 模型 / 用户 / 系统各管一摊**：模型只能"宣布完成"、用户管 pause/resume/replace、系统管 token budget 自动触发。这种边界设计避免了"模型累了自己放弃"或"模型觉得目标不对擅改"等失控模式。

3. **续跑前置条件比"while not done"更可靠**：七项前置条件链式检查——现场清空、目标合法、用户无新输入、模式允许——比简单的循环 retry 健壮得多。任何自动续跑机制都应该问"现场确实空了吗"再决定"继续"。

4. **预算用完 steer 而不 abort**：写到一半被砍会产生半成品状态。Codex 的做法是注入收尾提示，让模型主动收尾，比硬性 kill 更可控。

5. **状态栏是用户契约，不是装饰**：把 `Pursuing goal (40K / 50K)` 这种进度暴露到 UI 上，让用户对 agent 当前在干什么有真实感知，而不是只能从对话末尾倒推。

6. **目标 ≤ 4000 字符，长说明放文件**：goal 不应该变成超长 prompt。这条边界迫使"目标"和"任务说明"分离——目标是契约，说明是可维护资产。

## 相关实体

- [你不知道的 Agent原理架构与工程实践 V2](/ch04-455-你不知道的-agent-原理-架构与工程实践/)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](/ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering/)
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/)
- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](/ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验/)
- [Agent Reliability Engineering Skillify Continuous Improvement](/ch04-054-agent-可靠性的工程解法-从-skillify-看持续改进机制/)
- [Agent Harness Context Management Working Set](/ch04-036-hermes-agent-eval-harness-skill-7-taskset-harnessadapt/)
- [Anthropic 95Pct Data Analysis Jiagoux Data Level Harness 20260606](/ch01-284-数据级-harness-架构师-jiagoux-解读-anthropic-95-数据分析与-5-个反直觉边界/)
- [Impeccable Frontend Design Skill Harness Vibecoder](/ch01-262-impeccable-把-ai-前端设计变成可检查的工作流-33-4k-star-开源项目深度分析/)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-goal-source-code-deep-dive.md)

---

