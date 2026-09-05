---
title: "Loop Engineering: The Anthropic Playbook — 设计替你提示 Agent 的系统（花叔橙皮书 v260615 conference 重排版）"
type: raw
source_url: "local PDF: ~/.hermes/cache/documents/doc_45de9630867c_Loop Engineering.pdf"
source_author: "HuaShu（花叔）Orange Book《Loop Engineering: Stop Asking Me What It Is》v260615 重排版"
source_date: 2026-06
ingested: 2026-07-31
sha256: 1f9a9fd1eee9f26d921463451ffb0874fac54da4db9960144c6b655faba38703
rating: 48
tags: [loop-engineering, anthropic-playbook, five-moves, six-parts, generator-evaluator, stripe-minions, verification-debt, comprehension-rot, cognitive-surrender, token-blowout, economics-of-judgment, maker-checker, worktree, skill, connector, memory, osmani, rajkumar]
---

# Loop Engineering: The Anthropic Playbook

## 摘要

Loop Engineering 是 2026 年 6 月由 Peter Steinberger（OpenClaw 作者，800 万浏览帖）、Boris Cherny（Anthropic Claude Code 负责人）、Addy Osmani（Google Chrome 工程师，6 月 7 日命名并成文）**独立同周**浮出水面、由 Osmani 定名的第四层工程范式。与 prompt/context/harness engineering 不同：前三者教人把活干得更好，loop engineering **把人从干活的位置上移除**——不再逐行喂 agent，而是设计一个自动给 agent 发词的系统。

核心主张：**loop 让 generation 几乎免费，judgment 成为稀缺资源；同一个 loop 由两个人构建会得到相反的结果**。一图总结：单轮 loop = 五 moves（discovery/handoff/verification/persistence/scheduling），由六 parts 实现；loop 的失败就是某个 move 被跳过；最难的是 verification——agent 给自己作业打分必然自夸。

## 四层栈

| 层 | 管什么 | 核心问题 |
|----|--------|---------|
| Prompt eng. | 写一条好 prompt | 该告诉模型什么 |
| Context eng. | 现在往窗口放什么 | 检索/总结/清除什么 |
| Harness eng. | 武装单次运行 | 哪些工具、动作、什么算 done |
| **Loop eng.** | **在 harness 上调度** | **如何让它一遍遍自己跑** |

Loop 位于 harness 上一层（"one floor above the harness"）：harness 武装单次运行，loop 让它反复自跑。三个动词区分 harness 与 loop：**runs on a timer**（到点自醒无需按键）、**spawns helpers**（派生子 agent，一个写一个拆）、**feeds itself**（自己的输出成为下轮输入，跨会话记忆）。

**失效半径递增**：同一 bug 在 prompt 层产生一次错误答案（人当场看见重写 prompt）；context 层产生自信的错误答案（人清 context）；harness 层产生一次文件编辑（运行结束 diff 可见，人审）；loop 层被写进 state 文件，第二天当既定事实读回，跨多轮被建立——**错误的代价 = 它存活到被人发现的轮数；loop 按构造就是最大化轮数的机器**。这是 loop engineering 最重要的直觉。

## 五 moves（单轮）与六 parts（构成）

**Five moves**：Discovery（找这轮该做的活，agent 自己找而非被人递清单；触发 skill 而非 cron 里贴指令墙——discovery 设定了整个 loop 质量天花板）→ Handoff（把任务交到干活 agent 手里，每 finding 一个隔离 worktree）→ Verification（换另一个 agent 说"不"；最容易偷工也最不能省；"没有真检查的 loop 只是 agent 对自己点头"）→ Persistence（结果落到对话之外：PR/ticket/inbox/state 文件）→ Scheduling（让一轮变成 loop，state 文件把未完成的事带到下一天）。

**Six parts** 对应五 moves：Automations（定时/触发，触发**具名 skill**而非指令墙；local 需机器常开 vs cloud 关机也能跑）→ Worktrees（git 隔离目录，并行 agent 不互相踩脚）→ Skills（SKILL.md 固化项目知识，偿还 **intent debt**——反复解释"这是什么项目、规则如何、坑在哪"的成本）→ Connectors（MCP 接口接外部系统，决定 loop 的视野半径）→ Sub-agents（写者与判官分离）→ Memory（磁盘上的持久状态；"agent 会忘，repo 不会"）。

