## Ch10.009 RAG 全链路技术详解：从文档加载到 Ragas 评估

> 📊 Level ⭐⭐ | 12.7KB | `entities/rag-full-pipeline-taobao.md`

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rag-full-pipeline-taobao.md)

# RAG 全链路技术详解
淘天集团品牌行业架构团队出品的 RAG 工程化实战指南，覆盖从文档加载到 Ragas 自动化评估的完整链路。

## 评分
| 维度 | 分数 |
|------|------|
| 知识价值 | 8 |
| 置信度 | 8 |
| 产品 | **64** |

## 核心标签
`rag` `pipeline` `embedding` `chunking` `retrieval` `rerank` `graph-rag` `ragas` `evaluation` `meta-chunking` `hyde` `agent`

## 全链路概览
文档加载 → 智能切分 → 索引构建（Embedding） → 检索优化 → 生成调优 → Graph RAG 进阶 → Ragas 评估闭环

## 1. 文档加载与切分
**文档加载**：多格式适配（PDF/Word/HTML/JSON）、OCR 扫描件解析、元数据提取、初步清洗。
**Meta-Chunking**（语义切块）：基于 PPL（困惑度）的智能分块方法。用轻量模型（Qwen2）计算每个句子相对前文的 PPL，在 PPL 局部极大值处切分——这些点对应逻辑断层的语义边界 。切分后用 LLM 进行语义补全和摘要生成，弥补上下文断裂。

## 2. 索引构建（Embedding）
Transformer 架构下 embedding 生成的完整过程：Tokenization → 初始向量映射 → Q/K/V 变换 → 位置编码注入 → Self-Attention 逐层深化 → Pooling（CLS/Mean/Max）→ L2 归一化。归一化后点积=余弦相似度，加速向量库检索 。

## 3. 检索优化
**Query 改写**：指代消解（多轮对话）、纠错去噪、术语对齐、结构转换。多查询生成（3-5 个变体）提升召回率 。
**HyDE**（假设文档嵌入）：先让 LLM 生成"假答案"，用假答案的向量去匹配真实文档，将"问题-文档匹配"转化为"文档-文档匹配"，解决短问题与长文档之间的向量空间不对称问题 。
**Doc2Query**（反向 HyDE）：对每个 chunk 预生成可能的 question，建立 question→chunk 索引。可离线处理，不影响实时 RT。核心价值：用"提问 vs 提问"替代"提问 vs 陈述" 。
**标签过滤**：非结构化→半结构化转化，在语义检索基础上引入硬标签过滤，解决"语义相似但事实不符"的噪音问题。
**ReRank（重排序）**：使用 Cross-Encoder 将 Query 和候选文档拼接后共同编码，通过交叉注意力捕捉细微匹配关系。解决多条件联合约束（如"2000以下+续航好+华为"）的精确排序 。

## 4. 生成优化
常见问题：无检索信息时捏造答案、知识冲突（A说可/B说禁）、中间信息丢失、忽略参考资料。
优化手段：强约束 Prompt（禁止编造+强制引用）、内容分隔标记、模型调参（seed/temperature/presence_penalty/max_tokens）、SFT 微调（训练"根据资料回答"和"资料不足时拒绝"的能力）。

## 5. Graph RAG
用知识图谱解决传统 RAG 的局限性：多跳推理（路径追踪：A→B→C）、全局理解（社区检测+摘要预生成）。
索引流程：文本切分→LLM 提取三元组→构建全局图谱→Leiden 算法社区检测→社区摘要。
查询模式：Local Search（实体邻居 n 跳遍历）vs Global Search（预生成社区摘要汇总）。
代表框架：Microsoft GraphRAG、LlamaIndex、LightRAG 。

## 6. Ragas 评估体系
**核心理念**：LLM-as-a-Judge，自动化评估 RAG 系统。
| 维度 | 指标 | 关注点 |
|------|------|--------|
| 检索 | Context Precision | 相关 chunk 排在前面 |
| 检索 | Context Recall | 不遗漏重要结果（拆解 Claims 溯源） |
| 生成 | Faithfulness | Claim 能否从上下文支撑 |
| 生成 | Answer Relevancy | 反向生成问题+embedding 相似度 |
| 鲁棒性 | Noise Sensitivity | 对冗余/无关上下文的抗干扰能力 |
**评测集生成**：基于知识图谱的自动化测试集构建，通过节点、查询长度、查询风格、人设组合场景，支持 Single-Hop/Multi-Hop × Specific/Abstract 四种查询类型 。

## 关键洞察
1. **Meta-Chunking 是 PPL 的外科手术式应用**：用语言模型的"困惑度"作为语义边界检测器，在 PPL 尖峰处切分，远比固定长度/标点切分科学
2. **HyDE 的本质是向量空间对齐**：短问题与长文档在向量空间中分布不同，通过生成"假答案"将问题投射到文档空间，再从文档空间做匹配
3. **Doc2Query 的离线预处理思路**：将"用户提问→文档匹配"的不对称提前消除，在线只做"问题→问题"匹配，RT 几乎无损耗
4. **Cross-Encoder Rerank 是精准度的最后一道防线**：Embedding 只能表达文档的平均含义，Cross-Encoder 可以逐字检查多条件联合约束
5. **Graph RAG 解决的是"跳"和"面"的问题**：多跳（路径追踪）和全局理解（社区摘要）是传统向量检索的结构性盲区
6. **Ragas 让 RAG 从"感觉还行"变成"可量化"**：Context Precision/Recall + Faithfulness + Answer Relevancy + Noise Sensitivity 覆盖了工程团队最关心的五个问题

