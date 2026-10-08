# Introducing Claude apps gateway for AWS

> 📊 Level ⭐⭐ | 13.1KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/introducing-claude-apps-gateway-for-aws)

Enterprises deploying Claude Code and Claude Desktop across development teams need centralized control over access, cost, and policy. At scale, this is hard to manage: each developer needs an individual credential, settings must be distributed manually, and spend is difficult to track or cap. Without a centralized control point, governance is left to whatever tooling each team can implement independently.

Today, we're announcing the Claude apps gateway for AWS, a self-hosted control plane that gives organizations a single point of control over access, cost, and policy for Claude Code and Claude Desktop. It replaces the need to provision a separate cloud credential per developer, push settings to every laptop by hand, or stand up separate tooling to track spend. You can deploy it through Amazon Bedrock to keep data within the AWS security boundary, or through Claude Platform on AWS to get the same gateway controls with the native Claude platform experience.

In this post, we show how to set up and run Claude apps gateway for AWS with Amazon Bedrock and Claude Platform on AWS.

## How the Claude apps gateway works

The gateway is delivered by Anthropic inside the same [Claude Code CLI](https://code.claude.com/docs/en/quickstart) binary your developers already use. You can run it in one stateless container on your infrastructure, backed by a [PostgreSQL](https://www.postgresql.org/) database that stores short-lived sign-in state and rate-limit counters. Because the gateway and the client are built together, the `/login` flow is gateway-aware. The client applies managed settings automatically at sign-in, and policy is enforced consistently on every request.

Onboarding and offboarding follow your existing identity workflows. To grant access, add a developer to your identity provider (IdP). To revoke it, remove them, and their session expires within the configured token lifetime (one hour by default). No long-lived secrets live on developer machines.

The gateway handles five core responsibilities:

- **Identity:** The gateway connects to any standards-compliant OpenID Connect (OIDC) identity provider. After a developer signs in through browser single sign-on (SSO), the gateway issues a short-lived token that the CLI uses for all subsequent requests.
- **Policy:** You define managed settings once on the server. Clients receive policy at sign-in, and the gateway enforces it on every request. You can adjust allowed models, tool permissions, and default settings centrally, scoped by IdP group.
- **Telemetry:** The client stamps a usage metric for every request, and the gateway relays it over OpenTelemetry Protocol (OTLP) to a collector you configure, such as Amazon CloudWatch or Amazon Managed Service for Prometheus in your own account, or a third-party platform. You control where telemetry goes.

## 第 2 来源 — 生产参考部署（2026-08-11）

2026-08-11 AWS 发布 Claude apps gateway 生产参考部署，覆盖端到端架构、企业部署模式、成本与实现资源，是 07-10 发布公告的落地补充。

### 生产部署拓扑

- Fargate 无状态 gateway 容器 + RDS PostgreSQL 存短期登录态（device codes / sessions / per-user spend counters / audit records）——任何 task 可服务任何请求，无需 sticky session
- 内部 ALB 终结 TLS（ACM 证书）+ Route 53 private hosted zone；VPC endpoints 保持 AWS 服务流量私有，NAT gateway 提供其余 egress
- 上游凭据：gateway 用 IAM role 认证 Bedrock；Claude Platform on AWS API key 等静态凭据存 Secrets Manager，不发到开发者机器
- ⚠️ ALB idle timeout 必须大于最长无数据间隔（默认 60s，否则长流式/非流式间隔响应被掐断）

### 请求流

- **Sign-in**：OAuth 2.0 device authorization grant，浏览器经 OIDC IdP 认证，gateway 发 1 小时短期 bearer token，随后静默刷新
- **Inference**：每请求验证 token → 解析身份/组 → 应用策略 → 评估 spend cap → 路由到 Bedrock 或 Claude Platform；usage metrics 经 OTLP 转发

### 五大治理能力

1. **Identity / SSO**：OIDC 委托，无自有用户目录、无 SCIM 同步，IdP 组 1:1 映射；offboarding = 从 IdP 移除用户，会话在 TTL 内过期
2. **Policy**：YAML 声明式策略按声明顺序首匹配 + `match: {}` catch-all；支持 deny 具体工具（`deny: ["WebFetch", "WebSearch"]`）与文件路径（`deny: ["Read(./.env)", "Read(./secrets/**)"]`）；需 `desktop: {}` 才放行 Desktop 推理
3. **Telemetry**：`claude_code.token.usage` / `cost.usage` / `active_time.total` 按认证身份归属，OTLP → Datadog/Splunk/Grafana/CloudWatch(ADOT)；logs/traces opt-in（可能含源码与 prompt），默认仅 metrics
4. **Routing**：多 upstream 按声明顺序 + 自动 failover（不可用/限流/超时）；跨 provider failover 会改变服务条款与数据处理地域
5. **Spend caps**：org 默认 / per-group / per-user 三级（per-user override > 最严格 group cap > org default），超额 HTTP 429，周期自动重置；Admin API 管理无 UI；spend 为 list price 估算非 invoice；DB 不可用时默认 fail open，可设 `fail_closed_on_error: true`

### 部署模式

- **Pattern A 单团队单 Region**：一个 Bedrock upstream + org-wide cap，最小起步
- **Pattern B 多团队分层**：IdP 组驱动差异化（platform eng = Opus+Sonnet+Haiku $50/day；app dev = Sonnet+Haiku $20/day；contractors = Haiku only $5/day + web tools denied）
- **Pattern C 混合**：Bedrock 主 + Claude Platform overflow（跨 provider failover 注意服务条款）
- 集中 vs 直连 tradeoff：集中 = 统一治理但共享基础设施、无原生 Bedrock 特性；直连 = 独立 quota + 全特性但丢失 per-developer 治理

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/deploying-anthropic-claude-apps-gateway-for-aws-for-enterprise-workloads)

