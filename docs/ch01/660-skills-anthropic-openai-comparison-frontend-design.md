# Skills Anthropic Openai Comparison Frontend Design

## Ch01.660 Skills Anthropic Openai Comparison Frontend Design

> 📊 Level ⭐⭐ | 6.7KB | `entities/skills-anthropic-openai-comparison-frontend-design.md`

# Skills 详解：拆一个技能，看 Anthropic 和 OpenAI 的思路差异
**作者**：若飞 | **来源**：架构师（JiaGouX）| **时间**：2026年3月4日

## 先快速回顾：Skill 解决什么问题
某个提示词一开始能用，过两周出了问题加一条规则，同事复制到另一个项目里稍微改了改，再过一个月同一个流程在三个地方长出三套变体，没人说得清哪个是"最新版"。
Skill 的核心思路是**把提示词从对话框搬到文件系统**：一个文件夹，一个 SKILL.md，可以附带参考文档和脚本。搬到文件系统之后，它就可以被版本控制、被 PR review、被跨项目复用。

## 相关实体
- [全球Ai新王诞生Anthropic估值冲爆12万亿首次反超Openai](ch01/846-anthropic.md)
- [从 Anthropic 到 Googleagent Skills 正在进入设计模式阶段](../ch04/376-agent-skills.md)
- [Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](../ch04/376-agent-skills.md)
- [Anthropic Google Agent Skills Design Patterns](../ch04/187-anthropic-google-agent-skills.md)
- [Cong Anthropic Dao Googleagent Skills Zhengzai Jinru Sheji Moshi Jieduan](../ch04/376-agent-skills.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skills-anthropic-openai-comparison-frontend-design.md)

## 深度分析

Skill 作为 AI 编程工具链的核心抽象，其本质是将"提示词"工程化为一等公民（first-class artifact）。传统的提示词管理是对话级别的——飘在 ChatGPT 或 Claude 的对话框里，无法被版本控制、无法被复用、无法被测试。而 Skill 把提示词变成了文件系统里的一个结构化对象，可以像代码一样被管理。Anthropic 和 OpenAI 都看到了这一点，但两家在"如何定位 Skill"上出现了根本性分歧：Anthropic 把 Skill 视为 Claude Code 扩展体系的**一个模块**，与其他机制（CLAUDE.md、Hooks、MCP、Subagents）并存；OpenAI 则把 Skill 做成**完整的工作流包**，自带 UI 元数据、依赖声明、调用策略和多级分发体系。前者的设计哲学是"专注、克制、让每个机制各司其职"，后者的设计哲学是"为了让 Skill 流转起来，需要的一切都装进去"。

Anthropic 的 frontend-design 技能是这一哲学的典型体现：42 行 SKILL.md，没有多余的脚本和配置，但 description 的设计极为精细。它做了三件事——划定触发范围、列出具体任务类型（用 examples 消除歧义）、写明产出标准（production-grade、avoids generic AI aesthetics）——这三件事本质上是一个**精确路由规则**，而不是一段引导文字。这种写法背后的认知是：在渐进式披露机制下，模型第一步看 description 决定要不要加载这个技能，如果 description 写得像引导文字，模型会把它当成上下文填充进去，而不是当成路由信号。精确路由 + 按需加载 = 上下文成本最小化，这是 Anthropic 的核心工程决策 。

负面约束（NEVER 清单）比正面要求更有效，这背后有深刻的模型行为学基础。模型对正向目标的理解往往太宽——"做出好看的 UI"有无数种解读。但"不要用 Inter 字体""不要用紫色渐变"非常具体，边界清晰，模型很容易遵守。更重要的是，NEVER 清单解决了多次生成中的**模式塌缩（mode collapse）**问题：模型在 RLHF 过程中学会了"最安全的选择"，会在多轮生成中反复使用 Space Grotesk 等字体。NEVER 清单强制模型每次都选一个不同的审美方向，防止输出"平均脸"化的平庸设计。这不是简单的提示技巧，而是对模型行为特征的针对性干预 。

两家在"有副作用的技能"上达成了一致：通过配置禁止隐式触发。Claude Code 用 `disable-model-invocation: true`，Codex 用 `allow_implicit_invocation: false`，机制相同。但 Claude Code 更进一步，把确定性动作整体分离到了 Hooks 层——技能里可以描述"应该跑 lint"，但实际执行由 hook 在事件触发时自动完成，不占上下文，不经过模型判断。这个分离本质上是对"模型适合做什么、不适合做什么"的价值判断：模型适合做创意决策和上下文判断，不适合做确定性脚本执行 。

## 实践启示

1. **写 Skill description 时，把它当成路由规则而不是介绍文案**。要包含：触发场景（用具体 examples）、排除场景（明确边界）、产出标准（可验证的质量要求）。避免模糊词汇，让模型在加载 Skill 之前就能判断是否适合当前任务 。

2. **NEVER 清单是控制模型输出多样性的核心工具**。在需要创意输出的 Skill 中，列出"不要重复使用的选项"比"应该追求的目标"更有效。特别针对模型在 RLHF 过程中学到的"最安全选择"（如 Inter、Roboto、紫色渐变），明确禁止它们 。

3. **Design Thinking 环节是防止模板化输出的关键机制**。强制模型在写代码之前先建立创意方向（Purpose、Tone、Constraints、Differentiation），等于给模型装了一个"创意方向锁"，让整个生成过程保持一致 。

4. **有副作用的 Skill 必须禁止隐式触发**。当 Skill 能写文件、执行脚本、调用外部服务时，只有用户显式调用才加载，用 `disable-model-invocation: true`（Claude Code）或 `allow_implicit_invocation: false`（Codex）。

5. **如果 Skill 需要确定性执行，把它写成 Hook 而不是放进 Skill**。这样执行不占上下文、不经过模型判断，行为完全可预测。Hook 在特定事件（文件保存、命令完成）触发时自动执行，适合 lint、格式化、自动化脚本等场景。

---

