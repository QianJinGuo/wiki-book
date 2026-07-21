# You can't afford to lead agentic engineering from the sidelines

## Ch04.667 You can't afford to lead agentic engineering from the sidelines

> 📊 Level ⭐⭐⭐ | 19.0KB | `entities/agentic-engineering-leadership.md`

[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-engineering-leadership.md)

Late in 2025, leadership had made the call: the company was going all in on AI. The CTO's vision was straightforward. Engineers would define the work in tickets. Agents would implement it overnight. Engineers would return in the morning to review the output and get the code over the finish line. This was the reality facing an engineering manager I was mentoring at another company. That conversation stuck with me.

It sounded clean in the way plans sound clean before they touch a real codebase, but I felt an immediate resistance to the idea. Not because it was uniquely absurd. By then, this kind of thinking was becoming increasingly common. As the AI hype intensified, many executives felt pressure to show a return, cut costs, or simply prove they were not falling behind.

What unsettled me was that my own experience told me this wouldn't work. I had spent much of 2025 in my previous role as Director of Engineering leading the effort to experiment with and adopt AI-assisted engineering. I had seen where these tools helped, where they failed, and how much extra judgment they demanded from team members.

From that vantage point, the CTO's plan did not just seem technically naive. It seemed like a good way to turn engineers into ticket writers and cleanup crew. That kind of rollout can demoralize a team before they have a chance to learn.

To be clear, the CTO was right to take AI seriously. The shift to agentic engineering is more than another tooling update. The mistake was assuming you can design the operating model before you understand what the work feels like from the engineer's side.

That is the gap I keep coming back to: **leaders are asking engineers to change how they build software before they have felt the change themselves.**

As an engineering leader I am supposed to get out of the weeds. That is part of the job. You lead through systems, managers, planning, metrics, and organizational design. But when the weeds themselves start changing, distance becomes a liability.

For me the answer was to get my hands back on the work. Not to take over delivery. Not to relive my IC days. But to understand what this change actually demands from the people living through it. A secondhand understanding was not going to be enough.

Many organizations are moving quickly from "AI matters" to "we need an AI operating model." The urgency is understandable. The mistake is pretending the model is already obvious.

The conversation has moved fast: from broad AI skepticism, to one-prompt vibe coding demos, to coding agents, new harnesses, Ralph-loops, spec-heavy workflows, test-first agent patterns, and whatever practice gets treated as the answer next week. Some of these ideas help. Some help a lot in the right context. But none of them have come close to removing the need for human judgment in software engineering.

That is what I mean by agentic engineering: not handing the work to a model and hoping it figures things out, but using agents as part of the engineering process while the engineer still owns the outcome. The engineer defines the problem, sets the constraints, steers the work, reviews the result, and decides whether it is actually good enough to ship.

That shift is real. It is also not settled. A workflow that works for a greenfield internal tool may fall apart in a mature distributed system. A team with clear ownership, trusted tests, and fast feedback can move faster with agents. A team with ambiguous product direction and brittle verification loops may only create confusion faster. That is why you cannot import an "agentic engineering" playbook and expect it to survive contact with your organization.

This is where secondhand understanding becomes dangerous. From a distance, it is easy to build overconfident plans around demos, vendor claims, and isolated success stories. Up close, the work is messier. Agents can move quickly and still miss the point. They can produce plausible code that shifts the hardest judgment back onto the engineer, and they can make a weak idea look more real than it deserves to be.

Software engineering was never only about writing code. Half the work is figuring out what should exist in the first place. Agents do not make that disappear. If anything, they make bad judgment cheaper to execute.

You start seeing half-baked prototypes and vibe-coded solutions move through the organization faster than the organization can decide whether they are valuable. The burden then lands on engineering to sort out what is useful, what is salvageable, and what should never have been built. Just because something can now be produced quickly does not mean the team has gained leverage. Sometimes it has only gained churn.

AI exposes the bottlenecks your team was already working around. If code review was barely holding together before, generating more code makes that pain harder to ignore. If CI/CD was slow or unreliable, faster implementation just means more waiting for confidence. If product direction is vague, agents help you create expensive noise faster. And if decisions are gatekept by a few people, the compression AI offers stays out of reach.

This is also where the old handoffs between Product, Design, and Engineering start to creak. If engineers are going to direct agents, they cannot behave like ticket-takers. They need enough product context to challenge weak assumptions and notice when an implementation is technically plausible but strategically wrong. That means pulling engineers earlier into the problem framing, not just the solution review. They need to understand the goal, the non-goals, the constraints, the tradeoffs, and what would make the work wrong even if the code functions.

