# Hermes-Agent Kanban 实测 — 商业 CLI 作为上层 Orchestrator

## Ch01.519 Hermes-Agent Kanban 实测 — 商业 CLI 作为上层 Orchestrator

> 📊 Level ⭐⭐ | 8.8KB | `entities/hermes-agent-kanban-deep-test.md`

## 核心结论
1. **Gateway（端口 8642）是 Hermes-Agent 的本体**，Chat 和 TUI 只是两个不同的前端载体
2. **2026 年 agent 架构主流共识**：把「不确定的认知层」和「确定的执行层」拆开
3. **推荐架构**：上层用商业 Code CLI（Claude Code/Kimi Code CLI）做 Orchestrator，下层用 Hermes-Agent 做执行框架，中间用 Gateway API + MCP 协议打通

## Kanban 技术架构
### 数据库与状态机
| 组件 | 实现 |
|------|------|
| 数据库 | SQLite WAL，`~/.hermes/kanban.db` |
| 并发控制 | CAS（Compare-And-Swap） |
| 状态机 | `triage → todo → ready → running → blocked → done → archived` |
| 调度器 | 嵌在 Gateway，每 60 秒 tick |

### 调度器 Tick 行为
1. 收割僵尸子进程
2. 回收过期任务认领（默认 15 分钟 TTL）
3. 检测崩溃的 worker PID
4. 把依赖完成的 todo → ready
5. 原子认领并派生 worker

### Worker 隔离机制
- 命令：`hermes -p <assignee> --skills kanban-worker chat -q "work kanban task <id>"`
- stdout/stderr → 日志文件（2MB 轮转）
- `start_new_session=True` 脱离 TTY
- 工具权限严格限制（只能操作自己被分配的任务 ID）

## 七条实测 Bug
| # | Bug | 严重程度 | 根因 |
|---|-----|---------|------|
| 1 | 终端超时与 max_runtime_seconds 断层 | 最高 | Terminal timeout(120s) 和 worker 生命周期独立，命令被 kill 但 worker 继续 |
| 2 | 断路器过于激进（DEFAULT_FAILURE_LIMIT=2） | 高 | 超时被打断算失败一次，环境未清理又失败，直接 blocked |
| 3 | Auto-maintain 查了不存在的列 updated_at | 中 | 代码和 schema 不匹配，超时检测逻辑从一开始就是摆设 |
| 4 | Worker 进程僵死 | 高 | 进程在但停止处理，kill 后才能继续 |
| 5 | Triage Specifier 未配置时任务无限挂起 | 中 | 依赖辅助 LLM 但配置缺失时调度器不提升状态 |
| 6 | 日志轮转只有 .log.1 一代（2MB） | 低 | 长任务日志容易打满 |
| 7 | Board 切换竞态条件 | 低 | set_current_board 不校验 board 存在性 |

## 关键架构洞察
### 为什么 Gateway 是本体
Gateway 是跑在 `127.0.0.1:8642` 的 **aiohttp 守护进程**，Chat 和 TUI 都只是前端适配器。真正的多平台消息适配能力在 Gateway 这一层，而不是在 Chat/TUI 里。

### 开源框架的通病
> 它们试图同时做好「认知层」和「执行层」，但两边都做不精。
Claude Code 的核心优势是**深度推理 + 子代理分发**。Kimi Code CLI 是**多模态输入 + Agent Swarm**。这两者都更适合做上层 Orchestrator。

## 实操建议
1. Gateway 设为 **systemd user unit** 自启动
2. 给 Kanban 任务**显式设置** `max_runtime_seconds` 和 `max_retries`
3. 用 `/v1/runs` API 替代直接在 TUI 里操作 Kanban
4. **不要依赖 Kanban 的自动 triage**（配置缺失会无限挂起）
5. 监控 worker 日志，**别只看最后几行**（注意 2MB 轮转上限）

## 深度分析
### Gateway 本体论：Agent 架构的认知层与执行层分离
作者的核心洞察是"Gateway（端口 8642）是 Hermes-Agent 的本体"。这个判断的深层含义是：Chat 和 TUI 都是 Gateway 的**前端适配器**，而非产品本身。这是一种典型的"平台即本体"架构思路——真正的多端消息适配能力集中在 Gateway，而两个前端只是交互界面的不同实现。 ^[实体内容分析]
这个设计的优势是：可以接入任何支持 HTTP 的客户端（网页、桌面、移动端），Gateway 负责所有协议转换和状态管理。劣势是：当 Gateway 本身有 bug 时，所有前端同时受影响，没有降级方案。

### 七条 Bug 的分类与根因
七条 bug 可以分为三类：
**第一类：生命周期管理失误（Bug 1, 4）**

