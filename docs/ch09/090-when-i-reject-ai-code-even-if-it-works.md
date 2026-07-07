# When I reject AI code even if it works

## Ch09.090 When I reject AI code even if it works

> 📊 Level ⭐⭐ | 7.0KB | `entities/when-i-reject-ai-code-even-if-it-works-vinibrasil.md`

# When I reject AI code even if it works

## 摘要

Vinicius Brasil 在本文中提出了一个在 AI 辅助编码时代日益重要的实践问题：即使 AI 生成的代码能够正常运行、通过 CI，开发者也应该基于工程原则系统性地拒绝某些代码。文章从个人实践出发，总结了五条拒绝 AI 代码的具体标准，并论证了人工审查在 AI 编码工作流中不可替代的地位。

## 核心要点

### 认知过载问题

在 AI 编码代理（如 Copilot、Cursor、Claude Code）普及之前，开发者面对一个任务会经历「探索 → 思考 → 实验 → 实现」的完整过程。这个过程虽然耗时数天，但在提交 PR 时，开发者对每一行代码都有深入的理解，向同事解释变更也更加自信。

AI 代理改变了这一模式。即使遵循了最佳实践——从 plan mode 开始、将大任务拆分为多个阶段、采用 tracer-bullet 方式交付小变更——开发者仍然会在审查自己没有亲自思考过的代码时感到认知过载。这是 AI 编码的核心矛盾：**实现速度提升了，但审查能力没有同步增长**。

### 五条拒绝标准

作者提出了五个具体的拒绝场景，这些标准不是关于代码「能不能运行」，而是关于「该不该合并」：

1. **无法用自己的话解释方案** — 如果开发者不能向同事清晰地解释 AI 代码的 approach，说明理解不足，不应合并
2. **diff 大于问题本身** — AI 倾向于生成过度工程化的解决方案，当变更规模与问题复杂度不匹配时应拒绝
3. **在证明需要之前引入抽象** — AI 常常过早引入工厂模式、策略模式等设计模式，增加了不必要的间接层
4. **本地可行但增加系统认知负担** — 代码通过测试但使系统更难推理时，质量实际下降了
5. **信任输出超过理解** — 当开发者发现自己在「信任 AI」而非「理解代码」时，这是一个危险信号

### 二次尝试的价值

文章中一个关键洞察是：作者经常在第一次 AI 会话后拒绝所有变更并重新开始。第二次会话的关键差异不在于 LLM 模型的改进，而在于**开发者本身对问题的理解加深了**。第一次会话是探索性的，帮助开发者建立上下文；第二次会话中，开发者能更好地引导 AI 代理，而不是被 AI 代理引导。

## 深度分析

### 从 Harness Engineering 视角看代码审查

这篇文章本质上是在讨论 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md) 中的一个关键控制点：**人类审查回路**。在 Agent 系统中，harness 的作用是在 Agent 的自主性与系统可靠性之间建立边界。代码审查正是这个边界的具体体现——它是 Agent 输出进入生产系统的最后一道关卡。

从控制论的角度，AI 编码代理的工作流可以建模为一个开环系统（open-loop system），因为 Agent 生成代码后缺乏对代码长期影响的反馈。人类审查者的角色是将这个开环系统转变为闭环系统（closed-loop system），通过拒绝不当代码提供负反馈信号，从而校准 Agent 的后续输出。

### 认知科学视角

作者描述的「认知过载」现象在认知科学中有明确的对应概念——**认知负荷理论**（Cognitive Load Theory）。传统代码审查中，审查者需要处理三类认知负荷：

- **内在负荷**（Intrinsic Load）：理解代码逻辑本身的复杂度
- **外在负荷**（Extraneous Load）：代码组织方式带来的额外理解成本
- **关联负荷**（Germane Load）：将新代码与已有系统知识整合的认知成本

AI 生成的代码往往同时增加了内在负荷（方案可能不是最优的）和外在负荷（抽象层过多），而审查者缺乏编写过程中的上下文积累，导致关联负荷也显著增加。

### 工程实践的演化

文章提出的五条标准实际上是对传统代码审查标准的重新校准。在 AI 之前，「能否运行」很少成为审查的主要关注点，因为手动编写的代码通常在提交前已经过本地测试。AI 时代，「能否运行」成为了最容易达到的标准，而「是否应该合并」成为了新的核心问题。这与 [Agentic Coding Workflow](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md) 中讨论的质量控制层直接相关。

作者也承认了一个重要的现实约束：AI 编码代理确实需要优秀的工程师来引导它们产出优秀的方案。这不是对 AI 能力的否定，而是对人机协作模式的准确定位——**AI 是加速器，不是替代品**。

## 实践启示

1. **建立个人拒绝清单** — 将五条标准扩展为团队级别的 code review checklist，特别关注「diff 大于问题」和「过早抽象」两个场景
2. **实施二次会话模式** — 对复杂任务，第一次 AI 会话用于探索和理解问题，第二次会话才进行实际实现
3. **强制解释环节** — 要求开发者在 PR 描述中用自己的话解释 AI 代码的方案，无法解释的代码不予合并
4. **监控 Agent 输出规模** — 跟踪 AI 生成的 diff 大小与问题复杂度的比率，异常大的 diff 应触发额外审查
5. **培养审查能力** — AI 编码时代，代码审查能力比代码编写能力更加关键，团队应投入更多培训资源

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md) — 代码审查作为 Agent 系统的控制层
- [Agentic Coding Workflow](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md) — AI 辅助编码的完整工作流
- [Building Reliable Agentic AI Systems](../ch04/243-building-reliable-agentic-ai-systems.html) — 同样关注 AI 系统的工程可靠性
- [Claude Code Dynamic Workflows](ch09/078-claude-code-dynamic-workflows.html) — AI 编码代理的实践模式

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/when-i-reject-ai-code-even-if-it-works-vinibrasil.md)

---

