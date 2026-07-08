# The Minimum Viable Unit of Saleable Software

## Ch01.679 The Minimum Viable Unit of Saleable Software

> 📊 Level ⭐⭐ | 6.6KB | `entities/minimum-viable-unit-saleable-software-brandur.md`

# The Minimum Viable Unit of Saleable Software

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/minimum-viable-unit-saleable-software-brandur.md)

## 核心内容

Markdown Content:
Last week I wrote about [leaving Stainless](https://brandur.org/nanoglyphs/051-that-was-fast) and my intention to work on building my side project [River](https://riverqueue.com/) into a small, sustainable business. When I sent that letter, a few people asked about my thought process in trying to run a software company in the age of AI: “Are you crazy?! Anything you ship can be instantly displaced by an internal package built by an LLM!” Having become as much of an LLM convert as anyone at this point, I acknowledge that it’s a very fair question. Indeed I might be crazy, but I’ll talk through my thought process, and you can decide.

Let me start with an anecdote. This morning I was browsing the internet’s most wretched hive of engagement farmers and master solicitors of fake information and fictional anecdotes, LinkedIn. One user there posted about how his company had been spending $400/mo on Atlassian’s Jira. He’d felt personally slighted by this outrageous bill, so he’d had his team build a new internal task tracker using Claude. Gone was Jira and the $400/mo spend, replaced by a custom package that could be tooled out in any way they needed via continued refinement by an LLM.

We’ve been talking about buy vs. build in software circles for years, but last year the calculus changed. It used to be that build was a _very_ expensive proposition, especially given the state of engineering salaries and scarcity of great people. One could expect huge upfront cost, schedule overruns, and an infinitely deep rabbit hole to slide down. The general wisdom had always been to build only inside your core domain and avoid getting sidetracked by peripheral projects. Once your company reached enormous size, and the cost of those distractions disappeared comfortably into its margins, then maybe they’d be worth doing.

But LLMs changed all of that. Suddenly it was quite possible to produce substantial pieces of software by getting models to do the work.

* * *

## [Cheap != zero](http://brandur.org/minimum-viable-unit#cheap-ne-zero)

While LLMs have made software considerably cheaper to build, they haven’t brought it to zero. Good LLM-built systems still involve a feedback loop, where an operator has the model work for a while, makes adjustments based on results, asks for another pass, refines further, and so on, taking dozens of loops to get to a satisfactory result that’s an optimal compromise between time spent and quality.

And like before, maintenance will be an ongoing cost. Especially for more complex packages, there’s always going to be a feature to add or bug to fix. LLMs will make those changes easier to make, but don’t make them free, with the most expensive element being the part-time labor of the human in the equation who oversees and verifies results.

Back to our $400/mo Atlassian anecdote above: after considering the initial build effort, including refinement passes, and the ongoing LLM-driven maintenance, does it pass the smell test, like at all? A task tracker’s still a complex piece of software, and even with gratuitous use of LLMs, you’d expect to spend at a minimum a few weeks on the initial push (charitably). From there, its internal owner will switch to bug fixes and feature development.

Let’s try to come up with some rough numbers to quantify the situation. Let’s say we have an engineer making $200k/year and working 40 hours a week (pretend for a second 9/9/6 was blessedly never conceived). That’s $16.7k/mo, $3,850/week, or $96/hour:

```
salary = 200_000.0

{
  month: salary / 12,
  week:  salary / 52,
  hour:  salary / 52 / 40,
}.each { |k, v| puts "%-6s $%0.2f" % ["#{k}:", v] }
```

```
month: $16666.67
week:  $3846.15
hour:  $96.15
```

To counterbalance the $400/mo that would’ve been paid to Atlassian, the engineer can spend _no more_ than 4 hours a month (400 / 96) prompting features/fixes on their homegrown Jira clone, or looking after its database, or whatever, not including context switching overhead. Even with LLM help, that’s completely unrealistic already, but let’s be charitable and say they can get it down to 2 hours a month. It’d still take _37 months_ to break even after those initial 2 weeks of effort (number of months to make back Atlassian’s $400/mo minus 2 hours/mo maintenance effort = 2 * 3846.15 / (400 - 2 * 96.15)).

Don’t get me wrong, I hate Jira just as much as anyone who’s ever used it and have a nearly uncontrollable urge to want to rebuild it too, but the math here doesn’t pencil out [1](http://brandur.org/minimum-viable-unit#footnote-1).

### [The build threshold](http://brandur.org/minimum-viable-unit#build-threshold)

But does that always hold true? Let’s take the other side for a second by examining a much higher-priced SaaS product. Gemini reports that the price of a fully loaded Salesforce seat is ~$500/mo. Say you need 50 seats, that’s $25k/mo!

For that price you could have 1.5x engineering resources (25 / 16.7) working on your clone full time. Once again, a CRM’s a reasonably complex piece of software and a rebuild wouldn’t be trivial, but no matter how you construe it, this is closer to a “build” decision, even for a smaller company. (And with Salesforce down 30% YTD, the markets seem to believe it too.)

* * *

## [The zone of viability](http://brandur.org/minimum-viable-unit#zone-of-viability)

I’m contending (and/or hoping) that for a software package of arbitrary complexity, there’s a **zone of viability** in which when priced within reason, it’ll make sense to buy over build, even given the existence of the powerful LLMs that’ve become our daily companions:

![Image 1: Zone of viability in a sweetspot between cost and complexity](https://brandur.org/assets/images/minimum-viable-unit/zone-of-viability.svg)

Software in the zone of viability satisfies two conditions:

*   There’s sufficient novelty as to make a rebuild-by-LLM non-trivial, and with some ongoing maintenance burden.

*   Pricing is not so exorbitant as to st

---

