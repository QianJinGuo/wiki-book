# Amazon Quick + Cisco Webex MCP 会议准备与跟进助手：meeting-lifecycle MCP 编排实战

## Ch03.077 Amazon Quick + Cisco Webex MCP 会议准备与跟进助手：meeting-lifecycle MCP 编排实战

> 📊 Level ⭐⭐ | 10.3KB | `entities/amazon-quick-cisco-webex-mcp-meeting-prep-followup-assistant.md`

# Amazon Quick + Cisco Webex MCP 会议准备与跟进助手

> AWS 官方博客实战教程（2026-06-12 发布）。展示 Amazon Quick chat agent 通过 native MCP 集成编排 3 个 Cisco Webex MCP server（Meetings + Vidcast + Messaging），从单次 prompt 端到端完成 meeting 准备 + 跟进 draft，**meeting-lifecycle 闭环** 是 Amazon Quick + 第三方 MCP 集成模式的新案例。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-a-meeting-prep-and-follow-up-assistant-with-amazon-quick-and-cisco-webex-mcp-servers.md)

## 核心要点

- **核心问题**：recurring meeting 在会前需要 dig 通过上次 summary、transcript、recording + 拉相关 Vidcast 上下文 + 查 Webex 消息线程中的 unresolved follow-up——会后又要 draft 跟进消息。多个工具间切换是 productive time 的最大 leak
- **架构核心**：Amazon Quick chat agent 作为编排层，通过 native MCP 集成调用 Cisco 托管的 3 个 MCP server（Meetings / Vidcast / Messaging），单 prompt 触发完整 meeting-lifecycle workflow
- **3 个 Webex MCP server 的 tool routing 模式**：agent 根据 prompt 阶段（prep / follow-up）调用不同的 tool——prep 用 `webex-list-meetings` / `vidcast-search-videos` / `webex-search-spaces`；follow-up 用 `webex-get-meeting-summary` / `vidcast-get-video-highlights` / `webex-search-messages`
- **OAuth scope 分层防御**：read-only scopes (`meeting:schedules_read`, `spark:messages_read`) 默认开启；write scopes (`meeting:schedules_write`, `spark:messages_write`) 必须 **opt-in + 显式 user confirmation + 限定 non-production space**——agent 不会自动 post message 到 Webex space
- **prep brief 5 段固定结构**：upcoming agenda + prior decisions/action items + related Vidcast updates + unresolved follow-ups + recommended Vidcast watch-next——确保 cross-shift handoff 一致性
- **扩展面**：同一个 agent 可以叠加 100+ pre-built action connector（Slack / Outlook / Jira / ServiceNow / Salesforce）+ enterprise data source（S3 / Drive / SharePoint / Confluence），从 meeting 工具演变成 team productivity hub

## 深度分析

### 与现有 Amazon Quick 实体的差异化

Amazon Quick + MCP 集成模式已有多个 entity 覆盖不同 MCP server 家族：

- **[Agentic Incident Triage](../ch11/216-amazon-quick.html)**（New Relic MCP）— SRE incident response 场景，时间敏感 / RCA brief 5 段
- **[FinOps Chat](../ch11/128-amazon-quick-bedrock-agentcore-finops.html)**（Billing MCP via Bedrock AgentCore）— 成本查询场景，对话式多账号 AWS 成本
- **[Time Series Market Intelligence](../ch07/069-amazon-quick-mcp.html)**（KDB-X MCP）— 金融交易场景，时间序列分析
- **[飞书 MCP](../ch11/216-amazon-quick.html)**（自建远程 MCP）— 国产办公协同场景，200+ 工具上下文治理
- **[AML Alert Triage](../ch11/216-amazon-quick.html)**（Snowflake MCP）— 合规反洗钱场景

新 article 占据**完全不同的轴**：**meeting-lifecycle 场景** + **Cisco Webex MCP server 家族**（Meetings / Vidcast / Messaging 三件套）+ **第三方托管 MCP（非自建）** + **OAuth scope 分层 read/write 治理**。与 New Relic / KDB-X / Snowflake / 飞书 等 MCP server 完全没有交叉，且 meeting-lifecycle 场景是 wiki 现有 Amazon Quick 覆盖的盲区。

### 3 个 Cisco Webex MCP server 详解

| MCP server | Server URL | 关键 tool 集 | 用途 |
|---|---|---|---|
| **Webex Meetings MCP** | `mcp.webexapis.com/mcp/webex-meeting` | `webex-list-meetings`, `webex-get-meeting-summary`, `webex-list-transcripts`, `webex-list-recordings` | 会议元数据 + AI 摘要 + transcript + recording |
| **Vidcast MCP** | `mcp.webexapis.com/mcp/vidcast` | `vidcast-search-videos`, `vidcast-get-video-highlights`, `vidcast-get-video-transcript`, `vidcast-recommend-watch-next` | 视频内容检索 + AI highlight + 推荐 |
| **Webex Messaging MCP** | `mcp.webexapis.com/mcp/webex-messaging` | `webex-search-spaces`, `webex-search-messages`, `webex-get-thread` | 空间检索 + 消息检索 + 线程拉取 |

