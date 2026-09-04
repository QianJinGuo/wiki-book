# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 7.8KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-1.md`

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第一篇：为什么要把 OpenClaw 从单机搬到 AWS，介绍背景动机、7R 迁移策略分析、数据迁移方案，以及部署架构全景。 目录 01 一、背景与动机：将 AI Agent 扩展到多用户场景 02 二、迁移策略分析：这属于 7R 中的哪一

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/)

## 深度分析
**OpenClaw 的"个人工具 → 企业服务"转型**是理解这系列文章的主线。OpenClaw 本质上是一个基于 Node.js 的单进程 AI Agent 框架，单机部署即可满足个人用户需求。但当需要服务多个用户时，原有架构面临五大挑战：用户隔离、弹性扩缩、数据持久化、安全防护、运维可观测性。
**AWS 7R 迁移框架的应用**：

- **Replatform**：将 OpenClaw 从 VPS 迁移到 AgentCore Runtime，获得 Serverless 的扩缩容和按需计费能力。核心改动是运行时替换，代码改动最小。
- **Refactor**：利用 AgentCore 的 Per-Session microVM 架构重新设计多租户隔离机制。这是架构层面的重构。
**多租户隔离的关键设计**：Per-Session microVM 意味着每个用户会话运行在独立的虚拟机中，CPU、内存、文件系统完全隔离。这是比进程隔离更高级别的安全边界。

**三阶段部署架构的依赖编排**：整个部署通过 `deploy.sh` 脚本串联三个阶段——Phase 1 用 AWS CDK 搭建 VPC、子网、IAM 角色等基础设施；Phase 2 用 CodeBuild 构建 ARM64 容器镜像并创建 AgentCore Runtime；Phase 3 部署 Router Lambda、Cron Lambda 等业务逻辑层。分阶段的核心原因是 Phase 3 的 Router Lambda 需要 Phase 2 创建的 AgentCore Runtime ID 才能正确路由消息，体现了基础设施即代码（Infrastructure as Code）在复杂多租户项目中解决组件间输出依赖的典型模式。

**Cognito JWT + STS 的双层身份隔离机制**：多租户安全的核心是 Amazon Cognito 配合 AWS STS 形成的双层隔离。容器内的 Proxy 自动为每个 IM 渠道用户注册 Cognito 身份并签发 JWT Token，用于内部识别"当前在服务哪个用户"——这不是面向用户的登录系统，而是系统内部的身份标签机制。更关键的是，容器启动时调用 STS 生成限制版临时凭证，权限缩小到只能访问当前用户的 S3 前缀、DynamoDB 记录和 Secrets，原始凭证随即删除。这种设计确保用户 A 无法横向越权访问用户 B 的数据，是多租户场景中最关键的安全边界。

**S3 工作区同步与 microVM 无状态设计**：数据持久化采用 S3 工作区同步模式——容器启动时自动从 S3 恢复用户的 `.openclaw/` 目录，运行期间每 5 分钟（可通过 `cdk.json` 的 `workspace_sync_interval_seconds` 配置）将工作区同步回 S3。即使 microVM 因空闲超时或最大生命周期被销毁，用户下次发消息时新 microVM 会自动恢复之前的工作区状态。这种设计把 microVM 的"临时性"和用户体验的"连续性"解耦——开发者看到的是持续对话，底层却是无状态容器的不断创建与销毁。

**ARM64 Graviton 硬件约束**：AgentCore Runtime 运行在 AWS Graviton 处理器上，容器镜像必须用 ARM64 架构构建。CodeBuild 提供原生 ARM64 构建环境，无需本地安装 QEMU 模拟器。这是迁移前必须评估的兼容性成本：已有的 x86 镜像需要重新构建。Graviton 相比 x86 在相同性能下功耗更低、成本更优，但这也意味着选型时需要确认所有依赖库都有 ARM64 版本。

## 实践启示
1. **迁移策略选择**：如果你的 Agent 改动量能接受，优先选择 Replatform（换运行环境不停机）。Refactor（重新架构）适合有足够工程资源且对性能/隔离有更高要求的场景。
2. **数据迁移是容易被低估的环节**：`~/.openclaw/` 目录包含配置、会话、凭证、工作区文件。迁移前需要规划好数据同步方案，避免用户会话丢失。
3. **CDK 基础设施即代码**：使用 AWS CDK 定义基础设施，确保迁移过程可重复、可审计。修改代码后重新 `cdk deploy` 即可完成环境更新。
4. **容器镜像的 ARM64 要求**：AgentCore Runtime 运行在 Graviton 处理器上，构建镜像时必须指定 ARM64 架构。CodeBuild 提供原生 ARM64 构建能力。
5. **多租户安全的核心**：Cognito JWT 鉴权 + STS 临时凭证，实现用户级别的访问控制，避免横向越权。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](../ch04/392-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](../ch04/392-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](../ch04/392-amazon-bedrock-agentcore.html)
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch04/392-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](../ch04/392-amazon-bedrock-agentcore.html)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch04/392-amazon-bedrock-agentcore.html)

---

