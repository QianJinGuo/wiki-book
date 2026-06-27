# Amazon Bedrock Cross-Region Inference (CRIS): EU Data Residency and GDPR Compliance

## Ch11.046 Amazon Bedrock Cross-Region Inference (CRIS): EU Data Residency and GDPR Compliance

> 📊 Level ⭐⭐ | 13.2KB | `entities/amazon-bedrock-cross-region-inference-cris-eu-gdpr.md`

# Amazon Bedrock Cross-Region Inference (CRIS): EU Data Residency and GDPR Compliance

> 本文综合提炼自 AWS 关于 Amazon Bedrock 跨区域推理（CRIS）的欧洲合规指南。核心：**Inference Profile** 抽象 region 路由，**Global CRIS** 跨所有商业 region（最高吞吐/折扣价）vs **EU Geo CRIS** 严格约束在 EU region 内（满足 GDPR 数据驻留）。**安全性**：AWS backbone 加密传输、IAM 显式选择 CRIS profile、CloudTrail + Model Invocation Logging 审计。

## 核心概念

### 3 个关键概念

- **Source Region** — API 请求发起的 region（应用部署位置）
- **Destination Region** — Bedrock 实际路由到的 region（模型推理执行位置）
- **Inference Profile** — 定义可路由的 region 集合

### 两种 CRIS Scope

| 维度 | Global CRIS | EU Geo CRIS |
|------|-------------|-------------|
| 路由范围 | 任意 AWS 商业 region | 仅 EU region |
| 用途 | 最高吞吐 + 折扣价 | EU 数据驻留（GDPR） |
| 价格 | **折扣**（vs direct 或 Geo CRIS） | 标准 |
| Resiliency | 高（任何 region 容量问题可绕行） | 中（限于 EU 容量池） |
| 合规适用 | 全球应用、非 EU 数据 | 欧盟个人数据处理 |

**EU CRIS 路由规则**：

- EU 源 region → 只能路由到 EU 内其他 region（**不包括** Zurich、London）
- London 源 → 只能路由到 EU + London
- Zurich 源 → 只能路由到 EU + Zurich
- 非 EU 源 → 路由优化仅考虑 source region + EU regions

**Geo CRIS 的静态性**：region 集合是**预定义的静态集合**。AWS 不会动态添加 region 到地理 profile。新 region 必须发新版 profile。

## GDPR 对齐

GDPR 关键要求：

1. **Data protection by design** — 需 IAM 控制谁能访问/调用哪些模型和 CRIS profile
2. **Least privilege** — 只允许授权管理员/用户/应用访问 AWS 资源
3. **Prevent unintended cross-region processing** — IAM 策略避免不想跨区处理的内容被发送

**AWS IAM 的角色**：

- 控制哪些 application 可访问 data / invoke 哪些 FMs / 用哪些 CRIS profile
- 在 source region 强制 least privilege
- 防止客户不希望在 destination region 处理的内容被包含在 input prompt

## 安全性设计

**网络层**：

- Region-to-Region 流量（包括 Edge Locations、AWS Direct Connect）走 **AWS 骨干网**
- **不经过公共 internet**
- Region 间数据传输**加密**

**API 层**：

- 必须显式指定 CRIS profile ID（不能用普通 model ID 触发跨区）
- 示例：model ID = `"eu.amazon.nova-2-lite-v1:0"`（EU CRIS）vs `"global.amazon.nova-2-lite-v1:0"`（Global CRIS）

## 透明性和审计性

GDPR 重要：**数据处理活动记录**

**AWS CloudTrail（默认开启）**：

- 持续监控 AWS 账号活动
- 记录所有 API 调用（控制台/SDK/CLI）的**元数据**（不含 payload）
- 默认保留 90 天（可配置长期存储）
- Bedrock 关键事件：`Converse` 和 `InvokeModel` API
- **关键字段**：`inferenceRegion`（在 `additionalEventData` 中）显示**实际处理的 region**

**Model Invocation Logging（默认关闭，需显式启用）**：

- 收集**完整请求 + 响应 + 元数据**
- 输出到 CloudWatch Logs 或 S3
- 适用场景：合规需要完整 audit trail

**日志位置原则**：

- CloudWatch / CloudTrail / Model Invocation Logging **都只在 source region 记录**
- 不论 destination region 在哪，日志都**保存在 source region**
- **简化监控管理** + 满足"日志在本地"的 data residency 要求

## 代码示例（CRIS profile 调用）

```python
import boto3
bedrock_runtime = boto3.client("bedrock-runtime", region_name="eu-south-1")  # Source: Milan

# EU CRIS — Nova Lite 只在 EU 区域内处理
model_id = "eu.amazon.nova-2-lite-v1:0"
response = bedrock_runtime.converse(
    modelId=model_id,
    messages=[...],
    additionalModelRequestFields={...}
)

# Global CRIS — Nova Lite 可路由到任何 AWS 商业 region
model_id = "global.amazon.nova-2-lite-v1:0"
response = bedrock_runtime.converse(
    modelId=model_id,
    messages=[...],
    additionalModelRequestFields={...}
)
```

## 深度分析

### 1. Geo CRIS 的静态性与 GDPR 动态合规的内在张力

Geographic CRIS 的 region 集合是**预定义的静态集合**，AWS 不会动态添加 region。当欧盟扩展边界（如新成员加入）或 AWS 上线新 EU region 时，AWS 必须发布新 profile ID 才能覆盖。 这意味着**合规状态不是一次评估永久有效**——企业需建立定期审查机制，核对 profile ID 与当时 EU 地理边界的对应关系，而非假设 profile 不变就永远合规。静态 profile + 动态监管环境的组合，要求法务/合规团队将 CRIS profile 纳入常规合规审查清单。

