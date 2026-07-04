# 从Vibe Coding到Agentic Engineering：重构后台开发全流程

## Ch04.395 从Vibe Coding到Agentic Engineering：重构后台开发全流程

> 📊 Level ⭐⭐ | 6.8KB | `entities/从vibe-coding到agentic-engineering重构后台开发全流程.md`

# 从Vibe Coding到Agentic Engineering：重构后台开发全流程

## 相关实体
- [Tencent Vibe Coding To Agentic Engineering Backend](ch04/196-tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Karpathy Vibe Coding To Agentic Engineering](ch03/045-agent.md)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](ch09/047-coding-agent.md)
- [Karpathy Vibe Coding Agentic Engineering V4](ch04/131-karpathy-vibe-coding-agentic-engineering.md)
- [Fudan Peking Ahe Agentic Harness Engineering](ch05/061-harness-engineering.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/从vibe-coding到agentic-engineering重构后台开发全流程.md)

## 深度分析

**从"提示即祈祷"到"结构化执行"的范式转变。** Vibe Coding 本质上是将需求直接扔给 AI 对话框，靠自然语言驱动代码生成，其核心特征是"提示即祈祷"（prompt-and-pray）——开发者把需求描述交给 AI，然后祈祷输出质量可接受。 这种方式在原型验证阶段确实爽，但一旦进入生产环境，代码质量不可控、审查流程缺失、commit message 混乱等问题接踵而至。Agentic Engineering 的出现代表了行业对这一问题的系统性反思：不是让 AI 自由发挥，而是把人定位为"编排者"（Orchestrator），AI 作为自主智能体在结构化流程中执行规划、编码、测试和迭代，每个关键节点都有人工审核。

**三层工具体系的精妙分层。** 文章揭示了一套分层工具架构：Skill（技能）承载核心业务逻辑，由系统根据上下文自动触发或被 Command 调用，每个 Skill 有独立的工具权限白名单和执行流程；Command（斜杠命令）是用户主动调用的薄入口，委托给对应 Skill 执行；MCP Server 则是通过 Model Context Protocol 连接外部平台 API，为 Skill 提供数据和操作能力。 更值得注意的是 Superpowers 插件提供的结构化工作流 Skill（brainstorming、writing-plans、executing-plans），它们定义了从需求澄清到代码交付的标准流程，本质上是在 AI 执行层之上增加了一层"工程纪律"，防止 AI 跳过关键步骤自由发挥。

**十一阶段流水线的工程化思维。** 从需求创建到合入发布的全流程被拆解为 11 个阶段：需求获取与分支初始化 → 交互式需求澄清 → 制定实施计划 → 并行执行开发任务 → 代码自审 → 编译部署 → 日志排查 → 创建 MR → AI 辅助评审 → 修复评审意见 → 合入发布。 这条流水线最核心的设计洞察是：每个阶段都有明确的"人做决策"节点（审批计划、确认部署、审核报告、决定提交哪些评论），AI 则在各阶段内自主执行重复性高、规则明确的工作。4 个 Task 的并行开发仅需 ~10 分钟且几乎无需人工干预，相比传统方式大幅缩短了从需求到可部署代码的周期。

**AI 评审的局限性揭示了跨模型交叉审查的价值。** 文章在阶段 9 明确指出了一个关键观察：AI 给出的评审意见"不一定都是对的"，可能误判代码意图、遗漏业务上下文，甚至把正确的错误处理标记为"缺少 error check"。 为此，文章提出了一个实用技巧——谁写的代码，就让别的模型来审查。Claude 写的代码用 Codex 或 Gemini 审查，反之亦然。不同模型的知识结构和关注点不同，交叉审查能显著提高问题发现率。 这个洞察触及了当前 AI 代码评审的一个根本性局限：同模型的审查容易陷入与生成时相同的思维盲区。

**Skill 编排而非从零实现的设计哲学。** pm-dev 早期版本曾经自己实现了头脑风暴/写计划/执行计划的功能，后来发现 superpowers 插件已经提供了成熟的对应 Skill，最终把自制逻辑替换为链式调用现成 Skill。 这个教训被总结为一句话："自定义 Skill 的核心价值是编排和串联，而不是从零实现所有能力"。对于 Agentic Engineering 的工具生态建设具有普遍指导意义——与其在每个 Skill 里重复实现复杂的工作流逻辑，不如设计好 Skill 之间的调用契约，让成熟的 Skill 各司其职，编排层负责串联和上下文传递。

## 实践启示

1. **构建分层工具链，Command 只做薄路由。** 每个 `/xxx` 命令应该只有一行委托逻辑，核心业务逻辑放在 Skill 层。这样即使用户没有显式调用命令（如说"帮我提交代码"），AI 也能理解意图并触发对应流程。

2. **用 Superpowers 类结构化 Skill 强制工程纪律。** brainstorming 确保 AI 先理解代码现状再动手，writing-plans 确保先有计划再执行，executing-plans 确保按步骤推进不跳跃。这些不是"可选的好习惯"，而是写进 Skill 定义的强制流程——AI 无法跳过关键步骤，必须在每个节点停下来等人审核。

3. **代码自审和 AI 辅助评审形成双层质量门禁。** 阶段 5 的 code-review 定位是"自查"——用 AI 快速扫格式、命名、规范类低级问题，让人审聚焦更高层面的设计和逻辑；阶段 9 的 /review-mr 则是站在 reviewer 角度做正式审查。两者定位不同、目标不同，形成互补的两道质量门禁。

4. **跨模型审查避免同模型思维盲区。** 不要让同一个模型既写代码又审代码。Claude 写的代码用 Codex 或 Gemini 审查，利用不同模型知识结构的差异性发现更多问题。每一条 AI 评审意见都必须经过人工判断，不能因为是 AI 说的就直接采纳。

5. **优先复用成熟 Skill，自研聚焦编排层。** 当需要某个功能（如 brainstorming、writing-plans）时，优先评估社区是否已有成熟实现，避免从零实现所有能力。自定义 Skill 的核心价值是编排和串联——把多个现有 Skill 串联成满足特定业务场景的流水线，而不是重复发明轮子。

---

