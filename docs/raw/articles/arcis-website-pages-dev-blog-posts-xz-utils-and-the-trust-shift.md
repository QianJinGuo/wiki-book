---
title: xz, two years on: what scanners still cannot catch
source_url: https://arcis-website.pages.dev/blog/posts/xz-utils-and-the-trust-shift
ingested: 2026-06-04
sha256: 5f3f5d7d9dd1ffd25c171868b0054e7d87377dcb194b1df15f6efe337d788fc0
review_value: 7
review_confidence: 8
review_stars: 4
---

# xz, two years on: what scanners still cannot catch


Published Time: 2026-05-19

Markdown Content:
CVE-2024-3094 was not caught by a CVE scanner. It was caught by an engineer noticing a 500ms slowdown on SSH login. Two years later, the way we think about supply chain risk has changed. Most tooling has not caught up.

**The takeaways.**

*   The xz-utils backdoor was a maintainer-trust hijack, not a code vulnerability. CVE-driven scanners cannot catch attacks until a CVE exists.
*   Real-time feeds (OSV), postinstall-script scrutiny, and maintainer-shift signals close gaps that lockfile scanning structurally cannot.
*   Supply chain security is a maintenance discipline, not a CI-time scan. The lockfile is fresh once a quarter. The threat landscape is fresh every day.
*   Three practical moves: pin direct dependencies, review every lockfile diff, subscribe to a real-time feed for the languages you ship in.

The xz-utils story is the most-told supply chain story of the decade for a reason. It is the cleanest single example of a class of attacks that the security industry had been warning about for years and that almost no scanner was equipped to catch.

