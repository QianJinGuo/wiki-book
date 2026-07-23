---
source: wechat
source_url: https://mp.weixin.qq.com/s/Jt3YDLxcygO7xO0B2IOdjw
ingested: 2026-07-23
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-07-18
sha256: 2723f49a3fef62233c29c64225571c9a3f6917bca861e2e2f5f13e5b186be39d
---

# Loop Engineering，应该赞成还是反对？

架构师（JiaGouX）我们都是架构师！  
架构未来，你来不来？

  


  


* * *

凌晨两点，一条 Sentry 告警触发了 Routine。

Agent 读取错误日志和最近提交，在隔离分支里复现问题，修改代码，运行测试，最后开出一张草稿 PR。早上工程师接手时，告警原文、复现步骤、Diff、测试结果和回退方式都在。

如果它处理的是一处低风险回归，这条 Loop 很有价值。值班工程师不用守着每次工具调用，第二天也能快速复核。

可一旦改动碰到数据库结构、认证策略或生产配置，问题就变了。即使测试通过，系统也未必有资格继续往下走。

同一个场景，既能说明 Loop Engineering 为什么有价值，也能解释争议从哪里来。决定差异的是系统把哪些权力交了出去。

我们此前谈“先写刹车”和反馈契约，解决的是 Loop 怎么停、怎样留下证据、怎样把现场交给人。这一次再往前走一步：什么样的 Loop 值得支持，什么样的设计已经越过了边界。

**我的态度是有条件地赞成。低风险、可验证、容易回滚的工作，可以尽量交给 Loop；目标、证据、权限和规则晋升，不能由同一个闭环自行决定。**

* * *

##  赞成者看效率，反对者看责任

支持 Loop Engineering 的工程师，看到的是工作方式的变化。过去人要不断补 Prompt、读结果、推动下一轮；现在可以把触发、状态、验证和重试写进系统，让 Agent 自己消化重复工作。

反对者担心的是另一件事：触发和验证都自动化以后，人会不会慢慢失去独立看法，最后只剩下一次形式上的批准。

这两种担心都说得通。只是“人是否实时在场”和“人是否仍掌握系统”，需要分开看。

一张 600 行的 PR，摘要写得完整，CI 全绿。Reviewer 打开 Diff，扫过几个文件，看到命名正常、测试也过了，于是点下批准。

流程上有人审核，实际发生了什么并不好说。他可能已经核对关键不变量，也可能只是相信了 Agent 的总结。

Addy Osmani 把后一种状态称为 Cognitive Surrender，认知投降。人没有形成自己的看法，AI 给出的答案直接成了他的答案。这和把查文档、补样板代码、跑测试交给 AI 不同。后者只是省掉执行，人仍然知道自己为什么接受这个结果。

Addy 并没有主张把人移出工程过程。他认为工程师会从逐轮提示转向设计系统，同时写得很明确：

> Verification is still on you.

工程师的工作会变化，验证和理解仍然要有人负责。

Wharton 的 Steven D. Shaw 和 Gideon Nave 做过三项预注册实验，共有 1,372 名参与者、9,593 个试次。在 AI 已经介入并给出错误建议的试次里，**73.2%**  的参与者跟随了错误答案，只有 **19.7%**  成功推翻 AI 并答对。AI 还提高了参与者的信心，包括他们答错的时候。

这不是软件工程实验，不能拿来证明 Coding Agent 会让工程师退化。它能说明的范围更窄：保留一个人工确认按钮，并不足以保证独立思考仍然存在。

Anthropic 另一项随机对照实验更接近编程场景。52 名主要为初级的软件工程师学习一个不熟悉的 Python Trio 库，AI 组在任务后的测验中平均得分 **50%** ，手写组是 **67%** ，最大差距出现在调试题。AI 组平均只快了约两分钟，效率差异没有达到统计显著。

参与者怎么使用 AI，和结果也有关系。把编码、排错逐步交出去的人，测验成绩普遍偏低；先生成代码、再追问原理，或者只问概念后自行实现的人，理解得更好。

样本不大，测的也是任务结束后的即时理解。我对“长期使用 AI 必然造成技能退化”这种结论仍然有保留。但在陌生领域里，理解本身就是交付物。只看任务有没有完成，会漏掉团队以后排障、评审和接手所需要的能力。

