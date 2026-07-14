# 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime

## Ch01.1216 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime

> 📊 Level ⭐⭐⭐ | 10.4KB | `entities/万字详解-codex-全链路架构codex-不是一个-app而是一套-agent-harness-runtime.md`

# 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime

OpenAI 的 Codex 已从单一 CLI 工具演进为一套围绕 agent runtime 展开的多端系统——涵盖 Web/Cloud、桌面 App、CLI、IDE 扩展、Exec、SDK、MCP Server 及 GitHub Action 等八个端，全部由同一套 Codex harness 驱动。其核心架构分为四层：客户端表面、协议与集成层、本地 runtime、OpenAI 后端与云端环境。

## 核心要点

- **多端统一 harness**：Codex 所有端由同一个 Codex harness 驱动，使用同一套 thread/turn/item 抽象和同一个 app-server 协议面。
- **App Server 是关键底座**：它不是一个传统业务后端，而是一个本地 agent runtime 的控制接口，通过 JSON-RPC event stream 将客户端请求翻译成 Codex Core 内部操作。
- **三层会话模型**：Thread（可持久化的会话）、Turn（一次用户输入触发的完整任务）、Item（最小事件单元：agent message、plan delta、command output、file patch 等）。
- **三档沙箱体系**：read-only（只读探索）、workspace-write（工作区可写、外部资源受限）、danger-full-access（不隔离），支持不同任务分配不同权限边界。
- **多端集成策略**：MVP 用 `codex exec`，富交互场景用 App Server，单纯做工具用 MCP Server。

## Codex 产品形态全景

Codex 的产品形态可拆解为八个端，各自针对不同使用场景：

| 端 | 主要用途 | 定位 |
|------|---------|------|
| Codex Web / Cloud | 云端并行任务、GitHub PR、后台 code review | OpenAI 托管的 agent runner |
| Codex App | 桌面 command center，多线程、多 worktree、多项目 | 本地 agent 工作台 |
| Codex CLI / TUI | 终端交互、本地代码修改、命令执行 | 面向工程师的原生入口 |
| Codex IDE Extension | VS Code、Cursor、Windsurf 等 IDE 内协作 | 编辑器里的 agent 面板 |
| Codex Exec | CI、脚本化、一次性任务 | 自动化命令入口 |
| Codex SDK | 程序化控制 Codex | 给业务系统接入的开发包 |
| Codex MCP Server | 把 Codex 暴露给其他 agent harness | 可调用的 coding tool |
| GitHub Action | 在 CI 里跑 Codex | 把 Codex 接进流水线 |

## App Server：关键底座

App Server 是 Codex 架构中最关键但也最容易误解的组件。它不是传统 HTTP API 后端——客户端通过 JSON-RPC 发起 thread、turn、approval、工具调用，App Server 再将这些请求翻译成 Codex Core 能理解的内部操作。

OpenAI 的工程文章将 App Server 进程拆成四块：
1. **stdio reader**：读取客户端输入
2. **Codex message processor**：处理协议消息
3. **thread manager**：管理会话生命周期
4. **core threads**：执行实际 agent 任务

客户端不直接操作 Rust Core——客户端只说"start thread""resume""approve""interrupt"，App Server 负责翻译。监听方式支持 `stdio://`、`unix://`、`ws://IP:PORT` 和 `off`，说明 App Server 正在变成 Codex 多端统一协议面。

## 三层会话模型

Codex 把会话拆成三个 primitive，以支持富客户端体验：

### Thread（线程）
可持久化的 Codex 会话，支持 resume、fork、archive，客户端断线后可重新接上。

### Turn（轮次）
一次用户输入触发的完整任务，内部包含推理、计划、搜索、读文件、跑命令、改代码、申请用户确认等多步操作。

### Item（事件项）
最小事件单元——可以是 agent message、plan delta、command execution output、file patch、MCP tool call、approval request 等。客户端通过 event stream 持续接收 items，实现实时渲染进度、diff、执行日志。

这一抽象确保富客户端不只拿到"最终答案"，而是能够感知每一步的执行状态。Codex Web 的 worker 在容器里启动 App Server binary，浏览器通过 Codex backend 的 HTTP/SSE 看事件——即使网页关掉，任务还能继续跑。

## 沙箱与权限体系

Codex 定义了三档沙箱模式，对应不同使用场景：

| 沙箱模式 | 含义 | 适用场景 |
|---------|------|---------|
| `read-only` | 只读探索，不改文件 | review、理解代码、风险分析 |
| `workspace-write` | 工作区可写，外部资源受限 | 日常开发、测试修复 |
| `danger-full-access` | 不隔离 | 外部已有容器保护的 CI |

这一体系的核心设计理念是给不同任务分配不同边界——Codex 的使用姿势不是"让 AI 随便跑"，而是在可控制的范围内赋予适当的权限。

## 多端集成策略

