---
title: "OpenClaw长期记忆：优秀管线与玄学效果"
source: wechat
url: https://mp.weixin.qq.com/s/pLqKTe1J2FkiiquoT4dOJA
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: cb2fb71fca5d4fdbe343895e9ec9336259551d38e4e5a5c31f091706b7e80aa9
---

# OpenClaw长期记忆：优秀管线与玄学效果

**来源**: 阿里云开发者

**发布日期**: 2026-04-15

**原文链接**: https://mp.weixin.qq.com/s/pLqKTe1J2FkiiquoT4dOJA

---

"Memory is limited — if you want to remember something, WRITE IT TO A FILE. ‘Mental notes’ don’t survive session restarts. Files do."

—— OpenClaw AGENTS.md 默认模板

对于 AI Agent 来说，“记住”是最基础也是最难做好的能力之一。当前的大语言模型在单轮对话中表现出色，但一旦会话结束，所有上下文都从窗口中消失。如何让 Agent 在多轮、跨天的交互中稳定地记住用户的偏好、事实和决策，以及值得记录的事件？OpenClaw 给出了一套以 Markdown 文件为载体的多层记忆体系，其管线覆盖记录、演进、召回全流程——设计理念优秀， 但其全流程以 LLM 弱约束的方式进行决策，实际记忆效果往往不够稳定 。

本文将从源码层面拆解这套记忆系统的全链路，分析其中的不确定性环节，并介绍 RDSClaw 记忆插件 如何补强这些环节，其在LoCoMo10评测中得到了13.90%的提升效果。

一、OpenClaw 记忆系统全景

OpenClaw 的核心设计原则是： 一切持久状态都是磁盘上的 Markdown 文件 。 Agent 的身份、规则、记忆、工具配置——全部以明文  .md  文件的形式存放在工作区目录下，每次会话启动时按优先级注入系统提示词。

完整的文件体系如下：

文件
用途
加载时机

AGENTS.md
工作区规则、安全边界、红线指令
每次会话（最高优先级）

SOUL.md
Agent 个性、价值观、沟通风格
每次会话

IDENTITY.md
Agent 身份元数据（名字、角色、头像）
每次会话

USER.md
用户档案（名字、昵称、时区、个人背景）
每次会话

TOOLS.md
环境配置（设备信息、SSH 主机、TTS 偏好）
每次会话

MEMORY.md
长期记忆 （已验证事实、决策、持久学习）
仅 DM 主会话

memory/YYYY-MM-DD.md
日记忆 （当天观察、临时笔记）
当天 + 昨天自动加载

DREAMS.md
梦境日记（Dreaming 系统输出，仅供人类审查）
不自动注入

可以看到，  AGENTS.md  、  SOUL.md  、  USER.md  等文件定义的是 Agent 的身份、规则和用户档案，它们在每次会话启动时被加载，用户和 Agent 都可以在对话中更新（比如  USER.md  的模板明确写着 "Update this as you go" ）。而  MEMORY.md  和  memory/YYYY-MM-DD.md  则是另一套机制——它们承载的是 Agent 在对话中积累的动态记忆，并且有一套专门的写入、演进和召回管线。

下面逐层展开。

二、记忆写入：两条路径

OpenClaw 的记忆写入有两条主要路径，它们共同负责将对话中的信息写入  memory/YYYY-MM-DD.md  日记忆文件。

2.1 Agent 主动写入（LLM 决策）

这是最常用的写入路径。在对话过程中，Agent 可以随时主动调用  write  工具将信息写入记忆文件：

- 用户显式要求 ： 用户说“记住我偏好 TypeScript”，Agent 主动写入

- Agent 自主判断 ： Agent 在对话中认为某些信息值得保存，自行决定写入

这意味着： 是否写入、写入什么、用什么格式写入，完全由 LLM 在对话中自主决定。 没有结构化的提取规则，没有强制的写入模板——Agent 可能记得很详细，也可能完全不记。

OpenClaw 的默认 AGENTS.md 模板中对记忆写入的指导如下：

📝 Write It Down - No "Mental Notes"!- Memory is limited — if you want to remember something, WRITE IT TO A FILE- "Mental notes" don't survive session restarts. Files do.- When someone says "remember this" → update memory/YYYY-MM-DD.md or relevant file  
🧠 MEMORY.md - Your Long-Term Memory- You can read, edit, and update MEMORY.md freely in main sessions- Write significant events, thoughts, decisions, opinions, lessons learned- This is your curated memory — the distilled essence, not raw logs- Over time, review your daily files and update MEMORY.md with what's worth keeping

