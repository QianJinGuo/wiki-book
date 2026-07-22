---
source: wechat
source_url: https://mp.weixin.qq.com/s/l31X36Ptlj-lxsoGGVqbkA
ingested: 2026-07-15
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-07-15
sha256: 1a2caaf414ef01ebef7f62427f100f74a3e5bee5fc4f3817f09adb47d5418de4
---

# Anthropic 总算把 Loop 讲清楚了



架构师（JiaGouX）我们都是架构师！  
架构未来，你来不来？

  


* * *

Anthropic 这篇文章里，我更看重的是它把 Loop 从一个有点泛的概念，拆成了四种清楚的工作方式。

6 月 30 日，Claude Code 团队在 `Getting started with loops` 里给出一个很朴素的定义：Agent 重复执行一轮轮工作，直到满足停止条件。

回合式由人推动下一轮；目标式让完成条件决定停不停；定时式按固定时间再次启动；主动式则接过一段持续到来的工作。

这些做法都可以叫 Loop，差别主要在于人把哪一步交给了系统。

想象一下，周一早上，仓库里多了一张 PR。Agent 在夜里完成了依赖升级，修改版本号、更新锁文件、跑完测试，还把改动范围和验证结果整理进摘要。CI 是绿的。

从运行结果看，任务已经结束。可鼠标移到合并按钮附近，大家还是会慢下来：发布说明里是否有默认行为变化，现有测试能不能覆盖认证和数据库链路？如果上线后出问题，回退点在哪里？

这张 PR 看起来已经完成，团队却还不能放心合并。

**多跑几轮不难，难的是留下足够证据，让接手的人能快速复核，也清楚出问题怎么退。**

* * *

##  四类 Loop，差别在谁推动下一轮

四类 Loop 最简单的区别，是谁推动下一轮，以及人把哪部分控制权交了出去。

  
  
---  
Loop 类型| 怎么运行| Claude Code 里的对应能力  
---|---|---  
**回合式 Turn-based**|  用户的提示启动一轮；Claude 认为完成或需要更多上下文时停下，人检查结果并决定下一轮| 普通提示 + Skills 自检  
**目标式 Goal-based**|  人手动启动目标；目标达成或到达最大轮次时停下| `/goal`  
**定时式 Time-based**|  按约定间隔再次运行；人取消，或 PR 合并、队列清空等外部工作完成时停下| `/loop`、`/schedule`  
**主动式 Proactive**|  由事件或时间触发，无需人实时在场；单个任务达成目标后退出，Routine 本身持续到人关闭| `/schedule` + `/goal` \+ Skills + Dynamic Workflows + Auto mode  
  
  
图 1：四类 Loop 的触发方式与控制权对比

这里有两个容易混在一起的细节。`/loop` 跑在本机，电脑停了，循环也就停了；需要放到云端持续运行时，可以用仍处于 research preview 的 `/schedule` 创建 Routine。

主动式也不是某个单独指令。它更像一组能力的组合：定时或事件负责发现工作，`/goal` 定义单次任务怎样才算完成，Skills 记录验证方法，Dynamic Workflows（research preview）组织多个 Agent 协作，Auto mode 让 Routine 在无人实时在场时不会因每次权限确认而停下。

这四类能力可以组合，也不是从低到高的成熟度阶梯。官方的建议很克制：先用最简单的方案，确实需要时再增加复杂度。

依赖升级完全可以停在回合式：Agent 查版本、改代码、跑测试，人决定是否继续。只有当检查标准稳定、停止条件可验证、权限边界也清楚时，目标式、定时式和主动式才会带来额外价值。

Loop 越往后，人盯得越少，团队越要把目标、预算、权限和例外处理留在手里。

* * *

## 长任务不能只靠聊天记录

一条 Loop 跑几个小时，甚至跨过多次定时唤醒，聊天记录就不再是可靠的工作账本。接手的人需要知道当前做到哪里、哪些检查已经通过、还有什么没有验证。

我习惯把现场压成一条短链：
    
    
    目标 → 当前状态 → 已做动作 → 证据 → 权限边界 → 待人决策

放到团队流程里，这些信息会分别落在会话内的工作回路、会话外的状态与证据，以及最后的人工接手点。

  
图 2：一条 Loop 如何把执行、状态、证据和人工接手连起来

