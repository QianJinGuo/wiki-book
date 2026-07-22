---
title: "Agent 还是 Workflow？取决于你愿意把多少控制权交给模型"
source_url: "https://mp.weixin.qq.com/s/sY9iWpC1YW6cuIhuXbAzsw"
source_site: "凡人修AI传"
author: "凡人修AI传"
ingested: "2026-07-08"
sha256: "f53233b258ddf4bba225368b3cbe95cecdbff2540932f507bf3e81b2eb3f5893"
type: raw
tags:
  - agent
  - workflow
  - architecture
  - control
  - enterprise-ai
  - engineering
  - decision-framework
---

> Workflow 是把智能放进流程。Agent 是把一部分流程交给智能。

## 核心分水岭

Agent 和 Workflow 最核心的区别：**谁掌握流程控制权**。如果路径由开发者设计、模型仅在节点内工作 → LLM Workflow。如果模型可根据当前状态动态决定下一步行动 → Agent。

## 自主性连续谱（Level 0-5）

- **L0**：普通 LLM 调用，开发者完全控制
- **L1**：LLM Workflow，流程代码控制，节点内用 LLM
- **L2**：动态 Router Workflow，模型输出决定分支，但路径预设
- **L3**：Tool Calling Agent，模型选择工具
- **L4**：Planning Agent，模型拆解任务、制定计划、重规划
- **L5**：Long-running Agent，跨时间运行，有长期状态、任务队列

## Workflow vs Agent 对比

| 维度 | Workflow | Agent |
|------|----------|-------|
| 控制权 | 开发者与流程引擎 | 模型获得部分控制权 |
| 执行路径 | 预先设计 | 运行中动态生成 |
| 确定性 | 更高 | 更低 |
| 测试难度 | 路径覆盖较容易 | 需评估完整行动轨迹 |
| 成本可控 | 较易估算 | 取决于循环次数和上下文 |
| 错误边界 | 某个节点失败 | 可能是连续决策偏航 |
| 可观测性 | 节点日志即可 | 需要 Action Trajectory |

## 选型九问

1. 步骤可提前穷举？
2. 中间状态可提前预测？
3. 需和未知环境交互？
4. 需根据结果重规划？
5. 错误成本多高？
6. 要求严格 SLA？
7. 允许人工介入？
8. 单次任务预算？
9. 需审计完整轨迹？

## 三种混合模式

1. **Workflow 包含 Agent**：整体流程明确，复杂节点交给 Agent
2. **Agent 调用 Workflow**：Agent 规划后调用确定性 Workflow Tool
3. **Agent 规划，Workflow 执行**：Planner Agent 拆解，Workflow Engine 安全执行

## 核心结论

企业真实形态是 **Controlled Autonomy**（受控的自主）。最终形态是 **Agentic Workflow** — 在一个受控流程里允许模型在局部拥有自主性。
