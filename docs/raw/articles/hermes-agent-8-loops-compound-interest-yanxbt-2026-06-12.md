---
title: "Hermes Agent 内部的 8 个 Loop,以及它们为什么会形成复利?"
source_url: https://mp.weixin.qq.com/s/bqitaR8wmKYEGpZTSxIr9w
publish_date: 2026-06-12
tags: [wechat, article, hermes-agent, agent-loop, 8-loops, flowzap-taxonomy, retry-loop, reflection-loop, memory-loop, skill-loop, orchestration-loop, ralph-loop, core-agent-loop, prompt-caching, threadingpool, delegation, fractal-design, compound-interest, 烟花星空, yanxbt]
review_value: 9
review_confidence: 9
review_recommendation: ingest
sha256: 6599a1594e1ca4a13a67953ceef76e67323b80c23e4a38dd070046dfe93992b8
---
# Hermes Agent 内部的 8 个 Loop,以及它们为什么会形成复利?

> Source: https://mp.weixin.qq.com/s/bqitaR8wmKYEGpZTSxIr9w
> 原文链接: https://x.com/IBuzovskyi/status/2064377155476193362
> Author: YanXbt (烟花星空 AI)
> Date: 2026-06-12 09:53
> Collected: 2026-06-16

## 一句话总结

**Hermes Agent 在不同时间尺度上同时运行 8 个 Loop**(从毫秒到数周): Core Agent Loop (心跳) / Ralph Loop (goal) / Memory Loop / Skill Loop / Reflection Loop / Orchestration Loop / 等等。每个 Loop 服务不同目的,**彼此互相喂养,形成复利效应**——每跑完一次 session,系统都比之前更强。

## 核心数据

- **Hermes Agent GitHub stars**: 95,600(发布 7 周后,2026 年增长最快 agent framework, TokenMix 2026 年 4 月)
- **自创建 skills 提速**: 自创建 skills 能让研究型任务耗时,相比全新 agent 实例缩短 **40%**
- **核心代码量**: AIAgent 类 15,000+ 行(`run_agent.py`)
- **官方文档验证**: 所有技术细节已对照 hermes-agent.nousresearch.com/docs 验证

## FlowZap 的 4 类 Loop Taxonomy

agent system 里一共存在 4 类基础 loop:

| Loop 类型 | 含义 | 框架实现度 |
|----------|------|-----------|
| **Retry loops** | 失败之后重新跑一遍(最简单) | 大多数 framework 实现 |
| **Reflection loops** | 下一个 pass 开始前,另一个 agent 对输出做评价 | 少数 framework 实现 |
| **Memory loops** | 把一条经验存下来,影响未来的运行 | 极少数 framework 实现 |
| **Skill loops** | 把某个 procedure 编码成技能,从而改变未来的执行方式 | 仅 Hermes 等少数 |

**Hermes 原生支持这 4 类全部能力**,另外**额外支持 orchestration loops**——用来跨 agents、跨时间进行协调。共 **8 个 Loop** 跨时间尺度(毫秒 → 数周)运行。

## 8 个 Loop 详解

### Loop 1: Core Agent Loop(心跳)

- **时间尺度**: 每个 turn 内,毫秒到几分钟
- **位置**: `run_agent.py` (AIAgent 类,15,000+ 行)
- **9 步流程**:
  1. 接收用户消息(或 `/goal` judge 的继续信号)
  2. 追加到 conversation history
  3. 构建或复用缓存的 system prompt(`prompt_builder.py`)
  4. 检查是否需要 compression(>50% context)
  5. 从 history 构建 API messages
  6. 注入临时 prompt layer(预算警告、上下文压力)
  7. 应用 prompt caching markers(Anthropic)
  8. 发起可中断的 API call
  9. 解析 response:
     - 有 tool calls? 执行,追加结果,回到第 5 步
     - 是文本回复? 持久化 session,flush memory,返回

**3 种 API 模式**: Anthropic / OpenAI / 其他(自动收敛到 OpenAI 风格 `role/content/tool_calls`)

**Tool 执行方式**:
- 单个 tool call: 主线程执行
- 多个 tool calls: `ThreadPoolExecutor` 并发执行(完成后按原始顺序重新插入)

**迭代预算**:
- 默认 session 允许 **90 次迭代**(`agent.max_turns`)
- Subagents 独立预算,上限 `delegation.max_iterations`,默认 **50**

**可中断调用**: 后台线程 + interrupt event(用户发新消息 / `/stop` / signal)→ 不会有部分 response 写进 history。

**没有这个 Loop,坏掉什么**: 一切都会坏。这是 kernel。

### Loop 2: Ralph Loop(goal)

- **时间尺度**: 每个 goal 几分钟到几小时
- **命名来源**: Ralph Wiggum
- **灵感来源**: Eric Traut 在 Codex CLI 0.128.0 里的实现(OpenAI)
- **Hermes 实现**: 独立完成,适配进自己的架构

**核心思想**: 让一个 goal 在多个 turn 之间持续活着。每个 turn 结束后,由**辅助 judge model** 判断 done 还是 continue。

