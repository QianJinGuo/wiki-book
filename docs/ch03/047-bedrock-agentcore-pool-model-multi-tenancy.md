# Bedrock AgentCore Pool Model Multi-Tenancy

> 📊 Level ⭐⭐⭐⭐ | 14.0KB

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

- [Protein Research Copilot](https://github.com/QianJinGuo/wiki-public/blob/main/entities/protein-research-copilot-amazon-bedrock-agentcore.md) — 同系列文章，聚焦 AgentCore 的单租户 Agent 应用
- Amazon Bedrock AgentCore — AWS Agent 部署平台
- AI Agent 多租户架构 — SaaS 场景下的 Agent 隔离设计
- Healthcare AI — 医疗 AI 应用场景

## 深度分析

1. **隔离是分层属性，但真正兜底的不是计算层**

   AgentCore Runtime 为每个 session 提供隔离的 micro-VM，这给的是**会话级**计算隔离——它保证同一 Runtime 上的并发会话互不干扰，同时决定冷启动与资源复用的形状。但池模型的租户边界并不由这个 micro-VM 承载：同一个 tier 的所有租户跑在同一份 Runtime 配置下，镜像、网络策略、扩缩容行为完全一致。真正的租户边界落在数据平面——Knowledge Base 检索时的 `clinic_id` metadata filter、构造自 JWT 声明的 S3 prefix（作为 `X-S3-Prefix` 头透传）、DynamoDB 的 `dynamodb:LeadingKeys` 条件、以及带 session tag 的 TVM 临时凭证。把这两层混为一谈是最典型的设计误判：micro-VM 解决"会话之间不串"，数据平面凭证解决"租户之间不串"。前者失效会表现为噪声或超时（显性、可观测），后者失效是静默的——多返回一份病历不会报错，只会泄露。

2. **计算隔离买的是成本与延迟，数据隔离买的才是安全**

   这个区分决定了投入优先级。为每个租户单独部署 Runtime 或独立 micro-VM 池，能改善的是冷启动尾部、故障半径与配额隔离——都是成本/延迟维度的收益；它**不能**替代 KB 作用域与 IAM 策略，因为文档检索与工具调用的越权并不发生在计算层。反过来说，即使租户共享同一份 Runtime，只要数据平面凭证严格按 tenant 派生，隔离在安全意义上依然成立——这正是"共享基础设施、隔离租户"能够成立的前提，也是 Pool 模型不是"为省钱而牺牲安全"的原因。

3. **Pool vs Dedicated 是一条权衡曲线，而非二选一**

   池化的收益来自三处共享：推理配额、Runtime 常驻池、运维面。代价同样有三处：**噪声邻居**（同 tier 内某租户的突发流量会挤占共享模型配额，而 API Gateway 的 usage plan 只约束入口速率与日配额，并不保护后端模型吞吐）、**故障半径**（一次 tier 级配置或策略变更影响该 tier 全部租户，而专用模型下只影响一家）、以及**出口成本**（从池迁到专用的迁移工作没有平台原语支持，需要手工重建专属 Runtime、KB 与 IAM 边界）。因此池模型适合中小租户，而合规要求高或体量大的租户最终会被推向专用——决策点不是"哪个更安全"，而是"哪个租户的哪条约束先被触发"（数据驻留、独占配额、专属模型、审计要求）。

4. **分层隔离的真正考点是"哪一层是硬边界"**

   文章刻意区分了两种性质的边界。KB 的 metadata filter 与命名空间前缀属于**软边界**：它们依赖调用方正确传入 scope，写错或漏传时结果是"多取数据"，失败静默。IAM 的 `LeadingKeys` 条件、TVM 角色的 trust policy 条件（强制三个 session tag 存在）、以及 Gateway 上的 Cedar 策略属于**硬边界**：scope 不匹配时调用被显式拒绝。Cedar 的价值正在于此——tier 差异化（如 Basic 仅在 8:00–18:00 可调 `patient_context`）从应用代码挪到了声明式策略，在 Lambda 执行之前就完成裁决。推论是：任何只有应用层过滤、没有策略层强制的租户边界，都应该被视为尚未实现。

5. **平台原语替你回答了哪些问题，哪些仍是运维方的责任**

   AgentCore 承接的租户关注点边界清晰：Runtime 负责会话级执行隔离、Memory 提供命名空间结构并配合 ABAC、Identity 在 Runtime 与 Gateway 两个边界校验同一个 Cognito ID token、Gateway 负责 MCP 工具化与 tenant header 的受信传播、Observability 用 OTel baggage 把 tier/clinic_id/actor_id 贯穿全链路。**未**被承接的是：身份到资源命名的映射约定（`actor_id = f"{tier}-{clinic_id}-{user_id}"` 这类复合键）、IAM 与 Cedar 策略本身的正确性、KB 文档元数据标注的完整性（filter 的可靠性等于元数据质量）、TVM 信任策略的收口，以及成本归因模型。平台提供机制，运维方提供映射；绝大多数跨租户事故出在映射而非机制。

## 实践启示

1. **把租户上下文收敛到单一事实来源，并为每条跨边界调用写越权测试**

   tier / clinic_id / role 只从 Cognito ID token 的自定义声明派生，下游一律不得从请求体、工具参数或模型输出中取 tenant id。配套的验收方式是自动化测试而非代码评审：以租户 A 的身份发起检索与工具调用，断言租户 B 的数据命中数为 0——KB 检索、DynamoDB、Memory 命名空间各一条。这样能把"静默泄露"这一最危险的失效模式转成 CI 上的红灯。

2. **数据隔离优先落在 IAM 与策略层，应用层过滤只作纵深防御**

   最小可用组合：S3 prefix（由 JWT 派生，经 Gateway header 受信传播）+ KB metadata filter + `dynamodb:LeadingKeys` 条件 + Cedar 策略。TVM 角色的 trust policy 必须用 Condition 强制三个 session tag 存在（`aws:RequestTag/Tier|ClinicId|UserId: "?*"`），并限制只有 Runtime 执行角色可 assume，否则凭证铸造环节就是旁路。上线前做一次反向自检：用错误租户的 tag 直接 `assume_role`，确认被拒；再确认 Gateway 的目标 Lambda 不接收用户 JWT，只读取经 Gateway 校验后的受信 header。

3. **池内配额必须自己设计，入口限流不等于后端保护**

   API Gateway usage plan 管的是每分钟速率与每日请求数（示例中 Basic 2 rps / 50 每日，Premium 10 rps / 500 每日），它无法阻止一个租户用长上下文请求吃满共享模型配额。建议在 token 维度再加一层：从结构化 usage 日志按 tenant 聚合 token 消耗，设定 per-tenant 预算，超预算时明确降级（切小模型、排队并告知，或返回可重试的 429），而不是让邻居的请求静默排队到超时。降级语义要写进 API 契约，否则前端会把池内争抢误判为服务故障。

4. **成本归因按两级建成，并在上线前验证标签真的生效**

   tier 级用 Bedrock Project + cost allocation tag（注意两个硬约束：每账户 1,000 个 project 上限，标签最长约 24 小时才在账单中生效），clinic 级用结构化 usage 日志（input/output token + clinic_id + model_id）。运营上必须留一个校验步骤：用 Cost Explorer 与 Logs Insights 交叉核对一段时间窗，确认没有调用落进"未归属"桶；一旦 tag 未传播或 project 未配置，成本会静默归入默认账户视图，等到出报表时已无法回溯。

5. **为 demo 之外的租户生命周期预留设计空间**

   示例代码覆盖了隔离机制，但生产化至少要补四件事：**onboarding/offboarding 自动化**（建桶与前缀、KB 元数据模板、ABAC 条件、usage plan，以及离场时的级联删除与审计留存）；**池→专用的迁出路径**（合规客户迟早要求独占，需提前定义专属 Runtime/KB/IAM 的落地方式，避免迁移变成重写）；**per-tenant 观测与告警**（确认 OTel baggage 在异步与工具调用路径上不丢失，否则观测会静默退化为无归属数据）；**明确的配额与降级契约**。此外，医疗这类受监管场景下，池模型意味着"共享基础设施"需要在合同与技术两侧同时证明 PHI 的逻辑边界——不能默认"每个会话有独立 micro-VM"就等于满足了合规。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

