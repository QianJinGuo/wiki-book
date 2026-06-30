# 基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客

## Ch11.049 基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 12.6KB | `entities/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice.md`

## 概述
基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 by awschina on 20 3月 2026 in Containers Permalink Share 摘要：随着生成式 AI 的快速普及，越来越多的企业需要为内部团队或外部客户提供 AI Agent 服务。如何在保障安全隔离的前提下，实现高效、低成本的多租户 AI Agent 部署，成为一项关键的技术挑战。本文介绍如何基于 Amazon EKS、AWS Graviton 和 Kubernetes Operator 模式，构建一个支持多租户、多模型的 OpenClaw AI Agent 平台，并通过 CloudFront + Cognito + ALB 的前端架构实现用户自助 Provisioning。 目录 01 一、引言 02 二、OpenClaw 简介与价值 03 三、多租户场景的挑战 04 四、方案设计思路 05 五、Amazon EKS + Graviton 的优势 06 六、架构介绍 07 七、运行时选项：标准容器 vs. Kata Containers microVM 08 八、支持的模型提供商 09 九、弹性扩展与存储方案 10 十、认证与授权方案 11 十一、Demo 演示 12 十二、总结与展望 13 十三、参考资料 一、引言 随着生成式 AI 的快速普及，越来越多的企业需要为内部团队或外部客户提供 AI Agent 服务。如何在保障安全隔离的前提下，实现高效、低成本的多租户 AI Agent 部署，成为一项关键的技术挑战。本文介绍如何基于 Amazon EKS 、 AWS Graviton 和 Kubernetes Operator 模式，构建一个支持多租户、多模型的 OpenClaw AI Agent 平台，并通过 CloudFront + Cognito + ALB 的前端架构实现用户自助 Provisioning 。 二、OpenClaw 简介与价值 OpenClaw 是一个开源的云原生 AI Agent 运行时平台，能够作为用户的个人 AI 助手，跨 Telegram、Discord、WhatsApp、Signal 等多个渠道提供服务。 它不仅仅是一个聊天机器人，更是一个具备记忆、技能系统、浏览器自动化和代码执行能力的智能 Agent 。 OpenClaw 的核心能力包括： 多 AI 提供商支持：Amazon Bedrock (Claude)、OpenAI、SiliconFlow 等 可扩展的技能系统：基于 MCP (Model Context Protocol) 的插件化架构 内置安全沙箱：安全的代码执行环境和浏览器自动化 声明式配置：通过 Kubernetes CRD 声明式管理 Agent 实例 持久化存储：支持 Agent 记忆和工作空间的持久化 对于企业用户而言，OpenClaw 提供了一种将 AI Agent 能力作为内部服务（Agent-as-a-Service）的可能性——每位员工或每个团队都可以拥有自己的专属 AI Agent，同时企业能够统一管控模型访问、成本和安全策略。 三、多租户场景的挑战 当我们尝试将 OpenClaw 扩展为一个服务多用户的平台时，面临以下核心挑战： 3.1 用户与模型多样性 不同用户可能需要访问不同的 AI 模型（如 Claude Sonnet、Claude Opus），甚至不同的模型提供商（ Amazon Bedrock 、SiliconFlow 等）。平台需要灵活支持多模型配置，同时统一管理模型访问凭证。 3.2 安全隔离保障 每个 AI Agent 实例拥有用户的个人数据、对话记录和工作空间文件。在多租户环境中，必须确保： 数据隔离：不同用户的数据完全隔离，无法互相访问 网络隔离： Agent 实例之间的网络流量严格受控 资源隔离：单个用户不能耗尽共享集群资源 运行时隔离：提供 VM 级别的隔离选项，防止容器逃逸 3.3 效率与性能 AI Agent 的交互是实时的，用户期望低延迟的响应。平台需要在保障隔离的同时，最小化性能开销，快速完成实例的创建和启动。 3.4 可扩展性设计 从 10 个用户扩展到 1000 甚至 10000 个用户，架构需要具备弹性伸缩能力，而不是线性增加管理复杂度和基础设施成本。 四、方案设计思路 基于上述挑战，我们设计了以下解决方案，围绕四个核心设计目标： 4.1 设计目标一：多用户、多模型支持 通过 Kubernetes Operator 模式，将每个用户的 AI Agent 抽象为一个 OpenClawInstance CRD（Custom Resource Definit...

## 核心技术
OpenClaw、Amazon Bedrock、Agentic AI、MCP、Amazon EKS、Kubernetes

## 深度分析
### 1. Kubernetes Operator 模式实现声明式多租户生命周期管理
本文的核心设计亮点在于使用 Kubernetes Operator 模式将每个用户的 AI Agent 抽象为 OpenClawInstance CRD（Custom Resource Definition）。Operator 持续监听 CRD 变化，自动 Reconcile 出 StatefulSet、Service、PVC、ConfigMap、Secret、NetworkPolicy 等 9+ 种 Kubernetes 资源 。这种声明式管理的优势在于：运维人员只需声明期望状态，Operator 自动处理中间的状态转换和错误恢复，极大降低了多租户环境下的运维复杂度。相比手动编写 YAML 或使用 Helm chart，CRD 模式天然支持 Self-Healing 和最终一致性，对于大规模部署（100+ 用户）尤为重要。

### 2. Namespace-per-User 四层隔离架构的安全价值
多租户平台的核心挑战是安全隔离。本文设计了四层隔离机制：Namespace 级别隔离不同用户的资源视图；NetworkPolicy 控制 Pod 间网络流量；ResourceQuota 防止单用户耗尽集群资源；Pod Security Standard 限制 Pod 的安全上下文 。对于金融、医疗等高合规场景，还提供 Kata Containers + Firecracker microVM 选项，实现 VM 级别的硬件隔离（独立 Guest Kernel），将容器逃逸风险从"较高"降至"极低"。这种分层隔离设计让平台可以根据不同用户的合规要求灵活切换，既满足一般内部团队需求，也能扩展到高安全场景。

