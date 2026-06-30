# Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore

## Ch11.128 Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 8.2KB | `entities/control-where-your-ai-agents-can-browse-with-chrome-enterprise-policies-on-amazo.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/control-where-your-ai-agents-can-browse-with-chrome-enterprise-policies-on-amazo.md)

## 核心要点
- AWS China ML 发布的技术文章，介绍 Amazon Bedrock AgentCore Browser 的 Chrome 企业策略控制能力
- 三大能力：URL 白名单/黑名单、禁用危险浏览器功能（密码管理器、下载等）、将策略管理与 Agent 开发解耦
- 支持自定义根 CA 证书，解决内部服务使用私有 PKI 的连接问题
- 架构通过 S3 存储策略 JSON + Secrets Manager 管理证书，实现声明式配置

## 深度分析
### AI Agent 浏览器控制的必要性
AI Agent 获得 web 浏览能力后，安全边界变得模糊。传统网络安全边界无法覆盖 AI Agent 的动态行为——Agent 可能根据 prompt 导航到未授权域名、在浏览器中存储凭据、或下载恶意文件。Chrome Enterprise Policies 提供了一种独立于 Agent 逻辑的防御层。

### 两层策略架构
**Managed Policies（管理策略）**：

- 存储在 S3，通过 CreateBrowser API 配置
- 映射到 Chrome 的 `/etc/chromium/policies/managed/`
- 不可被会话级设置覆盖
- 适用于安全团队定义的全局锁定策略
**Recommended Policies（推荐策略）**：

- 通过 StartBrowserSession API 在会话启动时传入
- 映射到 `/etc/chromium/policies/recommended/`
- 可作为用户偏好设置
- 当与 Managed Policy 冲突时，Managed Policy 优先
这种分层设计允许安全团队和开发团队独立运作——前者负责锁定环境，后者专注于 Agent 逻辑。

### 自定义根 CA 的实际价值
企业内部服务或 SSL 拦截代理使用的证书通常由私有 CA 签发，默认情况下浏览器不信任这些 CA。传统解决方案是禁用证书验证，但这会引入安全风险。
AgentCore 的方案是将组织根 CA 存储在 AWS Secrets Manager，引用时自动导入 Chrome 信任存储。无需修改代码或禁用验证，即可实现安全连接。

### 策略配置的工程实践
文章中的 notebook 示例展示了典型工作流：
1. 定义策略 JSON（URLBlocklist + URLAllowlist 实现白名单）
2. 存储策略文件到 S3
3. 创建 Browser 时引用 S3 位置
4. 启用会话录制用于审计
关键细节：DeveloperToolsAvailability 必须设置为 0（或省略）才能使用 Playwright/CDP 自动化——设置为 2 会禁用 CDP，导致静默失败。

## 实践启示
1. **在设计 AI Browser Agent 时，策略控制应是架构决策而非事后补丁**：在 Agent 层面限制 URL 即使被 prompt 注入绕过，浏览器层面的策略仍能提供保护。两者结合实现纵深防御。
2. **推荐使用白名单而非黑名单模式**：AI Agent 的行为空间巨大，黑名单难以覆盖所有风险场景。白名单（URLBlocklist=["*"] + URLAllowlist=[特定域名]）提供更可预测的安全边界。
3. **浏览器策略应与 CI/CD 流程集成**：策略 JSON 存储在 S3，可通过版本控制管理，配合 AWS IAM 最小权限原则，确保只有安全团队能修改策略配置。
4. **私有 PKI 场景下，Secrets Manager + AgentCore 是标准方案**：不要为了"方便"而禁用证书验证。通过组织根 CA 导入实现安全连接是正确路径，且配置一次即可在多个 Agent 间复用。
5. **会话录制是审计 AI Agent 行为的重要工具**：当 Agent 执行敏感操作时，录制的会话可用于事后分析、异常检测和合规审计。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/control-where-your-ai-agents-can-browse-with-chrome-enterprise-policies-on-amazo.md)

## 相关实体
- [AI 时代 Git 版本管理 — Agentic Coding 最佳实践](ch04/310-ai.md)
- [AI tool poisoning exposes a major flaw in enterprise agent security](ch04/310-ai.md)
- [Amazon Quick: Accelerating the path from enterprise data to AI-powered decisions](ch04/310-ai.md)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](ch04/310-ai.md)
- [AI tool poisoning exposes a major flaw in enterprise agent security | VentureBeat](ch04/310-ai.md)
- [Who Winning Enterprise AI Now](ch04/310-ai.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch04/503-agent.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-nova-manufacturing-intelligence.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/567-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/310-ai.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch04/503-agent.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch04/503-agent.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/084-aws-bedrock-serverless-async-inference-sqs-lambda.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/310-ai.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch01/380-claude.md)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/049-build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch04/503-agent.md)
- [OpenClaw多租户迁移: Phase 2&3部署](ch04/448-openclaw-multi-4.md)
- [AgentCore Runtime部署Apache Doris MCP Server](ch04/310-ai.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch04/503-agent.md)
- [OpenClaw多租户迁移: 背景与架构概览](ch04/438-openclaw-multi-1.md)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/031-amazon-bedrock-api.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch04/395-openclaw-multi-3.md)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch04/503-agent.md)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/234-bedrock.md)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](ch04/503-agent.md)
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](ch04/503-agent.md)
- [anthropic acquires stainless](ch04/487-anthropic-acquires-stainless.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

