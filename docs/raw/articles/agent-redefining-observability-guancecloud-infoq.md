---
title: "从看见问题到解决问题，Agent 正重新定义可观测"
source_url: "https://mp.weixin.qq.com/s/O2JRjj0do9XPv-7u4szCUg"
source_site: "mp.weixin.qq.com"
source_author: "凌敏｜InfoQ"
ingested: "2026-07-14"
sha256: "90ed4a0cb6dd662a96bdce4a9b1a13078c11b5ee85b7f82c00c56b641b84faf7"
type: "raw-article"
tags: [observability, agent, aiops, aba, vibe-coding, guance-cloud]
status: "ingested"
---

# 从看见问题到解决问题，Agent 正重新定义可观测

> InfoQ《C 位面对面》对话观测云创始人&CEO 蒋烁淼，讨论 Agent 时代可观测的变与不变。

## Agent 爆发后，可观测更重要了

Gartner 预警，到 2028 年，公民开发者采用 Prompt-to-App 的方式可能使软件缺陷增加 2500%。Vibe Coding 正在批量生产"日抛型软件"——一天内搭出来，却未必经得起一周后的真实流量和故障追责。

蒋烁淼认为，真正意义上的可观测是"全面无死角的体检"。传统"指标、日志、链路追踪"三件套远不够，还需行为事件、服务依赖、运行时内存状态、拓扑变化、Profiling 火焰图等。

AI 让 Agent 有机会承担读数据的工作：跨越多种数据类型先拼出系统整体状态，再帮助定位问题。

## ABA：Agent 成为新的观测对象

新的方向——**ABA（Agent Behavior Analytics）**，面向 Agent 行为本身的分析。运维团队需要看到 Agent 做了什么、调用了哪些工具、访问了哪些数据、是否越过了权限边界。

最理想的 Agent 观测入口是**统一的 AI 网关**。当模型调用、Token 收发和工具调用都经过这里，企业才能建立可追溯的行为链路。观测云已具备追踪 OpenClaw、Hermes、Claude Code、Codex 的能力。

Gartner 预测，到 2028 年，40% 已部署 AI 的组织将采用专门的 AI 可观测工具。

## 可观测平台 = 系统的"统一上下文"

当系统里同时跑着人、软件和 Agent，可观测平台变成系统的统一上下文平台。

- **不变**：底层数据采集（DataKit 支持 600+ 种采集）、自研数据库（GuanceDB 3.0 存算分离 + 数据湖仓一体化）
- **变**：产品交互与自动化方式——自然语言生成 Dashboard、AI-Driven Workflow

## OWL → Obsy AI Copilot → Guance AI Agent Teams

观测云的三层能力：

**第一层：打通上下文（OWL）**
CLI 和 MCP Server 两种形态，将观测数据封装为标准化工具。研发可将 OWL 装到 Claude Code/Codex 中，直接让 AI 查询生产环境观测数据执行根因分析，无需生产环境访问密钥。

**第二层：让人和 Agent 看懂数据（Obsy AI Copilot）**
底层 Runtime 已从固定工作流升级为 Manager Agent 形态——注册了 Skill、上下文和 System Prompt。用户可用自然语言配置监控器、生成 Dashboard。

**第三层：在生产环境可靠行动（Guance AI Agent Teams）**
内建排障方法论：告警分诊 → 影响面判断 → 假设生成 → 证据收集 → 根因定位 → 动作建议 → 审批执行 → 结果验证。默认只读、最小权限、高风险审批、操作留痕、证据链可追溯。

## 产品设计原则

- IM 和普通会话中的 Agent 默认只读，只能查数不能执行危险操作
- 真正涉及操作的放在 Task 页面，由企业将允许 AI 执行的动作封装为 API
- AI 自动生成故障笔记，沉淀为 Agent 团队的长期记忆层（7月3日更新）

## 关键观点

- Agent 没有削弱可观测性的价值，反而把它从后台推到了系统中央
- "不管是 AI 还是人类，如果你连整个系统发生了什么的上下文都没有，这不叫 AIOps，这叫神仙 Ops"
- 人类工程师的关键能力会变成：提出正确的问题、定义清楚目标、提供足够上下文、验证 AI 的结果
- 蒋烁淼把这类人称为 **Builder**——懂技术架构、能活用工具、能把大问题拆成小问题并对结果负责的人
