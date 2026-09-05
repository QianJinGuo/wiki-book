---
sha256: 3c566c7c8dbb8cae347a68593a99b8b1bef093daa1906d03df501e21f4ce543f
title: "Claude写代码错误率从41%降到11%：Karpathy的4条规则为什么不够"
source_url: "https://mp.weixin.qq.com/s/8J8E1vwe_3Jk8ga2H492Bg"
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
feed_name: "高可用架构"
date: 2026-05-11
author: "Mnimiy (@Mnilax)"
review_value: 9
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 5
original_title: "Claude写代码错误率从41%降到11%：Karpathy的4条规则为什么不够"
---
# Claude写代码错误率从41%降到11%：Karpathy的4条规则为什么不够
> 导读：本文详细扩展了 Claude AI 编码的 CLAUDE.md 模板，从 Karpathy 2026 年 1 月原 4 条规则增至 12 条，针对 5 月出现的 agent 冲突、多步工作流和 token 预算等问题提供具体修复。
作者基于30个代码库6周实测数据，证明12条规则将任务错误率从41%降至3%，同时保持78%至76%的遵守率，强调每条规则需对应可观察的失败模式以避免提示膨胀。文末给出完整可复制的 12 条规则 CLAUDE.md 文件，建议置于仓库根目录并根据项目具体痛点精简。
## 背景：Karpathy 的 4 条规则
2026 年 1 月下旬，Andrej Karpathy 吐槽 Claude 写代码的三个失败模式：默默做错假设、过度复杂化、把不该碰的代码也顺手弄坏。Forrest Chang 整理成 CLAUDE.md 4 条规则，获 120,000 star。
- **规则 1，先思考再写代码**：说清楚假设，暴露取舍，猜之前先问
- **规则 2，简单优先**：最少代码，不做推测性功能，不过度抽象
- **规则 3，手术式修改**：只碰必须碰的地方，不顺手改进相邻代码
- **规则 4，以目标驱动执行**：定义成功标准，循环直到验证通过
4 条规则将错误率从 ~40% 降到 3% 以下，但解决的是 1 月的"写代码"问题。
## 2026年5月的新问题
agent 之间互相打架、hook 级联触发、skill 加载冲突、跨 session 的多步骤工作流断裂。
## 新增 8 条规则
### 规则 5，不要让模型做非语言工作
**Rule 5 — Use the model only for judgment calls**
- Use Claude for: classification, drafting, summarization, extraction
- Do NOT use for: routing, retries, status-code handling, deterministic transforms
- If a status code already answers the question, plain code answers the question
### 规则 6，硬 token 预算，没有例外
**Rule 6 — Token budgets are not advisory**
- Per-task: 4,000 tokens. Per-session: 30,000 tokens
- If approaching budget, summarize and start fresh
### 规则 7，暴露冲突，不要折中平均
**Rule 7 — Surface conflicts, don't average them**
- Pick one (more recent / more tested), explain why, flag other for cleanup
- "Average" code that satisfies both rules is the worst code
### 规则 8，先读再写
**Rule 8 — Read before you write**
- Read exports, callers, shared utilities before adding code
- "Looks orthogonal to me" is the most dangerous phrase
### 规则 9，测试不是可选项，但测试也不是目标
**Rule 9 — Tests verify intent, not just behavior**
- Tests must encode WHY behavior matters, not just WHAT it does
- A test that can't fail when business logic changes is wrong
### 规则 10，长时间运行的操作需要检查点
**Rule 10 — Checkpoint after every significant step**
- Summarize what's done, verified, left after each step
- Don't continue from a state you can't describe back
### 规则 11，约定胜过新奇
**Rule 11 — Match the codebase's conventions**
- Conformance > taste inside the codebase
- If convention is harmful, surface it, don't fork silently
### 规则 12，失败要显眼，不要沉默
**Rule 12 — Fail loud**
- "Completed" is wrong if anything was skipped silently
- Default to surfacing uncertainty, not hiding it
## 数据
6 周、30 个代码库、50 个任务跟踪：
| 配置 | 错误率 | 遵循率 |
|------|--------|--------|
| 无规则 | 41% | — |
| Karpathy 4 条 | ~3% | 78% |
| 全部 12 条 | 3% | 76% |
从 4 条增至 12 条，遵循率仅从 78% 降到 76%，但错误率再砍 8 个点。新增规则覆盖的是原始 4 条未处理的失败模式。
## Karpathy 模板的 4 个失效点
1. **长时间运行的 agent 任务**：没有预算、检查点、失败显式规则，pipeline 会漂移
2. **多代码库一致性**："匹配既有风格"假设只有一种风格
3. **测试质量**：目标驱动把"测试通过"当成功，没说测试必须有意义
4. **生产 vs 原型**："简单优先"在早期代码过度触发
## 没有效果的做法
- Reddit/X 上看到的规则：大多只是重述 Karpathy 的 4 条
- 超过 12 条：14 条后遵循率从 76% 掉到 52%
- 依赖可能不存在的工具：规则静默失败
- 在 CLAUDE.md 放例子：例子比规则更重，Claude 会过拟合
- "小心一点/认真思考"：不可测试，遵循率约 30%
- 告诉 Claude "像资深工程师"：没用，Claude 已经觉得自己是了
## 心智模型
CLAUDE.md 不是愿望清单，而是行为契约，用来关闭已观察到的具体失败模式。每条规则都应回答：这能防止哪种错误？
一份根据真实失败模式调过的 6 条规则 CLAUDE.md，胜过 12 条用不上的规则。
## 完整 12 条模板（文末）
```
# CLAUDE.md — 12-rule template
## Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
## Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
## Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
## Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
## Rule 5 — Use the model only for judgment calls
Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
## Rule 6 — Token budgets are not advisory
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
## Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
## Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
## Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
## Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
## Rule 11 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
## Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
```
安装：`curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md` 然后粘贴规则 5–12。