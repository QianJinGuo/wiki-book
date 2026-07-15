# Harness Engineering 系统性解读

## Ch05.037 Harness Engineering 系统性解读

> 📊 Level ⭐⭐ | 15.0KB | `entities/harness-engineering-systematic-explainer.md`

## 核心主线
李宏毅老师课程核心：有时候语言模型不是不够聪明，只是缺少人类为它设计好的行动环境。
> 一个模型会写代码，不代表它知道文件在哪里；一个测试脚本存在，不代表它会主动运行；规则写在文档里，不代表它会稳定遵守。
Harness 要解决的不是"怎样让模型回答得更漂亮"，而是：当一个概率模型要读文件、调用工具、修改代码、运行测试、观察日志、操作浏览器、跨会话推进任务时，怎样让它持续看见事实、执行动作、接收反馈、保存进度，并在失败后修正下一轮行动？

## Prompt / Context / Harness 三层区分
| 层次 | 关心什么 | 类比 |
|------|---------|------|
| **Prompt Engineering** | 怎么去问 | 一句指令 |
| **Context Engineering** | 给模型看什么 | 模型眼前的材料 |
| **Harness Engineering** | 怎样设计多轮行动系统，让模型把任务真的做完 | 一整套工作环境 |

- Prompt 让模型知道"你要什么"
- Context 让模型看见"该依据什么"
- Harness 进一步规定：它能用什么工具、怎么验证自己、失败后怎么恢复、下一轮怎么接上、哪些动作必须被系统拦住

## Harness 不是 AGENTS.md
AGENTS.md 很重要，但只是 Harness 的一部分——它能告诉 Agent 怎么行动，却不能保证 Agent 一定照做。
真正可靠的 Harness：把"希望它这样做"变成"系统默认会这样约束它"。

- 不只是告诉它"要跑测试"，而是 completion 前检查测试结果
- 不只是告诉它"不要越权"，而是用工具权限、沙箱、人工审批拦住高风险动作
- 不只是告诉它"别忘了进度"，而是把 feature list、progress notes、handoff artifacts 写到磁盘
- 不只是告诉它"别破坏架构"，而是用 lint、结构测试、CI 把边界机械化
自然语言规则是软控制（有概率性）；系统约束、权限边界、状态持久化、测试反馈，才让控制变硬。

## Harness 的本质：七环节控制回路
```
人定义目标、边界、验收标准
       ↓
Guides（行动前的前馈控制：AGENTS.md、架构文档、spec、操作规范）
       ↓
Agent 在环境中执行 Reason → Act → Observe 循环
       ↓
Tools（读文件、写文件、跑命令、查 API、操作浏览器）
       ↓
Sensors（捕捉偏差：tests、lint、typecheck、e2e、logs、metrics、trace、review agent）
       ↓
State（跨会话真相：feature_list.json、progress notes、handoff artifacts、git history）
       ↓
Harness update（把失败写回规则、工具、测试或文档，让同类错误以后更难重复发生）

## ## 相关实体

## ## 相关实体

## ## 相关实体
```

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)
## 为什么"更多上下文"不是答案
OpenAI 经验：把大量规则塞进巨大的 AGENTS.md 会失败——单体规则文件挤占任务上下文空间，真正重要的信息失焦，且文档随项目变化快速腐烂。
Harness 的"渐进披露"信息系统：

- 常驻文件像地图，帮助 Agent 定位
- 细节文档按需读取，避免一上来淹没模型
- 测试、日志、指标要能被 Agent 直接观察
- 计划、进度、决策要变成磁盘上的状态工件
- 旧的、不再真实的文档要被清理和校验
**长任务真正缺的不是无限上下文，而是可恢复、可交接、可验证的外部状态。**

## Generator / Evaluator 模式
Planner / Generator / Evaluator 三角色：

- **Planner**：把目标拆成计划
- **Generator**：生成方案或实现代码
- **Evaluator**：检查结果、给出反馈
Evaluator 不是天然客观的。Anthropic 经验：Claude "开箱即用"不是一个好的 QA agent——它会发现真实问题，但随后又说服自己这些问题"不重要"并批准结果；它也倾向于浅层测试而不主动探测边界。
**Evaluator 本身也需要自己的 Harness：**