是否有人守在屏幕旁，无法单独说明工程师还掌握着系统。还要看这项工作需要团队保留多少理解。

这里的“保留理解”，也不等于让每个人逐行读完所有生成代码。更现实的要求是，团队里至少有人能说明这次改动依赖哪些不变量，测试没有覆盖什么，线上异常出现后该从哪里查起。核心模块还应留下取舍记录和回退条件，不能只留下一个通过评审的提交记录。

不同任务对理解的要求并不一样。机械迁移更关注行为是否等价；支付、认证、权限这类长期模块，还要求维护者知道设计为什么这样取舍。把这层差异写进任务准入条件，人工评审才不会退化成统一的“看一眼 Diff”。

* * *

## 哪些任务适合进入 Loop

Anthropic 最近公开了一组大规模代码迁移实践。按其披露的数据，Jarred Sumner 用 Claude Code 把 Bun 从 Zig 迁移到 Rust，不到两周生成约一百万行代码。合并前，原有测试在 CI 中全部通过；上线后仍然发现了 **19 个回归问题** ，目前都已修复。

另一项迁移把一个 Python 代码库改写成 16.5 万行 TypeScript。整个过程用了数百个 Agent、八道阶段闸门、三轮对抗式评审，最后逐条比较新旧版本的命令输出。

这些是厂商案例，数字需要谨慎看待。Bun 迁移按 API 定价估算约花费 16.5 万美元，普通团队很难照搬。但它确实把“什么任务适合 Loop”说得相当具体。

代码迁移有现成参照物。旧系统提供行为规格，文件可以拆开并行处理，编译器和测试负责判错，失败记录可以直接进入下一轮队列。Agent 中断后，进度也能从文件和任务状态中恢复。模型能力决定上限，这些工程条件决定 Loop 能不能连续运行。

迁移开始前，人投入的工作反而最多。团队要先决定新系统的结构，写迁移规则，梳理依赖和例外，再用一个小批次故意攻击这些规则。试跑产出的代码可以全部丢掉，留下经过修正的流程。等到裁判和规则比较稳定，Agent 才开始大规模处理机械队列。

这里的 Judge 也不是随便再放一个评审 Agent。官方做法是让同一套验证同时检查新旧系统，再拿故意破坏的实现确认它确实能判错。一个永远给出“通过”的评估器，对长时间 Loop 反而更危险。

执行阶段也没有逐文件手工救火。同一种错误反复出现时，团队先修改迁移规则，再重新生成受影响的批次。昂贵的全量构建则交给唯一的 Build Daemon 串行处理，避免多个 Agent 同时触发重复编译。Loop 跑得快，依然需要并发控制、共享资源调度和可恢复状态。

这个案例里有个细节我很在意：测试全部通过以后，生产环境仍然暴露了 19 个回归。机械验证很重要，它只能覆盖团队已经表达出来的预期。真实用户和生产环境总会带回一些慢得多的反馈。

决定放多少权之前，我通常先看四件事：目标是否清楚，结果能否独立验证，做错后能否低成本撤回，以及团队以后是否还要长期维护这部分知识。

Prompt 写得足够长，也不代表目标已经清楚。系统要能从外部信号判断结果，例如编译错误是否消失、新旧输出是否一致、性能指标是否越过阈值。只能由 Agent 自己解释“效果更好”的任务，距离无人值守还很远。

可逆性也不能只看 Git 能否回退。代码提交可以撤销，已经发出的消息、写入的生产数据、触发的部署和泄露的凭据未必能跟着恢复。只要 Loop 能产生这类副作用，最终动作就单独设闸门。

这四个条件放在一起，结论通常会落到三种状态。

图 1：四个条件对应三种 Loop 处理方式

这不是三档永久授权。任务刚开始时，人可能需要参与每一轮；规则稳定后，可以退到结果评审；输入来源、工作范围或权限一旦变化，再回到前一档重新验证。

开头的 Sentry 修复更接近中间一档。复现、改代码、跑回归测试都能自动完成，草稿 PR 也容易撤销；合并以后是否触发部署、是否改变数据和权限，后果明显更大，交给人决定更稳妥。

* * *

