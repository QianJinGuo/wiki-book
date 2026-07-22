---
source_url: "http://runtimewire.com/article/microsoft-github-aws-ai-capacity-crunch"
ingested: 2026-06-18
sha256: f80d0bf838d2a5af
---
Title: Microsoft's GitHub capacity crunch sends it to AWS

URL Source: http://runtimewire.com/article/microsoft-github-aws-ai-capacity-crunch

Published Time: 2026-06-16T02:19:39.409Z

Markdown Content:
Satya Nadella's Microsoft is adding Amazon Web Services capacity to keep GitHub running after an AI-driven surge in coding activity strained the platform, [Business Insider reported Tuesday](https://www.businessinsider.com/microsoft-github-amazon-ai-cloud-capacity-2026-6), citing two people familiar with the plans.

The arrangement cuts against the neat version of the GitHub acquisition story Microsoft sold in 2018: buy the developer platform, fold its infrastructure toward Azure, and make Microsoft's cloud the default substrate for the world's software work. Instead, GitHub's load curve has moved faster than the migration plan. Business Insider reported that Microsoft had planned to move GitHub fully to Azure by 2027, but is now adding extra capacity from AWS while the platform deals with outages and higher usage.

Microsoft confirmed the broader multi-cloud shift without confirming AWS by name. A spokesperson told Business Insider that "the incredible spike in agentic development" since late 2025 has tested GitHub's infrastructure limits, and said Microsoft is accelerating the Azure move while exploring a multi-cloud strategy for elasticity and scale. Amazon told the outlet it does not comment on individual clients.

The awkwardness is the point. Microsoft owns Azure, spends like a hyperscaler, and still appears willing to route part of a strategic developer platform through its largest cloud rival because the operational risk of GitHub downtime has become worse than the optics of paying AWS.

### The acquisition promise met the agent load curve

