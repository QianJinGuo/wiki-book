---
source: wechat
source_url: https://mp.weixin.qq.com/s/RmTNIFfZe1Hyt04Q0oCcsw
ingested: 2026-07-06
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-06
sha256: 28ebef98fe1e522c21cb15c9850a3939e62097cda59a48aded4d5c3f83e7d729
---


# Claude、GLM、GPT谁才是真正的AI软件工程师？首个持续更新Visual Spec-to-App Benchmark发布

近年来，Coding Agent 正以前所未有的速度发展。从 Claude Code、OpenAI Codex 到 Cursor、Gemini CLI，大语言模型已经能够自主完成编码、调试、运行甚至部署整个 Web 应用，「AI 软件工程师」正逐渐成为现实。然而，一个新的问题也随之出现：

  


如果不给 AI 一个 GitHub Issue，而是给它一张 Figma 设计稿，它还能开发出一个真正可以交付的产品吗？

  


过去几年，SWE-bench、OpenHands 等 Benchmark 极大推动了 Coding Agent 的发展，但它们主要关注代码仓库维护和 GitHub Issue 修复。相比之下，真实的软件开发通常始于一份产品需求（PRD）和一张 Figma 设计稿，需要开发者从零构建完整的 Web 应用。这意味着，Coding Agent 面临的挑战已经从 Code Generation 逐渐演进为 Product Generation。然而，目前仍然缺少一个能够系统评测这一能力的公开 Benchmark。

  


为了解决这一问题，来自 University of Arizona、Zoom 与 Stony Brook University 的研究团队推出了 VISTA（VIsual Spec-To-App Benchmark）, 首个面向 Visual Spec-to-Web-App Coding Agents 的端到端 Benchmark。

  


不同于传统软件工程 Benchmark，VISTA 不再要求 Agent 修复已有代码，而是要求 Agent 根据产品需求、网页设计稿以及 Figma 信息，从零开始构建一个完整、可运行、具有真实交互能力的 Web 应用。

  


图 1：VISTA Online Leaderboard 持续评测 Claude、GPT、GLM、Gemini、Cursor 等主流 Coding Agent，并随着模型与 Harness 的更新实时刷新排行榜。从产品质量、开发效率和成本等多个维度比较真实的软件开发能力。

  


如果说过去大家关注的是「谁更会写代码」，那么今天，一个新的问题已经出现：谁更会开发产品？

  


VISTA Leaderboard 希望回答的，正是这个问题。从目前的排行榜来看，有三个值得关注的趋势:

  


第一，Coding Agent 的竞争，已经从模型竞争演变为「模型 + Harness」的系统竞争。 排行榜上的评测对象不再只是 GPT、Claude 或 GLM，而是模型与开发 Harness 共同组成的完整 Agent。同一模型在不同 Harness 下可能表现不同，这说明工作流设计、工具调用和执行策略，已经成为影响软件开发能力的重要因素。

  


第二，领先模型之间的差距正在缩小，但能力仍远未达到「满分」。 当前排名前列的 fable-5、Claude Opus 4.8、GPT-5.5 和 GLM-5.2 已经能够根据产品需求和 Figma 设计完成完整 Web 应用开发，但最高综合得分仍不足 0.3。这说明，尽管 Coding Agent 已经具备一定的软件开发能力，但距离稳定完成真实产品开发仍有很大的提升空间。

  


第三，「最好」并不意味着「最快」或「最省」。 排行榜显示，不同 Coding Agent 已经开始形成截然不同的工程风格。例如，目前排名第一的 fable-5 虽然取得了最高的综合得分，但平均每个任务需要消耗约 75 万 Tokens；相比之下，GLM-5.2 仅消耗约 30 万 Tokens，约为前者的一半，而 GPT-5.5 的 Token 消耗进一步降至约 28 万。不同模型在开发时间上也存在明显差异，有些模型更倾向于反复迭代，以更高的计算开销换取更好的产品质量；有些模型则更加注重开发效率，在有限成本下完成任务。

  


这也意味着，Coding Agent 的竞争正从「模型能力」逐渐演变为「工程能力」的竞争。未来的软件工程 Benchmark，不应只有一张质量排行榜，更应该同时衡量质量（Quality）、效率（Speed）和成本（Cost），真正回答 AI 是否具备独立开发产品的能力。

  


也正因为如此，VISTA 从一开始便被设计成持续更新（Living Benchmark）。随着 Claude Code、Codex、Cursor、GLM、GPT、Gemini 等模型及 Harness 持续迭代，排行榜也将不断刷新，持续记录 Coding Agent 的能力演进，而不仅仅停留在论文中的一次性实验结果。

  


