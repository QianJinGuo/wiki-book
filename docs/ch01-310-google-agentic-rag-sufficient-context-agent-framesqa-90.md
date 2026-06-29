# Google Agentic RAG — Sufficient Context Agent + FramesQA 90.1% Cross-Corpus

## Ch01.310 Google Agentic RAG — Sufficient Context Agent + FramesQA 90.1% Cross-Corpus

> 📊 Level ⭐⭐ | 12.4KB | `entities/google-agentic-rag-sufficient-context-agent-framesqa.md`

## Google Agentic RAG — Sufficient Context Agent + FramesQA 90.1% Cross-Corpus

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-agentic-rag-sufficient-context-agent-framesqa.md)

> **Background**：Google Research 在 2026-04-27 发布的 vendor 技术博客，宣布 Gemini Enterprise Agent Platform 的 Agentic RAG 能力。核心创新是 **Sufficient Context Agent**（一种 query→draft→gap→iterate 的反思型质量门控），在 FramesQA 基准上达到 90.1% cross-corpus 准确率（vs Vanilla RAG baseline up to 34% improvement）。**注意 vendor framing**——34% 提升限定在 Google 内部 factuality 数据集，未在 BEIR 等公开 benchmark 验证。

## 概述

Google 的 Agentic RAG 框架将单步 RAG 升级为**多 Agent 协同 + 反思循环**架构，目的是解决多源多跳查询的"信息孤岛"问题。

### 单步 RAG 的痛点

> "If the query is 'What are the specs of the server used in Project X?', the system might find documents about Project X, but those documents might only mention a server ID. It won't know to take that ID and perform a second search in another database to find the specs."

Vanilla RAG 是 "retrieve-once-then-generate" 模式，面对需要跨数据源二次检索的查询会失败。

## 三个独有贡献

### 1. 5-Phase 编排 with Persistence

将 RAG pipeline 拆解为 5 个角色 + 5 个阶段：

- **Orchestrator** — 评估请求复杂度，委派给子 agent
- **Planner Agent** — 映射信息路径（"先查 finance，再查 project logs"）
- **Query Rewriter** — 拆解模糊请求为多个精确查询
- **Search Fanout Agent** — 并行 fan-out 到多个数据源
- **LLM Aggregator** — 汇总生成最终响应

**Persistence** 是关键差异——framework 知道自己缺信息时会**持续搜索**直到 context 完整，不会猜测或放弃。

### 2. Sufficient Context Agent — 3-check 质量门

这是文章的核心创新。在允许 LLM 生成最终响应**之前**，Sufficient Context Agent 强制做 3 项检查：

1. **Retrieved snippets** — 评估从 DB 拉到的实际文本块是否覆盖查询
2. **Intermediate draft** — 系统先生成"草稿响应"，Sufficient Context Agent 审视 prompt + draft + snippets 是否匹配
3. **Missing pieces analysis** — 识别具体缺失的子问题（"Found meds + diet, missed allergies"），生成可执行的反馈（"Search specifically for 'rashes' or 'adverse events'"）

如果判定 insufficient，会**显式发信号**回 Query Rewriter 触发新一轮搜索，不是简单地"say I don't know"。

### 3. Cross-Corpus Routing 实测有效

在 FramesQA（824 queries, 2676 PDFs）上验证：

- Vanilla RAG baseline: Google 内部 RAG Engine（advanced retrieval + LLM parser + re-ranker）
- Agentic RAG single-corpus: 在 FramesQA 文档中检索
- Agentic RAG cross-corpus: 加入 3 个干扰数据集，Planner Agent 必须路由到正确数据源

**结果**:
- Cross-corpus 准确率 **90.1%**（Planner 从 4 个 corpus 选对）
- Single-corpus vs cross-corpus **latency 差距 <3%** —— routing overhead 极小
- 相比 Vanilla RAG，factuality 数据集上 **up to 34% 提升**

## 5-Phase 完整流程

医疗场景示例（病人 John Doe 术后药物 + 饮食 + 过敏史查询）：

1. **Orchestration** — Root Agent 解析请求，Planner 识别需查 Pharmacy/Nutrition/Clinical Notes 三个区域
2. **Search (standard step)** — RAG Agent 一次性 fan-out 全部 query
3. **Sufficient Context check** — 检查草稿响应是否覆盖 meds + diet + allergies（实际只覆盖前两个）
4. **Iteration** — Query Rewriter 收到 "Insufficient Context + 反馈（搜 rashes/adverse events）"，RAG Agent 二次深挖 Clinical Notes
5. **Synthesis** — Sufficient Context Agent 二次确认完整，S Synthesis Agent 写最终总结

## 与现有 entity 差异化

| 维度 | 现有 RAG entity | 本 entity |
|------|-----------------|-----------|
| 范式 | 单步 retrieve-then-generate | 多 Agent 协同 + 反思循环 |
| 错误恢复 | 无（partial answer 或 "not found"） | Sufficient Context Agent 显式回环 |
| 多源支持 | 通常限定单一 corpus | Cross-corpus 路由 4 选 1 达 90.1% |
| 质量门控 | 无 | 3-check（snippets + draft + gap） |
| 基准 | BEIR / Natural Questions | FramesQA（Google 内部，multi-hop） |