可以看到，这些指导是方向性的建议（"capture what matters"、"write significant events"），而非结构化的提取规则——写什么、怎么写，仍然完全取决于 LLM 的理解和判断。

2.2 Memory Flush 自动写入（LLM 决策）

Memory Flush 是 Compaction（上下文压缩）前的 安全网 ——确保在激进的上下文裁剪之前，重要信息已被保存。触发条件：

- Token 阈值 ：  softThresholdTokens  （默认 4000）—— 距离 Compaction 的 token 距离

- 文件大小阈值 ：  forceFlushTranscriptBytes  （默认 2MB）—— 防止 token 计数器过时

触发时，系统向 LLM 发送一段特殊的提取指令，要求它将当前会话中值得持久化的信息写入  memory/YYYY-MM-DD.md  ：

Pre-compaction memory flush turn.The session is near auto-compaction; capture durable memories to disk.Store durable memories only in memory/YYYY-MM-DD.md.Treat MEMORY.md, DREAMS.md, SOUL.md, TOOLS.md, AGENTS.md as read-only during this flush.If nothing to store, reply with NO_REPLY.

Flush 期间，  write  工具被包装为 仅追加模式 （  appendOnly  ），只允许写入当天的日记忆文件，不能覆盖已有内容。

两条路径的关系

- 主动写入 是日常对话中的主要写入方式，但完全依赖 Agent 的自主判断；

- Memory Flush 是上下文压缩前的安全网，确保“最后一次救济机会”；

- 两者都写入相同的  memory/YYYY-MM-DD.md  日记忆文件，是后续 Dreaming 系统的输入源。

三、默认晋升方式：Agent 主动整理

在不启用 Dreaming 的默认配置下，日记忆到长期记忆的晋升完全依赖 Agent 自主判断 ：

- 

对话中直接写入 ： Agent 在主会话中可以自由读写  MEMORY.md  ，AGENTS.md 模板明确指导： "You can read, edit, and update MEMORY.md freely in main sessions" 。当 Agent 认为某条信息足够重要时，可以跳过日记忆，直接写入长期记忆。

- 

心跳维护 ： AGENTS.md 模板建议 Agent 在心跳（Heartbeat）期间定期回顾日记忆并更新  MEMORY.md  ：

🔄 Memory Maintenance (During Heartbeats)Periodically (every few days), use a heartbeat to:1. Read through recent memory/YYYY-MM-DD.md files2. Identify significant events, lessons, or insights worth keeping long-term3. Update MEMORY.md with distilled learnings4. Remove outdated info from MEMORY.md that's no longer relevant

这套默认机制的特点： 灵活但不确定 。 Agent 可以根据语境自由判断哪些信息值得长期保留，但是否执行、何时执行、整理质量如何，完全取决于 LLM 的自主决策。

四、Dreaming 梦境系统：三阶段异步演进

Dreaming 是 opt-in 功能，默认禁用 （ DEFAULT_MEMORY_DREAMING_ENABLED = false ）。启用后，系统自动创建一个 Cron 任务，默认频率为 0 3 （默认凌晨 3 点执行一次完整扫描，具体时区依配置）。

日记忆并不是最终形态。OpenClaw 设计了一套名为"Dreaming"的后台记忆巩固系统，通过 Cron 定时任务自动运行，将短期信号逐步转化为长期记忆。

Dreaming 由三个阶段组成，每次扫描按顺序依次执行： Light → REM → Deep 。

4.1 浅睡眠（Light Sleep）—— 摄取与去重

Light Sleep 负责从多个信号源中搜集候选记忆片段：

信号源：

- 日记忆文件 ： 扫描  memory/YYYY-MM-DD.md  ，逐行提取候选片段（最小 8 字符，最大 280 字符，最多 4 行合并为一个块）

- 会话转录 ： 按 Agent 和 Session 聚合的历史消息（每次最多扫描 240 条，每个文件 12~80 条）

- 短期回忆存储 ：  memory/.dreams/short-term-recall.json  中已有的记录

去重：

- 使用 Jaccard 相似度 （默认阈值 0.9）进行机械去重

- 重复项合并时取最高的 recallCount、maxScore，合并 queryHashes 和 recallDays

输出：