论文目前已发布于 arXiv，项目网站、Benchmark、评测代码以及在线 Leaderboard 已全部开源并且上线，并将持续测试最新模型，为社区提供一个开放、持续更新的软件工程评测平台。

  


  * Paper：https://arxiv.org/abs/2605.26144 

  * GitHub：https://github.com/kaboider/VISTA_Bench 

  * Project Website & Leaderboard：https://kaboider.github.io/VIS_APP/ 

  


VISTA：一个面向真实产品开发的 Benchmark

  


图 2：VISTA 整体框架。给定产品需求、视觉设计以及 Figma 信息，Coding Agent 从零开始完成整个 Web Application 的开发，并通过统一评测框架验证最终产品质量。

  


如果说传统 Benchmark 更关注「修改代码」，那么 VISTA 更关注另一件事情：AI 是否真的能够开发一个完整的软件产品。

  


因此，VISTA 并没有把任务定义为代码补全，也没有让 Agent 修复已有仓库，而是直接从产品设计开始。对于每一个任务，Agent 都需要根据产品需求、网页截图以及 Figma 设计，自主理解页面布局、分析组件层次、选择开发框架，并最终实现一个能够运行的多页面 Web Application。与传统 Design-to-Code 工作相比，VISTA 不只是要求生成一个静态页面，而是要求 Agent 完成一次完整的软件开发流程：理解需求、检查上下文、实现页面与交互逻辑、启动应用，并在运行失败时完成调试与修复。整个 Benchmark 更加贴近现实中的软件开发，而不是理想化的网页生成任务。

  


VISTA 主要围绕三个目标展开。

  


首先，它关注真实的软件开发流程。Agent 不只是生成 HTML，而是需要完成页面导航、状态管理、交互逻辑以及应用部署等完整开发任务。

  


其次，它强调 Visual Spec 驱动的软件开发。除了自然语言需求之外，Benchmark 同时提供网页截图以及经过裁剪的 Figma 结构信息，使 Agent 能够真正理解产品设计，而不仅仅依赖文本描述。

  


更重要的是，VISTA 被设计成一个可持续更新的 Benchmark。Coding Agent 正以极快的速度迭代，传统论文中的实验结果往往只能代表某一个时间点。为了持续追踪模型能力的发展，VISTA 将长期维护在线 Leaderboard，随着 Claude Code、OpenAI Codex、Cursor、Gemini 等模型及其 Harness 的更新持续刷新评测结果，而不是停留在一组静态实验数据。

  


构建真实世界的软件开发 Benchmark

  


图 3：VISTA Benchmark 覆盖 10 类真实 Web 应用，共包含 128 个页面、3253 个交互组件以及 458 个视觉锚点。

  


一个 Benchmark 是否可信，很大程度取决于它的数据。对于 Coding Agent 而言，直接利用互联网网页构建 Benchmark 并不是一个理想选择。HTML、CSS 和 JavaScript 早已广泛存在于大语言模型的训练数据中，如果直接采用真实网页，很容易受到数据污染（Data Contamination）的影响，使模型表现被高估。因此，VISTA 并没有从网页出发，而是选择以 Figma 设计稿作为整个 Benchmark 的起点，将 Figma 渲染截图和结构化 JSON 共同作为 Ground Truth。

  


整个 Benchmark 覆盖 10 类典型 Web 应用，包括新闻、房产、招聘、论坛、旅行预订、聊天、云存储、电商、项目管理和音乐流媒体，共包含 128 个页面。为了保证评测质量，研究团队进一步裁剪原始 Figma JSON，仅保留页面布局、组件层级、文本标签以及交互目标等与开发密切相关的信息。同时，对所有页面进行了细粒度人工标注，共标注 3253 个可交互组件 和 458 个视觉锚点（Visual Anchors），为后续评测提供统一、稳定的参考。

  


相比传统网页数据集，VISTA 更关注一个问题：Agent 是否真正理解了产品设计，而不仅仅是生成了一段网页代码。

  


五种输入条件，模拟真实开发流程

  


图 4：VISTA 设计了五种 Prompt Conditions，从纯文本需求逐步增加页面截图和 Figma 结构信息，并分别评测固定技术栈与自由技术栈两种开发模式。

  


现实中的软件开发，并不存在统一的输入形式。有时开发者只有一份 PRD (Product Requirements Document) ，有时只有设计稿，也有时会直接拿到完整的 Figma 文件。为了尽可能贴近这些真实场景，VISTA 从设计信息和开发自由度两个维度设计了五种 Prompt Conditions。

  


