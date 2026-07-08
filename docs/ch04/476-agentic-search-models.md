# Agentic search models

## Ch04.476 Agentic search models

> 📊 Level ⭐⭐ | 5.5KB | `entities/agentic-search-models-softwaredoug.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-search-models-softwaredoug.md)

## Summary
7×8=56 - Article ingested from newsletter candidate pipeline.

## Notes
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-search-models-softwaredoug.md)

## 相关实体
- [Claude Code开发负责人：为何放弃RAG而选择Agentic Search](../ch03/075-claude-code.html)

## 深度分析
传统搜索系统的架构根植于模块化的"乐高思维"：BM25 负责词项匹配，嵌入模型承担语义相似度计算，重排器优化结果顺序，查询分类器做意图识别。这些组件各自独立、边界清晰，通过预定义的管道串联组合。这种设计在过去 20 年被证明有效，但它存在根本性局限——**每个组件只"看见"自己负责的局部，无法从全局视角理解搜索过程**。
Agentic Search（代理式搜索）的出现彻底改变了这一范式。与其让人类工程师手动编排各个模块的调用顺序，不如训练一个 LLM 作为"中枢指挥官"，让它决定何时调用何种检索工具。检索工具退化为薄包装（thin wrappers），暴露给 Agent 的只是简单的关键词检索、向量相似度搜索或过滤器操作，而**真正的决策智能交给专用的 Agentic Search Model**。

### 前沿模型的 80/20 困境
以 GPT-5 和 Sonnet 为代表的前沿大模型在通用搜索场景中表现不俗——它们具备强大的查询理解和内容匹配能力，能覆盖约 80% 的用户需求。然而**真正决定搜索系统商业价值的，恰恰是剩下的 20%**。这 20% 包含的是垂直领域的隐性知识：电商平台用户搜索"bistro tables"实际上想找的是"小型户外餐桌"而非餐厅设备；时尚搜索场景中用户更倾向于点击深色或纯色款式而非复杂图案。这些知识不存在于通用模型的训练数据中，也不是简单的提示工程能解决的。
Doug 指出了一个关键认知偏差：前沿模型对"搜索"的理解是基于 Web Search 形成的直觉——它们假设底层的检索工具近乎完美、延迟极低、覆盖极广。但现实中的企业搜索场景恰恰相反：数据规模有限、领域高度专注、用户行为具有高度垂直规律性。这导致用前沿模型做垂直搜索时，需要大量"上下文工程"来约束模型行为，成本极高。

### Agentic Search Models 的崛起
SID 以 [SID-1 模型](https://www.sid.ai/research/sid-1) 率先入场，随后 Glean 发布 Waldo，Charcoal 等初创公司开始提供针对用户语料的定制化方案。这些模型的共同特点是：**训练目标聚焦于搜索任务本身，而非通用语言理解**。它们不是为了"理解世界"，而是为了"orchestrate retrieval tools"。SID-1 相比 GPT-5 实现了更小的参数规模和更低的延迟，这意味着它更适合集成到需要实时响应的大规模搜索系统中。
这一趋势的深层含义在于：搜索系统的设计哲学正在从"构建复杂管道"向"部署专用模型 + 简单检索原语"迁移。未来的搜索架构可能是：底层是轻量、可扩展的基础检索工具（BM25、稠密向量检索、简单过滤），上层是理解业务域的 Agentic Search Model 做决策编排。如果嵌入模型的市场能从 Hugging Face 上数以百计的垂直领域模型中获益，那么 Agentic Search Models 没有理由不会走上同样的路径——为金融、法律、电商、招聘等不同领域训练专门的模型。
当然，当前的 Agentic Search Models 在延迟上还未达到直接驱动 Site Search 的标准，但从技术演进曲线看，这一瓶颈的突破只是时间问题。

## 实践启示
**1. 重新评估 RAG 的必要性**
如果你的垂直搜索场景正在依赖复杂的 RAG 管道来弥补通用 LLM 的领域知识不足，应该开始关注 Agentic Search Models 这一替代路径。专用模型可能在更低的推理成本下实现更好的领域适配。
**2. 关注"最后一公里"的领域知识捕获**
搜索系统的增量价值往往不在于召回率的普遍提升，而在于对特定用户行为模式的理解。投入资源建立结构化的领域知识库（什么查询对应什么意图、什么内容类型转化率更高），是 Agentic Search Model 发挥效果的前提条件。
**3. 架构思路：从"编排组件"转向"委托决策"**
传统思路是不断在管道中加入新的处理节点（Reranker、Query Classifier、Filter），形成越来越厚的 Middleware。Agentic Search 的思路是倒过来——简化底层工具，让模型拥有更大的决策自由度。这是架构层面范式转移，需要重新思考评估标准和监控方式。
**4. 密切跟踪新兴玩家**
SID-1、Waldo、Charcoal 等产品仍处于早期阶段，但方向已经明确。对于有自研搜索系统能力的团队，可以开始做 PoC；对于没有自研能力的团队，可以关注这些产品的企业级落地进展。

---

