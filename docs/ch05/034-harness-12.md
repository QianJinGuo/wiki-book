# 生产级 Harness 的 12 大组件以及主流框架对比

## Ch05.034 生产级 Harness 的 12 大组件以及主流框架对比

> 📊 Level ⭐⭐ | 15.7KB | `entities/production-harness-12-components-framework-comparison.md`

[Production Harness 12 Components Framework Comparison](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-harness-12-components-framework-comparison.md)

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

## 深度分析
### 框架基因决定设计哲学
Anthropic 的薄 Harness 设计反映了一种赌注：随着模型能力提升，需要人工设计的结构会越来越少。这种思路的优势在于简洁，劣势在于调试空间有限。OpenAI 的三层架构则更偏向工程化控制，适合需要深度定制企业场景的团队。LangGraph 的显式状态图对于复杂的多步骤任务有明显优势，但代价是更高的认知负担。

### 多 Agent 协作的现实困境
CrewAI 和 AutoGen 将多 Agent 协作作为第一公民设计，但实际落地面临协调成本高、状态一致性难保证、调试困难等问题。相比之下，Claude Code 的 Fork/Teammate/Worktree 三种执行模型提供了更细粒度的隔离策略，让不同场景可以选择不同开销的方案。

### 验证闭环为何被反复强调
文章指出"好的验证路径质量提升 2-3 倍"，但验证本身引入的复杂度往往被低估。规则型反馈（tests/linters）稳定但覆盖范围有限；LLM-as-judge 灵活但引入新的不确定性；视觉型反馈适合 UI 但不适合底层逻辑。生产系统通常需要三者混合，且验证逻辑本身也需要被验证。

## 实践启示
### 从单 Agent 开始，不要过度设计
Anthropic 和 OpenAI 都建议先把单 Agent 做到极限。过度设计多 Agent 架构在初期会浪费大量工程资源，而且多 Agent 引入的复杂性会掩盖原本更容易发现的基础设施问题。

### 上下文窗口是核心约束
上下文窗口应该被当作稀缺资源来管理，而不是理所当然的无限空间。会话压缩、observation masking、按需检索、子 Agent 委派这些策略需要在系统设计早期就考虑进去，而不是事后打补丁。

### 错误处理需要系统化设计
10 步流程每步 99% 成功率只有 90.4% 端到端通过率，这个数字应该让每个 Agent 开发者警醒。错误处理不应该是在出问题后的临时修复，而应该是系统设计的一部分——定义清楚错误类型、恢复策略、向上抛出的条件。

### 状态持久化选择影响架构演进
选择 git commit 当 checkpoint（Claude Code）、状态图节点间流转（LangGraph）、还是应用层 memory（OpenAI），会深刻影响后续的架构演进路径。早期选择的持久化策略往往难以更改，需要根据团队对调试能力和状态一致性的需求来权衡。

### 工具暴露需要克制
按步骤懒加载工具、只暴露最小必要工具集，是控制复杂度最有效的手段。工具越多，参数校验、权限管理、出错处理的复杂度指数级上升。在没有看到具体需求之前，不要提前设计工具扩展机制。
## 相关实体
- [Agent Memory Architecture Past Influence Future Ruofei](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-memory-architecture-past-influence-future-ruofei.md)
- [Subagents 详解Claude Code 如何避免上下文污染 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/subagents-详解claude-code-如何避免上下文污染-v2.md)
- [Memory Agent Systems Cobanov](https://github.com/QianJinGuo/wiki/blob/main/entities/memory-agent-systems-cobanov.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering V2](https://github.com/QianJinGuo/wiki/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering-v2.md)
- [Agentscope Java Harness Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework.md)

---

