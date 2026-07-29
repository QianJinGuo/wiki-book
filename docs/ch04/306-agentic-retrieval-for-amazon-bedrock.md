# Agentic Retrieval for Amazon Bedrock

## Ch04.306 Agentic Retrieval for Amazon Bedrock

> 📊 Level ⭐⭐ | 9.0KB | `entities/agentic-retrieval-for-amazon-bedrock-managed-knowledge-base.md`

# Agentic Retrieval for Amazon Bedrock

> **v×c score**: 64 | stars=4
> **来源**: https://aws.amazon.com/blogs/machine-learning/agentic-retrieval-for-amazon-bedrock-managed-knowledge-base
> **发布**: AWS China ML (2026-07-23)

## 摘要

Amazon Bedrock Managed Knowledge Bases 新推出的 Agentic Retrieval（通过 AgenticRetrieveStream API）是一种全新的检索模式，解决了传统单次向量检索（single-shot retrieval）在多跳问题、比较推理、跨知识库查询等场景下的根本性缺陷。该方案将规划、迭代检索和充分性判断内置到服务端，通过一个 Foundation Model 驱动的规划循环自动分解用户问题、逐意图检索、判断证据是否充分、必要时迭代搜索，最终在同一调用中生成有引用的回答。相比自定义 Agent 框架 + Retrieve API 的 DIY 方案，Agentic Retrieval 提供了开箱即用的单 API 方案，具备一致的日志、安全和成本行为。

## 核心要点

- **核心改进**：将传统检索的"一次 embedding 相似度搜索"升级为"FM 驱动规划循环的多步检索"
- **Trace 事件流**：SpeculativeRetrieval → Planning → Retrieval/FullDocumentExpansion → Result，每一步可见可审计
- **多知识库路由**：支持最多 5 个 Managed KB，通过自然语言描述让规划器自动路由子查询
- **FullDocumentExpansion**：当段落上下文不足以回答问题（如总结、列举、跨段落信息）时，自动获取完整文档
- **性能数据**：2-hop 问题+22.8 增益，4-hop 问题+37.3 增益，迭代次数接近人类理想步数
- **定价模型**：每 1000 次调用 $4（托管模型）或标准 Bedrock 模型定价 + 每 1000 次检索 $1
- **最佳实践**：小模型规划器、3-5 次迭代上限、retriever 描述写产品营销文案、日志到 CloudWatch

## 深度分析

### 为什么单次向量检索在多跳问题上必然失败

理解 Agentic Retrieval 的价值，首先要理解单次向量检索（Retrieve API）在多跳问题上的根本局限。当用户问"比较 Amazon 在 2020 年和 2023 年的招聘策略差异"时，这个查询包含三个子意图（2020 年招聘、2023 年招聘、两期比较），但是 embedding 模型只能产生一个向量——这个向量是三个子意图的"平均"，无法精准代表任何一个。

更关键的是，传统检索没有"充分性判断"机制。不论查询多复杂，它永远只返回 top-k 个 chunk。如果前 k 个结果都来自 2020 年的文档，2023 年的信息完全丢失，检索器不会知道"我还有信息没找到"。这与 [RAG 分块-向量化-重排管线](../ch01/223-rag.html) 中的已知缺陷一致。

Agentic Retrieval 的设计目标就是自动化人类分析师的搜索行为：先分解问题，按子意图逐项检索，读结果，发现盲点，再搜索，直到有足够证据才综合回答。

### 规划循环的工程实现与可观测性

Agentic Retrieval 的实现细节展现了 AWS 在"服务化"上的工程思路。规划循环由四个 Trace 事件组成：

1. **SpeculativeRetrieval**：在首次规划之前运行的"预检索"，用于降低端到端延迟（单 KB 使用原始 query，多 KB 作为探针用于路由）
2. **Planning**：FM 分析查询、审查之前结果、发出可检索的子查询
3. **Retrieval 或 FullDocumentExpansion**：每个子查询的执行事件，支持获取完整文档
4. **Result**：去重后的最终结果

每个 Trace 事件携带 step 和 status 信息，可审计模型每一步做了什么。这在生产环境中至关重要——当回答出现问题时，可以通过 Trace 回放定位是规划出错、检索遗漏还是综合错误。这与 [Bedrock AgentCore 运行时](ch04/558-amazon-bedrock-agentcore.html) 的可观测性设计一脉相承。

