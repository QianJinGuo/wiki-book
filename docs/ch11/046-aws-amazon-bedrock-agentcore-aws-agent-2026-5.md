# AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）

## Ch11.046 AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）

> 📊 Level ⭐⭐ | 13.3KB | `entities/aws-一周综述amazon-bedrock-agentcore-付款适用于-aws-的-agent-工具套件等2026-年-5-月-11-日.md`

## 核心要点
- AWS 技术实践，覆盖 2026 年 5 月 5 日至 11 日这一周的重要发布
- 评分：v=8, c=9, 推荐级别 worth-reading，4 星
- 重点内容：AgentCore 支付功能预览、MCP 服务器 GA、Agent Toolkit for AWS、EC2 M8idn/R8idn 新实例
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-一周综述amazon-bedrock-agentcore-付款适用于-aws-的-agent-工具套件等2026-年-5-月-11-日.md)

## Amazon Bedrock AgentCore 付款功能
上周最令人振奋的消息是 [Amazon Bedrock AgentCore 预览版推出首款托管支付功能](https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-bedrock-agentcore-payments-preview/)，使人工智能代理能够自主访问 API、MCP 服务器、Web 内容和其他代理并为其付费。该功能是与 Coinbase 和 Stripe 合作构建的，可省去为计费、凭证管理和合规性构建自定义系统的无差别繁重构建工作。
用户可以连接 Coinbase CDP 钱包或 Stripe Privy 钱包作为支付渠道，设置会话级支出限额，代理可以在执行过程中自主完成交易。AgentCore 付款解锁的新功能场景包括：调研类代理可以即时付费获取实时市场数据，编码代理可以在任务中途调用付费 API。
这项功能的战略意义在于将 AI Agent 的能力边界从"信息获取"拓展到"金融交易"——代理不再只是读数据，而是可以真正花钱购买服务。对于需要调用付费 API（如股票数据、卫星图像、身份验证服务等）的企业场景，这意味着代理的自主性得到了质的提升。

