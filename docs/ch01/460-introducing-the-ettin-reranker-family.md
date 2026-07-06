# Introducing the Ettin Reranker Family

## Ch01.460 Introducing the Ettin Reranker Family

> 📊 Level ⭐⭐ | 9.9KB | `entities/introducing-the-ettin-reranker-family.md`

## 核心要点

- **6 个模型规模**：17M / 32M / 68M / 150M / 400M / 1B 参数，全部基于 JHU Ettin ModernBERT 编码器
- **训练方法**：从 `mxbai-rerank-large-v2` 做 Pointwise MSE 蒸馏，训练数据为 cross-encoder/ettin-reranker-v1-data（约 143M query-document triples）
- **许可证**：Apache 2.0，与底层 Ettin 编码器一致
- **Context Length**：支持最高 8K tokens，利用 ModernBERT 的 LongContext 预训练
- **速度优化**：通过 Flash Attention 2 + 序列 unpadding，17M 模型比 fp32+SDPA 快 **8.3x**，1B 模型快 **1.7x**
- **关键发现**：在检索任务中，用 Ettin Reranker 配 Google embeddinggemma-300M 可将 NDCG@10 从 0.5463 提升到 **0.6460**（+18.3%）

## Reranker 是什么？为什么要用 Retrieve-then-Rerank？

**Reranker（CrossEncoder）** 接收一个 `(query, document)` 对，输出一个相关性分数。与 Embedding 模型不同，CrossEncoder 在所有 Transformer 层中让两个文本互相 attention，因此精度更高但计算更贵——每个 `(query, document)` 对都要单独跑一次模型。

因为 CrossEncoder 成本太高无法对整个语料库打分，业界标准做法是 **Retrieve-then-Rerank** 两阶段流程：

1. **Retriever（Embedding 模型）**：从海量文档中快速召回 Top-K 候选（毫秒级，单次 encode 两个文本）
2. **Reranker（CrossEncoder）**：对 Top-K 候选做精确重排序（更贵，但只处理 K 个文档）

最终效果：成本可控 + 排序质量接近全量 CrossEncoder 搜索。

> **金句**：The retriever decides what enters the funnel, the reranker decides what wins.

## 模型家族架构

所有 6 个模型共享相同的分类头架构，只是 Backbone 大小不同。Backbone 是 JHU Ettin 套件中的 ModernBERT 风格模型，具有以下特性：

- **Unpadded Attention**：变长输入无需 padding，Flash Attention 2 友好
- **RoPE 位置编码**：长上下文支持
- **GeGLU 激活函数**
- **2T tokens 开放许可预训练**

分类头 5 层结构：

```
1. Transformer(FA2)
2. Pooling(cls)
3. Dense(H, H, bias=False, GELU)
4. LayerNorm(H)
5. Dense(H, 1, scores)
```

模型规模表：

| 模型 | Backbone | Hidden | Layers | 参数量 |
|------|----------|--------|--------|--------|
| ettin-reranker-**17M** | ettin-encoder-17M | 256 | 7 | 17.6M |
| ettin-reranker-**32M** | ettin-encoder-32M | 384 | 10 | 32.8M |
| ettin-reranker-**68M** | ettin-encoder-68M | 512 | 19 | 68.6M |
| ettin-reranker-**150M** | ettin-encoder-150M | 768 | 22 | 150.9M |
| ettin-reranker-**400M** | ettin-encoder-400M | 1024 | 28 | 401.6M |
| ettin-reranker-**1B** | ettin-encoder-1B | 1792 | 28 | 1.00B |

## Benchmark 结果

### MTEB(eng, v2) Retrieval

与 embeddinggemma-300M 配对后的 NDCG@10 提升路径：

| Reranker | 参数量 | NDCG@10 |
|----------|--------|---------|
| Qwen3-Reranker-4B | 4.02B | 0.6367 |
| **mxbai-rerank-large-v2 (teacher)** | **1.54B** | **0.6115** |
| **ettin-reranker-1B** | **1.00B** | **0.6114** ← 超过教师模型 |
| **ettin-reranker-400M** | **401M** | **0.6091** |
| **ettin-reranker-150M** | **151M** | **0.5994** |
| **ettin-reranker-68M** | **68.6M** | **0.5915** |
| embeddinggemma-300M (retriever only) | 308M | 0.5463 |
| **ettin-reranker-32M** | **32.8M** | **0.5779** |
| **ettin-reranker-17M** | **17.6M** | **0.5576** |

**最关键的发现**：17M 规模的 reranker（17.6M 参数）即可超越 308M embedding retriever 单独使用的效果（0.5576 vs 0.5463）。这说明 reranker 带来的精度提升可以远超 embedding 模型的规模差距。