- 写入日文件的  ## Light Sleep  块

- 为每个候选记录  lightHits  计数（供后续 Deep Sleep 加权使用）

注意：Light Sleep 阶段不调用 LLM。 摄取和去重完全是确定性的文本处理——这意味着它无法理解语义近似，只能依赖字面重叠度来判断重复。

4.2 快速眼动睡眠（REM Sleep）—— 反射与候选真理

REM Sleep 对所有候选信号做模式分析，识别反复出现的主题和高置信度的"候选真理"。

主题反射（Theme Reflection）：

系统统计所有候选中的 concept tags（从文件路径和片段内容自动提取）的出现频率，计算主题强度：

strength = min(1, (count / totalEntries) × 2)

仅保留强度 ≥ minPatternStrength 的主题。

候选真理选择（Candidate Truth Selection）：

对每个候选计算置信度分数：

confidence = avgScore × 0.45 + recallStrength × 0.25 + consolidation × 0.20 + conceptual × 0.10其中：  recallStrength = min(1, log1p(recallCount) / log1p(6))  consolidation  = min(1, recallDays.length / 3)  conceptual     = min(1, conceptTags.length / 6)

- 去重阈值提高到 Jaccard 0.88（比 Light Sleep 更严格）

- 仅保留置信度 ≥ 0.45 的候选

- 最多选取 3 条候选真理

输出：

- 写入日文件的  ## REM Sleep  块

- 为每个候选记录  remHits  计数

### LLM 决策：梦境日记叙事生成

Light Sleep 和 REM Sleep 在处理完成后，如果有足够的候选材料，会调用一个后台子智能体（subagent）生成"梦境日记"叙事，追加到  DREAMS.md  。这是一次 LLM 调用，但生成的内容仅用于人类阅读， 不参与后续的晋升评分 。

4.3 深度睡眠（Deep Sleep）—— 六维评分与晋升

Deep Sleep 是决定一条记忆能否成为"长期记忆"的最终关口。它使用六个加权信号计算综合分数：

信号
权重
计算方式
含义

频率 (Frequency)
0.24
min(1, ln(signalCount + 1) / ln(11))
被回忆的总次数（recall + daily + grounded）

相关性 (Relevance)
0.30
totalScore / max(1, signalCount)
每次被检索时的平均质量分

多样性 (Diversity)
0.15
min(1, max(uniqueQueries, recallDays) / 5)
不同查询/日期上下文的覆盖宽度

时效性 (Recency)
0.15
exp(-λ × ageDays)  ，λ = ln(2)/14
指数衰减，半衰期 14 天

巩固度 (Consolidation)
0.10
max(0.55×spacing+0.45×span, groundedCount/3)
多日重现 或 grounded 信号强度

概念丰富度 (Conceptual)
0.06
min(1, conceptTags.length / 6)
Concept 标签密度

其中，巩固度取两个分支的最大值：

// 分支 1：基于 recallDays 的时间跨度spacing = min(1, ln(recallDays.length - 1) / ln(4))span    = min(1, (maxDay - minDay) / 7天)consolidation_a = 0.55 × spacing + 0.45 × span  
// 分支 2：基于 grounded 信号计数consolidation_b = min(1, groundedCount / 3)  
consolidation = max(consolidation_a, consolidation_b)

阶段信号加权提升：

Light Sleep 和 REM Sleep 的命中记录会为候选额外加分：

phaseBoost = LIGHT_BOOST_MAX(0.06) × lightStrength × lightRecency           + REM_BOOST_MAX(0.09) × remStrength × remRecency// 衰减半衰期同为 14 天

最终晋升分数：

score = Σ(weight_i × component_i) + phaseBoost

晋升门控：

一条候选必须同时满足以下条件才能晋升到  MEMORY.md  ：

- score ≥ 0.80  （Dreaming 配置默认最低综合分）

- totalSignalCount ≥ 3  （合并信号计数，即 recallCount + dailyCount + groundedCount ≥ 3）

- max(uniqueQueries, recallDays.length) ≥ 3  （独立查询数与有召回记录的天数取较大者）

通过门控的候选会被 重新水合 （从实时日文件中重新读取片段内容，确保不会写入过时或已删除的内容），然后追加到  MEMORY.md  。

### LLM 决策：Deep Sleep 梦境日记

与 Light/REM 类似，Deep Sleep 在晋升完成后也会调用子智能体生成一段叙事性梦境日记，记录本次晋升的摘要。同样，这段内容仅供人类阅读。

