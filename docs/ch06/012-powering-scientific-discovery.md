# Powering scientific discovery

> 📊 Level ⭐⭐⭐ | 9.8KB

## Powering scientific discovery: BYOKG and GraphRAG for intelligent pharmaceutical research

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/powering-scientific-discovery-byokg-and-graphrag-for-intelligent-pharmaceutical-research)

## Powering scientific discovery: BYOKG and GraphRAG for intelligent pharmaceutical research

In pharmaceutical research, scientists face a fundamental challenge: accessing and connecting the vast amount of scientific knowledge scattered across disparate systems. From published literature and internal lab notes to genomics databases, critical insights remain trapped in silos, making it difficult for researchers to form comprehensive connections and generate promising hypotheses. This fragmentation slows down the drug discovery process. It also risks valuable institutional knowledge being lost as researchers transition, ultimately affecting the industry’s ability to research and develop efficiently. The need for a solution that can intelligently bridge these knowledge gaps while maintaining scientific integrity has become increasingly important.

## The challenge: Scattered data across fragmented systems

At leading pharmaceutical companies, researchers face a critical challenge in early-stage drug discovery, where traditional methods yield only a 5 percent success rate and initial screening takes over six months. Scientists struggle to connect insights buried across fragmented systems such as PubMed, internal lab notes, and genomics databases, all while racing against competitors and time constraints. The scattered nature of data leads to redundant work and missed opportunities. It also makes it difficult to trace the evidence trail needed for regulatory approval. When researchers depart, they often take valuable tacit knowledge with them, further compromising the institutional memory needed for breakthrough discoveries.

Challenges in early-stage drug discovery:

1. Poor success rate and time efficiency – Only 5 percent hit rate with over 6 months of screening time per attempt.
  2. Fragmented knowledge systems – Critical insights scattered across PubMed, lab notes, and databases, leading to missed connections.
  3. Loss of institutional memory – Valuable knowledge disappears when researchers leave, breaking continuity in research efforts.

These challenges collectively create a significant bottleneck in the drug discovery pipeline, leading to inefficiencies, missed opportunities, and potential delays in developing life-saving treatments. Our solution addresses these bottlenecks by moving beyond traditional methods: graph-powered AI supports pharmaceutical research by creating an interconnected knowledge environment. Using Amazon Neptune Analytics, researchers can now ask complex questions in natural language and receive instant, evidence-backed insights drawn from a unified knowledge graph that connects everything from compound interactions to gene expressions and clinical studies. This approach doesn’t only provide answers. It reveals the complete reasoning behind each result by showing detailed citation paths and graph traversal steps. By exp

---

## 深度分析

### BYOKG：无 schema 约束的知识图谱查询范式

传统 GraphRAG 方案通常假设知识图谱自带完整 schema（ontology），检索器可以据此规划遍历路径。BYOKG（Bring Your Own Knowledge Graph）的核心立场恰恰相反：企业实际拥有的图谱往往由多个团队在不同时期拼装而成，schema 缺失、过时或不一致才是常态。BYOKG-RAG toolkit 的做法是把 schema 作为运行时输入——查询时动态提供 graph context，让 LLM 在缺少预定义本体的前提下自行理解图结构并规划遍历。这对药企尤其关键：化合物、基因、蛋白质、疾病等实体类型来自 PubMed、Gene Ontology 等公共源与内部私有数据的混合，强行统一 schema 的治理成本远高于让检索层适配异构现状。

### LLM 驱动的实体链接：模糊匹配 + 语义抽取的双层设计

实体链接（entity linking）是把自然语言问题锚定到图节点的关键一步。该方案采用 FuzzyStringIndex + EntityLinker 的组合：先用模糊字符串索引对全图节点建立匹配器，再把 LLM 从问题中抽取的实体草稿（entity-extraction artifacts）和初步答案（draft-answer-generation）链接回真实图节点。这个设计的深意在于容错——医疗数据充满缩写、别名和拼写变体，精确匹配必然大量失败，模糊索引提供了廉价的兜底层，LLM 负责语义层的消歧。这种"便宜的结构化匹配打底、昂贵的 LLM 精修"的分层策略，可以迁移到任何噪声较大的领域知识图谱场景。

