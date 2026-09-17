# Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity

> 📊 Level ⭐⭐⭐ | 8.7KB

## 摘要

Amazon Bedrock AgentCore Identity 原本会为每个 Outbound credential provider 资源自动在 AWS Secrets Manager 中创建并托管一个密钥，但客户无法在创建时配置自定义 tag、轮换策略或用 customer managed KMS key（CMK）加密。本次更新允许 credential provider 直接引用客户预先配置好的 Secrets Manager 密钥，只需给出 secret ARN 与存储凭据的 JSON key。这样，组织既有的密钥治理流程（加密、轮换、标签、访问策略）可以原样延伸到 agent 运行时，AgentCore Identity 只在运行时负责读取并把凭据交给 outbound 调用。

## 核心要点

- AgentCore Identity 用「credential provider + token vault」把外部服务凭据的管理从 agent 代码里剥离出来，而不是让 agent 自己持有长期密钥。
- 新能力：创建 Outbound Auth 资源时可选择 *Provide API key via Secrets Manager* 或 *Provide Client secret via Secrets Manager*，填入 secret ARN 与 JSON key 即可。
- 支持引用同一 Region 内另一个 AWS 账户的密钥；不支持跨 Region 共享；也支持通过 Secrets Manager external connectors 引入的第三方密钥。
- 轮换无感：密钥值变更后，AgentCore Identity 在下次读取时自动拿到新值，无需更新或重建 credential provider 资源。
- 权限必须显式授予：密钥的 resource policy 要允许 AgentCore Identity service principal 调用 `secretsmanager:GetSecretValue`；若密钥由 CMK 加密，还需授予 `kms:Decrypt`。
- 控制面 API 为 `aws bedrock-agentcore-control create-oauth2-credential-provider`，把 `clientSecretSource` 设为 `EXTERNAL`，并在 `clientSecretConfig` 中给出 `secretId` 与 `jsonKey`。
- 主要收益是把 CMK 加密、SCP/RCP 合规约束、成本分摊标签等既有治理实践无缝沿用到 agent 场景。

## 深度分析

### 为什么 agentic workload 需要 workload-scoped 的密钥访问

传统做法把第三方 API key 或 OAuth client secret 固化在代码、任务定义或环境变量里，这在单体服务时代尚可接受，但 agent 打破了两个前提。其一，agent 是长时运行、可被外部输入（包括 prompt injection）影响的执行体，一旦它能读到进程环境或上下文，固化的长期密钥就等于把最大 blast radius 交给了不可信输入。其二，静态密钥没有生命周期意识：它不知道自己是「哪个 agent、用于哪个用途、在什么条件下」被使用的，因此无法用策略表达访问边界。

workload identity 的思路是把身份绑定到 workload 本身，让每次凭据获取都经过一次可授权的交换，而不是把密钥当作部署产物分发出去。AWS Secrets Manager 提供了成熟原语——加密、轮换、版本、跨账户共享、resource policy 与 CloudTrail 审计——因此把 agent 的凭据访问放回 Secrets Manager，本质上是把它纳入企业已有的密钥治理平面。

### AgentCore Identity 如何代理到 Secrets Manager（token exchange 与 OAuth2 flow）

AgentCore Identity 存在两种密钥归属模式。默认模式下，服务为每个 Outbound credential provider 在客户账户的 Secrets Manager 里创建并托管密钥，密钥内容包含 API key 或 client secret 以及外部 IdP 的元数据；代价是客户无法干预 tag、rotation 与 KMS key 的选择。新的引用模式把「密钥所有权」还给客户：credential provider 只记录 secret ARN 与 JSON key，服务在运行时按需读取。

读取链路可以概括为：运行时根据 provider 定义调用 Secrets Manager `GetSecretValue`，解析出指定 JSON 字段，再把它用于 outbound 认证。对 OAuth2 provider 而言，这个值进入 client credentials 交换，向外部 IdP 换取短期 access token；token vault 缓存的是「面向外部服务的短期令牌」，而非长期 client secret 本身，client secret 只在需要刷新令牌时才被读取。凭据轮换因此天然兼容：provider 定义不变，下一次读取即拿到新值——这正是 agent 无需持有长期密钥的根本原因。

