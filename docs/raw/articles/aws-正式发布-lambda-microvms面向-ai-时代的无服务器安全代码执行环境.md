---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-launch-lambda-microvms-ai-serverless-security-environment
ingested: 2026-07-05
feed_name: AWS China Blog
source_published: 2026-07-02
sha256: "6a9cb539fdb65bb8fc23ef7d4d2a8caf7b893c3b0bf0a359830d85e469fa275f"
---

# AWS 正式发布 Lambda MicroVMs：面向 AI 时代的无服务器安全代码执行环境

摘要：当用户和 AI 生成的代码越来越多，一个绕不开的问题摆在每个平台面前：这些不可信的代码，到底该在哪里安全地运行？2026 年 6 月 22 日，AWS 给出了新答案——Lambda MicroVMs。  
  
**目录**

01 一句话理解

02 一、痛点：不可能三角

03 二、三大核心能力

04 三、架构原理

05 四、典型使用场景

06 五、与同类服务的关系

07 六、动手上路

08 写在最后

09 结语

* * *

## **一句话理解**

Lambda MicroVMs 是 [AWS Lambda](<https://aws.amazon.com/cn/lambda/>) 中一种全新的无服务器计算原语：为每个用户或会话提供一台专属的、有状态的、虚拟机级隔离的轻量执行环境——启动近乎瞬时，空闲自动挂起，完全无需管理基础设施。

## **一、痛点：不可能三角**

过去几年涌现出一类新的多租户应用——AI 编程助手、交互式代码环境、数据分析平台、漏洞扫描器、运行用户脚本的游戏服务器——它们有一个共同需求：为每个终端用户分配一个专属的执行环境，去安全地运行开发者自己并没有编写的代码。

而要在今天构建这种能力，意味着一个”不可能三角”：

方案 | 隔离 | 启动速度 | 状态保持  
---|---|---|---  
虚拟机（EC2） | 强 | 分钟级 | 有  
容器（ECS/EKS） | 共享内核 | 秒级 | 无  
函数（Lambda Function） | 容器可复用 | 毫秒级 | 无  
  
开发者要么在性能与隔离之间妥协，要么投入大量工程资源去自建一套定制的虚拟化基础设施。

**Lambda MicroVMs 打破了这个三角**

方案 | 隔离 | 启动速度 | 状态保持  
---|---|---|---  
Lambda MicroVM | VM 级 | 近乎瞬时 | 最长 8 小时  
  
## **二、三大核心能力**

### 2.1 虚拟机级隔离

每个 MicroVM 是一个独立的 Firecracker 虚拟机——正是支撑 Lambda 每月超过 15 万亿次函数调用的同一套技术。

  * 不同 MicroVM 之间无共享内核、无共享资源
  * 一个用户的不可信代码被完全限制在自己的环境内
  * 每个 MicroVM 拥有独立的 HTTPS endpoint，网络层天然隔离



### 2.2 近乎瞬时的启动与恢复

采用”先镜像、再启动”（image-then-launch）模型：

  * 你提供 Dockerfile → Lambda 构建并初始化应用 → 对运行态打 Firecracker 快照（snapshot）
  * 后续每次启动都从预初始化快照恢复，而非冷启动
  * 空闲恢复同理——即使是多 GB 的交互式会话，恢复也快到让用户无感



### 2.3 有状态执行

运行中的 MicroVM 持续保留内存、磁盘、运行中的进程：

  * 已安装的包、已加载的模型、正在处理的文件——跨交互持续存在
  * 空闲时自动挂起（状态完整快照保存），请求到来时自动恢复
  * 最长 8 小时运行时间，支持可配置的空闲策略
  * 用户回来时无感恢复——这次暂停从未发生过



## **三、架构原理**

### 3.1 底层：Firecracker 快照 + 专属 URL

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/aws-launch-lambda-microvms-ai-serverless-security-environment-01.png>)  
---  
  
**3.1.1 关键设计要点**

  * 每个 VM 有固定 URL——亲和性不靠”智能路由”，而是你记住”谁对应谁”
  * 镜像 = 已初始化快照——所有 MicroVM 从同一个快照启动，应用已在运行状态
  * 挂起 ≠ 销毁——空闲时内存和磁盘以快照保存，URL 不变，下次请求自动恢复
  * 销毁 = 彻底清除——VM 终止后数据随之消失，无残留风险



### 3.2 租户隔离：由你定义粒度

Lambda MicroVMs 提供的是隔离原语——具体按什么粒度隔离，由你的应用逻辑决定：

隔离策略 | 做法  
---|---  
每用户一个 VM | 用户首次来 → 创建 VM → 存映射到 DB → 后续请求路由到同一 URL  
每会话一个 VM | 每次新会话创建 VM，会话结束销毁  
每任务一个 VM | 每个独立任务（如一次扫描）分配一个 VM，跑完即销毁  
  
## **四、典型使用场景**

场景 | 为什么选 MicroVM  
---|---  
AI 编程助手的代码沙箱 | AI 生成的代码需要隔离执行，用户间不能互相影响  
交互式数据分析平台 | 用户上传数据和脚本，需要长时间运行 + 状态保持  
安全漏洞扫描引擎 | 每次扫描在隔离环境内运行，防止横向移动  
游戏服务器（用户自定义脚本） | 用户提交的脚本需要沙箱隔离  
多租户 SaaS 插件系统 | 第三方插件代码需要强隔离 + 独立资源限制  
云端 IDE / Notebook | 每个用户一个完整的开发环境，来去自如  
  
## **五、与同类服务的关系**

### 5.1 Lambda MicroVMs vs Lambda Functions：互补

