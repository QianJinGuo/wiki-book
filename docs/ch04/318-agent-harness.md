# Agent架构关键变化：Harness正在成为新后端

## Ch04.318 Agent架构关键变化：Harness正在成为新后端

> 📊 Level ⭐⭐ | 8.5KB | `entities/agent架构关键变化harness正在成为新后端.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent架构关键变化harness正在成为新后端.md)
从微信文章 [Agent架构关键变化：Harness正在成为新后端](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent架构关键变化harness正在成为新后端.md) 提取。

## 核心内容
source_url: https://mp.weixin.qq.com/s/VYZq3CzaQ72-gq1FlzniMw

### 主要章节
- ###  今天的 Agent 如何工作
- ###  退后一步看
- ###  抽象后端
- ###  一切向下都是 Worker
- ###  一个活系统
- ###  会创建 Worker 的 Agent
- ###  区别消失
- ###  任何东西都是 Worker
- ###  这个赌注
- ###  参考阅读
- ####  References
sources:

  - https://mp.weixin.qq.com/s/VYZq3CzaQ72-gq1FlzniMw
  - https://mp.weixin.qq.com/s/6bKuYLV1E5LGqUEKV0tbtA
related:

  - [Harness 工程化体系](../ch05/052-harness-engineering.html)
  - [Context Management 与 Working Set](../ch05/039-agent-harness.html)
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch04/515-claude-managed-agents.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [Agent Harness 12 组件与 7 个关键决策](../ch05/039-agent-harness.html)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)

## 深度分析
### 核心命题：harness 与后端的边界是临时状态
本文的核心论点是：当前行业将 agent harness 视为独立于传统后端的一层，这并非必然架构，而是一个阶段性误解。作者 Mike Piccolo 认为，随着 agent 系统规模扩大，这种分离造成的复杂性会迫使基础设施演进，而正确的方向是用 **Worker、Trigger、Function** 三个原语重新定义"后端"，让 agent 成为与其他组件同等的 Worker。

### 为什么传统分离是问题
当 agent harness 与后端分离时，系统调试面临指数级复杂性。每增加一个 agent，可能的交互路径数为 agents² × services——4 个 agent 加 5 个后端服务产生 80 条需要关联调试的随机路径。传统后端的确定性调试方法（跨系统关联日志、重建时间线）在 agent 场景下失效，因为 agent 的随机性是有意设计的，而非需要消除的缺陷。
薄 harness（Anthropic）和厚 harness（LangGraph）之争因此是伪命题：两者争论的是同一设计空间内部的权衡，而默认假设 harness 与后端分离本身并未被质疑。当 agent 是 Worker 时，薄还是厚只是注册多少 functions、如何组合它们的问题，而非两种架构之间的抉择。

### 三个原语如何简化架构
**Function** 是带稳定标识符的工作单元（如 `orders::validate`），可存在于任何进程、用任何语言编写，输入输出稳定。**Trigger** 是让 function 运行的条件——HTTP 调用、cron 调度、队列订阅、状态变化均可，声明式绑定而非硬编码路由。**Worker** 是连接到 engine 并注册 functions 和 triggers 的任何进程。
这一抽象的关键价值在于：语义存在于 functions 内部，而非基础设施层。队列的 broker 语义、HTTP 的路由语义、agent 的编排语义，都被折叠成"注册 function 和 trigger 的进程"。添加新能力不再是评估新产品类别，而是"添加一个 worker"——sandbox 是 worker、ml pipeline 是 worker、浏览器 tab 也可以是 worker。

### 涌现的系统性质
当一切都是 Worker，三个传统架构无法产生的性质自然出现：**实时发现**——worker 连接时收到完整 function 目录，断开时自动注销，agent 不会拿到过期上下文；**实时扩展**——添加新 worker 不需要重新部署或重启；**实时可观测性**——每一次 trigger() 调用跨 workers、跨语言、跨队列传播 trace ID，OpenTelemetry log 自动关联到 active trace。

### Agent 创建 Worker 的递归性
当 agent 能启动 sandbox worker（硬件隔离的 microVM）时，架构进一步递归：sandbox 不是独立产品类别，而是碰巧提供硬件隔离的 Worker；agent 创建 sandbox 不过是 Worker 创建另一个 Worker。基础设施从产品类别变成设计模式——不可信代码隔离是一个 sandbox worker，临时专家 agent 是另一个 worker，并行执行器是 worker 创建其他 workers。

## 实践启示
1. **架构设计层面**：评估 agent 基础设施平台时，关注是否暴露 Worker/Trigger/Function 原语，而非提供的功能类别数量。如果平台对队列、streaming、sandboxing 使用不同机制，它还在用产品目录而非设计模式思维。
2. **调试与可观测性**：当 agent 是 Worker 时，调试路径从"跨系统关联日志"变成"一条跨语言跨队列的 trace"。选择基础设施时应优先考虑 OpenTelemetry 原生支持，让 trace ID 自动贯穿 agent 决策→工具调用→状态持久化整条链路。
3. **Harness 厚薄的选择**：在 Worker 模型下，薄 harness 是注册少量 functions、让模型决定 trigger 什么的 agent worker；厚 harness 是带更多显式审批关卡和条件逻辑的 agent worker。两者使用同一组 primitives，区别仅在于组合方式，而非两种不同的架构选择。
4. **Sandbox 作为 Worker**：如果 agent 系统需要隔离不可信代码，不应引入独立的 sandbox 产品，而应将隔离环境实现为一种 Worker 类型，其 primitives interface 与其他所有 Worker 相同。评估方案时看 sandbox 是否能与系统内其他组件通过同一套 trigger/function 机制交互。
5. **规模化路径**：Agent 系统扩展时，应采用"添加 Worker"而非"添加集成"的方式。每新增加一种能力（不论是新的微服务、新的 ML pipeline 还是新的 agent），让它以 Worker 身份接入实时发现目录，而非通过点对点集成的方式连接。

## 相关实体
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](../ch05/018-harness.html)

- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](../ch05/018-harness.html)
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](../ch03/092-hermes-agent.html)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](../ch05/018-harness.html)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/046-agent.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](ch04/463-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/612-agentic.html)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05/052-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](../ch05/052-harness-engineering.html)

---

