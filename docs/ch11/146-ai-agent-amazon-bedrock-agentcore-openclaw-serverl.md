# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇

## Ch11.146 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇

> 📊 Level ⭐⭐ | 7.7KB | `entities/openclaw-multi-2.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw-multi-2.md)

## 标签
#aws #bedrock #agentcore #openclaw #serverless
**原文**: [Openclaw Multi 2](ch11/225-openclaw.html)(raw/articles/openclaw-multi-2.md)

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](ch11/225-openclaw.html)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/225-openclaw.html)
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](../ch04/048-openclaw-multi-agent-team-practice-v2.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇](ch11/225-openclaw.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch04/523-amazon-bedrock-agentcore.html)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](../ch04/030-ai-agent.html)

## 摘要
基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第二篇：环境准备与代码获取，安装依赖工具、配置 AWS 环境、克隆项目代码、了解 cdk.json 配置项，以及初始化 CDK。

## 环境准备要点
### 核心依赖栈
| 组件 | 版本要求 | 作用 |
|------|---------|------|
| Python | 3.12+ | CDK 应用编写 |
| Node.js | 20+ | CDK CLI 运行 |
| Docker | 最新 | 环境完整性 |
| AWS CDK | v2 | 基础设施编排 |
| AgentCore Toolkit | 最新 | Runtime 管理 |

### AWS X-Ray 分布式追踪配置
X-Ray 是迁移前后最关键的差异点之一。原来单进程时出问题看一份日志即可，现在十几个组件串联，必须靠分布式追踪把整条链路串起来：API Gateway → Router Lambda → AgentCore 容器 → Bedrock → Guardrails。

### cdk.json 配置架构
cdk.json 是整个项目的配置中枢，关键参数分类：
**部署目标**

- `region`：部署区域（从环境变量读取）
- `availability_zones`：VPC 可用区（留空则自动选 2 个）
**模型配置**

- `default_model_id`：主 Agent 使用 `global.anthropic.claude-sonnet-4-6`（跨区域推理）
- `subagent_model_id`：子代理模型（空则复用主模型，可设更便宜的）
**Runtime 运行参数**

- `session_idle_timeout`：900秒（15分钟）→ 默认1800秒
- `session_max_lifetime`：上限28800秒（8小时）
- `workspace_sync_interval_seconds`：容器内工作区同步到 S3 的间隔（5分钟）
**Lambda 配置**

- `router_lambda_timeout_seconds`：600秒（冷启动时 Lightweight Agent 约10-15秒）
- `cron_lambda_timeout_seconds`：900秒
- `cron_lead_time_minutes`：5（任务触发前5分钟预热容器）
**预算与安全**

- `daily_token_budget`：100万 Token（实际检查周期是1小时）
- `daily_cost_budget_usd`：5美元
- `registration_open`：false（白名单模式）
- `enable_guardrails`：默认启用 Bedrock Guardrails 

## CDK 初始化流程
### Bootstrap 原理
`cdk bootstrap` 在目标账号+区域创建一个 CDKToolkit Stack，包含：

- S3 桶（存储 CloudFormation 模板和 Lambda 代码包）
- ECR 仓库（如果需要）
- IAM 角色（CDK 运行时需要的执行角色）
每个账号+区域组合只需执行一次。

### cdk synth 的双重价值
`synth` 命令将 Python CDK 代码"编译"成 CloudFormation 模板，同时运行 cdk-nag 安全检查，验证是否有明显的安全配置错误。

### 部署前必要补丁
```bash

# AWS Marketplace 权限（模型访问验证需要）
self.execution_role.add_to_policy(iam.PolicyStatement(
    actions=["aws-marketplace:ViewSubscriptions", "aws-marketplace:Subscribe"],
    resources=["*"]
))

# Dashboard 名称加区域后缀（多区域部署防冲突）
dashboard_name=f"OpenClaw-Operations-{region}"
```

## 深度分析
### 1. 环境准备作为架构选择的缩影
这篇文章看似只是"装工具"，实则揭示了 Serverless AI Agent 架构的依赖复杂度：

- **运行时隔离**：通过 CodeBuild 在 ARM64（Graviton）上构建镜像，确保与 AgentCore microVM 架构一致
- **配置驱动**：所有可调参数集中在 cdk.json，避免代码侵入
- **渐进式验证**：check.sh 7项检查确保环境就绪后再推进，避免在部署阶段才发现工具缺失

### 2. X-Ray 配置的深层含义
从单进程到多组件架构，排错方式必须根本性改变。X-Ray 将请求链路可视化，但更关键的是**日志统一化**——所有组件日志汇聚到 CloudWatch，这是云原生运维的基础设施思维。

### 3. 多租户 Serverless 的成本模型
通过 `daily_token_budget` 和 `daily_cost_budget_usd` 的双预算机制，结合 CloudWatch Alarm，实现：

- **事前预防**：Token 用量超阈值立即告警
- **异常检测**：Anomaly Detector 基于历史数据识别模式异常
- **按需计费**：AgentCore microVM 按会话启停，Router/Cron Lambda 按调用计费

### 4. Workspace Sync 的数据持久化策略
`workspace_sync_interval_seconds: 300`（5分钟）意味着：容器内 `.openclaw/` 目录每5分钟同步到 S3，会话中断后同一 ID 可恢复。但这也是数据一致性的妥协——5分钟内的数据在容器异常终止时会丢失，需要应用层做容错。

## 实践启示
### 环境标准化
1. **建立环境检查清单**：check.sh 的思路可复用到任何复杂部署——将所有依赖项脚本化，上来先跑一遍
2. **版本锁定**：cdk.json 中的 `image_version: 70` 机制——改版本号+重新部署会强制 AgentCore 重新拉取镜像，这是蓝绿发布的基础
3. **区域感知的命名**：Dashboard 名称加区域后缀，避免多区域部署时资源名冲突

### 配置管理
1. **区分环境变量和代码配置**：`CDK_DEFAULT_ACCOUNT`/`CDK_DEFAULT_REGION` 从环境变量读取，模型 ID/预算阈值写入 cdk.json——环境差异配置化
2. **理解参数的检查周期**：名义上的 "daily" 预算实际是1小时检查一次，这个细节影响告警阈值设计
3. **保留策略防误删**：`RETAIN` 删除策略保护 S3 桶/KMS 密钥，防止数据因操作失误丢失

### 迁移检查点
1. **先 synth 再 deploy**：`cdk synth` 是免费的预览步骤，应该成为标准流程的一部分
2. **AgentCore Runtime 必须先删**：资源删除顺序很重要——Runtime 依赖 CDK Stack，但 destroy 时 CDK 不知道这个依赖关系
3. **Secrets Manager 集中管理凭证**：从 `auth-profiles.json` 本地存储到 AWS Secrets Manager 加密管理，是安全架构升级的关键一步

---

