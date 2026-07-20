# 最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！

## Ch01.373 最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！

> 📊 Level ⭐⭐ | 12.0KB | `entities/andrej-karpathy-claude-md-134k-stars-2026.md`

## 深度分析

### 1. 四条规则精确对治四种结构性失败

Karpathy 的四条规则并非随意组合，而是与 AI 编程中四种最常见的结构性失败一一对应：规则 1 对治"模糊推进"（ambiguity collapse），规则 2 对治"过度工程"（over-engineering），规则 3 对治"连锁改写"（chain rewriting），规则 4 对治"虚假完成"（false completion）。这种精准映射是文件被 11 万开发者认同的根本原因——它把大家的共同挫败感翻译成了结构化语言。

### 2. 复杂偏向是 RL 训练的内置偏见

规则 2 的洞察最为深刻：AI 偏向生成更多代码，这不是 bug，是训练数据里的内生倾向。在互联网语料中，"更完整"的代码往往获得更多认可和引用，形成了一种"复杂 = 专业"的上位信号。Karpathy 的方案不是告诉 AI"要简单"，而是用具体禁止条款切断这条因果链——没有要求的 feature 不加、用一次的代码不抽象、不可能发生的异常不防御。

### 3. "顺手优化"是独立的失败模式

规则 3 揭示了一个此前没有被明确命名的 AI 行为问题：AI 在执行任务时存在"顺便改善"冲动，表现为修改相邻代码、调整格式、重构看似冗余的逻辑。这不仅是风格问题——它制造了无法追溯的 diff，使得 code review 失去焦点，debug 路径变得不可预测。Surgical Changes 规则将这个问题显式化，提出每一行改动都必须能追溯到用户原始请求。

### 4. 行为准则本质是概率分布约束，而非确定性规则

文件的使用建议（"不是铁律，是行为上下文"）揭示了 AI 编程配置的实质：通过调整输出概率分布来改变 Agent 的行为倾向，而非规定每个具体动作一定会发生。这解释了为什么 65 行配置能产生如此广泛的实际效果——它不需要覆盖所有边界情况，只需要让"正确行为"的概率显著高于"错误行为"。

### 5. 11 万 Star 的成功证明开发者需要"契约式约束"

文件跻身 GitHub 历史 Star Top 100，说明市场对结构化 AI 编程指南存在强烈需求。这与传统的 prompt engineering 不同——后者是优化提问方式，前者是明确约束行为边界。CLAUDE.md 类文件的流行，预示着 AI 编程正在从"如何问"向"如何约束"范式转移。

## 实践启示

### 1. 为每个项目创建专属 CLAUDE.md

将四条规则作为起点，根据项目技术栈和代码规范进行裁剪。例如在测试驱动项目中强化规则 4 的验证条款，在遗留代码项目中严格化规则 3 的"不改动"边界。新项目直接放入根目录，已有项目在末尾叠加。

### 2. 在 Prompt 中主动暴露歧义而非等待 AI 提问

将规则 1 的精神反向应用：用户在使用 AI 编程时，应该在 prompt 中主动列出自己已知的不确定因素和可选方案。这能训练出一个习惯于"先确认再实现"的协作模式，从根本上减少迭代成本。

### 3. 用"老工程师测试"抵抗复杂化冲动

规则 2 的自检问题（"一个老工程师看到会不会觉得过度设计？"）可以作为每次 AI 生成代码后的 checklist。任何超出必要范围的抽象、配置化或防御性代码，在采纳前必须经过这个测试。

### 4. 将验收标准强制转化为"测试优先"表述

规则 4 的核心是消除"感觉差不多了"的主观判断。在向 AI 发出指令时，强制将模糊目标翻译为可验证的测试表述（如"先写一个复现 bug 的测试"），让完成标准在编码前就已确定。

### 5. 全局部署 + 版本控制 = 团队一致性

将 CLAUDE.md 放入 home 目录作为全局配置，提交到版本控制供团队共享。这不仅能保证个人所有项目的 AI 行为一致性，更重要的是让团队在 AI 编程行为约束上达成显式共识，减少 code review 中的摩擦。
---

# 最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！

> Andrej Karpathy（Andrej Karpathy（OpenAI 联合创始人）、Forrest Chang）2026 年 1 月发推分享 AI 编程经验，Forrest Chang 整理成 CLAUDE.md，GitHub 11 万星。核心理念：AI 编程 Agent 有四种结构性失败，四条行为准则可以对治。

## 背景与起源

Andrej Karpathy 于 2026 年 1 月 26 日发布推文，分享其 AI 编程工作流的最大变化：从此前 **80% 手动写代码**转变为 **80% 依靠 Agent 生成**。 这条推文获得近 **800 万次浏览**，引发了开发者社区的广泛讨论。

