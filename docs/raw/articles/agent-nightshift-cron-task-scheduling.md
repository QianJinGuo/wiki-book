---
sha256: "ebcf98736ee07af34311226fd3ded8b6287375e6214889839f18133c0aadc9a2"
title: "想让 Agent 在你睡觉时继续干活？先给它排好夜班"
source_url: "https://mp.weixin.qq.com/s/jSzMDM8n_X6vjOXwOYdRdQ"
author: ""
ingested: 2026-07-02
type: raw
tags: [agent, cron, task-scheduling, automation, agent-lifecycle]
---

权限层  |  例子  |  处理方式
---|---|---
可自动做  |  读文件、生成草稿、跑本地测试  |  允许
可生成待审变更  |  改代码、改文档、开 draft PR  |  做完但不合并
需人工确认  |  发邮件、发 Slack、改生产配置  |  暂停等待
禁止  |  删除数据、付款、公开发布、绕过审计  |  不执行

这和我们前面聊 Harness 状态边界时是同一件事。

模型输出一个想法，系统生成一个动作，工具真的产生副作用，外部状态正式改变，这几层不能混在一起。

无人值守任务尤其要把这个边界写在前面。否则早上看到的可能不是“它做完了”，而是“它已经替人做了一个没有授权的决定”。

* * *

##  填排班单

如果再往实用处走，可以把上面的四类信息压成一张表。

不用复杂系统，一开始一个 Markdown 表格就够。

---
字段  |  要写清什么  |  为什么重要
---|---|---
任务名  |  今晚到底跑哪件事  |  防止任务膨胀
工作窗口  |  从几点跑到几点，最多跑几轮  |  控制成本和失控时间
输入位置  |  代码目录、文档、issue、表格、链接  |  防止 Agent 靠猜找材料
完成条件  |  什么状态才算 done  |  给  ` /goal  ` 或人工验收用
检查命令  |  测试、lint、链接检查、来源核对方式  |  让结果可验证
证据位置  |  ` EVIDENCE.md  ` 、PR、截图、CI 链接  |  第二天不用翻聊天
状态位置  |  ` STATE.md  ` 或  ` LOOP-STATE.md  ` |  下次能接着跑
权限边界  |  哪些能自动做，哪些要等人  |  防止无人值守副作用
停机条件  |  连续失败几次、遇到什么就停  |  让 blocked 成为正常状态
早班负责人  |  第二天谁看结果  |  没人验收就很难形成闭环

举个更像团队里会用的版本：

    任务名：billing/refund 测试排班  
    工作窗口：22:30 - 07:30，最多处理 3 类测试  
    输入位置：/services/billing/refund，issue #842，现有测试目录  
    完成条件：refund、retry、duplicate webhook 三类测试补齐  
    检查命令：npm test -- billing/refund  
    证据位置：EVIDENCE.md + draft PR  
    状态位置：STATE.md  
    权限边界：可改测试和最小生产逻辑；不可改 schema、密钥、provider 配置  
    停机条件：同一项连续 3 次失败；遇到真实账号、生产数据或语义不确定时停  
    早班负责人：模块 owner 早上 10 分钟验收

这张表不高级，但它很管用。

很多 Agent 任务失败，不一定是模型差一点，而是任务一开始就没有被整理成“能交接”的形状。目标散在脑子里，输入散在聊天里，权限靠默认理解，失败靠模型自己体会。

这张小表的价值，是把这些隐含信息提前摊开。

现有讨论里还可以继续往前补的，就是这一层：让模型在晚上多跑几个小时并不难，难的是让它进入团队流程以后，第二天还能被人接手、复查和继续推进。

* * *

##  选对工具

` /goal  ` 、  ` /loop  ` 、scheduled tasks 和 Routines 很容易被混在一起。放到真实流程里，它们其实解决的是三类问题。

` /goal  ` 管终点。它适合“做到某个条件为真才停”的任务。这个条件最好有一个可测量的结束状态，有明确检查方式，也写清不能被破坏的约束。比如所有测试通过、某个迁移保持 API 兼容、待处理队列清空。长任务还可以顺手加上轮次或时间边界，比如最多跑 20 个 turn，或者超过某个时间就停下来汇报。

