---
source_url: "https://www.xiaohongshu.com/explore/6a754c9a0000000005021803"
source_author: "AI前沿量子港"
source_title: "一个 LLM 长期记忆方案 Thought-Retriever"
source_date: "2026-08-07"
source_publication: "小红书（AI前沿量子港）"
ingested: "2026-08-07"
sha256: "e2beede30ed09a45f5d31cc8434b5ea8f33f8a6152832f2b3922c4ec8ac64c9c"
---

# 一个 LLM 长期记忆方案 Thought-Retriever

> 作者：AI前沿量子港（小红书论文解读号）
> GitHub: github.com/slab-uiu/Thought-Retriever

## 一句话讲清楚

Thought-Retriever 是一个极简的 LLM 长期记忆方案：每次回答完问题，让 LLM 顺手写一笔「thought」存进 thought memory；下次遇到相似问题，直接检索 thought + 原始数据块。5 个数据集 vs 13 种基线，平均 F1 +7.6%、胜出率 +16%。

## 动机：RAG 的两难

LLM 用 RAG 时受限于上下文窗口——最多只能从几百万个数据块里取 top-K 塞进 prompt。K 装不下回答问题需要的全部内容，recall 就崩。

层次化 RALM（树形摘要）倒是能多装点，但摘要是在查询到来前就构造好的，根本不知道用户接下来会问啥。

Thought-Retriever 的解法：每次回答完问题，让 LLM 顺手写一笔「thought」存进 thought memory。下次遇到相似问题，直接检索 thought + 原始数据块。

## 实验结果

📊 5 个数据集 vs 13 种基线，平均 F1 +7.6%、胜出率 +16%。

1. **越用越聪明**：thought 数量从 5 增加到 45，F1 单调上升——不是模型在变大，是记忆在变厚
2. **抽象查询 → 深度思考**：学会了「问得越抽象，就调取越抽象的 thought」——thought memory 自发形成了分层语义结构，没人教它

## 跨 LLM 知识蒸馏（亮点）

让一个 LLM 用另一个 LLM 的 thoughts 做记忆，F1 = 0.24 vs 黄金设置（用原文）的 0.25，几乎无差距。

这意味着未来可能存在一个「公共 thought pool」——大模型贡献 thoughts，小模型直接检索复用，跨模型的认知共享变成现实。

## 工程细节

- **零训练**：不像 MemGPT/HeLa-Mem 那样需要精巧的机制
- **model-agnostic**：任意 LLM 即插即用
- **双重门控**：confidence gate 挡幻觉、similarity gate 挡冗余，thought memory 不会越攒越乱
- **根来源映射**：每条 thought 都能溯源到原始数据块，避免「AI 自己编的记忆」
