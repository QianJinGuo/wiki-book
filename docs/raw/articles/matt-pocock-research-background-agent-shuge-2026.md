---
source_url: "https://mp.weixin.qq.com/s/0_0W8LjXQgpcocGPnEWSXA"
source_author: "术哥无界"
source_title: "别再一对一盯着 Agent 了：Matt Pocock 的后台 research，主线程继续干活"
source_date: "2026-08-07"
source_publication: "微信公众号（术哥无界）"
ingested: "2026-08-07"
sha256: "c14c3f4dfcfee8113df5be3d81c0b2afd12d975bb18948a1b9daa22e7e9aa823"
---

# 别再一对一盯着 Agent 了：Matt Pocock 的后台 research，主线程继续干活

> 作者：术哥无界（2026 系列第 189 篇 / AI 编程最佳实战第 68 篇）

## 问题：一对一盯着是错误分配

大多数人的 Agent 用法是一对一盯着：问一句，等一句。让它读文档，你就干瞪眼；让它搭分支，你盯着进度条；它一卡住，你马上切过去救。结果是人成了 Agent 的附属品，Agent 反而成了你工作的主线程。

一套成熟的工作流里，Agent 可以拆成前台和后台：你写代码的时候，让另一个 Agent 去读文档；你评审的时候，让后台去跑验证。Matt Pocock 的 skills 仓库里，research、wayfinder、triage 这几个 skill 把这件事讲得比较清楚，给出了可执行的机制（GitHub star 约 16 万，截至 2026 年 7 月）。

## 连续案例：主线程和后台怎么并行

审查一个支付回调的重构 PR 时，发现对第三方支付回调 API 的边界行为有假设（回调最多重试 3 次、签名过期 5 分钟、重复通知幂等处理）。以前两条路：切出主线程自己翻文档（上下文切换代价），或记下疑点审完再查（PR 无法一次审完）。第三条路：拉起 research 后台 Agent，把问题丢给它，继续审 PR。

时间线：T0 主线程发现疑点 / 后台收到任务；T1 主线程继续审查状态机 / 后台拉取官方文档源码 spec；T2 主线程审完异常处理写 2 条 review 意见 / 后台写出带引用的 findings 文件落仓库；T3 主线程顺手改命名 / 后台在 ticket 留 context pointer；T4 主线程切回看 findings / 任务结束不占用主线程时间。

这就是 research skill 开头写明的语义：spin up a background agent, so you keep working while it reads——拉起一个后台 Agent，它读的时候你继续干活。

## research：后台 Agent 的铁律是追一手来源

skills/engineering/research/SKILL.md 全文只有 12 行，核心三条：

1. **只对一手来源（primary sources）调研**。官方文档、源码、spec、first-party API 算一手；二手转述不算。每条声明都要能回溯到拥有它的来源——follow every claim back to the source that owns it。官方文档收录了一条社区批评：five research subagents pointed at junk just gives you five confident wrong answers faster。skill 里没有 allowlist、没有 domain gate、没有 verification pass，门控问题从提出起就有人反对，官方至今没有正面回答。
2. **产物是单个 Markdown 文件，落到仓库里**。带引用的 Markdown 文件，保存到仓库已经保存这类笔记的位置，匹配现有惯例。
3. **后台语义决定了必须落盘**。你不在等它，查完不会立刻问；结果只在会话里，会话一结束知识就丢了。落盘不是锦上添花，是后台模式的必然要求——异步的本质：我不在等你的输出，所以你的输出必须能在我需要的时候被找到。

findings 文件结构：结论摘要（每条结论）+ 来源与证据（每条对应文档章节/源码行号）。research 喂养思考，但不替代思考——ask-matt 里原话是 the file it produces is something to take into the main flow at /grill-with-docs，产出的文件是拿进主流程供你追问的，不是替你拍板的。

## wayfinder：把工作明确分成 HITL 和 AFK

research 管单个后台 Agent 怎么干活；wayfinder 管更大的问题：一件大工作，哪些部分能交给 Agent 单独跑，哪些必须有你在场。skills/engineering/wayfinder/SKILL.md 把超过一个 session 能容纳的大工作画成一张 issue tracker 上的共享决策地图，一次解决一个 decision ticket。

每个 ticket 要么 HITL（human in the loop，和你一起做），要么 AFK（agent 单独驱动）：

- **Research 票（AFK）**：读文档、第三方 API、或本地知识库来浮现决策事实。由 /research 子代理解决，当需要工作目录之外的知识时使用。
- **Task 票（AFK 或 HITL）**：决策发生之前的机械前置工作，没有要决定/原型/调研的东西，但讨论被阻塞直到完成。做而不决定（does rather than decides）。
- **Grilling 票（HITL，默认）**：通过对话一次一个问题地澄清需求。
- **Prototype 票（HITL）**：通过做便宜、粗糙、具体的 artifact 提升讨论保真度。

划线逻辑：**凡是需要做决定的，HITL；凡是机械执行的，AFK**。wayfinder 说了一句很重的话：a grilling agent that answers its own questions has broken this——一个自己回答自己问题的 grilling agent，已经坏了。grilling 的意义就是你问、人来答，需求对齐发生在人和 Agent 的对话里；Agent 自己出题自己答，对齐就变成了自嗨。