**官方文档细节**:
- 迭代上限 20
- 与 kanban 集成:`kanban_create --goal`(CLI)或 dashboard/tool `goal_mode=True`
- kanban worker 在一个 goal loop 里运行
- judge 把卡片 title + body 视为 acceptance criteria

**没有这个 Loop**: agent 只会做完一个 turn 就停下。

### Loop 3-8(摘要,详见原文链接)

- **Memory Loop**: 跨 session 持久化经验,影响未来决策
- **Skill Loop**: 把 procedure 编码为 SKILL.md,改变未来执行方式
- **Reflection Loop**: 输出经另一个 agent 评价后进入下一 pass
- **Orchestration Loop**: 跨 agent 跨时间协调(2 类基础 loop 之外的扩展)
- **Retry Loop**: 失败自动重试(基础能力)
- **Compression Loop**: 上下文压缩(>50% 触发,Loop 1 内部步骤)

## 复利效应理论

**核心洞察**: 每一个 Loop 都会让其他 Loop 更有效。叠在一起形成复利系统:

> "每跑完一次 session,系统都会比之前更强。"

**复利的来源**:
- Memory Loop 把 session 经验沉淀 → Skill Loop 用经验生成 skills → Skill Loop 让下次 session 更高效 → Reflection Loop 评价新 skill 质量
- 自我强化循环:每一次 session 都是同时改进多个 Loop 的机会

## 与 Hermes 现有 Loop 实体的关系

| 视角 | 本篇(烟花星空 AI 8 Loop) | winty 源码解剖 | hermes-agent-loop-architecture 概念 |
|------|------------------------|----------------|----------------------------------|
| **粒度** | 8 个独立 Loop 详细分解 | 5 阶段 + 4 模块抽象 | 5 阶段主循环概念 |
| **时间维度** | 毫秒 → 数周(8 时间尺度) | 单次任务生命周期 | 单次任务生命周期 |
| **核心 Loop 数** | **8**(Core/Ralph/Memory/Skill/Reflection/Orchestration/Retry/Compression) | 1(主循环) | 1(主循环) |
| **理论框架** | FlowZap 4 类 taxonomy + orchestration | 5 阶段调度 | 设计哲学 |
| **复利效应** | **核心金句**(本篇独家) | 未涉及 | 未涉及 |
| **迭代预算** | 90 次 session / 50 次 subagent | 未涉及 | 25/50 轮(早期版本) |
| **Core Loop 步骤** | 9 步详细 | 5 阶段 | 5 阶段 |
| **prompt caching markers** | **Anthropic 集成本篇独家** | 未涉及 | 未涉及 |
| **可中断 API call** | **本篇独家**(interrupt event + 放弃 API 线程) | 未涉及 | 用户打断处理 |
| **ThreadPoolExecutor 并发** | **本篇独家**(结果按原始顺序重新插入) | 未涉及 | 工具默认串行 |

## 关键独到判断

- **8 Loop 复利效应**: 单个 Loop 看不出价值,8 Loop 叠在一起形成复利——这是 Hermes 与其他 agent framework 的本质差距
- **FlowZap 4 类 taxonomy + orchestration**: 业界首个系统化的 Loop 分类法(Hermes 实现 4 类全部 + 1 扩展)
- **Core Loop 9 步细节**: 补全了 winty 源码解剖的 5 阶段(本篇更具体到每步代码定位)
- **迭代预算分层**: session 90 次 / subagent 50 次 / Ralph 20 次——三层独立预算,互不干扰
- **可中断 API call**: interrupt event + 放弃 API 线程——比 winty 早期版本的"用户打断处理"更精细
- **ThreadPoolExecutor 并发 + 顺序重排**: 多 tool 并发但结果按原始顺序插入,既高效又保证语义正确
- **40% 提速数据**: 自创建 skills 让研究型任务耗时缩短 40%(TokenMix benchmark)——是 Loop 复利效应的可量化证据

## 实践启示

- **复利效应是设计目标**: 设计 Loop 时不应只看单 Loop 价值,要问"它如何让其他 Loop 更有效"
- **时间尺度差异化**: Loop 应在不同时间尺度上运行(毫秒 / 分钟 / 小时 / 天 / 周),避免所有决策挤在同一尺度
- **预算分层**: 不同 Loop 给独立预算(session / subagent / Ralph),防止一个 Loop 占用全部 token
- **可中断性是基础设施**: Core Loop 的可中断 API call 是"用户友好性"的工程底线,不能省
- **4 类 taxonomy 是设计 checklist**: Retry / Reflection / Memory / Skill + Orchestration,任何一个缺失都是能力短板
- **复利需要测量**: TokenMix benchmark (40% 提速) 是 Loop 复利效应的"可量化证据",其他 framework 应学这种度量

→ 与 [[entities/hermes-agent-loop-source-code-anatomy|winty 源码解剖]] (第 1 来源) + [[entities/hermes-agent-loop-architecture|Loop 概念]] 互补,本文是 Hermes 8 Loop 的**完整分解**。