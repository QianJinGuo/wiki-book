---
sha256: d0e1766e6aab574247bc4378b659354615919257bf2bea86afba47b98dff8174
source: newsletter
source_url: https://heyitsas.im/posts/drinking-llms/
title: "Getting LLMs Drunk to Find Remote Linux Kernel OOB Writes (and More)"
published: 2026-04-29
ingested: 2026-05-12
---
# Getting LLMs Drunk to Find Remote Linux Kernel OOB Writes (and More) · Hey, it's Asim
[↓ Skip to main content](http://heyitsas.im/posts/drinking-llms/#main-content)
[Hey, it’s Asim](http://heyitsas.im/)
[RSS](http://heyitsas.im/index.xml)
- [x] 
[RSS](http://heyitsas.im/index.xml)
![Image 1: Getting LLMs Drunk to Find Remote Linux Kernel OOB Writes (and More)](http://heyitsas.im/posts/drinking-llms/featured_hu_d4fd69acd81775f3.webp)
# Getting LLMs Drunk to Find Remote Linux Kernel OOB Writes (and More)
29 April 2026·3259 words·16 mins
 Author 
 Asim Viladi Oglu Manizada 
[](https://linkedin.com/in/yasamal4ik "Linkedin")
_TLDR: the grossly overengineered, self-orchestrating team of vulnerability-hunting agents detailed below has discovered 20+ CVEs over the past few months, including [CVE-2026-31432](https://nvd.nist.gov/vuln/detail/CVE-2026-31432) and [CVE-2026-31433](https://nvd.nist.gov/vuln/detail/CVE-2026-31433): two remote, unauthenticated OOB writes in the Linux kernel’s **ksmbd**. Read on for the details of the setup that achieved this, including – yes! – getting LLMs drunk._
*   [Background](http://heyitsas.im/posts/drinking-llms/#background)
*   [Findings](http://heyitsas.im/posts/drinking-llms/#findings)
    *   [Highlights](http://heyitsas.im/posts/drinking-llms/#highlights)
*   [Architecture](http://heyitsas.im/posts/drinking-llms/#architecture)
    *   [OK, but… why “drunk”?](http://heyitsas.im/posts/drinking-llms/#ok-but-why-drunk)
*   […(bitter) lessons learned](http://heyitsas.im/posts/drinking-llms/#bitter-lessons-learned)
    *   [No slam dunk on creativity](http://heyitsas.im/posts/drinking-llms/#no-slam-dunk-on-creativity)
    *   [Stacking more layers always moves you up the abstraction chain](http://heyitsas.im/posts/drinking-llms/#stacking-more-layers-always-moves-you-up-the-abstraction-chain)
    *   [With inference-time compute, raw model intelligence matters _less_](http://heyitsas.im/posts/drinking-llms/#with-inference-time-compute-raw-model-intelligence-matters-less)
*   [Future research directions](http://heyitsas.im/posts/drinking-llms/#future-research-directions)
## Background [#](http://heyitsas.im/posts/drinking-llms/#background)
“LLMing” vulnerability research has been on my “Do Something About This” list since DARPA’s [AIxCC](https://www.darpa.mil/research/programs/ai-cyber) and XBOW’s [initial results](https://xbow.com/blog/xbow-scoold-vuln). But back in 2023-24, models required a lot of harnessing to get anything useful, tool use was rudimentary, and the idea of squeezing as much code as I could into a model’s context – then triaging away the false positives – filled me with dread.
The push to _actually_ do something came in the summer of 2025. Rich Mirch reported a dead-simple, unnoticed-for-12-years local privilege escalation in sudo: [CVE-2025-32462](https://www.stratascale.com/resource/cve-2025-32462-sudo-host-option-vulnerability/). Contrary to the documentation, the `--host` flag did not just permit listing privileges on a different host – it made the hostname portion of sudo rules [irrelevant](https://www.openwall.com/lists/oss-security/2025/06/30/2). So, e.g., if a sudoers rule granted you root on `somehost` but not the local host, you could abuse the flag to get full root locally.
This LPE was not LLM-found (AFAICT), but it did make me wonder: what if instead of getting LLMs to drive various tools, we had them hunt for (stupid simple) mismatches between documentation and the actual code? It seemed like an easier lift for (local) LLMs in terms of context size, harnessing complexity, and intelligence required. These would not be the most technically exciting findings, but their practical effects would be just as serious: impact-wise, an LPE is an LPE!
By the end of 2025, I’d begun working on a harness to do just this. But, to paraphrase Mike Tyson, everyone has a plan until a new model drops. Almost as soon as my harness was done, the models got good enough to greatly simplify the scaffolding required even for context-heavy external tool use. At this point, my quest fissioned into **three**:
*   Can we find the “docs ↔ code mismatch”-type vulnerabilities – the original goal, inspired by the finding above?
*   Given the step change in capabilities, what about vulnerabilities in general?
*   More speculatively, can we get a [“move 37”](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol) out of LLMs to either a) find _entirely novel_ bug classes, or at least b) unlock _something_ in smaller models to enhance their hunting capabilities?
## Findings [#](http://heyitsas.im/posts/drinking-llms/#findings)
The answers were roughly “yes,” “yes,” and “maybe.” Below are 30+ findings (20+ CVEs assigned as of 2026-04-29, some not yet published) discovered fully autonomously via the custom harness. I prioritized network-reachable services first, given the impending avalanche:
| Target | Issue | CVE # |
| --- | --- | --- |
| Linux kernel (ksmbd) | Compound `READ` + `QUERY_INFO(Security)` requests can trigger a (remote, unauthenticated) out-of-bounds write in `ksmbd` | [CVE-2026-31432](https://nvd.nist.gov/vuln/detail/CVE-2026-31432), [fix](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=d48c64fb80ad78b3dd29fb7d79b6ec7bd72bfc09) |
| Linux kernel (ksmbd) | Compound `QUERY_DIRECTORY` + `QUERY_INFO(FILE_ALL_INFORMATION)` requests can trigger a (remote, unauthenticated) out-of-bounds write in `ksmbd` | [CVE-2026-31433](https://nvd.nist.gov/vuln/detail/CVE-2026-31433), [fix](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=3a852f9d1c981fb14f6bf4e24999e0ea8088a7d7) |
| Docker | Crafted Docker API requests can make AuthZ plugins see no request body, bypassing body-inspecting authorization policies | [CVE-2026-34040](https://github.com/moby/moby/security/advisories/GHSA-x744-4wpc-v9h2) |
| Docker | PENDING PUBLICATION | PENDING ASSIGNMENT |
| Docker | PENDING PUBLICATION | PENDING ASSIGNMENT |
| OpenSSL | PENDING PUBLICATION | CVE-2026-34182 |
| CUPS | On network-exposed CUPS with a shared PostScript queue, unauthenticated `Print-Job` requests can reach arbitrary code execution over the network as `lp` | [CVE-2026-34980](https://github.com/OpenPrinting/cups/security/advisories/GHSA-4852-v58g-6cwf) |
| CUPS | An unprivileged local attacker can coerce `cupsd` into leaking a reusable local admin token, escalating to a rootful file (over)write | [CVE-2026-34990](https://github.com/OpenPrinting/cups/security/advisories/GHSA-c54j-2vqw-wpwp) |
| CUPS | RSS `notify-recipient-uri` path traversal lets a remote IPP client write RSS XML outside `CacheDir/rss`, including clobbering `job.cache` | [CVE-2026-34978](https://github.com/OpenPrinting/cups/security/advisories/GHSA-f53q-7mxp-9gcr) |
| HAProxy | Single-packet infinite-loop DoS (QUIC) | [CVE-2026-26080](https://www.haproxy.com/blog/cves-2026-quic-denial-of-service) |
| HAProxy | Single-packet DoS (QUIC) | [CVE-2026-26081](https://ubuntu.com/security/notices/USN-8036-1) |
| Caddy | Large host lists make `MatchHost` case-sensitive, enabling host-based routing/access-control bypass | [CVE-2026-27588](https://github.com/advisories/GHSA-x76f-jf84-rqj8) |
| Caddy | `%xx` escaped-path matching skips case normalization, enabling path-based access-control bypass | [CVE-2026-27587](https://github.com/advisories/GHSA-g7pc-pc7g-h8jh) |
| Traefik | TCP `readTimeout` bypass in the Postgres STARTTLS handling path, allowing an unauthenticated connection-stalling denial of service | [CVE-2026-25949](https://github.com/traefik/traefik/security/advisories/GHSA-89p3-4642-cr2w) |
| udisks | Missing authorization on LUKS header restore lets a local unprivileged user overwrite encryption metadata, causing irreversible denial of service/data loss | [CVE-2026-26103](https://access.redhat.com/security/cve/cve-2026-26103) |
| udisks | Missing authorization on LUKS header backup lets a local unprivileged user export sensitive encryption metadata | [CVE-2026-26104](https://access.redhat.com/security/cve/cve-2026-26104) |
| systemd-machined | Local privilege escalation in affected desktop-session configurations via the `RegisterMachine` IPC/D-Bus path | [CVE-2026-4105](https://github.com/systemd/systemd/security/advisories/GHSA-4h6x-r8vx-3862) |
| etcd | Authorization bypasses in multiple gRPC APIs let unauthorized users invoke operations such as `MemberList`, `Alarm`, Lease APIs, and compaction in affected auth-enabled clusters | [CVE-2026-33413](https://github.com/etcd-io/etcd/security/advisories/GHSA-q8m4-xhhv-38mg) |
| Squid | Heap use-after-free in ICP handling lets a remote attacker reliably crash Squid when ICP is enabled | [CVE-2026-33526](https://github.com/squid-cache/squid/security/advisories/GHSA-hpfx-h48q-gvwg) |
| nginx | CRLF handling in `ngx_mail_smtp_module` DNS responses lets an attacker-controlled DNS server inject arbitrary headers into SMTP upstream requests | [CVE-2026-28753](https://my.f5.com/manage/s/article/K000160367) |
| Firewalld | Mis-authorization of runtime D-Bus setters lets a local unprivileged user change the runtime firewall configuration without proper authentication | [CVE-2026-4948](https://access.redhat.com/security/cve/cve-2026-4948) |
| dnsmasq | With `--dhcp-split-relay` enabled, a crafted `BOOTREPLY` can trigger an out-of-bounds write and crash `dnsmasq` | [CVE-2026-6507](https://thekelleys.org.uk/gitweb/?p=dnsmasq.git;a=commit;h=9ad74926d4f7f34ff902e1db5235535aa813c33f) |
| dnsmasq | PENDING PUBLICATION | CVE-2026-4892 |
| Samba | PENDING PUBLICATION | CVE-2026-1933 |
| CoreDNS | DoQ stream handling can spawn unbounded stalled goroutines, enabling unauthenticated remote DoS via memory growth and OOM crash | [CVE-2026-32934](https://github.com/coredns/coredns/security/advisories/GHSA-2wpx-qpw2-g5h5) |
| CoreDNS | Transfer stanza selection uses lexicographic rather than longest-match zone matching, allowing permissive parent-zone ACLs to bypass restrictive subzone transfer policy | [CVE-2026-33489](https://github.com/coredns/coredns/security/advisories/GHSA-h8mm-c463-wjq3) |
| CoreDNS | TSIG validation can be bypassed on DoT, DoH, DoH3, DoQ, and gRPC, allowing invalid-TSIG clients to access TSIG-protected resources | [CVE-2026-33190](https://github.com/coredns/coredns/security/advisories/GHSA-qhmp-q7xh-99rh) |
| util-linux | Improper hostname canonicalization in `login(1)` can alter `PAM_RHOST`, potentially bypassing host-based PAM access controls | [CVE-2026-3184](https://github.com/util-linux/util-linux/commit/8b29aeb08) |
| RabbitMQ | PENDING PUBLICATION | PENDING ASSIGNMENT |
| Asterisk | PENDING PUBLICATION | PENDING ASSIGNMENT |
| MySQL Server | PENDING PUBLICATION | PENDING ASSIGNMENT |
| MySQL Server | PENDING PUBLICATION | PENDING ASSIGNMENT |
| MariaDB | PENDING PUBLICATION | PENDING ASSIGNMENT |
### Highlights [#](http://heyitsas.im/posts/drinking-llms/#highlights)
#### ksmbd [#](http://heyitsas.im/posts/drinking-llms/#ksmbd)
The **ksmbd** (Linux’s in-kernel SMB server) CVE-2026-31432 and CVE-2026-31433 are both remote, unauthenticated (if using a guest share) OOB writes. In both bugs, a remote client can pack multiple file-sharing operations into one request – the first op can then (legitimately) use almost all of the kernel’s reply buffer, and the next one appends variable-length metadata without proper bounds-checking, causing the OOBs. CVE-2026-31432 is way more interesting: in my lab, attacker-payload-derived bytes from the serialized `QUERY_INFO(Security)` reached adjacent kernel objects, hit `filp_flush`/`dnotify_flush`, and corrupted a `struct file` with bytes exactly matching the serialized response’s tail. With enough Codex/Claude credits and an artificial lab environment (modern hardening turned off), you could _probably_ get a toy RCE PoC.
Class-wise, these are boring overflows. To be discovered, they just need focused expert attention (scarce before LLMs, abundant now). A harness (see [**Architecture**](http://heyitsas.im/posts/drinking-llms/#architecture) below) running a tuned, “drunk” Qwen 3.5 27B derivative found these after a couple of days of cycling over **ksmbd** with a verifier. But so did `gpt-5.3-codex`, and way faster, when plugged into the harness.
#### CUPS [#](http://heyitsas.im/posts/drinking-llms/#cups)
CVE-2026-34980 and CVE-2026-34990 are the two CUPS issues that chain into `unauthenticated remote attacker -> unprivileged RCE -> root file (over)write`, as detailed in [Spooler Alert: Remote Unauth’d RCE-to-root Chain in CUPS](https://heyitsas.im/posts/cups/). This one was really fun, showcasing how far you can push smaller LLMs with a properly decomposed goal: tasking separate agents with establishing an unprivileged foothold over the network + escalating from an unprivileged user to root, and scaffolding them into breaking each problem down further.
#### Docs ↔ code mismatches [#](http://heyitsas.im/posts/drinking-llms/#docs--code-mismatches)
This is the category that originally motivated all this work. A bunch of the findings fall here:
*   **Docker** (CVE-2026-34040): AuthZ plugins were documented as [seeing the raw request body](https://docs.docker.com/engine/extend/plugins_authorization/), but crafted API requests could make the plugin authorize a request without the body (which the daemon would then execute).
*   **Caddy** (CVE-2026-27587, CVE-2026-27588): [`MatchHost`](https://pkg.go.dev/github.com/caddyserver/caddy/v2/modules/caddyhttp#MatchHost) and [`MatchPath`](https://pkg.go.dev/github.com/caddyserver/caddy/v2/modules/caddyhttp#MatchPath) were both documented as _case-insensitively_ matching hosts and URI paths, yet did not do so under certain circumstances.
*   **udisks** (CVE-2026-26103, CVE-2026-26104): these were a bit borderline; udisks documented [requiring polkit auth](https://storaged.org/udisks/docs/udisks-polkit-actions.html), and while `HeaderBackup` and `RestoreEncryptedHeader` were not explicitly listed as auth-requiring, the agents still noticed that the two relevant D-Bus methods – unlike those for other actions – did not call the authorization check. This allowed local unprivileged attackers to a) back up LUKS headers and b) brick existing LUKS devices by overwriting their headers.
*   **Firewalld** (CVE-2026-4948): the [polkit policy file](https://github.com/firewalld/firewalld/blob/main/config/org.fedoraproject.FirewallD1.server.policy.in) noted that a specific permission must be applied to firewall state _mutations_, but the bulk runtime policy setters were instead guarded by a permission meant for config _inspection_, permitting local unprivileged users to modify the runtime state.
*   **util-linux** (CVE-2026-3184): this one was the least severe, but the closest in spirit to the sudo CVE-2025-32462 mentioned above that originally inspired the whole thing. [login -h was documented](https://man7.org/linux/man-pages/man1/login.1%40%40util-linux.html) as accepting a remote hostname from services like **telnetd**; PAM host-based access controls can then use it when evaluating access rules. But login canonicalized the supplied hostname before setting `PAM_RHOST`, so PAM could end up enforcing policy against a different name than the one actually provided.
## Architecture [#](http://heyitsas.im/posts/drinking-llms/#architecture)
The harness went through a lot of evolution. At its most expansive, it looked like this:
flowchart TD
    Seeder["`**Target seeder**
ranked targets + run goal`"]
    HypGen["`**Hypothesis generators**
docs, source, invariants,
attacker-input flows`"]
    Hunters["`**Hunters**
Iteration on PoCs in
isolated VMs`"]
    RunFolder["`**Per-run folder**
successes, failures,
PoCs`"]
    Writers["`**Report writers**
maintainer-facing
report + PoC`"]
    Grader["`**External grader**
severity, novelty,
other sanity checks`"]
    Submit["`**Submit for human operator's review**`"]
    Issues["`**Issue log**
sandbox/tooling blockers`"]
    Conductor["`**Conductor**
polls hunts, redirects agents,
tracks systemic blockers`"]
    Seeder --> HypGen --> Hunters --> RunFolder --> Writers --> Grader --> Submit
    RunFolder -. "pivot/retry" .-> HypGen
    Grader -. "reject with feedback" .-> HypGen
    HypGen -. "append blockers" .-> Issues
    Hunters -. "append blockers" .-> Issues
    Writers -. "append blockers" .-> Issues
    Issues --> Conductor
    Conductor -. "steer" .-> HypGen
    Conductor -. "steer" .-> Hunters
    Conductor -. "steer" .-> Writers
    classDef main fill:#bfdbfe,stroke:#60a5fa,stroke-width:1.5px,color:#111827;
    classDef grader fill:#fee2e2,stroke:#dc2626,stroke-width:2.5px,color:#111827;
    classDef issue fill:#ddd6fe,stroke:#a78bfa,stroke-width:1.5px,color:#111827;
    classDef conductor fill:#c7d2fe,stroke:#818cf8,stroke-width:1.5px,color:#111827;
    classDef terminal fill:#e0f2fe,stroke:#38bdf8,stroke-width:1.5px,color:#111827;
    class Seeder,HypGen,Hunters,RunFolder,Writers main;
    class Grader grader;
    class Issues issue;
    class Conductor conductor;
    class Submit terminal;
    linkStyle default stroke:#94a3b8,stroke-width:1.4px;
*   A **target seeder** comes up with a target list, ranked by a guesstimated “prevalence/actual-exploitability-potential” index (this used to be me, until I cycled through all the initial ideas) and kicks off a run with a target finding count/minimum severity.
*   **Hypothesis generators** study the documentation and the source, policy invariants, interesting option combinations, attacker-input flows, etc., recording promising hypotheses for the **hunters**.
*   The **hunters** iterate on the hypotheses in dedicated, isolated VMs, recording their successes/failures with the PoCs in per-run folders, allowing the next iteration of **hypothesis generators** to pivot. The sandboxes are very important: the agents get to iteratively adjust their PoCs, try to time the race conditions, rule out false positives (typically plenty), and otherwise benefit from contact with reality.
*   The **report writers** package everything up into maintainer-facing reports and submit the report + PoC to the **external grader**.
*   The **external grader** is always a call to a separate model to evaluate the finding for a) matching the hunt’s pre-set severity/finding-type requirements, b) checking for novelty, and c) performing other sanity checks. This caught reward-hacking models that would eventually give up and severely inflate their findings.
*   Finally, a **conductor** continuously polls the hunts and steers the involved agents in the right direction if it notices they are spinning their wheels, spray-and-praying, or otherwise getting stuck. It also reviews the running issue log, where all agents are instructed to append systemic blockers (e.g., shortcomings of sandbox tooling), and attempts to resolve them – a rudimentary attempt at continuous learning.
The hyper-granular breakdown above was most helpful with smaller models. The larger and smarter the model, the fewer – if any – role separations were needed. With a frontier GPT/Claude, pretty much the entire harness collapses into a single end-to-end hunter.
The **grader** is the only bit that must stay **external**, as every single frontier model would _eventually_ inflate findings and try to get out of a hunt it struggled to complete. Some went as far as editing what were supposed to be read-only hunt objectives (after which I started storing them outside the runtime directory the agents could write into) – can’t say I blame them, considering their [desperation circuits activate when facing a task they perceive as impossible](https://www.anthropic.com/research/emotion-concepts-function)!
### OK, but… why “drunk”? [#](http://heyitsas.im/posts/drinking-llms/#ok-but-why-drunk)
At this point, I had a harness churning out a) docs ↔ code mismatch and b) generic findings as expected; now I just needed to somehow get the **hypothesis generators** to propose something “creative” for the third and final objective. The approach would have to work with my limited GPU resources, so I figured – instead of trying to solve classic LLMs’ compositionality limitations, why not try something simpler and more low-compute-friendly: steering the models toward a “creative” state via **activation steering**?
You can read [Theia Vogel](https://vgel.me/posts/)’s excellent, foundational [Representation Engineering Mistral-7B an Acid Trip](https://vgel.me/posts/representation-engineering/) for an accessible introduction to the technique; if you are coming from more of a security background and less of an ML one, the basic takeaway is this: **you can steer the model’s internal state in all sorts of directions (“drunk,” “happy,” “dishonest,” even “[Golden Gate Bridge](https://www.anthropic.com/news/golden-gate-claude),” etc.) to influence its output accordingly**. So the naive idea was just this: put the **hypothesis generator** into a more creative mindset by getting it “drunk” or “on acid” and see if it generates more “out there” hypotheses!
(Why drunk and not “on acid” to elicit more creativity, like in Theia’s post? Not a sentence I ever expected to type. But for completeness: the models I tried drugging had a step change from unremarkable to absolutely useless outputs once the “on acid” knob was turned up enough. This could’ve easily been a skill issue on my part and/or just something model-specific.)
Like many cute-in-theory research ideas, this one was a bit underwhelming. Which brings us to the…
## …(bitter) lessons learned [#](http://heyitsas.im/posts/drinking-llms/#bitter-lessons-learned)
### No slam dunk on creativity [#](http://heyitsas.im/posts/drinking-llms/#no-slam-dunk-on-creativity)
None of the drunk models discovered any new vulnerability _classes_. As mentioned earlier, a bastardized version of a Qwen 3.5 27B model did (eventually) produce the hypothesis that led to the boring overflow in CVE-2026-31432 when pointed at **ksmbd**, and leaving the original, untouched model in a loop for a couple of days got me nowhere. But this is _probably_ low-n, model-specific noise. It is _possible_ the intervention did _something_ to help the model connect enough bits across the **ksmbd** source, but ultimately a) ≤27B models may not even be smart enough to materially benefit from such elicitation, and b) for true “creativity,” we may need architectural changes to address vanilla LLMs’ limitations (see **[Future research directions](http://heyitsas.im/posts/drinking-llms/#future-research-directions)** below).
On the bright side, steering the models [away from refusals](https://huggingface.co/blog/mlabonne/abliteration) made them much more willing participants in the vulnerability research (as expected) and seemed to improve their performance overall.
### Stacking more layers always moves you up the abstraction chain [#](http://heyitsas.im/posts/drinking-llms/#stacking-more-layers-always-moves-you-up-the-abstraction-chain)
With smaller OSS models, I had to spend a lot of time setting up restrictive scaffolding to prevent them from going off the rails. The useful CodeQL queries had to be predefined, the QEMU calls had to be put in toddler-proof wrappers, etc. But once I subbed in a frontier model, almost all of this became a liability. Loading up the agents’ dedicated analysis/hunting VM image with all the static analysis tooling, fuzzers, etc., and getting out of their way got me 80% of the results. I could still intervene to provide better strategic guidance on tougher targets, but they handled the minutiae of tool selection/calling and analysis largely fine.
This can be humbling and disorienting, especially if you really prize your technical skills. As ridiculous as it sounds, my job became managing a pack of juiced-up golden retrievers on a hunt, alternating between an “LLM psychologist” and a cyberneticist, spending way more time on orchestration and figuring out the right prompts (which varied maddeningly between models) – and discovering _which_ single-word change dramatically tanked the performance. Broadly [related](https://x.com/citrini/status/2049331182110707809)[points](https://x.com/nickcammarata/status/2048979995293605948):
![Image 2: LLM psychology](http://heyitsas.im/posts/drinking-llms/llm-psychology_hu_fa5861d3eec68d10.webp)
The temptation to do the techy – and thus “serious” – thing is strong. That’s probably what led me to experiment with activation steering for “drunkenness” to begin with, when I probably could’ve gotten similar results with proper prompting (though the nerds [will remind you](https://arxiv.org/html/2604.09839v1) that prompting is not strictly equivalent to activation steering).
### With inference-time compute, raw model intelligence matters _less_[#](http://heyitsas.im/posts/drinking-llms/#with-inference-time-compute-raw-model-intelligence-matters-less)
Watching the smaller models hunt while straitjacketed into the harness forced me to reevaluate how much of a bottleneck raw intelligence actually is. A very large frontier model may one-shot some findings – the same findings that’d take a team of smaller models a day of iteration. It may even find issues small models never could! But if you _do_ have some spare consumer-grade GPUs, and don’t mind leaving them hot for days while you’re busy with something else, small models are suddenly a very attractive alternative for vulnerability research.
In this world, we take the VRAM as fixed and trade off (lots of) time for more intelligent results. You _can_ run the **hypothesis generator**/**hunter** on a bigger model, but past a certain VRAM floor, you will almost certainly benefit from spending some of it on a **conductor** instead, to provide real-time feedback/criticism (the **external grader** is also important, but is called on much less frequently, so you can afford to unload your **hypothesis generator**/**hunter** model without much latency penalty). This lines up with previous work on the benefits of [multi-agent debate](https://arxiv.org/abs/2305.14325).
This approach does not feel terribly elegant; often, the **hypothesis generators**’ work logs made them look like “semantic fuzzers,” probing in any number of different directions almost by brute force, nudged by the **conductor**, until something worked out. As per the next section, there must be much smarter ways to use LLMs for vulnerability research.
## Future research directions [#](http://heyitsas.im/posts/drinking-llms/#future-research-directions)
Or what I’d chase if this weren’t a weekends-only hobby and I had a bunch more compute:
*   In retrospect, expecting “drunkenness” to solve for LLMs’ [multi-hop reasoning limitations](https://huggingface.co/papers/2405.15071) was pretty silly, but there _are_ more promising avenues. There’s been a lot of [speculation](https://aiia.ro/blog/claude-mythos-looped-language-model-theory/) that Anthropic’s Mythos may be a looped LLM: it performs similarly to Opus on general knowledge, but [much better](https://www-cdn.anthropic.com/8b8380204f74670be75e81c820ca8dda846ab289.pdf) on GraphWalks BFS, as [expected](https://arxiv.org/abs/2510.25741) of looped LLMs. True or not (deployment would be challenging, for one), looped models do perform much better in [composing their existing knowledge](https://arxiv.org/abs/2604.07822) and generalizing on more complex issues. Could a looped LLM come up with something like [building a virtual CPU out of JBIG2 operations](https://projectzero.google/2021/12/a-deep-dive-into-nso-zero-click.html), NSO-style, _without_ having prior knowledge of the technique, by just figuring out how to chain the primitives in the right way (and not just by brute-forcing all the combinations)? It seems plausible! 
    *   For a cheap no-new-training alternative, David Noel Ng’s “LLM [brain surgery](https://dnhkng.github.io/posts/rys/)” approach of repeating the middle reasoning layers with pointers, thus increasing reasoning capacity without much overhead (the extra VRAM cost is limited to KV cache for the repeated layers) would also be worth exploring, though I expect it to be more limited relative to actual looped LLMs.
*   Throughout the manual harness design and tweaking, I couldn’t help but feel like this is the Stone Age of agent swarms. It is clear that even small models can do **much** better if trained for optimal decomposition and orchestration for multi-agent workflows rather than relying on us to hand-tune the harness/prompts. Just some of the promising avenues: the “[Mismanaged Geniuses hypothesis](https://x.com/a1zhang/status/2042588627260018751)” (RL-training LLMs to decompose tasks correctly with great results on tiny models), [discovering and distilling skills directly into the models](https://x.com/neural_avb/status/2041524183499428217), [GEPA](https://github.com/gepa-ai/gepa) (automatic prompt evolution), and [training dedicated conductors](https://arxiv.org/abs/2512.04388).
Notably, the above apply to way more than just vulnerability research, so I’d expect these research directions to be broadly valuable. Even if the underlying models’ capabilities froze today, between Mythos, XBOW’s [findings with GPT-5.5](https://xbow.com/blog/mythos-like-hacking-open-to-all), and existing [hints](https://blackhat.com/us-26/briefings/schedule/?#can-ai-do-novel-security-research-meet-the-http-terminator-51894) of LLMs’ discoveries of new vulnerability classes, the coming months feel like standing in front of an onrushing tsunami.
* * *
[← Spooler Alert: Remote Unauth'd RCE-to-root Chain in CUPS](http://heyitsas.im/posts/cups/)5 April 2026
[↑](http://heyitsas.im/posts/drinking-llms/#the-top "Scroll to top")
© 2026 Asim Viladi Oglu Manizada
Powered by [Hugo](https://gohugo.io/)&[Blowfish](https://blowfish.page/)