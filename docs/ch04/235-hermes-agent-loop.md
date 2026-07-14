# Hermes Agent Loop 架构

## Ch04.235 Hermes Agent Loop 架构

> 📊 Level ⭐⭐ | 10.5KB | `entities/hermes-agent-loop-architecture.md`

## 5 阶段主循环
```
Receive Input → Build Prompt → Call LLM → Execute Tool → Check Done
```
循环直到满足退出条件。**Chat = request-response；Agent = task-completion。** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## 4 个核心模块
### 1. Loop Orchestrator（主控）
职责：维护 turn count、5阶段调度、检查终止条件、记录事件。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**原则：只知道"下一步该叫谁"，不做任何业务判断。** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
业务差异（"代码任务先 lint"、"文档任务先 outline"）全通过 Skill 注入 prompt，Loop 永远是同一流程。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

### 2. Prompt Builder（提示词组装）
每轮：读 system prompt 模板 → 注入 Memory → 检索 Skill → 序列化 Tools → 拼对话历史 → 控制 context window 长度。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**独立出来的好处：改 prompt 策略不动主循环。** 加 RAG 检索结果？只改这里，Loop 不知道。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

### 3. 执行层（LLM Adapter + Tool Runner）
- **LLM Adapter：** 屏蔽 OpenAI/Anthropic/Bedrock API 差异，无状态
- **Tool Runner：** 找到实现、传参、捕获异常、统一格式
两者均无状态，方便测试和并发。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

### 4. Trajectory Recorder（轨迹记录）
每步事件**实时落盘**（非任务结束一次性写入）。是 Nudge Engine 和 Review Agent 的输入。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
记录与执行解耦：关闭自学习时 trace 写 /dev/null，主循环照常跑。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## 一轮 = 1次 LLM + 0~N次 Tool
```
buildPrompt (50-200ms) → callModel (1-5s) → parse tool_calls → execute tool(s) → loop or exit
```
**工具默认串行：** 工具间可能有顺序依赖（read_file → write_file），并发会出竞态。只读/纯函数工具可声明"可并发"。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## 4 种退出姿势
| 退出方式 | 触发条件 | 关键处理 |
|---------|---------|---------|
| 自然完成 | `tool_calls.length === 0` | 约70%任务走这条 |
| max_turns | 达到25/50轮上限 | 标注 `terminated_by: "max_turns"`，不让 Review Agent 把卡住当成功 |
| 用户打断 | Ctrl+C / 取消按钮 | 中断 stream、尝试 cancel 工具、保留已完成结果 |
| 不可恢复错误 | API挂/OOM/未捕获异常 | 记 trajectory、释放资源、给用户可读错误 |

## 设计哲学
**1. 主循环克制，外围灵活** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
> 所有复杂逻辑都堆在主循环里，是初学者最容易犯的错。Hermes 走相反的路：主循环只做5件最朴素的事，复杂的事推给外围模块。
**2. 自进化是叠加能力，不是嵌入逻辑** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
> Memory、Skill、Nudge、Review 从外部叠加到 Loop 上，Loop 本身不知道它们的存在。拔掉这些模块，Loop 照样跑。
**3. 刻意避免状态机** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
> 简单 while 循环比显式状态机灵活。新增能力只需往 prompt 里加内容，不需要预先定义每种状态。
**4. 先想清楚怎么停，再想怎么跑** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
> 写 Agent 时第一个写的就是退出条件。4种退出姿势缺一不可——只考虑"任务完成"会导致死循环爆 token。

