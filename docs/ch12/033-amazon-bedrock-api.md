# 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南

## Ch12.033 别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南

> 📊 Level ⭐⭐ | 10.6KB | `entities/amazon-bedrock-api-security-guide.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/amazon-bedrock-api-security-guide.md)

## 摘要
Amazon Bedrock 模型调用安全防护指南，涵盖凭证管理、访问控制、持续监控三个层面。

## 要点
- IAM Role + AssumeRole 分层授权
- IP 限制、VPC Endpoint、SCP 组织级管控
- CloudWatch Budgets 费用告警

## 深度分析
### 凭证管理的本质：信任边界的设计
这篇文章的核心观点是"凭证泄露不等于权限泄露"——这是一个经典的纵深防御思想在云原生场景下的落地。传统 AWS 服务的安全模型建立在这样的假设上：资源的异常使用会伴随可观测的特征（如异常实例类型、CPU 飙升）。但 Bedrock 调用没有这种"副作用"——攻击者和正常用户的 API 请求在形式上完全一致，这使得传统的异常检测机制失效。
AssumeRole 分层模式的价值在于将身份认证和业务授权解耦。初始凭证（AK/SK）只能执行 AssumeRole，这意味着即使它被窃取，攻击者拿到的只是一个"半成品"——还需要通过信任策略的第二道关卡（IP 限制、时间条件等）才能获得实际的业务权限。

### Bedrock 的风险特征：为何它比 EC2/S3 更脆弱
从风险矩阵来看，Bedrock 具备三个使其成为攻击者优选目标的特征：
1. **即时变现能力**：攻击者不需要部署任何基础设施，直接调用模型能力即可转售获利。相比之下，滥用 EC2 需要"挖矿"或"肉鸡"这样的二次变现环节。
2. **无资源预置**：传统服务的攻击（如被拿来做 DDoS）需要创建大量实例，而 Bedrock 调用是纯 API 行为，无需基础设施。
3. **费用累积极快**：数小时内可能产生数万甚至数十万美元的费用，攻击窗口极短，传统的月度账单审查根本来不及反应。
这意味着安全策略必须假设"防线可能被突破"，而非单纯依赖预防。监控体系的重要性在此背景下凸显——Budgets 作为兜底防线，CloudWatch 作为近实时告警，两者结合才能覆盖不同响应时效需求。

### 访问控制的层次：从 IAM Policy 到 SCP
文章构建了三层访问控制体系：

- **第一层（IAM Policy）**：精细化权限，限制可调用的模型和 Region，避免 `bedrock:*` 的过度授权。
- **第二层（网络层）**：IP Condition 或 VPC Endpoint，从网络路径上杜绝非授权访问。
- **第三层（组织层）**：SCP 作为强制护栏，不可被成员账户的 IAM Policy 绕过。
这三层的逻辑递进关系值得关注。IAM Policy 是面向单个身份的"软限制"（可以被更宽松的策略覆盖），SCP 是面向整个组织的"硬限制"（Deny 优先）。在实际攻击场景中，如果攻击者通过某种方式获取了完整的管理员权限，IAM Policy 可能被修改，但 SCP 的 Deny 无法被覆盖——这就是"纵深"的意义。

### 监控的本质：异常识别的难点与解法
CloudWatch 指标和 CloudTrail 日志构成了监控的两条腿。CloudWatch 擅长趋势异常检测（调用量突增、Token 消耗异常），而 CloudTrail 擅长溯源分析（sourceIP、accessKeyId、userAgent、eventTime）。两者结合才能回答"发生了什么"和"是谁干的"这两个核心问题。
文章特别强调了 `sourceIPAddress` 和 `userIdentity.accessKeyId` 两个字段的价值——前者可以识别非企业 IP 段的调用，后者可以定位具体的失效凭证。这两个字段的交叉分析是快速还原攻击链路的关键。

## 实践启示
### 立即可落地的措施
1. **假设已被攻陷**：不要寄希望于"凭证永不泄露"，而是假设任何长期 AK/SK 都可能被窃取。因此，优先将所有 Bedrock 调用迁移到 IAM Role 模式，使用临时凭证。
2. **信任策略加 IP 限制**：在 AssumeRole 的信任策略中添加 `aws:SourceIp` 条件，即使初始凭证泄露，攻击者也必须从企业 IP 段发起请求才能获取临时凭证——这大幅收窄了攻击面。
3. **双重 IP 防线**：在信任策略和权限策略中同时添加 IP 限制。即使临时凭证被中途截获并传递给第三方，对方也无法从非授权 IP 发起 Bedrock 调用。
4. **VPC Endpoint 是网络层最优解**：如果工作负载在 VPC 内，优先使用 VPC Endpoint 而非公网访问。流量不经过公网，从网络路径上彻底杜绝外部未授权访问。
5. **设置 Budgets 兜底告警**：虽然费用数据有数小时延迟，但它作为"最后防线"可以防止损失无限扩大。建议为 Bedrock 设置独立预算，阈值根据业务实际用量设定。

### 架构设计建议
对于需要从外部环境调用 Bedrock 的场景，推荐 AssumeRole 分层模式：

- 初始 User/Role 仅授予 `sts:AssumeRole` 权限
- 目标 Role 承载实际 Bedrock 权限，通过信任策略限制 Assume 条件（IP、时间、MFA 等）
- 临时凭证自动过期（默认 1 小时，最长可配置 12 小时）
这种模式的核心价值在于：凭证泄露后攻击者无法直接获利，还必须完成 AssumeRole 这一第二步——这一步通常会被条件策略拦截。

### 监控体系建设优先级
短期（1 周内）：

- 确认所有 Bedrock 调用已启用 CloudTrail 日志
- 设置 CloudWatch Alarm 监控 `Invocations` 和 `TokenCount` 的突增
中期（1 个月内）：

- 部署 Budgets 独立预算监控
- 通过 Athena 查询 CloudTrail，建立异常模式分析（异常 IP、非工作时段的调用）
长期（3 个月内）：

- 考虑 SCP 组织级管控，统一所有成员账户的 Bedrock 访问路径
- 建立定期审计机制，清理未使用的 Access Key

### 常见误区
- **误区 1**：认为使用 IAM Role 就足够了，不需要额外的 IP 限制。实际上，如果初始凭证（AK/SK）泄露，攻击者仍然可以从任意 IP 调用 AssumeRole——除非信任策略中有条件限制。
- **误区 2**：依赖月度账单审查来发现异常。Bedrock 的费用累积速度使得这种方式完全失效。
- **误区 3**：使用 `bedrock:*` 的过度授权。这使得攻击者即使只获取部分权限也能调用所有模型。

## 相关
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/amazon-bedrock-api-security-guide.md)

## 相关实体
- [企业级OpenClaw安全部署架构指南 | 亚马逊AWS官方博客](ch11/209-openclaw.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch04/502-agent.md)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](ch04/150-ai.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch04/502-agent.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](ch04/502-agent.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](ch04/502-agent.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/150-ai.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch04/502-agent.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch04/150-ai.md)
- [Build financial document processing with Pulse AI and Amazon Bedrock](ch04/150-ai.md)
- [Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC](ch11/250-amazon-nova.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](ch01/529-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Autonomous Vulnerability Hunting with MCP](ch01/890-llm.md)
- [Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI](ch01/890-llm.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/250-amazon-nova.md)
- [Restrict access to sensitive documents in your Amazon Quick knowledge bases for Amazon S3](ch11/197-amazon-quick.md)
- [LLM raiders and how to repel them](ch04/150-ai.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/571-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢](ch04/150-ai.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/150-ai.md)
- [LLM raiders and how to repel them](ch04/150-ai.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch04/502-agent.md)
- [CloudSectiDbits](ch11/212-cloudsectidbits.md)
- [Schemata Dod Contractor Api Flaw Military Data Exposure](https://github.com/QianJinGuo/wiki/blob/main/entities/schemata-dod-contractor-api-flaw-military-data-exposure.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

