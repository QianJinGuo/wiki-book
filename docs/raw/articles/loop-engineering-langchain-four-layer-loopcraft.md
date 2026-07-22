---
source_url: "https://mp.weixin.qq.com/s/LQkQQjogPpi4HYNE6lDcgw"
ingested: 2026-06-18
sha256: c64b0c9cd8e2c485a4b7c5a453def9cf5151cb078b701d90cfe7fc5457331b27
---

Agent 的价值在于，它们能在真实世界中执行操作来自动化工作。但要让 Agent 可靠地完成有价值的任务，光靠好模型远远不够，还需要一套精心设计的、适配特定任务集的运行框架。

核心的 Agent 算法很简单：给 LLM 上下文，让它在循环中调用工具，直到任务完成。这是最基本的循环，但远不是驱动 Agent 的唯一循环。

理论：Loopcraft

Loopcraft（循环工艺）这个概念正在行业中获得关注，它指的是围绕 Agent 叠加循环以成倍放大其效能的技艺。正如 swyx 最近指出的[1]，来自 AI 不同领域的领军人物不约而同地得出了相同的洞察：

Steipete（@steipete[2]）说："你不应该再手动给编程 Agent 写 prompt 了。你应该设计循环，让循环去 prompt 你的 Agent。"

Boris（@0xwhrrari[3]）表达了同样的看法："我不再手动 prompt Claude 了。我写循环，循环来完成工作。"

Andrej Karpathy 在他的 Autoresearch 演讲[4]中将其定义为一个杠杆问题："要最大化工具的价值……你必须把自己从瓶颈位置移除……让系统完全自主运行……提高你的杠杆率。"

核心思想是尽可能高效地叠加循环。在每个阶段的早期，知道何时向下深入循环来处理出错的情况（提升可靠性）是有价值的。但随着模型能力提升，知道如何向上扩展循环（获取更大杠杆）可能更有价值。

Rich Sutton 为模型训练提出了"苦涩的教训[5]"。现在我们有了 Agent 的辛辣教训：

不要像过去那样亲自修修补补。把精力放在能随 Agent 数量扩展的系统上，比如目标设定和编排调度。

实践：循环工程的四个层次

以下是我们 LangChain 团队对这个循环栈的思考，以及如何用 LangChain 原语来实现每一层的实践。我们将以内部文档 Agent 作为贯穿全文的示例。

第一层：Agent 循环

Agent 的核心就是一个模型在循环中反复调用工具，直到任务完成。

这就是 LangChain 的 create_agent[6] 提供的能力。选择任意模型，接入工具，你就有了一个可运行的 Agent 循环。工具赋予了 Agent 在真实世界中执行操作的能力。

以我们的内部文档 Agent 为例（后文将持续使用这个例子）。在第一层循环中，它接收文档改进请求，模型规划并起草修改，然后使用工具来克隆仓库、读取文件、编写文档、提交 PR 等。

第二层：验证循环

Agent 循环能完成工作，但第一次产出不一定总是正确或一致的。当一致性很重要时，可以在外层包裹一个验证循环，检查输出质量，并在不达标时将反馈发回给模型。

验证循环引入了一个评分器：它根据评判标准检查 Agent 的输出，如果不通过，就带着反馈将结果返回。评分器可以是确定性的，也可以是基于 Agent 的（LLM 作为评判者是一个经典示例）。

RubricMiddleware[7] 可以处理这个模式，你也可以通过 create_agent 的 after_agent 钩子自行实现。

对于文档 Agent 的例子，评分器在每次尝试后运行测试，检查所有链接是否可达、所有 CI 检查是否通过、diff 是否只包含请求的改动。无需人工审查就能捕获这类错误。

一个权衡点：添加验证会增加每次运行的延迟和成本。当质量比速度更重要时（大多数生产环境都是如此），这是值得的。

第三层：事件驱动循环

Agent 开发中最重要的环节之一是集成层：将 Agent 连接到你的生态系统，让它在后台运行。

事件驱动循环将 Agent 接入你的生态系统。一个事件触发（新文档落地、定时调度触发、Webhook 到达），Agent 就会运行。Agent 不再是你手动调用的东西，它是在更大系统中持续运行的组件。

LangSmith Deployment 支持触发基础设施，包括 cron 调度和 Webhook。cron 的一个流行用法是 openclaw 中的"心跳"机制，它将 Agent 变成一个始终在线的主动助手。

