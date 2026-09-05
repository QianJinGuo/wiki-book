---
title: Claude Code 源码拆解：从启动到多 Agent 扩展层
source_url: https://mp.weixin.qq.com/s/VHVZV0rrCxYkbrxjuQzIAQ
publish_date: 2026-04-25
tags: [wechat, article, claude, agent, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: f2ae9beb64203f94879d30c34698f68585529388a9c04b6b1b64c990ad654a7b
---

## 二、REPL / UI Orchestration
### 核心矛盾
一旦 Agent 开始执行工具、弹权限、跑后台任务、动态接入扩展，UI 不再是"如何显示回复"，而是"如何把复杂 runtime 变成用户可操作、可理解、可干预的系统"。
### 解法
REPL 负责两件大事：
1. **汇总当前能力面**：本地 tools + MCP tools + plugin commands + 动态 skills + 任务状态 + 权限确认队列 + 远程会话信息
2. **归并当前事件流**：assistant message + tool progress + pending permission + task notification + API error
REPL 不是 view component，而是**运行时控制台**。用户提交输入时，REPL 先把"这一轮在什么制度下运行"打包清楚，再交给 query loop。
### 为什么好
- 用户能看到系统正在执行什么、为什么停下来、当前有哪些能力、后台有哪些任务
- UI 消费统一事件协议，query/permission/tool runtime/task system 都通过结构化事件和 REPL 协作
---
## 三、Query Loop / QueryEngine
### 核心矛盾
长上下文劣化、工具调用打断推理、模型输出截断、失败后要不要恢复、工具结果怎样回灌下一轮——这些问题如果还被当成"模型调用细节"，系统在复杂场景里会迅速失稳。
### 状态机设计
Claude Code 维护一组**跨迭代状态**：
- messages、toolUseContext、maxOutputTokensOverride
- autoCompactTracking、maxOutputTokensRecoveryCount
- hasAttemptedReactiveCompact、turnCount、pendingToolUseSummary、transition
### 主循环骨架
```python
while (true):
    prefetchMemoryAndSkills()
    messagesForQuery = applyBudget(messages)
    messagesForQuery = snipAndCompact(messagesForQuery)
    assistant = streamModel(messagesForQuery)
    if (!assistant.hasToolUse): return finishTurn(assistant)
    toolResult = runToolUse(assistant.toolUse, toolUseContext)
    state.messages = writeBack(messages, assistant, toolResult)
```
### 四类运行时机制
Claude Code 把本来容易散落的逻辑全部拉回主循环正中央：
- **长上下文治理**：snip → microcompact → collapse → autocompact
- **失败恢复**：reactive compact、max output recovery、fallback model
- **工具回灌**：工具结果标准化为 user message，回灌到主消息流
- **预取隐藏**：memory prefetch 和 skill discovery 藏在流式输出和工具执行空隙
### 为什么好
- 上下文治理/失败恢复/工具回灌都是 runtime 课题，不是 prompt 技巧
- 坏路径被显式设计（prompt-too-long、max_output_tokens、fallback model 都有 runtime 路径）
### 我们怎么学
当系统进入连续运行阶段，query loop 就该升级成 runtime 层。把"上下文治理"和"失败恢复"从 prompt 层挪到运行时层。
---
## 四、Tool Runtime
### 核心矛盾
工具碰文件/命令/网络/副作用时，问题不再是"模型会不会调用函数"，而是"这次行动是否合法、能否并发、如何上报进度、失败怎样表达、结果怎样重新喂给模型"。
### 四段式执行
1. 解析真实 tool，做兜底
2. schema 校验和调用前准备
3. 进入 permission 决策，再真正执行
4. 把结果归一化成结构化反馈、进度和附加材料
### 横切问题收敛
Tool Runtime 统一处理：
- 参数校验
- 权限检查
- 并发治理（isConcurrencySafe 区分可并发/必须串行的工具）
- 进度上报
- 错误归一化
- 结果回填
### 流式工具执行
模型还在流式输出时，工具就先开始执行，但通过状态跟踪、结果缓冲、取消管理保证正确性。
### 我们怎么学
先把"校验、授权、结果格式"三件事统一起来。Tool Runtime 是"把自由发挥变成可交付动作"的那一层。
---
## 五、Permission System
### 核心矛盾
Agent 权限问题同时包含四件事：逻辑是否允许、自动化能否消化、用户何时必须参与、执行时进程边界限制在哪。
### 四层权限模型
1. **规则层**：匹配允许/拒绝/待确认，保留来源和理由
2. **运行时判定层**：classifier/hooks/coordinator 尝试自动决策
3. **交互层**：需要用户参与时，再走确认
4. **执行隔离层**：把逻辑权限映射成真实的文件/网络/命令边界
### 关键判断
- auto mode 做危险能力裁剪（剔除过宽的 Bash/PowerShell/agent wildcard）
- 沙箱是 permission 的落地点，不是独立附属物
### 权限决策对象
```typescript
type PermissionDecision =
  | { behavior: 'allow'; updatedInput?; decisionReason? }
  | { behavior: 'ask'; message: string; suggestions?; blockedPath?; pendingClassifierCheck? }
  | { behavior: 'deny'; message: string; decisionReason: string }
```
### 我们怎么学
把权限设计成**可解释的执行链**，而不是弹窗机制。先把权限决策对象化。
---
## 六、Task / 多 Agent / 后台执行
### 核心矛盾
多 Agent 真正难的是：状态怎么管理、进度怎么观察、结果怎么回流、上下文怎么隔离、失败怎么恢复。
### 统一任务抽象
Claude Code 用 Task 统一表达：主会话后台化、本地 subagent、in-process teammate、remote agent、任务通知/状态/输出/恢复。
**子 Agent 先是任务对象，才是智能体。**
### 本地子 Agent 状态
```typescript
type LocalAgentTaskState = {
  agentId: string
  prompt: string
  progress?: AgentProgress
  error?: string
  result?: AgentToolResult
  messages?: Message[]
  isBackgrounded: boolean
  pendingMessages: string[]  // 带邮箱的执行体
  retain: boolean
  diskLoaded: boolean
  evictAfter?: number
}
```
### 为什么好
前后台差别被降为调度与可见性差异，而不是两套世界观。多 Agent 没有把主会话撕裂，而是 task system 的自然外延。
### 我们怎么学
先把后台任务、子任务和远程执行统一到一张任务状态表上。
---
## 七、MCP / Skills / Plugins 扩展层
### 核心矛盾
扩展来源变多时，每多一种来源，主系统就多一套能力模型/权限模型/UI暴露方式，special case 爆炸。
### 外部热闹，内部收敛
Claude Code 坚持"动态能力面，稳定内部对象"：
- MCP prompt → Command，MCP tool → Tool，MCP resource → 资源工具体系
- Skills 是轻量能力声明（allowedTools/whenToUse/model/effort/hooks/executionContext/agent）
- Plugins 是能力组合包（带能力单元/hooks/外部协议接入/语言服务/代理定义/输出风格/设置项）
### Skill 声明对象
```typescript
type SkillDescriptor = {
  description: string
  allowedTools: string[]
  whenToUse?: string
  model?: Model
  effort?: Effort
  hooks?: Hooks
  executionContext?: 'fork'
  agent?: string
}
```
### 扩展层真正高明的地方
不是让系统认识更多外部世界，而是让系统在面对更多外部世界时，**内部仍然只说同一种语言**。
---
## 八、总结与总架构
### 三条主干链路
1. **控制链**：启动层定边界 → REPL 汇总能力面 → Query Loop 推进连续运行
2. **执行链**：Tool Runtime → Permission Decision → sandbox → 副作用（文件/命令/网络）
3. **任务链**：Task Runtime 管生命周期/回流（后台/子Agent/远程执行）
扩展层不是第四条孤立链路，而是给三条主链注入能力，但不把内部对象打散。
### 三种系统问题
- 控制链解决"怎么想、怎么续跑"
- 执行链解决"怎么动、怎么受约束"
- 任务链解决"怎么并发、怎么持续、怎么回流"
### 五条核心带走
1. 先定义执行边界，再发起第一轮推理
2. 当 Agent 进入连续运行阶段，query loop 必须升级成 runtime
3. 工具一旦开始碰副作用，工具层就必须制度化
4. 权限系统的核心不是确认框，而是可解释的执行链
5. 多 Agent 的前提不是 prompt 分工，而是统一任务抽象