---
source_url: https://www.xiaohongshu.com/discovery/item/6a772aac000000003203085f
ingested: 2026-08-09
sha256: 97fa154023d243b7b41f441d081ae02524ed16c7872494b5da946dc29d5fd2c0
title: "Argus:微软开源的Agent长任务通用运行时"
author: lbx154
source: 小红书 (XHS)
type: raw
tags: [agent, runtime, long-horizon, self-evolving, microsoft, memory, verification]
---

# Argus:微软开源的Agent长任务通用运行时

传统智能体（如 ReAct、SWE-agent）把长程任务当作"执行固定计划，步数越多越好"，一旦目标误设、证据失败或约束隐藏，就容易"目标漂移"或把失败合理化。本文提出一个具备持久性与自我演化能力的智能体运行时 Argus。

其中 Manager（管理者）、Planner（规划者）、Engineer（工程师）与 Reviewer（审查者）在持久化项目状态上执行有边界的任务，在长程推理需要在坚持与证据驱动的转向之间取得平衡，且任何转向必须被验证、门控和记录，不能随意放弃原始意图。

## Argus的系统架构与机制

- 角色分工：Manager / Planner / Engineer / Reviewer 四角色协作，在持久化项目状态上工作。
- 工作契约：将"用户意图"与"操作目标/约束/验证标准"解耦；证据可精炼，但必须通过验证门控才能累积（候选记忆、技能、流程、路由、被拒路线等）。
- 自我演化：模型参数固定，演化发生在运行时状态与控制策略（学什么保留、什么丢弃、何时回滚）。
- 自主执行区间：在人工操作员显式占用的检查点之间，系统自主运行。

Argus 在 AARRI-Bench 研究任务上达到 76.8%，数学数据合成存在 28.0 的差距，同时在 GPU 内核与语言模型训练方面结果具竞争力。

lbx154/Argus

#大模型 #深度学习 #算法 #人工智能发展 #AI人工智能 #机器学习 #文献阅读 #科研 #创新点实现
