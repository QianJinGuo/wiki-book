---
source: rss
source_url: https://netflixtechblog.com/the-human-infrastructure-how-netflix-built-the-operations-layer-behind-live-at-scale-33e2a311c597?source=rss----2615bd06b42e---4
ingested: 2026-06-07
feed_name: Netflix Tech Blog
source_published: 2026-04-17
sha256: d8219329328ef178a91b859d5ea5b06ea6d4b481c701316764e86da6ae1f1f23
---

# The Human Infrastructure: How Netflix Built the Operations Layer Behind Live at Scale

By: [Brett Axler](<https://www.linkedin.com/in/brett-axler-11577142/>), [Casper Choffat](<https://www.linkedin.com/in/casper-choffat-005833b/>), and [Alo Lowry](<https://www.linkedin.com/in/alexlowry355/>)

In the three years since our first Live show, [_Chris Rock: Selective Outrage_](<https://www.netflix.com/title/80167499>), we have witnessed an incredible expansion of our live content slate and the live operations that support it. From modest beginnings of streaming just one show per month, we are now capable of streaming over nine shows in a single day, reaching tens of millions of concurrent members. This post pulls back the curtain on the Live Operations teams that enable this rapid scale.

### Humble Beginnings

In March 2023, the engineers who built Netflix’s first live streaming pipeline also operated it. There was no dedicated operations team or formal command center. All of our incident response playbooks were written for SVOD, and SLAs were not designed for the speed of live. For the first live shows on the platform, the engineers who designed what is described in [earlier parts of this series](<https://netflixtechblog.com/behind-the-streams-live-at-netflix-part-1-d23f917c2f40>) monitored dashboards on laptops, coordinated over Slack, and troubleshot in real time while millions of members watched.

The physical setup matched the operational workflows: improvised. Temporary control rooms were put together in conference rooms. For larger events, Netflix rented third-party broadcast facilities, hardware control panels, multiviewers, and communication panels — the kind of infrastructure that established broadcast networks had built over decades. Every show was a team effort. Engineers and leadership at all levels were involved in every event. Each live show, regardless of size, was a massive effort to launch.

Netflix’s Early Live Operations

Last month, in March 2026, Netflix streamed the World Baseball Classic live to members in Japan. 47 matches over two weeks, with peak concurrent viewership exceeding 17.9 million for a single game, operations running 24/7 from permanent facilities in Los Gatos and Los Angeles, with international coverage extending to Tokyo. In March alone, Netflix launched approximately 70 live events. That is three events shy of the total number Netflix streamed live in all of 2024. The technical systems that make this possible have been covered in detail across this series. What hasn’t been told is the operational story: the people, procedures, and facilities Netflix built to run those systems in real time, under pressure, with no ability to pause or roll back.

### The Architecture of Live Operations

**The Architecture of Live Operations: Evolving the Broadcast Operations Center**

When a technology company transitions into live broadcasting, it faces a unique challenge: blending traditional broadcast television practices with massive-scale live-streaming engineering. At the heart of this intersection is the **Broadcast Operations Center (BOC)**.

The Transmission Operations Center in Los Angeles

The BOC serves as the critical “cockpit” for live events. It is the physical command center where a fully produced video feed is received directly from a stadium or venue and then handed off to the live streaming infrastructure. Everything from signal ingest, inspection, and conditioning to closed-captioning, graphics insertion, and ad management happens within these walls. By utilizing a hub-and-spoke model with highly redundant architectures, such as dual internet circuits and SMPTE 2022–7 seamless switching technologies, the BOC replaces direct, vulnerable paths from the venue to the live streaming pipeline, making each live event highly repeatable and far less dependent on the quirks of individual event locations.

**Securing the Signal: Reliability from the Venue** Before the BOC can work its magic, we have to guarantee the video and audio feeds actually survive the journey from the production site to our facility. To ensure absolute reliability from the venue, Netflix enforces strict specifications for live signal contribution.

For any show-critical feed, meaning the primary feed our members will watch live, we require three completely discrete transmission paths. We utilize a strict hierarchy of approved transmission methods, prioritizing dedicated video fiber and single-feed satellite links, followed by dedicated enterprise-grade internet and robust SRT contribution systems.

We don’t just rely on redundant transport lines; we require full hardware redundancy out of the production truck itself. This includes using separate router line cards and discrete transmission hardware to prevent any single point of failure. Furthermore, every single piece of transmission hardware at the venue must be powered by two discrete power sources, protected by uninterruptible power supply (UPS) batteries, and surge-conditioned.

Finally, before we ever go live to millions of viewers, our operators execute exhaustive “FACS/FAX” (facilities checks) testing during rehearsals and before every show. This involves running specialized Audio/Video sync tests, latency tests, and quality tests to guarantee perfect audio and video synchronization, validating closed captions, and touring the backup switcher inputs.

**Building the Human Infrastructure:** Building the human operational model to run a facility like the BOC didn’t happen overnight. For a platform scaling from its very first live comedy special to streaming over 400 global events a year, the operational strategy had to undergo a massive, multi-year evolution.

**Phase 1: The “All-Hands” Engineering Era.** In the earliest days of live streaming, there was no dedicated operations team or formal broadcast operations center. The software engineers who wrote the code and built the live-streaming infrastructure were the same people manually operating the events on launch night. Every show was an “all-hands-on-deck” scenario. While this raw, startup-style approach worked for initial milestones, having core developers manually set up and tear down software configurations for every single broadcast was fundamentally incapable of scaling.

**Phase 2: The Shift to Specialized Engineering (SOEs and BOEs).** To separate event execution from core software development, the operational model matured to introduce specialized engineering teams. First, the **Streaming Operations Engineering (SOE)** team was established. These are highly skilled streaming engineers whose sole focus is to configure the full event on the live pipeline and support it during the broadcast. By having SOEs act as the first line of escalation, the core software developers were freed up to focus on building new live-streaming pipeline features.

However, as the physical broadcast facilities grew, it became clear that supporting the streaming pipeline wasn’t enough; the physical broadcast hardware and facility workflows needed dedicated oversight too. To solve this, **Broadcast Operations Engineers (BOEs)** were introduced to work alongside the SOEs. The BOE acts as the primary escalation point for all physical broadcast facility and hardware issues, overseeing the operation of all shows during a given shift.

**Phase 3: The “Co-Pilot” Control Room Model.** With specialized engineers in place to handle the deep technical infrastructure, the day-to-day operation of the actual video and audio feeds was handed over to dedicated operators. Initially, the Broadcast Control Rooms were structured much like an airplane cockpit.

This approach utilized a **“first and second captain” workflow** , pairing two Broadcast Control Operators (BCOs) together to run a single event, functioning exactly like a pilot and co-pilot. This collaborative model allowed for intense focus and high-quality execution, making it the ideal setup for running just one or two live events per day. However, as the ambition grew to stream up to 10 concurrent events a day for massive global tournaments, a 1:1 scale of pairing operators simply required too much space and manpower. A new model had to be adopted.

**Phase 4: The Transmission Operations Center (TOC) Fleet Model.** To manage high-density event days and continuous tournament coverage, the workflow was completely reimagined with the launch of the **Transmission Operations Center (TOC) model**. Rather than treating every live broadcast as an isolated launch in its own room, the TOC treats live events like a fleet. It centralizes operations and distinctly separates the traditional broadcast functions from the streaming functions to maximize human efficiency.

The TOC model divides the labor across three highly specialized, tiered roles:

  * **Transmission Control Operator (TCO):** The TCO is responsible for managing all inbound signals arriving from the event venues, such as fiber optic, SRT, and satellite feeds. They ensure these incoming feeds meet strict quality, latency, and operational thresholds. Thanks to centralized dashboarding, a single TCO can manage up to **five events concurrently**.
  * **Streaming Control Operator (SCO):** While the TCO handles what comes _in_ , the SCO manages what goes _out_. They oversee all outbound feeds, including the streams heading to the live streaming pipeline and any syndication feeds sent to third parties for commercial distribution. Like the TCOs, SCOs can manage up to **five events concurrently**.
  * **Broadcast Control Operator (BCO):** With the inbound and outbound transmission mechanics handled by the broader TOC, the BCO is able to focus entirely on the creative and qualitative execution of the event. Operating on a **strict 1:1 ratio** (one operator per event), the BCO seamlessly switches between backup inbound feeds if an issue arises, ensures audio and video remain in perfect synchronization, and performs rigorous quality control. They also monitor critical metadata, such as closed captions and digital ad-insertion messages (SCTE), right before the final polished feed is handed into the live streaming pipeline.



**The Big Bet Exception.** While the fleet-style TOC model enables immense concurrency for daily programming, the most critical, high-visibility events, like major holiday football games, utilize a specialized **Big Bet Model**. For these flagship broadcasts, an entire Broadcast Operations Center is dedicated exclusively to a single event. This hyper-focused environment strips away the multi-event ratios, providing operators with advanced instrumentation and dedicated facility engineers to ensure the absolute highest level of reliability for events where failure is simply not an option.

Operational Workflow at a Glance (Courtesy of Melissa “Mouse” Merencillo)

### The Live Command Center (LCC)

The Live Command Center (LCC) is not an MCR (Master Control Room). Nor is it a traditional Network Operations Center (NOC). The LCC holds the end-to-end view of quality, health metrics, and reliability for every live stream — from signal ingest at the production venue through cloud encoding, CDN delivery, and playback on member devices — and coordinates the human response when any part of that chain breaks.

What makes this hard is the data and speed requirements. Standard monitoring tools incur propagation delays of minutes. However, during a live stream, a signal degradation that goes undetected for three minutes can affect millions of members before any mitigation begins. The LCC runs a purpose-built observability stack, the Live Control Center, that aggregates telemetry from across the entire pipeline in near real time: concurrent viewer counts, start failure rates, rebuffer ratios, CDN health, encoder status, and signal path health from the contribution feed forward.

Live Control Center (Courtesy of Chris Carey)

During live events, the system ingests up to 38 million events per second. The LCC’s job is to make that volume of data meaningful and actionable for the small team of operators watching it live.

Two roles staff the LCC leading up to and during live events. LCC Operations Leads are the shift supervisors and incident commanders. They triage anomalies, make escalation decisions, and own the incident response process from detection through resolution.

Live Technical Launch Managers (TLMs) function as air traffic controllers: they maintain cross-functional context across more than 45 technical, product, and services teams from encoding, CDN, and playback to social media, customer service, and security teams. TLMs start coordinating with these teams months and sometimes years ahead of a live event to ensure escalation paths and playbooks are in place when the LCC needs to translate a CDN engineer’s concern into a product decision at 2am while a game is still in progress. Together, these roles form the operational leadership layer that keeps engineers focused on building rather than watching dashboards.

The live operations teams rank shows by three categories:

  * **Low-Profile Events:** These are lightweight, often lack new features, and anticipate low viewership. They are typically managed with a small team of 1–2 operators and automated alerting.
  * **High-Profile Events:** These are mid-tier events that warrant more attention due to their size, unique features, or anticipated viewership.
  * **Big Bet Events:** These represent the highest operational weight, such as an NFL game, with massive viewership expectations and special features. They require the full support of the LCC: a fully staffed physical operations room for the entire duration, active incident command structures, and key engineering teams on standby to support their specific product areas.



In addition to a show’s event category, the TLMs deployed a Live Operational Level (LOL) model that helps engineers determine whether they need to be on standby, live online, or even in the LCC for any given show.

Based on the show’s event category, special features, expected viewership, and overall risk, non-operational teams are put into one of four categories:

**Red:** Non-operational teams must remain online for the duration of the event. This is most often seen in large boxing matches and sporting events, such as the NFL Christmas Day games.

**Orange:** Non-operational teams are required to check in online ~30 minutes prior to show and are asked to monitor the health of their systems through the first commercial breaks until the LCC releases them to LOL Yellow.

**Yellow:** Non-operational teams are not required to be online, but should be reachable by page in 2 minutes. Special PagerDuty rotations and verifications are in place to ensure these teams are reachable.

**Grey:** Business as usual. Teams will be reached out to by their normal pager rotation if their help is needed during the show.

Visual Representation of LOL Levels (Courtesy of Gemini Nano Banana Pro)

By tiering events, Netflix ensures that resource allocation is proportionate to operational needs, preventing a continuous “crisis” mentality and allowing our non-operational partners to focus on their day jobs.

As of April 2026, most engineering teams are Yellow or Grey, with Ops and Site Reliability Engineers making up most of the teams online to support shows, in addition to engineers performing feature tests.

### Building the Model

The first lesson from 2023 was straightforward: what worked for one show a month would not work for ten shows a week. The engineers who built the pipeline were also the ones operating it, which meant the people best positioned to fix problems were also the ones most likely to be paged at 2am. There was no operational layer to absorb that load.

In 2024, Netflix streamed 72 live events and began building the team that would eventually run them. The first version of the LCC looked nothing like it does today: a cluster of desks, monitors on stands, and laptops running dashboards, set up in the middle of the office. The TLM team was stood up to own cross-functional coordination for live launches and began formalizing the runbooks, event tiering structure, and incident management protocols that would later enable Netflix to scale operations to support hundreds of shows per year.

By the time Jake Paul vs. Mike Tyson and the first NFL Christmas Games arrived, the LCC had moved into a dedicated conference room, and partnerships with device and labs teams were producing more effective monitoring tools. But the biggest operational lesson of that period came from communications.

For Tyson/Paul, Netflix had over 300 people online across engineering, product, and business functions. Some people were online because their support was needed, while many others were just excited to be part of it. Coordinating that many people over Slack and Zoom during an active event with 64 million concurrent streams was unmanageable.

That experience drove the implementation of a **squad model** : defined teams with clear roles, scoped communication channels, and a single escalation path into the LCC. Around the same time, the LCC began integrating with IP-based communications systems, finally bridging the gap between the command center and the Broadcast Operations Center that had been operating largely in a fractured parallel until then.

Visual Representation of Squad Operations Model (Courtesy of Gemini Nano Banana Pro)

2025 brought 220 live events and a permanent LCC facility, along with a dedicated operations team, the Live Command Center Operations Leads. With the growing number of shows, TLMs were getting spread thin, spending more than half their week operating shows late into the evening and over weekends, then getting called back into the office at 9 am to lead critical launch meetings. The addition of the LCC Ops Leads resolved the bandwidth issue by separating planning and operations into distinct roles within a single centralized team.

As the slate continued to grow and large series like the World Baseball Classic and FIFA Women’s World Cup were announced, the vendor-operator model was introduced, creating an elastic workforce that could scale up for large series events without carrying full-time headcount year-round to support peak capacity. **The key enabler was documentation** : standardized runbooks and onboarding materials detailed enough that a trained operator could reach full effectiveness within their first week. WWE RAW became a weekly operation, normalizing what had previously felt exceptional. By early 2026, multi-event days were no longer a test of capacity but had become the expected operating condition.

The next chapter is international. Netflix has begun standing up regional Live Operations Center coverage to support live events outside North America, with EMEA operations soon running out of London. The model draws on the same runbooks, tooling, and escalation structures developed in Los Gatos, with follow-the-sun shift handoffs connecting EMEA and US teams across time zones. Looking further ahead, Netflix is planning to bring the LCC and BOC under one roof — a single integrated facility that combines broadcast operations and cloud monitoring into a unified space. The physical separation between those two functions has always introduced friction at the seams. Closing it is the logical next step.

### Operational Principles for Live at Scale

Building a live operations discipline means accepting one constraint above all others: you cannot optimize for efficiency before you have built for reliability.

Netflix designed for quality first: Standardized runbooks, tiered event structures, pre-documented failure modes, so the 50th show runs as smoothly as the fifth. Off-the-shelf monitoring tools with propagation delays don’t meet that bar. The Netflix Live Control Center and Live Control Room platforms exist because observability at live scale is a product decision that demands the same design rigor as the pipeline it monitors, turning millions of telemetry events per second into something a small team can act on in real time. Technical systems and human systems have to scale together, and the most reliable incident response plan is always the one written before anyone needs it.

The operational model is also a cultural one. Bringing contingent operators into a proprietary tech stack requires deliberate onboarding design. The vendor model only works when documentation is built to be followed confidently by someone new within their first week. **Beyond process, the most durable parts of how Netflix runs live operations reflect something the**[**Netflix culture memo**](<https://jobs.netflix.com/culture>)**makes explicit: the best ideas come from anywhere.** In practice, that means frontline operators catching issues that engineers miss, vendor staff surfacing workflow friction that improves the system for everyone who follows, and a team that treats candid feedback as standard practice rather than an exception. The technology, the slate, and the scale keep changing. The discipline stays current by staying curious and iterating on the tools, the runbooks, and the team.

### Conclusion: What’s Next

With 2026 already off to a successful start in operational scaling, we’re excited to shift our focus to the upcoming launch of our new Live Broadcast Operations Center in Los Angeles and our new Live Operations Center (LOC) in West London. The LOC will initiate Netflix’s follow-the-sun coverage as live content continues to grow with over 400 live events in 2026, including the launch of 24/7 linear free-to-air broadcast channels with TF1 this summer. On the technical front, further development of automated alerting tools and monitoring by exception will continue to reduce operations’ manual workload.

In 2023, the engineers led the operations. By 2026, they had developed systems that mostly ran themselves, with a dedicated operational team ensuring they operated smoothly for millions of members. The technology behind Netflix’s Live content has been documented throughout this series, but what runs alongside the tech stack is a set of operational principles, rehearsed incident management processes, and monitoring infrastructure that had to be created from scratch and continues to develop.

A special thanks to Te-Yuan Huang, Rob Saltiel, Tara Kozuback, Chris Carey, Di Li, Patrick Li, Anne Aaron, and Melissa “Mouse” Merencillo for their support on this article.

* * *

[The Human Infrastructure: How Netflix Built the Operations Layer Behind Live at Scale](<https://netflixtechblog.com/the-human-infrastructure-how-netflix-built-the-operations-layer-behind-live-at-scale-33e2a311c597>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
