# Cline releases open-source agent runtime SDK

## Ch01.400 Cline releases open-source agent runtime SDK

> 📊 Level ⭐⭐ | 12.3KB | `entities/cline-open-source-agent-runtime-sdk.md`

> [!abstract]
> Cline 发布开源 Agent 运行时 SDK（`@cline/sdk`），采用分层 TypeScript 架构，解耦 Provider、Agent Loop 和 Core Runtime。支持 Agent Teams、插件系统、原生 MCP 连接器。Terminal Bench 2.0 测试中优于 Claude Code。
> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cline-open-source-agent-runtime-sdk.md)

## 核心要点
- **开源许可**：Apache 2.0，基于自身编码 Agent 实践经验构建
- **模型无关架构**：通过 `@cline/llms` 层统一抽象，支持 Anthropic、OpenAI、Google、AWS Bedrock、Mistral、LiteLLM 及任何 OpenAI兼容端点
- **双语言 SDK**：TypeScript（主）+ Python
- **突破长程任务限制**：Session 可跨 UI 重启存活，可跨 Surface 迁移
- **基准测试领先**：Terminal Bench 2.0 上以 74.2% 超越 Claude Code 的 69.4%

## 技术架构
Cline SDK 采用分层 TypeScript 架构，每层职责单一 ：
```
┌─────────────────────────────────────────────┐
│  App Surfaces (CLI / VS Code / JetBrains)   │
├─────────────────────────────────────────────┤
│  @cline/core     — Stateful Orchestration   │
│                  Session 生命周期、持久化、  │
│                  配置发现                    │
├─────────────────────────────────────────────┤
│  @cline/agents   — Stateless Agent Loop      │
│                  迭代、工具编排、事件发射     │
├─────────────────────────────────────────────┤
│  @cline/llms    — Provider Layer            │
│                  LLM 接口抽象（Provider 逻辑 │
│                  完全脱离 Agent Loop）       │
├─────────────────────────────────────────────┤
│  @cline/shared  — Foundational Types        │
│                  基础类型和工具函数          │
└─────────────────────────────────────────────┘
```

### 各层职责详解
| Package | 职责 | 说明 |
|---------|------|------|
| `@cline/shared` | 基础层 | 共享类型定义和工具函数 |
| `@cline/llms` | Provider 层 | 支持 Anthropic/OpenAI/Google/AWS Bedrock/Mistral/LiteLLM，切换 Provider 仅是配置变更而非代码变更 |
| `@cline/agents` | Agent Loop | 无状态循环，处理迭代、工具编排、事件发射 |
| `@cline/core` | 编排层 | 有状态编排，管理 Session 生命周期、持久化、配置发现 |
**安装方式**：
```bash

# 完整安装
npm install @cline/sdk

# 按需安装（减小体积）
npm install @cline/core    # 仅运行时核心
npm install @cline/agents # 仅 Agent Loop
npm install @cline/llms    # 仅 LLM Provider
```

## 核心特性
### 1. Agent Teams & Subagents 
- Session 可委托给专业 Agent（Subagent）
- 跟踪进度、交换交接笔记
- 全部在同一 Core Runtime 内完成，无需独立编排层

### 2. 插件系统（Plugin System）
- 注册工具（Tools）
- 观察生命周期事件（Lifecycle Events）
- 添加业务规则（Rules）
- 塑造 Agent 视野（Shape what agent sees）
- 插件可添加领域特定行为而无需 fork 主代码库

### 3. 原生内置能力
| 功能 | 说明 |
|------|------|
| **Scheduled CRON Jobs** | 定时任务，原生支持 |
| **Checkpointing** | 检查点机制 |
| **Web Search** | 网页搜索能力 |
| **MCP Connectors** | Model Context Protocol 连接器 |

### 4. 连接器通道（Connector Channels）
通过 `cline connect` 配置向导，Agent 可直接接入：

- Telegram
- WhatsApp
- Slack
- 其他平台

### 5. CLI 新功能（Cline CLI 2.0）
- 全新 TUI（Text User Interface）
- Agent Teams 支持
- Scheduled Jobs
- Connectors
```bash

# 安装 CLI
npm i -g cline

# 安装 SDK
npm i @cline/sdk

# 添加 Cline SDK Skill
npx skills add cline/sdk-skill
```

## 性能基准
| 测试环境 | Cline CLI | Claude Code | 差异 |
|----------|-----------|-------------|------|
| Terminal Bench 2.0 (claude-opus-4.7) | **74.2%** | 69.4% | +4.8% |
| Open-weight 模型 (kimi-k2.6) | **55.1%** | OpenCode: 37.1% | +18% |
> [!info]
> Cline CLI 在两项基准测试中均显著领先，尤其在开源模型上优势明显。

## 产品背景
**Cline** 是 AI 编码工具领域的竞争者，与 GitHub Copilot 和 Cursor 竞争 ：
- **自称**：世界上第一个真正的 Agentic Coding Experience（2024年，在 Claude Code、Codex 之前）
- **用户规模**：服务超过 **700 万开发者**
- **产品线**：
  - Cline CLI 2.0（2026 年初发布）：Terminal-first 执行，Headless CI 支持
  - Cline Kanban：多 Agent 并行编排的视觉化层（基于 Git Repo）
