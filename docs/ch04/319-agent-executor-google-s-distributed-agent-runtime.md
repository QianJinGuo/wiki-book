# Agent Executor, Google's distributed Agent Runtime

## Ch04.319 Agent Executor, Google's distributed Agent Runtime

> 📊 Level ⭐⭐ | 7.4KB | `entities/agent-executor-googles-distributed-agent-runtime-da1bb4.md`

## 核心要点

Detailed technical overview of Google's Agent Executor runtime with substantial architectural concepts. Covers durable execution, secure isolation, session consistency, connection recovery, and trajectory branching - all unique insights for distributed agent systems.

## 标签

ai, agent, runtime

## 深度分析

### 为什么 Agent 需要专用 Runtime

Google Agent Executor 的发布标志着分布式 Agent 运行时正式进入开源主流战场。与传统微服务 runtime 不同，Agent Executor 面向的是非线性、长时序、等待外部输入的 agent 程序——这类工作负载完全无法套用标准 Kubernetes 模型。传统微服务假设请求-响应模式，而 agent 程序会持续运行数小时甚至数天，频繁等待外部信号（人类确认、工具返回、其他 agent 响应）。Agent Executor 的设计从第一性原理出发：它不是微服务容器，而是"会思考的容器"——自带状态持久化、安全隔离和优雅恢复能力。

### 核心架构：五层能力模型

Agent Executor 围绕五个原生能力构建了完整的 agent 运行时栈：

**Durable Execution** 是整个系统的基石。长时序执行要求系统在中断（outage 或 human-in-the-loop 确认）后能够无缝恢复。Agent Executor 通过 event log 和 snapshotting 机制自动为任何 actor（agent、harness、skill、tool、sandbox）提供这种后端弹性。这意味着 agent 不需要自己管理 checkpoint 逻辑——runtime 自动处理。这与大多数 agent 框架将恢复逻辑推给开发者的设计形成鲜明对比。

**Secure Isolation** 采用 secure-by-design sandboxes 将每个组件隔离。当 agent 生成代码或同时处理多租户数据时，恶意活动无法影响更广泛的服务。这不是事后补丁，而是架构层面的安全原语。

**Session Consistency** 的 single-writer 架构解决了分布式 agent 工作流中的状态竞争问题。Agent Executor 通过限制写入者数量来保证一致性，而非依赖复杂的锁机制或 CRDT——这是教科书级别的分布式系统设计原则在 agent 场景的具体应用。

**Connection Recovery** 解决了长时序执行中的客户端连接问题。网络中断在长时间运行的 agent 会话中几乎必然发生。Agent Executor 允许客户端重连到 agent，并从上次看到的序列回填响应，将网络不可靠性从 agent 逻辑中抽离出来。

**Trajectory Branching** 的 checkpoint 机制允许 agent 在任意点分支其决策路径或工作流，从而可以测试或评估不同路径而不丢失上下文。结合 durable execution 的 snapshotting 能力，整个系统实现了真正的任务可恢复性和实验能力。

### 联邦架构与混合部署

Agent Executor 的关键设计决策是 federate with Google's agent runtime。企业 agent 部署不是单一模式——某些团队需要 on-prem 基础设施用于专有工作流或合规，另一些偏好预构建 managed agents。Agent Executor 桥接这些部署模型，允许在以下组件间任意混搭：Google Antigravity（Gemini 的 agent harness）、Google 自建的 frontier agents（如 Deep Research）、企业自定义 agents（通过 Managed Agents in Gemini API）、基于 LangChain/LangGraph、ADK 等框架构建的 agents、以及所有支持 A2A (Agent2Agent Protocol) 的 agents。

这种架构选择反映了 Google 的战略判断：agent 生态不会收敛到单一 harness，而是保持多元化。通过在 runtime 层面提供统一抽象，Google 将自己定位为 agent 基础设施的"操作系统"，而非某个特定 agent 框架的提供者。

### Agent Substrate：百万级 Agent 计算层

Agent Executor 的配套项目 Agent Substrate 引入了 Kubernetes 之上的新抽象层，专为 agent 工作负载设计。标准 Kubernetes 优化处理数千个长期运行的服务，但 Agent Substrate 设计用于处理数百万个 sub-second tool calls 的模式——这会压垮标准 control plane。

Agent Substrate 将 agent 实时移入和移出就绪计算容量，从现有 sandbox 基础设施中提取核心安全运行时和 snapshotting 能力，搭配最小化 control plane，绕过 Kubernetes 的部分限制而不需要重新发明其余部分。企业可以在 Kubernetes 生态内运行大规模 agent 部署，同时获得专为 agent 优化的调度和水平扩展能力。

### 开放性与 Vendor Lock-in 的战略博弈

Agent Executor 的 harness-agnostic 设计表明 Google 认识到 agent 生态的多元化现实。通过支持 LangChain/LangGraph、ADK、A2A 等开放标准，Agent Executor 让企业保留现有 agent 开发投资，同时获得 Google 在 runtime 层面的基础设施优化。这种定位将竞争从"哪个 agent 框架更好"转移到"哪个 runtime 基础设施更可靠"——而后者恰好是 Google 的优势领域。

## 实践启示

1. **选择 runtime 而非框架**：部署 agent 系统时，优先考虑像 Agent Executor 这样的专用 runtime，而非绑定到特定 agent 框架。Runtime 的持久性、隔离性和一致性保障是基础设施层，而框架是应用层。

2. **利用 trajectory branching 做 agent 调试**：当 agent 行为不符合预期时，使用 checkpoint 和 branching 在不同决策点创建分支，对比不同路径的结果。这是 agent 调试的范式转变——从"重新运行看看"到"在历史分支点探索"。

3. **设计支持 connection recovery 的用户体验**：Agent Executor 的 client reconnection 能力意味着产品设计时可以考虑"连接中断后无缝恢复"的用户体验，而不必要求用户重新开始整个任务。

4. **在 Kubernetes 生态中采用 Agent Substrate**：如果你的 agent 工作负载规模达到数百万级别，标准 Kubernetes 会成为瓶颈。评估标准：如果 agent 每天产生超过 10 万次 tool calls，值得研究 Agent Substrate。

5. **通过 A2A 协议实现跨组织 agent 协作**：Agent2Agent Protocol 的开放性意味着不同组织开发的 agent 可以互操作。不要等到需要协作时才考虑协议兼容性。

6. **安全隔离是 production-grade 的门槛**：如果你的 agent 系统处理多租户数据或生成代码，secure sandbox 不是可选项——它是 production-ready 的硬性要求。Agent Executor 的 secure-by-design 方案提供了可参考的架构模式。

## 相关实体

- [Agentexecutorgooglesdistributedagentruntime](290-agentrun.html)
- [Google Agentic Rag Sufficient Context Agent Framesqa](../ch03/004-agent.html)
- [A Bitter Lesson For Data Filtering E8807D](../ch01/540-a-bitter-lesson-for-data-filtering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-executor-googles-distributed-agent-runtime-da1bb4.md)

---

