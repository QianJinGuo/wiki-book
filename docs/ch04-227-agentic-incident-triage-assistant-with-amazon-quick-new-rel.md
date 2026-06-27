# Agentic Incident Triage Assistant with Amazon Quick, New Relic MCP Server, and Asana

## Ch04.227 Agentic Incident Triage Assistant with Amazon Quick, New Relic MCP Server, and Asana

> 📊 Level ⭐⭐ | 10.2KB | `entities/agentic-incident-triage-assistant-amazon-quick-new-relic-asana.md`

# Agentic Incident Triage Assistant with Amazon Quick, New Relic MCP Server, and Asana

> AWS 官方博客实战教程（Ebbey Thomas / Muthuvelan Swaminathan），2026-06-09 发布。展示 Amazon Quick chat agent 如何通过 native MCP 集成编排 New Relic 推理工具 + Asana 任务系统，从单次 prompt 端到端完成 incident triage + RCA brief + handoff task 自动化。

## 相关实体

- [amazon quick + cisco webex mcp 会议准备与跟进助手：meeting-lifecycle m](/ch03-074-amazon-quick-cisco-webex-mcp-会议准备与跟进助手-meeting-lifecycle-m/)
- [introducing the mdn mcp server](/ch07-055-introducing-the-mdn-mcp-server/)
- [从 pi-main 源码拆解：顶尖 ai agent 的工程设计（17 维度全解）](/ch04-164-从-pi-main-源码拆解-顶尖-ai-agent-的工程设计-17-维度全解/)
- [万级实时推理的商品领域agent实践思考和总结](/ch04-486-万级实时推理的商品领域agent实践思考和总结/)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-an-agentic-incident-triage-assistant-with-amazon-quick-and-new-relic.md)

- MOC
## 核心要点

- **核心问题**：SRE incident triage 是时间敏感工作，需要快速 collect evidence、assess user impact、create follow-up work——通常在多个工具间切换导致 handoff 延迟和 knowledge loss
- **架构核心**：Amazon Quick chat agent 作为编排层，通过 native MCP 集成调用 New Relic 的 5 个推理工具 + Asana 的任务创建，单 prompt 触发完整 incident response 流程
- **5 个 New Relic 推理工具的 tool routing 模式**：agent 根据 prompt 内容决定调用哪些 tool，展示了 agentic tool selection 在生产环境的实现
- **RCA brief 标准格式**：Summary / Blast radius / Likely trigger / Key evidence / Recommended next actions 5 段固定结构，确保 cross-shift handoff 一致性
- **安全治理三层防御**：least-privilege New Relic service account、scoped Asana OAuth（tasks:write 等）、Asana task notes 当 handoff 摘要而非数据导出——明确列出禁止写入 PII / 凭据 / 拓扑细节

## 深度分析

### 1. Agentic 编排架构：Chat Agent 作为三方集成枢纽

Amazon Quick 在此架构中扮演 **编排层（orchestration layer）** 角色，与 Aderant 案例中作为"统一搜索入口"的角色互补：

- **Aderant 场景**（[Aderant Transforms Cloud Operations With Amazon Quick](/ch11-173-aderant-transforms-cloud-operations-with-amazon-quick/)）：Quick 接入 6 个供应商系统的 MCP servers，专注 cross-source RAG 搜索
- **本场景**：Quick 通过单 agent 同时编排 2 个 tool 类别——observability tools（New Relic 推理 + 查询）+ action tools（Asana 任务创建）

这种"单 agent + 多 tool 类别"的模式是当前 agentic AI 落地的标准形态，与 [Claude Code Dynamic Workflows Multi Agent Orchestration](/ch04-409-agent-orchestration/) 描述的动态 fan-out 模式形成对比——Amazon Quick 提供的是 **预定义工具集的稳定编排**，而非 Claude Code 的动态 sub-agent 生成。

### 2. New Relic 5 个推理工具的 Tool Routing 模式

文章最实战价值在于其给出的 **tool routing 表**——agent 如何根据 prompt 内容决定调用哪些 tool：

| Tool 用途 | New Relic 工具 | 触发条件 |
|----------|---------------|---------|
| 告警驱动分析 | `generate_alert_insights_report` | alert fired, key drivers, signals changed |
| 影响范围量化 | `generate_user_impact_report` | blast radius, customer impact, users affected |
| 日志签名分析 | `analyze_entity_logs` | logs, error signature, exceptions, anomalies |
| 事务性能 | `analyze_transactions` | slow requests, latency, transactions |
| 自定义查询 | `natural_language_to_nrql_query` | segmentation by region, version, endpoint |

这种 **declarative tool routing**（用 system prompt 中的 if/then 块定义）比 Claude Code 的 Skills 机制更刚性但更可预测，适合**生产 SRE 场景的可审计性要求**。

### 3. RCA Brief 标准格式：Cross-Shift Handoff 的一致性保证

文章强制要求 RCA brief 输出遵循固定 5 段格式：

```
- Summary (1-2 lines)
- Blast radius
- Likely trigger
- Key evidence (bullets with links)
- Recommended next actions (3 bullets)
```

这一设计直接解决 SRE 实践中的核心痛点：**shift handoff 时的 knowledge loss**。无论当班工程师是谁，AI 生成的 RCA 都遵循相同结构，下一班工程师可在 30 秒内快速理解 incident 状态。

