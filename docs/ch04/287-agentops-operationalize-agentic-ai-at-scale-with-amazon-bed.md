# AgentOps: Operationalize agentic AI at scale with Amazon Bedrock

## Ch04.287 AgentOps: Operationalize agentic AI at scale with Amazon Bedrock

> 📊 Level ⭐⭐ | 9.1KB | `entities/agentops-operationalize-agentic-ai-amazon-bedrock.md`

# AgentOps: Operationalize agentic AI at scale with Amazon Bedrock

## Conclusion

Building production-grade agentic AI is hard. Agents make autonomous decisions, call external tools, and collaborate in ways that are difficult to anticipate and harder to debug. In this post, we have shared the practices we have seen work in production across the four pillars: governance and security, build and operations, evaluation, and observability.

We encourage you to start applying these practices in your projects and share your experiences. Start by implementing Pillar 1 (Governance & Security), multi-account isolation, then progress to CI/CD for agents, add evaluation gates, and observability. Check out the [AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/>) to get started.

* * *

## About the authors

### Anastasia Tzeveleka

Anastasia Tzeveleka is a Principal Generative AI/ML Specialist Solutions Architect at AWS. Her experience spans the entire AI lifecycle, from collaborating with organizations training cutting-edge Large Language Models (LLMs) to guiding enterprises in deploying and scaling agentic AI applications powered by these models.

### Anna Grüebler Clark

Anna Grüebler Clark is a Senior Specialist Solutions Architect at AWS focusing on Artificial Intelligence and generative and agentic AI. She has more than 16 years experience helping customers develop and deploy machine learning applications. Her passion is taking new technologies and putting them in the hands of everyone, and solving diﬃcult problems leveraging the advantages of using traditional, generative and agentic AI in the cloud.

### Antonio Rodriguez

Antonio Rodriguez is a Principal Generative AI Specialist Solutions Architect at Amazon Web Services. He helps companies of all sizes solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. Apart from work, he loves to spend time with his family and play sports with his friends.

### Sergio Garces Vitale

Sergio Garces Vitale is a Senior Solutions Architect at AWS, specialized in generative AI. With over 10 years of experience in the telecommunications industry, where he helped build data and observability platforms. Over the past 5 years, Sergio has been focused on guiding customers in their cloud adoption and designing AI solutions, from traditional ML to generative and agentic AI, that deliver real business impact.

### Aris Tsakpinis

Aris Tsakpinis is a Senior Specialist Solutions Architect for Generative AI focusing on open source models on Amazon Bedrock and the broader generative AI open source ecosystem. Alongside his professional role, he is pursuing a PhD in Machine Learning Engineering at the University of Regensburg, where his research focuses on applied natural language processing in scientific domains.

## 深度分析

### 1. AgentOps 是 MLOps/DevOps 的自然演进，而非全新范式

文章开篇即明确指出"AgentOps is an extension of GenAIOps, the same way MLOps is an extension of DevOps"。这意味着企业在落地 AgentOps 时，不应从零开始构建运维体系，而应在现有 MLOps 基础上平滑演进。AWS 建议的分阶段路径是：先实现 Pillar 1（多账户隔离 + 治理），再逐步引入 CI/CD、评估门禁和可观测性。这种渐进式采纳路径降低了迁移成本，同时也解释了为什么许多 already invested in MLOps 的团队更容易接受 AgentOps 概念。

### 2. 四层评估体系是防止"隐形失败"的关键机制

文章指出了 AgentOps 与传统 ML 评估最核心的差异：agentic workflows 的评估必须覆盖工具选择准确性、对话轮次质量、会话结果达成度以及系统级运维指标四个维度。这是因为单个正确的响应不能保证整体任务成功——一个错误的工具选择或上下文遗漏可能在多轮交互中被放大，最终导致会话级失败。更重要的是，文章强调在预生产环境必须通过评估门禁才能晋升到生产环境，而生产环境则通过在线评估持续监控，形成"评估即质量门禁"的闭环。

### 3. 可观测性四层模型填补了框架级盲区

文章将可观测性分为 Agent & framework telemetry、Service telemetry、Infrastructure telemetry 和 Application telemetry 四层。这里最关键的洞见是：很多团队只在框架层做埋点，但 AgentCore 的服务操作（memory reads/writes、gateway 路由、identity 策略评估）发生在框架之外，对这些服务操作的监控同样不可或缺。W3C Trace Context 传播机制使得跨 agent 和跨框架的请求能够共享 trace ID，形成完整的调用链视图，这对于调试多 agent 协作问题至关重要。

