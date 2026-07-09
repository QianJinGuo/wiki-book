# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇

## Ch11.129 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇

> 📊 Level ⭐⭐ | 8.2KB | `entities/openclaw-multi-6.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw-multi-6.md)

## 标签
#aws #bedrock #agentcore #openclaw #serverless
**原文**: [Openclaw Multi 6](ch11/214-openclaw.html)(raw/articles/openclaw-multi-6.md)

## 相关实体
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/214-openclaw.html)
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](../ch04/048-openclaw-multi-agent-team-practice-v2.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇](ch11/214-openclaw.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch04/512-amazon-bedrock-agentcore.html)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](ch11/214-openclaw.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](../ch04/512-amazon-bedrock-agentcore.html)

## 摘要
基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第六篇：清理资源与总结展望，删除部署资源、迁移前后对比回顾，以及进一步探索方向。

## 资源清理
### 删除顺序至关重要
1. **先删 AgentCore Runtime**：`agentcore destroy --agent openclaw_agent` — 否则 CDK 删除 Stack 时因依赖关系失败
2. **再删 CDK Stack**：`cdk destroy --all` — 一次性删除所有8个 Stack
3. **最后手动删除 RETAIN 资源**：S3 桶（先清空再删）、DynamoDB 表、KMS 密钥（需7-30天排队删除）、ECR 仓库、Secrets Manager Secrets、CloudWatch Log Groups

### RETAIN 保留策略
CDK Stack 删除后，S3/KMS/DynamoDB 等设置了 RETAIN 的资源会保留下来——这是防止数据误删的保护机制。但也意味着需要手动清理，否则会继续计费。

## 迁移前后对比
| 维度 | 迁移前 | 迁移后 | 策略 |
|------|--------|--------|------|
| 运行环境 | VPS 上 `openclaw gateway` 单进程 | AgentCore Runtime，Per-Session microVM | Replatform |
| 用户隔离 | 所有用户共享进程和文件系统 | 每用户独立 microVM + STS scoped credentials | Refactor |
| 数据持久化 | 本地 `~/.openclaw/` 目录 | Amazon S3 + Workspace Sync，按用户前缀隔离 | Refactor |
| 安全 | 应用层自行实现 | VPC + KMS + Bedrock Guardrails + STS + Secrets Manager | Replatform |
| 监控 | 本地日志文件 | CloudWatch Dashboard + Alarm + X-Ray + Token 统计 | Replatform |
| 扩缩容 | 手动扩容 | AgentCore 按会话自动扩缩 | Replatform |

## 进一步探索方向
| 方向 | 说明 |
|------|------|
| 接入更多 IM 渠道 | 项目预留了 Slack/Discord/WhatsApp 的 Secret 槽位，Router Lambda 已内置 Slack HMAC 验证逻辑 |
| 自定义 Guardrails | 修改 `stacks/guardrails_stack.py` 中的过滤规则，适配业务场景 |
| 迁移已有工作区数据 | 将 `~/.openclaw/` 下的 Markdown 文件上传到 S3 用户桶对应前缀 |
| 多区域部署 | 每个区域创建独立工作目录，Dashboard 名称已加区域后缀 |
| 成本优化 | 缩短 `session_idle_timeout`、子代理用更便宜模型、设置更严格预算告警 |

## 深度分析
### 1. Replatform + Refactor 混合策略的本质
这篇文章是理解这个混合策略的最佳总结。核心洞察：**不是非此即彼的选择，而是在不同维度做最合适的决策**。

- **Replatform 维度**：运行环境、安全、监控、扩缩容——这些用 AWS 托管服务直接替换，收益明确
- **Refactor 维度**：多租户隔离、数据持久化、消息路由——这些需要重新设计架构，不能简单迁移
实际项目中常见的错误是：

- **过度 Refactor**：明明可以直接迁移的组件，非要重写
- **Replatform 执念**：明明需要重新设计的部分，硬要用迁移的方式

### 2. Per-Session microVM 的成本账
microVM 按会话启停，听起来成本很高。但实际：

- **共享底层资源**：microVM 是轻量级虚拟化，多个 microVM 可以共享底层物理机资源
- **按需计费**：会话结束后 microVM 终止，不计费
- **Lambda 补充**：Router/Cron Lambda 按调用计费，空闲时零成本
对比传统 VPS 固定月费：低负载时 Serverless 成本更低，高负载时自动扩缩不需要人工干预。

### 3. 数据迁移的隐性成本
"迁移已有工作区数据"听起来简单——上传到 S3 就好了。但隐性成本：

- **历史数据清理**：旧 VPS 上的数据要不要保留？
- **格式转换**：本地 `.openclaw/` 目录结构 vs S3 前缀结构是否兼容？
- **用户通知**：数据迁移后使用习惯变化，需要用户适应

### 4. 多区域部署的运维复杂度
多区域部署听起来很美好（高可用、低延迟），但实际运维复杂度：

- **配置漂移**：各区域的 cdk.json 需要独立维护
- **数据同步**：DynamoDB 有全局表但成本高，S3 跨区域复制需要额外配置
- **监控聚合**：各区域的 CloudWatch Dashboard 需要汇总到统一视图
- **成本叠加**：每个区域独立资源，成本是单区域的 N 倍

## 实践启示
### 资源清理
1. **建立清理清单**：部署前就列出所有资源类型和删除顺序，而不是最后手忙脚乱
2. **KMS 密钥删除要排队**：7-30天的等待期意味着如果想彻底清理环境，需要提前操作
3. **S3 桶必须先清空**：即使删除了 CloudFormation Stack，S3 桶里的文件还在，必须手动清空才能删除桶

### 成本优化实操
1. **session_idle_timeout 调优**：从 1800 秒（30分钟）缩短到 900 秒（15分钟），microVM 运行时间减半，成本直接下降
2. **子代理模型降级**：如果 subagent 不需要顶级模型能力，设置 `subagent_model_id` 为更便宜的模型
3. **预算告警先设严**：上线初期设置严格告警，跑一段时间后根据实际用量调整阈值

### 迁移检查点
1. **数据完整性验证**：迁移后用户能否正常访问历史数据？工具调用是否正常？
2. **性能回归测试**：Serverless 架构的冷启动延迟是否可接受？
3. **安全审计**：白名单机制、Secrets Manager 访问、Guardrails 配置是否正确？

### 架构演进路径
1. **先 Replatform 再 Refactor**：不要一开始就想做完美的多租户架构，先把应用跑在托管服务上
2. **监控驱动优化**：通过 Token 用量大盘和异常检测发现优化点
3. **按需扩展能力**：多区域、更多 IM 渠道都是后续可以按需添加的能力，不需要一开始就设计好

### 团队能力要求
1. **CDK 基础设施代码**：需要 Python + CDK + AWS 服务知识
2. **容器镜像构建**：ARM64 + Docker + ECR
3. **DynamoDB 数据建模**：PK/SK 设计、GSI 使用
4. **Serverless 架构理解**：microVM 生命周期、Lambda 限制、EventBridge 调度
这是典型的新型云原生 AI Agent 全栈工程，需要多个领域知识的交叉。

---