### FullDocumentExpansion 的独特价值

FullDocumentExpansion 是 Agentic Retrieval 中一个容易被低估的能力。传统 RAG 面临的经典问题是：chunk 切得太小，跨段落信息丢失；chunk 切得太大，噪声增多且向量表示不精确。Agentic Retrieval 的策略是先通过检索找到相关的段落 chunk，如果模型判断这些段落不足以覆盖问题（例如需要全文总结或列举所有要素），就自动获取完整文档。

这实际上是一种"检索粒度自适应"机制——先用细粒度（chunk）定位，再用粗粒度（全文）获取上下文。这比单纯依赖固定的 chunk size 策略更接近人类阅读的"预览→深入"模式。

### 与 DIY Agent 框架的对比

Agentic Retrieval 之前，团队通常基于 Retrieve API 构建自定义 Agent 框架：用一个模型做规划，调用 Retrieve API 做检索，结果去重，循环直到满足条件。但每个应用都重复这套"自定义管线"，带来以下问题：

- 每个实例承担自己的延迟、成本和可靠性风险
- 安全模型需要自行实现（规划模型的 IAM 权限、检索结果的访问控制）
- 可观测性需要从零搭建

Agentic Retrieval 将这些统一为服务端能力，借助 AWS 的 IAM 集成和 CloudWatch 日志，安全模型和可观测性开箱即用。这体现了 [Bedrock 平台化](../ch11/294-amazon-bedrock.html) 的核心理念——让开发者专注业务逻辑，而非基础设施编排。

### 多知识库路由的关键设计约束

Agentic Retrieval 的多 KB 路由功能依赖一个精妙的设计：retriever 描述是自然语言文本，由规划模型根据这些描述判断子查询应该路由到哪个 KB。这意味着：

- 描述的质量直接决定路由准确性——"Public product documentation and API reference"比"KB 1"好得多
- 描述不等同于 KB 的内容摘要，而应该是面向路由的"产品营销文案"，告诉模型"什么类型的问题应该来这里找答案"

这也意味着 Agentic Retrieval 不适合语义重叠度很高的 KB 集合——如果两个 KB 的描述无法在自然语言层面清晰区分，路由效果会下降。

## 实践启示

1. **选择检索 API 的标准是查询复杂度而非数据量**：Retrieve API 适合"单跳、范围明确"的问题（如"2024 年营收是多少"）；AgenticRetrieveStream 适合"多跳、比较、探索性"的问题（如"比较 2020 和 2023 年的战略差异"）。在实际应用中，应根据用户查询的复杂度做路由，而非对全部流量使用 Agentic Retrieval。

2. **迭代次数是成本和延迟的主要驱动力**：Agentic Retrieval 的定价和延迟主要由迭代次数决定（每次迭代是一次 FM 调用+检索）。生产部署时，从 3 次（单 KB）或 4-5 次（多 KB）开始，通过 Trace 日志观察，找到"够用但不过度"的阈值。

3. **务必启用 Trace 日志到 CloudWatch**：Trace 事件是事后排查回答质量问题的关键证据。没有 Trace，无法区分"模型规划错误"和"检索未命中"。

4. **小模型通常优于大模型**：Agentic Retrieval 的规划器做的是大量短调用（分解问题、判断充分性），而非深度推理。使用大模型徒增延迟和成本，收益有限。

5. **retriever 描述需要针对性编写**：多 KB 场景下，每个 KB 的描述应该像产品公告一样清晰、具体、可区分。"文档库 1"这样的描述会让路由退化为随机选择。

6. **FullDocumentExpansion 可以缓解 chunk size 调参困境**：允许 Agentic Retrieval 自主判断何时需要全文，可以减少手工调整 chunk size 的工作量，特别是在文档类型多样化的场景中。

## 相关实体

- Agentic RAG 模式
- [RAG 分块-向量化-重排管线](../ch01/223-rag.html)
- [Bedrock AgentCore 运行时](ch04/558-amazon-bedrock-agentcore.html)
- [Bedrock 跨区域推理](../ch11/294-amazon-bedrock.html)
- RAG 框架对比
- [三种 RAG 架构](ch04/237-agentic.html)
- RAG 检索增强生成
- [知识库构建](https://github.com/QianJinGuo/wiki/blob/main/entities/knowledge-base-construction.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentic-retrieval-for-amazon-bedrock-managed-knowledge-base.md)

---

