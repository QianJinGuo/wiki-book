sha256: dd3c69325e2c8b56f36ff4fefb7cc16d5b186d8e7e170745556dcc2d6d6718ce
---
title: "Code is the easy part, or how we refactored half the business to fix a janky script | Swizec Teller"
source_url: "https://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script"
ingested: "2026-06-29"
type: article
tags: [newsletter]
---

# Code is the easy part, or how we refactored half the business to fix a janky script | Swizec Teller


Markdown Content:
This is a war story. The kind that puts timezones to shame. I think timezones are pretty easy, honestly. They're just the first time many of us deal with arbitrary capricious business rules.

Classic startup engineering story: Someone had built a leaky rowboat. It worked! Then we started flying the rowboat as a Cessna. What we needed was an aircraft carrier.

I love this shit 😈

## [[Some context](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#some-context)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#some-context)

Plasmidsaurus has grown _very_ quickly. I [joined in August 2024](https://swizec.com/blog/some-personal-news/) and it felt like jumping on a galloping unicorn. The business was closing in on 20mil annual revenue and growing fast.

June 2026, we can see 100mil within reach. Huge milestone for a startup because it makes you a unicorn (1bil valuation). That's 5x growth in cold hard revenue over two years! Not bad.

But our billing system was built for a much smaller scale.

A creaky python script issued every invoice, customers called support to make billing changes and update their info, we granted every exception and weird rule you can think of. Anything to make customers happy.

After a few years our wonderful [ball of mud](https://swizec.com/blog/big-ball-of-mud-the-worlds-most-popular-software-architecture/) agglomerated so much tech and product debt it takes a whole team to keep running. The finance team even knows hundreds of customers by name! We have business rules that were never written down or put into code. Someone just knows what to do.

Month-end invoicing was always ... stressful. Sometimes it took an all-nighter or two to get everything invoiced in time! We maybe [let this small fire burn](https://swizec.com/blog/let-small-fires-burn/) too long 😅

Earlier this year my team started fixing the situation. This is the [spinning plates part of a startup](https://swizec.com/blog/yes-its-like-spinning-plates/), you hop problem to problem. The fix took a few months, we're not done, but end of May we ran invoicing with zero stress. It was wonderful.

Well okay I was pretty stressed. You only get to test this once a month and it was our first time running in automated mode end-to-end. It took 2 days instead of a whole week and I had a couple long evenings to fix UX problems we found during a test run.

## [[First make the problem simple, then solve the simple problem](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#first-make-the-problem-simple-then-solve-the-simple-problem)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#first-make-the-problem-simple-then-solve-the-simple-problem)

Ok so, you have a billing system that runs in production and supports all your revenue. You know it works. You know it's a constant source of stress, confusion, and frustration.

Your operators know how to keep it running but they don't understand how it works. The more you dig, the more it sounds like 3 years ago they saw a bug, tried a workaround, and now that's your official workflow. The bug has since been fixed but they keep doing the workaround. Just in case.

Every operator has a slightly different approach. Same is true for customers. Workarounds upon hacks upon mythologized beliefs and subtly incorrect mental models.

When you ask what's wrong, the answer looks a little like this:

[![Image 1: Panic Monster from wait but why](https://swizec.com/static/698ed422f663a07edba8f452b5e55c58/4ef49/Panic-Monster-from-wait-but-why-i92725.png) Panic Monster from wait but why](https://waitbutwhy.com/2013/10/why-procrastinators-procrastinate.html)
This is not very helpful and you're not sure what to fix first. Everything's on fire, everybody's stressed, nobody knows how it works. You're one bad day away from the finance department drowning under their workload and the business stops.

With a system like this you can putter around the edges fixing small bugs and surface-level issues forever and you'll never make progress. **You first have to make the problem simple.** What's _the one thing at the core_ that makes everything broken?

### [[It's your data model](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#its-your-data-model)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#its-your-data-model)

> Bad programmers worry about the code. Good programmers worry about data structures and their relationships.
> 
> 
> ~ Torvalds

The thing making everything hard for us was the data model holding it all together. Users belong to institutions and labs and we invoice based on that.

Some users want their own invoices, others just want their purchasing department to deal, yet others roam between institutions depending on the project. Academics are weird.

To top it off, sales uses this structure to understand our customers and assign territories (affects their compensation), customers use it as a way to collaborate and organize into groups, plus a few other features that all got smooshed together. Everyone has different needs and trying to use the same data model to get it done.

> You don’t really have a complex app until you have 1 shared concept that 3 types of users look at differently.
> 
> 
> Same conceptual thing, many perspectives. All correct. All incompatible. All need to work together.
> 
> — Swizec Teller (@Swizec) [April 28, 2025](https://x.com/Swizec/status/1916894051745554480)

After filling a bunch of whiteboards and breaking a few brains, we figured out the solution: Billing entities. A new data model that answers _"How do we invoice this?"_ independent of a user's collaborations and org structures. Place an order, tell us how to invoice, we don't care about the rest.

I find big hairy problems almost always have a simple solution like this. The **problems are big and hairy because your data model no longer fits your domain model and the abstractions are wrong**. Instead of adding more hacks, fix the issue.

## [[Talk to your users](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#talk-to-your-users)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#talk-to-your-users)

You can't find these solutions by staring at the code. We talked to _everyone_.

Our **first meeting with the finance team took 6 hours**. The airing of grievances was fantastic. Immediately we saw a couple bandaids we could add to make their lives easier.

And we started to see the issue. A small hunch in the back of our minds when finance talked about the different challenges. Hmmm sounds like there's a common thread going through these.

These long meetings are great, btw. You need the space to dig deep.

Over the next weeks and months, when customers asked questions that felt relevant, the finance team would connect us with those users directly. This helped us understand how customers think about things from their end. We uncovered whole classes of under-served users and missing features. It was great.

We talked to all internal users of the relevant data models too. Anyone who cares about org structures, data sharing, user growth, ... we needed all those perspectives to find the simple solution.

Secretly I was doing an informal version of [event storming](https://swizec.com/blog/finding-modules-in-a-big-ball-of-mud/). Who are the actors? What are the domain events and commands? How does the whole system get work done? What's the right mental model for how things _should_ work?

## [[Watch people work](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#watch-people-work)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#watch-people-work)

It helps to [watch people work](https://swizec.com/blog/watch-people-work/).

When users talk about their problems, you get a polished presentable version and lots of digested ideas. This is almost always wrong. People always know when something's wrong and rarely know how to fix it.

When you watch people work, you get to see their exact pain points, the friction they experience, and heuristics they apply to decision making in real time. Many they don't even realize.

For example:

We knew the finance team verifies all purchase orders have been used correctly before they rip through invoicing. A purchase order is like a magic string IOU that large orgs use to keep track of budgets. User types in a string, we send an invoice, purchasing person goes _"Ah yes, that budget has been approved. Pay"_

The more we asked what they look for, the more exceptions and edge cases the finance team came up with. The ruleset was vast and intractable. We tried getting AI (Claude) to write a validator and it came back with a regex and parser so gnarly it hurt my soul.

Then we sat down and watched them _do_ month-end invoicing. The rules were simple: Purchase orders align neatly into a column (same length) and have a matching 3 or 4 letter prefix.

Me and Cursor had the validator ready that afternoon. No more babysitting. Slowest manual step removed 💪

## [[It's a roadmap not a project](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#its-a-roadmap-not-a-project)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#its-a-roadmap-not-a-project)

Ok great, you've talked to everyone, watched people work, interviewed external users to see what they think, and you've got a Very Simple Solution.

But this Cessna is flying. You can't stop the business to swap the engine and you can't ask people to stop doing their jobs or throw away years of muscle memory on a random afternoon when you hit deploy. They [_like_ spacebar heating](https://xkcd.com/1172/) it's comfortable!

Welcome to the wonderful world of change management. It sucks.

How do you update a core business process that's been running unchanged for a few years, has a whole team attached, a few other teams depending on it, and several thousand users who touch it every day, oh and it processes millions of dollars that your and everybody else's salary depends on? No pressure 😅

You go in steps. Think skateboards and scooters, not wheels and chassis. **The software has to keep working the whole time**. No broken states.

[![Image 2: 01mvppng 957a4h](https://swizec.com/static/a8836c1b8587fc10cdfaf88c2541fa36/8efc2/01mvppng-957a4h.png)](https://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp)
Although we did have to pause day-to-day invoicing for one very stressful week while we stopped using Quickbooks and the new Rillet integration was not yet ready. This saved us 3 weeks of time because transitioning your invoicing vendor is cleaner at the end of a month. We needed an extra week to get the new integration ready.

A roadmap means that **your simple solution becomes many projects**. The simple solution is your vision, the projects are individual pieces you execute as you [kick the can](https://swizec.com/blog/writing-software-is-like-kicking-a-can/).

### [[What it took to automate invoicing](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#what-it-took-to-automate-invoicing)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#what-it-took-to-automate-invoicing)

Our main goal was to automate invoicing and make the business model less labor intensive. You always [want to scale the business exponentially and costs logarithmically](https://swizec.com/blog/the-3-curves-that-make-a-scalable-business/), otherwise you'll hit a wall and the business crumples under its own success.

I mentioned Billing Entities as the core fix. This took refactoring half the business.

**New tools for users:**

*   new features so users can self-organize into labs
*   new ways to share sequencing data via the lab-as-share-group structures
*   new billing admin so users can manage their billing info, track spend, and create billing entities without talking to support
*   new features that let users share payment methods through the lab structures. This was previously a hidden talk-to-support menu item
*   new ways to manage purchase orders so there's less _"Enter a number from the heart and hope for the best"_

**System migrations:**

*   all billing info migrated to the new data model instead of being smeared between labs and institutions
*   migrate to a new invoicing provider (Quickbooks -> Rillet) because QB couldn't scale with our needs. Shoutout to Rillet engineers for their help here, they even shipped a few API features we asked for ❤️
*   improved machinery to parse documentation that purchasing departments send to us. Now shared with the billing admin so users can upload a doc and it fills everything out
*   proper test harnesses for the AI tooling around document parsing so we can reliably make improvements
*   rewrite the invoicing script so it's idempotent, re-runnable, and doesn't require constant stop-and-go babysitting
*   update and simplify the invoicing script to treat billing entities as the core data model instead of relying on hacky workarounds
*   proper test suite and sandbox environment for the invoicing script so we can move faster and be less afraid

**New tools for finance:**

*   tool to manage billing entities (users give unverified info, we make sure it's good, etc)
*   track uninvoiced items so they don't have to remember manually
*   explicitly manage billing exceptions (incorrect info, write-off, institution went bankrupt, etc) and the invoicing machinery knows to skip these or raise for manual review _"Hey last month this one was bad, has it been fixed?"_
*   new tools to help finance triage and fix invoicing issues. Includes a 1-click feature to re-run invoicing for specific orders after manual intervention
*   delete a few workflows that became unnecessary because users can self-manage

The invoicing code now has more tests than code, which is the correct ratio for something that's this full of weird little edge cases. Half the test suite is designed to catch regressions or to ensure we fixed bugs that were found.

I'm also excited that we used this as an opportunity to introduce some engineering rigor into our "But what if AI?" initiatives. You can do much better prompt engineering with a dataset of inputs and outputs collected from real world use-cases. Especially the examples where your AI didn't work.

## [[Ship along the way](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#ship-along-the-way)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#ship-along-the-way)

This was a lot of work. I don't know how many person hours. All in all it's been 6 months and at least 6 people involved. A few engineers, a few finance folk. Finance helped a lot with testing and verifying we're getting it right. There’s more roadmap to go.

You can't do a major refactor like this while hiding in the basement and hoping it works out. The software never stopped, the business kept growing, and no matter what we had to keep supporting a few thousand orders per day throughout.

We shipped in small increments. A fix here, a touch there, new feature shoved into a familiar place for users to discover.

For many months we ran invoicing in dual mode –billing entity if available, fallback to the old way if not. This caused endless confusion for the finance team, we mostly kept it hidden from users. But it helped us find many catastrophic edge cases that we wouldn't have found otherwise. Old business rules that went forgot, exceptions that happen once a month, and weird behaviors users come up with. It also caused a few problems so I was happy when that final delete PR came.

The big changes came in the end.

Once everything worked beneath the hood, we shipped a huge UI update for the new billing admin. Revamped the entire user settings area. One big go, poof, everything changes.

Users _loved_ it. Many had no idea those features existed! They never stumbled into them in the hidden places. To a user, no update feels real until it comes with a big UI change.

We started getting feature requests, thanks, and kudos. Users would go out of their way to email us about their new superpowers 🥰

## [[Did it work?](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#did-it-work)](http://swizec.com/blog/code-is-the-easy-part-or-how-we-refactored-half-the-business-to-fix-a-janky-script#did-it-work)

Yes!

Invoicing feels less stressful, the finance team is happy – We ripped through month-end invoicing in 2 days instead of a week– and we've got both anecdotal and hard data to show users love their new superpowers. Hundreds of labs created, dozens of user-provided billing entities.

You know your feature works when users say _"Hey this hammer is great but what if it could also ..."_. That means they're using it to get work done.

Cheers,

 ~Swizec

Published on June 17th, 2026 in [Software Engineering](https://swizec.com/categories/software%20engineering/), [Software Architecture](https://swizec.com/categories/software%20architecture/), [Product Management](https://swizec.com/categories/product%20management/)

#### Continue reading about Code is the easy part, or how we refactored half the business to fix a janky script

Semantically similar articles hand-picked by GPT-4

*   [Coding is the easy part](https://swizec.com/blog/coding-is-the-easy-part/)
*   [Why software only moves forward](https://swizec.com/blog/why-software-only-moves-forward/)
*   [Logging 1,721,410 events per day with Postgres, Rails, Heroku, and a bit of JavaScript](https://swizec.com/blog/logging-1721410-events-per-day-with-postgres-rails-heroku-and-a-bit-of-javascript/)
*   [How big up-front design fails](https://swizec.com/blog/how-big-up-front-design-fails/)
*   [Why great engineers hack The Process](https://swizec.com/blog/why-great-engineers-hack-the-process/)

[![Image 3: Senior Engineer Mindset cover](https://swizec.com/static/49b03d61b7348ccaa62e58389b04f057/d0275/SeniorMindset-cover-3d.png)](https://swizec.com/senior-mindset/)

### Senior Mindset Book

Get promoted, earn a bigger salary, work for top companies

[Learn more](https://swizec.com/senior-mindset/)

**Have a burning question that you think I can answer?** Hit me up on [twitter](https://twitter.com/swizec) and I'll do my best.

**Who am I and who do I help?** I'm Swizec Teller and I turn coders into engineers with _"Raw and honest from the heart!"_ writing. No bullshit. Real insights into the career and skills of a modern software engineer.

**Want to become a _true_ senior engineer?** Take ownership, have autonomy, and be a force multiplier on your team. The Senior Engineer Mindset ebook can help 👉 [swizec.com/senior-mindset](https://swizec.com/senior-mindset). These are the shifts in mindset that unlocked my career.

**Curious about Serverless and the modern backend?** Check out Serverless Handbook, for frontend engineers 👉 [ServerlessHandbook.dev](https://serverlesshandbook.dev/)

**Want to Stop copy pasting D3 examples and create data visualizations of your own?** Learn how to build scalable dataviz React components your whole team can understand with [React for Data Visualization](https://reactfordataviz.com/)

**Want to get my best emails on JavaScript, React, Serverless, Fullstack Web, or Indie Hacking?** Check out [swizec.com/collections](https://swizec.com/collections)

**Did someone amazing share this letter with you?** Wonderful! You can sign up for my weekly letters for software engineers on their path to greatness, here: [swizec.com/blog](https://swizec.com/blog)

**Want to brush up on your modern JavaScript syntax?** Check out my interactive cheatsheet: [es6cheatsheet.com](https://es6cheatsheet.com/)

**By the way, just in case no one has told you it yet today: I love and appreciate you for who you are ❤️**