五、记忆召回与反馈环

持久化的记忆最终通过  memory_search  工具被检索和召回：

- 召回工具 ： 在  MEMORY.md  +  memory/.md  上执行检索。OpenClaw 支持 builtin（SQLite + FTS，可选配 sqlite-vec 向量扩展）和 QMD 两种搜索后端； 当 embedding 不可用时，builtin 自动降级为 FTS 全文索引 + 词法排名 ，仍然保持基本的召回能力；

- 信号记录 ： 每次  memory_search  返回结果后，系统在后台异步调用  recordShortTermRecalls  ，对符合短期记忆路径规则的结果进行信号记账（查询、结果路径、评分），写入  memory/.dreams/short-term-recall.json ；

- Dreaming 反馈环 （仅在启用 Dreaming 时生效）：上述记录的召回信号会被 Dreaming 系统消费，影响六维评分中的频率、相关性等指标，形成"越被检索 → 越容易晋升"的正向反馈环；

记忆搜索是 Agent 召回已有记忆的主要通道（启用 Active Memory 插件时，系统会在主回复前自动用子 Agent 调用  memory_search  预取相关记忆）。搜索质量直接决定了 Agent 能"记起"多少信息——而搜索质量本身受 embedding 配置、查询精准度等因素制约。

六、"随机性"的代价：原生系统的不确定性汇总

上面的管线设计理念是优秀的：异步演进、多阶段过滤、正向反馈。但从工程实现的角度回看，管线中存在多个不确定性环节，它们叠加起来构成了记忆稳定性的核心挑战：

记忆写入除人为显式提醒外完全依赖 LLM 主观判断

无论是 Agent 主动写入还是 Memory Flush 自动写入，写什么、怎么写、写多少，都完全由 LLM 在单次推理中自主决定。没有结构化的提取规则，没有强制的输出格式。不同的模型、不同的上下文长度、甚至同一模型的不同推理轮次，写入的内容可能完全不同。你告诉 Agent 自己的名字、城市和饮食偏好，Agent 可能只记住了名字，漏掉了其余两个——即使用户没有明确说“记住这个”。

Memory Flush 作为安全网仍有盲区

Memory Flush 本身是 Compaction 前的救济机制，但它只在上下文接近压缩阈值时触发。如果一次对话很短（未触发 Compaction），而 Agent 又没有主动写入，那么对话中的信息就不会被持久化。换句话说，Flush 只能保证“长对话压缩前不丢”，不能保证“短对话也能记住”。

日记忆到长期记忆的晋升缺乏保障

无论选择哪条晋升路径，日记忆向  MEMORY.md  的晋升都存在不确定性：

默认路径

晋升完全依赖 Agent 在对话中或心跳期间自主决定是否整理日记忆。Agent 可能长期不回顾，也可能整理时遗漏重要信息——没有任何机制保证晋升一定发生。

Dreaming 路径 （默认禁用）

即使启用，也面临以下三个环节的不确定性：

Dreaming 演进依赖 Cron 周期

从日记忆写入，到经历 Light Sleep 摄取、REM Sleep 反射、Deep Sleep 晋升，虽然单次 Cron 就会依次执行全部三个阶段，但晋升门控要求合并信号计数 ≥ 3（含 daily、grounded 信号）且 max(独立查询数, 召回天数) ≥ 3——这意味着一条记忆通常需要 多次跨日信号积累 才能通过门控。对于"我下周二飞杭州"这样的时效性信息，等到信号积累完成，飞机可能已经起飞了。

Jaccard 去重无法捕捉语义近似

Light Sleep 和 REM Sleep 使用 Jaccard 相似度做去重，这是一种基于词汇重叠的方法。"用户喜欢苹果"和"用户爱吃苹果"在语义上是同一件事，但 Jaccard 可能判定它们不相似——结果是同一事实在系统中存在多个版本。

六维评分基于统计信号，而非语义重要性

Deep Sleep 的晋升评分完全基于统计信号（检索次数、出现天数、查询多样性等）， 没有 LLM 参与语义判断 。一条对用户极其重要但只被提及一次的信息（比如"我对花生过敏"），在六维评分中可能远低于一条反复出现但并不重要的信息。

不确定性链路图

