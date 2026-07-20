# How To Measure Development Productivity?

## Ch01.071 How To Measure Development Productivity?

> 📊 Level ⭐ | 7.2KB | `entities/how-dev-productivity.md`

# How To Measure Development Productivity?

> **来源**: [How To Measure Development Productivity?](https://itamargilad.com/how-dev-productivity/)

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

![Image 3](https://itamargilad.com/wp-c

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-dev-productivity.md)

---

