## Ch02.001 Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分

> 📊 Level ⭐⭐ | 27.8KB | `entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md`

# Hugging Face AI Agent 术语表

## 核心问题：术语混乱

**AI Agent 是这两年最常被提到的 AI 词之一**。

**但问题是**：同样是"Agent"，**很多人说的并不是同一件事**：
- 有人把"**会调用工具的大模型**"叫 Agent
- 有人把"**驱动模型执行的整套系统**"叫 Agent
- 有人把"**负责某个子任务的子模块**"叫 Agent

> "**不是资料太少，而是术语越来越多，大家却未必在用同一套定义。**"

**Hugging Face 发布 AI Agent 术语表的初衷**：
- 系统梳理这波讨论里**最常出现的一批核心概念**
- 无论你是**构建 / 部署 / 日常使用 Agent**，这些词几乎都会反复遇到
- 最后单独补充一组**和模型训练相关的概念**

## 相关实体
- [Harness Engineering 第三代工程范式](ch01-602-llm-raiders-and-how-to-repel-them.html)
- [Cursor Harness Model Production Floor](ch01-235-claude-code-vs-hermes-session-vs-goal-runtime.html)
- [Fudan Peking Ahe Agentic Harness Engineering](ch04-220-fudan-peking-ahe-agentic-harness-engineering.html)
- [From Agent Protocol To Harness Skill](ch04-351-from-agent-protocol-to-harness-skill.html)
- [Harness Engineering Framework](ch05-041-harness-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md)

- [is grep all you need? — 检索 × harness × 交付方式耦合三元组（pwc 论文 arxi](ch05-044-is-grep-all-you-need-检索-harness-交付方式耦合三元组-pwc-论文-arxi.html)
- [model-harness-fit-agent-harness](ch01-217-model-harness-fit-agent-harness.html)

## 核心定义：Agent 不是一个模型

> "**AI Agent 是一个以大模型为核心、能够调用工具、接收反馈并持续完成任务的系统。**"

**最关键的词**：不是"生成文本"，而是"**持续完成任务**"。

| 类型 | 范式 | 类比 |
|---|---|---|
| **普通聊天模型** | 你问一句，我答一句 | **单轮** |
| **Agent** | 你给一个目标 → 我先理解任务 → 再决定下一步做什么 → 做完一步根据结果继续往下走 | **持续循环** |

**Agent 任务的 4 个典型例子**（都不是一次回答能完成的）：
1. 帮你搜索资料并整理成摘要
2. 帮你读取一个文件并分析内容
3. 帮你调用代码工具处理数据
4. 帮你在网页上完成一连串操作

## Model 和 Agent：到底什么关系？

**很多人刚接触 Agent 时最容易混淆**：Agent 和 Model 是不是一回事？**不是**。

> "**Model 是 Agent 的核心，但不是 Agent 的全部。**"

**Model 本质**：**"文本进，文本出"**
- **没有跨调用记忆**
- **没有执行循环**
- 可以表达"我下一步想调用某个工具"的意图
- **但真正去点击网页、读取文件、调用 API 或运行工具，还得靠模型外面的系统来完成**

## Scaffolding 和 Harness：分别做什么？

**这两个词经常一起出现**，也最容易一起被叫成"Agent 框架的一部分"。但如果想真正看清一套 Agent 系统，**最好把它们分开理解**。

**核心记忆口诀**：

> "**Scaffolding 管'怎么想'，Harness 管'怎么跑'。**"

| 概念 | 职责 |
|---|---|
| **Scaffolding** | **"怎么想"** — 模型推理和决策的脚手架（prompt 结构 / 推理步骤 / 思维链） |
| **Harness** | **"怎么跑"** — 模型外的执行系统（工具调用 / 记忆管理 / 执行循环） |

## Context Engineering 和 Policy：一个管输入，一个管行为

**这两个概念都会影响 Agent 下一步怎么做**，但它们并不是一回事：

- **Context Engineering 讲的是模型在每一步到底看见什么**
- **Policy 讲的是基于这些输入表现出怎样的行为方式**

### Context Engineering：决定模型每一步看见什么

> "**如果说 Prompt Engineering 关心的是'提示词怎么写'，那么 Context Engineering 更关心的是：在 Agent 执行的每一步里，模型到底应该看到什么信息。**"

**包含的内容**：
- 系统提示词
- 工具说明
- 历史对话
- 检索进来的知识
- 工具返回结果

