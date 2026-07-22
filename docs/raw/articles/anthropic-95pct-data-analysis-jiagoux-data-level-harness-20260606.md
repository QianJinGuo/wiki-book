---
title: "数据级 Harness 视角：架构师 JiaGouX 解读 Anthropic 95% 数据分析 + 5 个反直觉边界"
created: "2026-06-06"
updated: "2026-06-06"
type: raw
source_url: "https://mp.weixin.qq.com/s/dLAWaUejq_FVdtyBWyo-RQ"
source_name: "架构师 WeChat MP (JiaGouX)"
author: "架构师 (JiaGouX) / 若飞"
ingested: "2026-06-06"
sha256: "ef318784186c6ce3a996822e1cbfabea50e7c1ffc625bb5990b9f63f6c06b5f4"
char_count: 8297
tags: [anthropic, data-analysis-agent, 95-accuracy, skill, semantic-layer, business-context, data-level-harness, jiagoux, silent-failure, hot-context, agent-harness, anlysis-agent, context-layer, mcp]
sources: [raw/articles/anthropic-95pct-data-analysis-skill-stack-architecture]
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
---
架构师（JiaGouX）
我们都是架构师！
架构未来，你来不来？
读 Anthropic 6 月 3 日这篇自助数据分析实践时，我一开始也被那个 95% 吸引住了。
他们说，内部约 95% 的业务分析查询，已经由 Claude 自动化处理，整体准确率也在 95% 左右。
这个数字当然抓人。
但读到后面，我反而被另一个问题卡住了：
当一个数字错了，却看起来非常专业，谁能发现它。
昨天我们聊 AI 开始进入 AI 研发的执行层。今天对象换成数据仓库，问题其实很像。
执行层变快以后，稀缺的东西会往后挪。
在研发里，是目标判断、验证吞吐、停止条件。
在数据分析里，是指标口径、权威来源、权限边界、审查流程，以及错了以后怎么回流。
我会先从这个角度看 Anthropic 这次实践：
企业数据仓库，也开始需要自己的 Agent Harness。
先看那个数字
Anthropic 原文说，内部约 95% 的业务分析查询由 Claude 自动化处理，整体准确率约 95%。
这里先把口径放清楚。
它不代表 95% 的数据科学判断都交给 Claude 了。
也不代表把模型接进数据仓库，再给业务同事一个聊天框，就能得到同样效果。
更像是这样：
大量重复、日常、口径相对稳定的数据请求，正在从“人手工查数”转到“Agent 按流程查数”。
人被释放出来以后，可以更多做因果建模、预测、机器学习和更复杂的业务分析。
这个方向并不奇怪。
很多公司内部都有类似场景：业务同事问“上周企业客户收入涨了多少”“这个实验 lift 怎么样”“某条漏斗从哪一步掉了”。
过去要找分析师排队。
现在看起来，一个 Agent 可以处理一大部分。
麻烦在于，数据分析只会查还不够。
它更怕查得很快，也查得很像那么回事，但口径从第一步就错了。
错得很安静
很多公司的 AI 数据分析，第一步很容易走成这样：
把数据仓库接给大模型。
让用户用自然语言提问。
模型生成 SQL，跑查询，返回图表和结论。
Demo 往往很好看。
比如用户问：
“上周企业客户收入涨了多少？”
模型能写 SQL，能连数据库，能画趋势图，还能顺手解释原因。
问题是，它可能在第一步就选错了定义。
“上周”是最近 7 天，还是完整自然周？
“企业客户”是否排除测试账号、欺诈账号、内部账号？
“收入”是账单收入、确认收入、净收入，还是某个业务团队自己的口径？
这些已经超出了 SQL 语法问题。
SQL 写得再漂亮，也可能查的是错表、错字段、错时间窗口。
更麻烦的是，业务用户通常看不到底层数据模型。
他只看到一个答案。
答案越流畅，越容易被转发到周报、会议、经营分析里。
Anthropic 原文里用了一个词：false sense of precision。
翻成日常一点，就是“看起来很精确”。
可它未必是对的。
数据不是代码
Anthropic 把这件事写成一句话：
Data is not software。
数据不是代码。
写代码时，Agent 有很多反馈。
测试会红，类型会报错，函数会跑不通，线上也能打日志。
模型第一次写错了，系统会给它很多反向信号。
数据分析给不了这么多硬反馈。
很多查询能跑通。
图表也能画出来。
答案仍然可能错。
错的原因不是执行失败，而是定义错了。
放到工程语言里，大概是这张表：
。
所以，AI Coding 的难点常常在执行和回归验证。
AI Analytics 的难点，先在定义。
这也是我觉得 Anthropic 这次实践值得细看的地方。
它没有停在“Claude 会写 SQL”这一层，而是把问题往前推到了业务语义、数据治理和验证闭环。
看得到，不等于用得对
很多团队第一反应会这么做：
既然模型容易选错，那就把历史 SQL、Dashboard、Notebook、字段文档都丢进检索库。
以前分析师怎么写过，Agent 现在就怎么参考。
以前看板怎么算过，Agent 现在就怎么复用。
直觉上很合理。
Anthropic 做了一个消融实验，结果有点反直觉。
他们给 Agent 直接开放数千个 Dashboard、转换模型和分析 Notebook SQL 的检索访问，结果准确率变化不到 1 个百分点。
还有一个细节更关键：
约 80% 的错误问题里，正确答案其实就在语料库中。
信息存在，模型也看到了，但它仍然没有用对。
企业要小心的地方就在这里。
RAG 解决的是“有没有材料可读”。
数据分析 Agent 要补的是另一层判断：
这次问题里，哪份材料才算权威。
哪份已经过期。
哪份只适合某个团队。
哪份不能直接套用。
a16z 今年 3 月在 
Your Data Agents Need Context
 里也讲了同一个方向：数据 Agent 的短板不在更多文本，而在能不能把业务定义、数据源、隐性知识和治理规则连起来。
