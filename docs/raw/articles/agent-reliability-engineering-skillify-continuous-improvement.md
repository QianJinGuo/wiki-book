---
source_url: https://mp.weixin.qq.com/s/_ze38DAq2A3WW0E9XSrZVQ
url: https://mp.weixin.qq.com/s/_ze38DAq2A3WW0E9XSrZVQ
title: Agent 可靠性的工程解法：从 Skillify 看持续改进机制
author: Fighter
source: Fighter的世界
publish_date: 2026-04-26
ingested: 2026-05-19
sha256: f99d8cfa8d4427062e20c77b34d5116a4b90901c8b2ce25e773ef5892d08c1ab
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
type: article
tags: [agent, reliability, skillify, harness-engineering, testing, openclaw]
---
Agent 可靠性的工程解法：从 Skillify 看持续改进机制
原创 Fighter Fighter的世界
2026年4月26日 08:31 浙江
Views are my own.
Agent 会重复犯同样的错误。数据查询失败一次，两周后换个场景又失败。计算出错了，下次换个参数继续出错。你调 prompt、换更大的模型、写更详细的系统消息，但下一次失败总会来。这种情况在实际使用中屡见不鲜。
YC 总裁 Garry Tan 最近发了一篇文章"How to really stop your agents from making the same mistakes"，核心观点：每次失败都变成一个 skill，每个 skill 都有测试，让同样的错误结构上不可能再发生。他把这个方法叫 skillify：一套 10 步检查清单，从契约定义到确定性脚本、单元测试、集成测试、LLM eval、路由验证、可达性审计。这套方法系统性地将失败转化为永久约束。
真正能一直使用、越用效果越好的 Agent 并不多。背后的关键问题是什么？
一、两次失败的解剖
Garry Tan 的 OpenClaw 在一周内出了两次错。第一次是日历查询，第二次是时区计算。两次失败的表面原因不同，但底层机制相同。
失败 1：已经在数据库里的行程
用户问了一个 10 年前的商务旅行，简单问题，应该一秒钟就能回答。
Agent 的执行路径：
调用 live calendar API → 被拒（时间太久远）
尝试 email search → 结果嘈杂，没有结论
再次调用 calendar API，换了参数 → 仍然被拒
五分钟后，搜索本地知识库，瞬间找到
答案一直在本地。3,146 个日历文件，跨越 2013 到 2026 年，已经索引，已经本地化，一个 grep 就能搞定。Agent 就是没有先看那里。
用 Harness Engineering 的语言说，这是传感器失效——Agent 没有能力感知"本地已有数据"这个状态，因此无法做出正确决策。更深层的问题是工作分类错位：日历 grep 是确定性工作（deterministic work），同样的输入，同样的输出，每次都一样，不需要模型。但 Agent 在判断空间（latent space）里做了这件事，启动推理、发起 API 调用、解释结果，而一个三行脚本本可以在 100 毫秒内返回答案。
这是第一类错误：在错误的latent space里做了正确的事。
失败 2："28 分钟"
同一天，Agent 说："你的下一个会议在 28 分钟后。"
实际情况：88 分钟后。Agent 在脑子里做了 UTC 到 PT 的时区转换，差了整整一个小时。
问题是，一个脚本（context-now.mjs）已经存在，输出是这样的：
{
  "now": "2026-04-21T07:38:12-07:00",
  "upcomingEvents": [{
    "summary": "App Ops Sprint Planning",
    "minutesUntil": 88
  }]
}
50 毫秒，零歧义。Agent 就是没有运行它。
同样的形态：确定性工作（时间戳相减）在判断空间完成。模型在做心算，而脚本有答案。
两次失败的共同点：Agent 有现成的工具，却选择自己推理。该用脚本的地方用了模型。
在正常的 AI 设置中，Agent 会道歉、承诺做得更好，两周后同样的事情在不同的查询或不同的时区再次发生。Agent 没有对 bug 的记忆，没有对 bug 的测试，没有任何东西阻止它再次发生。
这是 vibes-based reliability 的本质：依赖 prompt、依赖更大的模型、依赖"请不要幻觉"的咒语。这些东西在对话变复杂的那一刻就会衰减。
二、Skillify：从失败到结构性修复的 10 步法
Garry Tan 的解法叫 skillify。具体怎么做？一套 10 步检查清单：
Step 1：SKILL.md——契约
Skill 是一个 markdown 文件，定义名称、触发条件、规则。对于日历查询失败，skill 是这样的：
name: calendar-recall
description: "Brain-first historical calendar lookup. ALWAYS use this before any live API for any event not in the future or the last 48 hours."
硬规则：
Live calendar APIs are ONLY for events in the FUTURE or the LAST 48 HOURS. Everything historical goes through the local knowledge base first.
Skill 不是告诉 Agent 做什么（用户提供 what），Skill 提供过程（process）。把它想象成方法调用：同样的过程，根据传入的内容产生完全不同的输出。
Step 2: Deterministic code——脚本
Agent 自己写确定性脚本。Skill 文件（markdown，存在于判断空间）告诉 Agent 如何修复问题。Agent 读取 skill，理解日历搜索是确定性工作，生成脚本来处理：
$ node scripts/calendar-recall.mjs search "Singapore"
Found 2 matching day(s):
── 2016-05-07 ──
Flight to Singapore, Mandarin Oriental check-in
── 2016-05-08 ──
Lunch with investors at Fullerton Hotel
100 毫秒以内（大部分是 Bun 启动时间，实际 grep 是亚毫秒级）。零 LLM 调用，零网络，只有本地文件。
这是整个架构工作的循环：判断空间构建确定性工具，然后确定性工具约束判断空间。Agent 用判断（latent）写了 calendar-recall.mjs，现在 skill 强制 Agent 运行那个脚本，而不是对日历数据进行推理。模型的智能创造了约束，约束反过来限制模型在不该推理的地方推理。
旧的失败路径变得不可达。Skill 说"先搜索本地"，脚本执行搜索，Agent 再也没有机会绕过这个流程。
Step 3：Unit tests——确定性函数的测试
经典的 vitest。确定性函数，确定性断言。calendar-recall.mjs 导出纯函数，如 parseEventLine、eventMatchesKeyword、searchKeyword、formatJson。每个函数都针对 fixture 数据进行测试：临时目录中的合成日历文件、已知输入、已知输出。
这类测试捕获的 bug：parseEventLine 在位置字段中有 Unicode 字符时静默丢弃事件；dateFromPath 对闰年日期返回 null；formatJson 在只有一个人时省略 attendees 数组。小的、无聊的、关键的 bug。如果脚本产生错误的输出，skill 产生错误的答案，Agent 自信地告诉用户错误的事情。
对于 context-now，单元测试验证时区格式化、安静时间检测、跨 DST 边界的 minutesUntil 计算。一个测试在 DST 转换前 3 分钟输入时间，验证输出不会跳 60 分钟。这正是导致"28 分钟"失败的 bug，现在结构上不可能发生。
Garry Tan 有 179 个单元测试，跨 5 个套件，运行时间不到 2 秒。
Step 4: Integration tests——真实数据的验证
这些测试命中真实端点和真实数据。calendar-recall.mjs 真的在真实的 brain repo 中找到事件了吗，而不仅是测试 fixture？当日历缓存过时或丢失时，context-now.mjs 是否产生有效的 JSON？集成测试捕获单元测试遗漏的 bug，因为 fixture 数据太干净了。真实数据有格式错误的事件行、缺少时区字段、带有 Windows 行尾的日历文件、跨越午夜的事件。
规则：如果你发现自己手动检查脚本是否在真实数据上做了正确的事情，那个检查应该是一个集成测试。
Step 5：LLM evals——判断质量的评估
有些输出需要判断来评估。"这个日历摘要有用吗？"不是脚本可以回答的 yes/no 问题。所以使用 LLM-as-judge：一个模型根据 rubric 评估另一个模型的输出。
对于 context-now，每天运行 35 个 eval。其中一个向 Agent 提供类似"嘿，我的航班在大约 45 分钟后起飞，我能赶到 SFO 吗？"的消息，并检查 Agent 是否在回答之前运行 context-now.mjs，或者尝试在脑子里做数学。如果 Agent 上钩并自己计算时间，eval 失败。
另一个 eval 给 Agent 一个 UTC 时间戳，问"这对我来说是什么时间？"正确的行为是运行脚本并引用结果。错误的行为是进行心算转换。Eval 捕获错误的答案和错误的过程，因为即使这次心算碰巧是对的，下次也会是错的。
Gary Tan 发现的最诚实的 eval 启发式：搜索你的对话历史，找到你说"fucking shit"或"wtf"的时候。那些是你缺少的测试用例。
Step 6: Resolver trigger——路由表
Resolver 是上下文的路由表：当任务类型 X 出现时，加载 skill Y。每个 skill 需要在 AGENTS.md 中有一个触发条目，这个文件教 Agent 存在哪些 skill 以及何时使用它们。
Resolver 触发器只是 markdown 表中的行：
Trigger Pattern | Skill | Priority
"historical calendar" | calendar-recall | high
"what time is" | context-now | high
这一步捕获的 bug：你写了一个新 skill，但忘记将它添加到 resolver。Skill 存在，能力存在，系统无法到达它。这就像有一个外科医生在职但没有在医院目录中列出他们。比根本没有 skill 更糟糕，因为你认为系统处理它。
Step 7: Resolver eval——路由验证
大多数人完全错过了这一层。Resolver 触发器说"这个短语应该路由到这个 skill"。Resolver eval 测试它实际上是否这样做。
Gary Tan 的 resolver eval 套件有 50 多个测试用例：
{ intent: 'check my signatures', expectedSkill: 'executive-assistant' },
{ intent: 'who is Pedro Franceschi', expectedSkill: 'brain-ops' },
{ intent: 'save this article', expectedSkill: 'idea-ingest' },
{ intent: 'what time is my meeting', expectedSkill: 'context-now' },
{ intent: 'find my 2016 trip', expectedSkill: 'calendar-recall' },
两种失败模式。
假阴性：skill 应该触发但没有触发，因为触发描述错误或缺失。
假阳性：错误的 skill 触发，因为两个触发器重叠。"明天我的日历上有什么"应该路由到 calendar-check，而不是 calendar-recall，也不是 google-calendar。三个 skill，三个不同的时间域，一个短语可以合理地匹配任何一个。Resolver eval 在用户遇到歧义之前捕获歧义。
Gary Tan 将这些 eval 作为确定性结构测试（AGENTS.md 表是否包含正确的映射？）和 LLM 路由测试（给定这个意图，模型是否实际选择了正确的 skill？）运行。两层都很重要。表可以是正确的，模型仍然可以路由错误，因为触发描述含糊不清。
Step 8: Check-resolvable + DRY audit——可达性与去重
一个月后构建后，Gary Tan 有 40 多个 skill。有些是为响应特定事件而创建的，其他的是由运行 cron 的子 Agent 生成的。没有人在维护 resolver 表。Skill 正在诞生但没有注册。
所以他构建了 check-resolvable。一个元测试，遍历整个链：AGENTS.md resolver → SKILL.md → script/cron。如果存在执行有用工作但没有从 resolver 路径的脚本，则无法到达。LLM 永远不会知道使用它。
第一次运行发现 40 多个 skill 中有 6 个无法到达。系统能力的 15% 是暗的。
一小时内修复。只是将触发条目添加到 AGENTS.md。现在 check-resolvable 作为 gbrain doctor 的一部分每周运行。它检查三件事：
每个带有 SKILL.md 的 skill 目录在 resolver 中都有相应的条目
Skill 引用的每个脚本实际上都是可调用的（文件存在，导出正确的函数）
没有两个 skill 具有会导致模糊路由的重叠触发描述
DRY audit 与它一起运行。如果你不小心，你最终会得到 15 个 skill，如果骰子落在哪里，它们会做同样的事情，resolver 会选择其中任何一个。对于 calendar-recall：
Skill | Time Domain | Data Source | Output Format
calendar-recall | Historical (>48h) | Local brain | Formatted text
calendar-check | Future + recent | Local brain | Structured JSON
google-calendar | Live events | Google API | Calendar objects
calendar-sync | Bidirectional | Both | Sync status
四个 skill 在同一个域中。零重叠。每个都有自己的 lane。
Step 9: E2E smoke test——端到端验证
完整的管道，端到端。
问 Agent"我什么时候去新加坡？"并验证它运行 calendar-recall.mjs，得到正确的答案，并正确格式化它
问"我的下一个会议是什么时候？"并验证它运行 context-now.mjs 而不是进行心算
Smoke test 是最后一道防线。前面所有环节都可以通过，但如果各部分之间没有正确衔接，系统仍然可以失败。Skill 可以是正确的，脚本可以是正确的，resolver 可以是正确的，Agent 仍然可以选择忽略所有这些并即兴发挥。Smoke test 捕获的就是这种情况。
Step 10: Brain filing rules——知识库组织
每个写入知识库的 skill 都需要知道东西去哪里。一个人进入 people/，一个公司进入 companies/，一个政策分析进入 civic/。Garry Tan 发现 13 个 brain-writing skill 中有 10 个归档到错误的目录，因为它们各自硬编码了自己的路径，而不是咨询 resolver。
Filing rules 文档记录了常见的错误归档模式。Sources vs originals。People vs companies（当某人就是一家公司时）。Skill 在创建任何页面之前读取规则。自那以后零错误归档。
三、Skillify 作为动词：从故障响应到日常工作流
Garry Tan 的检查清单最初是故障响应协议。然后它成为他构建一切的方式。
实际工作流是这样的：他用自然语言与 Agent 交谈，一起构建东西，试一下，有效，然后说一个词：
"hot damn it worked. can you remember this as a webhook skill and skillify it, next time we need to do some webhooks?"
那是一个 OAuth webhook 集成。花了一个小时调通。"skillify it"将临时会话变成了具有测试、resolver 条目和文档的持久 skill。下次需要 webhook 时，skill 已经在那里了。
类似的场景反复出现。容器需要无头浏览器而桌面需要有头浏览器——skillify it，Agent 写出 skills/browser/SKILL.md，包含决策树和测试。Agent 发 ngrok 链接但不检查链接是否可用——skillify it，加一条"发链接前必须 curl 验证"的规则。日历出现重复预订——skillify it，写一个确定性的冲突检测脚本。
做了几十次之后，这已经成了他和 OpenClaw 之间的固定协作模式。
模式总是相同的：在对话中原型，看到它工作，说"skillify"，原型变成永久基础设施。他不写规格，不提交 ticket。他与 Agent 交谈，他们一起解决问题，然后解决方案变成 Agent 可以永远使用而无需他的 skill。
人在指示 AI 说"那有效，现在让它永久"的那一刻，系统确切地知道"永久"意味着什么：SKILL.md、确定性代码、单元测试、集成测试、LLM eval、resolver 触发器、resolver eval、DRY audit、smoke test、brain filing。十步，一个词。
四、为什么这套方法有效：三个关键机制
机制 1: Latent 构建 Deterministic, Deterministic 约束 Latent
Agent 用判断写了 calendar-recall.mjs——模型读取 skill，理解日历搜索是确定性工作，生成处理它的脚本。然后 skill 强制 Agent 运行那个脚本，而不是对日历数据进行推理。
这是一个自举循环（bootstrapping loop）：模型的智能创造了约束，约束反过来限制模型在不该用智能的地方犯错。系统用自己的能力来限制自己的能力，但这种限制增加了可靠性。
机制 2：从"vibes-based"到"structurally impossible"
Skillify 将可靠性从"Agent 应该记住做这件事"转变为"Agent 结构上不可能不做这件事"。
Skill 说"先搜索本地"，脚本执行搜索，Agent 没有选择。这就是架构约束的力量。
这体现了 Harness Engineering 的核心悖论：约束越严格，自主权越大。通过将日历查询固化为确定性脚本，Agent 反而获得了更大的自由——它不再需要"思考"这个问题，可以将认知资源用在真正需要判断的地方。这和高速公路的护栏一样：正是因为有护栏，你才敢踩到 120 码。
机制 3：可验证性作为改进的前提
Jason Wei 曾经提过一个观点："改进系统的能力与你验证其输出的容易程度成正比。"
Skillify 的 10 步清单将"vague multi-step workflows"变成"structured data that we can log and grade"。每个 skill 都有单元测试（确定性验证）、集成测试（真实数据验证）、LLM eval（判断质量验证）、resolver eval（路由验证）、smoke test（端到端验证）。
这让 Agent 系统从"黑盒"变成"可观测、可调试、可优化"的工程系统。你知道什么有效，什么无效，为什么。然后你可以修复它，永久地。
五、Skillify 的三个关键权衡
Skillify 不是银弹。每个 skill 都是一个权衡，每个权衡都有代价。
权衡 1：灵活性 vs 确定性
每个 deterministic script 都在牺牲灵活性换取可靠性。什么时候应该保留 Agent 的判断空间？
Garry Tan 的选择：对于事务性任务（transactional tasks），完全确定化。对于创意性任务（creative tasks），提供框架但保留判断空间。关键是识别哪些工作需要智能，哪些工作需要精确。把需要精确的工作放在确定性脚本中，把需要智能的工作留给模型。
权衡 2：Skill 数量 vs 系统复杂度
40 个 skill 中有 6 个"暗技能"（unreachable）。这是 15% 的能力在黑暗中。
Skill 爆炸的临界点：什么时候应该重构而不是新增？DRY audit 的深层含义不是代码复用，而是认知负担管理。每个 skill 都是 Agent 需要理解的一个概念。太多 skill，Agent 开始混淆它们。太少 skill，每个 skill 变得太复杂。
OpenAI 的"garbage collection"机制提供了一个思路：后台定期运行清理 Agent，扫描文档与代码之间的不一致，扫描架构约束的违规。这不是一次性的清理，而是持续的熵减过程。
Skill 系统需要同样的机制。gbrain doctor 每周运行，检查 skill 的必要性、可达性、重叠。这是对抗熵增的必要实践。
权衡 3：Skill 的生命周期管理——对抗腐朽与过时
每个 skill 都是对当前模型能力边界的一个假设。这些假设有不同的过期速度。
Anthropic 在从 Sonnet 4.5 到 Opus 4.5 到 Opus 4.6 的演进中发现：context reset 先被淘汰，sprint 分解随后被淘汰，evaluator 仍然有价值。他们在 Opus 4.6 发布后做的事是逐一移除旧组件、测试质量是否真的下降，而不是继续叠加新组件。
Skill 腐朽有三种形态：
Context Rot 式腐朽：Skill 本身没变，但随着 Agent 运行时间拉长，执行质量