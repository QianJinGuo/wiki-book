# Agent Loop 源码导读：一次 Hermes 任务的完整生命周期

## Ch04.061 Agent Loop 源码导读：一次 Hermes 任务的完整生命周期

> 📊 Level ⭐⭐ | 22.1KB | `entities/hermes-agent-loop-source-code-anatomy.md`

## 核心发现

> **金句：Agent 不是一次性的调用，而是一个循环。**
> Chat 是 request-response 模式（问一句答一句）；Agent 是 task-completion 模式（给定目标，循环跑直到完成）。

## 主循环 5 阶段抽象

不同框架（Hermes、LangGraph、Cursor、Claude Code）命名不同，但本质都是这 5 个阶段：

| 阶段 | 职责 | Hermes 命名 |
|------|------|-----------|
| 1. 接收输入 | 拿到 user message 或上一轮 tool result | Receive Input |
| 2. 拼装 Prompt | 读 Memory + Skill + Context + 对话历史 | Build Prompt (Prompt Builder) |
| 3. 调用模型 | 发请求 / 等响应 / 解析结果 | Call LLM (LLM Adapter) |
| 4. 执行工具 | 模型要调工具就执行，不要就跳过 | Execute Tool (Tool Runner) |
| 5. 检查退出 | 任务完成了？完了就退出，没完就回第 1 步 | Check Done (Orchestrator) |

## 4 个核心模块

### 模块 1：Loop Orchestrator（循环主控）

200 行主循环本体。职责极窄：

- 维护当前是第几轮（turn count）
- 在 5 个阶段之间调度
- 检查终止条件
- 把每一步事件丢给下层记录

**它不知道 prompt 怎么拼，不知道模型怎么调，不知道工具怎么跑。它只知道"下一步该叫谁"。**

设计原则：**主循环应该是最薄的那一层，重逻辑要推到下面。**

### 模块 2：Prompt Builder（提示词组装）

每轮要做的事：

- 读 system prompt 模板
- 注入相关 Memory 条目
- 检索并注入相关 Skill
- 把可用 Tools 序列化成 schema
- 拼上整个对话历史
- 控制总长度不超过模型 context window

好处：改 prompt 策略不需要动主循环。想加一种新的注入方式（比如加 RAG 检索结果），只改 Prompt Builder，Loop 完全不知道。

### 模块 3：执行层（LLM Adapter + Tool Runner）

- **LLM Adapter**：屏蔽不同模型 API 差异（OpenAI / Anthropic / Bedrock），上层只传 prompt、拿回结构化响应
- **Tool Runner**：找到工具实现、传参、捕获异常、包装成统一格式

两个模块都是**无状态**的，方便测试和并发。

### 模块 4：Trajectory Recorder（轨迹记录）

把循环里每一个事件写到结构化的 session trace 里。是后续 Nudge Engine 和 Review Agent 的输入。

把记录和执行解耦：即使关闭自学习功能，主循环照样能跑（trace 写到 /dev/null 就行）。

## 一轮内完整时序

```
Orchestrator → Prompt Builder: buildPrompt(state)
Prompt Builder → Orchestrator: return prompt  # 50-200ms（含 Memory 检索、Skill 匹配）
Orchestrator → LLM Adapter: callModel(prompt)
LLM Adapter → Orchestrator: return assistant message  # 1-5秒（最慢）
Orchestrator 自检：has tool_calls?
Orchestrator → Tool Runner: execute(tool_call)  # 默认串行
Tool Runner → Orchestrator: return tool result
Orchestrator 自检：task done?

  - 无 tool_calls → 任务完成，退出
  - 有 tool_calls → 回到第1步，开新一轮
```

> **金句：一轮 = 一次模型调用 + 0~N 次工具调用。**
> 很多人以为"一轮 = 一次模型调用"，结果 token 和耗时算偏了。如果模型调了 5 个工具，实际是 1 次 LLM + 5 次 Tool。

**工具默认串行的原因：** 工具之间可能有顺序依赖（如先 read_file 再 write_file），并发会出竞态。除非工具明确声明"只读、纯函数、可并发"，否则一律串行。

## 4 种退出姿势

### 退出 1：任务自然完成（约 70% 任务）

