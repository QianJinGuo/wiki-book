---
title: Claude Code 之父最新访谈：编程已经结束、harness 将消失，Claude Code 将只有 100 行代码，loop 才是未来
source_url: https://mp.weixin.qq.com/s/OUc02wmVtH9RQMhYhZGIdg
publish_date: 2026-05-14
tags: [wechat, article, claude, agent, harness, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 5bad529d29c80cacfdd76738ba896a99156728a5c5abce5c669b3f49118bebfd
---
# Claude Code 之父最新访谈：编程已经结束、harness 将消失，Claude Code 将只有 100 行代码，loop 才是未来
一个人，一天提交 150 个 PR，全部用手机完成，一行代码都没亲手写。
Sequoia AI Ascent 2026
这个人叫 Boris Cherny，Claude Code 的创造者。上周他受邀参加了 Sequoia Capital（红杉资本） 的 AI Ascent 2026 大会，和 Sequoia 合伙人 Lauren Reeder 进行了一场 25 分钟的对谈。
访谈的主线是 Claude Code 和编程的未来，内容见图：
Claude Code 进化史  2024  2026 →  if model.think()  async fn deploy()  git push origin main  claude --loop  2024 年底  2025.5  2025.10  2026 现在  tab tab tab  AI 编程 = Tab 补全  Anthropic Labs 成立  harness  4  Opus  指数增长开始  Opus 4 发布  缩小中  0 行手写  fn()  100% AI 写代码  Boris 不再手写一行代码  harness 缩小  150 PR/天  /loop  未来预测  100 行代码  手机就是工位  设计师  产品经理  财务  10%  →  70%  按住，查看 Claude Code 和编程的未来 →
他聊了 Claude Code 的诞生故事，聊了自己如何用手机同时操控数百个 Agent 干活，聊了为什么 loop 才是 AI 编程的未来形态，也预测了 Claude Code 本身未来可能只剩 100 行代码。
信息量不小，值得一看。
01
##  关于 Boris
Boris Cherny 的履历，可以说是相当硬核。
他出生在乌克兰，1995 年随家人移民到美国。他的祖父是苏联时期的程序员，家里曾经堆满了打孔卡片，算是很有家学渊源了。
Boris Cherny
但 Boris 自己学的并非计算机，他在加州大学圣地亚哥分校（UCSD）读的是经济学，编程完全是自学的。18 岁就开始创业，后来成了一家 YC 公司的第一号员工，在对冲基金、广告技术、各种创业公司之间摸爬滚打了好几年。
2017 年，他进入了 Meta（当时还叫 Facebook），从中级工程师（IC4）一路升到了首席工程师（IC8）。IC8 在 Meta 是什么概念呢？全公司大概就几十个人能到这个级别，相当于技术序列的天花板了。
在 Meta 期间，他负责过 Instagram 的 Python 到 Hack 迁移，负责过 Meta 全线产品（Instagram、Facebook、WhatsApp、Messenger）的代码质量。他还曾在日本奈良远程工作了一年半，期间代码产出达到了全公司前 1%。
Programming TypeScript
工作之余，他还写了本 O'Reilly 的书《Programming TypeScript》，创建了旧金山 TypeScript Meetup（据说是全球最大的）。
他还做了个叫 Undux 的 React 状态管理库，一度成了 Facebook 内部最流行的状态管理框架。
还有个冷知识是：他中学时写过一本 TI-83 计算器的 BASIC 编程教程，现在居然……还挂在互联网上。访谈中他自己提到了这事，说「非常尴尬，请不要去搜」。
（当然，大家听完肯定都去搜了。）
2024 年 9 月，Boris 加入了 Anthropic 内部一个叫 Anthropic Labs 的孵化团队。这个团队人不多，但产出惊人，Claude Code、MCP、Claude Desktop 桌面应用，全是这几个人的作品。
02
##  「意外」的产品
Boris 说，Claude Code 的诞生多少有些偶然。
2024 年底他加入 Anthropic Labs 时，AI 编程的主流形态还是「tab 补全」，也就是你在 IDE 里写代码，模型帮你补全一行。Sonnet 3.5 第一次让这种体验变得可用。
但 Boris 团队觉得，模型的能力远不止于此。
> “  我们感觉有一个巨大的「产品溢出」，模型能做到的事情，远远超出了当时任何产品所能承载的。
于是他开始做一个让 Agent 直接写所有代码的工具。
** 但前 6 个月……这玩意儿基本不好用。  **
Boris 回忆说，刚发布的时候 Claude Code 并没有爆火，用户不少，但增长平平。真正的拐点出现在 2025 年 5 月 Opus 4 发布的时候，指数级增长就此开始，之后每次模型升级（4.5、4.6、4.7）都会再拉一波。
> “  我们一直在为「下一代模型」做产品。我们知道当前版本不会有 PMF（产品市场匹配），因为我们建的是为未来 6 个月的模型准备的东西。
为未来的模型而建
这种「超前建设」的策略，最后被证明赌对了。
03
##  「编程已经解决了」
访谈中 Lauren 提到，Boris 曾公开说过「编程已经解决了（coding is solved）」。这话听着很大，但 Boris 自己的使用场景里，确实能支撑起这个判断。
他先做了个现场调查：在场的人里，有多少是 100% 手写代码的？几乎没有。100% 用 Agent 写的？也不多。大部分人举手说自己在中间位置。
Boris 笑了：「所以大概 50% 解决了。」
但对他自己而言，这个数字是 100%。
Claude Code 的代码库用的是 TypeScript 和 React（他说没什么秘密，源码泄露过大家都知道了）。之所以选这两个技术栈，是因为当时模型对 TypeScript 和 React 的训练数据最多，写起来最准确。
Claude Code 的 CLAUDE.md 配置
> “  从 2025 年 10 月、11 月开始，模型就已经能写 100% 的代码了。到了 2026 年，我一行代码都没亲手写过。
** 一天几十个 PR 是常态，上周有一天他提了 150 个 PR，刷了个人纪录。  **
他也承认，这并非所有人的现实。大型复杂代码库、冷门语言，模型还搞不太定。「但通常答案就是，等下一个模型。」
04
##  手机就是工位
oris 还讲述自己现在的工作方式。
他大概半年前在 X 上分享过自己的开发环境设置，当时他都没意识到这会让人觉得震惊，「那就是我正常写代码的方式」。
Boris 的 5 个并行 Claude Code 会话
但现在，他的工作方式又变了。
** 他主要用手机工作了。  **
他当场掏出手机给台下观众看：打开 Claude App，左侧有一个 Code 标签页，里面同时跑着 5 到 10 个会话。每个会话下面又挂着一堆子 Agent，加起来大概有几百个 Agent 在同时运行。
Claude Code 网页端的多任务界面
到了晚上，他会让几千个 Agent 跑更深层的任务。
Lauren 问他：「几千个？」
他很淡定：「对……几千个。」
05
##  Loop 才是未来
Boris 说，他最近用得最多的功能，是  ` /loop  ` 。
这个功能的原理其实非常简单：让 Claude 用 cron 调度一个定时任务，可以设置每分钟、每 5 分钟、每天执行一次。
他现在同时跑着几十个 loop：
•  一个负责「看护」他的 PR：自动修 CI、自动 rebase
•  一个负责保持 CI 健康：有 flaky test 就自动修
•  一个每 30 分钟从 X 上抓用户反馈，然后聚类整理
> “  我觉得 loop 就是未来。如果你还没试过，强烈推荐。
Loop 在后台替你干活
他还提到了 Routines，就是服务器端的 loop。即使你关掉笔记本，任务也会继续跑。
而更妙的是，4.7 模型已经开始自发使用 loop 了。
Boris 举了个例子：他让 Claude 拉一个数据查询，Claude 发现数据在随时间变化，就主动说「我注意到数据在变，我会每 30 分钟给你发一份报告」。
Boris 回了句「能发到 Slack 上吗？」
Claude 就自己调了 Slack 的 MCP 来推送。
** 这种「不需要用户教模型怎么用工具」的状态，在他看来才是对的。  **
06
##  人人都写代码
谈到团队的未来形态，Boris 的判断是：会出现越来越多的  ** 跨学科通才  ** 。
不只是「全栈工程师」那种意义上的通才（做 iOS 也做后端），而是跨越工程、设计、产品、数据科学边界的通才。
他说 Claude Code 团队已经在这样运作：工程经理写代码，产品经理写代码，设计师写代码，数据科学家写代码，用户研究员写代码，连财务的同事都在写代码。
** 团队里每一个人都在写代码。  **
> “  他们各自的专业领域没有变，但现在所有人都多了一项能力：编程。
07
##  SaaS 会怎样
Lauren 问了个大家都关心的问题：AI 让写代码便宜了 10 倍甚至 100 倍，那 SaaS 产品本身还有价值吗？
Boris 引用了 Hamilton Helmer 的「七力模型」（Seven Powers，《Acquired》播客经常提到的商业分析框架）。
他认为 AI 时代下，有些护城河会变弱：
** 切换成本  ** 在下降，因为你可以让模型帮你从一个产品迁移到另一个。
** 流程能力  ** 也在弱化，因为 Claude 现在非常擅长理解和优化流程，尤其 4.7 模型可以「爬山算法」式地反复迭代直到完成。
但另一些护城河依然坚固：  ** 网络效应、规模经济、独占资源  ** ，这些并没有因 AI 而改变。
AI 时代的护城河
** 而他同时觉得，未来 10 年会涌现出 10 倍数量的创业公司来颠覆现有格局。  **
因为一个小团队现在可以做出大公司量级的产品，而大公司要改造流程、重新培训员工、克服内部阻力，这些都是小团队没有的包袱。
08
##  印刷术类比
有观众问 Boris：AI 编程会不会变成像用 Microsoft Office 一样的基础技能？
Boris 的回答更激进：「不止是 Office……应该像发短信一样简单。」
然后他抛出了一个类比。
** 1400 年代的欧洲，印刷术发明之前，只有 10% 的人识字。  **
这些识字的人往往受雇于不识字的国王和领主，专门负责读和写。
印刷术发明后，50 年内欧洲出版的文献总量，超过了此前一千年的总和。同期，书本的成本下降了 100 倍。
又过了几百年，全球识字率从 10% 升到了 70%。现在我们都会读写，不需要「阅读学位」，但依然有职业作家。
历史在重演
> “  我觉得软件也会经历同样的事情，而且速度会比 50 年快得多。软件将会被完全民主化，任何人都能做。
>
> 写会计软件最好的人，也许今天就已经不再是工程师了，而应该是一个真正懂会计的人。因为编程是容易的部分，懂领域才是难的部分。
09
##  Anthropic 内部
还有人问，Anthropic 内部在工程实践上比外面领先多少？一个月？三个月？
Boris 说，在模型层面其实没有差距，他们用的模型和外部一样（主要是 Opus 4.7，偶尔试试内部的 Mythos）。
** 差距在组织和流程上。  **
Anthropic 内部现在已经没有手写代码了。所有 SQL 都是模型写的。Boris 的多个 Claude Agent 在 loop 中运行，遇到不确定的事情，会通过 Slack 去找其他人的 Claude Agent 沟通。
Boris 配置的 MCP：Slack 和 BigQuery
> “  我的 Claude 们全天在跑。当它们遇到不确定的问题时，会通过 Slack 跟其他人的 Claude 对话来解决。
** Agent 之间通过 Slack 自主通信协作。  **
他强调，Anthropic 做的是平台，所以他们特别在意 dogfooding，开发者能用到的和他们自己用的是同一套东西。真正的领先优势，是在组织架构和工作流程的变革上。
10
##  产品还重要吗
还有人问了一个尖锐的问题：Claude Code 的成功，到底是模型的功劳还是产品的功劳？
Boris 说，六个月前他觉得大概是 50/50。
> “  不管产品是什么，你最终都得做出一个人们真正喜爱的东西。这是我在 YC 学到的，这个道理没变。
但他认为，随着模型越来越强，产品外壳（他称之为 harness）的重要性会逐渐降低。
Claude Code 的 Hooks 配置
现在 Claude Code 里那些安全机制，prompt injection 防护、命令的静态验证、权限模式、human-in-the-loop。
这些未来都会变得不那么重要，因为模型自己就会做对的事情。
** 他的预测是：一年后，Claude Code 的产品外壳可能只需要 100 行代码。  **
模型强到一定程度，harness 就几乎可以消失了。
11
##  MCP 就是答案
谈到 Claude Code 之外的知识工作（Co-work 等场景），Boris 的回答是：MCP。
同样的 MCP 连接器，接上 Salesforce、Google Docs、Google Calendar，无论是 Claude AI、Claude CLI 还是 Claude Code，都能用。
Agent 目录结构
对于没有 MCP 的系统呢？Computer Use 是兜底方案。Boris 说 Anthropic 在 Computer Use 上目前应该是领先的，尤其 4.7 之后效果相当好，就是慢。
但他也补充了一句：
> “  这些都不太重要。MCP 也好，API 也好，只要有某种程序化的接入方式就行。对模型来说，都只是 token。
12
##  接下来呢
最后，有人问 Boris：如果现在要做一个为未来模型准备的产品，会是什么形态？
他给了两个方向：
一个是  ** Claude Design  ** ，他说现在已经挺好了，未来还会更好。
另一个是围绕  ** loop 和 batch 的大规模并行 Agent 编排  ** ，这块正在加速迭代。
还有一些他们正在酝酿的新东西，「未来几周就会上线」。
Lauren 最后说了句：「So there is hope for us after all.」
Boris 笑了笑。
** 写代码的时代，或许真的，正在结束。  **
** 但人人都可以「指挥 AI 写代码」的时代，才刚刚开始。  **
◇ ◆ ◇
相关链接：
•  访谈视频：https://www.youtube.com/watch?v=SlGRN8jh2RI
•  Boris Cherny 的 X：https://x.com/bcherny
•  Boris 的 Claude Code 使用技巧：https://howborisusesclaudecode.com/
•  Claude Code：https://claude.ai/code