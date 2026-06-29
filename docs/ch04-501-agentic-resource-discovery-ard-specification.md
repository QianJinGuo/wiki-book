# Agentic Resource Discovery (ARD) Specification

## Ch04.501 Agentic Resource Discovery (ARD) Specification

> 📊 Level ⭐⭐ | 2.9KB | `entities/agentic-resource-discovery-specification-snowflake.md`

## Agentic Resource Discovery (ARD) Specification

Snowflake 联合 Microsoft、GoDaddy 等推出的开放协议，标准化企业级 AI Agent 的目录化、搜索和发现机制。

## 核心问题

企业内部已部署大量 AI Agent（MCP servers、A2A agents、Skills、传统 API tools），但缺乏统一发现层：AI 客户端无法自动找到最佳能力来完成给定任务。ARD 解决的是"从部署到发现"的断层。

## 四步架构

| 步骤 | 说明 |
|------|------|
| **Describe** | 资源发布者创建 `ai-catalog.json` 清单，描述 Agent 功能、任务类型、调用方式。清单托管在发布者自有域名。 |
| **Curate** | Discovery service 通过爬取公开目录、导入内部清单或应用策略来构建集合。企业控制哪些 Agent 被纳入。 |
| **Search** | 客户端用自然语言 + 可选过滤器查询 discovery service，返回排序后的 Agent 列表（含 schema 和 endpoint）。 |
| **Execute** | 客户端直接连接到所选资源的原生协议（MCP / A2A / REST）。Discovery service 不在调用路径中。 |

## 关键设计决策

- **域锚定（domain-anchored）**：`ai-catalog.json` 托管在发布者自有域名，不依赖中心化注册表
- **联邦可组合**：企业可运行一个 ARD endpoint，合并内部 Agent + 选定的供应商和公共资源
- **不在调用路径中**：Discovery service 仅负责发现，不代理调用；认证和数据访问在客户端与 Agent 之间
- **协议无关**：支持 MCP、A2A、REST 等多种协议的 Agent 统一发现

## 与 Snowflake Cortex Agents 的集成

- 团队在 Snowsight / CoCo 中构建 Agent → 自动生成 ARD 清单
- 通过 Snowflake CoWork 或 Microsoft Copilot 等 AI 界面发现并调用
- 周一数据团队发布的 Agent，周二销售即可通过任意 AI 界面使用

## 与现有协议的关系

ARD 是**发现层**，与 MCP（工具调用）、A2A（Agent 间通信）互补而非竞争：
- MCP：定义工具如何被调用
- A2A：定义 Agent 间如何通信
- **ARD：定义 Agent 如何被发现**

三者构成完整的 Agent 互操作栈。

## 相关资源

- 官方规范：[agenticresourcediscovery.org](https://agenticresourcediscovery.org/)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-resource-discovery-specification-snowflake.md)

---