```python
if assistantMessage.tool_calls.length === 0:
    break
```

### 退出 2：达到最大 turn 上限

Hermes 默认 25 轮（小任务）或 50 轮（复杂任务）。

**关键：** 达到 turn 上限的退出不能算"任务完成"，否则 Review Agent 会把"卡住"当成"成功"去复盘。Hermes 显式标注 `terminated_by: "max_turns"`，让下游知道是异常结束。

### 退出 3：用户主动打断

用户按 Ctrl+C 或点击取消按钮。需要处理：

- 中断模型 stream 生成
- 尝试 cancel 正在执行的工具（不是所有工具都支持）
- 已完成工具调用保留结果，正在执行的中断

### 退出 4：不可恢复错误

模型 API 挂了、工具抛未捕获异常、内存 OOM。处理原则：

- 把错误信息记到 trajectory（让 Review Agent 知道原因）
- 释放占用的资源
- 给用户能看懂的错误提示，不甩 stack trace

> **金句：一个好的 Loop，必须有 4 种退出姿势。**

## 源码发现

### 发现 1：Loop 内不做任何业务判断

Hermes 的 Loop 里没有任何 `if 任务类型 == X 那么...` 的代码。

业务差异（如"代码任务要先 lint"、"文档任务要先 outline"）全通过 Skill 注入 prompt，由模型自己判断。Loop 永远是同一个流程。

这种"通用循环 + 差异化 prompt"的设计让 Loop 可以在所有场景复用，不会因为加新功能而越来越臃肿。

### 发现 2：每一步事件实时落盘

Trajectory Recorder 不是任务结束才一次性写入，而是每一步事件实时写到磁盘。

如果任务跑到一半挂了，没落盘的事件就丢了，Review Agent 拿不到完整 trace。实时落盘的代价是每秒多写几次 disk，收益是任何异常情况下都能事后复盘。

### 发现 3：Tool 调用默认串行

改成默认并发跑 100 个真实任务，7% 出现"读到了上一步还没写完的数据"竞态。并发应该是个 opt-in 选项，不能是默认。

### 发现 4：刻意避免状态机

Hermes 没用显式状态机。Loop 就是个简单的 while 循环，状态全在变量里。

显式状态机会让每种状态都需要预先定义，新增能力时改动巨大。简单 while 循环灵活得多。

适用场景：任务种类有限、流程稳定 → 状态机（如客服对话）；任务种类无限、高度灵活 → 简单 Loop（如通用 Coding Agent）。

## 设计哲学

> **"主循环克制，外围灵活"** — 所有复杂逻辑推到 Prompt Builder/Tool Runner/Trajectory Recorder

> **"自进化"是叠加能力，不是嵌入逻辑** — Memory/Skill/Nudge/Review 从外部叠加到 Loop 上，Loop 不知道它们存在。哪天不想要自学习了，拔掉这些模块，Loop 照样跑

> **"先想清楚怎么停，再想怎么跑"** — 从 Hermes 学到的最重要的一条

## 与 Hermes Agent 自进化系统的关系

Agent Loop 是 Hermes 自进化能力的执行基础设施：

- **Trajectory Recorder** → Nudge Engine / Review Agent 的输入数据
- **Skill 注入** → 通过 Prompt Builder 实现
- **Memory 注入** → 通过 Prompt Builder 实现
- **自进化闭环**：Loop 跑任务 → Trajectory 记录 → Review Agent 分析 → Nudge Engine 生成改进 → Skill/Memory 更新 → 下一次 Loop 效果更好

Loop 本身不包含任何自进化逻辑，自进化是靠 Skill/Memory/Nudge/Review 从外部叠加的。这保证了 Loop 的简洁性和可替换性。

---

## 深度分析

**Insight 1: Agent Loop 的 5 阶段抽象揭示了当前主流框架的共同范式**

不同框架（Hermes、LangGraph、Cursor、Claude Code）命名不同，但本质都是这 5 个阶段：接收输入、拼装 Prompt、调用模型、执行工具、检查退出。这种一致性说明当前的 Agent 设计已经形成了相对稳定的设计模式。

**Insight 2: "通用循环 + 差异化 Prompt"是解耦复杂度的关键设计**

