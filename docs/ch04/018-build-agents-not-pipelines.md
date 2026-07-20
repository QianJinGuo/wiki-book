# Build agents, not pipelines

## Ch04.018 Build agents, not pipelines

> 📊 Level ⭐ | 4.0KB | `entities/seangoedeckecom-build-agents-not-pipelines.md`

# Build agents, not pipelines

## 核心要点

用库与框架的类比清晰区分LLM应用中的pipeline与agent架构，预测性与灵活性的权衡讨论有实用价值

## 深入分析

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/seangoedeckecom-build-agents-not-pipelines.md)

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

## 相关主题

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/seangoedeckecom-build-agents-not-pipelines.md)
- [Claude Code Tool Design Evolution](../ch03/076-claude-code.html)
- [RAG Chunking Optimization 2025](../ch01/258-rag.html)
- [Context Engineering: Three Memory Paradigms](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)
- [Karpathy: Vibe Coding to Agentic Engineering](ch04/235-agentic.html)

---