依赖升级的任务卡不必很长，大致写到下面这个程度就够用：
    
    
    SPEC：只升级依赖 X；公共 API、认证和数据库行为不变；最多 5 轮  
    STATE：当前版本、候选版本、已尝试路径、失败原因和下一步  
    EVIDENCE：测试命令与退出码、依赖树 Diff、发布说明中的风险项  
    IMPACT：可能受影响的服务、用户路径和运行环境  
    PERMISSION：可写独立分支和草稿 PR；不自动合并，不改生产配置  
    HANDOFF：为什么停止，哪些风险未覆盖，需要谁做什么决定

这不是 Claude Code 的官方格式。对应信息可以落在 Issue 字段、状态文件、CI、PR 模板和 Runbook 里，不需要另造一套平台。

检查标准也不宜凭空编。我的做法是抽几张近期的依赖升级 PR，看 Reviewer 先读什么、搜索哪些调用点、为什么拒绝改动，最后靠什么证据合并。重复出现的动作写进 Skill 或脚本；个人偏好先留在人工评审里。

第一版 Skill 不用写很多。测试命令、退出码、必须查看的 Diff，以及命令无法执行时怎样记录阻塞，比“仔细检查兼容性”更能约束 Agent 的行为。

第二天接手时，我一般先看状态和证据，再看 Diff 与未决项，自然语言总结放到最后。如果只剩一句“已经完成”，复核成本只是从夜里的 Agent 转到了早上的工程师。

返工原因还需要写回系统。某类 PR 如果总因许可证、默认配置或公共接口变化被拒绝，这些信息应进入下一版规格、Skill 或检查脚本。否则 Loop 只是更快地重复同一种返工。

* * *

## CI 绿了，还不能直接合并

**一张 PR 全绿，只能说明已配置的检查通过了。**

Claude Routines 目前仍处于 research preview，行为、限制和 API 仍可能变化。官方文档还专门提醒：运行列表里的绿色状态，只说明会话启动并退出时没有基础设施错误，不代表提示里的业务任务已经成功。

`/goal` 也有类似边界。它会在每轮结束后调用一个独立评估器检查目标，但评估器不会自己运行命令，也不会独立读取文件。它只能看到 Claude 已经放进对话记录里的证据。

对依赖升级来说，我更希望拿到一份可以直接复核的证据包：

  * • 跑过哪些单元测试、集成测试、构建和静态检查，退出码是什么；
  * • 服务能否启动，认证、数据库或关键调用链路有没有做过最小烟雾测试；
  * • 公共 API、依赖树、默认配置和发布说明里有哪些需要重点看的 Diff；
  * • 哪些环境没有跑，哪些路径还没覆盖，出问题时准备怎样回退。

CI 往往只覆盖第一项。后面几项没有单独准备，绿色状态仍可能漏掉默认行为变化、运行环境差异和公共契约破坏。

再加一个 Reviewer，通常能补一个新视角，执行者和审查者分开也比自写自审稳。但两个 Agent 仍可能读到同一份错误规格，也可能一起漏掉真实用户场景。

多一个 Reviewer 能降低偏差，证据仍然少不了。团队最终接收的是一组能复核、能说明边界的结果。

* * *

## 放多少权，先看错误能扩散多远

四类 Loop 没有高低之分。产品方向、架构取舍和核心不变量需要人持续补上下文，有些任务长期留在回合式交互里反而更合适。

放权时，我先看副作用。Worktree 隔离文件改动，Sandbox 限制进程能访问什么，权限和 Hook 决定哪些动作可以执行，Checkpoint 主要负责撤回本地编辑。它们管的是不同边界，数据库、外部系统和远端写入仍要单独准备回滚。

无人值守时，我还会多看一条组合风险：不可信外部输入、敏感数据和对外写操作，最好不要同时出现在同一个会话里。

依赖发布说明、Issue、网页和外部日志都可能包含不可信输入。如果同一个 Agent 还能读取云凭据、生产日志或客户数据，并且可以 push、发消息、写数据库，几项普通能力就连成了一条完整风险路径。更实在的处理是拿掉其中一项能力，或者把读取、修改和发布拆到隔离环境与人工闸门两侧。

实际推进时，我通常先让 Loop 只读运行，观察它的判断和证据。稳定后再开放独立分支与草稿 PR。自动合并、生产写入和客户外发放得更晚，必要时一直留在人手里。