Hermes 的 Loop 不处理任何业务判断，差异化全部通过 Skill 注入 Prompt 实现。这种"通用循环 + 差异化 prompt"的设计让 Loop 在所有场景复用，不会因为加新功能而越来越臃肿。相比之下，LangGraph 的状态图、Cursor 的 IDE 绑定，本质上都是"差异化 prompt"的不同实现方式。

**Insight 3: 无状态模块是并发和可测试性的基础**

LLM Adapter 和 Tool Runner 都是无状态的。无状态意味着可并发、可单独测试。工具之间的共享状态通过 Trajectory Recorder 或 Memory 实现，而不是让执行层自己维护状态。

**Insight 4: 工具调用串行是默认设置，并发是例外**

改用并发执行工具后，7% 的任务出现竞态问题。工具之间存在隐含的顺序依赖，当前 Hermes 选择串行作为默认策略，并发需显式 opt-in。

**Insight 5: 简单循环优于状态机，取决于任务复杂度**

Hermes 选择简单 while 循环而非状态机，因为状态机需要预先定义所有状态，新增能力时改动巨大。适用场景不同：任务种类有限、流程稳定 → 状态机（如客服对话）；任务种类无限、高度灵活 → 简单循环（如通用 Coding Agent）。

---

## 实践启示

1. **Loop 应该只做调度，业务逻辑全部外推**：如果需要根据场景差异化行为，应该通过 Skill/Prompt 注入实现，而不是在 Loop 里加 `if 任务类型 == X`。

2. **先设计退出条件，再实现执行流程**：从 Hermes 学到的最重要的一条。明确 4 种退出姿势（自然完成、达到上限、用户打断、不可恢复错误），特别是要标注 `terminated_by` 字段让下游能区分正常结束和异常结束。

3. **Trajectory 实时落盘，不要等任务结束**：每次事件立即写入磁盘。虽然会多几次 disk IO，但任何异常崩溃都能事后复盘。

4. **工具默认串行，并发需显式声明**：除非工具明确声明"只读、纯函数、可并发"，否则一律串行，避免隐含顺序依赖引发的竞态问题。

5. **用 Skill 机制管理业务差异，保持 Loop 通用**：不同场景的差异化通过独立的 Skill 模块注入，Loop 本身保持稳定。这样加新功能不需要修改核心循环。

---

## 相关概念

- Agent Loop 设计模式
- Loop Orchestrator
- Prompt Builder
- Tool Runner
- Trajectory Recorder
- Agent 自进化

## 相关实体
- [Hermes Agent Loop Architecture](ch04/231-hermes-agent-loop.html)
- [Small Hermes Self Evolving Agent Architecture](../ch03/045-agent.html)
- [Hermes Agent Operator上手 把一个 Agent 养成可运营系统 若飞](../ch03/090-hermes-agent.html)
- [Hermes Observability Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability-aliyun.md)
- [Gateway Architecture Openclaw Claude Hermes Comparison](../ch11/214-openclaw.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-loop-source-code-anatomy.md)

---

## 第 2 来源 — 微信公众号「烟花星空 AI」"Hermes Agent 内部的 8 个 Loop" (2026-06-12)

> Source: [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-8-loops-compound-interest-yanxbt-2026-06-12.md)
> Author: YanXbt (烟花星空 AI)
> Original: https://x.com/IBuzovskyi/status/2064377155476193362
> Date: 2026-06-12 09:53

本来源是 [第 1 来源 winty 源码解剖](ch04/231-hermes-agent-loop.html) 的**同主题 1 个月后的演进**——把"Hermes 单一主循环"扩展为**"8 个 Loop 跨时间尺度同时运行"**的复利系统。本来源补全了第 1 来源**未涉及的**关键维度: 跨 Loop 复利 / FlowZap 4 类 taxonomy / 迭代预算分层 / 可中断 API / ThreadPoolExecutor 并发。

### 核心数据

- **GitHub stars**: 95,600(发布 7 周后,2026 年增长最快 agent framework, TokenMix 2026 年 4 月)
- **自创建 skills 提速**: 让研究型任务耗时相比全新 agent 实例缩短 **40%** (TokenMix benchmark) — 这是 Loop 复利效应的**可量化证据**
- **核心代码量**: AIAgent 类 15,000+ 行(`run_agent.py`)
- **官方文档验证**: 所有技术细节已对照 hermes-agent.nousresearch.com/docs 验证

