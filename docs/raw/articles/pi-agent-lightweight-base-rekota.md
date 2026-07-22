---
title: "个人开发 Agent，为什么我建议先看 Pi？"
source_url: "https://www.xiaohongshu.com/explore/6a12a463000000003502ff9e"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, pi, agent, open-source, gondolin, security]
ingested: 2026-07-02
sha256: c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4
---

# 个人开发 Agent，为什么我建议先看 Pi？

Pi 是一个开源 Agent 项目，定位是轻量级 Agent 底座，适合个人开发者和想研究 Agent 原理的人。

## Pi 的核心架构

Pi 的核心 = LLM + 工具 + 循环

组件拆解：
- **模型适配** — 支持多种 LLM
- **工具调用** — Read / Write / Edit / Bash（默认工具很克制）
- **上下文处理** — 清晰的上下文管理机制
- **事件循环** — 驱动 Agent 的 main loop
- **终端交互** — CLI interface
- **安全执行** — 权限控制和沙箱隔离

## 为什么 Pi 适合作为起点

- 不是大而全的 Agent 框架
- 也不是全部封装好的黑盒产品
- 拆得比较清楚，方便二次开发
- 工具少反而便于权限控制

## Gondolin：微虚拟机沙箱

Pi 生态里的 Gondolin 用微虚拟机把执行环境隔离起来，避免 Agent 直接污染宿主机。这是安全执行的关键组件。
