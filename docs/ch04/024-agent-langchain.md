# 改进 Agent：数据挖掘视角与 LangChain 实践

## Ch04.024 改进 Agent：数据挖掘视角与 LangChain 实践

> 📊 Level ⭐ | 2.8KB | `entities/agent-improvement-data-mining-trace-framework.md`

# 改进 Agent：数据挖掘视角与 LangChain 实践

> LangChain Labs 研究员 Viv 提出：持续学习、Harness 工程、后训练本质上都归结为同一件事——大规模地整理数据，用于运行实验、改进 Agent。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-improvement-data-mining-trace.md)

## 核心框架

### Trace 是 Agent 改进的「货币」

Agent 的行为比传统代码更不透明。我们用确定性换取了自主性，然后用 Trace 填补理解鸿沟。Trace 是 Agent 在环境中经验的投影，转化为可挖掘、可理解的数据格式。

### 数据整合闭环

| 方式 | 说明 |
|------|------|
| SFT/RL 整合回权重 | 收集训练数据微调模型 |
| Harness 工程 | 增加指令、工具、技能、编排策略 |
| 记忆库整合 | 用于上下文检索 |

### Harness vs 微调三明治

**Harness 工程 → 微调 → Harness 工程**

- Harness 工程：即时反馈、高带宽，适合大多数团队
- 微调：遇到智能天花板后，整理数据进行更长反馈周期的实验
- 再次 Harness 工程：探索新模型能力边界

### 核心公式

评测集 = Agent 的训练数据。找到好数据 + 找到好的拟合函数 = 改进 Agent。

## LangChain 实践

- **Trace Judge Model**：微调开源小模型处理大规模 Trace，在窄任务上优于闭源前沿模型且成本低数个数量级
- **LangSmith Engine**：专用 Agent 阅读每条 Trace，发现信号、生成修复、生成评测集
- **Terminal Bench 2.0**：通过 Harness 调优 + Trace 理解取得 13.7% 提升

## 关键概念

- **Scaling Dreaming（规模化造梦）**：在大规模数据、长时间跨度上，将 Agent 数据整合回 Agent 本身
- **稠密反馈信号**：Trace 让反馈信号比简单标量奖励更丰富

## 关联

- [Agent vs Workflow 控制权连续谱](ch04/606-agent-vs-workflow.html) — Agent 工程化
- [Loop Engineering](../ch05/007-loop-engineering.html) — Agent 循环决策与 Harness 工程的交叉
- [Spec Kit/OpenSpec/Superpowers 融合 Harness](../ch05/048-openspec.html) — Harness 工程实践

---

