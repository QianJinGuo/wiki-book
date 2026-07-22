---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/lambda-microvms-vs-lambda-functions-comparison
ingested: 2026-07-03
feed_name: AWS China Blog
source_published: 2026-07-02
sha256: fc28c2b2ef07efe8f018448038468d7f71d646021568713634c53702b99b2949
---

# Lambda MicroVMs vs Lambda Functions：全方位深度对比

摘要：本文从隔离级别、状态保持、启动模型、网络模型、计费对比等多个维度深入对比 Lambda MicroVMs 和 Lambda Functions，帮助架构师做出正确的技术选型。  
  
**目录**

01 一、引言：同一个产品家族，两种截然不同的问题

02 二、核心差异一览

03 三、深入分析关键差异

04 四、选择决策指南

05 五、典型架构模式

06 六、计费对比分析

07 七、迁移考虑

08 八、总结

* * *

## **一、引言：同一个产品家族，两种截然不同的问题**

一句话总结：Lambda Functions 是为事件驱动的无状态短任务而生的计算原语；Lambda MicroVMs 则是为需要 VM 级隔离、有状态长会话和完整生命周期控制的多租户代码执行场景而生的全新计算原语。两者互补，而非替代。

2026 年 6 月 22 日，AWS 正式发布了 Lambda MicroVMs——一个基于 Firecracker 虚拟化技术的全新 Serverless 计算原语。它与我们熟悉的 Lambda Functions 同属 [AWS Lambda](<https://aws.amazon.com/cn/lambda/>) 产品家族，却解决了完全不同类别的问题。

过去几年，AI 编程助手、交互式开发环境、数据分析平台、漏洞扫描器等新一代多租户应用大量涌现。这些应用有一个共同需求：为每个终端用户提供一个独立的、隔离的代码执行环境，运行应用开发者自己没有编写的代码。

传统 VM 隔离性强但启动太慢；容器启动快但共享内核带来安全隐患；Lambda Functions 则受限于 15 分钟时长和无状态模型。

Lambda MicroVMs 正是为填补这一空白而设计的。本文将从多个维度深入对比这两个计算原语，帮助你在架构设计中做出正确选择。

## **二、核心差异一览**

维度 | Lambda Functions | Lambda MicroVMs  
---|---|---  
定位 | 事件驱动的无状态计算 | 多租户隔离的有状态沙箱  
执行模型 | 请求-响应，单次调用 | 长期运行的独立 VM，支持持续交互  
最长运行时间 | 15 分钟 | 8 小时（支持挂起/恢复）  
隔离级别 | 共享内核容器（Firecracker 执行环境） | 独立 Firecracker VM，无共享内核  
状态保持 | 无状态（冷启动后环境重置） | 有状态（内存+磁盘状态跨交互保持）  
编程模型 | Handler 函数，事件触发 | 任意 HTTP 服务，Dockerfile 定义环境  
网络访问方式 | 通过 API Gateway/ALB 暴露 | 每个 VM 独立 URL，支持 HTTP/2、gRPC、WebSocket、SSE  
规格上限 | 10 GB 内存，6 vCPU | 16 vCPU，32 GB 内存，32 GB 磁盘  
计费模型 | 按请求数 + GB-秒计费 | 按 vCPU-秒 + 内存内存GB-秒 + 快照存储 + 数据传输计费  
架构支持 | x86_64 和 ARM64 | 仅 ARM64（Graviton）  
事件驱动集成 | 原生支持 200+ 事件源 | 无事件源集成，纯 HTTP 入口  
适合不可信代码 | 有限（共享内核存在攻击面） | 非常适合（VM 级隔离，每用户独立内核）  
  
## **三、深入分析关键差异**

### 3.1 隔离级别：从共享内核到独立 VM

Lambda Functions 虽然底层也使用 Firecracker，但多个函数执行环境共享同一个 MicroVM 的内核资源。这种设计在处理受信任代码时效率极高，但如果你的应用需要运行用户提交的代码或 AI 生成的代码，共享内核架构意味着攻击者可能通过内核漏洞实现逃逸。

Lambda MicroVMs 为每个会话分配一个完全独立的 Firecracker VM——独立内核、独立内存空间、独立磁盘状态。这意味着即使某个用户的代码中包含恶意内容，也无法影响其他用户的环境或底层系统。

So what：如果你的平台需要运行来源不可控的代码（用户上传的脚本、AI 生成的代码、第三方插件），MicroVMs 提供的 VM 级隔离不是”nice to have”，而是安全底线。对于漏洞扫描、AI 代理沙箱、CI/CD 流水线中执行第三方代码等场景，这种级别的隔离是刚需。

值得注意的是，MicroVMs 甚至支持在 VM 内运行 Docker 容器——你可以启用完整的 Linux capabilities，在沙箱中运行容器化工作负载，实现”VM 中的容器”这种嵌套隔离模式。

### 3.2 状态保持与生命周期控制

Lambda Functions 遵循”无状态”范式。虽然执行环境可能被复用（热启动），但你不能依赖这一行为，每次调用都应视为全新开始。这对于 API 请求处理、消息消费等场景非常理想，但对于需要跨多次交互保持状态的工作负载来说是致命限制。

Lambda MicroVMs 彻底改变了这个模型。一个 MicroVM 启动后，其内存和磁盘状态在整个会话期间持续保持。更关键的是，当用户不活跃时，MicroVM 可以自动挂起——此时计算费用停止，但完整的内存和磁盘快照被保留。当下一个请求到达时，VM 从快照恢复，所有已安装的包、加载的模型、工作文件集立即可用。

So what：这种”挂起-恢复”机制的体验非常接近笔记本电脑的”合盖-开盖”——用户感知不到中断，但你只为实际使用时间付费。对于交互式开发环境、数据科学 Notebook、AI 编程会话等场景，这个特性的价值不可估量：既保留了完整上下文，又避免了 EC2 常驻实例的闲置浪费。

### 3.3 启动模型：Image-then-Launch

Lambda Functions 的部署模型是上传代码包或容器镜像，冷启动时从头初始化运行时和用户代码。SnapStart 可以缓解 Java 等语言的初始化延迟，但仅限于特定运行时。

Lambda MicroVMs 采用全新的 Image-then-Launch 模型：你提供 Dockerfile 和代码，Lambda 构建镜像时会实际运行你的应用并对运行状态拍摄 Firecracker 快照。之后每次启动新 MicroVM 都是从这个预初始化快照恢复，而非冷启动。根据社区测试，从 `RunMicrovm` API 调用到 VM 进入 RUNNING 状态约 2 秒，应用开始响应 HTTP 请求再需约 2 秒——对于一个完整的 VM 环境来说，这个速度令人印象深刻。

So what：Image-then-Launch 意味着你可以在镜像构建阶段预装所有依赖（pip install、npm install、模型下载），这些全部被快照保存。后续启动不再重复安装，直接从”万事俱备”的状态开始服务。这让 MicroVM 的启动延迟接近容器，但隔离级别是 VM。

### 3.4 网络模型与连接方式

Lambda Functions 通过 API Gateway、ALB 或 Function URL 暴露，本质上是请求-响应模式。WebSocket 需要通过 API Gateway 的 WebSocket API 实现，增加了架构复杂度。

Lambda MicroVMs 每个实例拥有独立的 URL 端点，原生支持 HTTP/1.1、HTTP/2、gRPC、WebSocket 和 Server-Sent Events。入站连接通过 JWE 认证（`X-aws-proxy-auth` Header），通过 `CreateMicrovmAuthToken` API 获取短期令牌。你还可以通过 “Lambda Network Connector” 将 MicroVM 接入 VPC，获得对私有资源的网络访问能力。

So what：这意味着你可以直接在 MicroVM 中运行一个 WebSocket 服务器，用户通过浏览器直接与之建立长连接——无需中间层转发，延迟更低，架构更简单。对于实时协作编辑器、终端模拟器、流式 AI 对话等需要双向通信的场景，这消除了架构层的复杂度。

### 3.5 计算规格与弹性伸缩

Lambda Functions 最大支持 10 GB 内存和 6 vCPU，临时存储最大 10 GB。内存和 CPU 成固定比例分配，无法独立调整。

Lambda MicroVMs 提供最高 16 vCPU、32 GB 内存和 32 GB 磁盘的规格，且支持垂直弹性伸缩——MicroVM 运行时可自动扩展到基线配置的 4 倍资源，以应对峰值负载。这种按需扩缩的能力，结合独立的 vCPU 和内存配置，使其适合处理计算密集型任务。

## **四、选择决策指南**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/lambda-microvms-vs-lambda-functions-comparison-1.png>)  
---  
  
### 4.1 选择 Lambda Functions 的场景

简单判断：如果你的代码是自己写的、每次运行几秒到几分钟、且不需要跨调用保持状态——选 Functions。

  * 事件驱动的短任务：API 请求处理、消息队列消费、S3 事件触发、定时任务
  * 高并发无状态处理：图片缩放、数据转换、Webhook 处理
  * 与 AWS 服务深度集成：需要连接 200+ AWS 事件源的工作负载
  * 极致的成本优化：每次调用仅持续毫秒到秒级，按调用精确计费
  * 运行受信任的自有代码：不需要 VM 级隔离的内部业务逻辑



### 4.2 选择 Lambda MicroVMs 的场景

简单判断：如果你需要运行”别人的代码”或”AI 写的代码”，需要跨请求保持环境状态，或者需要超过 15 分钟的执行时间——选 MicroVMs。

  * 执行不可信代码：用户提交的代码、AI 生成的代码、第三方插件
  * 交互式长会话：AI 编程助手会话、在线 IDE、数据科学 Notebook
  * 需要 VM 级隔离的多租户场景：每租户独立环境，防止横向渗透
  * 有状态的工作负载：需要跨多次交互保持环境状态（包、模型、文件）
  * 需要长连接协议：原生 WebSocket、gRPC 流式通信、SSE 推送
  * 超过 15 分钟的任务：漏洞扫描、大规模数据处理、模型微调
  * 需要 Shell 访问：支持 PTY（/dev/ptmx），可通过 `CreateMicrovmShellAuthToken` API 获取认证令牌后通过 WebSocket 直接获得 Shell 访问进行调试（非传统 SSH 协议）



### 4.3 两者组合使用的场景

最强大的架构往往是将两者结合：用 Functions 处理事件驱动的控制面（API 路由、认证、调度），用 MicroVMs 处理数据面的隔离代码执行。

## **五、典型架构模式**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/lambda-microvms-vs-lambda-functions-comparison-2.png>)  
---  
  
### 5.1 模式一：AI 编程助手

场景：用户通过浏览器与 AI 编程助手交互，助手生成代码并需要在隔离环境中执行。

**5.1.1 架构设计**

  * 前端通过 WebSocket 连接到用户专属的 Lambda MicroVM
  * MicroVM 中运行代码执行服务，预装开发工具和语言运行时
  * AI 生成的代码在 MicroVM 内部执行，结果通过 WebSocket 实时返回
  * 用户离开时 MicroVM 自动挂起，回来时状态完整恢复
  * Lambda Functions 处理用户认证、会话管理和 MicroVM 生命周期编排



核心价值：VM 级隔离确保 AI 生成代码的安全执行；有状态特性让用户在多轮对话中保持上下文；挂起/恢复降低空闲成本。

### 5.2 模式二：多租户数据分析平台

场景：SaaS 数据分析平台，每个租户需要独立的计算环境来运行自定义查询和分析脚本。

**5.2.1 架构设计**

  * 每个租户分配一个 Lambda MicroVM，预装数据分析工具（Python、R、SQL 引擎）
  * 租户的查询通过独立 URL + 认证令牌路由到其专属 MicroVM
  * MicroVM 内的数据和中间结果在会话间保持，无需重复计算
  * Lambda Functions 处理数据摄入管道（S3 事件触发 ETL）
  * EventBridge 定时触发 Lambda Function 清理过期 MicroVM



核心价值：租户间物理隔离，满足合规要求；16 vCPU/32 GB 的规格足以处理中等规模分析任务；挂起时仅收取快照存储费用。

### 5.3 模式三：安全扫描与 CI/CD 平台

场景：安全平台需要运行用户提供的代码进行漏洞扫描，CI/CD 平台需要执行来自 Pull Request 的构建脚本。

**5.3.1 架构设计**

  * 每个扫描任务或 CI 作业启动一个临时 Lambda MicroVM
  * MicroVM 内可运行 Docker 容器（支持完整 Linux capabilities）
  * 扫描/构建完成后直接终止 MicroVM，无状态残留
  * Lambda Functions 处理任务调度、结果收集和通知推送
  * 通过 Lambda Network Connector 接入 VPC 访问内部代码仓库



核心价值：每个任务完全隔离，恶意代码无法影响平台或其他任务；支持 Docker-in-VM 满足复杂构建需求；用完即弃确保无状态泄漏。

## **六、计费对比分析**

以下计算基于 us-east-1 ARM64 定价，实际费用请以 [AWS Lambda 定价页面](<https://aws.amazon.com/cn/lambda/pricing/>) 为准。

### 6.1 场景一：短时 API 请求处理

假设：处理一个 API 请求，需要 1 GB 内存，平均执行 200ms。每月 100 万次调用。

**6.1.1 Lambda Functions 成本**

  * 请求费用：100 万 × $0.20/百万 = $0.20
  * 计算费用：100 万 × 0.2 秒 × 1 GB × $0.0000133334/GB-秒 = $2.67
  * 月总计：约 $2.87



**6.1.2 Lambda MicroVMs 成本**

  * 每次 VM 启动、执行、终止的开销远大于单次函数调用
  * MicroVM 不适合此场景，成本和延迟都会显著更高



结论：对于短时、高频、无状态的请求，Lambda Functions 的成本优势碾压性明显。不要为了”用新服务”而将简单场景迁移到 MicroVMs。

### 6.2 场景二：AI 编程会话（长交互）

假设：100 个用户每天使用 AI 编程助手 4 小时，配置 2 vCPU/4 GB 内存，其中实际活跃编码时间 2 小时、空闲挂起 2 小时。

**6.2.1 Lambda MicroVMs 成本估算（每月 22 个工作日）**

  * 活跃计算：100 用户 × 2 小时 × 3600 秒 × 22 天 = 15,840,000 vCPU-秒
  * 按 vCPU-秒 + 内存（2:1 比例）按秒计费，挂起期间不收计算费
  * 仅收取快照存储费用（挂起 2 小时 × 100 用户）
  * 关键优势：空闲时间零计算费用，恢复时状态完整



**6.2.2 如果用 EC2 实现同等功能**

  * 需要 100 个 c7g.large 实例持续运行（含空闲时间）
  * 即使用 Savings Plan，4 小时/天的利用率意味着大量浪费
  * 还需自行构建隔离、生命周期管理和快照恢复机制



结论：对于有明显空闲期的交互式会话，MicroVMs 的挂起/恢复模型在成本上优于常驻 EC2，同时免去了基础设施管理负担。

### 6.3 计费模型核心差异

维度 | Lambda Functions | Lambda MicroVMs  
---|---|---  
计费粒度 | 毫秒级（最小 1ms） | 秒级  
空闲成本 | 零（无请求不计费） | 挂起时仅快照存储费  
免费额度 | 每月 100 万请求 + 40 万 GB-秒 | 待确认  
适合模式 | 高频短时调用 | 低频长时会话  
  
## **七、迁移考虑**

如果你正在考虑将部分工作负载从 Lambda Functions 迁移到 MicroVMs，需要注意以下关键点：

### 7.1 编程模型的根本转变

Lambda Functions 使用 Handler 模式——你编写一个入口函数，平台负责调用。MicroVMs 则是你运行一个完整的 HTTP 服务，需要自行处理请求路由、并发和生命周期。这不是简单的配置变更，而是编程范式的转换。

建议：评估你的工作负载是否真的需要 MicroVM 的能力（有状态、长运行、VM 隔离）。如果只是因为 15 分钟限制，先考虑 Step Functions 或 Lambda Managed Instances 是否能满足需求。

### 7.2 快照恢复的注意事项

MicroVMs 从预初始化快照恢复启动，这意味着：

  * 随机数生成器的种子在快照时就已确定，恢复后需要重新播种
  * 网络连接在快照时断开，恢复后需要重新建立
  * 时钟在快照时停止，恢复后需要同步
  * 需要集成 Lambda 提供的生命周期 Hook 来处理这些初始化逻辑



### 7.3 事件源集成

MicroVMs 没有 Lambda Functions 那样的 200+ 事件源集成。如果你依赖 SQS 触发、S3 事件、DynamoDB Streams 等，这些仍应由 Functions 处理，MicroVMs 通过 HTTP API 被 Functions 调用。

### 7.4 区域和架构限制

截至发布时，Lambda MicroVMs 仅在 US East (N. Virginia)、US East (Ohio)、US West (Oregon)、Europe (Ireland) 和 Asia Pacific (Tokyo) 五个 Region 可用，且仅支持 ARM64 架构（Graviton）。如果你的代码依赖 x86 二进制文件或需要部署到其他区域，目前还无法迁移。

### 7.5 架构变化速查

迁移前（Functions） | 迁移后（MicroVMs）  
---|---  
API Gateway → Function | API Gateway → Function → MicroVM  
事件源 → Function | 事件源 → Function → MicroVM  
无状态设计 | 需要考虑状态管理策略  
自动伸缩到零 | 需要配置空闲策略和生命周期  
  
## **八、总结**

Lambda MicroVMs 和 Lambda Functions 不是替代关系，而是互补关系。它们面向不同类别的问题：

  * Lambda Functions 依然是事件驱动、无状态、短时计算的最佳选择。它的 200+ 事件源集成、毫秒级计费、自动伸缩到零的特性不可替代。
  * Lambda MicroVMs 则为需要 VM 级隔离、有状态会话和长运行时间的新一代应用（尤其是 AI 和多租户场景）提供了此前无法在 Serverless 范式下获得的能力。



最佳实践是将两者结合：用 Functions 构建事件驱动的控制面和集成层，用 MicroVMs 构建需要隔离执行的数据面。这种组合让你既保持了 Serverless 的运维简便性，又获得了 VM 级别的安全隔离和有状态能力。

行动号召：Lambda MicroVMs 的推出标志着 Serverless 计算从”函数即服务”向”隔离沙箱即服务”的重要演进。如果你正在构建 AI 编程助手、多租户 SaaS 平台或安全执行环境，现在就是评估 MicroVMs 的最佳时机。访问 [Lambda MicroVMs 产品页面](<https://aws.amazon.com/lambda/lambda-microvms/>) 开始你的第一个 MicroVM。

本文发布时间：2026 年 6 月 23 日。Lambda MicroVMs 于 2026 年 6 月 22 日正式发布（GA）。如需了解最新定价和区域可用性，请访问 [[AWS Lambda 定价页面]](<https://aws.amazon.com/lambda/pricing/>)。

────────────────────────────────────────

**下一步行动：**

**相关产品：**

  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=1>) — 无需服务器即可运行代码
  * [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/?p=bl_pr_api-gateway_l=2>) — 完全托管的 RESTful API 服务
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=3>) — 安全且可调整大小的计算容量
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=4>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=5>) — 隔离云网络



**相关文章：**

  * [Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？](<https://aws.amazon.com/cn/blogs/china/lambda-microvms-vs-bedrock-agentcore-ai-agent-development/>)
  * [AWS 正式发布 Lambda MicroVMs：面向 AI 时代的无服务器安全代码执行环境](<https://aws.amazon.com/cn/blogs/china/aws-launch-lambda-microvms-ai-serverless-security-environment/>)
  * [运行可全生命周期控制的隔离沙盒：AWS Lambda 推出 MicroVM](<https://aws.amazon.com/cn/blogs/china/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/?p=bl_ar_l=1>)
  * [使用 Amazon EventBridge 与 AWS Lambda 实现 ALB 流量镜像会话自动化配置](<https://aws.amazon.com/cn/blogs/china/using-amazon-eventbridge-aws-lambda-implement-alb-traffic/?p=bl_ar_l=2>)
  * [基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警](<https://aws.amazon.com/cn/blogs/china/blog-bedrock-per-bu-cost-alarms/?p=bl_ar_l=3>)
  * [通过 AWS Transform 持续现代化（预览版）自动主动减少技术债务](<https://aws.amazon.com/cn/blogs/china/proactively-reduce-tech-debt-autonomously-with-aws-transform-continuous-modernization-preview/?p=bl_ar_l=4>)
  * [让 AI 代理自己付钱：基于Amazon Bedrock AgentCore与 x402 的Agentic Payment 方案](<https://aws.amazon.com/cn/blogs/china/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张凯

亚马逊云科技解决方案架构师，主要负责基于亚马逊云科技的解决方案架构设计和的方案咨询；具有多年的架构设计、项目管理经验。

### 李刚

亚马逊云科技技术客户经理，专注于为企业客户提供云计算技术方案咨询和最佳实践指导。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
