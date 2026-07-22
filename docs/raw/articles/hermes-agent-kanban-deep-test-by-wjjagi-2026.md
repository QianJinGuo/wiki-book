---
source_url: https://zhuanlan.zhihu.com/p/2036955913249105049
title: "Hermes-Agent 官方 Kanban 深度实测：让商业 CLI 工具当 Orchestrator"
author: wjjAGI
published: 2026-05-10
platform: Zhihu
ingested: 2026-05-20
review_value: 9
review_confidence: 10
review_recommendation: strong
review_stars: 5
sha256: b4d8c6fe7860b760821613b56e81d371ed3997111fb49f7abe2d51847924a0a7
---
---
# Hermes-Agent 官方 Kanban 深度实测：让商业 CLI 工具当 Orchestrator
> 实测结论：在官方编排成熟之前，用 Claude Code / Kimi Code CLI 作为上层 Orchestrator，让 Hermes-Agent 专心做下层执行框架，是目前更稳妥的工程实践。
## 核心结论
- Hermes-Agent 的真正核心是 **Gateway（端口 8642）**，Chat 和 TUI 只是两个不同的前端载体
- 上层用商业 Code CLI 做 Orchestrator（认知/控制层），下层用 Hermes-Agent 做执行框架（执行层），中间用 Gateway API + MCP 协议打通
## Kanban 架构设计
### 数据库与并发控制
- SQLite WAL 模式，路径 `~/.hermes/kanban.db`
- 所有状态更新走 CAS（Compare-And-Swap）—— 读版本号 → 写更新 → 失败重试，避免并发脏写
### 任务状态机
```
triage → todo → ready → running → blocked → done → archived
```
### 调度器（Dispatcher）
嵌在 Gateway 进程里，每 60 秒 tick 一次：
1. 收割僵尸子进程
2. 回收过期的任务认领（默认 15 分钟 TTL）
3. 检测崩溃的 worker PID
4. 把依赖全部完成的 todo 任务提升为 ready
5. 原子性认领并派生 worker
### Worker 启动命令
```bash
hermes -p <assignee> --skills kanban-worker chat -q "work kanban task <id>"
```
- stdout/stderr 重定向到日志文件（2MB 自动轮转）
- `start_new_session=True` 脱离 TTY，防止被终端信号误杀
- 工具权限严格限制：kanban_show/complete/block/heartbeat/comment/create/link，worker 只能操作自己被分配的任务 ID
## 七条实测踩坑记录
### Bug 1：终端超时与 Kanban 运行时长的断层
**最隐蔽，影响最大。**
两个完全独立的超时层：
- `Terminal timeout`：单条 shell 命令最长执行时间，**默认 120 秒**
- `Kanban max_runtime_seconds`：整个 worker 进程最长存活时间，**默认无上限**
**问题**：worker 可以活 3600 秒，但任何单条 shell 命令超过 120 秒就会被 terminal 层 kill。`qmd update` + `qmd embed` 在 CPU 模式下跑十几分钟正常，但每 120 秒就被掐断，worker 以为执行成功继续往下走，实际索引根本没做完。
**解法**：给 Kanban 任务显式设置合理的 `max_runtime_seconds`，或在任务设计时拆分长命令。
### Bug 2：默认断路器过于激进
```python
DEFAULT_FAILURE_LIMIT = 2  # 连续失败两次就 blocked
```
任务因终端超时被打断算一次失败；worker 进程重启后环境变量没清理干净又失败——两次用完，任务直接变 blocked，整条流水线卡住。
### Bug 3：Auto-maintain 脚本查询了不存在的列
```python
# harness-auto-maintain.py 第 198-200 行
result2 = subprocess.run(
    ["sqlite3", str(KANBAN_DB),
     "SELECT MIN(updated_at) FROM tasks WHERE status='running';"]
)
# 问题：tasks 表根本没有 updated_at 列
```
这个查询每次都返回 NULL，「检测 worker 是否超时」的逻辑从一开始就是摆设。
### Bug 4：Worker 进程僵死
- `ps aux` 能看到 node 子进程还在
- 但数据库 pending 计数 10 分钟没变
- 日志不再滚动
- `kill` 掉进程后重新启动 qmd embed，进度立刻开始推进
### Bug 5：Triage Specifier 缺失配置时任务无限挂起
官方文档推荐用 triage 状态让辅助 LLM 自动分解任务。但如果 `config.yaml` 里没有配置 `auxiliary.triage_specifier` 模型，triage 任务会永远停在 triage 状态，调度器不会自动提升。
### Bug 6：日志轮转只有一代备份
Worker 日志是 `.log.1` 单代轮转，2MB 上限。对于需要跑十几分钟的 embed 任务，容量太容易打满。
### Bug 7：Board 切换存在竞态条件
`set_current_board` 在写入 current 指针文件之前不做存在性校验。
## 为什么 Gateway 才是本体
Hermes-Agent 的核心是一个跑在 `127.0.0.1:8642` 的 **aiohttp 守护进程**（Gateway），Chat 和 TUI 只是两个不同的前端载体。Gateway 的 `APIServerAdapter` 暴露了一套非常完整的 API。
**建议**：把 Gateway 当成必选项，Chat/TUI 当成可选项。
## 上层 Orchestrator 选型对比
| 工具 | 核心优势 | 适合做 Orchestrator 原因 |
|------|---------|--------------------------|
| **Claude Code** | 深度推理 + 子代理分发 | 认知/控制层能力强 |
| **Kimi Code CLI** | 多模态输入 + Agent Swarm | 国内可用，多模态 |
| **官方 Kanban** | 多 worker 并发 | 执行层稳定，但编排层不成熟 |
## 推荐工程架构
```
商业 CLI (Orchestrator/认知层)
    ↓  Gateway API + MCP
Hermes-Agent (执行层)
    ↓
Gateway (127.0.0.1:8642)
    ↓
各平台 Adapter (Telegram/Discord/Slack...)
```
## 实操建议
1. **Gateway 设为 systemd user unit 自启动**
2. 给 Kanban 任务显式设置 `max_runtime_seconds` 和 `max_retries`
3. 用 `/v1/runs` API 替代直接在 TUI 里操作 Kanban
4. 不要依赖 Kanban 的自动 triage（配置缺失会无限挂起）
5. 监控 worker 日志，但别只看最后几行（注意日志轮转上限）
## 相关框架
- [[entities/hermes-agent-goal-and-kanban]] — Hermes Agent 基础教程（/goal + Kanban）