### GraphRAG 的可解释性优势：引用路径即证据链

与传统向量 RAG 只返回文本片段不同，该方案的每个答案都附带完整的引用路径和图遍历步骤（citation paths + graph traversal steps）。在药物研发语境下，这不只是透明性卖点，而是合规刚需——监管审批要求可追溯的证据链（evidence trail），一条从疾病节点经 ICD-10 编码到期刊文献 chunk 的遍历路径本身就是可审计的推理记录。这提示了一个更一般的判断：在证据可追溯性构成业务约束的领域（医药、法律、金融合规），图结构的显式路径天然优于向量检索的隐式相似度，GraphRAG 的价值不在"答得更准"而在"答得可验证"。

### 知识图谱作为机构记忆的载体

文章反复强调机构知识流失问题：研究人员离职带走 tacit knowledge。知识图谱在这里的作用是把隐性经验显性化为可查询的网络结构——化合物-基因-健康效应之间的关联一旦入图，就不再依赖任何个人的脑内记忆。数据集构建流程（PMC 开放获取文献 + Comprehend Medical 抽取 ICD-10 编码 + Disease Ontology 层级）展示了这个显性化过程的可操作性：用领域专用的抽取服务自动把非结构化文献转成图节点和边，无需人工建模。机构记忆的保存因此从"文档归档"升级为"结构化、可遍历、可组合查询"的形态。

### 收益数字的合理保留态度

文中给出的 KPI（研究周期从 6 个月缩到 3 周、87% 效率提升、命中率提升 5 倍）来自厂商自己的实现报告，且部分指标描述存在重复和循环表述（success rate 一条的正文实际在复述 timeline 加速）。这些数字更适合作为方向的参考而非基准承诺。真正可复用的部分是成本结构：Neptune Analytics 16 mNCU 约 $0.48/小时加 SageMaker notebook 约 $0.75/小时，意味着验证这类方案的实验门槛很低，团队完全可以用小规模 PoC 自测收益，而不必采信任何宣传数字。

## 实践启示

1. **schema 缺失不构成 GraphRAG 的阻碍** — 如果你的图谱没有完整 ontology，可以走 BYOKG 路线：把 schema 作为查询时输入，让 LLM 运行时理解图结构，而不是先花几个月做本体治理。

2. **实体链接先建模糊索引、再做语义消歧** — 对节点建立 FuzzyStringIndex 级别的廉价匹配层，LLM 只负责把抽取结果链接到候选节点，医疗等噪声领域的命中率会显著高于纯精确匹配。

3. **合规敏感领域优先考虑图路径可解释性** — 如果业务要求证据链可审计（医药、法律、监管申报），选择能输出引用路径和遍历步骤的检索架构，向量 RAG 的隐式相似度难以满足这类要求。

4. **用领域抽取服务自动建图，降低入图成本** — 文献类非结构化数据可以用 Comprehend Medical 这类领域专用抽取 API 直接生成 ICD-10、疾病层级等结构化节点和边，机构知识显性化不必依赖人工建模。

5. **用小规模 PoC 验证收益，不采信厂商 KPI** — Neptune Analytics + notebook 的实验成本约 $1.2/小时，先在自有数据上跑通 BYOKG-RAG toolkit 的样例 notebook，用自己的查询集测量真实的检索质量和周期缩短。

6. **模块化拆分便于跨域复用** — 参考其 LLM 初始化 / KGLinker / 自然语言查询 / 实体链接的四组件分离结构，GraphRAG 系统按模块拆开后换图谱数据源或换领域时只需替换图连接器部分。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关概念: [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rag-retrieval-augmented-generation.md)
- 相关实体: [RAG vs Vector vs Knowledge Graph vs Ontology](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rag-vector-knowledge-graph-ontology.md)
- 相关实体: [AWS 9 种 RAG 方案对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/graphrag-needed-aws-9-rag-comparison-2026.md)

---

