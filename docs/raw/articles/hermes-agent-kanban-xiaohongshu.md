---
title: "Hermes Agent 推出 Kanban 多 agent 调度"
source_url: "https://www.xiaohongshu.com/explore/69f9a0df0000000038037336"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, hermes, kanban, multi-agent, scheduling]
ingested: 2026-07-02
sha256: a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8
---

# Hermes Agent 推出 Kanban 多 agent 调度

Nous Research 的 Hermes Agent 推出 Kanban 调度系统，将 multi-agent 协作搬到看板。

## Kanban 核心架构

**6 列状态**：Triage → Todo → Ready → In progress → Blocked → Done

In progress 默认按 profile 分 lane，区分不同 Worker 的工作。

**5 个核心对象**：task、run、assignee、dispatcher、tenant

**三个界面共享同一份 SQLite**：dashboard（:9119）、CLI、worker tools

## 人机交互

**人类操作**：
- `hermes kanban create` 建任务，`--parent` 串依赖
- `hermes kanban show` 看任务，`runs` 看历史
- `hermes kanban unblock` 解卡，`watch` 实时收事件
- Dashboard 在 `http://127.0.0.1:9119`
- 聊天 slash 命令 `/kanban unblock $TASK`
- `notify-subscribe` 后熔断/完成/超时事件直接 ping Telegram/Discord/Slack

**Worker 4 步循环**：
1. 抓卡进 In progress
2. 调 `kanban_show` 拿到 worker_context（含父任务 summary + 自己上轮 attempts）
3. 干活时 `kanban_heartbeat` 发心跳
4. 收尾调 `kanban_complete(summary, metadata)`。卡住就 `kanban_block(reason)`

## 核心优势

**Retry 是一等公民**：每次 attempt 是 task_runs 一行永远留档。第二次派来的 worker 在 worker_context 看到上轮 reason，不重读 spec 就知道补什么。crashed、blocked、completed 都是合法 outcome，进程死了 dispatcher 自动重派。

**Handoff 是结构化数据**：kanban_complete 写的 summary + metadata 自动流给下游 worker，不用翻 comments 翻输出文件。

**跨界面一致**：dashboard、CLI、worker tools 共享 SQLite，谁动都同步。

**原生熔断**：spawn 失败 3 次自动 gave_up，避免无限 retry 把看板搅乱。
