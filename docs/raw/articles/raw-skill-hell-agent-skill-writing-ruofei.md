 
---
source_url: https://mp.weixin.qq.com/s/9E3KgwiXPWNp7ZNjZ7Wn9A
source_title: "不是让你复制，而是让你知道：如何写好 Agent Skill"
source_author: 若飞（架构师）
ingested: 2026-07-07
sha256: d80b664272ee262534c09b7bf554fb2de356cbabe6cebbc031456fa21e1d9474
type: raw-source
---

架构师（JiaGouX）
我们都是架构师！
架构未来，你来不来？







Matt Pocock 最近在 X 上写了一句很短的话：2023: Tutorial Hell / 2026: Skill Hell。

这里的 Hell 不必按字面理解成“地狱”。开发者圈里说 Tutorial Hell，通常是指教程看了一堆，项目还是没长出来。Skill Hell 也可以这样理解：Skill 装了很多，Agent 好像更懂规程了，真实任务里反而更难判断它到底该用哪个、有没有真的走完流程。

第一次看到这句话，我以为它只是技术圈又一个顺口的梗。再去看他的writing-great-skills 和 AI Engineer World's Fair 2026 那场 Keynote，才发现它指向的是一个很工程化的问题：Skill 越来越容易下载、复制和安装以后，团队开始缺一套评估、路由、验证和修剪的方法。

它也接上了我们今年一直在梳理的 Agent 工程问题。

CLAUDE.md 让 Agent 进仓库前少猜错；夜班任务和 Loop 关心长过程里的状态、证据和停机条件；验证类 Skill 关心一件事怎么证明已经做完。

Skill Hell 补上的，是另一个更日常的问题：

当过程资产越来越多，怎么让它们不变成旧 Wiki？

我自己的理解会保守一点。好 Skill 当然会给 Agent 补充知识，但更大的价值在于让同类任务的过程更可预测：什么时候触发，先读什么，做到哪一步算完成，哪些材料按需加载，哪些话说了也不会改变行为，该删掉。

这里的“可预测”，也不是要求每次输出一样。

写作、设计、调研这类任务，本来就不该每次一样。更重要的是过程可预测：该调研时会调研，该验证时会验证，该停下时会停下，该把证据留下时不会只写一句“已完成”。

先说 Skill Hell

Matt 这个说法很有画面感，但我会稍微收着点看。

它是一个提醒，不是已经盖章的行业共识。我更关心的，是它背后的失败模式。

社区 Skill 当然可以用。放到工程现场里，问题会更具体：当可下载、可复制、可安装的 Skill 变多以后，团队能不能分辨哪一个真的会改变 Agent 的行为。

Tutorial Hell 的尴尬，是教程很多，项目没有长出来。

Framework Hell 的尴尬，是框架很多，系统边界没有稳定。

Skill Hell 换了一种形态：目录里装了很多 Skill，Agent 看似更懂规程，真实任务里却开始误触发、漏触发、提前完成，或者每次都把半本 Wiki 带进上下文。

这类失败比编译报错更隐蔽。

它不一定表现为“Agent 完全不会”。很多时候，输出还挺像那么回事，只是过程没有走完：该查的源文件少查了两个，该核的来源没有核，该停下问人的地方继续往前编，该留下的证据只剩一句“已完成”。

放到工程里，我会先拆成几件事：

•路由问题：这么多 Skill，什么时候该触发，什么时候不该触发；
•上下文问题：哪些内容常驻，哪些内容触发后才读；
•执行问题：Agent 到底按什么步骤做，做到哪里算完成；
•维护问题：哪些规则过期了、重复了、只是看起来正确。

所以，光把团队知识搬进 Markdown 还不够。

更稳的做法，是给 Agent 的某类工作流做一小段接口设计：输入是什么，触发条件是什么，过程怎么跑，证据怎么留，什么时候停止。

图 1：Skill 在 Agent Harness 里的位置

