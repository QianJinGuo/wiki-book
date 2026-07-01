# Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search

## Ch04.399 Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search

> 📊 Level ⭐⭐ | 6.4KB | `entities/claude-code开发负责人-为何放弃rag而选择agentic-search.md`

# Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code开发负责人-为何放弃rag而选择agentic-search.md)

## 摘要

Boris Cherny（Claude Code 开发负责人）在 X 上分享了 Anthropic 在 Claude Code 中从 RAG 转向 Agentic Search 的技术决策。早期 Claude Code 使用 RAG 算法配合本地向量数据库进行知识检索，但团队发现 Agentic Search 通常效果更好——更简单，且不存在安全性、隐私性、数据过时性和可靠性方面的问题。微信公众号作者基于自身 RAG 实践经验对此进行了深度分析，指出 Agentic Search 在复杂推理场景下优势明显，但在简单问答场景下比 RAG 更慢、更耗 Token，并提出了 Agentic RAG 的混合方案。

## 核心要点

1. **Anthropic 的技术选择** — Claude Code 团队从 RAG（向量数据库 + 检索增强生成）转向 Agentic Search（让 Agent 自主决定何时检索、检索什么），核心驱动力是简化架构并解决 RAG 的运维复杂度问题。

2. **RAG 的四大结构性缺陷** — 数据管道维护复杂（清洗、分块、embedding、索引更新）、检索结果不稳定（语义相似≠相关）、无法处理需要推理的复杂查询、向量数据库本身带来安全和运维负担。

3. **Agentic Search 的核心优势** — 让 Agent 自主判断"需要检索什么"而非"预先检索再生成"，在复杂场景下效果显著优于 RAG 的两阶段模式。Agent 可以进行多轮检索、交叉验证、逐步逼近答案。

4. **Agentic Search 的局限性** — 在简单问题上比 RAG 更慢、更消耗 Token。对于"已知答案在某个文档中"的简单查找场景，RAG 的效率优势仍然明显。

5. **Agentic RAG 混合方案** — 将不同领域的 RAG 检索作为 Tools，让 Agent 决定何时检索、是否需要多轮检索。这种方案结合了 RAG 的效率和 Agentic Search 的推理能力，是务实的工程选择。

## 深度分析

### RAG vs Agentic Search 的本质差异

两者的核心差异在于**检索决策的时机和主体**：

| 维度 | RAG | Agentic Search |
|------|-----|----------------|
| 检索时机 | 用户提问前预处理 | Agent 运行时动态决定 |
| 检索主体 | 系统自动（语义匹配） | Agent 自主判断 |
| 适用场景 | 简单问答、FAQ | 复杂推理、多步查询 |
| 架构复杂度 | 高（pipeline 维护） | 低（直接调用工具） |
| Token 成本 | 低（精确检索） | 高（多次调用） |
| 准确性 | 受 embedding 质量限制 | 受 Agent 推理能力限制 |

Boris Cherny 的判断代表了 Anthropic 对这一技术选型的官方立场：**在 Agent 能力足够强的情况下，用 Agent 的推理能力替代 RAG 的预处理 pipeline 是更优的架构选择**。

### 与 Claude Code 架构的关系

Claude Code 本身就是一个高度 Agent Harness 化的系统——它给模型提供了文件系统访问、终端、浏览器等工具。在这种架构下，让 Agent 自己去"翻文件、搜代码、查文档"比预先构建向量数据库更自然，也更符合"像人一样工作"的设计理念。

这与 [Claude Code 源码分析](ch03/074-claude-code.md) 中揭示的架构一致：Claude Code 的核心不是 RAG pipeline，而是工具编排能力。

### 实践中的平衡策略

原文作者的经验很有参考价值：**不要将 RAG 和 Agentic Search 视为非此即彼的选择**。实际工程中，最佳策略往往是分层处理：

- **高频简单查询** → RAG（效率优先）
- **低频复杂推理** → Agentic Search（准确性优先）
- **混合场景** → Agentic RAG（Agent 作为编排者，RAG 作为工具之一）

这种分层思路与 Agent 记忆系统 的设计哲学一致：不同类型的信息需要不同的检索和管理策略。

### 对知识管理工具的影响

这一趋势对 知识管理 领域有深远影响。传统 RAG 依赖的"预处理→索引→检索"pipeline 正在被"Agent 直接访问原始数据"的范式取代。这意味着知识库的组织方式需要从"为机器检索优化"转向"为人类和 Agent 共同可读"的方向演进。Wiki 和文件系统等结构化知识库反而可能比向量数据库更适合 Agentic Search 场景。

## 实践启示

- **知识检索方案选型**：区分"简单问答"和"复杂推理"场景。高频 FAQ 场景 RAG 仍然高效；需要多步推理的场景优先考虑 Agentic Search
- **RAG 的运维成本**：数据管道的维护复杂度经常被低估——数据清洗、分块策略、embedding 模型更新、索引一致性，每一项都需要持续投入
- **渐进式迁移**：不必一次性废弃 RAG，可以让它成为 Agent 的工具之一而非默认架构。通过 Agentic RAG 实现平滑过渡
- **关注 Claude Code 的技术选型**：作为 Anthropic 的旗舰 Agent 产品，Claude Code 的架构决策代表了行业最佳实践的方向
- **Token 成本管理**：Agentic Search 的 Token 消耗显著高于 RAG，需要在效果和成本之间找到平衡点

## 相关实体

- Agentic Search
- RAG
- Agent Harness
- Agent 记忆系统
- [Claude Code 源码分析](ch03/074-claude-code.md)
- [Karpathy: Agentic Engineering](ch04/123-karpathy-vibe-coding-agentic-engineering.md)

---