## FramesQA 例子：M*A*S*H vs Cheers

> "_Of the top two most watched television season finales (as of June 2024), which finale ran the longest in length and by how much?_"

**Vanilla RAG 失败**: "Despite multiple scans, I found no explicit runtimes for M*A*S*H or Cheers. The documents provide viewership data, but not the duration in minutes or hours."

**Agentic RAG 成功**: "The M*A*S*H finale ran for 150 minutes, making it the longest of the top two. It was 52 minutes longer than the Cheers finale, which ran for approximately 98 minutes."

成功路径: 先搜 TV shows → Query Rewriter 触发 "runtimes M*A*S*H Cheers" → RAG Agent 找到 durations → Gemini 计算差值。

## 局限

- **Vendor 框架**: Gemini Enterprise Agent Platform 绑定，架构细节对应 Vertex AI
- **34% baseline 限定在 Google 内部 factuality 数据集**，未在 BEIR/NQ 等公开 benchmark 验证
- **测试集 824 queries 量级偏小**——single-corpus 90.1% 在更难的 corpus mix 上可能掉
- **未披露 sufficient context agent 自身的 LLM 成本**——3-check gate + iteration loop 必然比 vanilla RAG 贵 3-5×
- **未讨论 hallucination 控制**——Sufficient Context Agent 减少的是 "missing context" 类错误，对生成内容的事实正确性保证有限

## 深度分析

1. **质量门控从被动到主动的范式转变**：传统 RAG 的 "retrieve-once-generate" 本质上是一种被动响应模式，而 Sufficient Context Agent 将质量控制提升为主动的「信息缺口驱动迭代」。这意味着系统不再依赖最后一次检索的结果，而是通过中间草稿与原始 prompt 的比对来主动发现缺口——这是一种元认知（meta-cognitive）层面的增强，而非简单的流程扩展。

2. **多 Agent 协作的边界效益递减问题**：文章展示的 5-Agent 架构在 single-corpus 与 cross-corpus 之间 latency 差距 <3%，说明架构 overhead 被有效控制。但需要注意，这是 4-corpus 场景；随着 corpus 数量继续增加（10+），Planner Agent 的路由准确率大概率会下降，而 Sufficient Context Agent 的迭代次数也会增加，整体 cost 可能呈非线性增长。90.1% 的准确率是上限而非普遍值。

3. **34% 提升的基准局限性**：Vanilla RAG baseline 是 Google 内部 RAG Engine（advanced retrieval + LLM parser + re-ranker），而非标准开源实现（如 LangChain+RAG，或 BEIR 基准上的 vanilla BM25+GPT-2）。这意味着 34% 的提升反映的是「内部高级 baseline vs 内部 Agentic 方案」的对比，而非「行业标准 RAG vs Agentic RAG」的对比。在公开基准（BEIR、MultiSpanQA）上的表现仍是未知数。

4. **Vendor 框架绑定的工程债务风险**：文章明确提到架构对应 Vertex AI/Gemini Enterprise Agent Platform。若企业采用此设计，意味着 quality-control loop 的核心逻辑（Sufficient Context Agent）与 Google Cloud 基础设施深度绑定。一旦需要迁移至其他云或 on-premise，3-check gate 的 re-implementation 成本不可忽视。相比之下，Query Rewriter 和 Search Fanout Agent 的逻辑更容易抽象复用。

## 实践启示

1. **Sufficient Context Agent pattern 可复用**——任何需要高可靠性的 RAG 系统都可以借鉴 3-check gate + feedback loop
2. **Cross-corpus 路由 overhead 极低**（<3% latency）——多数据源场景应优先考虑 Agent 路由而非 corpus 合并
3. **Frame failure 比 content failure 重要**——明确说 "this is insufficient" 比 hallucinate 部分答案更可信
4. **Vendor blog 的工程价值**——即使 PR framing，5-Agent 架构的具体角色定义 + 3-check 模式是可迁移的工程模式

5. **Cross-corpus 路由是 Agentic RAG 的核心竞争力**——在多数据源企业场景，Planner Agent 的路由决策质量直接决定系统上限。建议在生产环境中为 Planner Agent 建立 corpus 分类标签体系，并定期用黄金查询集评估路由准确率，而非盲目扩大数据源数量。

## 相关资源

- [FramesQA Dataset (HuggingFace)](https://huggingface.co/datasets/google/frames-benchmark)
- [FRAMES paper (arXiv 2409.12941)](https://arxiv.org/abs/2409.12941)
- [Sufficient Context in RAG (Google Research)](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/)
- [Gemini Enterprise Agent Platform announcement](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform)
- [Cross-Corpus Retrieval docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval)
- [RAG 技术框架的演进方向](/ch01-193-rag技术框架的演进方向/)（同主题已有 entity）
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-agentic-rag-sufficient-context-agent-framesqa.md)

## 相关实体
- [Ai Cambrian Google Agentic Rag Sufficient Context Cross Corpus 20260606](/ch04-107-google-agentic-rag-跨语料库框架-充分上下文智能体-5-阶段管线/)
- [is grep all you need? — 检索 × harness × 交付方式耦合三元组（pwc 论文 arxi](/ch05-044-is-grep-all-you-need-检索-harness-交付方式耦合三元组-pwc-论文-arxi/)
- MOC

---

