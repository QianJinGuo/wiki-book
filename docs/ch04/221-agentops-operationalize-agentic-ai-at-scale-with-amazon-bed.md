# AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore

## Ch04.221 AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 10.6KB | `entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md`

# AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore

AWS 发布的 AgentOps 参考架构，将 Agent 运维拆解为四大支柱（治理与安全、构建与运维、评估、可观测性），并以 Amazon Bedrock AgentCore 为平台实现端到端落地。这是目前公有云厂商对 Agentic AI 生产化最系统的工程实践方案。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)

## 摘要

AgentOps 是 GenAIOps 在 Agentic AI 领域的自然延伸。与传统的 MLOps/DevOps 不同，Agent 的非确定性决策、跨 Agent 调用链、以及工具与记忆的动态组合，使得运维复杂度呈指数级增长。AWS 基于 Bedrock AgentCore 提出了四支柱参考架构，覆盖从用例注册到生产监控的全生命周期。核心观点：**Agent 的运维不是一个技术问题，而是一个组织+流程+技术的系统工程问题。**

## 核心要点

### 四大支柱

1. **治理与安全（Governance & Security）**：多账号隔离、确定性策略控制（Cedar 策略语言）、Agent 身份继承、记忆命名空间隔离。核心洞察——Agent A 调用 Agent B 时，权限边界模糊是系统性风险源。
2. **构建与运维（Build & Operations）**：将 Agent、工具、记忆配置全部视为版本化、可部署的制品（artifact），每个组件拥有独立仓库和 CI/CD 流水线。AgentCore Runtime 支持不可变版本和端点别名实现独立推广和即时回滚。
3. **评估（Evaluation）**：四层评估体系——工具级（Span）、对话轮次级（Trace）、会话结果级（Session Outcome）、系统级（System）。两种运行模式：按需评估（开发/预发布门控）和在线评估（生产持续采样）。
4. **可观测性（Observability）**：四层遥测——Agent/框架层、服务层（AgentCore Memory/Gateway/Identity 内部操作）、基础设施层、应用层。基于 OpenTelemetry 标准，支持 W3C Trace Context 跨 Agent 传播。

### AgentOps 生命周期

AWS 将 AgentDevOps 映射到传统 DevOps 的六个阶段：Plan → Develop → Build → Test & Release → Deploy → Maintain & Monitor。每个阶段都有 Agent 特有的考量：

- **Plan**：定义人类监督点、工具权限、Agent 信任模型、跨 Agent 认证
- **Develop**：MCP 工具注册、Agent-to-Agent (A2A) 协议、记忆策略选择
- **Build**：工作流测试、工具链验证、RBAC 校验
- **Test**：执行路径端到端评估、循环限制测试、HITL（人在回路）测试
- **Deploy**：MCP 服务器部署、最小权限配置、金丝雀发布
- **Monitor**：漂移检测、行动审计、异常检测、Guardrails 端到端调用

### 关键架构决策

- **多账号架构**：共享服务账号（ECR/Secrets Manager/监控）+ 数据账号（生产者/治理隔离）+ 应用账号（dev/pre-prod/prod 按业务线划分），全部通过 IaC 管理。
- **AI 网关定位**：最初放在共享服务账号，后发现难以按 Agent 归因成本，移至应用账号。这体现了"先跑起来再优化归属"的务实思路。
- **记忆（Memory）分离**：数据（知识库/数据库/API）vs 记忆（Agent 工作上下文/用户偏好/交互模式）。AgentCore Memory 按 actor 级隔离，需要跨用户学习时可聚合到应用级别。多账号部署时每个账号有独立 Memory 资源。
- **工具治理**：AgentCore Gateway 将 API/Lambda/服务统一转换为 MCP 兼容工具。Identity 管理入站认证（验证 Agent 身份）和出站认证（OAuth/token 刷新/凭证存储），Agent 不直接处理凭证。Cedar 策略拦截工具请求，实现确定性访问控制。

### 评估四层模型的工程价值

| 评估层 | 关注点 | 典型指标 |
|--------|--------|---------|
| 工具级 (Span) | 工具本身可靠性 + Agent 对工具的使用质量 | 工具选择准确率、参数提取准确率、延迟/错误率 |
| 对话轮次级 (Trace) | 单轮输入输出质量 | 正确性、有用性、忠实度、有害性 |
| 会话结果级 (Session) | 全对话是否达成用户目标 | 任务完成率、目标准确度、对话效率、记忆一致性 |
| 系统级 | 生产就绪度 | 端到端延迟、TTFT、吞吐量、循环检测、单任务成本 |

