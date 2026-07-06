# Hermes-Agent 官方 Kanban 深度实测：让商业 CLI 工具当 Orchestrator

## Ch01.401 Hermes-Agent 官方 Kanban 深度实测：让商业 CLI 工具当 Orchestrator

> 📊 Level ⭐⭐ | 11.7KB | `entities/hermes-agent-kanban-deep-test-by-wjjagi-2026.md`

## 核心结论

Hermes-Agent 的真正核心是 **Gateway（端口 8642）**，Chat 和 TUI 只是两个不同的前端载体。 上层用商业 Code CLI 做 Orchestrator（认知/控制层），下层用 Hermes-Agent 做执行框架（执行层），中间用 Gateway API + MCP 协议打通。

这种分层架构的优势在于：商业 CLI 工具（如 [Claude Code](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-architecture.md)）具备深度推理和子代理分发能力，适合做认知层；而 Hermes-Agent 的 Kanban 系统提供稳定的多 worker 并发执行能力，适合做执行层。

## Kanban 架构设计

### 数据库与并发控制

Kanban 采用 SQLite WAL 模式，数据库路径为 `~/.hermes/kanban.db`。 所有状态更新走 CAS（Compare-And-Swap）机制：读版本号 → 写更新 → 失败重试，这种设计有效避免了并发脏写问题。

### 任务状态机

任务在以下状态之间流转：

```
triage → todo → ready → running → blocked → done → archived
```

- **triage**：任务初始分解阶段，由辅助 LLM 自动分解
- **todo**：待认领状态
- **ready**：准备执行（依赖已满足）
- **running**：执行中
- **blocked**：被阻塞（失败或等待条件）
- **done**：已完成
- **archived**：已归档

### 调度器（Dispatcher）

Dispatcher 嵌在 Gateway 进程里，每 60 秒 tick 一次，执行以下操作：

1. 收割僵尸子进程
2. 回收过期的任务认领（默认 15 分钟 TTL）
3. 检测崩溃的 worker PID
4. 把依赖全部完成的 todo 任务提升为 ready
5. 原子性认领并派生 worker

### Worker 启动命令

```bash
hermes -p <assignee> --skills kanban-worker chat -q "work kanban task <id>"
```

Worker 的 stdout/stderr 重定向到日志文件（2MB 自动轮转），并使用 `start_new_session=True` 脱离 TTY，防止被终端信号误杀。 工具权限严格限制：kanban_show/complete/block/heartbeat/comment/create/link，worker 只能操作自己被分配的任务 ID。

## 七条实测踩坑记录

### Bug 1：终端超时与 Kanban 运行时长的断层

**最隐蔽，影响最大。** 两个完全独立的超时层：

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

这种情况表明 worker 进程并未真正僵死，而是处于某种阻塞状态，可能与 [任务编排](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) 的异常处理机制有关。

### Bug 5：Triage Specifier 缺失配置时任务无限挂起

官方文档推荐用 triage 状态让辅助 LLM 自动分解任务。但如果 `config.yaml` 里没有配置 `auxiliary.triage_specifier` 模型，triage 任务会永远停在 triage 状态，调度器不会自动提升。

### Bug 6：日志轮转只有一代备份

Worker 日志是 `.log.1` 单代轮转，2MB 上限。对于需要跑十几分钟的 embed 任务，容量太容易打满。

### Bug 7：Board 切换存在竞态条件

`set_current_board` 在写入 current 指针文件之前不做存在性校验。

## 为什么 Gateway 才是本体

Hermes-Agent 的核心是一个跑在 `127.0.0.1:8642` 的 **aiohttp 守护进程**（Gateway），Chat 和 TUI 只是两个不同的前端载体。 Gateway 的 `APIServerAdapter` 暴露了一套非常完整的 API。

**建议**：把 Gateway 当成必选项，Chat/TUI 当成可选项。

这与 Gateway 模式的设计理念一致——将核心业务逻辑封装在稳定的网关层，前端交互层可以灵活替换。

## 上层 Orchestrator 选型对比

