# Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践

## Ch11.294 Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践

> 📊 Level ⭐⭐ | 3.6KB | `entities/couchbase-capella-iq-multi-model-ai-architecture-bedrock-case-study.md`

# Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践

> **Background**：本文档基于 Couchbase 在 AWS Blog 上发布的 Capella iQ AI Assistant 架构案例，介绍了如何用 Amazon Bedrock 构建多模型、跨 Region 的生产级 AI 推理架构。

Couchbase 的 Capella iQ 是一个 AI-powered 开发者助手，能够生成 SQL++ 查询、推荐索引、支持多轮对话。随着企业采用增长，Couchbase 将其 AI 应用扩展为支持多个 Foundation Model（FM）提供商的**模型无关推理架构**，核心是使用 Amazon Bedrock。

## 架构设计

Capella iQ 的推理架构基于 Amazon EKS 集群部署在 AWS 双 Region（us-east-1, us-west-2）控制平面内：

- **cp-api pod**：主 API 服务，接收开发者请求、编排推理调用
- **cp-internal-api pod**：内部服务通信和模型路由逻辑
- **cp-ns pod**：命名空间级配置管理，包括模型供应商设置和租户级覆盖

请求通过 VPC Interface Endpoint 私有连接到 Bedrock Runtime，流量全程不经过公网。Cross-Region Inference (CRIS) 在 us-east-1/2 和 us-west-2 之间自动实现故障切换和负载分发。

## 模型评估框架

在模型选型前，Couchbase 建立了覆盖所有 Core Capella iQ 工作流的 benchmark 套件，评估维度包括功能正确性、确定性、延迟和格式一致性。Anthropic 的 Claude Sonnet 4.5 基于 BIRD 方法在内部评估中达到约 76% 准确率，被选定为首个生产模型。

## 关键技术决策

- **Provider abstraction**：早期投资于模型供应商抽象层，使 Bedrock 集成不干扰用户体验，长期保持模型切换灵活性
- **CRIS 简化运维**：跨 Region 推理无需预置容量或自定义故障切换逻辑，处理突发流量更高效
- **Multi-model readiness**：生产级多模型支持需要持续投入——benchmarking 基础设施、prompt 工程、可观测性应作为持续性工作流而非一次性建设

## 未来规划

Couchbase 正探索通过 Bedrock Custom Model Import 部署微调的小型模型来优化成本，为高容量、边界明确的工作负载（如索引推荐和查询解释）蒸馏任务专用模型。

## 相关实体

- [Amazon Bedrock 模型推理 Serverless 架构案例](ch11/310-amazon-bedrock.html) — 不同的推理架构（SQS 异步 vs EKS 同步）
- [Amazon Bedrock CRIS 跨 Region 推理](ch11/310-amazon-bedrock.html) — CRIS 在 GDPR 场景的应用
- [AWS Bedrock Multi-Agent Collaboration](ch11/020-aws-bedrock.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/couchbase-capella-iq-multi-model-ai-architecture-bedrock-case-study.md)

---

