# The Interface Is No Longer the Product

## Ch03.001 The Interface Is No Longer the Product

> 📊 Level ⭐ | 15.1KB | `entities/interface-commoditization-ai-era.md`

### From Agents That Use Apps to Apps Built for Agents

A few weeks ago I was using Claude Design to put together a presentation. The interface is organized around the reasoning, not the slide. You work on the content. The deck is a consequence. The .pptx comes at the end. It is an export. The work happened somewhere else. That is a small detail that I think points to something larger. And it is not really about presentations.

For decades, the only way to modify an application's state was through a human interface. That assumption is starting to break. Most human-computer interaction has been built around two patterns: issuing commands (typing, clicking, speaking) and manipulating representations (dragging, resizing, arranging, formatting). Every productivity tool ever built is designed around one or both of those. The keyboard, the mouse, the touchscreen. That is the full vocabulary. The interface and the product were, for practical purposes, the same thing.

It worked. It got the job done. Billions of people learned to think in spreadsheets, build in slide decks, and manage work through ticketing systems. But more of that work is going to be done with, and eventually by, agents. And agents do not need a mouse. They do not need a menu. They do not need a canvas. They need structured state they can read, reason about, and rewrite.

Code has always worked this way. It is text with clear semantics. Tools can parse it, transform it, and reason about it without ever rendering it visually. That is why agents are already so capable there, and why the rest of software is about to face the same pressure.

### The Bridge and the Destination

A lot of current AI product work starts from the idea that agents should learn to use our existing applications. The agent opens the browser, clicks through menus, fills forms, moves objects around, reads documents, sends messages, updates records. It behaves like a very fast human user. This is useful. More than useful, it is probably necessary. The world already runs on existing software. Companies have years of organizational knowledge embedded in Gmail, Slack, Jira, Salesforce, Notion. If agents are going to be helpful today, they need to work inside that world. That is the bridge. But the bridge is not the destination.

Agents using existing apps help bring AI into the current software stack. Apps built for agents may change the shape of the stack itself. And there is something more valuable in that process than just short-term utility. Watching where agents struggle with existing interfaces, where the translation between intent and UI operation is most painful, is probably the most honest way to find where the structural opportunity is. The friction is the signal.

### Software Categories Are Interface History

Software categories are accidents of interface history, not natural laws. Slides. Spreadsheets. Documents. Dashboards. CRMs. Project management tools. Design tools. Workflow builders. These are not fundamental categories. They are bundles: a data model, a renderer, a human editing interface, permissions, collaboration, and import/export, all wrapped into a single product boundary. That bundling made sense when the interface was the center of the product. Build around the human, and you get human-shaped categories.

PowerPoint is not a presentation. It is a container for a presentation, built around the assumption that a human would assemble it slide by slide. Excel is not a financial model. It is a grid interface for building one. The rendered output still matters, the board still needs to see the deck, the customer still needs the pitch. But the editing interface and the artifact are different things, and we have been conflating them for so long we stopped noticing.

In an agent-native world, that bundling starts to come apart. The source of truth for a product strategy is not the slide deck, the roadmap doc, the ticket board, or the dashboard. It is the strategy itself: the goals, the bets, the risks, the owners, the metrics, the decisions. Everything else is a view. The memo, the board deck, the launch checklist, the customer brief are renderings of the same underlying object, shaped for different audiences.

### The Source of Truth Moves

Most software today makes users translate intent into operations. The user should not have to say: move this card, add this row, change this chart. They should be able to say what they are trying to make true. The most vulnerable software categories are not the ones with the weakest products. They are the ones where the gap between what the user wants and what the interface makes them do is largest.

A fair counterargument is that structured artifacts are not new. Many applications already have APIs, schemas, file formats, automations, and plugin systems. The difference is not that structure suddenly exists. The difference is what the product is organized around. Historically, the structure served the human interface. In agent-native software, the structure becomes the main control surface, and the human interface becomes one view over it. The question is not whether structure exists. It is whether the product is built around it.

