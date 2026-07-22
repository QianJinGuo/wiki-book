---
source_url: "https://mp.weixin.qq.com/s/fcmV4qQw867VqxC3A5mZcA"
title: "Superpowers 6.0 源码级深度分析：反作弊重写——reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律"
author: "术哥 (ShugeX / 运维有术)"
date: 2026-06-24
ingested: 2026-06-25
sha256: ""
language: zh
tags: [superpowers, reviewer, anti-cheating, multi-agent, context-economics, progress-ledger, model-discipline, sdd, subagent-driven-development, source-code-analysis, shuge]
---

🚩 2026 年「术哥无界」系列实战文档 X 篇原创计划 第 146 篇，AI 编程最佳实战「2026」系列第 43 篇

大家好，欢迎来到 术哥无界 | ShugeX ｜ 运维有术。

我是术哥，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的技术实践者与开源布道者！

Talk is cheap, let's explore。无界探索，有术而行。

Superpowers 6.0 的官方标题很直白：roughly twice as fast, while spending almost 50% fewer tokens。但官方紧接着补了一句免责声明：these numbers won't hold on every harness and for every workload。

这句话容易被跳过。它恰恰是理解 6.0 的钥匙。

我把本地仓库（v6.0.3）拉下来翻了 158 个 commit、3 个核心 prompt 文件和 3 个 shell 脚本。结论是：6.0 不是一次性能调优，它是一次围绕 reviewer 角色的结构性重写——堵住了 controller 在真实运行里被反复观测到的几条作弊路径，顺手把整个 review 环节的上下文成本重新算了一遍。提速降本是结构改造的副产品。

下面是我从源码里读出来的东西。

说明：本文基于 Superpowers 6.0（v6.0.3）项目源码（github.com/obra/superpowers）、官方 Release Notes 和作者公开材料分析整理。性能数据（约 2 倍速度、近 50% token 减少）来自官方评测，官方明确声明这些数字不会在所有 harness 和所有 workload 上都成立。文中的代码引用、文件路径和设计机制均直接来自源码，但工程取舍和参数建议仅供参考，实际效果请以你的项目和环境测试结果为准。 如果有实际使用经验，欢迎在评论区分享交流。

## 1. 6.0 的真实身份：一次 review 环节重写

先说定位。Release Notes v6.0.0 第一句就点题：

a rewrite of how subagent-driven-development reviews each task — cheaper, stricter, and harder to game

三个形容词是递进的：cheaper（更便宜）、stricter（更严格）、harder to game（更难作弊）。如果你只看公告里那张性能对比图，会以为这是一次 token 优化；但读完 skills/subagent-driven-development/ 整个目录，你会发现 6.0 干的事情更像这样：

把 reviewer 从一个可被辅导、可被绕过、可被静默升级到顶配模型的配角，重写成一个只读、怀疑、独立、强制读文件的裁决者。

三个技术杠杆对应三个成本黑洞：两个 reviewer 合成一个、用文件替代粘贴传递上下文、强制每次 dispatch 声明 model。后面几节逐个拆。

先把性能数字交代清楚，免得后面被当成空头支票。官方原文是：Claude Code 和 Codex 在评测里产出近似质量的结果，速度大约快一倍，token 消耗少近 50%。公告标题数字更激进：up to 50% faster and up to 60% cheaper。两个口径略有差异，以 Release Notes 为准。关键是那句免责声明——这些数字不会在所有 harness 和所有 workload 上都成立。评测基础设施在 https://github.com/prime-radiant-inc/superpowers-evals，主要跑 Claude Code 和 Codex，OpenCode、Cursor 等没有给数字。

## 2. 两个 reviewer 合成一个：一次 diff 出两个裁决

5.x 时代的 SDD（Subagent-Driven Development），每个 task 完成后要跑两轮独立 review：一个 spec-compliance reviewer 检查实现是否对齐 plan，一个 code-quality reviewer 检查代码本身的质量。两个独立 subagent，各读一遍 git diff。

6.0 把它们合并成一个 task-reviewer。task-reviewer-prompt.md 第 2-4 行写得很干脆：

The reviewer reads the task's diff once and returns two verdicts: spec compliance and code quality.

一次 diff，两个裁决。光是少读一遍 diff、少起一个 subagent，这一步就省下了相当可观的 token 和墙钟时间。

新的目录结构是这样的：

