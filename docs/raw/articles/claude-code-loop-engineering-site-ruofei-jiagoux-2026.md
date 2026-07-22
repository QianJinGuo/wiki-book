---
title: "Claude Code /loop 工程现场：碎片化自动、状态文件、运行卡片"
source_url: "https://mp.weixin.qq.com/s/JZzmhbuuc407bj-KttDJog"
ingested: 2026-06-30
sha256: 4088fd262a7e950d1cba0b88627a2cd10e434535ce8d5c32705c63fd6052982e
type: raw
tags: [claude-code, loop, loop-engineering, scheduled-tasks, goal, loop-md, state-file, running-card, jiagoux]
author: 架构师（JiaGouX）
---

## /loop 的核心定位：会话内观察员

/loop 不是"全自动编程"，更贴近的说法是**碎片化自动**。它适合接管工程师日常里的碎片等待：CI 还在跑、部署还没结束、PR 评论可能有新回复、某个接口刚恢复。

这些事单次都不重，却很容易打断注意力。/loop 让 Claude Code 在当前会话里隔一会儿醒来，替我们看一次状态。有变化就带回证据，没变化就短说；碰到凭证、权限、生产配置这类边界，就停下来让人接手。

## /loop 基础用法

需要 Claude Code v2.1.72 或更高版本。

三种写法：

| 写法 | 更适合什么 |
|------|-----------|
| `/loop 5m <prompt>` | 明确知道每隔多久检查一次 |
| `/loop <prompt>` | 状态变化节奏不确定，让 Claude 自己决定间隔 |
| `/loop` | 当前会话已有上下文，只想让它继续做默认巡检 |

空跑 `/loop` 时，Claude 使用内置的 maintenance prompt，继续处理当前会话里没完成的事（PR 评论、失败 CI、合并冲突）。项目里有 `.claude/loop.md` 时，空跑会优先使用这个文件里的默认 prompt。

边界：在 Bedrock、Vertex AI 和 Microsoft Foundry 上，空跑 `/loop` 只会打印用法说明。

## /loop 的运行细节

- 跟着当前 Claude Code 会话走，新开会话会清掉
- `--resume` 或 `--continue` 可以恢复还没过期的任务
- 递归任务 7 天后自动过期
- Claude 正在回复时，到点任务会排队，等当前 turn 结束后再跑
- 错过的触发不会补跑一堆，只会在空下来后跑一次
- 固定时间任务会有一点 jitter，不适合精确到秒的调度
- 想看或取消任务：`what scheduled tasks do I have?`、`cancel the deploy check job`
- `/loop` 等下一轮时按 Esc 可以停掉后续 wakeup

## /loop 与 /goal 的区别

| 特性 | /loop | /goal |
|------|-------|-------|
| 适合 | 隔一会儿看一次 | 持续推进到一个可验证条件成立 |
| 示例 | `/loop 5m check whether staging deployment finished` | `/goal all tests in test/auth pass and npm run lint exits 0` |
| 评估方式 | 无内置 evaluator | 小模型判断条件是否满足 |
| 条件 | 无 | 要能被证明（exit code、队列为空、文件数量低于阈值） |

`/goal` 的 evaluator 不会自己跑命令，只能看 Claude 已经放进对话里的证据。

## 状态文件模式

每一轮都从头解释背景会很快消耗大量 token。推荐使用状态文件：

```json
{
  "status": "idle",
  "last_check_time": "2026-06-30T10:00:00+08:00",
  "last_evidence": [],
  "blocked_reason": null,
  "check_count": 3
}
```

每一轮结果归为四类：

| 结果 | 含义 | 下一步 |
|------|------|--------|
| changed | 状态有变化，有新证据 | 汇报证据，再决定是否处理 |
| no_change | 没有新变化 | 短回复，继续等待 |
| blocked | 权限、凭证、生产配置卡住 | 停下来交给人 |
| done | 条件已经满足 | 总结证据，停止循环 |

## 运行卡片模式

/loop prompt 更适合写成一张小运行卡片，而不是一段愿望。一段可用的 /loop prompt 通常要说清五件事：

| 部分 | 要回答的问题 |
|------|------------|
| 状态 | 先读哪里，怎么继承上一轮 |
| 范围 | 本轮只看哪些对象 |
| 证据 | 什么结果算有变化 |
| 动作 | 什么时候允许处理 |
| 停止 | 哪些情况交还给人 |

示例：等 CI
```
/loop 5m
Check the current PR's CI status.
If all checks pass, summarize the result in one short paragraph.
If any check fails, fetch the failing job name and the most relevant error lines.
Do not modify files unless I explicitly ask you to.
```

示例：PR 评论监控
```
/loop 15m
Check whether new review comments appeared on the current PR.
Group new comments by file and severity.
Mark unclear or architectural comments as needs-human.
If there are no new comments, reply with "no new review comments".
```

## loop.md 文件

项目级路径：`.claude/loop.md`
用户级路径：`~/.claude/loop.md`

适合放默认巡检 prompt，但不要写成第二份项目说明。CLAUDE.md 管的是 Agent 进仓库前先知道什么；loop.md 管的是空跑 /loop 时默认做什么。

loop.md 超过 25,000 bytes 的内容会被截断。

## 进阶：从观察走向执行

当 /loop 开始做更多事（自动分派修复、开 PR、更新 Linear、通知 Slack），需要补三样东西：

1. **Skill** — 重复使用的项目规则、排查步骤、命令路径，放进 Skill 让 loop 调用
2. **隔离的工作区** — 独立 worktree 或独立分支，跑偏时影响范围清楚
3. **验证者** — 写代码的 Agent 和验收结果的角色分开（测试、CI、reviewer subagent 或人）

## 第一版适用性判断

| 问题 | 适合 /loop 的信号 |
|------|-----------------|
| 需要隔一会儿再看吗 | CI、部署、PR、队列、外部状态 |
| 每次检查成本低吗 | 读状态、读日志、查接口 |
| 有明确证据吗 | exit code、job status、comment、queue depth |
| 失败能分类吗 | 暂时失败、凭证失败、无变化、需人工 |
| 需要长期无人值守吗 | 不太适合，只靠会话会偏脆弱 |
| 需要直接改生产吗 | 不太适合，第一版先报告 |
