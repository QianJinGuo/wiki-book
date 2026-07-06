# 基于 Strands Agents 构建亚马逊云科技云成本分析与优化 AI 助手

## Ch04.136 基于 Strands Agents 构建亚马逊云科技云成本分析与优化 AI 助手

> 📊 Level ⭐⭐ | 14.0KB | `entities/strands-agents-cloud-cost-optimizer.md`

# 基于 Strands Agents 构建亚马逊云科技云成本分析与优化 AI 助手

> 使用 Strands Agents 构建云成本分析与优化 AI 助手的实战教程，包含成本监控、自动化优化建议。

## 核心内容

---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant/
ingested: 2026-06-01
sha256: 70061409c093a01f
---

# 基于 Strands Agents 构建亚马逊云科技云成本分析与优化 AI 助手

## [亚马逊AWS官方博客](https://aws.amazon.com/cn/blogs/china/)

摘要：本文介绍如何基于 Strands Agents SDK 和 AWS 官方 MCP 工具，构建一个支持自然语言交互的云成本分析 AI 助手，实现费用查询、图表可视化和优化建议的端到端体验，并适配亚马逊云科技中国区部署。

**目录**

01 [一、背景与适用场景](#section1)

02 [二、方案架构](#section2)

03 [三、技术实现详解](#section3)

04 [四、中国区适配](#section4)

05 [五、部署方案](#section5)

06 [六、效果演示](#section6)

07 [七、总结与展望](#section7)

08 [八、资源链接](#section8)

* * *

## **一、背景与适用场景**

### 1.1 云成本管理面临的挑战

随着企业在云上业务规模不断扩大，云成本管理面临越来越多的挑战：

*   工具学习门槛高：Cost Explorer、Budgets、Pricing等工具分散在不同控制台，需要专业知识才能有效使用，对非技术人员不友好
*   分析效率低：从提出问题到获得答案，需要在多个界面间切换、手动筛选维度、导出数据再加工
*   缺乏自然语言交互：现有工具主要依赖图形界面操作，无法通过对话快速获取洞察
*   缺少数据分析洞察：传统工具侧重数据展示，缺乏基于数据的智能分析和优化推荐能力

### 1.2 方案能力概述

本方案构建了一个基于大语言模型的 FinOps 智能助手，通过自然语言对话即可完成云成本相关的查询和分析。以下是常见的使用场景：

*   查询任意时间段的费用趋势和服务费用分布
*   对比不同月份/服务/区域的成本变化，识别异常波动
*   查询特定实例类型、存储类型的实时定价
*   获取 RI/SP 覆盖率、利用率和购买建议
*   监控预算执行情况和免费套餐使用量
*   以图表形式直观展示分析结果，并附带 Cost Explorer 控制台链接供深入验证

此外，通过集成更多 AWS MCP Server（如 CloudWatch、CloudTrail 等），可以进一步扩展助手的能力边界。

### 1.3 适用场景

*   项目组/业务人员：不需要对亚马逊云科技账单体系有深入了解，通过自然语言即可查询项目相关费用
*   FinOps 团队：快速获取多维度费用分析和优化建议，提升日常工作效率
*   管理层：通过对话获取费用概览和趋势，无需学习控制台操作
*   多账号支持：支持 AWS 凭证透传和 SSO 集成，满足不同账号的查询需求

## **二、方案架构**

### 2.1 系统架构

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-1.png)

\[图1\]

系统采用前后端分离架构，部署在 ECS Fargate 上，通过 ALB 路径路由统一入口。后端基于 Strands Agents SDK 构建 Agent，通过 MCP 协议连接亚马逊云科技官方的账单和定价工具服务器，前端使用 React 实现流式渲染和图表可视化。

### 2.2 请求流程

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/based-on-strands-agents-build-cost-analytics-optimize-ai-assistant-2.png)

\[图2\]

一次完整的用户交互流程：用户输入自然语言问题 → 后端 Agent 选择合适的 MCP 工具 → 调用 AWS API 获取数据 → 整理为文本 + 图表流式返回 → 前端实时渲染。

### 2.3 核心优势

*   自然语言交互：无需学习复杂的控制台操作，用自然语言提问即可获取费用分析与优化建议
*   多种图形化展示：折线图/柱状图/饼图自动渲染，费用趋势一目了然
*   CE 链接带筛选条件：回复中附带精确的 Cost Explorer 控制台链接，一键跳转验证数据
*   中国区适配：提示词优化 + MCP 工具 Region Patch + 中国区 Partition 与端点适配
*   多会话 + 灵活认证：API Key 认证、S3 会话持久化、可选 AWS 凭证透传，支持多用户多账号
*   LLM 可配置：支持亚马逊云科技中国区 Marketplace 上的 MaaS 平台模型或自建的 OpenAI 兼容推理端点，前端可自定义切换

### 2.4 技术栈

*   AI 框架：Strands Agents SDK — AWS 开源 Agent 框架，原生支持 MCP 工具和流式响应
*   MCP 工具：AWS Billing and Cost Management MCP Server + AWS Pricing MCP Server
*   后端：FastAPI + Uvicorn，异步流式响应
*   前端：React 19 + Vite 4 + recharts，流式渲染 + 图表可视化
*   部署：ECS Fargate + ALB + CloudFormation，一键部署
*   LLM：兼容 OpenAI API 

## 深度分析

### 技术架构：从聊天机器人到 FinOps 智能助手的演进

本方案的核心创新在于将大语言模型定位为**意图规划层**而非简单的问答机器人。用户输入的自然语言首先被 LLM 解析为结构化的 API 调用指令，随后通过 MCP 协议路由到正确的 AWS 账单或定价工具。这种架构避免了传统方案中硬编码规则列表的局限性——当 AWS 新增账单维度或定价 API 变更时，Agent 可以动态调整调用策略。

Strands Agents SDK 在其中扮演了关键角色：它负责管理多轮对话状态、维护工具调用上下文，并支持流式输出。流式响应不仅是用户体验的优化（避免长时间等待），更重要的是允许 Agent 在生成图表代码的同时先行输出文字说明，实现"边想边说"的效果。FastAPI 的异步架构使得 LLM 推理和 AWS API 调用可以并行进行，显著降低了端到端延迟。

### 中国区适配：跨越_REGION_与_ENDPOINT_的差异

亚马逊云科技中国区与全球区在账号体系、API 端点和服务可用性上存在显著差异。方案中提到的"Region Patch"机制揭示了一个重要事实：许多 MCP 工具默认调用的是全球区 endpoint（如 `us-east-1`），直接在中国区使用会导致认证失败或数据不一致。解决方案是在调用前动态替换 region 参数，同时保留中国区专属的 partition 端点（如 `aws.cn`）。

这一适配工作还包括提示词层面的优化：由于中文用户更习惯使用"区域"而非"Region"，提示词模板需要针对中文语境重新设计。甚至连 Cost Explorer 的控制台 URL 结构在中国区也有所不同，方案中选择在回复中携带精确筛选条件的链接，而非通用跳转，这也是确保用户体验一致性的关键细节。

### MCP 协议：云成本管理自动化的新范式

MCP（Model Context Protocol）最初并非专为 FinOps 场景设计，但本方案展示了它在云治理领域的巨大潜力。通过 MCP，LLM 可以标准化的方式访问 AWS Billing、Pricing、Cost Explorer 等多类 API，而无需为每个 API 编写定制化的工具封装代码。更重要的是，MCP 的工具发现机制允许 Agent 在运行时动态感知可用能力——这意味着当企业启用新的 AWS 成本管理功能时，现有 Agent 无需代码更新即可自动获得相应能力。

从标准化程度来看，MCP 正在成为云厂商工具封装的统一接口。AWS 官方提供的 Billing and Cost Management MCP Server 意味着任何兼容 MCP 的 AI 框架都可以原生接入 AWS 账单能力，而不仅限于 Strands Agents。这为跨云成本分析奠定了协议基础。

### 多账号与 SSO：企业级部署的安全考量

企业环境中的成本分析助手往往需要跨越多个 AWS 账号运作。方案中提到的"凭证透传"和"SSO 集成"指向了一个重要企业需求：FinOps 工具必须遵循最小权限原则，不同角色的用户只能访问对应账号的成本数据。

S3 会话持久化是另一个关键的企业级特性。传统的对话助手在页面刷新后即失去上下文，而 S3 持久化方案允许用户跨会话延续分析思路。对于需要深入追溯成本根因的 FinOps 场景，这种连续性至关重要——它使得"先看本月概况→再追查某项异常→继续对比历史趋势"这类长程分析流程成为可能。

### 流式渲染：用户体验与工程实现的平衡

前端采用 React 19 配合流式响应架构，recharts 库负责图表实时渲染。方案的一个工程亮点在于：Agent 输出的 Markdown 内容和图表渲染指令通过同一通道返回，前端解析后先行渲染文字、图表紧随其后。这种"渐进式渲染"模式避免了传统方案中等全部数据加载完毕再展示的交互延迟。

图表与 Cost Explorer 深度链接的结合体现了"可验证性"设计原则。传统 BI 工具生成图表后用户难以追溯数据源头，而本方案在每个图表下方附带精确的 CE 控制台链接，用户可以一键跳转验证数据、调整筛选条件、执行更精细的分析。这种设计将 AI 助手定位为"分析起点"而非"分析终点"，鼓励用户深入探索而非止步于表面答案。

## 实践启示

### 1. 从单工具调用起步，逐步扩展 Agent 能力边界

企业在引入基于 MCP 的 FinOps Agent 时，建议先从单一场景切入——例如只接入 AWS Pricing MCP Server 实现实时定价查询，验证流式响应和前端渲染链路后再逐步引入 Billing MCP Server 扩展费用分析能力。这种渐进式扩展策略比一步到位更可控，也更容易发现集成中的细节问题。

### 2. 提示词工程应持续迭代，结合真实用户反馈优化

方案中提到"提示词优化 + 中国区适配"，这提示我们提示词并非一次性设计成果。建议建立提示词版本管理机制，收集用户真实query样本，定期评估 Agent 对中文成本术语的理解准确度。例如"Reserved Instance 覆盖率"和"RI 覆盖率"两种表达是否被同等处理，"按月统计"和"最近30天"是否存在语义偏差，这些细节需要通过实际使用数据持续校准。

### 3. 设计多层级防护机制，防止成本查询被滥用

虽然本方案专注于成本分析与优化，但开放式自然语言接口潜在风险需要关注。建议实现查询频率限制、敏感账号数据脱敏、异常查询模式识别等防护措施。例如，当用户短时间内发起大量跨账号费用查询时，系统应触发审计告警而非无限制响应。

### 4. 充分利用 Cost Explorer 深度链接，实现人机协同分析

图表附带的 CE 链接不应仅视为数据验证手段，更应作为引导用户深入分析的导航入口。建议在回复中不仅附带原始筛选条件链接，还可以结合用户问题上下文预判下一步分析路径。例如用户查询"某服务上月费用增长原因"时，回复中除趋势图外可附带指向该服务关联的标签报表和成本分配报表的链接组合。

### 5. 评估中国区 MaaS 平台与自建推理端点的总体拥有成本

方案提到支持亚马逊云科技中国区 Marketplace 上的 MaaS 平台模型或自建 OpenAI 兼容端点。企业在选择时不应仅比较模型单价，还需综合评估：MaaS 平台的合规成本与数据主权保障、自建端点的运维人力投入、模型切换的灵活性和切换后的效果稳定性。建议通过 A/B 测试对比不同模型在成本术语理解、数值精度、响应稳定性等维度的表现，再做长期选型决策。

## 参考来源

## 相关实体
- [Mcp Serveramazon Bedrock Agentcorequick Suite](ch04/500-amazon-bedrock-agentcore.md)
- [Yidian Tianxia Context Engineering Agentic Ai Qcon](ch04/248-yidian-tianxia-context-engineering-agentic-ai.md)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](ch04/500-amazon-bedrock-agentcore.md)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](ch04/362-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.md)
- [航班变更信息智能识别解决方案](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/strands-agents-cloud-cost-optimizer.md)- [ec2 nat 实例选型与部署实践（aws 中国宁夏区域）](../ch01/911-20.md)

---