图 1：Skill 在 Agent Harness 里的位置
先说结论
• 好 Skill 先解决过程稳定性，再谈知识完整性。
• Skill Hell 更像一个治理提醒：Skill 变多以后，团队更需要路由、验证和修剪。
•description 是路由契约：它决定 Agent 什么时候想到这个 Skill，也决定什么时候不该用。
•SKILL.md 主文件只放会改变行为的流程、分支和完成标准。长参考、模板和脚本放到后面。
• 步骤要带证据，尤其是命令、来源、文件、失败项和未验证风险。
• 外部 Skill 一旦进入团队流程，就要按软件依赖审计，也要持续删 no-op、重复和过期内容。
不是知识库

现在谈 Skill，很容易走向两个极端。

一边是把它当提示词模板：把以前常用的 prompt 改个文件名，塞进SKILL.md。

另一边是把它当知识库：把团队规范、接口说明、复盘记录、测试卡、术语表、历史备注都放进去，想着“给 Agent 看得越多越好”。

这两种写法都能起步，但很快会遇到同一个问题：Agent 读到了很多东西，却不一定知道此刻该怎么做。

Anthropic 和 OpenAI 的官方文档都把 Skills 做成文件系统资源，这个细节很重要。一个 Skill 通常不会只是一个孤立的长文档，更像一个小目录：

my-skill/
  SKILL.md
  references/
  scripts/
  assets/

加载时也不需要一次性把所有内容塞进上下文。

Anthropic 文档把它拆成三层：启动时只看元数据，触发后再读SKILL.md，需要时才访问资源文件或脚本。OpenAI Codex Skills 也是类似思路：初始上下文里只放 name、description 和路径，实际使用时再加载完整说明。

这就是 progressive disclosure，渐进式披露。

过去我们在《CLAUDE.md 拆解》里聊过一个相邻问题：Agent 进仓库前，第一眼该看到什么。CLAUDE.md 更像入口卡，负责减少启动时的错误假设。

Skill 的位置要再往后一层。

它不回答“这个仓库是什么”，而回答“遇到这类事，过程该怎么走”。

所以我会把两者粗略分开：





层次
	
主要问题
	
典型材料


入口上下文
	
Agent 进来少猜错什么
	AGENTS.md
、CLAUDE.md、项目边界、常用命令


过程接口
	
这类任务下一步怎么做
	
Skills、Runbook、验证流程、模板、脚本


硬门禁
	
哪些风险不能只靠模型自觉
	
Hooks、权限、CI、审计、发布脚本

这张表主要是为了避开一个常见错位：把入口文件写成百科，把 Skill 写成资料柜，把权限规则写成自然语言提醒。

写 Skill 时，我会先问一句更朴素的话：

这段内容会让 Agent 下一步的行为更稳定吗？

如果只是“了解背景”，可以考虑放进参考文件。

如果只是“看起来正确”，但删掉以后 Agent 行为没变化，它大概率是 no-op。

如果它会决定先读哪个文件、先跑哪个命令、什么时候停、交付什么证据，那才更适合进入主文件。

触发有成本

Skill 的第一道设计题，往往还没到SKILL.md，关键在于谁来触发。

Matt Pocock 在writing-great-skills 里把它分成两类：model-invoked 和 user-invoked。OpenAI Codex 文档里也有类似边界：可以显式调用，也可以让系统根据description 隐式匹配；配置里还能关闭 implicit invocation。

换成更直白的话，可以这样分：

• 自动触发：Agent 自己根据描述判断要不要用；
• 手动触发：人明确点名，让 Agent 读这个 Skill。

自动触发听起来更聪明，但它有成本。为了让 Agent 想起这个 Skill，系统要把它的description 放进上下文。Skill 越多，描述越多，模型要在更多候选里做路由。

手动触发省上下文，但成本转到人身上。人要记得这个 Skill 存在，也要知道什么时候该点名。

这里没有“自动更先进、手动更落后”的简单排序，更像一组取舍。





触发方式
	
适合场景
	
主要成本


自动触发
	
高频、低风险、边界清楚、触发词稳定
	
常驻描述占上下文，可能误触发


手动触发
	
低频、高影响、需要人判断、容易误伤
	
人要记得，并主动调用


Router Skill
	
手动 Skill 太多，人记不住
	
需要维护路由表和触发说明

比如“生成 commit message”“按项目规范格式化发布说明”“遇到 PDF 就抽取表格”，这类任务边界相对清楚，自动触发比较自然。

但“重构账务模块”“做安全审计”“复盘线上事故”“整理下一季度架构计划”，这类任务通常不适合让 Agent 只靠一句描述自己决定。它们需要人先确认范围、权限和风险。

