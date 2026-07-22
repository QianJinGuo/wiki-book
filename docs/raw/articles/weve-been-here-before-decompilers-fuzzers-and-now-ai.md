---
source: newsletter
source_url: https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/
title: "We've Been Here Before: Decompilers, Fuzzers, and Now AI"
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
ingested: 2026-05-13
sha256: "4d73247625ff5a65"
---
Published Time: 2026-05-09T00:00:00.000Z
Markdown Content:
![Image 1: A bottle of Mythos beer](https://www.clearseclabs.com/img/nick-karvounis-5vZyXAh6UjU-unsplash.jpg)
Mythos. The most recent name in AI RE/VR hype.
## What I Keep Hearing[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#what-i-keep-hearing "Direct link to What I Keep Hearing")
Lately, the same conversation keeps coming up with colleagues, students, and fellow researchers. The shape of it is roughly:
> _I've started reading and experimenting with AI, and honestly, it's really good. In some areas it's already faster than me. The more I use it, the less I can see what work will be left for us in five years._
The feeling is real, and I've heard it from senior reverse engineers with fifteen years on the keyboard and from people on their first run through Ghidra. The more capable the tools get in your hands, the more your relevance feels uncertain. That's a hard place to operate from.
Here's the part worth holding onto: we've been in this place before. The path out of the worry has been the same every time. Engage with the new tool early. Stay ahead of it by working with it.
## "Vulnerability Research Is Cooked"[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#vulnerability-research-is-cooked "Direct link to \"Vulnerability Research Is Cooked\"")
A recent post by Thomas Ptacek, ["Vulnerability Research Is Cooked"](https://sockpuppet.org/blog/2026/03/30/vulnerability-research-is-cooked/), argues AI agents will fundamentally break the economics of exploit development within months, not years. His core argument: LLMs already encode the correlations across source code plus the full catalog of documented bug classes. Vulnerability research is essentially pattern-matching plus constraint-solving, exactly what LLMs excel at. He was partly inspired by [Anthropic's results](https://red.anthropic.com/2026/zero-days/) showing Claude finding and validating over 500 high-severity vulnerabilities in open-source projects.
The [Hacker News discussion](https://news.ycombinator.com/item?id=47578086) blew up with 250+ points. The doom take: exploit discovery has gone exponential, offense wins, and human vulnerability researchers are obsolete.
It's a compelling argument. But I've heard this before.
## We've Been Here Before[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#weve-been-here-before "Direct link to We've Been Here Before")
Every generation of security tooling has its existential crisis.
### The Decompiler[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#the-decompiler "Direct link to The Decompiler")
When Hex-Rays made decompilation mainstream, the fear was that reverse engineering was over. If a machine could turn assembly back into readable C, what did you need a reverse engineer for?
Reality: decompilers didn't replace RE. They made it _accessible_. They raised the bar for what "real" RE work looked like. The people who understood the decompiler's limitations (where it hallucinated types, where it missed aliasing, where the output was plausible but wrong) became MORE valuable. The tool needed human judgment to be useful.
Sound familiar?
### The Fuzzer[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#the-fuzzer "Direct link to The Fuzzer")
[lcamtuf](https://x.com/lcamtuf/status/1804521053768888726) (Michal Zalewski), the creator of AFL, put it best last year:
> _"Frankly, I'm appalled by the prospect of LLMs taking offensive security research jobs from honest, hard-working fuzzers"_
The joke lands because we've already lived through the fuzzer version of this worry. AFL changed everything. Point a fuzzer at a binary and it would find bugs while you slept. Google's [OSS-Fuzz](https://github.com/google/oss-fuzz) found thousands of bugs automatically across hundreds of open-source projects. Project Zero was publishing a fire-hose of vulnerabilities. The fear then: if a machine finds bugs faster than you, why do we need vulnerability researchers?
Reality: fuzzers found the _easy_ bugs. The pattern-matchable, input-validation, memory-corruption bugs. The interesting ones (logic flaws, design issues, complex state machine bugs, authentication bypasses) still needed human intuition. Fuzzing didn't kill VR. It killed _easy_ VR. It pushed researchers toward harder, more impactful work.
### Static Analysis[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#static-analysis "Direct link to Static Analysis")
Coverity, CodeQL, Semgrep. Each promised automated vulnerability detection. Each found real bugs. None replaced the humans.
### The Pattern[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#the-pattern "Direct link to The Pattern")
Every time, the cycle is the same:
1.   New tool automates part of the work
2.   People worry the work is going away
3.   The easy version of the work **does** go away
4.   The harder, more interesting version becomes more valuable
5.   The people who master the new tool while retaining the old intuition become the most dangerous in the room
## What's Different This Time[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#whats-different-this-time "Direct link to What's Different This Time")
I'm not going to pretend nothing has changed. LLMs are qualitatively different from fuzzers and static analyzers.
**What IS different:**
*   LLMs _reason_ about code in ways fuzzers never could. They read commit history, understand context, and chain multi-step analysis.
*   Anthropic's report of 500+ validated vulnerabilities isn't a toy demo. [AI found 12 of 12 OpenSSL zero-days](https://www.lesswrong.com/posts/7aJwgbMEiKq5egQbd/) before humans did.
*   A few months later, Anthropic's [Claude Mythos preview](https://red.anthropic.com/2026/mythos-preview/) found [CVE-2026-4747](https://www.freebsd.org/security/advisories/FreeBSD-SA-26:08.rpcsec_gss.asc), a 17-year-old RCE in FreeBSD.
*   As one HN commenter put it: "VR output is verifiable", making it more automatable than general software engineering.
*   At [RSA 2026](https://cyberscoop.com/ai-cyberattacks-two-years-insane-vulnerabilities-kevin-mandia-alex-stamos-morgan-adamski-rsac-2026/), Kevin Mandia warned of a "perfect storm for offense" and Alex Stamos said exploit discovery has gone exponential.
This is real. I work with this stuff every day. I've watched agents find vulnerabilities I'd have taken hours to spot. I'm not dismissing it.
**What ISN'T different:**
*   Defenders get the same tools. The top HN comment nailed it: "If LLMs can find a ton of vulnerabilities in my software, why would I not run them and just patch all the vulnerabilities?"
*   The flood of low-quality AI reports is already a problem. The curl project can tell you all about it.
*   Novel vulnerability _classes_ still require human creativity. LLMs are incredible at pattern-matching known bug classes. Discovering a new _kind_ of bug? That's still us.
*   Understanding _what_ to look for, _where_ to look, and _why_ it matters still requires domain expertise. The human decides context.
## The Equilibrium Argument[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#the-equilibrium-argument "Direct link to The Equilibrium Argument")
If both offense and defense get AI, we reach a new equilibrium. And that equilibrium arguably favors defense.
As another HN commenter pointed out: in an "exploits are free" environment, attackers must find a complete chain while defenders only need to fix the weakest link. AI in CI/CD pipelines running continuously beats AI in an attacker's one-shot attempt.
An [ISACA survey](https://www.isaca.org/resources/news-and-trends/isaca-now-blog/2026/can-artificial-intelligence-replace-software-engineers-and-cybersecurity-professionals) found that 87% of cybersecurity professionals expect AI to enhance their roles. Only 2% believe it will replace them entirely. Sitting in that 87% is mostly a choice.
## What I Tell My Students[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#what-i-tell-my-students "Direct link to What I Tell My Students")
After teaching three cohorts of Building Agentic RE (yes, biased), I've noticed something. Almost everyone walks in carrying some version of the existential worry about AI, and that worry is real and reasonable. What turns it around is the same move the field has made every cycle before: learn the new tools, adapt your workflow, and leverage them. That sequence is the way through.
Your RE intuition is what makes the agents useful. They need _your_ context, _your_ judgment, _your_ understanding of what matters. The human in the loop isn't going away — it's becoming the most important part of the system.
People said the very same thing when the decompiler became popular. Then it was fuzzers. Now it's AI. There will always be more security work. There has never been more software in the world. Every IoT device, every cloud service, every embedded system, every AI model itself, all of it needs security.
The biggest opportunity isn't avoiding AI. It's learning to direct it before your peers do. Leverage it faster than everyone else.
## Wrapping Up[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#wrapping-up "Direct link to Wrapping Up")
To everyone carrying that worry: I hear you. The anxiety is real and valid. But I've watched this movie before, and the ending is always the same: the tools change, the work evolves, and the people who adapt become more valuable than ever.
Vulnerability research isn't cooked. It's evolving. And the people who understand both the old craft and the new tools will be the ones leading that evolution.
The sky isn't falling. But the game is changing. So let's change with it.
* * *
## How to Not Get Cooked[​](https://www.clearseclabs.com/blog/weve-been-here-before-ai-vulnerability-research/#how-to-not-get-cooked "Direct link to How to Not Get Cooked")
If you want to learn how to build and direct AI agents for reverse engineering and vulnerability research, check out [Building Agentic RE](https://www.clearseclabs.com/docs/training/building-agentic-re). The next [virtual cohort runs July 6–10, 2026](https://www.clearseclabs.com/docs/events/agentic-re-csl-virtual-2026), and the [upcoming courses](https://www.clearseclabs.com/docs/training/building-agentic-re#upcoming-courses) list has other dates. [Subscribe to our newsletter](https://www.clearseclabs.com/#newsletter) for course announcements.