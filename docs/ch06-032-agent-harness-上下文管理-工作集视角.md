## Ch06.032 Agent Harness 上下文管理：工作集视角

> 📊 Level ⭐⭐⭐ | 23.5KB | `entities/agent-harness-context-management-working-set.md`

## 核心定位
**上下文窗口 ≠ 聊天记录，而是工作集。**
上下文管理是 Agent Harness 在"上下文层"的核心职责：每一轮调用前，系统整理一份"当下能用"的窗口视图——什么放近一点，什么先压缩，什么挪出窗口回头再找回来。

## 核心原则
### 工作集 vs 聊天记录
| 维度     | 聊天记录思路    | 工作集思路         |
| ------ | --------- | ------------- |
| 上下文是什么 | 从头到尾的消息历史 | 系统持续维护的视图     |
| 压缩是什么  | 总结历史      | 把稳定状态迁移到持久层   |
| 管理主体   | 模型自己节制造   | Harness 系统性管理 |
| 长任务表现  | 杂物间越堆越大   | 持续整理，只留最小可用集合 |
**关键洞察**：上下文管理会直接改变 Agent 的行为，不只是性能优化。 ^["raw/articles/agent-harness-context-management-working-set"]

- 文件只给前 2000 行 → 模型学会用 offset 翻
- grep 只给 preview → 模型学会先缩小搜索范围
- 子智能体不继承父对话 → 父 Agent 必须把委派任务写得更清楚
**设计哲学**：不要假设模型会天然节制。Harness 先把预算守住，再靠工具描述、错误消息和 hint 把模型教会怎么分段读。

### Harness 替模型管 vs 模型自己管
这是一条光谱，没有绝对答案： ^["raw/articles/agent-harness-context-management-working-set"]

- **Harness 多管**：实现重，但下限托得住
- **模型自己管**：实现轻，但模型一旦贪心，整段会话就跑偏
**分层下注策略**：底下硬限流，中间给提示和路径，上面留一点空间让模型自己决定。 ^["raw/articles/agent-harness-context-management-working-set"]

## 四框架文件读取策略对比
| 系统 | 文件限制 | 特色 |
|------|---------|------|
| Pi | 2000 行或 50KB | 末尾提示用 offset 继续读 |
| OpenClaw | bootstrap 单文件 12K 字符，总共 60K；工具输出 16K 或 30% 上下文 | bootstrap 预加载 + 工具输出预算 |
| Claude Code | 256KB 以上先 stat 拒绝；读完后 token 预算兜底；默认 2000 行 | 两道门（stat + token 预算）+ pre-query optimization |
| Letta Code | 10MB 以上拒绝；默认 2000 行窗口；超出的写到 overflow 文件 | overflow 文件机制 |

## 工具输出管理
工具输出比对话历史更容易把窗口撑爆。 ^["raw/articles/agent-harness-context-management-working-set"]
**标准做法**： ^["raw/articles/agent-harness-context-management-working-set"]
1. 每类工具输出给字符/token 上限 ^["raw/articles/agent-harness-context-management-working-set"]
2. 超大输出只留开头、结尾或 preview ^["raw/articles/agent-harness-context-management-working-set"]
3. 完整内容写到磁盘或服务端 ^["raw/articles/agent-harness-context-management-working-set"]
4. 给模型一个可继续访问的路径或检索工具 ^["raw/articles/agent-harness-context-management-working-set"]
5. 幂等调用做去重 ^["raw/articles/agent-harness-context-management-working-set"]
**Claude Code pre-query optimization**：每次 API 调用前都处理工具输出——平时就整理工作集，不等窗口快满再救火。

## Compaction 四档策略光谱
### Level 1：确定性驱逐
到阈值按比例丢最早一段消息，留尾巴。 ^["raw/articles/agent-harness-context-management-working-set"]

- 优点：便宜稳定
- 缺点：任务计划类老消息可能被冲走

### Level 2：LLM 总结
要丢的部分交给模型压成一段摘要，再前置回去。 ^["raw/articles/agent-harness-context-management-working-set"]

- 优点：质量高
- 缺点：贵，对总结 prompt 设计挑剔

### Level 3：Checkpoint + 记忆迁移
压缩前先自我整理，把关键状态写到 memory 文件或独立工作区，再让正式 compaction 收尾。

