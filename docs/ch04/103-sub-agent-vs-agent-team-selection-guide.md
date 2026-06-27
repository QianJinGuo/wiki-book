# sub-agent-vs-agent-team-selection-guide

## Ch04.103 sub-agent-vs-agent-team-selection-guide

> 📊 Level ⭐⭐ | 15.6KB | `entities/sub-agent-vs-agent-team-selection-guide.md`

## 核心判断准则
> 多智能体架构里，最先该判断的不是"要拆几个"，而是这些子任务之间是否共享同一段上下文。能干净切开的用 Sub-Agent，必须共享状态的才上 Agent Team。

## Sub-Agent vs Agent Team 本质区别
| 维度 | Sub-Agent | Agent Team |
|------|-----------|------------|
| 上下文 | 各有独立上下文 | 共享上下文 |
| 通信 | 必须经过父 Agent | Agent 之间直接对话 |
| 新 Agent | 不能再生新 Agent | 可以互相拉起 |
| 返回内容 | 只返回结论，不带中间思考 | 持续共享状态变化 |
| 适用场景 | 隔离 + 压缩 + 并行 | 持续协作 + 共享状态 + 互相调头 |

## 最大的坑：按"岗位"拆而不是按"上下文边界"拆
常见错误：Planner → Developer → Tester → Reviewer，按人类公司分工切。
问题：每次交接信息都在变薄——Planner 知道"代码刚被重构过某个奇怪判断是有原因的"，这条没传到 Developer；Developer 做了临时取舍（"这次先不改 token 校验顺序因为影响下游 SSO"），也没沉淀下来。
**Design around context boundaries, not roles.** 不要按角色设计，要按上下文边界设计。
工程三问：
1. 这两件事，需不需要看到对方的中间过程？
2. 这两件事，会不会因为对方做完了某一步就影响自己下一步？
3. 交给同一个 Agent 一次性干，会不会更省心？
如果答案偏向"是"，那就别拆。

## Sub-Agent 硬约束
- 子 Agent 之间不能直接通信
- 子 Agent 不能再生新 Agent
- 所有流量必须经过父 Agent
- 只返回最终输出，不带中间思考
**三个价值：隔离 / 压缩 / 并行**
代码示例（claude_agent_sdk）：
```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition
async def main():
    async for message in query(
        prompt="Review the authentication module for issues",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                "security-reviewer": AgentDefinition(
                    description="Find vulnerabilities and security risks",
                    prompt="You are a security expert.",
                    tools=["Read", "Grep", "Glob"],
                    model="sonnet",
                ),
                "performance-optimizer": AgentDefinition(
                    description="Identify performance bottlenecks",
                    prompt="You are a performance engineer.",
                    tools=["Read", "Grep", "Glob"],
                    model="sonnet",
                ),
            },
        ),
    ):
        print(message)
```
**description 字段是路由信号**，不是注释。写得含糊，路由就含糊；边界清楚，分发也清楚。

## Agent Team 适用场景
适合"做着做着会发现问题，然后需要互相调头"的任务。
典型例子：软件项目——前端改了接口契约后端要立刻知道；测试发现用例挂了开发要能即时拿到失败上下文；需求理解错了整个链路要回退。
**成本远高于 Sub-Agent：**

- 需要共享状态层（能处理冲突、版本化）
- 需要节点间通信协议
- 需要 Lead Agent 仲裁分歧、推动进度
- 调试链路长，问题可能在节点协作而非单个节点
**口诀：任务不互相依赖，就别上 team；任务必须互相依赖，就别用 sub。**

## 五种编排原语
生产里真正在用的就这几个：
| 原语 | 说明 | 典型场景 |
|------|------|---------|
| **Prompt Chaining** | A 做完给 B，B 做完给 C | 先抽取 → 再翻译 → 再润色 |
| **Routing** | 根据任务特征派给最合适的 Agent | 客服"识别意图再分流" |
| **Parallelization** | 互不依赖任务并行跑再汇总 | 代码审查多维度分析 |
| **Orchestrator–Worker** | orchestrator 拆/派/收，workers 各自干 | Sub-Agent 标准形态 |
| **Evaluator–Optimizer** | 先生成，再评估，再迭代 | 报告生成、代码补全自检 |
> 多 Agent 不是产品形态，是一组可组合的工作流原语。一旦当产品形态理解，就容易陷入攀比；当成工具箱理解，问题才回到"拼什么原语最合适"。

