# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐⭐ | 8.2KB

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第四篇：Phase 2 3 — 部署 AgentCore Runtime 与业务层，构建 ARM64 容器镜像、创建 AgentCore Runtime，以及部署消息路由、定时任务和 Token 用量监控。 目录 01 五、Phase 2

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/)

## 深度分析

**Phase 2 的部署模型：镜像托管 + 按需 microVM**。AgentCore Runtime 把 Agent 代码打包成容器镜像（Node.js 22 + OpenClaw + ClawHub + AWS SDK）注册托管，运行时按需启动 microVM 执行。两条部署路径：Starter Toolkit（`agentcore configure` + `agentcore deploy` 两条命令，AWS 官方推荐，`deploy.sh` 自动传入 Phase 1 创建的执行角色、子网、Security Group）与手动方式（`docker build → ecr push → create-agent-runtime → create-endpoint`，适合精细控制）。镜像必须为 ARM64——microVM 运行在 Graviton 上，CodeBuild 提供原生 ARM64 构建机、无需 QEMU 模拟，构建约 5-10 分钟。

**Session 与内存隔离**：从"所有用户共享一个进程"到"每用户独立 microVM"的核心改造。Router Lambda 按会话 ID 分配独立 microVM，CPU、内存、文件系统完全隔离；会话空闲到期或结束后 microVM 终止、内存清零。跨调用持久化靠 `/mnt/workspace` 的 Session Storage 挂载：同一会话 ID 再次调用时数据自动恢复，S3 备份兜底，与 [Amazon Bedrock Agentcore Data Persistence File System Session Storage Efs S3](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-data-persistence-file-system-session-storage-efs-s3.md) 的持久化模型一致。这层隔离语义是 [Multi Agent Context Isolation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md) 在 Runtime 层的落地，与 [Firecracker Bedrock Agentcore Multi Tenant](https://github.com/QianJinGuo/wiki-public/blob/main/entities/firecracker-bedrock-agentcore-multi-tenant.md) 同属 microVM 多租户范式。一个 Runtime 可有多个 Endpoint 指向不同版本，本项目只用 DEFAULT。

**Phase 3 业务层：三个依赖 runtime_id 的 Stack**：

- **OpenClawRouter**：API Gateway HTTP API 承载 `/webhook/telegram`、`/webhook/slack`、`/webhook/feishu`、`/health` 四条路由，限流 burst 50 / sustained 100 req/s 防 DDoS。Router Lambda 单入口五步流水线：webhook 签名验证（Telegram secret_token、Slack HMAC、飞书签名）→ 查 DynamoDB 解析身份 → 图片下载到 S3 → 调用 AgentCore 容器 → 回复推回渠道。状态收敛到 `openclaw-identity` 单表，PK/SK 区分 CHANNEL#、USER#、SESSION、BIND#、ALLOW#、CRON# 六类记录，KMS 加密 + PITR。
- **OpenClawCron**：EventBridge Scheduler 统一调度组，用户在对话中说"每天早上 8 点提醒我"，容器内 `create_schedule` 工具即建 schedule，按用户 ID 权限隔离；`openclaw-cron-executor`（Python 3.13）查任务上下文、调容器、把结果发回原渠道。
- **OpenClawTokenMonitoring**：CloudWatch Subscription Filter 实时把 Bedrock 调用日志送入 Token Metrics Lambda，逐条提取 Token 数并估算成本写入 TokenUsageTable（3 个 GSI 支持按渠道/模型/日期排名，90 天 TTL 清理）。两个预算告警（每小时 100 万 Token、$5，阈值来自 cdk.json）之外还有异常检测器：偏离历史均值 2 个标准差即告警，能识别"总量未超预算但模式异常"（如半夜突发调用）——静态阈值做不到。

**IAM 最小授权**：每个组件独立执行角色——Router Lambda 授权调 AgentCore、读写 DynamoDB、读 Secrets Manager、上传 S3、异步自调用；Cron Lambda 去掉 S3 与自调用、保留 Secrets Manager（取渠道 Bot Token）；EventBridge Scheduler 单独触发角色。避免多租户下"一个大角色全权通行"。

**成本/延迟权衡**：Replatform 收益是自动扩缩容、Per-Session 隔离、按需计费；代价是构建链路变长，且需用 `sessionTimeoutSeconds` 在资源利用率与用户体验间取舍——空闲会话及时释放，否则 microVM 空转。Token 监控是多租户按量分摊的前提：没有 per-call 用量记录，就无法把 Bedrock 成本映射回具体用户/渠道。这一路径与 [Building Multi Tenant Agents With Amazon Bedrock Agentcore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md) 的官方多租户模式互相印证。

## 实践启示
1. **构建耗时的预期**：CodeBuild 构建 ARM64 镜像需要 5-10 分钟。使用 `screen` 或 `nohup` 避免终端断开导致构建中断。
2. **Per-Session 隔离的意义**：每个用户会话分配独立 microVM，会话间完全隔离。这意味着一个用户的高负载不会影响其他用户的体验。
3. **消息路由的设计**：Lambda 路由需要维护"会话 ID → microVM endpoint"的映射。建议使用 Redis 或 DynamoDB 存储这个映射表。
4. **成本监控的必要性**：AgentCore 按使用量计费，需要在业务层实现 Token 用量追踪。CloudWatch Metrics + Lambda 实现自动告警。
5. **Session 超时管理**：配置合理的 `sessionTimeoutSeconds`，平衡资源利用率和用户体验。空闲会话应及时释放。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-3.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-6.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-1.md)
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ci-t-based-on-amazon-bedrock-agentcore-openclaw-enterprise-intelligent-operations-best-practices.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改造为多租户-serverless-架构-.md)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy.md)

---