## 深度分析
**1. Meta-Chunking 的本质是"困惑度驱动的时间切片"**
传统规则切分（固定字数/段落）本质上是把文档当静态文本处理，忽略了语言内部的结构性信号。PPL（Perplexity）把语言模型在每个句子处"惊讶度"量化出来——当模型突然对下一句感到意外时，PPL 曲线出现尖峰，对应逻辑断层。这个方法的核心洞察是：**语义边界不来自标点，而来自语义连贯性的突变**。这与人类阅读时感知"段落的起承转合"高度吻合。Meta-Chunking 的工程价值在于：它把一个 NLP 问题（PPL 计算）转化为了一个可配置的超参数问题（局部极大值的敏感性阈值），这比固定切分更接近"语义感知"但比纯 LLM 切分更轻量。
**2. HyDE/Doc2Query 解决的是"向量空间不对称"问题**
短 query 与长文档在 embedding 空间中的分布天然不同：query 通常是口语化提问或关键词组合，文档是结构化陈述。直接用 query 向量检索文档，本质上是让两个不同分布的东西在同一空间竞争。HyDE 通过让 LLM 生成"假答案"把 query 投射到"文档分布空间"，再做文档-文档匹配；Doc2Query 则反向操作，把文档陈述转成可能的提问，将匹配转化为问题-问题匹配。两条路径都承认了"提问vs陈述"的不对称性，只是解法方向相反。实际系统中可以互补：Doc2Query 离线预处理降低 RT，HyDE 在线处理复杂 query。
**3. Cross-Encoder Rerank 是精度-速度权衡的必然选择**
Bi-encoder（双塔模型）分别编码 query 和文档，适合大规模 ANN 检索但丢失了细粒度交互信息。Cross-Encoder 将 query 和文档一起喂进模型，通过自注意力机制让每个 token 观察另一方的每个 token，代价是 O(N×M) 的计算复杂度和无法预计算文档向量。当下，Bi-encoder + HNSW 保证召回，Cross-Encoder 做精排是工程上最常见的分层检索架构。值得注意的是，ReRank 还能缓解"中间丢失"问题——将长上下文中被早期高相似度文档挤掉的 relevant docs 重新提升到 top k。
**4. Graph RAG 的真正价值在于"结构化记忆"而非"图数据库"**
Graph RAG 常常被误解为"知识图谱 + 向量检索"的简单组合。它的核心贡献是引入了**预生成的社区摘要**——把全局理解问题（"这篇论文讲了什么"）从在线 LLM 生成变成了离线计算。Leiden 社区检测将图谱划分为多个子社区，每个社区预先用 LLM 生成摘要。查询时分 Local Search（实体邻居遍历）和 Global Search（社区摘要聚合）两种路径，前者保证局部精确性，后者提供全局视野。这个设计与传统 RAG 在全局问答上的结构性盲区形成了鲜明对比——传统 RAG 的语义搜索本质上是"最近邻检索"，无法做跨簇的信息聚合。
**5. Ragas 的 LLM-as-a-Judge 本质上是"模型自我评估能力"的工程化**
传统评估依赖人工标注的 ground truth，成本高且无法规模化。Ragas 用 LLM 自身作为裁判，通过设计巧妙的 prompt（Faithfulness 用"逐 claim 溯源"，Answer Relevancy 用"反向生成问题"）把主观评估转化为可计算的相似度指标。这背后有一个假设：**LLM 对"逻辑一致性"和"语义相关性"的判断足够稳定**。这个假设在 GPT-4 级别模型上大致成立，但在小模型上可能失效。工程落地时需要注意：Ragas 分数高不代表用户体验好，分数低一定意味着某个维度有明确问题。

## 实践启示
1. **切分策略的优先级高于 embedding 模型选择**：很多团队花大量精力选 embedding 模型，却忽视了"garbage in, garbage out"的切分问题。建议先用 PPL 语义切分 + 摘要补全重建知识库，再迭代 embedding 模型。
2. **HyDE 和 Doc2Query 不是非此即彼**：Doc2Query 离线生成 question-index，适合 query 模式稳定的客服场景；HyDE 在线生成假答案，适合 query 多变且意图模糊的探索性场景。两者可以并存于同一系统，Doc2Query 作为第一层召回，HyDE 作为查询改写层。
3. **标签过滤是工程落地的关键一环**：语义相似但事实不符是向量检索的典型 corner case，半结构化的标签系统（如类目、品牌、属性标签）可以作为硬过滤层补足语义检索的不足，成本远低于重新训练 embedding 模型。
4. **ReRank 阶段介入时机要卡准**：ReRank 放在检索和生成之间，但候选文档数量需要控制（通常 top 50-100），过多会浪费算力，过少会遗漏有效结果。建议配合 A/B 测试确定最优 top_k。
5. **Graph RAG 适合"知识密集型 + 多跳推理"场景**：对于简单 FAQ 场景，传统 RAG 已足够；对于需要关联分析的复杂文档集（如技术文档、财报、研究论文），Graph RAG 的社区摘要能显著提升全局问答质量。
6. **Ragas 评估应该作为 CI/CD 的一部分**：将 Ragas 指标（Context Precision、Faithfulness 等）接入自动化测试，新版本发布前跑一遍回归测试，避免检索策略或 Prompt 改动引入回归。
7. **评测集生成要覆盖四种查询类型**：Single-Hop/Specific（简单事实）、Single-Hop/Abstract（概念解释）、Multi-Hop/Specific（多步推理）、Multi-Hop/Abstract（综合分析）。单一类型的测试集会导致对其他类型 query 的覆盖盲区。

## Related
- [harness-engineering-systematic-explainer](ch05-036-harness-engineering-systematic-explainer.html)

- [Agent 原理、架构与工程实践](ch04-435-openclaw-3-2w.html)
- [AI Agent 工程师能力地图](ch04-139-apache-rocketmq-5-5-0-litetopic-ai-agent.html)

---
