# OpenClaw 多用户部署（三）：Replatform 云迁移策略

## Ch11.189 OpenClaw 多用户部署（三）：Replatform 云迁移策略

> 📊 Level ⭐⭐ | 6.3KB | `entities/openclaw-multi-3.md`

## 深度分析

### 1. Replatform 策略的核心价值：用托管服务置换人工运维

Phase 1 的设计哲学代表了云迁移中"Replatform"策略的典型实践——不改变应用架构本质，而是用云托管服务替换原来需要手动搭建的基础能力 。原文明确指出："这正是 Replatform 策略的核心 — 用 AWS 托管服务替代手动运维。"这种策略的优势在于：迁移风险低、周期短，同时能获得 AWS 原生的安全、可观测性和弹性能力。对于从单机 OpenClaw 迁移的企业而言，这意味着安全防护从"自己维护防火墙规则"变成"配置 Security Group + Guardrails"，监控从"手动看日志"变成"CloudWatch Dashboard 统一视图" 。

### 2. 多租户隔离的 STS Session Policy 机制

这是整个 Refactor 策略中最关键的安全设计 。核心问题是：AgentCore 执行角色持有访问所有用户数据的权限，如何防止一个用户的容器窥探另一个用户的数据？方案是：容器启动时通过 AWS STS 生成限制版临时凭证，将权限缩小到当前用户范围（S3 只能访问该用户前缀、DynamoDB 只能查该用户的记录），然后删除原始凭证。45 分钟自动刷新确保即使凭证泄露，窗口也有限 。这种"运行时动态缩限"而非"启动时固定权限"的设计，是多租户 Serverless Agent 架构的安全基石。

### 3. CDK 声明式部署的结构化价值

Phase 1 用 CDK 一次性部署 5 个基础 Stack（VPC/Security/Guardrails/AgentCore/Observability），每个 Stack 内部包含数十个 AWS 资源 。deploy.sh 脚本支持 5 种运行模式（完整部署、仅 Phase 1、仅 Runtime、仅 Phase 3、仅 CDK），通过 `--phase1/2/3` 和 `--runtime-only/--cdk-only` 灵活组合 。这种灵活性对于迭代部署至关重要：团队可以先跑通 Phase 1 验证网络和安全配置，再逐步叠加 Runtime 和业务层，降低了一次性全量部署的风险。

### 4. Amazon Bedrock Guardrails 的多层内容防护体系

Guardrails 提供了 5 类规则的全链路防护：内容过滤（5 种类别，输入输出双检）、主题拒绝（6 类禁止话题）、PII 检测（10 种个人信息）、词汇过滤（AWS 脏话库 + 7 个自定义关键词）、正则匹配（3 条规则封堵 AWS 密钥和通用 API Key） 。值得注意的是，Prompt Attack（提示注入攻击）只在输入侧检查，输出侧为 NONE——这反映了当前大模型对抗性输入检测的技术限制 。Guardrail Version 机制允许生产环境锁定配置快照，避免规则更新导致行为突变，这对需要严格一致性要求的企业客户至关重要 。

### 5. 可观测性架构的最小化覆盖

OpenClawObservability Stack 仅用 4 个 CloudWatch Alarm + 1 个 Dashboard 就覆盖了 7 个关键指标（Bedrock 调用量/错误/限流/P99 延迟、AgentCore Runtime 调用量/错误/延迟、Router Lambda 调用量/错误/耗时） 。这种"少数关键指标"而非"全量埋点"的思路值得借鉴：对于 AI Agent 系统，P99 延迟比平均延迟更能反映用户体验（Agent 任务时间跨度大），限流次数直接关联收入稳定性，都是高价值的监控信号。

## 实践启示

### 1. 迁移前先用 --phase1 验证基础设施工况

建议团队首次部署时先用 `./scripts/deploy.sh --phase1` 跑通 Phase 1，然后到 CloudFormation 控制台验证 5 个 Stack 全部变为 CREATE_COMPLETE 。这一步骤看似简单，却是排查 CDK 权限、IAM Role 策略、VPC 路由等基础问题的最佳时机——如果 Phase 1 有问题，后面 Phase 2/3 的调试代价会成倍增加。CodeBuild 模式相比 local-build 绕过了本地 Docker 和 ARM64 环境限制，是更稳定的 CI/CD 路径 。

### 2. 生产环境必须启用 Guardrail Version 锁定

文章明确建议"生产环境要锁定版本号，防止规则更新导致行为突变" 。实际落地时，应在 CDK 部署脚本中加入版本绑定步骤，确保每次 Guardrail 配置变更都经过评审再更新到生产。关键词过滤列表（AKIA、aws_secret_access_key 等）应作为基础基线，任何调整都需要安全团队参与评审 。

### 3. Telegram Bot Token 配置后立即验证 Webhook 签名

deploy.sh 完成后的 Next steps 明确要求配置 Telegram Bot Token 和 Webhook 。这里的关键是 Webhook 头验证（HMAC 签名）必须启用，否则攻击者可以伪造 Telegram 消息直接控制 Agent。Secret Manager 中存储的 `openclaw/channels/telegram` Secret 和 `openclaw/gateway-token` 是两条独立的安全边界，不应混用同一套密钥 。

### 4. STS 权限隔离是 Refactor 改造的核心目标

如果计划从 Replatform 走向 Refactor（这正是本系列的演进方向），那么 STS 动态凭证缩限是必须实现的核心机制。实现路径是：Phase 2 AgentCore Runtime 部署时，在容器启动脚本中加入 STS AssumeRole + Inline Policy 生成逻辑，确保 AI 进程从一开始就运行在限制版凭证下 。建议提前在测试环境验证 STS 凭证刷新周期（45 分钟）对长时任务的潜在影响。

### 5. VPC Flow Logs + CloudWatch Logs 是网络问题排查的最小集

Phase 1 部署的 VPC Flow Logs 记录所有进出 VPC 的网络流量，配合 CloudWatch Log Group（Bedrock 调用日志）可以覆盖绝大多数网络和调用问题 。建议将这两项日志的保留期设置为 30 天（默认），并配置与 SNS Alarm 联动的异常规则（如 Router Lambda 错误 > 5 次），实现无人值守期间的主动告警 。

## 相关实体
- [Openclaw Multi 4](ch11/225-openclaw.html)
- [Openclaw Multi 1](ch11/225-openclaw.html)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](../ch04/377-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [Strands Agents Cloud Cost Optimizer](../ch03/046-agent.html)
- [Aws Bedrock Agentcore Identity Security](ch11/247-aws-bedrock-agentcore.html)

---

