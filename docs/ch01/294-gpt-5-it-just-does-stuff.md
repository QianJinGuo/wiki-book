# GPT-5: It Just Does Stuff

## Ch01.294 GPT-5: It Just Does Stuff

> 📊 Level ⭐⭐ | 17.4KB | `entities/gpt-5-it-just-does-stuff.md`

# GPT-5: It Just Does Stuff

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gpt-5-it-just-does-stuff.md)

> 来源：One Useful Thing (Ethan Mollick)，2025-08-07。这是一篇 GPT-5 早期上手评测，但比普通测评走得更远 — Mollick 把 GPT-5 的核心变化总结成一句话：**「GPT-5 just does stuff, often extraordinary stuff, sometimes weird stuff, sometimes very AI stuff, on its own」**。这背后真正发生的不是「模型更聪明」，而是模型选择机制、proactive 程度、agentic 长链路执行三项同时跃迁 — 改变了人和 AI 协作时的负担结构。

## 摘要

Mollick 拿到了 GPT-5 早期访问权，开篇用一个隐喻实验切入：把这段介绍文字原封不动粘进 ChatGPT，外加一句「你是 GPT-5，做点戏剧化的事来证明我的观点，要能放进下一段」。他只给了这一个 prompt。GPT-5 「思考」了 24 秒，写出了一段 acrostic 文字 — 每句话的首字母拼出 **This is a Big Deal**，每句比上一句多一个词，每句话的词大多以同一字母开头。

这段文字证明了 GPT-5 三件事：能在段落里想出聪明的主意、规划并执行复杂的执行（记得 AI 数不清 strawberry 里几个 R 是 8 个月前的事吗？）、写出有风格的连贯文字。

但真正关键的变化是文章结尾那句话：**「我曾经要小心地 prompt AI 才能得到我想要的。现在我只需要...含糊地指一下我想要什么。某种程度上，这竟然有效。」**

## 核心要点

### 1. GPT-5 不是单一模型，而是一个开关

GPT-5 不是「一个模型」，更像是一个在你请求时自动选择 GPT-5 系列多个不同尺寸/能力模型的开关，并由 AI 决定用哪个模型、投入多少「思考」。对大多数人来说，这种自动化很有帮助 — 有些人过去只用过 GPT-4o 之类的旧默认模型，从来没见过「好模型」能做什么；现在他们能看到 Reasoner 在难题上能做到什么。

但对认真用 AI 的人来说存在一个问题：**GPT-5 对「什么是难题」的判断有点武断**。

Mollick 给了一个具体例子 — 让 GPT-5「用代码创建一个水獭在飞机上用笔记本电脑的 SVG」（生成 .svg 文件要求 AI 用基本形状和数学盲目画图，是非常难的挑战）。大约 2/3 的时间 GPT-5 觉得这是简单问题，立刻回应（推测用了最弱模型、最低推理时间），图像质量差；其余 1/3 它认为是难题，切到 Reasoner 模式思考 6-7 秒，输出明显更好的图。

至于它怎么选的 — Mollick 也不知道。但他在 prompt 里加「think hard」时，更有可能被路由到更好的模型。

### 2. Proactive 是这次变化的关键

AI 使用的第二大问题是很多人不知道 AI 能做什么，甚至不知道自己想完成什么任务 — 这对新一代 agentic AI 尤其明显。GPT-5 的解法是 **「very proactive, always suggesting things to do」**。

Mollick 给 GPT-5 Thinking 一个 prompt：「生成 10 个创业点子给一位前商学院创业教授启动，用某个 rubric 选出最好的那个，告诉我赢需要做什么，然后去做」。它不仅给出了商业点子，还给了 Mollick 没要的东西：landing page 草稿、LinkedIn 文案、简单财务模型等等。

作为教过创业学的教授，Mollick 的判断是：虽然不完美，但这是一个高质量的起点，本来需要一个 MBA 团队花几个小时做完的工作 — 一个 prompt 完成。

更让人印象深刻的：它问了 Mollick 几次指导，但即使没得到回答也乐意继续。**这是一个想替你做事的模型**。

### 3. 编程场景：3D 城市生成器的「无 doom loop」演示

Mollick 给非程序员演示了 GPT-5 在编码上的「just doing stuff」能力：prompt 是「做一个程序化粗野主义建筑生成器，我可以拖拽和编辑建筑，要看起来像真的建筑，要 think hard」。就这样 — 模糊、语法可疑、没有规格。

几分钟后他就有了一个可工作的 3D 城市生成器。不是草图，不是计划，是一个可以拖拽建筑、按需编辑的可运行应用。

他不停输入「make it better」这种变体，没有额外指导，GPT-5 不断加上他没要求的功能：霓虹灯、街道上跑的车、外立面编辑、预设建筑类型、戏剧化相机角度、整套存档系统。