### 3. Graviton + Karpenter + Spot 实例的成本优化组合
选择 AWS Graviton ARM64 处理器作为计算基座，配合 Karpenter 自动伸缩节点池和 Spot 实例，可实现 20-40% 的计算成本优化（相比 x86），进一步叠加 Spot 可达 60-80% 的成本节省 。Karpenter 直接调用 EC2 Fleet API，节点启动时间仅 2 分钟，并自动整合空闲节点（30 分钟无负载后回收）。Graviton Metal 实例（c6g.metal）支持 KVM 硬件虚拟化，是运行 Kata Containers 的必要条件。这一组合体现了云原生时代的成本控制哲学：按需伸缩 + Spot 缓冲 + ARM 架构能效。

### 4. 共享 IAM Role + Pod Identity 的 O(1) 授权架构
传统多租户授权通常采用 per-user IAM Role，导致 IAM Role 数量随用户数线性增长（O(n)）。本文创新性地提出共享 IAM Role 方案：所有 OpenClaw 实例共享同一个 IAM Role（openclaw-bedrock-shared），通过各自的 ServiceAccount 与该 Role 建立 Pod Identity Association 。这种设计将 AWS API 调用从 per-user 2 次降低为 1 次，IAM Role 数量从 O(n) 降低为 O(1)。配合 EKS Pod Identity，Provisioning Service 也无需硬编码 AWS 凭证，通过 ServiceAccount 与 IAM Role 绑定即可调用 EKS API。

### 5. 共享 ALB + 路径路由 vs Per-User ALB 的基础设施成本优化
传统多租户应用通常为每个用户分配一个独立 ALB，导致基础设施成本随用户数线性增长（O(n)）。本文采用共享 ALB + 路径路由架构：所有用户共享一个 ALB，通过 URL 路径（如 `/user/{user_id}/*`）路由到对应的后端服务 。结合 CloudFront CDN 加速前端访问（静态资源缓存命中率 80%），将 95% 的基础设施成本从 O(n) 降为 O(1)。这一设计思路对于构建 SaaS 化平台具有普遍参考价值：共享底层资源 + 逻辑隔离是实现规模经济的关键。

## 实践启示
### 1. 采用 CRD + Operator 模式管理 AI Agent 生命周期
在构建 AI Agent 平台时，应将每个 Agent 实例抽象为 Kubernetes CRD，由对应的 Operator 自动管理其完整生命周期。这样可以将实例创建时间从手动操作的 3-5 秒优化到 2-3 秒（通过预置共享 IAM Role），同时保证大规模部署时的最终一致性。建议参考 OpenClaw Kubernetes Operator 的实现，将 Agent 配置、能力注入、存储挂载等逻辑封装在 Reconciler 中。

### 2. 根据隔离需求选择运行时：默认 runc，高安全场景用 Kata
平台应默认使用标准容器（runc）以获得更高的部署密度和更低的性能开销（启动时间 ~10 秒 vs Kata 的 ~15 秒）。但对于金融、医疗等高合规场景，应支持通过 OpenClawInstance CRD 的一行配置（`runtimeClassName: kata-fc`）切换到 Kata Containers + Firecracker 运行时，获得 VM 级别的隔离保护。这种按需切换的设计可以让平台同时服务内部团队和外部客户，而无需维护两套独立集群。

### 3. 存储选型：EBS gp3 适合高 IOPS 场景，EFS 适合跨可用区共享
每个 OpenClaw 实例需要持久化存储用户工作空间、对话记录和 Agent 记忆。建议默认使用 EBS gp3（每用户 10Gi PVC，约 $0.08/GB/月），性能稳定且成本可控。对于需要跨可用区访问或多 Pod 共享的场景（如 Agent 迁移），应使用 EFS + EFS CSI Driver，通过 StorageClass 自动创建 Access Point，按实际使用量计费。

### 4. 认证授权分离：Cognito 管用户，Pod Identity 管资源
用户认证使用 Amazon Cognito User Pool 获取 JWT Token，从 Token 中提取用户身份（email）生成唯一 user_id。AWS 服务访问授权使用 EKS Pod Identity，Pod 无需硬编码凭证即可获得 IAM Role 权限。对于第三方模型提供商（如 SiliconFlow）的 API Key，应存储在 Kubernetes Secret 中，并建议结合 AWS Secrets Manager + External Secrets Operator 进行统一管理和轮换。

### 5. 使用 Karpenter 实现 Graviton Spot 实例的自动弹性伸缩
生产环境应使用 Karpenter 替代 Cluster Autoscaler，以享受更快的节点启动（2 分钟）、更智能的实例选型（自动选择最优 ARM64 实例类型）和更高效的资源整合（30 分钟空闲回收）。NodePool 配置中应同时支持 spot 和 on-demand 两种 capacity type，并设置合理的 CPU 上限（如 100 核），避免意外的成本超支。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/)

## 相关实体
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](ch04/039-openclaw-multi-agent-team-practice-v2.md)
- [OpenClaw 多智能体团队搭建实战经验](ch04/503-agent.md)
- [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动 | 亚马逊AWS官方博客](ch04/310-ai.md)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](ch04/310-ai.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](ch04/310-ai.md)
- [Amazon CloudFront部署小指南（二十四）：将CloudFront "多域名"改造为"多租户"架构 | 亚马逊AWS官方博客](ch04/310-ai.md)

---

