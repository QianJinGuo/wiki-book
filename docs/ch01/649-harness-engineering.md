# 深入浅出 Harness Engineering 之核心模式与理念

> 📊 Level ⭐⭐ | 3.1KB | `entities/harness-engineering-core-patterns-claude-code.md`

# 深入浅出 Harness Engineering 之核心模式与理念

## 相关实体

- [面向大型代码库的 claude code 团队落地经验与扩展策略（agent harness）](../ch05/035-agent-harness.html)
- [面向大型代码库的 claude code 团队落地经验与扩展策略（agent harness）](../ch05/035-agent-harness.html)
- [知识库问答 @文档：从 dom 方案到 prosemirror 落地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prosemirror-knowledge-base-mention-vivo.md)
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-engineering-core-patterns-claude-code.md)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/data-infrastructure.md)
## 深度分析

深入浅出 Harness Engineering 之核心模式与理念 涉及agent领域的核心技术议题。
### 核心观点
1. # 深入浅出 Harness Engineering 之核心模式与理念
**作者：** 张碧泉
**发布日期：** 2026年4月29日
从 Claude Code、Claude Managed Agents、Hermes 三个系统出发，梳理 Harness Engineering 的核心模式：持久化指令、分层记忆、工作流编排、工具权限管理、Session/Harness/Sandbox 三件套解耦、凭证安全设计、多智能体协作模式、性能优化等。
2. ## 一、Claude Code 的核心模式
### 1.
3. 1 持久化指令文件
没有持久化指令文件时，每次对话都像从头开始，相同规则和错误反复出现。
4. 代价：文件需要随项目更新维护，否则可能误导智能体。
5. 2 作用域上下文组装
将指令按不同范围（组织、项目）拆分，让智能体动态加载最相关规则。

### 关联实体

- [你不知道的 Agent原理架构与工程实践 V2](../ch03/004-agent.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/004-agent.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/057-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/098-karpathy-vibe-coding-agentic-engineering.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](../ch04/190-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/004-agent.html)

---

