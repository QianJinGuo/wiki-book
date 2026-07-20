# Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)

## Ch07.041 Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)

> 📊 Level ⭐⭐ | 9.1KB | `entities/wiki-evolver-skill-system-design-gpt55-copilot-session.md`

# Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)

## 摘要

本文记录了一次 GPT-5.5 Copilot 会话中产出的 wiki-evolver Skill 系统设计。核心判断是：**不要再做一个「更强采集器」，而是做一个上层编排 Skill**——`wiki-evolver` 把已有的 `web-content-reviewer` 和 `llm-wiki` 变成一个长期自进化系统。知识库必须持续产生问题、连接、论文、工程实践和下一代 Skill，而不仅仅是被动积累来源。

## 核心要点

### 设计哲学：涌现层的缺失

现有基础设施已经具备了完整的单篇处理闭环（ingest → synthesize → index → log → lint）和导航/治理层（topic-map、review-queue、wiki-health-dashboard），但缺失的是**涌现层（emergence layer）**——一个能从知识库整体中发现模式、产生新问题、生成原创综合的系统。

`wiki-evolver` 的定位不是采集器，而是**知识库的操作系统**：
1. 从 vault 回答问题
2. 发现缺口和矛盾
3. 生成原创综合
4. 产出论文和工程实践
5. 随时间改进自己的 Skills

### Skill 目录结构

```text
~/.hermes/skills/research/wiki-evolver/
├── SKILL.md
├── references/
│   ├── operating-model.md      # 运营模型
│   ├── source-strategy.md      # 来源策略
│   ├── emergence-loop.md       # 涌现循环
│   ├── talk-to-vault.md        # 与知识库对话
│   ├── paper-factory.md        # 论文工厂
│   ├── engineering-practice-factory.md  # 工程实践工厂
│   ├── governance.md           # 治理规则
│   └── output-templates.md     # 输出模板
└── scripts/
    ├── vault-stats.mjs         # 知识库统计
    ├── graph-report.mjs        # 图谱报告
    ├── stale-pages.mjs         # 过期页面检测
    └── source-dedupe.mjs       # 来源去重
```

### Core Contract：每次运行至少产出一个 durable outcome

1. 已摄入/更新的源材料
2. 更新的综合页面
3. 更新的查询/导航页面
4. 新的研究问题或前沿地图
5. 基于 vault 来源的论文/实践草稿
6. 治理修复：index/log/lint/schema/links
7. 改进的 Skill/playbook/checklist

### Operating Loop：六步循环

**Orient → Route → Triage → Synthesize → Emerge → Govern**

每个阶段的职责：

- **Orient**：读取 SCHEMA.md、index.md、最近的 log.md 和相关 queries/
- **Route**：URL/article → web-content-reviewer；Wiki 写入/查询/lint → llm-wiki；广泛演化任务 → wiki-evolver
- **Triage**：除了来源质量，还要评估 `vault_delta`——是否更新了已有 belief、连接了以前分离的 cluster、引入了新 mechanism/pattern/failure mode、能转化成研究/实践产物
- **Synthesize**：更新 entities/、concepts/、comparisons/、queries/，要求有 wikilinks 和 provenance
- **Emerge**：从本轮结果中提取——new questions、contradictions、missing pages、reusable patterns、candidate papers、candidate engineering practices、candidate Skill improvements
- **Govern**：更新 index.md、log.md，运行 structural validation

### Knowledge Ladder：知识阶梯

```text
raw source → claim → mechanism → pattern → comparison
→ principle → playbook → paper → Skill
```

关键判断：知识库真正产生价值，不是因为 source 多，而是因为**高层产物仍然牢牢系在低层 provenance 上**。

### 运行模式

- **feed-scout**：主动发现新来源
- **vault-query**：与知识库对话
- **frontier-map**：绘制前沿问题地图
- **paper-factory**：基于 vault 生成论文/长文
- **engineering-practice-factory**：从理论沉淀工程实践
- **skill-refine**：改进 Skill 本身

