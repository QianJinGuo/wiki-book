# The Shape of the Thing

## Ch01.247 The Shape of the Thing

> 📊 Level ⭐⭐ | 22.5KB | `entities/the-shape-of-the-thing.md`

# The Shape of the Thing

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-shape-of-the-thing.md)

> 来源：One Useful Thing (Ethan Mollick)，2026-03-12。Mollick 在 2023 年写过一篇《The Shape of the Shadow of the Thing》推测 AI 的形态。三年后这篇《The Shape of the Thing》直接给出他对当下形势的判断：**「我们能比以前更清楚地看到那个 Thing 了，也能看到它带来的一些后果」**。文章核心论点：AI 进入了 agentic 阶段 + 指数级能力提升 + 工作形态被激进重写，这三件事正在组合成一种「rolling disruption」的环境，每一周都可能发生一夜之间的格局变化。

## 摘要

2023 年 10 月 Mollick 写过《The Shape of the Shadow of the Thing》推测 AI 接下来几年会变成什么样。三年后的这篇更新版判断 — 我们现在能比以前更清楚地看到那个 Thing 了。三件事让这次判断变得可能：能力曲线的指数形态、agentic AI 的成熟、组织形态开始被激进重写。

文章里 Mollick 把他对当下形势的判断总结成一句话：**「这是管理 AI 的时代，而不是和 AI 一起工作的时代」**。

## 核心要点

### 1. 从 co-intelligence 到 managing AIs

Mollick 把 ChatGPT 之后的人机协作形态定义为「co-intelligence」 — 人和 AI 通过 prompt 来回对话获得任务帮助。从 2025 年末开始，我们进入了一个新时代，得益于 Claude Code、OpenAI Codex、OpenClaw 这类 AI agent。

这些 AI 系统的特征是：你可以直接把工作 — 有时是若干小时的工作 — 交给它们，几分钟内拿到合理且有用的结果。**这是一个管理 AI 的时代，而不是和 AI 一起工作的时代**。

### 2. 指数曲线：Otter Test 与能力轨迹

Mollick 用了他著名的 Otter Test 来说明能力跃迁：在 2022 年（ChatGPT 发布那年）到 2025 年之间，让不同 AI 图像模型画「otter on a plane using wifi」，结果进步的速度既快又显著。

2025 年 4 月那张图之后又发生了什么？图像接近完美之后，视频成了新前沿，同样经历了指数级的提升。Mollick 拿 Bytedance 当时最先进的视频模型（美国还没发布）试了一个 prompt：「一部关于水獭如何看待 Ethan Mollick 的『Otter Test』的纪录片」，单次结果几乎完美 — 除了一个发音错误，水獭被动画成有人的表情。

视频模型虽然酷，但不一定代表有用的 agentic AI 能做什么。Mollick 转向 AI 能力的 benchmark — 同样能看到指数曲线。最有名的是 METR Long Tasks 图，它通过测量 AI 在一定可靠度下能自主完成多少人类工作来追踪 AI 进步。METR 自己都指出过这张图的一些问题，但大多数 AI 能力曲线都有类似的形态。

### 3. 四张指数曲线的多样性

Mollick 选了四个困难且多样化的 AI 测试做了进度图：

- **Google-Proof Q&A benchmark**：研究生在自己领域外用 Google 只能拿 34%、领域内 70% 左右，最佳 AI 现在拿到 94%。
- **GDPval**：行业专家评判 AI 与有经验人类在复杂任务上的表现，最新 AI 在 82% 的情况下达到或超过顶级人类。
- **Humanity's Last Exam**：大学教授出的非常难的问题集。
- **AI 解谜能力**（可以在 ppbench.com 试）。

每张图都展示了类似的快速能力增长，至少在达到测试上限前没有减速迹象。但 Mollick 提醒：所有这些测试都有自己的缺陷，AI 仍然有 jagged frontier — 在某些任务上能力很强，在另一些上又会犯错。

### 4. Software Factory：激进组织实验

几周前，StrongDM（一家专注于访问控制的安全软件公司）一个三人团队宣布建了一个「Software Factory」 — 一种完全依靠 AI 来写、测、上线生产软件的工作方式，过程中没有人类参与。

这条路径里有两条相当激进的规则：

- 「Code must not be written by humans」
- 「Code must not be reviewed by humans」

驱动这个 Factory 的成本结构是：每位人类工程师被期望在 AI token 上花掉相当于自己薪水的金额，至少 1000 美元/天。

