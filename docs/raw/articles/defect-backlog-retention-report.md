---
source: newsletter
source_url: https://dev.jimgrey.net/2026/05/20/your-defect-backlog-is-a-retention-report/
ingested: 2026-05-22
sha256: c7d723bba747
review_value: 6
review_confidence: 7
review_stars: 3
review_recommendation: worth-reading
---

# Your defect backlog is a retention report


Published Time: 2026-05-20T09:00:00+00:00

Markdown Content:
A few weeks ago, someone opened [a pull request](https://github.com/WordPress/gutenberg/pull/78015) to fix a bug in WordPress’s block editor that [I reported in 2019](https://github.com/WordPress/gutenberg/issues/17942).

For six years, pasting a Flickr image embed code into a WordPress post required a workaround: type `/img` into an empty block first. The bug wasn’t catastrophic. The workaround was simple. And so the bug sat.

As an engineering leader, I know exactly how and why that happens.

At more than one company, I inherited what I call Defect Mountain — a backlog of known bugs, many with documented workarounds, none individually urgent enough to justify pulling someone off feature work. The pressure to ship is real. A bug that has a workaround isn’t actually blocking anyone. You note it, you document the workaround, and you move on.

[![Image 1](https://dev.jimgrey.net/wp-content/uploads/2026/05/mountain.jpg)](https://dev.jimgrey.net/wp-content/uploads/2026/05/mountain.jpg)
Operationalize that, scale it, and soon your users are living inside a product that feels like death by a thousand paper cuts.

No single cut is serious. Each workaround is learnable. But users don’t want workarounds — they want the product to work properly. Every workaround is something a user has to specially remember. It’s a support ticket waiting to happen when someone new encounters the bug without knowing the workaround exists. It’s a small, recurring tax on every person who touches that part of the product.

I’ve been the engineering leader who made exactly this call, more than once. Under pressure to deliver new features and create value, I deprioritized mountains of low-severity defects. The workarounds were manageable. The backlog felt like a known quantity. And in the ZIRP era, when growth covered a multitude of sins, it was easy to rationalize. Customers were expanding, not churning. Ship the roadmap.

Then interest rates rose, budgets tightened, and customers started making harder decisions about which tools they actually needed. “Good enough” products stopped being good enough. I had to reckon with the fact that customers had been quietly tolerating a paper-cut product for years — and when many of them finally had to choose, they chose to leave. Engineering is always balancing keeping things tidy with creating new value, and I had let that balance tip too far for too long.

Every workaround becomes tribal knowledge — something your support team knows, your customer success managers know, your implementation engineers know. Tribal knowledge creates human dependency. Human dependency raises your cost to serve. A customer who can’t figure out the workaround opens a ticket. A prospect who hits the bug during a trial needs a sales engineer to walk them through it. A renewal that should be a formality becomes a negotiation because the account manager has been fielding complaints for two quarters.

None of this shows up in your defect tracker. All of it shows up in your margins. Organizations naturally optimize for visible engineering expense over invisible customer friction — which is exactly why teams still underinvest in defect reduction even when the math argues otherwise. Paper cuts don’t just annoy customers — they silently tax every team that touches them, and they scale with your customer base.

Some leaders think their exit friction is too high for customers to leave over paper cuts. Maybe you make a core business system like an ERP or a CRM or a help-desk platform.

I used to think that too. Then I spent years at a company with a particular HRIS. It’s a leading platform, but it’s so riddled with friction that its workarounds had workarounds. Everyone in the company knew it was awful. The switching cost was enormous — migrating employee data, re-training HR, rebuilding integrations. We switched anyway. We moved to a modern alternative, and the collective exhale across the company was audible.

A large defect backlog is a leading indicator of churn — not a lagging one like your renewal rate. By the time customers start leaving, the damage has been compounding for a long time. High exit friction buys you time — it does not buy you forgiveness.

The workaround isn’t free. It just bills differently — on your customers’ patience, and eventually on your renewal rate. When you deprioritize a known defect, you’re not eliminating the cost. You’re distributing it onto your users, in perpetuity, and hoping they don’t quietly decide your product is tiresome.

At the company where I worked when ZIRP ended, we started by dismantling Defect Mountain. We partnered with Product to summarily close any defect that hadn’t been re-reported in over a year — if it was a real problem, someone would call it in again, and we’d fix it then. What remained went on a two-quarter plan to get from 400 open defects to 50. Product agreed that it was too hard to acquire new customers to give existing ones any reason to leave. The engineers hated it. They did it.

Then I operationalized defect repair with an SLO framework to make sure the mountain didn’t grow back. It eliminated the question of whether to address a given defect and replaced it with a clear expectation of when. Every defect had a severity, and every severity had a deadline. The framework wasn’t punitive; it was structural. No more bug-bash sprints. No more quarterly reckoning with a backlog that kept growing.

Defects accumulate silently — but fixes compound visibly. A product with bugs, fixed quickly and consistently, counterintuitively earns more customer trust than one that seems bug-free. It signals that your organization is attentive and listens. Customers know software has defects. What they’re watching for is whether you respond. When they report an issue and see it fixed in the next release, they feel heard. Trust grows, and they stay.

Customers who watch you fix bugs fast become advocates. Customers who accumulate workarounds eventually become someone who finally gets budget approval to migrate to the competitor.

I look forward to that WordPress PR shipping soon. When it does, a six-year-old paper cut disappears for every blogger who embeds images from Flickr. Someone finally made it a priority.

How many paper cuts are your customers bleeding through right now, while you’re busy shipping the next feature?

