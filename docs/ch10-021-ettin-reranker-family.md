## Ch10.021 Ettin Reranker Family

> 📊 Level ⭐⭐⭐ | 15.1KB | `entities/ettin-reranker-family.md`

## 模型概览

该系列包含六个尺寸变体，均采用相同的模块化架构，仅在 backbone 规模上有所区别 ：

| 模型 | Backbone | Hidden size | Layers | 参数量 |
|------|----------|-------------|--------|--------|
| [`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1) | [`jhu-clsp/ettin-encoder-17m`](https://huggingface.co/jhu-clsp/ettin-encoder-17m) | 256 | 7 | 17.6M |
| [`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1) | [`jhu-clsp/ettin-encoder-32m`](https://huggingface.co/jhu-clsp/ettin-encoder-32m) | 384 | 10 | 32.8M |
| [`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1) | [`jhu-clsp/ettin-encoder-68m`](https://huggingface.co/jhu-clsp/ettin-encoder-68m) | 512 | 19 | 68.6M |
| [`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1) | [`jhu-clsp/ettin-encoder-150m`](https://huggingface.co/jhu-clsp/ettin-encoder-150m) | 768 | 22 | 150.9M |
| [`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1) | [`jhu-clsp/ettin-encoder-400m`](https://huggingface.co/jhu-clsp/ettin-encoder-400m) | 1024 | 28 | 401.6M |
| [`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1) | [`jhu-clsp/ettin-encoder-1b`](https://huggingface.co/jhu-clsp/ettin-encoder-1b) | 1792 | 28 | 1.00B |

所有模型均支持最高 **8192 tokens** 的上下文长度，这得益于 ModernBERT 的 long-context 预训练设计 。

## 核心设计

### Architecture

每个 reranker 的分类头包含 4 个模块 ：

```
1. Transformer(FA2)        # 基础 Transformer，使用 Flash Attention 2
2. Pooling(cls)             # CLS pooling 策略（实验证明优于 mean pooling）
3. Dense(H, H, bias=False, GELU)  # 中间非线性层
4. LayerNorm(H)            # 层归一化
5. Dense(H, 1, scores)     # 输出单标量 relevance score
```

与标准的 `AutoModelForSequenceClassification` 不同，该架构使用 `AutoModel` 加载 Transformer（即 "headless" Transformer），这一设计允许 **sequence unpadding** 以适配 Flash Attention 2，在中等文档长度下可获得 **1.7x-8.3x** 的速度提升 。

### 训练方法：Pointwise MSE Distillation

Ettin Reranker 采用 **pointwise MSE 蒸馏** 而非传统的对比学习或 pairwise loss ：

- **Teacher**: [`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2)（1.54B 参数量）
- **Loss**: [`MSELoss`](https://sbert.net/docs/package_reference/cross_encoder/losses.html#mseloss)，直接拟合教师模型的原始 logits（范围约 [-12, 22]）
- **Training data**: ~143M `(query, document, teacher_score)` 三元组

作者选择蒸馏而非传统对比学习的原因在于：人工标注的正样本成本高且规模受限，而 MSE 蒸馏可以直接利用教师模型的细粒度相关性分数进行学习 。

### 训练数据

数据集 [`cross-encoder/ettin-reranker-v1-data`](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data) 包含约 143M 三元组，来源于两个部分 ：

1. **LightOn 预训练数据**（[`lightonai/embeddings-pre-training`](https://huggingface.co/datasets/lightonai/embeddings-pre-training)）：32 个 broad-domain 细分，涵盖 MTP、FW-EDU、Reddit、PAQ、S2ORC、Amazon、Wikipedia、MS MARCO 等领域，约 110M 三元组
2. **重排序的检索数据**（[`lightonai/embeddings-fine-tuning`](https://huggingface.co/datasets/lightonai/embeddings-fine-tuning)）：7 个细分（msmarco、hotpotqa、trivia、nq、squadv2、fiqa、fever），每个 query 有 2048 个候选文档，用教师模型重排序后按 quantile-anchor 方法采样 64 个

## 性能表现

### MTEB(eng, v2) Retrieval Benchmark

在 [MTEB](https://github.com/embeddings-benchmark/mteb) 英文检索基准上，Ettin Reranker 家族在各自参数量级上均达到 **state-of-the-art** ：

| Reranker | 参数量 | MTEB NDCG@10 |
|----------|--------|--------------|
| [`Qwen/Qwen3-Reranker-4B`](https://huggingface.co/Qwen/Qwen3-Reranker-4B) | 4.02B | 0.6367 |
| [`mixedbread-ai/mxbai-rerank-large-v2`](https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2)（教师） | 1.54B | 0.6115 |
| **[`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1)** | **1.00B** | **0.6114** |
| **[`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1)** | **401M** | **0.6091** |
| **[`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1)** | **151M** | **0.5994** |
| **[`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1)** | **68.6M** | **0.5915** |
| **[`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1)** | **32.8M** | **0.5779** |
| **[`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)** | **17.6M** | **0.5576** |

值得注意的是，1B 模型与教师模型的差距仅 **0.0001**，400M 与教师的差距也只有 0.0024 。

### 速度基准

在 H100 GPU（bf16 + FA2 + unpadding）上的吞吐量对比 ：

| 模型 | 参数量 | pairs/second |
|------|--------|--------------|
| [`cross-encoder/ettin-reranker-17m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1) | 17M | 7517 |
| [`cross-encoder/ettin-reranker-32m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-32m-v1) | 32M | 6602 |
| [`cross-encoder/ettin-reranker-68m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-68m-v1) | 68M | 4913 |
| [`cross-encoder/ettin-reranker-150m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-150m-v1) | 150M | 3237 |
| [`cross-encoder/ettin-reranker-400m-v1`](https://huggingface.co/cross-encoder/ettin-reranker-400m-v1) | 400M | 1738 |
| [`cross-encoder/ettin-reranker-1b-v1`](https://huggingface.co/cross-encoder/ettin-reranker-1b-v1) | 1B | 928 |

相比同尺寸的 `ms-marco-MiniLM-L*-v2` 系列，Ettin Reranker 在质量和速度上均有显著优势 。

## 使用方法

### 基本调用

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder("cross-encoder/ettin-reranker-32m-v1")
scores = model.predict([
    ("Where was Apple founded?", "Apple Inc. was founded in Cupertino, California in 1976 by Steve Jobs, Steve Wozniak, and Ronald Wayne."),
    ("Where was Apple founded?", "The Fuji apple is an apple cultivar developed in the late 1930s."),
])

# [11.393298  2.968891]  <- larger means more relevant
```

### 推荐配置（最高吞吐量）

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder(
    "cross-encoder/ettin-reranker-32m-v1",
    model_kwargs={
        "dtype": "bfloat16",
        "attn_implementation": "flash_attention_2",
    },
)
```

需要安装 `kernels` 包以获得 Flash Attention 2 支持 。

### Retrieve-then-Rerank 流水线

典型生产部署采用两阶段架构 ：

```python
from sentence_transformers import SentenceTransformer, CrossEncoder

# 阶段1：快速 embedding 检索（亚毫秒级）
embedder = SentenceTransformer("sentence-transformers/static-retrieval-mrl-en-v1")
reranker = CrossEncoder("cross-encoder/ettin-reranker-68m-v1")

# 编码 + 检索 top-100
query_emb = embedder.encode_query(query, convert_to_tensor=True)
corpus_emb = embedder.encode_document(corpus, convert_to_tensor=True)
scores = embedder.similarity(query_emb, corpus_emb)[0]
top_k_idx = scores.topk(min(100, len(corpus))).indices.tolist()

# 阶段2：精排序
top_k_docs = [corpus[i] for i in top_k_idx]
ranked = reranker.rank(query, top_k_docs, top_k=5, return_documents=True)
```

## 与其他模型的关系

- **Ettin encoders**：Ettin Reranker 的 backbone，来源于 JHU CLSP 的 [Ettin](https://huggingface.co/collections/jhu-clsp/encoders-vs-decoders-the-ettin-suite) 项目，是 ModernBERT 风格的编码器
- **mxbai-rerank-large-v2**：蒸馏的教师模型，Ettin Reranker 1B 与其差距仅 0.0001
- **ms-marco-MiniLM-L*-v2**：传统的 reranker 基线，Ettin Reranker 在所有尺寸上均显著优于该系列

## 技术亮点总结

1. **蒸馏优先**：选择 MSE 蒸馏而非对比学习，避免了 hard negative 标注成本高、false negative 多的缺点
2. **模块化架构**：使用 headless Transformer + Flash Attention 2 + unpadding 实现高效注意力，相比 AutoModelForSequenceClassification 有显著速度优势
3. **超大规模预训练数据**：143M 三元组覆盖 broad-domain 和检索特定任务，single-stage 训练即可在不同尺寸间迁移
4. **全尺寸 SoTA**：17M 到 1B 每个尺寸级别均达 state-of-the-art，1B 模型几乎追平教师

## 深度分析

**蒸馏策略的工程价值**：Ettin Reranker 选择 MSE 蒸馏而非对比学习是务实且高效的决策。传统对比学习依赖人工标注的 hard negatives，成本高且规模受限，而蒸馏直接利用教师模型的细粒度相关性分数（logits range ~[-12, 22]），可以从未标注的大规模语料中学习。1B 模型与教师的差距仅 0.0001（NDCG@10），说明蒸馏在 54% 参数缩减情况下几乎完全继承了教师的判断能力 。

**Sequence unpadding 是 FA2 性能释放的关键**：实验数据揭示了一个反直觉的结论：仅开启 FA2 但保持 padded 输入反而比 bf16+SDPA 更慢（Table 2, line 388）。Ettin Reranker 通过 `AutoModel` 加载 headless Transformer，将 unpadding 机制穿透到每一层，使 FA2 的 kernel 免于处理无意义的 padding token。这是 150M 模型比两个同类 ModernBERT reranker（gte-reranker、granite-reranker）快 2.3 倍的直接原因 。

**生产选型的"甜蜜点"洞察**：68M 模型 landing at 0.5915 NDCG@10 与 Qwen3-Reranker-0.6B（596M）的 0.5940 几乎持平，而体积差距达 9 倍。这说明 reranker 的质量收益存在边际递减——在特定 embedding model 搭配下，中小尺寸模型已能捕获绝大部分排序能力。对于资源受限场景，68M 是性价比最优选；对于需要替换教师模型的大规模部署，1B 以 2.4x 吞吐量优势成为首选 。

**训练效率与规模迁移的工程意义**：每个尺寸仅需调整学习率，其余超参数完全一致，且 LR 可从子集实验干净迁移到全量数据。这得益于 143M 超大规模训练集——模型在单 epoch 内充分学习，不需要多轮迭代。这意味着新尺寸的模型从立项到发布周期极短，为持续扩展模型家族奠定了工程基础 。

**RTX 3090 消费者场景的特殊观察**：17M 在 RTX 3090 上的吞吐量（9008 pairs/s）居然高于 H100（7517 pairs/s），这提示在极小尺寸下计算不再是瓶颈，GPU 架构差异不贡献优势。但随着模型增大，H100 的优势迅速显现，1B 在 H100 上是 3090 的 4.9 倍。这一观察对边缘部署和低成本实验场景有直接参考价值 。

## 实践启示

**1. 立即替换 MiniLM 基线**：对于仍在使用 `ms-marco-MiniLM-L*-v2` 系列的生产系统，17M 和 32M 是零风险的 drop-in 替换。17M 比 MiniLM-L12-v2 快 2.3 倍且 NDCG@10 高 +0.051；32M 比 568M 的 BAAI/bge-reranker-v2-m3 快 17 倍且更准确。只需修改模型名称，所有现有调用代码无需改动 。

**2. 生产部署务必启用 bf16+FA2 组合**：标准配置应为 `model_kwargs={"dtype": "bfloat16", "attn_implementation": "flash_attention_2"}`，并通过 `pip install kernels` 安装预编译 FA2 kernels。bf16 对大模型的加速贡献最大（1B 模型：bf16+SDPA 比 fp32+SDPA 快 5.6 倍），FA2 unpadding 再叠加 1.78x-2.45x。小模型（17M/32M）尤其推荐开启，32M 在该配置下达到 6602 pairs/s 。

**3. 高 QPS 场景优先考虑 68M 而非 150M**：68M 在 4913 pairs/s 速度下提供 0.5915 NDCG@10，与 150M 的 0.5994 仅差 0.008，但速度快 1.5 倍。在 retrieve-then-rerank 流水线中，reranker 的作用是对 top-100 做精排，NDCG@10 的微小差距在 top-5 结果中几乎不可感知，而吞吐量差异直接影响单实例支持的并发量 。

**4. 使用 NanoBEIR 作为快速实验评估集**：NanoBEIR（13 个数据集子集，50 queries/dataset）比完整 MTEB（10 个任务）评估速度快数倍，但与完整 MTEB 的 checkpoint 选择高度一致（20 次/训练-run 的 eval 可行）。在进行模型尺寸选择、LR 超参搜索或架构消融时，先在 NanoBEIR 上快速迭代，最终用完整 MTEB 验证，可显著缩短实验周期 。

**5. 关注 embedding model + reranker 配对效应**：单独比较 reranker 质量不够——6 个 embedding model 搭配 Ettin Reranker 家族产生 36 种组合。固定 reranker 切换 embedder，或固定 embedder 切换 reranker，组合效果差异可能超过单个组件的升级收益。生产选型时应以端到端 pipeline（NDCG@10）为评估指标，而非孤立的模型 benchmark 。

## 相关实体
- [Introducing The Ettin Reranker Family](ch01-361-introducing-the-ettin-reranker-family.html)
- [Claude Code Openclaw Usage Ettin](ch09-028-claude-code-openclaw-usage-ettin.html)
- [Gemma 4 Multi Token Prediction Drafters](ch01-214-mnn-sana-edit-v2.html)
- [Continuousasync](ch03-083-unlocking-asynchronicity-in-continuous-batching.html)
- Continuous Async

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ettin-reranker-family.md)
- [the next generation of speculative decoding: dflash and spec](ch01-379-claude-code-harness-deep-understanding.html)

## 参考文献

- [Ettin Reranker Blog Post](https://huggingface.co/blog/ettin-reranker)（Tom Aarsen, 2026-05-19）
- [cross-encoder/ettin-reranker-v1-data](https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data)（训练数据集）
- [Ettin Encoders Collection](https://huggingface.co/collections/jhu-clsp/encoders-vs-decoders-the-ettin-suite)

---
