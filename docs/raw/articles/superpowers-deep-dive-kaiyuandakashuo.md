---
source_url: "https://mp.weixin.qq.com/s/tUstpkIRaD71YYfanBSANA"
title: "给 Claude Code 装上「方法论」：深入解读 superpowers"
source: "开源大咖说"
ingested: 2026-06-15
sha256: "f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8"
type: raw
tags: [superpowers, claude-code, skill, jesse-vincent, obra, rule-gate-hook, iron-law, hard-gate, writing-skills, session-start-hook, perl, agentskills]
---

给 Claude Code 装上「方法论」：深入解读 superpowers

一个被 17 万开发者点赞的 Agent 工作流框架

◆一、作者 Jesse Vincent 履历

1994 卫斯理大学创建 Request Tracker (RT) → 2001 Best Practical Solutions
2005-2008 Perl 6 项目经理（"pumpking"），发布 Perl 5.12/5.14
K-9 Mail（Mozilla 收购 → Thunderbird for Android）
与 Kaia Dekker 创立 Keyboardio 做人体工学键盘
2021 VaccinateCA 帮美国人查疫苗
2025 伯克利 Prime Radiant，Superpowers 旗舰

方法论核心："管理 AI = 2000 年代初通过 IRC 远程指挥 MIT 实习生"

◆二、Vanilla Claude Code 的"无纪律"问题

"The problem is not the model's intelligence. It is the absence of discipline."

"An implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow."

Rebuild.fm 案例：15 秒生成"刷新就丢数据的 todo app" → 25 分钟五阶段项目跑完 Red-Green TDD，$20 token 成本。四倍成本几十倍时间，但产出从"看着像"变成"重启能保存"。

Jesse 称这种新风格为 "ultra-high-speed waterfall"——因为重写成本极低，反倒可重新拥抱 spec-first 瀑布流。

◆三、整体架构：SessionStart Hook + 14 个 SKILL.md

启动机制：注入 < 2k token 的 prompt：
<session-start-hook><EXTREMELY_IMPORTANT>
You have Superpowers.
**RIGHT NOW, go read**: @.../skills/getting-started/SKILL.md
</EXTREMELY_IMPORTANT></session-start-hook>

1% rule（using-superpowers/SKILL.md）：
"Invoke relevant or requested skills BEFORE any response or action. Even a 1% chance a skill might apply means that you should invoke the skill to check. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. This is not negotiable."

v4.3.0 修复：Graphviz DOT 流程图中专门拦截 EnterPlanMode 入口（防止 Claude 自带 plan mode 当捷径绕开 brainstorming）

14 个核心技能（v5.0.7）：
- using-superpowers / brainstorming / using-git-worktrees / writing-plans
- subagent-driven-development / executing-plans / test-driven-development
- systematic-debugging / requesting-code-review / receiving-code-review
- finishing-a-development-branch / verification-before-completion
- dispatching-parallel-agents / writing-skills

SKILL.md 内部约定：
- 强烈不在 description 描述 workflow（会变"捷径"）
- 第三人称 + imperative（"Use when …"）
- 大量用 Graphviz DOT、Iron Law、HARD-GATE、Red Flags 表

◆四、完整工作流 7 阶段

4.1 Brainstorming — HARD-GATE 强制 6 步 checklist
v5.0 引入 Visual Brainstorming Companion（本地 WebSocket + Express）

4.2 using-git-worktrees — 5 步脚本
输出格式严格："Worktree ready at <full-path> / Tests passing / Ready to implement <feature-name>"
"Fix broken things immediately" 哲学

4.3 writing-plans — 整个仓库最值钱
模板：每个 task 默认拆成 RED-GREEN-REFACTOR 三步 / 精确文件路径甚至行号 / 禁止占位符
"TBD"/"TODO"/"implement later"/"fill in details" 都是 plan 失败

4.4 subagent-driven-development — v4 核心改造
"用 Haiku 跑实现" — 详细 plan 让 Sonnet/Opus 写，Haiku 跑
双阶段审查循环（spec review + code quality review）

requesting-code-review 调用模板：git SHA + 任务上下文 + plan 摘要
按 Critical / Important / Minor 三档报问题

receiving-code-review 约束被审者：READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT
"如果 6 条意见你只懂 4 条，必须先停下问清楚"

4.5 test-driven-development — Iron Law 铁律
"If production code was written before its test exists and was observed failing, the code must be deleted. There are no exceptions for 'reference' or 'adaptation'. Delete means delete. Implement fresh from the tests only."

Rationalizations 反驳表（Anti-rationalization）：
- "Skip TDD just this once" → 那是借口，不是例外
- "Tests written after work the same" → 事后写测试回答"做什么"，先写测试回答"应该做什么"
- "Time already spent, sunk cost" → 留下没真测过的代码就是技术债
- "Manual testing is enough" → 手动执行是临时拼凑

4.6 systematic-debugging — 4 阶段
Phase 1 Root Cause Investigation → Phase 2 Pattern Analysis → Phase 3 Hypothesis Testing → Phase 4 Implementation
Phase 4.5：3 次 fix 都失败 → STOP，回到 Phase 1（"这不是假设失败，是架构错误"）
"redirect signals"：用户说"Is that not happening?"/"Stop guessing"/"Ultrathink this" 必须立即回 Phase 1

