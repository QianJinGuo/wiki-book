# Agent Harness 解析：智能体架构深度拆解

## Ch01.329 Agent Harness 解析：智能体架构深度拆解

> 📊 Level ⭐⭐ | 11.6KB | `entities/agent-harness-architecture-deep-dive-aksahy.md`

## 核心定义
**Agent Harness** = 包裹 LLM 的完整软件基础设施：编排循环、工具、记忆、上下文管理、状态持久化、错误处理、安全护栏。
关键区分：

- **Agent** = 涌现出来的行为（有目标、会用工具、能自我纠正）
- **Harness** = 产生这种行为的机器
> "裸 LLM = 没有内存、没有硬盘、没有 I/O 的 CPU。上下文窗口 = 内存（快但有限），外部数据库 = 硬盘（大但慢），工具集成 = 设备驱动，Harness = 操作系统。" — Beren Millidge

## 三层工程模型
1. **Prompt Engineering** — 设计模型接收的指令
2. **Context Engineering** — 管理模型看到什么、什么时候看到
3. **Harness Engineering** — 前两者 + 完整应用基础设施

## 12 个生产级组件
| # | 组件 | 关键设计 |
|---|------|---------|
| 1 | 编排循环 | TAO/ReAct：组装提示词 → LLM → 解析输出 → 执行工具 → 反馈 → 重复 |
| 2 | 工具 | Schema 定义（名称/描述/参数），Claude Code 六类，OpenAI 函数工具 + MCP |
| 3 | 记忆 | 短期（会话内）+ 长期（跨会话持久化），三层访问：索引/按需拉取/搜索 |
| 4 | 上下文管理 | 压缩/观察屏蔽/即时检索/子 agent 委托，对抗"上下文腐烂" |
| 5 | 提示词构建 | 分层组装：系统提示 → 工具定义 → 记忆文件 → 对话历史 → 用户消息 |
| 6 | 输出解析 | 有 tool_call → 执行循环；无 → 最终答案 |
| 7 | 状态管理 | LangGraph: typed dictionary + checkpoint；OpenAI: 四种互斥策略 |
| 8 | 错误处理 | LangGraph 四类：瞬时/可恢复/用户可修复/意外；Stripe 上限 2 次重试 |
| 9 | 护栏与安全 | 三层：输入/输出/工具护栏；"断路器"即时停止；Claude Code 约 40 个能力门控 |
| 10 | 验证循环 | 基于规则/视觉（Playwright）/LLM as judge；Boris Cherny: 自验证提升 2-3x 质量 |
| 11 | 子 Agent 编排 | Claude Code: Fork/Teammate/Worktree；OpenAI: agent as tool + 移交模式 |
| 12 | 7 步循环 | 提示词组装 → LLM 推断 → 输出分类 → 工具执行 → 结果打包 → 上下文更新 → 循环 |

## 7 个设计决策
1. **单 vs 多 agent**：先单再考虑多，工具 >10 个重叠或存在独立任务域时才拆分
2. **ReAct vs Plan-Execute**：LLMCompiler 报告快 3.6x
3. **上下文窗口策略**：ACON 保留推理轨迹，降 26-54% token，保 95%+ 准确率
4. **验证循环**：guides（事前引导）+ sensors（事后观察）
5. **权限架构**：宽松（效率）vs 限制（安全）
6. **工具范围**：砍 80% 工具往往更好（Vercel v0 / Claude Code lazy loading）
7. **Harness 厚度**：Anthropic 薄 harness；图框架厚；模型改进 → harness 减复杂度

## 主流框架对比
| 框架 | 核心模式 |
|------|---------|
| **Anthropic Claude SDK** | 单 query() 函数，"笨循环"，Gather-Act-Verify |
| **OpenAI Agents SDK + Codex** | Runner 类，三层（Core/App Server/Client） |
| **LangGraph** | 显式状态图，llm_call + tool_node 条件边 |
| **CrewAI** | Agent（角色+目标+背景故事+工具）/ Task / Crew 分层 |
| **AutoGen（→微软 Agent Framework）** | 对话驱动，5 种编排模式 |

## 关键洞察
- **脚手架类比**：建筑完工后脚手架应拆除。Manus 6 个月重写 5 次，每次在去除复杂性。
- **Harness 就是产品**：相同模型 + 不同 harness = 截然不同性能（TerminalBench：只改 harness 跳 20+ 位次）
- **共进化原则**：模型与特定 Harness 在后训练中共同训练，改变工具实现可能降性能
- **趋势**：Harness 不会消失，即使最强模型也需要管理上下文、执行工具、持久化状态、验证工作。

## 深度分析
### Harness 的本质：计算系统的自然抽象
Beren Millidge 的类比揭示了深层真相：Harness 重新发明了冯·诺依曼架构。这不是巧合，而是计算系统的自然涌现。当 LLM 被视为通用计算单元时，它必然需要内存（上下文窗口）、外存（外部数据库）、设备驱动（工具集成）和操作系统（Harness）——这意味着 Harness 不是过渡产物，而是 LLM 计算的永久基础设施层。