- **SDK 定位**：所有既往 Cline Surface 现在都构建在同一共享开源基础之上，而非独立产物

## 开发者资源
- **SDK 文档**：[docs.cline.bot/sdk](https://docs.cline.bot/sdk)
- **npm 包**：`@cline/sdk`
- **Skill 包**：`cline/sdk-skill`
- **官方推文**：@cline (2026-05-13)

## 相关实体
- [Cline releases open-source agent runtime SDK](ch04/401-cline-releases-open-source-agent-runtime-sdk.md)
- [腾讯混元Hy3-preview发布](ch03/044-agent.md)
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch03/074-claude-code.md)
- [Codex /goal：长任务Agent的目标运行时](ch09/043-codex-goal.md)
- [基于Strands Agents SDK和Amazon Bedrock AgentCore构建商品详情图广告词审查Agent | 亚马逊AWS官方博客](ch03/044-agent.md)
- [CLI、MCP、API 选型：Agent 接入层决策指南](ch03/044-agent.md)

## 深度分析
### SDK 分层架构的设计哲学
Cline SDK 采用的四层分离架构（`@cline/shared` → `@cline/llms` → `@cline/agents` → `@cline/core`）反映了一个核心认知：**Agent 运行时中最容易变化的部分是 LLM Provider，最难变化的部分是 Agent Loop 逻辑**。通过把 Provider 抽象成独立层，切换模型只需要改配置而非重构代码 。
这个设计对行业的影响是：过去 build-once-run-anywhere 的 Agent SDK 往往在模型切换时面临重写风险，Cline 的方案把这种风险降到了配置层面。但这也意味着 Provider 层的抽象必须足够完整——一旦某个 Provider 的特性无法被抽象层覆盖，开发者还是会触碰 Agent Loop 代码 。

### Session 持久性与长程任务的意义
Session 跨 UI 重启存活、跨 Surface 迁移，是 Cline SDK 解决的核心产品问题之一。在此之前，CLI 工具的 session 通常绑定在进程生命周期内——进程结束，session 死亡；UI 重启，状态丢失 。
Cline 通过把 session 状态外置到 `@cline/core` 层实现了持久化。这带来了一个架构层面的变化：**Agent Loop 变成无状态、可复用的核心，而 runtime 负责管理状态**。这种有状态/无状态分离是现代 Agent 框架的共同趋势（如 LangGraph 的 state 管理、AutoGPT 的 persistence 层）。

### 基准测试的方法论问题
Terminal Bench 2.0 上 Cline CLI 以 74.2% 超越 Claude Code 的 69.4%，但这个数字需要审慎解读。基准测试的得分高度依赖测试场景与特定模型的匹配度——Cline 在 claude-opus-4.7 上领先，不代表在其他模型上也领先 。
更值得关注的是在开源模型（kimi-k2.6）上的对比：55.1% vs 37.1%（OpenCode），领先幅度达 18 个百分点。这个差距说明 Cline 的 agentic loop 实现对模型能力的利用效率在不同模型上有显著差异，开源模型尤其明显 。

### 插件系统的安全边界
Cline 的插件系统允许注册工具、观察生命周期事件、添加规则、塑造 Agent 视野。这个设计的能力强大，但安全边界也值得关注：插件可以"塑造 Agent 视野"——这意味着插件有能力影响 Agent 的决策上下文，甚至可能注入偏见或绕过安全限制 。
在企业场景中，这意味着引入第三方插件需要额外的安全审计机制。

## 实践启示
### 对 Agent SDK 开发者的建议
1. **优先设计 Provider 抽象层**：如果你的 SDK 需要支持多模型，首先定义清晰的 Provider 接口。接口设计决定了后续切换模型的摩擦成本 。
2. **Session 状态与管理分离**：采用 Cline 的思路——让 Agent Loop 保持无状态，把 session 生命周期管理交给独立的 runtime 层。这使得 Agent Loop 更易于测试和复用 。
3. **按需安装的包设计**：Cline 允许单独安装 `@cline/core`、`@cline/agents`、`@cline/llms`，这个设计值得借鉴。完整 SDK 的体积和复杂性对某些场景是过度设计 。

### 对企业集成团队的建议
1. **CLI-first 的 CI 集成路径**：Cline CLI 2.0 支持 headless CI，这是一个重要的场景。如果你的团队需要在自动化流程中调用编码 Agent，这是值得评估的选项 。
2. **Connector Channels 的平台扩展**：通过 `cline connect` 接入 Telegram、WhatsApp、Slack 等平台，是将 Agent 能力延伸到聊天界面的轻量方案。对内部工具开发有参考价值 。
3. **Plugin 安全审计**：如果企业使用第三方插件，建立强制审计机制。插件对 Agent 视野的塑造能力需要被纳入安全边界评估 。

### 对 Agent 评测设计者的建议
1. **多模型基准测试**：单一模型上的基准对比不足以说明 SDK 优劣。设计评测时要覆盖闭源/开源多种模型，尤其要关注模型能力与 SDK 设计的交互效应 。
2. **长程任务的可恢复性测试**：测试 Session 跨进程存活、跨 Surface 迁移的能力，这是评估 SDK 持久化设计的核心场景 。
3. **插件系统的压力测试**：通过恶意或异常插件测试 SDK 的隔离机制和错误处理能力 。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cline-open-source-agent-runtime-sdk.md)

---

