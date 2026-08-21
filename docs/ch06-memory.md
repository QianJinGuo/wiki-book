# Ch06 记忆与上下文管理

> Agent 的大脑：短期/长期/工作记忆的分层架构

> 本章收录 **57 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 48 |
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
- [009. TencentDB Agent Memory：符号化短期记忆+分层式长期记忆](ch06/009-tencentdb-agent-memory)
- [010. Context Window Management Comparison](ch06/010-context-window-management-comparison)
- [011. Knowledge Base Layer Architecture: From RAG to Agent-native Knowledge Context Layer](ch06/011-knowledge-base-layer-architecture-from-rag-to-agent-native)
- [012. Agent 终章（Harness 成本篇）：一次百炼账单降低 88% 实战](ch06/012-agent-harness-88)
- [013. Memory 不是 RAG：Agent 记忆的系统性框架](ch06/013-memory-rag-agent)
- [014. Hermes Agent 爱马仕的三级 memory，到底在记什么？](ch06/014-hermes-agent-memory)
- [015. 参数化 Memory 漫谈：从 MAML 到测试时学习的完整谱系](ch06/015-memory-maml)
- [016. 上下文工程 - 三种Memory方案对比](ch06/016-memory)
- [017. AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）](ch06/017-ai-jagged-frontier-bottleneck-reverse-salient-mollick)
- [018. MemOS Hermes 记忆插件](ch06/018-memos-hermes)
- [019. Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准 — 让 Markdown 知识库互通](ch06/019-google-open-knowledge-format-okf-v0-1-ai-markdown)
- [020. CrewAI Cognitive Memory: 5 认知操作的工程化设计](ch06/020-crewai-cognitive-memory-5)
- [021. Qoder 团队知识引擎](ch06/021-qoder)
- [022. 企业级AI记忆基质三层架构：事实/交互/行动记忆](ch06/022-ai)
- [023. Hermes Agent 记忆系统 vs OpenClaw 记忆观](ch06/023-hermes-agent-vs-openclaw)
- [024. 腾讯云Agent Memory：Mermaid无限画布×上下文卸载](ch06/024-agent-memory-mermaid)
- [025. AI Context Layer 框架](ch06/025-ai-context-layer)
- [026. LLM Wiki 知识管理](ch06/026-llm-wiki)
- [027. 上下文工程：三种 Agent Memory 方案对比实验](ch06/027-agent-memory)
- [028. Obsidian](ch06/028-obsidian)
- [029. Your documentation is still in your Mum's filing cabinet](ch06/029-your-documentation-is-still-in-your-mum-s-filing-cabinet)
- [030. 蚂蚁阿福医疗 Agent：从 0 到生产的工业级工程化落地](ch06/030-agent-0)
- [031. TencentDB Agent Memory 短期记忆压缩方案](ch06/031-tencentdb-agent-memory)
- [032. ECC Continuous Learning：从工具调用轨迹到本能沉淀的持续学习闭环（homunculus 观察式本能提取）](ch06/032-ecc-continuous-learning-homunculus)
- [033. AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单](ch06/033-aml-agent-memory-leaderboard-agent)
- [034. Hermes Agent 三级 Memory 架构解析（One掌柜视角）](ch06/034-hermes-agent-memory-one)
- [035. Building is just the beginning: Introducing Discoverability](ch06/035-building-is-just-the-beginning-introducing-discoverability)
- [036. WorldTrace：视频世界模型的可寻址记忆（Addressable Memory for Video World Models）](ch06/036-worldtrace-addressable-memory-for-video-world-models)
- [037. OpenJiuwen AutoGenetic Memory — 华为开源自主生长Agent记忆引擎](ch06/037-openjiuwen-autogenetic-memory-agent)
- [038. MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源](ch06/038-mfs-zilliztech-agent-harness-20)
- [039. OpenChronicle — AI可复用记忆层](ch06/039-openchronicle-ai)
- [040. Qoder 发布团队知识引擎：组织级知识记忆是 Harness 自进化的重要组件](ch06/040-qoder-harness)
- [041. Claude Code Agent Memory Systems — L0~L3 四层记忆方案](ch06/041-claude-code-agent-memory-systems-l0-l3)
- [042. Powering scientific discovery](ch06/042-powering-scientific-discovery)
- [043. Agent 记忆系统的主矛盾：历史增长 vs 临场上下文调度](ch06/043-agent-vs)
- [044. Headroom 是怎么省上下文的](ch06/044-headroom)
- [045. 面向复杂业务场景的智能分析 Skills 架构设计与演进实践](ch06/045-skills)
- [046. TencentDB Agent Memory：L0-L3 语义金字塔长期记忆](ch06/046-tencentdb-agent-memory-l0-l3)
- [047. Skill 编排的 6 种依赖关系](ch06/047-skill-6)
- [048. 参数化 Memory 漫谈（纯干货）](ch06/048-memory)
- [049. Loop Engineering: The Anthropic Playbook — 设计替你提示 Agent 的系统（花叔橙皮书 v260615 conference 重排版）](ch06/049-loop-engineering-the-anthropic-playbook-agent-v2606)
- [050. 别让Agent什么都记 上交×腾讯提出 AdaMem](ch06/050-agent-adamem)
- [051. AI Memory Architecture: Deep Dive](ch06/051-ai-memory-architecture-deep-dive)
- [052. MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异](ch06/052-miroflow-deep-research-agent-code-agent-6)
- [053. Agent Harness 上下文管理：工作集视角](ch06/053-agent-harness)
- [054. MiniMax Token调用第一后：AgentOS现实与模型厂商的系统适配挑战](ch06/054-minimax-token-agentos)
- [055. Claude Code Subagent 上下文卫生](ch06/055-claude-code-subagent)
- [056. 注意力塌缩与上下文管理](ch06/056-page-056)
- [057. Claude Code Session 管理与 1M 上下文最佳实践](ch06/057-claude-code-session-1m)
