---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task
ingested: 2026-06-07
feed_name: AWS China Blog
source_published: 2026-06-04
sha256: 83cd92f928230ac3ca5ed5821f8bfef120a57e59868d4b504515f448d7194924
---

# 构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务

摘要：AI 编程助手如 Kiro CLI 能力日益强大，但使用场景局限于开发者本地终端。本文介绍 Kiro Job Scheduler——一个完全基于 AWS 无服务器架构的 AI 任务调度平台。它让团队中的任何人（包括非技术人员）都能通过 Web 界面配置定时 AI 任务：自定义 Agent 角色、挂载 MCP 工具服务器、编排 Skills 技能包，实现从「每日新闻摘要」到「定期代码审计」的各类自动化场景。任务结果自动推送到飞书或 Telegram，真正实现 AI 助手的 7×24 小时无人值守运行。

**目录**

01 一、背景：从交互式到自动化

02 二、平台能力概览

03 三、核心功能：自定义 Agent + MCP + Skills

04 四、整体架构

05 五、业务价值：让非技术人员也能驾驭 AI 自动化

06 六、部署与快速开始

07 七、安全设计

08 八、扩展方向

09 九、结论

10 十、参考链接

* * *

## **一、背景：从交互式到自动化**

Kiro 是 AWS 推出的下一代 AI 编程助手，提供 IDE 与 CLI 两种形态。它在大模型之上构建了一套高度可扩展的 Agent 框架：通过 Steering 文件定义 Agent 的角色与行为准则，通过 Skills 注入领域知识，通过 MCP（Model Context Protocol） Server 接入任意外部工具。开发者既可以在本地用 Kiro 完成代码生成、架构分析、信息检索等交互式任务，也可以把这一整套能力打包成自定义 Agent，部署到无人值守的运行环境中，让它作为一个 autonomous agent 7×24 小时执行结构化任务。

在实际工作中，许多 AI 任务具有明显的重复性和定时性：

  * 每天早上搜索 AWS 新发布的服务和功能，整理成中文日报
  * 每周分析代码仓库的技术债务，生成改进建议
  * 每日监控竞品动态，汇总关键信息推送到团队群
  * 定期检查基础设施配置，输出合规报告



这些任务的共同特点是：内容模板化、需要定时执行、执行时间较长、结果需要主动推送。Kiro Job Scheduler 正是为解决这类需求而生——让 AI 助手像 cron job 一样 7×24 小时自动运行。

## **二、平台能力概览**

Kiro Job Scheduler 提供完整的 Web 控制台，核心能力包括：

  * Agent 管理：创建自定义 AI Agent，定义角色、行为和工具权限
  * Skills 管理：编写和管理可复用的技能包（Skill），赋予 Agent 专业能力
  * MCP Server 管理：配置外部工具服务器（如 web-search、数据库查询），扩展 Agent 的行动能力
  * Job 调度：通过 cron 表达式配置定时任务，支持时区、手动触发、执行历史查看
  * 多渠道通知：任务完成后自动推送结果到飞书、Telegram 等 IM 工具
  * 执行监控：查看每次执行的状态、输出、耗时，支持失败重试



## **三、核心功能：自定义 Agent + MCP + Skills**

这是 Kiro Job Scheduler 区别于简单 cron 调度的核心价值——用户可以像搭积木一样组装 AI Agent 的能力。

### 3.1 自定义 Agent：定义 AI 的角色和行为

每个 Agent 是一个独立的 AI 角色配置，包含：

  * System Prompt：定义 Agent 的身份、行为准则和输出格式
  * 工具权限：控制 Agent 可以使用哪些工具（文件读写、Shell 执行、网络请求等）
  * 关联 Skills：赋予 Agent 特定领域的专业知识
  * 关联 MCP Servers：让 Agent 能够调用外部服务和 API

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/04/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task-1.png>) [图1 Kiro Scheduler 自定义agent]  
---  
  
### 3.2 MCP Server：扩展 Agent 的行动边界

MCP（Model Context Protocol）Server 是 AI Agent 调用外部工具的标准协议。通过配置 MCP Server，Agent 可以：

  * 搜索互联网：接入 web-search MCP Server，获取实时信息
  * 查询数据库：接入数据库 MCP Server，执行 SQL 查询
  * 操作 AWS 服务：接入 AWS MCP Server，管理云资源
  * 调用内部 API：接入自定义 MCP Server，对接企业内部系统



平台支持两种 MCP Server 类型：

  * stdio 模式：本地命令行工具（如 npx -y @anthropic/web-search-mcp）
  * HTTP 模式：远程 HTTP 服务（适合团队共享的工具服务）



### 3.3 Skills：可复用的专业知识包

Skills 是 Agent 的「知识库」，以 Markdown 格式编写，定义特定领域的专业指导。例如：

  * 代码审计 Skill：定义审计标准、检查清单、输出格式
  * 内容营销 Skill：定义品牌语调、受众画像、内容策略
  * 运维巡检 Skill：定义检查项、告警阈值、报告模板



