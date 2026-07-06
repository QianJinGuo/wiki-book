# MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法

## Ch05.026 MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法

> 📊 Level ⭐⭐ | 16.9KB | `entities/mac-multi-agent-coding-skills-hooks-harness.md`

# MAC（multi-agent-coding）：Skills + Hooks 两层 Harness
> "**完全委托的前提，不是更强的模型，是更可靠的环境。**"
>
> "**Skills 引导 AI 做正确的事，Hooks 保证关键的事一定发生——两层叠在一起，Harness 才成立。**"

**MAC（multi-agent-coding）** 是一套将 **Skills（概率层）+ Hooks（确定性层）** 叠加的 Harness 框架设计。它是 **Anthropic 2026 Agentic Coding Trends Report 中"完全委托 0-20%"问题** 的解法：工程师已在用 AI 处理 60% 工作，但能完全委托的只有 0-20%——差距不是模型能力，是**信任环境**。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mac-multi-agent-coding-skills-hooks-harness.md)

## 一句话定位

**MAC 核心分层原则**：Skills 引导 AI 做正确的事（概率性）+ Hooks 保证关键的事一定发生（确定性）= Harness 成立

## 1. 问题背景：完全委托 0-20%

> "**Anthropic 今年发了一份《2026 Agentic Coding Trends Report》，里面有一个数字让我印象深刻：工程师已经在用 AI 处理 60% 的工作，但能'完全委托'给 AI 的任务只有 0-20%。**"

> "**这个差距是真实的。AI 能帮你写代码，但你不敢离开。不是因为 AI 不够聪明，而是你不知道它在没人盯着的时候会做什么——会不会跑错方向，会不会踩之前踩过的坑，出了问题你能不能找到在哪。**"

> "**完全委托的前提，不是更强的模型，是更可靠的环境。**"

**核心洞察**：从 Implementer（实现者）转向 Orchestrator（编排者）—— 人只在两个节点出现：**Planning 决定做什么，Verify 确认做对了**。中间全部 AI 自驱。**但光有这个设想不够**——LLM 指令遵从是概率性的，需要在 prompt 层之上加确定性约束。

## 2. MAC 的核心架构：两层叠加

### 关键判断
> "**MAC 把这两件事分开处理：Skills 是概率层（工作流 SOP），Hooks 是确定性层（代码驱动的约束）。**"

### 关系原则
- **Skills 引导 AI 做正确的事**（概率性，AI 理解 SOP 后按它走，但不是每次都完美）
- **Hooks 保证关键的事一定发生**（确定性，绕过 AI 直接运行的代码）
- **两层叠在一起，Harness 才成立**

## 3. Skills：概率层，工作流的形状

### 任务在哪里

任务从哪里来 / 怎么拆解 / 谁来执行 / 做完怎么验收 / 验收失败怎么修正 / 最终怎么合并——**这些步骤之间有逻辑、有判断、有需要人出现的节点，不是几行规则能写清楚的**。

### MAC 的解法

**Skills = 20 个工作流 SOP，按场景覆盖完整的 PDCA 循环**。

**完整流程**：
1. **每天开始工作前** —— 先做 **Planning** —— 决定今天做什么，写验收标准
   - **这一步不交给 AI**——"做什么"是判断，不是执行
2. **Planning 结束** —— **AI 接手**：读任务计划，为每个模块**启动独立的执行 Agent**，**并行工作**
3. **完成后** —— 通知人回来看结果：哪些完成了 / 哪些失败了 / 失败原因是什么
4. **人通过 Verify** —— **逐条核对验收标准，输出 PASS 或 FAIL 的确定结论**（不是模糊的"基本可以"）
5. **AI 接收结论** —— 用它来生成修正方案，重新执行，**直到通过为止**

### Skills 的局限

> "**Skills 是概率性的——AI 理解 SOP 之后会按照它走，但不是每次都完美。**"

