# ai agent 的迁移与现代化 使用 amazon bedrock agentcore 将 openclaw 从单机改造为多租户 serverless 架构

## Ch11.076 ai agent 的迁移与现代化 使用 amazon bedrock agentcore 将 openclaw 从单机改造为多租户 serverless 架构

> 📊 Level ⭐⭐ | 10.7KB | `entities/ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改造为多租户-serverless-架构-.md`

# ai agent 的迁移与现代化 使用 amazon bedrock agentcore 将 openclaw 从单机改造为多租户 serverless 架构

<div style="line-height: 1.6;font-size: 16px">
<p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第六篇：清理资源与总结展望，删除部署资源、迁移前后对比回顾，以及进一步探索方向。</p>
<div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px">
<p><strong style="font-size: 18px;color: #333">目录</strong></p>
<div style="line-height: 1.8;margin: 0;padding: 0">

## 相关实体
- [Using Amazon Bedrock Agentcore Openclaw Multi 5](../ch04/540-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/540-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 4](../ch04/540-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 1](../ch04/540-amazon-bedrock-agentcore.html)
- [Openclaw Multi 5](ch11/228-openclaw.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改造为多租户-serverless-架构-.md)

## 深度分析

### 1. 混合迁移策略的架构意义

本项目采用 **Replatform + Refactor 混合策略**，是典型的 7R 迁移框架实践。Replatform 适用于运行环境、模型调用、安全、监控等可直接用托管服务替换的场景；Refactor 则用于多租户隔离、数据持久化、消息路由等需要重新设计架构的部分。

这种分层策略的价值在于：**在关键维度做针对性改造，同时尽可能复用已有的应用逻辑**。OpenClaw 的核心 Agent 能力无需重写，只需适配 AgentCore 的 Runtime 接口，大幅降低了迁移风险和工程量。

### 2. 多租户隔离的技术路径

从共享进程到 Per-Session microVM 的演进，是本迁移最核心的架构变革。传统单进程架构中，所有用户共享文件系统和网络空间，任何一个用户的代码漏洞都可能影响其他用户。AgentCore 的 Per-Session microVM 实现了：

- **运行时隔离**：每个用户会话运行在独立微型虚拟机中
- **凭证隔离**：AWS STS scoped credentials 限制每用户权限范围
- **数据隔离**：S3 用户前缀隔离（`s3://bucket/user-id/`）

这种隔离粒度在传统 VPS 架构下几乎无法实现，必须依赖云原生的虚拟化技术。

### 3. 成本模型的结构性变化

迁移前后成本结构发生根本性转变：

| 维度 | 迁移前 | 迁移后 |
|------|--------|--------|
| 固定成本 | VPS 包月费用 | 仅 S3/KMS 等存储费用 |
| 变动成本 | 基本为零 | 按会话时间 * microVM 运行时间 |
| 空闲成本 | 全天候 VPS 运行 | 空闲超时后 microVM 停止 |

迁移后的成本优化关键在于 `session_idle_timeout` 参数：缩短空闲超时可显著减少 microVM 运行时间。同时，使用更便宜的子代理模型（`subagent_model_id`）和设置严格的 `daily_token_budget` 也是有效的成本控制手段。

### 4. 安全架构的升级路径

从应用层自实现安全到云原生安全服务的迁移，体现了基础设施现代化的典型路径：

```
应用层安全 → AWS VPC + KMS + Bedrock Guardrails + STS + Secrets Manager
```

这个升级不只是技术替换，更是安全责任的转移：AWS 托管服务承担底层安全基础设施的维护和合规，应用层可以聚焦业务逻辑本身。Bedrock Guardrails 提供的 PII 检测和主题过滤能力，是自建方案难以企及的。

### 5. 资源清理的幂等性设计

文章强调了资源清理的三个步骤设计具有实际工程意义：先删 Runtime 再删 Stack 最后手动清理保留资源，这个顺序确保了依赖关系不破坏。保留策略（RETAIN）对于 S3、KMS、DynamoDB 等数据存储是必要的防护机制，防止误删。

KMS 密钥的 7-30 天删除等待期是一个容易被忽视的细节，在生产环境中需要提前规划。

## 实践启示

### 架构设计层面

1. **采用混合迁移策略**：不要试图一次性完成全面重构。根据业务的实际需求和风险承受能力，识别哪些组件适合直接替换（Replatform），哪些需要重新设计（Refactor）。本项目的成功正是建立在这种务实的分层策略之上。

2. **优先处理多租户隔离**：如果业务存在多用户场景，运行时隔离应该是架构改造的首要目标。Per-Session microVM 模式提供了容器化无法实现的隔离级别，是 AI Agent 多租户场景的理想选择。

3. **利用托管服务降低运维负担**：VPC、KMS、Secrets Manager、Bedrock Guardrails 等托管服务大幅简化了安全基础设施的搭建。团队应该优先考虑使用托管服务而非自建，除非有特殊的定制需求。

### 工程实践层面

4. **CDK 多 Stack 架构的借鉴价值**：项目将基础设施划分为 8 个 CDK Stack，这种模块化设计值得借鉴。每个 Stack 聚焦单一职责（如 Guardrails、AgentCore、Storage），便于独立更新和故障定位。

5. **建立完善的资源清理流程**：部署和清理是对称的操作，应当同等重视。建议在部署文档中同步包含清理流程，并定期验证清理脚本的正确性。

6. **监控和告警的同步建设**：CloudWatch Dashboard + Alarm + X-Ray 的监控体系应与基础设施同步建设。`TokenUsageTable` 的 token 统计机制为成本控制提供了数据基础。

### 成本优化层面

7. **精细化配置空闲超时**：`session_idle_timeout` 是成本控制的关键参数。建议根据用户行为数据设置合理的超时值，在用户体验和成本之间取得平衡。

8. **分层模型策略**：使用强大的主模型处理复杂任务，子代理使用更便宜的模型处理简单任务，这是控制 Token 成本的有效策略。

9. **预留成本告警机制**：通过 `daily_token_budget` 设置预算告警，确保在成本异常时能够及时发现和处理。

### 扩展方向

10. **多渠道消息路由**：项目预留了 Slack、Discord、WhatsApp 的接口，Router Lambda 已内置 Slack HMAC 签名验证。这表明架构设计时应考虑未来的扩展性，预留插件式扩展点。

11. **多区域部署准备**：CDK 代码和部署脚本支持多区域，关键在于为每个区域创建独立工作目录和设置不同的 `TARGET_REGION`。如果业务有全球化需求，这个架构可以平滑扩展。
</div>

---