这里最容易被低估的是description。

很多人会把它写成给人看的简介，比如：

description: Helps with code review.

它没有错，但路由信息太少。Agent 不知道什么场景该触发，也不知道什么场景不该触发。

我更在意两类信息：

• 它做什么；
• 用户说出哪些任务、对象或触发词时该用。

例如：

description: Review a code diff for correctness, test coverage, security risk, and scope creep. Use when the user asks for code review, PR review, diff review, security review, or asks whether a change is safe to merge.

它要解决的是路由边界，不是把简介写长。

如果 Skill 很多，description 还要继续修剪。OpenAI 文档提到，技能列表太大时会先缩短描述。关键触发词要靠前，边界要清楚，核心路由信息最好不要藏到最后。

图 2：Skill 触发与加载流程





图 2：Skill 触发与加载流程
主文件要短

Skill 的主文件很容易膨胀。

一开始只有 30 行。Agent 犯一次错，加一条。团队复盘一次，加一段。后来又把模板、示例、术语、历史坑都塞进来。几周以后，SKILL.md 就变成了旧 Wiki 的另一种形态。

token 成本当然在，但更麻烦的是注意力被摊薄。Agent 触发 Skill 后，会把主文件当成当前任务的重要指令。如果里面混着流程、背景、示例、历史备注、补充解释和过期提醒，它很难判断哪些内容此刻最该执行。

我通常会用一个三层分法来写 Skill：





层级
	
放什么
	
判断标准

description	
路由触发词、适用范围、边界
	
不读主文件时，Agent 能不能判断该不该触发

SKILL.md	
主流程、分支、完成标准、短规则
	
触发后，每次运行都会用到

references/
、assets/、scripts/
	
详细参考、模板、测试卡、术语表、确定性脚本
	
只有某些分支或某些步骤需要

Matt 的说法里，核心是 information hierarchy。信息放进去还不够，还得放在合适的层级。

这和写程序很像。

函数入口通常不适合挂满全局配置，主流程也不适合塞满所有异常说明。详细实现藏在调用者读不到的地方，后面维护起来也会麻烦。Skill 也是一样。

一个比较稳的SKILL.md，读起来可以像一张任务运行卡：

# Refund Verification

Use this skill to verify refund-related changes before reporting completion.

## Steps

1. Identify the changed refund paths.
   Completion criterion: every modified refund handler, service, and test file is listed.

2. Run the refund test subset.
   Completion criterion: command, exit code, and failing cases are captured.

3. Check external side effects.
   Completion criterion: no production credentials, live payment endpoints, or irreversible writes are used.

4. Produce evidence.
   Completion criterion: final response includes changed files, commands run, results, and unresolved risks.

## References

- For test cards, read `references/refund-test-cards.md`.
- For known gotchas, read `references/refund-gotchas.md`.
- For deterministic checks, run `scripts/check_refund_events.py`.

这里的重点在分工，格式只是外壳。

主文件里没有讲支付系统的全部历史，也没有贴十几种测试卡。它只保留每次都会改变 Agent 行为的东西：先识别范围，再跑验证，再检查副作用，最后交证据。

详细材料被放到可寻址的位置。Agent 需要时再读，读的时候也知道为什么读。

步骤要有证据

很多 Skill 看起来有步骤，其实只是建议列表。

比如：

1. Understand the task.
2. Make a plan.
3. Implement the change.
4. Test your work.
5. Summarize the result.

这当然比没有好，但对 Agent 行为的约束很弱。

“理解任务”怎么算理解了？“测试”跑哪条命令？失败时能不能继续改？“总结”里要不要区分本地测试和未验证风险？

这些问题不说清，Agent 很容易走一遍形式，然后提前宣布完成。

Matt 把这个问题叫 premature completion。Addy Osmani 在 Agent Skills 里也反复强调 exit criterion。我们前面写 Claude Code Skills 实践时，则从另一个角度讲过同一件事：验证比生成更值得写进流程。

放到真实团队里，完成标准最好满足两个条件：

• Agent 自己能判断有没有做到；
• 人接手时能快速核对证据。

比如“完成测试”这句话太弱。

我会写得更具体一点：

