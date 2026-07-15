# Codex Goal Six Hour Run

## Ch09.058 Codex Goal Six Hour Run

> 📊 Level ⭐⭐ | 11.0KB | `entities/codex-goal-six-hour-run.md`

## 概述

**`/goal`** 是 OpenAI Codex CLI v0.128.0（2026-04-30）中引入的持久化目标工作流特性，使 AI Agent 能够在数小时的暂停后无缝恢复执行，而无需人工重新输入提示词。

这一特性的核心价值在于将"长时间连续任务"从"需要人工盯守的会话"转变为"预先定义好成功合约的自主运行体"——任务启动后，工程师的职责从实时监控转向提前设计（目标定义、验收标准、反模式边界）。

## 核心机制

### 持久化目标状态

`/goal` 将目标描述持久化到 app-server 的状态存储中，而非仅存在于 Codex 进程的内存里。这使得目标状态能够跨越以下场景存活：

- **终端关闭**：进程终止，但目标记录仍在 app-server
- **笔记本休眠**：数小时后唤醒，app-server 状态仍在
- **多小时暂停**：5.5 小时的暂停期间目标不丢失

### 运行时续跑（Runtime Continuation）

恢复时，Codex 不需要用户手动输入指令，而是自动注入一条 developer message，提示模型继续执行。这区别于传统的"重新运行 prompt"模式——上下文从断点处延续，而非重新开始。

### 目标生命周期工具

模型获得专用工具用于目标生命周期管理：

- `task_complete` / `TASK_COMPLETE` 信号：声明任务已完成
- 目标状态查询：查看当前目标进度
- 续跑请求：模型可主动请求继续

## 实测案例：6 小时 44 分钟连续任务

| 指标 | 数值 |
|------|------|
| **Wall time** | 6h 44min |
| **实际模型计算时间** | ~41 分钟 |
| **累计输入 tokens** | ~6.8M |
| **Cache hit rate** | ~94% |
| **上下文压缩次数** | 1 次（~6.7M tokens 触发） |
| **最终状态** | `TASK_COMPLETE` |
| **模型** | `gpt-5.5`，reasoning effort: high |

### 任务背景

- **项目类型**：TypeScript monorepo（语音面试系统，含端到端场景）
- **配置**：`approval_policy = "never"`，`sandbox_mode = "danger-full-access"`
- **Prompt 设计**：~600 words，含 XML-style 块、阅读列表、工作规则、`done_when` 合约、反模式围栏
- **Timeline**：21:19 提交 → 21:20 首轮（57s 后中断）→ 5.5 小时暂停 → ~02:50 自动续跑 → `TASK_COMPLETE`

### 关键观察

1. **模型自文档化能力**：在 artifact 中明确标注了上游 TTS 库的 first-byte timing 字段无法测量的客观限制，而非自行填补空白数据
2. **Cache 效率**：94% 的 cache hit rate 意味着上下文压缩仅触发一次，整个长任务期间上下文演进高度连续
3. **续跑无人工介入**：5.5 小时暂停后模型自动从断点续跑，无需用户输入任何内容

## 与 Claude Code Ralph Wiggum Loop 的对比

Ralph Wiggum Loop 是 Claude Code 生态中通过外部脚本和 Git history 实现长任务接力的机制。两者在设计哲学上有根本差异：

| 维度 | Ralph Wiggum Loop | `/goal` |
|------|-------------------|---------|
| **实现方式** | Shell 脚本或外部插件 | 内置于 Codex CLI |
| **状态持久化** | Git history + 磁盘文件 | App-server APIs，原生目标状态 |
| **恢复行为** | 手动重新调用 | 自动 runtime continuation |
| **上下文管理** | 每次迭代独立 fresh context | 会话内自动压缩，连续演进 |
| **推理连续性** | 迭代间无状态 | 会话内持续积累 |
| **适用模型** | Claude Code | Codex (gpt-5.5) |
| **最佳场景** | 需要"每轮新鲜眼睛"的任务 | 长时间跨度、上下文演进关键的任务 |

## 深度分析

### 1. 持久化目标状态改变了 AI 运行的可用性边界

`/goal` 将目标状态从进程内存迁移到 app-server 状态存储，突破了传统会话模型的核心限制：进程终止 ≠ 任务终止。 这意味着 5.5 小时的暂停不会导致任务失败，笔记本休眠不会丢失上下文。对于需要数小时运行的代码重构、测试套件执行或文档生成任务，这种可靠性改变了对 AI 运行可行性的判断标准。

### 2. 94% Cache Hit Rate 证明上下文积累有长期价值

在 6.8M 累计输入 tokens 的长任务中，94% 的 cache hit rate 意味着上下文压缩（context compaction）仅触发一次。 这与传统的"每轮刷新上下文"模式形成鲜明对比——结构化的长任务中，前序上下文对后续推理有持续价值，而非需要定期清除的负担。上下文演进（context evolution）是有价值的资产。

