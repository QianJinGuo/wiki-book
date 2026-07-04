# Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

## Ch03.130 Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

> 📊 Level ⭐⭐ | 2.8KB | `entities/karpathy-llm-wiki-obsidian-tutorial-shuge-2026.md`

# Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

## 核心洞察：维护成本外部化

Andrej Karpathy 的 LLM Wiki 方法论根基：**维护知识库累人的地方不是读和想，而是"记账"**——更新交叉引用、保持摘要不过时、标注矛盾、跨页面维持一致性。这正是人类放弃维护 wiki 的原因——维护成本增长比价值增长快。

LLM 把记账接过去了，wiki 才能持续被维护。Karpathy 关联到 Vannevar Bush 1945 年的 Memex 设想——LLM 补上了"谁来做维护"这块拼图。

## 三层架构

| 层 | 角色 | 内容 |
|---|------|------|
| Schema | 行为配置 | AGENTS.md / CLAUDE.md：定义 wiki 组织方式、页面类型、工作流 |
| Raw | 原始资料只读 | 来源 PDF、文章、笔记，只读不改 |
| Wiki | LLM 维护的知识库 | LLM 全权维护，人不需要直接编辑 |

## 三大操作

1. **Ingest**：新资料加入时，LLM 读完整篇、提取信息、整合 wiki、更新实体、修订综述、标注矛盾。一次摄取同时触碰 10-15 个页面。
2. **Consolidate**：定期整合，解决矛盾，保持一致性。
3. **Query**：基于累积的 wiki 回答问题，而非从零检索。

## RAG vs LLM Wiki 对比

本文提供了结构化对比表：RAG 不累积/产物不可见/不发现矛盾/用户重新上传才能更新；LLM Wiki 持续累积/可读可编辑的 markdown/主动标注矛盾/维护成本趋近于零。

这与 [LLM Wiki 架构](ch01/606-llm.md) 实体互补——该实体侧重概念框架，本文侧重具体实现。也与本 wiki 自身的运作模式一致（见 [Hermes Skills LLM Wiki](ch04/256-skill.md)）。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/karpathy-llm-wiki-obsidian-tutorial-shuge-2026.md)

---

