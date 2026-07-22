---
source: wechat
source_url: https://mp.weixin.qq.com/s/jjJqu-Rtah7HDzEiY7z_cQ
ingested: 2026-07-10
feed_name: 高可用架构
wechat_mp_fakeid: MP_WXS_3000551159
source_published: 2026-06-17
sha256: ed89358c4d775359aa2982377126628660c86f844807cb32f19f2ef8fef86df5
---

# 别只盯着模型：Agent 真正的护城河，是这四层循环

导读：本文由 LangChain 开源开发者 Sydney Runkle 发布，指出循环设计能显著提升 AI agent 的有效性和自主性。

文章详细介绍四种循环：代理循环、验证循环、事件驱动循环和爬山循环，并展示如何用 LangChain 原语组合实现。这些循环通过自验证、事件响应和轨迹优化等机制，帮助开发者在不更换模型的情况下改进 agent 表现。

Agent 之所以有用，是因为它们能通过在现实世界中采取行动，帮助我们自动化工作。但要让 Agent 可靠地完成有价值的工作，不能只靠一个好模型，还需要一个精心设计、适配一组任务的运行框架。

Agent 的核心算法很简单：给 LLM 上下文，让它在循环中调用工具，直到任务完成。这是最基础的循环。但驱动 Agent 的循环远不止这一种。  @swyx  [1]  最近写了一篇很好的文章，讨论  "loopcraft: the art of stacking loops"  [2]  ，也就是通过叠加和扩展循环来构建更有效的 Agent。

下面是我们理解这组循环栈的方式，以及如何用 LangChain 的基础组件为每一层加上观测和控制。

##  循环 1：Agent

Agent 的核心，其实就是模型在循环中调用工具，直到任务完成。

这正是 LangChain 的  create_agent  [3]  提供的能力。选择任意模型，接入工具，你就有了一个可以工作的 Agent 循环。工具让 Agent 具备了在现实世界中采取行动的能力。

以我们的内部文档 Agent 为例，后文也会继续用它作为贯穿示例。在第一层循环中，它会收到一个改进文档的请求，模型进行规划并起草修改，然后用工具克隆仓库、读取文件、编写文档、打开 pull request，等等。

##  第 2 层：验证循环

Agent 循环可以完成工作，但它第一次产出的结果并不总是正确或一致。当一致性很重要时，通常值得在外面包一层验证循环，用来检查输出，并在结果不达标时把反馈发回给模型。

验证循环会加入一个评分器：它根据评分标准检查 Agent 的输出。如果检查失败，就把结果和反馈一起发回。评分器可以是确定性的，也可以是 Agent 式的，这里经典例子就是用 LLM 作为裁判。

RubricMiddleware  [4]  可以处理这种模式，你也可以在 create_agent 的 after_agent hook 里自己接起来。

回到文档写作 Agent 的例子，评分器会在每次尝试后运行测试，检查所有链接是否可访问，所有 CI 检查是否通过，diff 是否只覆盖实际请求的范围。捕获这几类错误不需要人工审核。

Image

一个权衡是：加入验证会增加每次运行的延迟和成本。当质量比速度更重要时，它是值得的，而大多数生产用例都属于这种情况。

##  第 3 层：事件驱动循环

Agent 开发中最重要的部分之一是集成层：把 Agent 连接到你的生态系统里，让它可以在后台运行。

事件驱动循环会把 Agent 连接到你的生态系统。一个事件触发了，新文档落地、定时任务启动、webhook 到达，然后 Agent 开始运行。Agent 不再是一个需要你手动调用的东西，而是在更大系统中持续运行的组件。

Image

LangSmith Deployment  [5]  支持触发器基础设施，包括 cron 定时任务和 webhook。cron 的一个常见例子是  openclaw  [6]  中的 “heartbeats”，它们会把你的 Agent 变成一个始终在线、主动工作的助手。

