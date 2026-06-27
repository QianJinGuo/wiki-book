# Claude Code 源码拆解：从启动到多 Agent 扩展层

## Ch01.253 Claude Code 源码拆解：从启动到多 Agent 扩展层

> 📊 Level ⭐⭐ | 14.9KB | `entities/claude-code-source-architecture.md`

## 八大模块
1. **入口三段式**：分流→进程初始化→会话准备，进程/交互状态分离
2. **REPL 控制台**：不是消息展示器，而是汇总能力面+归并事件流的运行时控制面
3. **Query Loop 状态机**：prefetch→budget→compact→stream→tool→write-back 闭环，维护跨迭代状态
4. **Tool Runtime**：四段式执行（解析→校验→权限→执行），横切问题（校验/并发/错误/回填）收敛统一
5. **Permission System**：四层权限模型（规则→运行时判定→交互→沙箱隔离），可解释的执行链
6. **Task Runtime**：统一任务抽象（pendingMessages/isBackgrounded/retain），子Agent先任务后智能体
7. **扩展层**：MCP/Skills/Plugins统一翻译为内部对象，外部动态/内部稳定
8. **总架构**：三条主干链路（控制链/执行链/任务链）+扩展层

## 核心架构原则
- **复杂度分层**：边界→启动层，连续运行→Query Loop，行动协议→Tool Runtime，风险治理→Permission，长时执行→Task Runtime，平台增长→扩展层
- **三条主干链路**：控制链（定边界+推理）、执行链（Tool→Permission→sandbox→副作用）、任务链（后台/子Agent/远程统一生命周期）
- **外部可以热闹，内部必须收敛**

## 关键设计对比
| 模块 | 常见错误 | Claude Code 做法 |
|------|---------|----------------|
| 启动层 | 一个大main拉起全世界 | 三段式分流，复杂度前置 |
| REPL | 薄输入框+消息列表 | 运行时控制台，能力面汇总 |
| Query Loop | 单次模型调用 | 状态机，跨迭代状态维护 |
| Tool Runtime | 简单函数签名 | 带schema/校验/权限/并发/回填的受控协议 |
| Permission | 弹窗机制 | 四层可解释执行链+沙箱隔离 |
| 多Agent | prompt分工 | 统一任务抽象，生命周期管理 |

## 相关维度的深度分析
- **Claude Code Prompt Context Harness**（飞樰）侧重 Prompt 模块化/Harness 安全/多 Agent 体系
- **[Claude Code Agent Engineering](/ch04-015-claude-code-的-agent-工程/)**（SooKool）侧重 StreamingToolExecutor/主循环/压缩/小模型/Hook
- **Openclaw Architecture**（800行轻量架构）与 Claude Code 同体系但更精简
- **Agent Skill Writing** Skill 编写规范对应 Fat Skills 理念
- **[Hermes Agent](/ch04-418-hermes-agent/)** Hermes 的 Self-Evolving 与 Claude Code 架构的关系

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](/ch07-006-claude-code-skills-mcp-rules-source-analysis/)
- Claude Code Prompt 提示词体系源码解析
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](/ch09-069-claude-code-接入自建开源模型-企业私有化与降本实践-亚马逊aws官方博客/)
- [Claude Code 设计原则与对照分析](/ch01-403-claude-code-设计原则与对照分析/)
- [Claude Code 架构解析](/ch01-571-claude-code-架构解析/)
- [Claude Code 源码深度解析（13 核心机制）](/ch01-231-claude-code-源码深度解析-13-核心机制/)
- [Boris Cherny — 从 IDE 到 Agent 控制台](/ch03-069-boris-cherny-从-ide-到-agent-控制台/)
- Agent 与后端统一架构
- [Claude Code 架构深度分析](/ch01-846-claude-code-架构深度解析/)
- [从多智能体编排到AI自主决策：资损防控体系的架构演进](/ch01-305-从多智能体编排到ai自主决策-资损防控体系的架构演进/)
- [Hermes-Agent Kanban 实测 — 商业 CLI 作为上层 Orchestrator](/ch01-399-hermes-agent-kanban-实测-商业-cli-作为上层-orchestrator/)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](/ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件/)
- [Claude Code 架构深度解析](/ch01-846-claude-code-架构深度解析/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-367-claude-code-harness-deep-understanding/)
- Agent Memory System 设计指南
- [Agent Harness 架构](/ch04-207-agent-harness-架构/)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](/ch04-084-anthropic-官方技能最佳实践-14-个可复用的-agent-skills-设计模式/)
- [基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](/ch01-328-imclaw-通过微信-飞书操控claudecode-codex-geminicli-pi-agent蜂群/)
- [Claude Code 源码核心机制详解](/ch01-162-claude-code-源码核心机制详解/)
- [Claude Code MCP Server](/ch07-024-claude-code-mcp-server/)
- 200人销售团队企业级 Agent 知识库问答系统架构设计
- [Agent 上下文窗口管理对比](/ch04-149-agent-上下文窗口管理对比/)
- Agent Memory 系统性框架
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-086-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-126-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](/ch01-375-claude-发布官方报告-承认存在-3-处质量退化问题/)

- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)
- [Harness如何支撑Agent在生产环境稳定运行？](/ch04-127-harness如何支撑agent在生产环境稳定运行/)
- [Agent架构关键变化：Harness正在成为新后端](/ch04-027-agent架构关键变化-harness正在成为新后端/)
- [claude-code-7-layer-memory-architecture](/ch01-857-claude-code-7-layer-memory-architecture/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)

