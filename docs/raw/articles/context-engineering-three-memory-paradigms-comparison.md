---
source_url: https://mp.weixin.qq.com/s/kH8E6tWSc08_TctY0iCfJQ
tags: [wechat, article, claude, openai]
title: "上下文工程 - 三种Memory方案对比"
author: iloveacm (AI 无限门)
published_date: 2026-04-26
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: true
sha256: 566ab068ea023cb9ce91a8c474b36e48e9791c5b7945206e72ca0856e720a346
---
---
# 上下文工程 - 三种Memory方案对比
> 来源：[iloveacm（AI 无限门）](https://mp.weixin.qq.com/s/kH8E6tWSc08_TctY0iCfJQ)｜2026-04-26
当前的 Agent Memory 方案大致分为三类：**隐式记忆**，**参数记忆**，**外部显式记忆**。
- **隐式记忆**：以 KV cache 为载体，代表方案是 EverMind 开源的《MSA：Memory Sparse Attention》，核心是将 KV cache 作为记忆载体，通过可扩展稀疏注意力 + KV 分级缓存机制，将模型的隐式记忆扩展了 100 倍。
- **参数记忆**：以模型参数为记忆载体，代表方案是 Doc-to-lora，用一个专门训练过的模型，将文档直接转换为模型的 lora 权重参数，附加到模型上。
- **显式记忆**：以外挂的文本检索模块为记忆载体，代表方案为各种 RAG。
这篇文章将在"知识问答"和"小说情节理解"两种场景下测试对比以上三种记忆方式。
实验代码：[github.com/znygugeyx-ctrl/agent-explore](https://github.com/znygugeyx-ctrl/agent-explore/tree/main/experiments/013_msa_novel_memory)
## 1. 三种 Memory 方案
### 1.1 隐式记忆：MSA (Memory Sparse Attention)
论文：[arxiv.org/pdf/2603.23516](https://arxiv.org/pdf/2603.23516) | Github：[EverMind-AI/MSA](https://github.com/EverMind-AI/MSA)
**核心原理**：以 KV cache 作为记忆载体，分级存储 KV cache。只在 query 命中时加载对应 cache，与用户 query 的 cache 拼接，输出最终答案。
MSA 推理分三步：
1. **离线阶段：Global Memory Encoding**。将输入的所有语料，划分为一个个单独文档。每个文档通过模型得到 hidden states，然后生成：
   - 普通 attention 用的 K / V
   - 专门用于路由检索的 Router Key
   - K / V / Router Key 按 chunk 做 mean pooling 压缩，分级存储（Router Key 在 GPU 缓存，K/V 在内存，命中时加载）
2. **在线查询**：用户提问后，query 被编码为 Router Query，与 memory bank 中的 Router Key 匹配，选取 Top-k 文档，并将这些文档对应的压缩 K/V 加载到 GPU 缓存中。
3. **拼接回答**：query 生成 Router Query，和 memory bank 的 Router Key 匹配，选 Top-k 文档，加载这些文档的压缩 K/V 到 GPU 缓存。
能扩展到 100M tokens 的机制：
- **文档独立处理（Document-wise RoPE）**：每个文档内部自己做 attention，不拼成超长序列，避免全局 full attention 的平方复杂度
- **KV chunk pooling**：原始 token-level KV cache 经 chunk pooling 压缩后存 CPU 缓存
**复现结果**（HotpotQA 1000题）：
- LLM Score：4.172（论文：4.061）✅ 复现成功
- 检索 Precision：0.8515
- 检索 Recall：0.8510
- 评分分布：76.9% 得满分 5 分，6.6% 得 0 分
### 1.2 参数记忆：Doc-to-lora
论文：[arxiv.org/pdf/2602.15902](https://arxiv.org/pdf/2602.15902) | Github：[SakanaAI/doc-to-lora](https://github.com/SakanaAI/doc-to-lora)
**核心原理**：用一个专门训练过的模型，将文档直接转换为模型的 lora 权重参数，附加到模型上，在 0 context 下也能回答相关问题。
两个核心：
1. **Frozen target LLM**：回答问题的模型，参数冻结，附加 lora 用于回答
2. **D2L Hypernetwork**：核心，输入是文档，输出是一组 LoRA 参数，通过大量文档训练
**复现结果**（SQuAD 100样本，normalized recall）：
- D2L Recall：0.8313
- Base Recall：0.9315
- Normalized Recall：**0.892**（论文：0.85-0.90）✅ 复现成功
### 1.3 显式记忆：RAG
RAG 是本文的对照基线。流程三步：
1. **离线建索引**：语料分块，embedding 模型向量化，存入 FAISS IndexFlatIP
2. **在线检索**：query 向量化，取 top-k 最近邻文档
3. **生成回答**：检索到的文档拼接进 prompt，LLM 输出答案
本文配置：Qwen3-Embedding-4B + Qwen3-4B-Instruct + FAISS IndexFlatIP，检索 top-5，每条文档截断至 1500 字。未使用 reranker。
**复现结果**：HotpotQA LLM Score 3.815（高于论文 3.179）
## 2. 数据集构造与实验设计
### 实验一：全量对比（MSA vs RAG）
**HotpotQA**（1000题，多跳推理问答，需跨两篇维基百科文档才能得出答案）
**小说 QA（蛊真人）**：7.95M 字（5.89M tokens，2345 节），Claude Sonnet 4.6 按节生成 QA（每节2题），分 easy/medium/hard，共 296 题。
典型题目：
- Easy：Q：春秋蝉在十大奇蛊中排名第几？它的作用是什么？ A：排名第七，作用是逆转时光（重生）
- Hard：Q：方源在竹君子测谎时为何能安然通过，其中暗藏了什么秘密？ A：利用春秋蝉散发出的恢弘气息，将竹君子死死镇压...
### 实验二：受控三方对比（MSA vs RAG vs D2L）
D2L 使用 LoRA rank=8 压缩文档，最多支持约 8K tokens 输入。
- HotpotQA：构造 2K/4K/8K 三档，共 200 题
- 小说 QA：50 个独立 8K window context，131 题
## 3. 实验结果与分析
### 3.1 实验一：MSA vs RAG
**HotpotQA（1000题）**：
| 方法 | LLM Score | 原论文 |
|------|-----------|--------|
| MSA | **4.172** | 4.061 |
| RAG | 3.815 | 3.179 |
**小说 QA（296题）**：
| 方法 | 整体 | Easy | Medium | Hard |
|------|------|------|--------|------|
| RAG-CN | **2.152** | 2.449 | 2.000 | 1.887 |
| MSA-EN | 1.574 | 1.678 | 1.411 | 1.648 |
**关键洞察**：
- HotpotQA 上 MSA > RAG：每题需要"找到答案"，压缩后的 KV 保留了足够的主旨信号
- 小说数据集上 RAG > MSA：小说推理题需要反复回溯原文细节，64 token 被 mean pooling 压成 1 个向量，细粒度词序/转折/修饰关系被稀释
MSA 论文原文在 Limitations 和消融实验中也印证了这一点：禁用原始文本注入（仅依赖压缩 KV）导致整体得分下降 37.1%，DuReader（阅读理解）下降高达 46.2%。
**结论：压缩换扩展性，是 MSA 架构设计的合理取舍，但代价是在需要细粒度推理的任务上信息有损。**
### 3.2 实验二：MSA vs RAG vs D2L
**HotpotQA（200题）**：
| 方法 | 2K | 4K | 8K | 均值 |
|------|-----|-----|-----|------|
| RAG | 4.125 | 4.215 | 4.225 | 4.188 |
| MSA | **4.460** | **4.440** | 4.260 | **4.387** |
| D2L | 1.810 | 1.490 | 1.435 | 1.578 |
**小说 QA（131题）**：
| 方法 | 整体 | Easy | Medium | Hard |
|------|------|------|--------|------|
| RAG | **3.840** | 4.419 | 3.986 | 2.935 |
| MSA | 2.802 | 3.194 | 2.870 | 2.258 |
| D2L | 0.656 | 0.645 | 0.594 | 0.806 |
### 关键结论
**D2L 全面失败**：
- 幻觉率极高，gold 答案字符串只出现在 32% 的输出里（RAG 为 76%）
- 131 题中 64 题得 0 分，52 题得 1 分，没有一题得满分
- 信息越多 D2L 表现越差（HotpotQA：2K=1.810 → 4K=1.490 → 8K=1.435）
**D2L 失败的根本原因**：将文档压缩进 LoRA 权重是极度信息有损的转换，权重空间不足以精确存储细粒度事实。"0 context 下也能回答"是假象——D2L 更像是记住了某种"知识风格"而非知识本身。
### 3.3 延迟与资源消耗
| 方法 | 延迟 | 特点 |
|------|------|------|
| RAG | ~2249ms | 稳定，LLM 生成是瓶颈 |
| D2L | ~4007ms | 较高，document→LoRA 编码耗时 |
| MSA | ~9448ms | 最高，两轮生成 + KV 加载 |