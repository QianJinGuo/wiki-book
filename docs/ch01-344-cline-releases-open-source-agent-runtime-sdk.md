# Cline releases open-source agent runtime SDK

## Ch01.344 Cline releases open-source agent runtime SDK

> 📊 Level ⭐⭐ | 10.6KB | `entities/cline-agent-runtime-sdk.md`

## Cline releases open-source agent runtime SDK

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cline-agent-runtime-sdk.md)

## 摘要

Cline 在 2026-05-13 发布 `@cline/sdk`，将原本耦合在 IDE 内的 Agent 运行时重构为一套独立的、可移植的分层 TypeScript 栈（`@cline/shared` / `@cline/llms` / `@cline/agents` / `@cline/core`）。CLI、VS Code 与 JetBrains 插件均迁移到这套运行时之上；Terminal Bench 2.0 上 Cline CLI + claude-opus-4.7 取得 74.2%（vs Claude Code 同模型 69.4%），在 open-weight 模型 kimi-k2.6 上达到 55.1%（vs OpenCode 37.1%）。SDK 原生支持 agent teams / subagents、plugins、CRON jobs、checkpointing、MCP connector，以及 `cline connect` 一键接入 Telegram、WhatsApp、Slack。

## 核心要点

- **从 IDE 宿主中解耦的核心 Agent Loop**：团队选择"重新构建"而非"叠加"，原因在于既有架构已经与 IDE 宿主不可分离；新设计把 stateless agentic loop 与 stateful orchestration 清晰分层。
- **Provider 完全外置于 agent loop**：`@cline/llms` 覆盖 Anthropic、OpenAI、Google、AWS Bedrock、Mistral、LiteLLM 与任何 OpenAI 兼容端点；切换 provider 是 config change 而非 code change。
- **跨表面可迁移的会话**：session 不再随 UI 重启而死亡，可在 CLI、VS Code、JetBrains 之间无缝迁移；这是 harness 升级后"长时间任务可恢复"的关键能力。
- **Agent teams / subagents 原生化**：单一 core runtime 内部即可完成专家 agent 分发、进度追踪与交接备注（handoff notes），不再需要独立编排层。
- **Plugin 模型取代 Fork**：团队可通过插件注册工具、监听 lifecycle events、注入 rules、塑造 agent 视野，无需 fork 整个项目。
- **基准对照**：Terminal Bench 2.0 上跑赢 Claude Code（Cline 74.2% vs Claude Code 69.4%，同模型）；在 kimi-k2.6 上 Cline 55.1% vs OpenCode 37.1%——证明 harness 优化对开源模型同样有效。

## 深度分析

### 1. 重构动机：为什么"叠加"行不通

原文披露了一个工程上常见的拐点：当 IDE 插件形态的 Agent 积累了 Prompt 工程、上下文管理、工具编排、会话持久化等大量能力后，"每加一项新能力就在 IDE 宿主之上多糊一层"的做法会让 agent loop 与 IDE runtime 越来越不可分离。这带来的代价是：测试只能在 IDE 内跑、跨表面（CLI / VS Code / JetBrains）共享会话成本极高、新 surface（headless CI、桌面 Kanban）的出现都要求 agent loop 重新实现一次。

Cline 的选择是把核心 agent loop **重建为 standalone、portable 的 SDK**，并把自家 CLI 和 Kanban 迁移到这个 SDK 之上，VS Code 与 JetBrains 扩展正在跟进。这本质上是一次"agent loop 平台化"的战略决策——agent runtime 从产品的一个组件升级为所有产品共用的基础设施。

### 2. 分层 TypeScript 栈：单一职责的可组合架构

`@cline/sdk` 是一个清晰分层的 TypeScript 栈：

- **`@cline/shared`**：基础类型与工具方法。
- **`@cline/llms`**：provider 层，封装 Anthropic / OpenAI / Google / AWS Bedrock / Mistral / LiteLLM 与所有 OpenAI 兼容端点，**provider 逻辑完全位于 agent loop 之外**。
- **`@cline/agents`**：stateless agentic loop，负责 iteration、tool orchestration、event emission。
- **`@cline/core`**：stateful orchestration 层，掌管 session 生命周期、持久化、config discovery。

应用面（CLI、VS Code、JetBrains）只是"消费者"，并不"拥有" runtime。这种"kernel vs shell"的设计让团队既能 `npm install @cline/sdk` 安装完整栈，也能按需拉取独立包获得更小的 surface。

### 3. Harness 升级带来的可恢复性与可迁移性

新 SDK 改写 prompts、收紧 context management、重做工具暴露面（how tools are surfaced to the model）。最关键的能力提升是：

- **Session 不再随 UI 重启死亡**——这是长任务可靠性的一道分水岭。
- **Session 跨 surface 迁移**——同一份会话可以从 CLI 转到 VS Code 再转到 JetBrains，对开发者的工作流灵活性是量级提升。
- **Agent loop 保持 stateless 与可复用，runtime 周边变成 durable 与 portable**——这是一种典型的"把状态外置到文件系统"的设计哲学，与 Anthropic 长期运行 Agent 工程博客的"持久化记忆在文件系统而非上下文窗口"的建议一脉相承。

### 4. Agent Teams / Subagents / Plugins：原生 vs 后装

SDK 原生支持 agent teams 与 subagents：会话可以委派给专家 agent、追踪进度、交换 handoff notes，**全部在同一个 core runtime 内部完成**，无需另起独立编排层。这意味着 multi-agent 协作的成本不再来自"接入一个框架"，而是"配置几个角色"。

