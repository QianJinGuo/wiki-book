# Doris MCP on AgentCore Runtime: VPC原生MCP部署模式

## Ch04.210 Doris MCP on AgentCore Runtime: VPC原生MCP部署模式

> 📊 Level ⭐⭐ | 11.0KB | `entities/aws-bedrock-agentcore-doris-mcp-server.md`

## 核心内容
Apache Doris通过MCP协议部署在Amazon Bedrock AgentCore Runtime上，实现VPC内原生运行、Cognito OAuth认证、按需付费（$0.3/天）。Agent可直接通过MCP调用Doris执行SQL分析，无需数据迁移。

## 三个关键洞察
### 1. MCP协议作为Agent数据接口
MCP（Model Context Protocol）让Agent以标准化的方式调用外部数据源。Doris作为MCP server，提供SQL查询能力，Agent用自然语言提问，Doris执行查询返回结构化结果。

### 2. VPC native的安全价值
Doris MCP server运行在客户VPC内，数据不出VPC，满足数据主权要求。配合AgentCore Identity的OAuth认证，实现端到端安全链路。

### 3. $0.3/天的经济学
按需付费意味着只有Agent实际调用时才计费。对于不频繁的BI查询场景，固定部署数据仓库成本过高，MCP按调用计费更合理。

## 与知识库的连接
- → [AgentCore Identity](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-agentcore-identity-security.md)：OAuth认证模式可复用到MCP server
- → [OS-level Actions](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-agentcore-os-level-actions-browser.md)：Doris MCP是数据层操作，OS-level Actions是界面层操作，共同构成Agent的全栈能力
---

## 深度分析
### 1. 懒初始化的"无服务器+有状态"架构哲学
MCP Server 在 AgentCore Runtime 启动时采用懒初始化（Lazy Initialization）：模块加载阶段只注册 25 个工具的函数签名（名字、参数、描述），不建立任何数据库连接——这一步在毫秒级完成，轻松通过健康检查；首次工具调用时才真正初始化 `DorisToolsManager`、建立 aiomysql 连接池。如果启动阶段就连 Doris，一旦网络抖动或 Doris 临时不可用，Runtime 会误判为部署失败触发回滚。"启动即连库"是此类场景的反模式。

### 2. "重工具"与"轻代理"的边界划定
25 个 MCP 工具不是简单的 REST 转发，而是封装了复杂业务逻辑（SQL 解析、慢查询归因、资源增长预测）的"重工具"。这恰恰是将它放在 AgentCore Runtime 而不是 Lambda/API Gateway 的根本原因——需要能承载复杂 Python 状态、能维持数据库连接池、能长时间驻留的执行环境。工具的"重量"决定了承载层的选择，而非反过来。

### 3. JWT 本地验证的免回调机制
AgentCore Runtime 从 Cognito 的 OIDC Discovery URL 一次性加载 JWKS 公钥，后续每次请求都在本地验证 JWT 签名与过期时间，完全不需要回调 Cognito。这种设计既避免了每次认证的额外网络开销，又保证了安全性——Cognito 只在冷启动时介入一次。

### 4. S3 直传的部署范式
`deploy.sh` 将 `mcp_server.py`、`requirements.txt` 等代码直接上传 S3，AgentCore Runtime 自动在 VPC 内拉起服务——整个过程不需要用户手动构建 Docker 镜像。这对于"轻量工具代理层"至关重要：将交付链路从"写代码→构建镜像→推送仓库→配置容器→部署"压缩为"配置→直传→自动拉起"。

### 5. 按调用付费的经济学适用边界
$0.3/人/天的成本模型仅适用于"非 7×24 高并发查询，而是按需使用的企业内部数据分析场景"。对于高频实时看板类需求，固定常驻服务的 TCO 更优。关键判断维度是调用频率与并发量，而非绝对成本。

## 实践启示
### 1. 为 MCP Server 选择长连接友好的运行时
如果 MCP 工具需要维护有状态连接（如数据库连接池、缓存句柄），优先选择 AgentCore Runtime 这类支持长连接会话的托管服务，而非 Lambda 或 API Gateway。判断标准：工具是否需要在多次调用间保持状态。

### 2. 将 OAuth 认证配置脚本化
使用 `setup_cognito.sh` 把 Cognito 的整套手动流程脚本化（User Pool、Resource Server、Domain、App Client），确保部署过程可复现。手动点检容易遗漏步骤，且难以版本化管理基础设施代码。

