---
title: "50 行 Codex 自我蒸馏 prompt 火了一周，真正值钱的是 5 行那条"
source_url: "https://mp.weixin.qq.com/s/1D3E6CHLMP1fjZgPevNrGg"
ingested: 2026-06-11
sha256: "739dba7614b1bc57fb023aa907421480c22de2bf7247b922bab0d2c57735c13b"
publish_time: "2026-06-11"
sources:
  - "[[entities/reverse-audit-prompt-paradigm-codex-5-line-version]]"
---

# 50 行 Codex 自我蒸馏 prompt 火了一周，真正值钱的是 5 行那条

> 原创 小黑 | AI Native 软件工程 | 2026年6月11日 09:30 | 新加坡

那条 prompt 在我朋友圈刷屏的第二天，我把它原样贴进了 Codex。

不是为了写文章，是真想看看它会给我建议什么。这条 prompt 的作者是 Vaibhav Srivastav，OpenAI Codex 团队成员，圈里习惯叫他 VB。他在 X 上挂出来之后，国内量子位一翻译，新浪、51CTO、CSDN、各种公众号一周之内全在转——核心叙事是「一条 prompt 让 Codex 把你过去 30 天的工作蒸馏成 skill / subagent / automation」。读起来非常诱人。

我那次实测的 Codex 回答得很认真。它列了一份候选清单：每周复盘可以做成 skill、PR 审查可以做成 skill、文档自动化可以做成 automation。每一条都给了证据描述，每一条都给了置信度评分。乍一看像那么回事。

然后我盯着那份清单看了大概 10 分钟，慢慢意识到一件让人有点不舒服的事——它列的那些东西，我已经有 skill 在做了。Codex 完全没有提到这些 skill 的存在，更没有提到「这些 skill 装了但是没生效」。它只是把我让它看的那 30 天里出现频率高的关键词，重新用 skill / subagent / automation 三种框架打包了一遍。

那一刻我知道问题不在 Codex，在我自己。准确说，问题在「复制粘贴 VB 那条 prompt」这个动作本身。

这不是一篇质疑 VB 的文章——他那条 prompt 在 OpenAI 内部的语境里是合理的、甚至是精妙的。这是一篇拆给跟我一样手里有一堆 skill 和 AGENTS.md 的人看的：为什么这条 prompt 复制粘贴到你的 repo 里会跑空，以及那个真正值钱的 5 行版本长什么样。

## 但你的 repo 不是 VB 的笔记本

问题在于，国内疯传这条 prompt 的开发者里，绝大多数人根本没在 VB 的语境里。

他们可能用的是 Claude Code、是 Cursor、是 Codex CLI、是任何一个 coding agent；他们的 repo 里可能有 AGENTS.md 也可能没有；可能装了 skill 也可能没装；可能在 producer 链路里写过回执也可能从来没有。这些前置全部不一致，但 prompt 是同一条。

复制粘贴下去，Codex 当然能给你回答——大模型不会拒绝任何看起来合理的 prompt。但它给你的那份「shortlist」会变成一种很微妙的东西：看起来在审计你，其实只是把你的关键词重新分类了一遍。这就是我第一次跑完看到那 10 分钟里发现的事。

### 三条前置缺失：VB 50 行 prompt 被拦截退化成关键词分类器

我把这种「跑空」的根因拆成了三条前置缺失。它们之间不是「装一条就好」，是缺一不可——任何一条缺失，这条 prompt 都会退化成关键词分类器。

**缺失 1：你的 AGENTS.md 没有 worker 边界**

AGENTS.md 是 agents.md 那个公开 spec 里定义的——agent 看你这个 repo 的「项目级说明」，地位类似给 agent 看的 README。Codex 在 repo 里发现这个文件会优先读它，作为后续所有任务的项目上下文前缀。

但「写了 AGENTS.md」和「AGENTS.md 里有 worker 边界」是两回事。

我见过一份很常见的 AGENTS.md，长这样：

```
# AGENTS.md

This project uses TypeScript and pnpm.
- Run `pnpm install` to set up.
- Run `pnpm test` to run tests.
- Follow the code style in eslint.config.js.
```

