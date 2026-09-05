---
source: wechat
source_url: https://mp.weixin.qq.com/s/newlO_w5OEHGhg7dk7Wa4w
ingested: 2026-07-29
feed_name: 阿里技术
wechat_mp_fakeid: MP_WXS_3885737868
source_published: 2026-07-28
sha256: 7f2a04c62e2f2abab089f6dd306f1cb2a74850b5975abb5f90b44178f07e8916
---
# 当理解成为瓶颈：AI 编程时代的认知债与意图债

这是2026年的第 42 篇文章

（ 本文阅读时间：约 20 分钟 ）

01

失传的大马士革钢

公元前5世纪的印度，工匠用坩埚炼出被称为「乌兹」的钢锭，经中东铁匠反复锻打，成就了冷兵器时代的巅峰—大马士革刀。可到了十八世纪，这门传承两千年的技艺，却在几十年间彻底失传。铁匠们仍守着祖传口诀，一步不差地重复着每一个动作，却再也打不出那样的锋芒。

直到二十世纪末，现代冶金学才揭开谜底：那神话般的性能，源自特定矿脉中微量的钒、钼杂质在锻打中析出的碳化物纳米结构。而真正致命的是，从头到尾没有人真正理解过它「为什么」如此出众。工匠们拥有完整的流程、炉火纯青的手感，可那份理解只活在他们机械的敲打上，从未被真正看懂。当矿脉采尽、那个谁也没留意的隐藏变量悄然改变，只会重复、无法解释的他们，便再也无力回天。

02

从生成代码到理解代码

> Programming should be regarded as an activity by which the programmers form a theory of the matters at hand, rather than the production of a program and certain other texts.  
> 
> \-- Peter Naur 《Programming as Theory Building》 
> 
> 译：编程应被视为程序员对所处理事务建立起一套"理论"的活动，而非对程序及其他文本的生产。

在半个多世纪后的软件领域，同样的故事正在重演。当 AI 以远超我们阅读的速度生成代码，我们正越来越像那些只会重复配方的铁匠：系统跑得很好，功能不断交付，可一旦追问“这里为什么这么设计”、“换掉它会发生什么”，我们却陷入沉默。

写代码从未如此之快，真正的瓶颈却悄然从「生产代码」转移到了「理解代码」。早在 1985 年，Peter Naur 在 Programming as Theory Building 就提到：程序的本质不是代码文本，而是程序员脑中那套"理论"；当掌握理论的人离散，程序便「死」了，哪怕代码一行未改。

刀，还是那把刀的样子。而当理解成为瓶颈，我们迟早要面对那个悄悄堆积起来的账单—软件世界把它叫作「债」。

03

软件债务不是什么新鲜事

软件工程的债务其实早已不是什么新鲜事，早在50年前 Fred Brooks 在 《The Mythical Man-Month》 中提到的软件复杂性，到Robert C. Martin耳熟能详的 《Clean Code》 与 《Clean Architecture》，都是在教我们如何控制复杂性。当复杂性无法被治理与有效隔离时，蔓延出来对后续迭代产生影响的内容就是软件工程的技术债务。

> Ward Cunningham describes unfinished refactoring as going into debt. Most companies need some debt in order to function efficiently.
> 
> \-- Martin Flower 《Refactoring》 
> 
> 译：沃德把未完成的重构工作形容为“债务”。很多公司都需要借债来使自己更有效地运转。

但这并不代表债务的产生是不对的，远在大洋彼岸的美利坚，就是靠着美元、美股、美债这3大核心支柱，支撑起全球最大的金融帝国，中国的政府债务也在今年5月底突破100万亿元。软件领域很多时候我们也会借债前进，只是我们需要控制负债率。负债并不可怕。

04

「理解」是真痛点还是伪目标

之前的软件债务我们深有感触，前人遗留下来一堆祖传代码，我们除了吐槽，能做的也只有“屎上雕花”。但AI编程时代不一样了，一些多层嵌套的条件分支代码，无限套用的函数回调，这些我们人很难接受的代码，对机器或许是友好的。当然，更关键得是，真正落笔的不再是我们了。

