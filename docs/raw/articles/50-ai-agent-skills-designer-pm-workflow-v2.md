sha256: e0ca49ff2b5d4b18161d56b44909ffd10fc7262655eecaab030d577aeb869cb4
---
source: wechat
source_url: https://mp.weixin.qq.com/s/EUdbIkpMaVUXIMgtRuIWRw
ingested: 2026-07-01
feed_name: 技术极简主义
wechat_mp_fakeid: MP_WXS_2397057329
source_published: 2026-06-10
---

# 从需求到原型：50 个设计师与产品经理值得掌握的 AI 智能体技能

现在关于「AI 设计工具」的文章已经很多了。有的讲怎么一键生成页面，有的讲怎么快速做海报，有的讲怎么用 AI 画图、写文案、出原型。但真正落到项目里，设计师和产品经理最缺的，往往不是又一个工具入口。

更关键的问题是：  ** 能不能把需求发现、问题定义、策略梳理、原型验证、交付文档这些成熟工作方法，变成一套可以反复调用的智能体技能？  **

这篇文章要介绍的，就是这样一套工具箱。

相比空洞的「AI 提效」口号，这 50 个开源可用的 Agent Skills 真正做到了即插即用，可直接无缝安装至 Claude Code 等环境。同时，它们打破了常规的仓库分类，完全按照设计师和产品经理的真实工作流程来组织。

从需求到原型，从研究到交付，你可以把它当成一份「AI 智能体时代的产品设计技能地图」。

在正式开始之前，先记住三件事。

1. 1\.  ** Skills 会自动加载。  ** 安装之后，你通常不需要手动喊出技能名称，只要用自然语言描述问题，Claude 会判断该调用哪个技能。下面这些名字，更像是你理解工具箱结构的索引。
2. 2\.  ** Commands 和 Skills 不一样。  ** 以  ` /  ` 开头的是命令，通常代表一条明确工作流，会串联多个技能一起执行。
3. 3\.  ** 这些技能不只属于 Claude Code。  ** 很多技能遵循  ` SKILL.md  ` 这类可移植格式，Cursor、Codex CLI、Gemini CLI，甚至其他 Agent Runner 也可以复用类似思路。

##  先收藏这 5 个开源技能集合

这 50 个技能来自 5 个开源集合。建议你先收藏，不一定马上全部安装，但至少要知道这些能力从哪里来。

技能集合  |  适合场景  |  安装命令
---|---|---
Designer Skills  [1]  |  设计研究、UX 策略、设计系统、UI、交互、交付  |  ` claude install github:Owl-Listener/designer-skills  `
Inclusive Design Skills  [2]  |  包容性设计、无障碍、认知负荷、辅助技术  |  ` claude install github:Owl-Listener/inclusive-design-skills  `
AI Design Skills  [3]  |  AI 产品、智能体交互、提示词架构、风险预判  |  ` claude plugin marketplace add Owl-Listener/ai-design-skills  `
Layers  [4]  |  产品设计 7 个层次的问题诊断  |  ` npx skills add jamiemill/layers-skills  `
PM Skills Marketplace  [5]  |  产品发现、战略、PRD、实验、增长、交付  |  ` claude plugin marketplace add phuryn/pm-skills  `

这几个集合背后的思路很清楚：

** 把原本存在于高级设计师、资深产品经理脑子里的方法论，写成可以被智能体执行的工作流。  **

这也是它们和普通 AI 工具最大的区别。普通工具往往解决一个局部任务，而 Agent Skills 更像是在沉淀一套专业动作：怎么做研究，怎么定义问题，怎么写 PRD，怎么交付给研发，怎么做无障碍审查。

##  从需求到原型的 8 个关键阶段

如果只是把 50 个技能平铺出来，读者很快就会迷失方向。

更好的方式，是把它们放回真实项目流程里看：从一个模糊需求出现，到最后形成可验证、可交付的原型，中间到底有哪些关键动作可以交给智能体辅助？

下面这 8 个阶段，就是我建议设计师和产品经理优先掌握的技能地图。

###  一. 发现与研究：在动手画图前，先搞清楚问题

很多项目一开始就会犯一个错误：用户说「我想要一个 dashboard」，团队就开始画 dashboard。

但真正的需求往往藏在更深的位置：用户在什么场景下遇到问题？他们想完成什么任务？哪些只是我们自己的假设？哪些已经被行为证据支持？

这一阶段适合使用下面 10 个技能：