**关键特征**：
- **不是一次性的设置** — 随着任务推进，harness 会**持续决定哪些信息保留、哪些丢弃、哪些重新注入**
- **在训练和推理两端都适用**
- 训练时塞错了：模型学到的东西可能会偏掉
- 推理时塞错了：通常还能通过改提示词或重配上下文再来一次

### Policy：决定 Agent 按什么方式做选择

> "**Policy 指的是一个 Agent 所遵循的行为方式：给定一种情境，它会以什么方式在多个可能动作之间做选择。**"

**RL 严格定义** vs **LLM Agent 实用定义**：
- **RL 定义**："对各个可能动作的概率分布"
- **LLM Agent 实用**：这套策略**一部分学在模型权重里，一部分又受到提示词、工具、记忆和执行循环的影响**

**关键区分**：

> "**Policy 不等于 Agent 本身。Agent 是那个在环境里真正采取行动的完整系统，Policy 则是它表现出来的行为方式。**"

## Tool / Skill / Sub-agent：三层不同东西

**这三个词很容易被混用，但它们其实对应三层不同的东西**：**动作、方法和分工**。

### 1. Tool — 一个具体动作

**Tool 是最基础的一层**：Agent 伸手够到自身之外的方式：
- 调用 API
- 代码解释器
- 数据库
- 网页搜索
- 文件系统

**关键机制**：
- **模型只会以结构化格式表达"我要用某个工具"的意图**
- **真正把调用路由出去、拿回结果并继续循环的是 harness**

> "**Tool 更像 Agent 的'手'。**"

### 2. Skill — 一套可复用的方法

> "**Skill 不只是一个动作，而是一整套围绕某个目标沉淀下来的做事方法。**"

**例子**（都不是一次工具调用能完成的）：
- 排查一个 bug
- 完成一次数据清洗
- 写一版市场调研摘要

**特点**：
- 往往需要**一组步骤、一套经验和一个相对稳定的处理流程**

> "**Skill 更像 Agent 的'套路'。**"

### 3. Sub-agent — 一个能独立完成子任务的 Agent

> "**Sub-agent 则更进一步。它不是一个被动工具，也不只是一套方法，而是另一个可以自己思考、自己调用工具、独立处理子任务的 Agent。**"

**典型场景**（主 Agent 写行业分析）：
- 一个 Sub-agent 去收集资料
- 一个 Sub-agent 去整理数据
- 一个 Sub-agent 去写成初稿
- 最后再把这些结果统一整合

**三者层次关系**：

```
Sub-agent（最复杂）= 独立可思考的 Agent
  ↑
Skill（中等）= 围绕目标的可复用方法
  ↑
Tool（最基础）= 一个具体动作
```

## 训练 Agent 的 4 个核心概念

> "**前面讲的，主要是 Agent 怎么被搭出来。而下面这几个词，更多出现在'Agent 怎么被训练得更强'这个阶段。**"

### Environment — Agent 可交互的环境

- 浏览器 / 文件系统 / 代码仓库
- 也可以是某种更抽象的任务空间
- **Agent 在环境里采取动作，环境再返回新的状态和结果**

### Rollout — 完整一次任务过程

> "**Rollout 指的是 Agent 从开始到结束完成一次任务的完整过程。它记录了 Agent 看到了什么、做了什么、最后结果怎样。**"

### Reward — 对执行结果的打分

> "**Reward 是对这次执行结果的打分。它告诉系统：这次做得好不好，哪里做对了，哪里做错了。**"

**Reward 来源**：
- 测试是否通过
- 人工偏好
- 其他评估方式

### Trainer — 利用 rollout 和 reward 更新模型

> "**Trainer 负责利用大量 rollout 和 reward 去更新模型，让 Agent 在反复试错中学会更好的策略。**"

**终极断言**：

> "**到了训练阶段，Agent 讨论的就不只是'会不会用工具'，而是'能不能在环境里不断变强'。**"

## 终极概念图（文字版）

> "**AI Agent 不是一个单独的新模型名词。它更像是一整套围绕模型搭起来的系统：模型负责理解和决策，工具负责行动，执行系统负责把任务一轮轮推进下去。**"

**把这些概念分清之后，再去看各种 Agent 产品 / 框架 / 论文，就不会那么容易混乱了**。

## 9 大核心概念速查表

