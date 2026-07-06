---
title: 生产级 Harness 的 12 大组件以及主流框架对比
source_url: https://mp.weixin.qq.com/s/UwG0mEzQ0Mk7DYjPS3PFqQ
publish_date: 2026-05-12
tags: [wechat, article, claude, openai, agent, harness, multi-agent, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 1eed9391d44bc689d953e979bc7f87d7c39ac0c075685c5896022a21db44503e
---
# 生产级 Harness 的 12 大组件以及主流框架对比
> **来源**: AI技术立文 公众号 | 2026-04-13
很多人做 Agent，卡住以后第一反应是模型不够强。大多数生产问题，真正出错的地方都在模型外面那层 harness。Harness 是一整套运行时基础设施：orchestration loop、tools、memory、context management、state persistence、error handling、guardrails，以及验证闭环。
## 1. 为什么问题通常不在模型
Demo 级 chatbot 没问题，但一进入生产环境：模型忘掉三步之前做了什么，tool call 失败了没人知道，上下文窗口被噪声塞满。
**关键证据**: LangChain 只调整 LLM 外层的 infrastructure，不改模型权重，TerminalBench 2.0 排名从 30 名外跳到第 5。还有研究项目让 LLM 反过来优化基础设施本身，通过率超过人工设计系统。
## 2. 什么是 Agent Harness
### 2.1 不只是 prompt 外壳，更是一整套运行时
Anthropic 在 Claude Code 文档里把 SDK 叫成"驱动 Claude Code 的 agent harness"。OpenAI 的 Codex 团队也把 "agent" 和 "harness" 放进同一个语境，指的都是那套让模型真正可用的非模型基础设施。
LangChain 的 Vivek Trivedy: "If you're not the model, you're the harness."
### 2.2 Agent 是行为，Harness 是产出这种行为的机械结构
"Agent" 是用户看到的那层行为：有目标，会调用工具，能自我修正。"Harness" 是后面的机械结构：循环怎么跑、工具怎么注册、上下文怎么裁剪、状态怎么保存、权限怎么校验、失败后怎么恢复。
### 2.3 把它理解成操作系统
原始 LLM 像一颗 CPU，没有 RAM、没有磁盘、没有 I/O。上下文窗口 = RAM，速度快的容量有限；外部数据库 = 磁盘，容量大但访问慢；工具集成 = 设备驱动；harness = 操作系统。
**三层同心圆工程**: Prompt engineering（写清楚指令）→ Context engineering（决定什么时刻看到什么信息）→ Harness engineering（前两者 + tools/state/error recovery/safety/lifecycle）
## 3. 生产级 Harness 的 12 个组件
### 3.1 编排循环（Orchestration Loop）
系统的心跳。常见形态：Thought-Action-Observation（ReAct loop）。执行顺序：组装 prompt → 调模型 → 解析输出 → 执行 tool call → 结果塞回上下文 → 继续直到结束。麻烦不在循环本身，在循环里要管的所有东西。
### 3.2 工具系统（Tools）
工具以 schema 形式注入上下文（名称、描述、参数类型）。真正的麻烦在运行时细节：注册、校验、参数提取、沙箱执行、结果采集、格式化。Claude Code 覆盖文件操作/搜索/执行/Web 访问/代码智能/sub-agent。OpenAI Agents SDK 区分 function tools、hosted tools、MCP server tools。
### 3.3 记忆系统（Memory）
短期记忆 = 当前会话历史。长期记忆跨会话保留（项目文件、结构化 store、数据库 session）。Claude Code 三层结构：轻量索引（始终加载）→ 主题文件（按需拉入）→ 原始记录（搜索时触达）。
**设计原则**: Agent 对自己的记忆只能当成提示，不能当成事实。执行前回到真实状态再核对。
### 3.4 上下文管理（Context Management）
很多 Agent 失灵不是能力不够，而是上下文乱了。"Lost in the Middle" — 中间位置的信息容易被忽略。
四种处理办法：
- 压缩（compaction）：会话过长时压成高密度摘要
- 观察遮罩（observation masking）：旧 tool output 隐掉
- 即时检索（just-in-time retrieval）：轻量索引 + 局部读取
- 子 Agent 委派：子 Agent 只返回 1000-2000 token 浓缩结果
### 3.5 Prompt 组装（Prompt Assembly）
分层栈：system prompt → tool definitions → memory files → conversation history → current user message。
OpenAI Codex 优先级：服务端 system message 最高 → 工具定义 → developer instructions → 级联指令文件 → 会话历史。
### 3.6 输出解析与结构化返回（Output Parsing）
现代 harness 依赖 native tool calling。判断逻辑：有 tool_calls → 执行并继续；没有 → 当前输出为最终答案。
### 3.7 状态持久化与 Checkpoint（State Persistence）
LangGraph：状态建模为带类型字典，图节点间流转，关键边界打 checkpoint。OpenAI：应用层 memory / SDK session / 服务端 conversation / response chaining。Claude Code：git commit 当 checkpoint，进度文件当结构化 scratchpad。
### 3.8 错误恢复与重试（Error Handling）
10 步流程，每步 99% 成功率 → 端到端仅 ~90.4%。错误需被设计为系统能力。
四类错误：瞬时错误（重试+退避）→ LLM 可恢复错误（回传 tool message 让模型修正）→ 用户可修复错误（中断请求人工）→ 非预期错误（向上抛出）。
### 3.9 权限与 Guardrails（Permissions and Safety）
模型负责"想做什么"，工具系统负责"允不允许做"。Claude Code 三层：项目加载时建立信任边界 → 每次 tool call 前权限检查 → 高风险操作触发人类确认。
### 3.10 验证闭环（Verification Loop）
生产级 vs 玩具 demo 的分界线。三类：规则型反馈（tests/linters/type checkers）+ 视觉型反馈（Playwright 截图检查 UI）+ LLM-as-judge。Claude Code：好的验证路径质量提升 2-3 倍。
### 3.11 Sub-agent 与执行模型（Execution Models）
Claude Code 三种：Fork（上下文字节级复制）→ Teammate（单独终端，文件/消息通信）→ Worktree（独立 git worktree）。OpenAI：specialist agent 当工具调用 / handoff。LangGraph：嵌套状态图。
### 3.12 终止条件与生命周期（Termination and Lifecycle）
常见条件：没有 tool call / 最大轮次超限 / token budget 耗尽 / tripwire 触发 / 用户主动中断 / 安全拒答返回。
## 4. 一次完整循环
### 4.1 七个步骤
1. Prompt Assembly — 拼装 system + tool schema + memory + history + 用户消息（重要信息放开头和结尾）
2. LLM Inference — 模型返回文本/tool call/两者
3. Output Classification — 只有文本无 tool call → 结束；有 tool call → 执行；handoff → 切换 agent
4. Tool Execution — 校验参数 → 检查权限 → 沙箱执行 → 采集结果（只读并行，改写串行）
5. Result Packaging — 结果包装为模型能读的 observation
6. Context Update — 追加历史，快到上限触发 compaction
7. Loop — 下一轮
### 4.2 文件系统纳入 Harness
长期协作角色：初始化 Agent 准备环境 → 落初始进度文件 → 第一次提交；后续 Coding Agent 每次读 git log + progress file → 选最高优先级任务执行。文件系统成为跨上下文窗口的连续性载体。
## 5. 主流框架对比
**Anthropic (Claude Agent SDK)**: 薄 Harness，核心入口 query()，底层 agentic loop 用 async iterator 持续流出消息。Gather-Act-Verify 三步循环。
**OpenAI (Agents SDK + Codex)**: Code-first，Runner 核心。三层拆分：Codex Core（agent code + runtime）→ App Server（双向 JSON-RPC API）→ Client Surfaces（CLI / VS Code / Web）。三层共用同一套 harness。
**LangGraph / LangChain**: 显式状态图，llm_call + tool_node 条件边。早期 AgentExecutor 已弃用。新的 Deep Agents 直接描述为 agent harness，内建 tools/planning/context management/subagent spawning/persistent memory。
**CrewAI / AutoGen**: 多 Agent 协作第一公民。CrewAI 拆 Agent / Task / Crew 对象。AutoGen 对话驱动编排，支持顺序/并发/group chat/handoff/manager-ledger。
## 6. 脚手架隐喻
### 6.1 好的 Harness 应该随模型增强而变薄
有团队半年重写系统五次，每重写一次都在删复杂度：复杂工具定义 → 通用 shell execution，"management agents" → 直接 structured handoff。
### 6.2 模型和 Harness 已经开始共同进化
模型在后训练阶段带着特定 harness 一起学出来。工具实现一改，性能可能就掉。**Future-proofing test**: 换上更强模型时，harness 不继续变厚就能自然变好 → 设计健全。
## 7. 每个 Harness 架构师的 7 个选择
1. **单 Agent vs Multi-Agent**: 先把单 Agent 做到极限（Anthropic/OpenAI 一致建议）
2. **ReAct vs Plan-and-Execute**: Plan-Execute 快 3.6x
3. **上下文窗口管理**: 定时清空/会话摘要/observation masking/结构化笔记/sub-agent delegation
4. **验证闭环**: 计算型（tests/linters）+ 推断型（LLM-as-judge）一起上
5. **权限松紧**: 开发沙箱/个人环境/生产系统默认策略完全不同
6. **工具暴露**: 按步骤懒加载，只暴露最小必要工具集
7. **Harness 厚度**: 薄（Anthropic 赌模型变强）vs 显式控制（图式框架）
## 8. 作者的结论
两套产品用同一个模型，表现可能差很多。差距不在权重，在 harness。Harness 远没到"已经做成标准件"的阶段。上下文要当稀缺资源管，verification loop 要在失败放大前拦住问题，memory system 给连续性但别制造幻觉。**模型会继续变强，harness 会慢慢变薄，但这层东西不会消失**。