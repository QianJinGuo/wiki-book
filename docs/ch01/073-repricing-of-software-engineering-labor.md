# Repricing of Software Engineering Labor

> 📊 Level ⭐⭐ | 11.2KB

> **来源**: [Repricing of Software Engineering Labor](https://blog.grandimam.com/posts/repricing-of-software-engineering-labor)

I started my career in the late 2010s, and I have had a front-row seat to the growth of the industry that has given me everything: software engineering.

Looking back over the last decade, I have mixed feelings about some of the calls I made. And I am seeing the same patterns play out again now. So for engineers who are confused about where this is headed and how to navigate it, here is how I think about it.

## Generalist SWEs were a product of cheap money

The late 2010s, I saw an huge amount of startup funding, globally. Flipkart, Snapdeal, Jugnoo, and hundreds of others were scaling hard and one hiring pattern I saw was that: everyone wanted generalist software engineers. People who could easily get upto speed across the stack.- backend, frontend, infra, deployment and simply ship.

Building software was expensive. Automation was still low. Kubernetes had just gone mainstream. Shipping still meant a surprising amount of manual work: SSH-ing into servers, copying artifacts around, running `mvn` builds by hand, debugging deployments straight in production, duct-taping infrastructure that today you would never touch.

Companies fought over engineers who maximized feature throughput. Breadth was a premium, because every extra engineer increased the rate at which software got built. It helped because the money was also free and VCs rewarded growth over efficiency, and hiring software engineers in bulk was the easiest way to spend it.

Pull up a resume from an engineer who started around that time and you will usually see the same shape: a long list of technologies and frameworks, broad and adaptable, but rarely deep in any one thing. There was no incentive to go deep.

## LLMs Changed The Dynamics

LLMs did not kill software engineering. It compressed the cost of implementation. The work that got hit first was the work that was already standardized: CRUD apps; API integration and glue code; Framework-heavy backend work; Frontend scaffolding; Standard architectural patterns.

What used to take a team can now is being done by a 2-member team and AI. That is why implementation-heavy roles are becoming low-leverage work.

If your main value is stiching systems out of known frameworks and well-understood patterns, you are now competing with AI-assisted developers, technical PMs, founders, and small teams that hit the same outcome with a fraction of the headcount. Some of what feels like an AI correction is just the cheap-money era ending. Both are happening at once, and it is easy to blame all of it on AI.

## Repricing of the Middle Layer

I don’t think software engineering is disappearing. I think the market is repricing it. For years it rewarded implementation throughput. Engineers that were able to move fast and build stuff are becoming obselete overnight. These are large middle implementation-heavy generalists whose value was mostly shipping software built from known patterns.

The distinguished engineers sit above this collapse because their value was never implementation bandwidth in the first place; it was depth, judgment, and ownership. The middle layer never had any moat.

That is where I see the real identity crisis. A lot of these engineers built genuinely successful careers in a market where implementation itself was scarce. AI took that away almost overnight.

## Expertise is getting more valuable

As implementation gets cheaper, expertise gets more valuable. Not generic expertise. Deep expertise in domains where correctness, latency, safety, or operational complexity dominate.

Even the senior Java engineer with fifteen or twenty years in isn’t valuable because of Java. They are valuable because they have spent years debugging distributed failures, running mission-critical systems, learning failure modes the hard way, and making architectural trade-offs under real production pressure.

It is not prompting but it’s judgment earned through experience, not code generation.

## Where I think this goes

Like a lot of people, I have spent time building AI-native tooling myself ([Barebone](https://github.com/grandimam/barebone)). And ironically, even this layer is crowded already.

Agent frameworks, orchestration libraries, workflow engines, thin wrappers around foundation models, they are multiplying faster than they can meaningfully differentiate. Calling yourself an “AI engineer” is not going to be a moat.

I dont think LLMs eliminate engineering. PMs and domain experts can increasingly build prototypes, validate ideas, and ship internal tools with AI-assisted workflows. They are moving into what used to be engineering territory but mostly at the prototype layer.

Production is a different animal. It still needs engineers who understand reliability, scale, security, performance, observability, and operational trade-offs. The market is not killing the generalist software engineer but it is collapsing the premium for implementation-heavy work and raising the premium for deep expertise and real systems intuition.

For the first time in a long time, I think the biggest returns in this field come not from knowing a little about everything, but from knowing one hard thing exceptionally well.

* * *

_AI was used to assist with grammar and editing._

→ [原文存档](https://blog.grandimam.com/posts/repricing-of-software-engineering-labor)

---
## 深度分析

### 便宜资金时代的通才工程师是一种"时代产物"

文章最有洞察力的地方，是把通才 generalist SWE 的兴起追溯到宏观资金环境而非技术本身：2010 年代末 VC 资金近乎免费、奖励 growth over efficiency，批量雇佣能横跨 backend/frontend/infra 快速 ship 的通才，是花掉这笔钱最简单的方式。当年 Kubernetes 刚普及、自动化程度低，部署还靠 SSH、手工 `mvn` 构建，广度本身就是稀缺资源——每个新增工程师都直接提高 feature 吞吐。由此塑造的简历形态（长长的技术栈清单、广而不深）并非个人选择，而是市场定价的结果。这意味着一旦资金环境反转，通才溢价崩塌并不需要 AI 出现也会发生；把一切归因于"AI correction"是一种归因误差，两股力量恰好同时到来。

### LLM 压缩的是技能分布的中间层，两端价值反而被放大

LLM 没有消灭软件工程，而是压缩 implementation 的成本。最先被击中的是本来就标准化的工作：CRUD、API glue code、framework-heavy backend、前端 scaffolding。效应呈"中间层坍缩"结构——靠拼接已知框架和成熟模式的 implementation-heavy generalists 失去了护城河，因为 2 人团队 + AI 就能产出原来一个团队的成果；而顶层的 distinguished engineers 之所以幸存，是因为他们的价值从来不是 implementation bandwidth，而是 depth、judgment 和 ownership。低层也没被消灭：PM 和 domain expert 借 AI 工作流进入原型层，但 production 层的 reliability、scale、security、observability 仍然需要真正的工程师。技能分布整体从"纺锤形"向"哑铃形"迁移。

### Repricing 的分配机制：剩余去了谁那里，工资与产出脱钩

用 repricing 而非"消失"来描述这场变化，隐含着一个经济学问题：implementation 成本暴跌释放出的剩余（surplus）由谁捕获？目前看至少三方在分食——用极小 headcount 达成同等产出的 founders 和小团队、用 AI-assisted workflow 侵入原型层的 technical PM、以及向 deep expertise 溢价迁移的资深工程师。关键错位在于：单个工程师的产出可以随 AI 大幅上升，但工资由可替代性定价——标准化 implementation 的可替代性无限上升，所以薪资与个人产出脱钩，与不可替代性（correctness、latency、safety、operational complexity 主导的领域的实战 judgment）重新挂钩。15 年 Java 经验的价值不在 Java 语法，而在多年 debugging 分布式故障、在真实 production 压力下做 architectural trade-off 积累的 failure modes 直觉。"AI engineer"这个头衔本身不会成为 moat——它正在以比 Agent framework 更快的速度同质化。

### 可证伪的推论：接下来该盯什么信号

把文章的判断转成可检验的预测：(1) 若 macro-conditions 论点成立，那么按融资周期分层看工程师雇佣数据，cheap-money 依赖度高的初创公司缩减幅度应显著大于现金流健康的企业——若两者同步收缩，则 AI 因果占比被低估；(2) 若中间层坍缩论成立，junior/mid-level implementation 岗位招聘量相对 senior specialist 岗位的比值应持续下降，而 SRE、security、performance 等生产运维侧岗位溢价应上升；(3) 若"expertise 溢价"论成立，AI-native 工具层（agent frameworks、orchestration、workflow engines）应出现加速的合并与出清，因为该层没有差异化护城河；(4) 原型层被 PM/domain expert 大规模接管的同时，production incident 里的人为配置错误率若显著上升，则说明"跳过工程师直接上生产"的成本正在被低估——这将是文章框架最强版本被证伪的信号。与 [Karpathy Ai Agent 7 Bits Value Decline](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-ai-agent-7-bits-value-decline.md) 的价值衰减分析和 [Tencent Ai Coding Deep Water Fact Vs Judgment 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-ai-coding-deep-water-fact-vs-judgment-2026.md) 的"事实 vs 判断"区分互为印证：当事实性编码被商品化，判断（judgment）成为最后的生产资料。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