The deck, the doc, the dashboard. None of them are the source of truth. They are projections.

### What Agent-Native Apps Need

Agent-native applications will have a recognizable shape. They will have a structured internal representation of the work. Not a file format, not a rendered view. A representation that captures what the artifact actually is, not just how it looks. They will have renderers that turn that structure into human-friendly views: documents, decks, dashboards, workflows, timelines, whatever format the audience needs. They will have validators that check whether the result is coherent, safe, complete, and consistent with the user's goals. They will have diff and approval systems, because humans need to understand what changed before they trust it. They will have import and export to legacy formats, because the world does not move all at once.

A chatbot next to a legacy app is not the same thing as an agent-native application. If the agent cannot read and write the structured source of truth, it is just another UI layer. A chatbot bolted onto the side is still the old product.

### Owning the Artifact Layer

AI made code abundant. It may do the same to traditional interfaces. The scarce resource becomes the structured understanding of the work: what the artifact means, how it changes, who is allowed to change it, how changes propagate, and what is consistent. That is where ownership moves. Not to the app that renders it today, but to the system that owns the artifact layer underneath.

The question worth asking is not: how do we add AI to this app? It is: what is the real object of work here, and what representation would let an agent help maintain it? For presentations, the object may be the narrative. For dashboards, it may be the metrics and their causes. For workflows, it may be the process graph. For strategy documents, it may be a structured model of the decision.

The old tools will not vanish quickly. They have distribution, habits, enterprise contracts, file compatibility, and decades of user training on their side. But the center of gravity moves. The work happens in the agent-native system. The legacy app receives the export.

The more interesting future is not only agents operating apps. It is applications designed so agents, humans, and existing tools can all work with the same underlying objects. Not because every app disappears but because the source of truth may move.