The short version is this. In late March 2024, Andres Freund, a PostgreSQL maintainer working at Microsoft, noticed that SSH connections to his test machine were taking around 500 milliseconds longer than usual. He could have ignored it. Most people would have. Instead he pulled on the thread, and the thread led to a backdoor that had been inserted into upstream xz-utils, a compression library that almost every Linux system depends on, by a maintainer who had been steadily building trust in the project for two years. His [original message to oss-security](https://www.openwall.com/lists/oss-security/2024/03/29/4) on March 29, 2024 is the artifact every supply chain practitioner should read in full at least once.

If the backdoor had shipped to stable distros without that catch, it would have given the attacker remote code execution as root on a large fraction of the internet. Distro release schedules and a lucky observation are the only reasons it did not.

## Why your scanner did not catch it

Most supply chain scanners do one thing well. They cross-reference the package versions in your lockfile against a database of known CVEs. If `xz-utils 5.6.0` is in your lockfile and CVE-2024-3094 says `xz-utils 5.6.0` is bad, the scanner alerts. Useful. But the alert came after a CVE existed, and a CVE existed only because Andres noticed the 500ms.

If you had run any CVE scanner against xz-utils 5.6.0 on March 28, 2024, the day before Andres posted his findings, it would have come back clean. The package had no known vulnerabilities. The maintainer had a clean reputation. The release notes were boring and routine. By every signal a static scanner could read, xz-utils 5.6.0 was a fine version to depend on.

This is the core problem. CVE-driven scanning answers "is this version known to be bad." It does not answer "is this version safe." For most of computing history these questions had the same answer. They are starting to diverge.

## The trust hijack pattern

The xz attack followed a pattern that researchers had been describing in the abstract for a long time. A new contributor, identifying themselves as Jia Tan, appeared on the xz-utils project in 2021. They submitted reasonable patches. They were responsive on the issue tracker. They were helpful. Over about two years, the existing maintainer, working alone, burned out, and Jia Tan was added as a co-maintainer with commit rights.

Then the backdoor went in. Not in the source. In the build system. Specifically in the autotools m4 macros that generated the release tarballs. The git source looked clean. Anyone reviewing the repo on GitHub saw nothing wrong. The release tarball, which is what distros actually built from, contained a step that swapped in a malicious object file at link time. The detection path through a normal code review would have missed it. You would have had to compare the tarball against the git tree, byte by byte, to see the divergence.

This is the part that should keep security teams awake. The attack did not rely on a code vulnerability. It relied on the maintainer trust model. The maintainer was a real account, with a real commit history, with real pull requests merged into real downstream projects. There was no CVE to scan for because there was no flaw, in the usual sense. The package was doing exactly what its maintainer wanted it to do. The maintainer was a hostile actor.

## What scanners should have caught

The honest answer is that no static lockfile scanner could have caught xz pre-disclosure. The disclosure created the CVE. The CVE updated the database. The scanners that checked the database then started alerting. That is the lag, and it is unavoidable for purely CVE-driven tools.

What modern supply chain tools are starting to add is a layer that does not depend on CVE creation. Three categories of signal show up here.

**Real-time vulnerability feeds.** The [OSV project](https://osv.dev/), run by Google, aggregates vulnerability data across npm, PyPI, Go, Rust, and others, and exposes it as a queryable API. The Arcis CLI ships an OSV cache layer with a 24-hour TTL specifically so that an audit reflects what was published in the last day, not what was published when your tool last shipped. CVEs still drive the data, but the loop closes faster.

**Postinstall script scrutiny.** A non-trivial number of supply chain attacks in 2024 and 2025 used npm postinstall scripts. The package itself was harmless. The postinstall, which ran on every install, exfiltrated environment variables or wrote files into your user directory. The [lottie-player compromise](https://nvd.nist.gov/vuln/detail/CVE-2024-9079) in October 2024 followed exactly this shape: a popular animation library was hijacked, a malicious version was published, and the postinstall pulled a credential-stealing script before any application code ran. The Solana web3.js compromise in December 2024 was another, where versions 1.95.6 and 1.95.7 included account-draining code that ran on import. Static tooling that walks `node_modules` after install can flag postinstall hooks for review. This catches a class the CVE scanner does not see at all.

**Maintainer-shift signals.** A package that has had three releases in a year, and then suddenly does five releases in a week from a new email address, is doing something a CVE scanner cannot weigh. Some tools are starting to add this as a signal, alongside contributor-graph changes, signing-key changes, and unusual release timing. The xz attack would have lit this up if anyone had been watching. The lottie-player and Solana web3.js compromises would have too.

## What changed for application teams

The post-xz response within the application security community has been quieter than I expected. There were a few weeks of public reckoning. Then most teams went back to the same CVE-scanning workflow they had before. The harder lesson, which would have required changing how dependencies are vetted, has been mostly absorbed at the distro level (where it counts) and not much at the application level (where it also counts, just slightly less).

The lesson, I think, is this. Supply chain security cannot be a one-time scan at CI time. It is a maintenance discipline, the same way patching is a maintenance discipline. The question "is this dependency still safe to use" needs to be re-asked on a cadence, not at a single point in the build pipeline. Every PR is a chance to ask. Every dependabot bump is a chance to ask. Every quarterly review is a chance to ask. The answer changes faster than the lockfile.

**Three practical moves.** Pin direct dependencies, not transitive ones. Enable lockfile review on every PR. Subscribe to a real-time feed for the languages you ship in. None of these are silver bullets. All of them tighten the loop between "a maintainer pushed something bad" and "you stop pulling from that maintainer." That loop is the real metric.

## The deeper shift

The xz incident hardened a view that was already taking shape. The dominant supply chain risk in modern software is not buggy code by good actors. It is intentional code by hostile actors who have built up trust. The defenses that work for the first do not work for the second.

This is also why almost every supply chain tool that has shipped since 2024 has added something beyond CVE matching. Snyk added Snyk Advisor with package-health signals. Socket built an entire product around supply chain attack detection in npm. GitHub shipped tighter dependabot signals around malicious-package classifications. Google open-sourced osv-scanner. The shape of each tool is different. The direction is the same: defense in depth, in the supply chain, beyond the CVE.

The Arcis SCA layer is in this space, in a small way. The threat database is curated, deliberately small, and weighted toward packages that have shown supply-chain compromise patterns rather than all known CVEs. The OSV cache adds the time-fresh layer on top. Neither replaces a dedicated supply chain platform for an enterprise. Both close gaps in the "your CI ran a scan two weeks ago" model.

## Where to start

If your team has not had the post-xz conversation yet, here is what it should produce. Three artifacts.

The first is a list of your direct dependencies, the names and versions you actually pin. Not transitive. Just direct. If that list is over fifty for a single service, your dependency surface is bigger than your security surface, and that is the actual problem.

The second is a rotation for who reviews dependency bumps. Not just runs them. Reads the diff. Spots the unfamiliar contributor name. Notices when the release cadence changes. A dependency upgrade is a code review that you should be doing on the upstream, not just on your own diff. This is uncomfortable to scale. It is also the only thing that actually catches the xz-shaped attack.

The third is a policy for what happens when a maintainer transition is announced. New email address. New signing key. New release schedule. These are signals you can act on, ideally by pausing upgrades on that package until the change has been observed for a few weeks in the open.

None of these are exciting. None of them ship a feature. All of them are how supply chain security actually works now, two years after the closest call the open source ecosystem has had.