对话内容  ↓ ❶ LLM 自主判断是否写入（可能遗漏）  ↓ ❷ 短对话无 Flush 安全网（可能不触发）日记忆文件  ↓ ❸ 晋升不确定或不准确  │   ├─ 默认路径：Agent 自主判断，可能不执行或整理不全  │   └─ Dreaming 路径（默认禁用）：  │        Jaccard 机械去重（无语义理解）  │        六维统计评分（无 LLM 语义判断）MEMORY.md  ↓ ❹ 召回受限（无 embedding 时降级为词法匹配）对话上下文

记忆召回受搜索配置制约

上述不确定性集中在记忆的写入和晋升环节，但记忆的 召回 同样存在不确定性。  memory_search  的召回质量高度依赖配置：有 embedding 模型时走向量语义搜索，无 embedding 时降级为 FTS 词法匹配，可能遗漏语义相关但字面不同的记忆。此外，Agent 是否意识到需要检索、检索时使用的查询词是否精准，也都影响最终的召回效果。

这些不确定性并不是 OpenClaw 的设计缺陷——通用框架为了兼容大部分场景，必须在提取精度和系统复杂度之间做出权衡。但对于需要 精确、稳定 记住用户事实的场景，这些不确定性覆盖了从写入、晋升到召回的完整链路，叠加效应会显著影响用户体验。

七、为OpenClaw的记忆注入稳定性：

RDSClaw记忆插件openclaw-memory-alibaba-local

RDSClaw的  openclaw-memory-alibaba-local  插件可以与 OpenClaw 原生记忆系统共同协作，针对上述不确定性环节提供互补增强。插件从 User 消息中提取两类个人记忆：

- 个人画像 （UserImageExtraction）：用户的偏好、个人详情、计划意图等，走 LLM CRUD 整合，个人事实 Evergreen 免衰减

- 世界记忆 （WorldImageExtraction）：用户提及的事件、实体、第三方信息等，同样走 LLM CRUD 整合，按策略淘汰

两者共享同一套提取器和分流逻辑（含  User/用户  的条目走个人画像，其余走世界记忆）。

个人记忆管线

插件采用 两阶段实时管线 设计，在每轮对话结束时（  agent_end  钩子）稳定触发：

对话内容  ↓ ① 提取器（Extractor）  LLM 结构化提取，配合强制规则  ↓ 分流：个人记忆管线 / 世界记忆管线  ↓ ② 整合器  对每条新事实，向量检索已有记忆 → LLM 判定 CRUD 动作：  INSERT（新事实）/ UPDATE（信息更丰富）/ SKIP（已存在）/ DELETE（矛盾过时）  ↓LanceDB（向量 ANN + BM25 FTS + 标量索引）

与原生系统最大的区别在于：每轮对话结束即稳定触发记忆提取（不依赖 Agent 自主判断或 token 阈值），每一步都有 LLM 参与语义判断，且整个管线在当轮对话结束时即完成，无需等待 Cron 调度。

核心差异

维度
OpenClaw 原生
插件

提取时机
Agent 主动写入 + Compaction 前 Flush（被动）
每轮对话结束即触发（主动）

提取方式
LLM 自由写入（无结构约束）
LLM 结构化提取

演进方式
Cron 三阶段 → 六维统计评分
实时 LLM CRUD 整合（INSERT/UPDATE/SKIP/DELETE）

演进周期
数天
分钟级（当轮对话结束即完成）

去重
Jaccard 字面相似度
向量近似 + 精确匹配 + LLM 语义判断

矛盾处理
依赖统计评分自然淘汰
LLM 显式识别矛盾

时间衰减
Dreaming 评分默认 14 天半衰期；检索侧另有可选时间衰减（默认关闭，半衰期 30 天）
个人事实 Evergreen（免衰减），世界事件按策略淘汰

存储后端
Markdown + SQLite/QMD
LanceDB（向量 ANN + FTS 全文索引 + 标量索引）

召回方式
memory_search 单通道
混合召回

插件如何补强核心不确定性

原生系统不确定性
插件的互补方式

LLM 主观写入
结构化 Prompt 约束 + 强制规则

短对话无 Flush 安全网
每轮  agent_end  钩子自动触发，不依赖 token 计数或 Agent 自主判断

Cron 演进延迟
提取→整合→存储在同一轮完成，无需等待调度

Jaccard 机械去重
向量相似度 + LLM CRUD 语义整合

统计评分无语义
LLM 参与每次整合决策（INSERT/UPDATE/SKIP/DELETE）