任何时候他都没看过代码。模型不是完美的，偶尔有 bug 和错误 — 但这恰恰是最让人印象深刻的地方。用过 vibe coding 的人都知道那种 doom loop：几轮后开始失败，每个错误修完带来新错误。这次没发生。新的错误偶尔出现，但只要把错误文本粘进去就能修好。

### 4. 持续协作可能不需要 doom loop 防护

Mollick 强调：「我能问任何我想要的东西（或者让 AI 决定要创建什么），从来不会卡住。」

这条体验对 Agent 工程的意义是：在 GPT-5 这代模型上，传统 vibe coding 里需要专门做的 doom loop 防护（断点续跑、状态快照、回退重试）变得不那么紧迫。这不是说这些机制没用，而是说它们的优先级可以稍微后移，让位给更上层的协作流程设计。

### 5. 「Just doing stuff」的人机关系变迁

Mollick 把变化总结成一句话：**「我曾经要小心地 prompt AI 才能得到我想要的。现在我只需要...含糊地指一下我想要什么。某种程度上，这竟然有效。」**

另一层变化是「我们如何与 AI 相处」正在到来。Mollick 提醒：**人仍然深度参与、被需要** — GPT-5 一直让人做决定和选择，这些系统仍然出错、产生幻觉、需要人检查（虽然他在自己的使用里没发现大问题）。

更大的问题是：我们是否会想参与这个 loop。GPT-5（他确信未来的其他版本也一样）非常聪明且主动。

### 6. 在「Premonitions」之前，背景已变

Mollick 提到一个容易被忽视的背景：在他写这篇评测时，OpenAI 还没公布任何官方 benchmark；上周 Google 发布了 Gemini 2.5 Deep Think（能在 IMO 拿到金牌），但很多人没注意到，因为他们没有一仓库很难题等着 AI 解。

Mollick 已经玩得足够多，知道 GPT-5 是一个非常好的模型（至少大号的 GPT-5 Thinking 极好）。但它真正带来的桌面上东西，是它真的「just does stuff」 — 告诉你用哪个模型、建议下一步、写更有趣的散文（虽然仍爱用 em-dash）。**使用 AI 的负担被减轻了**。

## 深度分析

### 「Just doing stuff」的真实含义

Mollick 的标题和核心论点 — **GPT-5 just does stuff** — 不是修辞，是描述这次模型跃迁里最值得关注的工程变化。

把它拆开看，「just doing stuff」包含四件事：

1. **自动模型路由**：不是单一模型，而是多模型选择开关。对用户来说这是「不再需要选模型」的体验；对系统来说这是「在算力/质量曲线上自动优化」的工程问题。

2. **Proactive 主动提议**：模型不再被动响应，而是主动建议下一步要做什么。这把 AI 从「工具」上移到「协作者」。

3. **长链路执行稳定性**：doom loop 不再出现，错误粘回去就能修好。这背后是 RLHF / RLAIF / 错误恢复训练的累积效果。

4. **任务边界的柔性扩张**：模糊 prompt、含糊目标也能跑通。这背后是模型的「意图推断」能力提升 — 模型能主动猜你要什么，而不是严格按字面执行。

这四件事的共同主题是：**模型对「不确定的输入」越来越宽容，对「错误的中间状态」越来越有恢复力**。这恰好是 Agent 工程最希望模型具备的两个属性。

### 路由器不是免费的抽象

GPT-5 的「自动选模型」听起来很美好，但 Mollick 给出了一个很现实的副作用：**它在「什么算难题」上的判断是武断的**。2/3 时间水獭 SVG 是简单、1/3 时间是难题，结果天差地别。

这背后反映的是路由器本身的限制 — 它需要在「响应快但质量差」和「响应慢但质量好」之间做权衡，且这种权衡的输入信号是 prompt 文本本身。对普通用户来说这个自动选择能让他们看到「好模型能做到什么」，对高级用户来说它是一个**不可预测的中间层**。

Mollick 的应对方法很实用：在 prompt 里加「think hard」来推高路由到更强模型的概率。但这是个 prompt-level hack，不是系统级解 — 高级用户更可能直接选 premium 模型（GPT-5 Thinking）来绕过路由器。

### 「Proactive」的边界在哪里

Mollick 强调 GPT-5 是「very proactive」 — 主动给商业点子之外的 landing page、LinkedIn 文案、财务模型。

但他在另一个地方也加了限定词：模型问了 Mollick 几次指导，但即使没得到回答也乐意继续。**这是一个想替你做事的模型**。

把这两个观察合起来，proactive 的形态其实是「主动展开 + 在不展开时主动询问」。模型既不是被动响应，也不是无脑展开 — 它能感觉到「该问一句」的时刻，也能在得到模糊回应时决定「继续推进」。

