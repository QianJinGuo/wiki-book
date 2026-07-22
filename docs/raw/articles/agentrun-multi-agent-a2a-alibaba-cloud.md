---
source_url: "https://mp.weixin.qq.com/s/bhZsfLaNVd9T69SE0cLbvA"
title: "从单兵作战到团队协作：AgentRun 的多 Agent 生产级协作方案"
source: "阿里云云原生 / 丛霄 / 悠逸"
ingested: 2026-06-15
sha256: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"
type: raw
tags: [agentrun, multi-agent, a2a, agentcard, service-discovery, alibaba-cloud, orchestrator, workspace]
---

从单兵作战到团队协作：AgentRun 的多 Agent 生产级协作方案

多 Agent 并不是新概念，难点也不在于把任务拆给几个 Agent。真正卡住生产落地的，是拆完之后怎么让它们稳定地互相发现、互相调用、互相信任，并且在团队、环境、权限和链路追踪上可管理。

AgentRun 的定位：用 A2A 开放协议打破智能体孤岛，用工作空间提供生产级管理，让开发者把精力放回 Agent 能力本身。

01 从单 Agent 到多 Agent：为什么协作难落地

自建多 Agent 系统需要解决的工程问题：
- 注册中心：哪些 Agent 在线？属于哪个环境？
- 服务发现：调用方如何找到合适的 Agent？
- 跨 Agent 鉴权：谁可以发现谁、调用谁？凭证如何轮转？
- 调度编排：复杂任务如何拆解、分发、重试、聚合？
- 环境隔离：开发、测试、生产的 Agent 如何避免串用？
- 链路追踪：跨多个 Agent 如何定位慢调用和失败点？

02 为什么选择 A2A

A2A（Agent-to-Agent）是 Google 主导的开放协议，价值：
- 自描述：通过 AgentCard 描述能力与接入方式
- 可发现：基于标准入口获取 AgentCard
- 可互通：不同团队/平台/运行环境的 Agent 统一接入
- 可演进：协议层定义连接方式，平台层补齐管理能力

03 A2A 发现机制原理

AgentCard：标准 JSON 文档，描述——
- 是谁：名称、描述、版本、提供方
- 能做什么：技能列表（Skills），每个有 ID、名称、描述、示例问法
- 怎么访问：URL、传输协议（JSON-RPC / gRPC）
- 什么限制：认证方式、是否支持流式

默认托管在 /.well-known/agent-card.json。

服务发现：A2A 不强制定义中心化注册表，需要发现层管理注册和查询。

04 AgentRun 多 Agent 管理

三个核心概念：
1. 工作空间（Workspace）：逻辑隔离的 Agent 集合，类似项目空间/命名空间
2. 发现端点（Discovery Endpoint）：按环境隔离的发现入口（default 用于调试，production 只含稳定版）
3. 平台托管 vs 外部 Agent：统一发现体验

| 类型 | 部署方式 | 注册方式 | 状态流转 |
|------|---------|---------|---------|
| 平台托管 Agent | AgentRun 部署到 FC | 通过创建注册 | CREATING → READY |
| 外部 Agent | 自行部署 | 手动注册 | 直接 READY |

凭证安全：发现端点内置 API Key / HTTP Basic Auth 验证，凭证与工作空间解耦。

05 实战：希希咖啡厅

coffee_agent（点单/菜单/订单）+ delivery_agent（配送/状态）→ 注册到工作空间 → 配置发现端点 → curl discovery API 拿到 a2aAgentCardUrl

06 超级 Agent（Orchestrator）

用户意图 → 超级 Agent 拆解子任务 → 动态调用专职 Agent

生产级方案五要素：
- 开放互通：基于 A2A，避免私有协议锁死
- 统一治理：工作空间+发现端点+凭证体系
- 服务端编排：超级 Agent 服务端调度
- 生产可观测：跨 Agent 调用链路可追踪可审计
- 渐进演进：先管起来再调度

相关链接：
[1] AgentRun 控制台: https://functionai.console.aliyun.com/
[2] A2A Protocol: https://a2a-protocol.org/latest/specification/
[3] a2a-go SDK: https://github.com/a2aproject/a2a-go
[4] AgentRun Python SDK: https://github.com/Serverless-Devs/agentrun-sdk-python
[5] 产品文档: https://help.aliyun.com/zh/functioncompute/fc/what-is-agentrun