## 判断框架表
| 你在问的问题 | 该考虑的方向 |
|-------------|-------------|
| 能不能一个 Agent 干完？ | 能就先这样，别提前优化 |
| 子任务需不需要看到彼此中间过程？ | 不需要 → Sub-Agent；需要 → Agent Team |
| 子任务跑的时候要不要互相影响？ | 不要 → 并行 Sub-Agent；要 → Team |
| 是不是只想"看起来更高级"？ | 是 → 退回单 Agent，先把任务模型搞清楚 |
| 每步要不要严格按业务规则走？ | 要 → 加确定性中间层，不要硬塞给 team |

## 隐藏成本
多 Agent 带来的不只是性能收益：

- 编排逻辑要写/维护/监控
- Agent 之间契约要定义/版本化
- 调试链路长
- 上下文多 Agent 间一致流转（信息差导致动作错）
- 治理成本（审计/回滚/计费）翻倍
**当任务高度依赖、协调成本远大于收益，或上下文压根没法切干净时，单 Agent 反而最稳。**

## 核心立场
> 围绕上下文边界设计，而不是围绕角色设计；从简单结构开始，只在确定需要时再加复杂度。
架构没有银弹。没有最好的架构，只有最适合当前任务的架构。

## 深度分析
### 1. 上下文边界才是真正的架构维度
Sub-Agent 与 Agent Team 的根本差异不在于"有几个 Agent"，而在于**上下文是否需要跨节点共享**。这一判断优先于所有其他架构决策。
上下文边界的切分逻辑：

- **时间维度**：两个子任务是否存在先后依赖——前一个的输出直接影响后一个的输入？
- **空间维度**：两个子任务是否操作同一份资源——比如同一个代码库、同一组配置、同一批数据？
- **逻辑维度**：两个子任务的决策是否需要看到对方的中间状态——还是只需要最终结论？
当且仅当三个维度都指向"需要共享"时，Agent Team 才有意义。否则 Sub-Agent 的隔离模型反而更稳定。

### 2. "按岗位拆"是认知锚定陷阱
人类倾向于用已知的组织结构来映射不熟悉的系统架构——Planner、Developer、Tester、Reviewer 这条流水线本质上是把"公司部门分工"复制进多智能体设计。这种做法的问题在于：
**信息衰减链**：每经过一次 Agent 交接，有效信息逐层损失。有研究显示，在多跳传递场景中，信息保真度每跳下降约 15-20%。到了第五跳，上下文已经严重失真。
**状态丢失**：中间决策的背景（为什么这么做、放弃了哪些备选方案、有哪些临时约束）在交接时几乎必然丢失。这些背景在单 Agent 模式下是隐式记忆，在 Sub-Agent 模式下是主动信息但被截断。
**边界模糊时的错误协作**：当两个 Agent 按角色切分但实际任务边界重叠时，会产生大量"该沟通但没有通道"的隐形协作成本。

### 3. Sub-Agent 的适用边界比直觉更窄
Sub-Agent 适合的场景特征：

- 任务可完全并行，各子任务输入一致、互不干扰
- 子任务输出是独立的 final artifact，不需要再合并中间状态
- 需要横向扩展时——比如同一任务类型需要"多个视角同时看"
但实际生产中，很多团队把 Sub-Agent 用在"任务关联但强制隔离"的场景——比如先解析、再生成、再审查这个链路中，审查需要看到生成的中间过程但 Sub-Agent 强制只返回结论。这种强行隔离导致的上下文断层是大多数 Sub-Agent 架构失效的根本原因。

### 4. Agent Team 的协作开销是指数级而非线性
Agent Team 的隐性成本容易在概念阶段被低估：
**状态同步复杂度**：N 个 Agent 的状态同步需要 O(N²) 的通信边数。当团队扩展时，状态一致性的维护成本迅速成为主要瓶颈。
**冲突仲裁**：多个 Agent 并发操作同一资源时，冲突检测和仲裁逻辑的复杂度远高于单 Agent 串行执行。典型的实现需要版本化 + 乐观锁 + 回滚机制，这套基础设施本身就有显著的开发成本。
**调试链路**：单 Agent 任务的错误可以完整回溯；Team 任务的错误可能出现在"各节点都没问题但协作结果错了"的地方——这是最难调试的错误类型。