####  1\.  **` /layers-orient  ` ** (Layers)

用于诊断项目在产品设计 7 个层次里，真正卡住的是哪一层。它特别适合项目刚开始、大家都不知道从哪里下手的时候。它的价值在于提醒团队：不要在概念模型没想清楚的时候，急着优化界面细节。

####  2\.  **` /layers-user-needs  ` ** (Layers)

把用户需求整理成 Job Stories，输出可进入产品策略的机会点。例如，把「用户需要一个报表」改写成「当我在月底复盘业务时，我希望快速看到异常指标，这样我可以判断下一步该找谁处理」。这类表达比功能名更接近真实需求。

####  3\.  **` /layers-observed-behaviour  ` ** (Layers)

适合规划和综合用户研究，输出带有置信度的 Job Stories。这里最有用的是「置信度」。它能帮团队区分：哪些是我们真的观察到的，哪些只是推测。

####  4\.  **` user-persona  ` ** (Designer Skills → design-research)

根据研究资料生成用户画像，包括目标、挫折、行为模式等。好的人物画像不是 PPT 上的装饰，而是帮助团队理解「谁在什么情况下会做什么选择」。这个技能更适合在已有访谈、问卷或行为资料时使用。

####  5\.  **` journey-map  ` ** (Designer Skills → design-research)

生成端到端用户旅程图，包含阶段、触点、情绪、痛点和机会区域。比起画出一张漂亮的流程图，更具实操意义的成果，是借此把下一轮迭代的机会点彻底暴露出来。

####  6\.  **` empathy-map  ` ** (Designer Skills → design-research)

用 Says、Thinks、Does、Feels 四象限整理用户研究资料。当访谈记录很散、信息密度很高时，它可以帮助团队先压缩资料，再进入策略讨论。

####  7\.  **` inclusive-personas  ` ** (Inclusive Design Skills)

生成包含障碍状态、辅助技术、使用环境的包容性用户画像。无障碍应当是真实用户场景的自然延伸，绝非外挂式的特殊人群分类。对于把 Accessibility 前移到设计阶段，这个技能非常有价值。

####  8\.  **` /discover  ` ** (PM Skills → pm-product-discovery)

来自 PM Skills 的产品发现命令，覆盖创意生成、假设地图、优先级排序和实验设计。你可以把它理解为一个可执行的 Continuous Discovery Loop。

####  9\.  **` opportunity-solution-tree  ` ** (PM Skills → pm-product-discovery)

基于 Teresa Torres 的 Opportunity Solution Tree，把业务结果、机会点、解决方案和实验串起来。它适合在团队需要解释「为什么这个功能值得做」时使用。

####  10\.  **` identify-assumptions-existing  ` ** (PM Skills → pm-product-discovery)

按 Value、Usability、Viability、Feasibility 四类识别高风险假设。这其实对应 Marty Cagan 常说的产品四类风险。很多项目失败，不是因为界面不好，而是某个关键假设根本没有被验证。

这一组技能解决的是同一个问题：  ** 先不要急着产出方案，先把需求背后的真实任务、证据和风险找出来。  **

###  二. 策略与问题定义：把研究结果变成产品判断

研究结束之后，团队经常会拿到一堆素材：访谈记录、用户痛点、竞品截图、老板要求、业务目标。

真正的挑战，从来不在于获取多少信息，而在于能否将信息沉淀为直击本质的判断。

这一阶段适合使用下面 9 个技能：

####  11\.  **` /layers-product-strategy  ` ** (Layers)

把用户机会连接到业务结果和方案下注，输出策略树和优先级实验。它是研究输出和执行输入之间的桥。没有这一层，后面的设计很容易变成「看起来有道理，但不知道服务哪个目标」。

####  12\.  **` /layers-conceptual-model  ` ** (Layers)

定义产品中的对象、关系、状态和语言，不依赖具体界面。这是非常关键的一层。很多团队争论同一个页面怎么设计，本质上是在争论产品里到底有哪些对象，以及它们之间是什么关系。

####  13\.  **` /layers-domain  ` ** (Layers)

梳理领域概念、术语冲突和边界上下文，输出概念模型所需的名词集合。当产品、设计、研发、业务都在使用同一个词，但含义不一样时，这个技能很适合先跑一遍。

####  14\.  **` /strategy  ` ** (PM Skills → pm-product-strategy)

