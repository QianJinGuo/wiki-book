# Data Projects

> 📊 Level ⭐⭐⭐ | 10.7KB

## Data Projects: Managing Data Assets at Netflix Scale

Netflix manages millions of tables and tens of thousands of scheduled workloads, but until recently both access and execution identity were scoped to the individual asset — one ACL per table, one human author per workflow. Data Projects moves that unit up to a durable, team-owned container that is at the same time an identity.

## 摘要

Netflix's Data Platform holds millions of warehouse tables and tens of thousands of scheduled workloads, yet access and identity were managed per asset: one ACL per table, every workflow running as the engineer who wrote it. Two failures followed — mass permission churn after each reorg, and workloads that broke when their owning human changed teams or left. Data Projects lifts the unit from the table to the *project*: a container of related assets that is also a synthetic, durable, assumable identity.

## 核心要点

- **The scale that breaks per-asset management.** Millions of tables, tens of thousands of scheduled workloads, each with its own ACL or its own human identity.
- **Failure 1 — permission churn.** When a neighboring team merges in, someone must find every ACL on every inherited table and re-decide access one by one. A significant and outsized share of support threads were exactly these mass requests, and because the self-service tooling was optional, adherence was inconsistent.
- **Failure 2 — the over-broad grant.** The cheap escape from ACL archaeology was opening tables to the whole company, defeating the purpose of having ACLs at all.
- **Failure 3 — human-identity execution.** Maestro workflows, data movement jobs, and Spark pipelines ran under an On-Behalf-Of credential such as `maestro OBO alice@netflix.com`, inheriting the union of Maestro's and Alice's permissions. Human identities are not durable, so a team change silently mutated a production workflow's permissions; swapping in a colleague started "permissions whack-a-mole."
- **Container + identity.** A Data Project is (1) an aggregate view over related tables, workflows, and assets, and (2) a synthetic, durable, assumable identity for async workloads, independent of any human's lifecycle.
- **Grants collapse to a tuple.** Users, groups, applications, and CI jobs get roles — a Contributor has read/write on the project's assets, a Viewer read-only — so a team change edits one grant instead of hundreds of ACLs.
- **Identity umbrella.** Every project gets a Netflix application identity and optionally an AWS IAM role that can be cryptographically exchanged for it; privileged members can assume the project identity from a laptop, debugging as the workload would.
- **Gravity.** Assets created under a project's identity are automatically contained by that project, making it the center of mass for everything it produces.

## 深度分析

### Why the project, not the table, is the right unit of ownership

A table is an output. Its lifecycle — who refreshes it, what it may read, what breaks if it stops — is set by the process that produces it, not by the table itself. Table-level ownership records a *fact* ("this belongs to team X") without recording a *mechanism* ("team X keeps producing it, with this identity"). Facts about ownership rot as soon as the org moves; mechanisms can be updated in one place.

Netflix's framing is explicit: hoist granularity up from the individual asset to a meaningful container, so that instead of managing permissions on 500 tables you manage them on one project. The container spans tables, workflows, secrets, and the execution identity itself, which is what makes it a viable owner — everything needed to operate the assets travels with the handover. A table cannot be handed over, because its operating context lives in whoever last touched the pipeline.

### Gravity: governance as a byproduct instead of a task

The most transferable decision in the paper is *gravity*. When a workload running under a project's identity creates an asset — a Maestro workflow materializes three tables — those tables are automatically added to the project and inherit its access controls, with no additional configuration.

This converts classification from a human obligation into a side effect of something that already happens. The alternative — ask engineers to tag and file their outputs under the right owner — is the step every governance program loses to deadline pressure, and catalogs decay into a partial, untrustworthy picture. The general rule: any governance metadata that must be manually declared should be assumed wrong within a quarter; attach it to an event the platform already observes.

### Human identity as the execution anti-pattern

The OBO pattern was not stupid — it was convenient: borrow the orchestrator's permissions, borrow the human's, take the union, run the job. The cost was simply deferred, and it compounded.

