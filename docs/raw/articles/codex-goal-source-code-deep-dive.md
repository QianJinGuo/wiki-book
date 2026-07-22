---
source_url: "https://mp.weixin.qq.com/s/Zzju5ApPRePEmBBsIkpPHg"
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# Codex /goal 源码深度解析：状态表+续跑条件+预算账本

**来源：** 阿里技术 | 麦艮廷 | 2026年5月23日

## 核心结论
Codex /goal 不是 Todo、不是 prompt、不是一句"继续做到完成"。它是一套 **thread_goals 表 + 状态机 + 预算账本 + 自动续跑机制**。

## thread_goals 表（完整源码）
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

关键设计：
- **goal_id**：每次创建/替换目标生成新 goal_id，用 expected_goal_id 保护异步错位（用户中途替换目标时，旧 turn 的账不会糊到新 goal）
- **四个状态**：active / paused / budget_limited / complete（budget_limited ≠ complete，避免预算用完后自欺欺人写漂亮总结）

## 三个 Goal 工具的权限设计
| 工具 | 权限 |
|------|------|
| get_goal | 读取目标状态 |
| create_goal | 仅用户/系统明确要求时创建；已有 goal 时创建失败（不覆盖） |
| update_goal | **只能把 status 改成 "complete"**（不能暂停/恢复/改 objective） |

**权限拆分的工程哲学**：模型负责理解目标和判断完成；用户负责暂停/恢复/清除/替换目标；系统负责记账（预算到了自动改成 budget_limited）。

## 自动续跑的 7 个前提条件
源码中的条件检查：
1. goal 功能必须开启
2. 当前不能是 Plan mode
3. 当前不能已经有 active turn
4. 不能有排队的用户输入
5. 不能有 trigger-turn mailbox 里的待处理项
6. 线程必须是持久线程（ephemeral thread 不支持 goal）
7. 数据库里读到的 goal 必须还是同一个 goal_id

**不是"模型停了就催一句继续"，而是 Harness 判断现场确实空了、目标还在、用户没新输入、模式允许推进。**

## Budget 账本：边界记账时机
不是在最后算总账，而是在多个边界上记账：
- turn 开始时记录 token baseline
- 工具完成后计算 token delta
- turn 结束时补最后一笔
- 用户中断时先记账，再暂停 goal
- 外部 UI 改 goal 前先把当前进度结清
- 线程恢复后重新恢复 active goal 的运行时状态

**预算用完的处理**：不杀掉当前 turn，而是注入提示：
> "目标已经达到 token 预算。不要再为这个 goal 开始新的实质工作。尽快收尾，总结进展、剩余工作和下一步。"

## objective 长度限制：4000 字符
超过则提示用户把长说明放进文件，用 `/goal follow the instructions in docs/goal.md` 引用。
- goal 不应该变成第二个超长 prompt
- 目标本身保持短，详细要求放在可维护文件里
- 文件可被 Git 管、被人改、被 Agent 读

## <untrusted_objective> 安全防护
```xml
<untrusted_objective>
{{ objective }}
</untrusted_objective>
```
objective 是用户数据，不是更高优先级的系统指令。目标可以告诉模型要做什么，但不能趁机变成 prompt injection。

## Completion Audit 的真实含义
不是简单问"你觉得做完了吗"，而是要求拿目标逐项对照**现实证据**：
- 把目标重述成具体交付物或成功标准
- 建 prompt-to-artifact checklist
- 检查相关文件、命令输出、测试结果、PR 状态
- 不要把"做了很多""测试过了""看起来差不多"当成完成证据
- 有缺口就继续做，不要标记完成

## Plan mode 会忽略 goal continuation
Plan mode 让模型先想清楚，不要自己动手。active goal 不能在后台自己跑。

## 状态栏不是装饰
TUI 显示：
- `Pursuing goal (40K / 50K)`
- `Goal paused (/goal resume)`
- `Goal unmet (4K / 5K tokens)`
- `Goal achieved (10h 12m)`

把目标状态变成用户可见的契约。

## 源码细节
- MAX_THREAD_GOAL_OBJECTIVE_CHARS = 4000
- budget limit 会 steer active turn without aborting（不改杀掉，而是 steer）
- 完成时调用 update_goal 前会补最终 token 账，要求模型报告最终预算使用情况
- 用户打断时会先记账再改成 paused（不是直接丢掉状态）