Armin Ronacher 对 Loop 的谨慎也来自这里。他认可代码迁移、性能实验、安全扫描和研究，因为这些任务通常有机械验证，或者产物不需要长期维护。到了核心代码，局部防御和补丁可能在循环里一层层累积，系统看起来更稳，人却越来越难解释它为什么这样设计。

模型能做多少是一回事。团队愿意交出多少权，主要还是看错误会扩散多远，出问题后能不能恢复。

* * *

## 第一条 Loop，可以这样试

起点可以很小。文档漂移、CI 失败分类、依赖升级预检查和发版前核验，都比生产配置修改更容易看清收益与风险。

试跑时，每一步都先看证据质量和接手成本，再决定要不要往前放权。

  
图 3：从人工复盘、影子运行到有限自动化的试跑流程

先拿几次真实任务复盘人工流程，把稳定出现的检查写进 Skill。少写“仔细检查”这类空话，直接给命令、退出码、需要查看的 Diff，以及无法验证时怎样记录阻塞。确定性检查能脚本化，就不必让模型反复判断。

接着跑一段影子模式。Agent 读取相同输入并给出结果，人工仍按原流程处理。这个阶段重点看有效发现、误报和漏报，也看 Reviewer 要花多久才能接收一份结果。

结果稳定后，再允许它在独立 Worktree 里生成 Diff 或草稿 PR。团队熟悉了失败方式、成本和停止原因，再加入 `/goal`、定时触发或有界写入。合并、外发和生产动作可以继续留给人。

目标仍在频繁变化、验收主要依赖业务取舍，或者会修改生产数据和客户状态的任务，我暂时不会放到长期无人值守里。这条边界很难一次写准，影子运行正好用来暴露缺口。

如果 Agent 忙了一夜，工程师第二天还要花一上午还原它做过什么，自动化只是把工作换了一个地方堆起来。

* * *

## 一条 Loop，最后还是要有人接手

Anthropic 这次把 Loop 讲清楚了。四种类型的触发方式不同，人交出去的控制权也不同。

Agent 可以替人推进下一轮、按时再检查，甚至主动接过一段工作。团队仍要决定什么证据算通过，哪些权限不能放，遇到例外时由谁接手。

回到开头那张依赖升级 PR。我宁可它停在草稿状态，也希望它把改动、证据、未覆盖风险和回退方式留清楚。

到这里，我会把成熟的 Loop 理解成一份可运行的交接协议。该继续时继续，证据不足或超出权限时，把问题交还给人。

**第二天接手的人能在几分钟内决定继续、合并还是停止，这条 Loop 才算进入了团队流程。**

* * *

##  参考资料

  * • Claude Blog：`Loop engineering: Getting started with loops`  
https://claude.com/blog/getting-started-with-loops
  * • Claude Code Docs：`Keep Claude working toward a goal`  
https://code.claude.com/docs/en/goal
  * • Claude Code Docs：`Automate work with routines`  
https://code.claude.com/docs/en/routines
  * • Addy Osmani：`Loop Engineering`  
https://addyosmani.com/blog/loop-engineering/
  * • Armin Ronacher：`The Coming Loop`  
https://lucumr.pocoo.org/2026/6/23/the-coming-loop/
  * • Andrew Ng：`Three Key Loops for Building Great Software`  
https://www.deeplearning.ai/the-batch/three-key-loops-for-building-great-software
  * • LangChain：`The Art of Loop Engineering`  
https://www.langchain.com/blog/the-art-of-loop-engineering

## 往期相关

  * • 《[Claude Code 团队的真实难题：20 个 Agent 之后，谁来验证和接手](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409776&idx=1&sn=b6d6fa96502cfdc093c21841a568daaf&scene=21#wechat_redirect>)》
  * • 《[Claude Code 官方 Loop 分层：从自检到无人值守的四档控制权](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409783&idx=1&sn=5918e0b172ee017038afc208b2871bf9&scene=21#wechat_redirect>)》
  * • 《[Anthropic 四类 Loop：交出去以后，怎么确认真的完成](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409760&idx=1&sn=46714257a03ff78001a2e4eebea13520&scene=21#wechat_redirect>)》
  * • 《[Claude Code 写得越快，越要把错误控制在可回滚范围内](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409814&idx=1&sn=d5e014689e852f6dd340bdea7cc110ab&scene=21#wechat_redirect>)》

 

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