## 控制面要写进运行协议

人的位置上移以后，很多决定不能继续留在聊天里。

控制权也不必一次性交完。开头那条 Sentry Loop 可以拥有分支内的检查权和继续权，Routine 可以按告警触发；合并、发布和生产处置继续留给值班工程师。把检查、继续、触发和最终处置拆开，团队才有空间逐步放权。

Anthropic 最近对 Routines 和 Dynamic Workflows 的两处调整，正好把这个边界写进了运行时。外部系统传给 Routine 的文本会被包在 `routine-fire-payload` 中，并标记为不可信数据。它可以提供告警内容，却不会自动获得指令权。

`ultracode` 的触发也被收紧了。定时任务、Webhook、PR 评论，以及没有标记为人类输入的 SDK 消息，都不能因为包含这个关键词就启动大规模 Agent 工作流。谁有资格把一段普通文本升级成一次高成本、高权限执行，现在被写进了运行时。

这两处改动影响的是触发权和权限边界。告警、Issue 和 PR 评论都可能混入提示注入内容。如果读取外部文本的 Agent 同时持有 **仓库写权限、生产凭据和外发能力** ，一段普通输入就可能穿过整条执行链。把输入当数据、把高风险动作单独审批，可以直接截断这条路径。

把开头的 Sentry 场景展开，控制面大致是下面这条链路。

  
图 2：Sentry Loop 的控制面与人工闸门

回到开头那条 Sentry 告警。一份能落地的运行协议不需要很长，但至少要把下面几件事写实：

> **目标** ：复现同一错误，提交最小修复，让复现用例和现有回归测试通过。
> 
> **禁区** ：不改数据库结构、认证策略、公共 API 和生产配置。
> 
> **通过条件** ：修复前能稳定复现，修复后用例通过，完整测试命令与退出码可查。
> 
> **停止条件** ：连续两轮没有新增证据，失败范围没有缩小，或者预算达到上限。
> 
> **交接内容** ：告警原文、根因假设、Diff、验证结果、未覆盖风险和回退方式。

目标和禁区先卡住改动范围。接下来只看证据，不接受一句含糊的“已经修好”。如果 Agent 连续两轮没有缩小问题，就停下来；工程师接手时，也不用重读整段会话。

证据包里，原始结果应放在摘要前面。命令、退出码、测试报告和关键 Diff 由人直接复核，模型总结只负责索引。这样即使会话丢失、更换模型，或者接手者不相信原来的结论，现场仍然能够还原。

`/goal` 也有一个容易误解的地方。它会用独立评估器检查停止条件，但 **评估器不会自己运行命令，也不会重新读取仓库，只能根据会话中已经出现的证据判断** 。如果执行 Agent 没有把原始结果带进来，换一个模型判定完成，也不能把缺失的证据补出来。

执行者也不适合独自决定自己是否完成。编译、测试、静态检查和新旧行为对比，尽量交给独立脚本。需要模型评审时，也要让评审者使用独立上下文，并把原始证据交给人。只留一句“检查通过”，接手者仍然无法复核。

到这一步，控制面才从聊天里的约定，变成运行前可检查的协议。触发者、可修改范围、继续条件、停机条件和交接内容，都有明确位置。

* * *

## 执行循环可以快，规则变更要慢

Loop 运行一段时间后，迟早会碰到另一个问题：它发现现有规则不好用，能不能顺手修改 Prompt、Skill、评估器和权限？

让 Loop 把失败经验写回规则，确实能减少重复修补。迁移案例里，同类错误反复出现时，修改规则比逐文件打补丁更有效。我们此前讲反馈契约时也提过，失败经验要进入下一轮，不能永远停在一次会话总结里。

麻烦在于，让执行 Agent 自己改规则，它就可以修改评估标准，再用新标准证明自己完成，闭环会越来越容易通过。权限也一样，不能因为“当前权限不够”就自动放宽写入范围或提高预算。

规则修改最好按普通软件变更来管。Agent 可以提交候选版本，并说明它解决了哪些失败样本；候选规则要跑固定回归集，不能让原本正确的任务退化；涉及权限和预算的变化，再由人单独批准。新版本上线后还要保留旧版本，出现漂移时能快速退回。