Plugin 取代 fork 的设计哲学同样关键：一个 plugin 可以注册 tools、监听 lifecycle events、注入 rules、塑造 agent 视野——领域特定行为不必 fork 整个项目就能加入。这种"扩展点原生化"的模式比传统的"二次开发定制"更具生态友好性。

### 5. CRON / Checkpointing / MCP / Connector Channels

SDK 的"调度与连接能力"覆盖了几个常见的工程需求：

- **Scheduled CRON jobs**：定时触发的 Agent 任务，让"夜间自检 / 定时重试 / 周报生成"等场景具备可声明的解决方案。
- **Checkpointing**：长时间任务的中间状态持久化，断点续跑成为基础能力。
- **Web search & MCP connectors**：与外部数据源和工具协议（MCP）的连接是 native，而非通过第三方适配层。
- **`cline connect` wizard**：实验性的 connector channels 让 agent 直接对外暴露到 Telegram、WhatsApp、Slack 等平台——这是"agent 不只是开发工具"的早期信号，agent 正在变成团队中的"数字同事"。

### 6. Terminal Bench 2.0 的基准读数

文章披露的基准数据需要分层解读：

- **claude-opus-4.7 闭源模型上**：Cline CLI 74.2% vs Claude Code 69.4%——同一模型、同一基准下，**harness 差异贡献约 4.8 个百分点**。这正是 "Agents aren't hard; the Harness is hard"（OpenAI Ryan Lopopolo）这一论断的实证支持。
- **kimi-k2.6 开源权重模型上**：Cline CLI 55.1% vs OpenCode 37.1%——**harness 差距在开源模型上被显著放大**（约 18 个百分点）。这暗示：开源模型对 harness 优化的"敏感度"高于闭源旗舰模型；harness 可能是开源模型缩小与闭源差距的关键杠杆。

这两个数据点联合说明：**harness 工程不是模型的附庸，而是一条独立的能力维度**——它能把同模型的得分推高 5%-18%。

### 7. 生态背景：Cline 的位置

原文提及几个值得关注的背景事实：

- Cline 服务超 **700 万开发者**（2026-05），是 Claude Sonnet 3.5 时期就出现的早期 agentic coding 项目，自称"the first real agentic coding experience"。
- Cline CLI 2.0 已上线，强调 terminal-first execution 与 headless CI 支持。
- Cline Kanban 是基于 git 仓库运行多个 agent 并行的可视化编排层。
- SDK 的发布是所有这些 surface 的"基础设施层"——它把先前各自独立的产品变成"共享同一个开放地基的衍生品"。

### 8. 与同类项目的差异

| 项目 | 形态 | 核心差异 |
|---|---|---|
| Claude Code | Anthropic 闭源 CLI | 单表面、单模型家族深度集成 |
| Cline SDK | 开源 SDK | 分层可移植、多 provider、多 surface |
| OpenCode | 开源 CLI | 同样面向开源模型，但 Terminal Bench 2.0 上落后 Cline ~18pp（kimi-k2.6） |

Cline 的核心差异化在于：(1) 把 agent loop 做成 portable kernel；(2) provider 抽象做到"config 而非 code"；(3) 在开源模型上跑出接近闭源的体验。

## 实践启示

1. **Harness 是独立能力维度**：同模型在不同 harness 下能差 5-18 个百分点——选模型时务必同时评估 harness 工程能力。
2. **开源模型 + 强 harness 是高 ROI 组合**：开源权重模型对 harness 优化的敏感度更高，企业可借此获得"模型可控 + 性能接近闭源"的双重收益。
3. **Stateless loop + Stateful runtime 的分层值得借鉴**：把 agent loop 的纯逻辑与会话持久化解耦，是实现跨表面 / 跨会话迁移能力的前提。
4. **Provider 抽象做到"配置而非代码"**：当切换模型的成本从 PR 降为 yaml 改动时，A/B 测试、成本优化、provider 降级的能力都会质变。
5. **Plugin 取代 Fork 是生态策略**：开放 lifecycle hooks、tool 注册、rule 注入等扩展点，比"开源 + 等社区 fork"更能聚集生态。
6. **MCP 与 connector channels 是 2026 的新基础设施**：agent 与外部世界的连接通道（IM 平台、外部数据源、CI 工具）正在成为平台级能力，应纳入长期架构规划。

## 相关实体

- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/) — Claude Code 的源码级解读，与 Cline SDK 形成"闭源深度 vs 开源可移植"对照
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-167-深入理解-claude-code-源码中的-agent-harness-构建之道/) — Claude Code harness 设计的深度剖析
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/) — Agent 记忆系统的工程实践，与"持久化在文件系统"理念呼应
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/) — 从 vibe coding 到 agentic engineering 的范式跃迁
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/) — Vibe Coding 与 Agentic Engineering 的同源访谈
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-268-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed/) — AWS Bedrock AgentOps 的规模化运营实践
- [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/) — Claude Code harness 的另一深度解析
- [Claude Code Harness Deep Dive Founder Park](/ch01-558-claude-code-harness-深度分析/) — 同主题的另一种解读视角
- [scaling archunit with nebula archrules](/ch11-236-scaling-archunit-with-nebula-archrules/)
- [the code-as-content era](/ch01-397-the-code-as-content-era/)
- [the shape of the thing](/ch01-182-the-shape-of-the-thing/)
- MOC

---

