# Agent orchestration

## Ch01.111 Agent orchestration

> 📊 Level ⭐ | 4.9KB | `entities/agent-orchestration.md`

## 核心要点
- **控制平面缺失是 Agent 网络失效的根本原因**：状态丢失、人为审批缺失、单点故障导致静默级联失败
- **AWS Step Functions** 提供确定性工作流编排，支持状态管理、重试逻辑、分支与并行执行
- **Amazon Bedrock Agents** 实现推理驱动的 Agent 协调，内置工具调用、记忆与动态路由
- **Human-in-the-loop** 审批工作流：关键决策节点暂停等待人工确认
- **Amazon MWAA**（Managed Workflows for Apache Airflow）基于 DAG 的编排，处理复杂多步骤管道

## 深度分析
Agent 编排（Agent Orchestration）是多 Agent 系统从「实验原型」走向「生产可靠」的关键跨越。当单个 Agent 独立运行时，问题相对可控——调用工具、执行任务、返回结果。但一旦将多个专业化 Agent 编织成网络，如果没有控制平面（Control Plane）来管理执行流程、状态持久化和审批门控，整个系统会在三个维度上暴露脆弱性。
**状态丢失问题**尤为典型。在一个典型的多 Agent 协作流程中：Agent A 负责任务拆解，Agent B 负责具体执行，Agent C 负责结果整合。如果某个步骤失败，缺乏持久化状态的系统无法从断点恢复，只能从头重启，导致重复计算和资源浪费。AWS Step Functions 通过其内置的状态管理机制解决了这一问题——每个状态转换都有记录，失败后可精确重试而非全链路重启。
**审批门控的缺失**是生产环境的另一大隐患。在企业级应用中，某些操作具有不可逆性：删除资源、发送外部通信、审批财务流程等。这些操作如果由 Agent 自主执行，一旦出错代价极高。工作流中嵌入人工审批节点（Human-in-the-loop Approval）使得系统能够在关键步骤暂停，将控制权交还给人类操作员，这是 Agent 系统获得企业信任的技术基础。
**静默级联失败**则是缺乏编排层的最严重后果。当某个 Agent 节点宕机或返回异常时，没有编排层通知的系统会继续将任务发送给已失效的节点，导致整条链路返回错误结果或超时。MWAA 等 DAG-based 编排工具通过任务依赖图和健康检查机制，能够在某个节点失败时及时终止下游任务并向上游传递错误信号，避免错误结果的沉默扩散。
从架构视角看，Agent 编排层本质上是一个**元认知系统**——它不直接执行业务任务，而是管理任务执行的方式、时机和条件。这种关注点分离（Separation of Concerns）使得业务 Agent 的开发可以专注于领域能力，而编排逻辑的演进不影响单个 Agent 的内部实现。

## 实践启示
1. **从确定性工作流入手，逐步引入智能路由**：先用 Step Functions 固定核心业务流程的骨架，再在需要动态判断的节点嵌入 Bedrock Agents 的推理能力。渐进式演进比一步到位的架构更可控。
2. **为每个 Agent 定义清晰的健康检查和降级策略**：当某个 Agent 无响应时，编排层应能自动切换到备用路径或人工干预节点，而非静默超时。
3. **审批节点的设计需要克制**：并非所有操作都需要人工审批，过多的停顿会破坏用户体验并抵消 Agent 自动化带来的效率提升。建议只在「不可逆操作」「高价值操作」「合规要求」三类场景中嵌入审批门控。
4. **状态持久化是容错的基础**：确保每个关键状态转换都被记录，支持精确断点恢复。这在长时间运行的任务中尤为重要——Agent 执行可能跨越数小时甚至数天。
5. **编排层也需要监控**：传统意义上监控系统监控业务服务的健康状况，但编排层本身的状态（Pending/Running/Failed 任务数、超时率、人工审批平均等待时长）同样需要可观测性，以便在编排层本身发生问题时及时告警。

## 关联阅读
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-orchestration.md)

- [Multi-Agent 深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md) — 多 Agent 协作模式的具体实践
- [Agent Harness 工程学调研](../ch05/092-harness-engineering.md) — Agent 系统构建的核心架构要素
- [基于 Bedrock AgentCore 构建企业级应用](../ch11/048-bedrock-agentcore.md) — AWS 生态中 Agent 编排的具体实现路径
- [James 多 Agent 协作模式](../ch03/045-agent.md) — 不同多 Agent 协作架构的对比分析

---