英伟达黄仁勋多次说过，「不用再学具体的编程技术，AI就是编程技术，人类语言就是编程语言」。当然，老黄作为Token生产端说出这类话，我们也要辩证着看，如同之前提到的 Loop Engineering 多少也带点Token生意的意思。

从马斯克常提的 第一性原理 出发，「理解」肯定不是核心要追求的事情，核心的目标一定是能不能达成我们的诉求。我们承认债务的产生，也承认对代码的不理解，但随着大模型能力越来越强，如果我们通过简单的提示词，就能做出我们需要的软件，"理解"真的重要吗？

Vibe Coding风靡全球

> There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists.  
> 
> \-- Andrej Karpathy  
> 
> 译：有一种新的编程方式我称之为"氛围编程"—你彻底交给感觉、拥抱指数增长、甚至忘记代码的存在。

在2025年2月，OpenAI 联合创始人 Andrej Karpathy 在 X 上发出一则推文，Vibe Coding 一词正式诞生，并迅速成为科技圈热词，被《柯林斯词典》评为 2025 年度词汇。它以低门槛、高速度、自然语言驱动等特性，让开发者角色从“建筑工人”转变为“甲方”，让一个对编程一窍不通的人也有能力从0到1快速构建一个完整软件。

“彦火”APP是歌手胡彦斌基于Vibe Coding专为粉丝打造的一款互动社区应用，目前已同步上架IOS、Android。他通过AI编程工具，仅用一个月时间便完成了该APP的开发与迭代，还饶有兴致地在社交媒体上更新自己“修 bug 的日常”，展示了其利用自然语言驱动AI生成代码、规划架构并完成调试部署的全过程。

最近网上有个采访很火，大意大概是：理科生的使命已经完成了，他们创造了AI大模型，接下来通过自然语言来驱动的发展，文科生会更有优势。虽然Vibe Coding现在被证明有各种各样的问题，但不可否认Vibe Coding的出现，确实在「不理解」的前置条件下，依然能达到阶段性目标。

Grok的二进制直出愿景

2024年，日本东京大学开发了一项自动驾驶技术，让一个人形机器人坐进驾驶位。这款人型机器人拥有仿生骨架和肌肉系统，还装有高精度摄像头，四肢配备高灵敏度传感器，它不需要对车辆本身进行复杂的电子系统改造或安装昂贵的外部传感器套件，仅通过模仿人类的驾驶决策和操作方式，来完成全自动驾驶。

当初听到这个新闻时就觉得很奇怪，车本身就是一个系统，系统与系统间通过电路信息打通就可以了，完全没必要再桥接一道物理层。回看到我们目前的计算机编程领域，计算机系统需要01机器码，但机器码人类不可写，于是人类发明编程语言与编译器，将代码转成机器码来执行。现在AI介入了，AI系统不是直接对接计算机系统，而是和人一样产出编程代码，本质没有改变生产方式，只是替换了某个节点上的负责人。

> maybe even by the end of this year, you don't even bother doing coding — the AI just creates the binary directly, more efficiently than any compiler.  
> 
> \-- Elon Musk  
> 
> 译：也许就在今年年底，你甚至都不用写代码了 — AI 会直接生成二进制文件，比任何编译器都高效。

马斯克在2026年2月，在 xAI 一场的全员大会上说了这个观点，“AI会跳过源代码直接生成二进制文件”。我不确定这件事是否真的会实现，但如果我们对比东京大学的自动驾驶技术，以及我们戏称"对AI不了解的人只是把AI当成了搜索引擎"，在现有模式下，只是用AI提效原流程中的某个节点，这大概率不是一件AI Native的事情。

或许真如马斯克所说，binary directly 才是终局，AI不是简单替换流水线里某个环节的worker，而是重构整个流水线。而一旦这件事真的成为了现实，那软件工程师的"理解"就真的没有任何意义了，因为已经没有「软件工程师」了。

05

「理解」到底决定着什么？