Completion criterion:
- `npm test -- billing/refund` has been run.
- The final response includes the exact command, exit code, and failing test names if any.
- If the command cannot run, the blocker and next human action are recorded.

它没有假设一定成功，也没有把失败藏起来。它只要求 Agent 把证据留下。

这和前面聊夜班任务时的看法是同一条线：Agent 无人值守时，最怕早上只看到一句“已完成”。更方便接手的，是状态、证据、权限边界和停机条件。

Skill 里的 completion criterion，就是把这件事压进每一步。

这里还有一个细节：完成标准不一定都写成测试。

调研类任务可以要求“每个关键断言都对应一个来源链接”；代码审查可以要求“每个高风险问题都给出文件、行号和可复现路径”；产品规格可以要求“每个需求都能映射到用户场景、非目标或验收证据”。

不同任务的证据不同，但原则类似：尽量别让 Agent 用“看起来合理”替代“可以核对”。

少点黑话

Matt 那份材料里有一个很有意思的概念：leading words。

这个词容易被误解成“给团队造一套专属暗号”。如果这样做，很快会变成另一种文档负担。

我把它理解成语义压缩。

模型训练里已经见过很多稳定概念。一个好词，能调动模型已有的过程先验，比反复写十句弱规则更有效。

比如 red-green-refactor、vertical slice、tracer bullet、maker/checker、single source of truth、Chesterton's Fence 这类词，对工程师和模型都相对有共识。

如果一个团队在 prompt、代码、文档、issue、Skill 里都稳定使用同一个词，Agent 更容易把它和同一套行为连起来。

“vertical slice”比“不要先把数据库、接口、前端分别做一大坨，先做一条能跑通的最小链路”更短，也更容易在后续任务里反复触发。

“red-green-refactor”比“先写失败测试，再写最小实现，再清理代码”更像一个可复用的工作单元。

但 leading words 有边界。

先别硬造。

一个团队内部新发明的词，如果没有清楚定义，模型没有先验。为了让它懂，反而要写更多解释。能用工程界已有词，就先用已有词。

同一个概念也别换来换去。

今天叫 vertical slice，明天叫端到端切片，后天叫最小闭环，再后来叫薄切片。人能猜到大概是一回事，Agent 的路由和执行会变得更抖。

最后，词要能改变行为。

“be careful”“be thorough”“follow best practices”这种话通常太弱。它们看起来像要求，实际很可能只是 no-op。Agent 默认也会说自己 careful，也会说自己 thorough。

更合适的词，会把行为导向具体步骤。

比如“maker/checker”会提醒实现和验收分离；“Chesterton's Fence”会提醒改旧代码前先解释它为什么存在；“single source of truth”会提醒合并重复规则，而不是继续复制一份。

leading words 的价值不在于让文章显得专业，而是让同一个词在团队里反复指向同一种做法。

难在删除

Skill 第一版写少一点，通常不是大问题。

更常见的是后面只加不删。

Agent 犯一次错，加一条“注意不要再犯”。评审发现一次问题，加一条“一定要仔细检查”。线上出一次事故，加一条“高度重视安全”。时间久了，主文件越来越长，但行为未必更稳。

这件事在工程团队里太熟了。

旧 Wiki、旧脚本、旧模板、旧 Runbook，很多时候并不缺内容，问题出在缺清理。

Skill 也一样。

Matt 的 glossary 里把几类失败模式分得很清楚：

• duplication：同一个意思散在多处；
• sediment：旧规则沉积下来，没人确认是否还有效；
• sprawl：即便每一行都还活着，文件本身也太长；
• no-op：看起来像规则，实际不改变模型行为。

这几个词很适合拿来做 Skill 体检。

我会先从 no-op 开始。

比如：

- Write clean code.
- Be careful.
- Think step by step.
- Follow security best practices.
- Make sure the solution is robust.

这些句子没错，但要问：删掉以后，Agent 行为会变差吗？

如果答案是不确定，我会先把它改成可检查动作；改不出来，就先放一放，别继续占主文件的位置。

“Follow security best practices”可以变成：

Before reporting completion, list any new external input, file write, network call, permission expansion, or secret access introduced by the change.

这条规则更长，但它会改变行为。Agent 知道要查什么，人也能核对它有没有查。