Snowflake 后来讲 Agent Context Layer，也是这个意思。
信息越多，如果没有排序、归属、路由和验证，反而会变成噪声。
数据分析里的上下文，不是一堆文档。
它更像一套长期维护的工作现场。
Benn Stancil 讲上下文层时，有个提醒我挺认同：给分析师一堆工具账号，不等于完成了入职；给一个 bot 同样的数据入口，也不等于它就懂业务。
放到 AI 数据分析里，也是同一个意思。
MCP、数据库连接器、BI API、Notebook 检索，都只是把 Agent 带到数据面前。
它们不会自动告诉 Agent，“Q2 发布”指哪个产品线，“企业客户”按哪个团队口径，“收入”这周该看财务口径还是运营口径。
Atlan 对企业上下文层的说法，也正好补上这个边界：MCP 是传递上下文的线，不是上下文的生产、治理和版本系统。
所以，连接只是入口。
难的是让入口背后有一套持续更新的业务语义。
Skill 是规程
这里最值得拆的一层，是 Skills。
在 Claude Code 的体系里，Skill 通常是一个带 
SKILL.md
 的目录。
它可以带参考文档、脚本、模板和资源文件。
官方指南里有个边界：
MCP 提供工具和连接，Skill 提供做事的方法。
放到数据分析里，这个区分尤其有用。
数据库连接器告诉 Agent：能查哪些数据。
数据仓库 Skill 告诉 Agent：这类问题该怎么查。
比如一个数据仓库 Skill，至少要写清这些东西：
• 什么时候默认先查语义层；
• 什么时候要澄清时间窗口、分母、用户范围；
• 哪些指标有权威定义，哪些表已经废弃；
• 哪些问题只能返回数据，不能替业务下结论；
• 涉及隐私或受限数据时，权限由系统层拦住；
• 最终回答要带来源、数据新鲜度、置信度和负责人。
如果把一次自助分析请求画成流程，大概是这样：
《架构师》：一次自助数据分析请求的流程
流程越靠前，越需要先处理语义和红线。
这不是把 prompt 写长一点。
它是在把资深分析师的工作规程写进运行时。
先查哪里。
遇到歧义怎么问。
遇到哪些情况要停下来问。
什么时候要让另一个审查者反驳。
最后怎样交付一个可追溯的答案。
这和我们前面写 Skills 的那条线能接上。
Skill 的价值不在模板数量，而在它能不能把一次性的经验变成过程资产。
Anthropic 这次给的是生产里的硬证据：
没有 Skills，Claude 在内部分析评测里的准确率不超过 21%。
加入 Skills 后，整体长期稳定超过 95%，一些领域接近 99%。
数据级 Harness
如果把这套系统画成一张图，它大概不是“用户 -&gt; Agent -&gt; 数据库 -&gt; 答案”。
更接近这样：
这张图里，模型当然重要。
但它不是唯一主角。
让系统可用的，是围绕模型的一圈东西：
• 权威数据集减少候选项；
• 语义层提供一致指标；
• 血缘和转换图说明数据从哪里来；
• Skill 固化工作流程；
• 离线评测暴露盲区；
• 对抗性审查挑战错误假设；
• 来源页脚暴露可信度；
• 用户纠错回流到文档、评测和 Skill。
我说的数据级 Harness，大概就是这层东西。
它不保证答案永远正确。
但至少把“为什么这么查、用的是什么口径、靠什么验证、错了怎么改”放进了系统里。
95% 背后的账
这个案例，不能只看 95%。
Genloop 的评论提醒得很直接：Anthropic 的 95%，更接近一套被资深数据团队持续维护后的稳态结果，不是新团队把 Claude 接上数据仓库后的冷启动表现。
Anthropic 自己也给了不少边界。
第一，维护成本不低。
Skill 描述的是每天都在变化的数据模型。
如果不维护，几周内就会失真。
Anthropic 看到过离线准确率从约 95% 漂移到约 65%。
后来他们把 Skill Markdown 和数据转换模型放在同一个 repo 里。
数据模型 PR 如果没有同步改 Skill，会被代码审查 hook 标出来。
现在他们约 90% 的数据模型 PR 都包含 Skill 变更。
第二，验证也要付成本。
对抗性审查在评测集上带来 6% 的准确率提升。
代价是 token 增加约 32%，延迟增加约 72%。
高风险分析里，这个成本可能划算。
日常临时问题里，要按场景算账。
第三，权限不能交给提示词。
让 Agent “优先走语义层”是流程约束，不是安全边界。
行级权限、隐私字段、财务数据、客户数据，要在系统层执行。
只在 Skill 里写一句访问限制，挡不住真实风险。
第四，组织边界会断开维护链路。
数据工程、BI、财务、销售运营、产品分析，如果各自维护自己的口径和文档，Agent 看到的就会是一个拼出来的世界。
人类分析师还能靠经验知道“这个看板别用，那个字段老了”。
Agent 不一定知道。
除非这些经验被写进可维护、可审查、可过期的系统资产里。
第五，静默失败还没有彻底解法。
Anthropic 自己也承认，最难的是那种没人指出来的错误。
答案错了，但语气自然、数字完整、图表漂亮，于是它被放进汇报、周会和决策材料里。
来源页脚、领导汇报前的人审、核心 KPI 每天对权威看板，都只能降低风险。
它们只能托住一部分风险。
数据科学没有退场
这条线还可以接上 Hamel Husain 今年的 
The Revenge of the Data Scientist
。
标题有点狠，里面的意思倒很朴素：
LLM API 让很多团队觉得自己可以绕过数据科学，直接把 AI 功能接进产品。
可系统真要稳定，最后还是要回到 traces、错误分类、评测集、指标设计、标签质量、数据漂移这些基本功。
他还引用了 Josh Wills 2012 年那条经典推文：
数据科学家是比软件工程师更懂统计、又比统计学家更懂软件工程的人。
放到今天看，这句话反而更贴切。
AI 把执行层抬起来以后，很多人会以为“写代码”“写 SQL”“写报告”这些活被模型接过去了，专业角色就退场了。
我的看法偏保守一点。
角色会变，但那套能力没有退场。
它只是从“亲手产出每一个分析结果”，往“设计数据口径、评测方法、错误分类、验证流程和反馈闭环”迁移。
Karpathy 的 AutoResearch 也能放在一起看。
它让 Agent 修改训练代码，跑固定 5 分钟实验，用 
val_bpb
 指标判断有没有改进，然后保留或丢弃。