Skills 的价值在于知识复用——一次编写，多个 Agent 和 Job 共享使用。团队的最佳实践可以沉淀为 Skills，新成员无需从零学习。

### 3.4 组合示例：从配置到自动化

以「每日竞品监控」为例，完整配置流程：

  1. 创建 Skill「competitive-analysis」：定义监控维度（产品更新、定价变化、市场动态）和输出格式
  2. 配置 MCP Server「web-search」：提供互联网搜索能力
  3. 创建 Agent「CompetitorWatcher」：关联上述 Skill 和 MCP Server，设置 prompt 指定监控的竞品列表
  4. 创建 Job：cron 设为每天 8:00 AM，关联 Agent，配置飞书通知渠道



配置完成后，系统每天自动执行，搜索竞品动态，按照 Skill 定义的格式整理报告，推送到团队飞书群。

在每次任务触发时，Dispatcher Lambda 会把上述 Skill、MCP Server 配置和 Agent prompt 组装成一份标准的 Kiro Agent JSON，写入容器内的 /tmp/.kiro/agents/job-agent.json，然后由 entrypoint 调起 Kiro CLI 以非交互模式执行：
    
    
    // /tmp/.kiro/agents/job-agent.json（自动生成）
    {
      "name": "job-agent",
      "description": "Daily competitive intelligence watcher",
      "prompt": "你是一名竞品研究员，每天扫描以下竞品列表 ...（用户在 Web 表单里填写的 system prompt）",
      "tools": ["*"],
      "allowedTools": ["*"],
      "resources": ["skill://.kiro/skills/competitive-analysis/SKILL.md"],
      "mcpServers": {
        "web-search": { "command": "npx", "args": ["-y", "@anthropic/web-search-mcp"] }
      }
    }

容器内的实际调用命令是：
    
    
    kiro-cli chat --no-interactive --trust-all-tools --agent job-agent "<prompt>"
    

`--no-interactive` 让 Kiro 一次性执行完 prompt 即退出（不进入 REPL），`--trust-all-tools` 跳过容器内交互式确认，`--agent` 指向上面那份 Agent JSON。容器执行结束后即被销毁，全程不持有任何长期凭证。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/04/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task-2.png>) [图2 Kiro Scheduler 配置API Key和通知渠道]  
---  
  
任务执行完成后，结果推送到飞书/Lark和Telegram的效果图如下：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/04/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task-3.png>) [图3 飞书/Lark群消息推送]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/04/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task-4.png>) [图4 Telegram Bot消息推送]  
---  
  
## **四、整体架构**

Kiro Job Scheduler 采用完全无服务器的三层架构，按需付费，无需运维：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/04/platform-kiro-cli-eventbridge-ecs-fargate-implement-ai-task-5.png>) [图5 Kiro Scheduler 架构图]  
---  
  
### 4.1 调度层：EventBridge Scheduler

每个 Job 对应一个 EventBridge Schedule，支持标准 cron 表达式和时区配置。Schedule 到期时异步调用 Dispatcher Lambda，内置重试机制确保可靠触发。

### 4.2 编排层：Dispatcher Lambda

Dispatcher 是系统的核心编排器，负责从 DynamoDB 读取 Job、Agent、Skills、MCP Servers 配置，组装完整的运行环境，然后启动 ECS Fargate 容器执行任务。

### 4.3 执行层：ECS Fargate

每个任务在独立的 Fargate 容器中运行，容器内预装 Kiro CLI。容器启动时自动加载 Agent 配置和 Skills，执行完成后将结果上传到 S3 并通过 SNS 发送通知。容器用完即销毁，按秒计费。

### 4.4 通知层：SNS + Lambda

SNS Topic 作为通知总线，下游挂载飞书和 Telegram 通知 Lambda。新增通知渠道只需添加新的 Lambda 订阅者，无需修改核心逻辑。

## **五、业务价值：让非技术人员也能驾驭 AI 自动化**

Kiro Job Scheduler 的设计理念是降低 AI 自动化的使用门槛。通过 Web 控制台的可视化配置，非技术人员也能创建和管理 AI 任务：

### 5.1 零代码配置

所有配置通过 Web 表单完成，无需编写代码或操作命令行：Agent 的 prompt 用自然语言描述即可，MCP Server 从预置列表中选择，Cron 表达式提供可视化选择器，通知渠道一键关联——整个流程不写一行代码、不碰一次命令行。

### 5.2 团队协作

平台天然支持团队协作场景：

  * 技术人员创建高质量的 Agent 和 Skills，沉淀团队最佳实践
  * 业务人员基于现有 Agent 创建定时任务，无需理解底层技术
  * 运营人员通过 IM 通知实时获取任务结果，融入现有工作流



### 5.3 成本可控

