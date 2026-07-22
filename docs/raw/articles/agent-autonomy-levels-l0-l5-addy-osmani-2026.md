---
source_url: "https://mp.weixin.qq.com/s/W1cua_2pXfshl_OUKgn2hA"
title: "Agent 的六个自主性等级：从 L0 辅助到 L5 例外管理"
source: "智域心识"
author: "AF智域心识"
ingested: 2026-07-22
sha256: c5bcacc180feb6bd2968560641bcd25f8c73e8e67c50827452c14108f2ba7e77
type: raw-article
tags: [agent-autonomy, l0-l5, addy-osmani, orchestration, agency]
---

# Agent 的六个自主性等级：从 L0 辅助到 L5 例外管理

> 基于 Addy Osmani 《Agentic Autonomy Levels》(2026-07-03) 的中文翻译与分析

## 核心框架

Addy Osmani（Google 工程负责人）提出的双轴模型：

- **Agency**: 单 Agent 的行动范围（建议 → 有边界任务 → 自主目标）
- **Orchestration**: 多 Agent 的组织方式（单 thread → 多 worktree → orchestrator 持续调度）

## 三个时代

| 时代 | 特征 |
|------|------|
| **Assisted** | 人坐驾驶位，Agent 等待指令 |
| **Agent-led** | Agent 接管有边界任务，人纠正方向和验证结果 |
| **Orchestration** | 系统持续分派和推进工作，人处理例外 |

## L0-L5 六个等级

| 等级 | 名称 | Agent 接管 | 人保留 | 验证方式 |
|------|------|-----------|-------|---------|
| L0 | Assist | 建议 | 判断与执行 | 人的本地判断 |
| L1 | Supervised Action | 具体动作 | 关键操作审批 | 权限边界与逐次确认 |
| L2 | Scoped Task Delegation | 有边界的完整任务 | 定义范围、监督 | 测试/lint/截图/复现步骤 |
| L3 | Goal-Driven Autonomy | 围绕目标持续循环 | 目标/规则/停止条件 | 可自动测量的成功标准 |
| L4 | Parallel Delegation | 多个隔离任务并行 | 分解/所有权/合并 | 独立 workspace + 各自评审队列 |
| L5 | Managed-by-Exception | 持续接收/分派/监控/重试 | policy/治理/例外决策 | 独立实现/评审/测试/安全关卡 |

## 关键概念

- **风险与可逆性校准**：三个问题——多快知道做错了？多容易撤销？什么证据证明做对了？
- **Agent Contract**：每次运行前定义 Goal/Scope/Non-goals/Tools/Stopping condition/Evidence/Escalation/Budget
- **指标**：平均人工干预间隔、最长无人值守运行、sandbox vs 升级行动比例、批准/拒绝比

## 四个反模式

1. **Autonomy as status**：把等级当身份徽章
2. **Permission laundering**：厌倦审批就给过大权限
3. **Summary substitution**：用 Agent 工作总结替代 review
4. **Fleet cosplay**：多 Agent 但编排仍人肉

## 参考

- Addy Osmani, Agentic Autonomy Levels, 2026-07-03
- Anthropic, Measuring AI agent autonomy in practice, 2026
- OpenAI Symphony spec
