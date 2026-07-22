---
title: "Loop+Harness：清华大学自进化 Agent 论文解读"
source_url: "https://mp.weixin.qq.com/s/mOGZOb0TJGpLpb3KyP_91A"
source_account: "模智空间"
author: "小智"
ingested: 2026-07-22
type: raw-article
tags: [agent-evolution, self-improving, harness, loop, tsinghua, survey, meta-evolution, skills, memory, environment]
review_value: 5
review_confidence: 6
review_vxc: 30
review_decision: raw-only
---

# Loop+Harness：清华大学自进化 Agent 论文解读

> **来源**：模智空间，2026-07-17
> **评分**：v=5, c=6, v×c=30 → **Raw only**

## 论文背景

2026年6月清华大学、Frontis.AI 联合发布综述《Self-Improving Agents in the Era of Experience: A Survey of Self-to Meta-Evolution》，系统提出"经验时代（Era of Experience）"概念。

## 三代 Agent 演进

| 世代 | 特征 | 局限 |
|------|------|------|
| 第一代：任务闭环（Task Loops） | 任务内推理→行动→观察闭环 | 任务结束清空，无法跨任务沉淀 |
| 第二代：跨任务复用（Cross-Task Reuse） | 持久记忆+技能库+工作流 | 全部需人工配置，无自主进化 |
| 第三代：运行时系统（Runtime Systems） | Harness 可被 Agent 修改和进化 | 需完整的基础设施支持 |

## 五大进化路径

1. **Skills**：把经验沉淀成可复用的程序（创建→使用→自主进化三阶段）
2. **记忆**：三层架构（表示层/操作层/演进层），从被动存储到主动管理
3. **环境**：Agent 进化的天花板（行动多样性×反馈密度×任务时长）
4. **参数固化**：把稳定经验内化进模型权重
5. **元进化（Meta-Evolution）**：系统自身的进化机制

## 快慢路径

- **快速路径**：Harness层面更新技能和记忆，便宜、快速、可逆
- **慢速路径**：经验内化到模型参数，昂贵、缓慢、几乎不可逆
