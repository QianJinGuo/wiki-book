# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐⭐ | 9.3KB

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第三篇：Phase 1 — 部署基础设施，deploy.sh 脚本解析、CDK 部署 5 个基础 Stack（VPC / Security / Guardrails / AgentCore / Observability）及其创建的资源详解

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/)

## 深度分析
### 五 Stack 划分的深层逻辑：按故障域与变更节奏切分

五个 Stack 不是随意的资源分组，而是沿「故障域 × 变更节奏」两个维度切分的结果：VPC 拓扑一旦定型几乎不动，Security 的密钥与身份策略低频演进，Guardrails 规则要随攻击面持续调优，AgentCore 与 Observability 跟随业务迭代。独立成栈意味着各域可独立部署、独立回滚、互不拖累——栈边界即是团队与变更管理的边界。网络层同样可借鉴：单 VPC（10.0.0.0/16）独占网络命名空间，2 个可用区 × 公有/私有子网是高可用的最小配置；7 个 Interface Endpoint 加 1 个免费的 S3 Gateway Endpoint 让全部 AWS 服务调用走内网不经公网；容器安全组出站仅开 443，从网络层掐断非 HTTPS 的数据外泄通道；deploy.sh 再以 --phase1/--runtime-only/--phase3/--cdk-only 四种分阶段模式把「改哪层、跑哪段」变成命令行开关，而 NAT 出站绑定固定 Elastic IP 则为外部服务预留了 IP 白名单的余地。这种「模块边界 = 组织边界」的思路可平移到任何 Agent 平台。

### Per-User STS 凭证收缩：多租户隔离被做成了运行时属性

全文最值得细读的改造在 AgentCore Stack：共享执行角色的权限天然过大（能触达所有用户数据），解法不是堆叠更多 IAM 角色，而是在容器启动瞬间做凭证收缩——容器内的 Contract Server 调用 STS 签发带 session policy 的临时凭证，把 S3 收缩到当前用户前缀、DynamoDB 收缩到该用户记录、Secrets Manager 收缩到该用户密钥，随后删除原始凭证，AI 进程只持有受限版本，每 45 分钟自动刷新。原始高权限凭证随即删除这一点同样关键——权限收缩不是叠加防护层，而是物理消除高权限凭证的存在；密钥体系亦同构：KMS CMK 全局加密之外，Secrets Manager 按 8 个 Secret 分用途存储（Gateway Token、5 渠道 Token、Webhook Secret 等），把「可独立授权、独立轮换」做进密钥粒度。租户隔离因此从「基础设施预分配」变成「每次会话动态重绘权限边界」：同一容器、同一角色，按当前用户收敛可见数据面。相比按租户分桶/分角色的静态隔离，成本与弹性更优，但安全正确性押在代码路径上，宜对照 [AgentCore 身份与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-identity-security.md) 与 [AgentCore 多租户构建实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md) 交叉验证。

### Guardrails 一等公民化：安全规则即代码

迁移把内容安全从应用内自定义过滤升级为平台层托管，且全部规则硬编码在 guardrails_stack.py 里、随 CDK 走评审与版本管理——安全策略成为可 diff、可回滚的代码资产。规则集按烈度分层：内容过滤覆盖仇恨/侮辱/色情/暴力/不当行为/提示注入六类（提示注入仅输入侧检查）；6 类主题拒绝（加密诈骗、钓鱼、自残、武器制造、恶意软件、身份欺诈）；10 类 PII 分两档——邮箱/电话/用户名匿名化放行，AWS 密钥、口令、PIN 码直接阻断；再叠加自定义关键词与 3 条正则（AKIA 密钥、40 位 Secret、sk- 前缀 API Key）。生产环境锁定 Guardrail Version 快照，杜绝规则更新引发线上行为突变。值得注意的还有 Cognito 的用法：内部身份由容器 Proxy 自动注册，密码用 HMAC 从用户 ID 派生，用户全程无感——身份体系为机器间信任而非人机登录而设计。「规则进代码库 + 版本锁定 + 烈度分层」是 AI 安全治理并入常规工程流程的样板，呼应 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)。

### 可观测性闭环：把隐式运维翻译成告警契约

Observability Stack 的价值不在资源清单，而在把迁移前依赖人肉的运维知识显式化为可执行契约：Bedrock 调用日志（账号级，含用户 ID 与 Token 数）由 Lambda 订阅转成用量统计；统一 Dashboard 收敛 7 类图表（Bedrock 调用量/错误/限流/P99、Runtime 调用量/错误/延迟、Router Lambda 耗时）；4 条告警（Bedrock 错误数、P99 延迟超 10 秒、限流、Router Lambda 错误）全部汇入单一 SNS 主题，运维团队靠一个大盘掌握全局。最有启发的是细节：开启 Bedrock 调用日志属账号级 API，CDK 原生表达不了，须以 Custom Resource 调 PutModelInvocationLoggingConfiguration 兜底——IaC 标准的「逃生舱」模式。四条告警（错误、延迟、限流、路由层健康）勾勒出 Agent 系统的 SLO 雏形，这正是 [托管 Agent 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/managed-agents-architecture.md) 区别于自建运维的核心增量。

## 实践启示
**迁移规划**：采用渐进式迁移策略而非大爆炸式重构。Phase 1 先建基础设施（网络、安全、监控），Phase 2 部署 Runtime，Phase 3 接入业务层。每阶段独立验证，降低整体风险。
**容器构建**：跨架构构建场景下（x86 开发机 + ARM64 生产机），优先选择云端构建服务（CodeBuild），而非尝试本地交叉编译或维护 ARM64 构建机。
**Stack 设计**：参考文中的 5 Stack 划分（VPC/Security/Guardrails/AgentCore/Observability），在实际项目中根据团队边界调整。Security 和 Guardrails 分离是合理设计——Security 负责基础 IAM/VPC，Guardrails 负责内容审核/行为限制。
**运维集成**：deploy.sh 的分阶段执行设计（--phase1/--phase2/--phase3/--cdk-only）提供了灵活的运维弹性。在实际项目中，根据 CI/CD 需求选择性地触发不同阶段，而非每次全量部署。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-6.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-4.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-1.md)
- [CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ci-t-based-on-amazon-bedrock-agentcore-openclaw-enterprise-intelligent-operations-best-practices.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改造为多租户-serverless-架构-.md)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy.md)

---

