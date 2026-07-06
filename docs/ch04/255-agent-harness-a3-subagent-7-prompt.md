# Agent Harness 实现对比 A3：SubAgent（7 框架 Prompt 双语对照）

## Ch04.255 Agent Harness 实现对比 A3：SubAgent（7 框架 Prompt 双语对照）

> 📊 Level ⭐⭐ | 9.9KB | `entities/agent-harness-comparison-a3-subagent-2026-06-10.md`

# Agent Harness 实现对比 A3：SubAgent（7 框架 Prompt 双语对照）

## 摘要

Agent Harness 实现对比系列第三篇，聚焦 SubAgent 功能。覆盖 Claude Code（4 种模式）、Codex（Collab/MultiAgentV2/Agent Jobs）、OpenAI Agents SDK（Agent As Tool + Handoff）、OpenCode、Kimi Code（Agent As Tool + AgentSwarm）、OpenClaw、Hermes Agent（delegate_task + Kanban + MoA）共 7 个框架。全篇采用 Prompt 双语对照 + 评论的方式，是 SubAgent 实现差异的系统性参考。

## 深度分析

### 1. 导言：SubAgent 的三个核心目的

SubAgent 与 Agent As Tool、MultiAgent 有交集但概念范围不完全一致。三个核心目的：

1. **应对 Long Context**：将复杂任务拆解为独立 Context Session，降低每个任务的最大 Context Window，同时将 Context 用量范围调整到 LLM 训练阶段更熟悉的范围，抑制模型在 LongContext 场景下的偷懒、作弊问题。SubAgent 本身可视为一种 Context 控制方式（如 Claude Code Fork 模式）。
2. **获取旁观者视角**：不让 Agent Session 自己自省 review，而是让另一个独立 Context Session 检查或讨论。人类有明显旁观者视角优势（以群体方式进化），LLM 虽无强证据但实际使用中能看到效果。
3. **并行加速**：对可拆分并行子任务的任务进行加速，但很看具体任务类型。

### 2. 综述：SubAgent 范式 > 古典 MultiAgent

目前主流 Agent Harness 更多使用 SubAgent/Agent As Tool 而非古典 MultiAgent 的对等 Agent 范式。最标准实现是 Claude Code。Claude Code 从 Opus 4.6 左右开始大量推行 SubAgent。SubAgent 的 session 历史一般独立存储。

### 3. Claude Code：4 种互斥模式

**3.1 非 Fork 模式（默认）**：SubAgent 从零开始，不继承主 session context。5 种 agent type：general-purpose / Explore / Plan / claude-code-guide / statusline-setup。Prompt 强调"像给刚走进房间的聪明同事交代情况"。

**3.2 Fork 模式**：SubAgent 继承当前主 session context。适用场景：需要子 agent 基于已有上下文继续工作，而非从零开始。作者认为这是一种"另类的 Context 压缩方式"。

**3.3 Coordinator 模式**：定义 Coordinator + Workers 两层结构，Coordinator 负责任务分解和结果综合，Workers 执行具体子任务。6 段详细 Prompt：角色定义、工具、Workers 列表、任务工作流、撰写 worker prompt 指南、示例会话。

**3.4 Teammate / Agent Swarms 模式**：多 Agent 对等协作，通过信箱消息通讯。

**限制**：Claude Code 不允许 SubAgent 再创建 SubAgent。SubAgent 和 Shell 一样支持前台/后台执行，后台完成后自动通知主 Session。

### 4. Codex：3 种模式

**4.1 Collab 模式（默认）**：类似 Agent As Tool，SubAgent 始终异步。5 个工具：spawn_agent / wait_agent / send_input / close_agent / resume_agent。Prompt 强调"当且仅当用户明确要求时才使用"、"不要委派紧急阻塞工作"、"极其节制地调用 wait_agent"、"并行委派模式"。

**4.2 MultiAgentV2**：默认关闭，与 Collab 互斥。接近 Claude Code Teammate 方式，采用信箱消息通讯。

**4.3 Agent Jobs 批量模式**：使用 CSV 表格数据批量创建一组 Agent，Collab 模式，等待所有任务完成。

**递归**：Codex 支持递归创建 Agent，默认 1 层。

### 5. OpenAI Agents SDK：Agent As Tool + Handoff

**5.1 Agent As Tool**：类似 Claude Code 非 Fork 模式，支持多层递归，内部权限请求层层穿透。Prompt 简单，留给开发者自己调教。

