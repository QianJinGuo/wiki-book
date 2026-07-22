---
source: newsletter
source_url: https://antfly.io/blog/agent-formal-verification
tags: [formal-verification, agent]
ingested: 2026-05-22
sha256: eb7477c67bb9
review_value: 8
review_confidence: 9
review_stars: 4
review_recommendation: strong
---

# Cheap code means formal verification is reasonable now — Antfly Blog


Markdown Content:
It would be an understatement hardly worth uttering to say that coding agents are a big deal. But using them most effectively isn't exactly as simple as telling Claude to build you a SaaS product and make no mistakes. Collectively, as software engineers (or whatever you call this job these days), it's up to us to find ways to be most effective with them while minimizing harm to what we're building.

One of the best techniques I know is having your agent hill climb on verifiable problems. This can be as simple as giving your agent a hundred (or a thousand, or ten thousand) checkboxes to check, like your unit test suite, and having it make sure that every test passes. Just be sure to double-check that it didn't mark a bunch to be skipped, and if your test suite is decent, you can be reasonably confident that your code behaves correctly. Or, you can give the agent a metric and ask it to optimize it. You might not use any of the code it produces, but reading its devlog as to how it went about optimizing for that metric could uncover valuable information. We've used this technique successfully to improve queries per second in Antfly by orders of magnitude, for example.

This is why comprehensive conformance test suites can be so valuable. If they're actually comprehensive, then you have strong guarantees that you'll end up with something that actually does what you want it to (see Simon Willison's writeup [here](https://simonwillison.net/2025/Dec/15/porting-justhtml/)). Agents are also very good at using a pre-existing set of ideas and procedures to create their own hills to climb. Martin Kleppmann (author of Designing Data-Intensive Applications) [made this argument](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html) in December by pointing out that formal languages would make excellent targets for coding agents. Essentially, formal verification of your codebase becomes vastly cheaper with good coding agents because formal languages have proof checkers and other ways of catching many of the types of hallucinations that language models create.

Enter TLA+. It's a formal spec language for modeling complex systems with many moving parts, with a model checker that exhaustively searches all possible states which are implied by the spec. It's perfect for finding the kinds of gnarly bugs like race conditions which can be hard to find other ways.

## introducing the hill[#](https://antfly.io/blog/agent-formal-verification#introducing-the-hill)

TLA+ is a way to formally model systems to check whether it's possible to reach certain states. For example, you could model an escape room and check whether it's possible for players to ever become stuck. You define possible starting points and transitions, like players discovering the Red Key in Room 1. If it's possible for some other part of the escape room to close access to the Red Key before players discover it, and the Red Key is necessary to progress, the TLA+ checker should discover that. Or you model participants in a distributed data storage system and check that it is impossible for data to be lost due to unresolved intents (ask me how I know).

Point is, this is very useful for distributed and concurrent systems like Antfly. There are all sorts of processes that are straightforward to model in isolation (shard A splits into shards B and C under conditions XYZ) but fiendishly complex when interacting with lots of other such components.

So our question was: how much value could we get out of modeling some or all of this in TLA+ without needing to write it or even read it ourselves? Sure, it might be _more_ effective if we spent a long time studying the language's intricacies and carefully modeling our systems with it, but how much value could we get from just a few afternoons of modeling it with agents? The answer, it turns out, is quite a lot!

## how it works[#](https://antfly.io/blog/agent-formal-verification#how-it-works)

Here's the workflow I eventually settled on. At first, I kept everything in one SKILL.md file that I directed the agents to use, but eventually I wrote my own CLI to scaffold it better.

Decide what we're actually focusing on. Generally the agent will have a list of hypotheses of problems we will be looking out for once I direct it to a section of the codebase we're interested in. I'll have it write up an assumptions.md and boundaries.md so it's forced to be clear about what is and is not in-bounds during the modeling step. This should exclude enough of the rest of the codebase so that we don't blow up the TLA checker (what actually checks all possible states of the system once we have written the spec) with a combinatorial number of pathways. We generally don't want to model third-party dependencies, operating system quirks, or cosmic rays hitting our VRAM, especially when the checker will happily write tens of gigabytes of system traces if your spec is sufficiently complicated. So it's worth getting clear on what we're _excluding_ from our model now.

Have the agent write the model and run the checker. This is another gate where the agent can find flaws in its initial assumptions. If you know that in your escape room it's possible for the players to lock the box the Red Key is in before retrieving it, that is a failure condition that the checker should show you the exact steps to take to reproduce.

Did we validate a hypothesis? If the agent found nothing, I might prod it to go deeper–look for anything inside the boundary we drew that it might still be making assumptions about, and explicitly add it to the model. Anyway, once it discovers a bug, I'll have it reproduce that bug by writing a test file proving it exists, and then fix the bug.

The fix. If I'm satisfied we have something real that's worth opening a pull request for, I'll have the agent draw up a brief for several different personas: layperson, CEO, CTO, and the (imagined) engineer that'll have to maintain this code in the future. This is another way that I can make sure I understand it at several different levels and that nothing seems off. The actual code for the fix should generally be short and obvious given all the work we've done to get there.

The important output of one of these workflows is a replication of the bug, the fix, and the explanation. The actual deliverable is really small! Just a test showing the cases where the bug happens, and a succinct fix that demonstrates that it now passes the tests. We don't necessarily care about the rest of the code that the agent wrote. We _could_ keep the TLA+ model, or we could just discard it. Code is, after all, cheap now.

## building confidence[#](https://antfly.io/blog/agent-formal-verification#building-confidence)

Here are some things that raised my confidence that the issues I initially uncovered were real:

*   Having the person who implemented the code verify that it was a real bug
*   Replicating the behavior in a unit test, and then fixing it
*   Testing that this workflow would discover confirmed bugs in a battle-tested codebase

For the last one, I first found a race condition PR that had been merged into the Pebble repo (a key/value store) which was also recent enough that it would be unlikely to be in Claude's training data. Then I checked out the commit just before that merge and did my workflow. It actually homed in on another bug, which I was then able to verify was also fixed in another Pebble PR later.

But the bigger risk with this kind of bug hunting isn't whether it _could_ find bugs, but that they would be buried in a haystack of spurious findings. That after diving into several of these bug reports and taking the time to understand them, I would come to the conclusion that this was mostly noise and not worth the effort. To build confidence here you pretty much just have to do the work. Generally I've found that at worst the problems the agents discover are minor, and often they're real issues that would inevitably affect actual users.

## reflections[#](https://antfly.io/blog/agent-formal-verification#reflections)

When code was much more expensive to write, we needed a lot more of the codebase to be valuable and load-bearing. Now it is cheap and we don't. For a distributed database, it's an obvious benefit to model it out in a language that lets us exhaustively enumerate the states our system can be in. This would have previously taken long enough that we might not have bothered, but now we can do it so quickly that it becomes another obvious way to check our system for flaws. The hill of modeling the system has become much easier to climb, and so we send Claude on its way because it's likely to find useful things in so doing.

Confidence in your codebase can't be automated away. It's ultimately your job as the builder to bear responsibility for what you're releasing into the world. So why not use agents to not simply make things faster, but make them _better_?

