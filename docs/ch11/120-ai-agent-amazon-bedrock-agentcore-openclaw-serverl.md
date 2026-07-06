# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇

## Ch11.120 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇

> 📊 Level ⭐⭐ | 8.6KB | `entities/openclaw-multi-5.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-multi-5.md)

## 标签
#aws #bedrock #agentcore #openclaw #serverless
**原文**: [Openclaw Multi 5](ch11/213-openclaw.md)(raw/articles/openclaw-multi-5.md)

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](ch11/213-openclaw.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/213-openclaw.md)
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](ch04/043-openclaw-multi-agent-team-practice-v2.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](ch03/045-agent.md)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](ch04/069-ai.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](ch03/045-agent.md)

## 摘要
基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第五篇：配置消息渠道与端到端验证，配置 Telegram / 飞书 Bot、发送第一条消息、查看监控大盘和日志。

## 消息渠道配置
### 架构转变
传统 OpenClaw 的 Gateway 直接监听端口，现在改为 webhook 回调方式接入 API Gateway——这是 Refactor 中"消息接入"维度的改造。

### Telegram Bot 配置流程
1. **BotFather 创建 Bot**：获得 `123456789:***` 格式的 Token
2. **Secrets Manager 存储 Token**：`openclaw/channels/telegram` Secret 填入真实 Token
3. **setup-telegram.sh 自动配置**：注册 webhook 到 API Gateway URL + 用户白名单写入 DynamoDB

### 飞书自建应用配置
相比 Telegram 更复杂，5个必需权限：

- `im:message` — 接收用户消息
- `im:message:send_as_bot` — 以机器人身份发消息
- `im:message.content:readonly` — 读取消息内容
- `im:chat:readonly` — 读取群组信息
- `im:resource` — 下载图片/文件
飞书事件订阅使用 AES-256-CBC 加密，需要配置 Encrypt Key 和 Verification Token。

### 白名单机制
`registration_open=false` 时，只有 DynamoDB 中有 `ALLOW#telegram:xxx` 或 `ALLOW#feishu:open_id` 记录的用户才能使用 Bot——这是多租户访问控制的第一道防线。

## 端到端消息链路
### 完整旅程
```
用户发送消息 → Telegram/飞书服务器 → API Gateway /webhook/telegram → Router Lambda
    → 验证签名 → 查 DynamoDB 用户身份 → 调用 AgentCore Runtime
    → 分配/复用 microVM → OpenClaw 处理 → Bedrock Proxy 转换 → Bedrock 推理
    → 回复 → Router Lambda → 推送回 IM 渠道 → 用户收到回复
```
冷启动时序：用户发消息 → AgentCore 创建新 microVM（10-15秒）→ Lightweight Agent 先响应 → OpenClaw 完全启动后接管。

### 功能验证矩阵
| 测试场景 | 验证能力 | 涉及迁移改造点 |
|---------|---------|--------------|
| "搜一下今天北京天气" | web_search 工具（NAT Gateway 出网） | VPC + NAT 网络架构 |
| 发图片问"这是什么" | 图片上传 + Bedrock 多模态 | S3 存储 + 模型调用 Replatform |
| "把这段存到 notes.md" | write_user_file 工具 | S3 用户文件持久化 |
| "列出我的文件" | list_user_files 工具 | Per-User S3 前缀隔离 |
| "每天8点提醒我喝水" | create_schedule 工具 | EventBridge 定时任务 Refactor |

## 可观测性体系
### 四层日志架构
1. **Router Lambda 日志**：`/openclaw/lambda/router` — 每条消息的完整处理过程
2. **AgentCore 容器日志**：`bedrock-agentcore/runtimes/openclaw_agent` — 容器内部运行日志
3. **Token 用量大盘**：`OpenClaw-Token-Analytics-{region}` — 6个图表展示用量趋势
4. **DynamoDB 数据**：`openclaw-identity` — 渠道映射、用户信息、会话、白名单、定时任务记录

