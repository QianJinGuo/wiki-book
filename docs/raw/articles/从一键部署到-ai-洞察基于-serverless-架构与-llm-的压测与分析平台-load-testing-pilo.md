---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot
ingested: 2026-07-24
feed_name: AWS China Blog
source_published: 2026-07-24
sha256: a920f65a1f5f9d005a72a7066cc231031e6b8a43bdf975e26b8a6547ecfdae22
---

登录后的主控制台以统计卡片概览全部测试场景的运行状态，并提供快速HTTP测试、JMeter脚本上传和AI生成脚本三种快捷入口：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-2.png>) [图2 Load Testing Pilot主控制台——场景概览、运行状态统计与快捷操作入口]  
---
  
  
## **4\. 架构设计**

### 4.1 整体架构

平台采用Serverless架构，部署在亚马逊云科技中国区域的[Amazon VPC](<https://aws.amazon.com/cn/vpc/>)内。下图展示了各服务组件的网络拓扑和数据流向：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-3.png>) [图3 整体架构，涵盖前端托管、API层、压测执行、数据存储、指标采集与AI分析]  
---
  
  
核心组件及其职责如下：

架构层 | 服务组件 | 职责说明  
---
|---
|---
  
前端托管 | [Amazon S3](<https://www.amazonaws.cn/s3/>) \+ [Amazon Lambda](<https://www.amazonaws.cn/lambda/>) \+ Application Load Balancer | 单文件HTML应用存储在Amazon S3中，由Lambda读取并通过ALB提供服务  
API层 | [Amazon API Gateway](<https://www.amazonaws.cn/api-gateway/>) | 统一REST API入口，API Key鉴权  
压测编排 | [Amazon Step Functions](<https://www.amazonaws.cn/step-functions/>) \+ Amazon Lambda | 编排压测生命周期：任务创建、进度监控、结果解析  
压测执行 | [Amazon ECS](<https://www.amazonaws.cn/ecs/>) on [Amazon Fargate](<https://www.amazonaws.cn/fargate/>) | 运行Taurus/JMeter/K6/Locust容器，按需启动，按秒计费  
数据存储 | [Amazon DynamoDB](<https://www.amazonaws.cn/dynamodb/>) \+ Amazon S3 | 场景配置存储在Amazon DynamoDB，脚本与结果文件存储在Amazon S3  
指标采集 | Amazon Lambda + [Amazon CloudWatch](<https://www.amazonaws.cn/cloudwatch/>) | 自动发现ELB/目标组/EC2实例（含EKS节点和ECS实例），批量拉取监控指标  
AI分析 | 浏览器 + LLM API | 浏览器直接调用LLM API，流式输出  
  
## **5\. 核心功能详解**

### 5.1 多引擎压测支持

平台提供四种压测方式，从快速验证到复杂场景模拟均有覆盖：

  * 简单HTTP压测：在Web界面直接配置目标URL、HTTP方法、请求头和请求体，无需编写脚本
  * Apache JMeter脚本：上传.jmx脚本文件，支持参数化、断言、定时器等完整特性
  * K6脚本：上传.js脚本文件，以JavaScript编写测试逻辑
  * Locust脚本：上传.py脚本文件，利用Python灵活性构建用户行为模型



脚本文件通过前端拖拽上传，后端生成[Amazon S3](<https://aws.amazon.com/cn/s3/>) Presigned URL实现安全直传，上传过程带有实时进度条。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-4.png>) [图4 新建场景——支持Simple HTTP、JMeter、K6、Locust和AI生成脚本五种压测方式]  
---
  
  
### 5.2 AI自然语言生成压测脚本

对于不熟悉JMeter脚本语法的团队，平台提供了AI辅助生成功能。在”AI 生成脚本”标签页中，您只需用自然语言描述压测需求。以下示例中，我们输入”测试某ELB的80端口，目标3000 RPS，持续10分钟”，点击”生成JMeter脚本”按钮：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-5.png>) [图5 AI生成脚本——输入自然语言描述的压测需求，如”测试某ELB 80端口，目标3000 RPS，持续10分钟”]  
---
  
  
LLM以流式方式实时生成标准的.jmx脚本。生成完成后，平台自动提取执行参数（容器数量、并发数、RPS限速等），您可以审查和修改脚本内容，确认无误后直接点击”创建并运行”提交压测：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-6.png>) [图6 AI生成完成——自动提取的执行参数与可编辑的JMeter XML脚本]  
---
  
  
### 5.3 跨账号与跨区域资源查询

当压测平台部署在cn-north-1区域，而目标资源位于cn-northwest-1或其他账号时，您可以展开”跨账号凭据/跨区域配置”面板，选择目标区域并配置凭据模式（当前账号、AK/SK、临时凭据或Assume Role）：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-7.png>) [图7 跨账号凭据与跨区域配置——支持当前账号、AK/SK、临时凭据和Assume Role四种模式]  
---
  
  
### 5.4 丰富的可视化结果展示

压测完成后，平台提供多层次的可视化分析，帮助您快速理解测试结果。详情页顶部以红/黄/绿色健康状态条标识整体表现，核心指标卡片以大字体展示总请求数、RPS、成功率和平均响应时间：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-8.png>) [图8 健康状态条与核心指标卡片——3,148,723次请求、4998 RPS、70%成功率、2ms平均响应时间]  
---
  
  
响应时间详情以分位数柱状图（P50/P90/P95/P99/P100）展示延迟分布，帮助识别长尾延迟问题：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-9.png>) [图9 响应时间详情——P50/P90/P95/P99分位数柱状图，P99仅5ms但P100达43ms]  
---
  
  
响应码分布环形图直观展示成功和错误请求的比例，错误详情表列出每种错误类型的次数、占比和可能原因：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-10.png>) [图10 响应码分布——HTTP响应码占比环形图，以及错误类型明细表]  
---
  
  
### 5.5 亚马逊云科技基础设施指标自动采集

这是本平台区别于传统压测工具的核心差异化能力。压测结束后，平台会自动解析目标主机名，通过Elastic Load Balancing API查找匹配的负载均衡器，进而发现关联的目标组（Target Group）和后端Amazon EC2实例。

特别值得说明的是，平台扫描的是目标组中注册的Amazon EC2实例，这意味着它天然支持以下两类场景：

  * Amazon EKS工作负载：Amazon EKS节点组中的EC2工作节点作为目标组的注册目标，平台可以直接采集这些节点的CPU、网络和磁盘指标
  * Amazon ECS on EC2工作负载：当Amazon ECS使用EC2启动类型时，底层EC2实例同样会被自动发现和监控



采集的指标涵盖Elastic Load Balancing层（请求数、活跃连接、目标响应时间、HTTP错误码）、目标组层（健康/异常主机数、每目标请求分布）和Amazon EC2实例层（CPU利用率、网络吞吐、磁盘IOPS）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-11.png>) [图11 Elastic Load Balancing指标——请求总数、目标响应时间、5xx错误数，以及目标组健康状态]  
---
  
  
平台还会将采集到的指标以时序图表的形式展示，帮助您直观地观察压测期间各项指标的变化趋势：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-12.png>) [图12 Amazon CloudWatch时序图——ELB请求数曲线与目标响应时间趋势]  
---
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-13.png>) [图13 Amazon EC2实例指标——CPU利用率、网络吞吐量与磁盘IOPS时序图]  
---
  
  
### 5.6 AI驱动的智能分析

