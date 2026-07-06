# Build agents, not pipelines

## Ch04.006 Build agents, not pipelines

> 📊 Level ⭐ | 9.1KB | `entities/seangoedeckecom-build-agents-not-pipelines.md`

# Build agents, not pipelines

## 核心要点

用库与框架的类比清晰区分LLM应用中的pipeline与agent架构，预测性与灵活性的权衡讨论有实用价值

## 深入分析

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/seangoedeckecom-build-agents-not-pipelines.md)

本篇来自 TLDR AI Newsletter 推荐。技术深度评分：v=7, c=7, stars=4。

### Pipeline与Agent的本质区别

作者用**库与框架的类比**来区分pipeline与agent两种架构：pipeline类似库，由开发者控制主流程、调用辅助函数；agent类似框架，由LLM主导控制流，框架在关键时刻调用开发者代码 。在简单场景下二者等价，但当context超出单次prompt限制或需要**反应式执行**（先行动再根据结果调整）时，二者表现差异显著 。

### 可预测性陷阱：Pipeline的成本下限

Pipeline的核心优势是**成本可预测**：通过限制推理token数量（如结构化输出），将延迟和费用控制在可预期范围内 。但这恰恰也是其局限——当问题复杂度超出该限制时，pipeline无法像agent那样通过扩展循环来"思考更久" 。这意味着在复杂任务上，pipeline实际上是用"放弃解决"来换取可预测性，而非真正的工程控制。

### Context-Gathering：Pipeline的隐形债务

作者指出2023-2024年行业对RAG的期望过高，认为语义嵌入+向量检索能解决context选择问题，但实际证明失败 。核心发现是："判断哪些信息与当前问题相关"本身往往和"解决问题一样困难"——这解释了为何最终大家回归让agent直接做文本搜索。Pipeline必须在前置阶段解决所有context问题，而agent可以在循环中按需获取 。

### 模型选择的灵活性矛盾

Pipeline支持不同任务调用不同模型（成本/能力权衡），但作者对此持怀疑态度：多模型pipeline常因context-gathering做不好而效果打折 。核心论点：原始数据中的信号往往比汇总后的"干净"数据更有价值，多模型汇总反而可能丢失关键信息 。

### Agent的未来可扩展性优势

作者认为agent更**future-proof**：新模型的能力提升在agent架构下会更好地转化为任务效果提升（而非仅是基准分数提升），因为agent直接受益于模型的推理能力进步 。这对本地模型场景（6-32k context限制）是例外，pipeline仍是主力架构 。

### 安全与可解释性的再思考

Pipeline并不比agent更安全：prompt injection在两种架构下攻击面相同，因为最终都是将用户数据注入LLM 。Pipeline的优势仅在于**可追溯性**（开发者定义路径），而非安全防护 。

## 深度分析

### 控制权光谱：Pipeline与Agent的架构抉择

作者的核心贡献是将LLM应用的控制权问题归结为一条光谱：一端是纯Pipeline（开发者100%控制，LLM仅执行指定步骤），另一端是纯Agent（LLM完全主导，开发者仅提供工具集）。这并非二元对立，而是存在连续过渡地带 。实际工程中常见的"半自主"系统——如带边界的agent或受控的pipeline loop——恰好落在这个光谱的中间某个位置。

### 成本模型的非对称性

Pipeline的成本模型是**线性且有上界**的：每个任务消耗的token数量可以被精确预算，即使LLM推理质量下降，也只是效果变差而非成本失控。Agent的成本模型是**指数级且无上界**的：理论上agent可以无限循环（尽管实际中通过max_turns等机制限制），但同样的用户输入可能因难度感知差异导致成本波动10-100倍 。这意味着在构建**商业化LLM应用**时，Pipeline更适合面向广泛用户的、成本敏感的服务；Agent更适合**内部工具**、单次成本不敏感但效果要求高的场景。

### Context engineering的范式转移

从RAG到Agent式搜索的转变揭示了一个深刻洞察：context选择不是一个信息检索问题，而是一个**推理问题**。传统RAG假设"语义相似性=相关性"，但这个假设在复杂推理任务中经常失效 。Agent式方法通过让LLM自己判断需要什么信息，将这个判断能力转移给模型本身，这是一个更本质但也更昂贵的解决方案。

### Agent作为"框架"的工程含义

作者将Agent类比为框架、Pipeline类比为库，这个比喻的深层含义是：**框架强制某种组织结构，库提供可组合的原子操作**。在AI应用语境下，这意味着Agent架构要求开发者预先定义工具集和边界条件（框架的钩子），而非定义精确的执行流程 。这种设计哲学与传统的确定性软件工程有本质差异，需要重新思考测试、调试和部署流程。

### 可扩展性 vs 局部可预测性的权衡框架

文章提供了实用决策矩阵：如果你需要**scale**（大量用户、相同任务、成本可预测），Pipeline是更安全的选择；如果你需要**解决当前LLM解决不了的问题**（如复杂编码任务），Agent是唯一可行的路径 。这个决策框架帮助工程师避免两个常见错误：过度设计（对简单任务使用agent）和过早放弃（对复杂任务强制pipeline导致任务无法完成）。

## 实践启示

### 1. 建立架构选择的量化评估标准

在项目立项时应明确：任务复杂度的上限是多少？成本可预测性的要求有多高？如果任务可能需要超过3次LLM调用才能完成，应该优先考虑Agent架构而非强行Pipeline化。当前最优实践是：对于需要迭代式context获取的场景，直接使用Agent架构，而非尝试在Pipeline中模拟agent式循环 。

### 2. 将context-gathering视为独立工程问题

Pipeline项目中应将context-gathering作为独立的、优先级最高的工程挑战来对待——不是因为它"应该"被解决，而是因为它是pipeline失败的主要风险源 。如果发现context工程变得过于复杂（AST分析、embedding索引等），这是一个信号：当前任务可能不适合pipeline，应该考虑迁移到agent架构。

### 3. 设计Agent系统时预设"失控保护"

鉴于Agent成本的无上界特性，每个Agent系统都必须内置：最大循环次数限制、每任务成本预算、阶段性checkpoint评估。当agent运行时间或成本超过阈值时，应该触发人工介入或优雅降级 。这一点在构建面向用户的商业服务时尤其关键。

### 4. 谨慎使用多模型Pipeline设计

多模型pipeline（如cheap summarizer + smart solver）的设计动机看似合理，但实际效果往往因中间层的context丢失而打折 。如果确实需要在pipeline中使用不同模型，应该让每个模型处理其完全掌控的context（不依赖前序模型的摘要），或者通过agent式工具设计来替代直接的pipeline串联。

### 5. 面向未来设计时优先考虑Agent架构

在构建需要长期维护的LLM应用时（如内部开发工具、知识库系统），假设新模型的能力提升会选择Agent架构受益更多 。这意味着即使当前模型无法完成某任务，如果该任务未来可能被模型能力提升解决，应该采用Agent架构并预留扩展空间，而非用Pipeline强行覆盖当前能力边界。

## 相关主题

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/seangoedeckecom-build-agents-not-pipelines.md)
- [Claude Code Tool Design Evolution](ch03/075-claude-code.md)
- [RAG Chunking Optimization 2025](ch01/216-0.md)
- [Context Engineering: Three Memory Paradigms](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)
- [Karpathy: Vibe Coding to Agentic Engineering](ch03/045-agent.md)

---