一方面，输入从纯文本需求逐步增加页面截图和 Figma 结构信息，让 Agent 获得越来越丰富的产品上下文；另一方面，Benchmark 同时评测固定技术栈和自由技术栈两种开发模式，以分析开发约束对 Agent 表现的影响。

  


这种设计不仅能够比较不同 Coding Agent 的整体能力，还能够回答几个更加细粒度的问题：

  * 页面截图究竟能带来多少帮助？ 

  * Figma 的结构信息是否真正有价值？ 

  * 技术栈约束是否会影响 Agent 的开发能力？ 

  


相比传统 Benchmark 的单一测试设置，VISTA 更希望系统地刻画不同开发条件下 Agent 的能力边界。

  


不只是「长得像」，更要「真正能用」

  


现有不少网页生成 Benchmark 主要依赖浏览器 Agent 或大语言模型判断生成结果，虽然扩展性较好，但在复杂 UI 场景中容易受到模型本身影响，难以稳定评估真实的软件质量。

  


VISTA 采用了一种更加直接的思路：DOM-Grounded Evaluation。Evaluator 可以同时衡量两件事：生成的界面是否保留了参考结构，以及匹配上的元素是否实现了预期行为。Evaluation 分成以下四步：

  


第一步，坐标对齐。 每个参考稿都标注了关键交互目标，包含一个包围框和一个预期交互类型 (导航、文本输入、开关、外链、弹窗等)。由于生成的应用会平移、缩放或重排布局，评估器先用高置信度的语义锚点估计一个逐轴仿射变换，把参考稿坐标映射到渲染页面坐标系上。

  


第二步，DOM 元素匹配 (定位)。 Evaluator 在真实浏览器里渲染应用，把每个参考页面映射到对应的实现 URL, 再把标注目标匹配到页面上可见的可交互 DOM 候选元素。这一步本身就是一个结构一致性度量：只有当预期组件确实以真实 DOM 元素存在、且对齐后出现在参考位置附近时，才能拿到高定位分。它因此能惩罚那些纯图像指标容易漏掉的失败：视觉上看着合理却不可交互的 "画出来的按钮"、缺失的控件、错位的组件、塌陷的页面结构。

  


第三步，行为专项检查。 定位之后，Evaluator 对匹配上的 DOM 元素跑针对具体交互类型的检查，覆盖前端状态变化、导航 / 路由行为，以及任务需要时的后端或类数据库状态更新。

  


第四步，聚合。 对每个关键交互，评估器给出定位分和行为分，最终的结构 — 功能分数是两者逐项相乘后取平均:

  


  


相乘的设计意味着一个交互必须「位置对并且行为对」才能得分。

  


VISTA 的 DOM-Grounded Evaluator 结构保证每个交互都会得到定位（Localization）和行为（Behavior）两个分数，并共同决定最终得分。这意味着，一个组件只有位置正确且功能正确，才能获得高分；如果只是「画出了一个按钮」，却无法点击，或者页面布局正确却交互失效，都无法通过评测。

  


因此相比只关注视觉相似度，VISTA 的评测思路回答了一个更接近真实开发的问题：Agent 开发出来的网站，究竟能不能真正交付给用户使用？

  


不只是「做得好」，还要「做得快、做得省」

  


图 5：VISTA 除了评估最终产品质量，还持续统计不同 Coding Agent 的开发成本（Tokens）与开发时间（Wall-clock Time），帮助全面评估真实的软件工程能力。

  


对于真实的软件开发而言，最终效果只是评价标准之一。一个优秀的软件工程师，不仅需要做得好（Quality），还需要做得快（Speed）、做得省（Cost）。

  


Coding Agent 同样如此。因此，除了最终产品质量，VISTA 还持续统计每个 Agent 完成任务所消耗的 Token 和 实际开发时间（Wall-clock Time），帮助开发者从工程角度全面评估不同模型。

  


从目前的评测结果来看，不同模型之间展现出明显不同的开发策略。例如，Claude Code harness+Fable-5 整体保持了较高的产品质量，但通常会消耗更多 Token，并花费更长时间完成开发；Claude Code harness+GLM-5.2 在开发速度和 Token 消耗之间取得了较好的平衡；Codex+ GPT-5.5 则以相对较低的 Token 消耗获得了接近领先模型的性能，体现出较高的开发效率。

  


这些结果说明，未来评价 Coding Agent，不应只有一张排行榜。

  


不同模型正在形成各自不同的工程风格：有的追求最高质量，有的强调开发效率，也有的更加注重成本控制。

  