- 优点：状态可恢复
- 缺点：实现复杂

### Level 4：结构化分维压缩（Claude Code）
按维度分别保留： ^["raw/articles/agent-harness-context-management-working-set"]

- primary request（用户原始需求）
- technical concepts（技术概念）
- files and code（相关文件和代码）
- errors and fixes（错误和修复）
- pending tasks（待办任务）
- current work（当前工作进展）
**Compaction 兜底**：compaction 本身也可能撑爆窗口。需要：先钳工具返回到小阈值再重试 → 仍不行就对 transcript 中间截断（留头留尾、丢中间）→ 或按 API-round 成组扔掉最旧的组。

## Sub-Agent 隔离策略
| 系统 | 隔离策略 |
|------|---------|
| Pi | 新进程，子 Agent 只拿任务字符串 |
| OpenClaw | 默认 fresh isolated session，给子 Agent 过滤 AGENTS.md/TOOLS.md/SOUL.md |
| Claude Code | typed-agent 空白对话，只把委派 prompt 当唯一用户消息；async agents 设工具 allowlist |
| Letta Code | fork 和非 fork 两路；非 fork 也是 fresh headless instance |
**本质**：隔离之后，最小必要上下文是什么？ ^["raw/articles/agent-harness-context-management-working-set"]

## 内存层级类比
| 层级 | 计算系统 | Agent Harness |
|------|---------|--------------|
| 最快最小 | 寄存器 | 模型当前注意力 |
| 中等 | 缓存 | 近期工具输出、previews |
| 较大有预算 | 内存 | 分页/压缩后工作集 |
| 最大最慢 | 磁盘 | overflow 文件、memory repo、检索索引 |
| 页面错误 | 找不到信息 | 模型说"找不到刚才读过的" |
| Swap | 换入换出 | overflow 文件、结构化 summary |
**核心类比**：不要把上下文窗口当成无限滚动的聊天记录。它更像一个由系统持续维护的工作区。 ^["raw/articles/agent-harness-context-management-working-set"]

## Session / Harness / Sandbox 解耦
| 概念 | 职责 |
|------|------|
| **Session** | 持久事件日志，窗口外保存可恢复上下文 |
| **Harness** | 决定每一轮把哪些事件切片、变换、组织好，放回模型窗口 |
| **Sandbox** | 执行工具和代码 |
三个绑在一起短期省事；任务一长，恢复/隔离/权限/调试都会变重。 ^["raw/articles/agent-harness-context-management-working-set"]
**Anthropic Managed Agents 的设计**：session 在 harness 外面，作为持久事件日志保存。这样 harness 本身可以失败、重启，再通过 session log 恢复；Claude 上下文窗口只是当下工作区，不背全部历史的保存责任。

## 九字工程自查表
1. **硬上限**：可能返回大内容的工具，有没有硬上限？ ^["raw/articles/agent-harness-context-management-working-set"]
2. **继续访问**：截断时有没有提供继续访问的路径？ ^["raw/articles/agent-harness-context-management-working-set"]
3. **工具描述**：分页参数有没有写进工具描述？ ^["raw/articles/agent-harness-context-management-working-set"]
4. **压缩维度**：会话压缩到底保留了什么？（目标/文件/修改/错误/计划/下一步） ^["raw/articles/agent-harness-context-management-working-set"]
5. **工具边界**：压缩时有没有守住工具调用边界？（不能切掉 call 但留下 result） ^["raw/articles/agent-harness-context-management-working-set"]
6. **子智能体隔离**：子智能体默认是否隔离？ ^["raw/articles/agent-harness-context-management-working-set"]
7. **持久层**：有没有把稳定状态迁到持久层？ ^["raw/articles/agent-harness-context-management-working-set"]
8. **可观测性**：系统有没有可观测性？（token 用量/截断/压缩/summary 维度） ^["raw/articles/agent-harness-context-management-working-set"]
9. **解耦**：session、harness、sandbox 有没有解耦？ ^["raw/articles/agent-harness-context-management-working-set"]