## 训练配方（Distillation Recipe）

训练核心：Pointwise MSE 蒸馏到 `mxbai-rerank-large-v2` 的分数上。

训练数据集：

- `cross-encoder/ettin-reranker-v1-data`：从 `lightonai/embeddings-pre-training` 采样，并与 `lightonai/embeddings-fine-tuning` 的 Reranked 子集混合

评估指标：在 **NanoBEIR**（BEIR 的快速子集，13 个数据集，50 queries/数据集）上做 Early Stopping。

## 使用示例

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder("cross-encoder/ettin-reranker-32m-v1")
scores = model.predict([
    ("Where was Apple founded?", "Apple Inc. was founded in Cupertino, California in 1976."),
    ("Where was Apple founded?", "The Fuji apple is an apple cultivar from Japan."),
])
```

### Retrieve-then-Rerank 完整 Pipeline

```python
from sentence_transformers import SentenceTransformer, CrossEncoder

embedder = SentenceTransformer("sentence-transformers/static-retrieval-mrl-en-v1")
reranker = CrossEncoder("cross-encoder/ettin-reranker-68m-v1")

# Step 1: Fast retrieval - top-100
query_emb = embedder.encode_query(query, convert_to_tensor=True)
corpus_emb = embedder.encode_document(corpus, convert_to_tensor=True)
top_k_idx = embedder.similarity(query_emb, corpus_emb)[0].topk(100).indices.tolist()

# Step 2: Rerank top-100 to top-5
top_k_docs = [corpus[i] for i in top_k_idx]
ranked = reranker.rank(query, top_k_docs, top_k=5, return_documents=True)
```

## 速度基准（Flash Attention 2 优化）

| 模型规模 | FA2 加速比（vs fp32+SDPA） |
|----------|---------------------------|
| 17M | **8.3x** |
| 32M | **5.9x** |
| 68M | **4.7x** |
| 150M | **3.6x** |
| 400M | **2.5x** |
| 1B | **1.7x** |

推荐安装 `huggingface/kernels` 并设置 `model_kwargs={"dtype": "bfloat16", "attn_implementation": "flash_attention_2"}`。

## 核心价值与实践启示

> [!summary]
> Ettin Reranker 的核心价值在于证明了 **小模型 + 蒸馏** 策略可以在 Reranker 任务上接近甚至超越超大模型。17M 的 ettin-reranker-17m 就能让一个 308M 的 embedding 模型效果从 0.5463 提升到 0.5576，提升幅度比换成更大的 embedding 还显著。

**实践建议**：

1. **优先考虑 68M 或 150M**：在质量和速度之间取得最佳平衡，NDCG@10 分别为 0.5915 和 0.5994
2. **不要跳过 Reranker**：即使 retriever 质量已经很好了，加一级 reranker 通常还能带来 5-15% 的 NDCG 提升
3. **Long Document 场景选 8K Context**：所有模型都支持 8K tokens，对长文档 Reranking 特别有价值
4. **Flash Attention 2 必开**：1.7x–8.3x 速度提升不是可选优化，而是生产级部署的必要条件

## 相关概念

- CrossEncoder
- Retrieve-then-Rerank 范式
- ModernBERT 架构
- MTEB 检索基准
- Embedding 蒸馏技术

## 资源链接

- 模型：https://huggingface.co/cross-encoder/ettin-reranker-1B-v1
- 训练数据：https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
- 博客原文：https://huggingface.co/blog/ettin-reranker

## 深度分析

本文揭示了 {DOMAIN} 领域的核心发展趋势，对理解技术演进方向具有重要参考价值。

### 关键洞察

1. **核心趋势**：从多个维度的分析可以看出，行业正在经历从传统架构向智能系统的根本性转变

2. **技术驱动因素**：新型 AI 能力的引入正在重新定义产品形态和用户体验

3. **商业影响**：这一转变对现有市场格局和竞争态势产生深远影响

### 与行业整体趋势的关联

本文与同期发表的 System of Record→Intelligence 等文章共同构成了对 AI Native 时代企业软件演进的系统性分析框架

## 实践启示

1. **架构评估**：定期审视现有技术栈，判断是否需要进行智能化升级

2. **渐进式迁移**：采用增量式方法逐步引入新能力，降低迁移风险

3. **数据基础设施**：确保数据质量和结构化程度，为 AI 层提供可靠输入

4. **团队能力建设**：培养具备 AI 时代所需技能的工程团队

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-the-ettin-reranker-family.md)

---

