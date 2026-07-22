# 构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务

## Ch11.025 构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务

> 📊 Level ⭐⭐ | 17.0KB | `entities/kiro-job-scheduler-eventbridge-ecs-fargate.md`

# 构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md)

> **Core insight**: Kiro Job Scheduler 通过 EventBridge Scheduler 触发 Lambda 编排器，由 ECS Fargate 容器执行 Kiro CLI 非交互式任务，实现 AI 助手的 7×24 小时无人值守运行。核心创新在于将 Kiro 的 Steering 文件定义的 Agent 角色、MCP Server 工具扩展和 Skills 知识包组合成标准化 JSON 配置，通过容器化执行实现可复用的 AI 自动化工作流。

## 背景：从交互式到自动化

Kiro 是 AWS 推出的 AI 编程助手，提供 IDE 和 CLI 两种形态。它在大模型之上构建了一套高度可扩展的 Agent 框架：通过 Steering 文件定义 Agent 的角色与行为准则，通过 Skills 注入领域知识，通过 MCP（Model Context Protocol）Server 接入外部工具。实际工作中，许多 AI 任务具有重复性和定时性特征——每日新闻摘要、定期代码审计、竞品动态监控、基础设施合规检查——这类需求催生了将 Kiro 能力从本地终端延伸到无人值守运行环境的需求。

## 三层无服务器架构

Kiro Job Scheduler 采用完全无服务器的三层架构，按需付费无需运维。**调度层**使用 EventBridge Scheduler，每个 Job 对应一个 Schedule，支持标准 cron 表达式和时区配置，到期时异步调用 Dispatcher Lambda，内置重试机制确保可靠触发。**编排层**由 Dispatcher Lambda 负责从 DynamoDB 读取 Job、Agent、Skills、MCP Servers 配置，组装完整运行环境，然后启动 ECS Fargate 容器执行任务。**执行层**每个任务在独立 Fargate 容器中运行，容器内预装 Kiro CLI，执行完成后将结果上传 S3 并通过 SNS 发送通知，容器用完即销毁按秒计费。

## 核心能力：自定义 Agent + MCP Server + Skills

这是 Kiro Job Scheduler 区别于简单 cron 调度的核心价值——用户可以像搭积木一样组装 AI Agent 能力。**自定义 Agent** 包含 System Prompt（定义身份、行为准则和输出格式）、工具权限（控制文件读写、Shell 执行、网络请求等）、关联 Skills（赋予特定领域专业知识）和关联 MCP Servers（调用外部服务和 API）。**MCP Server** 支持 stdio 模式（本地命令行工具如 npx -y @anthropic/web-search-mcp）和 HTTP 模式（远程服务，适合团队共享）。**Skills** 以 Markdown 格式编写，定义特定领域的专业指导——代码审计 Skill 定义审计标准和检查清单、内容营销 Skill 定义品牌语调等，一次编写可被多个 Agent 和 Job 共享。

## Kiro CLI 非交互模式执行机制

任务触发时，Dispatcher Lambda 将 Skill、MCP Server 配置和 Agent prompt 组装成标准 Kiro Agent JSON，写入容器内的 /tmp/.kiro/agents/job-agent.json，然后调起 Kiro CLI 以非交互模式执行：`kiro-cli chat --no-interactive --trust-all-tools --agent job-agent "<prompt>"`。其中 --no-interactive 让 Kiro 一次性执行完 prompt 即退出（不进入 REPL），--trust-all-tools 跳过容器内交互式确认，--agent 指向上述 Agent JSON。容器执行结束后即被销毁，全程不持有任何长期凭证。

## 安全设计

平台在设计之初即将安全性作为一等公民。**用户隔离**：所有数据按 userId 隔离，用户只能访问自己的资源。**API Key 安全**：Kiro API Key 存储在 AWS Secrets Manager，运行时注入容器，不落盘不明文传输。**数据加密**：DynamoDB 和 S3 使用 KMS 客户管理密钥加密。**网络隔离**：ECS 容器仅允许 HTTPS 出站，无入站规则。**认证授权**：Web 控制台和 API 通过 Amazon Cognito JWT 保护，Pre-signup Lambda 可限制注册邮箱域名。

## 成本分析

完全按需付费的无服务器架构带来极低成本：无常驻服务器意味着无任务运行时零成本；ECS Fargate 按容器运行秒数计费；DynamoDB 按请求计费。典型场景（每天 5 个任务，每个运行 3 分钟）月成本不到 $5。

## 关键数据/实践启示

