# 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

## Ch04.582 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

> 📊 Level ⭐⭐ | 2.1KB | `entities/volcano-engine-ai-search-million-agent-architecture-up-react.md`

# 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

火山引擎 AI 搜索团队分享了其 Agent 架构从 ReAct 三节点演进到 Unified Policy Agent（UP-ReAct）的实践历程。该系统支持千万级并发用户，是生产级 Agent 架构设计的典型案例。

## 核心问题

随着规模增长，ReAct 三节点架构暴露出三个关键问题：
- **Context Thrashing**：长链 Agent 执行中上下文反复加载/卸载，导致有效上下文利用率低
- **TTFT 退化**：随着 Agent 步骤增加，首 Token 生成时间显著劣化
- **Control Flow 碎片化**：多 Agent 协作时控制流分散在各节点，难以统一管理和优化

## UP-ReAct 架构

UP-ReAct 通过统一策略路由层解决了上述问题：
- 集中式策略路由替代分散式节点决策
- 上下文缓存机制消除 Context Thrashing
- 统一调度降低 30% TTFT

该实践与 [Agent Harness 架构](ch05/009-harness.md) 和 [Agent 上下文管理架构模式](ch03/045-agent.md) 中的架构演进路线一致，是千万级 Agent 系统的宝贵实战参考。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md)

---

