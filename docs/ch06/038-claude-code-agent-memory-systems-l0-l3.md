# Claude Code Agent Memory Systems — L0~L3 四层记忆方案

## Ch06.038 Claude Code Agent Memory Systems — L0~L3 四层记忆方案

> 📊 Level ⭐⭐ | 4.1KB | `entities/claude-code-agent-memory-four-levels-analysis.md`

# Claude Code Agent Memory Systems — L0~L3 四层记忆方案

> 文章 "从 Claude Code 记忆系统看四层 Agent 记忆方案" (2026-07-07) 的实体整理。以 Claude Code 记忆体系为起点，系统拆解 Agent 记忆的 4 层演化方案。

## 核心演化逻辑

四层方案不是并列选项——它们是演化关系，每一层解决上一层解决不了的新问题：

```
L0 RAG          → "帮 Agent 找到相关的外部知识"
     ↓ 但 Agent 还需要记住对话过程本身
L1 Summary      → "把长对话压缩成摘要，节省上下文"
     ↓ 但压缩会丢细节，特别是限定词
L2 Reflection   → "不存原文，存对原文的判断"
     ↓ 但谁来管理记忆？外部系统总有判断盲区
L3 Cognitive    → "Agent 自己管自己的记忆"
```

核心变量只有一个：**谁来管理记忆？** L0: 检索算法 → L1: LLM（只做概括）→ L2: 外部记忆系统（LLM 提取 + 多通路检索）→ L3: Agent 自己（tool calling 主动读写）。

## 各层详解

### L0 RAG — 外部知识检索
- 只能检索"外部知识"（文档、代码、FAQ），无法处理对话状态和自我认知
- 语义相似 ≠ 因果相关 — 可能检索到无关内容
- Agent 记忆需要三种类型：外部知识 / 对话状态 / 自我认知，RAG 只能处理第一种

### L1 Summary — 对话压缩（LangGraph）
- LangGraph 双层架构：MemorySaver (short-term) + InMemoryStore/PostgresStore (long-term)
- **核心缺陷**：信息衰减不可逆 — CogCanvas 论文 (2026) 量化：exact-match recall 从 93.0% 暴跌到 19.0%（~74pp loss）
- 限定词丢失（"everywhere" → 风格偏好），且递归压缩会放大失真

### L2 Reflection — 判断型记忆（Mem0）
- 核心洞察：不必记住每句话，只需记住"这次对话改变了我对什么的判断"
- 源自 Reflexion 论文（Shinn et al., NeurIPS 2023）
- Mem0 三合一存储：向量库 + 知识图谱 + KV 存储（200K QPS per node）
- 多信号融合检索：0.5×时间衰减 + 0.3×语义相似度 + 0.2×关系密度
- Mem0 v2 基准：LoCoMo 71.4→91.6, LongMemEval 67.8→94.8
- **限制**：图存储仅在 Pro tier ($249/mo)；记忆提取依赖 LLM 判断，无反馈循环

### L3 Cognitive Memory — 自治记忆（Letta/MemGPT）
- Agent 通过 tool calling 自己判断什么值得记、什么时候记、什么时候忘了
- 核心理念：将 LLM 上下文窗口视为操作系统的虚拟内存
  - Core Memory = 常驻 RAM（Always in context）
  - Recall Memory = 磁盘缓存（可检索）
  - Archival Memory = 冷存储（向量库）
- **与 Mem0 的根本区别**：不是"外部系统提取→存储→检索"，而是 Agent 主动推理记忆
- **代价**：Letta 不是可插拔组件，需用完整平台；社区较小（22K stars）；仍偏学术研究

## 决策框架

### 四个升级信号
| L0→L1 | L1→L2 | L2→L3 |
|---|---|---|
| 用户抱怨"我问同一问题，它像第一次见我" | Agent 在限定条件上反复出错 | 你在写越来越多的记忆管理规则 |

### 当前推荐
对于大多数团队：**L0 RAG 起步，L2 Mem0 是当前性价比最均衡的选择**。L3 等 Letta 生态更成熟再评估。

## 与已有实体的关系

- Claude Code Memory Workbench + Agents SDK MCP — 同为 Claude Code 记忆相关，但本实体聚焦于四层记忆架构的横向对比和决策框架

## 相关链接

- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
## 参考

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-agent-memory-four-levels-analysis.md)

---