这是把 README 改了个名字。它告诉 agent「装什么、测什么、风格怎么写」，但没告诉 agent「这个 repo 里有哪些角色、谁负责什么、谁不该碰什么、做完一件事的产物长什么样」。

VB 那条 prompt 里有一行很容易被忽略的话：「skill: a reusable workflow or playbook」。playbook 这个词的潜台词是「同一个角色反复跑同一个流程」。如果你的 AGENTS.md 里压根没区分「这个 repo 有研究 worker、有评分 worker、有 reviewer」，Codex 在做蒸馏时就没有「角色」这个维度可以用。它能看到的只是「过去 30 天里发生过 47 次任务」，看不到「这 47 次任务里有 12 次本来应该 reviewer 介入但没介入」。

worker 边界的作用是给 agent 一个反向审计的坐标系。没有这个坐标系，prompt 跑出来的所谓「重复工作流」永远是任务表面的相似性——「都是写文档」「都是改测试」——而不是结构性的缺位。

**缺失 2：你的 skill description 没有触发词**

这是更隐蔽、也更普遍的一条。

OpenAI 官方的 Codex Skills 文档里有一段话我建议每个写 skill 的人都钉在 monitor 上：Codex 初始只会读 skill 的 name、description 和路径，不会读完整的 SKILL.md。它要等到运行时基于 description 判定「这个任务该不该用这个 skill」之后，才会去 load 完整内容。而且初始 skills 列表有上下文预算，模型上下文未知时约 8000 字符——skill 多了，description 会被压缩，部分 skill 甚至会被省略。

这意味着 skill 的触发完全押在 description 上。description 写得抽象、写得宽泛、没把用户真实会说的触发词前置——这个 skill 就是「装了但没用」。

举个我自己的例子。我之前写过一个 skill 叫 investment-research，description 是这样的：

```
name: investment-research
description: A skill for conducting investment research tasks.
```

这条 description 几乎不可能被 Codex 隐式调用——它太抽象、太宽泛、跟用户实际会说的话（「帮我看下机器人产业最近的玩家排名」「写一份具身智能行业研报网页」「按证据强度给这几家公司打分」）一个词都对不上。

正确的 description 应该长这样：

```
name: investment-research
description: |
  当用户要求生成产业研报、行业网页、公司榜单、证据评分、
  机器人/具身智能/AI 应用方向调研、React 投研驾驶舱、
  SQLite 证据账本、worker 并发研究、强证据厚内容报告时触发。
  不适用于：单个公司的财务三表分析、纯数据爬取任务。
```

这里有两个关键动作：把触发词前置（「产业研报」「公司榜单」「证据评分」是用户会真的说的话），写清不适用范围（让 Codex 知道边界，避免误触发）。

现在回过头看 VB 的 prompt：「extend existing instead of duplicating」。它假设你的 skill description 是健康的、Codex 能识别得出来「这个工作流已经有 skill 在做」。如果你 50% 的 skill 都长成「A skill for X tasks」这种废话 description，Codex 根本看不见这些 skill 的存在——它给你的「重复工作流候选」里，会出现一大堆你已经有 skill 在跑但 Codex 不知道的项目。

这就是为什么我第一次跑完看到那份清单时不舒服。Codex 给我推荐的「每周复盘 skill」「PR 审查 skill」我早就有了——只是它们的 description 写得太弱，Codex 隐式触发失败，所以 Codex 看不见它们，就当它们不存在地给我开了一份新候选。

**缺失 3：你的 producer 链路根本没在写历史回执**

最后一条最致命。

VB 那条 prompt 的整个证据基础是「Codex sessions、Memories、rollout summaries、Chronicle」。这些是 Codex 自己写的——你只要在用 Codex，它就会自动留下这些痕迹。所以在 VB 的语境里，「证据」是一个默认存在的东西。

但如果你不是纯 Codex 用户，而是一个有自己 producer 链路的人——你有 worker 系统、有 reviewer 系统、有 validator 系统、有 handoff 文件、有可点击回执——这些东西 Codex 一概看不见。它能看见的只有标准 Codex sessions 那一层。

更要命的是：很多人手里这套 producer 链路，自己根本没在写回执。