平台会将压测指标和Amazon CloudWatch基础设施指标整理为结构化上下文，提交给大语言模型进行分析。报告以流式方式逐步输出，内容涵盖：

1\. 执行摘要：对本次压测的整体健康状况给出达标/未达标的评估结论

2\. 关键指标解读：以表格形式逐项分析吞吐量、成功率、各分位数延迟、错误率等指标，给出判定和备注

3\. 失败与错误分析：对5XX等异常响应进行分类，给出可能原因

4\. 根因判断：结合客户端指标和Amazon CloudWatch服务端指标，精确定位性能瓶颈所在

5\. 优化建议：按优先级排序，给出具体可执行的改进措施

在AI设置页面配置LLM端点和密钥后，点击”开始分析”按钮即可触发分析。报告以流式方式逐步输出，从执行摘要开始给出”是否达标”的明确判定：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-14.png>) [图14 AI分析卡片——执行摘要]  
---
  
  
关键指标解读部分以表格形式逐项分析，每项指标给出值、判定和详细备注。模型还会交叉验证客户端指标与Amazon CloudWatch服务端指标的一致性：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-15.png>) [图15 关键指标解读——吞吐量、成功率、延迟分位数、错误率、CPU和网络I/O逐项分析]  
---
  
  
报告最后部分包含错误归因表（每种错误类型的次数、占比和可能原因）以及根因判断，从目标组健康状态、后端服务并发限制、ECS/EKS Pod资源配额和网络连接数等多个维度进行定位：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-16.png>) [图16 错误归因与根因判断]  
---
  
  
## **6\. 部署指南**

