## Ch08.012 Sub-Agent vs Agent Team 选型与编排原语

> 📊 Level ⭐⭐⭐ | 12.3KB | `entities/sub-agent-vs-agent-team-selection.md`

## 概述
Sub-Agent vs Agent Team 选型指南——核心判断准则：**按上下文边界设计，而不是按角色设计**。五种编排原语（Prompt Chaining / Routing / Parallelization / Orchestrator-Worker / Evaluator-Optimizer）。

## 核心判断准则
> 多智能体架构里，最先该判断的不是"要拆几个"，而是这些子任务之间是否共享同一段上下文。能干净切开的用 Sub-Agent，必须共享状态的才上 Agent Team。
**Design around context boundaries, not roles.**
工程三问：
1. 这两件事，需不需要看到对方的中间过程？
2. 这两件事，会不会因为对方做完了某一步就影响自己下一步？
3. 交给同一个 Agent 一次性干，会不会更省心？
如果答案偏向"是"，就别拆。

## Sub-Agent vs Agent Team
| 维度 | Sub-Agent | Agent Team | 
|------|-----------|------------| 
| 上下文 | 独立上下文 | 共享上下文 | 
| 通信 | 必须经过父 Agent | Agent 之间直接对话 | 
| 新 Agent | 不能再生新 Agent | 可以互相拉起 | 
| 适用场景 | 隔离 + 压缩 + 并行 | 持续协作 + 共享状态 + 互相调头 | 
**Sub-Agent 硬约束：**

- 子 Agent 之间不能直接通信
- 子 Agent 不能再生新 Agent
- 所有流量必须经过父 Agent
- 只返回最终输出，不带中间思考
**Sub-Agent 三个价值：隔离 / 压缩 / 并行**
**Agent Team 适合：** 做着做着会发现问题然后需要互相调头的任务（如软件项目：前端改接口后端要立刻知道）。成本远高于 Sub-Agent，需要共享状态层 + 通信协议 + Lead Agent 仲裁。
**口诀：任务不互相依赖，就别上 team；任务必须互相依赖，就别用 sub。** 

## 最大坑：按岗位拆而不是按上下文边界拆
常见错误：Planner → Developer → Tester → Reviewer，按人类公司分工切。
每次交接信息都在变薄：

- Planner 知道"代码刚被重构过某个奇怪判断是有原因的"——没传到 Developer
- Developer 做了临时取舍（"这次先不改 token 校验顺序因为影响下游 SSO"）——也没沉淀
LLM 没有上下班、没有茶水间记忆，靠上下文吃饭。能拿到什么上下文，就只能基于什么上下文做事。

## 五种编排原语
| 原语 | 说明 | 典型场景 | 
|------|------|---------| 
| **Prompt Chaining** | A 做完给 B，B 做完给 C | 先抽取 → 再翻译 → 再润色 | 
| **Routing** | 根据任务特征派给最合适的 Agent | 客服"识别意图再分流" | 
| **Parallelization** | 互不依赖任务并行跑再汇总 | 代码审查多维度分析 | 
| **Orchestrator–Worker** | orchestrator 拆/派/收，workers 各自干 | Sub-Agent 标准形态 | 
| **Evaluator–Optimizer** | 先生成，再评估，再迭代 | 报告生成、代码补全自检 | 
> 多 Agent 不是产品形态，是一组可组合的工作流原语。

## Sub-Agent description 是路由信号
```python 
"security-reviewer": AgentDefinition( 
    description="Find vulnerabilities and security risks",  # ← 这是路由信号 
    prompt="You are a security expert.", 
    ... 
) 
``` 
description 不是注释，是路由信号。写得含糊，路由就含糊；边界清楚，分发也清楚。

## 判断框架
| 你在问的问题 | 该考虑的方向 | 
|-------------|-------------| 
| 能不能一个 Agent 干完？ | 能就先这样，别提前优化 | 
| 子任务需不需要看到彼此中间过程？ | 不需要 → Sub-Agent；需要 → Agent Team | 
| 子任务跑的时候要不要互相影响？ | 不要 → 并行 Sub-Agent；要 → Team | 
| 是不是只想"看起来更高级"？ | 是 → 退回单 Agent，先把任务模型搞清楚 | 
| 每步要不要严格按业务规则走？ | 要 → 加确定性中间层，不要硬塞给 team | 

## 隐藏成本
多 Agent 带来：编排逻辑维护成本 / Agent 间契约版本化 / 调试链路变长 / 上下文一致流转（信息差导致动作错）/ 治理成本翻倍。
**当任务高度依赖，协调成本远大于收益，或上下文压根没法切干净时，单 Agent 反而最稳。**

## 深度分析
1. **Sub-Agent 本质是"上下文压缩隔离"而非任务分解**
   许多资料将 Sub-Agent 描述为"把大任务拆小"，但更深层的逻辑是：**通过隔离上下文来压缩信息流复杂度**。每个 Sub-Agent 只看到自己需要的那段上下文，不是任务变小了，而是信息量被合理切分了。这一洞察解释了为什么强行让 Sub-Agent 之间互相传递中间结果会迅速失控——那等于在破坏隔离机制本身。
