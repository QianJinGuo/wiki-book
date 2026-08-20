# Introducing Claude apps gateway for AWS

## Ch11.196 Introducing Claude apps gateway for AWS

> 📊 Level ⭐⭐ | 7.1KB | `entities/introducing-claude-apps-gateway-for-aws.md`

# Introducing Claude apps gateway for AWS

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/introducing-claude-apps-gateway-for-aws.md)

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

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/deploying-anthropic-claude-apps-gateway-for-aws-for-enterprise-workloads.md)

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [AI Gateways vs MCP Gateways](ch11/090-ai-gateways-vs-mcp-gateways-what-security-teams-need-to-kno.html)

---

