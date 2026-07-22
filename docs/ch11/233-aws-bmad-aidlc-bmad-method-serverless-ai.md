# AWS BMad + AIDLC：用 BMAD Method 在 Serverless 上跑通可复制的 AI 驱动开发流程

## Ch11.233 AWS BMad + AIDLC：用 BMAD Method 在 Serverless 上跑通可复制的 AI 驱动开发流程

> 📊 Level ⭐⭐ | 4.6KB | `entities/aws-bmad-aidlc-spec-ship-reproducible-engineering.md`

# AWS BMad + AIDLC：用 BMAD Method 在 Serverless 上跑通可复制的 AI 驱动开发流程

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bmad-aidlc-spec-ship-reproducible-engineering.md)

AWS China Blog（2026-07-14）发表了一篇深度文章，介绍如何用 **BMAD Method（Build More Architect Dreams）** 框架在 AWS Serverless 上实现 **AIDLC（AI-Driven Developer Lifecycle）** 方法论，将 AI 驱动开发转化为可复制的工程流程。

## 核心架构：AIDLC 三阶段 + Review Gate

AIDLC 将开发过程划分为三个阶段，阶段之间由不可跳过的 **Review Gate（评审门禁）** 隔开：

1. **Inception（启动阶段）** — AI Agent 基于 Product Brief 并行产出 PRD、架构文档、测试策略；人定义约束、回应澄清、做即时反馈
2. **Construction（构建阶段）** — TDD 模式实现代码、CDK 基础设施、E2E 测试；人审阅每个 Story 的测试与实现
3. **Operations（运维阶段）** — 监控配置、告警规则、部署流水线定义；人提供业务 SLA 与运维约束

**关键设计思想**：Review Gate 不是"人唯一介入的地方"，而是"人必须签字放行的地方"。人始终在环（Human-in-the-Loop），贯穿每个阶段内部，不只是阶段间的关卡。AI 负责并行产出和起草，人负责定义约束、即时纠偏、做决策、最终验收。

## BMAD 的 Agent 约束机制

BMAD 使用 **TOML 配置文件**定义每个 Agent 的行为空间，这是整套方法的关键技术设计——没有约束的 Agent 在面对开放式问题时倾向于扩大讨论范围。以架构师 Agent 为例，配置包括：

- 技术栈已锁定（AWS Lambda + API Gateway + DynamoDB + CDK TypeScript）
- 数据库模式已确定（DynamoDB 单表设计）
- 认证方案已选（JWT via Lambda Authorizer）
- 时间约束（30 分钟完成架构文档）

约束机制确保各 Agent 在同一框架标准下并行工作。

## TDD 作为 AI 验证机制

文章强调**代码层面的正确性验证由 TDD 承担**，而非人工逐行审读。测试就是 AI 产出代码的可执行合同，比人工逐行 review 更高效可靠。人的精力应投入到 AI 看不出的语义和决策问题（涉及领域惯例、隐含假设、跨文档间接依赖），而机械的行级校验交给测试。

## 与现有实体的差异化

该文章与 wiki 中已有实体相比的独特贡献：

1. **平台化视角** — AWS 官方出品的 AIDLC 实施指南，从云平台基础设施角度讲述，区别于 [spec-kit-bmad-sdd-practice-yexiaocha](../ch01/997-spec.html) 的个人实践者视角
2. **完整的约束机制示范** — 给出 BMAD TOML 配置文件的完整形态和分类，比 叶小钗 的对比文章更侧重 BMAD 作为框架的运行时机制
3. **Serverless 技术栈锁定** — 以 AWS Lambda + API Gateway + DynamoDB + CDK 作为具体实施参考，区别于其他泛化讨论
4. **Review Gate 的分阶段设计** — 给出了 Inception/Construction/Operations 各阶段的具体 AI vs 人工分工表
5. **多人团队协作模型** — 含 BMAD Party Mode 的多 Agent 交叉检查机制

→ [AI-DLC 紫讯 AI 原生研发实践](../ch05/019-ai-native.html)
→ [Harness Engineering 概念](../ch05/116-harness-engineering.html)
→ [SDD 规格驱动开发总结](../ch01/768-qoder.html)
→ [Spec-Kit + OpenSpec + Superpowers 混合 Harness](../ch05/050-openspec.html)

## 局限性

文章基于一个 Workshop 场景演示流程，Agent 配置包含时间限制等 Workshop 特有约束（如"30 分钟内完成架构文档"），并非生产推荐的配置值。实际项目中时间预算和技术约束应根据系统复杂度灵活调整。

---

