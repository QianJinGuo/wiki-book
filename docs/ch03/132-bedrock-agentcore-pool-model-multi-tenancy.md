# Bedrock AgentCore Pool Model Multi-Tenancy

## Ch03.132 Bedrock AgentCore Pool Model Multi-Tenancy

> 📊 Level ⭐⭐ | 3.5KB | `entities/shared-infrastructure-isolated-tenants-pool-model-multi-tenancy-with-amazon-bedrock-agentcore.md`

# Bedrock AgentCore Pool Model Multi-Tenancy

> **Background**：基于 AWS 官方技术博客（2026-06-23），介绍 Amazon Bedrock AgentCore 的多租户架构模式。以医疗 AI 助手为示例，展示 Tier → Tenant → User 三级隔离体系，但模式通用适用于各类 SaaS 多租户 Agent 系统。

## 核心架构：三级层次隔离

```
Tier (服务层级: Basic / Premium)
    │
    ▼
Tenant (租户: Clinic A / Clinic B)
    │
    ▼
User (终端用户: 医生 / 护士)
```

每一层通过 AWS 原生能力强制隔离：
- **知识库文档隔离** — 每个租户只能访问自己的 Knowledge Base 文档
- **Memory 隔离** — 租户间对话记忆完全分离
- **模型访问隔离** — 不同 Tier 可用不同模型
- **成本追踪隔离** — 粒度到租户级别的调用计费

## 池模型 vs 专用模型

| 维度 | 池模型 (Pool) | 专用模型 (Dedicated) |
|------|-------------|-------------------|
| 资源共享 | 共享基础设施 | 每个租户独立资源 |
| 隔离级别 | 逻辑隔离 | 物理隔离 |
| 成本 | 低（分摊） | 高（独占） |
| 适用场景 | 中小租户 | 合规要求高 / 大客户 |
| 弹性 | 高（共享池自动扩缩） | 低（需预分配） |

## 技术实现

**API Gateway + Lambda 路由层**：
- 请求入口经 API Gateway 鉴权
- Lambda 函数根据 tenant_id 路由到对应 AgentCore 资源
- Webhook 加密校验确保请求来源可信

**IAM + ABAC 权限控制**：
- 每个租户的 Agent 运行在独立的 IAM Role 下
- ABAC Session Tags 标记 tenant_id
- 最小权限原则：每个 Agent 只能访问自己的 S3、Knowledge Base

**成本归因**：
- Bedrock 调用日志带 tenant_id 标签
- CloudWatch Metrics 按租户聚合
- 可生成租户级成本报表

## 三个独有贡献（不应合并到现有 entity）

1. **Tier → Tenant → User 三级隔离体系** — 完整的 AI Agent 多租户分层模型，涵盖知识库、记忆、模型、成本四维度隔离
2. **Pool 模型共享基础设施** — 逻辑隔离而非物理隔离，在安全性和成本之间取得平衡
3. **医疗 AI 领域的多租户实践** — 具体的行业落地案例，展示了合规场景下的多租户设计

## GitHub 仓库

- 示例代码：https://github.com/aws-samples/sample-agentcore-and-multitenancy-blog
- 系列第 1 篇：设计考虑因素和框架（Part 1）

## 部署要求

- AWS 账户 + Bedrock 权限
- CDK 部署
- Advanced (300) 级别内容

## 相关主题

- [Protein Research Copilot](../ch04/528-amazon-bedrock-agentcore.html) — 同系列文章，聚焦 AgentCore 的单租户 Agent 应用
- Amazon Bedrock AgentCore — AWS Agent 部署平台
- AI Agent 多租户架构 — SaaS 场景下的 Agent 隔离设计
- Healthcare AI — 医疗 AI 应用场景

---