完全按需付费的无服务器架构：

  * 无任务运行时零成本（无常驻服务器）
  * ECS Fargate 按容器运行秒数计费
  * DynamoDB 按请求计费
  * 典型场景（每天 5 个任务，每个运行 3 分钟）月成本不到 $5



## **六、部署与快速开始**

项目同时提供 Terraform 和 [AWS CDK](<https://aws.amazon.com/cn/cdk/>) 两种部署方式：
    
    
    # Clone 项目 
    git clone https://github.com/jeremyluojl/kiro-job-scheduler 
    cd kiro-job-scheduler/terraform  # 一键部署（Terraform 方式） 
    cp terraform.tfvars.example terraform.tfvars # 编辑terraform.tfvars填入region 
    ./deploy.sh
    

部署完成后，访问 CloudFront 域名即可使用 Web 控制台。首次使用需注册账号，然后：

  1. 配置 Kiro API Key和通知渠道（Settings 页面）
  2. 创建 Agent（可选：关联 Skills 和 MCP Servers）
  3. 创建 Job（选择 Agent、设置 cron）
  4. 等待定时触发，或手动点击 Run Now 测试



## **七、安全设计**

平台在设计之初就将安全性作为一等公民，从身份认证到数据存储、从网络隔离到密钥管理，各层均采用 AWS 原生安全能力加固：

  * 用户隔离：所有数据按 userId 隔离，用户只能访问自己的资源
  * API Key 安全：Kiro API Key 存储在 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>)，运行时注入容器，不落盘不明文传输
  * 数据加密：DynamoDB 和 S3 使用 KMS 客户管理密钥加密
  * 网络隔离：ECS 容器仅允许 HTTPS 出站，无入站规则
  * 认证授权：Web 控制台和 API 通过 [Amazon Cognito](<https://aws.amazon.com/cn/cognito/>) JWT 保护
  * 注册管控：Pre-signup Lambda 可限制注册邮箱域名



## **八、扩展方向**

当前版本已满足个人和小团队的核心调度需求，后续计划在以下方向持续演进：

  * 团队/组织级多租户：支持团队共享 Agent 和 Skills
  * 任务依赖编排：DAG 式任务链，前置任务输出作为下游输入
  * 执行日志实时查看：WebSocket 推送执行过程
  * 模板市场：社区共享高质量 Agent + Skills 模板
  * 更多通知渠道：企业微信、Slack、邮件等
  * IM 触发：在飞书机器人 / Slack 中通过指令直接触发已有 Job、查询执行状态，甚至发送一次性 prompt，让 IM 既是结果消费方也是任务入口
  * 成本优化：Fargate Spot 降低非关键任务执行成本



## **九、结论**

Kiro Job Scheduler 通过 EventBridge Scheduler + Lambda + ECS Fargate 的无服务器架构，将 Kiro CLI 从交互式工具转变为可定时调度的自动化平台。其核心价值在于：

  * 灵活的 Agent 编排：自定义 Agent + MCP Server + Skills 的组合，覆盖从信息检索到代码分析的各类场景
  * 低门槛使用：Web 控制台可视化配置，非技术人员也能创建 AI 自动化任务
  * 生产级可靠性：无服务器架构、自动重试、多渠道通知、完整的执行历史
  * 成本友好：按需付费，无任务时零成本



项目完全开源，提供 Terraform 和 CDK 双部署方式。无论是个人开发者的效率工具，还是团队级的 AI 自动化平台，都能快速落地。

**下一步行动：**

**相关产品：**

  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=1>) — 完全托管的容器编排服务
  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=2>) — 适用于容器的无服务器计算
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3>) — 无需服务器即可运行代码
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=4>) — 大规模构建事件驱动应用程序
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=5>) — 发布/订阅和推送通知



**相关文章：**

  * [用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例](<https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=1>)
  * [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台](<https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/?p=bl_ar_l=2>)
  * [一种基于Web访问的Kiro CLI 共享访问实现](<https://aws.amazon.com/cn/blogs/china/based-on-web-kiro-cli-share-implement/?p=bl_ar_l=3>)
  * [当 Kiro 遇上 OpenClaw：AI Agent 双向协作的实践探索](<https://aws.amazon.com/cn/blogs/china/kiro-openclaw-ai-agent-practice-explore/?p=bl_ar_l=4>)
  * [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](<https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=5>)



## **十、参考链接**

  * [Kiro Job Scheduler 项目](<https://github.com/jeremyluojl/kiro-job-scheduler>)
  * [Kiro CLI](<https://kiro.dev>)
  * [Amazon EventBridge Scheduler](<https://docs.aws.amazon.com/scheduler/>)
  * [Amazon ECS Fargate](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>)
  * [Model Context Protocol (MCP)](<https://modelcontextprotocol.io>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 罗建霖

亚马逊云科技解决方案架构师，负责基于亚马逊云科技云计算方案架构的咨询和设计。

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