加拿大计算机科学家、维多利亚大学软件工程教授 Margaret-Anne Storey 在自己教授的一门创业课程中发现了一个AI编程上的典型问题。她的学生团队借助AI构建软件产品，能够快速交付功能并达成里程碑。但到了第八周，一个团队开始出现问题了，一处简单修改会在意想不到的地方破坏系统，导致进展陷入停滞。

刚开始他们觉得问题在于，前期的快速交付产生了技术债务：混乱的代码、仓促的实现、架构上的捷径。但随着分析的深入，另一个问题浮现出来。团队中没有人能够解释某些设计决策为什么会被做出，也说不清系统的不同部分本应如何协同工作。代码也许确实混乱，但更深层的问题是：团队的共享理解，也就是系统理论，已经悄然碎裂。

## 三元债模型（Triple Debt Model）

Margaret-Anne Storey 在 From Technical Debt to Cognitive and Intent Debt 中提到，生成式 AI 不会消除软件工程的挑战，而是重新分配它们。她将AI编码时代下软件系统的债务，分为如下3种：

债类型| 存在于| 定义| 造成的后果  
---|---|---|---  
技术债 Technical Debt| 代码 (code)| 代码层的问题/捷径| 让系统难以改变  
认知债 Cognitive Debt| 人 (people)| 团队随时间对系统共享理解的侵蚀| 让团队难以理解、难以安全推理变更  
意图债 Intent Debt| 制品 (artifacts)| 目标/约束/理由未被外化捕获| 让人不知道系统到底是为什么而建  
  
### 技术债 Technical Debt

技术债是三种债里我们最熟悉的一层，它就活在代码里。1993 年 Ward Cunningham 第一次用"债"来形容那些为了赶工而欠下的代码，后来 Kent Beck、Martin Fowler 又给它配齐了一整套还债工具：测试驱动、重构、代码评审。它之所以还没那么失控，恰恰因为它看得见，无论易度量的圈复杂度、重复代码率等量化指标，还是不易度量的过度设计、逻辑晦涩等人为复杂度，程序员都能有很明显的感观，基于各种设计模式、关注点分离、复杂性治理等手段，或多或少都可以带来一些积极的变化。

> Generative AI may reduce technical debt while simultaneously accelerating the accumulation of cognitive and intent debt. 
> 
> \-- Margaret-Anne Storey From Technical Debt to Cognitive and Intent Debt  
> 
> 译：生成式 AI 可能在降低技术债的同时，加速认知债与意图债的累积。

在 AI 编程时代，技术债往往是那个最容易管理的债。基于hardness的代码重构、单测生成、代码逻辑解释、AI代码评审等等，这些恰恰是大模型擅长的。当然这并不意味着这类债务不再重要，相反它依然是软件工程要持续对抗的熵增，只是在 AI 编程时代，认知债与意图债需要引起我们额外的警惕。

### 认知债 Cognitive Debt

如果说技术债活在代码里，认知债则活在人身上。它不是某个人一时看不懂，而是一个团队对系统的“共享理解”的缺失。没有哪个人需要理解系统的全部，软件从来都是靠“足够的共享理解”分布在一群人和文档之间运转的；认知债，就是这份共享理解出现的、不断累积的空洞。

> When a developer writes code from scratch, even messy code, the friction and effort mean they build at least a partial mental model along the way. When an AI generates that same code, the developer may accept it without building the same level of understanding. 
> 
> \-- Margaret-Anne Storey From Technical Debt to Cognitive and Intent Debt 
> 
> 译：当开发者从零写代码，哪怕是烂代码，那份摩擦与投入意味着他至少在过程中建立起了部分心智模型。而当 AI 生成同样的代码，开发者可能直接接受，却没有建立起同等程度的理解。

它的形成机制才是最要命的地方。当你自己一行行敲代码时，哪怕代码写得烂，那份“卡壳”和“费劲”本身会逼着你建立起对系统的心智模型；可当 AI 替你把同样的代码生成出来，你很可能直接接受，却没有同步长出那份理解。你接手一份前人5年前的代码库，你一脸懵逼。当你连续操作着 `accept all`，5天后你就不知道程序到底是如何运行的了。