### 5. 五种编排原语的选择逻辑
每种编排原语对应一种任务拓扑结构，选择依据是任务的数据依赖关系：
**Prompt Chaining**：串联，依赖前一步输出作为后一步输入。适用场景有明确的线性依赖链，且每一步需要完整上下文才能执行。
**Routing**：分发，按任务特征路由到不同处理节点。适用场景有明确的任务类型分叉，且各分支之间无数据依赖。
**Parallelization**：并行，各分支独立执行，最后汇总。适用场景是"同一处理逻辑需要多个视角"——如代码审查的多维度分析，安全检查 + 性能检查 + 风格检查可以同时进行。
**Orchestrator–Worker**：标准的主从模型，orchestrator 负责任务分解、分发、汇总，workers 只负责执行。这是最常见的 Sub-Agent 用法，适合任务可拆且结果可合并的场景。
**Evaluator–Optimizer**：迭代模型，Evaluator 评分，Optimizer 改进，循环直到达标。适合"生成质量难以直接定义但可以评估"的场景——比如报告生成、代码补全、创意文案。

## 实践启示
### 1. 从单 Agent 开始，用证据而不是预感来判断是否拆分
不要因为"多 Agent 听起来更高级"就引入架构复杂度。正确的做法是：
1. 用单 Agent 把核心任务跑通
2. 观察瓶颈：是在单 Agent 内——还是确实存在可并行的独立子任务？
3. 只有当性能profile显示单 Agent 确实成为瓶颈时，才考虑拆分
拆分信号：单 Agent 的上下文长度已经接近模型窗口上限，但子任务之间确实无依赖。

### 2. 拆分时先画上下文依赖图，再决定 Agent 类型
在写代码之前，先用自然语言描述：

- 每个子任务需要什么输入？
- 每个子任务产生什么输出？
- 子任务之间是否需要对方的中间过程？
如果所有子任务只需要对方的最终输出 → Sub-Agent（并行或串行）
如果存在子任务需要对方的中间过程 → Agent Team（共享状态）
这一步画的是上下文依赖图，不是组织架构图。

### 3. Sub-Agent 的 description 是架构合约，不是注释
`description` 字段是父 Agent 用来做路由决策的唯一信号。写得模糊等于架构边界模糊。好的 description 应该：

- 明确该 Agent 的职责边界（做什么、不做什么）
- 明确输入输出格式（父 Agent 需要知道怎么组装 prompt）
- 明确与其他 Agent 的协作接口（当需要 Team 时）

### 4. 引入 Agent Team 前先问三个问题
- **状态是否需要跨节点共享？** 如果是，是否有共享状态层的实现方案（数据库、消息队列、共享内存）？
- **是否有冲突仲裁机制？** 当两个 Agent 同时操作同一资源时，谁来决定优先级？
- **调试成本是否可接受？** 当协作链路出错时，能否快速定位是哪个节点的问题？
如果这三个问题没有好答案，说明当前任务复杂度还不需要 Agent Team，Sub-Agent 或单 Agent 才是正确答案。

### 5. 把"要不要多 Agent"还原为工程问题而非架构美学
多 Agent 不是目的，任务完成才是目的。任何架构决策都应该还原为具体问题：

- 我的任务是否有真实的并行收益？
- 我的任务是否需要跨节点的中间状态共享？
- 我的任务的协调成本是否低于并行收益？
如果答案不确定，从简单结构开始，用监控数据说话，而不是用架构图说话。
## 相关实体
- [Four Sub Agent Patterns](../ch04-302-四种-sub-agent-模式/)
- [Minimax Agent Team Mavis Owner Worker Verifier](../ch04-137-一个-ai-还是不够的-minimax-agent-team-mavis/)
- Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent
- Sub Agent Vs Agent Team Selection
- [Hermes Agent Goal Runtime Architecture State Persistence Judge Closed Loop](../ch04-365-hermes-agent-goal-长任务运行时架构拆解-状态持久化-judge-闭环与自主续航/)

---

