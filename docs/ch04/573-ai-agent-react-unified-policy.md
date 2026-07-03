# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

## Ch04.573 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

> 📊 Level ⭐⭐ | 1.8KB | `entities/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md`

# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

火山引擎 AI 搜索团队面向千万级并发企业级生产环境，将传统的 ReAct 三节点 DAG 架构重构为 Unified Policy Agent（UP-ReAct）架构。

## 旧架构的三大问题

标准 ReAct 三节点（Thought→Action→Iteration）在千万级并发场景下暴露三大"工程原罪"：

1. **极高时间复杂度**：单次有效动作需三次独立决策流转，TTFT（首字返回时间）急剧恶化
2. **上下文震荡（Context Thrashing）**：同一份业务状态在节点间反复序列化与反序列化，Prompt 长度指数级膨胀，导致模型注意力稀释（Attention Dilution）
3. **控制流破碎**：新工具难以自然融入固定循环，系统语义模糊

## UP-ReAct 架构

核心思路是**剥离确定性与不确定性、分离策略决策与上下文管理**。通过 Unified Policy Agent 将 Workflow 与 Agent 的系统边界重新定义，在实现推荐与对话效果大幅提升的同时，将 TTFT 暴降 30%。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md)

---