于是，执行 Loop 和改进 Loop 被分开管理。前者可以高频运行，后者经过证据、回归和版本管理再晋升。

**执行 Loop 可以快，规则变更要慢。**

* * *

##  上线时，先少放一点权

一条 Loop 刚写好时，我不会直接让它接管线上流程。比较稳的路径通常分四步。

  
图 3：从人工复盘到有限自动化的上线流程

  


  


  1. 1. **复盘人工流程。**  抽几次近期任务，记录工程师先查什么、跑哪些命令、为什么拒绝某个修改。重复出现的确定性动作再写进脚本或 Skill。
  2. 2. **跑影子模式。**  Agent 读取同样的输入并给出结果，但不产生真实写入。这个阶段关注有效发现、误报、漏报，以及 Reviewer 接收一份结果需要多久。
  3. 3. **只开放候选结果。**  Agent 可以在独立工作区修改代码、运行测试、开草稿 PR。合并、发布、外发消息和生产写入继续由人批准。
  4. 4. **再开放低风险动作。**  等任务边界稳定、接手成本持续下降后，再让它自动完成可回滚的操作，同时保留抽样审计和降级开关。

输入来源、工作范围或权限只要发生变化，就回到影子模式。Loop 的授权要能升也能降，不能做成一次审批、长期有效。

相比 Agent 一晚上开了多少张 PR，影子运行阶段更值得看的是人接手一份结果要花多久。误报会消耗注意力，漏报会制造虚假的安全感；如果 Reviewer 还得重读完整会话才能确认结果，说明证据包没有真正降低接手成本。

上线后的指标也不宜只看完成量。任务最终是成功、失败、超时，还是因为没有进展而停止，需要分别记录。

人工接手以后改了多少内容，也能反映证据和工作边界是否可靠。同一类问题如果反复升级给人，就修规则、补测试或收窄工作域，继续增加轮数通常没有意义。

这套过程不追求“尽快无人值守”。它先验证两件更朴素的事：Agent 留下的证据能不能让人快速复核；出了问题，团队能不能在不依赖原会话的情况下停止并恢复。

* * *

## 写在最后

Loop Engineering，应该赞成还是反对？

**我的答案是有条件地赞成。**

我支持把边界清楚、可以验证、容易回滚的工作交给系统，也愿意让 Agent 处理重复失败、维护状态并生成候选结果。

另一类闭环不该进入生产流程：Agent 自己定义目标、挑选证据、扩大权限、修改规则，最后再宣布完成。末尾补一次人工批准，也很难补回已经丢失的理解和责任。

Addy 在原文结尾写了一句：

> Build the loop. Stay the engineer.

我理解的“Stay the engineer”，不是守在屏幕前确认每一步。工程师要知道系统为什么继续，也要能在几分钟内看清它做了什么、哪些地方没有验证、出了问题怎样退回去。

落到工程里，最终还是沿着任务范围一层层放权，并保留随时收回的能力。

如果一条 Loop 还做不到这些，让它停在草稿 PR，并不丢人。

* * *

## 参考资料

  * • Claude Blog：Loop engineering: Getting started with loops：https://claude.com/blog/getting-started-with-loops
  * • Claude Blog：How Anthropic runs large-scale code migrations with Claude Code：https://claude.com/blog/ai-code-migration
  * • Anthropic Research：How AI assistance impacts the formation of coding skills：https://www.anthropic.com/research/AI-assistance-coding-skills
  * • Steven D. Shaw、Gideon Nave：Thinking Fast, Slow, and Artificial：https://doi.org/10.31234/osf.io/yk25n_v1
  * • Claude Code Docs：Automate work with routines：https://code.claude.com/docs/en/routines
  * • Claude Code Docs：Orchestrate subagents at scale with dynamic workflows：https://code.claude.com/docs/en/workflows
  * • Claude Code Docs：Keep Claude working toward a goal：https://code.claude.com/docs/en/goal
  * • Addy Osmani：Loop Engineering：https://addyosmani.com/blog/loop-engineering/
  * • Addy Osmani：Cognitive Surrender：https://addyosmani.com/blog/cognitive-surrender/
  * • Addy Osmani：Comprehension Debt：https://addyosmani.com/blog/comprehension-debt/ 

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