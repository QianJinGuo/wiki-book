# Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战

## Ch01.753 Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战

> 📊 Level ⭐⭐ | 3.8KB | `entities/openclacky-prompt-cache-harness-v2ex-799662c56ba6.md`

# Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战

## 相关实体

- [yoonho lee: text optimization as a legitimate learning mecha](/ch01-334-yoonho-lee-text-optimization-as-a-legitimate-learning-mecha//)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclacky-prompt-cache-harness-v2ex-799662c56ba6.md)

- MOC
## 深度分析

Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战 涉及agent领域的核心技术议题。
### 核心观点
1. # Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战
> 来源：V2EX（yafeilee）· 2026-05-14 · 前篇：https://v2ex.
2. com/t/1211434
## 核心结论
**「效果已经不是当前 Agent 的主要矛盾，成本才是。
3. 」** 3项任务实测，4家Agent横评，OpenRouter CSV逐请求核定：
| Agent | 总成本 | 请求数 | Cache 命中率 |
|-------|--------|--------|-------------|
| **OpenClacky** | **$5.
4. 10** | **51** | **90.
5. 6%** |
| Claude Code | $5.

### 内容结构
- Harness 工程分享：LLM Agent 的 prompt cache 命中率 90% 实战
- 核心结论
- 高 cache 命中率与多功能之间的结构性冲突
- 三年失败史
- 第一代（2024-2025上）：RAG / 知识库
- 第二代（2025中期）：SWEBench / 多Agent工作流
- 第三代（2025年底至今）：Ruby重写
- 核心决策1：双cache标记 + 允许失败回退

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **code趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](/ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering//)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering//)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-167-深入理解-claude-code-源码中的-agent-harness-构建之道//)
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程//)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-215-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed//)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进//)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