### IAM resource policy、最小权限与轮换审计

引用模式下的授权是双层的。第一层在 Secrets Manager 侧的 resource policy：必须允许 AgentCore Identity service principal 对目标密钥调用 `secretsmanager:GetSecretValue`。第二层在 KMS 侧：若密钥由 CMK 加密，还要在 key policy 中授予同一 service principal `kms:Decrypt`。两层缺一不可，且都不应退化为宽泛的 `*`——用 `aws:SourceAccount`、`aws:PrincipalArn`、`secretsmanager:ResourceTag` 之类的 condition 把访问收窄到具体 agent 用途，才能把「谁能取到什么密钥」正确映射为策略。

轮换与审计的收益同样来自「密钥归 Secrets Manager 管」这一前提。轮换可以交给自己维护的 rotation Lambda 或 external connector，AgentCore 的无状态读取路径不需要任何改动；每次读取都会进入 CloudTrail，使安全团队能观察「哪个主体在何时读了这个密钥」，从而把 agent 的凭据使用接入现有的监控与告警体系。

### 与「把密钥注入环境变量」的取舍

把密钥作为 env var 注入最简单，但代价明确：密钥随部署固化、出现在任务定义与进程环境中、轮换需要重新下发或重启、难以按用途收敛，也无法回答「谁读过它」。引用 Secrets Manager 模式则把凭据的加密、轮换、标签、复制与访问策略全部留在集中治理平面内，带来按需读取、轮换无感与可审计性。

代价是引入一次运行时依赖与延迟：读取路径依赖 Secrets Manager 与 KMS 的可用性，且比读内存环境变量慢。务实的取舍是按敏感度分层——低敏感、无轮换、无合规要求的配置仍可走简单路径；而生产 agent 访问第三方服务所用的凭据，应默认走引用模式。若延迟敏感，可依赖 token vault 对短期令牌的缓存，让 secret 读取不落在每个请求的关键路径上。这种「延迟与耦合 vs 治理与 blast radius」的权衡，才是本特性真正的决策要点。

## 实践启示

1. 先在 Secrets Manager 中按组织标准创建密钥（CMK 加密、打 cost/compliance 标签），再创建 AgentCore credential provider 引用其 ARN 与 JSON key，而不是让服务自动生成。
2. 显式为 AgentCore Identity service principal 授予 `secretsmanager:GetSecretValue`；CMK 场景追加 `kms:Decrypt`，避免用 `*` 图省事。
3. 在 key/resource policy 中用 condition（账户、principal ARN、resource tag）把访问收窄到具体 agent 用途，实现按用途划分的最小权限。
4. 把轮换交给 Secrets Manager 的 rotation schedule 或 external connector，并在轮换后验证 credential provider 无需重建即可继续工作。
5. 把 `GetSecretValue` 的 CloudTrail 事件接入既有审计告警，让 agent 的密钥读取与人类运维的密钥使用同处一个可观测平面。
6. 跨账户引用时确认 Region 一致（不支持跨 Region）；接入第三方密钥时先用 external connector 带进来。

## 相关实体

- 用 Policy 与 Lambda Interceptor 加固 AI Agent
- [AgentCore 的质量评估与策略控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents.md)
- [用 Temporal Policies 保护 AgentCore Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/securing-ai-agents-temporal-policies-agentcore.md)
- [用 AgentCore 与 Strands 构建企业级 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-enterprise-level-with-bedrock-agentcore-and-strands.md)
- [Bedrock 托管权限（多账户）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-managed-entitlements-multi-account.md)

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/reference-your-own-aws-secrets-manager-secrets-in-amazon-bedrock-agentcore-identity/)

---