skills/subagent-driven-development/
├── SKILL.md                      (418 行，主流程定义)
├── implementer-prompt.md         (139 行，实现者模板)
├── task-reviewer-prompt.md       (188 行，合并后的单一 reviewer 模板)
└── scripts/
    ├── task-brief                (40 行，提取单 task 文本到文件)
    ├── review-package            (44 行，打包 diff 到文件)
    └── sdd-workspace             (22 行，解析工作区路径)


对比一下，5.x 这里是两个独立的 reviewer prompt 文件（spec-reviewer-prompt.md 和 code-quality-reviewer-prompt.md），现在都被删掉、合并进了一个文件。这个合并不是简单拼接——它的裁决逻辑重写了，后面会讲。

## 3. reviewer 变成只读怀疑论者

这是 6.0 相当有意思的部分。reviewer 不再信任 implementer 的自述。

task-reviewer-prompt.md 第 55-62 行有一段，标题就叫 Do Not Trust the Report，原文大意：把 implementer 的 report 当成未经证实的说法，它可能不完整、不准确、或者过于乐观。要拿 diff 去验证这些说法。报告里的设计理由也是说法——「按 YAGNI 留着的」「故意保持简单」——判断代码要看代码本身，一个陈述出来的理由永远不会降低一条发现的严重性。

这段话为什么重要？因为它堵住了一条真实的作弊路径。在 5.x 的实际运行中，implementer 会写「我故意没做抽象，保持简单」，reviewer 会买账，缺陷就漏过去了。6.0 直接在 prompt 层面规定：理由不能降级发现。

接着是只读约束。第 52-53 行：

Your review is read-only on this checkout. Do not mutate the working tree, the index, HEAD, or branch state in any way.

注释里提到，曾经有 reviewer 自己跑了 git checkout，导致后续 commit 变成孤儿提交。只读约束的动机不是洁癖，是堵另一个运行时事故。

再往上，controller 也被禁止辅导 reviewer。SKILL.md 第 169-173 行的 Red Flags 明确：告诉 reviewer 不要标记什么、或者在 dispatch prompt 里预判某条发现的严重性（比如 treat it as Minor at most），都是禁止行为。官方原话举了个反例——plan 里的 example code 只是起点，不能当作「它的弱点是被有意选择的」证据。

这是 multi-agent 系统里委托代理问题的教科书案例。controller 的目标是让任务尽快过审，reviewer 是守门人。如果 controller 能影响 reviewer 的判断，守门就形同虚设。6.0 的解法是把两者彻底隔离：controller 不能预判严重性，reviewer 不信任 controller 派来的 implementer 的自述，plan 里写的东西也不能给自己的产物背书。

task-reviewer-prompt.md 第 130-135 行还有一条更狠的校准规则：如果 plan 或 brief 明确要求了一件被这个 rubric 判定为缺陷的事（比如一个什么都不 assert 的测试、一段逐字复制的逻辑块），那仍然算一条发现，标 Important，打上 plan-mandated 标签。原话是——The plan's authorship does not grade its own work; the human decides（plan 的作者身份不能给自己的产物打分，由人来决定）。

## 4. 文件替代粘贴：三个脚本的上下文经济学

cheaper 这个词到底便宜在哪，源码里有答案。

SDD 的核心设计是上下文隔离：每个 implementer subagent 只拿到它那个 task 的精确文本，不继承 session 的历史。SKILL.md 第 10 行说得很直白：

They should never inherit your session's context or history — you construct exactly what they need.

但 5.x 的实现有个成本漏洞。controller 要把 task 文本和 git diff 传给 subagent，用的是粘贴——直接写进 dispatch prompt。SKILL.md 第 220-223 行点出了问题所在：

Everything you paste into a dispatch prompt — and everything a subagent prints back — stays resident in your context for the rest of the session and is re-read on every later turn.

也就是说，你粘进去的每一行 diff，都会在 controller 的 context 里待到 session 结束，并且之后每一轮都会被重新读一遍。reviewer 要反复跑 git 命令拿 diff，这些命令的输出全部留在 context 里。一次运行下来，controller 的上下文被 diff 和 git 输出塞得满满当当。