## 与本 wiki 的关系
本 wiki 的 `entities/`、`raw/`、`log.md` 结构对应 Trajectory Recorder 的持久化设计；`skills/` 对应 Skill 注入机制；`index.md` 对应入口导航。这些模块在 Hermes Loop 里各自有明确的职责边界，与本 wiki 的设计一脉相承。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## 深度分析
**1. "极简主循环"范式的工程必然性** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
Hermes 主循环 <200 行代码并非刻意追求简短，而是模块化分离后的自然结果。winty 的源码分析揭示了一个关键洞察：当 Agent 系统复杂度超过临界点，所有逻辑都堆在主循环里是头号杀手。业界常见的 "Agent 泥球"（Big Ball of Mud）几乎都源于此——Loop 里堆满了 `if skill == X then do Y` 的业务判断，新能力叠加变成改一处断三处的噩梦。Hermes 的解法是把业务差异上浮到 Prompt（通过 Skill 注入），Loop 本身退化成 pure scheduler，天然获得"加新能力不碰 Loop"的免疫能力。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**2. Trajectory Recorder 实时落盘的设计权衡** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
源码中一个值得注意的细节：Trajectory Recorder 每步事件实时写盘，而非任务结束时批量写入。这是对"数据完整性 vs 写放大"的显式权衡——任务中途崩溃时，未落盘事件的代价由 Review Agent 无法复盘来承担。这个决策对运维设计有直接影响：关闭自学习时 trace 写 /dev/null，说明记录与执行是完全正交的模块，拔出记录能力 Loop 照常跑，这是"关注点分离"原则的最佳示范。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**3. 退出条件先行的认知价值** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
"先想清楚怎么停，再想怎么跑"这一设计哲学在 Agent 领域常被忽视。大多数 Agent 系统的第一版死亡原因是死循环——没预设 max_turns 或用户打断机制，导致 token 爆、账户欠费。Hermes 的 4 种退出姿势（自然完成 / max_turns / 用户打断 / 不可恢复错误）中，max_turns 的异常标注（`terminated_by: "max_turns"`）尤其关键——不让下游 Review Agent 把"卡住"误判为"成功"，这是 Agent 系统自我纠正机制的前提。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**4. 工具串行默认的竞态洞察** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
源码分析发现：改工具调用为默认并发后，7% 的任务出现"读到上一步还没写完的数据"竞态。这个 7% 在小规模测试中几乎不可察觉，但在生产环境高频调用下会成为慢性出血点。Hermes 的结论"并发应该是 opt-in 选项而非默认"值得所有 Agent 框架借鉴——Agent 的工具调用与微服务的 RPC 本质不同，前者常有状态依赖。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## 实践启示
**1. 评估现有 Agent 框架的主循环复杂度** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
如果一个 Agent 框架的主循环超过 500 行代码，且包含业务判断分支，这是在预警技术债务。可以用 Hermes 的标准做一次自我审计：把 Loop 里非调度相关的代码全部抽走，看还剩多少。目标是 Loop 永远保持"只知道下一步该叫谁"的极简状态。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**2. 第一个写的代码是退出条件，不是执行流程** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
在开始任何 Agent 项目时，先写退出条件：max_turns 上限、自然完成判断、用户打断处理、异常兜底。这比写执行逻辑优先级更高。一个没有退出条件的 Agent 等于一个没有熔断机制的电路——迟早会烧毁。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**3. Trajectory Recorder 是 Agent DevOps 的基础设施** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
不要把轨迹记录当作"自学习的输入"而局限了它的用途。轨迹记录本质上是一个结构化的可观测性（Observability）层——它同时支撑：自我学习（Review Agent）、调试（错误溯源）、计费（token 审计）、合规（操作审计）。建议任何生产级 Agent 系统都内置类似模块，且默认开启。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
**4. 工具并发的风险评估清单** ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]
在引入任何工具并发执行前，必须回答：工具是否只读？是否有副作用？是否有状态依赖？只有当三个答案都为"是"时，才考虑从串行切换为并发。对于 read_file/write_file 这类有隐式顺序依赖的工具，永远保持串行。 ^["Agent Loop 源码导读：一次 Hermes 任务的完整生命周期 (winty, 2026-05-20)"]

## Related
- `Hermes Agent /goal & Kanban`
- `Hermes Agent Goal Runtime`

## Related

- `Self-Evolving Agent`

## 相关实体
- [Hermes Agent Loop Source Code Anatomy](ch04/235-hermes-agent-loop.html)
- [Small Hermes Self Evolving Agent Architecture](../ch03/046-agent.html)
- [Hermes Agent Operator上手 把一个 Agent 养成可运营系统 若飞](../ch03/091-hermes-agent.html)
- [Hermes Observability Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability-aliyun.md)
- [Gateway Architecture Openclaw Claude Hermes Comparison](../ch11/225-openclaw.html)

---