### 意图债 Intent Debt

意图债既不活在代码里，也不活在人脑中，而活在制品里：需求文档、架构决策记录、实现计划、测试、规格说明。意图债就是当这些本该指导系统演进的目标、约束和理由，从一开始就没被清晰表达、或没被记进任何人和AI都能查阅的制品时，悄悄欠下的账。当出现需要反复要澄清、给出技术正确却答非所问的方案、或因为缺上下文而烧掉远超预期的 token，这就是意图债出现的表征。

> Looking ahead, the core developer's skill may not be authoring code, but maintaining correct understanding of what the system does and why, and how it can evolve. 
> 
> \-- Hicks The New Developer 
> 
> 译：展望未来，开发者的核心技能或许不再是写代码，而是持续维护对"系统在做什么、为什么这么做、以及它能如何演进"的正确理解。

代码承载的意图（intent）不是“这段代码在做什么、怎么做的”，而是“当初为什么要这么做”，在依赖生成式 AI 之前，那个“为什么”必然在程序员的脑子里过了一遍，哪怕他懒得写注释，这份理由至少还活在人身上。当 AI 生成代码时，那些取舍是模型基于“统计上最合理的延续”当场做掉的，既没落进代码，也没落进任何人的记忆——它在生成的那一刻就蒸发了。

意图债会催生认知债（没人写下“为什么”，新人就建不起心智模型），认知债又会反过来制造技术债（不理解系统，就更容易做出糟糕的实现）。相互咬合、彼此放大，如同一个越陷越深的漩涡，而漩涡的正中心，始终是那个被悄悄让渡出去的“理解”。

## 理解的本质是为了参与

2026年7月，前 MIT 研究者、现 Notion 设计工程师 Geoffrey Litt 在 AI Engineer conference 上提到了一个观点：理解的本质不是为了验证而是为了参与，是为了让你有提出改进系统下一个想法的能力。

时间线往前推3年，当时AI主要还是做代码补全，那个时候我们确实会去验证AI推荐的next code是否正确。但3年后的今天，随着AgenticAI的发展，当我们定好SPEC，当我们定好结果验证标准时，AI甚至可以做得比我们更好。

> We don't understand to verify — we understand to participate. Your understanding of the system is what lets you have the next idea. 
> 
> \-- Geoffrey Litt（AI Engineer Conference, 2026） 
> 
> 译：我们理解代码，不是为了"验收"，而是为了"参与"。是你对系统的理解，让你能想出下一个点子。

那为什么我们还要理解，Geoffrey Litt 给出的答案是`understand to participate`。AI 让“写代码”变得更容易，但“想出下一步该做什么”这件事，仍然只能由脑子里装着系统的人来做。这个结论和 Storey 教授提出的观点如出一辙，即使你做得不够好，至少这份投入让你建立了一些心智。

一个项目从来不是“提一次需求、AI 交一次货”就结束了，它是与 Agent 之间成千上万次的循环。每一次循环之后，都需要一个人问出下一句：“那如果……会怎么样？”、“要不要换成另一种做法？”，而能不能问出下一句，取决于你脑中有没有一整套关于系统的心智模型。没有这份心智储备，你能提出的指令就只会越来越模糊、越来越同质化，最终把创造性的方向盘也拱手让出。

## Vibe Coding的自我修正

Vibe Coding提出后，由于其易上手、低门槛、快速产出的特性快速在全球流行，但当Vibe Coding真正落到生产项目中时，效果却远不及预期。高达95%的开发者表示，他们在使用AI生成代码后，必须额外花更多时间来修正错误，甚至修复错误的时间比原本节省的还多，也有网友戏称自己是大模型善后工程师。

