---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/blog-litellm-production-deployment-aws
ingested: 2026-06-15
feed_name: AWS China Blog
source_published: 2026-06-15
sha256: 7985ef8fb8aa0b029d7fb550768427162e961c6d6178a3098ff0a8febc4efb4d
---

# LiteLLM 生产级部署：基于 AWS ECS/EKS 的 AI Gateway 架构

摘要：本文介绍如何在 AWS 上以生产级标准部署 LiteLLM AI Gateway，涵盖 ECS Fargate 和 EKS 两种方案，并结合 LiteLLM 的 Control Plane / Data Plane 分离架构实现多区域高可用部署。

**目录**

01 背景与选型

02 整体架构

03 方案一：ECS Fargate 部署

04 方案二：EKS 部署（Kubernetes 原生）

05 安全最佳实践

06 可观测性与审计

07 方案对比

08 成本优势：Serverless 按需付费

09 进阶：Control Plane / Data Plane 分离的多区域架构

10 总结

11 参考资源

* * *

## **1\. 背景与选型**

### 1.1 为什么需要 LiteLLM AI Gateway

随着企业大规模采用大语言模型（LLM），团队面临以下挑战：

  * 多模型管理：同时使用 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) (Claude)、OpenAI、Google Gemini、Azure OpenAI 等多个 Provider
  * 成本控制：需要按团队/用户设置预算和速率限制
  * 统一接口：开发者希望用 OpenAI 兼容 API 调用所有模型
  * 安全合规：API Key 管理、审计日志、访问控制
  * 可观测性：Token 用量追踪、延迟监控、费用分析



LiteLLM 作为开源 AI Gateway，提供统一的 OpenAI 兼容 API 代理 200+ LLM 模型，内置 Key 管理、预算控制、缓存、负载均衡等企业级功能。

### 1.2 为什么部署在 AWS 上

  * 原生 Bedrock 集成：通过 IAM Role 和 VPC Endpoint (PrivateLink) 直接调用 Bedrock 模型，无需管理 API Key，流量不出 VPC
  * 安全合规体系成熟：IAM 最小权限、Security Group、WAF、KMS 加密、CloudTrail 审计，满足企业级合规要求
  * Serverless 组件丰富：Aurora Serverless、ElastiCache Serverless、Fargate、DynamoDB On-Demand 等按需付费组件，避免资源浪费
  * 全球基础设施：多区域部署 + CloudFront 全球加速，支持就近访问和数据驻留要求
  * IaC 生态完善：CloudFormation / CDK TypeScript / eksctl 一键部署，基础设施即代码，可重复、可审计



### 1.3 为什么选择容器化部署（ECS/EKS）而不是 EC2 直接部署

维度 | EC2 直接部署 | 容器化部署（ECS/EKS）  
---|---|---  
环境一致性 | 依赖手动配置或 AMI，环境漂移风险高 | Docker 镜像保证开发/测试/生产环境完全一致  
弹性扩缩 | 需自行管理 ASG + 启动模板，扩容分钟级 | ECS Auto Scaling / HPA + Karpenter，秒级扩容  
滚动更新 | 需自行实现蓝绿/金丝雀部署逻辑 | 平台原生支持滚动更新、健康检查、自动回滚  
资源利用率 | 一台 EC2 通常只跑一个服务，利用率低 | 多容器共享节点资源，bin-packing 提升利用率  
运维负担 | 需管理 OS 补丁、进程守护、日志收集 | Fargate 完全免运维；EKS 由 Karpenter 自动管理节点  
版本回退 | 回退需重新部署 AMI 或手动操作 | kubectl rollout undo 或 ECS 任务定义回退，秒级完成  
  
总结：LiteLLM 本身以 Docker 镜像发布，容器化部署是其推荐方式。ECS Fargate 提供最低运维负担，EKS 提供最大灵活性和成本优化空间（Spot + Graviton），两者均远优于 EC2 裸机部署。

## **2\. 整体架构**

