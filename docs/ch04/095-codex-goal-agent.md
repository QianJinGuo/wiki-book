# Codex /goal：长任务Agent的目标运行时

## Ch04.095 Codex /goal：长任务Agent的目标运行时

> 📊 Level ⭐⭐ | 16.1KB | `entities/codex-goal-agent-runtime.md`

## 核心论点
`/goal` 把一个长期目标放进了 Codex 的**运行时里**：目标有状态，过程有记账，完成要审计，预算到了要收束。
**比普通 loop 多走的一步**：没有把长任务包装成"无限自动化"，而是把长任务拆成一组可以被观察、记账、暂停、恢复和收束的状态，再把模型自己改写状态的口子堵上。

## 三层设计
### 第一层：目标持久化（state-db）
目标从 prompt 里的文字 → state-db 里的持久对象，具备：

- **状态字段**：active / paused / complete / budget_limited
- **记账**：token 消耗、wall clock 消耗
- **外部可mutation**：可以被外部修改，运行时状态同步
**长任务最常见的问题**：目标只活在聊天里——上下文一压缩，目标就变薄；中间做了几个局部修复，目标可能被悄悄改写；Agent 跑了很久，最后把"做了一部分"说成"完成了"。

### 第二层：运行时生命周期
`GoalRuntimeEvent` 驱动每个运行边界：
| 事件 | 含义 |
|------|------|
| `TurnStarted` | turn 开始时检查有没有 active goal |
| `ToolCompleted` | 工具执行后 token/预算怎么记 |
| `TurnFinished` | turn 结束后是否自动续跑 |
| `MaybeContinueIfIdle` | 空闲时是否启动 continuation turn |
| `TaskAborted` | 用户中断时是否暂停目标 |
| `ExternalSet/ExternalClear` | 外部改 goal 时运行时状态同步 |
| `ThreadResumed` | thread 恢复后目标还在不在 |

### 第三层：完成审计 + 预算收束
**completion audit 协议**（续跑 prompt）：

- 不要把完整目标缩小成当前容易完成的小目标
- 要基于当前 worktree 和外部状态，聊天历史不能替代当前状态
- 每个要求都要找到证据（文件、命令输出、测试结果、PR状态、运行行为）
- 证据弱、不完整、间接、只是看起来一致，都不能算完成
**budget_limit 模板**：

- 达到 token budget 后不要再开新实质工作
- 尽快收束本轮
- 总结有用进展、剩余工作或阻塞，并给用户留下清楚的下一步

## Goal vs Loop：根本差别
| | 普通 loop | Codex /goal |
|--|---------|-------------|
| **本质** | 外部拉回来 | 目标放进系统内部 |
| **目标位置** | prompt / 脚本 / 文件 | thread goal + state-db |
| **续跑** | 结束后再喂同一目标 | 空闲时触发 continuation turn |
| **状态边界** | 靠脚本约定 | active/paused/complete/budget_limited |
| **完成判断** | 模型自报或脚本约定 | requirement-by-requirement audit + evidence |
| **预算控制** | 外部粗略限制 | token + wall clock accounting |
| **退路** | 模型自己决定 | 运行时收掉（update_goal 只接受 complete） |

## 工作现场六组件
本文把"Agent 工作现场"拆成六件：
1. **目标**：说清范围、约束、验收方式、停止条件——从 prompt 提到 thread 上
2. **上下文**：当前推理的工作集，按需读取比一股脑塞进来更稳
3. **工具**：名字清楚、参数有边界、危险动作有权限——`update_goal` 只接受 `complete` 是示范
4. **状态**：落在模型外面，state-db 是示例
5. **验证**：测试/构建/lint/PR状态，比"模型说完成了"靠谱
6. **收束**：暂停/预算耗尽/中断/失败/交接，都有可读输出

## 三条可搬回实践
### ① 让目标长出状态机
让"目标"在系统里有名字、有状态机，不只是 prompt 拼接的副产品。
**实现参考**：`GOAL.md` / `PROGRESS.md` 外部状态文件（给接管用）；`/goal` 这一层更内：目标本身就有状态字段。

### ② 让完成长出审计
`update_goal` 只接受 `complete`，同时拉高门槛：requirement-by-requirement audit + evidence。
自己做长任务编排时，比 prompt 里写"请认真验证"管用很多。

### ③ 让收束长出模板
budget_limit 模板：到点了，别开新工作，把进展、剩下的事、阻塞、下一步整理出来。
停下来本身也是一种状态，要有自己的协议。

## 与用户 Harness 体系的关系
本文与以下页面形成呼应：

