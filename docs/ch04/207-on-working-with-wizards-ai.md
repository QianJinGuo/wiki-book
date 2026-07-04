# On Working with Wizards: AI 从协作到召唤的范式转变

## Ch04.207 On Working with Wizards: AI 从协作到召唤的范式转变

> 📊 Level ⭐⭐ | 11.0KB | `entities/on-working-with-wizards.md`

# On Working with Wizards: AI 从协作到召唤的范式转变

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/on-working-with-wizards.md)

> **Core insight**: Mollick 观察到 AI 使用范式的根本转变——从"co-intelligence"（与 AI 作为共同工作者，引导、纠正、合作）到"wizard"（召唤 AI 执行任务，输出惊艳但过程不透明）。这不仅是工具能力提升，而是人类与 AI 关系性质的改变。

## 从共同工作者到巫师

在 Mollick 的书《Co-Intelligence》中，他描述了一种人与 AI 合作的方式——把 AI 当作 intern 或 co-worker，纠正其错误、检查其工作、共同开发想法并引导其方向。过去几周他开始相信 co-intelligence 仍然重要，但 AI 的本质开始指向不同方向：从 partners 到 audience，从 collaboration 到 conjuring。

说明这种转变的好例子：Mollick 将自己的书和约 140 篇 One Useful Thing posts 输入 NotebookLM，选择新的 video overview 选项，简单的 prompt 制作关于"AI 世界发生了什么"的视频。几分钟后，他得到了一个相当不错的结果——所有数字都正确，包括 MMLU scores 数据和 AI 在神经外科考试数据上的结果。但 AI 是如何选择这些要点的？他不知道。这个过程典型地展示了新一波 AI 的特点：**对复杂任务的惊人且精密的输出，只需模糊请求，但过程中没有任何人的参与**。

我们正在从塑造过程的共同工作者变为接收输出的 supplicants——从"与 co-intelligence 共同工作"转变为"与 wizard 共同工作"。魔法发生了，但我们并不总是知道如何处理结果。这种模式——令人印象深刻的输出、不透明的过程——在研究任务中变得更加明显。

## Wizard 的力量：GPT-5 Pro 和 Claude 4.1 Opus

最能体现 wizard 感觉的 AI 模型是 GPT-5 Pro（仅对付费用户开放）。Mollick 给它一个学术 paper，指示"批评这篇论文的方法，找出更好的方法并应用它们"。这不是随便的论文——这是他的 job market paper，花了一年多写成，被领域内最聪明的人仔细阅读后才在 major journal 发表。九分四十秒后，他收到了非常详细的 critique，包括 GPT-5 Pro 似乎运行了自己的实验（用代码验证结果，包括 Monte Carlo 分析和重新解释固定效应）。

GPT-5 Pro 发现了以前从未有人注意到的微小错误——涉及两个不同表格中以他未在论文中明确说明的方式关联的两组数字。魔法发生了，但他无法干预，也无法完全确定 AI 系统实际做了什么。

另一个例子：Claude 4.1 Opus 获得了处理文件的能力（特别擅长 Excel）。Mollick 给了它一个他非常熟悉的 Excel 文件——一个用于分析小型 desk manufacturing 业务财务模型的练习，作为关于如何在不确定性下规划的课程。他给 Claude 的指令是"更新它以适应新业务——一个 cheese shop"，同时保持整体练习的目标。几分钟后，只有一个 prompt，他就得到了一个新的转换后的电子表格，数据完全更新同时传达了关键课程。

## Wizard 的问题

这些新 AI 系统本质上是 agent——能计划并朝着给定目标自主行动的 AI。当 Mollick 要求 Claude 更改电子表格时，它计划步骤并执行，从读取原始电子表格到编码新电子表格。但它也调整了意外错误（两次在没有要求的情况下修复了电子表格）并多次验证答案。他没有机会选择这些步骤——在新一波由 reinforcement learning 驱动的 agent 中，没人选择步骤，模型学习自己的解决问题的方法。

不仅无法干预，也无法完全确定 AI 系统实际做了什么。Claude 报告的步骤只是其工作的摘要，GPT-5 Pro 提供的信息更少，NotebookLM 在创建视频时几乎不提供对其过程的任何洞察。即使能看到步骤，也需要是多个领域的专家才能真正理解 AI 在做什么。当然，还有关于准确性的问题：如何在不检查每个事实的情况下判断 AI 是否准确？。

更棘手的是：每次把工作交给 wizard，我们就失去了发展自己专业知识的机会，失去了建立评估 wizard 工作所需的判断力的机会。这是与 wizard 工作的核心问题：我们正在获得魔法般的东西，但我们也从 magician 变成了 audience，甚至不是 magician 的助手。在 co-intelligence 模型中，我们引导、纠正和合作。越来越多地，我们 prompt、等待和验证……如果我们能的话。

## 我们如何与巫师相处