维度 | Lambda Functions | Lambda MicroVMs  
---|---|---  
定位 | 事件驱动、request-response 短任务 | 多租户隔离环境（跑用户/AI 代码）  
运行时间 | 最长 15 分钟 | 最长 8 小时 + 挂起/恢复  
隔离 | 共享内核容器（跨调用可复用） | 独立 VM，无共享内核  
状态 | 无状态 | 完整保留：内存+磁盘+进程  
编程模型 | Handler 函数 | 完整 Dockerfile，任意进程  
网络 | 共享入口 | 每 VM 独立 HTTPS URL  
协议 | HTTP(S) | HTTP/2、gRPC、WebSocket  
规格 | 最高 10 GB 内存 | 16 vCPU / 32 GB 内存 / 32 GB 磁盘  
适合不可信代码 | 非设计目标 | 核心设计目标  
  
二者相得益彰：用 Lambda 函数搭建事件驱动主干，在需要隔离执行的环节调用 MicroVM。

### 5.2 Lambda MicroVMs vs Bedrock AgentCore：不同层级

| Lambda MicroVMs | Bedrock AgentCore  
---|---|---  
本质 | 底层计算原语 | 上层 AI Agent 框架  
你提供 | Dockerfile + 任意代码 | Agent 逻辑（任意框架）  
你得到 | 快速、安全、有状态的隔离 VM | Agent 全套基础设施（运行时 + 记忆 + 工具网关）  
面向 | 需要隔离执行不可信代码的任意应用 | 端到端构建 AI Agent  
计费 | Baseline 持续 + 超出 active duration | I/O 等待时 CPU 不计费  
  
### 5.3 典型组合：三者如何协作

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/aws-launch-lambda-microvms-ai-serverless-security-environment-02.png>)  
---  
  
AgentCore 负责”怎么把 Agent 跑起来”，MicroVM 负责”怎么安全地执行 Agent 产出的代码”。

## **六、动手上路**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/aws-launch-lambda-microvms-ai-serverless-security-environment-03.png>)  
---  
  
支持通过 AWS 控制台、CLI、CloudFormation、CDK 创建，也能用 Agent Toolkit for AWS 接入常用的 Agentic 开发工具。

### 6.1 关键技术规格

规格 | 数值  
---|---  
最长运行时间 | 8 小时  
最大配置 | 16 vCPU / 32 GB 内存 / 32 GB 磁盘  
架构 | ARM64  
协议 | HTTPS、HTTP/2、gRPC、WebSocket  
挂起/恢复 | 空闲自动挂起 + 请求自动恢复  
底层技术 | Firecracker  
可用区域 | 美东（弗吉尼亚北部、俄亥俄）、美西（俄勒冈）、欧洲（爱尔兰）、亚太（东京）  
  
完整代码实操请参阅 [[Lambda MicroVMs 开发者指南](<https://docs.aws.amazon.com/lambda/latest/dg/lambda-microvms-guide.html>)] 和 [[官方发布博客](<https://aws.amazon.com/blogs/aws/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/>)] 。

## **写在最后**

**AI 能写代码已不稀奇，真正的问题是：这些代码该在哪儿、以什么方式安全地跑起来？**

Lambda MicroVMs 给出的答案有两层：

  * 一层是安全——虚拟机级隔离，把不可信代码关进各自的盒子；
  * 另一层是无服务器——你不用预置集群、不用管理虚拟化栈、不用为闲置资源持续买单，把”自建并运维一套隔离基础设施”这件又难又重的事，收敛成了几次 API 调用。



对正在构建 AI 原生应用的团队来说，这可能是今年最值得关注的一块基础设施拼图。

## **结语**

**了解更多：**

  * *[[Lambda MicroVMs 产品页](<https://aws.amazon.com/lambda/lambda-microvms/>)]
  * *[[官方发布博客（英文）](<https://aws.amazon.com/blogs/aws/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/>)]
  * *[[Lambda MicroVMs 开发者指南](<https://docs.aws.amazon.com/lambda/latest/dg/lambda-microvms-guide.html>)]



**相关产品：**

  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=1>) — 无需服务器即可运行代码
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=3>) — 加快代理投入生产的速度
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=4>) — 安全且可调整大小的计算容量
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=5>) — 完全托管的容器编排服务



**相关文章：**

  * [Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？](<https://aws.amazon.com/cn/blogs/china/lambda-microvms-vs-bedrock-agentcore-ai-agent-development/>)
  * [Lambda MicroVMs vs Lambda Functions：全方位深度对比](<https://aws.amazon.com/cn/blogs/china/lambda-microvms-vs-lambda-functions-comparison/>)
  * [运行可全生命周期控制的隔离沙盒：AWS Lambda 推出 MicroVM](<https://aws.amazon.com/cn/blogs/china/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/?p=bl_ar_l=1>)
  * [FinOps + DevOps 双Agent — AI驱动的云成本优化实战](<https://aws.amazon.com/cn/blogs/china/finops-devops-agent-ai-cost-optimize/?p=bl_ar_l=2>)
  * [LiteLLM 生产级部署：基于 AWS ECS/EKS 的 AI Gateway 架构](<https://aws.amazon.com/cn/blogs/china/blog-litellm-production-deployment-aws/?p=bl_ar_l=3>)
  * [5 分钟拉起、90 秒自愈、成本 1/8——基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent 平台 OpenClaw Pool](<https://aws.amazon.com/cn/blogs/china/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore/?p=bl_ar_l=4>)
  * [使用 Amazon EventBridge 与 AWS Lambda 实现 ALB 流量镜像会话自动化配置](<https://aws.amazon.com/cn/blogs/china/using-amazon-eventbridge-aws-lambda-implement-alb-traffic/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张凯

亚马逊云科技解决方案架构师，主要负责基于亚马逊云科技的解决方案架构设计和的方案咨询；具有多年的架构设计、项目管理经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
