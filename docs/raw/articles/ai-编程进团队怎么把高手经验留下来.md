---
source: wechat
source_url: https://mp.weixin.qq.com/s/VNT0aw7hTaQskq1VnolBFQ
ingested: 2026-07-10
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-07-09
sha256: 0d2edb9ef258ec92f4229eb0865ff9e4265c1088410f3cea7af549627733bf53
---


# AI 编程进团队，怎么把高手经验留下来？

架构师（JiaGouX）我们都是架构师！  
架构未来，你来不来？

  


* * *

这两个月和几个产研团队聊 AI 编程，一个感受越来越明显：大家已经不太纠结“要不要用 AI”了，真正头疼的是另一件事。

同样是 Claude Code、Codex、Cursor Agent，有的人越用越顺，能把 AI 放进真实需求、代码、测试和发布链路里；换到团队里，却常常很难复制。

一开始，大家很容易把差异归到提示词。

但把几份真实任务摊开看，会发现差异往往在提示词之外：谁知道材料该从哪里补，哪些风险不能交给模型判断，结果要留下什么证据，失败经验又该写回哪里。

我后来更愿意用一个朴素词：**工序** 。

对，工序。就像流水线上的工人一样。。。

**AI 编程进团队以后，真正要沉淀的不是一堆漂亮提示词，而是一段段可复用、可检查、可修剪的 Agent 工序。**

平台、编排、多 Agent、Skill、Routine 都重要，但它们只是承载形态。

高手脑子里的那些动作，如果不能写成团队能复用的工序，最后还是个人能力。工具越强，这个差距有时还会被放大。

* * *

## 先给结论：别把高手只留在个人脑子里

  * • 团队里 AI 效果差异大，通常不只是模型和提示词的问题，更是**隐式工程经验没有被留下来** 。
  * • 所谓“把高手经验蒸馏成 Agent”，不是复制一个虚拟岗位，而是把高手稳定会做的动作拆成一段段可运行的工序。
  * • 高手真正多出来的，往往在提示词前后：补上下文、切边界、设停止点、验 diff、留证据、回写规则。
  * • 一道 Agent 工序要说清楚：什么时候进来，读什么材料，做哪些检查，遇到什么停，输出什么证据，谁来确认。
  * • 早期不要急着做大平台。更稳的做法是找一个返工高发点，影子跑 30 天，看看它能不能提前暴露真实遗漏。
  * • 价值别只看“省了几小时”。更值得看的是：评审有没有更聚焦，返工有没有提前，交接有没有更清楚，经验有没有进入下一轮。

图 1：高手经验怎么变成团队 Agent 工序

* * *

## 提示词只是入口

很多团队做 AI 落地，第一步会收集提示词。

“需求分析 Prompt”“架构师 Prompt”“测试用例 Prompt”“代码 Review Prompt”，很快就能攒一大堆。

这些东西当然有用。提示词是入口，入口写清楚，模型少猜一点。

但只收提示词，很容易漏掉最值钱的部分。

提示词通常记录的是“向模型说了什么”。高手经验更大的部分，是他说这句话之前做了什么，以及模型回答之后他怎么验。

图 2：提示词库和 Agent 工序的差别

一个用 AI 很顺的人，拿到模糊需求时，通常不会直接丢给模型写代码。他会先看需求改了哪条业务链路，哪些历史兼容不能破，哪些数据口径不能变，哪些地方需要人来拍板。

他让 AI 动手前，会补齐上下文：相关接口、旧系统约束、灰度方式、测试命令、团队代码风格、过去踩过的坑。

他看到 AI 输出以后，也不会只看“能不能跑”。他会看 diff、跑测试、查日志、模拟真实路径，必要时把失败原因写回规则、脚本、Skill 或检查清单。

这些动作看起来顺手，其实都来自工程经验。

如果这套经验只留在一个人的脑子里，新人学不到，普通成员复用不了，负责人也很难判断一份 AI 产物到底靠不靠谱。

团队最后会变成少数人越用越强，其他人越用越谨慎。

AI 没有变成团队能力，只是变成了少数人的个人工具。

* * *

## 先看工作痕迹

我更建议先做一件笨事：看工作痕迹。

抽几份真实任务，沿着对话记录、diff、文档改动、Review 记录往回看。

看他什么时候补上下文，什么时候让 AI 停下来；看 AI 改了什么，人又改了什么；也看 reviewer 追问了什么，最后靠什么收口。

这一步不用做得很重。