**问题**：
- "**每次 session 开始先读任务列表**"——它会做，但不是每次
- "**出了问题记录一下**"——状态好的时候记，状态差的时候忘
- **用语言让 AI 记住某件事，你得到的是概率，不是保证**

## 4. Hooks：确定性层，Harness 的地基

### 为什么需要确定性层

> "**但有些事不能靠概率。**"

**三个必须由 Hooks 保证的事**：

**（1）上下文必须在**
- 每次打开 session，AI 要知道这期在做什么 / 这个模块历史上踩过哪些坑 / 上次做到哪里了
- **这些信息不在，它就从零开始，之前的积累对它来说不存在**

**（2）失败必须被记录**
- AI 调用工具出了问题，这条记录**不能消失在对话流里**——它是下次避坑的来源
- **靠 AI"意识到失败然后主动记录"，能不能发生取决于它当时的状态**

**（3）知识必须积累**
- 这次 session 做了什么决策 / 修了什么问题，下次打开还要能看到
- **工作不能每次都从空白开始**

### Hooks 的实现

> "**把它们从 AI 的行为里剥离出来，用代码保证它发生。**"

**Hooks = 挂在固定事件上的触发机制，不是给 AI 的指令，而是绕过 AI 直接运行的代码**：
- session 打开 → **上下文自动注入**
- 工具失败 → **记录自动落地**
- session 关闭 → **知识自动提炼写进记录**

> "**不管 AI 这次表现好不好，这些事情都会发生。**"

## 5. Harness 框架和项目知识，分开放

> "**MAC 本身不知道任何项目的业务细节。**"

**关键设计原则**：
- **MAC 提供工具和流程，但不存储任何项目状态**
- **当日任务 / 模块边界 / 历史踩坑 / 技术约定**——这些全部放在**项目自己的 `.claude/context/` 目录里**
- **MAC 的 Hooks 和 Skills 读的是这些文件，干的是这些文件描述的事情**

### 这个分离的价值

> "**MAC 可以在任何项目上用，不需要定制。项目不需要重新定义流程，只需要把自己的数据填进去。框架升级的时候，项目的知识不受影响。项目迁移的时候，框架不需要跟着走。**"

> "**这个分离让 MAC 成了真正可复用的东西，而不是某个项目的专属脚手架。**"

## 6. 回到 0-20%：Hooks 改变委托性质

> "**能'完全委托'的任务之所以少，本质上是信任问题——你不知道 AI 在没人看的时候会做什么，出了问题能不能找到，下次还会不会重蹈覆辙。**"

> "**MAC 的 Hooks 解决的正是这个**：失败有自动捕获，上下文有跨 session 持久，每次 session 结束都有活动记录。**AI 不是在一个透明度为零的黑盒里工作，而是在一套有迹可循的基础设施里运行。**"

> "**这不会让 0-20% 一夜变成 100%。但它改变了委托的性质**：不是'赌 AI 这次会不会跑偏'，而是'**我有能力在它跑偏的时候发现，并且不重蹈覆辙**'。"

> "**这个区别，才是值得搭 Harness 的理由。**"

## 核心金句

- "**完全委托的前提，不是更强的模型，是更可靠的环境。**"
- "**LLM 的指令遵从是概率性的** —— 在概率性之上堆更好的 prompt，得到的还是概率性的可靠。"
- "**必须在 prompt 层之上加确定性约束**。"
- "**Skills 引导 AI 做正确的事，Hooks 保证关键的事一定发生——两层叠在一起，Harness 才成立。**"
- "**用语言让 AI 记住某件事，你得到的是概率，不是保证**。"
- "**有些事不能靠概率** —— 上下文必须在 / 失败必须被记录 / 知识必须积累。"
- "**Hooks = 挂在固定事件上的触发机制，不是给 AI 的指令，而是绕过 AI 直接运行的代码**。"
- "**不管 AI 这次表现好不好，这些事情都会发生**。"
- "**MAC 可以在任何项目上用，不需要定制** —— 框架升级时项目知识不受影响，迁移时框架不需要跟着走。"
- "**AI 不是在一个透明度为零的黑盒里工作，而是在一套有迹可循的基础设施里运行。**"
- "**不是'赌 AI 这次会不会跑偏'，而是'我有能力在它跑偏的时候发现，并且不重蹈覆辙'。**"
- "**这个区别，才是值得搭 Harness 的理由。**"