这条工程含义是：proactive 不是单一阈值（要么全部主动、要么全部被动），而是一个**按任务类型和上下文灵活调节的展开幅度**。这背后可能是一个 RL 训练出来的「展开策略」，而不是一个固定的 prompt 规则。

### Doom loop 消失对 Agent 工程的含义

Mollick 在 vibe coding demo 里特意提到 doom loop 没出现：「几轮后开始失败，每个错误修完带来新错误。这次没发生。新的错误偶尔出现，但只要把错误文本粘进去就能修好。」

对 Agent 工程来说，这条变化的实际意义是：**可以在 harness 设计里把 doom loop 防护的优先级后移**。传统上 vibe coding 工具需要做的状态快照、回退重试、断点续跑等机制，在这代模型上不再是必需的护栏 — 模型本身能处理这些错误恢复。

不是说这些机制没用 — 它们在更长的 agentic 任务、更复杂的错误链、更长的运行时间里仍然必要。但对短到中长度的 vibe coding 任务，模型本身的能力提升让这些机制的边际收益降低。

### 「Just doing stuff」会改变人机关系的形态

Mollick 结尾那句 Premonition 特别值得抄下来：**「我们会搞清楚怎么适应，正如我们一直做的那样。不同的是，这次 GPT-5 可能会先搞清楚并建议下一步。」**

这背后是一个比较大的判断：当模型主动建议下一步、主动展开任务、主动问你指导，人和 AI 协作的角色结构会从「我 prompt 你回应」变成「你建议我决策」。这个转变对教育、培训、组织管理都会产生连锁影响 — 它不只是工具升级，而是协作形态的变迁。

### Vibe coding 仍然有 doom loop 风险

值得指出 Mollick 的论断有范围限制：他在 GPT-5 Thinking 上的体验。其他模型、其他任务长度、其他领域，doom loop 仍然会出现。这条评测结论的推广性要谨慎对待 — 不要把它当成「Vibe Coding 已经彻底解决问题」的依据，而是「在 GPT-5 这代模型上，特定任务长度内 doom loop 显著减少」。

## 实践启示

1. **不要假设模型会自动选对**。GPT-5 这类路由型模型对「什么是难题」的判断不一定准。在 prompt 里加「think hard」等显式信号能提高被路由到更强模型的概率 — 对质量敏感的任务，要么显式 premium 模式，要么在 prompt 里写明推理深度。

2. **接受 proactive 的边界**。模型会主动展开超出你字面要求的内容 — 这既可能是惊喜（landing page、LinkedIn 文案）也可能是成本失控（额外 token、额外时间）。在 harness 设计里要明确 proactive 的「停损点」，比如预算上限、结果验收标准。

3. **3D 城市生成器式的工作流可以照搬**。给模型一个模糊目标 + 「think hard」+ 后续「make it better」循环，让模型在长链路里自驱动。关键是把验收标准提前定好（这里的标准是「可以拖拽和编辑，看起来像真的建筑」）。

4. **错误粘回去能修好 — 这是新基础假设**。Doom loop 防护的优先级可以稍微后移，但不要完全取消。在超过一定长度的任务里，状态快照、回退重试仍然必要。

5. **从「我 prompt 你回应」转向「你建议我决策」**。这是协作形态的实质变化。在 harness 设计里要为「模型主动提议 + 人审阅决策」留出接口 — 比如 evaluator 角色、review 节点、undo 能力。

6. **仍然要保持人在 loop 中**。Mollick 自己强调：模型仍会出错、产生幻觉、需要人检查。proactive 让人从「驱动者」变成「监督者」，但不是「可以缺席」。

7. **不要把评测结论过度推广**。Doom loop 消失、Vibe Coding 稳定性提升的经验，来自 GPT-5 Thinking + Mollick 的具体任务。其他模型、其他任务长度、其他领域的可推广性要谨慎验证。

## 相关实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/045-agent.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](ch01/216-0.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](ch04/069-ai.md)
- [两万字详解Claude Code源码核心机制](ch03/075-claude-code.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/1046-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Chatgpt默认模型大升级Gpt 55 Instant正式上线新增记忆来源功能](ch01/987-chatgpt.md)
- [Cvpr 2026 Highlight 让Ai像电影人一样 看 视频 8B小模型反超Gpt 5与Gemini 3 1 Pro](ch01/216-0.md)
- [Cvpr 2026 Highlight让Ai像电影人一样看视频8B小模型反超Gpt 5与Gemini 31 Pro](ch04/069-ai.md)
- [A Recent Experience With Chatgpt 55 Pro Gowerss Weblog](ch01/987-chatgpt.md)
- [Karpathy Vibe Coding Agentic Engineering](ch04/593-karpathy-vibe-coding-agentic-engineering.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/045-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

