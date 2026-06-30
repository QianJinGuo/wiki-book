# model-harness-fit-agent-harness

## Ch01.228 model-harness-fit-agent-harness

> 📊 Level ⭐⭐ | 16.7KB | `entities/model-harness-fit-agent-harness.md`

# Model-Harness-Fit：模型与壳的适配性
> 原文: https://mp.weixin.qq.com/s/TTe7IY_pjAuv4zA9krlYrQ
> Author: Nicolas Bustamante (Cursor/前OpenAI)，编译自其博客
> Score: value=7, confidence=7, product=49 ≥ 49 → PASS

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
  - **Phase 1**：gpt-5.4-mini抽取原始记忆，写成严格JSON schema artifact
  - **Phase 2**：gpt-5.4对着git baseline做consolidation，prompt长达841行
- 模型的记忆引用是包在 `<oai-mem-citation>` XML块里的

### GitHub Copilot CLI：supervisor protocol- host不跑agent loop，spawn一个 `@github/copilot` 子进程，用vscode-jsonrpc走stdio
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
1. **对话历史变out-of-distribution**：前一个模型打出来的工具调用是它的方言，切换后新模型要对着一份它自己绝不会打出来的transcript推理
2. **prompt cache断了**：cache是provider×model特定的，切换一次必然cache miss
3. **工具表换了形状**：走到subagent dispatch的一半，下一轮拿到的是一套不同的动词
Cursor做完所有缓解之后，给出的建议：**除非有理由，一般建议一个会话里只用一个模型。最干净的变通是派一个subagent用另一个模型，而不是切换主对话。**

## Matched Pair会漂移
> "harness里的每个组件都编码了一个'模型自己搞不定'的假设。这些假设会过期。"
> "想待在前沿，新模型发布时你得删掉你大部分代码。LLM把脚手架当早餐吃。"
Rajasekaran给Sonnet 4.5造的壳（context reset、sprint拆分、激进压缩），在Opus 4.6身上变成了死重。他直接砍掉所有这些脚手架，跑了一个两小时连续会话。

## 深度分析
### 1. Model-Harness-Fit 的范式革命
传统观点认为 AI 模型是"大脑"，Harness（壳）是"身体"——模型决定能力上限，壳决定如何调用。但 Nicolas Bustamante 揭示的 Model-Harness-Fit 范式彻底颠覆了这一认知：**壳不是模型的附属品，而是模型行为不可分割的一部分**。
这一论断的证据极具说服力：同一权重（byte-for-byte identical）在不同壳上展现出显著不同的性能表现（Claude Opus 4.6：ForgeCode 79.8% vs Capy 75.3%）。这种差异不是来源于模型能力，而是来源于**post-training 中编码的隐式契约**——工具命名、schema 格式、引用协议等细节。
这意味着，当我们评估一个 coding agent 的能力时，不能只看"模型是什么"，必须看"壳是什么"——两者是一个整体。这对 AI 基础设施的构建方式产生了根本性影响。

### 2. 工具表作为"模型方言"的深层含义
文章提出"工具表=模型方言"这一概念，直击跨模型移植的本质困难。传统观点认为"工具是抽象接口，换模型时保持工具不变即可"。但 Bustamante 的分析表明：**工具的具体实现（如 Edit 的 old_string/new_string vs apply_patch 的 diff 格式）是模型 post-training 的一部分**。
当模型被训练成"用 patch 格式编辑文件"，它对工具调用的预期格式是特定的。用陌生格式调用它，模型需要额外的推理 token（因为这不是它的本能反应），而且出错率更高。**这不是实现细节，而是可以测量的性能差异**。
这一洞见对 agent 框架设计的启示是：不应该追求"抽象掉模型的差异"，而应该**拥抱模型的特异性，为每个模型定制最合适的工具接口**。Copilot CLI 的"per-model 工具包含"策略正是这一理念的体现。

