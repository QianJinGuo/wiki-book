# 🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead

> 📊 Level ⭐⭐⭐⭐ | 8.5KB

> **来源**: [🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead](https://www.lennysnewsletter.com/p/how-i-ai-how-to-write-ai-agent-loops)

## 摘要

本期「How I AI」分两段：Claire 用 Claude Code 与 Codex 现场搭出四类循环（heartbeat / cron / hook / goal loop）；Mozilla 杰出工程师 Brian Grinstead 复盘团队如何靠自建 harness 一个月交付 423 个 Firefox 安全修复。核心结论只有一句——循环并不神秘，它就是「一个会自己触发的 prompt」，门槛在于你能否把这份工作说清楚。

## 核心要点

- **循环 = 会自己触发的 prompt**：heartbeat、cron、webhook 都是老概念，新东西只是把执行目标从批处理脚本换成 AI agent。
- **goal loop 最强，也最常被写坏**：它不按计时器停，而是「验证通过」或「agent 卡住」才停；成功标准一模糊就无限烧 token——让 Codex 自己写目标，以 OpenAI 的 goal 写作指南为起点。
- **用「给新员工做 onboarding」的框架写循环**：岗位说明书 = 检查什么 + 多久一次 + 期望产出 + 出问题找谁；「每周五 10 点 review 已合并 PR、找出缺失技能」既是岗位描述也是循环 prompt。
- **循环写得不小心就很贵**：成功标准含糊、验证阈值太薄时，agent 会一直跑一直计费却无实质进展，成本与产出质量须从第一天起同时监控。
- **你的 agent 可以有自己的 agent**：为每个 PR 派生专属 subagent 盯到 merge check 全绿；周度技能循环识别缺口后派生 subagent，用 goal loop 验证新技能。
- **验证闭环决定循环能否无人值守**：Firefox 团队一个月用 agent 交付 423 个修复，靠「真实触发 crash + verifier subagent 复核」把误报压到近零。

## 循环类型对比

| 类型 | 触发方式 | 停止条件 | 最适合 |
| --- | --- | --- | --- |
| Heartbeat | 固定间隔心跳（每 N 分钟） | 单次执行结束 | 轻量巡检、需要「一直有人看着」的状态 |
| Cron | 定时表达式（如每周五 10:00） | 单次执行结束 | 有明确时间节奏的例行工作，如周度 skills 复盘 |
| Hook | 事件（提交、PR 打开、工具调用前后） | 事件处理完成 | 对代码或流程事件做即时反应，如 PR 一开就介入 |
| Goal loop | 设定期望结果后立即启动 | 结果被验证通过，或 agent 判定卡住 | 结果可验证的长任务，如「修到 merge check 全绿」 |

## 深度分析

### 1. 祛魅：一个会自己触发的 prompt

Claire 反复强调的第一件事是去掉「循环」二字的光环。heartbeat、cron、webhook 早已存在，本轮变化只是把它们指向 AI agent 而非批处理任务——写循环本质上是「把一段 prompt 挂到触发器上」。不再把它当新物种，就会自然用调度运维的老经验审视它：谁触发、跑多久、失败怎么办、留下什么记录。

### 2. goal loop：最强也最容易被写坏的一类

四类循环里，goal loop 同时坐在威力和风险的同一端：给定期望结果，反复驱动 agent 直到它被验证通过、或 agent 承认卡住。「不按时间停、按完成停」让它能承担真正自主的工作，也意味着**验收标准就是它的刹车片**——标准模糊就没有终止条件。Claire 的建议是把起草权交给 Codex 自己，以 OpenAI 的 goal 写作指南为范本，先把「什么叫完成」写成机器可判定的句子。

### 3. 子代理循环：让 agent 拥有自己的 agent

真正让循环能力跃升的是「循环派生循环」。Claude Code 里那个 PR-review 循环不满足于轮询状态，它给每个 PR 派生专属 subagent 盯到所有 merge check 变绿；周度技能循环识别缺失能力后立刻派生 subagent，用 goal loop 验证每条新技能。关键收益是注意力隔离：主循环只做「分派与汇总」，等待、重试、验证下推到子代理，它因此能按节奏开机而不被单个任务阻塞。

周度技能缺口循环值得直接抄：`每周五上午 10 点，review 所有已合并 PR，找出 agent 还缺哪些技能`——节奏、数据源、分析目标压进一句话，再按目标循环规则派生 subagent 验证候选技能。

### 4. Firefox 的 423 个修复：长程循环的能力边界

第二段的证据来自 Mozilla：Brian Grinstead 的团队用 AI agent 一个月交付 423 个 Firefox 安全修复。他的结论是，真正的解锁点不是模型，而是围绕模型的自建 harness——「其实是相当简单的 wrapper，你只需要给它访问正确工具的权限」，即让 agent 能评分文件、跑 goal loop、派 subagent 验证 bug，同时把人留在审查环节。

最能说明长程循环价值的是「agent 的韧性是人不具备的」：它会反复尝试 14、15、20 种路径而不疲惫、不失焦（Brian 说有 bug 试到第 14 次才成功），并直言「认知能量会随时间衰减，而 agents 不会」。配套两道验证闸门：agent 必须先在 fuzzing build 里真实触发一次 crash（信号极明确），再由 verifier subagent 检查报告是否成立、是否只涉及测试专用配置，交到人类手上时误报几乎为零。数百万行代码上，团队用一个「非常简单」的 LLM judge 按「内存安全风险」与「网页可达性」给文件打分，决定先派 agent 去哪里。

边界同样清楚：agent 会盯死被指定的任务而忽略全局——打补丁的 agent 常只修那一个脆弱点，人类接手后才说「这里对，但还有三处类似的」。所以「人这一侧」不是可选项，而是循环能无人值守的前提：权限收窄到最小作用域、有明确验证、失败能通知到人。他还建议直接用厂商 harness（Claude / OpenAI agent SDK）而非第三方框架，因为模型很可能针对自家基础设施做过 post-training；安全场景应同时跑多个模型与 harness，不同组合会在不同弱点上「起峰」。

## 实践启示

1. **先写验收，再写循环**：把「完成」写成机器可判定的信号（merge check 全绿、crash 可复现），否则 goal loop 没有刹车。
2. **用岗位说明书模板起手**：每个循环 prompt 至少含节奏、检查项、期望产出、升级路径（失败通知谁）四段。
3. **给每个长任务配专属 subagent**：主循环只负责派生与汇总，轮询与重试下推给子代理，别阻塞在单个 PR 上。
4. **权限按最小范围收**：只有作用域受限（限定目录/命令）、通知明确、失败可观测的循环，才值得长时间无人值守地挂着。
5. **从零成本的 morning briefing 起手**：先跑通「每早查日历+邮件 → 发摘要到 Slack」，再平移到 PR review 与 skills 缺口发现。
6. **第一天就同时盯成本和产出质量**：记录运行日志、耗时、token 花费与通过率；含糊的成功标准加太薄的阈值，等于持续付费买噪声。

→ [原文存档](https://www.lennysnewsletter.com/p/how-i-ai-how-to-write-ai-agent-loops)

## 相关实体

- [Claude Code Loop 官方分类：四种模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-loop-types-official-taxonomy-four-modes.md)
- [Codex /goal Agent Runtime](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md)
- [Claude Code Subagent 上下文卫生](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-subagents-context-hygiene.md)
- [Subagent 派生模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/subagent-spawning-pattern.md)

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