- Bug 1（终端超时断层）：Terminal timeout 和 worker 生命周期独立运行，命令被 kill 后 worker 继续。根因是调度层和执行层使用了不同的超时机制，没有统一的生命周期管理器。
- Bug 4（Worker 进程僵死）：进程在但停止处理，说明 worker 的心跳机制缺失或不够robust。
**第二类：容错配置过于保守（Bug 2, 3, 5）**

- Bug 2（断路器过于激进）：DEFAULT_FAILURE_LIMIT=2 导致环境未清理就标记 blocked。这是用固定阈值代替自适应阈值的典型问题——真实环境中的偶发超时不应该直接触发断路。
- Bug 3（Auto-maintain 查不存在的 updated_at 列）：代码和 schema 不匹配，说明没有 schema 迁移的版本化管理。
- Bug 5（Triage 未配置时任务无限挂起）：调度器对辅助 LLM 的依赖没有降级方案。
**第三类：边缘交互问题（Bug 6, 7）**

- Bug 6（日志轮转只有 .log.1 一代）：日志系统的设计没有考虑长任务场景。2MB 轮转对短任务够用，对小时级任务不够。
- Bug 7（Board 切换竞态条件）：set_current_board 不校验 board 存在性，属于输入验证缺失。

### Claude Code / Kimi Code CLI 作为上层 Orchestrator 的合理性
作者推荐用商业 Code CLI 做 Orchestrator，下层用 Hermes-Agent 做执行框架。这个架构分层有其内在逻辑：
Claude Code 的核心能力是**深度推理 + 子代理分发**，这正是 Orchestrator 需要的能力——理解复杂任务、拆解子任务、分发给执行者。而 Hermes-Agent Kanban 的核心能力是**状态管理 + 调度执行**，这是执行层需要的能力。
Kimi Code CLI 的**多模态输入 + Agent Swarm** 特性，更适合做需要多视角输入的复杂任务编排。
两个层的能力边界清晰，组合起来形成完整的 Agent 闭环。

## 相关链接
- [Hermes Agent Goal And Kanban](../ch04/359-hermes-agent-goal.html)

## 实践启示
### 对 Hermes-Agent Kanban 使用者的建议
1. **Gateway 必须 systemd 自启动**：Gateway 是本体，任何意外终止都会导致所有任务丢失。建议配置为 user unit 并设置自动重启。
2. **显式设置 max_runtime_seconds 和 max_retries**：默认值的容错空间不够生产使用。对于需要长时间运行的任务（如大型重构），runtime 设置要留足 buffer。
3. **不要依赖自动 triage**：Triage Specifier 配置复杂且存在 bug，建议用手动创建任务并指定状态的方式代替自动 triage，避免任务无限挂起。
4. **监控 worker 日志的全貌而非末尾**：2MB 轮转上限意味着最后的日志会覆盖更早的内容。对于长任务，需要关注完整的执行链路而非只看最后几行。

### 对 Agent 架构设计者的建议
1. **生命周期必须统一管理**：Terminal timeout 和 worker 生命周期分离是 Bug 1 的根因。正确做法是所有执行单元共享一个生命周期管理器，超时信号统一发出，所有相关组件同步响应。
2. **断路器阈值需要可配置且带冷却机制**：固定阈值在真实环境中会产生误触。建议断路器支持：a）可配置阈值；b）冷却窗口；c）半开状态试探。
3. **Schema 变更必须版本化管理**：Auto-maintain 查不存在的列是 schema 和代码版本不匹配的结果。建议引入 schema migration 工具，每次 schema 变更都生成 migration 文件。
4. **外部依赖必须有降级方案**：当辅助 LLM（如 Triage Specifier）不可用时，调度器不应无限等待。建议设置超时并降级到默认策略。

### 对多框架组合架构的建议
采用"上层 Orchestrator + 下层执行框架"组合时，关键设计原则：
1. **协议层用标准接口**：Gateway API + MCP 协议是合理的组合，因为两者都是公开标准，不绑定特定供应商。
2. **状态必须单点管理**：Orchestrator 负责任务状态，执行框架负责执行状态，两者通过 API 同步，不各自独立维护状态副本。
3. **超时传递必须端到端**：从 Orchestrator 发起的任务，其超时设置必须能传递到执行层的每一个 worker，不能各层独立计时。

## 来源
- 知乎专栏：https://zhuanlan.zhihu.com/p/2036955913249105049
- 作者：wjjAGI
- 发布：2026-05-10

## 相关实体
- [Claude Code 设计原则与对照分析](../ch03/075-claude-code.html)
- [Claude Code 架构解析](../ch03/075-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-kanban-deep-test-by-wjjagi-2026.md)

- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/075-claude-code.html)

---