Many engineers are curious and even excited by these tools. But skepticism is not always obstruction. Sometimes it is a rational response to the way AI adoption gets sold: too glibly, too confidently, and often by people who have not had to land the output in a real production codebase.

**Leaders cannot give engineers certainty the industry itself does not have yet.** But they can decide whether people get to work through that uncertainty honestly. If people cannot talk openly about what is not working, they will still notice it. They will just stop telling you.

That is why leadership credibility matters so much right now. Teams do not need leaders who have memorized the latest AI talking points. They need leaders close enough to the work to know where the leverage is real, where the workflow gets awkward, where the fear is coming from, and where the organization is not ready yet.

You have to roll up your sleeves and get sucked in. Give an agent a real piece of work, not a toy demo. Watch it move fast, miss context, invent confidence, and leave you with the uncomfortable job of deciding whether the output is good or merely plausible. There is a specific kind of humility that comes from watching a tool produce 800 lines of code while quietly misunderstanding the problem.

Spend enough time with these tools and you will eventually find yourself swearing at an LLM in all caps. That frustration is not incidental. It is part of the experience leaders need to understand.

The point is not to take delivery back. It is to stop leading from theory.

For engineers to trust you through this change, they need to believe that you understand more than the executive summary. They need to hear you speak authentically about the scars: the false starts, the cognitive load, the workflows that seemed elegant until they met a real codebase, and the moments where the tools genuinely changed what felt possible.

Articles, conference talks, podcasts, and vendor demos can inform you. They cannot substitute for time with the tools, or for the trust you need when asking a team to change how it works.

That proximity also matters upward. If someone above you expects overnight productivity miracles, firsthand experience gives you something sturdier than vibes to push back with. You can explain what is real, what is hype, where to invest, and where the organization is not ready yet.

Teams do not need leaders with certainty right now. They need leaders with context. They need leaders whose optimism has been tested by contact with the work.

With this much uncertainty, the worst move is pretending you have already found the process. The better move is to build an organization that can learn faster than the tools change.

One of the easiest ways to waste this moment is to have ten engineers independently discover the same lesson, struggle with the same broken workflow, or find the same useful pattern without anyone else benefiting from it. **The goal is not early standardization. It is shared learning.**

Create deliberate places for engineers to compare notes: what worked, what failed, what looked promising until it touched the codebase, what saved time, what created more review burden than it was worth. Make the practical details visible. Which model worked for which kind of task? Which harness fits which workflow? Which agent-generated code looked plausible but was painful to land?

This matters more with AI because the feedback loops are compressed. A bad assumption can turn into a prototype in an afternoon. A vague ticket can become hundreds of lines of code. A weak product idea can look more convincing simply because someone generated a working demo.

**Without fast, shared learning, the organization does not just duplicate effort. It duplicates mistakes.**

Give people low-risk places to experiment, but make the learning part of the work. Use smaller projects, internal tools, or bounded product areas where the blast radius is manageable. Then bring the lessons back into the team through demos, write-ups, office hours, shared channels, or lightweight internal playbooks. Not as commandments. As evidence.

Share what works, but do not turn it into policy too quickly. The weird differences matter right now. One model may fit one kind of work better. One coding harness may suit one engineer better. One workflow may work beautifully in a clean service and fall apart in a legacy system with weak tests. Treat that variation as signal before you standardize it away.

Right now, I would rather be in an organization that learns quickly than one that standardizes too soon. Premature optimization gives the comforting appearance of control. But you will not design the right process in a strategy session. You and your teams will discover much of it by trying, failing, comparing notes, and slowly turning repeated lessons into practice.

The best thing I did as a leader was spend enough time with the tools to become harder to fool. Not cynical. Just less impressed by the demo version of the story. I could see where the leverage was real, where the workflow got awkward, and where the review burden quietly returned to the engineer. It gave me better questions for the team, better language for pushing back on unrealistic expectations, and more empathy for the frustration engineers were feeling. I became less certain in the abstract, but more useful in practice.

So let the work correct your assumptions, because you cannot afford to lead agentic engineering from the sidelines.

## 相关实体
- [Introducing Seer Agent The Answer Is Already In Sentry Now You Can Ask For It](../ch01/1048-introducing-seer-agent-the-answer-is-already-in-sentry-now.html)
- [Google Io 2026 Agentic Gemini Era](ch04/235-agentic.html)
- [Asana Agentic Work Management Platform Lettertwo](ch04/235-agentic.html)
- [Tokenspeed Agentic Inference Engine](ch04/671-tokenspeed-agentic-inference-engine.html)
- [Gemini 3 5 Frontier Intelligence](../ch01/086-gemini-3-5-frontier-intelligence-with-action.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-engineering-leadership.md)

## 深度分析

**1. 领导力的时代错位：传统"脱离杂草"策略在工具变革期成为负债**

