---
title: score by collisions, patch by panic
source: rss
source_url: https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/
sha256: ce000dbaf1c4
created: 2026-05-21
---

Title: score by collisions, patch by panic

URL Source: https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/

Published Time: 2026-05-19 00:00:00 +0000 UTC

Markdown Content:
## TLDR;[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#tldr)

Score severity by collision count. Researchers ship patches not just reports. Companies redesign for a world where the exploit lands before the patch. No magic. No vendor pitch. Just the playbook.

* * *

The [last post](https://blog.himanshuanand.com/2026/05/the-90-day-disclosure-policy-is-dead/) went further than I expected. NYT’s [Hard Fork](https://www.nytimes.com/2026/05/15/podcasts/ai-safety-is-so-back-mythos-mayhem-with-nikesh-arora-hot-mess-express.html) picked it up. The [Lobsters thread](https://lobste.rs/s/qxkdgl/90_day_disclosure_policy_is_dead) had sharp questions. A few people made a fair point. “The model is broken” is a complaint not a proposal.

So here is the proposal.

## a new severity model[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#a-new-severity-model)

The current model treats every report as if it lives in a vacuum, One reporter, One bug, One timeline. That was the assumption the old playbook ran on It no longer holds. Here is what severity should look like in 2026.

**One reporter and No exploit.** Standard severity. Standard window. Business as usual.

**Two or more reporters of the same bug.** Severity goes up a notch. If unrelated researchers are finding the same flaw a less friendly party probably has it too. Shrink the window.

**Working exploit attached.** Critical. The patch window collapses from weeks to days.

**Working exploit and a public PoC.** P0. Stop the line. Patch now.

The collision count is the signal. Use it.

Linus said the quiet part out loud last week on [LKML](https://lkml.org/lkml/2026/5/17/896): ![Image 1: Linus Torvalds LKML AI Bug Reports Screenshot](https://blog.himanshuanand.com/images/linus_lkml_screenshot.png)

> So just to make it really clear: if you found a bug using AI tools, the chances are somebody else found it too.

If you needed proof, [Searchlight Cyber’s cPanel writeup](https://slcyber.io/research-center/new-age-of-collisions-reading-arbitrary-files-pre-auth-as-root-in-cpanel-cve-2026-29205/) just made the case better than I can, Strong team. Years of experience on the target. A real head start. Custom tooling that decompiled cPanel’s Perl binaries back to source. They still got beaten by a threat actor by two months. Two months.

If a team operating at that level can be late, the math has changed for everyone.

![Image 2: panik kalm panik](https://blog.himanshuanand.com/images/panik_collisions.jpg)

## the independent researcher problem[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#the-independent-researcher-problem)

Here is the part my proposal does not solve cleanly.

If you are a solo researcher you have no telemetry, No customer logs, No threat feed. You find a bug You filed a report and You sit on it. You have no clue if the bug is already being burned in the wild while you wait. I do not have a clean fix the best I can offer is this assume the worst, Assume you are not the only one, File the report and Push hard for a short window. If the vendor stalls that is now a vendor problem.

The other thing Linus said is worth quoting in full:

> If you actually want to add value, read the documentation, create a patch too and add some real value on top of what the AI did. Don’t be the drive-by “send a random report with no real understanding” kind of person.

I have been guilty of the drive-by. You find a bug you have the impact you want to ship and move on. But a report with a patch attached gets fixed faster, every single time and it builds trust you will need next time you walk into that vendor’s inbox.

If the project is open source read the code. Find the fix. Send a PR. Even a wrong patch gives the maintainer a starting point. A blank page does not.

## for the bug hunters who feel cooked[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#for-the-bug-hunters-who-feel-cooked)

I get it duplicates everywhere the bounty pools shrinking and the model ships faster than your weekend project.

Look at this year’s Pwn2Own Orange Tsai dropped a full chain Logic bugs only No memory corruption No LLM in the loop No collisions.

> That’s my chain. A full chain w/ logic bugs only! No memory corruption, no AI, and of course no collisions at all
> 
> 
> [@orange_8361](https://x.com/orange_8361/status/2054906050143240399)

![Image 3: Orange Tsai P2O Tweet](https://blog.himanshuanand.com/images/orange_p2o.png)

The skill ceiling is still up there. LLMs eat the bottom of the pyramid. The work that needs three months of context, weird intuition and a deep feel for how a system actually behaves is still very human. Sharpen up.

There is light at the end of the tunnel. Not very bright at the moment. Maybe because of the current Strait of Hormuz situation. But it is there.

## for the corporates[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#for-the-corporates)

This part is going to hurt because the answer is “do more work”, I do not have a shortcut.

Your code is yours your dependencies are not. Your dependencies’ dependencies are definitely not, The world your stack runs in now has automated bug finders that are getting better every quarter. The plan has to account for that.

### the basics[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#the-basics)

If you are not doing these yet start here.

**Stop `npm update` on autopilot.** Supply chain is a real risk not a slide deck risk, Pin versions, Read changelogs. Scan the diff before you accept it. The next compromised package is already in someone’s repo.

**Defense in depth.** One control will fail, Always. The next one needs to catch it. If your only protection is “the WAF will block it” you have one control.

**Validate before deploy.** Every environment, Staging that does not mirror prod is a placebo. The bug that hits prod is the one that did not exist in staging.

**Continuous runtime validation.** Stop treating security like a release-time event. Run checks in prod. Live. All the time.

**Virtual patching and WAF rules.** When a CVE drops and you cannot patch in four hours you need a rule that buys time, Pre-build that capability. Do not invent it during the incident.

**Zero-day playbook.** Write it before you need it, Who runs the call, Who writes the WAF rule, Who calls the vendor, Who tells the customers, Who flips the feature flag. If you are deciding any of this during the incident you have already lost the first four hours.

### the harder stuff[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#the-harder-stuff)

If you have the basics here is where you go next.

#### 1. egress lockdown by default[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#1-egress-lockdown-by-default)

Everyone obsesses over ingress, Stop the bad guys from getting in. But when a zero-day fires in a third party package the attacker is already inside.

What do they do next: They phone home C2 server, Pull a payload, Exfiltrate data

So make that impossible

Block all outbound internet by default. Treat every microservice like a hostile entity. If a service needs to talk to the payment gateway allowlist that exact domain. Nothing else. If the exploit fires but the call home fails the exploit fails.

#### 2. ephemeral architecture (burn it down)[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#2-ephemeral-architecture-burn-it-down)

Attackers love persistence. Once they exploit a zero-day they want a foothold. A backdoor. Time to look around. The longer your server lives the more it leaks.

Treat servers like cattle not pets.

![Image 4: cattle not pets](https://blog.himanshuanand.com/images/cattle_not_pets.jpg)

**Aggressive recycling.** Containers and instances get destroyed and rebuilt from a clean image every 12 to 24 hours, No exceptions for “but our service is special”.

**Immutable infrastructure.** No persistent changes on live boxes, If an attacker writes a backdoor at 3pm it is vaporized at midnight when the box is replaced from a clean image. They have to re-exploit every cycle. Most operators will give up before you do.

#### 3. sandbox the runtime[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#3-sandbox-the-runtime)

If an attacker exploits a zero-day in a web app they inherit the permissions of whatever user runs that app. If that user is root they own the box. So stop running as root.

**Rootless containers.** No app should ever run as root, Period. If your container ships with `USER root` fix it this week before anything else on this list.

**System call filtering.** Use seccomp or AppArmor. A web server has no business calling `/bin/sh` or mounting a new filesystem. Block it at the kernel. When the zero-day tries to spawn a shell the kernel just says no.

#### 4. architectural circuit breakers[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#4-architectural-circuit-breakers)

In finance when a stock drops too fast trading halts. Same idea for software.

**Automated isolation.** If an endpoint suddenly reads the database a hundred times faster than normal route traffic away from it. Quarantine the container into a separate VLAN. Page someone. Do not wait for a human to notice the metric on a dashboard at 2am.

**Feature flags for security not just product.** Wrap every high-risk third party integration in a flag. Vendor announces a breach at 9pm. You flip the flag. The feature dies. The rest of the business stays up. No emergency deploy. No 3am call. One toggle.

## the questions I dodged[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#the-questions-i-dodged)

The Lobsters thread asked real questions. Let me try them here.

**“Will LLMs hit a ceiling on bugs?”** Maybe. Fuzzers did. AFL ate everything for a couple of years then the easy bugs dried up and the work moved up the stack. LLMs might play out the same way. Bottom of the pyramid drains. Top stays hard. The middle is where the arms race lives and the side that scales smarter wins it.

**“LLM scanners return 400 false positives for every real bug.”** True today. Less true every month. Tune the prompts. Stack a deterministic SAST tool ahead of the LLM to cut the noise floor before the model ever sees the code. The job is not “LLM replaces human”. It is “LLM filters the ten things a human should actually look at this morning”.

**“Change management exists for good reasons. Fast patching breaks things.”** Also true. The honest answer is this. Build the rails for fast safe deploys _before_ the next zero-day. Canary. Auto-rollback. Feature flags. Blue-green. If your pipeline takes six hours and has no kill switch that is a separate problem and it will kill you on incident day no matter what disclosure model the industry agrees on.

**“What about closed source? Cisco firmware diffs?”** Worse problem not better. Frontier models are already strong at decompiled binary analysis. A side-by-side firmware diff turns into a patch analysis exercise. The “security through obscurity” buffer is shrinking too.

**“What about formal verification?”** Promising for new code. Slow. Expensive. Worth it for the kernel, the crypto, the auth layer. Not realistic for the microservice you ship next sprint. Use it where it matters most.

**“What does the world look like at 10x or 100x incidents?”** I do not know. But the side that automates fastest wins. Right now that is the offense. Defense has to close the gap.

## final thoughts[⌗](https://blog.himanshuanand.com/2026/05/score-by-collisions-patch-by-panic/#final-thoughts)

Severity by collision count, Researchers ship patches not just reports, Companies redesign for a world where the patch lands after the exploit not before.

None of this is free. None of this ships next week. But the old playbook is not coming back. The faster we accept that the faster we start building the new one.

![Image 5: this is fine](https://blog.himanshuanand.com/images/ThisIsFineDog.jpg)

If any of this resonated [hit me up](https://x.com/anand_himanshu). If you disagree _especially_ hit me up. The whole point of writing this stuff is to get holes punched in it before an attacker does.

Thanks for reading.