两种部署方案均采用以下核心设计原则：

  * 高可用：多 AZ 部署，自动故障转移
  * 弹性扩缩：根据负载自动扩缩容
  * 安全纵深：WAF → TLS → 内网隔离 → IAM 最小权限
  * 完整可观测性：CloudWatch + S3 审计日志 + Dashboard



## **3\. 方案一：ECS Fargate 部署**

ECS Fargate 方案提供两种 IaC 部署方式，架构完全一致，团队可根据技术偏好选择：

维度 | CloudFormation | CDK (TypeScript)  
---|---|---  
语言 | YAML 模板 | TypeScript 代码  
部署命令 | ./deploy.sh deploy-all | npx cdk deploy –all  
参数覆盖 | 模板 Parameters | CDK Context (-c key=value)  
适合团队 | 熟悉 CloudFormation 的运维团队 | 偏好编程式 IaC 的开发团队  
可测试性 | 有限 | CDK Assertions 单元测试  
代码复用 | 跨栈引用 | TypeScript 接口 + 类继承  
  
### 3.1 CloudFormation 一键部署

部署代码：https://github.com/zhangzhenhuajack/aws-builder/tree/main/litellm/litellm-ecs-cloudformation

具体模板文件、部署命令等请以 GitHub 仓库 README 为准，以下仅介绍架构设计和核心理念。

**3.1.1 架构概览**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/blog-litellm-production-deployment-aws-1.png>) [图1 ECS Fargate 架构图]  
---  
  
**3.1.2 核心组件**

组件 | 用途  
---|---  
ECS Fargate | LiteLLM 容器运行（多副本）  
Aurora PostgreSQL | Serverless v2，用户/Key/用量元数据  
ElastiCache Redis | Serverless，TLS 加密，响应缓存  
Internal ALB | 仅 VPC 内可访问，内网负载均衡  
CloudFront + WAF | HTTPS-only，全球加速 + 应用层防护  
VPC Endpoints | Bedrock PrivateLink + S3 Gateway，LLM 调用不出 VPC  
DynamoDB | On-Demand，会话/缓存存储  
  
**3.1.3 CloudFormation 模板结构**

部署采用分层 CloudFormation 栈，按依赖顺序部署（VPC → S3 → Database → Bedrock IAM → ECS → CloudFront），每层职责单一，支持独立更新。具体模板文件列表请参考 GitHub 仓库。

**3.1.4 一键部署**

通过仓库提供的 deploy.sh 脚本一键部署全部组件，或按需分步部署各层。详细命令请参考 GitHub 仓库 README。

**3.1.5 安全特性**

层级 | 安全措施  
---|---  
入口 | CloudFront + WAF（SQL 注入、速率限制、IP 信誉、Geo 白名单）  
传输 | 全链路 TLS 1.2+，CloudFront 强制 HTTPS  
ALB | Internal（无公网 IP），仅接受 CloudFront VPC Origin 流量  
ECS | 私有子网，无公网 IP，仅接受 ALB Security Group 流量  
Bedrock | VPC Endpoint (PrivateLink)，流量不出 VPC  
数据库 | 私有子网，Security Group 仅允许 VPC 内端口访问  
密钥 | Secrets Manager 自动生成，ECS Task Definition 引用  
  
**3.1.6 验证测试**

部署完成后，通过以下方式验证：

1\. 健康检查：curl https://<cloudfront-domain>/health/liveliness

2\. 获取 Master Key：从 Secrets Manager 获取自动生成的密钥

3\. 调用测试：使用 OpenAI 兼容 API 格式调用 Bedrock 模型

具体命令和参数请参考 GitHub 仓库 README。

**3.1.7 CloudFormation 方案特点**

优势： –  CloudFormation 一键部署，运维简单 –  无需管理 Kubernetes 集群 –  Fargate Serverless，无需管理节点 –  CloudFront VPC Origin 内网回源，零公网暴露 –  自动扩缩（CPU 70% / Memory 80%） –  VPC Endpoint 确保 Bedrock 调用不出 VPC

