# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客

## Ch11.203 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 5.6KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-4.md`

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第四篇：Phase 2 3 — 部署 AgentCore Runtime 与业务层，构建 ARM64 容器镜像、创建 AgentCore Runtime，以及部署消息路由、定时任务和 Token 用量监控。 目录 01 五、Phase 2

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/)

## 深度分析
**Phase 2 是整个迁移的核心**：将 OpenClaw 从"Node.js 进程"转变为"AgentCore 托管的 Serverless 容器"。这一阶段由 `deploy.sh` 自动执行，主要做了两件事：(1) 构建 ARM64 容器镜像到 ECR；(2) 创建 AgentCore Runtime。
**Starter Toolkit vs 手动部署**：

- **Starter Toolkit**（`agentcore configure + agentcore deploy`）：AWS 推荐，两条命令完成 Phase 2，适合快速原型。
- **手动方式**（`docker build → ecr push → create-agent-runtime → create-endpoint`）：适合需要精细控制的场景。
**ARM64 架构的约束**：AgentCore Runtime 运行在 Graviton 处理器上，必须构建 ARM64 镜像。CodeBuild 提供原生 ARM64 构建机，无需本地 QEMU 模拟。
**Phase 3 业务层部署的关键组件**：

- **消息路由 Lambda**：接收用户消息，按会话 ID 分发到对应的 AgentCore Runtime microVM。这是多租户路由的核心。
- **定时任务 Lambda**：处理定时触发的工作流，如每日报告生成、定期数据同步。
- **Token 用量监控**：基于 CloudWatch + Lambda 实现，按用户/会话追踪 Token 消耗，支持成本分摊。

## 实践启示
1. **构建耗时的预期**：CodeBuild 构建 ARM64 镜像需要 5-10 分钟。使用 `screen` 或 `nohup` 避免终端断开导致构建中断。
2. **Per-Session 隔离的意义**：每个用户会话分配独立 microVM，会话间完全隔离。这意味着一个用户的高负载不会影响其他用户的体验。
3. **消息路由的设计**：Lambda 路由需要维护"会话 ID → microVM endpoint"的映射。建议使用 Redis 或 DynamoDB 存储这个映射表。
4. **成本监控的必要性**：AgentCore 按使用量计费，需要在业务层实现 Token 用量追踪。CloudWatch Metrics + Lambda 实现自动告警。
5. **Session 超时管理**：配置合理的 `sessionTimeoutSeconds`，平衡资源利用率和用户体验。空闲会话应及时释放。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](../ch04/501-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](../ch04/501-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch04/501-amazon-bedrock-agentcore.html)
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch04/501-amazon-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](../ch04/501-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch04/501-amazon-bedrock-agentcore.html)

---

