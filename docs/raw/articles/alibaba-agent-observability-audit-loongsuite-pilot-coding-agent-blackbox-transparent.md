---
title: "让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践"
source_url: https://mp.weixin.qq.com/s/3zA8mUTHG289-VnXDV1O2Q
source: wechat
author: 望陶 / 太业 / 石木 / 阿里云云原生
published: 2026-06-02
ingested: 2026-06-02
type: raw-archive
tags: [wechat, alibaba-cloud, observability, otel, semconv, loongsuite, coding-agent, data-collection, sidecar, span-semantic, three-agent-forms, four-observability-capabilities]
sha256: 1abd3357880ee8609ac052bec41e92b79de4802257c7ac3b8ebca2d1867af844
---

# 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践

> AI Agent 规模化落地带来执行黑盒、行为难追溯、成本难度量三大难题。阿里云基于 OTel 标准，面向 Coding Agent、个人通用助理和框架型 Agent，推出 LoongSuite Pilot、插件及探针等无侵入采集方案，让 Agent 实现可看见、可分析、可审计、可治理。

## 1. 引言

随着大模型在企业生产环境中的规模化部署，AI Agent 已从单点实验走向核心业务系统。然而，随之而来的可观测性挑战成为制约 Agent 进一步普及的关键瓶颈——**执行黑盒、行为难追溯、成本难度量**这三大难题正在困扰着每一个 Agent 落地团队。

阿里云基于 OpenTelemetry（OTel）标准，结合 LoongSuite GenAI 可观测语义规范，面向不同形态的 Agent 推出端侧轻量数据采集方案，让 Agent 真正实现"可看见、可分析、可审计、可治理"。

## 2. 背景

### 2.1 三大 Agent 形态

当前 AI Agent 生态百花齐放，按照使用方式和构建难度，可大致分为三类：

- **Coding Agent**——直接面向开发者的编程智能体（Claude Code、Qoder、Codex 等）
- **个人通用助理**——C 端用户日常使用的 AI 助手
- **高低代码框架 Agent**——基于 LangChain / LangGraph / Dify / 自研框架构建的企业级 Agent

### 2.2 三大核心挑战

| 挑战 | 具体表现 |
|------|---------|
| **执行黑盒** | Agent 内部决策链路不可见，外部无法判断其行为是否合理 |
| **行为难追溯** | Token 消耗、工具调用、Skill 执行无法归因到具体业务功能 |
| **成本难度量** | 大模型 Token 消耗是 Agent 的主要成本来源，多轮迭代和工具调用会**指数级放大消耗**。若缺少按 Agent、用户、任务维度的精细化成本拆分能力，企业将无法开展预算管控与投入产出评估 |

## 3. 阿里云 Agent 观测审计采集方案

### 3.1 Coding Agent：LoongSuite Pilot 端侧轻量数据采集平台

**核心优势**：
- 端侧 sidecar 部署
- 与 Coding Agent 工具解耦
- 轻量级、低侵入
- 标准化数据采集（OTel 协议）

**已支持的 Coding Agent 及覆盖能力**：
- Claude Code
- Qoder / QoderWork
- Codex
- 等多个主流 Coding Agent

### 3.2 个人通用助理：一行命令接入完整观测和审计

**设计理念**：**一行命令**完成 Agent 接入，立即获得完整观测和审计能力。

**Span 语义模型**：
- 在 Agent 调用入口处自动创建 Span
- 还原模型和用户的原始输入和输出
- 形成完整对话历史

**与内置观测的本质差异**：
- 数据模型：仅基础 LLM/Agent Span → **Entry Span + Step Span + Skill 语义**三层结构
- 可观测粒度：单个调用 → **AGENT 决策 → STEP 推理 → LLM 调用 → TOOL 执行**全链路
- 业务归因：无法定位功能域 → **Skill 维度 + Token 成本拆分**
- 安全审计：缺失 → **工具调用审计 + 高风险会话追溯**

### 3.3 高低代码框架 Agent：LoongSuite Python Agent 零代码探针插桩

**快速开始**：
```python
from loongsuite.agent import LoongSuiteAgent
# 零代码探针自动插桩
agent = LoongSuiteAgent()
```

**框架覆盖**：
- LangChain
- LlamaIndex
- LangGraph
- Dify / Coze 等低代码平台
- 自研 Agent 框架

**自动识别的 Span 类型**（覆盖 Agent 全生命周期）：
- **AGENT Span**——Agent 决策入口
- **STEP Span**——ReAct 迭代步骤
- **LLM Span**——大模型调用
- **TOOL Span**——工具执行
- **SKILL Span**——业务功能域（vía `gen_ai.skill.*` 属性组）
- **MEMORY Span**——记忆读写
- **SESSION Span**——多轮会话追踪

## 4. 4 大观测审计能力

### 4.1 全链路调用链视图

