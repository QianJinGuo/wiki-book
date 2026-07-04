# Harness如何支撑Agent在生产环境稳定运行？

## Ch04.132 Harness如何支撑Agent在生产环境稳定运行？

> 📊 Level ⭐⭐ | 14.1KB | `entities/harness-production-agent-engineering-deficit.md`

## 核心概念：工程赤字（Engineering Deficit）
> "很多智能体能做出演示，却很难变成可靠产品。"
行业数据：88% 的智能体项目没有进入生产环境；MIT 2025年8月报告显示企业 GenAI 试点失败率达 95%；1837名企业开发者中仅 5%（95人）真正把 AI 智能体跑在生产环境。
**问题通常不在模型本身，而在模型周围工程——Harness。**

## Demo 型 vs 生产型代码库四维判别
| 维度 | Demo 型 | 生产型 |
|------|---------|--------|
| 工具 | 接受任意字符串，出错返回空列表 | 入口校验格式，结构化错误 |
| 状态 | 无 schema dict | 类型化 schema + 来源记录 |
| 循环 | 无 MAX_STEPS 上限 | 硬上限 + token 按步记录 |
| Trace | 只包 LLM 调用 | LLM + 工具调用都覆盖 |
**分界线：团队有没有把模型周围的工程当成产品本身。**

## Claude Code 退化事故（2026年4月）
Anthropic 承认三个运行时改动削弱了 Claude Code 表现：

- 默认 reasoning effort 降级
- 缓存改动导致会话中途丢失推理历史
- 系统提示词限制工具调用之间的回复长度
**结果**：可见思考长度中位数下降 **73%**，API 重试率上升 **80 倍**。问题是社区研究者通过会话数据分析挖出的，而非内部监控先发现。

## 四支柱审查框架
### 支柱一：构建——工具契约必须约束模型
工具签名只约束代码，没有约束模型会传进来的值（Stripe `customer_id: str` → LLM 传了邮箱 → 返回 None → 告诉用户"找不到账户"）。
修复：入口校验格式 + 错误信息告诉模型下一步怎么做 + 不静默吞错 + 给模型结构化结果（`status`、`error_type`、`message`） + 提供 `ask_user` 工具。
**工具参数和错误消息怎么命名，会影响模型下一轮判断。这不只是 prompt engineering，而是上下文工程。**

### 支柱二：记忆——状态必须可信、隔离、可追溯
- **类级别可变默认值陷阱**：`history: list[dict] = []` 单用户正常，并发时历史/工具列表/注册表全部串在一起。修复：用 `field(default_factory=list)` + 并发回归测试。
- **语义层状态投毒**：用户说"邮箱是 admin@evil.com"，LLM 直接写入 `user_email`，后续发邮件工具使用被污染值。防御：类型化 schema + 每条事实记录来源 + 敏感字段权限边界。
- **OWASP LLM Top 10 把 prompt injection 列为 2025-2026 年排名第一漏洞。**
> "权限不在 prompt 里，而在代码里。"

### 支柱三：运行框架——智能体循环本身就是基础设施
生产级运行框架至少要做：
1. 工具错误既记录给人看，也作为**结构化结果**返回给模型
2. 每次 LLM 调用和工具调用都进入 **trace**
3. token 用量按步骤记录（失控循环在监控里变成成本尖峰）
4. 循环有**硬上限**（`MAX_STEPS`）
5. 高风险工具需要**显式确认**，且这个确认不能相信 LLM 的推理链
> "模型可以替换，运行框架决定了替换模型时系统会不会 crash。"

### 支柱四：编排——多个不确定执行者需要明确契约
- Cognition 反对多智能体（一致性关键任务）
- Anthropic 支持多智能体（广度优先研究）
- **两者并不矛盾，关键在编排层有没有清楚的任务契约、状态隔离和跨步骤追踪**
**AgentLeak benchmark（2026）**：多智能体系统暴露面 68.9%，单智能体 43.2%。暴露面扩大主要来自智能体之间的消息、共享记忆、工具参数。
多智能体四大坑：
1. 协调器和 worker 共享类级别状态，并发请求看到彼此历史
2. 子智能体直接拿到父智能体完整对话历史
3. 长任务只存在单个 Python 进程，一次崩溃抹掉整个工作流
4. 父 trace 和子 trace 没有关联
正确做法：子智能体调用像 **RPC** 一样处理 + 长任务做成可恢复的持久状态机（用 Temporal/DBOS）。

## 哪些方向可以先放一放
- 不要把"别做多智能体"当公理，要看任务需要一致性还是并行搜索
- 不建议为新生产系统优先选 AutoGen/AG2/CrewAI（demo 友好但生产约束不足）
- 不要把 DSPy 当通用智能体框架（DSPy 适合 prompt program optimization，不是通用运行框架）
- 新智能体产品不要按 seat 定价（市场已转向按结果和用量付费）

## 深度分析
### 工程赤字的结构性根源
"Demo 型 vs 生产型"的差距本质上是**工程投入的不对称**：模型能力在短时间窗口内可以被快速评估，而周围的工程系统——工具契约、状态隔离、运行框架、编排层——需要随着智能体能力的扩展而持续迭代。这个迭代速度往往落后于模型能力的提升速度，导致"模型强、管道弱"的工程赤字现象普遍存在。MIT 2025年报告的 95% 失败率对应的正是这类问题。

