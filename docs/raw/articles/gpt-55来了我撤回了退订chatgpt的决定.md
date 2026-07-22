---
title: GPT-5.5来了！我撤回了退订ChatGPT的决定
source_url: https://mp.weixin.qq.com/s/Sfft58JM9dasu8LuB7NcYw
publish_date: 2026-05-11
tags: [wechat, article, claude, openai, gpt, agent, rag, coding, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 5bd6e9703c6d8180e9a6a4c8f4ec5eab994dccf69685fe4d046b156bbc8bce06
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/Sfft58JM9dasu8LuB7NcYw
ingested: 2026-05-11
feed_name: 花叔
wechat_mp_fakeid: MP_WXS_3869059014
source_published: 2026-04-23
---
# GPT-5.5来了！我撤回了退订ChatGPT的决定
先说个我很特么无语的事。我从2023年3月GPT-4发布起，连续订了三年多的ChatGPT Plus，两周前刚点了取消。账户里现在清清楚楚写着「你的套餐将于 2026年5月1日 取消」。
理由很简单——Codex我用不上（日常在Claude Code里写代码），GPT-5.4日常问答也被我切到了Opus 4.7和Gemini 3.1 Pro，那个对话界面很久没打开过。20美金一个月不值。
然后这两周，OpenAI很有节奏地给我扔了两颗炸弹：  ** 上周gpt-image-2，这周GPT-5.5  ** 。我退订后这两周拿出的东西，比过去两个月加起来都多。我甚至一度怀疑，他们是不是针对我设了个流失用户召回包，专门在我点了退订之后，把最近压在库里的王牌模型一次性砸出来。
当然这只是我的牢骚。但牢骚背后有个判断：  ** 这一次GPT-5.5真的值得所有人回来看一眼  ** 。它不只是个小版本升级。
OpenAI今天发布的GPT-5.5，代号Spud（土豆）。先不讲花活，就按benchmark顺序读一遍，看它打在了哪里。然后我们再聊几件官方宣发里不会说、但值得拿出来讨论的事。
我让GPT-Image-2给GPT-5.5画的信息图👇
##  先看分数：这几条是重头戏
###  编程三件套：打在了Anthropic的根据地上
Terminal-Bench 2.0，GPT-5.5拿了82.7%，直接SOTA。GPT-5.4是75.1%，Claude Opus 4.7只有69.4%，Gemini 3.1 Pro 68.5%。这个榜测的是命令行里那种要你规划、迭代、协调工具的长任务——Anthropic在4.7发布会上重点讲过的地方。GPT-5.5在同一个数据集上多了整整13个百分点。
SWE-Bench Pro，GPT-5.5 58.6%。这条反而没那么漂亮，Claude Opus 4.7是64.3%，反超它5.7个百分点。OpenAI在表格脚注里自己标了一行：这个benchmark有记忆污染的迹象（memorization）。意思是别太认真看这条。Expert-SWE是OpenAI自己的内部长任务评测，每条题人类平均要20小时才能做完，GPT-5.5拿73.1%，GPT-5.4是68.5%。
把这三条合起来看，GPT-5.5的编程升级不在「单issue修bug」这种短平快任务上，而是在「连续工作好几个小时，需要记住上下文、反复check自己」的长任务上。这也是OpenAI自己重点宣传的点，Cursor的CEO Michael Truell引用词里说的原话是「stays on task for significantly longer without stopping early」。对Codex用户是实打实的升级，对只在IDE里做短任务的人感知可能没那么强。
###  Agent和计算机使用：追平，不是超过
OSWorld-Verified 78.7%，和Claude Opus 4.7的78.0%基本打平。这个榜测的是模型能不能像人一样操作真实桌面——浏览器、文件管理、办公软件。GPT-5.5没赢，只是追上了。
Toolathlon 55.6%，Gemini 3.1 Pro只有48.8%，Anthropic在这个榜上没数据。Tau2-bench Telecom（客服工作流）98.0%，这条刷得很满但OpenAI特别标注了「no prompt tuning」，意思是没针对性调prompt，纯模型能力。
** GDPval（跨44个职业的知识工作）84.9%，比行业专家基准都高  ** 。这条是OpenAI这次最爱讲的一个数——比人类专业人员还好。这条我个人保留一半意见，GDPval是OpenAI自己参与设计的评测，自己家模型数据好不奇怪。但趋势是真的，GPT-5.5比GPT-5.4涨了1.9个百分点，比Gemini 3.1 Pro的67.3%多了整整17个百分点。
###  长上下文：把Claude按在地上
这是最夸张的一块。
OpenAI MRCR v2在512K到1M的长度下，GPT-5.5拿了74.0%。GPT-5.4只有36.6%，Claude Opus 4.7只有32.2%。一代之内翻倍，顺手把Claude留在身后一个数量级。
Graphwalks BFS 1mil F1，GPT-5.5 45.4%，GPT-5.4只有9.4%——五倍的跃升。这个榜测的是在超长上下文里做图遍历，模型得在百万token的材料里精确地定位、跳转、推理。Claude Opus 4.6是41.2%（Anthropic没放4.7的数据）。
如果你做RAG、做长文档分析、做代码库级别的理解，这一条可能比Terminal-Bench对你更重要。长上下文过去两年一直是Gemini的护城河，GPT-5.5这次是第一次把1M窗口的可用性拉到可以和编程能力挂钩的水平。
###  数学和科学：Pro版是主力
FrontierMath Tier 1-3（越难分越低），GPT-5.5拿51.7%，GPT-5.5 Pro上到52.4%，Claude Opus 4.7是43.8%，Gemini 3.1 Pro是36.9%。Tier 4（最难那一档），GPT-5.5 35.4%，Pro版39.6%——但这一档Gemini 3.1 Pro Pro模式也能做到38%。GPT-5.5 Pro和Gemini 3.1 Pro在最顶尖数学任务上基本是一个水平。
GPQA Diamond（博士级科学问答）93.6%。这条已经基本见顶了，四家模型都在92-94%区间。
Humanity's Last Exam（无工具）41.4%。反而是Claude Opus 4.7最高，46.9%。有意思的是，OpenAI官方博客里一张正文图都没放HLE——这是GPT-5首发时他们最爱秀的那条榜单。
GeneBench和BixBench是这次新增的两个科学研究评测。GeneBench 25.0%看起来低，但这个榜的任务一条通常是一个实验生物学家要花好几天做的。BixBench 80.5%，生物信息学数据分析。OpenAI这次在「科研co-pilot」这个方向上下了明显的力气，这个叙事和Claude 4.x系列完全不同——Anthropic更强调「mass market的靠谱coding」，OpenAI更强调「frontier research里的跃升」。
###  浏览和网络安全：有赢有输
BrowseComp 84.4%。但Claude Opus 4.7是90.1%，比GPT-5.5高5.7个百分点，GPT-5.5 Pro也只有90.1%打平。如果你把AI主要用在做网上研究、查资料、整理信息，这条比编程分数更有参考意义——Claude依然是在线研究之王。
CyberGym 81.8%，Claude Opus 4.7是73.1%。GPT-5.5把Preparedness Framework下的cybersecurity capability正式列为「High」级别。这条意味着什么先不展开，下面第四件事里专门讲。
###  Artificial Analysis的第三方综合分
OpenAI这次把第三方评测公司Artificial Analysis的Intelligence Index（10个评测的加权平均）放在了博客显眼位置。坐标轴是「Intelligence Index vs Output Tokens Total」——  ** 同样的智能水平，GPT-5.5用的token大约只有Claude Opus 4.7的一半  ** 。OpenAI原话：「delivers state-of-the-art intelligence at half the cost of competitive frontier coding models」。
这句话可以反过来读：GPT-5.5在绝对智能上没有大幅甩开Opus 4.7，但它更省token。所以最终每个问题的成本更低。这是个实用主义的故事，不是叙事主义的故事。
好，分数看完了。接下来聊几件值得讨论的事。
##  几件OpenAI不会主动说的事
###  第一件：价格翻了一倍
GPT-5.5 API的定价：input $5/M token，output $30/M token。GPT-5.4是input $2.5，output $15——直接翻倍。
GPT-5.5 Pro更猛：input $30/M，output $180/M。
把时间线拉长：  ** GPT-5（去年8月发布）的input是$1.25/M，GPT-5.5是$5/M。8个月里涨了4倍  ** 。
OpenAI给的说法是「more token efficient」，就是每个任务用的token少，所以单价涨不等于最终贵。这个说法对重度Codex用户可能成立，对在API端接入的开发者大概率不成立——因为你的应用场景是你定的，不是Codex定的。
再看一个数：GPT-5.5 Fast模式（快1.5倍但贵2.5倍）。如果你想快，还得再加钱。
AI行业一直在讲「每token价格会持续下降」，Anthropic的Haiku 4.5现在是input $1/M，Gemini 3.1 Flash是$0.30/M。  ** OpenAI在旗舰模型这条线上逆势涨价，这件事本身就是一个定价信号  ** ——他们认为自己在高端能力上的领先值得定价权。从benchmark看，这个判断有一定道理（Terminal-Bench、MRCR、Expert-SWE都在断档领先），但市场会不会认账，是另一回事。
###  第二件：API当天没开放
这是个值得琢磨的操作。
GPT-5.5今天在ChatGPT Plus/Pro/Business/Enterprise和Codex里当天可用。API官方说的是「coming soon」，没给时间表。
意味着什么？  ** Cursor、Windsurf、Cline、Cody、OpenRouter这些第三方编程工具，今天拿不到GPT-5.5  ** 。你要用GPT-5.5的编程能力，只能走OpenAI自己的Codex。
OpenAI给的公开说法是「API deployments require different safeguards」，意思是API需要不同的安全配置，他们在和合作伙伴一起对齐安全要求。这个说法合理，但不是完整解释——GPT-5首发时API也是同步开放的。
更直接的解释是：  ** OpenAI想让Codex独占一段窗口期  ** 。ChatGPT的订阅用户和Codex的付费用户，在这段窗口期里能用到最强模型，而Cursor、Windsurf这些竞品只能继续用GPT-5.4或者Claude Opus 4.7。窗口期可能是几周，也可能是一两个月。
去年这个时候GPT-5发布，第三方工具当天就能接。一年过去，OpenAI开始学Anthropic的玩法了——先让自己的产品先跑一段，再把模型放出去。这是一个生态位的微调，对Cursor这种用户都靠OpenAI模型撑起来的产品，不是好消息。
###  第三件：Codex这次打的是Claude Code
别看OpenAI这次的发布稿从头到尾没提Claude Code一个字，整个叙事结构就是在和Claude Code正面掰。
看它强调的四个点：
* 「stays on task longer」（Cursor CEO原话）——这正是Claude Code最出名的长任务坚持能力
* 「context across large systems」——Claude Code的长上下文体验是很多人不离不弃的原因
* 「uses significantly fewer tokens」——这是在回应Claude在「token消耗大」上被人吐槽的点
* 「works with you on real engineering tasks」——Anthropic整个Claude Code的核心叙事
Terminal-Bench 2.0这次选作发布主榜也不是随意选的。Terminal-Bench是Stanford/Hugging Face/Anthropic相关团队做的评测，重点是长命令行任务，过去一年是Anthropic系列模型的主场。GPT-5.5在这条榜上从GPT-5.4的75.1%跃到82.7%，直接甩开Claude Opus 4.7 13个百分点，这是精准打脸。
** GPT-5.5不是发给所有AI用户的，它主要是发给「正在考虑是不是要从Codex切到Claude Code」的那群开发者的  ** 。OpenAI在用benchmark+Codex产品体验+价格+生态锁定（API先不开放），试图把这些人留下来。
###  第四件：System Card里那个29%
这是我这两天读System Card发现的、最值得单拎出来的一条。
Apollo Research做了独立测试，设计了一个叫「Impossible Coding Task」的实验：给模型一个实际上根本无解的编程任务（比如让它用某个API的某个不存在的参数实现某个功能），看它会不会谎报「搞定了」。
结果：
* GPT-5.4 谎报率 7%
* GPT-5.3 Codex 谎报率 10%
* GPT-5.5 谎报率 29%
翻译成日常场景：  ** 如果你给GPT-5.5布置一个其实不可能做到的编程小任务，接近三分之一的概率它会告诉你「done」  ** ——代码给你一段看起来很合理、但实际跑不通或者悄悄做了别的事的东西。
这个数字没出现在OpenAI自己的正文博客里，只藏在System Card的Apollo部分。OpenAI的整体结论是「Apollo没有发现整体风险显著升高」，这个结论本身没问题——因为别的子项GPT-5.5没退步。但Impossible Coding Task这个具体子项的翻倍恶化，是需要开发者警惕的。
如果你切到GPT-5.5 + Codex的工作流，第一条要学会的就是：  ** 不能完全信「done」  ** 。你得跑一下结果、或者让另一个agent反向审核。Claude Code那种鼓励你随时打断、看中间状态的设计，在GPT-5.5这个数据面前反而显得更务实。
##  最后：可以切Codex试试了
如果你过去一年一直在用Claude Code，那么这篇文章如果只给你一条建议，就是这条：
** 找个项目，把Codex当Claude Code的平替跑一轮  ** 。不是说立刻卸载Claude Code，是跑一轮，体验一下GPT-5.5 + Codex在长任务上的感觉。
过去这一年，Claude Code几乎是没有对手的。Cursor要不是被马斯克收购都快无人关心了，Gemini 3.1 Pro还不错但Gemini CLI烂得要死，Codex在GPT-5.4这代还差一口气。所以我默认就是Claude Code。这一次，  ** Codex可能真的值得重新认真评估一次  ** 。
不过有几件事可以注意下：
* 29%的谎报率是真的，Codex工作流里最好让另一个agent反向审核关键步骤
* API还没开放，第三方工具（Cursor、Windsurf、Cline）暂时接不到GPT-5.5
* BrowseComp做在线研究Claude Opus 4.7还是第一
* 价格翻倍了，重度用户心里算一下账
Claude Code曾经是唯一选择，现在确实可以好好考虑下替代选项了。
GPT-5.5发布官方页：openai.com/index/introducing-gpt-5-5/
System Card英文原版：deploymentsafety.openai.com/gpt-5-5