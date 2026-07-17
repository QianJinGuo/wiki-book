# Bedrock AgentCore 多租户 Agent 构建实践

## Ch03.069 Bedrock AgentCore 多租户 Agent 构建实践

> 📊 Level ⭐⭐ | 12.3KB | `entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md`

## 核心要点

- 技术主题：Bedrock Agentic AI 应用实践
- 平台：AWS Bedrock
- 来源：AWS Machine Learning Blog

## 概述

Amazon Bedrock AgentCore 是 AWS 提供的托管式无服务器服务，用于构建、部署和安全运营 Agentic 应用。该服务提供了一系列构造块，包括 Agent 部署、MCP 服务器托管、身份管理、Memory、Observability 和评估功能，专为多租户 Agent 架构设计。

多租户 Agentic 应用面临十大架构挑战：隔离策略选择、运行时部署模式、模型选择、工作流模式、RAG 数据隔离、身份与令牌传播、MCP 工具访问控制、Memory 层级命名空间隔离、Agent 身份信任体系、以及成本追踪与可观测性。

## 十组件框架详解

### 1. Agent 运行时部署：专用 vs 共享

专用运行时为每个租户实例化独立执行环境（独立容器镜像、进程空间和生命周期），提供最强的 noisy-neighbor 防护。共享运行时在相同容器内服务所有租户，降低基础设施成本但需要严格的进程内租户上下文传播。

AgentCore Runtime 通过会话隔离的 microVM 计算解决这一矛盾——每个会话拥有独立的持久文件系统，agents 可在其中读写会话作用域的文件、维护中间计算产物、跨多步交互保持状态。

### 2. 模型策略：共享 / 分层 / 微调

共享基础模型适合大多数多租户部署，简化运营但缺少个性化。分层模型策略允许按租户层级选择不同模型，平衡成本与性能。租户专属微调模型适用于有特殊术语、合规要求或 SLA 的场景，但运营复杂度显著增加。

### 3. 工作流：Silo、Pool、Bridge 三模式

- **Silo 模式**：完整租户隔离，每个租户的完整工作流嵌入独立 Agent Skills，最大化定制但维护成本高
- **Pool 模式**：共享 Agent Skills，运营效率高但定制能力有限
- **Bridge 模式**：共享基础设施工作流（认证、日志、错误处理），在运行时调用租户专属 Skills，兼顾可复用性与定制化

### 4. 多租户 RAG

Silo 模式为每个租户配置独立向量数据库，适合受监管行业。Pool 模式使用共享向量库，通过元数据过滤实现租户隔离，成本效率高但需额外防护措施（自动租户过滤器注入、结果脱敏）。

### 5. 租户上下文与 Act-on-Behalf 模式

AI Agent 具有非确定性，与传统确定性 API 不同。Rogue 或被攻击的 Agent 可能向下游服务发起未授权调用，导致凭据窃取和权限提升。Act-on-Behalf（委托）模式是推荐方案，在每个服务边界转换令牌，使用范围受限的凭据和 act claim（RFC 8693）标识 Agent。

### 6. MCP 工具与 API 细粒度访问控制

三层防护体系：授权层通过策略评估租户上下文（配额、分层权限、使用限制）；调用层 MCP 服务器在工具可用性上过滤租户；数据访问层通过 ABAC 策略（基于 JWT claims）实施行级安全。

### 7. Memory 层级命名空间隔离

五层逻辑结构：Global（跨租户共享知识）→ Strategy（Agent 类型特定模式）→ Tenant（租户级对话历史）→ User（用户级上下文）→ Session（临时短时记忆）。Pool 模式使用共享基础设施配合层级命名空间逻辑隔离；Silo 模式为每个租户部署专属 Memory 存储。

### 8. Agent 身份、信任与发现

- **Agent Identity**：通过 AgentCore Identity 实现工作负载身份，锚定于组织 AWS 账户和 IAM 基础设施，支持 Okta、Microsoft Entra ID、Cognito 等身份提供商集成
- **Agent Trust**：ANS v2（IETF Internet-Draft）通过 DNS 域名锚定 Agent 身份，提供 Bronze/Silver/Gold 三级验证
- **Agent Discovery**：AWS Agent Registry 提供中心化目录，通过自然语言或结构化搜索发现 Agent、Skills、MCP 服务器

### 9. 成本追踪与可观测性

应用级检测发出租户标记指标，捕获 I/O tokens、工具调用和执行时长。AgentCore Observability 提供 OpenTelemetry 兼容集成，基于 CloudWatch 提供 Agent 执行各步骤的详细可视化。

### 10. Guardrails 内容安全

三层执行点：预处理输入 Guardrails 验证用户输入、阻止恶意 prompt 和 prompt 注入、依据 HIPAA/PCI-DSS 等合规要求清理 PII；后处理输出 Guardrails 验证响应准确性、检测幻觉、确认格式合规、扫描跨租户敏感数据泄露。

## 三种部署模型

### Silo 模型

每个租户拥有完全隔离的完整栈：独立 AgentCore Runtime、Gateway、Memory，全部置于独立 IAM 边界之后。请求流程为：身份提供商认证 → SaaS 应用代理基于租户上下文路由 → AgentCore Runtime 验证 JWT 并创建隔离 microVM 会话 → 专用 Gateway 访问 MCP 工具 → 响应流回。

Trade-off：运营开销高（每个客户运行专用资源），但对安全敏感和合规严格的工作流，潜在影响范围受限使其成为正确选择。

### Pool 模型

多租户共享资源，最大化资源利用率。请求流程类似，区别在于 AgentCore Runtime 通过命名空间分区（如 `actor_id: "tenant-a:user-123"`）访问 Tenant-scoped Memory。