适用场景： – 团队无 Kubernetes 经验 – 希望最小化运维负担 – 单区域部署为主 – 快速上线

### 3.2 CDK TypeScript 部署

部署代码：<https://github.com/zhangzhenhuajack/aws-builder/tree/main/litellm/litellm-cdk>

具体部署步骤、参数配置、Stack 名称等请以 GitHub 仓库 README 为准，以下仅介绍架构设计和核心理念。

**3.2.1 架构概览**

与 CloudFormation 方案架构一致（ECS Fargate + Internal ALB + CloudFront + WAF），但使用 [AWS CDK](<https://aws.amazon.com/cn/cdk/>) TypeScript 编写，具备更好的类型安全、可测试性和代码复用能力。

**3.2.2 分层 Stack 设计**

CDK 方案将基础设施拆分为 6 个独立 Stack，按依赖顺序自动部署：
    
    
    VpcStack → S3Stack → DatabaseStack → BedrockStack → EcsStack → CloudFrontStack
    

每个 Stack 职责单一（网络、存储、数据库、IAM、计算、CDN），通过 TypeScript 接口传递跨栈依赖，支持独立更新和回滚。

**3.2.3 核心特性**

  * 参数化部署：所有关键配置（副本数、CPU/内存、Aurora ACU、WAF 速率限制等）通过 CDK Context 参数化，命令行 -c key=value 即可切换环境
  * 单元测试：CDK Assertions 验证生成的 CloudFormation 模板，部署前发现配置错误
  * 变更预览：npx cdk diff 对比本地代码与已部署资源的差异
  * 一键部署/销毁：npx cdk deploy –all / npx cdk destroy –all



**3.2.4 CDK 方案特点**

优势： –  TypeScript 类型安全，IDE 自动补全 –  CDK Assertions 单元测试，部署前验证基础设施 –  参数通过 -c 命令行覆盖，灵活切换环境 –  跨栈依赖自动解析，无需手动管理输出/导入 –  与 CloudFormation 方案架构一致，可互相迁移 –  npx cdk diff 部署前预览变更

适用场景： – 团队偏好编程式 IaC（TypeScript/Python） – 需要单元测试基础设施代码 – 多环境（dev/staging/prod）通过参数切换 – 希望利用 CDK Construct 生态复用组件

## **4\. 方案二：EKS 部署（Kubernetes 原生）**

部署代码：<https://github.com/kk137/litellm-eks-public>

具体 YAML 清单、Helm 版本、部署步骤等请以 GitHub 仓库 README 为准，以下仅介绍架构设计和核心理念。

### 4.1 架构概览

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/blog-litellm-production-deployment-aws-1.png>) [图2 EKS 架构图]  
---  
  
### 4.2 核心组件

组件 | 用途  
---|---  
EKS | Kubernetes 容器编排，多 AZ 高可用  
系统节点组 | Managed Node Group，运行 Karpenter、CoreDNS 等系统组件  
工作负载节点 | Karpenter 自动扩缩，支持 Spot + Graviton 实例  
LiteLLM | 多副本 + HPA 自动扩缩  
Aurora PostgreSQL | Serverless v2，元数据存储  
ElastiCache Redis | TLS 加密，响应缓存  
ALB + WAFv2 | Internet-facing 入口 + 应用层防护  
External Secrets Operator | Secrets Manager → K8s Secret 自动同步  
  
### 4.3 Kubernetes 资源清单

部署包含完整的 Kubernetes 资源定义，覆盖：

  * 集群定义：eksctl 集群配置 + IRSA IAM 策略
  * 密钥管理：ESO SecretStore + ExternalSecret
  * 应用部署：Deployment（多副本、反亲和、探针）+ ConfigMap
  * 网络入口：Service + ALB Ingress（HTTPS、WAF、CIDR 限制）
  * 弹性扩缩：HPA + Karpenter NodePool
  * 高可用保障：PodDisruptionBudget + NetworkPolicy（零信任）



具体文件列表请参考 GitHub 仓库。

### 4.4 关键部署步骤

部署流程概览：