它更像一次轻量复盘：找出某类高频任务里，哪些动作每次都要做，哪些材料每次都要补，哪些证据每次都要留下。

比如需求评审前，稳定的人可能每次都会扫这几类问题：

  * • 角色有没有漏；
  * • 异常流程有没有写；
  * • 权限和状态有没有闭环；
  * • 埋点、运营配置、客服口径有没有被忘掉；
  * • 影响范围是不是牵到了计费、履约、风控或历史数据。

这些动作如果只靠老同事临场提醒，就会很脆。

一旦写成工序，Agent 就可以先跑一遍，把遗漏和待确认项提前摆出来。人不用把判断权交出去，只是把低层筛查和证据整理交给它。

**这里的关键不是让 AI 替人判断，而是让团队少靠临场记忆。**

* * *

##  一道工序要写清什么

拿“需求完整性检查”举例。

它不负责替产品负责人决定业务优先级，也不负责直接改需求范围。它只做一件窄事：在需求评审前，把遗漏、矛盾和待确认项尽量提前暴露出来。

落成团队文档时，可以先用一句话收住：
    
    
    当 PRD 准备进入评审时，Agent 读取 PRD、原型、历史需求和领域规则，只检查遗漏、矛盾和待确认项；遇到优先级、范围取舍和材料不足时停止，由产品负责人和技术负责人确认。

再展开一点，也不需要写成长篇手册：
    
    
    名称：需求完整性检查  
    进入条件：PRD 或原型已成稿，准备进入评审  
    输入材料：PRD、原型、历史需求、领域规则、埋点口径、相关客服反馈  
    Agent 动作：检查角色、主流程、异常流程、权限、状态、验收条件、埋点和运营配置  
    停止条件：材料不足时列出缺口；遇到业务优先级和范围取舍时停止，不替人决策  
    输出产物：遗漏项、矛盾点、待确认问题、建议补充材料  
    人工确认：产品负责人和技术负责人确认哪些要改，哪些接受风险  
    回写方式：高频遗漏进入 PRD 模板、评审清单或 Skill

图 3：一道 Agent 工序的最小闭环

这段看起来很普通，价值也在这里。

它把任务入口、输入材料、停止点、确认人和回写路径放在同一张纸上。Agent 进来以后，不需要靠通用常识猜业务；遇到材料不足、范围取舍、优先级判断，也知道停在哪里、找谁确认。

一次发现也不会只停留在一次回答里。高频遗漏能写回 PRD 模板、评审清单或 Skill，下一次就少靠人临场记着。

如果把它放到工具里，也别急着先选平台形态。

它可以是 Codex 的 `/goal`，也可以是 Claude 的 routine，还可以先是一份 Markdown 检查表。形态不急，先问一句：**它到底承载了哪一道工序？**

如果工序没写清，工具越强，越容易把模糊问题跑得更远。

* * *

## 上游更值得先跑

AI 编程火起来以后，大家最自然的反应是让 AI 多写代码。

代码最可见，反馈也快。函数能不能跑，测试过不过，PR 能不能合，结果相对明确。

但从产研链路看，很多团队更该先沉淀上游工序。

因为上游偏差会一路放大。

需求边界没想清楚，开发阶段写得越快，返工也可能越快。影响范围没扫出来，做到一半才发现牵到权限、数据、计费、履约或风控，成本会明显变高。验收条件没写清，测试和 Review 只能靠各自经验补洞。

