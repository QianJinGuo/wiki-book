# OpenClaw 多智能体团队搭建实战经验

> 📊 Level ⭐ | 5.0KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/openclaw-multi-agent-team-practice.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [17种Agent架构演进：控制流设计的完整演化史](https://github.com/QianJinGuo/wiki-public/blob/main/entities/17-agent-architectures-evolution.md) — 17架构系统拆解高价值
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- [Microsoft Build 2026：微软 AI 独立日 —— 7 款 MAI 模型 + Scout 智能体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-build-2026-mai-models-scout-agent.md) — Build 2026：MAI独立日13755字rv9全版
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hiclaw-v110-k8s-hermes-worker.md) — HiClaw K8s Controller-Reconciler架构分析

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [wow-harness v3：AI 开发的治理协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wow-harness-v3-governance-protocol.md) — 事件溯源跨session治理协议
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-2.md) — 环境准备步骤篇
- [Claude Code Dynamic Workflows 多Agent编排](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-multi-agent-orchestration.md) — Dynamic Workflows主版32k
- [Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agent-teams-task-decomposition-ruofei.md) — 拆任务控权限
- [Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-12-layer-full-configuration-guide.md) — 12层满配指南11566字rv9
- [OpenCLAW 完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-comprehensive-guide.md) — OpenClaw系统教程5760字
- Openclaw Multi Agent Team Practice V2 — 七Agent花园团队：专精胜于全能12180字全版
- [扣子 3.0 协作系统：项目化 + Agent 编排 + 工具链打通](https://github.com/QianJinGuo/wiki-public/blob/main/entities/coze-3-0-collaboration-system.md) — 扣子协作系统
- [扣子 3.0 多 Agent 协同实战：指挥所有 Agent 的 Agent + 5 人团队 6 步流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/coze-3-multimagent-team-orchestration-wangheige.md) — 三案例实战报告
- [Waylens OpenClaw 多智能体平台 EKS+Operator 改造案例](https://github.com/QianJinGuo/wiki-public/blob/main/entities/waylens-openclaw-multi-agent-eks-operator-case.md) — EKS+CRD+Operator平台自管理
- [Hermes+Kimi K2.6 多Agent军团实战教程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-k2-6-tutorial.md) — 六Profile军团实战9590字全教程
- [我用阿里 AgentScope 复刻了一个 WorkBuddy — 从开源框架到可运行 Agent 的实践拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我用阿里-agentscope-复刻了一个-workbuddy.md) — Toolkit权限四层工具架构
- [OpenAgents Workspace：多 Agent 协作平台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openagents-workspace-multi-agent-collaboration-itech.md) — Agent孤岛问题：Workspace+Launcher+Network SDK

## 关联

- 同题异语种孪生页：[龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)（归并候选，提案卡 #11 批1）

---