## Generator 与 Evaluator

**它总是自夸**：让 agent 评价自己刚产出的东西，它会自信地夸，哪怕人一眼看出平庸（Anthropic 工程师 Prithvi Rajasekaran 在构建长期应用时观察到）。这不是智商问题，是给自己作业打分的问题——上下文里塞满了当初为何这样写的自我说服链，它看到的不是结果而是那条链。在 loop 里缺陷被放大：每轮对自己点头，跑得越久离真实质量越远。

**调一个怀疑者，而不是修一个谦虚的作者**：让 generator 更自省效果很差；调一个独立 evaluator 变得怀疑，远比让 generator 批判自己的作品可行。差异是结构性的：无法让作者跳出自己的视角，但可以换一个带着完全不同指令、从零看代码、不带任何自我说服的 agent。思想借自 GAN——一个网络生成、一个挑错，移植为 generator 写、evaluator 审。

**Evaluator 要行动，不能只读**：只读代码的 evaluator 判断的是"看起来对不对"而非"跑起来对不对"。前端任务中 Rajasekaran 把 evaluator 接到 Playwright MCP——打开页面、点按钮、截图、查 DOM，像 QA 工程师一样。判断基础从"这个 JSX 看起来没问题"变成"我点了按钮、页面跳转了、这是截图"。换底层模型也有帮助（同模型换指令常保留盲区）。社区常见校准：**假设代码是坏的直到证明不是——默认姿态是怀疑不是信任**。

**产品化：/goal 停止条件**（maker–checker 原则）：Claude Code 的 /goal 让 agent 跑到条件满足为止；每轮后由**一个新的小模型**检查条件是否成立，不成立就再跑一轮而非交回控制权。完成由新模型判定，不是干活那个。这是银行业几十年的 maker–checker 原则（录入大额转账的人与复核的人必须不同）应用到停止条件。Codex 通过 automations+agent 配置达到同样能力；不要把 /goal 与 /loop 混淆（/loop 只是定时重跑）。

**loop 的地板是 evaluator**：generator 的水平决定 loop 能产出什么，evaluator 的水平决定它不会产出什么。结构上分离生成与判断、把 evaluator 调成怀疑者、让它通过行动验证、把最终决定权交给新模型——这四步是培养 loop"说不"能力的全部。

## 五种失败方式（每个对应一个 move 被跳过）

| 失败 | 跳过的 move | 症状 | 修复 |
|------|------------|------|------|
| **Nodding Loop**（点头循环） | verification | 数百轮从未对自己说过"不"——真实负载下统计不可能，证明没有真检查 | generator/evaluator 分离 |
| **Amnesiac Loop**（失忆循环） | persistence | 结果只活在被 flush 的上下文窗口，每天从同一起点开始，无累积进展 | 磁盘 state 文件 |
| **Manual Loop**（手动循环） | scheduling | 四步都好但没自动化，演示那天跑过一次就再没跑过 | 真 trigger（timer/event） |
| **Blind Loop**（盲目循环） | discovery | 人每天还要亲手递活（"修这三个 bug"），自动化了做但没自动化找 | 把 discovery 教成 skill |
| **Tangled Loop**（缠结循环） | handoff | 并行 agent 改同一工作目录，合并成一团乱麻；只在并行下暴露 | 每任务一个隔离 worktree |

实际中它们成群出现：纪律差的 loop 通常只装 discovery+handoff（两个产生产出可见的 move），跳过三个产生安全的 move。

## 三个真实运行的 loop

1. **一个工程师的早晨**（Osmani triage）：早晨自动化自启，triage skill 读昨天失败的 CI/未关 issue/近期 commit 写入 markdown/Linear；每个值得做的 finding 开隔离 worktree，一个子 agent 起草修复、第二个按项目 skills/tests 审查；connector 自动开 PR 更新 ticket；搞不定的进 inbox 等人；state 文件让次日接续。一个 loop 就替换了一个人的早晨杂活。