我们的文档 Agent 由  Fleet  [7]  驱动，这是我们的无代码 Agent 构建器。Fleet 的  channels  [8]  和  schedules  [9]  负责事件驱动和 cron 风格的触发。我们使用一个 channel，在有人向我们的  [ #docs ](<>) [10]  -plz Slack 频道发送消息时触发文档 Agent。

##  第 4 层：爬坡循环

前三个循环自动化的是工作。第四个循环，也可以说是最重要的循环，自动化的是改进。

每次 Agent 运行都会产生一条 trace：它记录模型做了什么、调用了哪些工具、评分器反馈是什么，等等。这些 trace 里包含很有价值的信息，能说明哪些地方有效，哪些地方无效。爬坡循环会让一个分析 Agent 读取这些 trace，并根据发现重写运行框架，给出改进后的配置。这可能包括调整 prompt、工具或评分器。

在 LangSmith 中，你可以用我们的 trace 分析 Agent  Engine  [11]  来搭建第四层循环。

继续回到文档 Agent 的例子：我们让 Engine 分析文档 Agent 的 trace 来发现问题。当多条 trace 都指向一个潜在问题时，系统会提交一个 issue，要求修改出问题的 prompt 或工具。

这里的关键动作是，返回箭头没有只是回到最上层，而是伸进内部，直接更新 Agent 循环。外层循环每跑一轮，都会让内层循环更有效。

> ** 展望：  ** prompt 和工具配置是最简单的改进对象，但选择并不止于此。对于运行开放权重模型的团队来说，爬坡循环可以接入 RL 微调，把 trace 或 eval 结果作为训练信号，用来改进模型本身。记忆、检索到的技能等辅助上下文，也可以用同样方式改进。循环是一种模式，它要优化什么，取决于你。

##  人类监督与专业判断

自动化并不意味着把人从循环中移除。在每一层，都有一些自然的位置适合加入人类监督。自动评分器可以检查链接是否可访问；但要发现表达方式是否适合目标读者，需要人来判断。这种来自上下文、经验和品味的判断，正是人工审核的价值所在。

有些专业知识应该被固化进 prompt 和工具本身，但对于敏感操作，实时人工审核是必要的，比如金融交易、数据库操作等。LangChain 让你可以直接在每一层循环里接入这些触点：

1. 在 Agent 循环中，对敏感动作或工具调用要求人工输入
2. 在验证循环中，让人类为敏感工作流担任评分器
3. 在应用循环中，输出返回给最终用户之前由人类批准
4. 在爬坡循环中，运行框架的改进在部署前经过人工审核

LangChain 的所有开源框架都把 “human in the loop” 做成了  一等公民  [12]  。

##  合在一起看

如果你更喜欢表格形式，下面是这四个循环如何叠在一起：

循环  |  做什么  |  影响  |  LangChain 基础组件
---|---|---|---
1：Agent 循环（模型 + 工具）  |  模型反复调用工具，直到任务完成  |  自动化工作  |  create_agent，任意 LangChain 支持的模型
2：验证循环（Agent + 评分器）  |  Agent 运行，输出按评分标准打分，失败则带反馈重试  |  保证质量  |  RubricMiddleware
3：事件循环（验证 + 系统）  |  事件触发 Agent 运行，并更新真实系统  |  规模化工作  |  LangSmith Deployment / Fleet channels
4：爬坡循环（系统 + 引擎）  |  生产 trace 进入分析 Agent，用来改进运行框架配置  |  持续改进  |  LangSmith Engine

这就是循环工程，或者按  @swyx  [1]  的说法，  loopcraft  [2]  在实践中的样子。像  Steipete  [13]  、  Boris  [14]  和  Andrej  [15]  这样的 AI 领导者，都已经得出了同一个结论：Agent 的潜力在于你围绕它们构建的循环。

我们已经思考循环 1 和循环 2 很久了。但现在焦点应该转向循环 3 和循环 4：把 Agent 嵌入你的生态系统，并让它们持续根据你的标准改进，价值会在这里持续累积。

Satya  这样描述组织层面的利害关系  [16]  ：那些早早建立学习循环的公司，让人类判断和 token 资本一起持续累积，将建立一种很难复制的优势。

##  致谢

感谢  @Vtrivedy10  [17]  、  @masondrxy  [18]  、  @hwchase17  [19]  和  @huntlovell  [20]  的认真审阅。

##  参考

* deepagents quickstart  [21]
* create_agent docs  [3]
* rubric middleware  [4]
* cron jobs  [22]  ,  webhooks  [23]
* langsmith engine  [11]
* fleet channels  [8]

##  参考阅读

* [ 4000行代码撑起一个Agent框架？nanobot架构深度解析 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565296&idx=1&sn=355409661a0df7e410af81e54a8337cc&scene=21#wechat_redirect>)
* [ 从 Spec 到损失函数：真正会用 AI Agent 的人，已经在设计循环 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565290&idx=1&sn=55c5f83723819b579a226427b7e848b4&scene=21#wechat_redirect>)
* [ Claude Fable 5 发布：AI 工作流的关键正在转向 Loop 循环 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565282&idx=1&sn=6af12cb99866bc3c13f859d06c07d443&scene=21#wechat_redirect>)
* [ AI 真的跑进业务了吗？GIAC 2026 深圳站 15 大专题全日程来了 ](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565274&idx=1&sn=bd7a6eca65363370092d937874decd0a&scene=21#wechat_redirect>)

####  References

1. @swyx:  https://x.com/@swyx
2. "loopcraft: the art of stacking loops":  https://www.latent.space/p/ainews-loopcraft-the-art-of-stacking
3. create_agent:  https://docs.langchain.com/oss/python/langchain/agents
4. RubricMiddleware:  https://docs.langchain.com/oss/python/deepagents/rubric
5. LangSmith Deployment:  https://info.langchain.com/agent-development-platform?utm_campaign=evergreen_agent_development_platform_cv&utm_campaign_id=23761370321&utm_ad_group_id=195261126163&utm_ad_id=805594028616&utm_network=g&utm_term=ai%20agent%20development%20platform&utm_campaign=evergreen_agents_cv&utm_source=google&utm_medium=cpc&hsa_acc=7906965105&hsa_cam=23761370321&hsa_grp=195261126163&hsa_ad=805594028616&hsa_src=g&hsa_tgt=kwd-2392721013549&hsa_kw=ai%20agent%20development%20platform&hsa_mt=p&hsa_net=adwords&hsa_ver=3&gad_source=1&gad_campaignid=23761370321&gbraid=0AAAAA-PkievTcIb-6awevyQxCB-9n-H6Z&gclid=CjwKCAjwxb7RBhA5EiwAQ-AAdF5XHKtTYLgQVrVYstdxYjTd0hcrCuqxvuACiKzOOdxcJdTza8HkwxoCDiQQAvD_BwE
6. openclaw:  https://docs.openclaw.ai/gateway/heartbeat
7. Fleet:  https://www.langchain.com/langsmith/fleet
8. channels:  https://docs.langchain.com/langsmith/fleet/channels
9. schedules:  https://docs.langchain.com/langsmith/fleet/schedules
10. [ #docs ](<>) :  https://x.com/search?q=%23docs&src=hashtag_click
11. Engine:  https://www.langchain.com/langsmith/engine
12. 一等公民:  https://docs.langchain.com/oss/python/deepagents/human-in-the-loop
13. Steipete:  https://x.com/steipete/status/2063697162748260627
14. Boris:  https://x.com/0xwhrrari/status/2064804504608887040
15. Andrej:  https://www.youtube.com/watch?v=kwSVtQ7dziU
16. 这样描述组织层面的利害关系:  https://x.com/satyanadella/status/2066182223213293753
17. @Vtrivedy10:  https://x.com/@Vtrivedy10
18. @masondrxy:  https://x.com/@masondrxy
19. @hwchase17:  https://x.com/@hwchase17
20. @huntlovell:  https://x.com/@huntlovell
21. deepagents quickstart:  https://docs.langchain.com/oss/python/deepagents/quickstart
22. cron jobs:  https://docs.langchain.com/langsmith/cron-jobs
23. webhooks:  https://docs.langchain.com/langsmith/use-webhooks
24. 原文  https://x.com/sydneyrunkle/status/2066928783534289358

如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 举办的 GIAC 深圳站值得关注。这次大会将集中讨论智能应用开发、架构演进，Loop Engineering 以及来自一线实践的经验与案例。

高可用架构读者可使用专属购票优惠码 UOp5XJcq，点击
