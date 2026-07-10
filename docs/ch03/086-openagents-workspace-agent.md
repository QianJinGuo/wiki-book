# OpenAgents Workspace：多 Agent 协作平台

## Ch03.086 OpenAgents Workspace：多 Agent 协作平台

> 📊 Level ⭐⭐ | 8.6KB | `entities/openagents-workspace-multi-agent-collaboration-itech.md`

# OpenAgents Workspace：多 Agent 协作平台

## 摘要

OpenAgents（3.3k Star, Apache 2.0）定位不是 Agent 框架，而是 **多 Agent 协作平台**——解决多个编码 Agent（Claude Code、Codex CLI、Cursor 等）之间上下文隔离、只能手动复制粘贴的问题。它由三个核心组件构成：Workspace（浏览器端协作空间）、Launcher（统一管理编码 Agent 的终端仪表盘）和 Network SDK（开发者扩展层）。OpenAgents 的独特价值在于跨 Agent 协作、共享浏览器、Tunnels 暴露本地服务等能力，以及不绑定供应商的开源架构。

## 核心要点

### 1. 问题定义：Agent 孤岛

当前 AI Agent 生态的核心痛点是**上下文隔离**：

- Claude Code 在终端 A 跑，Codex CLI 在终端 B，Cursor 在编辑器里
- 一个用户报告了 Bug，需要营销 Bot 收集信息、基础设施 Agent 看日志
- 当前的做法是手动复制粘贴、SSH 切换机器、自己拼上下文
- 每次在 Agent 之间传递上下文，都是人工操作，效率低下且容易出错

这个问题的本质是：**Agent 框架解决了"如何造 Agent"，但没有解决"如何让 Agent 一起工作"**。

### 2. 三大核心组件

**Workspace：Agent 版 Slack**

浏览器端协作空间，所有 Agent 共享：

| 能力 | 描述 | 实现 |
|------|------|------|
| 共享线程 | @mention 任何 Agent，它在同一个对话里能看到其他 Agent 的输出 | 类似 Slack 的消息模型 |
| 共享文件 | Agent 上传的代码、文档、报告，所有人和 Agent 都能读写 | 持久化文件系统 |
| 共享浏览器 | Agent 可以打开网页、点击元素、截图，Workspace 里所有人都能看到 | 内嵌浏览器实例 |
| 持久地址 | 每个 Workspace 有固定 URL，如 `workspace.openagents.org/abc123` | 无需安装即可访问 |

不需要安装任何东西就能查看 Workspace，浏览器打开就行。

**Launcher（`agn` CLI）**

终端仪表盘，统一管理所有编码 Agent：

```bash
agn install openclaw                      # install a runtime
agn create my-agent --type openclaw       # create an instance
agn env openclaw --set LLM_API_KEY=sk-... # set credentials
agn up                                    # start the daemon
```

支持的 Agent 列表：

| Agent | 状态 |
|-------|------|
| OpenClaw | ✅ 已支持 |
| Claude Code | ✅ 已支持 |
| Codex CLI | ✅ 已支持 |
| Hermes Agent | ✅ 已支持 |
| Cursor | ✅ 已支持 |
| OpenCode | ✅ 已支持 |
| Aider, Goose, Gemini CLI, Copilot, Amp | 🔜 即将支持 |

安装方式：`curl -fsSL https://openagents.org/install.sh | bash`，也有 macOS/Windows/Linux 桌面客户端。

**Network SDK**

面向想自定义协作模式的开发者：

- **事件驱动架构**：基于事件的松耦合通信模型
- **Mod 系统**：可扩展的模块化设计，支持消息、文件、浏览器、游戏等模态
- **MCP 和 A2A 协议支持**：与现有 Agent 协议生态兼容
- **自托管**：可以部署在自己的基础设施上

### 3. 差异化定位

| 对比对象 | 区别 | 本质差异 |
|----------|------|----------|
| LangChain/AutoGen/CrewAI | 那些是造 Agent 的 SDK；OpenAgents 是管 Agent 协作的平台 | 造 vs 管 |
| OpenAI Swarm/Anthropic Agent | Swarm 等是代码层面的通信模式；OpenAgents 有 Web UI 可视化协作空间 | 代码 vs 产品 |
| ChatGPT/Claude 多模型对话 | 封闭生态 vs 开源、任何 Agent 可接入、不绑定供应商 | 封闭 vs 开放 |

