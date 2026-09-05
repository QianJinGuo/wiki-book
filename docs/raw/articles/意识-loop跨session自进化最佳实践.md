---
title: "意识 × Loop：让 Loop 跨 Session 自进化的最佳实践"
source_url: https://mp.weixin.qq.com/s/39K69b_556bD_-QRc0sViQ
source_site: 阿里技术
author: 张心翮
date: 2026-07-10
ingested: 2026-07-10
sha256: 6a7e56a3d59a77707972c27c822dc4c7908bf0a7e2073e42ca2212735cea2d2e
---

# 意识 × Loop：让 Loop 跨 Session 自进化的最佳实践

张心翮 阿里技术 2026年7月10日

## 核心问题

Loop Engineering 有一个致命问题：一次会话结束，Loop 就"死了"。调试好的 evals、纠正过的判断偏差、积累的经验，关掉窗口就丢失。Loop 不自进化，就只是一个更花哨的 prompt。

## 实践案例

单人 1 天完成 FDE 方向 61 家公司的 3C（Company/Customer/Competitor）深度调研 + 横向汇总，总计 12 万字。产出可直接进入团队对齐文档、架构评审或 OKR 立项决策。

## 意识层三件套（跨 Session 自进化的核心）

| 文件 | 定位 | 内容 |
|------|------|------|
| **AGENTS.md** | proactive rules / evals | 每次输出前要主动做什么、自查什么。硬约束。约 15 条，超过 20 条遵从率下降 |
| **MEMORY.md** | passive lessons / state | 这次踩过的坑、被纠正的判断、跨 Session 需要延续的进度 |
| **USER.md** | judge preferences | 个人判断标准、喜欢的输出味道、厌恶的表达 |

三个文件每次会话开启时自动加载，每次会话中自动沉淀更新。Loop 自进化变得可观测：上一次的教训通过意识文件跨 Session 传递，成为下一次 Loop 的一部分。^[raw/articles/意识-loop让-loop-跨-session-自进化的最佳实践.md]

## 三层对齐

| 层次 | 核心 | 承载文件 | 描述 |
|------|------|----------|------|
| evals 对齐 | 该主动做什么 | AGENTS.md | 反面清单（绝不能出现）+ 正面清单（每次必须做）。先从 MEMORY 慢慢升格上来 |
| 场景对齐 | 给谁看、怎么被消费、读完做什么决策 | Session prompt | "三要素"，每次调研启动先给 Agent |
| judge 偏好 | 我个人的输出味道 | USER.md | 厌恶 AI 味表达、偏好短句白话、拒绝客气话 |

三层必须分层承载，绝不能混在一个 Prompt 里。硬约束（AGENTS）优先于软偏好（USER）。^[raw/articles/意识-loop让-loop-跨-session-自进化的最佳实践.md]

## Loop Engineering 六大框架的落地映射

| 框架 | 调研场景映射 |
|------|-------------|
| Automations | 会话结束时自动触发总结子任务、把踩坑追加到 MEMORY.md |
| Worktrees | 上下文隔离——每份深度报告并行跑，强制从原点起步，防偏见污染 |
| Skills | 调研框架复用 |
| Sub-agents | 正反对抗——派两个子 Agent 分别找支持和反例证据；审校另起独立子 Agent 避确认偏差 |
| Plugins & Connectors | 钉钉文档和内部技术社区打通 |
| State | 从进度记录扩展到行为塑造：AGENTS.md + MEMORY.md + USER.md |

## 手动保留的位置（不能自动化）

- **MEMORY 升格 AGENTS**：人肉做。一旦自动升格把偶发当成通用规律，错误规则污染后续所有 Loop
- **总报告硬结论**：人肉下判。涉及个人信用的决策，必须亲自过

## Loop 自进化搭建步骤

1. 建 AGENTS.md — 先写"绝不能出现"再写"必须做到"，哪怕只有 5 条
2. 积累 MEMORY.md — 每次会话结束花 2 分钟写教训。关键：主动纠错后务必写进 MEMORY
3. 补 USER.md — "我厌恶什么"往往比"我喜欢什么"更好写

启动成本：首次建三件套 ~30 分钟，前 2-3 Session 慢 10-15%，从第 4 个 Session 开始明显加速。

维护成本：MEMORY.md 不是只增不减。每周扫一遍，已升格进 AGENTS 的删掉，归档不再复现的经验。^[raw/articles/意识-loop让-loop-跨-session-自进化的最佳实践.md]

## 核心判断

- **taste 是 Loop 的准备动作，不是产出**：如果对 topic 没有阅读积累，连 evals 都写不出来。"Loop 让工作变轻松"是真的，"Loop 让新手变专家"是幻觉
- Loop Engineering 90% 讨论在 AI Coding，但 eval 越难写的场景（如调研），搭 Loop 的边际收益越大
- AGENTS: MEMORY 分工 — AGENTS 是主动规则（"以后都要做什么"），MEMORY 是被动经验（"这次学到了什么"）