## 相关实体
- [From System Of Record To System Of Intelligence](../ch01/286-from-system-of-record-to-system-of-intelligence.html)
- [Notebook Lm](https://github.com/QianJinGuo/wiki/blob/main/entities/notebook-lm.md)
- [Claude Code Founder Harness 100 Lines](ch03/076-claude-code.html)
- [Vera Arrives Nvidia S First Cpu Built For Agents Lands At Top Ai Labs](../ch04/268-vera-arrives-nvidia-s-first-cpu-built-for-agents-lands-at-t.html)
- [Thehackernews Fake Openai Privacy Filter](../ch01/757-openai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/interface-commoditization-ai-era.md)

- [Playerzero Request Demo](https://github.com/QianJinGuo/wiki/blob/main/entities/playerzero-request-demo.md)
## 深度分析

**1. 软件类别的"界面史"真相：一切类别都是历史偶然**

文章最深刻的命题是：软件类别（Slides、Spreadsheets、Documents、CRMs 等）不是自然规律，而是界面历史的事故。当工具被设计为围绕人类界面时，你自然会得到"人类形状的类别"。这个分析揭示了 SaaS 生态系统的深层结构：现有软件产品是围绕 UI 和人类交互模式设计的，它们将数据模型、渲染引擎、权限系统、合规功能等捆绑成单一产品边界。AI 时代的重构力在于：这种捆绑不再必要，因为结构化数据层可以同时服务于多个渲染视图和多个 agent，而非仅限于一个人类用户界面。

**2. "桥"与"目的地"的战略区分：理解当前 AI 产品浪潮的真实价值**

作者将当前 agent 操作现有应用的方式（"agent 像一个很快的人类用户"）定义为"桥"而非"目的地"。这个区分的战略意义在于：大多数企业 AI 产品投资正在优化"桥"——让 agent 能够更好地操作现有的 SaaS 工具——而真正的价值在"目的地"：改变应用程序的构建基础。但"桥"是必要的：企业已经在现有工具中积累了多年的组织知识，完全绕过它们需要数年时间。这给产品策略的启示是：**短期看"桥"的价值（帮助 agent 更好地使用现有工具），长期押注"目的地"（重新设计应用的核心架构）**。

**3. 摩擦即信号：Agent 的操作困难是产品机会的探测器**

"摩擦是信号"——作者将 agent 在操作现有界面时的困难重新框架为发现结构机会的路径。Agent 需要操作现有 UI（鼠标点击、菜单导航、表单填写）的痛苦，精确地指示了"用户意图"与"界面操作"之间的翻译损失。Slack 中的"发送消息"对 agent 来说需要理解消息格式、频道结构、权限等一系列中间层操作，而实际上只需要"将这条信息传达给这个团队"。这种意图与操作之间的鸿沟就是结构重设计的机会所在。这给产品经理的启示是：**观察 agent 如何艰难地使用你的产品——那些摩擦点就是最有价值的重构目标**。

**4. 结构层的主权转移：价值存储地点的根本性迁移**

"稀缺资源变成对工作的结构化理解：artifact 意味着什么、它如何变化、谁有权改变它、变更如何传播、什么是一致的"——这是文章最接近"护城河定义"的核心论点。在 UI 为中心的时代，产品的护城河是用户体验和交互模式；在 agent-native 时代，护城河变成"谁拥有 artifact 的结构化表示层"。拥有结构层的公司可以在多个渲染视图和多个 agent 交互模式之间灵活切换，而不拥有结构层的公司只能依赖现有的 UI 导出。这意味着：数据模型设计在 2026 年的重要性远超过 UI 设计。

**5. Agent-Native 应用的解剖：五层结构**

作者给出了 agent-native 应用的明确架构描述：① 结构化内部表示（对 artifact 本身的表示，而非其渲染外观）；② 渲染器（将结构转换为人类友好的视图）；③ 验证器（检查结果是否连贯、安全、完整）；④ Diff 和审批系统（人类需要理解变更才能信任它）；⑤ 导入/导出到遗留格式（世界不是一次性移动的）。这个架构与知识图谱、本体工程、语义建模等领域高度相关——它们都在试图解决"如何结构化地表示真实世界的 artifact"。

## 实践启示

1. **审计你的产品中的"意图-操作鸿沟"**：对每个主要功能，问：agent 如果要完成这个任务，需要模拟多少次人类点击/输入？每次转换都是信息损失的机会。如果这个数字 > 3，该功能就是结构重构的候选对象。寻找那些"用户需要知道怎么做，而不是需要做什么"的工作流——这些是 agent-native 重构的最高价值目标。

2. **将产品设计问题重构为"真实工作对象是什么"**：对于一个产品经理工具，真实工作对象不是 ticket board，而是工作项的优先级决策和依赖关系。对于一个数据分析工具，真实工作对象不是 pivot table，而是指标定义和因果关系。将产品重新围绕"工作对象"而非"人类交互模式"设计，会产生完全不同的架构决策。

3. **评估"桥"投资 vs "目的地"投资的组合**：大多数公司需要两者兼有——短期通过 agent 操作现有工具获得效率提升，同时在核心产品上投入结构层重构。关键财务问题是：这两个方向的投资比例是多少？建议核心产品团队将 30% 的 AI 相关工程资源投入"结构层重构"，而非 100% 押注在"让现有 UI 可以被 agent 操作"。

4. **构建验证和 diff 能力作为产品的核心差异化**：当 agent 能够修改产品状态时，"变更是否正确"的验证变得至关重要——不仅是对系统的技术验证，也包括对用户业务目标的语义验证。能够告诉用户"这个变更会让指标 X 产生预期之外的影响"的验证系统，比能够"更快完成操作"的 agent 操作层更有长期价值。

5. **从"AI + 产品"转向"产品 = 结构层 + AI 渲染"**：不是问"我们如何在 X 产品中加入 AI 功能"，而是问"X 工作的真实对象是什么，我们需要什么结构来表示它，以及 AI 如何帮助维护这个结构"。这个框架重塑了产品优先级：最重要的投资可能不是新的 AI 模型，而是更好的数据模型设计。 [^raw/articles/interface-commoditization-ai-era.md:79-106]

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/interface-commoditization-ai-era.md)

---