2. **Stripe's Minions：每周 1300+ 个 PR**（Stripe 工程师 Steve Kaliski，How I AI 播客）：触发极轻——Slack @bot 或 emoji 反应。可靠性来自模型醒来前的"拉伸"：**确定性 orchestrator 先组装上下文**（扫描链接、拉 Jira、找文档、Sourcegraph+MCP 定位代码）——让 LLM 自己找上下文是最不可控的部分，所以把规则可硬编码的活从模型手里拿走；**一切确定性逻辑能解决的绝不进概率模型**——这条线画在哪决定 loop 是否可靠。最反直觉的一点：Minions 不是建立在更强的模型上，它是开源工具 Goose 的 fork，**核心主张是可靠性来自约束的质量而非模型的尺寸**。架构把确定性 gate（蓝色）与创意 LLM 步骤（绿色）交错：agent 写码 → 硬编码 pipeline 跑 linter 且 agent 无法跳过 → agent 修 lint → 硬编码步骤跑 commit。沙箱是 EC2 上的 Devbox，"cattle not pets"，1000+ agent 同时跑互不踩脚。**那 1300 个 PR 仍由人审——人没离开，只是换了桌子，从写变成审**。

3. 调度选项对比：Cloud（1h 最小间隔、机器可关、看不到本地文件）vs Desktop（1min、需机器开）vs /loop（1min、需会话开着）。本地重跑="我在时多跑几轮"，云端调度="我不在也能跑"——混淆两者是"关盖后 loop 静默停止"失望的来源。成熟 loop 常常两者都用：本地跑紧内层检查，云端跑夜间扫描。

## 四种隐性成本（互相强化）

1. **Verification debt（验证债）**：每个 PR 省下的时间变成未验证输出等待偿还；藏在测试没覆盖的"能跑"与"正确"之间的缝隙，直到某个发布早晨一起爆掉。防护：独立 evaluator。
2. **Comprehension rot（理解腐化）**：loop 越快速产出你没写的代码，存在与理解之间的鸿沟越大；代码库增长而脑中地图停滞，无声直到 bug 钻进没读过的角落。防护：定期读 sample 并强迫自己解释几处改动——无法解释就是地图需要更新。
3. **Cognitive surrender（认知投降）**：loop 自跑时人停止持有意见，只接过它递回的东西；"不是没时间，是不想费神"。防护：一行原则——loop 能执行，但不能决定；人至少要保持能说"这是错的"。
4. **Token blowout（token 爆炸）**：唯一直接打账单的成本；loop 孵 helper、重试、一轮轮跑，一个 bug 能空转整夜产生陌生账单。防护：上线前设硬上限——per-run 预算、每日预算、最大重试。

四者共用同一种沉默：loop 运行时没有警报。**最迷人的是让一个人干一个团队的活；最危险的是同一个点——团队会互相争论，一个人加一堆 loop 轻易变成无人争论的回音室**。

**复利实例**：一夜开 20 个 PR 全绿测试——表面胜利。3 个藏了测试覆盖不到的 subtle error → 无独立 evaluator 三个就合并（验证债）；人没读就合并了 20 个 PR，心智模型落后 20 个变更（理解腐化）；loop 太顺，人第二天早上整批不看了（认知投降）；helper+重试跑一夜，账单三倍（token 爆炸）。三个隐藏错误坐在人不再完全理解的代码库里，被一个已停止看的人守着，直到某天变成生产事故。四种成本不是一个独立风险清单，而是一个失败的四个面孔，互相喂养。

## 判断经济学

**变得充裕的**：loop 让代码、计划、修复、PR 充裕——一个工程师加一个构建良好的 loop 能产出小团队的输出；打字/样板/机械重构的成本坍缩向零。

**保持稀缺的**：决定保留充裕输出中的哪一个。loop 能生成一百个候选实现，但不能告诉你哪个对，只能说哪个"看起来合理"——"看起来合理"与"真的对"之间的缝隙正是工程所在。generation 趋近免费时，工程师的全部价值浓缩进这条缝：纯判断，不再被机械劳动稀释。

