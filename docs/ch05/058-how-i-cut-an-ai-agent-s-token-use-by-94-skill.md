# How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

## Ch05.058 How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

> 📊 Level ⭐⭐ | 9.2KB | `entities/vivekhaldar-compiling-agent-skill-token-cut-94pct-2026.md`

# How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

Vivek Haldar 展示了一个具体的工作流案例：将 Agent Skill 从**纯自然语言指令**（natlang code）**编译**为**确定性 Python 程序 + LLM 仅做核心决策**的混合架构，获得了 **94% token 减少** 和 **87% 延迟降低**，同时输出质量基本不变。

## 摘要

当 Agent Skill 运行多次后，大部分行为不再需要 LLM 推理——路径已经固化（crystallized）。Vivek Haldar 以他的 LinkedIn 回帖 Skill 为例展示了「编译」过程：原始 Skill 是纯自然语言描述的 Agent Skill，每次运行 agent 都需要从零解读指令、制定计划、调用工具、跟踪状态。编译后，Skill 变成了一个「薄引导程序」（thin bootloader），调用一个 Python 程序执行所有确定性工作，仅在候选选择和草稿撰写这两个真正需要语义理解的步骤调用 LLM。

## 核心要点

- **94% token 减少**：从编译前到编译后，token 用量降低了 94%
- **87% 延迟降低**：同样的任务完成时间减少了 87%
- **输出质量基本不变**：在多次运行中验证，输出质量与原始版本基本一致
- **非模型替换实现**：节省来自移除执行确定性工作的模型调用，而非换用小模型
- **Crystallized Workflow 概念**：当 workflow 运行多次后，行为模式固化（crystallized），确定性部分不再需要 LLM 推理
- **编译方法**：利用历史 trace 分析哪些步骤真正需要 LLM，然后将稳定部分编译为确定性代码

## 深度分析

### Crystallized Workflow：从探索到固化的自然演化

Vivek Haldar 的核心理念是 Agent Workflow 的自然演化过程。当一个 Skill 刚刚创建时，它的执行路径还不确定，需要 LLM 的推理能力来探索。每次运行，agent 需要理解指令、制定计划、尝试不同的工具调用路径。这个阶段的 LLM 开销是合理的——它是发现阶段。

但经过多次运行后，workflow 的行为模式就「crystallized」（固化）了。以 LinkedIn 回帖 Skill 为例：它总是查找相同来源、构建相同内容清单、应用相同过滤条件、保存相同中间状态。这些步骤在每次运行中做的事情完全一样——不需要 LLM 每次重新推理如何执行它们。

真正的 LLM 需求只存在于两个步骤：
1. **候选选择**：从过滤后的内容清单中选择一篇值得重新推广的帖子——这需要理解文章内容和判断社交传播价值的语义能力
2. **草稿撰写**：用自然语言撰写 LinkedIn 帖子——这是典型的语言生成任务

其余所有步骤都可以是普通的确定性代码。

### 编译过程：从 Trace 到 Harness

编译过程并非手工重写，而是利用历史 trace 自动分析：

1. **收集 trace**：Skill 在之前作为 Codex 每日自动化运行时，生成了丰富的执行 trace，包括规划步骤、工具调用、分支路径、中间状态
2. **分析模式**：将原始 Skill 描述 + 历史 trace + 关于 specialized harness 的设计原则输入给一个强大模型
3. **识别固化部分**：模型分析哪些步骤已经成为确定性模式，哪些步骤仍然需要 LLM
4. **生成 harness**：构造一个 Python 程序作为 specialized harness，执行所有确定性步骤

这个过程是一次性成本（one-time cost），使用一个强大模型和较多上下文来检查 trace 并生成新的 harness。但编译后的 workflow 可以运行成百上千次，每次执行都节省 token 和时间。这是标准的优化经济学：一次性投入，在重复使用中摊销。

### 「编译器」类比为什么成立

Vivek 将这个过程类比为编译是有深意的：

