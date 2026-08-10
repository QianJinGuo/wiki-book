# 专为 Managed Agents 而生的 Harness 底座：AgentScope 2.0

## Ch04.275 专为 Managed Agents 而生的 Harness 底座：AgentScope 2.0

> 📊 Level ⭐⭐ | 11.1KB | `entities/专为-managed-agents-而生的-harness-底座agentscope-20.md`

# 专为 Managed Agents 而生的 Harness 底座：AgentScope 2.0

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/专为-managed-agents-而生的-harness-底座agentscope-20.md)

## 摘要

AgentScope 2.0 定位企业级分布式 Agent 场景：既可以做分布式 Agent Framework（开发 DataAgent、SreAgent 等），又可以用同一套 Harness 内核撑起企业内的 Managed Agents，成为其底层 Agent Runtime。核心设计是 Brain（推理编排）与 Hands（工具执行）的刻意拆分：推理、编排、Harness 管理由云端统一托管，文件系统、workspace、工具执行则隔离在 Sandbox 沙箱环境或客户 VPC 的 Self-hosted Worker 中。

## Managed Agents 的产品背景

Managed Agents 让 Agent 运行在云端：推理、编排、Harness 管理由平台统一托管，长周期任务不依赖本地设备持续在线。市面上包括百炼、Claude Code、LangChain 等都有类似产品。作者认为 Managed Agents 与低代码 Agent 平台在产品形态上没有本质区别，但在 harness 时代突出两点：**不再让业务开发者拼装 Harness**（记忆维护、上下文压缩、状态恢复、工具权限、子任务回收等通用工程能力收进统一 Harness，开发者只定义 Skills、Tools、Subagents 和权限策略）；**让客户掌握工具执行和数据回传边界**（Brain 负责推理与上下文管理，Hands 负责真正接触文件、网络与业务系统）。

以 Claude Managed Agents 为例，其被接受的重要背景是 Claude Code 证明了成熟 Coding Agent Harness 的产品价值——用户看到模型推理和任务结果，平台真正托管的是可恢复的会话状态、工程化运行策略和可替换的 Hands。Anthropic 的解决方案层层递进：Claude Code CLI（个人/单机）→ Claude Agent SDK（Session、事件流、工具交互 API 化）→ Managed Agents（Agent、Environment、Session 与执行面变成托管资源）。这三层的区别不只是封装变厚，而是**状态归属逐步上移**。

## AgentScope 2.0 为什么适合做 Managed Agents 底座

AgentScope 2.0 的模型抽象、工具与 MCP、消息与事件、状态存储、远程文件系统/分布式 BaseStore、可插拔沙箱，都为进程外持久化和多副本部署预留了扩展点。Workspace 是 Agent 使用的逻辑目录，Filesystem 和 Sandbox 是承载它的物理后端，两者通过 AbstractFileSystem 解耦——同一套文件工具既可以指向本机目录，也可以指向分布式 BaseStore 或 E2B 沙箱，因此 Agent 定义可以在不改业务提示词的情况下切换隔离策略。

HarnessAgent 在 ReActAgent 之上通过 Hook 装配长期运行的工程默认项：

- 工作区驱动的人格与知识：AGENTS.md / MEMORY.md / KNOWLEDGE.md 注入系统提示
- 会话持久化：按 sessionId 恢复 Agent 状态，进程重启后仍能续聊
- 压缩与溢出处理：默认启用 compaction 与 tool-result eviction，允许业务覆盖阈值
- Skills / Subagents：工作区 skills、任务委派开箱可用
- 统一文件系统抽象：本地、远程 KV、云沙箱走同一套工具语义

这些能力组合后的稳定性才是 Harness 作为平台内核的意义——一次长任务可能先从 AgentStateStore 恢复消息与 agent state，再由工作区 Hook 注入 AGENTS.md 和已安装 Skills，上下文逼近窗口上限时压缩 Hook 收敛历史，较大的工具结果淘汰到文件系统仅保留可检索引用。

**HarnessAgent 与 Session 不是同一个生命周期**：前者是在具备共享 AgentStateStore 与可恢复 Workspace 后端的数据面节点上重建的运行对象，后者是有稳定 ID、事件序列和持久状态的产品资源。节点挂掉时可以丢弃 Java 对象，但对话与长期记忆必须从共享状态恢复。

## 企业级 Managed Agents 平台架构

### 控制面（定义与权限）

控制面管理 Agent 静态定义及其版本，也管理 Model、Skills、MCP、Tools、Environment、Memory、Vault 和 Resources 等可复用资源。资源按「定义、引用、挂载」三种关系理解：Model/Tools/MCP/Skills 进入 Agent 版本定义；Environment 独立存在由 Session 引用；Memory Store、Vault、Files/Resources 在 Session 创建时挂载。控制面还承担变更治理：Agent 更新生成新版本、Environment key 可 rotate、资源可 archive 而非立即删除——这些能力决定回滚、灰度和事故追责是否可行。

**Environment 归属控制面**（执行面模板：local / sandbox / remote / self_hosted + config + environment key，可被多个 Session 引用，不产生对话事件）；**Session 归属数据面**（Agent × Environment 的一次运行实例，带状态机与事件日志）。

