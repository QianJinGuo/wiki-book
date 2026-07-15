# OMEGA: 面向多机器人协作的具身Agent Harness

## Ch05.061 OMEGA: 面向多机器人协作的具身Agent Harness

> 📊 Level ⭐⭐ | 8.3KB | `entities/omega-orchestration-multiple-embodied-generalist-agents-ustc-2026.md`

# OMEGA: 面向多机器人协作的具身Agent Harness

## 摘要

OMEGA（Orchestration system for Multiple Embodied Generalist Agents）是一套面向真实世界多机器人协作的 embodied agent harness，由中国科学技术大学张举勇教授团队联合上海人工智能实验室共同完成。 它将 LLM 驱动的 coding agent 协作模式（任务拆解→子任务分配→并行执行→结果汇总）引入机器人领域，为多机器人团队提供一层可执行的协作系统，覆盖任务感知与拆解、动态任务分配、并行执行控制、状态同步与等待协调、异常检测与重调度、以及技能沉淀与复用六大关键能力层。

## 核心要点

- **协作系统而非动作模型**：OMEGA 不是再做一个机器人动作模型，而是为多机器人团队提供一层可执行的协作系统，解决"多台机器人的动作如何组成一次协作"的问题，而非"一台机器人的感知如何变成一次动作"。
- **Harness 架构类比**：与 Claude Code/Codex 等 coding agent 的协作模式类似——主 agent 将任务拆成子任务分给 subagent，OMEGA 将类似的系统能力带到机器人协作中，把工程师脑中的调度经验变成系统中可执行的流程。
- **三层分工**：Skills（每个 worker 能做什么）、A2A（orchestrator 与 worker 之间的任务派发与状态同步）、MCP（worker 内部连接机器人 runtime）。这种分层让 orchestrator 不需要知道每台机器人的内部实现。
- **可并行的步骤绝不串行，有依赖的步骤绝不抢跑**：OMEGA 通过 task graph 将并行关系和等待关系明确写进系统，真正在多机器人场景做到调度自动化。

## 深度分析

### 从 Software Agent Orchestration 到 Embodied Agent Orchestration

OMEGA 的核心洞察是，将软件 agent 领域已经成熟的 orchestration 模式（如 Claude Code 中的 subagent 调度、Coze 中的 multi-agent 工作流）移植到物理世界。但物理世界的约束截然不同：任务执行不可撤销（抓起的物体无法"撤回"）、时序依赖不可逆（必须先取面包才能放配料）、物理冲突必须检测（两台机器人不能同时占据同一空间位置）。

OMEGA 通过 task graph 机制解决了这些物理约束的表达问题。每个任务节点需要声明：任务内容、assigned worker、使用的 Skill、依赖的前置任务、需要的输入、成功后的输出，以及超时/失败/取消时的处理策略。这使得错误处理被内置在执行链路中，而非作为事后补救逻辑。

### 三层系统架构的设计理性

OMEGA 的三层架构（Skills → A2A → MCP）体现了清晰的分层设计原则：

- **Skills 层**：每个 worker 对外公开一张 Agent Card（即"机器人团队成员的名片"），声明自身能力集。这张卡片告诉 orchestrator：我是谁、我支持哪些 Skills、我是否准备好接任务。这种声明式接口让新增机器人变得简单——只需注册其 Skills，无需修改调度逻辑。
- **A2A 层**：orchestrator 与 worker 之间的公开协作协议，涵盖发现（Discover）、规划（Plan）、调度（Schedule）、派发（Dispatch）和观察（Observe）五个步骤。这是 OMEGA 的"团队协作面"。
- **MCP 层**：worker 内部连接机器人执行引擎的接口。不同厂商的 VLA 模型、控制器、执行程序、debug 工具都封装在这一层，不暴露给公共调度层。这是 OMEGA 的"机器人执行面"。

这种分层意味着机器人能力可以像插件一样加入团队，同时又不把厂商内部实现暴露到公共调度层，彰显了 harness 工程中的关注点分离（separation of concerns）原则。

### 与现有方案的对比定位

| 维度 | OMEGA | 纯软件 Agent Orchestration | 传统多机器人控制 |
|------|-------|---------------------------|-----------------|
| 物理约束处理 | 原生支持（冲突检测、交接时序） | 不支持 | 需手动编码 |
| 机器人异构性 | Skills 声明式接入 | N/A | 通常要求同构 |
| 任务表达能力 | Task Graph（并行+依赖） | DAG 工作流 | 有限的状态机 |
| 错误恢复 | 内置（超时/重试/终止） | 部分支持 | 工程师手动介入 |
| 可扩展性 | 新增 worker 注册 Skills 即可 | 新增 agent 注册接口 | 需重写调度逻辑 |

OMEGA 填补了纯软件 orchestration（不考虑物理约束）和传统多机器人控制（硬编码、不可扩展）之间的空白，为具身智能的"团队化"提供了一条工程化路径。

### 对 Harness Engineering 的启示

OMEGA 的设计理念对通用 harness engineering 有重要借鉴意义：它展示了 harness 层如何为 AI 系统提供"可执行的组织层"——不是替代底层模型能力，而是把模型能力包装成可声明、可调度、可观察的协作单元。这与 [Agent Harness Context Management Working Set](ch05/039-agent-harness.html) 中描述的 context management 思路异曲同工：两者都是在模型能力之外，构建一层系统化的组织与调度能力。

## 实践启示

1. **在引入 AI 编排层之前，先定义清晰的能力接口**：OMEGA 的 Skills 声明机制启示我们，任何 AI 系统集成都应先建立声明式能力目录，而非直接耦合调度逻辑与实现细节。

2. **物理世界约束必须作为一等公民纳入设计**：软件 orchestration 的成功经验不能简单移植到机器人领域——物理约束（运动规划冲突、物体交接时序）需要在设计层面就被考虑，而非在事后打补丁。

3. **错误处理应内置于执行链路，而非另起一套**：OMEGA 将超时、重试、失败策略声明在 task graph 节点中，确保异常恢复与正常执行共享同一套状态跟踪机制。

4. **关注点分离让系统可扩展**：把"团队协作"（A2A）和"机器人执行"（MCP）分成清晰的两层，使机器人能力像插件一样加入团队，这是 harness 工程中的核心设计模式。

5. **从 demo 到可复现系统的路径需要工程化沉淀**：OMEGA 的 mission evidence 机制（task graph + worker reports + event timeline）展示了如何让一次演示变为可检查、可复盘、可迭代的系统能力。

## 相关实体

- [Agent Orchestration Multi Agent Systems](../ch04/490-agent-orchestration.html) — 多智能体编排的基础架构模式，OMEGA 将其扩展到物理机器人领域
- [Coze 3 Multimagent Team Orchestration Wangheige](../ch03/046-agent.html) — Coze 的团队级编排设计，提供软件侧的参考对比
- [Agent Harness Context Management Working Set](ch05/039-agent-harness.html) — harness 工程中的 context management，与 OMEGA 的分层设计有相似的设计哲学
- [阿里云刚发布的 Agentloop 是什么](../ch04/293-agentloop.html) — 阿里云的 AgentLoop 编排方案，为软件侧的多 agent 协作提供另一种范式参考

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/omega-orchestration-multiple-embodied-generalist-agents-ustc-2026.md)

---