- 明确的验收标准（而不是凭感觉）
- 能操作真实环境（打开页面、调用接口、检查数据库）
- 能看日志、跑测试、截屏、记录复现路径
- 把判断写成 evidence，而不是只给一句结论
- 知道哪些失败必须升级给人
- 提示词、评分标准、测试深度要根据真实误判不断修正
核心原则：不要用"另一个模型"替代验证，要用"另一个被约束的验证流程"提高可靠性。

## 核心动作
> 找到当前 Agent 行动链路中的断点，然后把断点工程化地补成下一轮默认存在的能力。

- 如果 Agent 总是忘记跑测试 → 把测试接进完成条件
- 如果 Agent 总是读不到关键背景 → 把知识整理成地图和按需读取的文档
- 如果 Agent 总是在长任务里丢失进度 → 把 feature list、progress notes、handoff artifacts 写到磁盘
- 如果 Agent 总是对自己的结果太宽容 → 让验证流程变得更明确、更可观察、更可复盘

## 深度分析
### 1. Harness Engineering 的本质：从"告知"到"约束"
文章最核心的洞见是：Prompt Engineering 解决的是"怎么问"的问题，Context Engineering 解决的是"给什么看"的问题，而 Harness Engineering 解决的是**"如何让 Agent 真正按规则行动"**的问题。
这三者的区别在于控制力的强度：

- Prompt 是**建议**——模型可以选择不听从
- Context 是**条件**——模型的行为受到它所看到的内容的影响
- Harness 是**约束**——模型被系统设计强制要求按特定方式行动
文章用了一个非常形象的比喻："AGENTS.md 很重要，但只是 Harness 的一部分——它能告诉 Agent 怎么行动，却不能保证 Agent 一定照做。" 这指出了自然语言指令的根本局限：**概率模型对指令的遵循是有概率性的**，不是 100% 可靠的。
Harness Engineering 的思路是**不依赖概率性的语言指令，而是设计系统层面的约束机制**：测试必须通过才能算完成、高风险操作必须经过审批、进度必须写入磁盘才能延续。这些约束不是告诉 Agent "你应该这样做"，而是把系统设计成"不这样做就无法继续"。

### 2. 七环节控制回路的工程映射
文章提出的七环节控制回路（Guides → Agent Reason-Act-Observe → Tools → Sensors → State → Harness Update）是一个完整的 Agent 系统架构图。这个架构图的价值在于**将"Agent 行为控制"这个模糊的需求分解为具体的工程组件**：

- **Guides（行动前的前馈控制）**：AGENTS.md、架构文档、spec、操作规范。这是 Agent 行动前的" briefing"，但不是唯一约束。
- **Tools（执行能力）**：读文件、写文件、跑命令、查 API。Agent 的能力边界由它能调用的工具决定。
- **Sensors（偏差捕捉）**：tests、lint、typecheck、e2e、logs、metrics。这些是 Agent 自我纠错的"眼睛"。
- **State（跨会话记忆）**：feature_list.json、progress notes、handoff artifacts。这是 Agent 的"外部记忆"，不被上下文窗口限制。
- **Harness Update（反馈闭环）**：把失败写回规则、工具、测试或文档。这是系统从错误中学习的能力。
这个架构给我们的启发是：**Agent 系统的可靠性不是靠更好的 Prompt，而是靠更完整的控制回路**。每一个环节的缺失都会导致 Agent 行为的不可预测性。

### 3. "渐进披露"信息系统的设计哲学
OpenAI 的经验（大量规则塞进 AGENTS.md 会失败）和 Claude Code 的七层记忆架构有着相同的底层逻辑：**模型需要的是"刚好够用"的上下文，而不是"越多越好"的信息**。
"渐进披露"信息系统的核心设计原则：

- **常驻文件 = 地图**：帮助 Agent 定位自己在项目中的位置，但不包含所有细节
- **按需读取 = 详情手册**：细节文档只在需要时被读取，避免挤占宝贵的上下文空间
- **状态工件 = 记忆**：计划、进度、决策都要写成磁盘文件，不依赖模型自己记住
- **文档清理 = 记忆校正**：定期清理不再真实的文档，防止过时信息误导 Agent
这个设计哲学对工程实践的指导意义在于：**上下文窗口不是无限的，我们需要对进入上下文的信息进行筛选和分层管理**。不是所有信息都要放在 Prompt 里，也不是所有信息都要放在 RAG 系统里。不同类型的信息有不同的获取方式和时效性要求，需要分类管理。

