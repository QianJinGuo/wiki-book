# 四种 Sub Agent 模式

## Ch04.304 四种 Sub Agent 模式

> 📊 Level ⭐⭐ | 8.1KB | `entities/four-sub-agent-patterns.md`

## 模式对比
| 模式 | 工具 | 主 Agent 角色 | Agent 生命周期 | 结果收集 |
|------|------|-------------|--------------|---------|
| 内联工具 | call_agent | 调用方 | 单次任务 | 工具返回值 |
| Fan-Out | spawn+wait | 调度方 | 单次任务 | wait_agent 批量 |
| Agent Pool | spawn+send+wait+list+kill | 协调方 | 多轮持久 | 逐消息增量 |
| Teams | 以上+跨Agent send | 监督方 | 持久化 | Agent主动汇报 |

## 内联工具（Inline Tool）
最简单模式。子 Agent 作为函数调用，结果内联返回。

- 同步：阻塞等结果
- 异步：立即返回 agent_id，结果后续通知
**适用**：自包含独立任务（资料查询、代码审查）。

## Fan-Out
启动和收集分离，模型控制时序。可以先穿插工作再等。
**适用**：多个相互独立的并行任务。

## Agent Pool
子 Agent 持久化，可发补充指令、查状态。
**适用**：多步骤协作工作流，主 Agent 充当信息路由。
**局限**：小模型易混淆多 Agent 状态。

## Teams
Agent 间直接通信，主 Agent 退幕后。
**适用**：协调逻辑超出单个 Agent 管理能力上限的大型任务。
**局限**：每个 Agent 需前沿级别模型；死锁检测、冲突解决是工程挑战。

## 选择原则
从模式 1 出发。小模型/便宜模型 → 模式 1 或 2。

## 深度分析
四种 Sub Agent 模式的核心差异在于**控制粒度**与**状态保留**的两个维度。
**控制粒度**指主 Agent 对子 Agent 任务执行过程的话语权。内联工具模式几乎没有任何过程控制能力——调用即等待，结果返回才知道偏差；Fan-Out 稍进一步，允许主 Agent 在等待期间穿插其他工作，但仍无法干预运行中的子 Agent；Agent Pool 赋予主 Agent 完整的生命周期管理权，可以随时发送补充指令、查询状态或强制终止；Teams 模式则将控制权进一步下放给子 Agent 自身，主 Agent 只在必要时介入。
**状态保留**指子 Agent 的上下文是否能跨任务持续存在。内联工具和 Fan-Out 模式中，子 Agent 每次执行都是独立的、单次性的——任务结束则 Agent 消亡，上下文无法复用；Agent Pool 和 Teams 模式则维持持久化 Agent 实例，跨多轮交互保持工作记忆，这使得渐进式协作成为可能。
**模式升级的决策树**可概括为三个问题：任务是否需要子 Agent 完成后才能继续？（否 → 考虑 Fan-Out；是 → 继续）任务中途是否可能需要补充信息或纠偏？（否 → 内联工具足够；是 → 继续）协作是否跨越多个独立步骤且需要跨轮次状态？（否 → Fan-Out；是 → Agent Pool）任务规模是否已超出单个 Agent 的协调能力上限？（否 → Agent Pool；是 → Teams）
值得注意的是，模式升级并非单向的。实际系统往往在同一工作流中混合使用多种模式——用内联工具处理简单查询，用 Fan-Out 并行处理多个独立任务，用 Agent Pool 管理需要多轮交互的核心工作流。
Teams 模式的工程挑战尤为突出。死锁检测（A 等 B，B 等 A）需要额外的健康检查机制；冲突解决（两 Agent 同时修改同一文件）需要锁或版本控制；关闭协调（graceful shutdown 所有 Agent）比单 Agent 系统复杂得多。这些都不是模型能力能独立解决的问题，需要在架构层面配套工程基础设施。

## 实践启示
**从模式 1 开始，在遇到真实瓶颈时才升级**。过早引入 Agent Pool 或 Teams 模式会引入不必要的系统复杂度——每个模式都带来额外的工程负担：Agent Pool 需要追踪多 Agent 状态，Teams 需要死锁检测和冲突解决机制。在原型阶段用内联工具快速验证任务可行性，确有需要再逐步升级。
**小模型/便宜模型强烈建议待在模式 1 或 2**。当子 Agent 需要调用前沿级别模型才能正确工作时，模式 4 的每个 Agent 成本会快速叠加。如果任务可以用更小的模型在模式 1 完成，就没有必要用前沿模型构建 Teams。成本和能力的平衡点是选择模式的关键变量。
**并行任务优先考虑 Fan-Out**。很多独立任务（如多个文件的代码审查、多个主题的资料查询）天然适合并行处理。Fan-Out 在保持简单性的同时提供了启动和收集的解耦，是性价比最高的并行化方案。
**Agent Pool 的状态管理是关键工程挑战**。当使用模式 3 时，主 Agent 需要准确追踪每个子 Agent 的状态——当前在做什么、是否在等待下一条消息、是否遇到了阻塞。这对模型的上下文管理能力有较高要求。建议在 Agent Pool 模式中引入显式的状态报告机制，让每个子 Agent 定期汇报自身状态，减少主 Agent 的状态追踪负担。
**Teams 模式需要配套工程基础设施**。在启用模式 4 之前，需要确认以下能力已就位：死锁检测（超时机制 + 图遍历检测循环依赖）、冲突解决（文件锁或 OT/CRDT 类协同机制）、统一日志和 trace（追踪跨 Agent 消息链）、graceful shutdown 流程。没有这些基础设施，Teams 模式一旦出问题几乎无法调试。
**混合模式是现实系统的常态**。大型工作流中，内联工具用于简单函数调用，Fan-Out 用于并行独立任务，Agent Pool 用于核心多步骤协作，Teams 用于需要真正分布式决策的子系统。理解每种模式的边界，才能在实际系统中做出正确的架构选择。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/four-sub-agent-patterns-2026.md)

## 相关实体
- [十年老技术开发的 AI Agent 探索之路](/ch04-266-十年老技术开发的-ai-agent-探索之路/)
- [OpenCLAW 完全指南](/ch04-199-openclaw-完全指南/)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](/ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布/)
- [基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](/ch01-587-trace2skill-把-轨迹里的局部经验-蒸馏成可迁移的-agent-skills/)

- [Agent Workflows](/ch04-306-agent-workflows/)
- [Hermes+Kimi K2.6 多Agent军团实战教程](/ch03-053-hermes-wiki-实战-obsidian-hermes-agent-自动生长知识网络的-9-步搭建法/)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](/ch04-192-要实现一个工作流选择-agent-skills-还是-ai-表格/)
- [Garry Tan](/ch01-497-garry-tan/)
- [Hermes Agent 新手上手指南](/ch04-418-hermes-agent/)
- Multi-Agent Systems
- [AI Agent 工程师能力地图](/ch04-139-ai-agent-工程师能力地图/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)
- MOC

---