整个部署过程分为三个步骤，通常可在10分钟内完成。

### 6.1 前置条件

  * 一个亚马逊云科技中国区域账号（cn-north-1或cn-northwest-1）
  * 已配置中国区域凭证的Amazon CLI v2
  * 一台可运行Docker的环境（用于构建容器镜像）
  * 中国区域[Amazon IAM](<https://aws.amazon.com/cn/iam/>)权限



### 6.2部署Amazon CloudFormation堆栈

单一模板文件包含全部资源定义和6个内嵌Lambda函数代码。下载CloudFormation模板，使用此模板文件在CloudFormation控制台创建堆栈，部署过程自动创建Amazon VPC、Amazon ECS集群、[Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/>)表、Amazon S3桶、[Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/>)等所有必要资源。在创建堆栈时，根据需求填写参数，可以选择已有或新建VPC，如果有ACM证书，可以填写参数，从而自动配置ALB的HTTPS侦听器。推荐拉取默认参数中的容器镜像至中国区的Amazon ECR以增加压测过程中的镜像拉取速度。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-17.png>) [图17 Amazon CloudFormation部署参数配置]  
---
  
  
### 6.3 上传前端页面

将单文件前端（index.html）上传至Amazon S3即可。API端点配置由WebServer Lambda函数自动生成——无需手动创建任何配置文件：
    
    
    BUCKET=$(aws cloudformation describe-stacks --stack-name load-testing-pilot --query 'Stacks[0].Outputs[?OutputKey==`ConsoleBucket`].OutputValue' --output text) && aws s3 cp index.html s3://$BUCKET/index.html
    

部署完成后，在浏览器中打开堆栈输出中的ConsoleURL即可开始使用。首次访问时需输入API Key，API Key可通过堆栈输出中的命令获取：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-18.png>) [图18 首次访问——API Key认证界面，密钥由Amazon API Gateway自动生成]  
---
  
  
### 6.4 资源清理

测试完成后，如需删除全部资源以避免持续计费，只需删除Amazon CloudFormation堆栈：
    
    
    aws cloudformation delete-stack --stack-name load-testing-pilot
    

## **7\. 典型使用场景**

### 7.1 场景一：生产上线前的性能基线测试

某电商团队计划在大促前验证核心交易链路的承载能力。团队使用Load Testing Pilot创建了一个模拟真实用户行为的JMeter脚本，配置5个Fargate任务、8000并发、20分钟持续压测。测试完成后，平台自动采集了Application Load Balancer的目标响应时间、后端Amazon EKS节点的CPU利用率等指标。AI分析报告精确指出P99延迟在并发数超过一定阈值时出现显著上升，并结合Amazon EC2 CPU利用率和网络吞吐量数据定位到后端服务的连接池配置是瓶颈所在。