我说的回执不是「日志」，是结构化的、可被反向读出来的「这次跑了什么、产物是什么、validator 评分是多少、下一步应该做什么」。它通常长这样：

```
# 00_GPT 可点击回执.md

## TASK
机器人产业研报 V1.3 内容厚度修复

## STATUS
PARTIAL_SUCCESS - 5 个公司榜单已加证据，2 个图表未答业务问题

## ARTIFACTS
- ./outputs/robotics_2026_06_10/01_人类总览.html
- ./outputs/robotics_2026_06_10/03_证据索引.md
- ./outputs/robotics_2026_06_10/99_receipts/...

## VALIDATOR_SCORE
内容厚度：73 / 100  (target: ≥ 85)
证据完整度：88 / 100
图表问答率：62 / 100  (target: ≥ 80)  ← 主要缺口

## NEXT
1. 重做 P3 图（机器人 BOM 价格趋势）
2. 给 P5 表加置信度列
3. 跑 V1.4 跑分对比
```

只要这种回执在跑，反向审计就有抓手——Codex 看到 VALIDATOR_SCORE.图表问答率 = 62 这种字段，立刻能知道「这个 skill 在『图表是否回答业务问题』这件事上反复掉分，应该回去修 skill 的 validator」。

如果你的 producer 链路从来没在写这种东西，光有任务和产物，没有评分、没有 status、没有 next——Codex 就拿不到任何「这个 skill 没生效」「这个 worker 没跑通」的证据。它只能看到表面的「这件事发生过几次」，看不到「这件事每次都有同样的瑕疵」。

这条缺失最难补，因为它不是写一份 markdown 就完了——它要求你的整个执行链路从源头就在结构化地写。AGENTS.md 写好、skill description 写好，都是一次性投入；producer 链路写回执是每一次任务都要做的事。

## 真正值钱的不是 prompt，是「反向审计」这个视角

把三条缺失串起来，会浮现一个反共识但很朴素的判断。

VB 那条 50 行 prompt 的价值不在它的字数多、维度全、考虑细——这些都只是表面工艺。它真正值钱的是一个视角：让 agent 不去看「我现在该做什么」，而是去看「我过去做的事留下了什么痕迹，这些痕迹能不能反向告诉我我的能力包哪里漏了」。

这个视角在中文叫「反向审计」可能更贴切。它跟传统 prompt 工程的方向是反的——传统 prompt 工程是「我给你一段指令，你按指令产出」，反向审计是「你看着我过去的产物，告诉我我的指令系统哪里在漏水」。

为什么这是一种范式变化？因为传统 prompt 工程的有效性建立在「我对自己要什么很清楚」这个假设上。而当你的 agent 链路足够长——有 worker、有 skill、有 reviewer、有 validator——你就不再清楚自己每一层「应该要什么」了。这时候你需要的不是更强的 prompt，是一个能从自己历史里反向发现问题的 agent。

VB 那条 prompt 之所以在 OpenAI 圈子里能打，是因为他们已经在 Codex 内部把这个反向链路建好了——skills、sessions、memories、Chronicle、AGENTS.md，五件套都齐。中文圈复制 prompt 但没复制这套链路，自然跑空。

这件事让我想起两年前 chain-of-thought 刚火的时候。那段时间所有人都在 prompt 里塞「让我们一步一步思考」，但塞进去之后大多数任务并没有变得更准。当时业内的总结是：CoT 真正起作用的前提是模型已经具备相应的中间推理能力，prompt 只是把那个能力激活；模型里没有的东西，prompt 喊破喉咙也喊不出来。反向审计 prompt 是同一个道理——它激活的是你 repo 里已经存在的能力链路。链路不在，prompt 只能让 agent 凭空编一份看起来很像审计的清单。

但好消息是，反向审计这个视角本身不需要 50 行 prompt。它的核心只有三个问题。

## 5 行版本：把 50 行砍到只剩三个问题

下面这条 prompt 是我把 VB 那条 50 行版本反复砍出来的「最小骨架版」。它不能替代 VB 的版本完成「沉淀 skill / subagent / automation」这种重型动作，但它能替代 VB 的版本去做更基础也更有价值的一件事：反向审计你的能力链路漏在哪。

