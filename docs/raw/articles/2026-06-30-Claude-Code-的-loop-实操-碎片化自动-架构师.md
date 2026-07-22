sha256: c466246b0273d17d6c36c828b072295d801a42fce4e71200daddeb733f6bcc06
---

架构师（JiaGouX）

我们都是架构师！

架构未来，你来不来？

我第一次认真看 Claude Code 的  /loop  ，没有想到“全自动编程”。

更贴近的说法，是一个小一点的词： 碎片化自动 。

它更像是一个很普通的工程现场：CI 还在跑，部署还没结束，PR 评论可能会有新回复，某个接口刚恢复，还需要再观察几轮。

这些事单次都不重，却很容易打断注意力。我们本来在看设计、写文档、排查另一个问题，突然想起来“刚才那个构建是不是好了”，又切回终端看一眼。

/loop  适合接管的，正是这类碎片化工作：事情不大，但会反复打断人；动作不复杂，但需要隔一会儿再看一次；风险要能收住，所以要随时能停。

它让 Claude Code 在当前会话里隔一会儿醒来，替我们看一次状态。有变化就带回 证据 ，没变化就短说；如果碰到凭证、权限、生产配置这类边界，就停下来让人接手。

我的理解更简单：它是一个很小的“会话内观察员”。它不负责替人做所有决定，但可以把很多反复查看状态的动作收起来。

这和我们最近梳理 Loop 的思路，是同一条线。

前面把  Claude、Codex、Mira  放在一起看时，我最在意的还是四个老问题： 反馈 从哪里来， 状态 能不能留下， 什么时候停 ，人能不能接手。

后来再整理  Loop 工程  ，问题又具体了一点：一个循环如果要长期可维护，不能只靠一句“继续努力直到完成”，它至少要有 状态、动作、验证、提交和日志 。

所以今天看 Claude Code 的  /loop  ，我更想先把它放回工程现场。

它更像是这条大线上的一个小入口：先把工程师日常里的碎片等待，做成一个 有节奏、有证据、能停下来 的小循环。

图 1：/loop 在 Claude Code 会话里的位置

## 先把它当成会话里的观察员

试之前，先看版本：

claude --version

scheduled tasks 需要 Claude Code  v2.1.72  或更高版本。这个细节不大，但能少踩一个坑：命令写对了，版本不够，后面就全是在猜。

/loop  的基础用法很简单：

/loop 5m check if the deployment finished and tell me what happened

意思是每 5 分钟重新运行这段 prompt，检查部署有没有结束。

也可以不写固定间隔：

/loop check whether CI passed and address any review comments

这种情况下，Claude 会根据观察结果选择下一次等待多久。构建快结束时短一点，PR 没动静时久一点。这个细节很贴近日常使用，因为很多等待本来就没有一个精确间隔。

还有一种写法是空跑：

/loop

这时 Claude 会使用内置的 maintenance prompt，继续处理当前会话里没完成的事，比如当前分支 PR 的评论、失败 CI、合并冲突，或者在没有待办时做一些清理检查。项目里如果有  .claude/loop.md  ，空跑  /loop  会优先使用这个文件里的默认 prompt。

还有一个容易漏的小边界：在 Bedrock、Vertex AI 和 Microsoft Foundry 上，空跑  /loop  只会打印用法说明。用这些 provider 时，可以显式写 prompt。

这三种写法可以分开用：

写法
更适合什么

/loop 5m <prompt>
明确知道每隔多久检查一次

/loop <prompt>
状态变化节奏不确定，让 Claude 自己决定间隔

/loop
当前会话已经有上下文，只想让它继续做默认巡检

这里先摆几个边界。

/loop  跟着当前 Claude Code 会话走。新开会话会清掉；用  --resume  或  --continue  可以恢复还没过期的任务；递归任务 7 天后会自动过期。它适合临时观察、短周期跟进、当前任务收尾。

