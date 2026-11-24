# How To Measure Development Productivity?

> 📊 Level ⭐⭐⭐ | 11.3KB

> **来源**: [How To Measure Development Productivity?](https://itamargilad.com/how-dev-productivity/)

Last week I published this cartoon on LinkedIn. It went instantly viral:

![Image 1](https://itamargilad.com/wp-content/uploads/2026/06/Museum-of-meaningless-metrics-1024x1024.png)

Tokens spent (as well as the other metrics shown) are of course not meaningless, but everyone got the joke:

*   The current “AI-flex” culture where people and companies are trying to impress by how much they’re using the technology rather than by what it gains them.
*   The sad march of dev productivity metrics that are mostly meaningless 

The latter point generated some interesting conversation. One commenter threw the ball back into my court:

**_“Great point. The harder question remains. What are the right metrics for developers?”_**

I think that’s a worthwhile question, especially now that AI coding is making it incredibly easy to produce lots of code, fast. But how do we know if we’re truly more productive? In this article, I’ll try to offer an answer.

But first, let’s start with the obvious wrong answers.

## Measuring Work or Activity

Early developer productivity metrics centered on work artifacts. Here’s a classic example: in the early 1980s, IBM contracted Microsoft to develop PC-DOS, an operating system for its new IBM personal computer. In [this video](https://www.youtube.com/watch?v=kHI7RTKhlz0) Steve Ballmer describes how perplexed Microsoft was at the metric IBM wanted to use: _1000s of lines of code_, or _KLOCs_. Ballmer points out the obvious fallacy: a good developer may create a better implementation with _fewer_ lines of code. More KLOCs isn’t necessarily better.

[Video 3](https://www.youtube.com/watch?v=kHI7RTKhlz0)

Today we chuckle at the folly of measuring anything by lines of code; that is until we see headlines like these:

![Image 2](https://itamargilad.com/wp-content/uploads/2026/06/Microsfot-Lines-of-Code.jpg)

Yes, with AI we’re back to measuring success by lines of code.

Other work dev “productivity” metrics are _commits_ or _pull requests_. These measure _activity_ — how many changes happen in the codebase, but that too is a very weak signal of value (and may also be [negatively correlated](https://thenewstack.io/ai-generated-code-crisis/)).

Now, _tokens spent_ has joined the list. If developer A spends twice as many tokens as developer B, they are using AI more, which surely must be a good thing, right?

It doesn’t take much introspection to see that commits, pull requests, and tokens suffer from the exact same problem as lines of code did in the 1980s —they say nothing about the real value the software creates. We learned this lesson decades ago, yet with AI we seem content to repeating the same errors all over again.

## Measuring Output

In a traditional factory, _output_ is the most important metric. A production line able to produce a 1000 units per day is better than one that produces just 700 (assuming same costs and quality). So it only seems natural that we will measure software development in terms of output.

And we do. We typically start by creating plans — for the year, the quarter, and the sprint — and then measure development progress against the plans.At sprint-level we track story points developed against the projection; On a quarterly basis we count how many features were shipped according to the plan/OKR. During the year, the company tracks progress on its bigger projects, often with metrics such _as percent completed_.

All of this would make total sense to a 1950s business executive. The product organization is treated as a delivery unit (aka [feature-factory](https://itamargilad.com/feature-factory/)) and is measured on its rate of output.

Alas, when it comes to technology products, this classical paradigm is deeply flawed.

While it’s important that the company is able to develop products fast and efficiently, output too is a weak predictor of success. A big-output project (for example: Google+) may end up in nothing, while a much smaller endeavor (say, Whatsapp) can transform an industry.

This is another truth we’ve known for awhile.

> _“One of the common misconceptions in software developement is that we’re trying to get more output faster. Because it would make sense that if there was too much to do, doing it faster would help, right? But if you get the game right, you will realize that your job is not to build more—it’s to build less. … At the end of the day, your job is to minimize output, and maximize outcome and impact.”_ _Jeff Patton,_[_User Story Mapping_](https://jpattonassociates.com/story-mapping/)

And yet this point remain counterintuitive and contentious in may organizations. Here are three ways to explain to your managers and colleagues why optimizing for output may be harmful.

### Uncertainty

In a traditional factory we are fairly certain that everything we produce is of value. But this is not the case in software development. Our product ideas are loaded with assumptions and often fail to deliver any business or user value. A/B tests and other measurements consistently show a success rate of [33% or less](https://hbr.org/2017/09/the-surprising-power-of-online-experiments), which means that most of what we produce is _waste_. If you ramp up output you also ramp up the waste.

A few years ago I published [this article](https://itamargilad.com/velocity-vs-impact/) in which I compared three theoretical teams that start out with the same output rate (or thoughput) of 40 features per year. Team B optimizes for output and boosts throughput by 10%. Team C optimizes for outcomes by conducting product discovery, which actually _reduces_ its throughput by 10%. Team A (control) doesn’t change anything. My simulation shows that over the course of two years, the outcomes-driven team is able to create x9 more value compared to the output-optimizing team, and x10 compared to the control team, despite being the slowest of the three to launch.

![Image 3](https://itamargilad.com/wp-c

→ [原文存档](https://itamargilad.com/how-dev-productivity/)

---
## 深度分析

### 活动度量：四十年后重犯的同一个错误

KLOC、commits、PR 与 tokens 属于同一类"活动度量"。1980 年代 IBM 以千行代码考核微软开发的 PC-DOS，Ballmer 当场指出悖谬：好开发者会用更少的代码写出更好的实现。四十年后 AI 让代码极易产出，行业却重新按行数论成败，并新增了 tokens 消耗这一指标（参见 [Token 经济学](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-token-economics-ai-productivity.md)）。这些指标度量的是代码库变动与算力消耗，对软件创造的真实价值只字未提，commits 甚至可能与价值负相关。这也呼应 [AI 生产力悖论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-productivity-paradox-collaboration-bottleneck.md) 的观察：个体活动的增加并不自动转化为组织价值。

### 产出范式的三重系统性缺陷

把开发当工厂看是 1950 年代管理者的直觉：按年/季/冲刺制定计划，用故事点、交付功能数、完成百分比考核"交付单元"。作者给出三条不适用的理由。其一不确定性：软件创意充满假设，A/B 实验反复证明成功率不超过 33%，扩产出即扩浪费；他的模拟显示结果导向团队两年创造出 9 倍于产出导向团队的价值，尽管交付最慢。其二激励扭曲：工程师会优化被度量的东西，围着故事点和功能数转，沦为讨价还价的承包商。其三系统效应：产品膨胀推高维护成本直到"大重写"，高 WIP 拉低吞吐、专注与士气。

### 苏格拉底追问暴露的隐含假设

在给出替代方案前作者先问三题：为什么给开发者设指标？为什么脱离组织单独度量开发者？就算找到那个指标，你打算怎么行动？持续追问会撞上三个深层假设：需求完全确定、瓶颈只在交付速度；组织可像机器一样拆成研发/市场/销售分部优化；不度量人就会偷懒。这正是传统自上而下、执行优先、不信任型公司心智的特征，也是一切"开发者生产力指标"争论的真正源头。

### 替代框架：度量流向价值创造

现代产品 playbook 的要点：跨职能团队自带结果目标（如缩短新用户引导时长）并被授权自主探索实现路径；目标几乎都是结果——业务数据、用户行为或系统特性的变化；最重要的度量是团队与公司完成目标的情况，速度类健康指标只起辅助作用；未达目标先讨论改进什么，而非先怀疑开发太慢。公司应被视为为业务与用户价值而建的多学科系统，度量从这个系统观里自然流出，而非自上而下压给开发部门。

## 实践启示

1. commits、PR、tokens、故事点可作为上下文中的辅助信号，但不能当作开发者的生产力排名——它们是活动的计数，不是价值的代理。
2. 用 Jeff Patton 的标准审视路线图：不是更快地产出，而是最小化产出、最大化 outcome 与 impact。
3. 投入"提效"资源前先核对成功率假设：功能成功率不超过 33%，产出提速可能只是把浪费同倍放大。
4. 引入新度量前先三连问：为什么度量、为什么只度量开发、结果如何行动；答不出说明它只是焦虑的出口。
5. 移除有害或无意义的指标是零成本的第一步，比建设完美度量体系更优先。
6. 给跨职能团队设结果目标并授权探索；开发速度只应作为健康指标被观测，而非被考核。
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

