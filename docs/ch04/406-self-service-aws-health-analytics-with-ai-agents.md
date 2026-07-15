# Self-Service AWS Health Analytics with AI Agents

## Ch04.406 Self-Service AWS Health Analytics with AI Agents

> 📊 Level ⭐⭐ | 7.2KB | `entities/aws-health-analytics-ai-agents-mcp.md`

# Self-Service AWS Health Analytics with AI Agents

## 摘要

AWS 官方博客展示了一个名为 **Chaplin**（Customer Health and Planned Lifecycle Intelligence Nexus）的开源解决方案，通过 [MCP](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md) 工具将 AWS Health API 封装为 AI Agent 可调用的能力，让运维团队通过自然语言查询健康事件、获取影响分析和运维建议。该方案解决了传统 AWS Health 事件管理中依赖 TAM（技术客户经理）分析、缺乏自助分析能力的痛点。

## 核心要点

### 问题定义

企业运维团队面临的核心挑战：

- **信息过载**：一个典型周一早晨，团队可能收到来自 50+ 账户的多种 Health 通知（Amazon Linux 2 EOL、RDS 版本弃用、EC2 实例退役）
- **分析瓶颈**：依赖 TAM 解读健康事件，决策延迟
- **缺乏上下文**：预定义的 BI 仪表板无法回答动态问题，无法区分影响生产系统的事件和非关键事件
- **被动响应**：大量时间花在被动救火而非创新上

### Chaplin 解决方案架构

Chaplin 采用三层架构：

**1. 数据层（Data Tier）— 多账户采集**

- AWS Health API 作为事件源
- Amazon EventBridge 提供事件驱动触发
- Lambda 收集函数通过跨账户 IAM 角度收集事件
- S3 数据湖按账户、日期、事件类型分区存储
- DynamoDB 用于快速查询的结构化存储
- 支持两种部署模式：AWS Organizations API 集中部署 / 单账户独立部署

**2. 中间层（Middle Tier）— MCP Server + 智能分析**

- **基于规则的分类引擎**：用正则模式将事件映射到五大业务类别（迁移需求、安全合规、维护更新、成本影响、运维通知），大部分事件无需 AI 处理
- **AI 分析引擎**：基于 [Strands Agents](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-patterns.md) 框架 + Claude 4.5 Sonnet，包含三个专业化 Agent：
  - **SQL Query Agent**：自然语言 → DynamoDB 结构化查询
  - **Impact Analysis Agent**：结合客户元数据（环境、业务单元、所有权）评估非结构化事件描述
  - **DBQueryBuilder Agent**：生成多维聚合的优化数据库查询
- 所有能力通过 MCP 工具暴露给客户端

**3. 展示层（Presentation Tier）— MCP 客户端集成**

- 不需要自定义前端，直接在 Claude Code、Kiro CLI 等 MCP 兼容 AI 助手中使用
- 用户通过自然语言交互，AI 助手编排对 Chaplin MCP Server 的调用

### 关键 MCP 工具

Chaplin 暴露三类 MCP 工具：

| 类别 | 功能 | 特点 |
|------|------|------|
| Summary 工具 | 按服务、状态、类别、区域统计 | 直接查询 DynamoDB，即时返回 |
| Detail 工具 | 深入特定事件类别/类型 | 支持筛选和过滤 |
| AI Analysis 工具 | 自然语言查询 → 上下文化洞察 | 通过 Strands Agents + Bedrock 处理 |

## 深度分析

### 多 Agent 架构的设计哲学

Chaplin 的多 Agent 架构解决了一个企业数据分析的根本性挑战：**结构化与非结构化数据的有效结合**。

传统 RAG 系统在处理数值运算和聚合时存在固有的非确定性。向量相似度搜索可以检索语义相似的内容，但无法保证数学准确性。例如，当被问到"有多少个与 End-of-life 相关的健康事件"时，RAG 系统可能报告 190 个，而实际数量是 958 个。

Chaplin 的解决方案是**分层处理**：
- 结构化数据（事件类型、账户、时间戳）→ 精确的 DynamoDB 查询
- 非结构化数据（事件描述、影响评估）→ AI Agent 的语义理解
- 规则引擎处理大部分常规分类，AI 仅处理需要上下文分析的事件

### 成本优化策略

Chaplin 实现了智能成本优化：

1. **规则优先**：模式匹配处理大部分事件，不产生 AI 推理成本
2. **预构建摘要视图**：30/60/120 天窗口的预计算视图
3. **LLM 无关**：支持 Bedrock、OpenAI、Anthropic、Ollama 等多模型提供商
4. **智能缓存**：减少冗余 AI 处理
5. **结构化查询精度**：利用 AWS Health API schema 进行精确数值分析

### 与 AWS DevOps Agent 的集成愿景

Chaplin 的长期愿景是与 AWS DevOps Agent 集成，实现从自助分析到自主运维的演进：

- DevOps Agent 在调查事件时查询 Chaplin 确认是否有相关健康事件
- Chaplin 的影响范围分析提供业务上下文
- DevOps Agent 将健康事件数据与应用拓扑、遥测数据、部署历史关联
- 形成从被动救火到主动事件预防的反馈闭环

### 实际查询示例

以下是 Chaplin 能处理的典型查询及其能力维度：

| 查询类型 | 示例 | 能力维度 |
|----------|------|----------|
| 操作概览 | "未来 60 天有哪些 RDS 生命周期事件？" | 时间窗口过滤 + 服务筛选 |
| 影响评估 | "RDS PostgreSQL 弃用对 Tier-1 生产账户的影响？" | 多维聚合 + 业务上下文 |
| 根因分析 | "哪些账户重复收到健康通知？架构问题是什么？" | 模式识别 + 架构建议 |
| 修复规划 | "给我一个修复 Lambda 关键事件的计划" | AI 生成修复步骤 |

## 实践启示

1. **MCP 工具封装模式可复用**：将 AWS API 封装为 MCP 工具的模式适用于其他 AWS 服务（Cost Explorer、CloudTrail、Config 等）
2. **规则优先、AI 增强**：大部分事件分类用规则引擎处理，仅对需要语义理解的事件使用 AI，显著降低成本
3. **自助分析消除 TAM 瓶颈**：运维团队可以独立分析健康事件，无需等待 TAM 支持
4. **多账户统一视图**：通过 S3 数据湖 + DynamoDB 实现跨账户健康事件的集中分析
5. **架构级修复建议**：Chaplin 不仅报告问题，还能识别架构缺陷（如 ElastiCache 未启用自动补丁、VPN 单隧道架构）并给出优先级排序的修复方案

## 相关实体

- [MCP 模型上下文协议](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md)
- [Agent 架构模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-patterns.md)
- [AWS Bedrock AgentCore](../ch11/247-aws-bedrock-agentcore.html)
- [MOC: MCP 工具使用模式](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