因此，VISTA 希望提供的不只是一个「谁最好」的排行榜，而是一份更加完整的 AI Software Engineer Report，帮助研究者从质量（Quality）、速度（Speed）、成本（Cost）以及后续的开发流程（Workflow）等多个维度，理解不同 Coding Agent 的真实能力。

  


不仅评测结果，也分析 Agent 如何开发

  


图 6：VISTA 对不同 Coding Agent 的开发流程进行分析，比较上下文检查、代码编写、验证以及错误恢复等行为模式。

  


除了最终得分，VISTA 还进一步分析了 Coding Agent 的开发过程。

  


研究团队将每一次开发过程拆解为上下文检查（Inspect）、代码编写（Write）、结果验证（Verify）、错误恢复（Failure Recovery）等多个阶段，从而观察不同模型在软件开发过程中的行为差异。

  


分析发现，不同模型虽然都遵循「先理解、再开发、最后验证」这一整体流程，但在开发策略上存在明显区别。例如，Claude 系列模型更倾向于反复检查上下文，并在失败后重新诊断问题，再继续开发；GPT 系列模型则采用更加多样化的修复路径，在验证和错误恢复之间切换更加频繁。这些分析不仅揭示了不同 Coding Agent 的工作风格，也为未来 Agent Workflow 的优化提供了新的研究视角。

  


相比只关注最终分数，VISTA 希望进一步回答：优秀的 Coding Agent，究竟是如何完成软件开发的？

  


一个持续演进的 Benchmark

  


不同于许多论文发布后便停止维护的 Benchmark，VISTA 更希望成为一个长期演进（Living Benchmark）。

  


未来，团队将持续引入最新模型、最新 Harness 和新的应用场景，不断更新在线 Leaderboard，与社区共同记录 Coding Agent 的能力演进。

  


从产品需求理解，到视觉设计解析；从网页生成，到交互验证；再到开发流程分析，VISTA 将「看图写网页」拆解为视觉理解、页面定位、交互行为和 Agent Workflow 等多个维度，希望为 AI 驱动的软件工程研究提供一个更加真实、开放且可复现的评测平台。

  


随着 Coding Agent 从「写代码」逐渐迈向「开发产品」，软件工程 Benchmark 也需要从代码评测（Code-Centric Evaluation）走向产品评测（Product-Centric Evaluation）。

  


我们相信，未来评测一个 Coding Agent，不应只问「它会不会写代码」，更应该问：它能不能真正交付一个产品。VISTA 希望成为回答这一问题的一个起点。

  


关于团队

  


本工作由 University of Arizona、Zoom 与 Stony Brook University 合作完成。团队长期从事 AI Agent、大语言模型、多智能体系统等方向研究，近期重点关注 AI for Software Engineering、Coding Agent 的评测、优化与应用，希望推动更加开放、可复现的软件工程 Benchmark 建设。

  


作者介绍

  


第一作者： 

  


Junjia Guo，University of Arizona Electrical and Computer Engineering 博士生（导师：Jingdi Chen），研究方向包括 Agentic AI、大语言模型（LLM）和视觉语言模型（VLM）。主要负责 VISTA Benchmark 构建、评测框架设计及 Online Leaderboard 系统开发。

  


其他作者：

  


Yuhang Yao，Zoom 高级研究工程师，研究方向包括可信多智能体网络和大语言模型后训练（Post-training），卡内基梅隆大学博士，长期从事生产级 LLM Agent 系统研发。

个人主页：https://yuhangyao.com/ 

  


Jiawei Zhou，Stony Brook University 助理教授，研究方向包括自然语言处理、机器学习、大语言模型、AI Agent、推理规划、多模态及 AI 评测。

个人主页：https://joezhouai.com/ 

  


Jingdi Chen，University of Arizona Electrical and Computer Engineering 助理教授，ANNIE Research Group 负责人，研究方向包括 AI Agent、多智能体强化学习、软件工程、网络优化、网络安全、可解释 AI、大语言模型 / 视觉语言模型（LLM/VLM）及 量子计算与人工智能交叉研究。

个人主页：https://jingdichen.com/info 

  


平台建设

  


Zimeng Pan，Google 软件工程师，卡内基梅隆大学硕士，参与 VISTA Benchmark 模型测试、Online Leaderboard 持续更新。

  


Chang Li，University of Arizona ANNIE Research Group Research Intern（导师：Jingdi Chen），参与 Coding Agent 模型测试、Benchmark 实验运行、评测数据整理及 Online Leaderboard 平台维护，支持 VISTA Benchmark 的持续更新。

  


© THE END 

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
