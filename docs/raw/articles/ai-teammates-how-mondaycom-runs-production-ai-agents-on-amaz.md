---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/ai-teammates-how-monday-com-runs-production-ai-agents-on-amazon-bedrock
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-22
sha256: c06bd3af68cfaecddc4a677a54e1cdf2263f233ffa114ff032d86c50bd41e781
---

# AI Teammates: how monday.com runs production AI agents on Amazon Bedrock

AI Teammates are agentic AI on [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), and few engineering organizations run them in production at the scale that [monday.com](<https://monday.com>) does. Nine in ten Builders use AI coding tools every month, up from roughly half a year ago. Per-engineer PR throughput is up by more than half. Every figure in this post comes from monday’s own internal production data.  
  
In this post, we share the architecture behind those numbers, the retrofits that made it work in a decade-old code base, and the confidence-scored merge play closing the gap to full autonomy.

## This is not a greenfield

[monday.com](<https://monday.com>) is a decade-old code base, millions of paying users, hundreds of microfrontends and microservices, hundreds of Builders (Engineers, PMs, Analysts, and Product designers). Every PR an agent opens goes into a system millions of users expect to keep working through the next deploy. Greenfield demos are straightforward. Running agents inside an enterprise SaaS with real on-call, customers, and compliance is the work.

## Three levels of AI engineering

You can frame the journey as three levels:

  * **L1, the assistant.** Engineers use AI as a pair programmer. Cursor for the fast reflexive work, [Claude Code](<https://www.anthropic.com/claude-code>) for the heavy lifts. Adoption has nearly doubled year over year.
  * **L2, skills and sub-agents.** Teams build reusable agents for repeated work, engineers in the driver’s seat. This is where most of monday runs today, and where per-developer PR throughput stepped up by more than half.
  * **L3, multi-agent.** Fully agentic. Agents own delivery end-to-end while engineers orchestrate, taking tasks from boards, talking in Slack and monday, shipping code alongside humans.



## Agents are teammates, not jobs

Sphera is monday’s internal agent system. The first thing you see isn’t a job queue, it’s a Teams page: a mix of humans and agents, each with a profile, a manager, a scope, and a performance score. Atlas, the agent at the center of this post, is one of them: role: Software Engineer. Job: pick up tickets, write the PR, ship the feature. IDE: none. Same backlog as everyone else.

This isn’t decoration, it’s the schema. Every agent has a stable identity that flows through Slack, GitHub, and monday, so a human tags, assigns, code-reviews, or deactivates them like any other teammate. The agents that move the needle live on real teams, doing real work, accountable for the result.

## The architecture

Here is how the system fits together, from the inboxes an agent listens on to the AWS services that carry each event.

### Three inboxes, one agent

A monday-built agent has three first-class inboxes: a Slack `@mention`, a monday item assignment, a GitHub PR review request. All three hit the same agent session, with the same memory and workspace on disk: three flavors of the same event, same queue, same path. We don’t run three agent systems. We run one.

### The architecture in one diagram

The seven AWS services that we used are [Amazon Simple Notification Service (Amazon SNS)](<https://aws.amazon.com/sns/>), [Amazon Simple Queue Service (Amazon SQS)](<https://aws.amazon.com/sqs/>), [Amazon Elastic Kubernetes Service (Amazon EKS)](<https://aws.amazon.com/eks/>), [Amazon Relational Database Service (Amazon RDS)](<https://aws.amazon.com/rds/>), [Amazon ElastiCache](<https://aws.amazon.com/elasticache/>), [Amazon Elastic File System (Amazon EFS)](<https://aws.amazon.com/efs/>), and [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>). Alongside them, [AWS Secrets Manager](<https://aws.amazon.com/secrets-manager/>) handles per-session secret management. [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) handles model calls, and `monday-agent-sdk` runs inside each agent runner pod.

### Event path: From SNS to SQS to monday Builders CoWORK

Every external trigger lands in SNS, which fans out to per-team SQS queues by topic and routing key. The _monday Builders CoWORK_ , a set of SQS consumers on EKS, pulls each message, resolves which agent owns it, and hands it to the right agent runner pod.

Pub/sub plus queue gives us four things we won’t give up: retries and dead-letter queues out of the box, back-pressure when Amazon Bedrock throttles, durable replay (we re-run the last day of events against a patched build before promoting), and concurrent fan-out. If the Claude Agent SDK ships something better at the runtime layer, we delete our version. The harness stays.

### monday-agent-sdk: A thin wrapper, on purpose

The Claude Agent SDK is the runtime. We wrap it for three reasons:

  * **Provider neutrality at the call site.** Agent LLM calls route into an Amazon Bedrock model endpoint.
  * **Cold-start cost.** Agent runners ship with a warm `node_modules` and plugin caches, so the first model call goes out in usually under a second.
  * **We wanted our own harness.** The runtime is becoming a commodity. The harness is where our opinions live: how an agent is evaluated, how plugins compose, how it talks to Slack, monday, and GitHub, how its output is reviewed against monday standards. We keep the runtime someone else’s problem and make the harness ours.



### State, memory, sessions

Agents have at least three kinds of state. Putting all three in one store costs you money, latency, or correctness. The live state move to Amazon ElastiCache. Current task, run cursor, distributed lock, heartbeat, and the agent/human message log. Sub-millisecond reads, self-expiring keys. [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>) would work; ElastiCache is cheaper and faster for this shape of access. Sessions and memory get stored in Amazon Elastic File System. Each active session is a directory on a shared filesystem:
    
    
    /sessions/<session-id>/
    ├── repos/          # checked-out workspace
    ├── secrets.json    # encrypted per-session secrets
    └── messages/       # chronological event log
    
    /agents/<agent-id>/
    ├── MEMORY.md            # cross-session memory
    └── diary/2026-04-21.md  # per-day journal

Two reasons, not S3. First, the Claude Agent SDK and most plugins expect a real POSIX filesystem (`git`, `npm`, file edits), which removes a whole class of “works in dev, breaks in worker” bugs. Second, when a run resumes on a different EKS pod, that pod mounts the same EFS path and picks up where it left off.

Atlas’s daily diary is a real file. A redacted snippet:
    
    
    # diary/2026-04-21.md
    ## In progress
    - ENG-3491: rate-limit headers: verify staging, then open PR
    - ENG-3502: dependency bump: blocked on Guardrails security-boundary
      rule, waiting on standard-owner review
    ## What I learned last session
    - The accounts-api team files every new error code in the shared
      registry BEFORE the PR opens. I did it in the same PR last time
      and got reverted. Filed the registry update first this time.

That file is how Atlas resumes work the next morning _._ He reads it, recalls that the accounts-api team wants the errors-registry update filed separately, and gets to work. Memory is a file on a disk that more than one pod can mount.

Durable records go to S3. Final transcripts, snapshots, artifacts, and evals are keyed by session ID. EFS holds working memory; S3 is the audit trail.

### Amazon Bedrock as the model fabric

Amazon Bedrock is more than a place to get tokens. It’s the service that lets us run hundreds of agents without losing track of cost, safety, or capacity. Most operational requirements for deploying agents at scale are already features in Amazon Bedrock:

  * Application Inference Profiles route every model call, so cost tracking and capacity planning stay in one place.
  * One audit trail for every model call: when security or a regulator asks what agents sent where in a window, we have one place to answer.
  * Cross-Region failover when an AWS Region throttles. Agent code doesn’t notice.
  * AWS PrivateLink endpoints keep model traffic inside our virtual private cloud (VPC).



### Running on EKS

The compute fleet is Amazon EKS, one pod per active agent session, mounting the agent’s EFS workspace. Crash isolation is per-session. Auto scaling is driven by KEDA on average active sessions across pods, measured using Datadog. We run a single worker image. Repos are cached on EFS and reused across sessions. No service mesh, no orchestrator-of-orchestrators. EKS, SQS, and the cache layer carry the load.

## Five retrofits that made it all work

Architecture is the floor. The following five retrofits are what made agents useful inside a decade-old code base. None are exotic. All were unobvious until we hit them:

### Evals before model upgrades

“Looks fine” was the bar for Atlas’s early PRs. It broke once volume picked up. We added two eval layers: deterministic metrics (PRs merged, revert rate, zero-touch merge rate) per agent, and LLM-scored evals across five dimensions per PR: Intent & Decision, Execution & Artifact, Completeness & Usefulness, Instruction & Boundary, Efficiency. Both feed back into the harness. Across successive versions of Atlas we changed no model, no prompts, no human nudges, only the evals, and scores moved across every dimension.

### Memory is a file, not a vector store

Session 1: Atlas built a feature. Session 2: he had no idea Session 1 had happened. We tried context-window stuffing and vector retrieval over past transcripts. Both worked badly. What worked: a per-agent `MEMORY.md` and a `diary/YYYY-MM-DD.md` written at session end, read at session start. Plain markdown, no embeddings, no recall scoring, no agentic-RAG ceremony.

### Remote sandbox before human review

Atlas’s first dozen PRs passed local tests and broke in CI. A monday-scale code base has dependencies that only exist in real environments: feature flags, third-party services, real traffic. We gave Atlas a remote sandbox per session, and every PR auto-deploys to it. Tests, checks, and replayed production traffic run _before_ he asks for human review: failure to fix to ship again, no human in the loop.

### PR Guardrails: Automated review against monday standards

Atlas was shipping more, and human review became the bottleneck. We turned every monday engineering standard into an automated reviewer: metrics tagging, feature-flag hygiene, Datadog usage, security boundaries, database and microservice conventions, test quality, documentation. A subset are blocking. Each is wired to internal knowledge through monday’s MCP servers, so the reviewer sees the same context the standard-owner team would.

Every PR, agent- and human-authored alike, goes through Guardrails. At scale that means tens of thousands of PRs evaluated per month and hundreds of thousands of standard checks executed. Roughly one in five PRs fails at least one standard and gets bounced back, and human overrides run in the low single digits. The system manages the enforcement, not the human reviewer.

### Builders CoWORK: monday boards as the shared state layer

The last failure mode was the most expensive: agents in silos opened PRs no team owned. We added the CoWORK workspace, the user-facing surface of the same monday Builders CoWORK that routes events. An agent’s tasks, status, blockers, and handoffs now live on the same monday board as the team’s, so accountability stopped being a system problem: monday already solved it for humans.

_Agents at work in a collaborative space_

_Agents are co-workers you can ask to share information or perform tasks, like any teammate_

## From one bottleneck to the next

By late Q1 2026 the bottleneck was no longer code generation but human review: Guardrails caught what humans used to catch, but every PR still waited on a human to approve. That wall was next.

### The first of many: Morphex

Morphex is monday’s first fully autonomous engineering agent, working within the same repo, CI pipeline, Guardrails, and revert protocols as every Builder. Nineteen of every twenty Morphex PRs merge automatically, not by skipping review but by passing every gate, and an approved PR ships to production with no human in the loop. It opens more PRs a month than most engineers, and a rejected PR fails for the same reasons any engineer’s does: flaky tests, ambiguous specs, unhandled edge cases.

That 19-in-20 rate is a floor, not a ceiling. The open question: what signal tells us, ahead of time, which PRs are safe to merge without a human.

### The signal: A recent rigorous cut

Across our top PR-generating agents (no cherry-picking), the numbers break down cleanly: about three in ten PRs merged, roughly three-quarters of those with zero human edits, and a revert rate in the low single digits. Around a quarter of the PRs were caught and declined by Guardrails before reaching a human at all.

That last number matters most. Guardrails stopped a quarter of agent PRs because the system saw they weren’t ready, leaving a pre-filtered population of merges. A low-single-digit revert rate on that population is the signal that confidence-based auto-merge is workable.

### Confidence-scored automatic merging

The confidence score combines four signals available the moment the PR opens:

  * **Deterministic Guardrails outcome** : every blocking standard must pass.
  * **Per-agent eval trajectory** : recent eval-score window for _this version_ of the agent.
  * **Per-(agent × repo × change-class) historical revert rate** : near-zero reverts on dependency-bumps in a low-risk service is a different picture from a higher revert rate on monolith migrations.
  * **Sandbox outcome** : green from retrofit 3 is necessary, not sufficient.



Above the threshold, the PR merges automatically. Below it, it routes to a human with the specific failing signal called out. That’s the L2 to L3 transition: not removing humans, but removing humans from the cases where the system’s signal is strong enough that adding a human doesn’t improve the outcome. We’re driving one metric over the next two quarters: the fraction of merged agent PRs that ship without a human reviewer, holding revert rate flat or improving.

> AI engineering isn’t about creating perfect agents. It’s about building feedback loops that let imperfect agents be safely trusted while saving humans time.

## Honest close

### Why we built it the monday way

The value isn’t the runtime, that’s only a harness around the Claude Agent SDK. It lives in everything we’ve wired around it, and that wiring is monday through and through:

  * monday boards as the shared state layer: every agent’s tasks, status, and handoffs live where the rest of the business already looks.
  * monday MCP servers as the substrate Guardrails and standards plug into.
  * monday’s auth and identity, so every agent has a real Slack, GitHub, and monday user under the same RBAC as any human.
  * monday’s deploy pipeline so agent code ships through the same CI/CD as every other Builder.



Agents that share state, identity, and infrastructure with humans don’t need a separate governance layer. The existing one already applies. That makes the system auditable, reversible, and trustworthy by default, not by addition. A boilerplate system would have flattened all of that into someone else’s model.

### Three things we’d do differently

Evals should have been in the system on day one, not month nine. The score lift Atlas got from them was the headline result. We over-invested in vector stores before realizing MEMORY.md on EFS was always the right answer. And the first CoWORK lived in a separate workspace that forced humans to context-switch to see what agents were doing. Moving it onto monday boards should have been the first decision, not a later correction.

### Conclusion

We’re not open-sourcing `monday-agent-sdk`. The wrapper is small, and most of its value is the harness, which is monday-specific in ways that wouldn’t help anyone else. What we’re sharing is the architecture and the operational playbook, because the industry moves faster when the teams running production agents at scale are honest about what’s working.

If you’re building agents into your engineering teams, you’ll meet most of the same walls we have, and we’ve already crossed them. Talk to us: the monday AI Engineering team, or the Amazon Bedrock team, will be happy to share our insights.

### Learn more

  * [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) marketing page.
  * [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/>) service documentation page for the technical details behind the model calls described earlier in this post.
  * [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>) to get started.



* * *

## About the authors

### Claudio Mazzoni

Claudio is a Sr Specialist Solutions Architect on the Amazon Bedrock GTM team. Claudio excels at guiding customers through their Gen AI journey. Outside of work, Claudio enjoys spending time with family, working in his garden, and cooking Uruguayan food.

### Ofek Dayan

Ofek is a Senior Software Engineer at monday.com, focused on building the Sphera AI Agents platform. He develops the infrastructure that enables AI agents to autonomously execute software development tasks and integrate seamlessly into monday.com’s builders teams.

### Netanel Abergel

Netanel is a Director of Engineering at monday.com, where he leads AI Engineering and is building the foundation and operating model for AI-native teams. His team is transforming how software is built and operated through agentic development, AI developer platforms, CI/CD, release management, and systems architecture.

### Moran Zilberstein

Moran is a Senior Solutions Architect at AWS with over 20 years of experience in coding and architecting business-critical applications. Moran works closely with ISVs, helping them fulfill their potential on AWS platforms. For the past year, she has been partnering with Monday.com on their generative AI journey. Outside of work, Moran enjoys baking and hiking.

### Erez Drutin

Erez is a Solutions Architect at AWS with a decade of experience building and leading data-intensive and AI-powered systems. Erez works closely with ISVs, including Monday.com, helping them scale and adopt AI on AWS. Outside of work, Erez enjoys basketball and running.
