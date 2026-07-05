# Your defect backlog is a retention report

## Ch03.003 Your defect backlog is a retention report

> 📊 Level ⭐ | 13.2KB | `entities/defect-backlog-retention-report.md`

[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/defect-backlog-retention-report.md)

A few weeks ago, someone opened a pull request to fix a bug in WordPress's block editor that I reported in 2019. For six years, pasting a Flickr image embed code into a WordPress post required a workaround: type `/img` into an empty block first. The bug wasn't catastrophic. The workaround was simple. And so the bug sat.

As an engineering leader, I know exactly how and why that happens. At more than one company, I inherited what I call Defect Mountain — a backlog of known bugs, many with documented workarounds, none individually urgent enough to justify pulling someone off feature work. The pressure to ship is real. A bug that has a workaround isn't actually blocking anyone. You note it, you document the workaround, and you move on.

Operationalize that, scale it, and soon your users are living inside a product that feels like death by a thousand paper cuts. No single cut is serious. Each workaround is learnable. But users don't want workarounds — they want the product to work properly. Every workaround is something a user has to specially remember. It's a support ticket waiting to happen when someone new encounters the bug without knowing the workaround exists. It's a small, recurring tax on every person who touches that part of the product.

I've been the engineering leader who made exactly this call, more than once. Under pressure to deliver new features and create value, I deprioritized mountains of low-severity defects. The workarounds were manageable. The backlog felt like a known quantity. And in the ZIRP era, when growth covered a multitude of sins, it was easy to rationalize. Customers were expanding, not churning. Ship the roadmap.

Then interest rates rose, budgets tightened, and customers started making harder decisions about which tools they actually needed. "Good enough" products stopped being good enough. I had to reckon with the fact that customers had been quietly tolerating a paper-cut product for years — and when many of them finally had to choose, they chose to leave. Engineering is always balancing keeping things tidy with creating new value, and I had let that balance tip too far for too long.

Every workaround becomes tribal knowledge — something your support team knows, your customer success managers know, your implementation engineers know. Tribal knowledge creates human dependency. Human dependency raises your cost to serve. A customer who can't figure out the workaround opens a ticket. A prospect who hits the bug during a trial needs a sales engineer to walk them through it. A renewal that should be a formality becomes a negotiation because the account manager has been fielding complaints for two quarters.

None of this shows up in your defect tracker. All of it shows up in your margins. Organizations naturally optimize for visible engineering expense over invisible customer friction — which is exactly why teams still underinvest in defect reduction even when the math argues otherwise. Paper cuts don't just annoy customers — they silently tax every team that touches them, and they scale with your customer base.

Some leaders think their exit friction is too high for customers to leave over paper cuts. Maybe you make a core business system like an ERP or a CRM or a help-desk platform. I used to think that too. Then I spent years at a company with a particular HRIS. It's a leading platform, but it's so riddled with friction that its workarounds had workarounds. Everyone in the company knew it was awful. The switching cost was enormous — migrating employee data, re-training HR, rebuilding integrations. We switched anyway. We moved to a modern alternative, and the collective exhale across the company was audible.

A large defect backlog is a leading indicator of churn — not a lagging one like your renewal rate. By the time customers start leaving, the damage has been compounding for a long time. High exit friction buys you time — it does not buy you forgiveness.

The workaround isn't free. It just bills differently — on your customers' patience, and eventually on your renewal rate. When you deprioritize a known defect, you're not eliminating the cost. You're distributing it onto your users, in perpetuity, and hoping they don't quietly decide your product is tiresome.

At the company where I worked when ZIRP ended, we started by dismantling Defect Mountain. We partnered with Product to summarily close any defect that hadn't been re-reported in over a year — if it was a real problem, someone would call it in again, and we'd fix it then. What remained went on a two-quarter plan to get from 400 open defects to 50. Product agreed that it was too hard to acquire new customers to give existing ones any reason to leave. The engineers hated it. They did it.

Then I operationalized defect repair with an SLO framework to make sure the mountain didn't grow back. It eliminated the question of whether to address a given defect and replaced it with a clear expectation of when. Every defect had a severity, and every severity had a deadline. The framework wasn't punitive; it was structural. No more bug-bash sprints. No more quarterly reckoning with a backlog that kept growing.

Defects accumulate silently — but fixes compound visibly. A product with bugs, fixed quickly and consistently, counterintuitively earns more customer trust than one that seems bug-free. It signals that your organization is attentive and listens. Customers know software has defects. What they're watching for is whether you respond. When they report an issue and see it fixed in the next release, they feel heard. Trust grows, and they stay.

Customers who watch you fix bugs fast become advocates. Customers who accumulate workarounds eventually become someone who finally gets budget approval to migrate to the competitor.

How many paper cuts are your customers bleeding through right now, while you're busy shipping the next feature?