### 建议新增的 Query 页面

| 页面 | 回答的问题 |
|------|-----------|
| `queries/research-frontier-map.md` | 现在知识库最值得深挖的前沿问题是什么？ |
| `queries/paper-backlog.md` | 哪些主题已积累到足以写论文/长文？ |
| `queries/engineering-practice-backlog.md` | 哪些理论可以沉淀成工程实践？ |
| `queries/vault-evolution-dashboard.md` | 哪些页面过时、孤立、重复、矛盾、低置信？ |

## 深度分析

### 从采集器到操作系统

传统知识管理工具（RSS 阅读器、书签管理器、笔记应用）的共同局限是：它们是**被动的存储系统**。`wiki-evolver` 的设计理念跳出了这个范式——它是一个**主动的认知系统**，其产出不仅是存储的信息，还包括新的问题、矛盾的发现、原创的综合、可复用的实践和改进的 Skill。

这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的理念高度一致：wiki-evolver 本质上是知识库的 Harness——它不改变底层模型（LLM 的能力），而是通过精心设计的编排流程，把模型能力转化为持续的知识产出。

### Knowledge Ladder 的层次设计

Knowledge Ladder 的设计体现了知识管理的核心挑战：**如何让高层产物保持可溯源性**。从 raw source 到 Skill 的八个层次，每一层都是对下一层的抽象和综合。关键约束是：高层产物必须「牢牢系在低层 provenance 上」——否则知识库会退化为一堆无法验证的「听起来很对」的总结。

这与 wiki 已有的 provenance citation 机制（行内引用标记如 ``）形成了自上而下和自下而上的双向保障。

### 与现有 Skill 生态的关系

wiki-evolver 不是取代现有的 web-content-reviewer 和 llm-wiki，而是把它们编排成一个更大的系统：
- `web-content-reviewer` 负责**守门**（单篇质量把关）
- `llm-wiki` 负责**落库**（写入和维护页面）
- `wiki-evolver` 负责**涌现**（让整个系统产生复利）

这种分层设计避免了单个 Skill 过于复杂的问题，每个 Skill 有清晰的职责边界和升级路径。

### 与 [Agent 记忆系统](../ch03/046-agent.html) 的关联

wiki-evolver 的 Knowledge Ladder 本质上是一个记忆系统的层次模型。从 raw source 到 Skill 的过程，就是从「被动记忆」到「主动认知」的演化。这与 Agent 记忆系统中「工作记忆 → 长期记忆 → 元认知」的三层架构有相似之处。

### 涌现层的工程挑战

涌现层面临的核心工程挑战：
1. **评估困难**：如何量化「新问题的质量」或「矛盾发现的价值」？
2. **成本控制**：全局扫描和综合的计算成本远高于单篇处理
3. **幻觉风险**：越高层的综合越容易引入模型幻觉
4. **循环终止**：如何避免系统陷入无限的自我改进循环？

## 实践启示

1. **先建立底层闭环**：在部署 wiki-evolver 之前，确保单篇处理闭环（ingest → synthesize → index → log → lint）已经稳定运行
2. **从 vault-query 开始**：最轻量的运行模式是 vault-query——先让系统学会「与知识库对话」，再逐步增加涌现能力
3. **Provenance 是生命线**：任何涌现层的产出都必须可追溯到低层来源，否则知识库的可信度会快速下降
4. **Evals 是涌现层的关键**：正如 [AI 原生创业公司](../ch05/019-ai-native.html) 中强调的，没有评估系统就无法实现复利增长
5. **渐进式披露**：参考 Claude Code Skills 的设计，wiki-evolver 的能力应该逐步开放，避免一次性暴露过多复杂性

## 相关实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/052-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](../ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/wiki-evolver-skill-system-design-gpt55-copilot-session.md)

---

