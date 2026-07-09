# Hermes Agent /goal 长任务运行时架构

## Ch04.358 Hermes Agent /goal 长任务运行时架构

> 📊 Level ⭐⭐ | 7.8KB | `entities/hermes-agent-goal-runtime-architecture.md`

## 元信息
- **作者**：AI 小老六（微信公众号）
- **日期**：2026-05-19
- **评分**：v×c = 9×9 = 81（strong，4星）
- **参考**：Hermes Agent v0.13.0 Release Notes、Claude Code /goal、Codex /goal

## 核心洞察
Agent 长任务的核心瓶颈不在 Token，而在**会话记忆堆积导致的 Dumb Zone**。Ralph Loop 的解决方向：不要把长期记忆放在聊天记录里，文件系统和 Git 比模型上下文更适合承载长期状态。
**/goal 的本质**：把 Agent 的交互单位从"回复"改成"完成条件"。目标被系统外化，Agent 不需要在聊天里"记住自己还有一个目标"。

## 四大运行时部件
| 部件 | 职责 | Hermes 体现 |
|------|------|------------|
| 目标状态 | 可持久化的目标对象 | `GoalState`（SessionDB） |
| 生命周期接口 | 开始/暂停/恢复/清理/完成 | `GoalManager` |
| 完成判定 | 每轮结束后判断是否继续 | `judge_goal()` |
| 继续调度 | 未完成时触发下一轮 | CLI `_pending_input` / Gateway FIFO |

## GoalState 设计要点
`GoalState` 解决了四个实际问题：
1. **跨会话持久化**：`SessionDB.state_meta` 存储，中途关终端明天可 `/goal resume`
2. **执行预算控制**：`max_turns` 默认 20 轮，防止无限循环
3. **失败模式记忆**：`consecutive_parse_failures` 超阈值自动暂停
4. **目标细化**：`subgoals` 支持执行中追加约束

## Judge 判定策略：保守优先
**只有三类情况认为 DONE**：
1. Agent 明确确认完成
2. 最终交付物已产生且满足目标
3. 目标无法继续（权限缺失/依赖不可访问/需求矛盾）
**其他默认 CONTINUE**——false positive（误判完成）的代价比多跑一轮更高。

## fail-open 异常保护
Judge API 失败/返回空/非 JSON → 先返回 continue；连续解析失败达阈值 → 自动暂停。这在"遇到一点波动就停止"和"明知判定坏了还继续跑"之间留了合理台阶。

## 与 Codex CLI / Claude Code 的关键差异
**持久化**：Hermes 用 SessionDB 真正实现跨会话 goal，其他方案偏 session-based。这是自托管/多入口场景的基础设施差异。

## 深度分析
**Dumb Zone 困境与外部状态解法**
长任务最核心的瓶颈不是 Token 多少，而是上下文堆积导致的模型质量下滑——Dumb Zone。Ralph Loop 提出的解法朴素但有效：不要把长期记忆放在聊天记录里。文件系统和 Git 比模型上下文更适合承载长期状态，Agent 每轮从干净输入开始，通过代码、文档、测试结果接住上一轮进展。会话可以丢，工作目录不能丢。
**/goal 的控制平面抽象**
/goal 本质是把 Agent 的交互单位从"回复"改成"完成条件"。目标被系统外化后，后续每一轮都由运行时重新注入必要信息，Agent 不需要在聊天里"记住自己还有一个目标"。四大运行时部件（目标状态、生命周期接口、完成判定、继续调度）合在一起，让 Agent 从"等用户说继续"变成"知道自己还没干完"。
**GoalState 的工程价值**
GoalState 解决了四个实际工程问题：跨会话持久化（SessionDB 存储，中途关终端明天可 resume）、执行预算控制（max_turns 默认 20 轮）、失败模式记忆（consecutive_parse_failures 超阈值自动暂停）、目标细化（subgoals 支持执行中追加约束）。这四点让长任务从"一口气跑完"变成"可中断可恢复的可控流程"。
**Judge 保守策略的经济学**
Judge 判定故意偏保守——只有三类情况认为完成：Agent 明确确认、交付物已产生且满足目标、目标无法继续（权限缺失/依赖不可访问/需求矛盾）。false positive（误判完成）的代价通常比多跑一轮更高。这是一种经济决策：模型一轮调用的成本低于让任务在未完成状态下中断的风险。
**fail-open 是分层防御而非冒险**
Judge API 失败返回 continue、连续解析失败达阈值自动暂停——fail-open 设计不是盲目继续，而是一套分层防御机制：在"遇到一点波动就停止"和"明知判定坏了还继续跑"之间留了合理台阶。paused 态是关键缓冲层，网络抖动、预算耗尽、用户临时插话都不该把目标直接判死。

## 相关链接
- [Hermes Agent Goal And Kanban](ch04/358-hermes-agent-goal.html)

## 实践启示
**何时使用 /goal**
适合的场景：大型重构和依赖迁移、补齐测试、安全漏洞修复（有明确边界）、性能优化（有可量化指标）、长时间构建和报告生成。不适合：一两轮就能完成的小改动、需要高频人工选择的产品讨论、目标暂时说不清的探索性研究、需要实时确认权限或风险的操作。好目标的四要素：任务对象 + 完成条件 + 验证方式 + 边界约束。
**Judge 模型选型策略**
Judge 模型不必昂贵，但必须稳定。可为 goal_judge 单独配置快速廉价模型（如 google/gemini-3-flash-preview），主任务模型负责写代码读文档，Judge 只做窄判定。真正需要关注的是格式稳定性——Judge 的价值在于判定一致性而非判定智能。
**持久化是基础设施不是加分项**
对于跨天、跨终端、跨聊天平台的长任务，状态持久化不是加分项而是基础设施。SessionDB 实现让 /goal resume 成为可能，这是 session-based 方案做不到的。如果使用自托管或多入口场景，持久化能力是选择 Hermes Agent 的关键理由。
**子目标的使用时机**
subgoals 让用户在执行过程中补充约束，不必推翻原目标重来。当目标执行到一半发现遗漏了某个边界 case，或需要临时追加验证项时，/subgoal 比重新设定目标更高效。这是一种增量式目标管理，适用于需求在执行过程中逐渐清晰的长任务。

## 相关概念
- **Hermes Agent**：NousResearch 开源的 Agent 框架，v0.13.0 引入 /goal
- **Ralph Loop**：长程 Agent 执行模式理念，外部状态+显式停止条件替代聊天记忆
- **Dumb Zone**：上下文堆积导致 Agent 质量下滑的区域
- **Judge**：辅助模型负责窄判定（是否继续），可独立配置廉价 provider
- [Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](../ch05/050-harness-engineering.html)
- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md)
- [Codeindex · 让大模型更好地理解你的代码](../ch01/425-codeindex.html)
- [使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？](ch04/383-agent-skills.html)
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](../ch03/075-claude-code.html)
- [Claude Code Agent 工程设计](../ch03/067-claude-code-agent.html)
- [你不知道的 Agent 原理架构与工程实践](ch04/333-agent-principle-architecture-engineering-practice.html)
- [Ralph Loop 不够用：长时间 Agent 还缺这 3 件事](../ch03/045-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-goal-runtime-architecture-state-persistence-judge-closed-loop.md)

- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)

---