### 监控数据流
```
Bedrock 调用日志 → CloudWatch Subscription Filter → Token Metrics Lambda
    → DynamoDB TokenUsageTable + CloudWatch 指标 → Dashboard
```

## 深度分析
### 1. Webhook 架构的安全权衡
Webhook 模式相比端口监听的优势：

- **公网暴露面最小化**：只有 API Gateway 公网可达，Lambda/DynamoDB/AgentCore 都在 VPC 内部
- **水平扩展**：API Gateway 自动扩缩，不需要管理服务器
- **签名验证**：每条消息都有加密签名，无法伪造
代价是：

- **延迟增加**：Telegram/飞书服务器 → API Gateway → Lambda → AgentCore，多了一跳
- **调试复杂度**：消息链路涉及多个服务，需要分布式追踪

### 2. 白名单机制的多租户隔离
`registration_open=false` + DynamoDB 白名单是简洁有效的访问控制：

- **简单**：不需要复杂的 RBAC
- **低成本**：DynamoDB 按请求计费，白名单检查是简单的 GetItem
- **可审计**：DynamoDB 可以开启 CloudTrail 记录所有访问
但局限是：

- **无法支持细粒度权限**：不同用户不同权限需要扩展
- **管理界面缺失**：需要手动调用 manage-allowlist.sh 脚本添加用户

### 3. Lightweight Agent 的过渡角色
冷启动时 Lightweight Agent 先响应这个设计很有价值：

- **用户体验**：用户不会看到"Bot 无响应"的尴尬期
- **架构容错**：AgentCore Runtime 还在启动，但请求已经被接受
- **成本权衡**：Lightweight Agent 是极简版响应，复杂推理还是需要等 OpenClaw 完全启动

### 4. 多渠道的统一抽象
Router Lambda 处理 Telegram/飞书/Slack 三种渠道，但它们的消息格式、签名算法、API 完全不同。统一抽象的关键是：

- **DynamoDB 单表存储渠道映射**：`CHANNEL#telegram:xxx` 和 `CHANNEL#feishu:xxx` 用不同前缀区分
- **Router Lambda 内部路由**：根据 API Gateway 路径 `/webhook/telegram` vs `/webhook/feishu` 区分
- **回复推送统一**：不管哪个渠道，回调时都使用各渠道的 Bot Token

## 实践启示
### 渠道配置
1. **Token 安全存储**：Bot Token 一旦泄露，他人可以伪装 Bot 发消息。Secrets Manager 加密存储，不要提交到代码仓库
2. **先配置 Token 再运行脚本**：setup-telegram.sh 会从 Secrets Manager 读取 Token，顺序不能错
3. **飞书发布需要审批**：自建应用必须企业管理员审批才能对外使用，开发测试时用测试白名单

### 调试技巧
1. **Router Lambda 日志是第一站**：看到消息来了但 Bot 没回复？先看这里
2. **AgentCore 容器日志看内部**：Router Lambda 调用成功但响应不对？需要看容器内部 OpenClaw 的执行日志
3. **DynamoDB 查白名单**：Bot 拒绝服务？先确认 `ALLOW#` 记录存在

### 生产检查清单
1. **第一条消息测试**：验证冷启动链路，预期10-15秒响应
2. **工具功能覆盖测试**：至少测试上述5个场景，确保各组件正常
3. **监控大盘数据验证**：确认 Token 统计、对话记录正确写入
4. **错误注入测试**：主动发异常消息，验证错误处理和日志记录

### 运维关注点
1. **microVM 生命周期**：空闲超时后 microVM 终止，新请求需要重新冷启动
2. **S3 用户文件隔离**：Per-User 前缀 `userfiles/{user_id}/` 确保数据隔离
3. **跨渠道绑定**：`BIND#` 记录支持同一用户的多渠道绑定（如同时用 Telegram 和飞书）

---