### FlowZap 4 类 Loop Taxonomy

| 类型 | 含义 | 框架实现度 |
|------|------|-----------|
| **Retry loops** | 失败后重试(最简单) | 大多数 framework |
| **Reflection loops** | 下一个 pass 开始前由另一个 agent 评价输出 | 少数 framework |
| **Memory loops** | 把经验存下来影响未来运行 | 极少数 framework |
| **Skill loops** | 把 procedure 编码为技能改变未来执行方式 | 仅 Hermes 等少数 |

**Hermes 原生支持 4 类全部能力 + 额外 Orchestration Loop** = 共 8 个 Loop。

### 8 个 Loop 详解(本来源独家分解)

#### Loop 1: Core Agent Loop(心跳)
- 时间尺度: 每 turn 内,毫秒到几分钟
- 9 步流程(比第 1 来源 5 阶段更具体):
  1. 接收用户消息(或 `/goal` judge 继续信号)
  2. 追加到 conversation history
  3. 构建或复用缓存的 system prompt(`prompt_builder.py`)
  4. 检查 compression(>50% context)
  5. 从 history 构建 API messages
  6. 注入临时 prompt layer(预算警告 / 上下文压力)
  7. 应用 prompt caching markers(Anthropic)
  8. 发起可中断 API call
  9. 解析 response: 有 tool calls → 执行 → 回到第 5 步;是文本 → 持久化 + flush memory + 返回

**迭代预算**: 默认 session 90 次(`agent.max_turns`); Subagents 50 次(`delegation.max_iterations`)

**可中断调用**: 后台线程 + interrupt event(用户消息/`/stop`/signal)→ 放弃 API 线程,不写入部分 response

**Tool 执行**: 单 tool 主线程; 多 tool `ThreadPoolExecutor` 并发(完成后按原始顺序重排)

**没有这个 Loop**: 一切都会坏 — 这是 kernel。

#### Loop 2: Ralph Loop(goal)
- 时间尺度: 每 goal 几分钟到几小时
- 命名来源: Ralph Wiggum; 灵感来自 Eric Traut Codex CLI 0.128.0
- 核心: 辅助 judge model 每 turn 判断 done/continue
- 迭代上限 20; 与 kanban 集成:`kanban_create --goal` / `goal_mode=True`
- judge 把卡片 title + body 视为 acceptance criteria

#### Loop 3-8(本来源概览)
- **Memory Loop**: 跨 session 持久化经验(与 [Hermes Agent Memory System Architecture](../ch03/090-hermes-agent.html) 同源)
- **Skill Loop**: 把 procedure 编码为 SKILL.md 改变未来执行(与 [Hermes Skill System](../ch07/017-hermes-skill.html) 同源)
- **Reflection Loop**: 输出经另一 agent 评价后进入下一 pass(与 [Hermes Self Improving Loop Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md) 同源)
- **Orchestration Loop**: 跨 agent 跨时间协调(本来源独家扩展)
- **Retry Loop**: 失败自动重试(基础能力)
- **Compression Loop**: >50% 触发,Loop 1 内部步骤

### 复利效应理论(本来源独家)

> "每一个 Loop 都会让其他 Loop 更有效。叠在一起形成复利系统——每跑完一次 session,系统都比之前更强。"

**复利路径**: Memory 沉淀经验 → Skill 用经验生成 skills → Skill 让下次 session 更高效 → Reflection 评价新 skill 质量 → 新 skill 改进 Memory 质量

### 与第 1 来源对比表

