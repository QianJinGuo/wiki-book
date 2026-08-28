# Agent 作为软件架构的新一层：Codex Harness 平台化 + DSH Subagent（Agent-as-Execution-Unit）

## Ch05.100 Agent 作为软件架构的新一层：Codex Harness 平台化 + DSH Subagent（Agent-as-Execution-Unit）

> 📊 Level ⭐⭐ | 6.1KB | `entities/codex-harness-platform-dsh-subagent-agent-as-execution-unit-ruofei-2026.md`

# Agent 作为软件架构的新一层：Codex Harness 平台化 + DSH Subagent

## 一句话总结

若飞源码级拆解 DeepSeek Harness（DSH）0.1.0-rc.8 的 subagent 子系统与 OpenAI Codex 的平台化开放，提出**「Agent 正在成为软件架构的新一层」**：完整 Agent（带着自己的 Loop、状态和权限体系）开始被当作另一个系统的可调用执行单元，组合粒度从「模型调用 → 工具调用」抬升到「**Agent 调用**」，并推演出 Agent 编排需拆分的四种控制权与 Harness 作为执行基础设施层的判断。

## 为什么是独立维度

既有相关实体覆盖不同层次：`claude-fable-5-agent-runtime-contract-ruofei-2026` 讲 Runtime 契约协议层（任务协议/能力路由/状态/治理）；`agent-runtime-7-responsibilities-secondcurve-2026` 讲 Runtime 七大职责；`codex-goal-agent-runtime` 讲 Codex goal 状态机。而本文的核心维度是**「Agent 作为可被另一系统调用的执行单元」**——具体到 Codex app-server 的控制接口/事件转换层职责、DSH 把 Codex/CC 接成 `subagent_codex`/`subagent_claude_code` 具名工具的实现，以及「模型调用→工具调用→Agent 调用」的组合粒度跃迁——这一「Agent 进入软件架构新一层 + 编排控制权拆分」视角全库零覆盖。

## 核心机制

### Codex Harness 平台化（app-server）
OpenAI 把 Codex 背后的 Harness 放到平台位置，开放 CLI/SDK/app-server/Skills/Plugins。**app-server 是控制接口和事件转换层**，不是再造 Agent Loop——它把外部请求转换成 Thread/Turn 操作，把核心事件整理成客户端可消费的通知。源码链路：`外部宿主 → app-server → thread/start → turn/start → run_turn → 模型采样与工具执行`。

### DSH 把完整 Agent 接成子代理
DSH rc.8 里 Codex 和 Claude Code 是 Profile Bundle，安装并打开工具后，父 Agent 看到 `subagent_codex`/`subagent_claude_code` 具名工具。调用分两段：父 Agent 决定委派/选工具/写任务/前后台；DSH 运行时负责注册适配器、校验、启动进程、管理 Job、取消、收结果。provider 预绑定 `providerName` 和固定 `toolName`，模型只见稳定工具名。Codex 走 app-server（临时 thread/turn），Claude Code 走官方 SDK（`persistSession: false`）。

### 组合粒度跃迁
回顾 MCP → Agent 技术栈 → Context/Loop/Harness/Environment 的演进，DSH 这次接进来的是带自己 Loop/状态/权限体系的完整 Agent——组合粒度从「模型调用 → 工具调用」抬升到「模型调用 → 工具调用 → **Agent 调用**」。工具协议解决「Agent 怎样使用能力」，Runtime 层则问「一个完整 Agent 怎样被另一个系统调用」。

### Agent 编排的四种控制权拆分
| 参与者 | 在调用链里做什么 |
|--------|----------------|
| 父 Agent | 判断是否委派、选择子代理、组织任务、决定是否等待 |
| DSH 运行时 | 暴露工具、启动适配器、管理进程/Job/取消/结果收集 |
| Codex/Claude Code | 在各自 Harness 内维护上下文、运行 Loop、调工具、执行原生沙箱和权限策略 |
| 业务系统与人 | 提供权威事实、决定业务动作能否发生、用真实结果验收 |

三件事不能混：选中子代理 ≠ 拿到全部权限；子代理说「完成」≠ 业务验收通过；取消 Job ≠ 副作用已回滚。

### Harness 作为执行基础设施层
模型提供推理能力，Harness 管状态/Loop/工具/沙箱/审批/事件，宿主接进产品和业务流程。这一层不取代业务后端——Harness 的状态不是订单/运单/发布记录，审批不继承公司业务授权。ARC-AGI-3 例子（保留状态+上下文压缩，GPT-5.6 Sol 13.3%→38.3%、Token 降 1/6）只支撑克制判断：模型没换，执行状态怎么保留结果差很多。

## 当前局限（克制边界）
OpenAI 文档仍把 app-server 命令和 WebSocket 传输标在实验性边界内（不支持生产工作负载）；DSH rc.8 两个外部 provider 还是一次性委派，无共享长期记忆/持续协作/统一验收。代码开放、协议跑通、生产可托付是三件事。

## 相关概念
- [Fable 5 信号：Agent 拼 Runtime（若飞 Runtime Contract）](../ch01/475-claude-fable-5.html)
- [Agent Runtime 七大职责](../ch03/006-agent.html)
- [Codex Goal Agent Runtime](../ch04/246-codex-goal-agent.html)
- [Harness 工程范式](ch05/096-harness-engineering.html)
- [Agentic Environment Engineering](../ch04/298-agentic.html)
- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/codex-harness-platform-dsh-subagent-agent-as-execution-unit-ruofei-2026-08-21.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/codex-harness-platform-dsh-subagent-agent-as-execution-unit-ruofei-2026-08-21.md)

---

