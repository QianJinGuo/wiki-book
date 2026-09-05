---
source: wechat
source_url: https://mp.weixin.qq.com/s/JyuHf87AUdNRGJc_fdLRuA
ingested: 2026-07-06
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-07-05
sha256: f59912af5dff70c2f5459aab0339faa0f027e4c10f6ac280e73f2190a4237a49
sha256: f59912af5dff70c2f5459aab0339faa0f027e4c10f6ac280e73f2190a4237a49
---

source: wechat
source_url: https://mp.weixin.qq.com/s/JyuHf87AUdNRGJc_fdLRuA
ingested: 2026-07-06
source_published: 2026年7月5日 22:39
sha256: f59912af5dff70c2f5459aab0339faa0f027e4c10f6ac280e73f2190a4237a49
sha256: f59912af5dff70c2f5459aab0339faa0f027e4c10f6ac280e73f2190a4237a49


# Claude官方教你用 Loop：如何让Claude Code上夜班的四个交接点

架构师（JiaGouX）我们都是架构师！  
架构未来，你来不来？

  


* * *

晚上准备下班，一个 PR 还没合。

CI 还在排队，review comment 可能半夜进来，部署状态也没完全回稳。这个时候，最自然的想法是：能不能让 Claude Code 帮忙盯一晚？

问题也在这里。