Trade-off：运营效率高，可能是有大量小租户时的唯一选项，但需要更严格的细粒度访问控制测试和更完善成本归属检测。

### Bridge 模型

混合模式，根据需要灵活组合：
1. 高级租户用 Silo Runtime/Gateway/Tools/Memory，标准租户用 Pool
2. Silo Runtime + Pool Gateway/Tools/Memory
3. 其他自定义组合

示例：SOC 分析场景中，Gateway 可设为 Silo 以处理邮件 API 交互和下游租户资源，而 Pool Agent Runtime 托管 Agent 执行推理——因为每次调查运行在独立隔离的 microVM 中。

## 深度分析

### 架构选择的核心矛盾

多租户 Agent 架构的本质矛盾在于**隔离强度与运营效率的零和博弈**。Silo 模式提供最强隔离但成本随租户数线性增长；Pool 模式最优成本效率但隔离边界模糊；Bridge 模式试图在中间找到平衡但增加架构复杂度。这与传统的多租户 SaaS 架构挑战一脉相承，但 AI Agent 的非确定性引入了一个新维度——Agent 可能在执行过程中自主决定调用哪些工具、以什么参数调用，这意味着隔离边界不仅要在请求层面划定，还需要在运行时决策层面建立防护。

### AgentCore 的差异化价值

与自建 Agent 基础设施相比，AgentCore 的核心价值在于**将多租户复杂性下沉到托管服务层**：microVM 级别的会话隔离、内置的 JWT 租户上下文传播、层级 Memory 命名空间、AgentCore Identity 的 On-behalf-of Token Exchange、基于 Cedar 的自然语言策略编写。这些能力如果自建，需要投入大量工程资源且难以保证安全性。AgentCore 的局限在于锁定 AWS 生态，对于已有强 AWS 投入的团队这是加分项，但对于追求云中立性的组织可能是约束。

### 安全模型的演进意义

文章详细阐述的 Act-on-Behalf 模式具有深远的安全架构意义。传统的 Impersonation 模式（Agent 完全使用用户身份和权限）在 AI Agent 场景下风险极高——一个被攻击的 Agent 可以横向移动到用户所有有权限访问的系统。而 Act-on-Behalf 通过在每个服务边界重新签发范围受限的令牌，引入了真正的**纵深防御**机制。Agent 身份（act claim）与原始用户身份同时存在于令牌中，使得资源服务器能够在每个调用 hop 执行零信任授权。这代表了 AI Agent 安全从"边界防护"向"持续验证"的范式转变。

### 成本归因的技术债务

多租户成本追踪是文章中相对薄弱的一环——主要依赖应用层 instrumentation 和指标发射，尚未看到与 AWS Cost Explorer 的深度集成。对于追求 FinOps 的团队，这意味着需要在 AgentCore 之上构建额外的成本归属层，特别是当 Pool 模式下多个租户共享底层资源时，精确的成本拆分面临挑战。这也是多租户 Serverless 架构的共性难题——资源粒度与计费粒度的不匹配。

## 实践启示

### 架构选型决策树

1. **合规驱动**：如果服务于金融、医疗等受监管行业，优先考虑 Silo 模式，数据隔离的合规价值远超运营成本
2. **规模驱动**：租户数量大但单体价值低（如 SMB 客户）时，Pool 模式是必然选择，需投入工程资源构建扎实的访问控制层
3. **分层服务**：大多数场景适合 Bridge 模式——对高价值/高合规要求客户提供 Silo，对标准客户提供 Pool，AgentCore 的架构设计天然支持这种分层策略

### 从概念验证到生产的关键检查点

- **隔离验证**：不仅验证功能隔离，还要验证故障隔离——一个租户的 Agent 异常不能影响其他租户
- **Token 生命周期**：确认 JWT 过期后 Agent 行为符合预期，特别是长时间运行的 Agent 会话
- **成本监控**：在 Pool 模式下建立细粒度成本归属基线，异常高的租户资源消耗需要告警
- **Guardrails 测试**：针对每个租户层级定制不同的内容安全策略，并进行红队测试

### 技术债务预警

- **Pool 模式的访问控制**：命名空间前缀注入依赖开发者纪律，需要代码审查确保所有 Memory 操作都携带正确前缀
- **Bridge 模式的状态管理**：混合模式下，Agent 状态可能在 Silo 和 Pool 组件间不一致，需要显式设计状态同步机制
- **Model 版本漂移**：共享模型升级可能导致 Agent 行为变化，在 Pool 模式下这种变化会同时影响所有租户，需要建立 A/B 测试机制

### 未来演进方向

随着 ANS v2 等 Agent Trust 标准成熟，多租户 Agent 架构将面临新的设计考量：当外部 Agent 可以跨组织边界发现和交互时，租户边界的定义将从"数据隔离"扩展到"身份和信任隔离"。AWS Agent Registry 目前解决了组织内部发现，但跨组织发现和信任建立仍是待解决问题。

## 相关实体
- [Building Ai Agents For Business Support Using Amazon Bedrock](../ch04/074-building-ai-agents-for-business-support-using-amazon-bedrock.html)
- [Break The Context Window Barrier With Amazon Bedrock Agentcore](../ch04/530-amazon-bedrock-agentcore.html)
- [Secure Ai Agents Policy Lambda Interceptors Aws](../ch04/030-ai-agent.html)
- [Control Where Your Ai Agents Can Browse With Chrome Enterprise Policies On Amazo](../ch11/131-control-where-your-ai-agents-can-browse-with-chrome-enterpri.html)
- [Build Ai Agents For Business Intelligence With Amazon Bedrock Agentcore](../ch04/530-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md)

---

