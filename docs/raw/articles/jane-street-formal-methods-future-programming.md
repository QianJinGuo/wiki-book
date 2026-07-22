---
title: "Formal methods and the future of programming"
source_url: "https://blog.janestreet.com/formal-methods-at-jane-street-index/"
ingested: 2026-06-16
sha256: "68eebe0d9efeec8269e39167b6b3795de61d0a435372145a6f0351cd8951d6cf"
type: article
tags: [formal-methods, agentic-coding, jane-street, verification, ai]
---


Published Time: Mon, 15 Jun 2026 17:52:01 GMT

Markdown Content:
I’ve been telling people for the last 25 years that Jane Street as an organization was just not interested in formal methods.

I’m not saying that anymore.

It’s not exactly that I think we were wrong all those years. To be clear, we’re strong believers in the power of tools to help us write better and more reliable code. And type systems are a kind of lightweight formal method that we’ve gotten an enormous amount of benefit from. So you might expect us to have been big believers in more full-on formal methods.

But outside of some special cases (notably, hardware synthesis), our sense has been that formal methods were just not worth the costs for us. And those costs are really high! [seL4](https://sel4.systems/) is a great example of this. It’s a formally verified microkernel, and a profound achievement. But, boy [was it expensive to do!](https://www.sigops.org/s/conferences/sosp/2009/papers/klein-sosp09.pdf) It took 25 person-years of effort to verify 8,700 lines of C, and each line of code required something like 23 lines of proof and a half a person-day to verify.

Our hope is to make formal methods as pervasively useful of a tool for building software as sophisticated type systems are for us today.

That kind of approach could be worth it for a security-critical microkernel, where the stakes are high and the specifications are fairly clear. But it just doesn’t make sense for most software, and to us it didn’t feel like it made sense for even our most critical software.

But the emergence of agentic coding has changed our perspective, and we’ve gone from being skeptical to being excited about the possibilities. And as a result, **we’re now building a team to focus on formal methods**. Our hope is to make formal methods as pervasively useful of a tool for building software as sophisticated type systems are for us today.

## Why the change of heart?

Agentic coding upsets the formal-methods apple-cart in a few ways.

For one thing, it dramatically changes the cost of using formal methods. It’s not that agents can on their own construct arbitrarily challenging proofs.[1](http://blog.janestreet.com/formal-methods-at-jane-street-index/#fn:not-all-proofs) But models are enormously helpful, and broaden the set of people who can use these tools productively. With formal methods being easier to use than ever, it’s worth reconsidering the old cost/benefit calculus.

But things haven’t changed only on the cost side. The benefits seem bigger now too. There are really two reasons for this:

**The verification bottleneck is more important than ever**. Models are increasingly good at writing useful code. But there’s a big gap between the code that models generate, and code that you’d want to actually release. To some degree, this is an artifact of how the models are trained. They’re surprisingly good at achieving the goal you set in front of them, but they don’t do a great job of maintaining and even improving the quality of the codebase as they do so. Agentic code is getting better, but is still tends towards slop: overly complicated, full of weird bugs and corner cases, often not following essential invariants of the codebase that it’s a part of.

As a result, people need to spend a lot of time verifying that the code produced by agents is up to snuff. And formal methods could be a way of relieving some of that verification burden, and making the process of review a lot more efficient.

Separately, **agents thrive on feedback**. This is true both when you’re training agents using RL, and when you’re using agents to code. And formal methods are another powerful form of feedback that can increase the agents’ ability to solve hard problems.

A lot of why we're excited about full-on formal methods is that we see how valuable types are when programming with agents.

Not that formal methods are the only way of getting feedback. Tests are incredibly valuable as well, and can be made even better by leaning into [property-based tests](https://harrisongoldste.in/papers/icse24-pbt-in-practice.pdf) and [fuzzing](https://blog.janestreet.com/getting-from-tested-to-battle-tested/). And lord knows we’ve spent a lot of time building out [testing infrastructure](https://blog.janestreet.com/the-joy-of-expect-tests/).

But tests aren’t enough! There are inherent limits in the power of tests to cover the state space that your program might explore. One of the things we’ve seen in our own programming in [OxCaml](http://oxcaml.org/) is that agents benefit a ton from universal guarantees, the ∀ you get out of type systems. If your type system has a way of [preventing data races](https://richarde.dev/papers/2025/drfcaml/drfcaml.pdf), it lets you get rid of _all_[2](http://blog.janestreet.com/formal-methods-at-jane-street-index/#fn:all) data races. If you set up your types to make cross-site scripting vulnerabilities impossible, then you can really get rid of those entirely, in a way that mere testing has trouble doing.

Indeed, a lot of why we’re excited about full-on formal methods is that we see how valuable types are when programming with agents, both for easing the verification bottleneck and providing agents with better feedback, and that makes us excited to see how much more uplift could be available by leveraging more powerful proof techniques.

We have two things going for us: deep control of the language we're using, and a community of programmers who are ready for this.

## Why do it here?

One question this raises is: why is Jane Street well positioned to work on this problem? The whole world is thinking about what agents mean for the future of programming, and there are endless startups looking for ways of mixing formal methods and agents. Why is this something we’d work on internally? And why should formal methods experts in the outside world be excited to join our efforts here?

For one thing, **we have deep control of the language we’re using**, and that lets us adjust that language to make it a better home for proof-oriented techniques. There are lots of potential directions to go here: from integrating modular specifications of properties into the type system, to adding type-level constraints around things like ownership and mutability to make certain kinds of proofs easier, to building proof techniques directly into the language.

We also have **a community of programmers who are ready for this**, or at least more ready than any serious programming community I’ve encountered. For most people who work on programming languages, the easy part is coming up with new and better ideas about how to make programming better. The hard part is convincing anyone to actually use those ideas for real work.

At Jane Street, things are different! We routinely have users angry at us because the new, weird type-system features we promised them aren’t coming fast enough. We have a lot of people with the right background to leverage these techniques, and a lot of baked in interest in getting things right and building high-quality software.

We think that user base will gives us the freedom to try a mixture of approaches; there are some near-term improvements we think we can make which will have pretty immediate impact, and some ambitious, longer-term visions for where we can get in a few years. Having an engaged and excited user base makes both of these approaches possible, and lets us learn from the first, while we build towards the second.

None of this is to say that we’re going to ignore work in the outside world. We’re excited and inspired by the work in a variety of other PL communities, built around tools like [Lean](https://lean-lang.org/), [Dafny](https://dafny.org/), [Rocq](https://rocq-prover.org/), [Agda](https://hackage.haskell.org/package/Agda), [Iris](https://iris-project.org/), and too many more to mention. And we’re excited to look for ways of integrating OxCaml with some of these tools, to take advantage of the great infrastructure that’s already out there. But we also think there are some unique advantages that can only be realized by engaging with the language and the proof techniques at the same time.

## Join us!

If this sounds interesting to you, consider applying! We’re looking for people in both [London](https://www.janestreet.com/join-jane-street/position/8588405002/) and [New York](https://www.janestreet.com/join-jane-street/position/8585303002/). We’re in the early stages of interviewing people for these spots and building a team, and there’s an enormous amount of work ahead of us, and we’d love you to be a part of it.

## Footnotes

1.   Our experience is that models still need help and guidance from humans in order to navigate a complex proof. A human programmer may have ideas about why a system works and how, at a high level, to go about proving it. But most programmers don’t know how to encode these proof ideas in a way that will satisfy a given proof system. Models can automate much of the drudgery and provide a ready source of expertise on the technical details of writing out a proof.[↩](http://blog.janestreet.com/formal-methods-at-jane-street-index/#fnref:not-all-proofs)

2.   OK, well, maybe not all. There are escape hatches, like `Obj.magic`, that let you work around type-level constraints. But you can track and ban exceptions like that for most of your code, at which point you do get something very close to universal guarantees. And, indeed, formal methods can allow you to make it explicit why your use of those escape hatches is actually safe.[↩](http://blog.janestreet.com/formal-methods-at-jane-street-index/#fnref:all)

Yaron Minsky joined Jane Street back in 2002, and claims the dubious honor of having convinced the firm to start using OCaml.

