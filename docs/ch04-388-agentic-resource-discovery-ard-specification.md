# Agentic Resource Discovery (ARD) Specification

## Ch04.388 Agentic Resource Discovery (ARD) Specification

> 📊 Level ⭐⭐ | 6.4KB | `entities/agentic-resource-discovery-specification-snowflake.md`

# Agentic Resource Discovery (ARD) Specification

## 摘要

**Agentic Resource Discovery (ARD)** 是 Snowflake 联合 Microsoft、GoDaddy 等推出的开放协议，标准化企业级 AI Agent 的目录化、搜索和发现机制。ARD 解决的核心问题是：企业内部已部署大量 AI Agent（MCP servers、A2A agents、Skills、传统 API tools），但 AI 客户端无法自动找到最佳能力来完成给定任务。ARD 作为**发现层**，与 MCP（工具调用）、A2A（Agent 间通信）互补，三者构成完整的 Agent 互操作栈。

## 核心要点

### 从部署到发现的断层

- AI 客户端已能调用外部工具、MCP 服务器、API、工作流和 Agent
- 缺失的一环：**AI 客户端如何自动发现**组织内所有已构建和批准的能力？
- ARD 填补这一发现层——将分散的 Agent 集合转变为**互联的企业级能力网络**
- "周一数据团队发布的 Agent，周二销售即可通过任意 AI 界面使用"——无需手动集成

### 四步架构

| 步骤 | 说明 |
|------|------|
| **Describe** | 资源发布者创建 `ai-catalog.json` 清单，描述 Agent 功能、任务类型、调用方式。清单托管在发布者自有域名。 |
| **Curate** | Discovery service 通过爬取公开目录、导入内部清单或应用策略来构建集合。企业控制哪些 Agent 被纳入。 |
| **Search** | 客户端用自然语言 + 可选过滤器查询 discovery service，返回排序后的 Agent 列表（含 schema 和 endpoint）。 |
| **Execute** | 客户端直接连接到所选资源的原生协议（MCP / A2A / REST）。Discovery service 不在调用路径中。 |

### 关键设计决策

- **域锚定（domain-anchored）**：`ai-catalog.json` 托管在发布者自有域名，不依赖中心化注册表——避免单点故障和审查风险
- **联邦可组合**：企业可运行一个 ARD endpoint，合并内部 Agent + 选定的供应商和公共资源——统一答案集、组织保留控制权
- **不在调用路径中**：Discovery service 仅负责发现，不代理调用——认证和数据访问在客户端与 Agent 之间（性能和安全的关键设计）
- **协议无关**：支持 MCP、A2A、REST 等多种协议的 Agent 统一发现

### 与 Snowflake Cortex Agents 的集成

- 团队在 Snowsight / CoCo 中构建 Agent → **自动生成 ARD 清单**
- 通过 Snowflake CoWork 或 Microsoft Copilot 等 AI 界面发现并调用
- 零集成成本：数据团队构建的 Agent 自动出现在销售团队的 AI 界面中

### ARD 在互操作栈中的位置

```
┌─────────────┐
│     ARD     │  ← 发现层：Agent 如何被发现
├─────────────┤
│     A2A     │  ← 通信层：Agent 间如何通信
├─────────────┤
│     MCP     │  ← 工具层：工具如何被调用
└─────────────┘
```

三者互补而非竞争——ARD 解决 "找谁"，A2A 解决 "怎么对话"，MCP 解决 "怎么调工具"。

## 深度分析

### 企业 AI 的 "最后一公里"

ARD 解决的是企业 AI 部署的 "最后一公里" 问题——不是构建 Agent 的能力，而是让构建好的 Agent 被发现和使用。这与互联网早期的 DNS/搜索引擎类比：当网站数量超过人工记忆能力时，搜索引擎成为必需品。当企业内部 Agent 数量超过人工管理能力时，ARD 式的发现层成为必需品。

### 联邦架构的战略选择

ARD 选择域锚定和联邦架构，而非中心化注册表，反映了企业 AI 的现实需求：（1）数据主权——企业不想让 Agent 清单离开自有域名；（2）混合部署——内部 Agent 和供应商 Agent 需要统一发现；（3）渐进采用——ARD 不需要 "all-in" 迁移，可以逐步纳入现有 Agent。这与 MCP 的设计哲学一致：轻量、渐进、不侵入。

### 与 MCP/A2A 的生态协同

ARD 补全了 Agent 互操作的最后一块拼图。MCP 标准化工具调用后，"工具太多找不过来" 成为新问题——ARD 直接解决。同时，ARD 的 `ai-catalog.json` 可被 A2A 的 Agent Card 参考，形成发现-通信-调用的完整链路。Snowflake + Microsoft 的联盟推动，加上 GoDaddy 等早期采用者，使 ARD 有较好的企业级落地前景。

## 实践启示

1. **关注 ARD 规范演进**：作为新兴开放协议，早期参与（实现、反馈）可在规范定型前获得影响力——参考 MCP 早期采用者的先发优势
2. **为企业 Agent 建立清单目录**：即使不采用 ARD，也应为企业内部 Agent 建立标准化的元数据描述（功能、输入输出、所属团队），为未来发现层做准备
3. **评估 Snowflake Cortex Agents 集成**：如果已在使用 Snowflake，关注 CoWork/CoCo 中的 ARD 自动生成机制——可能是零成本接入 Agent 发现网络的最快路径
4. **Agent 互操作栈选型**：MCP + A2A + ARD 正在形成事实标准组合——新 Agent 项目应优先考虑与这三者的兼容性
5. **联邦发现模式的内部应用**：ARD 的联邦可组合架构可被内部平台团队借鉴——构建统一的 Agent 目录服务，合并各团队的 Agent 资源

## 相关实体

- Model Context Protocol (MCP)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-resource-discovery-specification-snowflake.md)

---