## 相关实体
- [语音输入喊了这么多年千问电脑版一出手就把键盘卷没了](https://github.com/QianJinGuo/wiki/blob/main/entities/语音输入喊了这么多年千问电脑版一出手就把键盘卷没了.md)
- [Yc Ceo Garry Tan 200 Dollar Vs 4 Million](ch01/216-0.md)
- [Against Brain Damage](ch03/016-against-brain-damage.md)
- [Www.Cio 4171054 Ai Driven Layoffs Arent Making Bus](ch04/277-ai.md)
- [Alibaba Cloud Cio Ai Productivity Reframe](ch04/277-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/defect-backlog-retention-report.md)

## 深度分析

**1. 成本可见性不对称：缺陷成本的承担者与决策者不同**

文章揭示了一个经典的组织经济学问题：缺陷的隐性成本由客户（摩擦力、认知负荷、支持依赖）承担，而缺陷修复的可见成本由工程团队承担。组织天然倾向于优化可见的工程支出，而非不可见的客户摩擦力。这种不对称性导致即使数学上缺陷修复的 ROI 明显为正，团队仍然系统性地投入不足。AI Coding 时代的讽刺在于：快速生成代码的能力可能加剧这个问题——更多的功能产出意味着更多的缺陷被引入，而缺陷的隐性成本也随之扩大。

**2. 缺陷积压是客户流失的领先指标，而非滞后指标**

作者的核心论断是"缺陷积压是领先指标（leading indicator），不是滞后指标（lagging indicator）"。传统观点认为"客户流失率"是产品质量的滞后反映——客户离开后才显示问题。但作者的论点更深刻：用户在决定离开之前的很长一段时间内，已经在忍受缺陷，只是没有明确表达。当经济环境收紧（利率上升、预算紧缩），这些积累的摩擦力成为客户"终于可以做出决定"的触发因素。高转换成本只是延长了用户的忍耐时间，并不消除用户的负面体验累积。

**3. 工作流程成部落知识，部落知识成组织债务**

每个工作流程都会产生知识传递成本。当缺陷存在已知工作流程时，这个工作流程成为"部落知识"——只有团队中特定成员知道。当这些成员离职时，部落知识断裂，客户突然面临"没有任何工作流程可用"的困境。作者的观察表明，即使在 B2B 企业软件领域，高转换成本也不能保证客户留存——当替代品的整体体验改善足够大时，用户愿意承担迁移成本。这对于任何认为自己"客户无法离开"的产品都是警醒。

**4. SLO 框架将缺陷决策从"是否"变为"何时"**

作者实施的结构性解决方案（基于 SLO 的缺陷修复框架）关键在于消除了决策摩擦：不需要每次讨论"这个缺陷是否值得修复"，而是明确"这个级别的缺陷必须在多少天内修复"。这将缺陷修复从自由裁量的道德判断（"我们应该关心质量"）变成可执行的结构性承诺（"Severity-1 缺陷 7 天内必须修复"）。SLO 框架的另一个价值是防止 Defect Mountain 重新堆积——季度性 bug-bash sprint 是临时解决方案，而结构性承诺是系统性防止复发。

**5. 快速修复缺陷创造信任复利**

"快速、一致地修复缺陷的产品，比看起来无缺陷的产品反而赢得更多信任"——这是反直觉但重要的洞见。原因在于：客户知道软件有缺陷，他们观察的是组织对缺陷的反应速度。一个持续、快速响应缺陷的产品传达了"这个组织在倾听、愿意投入、值得信任"；而一个隐藏缺陷、假装无缺陷的产品在用户发现问题时失去的信任远大于修复本身。 [^raw/articles/defect-backlog-retention-report.md:50-51]

## 实践启示

1. **将缺陷积压重新框架为客户留存资产负债表**：不是问"我们有多少 open defects"，而是问"我们的客户正在承担多少隐性摩擦力"。在季度业务评审中纳入"缺陷客户摩擦力"指标——估算每个主要缺陷对客户使用该功能时造成的额外步骤、认知负荷或支持依赖。这会让缺陷积压的成本从不可见变为可讨论。

2. **对长期未复发的缺陷进行系统性清理**：与产品合作，对超过 12 个月未被复报的缺陷进行批量关闭，同时建立监控——如果真的重要，用户会再次报告。这能将 400+ 缺陷缩减到可管理的范围，同时不遗漏真正重要的问题。这种方法比逐一审查每个缺陷的优先级更高效。

3. **引入缺陷 SLO，将质量承诺结构化**：为不同严重级别的缺陷设定修复时限（如 Severity-1 = 7 天，S2 = 30 天，S3 = 90 天），并将 SLO 合规率纳入工程团队的核心指标。这将缺陷决策从"我们什么时候有空处理"变为"我们承诺什么时候完成"。

4. **审查"部落知识"型工作流程的脆弱性**：列出所有有已知 workaround 的缺陷，评估：(a) 如果知道 workaround 的员工离职，这个 workaround 还能维持吗？(b) 新客户或试用用户遇到这个问题时，有文档支持吗？这些问题的答案指向需要优先修复的高价值缺陷。

5. **在产品路线图中为缺陷修复预留固定带宽**：建议工程带宽的 20-30% 专门用于缺陷修复（非功能性改进），避免 100% 的路线图容量被新功能填满。这是防止 Defect Mountain 重建的结构性机制，而不是依赖季度性 bug-bash sprint 的临时方案。 [^raw/articles/defect-backlog-retention-report.md:46-49]

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/defect-backlog-retention-report.md)

---