- MOC
## 深度分析
### 为什么复杂度必须安放在正确的位置
Claude Code 最大的架构张力在于：它要同时支持本地交互、headless、SDK、remote session、后台任务、会话恢复。如果这些都堆在一个 main 函数里，或者靠 prompt 里的人肉兜底，系统一复杂必然散架。
无岳的核心论点是：**复杂度有它该待的位置，不是哪里方便塞哪里**。
启动层的复杂度（进程状态 vs 交互状态分离）→ 交给三段式启动提前定型
连续运行阶段的复杂度（上下文治理/失败恢复/工具回灌）→ 交给 Query Loop 状态机
工具副作用的复杂度（校验/并发/错误/回填）→ 交给 Tool Runtime 四段式
权限判定复杂度（规则/运行时/交互/沙箱隔离）→ 交给 Permission System 四层模型
多 Agent 的复杂度（状态管理/进度观察/结果回流/上下文隔离）→ 交给统一 Task 抽象
这本质上是**关注点分离（Separation of Concerns）**在 Agent 系统里的具体实现。每个模块只管自己那一层，不跨层越俎代庖。

### 三条链路的分层价值
控制链（启动层 → REPL → Query Loop）解决的是"怎么想、怎么续跑"。它定义了系统的边界、制度、连续运行时的状态维护。
执行链（Tool Runtime → Permission Decision → sandbox → 副作用）解决的是"怎么动、怎么受约束"。它把"模型想动"变成"在受控边界内真正执行"。
任务链（Task Runtime）解决的是"怎么并发、怎么持续、怎么回流"。它让后台任务、子 Agent、远程执行都共享同一套生命周期管理，不需要为每种场景重新发明状态管理。
扩展层（ MCP/Skills/Plugins）不是第四条孤立的链路，而是给三条主链注入能力，但坚持"外部可以热闹，内部必须收敛"——外部来源统一翻译成内部对象，系统内部只说同一种语言。

### REPL 不是视图组件
大多数 Agent 系统的 UI 就是"消息列表 + 输入框"。Claude Code 的 REPL 被设计成**运行时控制台**，负责两件事：汇总当前能力面（本地 tools + MCP tools + plugin commands + 动态 skills + 任务状态 + 权限确认队列 + 远程会话信息）和归并当前事件流（assistant message + tool progress + pending permission + task notification + API error）。
这个设计让用户能看到系统正在执行什么、为什么停下来、当前有哪些能力、后台有哪些任务，而不只是被动接收消息。

### 子 Agent 先是任务对象，才是智能体
Claude Code 的 Task 统一表达了：主会话后台化、本地 subagent、in-process teammate、remote agent、任务通知/状态/输出/恢复。
关键洞察是：**子 Agent 先是任务对象，才是智能体**。前后台差别被降为调度与可见性差异，而不是两套世界观。这让多 Agent 没有把主会话撕裂，而是 task system 的自然外延。

### 坏路径的显式设计
大多数 Agent 系统只设计happy path，遇到 prompt-too-long、max_output_tokens、fallback model 这些情况就靠 prompt 里加 if-else 兜底。Claude Code 把这些坏路径全部显式设计了 runtime 路径——上下文治理、失败恢复、工具回灌都是 runtime 课题，不是 prompt 技巧。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-source-architecture.md)

## 实践启示
1. **先定义执行边界，再发起第一轮推理**：启动层不把模式/边界/权限/上下文装配清楚，后面每个宿主都会偷偷长出自己的运行语义。三段式启动（入口分流 → 进程级初始化 → 会话级准备）值得借鉴。
2. **当 Agent 进入连续运行阶段，Query Loop 必须升级成状态机**：不是单次模型调用，而是 prefetch → budget → compact → stream → tool → write-back 的闭环，维护跨迭代状态（messages、toolUseContext、maxOutputTokensOverride、autoCompactTracking 等）。
3. **工具一旦开始碰副作用，工具层就必须制度化**：四段式执行（解析 → 校验 → 权限 → 执行）统一处理参数校验、并发治理、进度上报、错误归一化、结果回填。Tool Runtime 是"把自由发挥变成可交付动作"的那一层。
4. **权限系统的核心不是确认框，而是可解释的执行链**：四层权限模型（规则 → 运行时判定 → 交互 → 沙箱隔离）加上结构化的 PermissionDecision 对象（allow/ask/deny），让权限决策可追溯、可干预。
5. **多 Agent 的前提不是 prompt 分工，而是统一任务抽象**：把后台任务、子任务、远程执行统一到一张任务状态表上，子 Agent 先是任务对象（pendingMessages/isBackgrounded/retain），才是智能体。
6. **外部可以热闹，内部必须收敛**：MCP/Skills/Plugins 统一翻译成内部对象，系统内部只说同一种语言，不让扩展来源导致内部对象模型爆炸。
7. **REPL 是运行时控制台，不是消息展示器**：汇总能力面 + 归并事件流，让用户看到系统正在执行什么、为什么停下来、当前有哪些能力、后台有哪些任务。
8. **坏路径需要显式设计**：上下文治理（snip → microcompact → collapse → autocompact）、失败恢复（reactive compact、max output recovery、fallback model）、工具回灌都要有 runtime 路径，不能只靠 prompt 兜底。

---

