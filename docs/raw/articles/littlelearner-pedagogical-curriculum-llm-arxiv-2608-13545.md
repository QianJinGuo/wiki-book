---
title: "LittleLearner：受教学控制的预训练语料——知识获取 vs 知识引出的受控实验"
created: 2026-08-17
updated: 2026-08-17
type: raw-article
tags: [raw, article, pretraining, curriculum, data-centric, knowledge-acquisition, arxiv]
source_url: https://littlelearner-ll.github.io/
source: newsletter
arxiv_id: 2608.13545
authors: [Fanfei Li, Jana Zeller, Manuel Prada-Corral, Thaddäus Wiedemer, Prasanna Mayilvahanan, Ryan Cotterell, Wieland Brendel]
sha256: 57e042dca796e85a42547ba762afca6b76bf451b88e7bfef8da8013c2ad9add2
---

# LittleLearner：受教学控制的预训练语料——知识获取 vs 知识引出的受控实验

MPI for Intelligent Systems × ELLIS Institute Tübingen × ETH Zürich，arXiv:2608.13545。

## 核心设定

- **受控沙箱**：现代 LM 一次训练见所有数据，难以区分某个新技能是「被学到」（acquired）还是「被引出」（elicited）。LittleLearner 直接约束训练分布本身：**88B-token 语料过滤到美国小学（K–5）课程**，模型从零训练，并以匹配的 un-filtered 对照组做干净对比。
- **LittleCurriculum**：从 FineWeb-Edu 蒸馏的 88B-token 语料，五阶段过滤流水线对齐 Common Core 标准（K–5）。Grade 5 以上的概念、事实、词汇被显式排除。
- **模型三档**：0.6B / 1.3B / 5B，从零在 LittleCurriculum 上训练，具备可解释的知识边界；每个模型配同架构、同 token、同 recipe 的 Unfiltered 对照。

## 关键发现：Elicitation, not acquisition

实验发现，scaling、SFT+GRPO 后训练、in-context learning 都会放大课程内（in-scope）所学能力，但**都无法有意义地提升课程外（out-of-scope）表现**——预训练过滤器设定了有效能力上限。即标准干预能「引出」已有能力，但无法补上预训练分布从未教过的知识。

## 资源

- 托管 5B 模型可在浏览器内直接对话
- 论文、数据集（LittleCurriculum）、模型 checkpoints（base / GRPO（数学，MathCAMPS 后训练）/ chatty）全开源
- 引用：`arXiv:2608.13545`

## 意义

这是数据侧的知识边界受控实验：以课程分离预训练分布，实证「预训练过滤设定能力天花板」这一命题。对 data curation、课程学习、知识获取机制研究（与 curriculum learning / 遗忘研究同族）有方法学价值。