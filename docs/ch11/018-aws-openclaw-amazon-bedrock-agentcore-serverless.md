# 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构

## Ch11.018 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构

> 📊 Level ⭐⭐ | 22.1KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-5.md`

# "基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构"
---
title: "AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇 | Amazon Web Services"
url: https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/
source: rss
feed_name: AWS China Blog
---
摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第五篇：配置消息渠道与端到端验证，配置 Telegram / 飞书 Bot、发送第一条消息、查看监控大盘和日志。
**目录**
01[七、配置消息渠道](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/#section1)
02[八、发送消息验证](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/#section2)
03[九、查看监控和日志](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/#section3)
04[相关链接](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/#section4)

* * *

## 七、配置消息渠道
基础设施和运行时都部署完了，现在需要把 IM 渠道的消息推送接到我们的 [Amazon API Gateway](https://aws.amazon.com/cn/api-gateway/) 上。这一步对应的是 Refactor 中"消息接入"维度的改造 — 传统 OpenClaw 的 Gateway 直接监听端口，现在改为通过 webhook 回调的方式接入。
本步骤至少选一个渠道配置。
选哪个渠道？Telegram 配置步骤最少；飞书适合国内企业环境但步骤多。本节先讲 Telegram，飞书见后半部分。

### 选项 A：配置 Telegram
A1：用 BotFather 创建 Telegram Bot

*   在 Telegram 中搜索 `@BotFather`（官方账号，带蓝色对勾）并开启对话
*   发送 `/newbot`
*   BotFather 提示：请起个显示名字（Name），例如 `OpenClaw Demo`
*   BotFather 提示：请起个 username，必须以 `bot` 结尾，全局唯一，例如 `my_openclaw_demo_bot`
*   成功后 BotFather 会回复一段包含 Token 的消息，格式类似：
`123456789:***`

*   把这个 Token 复制保存（后面要用）
为什么做这一步：BotFather 是 Telegram 官方的 Bot 管理入口。Token 相当于 Bot 的身份凭证，请像密码一样妥善保管，不要提交到公开代码仓库。
A2：把 Token 存入 AWS Secrets Manager
```
aws secretsmanager update-secret \
  --secret-id openclaw/channels/telegram \
  --secret-string 'YOUR_BOT_TOKEN' \
  --region $TARGET_REGION
```
PowerShell
把上面的 `YOUR_BOT_TOKEN` 替换成 BotFather 给你的真实 Token。
为什么做这一步：在 Phase 1 部署时，`openclaw/channels/telegram` 这个 Secret 就已经创建了但里面是空占位值，现在把真实 Token 填进去。容器和 Router Lambda 会从 Secrets Manager 读取这个 Token 与 Telegram 通信。这也是迁移中安全维度的改进 — 传统 OpenClaw 把 API 密钥存在本地的 `auth-profiles.json` 文件里，现在统一由 AWS Secrets Manager 加密管理。
这一步必须在运行 setup-telegram.sh 之前完成，因为脚本会从 Secrets Manager 读取 Token 来注册 webhook。
A3：运行 Telegram 配置脚本
```
./scripts/setup-telegram.sh
```
PowerShell
脚本会自动：
1.   从 Secrets Manager 读取你刚存的 Token
2.   从 [AWS CloudFormation](https://aws.amazon.com/cn/cloudformation/) 读取 API Gateway URL
3.   调用 Telegram `setWebhook` API，把 webhook 指向 `{ApiUrl}/webhook/telegram`，同时传入 secret_token 用于后续的签名验证
4.   提示你输入 Telegram user ID（纯数字，不是 username），自动写入 DynamoDB 白名单
为什么做这一步：如何找到自己的 Telegram user ID？有两种方法：
① 在 Telegram 里搜索 `@userinfobot`，给它发任意消息，它会回复你的数字 user ID
② 或者先给你的新 Bot 发一条消息（会被系统拒绝，但拒绝消息里会显示你的 user ID）
为什么需要白名单？默认 `registration_open=false`，只有 DynamoDB 里有 `ALLOW#telegram:xxx` 记录的用户才能用 Bot。这样你的 Bot 不会被陌生人滥用。后续想加更多用户，用 `./scripts/manage-allowlist.sh add telegram:user_id`。