**关键 insight**：3 个 server 都是 **Cisco 官方托管**（`mcp.webexapis.com` 域名），用户无需自建 MCP runtime——与 [飞书自建远程 MCP](../ch11/216-amazon-quick.html) 形成对比。这也意味着 OAuth 集成走 **Webex Developer Portal** 的标准 OAuth 2.0 flow，Amazon Quick 在 Add integration 阶段提供 redirect URL 回调。

### OAuth Scope 分层防御（read vs write）

Webex MCP server 提供了**完整 read/write scope 分离**，Amazon Quick 集成时建议**先 read-only 灰度**：

| MCP server | Read scope（默认开启） | Write scope（opt-in + 显式 confirmation） |
|---|---|---|
| Meetings MCP | `meeting:schedules_read`, `meeting:participants_read`, `meeting:summaries_read`, `meeting:recordings_read`, `meeting:transcripts_read` | `meeting:schedules_write` |
| Messaging MCP | `spark:messages_read`, `spark:rooms_read` | `spark:messages_write` |
| Vidcast MCP | `Identity:Organization`, `Identity:Config` | （Vidcast 主要是 read-only） |

**write scope 治理三件套**（per 官方建议）：
1. **显式 user confirmation** — agent 必须 ask before posting，system prompt 明确禁止 "Never create, update, or delete Webex content without explicit user confirmation"
2. **Non-production space 灰度** — write action 先在 sandbox / dev space 跑通，再 enable broad
3. **Log every write action invocation** — audit trail，便于事后追溯

这一 read/write scope 分层模型与 [New Relic MCP incident triage](../ch11/216-amazon-quick.html) 的 "scoped OAuth (tasks:write only)" 思路一致——MCP 集成时代，**scope 最小化是 agent 安全的第一道防线**。

### Meeting-lifecycle 闭环的 4 阶段

| 阶段 | Prompt 触发 | 关键 tool 调用 | 输出 |
|---|---|---|---|
| **1. 会议预约查询** | "Prepare me for [meeting]" | `webex-list-meetings` | 找到 upcoming meeting |
| **2. 历史 context 拉取** | （自动） | `webex-get-meeting-summary`, `webex-list-transcripts`, `webex-list-recordings` | prior decisions + action items + transcript |
| **3. 关联 Vidcast 推荐** | （自动） | `vidcast-search-videos`, `vidcast-get-video-highlights`, `vidcast-recommend-watch-next` | related video content |
| **4. 跟进消息 draft** | "Meeting just ended" | `webex-search-spaces`, `webex-search-messages` | follow-up draft for Webex space |

**关键 insight**：阶段 1-3 是 **prep flow**（会前），阶段 4 是 **follow-up flow**（会后）。同一个 agent 通过 system prompt 引导切换行为，无需 separate agent 部署——展示了 Amazon Quick chat agent 的 **multi-flow system prompt 模式**。

## 实践启示

- **meeting-lifecycle 是 Amazon Quick + MCP 集成的下一个高价值场景**：现有 MCP 集成案例集中在 SRE / FinOps / 合规等"专业领域"，meeting prep 是**全员 daily workflow**，覆盖面更广
- **第三方托管 MCP 比自建 MCP 更易落地**：Cisco 官方提供 hosted MCP endpoint + OAuth flow 文档，无需企业自建 runtime——降低 80% 集成成本
- **read/write scope 分层是 MCP 集成的安全范式**：每个 MCP server 都应明确区分 read scope（默认）和 write scope（opt-in），write 必须配 explicit user confirmation
- **prep + follow-up 闭环而非单点**：meeting 工具的真正价值不在 prep 或 follow-up 任一单点，而在 **同一 agent 串联两端**——避免 context loss
- **Amazon Quick 作为统一 conversational workspace**：100+ pre-built action connector + enterprise data connector + 第三方 MCP server，让用户在一个 chat 窗口内完成"所有协作动作"

## 相关实体

- [Amazon Quick + New Relic MCP incident triage](../ch11/216-amazon-quick.html) — 同 Amazon Quick + MCP 编排模式，但 MCP server 家族和场景不同（SRE vs meeting）
- [Amazon Quick + Bedrock AgentCore FinOps](../ch11/128-amazon-quick-bedrock-agentcore-finops.html) — 同 Amazon Quick 对话模式，FinOps 成本查询场景
- [Amazon Quick + KDB-X MCP 时序市场](../ch07/069-amazon-quick-mcp.html) — 金融时序场景 MCP 集成
- [Amazon Quick 操作飞书：自建远程 MCP](../ch11/216-amazon-quick.html) — 对比案例，国产办公协同自建 MCP 模式
- [Amazon Quick + Snowflake MCP AML 反洗钱](../ch11/216-amazon-quick.html) — 合规场景 MCP 集成
- [Aderant 法律云运营案例](../ch11/196-aderant-transforms-cloud-operations-with-amazon-quick.html) — Amazon Quick 行业 case study（legal-tech 角度）
- [Amazon Bedrock AgentCore](../ch04/657-agentcore-harness.html) — 另一种 Amazon MCP 部署 runtime（vs Amazon Quick 原生 MCP 集成）
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

