---
tags: [wechat, article, claude, openai]
title: "runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics"
url: https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/
source: rss
feed_name: AWS China Blog
sha256: 6b0b984a241b89c4c3e68d88d70163d440bdc8f9a0d35bee23c7b05a32ffdceb
---
基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力 | 亚马逊AWS官方博客
Skip to Main Content
想了解专为中国区域提供的云产品？请访问
www.amazonaws.cn
。申请中国区域免费套餐请访问
www.amazonaws.cn/free
。
AWS Blog
首页
博客
版本
亚马逊AWS官方博客
基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力
摘要：基于AgentCore部署Doris MCP，实现自然语言数据分析
目录
01
一、背景与需求
02
二、为什么选择 Amazon Bedrock AgentCore Runtime
03
三、整体功能说明
04
四、总体架构
05
五、核心功能模块
06
六、Amazon Quick Suite 接入配置
07
七、成本分析：Pay as You Go 的真实账单
08
八、相关链接
一、背景与需求
在企业数据分析的真实场景中，业务人员希望”用自然语言就能查数据、看趋势、做归因”，而不是每次都去找数据工程师、打开 BI 工具、或者写 SQL。随着 Model Context Protocol（MCP）生态的成熟，这种”让大模型直接对接企业数据源”的技术路径正在逐步落地。MCP 是 Anthropic 提出、并被 Amazon Q、Kiro、Cursor、Amazon Quick Suite 等主流 AI 产品广泛采纳的开放协议，它定义了大模型如何以标准方式调用外部工具、访问外部数据。Apache Doris 作为国内广泛使用的高性能实时分析型 MDBMS（MPP 列存数据库），其社区维护的 `apache/doris-mcp-server` 项目提供了 25 个覆盖 SQL 执行、元数据查询、查询分析、集群监控、数据治理的原生工具集，是目前最权威的 Doris MCP 实现。然而，若希望将这套能力接入 Quick Suite 等 SaaS 化 AI 平台，或者让分布在不同办公网络中的业务用户都能使用，传统的本地 stdio 模式就显得捉襟见肘：
部署形态受限：原生 `doris-mcp-server` 是一个有状态的 Python 应用，内部维护着 aiomysql 连接池，并需要通过VPC 内网访问 Doris 的 9030 查询端口，普通的 API Gateway、Lambda 或者无状态容器都难以无缝承载。
认证体系缺失：要作为一个公网可访问的 MCP 服务暴露给多个客户端，必须有标准的 OAuth 2.0 / JWT 认证机制，而不是直接把数据库账号密码交给前端；
运维和弹性成本高：自建 ECS / EKS 集群来跑 MCP Server，需要处理镜像构建、弹性伸缩、日志采集、安全组维护等一整套问题，对于一个”轻量的工具代理层”来说过重；
协议兼容性要求：理想方案不仅要支持 Apache Doris，还应当兼容 VeloDB（Doris 商业版）的 SaaS 与 BYOC 版本，以便复用给更广的生态。
为了解决上述问题，我们将开源 `apache/doris-mcp-server` 重构适配，部署到
Amazon Bedrock AgentCore
Runtime上，让任何兼容 MCP 协议的客户端（包括 Amazon Quick Suite、Kiro IDE、Kiro CLI、Cursor 等）都能通过 HTTPS + OAuth 2.0的方式安全地远程调用 Doris。完整代码已开源：GitHub仓库：
https://github.com/lijingfz/doris-mcp-agentcore
Doris开源MCP项目：
https://github.com/apache/doris-mcp-server
二、为什么选择 Amazon Bedrock AgentCore Runtime
在评估了 API Gateway + Lambda、ECS Fargate、EKS 等多种托管形态之后，我们最终选择 Bedrock AgentCore Runtime，核心原因有四点：
原生支持有状态长连接与 Streamable HTTP：MCP 协议基于长连接会话（session），AgentCore Runtime 原生面向 Agent 类工作负载，天然支持会话隔离、上下文保持与流式响应，和 MCP 的交互模型完全匹配。
VPC 模式完整覆盖：`doris-mcp-server` 需要内网直连 Doris 的 9030（MySQL 协议）和可选的 8030（FE HTTP）、Arrow Flight SQL 端口。AgentCore Runtime 的 VPC 模式允许把 Runtime 实例挂载到指定子网和安全组中，和 Doris 处于同一个 VPC内，数据库端口无需暴露到公网，安全性由网络隔离 + 认证双重保障。
内置 OAuth 2.0 / JWT 鉴权：AgentCore Runtime 原生支持基于 OIDC Discovery URL 的 JWT 本地校验，与
Amazon Cognito
即开即用地集成，无需每次回调授权服务器，性能与安全性兼顾。
真正的 Pay as You Go：AgentCore Runtime 按调用时长计费，不调用就不产生计算费用。对于一个”只在业务人员问问题时才被触发”的数据分析 MCP 而言，这是成本最优的部署形态。后文我们会给出具体的成本测算。
三、整体功能说明
1. 原生MCP广泛兼容
服务端严格遵循 MCP规范，暴露 `initialize`、`tools/list`、`tools/call` 等标准方法。任何符合 MCP 协议的客户端都可以零代码接入：Amazon Quick Suite 只需在 MCP Actions Integration 中填入 Endpoint + Client ID + Secret + Token URL；Kiro IDE / CLI、Cursor、
Amazon Q Developer
等也都能自动发现全部 25 个工具。同时本方案可以无缝兼容 SelectDB 的 SaaS / BYOC 版本，具备良好的生态扩展性。
2. 25个工具覆盖从 SQL 到数据治理的全链路能力 `apache/doris-mcp-server` 的工具矩阵列表：
SQL 执行，`exec_query`、ADBC 高性能查询标准 SQL 查询、大结果集高效拉取。
元数据查询，`get_db_list`、库/表/列/索引/Catalog 查询，让大模型”看见”数据结构，从而生成正确 SQL。
查询分析，执行计划、Profile、审计日志，为慢查询和异常诊断提供一手证据。
集群监控，集群指标、内存、ADBC 连接状态，运维健康度自检。
数据治理，数据质量分析、列血缘、新鲜度监控、访问模式、数据流依赖、慢查询分析、资源增长预测，让 AI 具备”数据理解力”而非仅”数据访问力”。
这 25 个工具不是简单的 REST 转发，而是封装了复杂业务逻辑（如SQL解析、慢查询归因、资源增长预测）的”重工具”。这恰恰是把它放到 AgentCore Runtime 而不是 Lambda / Gateway 的根本原因——我们需要一个能承载复杂 Python 状态、能维持数据库连接池、能长时间驻留的执行环境。
3. VPC 内网直连 + OAuth 2.0，双重安全保障
Doris 的 9030 端口始终位于 VPC 私有子网内，不通过公网、不走跳板机、不经任何代理。AgentCore Runtime 与 Doris 部署在同一 VPC，通过安全组规则（出站 → Doris 私有 IP 的 9030）精确放行。外部 MCP 客户端则必须先通过 Cognito 完成 OAuth 2.0 认证，拿到 JWT 后方可调用。网络隔离 + 身份认证 构成纵深防御。
4. 一键部署、一键接入、Pay as You Go
`deploy.sh` 读取 `deploy.conf` 中的 VPC 子网、安全组、Doris 连接信息，依次执行 `agentcore configure` 和 `agentcore deploy`，代码直传 S3 部署，无需构建 Docker 镜像。整个从零到可接入 Quick Suite 的过程通常在10 分钟以内完成。后续无论是 10 个还是 100 个业务用户使用，计费都严格按照实际调用时长计算。
四、总体架构
[图1]
五、核心功能模块
1. MCP Server 代理层（`mcp_server.py`）
项目的核心入口是 `mcp_server.py`，它本身并不实现任何数据库逻辑，而是**用 FastMCP 框架注册 25 个工具函数，每个函数都作为薄代理委托给 `doris-mcp-server` 库中的 `DorisToolsManager` 执行**。这样做的好处是：
职责清晰：本项目只负责把 Doris MCP 适配到 AgentCore Runtime 的运行形态不重复造轮子；
升级友好：上游 Apache Doris 社区版本升级时，只需替换 `doris-mcp-server` 依赖版本，无需改工具实现；
利于定制：如果某个工具需要在 AgentCore 场景下有特殊行为（例如做参数清洗、加审计日志），只要在代理函数里加拦截逻辑即可。
2. 懒初始化：”启动即连库”是反模式
AgentCore Runtime 启动时会做健康检查，要求服务能快速响应 Ready；如果启动阶段就去连 Doris，一旦网络抖动或 Doris 临时不可用，Runtime 会误判为部署失败，触发回滚。为此，`mcp_server.py` 采用懒初始化（Lazy Initialization）：
模块加载阶段：只注册 25 个工具的函数签名（名字、参数、描述），不建立任何数据库连接——这一步在毫秒级完成，轻松通过健康检查；
首次工具调用时：才真正初始化 `DorisToolsManager`、建立 aiomysql 连接池、拉取 schema 元数据。
这种设计在”无服务器 + 有状态”场景下非常关键：启动要快，但状态要持久。
3. 一键部署脚本（`deploy.sh` + `deploy.conf`）
`deploy.conf` 是整个部署流程的唯一配置入口，用户只需修改 VPC 子网、安全组、Doris 连接信息、AWS 区域，就能完成部署。核心配置示例：
[图2]
`deploy.sh` 基于这份配置依次执行：`agentcore configure`，把 VPC 子网、安全组、Doris 连接信息注入 Runtime 配置。agentcore deploy`将 `mcp_server.py`、`requirements.txt` 等代码**直接上传到 S3**，AgentCore Runtime 自动在 VPC 内拉起服务——整个过程不需要用户手动构建 Docker 镜像，极大简化了交付链路。
4. Cognito OAuth 2.0 自动化（`setup_cognito.sh`）
`setup_cognito.sh` 把 Cognito 上”手动点起来会漏步骤”的整套流程脚本化：
创建 User Pool（用户池，身份主体所在）；
创建 Resource Server，定义自定义 scope `doris-mcp/invoke`，代表”调用 Doris MCP 的权限”；
创建 User Pool Domain，对外暴露 `/oauth2/token` 端点；
创建 App Client，生成 Client ID + Client Secret，启用 Client Credentials（2LO）Grant；
打印输出，Quick Suite 接入所需的三项参数（Client ID、Client Secret、Token URL） AgentCore Runtime 重新部署时需要的 OIDC Discovery URL。
有了 Discovery URL，AgentCore Runtime 就能在冷启动时一次性加载 JWKS 公钥，后续每次请求都可以**本地验证 JWT 的签名与过期时间**，完全不需要回调 Cognito，既快又省。
六、Amazon Quick Suite 接入配置
在 Amazon Quick Suite 中创建 MCP Actions Integration 时，填入以下信息即可完成接入（示例值，请替换为你自己的部署结果）：
MCP server endpoint： `https://bedrock-agentcore.ap-northeast-2.amazonaws.com/runtimes/<RUNTIME-ARN>/invocations?qualifier=DEFAULT`
Authentication ：Service authentication (2LO)
Client ID ：`3teebm18uh0eh3t0hXXXXXXX`
Client Secret： `<your-client-secret>`
Token URL ：`https://doris-mcp-ap-northeast-2-xxxxxxxxx.auth.ap-northeast-2.amazoncognito.com/oauth2/token`
保存后，Quick Suite 会自动以 Client ID + Secret 向 Token URL 换取 Access Token，并携带 Bearer Token 调用 AgentCore Runtime 的 endpoint，自动发现全部 25 个 Doris 工具。如下图所示：
[图3]
此时就可以在 Quick Suite 的自然语言会话直接交流如下：
[图4]
[图5]
[图6]
[图7]
[图8]
每一步 Quick Suite 都会自动选择合适的 MCP 工具、生成 SQL、组装结果，并在最后一步触发内置的可视化能力完成图表渲染。对业务用户而言，Doris 不再是一个需要 SQL 的数据库，而是一个能”问答”的数据助手。
七、成本分析：Pay as You Go 的真实账单
采用 AgentCore Runtime 部署后，成本模型从”包月包年固定投入”彻底切换成”按调用付费”：
典型数据分析用户**：每天进行数据查询、趋势分析、性能监控等操作，AgentCore Runtime 的计算成本约为 $0.3/人/天；
企业级场景：10 名业务人员每天各自进行若干次数据提取与分析，总成本约 $3–$6/天；
对照组：若自行搭建 Dashboard 看板 + 长期常驻的查询客户端服务，计算资源一项月成本固定，且随着并发增加近线性上升。
换句话说，对于”不是 7×24 高并发查询，而是按需使用的企业内部数据分析场景，AgentCore Runtime 的按调用计费几乎等同于”只有用的时候才花钱”，比长期常驻的服务方案在 TCO（总拥有成本）上有显著优势。
同时，这套 MCP Server 并不绑定 Quick Suite。任何符合标准 MCP 协议的客户端（例如，Kiro IDE、Kiro CLI等）都可以共享同一个部署实例、复用同一套认证与账单，进一步摊薄了固定成本。
八、相关链接
➡️ 下一步行动：
相关产品：
Amazon VPC
— 隔离云网络
Amazon Bedrock
— 用于构建生成式人工智能应用程序和代理的端到端平台
Amazon Bedrock AgentCore
— 加快代理投入生产的速度
Amazon Cognito
— 安全注册和登录
AWS Lambda
— 无需服务器即可运行代码
相关文章：
快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析
快时尚电商行业智能体设计思路与应用实践（六）借助 Amazon Bedrock AgentCore MCP Server，Amazon Bedrock，Strands Agents，Kiro 实现智能体极速研发
CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践
以Kiro快速部署云上Agent：只需几个小时，从业务需求到部署于Amazon Bedrock Agentcore落地
当 AI Agent 学会”忘记”：Amazon Bedrock AgentCore Memory 的记忆哲学”
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
本篇作者
AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用