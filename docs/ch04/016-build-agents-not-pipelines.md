# Build agents, not pipelines

> 📊 Level ⭐⭐ | 8.1KB

## 核心要点

用库与框架的类比清晰区分LLM应用中的pipeline与agent架构，预测性与灵活性的权衡讨论有实用价值

## 深入分析

> 来源：[原文存档](https://www.seangoedecke.com/build-agents-not-pipelines/)

本篇来自 TLDR AI Newsletter 推荐。

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

### 推理预算的调节旋钮：从2x漂移到10%-20%封顶

Agent的运行时长由LLM自己判断"是否完成"来决定——同一问题可能几轮收敛，也可能跑上百轮，费用从几美分到数美元不等；用户数据的细微变化就可能让每个任务的耗时翻倍，延迟与成本随之2x起步。但pipeline并非天然免疫：只有在不使用推理模型、或用结构化输出禁止模型"think out loud"时，成本才是确定的。原文给出的关键工程细节是：各frontier模型API都暴露了显式的reasoning effort参数，可以把"耗时变长"的漂移上限压到10%-20%，而agent循环的漂移是2x量级——可预测性不是二选一，而是一个可以用旋钮调节的连续谱。市场的最终投票同样说明问题：最成功的LLM产品（Claude Code、Codex、Cursor、Copilot等）全是agent，因为编程这类任务复杂到用pipeline根本做不出可用的产品。

### 极简工具的胜利：grep为何胜过AST与向量索引

原文用[coding agent](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/coding-agent-architecture.md)给出了最具体的对照：给agent配一个grep和一个读文件的工具，让它自己判断哪些代码块与当前文件相关，效果就足够好；而pipeline必须在运行前替模型解决同一问题——要么遍历AST找出"对当前文件有贡献"的代码，要么对整个代码库做语义嵌入加最近邻检索（即RAG），实践证明两者都不如极简工具加模型自主搜索。这把[RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md)的失败推进到机制层：语义嵌入与余弦相似度这类工具承载不了"判断哪些信息与当前问题相关"的任务，因为这个判断往往与解决问题本身一样难。行业最终"倒退"回让agent做纯文本搜索、像人一样翻找，不是技术退步，而是承认相关性判断无法被前置外包给检索组件。

### 边界条件：本地模型的Context天花板与KV缓存经济学

Agent的灵活性有物理代价：自主抓取context意味着几乎总是摄入超量数据，循环执行又让每轮对话进一步膨胀context。原文给出三条让frontier API场景"无所谓"的理由：大context窗口、模型在最初200k token内表现稳定、KV caching让重复传递同一大块context意外地便宜。但[context window经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md)在本地模型上完全不成立——context窗口直接吃VRAM，多数本地部署停留在32k甚至6k以内，给不了agent所需的迴旋空间。这划出一条清晰的架构边界：云端frontier API优先agent，本地小context部署仍是pipeline的主场。

## 实践启示

1. **架构选型先问两个问题**：context会不会超出单次prompt？是否需要"先行动、再根据结果调整"的反应式执行？两者皆否则pipeline足够；任一为是，就应认真考虑agent。
2. **把推理预算做成显式旋钮**：用结构化输出禁止模型"think out loud"，配合API的reasoning effort参数，可将成本漂移从2x以上压到10%-20%——选pipeline不必以放弃全部灵活性为代价。
3. **给agent配工具时奉行极简主义**：grep加读文件级别的原语往往胜过精心设计的检索索引；相关性判断交给模型在循环中完成，别试图在pipeline里前置解决。
4. **想给不同任务用不同模型，把路由藏进tool内部**：例如让web_search工具内部用便宜模型摘要网页，主循环保持单一模型——这比多模型pipeline更能保住原始数据中的信号。
5. **押注agent的future-proof红利**：agent把更多控制流委托给LLM，因此新模型的能力进步在agent架构下兑现最大；对当前还太难的任务，值得提前按agent架构设计，赌模型成熟时正好可用。
6. **别拿"workflow更安全"当架构借口**：prompt injection在两种架构下攻击面相同，无论选哪种都必须清洗用户内容并复查LLM触发的动作（参见[Prompt Injection 防御](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md)）；pipeline只额外给你可追溯性，并不给你安全。

## 相关主题

- [原文存档](https://www.seangoedecke.com/build-agents-not-pipelines/)
- [Claude Code Tool Design Evolution](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-tool-design-evolution-anthropic.md)
- [RAG Chunking Optimization 2025](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rag-chunking-optimization-2025.md)
- [Context Engineering: Three Memory Paradigms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-engineering-three-memory-paradigms.md)
- [Karpathy: Vibe Coding to Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-to-agentic-engineering.md)

---