## 三篇 Harness 文章的关联
| 文章 | 核心议题 |
|------|---------|
|| [Sub-Agent vs Agent Team](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sub-agent-vs-agent-team-selection-guide.md) | 多 Agent 架构先看上下文边界 |
|| [Claude Code Subagent 上下文卫生](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-subagents-context-hygiene.md) | Subagent 是 Harness 的上下文卫生工具 |
|| [Harness Engineering 系统梳理](ch05-049-harness-engineering-系统梳理.html) | Harness 是把经验沉淀成下一轮默认存在的能力 |
**上下文管理决定系统能不能持续协作。** ^["raw/articles/agent-harness-context-management-working-set"]

## 深度分析
### 工作集模型的理论支撑
工作集（Working Set）概念源自计算系统内存管理理论——进程在运行过程中，活跃访问的页面集合构成了它的"工作集"。将其映射到 Agent 上下文管理，有一条核心类比链路：**模型注意力 ≈ CPU 寄存器访问，工具输出缓存 ≈ L1/L2 缓存，分页工作集 ≈ 压缩后上下文，磁盘/Swap ≈ overflow 文件和 memory repo**。这个类比不是修辞，而是工程设计的路线图：计算系统的内存层级是被动命名的，而 Agent 工作集是**主动管理的**。
传统 OS 内存管理的核心问题是"什么时候换出、换入什么"——这和 Agent 上下文压缩的决策完全同构。差异在于：OS 只能根据访问频率做统计推断，而 Agent Harness 知道**任务语义**——哪些是用户目标、哪些是探索过程、哪些是中间错误。这些语义信息让压缩决策远比 OS 页面替换更精准，但也意味着 Harness 需要更深的任务理解。

### Compaction 的核心矛盾：信息压缩 vs 任务可恢复性
四档压缩策略代表了三代技术演进： ^["raw/articles/agent-harness-context-management-working-set"]
**第一代（确定性驱逐）**：简单但粗暴。最早的消息被丢掉，这在短对话里没问题，但在多轮任务里，早期消息往往包含用户原始目标和关键约束条件。一旦被驱逐，模型会"失忆"，需要用户重新说明上下文——这对用户体验是致命的。
**第二代（LLM 总结）**：引入了语义理解，但引入了两个新问题：1）贵，每次 compaction 都是一次额外 API 调用；2）prompt 敏感——总结 prompt 设计得好不好，直接决定压缩质量。实践中发现，同样的总结 prompt 在不同任务类型上效果差异巨大。
**第三代（Checkpoint + 记忆迁移）**：引入了状态可恢复性，但实现复杂度指数级上升。需要模型在压缩前主动"自整理"——这本身就消耗上下文窗口，且自整理 prompt 如何设计才能确保状态完整迁移，仍是开放问题。
**第四代（Claude Code 结构化分维压缩）**：从"压缩消息"转向"保留维度"。这不是改进，而是范式转移——不再问"怎么压"，而是问"压完后留什么"。六个维度（primary request / technical concepts / files and code / errors and fixes / pending tasks / current work）本质上是把任务状态结构化存盘，解压缩时直接恢复工作状态而非还原对话历史。

### Sub-Agent 隔离的上下文经济学
Sub-Agent 隔离策略是理解上下文管理的一把钥匙。Pi 给子 Agent 起新进程，OpenClaw 默认 fresh isolated session，Claude Code 用 typed-agent 空白对话——这些设计的本质回答的都是同一个问题：**隔离之后，最小必要上下文是什么？**
OpenClaw 的做法最有代表性：子 Agent 拿到的是过滤后的 AGENTS.md/TOOLS.md/SOUL.md，不带父 transcript。这背后的逻辑是**探索过程不应该污染主窗口**——子 Agent 的搜索过程、错误尝试、中间推理，都是探索成本，不应该让它们占用父 Agent 的上下文预算。父 Agent 只应该拿到最终结果和必要的上下文继承。
这种设计暗含了一个成本核算：**子 Agent 的上下文消耗是隔离的，父 Agent 的上下文消耗是积累的**。如果子 Agent 可以共享状态（比如共享代码库的索引），探索成本可以降低，但上下文隔离性会变差；如果完全隔离，探索成本会变高，但每个工作集都是干净的。

