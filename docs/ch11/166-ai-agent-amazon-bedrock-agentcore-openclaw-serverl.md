# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客

## Ch11.166 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 6.7KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-6.md`

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第六篇：清理资源与总结展望，删除部署资源、迁移前后对比回顾，以及进一步探索方向。 目录 01 十、清理资源 02 十一、总结与展望 十、清理资源 部署完成后，建议删除所有资源避免持续产生费用。 第一步：删除 AgentCore Runtim

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/)

## 深度分析
**这是 OpenClaw 从单机到多租户 Serverless 架构迁移系列文章的第六篇，也是收尾篇**。前五篇分别覆盖了迁移策略（Replatform vs Refactor）、架构设计、租户隔离、运行时配置等，本篇聚焦于资源清理与整体复盘。这六篇系列构成了一个完整的"AI Agent 现代化改造方法论"——从评估现状、制定策略、到实施落地、最后到收尾清理。
**Replatform 与 Refactor 两种策略代表了不同的现代化路径**。Replatform 是将现有系统迁移到托管服务（如将 EC2 上的 OpenClaw 迁移到 Bedrock AgentCore），保留应用架构不变；Refactor 则是借迁移机会重新设计架构，利用云原生特性（如多租户 Serverless）。前者风险低、周期短，后者收益大但复杂度高。选择哪种策略取决于业务优先级、团队能力和时间窗口。
**多租户 Serverless 架构的核心挑战是"隔离"**。包括计算隔离（不同租户的 Agent 不会相互影响）、数据隔离（租户数据严格分离）、权限隔离（资源访问控制）、成本隔离（各租户独立计费）。Bedrock AgentCore 的多租户支持是 AWS 在这一领域的深度优化，简化了开发者需要处理的隔离复杂度。
**资源清理是容易被忽视但至关重要的环节**。云资源的持续计费可能带来意外成本，尤其是迁移过程中产生的临时资源。建议在完成迁移后立即清理所有过渡资源，并建立资源生命周期管理规范。

## 实践启示
1. **迁移前做充分的架构评估**：参考系列文章第一篇的评估框架，明确当前系统的瓶颈、迁移目标、团队能力和时间窗口，再决定采用 Replatform 还是 Refactor。
2. **多租户设计要考虑"隔离"的多个层次**：不仅仅是计算和存储的隔离，还包括权限、成本、监控等。建议在设计阶段就将隔离作为核心需求而非事后添加的约束。
3. **建立资源生命周期清单**：每次部署新资源时，记录其用途、创建时间和预期保留期限。这可以大幅简化后续的清理工作，也能避免"无人知道这个资源是否还在使用"的困境。
4. **迁移完成后立即清理过渡资源**：不要等到季度审计时才想起来清理。迁移过程中的临时资源（如过渡数据库、测试用的 Bedrock 实例）如果不及时清理，会持续产生费用。
5. **保留迁移过程的文档**：

   - 本系列文章本身就是很好的复盘素材，可以作为团队知识沉淀
   - 包括踩坑记录、配置决策、测试结果等
   - 这些文档对后续的架构演进和新人 onboarding 都有价值
6. **关注成本监控的持续性**：多租户 Serverless 的成本模型与单机部署有显著差异。建议在迁移完成后建立租户级别的成本监控，及时发现异常消费模式。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](../ch11-186-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](../ch11-191-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch11-193-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单/)
- [CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch11-056-ci-amp-t基于-amazon-bedrock-agentcore-与-openclaw-的企业级智能运维最佳实践/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](../ch11-076-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch11-147-当-ai-agent-学会-忘记-amazon-bedrock-agentcore-memory-的记忆哲学-亚/)

---

