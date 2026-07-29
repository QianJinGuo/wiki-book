---
title: "Matt Pocock main flow：5 环节 3 反例，把 AI 拽回工程纪律"
source_url: "https://mp.weixin.qq.com/s/4C4-u7bEd9kFZMcO3KYzcQ"
author: 运维有术 / 术哥无界
platform: WeChat
ingested: 2026-07-29
slug: matt-pocock-main-flow-5-stages-3-antipatterns
sha256: 793e4610fda781f4b6ea34a55d1349603d28ffe95aa116af83fd6cb281445839
---

🚩 2026 年「术哥无界」系列实战文档 X 篇原创计划 第 180 篇，AI 编程最佳实战「2026」系列第 62 篇

大家好，欢迎来到 术哥无界 | ShugeX ｜ 运维有术。我是术哥，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的技术实践者与开源布道者！

Talk is cheap, let's explore。无界探索，有术而行。

## main flow 五环节全景

读完 Matt Pocock 的 skills 仓库源码，让人真正意外的其实是这五件事硬被按顺序串在了一起：/grill-with-docs → /to-spec → /to-tickets → /implement → /code-review。

ask-matt 的 SKILL.md 把它叫做 main flow——所有正经工程任务都应该走这条路。但这条链路上每一环真正在做什么、留下什么、什么时候算完成，并不是看 SKILL.md 标题就能猜到的。

源码和 README 把 to-spec 的核心约束直接写在了第一行：Do NOT interview the user — just synthesize what you already know。这一句决定了整个主链路的上下文管理逻辑。

这篇文章用一个连续案例（一个叫 多格式导出 的 feature）从左到右走完这五环。每一步都给出：这一步本身在做什么、留下什么文件或 ticket、什么时候算完成。再补一段 链接断在中间 反例和 一次会话只做哪一段 判断。

## 前提：setup-matt-pocock-skills

这套 skill 还有一个真正的前置 skill /setup-matt-pocock-skills——它配置 issue tracker、triage labels、domain docs 路径，后面的 to-spec / to-tickets 都假设这些已写好。跳过它直接用 to-spec / to-tickets 不会失败，但写出的产物格式不对。

## 1. main flow 解决的真问题：会话是一次性的，工程不是

理解 main flow 之前要先承认一个前提：session 是 disposable 的，但大块工作不是。Matt 在他自己的 dictionary-of-ai-coding 仓库里写过原话：A ticket should be completable before the session drifts out of the smart zone — and that constraint is testable.

也就是说，AI 编程的会话是会自己变笨的（ask-matt 写 ~120k tokens，dictionary-of-ai-coding 写 125k–150k，YouTube 视频里他提的是 140k——三处数字不一致）。所以 main flow 在做的远不止让 AI 更聪明——它的真正目标是把工程纪律物化成文件，让纪律穿越会话边界。

## 2. 五环节输入 / 产物 / 完成信号对照表

