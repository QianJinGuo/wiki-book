# Claude 做方案，Codex 写代码：多模型协作怎么交接才稳

## Ch01.186 Claude 做方案，Codex 写代码：多模型协作怎么交接才稳

> 📊 Level ⭐ | 2.8KB | `entities/claude-做方案codex-写代码多模型协作怎么交接才稳.md`

## 摘要

本文探讨多模型协作中模型之间如何交接上下文和状态的问题。以"Claude 调研设计、Codex 进仓库实现、Gemini 最后核查"这一典型链路为例，指出当前多模型协作面临的核心瓶颈不是模型能力不足，而是模型之间缺少结构化的交接机制——人被迫在多个 AI 之间充当"API"，反复搬运上下文。

文章对比了 Unibase Memory（跨模型对话保存与搜索的 Chrome 扩展）与结构化 HANDOFF 两种方案，论证了完整聊天历史不等同于当前工作状态。作者提出四层上下文架构（归档、知识、状态、交接），并给出了具体的 HANDOFF.md 交接模板和试用建议。

## 核心要点

- 多模型协作的真实瓶颈是交接损耗，而非模型能力差距
- Unibase Memory 能跨 ChatGPT/Claude/Gemini 保存和检索对话，但带不走仓库、测试、权限等工程现场
- 完整聊天历史属于事件日志，工作现场需要结构化的 HANDOFF 快照
- 上下文工程应分四层：归档（只追加）、知识（核验后写入）、状态（单一权威版本）、交接（按需生成）
- HANDOFF 应包含：任务目标、当前版本、已确认事实、测试结果、阻塞项、下一步动作和停止条件
- 接收模型应先回传三行确认（版本、范围、边界），再开始执行
- 权威版本只能有一个，项目状态不能在多个模型间同时演化
- 共享记忆面临并发写入时的覆盖、陈旧数据和版本冲突问题，需要乐观并发控制
- Unibase Memory 的客户端加密基本可确认，但钱包地址上报与文档描述未完全对齐
- 推荐先跑一周对照试验（完整聊天 vs 结构化 HANDOFF），测量接手成本、版本一致性和总体返工率

## 相关实体链接

- [Anthropic 8X Output Verification Bottleneck Fiona Fung](../ch09/096-anthropic-8x.html) — 文中引用的 Agent 协作验证瓶颈讨论
- [Agent Harness Context Management Working Set](../ch05/039-agent-harness.html) — 上下文窗口作为运行时工作集的观点
- [Codex 5 Layer Architecture](ch01/509-codex.html) — Codex 的架构设计
- [Claude Code Multi Agent Collaboration 多智能体协作体系设计](../ch03/076-claude-code.html) — 多智能体协作体系设计
- [Ai Agent Loops Claude Code Codex](../ch03/076-claude-code.html) — AI Agent 循环与代码生成
- [Harness 之后 状态边界与失败闭环 若飞](../ch05/018-harness.html) — Harness 工程中的状态与边界管理
- [Harness Engineering](../ch05/117-harness-engineering.html) — Harness Engineering 总体概念

---