| 概念 | 一句话定义 | 类比 |
|---|---|---|
| **Model** | 文本进 / 文本出；没有跨调用记忆 / 没有执行循环 | 大脑 |
| **Agent** | 以大模型为核心 / 调用工具 / 接收反馈 / 持续完成任务 | 完整机器人 |
| **Scaffolding** | 管"怎么想"（prompt 结构 / 推理步骤） | 思维脚手架 |
| **Harness** | 管"怎么跑"（工具调用 / 记忆 / 执行循环） | 执行系统 |
| **Context Engineering** | 决定模型每一步看见什么（不是一次性设置） | 注意力管理 |
| **Policy** | Agent 在多个可能动作之间做选择的行为方式 | 行为模式 |
| **Tool** | Agent 伸手够到自身之外的一个具体动作 | **手** |
| **Skill** | 围绕目标沉淀下来的一整套做事方法 | **套路** |
| **Sub-agent** | 一个能独立完成子任务的 Agent（可自思/调工具） | **代理人** |
| **Environment** | Agent 可交互的环境（浏览器/文件系统/任务空间） | 世界 |
| **Rollout** | 一次完整任务过程（看到什么/做什么/结果怎样） | 一次实验 |
| **Reward** | 对执行结果的打分 | 反馈 |
| **Trainer** | 利用 rollout 和 reward 更新模型 | 训练器 |

## 与已有实体的关系

**本实体是"概念术语表"类**——与所有其他 entity 形成**统一的定义层**：

- claude md init anthropic architecture — Claude Code 内部架构 = 实际产品中如何组合 Scaffolding / Harness / Skill / Tool
- `Mac Multi Agent Coding Skills Hooks Harness` — MAC = Skills 概率层 + Hooks 确定性层 = Skill/Policy 的具体实现
- `Hermes Agent 12 Layer Full Configuration Guide` — 12 层配置 = Agent 各组件的部署清单
- `Hermes Agent Skill Crossover Optimization` — Skill 互优化 = "Skill 是一整套做事方法"的具体进化
- `Impeccable` — Impeccable = "Skill" 的具体例子（前端设计 33+ star）
- `Agent Harness Architecture` — Harness 7 层 = "Harness 管怎么跑" 的展开
- `Miroflow Deep Research Agent Harness Mirothinker` — Deep Research Harness = "Tool + Skill + Sub-agent" 的实际组合
- `Rein Go Agent 4 Modules 5 Type Boundaries` — Rein = "Tool + Harness + Skill + Sub-agent" 的 Go 实现
- `Claude Code Dynamic Workflows Multi Agent Orchestration` — Dynamic Workflows = "Scaffolding" 的任务图固化
- `Hermes 9 Module Architecture` — 9 模块 = Agent 内部组件
- `Anthropic 95Pct Data Analysis Skill Stack Architecture` — Anthropic 95% = "Skill 路由器" 的具体实现
- `Impeccable Vibe Design Philosophy Anomaly` — Skill 哲学层
- `Didi Ibg Customer Experience Llm Quality Inspection 3 Pipelines` — 3 管线 = "Sub-agent" 在企业场景的实例

**本术语表 = 这一系列实体的"统一语言层"**。

## 核心金句

- "**AI Agent 是一个以大模型为核心、能够调用工具、接收反馈并持续完成任务的系统**"
- "**最关键的词，不是'生成文本'，而是'持续完成任务'**"
- "**Model 是 Agent 的核心，但不是 Agent 的全部**"
- "**Model 本质是'文本进，文本出'。更重要的是，它本身没有跨调用记忆，也没有执行循环**"
- "**Scaffolding 管'怎么想'，Harness 管'怎么跑'**"
- "**如果说 Prompt Engineering 关心的是'提示词怎么写'，那么 Context Engineering 更关心的是：在 Agent 执行的每一步里，模型到底应该看到什么信息**"
- "**Context Engineering 不是一次性的设置**"
- "**训练时塞错了，模型学到的东西可能会偏掉；推理时塞错了，通常还能通过改提示词或重配上下文再来一次**"
- "**Policy 不等于 Agent 本身。Agent 是那个在环境里真正采取行动的完整系统，Policy 则是它表现出来的行为方式**"
- "**Tool 更像 Agent 的'手'**"
- "**Skill 更像 Agent 的'套路'**"
- "**Sub-agent 则更进一步。它不是一个被动工具，也不只是一套方法，而是另一个可以自己思考、自己调用工具、独立处理子任务的 Agent**"
- "**到了训练阶段，Agent 讨论的就不只是'会不会用工具'，而是'能不能在环境里不断变强'**"
- "**AI Agent 不是一个单独的新模型名词。它更像是一整套围绕模型搭起来的系统**"
- "**模型负责理解和决策，工具负责行动，执行系统负责把任务一轮轮推进下去**"
- "**把这些概念分清之后，再去看各种 Agent 产品、Agent 框架和 Agent 论文，就不会那么容易混乱了**"