“Think step by step”通常可以删。它大概率只是让输出变长。

duplication 也很麻烦。

同一个完成标准在description、SKILL.md、references/gotchas.md 里写了三遍，短期看是在强调，长期看是在制造维护债。改一处忘两处，几轮以后 Agent 会读到互相冲突的版本。

这里更看重 single source of truth。每个规则只在一个权威位置出现，其他地方只做引用。

sediment 则要靠定期清理。

放到团队里，我会给 Skill 加一个很简单的维护动作：每次 Skill 导致明显失败，不只加规则，也顺手删一段旧内容。

这一步看着不起眼，但很有用。

它能防止 Skill 变成“只进不出”的上下文垃圾场。

外部即依赖

Skill 越容易分享，安全问题越不能轻描淡写。

Simon Willison 对 Skills 的评价很高，原因之一就是它足够简单：Markdown、少量 YAML metadata、可选脚本，很多时候一个文件就能用。简单带来了传播速度，也带来了准入问题。

Anthropic 文档在安全部分写得很直接：外部 Skill 要谨慎审计，尤其是包含脚本、网络请求、文件访问或外部依赖时。它甚至建议把 Skill 当成软件来安装。

放到团队环境里，这并不夸张。

一个 Skill 可能会让 Agent 读取文件、运行脚本、访问外部 URL、生成或修改配置、调用工具，甚至把上下文里的数据写到别处。

如果它进入了企业内部 Agent Harness，风险已经从“这段 prompt 写得好不好”，变成“这段可触发流程会不会把错误动作引进系统”。

AI Engineer World's Fair 2026 的日程里已经出现很多 Skills 相关议题，包括 Skill Engineering、Skills Without Evals、Vetting AI Skills、MCPs、CLIs and Skills 等。这个信号说明，Skill 正在从个人技巧进入工程治理。

我会用一张很土的清单看第三方 Skill：





检查项
	
要看什么


触发范围
	description
 是否过宽，会不会误触发高风险流程


文件访问
	
是否要求读取不必要的目录、密钥、配置或用户数据


脚本行为
	scripts/
 是否有网络请求、删除、写入、安装依赖、执行外部命令


外部依赖
	
是否会从 URL 拉取内容，并把外部文本当指令执行


权限边界
	
是否需要生产环境、支付、邮件、工单、数据库写权限


证据要求
	
是否有测试、日志、报告、退出条件，不能只要求“完成”


维护状态
	
作者、版本、最近更新、许可证和变更记录是否清楚

这里不需要恐慌。

但也不能因为它只是 Markdown，就把它当成普通文档。

当 Agent 有文件系统、bash、浏览器、网络和内部工具权限时，Skill 已经不再只是静态文档。它会改变 Agent 的行动路径。

先跑一个

如果一个团队今天想开始整理自己的 Skills，我自己的处理会保守一点：先不做几十个。

先选一个高频、边界清楚、能验证的流程，做一份小 Skill。比如 PR review、支付流程验证、发布前检查、日志排障、数据库迁移检查、内部 SDK 使用规范。

我会把第一版当成一个小试跑，而不是一次性搭技能库。

新建 Skill 时，可以按这个顺序走：

1. 选一个最近两周反复出现的任务，只做一个 Skill。
2. 写description，先把触发词和不适用场景写清楚。
3.SKILL.md 只保留 5 到 8 个主步骤，每一步都带 completion criterion。
4. 把模板、术语表、测试卡和长参考拆到references/。
5. 能确定执行的检查，尽量写成脚本，不让模型靠感觉判断。
6. 用 3 个真实任务试跑，记录误触发、漏读、提前完成和证据缺失。
7. 删掉 no-op 和重复内容，再决定要不要自动触发。

图 3：一个 Skill 的试跑闭环

图 3：一个 Skill 的试跑闭环

这个流程看起来慢一点，但它能避免一个常见问题：Skill 第一版还没跑稳，团队就开始复制第二十个。

跑完 3 个真实任务后，我会留一张很小的记录表。它不需要复杂系统，先能回答几个问题就够了：

记录项
	
看什么


触发
	
该触发时有没有触发，不该触发时有没有误触发


过程
	
Agent 有没有跳过调研、核对、验证这些前置动作


