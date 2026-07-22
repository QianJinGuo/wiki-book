---
title: "How To Measure Development Productivity?"
source_url: "https://itamargilad.com/how-dev-productivity/"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: bf4a57c87a14a5fcb901190086c471205b4d852599517546e0fb767237fa7ef3
---

# How To Measure Development Productivity?


Published Time: 2026-06-21T13:42:51+00:00

Markdown Content:
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

![Image 3](https://itamargilad.com/wp-content/uploads/2026/06/Output-vs-Outcoes-vs-Control-1024x620.jpg)
In [another recent article](https://itamargilad.com/discovery-ai/) I ran a product idea through two theoretical scenarios: 1) AI-boosted just-do-it approach 2) Slower development rate coupled with product discovery. In the first scenario the team is able to launch a solution quickly, but then has to iterate hard and finally rollback a harmful feature in a panic. In scenario 2 the team is able to pivot the idea and generate meaningful business improvements.

![Image 4](https://itamargilad.com/wp-content/uploads/2026/06/Results-Summary-Table-1024x374-1.jpg)
These are fictional examples, but they are based on real-world cases I see all the time. Companies that use [evidence-guided development](https://mybook.to/0hPtd1Y) are far more efficient and productive in terms of _business and user value_ (really, the only terms that matter) and they take less time to achieve these results.

### Perverse Incentives and Misalignment

> _“We optimize for what we measure. When we choose the wrong measurement, we get the wrong behavior” — James Clear, Atomic Habits_

Engineers are smart. Once they realize they are measured on output, that’s what they’ll optimize for. Good luck getting them to pay attention to the mission, the strategy, or the goals. Burning those story points and delivering those features will become the focus. If the feature does nothing or even harms the business or the users, so be it —_that’s not their problem_ — they did their part.

Thus output metrics create misalignment. The developers start acting as hired contractors — inflating estimates, negotiating hard to reduce scope and implementation risk, and prioritizing for dev goals at the expense of business value.

### System Effects

Optimizing for output can also create negative effects on the product and on the organization:

*   **Product bloat**— the more features and capabilities we put into the product the more costly it becomes to maintain and to support, and the harder it is to develop further. It’s a slippery slope that often ends in the sage that is “the big rewrite”.
*   **Work in progress** — Opting for output also tends to create more work-in-progress (WIP). High WIP has been long shown to be a detrimental factor in software development. I like this diagram by John Cuttler that depicts the negative company-wide effects that high work-in-profgress can cause, including lower throughput, lower focus, lower outcomes, degraded morale, and more process and rework.

![Image 5](https://itamargilad.com/wp-content/uploads/2026/06/John-Cuttler-WIP-real-good-1024x576.jpeg)

Source: John Cuttler, [The Beautiful Mess](https://cutlefish.substack.com/p/tbm-4052-why-limiting-wip-starting)

## What’s the Alternative?

Let’s get back to the question that started this article:

**_What are the right metrics for developers?_**

Invoking the Socratic method, we might ask:

*   Why do you want to set metrics for developers? What’s the goal?
*   Why measure developers in separation from the rest of the organization?
*   If you did find that elusive dev metric, how would you act on it?

If we dig deeper and keep asking questions I suspect we’ll arrive at some deep-rooted assumptions:

*   We know exactly what needs to be done (no uncertainty) so the real bottleneck is speed of delivery.
*   The organization can be split machine-like into parts — dev, marketing, sales, etc. Optimizing each part will optimize the whole.
*   People have to be measured or they’ll slack off

These assumptions are very typical of a [traditional company mindset](https://itamargilad.com/product-operating-model/) — top down, execution-focused, and mistrusting.

In contrast, here’s how companies that use the modern operating model tend to think:

*   Developing fast and efficiently is important, but the bigger challenge is launching the _right_ things.We care about both.
*   We have to work together to achieve company goals. Setting separate disciplinary goals is an anti-pattern that causes misalignment and siloing.
*   Measuring human performance is very tricky and fallible. The motivation to do the right thing should come from intrinsic motivators rather than from “performance” against a metric.

Which brings us to the modern product playbook:

*   Cross-functional teams that have their own _outcome_ goals (sometimes stated as “problems to solve”) and are empowered to work to achieve these goals. For example the onboarding team may strive to shorten the average onboarding time and may conduct research, run experiments and launch product ideas it believes will best serve the goal.
*   Most goals are about outcomes — changes in business results, user behavior, or system characteristics. These goals are cross-functional.
*   The most important thing to measure is how well the teams, the business units, and the company are doing on accomplishing their goals. There can be many other metrics of course, but they must all contirbute to the higher-level goals.
*   When we come short on the goals, we need to ask what could be improved. If you suspect development is too slow, that’s the time to discuss what that means and why it’s happening. You may consult various health metrics, including the ones I talked about above. But these play a supporting role, rather than take center stage.

In other words, it’s better to think of your company as a multidisciplinary system built to create business and user value. The metrics should flow from there.

## The Bottom Line

It’s absolutely fine to measure commits, pull requests, tokens, even story points. These metrics are meaningful and useful in certain contexts. But they are bad proxies for value creation and dev productivity.

Stop worrying about measuring your developers rate of production, and worry much more about how the team, the business unit, and the company are doing on value creation for the business and users.

Even if your company is not working this way yet, removing meaningless or harmful metrics is a good first step. If any of your managers or stakeholders are unconvinced, send them this article.

**Join my newsletter to get articles like this**

**plus exclusive eBooks and templates by email**

**Upcoming Workshops**

Practice hands-on the modern methods of product management, product discovery, and product strategy.

Secure your ticket for the next[**public workshop**](https://ti.to/itamar-gilad-events/)

or book a[**private workshop**](http://itamargilad.com/workshops) or [**keynote**](http://itamargilad.com/keynotes) for your team or company.

Share with a friend or colleague

