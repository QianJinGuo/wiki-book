---
title: "清华重磅：让AI自我改进，35B逼近GPT-5.6 Sol（OpenMLE + Frontis-MA1）"
source_url: "https://www.xiaohongshu.com/explore/6a7161f9000000002403cd04?xsec_source=app_share&xsec_token=CBoCxqaoV63Ccf3UM9a2cA91-WglQk3clGV4VsqToDCjM="
source_site: "xiaohongshu.com"
source_account: "Oscholar"
author: "Oscholar"
ingested: 2026-08-04
type: raw-article
tags: [rsi, recursive-self-improvement, mle, ml-engineering, openmle, frontis, tsinghua, agent-evolution, benchmark]
review_value: 6
review_confidence: 5
review_vxc: 30
review_decision: raw-only
sha256: 4050deb85a5d940db5ec55b56d38676f8e1d2da6af91f99e02b7f3451b06cbbe
---

# 清华重磅：让AI自我改进，35B逼近GPT-5.6 Sol

> **来源**：小红书 @Oscholar，2026-08-04
> **评分**：v=6, c=5, v×c=30 → **Raw only**（XHS 论文解读号稳定档位）

## 核心论点

AI 递归自我改进（RSI）研究热度持续走高，但更值得讨论的问题是：AI 应该先在哪一段学会"改进自己"？这篇论文聚焦到"改进构建 AI 的过程"即机器学习工程（MLE）这一可执行试床：写代码、跑实验、调参数、修 bug、反复提交。

## OpenMLE 全栈三层

Frontis.AI 联合清华团队发布了开源全栈 OpenMLE，总共分为三层：

- **OpenMLE-Gym**：带执行反馈的可验证任务环境
- **OpenMLE-ERL**：学习可复用的工程演化算子
- **OpenMLE-Evo**：做长程搜索与经验积累

## Frontis-MA1

在这套栈上，团队后训练了 35B 的 Frontis-MA1，把它做成一个面向 MLE 的 meta-evolution agent。它围绕四个原子操作工作：Draft、Improve、Debug、Crossover。更关键的是，这四类操作既用于后训练，也用于推理时的长程搜索，训练与执行因此落在同一套演化接口上。

## 论文关键结果

- 在 MLE-Bench Lite 上，单张 RTX 4090、12GB 显存、每任务 12 小时预算下，Frontis-MA1 把 Medal Average 从 39.39% 提到 60.61%
- 换成 OpenMLE-Evo-Max 后，成绩进一步到 71.21%，超过 GPT-5.5 + Codex，接近 GPT-5.6 Sol 和 Kimi K3
- 在留出的 NatureBench Lite 上，两部分也都能迁移：固定框架换上训练后的模型，Match-SOTA 从 50% 提到 70%；固定模型换上 OpenMLE-Evo，从 20% 提到 50%
- 论文同时开放了模型权重和 OpenMLE 全栈

## 点评

这篇工作把 RSI 落到 MLE 这一可执行、可验证的闭环，比"agent 改 agent"的口号更可测；35B 在单 4090 上逼近 GPT-5.6 Sol 与 Kimi K3，说明中等规模模型放进合适的算子演化框架里，也能逼近前沿区间。

标签：#ai #大模型 #人工智能 #开源 #清华大学 #科研 #学术 #论文 #Oscholar #agent