### 3. "从 supervisor 到 architect"的范式转变将质量责任前移

Old 范式下，工程师是 supervisor——监控 AI 运行，随时准备干预。New 范式下，工程师是 architect——提前设计成功合约（`done_when` 合约），然后撒手。 这意味着质量决定因素几乎完全前移：prompt 设计、`done_when` 合约、反模式围栏、阅读列表——这些在第一轮运行前就已决定最终质量。运行期的质量主要由设计期决定。

### 4. 自动续跑消除人工恢复的上下文断层

传统长任务中断后，用户需要手动重新输入上下文、重新描述目标，这个恢复过程本身就会丢失信息。 Runtime continuation 通过自动注入 developer message 续跑，实现了真正的无缝恢复——模型从断点处继续执行，用户不需要重新输入任何内容。这对于跨越夜间、跨越时区的长任务特别有价值。

### 5. 适用边界清晰，避免了"全能工具"误区

文章明确列出了 `/goal` 不适用的五类场景——成功标准未定义、探索性工作、安全关键路径、外部依赖不明确、短任务。 这种清晰的边界定义是成熟的工程思维：知道一个工具的局限性比知道它的能力更重要。"合约设计"模式要求在任务开始前就明确验收标准，这对于需要人工反馈的探索性工作确实不适用。

## 实践启示

1. **用 `done_when` 合约替代开放式目标**：在提交长任务前，必须明确定义"任务完成"的验收标准。 `done_when` 合约不是可选的装饰，而是整个运行模式的基石。没有清晰的合约，长任务就失去了质量锚点。

2. **反模式围栏（anti-pattern fences）是质量保险**：在 prompt 中明确标注"不要做什么"与"要做什么"同样重要。 特别是对于长时间运行的任务，AI 可能在一个错误方向上走很远，反模式围栏提供了早期的干预机会。

3. **设计适合长任务累积的上下文结构**：阅读列表、工作规则、XML-style 块结构——这些 prompt 设计实践不是形式主义，而是为模型提供了长时间推理所需的参考框架。 短、模糊的 prompt 在短任务中勉强可用，但在 6 小时运行中会被上下文膨胀迅速放大缺陷。

4. **对于需要"新鲜眼睛"的任务，Ralph Wiggum Loop 更适合**：如果任务每一轮都需要重新审视代码现状（例如大规模重构中需要持续判断），每次迭代的 fresh context 反而是优点。 工具选择应基于任务性质，而非单一工具的流行度。

5. **跨模型审查时避免同一模型的盲区**：文章提到 Claude 模型写的代码让 Codex 审查，反之亦然。 不同模型的知识结构和关注点不同，交叉审查能显著提高问题发现率。在团队中建立机制让不同模型交叉审查，能利用各自模型的独特优势。

## 适用边界

`/goal` 并非所有场景的最优选择。以下情况应避免使用：

1. **成功标准未定义**：`done_when` 合约是必需的，非可选
2. **探索性工作**：早期"先摸清这个代码库"阶段受益于人工反馈
3. **安全关键路径**：认证系统、支付流程、敏感数据处理
4. **外部依赖不明确**：在第 5 小时突然撞墙的风险高
5. **短任务**：10 分钟以下的交互工作不值得引入 overhead

## 范式转变

> **Old**: Autonomous AI runs are sessions you monitor, ready to intervene when things go sideways.
> **New**: Autonomous AI runs are contracts you write upfront, then get out of the way.

这一转变将工程师角色从 **supervisor（监督者）** 重塑为 **architect（架构师）**：

- **质量决定因素前移**：Prompt 质量、成功标准、反模式围栏、阅读列表——这些在第一轮运行前就已决定最终质量
- **运行期职责极简**：任务启动后，工程师的介入频次大幅降低
- **上下文演进价值**：长时间连续运行的上下文积累是有价值的，而非需要每次"刷新"的问题

## 相关实体

- [Codex /goal：长任务Agent的目标运行时](../ch04/106-codex-goal-agent.html) — 若飞源码级拆解，目标状态机 + completion audit 协议 + budget_limit 收束模板
- [Claude Code / OpenClaw Memory 对比](../ch03/076-claude-code.html) — 记忆架构与 Codex 的对比参考
- [Anthropic Claude Code 大型代码库最佳实践](../ch01/339-anthropic-claude-code.html) — Claude Code 在大规模代码库中的实践
- [Claude Code Session 管理 1M Context](../ch03/076-claude-code.html) — 长上下文会话管理

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openai-developer-ecosystem.md)
## 相关概念

- [Multi-Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md) — 多 Agent 协作框架
- [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) — 生产级 Agent 工程实践
- [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — 推理效率优化（cache hit rate 相关）

## 原始存档

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-goal-six-hour-run.md)

---