AutoResearch 好看的地方，不是“AI 自己跑实验”这句话。
而是它把自动循环放进了一个很小的 Harness：固定文件边界、固定时间预算、固定指标、可回放日志、可审查 diff。
Aakash Gupta 把这个结构往外推了一步：凡是有清楚评分的系统，都可以迁移这种循环。
这个说法不能照搬到数据分析里，但有启发。
很多业务问题没有一个像 
val_bpb
 那样干净的分数。
但高频问题、权威指标、固定口径、历史正确答案、核心看板对账，可以先凑出一批可回放的评测点。
这和 Anthropic 的数据分析实践，方向上是通的。
Agent 可以更勤快。
但系统要告诉它什么叫好，什么叫坏，什么叫停下来。
先列一张表
如果一个团队今天想试 AI 数据分析，我会先避开“公司级聊天查数入口”。
更小一点，反而更稳。
可以先列一张表：
要补的东西
先做到什么程度
高频问题
选 10 个反复被问的业务问题
权威指标
每个问题只绑定一个主口径
权威数据集
少数 canonical datasets，明确 Owner
离线评测
几十条真实问题，保留期望口径和答案依据
Skill
一个薄的知识路由，一个分析流程 Skill
输出格式
每次回答带来源、新鲜度、置信度、负责人
红线边界
PII、财务、领导汇报等场景先设人审或只返回 SQL
监控信号
语义层命中率、纠错语言比例、核心 KPI 对账结果
纠错回流
错一次，就补评测、补文档、补 Skill
这张表不花哨。
但它比“接上数据库，让模型自由发挥”更接近生产现场。
一开始覆盖面小没关系。
关键是先把闭环跑起来。
能不能稳定回答 10 个高频问题。
错了能不能复盘。
口径变了能不能同步。
权限能不能挡住。
成本和延迟能不能接受。
这些跑顺以后，再扩领域。
最后
Anthropic 分享的这套 Claude 自助数据分析，远不只是把 SQL 门槛抹掉。
它会把企业里原本藏在分析师脑子里、Dashboard 背后、Slack 讨论里、历史 SQL 里的那套隐性知识，推到系统层。
以前这些东西散一点，靠人还能兜住。
Agent 进来以后，散就会变成风险。
因为它会很快、很自信、很流畅地把一个混乱口径变成一个漂亮答案。
Anthropic 这次的 95%，我会把它读成一个提醒：
企业级 AI 数据分析的上限，不只取决于模型会不会写 SQL。
它取决于企业有没有把数据口径、业务语义、分析流程、验证机制和责任边界，工程化地封装进 Agent 的运行环境里。
昨天我们聊 AI 研发级 Harness。
今天换到数据仓库，结论差不多：
当 Agent 进入执行层，系统就要补上定义、验证和刹车。
不然它越能干，错起来也越像真的。
参考资料
1. Anthropic：How Anthropic enables self-service data analytics with Claude
https://claude.com/blog/how-anthropic-enables-self-service-data-analytics-with-claude
2. Claude Code Docs：Extend Claude with skills
https://code.claude.com/docs/en/skills
3. Anthropic：The Complete Guide to Building Skills for Claude
https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf
4. Hamel Husain：The Revenge of the Data Scientist
https://hamel.dev/blog/posts/revenge/index.html
5. Josh Wills：Data Scientist 经典定义
https://x.com/josh_wills/status/198093512149958656
6. Andrej Karpathy：autoresearch
https://github.com/karpathy/autoresearch
7. Tristan Handy：BI’s Second Unbundling
https://roundup.getdbt.com/p/bis-second-unbundling
8. a16z：Your Data Agents Need Context
https://a16z.com/your-data-agents-need-context/
9. Snowflake：The Agent Context Layer for Trustworthy Data Agents
https://www.snowflake.com/en/blog/agent-context-layer-trustworthy-data-agents/
10. Genloop：What Anthropic got right about agentic analytics, and got wrong for everyone else
https://genloop.ai/blogs/anthropic-agentic-analytics-what-they-got-right-and-wrong
11. Benn Stancil：The Context Layer
https://benn.spicytakes.org/post/2025-08-29-the-context-layer
12. Atlan：Why AI Agents Need an Enterprise Context Layer in 2026
https://atlan.com/know/why-ai-agents-need-an-enterprise-context-layer/
13. Aakash Gupta：关于 Karpathy Loop 的 X 讨论
https://x.com/aakashgupta/status/2038132294817656978
 
