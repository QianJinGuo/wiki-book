# Ch06 记忆与上下文管理

> Agent 的大脑：短期/长期/工作记忆的分层架构

> 本章收录 **54 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 45 |
| ⭐⭐⭐ 专家 | 需ML基础 | 7 |

---

## 导读

一个没有记忆的 Agent，每次对话都是一张白纸。

本章探讨 Agent 记忆系统的工程实践：短期记忆（上下文窗口）、长期记忆（持久化存储）、工作记忆（当前任务状态）的分层架构。你会看到 Hermes Agent 的三层记忆如何协作，以及为什么"Memory 不是 RAG"——记忆是有结构的，检索是无结构的。

CPU 缓存的类比特别有启发性：L1（当前上下文）→ L2（会话历史）→ L3（持久记忆），每一层的速度和容量都在做不同的权衡。

上下文窗口是稀缺资源——记忆管理决定了 Agent 的智能上限。

---



---

## 本章内容

- [001. 追求-ai-记忆力的路线下rag-是否终将被抛弃](ch06/001-ai-rag)
- [002. Mem0、Letta、Zep 和 VoltMem —— Agent记忆系统该选哪个？](ch06/002-mem0-letta-zep-voltmem-agent)
- [003. Agent 记忆架构：先别急着把 Memory 当数据库](ch06/003-agent-memory)
- [004. 深度拆解 Hermes Agent 记忆系统](ch06/004-hermes-agent)
- [005. AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆](ch06/005-agentmemory-coding-agent)
- [006. Claude Code vs OpenClaw 记忆：向量数据库是否必要](ch06/006-claude-code-vs-openclaw)
- [007. Agent-Memory 评测全景：基准、评估与记忆系统](ch06/007-agent-memory)
- [008. Claude Code Openclaw Memory Comparison](ch06/008-claude-code-openclaw-memory-comparison)
- [009. Context Window Management Comparison](ch06/009-context-window-management-comparison)
- [010. Knowledge Base Layer Architecture: From RAG to Agent-native Knowledge Context Layer](ch06/010-knowledge-base-layer-architecture-from-rag-to-agent-native)
- [011. TencentDB Agent Memory：符号化短期记忆+分层式长期记忆](ch06/011-tencentdb-agent-memory)
- [012. Memory 不是 RAG：Agent 记忆的系统性框架](ch06/012-memory-rag-agent)
- [013. Hermes Agent 爱马仕的三级 memory，到底在记什么？](ch06/013-hermes-agent-memory)
- [014. 参数化 Memory 漫谈：从 MAML 到测试时学习的完整谱系](ch06/014-memory-maml)
- [015. 上下文工程 - 三种Memory方案对比](ch06/015-memory)
- [016. AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）](ch06/016-ai-jagged-frontier-bottleneck-reverse-salient-mollick)
- [017. MemOS Hermes 记忆插件](ch06/017-memos-hermes)
- [018. Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准 — 让 Markdown 知识库互通](ch06/018-google-open-knowledge-format-okf-v0-1-ai-markdown)
- [019. CrewAI Cognitive Memory: 5 认知操作的工程化设计](ch06/019-crewai-cognitive-memory-5)
- [020. Qoder 团队知识引擎](ch06/020-qoder)
- [021. 企业级AI记忆基质三层架构：事实/交互/行动记忆](ch06/021-ai)
- [022. Hermes Agent 记忆系统 vs OpenClaw 记忆观](ch06/022-hermes-agent-vs-openclaw)
- [023. 腾讯云Agent Memory：Mermaid无限画布×上下文卸载](ch06/023-agent-memory-mermaid)
- [024. AI Context Layer 框架](ch06/024-ai-context-layer)
- [025. LLM Wiki 知识管理](ch06/025-llm-wiki)
- [026. 上下文工程：三种 Agent Memory 方案对比实验](ch06/026-agent-memory)
- [027. Obsidian](ch06/027-obsidian)
- [028. Your documentation is still in your Mum's filing cabinet](ch06/028-your-documentation-is-still-in-your-mum-s-filing-cabinet)
- [029. 蚂蚁阿福医疗 Agent：从 0 到生产的工业级工程化落地](ch06/029-agent-0)
- [030. TencentDB Agent Memory 短期记忆压缩方案](ch06/030-tencentdb-agent-memory)
- [031. Hermes Agent 三级 Memory 架构解析（One掌柜视角）](ch06/031-hermes-agent-memory-one)
- [032. Building is just the beginning: Introducing Discoverability](ch06/032-building-is-just-the-beginning-introducing-discoverability)
- [033. WorldTrace：视频世界模型的可寻址记忆（Addressable Memory for Video World Models）](ch06/033-worldtrace-addressable-memory-for-video-world-models)
- [034. OpenJiuwen AutoGenetic Memory — 华为开源自主生长Agent记忆引擎](ch06/034-openjiuwen-autogenetic-memory-agent)
- [035. MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源](ch06/035-mfs-zilliztech-agent-harness-20)
- [036. OpenChronicle — AI可复用记忆层](ch06/036-openchronicle-ai)
- [037. Qoder 发布团队知识引擎：组织级知识记忆是 Harness 自进化的重要组件](ch06/037-qoder-harness)
- [038. Claude Code Agent Memory Systems — L0~L3 四层记忆方案](ch06/038-claude-code-agent-memory-systems-l0-l3)
- [039. AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单](ch06/039-aml-agent-memory-leaderboard-agent)
- [040. Agent 记忆系统的主矛盾：历史增长 vs 临场上下文调度](ch06/040-agent-vs)
- [041. Headroom 是怎么省上下文的](ch06/041-headroom)
- [042. 面向复杂业务场景的智能分析 Skills 架构设计与演进实践](ch06/042-skills)
- [043. TencentDB Agent Memory：L0-L3 语义金字塔长期记忆](ch06/043-tencentdb-agent-memory-l0-l3)
- [044. Skill 编排的 6 种依赖关系](ch06/044-skill-6)
- [045. 参数化 Memory 漫谈（纯干货）](ch06/045-memory)
- [046. Loop Engineering: The Anthropic Playbook — 设计替你提示 Agent 的系统（花叔橙皮书 v260615 conference 重排版）](ch06/046-loop-engineering-the-anthropic-playbook-agent-v2606)
- [047. 别让Agent什么都记 上交×腾讯提出 AdaMem](ch06/047-agent-adamem)
- [048. AI Memory Architecture: Deep Dive](ch06/048-ai-memory-architecture-deep-dive)
- [049. MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异](ch06/049-miroflow-deep-research-agent-code-agent-6)
- [050. Agent Harness 上下文管理：工作集视角](ch06/050-agent-harness)
- [051. MiniMax Token调用第一后：AgentOS现实与模型厂商的系统适配挑战](ch06/051-minimax-token-agentos)
- [052. Claude Code Subagent 上下文卫生](ch06/052-claude-code-subagent)
- [053. 注意力塌缩与上下文管理](ch06/053-page-053)
- [054. Claude Code Session 管理与 1M 上下文最佳实践](ch06/054-claude-code-session-1m)
