# how ai agent memory works

## Ch04.146 how ai agent memory works

> 📊 Level ⭐⭐ | 13.0KB | `entities/how-ai-agent-memory-works.md`

## 记忆的类型

当代 Agent 记忆系统通常由 **五个层次** 组成，每个层次解决不同的时间尺度和记忆需求。

### Working Memory（工作记忆）

Working Memory 对应 LLM 的[上下文窗口](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)，是最短期的记忆形式。当上下文满时，新信息通过 FIFO（先进先出）策略覆盖旧信息——即 **FIFO dropping**。这种机制的局限性在于：信息寿命极短，仅在当前对话轮次内有效，且上下文窗口大小直接决定可用的记忆带宽。实际的工程实现中，Working Memory 的容量通常以 token 数量计量（GPT-4o 支持 128K tokens，Claude 3.5 支持 200K tokens），超出部分要么被截断，要么需要依赖外部存储。

### Long-term Memory（长期记忆）

长期记忆解决跨会话信息持久化的问题。主流实现依赖**向量嵌入（Embeddings）+ 语义搜索**（semantic search）机制：将文本片段编码为高维向量，存入向量数据库（Vector Store，如 FAISS、Pinecone、Chroma），检索时通过相似度计算召回最相关的内容块（chunks）。这种范式本质上是[RAG](https://github.com/QianJinGuo/wiki/blob/main/entities/rag-chunking-vectorization-rerank-distillation.md)的记忆版本——与标准 RAG 的区别在于记忆系统需要支持增量写入、自动遗忘策略以及与 Agent 动作的紧密绑定。

### Episodic Memory（情景记忆）

Episodic Memory 记录特定事件或交互的历史片段——例如"上一次用户要求生成代码是在周三"、"这个项目在第三次迭代时遇到了部署失败"。与简单的消息日志不同，情景记忆强调**有意义的事件切片**，而非逐轮记录。实现上通常将交互序列压缩为结构化事件（例如 `{action, outcome, timestamp,反思}`），便于后续检索和推理。

### Semantic Memory（语义记忆）

Semantic Memory 存储抽象的事实知识和概念——不依附于特定事件，而是跨实例通用的知识表示。例如"Python 是一种解释型语言"或"React 使用虚拟 DOM"。在 Agent 系统中，Semantic Memory 常通过[知识图谱](https://github.com/QianJinGuo/wiki/blob/main/entities/rag-vector-knowledge-graph-ontology.md)实现，以三元组（主体-关系-客体）为存储单元，支持多跳推理和一致性查询。

### Procedural Memory（程序记忆）

Procedural Memory 编码"如何做"的知识——即执行特定任务的步骤和模式。例如"生成代码时先写测试"或"处理用户投诉的标准化流程"。在 Agent 架构中，这通常体现为 **System Prompt 模板**、**工具调用模式库** 或 **Agentic Workflow 的规则引擎**。Procedural Memory 使得 Agent 能够将重复性任务自动化，而无需每次重新学习流程。

## 六种架构权衡

从简单到复杂，Agent 记忆系统的架构可以分为 **六个层次**，每层在表达能力、延迟、存储成本和工程复杂度之间做不同取舍。

### 1. Buffer（缓冲区）

最简单的记忆形式，本质上是将最近 N 轮对话（或最近 M tokens）原封不动地保留在上下文窗口内。实现成本极低，但容量严格受限于上下文窗口大小，无任何结构化检索能力。适用于单次会话内的短期上下文保持，不适合需要跨会话记忆的场景。

### 2. Rolling Summary（滚动摘要）

在 Buffer 基础上增加了一层**压缩**：定期（如每 N 轮或每当上下文接近满时）将历史对话压缩为摘要，并替换原始记录。压缩策略可以是简单的抽取式摘要，也可以由 LLM 自身生成。Rolling Summary 在记忆密度和容量之间取得了较好平衡，但摘要过程本身引入延迟，且不可逆的压缩可能导致细节丢失。

### 3. Vector Store（向量存储）

将对话或事件片段**向量化**后存入专用向量数据库，检索时通过 ANN（近似最近邻）算法召回相似片段。这是最接近生产环境的方案，能够处理大规模记忆库，支持语义检索。核心权衡在于：向量检索依赖 Embedding 模型的质量，且检索结果的相关性受分块策略（chunking strategy）影响显著——块太大容易引入噪声，块太小则丢失上下文。

### 4. Knowledge Graph（知识图谱）

在向量检索之上增加结构化知识表示，以**图结构**存储实体和关系。知识图谱支持多跳推理、一致性检查和可解释的查询路径——例如"找到所有与用户 X 相关的、涉及 Y 类型项目的失败事件"。构建和维护成本较高，但表达能力最强，特别适合需要精确关系推理的复杂 Agent 场景。

### 5. Hierarchical / MemGPT（层级记忆）

受操作系统内存层次结构启发（ HOT / WARM / COLD 层级），将记忆划分为不同优先级的层次：热点（Hot）数据保留在上下文窗口，暖点（Warm）数据使用轻量向量检索，冷点（Cold）数据放在低成本档案存储。MemGPT 是该架构的代表实现，专门为大上下文 LLM 设计，支持在有限上下文内模拟无限记忆的视觉效果。

### 6. Self-editing / Letta（自编辑记忆）

最激进的架构：Agent 不仅读取和检索记忆，还能**自主编辑和重写记忆**。Letta（原 MemGPT 团队的后续项目）引入了记忆的"编辑视图"，允许 Agent 对记忆内容进行修正、删除和重构。这种架构的核心挑战是：如何防止 Agent 在编辑过程中破坏记忆的完整性和一致性，以及如何设计合理的版本控制和回滚机制。

## 生产部署考量

在生产环境中部署 Agent 记忆系统时，有四个关键工程考量。

**Read / Write 路径分离**：记忆的写入（捕获新信息）和读取（检索上下文）通常具有不同的延迟要求和 QoS 需求。写入路径需要低延迟、高可用；读取路径需要高吞吐、可预测的检索延迟。实践中通常将两者解耦为独立服务，写入使用写入优化的存储（如日志结构存储），读取使用读取优化的索引结构（如向量索引）。

**多租户隔离**：在 SaaS 或多用户场景下，每个用户的记忆必须严格隔离。实现方案包括：为每个租户分配独立的向量集合（collection/namespace）、在检索时注入租户 ID 作为过滤条件、或使用行级安全（RLS）策略。隔离失败会导致记忆串读，是严重的安全漏洞。

**延迟预算（HOT / WARM / COLD 存储层级）**：不同温度的记忆数据应放置在对应成本的存储层级。Hot 数据（当前会话上下文）放在内存或 SSD，支持亚毫秒访问；Warm 数据（近期交互摘要）放在快速 SSD，支持 10-100ms 检索；Cold 数据（历史事件和知识）放在对象存储（如 S3），接受秒级检索延迟。设计合理的分层策略可将存储成本降低 10x 以上。

**Memory API 设计**：记忆系统通常作为独立服务暴露给 Agent 消费。常见的 API 模式包括：`memory.write(event)` 写入记忆、`memory.search(query, top_k)` 语义检索、`memory.recall(entity)` 按实体检索、`memory.forget(criteria)` 条件删除。一个设计良好的 Memory API 应当支持原子操作、批量操作和事务性回滚，以防止记忆状态不一致。

## 与相关概念的关系

Agent 记忆系统与多个相邻技术存在交集： 提供了长期记忆的检索基础设施； 定义了 Working Memory 的物理上限； 是 Semantic Memory 的结构化实现路径；MemGPT 和 Letta 分别代表了层级记忆和自编辑记忆的学术和工程实现。

## 深度分析

**1. 五层记忆体系揭示了 Agent 记忆设计的核心矛盾：容量与召回率的取舍。** Working Memory 受限于 token 上下文上限，Long-term Memory 依赖向量检索的语义召回质量，两者本质上都在解决"在有限带宽下最大化有效信息利用率"的问题。这一矛盾决定了任何记忆架构都无法同时实现低延迟、高容量和精确召回——工程决策本质上是在这三者之间寻找当前场景的最优解。

**2. 向量存储是当前生产环境的主流选择，但其质量高度依赖 Embedding 模型和分块策略。** 向量检索本质上是近似最近邻搜索（ANN），检索结果的相关性受分块大小影响极大：块过大引入语义噪声，块过小丢失上下文完整性。这意味着记忆系统的性能瓶颈往往不在向量数据库本身，而在上游的向量化策略设计。

**3. 从 Buffer 到 Self-editing 的演进轨迹，本质上是 Agent 自主性的逐步增强。** 六种架构按复杂度排序，对应 Agent 对自身记忆的不同控制能力：Buffer 只能读取，Vector Store 可以检索，Knowledge Graph 可以推理关系，Hierarchical Memory 可以管理记忆温度，Self-editing 允许 Agent 自主改写记忆内容。这一演进路径预示着未来 Agent 记忆系统将越来越接近"自我模型化"的终极形态。

**4. 多租户隔离是生产部署的生死线，失败代价远超技术复杂度本身。** 记忆系统一旦出现跨租户数据串读，在合规要求严格的金融、医疗、企业服务领域，可能直接导致法律责任。向量数据库的 namespace/collection 隔离只是基础，还需要检索层的租户 ID 注入和存储层的行级安全策略形成纵深防御。

**5. HOT/WARM/COLD 分层存储的工程启示：记忆也有"温度"，管理温度即管理成本。** 操作系统内存管理的核心理念被迁移到 Agent 记忆领域——热数据用高成本存储追求低延迟，冷数据用低成本存储接受高延迟。合理的分层策略可将存储成本降低一个数量级，但代价是增加了系统复杂度，需要精确的记忆"温度"判断机制和自动冷热迁移策略。

## 实践启示

**1. 新 Agent 项目先从 Vector Store 起步，按需升级到 Knowledge Graph 或 Hierarchical Memory。** Buffer 和 Rolling Summary 适合概念验证或极度轻量场景；Vector Store 是生产级应用的起点，具备语义检索能力且工程复杂度可控；只有当检索延迟或召回精度成为明确瓶颈时，才考虑引入 Knowledge Graph 或 MemGPT 风格的层级记忆。

**2. 生产环境必须实现 Read/Write 路径分离，使用独立服务解耦。** 写入路径（memory.write）要求低延迟、高可用，适合日志结构存储；读取路径（memory.search）要求高吞吐、可预测延迟，适合向量索引结构。两者混用同一服务会在流量高峰时互相干扰，导致记忆写入失败或检索超时。

**3. 多租户场景从第一天起设计隔离方案，不要事后补救。** 为每个租户分配独立的向量 collection/namespace，并在 API 层强制注入租户 ID 过滤条件。隔离失败导致的数据泄露在合规视角下是不可接受的，且修复成本远高于初始设计的投入。

**4. 在 Context Window 接近满之前，主动触发 Rolling Summary 而非被动等待 FIFO dropping。** FIFO dropping 会导致关键上下文被意外截断，而主动压缩可以在保留语义完整性的前提下释放窗口空间。摘要触发阈值建议设为窗口容量的 70-80%，给 LLM 足够的上下文进行高质量压缩。

**5. 设计 Memory API 时预留 `memory.forget(criteria)` 和版本化回滚能力。** 记忆系统不是只写不删的：GDPR 等隐私法规要求删除特定用户的所有记忆数据，可条件删除的 API 能力是合规必需品；版本化回滚则是应对 Agent 错误编辑记忆（Self-editing 架构）的最后安全网。

## 相关实体
- [Rag Knowledge Retrieval](https://github.com/QianJinGuo/wiki/blob/main/moc/rag-knowledge-retrieval.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-ai-agent-memory-works.md)

- [Wiki Entities Architecture Map](https://github.com/QianJinGuo/wiki/blob/main/queries/wiki-entities-architecture-map.md)
- [Video Rag Chunking Strategy Deephub Imba](https://github.com/QianJinGuo/wiki/blob/main/entities/video-rag-chunking-strategy-deephub-imba.md)

---