2. **Agent Team 的协调成本被严重低估**
   现有讨论集中在"共享状态层、仲裁机制"等技术成本，但更大的隐性成本是**契约稳定性**：当一个 Agent 的输出格式发生变化时，所有依赖它的其他 Agent 都需要同步调整，这形成了一种全链接的脆弱性。传统的微服务好歹有 API 版本管理，而 Agent Team 里的隐式契约完全靠"默契"维持。
3. **"按岗位拆"错误的认知根源是拟人化**
   Planner → Developer → Tester 的拆法本质上是在用人类组织的隐喻设计系统。但 LLM 没有固定的"下班时间"，它的上下文窗口就是它的工作记忆——强行模拟人类的岗位边界，只会制造不必要的上下文断裂点，而不是真正的职责分离。
4. **Routing description 的模糊性是架构设计问题而非命名问题**
   当 description 写得含糊时，根源往往不是措辞不够精准，而是**对任务边界本身就没有想清楚**。一个边界清晰的 Agent definition，其 description 自然精准；description 模糊是症状，任务边界不清晰才是病因。这个视角将代码层面的优化建议提升为了架构设计方法论。
5. **编排原语的选择应该先于 Agent 类型选择**
   现有资料通常先讨论"用 Sub-Agent 还是 Agent Team"，然后再带出编排原语。但实际上应该倒过来：**先确定用哪种编排原语（chain/route/parallel/orchestrator/evaluator）——这决定了信息流拓扑，然后才知道该选哪种 Agent 类型**。这是因为某些编排原语天然适配特定的 Agent 模式，比如 Orchestrator-Worker 基本就是 Sub-Agent 的标准形态，而 Evaluator-Optimizer 几乎必然需要 Agent Team 才能运作。

## 实践启示
1. **在写 Agent definition 前先画信息流拓扑图**
   不要直接开始定义"security-reviewer"、"performance-optimizer"这些角色，而是先用箭头画出：信息从哪里进入，经过哪些转换节点，每个节点输出什么格式。只有在拓扑图上验证了信息流没有交叉或断裂之后，再把节点翻译成 Agent definition。这样可以提前发现"按岗位拆"的错误设计。
2. **Sub-Agent 的 description 应由输出反推而非由角色正向定义**
   常规思路是"这个 Agent 是什么角色 → 写对应的 description"，正确思路是"这个 Agent 需要让父 Agent 做出什么路由决策 → 反推 description 应该精确传达什么信号"。例如，"Find vulnerabilities"比"Security expert"更好，因为后者暗示的是角色标签，而前者明确表达了任务边界和输出预期。
3. **为 Sub-Agent 设置明确的"拒绝继续"条件**
   由于 Sub-Agent 不能直接通信，当它发现自己无法独立完成任务时，需要有明确的机制将控制权返还父 Agent。建议在 Agent definition 的 prompt 中显式声明：如果任务超出当前 Agent 能力边界或检测到需要其他 Agent 介入的情况，返回特定格式的"ESCALATE"信号而非尝试自行解决。这比依赖隐式的上下文判断更可靠。
4. **评估是否需要 Agent Team 时，先做"协调成本实验"**
   在正式引入 Agent Team 之前，先用以下实验估算协调成本：让两个独立 Sub-Agent 在完全隔离的情况下分别完成同一个任务的两个子环节，然后人工检查接口适配成本。如果发现人工适配成本已经很高，那么 Agent Team 的协调成本只会更高。这个实验成本极低，但能有效避免过度设计。
5. **编排原语选型后，用日志追踪验证信息流是否符合预期**
   多 Agent 系统的一个常见故障模式是：设计时选了 Parallelization（并行），但运行日志显示实际上是 Chaining（串行）——子任务在等待父 Agent 分发时引入了隐式的顺序依赖。通过在每个 Agent 的输入输出加上可读的流转标记（任务 ID、来源 Agent、目标 Agent、时间戳），可以低成本验证实际信息流是否匹配设计意图，而不是等线上出了问题再调试。

## 相关
- [Agent/Skills/Teams 架构演进与选型](ch04-219-agent-skills-teams-架构演进过程及技术选型之道.html)（阿里云飞樰，更全面的演进视角）
- [Harness Engineering 系统梳理](ch05-049-harness-engineering-系统梳理.html)
- [AutoResearch 多 Agent 开发](ch09-030-autoresearch-多-agent-自动化软件开发.html)

## 相关实体
>- [Sub-Agent vs Agent Team 选型指南](ch04-102-browser-use-agent-runtime-harness.html) — 五种编排原语 + 硬约束 + 判断准则（中文原文）
>- [Hermes Agent vs OpenClaw 对比分析](ch04-188-building-supercharger-how-rocket-close-optimized-title-oper.html)
>- [CLI、MCP、API 选型：Agent 接入层决策指南](ch07-053-cli-cli-mcp-api.html)

- OpenClaw 多智能体团队搭建实战经验
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](ch04-038-openclaw-multi-agent-team-practice-v2.html)
- [MiniMax Agent Team: Mavis (Owner-Worker-Verifier)](ch04-138-ai-minimax-agent-team-mavis.html)
- MOC

---