**放大器双向切割**：loop 忠实放大带来的一切——带来理解就放大理解，带来懒惰就放大懒惰。判断失误也被放大：旧世界一个坏决策成本是一段手写错误代码，爆炸半径有限且慢到能抓住；新世界一个坏决策被机器忠实批量执行一百次，而且**没有慢档**——不能再指望过程慢到中途发现错误。这抬高了 loop 唯一做不到之事（判断）的赌注。

## 操作纪律（三条）

1. **永远读样本**：不读 loop 产出的全部（那就违背了目的），每天读有代表性的样本，强迫自己解释每个抽样变更做了什么、为什么这样做——无法解释就是心智地图落后的精确信号。
2. **上线前设上限**：第一次无人值守运行前设硬上限（per-run/daily/max retries），不是等第一张惊人账单后。上限主要不是省钱，是把开放式风险转成有界风险的**断路器**。"没有上限的 loop 是把支出权委托给了自己的 bug。"
3. **留一扇开着的门**：在 loop 里至少建一个为人暂停的 checkpoint——不是人总会介入，而是暂停的存在让人保持在"能够介入"的位置。"把每扇门焊死、赌上永远不需要进去的工程师，会在必须进入那天发现自己不再持有钥匙。"

## 构建第一个 loop（6 步清单）

1. 跑一个 `/loop`（v2.1.72+）：`/loop 5m check the deploy`
2. 读 CI 和 issues，先做 triage：discovery 逻辑进 skill 而非 schedule（morning-triage SKILL.md：READ CI失败/24h issues/近期 commits；JUDGE 是否值得做；OUTPUT 写 ./state/triage.md）
3. 加 state 文件：结果不留在聊天窗口，写 markdown（或 Linear board）
4. 加 evaluator：`/goal all tests in test/auth pass and the lint step is clean`（v2.1.139+，不同模型判定）
5. 加 worktrees 并行：`claude --worktree fix/auth-test "draft the fix"`
6. 完整示例：GitHub Actions cron `'0 6 * * *'` → `claude --skill morning-triage` → skill 写并提交 state/triage.md → 逐 finding `claude --worktree --goal "tests pass and lint is clean"` → /goal 新模型判定 + 第二 reviewer 挑刺 → **PR 永不自动合并** + 不确定的进 ./inbox/

前两项决定 loop 能不能跑，后四项决定跑起来后会不会惹麻烦。新手最常见的产物：只装了前两项，结果是一个没人看、没人能停、对自己点头的 loop。

**安全增长顺序**：先增加 loop 发现什么（discovery），再增加并行做多少（parallelism）——先证明 evaluator 能抓住真实错误，再信任它去 gate 多个 agent。Stripe 案例是这条路的终点不是入口：可靠性来自多年硬化确定性 gate，不是从大规模开始。**loop 通过先展示它能停住一个坏 agent，来赢得跑更多 agent 的权利**。

## 核心结论

- 一句话带走：**别再给 agent 写提示词，去设计那个给它写提示词的系统——但要像打算继续当工程师的人那样设计，而不是那个只会按 Go 的人**。
- loop 是最忠实的一代工具：忠实放大构建者。放大倍数与喂进去的判断等值。
- 四条现场笔记：①存活的是赢得信任的小 loop，不是要求信任的野心 loop；②工程努力应放在 evaluator——强 generator 配弱判官产出自信的垃圾，平庸 generator 配敏锐判官产出慢而可靠的进步，复利的是后者；③人工审查点不是被信任后要拆除的临时脚手架，是保持 loop 可信的永久特性，拆除那天就是理解腐化正式开始那天；④预算上限要按"肯定会有东西空转一夜"来设，因为终归会有——上限是日志里的好奇与发票上的条目之间的区别。
- 参考：Osmani《Loop Engineering》(2026-06)、Steinberger 帖子、Cherny 言论、Rajasekaran《Building long-running agentic applications》(Anthropic engineering blog)、Kaliski《Stripe's Minions》(How I AI podcast)、MCP spec、Goose、Claude Code docs、HuaShu Orange Books v260615
