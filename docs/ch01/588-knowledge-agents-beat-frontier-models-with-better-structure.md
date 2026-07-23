# Knowledge Agents: Beat Frontier Models with Better Structure

## Ch01.588 Knowledge Agents: Beat Frontier Models with Better Structure

> 📊 Level ⭐⭐ | 7.6KB | `entities/knowledge-agents-beat-frontier-models.md`

# Knowledge Agents: Beat Frontier Models with Better Structure

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/knowledge-agents-beat-frontier-models.md)

## 摘要

James Wang 提出的 "Knowledge Agent" 模式是一种将领域专业知识预处理为结构化知识单元（concept docs + thesis docs），通过 hybrid BM25 + semantic search 注入 agent 上下文的方法。该方法使本地运行的小模型（如 Qwen 3.6 27B）在特定领域超越了 Claude Opus 等前沿模型，同时大幅降低推理成本。作者已构建 12 个 specialist knowledge agents，覆盖金融分析、企业知识、医学研究等领域，并开源了通用模板。

## 核心要点

### Knowledge Agent 的知识架构

Knowledge Agent 的核心创新不在于检索算法本身，而在于**知识的预处理和组织方式**。James Wang 将原始文档转化为四层结构：

1. **Source extractions**（原始来源）：将原始文档（包括图像、图表）转化为纯文本 markdown，其中最昂贵的步骤是用模型详细描述图像和图表内容
2. **Concepts**（概念文档）：规范化知识库的"百科全书条目"，提供基础概念的定义和解释
3. **Theses**（论点文档）：跨来源的综合性观点提炼，捕捉多文档中浮现的主题和论点
4. **PRIMER.md**：自更新的摘要和引导文件，帮助 agent 在启动时定位自身角色——因为 AI agent 启动时没有任何记忆

这种四层结构的关键在于，它不是简单的文档切片（chunking），而是对知识进行**语义级重构**。概念文档提供检索的锚点，论点文档提供跨文档的综合视角，两者配合使得检索质量远高于朴素 RAG。

### 多轮检索策略

Knowledge Agent 的检索采用**多轮搜索**（multi-pass search）策略。作者通过大量实验确定了三轮搜索为最优平衡点：

- 一轮搜索对于复杂查询远远不够
- 十轮搜索可能淹没 agent，拉入整个知识库
- 三轮搜索提供了足够的广度而不至于信息过载

对于简单查询（如"什么是泰国银行？"），agent 需要短路这个过程，直接给出答案。这种"智能切换"需要写入 agent 的指令中，虽然不是完美的方案，但在实践中效果良好。

一个典型的复杂查询示例："描述亚洲金融危机期间泰国银行的资产负债表，并说明其中有哪些可迁移的经验教训适用于今天的美国。"这类问题需要 agent 在第一轮搜索中发现"泰国银行是央行"，第二轮搜索中类比到"美联储"和"美元"，第三轮搜索中理解"储备货币地位"的差异。

### Hybrid 检索：BM25 + Embedding

检索系统采用 BM25（精确关键词匹配）与 embedding-based semantic search（语义相似度）的双路召回。作者使用本地 embedding 模型 BGE-M3（此前使用 OpenAI text-embedding-3-small），处理数千文档的总成本不到一美元。

关键的 insight 是：单纯的关键词搜索会错过语义相关的文档（"poodle" 搜索不到"dog food"），而单纯的语义搜索可能忽略精确匹配。两者结合才能覆盖完整的检索需求。

## 深度分析

### 实验结果：模型均衡化效应

作者使用三模型评审团（Claude Opus、Codex/GPT-5.5、DeepSeek v4 Pro）对答案进行评分，得出以下关键发现：

**无 harness 时**：Claude Opus 在困难查询上表现最佳，印证了其作为顶级前沿模型的地位。Sonnet 表现也相当不错。DeepSeek v4 Pro 表现令人失望。

**有 harness 时**：Knowledge agent harness 基本上**均衡化了所有模型**的表现，包括本地运行的 Qwen 3.6 27B。这意味着：
- 前沿模型（如 Opus）从 harness 中获益有限，因为其参数化知识已经足够丰富
- 小模型获益巨大，因为 harness 补足了其参数化知识的不足
- 在简单查询上，harness 甚至可能**损害**大模型的表现（引入无关信息）

这一发现与 RAG（Retrieval-Augmented Generation）的基本原理一致：当知识已经在上下文中时，模型的参数化知识变得不那么重要。但 Knowledge Agent 的创新在于，它不只是"检索-拼接"，而是对知识进行结构化预处理后再注入。

### 与传统 RAG 的区别

Knowledge Agent 与朴素 RAG 的核心区别在于知识的**预处理粒度**和**组织方式**：

| 维度 | 朴素 RAG | Knowledge Agent |
|------|---------|----------------|
| 知识单元 | 文档切片（chunks） | 概念文档 + 论点文档 |
| 检索方式 | 单轮语义搜索 | 多轮 hybrid 搜索 |
| 知识组织 | 扁平化 | 四层结构（source → concept → thesis → primer） |
| 成本 | 低（仅 embedding） | 高（跨文档 combinatorics 分析） |
| 质量 | 中等 | 高（尤其是复杂、跨文档查询） |

知识提取过程的成本极高——每个文档需要与所有其他文档进行交叉分析，这是一个组合爆炸问题。但这正是高质量检索的基础。

### 成本与经济效益

Knowledge Agent 模式的一个核心经济驱动是 Anthropic 的计费变更。James Wang 计算，如果 Claude Code 的 headless 模式按 API 价格计费，他每月的 token 成本将超过 2000 美元。通过 Knowledge Agent + 本地 Qwen 模型，他将这一成本降至几乎为零（仅需一次性硬件投资）。

这一经济逻辑与 [Moebius](https://github.com/QianJinGuo/wiki/blob/main/entities/moebius.md) 的"task-specific specialist > general-purpose giant"范式形成共振——在明确场景下，小模型 + 结构化知识 > 大模型 + 通用推理。

## 实践启示

1. **知识预处理是关键投资**：高质量的 concept docs 和 thesis docs 是 Knowledge Agent 效果的基础，虽然初始 token 成本高，但长期回报显著
2. **三轮搜索是经验最优**：多轮检索策略需要在广度和噪声之间找到平衡，三轮是一个经过验证的起点
3. **开源模板可复用**：`github.com/j-wang/knowledge-agent-template` 提供了领域无关的通用框架，任何人可以基于此构建自己的 Knowledge Agent
4. **本地模型 + 结构化知识 = 前沿级表现**：Qwen 3.6 27B + Knowledge Agent harness 在作者的测试中达到了接近 Claude Opus 的水平
5. **AGENTS.md 是非 Claude 系统的必要配置**：如果使用非 Claude agent，需要将 CLAUDE.md 的内容复制到 AGENTS.md 中

## 相关实体

- [Moebius](https://github.com/QianJinGuo/wiki/blob/main/entities/moebius.md) — 任务特化小模型超越通用大模型的另一范式
- RAG（Retrieval-Augmented Generation）是 Knowledge Agent 的理论基础和差异化点
- [Claude Code 动态工作流](../ch09/092-claude-code-dynamic-workflows.html) — Knowledge Agent 的主要使用场景之一

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/knowledge-agents-beat-frontier-models.md)

---

