# OpenClaw 多用户部署（四）：AgentCore Serverless 容器化

## Ch11.215 OpenClaw 多用户部署（四）：AgentCore Serverless 容器化

> 📊 Level ⭐⭐ | 4.8KB | `entities/openclaw-multi-4.md`

## 深度分析

**1. AgentCore Runtime 代表了 Serverless 在 AI Agent 领域的关键落地**

AgentCore Runtime 将 OpenClaw 从"一台服务器上的 Node.js 进程"变成 AWS 托管的 Serverless 容器，实现了从手动管理进程到自动按需启停 microVM 的根本转变 。这意味着 AI Agent 的运行时管理正式进入了 Serverless 时代——用户无需为闲置容量付费，空闲超时自动销毁，成本模型从"包月服务器"变为"按调用计费" 。

**2. Phase 2/3 的阶段性部署设计体现了 IaC 编排的核心价值**

Phase 2 必须先于 Phase 3 完成，因为 Router Lambda 和 Cron Lambda 需要知道 AgentCore Runtime ID 才能部署 。这种依赖关系通过 CDK IaC 声明式管理，使得"部署"变成了可重复、可审计、可回滚的操作。对于复杂的多租户系统，分阶段部署是管理依赖链路的唯一有效手段 。

**3. ARM64 容器镜像构建是 AgentCore 部署的技术门槛**

AgentCore Runtime 要求容器镜像必须是 ARM64 架构（运行在 AWS Graviton 芯片上），CodeBuild 提供 ARM64 构建机原生构建，无需本地 QEMU 模拟 。这一细节对有 ARM 适配需求的团队有重要启示：云端构建服务（如 CodeBuild）可以屏蔽底层架构差异，但构建产物仍然必须符合目标运行平台的架构要求 。

**4. 消息路由层（OpenClawRouter）重构为 Serverless 是 Refactor 策略的核心体现**

迁移前 OpenClaw 的 Gateway 直接监听 webhook；迁移后通过 Amazon API Gateway + Lambda Router 处理所有渠道的 webhook，实现了多渠道接入的统一入口 。这是从"应用层协议处理"到"平台层网关服务"的关键重构——API Gateway 自带的限流（burst 50/s sustained 100/s）和访问日志能力，直接替换了原来需要自行开发或配置的反向代理/负载均衡组件 。

**5. Token 用量监控体系为多租户成本分摊奠定了数据基础**

OpenClawTokenMonitoring 通过订阅 Bedrock 调用日志实时解析 Token 数并估算成本，配合 CloudWatch Dashboard 和 Alarm 实现用量可视化 。DynamoDB 单表 + 3 个 GSI 支持按渠道/模型/日期多维查询，90 天 TTL 自动清理——这种设计在小红书、Slack、飞书等多渠道并行使用的场景下，是实现精细化成本管控的基础设施 。

## 实践启示

1. **采用 Starter Toolkit 的 `agentcore deploy` 两命令部署模式** — Phase 2 的部署通过 `agentcore configure` + `agentcore deploy` 两条命令完成，比手动逐步执行 docker build → ecr push → create-agent-runtime → create-endpoint 更高效且可靠，生产部署应优先使用官方工具链 。

2. **用 EventBridge Scheduler Group 实现多租户定时任务的统一管理** — OpenClawCron 通过一个 EventBridge Scheduler Group 容纳所有用户的定时任务，按用户 ID 做权限隔离，所有任务共用一个 Cron Lambda 执行器 。这种"共享执行器 + 隔离任务定义"的模式是 Serverless 定时任务的最佳实践。

3. **构建 Token 用量异常检测机制** — Anomaly Detector 基于历史数据学习正常用量范围，偏离 2 个标准差即触发告警 。对于多租户 AI Agent 服务，建议配置双阈值告警（每小时 Token 总量和估算成本），避免总量未超标但调用模式异常的情况。

4. **部署完成后验证 Runtime 状态** — 去 Amazon Bedrock 控制台 → AgentCore → Agent Runtimes 确认 openclaw_agent Runtime 状态为 Ready，同时检查 cdk.json 中的 runtime_id 和 runtime_endpoint_id 已被正确填充 。

5. **Phase 3 的 Router Lambda 需要 Phase 2 输出的 Runtime ID** — 在自动化部署脚本中确保两个 Phase 的依赖顺序，或在 CDK 中通过 CloudFormation 隐式引用处理 。

## 关联阅读

## 相关实体
- [Openclaw Multi 1](ch11/213-openclaw.md)
- [Openclaw Multi 3](ch11/213-openclaw.md)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](ch03/045-agent.md)
- [Strands Agents Cloud Cost Optimizer](ch03/045-agent.md)
- [Aws Bedrock Agentcore Identity Security](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-multi-4.md)

---