传统的工程领导力模型要求管理者逐步脱离一线代码工作，专注于系统、流程和组织设计。但当工具本身发生根本性变革时，这种距离变成了理解力的盲区。作者的核心论点是：**当"杂草"本身在变化时，远离杂草意味着你无法理解正在发生的事**。在 Agentic Engineering 时代，"杂草"不再只是业务逻辑和代码实现，还包括 agent 的行为模式、harness 的设计选择、LLM 输出的可信赖度判断——这些都是需要亲身接触才能建立直觉的新领域。

**2. Agent 不会消除判断力需求，反而放大了低质量判断的代价**

文章最有力的论断之一是："Agent 使坏判断的执行成本降低"——当你对产品方向没有把握时，agent 可以更快地制造出一个看起来像样的实现，从而使错误的决策更难被及时发现和纠正。在传统模式下，一个模糊的 ticket 需要工程师数天才能产出可审查的原型；而在 agent 模式下，同样的模糊 ticket 可能在几个小时内就变成 500 行看起来合理的代码。这不是效率提升，而是**错误的加速**。

**3. AI 揭示了团队既有的系统性问题，而非制造新问题**

"AI 暴露了团队已在绕行的瓶颈"——这个洞见揭示了一个重要的因果关系：AI 并非在引入新的工程管理问题，而是将原有的问题暴露在聚光灯下。如果 code review 本来就很脆弱，agent 生成更多代码只会让这个脆弱性更难忽视；如果 CI/CD 本来就慢，agent 加快实现速度只意味着更多等待。这给工程领导者的启示是：**在部署 agentic engineering 工作流之前，先评估既有流程的健康度**，而非将 agentic engineering 作为修复流程问题的手段。

**4. 工程师的角色转变：从 ticket 执行者到 agent 指令者**

传统的软件工程角色分工（Product 写需求 → Engineering 实现 → QA 验证）在 agentic engineering 时代面临根本性挑战。如果工程师要有效地指挥 agent，他们不能再像 ticket-taker 那样运作——他们需要足够的产品上下文来质疑弱假设、判断技术方案是否真的符合业务目标。这意味着工程团队需要更早地参与产品定义阶段，而不仅仅是"方案评审"。这是一个组织流程层面的重大变化，远比引入一个 AI Coding 工具复杂得多。

**5. 集体学习的系统价值：从"重复发现相同教训"到"共享洞见"**

在 agentic engineering 时代，最快的组织不是最先标准化的，而是最先建立共享学习机制的组织。作者的核心建议是"不要过早标准化"——在不了解什么模式在不同情境下有效之前，将某个成功的实验变成全团队强制执行的政策，往往会把有价值的情境差异信号标准化掉。正确的做法是：建立低风险实验空间 → 让学习成为工作的一部分 → 通过 demo、写周报、分享会等机制让集体学习可见化。

## 实践启示

1. **工程管理者需要亲身使用 AI Coding 工具**：不是通过报告或 demo，而是给 agent 一个真实的工作片段，观察它如何移动快速、遗漏上下文、生成看起来合理但实际有问题的输出。这种"亲眼看着工具在 800 行代码中悄无声息地误解问题"的经历，是理解 agentic engineering 局限性的最快路径，也是建立团队信任的基础。

2. **在做 agentic engineering 路线图之前，评估现有流程的健康度**：先问：如果 AI 让我们的产出速度提高 10 倍，现有 code review 能承受吗？CI/CD 的反馈回路够快吗？产品方向的模糊性会不会被更快地"生产"出来？这些问题的答案决定了 agentic engineering 是放大效率还是加速混乱。

3. **建立"共享学习"机制而非急于标准化**：指定固定时间（如每周 30 分钟的"AI 回顾"）让工程师分享什么 workflow 有效、什么踩坑、哪个模型适合哪种任务。将这些实验记录下来，形成团队内部的情境化知识库，而非急于将成功案例变成全团队政策。

4. **将工程师提前拉入产品定义阶段**：如果 agent 能承接更多实现层工作，工程师的时间和精力应更多投入问题定义和方案评估。这要求工程管理者与产品管理者共同重新设计协作流程——目标不是"工程师写更少代码"，而是"工程师在更重要的问题上投入更多判断力"。

5. **接受并谈论恐惧，而不是压制它**：工程师对 AI 的恐惧（担心自己被取代、技能被贬值、被要求产出更多而质量标准更难捍卫）往往是合理的担忧，而非单纯的阻力。创造安全空间让团队坦诚讨论这些恐惧，比假装一切顺利更有利于建立信任和推动真正的变革。 [^raw/articles/agentic-engineering-leadership.md:59-64]

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-engineering-leadership.md)

---

