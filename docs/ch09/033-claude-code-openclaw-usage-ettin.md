# Claude Code Openclaw Usage Ettin

## Ch09.033 Claude Code Openclaw Usage Ettin

> 📊 Level ⭐⭐ | 15.0KB | `entities/claude-code-openclaw-usage-ettin.md`

## 概述

**Ettin Reranker Family** 是由 Tom Aarsen 于 2026 年 5 月发布的六个 CrossEncoder reranker 模型系列（基于 Johns Hopkins University CLSP 的 ModernBERT 编码器），参数量从 17M 到 1B，支持最高 8192 tokens 上下文长度。

本文探讨 **Claude Code** 和 **OpenClaw** 两套主流 Agent 框架如何利用 Ettin Reranker 增强其记忆检索系统。Claude Code 当前采用纯 LLM 语义路由（无向量数据库），OpenClaw 采用 SQLite 向量搜索 + BM25 双路混合检索。Ettin Reranker 的引入可以为两者的检索精度带来显著提升。

## Claude Code 记忆检索现状

Claude Code 采用 **LLM 语义路由** 作为记忆检索机制 ：

- **硬召回**：CLAUDE.md 系列规则文件每次全量塞进 system prompt，保证行为一致性
- **软召回**：MEMORY.md 索引文件（限 200 行 / 25KB）全量加载，但索引中链接的主题文件不自动全量加载
- **Sonnet 做 sideQuery**：把所有记忆文件的 frontmatter（name、description、type）发给 Sonnet，让它选择最多 5 个"确定会有帮助的"记忆文件

核心特点：**没有 embedding，没有向量数据库，纯靠 LLM 的理解力做检索**。这让架构极度简洁，但依赖 Sonnet 的准确性，且每次检索都消耗 context tokens。

## OpenClaw 记忆检索现状

OpenClaw 采用 **SQLite 混合搜索** ：

1. **文本分块（Chunking）**：Markdown 文件被拆分成 chunk
2. **生成 embedding 向量**：存入 `chunks_vec` 虚拟表（使用 sqlite-vec 扩展）
3. **FTS5 全文索引**：`chunks_fts` 表支持 BM25 排名
4. **搜索时双路并行**：向量检索（余弦相似度）+ 关键词检索（BM25），通过 Reciprocal Rank Fusion 加权合并

核心特点：**传统工程路线，保证搜索质量**，但需要维护 embedding 模型和 sqlite-vec 扩展。

## Ettin Reranker 核心优势

Ettin Reranker 提供了一种介于纯 LLM 路由和传统向量检索之间的方案 ：

| 优势 | 说明 |
|------|------|
| **参数量选择广** | 17M / 32M / 68M / 150M / 400M / 1B 六种规格，可根据延迟/精度需求选择 |
| **SoTA 性能** | 各自参数量级均达 state-of-the-art，1B 模型与教师 mxbai-rerank-large-v2 差距仅 0.0001 |
| **长上下文** | 支持最高 8192 tokens，远超传统 embedding 模型的 512-1024 |
| **Flash Attention 2** | 模块化 Transformer + unpadding 实现 1.7x-8.3x 速度提升 |
| **开源许可证** | Apache 2.0，可商用 |

### Retrieve-then-Rerank 范式

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

## Claude Code 集成 Ettin Reranker

### 方案一：替换 Sonnet sideQuery

将 Sonnet 语义路由替换为 **embedding 粗筛 + Ettin 精排**：

1. 所有记忆文件离线生成 embedding，建立向量索引
2. 检索时，先用 embedder 快速召回 top-20 相关记忆
3. 再用 Ettin（如 68M）做 pointwise rerank，选出 top-5
4. 最终结果注入 context

**优势**：消除对 Sonnet 的依赖，减少 context 消耗（embedding 索引远比 frontmatter 紧凑），检索延迟更低

**挑战**：需要额外的嵌入模型维护，增加工程复杂度

### 方案二：保留 LLM 路由 + Ettin 验证层

保持现有 Sonnet sideQuery 流程，但增加 **Ettin rerank 作为置信度验证**：

1. Sonnet 选出 top-5 记忆文件
2. Ettin 对这 5 个候选做 rerank，确认或调整顺序
3. 低于阈值的候选被过滤

**优势**：最小改动，渐进增强现有系统
**挑战**：Sonnet 调用次数不变，延迟略有增加