生成完整的 Product Strategy Canvas，覆盖愿景、市场、竞争、差异化、防御性等内容。当领导问「我们的策略是什么」时，不能只回答一个功能列表。这个技能能帮助团队把策略写成文档，而不是停留在感觉里。

####  15\.  **` value-proposition  ` ** (PM Skills → pm-product-strategy)

用 JTBD 结构生成价值主张：谁、为什么、之前怎样、如何解决、之后怎样、替代方案是什么。其中「之前怎样 / 之后怎样」很重要。很多价值主张写不清楚，就是因为没有讲明白用户状态发生了什么变化。

####  16\.  **` swot-analysis  ` \+  ` pestle-analysis  ` \+  ` porters-five-forces  ` ** (PM Skills → pm-product-strategy)

三个经典商业分析框架，可以配合  ` /market-scan  ` 做完整的市场环境分析。它们特别适合产品经理或设计负责人在参与更高层战略讨论前使用。

####  17\.  **` /ux-strategy:frame-problem  ` ** (Designer Skills → ux-strategy)

把模糊挑战整理成清晰的问题陈述。「我们要重做 onboarding」不是问题定义，只是一个任务。这个技能会逼你说明：谁遇到了什么问题，为什么现在要解决，成功标准是什么。

####  18\.  **` /ux-strategy:benchmark  ` ** (Designer Skills → ux-strategy)

生成结构化竞品基准分析。对于时间紧的项目，它能减少大量手动翻竞品、截图、整理表格的工作。

####  19\.  **` north-star-metric  ` ** (PM Skills → pm-marketing-growth)

定义北极星指标和输入指标，并判断业务属于注意力、交易、生产力等哪类游戏。设计师经常在指标讨论里被动接受结果。这个技能的意义是，让设计决策和产品指标之间有更清楚的连接。

这一组技能的核心价值，是把「我们感觉应该这么做」变成「我们知道为什么这样做」。

###  三. 设计系统：把界面一致性变成可维护资产

绝大多数团队的设计系统都不是纸面上的完美规划，它们往往是在一个又一个真实的业务项目中慢慢长出来的。

时间久了，就会出现颜色散落、组件状态不全、响应式规则不一致、研发实现和设计稿对不上的问题。

这一阶段适合使用下面 6 个技能：

####  20\.  **` /design-systems:tokenize  ` ** (Designer Skills → design-systems)

从已有系统或代码库中提取并整理设计 Tokens。如果你接手过一个到处都是十六进制色值、字号规则混乱的项目，就会知道这个技能有多实用。

####  21\.  **` /design-systems:audit-system  ` ** (Designer Skills → design-systems)

审计设计系统的一致性、无障碍和覆盖范围。在系统迁移、版本升级、组件库重构之前，先跑一遍审计，很适合把问题变成会议议程。

####  22\.  **` /design-systems:create-component  ` ** (Designer Skills → design-systems)

生成完整组件规格，包括 Props、变体、状态、无障碍要求和边界情况。组件文档最容易漏的就是状态和边界。这个技能的价值，在于将一张好看的视觉设计图，直接转化为研发手中一份可落地的技术规格。

####  23\.  **` /ui-design:color-palette  ` ** (Designer Skills → ui-design)

生成完整色彩系统，包括主色、辅助色、中性色和语义色，并考虑 WCAG AA 对比度。色彩系统不只是好看，还要能在真实产品里承担状态表达、层级区分和无障碍要求。

####  24\.  **` /ui-design:type-system  ` ** (Designer Skills → ui-design)

生成完整字体系统，包括字号层级、行高、响应式规则等。很多团队是在页面越做越多之后，才回头整理字体系统。这个技能可以让类型系统更早被规范下来。

####  25\.  **` /ui-design:responsive-audit  ` ** (Designer Skills → ui-design)

审查设计在不同断点下的响应式表现。它能提前发现典型的桌面优先思维：桌面端看起来很好，移动端一压缩就乱。

设计系统的本质是团队共同使用的一套产品语言，而非流于表面的组件截图堆砌。

** 当颜色、字体、组件状态和响应式规则都可以被智能体审计和补全时，设计系统才真正开始变成可维护资产。  **

###  四. 交互、状态与异常路径：把被忽略的细节提前设计出来

一个产品最容易被低估的部分，是「不顺利的时候」。

加载中、空状态、错误提示、权限不足、网络中断、部分成功、用户中途退出，这些状态往往不会出现在第一版设计稿里，却会在上线后集中暴露。