放回《架构师》今年一直梳理的 Agent 工程主线，它和前面几次讨论是同一条线：[刹车](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409602&idx=1&sn=3d8c928d15281bacead98d213b6c543f&scene=21#wechat_redirect>)、[反馈契约](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409570&idx=1&sn=428076fdda70ba056114aec3bfbd1022&scene=21#wechat_redirect>)、[夜班排班](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409731&idx=1&sn=09689f88b72e8c867e16950b5d76d91a&scene=21#wechat_redirect>)和[企业权限](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409753&idx=1&sn=53428e5c9e2df50d819886ae27a5a1e9&scene=21#wechat_redirect>)，最后都会落到同一件事上：人从哪一步退出来，退出来之前留下些什么。

如果只是写一句“每 15 分钟检查 PR，修掉失败的 CI，处理新的 review”，第二天早上醒来，结果可能有两种：一种是它真的把机械活做完了；另一种是它新增了一堆 commit，绕开了测试，把失败路径藏在一段漂亮总结里。

Claude Code 团队 6 月 30 日发了一篇官方博客，标题叫 `Getting started with loops`。中文说得直白一点，就是：Claude 官方在教 Claude Code 用户怎么用 Loop。

官方把 loop 分成四类：turn-based、goal-based、time-based、proactive。这个分类本身不复杂。更值得研究的是，它其实在问一个更工程化的问题：

**团队到底准备把哪一部分交出去？**

官方那四类 loop 不必只当命令清单看。放到这个场景里，它们更像四个交接点：
    
    
    检查怎么做 -> 做到哪算完 -> 什么时候再看 -> 能不能自己分派和收口

对应到工程动作，就是 **检查** 、**停止** 、**等待**  和 **权责边界** 。

我的理解会更保守一点：

**Loop 的重点不在于让 Agent 多跑几轮，而在于人从哪个位置退出来；每退一步，系统都要补上一段更清楚的工程边界。**

先把这层关系放成一张总览图：

图 1：Claude Code 上夜班前的四个交接点

* * *

## 第一步，先交出去检查

很多人一听 loop，第一反应是“让它自己一直干”。

这一步通常有点快。

如果一个 PR 还没合，最容易先交出去的，其实是平时人工检查的那些动作。

比如一个前端改动，光看到测试通过通常不够。我们往往还会打开页面，点一下按钮，看状态有没有变，截一张图，扫一眼 console，再确认没有明显性能退化。

这些步骤很普通，却决定了 Claude 最后是在“真的验过”，还是只是“改完以后感觉能用”。

Claude 官方文章把 turn-based loop 放在第一层。我的理解是：每一条 prompt 本来就会触发一个小循环，Claude 会读代码、改代码、跑检查、再决定要不要继续。问题在于，这个检查常常是临场的。

更稳的第一步，是先不急着上 `/goal`，也不用马上开 `/loop`。

**先把检查写下来。**

在 Claude Code 里，这件事可以落到 Skill 上。比如给仓库补一个最小的 PR 验收 Skill：
    
    
    ---  
    name: verify-pr-change  
    description: Verify a PR change before reporting it complete.  
    ---  
      
    # PR verification  
      
    For every PR-related change:  
      
    1. Run the targeted tests for the touched area.  
    2. Run lint or typecheck if the repo provides one.  
    3. If UI changed, start the app, interact with the changed path, and save before/after screenshots.  
    4. Check browser console or service logs for new errors.  
    5. If any step fails, fix it and rerun the failed check.  
    6. Final output must include commands, exit codes, screenshots or logs, and remaining risks.

这样做的价值不在“提示词更长”，而在于 Claude 不用每次重新猜团队的验收习惯。

不先把检查步骤写成资产，后面的自动循环就没有地基。Agent 可以跑得很勤快，但每轮结束时仍然会回到同一个问题：

它到底按什么标准说自己做完了？

* * *

## `/goal` 要写得像验收单

第二个交接点，是停止条件。

这时才轮到 `/goal`。

示例可以这样写：
    
    
    /goal 这个 PR 的 auth 相关测试全部通过，  
    lint 退出码为 0，  
    改动只限 src/auth 和 tests/auth，  
    最多 8 轮；  
    如果连续两轮没有新增证据，停下来说明阻塞原因。

这条命令里，关键是两件事：**证据**  和 **刹车** 。

测试通过、lint 干净、diff 不越界，是证据。

最多 8 轮、连续两轮没有新增证据就停，是刹车。

Claude Code 文档里有一个细节值得单独拎出来：`/goal` 每轮结束后，会让一个单独的评估模型判断目标是否达成。这个评估器和执行任务的 Claude 分开，所以比自写自审稳一点。

但它不是全知裁判。

官方文档说得很清楚：评估器不会自己读文件，也不会自己跑命令。它只能看 Claude 已经放进对话里的东西。

更稳的写法是，结果之外，把证据也露出来。
    
    
    最后输出：  
    - 实际执行过的验证命令；  
    - 每条命令的退出码；  
    - 失败过哪些方案；  
    - 当前 diff 是否越界；  
    - 如果未完成，下一步需要人判断什么。

这样 `/goal` 才不会变成“模型觉得目标满足了”。

它会变成一个更可接手的工作单：每轮尝试过什么，证据在哪里，为什么继续，为什么停。

这里比“Claude 可以自己多干几轮”更重要。

真实工程里，长任务少一点结果并不可怕，更怕的是它把失败路径藏进上下文里，最后只留下一个看似完成的总结。

* * *

## `/loop` 更适合处理等待

第三个交接点，是触发时机。

PR、CI、部署、review comment 这类事情有一个共同点：任务本身没变，输入在外部变化。

人最烦的也正是这部分。

这时人通常知道下一步怎么做，只是不想每 10 分钟切回去看一次。

这时 `/loop` 才有意义。
    
    
    /loop 10m check this PR, address new review comments, and summarize CI status

官方文档把 `/loop` 讲得比很多二手文章更细。它是会话内的本地调度，适合“我现在打开着这个任务，想让 Claude 过一会儿再看”的场景。

它可以固定间隔跑，也可以让 Claude 根据当前情况自己选择下一次检查时间。比如构建还在跑，就短一点；PR 安静下来，就长一点。文档里还提到，动态 `/loop` 有时会用 Monitor 工具，靠常驻脚本持续拿输出，避免反复用 prompt 轮询。

这个细节挺重要。

很多人会把 loop 想成“更频繁地问模型”。但频繁问模型，本身就是成本。能用事件、日志流、监控输出解决的，不一定要靠一次次重新推理。

所以我会把 `/loop` 看成一个过渡工具：

  * • 当前会话还在；
  * • 本机环境还需要；
  * • 外部状态会变化；
  * • 希望 Claude 过会儿回来看看。

它不适合被误当成企业级长期任务系统。

官方文档也写了边界：`/loop` 是会话级任务，关闭终端、开始新会话、过期机制都会影响它。需要脱离当前会话长期运行，就要看 routines、桌面定时任务或者 GitHub Actions。

所以，`/loop` 很适合少切几次窗口。

**但它不替团队解决权限、审计、责任和长期运行问题。**

* * *

## ` /schedule` 交出去的是身份和权限

如果任务不依赖本机，不依赖当前会话，甚至要在电脑合上以后继续跑，就会走到 `/schedule` 和 routine。

这一步看起来只是“本地变云端”，但工程含义完全不同。

Routine 是一份保存下来的 Claude Code 配置：prompt、仓库、环境、连接器和触发器。它可以按时间跑，也可以被 API 或 GitHub 事件触发。

这意味着它进入了实际的自动执行区域。

官方文档里有一个很容易被忽略的边界：routine 运行时没有权限确认提示。它能访问哪些仓库，能不能推分支，能用哪些 connector，网络能连到哪里，都由创建 routine 时的配置决定。

还有一个更现实的点：routine 通过创建者连接的身份做事。

它创建的分支、PR、Slack 消息、Linear ticket，会体现为创建者的账号动作，或者授权过的连接器动作。

到这一层，prompt 质量已经不够回答问题。身份、权限、审计和责任边界开始成为主问题。

我会先问几个很土的问题：

  * • 这个 routine 只能开 `claude/` 前缀分支，还是能推已有分支？
  * • 它默认包含了哪些 connector，有没有删掉不需要的？
  * • 它能不能写 Slack、Linear、GitHub，还是只读？
  * • 网络访问范围是不是只覆盖必要域名？
  * • 每次运行的结果写到哪里，人从哪里复核？
  * • 超过预算、连续失败、证据不足时，是停止、降级，还是通知人？

这些问题听起来不如“自动处理 bug report”酷，但它们决定第二天早上看到的是一个可审查结果，还是一堆已经发生的副作用。

这也是官方文章值得读的地方。

它表面在讲 loop，实际上在提醒：当 Agent 从本地会话走向 routine，系统边界就从“对话质量”变成了“授权后的执行行为”。

换成一张对比图，会更直观：

图 2：Claude Code Loop 的委托阶梯与边界变化

* * *

## 再往上，才是 proactive loop

最后是 proactive loop。

官方文章举的例子，是用 `/schedule` 检查用户反馈，用 `/goal` 定义这一轮的完成条件，用 Skill 记录验收方式，再用 dynamic workflows 让多个 Agent 分别分类、修复和审查，最后配合 auto mode 减少权限打断。

这个组合已经超出“帮我盯一下 PR”的范围。

它更像一条小型无人值守流水线。

这一步最容易让人兴奋，也最容易出事。

因为交出去的不只包含触发时机，还包含一段决策流程：哪些反馈值得处理，采用哪个修复方案，什么时候算处理完，以及怎么回复外部系统。

Dynamic workflows 在这里有一个重要变化：它把编排计划从 Claude 的上下文里挪到脚本里。官方文档说，workflow 是 Claude 写出的 JavaScript 脚本，由 runtime 执行，可以编排大量 subagents，并且保留阶段、中间结果和交叉验证。

这比在一个聊天窗口里临场调度要可靠。

但它也会放大所有成本。

并发 Agent 越多，token 消耗、结果审查、文件冲突、权限风险和人类复核压力都会一起上涨。官方博客也提醒，dynamic workflows 可能启动大量 Agent，先小规模试跑再放量。

所以我会给 proactive loop 加一个硬条件：

**凡是会替人做决策的 loop，都要有独立复核。**

这个复核不一定是人，也可以是 reviewer agent、测试、规则检查、截图比对、预算阈值、变更白名单。更稳妥的做法，是让执行者和判定者分开。

否则流水线越顺，越容易把错误包装成进展。

* * *

## 第一晚先不追求全自动

如果真要把一个 PR 交给 Claude Code 盯一晚，我不会一上来写一个很大的 proactive prompt。

更稳的做法，是先选一个风险低的小 PR，跑一个晚上，看它到底会在哪些地方越界。

这个 PR 不能随便选。我的偏好是：改动范围清楚，最好只碰一个模块；有现成测试，失败原因能复现；不涉及支付、权限、迁移、生产配置；review comment 主要是机械修改，不牵涉架构取舍。

还有一个很朴素的标准：即使 Claude 什么都不改，只把 CI、review 和风险点整理清楚，这一晚也算有价值。

坦率说，第一晚的目标不必定成“让它把活全干了”。

更像是值一个观察班：看看它会不会乱改范围，会不会把失败原因说清楚，会不会在该停的时候停。

一条更稳的小路径大概是这样。

图 3：第一晚让 Claude Code 值班的试跑流程

第 0 步，先给 PR 打一个很明确的标签，比如 `claude-watch`。没有这个标签，Claude 不碰。

第 1 步，仓库里先有验证 Skill。它只回答一件事：这个 PR 怎么验。

第 2 步，用 `/goal` 定义这一轮到底怎么停：
    
    
    /goal PR 中 auth 相关测试和 lint 都通过；  
    只允许修改 src/auth 与 tests/auth；  
    最多 8 轮；  
    如果连续两轮没有新增证据，停止并输出阻塞原因。

第 3 步，如果只是等 CI 或 review，用 `/loop` 做短期轮询：
    
    
    /loop 15m check CI and review comments for this PR.  
    Address low-risk comments only.  
    For anything involving public API, auth logic, data migration, or production config,  
    summarize the issue and wait for human review.

第 4 步，连续几次跑稳以后，再考虑 routine。routine 第一版我会收得很窄：
    
    
    Nightly PR watcher:  
    - Watch only open PRs with label claude-watch.  
    - Read CI, review comments, and changed files.  
    - Push only claude/* branches.  
    - Never merge, never edit production config, never change migrations.  
    - Open a draft PR or leave a summary comment.  
    - Include commands, evidence, cost summary, and unresolved risks.

这里有三个边界我会特别保守：

  * • 能开草稿 PR，不等于能合并。
  * • 能改测试，不等于能改验收标准。
  * • 能写 Slack 或 Linear，不等于能替团队做承诺。

第二天早上，我不会只看一句“done”。

我会打开 transcript 和 diff，看命令、退出码、改动范围、失败路径、人工判断点和 token 成本。如果这些东西说不清，说明 loop 还没有进入可托管状态。

这条路径听起来慢一点，但每一步都知道自己交出去的是什么。

先交验证，再交停止，再交等待，最后才交一小段决策。

这比一上来追求“让 Agent 自己处理所有反馈”更像真实工程。

* * *

## 落地顺序可以再简单一点

如果只是想少做重复检查，先写 Skill，让 Claude 输出命令、退出码和证据。等检查稳定了，再用 `/goal` 处理一个小模块，限制轮数和改动范围。

如果问题只是“CI 还没回、review 还没来”，用 `/loop` 就够了。它适合少切几次窗口，不适合一上来接生产配置、迁移和权限逻辑。

routine 和 dynamic workflow 可以放到更后面。前者先从草稿 PR 或摘要评论开始，后者先小批量跑几个 issue，并保留 reviewer agent 或人工复核。

我的经验是，先交检查，再交停止，再交等待，最后才交决策。每一步只退一小格，系统更容易留下证据，也更容易被人接手。

* * *

## 写在最后

Claude Code 官方文章有意思的地方，不在于给了四个 loop 名词。

它把很多平时讲得比较虚的东西，压到了具体操作面上：Skill 管检查，`/goal` 管停止条件，`/loop` 管短期等待，`/schedule` 和 routine 管长期触发，dynamic workflows 管可复用编排。成本可以从 `/usage`、`/goal` 状态和 `/workflows` 里看，第二视角可以交给 reviewer agent 或 code review Skill。

放到一起看，Claude Code 已经开始从交互式编码助手，往任务运行系统靠近。

但越像任务运行系统，越不能只靠 prompt 写得好不好。

它需要那些听起来很传统的东西：权限、日志、状态、队列、成本、复核、降级和人工接手。

工具在变，问题没变。

一个能长期跑的 loop，最后要看两件事：它怎么自动开始，以及它能不能在证据不足、权限越界、成本异常和结果不可信的时候停下来。

所以，我对 Claude Code 官方文章的理解会更保守一点：

它更像是在提醒我们：想把更多工作交给 Agent，先把交接点写清楚。

先让它能留证据、可暂停、可复核、可接手。

然后再谈让它多跑几轮。

* * *

## 参考资料

  * • Claude Blog：Getting started with loops  
https://claude.com/blog/getting-started-with-loops
  * • Claude Code Docs：Keep Claude working toward a goal  
https://code.claude.com/docs/en/goal
  * • Claude Code Docs：Run prompts on a schedule  
https://code.claude.com/docs/en/scheduled-tasks
  * • Claude Code Docs：Automate work with routines  
https://code.claude.com/docs/en/routines
  * • Claude Code Docs：Dynamic workflows  
https://code.claude.com/docs/en/workflows
  * • Claude Code Docs：Run agents in parallel  
https://code.claude.com/docs/en/agents
  * • Claude Code Docs：Skills  
https://code.claude.com/docs/en/skills

## 往期相关

  * • 《[Loop Engineering 实用指南：先写刹车，再写循环](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409602&idx=1&sn=3d8c928d15281bacead98d213b6c543f&scene=21#wechat_redirect>)》
  * • 《[Loop Engineering 再看：真正该设计的，是反馈契约](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409570&idx=1&sn=428076fdda70ba056114aec3bfbd1022&scene=21#wechat_redirect>)》
  * • 《[Claude、Codex、Mira 都在讲 Loop，架构师更该看什么](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409679&idx=1&sn=453d7d874635794974fcdab68949fa5a&scene=21#wechat_redirect>)》
  * • 《[想让 Agent 在你睡觉时继续干活？先给它排好夜班](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409731&idx=1&sn=09689f88b72e8c867e16950b5d76d91a&scene=21#wechat_redirect>)》
  * • 《[企业 AI Loop 落地：先把目标、证据和权限写清楚](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409753&idx=1&sn=53428e5c9e2df50d819886ae27a5a1e9&scene=21#wechat_redirect>)》

  


如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

**因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享**

**·END·**
    
    
    **相关阅读：**
      
        * [架构排熵：Loop Engineering 的持续清理系统](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409667&idx=1&sn=96d1aa86386964bd2db67cef90fdb57c&scene=21#wechat_redirect>)
      
        * [Claude Code 27 条实用技巧，快速升级](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409717&idx=1&sn=6ee81da9b08fc40d76d1da2816099866&scene=21#wechat_redirect>)
      
        * [我终于搞明白了：Claude Code 为什么会忽略指令了](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409707&idx=1&sn=8f1ff50b91edcf5663c850e66e8eb6ac&scene=21#wechat_redirect>)
      
        * [Loop 工程实战：从任务循环到可维护闭环](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409696&idx=1&sn=c136d1470ea9e2e99b529412ab8b9b60&scene=21#wechat_redirect>)
      
        * [CLAUDE.md 拆解：Agent 进仓库前的上下文入口](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409687&idx=1&sn=4569e2316219222db4d5865939aa6487&scene=21#wechat_redirect>)
      
        * [Claude、Codex、Mira 都在讲 Loop，架构师更该看什么](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409679&idx=1&sn=453d7d874635794974fcdab68949fa5a&scene=21#wechat_redirect>)
      
        * [如何用 Claude Code 搭建自己的 AI 学习系统](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409660&idx=1&sn=b122c2632d7defa0b04d493bc946dc80&scene=21#wechat_redirect>)
      
        * [Anthropic CEO 核心访谈：AI时代，企业、职场与治理](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409653&idx=1&sn=20ce3facdb4f69d85beeedf96ec93837&scene=21#wechat_redirect>)
      
        * [Loop详解：从ReAct到Loop Engineering，Agent到底在循环什么](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409645&idx=1&sn=c0dabb7f0ec41f7d14661d45739ea073&scene=21#wechat_redirect>)
      
        * [Harness工程还没唱罢，Environment工程已然登场](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409635&idx=1&sn=4834ecd16c8b4857a9c9cf8c31561af6&scene=21#wechat_redirect>)
      
        * [设计Self-Harness架构：会自我改进的Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409619&idx=1&sn=614aa13b69079391fb545e1dc8b79715&scene=21#wechat_redirect>)
      
        * [Fable 5 的信号：Agent 开始拼 Runtime](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409593&idx=1&sn=a97854f05c02224761b3dfae43b95858&scene=21#wechat_redirect>)
      
        * [Anthropic工程师：我们日常如何使用Claude Code](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409586&idx=1&sn=43c761f323cf20ff21bd4aba19ae0e5f&scene=21#wechat_redirect>)
    
    
    
    

> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!

**架构师**

我们都是架构师！