**5.2 Handoff**：不是 SubAgent 能力，而是直接把当前 Agent 的 role/system prompt 替换为另一个，在原有 context 上继续执行。本质是执行由 SubAgent 节点组成的 workflow。限制：无法复用 KV Cache。

### 6. OpenCode

支持 Agent As Tool（Claude Code 非 Fork 模式）。Prompt 强调：尽可能并发启动多个 agent、agent 结果对用户不可见需自行总结、支持 task_id 恢复会话、明确告诉 agent 写代码还是只做调研。还包含 SubAgent Prompt 的生成 Prompt（精英 AI agent 架构师角色，6 步流程：提取核心意图→设计专家人设→架构全面指令→性能优化→创建标识符→示例）。

### 7. Kimi Code：Agent As Tool + AgentSwarm

**7.1 Agent As Tool**：支持前台/后台运行，30 分钟超时。Prompt 强调"不要委托理解"、"优先恢复而非重新启动"、"委托有上下文交接成本"。

**7.2 AgentSwarm**：类似 Codex Agent Jobs 批量模式或 Claude Code 动态 Workflow 单 Step 退化版。支持最多 128 个子 agent 自动排队启动，`prompt_template` + `{{item}}` 占位符。

### 8. OpenClaw

支持 Agent As Tool，允许调用外部 CLI Agent 作为 SubAgent。可选择是否 fork context、是否吃持久性运行 session。支持多层嵌套。SubAgent Prompt 简洁：7 条规则（保持聚焦/完成任务/不主动发起/接受短暂存在/信任 push-based 完成/把子 agent 输出当证据/从截断工具输出恢复）+ 4 条禁止（不与用户对话/不发外部消息/不创建定时任务/不假装主 agent）。

### 9. Hermes Agent：delegate_task + Kanban + MoA

**9.1 delegate_task**：Agent As Tool，默认 1 层嵌套，有专门 orchestrator 角色。关键设计：子 agent 无对话记忆（通过 context 字段传递）、子 agent 总结是自我报告非验证事实（需主 agent 验证外部副作用）、同步运行（父被打断则子被取消）。orchestrator 补充指令：目标分解为 2+ 独立子任务时可并行委派。

**9.2 Kanban**：外部进程的 Agent 调用，生命周期不绑定主 Agent，结果通过消息途径发送给订阅者。

**9.3 Mixture-of-Agents**：同时调用多个不同模型生成回答再综合答案。

### 10. 框架对比总览

| 框架 | 模式 | Fork Context | 递归嵌套 | 批量/并行 | 特色 |
|------|------|-------------|---------|----------|------|
| Claude Code | 4 种（非Fork/Fork/Coordinator/Teammate） | 可选 | 不允许 | — | Coordinator 模式最完整 |
| Codex | 3 种（Collab/MultiAgentV2/Agent Jobs） | 可选 | 1 层 | Agent Jobs CSV 批量 | spawn+wait+send+close+resume 五工具 |
| OpenAI SDK | Agent As Tool + Handoff | — | 多层 | — | Handoff 替换 system prompt |
| OpenCode | Agent As Tool | 否（可 resume） | — | 并发启动 | SubAgent Prompt 生成 Prompt |
| Kimi Code | Agent As Tool + AgentSwarm | 否（可 resume） | — | 128 子 agent | 30min 超时 |
| OpenClaw | Agent As Tool | 可选 | 多层 | — | 外部 CLI Agent 作 SubAgent |
| Hermes | delegate_task + Kanban + MoA | 否（context 字段） | 1 层（可配） | orchestrator | 同步运行 + 自我报告验证 |

## 实践启示

1. **SubAgent 本质是 Context 控制**：Fork 模式可视为另类 Context 压缩，将任务 Context 用量范围调整到模型训练阶段更熟悉的范围。
2. **"不要委托理解"是通用原则**：Claude Code 和 Kimi Code 都强调——如果任务取决于文件路径或行号，主 Agent 应先找到再写进 prompt。
3. **Codex 的"极其节制地调用 wait_agent"值得借鉴**：子 agent 运行时主 Agent 应做有意义的不重叠工作，而非阻塞等待。
4. **Hermes 的"自我报告非验证事实"是重要的安全设计**：子 agent 声称的操作结果需主 agent 独立验证，防止幻觉传播。

## 相关页面

- [JiuwenSwarm Coordination Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/jiuwenswarm-coordination-engineering.md)
- [Claude Code Subagents 上下文卫生](ch04/171-claude-code-subagents.md)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-comparison-a3-subagent-2026-06-10.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

