# Agent vs Workflow：控制权连续谱与生产级选型框架

> 📊 Level ⭐⭐⭐⭐ | 9.0KB | `entities/agent-vs-workflow-control-continuum-framework.md`

> Agent 和 Workflow 的核心分水岭不是"用没用 LLM"，而是**谁掌握流程控制权**。Workflow 追求可预测性，Agent 解决不可预测性。

→ [原文存档](https://mp.weixin.qq.com/s/sY9iWpC1YW6cuIhuXbAzsw)

## 自主性连续谱（Level 0-5）

| 等级 | 名称 | 控制模式 |
|------|------|---------|
| L0 | 普通 LLM 调用 | 开发者完全控制 |
| L1 | LLM Workflow | 流程代码控制，节点内用 LLM |
| L2 | 动态 Router Workflow | 模型输出决定分支，路径预设 |
| L3 | Tool Calling Agent | 模型在工具集中选择 |
| L4 | Planning Agent | 模型拆解任务、制定计划、重规划 |
| L5 | Long-running Agent | 跨时间运行，长期状态，任务队列 |

每往上一层，模型控制权更多，系统需要的工程约束也更多。这就是 Agent 原型快但生产化难的原因。

## 核心对比

- **Workflow**：路径可枚举，质量可验收，成本稳定，异常可追踪
- **Agent**：目标清楚，路径不确定，需根据环境反馈持续调整
- **工程化后的 Agent** → 加入循环上限、白名单、权限、Retry、Checkpoint、Human Approval、State Machine、Budget Limit — 最终成为 **Agentic Workflow**

## 选型九问

1. 步骤可提前穷举？
2. 中间状态可提前预测？
3. 需和未知环境交互？
4. 需根据结果重规划？
5. 错误成本多高？
6. 要求严格 SLA？
7. 允许人工介入？
8. 单次任务预算？
9. 需审计完整轨迹？

## 三种混合架构

1. **Workflow 包含 Agent**：整体流程明确，复杂节点交给 Agent
2. **Agent 调用 Workflow**：Agent 规划后调用确定性 Workflow Tool
3. **Agent 规划，Workflow 执行**：Planner → Workflow Engine，分离"想办法"和"安全执行"

## 场景推荐

| 场景 | 推荐模式 |
|------|---------|
| 审批/支付/生产发布 | Workflow 为主 |
| Coding/Data Analysis/Research | Agent + 约束 |
| 知识库问答+工单 | Workflow + Agent 混合 |
| 市场调研/竞品分析 | Agent（探索性） |
| 海量客服/批量审核 | 谨慎 Agent 化 |

### 控制权分配才是真正的分界线

真正的分界线不是"用不用 LLM"，而是**流程控制权的归属**：路径由谁枚举、下一步由谁决定、异常由谁接管。L4 Planning Agent 与 L1 LLM Workflow 用的是同一个模型，差别只在模型是否有权决定下一步做什么。这解释了为什么换更强的模型既不会把 Workflow 变成 Agent，也不会让失控的 Agent 变可靠——瓶颈不在节点内的智能密度，而在节点之间的控制权拓扑。判断系统处于哪一级，不看框架与 prompt 层数，而问：若模型给出顺序意外但合理的输出，系统照做还是拒绝？照做的步骤即真正的自主区，也决定了后续工程投入的方向：自主区越大，需要的约束、预算与审计越多。

### 自主性的经济账：成本、延迟与可靠性

每升一级自主性，付出的是三笔互相纠缠的账。**成本**从可预算变成随循环次数与上下文浮动，同一请求可能花 3 分钱也可能花 3 块钱；**延迟**从"节点数 × 单节点耗时"变成带长尾的分布，重规划与多轮工具调用把 P95 拉得极长；**可靠性**从"某节点失败可重试"变成"连续决策偏航"，错误不再是离散事件而是累积漂移。三者中可靠性最易被低估：Workflow 的失败显性、可定位、可重放，Agent 的失败常表现为"每步都说得通、整体却跑偏了"，加再多重试也无解，只能靠循环上限、白名单与 Checkpoint 压低偏航半径。因此真正的成本问题是：买回的适应性是否值回这份溢价。多数生产事故不是选错了等级，而是选了高等级却按低等级假设做容量规划与 SLA 承诺。

### 过度 Agent 化的失败模式

把确定性流程做成 Agent，是看起来先进、实则昂贵的倒退。四种典型症状：**成本失控**，固定三步被展开成六到十次调用，账单随流量超线性上涨；**方差爆炸**，同一输入两次运行结构不同，下游无从消费；**评测失锚**，无固定路径就无固定用例，回归退化成人工抽样；**责任模糊**，出错时答不出"哪一步造成的"，而这正是审批、支付、发布的合规底线。更深一层的失败是把 Agent 当逃避需求分析的捷径：步骤还穷举不出来时该继续把问题想清楚，而不是交给模型去探索，剩余不确定性终会以失败率与运维负担的形式回到团队。反方向的错误同样常见：用 if-else 模拟本该由模型判断的分支，复杂度失控而适应性为零。

### 可观测性与可评估性的工程后果

控制权转移直接改写两套基础设施。**可观测性**上，Workflow 只需节点级日志，出问题看哪一步红了；Agent 必须完整记录 Action Trajectory——每次思考、工具调用、参数、返回值与后续决策的关系，否则无法复盘偏航从哪一步开始，日志量、存储与查询复杂度都上一个量级，trace 粒度必须是"决策单元"而非"函数调用"。**可评估性**上，路径固定时有明确的通过/失败判据；路径动态生成时，评测对象从"输出对不对"变成"轨迹合不合理"，要同时看任务是否完成、用了多少步、是否触碰禁区、失败能否恢复。务实排序是：先建可观测性，再谈自主性。

### 与 Harness 工程的关系

连续谱回答"该放多少权"，Harness 工程回答"放出去之后靠什么兜住"。自主性等级越高，Harness 责任越重——循环上限、工具白名单、权限分级、状态持久化、人工审批点、预算熔断，本质都是用工程手段把模型的部分自由重新结构化。这也解释了为何工程化后的 Agent 会收敛成 Agentic Workflow：不是不够智能，而是生产系统要求它可预算、可审计、可回滚。Agentic Workflow 才是企业真实形态的稳态。

## 实践启示

1. **先问控制权，再问技术栈。** 先画出流程：哪些下一步可提前写死，哪些必须由模型现场判断。写死的留在 Workflow 引擎里，只有真需要现场判断的才升级为 Agent 节点，别让一个环节的不确定性把整条链路 Agent 化。

2. **按错误成本定自主等级，不按技术先进性。** 审批、支付、生产发布等不可逆动作，无论模型多强都锁进 Workflow 或加 Human Approval；可探索、可回滚的任务才给到 L3-L4。等级是风险预算的产物。

3. **给自主性配预算与熔断。** L3 以上的链路上线前必须明确最大步数、最大 token、最大金额、最大墙钟时间，以及超限后的降级路径，否则成本方差与尾延迟无法纳入容量规划。

4. **先建轨迹可观测性，再放权。** 确认每一步的思考、工具调用与参数都被结构化记录，能回答"偏航从第几步开始"。没有 Action Trajectory，就没有可用的评估与复盘。

5. **用评测方式反向校准选型。** 评测能力只到"输出对不对"，适合的形态就是 Workflow 加少量受控 Agent 节点；只有轨迹级评测与模拟环境回归成为常规能力，才具备提升到 Planning Agent 的条件。

6. **警惕两个方向的反向错误。** 一边是过度 Agent 化，换来成本失控、方差爆炸与责任模糊；一边是用 if-else 硬撑本该由模型判断的分支，复杂度失控而适应性为零。解法都回到同一个问题：这一步的下一步是否真无法提前确定？

参见 [Agentic Workflow 模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-workflow-patterns.md)、[Harness Engineering 范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md)、[Agent 时代的可观测性](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-era-observability-guance-cloud.md) 与 [Agent 评测基准](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)。

## 关联

- [Loop Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md) — Agent 的循环决策架构
- [Claude Code 工具系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-tool-system-architecture-deep-dive.md) — 生产级 Agent 工具系统设计
- [AI Agent 工具数量陷阱](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-tool-count-trap.md) — Agent 工具工程
- [阿里 Harness 工程实战：Agent 自主迭代 17 小时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-harness-autonomous-agent-iteration.md) — 父子 Agent 模式体现了控制权连续谱的层级 delegation

---

