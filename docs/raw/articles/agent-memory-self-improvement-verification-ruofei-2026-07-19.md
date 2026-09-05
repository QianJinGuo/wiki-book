---
title: "Agent 记忆与可验证自我改进怎么设计"
source_url: "https://mp.weixin.qq.com/s/NUWvuUl0wewAJH_7mv0SDg"
source_account: "架构师"
author: "若飞"
ingested: 2026-07-22
type: raw-article
tags: [agent-memory, experience-system, self-improvement, verification, six-layer-model, governance]
review_value: 8
review_confidence: 7
review_vxc: 56
review_decision: supplementary
supplements: entities/存之有序治之有矩agent-记忆系统的工程实践与演进
sha256: 3281ade225e06f81163e08e4e09005826ca0e6ac39b18d93b254fca96adce186
---

# Agent 记忆与可验证自我改进怎么设计

> **来源**：架构师（JiaGouX）/若飞，2026-07-19
> **评分**：v=8, c=7, v×c=56 → **Supplementary** → [[entities/存之有序治之有矩agent-记忆系统的工程实践与演进]]

## 核心命题

一段过去要经过什么，才有资格修改未来的运行方式？生产级 Agent Memory 更适合按"经验变更系统"来设计，不只负责保存和检索，还要管理证据、状态、作用域、验证、晋升和回滚。

## 六层经验层级

| 层次 | 解决的问题 | 默认状态 |
|------|-----------|----------|
| 原始证据 | 当时发生了什么 | 只追加、可追溯 |
| 当前状态 | 任务现在走到哪里 | 一个权威版本 |
| 候选经验 | 哪条做法可能有用 | 未验证、可过期 |
| 已验证记忆 | 哪类场景可以复用 | 有来源和作用域 |
| Skill / Harness | 以后默认怎样做 | 有版本、可回归 |
| Policy | 哪些动作允许或禁止 | 外部维护、单独审批 |

每一层看起来都和"过去"有关，更新规则完全不同。

## 两条链路

### 读取链：当前任务允许哪些过去进来
### 写入链：当前结果凭什么影响未来

> 只盯着向量库，会同时漏掉这两条链路里最难的部分。

## 关键设计原则

1. **一次有效距离可靠经验很远** — 偶然成功可能只是运气，复现+外部证据+明确作用域才能晋升
2. **Memory 进入 Skill 或 Harness = 参考信息变成默认行为** — 验证要求随之提高
3. **Agent 可以生成候选、分析失败、运行实验，但验证治理放在另一个信任域**
4. **错误归因风险**：Agent 记得很快也学得很快，一次偶然有效的处理可能慢慢变成默认做法