### 数据面（跑起来并记下来）

数据面承载模型调用、ReAct loop、Harness hooks、turn 租约、Session 状态机、事件持久化与 SSE 推送，也处理 interrupt、HITL 和外化工具结果续跑。操作围绕状态机展开：user.message 把状态从 idle 推向 running，工具确认把 requires_action 恢复为 running，interrupt 尝试取消当前 turn，archive 终止后续使用但保留审计历史。数据面由对等 SaaS 副本组成，每个 turn 通过含 userId、sessionId 的 RuntimeContext 定位会话状态——「无状态副本」指不持有不可替代的权威状态，而不是每个请求都重新创建对象。

数据面托管四类生命周期不同的状态，恢复流程必须分别恢复每一层，再用事件 ID、tool call ID 和资源引用重新关联：Session 事件能证明模型曾请求写文件，但不能代替文件本身；AgentStateStore 能恢复上下文，却不自动恢复外部数据库的副作用。生产系统必须把模型上下文与文件系统当作一个恢复单元设计。

### Worker（在谁的机器上动手）

Worker 关注工具如何从 Brain 到达真正的执行环境，两条路径的区别在于谁发起工具调用、谁管理沙箱生命周期：

- **全托管（Cloud Sandbox）**：Brain 创建和回收 Sandbox，通过 AgentScope 提供的 E2B 兼容 API 发起文件或 shell 调用，后台可由 FC Sandbox 等兼容服务承接。平台掌握完整句柄，可统一设置超时、隔离范围和持久化策略。
- **Self-hosted**：Brain 收到模型 tool call 后不连接客户 VPC，而是持久化 agent.tool_use 并创建 work item，客户侧 Worker 主动 poll 队列、在自己的主机或沙箱中执行，再通过 user.tool_result 回传结果。Brain 只知道 work 状态和工具结果，客户 Worker 必须负责本地沙箱存活、重复任务安全、结果脱敏。执行发起权在用户侧。

Work 状态机为 `queued → starting → active → stopping → stopped`。已有 Session 不支持中途切换 worker 执行环境；要更换信任边界应创建新 Session，以免同一条事件历史跨越不同执行语义。

## Agent Team 编排示例

用 AgentDev 场景展示三角色团队（Java 库发布规划任务）：Repo Surgeon（代码质量视角，只读工作区）、Ops Publisher（发布流程视角，只生成文本草案）、Team Lead（汇总风险与验收清单，只负责委派和汇总）。拆成三个 Agent 是为了分别约束工作区权限、外部系统接入和汇总职责——最小权限与独立审计，而不是把所有工具塞进一个超级 Agent 后只靠提示词约束。

系统提供两种多 Agent 运行方式：

- **Harness 原生委派**：Team Lead 在推理过程中用 sessions_spawn / Subagent 工具动态拆解任务，父子任务之间存在明确的委派与结果回收关系
- **平台 fan-out**：/api/multiagent/run 为多个 Agent 分别创建 Managed Session，把同一消息顺序或并行发送给它们，适合独立分析、批处理和投票

MultiagentSpec 的 wire schema 是 `type + agents[]`；wait_async_results 用于阻塞等待通用异步 inbox，sessions_pending_completions 用于枚举已完成但未消费的子 Session 结果，两者服务于不同的异步模式。高风险 MCP 写操作需要在 MCP 网关侧做身份、审批与幂等控制，不能只依赖 Agent body 中的 always_ask。

## 与既有 AgentScope 体系的定位差异

AgentScope 2.0 在平台中的角色非常明确：**提供 HarnessAgent 与 FS/Sandbox 抽象，保证「效果默认项」和「执行面可替换」**；Managed Agents 负责租约、事件契约、多租与 ACL，而不是再包一层私有化的 ReAct。相比 [AgentScope Java 2.0 企业级分布式 Harness](../ch05/017-harness.html)（聚焦 JVM 多租户资源隔离与中间件体系）和 [AgentScope Builder](ch04/769-self-evolving-agent.html)（自进化智能体的产品化），本实体聚焦 AgentScope 2.0 作为 **Managed Agents 底座 Runtime** 的 Brain/Hands 拆分、控制面/数据面分层与三种 Worker 执行模式。

## 相关实体

- [AgentScope Java 2.0：企业级分布式 Harness 框架](../ch05/017-harness.html)
- [AgentScope Builder](ch04/769-self-evolving-agent.html)
- [AgentScope Java Harness Framework](../ch03/057-agentscope-java-harness-framework-2-0-agent-harness.html)
- [我用阿里 AgentScope 复刻了一个 WorkBuddy](../ch03/037-agent.html)
- [Agent Harness 架构](../ch05/042-agent-harness.html)
- [Agent Harness 生产化](../ch05/042-agent-harness.html)
- [Harness 工程范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)
- [100 行 vs Managed Harness 权衡](https://github.com/QianJinGuo/wiki/blob/main/concepts/100-line-vs-managed-harness-tradeoff.md)
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- [Agent Loop 设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md)

---

