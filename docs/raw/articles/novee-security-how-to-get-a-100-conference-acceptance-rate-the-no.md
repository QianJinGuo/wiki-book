---
title: "How to Get a 100% Conference Acceptance Rate, The Novee Way: A High-Severity CVE in Leading Call-for-Papers Software"
source_url: https://novee.security/blog/pretalx-stored-xss-vulnerability-account-takeover/
url: https://novee.security/blog/pretalx-stored-xss-vulnerability-account-takeover/
ingested: 
sha256: 9a4acac5d0699d8aa49693cf42ff26630afe2a979ea4a13557de166bda831562
tags: [article]
---

URL Source: https://novee.security/blog/pretalx-stored-xss-vulnerability-account-takeover/

Published Time: 2026-05-27T12:06:20+00:00

Markdown Content:
_A walkthrough of how Novee finds the type of chained exploit that SAST and DAST miss, and how to speed-run your next CFP cycle (kidding). A massive thank-you to the pretalx team and creator Tobias Kunze for their extraordinarily rapid and cooperative disclosure._

## What you need to know

*   The Novee Security research team disclosed a high-severity stored XSS – leading to **account takeover** – in **pretalx,** the open-source conference management platform used by a long list of technical events to run their CFPs and schedules.
*   Any registered user could plant HTML or JavaScript in the organizer-side search result dropdown, and have it execute in an organizer’s browser when the organizer’s typeahead query matched the record.
*   The moment a program chair typed a query that matched a malicious record, the payload executed in the organizer’s browser with the ability to call authenticated endpoints on the organizer’s behalf – including **the endpoint that accepts a submission and account takeover.**
*   The flaw was assigned **CVSS 8.7 (High)**: network attack vector, low complexity, low privileges required, user interaction required, scope changed, high impact to confidentiality and integrity. The flaw received CVE-2026-41241.
*   Fixed in pretalx v2026.1.0.

## The Setup

As a founding engineer and security researcher at Novee, my job is to think like an attacker – and to train Novee’s AI agents to do the same.

When I discovered this particular exploit, however, I was doing something ordinary: preparing conference submissions. Different events, different review committees, different deadlines, but I noticed the same submission form kept appearing under different logos.

Much of the technical conference world runs its CFPs on **pretalx**, an open-source platform behind everything from hacker camps to academic symposiums. From the outside, each event looks independent. Underneath, it is one codebase serving them all.

That is the kind of pattern an attacker notices. If the workflow is shared, a flaw in it is not one bug – it is a systemic exposure. And if the flaw is the right shape, an autonomous agent can operationalize it across every instance, without direct participation from the attacker.

Submitting to forty CFPs by hand is a project. Submitting to forty CFPs with an agent is a script. And if the underlying software has the right kind of flaw, you do not need to convince forty program committees of anything – you just need to convince one piece of JavaScript.

## Inside the Vulnerability

**Pretalx** is not a carelessly built application. It ships a strict Content Security Policy: script-src ‘self’, no inline scripts allowed. The HTML5 spec adds another layer, <script> tags inserted via innerHTML do not execute. Even if you find an injection point, two independent defenses stand between you and JavaScript execution.

The organizer search bar is that injection point. It renders results via innerHTML, and submission titles flow into the dropdown unsanitized. When an organizer types a query that matches a malicious record, the HTML renders.

On paper, it should not matter. CSP and innerHTML’s script suppression should make this a cosmetic issue at worst. In practice, both layers of defense were bypassed without breaking either one:

**The first defense is innerHTML’s script suppression.** The HTML5 spec says <script> tags inserted via innerHTML do not execute. But <iframe srcdoc> creates a fresh document parsing context, i.e. a new page inside the page. In that context, <script> executes normally. And because pretalx’s CSP has no frame-src directive, same-origin iframes are allowed by default.

**The second defense is CSP**. script-src ‘self’ means only scripts served from the application’s own origin can run. An inline script would be blocked. But the script is not inline — it loads from the same origin via <script src=…>. CSP passes.

The question is, where does a same-origin JavaScript file come from when the attacker has no server access? The answer is the CFP itself. **pretalx** lets speakers attach resources to their submissions, like slides, papers, supplementary materials. There is no file-type restriction. The attacker uploads a .js file as lecture materials, and the platform serves it from its own domain.

The full payload fits in a submission title:

“`

<iframe srcdoc=”<script src=/media/…/payload.js></script>” style=display:none>

“`

