---
source: rss
source_url: https://netflixtechblog.com/data-projects-managing-data-assets-at-netflix-scale-7ca25888591e?source=rss----2615bd06b42e---4
ingested: 2026-07-05
feed_name: Netflix Tech Blog
source_published: 2026-06-19
sha256: "d6eb345c84fea97f338214b12244468ca554ad692040f499eada74638e620a39"
---

# Data Projects: Managing Data Assets at Netflix Scale

#### _By_[ _Amer Hesson_](<https://www.linkedin.com/in/amer-hesson-0886a5a5/>) _,_[_Marcelo Mayworm_](<https://www.linkedin.com/in/mayworm/>) _,_[_James Mulcahy_](<https://www.linkedin.com/in/james-mulcahy-10493518/>) _, and_[ _Brittany Truong_](<https://www.linkedin.com/in/brittany-truong-a35b54bb/>)

### The Problem: Managing Assets at Netflix Scale

Netflix’s Data Platform is vast. We have millions of tables in our data warehouse and tens of thousands of scheduled workloads running across our orchestration systems. Behind each of these assets sits an engineer, a team, or an initiative — and behind each of those sits a set of decisions about _who_ can access _what_ , and _how_ those workloads execute day after day.

For years, the tools we used to manage access and identity for these assets operated at the granularity of the individual asset. Every table had its own Access Control List (ACL). Every workflow ran under the identity of the engineer who authored it. In a workforce that is fluid, where people change teams, change roles, and occasionally leave the company, this fine-grained model broke down in two persistent, painful ways.

### Problem 1: Permissions that can’t keep up with organizational changes

Imagine you’re on a team that owns a few hundred tables. Your org restructures, a neighboring team merges into yours, and you inherit another few hundred. Now you have to find every ACL on every table, figure out who should still have access, and update them one by one. Multiply that by every reorg across every team across the company. The result? Two failure modes:

  1. **The support team gets flooded.** A significant and outsized share of support threads were requests to update table permissions en masse in response to org changes. While self-service tooling and best practices are in place to manage this, adherence is inconsistent. Data Projects addresses this by promoting the solution from optional tooling to a foundational part of the data platform.
  2. **Access gets granted far too broadly.** Rather than maintain fine-grained ACLs, teams would often open up table access to the whole company. This defeated the purpose of having ACLs in the first place.



### Problem 2: Workloads tied to human identities