### 3. 生产级部署务必配置 VPC + 安全组隔离
Doris 的 9030 端口始终位于 VPC 私有子网内，通过安全组规则（出站 → Doris 私有 IP 的 9030）精确放行。外部客户端必须经过 Cognito OAuth 2.0 认证才可调用。网络隔离 + 身份认证构成纵深防御，不可省略。

### 4. 一键部署配置应成为标准实践
使用 `deploy.conf` 作为唯一配置入口，VPC 子网、安全组、Doris 连接信息、AWS 区域集中管理。这不仅简化了部署流程，更重要的是让跨环境（dev/staging/prod）的配置迁移成为复制粘贴操作。

### 5. 利用 Client Credentials Grant 实现服务间无交互式认证
Quick Suite 通过 Client ID + Client Secret 向 Cognito 的 `/oauth2/token` 换取 Access Token，全程无需用户交互，适合服务到服务（M2M）的授权场景。在设计 MCP Server 的认证流程时，优先考虑 2LO（Client Credentials）而非 3LO（Authorization Code），可大幅简化集成复杂度。
---
*Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-agentcore-doris-mcp-server.md)*

## 架构图
→ [C4 架构图](assets/c4/aws-bedrock-agentcore-doris-mcp-server-c4.html)

## 相关实体
- [AgentCore质量优化飞轮：推荐-验证-部署闭环](../ch11/118-aws-bedrock-agentcore-quality-optimization-flywheel.html)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](../ch11/230-aws-bedrock-agentcore.html)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](../ch11/230-aws-bedrock-agentcore.html)
- [AgentCore Runtime部署Apache Doris MCP Server](../ch11/160-apache-doris-mcp-server-quick-suite-ai.html)
- [Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments](ch04/291-ai-agent.html)
- [让 AI 理解你的组件库：新一代智能 D2C架构 — 基于 AWS Kiro MCP Skills 的智能转换实践 | 亚马逊AWS官方博客](../ch03/069-skills.html)
- [AgentCore Managed Harness](ch04/470-amazon-bedrock-agentcore-harness-ga-api-agent.html)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch04/368-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](../ch11/156-aws-devops-agent.html)
- [OpenClaw多租户迁移: Phase 2&3部署](../ch11/214-openclaw.html)
- [OpenClaw多租户迁移: 背景与架构概览](../ch11/214-openclaw.html)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](../ch11/214-openclaw.html)
- [Amazon Bedrock模型推理的Serverless异步架构](../ch11/152-amazon-bedrock.html)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch04/059-real-time-voice-agents-with-stream-vision-agents-and-amazon.html)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](../ch11/128-control-where-your-ai-agents-can-browse-with-chrome-enterpri.html)
- [Improve bot accuracy with Amazon Lex Assisted NLU](../ch01/650-improve-bot-accuracy-with-amazon-lex-assisted-nlu.html)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](../ch11/259-amazon-nova.html)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](../ch01/701-from-siloed-data-to-unified-insights-cross-account-athena-a.html)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](../ch11/253-bedrock.html)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch04/507-amazon-bedrock-agentcore.html)
- [AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](../ch07/043-aws-devops-agent-mcp-server.html)
- [AI Agent 工程师能力地图](ch04/291-ai-agent.html)
- [Enable Safe Agentic Payments With Built In Guardrails Using ](ch04/571-enable-safe-agentic-payments-with-built-in-guardrails-using.html)
- [让 Amazon Quick 操作飞书构建远程 Mcp 服务的设计实践](../ch11/203-amazon-quick.html)
- [Bedrock Agentcore Secrets Manager Identity](../ch11/048-bedrock-agentcore.html)
- [Extending Mcp Support For Amazon Bedrock Agentcore Gateway](../ch11/013-extending-mcp-support-for-amazon-bedrock-agentcore-gateway.html)
- [Evaluate Your Amazon Nova Sonic Voice Agent At Scale No Micr](../ch11/033-evaluate-your-amazon-nova-sonic-voice-agent-at-scale-no-mic.html)
- [Its Safe To Close Your Laptop Now Hosting Coding Agents On A](../ch09/048-coding-agent.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/292-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [Hands Free First Notice Of Loss Using Strands Agents And Ama](ch04/358-hands-free-first-notice-of-loss-using-strands-agents-and-am.html)
- [How Baz Improved Its Ai Agent Code Review Accuracy Using Ama](../ch09/143-how-baz-improved-its-ai-agent-code-review-accuracy-using-ama.html)
- [Secure Ai Agents With Policy And Lambda Interceptors In Amaz](../ch11/247-secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