如果任务要长期无人值守，比如每天凌晨跑报表、每周整理 issue、长期守护生产告警，只靠  /loop  会偏脆弱。这类事更适合放到 Routines、Desktop scheduled task、GitHub Actions，或者自己的调度系统里。

真实用起来，还会遇到几个运行细节：

- •
  /loop
  只会在 Claude Code 还运行、会话还在时触发；

- • Claude 正在回复时，到点任务会排队，等当前 turn 结束后再跑；

- • 错过的触发不会补跑一堆，只会在空下来后跑一次；

- • 固定时间任务会有一点 jitter，不适合拿来做精确到秒的调度；

- • 想看或取消任务，可以直接问：
  what scheduled tasks do I have?
  、
  cancel the deploy check job
  ；

- •
  /loop
  等下一轮时按
  Esc
  可以停掉后续 wakeup。

我自己的用法会更保守一点：

正在处理的事，需要隔一会儿再看一次，就用  /loop  。需要长期稳定运行，就换更持久的调度。

## 为什么最近大家都在聊 loop

最近网上有一句话传得很广。Peter Steinberger 提醒大家， 除了研究怎么给 coding agent 写 prompt，也要练习设计能提示 agent 的 loop。

Addy Osmani 后来把这件事写成了  Loop Engineering  。围绕 Boris Cherny、Peter、Claire Vo 的讨论，也都在指向同一个变化：人不一定每一轮都亲手输入 prompt。

这些讨论放在一起看，可以先落到一个更小的问题：人是不是每一轮都要亲手回来问一句“现在怎么样了”？

放到 Claude Code 的  /loop  里，它先解决的就是这件事： 把“人隔一会儿回来看状态”，变成会话内可重复执行的动作。

再往上走，才会碰到 Addy 说的那些部件：工作区隔离、项目技能、外部连接器、验证 agent、长期状态。它们不用第一天就上齐，但能提醒我们，loop 一旦从“观察”走向“执行”，问题就从 prompt 写法，慢慢变成工程组织方式。

## 从最小场景开始

第一次试，我不会让  /loop  直接改代码。

更稳的切入点，是读多、改少、证据明确的事情。比如等 CI、等部署、看 PR 评论、看队列深度、看第三方接口是否恢复。

一个很小的例子：

/loop 5m  
Check the current PR's CI status.  
If all checks pass, summarize the result in one short paragraph.  
If any check fails, fetch the failing job name and the most relevant error lines.  
Do not modify files unless I explicitly ask you to.

这段 prompt 不追求“自动修好 CI”。

它只是把等待变轻：现在过了没有，失败在哪个 job，有没有足够证据进入下一步。

PR 评论也类似。我的习惯是先让它整理，不急着动手：

/loop 15m  
Check whether new review comments appeared on the current PR.  
Group new comments by file and severity.  
Mark unclear or architectural comments as needs-human.  
If there are no new comments, reply with "no new review comments".

这比“有评论就帮我改掉”稳一些。

review comment 里经常有语气、上下文和取舍。先归类，再决定哪些能自动处理，成本低很多。

内容监控也能用同一套思路。比如定时看某个公众号或信息源有没有更新。这个场景的重点不在抓文章，而在状态清楚：有新内容、没有新内容、凭证过期、工具失败、需要人处理。

从这个角度看，  /loop  的重点是把那些状态会变、又不值得人一直盯着的任务，变得可观察。

## 先留状态，少烧 token

如果每一轮都从头解释背景、从头读一堆文件，  /loop  很快会变成一个会消耗 token 的闹钟。

更稳的做法，是给它一个很小的状态文件：

{  
  "status": "idle",  
  "last_check_time": "2026-06-30T10:00:00+08:00",  
  "last_evidence": [],  
  "blocked_reason": null,  
  "check_count": 3  
}

状态文件只需要回答几件事：

- • 上一轮是什么状态；

- • 这次有没有新证据；

- • 连续失败了几次；

- • 现在继续观察，还是交给人。

