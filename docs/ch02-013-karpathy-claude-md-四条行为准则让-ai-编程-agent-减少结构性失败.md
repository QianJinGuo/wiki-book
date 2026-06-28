## Ch02.013 Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败

> 📊 Level ⭐⭐ | 10.8KB | `entities/karpathy-claude-md-rules.md`

## 背景与传播轨迹

- **Karpathy 原始推文**：2026 年 1 月 26 日发布，分享 AI 编程工作流最大变化——从 80% 手动写代码 → 80% 靠 Agent 生成
- **推文热度**：近 800 万次浏览
- **GitHub Star 增长曲线**：一天 6000 Star，一周 4 万，三个月 11 万，跻身 GitHub 历史 Star 数 Top 100
- **文件规模**：原始 CLAUDE.md 仅 65 行，MIT 协议，采用成本极低

## 原始 CLAUDE.md 全文

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

These guidelines are working if:
fewer unnecessary changes in diffs, fewer rewrites due to overcomplication,
and clarifying questions come before implementation rather than after mistakes.
```

## 经典失败案例

每个用过 AI 编程工具的开发者都碰过同样的墙：

> 让 AI 加一个小的缓存层，它把函数签名重写了，引入了一个没有要求的依赖注入模式，把缓存包在了一个暴露出八个方法的类里——缓存本身只有三行。

这不是极端案例，这是**默认行为**。

## 四条行为准则

### 1. Think Before Coding

**针对**：AI 遇到模糊需求时用"听起来合理"的答案填上空，然后往下冲，不停下来问。

**规则**：State your assumptions explicitly. If uncertain, ask. If multiple interpretations exist, present them.

**改变交互流程**：用户给需求 → AI **先提出歧义** → 澄清之后再实现（而不是：用户纠错多轮循环）。

### 2. Simplicity First

**针对**：AI 偏向生成比必要更多的代码（复杂=更完整/专业的训练信号）。

**规则**：Minimum code that solves the problem. Nothing speculative.

- 没人要求的 feature 不加
- 用一次的代码不抽象
- 不可能发生的异常不防御
- 没被要求"灵活可配置"就不搞扩展性

**自检问题**："一个老工程师看到这些代码会不会觉得过度设计？"如果会，重写。

### 3. Surgical Changes

**针对**：AI 改代码时"顺便优化一下"——在真实系统里很危险。

**规则**：Touch only what you must. Clean up only your own mess.

- 只改任务要求的部分，不顺便优化周边
- 不重构没坏的东西
- 你的改动带来的孤儿代码要清掉；之前存在的死代码不删，除非明确要求

**验收标准**：每一行改动都能追溯回用户的请求。

### 4. Goal-Driven Execution

**针对**：没有明确完成标准，AI 在"感觉差不多了"停下来，而不是在"确实对了"时停下。

**规则**：Transform tasks into verifiable goals.

- "加校验" → "为无效输入写测试，然后让测试通过"
- "修 bug" → "写一个能复现 bug 的测试，然后让它通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务先列计划，每步说清楚验收方式。

## 适用场景

| 场景 | 用法 |
|------|------|
| 全新项目 | 直接放进根目录，或 `/init` 生成后合并 |
| 已有 CLAUDE.md | 末尾加 `## Behavioral Guidelines` 小节叠加 |
| 全局生效 | 放 home 目录，提交版本控制，团队共享 |
| Cursor | 换文件名即可（仓库提供两个版本） |

## 为什么爆火

Karpathy 做的事情是用准确的语言把大家的挫败感说了出来。Forrest Chang 把它变成了一个可以直接用的文件（65 行，MIT 协议），采用成本极低——粘贴进根目录，三十秒搞定。

这不是泛泛的"编程建议"，而是直指 AI 编程 Agent 的四种**结构性失败模式**——这些失败不是偶发的，而是 AI 训练目标和工程执行之间的系统性错配。

## 量化效果

| 配置 | 错误率 | 遵循率 |
|------|--------|--------|
| 无 CLAUDE.md | 41% | — |
| Karpathy 4 条 | ~3% | 78% |
| 扩展 12 条 | 3% | 76% |
| 14+ 条 | — | 52%（骤降）|

> **关键发现**：超过 14 条规则后遵循率骤降 24 个点，存在认知带宽的物理限制。规则数量与遵循率呈倒 U 型曲线——在 6-12 条范围内时每条规则的边际认知成本低于临界值，超过后规则之间开始竞争上下文资源。

## 深度分析

### 四条准则针对的结构性失败根因

Karpathy 总结的四条准则不是泛泛的"编程建议"，而是直指 AI 编程 Agent 的四种**结构性失败模式**——这些失败不是偶发的，而是 AI 训练目标和工程执行之间的系统性错配。