证据
	
最后有没有留下命令、来源、文件、失败项和风险


上下文
	
主文件有没有读太多，参考材料有没有过早进入上下文


安全
	scripts/
 有没有网络请求、写入、删除、密钥访问或外部依赖

这张表不用来打分，主要是留下变化痕迹。否则几轮修改以后，团队很容易只记得“这个 Skill 改过很多次”，却说不清它到底哪里变稳了。

如果表里连续暴露问题，我会先看三件事：触发准不准，完成标准能不能核对，主文件还能不能继续删。

如果团队已经有一批 Skills，我会先做一次 Skill Hell 体检。

不需要复杂工具，先把最常见的症状压成一张表：

现象
	
先怀疑
	
先看哪里


Agent 没触发 Skill
	description
 太泛，触发词不稳定
	description
、真实任务提示


触发后仍乱跑
	
步骤没有完成标准
	SKILL.md
、completion criterion


每次读很多材料
	
主文件塞了参考资料
	references/
、资源指针


看似完成但没证据
	
输出契约太弱
	
最终回复、证据清单


越改越长
	
没有删除纪律
	
no-op、重复规则、沉积内容

这张表很小，但能挡住很多问题。

写 Skill 的冲动通常是继续加规则。让它变稳的，很多时候是删掉那些不改变行为的漂亮话。

最后

Skill 这个词容易让人想到“能力”。

但放进 Agent 工程里，我会把它看成接口。

一个好的 Skill，把团队对某类任务的经验，压成可触发、可读取、可验证、可维护的一小段过程接口。它不像大而全的知识库，也不像一句更长的提示词。

CLAUDE.md 告诉 Agent 进仓库前少猜错什么。

Loop 和夜班任务告诉 Agent 一段长过程怎么保存状态、留下证据、遇到边界停下来。

Skill 则夹在中间，回答一个更小但很关键的问题：

下次再遇到这类事，过程能不能少一点随机。

这件事不华丽。

它需要写，也需要删；需要触发，也需要审计；需要借模型已有先验，也需要把团队自己的完成标准写清楚。

放到真实工程里，这至少是一个值得认真做的小接口：Agent 能输出结果，也能把过程留到人可以接手的程度。

参考资料
• Matt Pocock,writing-great-skills：https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-great-skills/SKILL.md
• AI Engineer,Building Great Agent Skills: The Missing Manual：https://www.youtube.com/watch?v=UNzCG3lw6O0
• Matt Pocock, X 短贴：https://x.com/mattpocockuk/status/2069737228260057412
• Anthropic, Agent Skills Overview：https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
• OpenAI, Codex Skills：https://developers.openai.com/codex/skills
• Agent Skills Specification：https://agentskills.io/specification
• Simon Willison, Claude Skills are awesome, maybe a bigger deal than MCP：https://simonwillison.net/2025/Oct/16/claude-skills/
• Addy Osmani, Agent Skills：https://addyosmani.com/blog/agent-skills/
往期相关
• 《Agent Skills 系统综述：Skills 和技术债》
• 《Claude Code Skills 实践：验证比生成更值得写进流程》
• 《CLAUDE.md 拆解：Agent 进仓库前的上下文入口》
• 《想让 Agent 在你睡觉时继续干活？先给它排好夜班》
• 《吴恩达三层 Loop：Agent 越快，人越要管慢反馈》

如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享

·END·

相关阅读：

架构排熵：Loop Engineering 的持续清理系统

Claude Code 27 条实用技巧，快速升级

我终于搞明白了：Claude Code 为什么会忽略指令了

Loop 工程实战：从任务循环到可维护闭环

CLAUDE.md 拆解：Agent 进仓库前的上下文入口

Claude、Codex、Mira 都在讲 Loop，架构师更该看什么

如何用 Claude Code 搭建自己的 AI 学习系统

Anthropic CEO 核心访谈：AI时代，企业、职场与治理

Loop详解：从ReAct到Loop Engineering，Agent到底在循环什么

Harness工程还没唱罢，Environment工程已然登场

设计Self-Harness架构：会自我改进的Harness

Fable 5 的信号：Agent 开始拼 Runtime

Anthropic工程师：我们日常如何使用Claude Code

版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!

架构师

我们都是架构师！




 