召回受搜索配置制约
混合召回，不依赖单一搜索后端

八、不只记住“你”，也记住 AI 工作流：

RDSClaw记忆插件自进化记忆管线

个人记忆管线关注的是 User 说了什么 。但对于 AI Agent 来说，还有一类同样重要的信息： AI 自己做了什么、犯了什么错、学到了什么 。 RDSClaw记忆插件的自进化记忆管线注重从 Assistant 消息 中提取这类信息，让 Agent 在后续对话中避免重复犯错、复用已验证的工作流。

三类提取目标

类别
含义
示例

最佳实践 （learnings）
AI 总结出的可复用行为规则
"上线前必须重启服务使新代码生效"

错误经验 （errors）
AI 犯过的错误和应避免的模式
"Do not assume X; always check Y first"

行为诉求 （feature_requests）
用户对 AI 行为的期望和约束
"删除前必须确认，不要直接执行"

提取与召回

插件支持两种提取方式：

- LLM 提取 （默认）：将 User + Assistant 消息组合发给 LLM，结构化输出  { category , text , importance }  数组，每轮最多提取 5 条

- 正则提取 （轻量级）：通过关键词模式（如  学习：  、  错误：  、  lesson:  ）快速匹配，不依赖 LLM

提取结果经向量去重（相似度 ≥ 0.92 视为近似重复）后存入 LanceDB。在后续会话的  before_prompt_build  阶段，自进化记忆与个人记忆一起被召回并注入系统上下文，影响 Agent 的后续行为。

与个人记忆的对比

维度
个人记忆
自进化记忆

消息来源
User 消息
User + Assistant 消息

提取目标
用户是谁、关心什么、发生了什么
AI 学到了什么、犯了什么错、应该怎么做

典型内容
"用户偏好 TypeScript"、"用户对花生过敏"
"上线前必须重启服务"、"删除前必须确认"

演进方式
LLM CRUD 语义整合
向量去重 + 存储

价值
让 Agent 记住用户
让 Agent 越用越好

九、LoCoMo10 评测结果

我们使用 LoCoMo10 长对话记忆基准对两套系统进行了对比评测。

LoCoMo

（https://github.com/snap-research/locomo/blob/main/README.MD）是一个用于评估人工智能系统在长上下文会话中记忆与推理能力的基准测试。它被广泛应用于AI记忆系统领域的性能评测，通常包含10个对话集，旨在全面检验模型在单跳回忆、多跳推理、时序推理和开放域生成等多方面的能力。LoCoMo10 覆盖事实查询、时间推理、逻辑推理和描述性问答四大类别，是目前评估 AI Agent 长期记忆能力的主流 benchmark 之一。

Category
类型
OpenClaw 原生记忆
RDSClaw 记忆插件
准确率差值

Category1
事实查询
34.04%
62.54%
+28.50%

Category2
时间相关
57.01%
67.07%
+10.06%

Category3
推理性
43.75%
65.35%
+21.60%

Category4
描述性
68.37%
78.18%
+9.81%

总体
全部类别汇总
58.18%
72.08%
+13.90%

几个值得注意的数据：

- 事实查询（Category1）提升最大（+28.50%） ： 这正是插件双管线 + 实时 CRUD 整合的核心优势——用户的个人事实被结构化提取并 Evergreen 存储，不会因为统计信号不足而丢失。

- 推理性问题（Category3）提升显著（+21.60%） ： 混合召回（向量 + BM25）和 LLM 语义去重让相关记忆的召回更完整，为推理提供了更充分的上下文。

- 总体准确率从 58.18% 提升到 72.08% ： 在不改变底层 LLM 的前提下，仅通过记忆管线的工程优化就实现了近 14 个百分点的提升。

十、推荐实践：RDSClaw 开箱即用

openclaw-memory-alibaba-local  插件已内置在 RDSClaw 中：

- 零配置启动 ： 安装即用，LLM 提取和向量索引开箱可用

- 本地 + 远程双模式 ： 支持本地 GGUF 嵌入模型（离线可用）或远程 DashScope 兼容 API

- 多通道覆盖 ： 钉钉、飞书、企业微信——无论在哪个群对话，记忆统一管理

- 安全保障 ： 记忆注入时自动标记为"不可信历史数据"，防止 prompt 注入；敏感信息硬编码排除

如有任何问题，可钉钉加入RDSClaw技术交流群，群号170415008314，欢迎进群交流！