与 [Hermes Agent Tool System Architecture](/ch04-418-hermes-agent/) 等"工具架构"主题 entity 的差异：本 entity 关注 **incident response 流程标准化** 而非 agent 内部工具系统设计。

### 4. 异步补全 vs 实时编排的对比

本架构中 **Amazon Quick 是同步编排**（单 prompt 触发 → 5 工具调用 → RCA 输出 → Asana 任务创建），与 [Ai Infra Auto Driven Skills V0 Bbuf Giantpanda](/ch07-036-ai-infra-auto-driven-skills-v0-1-0-给-codex-claude-code-的推理/) 描述的"长时自驱动 agent"模式相反：

- **同步编排（Quick 模式）**：用户给 prompt → AI 立即完成 → 人类 review + confirm Asana 任务创建（"Yes, create an Asana task..."）
- **异步自驱动（auto-driven 模式）**：AI 在 background 持续运行 → 周期性输出 → 人类异步 review

两种模式各有适用场景——incident triage 的时间敏感性要求**同步完成 + 人类 confirm 关键动作**（避免 AI 误创建大量 Asana tasks）。

### 5. 安全治理：生产级 Agentic 系统的必要约束

文章最后 5 节专讲 security & governance，列出**禁止在 RCA / Asana 任务中写入的内容清单**：

- PII（personally identifiable information）
- Customer identifiers / user IDs / email addresses / IP addresses
- Session tokens / raw credentials
- Internal hostnames / infrastructure topology details
- Database connection strings / environment variables

同时要求：
- **New Relic 服务账户**：用 Read only role 或 custom role 限定 APM / logs / alerts / entities / NRQL read-only access
- **Asana OAuth scope 最小化**：只给 `tasks:write, tasks:read, projects:read, workspaces:read`
- **Asana task notes 当 handoff 摘要**，不当 raw incident data export

这些约束体现生产 agentic 系统的关键原则：**least privilege + data minimization + audit trail**。

## 与现有 wiki 实体的差异化

| 维度 | 本 entity | [Aderant Transforms Cloud Operations With Amazon Quick](/ch11-173-aderant-transforms-cloud-operations-with-amazon-quick/) | [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](/ch01-532-solution-overview/) |
|------|----------|------------------|------------------|
| 场景 | SRE incident triage + RCA + handoff | 律师事务所 cross-source 知识搜索 | 金融 AML 告警 triage |
| 集成广度 | 2 个集成（New Relic + Asana） | 6 个供应商系统 MCP | 1 个 Snowflake 集成 |
| 任务流程 | 端到端（investigation → RCA → task） | 单点搜索 | 单点告警分析 |
| Tool 编排 | 5 推理工具 + 1 action tool | RAG 检索为主 | SQL 模板 + 规则匹配 |
| 输出 | 标准化 RCA brief + tracked task | 搜索结果 | AML 告警分类 |

**核心定位差异**：本 entity 是 **incident response 端到端 agentic 编排**，而 aderant 是 **cross-source RAG 搜索**，automate-aml 是 **规则化告警分流**。三者共同构成 "Amazon Quick 在企业 AI 应用" 的不同切入点。

## 实践启示

- **Amazon Quick 作为企业级 agent 平台**：其 native MCP 集成 + chat agent + action connectors 组合，已具备生产级 SRE 场景的部署能力
- **Tool routing 文档化**：5 个 New Relic 工具的 routing 表是 agentic 系统的"控制平面"，应在 system prompt 中显式声明，而非依赖模型推断
- **RCA 标准化格式**：跨工程师一致性的关键，比"AI 写得好"更重要的是"AI 按固定结构写"
- **安全治理的 5 段禁止清单**：是任何生产 agentic 系统的"红线规则"——PII / 凭据 / 拓扑信息必须从 RCA 输出中显式排除
- **Human-in-the-loop 关键节点**：Asana 任务创建要求用户 confirm "Yes, create an Asana task..."——避免 AI 误创建大量任务

## 相关主题

- [Aderant Transforms Cloud Operations With Amazon Quick](/ch11-173-aderant-transforms-cloud-operations-with-amazon-quick/) — Amazon Quick 在法律行业的 cross-source RAG 案例（同一产品不同应用场景）
- [Amazon Bedrock Agentcore Gateway Mcp Extension](/ch11-014-extending-mcp-support-for-amazon-bedrock-agentcore-gateway/) — Amazon Bedrock AgentCore 的 MCP gateway 扩展（MCP 在 AWS 的另一面）
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](/ch01-532-solution-overview/) — Amazon Quick 在金融 AML 告警分流的应用（同一产品的规则化分流场景）
- [Aws Bedrock Agentcore Doris Mcp Server](/ch04-202-doris-mcp-on-agentcore-runtime-vpc原生mcp部署模式/) — AWS Bedrock AgentCore + Doris MCP server 的另一个生产实战
- [Ai Infra Auto Driven Skills V0 Bbuf Giantpanda](/ch07-036-ai-infra-auto-driven-skills-v0-1-0-给-codex-claude-code-的推理/) — 长时自驱动 agent 模式（与本 entity 的同步编排模式形成对比）

---