Karpathy也发现了这个问题，并在其诞生1年后为其按上了暂停键。他认为 Vibe Coding 主要用在有趣的一次性项目、Demo 和探索上。通过 AI Agent 编程现在正在越来越多地成为专业人士的默认工作流。他提出了一个新的词汇 Agentic Engineering 来替代原来的 Vibe Coding。包括我们现在正践行的 Harness Engineering，本质也是 Agentic Engineering 思想的一个落地。

> You can outsource your thinking but you can’t outsource your understanding.  
> 
> \-- Andrej Karpathy  
> 
> 译：你可以外包你的思考，但不要外包你的理解。

Karpathy在 From Vibe Coding to Agentic Engineering 播客中提到一个观点："你可以外包你的思考，但不要外包你的理解"。AI 可以替你思考需求适合的技术方案，可以替你思考用何种算法是当下场景的最优解，但它无法替你理解这个系统为何而建，更无法替你理解核心要解决的根本问题是什么。Karpathy说，我还是这个系统的一部分，资讯还是得进到我的脑袋里，但「到底要做什么？为什么值得做？怎么分配给agent？」这些会被我们的「理解能力」所限制。

06

写在最后

最早听到「debts」这个单词，还是在《权力的游戏》中，“A Lannister always pays his debts”这句话，小恶魔经常挂在嘴边。软件世界的债从不会凭空消失，它只会被记账、被转移、被延期，如同洪水一点点漫过堤坝，它会在某个时间产生无法回转且致命的灾难。

> AI gets you 70% of the way fast. The remaining 30% is where experienced engineers earn their keep. 
> 
> \-- Addy Osmani The 70% Problem 
> 
> 译：AI 能飞快带你走完 70% 的路，剩下的 30% 才是资深工程师体现价值的地方。

AI 编程时代，单纯的coding已经逐渐被AI接管（其实我还挺享受coding这个过程的，遗憾），但代码从来只是理解的产物，不是理解本身。理解系统在做什么、理解用户要什么、理解未来方向是什么。AI 是放大器不是替代者，优势会放大，薄弱的地方同样也是。

大马士革刀会越来越锋利，但挥向何处，由握刀的人来决定，你不会被 AI 取代，前提是你还在继续长出新的理解。

## References

[01] 大马士革刀  
https://baike.baidu.com/item/%E5%A4%A7%E9%A9%AC%E5%A3%AB%E9%9D%A9%E5%88%80/3915274  
[02] Programming as Theory Building  
https://pages.cs.wisc.edu/~remzi/Naur.pdf  
[03] 《The Mythical Man-Month》   
https://book.douban.com/subject/6039354  
[04] 《Clean Code》  
https://book.douban.com/subject/3032825  
[05] 《Clean Architecture》  
https://book.douban.com/subject/26915970  
[06]  Loop Engineering   
https://baike.baidu.com/item/loop-engineering/68324937  
[07] 什么是第一性原理  
https://hr.edu.cn/xueshu/202502/t20250218_2655003.shtml  
[08] Andrej Karpathy  
https://karpathy.ai/?spm=ata.21736010.0.0.1b4a21d7q2BAI0  
[09] Vibe Coding   
https://baike.baidu.com/item/Vibe%20Coding/67529160  
[10] Margaret-Anne Storey   
https://margaretstorey.com/about/  
[11] From Technical Debt to Cognitive and Intent Debt  
https://arxiv.org/pdf/2603.22106  
[12] Geoffrey Litt   
https://www.geoffreylitt.com/  
[13] AI Engineer conference  
https://www.bilibili.com/video/BV1fAKg6kE8N  
[14] Agentic Engineering  
https://addyosmani.com/blog/agentic-engineering  
[15] Harness Engineering  
https://addyosmani.com/blog/agent-harness-engineering  
[16] From Vibe Coding to Agentic Engineering  
https://www.bilibili.com/video/BV1kw786NErV

* * *

*注：本文为作者个人技术思考与经验分享，不代表公司的官方立场或观点。文中部分论述涉及对技术趋势和发展方向的前瞻性判断，基于作者写作时的认知与经验，所有内容仅供交流参考，读者应结合自身场景独立评估。

  


  


欢迎留言一起参与讨论~