| 环节 | 入口触发 | 输入 | 产物 | 完成信号 | 失败症状 |
|------|---------|------|------|---------|---------|
| /grill-with-docs | 用户手动 | 想法 + codebase | CONTEXT.md + docs/adr/*.md + 精炼过的问题定义 | 每个分支决策解清，术语收敛 | 术语漂移、未澄清的假设进入下一环 |
| /to-spec | 用户手动 | 已被 grill 过的对话状态 | spec，发到 issue tracker，自动打 ready-for-agent 标签 | 所有 seams 与用户确认；spec 含 Problem/Solution/User Stories/Implementation/Testing/Out of Scope | spec 充满未验假设；用词不来自项目词表 |
| /to-tickets | 用户手动 | spec | 多个 tracer-bullet ticket，按 blocking edges 编号发布 | 任意无 blocker 的 ticket 可立即被领走 | ticket 横向分层；单 ticket 装多个 seam |
| /implement | 用户手动 | 单个 ticket（fresh context） | 通过 tdd 红绿的代码 + 测试 | tdd 红绿 + code-review 双轴通过 | 测了错的 seam；上下文污染；spec drift |
| /code-review | 用户手动（implement 末尾强制） | diff vs fixed point | Standards + Spec 两份独立报告 | 两轴分别判定后聚合 | 一轴掩盖另一轴；commit 时混进未经审查的代码 |

## 3. 贯穿案例：多格式导出 feature

产品：一个内部数据看板，原本只能导出 CSV。需求：要加 JSON、Parquet、Excel 三种导出格式。约束：导出要异步、支持取消、产物能直接给下游 ETL 消费。

## 4. 第一步：/grill-with-docs

源码里 grill-with-docs 的 SKILL.md 全长只有 7 行：Run a /grilling session, using the /domain-modeling skill。

它是一个包装 skill，本身不写代码，只产出三类工件：CONTEXT.md（项目共享词表）、docs/adr/*.md（关键决策记录）、精炼过的问题定义（哪些分支已经被问过、还剩哪些没问）。

主链路对它的硬性要求是：spec 之前必须已经被 grill 过一次。

## 5. 第二步：/to-spec——只综合，不访谈

核心约束：Do NOT interview the user — just synthesize what you already know.

这一句反直觉。大部分 spec 工具的核心动作就是问用户，但 to-spec 的工作方式是反向的：它假设上游已经做完了访谈，它只把已有共识压缩成 spec 模板。

为什么不做访谈、只综合？Matt 自己在 AIHero 的 9 Things People Get Wrong With /grill-me and /grill-with-docs 文章里直接解释过：By the time you finish grilling, you've made hundreds of tokens worth of choices about how your system should work. This is pure gold. Do not clear the context and start fresh just to write a PRD. That's throwing away all your design work.

spec 模板的关键字段：Problem Statement、Solution、User Stories（extremely extensive）、Implementation Decisions（模块边界而非文件路径）、Testing Decisions、Out of Scope、Further Notes。

to-spec 的第二条硬规则：Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

哪一类 ticket 必须重新走 spec：任何影响 contract（对外接口、状态机、状态枚举）的实现必须回 spec；只影响 writer 内部的可以写进 ticket。

## 6. 第三步：/to-tickets——tracer bullet 和 blocking edges

tracer bullet（贯穿弹）：Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests) — vertical, NOT a horizontal slice of one layer. A completed slice is demoable or verifiable on its own.

tracer bullet 解决的实际问题：AI 写代码典型的失败模式是一口气写完整个 feature 再说——outrunning your headlights。tracer bullet 强制 AI 每次只写一小段全栈走通，写一段就停，等反馈。

多格式导出 tracer bullet 切法：
- Ticket 1：schema 加 format 枚举 + API 接 format 参数 + UI 暴露下拉框 + 一个端到端测试跑通（用 fake writer）
- Ticket 2：实现 JSON writer（schema/API/UI 不动）
- Ticket 3：实现 Parquet writer（同样不动上层）
- Ticket 4：实现 Excel writer
- Ticket 5：cancel token 在异步导出里的端到端覆盖

blocking edges：A ticket with no blockers can start immediately。让无阻塞的 ticket 可以并发被领走——票图叶子节点可并行执行是 main flow 官方认可的扩展。

## 7. 第四步：/implement——三条隐含规则

/implement 的 SKILL.md 全长只有 15 行。三条隐含规则：

**规则 1：pre-agreed seams** — 测试只能在 spec 阶段就约定好的 seam 上做，不是 implement 阶段才决定。配套三个 anti-pattern：Implementation-coupled（mock 内部协作者）、Tautological（断言重算实现达到相同结果）、Horizontal slicing（先写所有测试再写实现）。

**规则 2：between each ticket clear context** — grill + spec + tickets 共享一个长会话，每个 implement 独立开新会话。Matt 原话：The smart zone is a budget, and unrelated work spends it.

**规则 3：closing out with code-review** — implement 末尾必须 review，不能写完直接 commit。无例外（除非无 contract 改动的纯内部重构可以走轻量 review）。

## 8. 第五步：/code-review——两轴并行

/code-review 的核心机制是把 diff 喂给两个并行子代理：
- **Standards 轴**：依据仓库文档化的编码标准 + Fowler smell baseline（12 个味道）
- **Spec 轴**：依据 origin issue / PRD / spec，检查三件事：spec 要求的实施是否缺失；实现是否超出 spec；看起来实施了但实现错了

为什么并行而不是串行？Standards 那轴判了一堆实现有 bug 的结论，会稀释 Spec 轴的发现——读者会下意识用"代码不行"去解释"spec 不一致"，把两个独立问题混在一起。

为什么不顺手在 implement 里做完？三方面原因：视角不同（implement 目标是完成 ticket，review 目标是评判 diff）、确认偏误（implement 的人偏好自己的实现）、防止上下文污染（implement 的上下文里装满了"为什么这么写"的合理性，这些理由在 review 时应该不存在）。

## 9. 三个反例

**反例 1：跳过 /to-spec，直接 /to-tickets** — to-tickets 没有 spec 可读，只能从对话里抽取任务——粒度完全取决于对话质量。写出的 ticket 缺 Implementation Decisions 字段，implement 的人不知道 seam 在哪。后续 code-review 的 Spec 轴判无可判——因为没有 spec。

**反例 2：跳过 /to-tickets，直接 /implement** — 一个大 ticket 装多个 seam。任何 tdd 失败都得回滚整片。一旦 context window 爆掉，handoff 不知道写到哪——因为没有 ticket 文件承载做到哪里了。

**反例 3：跳过 /code-review，implement 后直接 commit** — Standards 漂移 + Spec drift。implement 末尾强制 code-review 正是为了防止这种情况。

三个反例的共同模式：每个反例的本质都是把上一环的纪律扔掉，让下一环独自承担。main flow 没有一环是冗余的。

## 10. 一次会话只做哪一段

- grill-with-docs → to-spec → to-tickets：保持同一个会话，不要 /clear、不要 /compact
- **每个 /implement**：开新会话，只读 ticket 文件
- smart zone 边界：约 120k–150k tokens（三个来源数字不一致）
- 跨会话桥梁：/handoff（forks，开新会话）或 /compact（continues，同会话）

多格式导出例子的会话切分：
- 会话 1（长会话）：grill + spec + tickets，约 1-2 小时，80k-100k tokens
- 会话 2-6（短会话）：每个 implement 各自独立新会话
- 每个 implement 会话末尾：跑 /code-review

## 11. 三种规模下的判断

- **小改动**（修一行、删一个文件、调一个文案）：跳过 grill 和 spec，直接 implement + code-review
- **中型 feature**（多格式导出、一个新的 API endpoint）：走 5 环，但 spec 可以简化。tracer bullet 严格走；ticket 数量 3-5 张
- **大型 feature / greenfield**：走 5 环 + wayfinder + 多次 handoff

判断边界：如果改动不引入新 contract，可以走轻量 spec。如果改动影响多个模块，必须用 tracer bullet 切票。

## 12. 几个常被误用的点

1. grill = 写 spec：错。grill 是访谈，spec 是综合
2. to-spec 可以事后访谈补：错。如果 spec 阶段发现需要访谈，说明上游 grill 没做完
3. implement 内部可以顺手 review：错。两轴 review 的价值就在于独立判断
4. tracer bullet = 小步快跑：不完全对。tracer bullet 强调窄但完整穿过所有层，不是小
5. blocking edges 是项目管理工具：错。blocking edges 的目的是让无阻塞的 ticket 可以并发被领走

## 总结：main flow 的本质是文件即纪律

把这五环放到一起看，会发现一个共同特征：每一环都把当前思考物化成文件。grill → CONTEXT.md + ADR；spec → spec 文档发到 issue tracker；tickets → 编号的 ticket 文件，带 blocking edges；implement → 通过 tdd 红绿的代码；review → Standards + Spec 两份独立报告。

文件是 main flow 的真正产物。会话是一次性的（smart zone 会过期），但文件可以穿越会话。这就是为什么 main flow 强调每个 implement 一个新会话——下一个会话只需要读 ticket 文件就够了，根本不需要记住上一个会话的所有思考。

如果只记一句话：main flow 的设计不是让 AI 更聪明，是让工程纪律活在文件里，会话死了纪律还活着。这也是它和 vibe coding 工具之间一条清晰的分界线。