An organizer searches. The dropdown renders the title. The iframe loads silently. The script executes with full access to the parent page – the organizer’s authenticated session. From there: session hijack, data exfiltration, self-propagation. Zero clicks after the search query. Zero visual indication.

![Image 1](https://d2ooqtrark7773.cloudfront.net/wp-content/uploads/2026/05/image-1-1024x640.png)

_Demonstration of Typeahead Search_

The chain also yields powerful primitives that do not require JavaScript at all.

The obvious next move would be <img onerror=”…”> to execute script when the image fails to load. CSP blocks that too, inline event handlers are treated the same as inline scripts under script-src ‘self’.

But the <img> tag does not need “onerror” to be dangerous. The browser makes an authenticated GET request to load the image source. That is just how images work. An <img src=/orga/me/subuser> in the submission title fires a GET request to the superuser-demotion endpoint the instant search results render. The endpoint processes the request. The organizer’s superuser status is permanently revoked – irreversible without direct database access.

Zero clicks. No JavaScript. The browser did exactly what browsers do with images.

**The Key Takeaway:**The upload, the iframe, the CSP bypass, the parser behavior, the GET endpoints – these are individually unremarkable. Together, they are full JavaScript execution, account takeover, and permanent admin destruction. The exploit lives in the composition, and composition is what scanners, like DAST and SAST, do not model.

![Image 2](https://d2ooqtrark7773.cloudfront.net/wp-content/uploads/2026/05/image-2-1024x640.png)

_Demonstration of Stored-XSS → Account Takeover_

## The Novee Way

Here is how an attacker with an agent turns the primitive described above into a 100% acceptance rate:

*   **Collect targets.** Scrape open CFPs across any conferences running pretalx. The deployments are public so finding them is simple reconnaissance.
*   **Generate variant abstracts.** A talk per venue, each tuned to its theme. This is the easy part since this is what LLMs are good at – textual output.
*   **Plant the payload.**Embed the script in the submission title or speaker display name, padded with the generic substrings – “intro”, “machine learning”, “case study”, “panel” – that any program chair will type into the search bar within minutes of opening the queue. **Bonus:** For higher reliability, send a follow-up email from a throwaway address asking the organizer to look up the submission by name. This is the type of social engineering prompt that attackers weave into their breaches all the time – and the type that no scanner can catch.
*   **Submit everything.** Let the agent track decisions.

The acceptance rate is whatever the dropdown match rate is. With enough generic substrings, that rate climbs fast.

![Image 3](https://d2ooqtrark7773.cloudfront.net/wp-content/uploads/2026/05/image-3-1024x616.png)

_Demonstration of Auto-Acceptance_

## Deterministic Multi-Agent Validation: How Novee Catches What Scanners Miss

Stored XSS has been a checkbox on AppSec scopes for two decades. Scanners are great at catching it: SAST flags the innerHTML sink. DAST replays payloads against the search form. And manual pentest notes the state-changing GET endpoints. Each tool does its job, and each files a **low-risk finding**. None of them can compose the full chain that leads to the exploit.

Every component in this chain is something a tool catches individually. Each one is classified as low-risk on its own. The chain is in full composition.

Novee agents are trained to follow these sorts of chains. They follow the workflow, compose the primitives, and prove the path end to end. One agent exploits. A second re-exploits blind. A third validates independently. Where possible, validation is deterministic, confirming exploitability with certainty.

Most security tooling is built to find isolated bugs. Static analysis flags innerHTML. DAST scanners replay payloads against forms. Manual pentests probe a single application during a fixed engagement. Each of these works on a slice of the problem.

What none of them model is the full chain a real attacker exercises: a privileged user who happens to use a feature in a particular way, a workflow endpoint that accepts authenticated requests, and an attacker willing to seed inputs across every deployment of the same software at once.

**The Key Takeaway:**Account takeover via XSS in 2026 is not just XSS. It’s whatever the workflow around it lets an attacker do. Validating that level of exploit requires offensive AI that thinks in chains.

* * *

Novee runs continuous adversarial validation against your live systems on every change, probing them the way a real attacker would, and proving exploitability before a CVE catches up. [Book a demo](https://novee.security/demo/) to see what’s already exposed.

Again, all thanks to pretalx team and creator Tobias Kunze for their extraordinarily rapid and cooperative disclosure. You can read the **pretalx** security advisory [here](https://github.com/pretalx/pretalx/security/advisories/GHSA-cjcx-jfp2-f7m2).

