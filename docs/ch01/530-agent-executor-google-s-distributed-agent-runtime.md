# Agent Executor, Google's distributed Agent Runtime

## Ch01.530 Agent Executor, Google's distributed Agent Runtime

> 📊 Level ⭐⭐ | 8.7KB | `entities/agentexecutorgooglesdistributedagentruntime.md`

## 核心要点

- As models and harnesses improve, agents are taking on increasingly complex tasks that can run for hours or even days. But as we push agents to do more
- Today, we're introducing **Agent Executor,** Google's [open-source](https://github.com/google/ax) runtime standard for agent execution, resumption, an
- *   **Durable execution:** Long-running execution requires the ability to resume after outages or agentic interruptions such as human-in-the-loop (HIT
- *   **Secure isolation**: Agent Executor isolates components in secure-by-design sandboxes to prevent harmful side effects and help ensure malicious a
- *   **Session consistency:**In distributed agent workflows, multiple components may attempt to update shared session state at the same time. Agent Exe
- *   **Connection recovery:** In long-running agentic execution, clients may disconnect for many reasons, including network outages. Agent Executor let
- *   **Trajectory branching:**Checkpoints let you branch an agentic trajectory (its decision or workflow path) at any point, allowing agents to test or
- In this blog, we'll share more about Agent Executor and how you can get started.

## 相关实体
- [Agent Executor Googles Distributed Agent Runtime Da1Bb4](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-executor-googles-distributed-agent-runtime-da1bb4.md)
- [从 Anthropic 到 Googleagent Skills 正在进入设计模式阶段](https://github.com/QianJinGuo/wiki/blob/main/entities/从-anthropic-到-googleagent-skills-正在进入设计模式阶段.md)
- [Cong Anthropic Dao Googleagent Skills Zhengzai Jinru Sheji Moshi Jieduan](https://github.com/QianJinGuo/wiki/blob/main/entities/cong-anthropic-dao-googleagent-skills-zhengzai-jinru-sheji-moshi-jieduan.md)
- [Google Agentic Rag Sufficient Context Agent Framesqa](https://github.com/QianJinGuo/wiki/blob/main/entities/google-agentic-rag-sufficient-context-agent-framesqa.md)
- [Anthropic Google Agent Skills Design Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-google-agent-skills-design-patterns.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentexecutorgooglesdistributedagentruntime.md)

- [Design Md Google Stitch Voltagent Ai Design Agent](https://github.com/QianJinGuo/wiki/blob/main/entities/design-md-google-stitch-voltagent-ai-design-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)
## 深度分析

### 1. 问题定位：长时运行 Agent 的运维困境

随着 LLM 和 Agent 框架（harness）能力的提升，Agent 正在承担越来越复杂的任务——这类任务可能持续数小时甚至数天。然而，这种长时运行特性暴露了传统软件架构的根本性缺陷：传统的请求-响应模型无法优雅处理**中断恢复**、**状态一致性**和**分布式协作**等问题。

### 2. 核心架构设计

Agent Executor 的设计围绕五大原生能力展开：

| 能力 | 技术实现 | 解决的问题 |
|------|----------|------------|
| **Durable Execution** | Event log + Snapshotting | 进程崩溃、HITL 中断后的自动恢复 |
| **Secure Isolation** | Secure-by-design sandbox | 恶意代码、跨租户数据泄露 |
| **Session Consistency** | Single-writer architecture | 多组件并发写导致的状态损坏 |
| **Connection Recovery** | Sequence-based backfill | 网络断连后的体验连续性 |
| **Trajectory Branching** | Checkpoint + Branch | 决策路径的探索与回溯 |

这些能力形成一个完整的长时运行 Agent 生命周期管理体系。

### 3. 与现有生态的兼容性策略

Agent Executor 明确走 **harness-agnostic** 路线，支持多种 Agent 构建框架：

- **Google 自研**: Antigravity（Gemini 的 state-of-the-art harness）、Deep Research Agent
- **Google 托管**: Managed Agents in Gemini API
- **社区框架**: LangChain/LangGraph、ADK（Agent Development Kit）
- **开放协议**: A2A（Agent2Agent Protocol）

这种兼容性策略有效降低了用户迁移成本，避免了厂商锁定（vendor lock-in），同时扩大了潜在用户群体。

### 4. Agent Substrate：Kubernetes 的 Agent 化扩展

与 Agent Executor 同时发布的 **Agent Substrate** 是另一个关键组件。它解决了标准 Kubernetes 在处理 Agent 工作负载时的局限性：

- **问题**: 标准 K8s 面向 long-running services 设计，无法高效处理"数百万 sub-second tool calls"的 Agent 特有通信模式
- **方案**: 在 K8s 之上引入新的控制平面，实现 Agent 的实时调度（on/off compute capacity），兼顾低延迟和高吞吐
- **优势**: 保留 K8s 生态（declarative config、horizontal scaling），同时绕过其控制平面瓶颈

两者协同：Agent Substrate 提供底层调度，Agent Executor 提供运行时抽象。

### 5. 市场定位与竞争态势

Google 通过 Agent Executor 切入的是 **Agent Runtime** 赛道——这是一个介于上层 Agent 框架和底层基础设施之间的中间层。Google 的优势在于：

1. **基础设施积累**: GKE、Anthos、TPU 构成的云原生生态
2. **模型能力**: Gemini 系列模型的强大推理能力背书
3. **开放生态**: A2A 协议、ADK 的社区友好策略

但竞争也很激烈：AWS 有 Bedrock Agent，Microsoft 有 AutoGen，Anthropic 有 Claude Code/Agent SDK。

## 实践启示

### 对开发者的建议

1. **优先关注 Durable Execution 和 Session Consistency**

   - 如果你的 Agent 涉及多步骤、长时运行任务，checkpoint 和 snapshot 是必备能力
   - Single-writer 架构意味着你需要重新审视并发控制策略——避免多线程/多进程直接修改共享状态

2. **沙箱隔离是生产级 Agent 的必修课**

   - 特别是当 Agent 生成代码、操作文件、访问多租户数据时
   - 不要在生产环境跳过 sandboxing，即使它带来一定性能开销

3. **Trajectory Branching 适合探索与评估场景**

   - 决策路径分支对于 A/B testing、prompt engineering 迭代、异常路径测试非常有价值
   - 可以用于构建"Agent 副本"进行离线分析而不影响主流程

### 对架构师的建议

1. **将 Agent Executor 视为基础设施层**

   - 不要把它当作另一个 Agent 框架，而应视为 **runtime substrate**
   - 它解决的是"如何可靠运行 Agent"而非"如何构建 Agent 逻辑"

2. **混合部署策略**

   - 利用 Agent Executor 的 harness-agnostic 特性，可以在 Google Cloud 和自建基础设施之间灵活分配工作负载
   - 对于数据敏感任务优先 on-prem，对于弹性和成本敏感任务使用 managed service

3. **关注 Agent Substrate 的演进**

   - 如果你已有大规模 K8s 部署，Agent Substrate 值得关注
   - 它代表了"传统云原生"向"Agent 原生"过渡的技术方向

### 技术选型检查清单

- [ ] 任务是否涉及数分钟以上的运行时？→ 需要 Durable Execution
- [ ] Agent 是否操作敏感数据或多租户资源？→ 需要 Secure Isolation
- [ ] 是否有多个组件并发访问 session state？→ 需要 Session Consistency
- [ ] 用户是否可能长时间断连（如移动端场景）？→ 需要 Connection Recovery
- [ ] 是否需要探索不同决策路径而不丢失上下文？→ 需要 Trajectory Branching

### 下一步行动

1. 访问 [GitHub: google/ax](https://github.com/google/ax) 了解开源实现
2. 评估现有 Agent 架构与五大能力的差距
3. 考虑 Pilot 项目：选择一个非关键任务尝试 Agent Executor 的断连恢复能力
4. 关注 A2A 协议生态：跨厂商 Agent 互操作可能是下一个行业趋势

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentexecutorgooglesdistributedagentruntime.md)

---

