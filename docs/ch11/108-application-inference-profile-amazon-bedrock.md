# 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警

> 📊 Level ⭐⭐⭐ | 7.8KB | `entities/amazon-bedrock-application-inference-profile-per-bu-cost-alert.md`

> **Background**：本文基于 AWS China Blog 2026-06-22 的技术教程，介绍一种轻量、旁路、近实时的 Bedrock 成本告警方案：调用方直连 Bedrock（无代理），利用 Application Inference Profile 做分 BU 的用量归因，直接在 CloudWatch metric math 告警里把 token 数换算成估算成本，再通过通知 Lambda 转发到协作工具。

## 痛点：Bedrock 成本可见性

企业使用 Amazon Bedrock 时，多个业务单元（BU）共享同一个模型订阅，成本难以拆分。常见方案各有取舍：

- **基于账单的方式**（成本分配标签、AWS Budgets）：准确但有数小时延迟，无法实时告警
- **代理/网关方式**（LiteLLM 等）：可做硬性预算阻断，但引入额外延迟、单点故障和负载限制

## 方案核心：Application Inference Profile

Bedrock 支持在原始基础模型基础上封装一层 Application Inference Profile，给不同应用分开使用。通过 Application Inference Profile 调用模型时，Bedrock 在 `AWS/Bedrock` 命名空间下发出的 token 指标（`InputTokenCount`、`OutputTokenCount`、`CacheReadInputTokens`、`CacheWriteInputTokens`），其 `ModelId` 维度的取值是该 Application Inference Profile 的 ID，而非底层基础模型的 ModelID。

利用这一特性，给每个 BU 分配独立的 Application Inference Profile 后，每个 BU 的 token 用量在 CloudWatch 中天然隔离，无需额外标签或代理。

## 架构

整套方案用两条 `aws cloudformation deploy` 命令部署：

1. **调用方直连 Bedrock** — 链路上没有代理，不引入额外延迟
2. **Application Inference Profile 做分 BU 用量归因** — 每个 BU 一个 Profile
3. **CloudWatch metric math 告警** — 将 token 数换算为估算成本
4. **通知 Lambda** — 将告警状态变更转发到飞书/微信/DingTalk/Slack/Teams/邮件

## 与现有方案对比

| 维度 | AWS Budget | LiteLLM Gateway | 本方案 (Inference Profile) |
|------|-----------|-----------------|---------------------------|
| 延迟 | 数小时 | 实时（但引入代理延迟） | 近实时（无代理） |
| 阻断能力 | 自动 Deny Policy | 实时限额 | 仅告警，无阻断 |
| 部署复杂度 | 低 | 中（需维护 Gateway） | 低（2 条 CF 命令） |
| BU 隔离 | IAM Principal 标签 | Virtual Key | Application Inference Profile |

→ [原文存档](https://aws.amazon.com/cn/blogs/china/blog-bedrock-per-bu-cost-alarms)

---

### 一、归因难在共享链路，而非缺少工具

Bedrock 计费链路共享：多个 BU 复用同一份模型订阅与端点，服务端只知道"哪个账户调了哪个模型"；`AWS/Bedrock` 的原生 token 指标只有 `ModelId` 一个业务无关维度，所有 BU 的用量被压实成一条曲线。账单侧标签与 AWS Budgets 延迟小时级；代理／网关能实时计量甚至阻断，代价是每次请求多加一跳与单点故障。要实时又零代理，只能让服务端为每次调用打标识。

### 二、Application Inference Profile 把"租户"写进指标维度

Application Inference Profile 是基础模型之上的一层应用侧封装：对外是逻辑端点（把 `modelId` 换成 profile ARN 即可），对内是独立指标流。关键机制是：经 profile 的调用，其 `InputTokenCount`、`OutputTokenCount` 等 token 指标的 `ModelId` 取值是该 profile 的 ID 而非底层模型 ID——"哪个租户在用哪个模型"由此写进指标维度，分 BU 隔离不再需要自定义指标、计量服务或链路组件。代价是 profile ID 与 BU 的映射须外部维护，直连基础模型的调用会静默进共享池。

### 三、把 token 当成本算，让告警承载业务语义

告警即成本模型：metric math 把四类 token 计数分别乘以"每百万 token"单价再求和，CloudWatch 每分钟评估一次最近一个 Period 窗口的累计值；跨阈值切 `ALARM` 发一次 SNS，回落 `OK` 再发一次，超标期不重复推送。

从告警到协作工具的路由零业务逻辑：通用通知 Lambda 不硬编码 BU、模型、阈值与单价——业务单元与模型从告警名 `BedrockCost-<BU>-<Model>-<Region>` 解析，其余字段读 SNS 消息体与 `Trigger.Period`，文案取 `AlarmDescription`。新增 BU 或换模型只是再部署一个参数化栈；CloudFormation 用 `!GetAtt Profile.InferenceProfileId` 把 profile ID 自动注入告警的 `ModelId`。

### 四、观测、配额与分摊的三角权衡与局限

三者链路位置不同：可观测性允许分钟级近似聚合，硬配额必须在请求路径上毫秒级原子判定，财务分摊以账单为准但可小时级。本方案落在"近实时可观测"一格：成本只能估算，不阻断。局限清楚：`ModelId` 是唯一维度，隔离全赖"每 BU 一个 profile"的纪律，想按应用／环境下钻只能再建 profile，基数随之膨胀；颗粒度只到"profile × 区域 × 时间窗口"，定位不到单次调用，窗口累计值还会混同突发与渗漏；指标固有延迟叠加 Period，响应是"数分钟"；通知组件按 `-` 切分告警名，故 BU 与模型名不能含 `-`。

## 实践启示

1. **把归因键做成基础设施。** 每个租户一个 Application Inference Profile，用 IaC 创建并把 `InferenceProfileId` 注入告警的 `ModelId`，"谁花钱"在调用那刻就已确定。
2. **先分类目标，再选链路位置。** 要硬性阻断就上网关与配额方案（见 [LiteLLM AI 网关架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-aws-ecs-eks-ai-gateway-architecture.md)），只要可见性就用指标方案。
3. **成本模型放进告警表达式。** token→金额的换算作为 metric math 配置存在，单价单一来源、可审计，改价只改参数。
4. **通知层保持无业务语义。** 组件只做"解析告警名 + 读消息体 + 转发"，新增租户不改代码，并固化命名规范。
5. **指标给方向，账单才是真相。** 把估算成本与账单按月对账，偏差大即说明流量绕过 profile 或单价过期。分层治理见 [AI 成本优化框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md)、[LLM 可观测性 4 层模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-observability-4-layer-model.md)。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