Codex 的集成能力呈现明显的用途-成本权衡：

- **`codex exec --json`**：适合 CI、脚本、一次性自动化。代价低，会话控制能力有限，但能跑通、能回滚、能进 CI。
- **`codex app-server`**：适合富客户端、IDE、桌面 App、远程控制台。功能完整但需要处理 JSON-RPC 绑定。
- **`codex mcp-server`**：适合已有 MCP workflow 只想把 Codex 当工具的场景。会损失一些独特的 thread/diff/approval 语义。
- **TypeScript SDK**：适合 Node 服务里程序化控制 Codex，底层仍是 spawn CLI + JSONL。

推荐模式：MVP 先用 exec，确认业务价值后再迁移到 app-server 实现富交互。

## 深度分析

### 1. "端是入口，Harness 才是身体"——多端统一架构的战略意义

Codex 最值得分析的并非其前端功能，而是其"多端共享同一 harness"的架构决策。这一决策意味着：所有端的改进都沉淀在底层 harness 层，任一端的创新自动惠及其他端。对比竞品（如 Claude Code 以 CLI 为主、Cursor 以 IDE 为主），Codex 的"多端统一"架构使其天然更适合嵌入企业工作流的不同环节——工程师在终端用 CLI，管理者在 Web 看任务状态，CI 流程通过 exec 调用，业务系统通过 SDK 集成。

### 2. App Server 协议面的设计哲学：从"聊天 API"到"任务运行时"

Chat API 的范式是"请求→响应"，而 App Server 的范式是"订阅运行现场"。这一转变反映了 AI 代理从"对话系统"到"工程系统"的定位变化。App Server 协议面当前包含的能力（thread 生命周期、turn 控制、item 流、命令执行、文件操作、审批流、MCP 管理、远程控制）已经远超传统聊天 API 的范围，更接近一个操作系统的进程管理 API。这种"AI 代理即服务"的模式可能是企业级 AI 集成的未来形态。

### 3. 沙箱设计："权限分层"而非"权限开关"

Codex 的三档沙箱体现了精细化的权限设计哲学——不是简单的"有/无"权限，而是根据任务类型（只读分析、日常开发、完全控制）提供不同的边界。这种"权限分层"思路比二元模型更适合企业场景：代码审计走 read-only，开发任务走 workspace-write，CI 环境走 full-access。每一档都有清晰的使用范围和约束条件。

### 4. "Codex 不是写代码的工具，而是代码 agent 的 runtime"的深远影响

文章的核心判断——"Codex 真正要做的不是某一个端，而是一套围绕 agent runtime 展开的多端系统"——揭示了 OpenAI 在 coding agent 领域的战略定位。如果这一判断成立，那么 Codex 的长期竞品不是 Copilot 或 Claude Code，而是操作系统级别的 agent runtime 平台。就像 Windows/Mac/Linux 提供了应用运行的基础设施，Codex 旨在成为 AI agent 运行的基础设施——管理进程、文件、权限、会话、状态和通信。

### 5. 状态管理是企业集成的关键挑战

文章特别指出 Codex 不是无状态工具——`CODEX_HOME` 中包含 config、auth、sessions、history、logs、sqlite 状态。这对企业集成非常关键：不能让所有业务 agent 共享同一个全局 `~/.codex`，否则登录态、配置、历史、插件全混在一起，排查会很困难。建议做法是每个业务 runtime 给独立 `CODEX_HOME`，每个项目有自己的 AGENTS.md，每类任务有自己的 sandbox 和 approval policy。

## 实践启示

1. **评估 AI 编码工具时关注"底层运行时"而非"表层功能"**：工具提供的 CLI/IDE/Web 界面只是入口，真正决定长期价值的是一套统一的底层运行时（harness）——它决定了工具的可嵌入性、可审计性和可扩展性。

2. **沙箱与权限体系决定 AI 代理能否进入生产环境**：一个没有完善沙箱设计的 AI Coding 工具无法通过企业安全审查。在选型时，read-only 分析和写权限分离是最低要求。

3. **"先 exec 跑 MVP，再 app-server 做深度集成"是务实路径**：不需要一开始就搭建完整的 App Server 集成。用 `codex exec --json` 快速验证业务价值，确认后再投入资源做深度的 app-server 集成。

4. **企业部署需注意状态隔离**：如果计划在多个业务场景中使用 Codex，务必为每个场景配置独立的 `CODEX_HOME` 和工作目录，避免状态污染。

5. **MCP 集成有功能取舍**：如果通过 MCP 集成 Codex，需意识到会在 thread/diff/approval 等独特语义上有所损失。对于需要完整 agent 体验的场景，app-server 集成更合适。

> 参考资料：OpenAI Codex App Server 工程文章、Codex CLI 文档、Codex SDK 文档、Codex 官网

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/万字详解-codex-全链路架构codex-不是一个-app而是一套-agent-harness-runtime.md)

---