**自信猜测（Think Before Coding 针对）**：AI 在预训练中学习的是"给出完整答案"，奖励信号来自答案的完整性而非正确性。遇到模糊需求时，AI 的默认策略是"补全"而非"提问"——因为训练数据中，提问者通常会持续提供信息，而完整的方案更受奖励。这是 AI 不主动澄清的根本原因，不是态度问题，是训练目标问题。

**过度设计（Simplicity First 针对）**：AI 偏向生成更多代码，是因为复杂代码在训练语料中往往与"专业""完整""高级"等正面标签共现。少写代码在训练信号上是"懒惰"的，模型没有内在动机选择最小化实现。

**顺手优化（Surgical Changes 针对）**：改代码时"顺手优化周边"在人类工程师中是良好习惯，但 AI 这样做会导致两类问题：一是改动范围不可控，引入原本不需要修的 bug；二是优化方向的奖励信号缺失（没有人在代码审查中给"顺手清理"打高分）。

**模糊完成标准（Goal-Driven Execution 针对）**：AI 停止的时机由"模型觉得自己答完了"决定，而不是"是否真正满足用户需求"。这是 RL 环境中稀疏奖励的标准问题——没有明确的完成信号，AI 会在"差不多对了"时停止，而不是在"确实对了"时停止。

### 为什么这四条规则能真正起作用

65 行 MIT 协议的 CLAUDE.md 能获得 11 万星，不只是因为"说得好听"，而是因为它把抽象原则转化成了**可验证的检查条件**。

- Think Before Coding → "每一行改动都能追溯回用户的请求"
- Simplicity First → "一个老工程师看到这些代码会不会觉得过度设计"
- Surgical Changes → 改动范围的边界是可枚举的
- Goal-Driven Execution → 任务先列计划，每步有验收方式

这种"原则 → 可检查条件"的转化，是让规则真正被执行而非被忽略的关键。

## 实践启示

### 对 AI 编程 Agent 开发者的建议

1. **在 Agent 系统层面实现 Think Before Coding**：不要依赖模型的自觉，而要在调度层强制要求模型先输出"歧义列表"再执行。可以在任务初始化阶段插入一个强制性的"澄清节点"，只有当歧义列表为空或全部标记为 resolved 时，才允许进入执行阶段。

2. **用约束而非引导来实施 Simplicity First**：与其告诉模型"要简洁"，不如在系统层面对代码输出的 token 预算进行硬性限制，或者在调度层增加"复杂度惩罚"——对超出必要规模的代码变更要求模型额外论证每个新增组件的必要性。

3. **把 Surgical Changes 变成审计日志**：在代码变更的 diff 阶段，记录每一行改动与原始用户请求的映射关系。这不仅有助于验收，也能在模型做出超范围变更时提供可追溯的证据。

4. **Goal-Driven Execution 的工程实现**：将任务验收条件结构化——不是自然语言描述的"完成标准"，而是可执行的验证脚本或测试用例。AI 生成的测试本身就是完成标准的外化形式。

### 对团队引入 CLAUDE.md 的建议

1. **优先级：全新项目 > 已有项目**：在已有项目中使用时，CLAUDE.md 会对历史代码产生"不一致性感"，建议先在 feature branch 或新模块中试用。

2. **不要直接覆盖已有的 CLAUDE.md**：叠加 `## Behavioral Guidelines` 小节，比替换整个文件更安全，也更容易被团队接受。

3. **针对团队工作流定制 Simplicity First 规则**：原文四条基础规则是通用版，但每个团队的"过度设计"标准不同。建议在 CLAUDE.md 中明确哪些是团队不允许的结构（如没有要求的依赖注入、过度抽象的接口），使其可检查。

### 对 AI 编程评估框架的启示

当前的 AI 编程 benchmark 主要评估**正确性**（代码能否跑通）和**效率**（用了多少步/时间），但缺乏对**结构性失败率**的测量。建议增加以下指标：

- **歧义未澄清率**：任务有歧义时，模型主动提问的比例
- **超范围变更率**：实际改动超出任务要求的比例
- **最小化实现率**：新增代码中真正必要的代码行数占比
- **验收条件达成率**：任务完成后是否真正满足最初的需求

## 相关链接

- **GitHub**：https://github.com/forrestchang/andrej-karpathy-skills（65 行，MIT 协议，134K+ stars）
- **Karpathy 原推**：2026-01-26
- **扩展版本**：[Claude Code 12 Rules Karpathy Extension](ch09-039-claude-md-12-条规则-karpathy-扩展模板.html)（新增 8 条覆盖 agent 编排场景）

## 相关实体

- MOC

---