Forrest Chang 将 Karpathy 的四个核心观察整理成一份 CLAUDE.md 文件并发布到 GitHub。该仓库在 24 小时内获得 6000 Star，一周内突破 4 万，三个月内达到 **11 万 Star**，跻身 GitHub 历史 Star 数 Top 100。

## CLAUDE.md 完整内容（四条规则）

```markdown

# CLAUDE.md
Behavioral guidelines to reduce common LLM coding mistakes.

## 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes
Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style.
- Your changes create orphans: remove unused imports/variables/functions.
- Don't remove pre-existing dead code unless asked.
- Test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution
Define success criteria. Loop until verified.

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"
- For multi-step tasks: state plan with verify checkpoints.
```

## 逐条解析：每条规则在解决什么问题

### 规则 1：先想清楚再动手

**针对的失败模式**：AI 遇到模糊需求时，会用听起来合理的答案把空填上，然后往下冲——而不是停下来问一句。

**改变交互流程**：原来流程是用户给需求 → AI 猜测意图 → 实现出来不对 → 用户纠错（多轮循环）。加入此规则后变为：用户给需求 → AI 提出歧义 → 澄清之后再实现。前置一个问题，省掉后面五轮返工。

### 规则 2：能简单就别复杂

**针对的失败模式**：AI 偏向生成比必要更多的代码——更复杂的代码在训练数据里通常代表"更完整、更专业"的信号。

**压制偏向的具体做法**：没有人要求的 feature 不加、用一次的代码不抽象、不可能发生的异常不防御、没被要求"灵活可配置"就不搞扩展性。

**自检问题**：一个老工程师看到这些代码会不会觉得过度设计？如果是，重写。核心逻辑是：复杂不是智慧的体现，通常是思路不清晰的症状。

### 规则 3：只动该动的地方

**针对的失败模式**：AI 改代码时有个习惯性动作——"既然来了，顺便把这个也优化一下……"。

**规则要求**：只改任务要求的部分；不顺便优化周边逻辑，不重构没坏的东西，不改格式和注释风格；你的改动带来的孤儿代码（变成没人用的 import、变量、函数）要清掉；之前就存在的死代码别动，除非明确被要求。

**验收标准**：每一行改动都能追溯回用户的请求。这让 diff 更干净，code review 更容易，debug 更可预测。

### 规则 4：目标要可验证

**针对的失败模式**：没有明确的完成标准，AI 会在"感觉差不多了"的时候停下来，而不是在"确实对了"的时候停下来。

**解法**：把任务变成可核查的目标，例如"加一个校验"变为"为无效输入写测试，然后让测试通过"；"修这个 bug"变为"写一个能复现 bug 的测试，然后让它通过"；"重构 X"变为"确保重构前后测试都通过"。多步骤任务先列计划，每一步说清楚怎么验收。

## 这个文件爆火说明了什么

每个用过 AI 编程工具的开发者都碰过同样的墙：让 AI 加一个小的缓存层，它把函数签名重写了，引入了一个没有要求的依赖注入模式，把缓存包在了一个暴露出八个方法的类里——缓存本身只有三行。这不是极端案例，这是默认行为。

Karpathy 做的事情是用准确的语言把这些挫败感说了出来，并提供了结构化的应对方案。

## 使用建议

### 它不是什么

- 不是铁律，是**行为上下文**（改善行为分布，不保证每个具体行为一定发生）
- 不是模板，是**菜单**（四条规则是基线，不能替代项目特有的指令）

### 正确用法

**全新项目**：直接放进项目根目录，或用 `/init` 命令生成起始文件后合并进去。

**已有配置**：在末尾加一个 `## Behavioral Guidelines` 小节，叠加进去，不要替换原有配置。

**全局生效**：放在 home 目录，对所有项目生效。提交进版本控制，团队共享同一套约束。

**换文件名在 Cursor 里同样适用**（仓库里两个版本都提供了）。

## 来源

- GitHub：https://github.com/forrestchang/andrej-karpathy-skills（65 行，MIT 协议）
- Karpathy 原推：2026-01-26
- 作者：ChallengeHub 小编

## 相关实体
- [Claude Code Harness Deep Understanding](ch01/445-claude-code-harness-deep-understanding.html)
- [Claude Code Harness Deep Dive Founder Park](../ch05/068-claude-code-harness.html)
- [读完 Claude Code 和 Openclaw 的 Memory 源码我对Agent记忆需要向量数据库这件事产生了怀疑](../ch03/076-claude-code.html)
- [Claude Code 之父最新访谈编程已经结束Harness 将消失Claude Code 将只有 100 行代码Loop 才是未来](../ch03/076-claude-code.html)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch01/318-anthropic-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openai-developer-ecosystem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/andrej-karpathy-claude-md-134k-stars-2026.md)

---

