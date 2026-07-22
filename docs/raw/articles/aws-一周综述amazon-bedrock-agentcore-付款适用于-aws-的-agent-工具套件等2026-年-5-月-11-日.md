---
title: AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）
sha256: 7a59f84cf31f5f5969d7190c618d40c5beccf3cec74d0d750d75cb250db58103
type: raw-article
tags: [aws,bedrock,agentcore,ai,agent-toolkit]
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-weekly-roundup-amazon-bedrock-agentcore-payments-agent-toolkit-for-aws-and-more-may-11-2026/
url: https://aws.amazon.com/cn/blogs/china/aws-weekly-roundup-amazon-bedrock-agentcore-payments-agent-toolkit-for-aws-and-more-may-11-2026/
review_value: 8
review_confidence: 9
review_recommendation: worth-reading
review_stars: 4
ingested: 2026-05-16
---
# AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）
上周最令我振奋的消息是：[Amazon Bedrock AgentCore 预览版推出首款托管支付功能](<https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-bedrock-agentcore-payments-preview/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，使人工智能代理能够自主访问 API、MCP 服务器、Web 内容和其他代理并为其付费。该功能是与 Coinbase 和 Stripe 合作构建的，可省去为计费、凭证管理和合规性构建自定义系统的无差别繁重构建工作。  
您可以连接 Coinbase CDP 钱包或 Stripe Privy 钱包作为支付渠道，设置会话级支出限额，您的代理可以在执行过程中自主完成交易。最让我兴奋的是 AgentCore 付款可以解锁的新功能：例如调研类代理可以即时付费获取实时市场数据，编码代理可以在任务中途调用付费 API。
要了解更多信息，请访问[博客文章](<https://aws.amazon.com/blogs/machine-learning/agents-that-transact-introducing-amazon-bedrock-agentcore-payments-built-with-coinbase-and-stripe/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、通过[文档](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)进行更深入的研究，并通过 [AgentCore CLI](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-get-started-cli.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 快速上手。
**上周发布的内容**  
以下是上周引起我注意的发布内容：
  * [适用于 AWS 的代理工具套件](<https://aws.amazon.com/about-aws/whats-new/2026/05/agent-toolkit/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：一套可用于生产的工具和指南，无需额外付费，可帮助 AI 编码代理在 AWS 上构建，减少错误，降低令牌成本，同时配备企业级安全控件。适用于 AWS 的代理工具包是 [AWS Labs](<https://github.com/awslabs>) 提供的 MCP 服务器、插件与技能库的迭代升级版。要开始使用，请访问[快速入门指南](<https://docs.aws.amazon.com/agent-toolkit/latest/userguide/quick-start.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)或浏览 [GitHub](<https://github.com/aws/agent-toolkit-for-aws>) 上的可用技能和插件。
  * [AWS MCP 服务器正式发布](<https://aws.amazon.com/about-aws/whats-new/2026/05/aws-mcp-server/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：您可以使用托管式远程模型上下文协议（MCP）服务器，让人工智能代理助手能够通过一套精简、固定的工具以安全且经过身份验证的方式访问所有 AWS 服务。它是适用于 AWS 的代理工具包的一部分。要了解更多信息，请访问 [Seb Stormacq 的博客文章](<https://aws.amazon.com/blogs/aws/the-aws-mcp-server-is-now-generally-available/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。
  * [适用于人工智能代理的 Amazon WorkSpaces（预览版）](<https://aws.amazon.com/about-aws/whats-new/2026/05/workspaces-ai-agents/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：您可以使用人工智能代理，通过托管的 WorkSpaces 环境安全访问和操作桌面应用程序。此功能使组织能够大规模自动化日常工作流程，同时保持全面的企业级监管和合规性。要了解更多信息，请访问 [Micah Walter 的博客文章](<https://aws.amazon.com/blogs/aws/modernize-your-workflows-amazon-workspaces-now-gives-ai-agents-their-own-desktop-preview/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。
  * [Amazon EC2 M8idn/M8idb](<https://aws.amazon.com/about-aws/whats-new/2026/05/amazon-ec2-m8idn-m8idb/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 和 [R8idn/R8idb instances](<https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-ec2-r8idn-r8idb/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：这些实例由 AWS 专属定制的第六代英特尔至强可扩展处理器和最新的第六代 AWS Nitro 卡提供支持。相较于上一代实例，这些实例的单 vCPU 计算性能提升了高达 43%。M8idn/R8idn 实例的网络带宽高达 600Gbps，M8idb/R8idb 实例的 EBS 带宽高达 300Gbps。
有关 AWS 公告的完整列表，请关注 [AWS 最新资讯](<https://aws.amazon.com/new/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)页面。
**其他更新**  
以下是您可能会感兴趣的一些其他新闻：
  * [Valkey 迎来两周年](<https://aws.amazon.com/blogs/database/valkey-turns-two/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：Valkey 印证了开源社区驱动技术的优势：相比单一供应商模式，创新速度更快、扩展能力更强、价值产出更高。Valkey 的 Docker 拉取量已超 1 亿次（同比增长 17 倍），吸引了超过 225 名贡献者提交 1500 多项拉取请求，同期开发速度大约是 Redis 的两倍。您还可以[在 Amazon ElastiCache 中使用最新的 Valkey 9.0](<https://aws.amazon.com/blogs/database/announcing-valkey-9-0-for-amazon-elasticache/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。
  * [通过 SQL 查询十亿级向量数据](<https://aws.amazon.com/blogs/database/query-billion-scale-vectors-with-sql-integrating-amazon-s3-vectors-and-aurora-postgresql/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：您可以了解如何使用标准 SQL，在 Amazon Aurora PostgreSQL 兼容版中查询 Amazon S3 Vectors，在单条 SQL 语句中实现向量相似度检索与关系型筛选的组合查询，例如一次性筛选语义相似度最高的商品，并按价格、库存状态或租户进行筛选。
  * [使用 AWS DevOps 代理构建端到端代理 SRE](<https://aws.amazon.com/blogs/devops/building-an-end-to-end-agentic-sre-using-aws-devops-agent/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)：学习如何配置定义调查范围的 DevOps 代理空间，与 Amazon CloudWatch、Splunk、GitHub 和 Slack 无缝集成。您还可以学习如何通过 Webhook 触发自动调查、生成缓解计划，以及如何将代理就绪规范交付至 Kiro 等编码代理进行实施。
要获取 AWS 博客文章的完整列表，请务必关注 [AWS Blog](<https://aws.amazon.com/blogs/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 页面。
了解有关 AWS 的更多信息，浏览并参加即将举行的 [AWS 主办的现场活动和虚拟活动](<https://aws.amazon.com/events/explore-aws-events/?refid=e61dee65-4ce8-4738-84db-75305c9cd4fe>)、[初创企业活动](<https://aws.amazon.com/startups/events?tab=upcoming?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、[以开发人员为中心的活动](<https://builder.aws.com/connect/events?trk=e61dee65-4ce8-4738-84db-75305c9cd4fe&sc_channel=el>)，以及 [AWS Summit](<https://aws.amazon.com/events/summits/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 和 [AWS Community Day](<https://aws.amazon.com/events/community-day/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。加入 [AWS 构建者中心](<https://builder.aws.com/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，与构建者建立联系、分享解决方案并获取支持您的开发工作的内容。
以上就是本周的全部内容。欢迎下周一继续查看新的[一周综述](<https://aws.amazon.com/blogs/aws/tag/week-in-review/?trk=39d9c26c-b157-46ae-bde6-9cf598f5c9e0&sc_channel=el>)！
— [Channy](<https://linkedin.com/in/channy/>)