### 推荐配置

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder(
    "cross-encoder/ettin-reranker-68m-v1",
    model_kwargs={
        "dtype": "bfloat16",
        "attn_implementation": "flash_attention_2",
    },
)
```

对于 Claude Code 的场景（延迟敏感、内存受限），**ettin-reranker-68m-v1** 是性价比最优选择——相比 32M 有明显精度提升，相比 150M+ 延迟更低 。

## OpenClaw 集成 Ettin Reranker

OpenClaw 当前使用 sqlite-vec + BM25 双路检索 ，可升级为 **三路检索**：

### 升级方案：sqlite-vec + BM25 + Ettin Rerank

```python

# 阶段1：双路并行初筛
vec_results = vector_search(query, top_k=50)  # sqlite-vec
bm25_results = bm25_search(query, top_k=50)   # FTS5
candidates = fusion_results(vec_results, bm25_results, top_k=50)

# 阶段2：Ettin 精排
reranked = reranker.rank(query, candidates, top_k=10, return_documents=True)
```

**优势**：

- 充分利用 Ettin 的 8192 tokens 长上下文，处理长记忆片段更有效
- CrossEncoder 的 pointwise 评分比余弦相似度更精确
- 68M 模型吞吐量达 4913 pairs/second（vs 1B 的 928），延迟可接受

### 替代 sqlite-vec embedding

如果当前 embedding 模型效果一般，可考虑：
1. 用 Ettin encoder（`jhu-clsp/ettin-encoder-68m`）替代现有 embedder
2. 保持现有 rerank 流程

Ettin encoder 基于 ModernBERT，在长文本上优于传统 BERT-style 模型 。

## 关键考量

### 延迟 vs 精度权衡

| 场景 | 推荐模型 | 理由 |
|------|----------|------|
| Claude Code 在线检索（每次对话） | etin-reranker-32m | 延迟最低，6602 pairs/s |
| OpenClaw 批处理 | etin-reranker-68m | 性价比最优，4913 pairs/s |
| 精度优先场景 | etin-reranker-150m | NDCG@10 0.5994，显著优于小模型 |

### 部署复杂度

- **Docker 部署**：Ettin 模型可独立部署为 microservice，与主 Agent 通过 HTTP 通信
- **本地推理**：68M 模型仅需 ~600MB 显存， consumer GPU 可运行
- **量化**：如需进一步降低延迟，可考虑 INT8 量化（精度损失约 1-2%）

### 与现有架构兼容性

Ettin Reranker 的 `CrossEncoder` 接口与 sentence-transformers 生态兼容，现有代码改动最小 ：

```python
from sentence_transformers import CrossEncoder
model = CrossEncoder("cross-encoder/ettin-reranker-32m-v1")
scores = model.predict([("query", "document")])
```

## 总结

| 框架 | 当前检索方式 | Ettin 集成收益 |
|------|-------------|---------------|
| Claude Code | LLM 语义路由（Sonnet） | 消除 LLM 依赖，降低延迟，节省 context |
| OpenClaw | sqlite-vec + BM25 | 三路检索增强精度，长文本处理更强 |

Ettin Reranker Family 的 **六档参数量 + SoTA 性能 + 长上下文 + Flash Attention 2** 组合，为 Agent 记忆系统的检索升级提供了实用选择。17M 到 1B 的灵活规格让不同场景（在线延迟敏感 vs 离线精度优先）都能找到合适平衡点。

## 相关实体
- [Claude Code Openclaw Memory Vector Db Doubt](../ch03/075-claude-code.html)
- [Claude Code Openclaw Memory Comparison](../ch03/075-claude-code.html)
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](../ch05/092-harness-engineering.html)
- [Skill System Design Three Way Comparison](../ch04/262-skill.html)
- [Openclaw Agent Loop Design Patterns](../ch01/1080-openclaw-agent.html)

→ [原文存档：Ettin Reranker Family](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ettin-reranker-family.md)
→ [原文存档：Claude Code vs OpenClaw 记忆系统对比](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-openclaw-memory-comparison.md)

## 深度分析

**1. Retrieve-then-Rerank 范式代表了 Agent 记忆检索的最优解**

Claude Code 的纯 LLM 语义路由和 OpenClaw 的 SQLite 向量搜索代表了两种极端：前者过度依赖模型理解力，后者过度依赖传统工程。而 Ettin Reranker 的引入揭示了第三条路——两阶段检索先用 embedding 快速粗筛（毫秒级、亚毫秒级），再用 CrossEncoder 精排（CrossEncoder 让 query 和 document 通过所有 Transformer 层进行联合编码，精度远高于分离编码 ）。这种范式已在搜索引擎中验证二十年，Agent 记忆系统迟早走向同一条路。

**2. 参数量选择本质上是延迟-精度的帕累托最优**

Ettin 六档模型（17M 到 1B）的速度数据显示了一条清晰的帕累托曲线：17M 达 7517 pairs/s，1B 仅 928 pairs/s，相差 8 倍 。但精度差距呢？1B 与教师模型 mxbai-rerank-large-v2 差距仅 0.0001 NDCG@10 ，而 17M 已经超越上一代 33M MiniLM reranker +0.051 。对于 Claude Code 的在线检索场景（每次对话都调用），32M 是最优平衡点——6602 pairs/s 的吞吐量意味着单次检索延迟低于 1ms 。

**3. Flash Attention 2 + Unpadding 是速度提升的关键**

Ettin reranker 相比同参数量级竞品（gte-reranker-modernbert-base、granite-embedding-reranker-english-r2）有 2.3x 速度优势，核心原因不是算法创新，而是模块化 Transformer 架构实现了全链路 unpadding 。当输入被 padding 后喂给 FA2，实际反而比 bf16+SDPA 更慢——这个发现对所有部署 CrossEncoder 的场景都有指导意义 。

**4. Claude Code 的 LLM 路由在记忆文件数量爆炸后会失效**

Claude Code 的 Sonnet sideQuery 从几百个 frontmatter 中选 5 个记忆文件，当记忆文件数量增长到数十个时，LLM 的选择准确率存疑 。这解释了为什么即使 Claude Code 最初选择纯 LLM 路由，最终仍需引入 reranker 作为验证层——Sonnet 的调用本身消耗 context tokens，且结果不稳定 。

**5. 长上下文支持是 Agent 记忆场景的关键差异化能力**

传统 embedding 模型的上下文窗口通常限制在 512-1024 tokens，而 Agent 记忆场景中的记忆片段往往超过这个长度（长的邮件线程、完整的 issue 讨论、跨天的会议记录） 。Ettin 基于 ModernBERT 架构支持最高 8192 tokens 上下文 ，这对于 OpenClaw 场景下的长记忆片段处理至关重要。

## 实践启示

**1. 立即行动：评估当前 Agent 记忆系统的检索延迟**

如果你的 Agent 使用纯 LLM 路由或单一路向量检索，测量当前每次检索的 P99 延迟。Ettin 17M 在 H100 上的单次推理延迟约 0.13ms（7517 pairs/s），即使加上 embedding 粗筛的开销，整体检索仍可在 5ms 内完成 。这个延迟对于对话式 Agent 几乎是不可感知的，而精度的提升却显著可见。

**2. 架构选型：Claude Code 场景推荐 32M，OpenClaw 场景推荐 68M**

Claude Code 是延迟敏感型场景——每次对话都需要检索，32M 的 6602 pairs/s 提供了充足的吞吐余量 。OpenClaw 有批处理场景（夜间记忆整理），68M 的 4913 pairs/s 在精度和延迟间取得最优平衡，且相比 32M 有明显精度提升（NDCG@10 0.5915 vs 0.5779） 。

**3. 工程实施：分阶段迁移，先加 rerank 验证层，再替换 embedder**

对于 Claude Code，最小改动方案是在现有 Sonnet sideQuery 流程后增加 Ettin rerank 验证——Sonnet 选出 top-5，Ettin 确认或调整顺序，低于阈值的候选被过滤 。这实现了渐进增强，无需重构现有架构。

**4. 部署配置：必须启用 bf16 + Flash Attention 2**

实际部署中必须配置 `dtype=bfloat16` 和 `attn_implementation=flash_attention_2`，否则会跌入"bf16+FA2 w. padding"陷阱——速度反而比 bf16+SDPA 更慢 。这个配置在 sentence-transformers 中只需两行代码，但带来的加速比高达 1.7x-8.3x 。

**5. 监控指标：建立检索质量与延迟的联合监控面板**

生产环境应同时追踪两个指标：(1) 检索延迟 P99，确保在预算内；(2) MTEB Benchmark 上的 NDCG@10，定期用黄金数据集做回归测试。当模型更新或数据分布变化时，这两个指标的联合监控能第一时间发现精度退化。

## 相关实体

- `Ettin Reranker Family` — 模型详情
- `Claude Code vs OpenClaw 记忆系统对比` — 两者检索机制原状
- `向量数据库必要性反思` — LLM 路由 vs 向量检索哲学讨论
- `Agent Memory 架构本质` — 记忆系统设计模式
- [OpenClaw 架构解析](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — OpenClaw 整体架构

---