### 选项 B：配置飞书
B1：创建飞书自建应用
1.   打开飞书开放平台 [https://open.feishu.cn/app](https://open.feishu.cn/app)（需要企业飞书账号）
2.   点击"创建企业自建应用"，填写应用名称、描述、图标
3.   创建后进入应用详情页，在左侧菜单找到"添加应用能力"，添加机器人能力
为什么做这一步：飞书的 Bot 能力挂在"自建应用"下，一个应用可以开启多种能力（机器人、网页应用、小程序等），这里我们只需要机器人。
B2：配置权限
在应用详情页 → 权限管理，添加以下 5 个权限：

*   `im:message` — 接收用户消息
*   `im:message:send_as_bot` — 以机器人身份发消息
*   `im:message.content:readonly` — 读取消息内容
*   `im:chat:readonly` — 读取群组信息
*   `im:resource` — 下载图片/文件
为什么做这一步：这些权限是 Bot 能收发消息和处理图片的基础。飞书的权限比较细粒度，需要逐个开启。
B3：配置事件订阅
在应用详情页 → 事件订阅：
1.   先开启加密策略：生成 `Encrypt Key` 和 `Verification Token`，保存备用（后面要填入 Secrets Manager）
2.   请求地址填入：`{API_URL}webhook/feishu`（API_URL 从 CloudFormation `OpenClawRouter` stack 的 `ApiUrl` 输出获取）
3.   订阅模式选择"将事件发送至开发者服务器"
4.   添加事件：

    *   `im.message.receive_v1`（必须）— 接收用户消息
    *   `im.chat.member.bot.added_v1`（推荐）— 机器人被加入群
    *   `im.chat.member.bot.deleted_v1`（推荐）— 机器人被移出群
为什么做这一步：飞书的 webhook 事件是 AES-256-CBC 加密的（需要 Encrypt Key 解密），Verification Token 用来验证请求确实来自飞书。Router Lambda 已经内置了解密和验证逻辑。
B4：发布应用
在应用详情页 → 版本管理与发布，提交发布申请并等待企业管理员审批通过。
重要：没发布的应用只有开发者自己能看到，其他用户在飞书里搜不到你的 Bot。必须发布后才能实际使用。
B5：运行飞书配置脚本
```
./scripts/setup-feishu.sh
```
PowerShell
脚本会交互式提示你输入 4 个凭证（都能在飞书开发者后台找到）：

*   App ID：凭证与基础信息 → App ID
*   App Secret：凭证与基础信息 → App Secret
*   Verification Token：事件订阅 → 加密策略
*   Encrypt Key：事件订阅 → 加密策略
然后脚本会：

*   把 4 个凭证以 JSON 格式存入 Secrets Manager（`openclaw/channels/feishu`）
*   提示你输入自己的飞书 open_id（格式 `ou_xxxxxxxx`），加入白名单
为什么做这一步：如何找到自己的 open_id？先给 Bot 发一条消息，因为你还没在白名单里，系统会拒绝并在日志里记录你的 open_id，可以去 CloudWatch `/openclaw/lambda/router` Log Group 查看。

## 八、发送消息验证
到这一步，整个迁移改造已经完成。现在来验证端到端的消息链路是否打通。下面的时序图展示了一条消息从用户发出到 AI 回复的完整旅程 — 这也是迁移后架构的实际运行路径：
**容器内部：microVM 里的三个进程**
| 进程 | 角色 | 职责 |
| --- | --- | --- |
| Contract Server | 管家 | microVM 的入口进程。负责健康检查（`/ping`）、请求路由（`/invocations`）、工作区同步（S3 ↔ 本地）、STS 限制版凭证管理（每 45 分钟刷新）。OpenClaw 启动前，由内置的 Lightweight Agent 临时应答 |
| OpenClaw | 主力 | 真正的 AI Agent 进程。启动后接管所有用户请求，执行 17 个内置工具和 5 个预装社区技能 |
| Bedrock Proxy | 翻译官 | OpenClaw 原生使用 OpenAI 格式的 API 调用，Proxy 将其转换为 Amazon Bedrock ConverseStream API 格式，同时注入 Guardrails 配置 |
第一步：给 Bot 发送第一条消息
在 Telegram 中找到你的 Bot，发送：
```
你好，介绍一下你自己
```
PowerShell
为什么做这一步：第一条消息会触发冷启动：AgentCore Runtime 为你的会话创建一个新的 microVM，大约 10-15 秒后由 Lightweight Agent 先响应。后续消息不需要重新创建 microVM，响应速度取决于 AI 回复的复杂度（简单问题几秒，复杂问题可能十几秒）。
第二步：测试常用功能
| 发送什么 | 测试什么能力 | 涉及的迁移改造点 |
| --- | --- | --- |
| "帮我搜一下今天北京天气" | web_search 工具（NAT Gateway 出网） | 网络架构（VPC + NAT） |
| 发一张图片并问"这是什么" | 图片上传 + Bedrock 多模态 | S3 存储 + 模型调用 Replatform |
| "帮我把这段文字存到 notes.md" | write_user_file 工具（S3 用户文件） | 数据持久化 Refactor |
| "列出我的文件" | list_user_files 工具 | Per-User S3 前缀隔离 |
| "每天早上 8 点提醒我喝水" | create_schedule 工具（EventBridge 定时任务） | 定时任务 Refactor |
为什么做这一步：每种测试对应架构中的一个组件，验证整个迁移链路是否打通。

## 九、查看监控和日志
监控是 Replatform 带来的直观运维体验提升。迁移后，所有组件的日志、指标、告警都集中在 Amazon CloudWatch 里，通过统一的 Dashboard 即可掌握系统运行状态。
第一步：查看 Router Lambda 日志
去 CloudWatch → Log groups → `/openclaw/lambda/router`
为什么做这一步：这里能看到每条消息的完整处理过程：webhook 验证、用户查询、调用 AgentCore、响应返回。排错时第一站。
第二步：查看 AgentCore 容器日志
去 CloudWatch → Log groups → 搜 `bedrock-agentcore/runtimes/openclaw_agent`
为什么做这一步：容器内部的运行日志：Contract Server 启动过程、Proxy 调用 Bedrock、OpenClaw 工具执行等。
第三步：查看用量大盘
去 CloudWatch → Dashboards → `OpenClaw-Token-Analytics-`
为什么做这一步：看到你刚才对话消耗了多少 Token、估算成本。用量大盘的数据来自 Bedrock 调用日志 → Token Metrics Lambda → DynamoDB + CloudWatch 指标。
第四步：查看 [Amazon DynamoDB](https://aws.amazon.com/cn/dynamodb/) 数据
去 DynamoDB 控制台 → `openclaw-identity` 表 → Explore items
为什么做这一步：能看到几种记录：`CHANNEL#telegram:xxx`（渠道映射）、`USER#xxx`（用户信息）、`SESSION`（当前会话）、`ALLOW#`（白名单）、`CRON#`（定时任务）。

## 相关链接
**➡️ 下一步行动：**
**相关产品：**

*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [Amazon S3](https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2) — 适用于 AI、分析和存档的几乎无限的安全对象存储
*   [Amazon CloudWatch](https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=3) — 可观测性工具
*   [Amazon Secrets Manager](https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=4) — 密钥管理
*   [Amazon DynamoDB](https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=5) — 无服务器分布式 NoSQL 数据库
**系列文章：**

*   [第一篇：为什么要把 OpenClaw 从单机搬到 AWS](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=1)
*   [第二篇：环境准备与代码获取](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/?p=bl_ar_l=2)
*   [第三篇：Phase 1 — 部署基础设施](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=3)
*   [第四篇：Phase 2 & 3 — 部署 AgentCore Runtime 与业务层](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=4)
*   [第六篇：清理资源与总结展望](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/?p=bl_ar_l=5)

## 深度分析
本文是 OpenClaw → Bedrock AgentCore 迁移系列的第五篇，聚焦于**消息渠道接入与端到端验证**，是整个迁移路径的"最后一公里"。从架构视角看，这一阶段完成了两个关键转变：
**从端口监听到 Webhook 回调**：传统 OpenClaw 的 Gateway 直接在服务器端口上监听 IM 平台的推送，这种模式在 Serverless 环境下无法复用。迁移后，Telegram 和飞书都通过各自平台的 Webhook 机制将消息推送到 Amazon API Gateway，再由 Router Lambda 分发。这一设计将"消息接收"从应用层解耦到网关层，实现了真正的无状态接入。
**安全模型的升级**：原有的 `auth-profiles.json` 本地存储模式存在明显的密钥泄露风险。迁移后，所有渠道凭证统一管理于 AWS Secrets Manager，Router Lambda 和容器运行时通过 IAM 权限按需读取，无需在代码或配置文件中明文存放凭证。白名单机制（`registration_open=false` + DynamoDB ALLOW 记录）进一步将访问控制细化到用户粒度。
**microVM 内三进程协作模型**揭示了容器内部的精细分工：Contract Server 作为入口代理（承担健康检查、凭证轮换、工作区同步），OpenClaw 作为真正的业务进程，Bedrock Proxy 作为协议翻译层。这种职责分离使得每个组件可以独立演进（例如 Proxy 的替换不需要改动 OpenClaw 本身），也便于独立扩缩容。
端到端验证表格的设计逻辑值得借鉴——每条测试用例都映射到具体的架构组件和改造维度，这种"验证即文档"的方法让非作者也能快速理解迁移的完整覆盖范围。

## 实践启示
1. **优先配置 Telegram 再飞书**：如果时间有限，优先验证 Telegram 渠道（步骤最少），确认端到端链路畅通后再投入飞书配置。飞书的加密策略（Encrypt Key + Verification Token）和发布审批流程会使调试周期显著拉长。
2. **凭证写入先于脚本运行**：Telegram 的 `setup-telegram.sh` 和飞书的 `setup-feishu.sh` 依赖 Secrets Manager 中已就绪的凭证。错误顺序（先跑脚本再填凭证）会导致脚本执行失败，需要重新运行。
3. **白名单是生产安全的基础**：`registration_open=false` + DynamoDB 白名单是防止 Bot 被陌生人滥用的第一道防线。初始配置完成后，建议立即通过 `./scripts/manage-allowlist.sh` 添加所有受信任用户，再开放渠道。
4. **冷启动延迟需要纳入 UX 设计**：首次消息触发 microVM 创建约需 10-15 秒，用户体验上这是"等待但有响应"。建议在 Bot 欢迎消息或文档中告知用户首次交互会有稍长延迟，避免用户误以为 Bot 无响应而重复发送消息。
5. **监控大盘是运维的主入口**：CloudWatch 的 Router Lambda 日志是排查消息路由失败的第一站；AgentCore 容器日志用于排查 OpenClaw 本身的问题；Token Analytics 大盘用于实时评估 AI 成本。三个视角缺一不可，建议运维团队为每个视角准备标准化的查询过滤条件。
## 相关实体
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/530-amazon-bedrock-agentcore.html)
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](../ch04/530-amazon-bedrock-agentcore.html)
- [Openclaw Multi 2](ch11/224-openclaw.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 3](../ch04/530-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 6](../ch04/530-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-amazon-bedrock-agentcore-openclaw-multi-5.md)

---

