---
source_url: https://mp.weixin.qq.com/s/dgqL9hCrTrxEVIUBylVaJA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "1.6万 Star，AI Agent 赛道又杀出一匹黑马！"
author: 丛林
publication: 极客之家
date: 2026-05-19
platform: wechat
sha256: e9b3e8c2f1a4d6b8e0c2f4a6b8e0c2f4a6b8e0c2f4a6b8e0c2f4a6b8e0c2f4a6
---
# 1.6万 Star，AI Agent 赛道又杀出一匹黑马！
用 Claude Code 干活，有个反复出现的摩擦点：每次开一个新对话，都要重新介绍一遍自己在做什么。"我在用 Rust 写一个异步任务调度服务"，"这个项目上周刚从 tokio 0.2 迁移过来"，"你上次建议我用这个方案的"……
说实话每次打这些东西，我都想骂人。Codex 也是这样，Cursor 也是这样，Gemini 2.5 Pro 也逃不掉——不是模型的错，是所有这些工具生来就是无状态的，你一关窗口，上下文就消失了。
OpenHuman 这个开源项目就是冲着这个缺口去的，开源短时间内收获1.6万 Star，AI Agent又一匹黑马诞生。
## 它是什么，一句话先讲清楚
GitHub 描述写的是 "Your Personal AI super intelligence. Private, Simple and extremely powerful."。听起来像是产品页面的广告词，但我看完实现细节之后，觉得这话没夸大。
OpenHuman 是一个桌面端 AI Agent 框架，用 Rust + Tauri 写的，走 GNU GPL-3 协议开源。它的定位不是聊天机器人，更接近一个「常驻助手」：它在你电脑上跑着，主动去拉取你的数字生活数据，把这些东西整理成它自己的记忆库，然后你跟它对话的时候，它已经知道你是谁、在做什么、上周碰到了什么问题。
## 怎么做 AI 记忆
我有时候觉得，把 AI 记忆做对这件事比训练大模型本身还难。难在哪儿？难在怎么存、存什么、存完之后怎么检索用上。
OpenHuman 的解法叫 **Memory Tree**。
流程是这样的：你把 Gmail、Slack、GitHub、Notion 这些服务接进来之后，系统每 20 分钟自动把最新数据拉一次，过一条处理管道：先转成规范化的 Markdown 格式，再切成不超过 3000 token 的块，打分，最后折叠进层级化的摘要树里。整个东西存在你本地的 SQLite 数据库里，不会上传到任何服务器。
还有一个细节做的很好：这些 Markdown 文件会同步成一个 Obsidian 兼容的 vault。就是说你可以直接打开 Obsidian，翻看 AI 到底「知道」你什么。这个灵感来自 Andrej Karpathy 的 obsidian-wiki 工作流——对，就是那个前 OpenAI 联合创始人写的那套东西。
官方文档有一句话我觉得说得挺直接：
> OpenHuman 把你连接的所有文档、邮件和聊天记录都摘要压缩，生成一个让 Agent 能记住你一切的记忆图谱。
一次同步完成之后，Agent 就有了你的收件箱、日历、代码仓库、文档、消息记录的完整压缩上下文。不需要训练期，不需要「先用几周再说」。
## 118+ 个集成，用 OAuth，不用 API Key
很多 Agent 框架也号称支持接各种服务，但实际体验下来，往往是「你自己去申请 API Key，填进配置文件，自己处理鉴权失败」。对普通用户来说，这就是一道墙。
OpenHuman 走的是 OAuth 一键授权。你在设置界面点一下授权 Gmail，弹出 OAuth 窗口，确认一下，完事儿。它现在支持的服务包括 Gmail、Notion、GitHub、Slack、Stripe、Google Calendar、Google Drive、Linear、Jira，数字目前停在 118+，还在涨。
每个接入的服务都被封装成一个「类型化工具」暴露给 Agent。每 20 分钟 auto-fetch 一次，把新数据折进 Memory Tree。所以你早上打开电脑问它「昨天有什么重要的 GitHub PR 评论」，它不需要临时去查，因为昨晚它已经拉过了。
顺着这个再说一句：如果你已经在 Claude Code 或者 Codex 里用了 agentmemory 这个项目（rohitg00 做的那个），OpenHuman 支持接它作为 memory 后端——在 config.toml 里设置 memory.backend = "agentmemory"，然后 Claude Code、Cursor、Codex、OpenHuman 就可以共享同一个持久化记忆存储。这个设计的方向我觉得是对的，「跨工具统一记忆」，而不是每个工具各搞一套。
## TokenJuice
这是一个很低调但很关键的设计
这个功能在文档里不算显眼，但我觉得它可能是整个项目里工程品位最高的一块。
问题是这样的：你接入了 Gmail，同步了半年的邮件，拿去喂大模型，光 token 费用就能把你喂穷。一个 600 条消息的邮件线程，一次 git status 的输出，一份 cargo build 日志……这些东西扔进上下文里，大量 token 都是纯噪声。
OpenHuman 在工具调用结果进模型之前，先过一层叫 **TokenJuice** 的压缩管道。处理策略包括：HTML 转 Markdown，长 URL 缩短，重复行去重，啰嗦的工具输出摘要化。针对 git、npm、cargo、docker、kubectl 这些命令各有预设规则，规则文件是 JSON 格式，你也可以自己写覆盖规则，放到 ~/.config/tokenjuice/rules/ 下就生效，不需要重新编译。
管道位置长这样：
```
工具调用结果
      │
      ▼
TokenJuice（分类 → 匹配规则 → 压缩）
      │
      ▼
LLM 上下文
```
官方给的数据是能减少最多 80% 的 token 消耗。「用前沿模型扫你过去六个月的邮件，只需要个位数美元」，我没跑过这个数字，但机制是可信的，实现代码在 src/openhuman/tokenjuice/ 里，开放的，可以自己核查。
## 对比
GitHub README 里有张对比表：
| | OpenClaw | Hermes Agent | OpenHuman |
|---|---|---|---|
| 开源协议 | MIT | MIT | GNU GPL-3 |
| 上手难度 | 中（需要终端） | 高（Python/Linux 环境） | 低（安装包，几分钟搞定） |
| 记忆类型 | 插件缓存 | 递归自学习 | Memory Tree + Obsidian vault |
| 接入服务方式 | 自己配 | 自己配 | 118+ OAuth 一键 |
| 自动拉数据 | 无 | 无 | 每 20 分钟一次 |
| 模型路由 | 手动 | 手动 | 内置自动路由 |
| 原生工具 | 仅代码 | 仅代码 | 代码 + 搜索 + 爬虫 + 语音 |
OpenClaw 的优势在消息渠道覆盖广，Hermes Agent 在复杂推理和自主编程这块比 OpenHuman 强，OpenHuman 的核心差异是它真的在帮你维护上下文，而不是等你来喂。
模型路由这块也值得单独说一下：OpenHuman 内置了自动路由逻辑，推理型任务送去前沿模型，快速问答走轻量模型，视觉任务走视觉模型，全在一个账号下，不需要你手动切。本地跑模型的话支持 Ollama 和 LM Studio，对隐私要求高的用户可以把敏感任务留在设备上。
## 不足之处
项目现在是 Early Beta 状态，README 里也坦白说了 "expect rough edges"。
我觉得几个地方需要认真想一下：
**权限范围很大。** 它需要读你的 Gmail、GitHub、Calendar、Slack……为了做记忆，它必须摄入大量数据。数据存本地这一点我信，但接入这么多服务本身是一个不小的攻击面，安全意识强的人应该认真评估一下。
**资源消耗不低。** 在本地维护一个实时更新的记忆索引，加上一个常驻桌面 shell，老机器或者 16GB 以下内存的机器可能会感受到压力。
**复杂推理目前不是它的主场。** 它现在更擅长整理、记忆和主动获取，如果你要做那种需要深度逻辑推理的任务，直接开 Claude 3.7 Sonnet 可能更直接、更快。这不是说 OpenHuman 不行，是说它的定位本来就不在这里。
## 怎么安装
macOS / Linux：
```bash
curl -fsSL https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.sh | bash
```
Windows（PowerShell）：
```powershell
irm https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.ps1 | iex
```
或者直接去 https://tinyhumans.ai/openhuman 下载 DMG 或 EXE 安装包，图形界面装完就能用，不需要开终端。
想从源码跑的开发者需要准备：Node.js 24+、pnpm 10.10.0、Rust 1.93.0（带 rustfmt + clippy），还有 CMake、Ninja、ripgrep。pnpm dev 跑 web UI，pnpm --filter openhuman-app dev:app 跑桌面端。详细环境配置看官方文档。
## 写在最后
我一直觉得，Agent 这个领域真正的门槛不是模型能力，是上下文管理。Claude 3.7 Sonnet 写代码已经相当能打了，但如果每次对话都要从零开始介绍「我是谁在做什么」，效率的天花板就摆在那儿。
OpenHuman 在这方面做的不错，这也是它在众多 AI 产品冲杀出来的原因，值得研究一下。
GitHub 地址：https://github.com/tinyhumansai/openhuman