## 与已有 wiki 实体的关系

### vs [晓斌 Agent-Oriented Infra](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md)
- 晓斌 = "harness = 根据角色、任务、权限范围自动组装的完整工作环境"（4 层 Comprehensible/Operable/Observable/Traceable）
- MAC = "**Skills + Hooks 两层叠加**"——更具体、更轻量、更聚焦"完全委托"的信任问题
- 共同点：都强调 harness 决定 agent 自主空间

### vs [wow-harness v3](https://github.com/QianJinGuo/wiki/blob/main/entities/wow-harness-v3-governance-protocol.md)
- v3 = 跨 session 事件时间线 + 概念图（**协议层**治理，更重）
- MAC = **Skills（概率 SOP）+ Hooks（确定性触发）**——**更轻量级**，可复用框架 vs 项目脚手架
- 共同点：都强调"跨 session 上下文持久 / 失败记录 / 知识积累"是 Harness 关键

### vs [高德 AI-Native 生产线](https://github.com/QianJinGuo/wiki/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md)
- 高德 = **企业级 R&D 生产线**（AI 全托管 / Self-Healing / 监督 Agent / 7×24 永动）
- MAC = **工程师个人 Harness 框架**（20 个 Skills + Hooks / Planning + Verify 两个节点）
- 共同点：都强调"用机制保证关键事件发生"（Hooks = 高德的 Self-Healing + 监督 Agent 思想）

### vs [Claude Code Dynamic Workflows](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-multi-agent-orchestration.md)
- Dynamic Workflows = **运行时动态生成 Harness**（Anthropic 官方功能，claude 现场写 workflow）
- MAC = **预定义 Skills + 触发式 Hooks**（工程师自定义 SOP + 自动化机制）
- 共同点：都强调"流程 = 数据"——workflow 是 skill 文件，hooks 是 code

### vs [Agent Harness 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-architecture.md)
- 7 层 harness 模型 = 抽象框架
- MAC = "**Skills 概率层 + Hooks 确定性层**"——harness 设计的**关键分层原则**
- 共同点：都把 harness 视为多层叠加

### vs [Rein](https://github.com/QianJinGuo/wiki/blob/main/entities/rein-go-agent-4-modules-5-type-boundaries.md)
- Rein = 4 模块 + 5 类型边界（**单 agent 内部**架构）
- MAC = Skills + Hooks（**多 agent 协作 + 跨 session** 框架）
- 共同点：都强调"边界"是工程化关键

## 启示

1. **完全委托 0-20% 的根因不是模型能力，是信任环境** —— 给 infra 补能力 = 扩大委托空间
2. **Skills vs Hooks 是 Harness 的核心分层原则** —— 概率层（AI 引导）+ 确定性层（代码保证）
3. **3 件不能靠概率的事**：上下文必须在 / 失败必须被记录 / 知识必须积累
4. **Hooks = 绕过 AI 直接运行的代码** —— 不依赖 AI 自觉
5. **Harness 框架 vs 项目知识 分开放** —— `.claude/context/` 模式让框架可复用
6. **"PDCA 循环 + 20 个 SOP"** —— 流程驱动 AI 工作
7. **"Planning + Verify 是人的两个节点"** —— 人在环上，不在环中
8. **委托的本质改变**：\"不是'赌 AI 会不会跑偏'，而是'我有能力在它跑偏的时候发现'\"

## 局限 / 待验证