[吴恩达讲三层 Loop 时](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409738&idx=1&sn=c94cd8342fd7f73ccda814d2812215c7&scene=21#wechat_redirect>)，有一个点我很认同：编码循环会越来越快，但开发者反馈和外部反馈仍然慢。越是这样，规格、验证和真实反馈越不能缺位。

挑第一批 Agent 工序时，可以先看四个条件：

**重复发生，输入能收集，输出能审查，失败半径可控。**

按这个标准，早期可以优先试这些场景：

  * • 需求完整性检查；
  * • 架构影响范围初筛；
  * • 测试点补全；
  * • 发布风险检查；
  * • 事故或返工后的规则回写。

它们不一定“酷”，但足够贴近真实团队。

这些任务边界相对清楚，结果能被人检查，失败成本也比较容易控制。Agent 先负责把遗漏提前暴露出来，人再负责取舍和决策。

这比一上来让 Agent 接管完整开发链路稳得多。

* * *

## 角色先当视角

“产品经理 Agent”“架构师 Agent”“测试 Agent”这些名字很诱人。

但我会收着点用。

一旦把它们想成完整岗位，团队很容易期待它们自己理解目标、自己组织流程、自己判断边界，最后还自己输出结论。

这对早期落地不友好。

更可控的方式，是把角色 Agent 看成一道工序里的检查视角。

产品视角看需求缺口。

架构视角看影响范围和系统约束。

测试视角看边界、异常和覆盖。

安全视角看权限、数据和外部输入。

它们更像产研链路里的固定质检点，不适合一开始就当成一组虚拟同事。

两者要分清。

虚拟岗位容易越界，固定质检点更容易验收。一个角色化工作单元到底发现了多少真实遗漏，误报多少，漏报多少，是否减少了评审时间，可以被记录下来。

如果一个角色 Agent 连一道窄工序都跑不稳，先停在单工序里打磨，反而更踏实。

* * *

## 价值看返工

很多 AI 试点喜欢统计节省了多少时间。

这个指标可以看，只看它会偏。

产研团队里，一个 Agent 很快生成一份需求检查报告，如果里面都是泛泛而谈，评审没有更聚焦，返工没有提前，交接也没有更清楚，它就不算真的有价值。

我会先看现场有没有变化。

评审前，过去拖到开发、测试、上线才暴露的问题，能不能提前摆出来。

评审时，会议是不是少花时间重新解释背景，更多时间讨论关键取舍。

交接时，下一个人能不能快速知道当前输入、已检查内容、未决问题和负责人。

最后看回写。

这次发现的问题，如果进不了模板、Skill、脚本、CI 门禁或 Review 清单，下次大概率还会再犯。

这些变化未必一开始就能精细量化。早期人工打标也可以。

这里最容易误判的是“AI 产出了更多材料”。材料变多不等于团队变稳。

**一套跑得住的 Agent 工序，会让关键问题更早出现，让人的判断更集中，让经验更容易留下。**

* * *

##  先跑 30 天

如果团队要试，我会先避开平台化。

拿一个返工高发点跑 30 天就够了。

先选最近三个月反复返工、反复争论、反复漏信息的地方。可能是需求评审总补材料，也可能是方案评审总漏依赖，还可能是上线前才补回滚和监控。

再找三到五个真实任务，看做得稳的人怎么处理：他先问了什么，补了哪些上下文，让 AI 做了哪一段，自己又改了哪里，reviewer 最后追问了什么。

然后写成一页小工序，先影子跑。

同一份需求，人按原流程评审，Agent 按工序跑一遍。先不把结果接入正式流程，只看它发现的问题有多少是真的，有多少是噪音，有哪些人没想到但确实有价值。

如果影子模式稳定，再小流量接入低风险流程。

早期节奏可以很克制：

**读多、写少、证据清楚、人工确认。**

到月底只做一件事：修剪。

没命中的检查项删掉，误报太多的规则降级，适合脚本和 CI 的工作交给确定性工具，高频有效的经验再写回模板或 Skill。

工序不是写完就完事。

不修剪，它很快会变成另一种旧 Wiki。

* * *

## 留住边界

并非所有高手经验都值得标准化。

有些做法来自具体人、具体项目、具体历史包袱。照搬到团队里，可能会把个人偏好变成组织规则。抽工序时要保守一点，只沉淀那些重复出现、可验证、能解释、对团队有复用价值的动作。

Agent 提了建议，也不代表决策已经成立。

需求范围、技术方案、权限、数据、安全、上线这类问题，最后仍然要有人负责。Agent 可以把问题提前摆出来，但不能替团队承担责任。

新人只会跑工序也不够。

工序能降低下限，但不能替代成长。新人沿着工序做事时，也要逐渐理解为什么这样检查，哪些地方还要自己判断。否则团队会得到一批很会操作流程、但不理解系统的人。

还有一个很实际的边界：Agent 工序很容易变成材料生产机器。

AI 很擅长生成看起来完整的文档。完整不等于有效。如果一套工序只是让需求报告更长、评审材料更多、会议更满，它就跑偏了。

它要减少返工，少制造阅读负担。

* * *

## 最后

AI 编程进团队以后，工具、模型和平台都会继续升级。

但我越来越觉得，真正拉开团队差距的，未必是“谁先拥有一个多 Agent 系统”。

更朴素一点，是谁能把少数高手做事时那些隐形动作留下来：他怎么澄清问题，怎么补上下文，怎么判断风险，怎么验收结果，怎么把经验写回下一次。

这些过去靠人带人、靠长期磨合形成的东西，现在需要多一层机器可读、可运行、可检查的表达。

这就是我理解的 Agent 工序。

它没有“多 Agent 系统”听起来热闹，但更接近团队日常。

个人会用 AI，可以快很多。团队能把 AI 用稳，靠的是把隐式经验变成显式工序，把一次成功变成可复跑的方法，把“差不多做完了”变成 **输入、过程、证据和接手人都清楚** 。

AI 原生团队不一定是每个人都变成 AI 高手。

更现实的目标是：普通成员也能沿着一条清楚的工序，把任务交给 AI、检查 AI、接手 AI，并把经验留给下一轮。

做到这一步，团队的下限才会慢慢往上走。

* * *

## 参考资料

  * • Addy Osmani：`Loop Engineering`[1]
  * • Omar / DAIR.AI：`From Prompting Agents to Loop Engineering`[2]
  * • Claire Vo / ChatPRD：`Designing AI Agent Loops in Claude Code and Codex`[3]
  * • Andrew Ng / The Batch：`Three Key Loops for Building Great Software`[4]
  * • Anthropic Claude Code Docs：Commands[5]、Automate work with routines[6]、Dynamic workflows[7]
  * • OpenAI Codex Docs：Follow a goal[8]、Agent Skills[9]

## 往期相关

  * • 《[吴恩达三层Loop：Agent越快，人越要管慢反馈](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409738&idx=1&sn=c94cd8342fd7f73ccda814d2812215c7&scene=21#wechat_redirect>)》
  * • 《[Skill Hell：Agent Skill 怎么写，才不变成旧 Wiki](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409745&idx=1&sn=ba10d35c3c5fc2707ccfd5ad31ad5098&scene=21#wechat_redirect>)》
  * • 《[企业 AI Loop 落地：先把目标、证据和权限写清楚](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409753&idx=1&sn=53428e5c9e2df50d819886ae27a5a1e9&scene=21#wechat_redirect>)》
  * • 《[Anthropic 8x 之后：Agent 协作真正卡在验证和交接](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409776&idx=1&sn=b6d6fa96502cfdc093c21841a568daaf&scene=21#wechat_redirect>)》
  * • 《[Claude Code官方Loop分层：从自检到无人值守的四档控制权](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409783&idx=1&sn=5918e0b172ee017038afc208b2871bf9&scene=21#wechat_redirect>)》

#### 引用链接

`[1]` Addy Osmani：`Loop Engineering`:_https://addyosmani.com/blog/loop-engineering/_  
`[2]`Omar / DAIR.AI：`From Prompting Agents to Loop Engineering`:_https://glean.smartcoder.ai/a/from-prompting-agents-to-loop-engineering-fvktas_  
`[3]`Claire Vo / ChatPRD：`Designing AI Agent Loops in Claude Code and Codex`:_https://www.chatprd.ai/how-i-ai/how-i-ai-designing-ai-agent-loops-in-claude-code-and-codex_  
`[4]`Andrew Ng / The Batch：`Three Key Loops for Building Great Software`:_https://www.deeplearning.ai/the-batch/three-key-loops-for-building-great-software_  
`[5]`Commands:_https://code.claude.com/docs/en/commands_  
`[6]`Automate work with routines:_https://code.claude.com/docs/en/routines_  
`[7]`Dynamic workflows:_https://code.claude.com/docs/en/workflows_  
`[8]`Follow a goal:_https://developers.openai.com/codex/use-cases/follow-goals_  
`[9]`Agent Skills:_https://developers.openai.com/codex/skills_  

如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

**因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享**

**·END·**
    
    
    **相关阅读：**
      
        * [Claude Code 官方 Loop 分层：从自检到无人值守的四档控制权](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409783&idx=1&sn=5918e0b172ee017038afc208b2871bf9&scene=21#wechat_redirect>)
      
        * [Claude Code 负责人复盘：Anthropic 工程师产出提升 8 倍，到底做对了什么？](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409776&idx=1&sn=b6d6fa96502cfdc093c21841a568daaf&scene=21#wechat_redirect>)
      
        * [Claude官方教你用 Loop：如何让Claude Code上夜班的四个交接点](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409760&idx=1&sn=46714257a03ff78001a2e4eebea13520&scene=21#wechat_redirect>)
      
        * [企业 AI Loop 落地：先把目标、证据和权限写清楚](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409753&idx=1&sn=53428e5c9e2df50d819886ae27a5a1e9&scene=21#wechat_redirect>)
      
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
