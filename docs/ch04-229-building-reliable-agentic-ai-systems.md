# Building Reliable Agentic AI Systems

## Ch04.229 Building Reliable Agentic AI Systems

> 📊 Level ⭐⭐ | 10.1KB | `entities/building-reliable-agentic-ai-systems-martinfowler.md`

## Building Reliable Agentic AI Systems

## 摘要

Martin Fowler 和 Kent Beck 合作撰写的深度技术文章，以 Bayer 制药公司的 PRINCE（Preclinical Information Center）系统为案例，系统性地阐述了构建可靠 Agentic AI 系统的架构方法论。文章详细介绍了从 Search → Ask → Do 的三阶段演进、基于 LangGraph 的多 Agent 编排架构、三层反思机制（过程反思、数据反思、草稿反思）、以及生产级的错误处理和评估体系。这是 Harness Engineering 和 Context Engineering 在企业级 AI 系统中最完整的公开案例之一。

## 核心要点

### PRINCE 系统的三阶段演进

PRINCE 平台经历了三个清晰的发展阶段，反映了企业 AI 系统从简单到复杂的演进路径：

1. **Search 阶段** — 创建统一的非临床研究数据网关，整合多个数据孤岛，主要基于结构化元数据的过滤式检索
2. **Ask 阶段** — 引入 RAG（Retrieval-Augmented Generation）能力，支持研究者用自然语言直接查询非结构化 PDF 报告的内容
3. **Do 阶段** — 集成多 Agent 系统，PRINCE 成为能够执行复杂任务的主动研究助手，支持工作流编排和监管文档起草

### 系统架构

PRINCE 的架构基于几个关键组件：

- **LangGraph 编排层** — 协调多阶段工作流，包括意图澄清、思考与规划、研究、数据验证和回答生成
- **Researcher Agent** — 负责信息收集，采用混合检索策略：RAG 处理非结构化数据（PDF 报告），Text-to-SQL 查询结构化数据（Amazon Athena）
- **Reflection Agent** — 执行数据反思，评估检索到的信息是否充分回答用户问题
- **Writer Agent** — 负责答案合成与格式化，必须基于提供的上下文生成回答并附带引用
- **Think & Plan 步骤** — 执行过程反思，评估工作流是否在正确的轨道上

### 三层反思机制

这是文章最核心的架构贡献，区分了三种不同类型的反思：

**过程反思（Process Reflection）** — 由 Think & Plan 步骤执行。评估的是「Agent 是否在采取正确的步骤」。在多步骤工作流中，每一步都需要自问：我是否以正确的方式推进？当前轨迹是否指向用户目标？这种元认知能力使系统能够反思自身工作流并调整策略。

**数据反思（Data Reflection）** — 由 Reflection Agent 执行。评估的是「收集到的数据是否充分」。即使工作流执行正确（好的过程），仍然可能检索到不充分的数据来回答问题。Reflection Agent 通过比较检索到的上下文与用户原始查询来识别信息缺口，如果不足则生成后续问题以获取缺失信息。

**草稿反思（Draft Reflection）** — 由 Writer Agent 的内部审查循环执行。评估的是「生成的输出是否完整」。对于复杂的多章节回答，Writer 先起草答案，然后审查步骤检查缺失章节、不一致的表格或与原始问题的差距，并发送针对性指令要求修订。

### 上下文纪律（Context Discipline）

文章提出了一个关键的设计原则：更大的上下文窗口并不意味着可以移除对信息选择性的需求。PRINCE 避免将 prompt 视为所有可用信息的大型容器，而是为不同阶段提供不同的上下文：

- **规划上下文** — 给 Think & Plan
- **检索上下文** — 给 Researcher Agent
- **证据上下文** — 给 Reflection Agent
- **合成上下文** — 给 Writer Agent

这种设计减少了上下文污染，使系统更容易调试、评估和改进。具体实践包括：Text-to-SQL 步骤只注入与当前查询相关的 schema 组件；Reflection Agent 接收原始问题和已收集的证据来评估缺口，而非完整的工作流历史。

### RAG 管道的工程细节

PRINCE 的 RAG 管道展示了生产级检索系统的完整工程：

- **摄入流程** — PDF 报告通过提取管道转换为结构化 JSON，使用保留科学上下文的分块策略，每个分块附加研究级和章节级元数据
- **查询时管道** — 关键词提取 → 元数据过滤器生成 → 查询扩展（n=5 语义相似查询）→ 混合检索（0.7 语义 + 0.3 关键词权重）→ 重排序（bge-reranker-large，从 k≈20 筛选到 k=7）→ 最终 LLM 提示生成 → 带引用的回答生成
- **Text-to-SQL** — 动态 few-shot prompting，从向量数据库中检索与当前查询相关的 SQL 示例，执行验证（仅允许 SELECT），错误时自动重试最多 3 次