Factory 的基本思路是：把人类写的产品路线图拿过来，把它们变成产品。编码 Agent 按路线图构建软件，测试 Agent 在模拟客户环境里测试软件（模拟客户环境由测试 Agent 按需搭建）。这些 Agent 之间互相反馈、来回迭代，直到结果让 AI 满意。然后人类审阅成品，结果直接上线给客户，**没有任何人碰过甚至看过底层代码**。

StrongDM 公开分享了很多细节，Simon Willison 和 Dan Shapiro 也都写了他们观察 Factory 运行的报告。Mollick 认为 Software Factory 的具体细节不那么重要，重要的是这种激进的实验现在不仅可能，而且很可能是必要的。AI 已经好到能改变组织的运作方式，实验才刚刚开始 — 即使模型仍在继续进步。

### 5. 一周内的三件事：rolling disruption 的具象

Mollick 列举了 2026 年 2 月 22-27 日这一周内发生的真实事件，作为「rolling and unpredictable environment」的具象：

- **2 月 22 日**：Citrini Research — 一家鲜为人知的金融公司 — 发布了一份关于 AI 到 2028 年可能如何摧毁多家成熟企业的虚构情景。这份报告里有不少明显夸张的元素，但戳中了华尔街的痛点，导致股价大幅波动。
- **2 月 26 日**：金融科技公司 Block 宣布裁员 40%，暗示原因是 AI。AI 的作用很可能被大大夸大了 — AI 只是被用作大规模裁员的借口。
- **2 月 27 日**：五角大楼与 AI 公司 Anthropic 之间发生了一场公开冲突，焦点是谁应该控制 Claude 被政府使用时的规则。

每件事的真实情况都比表面看起来复杂得多 — Citrini 报告是虚构，Block 裁员不是关于 AI，AI 在战争中的冲突涉及很多复杂的法律问题。Mollick 认为这一周很好地说明了「近期未来会是什么感觉」：**AI 能力的突然披露 → 市场快速反应；AI 对工作的真实影响越来越明显（无论短期好坏仍有争议）；AI 公司与全球政策制定之间的纠缠越来越深**。

赌注变大之后，事情很可能感觉会更加不稳定。

### 6. Recursive Self-Improvement：已经不再是科幻

Mollick 的关键提醒之一：AI 公司正在相当明确地告诉我们下一步是什么 — recursive self-improvement（RSI），递归自我改进。这个想法是：AI 系统越来越多地被用来构建更好的 AI 系统，形成反馈循环，可能加速前面展示的指数曲线。

在 1 月的达沃斯论坛上，Anthropic 的 Dario Amodei 解释说，如果你做出擅长编码和 AI 研究的模型，你可以用它们来构建下一代模型，加速循环。他提到 Anthropic 内部的工程师几乎不再亲自写代码。当 OpenAI 在 2 月发布最新 Codex 模型时，公司声明它是「我们第一个在创造自己过程中起到关键作用的模型」。Google DeepMind 的 Demis Hassabis 在同一场达沃斯小组讨论中也承认，关闭自我改进循环是所有主要实验室正在积极推进的事 — 即使他警告说仍然有缺失的能力和真实的风险。

Mollick 的判断：我们不知道这条线能走多远。RSI 是几十年来一直是理论概念，实验室可能会遇到瓶颈（算力、数据、AI 研究本身的难度）。我们也不知道基于 LLM 的 AI 最终是否会撞上无法突破的天花板，或者 jagged frontier 是否永远不会被磨平。Mollick 不认为有什么是确定的，但他认为我们已经过了 RSI 是科幻的阶段 — 它现在是每一家主要 AI 公司路线图上的一个明确项。如果循环真的闭合，我们一直在看的指数曲线会变得更陡，终点不确定。

### 7. 不确定性不是无能为力

Mollick 结尾给出了一个不那么悲观的判断：不确定性不是无能为力。当一项技术如此强大又如此不稳定时，个人和组织现在做的选择更重要。我们能看到那个 Thing 的形态，但仍然能影响 Thing 本身，以及它对我们所有人的意义。我们显然还没有 AI 如何在学校、政府、企业里被使用的规则和角色模型 — 这是问题，但也意味着**每个组织现在搞出一个好用的 AI 方式，都在为其他人立先例**。塑造那个 Thing 的窗口可能不会持续太久，但它现在就在这里。

## 深度分析

### 「Shape of the Thing」的三个轴

Mollick 用一个清晰的三轴框架描述当下 AI 的形态：

| 轴 | 描述 | 工程含义 |
| --- | --- | --- |
| Practical agents | Claude Code、Codex、OpenClaw 等 agent 已经能接住小时级的人类工作 | harness 的成本急剧下降，agent 工程的边界从「能做什么」转向「能稳定交付什么」 |
| Jagged exponential improvement | 能力曲线在多个 benchmark 上都是指数级，jagged frontier 仍然存在 | 选型时要按任务类型而非平均能力判断；评测要多样化 |
| Radical experimentation with work | Software Factory 等激进实验已经出现 | 组织形态的实验空间前所未有；组织设计从「最优解」变成「假设驱动」 |