## 深度分析

### 1. 为什么术语分歧会成为 Agent 落地的核心障碍

Hugging Face 这篇术语表的真正价值，不在于定义本身，而在于它揭示了一个结构性问题：整个行业对 "Agent" 这个词的使用是**多层次的**，且每一层都有其合理性。

当一个人说 "Agent 调用了工具"，他可能指的是：(a) 模型表达了一个工具调用意图；(b) Harness 实际执行了这个调用；(c) Sub-agent 在独立完成一个子任务。 这三种理解指向完全不同的工程实现，但都会被笼统地称作 "Agent 在调用工具"。这种歧义会在团队协作、技术方案评审和框架选型时造成大量无效争论。

术语统一不是语义洁癖，而是**团队认知对齐**的前提。当一个团队在讨论 "要不要给 Agent 加一个 Skill" 时，如果每个人脑子里想的 "Skill" 是不同的东西——有人想的是单一工具，有人想的是完整工作流——那么讨论结果大概率无法落地。

### 2. Scaffolding 和 Harness 的二分法是一种设计哲学

Scaffolding/Harness 的二分法不是 Hugging Face 的随意分类，而是一种有意识的**架构哲学**：将 "推理逻辑" 和 "执行逻辑" 分离。

这一思想在传统软件工程中并不陌生：业务逻辑（Business Logic）和运行时框架（Runtime Framework）的分离是所有成熟框架设计的基本原则。但在大模型时代，这个分离有了新的含义：

- **Scaffolding** 对应的是 "模型应该怎么思考"——prompt 结构、few-shot 示例、思维链、推理步骤的组织方式
- **Harness** 对应的是 "模型思考完了应该怎么动"——工具调用的路由、记忆的读写、循环的终止判断

这种分离的工程价值在于：**可独立迭代**。你可以换一套 prompt（Scaffolding 变更）而不动执行系统，也可以升级工具调用框架（Harness 变更）而不改模型推理逻辑。在实际项目中，这两个模块的变更频率和改动风险完全不同，混在一起会给迭代带来不必要的耦合。

### 3. Context Engineering 的 "非一次性" 特性是它最容易被忽视的维度

大多数讨论 Context Engineering 的人，会把它理解为 "给模型提供正确的上下文"，但往往会忽略一个关键点：上下文不是静态填充的，而是**动态管理的**。

在 Agent 的执行循环中，Harness 每一步都在决定：保留哪些历史信息、丢弃哪些中间结果、注入哪些新的上下文片段。这个决策的质量直接影响模型每一步推理的有效性。

训练阶段和推理阶段对 Context Engineering 的容错度不同，这一点值得特别关注：训练时一旦塞错了信息，模型权重会学到错误的关联，这个错误是嵌入模型内部的；推理时塞错了，通常可以通过调整提示词或上下文重新来，但这种 "重来的可能性" 会让人低估错误上下文的危害。

### 4. Tool / Skill / Sub-agent 的三层模型揭示了 Agent 能力的层次天花板

这个三层模型（Tool < Skill < Sub-agent）本质上描述的是 Agent 能力的**递进关系**：从被动工具，到有固定套路的方法，再到主动思考的独立 Agent。

理解这个层次天花板很重要，因为每提升一层，系统复杂度都会显著增加：

| 层次 | 自主程度 | 需要的管理 | 失败模式 |
|------|---------|-----------|---------|
| Tool | 无自主，需要 Harness 路由 | 最低 | 调用失败、参数错误 |
| Skill | 半自主，有固定处理流程 | 中等 | 流程不适用、步骤遗漏 |
| Sub-agent | 完全自主，独立推理 | 最高 | 目标误解、子任务协调、循环 |

这意味着：在设计 Agent 系统时，应该尽可能在底层解决问题（用 Tool 组合能完成就不用 Skill，能用 Skill 解决就不用 Sub-agent），只有在低层方案明显不够用时才升级到上一层。Sub-agent 虽然最灵活，但也最难调试、最容易失控。

