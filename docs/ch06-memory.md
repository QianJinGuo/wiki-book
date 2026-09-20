# Ch06 记忆与上下文管理

> Agent 的大脑：短期/长期/工作记忆的分层架构

> 本章收录 **42 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 5 |
| ⭐⭐ 工程师 | 需编程基础 | 2 |
| ⭐⭐⭐ 专家 | 需ML基础 | 13 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 12 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 10 |

---

## 导读

一个没有记忆的 Agent，每次对话都是一张白纸。

本章探讨 Agent 记忆系统的工程实践：短期记忆（上下文窗口）、长期记忆（持久化存储）、工作记忆（当前任务状态）的分层架构。你会看到 Hermes Agent 的三层记忆如何协作，以及为什么"Memory 不是 RAG"——记忆是有结构的，检索是无结构的。

CPU 缓存的类比特别有启发性：L1（当前上下文）→ L2（会话历史）→ L3（持久记忆），每一层的速度和容量都在做不同的权衡。

上下文窗口是稀缺资源——记忆管理决定了 Agent 的智能上限。

---



---

## 本章内容

### 🧭 本章综合（4 篇）

- [S01. Agent 记忆的演进：从检索问题到治理问题](ch06/S01-memory-evolution)
- [S02. 向量库该不该存在于记忆层？](ch06/S02-vectordb-in-memory-debate)
- [S03. Claude Code vs OpenClaw：两种记忆哲学](ch06/S03-cc-vs-openclaw-memory)
- [S04. 上下文装不下时，怎么办？](ch06/S04-context-overflow-decision)

### ⭐ 入门（5 篇）

- [001. 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯](ch06/001-claude-code-agent)
- [002. AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单](ch06/002-aml-agent-memory-leaderboard-agent)
- [003. Hermes Agent 记忆系统 vs OpenClaw 记忆观](ch06/003-hermes-agent-vs-openclaw)
- [004. Claude Code Agent Memory Systems — L0~L3 四层记忆方案](ch06/004-claude-code-agent-memory-systems-l0-l3)
- [005. Powering scientific discovery](ch06/005-powering-scientific-discovery)

### ⭐⭐ 工程师（2 篇）

- [006. ChatGPT默认模型大升级，GPT-5.5 Instant正式上线：新增记忆来源功能](ch06/006-chatgpt-gpt-5-5-instant)
- [007. OpenChronicle：把AI记忆变成可复用的基础设施](ch06/007-openchronicle-ai)

### ⭐⭐⭐ 专家（13 篇）

- [008. Hermes Agent 爱马仕的三级 memory，到底在记什么？](ch06/008-hermes-agent-memory)
- [009. AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）](ch06/009-ai-jagged-frontier-bottleneck-reverse-salient-mollick)
- [010. Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准 — 让 Markdown 知识库互通](ch06/010-google-open-knowledge-format-okf-v0-1-ai-markdown)
- [011. Agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（MemGuide/STITCH/ACE/Lost in the Middle）](ch06/011-agent-5-4-memguide-stitch-ace-lost-in-the)
- [012. 读完 Claude Code 和 OpenClaw 的 memory 源码，我对 Agent 记忆需要向量数据库产生怀疑](ch06/012-claude-code-openclaw-memory-agent)
- [013. CrewAI Cognitive Memory: 5 认知操作的工程化设计](ch06/013-crewai-cognitive-memory-5)
- [014. 企业级AI记忆基质三层架构：事实/交互/行动记忆](ch06/014-ai)
- [015. The great memory panic of 2026](ch06/015-the-great-memory-panic-of-2026)
- [016. Building is just the beginning: Introducing Discoverability](ch06/016-building-is-just-the-beginning-introducing-discoverability)
- [017. 注意力塌缩与上下文管理](ch06/017-page-017)
- [018. AI Context Layer 框架](ch06/018-ai-context-layer)
- [019. LLM Wiki 知识管理](ch06/019-llm-wiki)
- [020. Skill 编排的 6 种依赖关系](ch06/020-skill-6)

### ⭐⭐⭐⭐ 科学家（12 篇）

- [021. MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异](ch06/021-miroflow-deep-research-agent-code-agent-6)
- [022. Agent Harness 上下文管理：工作集视角](ch06/022-agent-harness)
- [023. Claude Code Openclaw Memory Comparison](ch06/023-claude-code-openclaw-memory-comparison)
- [024. Claude Code 七层记忆架构](ch06/024-claude-code)
- [025. ChatGPT Dreaming V3：长期记忆架构级重构（时效 75.1% / 偏好 71.3% / 算力 -80%）](ch06/025-chatgpt-dreaming-v3-75-1-71-3-80)
- [026. knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集](ch06/026-knowledge-work-plugins-anthropic-4-3-2-ai)
- [027. Memory 不是 RAG：Agent 记忆的系统性框架](ch06/027-memory-rag-agent)
- [028. Memento-Skills — 技能外部记忆让 Agent 自进化（arXiv 2603.18743）](ch06/028-memento-skills-agent-arxiv-2603-18743)
- [029. MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源](ch06/029-mfs-zilliztech-agent-harness-20)
- [030. Qoder 团队知识引擎](ch06/030-qoder)
- [031. 腾讯云Agent Memory：Mermaid无限画布×上下文卸载](ch06/031-agent-memory-mermaid)
- [032. 上下文工程：三种 Agent Memory 方案对比实验](ch06/032-agent-memory)

### ⭐⭐⭐⭐⭐ 大师（10 篇）

- [033. AI Memory Architecture: Deep Dive](ch06/033-ai-memory-architecture-deep-dive)
- [034. Agent 记忆架构：先别急着把 Memory 当数据库](ch06/034-agent-memory)
- [035. 深度拆解 Hermes Agent 记忆系统](ch06/035-hermes-agent)
- [036. AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆](ch06/036-agentmemory-coding-agent)
- [037. Agent-Memory 评测全景：基准、评估与记忆系统](ch06/037-agent-memory)
- [038. TencentDB Agent Memory：符号化短期记忆+分层式长期记忆](ch06/038-tencentdb-agent-memory)
- [039. GBrain — YC CEO Garry Tan 的 Postgres-native AI 第二大脑：5 大设计决策 + 零 LLM 知识图谱 + 8 阶段检索 + Brain⊥Source 正交维度](ch06/039-gbrain-yc-ceo-garry-tan-postgres-native-ai-5-llm)
- [040. Context Window Management Comparison](ch06/040-context-window-management-comparison)
- [041. Knowledge Base Layer Architecture: From RAG to Agent-native Knowledge Context Layer](ch06/041-knowledge-base-layer-architecture-from-rag-to-agent-native)
- [042. MemOS Hermes 记忆插件](ch06/042-memos-hermes)


---

## 本章收束

Memory 不是 RAG：检索解决"找到相关信息"，记忆解决"跨时间保持一致的我"。这一章给出的分层架构——当前上下文、会话历史、持久知识——本质是在给 Agent 设计遗忘策略：记住什么、压缩什么、丢弃什么。上下文窗口永远稀缺，记忆管理的水平就是 Agent 智能的上限。

---