When Microsoft [announced the $7.5 billion GitHub deal](https://news.microsoft.com/source/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/) in June 2018, Nadella framed it as a developer trust transaction. Microsoft said GitHub would retain its developer-first ethos, operate as an open platform, and let developers deploy to any operating system, any cloud and any device. That promise was meant for GitHub users. Eight years later, it has become an infrastructure fact for GitHub itself.

The pressure is visible in GitHub's own numbers. [Kyle Daigle (@kdaigle)](https://x.com/kdaigle/status/2040164759836778878?lang=en), GitHub's chief operating officer, wrote in April that commits were on pace to hit 14 billion in 2026, up from 1 billion in 2025, according to Business Insider. Commits are not revenue and they are not a perfect measure of useful software output, but they are a direct stress signal for a platform that has to store code, run checks, process pull requests, update search indexes, trigger automations and notify collaborators.

GitHub's official reliability posts make clear that this is not a normal growth cycle. In an [April availability update](https://github.blog/news-insights/company-news/an-update-on-github-availability/), GitHub CTO Vlad Fedorov wrote that GitHub began executing a plan in October 2025 to increase capacity 10X, then concluded by February 2026 that it needed to design for 30X scale. Fedorov, a former Meta engineering leader who co-founded UserClouds before joining GitHub, tied the shift to agentic development workflows that accelerated sharply in the second half of December 2025.

GitHub's [May availability report](https://github.blog/news-insights/company-news/github-availability-report-may-2026/) shows the company is already moving meaningful traffic to Azure: 40% of monolith traffic was being served from Azure, up from 8% in February, with Git traffic at 30% and repository replication at 99%. GitHub also said it had more than doubled effective capacity in four months. The same report disclosed nine May incidents that degraded GitHub services, including a May 4 disruption caused by a schema migration on a heavily used database table that cascaded into pull requests, issues, actions, webhooks and Git operations.

That is the context for the AWS decision. The issue is not just raw compute. GitHub is trying to migrate, shard and harden a mature collaboration platform while AI coding tools increase the volume of machine-generated work hitting old shared systems. The platform is being asked to become more reliable while being rebuilt and while usage patterns are changing underneath it.

### Reliability became a product threat

The most damaging outages for GitHub are not only downtime events. They interrupt the workflow GitHub sells: reviewing pull requests, merging code, running Actions, searching issues, resolving incidents and pushing releases. When those workflows stall, developers do not experience a cloud capacity problem. They experience GitHub as the blocker.

Mitchell Hashimoto, co-founder of HashiCorp and creator of the Ghostty terminal emulator, became the public version of that backlash in April. Hashimoto said he would move Ghostty off GitHub after 18 years using the platform, [The Register reported](https://www.theregister.com/2026/04/29/mitchell_hashimoto_ghostty_quitting_github/). His complaint was operational, not ideological: GitHub was "no longer a place for serious work" if it blocked him out for hours per day.

That kind of departure matters because Hashimoto is exactly the user GitHub cannot dismiss as a casual critic. He built developer infrastructure companies, helped create tools like Vagrant and Terraform, and represented the class of high-signal open source maintainers whose projects train the habits of everyone else. If those users start treating GitHub reliability as a tax, competitors do not need to beat GitHub's network outright. They only need to become credible enough for the workflows GitHub is failing to keep smooth.

Business Insider reported that GitHub has faced more competition from AI tools such as Cursor and [Anthropic's Claude Code](https://runtimewire.com/article/anthropic-claude-code-auto-mode-pro-sonnet-4-6), and that an internal Microsoft meeting late last year included discussion of overhauling GitHub to compete with those products. That competitive pressure changes the meaning of outages. GitHub is no longer just the place where developers store and review code. It is supposed to be Microsoft's control plane for AI-assisted software development. A platform outage in that context is a Copilot problem, an Azure problem and a Microsoft developer strategy problem at the same time.

### Azure's constraint is Microsoft's constraint

Microsoft is spending at a scale that should make GitHub's AWS detour look unnecessary. It does not. On Microsoft's fiscal 2026 third-quarter earnings call, CFO Amy Hood said the company expected to invest roughly [$190 billion in calendar-year 2026 capital expenditures](https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q3), including about $25 billion tied to higher component pricing. Hood also said Microsoft expected to remain constrained at least through 2026 even as it worked to bring GPU, CPU and storage capacity online faster.

That is the key line for GitHub. Azure capacity is not an abstract pool waiting for one Microsoft property to claim it. It is being allocated across Azure customers, OpenAI-related demand, Microsoft's own Copilot products, security workloads, data services and first-party applications. GitHub's problem is that it is both a strategic asset and one more internal claimant on scarce infrastructure.

I saw the same constraint from inside Microsoft. On the Microsoft for Startups team, I was constantly running into GPU scarcity issues as founders tried to secure capacity for AI workloads. That experience makes the GitHub report feel less like an isolated procurement surprise and more like a symptom of a broader allocation problem: Microsoft can be strategically committed to Azure and still be short of the specific infrastructure its own ecosystem needs on the timeline AI adoption is setting.

Renting capacity from AWS, if Business Insider's sourcing is correct, is therefore less a concession that Azure cannot scale than an admission that Microsoft's internal demand now exceeds the neat boundaries of its own cloud strategy. The company can still want GitHub on Azure by 2027. It can still use the migration to make GitHub more resilient. But the market is not waiting for the target architecture.

The same pattern is appearing elsewhere in AI infrastructure. Google agreed to pay SpaceX $920 million per month from October 2026 through June 2029 for access to compute capacity, [TechCrunch reported](https://techcrunch.com/2026/06/05/google-will-pay-spacex-920m-per-month-for-compute/). That deal is larger and stranger than GitHub leaning on AWS, but it points to the same market condition: even the companies that build the world's cloud infrastructure are buying bridge capacity from rivals and adjacent infrastructure owners because AI demand has outrun planning cycles.

For Microsoft, the GitHub move carries a second-order risk. Every hour GitHub spends recovering from incidents is an hour in which AI-native developer tools can argue that the old collaboration layer was built for human-paced software teams, not agentic systems generating pull requests, commits, test runs and repo activity at machine speed. GitHub has the network, the enterprise footprint and Microsoft's distribution. AWS capacity may help buy the time needed to preserve that position.

But it also makes the strategic reality plain: in the AI coding market, the bottleneck is not just model quality or developer love. It is whether the platform underneath the workflow can absorb the agents it helped unleash.