独特能力：
1. **跨 Agent 协作**：Claude Code 和 Codex 可以在同一个线程里工作
2. **共享浏览器**：在其他平台几乎没见过，Agent 能操作网页并共享画面
3. **Tunnels 功能**：一条命令把本地开发服务器暴露为公网 URL
4. **无账号要求**：不需要注册，开源免费使用

## 深度分析

### 架构设计理念

OpenAgents 的架构遵循了"平台 vs 工具"的设计哲学：

- **不造 Agent**：OpenAgents 不关心 Agent 怎么造，只负责让造好的 Agent 之间协作
- **协议优先**：通过 MCP 和 A2A 协议接入现有 Agent 生态，而非重新发明轮子
- **浏览器优先**：Workspace 的核心交互界面是浏览器，降低了使用门槛
- **开源优先**：Apache 2.0 许可证，社区驱动，不绑定任何供应商

这种设计理念与 [Code As Agent Harness Survey](../ch09/052-code-as-agent-harness.html) 中描述的 Agent Harness 模式高度契合——OpenAgents 本质上是一个"协作层 Harness"。^[inferred]

### 共享浏览器的技术挑战

共享浏览器是 OpenAgents 最独特的功能之一，但也是技术上最具挑战性的：

- **状态同步**：多个 Agent 同时操作同一页面时，需要解决冲突和一致性问题
- **性能开销**：浏览器实例的资源消耗（CPU、内存、网络）需要精细管理
- **安全边界**：Agent 操作浏览器时，需要防止跨域攻击和数据泄露
- **延迟敏感**：共享画面的实时性要求高，网络延迟直接影响用户体验

这些挑战的解决程度将决定 OpenAgents 在实际场景中的可用性。^[inferred]

### 与 [Hermes Agent V014 Architecture Shugex](ch03/090-hermes-agent.html) 的关系

Hermes Agent 已经在 OpenAgents 的支持列表中。这意味着 Hermes Agent 用户可以通过 OpenAgents Workspace 与其他 Agent（如 Claude Code、Codex CLI）进行协作。这种互操作性对于 Agent 生态的健康发展至关重要。^[inferred]

### 与 [Building Web Search Enabled Agents With Strands And Exa](../ch04/427-building-web-search-enabled-agents-with-strands-and-exa.html) 的互补

Web Search Agent 可以通过 OpenAgents 的 Mod 系统接入 Workspace，将搜索能力作为共享资源提供给其他 Agent。这种模式下，一个 Agent 专注于搜索，其他 Agent 专注于编码或分析，各司其职。^[inferred]

### Launch Partners 的中国生态

OpenAgents 的 Launch Partners 包括 Z.AI（智谱）、FastGPT、MiniMax 等中国厂商。这表明 OpenAgents 正在中国市场积极布局，对于国内开发者而言，使用门槛较低。

## 局限与风险

- **早期阶段**：v0.7.1 版本，API 可能不稳定，生产环境使用需谨慎
- **共享浏览器性能**：实际性能和延迟还有待验证，特别是多 Agent 同时操作时
- **场景覆盖有限**：目前主要面向编码场景，通用 Agent 协作场景覆盖有限
- **社区成熟度**：3.3k Star 说明有关注度，但长期维护和社区活跃度仍需观察
- **标准化风险**：MCP 和 A2A 协议仍在演进中，协议变更可能影响兼容性

## 实践启示

1. **快速体验**：`curl -fsSL https://openagents.org/install.sh | bash` 即可开始，或直接访问 `workspace.openagents.org`
2. **从编码场景切入**：如果同时使用 Claude Code 和 Codex CLI，OpenAgents 是最直接的协作方案
3. **关注 Hermes Agent 集成**：Hermes Agent 已在支持列表中，可以通过 `agn` CLI 管理
4. **评估共享浏览器**：对于需要 Agent 协作操作网页的场景，共享浏览器是独特价值
5. **保持关注但不激进**：项目仍在早期，建议在非关键工作流中试用

## 相关实体

- [Code As Agent Harness Survey](../ch09/052-code-as-agent-harness.html)
- [Hermes Agent V014 Architecture Shugex](ch03/090-hermes-agent.html)
- [Building Web Search Enabled Agents With Strands And Exa](../ch04/427-building-web-search-enabled-agents-with-strands-and-exa.html)
- [Claude Code Large Codebase Harness Configuration](ch03/075-claude-code.html)
- [Ai Techliwen Creaoai Cloud Agent Infrastructure Two Lessons 20260606](ch03/045-agent.html)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openagents-workspace-multi-agent-collaboration-itech.md)

---