- **EventBridge Scheduler 驱动**：每个 Job 对应一个 Schedule，支持标准 cron + 时区配置，内置重试确保可靠触发
- **Agent JSON 组装**：Dispatcher Lambda 动态组装 /tmp/.kiro/agents/job-agent.json，实现 Skill + MCP + Prompt 的可复用配置
- **MCP 协议双模式**：stdio 模式支持本地工具（如 web-search MCP），HTTP 模式支持团队共享远程服务
- **Secrets Manager 集成**：Kiro API Key 运行时从 Secrets Manager 注入，容器内不明文存储
- **典型月成本 < $5**：每天 5 任务 × 3 分钟运行的低成本估算
- **部署方式**：Terraform 和 CDK 双部署方式，一键部署脚本

## 深度分析

### 架构分层解耦的无服务器设计哲学

Kiro Job Scheduler 的三层架构体现了无服务器设计的核心哲学——每层职责单一、边界清晰、独立扩展。调度层（EventBridge Scheduler）负责可靠触发，不参与业务逻辑；编排层（Dispatcher Lambda）处理配置读取和容器启动，纯计算无状态；执行层（ECS Fargate）运行实际工作负载，按需启停。这种分层带来的实际价值是故障隔离——调度层的重试不会干扰执行层的容器生命周期，而执行层的容器崩溃也不会蔓延至调度可靠性。

从运维角度看，三层解耦意味着独立迭代成为可能。调度规则变更不需要重新部署执行容器，Agent 配置更新不需要触碰 EventBridge 的触发逻辑，容器镜像升级也不会影响已有的定时配置。这种松耦合在团队规模扩大后尤为重要——不同技能栈的工程师可以并行工作在各自负责的层次上，而无需担心跨层集成带来的回归风险。

### MCP 协议：AI Agent 工具扩展的标准接口

MCP（Model Context Protocol）在该架构中承担了关键的基础设施角色——它将 AI Agent 与外部工具之间的集成从硬编码调用转变为协议驱动的可插拔架构。通过 stdio 模式和 HTTP 模式的双重支持，平台在本地工具的快速迭代与远程服务的团队共享之间取得了平衡。

MCP 的协议化设计带来的深层价值是工具的可发现性和组合性。当 Agent JSON 中的 mcpServers 配置可以动态组装时，同一个 web-search MCP Server 可以被多个 Agent 复用，而新增工具只需在配置中声明而不需要修改 Kiro CLI 本身。这种设计思维与容器化的理念一脉相承——通过标准接口实现关注点分离，让工具的生产者和消费者可以独立演进。

### 无服务器成本模型对 AI 任务的适配性

传统 AI 任务部署面临的核心矛盾是：AI  workloads 具有明显的波峰波谷特征，但预留的计算资源必须为峰值付费。无服务器架构通过 ECS Fargate 的按秒计费和 EventBridge Scheduler 的按调度次数计费，将这一矛盾转化为天然的成本优化。每个任务触发时才启动容器，执行完毕即刻销毁——这意味着即使每天运行 100 个任务，总计 300 分钟的容器运行时间，也仅需为这 300 分钟付费。

该架构的隐性成本优势还包括免去了运维人员的 on-call 成本和预留容量的资源浪费。在传统 ECS 集群模式下，即使没有任务运行，集群管理面和控制平面仍然持续消耗成本；而 Fargate 的完全托管特性将这部分固定成本转化为了零——当没有容器运行时，控制平面的开销由 AWS 承担。这种成本结构的转变使得 AI 自动化的入门门槛大幅降低，小团队甚至个人开发者也能以可承受的成本运行生产级的 AI 定时任务。

### 从交互式工具到 Autonomous Agent 的范式转移

Kiro Job Scheduler 实现的不仅是一个调度功能，更是一种范式转移——将 AI 能力从「人在回路中」的交互模式转变为「人在回路外」的 autonomous 模式。在传统的 CLI 使用场景中，开发者始终作为决策者和审批者存在，AI 扮演的是高级自动补全的角色；而在定时调度场景下，AI Agent 独立承担完整的任务闭环，从触发、执行到结果推送都不需要人工干预。

这一转变对 AI 系统的设计提出了不同的要求。交互式场景下，AI 可以通过多轮对话澄清需求、请求确认、逐步执行；而在 autonomous 场景下，System Prompt 必须足够完整以消除歧义，工具权限必须一次性授予而非逐次确认，输出格式必须结构化以便于自动化处理。Kiro 的 Steering 文件机制——通过 JSON 配置定义 Agent 身份、工具权限和知识边界——正是为这一场景设计的。Skills 作为知识包的抽象，使得同一套专业知识可以被不同的 Agent 和 Job 复用，进一步强化了 autonomous 模式下知识复用的效率。

