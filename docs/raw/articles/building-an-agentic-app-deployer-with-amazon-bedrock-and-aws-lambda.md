---
title: "Building an agentic app deployer with Amazon Bedrock and AWS Lambda"
created: 2026-08-07
updated: 2026-08-07
type: raw
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-an-agentic-app-deployer-with-amazon-bedrock-and-aws-lambda
ingested: 2026-08-07
feed_name: AWS China ML
source_published: 2026-08-06
sha256: 08a56cbb91b6990cb9f0d9fd8875f8e692988d2fa9faba38fe1a511a4623d010
---

# Building an agentic app deployer with Amazon Bedrock and AWS Lambda

Many enterprises have a long tail of internal tools that never get built. A team needs a shipping-cost calculator, a straightforward intake form, a small dashboard over a spreadsheet, but each one requires a developer, a backlog slot, and a deployment pipeline. The tools are too small to prioritize and too numerous to ignore.

[PDI Technologies](<https://pditechnologies.com/>) serves the convenience retail and petroleum wholesale industries, helping businesses around the globe increase efficiency and profitability by securely connecting their data and operations. PDI has 40 years of experience, a workforce of approximately 4,000 employees, and serves over 200,000 customer locations across more than 200 countries and territories. PDI recognized that traditional deployment pipelines were blocking non-technical teams from shipping the tools they needed.

To close that gap, PDI Technologies built PDI Brew. A non-technical employee describes the tool they want in plain English, and within seconds they receive a fully provisioned, multi-tenant web application, protected by single sign-on (SSO) and running on AWS. No Git, no terminals, and no DevOps knowledge required. The person who needs the tool is the person who ships it. Because every app inherits the same platform, each one can opt into a governed AI capability (chat, summarize, classify) backed by [Amazon Bedrock](<https://aws.amazon.com/bedrock/>). This occurs without its author ever touching a model endpoint or an API key.

In this post, we show how PDI Technologies built PDI Brew around an [agentic provisioning pattern](<https://aws.amazon.com/blogs/compute/effectively-building-ai-agents-on-aws-serverless/>). A planning agent captures user intent as a structured manifest using a skill inside an AI assistant (for example, Claude, ChatGPT, or Claude Code) or as an Amazon Bedrock model invocation inside an AWS trust boundary. A provisioning agent running on [AWS Lambda](<https://aws.amazon.com/lambda/>) then decomposes that manifest, classifying the workload, selecting tools, and [orchestrating the creation of every downstream AWS resource](<https://aws.amazon.com/blogs/machine-learning/streamline-workflow-orchestration-of-a-system-of-enterprise-apis-using-chaining-with-amazon-bedrock-agents/>) in one request. We then show how the same platform exposes in-app AI as a governed, least-privilege gateway to Amazon Bedrock. We describe the architecture, the security model, long-running provisioning steps inside Lambda, the AI guardrail-and-budget design, and the cost profile of running this system at scale.

## Prerequisites

To understand this architecture, familiarity with the following AWS services is helpful: AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon Simple Storage Service (Amazon S3), Amazon CloudFront, and Amazon Bedrock. Experience with Microsoft Entra ID (formerly Azure AD) and MSAL.js is useful for the authentication sections. Verify you have the AWS Command Line Interface (AWS CLI) installed and configured with credentials that have sufficient permissions to create AWS Identity and Access Management (IAM) roles and policies if you plan to implement a similar pattern in your own environment.

## Challenges with internal tools

Traditional internal-tool delivery couples a straightforward business need to a full software delivery lifecycle. Even a single-page calculator inherits the cost of a repository, a build pipeline, an authentication integration, a hosting decision, a TLS certificate, DNS, logging, and ongoing maintenance. The result is a permanent queue of small tools that are always deprioritized behind revenue-generating features.

We wanted a system with four properties:

  * **Intent in, application out.** The requester describes the tool. The platform provisions it. No handoff to engineering.
  * **Secure and governed by default.** Every app inherits enterprise SSO, scoped IAM, HTTPS, and centralized observability. There is no “insecure” path.
  * **Serverless and scale-to-zero.** Hundreds of small apps must cost almost nothing when idle, with no shared servers to patch or capacity to plan.
  * **AI without a free-for-all.** Apps can use generative AI, but only through a controlled path with guardrails, quotas, and a full audit trail. Never by embedding their own model keys.



## Solution overview

“Agentic” does not need to mean “a large language model in the request path for every decision.” We define an agent as a system that takes a goal, decomposes it, selects tools, and acts toward that goal. PDI Brew separates the two halves of that definition into two agents with very different trust profiles.

The planning agent captures intent. It interviews the user, helps them refine what they want, generates the application front end, and critically emits a structured deploy manifest: a JSON description of the user’s intent (app name, type, data schema, and access-control settings). The planning logic is packaged as the Vibe App Builder skill, which runs inside whatever AI assistant the employee already uses. Running the planner in the assistant gives users a rich conversational experience in a tool they already have open and keeps the surface area on the AWS side small.

The provisioning agent is an [AWS Lambda](<https://aws.amazon.com/lambda/>) function. It receives the manifest and acts as a deterministic, auditable, tool-using orchestrator. It validates the request, classifies the workload, and chooses a provisioning path. It then calls AWS and Microsoft Graph APIs as tools, handles long-running steps through asynchronous self-invocation, and returns a live URL. Putting the provisioning logic in Lambda rather than in a chat session is deliberate: provisioning is exactly the kind of workload where every decision must be logged, reproducible, and free of hallucination.

## A pluggable planner: bring your own assistant

Intent can come from anywhere, so the planner is designed as a pluggable layer with two interchangeable paths. A single environment variable (`PLANNER_MODE`) selects which one is active, and both paths emit the identical deploy manifest, so everything downstream is unchanged.

Path A — the Vibe Skill in any AI assistant. The Vibe App Builder skill (hereafter, the Vibe Skill) packages the planning logic and runs inside whatever AI assistant the employee already uses. The assistant interviews the user, generates the front end, and produces the manifest. The planner runs outside AWS, which gives users a rich conversational experience in a tool they already have open.

Path B — [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) inside the AWS trust boundary. For channels like Teams, a web form, or an IDE, the request is sent to Amazon Bedrock. A Bedrock model invocation (`InvokeModel`) acts as the planner: it classifies the workload, emits the same manifest, and can validate or repair the data schema before provisioning. This path operates entirely inside AWS, so every decision is captured in [AWS CloudTrail](<https://aws.amazon.com/cloudtrail/>) and tied to a model-invocation ID, and no intent data leaves the AWS boundary. This is important for teams with strict data-residency requirements.

One contract, one provisioning agent. Because both planners emit the same manifest JSON, the provisioning agent on Lambda and the entire per-app runtime are identical regardless of path. Adding the Bedrock path was an additive change, not a rewrite. And `PLANNER_MODE` can be pinned per organization, workspace, or user, so one enterprise can require the Bedrock path while another keeps the in-assistant experience. It also leaves a clean forward path: the Bedrock invocation can later be replaced with a [richer managed agent runtime](<https://aws.amazon.com/blogs/machine-learning/getting-started-with-amazon-bedrock-agents-custom-orchestrator/>) without touching Path A or the provisioning agent.

## Architecture

The following diagram illustrates the end-to-end architecture. It has three layers: a pluggable intent and planning layer, a unified agentic provisioning runtime, and a per-app runtime, supported by shared edge, identity, and observability services.

The following walkthrough traces a request through each layer:

  1. In the **intent and planning layer** , an employee describes the tool in plain English. Depending on `PLANNER_MODE`, the planner is either the Vibe Skill running in their assistant (Path A) or an [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) invocation behind a channel like Slack or Teams (Path B). Either way, the planner emits the same deploy manifest as JSON.
  2. The manifest is sent over HTTPS to `POST /deploy` on [Amazon API Gateway](<https://aws.amazon.com/api-gateway/>), authenticated with an Entra ID bearer token (MSAL.js). Because both planner paths converge on the same endpoint and contract, everything from here on is identical.
  3. API Gateway invokes the **Deploy Lambda (the provisioning agent)**. It validates the Entra JWT (tenant and expiry), enforces that an access-control mode is present, and atomically checks slug ownership in the app registry table.
  4. The agent **classifies the workload** (static (a calculator or chart), full-stack (needs data persistence) and selects the matching provisioning path.
  5. For a **static app** , the agent wraps the HTML in an Entra authentication shell, uploads it to [Amazon S3](<https://aws.amazon.com/s3/>), invalidates the [Amazon CloudFront](<https://aws.amazon.com/cloudfront/>) cache, and registers the app in [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>).
  6. For a **full-stack app** , the agent additionally provisions a per-app DynamoDB table, a per-app [AWS Lambda](<https://aws.amazon.com/lambda/>) function with a scoped [AWS IAM](<https://aws.amazon.com/iam/>) role, and a per-app API Gateway. It then injects the new API URL into the front end before wrapping and uploading it.
  7. Long-running steps (creating a Microsoft 365 group) are handled by **asynchronous self-invocation** : the agent invokes a second copy of itself as a background task so the user’s request returns quickly.
  8. End users reach the live app over HTTPS through CloudFront, where a [CloudFront Function](<https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html>) routes `<slug>.domain` to the correct app in S3. Every app sits behind Entra single sign-on and is observable in [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>).



## How the provisioning agent works

The provisioning agent performs two core functions: classifying workloads and orchestrating long-running provisioning steps.

### Tool selection and workload classification

The Deploy Lambda treats the AWS SDK for JavaScript v3 and the Microsoft Graph API as its tool belt. Based on the manifest, it decides which tools to call and in what order. A static app touches only S3, CloudFront, and the DynamoDB registry. A full-stack app additionally drives DynamoDB and API Gateway, and, for capability-bearing apps, Lambda and IAM. Access control reaches into Microsoft Graph to create and manage the app’s M365 group. The classification is deterministic and fully logged: the same manifest always produces the same plan.

### Long-running work inside Lambda

Some provisioning steps take longer than a user wants to wait on a synchronous request, notably directory propagation after creating an M365 group. Rather than hold the request open, the agent uses asynchronous self-invocation: it calls `lambda:InvokeFunction` on itself with an `Event` invocation type, returns the live URL immediately, and lets the background copy finish the slow work. This is the serverless equivalent of an agent’s “background task” pattern, kept comfortably inside the Lambda execution envelope.

## Per-app runtime: a dual-tier compute model

Not every app needs its own compute. Most full-stack apps are straightforward create, read, update, and delete (CRUD) operations over their own DynamoDB table, so they run on a shared, platform-managed CRUD Lambda fronted by a weighted alias with provisioned concurrency. This provides one warm, audited code path serving many apps, with an automatic canary-rollback guard. An app graduates to its own per-app Lambda with a dedicated, scoped IAM role only when its manifest declares a capability from a closed allowlist (for example, sending email, calling a specific external HTTPS domain, or reading from a designated data source). This graduation requires an admin approval step. The approval is backed by static analysis of the submitted code and drift detection on the resulting IAM role. The default path is shared and cheap. The privileged path is per-app, least-privilege, and gated.

## Governed in-app AI

Deployed apps increasingly want AI features: summarize a record, classify an intake form, answer a question over the app’s data. The naive path is for each app to embed a model vendor’s SDK and an API key. This scatters credentials, defeats central governance, and makes spend impossible to control. PDI Brew takes the opposite approach: AI is a platform capability reached through one endpoint, not an integration each app owns.

Three controls run on every call, before and after the model. First, a mandatory [Amazon Bedrock Guardrail](<https://aws.amazon.com/bedrock/guardrails/>) handles personally identifiable information (PII) redaction, content filtering, and prompt-injection defense on every invocation. The app cannot turn this off. Second, a **12-counter atomic budget** enforces spend limits. Before any Bedrock call, a single DynamoDB `TransactWriteItems` reserves spend across four scopes (global, app, user, and app-user), each over three windows (daily, weekly, monthly). A breach in any of the twelve counters short-circuits the request with `429 Too Many Requests` and a structured body naming the limit that fired. This makes runaway cost, whether from a bug, a loop, or abuse, a bounded, observable event rather than a surprise invoice. App owners can be granted higher app-scoped budgets by an admin. The global and per-user ceilings cannot be widened by owners. Third, a **two-tier terminate switch** allows an admin disable always beats an owner enable, and a single platform-wide flag can disable AI everywhere, so the platform team retains a hard stop-switch independent of any app.

Every call is audited (UPN, app, model, token counts, estimated cost, and guardrail outcome), so spend and usage are attributable to an app and a user, end to end.

## Security and least privilege

Because the agent provisions infrastructure, its security model is the most important part of the design. Several principles govern it.

**Defense in depth at the IAM layer.** The provisioning agent holds the broad permissions it needs to create resources. But the per-app Lambda functions it creates inherit a separate, scoped role that can reach only DynamoDB tables prefixed with `pdi-brew-{env}-app-`. The agent never grants a deployed app more privilege than that app needs, so a bug in one tenant’s code cannot read another tenant’s data.

**Identity on every path.** There is no unauthenticated route to a deployed app. The deploy API validates an Entra JWT before provisioning, and every generated app is wrapped in an MSAL.js authentication shell that checks **Microsoft 365 group membership** through Microsoft Graph on each visit.

_Note on identity provider: this architecture uses Microsoft Entra ID with MSAL.js for authentication rather than Amazon Cognito. This is a deliberate design choice driven by PDI Technologies’ existing enterprise SSO requirements. PDI’s workforce already authenticates through Microsoft Entra ID. Integrating directly with their established identity provider reduced friction for end users and aligned with existing security policies. For organizations without an existing identity provider preference,[Amazon Cognito](<https://aws.amazon.com/cognito>) offers an alternative that integrates natively with AWS services and supports similar federated sign-in flows._

AI is least-privilege by construction. The AI Lambda role grants `bedrock:InvokeModel` and `InvokeModelWithResponseStream` scoped by resource to the allow-listed model ARNs (not `*`), and nothing else in the account can call Bedrock. Lambda functions have no Bedrock permission and reach AI only over HTTPS through the gateway, where guardrails and budgets apply.

Additional controls reinforce the security posture across every deployed app. Amazon S3 public access is fully blocked. Only CloudFront (through Origin Access Control) can read objects. CloudFront enforces redirect-to-HTTPS with HSTS and a strict Content-Security-Policy. API Gateway rate-limits the deploy endpoint (50 requests per second sustained, 100 burst). Amazon S3 versioning and DynamoDB point-in-time recovery protect against data loss, and prevent-destroy lifecycle rules guard the registry and bucket.

## Serverless-native multi-tenancy

Every deployed app is a tenant, and the architecture gives each tenant its own subdomain (routed by a CloudFront Function), its own DynamoDB table where applicable, and a Lambda role scoped to its own data. There is no shared compute and no noisy-neighbor risk, and because every component is serverless, each tenant scales to zero independently when idle. Adding the hundredth app costs essentially nothing until someone uses it.

## Observability

The provisioning agent and every per-app Lambda function write structured JSON logs to Amazon CloudWatch. Custom metrics in the `PDIBrew` namespace track deploys, app views, authentication failures, group and list creation, and provisioning latency. An admin panel queries Amazon CloudWatch Logs Insights for per-app activity, and a Grafana dashboard visualizes platform-wide usage. Provisioning calls appear in AWS CloudTrail, and when the Bedrock planner (Path B) is active, each planning decision is also logged as an `InvokeModel` call in CloudTrail, giving an end-to-end audit trail from intent to provisioned resource.

## Cost

Every service in the stack is pay-per-use with no fixed cost, so the platform’s price tracks actual usage rather than the number of apps deployed.

**Service** | **You pay for**  
---|---  
Amazon S3 | Storage ($0.023/GB) + requests  
Amazon CloudFront | Data transfer + requests  
AWS Lambda (deploy + per-app) | Invocations + duration  
Amazon DynamoDB | On-demand read/write request units  
Amazon API Gateway | $3.50 per million requests  
Amazon Bedrock (Path B planner) | Per-token InvokeModel pricing, per deploy  
  
In practice, a team of 20 running about 10 apps costs roughly **$5–$15 per month**.

## Results

Since its launch, PDI Brew has scaled to serve hundreds of applications across the organization, representing significant cost savings compared to traditional subscription tooling. What makes this remarkable is that deployment is no longer confined to engineering. Non-developers now independently author and deploy applications, tracked through Entra UPN tagging, demonstrating how AI-powered tooling has broadened authorship well beyond traditional development teams. In PDI Technologies’ experience, what previously took weeks (cycling through tickets, infrastructure provisioning, and build processes) dropped to minutes, as measured by deploy Lambda timestamps. The cost economics are equally striking. The platform has achieved substantial cost efficiency, with per-app costs at idle significantly lower than traditional subscription-based tools’.

Operationally, the platform has achieved true self-sufficiency. Deployers manage and roll back their own applications independently through S3 version-controlled hosting, with no dependency on other teams for ongoing maintenance. App longevity is tracked through AppViews over time, allowing PDI to distinguish durable business tools from one-off experiments and measure lasting organizational value.

The platform has also unlocked use cases that were previously impossible with subscription-based tools. Because PDI Brew runs entirely within PDI’s own cloud and identity boundary, it can serve regulated and sensitive data workloads where data cannot leave the organization’s perimeter. AI is delivered as a built-in platform capability: Amazon Nova [models available in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html>) are exposed with shared guardrails and per-app token limits, eliminating the per-project model procurement overhead that typically slows AI adoption across enterprises.

## Conclusion

PDI Brew shows that an agentic provisioning pattern maps cleanly onto serverless AWS primitives. A pluggable planner (the Vibe Skill in any assistant, or Amazon Bedrock inside the AWS trust boundary for channels like Slack and Teams) turns plain-English intent into a structured manifest. A provisioning agent on AWS Lambda then turns that manifest into a fully provisioned, authenticated, multi-tenant application. The stack uses AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon S3, and Amazon CloudFront as the building blocks of a platform-as-a-product. The same properties that make Lambda a great API runtime (stateless, scaled-to-zero, IAM-scoped, and observable) make it a great runtime for provisioning agents, where determinism and auditability matter most.

Many organizations sitting on a backlog of internal tools can reproduce these patterns: decouple the planner from the provisioning agent behind a single manifest contract, so intent can arrive from any assistant or channel. Keep provisioning deterministic and least-privileged, and let serverless handle multi-tenancy and scale-to-zero. To get started on building agents on serverless AWS, see the [AWS Prescriptive Guidance](<https://aws.amazon.com/prescriptive-guidance/agentic-ai/>) on agentic AI architectures, [AWS Samples](<https://github.com/aws-samples/>), [Amazon Bedrock Developer Guide](<https://docs.aws.amazon.com/bedrock/latest/userguide/>), and the [AWS AI/ML Blogs](<https://aws.amazon.com/blogs/machine-learning/>).

* * *

## About the authors

### Ramesh Kadali

Ramesh is a Senior Director of Platform Engineering at PDI Technologies, where he leads internal developer platforms spanning cloud infrastructure, DevOps automation, and AI systems architecture. His current focus is driving PDI Platform Engineering towards — architecting multi-provider AI gateway infrastructure, building autonomous agentic pipelines for platform operations, and embedding AI-driven tooling across PDI’s internal developer ecosystem.

### Mahesh Lagishetty

Mahesh is a Senior Vice President of Engineering at PDI Technologies, where he owns end-to-end technology execution across platform architecture, data ecosystems, DevOps/SRE, and AI-driven innovation. His current focus is PDI’s shift from AI-assisted to agentic engineering — building an agentic SDLC with autonomous remediation pipelines internally, and embedding human-in-the-loop AI agents into PDI’s enterprise products.

### Medha Aiyah

Medha is a Solutions Architect at AWS. She graduated from the University of Texas at Dallas with an MS in Computer Science, with a focus on AI/ML. She supports ISV customers in a wide variety of industries, by empowering customers to use AWS optimally to achieve their business goals. She is especially interested in guiding customers on ways to implement AI/ML solutions and use generative AI. Outside of work, Medha enjoys hiking, traveling, and dancing.
