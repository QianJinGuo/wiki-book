# 一文看懂三种 RAG 架构：Classic RAG、Graph RAG 与 Agentic RAG

## Ch04.318 一文看懂三种 RAG 架构：Classic RAG、Graph RAG 与 Agentic RAG

> 📊 Level ⭐⭐ | 7.9KB | `entities/three-rag-architectures-classic-graph-agentic.md`

## 一文看懂三种 RAG 架构：Classic RAG、Graph RAG 与 Agentic RAG
> 来源：兔兔AGI（技术极简主义），2026-05-16
> 架构 | 核心动作 | 解决的问题类型 |
> |------|---------|-------------|
> | Classic RAG | retrieves（检索） | 一跳问答、FAQ、文档查询 |
> | Graph RAG | connects（连接） | 依赖分析、影响分析、组织关系、供应链 |
> | Agentic RAG | reasons（推理） | 多步骤调查、复杂归因、跨系统分析 |

## 相关实体
- [Protocol H Hierarchical Agentic Rag Enterprise](/ch04-079-protocol-h-hierarchical-agentic-rag-enterprise/)
- [Claude Code Search Architecture Tencent 2026](/ch01-537-原始文章存档/)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)
- [Google Agentic Rag Sufficient Context Agent Framesqa](/ch01-297-google-agentic-rag-sufficient-context-agent-framesqa-90/)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/three-rag-architectures-classic-graph-agentic.md)

## 深度分析

三种 RAG 架构的核心差异不在于技术实现细节，而在于它们各自回答的是不同类型的知识问题。Classic RAG 处理的是「**答案在哪**」的问题，即用户的问题与包含答案的文档在语义空间上足够接近，检索回来拼给 LLM 就能直接回答。Graph RAG 处理的是「**答案之间怎么连**」的问题，即答案不来自单一文档片段，而来自跨越多个实体和关系的信息网络——典型的如组织关系、供应链上下游、影响分析这类需要多跳推理的场景。Agentic RAG 则处理的是「**下一步该查什么**」的问题，即在提出问题之前甚至不知道完整的问题路径在哪里，需要 LLM 根据中间结果动态决定下一步使用什么工具、查什么数据源。这三个层次实际上对应了企业知识处理中从「查法」到「推理」到「调查」的递进需求 。

Classic RAG 的工程成熟度最高，生态工具链也最完整（向量数据库、Embedder、chunk 策略都有大量成熟方案），但其局限性在于**语义检索与真实答案的相关性之间的Gap**。当用户的查询需要理解文档之间的时间顺序、因果依赖或层级包含关系时，纯语义的最近邻检索往往无法捕捉这些结构化知识。Chunk 越大上下文越丰富但噪声越多，Chunk 越小精度越高但召回率越低，这是 Classic RAG 实践中持续面对的工程权衡 。

Graph RAG 的核心价值在于将**知识结构化**——通过将非结构化文本中抽取的实体和关系构建为知识图谱，使得检索可以沿着边（关系）而非仅沿着节点（文档）进行。这种方式在需要「影响分析」或「依赖分析」的场景中效果显著，例如「这个需求变更会影响哪些系统模块」「某供应商断货会对我的产品线造成什么冲击」这类多跳关系问题，Graph RAG 相比 Classic RAG 有质的飞跃。但其代价是构建和维护知识图谱本身的工程成本：抽取实体的准确性、关系类型的完备性、图谱随业务变化的更新策略都需要持续投入 。

Agentic RAG 则代表了 RAG 架构向**自主规划**方向的进化。它不再假设问题和答案之间存在一个固定的最优检索路径，而是让 LLM 扮演 Agent 的角色，在每个步骤根据当前状态决定下一步的行动。这使得 Agentic RAG 能够处理开放式的复杂调查场景，例如「为什么本季度销量下滑了 15%」这类需要从多个数据源（销售数据、价格历史、营销记录、客服工单、库存系统）逐步收集证据并综合判断的问题。但这套架构的代价是 LLM 调用次数显著增加（每个子步骤可能触发一次以上 LLM 调用）、端到端延迟提高，以及调试复杂性的上升——在生产环境中一个失败的 Agentic RAG pipeline 的根因定位往往比 Classic RAG 困难得多 。

值得注意的是，文章提出的「混合路径」选型思路具有很强的实操价值：**先用 Classic RAG 处理高频明确的简单查询，在遇到需要关系遍历的场景时引入 Graph RAG，在面对完全开放的多步骤调查时使用 Agentic RAG**。这个渐进式的架构演进路径避免了在项目初期过度设计，同时也允许在遇到性能瓶颈时平滑升级。三种架构并非互斥，而是可以共存于同一套系统中的不同模块，由上层的路由层根据查询类型分发到最合适的 RAG 引擎。实际企业级知识库项目往往最终走向这种混合架构，因为用户的提问类型天然是长尾分布的 。

## 实践启示

1. **选型时优先判断问题是「查字面」还是「查关系」还是「查路径」**。如果 80% 的问题都是一句话可以从单篇文档中找到答案，Classic RAG 是最经济的选择，不需要引入图谱建设成本；如果问题天然涉及多实体之间的关联（如组织架构、供应链、依赖关系），Graph RAG 的结构化检索会带来显著质量提升；如果问题无法在提问时定义完整路径（如复杂业务归因、技术排障），则需要 Agentic RAG 的动态规划能力 。

2. **Graph RAG 的图谱质量直接决定系统效果，应将实体抽取和关系抽取作为独立的数据工程任务来对待**，而非仅依赖 LLM 的 zero-shot 抽取能力。在生产环境中建议建立人工校验机制，对高频、高风险关系类型进行定期抽检，确保抽取准确性持续达标。同时图谱的更新策略（增量更新 vs 全量重建）需要根据业务数据的变动频率提前设计 。

3. **Agentic RAG 在引入前应充分评估 LLM 调用成本和延迟约束**。每个 Agentic RAG pipeline 的端到端延迟取决于子步骤数量和每个步骤的 LLM 调用耗时，在实时性要求高的场景（如客服对话）可能需要设置步骤数上限或超时熔断机制。建议在 POC 阶段即测量 P99 延迟和单次查询的平均 LLM 调用次数，作为后续优化的基准线 。

4. **Chunk 策略的设计应与 RAG 架构选型联动考虑**。Classic RAG 对 Chunk size 敏感度最高，过大的 Chunk 引入噪声，过小的 Chunk 丢失上下文；在 Graph RAG 中，Chunk 同时承担向量化检索和实体抽取的双重职责，需要在两者之间找到平衡点；Agentic RAG 对 Chunk 本身的依赖相对较低，因为它主要依赖工具调用而非直接检索，但仍建议保留一个 Classic RAG 风格的向量检索层作为默认的「第一步」工具 。

5. **在企业级项目中，建议架构设计时即保留「路由层」作为三种 RAG 引擎的统一入口**，根据问题类型自动分发到最合适的引擎。这比一开始就选择单一架构然后在遇到瓶颈时做大规模重构要经济得多。路由层的实现可以是简单的规则匹配（问题关键词、问题结构特征），也可以训练一个小模型做分类，核心原则是根据「回答这个问题需要几跳关系」「是否涉及多数据源」「是否是开放式调查」等维度判断分发策略 。

---

