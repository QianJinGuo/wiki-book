---
source_url: https://www.xiaohongshu.com/explore/6a7408df0000000005030c6a
ingested: 2026-08-06
sha256: 2d4cd5eb2544d1969c9bcb962bd2971335c55d02411d368f51a74212dc5b68e1
title: "CAGE：让AI长答案的引用忠于证据——认知归因图引用生成"
author: Haoran Luo（论文作者，南洋理工大学）
source: 小红书 (XHS)
type: raw
tags: [citation-generation, grounded-citation, long-form-qa, rag, trust, attribution-graph]
---

# CAGE：让AI长答案的引用忠于证据——认知归因图引用生成

> 原始来源：https://www.xiaohongshu.com/explore/6a7408df0000000005030c6a
> 发布者：Haoran Luo（论文作者之一，南洋理工大学，第一方发布）
> 论文：CAGE: Cognitive Attribution Graphs for Faithful Inline Citation Generation in Long-Form Question Answering（arXiv 2607.24236）

## 问题：引用"相关但不够支撑"

长答案里的引用常常"相关但不够支撑"：模型边写边选择文档，容易把**主题相关**误当作**严格证据**——引用与答案内容松散相关，无法真正支撑对应主张。

## 方法：CAGE 两阶段

### 第一阶段：CMI（Cognitive Memory Integration）

将问题、检索文档与**语义答案单元**（semantic answer units）组织成**经过验证的支持子图**（validated support subgraph），明确每个答案单元对应的引用集合——在生成前先把"哪句话由哪些文档支撑"的映射钉死。

### 第二阶段：SCR（Semantic Citation Rendering）

按图生成**句子级主张**（sentence-level claims）和**行内引用**（inline citations）。**证据不足时通过空图拒答**（empty-graph abstention）——宁可拒答也不给出无支撑的引用。

## 实验结果

- **ASQA、ExpertQA 和 ELI5** 上统一采用 TRUST 评估，双 Qwen3.5-9B 配置的平均 **TRUST 达到 61.52**
- **ExpertQA** 特定设置中，引用 groundedness **F1CG 相对最强基线最高提升 29.06 点**
- **接入 CMI 后**，GPT-5.5 和 Claude-4.6 在 ASQA 上的 **Atomic-EBO 分别从 38.00% 降至 7.21%、从 40.85% 降至 5.77%**——显式归因图能够显著减少事实越过证据边界（fact overclaiming）

## 意义

CAGE 把"引用生成"从生成时的文档挑选（易把主题相关当证据）重构为**生成前的归因图构建**（先验证支持子图再按图生成），用结构化归因约束长答案的事实边界。空图拒答机制把"证据不足"从隐性错误转为显式行为。与 wiki 自身的 provenance citation 理念同构：主张必须绑定可验证的证据来源。

（End）
