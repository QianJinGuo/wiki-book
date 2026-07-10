---
title: Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering
source_url: https://mp.weixin.qq.com/s/HTFcXBzYUVHvwShu3Zp-EA
publish_date: 2026-05-10
tags: [wechat, article, claude, openai, gpt, agent, harness, rag, coding, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: fb69a908e6f3c347455e9a35dd8e46935d01eab292990670359da39e526a0a0f
---

系统形态  |  风险
只包装模型能力  |  容易被模型升级吞掉
只把 Prompt 做成页面  |  缺少架构壁垒
只做输入输出格式转换  |  容易被模型原生能力替代
深入业务流程  |  有一定壁垒
掌握权限、数据、状态、审计  |  壁垒更强
承担复杂系统协同和验证  |  更接近基础设施
所以做架构的时候，可能不只是问"这个功能能不能做"，还要顺手问一句：它会不会只是模型能力暂时不到位时的中间层？
坦白说，这个判断在很多具体产品上并不好下。模型能力的边界一直在动，今天必须外置的一层，几个月后可能就被模型自己吞了。但方向上还是慢慢清晰：业务状态、权限模型、数据闭环、验证体系、审计链路和复杂协同，比"把模型能力包装成界面"难被一次模型升级直接抹平。
* * *
##  可验证性可能决定 Agent 能走多远
Karpathy 在访谈里反复在讲可验证性，我觉得这一点挺关键的。
他的原话大致是：传统计算机容易自动化你能写进代码的东西，这一代 LLM 更容易自动化你能验证的东西。代码、数学、测试、编译、结构化任务之所以进展快，可能不只是因为模型整体变聪明了，更因为这些领域容易构造反馈，代码能不能编译，测试能不能通过，漏洞能不能复现，格式是否满足约束，这些都可以变成模型的奖励信号。
也是因为这个，我觉得 GLM-5 论文挺有信号意义。它没有停在模型参数上，而是把长上下文、异步强化学习、真实软件工程任务放在同一个框架里讨论。背后的方向比较清楚：模型在从"生成答案"慢慢走向"在长链路里执行、反馈、修正"。
落到团队里，一个朴素的次序大概是，先看哪些事情能被验证，再决定哪些事情交给 Agent。粗略可以这么分一下：
---
等级  |  任务特征  |  Agent 适用程度
L1  |  输出可静态校验  |  高
L2  |  可编译、可测试  |  高
L3  |  可通过集成测试验证  |  较高
L4  |  涉及业务规则与状态变更  |  需要审批和审计
L5  |  涉及资金、身份、权限、数据删除  |  必须强管控
L6  |  涉及组织判断、法律责任、战略选择  |  人必须主导
这张表不是要保守地把 Agent 关起来，反而是为了让自动化能走得更远，  把验证体系搭起来，Agent 就有机会从"帮我写一段代码"，进入"帮我完成一段工程任务"。反过来，如果验证这一层始终缺位，那种状态其实更接近"高级一点的 Vibe Coding"。
* * *
##  锯齿状智能：还是得留点护栏
Karpathy 用"锯齿状智能"形容 LLM 那种不均匀的能力。访谈里有一个画面感很强的例子：他问最先进的模型，  要去 50 米外的洗车店洗车，是开车还是走路？  模型说走路，因为 50 米很近。问题在于，他要洗的是车，车必须到洗车店。
> 一个最先进的模型可以重构 10 万行代码、找到零日漏洞，却告诉我应该走路去洗 50 米外的车。
参差不齐的智能：为什么 AI 能写底层代码，却不会去洗车
这事不太能简单归结为"聪不聪明"。更接近的说法可能是：大模型的能力不是一条平滑曲线，而是由训练数据、奖励函数和验证环境塑造出来的一片地形，某些区域高得吓人，某些区域又突然塌下去。
他还顺手提了一个我以前没太注意的细节：从 GPT-3.5 到 GPT-4，国际象棋能力大幅提升，看起来像"模型整体变聪明了"，实际上是因为有人在 OpenAI 决定把大量国际象棋数据加进了预训练。
数据进了分布，能力就跟着上去了。一个看起来"能力进化"的故事，到这里变成了"实验室在做产品决策"的故事。
如果这个判断成立，对落地的人其实有点提醒意义：  不太能假设下一代模型会自动覆盖你关心的领域。  如果业务场景刚好落在前沿实验室 RL 训练覆盖的回路里，那挺好；落在外面的话，要么自己构造可验证环境去微调，要么就接受 Agent 在那个领域只是个不太稳定的实习生。
也是因为这个，把 Agent 当成"稳定的资深工程师"来用，多少有点危险。它更像一个能力很强、执行很快、但边界并不总是可靠的执行体。
Simon Willison 在 2025 年提过一个挺好用的安全框架：当 Agent 同时具备访问私有数据、接触不可信内容、对外通信这三种能力时，风险会陡然上升。Agent 真正的危险，往往不只是"写错代码"，更危险的是它读到了不可信输入、又拿到了真实权限、还能把结果发出去这种组合。
所以护栏这件事，可能不是补丁，更像默认配置：
---
风险  |  可能的护栏
幻觉执行  |  工具调用前校验
错误修改代码  |  分支隔离和代码审查
误删数据  |  沙箱和只读默认权限
错误部署  |  灰度、回滚、审批
错误关联身份和资金  |  稳定 ID 与领域模型约束
Prompt Injection  |  私有数据、不可信输入、外部通信分离
成本失控  |  Token 限额、调用预算、模型路由
行为不可追溯  |  全量日志和审计链
Karpathy 自己也讲了个挺典型的支付例子。用户用 Google 账号登录，但买 credits 时用的是 Stripe。Google 和 Stripe 都有邮箱字段。Agent 在实现逻辑时，就用 Stripe 邮箱去匹配 Google 邮箱，把 credits 挂到用户身上。
代码能跑，局部测试也可能过。但系统语义是错的，邮箱本来就不该当稳定用户身份，用户完全可能一个邮箱登录、另一个邮箱付款，资金、credits、订单这些得挂在系统内部的稳定 user ID 上，不能挂在一个外部邮箱字符串上。
这类错误最让人头疼的地方，是它属于业务语义错误，语法上往往看不出来。Agent 最危险的错误，可能不在代码语法，而在它把身份、权限、状态、责任这些关系理解偏了，而这恰好是做架构、做技术的人比较敏感的地方。
* * *
##  顺手聊聊"幽灵"这个比喻
Karpathy 在访谈里花了不少篇幅讲他自己写过的一篇文章，主题是  animals vs ghosts  。结论挺有意思，我们不是在造动物，而是在召唤幽灵。
这个说法听起来有点玄，他想表达的其实并不玄。
动物智能来自进化、身体、环境互动、内在动机、好奇心、乐趣、持续学习。它们在世界中行动，被后果塑造，会在生命过程中不断适应。LLM 不是这样。它来自大规模预训练，叠加 RL、偏好数据、工具调用这些后训练过程，更像是由人类文档、统计模式和奖励函数塑造出的"模拟实体"。
> 如果你对它大吼，它不会因此工作得更好或更差，也没有任何影响。
读到这里，能顺手抽出几个比较朴素的提醒：
* • 笼统地问"AI 聪不聪明"意义不大，更值得问它在哪些分布里强、哪些奖励信号塑造了它、在哪些任务上可能掉到断崖里。
* • 把 Agent 当"有动机的员工"也容易出问题，它没有惧怕、没有自尊，不会因为你催它就更努力，也不会因为你鼓励它就更可靠。
* • 也很难把它当成稳定的"资深工程师"，毕竟能力分布是锯齿状的，今天某个高峰可能来自最近一次数据决策，下个版本可能又是另一张地形图。
把 Agent 看成幽灵而不是同事，  前面那些控制面的设计反而会显得自然一些，上下文、权限、工具、验证、审计这些机制不是因为 Agent"不够好"才补的，而是它本来就不是一个可以直接套用人类管理直觉的对象。
* * *
##  人的位置：可能不是消失，更像是慢慢上移
Karpathy 在访谈末尾引了一句话：  你可以外包思考，但不能外包理解。
这句话挺容易被写成鸡汤的，但放到 Agentic Engineering 里其实蛮具体。
API 参数、样板代码、局部重构、测试补全，这些细节正在变便宜。Karpathy 自己举了一个挺接地气的例子：他已经不再去记 PyTorch、NumPy、pandas 之间那些细碎的 API 差异，比如是  ` keepdims  ` 还是  ` keepdim  ` 、  ` dim  ` 还是  ` axis  ` 、  ` reshape  ` /  ` permute  ` /  ` transpose  ` 各自怎么用。这些都可以扔给 Agent。
> 但我仍然必须理解 tensor 是什么，view 和 storage 的关系是什么，什么时候只是同一块内存的视图，什么时候会真的复制数据。
你可以将思考外包，但不能外包理解
我觉得这就是"细节可以外包、理解不能外包"的具体形态。
API 名字忘了无所谓，但概念结构丢了，就很难判断 Agent 写出来的东西是真的高效，还是只是看起来在跑。
他还顺手吐槽过 Agent 写出来的代码常常让他"有点心脏病发作的感觉"，能跑，但臃肿、复制粘贴、抽象别扭、结构脆弱。做 MicroGPT 时他不断让模型"再简化一点"，模型就是做不到，像"拔牙"一样。
> 它能跑，但真的很恶心。
代码能跑和代码好从来不是一回事。Agent 暂时还没被很好地训练到"极简、克制、优雅"的奖励信号上，这个口子目前只能由人守一会儿。再加上"系统为什么这样设计、身份怎么建模、权限怎么收敛、状态怎么流转、失败怎么恢复、哪些动作不能自动化"这些问题，也都还在人这一侧。
过去高级工程师和初级工程师的差异，挺大一部分体现在实现能力上，能不能写更复杂的代码、记住更多 API、排查更隐蔽的问题。在 Agentic Engineering 里，这种差异多少会上移。
过去重要  |  现在可能更重要
---|---
熟悉 API 细节  |  理解底层机制
手写业务代码  |  定义业务语义
写脚本自动化  |  设计 Agent 执行边界
完成功能  |  设计验收标准
修 bug  |  建立验证体系
控制模块依赖  |  控制 Agent 权限和上下文
管理代码质量  |  管理系统后果
这不是说实现能力不重要，反过来，越懂实现，越能判断 Agent 写出的东西靠不靠谱。只是人的主要价值，可能会更多落在规格、边界、验证、取舍和理解这几件事上。
最后的瓶颈：人类的品味与判断力
也是因为这个，2026 年我看到很多推文在反复强调"维护""测试""Skill""可执行规范"。比如有人把代码维护经验写成 Claude Code Skill，让 Agent 自己跑文档清理、测试补充、大文件拆分、重复代码提取、手写轮子替换。例子不算大，但方向上挺对，把资深工程师的经验，从口头提醒变成 Agent 可以执行的流程资产。
这和《 [ 如何为 Agent 设计产品？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409144&idx=1&sn=0d15111cf536be0d6aa1946d5a225ae9&scene=21#wechat_redirect>) 》里那条线挺接得上。事实记忆回答"环境是什么"，会话检索回答"以前发生过什么"，过程资产回答"这类事以后怎么做"。Agentic Engineering 真正想沉淀的，可能更多是第三层。
如果一个团队只让 Agent 记住更多聊天记录，长期看可能不太够；把稳定的排障路径、发布检查、PR review 清单、数据迁移步骤、安全红线写成可执行资产，下次同类任务来的时候，Agent 就不是在猜一个资深工程师会怎么想，而是在沿着团队已经走过的路径走。
新型工程师的日常：从搬砖者到包工头
* * *
##  顺带一提：AI-native 工程师的面试可能也得换
访谈里有个问题挺现实：  如果同时观察两个使用 AI coding 工具的人，一个普通、一个真正 AI-native，区别会在哪？
Karpathy 先说了句很朴素的话，AI-native 工程师会认真投资自己的工作流。就像过去会花时间配 Vim、VS Code、命令行、快捷键一样，现在也要花时间把 Cursor、Claude Code 调成真正适合自己的样子。
但他更想吐槽的其实是招聘流程。
很多公司的面试还停留在"现场写一道算法 puzzle"那一套，测出来的是"能不能在白板上手写一个 trie"，跟一个人在 Agentic Engineering 里能不能干活基本两码事。他给出的替代方案是这样：
> 面试本该是这样的：甩给候选人一个极大的项目，比如做个给 Agent 用的 Twitter 仿盘，要求做得绝对安全。然后，我挂上 10 个 Cursor 当作"红队"，放开手脚去攻击你做出来的这个网站。
招聘标准的重构：放弃算法题，拥抱实战攻防
这套评估方式真正想看的，不是手写算法，而是候选人能不能把模糊目标变成清晰规格、指挥多个 Agent 完成大规模实现、识别安全和架构风险、设置测试与验证、在模型生成的大量代码里保住质量判断、让最终系统经得起外部 Agent 的攻击。
读到这里能感觉到：当代码越来越多由 Agent 生成，"能不能保住系统"就慢慢变成了一个工程师的核心能力。这正是过去做架构的人比较熟悉的事，定义边界、设置验证、推演攻防、规划回滚。
换句话说，  Agentic Engineering 时代里"高级工程师"和"架构师"之间那条线，可能会比以前更模糊一些。
* * *
##  顺一个方向：Agent Native Infrastructure
访谈里 Karpathy 还讲了一个挺现实的痛点：今天大部分基础设施还是给人设计的。
控制台、菜单、设置页、API key、DNS 配置、环境变量、部署后台、账单页面，全部默认有一个人坐在屏幕前读、点、复制、粘贴。Agent 时代大概率需要的是另一套东西。
Agent Native Infrastructure 大概可以这么理解：让 Agent 可以理解、调用、验证、恢复和审计真实系统的那一层基础设施，而不是让它模拟人去点网页。粗略可以拆成几个方向：
基础设施方向  |  解决的问题
---|---
Agent-readable Docs  |  文档从说明材料变成执行材料
Tool Registry  |  Agent 知道有哪些工具可用，如何调用
Permission Gateway  |  控制 Agent 能做什么，不能做什么
Execution Sandbox  |  隔离 Agent 的执行环境和影响范围
Verification Pipeline  |  用测试、规则、评估器验证结果
Audit and Cost Ledger  |  记录 Agent 做了什么、花了多少、造成什么影响
下一代研发基础设施可能不会停在"给 IDE 加一个聊天框"这一层，更值得做的是把文档、工具、权限、运行时、测试和审计重新组织成 Agent 能够工作的环境。也是因为这个，我现在越来越倾向于把 Agentic Engineering 看成一个工程体系问题，而不只是单点工具问题。
当一个 Agent 可以打开项目、理解任务、改代码、跑测试、提交 PR、处理反馈、修复部署问题时，它接触到的已经是一条完整的研发链路。链路里任何一个环节没有边界，模型那点不稳定，就会被放大成工程事故。
* * *
##  写在最后
我自己现在对 Agentic Engineering 的态度，可能比半年前更谨慎一点，同时也更乐观一点。
谨慎的是，Agent 还会犯不少低级错误，会生成臃肿代码，会把业务语义理解偏，会把邮箱当用户 ID，会在不该自信的时候自信。乐观的是，这些问题并不代表 Agent 没法进入工程系统，更像是在提醒我们：得把它放进合适的工程系统里。
从 Vibe Coding 到 Agentic Engineering，变化可能不只发生在工具和写代码方式上。  再往深处看一点，我现在更倾向于这么理解，软件工程的控制对象正在悄悄变化：过去主要控制的是代码、模块、接口、服务、数据流和部署流程；今天可能还得加上 Agent 的上下文、权限、工具调用、执行环境、验证机制和行为后果。
对个人开发者来说，Vibe Coding 已经挺有价值了，它让很多想法可以更快变成软件。但对一个团队、一个研发体系来说，  事情可能刚刚开始  ，Agent 进入真实工程之后，最好被放在一个可验证、可隔离、可回滚、可审计的系统里。给 AI 加几条使用规范，大概率解决不了这个层面的问题。
所以我自己的小结大概是：Vibe Coding 是开始，再往后要慢慢补上的，是 Agentic Engineering。把今年聊过的这几篇文章串起来看，我的判断也会更朴素一点：AI Coding 的上半场，大家在看模型能不能写代码；下半场，差距会越来越落到模型外面的那套系统，Harness、上下文、过程资产、权限、验证、发布、审计。模型会继续变强，但越强的模型，可能越需要清楚的工程边界。
这件事听起来没有"一个人顶一个团队"那么刺激，但我个人觉得它更接近真实的软件工程。
最后顺便记一下我自己未来 6-12 个月想盯的三个信号：
1. 1\.  ** 前沿实验室在编程和数学之外，往哪些领域注入 RL 数据。  ** 哪里被注入，那里的能力可能就会突然冒出来。Karpathy 访谈里被问到"创业者怎么找一个还没被 RL 覆盖的可验证领域"时，明显有想说但忍住了，"我不想直接给出答案……抱歉，我不是有意在台上发含糊推文的"。一个不愿在台上发含糊推文的人主动回避，本身就挺有意思。
2. 2\.  ** Agent-first 基础设施有没有开始收敛。  ** 部署、auth、payments、DNS、配置这些让 Karpathy 做 MenuGen 时最头疼的环节，会不会出现真正"一句话给 Agent 就能跑"的标准件。如果一直没有，自动化的路可能就还得走一段。
3. 3\.  ** 下一代模型有没有把审美和代码质量纳入 RL 目标。  ** 如果 Agent 写的代码不再让人"心脏病发作"，那人在"品味"这一层守的口子就会变窄；反之，人在审美和抽象简化上的位置可能还会再多撑一阵。
这三件事大概决定了 Agentic Engineering 的边界会以多快的速度往外推。具体怎么走，我也没有把握，先聊到这里，欢迎大家在评论里一起拍
##  参考资料
* • Andrej Karpathy 在 Sequoia AI Ascent 2026 的访谈视频：https://www.youtube.com/watch?v=96jN2OCOfLs
* • Andrej Karpathy 关于 Vibe Coding 的原始 X 推文：https://x.com/karpathy/status/1886192184808149383
* • Andrej Karpathy 关于 Agentic Engineering 的一周年回看 X 推文：https://x.com/karpathy/status/2019137879310836075
* • Addy Osmani，《Agentic Engineering》：https://addyosmani.com/blog/agentic-engineering/
* • GLM-5: from Vibe Coding to Agentic Engineering：https://arxiv.org/abs/2602.15763
* • Simon Willison，《The lethal trifecta for AI agents》：https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
如喜欢本文，请点击右上角，把文章分享到朋友圈
如有想了解学习的技术点，请留言给若飞安排分享
** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **
** ·END·  **
    **相关阅读：**
[刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect>)
[大家都在讲 Harness，但它到底该怎么理解](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect>)
[模型越来越强，为什么大家却开始重写 Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect>)
[如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect>)
[Claude Code高手的 8 个 Claude Code 实战习惯](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408884&idx=1&sn=6a2fa56f70f15cdd75eb5c2b12e687ef&scene=21#wechat_redirect>)
[别从 README 开始：一个架构师会怎样翻 Codex 仓库](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect>)
[Spec 不是代码的替代品，它是 AI Coding 的上下文管理层](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408860&idx=1&sn=b882b2ee97e3f798fea96e68d27c7071&scene=21#wechat_redirect>)
[如何让 Agents 自己设计、升级 Agents](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408848&idx=1&sn=aabf785116e9849dbd301a4f7c477181&scene=21#wechat_redirect>)
[OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408832&idx=1&sn=ef00408738c853ea2e94be58c0612e51&scene=21#wechat_redirect>)
[Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408200&idx=1&sn=2f2cce7dfcbdb0766eac3590f777a17b&scene=21#wechat_redirect>)
[一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408189&idx=1&sn=7d4f7a442a22af37f95c46ff1048a3df&scene=21#wechat_redirect>)
[Claude Code 最佳实践：把上下文变成生产力（团队可落地版）](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408183&idx=1&sn=0b6f1437465d3a61118db688cc889b17&scene=21#wechat_redirect>)
[把 AI 当成新同事：Agent Coding 的上下文与验证体系](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408169&idx=1&sn=7bba1377a31ffa0ce68932935c8d923a&scene=21#wechat_redirect>)
[一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408161&idx=1&sn=85aaff6f2f779e53b6ae9c5e1f003269&scene=21#wechat_redirect>)
[2026年生活重启指南](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408141&idx=1&sn=e1e64ad73d25414957aa5206ca969fc3&scene=21#wechat_redirect>)
[我真不敢相信，AI 先加速的是工程师。](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408153&idx=1&sn=d33b48464de93a2573a0a0cb025ada9e&scene=21#wechat_redirect>)
[扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408128&idx=1&sn=1b6c640de61986d1364847bffb2cd28f&scene=21#wechat_redirect>)
[Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408114&idx=1&sn=29a754281cd07c16b6191c6d146c5837&scene=21#wechat_redirect>)
[Anthropic官方万字长文：AI Agent评估的系统化方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408107&idx=1&sn=905552d68f5b174fd9548360bdea4448&scene=21#wechat_redirect>)
[银弹还是枷锁？Claude Agent SDK 的架构真相](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408084&idx=1&sn=82f274ba084f9c289e2d141aad0c088b&scene=21#wechat_redirect>)
[Claude Code创始人亲授13条使用技巧](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408076&idx=1&sn=f139e90d699b528e80e79c558eed42ee&scene=21#wechat_redirect>)
[Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408028&idx=1&sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&scene=21#wechat_redirect>)
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
** 架构师  **
我们都是架构师！