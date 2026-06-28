## Ch08.017 AgentRun：阿里云多 Agent 生产级协作方案（A2A 开放协议）

> 📊 Level ⭐⭐⭐ | 9.6KB | `entities/agentrun-multi-agent-a2a-alibaba-cloud.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentrun-multi-agent-a2a-alibaba-cloud.md)

## 摘要

阿里云 AgentRun 是基于 Google A2A 开放协议的多 Agent 生产级协作平台。它针对「自建多 Agent 系统」最常卡住的六大工程问题（注册发现、跨 Agent 鉴权、调度编排、环境隔离、链路追踪、凭证治理）提供开箱即用的解决方案 —— 通过 AgentCard 自描述、工作空间隔离、发现端点分层、超级 Agent 服务端调度，让多 Agent 协作从实验室原型走向生产系统。

## 一句话

**A2A 开放协议 + 工作空间隔离 + 发现端点分层 + 超级 Agent 服务端调度 = 多 Agent 从实验室到生产。**

## 核心架构

| 层 | 职责 | 关键抽象 |
|---|------|---------|
| A2A 协议层 | AgentCard 自描述 + 标准通信 | `/ .well-known/agent-card.json` |
| 工作空间层 | 逻辑隔离 + 权限独立 | Workspace（命名空间） |
| 发现端点层 | 按环境暴露发现入口 + 凭证验证 | Discovery Endpoint（default / production） |
| 超级 Agent 层 | Orchestrator 拆解任务 + 动态调度 | Server-side Orchestrator |

## 核心要点

### 1. AgentCard：A2A 协议的「自描述身份证」

AgentCard 是一个标准 JSON 文档，默认托管在 `/.well-known/agent-card.json`。它回答四个问题：
- **是谁**：名称、描述、版本、提供方
- **能做什么**：Skills 列表（每个有 ID、名称、描述、示例问法）
- **怎么访问**：URL、传输协议（JSON-RPC / gRPC）
- **什么限制**：认证方式、是否支持流式

类比一下：AgentCard 之于 Agent，等于 OpenAPI Spec 之于 REST API。在没有 AgentCard 之前，每个 Agent 团队都要自己定义"我是谁、怎么调我"的描述格式，调用方要写一堆适配代码。AgentCard 把这个标准化了。

### 2. 工作空间（Workspace）：项目级隔离单位

工作空间是逻辑隔离的 Agent 集合，类比 Kubernetes 的 Namespace 或云账号的项目。同一工作空间内的 Agent 默认互通，跨工作空间需要显式授权。

设计意图：让多团队协作时，可以"各管各的 Agent"，不会出现 A 团队的测试 Agent 误调到 B 团队的线上 Agent。

### 3. 发现端点（Discovery Endpoint）：环境分层

按环境隔离的发现入口：
- **default 端点**：调试用，包含所有 Agent（含未稳定版）
- **production 端点**：只包含稳定版 Agent，凭证体系独立

调用方通过不同端点 URL 拿到不同 Agent 列表。配合 API Key / HTTP Basic Auth，凭证与工作空间解耦 —— 一个工作空间可以有多个发现端点对应不同环境。

### 4. 平台托管 vs 外部 Agent 统一体验

| 类型 | 部署方式 | 注册方式 | 状态流转 |
|------|---------|---------|---------|
| 平台托管 Agent | AgentRun 部署到 FC（函数计算） | 创建时自动注册 | CREATING → READY |
| 外部 Agent | 自行部署 | 手动注册 AgentCard URL | 直接 READY |

调用方无需关心对方是托管还是外部 —— 走同一套发现 + 调用协议。这种"统一发现体验"是 AgentRun 的关键价值 —— 否则平台就只是另一套部署工具。

### 5. 超级 Agent（Orchestrator）：服务端智能调度

用户意图 → 超级 Agent 拆解子任务 → 动态调用专职 Agent → 聚合结果返回。

核心是把"调度"放在服务端（不是客户端），好处是：
- 调度逻辑可以观测（链路追踪、失败重试、限流都在服务端）
- 调度策略可以集中升级（不用每个客户端重新发布）
- 凭证不会暴露给客户端

## 深度分析

### 1. 多 Agent 的"工程复杂度"远大于"算法复杂度"

自建多 Agent 系统要解决的工程问题：
- 注册中心：哪些 Agent 在线？属于哪个环境？
- 服务发现：调用方如何找到合适的 Agent？
- 跨 Agent 鉴权：谁可以发现谁、调用谁？凭证如何轮转？
- 调度编排：复杂任务如何拆解、分发、重试、聚合？
- 环境隔离：开发、测试、生产的 Agent 如何避免串用？
- 链路追踪：跨多个 Agent 如何定位慢调用和失败点？

这六个问题里没有任何一个是 LLM 算法问题 —— 全是分布式系统问题。AgentRun 的价值在于把这些"老问题"用 Agent 时代的语义重新包装，提供了开箱即用的实现。

### 2. A2A 协议的"开放"是真正的护城河

A2A 是 Google 主导的开放协议，类似 MCP之于工具调用、MPI 之于科学计算。选择 A2A 而不是私有协议的关键收益：
- **避免锁定**：今天用阿里云 AgentRun，明天可以把 Agent 迁到 Google ADK、AWS Bedrock Agents，不需要改 Agent 实现。
- **生态复用**：任何一个遵循 A2A 的 Agent（不管是阿里、Anthropic 还是某创业公司写的）都可以被发现和调用。
- **可演进**：协议层和实现层解耦，平台可以在 A2A 之上做差异化（工作空间、发现端点、凭证治理），但保持兼容。

### 3. 「先管起来再调度」的渐进路径

原文给出了一个非常工程化的方法论：**先管起来，再调度。**

意思是：很多团队一上来就想做"超级 Agent 自动调度"，结果调度不通 —— 因为底层的 Agent 发现、鉴权、隔离都没做。AgentRun 的建议是先把"管"做扎实（工作空间 + 凭证 + 发现端点），再上"调"（超级 Agent 调度）。这个顺序很重要 —— 没有"管"的"调"是空中楼阁。

### 4. 生产级方案五要素

原文总结：
1. **开放互通**：基于 A2A，避免私有协议锁死
2. **统一治理**：工作空间 + 发现端点 + 凭证体系
3. **服务端编排**：超级 Agent 服务端调度
4. **生产可观测**：跨 Agent 调用链路可追踪可审计
5. **渐进演进**：先管起来再调度

这五要素几乎是把 12-factor app 的微服务原则翻译成了 Agent 时代语言。

## 实践启示

1. **做多 Agent 系统，第一件事是定义 AgentCard**。不要等"算法跑通"再补发现机制 —— AgentCard 是 Agent 时代的"接口契约"，先定契约再写实现。
2. **工作空间 + 发现端点是组织级抽象**。多团队协作时，这两层抽象是必须的，不要试图用一个全局 Agent 注册表解决所有问题。
3. **凭证与工作空间解耦**。一个工作空间可以有多个发现端点对应不同环境（dev / staging / prod），凭证独立管理 —— 这是云原生时代的标准模式。
4. **服务端编排优于客户端编排**。客户端编排（每个客户端自己决定调哪些 Agent）无法观测、无法集中升级。超级 Agent 应该是服务端组件。
5. **选择 A2A 这类开放协议，不要发明私有协议**。今天多 Agent 生态还在早期，私有协议会让你的 Agent 被生态孤立。开放协议看起来短期增加了对接成本，长期收益巨大。

## 相关实体

- [Harness Engineering](ch05-010-harness-engineering-ai.html) — Agent 时代的工程范式
- [快手 RCA Agent](ch04-419-快手-rca-agent-复杂业务场景下排障-agent-的探索实践.html) — Multi-Agent 架构实践
- [AI Coding Agent Token 成本控制](ch09-119-ai-coding-agent-token-成本控制五层模型.html) — Orchestrator-Worker 模式
- [原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentrun-multi-agent-a2a-alibaba-cloud.md)
- A2A Protocol: https://a2a-protocol.org/latest/specification/
- [AgentRun 控制台: https://functionai.console.aliyun.com/](ch04-003-agentrun.html)
- MOC

---
