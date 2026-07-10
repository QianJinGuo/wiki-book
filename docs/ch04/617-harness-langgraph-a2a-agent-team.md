# 逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team

## Ch04.617 逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team

> 📊 Level ⭐⭐ | 3.2KB | `entities/langgraph-a2a-adversarial-agent-team.md`

# 逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/langgraph-a2a-adversarial-agent-team.md)

## 深度分析

逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team 涉及agent领域的核心技术议题。
### 核心观点
1. **Info Harness**：多路 Worker 并行调研 → Verifier 核验来源/去重/辨伪/三角验证
2.
2. **Coding Harness**：Developer → Tester → Reviewer → Verifier，CI/CD 式对抗流水线
3.
3. **Document Harness**：Planner → Writer → Formatter → Evaluator，流水线式文档生产
4.
4. **Reports Harness**：多轮对抗修正措辞/条款/排版
### LangGraph 角色
- StateGraph + 自定义全局状态 + 持久化 Session
- Batch 内并行、Batch 间串行依赖
- producing → verifying → done 标准状态流转
- 最大迭代上限防死循环
### A2A 协议（Google 2025.
5. 4）
- 三层传输：JSON-RPC 2.

### 内容结构
- 逆天的架构：用 Harness+LangGraph+A2A 写一个 Agent Team
- 核心架构
- Adversarial Agent Team 对抗性多智能体团队
- 四大核心场景
- LangGraph 角色
- A2A 协议（Google 2025.4）
- LangGraph 与 Harness 关系
- 成本控制

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [你不知道的 Agent原理架构与工程实践 V2](../ch03/045-agent.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/235-agentic.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/050-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/652-karpathy-vibe-coding-agentic-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

