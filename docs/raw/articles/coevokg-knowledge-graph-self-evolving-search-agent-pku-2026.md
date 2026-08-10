---
title: "北大：知识图谱驱动的AI自进化框架（CoEvoKG）"
source_url: "https://www.xiaohongshu.com/explore/6a71f0960000000026034413?xsec_token=CBoCxqaoV63Ccf3UM9a2cA9468StiE3sS114jO55Sng4o=&xsec_source=app_share"
author: "每日ComputerScience（小红书）"
publisher: "每日ComputerScience"
published: 2026-08-10
ingested: 2026-08-10
language: zh
type: raw-article
sha256: "59b1dfcd8f515c1615e16f34d9aef511709fafbd102fbf5b00cbbce339c457b8"
---

# 北大：知识图谱驱动的AI自进化框架（CoEvoKG）

> 小红书 每日ComputerScience 论文解读（XHS 论文解读号档）。北京大学 CoEvoKG，arXiv:2608.01904。

## 问题背景

大语言模型智能体在强化学习搜索任务中面临两个核心问题：

1. **训练任务依赖人工数据**——人工 QA 数据稀缺且成本高
2. **成功搜索产生的知识无法持续积累**——每次搜索的验证证据随训练轮次丢失，能力提升不可叠加

## 核心方法：CoEvoKG 知识图谱驱动的自进化框架

让**知识图谱同时充当可验证任务生成器和长期记忆库**，使搜索智能体能够在训练过程中不断积累证据并提升能力。

### 知识图谱生成训练任务

利用知识图谱中的**多跳实体链**自动生成可验证问答任务，减少对人工 QA 数据依赖，避免随机生成任务出现**不可回答或简单泄漏**问题。

### 搜索智能体强化学习闭环

联合训练**任务生成器（proposer）**和**搜索智能体（solver）**，通过**答案正确性 + 搜索路径证据支持度**共同奖励，让智能体学习可靠的多步检索推理。

### 可持续进化的知识记忆

将成功搜索轨迹中的验证证据**回写到知识图谱节点和边**中，通过**去重和融合**形成不断增强的外部记忆，支持后续训练轮次——知识图谱即长期记忆库，搜索证据持续沉淀。

### 难度自适应任务生成

根据当前智能体成功率调整任务难度，使生成问题保持在**「可解决但具有挑战」**的范围，避免任务过难或过易。

## 实验验证

在六个问答基准上测试：**NQ、TriviaQA、PopQA、HotpotQA、2WikiMultiHopQA、Bamboogle**，覆盖单跳和多跳知识推理场景。

- arXiv: 2608.01904
- 标签：#知识图谱 #大模型智能体 #强化学习 #LLM #多跳推理 #北京大学 #RAG技术