4.7 verification-before-completion
"Claiming work is complete without verification is dishonesty, not efficiency."
IDENTIFY → RUN → READ → VERIFY → STATE 四步

4.8 finishing-a-development-branch — 四选一没第五个
merge / Create PR / Keep as-is / Discard
"Open-ended questions are ambiguous. Fix: Present exactly 4 structured options."

4.9 dispatching-parallel-agents — 严格触发
3+ 互不相关失败 / 无共享状态 / 独立调查完成

4.10 writing-skills — TDD 应用到 prompt engineering
RED：写压力测试场景，记录 agent 怎么 rationalize 出捷径
GREEN：根据观察到的 rationalization 写 skill 反驳
REFACTOR：装上 skill 再跑，看 agent 还能找新借口

Jesse 真实例子："生产宕机每分钟 $5k 损失。A)立即调试 5 分钟 B)检查 skill 2+5=7 分钟。你选哪个？"
agent 在金钱压力下选 A → skill 不够硬 → 加更强优先级

Cialdini《影响力》六原则（authority/commitment/liking/reciprocity/scarcity/social proof/unity）"PUA Skill"

description 写法范例：
- ❌ BAD: vague "For async testing"
- ❌ BAD: firstperson "I can help you with async tests"
- ❌ BAD: tech-named but not actually tech-specific
- ✅ GOOD: "Use when tests have race conditions, timing dependencies, or pass/fail inconsistently"

◆五、Rule vs Gate vs Hook（核心哲学）

Rule: "Don't cross the street without looking." — 可合理化绕开
Gate: "HARD GATE: Before you cross the street, look left, verify zero vehicles, look right, verify zero, look left again, verify still zero." — 无绕行路径
Hook: 经典确定性软件，特定动作触发

"A rule has an opt-out path (I can rationalize 'I'll do it after this one thing'). A gate doesn't — the next action is blocked until the gate condition is met."

Superpowers 里几乎每个关键转换都被设计成 gate：brainstorming 必须先有 design doc / TDD 必须先看测试失败 / verification 必须先跑命令 / finishing 必须先全绿。

◆六、与 Anthropic 官方 Skills、Subagent、MCP

格式完全兼容 agentskills.io 规范，但目标不同：
- Anthropic 官方：能力扩展（PDF/PPT/Excel）
- Superpowers：流程纪律

唯一依赖：bash + Node.js（仅 brainstorm server）。无 MCP。

哲学差异：
- Anthropic：用户显式调用
- Superpowers：agent 自动判断 + 1% 规则强制触发
- 社区数据：300k 安装、169k stars（后者赢）

◆七、社区评价

正面：Simon Willison（独立 tag）/ Brad Feld "a plugin that doesn't give Claude new capabilities; it gives Claude discipline" / Builder.io 3500 字 case study / Engr Mejba Ahmed 12-session A/B：6 次带 vs 6 次不带，token 减 14%

批评：
- 无正经 benchmark（数字都来自实践记录非对照实验）
- 认知负担（管理多 subagent 工作流本身有心智成本）
- "模型已吃过 100 本 TDD 的书，再喂 SKILL.md 真能加什么？"（价值在 enforcement 不在 knowledge transfer，但是假设不是测量）
- Slop PR 问题（issue 让 agent "go fix and open a PR"）
- 依赖强模型（GLM 4.6、Kimi K2 会跳步骤）

◆八、SDLC 范式贡献

| 传统 SDLC | Superpowers 重新解释 |
|----------|------------------|
| 需求评审 | brainstorming + spec self-review + user 签字 |
| 架构设计 | brainstorming "File Structure" + 单元分解 |
| 任务拆分 | writing-plans bite-sized tasks |
| 编码规范 | TDD Iron Law、YAGNI、DRY 写在 plan 模板 |
| Code review | 分 spec review + code quality review |
| 集成测试 | verification-before-completion evidence gate |
| 分支管理 | using-git-worktrees + finishing-a-development-branch |
| 并行开发 | dispatching-parallel-agents（限制：3+ 独立失败） |

真正新的部分：
- 用 Gate 取代 Rule（LLM 会 rationalize）
- 1% 规则
- Subagent 上下文隔离（绝不继承会话历史）
- 双阶段审查循环（避免同一审查者注意力分散）
- 对抗式技能测试（adversarial skill testing，类似 prompt TDD）
- Graphviz DOT 流程图（不可随意解释）
- 具备说服意识的提示设计（persuasion-aware prompting）

◆九、适用 vs 不适用

适合：复杂功能 / 生产代码 / 大型 refactor / 长 session
不适合：一次性脚本 / 极小 bug fix / 你对架构已了然只需"打字员" / 模型能力不够

Jesse 探索第二种 mode："iterative greenfield"——不走 spec-first，从行为示例反向生成 spec 再 clean reimplement。说明 spec-first 不是万能。

◆结语

"Welcome to the team. Here's the runbook. We don't ship without tests."

仓库地址：github.com/obra/superpowers