我们的文档 Agent 由 Fleet（我们的无代码 Agent 构建器）驱动。Fleet 的 channels 和 schedules 处理事件驱动和定时触发。我们使用一个 channel，让文档 Agent 在 #docs-plz Slack 频道收到消息时自动启动。

第四层：爬坡循环

前三层循环自动化了工作本身。第四层（也可以说是最重要的一层）自动化的是改进过程。

每次 Agent 运行都会产生一条 trace：记录模型做了什么、调用了哪些工具、评分器的反馈等。这些 trace 包含了关于什么有效、什么无效的高价值信号。爬坡循环让一个分析 Agent 在这些 trace 上运行，并利用发现来改写框架配置。改写范围包括 prompt/工具调整或评分器调整。

在 LangSmith 中，你可以使用 Engine（我们的 trace 分析 Agent）来实现第四层循环。

继续文档 Agent 的例子，我们用 Engine 分析文档 Agent 的 trace 来发现问题。当多条 trace 指向同一个潜在问题时，系统会创建一个 issue，请求修改相关的 prompt 或工具。

这里的关键在于：反馈箭头不仅仅是回到顶部重新开始，它深入内部，直接更新 Agent 循环本身。外层循环的每一次迭代，都会让内层循环变得更高效。

展望未来：prompt 和工具配置是最容易改进的部分，但不是唯一的选项。对于使用开源模型的团队，爬坡循环可以接入 RL 微调，将 trace 或评估结果作为训练信号来改进模型本身。记忆和检索到的技能等辅助上下文也可以用同样的方式改进。循环是模式，它优化什么取决于你。

人类监督与专业判断

自动化不意味着把人从循环中移除。在每一层，都有人类监督能增加价值的天然节点。自动化评分器可以检查链接是否可达，但需要人来判断内容的表述是否适合目标受众。这种来自上下文、经验和品味的判断力，正是人类审查不可替代的地方。

有些专业知识应该被编码到 prompt 和工具中，但对于敏感操作，实时的人类审查是必不可少的（比如金融交易、数据库操作等）。LangChain 让在每一层循环中加入这些人工节点变得很简单：

在 Agent 循环中，敏感操作/工具调用前要求人类确认
在验证循环中，人类可以担任敏感工作流的评分者
在应用循环中，人类可以在输出返回给最终用户前进行审批
在爬坡循环中，框架改进可以在部署前经过人类审查

LangChain 的所有开源框架都将"人在循环中"作为一等原语。

汇总

如果你更喜欢表格视图，以下是四层循环的整体结构：

循环 | 作用 | 影响 | LangChain 原语
第一层：Agent 循环（模型 + 工具）| 模型反复调用工具直到任务完成 | 自动化工作 | create_agent，任意 LangChain 支持的模型
第二层：验证循环（Agent + 评分器）| Agent 运行后，输出按标准评分，不通过则带反馈重试 | 保证质量 | RubricMiddleware
第三层：事件循环（验证 + 系统）| 事件触发 Agent 运行，更新真实系统 | 规模化运作 | LangSmith Deployment / Fleet channels
第四层：爬坡循环（系统 + Engine）| 生产 trace 输入分析 Agent，改进框架配置 | 持续改进 | LangSmith Engine

这就是循环工程（或者如 @swyx 所说的 loopcraft）在实践中的样子。Steipete、Boris、Andrej 等 AI 领域的领军人物都得出了相同的结论：Agent 的潜力在于你围绕它们构建的循环。

我们对第一层和第二层循环已经思考了很久。但重心应该转向第三层和第四层，在那里，将 Agent 嵌入你的生态系统并使其根据你的标准持续改进，价值会不断累积。

Satya 从组织层面总结了利害关系：那些尽早构建学习循环的公司（让人类判断力和 token 投入共同复利增长），将建立起难以复制的优势。

参考链接：

[1] https://www.latent.space/p/ainews-loopcraft-the-art-of-stacking
[2] https://x.com/steipete/status/2063697162748260627
[3] https://x.com/0xwhrrari/status/2064804504608887040
[4] https://www.youtube.com/watch?v=kwSVtQ7dziU
[5] http://www.incompleteideas.net/IncIdeas/BitterLesson.html
[6] https://docs.langchain.com/oss/python/langchain/agents
[7] https://docs.langchain.com/oss/python/deepagents/rubric
