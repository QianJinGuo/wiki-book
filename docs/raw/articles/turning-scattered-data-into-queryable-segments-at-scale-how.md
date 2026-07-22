sha256: fb2756ba4123c56c19769806eb424711b78d74727cdeed0fb9a46382c1a51df7
---
title: "Turning Scattered Data Into Queryable Segments at Scale: How Razorpay Built Its Customer Data…"
source_url: "https://engineering.razorpay.com/turning-scattered-data-into-queryable-segments-at-scale-how-razorpay-built-its-customer-data-3937c4b012de"
ingested: "2026-06-29"
type: article
tags: [newsletter]
---

# Turning Scattered Data Into Queryable Segments at Scale: How Razorpay Built Its Customer Data…


Published Time: 2026-06-26T08:06:32Z

Markdown Content:
[![Image 1: Varun Meka](https://miro.medium.com/v2/resize:fill:32:32/1*msjyi7X8P8DOChFwnLC9Aw@2x.jpeg)](https://varun1010.medium.com/?source=post_page---byline--3937c4b012de---------------------------------------)

11 min read

3 days ago

--

--

_A consent-native CDP that serves audience segments across 500M+ user profiles in under 30ms, with PII isolated to the source systems._

Press enter or click to view image in full size

![Image 2](https://miro.medium.com/v2/resize:fit:700/1*LOAyanf4lVSDum5COfJAJA.png)

## The Problem We Were Solving

A customer opens her favourite online shopping app, adds a few items to her cart, and pays ₹1,200 via UPI, powered invisibly by Razorpay. A week later she returns and pays using a saved Visa card from her laptop. Later that month, she places a larger ₹8,500 order through net banking from work.

Three transactions. Three different payment instruments. Three different devices. To the merchant’s engineering team, and to Razorpay’s data systems, these could look like three completely different people, unless you’ve done the hard work of figuring out they’re all the same customer.

Now suppose this is a D2C fashion brand approaching their Diwali sale. The merchant’s growth team has a clear plan: _“Identify customers who have transacted at least once in the last 30 days, have spent more than ₹5,000 cumulatively this quarter, and haven’t enrolled in our loyalty programme. Send them an early-access nudge with a personalized discount 48 hours before the public sale opens.”_

A year ago, answering that question at Razorpay meant filing a cross-team data request, waiting for an analyst to write a custom Spark job, and getting an answer in 2–3 days. By the time the merchant had the segment, the Diwali sale was already live. The early-access window had closed. The campaign got sent to a broader, less-targeted audience, wasting spend on customers who would have bought anyway and leaving cold customers untouched.

Now multiply that pain by millions of merchants. Razorpay powers payments and growth for over 12 million merchants. From D2C fashion brands and SaaS startups to subscription platforms, ed-tech companies, and the 2 million+ local merchants accepting QR payments every day. Together, they process billions of transactions. Every one of those merchants is, in their own way, trying to grow. Running a sale, recovering an abandoned cart, nudging a churning customer, and identifying their next 1,000 high-value buyers.

We knew this was a fundamental capability gap that needed structural solving. That’s what drove us to build the Customer Data Platform (CDP), an in-house platform that sits at the heart of Razorpay’s data-driven product decisions.

DPDPA also reshaped what the platform had to be. India’s Digital Personal Data Protection Act introduced strict requirements around consent-scoped data processing, purpose-specific access, and the ability to honor user consent decisions at the data layer rather than the application layer. The CDP was built with these requirements baked into the architecture rather than bolted on afterwards.

## The Architecture

Before diving in, it’s worth mentioning why a CDP at this scale is difficult. Teams that have worked on similar systems will recognize the challenge immediately. It has to balance data freshness, low latency, consent enforcement, cost, and correctness simultaneously. Few of these dimensions trade off against each other.

Razorpay’s EDW holds billions of derived attribute rows across 500M+ user profiles, refreshed daily from payment transaction data flowing in at tens of thousands per second. These attributes are stored in S3 with server-side encryption using client-managed KMS keys, which keeps access strict and explicitly enforced. A single segment definition touches multiple attribute tables, each with hundreds of millions of rows. Naive joins blow up Spark cluster memory in seconds.

Press enter or click to view image in full size

![Image 3](https://miro.medium.com/v2/resize:fit:700/1*h-f6FqleTR2lO0a_mDOhpg.png)

Real-time membership checks complete in under 30ms, including network hops between services, and the current system sustains this at more than 1,500 RPS. Cost is another major constraint. At 500M+ profiles and hundreds of active segments, even small inefficiencies in compute or storage compound into significant monthly spend.

Correctness is equally important. Segments directly power campaigns that reach real merchants and customers. Even a small mismatch in segment membership can result in the wrong campaign being sent to users, impacting merchant trust and creating compliance risks.

## Stage 1: The Segmentation DAG, from Rules to Membership Lists

### What a Segment Definition Looks Like

A segment is a named, rule-based collection of user identifiers. Rules are expressed as JSONB configs of AND/OR/NOT conditions over derived attributes:

{

 "name": "seg_loyalty_nudge_candidates",

 "purpose": "internal_crm",

 "refresh_config": {

 "frequency": "daily",

 "ttl_days": 30

 },

 "rules": {

 "operator": "AND",

 "conditions": [

 {

 "attribute": "avg_order_value",

 "op": "eq",

 "value": 5000

 },

 {

 "attribute": "loyalty_enrolled",

 "op": "eq",

 "value": false

 }

 ]

 }

}
### How the DAG Runs

A segment definition looks simple: a few conditions, a refresh cadence, and an output purpose. But executing it at scale is expensive. Every run may involve scanning hundreds of millions of profiles, joining across large attribute tables, applying consent filters, and generating outputs for multiple downstream serving systems.

The Airflow DAG runs daily and processes two categories of work:

*   New segment requests from `segment_requests`
*   Existing segments scheduled for refresh based on `refresh_config.frequency`

For each segment, the DAG first determines the minimum set of attribute tables required for execution. The EDW holds hundreds of derived attributes, many backed by large tables with hundreds of millions of rows. Loading all attributes for every segment run would unnecessarily increase Spark memory usage and shuffle overhead. To avoid this, the DAG parses the JSONB rule tree, extracts only the referenced attributes, and builds a targeted load plan for execution.

The Spark job evaluates the segment conditions and produces the final membership list of users matching the rules. The computed output is then written to S3 in a format based on the downstream serving requirement, and is encrypted at rest using a KMS key.

After successful generation, metadata such as segment status, output path, size, and refresh timestamps are updated in Postgres. The pipeline then emits `segment.created`or `segment.updated` events through SQS for downstream consumers.

### Segment Reuse and Deduplication

Segment reuse was one of the most consequential decisions in the platform. It saved both compute cost and storage. Different teams often request the same segment with minor formatting differences in configuration. Without reuse, each request would independently trigger Spark computation, generate separate S3 outputs, and provision separate serving infrastructure.

To avoid this, the platform computes a deterministic hash for every segment definition. Before scheduling execution, the system checks whether an active segment with the same hash already exists. If a match is found, the computed dataset is reused instead of recomputing the segment.

The difficult part was canonicalisation. Semantically identical rules must generate the same hash even if their JSON structure differs. For example, A AND B and B AND A should resolve to the same segment identity. To achieve this, the pipeline normalises operators, sorts conditions deterministically, flattens nested logical groups, and standardises JSON ordering before hashing.

Data reuse and serving reuse are handled independently. If a matching segment already exists in S3 but a new consumer requires DynamoDB serving, the system creates a new serving configuration and loads the existing dataset into DynamoDB without rerunning the Spark computation. This separation allows the platform to minimise compute cost while still supporting different serving patterns for different consumers.

## Stage 2: Segment Ingestion, Why We Split the Pipeline in Two

Every computed segment follows the same initial path: once the DAG finishes processing, a completion event is published to SQS. From there, the ingestion flow diverges based on the serving mode required by the segment.

### S3-Backed Segments

For batch-only use cases, the ingestion flow is intentionally lightweight. The Segment Worker validates the event, updates the segment state in the database, and emits a `segment.active` event to Kafka for downstream consumption. Since these segments are served directly from S3 and do not require low-latency infrastructure, the processing completes within seconds without additional orchestration or long-running workflows.

### DynamoDB-Backed Segments

Segments that require real-time membership checks follow a separate ingestion path. In this case, the Segment Worker starts a Temporal workflow keyed by `segment_id`.

The operational requirements here are very different from S3-backed segments. A DynamoDB import may involve loading millions of records from S3 into a newly provisioned table. Large imports can take several minutes and are vulnerable to transient failures such as worker crashes, S3 throttling, or DynamoDB capacity spikes. To handle this reliably, the workflow is broken into independently retryable activities:

1.   **Event validation.** Verifies metadata such as segment ID, S3 path, record count, and checksums before ingestion begins.
2.   **DynamoDB import.** Reads the computed membership dataset from S3 and writes it into a new versioned DynamoDB table.
3.   **Version promotion.** Promotes the new table version only after import validation succeeds.
4.   **Lineage logging.** Stores execution metadata, retries, timestamps, and audit information for operational visibility.

### Zero-Downtime Refreshes Via Table Versioning

Each refresh creates a new DynamoDB table version:

*   `vN` is the current live version
*   `vN-1` is the previous stable version

Older versions are cleaned up asynchronously. The active serving pointer is switched only after the new table is fully imported and validated. If an import fails midway, the existing live table continues serving traffic without interruption. This versioned approach avoids partial refresh visibility and ensures consumers always read from a stable dataset during segment refreshes.

## Get Varun Meka’s stories in your inbox

Join Medium for free to get updates from this writer.

Remember me for faster sign in

Temporal also provides automatic retries with exponential backoff for transient infrastructure failures. If a worker crashes during execution, the workflow resumes from the last completed activity instead of restarting the full import.

## Stage 3: Segment serving

At first glance, segment serving looks simple: store membership data in DynamoDB and query it during runtime. In practice, this layer has strict latency, isolation, and privacy requirements. Real-time membership checks are part of critical request paths such as ad serving and personalisation flows. Multiple segment lookups may happen within a single request, so the serving layer is designed to operate within a tight p99 latency budget of sub 30ms. [VERIFY: sub-30ms p99 claim]

### One Table Per Segment

Each segment is stored in its own DynamoDB table: `segment_<segment_id>_<unique_version_hash>`.

This design isolates traffic and operational behaviour across segments:

*   High traffic on one segment does not impact others.
*   Capacity can be provisioned independently per segment.
*   TTL, refresh lifecycle, and cleanup remain local to the segment.
*   Failures during ingestion or refresh stay isolated to a single segment.

More tables means more operational overhead. The isolation was worth it.

### Privacy-Preserving Membership Checks

The partition key for every table is the SHA-256 hash of the user's phone number. During lookup, the caller sends a pre-hashed identifier and receives a boolean response indicating whether the user belongs to the segment. The serving layer never receives or stores raw phone numbers. PII does not leave the originating system and is never written into DynamoDB.

This effectively turns the serving layer into a membership lookup system that answers: "Is user X part of segment Y?" without needing access to the actual identity of the user. This was a deliberate architectural decision to reduce the compliance and security surface area of the system.

### Multiple Serving Paths From the Same Segment

A single computed segment can support multiple downstream serving modes simultaneously.

For example:

*   A campaign system may use DynamoDB for low-latency eligibility checks.
*   A partner integration may consume the same segment as a batch export from S3.

The platform tracks these independently using the `segment_servings` table in Postgres. This separates segment computation from segment delivery and allows different consumers to use the same underlying dataset without triggering duplicate computation.

## The Estimation Engine: Fast Audience Sizing With Theta Sketches

One of the biggest usability challenges in the platform was segment estimation. Before the estimation engine existed, the only way to know the size of a segment was to run the full computation pipeline. That meant executing Spark jobs on the EDW, generating outputs, and waiting for the final count. Even a small change in segment conditions required rerunning the workflow, which slowed down experimentation significantly.

The goal of the estimation engine was simple: give teams a fast and reasonably accurate estimate of segment size before triggering the actual computation pipeline.

### Why We Chose Theta Sketches

Approximate cardinality estimation is a well-known problem, and HyperLogLog (HLL) is often the default choice because of its low memory footprint. However, our segment system required more than simple cardinality estimation.

Most segment definitions involve combinations of `AND`, `OR`, and `NOT`. For example: `(state = 'Maharashtra' OR state = 'Karnataka') AND NOT (loyalty_enrolled = true)`.

This requires unions, intersections, and set differences across user groups. While HLL handles unions efficiently, intersections and differences rely on inclusion-exclusion approximations, where errors compound quickly for nested conditions.

Theta Sketches support these set operations directly with predictable error bounds, which made them a better fit for segment estimation.

### Building the Sketch Store

During attribute generation, the platform creates a Theta Sketch for every attribute-value pair in the catalogue using the Apache Datasketches library.

Examples:

*   `state = 'Maharashtra'`
*   `loyalty_enrolled = false`
*   `payment_method = 'UPI'`

Each sketch contains hashed user identifiers matching that condition. These sketches are stored alongside the attribute data and refreshed periodically through batch recomputation jobs. This shifts the expensive work to an offline preprocessing step so that estimation queries do not require scanning large attribute tables at runtime.

### Query-Time Estimation

When a team creates or edits a segment, the estimation engine parses the segment rules into a logical tree. Instead of loading raw attribute data, the engine fetches the required Theta Sketches and evaluates the tree using set operations.

The final sketch returns an estimated cardinality for the segment. Since the computation happens entirely on compact probabilistic summaries, estimates are returned within seconds without triggering Spark jobs or EDW scans.

For larger segments, the observed estimation error stays within a small range and is accurate enough for audience planning and campaign sizing decisions. For a Theta Sketch with `k = 4096`, the expected relative standard error is `1/√k ≈ 1.56%`. In practice, for segments with more than a few thousand members, estimates land within ±3% of the true count 95% of the time. For very small segments (fewer than k distinct elements), the sketch holds exact members and returns a precise count.

### Handling Drift

Theta Sketches are periodically rebuilt from the latest attribute datasets. As user attributes evolve over time, incremental updates alone can introduce drift between the sketches and the actual population. To maintain estimation accuracy, the platform runs scheduled rebuild jobs that regenerate sketches from the latest attribute store snapshots.

### Impact on Segment Creation

The estimation engine changed the segment creation workflow from a long-running batch process into an interactive experience. Teams can now modify segment conditions, preview audience sizes in near real-time, and refine targeting before triggering the actual computation pipeline.

This reduced unnecessary Spark executions while making segment iteration significantly faster for internal teams.

## What We Would Say to Other Teams Building This

A few lessons that aren't specific to customer data platforms.

**Compute reuse beats compute optimization.** A 30% faster Spark job is a one-time win. Detecting that the job doesn't need to run at all is a permanent one. Segment reuse through deterministic hashing was the single biggest cost lever in the platform. Build canonicalisation carefully and the savings compound forever.

**Hash before you store.** Privacy-preserving membership checks aren't just a compliance feature; they're an architectural simplification. The serving layer has nothing sensitive to protect because it never had the sensitive data in the first place. The cost is one extra hash on the caller side. The benefit is removing the entire serving layer from the PII blast radius.

**Approximate is usually enough.** The estimation engine using Theta Sketches turned a multi-hour iteration loop into a sub-second one. Most audience planning decisions don't need exact counts; they need confidence intervals. If your platform has a slow-feedback loop blocking experimentation, ask whether the consumers actually need exact answers.

## Closing Thoughts

The platform continues to evolve as we expand attribute coverage, improve refresh frequency, and move toward near real-time membership updates. We are also working toward making segment creation accessible to non-technical teams through self-service tooling.

Many of the architectural decisions in the platform were driven by scale, latency, and compliance constraints. The same patterns (approximate estimation using sketches, durable ingestion workflows, and privacy-preserving serving systems) are applicable beyond customer segmentation and can be useful in any large-scale audience or membership platform.

As the system grows, the challenge is no longer just computing segments efficiently, but building infrastructure that remains reliable, flexible, and operationally manageable as new use cases emerge.

_Editor:_