- [高德伴行Agent](ch04/150-ai.md)（工作现场六组件）
- [Hermes Agent](ch03/087-hermes-agent.md)（Karpathy 观点被多次引用）
- [Agent Memory Architecture](ch04/503-agent.md)（状态为什么得落在模型外面）

## 相关页面
- [原文存档：Codex /goal 实现拆解](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/codex-goal-implementation-breakdown.md)

## 相关实体
- [Codex /goal: The Six-Hour Run That Survived a Five-Hour Pause](ch09/052-codex-goal-six-hour-run.md)
- [Cline releases open-source agent runtime SDK](ch04/401-cline-releases-open-source-agent-runtime-sdk.md)
- [Cline releases open-source agent runtime SDK](ch04/503-agent.md)

- [Openai Symphony Codex Orchestration Linear Control Plane](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)
## 深度分析
### 目标状态机的本质：把"意图"变成"运行时对象"
`/goal` 的核心设计不是让模型多跑几轮，而是把目标从 prompt 里的文字提升为运行时里具备生命周期状态的对象。普通 loop 里，目标活在聊天上下文、脚本或临时文件里——上下文一压缩，目标就变薄；模型自我修改目标时，没有机制可以拦截。`/goal` 的 state-db 把这件事倒了过来：目标有自己的状态字段（active/paused/complete/budget_limited），有 token 和 wall clock 记账，有外部可mutation接口，运行时在每个边界事件上检查目标状态。

### Completion Audit 协议：堵住模型"自我宣布完成"的口子
源码里 `update_goal` 工具的状态参数**只接受 `complete`**。这意味着模型可以宣布"我做完了"，但没办法自己改成"差不多"或"超预算"。配合 audit 协议（每个要求都要找证据；文件、命令输出、测试结果、PR状态、运行行为都要按要求检查；证据弱、不完整、间接都不能算完成），形成了一个硬约束：模型不能靠"我觉得差不多了"关闭目标，必须逐条拿出可验证的证据。这是把完成判断从模型内省转移到外部验证的关键机制。

### Budget Limit 模板：停下来本身也是一种状态
budget_limit 模板的内容很简短：达到预算后不要再开新实质工作，尽快收束，总结有用进展、剩余工作或阻塞，并给用户留下清楚的下一步。这背后是一个工程认知：长任务运行时，到点停下来的质量和新工作时一样重要。"停"需要协议，需要整理输出，需要给用户可操作的下一步——不是模型自己想停就停，而是运行时强制收束。

### 六组件的工程分层
工作现场六组件（目标、上下文、工具、状态、验证、收束）不是设计原则，是工程分层。每一层都有明确的关注点：目标说清范围约束验收停止条件；上下文是当前推理工作集而非聊天记录；工具是真实系统的边界接口；状态落在模型外面；验证靠测试构建 lint 而非模型自报；收束靠模板而非模型自觉。其中 `update_goal` 只接受 `complete` 是工具层设计的示范：危险动作的权限要收紧到最小粒度。

### Karpathy 观点的实践落点
Karpathy 说"可以外包思考，但不能外包理解"——这句话在 `/goal` 里的落地是：模型可以接管执行，但工作现场（目标定义、上下文边界、验证标准、收束条件）必须由工程师设计和维护。后者才是真正的杠杆：不是把需求丢给 Agent 等着吐代码，而是把同一个需求改写成一份清楚的 spec，知道哪些上下文要给、哪些工具和权限要收紧，让 Agent 先做小切片，再用测试和日志做反馈，能看懂 diff，也能在预算耗尽时把现场整理回来。

### 麦艮廷：thread_goals 表源码深度解析（阿里技术，2026-05-23）
麦艮廷对 Codex /goal 源码的深度拆解，补充了现有 entity 未覆盖的源码级细节：

**thread_goals 表的 goal_id 设计**：每次创建或替换目标都会生成新 goal_id，用 expected_goal_id 保护异步错位——用户中途替换目标时，旧 turn 的账不会糊到新 goal 上。

**Budget 账本边界记账时机**：不是在最后算总账，而是在多个边界上记账——turn 开始时记录 baseline、工具完成后计算 delta、turn 结束时补最后一笔、用户中断时先记账再暂停、外部 UI 改 goal 前先结清当前进度。

**自动续跑的 7 个前提条件**：goal 功能开启 + 非 Plan mode + 无 active turn + 无排队用户输入 + 无 mailbox 待处理项 + 必须是持久线程 + 数据库中 goal_id 仍是同一个。真正体现"有条件地继续"而非"模型停了就催一句继续"。