### 7.2 场景二：架构调优前后的量化对比

某SaaS平台在完成数据库读写分离改造后，需要量化优化效果。团队在改造前后分别执行了相同参数的压测，利用平台的测试运行历史功能对比两次结果。平均响应时间下降了40%，P99延迟下降了65%，为技术决策提供了坚实的数据支撑。

### 7.3 场景三：跨账号环境的容量评估

某企业的开发团队需要评估运行在独立账号中的生产环境容量。通过平台的跨账号凭据配置功能，开发团队在自己的压测平台中直接查询生产账号的Amazon CloudWatch指标，无需在生产账号中部署额外监控工具。

## **8\. 安全建议与成本考量**

### 8.1 安全最佳实践

  * 网络访问控制：通过安全组限制ALB和Amazon API Gateway的入站来源IP
  * 传输层加密：生产环境建议配置ACM证书启用HTTPS
  * API Key轮换：定期轮换Amazon API Gateway的API Key
  * LLM密钥保护：AI分析的API Key仅保存在浏览器localStorage中，不经过后端
  * 压测授权：请确保已获得目标系统的压测授权



### 8.2 成本考量

Serverless架构意味着核心组件按使用量计费。[Amazon Lambda](<https://aws.amazon.com/cn/lambda/>)按请求数计费，Amazon ECS on Fargate按秒计费且压测后自动释放，Amazon DynamoDB按需模式根据读写计费。注意如果存在跨区域压力测试，则会产生跨区域流量费用，推荐在应用的主要区域部署。除ALB的固定小时费外，闲时几乎不产生费用。

## **9\. 总结**

Load Testing Pilot为亚马逊云科技中国区域的用户提供了一个开箱即用的分布式压测解决方案。它的核心特性包括：

  * 单一Amazon CloudFormation模板一键部署，全部Lambda代码内嵌，零外部依赖
  * 支持JMeter、K6、Locust和简单HTTP四种压测方式，以及AI自然语言生成脚本
  * 自动发现Elastic Load Balancing、目标组和Amazon EC2实例（含Amazon EKS节点和Amazon ECS实例），采集Amazon CloudWatch全链路指标
  * LLM驱动的结构化分析报告，支持流式输出和Markdown导出
  * 支持跨区域（cn-north-1/cn-northwest-1）和跨账号的指标查询
  * Serverless架构，按使用量付费，闲时成本极低



**下一步行动：**

**相关产品：**

  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=1>) — 安全且可调整大小的计算容量
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=2>) — 完全托管的容器编排服务
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=3>) — 可观测性工具
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=4>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=5>) — 托管式 Kubernetes 服务



**相关文章：**

  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=1>)
  * [使用 Amazon GameLift Servers为游戏构建 DDoS 防护与延迟优化](<https://aws.amazon.com/cn/blogs/china/using-amazon-gamelift-servers-gaming-build-ddos-optimize/?p=bl_ar_l=2>)
  * [基于亚马逊云科技Serverless构建分钟级的近实时IoT设备异常检测系统](<https://aws.amazon.com/cn/blogs/china/based-on-serverless-build-real-time-iot-device-system/?p=bl_ar_l=3>)
  * [乐易游戏数据库最佳实践：超越原生Amazon DynamoDB自动弹性扩展的创新解决方案](<https://aws.amazon.com/cn/blogs/china/le-yi-games-db-best-practices-beyond-dynamodb-auto-scaling/?p=bl_ar_l=4>)
  * [AWS Security Agent 渗透测试实操](<https://aws.amazon.com/cn/blogs/china/aws-security-agent-testing/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 黄璐晗

西云数据资深技术支持工程师，云原生容器、基础设施即代码与网络架构等多个领域的专家，长期深耕 DevOps 与系统可靠性工程，擅长复杂系统的故障根因分析与性能调优，曾为多个行业客户解决生产环境中的疑难技术问题。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---
|---