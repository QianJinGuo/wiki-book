# Agent 如何管理其他 Agent：四种 Sub Agent 模式

## Ch04.292 Agent 如何管理其他 Agent：四种 Sub Agent 模式

> 📊 Level ⭐⭐ | 8.5KB | `entities/four-sub-agent-patterns-2026.md`

# Agent 如何管理其他 Agent：四种 Sub Agent 模式

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/four-sub-agent-patterns-2026.md)

## 摘要

主 Agent 调度子 Agent 的四种模式，按对子 Agent 生命周期的控制程度由低到高：**内联工具**（call_agent，函数调用语义）→ **Fan-Out**（spawn + wait，批量并行）→ **Agent Pool**（spawn + send_message + list + kill，跨轮次持久）→ **Teams**（Agent 间直接互发消息，主 Agent 退到监督位）。每升一级对模型能力、工程复杂度、Debug 难度都显著抬升。

## 核心要点

- **四模式对照**：

| 模式 | 核心工具 | 主 Agent 角色 | 子 Agent 生命周期 |
|------|---------|--------------|----------------|
| 内联工具 | `call_agent` | 调用方 | 单次任务 |
| Fan-Out | `spawn_agent`, `wait_agent` | 调度方 | 单次任务 |
| Agent Pool | `spawn`, `send`, `wait`, `list`, `kill` | 协调方 | 多轮持久 |
| Teams | 以上全部 + 跨 Agent `send_message` | 监督方 | 持久化 |

- **结果收集机制随模式升级而变**：模式 1 结果内联在工具返回值；模式 2 通过 `wait_agent` 批量收集；模式 3 逐消息增量到达；模式 4 只有 Agent 主动汇报才能被主 Agent 看到
- **适用任务规模与模型能力正相关**：模式 1-2 小模型即可；模式 3 需跨轮次追踪状态；模式 4 每个 Agent 都需前沿级别
- **Teams 模式引入新的工程难题**：死锁检测、冲突解决（两 Agent 同改一文件）、关闭协调、消息链 Debug

## 深度分析

### "由低到高"的本质是控制粒度，而非能力升级

四种模式的区分轴是**主 Agent 对子 Agent 生命周期的控制程度**：模式 1 中子 Agent 是"不可见的纯函数"，主 Agent 只见输入输出；模式 4 中子 Agent 是"对等节点"，主 Agent 几乎不可见它们之间的事。这与分布式系统里的 actor 隔离级别演进（进程内函数 → 进程 → 线程池 → 集群服务）同构——**每一次升级都换得更多自主性，但也丧失更多可控性**。当主 Agent 用 `call_agent` 时，它知道子 Agent 在干什么；用 `send_message` 时只能假设子 Agent 在按对的方向走；Teams 时则完全放弃观测，只剩"启动-收汇报"两点接触。**这种"可见性递减"是 Multi-Agent 系统调试噩梦的根源**——你看不到链路上发生了什么。

### 模式 1（内联工具）应当是默认起点

原文指南明确写"从模式 1 出发"，并指出"很多感觉需要多 Agent 协作的任务，用精心设计的内联工具调用就能搞定"。这个建议看似保守，实则是经验之谈：**Multi-Agent 工程的真正成本在协调与 Debug，而不在子 Agent 本身的实现**。一个 `call_agent` 调用的失败是局部问题；一个 Teams 中 A 等 B、B 等 A 的死锁是分布式系统级问题。**"先 Inline，需要时再升级"是规避过早分布式设计的实用原则**——类比微服务架构里"先 Monolith，必要时再拆"的同样道理。

### 模式 2 的"启动-等待分离"是真正的并发范式

Fan-Out 模式区分于模式 1 的关键是 `spawn_agent` 立即返回 ID，`wait_agent` 独立控制时序。这带来两个能力：

1. **启动和收集解耦**：主 Agent 可以"先把三个子任务全 spawn 出去，然后做自己的事（比如汇总已收到的结果、整理上下文），再 wait"——这是真正的并行编程模型，不是"同步阻塞链"。
2. **可以退化到同步语义**：spawn 后立即 wait 等价于模式 1 的同步调用，但保留了"中间穿插做主 Agent 自己的工作"的能力。**这种"可降级"的 API 设计让调用方按需切换复杂度，是好工具设计的标志**。

