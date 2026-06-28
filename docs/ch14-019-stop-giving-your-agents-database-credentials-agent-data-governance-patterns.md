## Ch14.019 Stop Giving Your Agents Database Credentials — Agent Data Governance Patterns

> 📊 Level ⭐⭐ | 6.6KB | `entities/agent-data-governance-crewai-credential-patterns.md`

# Stop Giving Your Agents Database Credentials — Agent Data Governance Patterns

> Agent 循环（推理、工具调用、Prompt 工程）只占 1% 的工作量，其余 99% 是构建、配置、部署、安全、评估和监控。本文聚焦数据治理层：Agent 不应直接持有数据库凭证。

## 核心论点

Data + AI Summit 上的共识：Agent 的"智能"部分（模型选择、推理、工具调用）只占 1% 的工程工作。真正的挑战在于 99% 的基础设施层——安全、部署、监控、数据治理。

## 四种 Agent 数据交互模式

1. **直接凭证（反模式）**：Agent 持有 DB 用户名/密码，直接执行 SQL → 安全风险极高
2. **受限视图**：为 Agent 创建专用数据库视图，限制可见数据范围
3. **API 中间层**：Agent 通过受控 API 访问数据，不直接接触 DB
4. **MCP Server 模式**：Agent 通过 MCP Server 的工具接口访问数据，由 Server 层执行权限校验

## 关键洞察

- Agent 的工具调用能力 ≠ Agent 应该拥有底层资源的直接访问权限
- 数据治理是 Agent 安全的"最后一公里"——即使 Agent 本身被精心设计，错误的数据访问模式仍会导致安全事件
- CrewAI 的实践表明：MCP Server 模式在灵活性和安全性之间取得了最佳平衡

## 深度分析

### "四种数据交互模式"框架是 Agent 数据治理的核心抽象

CrewAI 将 Agent 与数据的交互归纳为四种模式：语义层查询、受控 SQL、注册业务逻辑调用、受控向量检索。每种模式对应独立的治理边界和权限模型。关键洞察：**当你给 Agent 一个数据库连接字符串时，你实际上把四种交互压缩成了一种——原始 SQL 访问**。Agent 用不理解的 schema 对不可审计的表生成查询，语义层、函数治理、检索优化全部失效。这等同于给新员工第一天就给生产数据库密码说"自己搞定"。

### 99% 的工程工作在 Agent 循环之外

Data + AI Summit 的共识数据：Agent 循环（推理、工具调用、prompt 工程）仅占 1% 的工程工作，其余 99% 是构建、配置、部署、安全、评估和监控。更实际的观察：企业识别了 20-800 个 agentic 用例，但 AI 团队一年只能交付约 10 个。瓶颈不是 Agent 逻辑，而是治理、控制、联邦化构建能力、数据访问模型，以及数据本身的结构化程度。原型之所以能跑通，是因为有人给了它一个干净的开发数据库的宽泛权限——然后安全审查来了，数据治理团队来了，项目搁置三个月。

### MCP Server 模式在灵活性和安全性之间取得最佳平衡

四种模式中，MCP Server 模式（Agent 通过 MCP Server 的工具接口访问数据，由 Server 层执行权限校验）是 CrewAI 实践中最推荐的方案。Databricks 集成使用了四个独立的 MCP Server（Genie、SQL、Unity Catalog Functions、Vector Search），每个 crew 按需启用——做财务分析的 crew 用 Genie + SQL，做支持升级的 crew 用 Vector Search + UC Functions。认证通过 Databricks OAuth 流转，没有共享服务账户，没有硬编码在环境变量中的凭证。

### Agent 应走与人类分析师相同的治理层

核心原则：如果公司的人类分析师不能查询某张表，代表他们行事的 Agent 也不应该能。如果有经过审批的 churn 计算函数，Agent 应该调用该函数而非在 prompt 中自己实现。如果有定义"月活用户"的语义模型，Agent 应该使用它而非从列名猜测。这不是 Databricks 特有的洞察——这是 Agent-数据集成应有的模式。CrewAI 已在 Snowflake 上做了同样的事，并将继续覆盖所有主流数据平台。

### 数据质量是 Agent 治理的隐性前置条件

文章揭示了一个被忽视的问题：Agent 不知道某张表的"revenue"列与另一张表的含义不同，也不知道某个遗留表中一半记录自 2023 年以来未更新。数据治理不仅是"谁能访问什么"，还包括数据是否被良好地结构化和标注，使 Agent 能负责任地使用它。这解释了为什么 800 个积压用例中大多数不是被模型智能阻塞，而是被尚不存在的数据访问模型阻塞。

## 实践启示

1. **立即审计 Agent 的数据访问模式**：检查所有 Agent 是否直接持有数据库凭证。如果有，优先迁移到 MCP Server 模式或 API 中间层。直接凭证是安全反模式，不应存在于生产环境。

2. **按四种交互模式拆分数据访问**：不要给 Agent 一个万能数据库连接。为语义查询、SQL 查询、业务逻辑调用、向量检索分别创建独立的治理工具，每个工具只暴露 Agent 实际需要的数据范围。

3. **利用现有数据治理基础设施**：如果企业已在 Databricks/Snowflake/BigQuery 上建立了治理层（Unity Catalog、行级安全、列掩码、审计日志），Agent 应该接入这些已有设施，而非构建平行的治理系统。

4. **优先解决数据质量问题**：在投入 Agent 开发之前，先确保数据被良好地结构化、标注和定义。语义模型（如"什么是活跃用户"）应由数据团队预先定义，而非让 Agent 从列名猜测。

5. **OAuth 优于共享凭证**：Agent 的认证应走企业 SSO/OAuth 流程，使 Agent 的访问权限与调用它的用户身份绑定。避免使用共享服务账户或硬编码在环境变量中的宽泛权限。

## 与现有实体差异化

| 维度 | 本实体 | 现有 TiDB Agent 数据库实体 |
|------|--------|--------------------------|
| 关注点 | Agent 数据治理/权限模型 | Agent-native 数据库架构 |
| 权限模型 | MCP Server 中间层 | 数据库层面的 Agent 适配 |
| 厂商视角 | CrewAI（Agent 框架） | TiDB（数据库厂商） |

---

**来源**: → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/stop-giving-your-agents-database-credentials.md)

---