### 3. 记忆系统的"隐性契约"问题
记忆层是 Model-Harness-Fit 理论最有力的证据：三种壳实现了三种完全不同的记忆架构——延迟批量写 vs 同步 live write vs 服务端记忆。更关键的是，**这些架构之间的差异在表面上不可见**（都叫"记忆"），但实际行为完全不同。
`<oai-mem-citation>` XML 块的案例尤其说明问题：六个字符的差异决定了记忆系统的生死——在 Codex 中这是衰减信号，在 Claude Code 中这是无意义的噪音。这意味着**跨壳移植时，即使记忆的概念相同，隐式契约也不同**。
这对构建长期记忆系统的 agent 框架提出了严峻挑战：当模型升级时，记忆系统可能需要完全重建。"build to delete"的建议正是基于这一现实：**harness 的每个组件都会过期，必须准备好重建**。

### 4. "Matched Pair 漂移"的工程哲学
文章提出的"Matched Pair 会漂移"概念，揭示了 LLM 应用开发的一个根本性悖论：**我们为模型构建的护栏和辅助结构，本质上是因为模型"自己搞不定"某些事情。但当模型能力提升时，这些护栏反而变成了限制**。
Rajasekaran 的案例极具说明性：为 Sonnet 4.5 精心设计的 context reset、sprint 拆分、激进压缩等机制，在 Opus 4.6 身上变成了性能损耗。这不是框架的错，而是能力边界的相对性——**护栏的必要性取决于模型当前的能力边界，而模型能力在快速演进**。
"build to delete"的建议不仅是技术策略，更是一种工程哲学：**对 LLM 应用保持谦逊，不要过度投资于当前能力边界的辅助结构，因为它们可能在新模型发布时变成债务**。

## 实践启示
### 给 Agent 平台开发者的建议
1. **选模型+选壳，当成一个产品发**

   - 不要假装模型可以跨壳移植
   - 不要假装壳是中立的
   - "Claude on Copilot CLI"和"GPT on Copilot CLI"是两个不同的产品，需要不同的工具配置
2. **建立 Matched Pair 的持续评估机制**

   - 每个新模型发布时，重新评估 harness 的每个组件
   - 准备"build to delete"的心理预期——旧护栏可能变死重
   - 用两小时连续会话测试旧 harness 在新模型上的表现，而不是假设兼容性存在
3. **换模型要整个换**

   - 工具面 + citation 契约 + system prompt 结构 + 记忆仪式 一起换
   - 试图只换一半（换模型但保留 harness）会导致三重同时崩溃
   - 最干净的变通：派一个 subagent 用另一个模型，而不是切换主对话

### 给模型实验室的建议
1. **壳是产品战略，不是基础设施**

   - Anthropic 的 system-reminder 注入机制
   - Codex 的 citation tag
   - Copilot CLI 的十节 system prompt 骨架
   - 这些不是施工细节，是模型被雕塑的那个表面，是模型的护城河
2. **post-training 中编码壳细节是合理策略**

   - 模型不是"通用大脑"，而是针对特定使用场景优化的产品
   - 试图让模型适配所有壳，反而会让模型在每个壳上都表现平庸

### 给 Agent 应用开发者的建议
1. **不要迷信"model agnostic"**

   - 任何声称可以无缝换模型的框架，都会碰壁
   - 如果需要换模型，准备好重新调优整个 harness
2. **优先投资于工具配置的精细化**

   - 在模型选择上的边际收益可能低于在 harness 调优上的边际收益
   - Cursor 换壳 Top30→Top5 的案例说明：harness 优化可以带来质的飞跃
3. **构建可观测性**

   - 监控 harness 中每个组件的有效性
   - 建立"护栏有效性"的评估机制，在模型能力跃升时及时删除旧护栏
4. **团队工具链选择策略**

   - 如果团队使用多个模型，为每个模型维护独立的 harness 配置
   - 不要假设同一套 prompt 或工具配置在不同模型上表现相同
   - 记录每个模型在特定任务上的表现差异，持续优化 match

## 来源
- 原文：Model-Harness-Fit by Nicolas Bustamante (https://claude.com/blog)
- 数据来源：Nicolas Bustamante on X, 2026-05-04
- Terminal-Bench 2.0 leaderboard（2026-04-30）
- Cursor研究团队harness engineering博客（2026-04-30）

## Related

- `Cursor Harness Model`

## 相关实体
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/245-skill.md)
- [Browser Use Runtime Harness](ch05/015-harness.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](ch04/503-agent.md)
- [Harness Engineering 让 Coding Agent 可靠完成长程任务](ch09/043-coding-agent.md)
- [Agent Harness 12 Components 7 Decisions](ch04/503-agent.md)

---

