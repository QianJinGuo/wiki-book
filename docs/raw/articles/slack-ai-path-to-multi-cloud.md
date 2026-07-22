---
title: "slack.engineering"
source: newsletter
url: https://slack.engineering/slack-ai-the-path-to-multi-cloud
ingest_date: 2026-07-03
vxc: 64
stars: 4
sha256: eb88fca92d5d0072dbc056f4748ce38fe946d809ee5e836e64306f67baf5a934
---
sha256: 2f3ec3bc05198026d16b4ab286654c1ac81e94e3a94043f180e2917109e1771c

Title: Slack AI: The Path to Multi-Cloud

URL Source: https://slack.engineering/slack-ai-the-path-to-multi-cloud

Markdown Content:
In early 2023, Slack faced a foundational challenge: serving Large Language Models (LLMs) at enterprise scale with the [security, reliability, and performance](https://slack.com/help/articles/28310650165907-Security-for-AI-features-in-Slack) our customers expect. Over three years, we evolved from basic infrastructure to orchestrating a sophisticated multi-cloud architecture. We didn’t just want shiny new models; we needed a system resilient to regional outages and GPU scarcity. Our journey moved through four distinct phases, shifting from reactive infrastructure management to proactive, multi-vendor orchestration.

* * *

## Phase 1: The SageMaker Era

[When we built the initial stages of Slack AI](https://slack.com/blog/news/how-we-built-slack-ai-to-be-secure-and-private), AWS SageMaker was the natural starting point. It was a managed ML Serving platform that offered the key things that we were looking for: Security, FedRamp compliance, model availability and control. We were able to leverage a sophisticated escrow virtual private cloud (VPC) strategy to establish a strict zero-knowledge environment: our data remained private to Slack, and the provider’s proprietary model weights remained inaccessible to us.

To maximize uptime for a global user base, we deployed these containers across multiple AWS regions. This required our teams to manage the operational lifecycle, including cross-region IAM roles, balanced routing across model endpoints, proactive capacity planning, and auto-scaling logic.

### The Operational Reality

While SageMaker provided the necessary security, the overhead was immense. We faced three primary taxes:

*   **Scaling Latency:** Initialization times prevented instantaneous scaling.
*   **Hardware Scarcity:** Enterprise-grade Nvidia GPUs, such as the A100 (Ampere architecture) and the emerging H100 (Hopper architecture) instances, were often unavailable.
*   **Over-Provisioning:** Maintaining idle resources to meet peak SLAs.

By early 2024, we mitigated these via On-Demand Capacity Reservations (ODCR) and proactive, cron-based scaling. However, this reinforced a hard truth: we were spending too many engineering cycles on plumbing. To scale, we needed automated capacity, not manual coordination.

### Feature Lag

As the AI ecosystem and feature usage accelerated, newer and higher quality models emerged quickly. While we were maintaining a custom serving solution on SageMaker, AWS was heavily prioritizing Amazon Bedrock, its purpose-built managed LLM service.

Hosting Anthropic models via an escrow VPC led to a “catch-up” cycle. Model iterations and optimizations often debuted on Bedrock weeks or months before SageMaker availability. For Slack, where staying at the bleeding edge of model quality is a competitive necessity, this gap became a significant driver for our next architectural evolution.

* * *

## Phase 2: Migrating to Amazon Bedrock for Agility and Access

By mid-2024, AWS Bedrock had matured significantly. It had achieved FedRamp Moderate compliance and also promised the same security posture that we required. The decision to migrate was a strategic pivot as it offered three immediate advantages:

*   **Operational Simplicity:** We moved away from having to scale individual GPU instances to a fully managed AWS service.
*   **Immediate Model Access:** We eliminated any LLM model feature lag by gaining access to the latest models very quickly after LLM Providers made them publicly available.
*   **Infrastructure Efficiency:** Bedrock introduced **Provisioned Throughput (PT)** and **On Demand (OD)** infrastructure options, allowing us to tailor compute to specific use cases. We utilized PT for interactive, latency-sensitive features like channel summaries, while leveraging OD for bursty, scheduled workloads like Recap to eliminate costs for idle compute.

### Understanding Provisioned Throughput

In the Bedrock ecosystem, capacity is measured in **Model Units (MUs)**. Each MU provides a deterministic amount of throughput, measured in tokens per minute. Shifting from GPU instances to MUs allowed us to abstract away the hardware and focus entirely on raw throughput. To minimize migration risk, we prioritized provisioned throughput infrastructure first, leaving on demand infra as a fast follow.

### The Zero Incident Migration

We executed the transition through a multi-stage migration strategy:

*   **Compliance:** Secured Legal, Security, and FedRamp sign-offs before rerouting production traffic to maintain our existing high bar for data privacy.
*   **Capacity:** Conducted extensive load tests to map the exact number of Model Units (MUs) required to match our SageMaker baseline across diverse traffic profiles.
*   **Quality:** Used A/B testing and evaluation frameworks to compare environment outputs side-by-side, verifying both quality and latency parity.
*   **Rollout:** Implemented gradual traffic shifts via feature flags and instant rollback capabilities, ensuring 100% availability during the switch.

### Achieving Operational Maturity

The migration to Bedrock delivered immediate, compounding wins for our engineering teams and our customers:

*   **Engineering Efficiency & Enhanced Experience:** By offloading the burden of self-managed infrastructure, we freed our engineers to focus on model performance and feature quality. Because Bedrock serves as the primary launchpad for new LLMs, we were able to deliver model upgrades and quality improvements to users weeks or months earlier than was possible on SageMaker, directly enhancing the user experience across the entire Slack AI suite. A prime example was our ability to quickly upgrade the AI Search features to new high-reasoning models, which led to more precise, context-aware answers.
*   **Architectural Simplicity:** We successfully moved away from the “infrastructure plumbing” of endpoint management, GPU instance lifecycle, and complex capacity reservation coordination. In this new model, we simply requested quota from AWS, they provisioned the MUs, and we served traffic. This allowed us to shift from **reactive scaling** to a **strategic forecasting technique**. By projecting our needs several weeks out, we gave our account teams ample time to secure capacity, ensuring we were always ahead of the demand curve.
*   **The “Zero-Incident” Standard:** Switching an entire backend while serving live traffic can sometimes be a recipe for disaster. We avoided that by being borderline obsessed with parity, and achieved zero customer-facing incidents. We didn’t just run unit tests; we ran massive load tests and shadow requests to find the exact “Model Unit” count that matched our old setup. We used feature flags to slowly bleed traffic over, so if anything looked even slightly off, we could yank it back in seconds. It wasn’t magic – it was just a lot of cautious plumbing.

This solidified a core Slack AI engineering principle: _measure first, migrate gradually, and monitor continuously._

### The Final Efficiency Gap

While Provisioned Throughput was a massive leap forward for predictable, consistent workloads, it wasn’t perfectly optimized for the workloads. We encountered two primary efficiency hurdles:

*   **The Over-Provisioning Cycle:** Our infrastructure needs are very closely aligned by the global workday traffic patterns. To ensure a snappy experience during the massive US East and West Coast morning surges – when users lean heavily on AI Summaries and Search to catch up on activity – we had to maintain a high baseline of MUs. While we saw steadier, lighter usage during the APAC and EU mornings, we had to provision for that absolute global peak. This meant we were often paying for significant underutilized capacity during the troughs between regional handoffs and over the weekends, creating a persistent efficiency gap.
*   **The Commitment Lock-in:** Provisioned Throughput often required commitments of one to six months. In the fast-moving world of LLMs, where a state-of-the-art model can be superseded in weeks, these commitments effectively slowed down our ability to upgrade. Even when a superior model was released, we often chose to wait for our existing commitments to expire before migrating.

These challenges led us to our next evolution: finding a way to balance the reliability of provisioned capacity with the economic and technical flexibility of **On-Demand scaling**.

* * *

## Phase 3: Transitioning to Bedrock On-Demand

With high confidence in Bedrock and mature monitoring, we moved to close the final efficiency and quality gap. Historical analysis revealed that feature usage fluctuated with business hours, leaving some idle capacity overnight.

Rather than maintaining a static footprint for 24/7 peak capacity, moving to on-demand infrastructure allowed us to solve the **idle capacity problem**. It gave us the **architectural agility** to support highly variable workloads without the friction of manual over-provisioning. For features with a 10x variance between peak and off-peak hours, the efficiency gains were substantial. More importantly, it removed the technical bottleneck we faced in Phase 2: because we were no longer locked into multi-month commitments, we regained the freedom to migrate features to different models. This meant that as soon as a more performant model dropped and passed our internal quality and metrics bars, we could pivot our infrastructure to support it within a day, rather than waiting months for a contract to expire.

### The Hybrid Strategy: Optimizing for Performance and Fluency

We didn’t simply flip a switch and move everything to On-Demand. To balance efficiency with a premium user experience, we implemented a Hybrid Routing strategy. We kept high-volume, latency-sensitive features on dedicated capacity (Provisioned Throughput) to ensure a consistent “snappy” feel. Simultaneously, we moved asynchronous, bursty workloads – like nightly Recaps – to On-Demand capacity. To bridge the gap, we engineered a Spillover Pattern: if a sudden surge pushed us beyond our reserved limits, excess requests automatically “spilled over” to on-demand endpoints, ensuring we never dropped a request due to capacity ceilings.

### Navigating the Trade-offs of On-Demand

Shifting to On-Demand traded rigid pre-planning for architectural agility, eliminating manual capacity management. By utilizing Bedrock’s ability to route across different US regions based on real-time availability, we were able to find capacity dynamically while adhering to our regional data boundaries. However, this flexibility introduced a new set of variables that we had to solve for:

*   **Service Level Variability:** Unlike the dedicated nature of PT, OD operates on a shared-resource model, which typically carries different uptime characteristics.
*   **Regional Capacity Orchestration:** Success with OD relies on the cloud provider’s ability to manage demand across their entire customer base in specific regions, rather than having specific hardware units explicitly reserved for Slack.
*   **Concentration Risk:** Relying too heavily on a single provider’s on-demand pool meant that any service-wide blip could have the potential to impact entire Slack AI features simultaneously.

### Engineering for Resilience

To mitigate these risks, we didn’t just accept the trade-offs – we built a more intelligent AI Platform abstraction. We developed a model hierarchy for every AI feature, allowing our system to automatically fall back to different models if the primary model reached a degraded state. Some examples of regressions are elevated time to first token latencies, throttling errors, and downward trend in customer feedback.

This hierarchy was a game-changer for model quality and reliability. If a specific model was underperforming or hitting limits in one region, the platform would reroute the request in real-time to another healthy endpoint. From the customer’s perspective, the experience remained seamless; they continued to receive high-quality results without ever knowing a complex failover had occurred behind the scenes.

While this internal fallback logic significantly increased our service resilience, it also highlighted two strategic gaps. First, no matter how many failovers we engineered within a single cloud, we remained susceptible to any potential provider-wide outage. Second, the AI landscape is moving with incredible velocity and remains highly fragmented. The state-of-the-art model for a specific task – whether it’s summarization, reasoning, or high-speed extraction – can change in a matter of weeks, and these leading models are often exclusive to specific cloud providers. Relying on any single vendor meant we might be artificially limiting our access to the highest-quality technology available. To ensure Slack AI always provides the best possible experience, we need the flexibility to go wherever the best models are while simultaneously meeting our [security, compliance, and privacy standards](https://slack.com/trust/data-management/privacy-principles).

As Slack AI scaled to millions of users, we realized that true enterprise-grade reliability and a “best-of-breed” model strategy required looking beyond any single provider. This realization was the primary catalyst for our latest evolution: the move to a **Multi-Cloud architecture**.

* * *

## Phase 4: Expanding to a Multi-Cloud Strategy Ecosystem

We recognized that providing a world-class AI experience required the best of every ecosystem. By early-2026 we officially expanded our footprint to include **Google Cloud Platform (GCP) Vertex AI**, not just as a failover for redundancy, but as a strategic engine to accelerate product innovation through access to a broader catalog of state-of-the-art models. Our goal is simple: ensure Slack remains the most intelligent place to get work done. This move wasn’t done just for the sake of complexity, but rather a strategic shift driven by four key factors:

*   **Infrastructural Redundancy & High Availability:** For a mission-critical Digital HQ, uptime is the primary metric. While we continue to rely on third-party LLM models as a cornerstone for their consistency and reliability, a multi-cloud footprint eliminates provider-level large scale infrastructural disruptions as a single point of failure. If an entire cloud ecosystem experiences a regional or platform-wide disruption, our traffic can be rerouted to a separate, healthy stack without service interruption.
*   **Model-to-Feature Optimization:** The “one-size-fits-all” approach to LLMs quickly hits diminishing returns. By expanding our catalog to include multiple models, we gained the ability to match the specific latent strengths of a model to the specific requirements of a feature. This granular optimization led to immediate performance gains: 
    *   **~10% improvement** in quality metrics for complex reasoning tasks.
    *   **~67% reduction in latency** for high-velocity, low-token workloads.

*   **Access to Innovation:** The AI landscape moves at extreme velocity with frequent vendor exclusivity. Multi-cloud ensures we are ready to integrate with the latest breakthroughs regardless of where they are hosted while upholding our compliance, privacy, and security promises.
*   **Dynamic Workload Orchestration:** Beyond simple failover, multiple providers allow for sophisticated traffic shaping. We can route requests based on real-time telemetry – evaluating not just provider health, but which endpoint offers the optimal performance profile for a given workload at that exact moment. This enhanced our infrastructure from a static resource into a dynamic, intelligent routing layer.

### The Integration Journey

Building a production-ready GCP integration was a massive cross-functional effort. It required tight synchronization across teams such as Security, Risk and Compliance, Trust and Integrity, AI Quality, Legal, and Cloud Providers to ensure our data boundaries remained ironclad across the board. Expanding to GCP Vertex AI turned our infrastructure into a strategic engine for product innovation. Rather than being limited to any single provider’s catalog, we can now granularly match specific features to the models best suited for them – balancing factors like context window, latency, and reasoning capabilities. To make this a reality, we solved cold start engineering hurdles by implementing secretless authentication and an **API Normalization layer** that translates disparate provider signals into a unified language for our application logic.

### Architectural Deep Dive: The Intelligent Routing Layer

The core technical challenge was building a system that abstracted away provider complexity. By enhancing our abstraction layer into an **Intelligent Routing Layer**, we ensured that users receive the fastest, highest-quality response available. If one model or provider slows down, the system instantly reroutes the request to a better-performing alternative, making the underlying complexity completely invisible to the user while maintaining a seamless experience. It contains:

*       *   **Metric-Driven Model Selection:** We use our internal quality metrics to determine the optimal model for each feature. For instance, if our benchmarks show a specific LLM outperforms others for “Recaps,” the router directs traffic accordingly. Crucially, we always designate **backup models** for every feature; if the primary choice doesn’t meet our performance or quality thresholds in real-time, the system knows exactly where to go next.

*       *   **Experimental Rules & A/B Testing:** This capability has fundamentally changed our release velocity. When we wanted to test the latest LLMs, after our security and compliance verifications, for our Recaps feature, we were able to route a percentage of traffic to the new model with minimal code changes and an incredibly fast turnaround time. This allowed us to validate performance in the wild and tighten our feedback loop from weeks to days.

*   **Automated Circuit Breaker & Health Monitoring:** To move beyond manual failovers, we implemented an automated Circuit Breaker pattern. This system acts as a real-time watchdog, constantly monitoring health signals at the endpoint level. If a specific provider or model begins to exhibit signs of distress – such as an elevated Time to First Token (TTFT), a spike in 5xx error rates, or crossing a latency p90 threshold – the circuit “trips.” Once tripped, the routing layer automatically diverts traffic to a healthy alternative model based on the use case and complexity. Crucially, the breaker enters a partial-open state, allowing a small, controlled trickle of requests to reach the degraded endpoint. As the endpoint demonstrates sustained health, the system dynamically expands this trickle, incrementally ramping traffic back up until the breaker is fully “closed” and normal operations resume. This ensures a graceful recovery without overwhelming a stabilizing service.

### The Multi-Cloud Reality

Running a multi-cloud footprint at our scale is a major technical undertaking. It’s a conscious trade-off: we gain immense flexibility but it requires a much more sophisticated approach to how we manage our systems:

*   **API and Behavioral Friction:** Each provider has its own unique API patterns, proprietary error codes, and distinct rate-limiting behaviors. We had to build a robust normalization layer to ensure that a “Rate Limit Exceeded” from one provider and a “Throttling Exception” from another were handled identically by our application logic.
*   **Operational Monitoring Complexity:** To avoid blind spots, we couldn’t rely on the native dashboards of each cloud. We had to build a unified monitoring stack that integrates telemetry from the multiple clouds into a single view, ensuring our on-call engineers can diagnose issues without pivoting between consoles.
*   **The Attribution Challenge:** Accurately tracking the cost per feature internally becomes significantly harder when workloads are shifting dynamically between clouds. This required deep instrumentation across multiple billing systems to maintain financial transparency.
*   **The On-Call Knowledge Gap:** Our engineers can no longer be specialists in just one ecosystem. To support the platform effectively, they need to be provider agnostic, possessing deep expertise in the infrastructure patterns and networking nuances that span multiple major cloud environments. This shift requires a broader skill set to troubleshoot and maintain a distributed, multi-vendor footprint.

While multi-cloud increases operational overhead, the trade-off is a superior service. We have removed single points of failure, improved quality benchmarks by matching features to specific model strengths, and gained the strategic leverage to adopt new innovations the moment they hit the market.

* * *

## Reflections on the Path to Multi-Cloud

We arrived at a multi-cloud architecture not for the sake of complexity, but to enhance Slack’s standards for product innovation and reliability. Looking back, five themes stand out:

### 1. Scaling safely requires XFN parity

The biggest hurdles in scaling AI aren’t just technical; they also include legal, risk, compliance, and security related tasks. Achieving deep alignment between these teams and engineering is what allowed us to scale to millions of users without compromising our trust standards.

### 2. The abstraction layer is a core requirement

As seen in our Phase 2 move, the most critical decision wasn’t which model to use, but how we built the logic around them. Agility and speed to market are our primary competitive edge.

### 3. Treat architecture as a living document

Managed services mature monthly. Because we remained provider-agnostic, we can now adopt breakthroughs in latency or reasoning without a total rewrite.

### 4. Reliability requires provider agnosticism

Internal failovers aren’t enough. Our move in Phase 4 to a multi-provider stack ensures Slack stays online even during any potential platform-wide cloud disruption.

### 5. Redefining the meaning of “Failure”

An LLM service that is “up” but slow is effectively broken. By treating different dimensions of data such as p90 spikes as soft failures and feedback trends, our routing layer ensures users have a snappy experience.

* * *

The future of enterprise AI is multi-cloud, multi-model, and dynamically orchestrated. By prioritizing portability and staying close to the market, we haven’t just built a way to use AI – we’ve built a platform that harnesses the best the industry has to offer the moment it arrives. We’re looking forward to seeing what we build next!

Interested in taking on interesting projects, making people’s work lives easier, or just building some pretty cool forms? We’re hiring! ![Image 1: 💼](https://s.w.org/images/core/emoji/17.0.2/svg/1f4bc.svg)

[Apply now](https://slack.com/careers/dept/software-engineering)