Mollick 提出了三个应对策略。首先，发展新的 literacy：学习何时召唤 wizard，何时与 AI 作为 co-intelligence 共同工作，何时根本不使用 AI。AI 远非完美，在它仍然不足的领域，人类往往成功。但对于 AI 有用的越来越多的任务，co-intelligence 通常优于单独使用机器。然而，越来越多次，召唤 wizard 是最好的，只是相信它召唤的东西。

其次，我们需要成为输出的鉴赏家而不是过程的鉴赏家。我们需要从 AI 提供的输出中进行筛选和选择，但更重要的是，我们需要足够的 AI 使用经验来培养对 AI 成功和失败的直觉。我们必须学会判断什么是对的，什么是错的，什么是值得冒不知道的风险。这对教育提出了难题：当你无法在 AI 不帮助你发展的领域培养 mastery 时，你如何训练某人在自己没有掌握的领域验证工作？。

最后，拥抱 provisional trust。Wizard 模型意味着更经常地使用"足够好"，不是因为我们降低标准，而是因为完美的验证变得越来越不可能。问题不是"这完全正确吗？"而是"这对這個目的足够有用吗？"。

## 深度分析

1. **范式转变的本质**：从"共同工作者"到"巫师"标志着人类与 AI 关系结构的根本性变化——不再是引导、纠正的协作关系，而是召唤与验证的神秘关系 。共同工作者模式强调人类引导 AI 的方向，而巫师模式则将控制权完全移交给 AI 系统，人类只能事后验证输出。

2. **能力与不透明的悖论**：AI 越强大，验证越困难——最强的 AI 恰恰在最难验证的领域表现出色（如学术论文批判、Monte Carlo 分析），形成"能力-不透明同步上升"的悖论 。这意味着 AI 的进步实际上增加了而非减少了使用风险。

3. **专业知识流失风险**：每次委托 wizard 工作，人类就失去一次发展专业判断力的机会。Mollick 指出这一核心问题：我们正在从魔术师变为观众，甚至不是魔术师的助手 。这种依赖关系可能形成恶性循环——越依赖 wizard，自身专业能力越萎缩，验证能力也随之下降。

4. **强化学习驱动的自生方法论**：新型 AI agent 通过强化学习自主发展解决问题的方法，而非执行预设步骤。这意味着即使是 AI 报告的"步骤"也只是对真实计算过程的摘要压缩，而非真实的执行记录 。GPT-5 Pro 提供的信息比 Claude 4.1 Opus 更少，NotebookLM 则几乎不提供任何过程洞察——越强大的系统越不透明。

5. **验证困境的深层结构**：在 AI 最擅长的领域（复杂多步推理、跨领域综合分析），恰恰是人类最缺乏验证能力的领域 。这要求重新定义"足够好"的标准——问题不再是"这完全正确吗？"而是"这对這個目的足够有用吗？"

## 实践启示

- **发展情境判断力**：学会判断何时召唤 wizard（复杂一次性任务）、何时与 AI 作为 co-intelligence 共同工作（需要迭代引导的任务）、何时根本不使用 AI（AI 仍然不足的领域） 
- **成为输出鉴赏家**：从验证过程转向筛选结果——培养对 AI 成功与失败的直觉，能够判断什么是对的、什么是错的、什么是值得冒不知道的风险 
- **拥抱暂时性信任**：接受"足够好"而非追求完美验证，因为完美的验证变得越来越不可能 
- **建立验证素养**：在无法成为专家的领域学会检查 AI 工作——这要求发展一种新的元技能：知道自己不知道什么，并知道如何验证 
- **设计后精通时代的教育**：解决 AI 阻止人们发展精通技能的问题，同时这些技能对于验证 AI 工作必不可少——如何在不掌握领域的情况下训练验证能力 

## 关键数据/实践启示

- **Wizard 模型的核心特征**：令人印象深刻的输出 + 不透明的过程 + 人类从共同工作者变为 supplicant
- **AI agent 自主规划执行**：Claude 报告的步骤只是摘要，强化学习训练的模型学习自己的解决问题的方法，而非按预设步骤执行
- **能力与不透明度同步上升**：越强大的 AI 越难验证，这构成了 AI wizard 工作的根本悖论
- **「巫师素养」三要素**：判断何时召唤（vs co-intelligence vs 不用）、成为输出鉴赏家、拥抱 provisional trust
- **失去 expertise 的风险**：每次把工作交给 wizard，就失去了发展自己判断力和专业知识的机会——这对教育影响深远

## 相关实体
- [Oneusefulthing Claude Code What Comes Next](https://github.com/QianJinGuo/wiki/blob/main/entities/oneusefulthing-claude-code-what-comes-next.md)
- [Openai Gdpval Real Ai Agents Threshold](https://github.com/QianJinGuo/wiki/blob/main/entities/openai-gdpval-real-ai-agents-threshold.md)
- [Mass Intelligence](https://github.com/QianJinGuo/wiki/blob/main/entities/mass-intelligence.md)
- [Sign Of The Future Gpt 55 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/sign-of-the-future-gpt-55-mollick.md)
- [Three Years Gpt3 Gemini3 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/three-years-gpt3-gemini3-mollick.md)

## 相关引用

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/on-working-with-wizards.md)

---

