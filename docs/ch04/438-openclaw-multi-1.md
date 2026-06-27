# openclaw-multi-1

## Ch04.438 openclaw-multi-1

> 📊 Level ⭐⭐ | 5.0KB | `entities/openclaw-multi-1.md`

## 深度分析

**1. OpenClaw 从"个人工具"到"多租户平台"的演变揭示了 AI Agent 的扩展路径**

OpenClaw 默认单进程部署（npm install + daemon），所有用户共享一个 Node.js 进程和同一个文件系统 。当企业需要支持多用户时，面临用户隔离、弹性扩缩、数据持久化、安全防护、运维可观测性五个维度的挑战 。这五个挑战几乎是所有从"个人工具"走向"企业服务"的 AI 项目的必经之路，理解这个框架有助于提前规划架构演进路线 。

**2. 混合 Replatform + Refactor 策略是实际迁移中的最优解**

OpenClaw 的迁移并非单纯 Replatform 或 Refactor，而是两者交织：Replatform 处理"运行环境平移"（AgentCore Runtime、模型调用、安全、监控、扩缩容），Refactor 处理"多租户架构重构"（用户隔离、数据持久化、消息接入） 。这种混合策略避免了在所有维度同时进行高风险重构，是大规模系统迁移的务实路径 。

**3. Per-Session microVM 隔离是多租户 Agent 的核心技术突破**

AgentCore Runtime 按会话动态分配 microVM，每用户独立运行环境，隔离 CPU、内存、文件系统；配合 AWS STS Per-User 临时凭证限制数据访问权限 。这解决了传统多租户方案（如容器 namespace 隔离）的根本缺陷——之前多租户 AI Agent 的主要安全隐患是共享进程中的 Prompt 注入和数据泄露风险，microVM 级别隔离从根本上消除了这一风险 。

**4. Workspace Sync 机制在 Serverless 和持久化存储之间建立了桥梁**

microVM 的临时性（空闲超时销毁）与用户工作区持久化需求之间的矛盾，通过 S3 Workspace Sync 解决：运行期间每 5 分钟同步 .openclaw/ 目录到 S3，新 microVM 启动时自动恢复用户状态 。这一设计对于所有需要"无状态执行 + 有状态持久化"的 AI Agent 架构都有普遍参考价值 。

**5. AWS Cognito 在容器内部承担了用户身份标签的核心职责**

容器内的 Bedrock Proxy 使用 Cognito 为每个渠道用户注册身份、签发 JWT Token，用于容器内部识别"当前在服务哪个用户" — 这不是面向用户的登录系统，而是系统内部的数据路由标签机制 。理解这一点对于设计多租户 AI 系统至关重要：身份标签决定了文件存储、数据隔离、用量统计的路由方向。

## 实践启示

1. **在迁移规划阶段用 7R 框架评估每个改造维度** — OpenClaw 案例中，运行环境、模型调用、安全监控、扩缩容适合 Replatform（直接替换为托管服务），而用户隔离、数据持久化、消息接入需要 Refactor（重新设计架构） 。企业迁移时应逐维度分析，避免"全面重构"或"平移式迁移"两个极端。

2. **优先迁移 API 密钥到 Secrets Manager** — 已有 OpenClaw 工作区的用户应先将 agents/*/auth-profiles.json 中的 API 密钥存入 AWS Secrets Manager，再迁移 .openclaw/ 下的 Markdown 文件到 S3 用户桶 。敏感信息的集中加密管理是多租户安全的基石。

3. **配置 Workspace Sync 时设置合理的同步间隔** — cdk.json 中的 workspace_sync_interval_seconds 默认为 300 秒（5 分钟），对于高频使用场景可缩短至 60 秒，但对于写操作频繁的工作流（如长文档编辑）应注意 S3 请求成本与数据丢失风险的平衡 。

4. **至少配置一个 IM 渠道（建议飞书或 Telegram）才能实际使用** — 项目没有独立 UI，完全依赖 Telegram/Slack/飞书作为用户交互入口，不配置渠道则 API Gateway 收不到任何消息 。部署完成后应优先完成渠道配置并进行端到端验证。

5. **在设计多租户隔离时，优先考虑 Per-User STS 凭证而非应用层权限控制** — AWS STS 生成的限制版临时凭证在 microVM 层面即限制了用户 A 无法访问用户 B 的 S3 前缀和 DynamoDB 记录，比在应用代码中做权限判断更可靠 。

## 关联阅读

## 相关实体
- [Openclaw Multi 4](/ch04-440-openclaw-multi-4//)
- [Openclaw Multi 3](/ch04-390-openclaw-multi-3//)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](/ch04-329-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro//)
- [Strands Agents Cloud Cost Optimizer](/ch04-128-基于-strands-agents-构建亚马逊云科技云成本分析与优化-ai-助手//)
- [Aws Bedrock Agentcore Identity Security](/ch04-171-agentcore-identity-3-legged-oauth-session-binding的安全架构//)
- MOC

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-multi-1.md)

---