### 纵深防御的安全架构

Kiro Job Scheduler 在安全设计上体现了纵深防御的原则——每一层都假设其他层可能失效，因此每层都需要独立的安全加固。数据层通过 DynamoDB 的 item 级 userId 隔离确保用户间访问隔离，网络层通过 ECS 容器的出站 HTTPS 限制防止数据外泄，凭证层通过 Secrets Manager 的运行时注入避免静态密钥落盘，应用层通过 Cognito JWT 保护 API 访问。

值得注意的是，容器执行结束后即销毁的设计意味着一旦容器进程退出，任何潜在的运行时攻击都无法持久化。这意味着即使容器内的 Kiro CLI 存在安全漏洞，攻击者也无法在销毁后的容器中建立持久据点。这种「用完即焚」的设计哲学将容器生命周期的短暂性从成本优势转化为安全优势，是无服务器架构在安全领域的额外收益。

## 实践启示

### 为不同类型的 AI 任务设计差异化的执行超时策略

EventBridge Scheduler 的最大调度窗口和 ECS Fargate 的任务超时设置需要根据任务类型进行差异化配置。信息检索类任务（如竞品监控、新闻摘要）通常在 2-3 分钟内完成，适合设置较短的超时以加快重试周期；代码分析和生成类任务可能需要更长的执行时间，应适当延长超时并配置渐进式重试。对于需要访问外部 API 的任务，还应考虑添加任务级别的超时重试机制，避免单次 API 超时导致整个任务失败。

### 构建可组合的 MCP Server 资产库

建议在团队内部建立 MCP Server 资产库，将常用的外部工具集成封装为标准化的 MCP Server 配置。stdio 模式的 MCP Server 适合个人或小团队快速迭代的工具（如定制化的数据抓取脚本），而 HTTP 模式的 MCP Server 适合作为团队共享的服务（如企业数据库查询、内部 API 调用）。通过将 MCP Server 配置版本化并纳入资产库管理，新 Agent 的接入周期可以从手工配置转变为配置引用，大幅提升团队协作效率。

### 利用 Skills 的版本化管理实现 Agent 能力演进

Skills 作为 Markdown 编写的知识包，适合纳入版本化管理。当代码审计标准更新时，只需更新 Skill 文件并发布新版本，所有引用该 Skill 的 Agent 和 Job 自动获得最新标准。建议为每个 Skill 维护变更日志，记录每次更新的内容和对 Agent 行为的影响，便于追溯和回滚。Skills 的模块化设计还支持按场景组合——将通用的基础 Skill（如输出格式规范）与领域特定的 Skill（如代码审计标准）分离，实现跨团队的复用。

### 设计任务结果的结构化输出格式

Kiro CLI 的非交互模式意味着结果完全由输出内容决定。建议在创建 Agent 时明确指定输出的结构化格式（如 JSON Schema 或 Markdown 表格），并将格式要求写入 System Prompt。结果的结构化直接影响通知的可读性和后续自动化处理的可行性——飞书或 Telegram 推送的消息需要兼顾人类阅读和程序解析，这要求在 Skills 中明确定义输出模板。

### 建立成本监控和异常告警机制

虽然典型场景的月成本不到 $5，但在生产环境中仍需建立成本监控机制。建议为 SNS 通知添加成本相关的 Lambda 订阅者，当单个账户的日均调度次数或容器运行时长异常增加时触发告警。同时，EventBridge Scheduler 的内置重试机制虽然提高了可靠性，但也可能导致单个失败任务触发多次容器启动——应通过 Dispatcher Lambda 的幂等性设计确保重试不会产生重复成本。

## 架构图
→ [C4 架构图](assets/c4/kiro-job-scheduler-eventbridge-ecs-fargate-c4.html)

## 相关实体
- [基于 Amazon Ecs Fargate 自建 Keycloak 作为 Aws Iam Identity Center](https://github.com/QianJinGuo/wiki/blob/main/entities/基于-amazon-ecs-fargate-自建-keycloak-作为-aws-iam-identity-center.md)
- [Using Kiro Cli Agent Client Protocol Build Ai Chat](../ch03/046-agent.html)
- [From Manual To Smart Use Kiro Cli Opensearch Mcp To Make Everyone An Opensearch Expert](https://github.com/QianJinGuo/wiki/blob/main/entities/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert.md)
- [Ai Network Claude Code Kiro Cli Implement Aws Ipsec Vpn](../ch03/076-claude-code.html)
- [Kiro Cli Fluentbit Logging Solution Eks S3 Parquet Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison.md)

## 相关引用
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md)

---