### 错误处理与恢复

系统采用多层错误处理策略：

- **状态持久化** — 工作流图状态持久存储在 PostgreSQL（LangGraph checkpointer），应用状态存储在 DynamoDB
- **内置重试** — 各步骤配置自动重试，包括单个 LLM 调用级别和逻辑节点级别
- **用户发起重试** — 用户可手动重试失败的查询，系统利用持久化状态从失败点恢复
- **LLM 回退** — 主 LLM 失败后自动切换到备用模型/平台
- **评估体系** — 数据集评估（Faithfulness、Answer Relevancy、Context Relevancy、Answer Accuracy、Semantic Similarity）和实时流量评估（每日批量运行）

## 深度分析

### Harness Engineering 的教科书实现

PRINCE 系统是 Harness Engineering 最完整的公开案例。文章明确使用了「harness engineering」这一术语来描述其架构方法论：

> "Harness engineering shaped the scaffolding around the models: orchestration, tool boundaries, state persistence, retries, fallbacks, validation, reflection loops, observability, and human review."

这个定义精确地覆盖了 Harness Engineering 的核心要素。PRINCE 的 LangGraph 工作流充当了 Agent 的控制层：定义哪些组件可以行动、可以使用哪些工具、工作流在哪里可以暂停、失败如何重试、状态如何持久化、以及何时从研究转到反思再到写作。

### Context Engineering 的实践模式

文章同时展示了 Context Engineering 的系统性实践。核心思想是：**不是给模型更多信息，而是在正确的时间给正确的模型正确的信息**。这体现在：

- 不同 Agent 接收不同类型的上下文（规划 vs 检索 vs 证据 vs 合成）
- Text-to-SQL 只注入相关 schema 而非完整数据库 schema
- Reflection Agent 接收原始问题和证据缺口，而非完整工作流历史
- Writer Agent 接收策展后的分块和引用约束，而非原始检索输出

### Researcher Agent 的层次化演进

PRINCE 正在从单一 Researcher Agent 演进为领域特定子 Agent 的层次结构。这种演进解决了一个常见的扩展问题：随着工具数量增长，工具之间的领域边界和重叠使得单一 Agent 的工具选择变得困难。层次化架构让每个领域 Agent 拥有自己的工具集和提示指令，保持职责清晰，减少跨领域泄漏。这对构建可扩展的多 Agent 系统具有重要参考价值。

### 与传统软件工程的映射

PRINCE 的三层反思机制可以映射到传统软件工程的质量保障实践：

| PRINCE 反思层 | 传统软件工程对应 |
|---|---|
| 过程反思 | 代码审查中的架构评审 |
| 数据反思 | 测试中的覆盖率分析 |
| 草稿反思 | QA 中的回归测试 |

这种映射表明，构建可靠 AI 系统的核心挑战与构建可靠软件系统是同构的——关键在于设计正确的检查点和反馈回路。

## 实践启示

1. **实施分层反思** — 在 Agent 系统中建立过程反思、数据反思和输出反思三个独立的检查点，每个关注不同维度的质量
2. **实践上下文纪律** — 不要把所有信息塞进 prompt，为不同阶段的 Agent 提供聚焦的上下文子集
3. **设计渐进式检索** — 参考 PRINCE 的混合检索管道：元数据过滤 → 查询扩展 → 混合搜索 → 重排序，每一步都在缩小范围和提高精度
4. **持久化工作流状态** — 使用 checkpointer 模式保存工作流状态，支持从失败点恢复而非完全重试
5. **分离评估维度** — 使用不同的评估指标评估不同阶段（检索质量、回答质量、引用准确性），而非仅评估端到端结果

## 相关实体

- [Harness Engineering — PRINCE 是该框架的教科书实现](/ch05-031-harness-engineering-实战-ai-coding-率从-25-提升至-90/)
- [Context Engineering — 上下文纪律是该概念的实践模式](/ch04-229-yidian-tianxia-context-engineering-agentic-ai/)
- [Agentic RAG Patterns — PRINCE 展示了生产级 Agentic RAG 的完整实现](/ch04-107-google-agentic-rag-跨语料库框架-充分上下文智能体-5-阶段管线/)
- [AWS DevOps Agent](/ch04-328-production-ready-autonomous-incident-resolution-with-aws-dev/) — 另一个生产级多 Agent 系统案例
- [When I Reject AI Code](/ch09-082-when-i-reject-ai-code-even-if-it-works/) — 同样关注 AI 系统的工程可靠性

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-reliable-agentic-ai-systems-martinfowler.md)

---