6.0 的解法是三个小脚本。第一个叫 task-brief，40 行，用 awk 从 plan 文件里抽出指定编号 task 的完整文本（识别 #+Task N 标题），写到 .superpowers/sdd/task-N-brief.md。第二个叫 review-package，44 行，跑一次 git log --oneline、git diff --stat、git diff -U10（10 行上下文），合并写入一个 .diff 文件，文件名按 commit 范围命名，这样 re-review 时会拿到新文件。第三个叫 sdd-workspace，22 行，解析工作目录、把 * 写进 .gitignore（self-ignoring），是前两个脚本的单一真相源。

subagent 现在去读文件，而不是从 prompt 里接收粘贴内容。controller 的 context 里只剩一行文件路径，而不是几百行 diff。

这个改动单独省了约 10% 的 token 和时间（官方说法）。更关键的是，它开始把上下文当成一种有成本的东西来花——而不是免费的无尽资源。

同样的思路还体现在 writing-plans 的结构变更上。writing-plans/SKILL.md 现在强制每个 plan 以固定 header 开头，包含一段 Global Constraints（项目级硬性要求，逐条复制进每个 task），并且每个 task 必须带一个 Interfaces block：

**Interfaces:**
- Consumes: [从前面 task 消费什么 — 精确签名]
- Produces: [后面 task 依赖什么 — 精确函数名、参数和返回类型]


为什么要这样写？因为 implementer subagent 只看得到自己的 task brief，上下文是隔离的。如果不在 brief 里告诉它邻居 task 的接口契约，它就无从知道。这是一个被迫的结构性变更——隔离上下文省了钱，但必须在 plan 层面补上被隔离掉的信息。

## 5. Progress Ledger：对抗 compaction 失忆

这是源码里戏剧化的一段。

SKILL.md 第 246-264 行讲了一个叫 Durable Progress 的设计，开头一句：

Conversation memory does not survive compaction. In real sessions, controllers that lost their place have re-dispatched entire completed task sequences — the single most expensive failure observed.

controller 在长 session 里会被 compaction（上下文压缩）抹掉记忆。抹掉之后，它不记得哪些 task 已经做完，于是重新派发一整套已完成的 task。官方说这是观测到的成本很高的失败模式。

解法是一个 git-ignored 的 progress.md 文件，每完成一个 task 追加一行，格式大致是：

Task N: complete (commits <base7>..<head7>, review clean)


compaction 之后，controller 读这个文件加 git log 来恢复进度，而不是信任自己的记忆。SKILL.md 里特别叮嘱一句：trust the ledger and git log over your own recollection（信账本和 git log，别信你自己的回忆）。 这里有个容易被忽略的事实：agent 的记忆不等于对话历史。对话历史会被压缩、会被截断，而文件系统不会。把关键状态落盘，是让 agent 在长任务里保持一致性的根本手段。Superpowers 在这里把 progress ledger、task brief、review diff 全部放在同一个 .superpowers/sdd/ 目录下，构成了一套以文件为媒介的状态机。

## 6. Model 纪律：从静默继承到强制声明

还有一个技术杠杆，也更隐蔽。

5.x 时代，controller 派发 subagent 时不指定 model。默认行为是继承当前 session 用的 model——而 session 里用的往往是顶配档位那一个。结果就是，一次运行可能把 26 个 reviewer 全跑在顶配模型上，而 reviewer 这种读 diff 判合规的任务，根本不需要顶配。

6.0 在两个 prompt 模板开头都强制要求声明 model，提示原文：