| 维度 | 第 1 来源(winty 2026-05-20) | 第 2 来源(烟花星空 AI 2026-06-12) |
|------|--------------------------|------------------------------|
| **核心定位** | 5 阶段 + 4 模块抽象 | **8 Loop 跨时间尺度复利系统** |
| **Loop 数量** | 1 个主循环 | **8 个 Loop**(Core/Ralph/Memory/Skill/Reflection/Orchestration/Retry/Compression) |
| **时间维度** | 单次任务生命周期 | **毫秒 → 数周(8 时间尺度)** |
| **理论框架** | 5 阶段调度 | **FlowZap 4 类 taxonomy + orchestration** |
| **复利效应** | 未涉及 | **核心金句**(本来源独家) |
| **Core Loop 步骤** | 5 阶段 | **9 步详细**(每步代码定位) |
| **迭代预算** | 未涉及 | **session 90 / subagent 50 / Ralph 20**(三层独立) |
| **prompt caching** | 未涉及 | **Anthropic markers 集成**(本来源独家) |
| **可中断 API call** | 用户打断处理 | **interrupt event + 放弃 API 线程**(本来源独家细化) |
| **并发执行** | 工具默认串行 | **ThreadPoolExecutor 并发 + 顺序重排**(本来源独家) |
| **量化数据** | 无 | **95,600 stars / 自创建 skills 40% 提速**(TokenMix) |
| **没有 Loop 会坏什么** | 未涉及 | **每 Loop 都有"会坏什么"**(本来源独家设计鲁棒性视角) |
| **设计哲学** | 主循环克制 / 自进化是叠加 / 避免状态机 / 退出条件先行 | **复利效应 / 时间尺度差异化 / 预算分层 / 4 类 taxonomy checklist** |

### 与其他 Hermes 实体的关系

- **Memory Loop** 与 [Hermes Agent Memory System Architecture](../ch03/090-hermes-agent.html) 直接对应 — Hermes 记忆系统
- **Skill Loop** 与 [Hermes Skill System](../ch07/017-hermes-skill.html) 直接对应 — Hermes 技能系统
- **Reflection Loop** 与 [Hermes Self Improving Loop Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md) 直接对应 — Hermes 自进化
- **Orchestration Loop** 与 [Hermes Agent Operator上手 把一个 Agent 养成可运营系统 若飞](../ch03/090-hermes-agent.html) 互补 — Loop 视角 vs Operator 视角
- **Core Loop / Ralph Loop** 与 [Hermes Agent Loop Architecture](ch04/231-hermes-agent-loop.html) 直接对应 — 主循环概念
- **Core Loop 9 步** 与 [Hermes Agent Goal And Kanban](ch04/351-hermes-agent-goal.html) 的 `/goal` + kanban 集成直接对应 — 同一架构的两种视角

### 关键独到判断

- **8 Loop 复利是 Hermes 与其他 agent framework 的本质差距**: 单 Loop 看不出价值,8 Loop 叠在一起形成复利
- **FlowZap 4 类 taxonomy 是业界首个系统化 Loop 分类法**: Retry/Reflection/Memory/Skill 是 Loop 设计的"自然认知映射"
- **Core Loop 9 步补全 winty 5 阶段**: 更具体到每步代码定位(`prompt_builder.py` / compression 检查 / prompt caching markers 等)
- **迭代预算三层分层**: session 90 / subagent 50 / Ralph 20 — 三层独立预算,互不干扰(对比 [Hermes Agent Loop Architecture](ch04/231-hermes-agent-loop.html) 早期版本 25/50 轮简化)
- **可中断 API call 是工程底线**: interrupt event + 放弃 API 线程 — 比 winty 早期版本"用户打断处理"更精细
- **40% 提速是 Loop 复利的可量化证据**: TokenMix benchmark 是 Loop 系统价值的"客观度量",其他 framework 应学这种度量

### 实践启示

- **复利效应是 Loop 系统的设计目标**: 不应只看单 Loop 价值,要问"它如何让其他 Loop 更有效"
- **时间尺度差异化**: Loop 应在不同时间尺度运行(毫秒/分钟/小时/天/周),避免所有决策挤在同一尺度
- **预算分层**: 不同 Loop 给独立预算(session/subagent/Ralph),防止一个 Loop 占用全部 token
- **可中断性是基础设施**: Core Loop 的可中断 API call 是"用户友好性"的工程底线
- **4 类 taxonomy 是设计 checklist**: Retry/Reflection/Memory/Skill + Orchestration,任何一个缺失都是能力短板
- **复利需要测量**: TokenMix 40% 提速是 Loop 复利效应的"可量化证据",应作为 Loop 系统的标准度量

→ 与 [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-8-loops-compound-interest-yanxbt-2026-06-12.md) 互补阅读 — 本篇是 Hermes 8 Loop 的"完整分解"

---

