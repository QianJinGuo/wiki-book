# Build a highly scalable serverless LangGraph multi-agent system

## Ch11.234 Build a highly scalable serverless LangGraph multi-agent system

> 📊 Level ⭐⭐⭐ | 8.8KB | `entities/serverless-langgraph-multi-agent-aws.md`

# Build a highly scalable serverless LangGraph multi-agent system

## 核心内容

# Build highly scalable serverless LangGraph multi-agent systems in AWS with Amazon Bedrock AgentCore

Generative AI has rapidly evolved from experimental prototypes into systems that are expected to operate reliably in production, at scale, and under real-world performance constraints. As organizations move beyond demos and proofs of concept, they increasingly encounter challenges related to inference latency, scalability, state management, and operational visibility. Building high-performance AI agents today requires more than powerful models and demands an implementation that can deliver consistent performance, preserve context across interactions, and provide deep observability into how agents reason and behave in production.

In this post, we provide a solution to build highly scalable, serverless multi-agent generative AI systems on AWS using [LangGraph Agents](https://www.langchain.com/langgraph) as orchestrators integrated with [Amazon Bedrock AgentCore Memory](https://aws.amazon.com/bedrock/agentcore/) and [Amazon Bedrock AgentCore Observability.](https://aws.amazon.com/bedrock/agentcore/)

Our approach for building highly scalable serverless multi-agent orchestrations combines serverless technologies such as [AWS Lambda](https://aws.amazon.com/lambda/) and [AWS Step Functions](https://aws.amazon.com/step-functions/). These services can be used by developers to build LangGraph agents that scale automatically, respond to events in real time, and remove infrastructure management. This makes them ideal for dynamic, bursty agent workloads. By combining these services, you can orchestrate complex multi-tool agent workflows with durable state management, retries, and fine-grained cost control.

LangGraph's explicit graph-based execution model enables deterministic coordination, parallelism, and conditional routing between agents, making complex multi-agent workflows more straightforward to reason and debug. By separating orchestration logic from agent behavior, you can use LangGraph to add, remove, or evolve specialized agents independently while maintaining a clear, auditable execution path. This is especially valuable for production systems that require predictable behavior, extensibility, and structured control over multi-agent reasoning.

AgentCore Observability extends these capabilities by providing detailed visibility into each invocation, capturing model inputs/outputs, latency, and tool-chain metrics across distributed serverless components. Integrated memory services from AgentCore Memory enable agents to maintain short-term conversational context and long-term knowledge across sessions.

## Solution overview

Our serverless LangGraph and AgentCore based multi-agent orchestration system solution is a generative AI-powered multi-agent campaign review system that orchestrates human reviews using diverse personas that enable marketing campaigns to resonate authentically with target audiences while maintaining legal alignment and brand s

## 深度分析

### 1. Serverless 与 LangGraph 的架构互补性

AWS Lambda 的自动伸缩特性与 LangGraph 的显式图执行模型形成了互补：Lambda 处理无状态弹性扩展，LangGraph 管理有状态的多 Agent 协调逻辑。这种组合使系统能够应对突发性 Agent 工作负载，而无需预置服务器容量。Lambda 的事件驱动模型天然契合 Agent 的请求-响应模式，而 LangGraph 的确定性执行路径确保了在分布式环境下的可调试性。

### 2. 多 Agent 并行化的三层解耦架构

该方案通过三层分离实现复杂性管理：编排层（LangGraph orchestrator）、执行层（Specialized agents）、基础设施层（Lambda + API Gateway）。这种架构将工作流控制逻辑与具体 Agent 行为分离，使得添加、移除或演进专用 Agent 不会影响整体执行路径。三个并行 Agent（persona reviewer、validator、finalizer）通过图节点的边定义控制流，实现了关注点分离。

### 3. 内存与可观测性解决生产环境核心挑战

AgentCore Memory 提供跨独立 Agent 运行时的共享上下文支持，同时支持多轮对话。AgentCore Observability 在 CloudWatch 中提供 traces、session count、latency、token usage 和 error rates 等关键指标。这种"状态管理 + 可见性"的组合直接针对实际 Agent 部署中最常见的两个挑战——上下文保持和调试困难。

### 4. Docker 容器化部署的权衡

LangGraph orchestrator 和 specialized agents 被打包为 Docker 容器，这提供了移植性但也引入了冷启动延迟。对于 bursty agent 工作负载，容器的初始化时间可能影响响应延迟。方案通过 Lambda 的预置并发或容器实例池可以缓解这一问题，但在架构选型时需要权衡无服务器弹性与容器化带来的复杂度。

### 5. Campaign Review 作为多 Agent 编排的典型场景

该方案选择营销活动审核作为演示场景，展示了多 Agent 协作的完整链路：从多角度 persona 评审、合规验证到最终建议合成。这个场景体现了 Agent Orchestration Patterns 中描述的 Fan-Out 与 Agent Pool 模式的组合应用——多个独立 Agent 并行运行，结果被收集后进行增量聚合。

## 实践启示

### 1. 优先采用显式图模型管理多 Agent 依赖

在构建多 Agent 系统时，应使用 LangGraph 这类显式图执行模型而非隐式链式调用。图模型的节点-边表示使得条件路由、并行分支和执行路径审计变得直接。对于需要 deterministic 行为和可审计性的生产系统，这种显式建模方式是必要的。

### 2. 为 Agent 运行时配置多层次可观测性

生产环境部署必须包含完整的可观测性层：模型输入/输出捕获、执行路径追踪、延迟分解、token 成本追踪。AgentCore Observability 集成的 CloudWatch 指标提供了这一能力。没有这种可见性，分布式多 Agent 系统的性能瓶颈和问题根因几乎无法定位。

### 3. 利用 DynamoDB 实现 Persona Table 的跨会话持久化

方案使用 DynamoDB 存储 persona 配置数据，这为 Agent 提供了结构化的持久化存储层。在设计多 Agent 系统时，应提前规划哪些状态需要跨会话持久化（如用户偏好、角色配置），并选择合适的存储后端。DynamoDB 的键值模型适合 Agent 运行时的高频读写模式。

### 4. 设计时应考虑基础设施即代码

该方案使用 AWS SAM 进行基础设施部署，这在团队协作和可重复部署方面是关键实践。对于生产级 Agent 系统，基础设施代码化（SAM、Terraform 等）应该作为初始架构设计的一部分，而非事后补充。这确保了开发、测试、生产环境的一致性。

### 5. 评估容器化与无服务器的权衡

Docker 容器化提供了移植性但引入了冷启动问题。在选择部署架构时，如果 Agent 工作负载具有明显的波峰波谷特性，纯 serverless（Lambda）可能是更好的选择；如果需要更精细的运行时控制或长时运行任务，容器化则更合适。也可以考虑混合策略——核心编排使用容器，工具执行层使用 Lambda。

## 参考来源

## 相关实体
- [构建基于多智能体架构的深度思考交易系统](../ch04-205-构建基于多智能体架构的深度思考交易系统)
- [Anthropic Multi Agent Research System](../ch01-677-anthropic)
- Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session
- [构建基于多智能体架构的深度思考交易系统](../ch04-205-构建基于多智能体架构的深度思考交易系统)
- [Netflix Real Time Service Topology](../ch11-009-from-silos-to-service-topology-why-netflix-built-a-real-tim)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/serverless-langgraph-multi-agent-aws.md)

---