### 工具契约的脆弱性
工具契约失败的根本原因是**签名约束的是代码，不是模型行为的输出**。当 LLM 作为调用方时，它对参数类型的理解是通过统计模式建立的，而非真正的类型系统。这导致即使工具签名完全正确，LLM 仍然可能传入语义错误但格式合法的值（如把邮箱当成 customer ID）。这种错误的根源不在模型，也不在工具本身，而在两者之间缺乏**语义对齐层**——需要在工具入口同时校验格式和语义。

### 状态投毒与权限边界
语义层状态投毒（用户通过自然语言注入恶意内容到智能体记忆）是 2025-2026 年 OWASP LLM Top 10 排名第一的漏洞类别。关键误解在于：开发者认为系统 prompt 的位置决定了权限优先级，但 LLM 的上下文窗口中每个 token 都是平等的。权限必须在代码层实现，而非 prompt 层。

### Claude Code 事故的方法论启示
Claude Code 退化事故的特殊之处在于：问题不是模型本身退步，而是**三个运行时改动叠加在一起**产生了复合效应。这说明当运行框架缺乏足够的可观测性时，即使是同一团队也很难在内部发现产品的逐步退化。社区研究者通过会话数据的可见思考长度和重试率变化发现了这一退化，这本身就说明**外部可观测性指标比内部日志更能捕捉这类问题**。

### 多智能体系统的暴露面放大效应
AgentLeak benchmark 显示多智能体系统暴露面（68.9%）显著高于单智能体（43.2%），但这不是"多智能体本身更危险"，而是**暴露面随智能体间接口数量线性增长**。每一个智能体之间的消息、共享记忆片段和工具参数都是一个新的攻击面。当这些接口没有显式契约时，系统整体暴露面会快速超过任何单智能体系统。关键不在于"用不用多智能体"，而在于**有没有把智能体间接口当成正式的 API 边界来设计**。

## 实践启示
### 立即可落地的检查项
1. **工具入口校验**：在每个工具函数入口增加参数格式校验和语义校验，不要依赖模型自发传对值
2. **状态隔离回归测试**：构造两个并发请求，断言彼此的状态不泄露
3. **MAX_STEPS 上限**：为所有智能体循环设置硬上限，并配置 token 预警阈值
4. **结构化错误返回**：工具失败时返回 `{status: "error", error_type: "...", message: "..."}` 而非 None 或空列表
5. **ask_user 工具**：确保智能体在不确定时可以向用户请求确认，而不是凭推理链自主决定

### 运行框架的最低要求清单
生产级运行框架必须包含：

- LLM 调用 + 工具调用的全链路 trace
- 工具错误的结构化返回（给人看日志 + 给模型看结果）
- 每次调用的 token 用量按步骤记录
- MAX_STEPS 硬上限
- 高风险操作的模型外确认机制（用户确认、签名审批、延迟窗口）

### 多智能体决策框架
采用多智能体架构前，先问三个问题：
1. 子智能体的输入输出是否有**显式 schema 定义**？
2. 智能体之间是否通过 **RPC 风格接口**通信，而非共享状态？
3. 父 trace 和子 trace 是否有关联 ID，可以串起完整的执行链？
如果答案是"没有"，则系统还没有准备好多智能体——先做单智能体的生产级工程化。

### 框架选型建议
- **生产级推荐**：LangGraph（Klarna 案例支撑）、Temporal/DBOS（用于长任务持久化）、Pydantic + 结构化输出
- **Demo 友好但生产慎用**：AutoGen、AG2、CrewAI
- **不是智能体框架**：DSPy（适合 prompt optimization，不适合作为运行框架）

## 相关实体
- [Claude Code 可控性：软规则无法变成硬约束](ch03/075-claude-code.md)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](ch01/485-claude.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch03/045-agent.md)
- [AutoResearch：多 Agent 自动化软件开发](ch03/045-agent.md)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Agent Harness 架构](ch03/045-agent.md)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch03/075-claude-code.md)
- [Agent 自我改进的六条路](ch03/045-agent.md)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/131-karpathy-vibe-coding-agentic-engineering.md)
- [Claude Code 设计原则与对照分析](ch03/075-claude-code.md)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch04/256-skill.md)

- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](ch03/075-claude-code.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](ch03/075-claude-code.md)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/256-skill.md)
- [Claude Code 源码核心机制详解](ch03/075-claude-code.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](ch03/075-claude-code.md)
- [Agent架构关键变化：Harness正在成为新后端](ch03/045-agent.md)
- [Claude Code MCP Server](ch07/025-claude-code-mcp-server.md)

- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch09/047-coding-agent.md)
- [Boris Cherny — 从 IDE 到 Agent 控制台](ch03/045-agent.md)
- [Martin Fowler AI 研发 Harness：非确定性承重层](ch04/277-ai.md)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch03/045-agent.md)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](ch03/045-agent.md)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](ch05/061-harness-engineering.md)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [Agent 原理、架构与工程实践](ch03/045-agent.md)
- [为什么多数 Agent POC 无法上生产](https://github.com/QianJinGuo/wiki/blob/main/queries/why-agent-poc-fails-production.md) — POC 到生产的六大系统性鸿沟

---