- 文章作者匿名（公众号转载，原始出处不明）
- **Anthropic 2026 Agentic Coding Trends Report 引用** —— 需要验证报告是否真实存在 / 数据是否准确
- \"20 个工作流 SOP\"的具体内容未在文章中展开
- **MAC 项目是否开源 / 公开**未提及
- Hooks 实现细节（事件类型 / 触发器接口）未展开
- 实际使用效果（0-20% 提升到多少）未给出数据

## 相关对照
- [晓斌 Agent-Oriented Infra](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) —— 哲学框架
- [wow-harness v3](https://github.com/QianJinGuo/wiki/blob/main/entities/wow-harness-v3-governance-protocol.md) —— 跨 session 治理
- [高德 AI-Native 生产线](https://github.com/QianJinGuo/wiki/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md) —— 企业级 R&D 生产线
- [Claude Code Dynamic Workflows](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-multi-agent-orchestration.md) —— 动态工作流
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-architecture.md) —— 7 层模型
- [Rein](https://github.com/QianJinGuo/wiki/blob/main/entities/rein-go-agent-4-modules-5-type-boundaries.md) —— 单 agent 架构
- [Kimi Work](https://github.com/QianJinGuo/wiki/blob/main/entities/kimi-work-codex-vibe-working-paradigm-shift.md) —— 本地 Agent

## 深度分析

- **MAC 的本质是"概率+确定"双层叠加架构**：Skills（20 个工作流 SOP）负责引导 AI 做正确的事，但这是概率性的——AI 会按 SOP 走，但不是每次都完美；Hooks（挂在固定事件上的触发机制）则保证关键的事一定发生（上下文必须在 / 失败必须被记录 / 知识必须积累），两者缺一不可 

- **"完全委托 0-20%"的根因是信任缺失，不是模型能力**：Anthropic 报告显示工程师已用 AI 处理 60% 工作，但能完全委托的只有 0-20%——差距在于人不知道 AI 在没人盯着时会做什么、会不会踩之前踩过的坑、出了问题能不能找到。MAC 的解法不是提升模型能力，而是建立有迹可循的基础设施 

- **Hooks 改变了委托的性质**：不是"赌 AI 这次会不会跑偏"，而是"有能力在它跑偏的时候发现，并且不重蹈覆辙"——失败有自动捕获，上下文有跨 session 持久，每次 session 结束都有活动记录，AI 在透明的基础设施里运行 

- **MAC 框架与项目知识分离是关键设计**：MAC 本身不知道任何项目业务细节，所有项目状态存在项目自己的 `.claude/context/` 目录里——框架升级时项目知识不受影响，项目迁移时框架不需要跟着走，这让 MAC 成为真正可复用的 Harness，而非某个项目的专属脚手架 

- **Planning + Verify 是人在环上的两个节点**：人只在"决定做什么"和"确认做对了"两个节点出现，中间全部 AI 自驱——这体现了 Orchestrator（编排者）模式，人从 Implementer（实现者）转向协调者角色 

## 实践启示

- **在 prompt 层之上加确定性约束**：不要依赖更好的 prompt 来获得可靠的 AI 行为——prompt 是概率性的，必须在之上叠加代码级的 Hooks 来保证关键事件一定发生 

- **识别并固化"不能靠概率"的三件事**：每次 session 打开时上下文自动注入、工具失败时自动记录落地、session 关闭时知识自动提炼写进记录——这三件事必须由代码保证，不能依赖 AI 自觉 

- **将 Harness 框架与项目知识分离**：采用 `.claude/context/` 目录管理项目自己的业务细节，让框架成为可复用的工具而不是定制化脚手架 

- **以 PDCA 循环设计 Skills**：每个 Skill 都是一个工作流 SOP，覆盖完整的 PDCA 循环（计划→执行→检查→修正），通过 20 个 SOP 按场景覆盖实现 AI 工作的流程化驱动 

- **在关键节点保持人的判断力**：Planning 和 Verify 两个节点必须由人执行，确保"做什么"的判断质量和"做对了"的验证结论是确定性的 

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mac-multi-agent-coding-skills-hooks-harness.md)

---

