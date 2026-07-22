---
title: "pi mono github"
source_url: https://github.com/badlogic/pi-mono
ingested: 2026-05-01
sha256: d3dfc4ad8b3fda50cdbc3fbd3d64a04f3790321d766ec953763865e018b4586e
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [github]
---
# pi-mono — AI agent toolkit
> GitHub: https://github.com/badlogic/pi-mono
> Author: Mario Zechner (badlogicgames)
> Stars: 43.3k | Forks: 5.1k | Commits: 3,900 | Tags: 263
> License: MIT
pi-mono 是一个 npm workspace monorepo 的 TypeScript 项目，提供构建 AI Agent 的工具链。OpenClaw 的 Agent 执行引擎几乎全部构建在 pi-mono 之上。
## Core Packages
### @mariozechner/pi-ai — 统一多提供商 LLM API
20+ 提供商抽象（OpenAI/Anthropic/Google/DeepSeek/xAI/Groq/Mistral/OpenRouter 等）。核心特性：
- 事件流架构（stream/complete/streamSimple/completeSimple 四接口）
- 标准化事件：start/text_start/text_delta/text_end/thinking_start/thinking_delta/thinking_end/toolcall_start/toolcall_delta/toolcall_end/done/error
- TypeBox schema 工具定义 + 编译时类型安全 + 运行时验证
- 流式工具调用部分 JSON 实时解析
- Thinking/Reasoning 统一接口（支持 OpenAI/Anthropic/Google 不同实现）
- 跨提供商会话切换（自动转换 thinking 块为 `<thinking>` 标签）
- Context 可 JSON.stringify 序列化
- 浏览器兼容 + 自定义模型端点（Ollama/vLLM/LiteLLM）
- OAuth 支持（Anthropic/OpenAI Codex/GitHub Copilot）
- Faux test provider 用于确定性测试
### @mariozechner/pi-agent-core — 有状态 Agent 运行时
Agent 事件循环：transformContext→convertToLlm→stream→tool_execution→turn 循环。支持：
- beforeToolCall/afterToolCall Hook（权限检查/阻断/终止）
- parallel 或 sequential 工具执行模式
- Steering 和 FollowUp 模式
- 动态 API Key 解析（OAuth token 过期刷新）
- 自定义 streamFn 代理后端
### @mariozechner/pi-coding-agent — 交互式编码 CLI
pi 命令行工具，交互式编码环境，终端直接写代码/执行命令。
### @mariozechner/pi-tui — 终端 UI 库
差分渲染终端界面。
### @mariozechner/pi-web-ui — Web 聊天界面组件
AI 聊天界面 Web 组件。
## 关键设计决策
1. 注册表+事件流 vs LangChain 的抽象基类+工厂模式
2. TypeScript 编译时类型安全 vs 运行时类型检查
3. 低层包可独立使用（pi-ai 可不依赖其他包）
4. 只支持 tool calling 的模型（排除纯聊天模型）
5. 公共 OSS 会话分享机制（通过 HuggingFace 发布 session 数据）