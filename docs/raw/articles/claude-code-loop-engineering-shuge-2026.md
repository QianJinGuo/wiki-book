---
source_url: https://mp.weixin.qq.com/s/9P05ILwlDU5xCocDBU9nUA
ingested: 2026-07-28
sha256: 59e0d9af7c5d53a2b509a2fdd9d15a3bbc06413c004aca0a1de2be8e5f4df8fb
source_published: 2026-07-28
title: "Anthropic 官方拆解 Claude Code Loop 工程：4 层能力、2 起事故、30 轮卡住的根因"
author: 术哥无界/运维有术
feed_name: 运维有术
---

# Anthropic 官方拆解 Claude Code Loop 工程：4 层能力、2 起事故、30 轮卡住的根因

## 四层 Loop 类型

| Loop 类型 | 特点 | 适合场景 | 关键边界 |
|----------|------|---------|---------|
| **Turn-based** | 检查动作 | 探索、临时修改、小任务 | 验收主要靠人 |
| **Goal-based** | 有停止条件 | 有明确验收标准的长任务 (`/goal`) | 需 v2.1.139+，条件 ≤ 4,000 字符 |
| **Time-based** | 定时检查外部状态 | `/loop` 本地 / `/schedule` 云端 Routine | 本地 session ≤ 50 task, recurring 7 天到期 |
| **Proactive** | 整套提示和流程重复 | `/schedule` + `/goal` + Skills + Dynamic Workflows | 每 run ≤ 1,000 agent, 并发 ≤ 16 |

## Turn-based (第一层)

最基础的 Agentic Loop：每发一条 prompt 即启动一个手动 Loop。验收主要靠人。建议将人工检查步骤写进 SKILL.md（前端改动必须打开页面、脚本必须拿样例跑一遍等）。

## Goal-based (第二层)

`/goal` 需要 Claude Code v2.1.139+。核心：给 Claude 一个完成条件，跨多轮持续工作，评估模型（默认 Haiku）判断条件是否满足。

**关键约束**：
- 评估模型不会自己跑命令、读文件，只看会话中已出现的证据
- 一个 session 同时只能有 1 个 active goal
- 条件最长 4,000 字符
- 用 `/goal` 看状态，`/goal clear` 停止

**真实事故 (#58348)**：用户 `/goal` 条件引用了一个未注册的 Skill，评估者一直说「没法验证」，循环跑了 30+ 次没停。

## Time-based (第三层)

`/loop` 本地循环：`/loop 5m check my PR, address review comments`
`/schedule` 云端 Routine：跑在 Anthropic-managed infrastructure 上

**真实事故 (#64744)**：`/loop` 取消异常（ScheduleWakeup 没正常取消），跑了 864 次、约 72 小时、约 300 美元。

## Proactive (第四层)

事件或日程触发 → Claude 自己启动、拆任务、调 Skills、设目标、拉起 Dynamic Workflows 和多个子 Agent。需要 Claude Code v2.1.154+ 支持 Dynamic Workflows。

**主要约束**：
- 每 run 总计最多 1,000 个 agent
- 同时最多 16 个并发 agent
- Workflow script 不能直接访问文件系统或 shell
- 仅能在同一 session 内 resume

## 落地四步走

1. **先写验证型 Skill** — 把「完成前必须检查什么」写进 SKILL.md
2. **把清晰任务交给 `/goal`** — 需要明确终点（测试通过、构建通过等）
3. **用 `/loop` 看外部状态** — 设合理间隔和 turn 上限
4. **再考虑 Routine + Dynamic Workflows** — 任务稳定重复才值得做成 Routine
