# 深入浅出 Harness Engineering 之核心模式与理念

> 📊 Level ⭐⭐⭐ | 5.4KB | `entities/harness-engineering-core-patterns-claude-code.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-core-patterns-claude-code.md`，一手来源仍见下方 sources。

## 机制与论文
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md) — 13141字最全科普版
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [Claude Code and What Comes Next](257-claude-code-and-what-comes-next.html) — 压缩/Skills/Subagents
- [Harness Engineering Deletable Worksite Ruofei](../ch05/039-harness-engineering-deletable-worksite-ruofei.html) — 可删工作现场：Vercel删80%工具成功率反升
- [从零构建大语言模型 —— 读完这篇你就懂了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-llm-from-scratch-7-chapters-zion.md) — LLM教程七章

## 工程实践
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md) — 数据级harness解读
- [高德 Marketing AutoResearch：AI Native 营销增长经营托管框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-marketing-growth-amap-ai-native.md) — 营销经营托管
- [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — 写入纪律prompt cache冲突
- [AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — 四支柱解析版
- [你不知道的 Agent：原理、架构与工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md) — 真实内容harness影响实证
- [Anthropic Institute《When AI builds itself》深度解读：AI 进入 AI 研发执行层、瓶颈迁移与研发级 Harness（架构师 JiaGouX）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-institute-when-ai-builds-itself-jiagoux-interpretation.md) — 解读短条borderline
- [面向大型代码库的 Claude Code 团队落地经验与扩展策略（Agent Harness）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-team-deployment-agent-harness.md) — 13模式全版
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md) — 定时AI任务7x24
- [长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-long-running-governance-five-cards-ruofei.md) — don't automate slop+5张卡治理
- [让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md) — MetaTool分层注册设计
- [Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-community-fork-evolution-vibecoder.md) — 社区fork演进短条
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.md) — Cedar策略+Lambda拦截器双模式
- [腾讯云Agent Memory：Mermaid无限画布×上下文卸载](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencentdb-agent-memory-context-offloading.md) — Mermaid画布上下文卸载
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [小刘商业 Agent 增强层通用基座](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-xiaolaoliu-business-agent-augmentation-layer-general-base-20260606.md) — 基座+增强层论点短条
- [本地 vs 云端 Agent 的现场之争：当下选本地，终局云端（行小招）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/local-vs-cloud-agent-onsite-context-debate-xingxiaozhao.md) — 当下本地终局云端的现场判断
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-autoresearch-software-development-niaowo.md) — AutoResearch迁移软开+交叉审核

## 延伸导航
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)
- [第 2 层全库索引：交互实践](https://github.com/QianJinGuo/wiki-public/blob/main/moc/layer-2-interaction.md)

---

