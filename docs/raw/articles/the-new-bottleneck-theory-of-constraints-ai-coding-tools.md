---
title: "The New Bottleneck: Theory of Constraints in the Age of AI Coding"
source_url: "https://stackoverflow.blog/2026/06/18/the-new-bottleneck/"
ingested: "2026-06-19"
sha256: "f0d36ebbc2768a80"
---

Let’s say your engineering team does everything right: navigates the universe of AI coding tools, chooses the ones that fit best, gets everyone set up and aligned, and watches individual productivity surge. Engineers are shipping features faster; demos are impressive; leadership is happy.

But maybe, as time passes, you realize your team isn’t actually moving faster. Maybe sprint velocity is about the same, features are still snagging in the same places, and retrospectives are surfacing the same old complaints. Where did all that extra capacity promised by AI tools _go_? Something is absorbing it, but it’s hard to put your finger on precisely what.

The tools have changed, the way engineers work has changed, but the processes around that work (hand-off processes, definitions of _ready_ and _done_, loop-ins, sign-offs) haven’t necessarily evolved to match. With AI coding tools, have enterprises upgraded the engine but forgotten to keep their eyes on the road?

The famous [Theory of Constraints](https://www.tocinstitute.org/theory-of-constraints.html) goes like this: Every system has a constraint, and the moment you fix one, another one emerges. Improving a constraint doesn’t improve the system; it just creates inventory—work piling up in front of the next bottleneck.

This is well-understood in manufacturing, but less consistently applied to software development, where we tend to treat process improvements as valuable in and of themselves, rather than asking uncomfortable questions about whether we've actually moved the needle.

For a long time, of course, code generation was a genuine and legitimate constraint. Writing good software took time. Much of the organizational infrastructure we’ve become so accustomed to—agile, sprints, story points, velocity tracking—was designed to manage that reality, to deliver predictability and planning.

AI, of course, has significantly relieved that bottleneck. The incremental cost of a line of code, as Intuit Engineering Director Eric Anderson put it on [a recent episode](https://stackoverflow.blog/2026/06/11/engineering-leadership-zero-cost-code/) of _Leaders of Code_, is now “about the most inexpensive thing we do in software development.”

But most organizations are still running the process they built to manage the old constraint. The sprint structure is the same. The handoff model, the PRD template, the design review checkpoint—all the same. When Anderson's team sat down for quarterly planning recently, he described a moment of dawning realization: “We said, ‘Let’s not do that. Let’s actually reimagine what it will take to deliver that roadmap.’” Looking across his teams’ backlogs, he realized they had been thinking too small. The code wasn’t going to be the hard part, so where was the time actually going to go? That’s the question most engineering organizations haven’t asked yet.

The new bottleneck doesn’t announce itself. It just keeps appearing in the same places, sprint after sprint, and being chalked up to the wrong causes. Here’s what it looks like.

**Ideation and requirements.** When code is cheap, the cost of a vague or poorly considered spec goes up. A well-directed AI agent will build precisely what you described. If what you described was underspecified, you’ll figure that out fast, and the rework won’t be the fault of the AI. The discipline of knowing what you actually want to build (and why!) matters more now, not less. Organizations that treat discovery and requirements as boxes to check on the way to coding are going to feel that pain in their cycle times.

**Design handoffs.** Eric raised a pointed question about what “design complete” even means when UI iteration costs almost nothing. The traditional handoff model—fully finished designs passed to engineering before a line of code gets written—made sense when rework was expensive and time-consuming, but that calculus has shifted. In many cases, waiting for finished designs before starting to build just adds latency.

**Review and judgment.** More output means more review surface area. If a senior engineer is now overseeing work that would previously have occupied a full team, code review and architectural oversight become the bottleneck. This is already visible at organizations that have deployed AI broadly without changing how review, QA, or technical sign-off work. When output doubles but review capability doesn’t, something’s gotta give.

**Cross-functional coordination.** This one is easy to overlook because it doesn’t show up in engineering metrics, but the speed at which an engineering team can now move often far outstrips the pace at which product, design, legal, and security can work. That mismatch can generate its own waste in the form of finished work that sits on a shelf, waiting for sign-off processes that were never designed to move this quickly. When the bottleneck sits outside the team, it’s harder to see and harder to fix (but not impossible—keep reading).

It’s not like engineering leaders don’t _know_ their processes are out of date. Plenty of them do. But process change is difficult in a way that seems more daunting than unveiling an exciting new tool.

**Process change is cross-functional.** You can mandate that your engineers adopt a new coding tool, but you can’t mandate that your product organization rewrite how it does discovery or that your design team rethinks its handoff model. These conversations require buy-in across functions that don't share a reporting line, and they require someone with enough organizational standing to push on all of them at once. Most engineering leaders can move their own teams, but moving the surrounding system is a different problem.

**The old process feels safe.** Agile was itself a response to the failures of waterfall, but in many orgs, agile has calcified into its own version of what it replaced. Sprints and ceremonies deliver comfort and predictability even when they’re no longer driving speed. Letting go of familiar structure feels risky and uncomfortable, particularly when teams are already absorbing big changes from new tooling.

**Nobody knows what the new process looks like yet.** This part merits more honesty in conversations about AI and engineering. “We don't really know how to do it well,” Anderson explained. “We’re experimenting and learning through the process.” There is no established playbook for running a software team when code generation is essentially free. Organizations waiting for consensus best practices to emerge before making a move are assuming that the field will converge quickly. But will it?

Upgrading how your team works doesn’t require you to blow up the existing structure all at once. Instead, interrogate your process function by function, checkpoint by checkpoint, to see whether each part is solving a problem that still exists. Some parts of the process will hold up, but others may look very different when you consider them from another angle.

**Start with a question, not a framework.** For each part of your current process, ask yourself: _What constraint was this designed to address, and is that still the constraint?_ A two-week sprint made sense when planning in smaller chunks reduced the cost of changing direction. Does it still? A design review gate made sense when engineering time was substantially more expensive. Does it still? Not every answer will be “no,” of course, but it’s worth asking the question at every juncture.

**Rethink what “ready to build” means.** The traditional definition of “ready”—complete spec, finished designs, all dependencies resolved—was built to protect expensive engineering time. That’s not the world we live in anymore. Anderson described Intuit moving toward a model where PMs and engineers co-develop features in real time rather than passing finished specs down a chain. In this model, the design becomes a starting point, not a strict prerequisite.

**Compress the distance between idea and experiment.** AI’s biggest value may not be faster code generation; it may be faster _learning_. Anderson talked about Intuit going from choosing which of two experiments to run to being able to run nine, or 90, or 900. Getting there requires a process designed for experimentation, not just execution: smaller cycles, a lighter definition of “done,” and success metrics oriented around what you learned rather than just what you shipped.

**Treat cross-functional friction as an engineering problem.** The bottleneck being outside the engineering team—with product, design, legal, or security—doesn’t make it not your problem. Engineering leaders who want to move faster benefit by helping adjacent teams and functions move faster, too. That might mean pairing more closely during discovery or building shared tooling that removes manual work from review processes. Even just acknowledging the friction is a helpful first step.

Let’s go back to the team from the intro: they’ve got upgraded tools, higher individual productivity, but they’re still not moving faster. Nothing’s broken, but the process is absorbing the gains before they show up in the output.

Tools, unlike processes, are easy to change, so organizations roll out new tools and call it “transformation” because it’s so much easier than overhauling the process. If you’ve been tossing your clothes on the floor for years, buying a new dresser isn’t going to change the way you operate unless you also transform your process from clothes → floor to clothes → dresser. A new tool can drive and encourage process changes, but the process itself needs to evolve at some point.

If code is no longer the bottleneck, are you organized around the thing that actually is?

_Leaders of Code is a segment of the Stack Overflow Podcast. To suggest topics or guests, email podcast@stackoverflow.com._