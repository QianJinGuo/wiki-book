# 从一键部署到 AI 洞察 — 基于 Serverless 架构与 LLM 的压测与分析平台

## Ch11.255 从一键部署到 AI 洞察 — 基于 Serverless 架构与 LLM 的压测与分析平台

> 📊 Level ⭐⭐ | 4.0KB | `entities/从一键部署到-ai-洞察基于-serverless-架构与-llm-的压测与分析平台-load-testing-pilo.md`

# 从一键部署到 AI 洞察 — 基于 Serverless 架构与 LLM 的压测与分析平台

> 登录后的主控制台以统计卡片概览全部测试场景的运行状态，并提供快速HTTP测试、JMeter脚本上传和AI生成脚本三种快捷入口： [](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-2.png>) [图2 Load Testing Pilot主控制台——场景概览、运行状态统计与快捷操作入口] -

## 摘要

```mermaid
graph TB
    subgraph "边缘层"
        CDN[CDN/缓存] --> LB[负载均衡]
        LB --> GW[API Gateway<br/>认证+限流]
    end
    subgraph "服务层"
        SVC_A[业务服务A]
        SVC_B[业务服务B]
        AGENT_SVC[Agent 服务]
    end
    GW --> SVC_A & SVC_B & AGENT_SVC
    subgraph "Agent 运行时"
        SANDBOX[沙箱隔离]
        RUNTIME[执行引擎]
        POOL[连接池]
    end
    AGENT_SVC --> SANDBOX --> RUNTIME
    RUNTIME --> POOL
    subgraph "数据层"
        DB[(关系数据库)]
        CACHE[(Redis缓存)]
        OBJ[(对象存储)]
        VDB[(向量数据库)]
    end
    SVC_A --> DB & CACHE
    AGENT_SVC --> OBJ & VDB
    classDef edge fill:#fef3c7,stroke:#d97706
    classDef svc fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef data fill:#d1fae5,stroke:#059669
    class CDN,LB,GW edge
    class SVC_A,SVC_B,AGENT_SVC svc
    class SANDBOX,RUNTIME,POOL runtime
    class DB,CACHE,OBJ,VDB data
```


登录后的主控制台以统计卡片概览全部测试场景的运行状态，并提供快速HTTP测试、JMeter脚本上传和AI生成脚本三种快捷入口：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/deploy-ai-based-on-serverless-architecture-llm-analytics-platform-load-testing-pilot-2.png>) [图2 Load Testing Pilot主控制台——场景概览、运行状态统计与快捷操作入口]  
---
  
  
## 4\. 架构设计

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
  
## 5\. 核心功能详解

### 5.1 多引擎压测支持

平台提供四种压测方式，从快速验证到复杂场景模拟均有覆盖：

  * 简单HTTP压测：在Web界面直接配置目标URL、HTTP方法、请求头和请求体，无需编写脚本
  * Apache JMeter脚本：上传.jmx脚本文件，支持参数化、断言、定时器等完整特性
  * K6脚本：上传.js脚本文件，以JavaScript编写测试逻辑
  * Locust脚本：上传.py脚本文件，利用Python灵活性构建用户行为模型

脚本文件通过前端拖拽上传，后端生成[Amazon S3](<https://aws.amazon.com/cn/s3/>) Presigned URL实现安全直传，上传过程带有实时进度条。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/从一键部署到-ai-洞察基于-serverless-架构与-llm-的压测与分析平台-load-testing-pilo.md)

---

