---
source_url: https://mp.weixin.qq.com/s/q7nuyMeB7AzECSQ11FfaTA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！"
author: ChallengeHub小编
published: 2026-05-20
platform: WeChat
ingested: 2026-05-20
review_value: 9
review_confidence: 10
review_recommendation: strong
review_stars: 5
sha256: fe469ad6cf15ff00adf238d76167e48cc116a2429b16a7a5ee3cb3e4497682c7
---
---
# 最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！
> Andrej Karpathy（OpenAI 联合创始人、Tesla 前 AI 负责人）2026 年 1 月发推分享 AI 编程经验，Forrest Chang 整理成 CLAUDE.md，GitHub 11 万星。核心理念：AI 编程 Agent 有四种结构性失败，四条行为准则可以对治。
## 背景
- Karpathy 2026 年 1 月 26 日发推，分享 AI 编程工作流最大变化：从 80% 手动写代码 → 80% 靠 Agent 生成
- 推文获得近 800 万次浏览
- Forrest Chang 把四个观察点整理成 CLAUDE.md 推向 GitHub，一天 6000 Star，一周 4 万，三个月 11 万，跻身 GitHub 历史 Star 数 Top 100
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
These guidelines are working if:
fewer unnecessary changes in diffs, fewer rewrites due to overcomplication,
and clarifying questions come before implementation rather than after mistakes.
```
## 逐条解析：每条规则在解决什么问题
### 规则1：先想清楚再动手
**针对的失败模式**：AI 遇到模糊需求时，会用听起来合理的答案把空填上，然后往下冲——而不是停下来问一句。
**改变交互流程**：
- 原来：用户给需求 → AI 猜测意图 → 实现出来不对 → 用户纠错（多轮循环）
- 加规则后：用户给需求 → AI 提出歧义 → 澄清之后再实现
前置一个问题，省掉后面五轮返工。
### 规则2：能简单就别复杂
**针对的失败模式**：AI 偏向生成比必要更多的代码——更复杂的代码在训练数据里通常代表"更完整、更专业"的信号。
**压制偏向的具体做法**：
- 没有人要求的 feature 不加
- 用一次的代码不抽象
- 不可能发生的异常不防御
- 没被要求"灵活可配置"就不搞扩展性
**自检问题**：一个老工程师看到这些代码会不会觉得过度设计？如果是，重写。
**核心逻辑**：复杂不是智慧的体现，通常是思路不清晰的症状。
### 规则3：只动该动的地方
**针对的失败模式**：AI 改代码时有个习惯性动作——"既然来了，顺便把这个也优化一下……"
**规则**：
- 只改任务要求的部分
- 不顺便优化周边逻辑，不重构没坏的东西，不改格式和注释风格
- 你的改动带来的孤儿代码（变成没人用的 import、变量、函数）要清掉
- 之前就存在的死代码别动，除非明确被要求
**验收标准**：每一行改动都能追溯回用户的请求。这让 diff 更干净，code review 更容易，debug 更可预测。
### 规则4：目标要可验证
**针对的失败模式**：没有明确的完成标准，AI 会在"感觉差不多了"的时候停下来，而不是在"确实对了"的时候停下来。
**解法**：把任务变成可核查的目标：
| 模糊表述 | 可验证目标 |
|---------|-----------|
| "加一个校验" | "为无效输入写测试，然后让测试通过" |
| "修这个 bug" | "写一个能复现 bug 的测试，然后让它通过" |
| "重构 X" | "确保重构前后测试都通过" |
多步骤任务先列计划，每一步说清楚怎么验收。
## 这个文件爆火说明了什么
每个用过 AI 编程工具的开发者都碰过同样的墙：
> 让 AI 加一个小的缓存层，它把函数签名重写了，引入了一个没有要求的依赖注入模式，把缓存包在了一个暴露出八个方法的类里——缓存本身只有三行。
这不是极端案例，这是默认行为。Karpathy 做的事情是用准确的语言把这些挫败感说了出来。
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