## 深度分析

### 设计哲学：把控制平面藏进客户端二进制

与多数把 gateway 当作独立旁路产品的做法不同，Claude apps gateway 直接随开发者已经在用的同一个 Claude Code CLI 二进制交付——用 `claude gateway --config gateway.yaml` 以 server 模式启动，同一镜像可跑在 Fargate、EKS 或 EC2 上。因为客户端和 gateway 是一体构建的，`/login` 流程天然是 gateway-aware 的：托管设置在登录时自动下发，策略在每个请求上被一致执行。

这个设计的实际效果是"对开发者不可见"：开发者登录一次之后仍运行他们熟悉的同一个 `claude` 二进制，不感知 gateway 的存在，也就没有需要推广的新工具链。对平台团队而言，这是采用成本近乎为零的治理层——不需要改变开发者的工作流，只需要给他们一个指向 gateway 私有 URL 的 managed settings。

### 无状态控制平面的工程选择

参考架构刻意把 gateway 做成无状态：认证态（device codes、sessions）、per-user spend counters 和审计记录全部放在 RDS PostgreSQL 里而不是 task 里，因此任何 Fargate task 都能服务任何请求，负载均衡器不需要 sticky session。这换来的是水平扩容的简单性——加 task 即可，无需会话亲和。

凭据管理同样体现了"最小暴露面"原则：gateway 用 ECS task 的 IAM role 认证 Bedrock（无静态密钥），Claude Platform on AWS 的 API key 等静态凭据留在 Secrets Manager，任何上游凭据都不下发到开发者机器。一个容易被忽视的运维细节：ALB idle timeout 必须大于最长的无数据间隔（默认 60 秒），否则长流式响应的 chunk 间隙或延迟的非流式响应会被直接掐断。

### 五大治理能力中的关键细节与坑

Identity 层的取舍很激进：gateway 完全不维护自己的用户目录，没有 SCIM 同步，IdP 的组 1:1 用于策略匹配。这消除了两套目录之间漂移的整类问题，但有一个具体的坑——Microsoft Entra ID 默认不携带 group/role claim，若策略用 `match: {groups: [...]}` 匹配 Entra app roles，必须在 OIDC 配置里加 `groups_claim: roles`，否则所有用户都只会落到 catch-all 策略。

Policy 层的模型访问是服务端强制的：组里只授予 Haiku 的开发者即使修改客户端也无法绕过限制，模型选择器只显示被允许的模型。策略按声明顺序首匹配、最后必须有 `match: {}` catch-all（否则未匹配用户会拿到完整模型目录），且每个策略条目需要 `desktop: {}` 才会放行 Desktop 推理——登录成功但推理被拒是配置遗漏的典型症状。

Spend caps 是推理前的内联强制执行（超额即 HTTP 429），与 AWS Budgets 的账户级事后聚合互补。三级限额的解析顺序是 per-user override > 最严格的 group cap > org default，且限额是按开发者个人生效而非共享池。两个必须知道的局限：spend 按 list price 从 token 数估算，是实时熔断器而不是 invoice（committed-use 折扣不体现）；数据库不可用时默认 fail open 放行推理，需要严格预算管控的组织应设 `fail_closed_on_error: true`。

Telemetry 默认只转发 metrics；logs/traces 是 opt-in，因为它们可能包含源码和 prompt 内容。这个默认值把"可观测性"和"数据外泄风险"的权衡交给了组织——多数部署从 metrics-only 起步，per-user 成本与用量归因已经足够，而不必把敏感内容送出 VPC。

### 部署模式的真实取舍

集中 vs 直连不是二选一：全部流量走 gateway 换来统一的配额、成本归因和策略执行，onboarding 即时（把开发者加进 IdP 组即可），但 gateway 变成平台团队运维的共享基础设施，且需要原生 Bedrock 特性（Knowledge Bases、Agents、Flows）的工作负载无法经它路由——Pattern D 正是为此而生：开发者工具走 gateway 拿治理，生产应用直连专用 Bedrock 账户拿隔离配额与全量特性。

Pattern E（multi-account shared services）暴露了一个架构限制：gateway 不会为每个 upstream 原生 assume 不同的 IAM role，跨账户路由必须在 upstream 配置里写显式凭据并存入 Secrets Manager 定期轮换——长生命周期 access key 是显著的安全与运维代价，AWS 建议用外部进程定期把短生命周期 STS 凭据刷新进 gateway 环境。相比之下 Pattern B（单账户内 IdP 组驱动的分层访问）是最常见的企业形态：platform engineering / application developers / contractors 分别对应不同的模型集与每日限额（如 $50/$20/$5），组限额按开发者个人继承而非团队共享池，团队总量需要另行聚合。

参见 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)、[AI 成本优化框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md)，以及同类对比 [LiteLLM on AWS ECS/EKS](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-aws-ecs-eks-ai-gateway-architecture.md) 与 [Bedrock Mantle / LiteLLM Gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-mantle-litellm-gateway-2026.md)。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: [AI Gateways vs MCP Gateways](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)

---