有了状态，Agent 每一轮醒来时就不用重新猜。它可以先读状态，再决定这轮是轻量检查，还是展开分析。

每一轮结果也尽量归为四类：

结果
含义
下一步

changed
状态有变化，有新证据
汇报证据，再决定是否处理

no_change
没有新变化
短回复，继续等待

blocked
权限、凭证、生产配置或判断边界卡住
停下来交给人

done
条件已经满足
总结证据，停止循环

这个分类不复杂，但能避免一种常见情况：Agent 每轮都写很多分析，读完却不知道到底是有进展、没变化，还是已经该停。

这件事看起来小，但很实用。

loop 的成本不在一次运行，而在重复运行。能短就短，能复用状态就复用状态，有变化再多花 token。

图 2：一轮 /loop 怎么跑

## 把 prompt 写成运行卡片

/loop  prompt 更适合写成一张小运行卡片，而不是一段愿望。

比如只写：

/loop 30m 帮我检查这个 PR，有问题就处理。

这句话太松。Agent 需要自己猜“问题”是什么，也要自己猜什么时候能处理。

可以改成这样：

/loop 30m  
You are monitoring the current PR.  

Read loop_state.json first.  
Only check CI status, new review comments, and merge conflicts.  

If CI fails:  
- capture the failing job name  
- capture the shortest useful error excerpt  
- update loop_state.json  

If nothing changed:  
- reply in one sentence  

Stop and ask for human help when:  
- credentials or permissions fail  
- production config is involved  
- the same failure appears twice  
- the next step requires architectural judgment

这里的关键在结构，不在用英文还是中文。

一段可用的  /loop  prompt，通常要说清五件事：

部分
要回答的问题

状态
先读哪里，怎么继承上一轮

范围
本轮只看哪些对象

证据
什么结果算有变化

动作
什么时候允许处理

停止
哪些情况交还给人

这五件事足够了。再往里塞太多背景，反而会把每一轮拖重。

## 再往前一步，才需要更多部件

如果  /loop  只是帮我等 CI，它不需要复杂架构。

但只要它开始做更多事，比如自动分派修复、开 PR、更新 Linear、通知 Slack，问题就会变多。

前面整理 Loop 工程时，我把最小闭环拆成几块：状态、动作、验证、提交、日志。放到  /loop  里，第一天不必把这些都做全，但只要它开始写入真实系统，这些部件迟早会回来。

这时候先补三样东西。

第一是 Skill 。重复使用的项目规则、排查步骤、命令路径，不适合每轮都写进 prompt。放进 Skill，loop 调用起来更稳，也少一些上下文浪费。

第二是 隔离的工作区 。一旦允许 Agent 改文件，更稳的做法是让它在独立 worktree 或独立分支里动手。这样它跑偏时，影响范围比较清楚。

第三是 验证者 。写代码的 Agent 和验收结果的角色最好分开。可以是测试、CI、reviewer subagent，也可以是人。越接近生产，越需要独立证据，而不是只看执行者自己的总结。

这三样并不神秘。它们只是把传统工程里早就有的分工，搬到 Agent Loop 里。

## /loop 和 /goal 各有位置

/loop  和  /goal  很容易混在一起。

我自己的区分很简单：

/loop  适合“隔一会儿看一次”。

/goal  适合“持续推进到一个可验证条件成立”。

比如等部署：

/loop 5m check whether staging deployment finished

比如修测试：

/goal all tests in test/auth pass and npm run lint exits 0

/goal  文档里有个细节：每一轮结束后，会用一个小模型判断条件是否满足。这个 evaluator 不会自己跑命令，也不会独立读文件，只能看 Claude 已经放进对话里的证据。

所以  /goal  的条件要能被证明，比如测试命令退出码为 0、队列为空、文件数量低于阈值、验收条件都出现。

这也提醒我们：Agent 自动化不能只看跑了几轮，更要看每一轮有没有留下证据。

图 3：/loop、/goal、长期调度怎么选

## loop.md 放默认巡检