**objective 4000 字符限制**：超过则提示用户把长说明放进文件，用 `/goal follow the instructions in docs/goal.md` 引用——目标应该是句柄，详细要求放在可维护文件里。

**<untrusted_objective> 安全防护**：objective 放在 `<untrusted_objective>` 标签里，是用户数据而非更高优先级系统指令，防止目标描述变成 prompt injection。

**TUI 状态栏契约**： Pursuing goal (40K/50K)、Goal paused (/goal resume)、Goal unmet (4K/5K tokens)、Goal achieved (10h 12m)——把目标状态变成用户可见的契约，而非藏在数据库或上下文里。

**Plan mode 与 goal 的互斥**：Plan mode 本来就是让模型先想清楚不要动手，不能一边说"只规划"一边让 active goal 在后台自己跑。

**打断的语义是"先停一下"**：用户打断时系统先把进度记账再改成 paused，不是直接丢掉状态。下次恢复线程时 TUI 还会提示要不要 resume——体现了好用产品该有的协作语义理解。

**Jason Liu（OpenAI Codex团队）实战心法：让 Codex 变员工
Jason Liu（Instructor 作者，现 OpenAI Codex 团队成员）分享了一套把 Codex 从工具变员工的使用系统：

**长期线程存活模式**：每个工作流一个置顶线程（管日程/管开源项目/监控社交平台），通过 Command-1 到 Command-9 一键跳转，线程跨月存活，项目背景、沟通习惯、历史决策自然沉淀。口述代替打字，完整保留原始思路。

**Heartbeats + @computer 组合拳**：Heartbeats 相当于给 Agent 加定时任务调度层。实战案例：

- Chief of Staff 线程（每30分钟）：扫描 Slack + Gmail，判断优先级，起草草稿但不发送，最终由人决定
- 动画项目（每15分钟）：检查 Slack 审阅线程，同事提反馈 → Codex 重新渲染 + 回复（Slack MCP 不支持文件上传时，Agent 用 @computer 点击 Add file）
- 亚马逊退款：洗澡前让 Codex 盯客服排队状态 → 洗完澡退款已到账
- 扩展场景：Google Docs 评论、GitHub PR Review——有反馈就自动推进下一步

**验证机制**：核心原则——"没有验证机制的野心，顶多算个愿望而已"。让 Codex 把 Python Rich 库迁移到 Rust，硬性要求通过所有单元测试，测试通过 = 任务完成，失败 = Agent 继续修。

**Goal 模式正式转正**：明确最终目标和验收标准，Codex 自主持续推进（几小时到数天），中途可查进度/调方向/暂停，前提是任务本身存在清晰、可验证的反馈闭环。

**Obsidian 本地记忆层**：个人工作记忆不应该托管在平台内部。所有长期线程从 Obsidian vault 起步（TODO/people/projects/agent/notes），AGENTS.md 顶层写规则——人员信息/项目推进/待办办结变动同步更新知识库。放弃 Codex 内置记忆系统，把核心数据存本地可控文件。文件系统仍然是最可靠的记忆基础设施（Chronicle 屏幕截取功能还在实验阶段）。

**Connectors 和 Skills**：作为可复用工作流模板，成功做完一件有用的事就把流程打包，下次 Codex 不用重新学，直接调用。

## 实践启示
### ① 让目标长出状态机
让"目标"在系统里有名字、有状态机、有预算记账，不只是 prompt 拼接的副产品。实现参考：`GOAL.md` / `PROGRESS.md` 外部状态文件（用于接管）；更进一步：目标本身就有状态字段，运行时在每个边界事件上检查和同步。

### ② 让完成长出审计，不要做开关
`update_goal` 只接受 `complete`，同时拉高门槛：requirement-by-requirement audit + evidence。自己在做长任务编排时，比 prompt 里写"请认真验证"管用很多。模型可以宣布完成，但必须逐条拿出文件/命令输出/测试结果/运行行为作为证据。

### ③ 让收束长出模板
budget_limit 模板：到点了，别开新工作，把进展、剩余工作或阻塞、下一步整理出来。把"停下来"当成一种状态来对待，有自己的协议和输出格式。不是模型自己想停就停，而是到达预算后强制收束。

### ④ 为 Agent 搭工作系统，而不只是使用 Agent
两种工程师用同一类工具，但杠杆不一样：前者把需求一股脑丢给 Agent 然后等代码；后者把需求改写成清楚 spec，知道上下文怎么给、工具权限怎么收，让 Agent 先做小切片，用测试日志做反馈，能看懂 diff，也能在预算耗尽时整理现场。^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/codex-goal-implementation-breakdown.md)

---