**核心能力**：
- AGENT 决策 → STEP 推理 → LLM 调用 → TOOL 执行，**层级关系一目了然**
- 多轮 ReAct 复杂任务：**Step Span 快速定位到哪一轮迭代出现问题**，再深入到该轮内的 LLM/Tool Span 分析根因
- 类似传统微服务的 Trace 体验，但专门为 Agent 多轮迭代设计

### 4.2 Token 消耗与成本追踪

**核心能力**：
- 按 Agent / 用户 / 任务维度**精细化成本拆分**
- Token 级推理观测（vLLM / SGLang / TensorRT-LLM 引擎）
- 每个 Token 的调度时间 + 实际执行时间 + 用户感知总耗时
- Batch 总请求数 / 总 Token 数 → 决定 Token 生成耗时

**价值**：让企业能开展**预算管控与投入产出评估**。

### 4.3 会话与多轮对话追踪

**核心能力**：
- 完整 Session 生命周期追踪
- 多轮对话上下文传递可视化
- Entry Span 还原模型和用户原始输入/输出
- 不受 System Prompt 或框架 Prompt 干扰

### 4.4 工具调用审计

**4 大行为分析大盘**：
1. **行为分析大盘**——整体 Agent 行为概览
2. **工具调用分布**——哪些工具被调用最多
3. **安全审计总览**——整体安全状态
4. **高风险会话追溯**——按风险等级钻取问题会话

**典型安全审计能力**：
- 检测异常工具调用（如：访问未授权数据库、删除生产文件）
- 提示词注入检测（识别恶意指令）
- 数据外泄检测（敏感信息流向异常出口）
- 高风险会话标记 + 完整回放

## 5. 在社区标准之上的扩展

### 5.1 为什么需要在社区标准之上扩展

**OTel GenAI SemConv 已覆盖**：
- Agent、LLM、Tool 等基础 Span 类型

**但缺失**：
- Skill 这一**介于 Agent 和 Tool 之间的业务功能域**
- 多轮 ReAct 的层级化表达
- Token 级别的推理观测

### 5.2 部分核心扩展

#### 扩展一：Entry Span 与 Step Span —— 让复杂 Agent 调用链可读

**问题**：在 AI Agent 执行长程任务时，执行逻辑会包含多轮工具调用和模型调用，单个 Trace 中可包含**成百上千个 Span**，导致同一链路中 Span 展示极其冗长，调用链轨迹难以清晰观测。

**Entry Span**：
- 在 Agent 调用入口处创建
- 还原模型和用户的原始输入和输出
- 形成对话历史
- 确保下游任务处理的数据**不受 System Prompt 或框架 Prompt 干扰**

**Step Span**：
- 代表 Agent 在每次 ReAct 过程中的层次化表达
- 每次 ReAct 包含"**反思 → 工具调用 → 模型调用**"的循环
- 排查问题采用 **Top-down 方式**：先定位哪一轮 ReAct，再深入分析该轮中哪一步出错

#### 扩展二：Skill 语义 —— 让业务功能域可观测

**问题**：在电商购物助手等 Agent 场景中，用户的每条指令由 AI Agent 理解意图后**路由到对应的 Skill 完成执行**，Skill 是业务功能的最小可复用单元。OTel GenAI 缺少对 Skill 这一编排单元的业务功能聚合层抽象。

**3 个核心痛点**：
- **无法归因到功能域**——性能抖动时只能看到一堆 `execute_tool` 和 `inference` Span
- **无法统计 Skill 健康指标**——缺少 P99 延迟、成功率、调用频率
- **多 Skill 并发时链路混淆**——不同 Skill 的 LLM/Tool Span 在 Trace 树中无法区分归属

**LoongSuite 方案**：
- 新增 `gen_ai.skill.*` 属性组，标识 Skill 的身份与版本信息
- 当前阶段附着在已有的 `execute_tool` Span 上，**无需引入新 Span 类型即可快速落地**
- 同时落地独立 `invoke_skill` Span 方案，并向 OTel 社区提交了提案

### 5.3 工程化落地：GenAI Utils

**工程挑战**：
- 每个 GenAI 框架插桩库都需要实现完整的遥测采集逻辑
- 不同框架插桩间逻辑高度重复
- 语义规范迭代升级时每个插桩库各自维护一套实现，**升级成本成倍增长**

**GenAI Utils 整体架构**（"**分层解耦、统一收口**"）：
- **插桩层只做数据提取**——各框架插桩库通过 Hook/Monkey-Patch 拦截框架调用，填充数据到 Invocation 数据对象，**不直接操作 OTel API**
- **GenAI Utils 统一收口遥测输出**——所有 Span 创建、属性挂载、Metrics 记录、Event 发送、Context 管理均由 `ExtendedTelemetryHandler` 内部完成

**价值**：插桩库与规范升级**解耦**。
