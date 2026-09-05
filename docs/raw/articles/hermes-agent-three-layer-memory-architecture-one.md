---
source_url: https://mp.weixin.qq.com/s/xWphR-dDs5c64FgEggRDmw
tags: [wechat, article, claude, openai]
title: "Hermes Agent 爱马仕的三级 memory，到底在记什么？"
author: One掌柜
published_date: 2026-05-17
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: true
sha256: c1d92bfeeb6246de4b847b16427a58d8dbe41ef727f8049288e736cc5eb0b35e
---
---
# Hermes Agent 爱马仕的三级 memory，到底在记什么？
> 来源：[One掌柜（One的AI工具箱）](https://mp.weixin.qq.com/s/xWphR-dDs5c64FgEggRDmw)｜2026-05-17
很多人一上来先看 Hermes 支持多少模型、接了多少平台、能调多少工具。但如果你真开始把 Agent 往长期工作流里接，你最后最在意的，往往不是"它这轮够不够聪明"，而是**它下轮还记不记得**。
Hermes 没有在讲一个很虚的"长期记忆故事"，而是直接把 memory 结构拆开给你看了：三层 memory，配一个周期性的 nudge 机制。
## 第一层：两份很小、但每轮都会带上的 Markdown memory
图里第一层写得很直接：
- Fast
- Two tiny Markdown files
- Frozen mid-session
- Always in system prompt
对应的是两份文件：**MEMORY.md**（约 2200 字符上限）和 **USER.md**（约 1375 字符上限）。
这一层不是拿来堆资料的。它只记最值得常驻的那一小部分东西：
- 项目约定
- 工具 quirks
- lessons learned
- 用户身份
- 沟通风格
- skill level
- 明确的偏好和禁忌
**关键设计：mid-session frozen。** 本轮中就算又写入了新的 memory，也不会立刻把 system prompt 前缀打乱，而是等到下一轮再注入。这是为了 preserve the LLM prefix cache。
另外，当 MEMORY.md 到 80% 左右时，会触发 consolidation：agent 会 merge 或 drop 一些内容，把它重新压回高密度状态。所以第一层不是一个会无限膨胀的记忆池。
## 第二层：SQLite + FTS5 的历史检索层
第二层解决的是：过去聊过的大量历史，怎么在需要的时候再找回来。
- Unlimited capacity
- SQLite + FTS5
- Full-text search
- On-demand tool call
 retrieval pipeline：
1. agent 调用 `session_search(query)`
2. FTS 对历史结果排序（10ms 检索 10,000+ docs）
3. Gemini Flash 总结 top hits
4. concise summary 返回当前上下文
这不是"永远带着什么"，而是"需要时低成本召回"。
## 第三层：可插拔的 semantic memory provider
第三层不是简单的"历史记录"，而是外部语义 memory provider 层。
- Semantic
- External providers
- Pluggable
- Opt-in
支持多个 provider（示例：8 supported, 1 active），provider 生命周期：
- PREFETCH before turn
- SYNC after response
- EXTRACT at session end
就算切换 provider，Tier 1 和 Tier 2 也还在——语义层是可选项，不是替代品。
## Periodic Nudge
中间还有一个很值得看的机制：**periodic nudge**。
- every 300s
- configurable
- autonomous curation
逻辑是：系统会定期回看最近发生的事，然后问自己：
- 有没有新的偏好值得记？
- 有没有用户纠正值得记？
- 有没有项目约定值得记？
如果有，就调用 memory tool 去 add / replace / remove。如果没有，就安静返回。
这件事特别像真正有用的 Agent 系统会去补的一层：**不是等你手动喂记忆，而是系统自己周期性判断"什么值得留下"**。
## 总结
| 层次 | 角色 | 容量 | 访问方式 |
|------|------|------|---------|
| 第一层 | 常驻小 memory | MEMORY.md ~2200字 + USER.md ~1375字 | 每轮 system prompt |
| 第二层 | 大量历史按需检索 | 无限 | session_search(query) |
| 第三层 | 外部语义 provider | 可选 | PREFETCH/SYNC/EXTRACT |
| 额外机制 | Periodic Nudge | — | 每 300s 自主整理 |
**未来 Agent 的差距，未必只在模型层。真正拉开差距的，很可能是它怎么处理连续性。** Hermes 这张图值得看，不是因为它把概念讲得花哨，而是把 memory 这件事拆得足够具体：什么该常驻，什么该检索，什么该交给外部 semantic layer，什么该周期性整理。