### 4. Memory 的多账户部署模式是数据隔离的关键保障

文章揭示了 AgentCore Memory 的 namespace 机制与多账户架构的深度关联：在 dev/pre-prod/prod 每个账户独立部署 Memory 资源，支持数据主权、成本归属、独立扩展和安全隔离。这解决了 agentic 应用中一个常见陷阱——memory misconfiguration 可能无意间泄露用户上下文。将 memory 作为独立的 versioned artifact 通过 CI/CD 部署，配合 IAM 策略控制访问，是防止此类风险的工程化解法。

### 5. 工具治理必须与身份认证解耦

文章明确了 AgentCore Gateway 的双重职责：管理 inbound authentication（验证 agent 身份）和 outbound authentication（连接工具时的 OAuth、token refresh、凭证存储）。这里的核心设计原则是"agents should not handle credentials directly"——将凭证管理责任下沉到 Gateway 层，而 AgentCore Identity 回答"你是谁"和"你能访问哪些基础设施"，Policy (Cedar) 回答"此刻你被允许执行此操作吗"。这种分层设计使得即使在复杂的 agent-to-agent 调用链中，安全边界也能被清晰维护。

## 实践启示

### 1. 从多账户架构起步，按 pillar 渐进落地

不要试图同时实现所有四个 pillar。正确的起点是：在 AWS Organization 中建立多账户结构（shared services / data accounts / application accounts），通过 SCPs 设置安全 guardrails。在此基础上，先用 IaC 声明式管理所有资源，再逐步引入 agent CI/CD、评估门禁和可观测性。这种"先治理后工程"的顺序，避免了组织在 agent 能力快速扩张时面临无法追溯的安全盲区。

### 2. 将 agent、tool、memory 配置视为独立部署单元

每个组件应有独立版本、独立测试、独立晋升通道。具体实践：建立四类仓库（infrastructure / agent / tool / application），每个仓库有独立的 CI/CD pipeline。在 pre-prod 阶段，七类测试（integration / performance / UAT / regression / security / agentic AI / responsible AI）必须全部通过才能晋升。Memory 配置的 TTL、extraction strategy 和 namespace 结构都应通过 CI/CD 管理，防止手工配置漂移。

### 3. 构建四级评估体系并嵌入 CI/CD 作为质量门禁

在本地开发阶段用 on-demand evaluation 快速迭代；在 pre-prod 阶段让 CI/CD pipeline 触发完整的回归测试和 agentic AI 评估；在生产阶段用 online evaluation 持续采样监控。一旦检测到质量下降，结果应直接进入人工审核队列或触发自动化回滚。评估不应只是"通过/不通过"的二元判断，而应持续追踪指标趋势，在用户受影响前提前告警。

### 4. 实施四层可观测性，用 OpenTelemetry 统一埋点

在所有 agent 实现中加入 OpenTelemetry SDK（Python agents 可用 `opentelemetry-instrument` 自动埋点）。通过 ADOT Collector 采集 traces/metrics/logs，经 OTLP 协议发送。跨 agent 请求使用 W3C Trace Context 传播共享 trace ID，跨服务边界的 session ID 使用 OpenTelemetry Baggage。这种标准化埋点使得无论 agent 运行在多少个不同框架或账户中，都能通过统一的 trace 视图进行端到端调试。

### 5. 用 AgentCore Identity + Gateway 构建零信任工具访问控制

在 AgentCore Gateway 中配置 Cedar 策略引擎，拦截所有工具调用请求进行策略评估。每个工具通过 manifest 声明其归属（shared 或 application-specific）、认证方式和合规元数据，由 CI/CD pipeline 在 merge 时完成注册和验证。这种机制确保：即使攻击者通过 agent manipulation 尝试绕过，Policy 层仍会在 tool invocation 层面拒绝未授权操作，实现"纵深防御"。

## 相关实体
- [Amazon Bedrock Agentic Payments Guardrails](../ch11/152-amazon-bedrock.html)
- [Break The Context Window Barrier With Amazon Bedrock Agentcore](ch04/501-amazon-bedrock-agentcore.html)
- [Secure Ai Agents Policy Lambda Interceptors Aws](ch04/147-ai-agent.html)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](ch04/501-amazon-bedrock-agentcore.html)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](ch04/362-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)

---

