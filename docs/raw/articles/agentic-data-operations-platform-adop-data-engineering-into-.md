---
title: "Agentic Data Operations Platform (ADOP): Data engineering into hours"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/agentic-data-operations-platform-adop-data-engineering-into-hours
ingested: 2026-08-22
feed_name: AWS China ML
source_published: 2026-08-21
sha256: 480ab8de32d31b6958b190e493b7a73fdb9500cbc6d983da8b977b7bc4e2a9ba
---

Data engineering teams routinely spend weeks standing up a single new data source: writing ETL, hand-writing quality checks, updating semantic models, and validating compliance. The [Agentic Data Operations Platform (ADOP)](<https://github.com/aws-samples/sample-Agentic-Ai-Data-Operations>) on AWS is designed to significantly accelerate that timeline. It’s a reference architecture built on Amazon Bedrock and your AI coding tool of choice. Specialized AI agents automate the full Bronze to Silver to Gold lifecycle, with configurable controls designed to support your data governance and regulatory compliance efforts.  
  
For Heads of Data Engineering, three things change. Engineers stop spending the majority of their time on pipeline plumbing and start shipping data products. Compliance moves from a downstream gate to an inline control applied at onboarding time. And your architecture, not the model, governs how every AI coding tool (Claude Code, Kiro, Cursor, Codex) interacts with your data systems.

This blog post is for VPs of Engineering, Chief Data Officers, and Data Platform Directors, with implementation detail for platform engineers later in the post.

  
Figure 1: Six data engineering challenges that ADOP addresses

## The agents in dev, artifacts in prod

This is the design choice that separates ADOP from a typical agentic platform pitch.

ADOP is a _build-time accelerator_ , not a runtime dependency. Agents run in development environments where they reason, propose, and generate: ETL code, quality checks, semantic layer definitions, regulation controls. Engineers review the output. Continuous integration and continuous delivery (CI/CD) promotes the generated artifacts (deterministic PySpark, SQL, Airflow DAGs, IAM and Cedar policies) into staging and production. In ADOP’s default pattern, production runs deterministic artifacts without calling a model. Organizations that require model-in-the-loop inference at runtime can extend this architecture using Amazon Bedrock endpoints, but the generated pipeline code itself remains static and auditable.

  
Figure 2: ADOP token economics and return on investment

**How ADOP differs from general-purpose coding assistants:** Those are general-purpose coding assistants: brilliant, but open-ended. Point them at a data platform and every engineer gets a different architecture on a different day. ADOP is opinionated on purpose. It wraps those same models in:

  * **A narrowed lane** – data-engineering skills and prompts, not “anything you can type.”
  * **Company philosophy baked in** – your standards live in the design, not in someone’s memory.
  * **No large language model (LLM) freelancing on architecture** – the model fills in the blueprint. It doesn’t draw it.
  * **Policy and regulation guardrails** – apply controls that support your compliance efforts at build time, not only at review.
  * **One onboarding flow for the whole enterprise** – every source lands the same way, every time.



General tools make a developer faster. ADOP makes every developer consistent.

**How ADOP relates to Amazon Bedrock AgentCore:** Amazon Bedrock AgentCore is a platform to build, connect, and optimize agents at scale, with any framework or model. ADOP runs agents in development and ships deterministic artifacts to production. Both are valid AWS aligned patterns. ADOP optimizes for cost predictability and audit posture on regulated data workloads.

## Use cases

ADOP applies wherever data engineering velocity is throttled by manual onboarding and compliance overhead. Common patterns include:

  * **Enterprise data onboarding at scale** – describe a new source in natural language. Agents handle schema inference, ETL, quality checks, and semantic layer updates.
  * **Regulated pipelines in healthcare and financial services** – configurable controls designed to help you address regulatory requirements in your industry, applied per dataset through dedicated governance prompts. Customers are responsible for determining their own compliance.
  * **AI-ready Gold layers** populated and maintained automatically for business intelligence and machine learning (ML) features.
  * **Multi-tool AI development governance** – Claude Code, Kiro, Cursor, and Codex all operate from the same architectural contract.



## Architecture

ADOP is an AI-powered coding framework that builds end-to-end data pipelines on AWS and multi-cloud environments. It launches a Data Onboarding Agent on Claude Code through Amazon Bedrock, using Claude Code’s Dynamic Workflow feature to spawn specialized sub-agents for each stage of pipeline construction.

  
Figure 3: ADOP architecture overview, with the Data Onboarding Agent spawning specialized sub-agents on Amazon Bedrock

  
Figure 4: ADOP lakehouse layers from Bronze to Silver to Gold, with built-in compliance controls

**Sub-agents** – Sub-agents handle metadata generation, data ontology deduction, data quality checks, ETL transformations, and orchestration (Airflow or AWS Step Functions). Requirements are enriched iteratively through conversational interaction with user persona, and every artifact is validated locally before deployment to AWS with human-in-the-loop approval.

**Decision engine (AI clone)** – The Decision Engine acts as an AI-encoded version of your enterprise architect, embedding your organization’s guidelines, technology standards, and design philosophy directly into the build process. This helps promote consistency across builders, alleviating the fragmentation that occurs when teams use general-purpose coding tools without shared guardrails.

**Guardrails** – Sub-agents are constrained by the architectural contract: tool routing rules, Cedar authorization policies, invariants, and inline compliance prompts. While the reference implementation targets AWS, the framework extends to other services with a CLI or Model Context Protocol (MCP) interface, supporting hybrid and multi-cloud environments.

**Data compliance** – Three capabilities round out the architecture. ADOP helps you apply compliance-related controls: one regulation prompt per governance framework can be applied at onboarding, so legal reviews a prompt file, not application code. You remain responsible for validating that controls meet your regulatory obligations.

**Agent observability** – Every agent decision is traced through AgentTrace (intent, tool selected, outcome, cost) and publishable to Amazon CloudWatch or an OpenTelemetry sink for audit. And the entire stack runs locally in dev by default. When scale demands it, promote to AgentCore runtime, a capability of Amazon Bedrock AgentCore, with no change to the architectural contract.

**Responsible AI and data handling** – Agents might process regulated or personally identifiable data during development. Customers should review their data-handling practices, apply appropriate access controls, and validate that agent behaviors align with their organization’s responsible-AI policies before promoting artifacts to production.

**How to get started in two steps**

  1. Start by cloning the repository. 
         
         git clone https://github.com/aws-samples/sample-Agentic-Ai-Data-Operations.git

  2. Upload a dataset to Amazon Simple Storage Service (Amazon S3) or local storage, then run a modified prompt.



**Note:** The following example uses fictitious data, bucket names, and field references for illustration purposes only. No real personally identifiable information (PII) is represented. This example doesn’t constitute regulatory compliance guidance or legal advice.
    
    
    /onboard-workflow
    
    Onboard attendance data from s3://amzn-s3-demo-source-bucket/demo_landing/attendance.csv into Silver with dedup on (employee_id, check_in) 
    and not-null policy on employee_id and check_in,and into a flat denormalized Gold Iceberg table aggregated daily-per-employee with derived 
    measures(hours_worked_clean, attendance_rate, late_arrival_flag, overtime_hours, absence_category).
    
    Run daily at 03:00 UTC.
    
    Apply data governance controls: hash/pseudonymize PII fields in Silver, suppress or mask sensitive fields in Gold, enforce retention policies, 
    and log processing metadata. Apply guidelines (This example is illustrative only and does not constitute compliance guidance.)
    
    Please profile the data first, then propose your recommended quality thresholds and transforms before generating any code.

  
Figure 5: Running the ADOP onboarding workflow in Claude Code on Amazon Bedrock

## ADOP: proof of concept to production

The early weeks are architecture-heavy because encoding your standards (not building pipelines) is the one-time investment. After the contract exists, each new source is a prompt, not a project. Directionally, teams running this pattern have seen source onboarding timelines compress significantly on subsequent sources, with the curve flattening further as the skill-trace memory accumulates.

  
Figure 6: A phased ADOP adoption timeline from foundation to production

### Change management

Transitioning to agent-driven data engineering requires deliberate organizational change. The following plan facilitates smooth adoption across engineering teams while preserving accountability and quality standards.

**Stakeholder communication** – Identify three communication tiers: executive sponsors (CDO, VP Engineering) receive monthly progress dashboards. Platform and data engineering leads get weekly sprint summaries. Individual contributors receive real-time updates through team channels. Frame messaging around what ADOP preserves (engineering judgment, architectural standards) rather than what it automates. Publish a one-page FAQ addressing common concerns about agent-generated code quality and job impact before the first enablement session.

**Training schedule** – Week 1: AWS-led ADOP workshop covering architecture contract setup, decision engine configuration, and platform best practices. Week 2: Hands-on prompt authoring lab. Each team onboards one low-risk source end-to-end with AWS guidance. Week 3: Artifact review and guardrail configuration session. Engineers validate agent output against their own code. Weeks 4–6: Office hours twice weekly for troubleshooting. Reduce to weekly from Week 7 onward. Record all sessions for asynchronous onboarding of future team members.

**Phased rollout strategy** – Phase 1 (Weeks 1–3): Pilot with two to three engineering champions and one non-critical data source. Champions validate output quality and provide feedback to refine the architectural contract. Phase 2 (Weeks 4–6): Expand to the full platform team. Onboard 3–5 additional sources of increasing complexity. Phase 3 (Weeks 7–12): Organization-wide rollout. New source onboarding flows through ADOP. Existing pipelines migrate opportunistically during scheduled maintenance windows.

**Success metrics** — Track four key indicators: (1) Source onboarding cycle time, targeting significant reduction by Phase 3. (2) First-pass artifact acceptance rate, with targets defined based on your organization’s quality standards. (3) Engineering satisfaction score through anonymous pulse surveys at Weeks 3, 6, and 12. (4) Guardrail compliance rate, measuring how consistently generated pipelines pass automated policy checks without manual intervention.

**Escalation paths** — Level 1: Engineering champions resolve prompt-authoring questions and minor artifact adjustments within their squad. Level 2: Platform team addresses architectural contract gaps, guardrail misconfigurations, or recurring artifact rejections within one sprint. Level 3: VP of Engineering or CDO intervenes for cross-team adoption blockers, resource conflicts, or policy disputes that cannot be resolved at the platform level. Document all escalations in a shared log to identify systemic issues and feed improvements back into the architectural contract.

## Security and data privacy

A common concern with agent-driven development is how the build process handles secrets, credentials, and sensitive data. ADOP addresses this through several design choices.

**Secrets management** – Secrets don’t enter the agent context. Database credentials, API keys, and service tokens are resolved at deploy time through AWS Secrets Manager or your existing vault solution. Agents reference secret ARNs or placeholder variables. They don’t see or process actual credential values during pipeline generation.

**Data isolation** – Sensitive data stays in place. Agents work with schema metadata, sample row counts, and column statistics rather than raw production data. When data profiling is required for quality rule generation, it runs in an isolated sandbox against a scoped subset, and results are summarized before being returned to the agent context.

**Data privacy** – Model interactions are ephemeral. Conversations with Claude through Amazon Bedrock aren’t retained for model training (see [Amazon Bedrock Data Privacy and Security FAQ](<https://aws.amazon.com/bedrock/faqs/#Data_Privacy_and_Security>). Prompts and responses exist only for the duration of the session, and inference stays within your AWS account boundary.

**Network isolation** – Network boundaries are respected. The local-first development model means agents run on developer machines or within your virtual private cloud (VPC). No data leaves your network unless you explicitly configure an external integration. When promoted to AgentCore runtime, the same network isolation policies apply at the service level.

## Responsible AI considerations

ADOP agents generate pipeline code, data quality rules, and compliance controls based on schema metadata and natural-language prompts. Because these outputs are AI-generated, the following practices apply:

  * **Mandatory human review** – Generated artifacts, especially compliance and regulation controls, must be reviewed by qualified engineers before promotion to production. Agent output is a draft, not a certified implementation.
  * **Hallucination risk** – LLMs can produce plausible but incorrect logic. Generated masking rules, retention policies, or access controls might be incomplete or subtly wrong. Treat every generated control as unverified until validated by your legal or compliance team.
  * **Legal and compliance validation** – AI-generated regulatory controls don’t constitute legal advice or a certified compliance implementation. Your legal, privacy, and compliance teams must validate that generated artifacts meet your specific regulatory obligations before deployment.
  * **Scope of trust** – Agents work from schema metadata and configuration prompts, not from legal interpretation. They can’t assess regulatory applicability, jurisdictional nuance, or organizational risk tolerance.



### Production AI controls with Amazon Bedrock Guardrails

ADOP treats Amazon Bedrock Guardrails as mandatory production controls in the architecture, not optional add-ons. Three capabilities apply to ADOP agents at the API layer:

**Content filtering** – Amazon Bedrock Guardrails enforce topic and content boundaries on every agent interaction, blocking outputs outside data-engineering scope. Filters are configured per agent role and enforced before responses reach artifact generation.

**Grounding validation** – Contextual grounding checks verify that agent outputs are anchored in schema metadata and the architectural contract. Responses failing grounding thresholds are rejected, helping prevent hallucinated logic from entering generated pipelines.

**Sensitive information filters** – PII detection and regex-based filters help prevent credentials or regulated data from surfacing in agent responses or generated code, complementing the secrets-management controls in the Security section.

These controls run inline with every agent invocation, forming a validation layer between the LLM and artifact output. They are configured once in the architecture contract and enforced uniformly across sub-agents.

## Conclusion

ADOP encodes your enterprise architecture standards once, then lets agents apply them consistently across every new data source. The result: faster onboarding, uniform pipelines, and compliance controls applied from the start. Whether you run agents locally in your IDE or scale to Amazon Bedrock AgentCore, the architectural contract stays the same.

### Resources

  * Get started with ADOP on [GitHub](<https://github.com/aws-samples/sample-Agentic-Ai-Data-Operations>)
  * Learn more about [Amazon Bedrock](<https://aws.amazon.com/bedrock/>)
  * Read the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>)



### Related reading

  * [AWS Show and tell video podcast](<https://www.youtube.com/watch?v=GPG2OhMwCrQ>)
  * It’s Safe to Close Your Laptop Now – Hosting Coding Agents on Amazon Bedrock AgentCore. When your ADOP agents outgrow local development, this [guide](<https://aws.amazon.com/blogs/machine-learning/its-safe-to-close-your-laptop-now-hosting-coding-agents-on-amazon-bedrock-agentcore/>) covers promoting them to managed hosting on AgentCore for persistent, scalable execution.
  * Spark on AWS Lambda – An Apache Spark Runtime for AWS Lambda. If your ADOP-generated pipelines need to compile PySpark code, the [SoAL (Spark on AWS Lambda) architecture](<https://aws.amazon.com/blogs/big-data/spark-on-aws-lambda-an-apache-spark-runtime-for-aws-lambda/>) can significantly reduce token count by executing Spark jobs serverlessly without full cluster overhead.



* * *

## About the authors

### John Cherian

John is a Senior Solutions Architect (SA) at Amazon Web Services who helps customers with Data/AI strategy and architecture for building solutions on AWS.

### Nuwan Bandara

Nuwan is a passionate technologist, excited about helping people and businesses realize value from technology. As a senior leader at Amazon Web Services, he works with fintech and capital markets customers to architect the future of financial infrastructure, specializing in AI/ML implementation, data strategy, and blockchain innovation.