这一阶段适合使用下面 5 个技能：

####  26\.  **` /layers-interaction-flow  ` ** (Layers)

梳理交互结构和流程，输出 Breadboard notation，并包含边界场景、失败路径和待决策问题。Breadboarding 来自 Basecamp 的 Shape Up 方法，它强调先做结构决策，再进入视觉表现。

####  27\.  **` /interaction-design:map-states  ` ** (Designer Skills → interaction-design)

把组件状态和状态转换建模成状态机。加载、空、错误、部分成功、离线，这些状态越早被列出来，后面返工越少。

####  28\.  **` /interaction-design:error-flow  ` ** (Designer Skills → interaction-design)

为一个功能设计完整错误处理流程。错误状态经常只占设计稿 5% 的篇幅，却决定了用户遇到问题时是否还能继续完成任务。

####  29\.  **` cognitive-load-assessment  ` ** (Inclusive Design Skills → cognitive-accessibility)

评估流程中的认知负荷，包括记忆要求、注意力要求和决策复杂度。很多产品的问题不是「用户不会点」，而是用户在疲惫、紧张、不熟悉业务的情况下，根本承受不了这么多信息。

####  30\.  **` /cognitive-accessibility:review  ` ** (Inclusive Design Skills)

从认知负荷、清晰语言、路径指引、错误处理、焦点管理和记忆负担等角度做完整审查。这个技能的评价标准很现实：一个疲惫、陌生、没有人帮助的用户，能不能独立完成任务？

这一组技能会强迫团队看见那些经常被忽略的部分。

** 好体验固然要铺好理想路径，但其真正的金字招牌，在于用户跌落非理想路径时，产品依然能够稳稳地接住他。  **

###  五. 验证与测试：在上线前发现问题

原型的核心使命在于验证底层假设，而非停留在视觉层面的「看起来不错」。

如果没有测试计划、评价标准和实验设计，原型很容易变成一个说服老板的展示物，而不是一个帮助团队学习的工具。

这一阶段适合使用下面 5 个技能：

####  31\.  **` /prototyping-testing:evaluate  ` ** (Designer Skills → prototyping-testing)

基于 Nielsen 十大启发式原则做可用性评估，并给出严重程度排序。它适合在正式测试之前先跑一遍，快速找出明显问题。

####  32\.  **` /prototyping-testing:experiment  ` ** (Designer Skills → prototyping-testing)

设计 A/B 实验，包括假设、成功指标和样本量建议。对于设计师来说，这个技能的价值在于让实验不只是「看看哪个版本表现好」，而是有统计意义和决策标准。

####  33\.  **` /design-research:test-plan  ` ** (Designer Skills → design-research)

生成完整可用性测试计划，包括招募条件、任务设计、成功标准和观察记录表。很多可用性测试失败，不是因为访谈当天表现不好，而是测试计划一开始就没有设计清楚。

####  34\.  **` /interview prep  ` 与  ` /interview summarize  ` ** (PM Skills → pm-product-discovery)

一个用于准备访谈脚本，一个用于把访谈记录总结成 JTBD、满意度信号和行动项。同一个命令覆盖访谈前后两个阶段，可以显著减少产品经理和研究员的整理成本。

####  35\.  **` /analyze-test  ` ** (PM Skills → pm-data-analytics)

分析 A/B 测试结果，包括显著性、样本量验证，以及继续、停止或上线建议。当你看到一个「好像更高」的数据时，它可以帮你判断这到底是有效信号，还是随机波动。

验证阶段的关键，是让团队从「我觉得」走向「证据显示」。

###  六. AI 产品设计：当你设计的对象本身就是智能体

现在越来越多设计师和产品经理，不只是在用 AI 工具，而是在设计 AI 产品。

这时问题会变得更复杂。你设计的不再只是页面和流程，而是人和智能体如何轮流行动，智能体失败时怎么表达，什么时候把控制权交还给人，以及产品如何避免造成伤害。

这一阶段适合使用下面 5 个技能：

####  36\.  **` model-interaction-design  ` plugin  ** (AI Design Skills)

包含一组关于人和模型如何轮流互动的技能，例如混合主动权、轮次设计、打断处理等。如果一个 AI 产品没有认真设计 turn-taking，很容易变成用户不知道该等它、打断它，还是重新发起任务。

####  37\.  **` error-personality  ` ** (AI Design Skills → system-behavior-shaping)