这三个轴不是独立变量，而是相互放大 — agent 让激进实验变得可能，指数曲线让激进实验的回报变得不可预测，工作形态的实验又反过来为下一代 agent 提供真实反馈。

### Software Factory 的工程边界

StrongDM 的 Software Factory 是 2026 年最有代表性的 AI 组织实验之一。把它拆开看，关键设计是：

| 设计选择 | 含义 | 风险 |
| --- | --- | --- |
| 「Code must not be written by humans」 | 完全外包给编码 agent | 工程知识 / 上下文 / 质量判断的累积会怎么发生 |
| 「Code must not be reviewed by humans」 | 完全外包给测试 agent | 测试 agent 的盲区怎么发现 |
| 工程师预算至少 1000 美元/天花在 AI token | 资本结构上把 AI 当员工 | 投入产出比失控风险 |
| 模拟客户环境由测试 agent 按需搭建 | 测试环境自动化 | 模拟与现实的 fidelity 差距 |
| Agent 之间互相反馈迭代 | 多 agent 协同 | 错误累积、幻觉传播 |

StrongDM 公开分享了技术细节，Simon Willison 和 Dan Shapiro 的观察报告是这个领域目前最值得读的实战记录。Mollick 强调 Software Factory 的具体细节不那么重要 — 重要的是这类激进实验现在不仅可能，而且很可能是必要的。

### Rolling disruption 的工程含义

Mollick 描述的「rolling disruption」是一种特殊的不确定性形态 — 不是单次冲击，而是连续不断的轻度冲击叠加成长期不稳定。具体表现：

- AI 能力突然披露 → 市场快速反应（如 Citrini 报告）
- AI 对工作的真实影响越来越明显（如 Block 裁员风波，无论真假）
- AI 公司与政策制定之间的纠缠越来越深（如 Anthropic × 五角大楼冲突）

对组织 / 工程师的具体含义是：

1. **不要假设基准线稳定**。能力曲线还在指数爬升，今天的常识可能是明天的不及格。今天的工具选择、组织结构、岗位定义，可能在 6 个月内被打破。
2. **保持组织设计的可演化性**。任何组织形态都要假设会被迫改动 — 不要做太深的一次性投入，保留重新配置的能力。
3. **激进实验的成本已经低到可以承担**。Software Factory 的「1000 美元/天/人」是个相当低的实验门槛，意味着小团队也能尝试激进重写。
4. **先例的边际价值极高**。在大家都还在摸索的阶段，做出一个被验证有效的工作方式，会成为整个行业的参照点。

### Recursive Self-Improvement 的真实含义

Mollick 把 RSI 放在文章结尾，作为「最值得警惕的信号」。把三家公司的表态并排看：

| 公司 | 关键表述 |
| --- | --- |
| Anthropic (Dario Amodei) | 「如果你做出擅长编码和 AI 研究的模型，你可以用它们来构建下一代模型」；「Anthropic 内部的工程师几乎不再亲自写代码」 |
| OpenAI | Codex 最新模型是「我们第一个在创造自己过程中起到关键作用的模型」 |
| Google DeepMind (Demis Hassabis) | 关闭自我改进循环是所有主要实验室正在积极推进的事；同时警告缺失能力和真实风险 |

这三家表述的共同主题是：**RSI 不再是科幻，是路线图上的明确项**。具体含义：

- 模型改进的反馈循环不再依赖人类研究员的智力劳动，而是依赖模型本身在编码和 AI 研究上的能力。
- 这个反馈循环一旦加速，会让指数曲线变陡 — 终点不确定，但加速度会加快。
- 「RSI 是否能闭合」的答案大概率是「正在闭合」；问题只是闭合到哪个程度。

对组织和工程师的现实含义是：**把能力曲线的斜率当成组织设计的输入，而不是假设它会平稳**。具体来说：
- 不要规划「三年后我们会用上现在水平的 AI」，要规划「三年后我们可能用上比现在强得多的 AI — 但具体怎么强不确定」。
- 人才招聘和能力建设不要只针对当前最强的能力，要针对「AI 能力增长后人类仍能创造差异化的环节」。
- 长期技术债的偿还优先级要重新评估 — AI 能力增长会让某些旧债更便宜，让另一些旧债更贵。

### 「Managing AIs」vs「Working with AIs」的工程含义

