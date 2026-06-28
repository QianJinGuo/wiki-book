# Ch06 记忆与上下文管理

> Agent 的大脑：短期/长期/工作记忆的分层架构

> 本章收录 **35 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 29 |
| ⭐⭐⭐ 专家 | 需ML基础 | 6 |

---

## 导读

一个没有记忆的 Agent，每次对话都是一张白纸。

本章探讨 Agent 记忆系统的工程实践：短期记忆（上下文窗口）、长期记忆（持久化存储）、工作记忆（当前任务状态）的分层架构。你会看到 Hermes Agent 的三层记忆如何协作，以及为什么"Memory 不是 RAG"——记忆是有结构的，检索是无结构的。

CPU 缓存的类比特别有启发性：L1（当前上下文）→ L2（会话历史）→ L3（持久记忆），每一层的速度和容量都在做不同的权衡。

上下文窗口是稀缺资源——记忆管理决定了 Agent 的智能上限。

---

## Ch06.001 深度拆解 Hermes Agent 记忆系统

→ [独立页面](ch06-001-深度拆解-hermes-agent-记忆系统.html)

## Ch06.002 AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆

→ [独立页面](ch06-002-agentmemory-源码分析-给-coding-agent-装上本地长期记忆.html)

## Ch06.003 claude code openclaw memory vector db doubt

→ [独立页面](ch06-003-claude-code-openclaw-memory-vector-db-doubt.html)

## Ch06.004 Agent-Memory 评测全景：基准、评估与记忆系统

→ [独立页面](ch06-004-agent-memory-评测全景-基准-评估与记忆系统.html)

## Ch06.005 claude code openclaw memory comparison

→ [独立页面](ch06-005-claude-code-openclaw-memory-comparison.html)

## Ch06.006 context window management comparison

→ [独立页面](ch06-006-context-window-management-comparison.html)

## Ch06.007 Knowledge Base Layer Architecture: From RAG to Agent-native Knowledge Context Layer

→ [独立页面](ch06-007-knowledge-base-layer-architecture-from-rag-to-agent-native-knowledge-context-lay.html)

## Ch06.008 Memory 不是 RAG：Agent 记忆的系统性框架

→ [独立页面](ch06-008-memory-不是-rag-agent-记忆的系统性框架.html)

## Ch06.009 Hermes Agent 爱马仕的三级 memory，到底在记什么？

→ [独立页面](ch06-009-hermes-agent-爱马仕的三级-memory-到底在记什么.html)

## Ch06.010 上下文工程 - 三种Memory方案对比

→ [独立页面](ch06-010-上下文工程-三种memory方案对比.html)

## Ch06.011 AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）

→ [独立页面](ch06-011-ai-的形状-jagged-frontier-bottleneck-reverse-salient-mollick.html)

## Ch06.012 MemOS Hermes 记忆插件

→ [独立页面](ch06-012-memos-hermes-记忆插件.html)

## Ch06.013 Google Open Knowledge Format (OKF) v0.1：AI 知识库通用格式标准 — 让 Markdown 知识库互通

→ [独立页面](ch06-013-google-open-knowledge-format-okf-v0-1-ai-知识库通用格式标准-让-markdown-知识库互通.html)

## Ch06.014 CrewAI Cognitive Memory: 5 认知操作的工程化设计

→ [独立页面](ch06-014-crewai-cognitive-memory-5-认知操作的工程化设计.html)

## Ch06.015 企业级AI记忆基质三层架构：事实/交互/行动记忆

→ [独立页面](ch06-015-企业级ai记忆基质三层架构-事实-交互-行动记忆.html)

## Ch06.016 Qoder 团队知识引擎

→ [独立页面](ch06-016-qoder-团队知识引擎.html)

## Ch06.017 Hermes Agent 记忆系统 vs OpenClaw 记忆观

→ [独立页面](ch06-017-hermes-agent-记忆系统-vs-openclaw-记忆观.html)

## Ch06.018 AI Context Layer 框架

→ [独立页面](ch06-018-ai-context-layer-框架.html)

## Ch06.019 腾讯云Agent Memory：Mermaid无限画布×上下文卸载

→ [独立页面](ch06-019-腾讯云agent-memory-mermaid无限画布-上下文卸载.html)

## Ch06.020 Obsidian

→ [独立页面](ch06-020-obsidian.html)

## Ch06.021 上下文工程：三种 Agent Memory 方案对比实验

→ [独立页面](ch06-021-上下文工程-三种-agent-memory-方案对比实验.html)

## Ch06.022 Your documentation is still in your Mum's filing cabinet

→ [独立页面](ch06-022-your-documentation-is-still-in-your-mum-s-filing-cabinet.html)

## Ch06.023 TencentDB Agent Memory 短期记忆压缩方案

→ [独立页面](ch06-023-tencentdb-agent-memory-短期记忆压缩方案.html)

## Ch06.024 Hermes Agent 三级 Memory 架构解析（One掌柜视角）

→ [独立页面](ch06-024-hermes-agent-三级-memory-架构解析-one掌柜视角.html)

## Ch06.025 Building is just the beginning: Introducing Discoverability

→ [独立页面](ch06-025-building-is-just-the-beginning-introducing-discoverability.html)

## Ch06.026 OpenChronicle — AI可复用记忆层

→ [独立页面](ch06-026-openchronicle-ai可复用记忆层.html)

## Ch06.027 Qoder 发布团队知识引擎：组织级知识记忆是 Harness 自进化的重要组件

→ [独立页面](ch06-027-qoder-发布团队知识引擎-组织级知识记忆是-harness-自进化的重要组件.html)

## Ch06.028 Headroom 是怎么省上下文的

→ [独立页面](ch06-028-headroom-是怎么省上下文的.html)

## Ch06.029 CVE-2026-20182: Unauthenticated Cisco SD-WAN Control Plane Compromise via vHub Authentication Bypass

→ [独立页面](ch06-029-cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-compromise-via-vhub-au.html)

## Ch06.030 AI Memory Architecture: Deep Dive

→ [独立页面](ch06-030-ai-memory-architecture-deep-dive.html)

## Ch06.031 MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异

→ [独立页面](ch06-031-miroflow-deep-research-agent-脚手架-与-code-agent-的-6-大工程差异.html)

## Ch06.032 Agent Harness 上下文管理：工作集视角

→ [独立页面](ch06-032-agent-harness-上下文管理-工作集视角.html)

## Ch06.033 MiniMax Token调用第一后：AgentOS现实与模型厂商的系统适配挑战

→ [独立页面](ch06-033-minimax-token调用第一后-agentos现实与模型厂商的系统适配挑战.html)

## Ch06.034 Claude Code Subagent 上下文卫生

→ [独立页面](ch06-034-claude-code-subagent-上下文卫生.html)

## Ch06.035 Claude Code Session 管理与 1M 上下文最佳实践

→ [独立页面](ch06-035-claude-code-session-管理与-1m-上下文最佳实践.html)

