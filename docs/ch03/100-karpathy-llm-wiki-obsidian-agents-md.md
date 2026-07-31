# Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

## Ch03.100 Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

> 📊 Level ⭐⭐ | 7.9KB | `entities/karpathy-llm-wiki-obsidian-tutorial-shuge-2026.md`

# Karpathy LLM Wiki 搭建实战——Obsidian + AGENTS.md 实现三层架构与三大操作

## 核心洞察：维护成本外部化

Andrej Karpathy 的 LLM Wiki 方法论根基：**维护知识库累人的地方不是读和想，而是"记账"**——更新交叉引用、保持摘要不过时、标注矛盾、跨页面维持一致性。这正是人类放弃维护 wiki 的原因——维护成本增长比价值增长快。

LLM 把记账接过去了，wiki 才能持续被维护。Karpathy 关联到 Vannevar Bush 1945 年的 Memex 设想——LLM 补上了"谁来做维护"这块拼图。

## 三层架构

```mermaid
graph TB
    AG[Agent] --> TB[Tool Bus]
    TB --> FT[Function]
    TB --> MT[MCP]
    MT --> MCS[Server]
```


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

这与 [LLM Wiki 架构](../ch01/1274-llm.html) 实体互补——该实体侧重概念框架，本文侧重具体实现。也与本 wiki 自身的运作模式一致（见 [Hermes Skills LLM Wiki](../ch07/017-hermes-skill.html)）。

## 深度分析

### 维护成本外部化的经济原理

LLM Wiki 的核心经济洞察是：**知识库的维护成本曲线与价值增长曲线存在剪刀差**。人类手动维护时，随着规模增长，交叉引用复杂度呈超线性增长（每新增一个实体，需要更新 N 个相关页面），而新增价值呈线性甚至对数增长。两条曲线交叉的点，就是人类放弃维护的时刻。

LLM 将交叉引用、摘要更新、矛盾标注等「记账工作」的边际成本压到接近零，使得维护成本曲线从超线性变为亚线性。当维护成本不再超过新增价值时，wiki 的持续增长才变得可持续。这也解释了为什么 Karpathy 将此方法关联到 Vannevar Bush 1945 年的 Memex 设想——技术手段终于补上了「谁来做维护」这块拼图。

### 三层架构的职责分离与安全边界

Karpathy 的 LLM Wiki 提出明确的**职责分离原则**：Schema 层定义规则和行为边界（AGENTS.md 告诉 LLM「该怎么干活」），Raw 层是只读的资料库（不可修改），Wiki 层才是 LLM 全权维护的输出空间。

这种架构设计天然形成了安全边界：即使 LLM 在其维护的 Wiki 层做出错误修改，Raw 层的原始资料不受影响，可以通过回滚或重新摄取恢复。结合 Obsidian 的本地文件系统 + Git 版本控制，每一轮 Ingest 操作都可追踪、可审计、可撤销。

### Ingest 操作的系统性影响

Ingest 不是简单的「资料入库」，而是一次**触点涉及 10-15 个页面的连锁更新**：LLM 读完整篇资料后，提取关键信息、整合进现有 Wiki 页面、更新相关实体的摘要、修订所属领域的综述页面、标注新出现的信息矛盾。这远超出人类维护者愿意投入的工作量，却是 LLM 在单次 Ingest 操作中的标准处理范围。

Consolidate（定期整合）是 Ingest 的补充，用于解决多次 Ingest 之间累积的矛盾，保持知识库的一致性。而 Query 则利用了这个持续累积的知识库回答问题，每次查询的质量都会随着知识库厚度的增加而提升。

### LLM Wiki vs RAG 的范式差异

本文的关键对比框架超越了单纯的技术选型：RAG 每次从零检索、问完即散，知识不累积、产物不可见、不发现矛盾、用户重新上传才能更新；LLM Wiki 摄取一次就整合 10-15 个页面，知识持续累积变厚，产物是可读可编辑的 Markdown 文件。

这里的关键差异在于**知识的累积性**。RAG 是「按需检索」模式——每次查询都是独立事件，不产生跨会话的知识沉淀。LLM Wiki 是「持续建设」模式——每次 Ingest 都在知识库上留下永久性的增量改进，知识是**持久且复利的**（persistent, compounding artifact）。

### 与现有 LLM Wiki 方法论的协同

本 wiki 的运作模式与 Karpathy 的 LLM Wiki 方法论高度一致：通过 [Hermes Skills LLM Wiki](../ch07/017-hermes-skill.html) 技能实现自动化的 Ingest 和 Consolidate；通过 AGENTS.md（即本文的 Schema 层）定义 wiki 的组织方式和编辑规范。[LLM Wiki 架构](../ch01/1274-llm.html) 实体则从更高维度描述了这一模式的理论基础。

## 实践启示

1. **降低维护成本比增加知识产出更重要**：构建知识库时，重点应放在如何让维护自动化（而非如何让内容更丰富）。人类的精力应集中在资料选择和提问上，而非在交叉引用和摘要更新上。

2. **三层架构是 LLM Wiki 的基础安全设施**：Schema（规则）→ Raw（只读资料）→ Wiki（LLM 维护），每一层的职责边界必须清晰。即使 LLM 出错，原始资料不受影响。使用 Git + 本地文件系统（如 Obsidian）让每次修改都可审计可回滚。

3. **一次 Ingest 触碰 10-15 个页面是核心优势**：这表明 LLM Wiki 的深度整合能力远超人工维护的效率。在系统设计时，应为每次知识摄入分配足够的处理时间，确保「触及面」足够广。

4. **不要低估 Schema 层的设计成本**：AGENTS.md 的质量直接影响 LLM 的输出质量。需要明确 wiki 的组织方式、页面类型、工作流和链接规则（如段落级引用标记、矛盾标注格式）。

5. **LLM Wiki 与 RAG 不是替代关系而是互补关系**：RAG 适合需要实时访问外部资料的场景（如客服问答），LLM Wiki 适合需要持续累积领域知识的场景（如研究笔记、项目文档）。对于本 wiki，LLM Wiki 是主模式，RAG 可作为 Query 阶段的补充检索手段。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/karpathy-llm-wiki-obsidian-tutorial-shuge-2026.md)

---

