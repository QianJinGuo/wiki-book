# Claude Code Skills 与 Superpowers 实践

## Ch01.490 Claude Code Skills 与 Superpowers 实践

> 📊 Level ⭐⭐ | 8.8KB | `entities/claude-code-skills-superpowers-practice.md`

# claude-code-skills-superpowers-practice

Claude Code的Skills实践及利器推荐：工欲善其事，必先利其器
目前在实践和应用Claude Code，顺便分享一些在实践过程中的经验，没想竟然写成一个系列了。如果你也对Claude Code感兴趣，可以先回顾一下之前的文章，然后开始今天的文章。
第1篇：《国内环境下的Claude Code安装与使用教程》
第2篇：《使用Claude Code最需要做的一件事：与AI签订一份契约（CLAUDE.md）》
第3篇：《Claude Code实践：从零开始，一行代码不写生成一个项目》

## 相关实体
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](../ch03/076-claude-code.html)
- [Claude Code Self Repair Hooks Memory Config](../ch03/076-claude-code.html)
- [Code Review Graph](ch01/800-code-review-graph-claude-code-6-8-token.html)
- [Claude Code Hackathon Winners 2026](../ch03/076-claude-code.html)
- [Claude Code Harness Deep Understanding](ch01/429-claude-code-harness-deep-understanding.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-skills-superpowers-practice.md)

## 深度分析

**1. Agent Skills 本质上是人类开发者与 AI 之间的"程序性知识传递协议"**

Anthropic 提出的 Agent Skills 标准，本质上解决的是 AI 模型"缺乏稳定、可复现的执行流程"这一核心问题。传统的 prompt 交互是"一次性指令—响应"模式，AI 每次都需要从零理解任务上下文。而 Skills 通过标准化的目录结构（SKILL.md + 脚本 + 参考文档 + 模板），将程序性知识封装为 AI 可动态发现和加载的组件。这不仅降低了 AI 执行任务的认知负担，更关键的是：Skills 将人类开发者群体的最佳实践，以一种 AI 可理解和执行的方式固化下来，实现跨会话、跨任务的最佳实践复用。

**2. Superpowers 的核心创新是"先采访，后执行"——将 AI 从执行者升级为协作者**

传统的 AI 编程是"指令—执行"直线模式：用户描述需求，AI 直接干活，结果偏差由用户承担。Superpowers 彻底反转了这个模式：当检测到用户要构建功能或系统时，Superpowers 不立即执行，而是启动 brainstorming 技能，通过苏格拉底式诘问法逐步澄清需求、探索方案、确认设计意图。这种模式将 AI 从"执行工具"提升为"思维伙伴"。实践中，这 8 个问题（认证方式、密码加密、Token 管理、验证码、权限控制、接口格式、会话超时、配套功能）覆盖了一个登录模块的关键决策点，比大多数人在需求文档里写的还全面。

**3. writing-plans 技能是 AI 编程从"玄学"走向"工程化"的关键节点**

Superpowers 的 writing-plans 技能将复杂任务拆解为"每个耗时 2-5 分钟"的小任务，每个任务包含精确的文件路径、完整代码和验证步骤。这意味着：AI 生成的代码不再是大段不可控的输出，而是被结构化为可审查、可中断、可批量执行的小单元。这一设计直接解决了 AI 编程中最核心的痛点——"生成了一大段代码，不知道对不对，不知道改哪里"。小任务粒度使人工审查成本大幅降低，同时为 subagent-driven-development 提供了执行基础。

**4. subagent-driven-development 是 AI 工程化的正确路径：不是替代人类，而是并行化 AI**

Superpowers 提供的 subagent-driven-development 模式，本质上是一个分布式任务执行框架：writing-plans 生成任务列表，subagent-driven-development 为每个任务分配独立子 Agent 执行，并在任务之间设置审查检查点。这不是"人类被替代"的叙事，而是"AI 任务并行化"的工程化实践。子 Agent 之间相互独立、互不阻塞，主 Agent（人类或调度者）在关键节点做决策。这种架构将 AI 的并行计算能力映射到了软件开发流程中，是真正意义上的 AI-native 开发范式。

**5. Skills 的 ROI 边界：一次性、个性化操作不需要 Skills，过度封装反而浪费**

文章指出了一个容易被忽视的反向洞察：Skills 封装也有成本——AI 每次执行都需要支付额外的 token 来加载和判断是否执行该 Skill。这意味着：重复性高、有固定流程、有约束要求的任务才适合封装为 Skills；一次性操作或高度个性化操作，封装成 Skills 反而增加开销。这是 AI 工程化中"何时抽象"的精准回答——与软件工程中"何时抽象"的经典原则一脉相承。

## 实践启示

**1. 立即安装 Superpowers 插件，将 Claude Code 从"高级 IDE"升级为"结构化开发伙伴"**

执行命令： `/plugin marketplace add obra/superpowers-marketplace` 然后 `/plugin install superpowers@superpowers-marketplace`，最后 `/reload-plugins`。Superpowers 目前已有 175k Stars，是 AI 编程领域最活跃的 Skills 仓库。它提供的 brainstorming、writing-plans、subagent-driven-development、test-driven-development 等工作流，覆盖了从需求澄清到代码评审的完整开发周期，是目前将 Claude Code 工程化能力提升最显著的插件。

**2. 在任何复杂任务开始前，使用"采访"提示词触发 Superpowers 的 brainstorming 技能**

提示词模板： "我想在现有的项目中新增一个 [功能名]，请采访我并完善这个功能设计" 这会触发 superpowers:brainstorming，AI 会以苏格拉底式诘问法逐层澄清需求，覆盖方案选择、技术约束、接口设计等关键维度。与其自己写一份不完整的需求文档，不如让 AI 通过问答帮你完善——这个过程本身也是对需求合理性的再思考。

**3. 使用 writing-plans 替代直接生成代码：先得到任务清单，再决定是否执行**

不要让 AI 直接开始写代码，而是让它先生成"执行计划"（writing-plans），每个任务块包含精确文件路径、完整代码片段和验证步骤。人类审查计划后，再选择"子代理驱动"或"内联执行"模式推进。这个中间层（计划审查）的加入，是将 AI 编程从"高风险黑盒"变成"可控白盒"的关键动作，也是 test-driven-development 能够在 AI 时代真正落地的技术基础。

**4. 对多人协作项目，为 AI 子 Agent 设置强制 Code Review 检查点**

Superpowers 的 requesting-code-review 技能建议在任务之间强制触发，根据计划进行评审并按严重程度报告问题——严重问题阻止继续推进。在 AI 编程场景中，这个检查机制尤为重要，因为 AI 生成的代码往往"看起来对"但存在边界条件、安全隐患或设计风格不一致问题。让 AI 审查 AI（通过子 Agent 之间的交叉检查）是一种低成本、高频次的"持续质量门禁"。

**5. 根据任务类型选择 Skill 粒度：重复性流程封装为 Skills，一次性任务直接执行**

将日常开发中高频出现的、有固定流程的操作（如：新建功能模块、编写 API 文档、生成单元测试、执行 Code Review）封装为自定义 Skills，存放在 `~/.claude/skills/` 目录下。但对一次性探索任务或高度定制化需求，直接用自然语言描述执行，不要强行封装为 Skill。判断标准：同一个 Skill 如果在 3 次以上的任务中出现过，才值得抽象和复用。

---

