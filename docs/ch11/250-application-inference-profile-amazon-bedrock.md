# 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警

## Ch11.250 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警

> 📊 Level ⭐⭐ | 3.7KB | `entities/amazon-bedrock-application-inference-profile-per-bu-cost-alert.md`

# 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警

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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/基于-application-inference-profile-为-amazon-bedrock-构建分业务单元的近实.md)

---

