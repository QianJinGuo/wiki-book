---
title: "从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯"
source_url: "https://mp.weixin.qq.com/s/ub1ZOzpjImpVc8plcsMA4w"
author: "微信公众号"
feed_name: "微信公众号"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [agent, memory, claude-code, mem0, letta, rag, agent-framework]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: d45f0ce1d62227cb9ed17a9fa8626d8c7cd90d5e8717ee6e5784d711766453fe
---

# 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯

文章以 Claude Code 的记忆体系（CLAUDE.md + Auto Memory + 上下文压缩）为起点，逐步拆解 4 种 Agent 记忆方案的演化关系与适用场景。

## 问题起源

Claude Code 的记忆体系由四部分组成：
1. 当前会话的上下文历史
2. 长会话接近容量上限后的自动摘要压缩
3. 用户显式维护的 CLAUDE.md、规则文件与个人配置
4. Claude 自动沉淀的项目级 Auto Memory

但核心仍然是"在合适的时机，把规则、摘要和历史重新放回模型上下文"——这与真正面向 Agent 的记忆系统仍有一个关键差异：Claude Code 更擅长管理"项目上下文"，而复杂 Agent 系统还需要管理可检索的事实、长期偏好、任务状态、经验沉淀、跨会话边界以及什么时候应该遗忘。

Agent 记忆的难点：
- 哪些信息应当永久保存，哪些只在当前任务有效
- 新任务到来时，应该检索哪些历史，而不是把全部历史塞回 Prompt
- 用户偏好、项目规范、工具经验与任务状态，是否应该放在同一个记忆层
- 当记忆彼此冲突、过期或不再适用时，系统如何更新、降权和遗忘

## 四层记忆方案演化

```
L0 RAG          → "帮 Agent 找到相关的外部知识"
     ↓ 但 Agent 还需要记住对话过程本身
L1 Summary      → "把长对话压缩成摘要，节省上下文"
     ↓ 但压缩会丢细节，特别是限定词
L2 Reflection   → "不存原文，存对原文的判断"
     ↓ 但谁来管理记忆？外部系统总有判断盲区
L3 Cognitive    → "Agent 自己管自己的记忆"
```

核心变量只有一个：**谁来管理记忆？** L0：检索算法；L1：LLM（只做"概括"这一种操作）；L2：外部记忆系统（LLM 提取 + 多通路检索）；L3：Agent 自己（通过 tool calling 主动读写记忆）。

### L0 RAG：上下文塞的越多效果越差

RAG 只能检索"外部知识"（文档、代码、FAQ），但 Agent 记忆至少需要三种不同的信息类型：

| 信息类型 | 例子 | RAG 能处理吗？ |
|---|---|---|
| 外部知识 | "PostgreSQL 支持 JSONB" | ✅ |
| 对话状态 | "用户说了只用 PostgreSQL" | ❌ |
| 自我认知 | "上次推荐 MySQL 翻车了" | ❌ |

RAG 查到的永远是被动的"相关文档"，不是"关于这个用户的动态事实"。

### L1 Summary：压缩对话，然后丢了关键信息

LangGraph 的双层架构：
- **Short-term Memory**：MemorySaver checkpointer，按 thread_id 隔离会话，每个 super-step 自动存检查点
- **Long-term Memory**：InMemoryStore（或 PostgresStore），按 user_id 命名空间跨会话持久化

核心缺陷：信息衰减。CogCanvas 论文（2026）量化数据：Summary 方案下 exact-match recall 从 93.0% 暴跌到 **19.0%**。限定词 "everywhere" 压缩后变成风格偏好，而且这种衰减是递归的。

### L2 Reflection：不存原文，存判断

Reflection Memory 的核心洞察：不必记住每一句话，只需要记住"这次对话改变了我对什么的判断"。源自 Reflexion 论文（Shinn et al., NeurIPS 2023）。

Mem0 的三合一存储架构：
- **向量库**：存语义 embedding
- **图谱**：存实体和关系
- **KV 存储**：快速查结构化事实，200,000 QPS per node

多信号融合检索公式（Mem0 v2, 2026-04）：
```
最终得分 = 0.5 × 时间衰减 + 0.3 × 语义相似度 + 0.2 × 关系密度
```

Mem0 v2 基准数据：LoCoMo 从 71.4→91.6（+20pts），LongMemEval 从 67.8→94.8（+27pts）。

**关键限制**：图存储只在 Pro tier（$249/月），免费版只有向量+KV。更根本的问题：记忆提取依赖 LLM 判断哪些事实"值得存"，判断错了关键信息永久丢失。

### L3 Cognitive Memory：让 Agent 管理自己的记忆

前三层的共同假设：有一个**外部系统**在管理 Agent 的记忆。Letta（原 MemGPT）的赌注不一样：Agent 应该自己管理自己的记忆。

核心理念来自 UC Berkeley 的 MemGPT 论文——把 LLM 的上下文窗口当成操作系统的虚拟内存来管理。Core Memory 是常驻"RAM"（Always in context），Recall Memory 是"磁盘缓存"（可检索），Archival Memory 是"冷存储"（向量库）。

与 Mem0 的根本区别：不是"外部系统提取→存储→检索"，而是 Agent 通过 tool calling 自己判断什么值得记、什么时候记、什么时候忘了。

**代价**：Letta 不是可插拔组件，需用其 Agent 运行时、REST API、ADE 调试界面。社区比 Mem0 小（22K vs 48K stars），仍偏学术研究。

## 决策框架

### 先问 3 个问题
1. **你的 Agent 需要记住什么？** 外部文档→L0；用户偏好/对话状态→L1；自己摸过的坑→L2
2. **记多久？** 一次对话内→L1；跨会话跨周→L2/L3
3. **记了之后用来做什么？** 检索文档→L0；叙事连贯性→L1；改进决策→L2；持续演进自我模型→L3

### 四层对比

| 维度 | L0 RAG | L1 Summary | L2 Reflection (Mem0) | L3 Cognitive (Letta) |
|---|---|---|---|---|
| 记忆类型 | 外部知识检索 | 对话历史压缩 | 判断型记忆 | 自治记忆 |
| 谁管理 | 检索算法 | LLM（只做概括） | 外部系统（多通路） | Agent 自己 |
| 检索方式 | 纯向量相似度 | 摘要注入 | 向量+关键词+图+时间衰减 | Agent tool calling |
| 信息衰减 | 无衰减（原文保留） | 衰减不可逆（~74pp loss） | LLM 判断误差 | Agent 判断误差 |
| 成本 | 向量库 | LLM 摘要 token | 免费版可用（图存储 $249/mo） | 完整平台 |
| 生产就绪 | ✅ | ✅ | ⚠️ (v2 2026-04) | ⚠️ 学术→产品过渡 |

### 升级信号
- L0→L1：用户抱怨"我问同一个问题，它像第一次见我"
- L1→L2：Agent 在限定条件上反复出错
- L2→L3：你在写越来越多的记忆管理规则

## 参考资料

- LangGraph Memory 文档 — docs.langchain.com
- Mem0 GitHub (48K+ stars) — github.com/mem0ai/mem0
- Letta / MemGPT (22K+ stars) — github.com/letta-ai/letta
- CogCanvas 论文 — arXiv:2601.00821
- Reflexion 论文 — Shinn et al., NeurIPS 2023
