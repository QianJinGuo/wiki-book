# Tencent Vibe Coding to Agentic Engineering Backend

## Ch04.203 Tencent Vibe Coding to Agentic Engineering Backend

> 📊 Level ⭐⭐ | 11.2KB | `entities/tencent-vibe-coding-to-agentic-engineering-backend.md`

# 从Vibe Coding到Agentic Engineering：重构后台开发全流程

做后台开发的同事应该都有这个体会：从接到需求到最终发布，我们要在 PM、GitPlatform、编辑器、DevOps 平台、Galileo 之间来回横跳。每次切换都在丢上下文——刚在 PM 看完需求描述，切到编辑器就忘了某个细节；部署完测试环境去查日志，又得回忆刚才改了哪几行代码。

## Vibe Coding的问题

你可能听过 **Vibe Coding** 这个说法——打开 AI 对话框，用自然语言描述需求，让模型直接生成代码，跑通就算完。原型验证很爽，但一旦要上生产，问题就来了：生成的代码质量不可控、没有审查流程、改完了 commit message 也是乱的。说到底，Vibe Coding 是"提示即祈祷"（prompt-and-pray），你把需求扔给 AI，然后祈祷它别出错。

## Agentic Engineering的核心思路

今年行业里逐渐形成了一个更成熟的概念：**Agentic Engineering**（智能体工程）。核心思路是——人负责定义目标、约束条件和质量标准，AI 作为自主智能体在 **结构化流程** 中执行规划、编码、测试和迭代，每个关键节点都有人工审核。它不是让 AI 随意发挥，而是把 AI 的能力嵌入到一套有纪律的工程体系里。

## 实践方案

最近一周，我用 **Claude Code + 自定义 Skill/Command/MCP 体系** 做了一次实践：把从需求到发布的所有环节串到一个终端会话里。AI 全程保持对当前任务的理解，在预设的流程框架内自主执行；我只需要在关键节点做决策——审批计划、确认部署、审查代码。回过头看，这套东西就是 Agentic Engineering 在后台开发场景的一个落地样本。

## 全流程概览

从需求到发布，开发者的角色从"亲自执行"变成了"审核确认"：

| 阶段 | 核心工具 | 开发者做什么 |
|---|---|---|
| ① 需求创建 + 分支初始化 | `pm-dev` | 口述需求 |
| ② 需求澄清 | `brainstorming` | 回答 2-3 个问题 |
| ③ 制定实施计划 | `writing-plans` | 审核计划 |
| ④ 并行开发 | `executing-plans` + `/commit` | 几乎无需干预 |
| ⑤ 代码自审 | `code-review` | 审核报告 |
| ⑥ 编译部署 | `dtools` | 确认部署参数 |
| ⑦ 日志排查 | `galileo-log-query` | 手动触发测试 |
| ⑧ 创建 MR | `/create-mr` | 确认 MR 信息 |
| ⑨ AI 辅助评审 | `/review-mr` | 审核 AI 评审意见 |
| ⑩ 修复评审意见 | `/fix-mr` | 确认修复方案 |
| ⑪ 合入发布 | CI/CD | 点 Merge + 灰度发布 |

## 工具体系架构

这套工具链分三层：

| 层次 | 说明 | 示例 |
|---|---|---|
| **Skill**（技能） | 核心业务逻辑，由系统根据上下文自动触发，或被 Command 调用。每个 Skill 有独立的工具权限白名单和执行流程 | `pm-dev`、`git-workflow`、`code-review`、`dtools`、`galileo-log-query`、`git-context`、`wiki-doc`、`service-analyzer` |
| **Command**（斜杠命令） | 用户通过 `/xxx` 主动调用的入口，轻量级路由，委托给对应的 Skill 执行 | `/commit`、`/create-mr`、`/review-mr`、`/fix-mr`、`/analyze-codebase` |
| **MCP Server**（外部服务） | 通过 Model Context Protocol 连接的外部平台 API，为 Skill 提供数据和操作能力 | GitPlatform MCP、PM MCP、Galileo MCP、KnowledgeBase 知识库 MCP、InternalWiki MCP |

此外还有来自 `superpowers` 插件的**结构化工作流 Skill**（`brainstorming`、`writing-plans`、`executing-plans`、`subagent-driven-development`、`verification-before-completion` 等），它们定义了从需求澄清到代码交付的标准流程，防止 AI 跳过关键步骤自由发挥。

## 关键设计原则

- **Command 是薄壳**：每个 `/xxx` 命令只有一行——委托给 `git-workflow` 对应模块执行
- **Skill 之间可组合**：`pm-dev` 创建完需求单后自动调用 `brainstorming`，brainstorming 完了接着调 `writing-plans`
- **Superpowers 管纪律**：brainstorming 确保 AI 先理解再动手；writing-plans 确保先计划再执行；executing-plans 确保按步骤推进而不跳跃
- **MCP 对用户透明**：你不需要知道"调用 GitPlatform API 创建 MR"这件事——Skill 通过 MCP 自动完成

## 传统方式 vs Claude Code 方式

