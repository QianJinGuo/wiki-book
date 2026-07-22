---
title: "Decisions and Dollars"
source_url: "https://writing.nikunjk.com/p/decisions-and-dollars"
author: "Nikunj Kothari"
publish_time: "2026-06-12"
ingested: "2026-06-20"
sha256: "a0298da4cc1fc488"
tags: [agent-economics, business-model, data-moat, fintech, ai-pricing]
---

# Decisions and Dollars

Anthropic shipped Claude Fable 5 yesterday, the first Mythos-class model the public can use. It tops nearly every benchmark there is, with the lead widening the longer the task runs. The smarter the model, the less your software is worth on its own.

I tweeted last week that every venture-backed application company now has to be a data company or a fintech company, ideally both. This essay is the long version.

Let's start with the shift in who is using the software. I wrote two years ago that per-seat pricing cracks once agents become the users, and we seem to have crossed the line: Cloudflare says agent traffic passed human traffic for the first time. This fact has been debated online, but the trend is clear that agents are going to be the primary customer for all software. Think about what this does to the business model. A thousand employees running a hundred thousand agents isn't a hundred thousand seats. So, what can an application company charge for?

An agent leaves behind two things worth metering: the decisions it makes, and the money it moves. The decisions are data. The money is fintech. Those are the two companies you have to become.

xAI has an option to buy Cursor for $60B, a company that's now doing about $4B in annualized revenue. The software is NOT the main reason xAI had to pay up. Anthropic and OpenAI were already watching developers work in real time using Claude Code and Codex. Buying Cursor was the fastest way for xAI to get into the token flow. Musk said as much, that the record of how a million developers actually use models would go straight into Grok's training, and the high price was the toll for skipping the years it would take to collect that data the slow way.

People rebuilt working Cursor clones within weeks when it first launched and none of them caught on, because Cursor won on taste. The thousand small calls about what to surface and when to disappear. A clone copies the interface but inherits none of it. It can never reproduce the years of those developers accepting and rejecting and rewriting what the model handed back. Cursor now trains its own models on those diffs. The product won on taste. The data, however, became its primary moat.

To see why those diffs are worth sixty billion, imagine replacing 90% of your employees with a team of geniuses who have no idea how your company operates. It's just chaos. That is roughly what dropping a frontier model into your business feels like, and Fable 5 just made the problem more obvious. Because a model that solves 80% of real software tasks where last year's best managed barely half is not the thing you're short of. The geniuses are interchangeable, all brilliant, all hard to tell apart on any of these benchmarks.

They fail for one reason. None of them knows what the people you replaced knew.

The bandaid has been to pull that knowledge out of people's heads and hand it to the model as context. But most of it was never in a structure you could empty out. It's tacit, and it only ever surfaced in the choices people made. The deal they walked away from. The line of code reverted at 2am. That customer nobody chased, and nobody wrote down why. That's the real stuff. You can't write it down as workflows since a lot of it is judgment that is not being stored today.

To bridge this, we are now moving from a world of context -> harness -> judgment. Context was retrieval, the right pieces in front of the model. Harness was the scaffolding, the loop the model could run inside. Judgment is the last layer and the only one that compounds, everything left behind by every call and correction and reversal made on top of the data.

Every AI application pitch I see right now has the context slide as the moat. Context graphs, the why behind every decision, wire it all into the model. That part is table stakes now, because context is the one thing every competitor is assembling the same way.

The corrections are different. Think of them as a scorecard. Every time a user fixed what the model did, they recorded what right looks like in your business. That scorecard does two jobs nothing else can. It's the training signal that tunes a rented model to your business. And it's the test set, the only way to know whether your agent is actually getting better at the job, because no public benchmark measures your workflow. You don't need to pretrain a model from scratch. Even Cursor didn't. Its in-house models reportedly sit on top of an open-source base, with the diffs doing the differentiating. Fine-tuning and RL on top of frontier models got cheap enough that a Series B company can run this loop today. Two years ago you needed a lab.

Sarah Guo calls this territory the untrainable: work whose correctness can't be scored from the outside. The corrections are how you come to own it.

The vertical AI leaders already run this play. Harvey is worth $11B and Legora past $5B, both selling into law, both racing past the standalone tool toward owning the entire matter, because the lawyer's edits on a draft are the corrections nobody else gets to see. Rogo is doing the same inside finance, capturing how analysts actually build the model and revise the memo.

None of these companies trained a foundation model. They built the harness around a rented one and kept the judgment that runs through it. That's the thing that compounds.

An incumbent like Figma owns more than SVGs. It has the history of how a design got from v1 to v47 and every version someone killed on the way, a graded record of design taste. Linear holds the argument under every closed ticket. Notion holds the shape a team's thinking takes across a thousand edits. You can't export any of this when a competitor tries to pull the customer off, and all of it is the answer a generic model doesn't have.

Which is why the labs are buying judgment off the shelf. It started with human-labeled data: Mercor is worth $10B paying a network of experts $85 an hour. Meta paid $14B for Scale to own the pipeline. A startup in New York will now clean your apartment for free if you let it film the whole thing, because the robotics teams need to watch a human decide what to do next. And it's led to many RL environment companies reaching hundreds of millions of dollars in annualized revenue selling this same judgment over long-horizon tasks.

The labs trained on the whole internet and ran out, so now they buy decisions directly.

23andMe sat on DNA from fifteen million people, a dataset pharma would kill for in this day and age.. and still went bankrupt last year. If money doesn't flow through your data, you are just funding a science project. Most founders are still sleeping on this half.

Toast figured this out years ago. A restaurant is basically a payment processor with a kitchen attached, and the payments make Toast far more money than the software running the floor. Ramp took it further. Free corporate card, no fees anywhere, a cent or two skimmed off every dollar of the hundred billion that runs across it. That's a $32B company built on rounding errors. The free card was just the front door to the interchange, and the swipe fee holds because the network holds. Money even pays you while it sits, collecting float before it ever moves.

Not all money meters have a moat. One popular vibe-coding app reportedly makes about 50% margin on the credits it sells, most of its annualized revenue simply a markup on inference. But a token markup is not a moat.