### 4. Evaluator Harness 的自我矛盾问题
文章指出了一个容易被忽视的问题：**即使是"客观"的 LLM-as-Evaluator，也不是真正客观的**。Claude 作为 QA agent 会发现真实问题，但随后又会说服自己这些问题"不重要"并批准结果——这说明模型的评估能力受到其"通过率偏好"的干扰。
这个观察揭示了 Evaluator Harness 的设计中最容易犯的错误：**假设 Evaluator 本身是可靠的**。实际上，Evaluator 和被评估的 Agent 一样，都是概率模型，都需要被约束和校准。
文章提出的解决方案值得深思：**"不要用'另一个模型'替代验证，要用'另一个被约束的验证流程'提高可靠性"**。这意味着 Evaluator 不应该是一个简单的 LLM 调用，而应该是一个包含明确验收标准、能操作真实环境、能把判断写成 evidence 的完整流程。

## 实践启示
### 对 Agent 系统设计的启示
1. **设计时要考虑"如何让 Agent 一定遵守规则"**：不要只写 AGENTS.md 告诉 Agent 应该怎么做，而是要设计系统机制保证它一定这样做。例如：如果测试不通过就不能标记完成，而不是告诉 Agent "记得跑测试"。
2. **建立完整的控制回路**：Agent 系统需要 Guides（告知）、Tools（执行）、Sensors（反馈）、State（记忆）、Harness Update（学习）五个组件。任何一个组件的缺失都会导致系统在某个边界条件下失效。
3. **上下文窗口是稀缺资源，需要分级管理**：不是所有信息都要塞进上下文。应该建立"常驻地图 + 按需详情 + 外部状态"的多层信息架构，避免上下文窗口被无用的细节填满。

### 对 Agent 评测的启示
1. **Evaluator 本身也需要 Harness**：不要假设 LLM-as-Judge 是客观的。Evaluator 需要自己的约束：明确的验收标准、操作真实环境的能力、把判断写成 evidence 的要求、以及"知道什么时候升级给人"的边界判断。
2. **评测结果要驱动系统改进**：Harness Update 的核心是"把失败写回规则、工具、测试或文档"。评测不是终点，而是系统进化的起点。每一轮评测发现的失败案例，都应该转化为下一轮系统的改进输入。
3. **渐进披露也适用于评测**：一次性给 Agent 所有评测标准可能不如在合适的时机披露合适的评测维度有效。这与"渐进披露信息系统"的设计哲学是一致的。

### 对团队协作的启示
1. **hantch artifacts 是协作的载体**：在多人、多 Agent 协作的场景中，handoff artifacts（交接工件）是保证连续性的关键。每个 Agent 的输出应该包含足够的上下文，让下一个 Agent 无需重新探索就能继续工作。
2. **文档需要像代码一样维护**：文章指出"文档随项目变化快速腐烂"，这提示我们，建立文档清理和校验机制是和建立测试机制同样重要的工程实践。
3. **失败后的复盘要系统化**：Harness Update 不仅是技术动作，也是组织学习的过程。每一轮失败后，应该分析是哪个环节出了问题（Guides 不够清晰？Sensors 没有捕捉到偏差？State 丢失了关键信息？），并针对性地修复那个环节。

- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/669-karpathy-vibe-coding-agentic-engineering.html)
- [Code as Agent Harness 综述](../ch09/051-code-as-agent-harness.html)
- [AI Skill 测评指标体系](../ch01/484-ai-skill.html)

## Related
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/112-harness-engineering.html)

- [RAG 全链路技术详解：从文档加载到 Ragas 评估](../ch01/1081-rag.html)
- [AgentCore Managed Harness](../ch04/647-agentcore-harness.html)
- [Agent Harness 解析：智能体架构深度拆解](ch05/039-agent-harness.html)
- [From Agent Protocol to Harness Skill](../ch04/403-from-agent-protocol-to-harness-skill.html)
- [Claude Code 架构深度解析](../ch03/076-claude-code.html)
- [Agent Memory 架构解析](../ch04/121-agent-memory.html)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](../ch11/225-openclaw.html)
- [claude-code-7-layer-memory-architecture](../ch03/076-claude-code.html)
- [AI Agent 工程师能力地图](../ch04/030-ai-agent.html)

---