` /loop  ` 管节奏。它适合在当前会话里隔一会儿回来检查一次。比如每 5 分钟看部署是否完成，每 30 分钟看 CI 和 review comments。没写固定间隔时，Claude 可以根据观察结果选择下一次等待多久；但它仍是会话内的轮询工具，不是长期无人值守系统。

Routines 管长期调度。它把 prompt、仓库和连接器保存成可触发的配置，可以按 schedule、API 或 GitHub 事件从 Anthropic 托管基础设施里启动。这个能力更接近“云端值班”，但官方也明确标注为 research preview，行为和限制可能变化。

所以这三类能力不是互相替代，更像从小到大的三层：

---
能力  |  适合什么  |  先看边界
---|---|---
` /goal  ` |  明确终点的长任务  |  目标能否被证据证明
` /loop  ` |  当前会话里的反复检查  |  会话是否还在、是否会过期
Routines  |  值得沉淀的长期流程  |  权限、触发器和 preview 限制

图 3：/goal、/loop、Routines 怎么选

这也解释了为什么晚间任务不适合一上来就做成全自动。

比较稳的路径大概是：

1. 1\. 白天手动跑一遍；
2. 2\. 用  ` /goal  ` 把完成条件说清楚；
3. 3\. 用状态文件记录过程；
4. 4\. 用  ` /loop  ` 或 scheduled task 做短周期看护；
5. 5\. 连续几轮稳定后，再考虑做成 Routine、Skill 或团队流程。

一开始就把一个模糊流程丢进长期自动化，通常会比较吃力。

自动化会放大流程里的确定性，也会放大流程里的含糊。

这里还要补一个容易忽略的边界。

` /loop  ` 不是“永远跑”。Claude Code 官方文档里，session-scoped recurring tasks 有 7 天过期边界，而且任务只在当前 session 或可恢复的 session 里生效。Routines 更持久，但官方也标注仍是 research preview。

这不是坏事。

对 Agent 自动化来说，过期机制本身就是安全设计。忘掉的 loop 如果一直跑，成本、权限和副作用都会变成问题。

所以团队做这类流程时，可以顺手给自动化加上过期时间：

* • 新流程先跑 1 晚；
* • 稳定后跑 1 周；
* • 每周重新审一次权限和输出质量；
* • 连续稳定后，再进入团队固定流程。

长期自动化不是一次配置完就放在那里。

它更像一条小生产线，需要定期看良率、看坏件、看成本，也看有没有不该被自动化的步骤混进去了。

* * *

##  白天交班

这类晚间任务，很容易先被理解成省时间。

我自己的感受更接近另一层：它在改变白天的工作重心。

白天人最值钱的地方，不是陪 Agent 等输出，而是把任务切成能被 Agent 执行和验证的形状。

这其实接上了《架构师》今年一直在梳理的那条线。