| 传统方式 | Claude Code 方式 |
|---|---|
| 打开 PM 页面创建需求，手动建分支 | 口述需求，自动创建需求单和分支 |
| 自己拆解任务、逐个实现 | AI 制定计划、子 Agent 并行执行、自动 commit |
| 手动 `dtools` 部署，排查实例名过期 | AI 自动检测过期配置并修正 |
| 手动写 MR 描述，对照 commit 逐条整理 | AI 分析全部 commit 自动生成规范描述 |
| 在 GitPlatform 页面逐条看评审、手动改代码 | AI 拉取评论、定位代码、生成修复、自动提交 |

## 核心理念

这就是 **Agentic Engineering** 的核心理念——人是编排者（Orchestrator），AI 是自主执行者：

- **人负责**：定义目标、拆解任务、审核方案、把关质量、最终决策——方案选择、计划审核、部署确认、评审把关、合入发布
- **AI 负责**：在结构化流程中自主执行——代码生成、commit 格式化、MR 描述整理、评审意见定位、日志分析……这些重复性高、规则明确的工作

这和 Vibe Coding 的本质区别在于：Vibe Coding 依赖运气，Agentic Engineering 依赖流程。每个关键节点都有人工审核，AI 是高效的执行者，不是不受控的自动机。

## 深度分析

### 1. Vibe Coding 的本质缺陷是"过程不可控"

Vibe Coding 本质上是一种"提示即祈祷"的工作流——把需求扔给 AI，然后祈祷结果正确。 这种模式的问题不在于 AI 能力不足，而在于整个过程缺乏结构化约束：没有计划审查、没有代码审查、没有评审意见修复流程。AI 生成代码的质量完全取决于 prompt 的质量，而 prompt 质量本身又依赖工程师的描述能力——这是一个不稳定的依赖链。

### 2. 三层工具架构实现了关注点分离

Skill/Command/MCP 三层架构的核心价值在于分离了不同层次的关注点： Skill 承载核心业务逻辑，定义工具权限白名单和执行流程；Command 提供用户入口，仅做轻量路由；MCP Server 封装外部平台 API。brainstorming → writing-plans → executing-plans 这类链式调用进一步强制了"先理解再动手"的工程纪律，防止 AI 跳过关键步骤自由发挥。

### 3. "人作为编排者"重新定义了开发者的角色

在 Agentic Engineering 范式下，开发者的角色从"执行者"转变为"审核者和决策者"。 各阶段的时间统计显示，需求澄清约 5 分钟、实施计划审核约 3 分钟、代码自审约 2 分钟——大量时间花在关键节点的决策上，而非具体实现。 这意味着 AI 不是来替代开发者，而是来承担执行层的工作，让开发者聚焦于判断和决策。

### 4. Token 消耗的规模效应反映的是工程化程度

文章坦诚提到 token 消耗不小，但这恰恰反映了 Agentic Engineering 与 Vibe Coding 的本质区别： Vibe Coding 试图用最少的 token 完成任务，结果是质量不可控；Agentic Engineering 在每个关键节点都进行审核和确认，token 消耗更高但质量有保障。94% 的 cache hit rate（在 Codex 的 6 小时运行案例中） 说明结构化流程下的上下文复用效率远高于随意对话。

### 5. AI 评审的局限性要求"跨模型审查"

文章明确指出 AI 评审意见"不一定都是对的"，可能误判代码意图或遗漏业务上下文。 跨模型审查的实践——谁写的代码让别的模型来审——本质上利用了不同模型的知识结构和关注点差异，避免同一个模型的思维盲区。 这提示在生产环境中，AI 评审应作为人工评审的辅助而非替代。

## 实践启示

1. **用 Skill 编排替代自定义实现**：文章中 `pm-dev` 早期版本自己实现了头脑风暴功能，后来发现 `superpowers` 插件已有成熟方案，最终替换为链式调用。 **教训：自定义 Skill 的核心价值是编排和串联，而不是从零实现所有能力。** 优先复用成熟工具，专注业务特有流程的编排。

2. **Command 设计遵循"薄壳"原则**：每个 `/xxx` 命令只有一行委托逻辑，不承载任何业务判断。 这确保了命令的通用性和可替换性——用户说"帮我提交代码"和输入 `/commit` 触发的是同一流程。

3. **强制关键节点人工审核**：brainstorming（需求澄清）、writing-plans（计划审核）、code-review（代码自审）都是强制关卡，不能跳过。 在设计 AI 开发流程时，必须预设人工介入点，不能让 AI 完全自主运行到最终交付。

4. **自审先于外部评审**：阶段 5 的代码自审在 reviewer 看到之前就消灭格式、命名等低级问题。 实践建议：提 MR 前先跑一遍 AI 自审，让 reviewer 聚焦更高层面的设计和逻辑，而非被格式问题分心。

5. **跨模型审查避免单一模型盲区**：用 Claude 写的代码用 Codex 审查，反之亦然。 在团队中建立机制，让不同模型交叉审查同一代码，能显著提高问题发现率。

## 相关实体
- [从Vibe Coding到Agentic Engineering重构后台开发全流程](ch04/616-agentic.html)
- [Karpathy Vibe Coding To Agentic Engineering](ch04/616-agentic.html)
- [Fudan Peking Ahe Agentic Harness Engineering](ch04/236-ahe-agentic-harness-engineering.html)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](ch04/432-vibe-coding-agentic-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering V4](ch04/134-karpathy-vibe-coding-agentic-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tencent-vibe-coding-to-agentic-engineering-backend.md)

---