设计智能体失败时的表现方式，包括语气、人格、恢复路径和说明方式。AI 产品的错误状态和传统软件不同。它不仅是功能失败，也会影响用户对产品能力和品牌的判断。

####  38\.  **` harm-anticipation  ` ** (AI Design Skills → ai-alignment-reasoning)

在上线前预判智能体可能造成的伤害。这类工作不只是模型安全，也是产品设计的一部分。哪些场景需要拒绝？哪些输出可能误导用户？哪些任务必须保留人工确认？

####  39\.  **` handoff-protocol  ` ** (AI Design Skills → design-agent-orchestration)

设计智能体之间，或智能体与人之间的交接协议。多智能体系统最容易出问题的地方，就是交接边界不清楚。这个技能会帮助团队把交接规则显性化。

####  40\.  **` prompt-architecture  ` plugin  ** (AI Design Skills)

面向产品运行时提示词的架构设计，包括约束描述、系统提示词、推理结构等。在 AI 产品里，提示词已经不只是研发实现细节，而是产品体验的一部分。

这一组技能背后的判断很重要：

** AI 产品不是在原有软件里加一个聊天框，而是要重新设计人、模型、系统之间的协作关系。  **

###  七. 执行与交付：让设计结果真正被实现

很多团队并不缺乏优秀的设计创意，真正的瓶颈往往出在后端的准确实现与工程落地上面。

PRD 写得模糊，交付文档只给了视觉稿，无障碍要求只写一句「注意可访问性」，会议讨论没有记录，风险没有提前识别。最后研发只能边做边猜，测试只能边测边补。

这一阶段适合使用下面 6 个技能：

####  41\.  **` /write-prd  ` ** (PM Skills → pm-execution)

从功能想法或问题陈述生成完整 8 部分 PRD。在智能体驱动开发里，PRD 的质量会直接决定后续实现质量。模糊输入只会得到模糊输出。

####  42\.  **` /design-ops:handoff  ` ** (Designer Skills → design-ops)

生成研发交付包，包括尺寸、行为、边界情况和 QA 清单。它适合把「设计稿」转化成「研发真的能用的说明」。

####  43\.  **` /accessibility-decisions:handoff  ` ** (Inclusive Design Skills)

生成无障碍实现规格，包括 HTML 元素、键盘行为、屏幕阅读器提示和测试用例。这比一句「做得无障碍一点」具体得多，也更容易被验收。

####  44\.  **` pre-mortem  ` ** (PM Skills → pm-execution)

做上线前风险分析，把威胁分成 Tigers、Paper Tigers 和 Elephants。这个分类很有用。不是所有风险都一样紧急，也不是所有看起来吓人的问题都值得立刻处理。

####  45\.  **` /sprint retro  ` ** (PM Skills → pm-execution)

结构化 Sprint 复盘。它能减少那种只靠情绪输出的复盘，让团队更清楚地看到流程、协作和决策上的问题。

####  46\.  **` summarize-meeting  ` ** (PM Skills → pm-execution)

把会议记录总结成决策和行动项。对产品经理和设计师来说，这是最应该常备的技能之一。被记录下来的决策会留下来，没有记录的部分很快就会消失。

真正的交付绝非简单地把设计稿丢给研发，它的本质是实现认知流转——将意图、行为、边界、测试标准和决策理由彻底讲清楚。

###  八. 个人工作基础设施：把经验沉淀成可复用资产

最后一类技能很容易被忽略，但长期价值很高。

设计师和产品经理最重要的资产，不只是某一次方案输出，而是长期积累下来的判断力：为什么当时这样选？放弃了哪些方案？哪些约束影响了决策？这次经验下次能不能复用？

这一阶段适合使用下面 4 个技能：

####  47\.  **` /designer-toolkit:write-rationale  ` ** (Designer Skills → designer-toolkit)

为已经做出的设计决策撰写 rationale。这是我认为设计师最值得安装的技能之一。因为每一次 rationale，都是把你的判断力写下来，留给未来的自己和团队。

####  48\.  **` /designer-toolkit:write-case-study  ` ** (Designer Skills → designer-toolkit)

根据项目生成作品集案例。它和设计理由文档可以共用一套素材。今天是内部文档，明天就可能成为作品集和晋升材料。

####  49\.  **` accessibility-decisions  ` plugin  ** (Inclusive Design Skills)