Mollick 把 co-intelligence 时代（prompt 来回对话）和 managing 时代（直接给工作、几分钟内收结果）作为分界线。这背后反映的是 Agent 工程的成熟度跨越 — 从「工具级」（需要人驱动每一步）到「任务级」（能接受小时级工作并自主完成）。

这条跨越的工程含义：

| 维度 | co-intelligence 时代 | managing 时代 |
| --- | --- | --- |
| 人机接口 | prompt 设计 | 任务描述 + 验收标准 |
| 失败恢复 | 重新 prompt | 检查 + 反馈 + 重试循环 |
| 知识沉淀 | 人脑记忆 + 文档 | 过程资产 + Skill + 反馈数据 |
| 质量判断 | 模型输出 → 人判断 | 模型输出 → evaluator 判断 → 人判断关键节点 |
| 角色结构 | 人驱动 / AI 协助 | 人定义边界 / AI 执行 |
| 价值评估 | 模型能做什么 | 模型能稳定交付什么 |

从工具级到任务级的跨越，对应 harness 设计范式的根本变化 — 上下文管理 / 工具系统 / 执行编排 / 状态与记忆 / 评估与观测 / 约束与恢复六层必须齐备，而不是单点强化。

### 「不确定性不是无能为力」的现实主义

Mollick 结尾给出的判断值得专门拆开：「我们能看到那个 Thing 的形态，但仍然能影响 Thing 本身」。

这句话背后有三层含义：

1. **形态可见但未定型**。我们能看清 AI 现在能做什么、正在变成什么，但这个形态会被接下来的 RSI、组织实验、政策变化持续重塑。
2. **每个组织的实验都是先例**。在大家都在摸索的阶段，搞出一个被验证有效的工作方式，会成为整个行业的参照点。这是从「内部效率问题」上移到「行业规则塑造问题」。
3. **窗口期不会太长**。RSI + 指数曲线 + 政策博弈的组合意味着窗口期会快速收窄。要么尽早试出可用的形态，要么被别人的形态牵着走。

工程上的现实主义落地：

- 至少在一个具体业务场景里跑通 agentic 流程（不只是 demo，而是有真实产出）。
- 把经验沉淀成可复用的过程资产（不是 Slack 里的聊天记录）。
- 留意 RSI 的进展 — 哪怕只是「我们的 AI 同事开始帮我们改进我们的 AI 同事」。
- 为组织形态变化做规划 — 不要把组织设计当成一次性投入。

## 实践启示

1. **把 AI 能力曲线斜率当组织设计的输入**。不要规划「三年后用现在的 AI」，要规划「三年后可能用上比现在强得多的 AI — 但具体怎么强不确定」。

2. **激进实验的成本已经低到可以承担**。Software Factory 的 1000 美元/天/人是个相当低的实验门槛。小团队可以尝试「某个产品方向 / 某个代码模块完全由 agent 写并测试」。

3. **agentic 流程要在真实业务里跑通，不要只做 demo**。Demo 不能验证 jagged frontier、context drift、evaluator 失效等真实问题。要至少在一个具体业务场景里跑出有真实产出的流程。

4. **harness 的六层设计齐备**。上下文管理 / 工具系统 / 执行编排 / 状态与记忆 / 评估与观测 / 约束与恢复 — 任何一层缺位都会让 agent 在长链路任务里失控。

5. **组织形态保持可演化性**。任何组织设计都要假设会被迫改动 — 不要做太深的一次性投入，保留重新配置的能力。

6. **关注 RSI 的进展**。哪怕只是观察「我们的 AI 同事开始帮我们改进我们的 AI 同事」。这是判断组织设计方向的关键信号。

7. **抢占先例位置**。在大家都在摸索的阶段，做出一个被验证有效的工作方式会成为整个行业的参照点。这是比内部效率更重要的战略价值。

8. **「Shape of the Thing」要持续追踪**。这是 Ethan Mollick 这个序列的标题也是这条判断的方法论 — 把 AI 形态当成一个连续观察的对象，而不是一次性快照。

## 相关实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Claude Opus 48 The System Card B8460F](ch01/1207-claude.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](../ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/225-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch11/225-openclaw.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/052-harness-engineering.html)
- [Agent Harness Engineering Survey 2026](../ch05/052-harness-engineering.html)
- [Gpt 5 It Just Does Stuff](ch01/270-gpt-5-it-just-does-stuff.html)
- [Andrej Karpathy Claude Md 134K Stars 2026](ch01/271-claude-md.html)
- [Ahe Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md)
- [Agentic Harness Engineering Ahe](../ch05/052-harness-engineering.html)
- [Agent Harness Architecture](../ch05/039-agent-harness.html)

---