### Session/Harness/Sandbox 解耦的工程价值
Anthropic Managed Agents 把 session 放在 harness 外面，这一看似微小的架构决策，实际上解决了长任务运行中的三个核心问题：
1. **故障恢复**：harness 可以失败、重启，但 session log 记录了完整事件流。重启后的 harness 只需要从 session log 恢复状态，而不需要模型重新理解历史上下文。 ^["raw/articles/agent-harness-context-management-working-set"]
2. **上下文预算独立**：Claude 上下文窗口只是"当下工作区"，不背全部历史的保存责任。这意味着窗口大小的选择可以专注于当前任务需求，而不需要为历史积累预留额外空间。 ^["raw/articles/agent-harness-context-management-working-set"]
3. **并行化可能**：当 session 和 harness 解耦后，多个 harness 可以并发处理同一个 session 的不同阶段——比如一个 harness 负责当前任务的工具执行，另一个 harness 在后台预整理下一阶段可能用到的上下文。 ^["raw/articles/agent-harness-context-management-working-set"]
三个组件绑在一起时（session == harness == sandbox），任务一长，恢复/隔离/权限/调试都会变重。解耦后，每个组件可以独立演进和调试。

## 实践启示
### 设计原则 Checklist
基于四框架对比和理论分析，一个高质量的 Agent 上下文管理系统应当满足： ^["raw/articles/agent-harness-context-management-working-set"]
**硬约束层面**（必须实现，无法靠模型自我约束）： ^["raw/articles/agent-harness-context-management-working-set"]

- 所有可能返回大内容的工具必须配置字符/token 硬上限
- 工具输出超限时必须提供可继续访问的路径（文件路径、offset 参数、检索工具）
- compaction 触发时必须守住工具调用边界（不能截断进行中的 tool call）
**系统提示层面**（通过 prompt 引导模型自我管理）： ^["raw/articles/agent-harness-context-management-working-set"]

- 工具描述必须包含分页参数的使用说明
- 错误消息必须提示"信息被截断，请用 offset/检索继续访问"
- compaction 策略必须在系统提示中明确说明，让模型知道什么会被保留、什么会被压缩
**架构设计层面**（从系统层面保证可维护性）： ^["raw/articles/agent-harness-context-management-working-set"]

- Session/Harness/Sandbox 三者建议解耦，session 作为持久事件日志在窗口外保存
- 每个工作区应当有独立的可观测性埋点：token 用量、截断事件、压缩触发、summary 维度
- 引入 pre-query optimization 机制，在每次 API 调用前整理工具输出，不要等窗口快满再救火

### 框架选型建议
| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 短任务（< 50 轮） | OpenClaw / Pi | 轻量级，compaction 简单，预算充足 |
| 长任务多轮（> 50 轮） | Claude Code | 结构化压缩成熟，session 解耦，状态可恢复 |
| 需要 sub-agent 并行探索 | Claude Code typed-agent | 隔离策略完善，工具 allowlist 支持 |
| 需要极致轻量 | Pi | 单进程，minimal overhead |
| 需要持久记忆 | Letta Code / 自建 memory repo | overflow 文件 + 外部记忆系统 |

### 避坑指南
**坑 1：compaction 本身撑爆窗口**
compaction 逻辑本身也是工具调用，也消耗上下文。Claude Code 的兜底方案值得参考：先钳工具返回到小阈值再重试；仍不行就对 transcript 中间截断（留头留尾、丢中间）；或按 API-round 成组扔掉最旧的组。这不是理论担忧，是 200K+ token 级别对话中必然遇到的实际问题。
**坑 2：pre-query optimization 缺失**
Claude Code 的 pre-query optimization 是最容易在实现时被压缩预算的模块——它平时就整理工作集，不等窗口快满再救火。如果只在 compaction 时才处理工具输出，会导致：1）窗口被工具输出持续撑大；2）compaction 触发时需要处理的内容更多，质量下降；3）模型在工具输出处理上浪费注意力。建议把 pre-query optimization 作为固定流程，每次 API 调用前都执行。
**坑 3：sub-agent 上下文泄露**
如果子 Agent 继承了父对话，父窗口会被探索过程中的中间结果污染。隔离策略必须在系统层面强制执行，不要依赖模型"自觉"不读取父 transcript。OpenClaw 和 Claude Code 在这一点上都是从架构层面保证的。
**坑 4：忽视可观测性**
上下文管理的效果难以量化，除非有可观测性基础设施。最小可行的可观测性应当包括：每轮 token 用量趋势、工具输出大小分布、compaction 触发频率和压缩率、模型主动使用 offset/检索工具的频率。这些指标可以帮助识别上下文管理策略的失效早期信号。
> 原文链接：https://mp.weixin.qq.com/s/JEjyY1x-Gx3_tvH0intQ1w