## 后台和主线程的边界：认领、分支、指针、契约

四道边界机制，前三个在 wayfinder，第四个在 triage：

1. **claim，先认领再开工**。动手前先把 ticket assign 给自己，并发 session 会跳过它。配套 blocking 边：用 tracker 的 native dependency 可视化票间阻塞关系，frontier 一眼可见。防两个后台同时开工同一件事。
2. **throwaway 分支隔离**。/research 子代理在 throwaway research/<name> 分支上捕获 findings。主线程在 main 上干活，后台探索性改动不污染主分支。
3. **context pointer**。后台干完从 ticket 留一个 context pointer——指向 findings 文件在哪、分支叫什么。知识不散落在会话记忆里，而是挂在 ticket 上。
4. **ready-for-agent + agent brief**。triage skill 把 issue 移过一组状态角色，ready-for-agent 定义是 fully specified, ready for an AFK agent。AGENT-BRIEF.md 四条要点：Durability over precision（不引用文件路径/行号这种会过期的细节，写接口/类型/行为契约）、Behavioral not procedural（写系统应该做什么，不写怎么实现）、Complete acceptance criteria（每个验收标准独立可测）、Explicit scope boundaries（明确 out of scope）。

一句话：**用认领和 blocking 边防抢票，用分支防污染，用指针防丢失，用契约防跑偏**。

## 一张表判断：什么能丢后台，什么必须你在场

| 工作类型 | 归属 | 判断依据 |
|---------|------|---------|
| 读一手资料/文档/API/知识库 | AFK（research 票） | 事实收集，不需要拍板 |
| 搭临时分支/机械接入/跑验证 | AFK（task 票） | 前置工作，做而不决定 |
| 可独立验收的实现 | AFK（ready-for-agent） | agent brief 有完整验收标准 |
| 需求对齐/设计取舍 | HITL（grilling，默认） | 一问一答，Agent 不能替人回答 |
| prototype 评审 | HITL | 讨论保真度需要人在场 |
| merge 冲突解决 | HITL | 按 intent 回溯，需要人判断哪侧意图 |
| 外部访问/judgment call/手动测试 | HITL（ready-for-human） | 无法委派的原因要写在 note 里 |

补充：diagnosing-bugs skill 第三阶段要求生成 3-5 个可证伪假设并展示给用户再测，但明确写了 Don't block on it——proceed with your ranking if the user is AFK。提假设是机械的，选假设才是人该干的。

## 反例：后台 Agent 不是银弹

- **反例一：把 grilling 票丢给后台**。grilling 是 HITL 默认，需求对齐必须发生在人和 Agent 对话里。
- **反例二：后台 Agent 拿二手资料下结论**。primary sources 铁律不是装饰，skill 本身没有任何门控（allowlist/domain gate/verification pass 都没有），执行靠你给任务时把范围说清楚。
- **反例三：主线程和后台同时改同一批文件**。官方 wayfinder 文档收录过用户投诉：agent 在 wayfinder 会话中间开始写生产代码，往自己 Notes 里写了一句 this map carries execution，当成授权自己动手了。
- **反例四：research 结果没落盘**。后台语义决定了你不在等它，结果只在会话里等于不存在。

两个未解决的社区报告：research 嵌套 bug（GitHub issue #530，至今 open）——research 的 background agent 会再 spawn 一个 background agent，有人测到单个任务烧了约 45 万 tokens，三个 run 重叠；结果不复用——写一次就死的 research 文件只是花哨的搜索，没有任何东西自动加载过去的 research 文件。

建议：把它当成需要验收的临时同事，不是免检的自动化流水线。官方 running-your-afk-agent 文档建议：先用 HITL 跑——全程人盯着，观察它怎么选任务、怎么写测试、哪里 struggle，再逐步放手。

## 后台化和 handoff 不是一回事

handoff 是接力（串行），AFK 是并行。handoff skill 处理会话结束时的上下文交接：干到哪了、下一步是什么、踩过什么坑，写清楚交给下一个会话。research/AFK 是并行——同一时间点主线程和后台各干各的。两者都用写文件、留指针作为交接手段，但语义完全不同：handoff 的文件是给下一个会话的启动上下文，research 的文件是给当前会话主线程的参考资料。前者是接力棒，后者是路标。

## 总结

1. **判断准则**：做决定的活（grilling、prototype 评审、merge 冲突）必须你在场；做执行的活（读一手资料、搭分支、机械接入、跑验证）可以丢后台。
2. **落盘约定**：后台产物必须是带引用、落仓库、可回溯的文件，因为你不在等它，落盘就是它存在的方式。
3. **主线程边界**：用 claim 和 blocking 边防抢票、用 throwaway 分支防污染、用 context pointer 防丢失、用 agent brief 防跑偏。

这套机制的源码里，一半以上的篇幅都在防并发出问题，这本身就是对后台 Agent 最诚实的评价——它不是用来替代你的判断的，是用来把你的时间从机械劳动里解放出来的。

> 说明：本文基于 Matt Pocock skills 仓库源码（mattpocock/skills）和官方文档（aihero.dev）分析整理，属于源码与文档层面的机制解读，尚未在生产环境完成全场景验证。