- **原始 Skill = 高级语言（高级抽象、灵活表达意图）**：自然语言是人类表达工作流的最自然方式，易于撰写、修改和理解
- **Trace = 运行中间表示（reveals the real shape）**：历史 trace 揭示了这个工作流在实践中的实际形状，哪些是模式、哪些是特例
- **Specialized Harness = 机器代码（高效执行）**：编译后的 Python 程序高效执行确定性部分，只在真正需要 LLM 的地方调用模型

这个类比的关键洞见是：编译不是放弃灵活性，而是将灵活性锁定在需要它的地方。就像高级语言中的类型检查与优化不会改变程序语义一样，编译后的 harness 在 LLM 调用点的行为和原始 Skill 是一致的。

### 激励相容性分析：为什么大模型厂商不会主动推广

Vivek 指出了一个重要但容易被忽视的方面：大模型厂商的商业模式与 token 优化存在根本性冲突。他们的收入随 token 用量上升而上升。一项能在保持输出质量的同时将 token 消耗减少 94% 的技术，直接违背了这些公司当前的经济利益。

当然，每个 token 更便宜、更好的推理缓存和更高效的模型确实使产品更有用。但帮助客户发现「大多数工作流根本不需要 token 本身」——这与卖更多 token 的激励机制不一致。因此，这种优化的发现和实施主要来自用户和独立开发者。

这个观察与 [Agent Harness Engineering Survey](ch05/117-harness-engineering.html) 中关于「Harness 的演进——从自然语言到确定性结构」的趋势完全一致——效率优化的动力来自用户端而非厂商端。

### 与 Natlang Code 和 Context Engineering 的关系

Vivek 开发了一种他称为「natlang code」（自然语言代码）的理念——将可执行 SOP 写成自然语言指令，让 agent 自动执行。这与 [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) 中「用结构化的提示工程替代自由对话」的理念一脉相承。

但 Vivek 超越了 natlang code：他指出了自然语言代码的局限——当行为固化后，用 LLM 重新推理已知路径是浪费。因此下一步是「编译」——将固化部分从自然语言代码编译为确定性代码，让 LLM 只做它擅长的事：语义判断和内容生成。

这个「先自然语言、再 track、再编译」的三步模式，为 Agent Skill 的工程化提供了一个清晰的成熟度模型。

## 实践启示

1. **「先灵活再优化」优于「从零设计高效系统」**：Vivek 强调从第一天就写 specialized harness 是 premature optimization（过早优化）。先用自然语言探索 workflow，用 trace 理解真实行为模式，再将固化部分编译为代码。这三步模式适用于任何 Agent 工作流的工程化过程。

2. **Token 优化的最大杠杆不在模型选择而在架构设计**：94% 的 token 节省来自移除不必要的 LLM 调用，而非换用小模型。这意味着在优化 AI 系统的 token 成本时，首先应该问「这个步骤真正需要 LLM 吗？」，而不是「能不能换一个更便宜的模型？」

3. **为内部工具构建 trace infrastructure**：Vivek 能够完成编译的关键前提是他有丰富的历史 trace。如果没有 trace，就无法分析哪些步骤已经固化。在构建 Agent 系统时，从一开始就建立 trace 收集机制，这些数据在未来优化中会非常有价值。

4. **激励机制决定优化方向**：大模型厂商不会主动帮助用户减少 token 用量。Token 优化技术（如 Skill 编译）主要由用户和独立工具开发者推动。在选择 Agent 平台时，需要考虑这个因素——一个激励「多用」的平台和一个激励「高效用」的工具链对你的长期成本有质的影响。

## 相关实体

- [Agent Harness Engineering Survey](ch05/117-harness-engineering.html)
- [Skill 编排的6种依赖关系](../ch04/266-skill.html)
- [CLI Agent模式——MCP与Shell Agent](../ch03/046-agent.html)
- [Skill Hub MVP评估与发布](../ch04/266-skill.html)
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vivekhaldar-compiling-ai-agent-skill-token-cut-94pct-2026.md)

---