**关键洞察**：正确的单轮回复不保证成功的会话结果——这解释了为什么仅靠单元测试/基准测试无法保证 Agent 质量。

## 深度分析

### 1. AgentOps 是 GenAIOps 的范式升级，而非简单延伸

GenAIOps 解决的是"模型推理 + RAG + Prompt"的运维问题，核心变量是模型版本和 Prompt 版本。AgentOps 引入了三个新的维度：**工具依赖**（Agent 调用的工具由其他团队维护，可能独立变更）、**记忆状态**（跨会话的持久化上下文，配置错误可能导致用户上下文泄露）、**多 Agent 协作**（A 调 B 调 C 的链式调用，每一跳都需要身份传播和权限校验）。这三个维度的组合爆炸是 AgentOps 复杂度的根本来源。

### 2. 确定性策略 + 非确定性执行的二元治理

Agent 本质上是非确定性系统，但治理要求确定性。AWS 的解法是**将确定性边界外推到工具调用层**——Agent 的推理过程可以非确定，但工具调用必须经过 Cedar 策略引擎的确定性校验。这种"内层自由、外层受控"的思路，与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的核心理念高度一致：先建 Harness（确定性外壳），再放 Agent（非确定性内核）。

### 3. 记忆的账号级隔离是安全刚需，也是运维负担

AgentCore Memory 按 actor 级隔离数据，多账号部署时每个账号独立管理 Memory 资源。这解决了跨业务线的数据泄露风险，但也意味着：跨账号共享记忆需要额外的 IAM 策略配置，记忆的版本化和 CI/CD 推广变得更加复杂。文章特别强调"将记忆配置视为版本化制品"，这暗示记忆 schema 的变更可能比代码变更更危险——因为记忆中承载了真实用户数据。

### 4. 评估门控从"发布前快照"变为"持续质量流"

传统 CI/CD 的评估是发布前的一道门，Agent 的评估必须是持续的质量流：开发环境按需评估 → 预发布环境门控评估 → 生产环境在线采样评估。质量下降时自动回滚或人工介入。这个"评估无处不在"的模式，与 SRE 的 SLO 思路一致——不是"确保系统正确"，而是"持续检测系统何时变得不正确"。

### 5. OpenTelemetry 作为 Agent 可观测性的统一协议

四层遥测（框架/服务/基础设施/应用）的统一出口是 OpenTelemetry。这不是技术选择，而是生态选择——OTEL 的 W3C Trace Context 让跨框架、跨 Agent、跨服务的追踪成为可能。AgentCore Runtime 自动注入 OTEL 环境变量，应用只需添加 SDK 依赖。这个"开箱即用"的设计大幅降低了可观测性的接入成本。

## 实践启示

1. **先建治理边界，再部署 Agent**：从 Pillar 1 开始实施——多账号隔离、SCP 策略、Guardrails 配置。没有治理边界的 Agent 部署，等于在生产环境中运行未经审计的自动化脚本。
2. **将每个组件视为独立制品**：Agent 代码、工具代码、记忆配置、IaC 模板分别仓库、分别版本、分别 CI/CD。避免"大仓库"模式——工具变更不应阻塞 Agent 发布，反之亦然。
3. **评估从工具级开始，逐层向上**：不要跳过工具级评估直接做会话级。工具选择准确率低，会话级评估毫无意义。先用确定性测试（单元测试/API 测试）覆盖工具可靠性，再用 LLM-as-Judge 覆盖对话质量。
4. **在线评估是生产 Agent 的必选项**：按需评估只能发现已知问题，在线评估才能发现未知退化。设置采样率、配置 CloudWatch 告警、建立人工审查队列——这三个动作是 Agent 上线的最低可观测性要求。
5. **成本归属从第一天开始设计**：AI 网关最初放在共享服务账号，后发现无法按 Agent 归因成本。Tag 每个 Agent（owner/cost-center/use-case-id），从第一个部署就建立成本追踪习惯。

### 相关实体

- [你不知道的 Agent原理架构与工程实践 V2](ch03/044-agent.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [Youre Building Agent Security In The Wrong Order](ch03/044-agent.md)
- [Tencentdb Agent Memory Context Offloading](ch03/044-agent.md)- [aws bedrock agentcore equipment repair assistant — 农业机械 ai 诊](ch04/150-ai.md)
- [what it feels like to work with mythos](ch01/626-what-it-feels-like-to-work-with-mythos.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