| 工具 | 核心优势 | 适合做 Orchestrator 原因 |
|------|---------|--------------------------|
| **Claude Code** | 深度推理 + 子代理分发 | 认知/控制层能力强 |
| **Kimi Code CLI** | 多模态输入 + Agent Swarm | 国内可用，多模态 |
| **官方 Kanban** | 多 worker 并发 | 执行层稳定，但编排层不成熟 |

 在认知/控制层的能力已经被广泛验证，而 Kimi Code CLI 则提供了国内可用的多模态输入能力。

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

该架构体现了 [多智能体系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md) 中的典型分层设计：Orchestrator 负责高层决策和任务分解，执行层负责具体任务执行。

## 实操建议

1. **Gateway 设为 systemd user unit 自启动** — 确保 Gateway 守护进程始终可用
2. 给 Kanban 任务显式设置 `max_runtime_seconds` 和 `max_retries` — 避免 Bug 1 和 Bug 2
3. 用 `/v1/runs` API 替代直接在 TUI 里操作 Kanban — 更可靠的编程接口
4. 不要依赖 Kanban 的自动 triage（配置缺失会无限挂起）— 明确 Bug 5 的规避方式
5. 监控 worker 日志，但别只看最后几行（注意日志轮转上限）— Bug 6 的实际影响

## 深度分析

1. **Gateway 才是本体，前端只是可选项**：Hermes-Agent 的核心是跑在 `127.0.0.1:8642` 的 aiohttp 守护进程，Chat 和 TUI 仅是两种不同的前端载体。这意味着 Gateway API 是稳定的核心接口，前端交互层可以灵活替换或叠加。

2. **分层编排架构比单体架构更符合工程现实**：实测证明「商业 CLI 做 Orchestrator（认知层）+ Hermes-Agent 做执行框架（执行层）」的组合，比强依赖官方 Kanban 的编排层更稳妥。官方 Kanban 在任务分解（triage）和异常恢复方面存在明显短板。

3. **SQLite WAL + CAS 是可靠的并发方案**：读版本号→写更新→失败重试的 CAS 机制，配合 60 秒 tick 的 Dispatcher 主动回收，设计上足够严谨。但 Bug 3（查询不存在的 `updated_at` 列）和 Bug 7（Board 切换竞态）说明工程实现与设计意图存在落差。

4. **超时层的不匹配是生产环境的隐形杀手**：Terminal timeout（默认 120 秒）和 Kanban max_runtime_seconds（默认无上限）是两个正交的维度。Bug 1 揭示了一个典型陷阱：worker 进程活着，但任何单条 shell 命令都活不过 120 秒，导致任务「看似成功」实则未完成。

5. **Worker 进程隔离是双刃剑**：`start_new_session=True` 防止信号误杀，但 Bug 4（进程僵死但 ps 能看到）和 Bug 5（triage 无限挂起）说明当 worker 异常时，外部观察手段有限，调度器的主动回收机制（15 分钟 TTL）是最后防线。

## 实践启示

1. **Gateway 部署为 systemd user unit**：确保守护进程始终可用，不要依赖手动启动。配合 `restart=always` 和 `RestartSec=5s` 实现自愈。

2. **给每个 Kanban 任务显式配置超时和重试上限**：`max_runtime_seconds` 设置为预估时间的 1.5 倍，`max_retries` 至少设为 3，以抵御 Bug 1 和 Bug 2（激进断路器）带来的流水线卡死风险。

3. **用 `/v1/runs` API 替代 TUI 操作 Kanban**：编程接口更可靠，便于监控和错误恢复。TUI 适合调试，生产环境应使用 API 或 SDK。

4. **永远不要依赖自动 triage（除非确认配置了 `auxiliary.triage_specifier`）**：Bug 5 的根因是配置缺失导致 triage 任务永久挂起。工程实践中，先手动将任务分解到 todo 状态，再交给调度器处理。

5. **Worker 日志监控要兼顾轮转和深度**：`2MB + .log.1` 单代轮转意味着对于长任务，只能看到最近 2MB 日志。配合 `tail -F` 而非 `tail -f`，并定期存档日志文件以防覆盖。

## 相关框架

- [Hermes Agent Goal And Kanban](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-goal-and-kanban.md) — Hermes Agent 基础教程（/goal + Kanban）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-kanban-deep-test-by-wjjagi-2026.md)

---

