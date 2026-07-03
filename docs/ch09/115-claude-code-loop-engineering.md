# Claude Code Loop Engineering 完整攻略

## Ch09.115 Claude Code Loop Engineering 完整攻略

> 📊 Level ⭐⭐ | 4.8KB | `entities/claude-code-loop-engineering-guide.md`

# Claude Code Loop Engineering 完整攻略

基于兔兔AGI（技术极简主义）的 Loop Engineering 实战指南，系统讲解如何设计让工作自己推进的循环系统。

## 核心观点

Boris Cherny （Claude Code 负责人）：

> I'm no longer prompting Claude. I'm just running a loop that prompts him and then thinks about what to do next. My job is to write loops.

身份转变：从「输入提示词的人」变成「设计提示词系统的人」。

## 演进三阶段

| 年份 | 范式 | 核心问题 |
|------|------|----------|
| 2024 | Prompt Engineering | 一句话怎么问得好 |
| 2025 | Multi-Agent Orchestration | 多个任务怎么分派得开 |
| 2026 | Loop Engineering | 整个流程怎么自己转得动 |

## Loop 三种形态

### 1. 单 Agent 循环

研究 → 起草初稿 → 对照目标检查 → 修复薄弱区域 → 重复，直到超出标准

一个 Agent 反复迭代，改到满意才交付。

### 2. 多 Agent 舰队循环（Fleet Loop）

Orchestrator → Specialist → Sub-agent 的树状结构，构成「发现 → 规划 → 执行 → 验证」的持续闭环。

### 3. Open-loop vs Closed-loop

| 维度 | Open-loop（开环） | Closed-loop（闭环） |
|------|------------------|-------------------|
| 自由度 | 高，可自主探索多条路径 | 低，在预设路径内运行 |
| Token 消耗 | 极高 | 可控 |
| 适用场景 | 探索性任务 | 执行性任务 |
| 当前成熟度 | 成本是硬伤 | 真正产出成果的模式 |

**先跑稳 Closed-loop，再考虑 Open-loop 做探索。**

## 理论基础

### ReAct：推理 + 行动

思考 → 行动 → 观察 → 思考 → ... → 最终答案

ReAct 是 Loop 的引擎，每一次「改 → 跑 → 看 → 改」就是一次循环迭代。

### Reflexion：失败即燃料

任务执行 → 失败 → 用自然语言反思失败原因 → 存入记忆 → 下次尝试时使用

Reflexion 是 Loop 的学习机制，落地形式是 SKILL.md 和 progress.txt。

## Claude Code 内置 Loop 工具

| 命令 | 触发方式 | 适用场景 | 版本 |
|------|---------|---------|------|
| /loop | 时间驱动 | 轮询检查类任务 | — |
| /goal | 目标驱动 | 有明确完成标准的任务 | v2.1.139 |
| Dynamic Workflows | AI 自编工作流 | 超大规模复杂任务 | v2.1.154 |

从 /goal 开始试最不容易出错。

## 双层结构

| 层级 | 范围 | 目的 | 状态维护 |
|------|------|------|----------|
| Inner Loop | 单任务内 | 提升任务可靠性 | 上下文窗口内 |
| Outer Loop | 跨会话 | 随时间持续改进 | 持久化文件（SKILL.md、progress.md） |

Inner Loop 决定这一轮跑不跑得通，Outer Loop 决定下一轮还踩不踩同一个坑。

## 「5+1」工程组件（Addy Osmani）

| 组件 | 作用 | 关键提醒 |
|------|------|----------|
| Automations | 让 Loop 自己跑起来 | 必须有停止条件 |
| Worktrees | 多 Agent 并行时避免文件冲突 | 只解决机械冲突 |
| Skills | 项目知识不丢失 | 没有 Skills 每轮都在重新理解 |
| Plugins | 让 Agent 接入真实工具链 | 权限边界要提前锁死 |
| Sub-agents | 分离生成与验证 | 高风险环节才启用 |
| + Memory | 跨会话不遗忘 | 没有 Memory 每次都是从头再来 |

## 四个设计原则

1. **从小闭环开始**：先跑通一个「10 分钟内能验证」的小 Loop
2. **每个 Loop 必须有停止条件**：验证通过 / 达到上限 / 标记挂起
3. **让 Outer Loop 形成经验复利**：每次结束花 30 秒更新 lessons.md
4. **认知要跟得上代码**：定期 Review Loop 产出，设计者对输出质量负责

## 金句

> 设计循环，而不是提示词。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-loop-engineering-guide-tutuangi-2026.md)

---