1\. 创建 EKS 集群：通过 eksctl 创建多 AZ 集群 + 系统节点组

2\. 安装 Karpenter：Helm 安装 + 创建 NodePool（Spot + Graviton）

3\. 创建数据层：Aurora PostgreSQL + ElastiCache Redis

4\. 写入密钥：Master Key、Database URL 等写入 Secrets Manager

5\. 安装 Helm 组件：AWS Load Balancer Controller + External Secrets Operator

6\. 部署 K8s 资源：按序 apply 所有 YAML

7\. 配置 DNS：Route53 指向 ALB

8\. 验证：健康检查 + API 调用测试

详细步骤和命令请参考 GitHub 仓库 README。

### 4.5 支持的模型

EKS 方案支持多 Provider 混合部署：

Provider | 认证方式  
---|---  
AWS Bedrock | IRSA（无需 API Key，Pod 级 IAM Role）  
Google Gemini | API Key  
OpenAI | API Key  
Azure OpenAI | API Key + Endpoint  
  
具体支持的模型列表请参考 GitHub 仓库中的 ConfigMap 配置。

### 4.6 SSO 集成（Cognito OIDC）

管理界面通过 [AWS Cognito](<https://aws.amazon.com/cn/cognito/>) SSO 认证：

Cognito 组 | LiteLLM 角色 | 权限  
---|---|---  
admin | proxy_admin | 完全管理  
viewer | proxy_admin_viewer | 只读  
users | internal_user | 管理自己的 Key  
  
### 4.7 EKS 方案特点

优势： –  Kubernetes 原生，生态丰富 –  Karpenter 智能扩缩，Spot 实例降低 60%+ 成本 –  Graviton (ARM) 节点，性价比更高 –  NetworkPolicy 零信任网络 –  External Secrets Operator 自动同步密钥 –  SSO 集成（Cognito OIDC） –  多 Provider 支持（Bedrock + Gemini + OpenAI + Azure） –  PodDisruptionBudget 保证滚动更新零停机

适用场景： – 团队有 Kubernetes 经验 – 需要精细化的资源调度和网络策略 – 多 LLM Provider 混合使用 – 需要 SSO 集成 – 追求极致成本优化（Spot + Graviton）

## **5\. 安全最佳实践**

两种方案均遵循以下安全原则：

### 5.1 网络安全对比

层级 | ECS 方案 | EKS 方案  
---|---|---  
入口防护 | CloudFront + WAF (6 规则) | ALB + WAFv2 (3 规则)  
传输加密 | TLS 1.2+ 全链路 | TLS 1.2+ 全链路  
内网隔离 | Internal ALB + 私有子网 | ClusterIP + NetworkPolicy  
Bedrock 调用 | VPC Endpoint (PrivateLink) | IRSA 直连  
数据库访问 | Security Group 限制 | Security Group + NetworkPolicy  
  
### 5.2 密钥管理

方案 | 密钥存储 | 注入方式  
---|---|---  
ECS | AWS Secrets Manager | ECS Task Definition 环境变量引用  
EKS | AWS Secrets Manager | External Secrets Operator → K8s Secret  
  
### 5.3 IAM 最小权限

  * ECS Task Role：仅允许 Bedrock InvokeModel、S3 读写、DynamoDB CRUD
  * EKS IRSA：通过 OIDC 联邦，Pod 级别的 IAM 角色绑定



### 5.4 数据加密

组件 | 加密方式  
---|---  
Aurora PostgreSQL | 存储加密 (AES-256) + 删除保护  
Redis | TLS 传输加密 + Auth Token  
DynamoDB | KMS 加密 + 时间点恢复 (PITR)  
S3 | AES-256 服务端加密 + 强制 HTTPS  
  
## **6\. 可观测性与审计**

### 6.1 日志架构
    
    
    API Request
        ├── CloudWatch Logs        — 应用运行日志（30 天保留）
        ├── S3                     — 完整 request/response JSON（Intelligent-Tiering）
        ├── Aurora PostgreSQL      — 费用追踪、用量统计、审计日志
        └── LiteLLM UI Dashboard  — 可视化监控
    

### 6.2 S3 审计日志

每次 API 调用生成 JSON 文件，包含： – 完整的用户输入（prompt）和模型输出（completion） – 使用的模型、调用费用、Token 用量 – 调用者 Key 别名、请求来源 IP – 延迟指标（startTime / endTime / response_time）

### 6.3 LiteLLM Dashboard

通过 /ui 访问管理界面： – Request Logs：每次调用的 request/response 详情 – Usage：按用户/Key/模型的用量统计 – Spend：费用追踪和预算管理 – Models：模型配置和健康状态

## **7\. 方案对比**

三种方案采用不同的技术栈，适配不同的团队技术背景：

维度 | ECS Fargate (CloudFormation) | ECS Fargate (CDK) | EKS  
---|---|---|---  
IaC 工具 | CloudFormation YAML | CDK TypeScript | eksctl + kubectl + Helm  
部署命令 | ./deploy.sh deploy-all | npx cdk deploy –all | eksctl create + kubectl apply  
计算平台 | Fargate Serverless | Fargate Serverless | EC2 节点（Managed NG + Karpenter）  
节点管理 | 无需管理 | 无需管理 | Karpenter 自动扩缩 + Spot/Graviton  
入口层 | CloudFront + Internal ALB | CloudFront + Internal ALB | ALB Ingress Controller  
网络隔离 | Security Group | Security Group | Security Group + NetworkPolicy  
密钥注入 | Task Definition 引用 SM | Task Definition 引用 SM | ESO → K8s Secret  
Bedrock 认证 | IAM User + VPC Endpoint | IAM User + VPC Endpoint | IRSA (Pod 级 IAM Role)  
扩缩容 | ECS Auto Scaling | ECS Auto Scaling | HPA + Karpenter  
可测试性 | 有限 | CDK Assertions 单元测试 | Helm test  
参数管理 | Stack Parameters | CDK Context (-c) | values.yaml  
成本模式 | Serverless 按需 | Serverless 按需 | Serverless + Spot 按需  
  
三种方案本质上是IaC 工具 + 容器编排平台的选择差异，核心能力（高可用、弹性扩缩、安全合规、可观测性）完全一致，团队可根据现有技术栈自由选择。

## **8\. 成本优势：Serverless 按需付费**

两种方案均大量采用 AWS Serverless 组件，核心优势是按需付费、无需预置容量：

组件 | Serverless 特性  
---|---  
Aurora Serverless v2 | 按 ACU 秒级计费，空闲时自动缩至 0.5 ACU，无需预估数据库规格  
ElastiCache Redis Serverless | 按实际存储和请求量计费，零流量时接近零成本  
ECS Fargate | 按容器运行时间计费，无需管理 EC2 实例  
DynamoDB On-Demand | 按请求次数计费，无需预置读写容量  
CloudFront | 按请求数和流量计费，无最低消费  
Karpenter + Spot（EKS） | 自动选择最优实例类型，Spot 实例可节省 60%+ 计算成本  
  
关键设计原则： – ???? 弹性伸缩：所有组件随业务负载自动扩缩，高峰期自动扩容，低谷期自动缩容 – ???? 零浪费：不使用时不产生费用（或仅产生极低的基础费用） – ???? 线性增长：成本与实际 LLM 调用量线性相关，无阶梯式跳变

## **9\. 进阶：Control Plane / Data Plane 分离的多区域架构**

此功能需要 LiteLLM Enterprise License。

当业务扩展到多区域时，可以采用 LiteLLM 的 Control Plane / Data Plane 分离架构，将管理面和数据面解耦，实现全球多区域部署。

### 9.1 架构设计
    
    
                        ┌─────────────────────────────────────────────────────┐
                        │              Admin Instance (Control Plane)         │
                        │              admin.company.com                      │
                        │              - Key 管理、用户管理                    │
                        │              - 配置变更、监控 Dashboard              │
                        │              DISABLE_LLM_API_ENDPOINTS=true         │
                        └──────────────────────┬──────────────────────────────┘
                                               │
                                  共享 Aurora Global Database
                                               │
                  ┌────────────────────────────┼────────────────────────────┐
                  │                            │                            │
        ┌─────────▼─────────┐       ┌──────────▼──────────┐      ┌──────────▼──────────┐
        │  US Worker (ECS)  │       │  EU Worker (EKS)    │      │  APAC Worker (ECS)  │
        │  us.company.com   │       │  eu.company.com     │      │  apac.company.com   │
        │ DISABLE_ADMIN=true│       │  DISABLE_ADMIN=true │      │  DISABLE_ADMIN=true │
        │  → Bedrock us-east│       │  → Bedrock eu-west  │      │  → Bedrock ap-north │
        └───────────────────┘       └─────────────────────┘      └─────────────────────┘
    

### 9.2 核心理念

组件 | 职责 | 环境变量  
---|---|---  
Admin Instance | 用户管理、Key 生成、配置变更、Dashboard | DISABLE_LLM_API_ENDPOINTS=true  
Worker Instance | 处理 LLM 请求、路由、缓存、负载均衡 | DISABLE_ADMIN_UI=true + DISABLE_ADMIN_ENDPOINTS=true  
  
所有实例共享同一个数据库，Admin 实例创建的 Key/用户/配置自动对所有 Worker 生效。

### 9.3 配置方式

**9.3.1 Admin Instance（管理面）**
    
    
    DISABLE_LLM_API_ENDPOINTS=true      # 禁用 LLM API，仅保留管理端点
    DATABASE_URL=postgresql://user:pass@global-db:5432/litellm
    LITELLM_MASTER_KEY=your-master-key
    

**9.3.2 Worker Instance（数据面）**
    
    
    DISABLE_ADMIN_UI=true               # 禁用管理 UI
    DISABLE_ADMIN_ENDPOINTS=true        # 禁用管理 API
    DATABASE_URL=postgresql://user:pass@global-db:5432/litellm
    LITELLM_MASTER_KEY=your-master-key
    

### 9.4 架构优势

  1. 降低管理开销：仅一个实例需要管理能力
  2. 区域性能优化：用户就近访问 Worker 节点，低延迟
  3. 集中控制：所有管理操作通过单一界面完成
  4. 安全隔离：Worker 节点禁用管理端点，减少攻击面
  5. 灵活混合：不同区域可自由选择 ECS 或 EKS 部署



### 9.5 客户端使用
    
    
    from openai import OpenAI
    
    # 美国用户 → US Worker
    client_us = OpenAI(base_url="https://us.company.com/v1", api_key="sk-xxx")
    
    # 欧洲用户 → EU Worker
    client_eu = OpenAI(base_url="https://eu.company.com/v1", api_key="sk-xxx")
    
    # 管理操作 → Admin Instance
    import requests
    requests.post("https://admin.company.com/key/generate",
                  headers={"Authorization": "Bearer sk-master"},
                  json={"duration": "30d"})
    

### 9.6 Worker 端点说明

Worker 实例禁用管理端点后，仅保留以下 API： – /chat/completions — LLM 请求 – /v1/* — OpenAI 兼容 API – /bedrock/* — Bedrock 透传 API – /vertex_ai/* — Vertex AI 透传 API – /health — 健康检查 – /metrics — Prometheus 指标

## **10\. 总结**

LiteLLM 作为生产级 AI Gateway，在 AWS 上有三种成熟的部署路径：

1\. ECS Fargate — CloudFormation（部署代码）：YAML 模板一键部署，适合熟悉 CloudFormation 的运维团队

2\. ECS Fargate — CDK TypeScript（部署代码）：编程式 IaC，适合偏好 TypeScript、需要单元测试基础设施的开发团队

3\. EKS（部署代码）：Kubernetes 原生生态，适合需要精细控制、Spot + Graviton 成本优化的团队

两种方案均支持： –  高可用（多 AZ 部署） –  弹性扩缩（Auto Scaling / HPA + Karpenter） –  安全合规（WAF + TLS + VPC Endpoint + IAM 最小权限） –  完整可观测性（CloudWatch + S3 审计 + Dashboard）

对于多区域场景，可进一步采用 LiteLLM Enterprise 的 Control Plane / Data Plane 分离架构，在保持集中管理的同时为各区域用户提供低延迟的 LLM 访问体验，且各区域可自由选择 ECS（CloudFormation 或 CDK）或 EKS 作为部署方式。

**下一步行动：**

**相关产品：**

  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=1>) — 完全托管的容器编排服务
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=2>) — 托管式 Kubernetes 服务
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=4>) — 适用于容器的无服务器计算
  * [Amazon CDK](<https://aws.amazon.com/cn/cdk/?p=bl_pr_cdk_l=5>) — 基础设施即代码框架



**相关文章：**

  * [告别堡垒机：使用 AWS EICE （EC2 Instance Connect Endpoint） 与 Chaterm 实现私有子网的安全智能运维](<https://aws.amazon.com/cn/blogs/china/bastion-using-aws-eice-ec2-instance-connect-endpoint-chaterm-implement-subnet-security-intelligent/?p=bl_ar_l=1>)
  * [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](<https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=2>)
  * [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](<https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=3>)
  * [AWS IAM Identity Center 现在支持适用于 AWS 账户访问和应用程序使用的多区域复制功能](<https://aws.amazon.com/cn/blogs/china/aws-iam-identity-center-now-supports-multi-region-replication-for-aws-account-access-and-application-use/?p=bl_ar_l=4>)



## **11\. 参考资源**

  * [LiteLLM 官方文档 – Control Plane & Data Plane](<https://docs.litellm.ai/docs/proxy/control_plane_and_data_plane>)
  * [LiteLLM GitHub](<https://github.com/BerriAI/litellm>)
  * [ECS 部署代码 (CloudFormation)](<https://github.com/zhangzhenhuajack/aws-builder/tree/main/litellm/litellm-ecs-cloudformation>)
  * [ECS 部署代码 (CDK TypeScript)](<https://github.com/zhangzhenhuajack/aws-builder/tree/main/litellm/litellm-cdk>)
  * [EKS 部署代码](<https://github.com/kk137/litellm-eks-public>)
  * [AWS ECS Fargate 文档](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>)
  * [Amazon EKS 文档](<https://docs.aws.amazon.com/eks/latest/userguide/>)
  * [Karpenter 文档](<https://karpenter.sh/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张振华

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构和设计，在 Edge、Serverless 、容器化，微服务架构，云原生 DevOps 等方向具有丰富的实践经验。自加入亚马逊云科技后，专注于游戏行业，以及 GenAI 在游戏行业的应用。

### 刘振华

亚马逊云科技高级解决方案架构师。在加入 AWS 之前，曾在埃森哲和华为等知名企业担任核心技术岗位，主导过多个大型软件系统的设计、开发和项目管理，拥有丰富的实战经验。凭借对 SaaS 领域的深入理解和实践经验，向客户提供高质量的技术咨询和赋能服务。近期开始专注于研究生成式人工智能技术如何助力中国企业客户实现创新发展，为企业量身定制 AI 解决方案，提升其核心竞争力。

### 赵安蓓

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的解决方案咨询和设计，机器学习 TFC 成员。在数据处理与建模领域有着丰富的实践经验，特别关注医疗领域的机器学习工程化与运用。

### 韩坤尧

亚马逊云科技解决方案架构师，负责基于亚马逊云科技方案架构的咨询、设计和评估。在运维、安全、网络方面有丰富的经验，目前侧重于AI/大数据领域的研究。在加入 AWS 之前曾就职于 Juniper、Cisco 等公司，担任高级系统工程师，主要服务于国内外企业客户。

* * *

## 2026 亚马逊云科技中国峰会

智能投标、AI 质检、财务自动化、智能客服——生产级 Agent 全天开放体验。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