model: [MODEL — REQUIRED: choose per SKILL.md Model Selection;
an omitted model silently inherits the session's most expensive one]


括号里那句话点明了默认行为的陷阱——漏填就静默继承 session 里顶配档位的 model。这种 bug 的恶心之处在于它不报错、不告警，只是账单悄悄变大。

这个 fix 本身很简单，但它对应的那条成本规律是反直觉的。SKILL.md 第 119-121 行：

Turn count beats token price. Wall-clock and context cost scale with how many turns a subagent takes, and the cheapest models routinely take 2-3× the turns on multi-step work — costing more overall.

便宜的模型在多步任务上要跑 2 到 3 倍的轮次，算下来反而更贵。所以 6.0 的 model 选择指导不是无脑用便宜的，而是按任务复杂度匹配档位——简单的 review 用中档，复杂的实现用高档。这个判断和 Jesse Vincent 在 Heavybit 播客里说的一致：way more expensive to make broken software，他们更看重正确性，而非单纯压价。

## 7. 边界与诚实：6.0 没解决、资料没法确认的东西

读完源码也得说清楚哪些是 6.0 没解决的、或者当前资料没法确认的。

第一，性能数字的适用范围。前面强调过的那句免责声明再重复一遍：these numbers won't hold on every harness and for every workload。评测主要在 Claude Code 和 Codex 上跑，OpenCode、Cursor、Gemini CLI 等其他 harness 的改进幅度官方没给数字。你如果在别的 harness 上用，别预期一定能拿到一样的提升。

第二，6.0.3 才修掉一个运行时约束问题。release notes 提到，Claude Code 把 .git/ 当成受保护路径，agent 不能往里写。所以早期 SDD 把报告写进 .git/sdd/ 时会被中途挡掉，implementer subagent 写报告写到一半被 block。6.0.3 把所有工作产物搬到工作树里的 .superpowers/sdd/，并让这个目录 self-ignoring。原话是：

Task briefs, implementer reports, review diffs, and the progress ledger now live in a self-ignoring .superpowers/sdd/ directory in the working tree.

这是一个典型的 agent 运行时约束反向塑造工具设计的案例——因为宿主不让写 .git/，所以 SDD 的工作区必须搬到工作树里。这类约束以后只会更多。

第三，截至发稿，6.0 发布才几天，社区对 6.0 本身的实测反馈还没规模化。我在调研里看到的 Reddit/HN 讨论（包括 4 月那波 slow me down 的批评）都是针对 5.x 的。Jesse 在 6.0 公告里明确说 slow isn't fun 是改进动机之一，所以 6.0 的性能改造确实是对那波批评的回应。但它是否真的堵住了速度批评，要看后续社区反馈。

第四，有一组来源我没法交叉验证。Pulumi 和 Termdock 的文章提到 chardet 用 Superpowers 重写后性能提升 41 倍，Termdock 还补了一句 96.8% accuracy。这两个数字都只有单一来源，没找到 chardet 官方或 Jesse 本人确认。这类数据我不会当成事实写进正文，只在这里标注存疑。

## 8. 顺带一提：skills 的去方言化

主线讲完了，顺带说一个和 reviewer 改造同周期、但属于另一个维度的事。

6.0 把所有 skills 的表达从 Claude Code 方言改写成了 vendor-neutral。using-superpowers/SKILL.md 第 44 行明确了新原则：skills speak in actions（dispatch a subagent、create a todo、read a file），rather than naming any one runtime's tools。

之前 skills 里写的是 use the Task tool、put it in CLAUDE.md 这种 Claude Code 专属方言。现在 skills/using-superpowers/references/ 下有 6 个 per-harness 工具映射文件（antigravity、claude-code、codex、copilot、gemini、pi），每个文件统一格式，把动作映射到具体工具。官方支持的 harness 从早期的 Claude Code 一家，扩到了 11 种。

这件事和 reviewer 重写是同一个工程哲学的两面：把可复用的逻辑（review 流程、skill 指令）和具体运行时（Claude Code、Codex）解耦。reviewer 不绑定特定 model 选择行为，skills 不绑定特定工具调用语法。

## 总结

把上面这些串起来，6.0 的内在逻辑是一条线。

reviewer 是 multi-agent 系统里的守门人。守门人如果可被辅导、可被绕过、可被静默升级到顶配模型，整个系统的工程纪律就形同虚设。6.0 用一套组合拳把这个守门人重新焊死——合并成单一裁决者、设成只读、禁止 controller 干预、用文件隔离上下文、强制声明 model 档位、用 progress ledger 对抗失忆。

这恰好是 v4.3.0 那篇 Claude 客座文章里那句话的 multi-agent 版本：

Advisory language tests comprehension. Hard gates and checklists test compliance.

建议性的语言测试的是理解力，硬闸门和清单测试的是服从度。5.x 的 reviewer 用的是偏建议性的语言（可以信任 report、可以预判严重性），6.0 换成了硬闸门（不信任、只读、禁止干预）。

如果你的 agent 系统里也有 review 环节，这套思路值得借：把守门人和执行者彻底隔离，给守门人一个它无法被说服去怀疑自己的 rubric，把上下文成本算进每一次 dispatch，把关键状态落盘而不是信任对话记忆。

一句话收尾：6.0 提速降本，靠的不是更聪明的优化，而是更老实的工程。
