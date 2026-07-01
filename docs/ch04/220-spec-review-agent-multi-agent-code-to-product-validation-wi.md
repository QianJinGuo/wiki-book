# Spec Review Agent: Multi-Agent Code-to-Product Validation with MCP + Browser Tool

## Ch04.220 Spec Review Agent: Multi-Agent Code-to-Product Validation with MCP + Browser Tool

> 📊 Level ⭐⭐ | 10.5KB | `entities/spec-review-agent-baz-bedrock-agentcore-multi-agent.md`

# Spec Review Agent: Multi-Agent Code-to-Product Validation with MCP + Browser Tool

> 本文综合提炼自 Baz 公司（[baz.co](https://baz.co/)）构建的 **Spec Review Agent** —— 用 Amazon Bedrock + AgentCore 实现"代码-产品"全栈自动验证。核心架构：**Specification Subagent 解析 Figma/Jira 需求 → Implementation Subagent 用 Browser Tool 渲染 Preview Environment 做视觉/行为验证 → Report Generator 合并发现**。量化收益：**bugs 报告减少 50%、time-to-merge 提升 30-70%**。

## 问题：代码审查的"产品意图断层"

传统 diff-only code review 只能验证"代码能否编译运行"，不能验证"是否符合产品需求"。结果是 QA 团队需要数小时手动点击 preview environment 检查设计意图一致性：

- ❌ diff-only review 关注语法而非行为
- ❌ 关键问题（"是否工作""是否匹配 spec""是否符合预期"）手工延迟回答
- ❌ 代码与产品意图断层导致速度慢、设计不一致、依赖未文档化 QA 知识

**Spec Review 的目标**：把 code review 从"diff"提升到"intent + behavior + implementation 三者统一验证"

## 解决方案架构：多阶段多 agent 流水线

**触发**：GitHub webhook (新 PR) → ALB/NLB → EKS

**流水线组件**：

1. **Specification Subagent** — Bedrock 驱动
   - 输入：Figma 视觉规格（间距、颜色、组件层级）+ Jira 功能规格（验收标准、用户故事）
   - 输出：拆解为离散需求（视觉需求 + 功能需求）

2. **Implementation Subagents**（一个 per requirement） — Bedrock + AgentCore
   - 静态分析：源码仓库的代码逻辑检查
   - 动态验证：**AgentCore Browser Tool 渲染 Preview Environment**，做 DOM 检查、事件模拟、视觉测试
   - 与 Figma 设计规格 + Jira 行为需求对比

3. **Report Generator** — 合并所有子 agent 发现
   - 输出到 GitHub PR 评论、Slack 通知、自动回链 Jira issue

**关键技术**：

- **MCP 集成**：AgentCore runtime 运行 MCP server，连接 Figma + Jira
- **Browser Tool**：安全、隔离、serverless 浏览器会话（无需 Baz 自建浏览器基础设施）
- **并发编排**：每个需求 spawn 独立 sub-agent，并行验证

## Amazon Bedrock AgentCore 的关键价值

AgentCore 作为基础设施层提供：

- **Browser Use 能力**：Subagent 能在真实 preview environment 渲染 UI 并验证
- **隔离沙箱**：每个浏览器会话独立、安全
- **MCP server 运行时**：集成 ticketing system + Figma
- **可观测性**：支持 production-grade agent workflow 的监控
- **可扩展性**：多个 MCP server 并行运行全栈验证

**Bedrock 模型的职责**：

- 推理 + 决策层：解读需求、理解设计意图、评估浏览器观察到的行为相关性
- 综合 spec 上下文、分析 UI 状态、产生精确 actionable 结论
- 把 LLM 推理与浏览器执行解耦 — 推理在 Bedrock，浏览器执行在 AgentCore

## 量化收益

- **Bugs 报告减少 50%**
- **Time-to-merge 提升 30-70%**
- **回归更少**：feature verification 左移到 PR 阶段就完成
- **团队信心提升**：merge 前已验证符合 requirement

## 关键设计模式（可复用）

### 1. **Code + Browser 双轨验证**

不是只做静态分析，而是用 Browser Tool 真实渲染后视觉验证。捕获传统 code review 完全错过的差异（CSS 偏移、动画、交互状态）

### 2. **每个需求独立 Subagent**

并行 spawn 多个 Implementation Subagent 验证不同需求。设计要求隔离性（每 subagent 独立 context + 独立 browser session），提升速度 + 减少错误传播

### 3. **三源上下文融合（Spec + Code + Runtime）**

- Spec：Figma + Jira（意图层）
- Code：源码仓库（实现层）
- Runtime：Browser 真实渲染（行为层）

三个源同时验证才能捕获 spec-to-implementation drift。

### 4. **MCP 标准化集成**

用 MCP server 统一接入 Figma + Jira + GitHub，避免每个 SaaS 写 custom integration

## 实践启示

**何时采用 Spec Review pattern**：

- ✅ 团队有大量"设计-实现"drift 问题（QA 时间占比高、回归频繁）
- ✅ 已有 Figma + Jira 等 spec 工具，能自动提取需求
- ✅ 有 preview environment 可供 Browser Tool 渲染
- ✅ 团队注重 speed-to-merge 和设计一致性
- ❌ 项目无视觉层（纯后端）→ 不需要 Browser Tool
- ❌ 团队 spec 在脑子里（无 Figma/Jira 记录）→ 需先建立 spec 流程

**部署建议**：

1. 选 1-2 个最常出回归的 service 做 pilot
2. 先建立 Figma + Jira spec 流程，再实施 agent
3. 用 AgentCore 减少自建浏览器基础设施
4. 监控 PR cycle time + bug escape rate 两个核心指标

## 相关参考

- [Baz 公司](https://baz.co/)
- [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- 架构伙伴：EKS (Application/Network Load Balancer) + GitHub webhook

## 深度分析

### 1. Spec Review Agent：AI 驱动的规格审查
Baz（Spec Review Agent）将软件规格审查从人工流程转变为 AI 辅助流程——agent 自动检测规格中的矛盾、遗漏和模糊性，人类审查者聚焦于业务逻辑和用户体验。

### 2. Bedrock AgentCore 作为多 agent 协作平台
Baz 的实现基于 Bedrock AgentCore——AWS 的多 agent 协作平台，提供 agent 编排、工具调用和安全策略。这与 `Amazon Bedrock Agentcore Gateway Mcp Extension` 的 MCP 扩展互补。

### 3. 多 agent 审查的分工优势
Spec Review 使用多个专化 agent（一致性检查、完整性检查、可行性评估）而非一个通用 agent——每个 agent 聚焦单一审查维度，降低幻觉风险。

### 4. 规格审查的可自动化程度
规格审查的 60-70% 可以自动化（格式一致性、交叉引用、遗漏检测），但 30-40%（业务逻辑合理性、用户体验直觉、技术可行性判断）仍需人类。

### 5. 从规格审查到规格生成
AI 审查规格的下一步是 AI 生成规格——从需求描述自动生成完整的技术规格文档。这将进一步压缩从需求到实现的周期。

## 实践启示

### 1. 在提交规格前先用 AI 审查
在人类审查前先用 AI agent 做一轮自动审查——捕获低级错误（遗漏、矛盾、模糊），让人类审查者聚焦高阶问题。

### 2. 多 agent > 单 agent：每个 agent 聚焦一个维度
不要用一个 agent 做所有审查。拆分为多个专化 agent（格式、一致性、完整性），每个 agent 的任务更简单、准确率更高。

### 3. AI 审查不能替代人类审查
AI 可以加速审查但不是替代——业务逻辑和用户体验的判断仍需人类。将 AI 定位为"审查助手"而非"审查者"。

### 4. 建立规格质量基线
用 AI 审查结果建立规格质量基线——追踪每次审查的发现数量、严重程度分布，量化改进。

### 5. 评估 Bedrock AgentCore 是否适合你的多 agent 场景
如果你的多 agent 需求涉及 AWS 生态，Bedrock AgentCore 提供了开箱即用的编排和安全。但需要评估厂商锁定风险。

## 相关实体
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](ch04/256-building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)
- [Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session](ch04/503-agent.md)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](ch03/066-building-multi-tenant-agents-with-amazon-bedrock-agentcore.md)
- [Verizon Connect Agentic Ai 100K Users](ch04/150-ai.md)
- [Aws Devops Agent Mcp Server打通混合云网络排障的最后一公里](ch07/041-aws-devops-agent-mcp-server.md)

---