```
扫描我最近 30 次任务的产物、回执、validator 记录、handoff 文件。
回答三个问题：
1. 哪几个 skill 本应该被触发但没被触发？证据路径是什么？
2. 哪些产物明显「变薄」或「重复出问题」？根因是 skill 没生效、
   worker 没跑、还是 validator 没拦住？
3. 这些证据应该沉淀进 skill description、AGENTS.md、还是新
   validator？给出具体的 patch 文案，不要 generic 建议。
```

5 行。三个问题。三件具体动作。

把 5 行版本和 VB 50 行版本逐句对照，能看出很有意思的差别。

VB 那条 prompt 的前 1/3 是证据来源声明：让 Codex 知道去哪里看。在 VB 的语境下这很重要，因为 Codex 不知道你有 Chronicle，得明确告诉它「Chronicle 优先用于发现，重要细节回主系统确认」。在你自己的 repo 里，如果你只让 agent 看你能告诉它路径的几个文件夹，这部分根本不用写——你已经在 prompt 里直接指了。

VB 那条 prompt 的中间 1/3 是判断标准：什么样的工作流值得 package、什么样的不值得。这一段在 VB 的语境里有意义，因为他要让 Codex 自动决定要不要建 skill / subagent / automation——决定的边界必须写清楚。但反向审计场景里，「要不要建」是你看完报告后自己决定的事，不该让 agent 替你决定。所以这一段在 5 行版本里完全可以删掉。

VB 那条 prompt 的最后 1/3 是产出格式：先 shortlist、再创建高置信项、最后说明跳过和证据不足。这一段在 VB 的语境里是收口，但 5 行版本不需要——你要的不是「请你创建这些 skill」，而是「请你告诉我这些 skill 哪里漏了」。把「创建」这个动作交给人类，agent 只负责诊断，链路反而干净。

砍下来的结果就是：5 行版本保留了「反向审计」这个核心视角，砍掉了所有「Codex 自主沉淀」相关的指令。它不是 VB prompt 的简化版，它是另一个 prompt——一个专门解决「我手里有一堆 skill 但我不知道哪些在裸跑」这件事的 prompt。

## 50 行 VB 版 vs 5 行反向审计版能审计什么对比

| 维度 | VB 50 行版 | 5 行反向审计版 |
|------|------------|---------------|
| 主要目的 | 沉淀新 skill / subagent / automation | 诊断已有 skill / worker / validator 是否在跑 |
| 证据基础 | Codex sessions、Memories、Chronicle、已有 skill | 你自己 producer 链路的产物 / 回执 / validator 记录 |
| 输出形态 | shortlist + 自动创建高置信项 | 诊断报告 + 具体 patch 文案（不自动创建） |
| 需要前置 | Codex 自带历史齐全 | AGENTS.md 有 worker 边界 + 回执在写 |
| 适用对象 | OpenAI 内部用户 / 纯 Codex 用户 | 有自定义 worker / skill / producer 链路的人 |
| 致命缺陷 | 在前置不全的 repo 里会退化成关键词分类器 | 在没有回执链路的 repo 里跑不出任何有效结论 |

这张表里最关键的是最后一行。两个 prompt 的失败模式完全不同——VB 的失败模式是「看起来跑了，其实是凑数」，5 行版本的失败模式是「直接跑不出来，agent 会明确告诉你没有证据可看」。后者其实更友好，因为它主动暴露你的 producer 链路有问题，而不是用一份漂亮的清单帮你盖住。

## 这 5 行怎么用、用在哪个时刻、不能解决什么

这条 5 行 prompt 不是日常 prompt。它不是你早上打开 Codex 第一件事就跑的东西。它是一个复盘工具，用在三种特定时刻。

第一种时刻是当你发现产物质量在持续下滑但说不清为什么。这是最典型的场景。你的产物每一份单独看都还过得去，但放在一起看明显比上个月薄；validator 分数一直在 70 多分上下徘徊，没跌但也上不去；reviewer 提出来的问题翻来覆去就那几条。这时候跑一遍 5 行版本，它会把你「感觉哪里不对但说不清」的东西具象成「这两个 skill 的 description 触发风险评分是 80 和 75，下面是建议的 patch 文案」。

