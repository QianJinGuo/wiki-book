# AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客

## Ch11.197 AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 5.9KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-3.md`

## 概述
AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 by awschina on 08 5月 2026 in Migration Transfer Services Permalink Share 摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第三篇：Phase 1 — 部署基础设施，deploy.sh 脚本解析、CDK 部署 5 个基础 Stack（VPC / Security / Guardrails / AgentCore / Observability）及其创建的资源详解

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、OpenClaw、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/)

## 深度分析
本文展示了 AI Agent 迁移中的 **Replatform vs Refactor 策略选择框架**。Replatform（换底座不换核心）= 用 AWS 托管服务替代手动运维，地基打好但不做架构重构；Refactor = 重新设计以充分利用云原生能力。文章强调 Replatform 是当前阶段的务实选择——用 Bedrock AgentCore 的托管能力替代 OpenClaw 的手动运维，降低运营负担同时保留业务逻辑完整性。
**Phase 1 基础设施栈的模块化价值**：CDK 一次性声明式部署 5 个基础 Stack（VPC/Security/Guardrails/AgentCore/Observability），解决了传统 Agent 部署中网络配置、安全防护、监控告警需要手动串联的问题。这种"先建基础设施，再跑业务"的顺序符合企业级部署的标准流程。
**BUILD_MODE=codebuild 的实际考量**：AgentCore 要求 ARM64 镜像，而开发环境通常是 x86。CodeBuild 模式启用云端 ARM64 原生构建，解决了跨架构构建的兼容性问题。这是一个典型的不对称资源问题——本地 ARM64 构建机成本高、利用率低，云端按需构建更经济。
**多租户 Serverless 架构的核心优势**：通过 AgentCore 实现多租户隔离，租户间共享底层资源但逻辑隔离，兼顾成本效率和安全性。这对于 AI Agent 这类潮汐 workload（使用率波动大）尤其有价值——Serverless 自动 scaling 特性避免了资源预留浪费。

## 实践启示
**迁移规划**：采用渐进式迁移策略而非大爆炸式重构。Phase 1 先建基础设施（网络、安全、监控），Phase 2 部署 Runtime，Phase 3 接入业务层。每阶段独立验证，降低整体风险。
**容器构建**：跨架构构建场景下（x86 开发机 + ARM64 生产机），优先选择云端构建服务（CodeBuild），而非尝试本地交叉编译或维护 ARM64 构建机。
**Stack 设计**：参考文中的 5 Stack 划分（VPC/Security/Guardrails/AgentCore/Observability），在实际项目中根据团队边界调整。Security 和 Guardrails 分离是合理设计——Security 负责基础 IAM/VPC，Guardrails 负责内容审核/行为限制。
**运维集成**：deploy.sh 的分阶段执行设计（--phase1/--phase2/--phase3/--cdk-only）提供了灵活的运维弹性。在实际项目中，根据 CI/CD 需求选择性地触发不同阶段，而非每次全量部署。

## 相关实体
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](../ch04/499-amazon-bedrock-agentcore.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](../ch04/499-amazon-bedrock-agentcore.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch04/499-amazon-bedrock-agentcore.md)
- [CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch04/499-amazon-bedrock-agentcore.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](../ch04/499-amazon-bedrock-agentcore.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch04/499-amazon-bedrock-agentcore.md)

---

