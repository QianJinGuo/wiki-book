---
title: "华盛顿大学等实测：Agent 能做到及时停止吗？"
source_url: "https://mp.weixin.qq.com/s/NKN8GmtO4lc5f9TIG-Komg"
ingested: 2026-07-03
sha256: PENDING
author: Hyman的杂货铺
publisher: Hyman的杂货铺
---

华盛顿大学与 Allen AI 等机构提出 Agentic Abstention 问题，在 28000+ 任务上系统评测 13 套 Agent，发现及时停止率普遍低于 40%。CONVOLVE 方法仅借 20 条轨迹蒸馏出的停止规则，就把 Llama-3.3-70B 的及时停止召回从 26.7% 拉到 57.4%，无需改模型参数。

关键问题：Agent 不仅需要会「答」和「做」，还要会在证据表明任务不可行时主动弃权（ABSTAIN）——停止进一步行动并说明原因。

与 LLM abstention（单轮 QA 拒答）不同，Agentic abstention 有三大特征：
1. 多了 ACT 动作空间，弃权不是默认选项
2. 观测随交互累积，最早应弃权步可能在多轮后才出现
3. 不止看「最终有没有弃权」，还要看及时性

三类典型失败模式：过坚持（该停不停）、延迟弃权（最终认栽但多搜七八轮）、过早放弃（over-abstention）。

WebShop 上最强基线及时弃权召回（AbsRec@1）仅 26.7%，终端环境 GPT-5.4-mini + Codex CLI 及时召回仅 21.6%。所有模型组平均及时召回低于 40%。

方法：CONVOLVE——用 LLM-as-judge 自动标注 20 条轨迹，蒸馏出可迁移的停止规则，无需改模型参数。