前面看 [ Codex 团队分享时 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409406&idx=1&sn=2acb13da5ebe84602bc93fabc4812756&scene=21#wechat_redirect>) ，我们关注的是“工作现场”：任务不能只存在于一轮聊天里，现场、产物、目标和后续动作都要能留下来。

后来聊 [ Harness 可靠性 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409503&idx=1&sn=945c14c0d7edb60c29b6e43a6bd92677&scene=21#wechat_redirect>) 、 [ Self-Harness ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409619&idx=1&sn=614aa13b69079391fb545e1dc8b79715&scene=21#wechat_redirect>) 、 [ Loop Engineering ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409570&idx=1&sn=428076fdda70ba056114aec3bfbd1022&scene=21#wechat_redirect>) ，又把问题往下压了一层：状态边界要清楚，失败轨迹要能复盘，停止条件要写在循环前面。

现在这个话题把两条线合在一起了。

工作现场要能跨时间存在，状态边界也要能在无人值守时生效。

所以团队下班前的准备动作，会越来越像一次小型交接：

* • 今天白天人做了哪些判断；
* • 哪些任务可以交给 Agent 执行；
* • 哪些输入已经稳定；
* • 哪些验收标准已经写清；
* • 哪些动作要等人；
* • 第二天早上看哪几份证据。

这比“写一个万能 prompt”土很多。

但真实工程里，值钱的通常就是这些土办法。

* * *

##  人还在场

这里还要泼一点冷水。

Agent 能在夜里继续干活，不代表团队要把所有东西都交给它。

有三类任务，我自己会更小心一点。

第一类是不可逆动作。

删数据、发正式邮件、付款、改生产配置、公开发布内容，这些事哪怕 Agent 写得再像样，也更适合停在人手里。让它准备草稿、生成变更计划、做 dry-run 都可以，最后一步留给人确认。

第二类是目标本身还没定的任务。

如果团队白天都还没想清楚产品要什么、架构要保什么、业务指标怎么取舍，让 Agent 夜里跑，只会把模糊放大。第二天看到的不是答案，而是一堆看似完整的候选方案。

第三类是事实源不稳定的任务。

比如追热点、看社交媒体、读爆料、做价格对比。Agent 可以做扫描，但正文结论、引用和判断要回到一手来源。社交讨论只能当线索，不能直接当事实。

所以这里没有把 DeepSeek 峰谷价格写成强事实展开。当前能直接核到的官方价格页是模型价格和兼容别名；峰谷机制更多来自媒体报道和外部转述。这样的信息可以提示我们“时间维度正在进入计费模型”，但不适合写成已经完全落地的官方规则。

这类克制很重要。

无人值守任务越普及，错误也越容易批量化。以前一个人误读一条消息，影响可能是一篇文档；以后一个 unattended loop 误读一条规则，可能会改一批文件、发一串消息、污染一组记忆。

所以自动化程度越高，人工闸门越要前置。

* * *

##  早上看证据

如果 Agent 跑了一夜，第二天早上第一眼看什么？

我一般不先看它的自然语言总结。

总结当然要看，但我一般把它放在后面。第一眼先看证据面：

1. 1\.  ` STATE.md  ` ：任务是否都落到了 done / blocked / needs me；
2. 2\.  ` EVIDENCE.md  ` ：测试、链接、截图、CI、来源是否可复核；
3. 3\. diff：是否越界改了不该改的文件；
4. 4\. 权限清单：是否有需要人工确认的动作；
5. 5\. 失败项：失败是输入问题、权限问题、环境问题，还是模型判断问题。

如果这些都没有，只剩一句“我已经完成”，那不算完成。

那更像是把复核成本转移给第二天早上的人。

这个习惯一旦建立起来，晚间任务才可能真正进入团队流程。否则它只是一种新鲜感：晚上跑得热闹，早上返工也热闹。

我自己会把早上的验收压成 10 分钟。

第一分钟，看它有没有越界。

改了哪些文件，碰了哪些系统，有没有做了不该做的动作。

第二到第五分钟，看证据。

测试有没有跑，链接有没有打开，来源有没有对应，截图和 diff 是否能支撑它的结论。

第六到第八分钟，看 blocked 项。

blocked 不是坏事。一个好的长任务 Agent，要知道什么时候停下来等人，而不是把不确定包装成完成。

最后两分钟，看有没有值得沉淀的流程。

如果同类任务连续几次都跑得稳，再考虑把它写成 Skill、Routine、GitHub Action 或团队脚本。反过来，如果每次都要人工重做，更值得先修任务定义。

* * *

##  写在最后

我现在对这类晚间任务的看法会保守一点。

这不是一个口号，也不是一个简单的省钱技巧。

它更像一个信号：Agent 开始进入带时间维度的工作流。白天和晚上、人在线和不在线、一次 prompt 和长期 loop、聊天记录和状态文件、模型输出和可审查证据，这些边界都要重新摆一遍。

算力便宜的时候，多跑一点当然好。

更能产生复利的，不是把更多任务塞进夜里，而是把那些重复、可验证、低风险的流程，逐步整理成 Agent 能接手的工作制度。

我自己的起点会放得很小。今晚只挑一个任务，写清楚目标，只允许低风险动作，并要求它留下状态和证据。第二天早上，不先听它说自己做得多完整，先按证据验收。

如果这件事连续跑三次都稳，再把它做成 Skill、Routine 或团队固定流程。

这样看，所谓排班，最后考验的不是模型会不会熬夜。

考验的是我们有没有把工作写到足够清楚，清楚到一个不懂你白天所有上下文的系统，也能在边界里继续往前走。

* * *

##  参考资料

* • OpenAI：《Codex-maxxing for long-running work》
https://openai.com/index/codex-maxxing-long-running-work/
* • OpenAI 白皮书 PDF：
https://cdn.openai.com/pdf/8a9f00cf-d379-4e20-b06f-dd7ba5196a11/OAI_WhitePaper_Codex-maxxing26.pdf
* • Jason Liu：《Codex-maxxing》
https://jxnl.co/writing/2026/05/10/codex-maxxing/
* • Claude Code Docs：Keep Claude working toward a goal
https://code.claude.com/docs/en/goal
* • Claude Code Docs：Run prompts on a schedule
https://code.claude.com/docs/en/scheduled-tasks
* • Claude Code Docs：Automate work with routines
https://code.claude.com/docs/en/routines
* • Qoder Docs：Qwen 3.7 Discount Rates
https://docs.qoder.com/events/offpeakrate
* • Addy Osmani：《Loop Engineering》
https://addyosmani.com/blog/loop-engineering/
* • Armin Ronacher：《The Coming Loop》
https://lucumr.pocoo.org/2026/6/23/the-coming-loop/

如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **

** ·END·  **

    **相关阅读：**

[架构排熵：Loop Engineering 的持续清理系统](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409667&idx=1&sn=96d1aa86386964bd2db67cef90fdb57c&scene=21#wechat_redirect>)

[Claude Code 27 条实用技巧，快速升级](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409717&idx=1&sn=6ee81da9b08fc40d76d1da2816099866&scene=21#wechat_redirect>)

[我终于搞明白了：Claude Code 为什么会忽略指令了](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409707&idx=1&sn=8f1ff50b91edcf5663c850e66e8eb6ac&scene=21#wechat_redirect>)

[Loop 工程实战：从任务循环到可维护闭环](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409696&idx=1&sn=c136d1470ea9e2e99b529412ab8b9b60&scene=21#wechat_redirect>)

[CLAUDE.md 拆解：Agent 进仓库前的上下文入口](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409687&idx=1&sn=4569e2316219222db4d5865939aa6487&scene=21#wechat_redirect>)

[Claude、Codex、Mira 都在讲 Loop，架构师更该看什么](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409679&idx=1&sn=453d7d874635794974fcdab68949fa5a&scene=21#wechat_redirect>)

[如何用 Claude Code 搭建自己的 AI 学习系统](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409660&idx=1&sn=b122c2632d7defa0b04d493bc946dc80&scene=21#wechat_redirect>)

[Anthropic CEO 核心访谈：AI时代，企业、职场与治理](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409653&idx=1&sn=20ce3facdb4f69d85beeedf96ec93837&scene=21#wechat_redirect>)

[Loop详解：从ReAct到Loop Engineering，Agent到底在循环什么](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409645&idx=1&sn=c0dabb7f0ec41f7d14661d45739ea073&scene=21#wechat_redirect>)

[Harness工程还没唱罢，Environment工程已然登场](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409635&idx=1&sn=4834ecd16c8b4857a9c9cf8c31561af6&scene=21#wechat_redirect>)

[设计Self-Harness架构：会自我改进的Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409619&idx=1&sn=614aa13b69079391fb545e1dc8b79715&scene=21#wechat_redirect>)

[Fable 5 的信号：Agent 开始拼 Runtime](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409593&idx=1&sn=a97854f05c02224761b3dfae43b95858&scene=21#wechat_redirect>)

[Anthropic工程师：我们日常如何使用Claude Code](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409586&idx=1&sn=43c761f323cf20ff21bd4aba19ae0e5f&scene=21#wechat_redirect>)

> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!

** 架构师  **

我们都是架构师！