### 上下文腐烂：被低估的核心瓶颈
"迷失在中间"效应导致落在上下文窗口中部的关键内容性能下降 30%+，但业界讨论热度远低于模型参数规模。这揭示了一个不对称：开发者倾向于通过增大模型和窗口来掩盖问题，而非从根本上改进 Harness 的上下文管理策略。ACON 保留推理轨迹而降 26-54% token 的数据说明，上下文管理的优化空间可能大于模型本身的改进空间。

### "笨循环"哲学的战略价值
Anthropic 刻意将 Claude Code 的编排循环描述为"笨循环"——所有智能在模型里，Harness 只管理轮次。这不是技术限制，而是设计哲学：把判断权交给模型，Harness 专注于可靠执行。这一选择使系统随模型能力提升自动变强，同时将复杂度集中在可测试、可审计的基础设施层，而非分散在提示词各处的隐性规则。

### 框架战争的实质
LangGraph / CrewAI / AutoGen 的竞争表象下是同一问题的不同答案：状态该如何表达？LangGraph 用显式状态图，CrewAI 用角色-目标-背景故事的人格化封装，AutoGen 用对话驱动。这三种范式分别对应：确定性流程、不确定但有角色约束的流程、纯协作式流程。选择框架的本质是选择你的 agent 所需要的抽象层级。

### 共进化原则的工程含义
"模型与特定 Harness 在后训练中共进化"意味着：改变工具实现可能降性能，但更换模型也可能破坏已建立的 harness 模式。这对架构决策有直接后果——过度依赖特定模型的私有特性会锁死技术栈；但完全 neutrality（不做任何模型假设）又放弃了共进化带来的性能红利。成熟的做法是在交互层保持 neutrality，在编排层针对目标模型调优。

### 验证循环的成本收益
Boris Cherny 报告自验证提升 2-3x 质量，但这是有代价的：每步验证都意味着额外的 LLM 调用（成本翻倍+延迟增加）。实践中，验证粒度需要与任务风险等级匹配——高风险操作（删除文件、生产环境修改）值得全量验证，日常编码建议可简化为规则检查。这提示了一个原则：**验证循环不是越多越好，而是越准越好**。

## 实践启示
1. **先测上下文管理，再换模型**：在同等上下文管理能力下，Claude 3.7 和 GPT-4o 的差异远小于优化上下文压缩策略前后的差异。投入 20% 时间测量上下文利用率，往往比花 80% 时间做模型选型更有价值。
2. **工具设计遵循 80/20 但方向相反**：不是"加 20% 最有用的工具"，而是"砍掉 80% 低频工具"。Vercel v0 和 Claude Code 的实践都指向同一结论：少而精的工具集比多而杂的工具集产生更高质量的工具调用，降低模型决策负担。
3. **状态持久化从第一天就要规划**：不要把"状态"理解为"对话历史"。真正的状态是：当前目标进度、已完成步骤的检查点、待验证假设列表。这些需要用结构化格式（而非对话摘要）持久化，才能实现跨会话恢复和错误后继续执行。
4. **验证循环的入门配置**：先用规则验证（lint + 类型检查 + 测试），失败时再升级到 LLM as judge。Anthropic 的 guides + sensors 框架可以低成本实现——guides 写在系统提示词里（事前约束），sensors 用正则表达式或简单脚本实现（事后检查）。
5. **子 Agent 拆分阈值**：不是"超过 N 个工具就拆分"，而是"是否存在清晰的、边界明确的独立任务域"。Claude Code 的 Fork/Teammate/Worktree 三模式对应不同的协作复杂度——先用 Teammate（文件邮箱通信）探索，确认域划分后再上 Worktree（独立 git 分支）。
6. **Harness 厚度是动态的**：今天厚 harness（补偿模型能力不足）的代码，当模型足够强时可以变薄。把 harness 设计为可调的——模块化工具层、独立状态抽象、插拔式验证——而不是硬编码的流程控制，这样模型每进步一代，你的系统自动受益。
7. **护栏的最小化配置**：从"断路器"开始——任何 agent 超过预设 token 预算或执行时间就中断。这一个机制能防止 80% 的失控场景。其余护栏（输入过滤、输出分类）按需逐层叠加，而非一开始就把护栏设计得完备。
8. **框架选择决策树**：需要确定性长流程 → LangGraph；需要多角色协作 → CrewAI；需要最大化定制灵活性 → 自己实现笨循环（Anthropic SDK）；需要快速原型且不确定长期需求 → OpenAI Agents SDK。

## 相关实体
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](https://github.com/QianJinGuo/wiki/blob/main/entities/cong-30-fen-zhong-shou-gu-agent-dao-harness-cheng-wei-xin-hou-duan.md)
- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki/blob/main/entities/thin-harness-fat-skills.md)
- [你不知道的 Agent 原理架构与工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-principle-architecture-engineering-practice.md)
- [Design Patterns for AI Agents 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/design-patterns-for-ai-agents-2026.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

- [Agent Harness 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-architecture.md)
- [Agent架构关键变化：Harness正在成为新后端](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-architecture-harness-new-backend.md)
- [harness-engineering-systematic-explainer](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-systematic-explainer.md)
- [Claude Code Dynamic Workflows Source Code Architecture](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-source-code-architecture.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-structure-navigation.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