1. **The permission set became a snapshot of a person's career.** Authorization captured Alice's access at authoring time, but the workflow kept running long after that snapshot stopped being true.
2. **The failure was silent, then loud.** Nothing announced that a team change had narrowed a business-critical pipeline; it surfaced as a broken job, days of grant-sorting, and a colleague who "rarely had the same access as the previous owner."
3. **Blast radius was unbounded.** A union identity can do anything either party can do, anywhere — the widest permission surface for the narrowest need.

A durable service identity inverts all three. The identity belongs to the project, so it does not change teams, take vacation, or resign. Permissions become a reviewable artifact (grant roles) rather than an emergent property of who wrote the code. Scope narrows to the project, bounding blast radius by construction. Netflix's detail that Maestro is a formally designated Trusted Workload Manager, authorized to mint fresh identity tokens on behalf of the workloads it manages, is the part worth copying: delegation of human intent still happens, but through a controlled, auditable exchange instead of wholesale credential inheritance.

### From special cases to a function: what a boundary buys

Without a project boundary, every permission question is a special case. "What should the neighboring team have?" cannot be answered from the ACLs, because ACLs encode history, not intent — so the answer comes from tribal knowledge, and the low-friction path wins: open the table to everyone.

With a boundary, a permission becomes a function of two small inputs — (project, role) — computable by anyone, including a support engineer who has never seen the table. That is the difference between a governance *policy* and a governance *practice*: the model makes the correct action the cheapest one. It also explains why Netflix promotes the mechanism from optional tooling into a foundational part of the platform. Optional tooling yields partial coverage, and partial coverage is worth little when the failure mode is a production workflow hanging off a departed engineer's identity — the one un-migrated pipeline is precisely the business-critical one.

### The honest costs

The paper is candid: the costs are structural.

- **Ordering is unforgiving.** You must provision the destination project's permissions *before* flipping the execution identity, or you trade an identity failure for a permission failure at the same instant. Netflix is building infrastructure to track existing workloads' access patterns so it can recommend precise grants — an implicit admission that "what does this workflow actually need?" is not derivable from its definition alone.
- **Ad-hoc analysis does not fit cleanly.** Scheduled workloads have an obvious container; a one-off analyst query does not. Extending project identities to interactive Data Portal actions is future work, so a seam exists today.
- **The boundary is also a bottleneck.** A single grant surface concentrates decisions, making a project owner a review step. The answer is a rightsizing layer that trims permissions from observed usage, plus cost attribution and health indicators at the same level.
- **Container sprawl.** Onboarding says to create a project *or use an existing suitable one*, quietly assuming the hard part — knowing which project an asset belongs to — is solved.

## 实践启示

1. **Own where the producing process lives, then let outputs inherit it.** Table-level ownership records an opinion; process-level ownership records a mechanism that can be handed over and audited.
2. **Never let a production dependency point at a person.** Give workloads a service identity and delegate human intent through an exchange that is logged — not a human credential's full permission union.
3. **Make governance metadata a byproduct of execution.** If ownership or classification needs a separate registration step, it will be wrong within a quarter.
4. **Collapse permission decisions to a tuple.** If answering "who should have access" requires enumerating assets, you do not have a model — you have a spreadsheet with better branding.
5. **Ship the escape hatch, or teams route around the boundary.** Letting privileged humans assume the project identity is what keeps the model adoptable; without it, "run it as yourself" quietly returns as the default.
6. **Budget migration as a data problem, not a config change.** You need observed access patterns before you can size destination grants; a flag flip just renames the whack-a-mole.

## 相关实体

- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- [Agent 身份可移植性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md) — the agent-side counterpart: identity that survives its principal.
- [The Data Canary](https://github.com/QianJinGuo/wiki-public/blob/main/entities/the-data-canary-how-netflix-validates-catalog-metadata.md) — the other half of the same problem: trusting the metadata that describes assets.
- [Netflix Kueue 迁移](https://github.com/QianJinGuo/wiki-public/blob/main/entities/netflix-kueue-batch-compute-migration.md) — where those tens of thousands of batch jobs actually run.

→ [原文存档](https://netflixtechblog.com/data-projects-managing-data-assets-at-netflix-scale-7ca25888591e?source=rss----2615bd06b42e---4)

---

