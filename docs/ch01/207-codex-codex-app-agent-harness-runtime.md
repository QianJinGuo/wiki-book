# 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime ！

## Ch01.207 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime ！

> 📊 Level ⭐ | 2.2KB | `entities/万字详解-codex-全链路架构codex-不是一个-app而是一套-agent-harness-runtime.md`

# 万字详解 codex 全链路架构：Codex 不是一个 App，而是一套 Agent Harness Runtime ！

**来源**: 科技充电站

**发布日期**: 2026-05-23

**原文链接**: https://mp.weixin.qq.com/s/gjxhwjKMZfztSo5ZclNsfA

---

嗨，大家好，我是行小招。

我以前看 Codex，体感上很容易把它理解成一个更强的 CLI，或者一个带 GUI 的代码助手，但把这三份资料和 OpenAI 官方 App Server 文档放在一起看完后，我的判断变了：Codex 真正要做的不是某一个端，而是一套围绕 agent runtime 展开的多端系统。

这句话挺关键。因为只看 Codex App，你会觉得它是一个桌面工作台。只看 Codex CLI，你会觉得它是终端里的 coding agent，只看 Web，你又会觉得它是云端 PR 工厂。

但这些表面后面，其实有一条共同的主线：同一个 Codex harness，同一套 thread / turn / item 抽象，同一个 app-server 协议面，再叠上不同端的交互方式。

说白了，Codex 最值得看的地方，不是它又多了一个 App，而是 OpenAI 正在把 coding agent 做成一个可嵌入、可远控、可审计、可扩展的运行时。

## Codex 现在不是一个端，而是一组端

先把 Codex 的产品形态拆开看：

端
主要用途
更像什么

Codex Web / Cloud
云端并行任务、GitHub PR、后台 code review
OpenAI 托管的 agent runner

Codex App
桌面 command center，多线程、多 worktree、多项目
本地 agent 工作台

Codex CLI / TUI
终端交互、本地代码修改、命令执行
面向工程师的原生入口

Codex IDE Extension
VS Code、Cursor、Windsurf 等 IDE 内协作
编辑器里的 agent 面板

Codex Exec
CI、脚本化、一次性任务
自动化命令入口

Codex SDK
程序化控制 Codex
给业务系统接入的开发包

Codex MCP Server
把

---

