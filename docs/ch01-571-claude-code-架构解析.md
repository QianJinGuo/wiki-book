# Claude Code 架构解析

## Ch01.571 Claude Code 架构解析

> 📊 Level ⭐⭐ | 6.2KB | `entities/claude-code-architecture.md`

## Overview
Claude Code 源码拆解（by 无岳，阿里云开发者，2026-04-15）。核心论点：**真正决定 Agent 能不能长期活下去的，不是模型，而是围着模型搭起来的运行时。**

## 核心 Insight
| # | Insight | 模块 |
|---|---------|------|
| 1 | 启动层决定架构寿命 | 启动链路 |
| 2 | UI 是 runtime 操作台，不是文本展示壳 | REPL |
| 3 | 连续运行是状态机，不是函数调用 | Query Loop |
| 4 | 工具层收敛横切复杂度，是稳定性关键 | Tool Runtime |
| 5 | 权限 = 逻辑授权 + 执行隔离，不是弹窗 | Permission |
| 6 | 多 Agent 核心是任务抽象，不是 prompt 分工 | Task |
| 7 | 平台扩展性 = 外部多样 + 内部收敛 | 扩展层 |

## 子页面
- [七大模块详解](/ch01-406-claude-code-七大模块详解/) — 入口链路、REPL、Query Loop、Tool Runtime、Permission、多Agent、扩展性
- [设计原则与对照分析](/ch01-403-claude-code-设计原则与对照分析/) — 五条设计原则、Harness 映射、OpenClaw/Hermes 对比

## Related
- CLI-Tools 横向对比
- [原始文章存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-architecture-analysis.md)
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Claude Code 架构深度解析](/ch01-846-claude-code-架构深度解析/)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](/ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件/)
- Agent 与后端统一架构
- [Claude Code 架构深度分析](/ch01-846-claude-code-架构深度解析/)
- [上下文隔离](/ch01-892-上下文隔离/)
- [从多智能体编排到AI自主决策：资损防控体系的架构演进](/ch01-305-从多智能体编排到ai自主决策-资损防控体系的架构演进/)
- [Agentium — 从零实现 Agent 系统的开源框架](/ch01-870-agentium-从零实现-agent-系统的开源框架/)
- [17种Agent架构演进：控制流设计的完整演化史](/ch04-507-17种agent架构演进-控制流设计的完整演化史/)
- [Owner-Worker-Verifier 架构](/ch01-889-owner-worker-verifier-架构/)
- [Hermes-Agent Kanban 实测 — 商业 CLI 作为上层 Orchestrator](/ch04-418-hermes-agent/)
- Multi-Agent Systems

## 深度分析
Claude Code 架构的核心价值在于将"野生函数"转化为"带完整运行时语义的受控对象"，这意味着工具层不是简单暴露函数调用，而是包含了执行上下文、权限校验、状态管理的完整运行时。^(raw/articles/claude-code-architecture-analysis)
六大模块构成一个分层架构：入口链路负责进程初始化与状态分离；REPL 作为 runtime 操作台持续与用户保持交互；Query Loop 以状态机模式驱动连续运行，支持 Compact 压缩与恢复；Tool Runtime 是横切复杂度的收敛点；Permission System 提供完整决策链而非单纯弹窗；Task 抽象为多 Agent 提供了统一任务收回机制。^(raw/articles/claude-code-architecture-analysis)
这个架构最值得注意的设计原则是"外部动态、内部收敛"——MCP/Skills/Plugins 可以动态扩展，但内部模块边界清晰、依赖关系稳定。这直接回答了为什么很多 Agent 系统在 Demo 阶段很强但一旦工具变多就开始"变形"：它们缺少一个真正承接复杂度的运行时架构。^(raw/articles/claude-code-architecture-analysis)

## 实践启示
1. **运行时比模型更重要**：在评估或构建 Agent 系统时，首先看工具层的完整性和运行时语义的严谨程度，而不是模型本身的能力。
2. **状态机优于函数调用**：连续运行场景下，用状态机模式管理 Query Loop 比简单的函数递归更稳定，也更容易支持中断恢复。
3. **权限设计即架构决策**：Permission System 不只是安全特性，它是架构的一部分——自动判定 + 交互确认 + 沙箱执行构成完整决策链。
4. **多 Agent 的核心是任务抽象**：不是 prompt 分工，而是能否把分出去的任务执行结果统一收回并协调。
5. **扩展性需要内部收敛来保障**：外部插件再多，内部模块边界必须清晰；否则系统随复杂度增长必然腐化。

## 相关实体
- [claude-code-7-layer-memory-architecture](/ch01-857-claude-code-7-layer-memory-architecture/)

- [Agent 时代架构师技能指南](/ch04-346-agent-时代-我们架构师应该学什么/)
- Data Agent Platform Architecture
- MOC

---