第二种时刻是当你刚装了一批新 skill 但不确定它们有没有真的在跑。这种场景下你不是想审计旧的，是想确认新的。让 agent 扫一遍最近 30 次任务，看新 skill 的实际触发率——如果你装了 5 个新 skill，结果最近 30 次任务里有 4 个新 skill 一次都没触发过，那不是 skill 不好，是 description 写错了。

第三种时刻是当你要给同事 / 客户做能力交付。你的 skill 系统要交到别人手里之前，自己跑一遍这个反向审计——把所有漏的洞补上，再交出去。这件事在 producer 链路里很关键，因为下家不会替你修 description，他们只会因为 skill 不触发而放弃使用。

但这 5 行 prompt 也有它不能解决的事，必须诚实摆出来。

它不能替你写新 skill。它能告诉你「这里缺一个评分 worker」，但它不会替你把那个 worker 真的写出来。这是一种诊断工具，不是生成工具。如果你期望「跑完这条 prompt 我就有 3 个新 skill 装好了」，你会失望。

它不能在没有回执的 repo 里跑出任何有效结论。这是它最大的硬约束。如果你 30 天的任务里只有 README 和 git log，没有任何 validator 评分、没有任何 status 字段、没有任何「这次哪里没做好」的标记，agent 能看到的最多就是 commit 信息——这跟 VB 的 50 行 prompt 跑空是一回事。

它也不能替代 reviewer。reviewer 是单任务的实时检查站，5 行版本是跨任务的事后诊断。两者解决的根本不是同一个问题。把这个 prompt 当 reviewer 用，会发现它给的判断永远比 reviewer 晚一拍——但当成「我的 reviewer 这套规则到底有没有覆盖到所有该覆盖的失败模式」的体检工具，刚好对。

还有一件事容易被忽略：这条 prompt 跑出来的 patch 文案必须经过人类筛一道再落到 repo 里。我自己跑完它之后，给我建议的 description patch 大概 60% 是能直接用的、30% 需要改 1-2 个词、10% 完全是 agent 自己脑补出来的触发词（我从来没说过这种话，但它觉得我会说）。这个比例可能跟你 repo 的状态有关，但人类筛一道是不能省的——不然你只是把一个不准的 description 换成另一个不准的 description。

## 从 prompt 工程到 agent 自评

写这篇的过程里我反复想到一件事。

过去两年里，prompt 工程的主流叙事是「prompt 写得越好，agent 越聪明」。我们花了大量时间在 prompt 里塞 few-shot、塞 chain-of-thought、塞 role-playing、塞 system prompt、塞各种各样的「让模型更会思考」的咒语。这套叙事在单轮交互里非常有效，但在 agent 链路真正长起来之后，它的边际收益快速衰减——更精巧的 prompt 不能补救一个没有 worker 边界的 AGENTS.md，也不能补救一个 description 写得稀烂的 skill 库，更不能从一个不写回执的 producer 链路里凭空读出问题。

agent 链路一旦长出来，你需要的不是更强的 prompt，是让 agent 看自己的能力。看它过去产出的痕迹、看它在哪些场景反复失败、看它有没有按你设计的 worker 角色分工跑。

## 从传统 prompt 工程到反向审计的范式转换

VB 那条 prompt 之所以在中文圈引起的反应跟它在 OpenAI 圈引起的反应不一样，本质上是这个范式转换还没传到我们这边。复制的是 prompt 的字面，没复制的是「agent 应该会反过来看自己」这个潜在假设。

5 行那条不是替代 VB 的 50 行，它是把那条 prompt 里真正值钱的视角剥出来——剥到只剩骨头，不带任何 OpenAI 内部假设。哪天你的 skill / AGENTS.md / 回执链路都齐了，VB 的 50 行才会真正发挥它该有的威力。在那之前，5 行就够用。

最后我倒不是说我已经把这件事彻底想透了。「agent 自评」这条路上还有不少没解决的问题——比如自评的频率应该多高、自评和 reviewer 怎么职责切割、agent 自评出来的 patch 文案要不要再过一层人类 review。近期可能会再写一两篇关于这些问题的笔记，但不挖系列坑，挖了我又得写五周。
