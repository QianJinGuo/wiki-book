# Cline releases open-source agent runtime SDK

## Ch01.099 Cline releases open-source agent runtime SDK

> 📊 Level ⭐ | 6.7KB | `entities/clinereleasesopen-sourceagentruntimesdk.md`

# Cline releases open-source agent runtime SDK
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/clinereleasesopen-sourceagentruntimesdk.md)

## 摘要
Cline 于 2026 年 5 月发布开源 Agent 运行时 SDK（`@cline/sdk`），将原先与 IDE 宿主深度耦合的核心 agent loop 重构为独立、可移植的分层 TypeScript 运行时，并把自己的 CLI、Kanban 以及 VS Code、JetBrains 扩展全部迁移到这一共享底座之上。SDK 原生内置 Agent Teams/Subagents、插件体系、CRON 定时任务、checkpointing、Web Search 与 MCP 连接器，在 Terminal Bench 2.0 上以 claude-opus-4.7 取得 74.2% 的成绩，领先同模型的 Claude Code（69.4%）。

## 核心要点
- **分层 TypeScript 架构**：`@cline/shared`（基础类型与工具）、`@cline/llms`（统一多模型提供商：Anthropic、OpenAI、Google、AWS Bedrock、Mistral、LiteLLM 及任意 OpenAI 兼容端点）、`@cline/agents`（无状态 agentic loop：迭代、工具编排、事件发射）、`@cline/core`（有状态编排：session 生命周期、持久化、配置发现）
- **Provider 切换零代码改动**：provider 逻辑完全隔离在 agent loop 之外，切换模型只是配置变更，而非代码变更
- **Session 可持久、可迁移**：UI 重启不再终止 session，session 可在不同产品表面间移动；agent loop 保持无状态，运行时变得 durable 与 portable
- **Harness 全面重写**：重写 prompts、收紧上下文管理、重构工具呈现方式，是 benchmark 提升的主要来源
- **Terminal Bench 2.0 领先**：Cline CLI + claude-opus-4.7 = 74.2%（Claude Code 同模型 69.4%）；开源权重模型 kimi-k2.6 = 55.1%（OpenCode 同模型 37.1%）
- **原生 Agent Teams/Subagents**：session 可委派专家 agent、跟踪进度、交换 handoff notes，无需独立编排层
- **Native Plugin 体系**：插件可注册工具、观察生命周期事件、添加规则、塑造 agent 视野；CRON、checkpointing、Web Search、MCP 连接器均为原生能力
- **`cline connect` 消息通道**：实验性 connector 让 agent 直达 Telegram、WhatsApp、Slack 等平台

## 深度分析
### 架构重构：在"拆不动"之前主动解耦
Cline 的关键决策是时机选择：在架构与 IDE 宿主强绑定到难以拆分之前，主动将核心 agent loop 抽离为独立 SDK，并先把自有 CLI 与 Kanban 迁移上去，VS Code 和 JetBrains 扩展随后跟进。这个顺序说明重构是产品级战略而非技术演练——runtime 成为可移植的基础设施，UI 变成其上的"产品层"，所有表面共享同一套 agent 实现，避免每个入口各自维护一套分叉的 agent 逻辑。对任何已在积累 IDE/CLI 强耦合代码的团队，这提供了"解耦要趁早"的参照。

### 分层与 Provider 解耦：多模型是架构而非功能
`@cline/shared` 打底、`@cline/llms` 收敛 provider、`@cline/agents` 运行无状态循环、`@cline/core` 管理有状态编排，每层单一职责。关键设计在于 provider 逻辑被完全挡在 agent loop 之外——切换 Anthropic、OpenAI、Bedrock 或任意 OpenAI 兼容端点只是配置变化，不触碰循环代码；同时 `npm install @cline/sdk` 支持整装安装，也可按需拉取单个包以缩减依赖面。这印证了 [Agent Harness 工程范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 中"模型可替换、harness 沉淀为可复用资产"的思路。

### Benchmark 解读：优势与模型强弱强相关
Terminal Bench 2.0 数据呈现出清晰的模型相关性：同用 claude-opus-4.7，Cline CLI 74.2% 对 Claude Code 69.4%，领先约 4.8pp；同用开源权重 kimi-k2.6，Cline CLI 55.1% 对 OpenCode 37.1%，领先约 18pp。领先幅度随模型变化显著，说明 Cline 的增益并非来自"模型更聪明"，而是来自 harness 层面的兑现：重写后的 prompts、更紧的上下文管理、更合理的工具呈现，在模型自身能力较弱时（开源权重模型）放大效应更明显。这对评估任何 agent runtime 都有启发——benchmark 差异应优先归因到 harness 还是模型。

### 原生内置：Teams、Plugin 与消息平台连接
Agent teams/subagents 直接在核心 runtime 内实现，session 可委派专家 agent、跟踪进度、交换交接笔记，不需要额外编排层；插件则通过注册工具、观察生命周期事件、添加规则、塑造 agent 视野四个扩展点承载领域逻辑，避免 fork 维护。CRON、checkpointing、Web Search、MCP 连接器作为一等原生能力内置，`cline connect` 以引导式 wizard 接入 Telegram、WhatsApp、Slack 等通道，整体体现了"扩展点在架构层固化"优于后期外挂式集成的工程取向。

## 实践启示
1. 评估 `@cline/sdk` 作为团队 Agent 基础设施时，先核对 TypeScript/Node.js 与现有技术栈的匹配度；多 provider 切换能力需用团队自有任务集实测，而非只看文档声明。
2. 借鉴"先抽 runtime、再迁移产品"的重构顺序：在架构与宿主耦合到拆不动之前主动解耦，让 CLI/IDE/编排面统一收敛到共享运行时。
3. 把扩展点（工具注册、生命周期观察、规则注入、视野塑造）作为一等公民设计进架构，避免后期 monkey patch 或 fork 维护。
4. 引用 benchmark 必须保持同模型对比，并注意领先幅度随模型强弱变化；做选型结论前用自有任务集独立复测。
5. 面向长任务的产品，优先保证 session 持久化与跨表面迁移能力，让 agent loop 保持无状态、运行时保持可移植。
6. 商业产品二次分发前需确认许可证边界：engine 与 SDK 许可不同（engine 采用 Elastic License 2.0，SDK 采用 Apache 2.0），内部研究与架构验证无碍，闭源衍生需法务把关。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [Cline open-source agent runtime SDK（姊妹条目）](../ch03/037-agent.html)
- [State of CLI coding agents（2026 年中）](../ch09/172-state-of-cli-coding-agents-mid-2026.html)
- [OpenSquilla 开源 AI Agent](../ch04/795-opensquilla-launches-open-source-ai-agent-to-cut-token-costs.html)
- [AI Gateway Production Index](../ch05/108-ai.html)
- [开源 Agent 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/open-source-agent-frameworks.md)

---