记录无障碍决策背后的原因，让这些知识不会因为人员变化或重构而丢失。无障碍问题在本质上往往关乎组织记忆而非单纯的技术门槛，而这一技能的核心价值，恰恰在于实现了关键知识的永久保存。

####  50\.  **` /proofread  ` ** (PM Skills → pm-toolkit)

做语法、逻辑和表达流畅度检查，并给出有针对性的修改建议。对任何要被别人阅读的文档，它都值得跑一遍。PRD、研究报告、交付说明、复盘材料，都可以用。

这一组技能的意义，是帮助你把工作过程变成资产。

** 今天写清楚一个设计理由，未来就少一次重复解释；今天沉淀一个案例，未来就多一个可复用经验。  **

##  不要一次安装 50 个：三个阶段落地路径

看到这里，你可能会想：那是不是要把 50 个技能全部装上？

我的建议恰好相反：不要一口气全装。

技能太多之后，反而会变成新的负担。更好的方式，是按当前项目需要，一次一个阶段地增加。

###  ** 第一阶段：只安装最基础的 3 类  **

刚开始不要追求完整，先装最容易进入日常流程的能力：

* •  ** Layers  ** ：从  ` /layers-orient  ` 开始，用来判断项目瓶颈。
* •  ** PM Skills 的产品发现能力  ** ：用于需求梳理、机会树、假设识别。
* •  ** Designer Skills 的 designer-toolkit  ** ：用于记录设计理由和整理决策。

这三类能力已经覆盖了发现、判断和沉淀三个关键动作。

###  ** 第二阶段：按当前项目补一个专项插件  **

接着只补一个方向，不要贪多。

如果你正在做 AI 产品，就安装  ** AI Design Skills  ** 。
如果你正在做无障碍审查，就安装  ** Inclusive Design Skills  ** 。
如果你正在重构设计系统，就重点使用  ** Designer Skills  ** 里的 design-systems 相关能力。

选择标准很简单：  ** 这个月你真实在做什么，就补什么。  **

###  ** 第三阶段：留下真正高频使用的技能  **

最后要做减法。

不是每个技能都会留下来，这很正常。真正值得保留的，是那些能稳定进入你工作流的技能。

你可以用三个问题判断：

1. 1\. 它有没有减少沟通成本？
2. 2\. 它有没有提高输出质量？
3. 3\. 它有没有帮助团队沉淀经验？

如果一个技能满足其中两个，就值得留下。

##  写到最后

这 50 个 Agent Skills 代表的变化，不是「AI 帮设计师做设计」，也不是「AI 替产品经理写文档」。更准确地说，它们让设计和产品工作里的很多专业动作，开始变得可安装、可执行、可复用。

过去，这些东西往往存在于资深从业者的经验里：

* • 怎么从访谈里提取真实需求；
* • 怎么把机会点连接到业务目标；
* • 怎么审计设计系统；
* • 怎么设计错误路径；
* • 怎么写交付文档；
* • 怎么记录设计决策；
* • 怎么验证一个原型是否真的有效。

现在，它们可以被写成 Markdown，可以被安装到工具里，可以被智能体在合适场景下调用。这才是最值得关注的地方。  ** AI 不只是帮你更快地产出页面，而是在把产品设计工作的形状本身，变成一种可以复用的能力。  **

对于设计师和产品经理来说，未来很重要的一项能力，就是组织自己的智能体工具箱：知道什么时候该调用研究技能，什么时候该调用策略技能，什么时候该调用交付技能，什么时候应该让 AI 停下来，回到人的判断。

你现在最想把哪个环节交给 AI 智能体辅助？需求分析、原型验证，还是交付文档？欢迎在评论区聊聊。

** 参考资源：  **

* •  50+ Claude Code Skills for Designers and Product Managers  [6]

####  引用链接

` [1]  ` Designer Skills:  _ https://github.com/Owl-Listener/designer-skills  _
` [2]  ` Inclusive Design Skills:  _ https://github.com/owl-listener/inclusive-design-skills  _
` [3]  ` AI Design Skills:  _ https://github.com/Owl-Listener/ai-design-skills  _
` [4]  ` Layers:  _ https://github.com/jamiemill/layers-skills  _
` [5]  ` PM Skills Marketplace:  _ https://github.com/phuryn/pm-skills  _
` [6]  ` 50+ Claude Code Skills for Designers and Product Managers:  _ https://nervegna.substack.com/p/50-claude-code-skills-for-designers  _

_
_

** 既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。  **