Claude Code 还支持  loop.md  。

项目级路径是：

.claude/loop.md

用户级路径是：

~/.claude/loop.md

如果一个项目里经常做同一种巡检，比如看 release 分支、当前 PR、CI 和 review comment，就可以把默认 prompt 放进去。

这里也尽量写短：

Monitor the current branch and PR.  

Check:  
1. failed CI  
2. new review comments  
3. merge conflicts  

If nothing changed, respond in one sentence.  
For credentials, production config, deletes, or architecture decisions, stop and ask for human input.

loop.md  不适合写成第二份项目说明。

CLAUDE.md  管的是 Agent 进仓库前先知道什么；  loop.md  管的是空跑  /loop  时默认做什么。复杂流程可以沉到 Skill、脚本或项目文档里，  /loop  只负责按节奏调用。

官方文档还提到，  loop.md  超过 25,000 bytes 的内容会被截断。这个限制其实也在提醒我们：默认巡检 prompt 要短，复杂知识放到别的入口里。

## 第一版先过一张小表

问题
适合 /loop 的信号

需要隔一会儿再看吗
CI、部署、PR、队列、外部状态

每次检查成本低吗
读状态、读日志、查接口

有明确证据吗
exit code、job status、comment、queue depth

失败能分类吗
暂时失败、凭证失败、无变化、需人工

需要长期无人值守吗
不太适合，只靠会话会偏脆弱

需要直接改生产吗
不太适合，第一版先报告

这张表不是限制能力。

它只是帮我判断第一版是否适合跑。证据清楚、风险可控、失败能停，就可以试。连“有没有进展”都说不清，就先把证据层补出来。

## 写在最后

/loop  好用的地方，不在于它多自动。

它更像把工程师日常里的碎片等待收起来：等测试、等部署、等评论、等队列、等外部状态。

以前这些等待挂在人脑里。我们记着它，隔一会儿切回去看，再决定下一步。

现在可以把其中一部分交给 Claude Code：

隔一会儿看一次。  
有变化告诉我。  
没变化短说。  
证据不够就别编。  
风险上来了就停。

这已经很有用。

先选一个小场景，写清状态、证据和停下来的条件，让它替你守几轮。跑顺以后，再把稳定流程沉到  loop.md  、Skill、Hook 或更持久的调度里。

这条路不炫，但更像真实工程。

## 参考资料

- • Anthropic Claude Code Docs：Run prompts on a schedule

https://code.claude.com/docs/en/scheduled-tasks
- • Anthropic Claude Code Docs：Keep Claude working toward a goal

https://code.claude.com/docs/en/goal
- • Addy Osmani：Loop Engineering

https://addyosmani.com/blog/loop-engineering/
- • Business Insider：Forget prompt engineering: 'Loop engineering' is all the rage now

https://www.businessinsider.com/what-are-loops-ai-engineering-tips-2026-6
- • Peter Steinberger：关于 coding agent 与 loop 的 X 讨论

https://x.com/steipete/status/2063697162748260627

如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享

·END·

```python
相关阅读：

- 架构排熵：Loop Engineering 的持续清理系统
- Claude Code 27 条实用技巧，快速升级
- 我终于搞明白了：Claude Code 为什么会忽略指令了
- Loop 工程实战：从任务循环到可维护闭环
- CLAUDE.md 拆解：Agent 进仓库前的上下文入口
- Claude、Codex、Mira 都在讲 Loop，架构师更该看什么
- 如何用 Claude Code 搭建自己的 AI 学习系统
- Anthropic CEO 核心访谈：AI时代，企业、职场与治理
- Loop详解：从ReAct到Loop Engineering，Agent到底在循环什么
- Harness工程还没唱罢，Environment工程已然登场
- 设计Self-Harness架构：会自我改进的Harness
- Fable 5 的信号：Agent 开始拼 Runtime
- Anthropic工程师：我们日常如何使用Claude Code

```

版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!

架构师

我们都是架构师！