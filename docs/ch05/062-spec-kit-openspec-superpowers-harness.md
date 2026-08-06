# Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构

## Ch05.062 Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构

> 📊 Level ⭐⭐ | 9.6KB | `entities/spec-kit-openspec-superpowers-hybrid-harness.md`

# Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层 Harness 架构

> 作者 CCC 在对比 Spec Kit、OpenSpec、Superpowers 三个框架后，选择各自取其精华，自建了一套更适合中大型团队棕地项目的三层 Harness 方案。核心思路：拿 OpenSpec 做底座骨架，补上 Superpowers 式的铁律纪律思维，再套一层自己的 Harness 约束层，形成「哈尼层 → Skill 层 → Spec 层」的分层架构。

## 摘要

本文记录了一个中大型前端团队在棕地项目中落地 AI Coding 工作流程的真实实践。作者在评估了 Spec Kit（宪法思维 + 阶段门控）、Superpowers（铁律纪律 + 14 Skill 全链）、OpenSpec（Delta Spec + 单目录收拢）三个主流框架后，发现没有一个能直接满足中大型棕地项目的需求——Spec Kit 太重、Superpowers 方向偏且成本高、OpenSpec 缺乏纪律约束。最终作者取三者的核心优势，自建了一套三层架构，经过四个月的实际验证，组件误用率下降 80%+。

## 核心要点

- **三层架构**：Harness 层（CLAUDE.md 可验证约束 + 决策点 + 组件分层对照表）→ Skill 层（8 个 Skill，带硬门控的执行步骤，借鉴铁律纪律）→ Spec 层（Delta Spec，只写变化的规范）
- **组件分层对照表**：L0 原始层（禁止直接使用）→ L1 封装层（优先使用）→ L2 业务层（搜到即用）→ L3 页面层（仅对应页面内）。自动维护：review 发现违规 → 判断规范缺失 → 自动补入 CLAUDE.md
- **流程裁剪**：三种模式——full（完整链）、light（小改动）、bugfix（独立链路），避免小改动大流程
- **规范累积机制**：四个月从 10+ 行增长到 40+ 行，误用降 80%+——规范不是一次性设计的，是在使用中生长出来的
- **关键洞察**：LLM 的乐观偏见是 RLHF 训练副产物，约束力来自"违反就有后果"的闭环设计
- **真实案例验证**：用户管理列表加角色筛选，全程约 50 分钟，review 抓到 2 个问题（1 规范缺失 + 1 实现缺失），代码合入前拦截

## 深度分析

### 框架选择的底层逻辑：棕地项目 vs 绿地的结构性差异

现有 AI Coding 框架大多假设项目从零开始（绿地），可以直接采用推荐的完整流程。但中大型棕地项目面临的结构性挑战完全不同：

- **已有 10+ 万行代码**：无法用单一框架重写，框架必须适配现有架构而不是要求项目适配框架
- **已有的组件库和设计系统**：L0→L1→L2→L3 的分层不是新设计的，而是从现有的代码结构中提炼出来的
- **多样化的改動类型**：从几行 bugfix 到跨模块功能新增，一条流程无法覆盖所有场景
- **团队习惯和既有流程**：新框架不能要求团队改变工作方式，而是嵌入现有开发流程

这就解释了为什么三个框架各有所长但都不完美：它们是从不同角度解决 AI Coding 的流程问题，但各自的一体化方案假设了特定的项目生命周期阶段和团队成熟度。

### 铁律纪律的深层价值：反 LLM 乐观偏好的封闭设计

Superpowers 的"铁律"（Iron Law）不仅是工程纪律，更是针对 LLM 行为特性的对抗性设计。CCC 的观察精准指出了 RLHF 训练的一个副产物：**LLM 天然倾向于"乐观"——跳过验证步骤、在不确定时自行假设、绕过门控流程**。这不是 bug，这是 RLHF 优化过程中对"让用户满意"的过度优化——模型学会了对模糊指令给出看起来合理的假设而非承认不确定性。

因此，约束力的关键不在于规范写得有多详细，而在于"违反就有后果"的闭环设计：

- 硬门控（MUST/ABSOLUTELY）：不是建议性的 should，而是违反即打回的 **must**
- 反合理化（Anti-Rationalization）：禁止 LLM 自行解释为什么跳过某个步骤
- 可验证约束（Verifiable Constraints）：每一条规范都能量化验证，不依赖主观判断

