# Agent 时代可观测性：ABA、统一上下文与 Guance AI Agent Teams

## Ch04.648 Agent 时代可观测性：ABA、统一上下文与 Guance AI Agent Teams

> 📊 Level ⭐⭐ | 3.1KB | `entities/agent-era-observability-guance-cloud.md`

# Agent 时代可观测性：ABA、统一上下文与 Guance AI Agent Teams

> InfoQ 对话观测云 CEO 蒋烁淼，讨论 Agent 爆发后可观测性如何从后台工具变为系统中央基础设施。

## 核心转变

Gartner 预警到 2028 年公民开发者采用 Prompt-to-App 可能使软件缺陷增加 2500%。Vibe Coding 批量生产的"日抛型软件"在传统运维架构下是灾难。

传统"指标、日志、链路追踪"三件套远不够——还需行为事件、服务依赖、运行时内存状态、拓扑变化、Profiling 火焰图等。

## ABA（Agent Behavior Analytics）

Agent 本身成为新的观测对象。运维团队需要看到 Agent 调用了哪些工具、访问了哪些数据、是否越过了权限边界、每步动作对业务系统的影响。

最理想的观测入口是**统一的 AI 网关**——当模型调用、Token 收发和工具调用都经过网关，企业才能建立可追溯的行为链路。

## 可观测平台 = 系统的统一上下文平台

当系统里同时跑着人、软件和 Agent，可观测平台的角色变成统一的上下文平台。

- **不变的能力**：DataKit 600+ 种数据采集、GuanceDB 3.0 存算分离 + 数据湖仓一体化
- **变的路径**：从人手工搭建界面/流程 → 自然语言驱动的 Agent 自动生成

## 三层能力架构

| 层 | 产品 | 解决的问题 |
|---|------|-----------|
| 第一层 | **OWL**（CLI + MCP Server） | 打通上下文，让 Coding Agent 直接查询生产观测数据做根因分析 |
| 第二层 | **Obsy AI Copilot**（Manager Agent） | 降低数据理解门槛，NL→Dashboard/监控器 |
| 第三层 | **Guance AI Agent Teams** | 在生产环境可靠行动，内建排障方法论 |

排障方法论流程：告警分诊 → 影响面判断 → 假设生成 → 证据收集 → 根因定位 → 动作建议 → 审批执行 → 结果验证。

安全设计：IM 中 Agent 默认只读（只能查数）；操作能力放 Task 页面，由企业封装为 API；高风险动作审批 + 操作留痕 + 证据链可追溯。

## Builder 角色

人类工程师的关键能力：提出正确的问题、定义目标、提供上下文、验证 AI 结果。蒋烁淼称这类人为 **Builder**——懂技术架构、能活用工具、能把大问题拆成小问题并对结果负责。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-redefining-observability-guancecloud-infoq.md)

---

