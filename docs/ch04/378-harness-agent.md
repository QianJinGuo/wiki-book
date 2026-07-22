# Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环

## Ch04.378 Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环

> 📊 Level ⭐⭐ | 7.7KB | `entities/harness-之后-状态边界与失败闭环-若飞.md`

# Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环

## 相关实体

- [how to build an ai-native startup](../ch05/019-ai-native.html)
- [垂类 ai 创企的自救：flashlabs 从 flashintel 到 ai native](../ch05/090-ai.html)
- [latest open artifacts (#19): qwen 3.5, glm 5, minimax 2.5 —](../ch01/715-9.html)
- [perplexity 首次公开了内部 skill 设计指南](ch04/266-skill.html)
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-之后-状态边界与失败闭环-若飞.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)
## 深度分析

Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环 涉及agent领域的核心技术议题。
### 核心观点
1. # Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环
## 太长不看
- Harness Engineering 这轮讨论的价值，是把模型外面的执行环境、工具、上下文、生命周期、可观测、验证和治理，明确看成一个独立系统层（ETCLOVG 七层：Execution / Tooling / Context / Lifecycle / Observability / Verification / Governance）。
2. - 但 Harness 不能只写成组件清单。
3. Agent 真进入工程流程以后，可靠性取决于这些组件能不能形成一套**状态清楚、证据可查、失败可恢复**的运行时闭环。
4. - 长上下文不等于长期状态管理，memory 也不等于治理。
5. 很多失败不是模型不会想，而是系统没有区分候选动作、已验证动作和已提交状态。

### 内容结构
- Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环
- 太长不看
- 一、综述的价值：把模型外的工程层压成一张地图
- 二、组件要咬合：分类 ≠ 闭环
- 三、长任务怕断档：可接手状态 vs 长上下文
- 四、状态要分层：候选 / 已验证 / 已执行 / 已提交
- 五、Trace 要回写：前馈 + 反馈 + 确定性 vs 语义性
- 六、三条分歧

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/616-agentic.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/134-karpathy-vibe-coding-agentic-engineering.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/046-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch11/227-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/227-openclaw.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/116-harness-engineering.html)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

### 补充：State/View/Control 三轴 — 从 ReAct 到 Harness 的事实协议（vivo 2026-07-22）

vivo 互联网团队（Ding Junjie）从产品工程视角补充了 Harness 中状态边界的具体实现模式：**将 Agent 系统拆为 State/View/Control 三轴，通过 State Schema First 设计原则提前锁定事实归属**。

#### State/View/Control 三轴

| 层级 | 定义 | 示例 | 生产者 |
|------|------|------|--------|
| **state**（事实） | 影响可恢复、可控制、可追溯的运行事实 | messages, activeRun, checkpoint, pendingApproval, todos, subagents, artifactRefs | runtime |
| **view**（派生） | 从 state 计算出的展示状态 | isBusy, canStop, approvalBanner, toolBadges | runtime→frontend 派生 |
| **control**（命令） | 修改 state 的指令 | invoke, resume, stop, updateState, reload | 用户/系统 → runtime |

数据流：**runtime event → agent.state → agent.view → UI**；反向：**user action → agent.control → runtime event**。

**边界规则**：runtime 负责写事实，UI 负责读事实。UI 从 state 派生 view，不替系统补事实。

#### State Schema First 设计原则

Agent 开发应优先设计 state schema，而非 prompt / tool / 模型选择：

1. 哪些事实必须恢复？（重启后 checkpoint）
2. 哪些事实必须跨端一致？（审批状态、激活的运行）
3. 哪些事实只是 view？（isBusy 等展示派生）
4. 哪些事实是用户现场？（刷新后保持的上下文）
5. 哪些事实能从 messages 推导？（无需额外存储）
6. 哪些事实必须成为一等状态？（审批、artifactRef、子Agent）

**判断标准**：影响恢复、审批、继续执行、跨端一致、审计和可检查结果的东西应进入 state；只改变展示方式的东西留在 view。

#### 运行时事件模型（vs ReAct 的 Observation）

ReAct 中 Observation 是给模型看的文本。工程系统中一次 tool call 需拆为可引用事件：

```
run.started → message.created → assistant.text.delta →
tool.call.created → tool.approval_required → tool.call.running →
tool.call.completed → artifact.created → run.finished
```

**同一运行事实不应从多个来源拼出来**（pendingApproval 不能同时散在 message 文本、工具结果和前端本地状态里）。

#### 与 ReAct 的分工

- **ReAct** 解释模型怎样一步步决定下一步
- **Harness** 保证这些步骤在软件系统里发生过、能恢复、可控制、可审计

> "ReAct 让模型动起来；Harness 让这件事在产品里可被信任。" — vivo 丁俊杰

#### 可检查的行为标准

1. 刷新后 pendingApproval 仍存在且指向同一 toolCall
2. 进程重启后能从 checkpoint resume 到同一 run/turn
3. 用户 stop 后 activeRun 终止且后端不继续执行后续 tool call
4. artifactRef 存在时内容可定位、可追溯到 ownerRunId/toolCallId
5. 子 Agent 完成后 parent turn 能拿到 resultRef

---