### 2. Global CRIS 的成本优势实质上是跨区数据流的隐性风险溢价

Global CRIS 提供折扣价格，来源是其调用了更广泛的 region 池（任意 AWS 商业 region），实现了更高的模型吞吐量和容量弹性。 但对 EU 数据处理场景而言，折扣背后隐藏的是**数据可能流经任何商业 region 的风险敞口**。折扣价是 AWS 容量优化的商业激励，但不能替代合规判断。如果 GDPR 合规要求数据不得流出 EU，即使 Global CRIS 更便宜，也不能以成本为由选用。**成本与合规是独立决策维度**。

### 3. IAM 的角色从访问控制延伸为数据治理的前置防线

GDPR "data protection by design" 要求在系统设计层面嵌入数据保护机制。AWS IAM 在 CRIS 架构中承担的角色不只是"谁能调用模型"，而是**"谁的内容不允许进入 destination region"**——通过 least privilege 原则，限制哪些应用可以使用哪些 CRIS profile，防止含有 EU 个人数据的内容被意外发送至非 EU destination。 这将 IAM 从传统的认证授权工具升级为**数据处理范围的强制执行层**，超越了单纯的安全边界控制。

### 4. Source-region 日志集中是数据驻留合规的架构设计亮点

CloudWatch / CloudTrail / Model Invocation Logging 均**只在 source region 记录**，无论 destination region 在哪里。 这解决了跨区推理场景下"日志应该存在哪里"这个常见合规困惑。从 GDPR 透明度原则看，数据主体有权了解自己的数据被如何处理，而日志在本地（source region）存储的设计，确保企业始终能够提供完整的处理活动记录，即使推理实际发生在另一个 region。这是**将监管合规需求转化为架构约束**的典范设计。

### 5. Global vs EU CRIS 的选择本质上是风险偏好的显式声明

同一份业务代码，通过切换 model ID 前缀（`eu.amazon.nova-2-lite-v1:0` vs `global.amazon.nova-2-lite-v1:0`）即可改变数据流向范围。 CRIS Profile 抽象了这一选择，使得技术团队和法务团队可以在同一接口（profile ID）上对齐数据处理范围决策。CRIS 的折扣属性和 EU 约束属性并存，意味着**不存在绝对占优的 profile**，只有适合特定风险偏好的配置——这对企业的合规文化提出要求：技术决策者需要明确知晓每个 profile 选用的合规含义，而非仅从性能/成本角度选择。

## 实践启示

> 以下为在原有实践启示基础上的**新增补充**，原有 checklist 保持不变。

**何时选择哪种 CRIS profile**：

- ✅ **EU CRIS**：处理 EU 公民数据、GDPR 严格合规、有数据驻留义务
- ✅ **Global CRIS**：追求最低成本（折扣）、最高吞吐、可接受跨区推理
- ✅ **直接 in-region**：极端合规场景，模型必须在自己 region 处理
- ❌ **混合误用**：用 Global CRIS 处理需要 EU 驻留的数据 = 合规违规

**GDPR 实施 checklist**：

1. **数据分类** —— 哪些用户数据受 GDPR？哪些模型调用会处理这些数据？
2. **profile 选择** —— EU 数据 → EU CRIS 强制
3. **IAM 策略** —— 限制可调用 EU CRIS profile 的应用
4. **审计开启** —— CloudTrail 默认 + Model Invocation Logging 显式启用
5. **DPA 审查** —— 审查 AWS Data Processing Addendum 是否覆盖 CRIS 跨区场景
6. **destination 透明** —— 监控 `inferenceRegion` 字段，确认实际处理 region

## 关键设计模式

### 1. **Profile 抽象解耦 region**

业务代码不直接绑 region，而是用 CRIS profile ID。**同一份代码可在不同合规要求下切换**。

### 2. **日志 source-region 中心化**

无论实际推理在哪个 destination region，日志都在 source region。**审计统一入口 + 数据驻留友好**。

### 3. **IAM profile 级粒度**

可对 CRIS profile 级别授权，**而非模型级别**。更细粒度地执行合规策略。

### 4. **CloudTrail metadata + MIL payload 双层**

默认 CloudTrail 记录 metadata（廉价） + 可选 Model Invocation Logging 记录 payload（贵）—— **按需启用**，平衡审计完整性和成本。

## 相关链接

- [Cross-Region Inference 官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html)
- [Geographic CRIS 官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/geographic-cross-region-inference.html)
- [Bedrock supported models](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)
- [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Securing Amazon Bedrock cross-Region inference](https://aws.amazon.com/blogs/machine-learning/securing-amazon-bedrock-cross-region-inference-geographic-and-global/)
- [Bedrock CloudTrail 审计](https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html)
- [Model Invocation Logging](https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html)

## 相关实体
- [From Siloed Data To Unified Insights Cross Account Athena Access For Amazon Quic](https://github.com/QianJinGuo/wiki/blob/main/entities/from-siloed-data-to-unified-insights-cross-account-athena-access-for-amazon-quic.md)
- [Openai Models Codex Amazon Bedrock Ga](https://github.com/QianJinGuo/wiki/blob/main/entities/openai-models-codex-amazon-bedrock-ga.md)
- [Secure Ai Agents Policy Lambda Interceptors Aws](https://github.com/QianJinGuo/wiki/blob/main/entities/secure-ai-agents-policy-lambda-interceptors-aws.md)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](https://github.com/QianJinGuo/wiki/blob/main/entities/mcp-serveramazon-bedrock-agentcorequick-suite.md)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](https://github.com/QianJinGuo/wiki/blob/main/entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md)

---