## 上周发布的重要内容
### 适用于 AWS 的代理工具套件
[适用于 AWS 的代理工具套件](https://aws.amazon.com/about-aws/whats-new/2026/05/agent-toolkit/) 是一套可用于生产的工具和指南，无需额外付费，可帮助 AI 编码代理在 AWS 上构建，减少错误，降低令牌成本，同时配备企业级安全控件。该工具包是 AWS Labs 提供的 MCP 服务器、插件与技能库的迭代升级版。

### AWS MCP 服务器正式发布
[AWS MCP 服务器正式发布](https://aws.amazon.com/about-aws/whats-new/2026/05/aws-mcp-server/)：用户可以使用托管式远程模型上下文协议（MCP）服务器，让人智能代理助手能够通过一套精简、固定的工具以安全且经过身份验证的方式访问所有 AWS 服务。它是适用于 AWS 的代理工具包的一部分。

### 适用于人工智能代理的 Amazon WorkSpaces（预览版）
[适用于人工智能代理的 Amazon WorkSpaces（预览版）](https://aws.amazon.com/about-aws/whats-new/2026/05/workspaces-ai-agents/) 使用户可以通过人工智能代理，通过托管的 WorkSpaces 环境安全访问和操作桌面应用程序。此功能使组织能够大规模自动化日常工作流程，同时保持全面的企业级监管和合规性。

### Amazon EC2 M8idn/M8idb 和 R8idn/R8idb 实例
[Amazon EC2 M8idn/M8idb](https://aws.amazon.com/about-aws/whats-new/2026/05/amazon-ec2-m8idn-m8idb/) 和 [R8idn/R8idb instances](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-ec2-r8idn-r8idb/) 由 AWS 专属定制的第六代英特尔至强可扩展处理器和最新的第六代 AWS Nitro 卡提供支持。相较于上一代实例，这些实例的单 vCPU 计算性能提升了高达 43%。M8idn/R8idn 实例的网络带宽高达 600Gbps，M8idb/R8idb 实例的 EBS 带宽高达 300Gbps。

## 其他重要更新
### Valkey 迎来两周年
[Valkey 迎来两周年](https://aws.amazon.com/blogs/database/valkey-turns-two/)：Valkey 印证了开源社区驱动技术的优势，相比单一供应商模式，创新速度更快、扩展能力更强、价值产出更高。Valkey 的 Docker 拉取量已超 1 亿次（同比增长 17 倍），吸引了超过 225 名贡献者提交 1500 多项拉取请求，同期开发速度大约是 Redis 的两倍。用户还可以在 Amazon ElastiCache 中使用最新的 Valkey 9.0。

### 通过 SQL 查询十亿级向量数据
[通过 SQL 查询十亿级向量数据](https://aws.amazon.com/blogs/database/query-billion-scale-vectors-with-sql-integrating-amazon-s3-vectors-and-aurora-postgresql/)：了解如何使用标准 SQL 在 Amazon Aurora PostgreSQL 兼容版中查询 Amazon S3 Vectors，在单条 SQL 语句中实现向量相似度检索与关系型筛选的组合查询，例如一次性筛选语义相似度最高的商品，并按价格、库存状态或租户进行筛选。

### 使用 AWS DevOps 代理构建端到端代理 SRE
[使用 AWS DevOps 代理构建端到端代理 SRE](https://aws.amazon.com/blogs/devops/building-an-end-to-end-agentic-sre-using-aws-devops-agent/)：学习如何配置定义调查范围的 DevOps 代理空间，与 Amazon CloudWatch、Splunk、GitHub 和 Slack 无缝集成，以及如何通过 Webhook 触发自动调查、生成缓解计划，并将代理就绪规范交付至 Kiro 等编码代理进行实施。

## 深度分析
本周 AWS 的发布矩阵呈现出清晰的战略方向：**让 AI Agent 在企业环境中真正可用并可信赖**。这三个维度——自主支付、安全访问企业系统、桌面环境操作——恰好对应了 Agent 从"玩具演示"走向"生产部署"的关键障碍。
AgentCore Payments 的发布最具突破性意义。传统观点认为 AI Agent 的商业化路径需要等到"AGI 之后"，因为代理的自主性带来的风险难以控制。但 AWS 选择了一条务实路径：通过受控的支付渠道（Coinbase、Stripe）和会话级支出限额，将代理的金融行为约束在可审计和可撤销的范围内。这实际上是给代理的"钱包"加上了制度层面的安全带。
MCP 服务器的 GA 和 Agent Toolkit for AWS 形成了一对互补的组件：前者提供了标准化的工具调用协议，后者则提供了 AWS 场景下的最佳实践和预构建技能。对于正在构建内部 AI 平台的企业，这意味着不需要从零开始设计代理的工具调用逻辑和安全边界，可以直接站在 AWS 的肩膀上。
Valkey 两周年的数据值得单独关注：Docker 拉取量同比增长 17 倍、225 名贡献者、1500 多项 PR、同期开发速度约为 Redis 两倍——这组数字说明在键值存储领域，开源社区已经做出了明确的选择。Redis 转向源代码可用（source-available）协议的决定对社区忠诚度的影响正在加速显现。对于在 AWS 上运行 Redis 工作负载的团队，迁移到 ElastiCache Valkey 的动力正在积累。
EC2 M8/R8 实例的性能提升（单 vCPU 提升 43%）和带宽升级（600Gbps/300Gbps）是 AWS 在基础设施层面的常规迭代，但对于运行大规模 AI 推理工作负载的用户，高网络带宽直接决定了分布式推理的效率上限，这是值得关注的数字。

## 实践启示
对于 AI 应用开发者，AgentCore Payments 解锁的场景值得关注。调研代理即时付费获取市场数据、编码代理调用付费 API——这些不再是概念演示，而是 AWS 提供了完整后端支持的现实路径。建议评估当前工作流中是否存在被"手动付费步骤"阻塞的代理场景，这可能是最具快速价值的集成点。
对于企业 IT 和 DevOps 团队，Agent Toolkit for AWS 和 MCP 服务器的组合为在 AWS 上构建可控 AI 代理提供了完整框架。建议评估现有 MCP 服务器实现与 AWS 新方案的差异——如果当前方案缺乏企业级安全控制或 AWS 服务覆盖，迁移或并行采用新方案可能降低维护成本。
对于数据库架构师，Valkey 的增长数据和 Aurora PostgreSQL 的向量检索增强表明 AWS 正在两条线上推进数据层现代化：一条是键值存储从 Redis 向 Valkey 迁移，另一条是在关系型数据库中直接嵌入向量搜索能力。这两者结合可能意味着未来的 AI 应用数据架构不需要独立的向量数据库。
对于基础设施团队，EC2 M8/R8 实例的 43% 单 vCPU 性能提升和 600Gbps 网络带宽对运行 AI 推理和大规模分布式工作负载有直接价值。如果当前工作负载受制于计算或网络瓶颈，升级到新实例类型可能获得显著收益。评估时应结合实际 benchmark 而非理论数字。

## 相关实体
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch11/054-prowler-genai.html)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch11/245-aws-bedrock-agentcore.html)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](../ch04/523-amazon-bedrock-agentcore.html)
- [OpenClaw多租户迁移: Phase 2&3部署](ch11/225-openclaw.html)
- [AgentCore Runtime部署Apache Doris MCP Server](ch11/165-apache-doris-mcp-server-quick-suite-ai.html)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch11/245-aws-bedrock-agentcore.html)
- [OpenClaw多租户迁移: 背景与架构概览](ch11/225-openclaw.html)
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](../ch04/523-amazon-bedrock-agentcore.html)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](../ch12/034-amazon-bedrock-api.html)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/225-openclaw.html)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch11/245-aws-bedrock-agentcore.html)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/157-amazon-bedrock.html)

- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04/373-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/009-aws-bedrock.html)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch11/059-amazon-bedrock-claude-prompt-cache.html)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/157-amazon-bedrock.html)- [aws graviton5 m9g/m9gd 实例 ga 公告](../ch01/959-20.html)- [ec2 nat 实例选型与部署实践（aws 中国宁夏区域）](../ch01/959-20.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