Scheduled and asynchronous workloads — [Maestro](<https://netflixtechblog.com/maestro-netflixs-workflow-orchestrator-ee13a06f9c78>) workflows, data movement jobs, Spark pipelines — need an identity to run as. Historically, that was a _human_ : whoever authored the workflow.

Human identities are not durable. People change teams, get new responsibilities, and leave the company. When they do, their permissions change, and the workflows running under their identity start to fail. The only fix was to swap in a colleague’s identity, which inevitably had _different_ permissions, kicking off a “permissions whack-a-mole” as each fix surfaced the next missing grant. And then, eventually, that colleague would also move on, and the cycle would repeat.

### Enter Data Projects

We introduced Data Projects to tackle both problems head-on. At its core, a Data Project is two things:

  1. **A container to manage and view a set of related assets in aggregate** : tables, workflows, and other data assets grouped under a single logical umbrella.
  2. **A synthetic, durable, and assumable identity** : one that asynchronous and scheduled workloads can execute under, independent of any human’s lifecycle.



You can think of it as hoisting the granularity of management up from the individual asset to a meaningful container: the _project_. Instead of managing permissions on 500 tables, you manage them on one project that contains those 500 tables.

While the initial focus has been access and identity, the abstraction has applications well beyond those concerns. That broader potential is part of what makes it worth investing in.

**Figure 1a**. Individual assets, each managed in isolation, with per-asset access controls and per-person ownership.**Figure 1b**. These assets are logically grouped into projects for easier management.

### Grants and Roles

Each Data Project has a set of grants managed by the owning team. Different identity types can be added as grants: users, groups, applications, and continuous integration (CI) jobs. Each grant has a role that determines what the grantee can do within the project. For example, a _Contributor_ has read/write access to the project’s assets, while a _Viewer_ has read-only access. These roles roll up neatly — instead of rewriting hundreds of ACLs when someone joins or leaves a team, you update a single project grant.

### The Identity Umbrella: Netflix and IAM

Every Data Project is provisioned with a Netflix application identity, and optionally an AWS IAM role. This is the “identity umbrella” that makes workloads durable:

  * The project’s **Netflix identity** is what executes the project’s async workloads (e.g. Maestro workflows). It belongs to the project, not to any person.
  * The project’s **IAM role** supports specialized use cases in AWS like Spark jobs on Amazon EMR. Crucially, the IAM role can be exchanged for the project’s Netflix identity in a cryptographically secure way.



Members with privileged roles can also assume the project’s Netflix identity. This is enormously useful for testing and troubleshooting from a development context like a laptop or a notebook — you get to run commands _as the project_ , exactly as the scheduled workload would.

### Gravity

One of the more elegant properties of Data Projects is what we call _gravity_. When a workload running under a project’s identity creates a new asset — say a Maestro workflow creates three tables — those assets are automatically added to the project as contained assets. The project becomes the center of mass for everything produced under its identity. You get organization for free as a side effect of how the platform already works, eliminating future challenges of discovering relevant assets and gaining access to them.

### Securing Data Workflows with Data Projects

Maestro is Netflix’s primary workflow orchestrator for batch analytics, covering scheduled ETL pipelines, data movement jobs, ML training, and much more. Because workflows can run on schedules without the original user present, Maestro is designated a Trusted Workload Manager (TWM), formally authorized to mint fresh identity tokens on behalf of the workloads it manages.

That identity matters everywhere. A single workflow execution may be checked against table ACLs in the Secure Data Warehouse, authorization policies for Netflix resources, and IAM policies for AWS — all in a single run. If the identity is fragile, the whole workflow is fragile.

### The Problem with User-Tied Identity

The standard pattern was to run workflows under an On-Behalf-Of (OBO) credential — for example, _maestro_ OBO _alice@netflix.com_. This gave the workflow the union of Maestro’s and the human’s permissions, but in doing so it also bound the workflow’s permissions to that person’s. When they changed teams or left Netflix, the workflow broke. A colleague might take over ownership, but they rarely had the same access as the previous owner, so the workflow would stay broken for days while permissions were sorted out. At Netflix’s scale, with tens of thousands of scheduled workloads, many of them business-critical, this was unsustainable.

### Data Projects: Durable Identity

Data Projects solves this by replacing user-tied identity with a durable, team-owned Netflix application identity: one that doesn’t change teams, go on vacation, or leave the company. Each project groups related workflows, tables, secrets, and other assets under a single consistent identity, and Maestro validates the caller’s access to the project before executing any workflow under it.

The downstream improvements are as follows:

  * Tables created during execution are automatically associated with the project’s identity through _gravity_ , inheriting its access controls without additional configuration.
  * Secrets are scoped to project policies, so ownership transfers no longer strand credentials.
  * Access is managed once at the project level, replacing fragmented per-user grants across every asset the workflow touches.



The result is a workflow identity model that is stable, auditable, and built to survive the organizational changes inevitable at any company operating at this scale.

### Success Stories

Many Data Projects have already grown to contain tens of thousands of assets in production. A couple examples are highlighted below:

  * **Streaming Quality of Experience** : A core observability pipeline tracking quality of experience (QoE) metrics whose continuity used to depend on whichever engineer happened to own the underlying workflows. Now it runs under the project’s identity, stable regardless of team membership changes.
  * **Member Analytics** : Analytical models and ETL workflows for member data products. A concentrated set of business-critical analytics whose access is managed at the project level rather than across hundreds of individual tables and workflows.



More broadly, we’ve seen Data Projects adopted as the organizing principle for entire analytics domains. Where teams previously maintained their own access policies, ad-hoc grant lists, and tribal knowledge about “who should have access to what,” the project is now the single answer.

### Using Data Projects

Onboarding workflows onto Data Projects is a matter of:

  1. Creating a project for the logical grouping of assets (or using an existing suitable one).
  2. Granting the right people and groups the appropriate roles.
  3. Configuring the workflow to run with the project’s identity.



Thanks to gravity, new assets produced by project workflows land in the project automatically. Migrating existing workflows can be a challenge as it requires setting up the Data Project with the appropriate permissions before changing its execution identity. We are actively working on infrastructure to track the access patterns of existing workflows so that we can recommend precise permission updates for the destination project. Our goal is to make the Data Project the de facto option for executing any kind of asynchronous workload.

### What’s Next

Data Projects started as an Analytics Platform initiative, a response to specific pains in the data warehouse, but the underlying ideas are not unique to data. We see a potential future where **Projects** (not just _Data_ Projects) are a first-class platform concept spanning data assets, software assets (GitHub repositories, Spinnaker applications, Docker images), and even studio assets (production content, pipelines, and transformations).

We’re also investing in:

  * **Rightsizing** : we’re integrating a layer on top of our authorization policies that automatically rightsizes permissions based on actual usage patterns, proactively eliminating unnecessary access and preventing “permission creep”.
  * **Hoisting beyond access and identity** : the project is a natural unit for surfacing other concerns at the aggregate level — cost attribution, health indicators, and more.
  * **Ad-hoc use case integrations** : extending project identities beyond scheduled workloads to cover interactive, on-demand actions like running a query through the Data Portal.
  * **Activity logs and audits** : a unified timeline of grant changes, asset changes, and workflow versions at the project level.



### Conclusion

Data Projects is an answer to a simple observation: at Netflix’s scale, the unit of identity and access management can’t be the individual asset or the individual human. It has to be something larger, something durable, something that matches the way teams actually think about the work they own.

A project is that unit. And as we continue to generalize the concept beyond the data warehouse, we expect it to become one of the foundational primitives of how engineering at Netflix is organized, not just how data is organized.

### Acknowledgments

We would like to express our gratitude to the following individuals for their contributions to this effort: Ryan Bordo, Doug Clark, Luke Fernandez, Sarrah Figueroa, Ankit Gupta, Brian Hoying, Ye Ji, Abhishek Kapatkar, Anmol Khurana, Matheus Leão, Hechao Li, Raymond Liu, Alice Naghshineh, David Noor, Anjali Norwood, Javier Garcia Palacios, Kunaal Parekh, Brandon Quan, Andrew Seier, Jason Seo, and Ethan Zhang.

If you are interested in helping us solve these types of problems and helping entertain the world, please take a look at some of our open positions on the [Netflix jobs page](<https://jobs.netflix.com/>).

* * *

[Data Projects: Managing Data Assets at Netflix Scale](<https://netflixtechblog.com/data-projects-managing-data-assets-at-netflix-scale-7ca25888591e>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
