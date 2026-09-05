---
title: model-harness-fit-agent-harness
source_url: https://mp.weixin.qq.com/s/TTe7IY_pjAuv4zA9krlYrQ
source: wechat
publish_date: 2026-05-07
tags: [wechat, article, claude, openai, gpt, agent, harness, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 3872bc48205af8b87e4f77d163b52ecbe470e182e23935623e21e93c2817351d
---
> 原文: https://mp.weixin.qq.com/s/TTe7IY_pjAuv4zA9krlYrQ
> Author: Nicolas Bustamante (Cursor/前OpenAI)，编译自其博客
> Score: value=7, confidence=7, product=49 ≥ 49 → PASS
> SHA256: ce6531795902a104242b37fdd3d3699535dc95cc67b32c47ad874be43118f305
> 长度: 9008 字符
> 摘要: Model-Harness-Fit核心论点：模型不是单独存在，壳是模型一部分；同一Claude Opus 4.6配ForgeCode得79.8%配Capy得75.3%；Cursor换壳Top30→Top5；壳的分数比模型升级多；三种壳协议扒透（Codex typed async/Claude Code direct conversation/Copilot CLI supervisor）；工具表=模型方言；记忆是最密集碰撞面；matched pair会漂移→build to delete
---
## 核心论点：Model-Harness-Fit
> "模型不是只针对API做post-training的，它是针对壳做的。"
> "同一批权重跑在三个壳上，其实是三个不同的模型——权重byte-for-byte一样，本能却被post-training条件化了。"
> — Nicolas Bustamante
## 让人不舒服的榜单
Terminal-Bench 2.0（2026年4月30日）前十名：
| 排名 | Harness | 模型 | 分数 |
|------|---------|------|------|
| 1 | Codex | GPT-5.5 | 82.0% |
| 2 | ForgeCode | GPT-5.4 | 81.8% |
| 3 | TongAgents | Gemini 3.1 Pro | 80.2% |
| 4 | **ForgeCode** | **Claude Opus 4.6** | **79.8%** |
| ... | ... | ... | ... |
| — | **Capy** | **Claude Opus 4.6** | **75.3%** |
**同一Claude Opus 4.6，配ForgeCode是79.8%，配Capy是75.3%——差4.5分。**
Cursor团队：同一个模型，没换权重，只改壳，榜单排名从Top 30冲到Top 5（一跳25位）。
**结论：这一年壳带来的分数，比模型升级带来的分数还多。**
## 为什么模型不是单独存在的
每个模型的post-training都包含了壳的细节：
- 工具叫什么名字
- 输入schema长什么样
- 引用标签怎么写
- skill文件放哪里
- 计划协议什么格式
这些不是模型的通用能力，它们是**byte级别的约定，被烤进了post-training**。
> "你把模型拖出它的壳，性能的损耗是你再也拿不回来的。除非你把另一边也重写一遍。"
这就是为什么每个号称"model agnostic"的agent都碰过同一堵墙——**你没法就这么换个模型**。
要干净地换模型，你得把壳也一起换掉：工具面、schema形状、skill里点名调哪些工具的主体、引用契约、记忆仪式、system prompt结构，有时连planning协议都得换。
## 三种壳，三种完全不同的协议
### Codex：typed asynchronous protocol
- 模型发出一个Submission，拿回一串typed Event
- 协议定义在 `codex-rs/protocol/src/protocol.rs`，用Rust的serde枚举
- 模型被训练成"发submission、读event"的思维模式
- AGENTS.md里写着硬性组织纪律：**每个Rust模块软上限500行，硬上限800行，新feature以新crate形式上**——这是编译器工具链的组织纪律被拿来治理agent harness
### Claude Code：direct typed conversation loop
- `ConversationRuntime::run_turn` 每轮吃一个 `Vec<AssistantEvent>`
- 模型在assistant message里直接打出工具调用，下一轮接上tool result
- 记忆是两阶段流水线：
  - **Phase 1**：gpt-5.4-mini抽取原始记忆，写成严格JSON schema artifact（description/task/task_group/task_outcome/cwd/keywords）
  - **Phase 2**：gpt-5.4对着git baseline做consolidation，prompt长达841行
- 模型的记忆引用是包在 `<oai-mem-citation>` XML块里的
### GitHub Copilot CLI：supervisor protocol
- host不跑agent loop，spawn一个 `@github/copilot` 子进程，用vscode-jsonrpc走stdio
- agent loop跑在子进程里
- 是三个壳里**唯一明确尝试跨模型路由**的
- picker里有Sonnet、Opus、Haiku和GPT-5.x整条线
## 工具表：模型的方言
表面看前6个工具(read/write/bash/grep/glob)都一样，第7个开始发散：
### Codex的工具差异化
- **apply_patch**：自家diff格式，两种变体（Lark语法版本+JSON版本）
- **8个subagent编排动词**：spawn_agent_v1、spawn_agent_v2、wait_agent_v1、wait_agent_v2、send_message、close_agent_v1、close_agent_v2、resume_agent
### Claude Code的工具
- 只有一个`Agent`动词做subagent调度
- Edit(old_string/new_string)格式
### Copilot CLI的工具
- read_agent/write_agent搞多轮subagent控制
- task搞dispatch
- 三动词的read_bash/write_bash/stop_bash
> Cursor壳团队说得最白："OpenAI的模型被训练成用patch格式编辑文件，Anthropic的模型被训练成用字符串替换。两个模型都能用对方的工具，但是用陌生的那个，要多花推理token，而且出错率更高。"
**这不是抽象偏好，这是可以测量的成本。**
## Skill：md文件格式一样，底下契约根本不一样
三个harness都用SKILL.md+YAML frontmatter，格式近到同一个skill body三个壳都能解析。但**skill藏着隐式契约**——它期待调用哪些工具，这不在frontmatter里，而在body里。
同一个skill（假设有TodoWrite步骤）在：
- **Claude Code里**：TodoWrite是内建的，Agent是内建的，Explore有壳强制的工具白名单——完美工作
- **Codex里**：TodoWrite不存在，最接近的是update_plan_tool但schema不一样，Agent没有这个shape——默默失败或跑出残血版本
- **Copilot CLI里**：TodoWrite动词根本不存在，subagent调度走task或read_agent/write_agent——更惨
## 记忆层：最密集的碰撞面
三种记忆架构，三种完全不同的押注：
| | Codex | Claude Code | Copilot CLI |
|--|-------|------------|-------------|
| 写入模式 | 延迟批量写，两阶段流水线 | 同步live write | 服务端记忆 |
| 触发条件 | 6小时以上空闲 | 同步写入每条.md | store_memory工具 |
| 格式 | 严格JSON schema | 每个记忆一个.md文件 | 远端后端 |
| 引用信号 | `<oai-mem-citation>` XML块 | 每次body read的verification | 服务端处理 |
| 衰减机制 | 30天无引用+Phase2淘汰 | usage_count+last_usage | 服务端衰减 |
### <oai-mem-citation>：六个字符决定记忆生死
Codex的模型每次用到记忆后在message末尾挂`<oai-mem-citation>` XML块，带thread_id和raw_memory_id。壳的parser把这个剥掉，同时在SQLite里把对应记忆的usage_count和last_usage+1。
**跨壳运行的结果**：
- **Codex模型扔进Claude Code**：模型依然挂citation tag，Claude Code的壳不解析，直接显示给用户，记忆系统里没有衰减信号
- **Claude模型扔进Codex**：模型内联用记忆不挂tag，Codex的usage_count永远是0，好记忆反而被当作没用的淘汰掉
> "六个字符的XML tag，决定了一个记忆系统是越用越好还是默默腐烂。"
## Copilot CLI的诚实做法：真正的路由
Copilot CLI是唯一明确尝试跨模型路由的，三条路同时走：
1. **per-model工具包含**：v0.0.366 changelog："Codex specific patch toolchain"——apply_patch只在当前模型是Codex家族时才加载
2. **per-model工具搜索**：v1.0.13——"Tool search for Claude models"——Claude系模型拿到deferred tool loading loop，OpenAI系模型拿到完整工具列表
3. **Critic agent用互补模型**：v1.0.18——Claude系实验模式下启用
> "不是把所有东西翻译成公共方言，而是把对的方言喂给对的模型。"
代价是诚实——**壳必须承认"Claude on Copilot CLI"和"GPT on Copilot CLI"是两个不同的产品**。
## 换模型的隐藏成本
### 三重同时崩溃
1. **对话历史变out-of-distribution**：前一个模型打出来的工具调用是它的方言(apply_patch block、`<oai-mem-citation>` tag、八动词dispatch)，新模型要对着一份它自己绝不会打出来的transcript推理
2. **prompt cache断了**：cache是provider×model特定的，切换一次必然cache miss
3. **工具表换了形状**：走到subagent dispatch的一半，下一轮拿到的是一套不同的动词
Cursor做完所有缓解之后，给出的建议：**除非有理由，一般建议一个会话里只用一个模型。最干净的变通是派一个subagent用另一个模型，而不是切换主对话。**
## Matched Pair会漂移
> "harness里的每个组件都编码了一个'模型自己搞不定'的假设。这些假设会过期。"
> "想待在前沿，新模型发布时你得删掉你大部分代码。LLM把脚手架当早餐吃。"
Rajasekaran给Sonnet 4.5造的壳（context reset、sprint拆分、激进压缩），在Opus 4.6身上变成了死重。他直接砍掉所有这些脚手架，跑了一个两小时连续会话。
## 对三层用户的结论
### 对agent平台
选一个壳、选一个模型，把它们当成一个产品发。别假装模型可以跨壳移植，也别假装壳是中立的。Copilot CLI的"不同模型给不同工具"是诚实版。
### 对模型实验室
壳是产品战略，不是基础设施。Anthropic的system-reminder注入机制、Codex的citation tag、Copilot CLI的十节system prompt骨架——这些不是施工细节，是模型被雕塑的那个表面，是壳把模型变得不可替代的护城河。
### 对用户
换模型的成本比看上去高，比vendor希望你以为的低。高，是因为模型和壳融合了几个月的训练；低，是因为只要你肯复刻工具面、复刻citation契约、复刻system prompt结构、复刻记忆仪式，大部分差距能补回来。
**落地建议：**
- **Matched pair不是静态的**，每个新模型发布都要重新评估harness的每个组件
- **build to delete**：为旧模型设计的护栏，在新模型身上可能变成dead weight
- **换模型要整个换**：工具面+citation契约+system prompt结构+记忆仪式一起换
- **尽量别切换模型**：派subagent用另一个模型，而不是切换主对话
## 来源
- 原文：Model-Harness-Fit by Nicolas Bustamante (https://claude.com/blog)
- 数据来源：Nicolas Bustamante on X, 2026-05-04
- Terminal-Bench 2.0 leaderboard（2026-04-30）
- Cursor研究团队harness engineering博客（2026-04-30）