如喜欢本文，请点击右上角，把文章分享到朋友圈
如有想了解学习的技术点，请留言给若飞安排分享
因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享
·END·
相关阅读：
刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness
大家都在讲 Harness，但它到底该怎么理解
模型越来越强，为什么大家却开始重写 Harness
如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案
Claude Code高手的 8 个 Claude Code 实战习惯
别从 README 开始：一个架构师会怎样翻 Codex 仓库
Spec 不是代码的替代品，它是 AI Coding 的上下文管理层
如何让 Agents 自己设计、升级 Agents
OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳
Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”
一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks
Claude Code 最佳实践：把上下文变成生产力（团队可落地版）
把 AI 当成新同事：Agent Coding 的上下文与验证体系
一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论
2026年生活重启指南
我真不敢相信，AI 先加速的是工程师。
扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事
Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品
Anthropic官方万字长文：AI Agent评估的系统化方法论
银弹还是枷锁？Claude Agent SDK 的架构真相
Claude Code创始人亲授13条使用技巧
Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案
版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
架构师
我们都是架构师！

---
## 元信息
- 来源 URL: https://mp.weixin.qq.com/s/dLAWaUejq_FVdtyBWyo-RQ
- 抓取时间: 2026-06-06
- 抓取方式: urllib + js_content 提取
- 作者: 架构师 (JiaGouX) / 若飞 — 解读 Anthropic 6 月 3 日《How Anthropic enables self-service data analytics with Claude》官方博客
- 参考资料（12 个原始引用）:
- Anthropic 官方博客: https://claude.com/blog/how-anthropic-enables-self-service-data-analytics-with-claude
- Claude Code Skills 文档: https://code.claude.com/docs/en/skills
- Hamel Husain The Revenge of the Data Scientist: https://hamel.dev/blog/posts/revenge/index.html
- a16z Your Data Agents Need Context: https://a16z.com/your-data-agents-need-context/
- Snowflake Agent Context Layer: https://www.snowflake.com/en/blog/agent-context-layer-trustworthy-data-agents/
- Benn Stancil The Context Layer: https://benn.spicytakes.org/post/2025-08-29-the-context-layer
- Atlan Why AI Agents Need an Enterprise Context Layer in 2026: https://atlan.com/know/why-ai-agents-need-an-enterprise-context-layer/
- Karpathy autoresearch: https://github.com/karpathy/autoresearch
- Tristan Handy BI's Second Unbundling: https://roundup.getdbt.com/p/bis-second-unbundling
- Genloop 评论: https://genloop.ai/blogs/anthropic-agentic-analytics-what-they-got-right-and-wrong
- Josh Wills 数据科学家经典定义: https://x.com/josh_wills/status/198093512149958656
- Aakash Gupta 关于 Karpathy Loop 的 X 讨论: https://x.com/aakashgupta/status/2038132294817656978