## Anthropic 官方命名：Context Engineering（CE）

[Thariq Shihipar / Anthropic 团队 2026-06 文章](https://raw/articles/claude-code-context-engineering-anthropic-thariq) 把社区一直用的"上下文管理"升格为 **"Context Engineering (CE)"**——一个比 prompt engineering 范围更大的工程学科。这是 Anthropic 官方话语权下对这门子学科的**第一次系统化命名**。

### CE vs PE 的边界

| 维度 | Prompt Engineering | Context Engineering |
|---|---|---|
| **关注** | 这一轮的 prompt 内容 | 过去 + 未来的整体上下文状态 |
| **范围** | 提示词技巧 | 工具输出 / 状态分舱 / 隔离 / 摘要 / 预算 |
| **优化对象** | 文本质量 | 系统性的窗口管理 |
| **执行者** | 人 + 模型 | Harness 系统（pre-query optimization） |

CE = PE 的超集。**未来讨论 LLM 工程时，"CE" 可能会取代"PE"成为主流框架**。

### 5 大实战工程模式（Anthropic 官方清单）

1. **Quarantined subagent（隔离区 subagent）** —— subagent 的本质 = 上下文隔离机制，把探索性读取丢进子 agent，主对话只看到摘要 ^["raw/articles/agent-harness-context-management-working-set"]
2. **Auto-summarization（自动摘要）** —— 到阈值按比例丢最早一段消息，留尾巴 + 摘要前置 ^["raw/articles/agent-harness-context-management-working-set"]
3. **Tool output budgeting（工具输出预算）** —— 每类工具输出给字符/token 上限，超大输出只留开头/结尾/preview，完整内容落盘 ^["raw/articles/agent-harness-context-management-working-set"]
4. **State sharding（状态分舱）** —— 按维度分别保留：原始文档 / 工具输出 / 中间结论 / 决策日志 分舱 ^["raw/articles/agent-harness-context-management-working-set"]
5. **Subagent 做 narrow read** —— 子 agent 只读相关文件范围，把"读到了什么"压缩回主 agent ^["raw/articles/agent-harness-context-management-working-set"]

> 这 5 个模式与本实体上文"实践启示 / 避坑指南"中的工具输出预算、compaction、subagent 隔离、pre-query optimization **一一对应** —— Anthropic 文章是对已有分散实践的**官方命名 + 集大成**。

### Subagent 的本质 = 上下文隔离（Anthropic 视角）

> "Anthropic 视角：subagent 存在的主要目的不是'并行'而是'隔离'。主对话的上下文窗口 = 稀缺资源；让 subagent 跑探索性 read，让它带着'我读了什么 + 我发现了什么'回来。"

这与本文核心论点"**上下文窗口 ≠ 聊天记录，而是工作集**"一致 —— subagent 是"工作集外包"。

### 启示

1. **"Context Engineering" 是新话术锚点** —— 未来讨论 LLM 工程时，"CE" 会取代"PE"成为主流框架 ^["raw/articles/agent-harness-context-management-working-set"]
2. **subagent 的本质 = 隔离**（不是并行）—— Anthropic 官方视角值得被反复引用 ^["raw/articles/agent-harness-context-management-working-set"]
3. **CE 是已有实践的官方命名** —— 不要当成新发明，应被当作"已有 6 个框架的子学科标准化"

## 相关实体
- [Agent 上下文管理工程模式收敛 — 多框架代码级横向对比](ch04-460-the-ui-is-dead-long-live-the-agent-servicenow-goes-headles.html)
- [阿里云 EventHouse 企业级 Agent 上下文供给体系](ch11-040-eventhouse-agent.html)
- [Claude Code Session 管理与 1M 上下文最佳实践](ch03-002-obsidian-claude-code.html)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](ch04-158-agent-harness-governance-identity.html)
- [深度解析 Claude Code 在 Prompt / Context / Harness 的设计与实践](ch03-002-obsidian-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-context-management-working-set.md)
→ [原文存档（Anthropic CE 文章）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-context-engineering-anthropic-thariq.md)

- [Agent 上下文窗口管理对比](ch04-149-agent-上下文窗口管理对比.html)
- MOC
- MOC

---
