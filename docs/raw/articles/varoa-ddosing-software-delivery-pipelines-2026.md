---
title: "DDoSing Software Delivery Pipelines"
author: "Varoa"
source_url: "https://varoa.net/2026/06/13/ddosing-software-delivery-pipelines.html"
ingested: 2026-06-17
sha256: "33dcb1c3b953fcd61698178949df791e84928fcf46acc07a1aa88e42c9a245c7"
---

Published Time: 2026-06-13T11:00:00+00:00

Markdown Content:
The pipeline had degraded to the point of collapse. On the surface, the problem was that it converged on a choke point that was easy to saturate and hard to scale. But the real issue wasn’t having a bottleneck. It was pretending that there wasn’t one, treating back-pressure signals as a nuisance, and letting an AI-induced productivity anxiety run unchecked.

The system, let’s call it The Provisioner, takes a heap of hardware like GPU servers and high bandwidth network fabric, and turns it into a virtualized multi-tenant IaaS service. This is a wide scope. The system has many moving parts that are diverse (from firmware to VM images through k3s clusters and services deployed on it), individually complex, and interact through broad API surfaces.

To verify the Provisioner properly, it must apply to real hardware and construct a real environment where E2E tests can verify functional and non functional requirements. But that verification process has limited throughput by nature. It is inevitably time consuming (~2h for a full run) and depends on exclusive access to expensive hardware that has multi-month procurement cycles so scaling out more environment replicas is not an option.

Poor throughput was problematic on its own, but it compounded with a surge in the supply of changes, mostly related to engineers receiving an enterprise AI license. Shoving more units of work into a system with slow service times is quite a reliable way of building up even longer queues. But the real killer was that AI also changed the psychology of the team, infecting them with a strain of productivity anxiety. As the pipeline could not keep up with the rate of changes, code-complete-but-waiting-for-verification work piled up in the queue. Engineers couldn’t bear to sit on their hands. They picked up new tasks “to make progress while the last change gets verified”, pushing even more changes into the pipeline. Individually everyone felt more productive, but the delivery system was slowly imploding.

To keep up with supply, delivery automation started batching changes in each verification cycle. But batches had to get bigger and bigger, increasing the frequency of failures and the complexity of troubleshooting. That forced the team to stop the pipeline for hours sifting for bugs in a haystack of changes. The idle pipeline brought even more anxiety. Wanting to get on with merging changes, engineers tended to waive test failures as “flakes” or “perhaps not so important right now”, sometimes rightfully so but others obscuring real issues. Over time, this built a reserve of hidden bugs that made failures more frequent and troubleshooting less reliable, reducing throughput even further.

The team was acting as if the verification stage wasn’t a bottleneck, but you can’t get away with force-feeding a system with more work than it can absorb. Eventually back-pressure appears. Here it did in the form of longer merge queues and a chronically degraded pipeline.

The sensible response to back-pressure is to rate limit supply. We did it by appointing a gatekeeper role in charge of regulating the flow of changes into the verification queue, through intentional choices like bundling many small, unrelated, low-risk changes, or by reserving a full cycle for a big, higher risk feature. Some engineers argued that this wouldn’t fix anything, as it just shifted work from one queue (“verification”) to another upstream (“development”). But that was exactly the point. We had identified the bottleneck, made back-pressure explicit, and let it propagate upstream.

When the amount of work stuck in development grew, we rate limited again by limiting work in flight per engineer. Back-pressure kept propagating upstream. Eventually, the spotlight landed on the real problem: poor planning. Initiatives were being planned for execution only on the basis of business priority and engineering capacity but failed to take into account that once engineers got to work, different projects would easily hit the same surface of the system, or compete for exclusive verification cycles. Those analysis gaps remained latent until late in the development cycle, and surfaced as contention disrupting the verification stage.

The Gatekeeper role was compensating for planning that should have been made well before engineers started coding. We fixed this with an explicit analysis of infrastructure dependencies during product and technical design. The verification stage stayed slow, but reliable, so the team could squeeze its capacity and release engineers from reactive firefighting. They spent more time structuring execution work up front to minimize inter-dependencies with other initiatives, which enabled parallel verification.

In a way, back-pressure is a negotiation between senders and receivers trying to agree on a sustainable throughput. In healthy systems, receivers signal when input pressure is excessive and senders back-off until the receiver becomes comfortable. But agreement is not guaranteed. When receivers don’t emit back-pressure signals, or when senders ignore them, the outcome is a dysfunctional system that needs arbitration from the laws of physics. Which tends to be unpleasant.

Jun 13, 2026
