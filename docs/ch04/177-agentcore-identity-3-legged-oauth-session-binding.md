# AgentCore Identity: 3-legged OAuth+Session Binding的安全架构

## Ch04.177 AgentCore Identity: 3-legged OAuth+Session Binding的安全架构

> 📊 Level ⭐⭐ | 12.0KB | `entities/aws-bedrock-agentcore-identity-security.md`

## 核心内容
Amazon Bedrock AgentCore Identity通过3-legged OAuth + session binding模式为ECS上的AI Agent提供企业级安全身份认证。Agent访问云资源时通过OAuth获取临时凭证并绑定到特定session，防止token泄露和权限滥用。

## 三个关键洞察
### 1. 为什么AI Agent需要特殊身份管理
传统 IAM user/service account不适用于AI Agent——Agent行为不可预测、可能越权访问敏感资源。3-legged OAuth让每次Agent任务获得最小权限的临时token，且绑定到特定session可审计和撤销。

### 2. Session binding的审计价值
每个Agent操作绑定到session ID，session可关联到具体的任务/用户/时间窗口。泄露的token只在该session有效期内可用，超时自动失效。

### 3. ECS与AgentCore Identity的集成
AgentCore Identity原生集成Amazon ECS，ECS task role自动配合OAuth token exchange，无需在容器内管理长期凭证。

## 深度分析
### OAuth 2.0 Authorization Code Grant的安全优势
Amazon Bedrock AgentCore Identity采用Authorization Code Grant（3-legged OAuth）而非简化的客户端凭证模式，核心原因在于**用户委托授权的可审计性**。当Agent代表用户操作外部服务（如GitHub、Jira、Salesforce）时，必须经过用户明确同意的consent flow，每个token都绑定到具体用户身份，形成从身份认证到Agent行为的完整审计链。
在ECS部署场景中，方案使用ALB内置OIDC认证流程验证用户身份，JWT通过`x-amzn-oidc-data` header传递，其中的`sub` claim作为用户唯一标识。这一设计避免了传统方案中需要在应用层解析和验证token的复杂性和安全风险。

### Session Binding防止的两类攻击
**CSRF（跨站请求伪造）攻击**：攻击者试图将自己的OAuth token绑定到受害者身份，导致受害者的Agent在不知情情况下访问攻击者的资源并可能导致数据泄露或注入攻击。
**Browser Swapping Attack（浏览器替换攻击）**：攻击者诱骗受害者在自己的浏览器上完成授权流程，将受害者的OAuth token绑定到攻击者身份，从而直接获取受害者资源的访问权限。
Session Binding的防御机制要求用户ID在Agent Workload和Session Binding Service两端必须一致，且均通过加密验证的身份链确认。这确保了"授权时的用户"与"使用token时的用户"是同一人。

### ALB OIDC与Microsoft Entra ID的兼容性挑战
一个关键技术细节：方案选择`GetWorkloadAccessTokenForUserId`而非`GetWorkloadAccessTokenForJWT`，原因是ALB的OIDC握手流程与Entra ID的token audience存在冲突。
ALB在OIDC认证时，会将access token发送至Microsoft Graph的UserInfo端点（`graph.microsoft.com/oidc/userinfo`）获取用户声明，该端点只接受Graph作为audience的token。如果在OIDC scope中包含Application ID，token audience会变成自有应用而非Microsoft Graph，导致UserInfo端点返回401，ALB返回561错误。
解决方案：移除Application ID from scope，让Entra默认将token audience设为Microsoft Graph，使ALB握手成功。ALB签发的JWT包含UserInfo返回的用户声明（含`sub` claim），通过AWS公开签名密钥验证后，将`sub`传递给`GetWorkloadAccessTokenForUserId`获取工作负载访问令牌。

### Token Vault与自动刷新机制
AgentCore Identity的Token Vault存储access token和refresh token（当OAuth provider支持时，如GitHub的User-to-server token）。这实现了关键的UX优化：当access token过期时，AgentCore Identity自动使用refresh token获取新token，用户无需重新授权。只有当provider未颁发refresh token或token被provider主动撤销时，才需要用户重新完成consent flow。
通过`forceAuthentication: true`参数可以强制重新认证，而`customState`参数允许传入加密随机nonce以防止callback端点的CSRF攻击（遵循OAuth 2.0规范建议）。

## 实践启示
### 架构设计层面
1. **将Session Binding Service与Agentic Workload分离部署**：两者独立扩缩容，Session Binding Service是无状态服务适合水平扩展，而Agentic Workload可能需要更多计算资源运行Agent逻辑。在ECS上可使用不同task definition实现差异化配置。
2. **最小权限OAuth Scopes设计**：每个Tool仅请求其所需的OAuth scopes（如`read:user`而非全量`user`权限），使consent与实际使用对齐。这一原则不仅降低token泄露后的损害范围，也使用户更容易信任授权请求。
3. **Pydantic BaseModel作为Tool返回类型**：使用Strands Agents时，在Pydantic类中定义返回类型可以自动生成tool description，减少LLM幻觉，同时实现一致的错误处理（通过`AuthorizationRequiredError`异常处理未授权状态而非返回字符串）。

### 安全运营层面
1. **Token有效期管理**：虽然session binding提供了会话级别的绑定，但access token本身的有效期仍需关注。优先使用支持refresh token的OAuth provider，并确保Token Vault正确存储和刷新token。
2. **跨平台兼容性**：该架构模式不限于ECS——EKS、Lambda或本地部署只要实现相同的session binding协议栈即可获得同等安全保障。
3. **WAF基线防护**：方案在ALB附加AWS WAF基本规则集，防御常见Web漏洞。在生产环境中应根据具体业务流量特征调整WAF规则。

### 故障排查要点
当出现ALB OIDC认证失败（561错误）时，首先检查OIDC scope中是否误包含了Application ID——Entra ID的UserInfo端点兼容性是常见原因。
当token获取流程卡住时，确认Session Binding URL可公开访问（不能被ALB authentication规则拦截），且`session_id`参数正确传递。
---
*Source: [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aws-bedrock-agentcore-identity-security.md)*

## 相关实体
- [AgentCore质量优化飞轮：推荐-验证-部署闭环](ch11/118-aws-bedrock-agentcore-quality-optimization-flywheel.md)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch03/045-agent.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch03/045-agent.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/253-bedrock.md)
- [Hapag-Lloyd：1.5万反馈/月95%情感准确率](ch11/169-aws-hapag-lloyd-bedrock-customer-feedback.md)
- [Halliburton Seismic Workflow with Amazon Bedrock and Generative AI](ch04/277-ai.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch03/045-agent.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/277-ai.md)
- [OpenClaw多租户迁移: Phase 2&3部署](ch11/215-openclaw.md)
- [AgentCore Runtime部署Apache Doris MCP Server](ch04/277-ai.md)
- [OpenClaw多租户迁移: 背景与架构概览](ch11/215-openclaw.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/215-openclaw.md)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/253-bedrock.md)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](ch03/045-agent.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch03/045-agent.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch04/277-ai.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](ch01/655-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/259-amazon-nova.md)
- [Restrict access to sensitive documents in your Amazon Quick knowledge bases for Amazon S3](ch11/210-restrict-access-to-sensitive-documents-in-your-amazon-quick.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/701-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [AgentCore Managed Harness](ch03/045-agent.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢](ch04/277-ai.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/277-ai.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch01/217-0.md)
- [CloudSectiDbits](ch11/224-cloudsectidbits.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

