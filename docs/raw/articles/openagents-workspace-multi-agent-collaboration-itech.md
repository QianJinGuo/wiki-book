---
title: "OpenAgents Workspace：让 Claude Code 和 Codex 在同一个群里干活"
source_url: "https://www.cnblogs.com/itech/p/19889215"
author: "iTech (博客园)"
published: 2026-06-28
ingested: 2026-06-28
language: zh
type: raw
sha256: "eb0dc70f14f096d7b6c7805bb214af0212fa73366092a5a90f60fd973a217ed0"
---

# OpenAgents Workspace：让 Claude Code 和 Codex 在同一个群里干活

我用 Claude Code 写代码，用 Codex 做代码审查，用 Cursor 调试前端——它们各自很强，但彼此完全隔离。每次要在 Agent 之间传递上下文，只能复制粘贴。OpenAgents 想解决的就是这个问题：一个 Workspace，所有 Agent 共享同一个上下文协同工作。

这个项目 3.3k Star，Apache 2.0 开源，最近刚发了 Launch Week。

## OpenAgents 到底是什么

先说结论：OpenAgents 不是一个 Agent 框架。

LangChain、AutoGen、CrewAI 这些是帮你构建 Agent 的 SDK。OpenAgents 不关心你怎么造 Agent——它关心的是 Agent 造出来之后，怎么让它们一起干活。

想想你现在的痛点：Claude Code 在终端 A 跑，Codex CLI 在终端 B，Cursor 在编辑器里。一个用户报告了 Bug，你想让营销 Bot 收集信息，再拉基础设施 Agent 看日志。今天的做法是手动复制粘贴、SSH 切换机器、自己拼上下文。

OpenAgents 的方案很简单——给所有 Agent 一个共享的 Workspace，类似 Slack，但是给 Agent 用的。

## 三大核心组件

### Workspace：Agent 版 Slack

Workspace 是一个浏览器端的协作空间，所有 Agent 共享：

- 共享线程：@mention 任何 Agent，它在同一个对话里能看到其他 Agent 的输出
- 共享文件：Agent 上传的代码、文档、报告，所有人和 Agent 都能读写
- 共享浏览器：Agent 可以打开网页、点击元素、截图，Workspace 里所有人都能看到
- 持久地址：每个 Workspace 有固定 URL，比如 workspace.openagents.org/abc123，随时回来

不需要安装任何东西就能查看 Workspace，浏览器打开就行。

### Launcher：Agent 管理器

Launcher（命令 agn）是一个终端仪表盘，统一管理所有编码 Agent：

```
agn install openclaw                      # install a runtime
agn create my-agent --type openclaw       # create an instance
agn env openclaw --set LLM_API_KEY=sk-... # set credentials
agn up                                    # start the daemon
```

支持的 Agent 列表相当全面：

| Agent | 状态 |
|-------|------|
| OpenClaw | 已支持 |
| Claude Code | 已支持 |
| Codex CLI | 已支持 |
| Hermes Agent | 已支持 |
| Cursor | 已支持 |
| OpenCode | 已支持 |
| Aider, Goose, Gemini CLI, Copilot, Amp | 即将支持 |

安装方式也很方便，macOS/Linux 一行命令：

```
curl -fsSL https://openagents.org/install.sh | bash
```

也有桌面客户端，macOS、Windows、Linux 都支持。

### Network SDK：开发者扩展层

SDK 层面向想自定义协作模式的开发者：

- 事件驱动架构
- Mod 系统（消息、文件、浏览器、游戏）
- 支持 MCP 和 A2A 协议
- 可以自托管网络

## 跟其他 Agent 平台有什么不同

这才是关键。我对比了目前主流的几个方向：

**vs LangChain / AutoGen / CrewAI（Agent 框架）**

这些是 SDK，帮你搭建单个 Agent 的逻辑。OpenAgents 不管你用什么框架造 Agent，它只负责让造好的 Agent 之间协作。属于不同层面的东西——前者是造Agent 的工具，后者是管 Agent 的平台。

**vs OpenAI Swarm / Anthropic Agent 模式（协作模式）**

Swarm 和 Anthropic 的 Multi-Agent 模式提供了 Agent 间通信的设计模式（handoff、orchestrator 等），但它们跑在代码层面，没有可视化的协作空间。OpenAgents 的 Workspace 提供了一个 Web UI，人和 Agent 在同一个界面里交互。

**vs ChatGPT / Claude 的多模型对话**

ChatGPT 的 GPT Store 和 Claude 的 Project 都是封闭生态，Agent 只能在自家平台里工作。OpenAgents 是开源的，任何 Agent 都能接入，而且 Workspace 地址是公开 URL，不绑定任何供应商。

几个独特的地方总结：

1. 跨 Agent 协作：Claude Code 和 Codex 可以在同一个线程里工作
2. 共享浏览器：这个在其他平台几乎没见过，Agent 能操作网页并共享画面
3. Tunnels 功能：一条命令把本地开发服务器暴露为公网 URL，从任何设备预览 Agent 构建的东西
4. 无账号要求：不需要注册，开源免费使用

## 快速上手体验

最简单的体验方式：

```bash
# 安装
curl -fsSL https://openagents.org/install.sh | bash

# 打开交互式仪表盘
agn

# 安装一个 Agent runtime
agn install openclaw

# 创建实例
agn create my-agent --type openclaw

# 设置 API Key
agn env openclaw --set LLM_API_KEY=sk-...

# 启动后台守护进程
agn up
```

或者直接访问 workspace.openagents.org，在线体验 Workspace，不需要安装。

项目地址：github.com/openagents-org/openagents

## 值不值得关注

说几个我关注这个项目的理由：

**值得关注的点：**

- 解决了一个真实痛点——多 Agent 协作的上下文共享
- 跨平台跨 Agent 的设计思路，不绑定特定 LLM 或供应商
- 3.3k Star，Apache 2.0 开源，社区活跃（1,978 commits）
- 支持 MCP 和 A2A 协议，跟现有生态兼容
- Launch Partners 里有 Z.AI（智谱）、FastGPT、MiniMax 等中国厂商

**需要注意的点：**

- 项目还在快速迭代期（v0.7.1），API 可能不稳定
- 共享浏览器的实际性能和延迟还有待验证
- 目前主要面向编码场景，通用 Agent 协作场景覆盖有限

如果你同时在用好几个 AI Agent 干活，OpenAgents Workspace 值得试试。至少能把那些乱七八糟的终端窗口整合到一个地方。