### 模式 3（Agent Pool）的关键是"跨轮次状态"

模式 3 与模式 2 的本质区别是**子 Agent 不再是"一次性工人"，而是"长期雇员"**。这意味着：

- 子 Agent 有自己的 memory / context window 状态，可被多次复用
- 主 Agent 可以中途发补充指令、纠偏（模式 1-2 都没这能力）
- 引入 `list_agents` / `kill_agent` 工具是配套的——管理一组长期对象需要 lifecycle control

**这个模式适合"专家 Agent 之间路由"**：比如让 research-agent 调研 A 主题、让 writer-agent 起草、让 critic-agent 审稿，主 Agent 充当 PM 角色来回调度。**这正是 Claude Code sub-agent、CrewAI 等框架默认提供的抽象**。

### 模式 4（Teams）的工程挑战是"分布式系统经典问题回归"

Teams 模式下 Agent 间直接 `send_message`，主 Agent 退到监督位。这带来经典分布式系统问题：

1. **死锁检测**：A 等 B 回复、B 等 A 回复——必须设计 timeout + 死锁检测器
2. **冲突解决**：两个 Agent 同时改一个文件——需要锁或版本控制
3. **关闭协调**：如何让所有 Agent 知道"任务结束了"——需要 termination protocol
4. **Debug 困难**：消息链跨多个 Agent，trace 极难

**这些问题在分布式系统领域已经被研究几十年，结论一致：能不分布式就不分布式，能同步就不同步**。Multi-Agent 设计应同此原则：**Teams 模式只用于任务规模大到协调逻辑超出单个 Agent 管理能力上限的硬需求**，其他情况都用更简单的模式。

### "结果收集方式"是最容易被忽视的语义差异

模式 1 的结果是同步返回的工具值，模式 2 是批量 wait 收集，模式 3 是逐消息增量，模式 4 是主动汇报。这影响主 Agent 的 context 管理：

- 模式 1：单个工具返回，进入主 Agent context 像普通工具调用
- 模式 2：批量结果可能一次性塞满主 Agent context（10 个子 Agent × 长报告 = context 爆炸）
- 模式 3：流式到达，主 Agent context 增量增长
- 模式 4：只有汇报才到主 Agent，其余对主 Agent 透明

**模式 4 的"透明性"既是优势（降低主 Agent context 压力）也是劣势（失去可观测性）**。这与微服务调用链追踪问题同构——一旦跨进程边界，observability 难度陡增。

## 实践启示

1. **默认从模式 1 出发**，只有当 `call_agent` 真的不够（需要中途纠偏、查进度、并行无依赖任务）时才升到模式 2
2. **小模型/便宜模型只跑模式 1-2**：模式 3-4 对模型能力要求陡升，让 GPT-3.5 跑 Teams 等于找死
3. **模式 2 的"启动-等待分离"是真正的并发原语**：spawn 后立即 wait 等价同步；spawn 后穿插做主 Agent 工作再 wait 才发挥 Fan-Out 优势
4. **模式 4 (Teams) 的死锁、冲突、关闭协调问题需要预先设计协议**：timeout、锁、termination message 等分布式系统基础设施复用
5. **设计工具时考虑"可降级"**：spawn + wait 的 API 既支持同步也支持异步，比"只有同步 call"或"只有异步 spawn"更灵活
6. **监控 Agent 通信链是 Teams 模式的前置条件**：没有 tracing 工具不要上模式 4，Debug 成本会失控

## 相关实体

- [Openai Codex 521 Update Appshots Goal Computer Use](ch04/150-ai.md)
- [Codex Goal Six Hour Run](ch09/052-codex-goal-six-hour-run.md)
- [Agent Self Improvement Six Mechanisms](ch03/044-agent.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [Kimi Work Codex Vibe Working Paradigm Shift](ch01/436-codex.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