### 5. 训练端四概念（Environment/Rollout/Reward/Trainer）代表了 Agent 工程化的下一个前沿

当讨论从 "Agent 怎么搭" 进入 "Agent 怎么训练" 时，实际上是在讨论 Agent 的**自我改进能力**。

Environment/Rollout/Reward/Trainer 这四个概念，直接对应强化学习（RL）的基本框架，但移植到 LLM Agent 场景时遇到了独特挑战：

- **Environment**：真实世界的 Agent 任务（网页操作、文件系统、代码执行）比 RL 的标准环境要复杂和不可预测得多
- **Rollout**：一次完整的 Agent 任务执行可能非常长，包含几十到上百步工具调用，rollout 的成本极高
- **Reward**：Agent 任务的结果质量往往无法用自动指标衡量（需要人工偏好或复杂评估函数）
- **Trainer**：用 rollout 和 reward 的信号更新模型，但 LLM 的全量微调成本远高于 RL 的策略梯度更新

这四个概念的存在，标志着一件事：**Agent 的核心竞争力正在从"能不能用工具"转向"能不能在环境中持续变强"**。能够高效收集 rollout、设计可靠 reward 信号、实现低成本 trainer 的框架，将在未来 Agent 竞争中占据核心优势。

## 实践启示

### 1. 在团队内部建立统一术语卡斯

当团队开始使用 Agent 相关技术时，第一件事不是选框架，而是**在团队内部建立一份术语对照表**——明确每个核心概念在当前项目语境下的具体含义。

建议：把本文的 9 大核心概念速查表作为基准，结合项目实际情况定义每一个词的项目级含义。每个人的 "Agent" 可能不一样，每个人的 "Skill" 也可能不一样，提前对齐能避免后期大量无效讨论。

### 2. 始终区分 Scaffolding 变更和 Harness 变更的变更管理策略

当 Agent 系统出现问题时，第一判断应该是：**问题出在"怎么想"还是"怎么跑"**。

如果是 Scaffolding 问题（模型推理质量下降、思维链不连贯），调整 prompt 结构或 few-shot 示例；如果是 Harness 问题（工具调用失败、记忆混乱），检查执行循环和路由逻辑。**这两类问题的诊断路径和修复策略完全不同**，混在一起诊断会大幅拖慢调试速度。

建议：为 Scaffolding 和 Harness 维护独立的变更日志，当问题出现时先分类再定位。

### 3. 把 Context Engineering 作为一等公民来设计，而非事后补充

不要等到推理效果不好了才想起来 "调一调上下文"。Context Engineering 应该从系统设计之初就被纳入考量。

关键实践：每个工具调用返回的结果片段，是否需要保留在上下文中？保留多久？历史对话中哪些信息应该在第 N 步时继续暴露给模型？这些问题应该在 Harness 设计阶段就有明确的策略，而不是靠试错来决定。

建议：建立一份 "上下文决策表"，明确每类信息的保留条件和淘汰条件，作为 Harness 设计文档的一部分。

### 4. 优先用 Tool 组合解决新需求，只有在明显不够用时才引入 Skill 或 Sub-agent

在设计新的 Agent 能力时，应该先问：**这个问题能否用现有工具的组合来完成？** 只有当工具组合明显不够用或过于复杂时，才考虑引入 Skill 或 Sub-agent。

这一原则的直接价值：**降低系统复杂度，减少调试成本**。Sub-agent 虽然能力最强，但引入的目标理解、子任务协调和执行循环管理会带来全新的复杂度维度。在没有明确证据表明低层方案不够用之前，不要升级到更高层次。

### 5. 在训练 Agent 能力时，先确保 Environment 和 Reward 的可信赖，再考虑 Trainer

如果你的 Agent 需要被训练（而不是纯提示工程），那么最关键的前置工作不是选 trainer 工具，而是**确保 Environment 可复现、Reward 信号可靠**。

具体来说：Environment 是否足够稳定，能支撑大量 rollouts 的重复执行？Reward 的评估是否和真实任务目标一致？如果 Environment 不稳定，rollout 信号会充满噪声；如果 Reward 设计有偏，模型会优化错误的目标。在这两个条件不满足之前，上任何 trainer 都是浪费资源。

建议：先用人工评估或规则校验跑通一批 rollout，确认 Environment 和 Reward 基本可信后，再引入自动 trainer。

---
