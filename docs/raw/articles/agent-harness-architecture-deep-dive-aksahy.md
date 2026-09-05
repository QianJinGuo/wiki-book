---
title: Agent Harness 解析：智能体架构深度拆解
source_url: https://mp.weixin.qq.com/s/H8_U4vENXJuiojXtXbCF5w
publish_date: 2026-05-11
tags: [wechat, article, claude, openai, agent, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: eba16f2c8dc5ec7c1522304462e530f4c514ad1d96e4555c3ccff987be8c03a5
---
# Agent Harness 解析：智能体架构深度拆解
> 本文存档自 https://mp.weixin.qq.com/s/H8_U4vENXJuiojXtXbCF5w
> 作者：Akshay Pachaar (via AI寒武纪)，2026-05-11
> 译者/平台：AI寒武纪
## 什么是 Agent Harness
Harness 是包裹 LLM 的完整软件基础设施：编排循环、工具、记忆、上下文管理、状态持久化、错误处理、安全护栏。这个概概念在 2026 年初被正式命名，但早已存在。
Anthropic 在 Claude Code 文档中直接写明：SDK 就是"驱动 Claude Code 的 agent harness"。OpenAI 的 Codex 团队也用同样的框架，把"agent"和"harness"视为等价概念。
LangChain 的 Vivek Trivedy："如果你不是模型本身，你就是 harness。"
关键区分：**agent 是涌现出来的行为**（有目标、会用工具、能自我纠正的实体），**harness 是产生这种行为的机器**。
Beren Millidge（2023）的类比：裸 LLM = 没有内存、没有硬盘、没有 I/O 的 CPU。上下文窗口 = 内存（快但有限），外部数据库 = 硬盘（大但慢），工具集成 = 设备驱动，Harness = 操作系统。"我们重新发明了冯·诺依曼架构，因为这是任何计算系统的自然抽象。"
## 三个工程层级
1. **Prompt Engineering** — 设计模型接收的指令
2. **Context Engineering** — 管理模型看到什么、什么时候看到
3. **Harness Engineering** — 前两者 + 完整应用基础设施：工具编排、状态持久化、错误恢复、验证循环、安全执行、生命周期管理
## 生产级 Harness 的 12 个组件
### 1. 编排循环
TAO/ReAct 循环：组装提示词 → 调用 LLM → 解析输出 → 执行工具调用 → 结果反馈 → 重复。Anthropic 描述为"笨循环"（dumb loop）——所有智能在模型里，Harness 只管理轮次。
### 2. 工具
以 schema 定义（名称、描述、参数类型）。Claude Code 提供六类：文件操作、搜索、执行、网络访问、代码智能、子 agent 生成。OpenAI Agents SDK 支持函数工具（@function_tool）、托管工具（WebSearch/CodeInterpreter/FileSearch）、MCP 服务器工具。
### 3. 记忆
短期：单次会话内的对话历史。长期：跨会话持久化。Claude Code 三层：轻量索引（~150 字符/条）、按需拉取的详细主题文件、仅通过搜索访问的原始记录。关键原则：agent 把自己的记忆视为"提示"，行动前对照实际状态验证。
### 4. 上下文管理
核心问题：上下文腐烂——关键内容落在窗口中间时性能下降 30%+（斯坦福"迷失在中间"论文）。策略：压缩（保留架构决策和未修复 bug，丢弃冗余工具输出）/ 观察屏蔽（隐藏旧工具输出，保留调用可见）/ 即时检索（grep/glob/head 而非加载完整文件）/ 子 agent 委托（返回 1000-2000 token 摘要）。
### 5. 提示词构建
分层组装：系统提示 → 工具定义 → 记忆文件 → 对话历史 → 当前用户消息。Codex 使用严格优先级栈：服务器控制系统消息（最高）→ 工具定义 → 开发者指令 → 用户指令（级联 AGENTS.md，32 KiB 上限）→ 对话历史。
### 6. 输出解析
原生工具调用优先。检查：有 tool_call → 执行循环；无 → 最终答案。
### 7. 状态管理
LangGraph：流经图节点的 typed dictionary，checkpoint 在超步边界触发。OpenAI：四种互斥策略（应用内存 / SDK session / Conversations API / previous_response_id 链接）。Claude Code：git commit = checkpoint，进度文件 = scratchpad。
### 8. 错误处理
每步成功率 99% 的 10 步流程，端到端成功率约 90.4%。LangGraph 四类错误：瞬时（带退避重试）/ LLM 可恢复（错误作为 ToolMessage 返回）/ 用户可修复（中断请求人工输入）/ 意外（向上冒泡调试）。Stripe 上限 2 次重试。
### 9. 护栏与安全
OpenAI 三层：输入护栏 / 输出护栏 / 工具护栏（每步运行）。"断路器"机制即时停止 agent。Anthropic：权限执行与模型推理分离——模型决定尝试什么，工具系统决定允许什么。Claude Code 独立门控约 40 个工具能力，三阶段：信任建立 / 权限检查 / 用户确认。
### 10. 验证循环
Anthropic 推荐三种：基于规则（测试/lint/类型检查）/ 视觉（Playwright 截图）/ LLM as judge。Claude Code 创建者 Boris Cherny：给模型验证自身工作的方式能提升质量 2-3 倍。
### 11. 子 Agent 编排
Claude Code 三种执行模型：Fork（字节级复制）/ Teammate（文件邮箱通信）/ Worktree（独立 git 分支）。OpenAI SDK：agent 作为工具、移交模式。LangGraph：嵌套状态图。
### 12. 循环 7 步
提示词组装 → LLM 推断 → 输出分类 → 工具执行 → 结果打包 → 上下文更新 → 循环
终止条件：无工具调用响应 / 超过最大轮次 / token 预算耗尽 / 护栏触发 / 用户中断 / 安全拒绝。
**Ralph Loop**（Anthropic 长时间运行）：初始化 agent 建立环境；后续各会话的编码 agent 读取 git 日志和进度文件定位自身，选择最高优先级未完成功能，完成后提交并写入摘要。
## 主流框架实现
| 框架 | 核心模式 |
|------|----------|
| **Anthropic Claude SDK** | 单 query() 函数，"笨循环"，Gather-Act-Verify |
| **OpenAI Agents SDK + Codex** | Runner 类，三层（Core/App Server/Client） |
| **LangGraph** | 显式状态图，llm_call + tool_node 条件边 |
| **CrewAI** | Agent（角色+目标+背景故事+工具）/ Task / Crew 分层 |
| **AutoGen（→微软 Agent Framework）** | 对话驱动，5 种编排模式 |
## 7 个设计决策
1. **单 agent vs 多 agent** — 先单再考虑多。工具 >10 个重叠或存在独立任务域时才拆分。
2. **ReAct vs Plan-Execute** — LLMCompiler 报告快 3.6x。
3. **上下文窗口策略** — ACON：保留推理轨迹、降 26-54% token、保 95%+ 准确率。
4. **验证循环** — guides（事前引导）+ sensors（事后观察），Martin Fowler Thoughtworks。
5. **权限架构** — 宽松（效率）vs 限制（安全）。
6. **工具范围** — 砍 80% 工具往往更好。Vercel 从 v0 砍了 80%；Claude Code lazy loading 削 95% 上下文。
7. **Harness 厚度** — 多少逻辑在 harness 里 vs 交给模型。Anthropic 薄 harness；图框架厚。方向：模型改进 → harness 减复杂度。
## 关键洞察
- **脚手架类比**：建筑完工后拆除。Manus 6 个月重写 5 次，每次在去除复杂性。
- **共进化原则**：模型与特定 Harness 一起在后训练中训练。改变工具实现可能降性能。
- **面向未来测试**：模型能力提升时如 harness 复杂度不增 → 设计健全。
- **Harness 就是产品**：相同模型 + 不同 harness = 截然不同性能（TerminalBench：只改 harness 跳 20+ 位次）。
- **趋势**：Harness 不会消失。即使最强模型也需要管理上下文、执行工具、持久化状态、验证工作。