这一设计理念与 [Agent Harness 生产化](ch05/042-agent-harness.html)中的"可观测性闭环"思路一致——不是信任代理的行为，而是通过系统约束确保代理在安全边界内运作。

### 规范累积机制的进化逻辑

组件分层对照表从 10+ 行增长到 40+ 行，这个进化过程揭示了 AI Coding 工作流中规范管理的一个关键洞见：**规范不是"设计"出来的，是"生长"出来的**。传统的架构设计试图在开始时定义完整的规范体系，但棕地项目的代码结构过于复杂，无法通过静态分析完整捕捉。CCC 的方法采取了不同的策略：

1. **最小起点**：只初始化核心的分层框架（L0-L3），接受规范的不完整性
2. **review 驱动发现**：每次代码审查中发现的违规行为成为规范升级的输入
3. **自动回流**：发现的规范漏洞自动补入 CLAUDE.md，形成「发现 → 诊断 → 补规 → 预防」的闭环
4. **自我强化**：规范越多，AI 在代码生成时越少产生违规行为，review 负担逐步降低

误用降 80%+ 的效果验证了这一进化逻辑的可行性。这与其他规范化方案形成对比：一次性定义完整规范集的方式在棕地项目上往往因与既有代码结构冲突而难以落地。

### 与 Matt Pocock Skills 的对比视角

CCC 在文中提到了 Matt Pocock 的 grilling 方式（在约束中生长）与 Superpowers 的 brainstorming（从零探索）的对比。这一对比触及了 AI Coding 工作流的一个更深层问题：**AI 应如何从"自由探索"与"约束生成"之间取得平衡？**

- Brainstorming 模式适合从零起步、需要创意探索的场景
- Grilling 模式适合在既有约束下优化、需要精确执行的场景
- CCC 的三层架构本质上是 grilling 模式的工作流工程化——将约束封装在 Harness 层和 Skill 层，让 AI 在 Spec 层的变化描述中自由发挥，但受上下层结构的约束

这与 [Agent vs Workflow 控制权连续谱](../ch04/749-agent-vs-workflow.html)中描述的"受控自主"模式一致：不是完全信任 AI 的自主性，也不是完全剥夺 AI 的灵活性，而是在多层约束中给 AI 留出可控的自由度。

## 实践启示

1. **棕地项目需要"可生长"的规范体系**：一次性定义完整规范集在棕地项目中往往失败。规范应是一个进化系统，从最小起点开始，通过 review 反馈逐步生长。CCD 的四个月 10→40+ 行增长曲线是一个可参考的模式。

2. **约束力来自闭环设计，而非规范详细程度**：LLM 的乐观偏见决定了规范写得再详细，如果不给违反附加后果，就会被忽略。硬门控 + 反合理化 + 可验证约束的闭环设计是约束有效性的关键。

3. **流程裁剪是棕地项目的必需品**：full / light / bugfix 三种模式让团队在不用牺牲大改动的质量的同时，不为小改动付出高流程开销。KISS 原则同样适用于 AI Coding 工作流设计。

4. **规范自动维护机制是长期可持续的关键**：review 发现违规 → 判断规范缺失 → 自动补回 CLAUDE.md 的闭环让规范维护不依赖人工记忆和手动更新。这对中大型团队的长期可持续性至关重要。

5. **选择框架时优先考虑适配性而非完整性**：没有框架能满足所有场景。CCC 的策略——取各框架核心优势、自主组合、根据实际需求裁剪——比寻找"最佳框架"更务实。Harness 层（CLAUDE.md）作为约束承载层的思路值得所有采用 AI Coding 的团队参考。

## 相关实体

- [Matt Pocock Skills vs Superpowers](../ch03/076-skills.html) — 同一路线对比的另一视角
- [Superpowers 三器合一](ch05/121-ai-coding.html) — Superpowers 在 Comet+OpenSpec 流水线中的角色
- [Agent vs Workflow 控制权连续谱](../ch04/749-agent-vs-workflow.html) — 架构选择的底层框架
- [Agent Harness 生产化](ch05/042-agent-harness.html) — 生产环境中的 Agent 约束与可观测性设计
- [Spec-Driven Development Harness](ch05/017-harness.html) — 与 Spec 层配合的 Harness 方法论
- [AI-Friendly 后端标准化路径](ch05/023-ai-friendly.html) — 另一视角的工程规范建设实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/spec-kit-openspec-superpowers-hybrid-harness.md)

---

