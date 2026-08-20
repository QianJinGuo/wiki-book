---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/scaling-cloud-migrations-with-agentic-ai-on-amazon-bedrock-agentcore
ingested: 2026-08-21
feed_name: AWS China ML
source_published: 2026-08-20
sha256: 90e97872ce5bf3b1752dc407f1294c174170f98e211fc556c7d08bdf1b3b028e
---

# Scaling cloud migrations with agentic AI on Amazon Bedrock AgentCore

Scaling cloud migrations with agentic AI on [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) starts with recognizing where large-scale migrations break down. Discovery consumes weeks per application. Engineers write infrastructure code from scratch for each workload. Post-migration operations devolve into reactive firefighting. Multiply those bottlenecks across over 300 applications and a fixed fiscal year deadline, and migration programs struggle to keep pace. The multi-agent framework in this post reduced infrastructure as code (IaC) development time from 3–4 weeks per application to minutes across a over 300 application portfolio. This result is based on internal project tracking data.

AWS Professional Services builds a suite of purpose-built AI agents to address these bottlenecks across the migration lifecycle, from automated discovery to proactive post-migration operations. The agents use the [Strands Agents SDK](<https://strandsagents.com/>) and run on Amazon Bedrock AgentCore, a platform to build, connect, and optimize agents at scale, with any framework or model.

In this post, you explore the architecture of a multi-agent orchestration framework that accelerates enterprise cloud migrations end-to-end. You also see the code that defines an agent, connects it to its tools, and applies responsible AI controls. The framework includes four agents:

  * The _Intake Agent_ for automated discovery.
  * The _IaC Agent_ that generates infrastructure as coded (IaC) adhering to your security best practices.
  * The _Migration Intelligence and Governance Agent_ for portfolio-wide reporting and well-architected assessments.
  * The _Site Reliability Engineering (SRE) Agent_ for proactive operations.



To follow along, you need an AWS account with access to Amazon Bedrock AgentCore and to Amazon Bedrock foundation models (FM). You also need familiarity with the Strands Agents SDK and Model Context Protocol (MCP) server patterns, plus the IaC tooling used by your organization.

## Why migration programs need a different approach

Three core bottlenecks emerge consistently across large enterprise data center exit migration programs.

**Manual intake overhead:** Most application migrations begin with discovery: understanding the on-premises architecture, inventory, dependencies, and intake questionnaires. Manual discovery consumes weeks per application. Across over 300 applications, this bottleneck alone threatens an aggressive migration timeline.

**Redundant infrastructure development:** When engineers define a target architecture, they write IaC to provision the AWS infrastructure. Without automation, writing IaC from scratch for each application typically requires 3–4 weeks per application. Across a over 300 application portfolio, that translates to years of engineering effort.

**Reactive post-migration operations:** After migration, teams rely on manual monitoring and reactive response. Without proactive intelligence to detect performance degradation or automatically remediate issues, ongoing operational drag compounds over time.

These three bottlenecks span the migration lifecycle. Addressing them requires shifting repetitive work to AI agents while humans retain decision authority.

## Architecture overview

A multi-agent orchestration framework addresses each bottleneck with purpose-built agent capabilities. The architecture spans the migration lifecycle from on-premises discovery to post-migration operations. The framework applies security at each phase of that lifecycle. The following diagram shows how the agents, tools, and AWS services connect.

  
Figure 1: How the agents connect across the migration and operations journeys through Model Context Protocol tool calling

The framework organizes agents into two journeys. The migration journey agents handle discovery through deployment. The operations journey agent handles post-migration monitoring.

Migration journey agents:

  * **Intake Agent (Phase 1):** Automates application discovery and target state architecture definition with dependency mappings.
  * **IaC Agent (Phase 2):** Generates IaC code adhering to your security best practices and standards.
  * **Migration Intelligence and Governance Agent:** Provides automated portfolio reporting, well-architected assessments, and migration governance across Jira, Confluence, and Webex.



Operations journey agents:

  * **SRE Agent (Phase 3):** Provides proactive post-migration monitoring and automated remediation.



AWS managed services complement the custom agents:

  * [AWS Database Migration Service (AWS DMS)](<https://docs.aws.amazon.com/dms/>): Generative AI-assisted schema conversion and automated cutover for database migration.
  * [AWS Transform](<https://docs.aws.amazon.com/transform/>): Application-specific modernization for legacy code.



### How the components connect

This section describes how the framework components interact at runtime.

Each agent is a Strands agent, defined by a foundation model, a system prompt, and a set of tools. Amazon Bedrock AgentCore runtime hosts them in a serverless environment with session isolation and multi-agent orchestration. Amazon Bedrock foundation models power the reasoning that interprets documents, generates code, and drives multi-step workflows. For model availability by AWS Region, refer to [Supported foundation models in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html>).

Each agent calls MCP tools scoped to its function through [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-quick-start.html>), a capability of Amazon Bedrock AgentCore, which converts your APIs, AWS Lambda functions, and existing services into MCP-compatible tools. [AgentCore Identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html>), a capability of Amazon Bedrock AgentCore, authenticates each call through scoped AWS Identity and Access Management (IAM) roles and your identity provider.

Amazon Bedrock [AgentCore memory](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html>) stores agent session state and shared context. Agents use this shared context to persist outputs and track migration progress across over 300 applications. When the Intake Agent completes discovery, it writes the target architecture and dependency mappings to AgentCore memory. The IaC Agent reads this shared context to begin code generation without manual handoff.

### Defining an agent in code

The following Python example defines the IaC Agent and prepares it for Amazon Bedrock AgentCore runtime. The agent reaches your MCP tools through AgentCore Gateway, and it calls a foundation model through Amazon Bedrock with an [Amazon Bedrock Guardrails](<https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html>) policy attached.
    
    
    import logging
     import os
     from bedrock_agentcore.runtime import BedrockAgentCoreApp
     from strands import Agent
     from strands.models import BedrockModel
     from strands.tools.mcp import MCPClient
     from strands.tools.mcp.mcp_types import MCPClientCredentials
    
     logger = logging.getLogger(__name__)
     app = BedrockAgentCoreApp()
    
     REGION = os.environ["AWS_REGION"]
    
     # url+auth lets the SDK run the client_credentials grant and re-mint the
     # token on expiry. A statically captured bearer token would go stale.
     gateway = MCPClient(
         url=os.environ["GATEWAY_MCP_URL"],
         auth=MCPClientCredentials(
             client_id=os.environ["GATEWAY_CLIENT_ID"],
             client_secret=get_secret("gateway/client_secret"),
             scopes=[os.environ["GATEWAY_SCOPE"]],
         ),
     )
    
     model = BedrockModel(
         model_id=os.environ["MODEL_ID"],
         region_name=REGION,
         guardrail_id=os.environ["GUARDRAIL_ID"],
         guardrail_version=os.environ.get("GUARDRAIL_VERSION", "1"),
         guardrail_trace="enabled",
     )
    
    
    
     @app.entrypoint
     def invoke(payload, context):
         prompt = (payload.get("prompt") or "").strip()
         if not prompt:
             return {"status": "error", "error": "missing required field: prompt"}
    
         try:
             # tools=[gateway]: SDK owns the connection lifecycle and paginates
             # tool discovery, which list_tools_sync() alone does not.
             agent = Agent(
                 model=model,
                 system_prompt=IAC_AGENT_PROMPT,
                 tools=[gateway],
             )
             result = agent(prompt)
    
             if result.stop_reason == "guardrail_intervened":
                 logger.warning("guardrail blocked request, session_id=%s",
                                getattr(context, "session_id", None))
                 return {"status": "blocked_by_guardrail"}
    
             return {"status": "ok", "iac": str(result)}
    
         except Exception as e:
             logger.exception("invocation failed, session_id=%s",
                              getattr(context, "session_id", None))
             return {"status": "error", "error": str(e)}
    
    
    
     if __name__ == "__main__":
         app.run()

The entrypoint returns generated IaC to the caller, and AgentCore runtime handles session isolation and scaling. For deployable end-to-end examples, see the [Amazon Bedrock AgentCore samples repository](<https://github.com/awslabs/amazon-bedrock-agentcore-samples>) and the [Strands Agents samples repository](<https://github.com/strands-agents/samples>) on GitHub. For the deployment steps, refer to [Getting started with AgentCore runtime](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-getting-started.html>).

## Phase 1: Intake Agent for automated discovery

The Intake Agent automates the most time-consuming first step of migration: understanding what exists on-premises and defining where it goes on AWS.

The agent ingests on-premises architecture documentation, application inventory lists, intake questionnaires, and dependency maps. It then produces a target AWS architecture with a recommended migration pattern, resource sizing specifications, and a compliance validation report.

The Intake Agent addresses the manual intake bottleneck. The output feeds directly into the IaC Agent, creating an automated handoff from discovery to infrastructure provisioning.

## Phase 2: IaC Agent for automated infrastructure code generation

AWS Professional Services deployed the IaC Agent first in the portfolio, and it delivers the most immediately measurable impact. It generates IaC code adhering to your security best practices and standards.

### How it works

The agent workflow proceeds through five steps:

**Step 1: Ingest the steering document.** The agent reads the steering document from the wave team. It extracts deployment scope, compliance constraints, and Security Office-approved wave-specific overrides.

**Step 2: Interpret the target state architecture diagram.** Using the Intake Agent’s output, the IaC Agent identifies infrastructure components, their relationships, and dependencies.

**Step 3: Generate IaC.** Based on this interpretation, the agent generates IaC using your defined and established patterns. It populates configurations with wave-specific parameters and configures remote state management. It then applies mandatory tagging and adds monitoring configurations required by organizational standards.

**Step 4: Validate through Policy in Amazon Bedrock AgentCore.** Before execution, Policy in AgentCore evaluates each tool call against Cedar rules. It calculates the scope of potential change, checks dependency conflicts with concurrent waves, and confirms compliance window validity.

**Step 5: Execute and report.** The centralized execution plane triggers the IaC, monitors deployment, and reports outcomes through AgentCore Observability, a capability of Amazon Bedrock AgentCore. Post-deployment validation runs automatically and compliance metrics update in real time.

### Custom MCP tools: The security foundation

Each action passes through custom MCP tools exposed by Amazon Bedrock AgentCore Gateway and governed by AgentCore Identity and Policy in AgentCore. AgentCore Identity authenticates each agent action through scoped IAM roles with least-privilege access. The framework validates inputs against defined schemas and rejects malformed inputs at the boundary.

No credentials or sensitive values pass through agent context, because AgentCore Identity resolves secrets at runtime from a centralized credential provider. AgentCore Observability and AWS CloudTrail write each agent action to an immutable, centralized audit trail. [Policy in AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>) enforces [Cedar](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-understanding-cedar.html>) rules that help prevent a single operation from affecting more than a defined threshold.

### IaC generation based on your patterns

The IaC Agent generates infrastructure code based on your defined and established patterns. These patterns encode organizational standards into reusable constructs. They include network configurations, security group rules, IAM roles, [Amazon CloudWatch](<https://docs.aws.amazon.com/cloudwatch/>) alarms, [Amazon Elastic Compute Cloud (Amazon EC2)](<https://docs.aws.amazon.com/ec2/>) configurations, [Amazon Virtual Private Cloud (Amazon VPC)](<https://docs.aws.amazon.com/vpc/>) layouts, and mandatory tagging.

This approach provides consistency across waves, speed for wave teams who don’t write infrastructure code from scratch, and governance where security updates propagate to consumers on their next deployment cycle.

### Output artifacts

The agent produces IaC code, automated test cases, compliance reports, and deployment runbooks for each application.

The IaC Agent pushes generated code directly to your code repository (such as [AWS CodeCommit](<https://docs.aws.amazon.com/codecommit/>), GitLab, or Bitbucket). From there, it enters your existing review and deployment pipeline without requiring changes to your existing toolchain.

## Migration Intelligence and Governance Agent: Portfolio-wide visibility

An over 300 application migration portfolio requires full-time operational management. Status reporting, tracking progress, executing follow-up actions, and validating well-architected alignment manually creates significant overhead for project managers and delivery leads.

The Migration Intelligence and Governance Agent solves this with automated, on-demand intelligence and governance across the portfolio. It aggregates data from three sources through AgentCore Gateway. Jira provides sprint progress and impediments. Confluence provides architecture documentation and runbooks. Webex provides meeting notes and action items.

The agent provides well-architected assessments across migrated workloads, compliance and governance validation, and architecture pattern adherence tracking.

Automated actions include updating Confluence pages with latest migration status, creating Jira tasks for identified action items, and generating ServiceNow tickets for escalations. These actions require explicit human approval before execution. This approval-gated architecture is a core design principle across the agent suite. Agents support human decision-making rather than replacing it.

On-demand reporting across the over 300 application portfolio replaces manual aggregation, based on internal project tracking data. Your results might vary based on portfolio size and tool integrations.

## Phase 3: SRE Agent for proactive post-migration operations

The SRE Agent represents the final phase: proactive post-migration operations. After applications run on AWS, the SRE Agent shifts the team from reactive firefighting to proactive improvement.

The agent monitors [Amazon CloudWatch](<https://docs.aws.amazon.com/cloudwatch/>) metrics, application performance data, and historical patterns. It raises alerts before issues affect production. The agent also publishes automated remediation playbooks for common failure patterns and recommends efficiency improvements.

Target areas (with human-in-the-loop approval) include database cluster right-sizing, performance tuning, storage tiering, and compute scaling and efficiency improvements.

The SRE Agent completes the migration lifecycle. Applications don’t land on AWS and stop there. They continuously improve over time.

## Data migration with AWS DMS and AWS Transform

Alongside the custom AI agents, two AWS managed services handle the data and application modernization layer.

[DMS Schema Conversion with generative AI](<https://docs.aws.amazon.com/dms/latest/userguide/schema-conversion-convert.databaseobjects.html>) reduces manual schema mapping effort. It converts code objects that rules-based conversion leaves unfinished, such as stored procedures, functions, and triggers. This capability is generally available in a subset of AWS Regions, so confirm Region support during wave planning. AWS DMS then shortens the cutover window with automated migration tasks. The service integrates directly into the agent pipeline. The IaC Agent provisions target infrastructure, then AWS DMS migrates the data.

AWS Transform handles application-level transformations beyond infrastructure lift-and-shift. It provides application-specific modernization for legacy code, delivering true modernization rather than migration alone.

## Security and compliance: Embedded, not bolted on

This architecture embeds security from the start, not as an afterthought, applying it at each phase of the migration lifecycle. Key controls across the agent suite:

  * **Security standards enforcement:** The IaC Agent pulls the enterprise’s security office standards directly from Confluence and applies them across generated IaC using custom MCP tools.
  * **Landing zone validation:** The framework validates generated infrastructure against the enterprise’s landing zone compliance requirements before deployment.
  * **Human-in-the-loop approval gates:** Automated actions across all agents in the suite require explicit human approval before execution. No agent acts autonomously on production systems.
  * **AgentCore Gateway coordination:** Amazon Bedrock AgentCore Gateway coordinates context and security controls across agents, maintaining consistent policy application throughout the migration lifecycle.
  * **Continuous integration and continuous delivery (CI/CD) integration:** The framework integrates security controls into the CI/CD pipeline, with automated test cases generated alongside IaC to catch compliance issues before they reach production.
  * **Responsible AI controls at the inference layer:** Amazon Bedrock Guardrails applies content filters, denied topics, sensitive information filters, and contextual grounding checks to each prompt and each model response. An agent acts only on output that clears the guardrail. Guardrail traces flow into AgentCore Observability alongside the tool-call audit trail.



This approach aligns with the AWS shared responsibility model. AWS provides security of the underlying infrastructure, while you’re responsible for security in the cloud. The agents automate your configuration responsibilities while maintaining human oversight for approval decisions.

In this implementation, the framework maintained enterprise security standards across the over 300 application portfolio at speeds manual processes could not match. Your results might vary based on your security requirements and organizational standards.

## Measurable impact

Across the migration program, this framework delivered the following results. These metrics reflect this specific implementation. Your results might vary based on application complexity, team size, and organizational requirements.

  * **IaC development time reduced from weeks to minutes:** from 3–4 weeks per application to minutes of automated generation (based on internal project tracking data).
  * **Pattern consistency applied across waves:** no wave can deviate from the approved IaC patterns baseline.
  * **Security compliance:** verified automatically at each deployment, with a complete audit trail requiring zero manual effort.
  * **Architecture-to-deployment fidelity improved:** the agent interprets the diagram, and the IaC realizes it as designed.
  * **On-demand portfolio reporting** across over 300 applications with precise metrics and zero manual aggregation.
  * **Wave team onboarding improved:** teams upload documents and the framework handles the rest.



## Clean up resources

To avoid ongoing charges after you finish testing the framework, remove the resources that you created:

  * Delete the agents from AgentCore runtime, then remove the Gateway targets and the Gateway.
  * Delete the AgentCore memory resources that hold session state and shared context.
  * Delete the guardrail, the Policy in AgentCore definitions, and the IAM roles created for the agents.
  * Delete the CloudWatch log groups that AgentCore Observability wrote to, if you no longer need the history.
  * Delete any AWS DMS replication instances and endpoints provisioned for test migrations.



Confirm in the Amazon Bedrock AgentCore console that no agent sessions remain active.

## Conclusion

Adding more engineers alone doesn’t solve migrating over 300 applications to AWS on an aggressive timeline. It requires a different approach, one where AI agents handle the repetitive, high-volume work while humans focus on decisions, approvals, and strategy.

The multi-agent framework described in this post delivers measurable results today. Purpose-built Strands agents address specific bottlenecks, Amazon Bedrock AgentCore applies security structurally, and human-in-the-loop design keeps automation supporting decision-making rather than replacing it.

## Next steps

Based on your use case, consider these paths:

  * **Starting a large-scale migration?** Evaluate the IaC Agent pattern first. IaC development time drops from weeks to minutes based on this implementation. See [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) to learn how to build and deploy agents.
  * **Need portfolio visibility?** Consider the Migration Intelligence and Governance Agent to automate status reporting and well-architected assessments. Learn more about [Amazon Bedrock AgentCore memory](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html>) for agent state management.
  * **Post-migration?** Explore the SRE Agent pattern to shift from reactive operations to proactive improvement. Use [Amazon CloudWatch](<https://docs.aws.amazon.com/cloudwatch/>) for monitoring and automated alerting.
  * **Building your own agents?** Start with the [Strands Agents SDK](<https://strandsagents.com/>) and [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>), using MCP servers tailored to your migration bottlenecks. Open the [Amazon Bedrock AgentCore console](<https://console.aws.amazon.com/bedrock-agentcore/>) to get started, read [Deploying Strands Agents to Amazon Bedrock AgentCore runtime](<https://strandsagents.com/docs/user-guide/deploy/deploy_to_bedrock_agentcore/>).



To explore the services used in this post:

  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>): Deploy and operate AI agents securely at scale.
  * [Strands Agents SDK](<https://strandsagents.com/>): Build AI agents with a model, a prompt, and tools.
  * [AWS Database Migration Service (AWS DMS)](<https://docs.aws.amazon.com/dms/>): Migrate databases to AWS.
  * [AWS Identity and Access Management (IAM)](<https://docs.aws.amazon.com/iam/>): Manage access to AWS services.
  * [Amazon CloudWatch](<https://docs.aws.amazon.com/cloudwatch/>): Monitor AWS resources and applications.
  * [Amazon Bedrock AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/>): Runtime, Gateway, Memory, Identity, and Observability.



For background on the services and SDKs used here, read these AWS posts:

  * [Introducing Amazon Bedrock AgentCore: Securely deploy and operate AI agents at any scale](<https://aws.amazon.com/blogs/aws/introducing-amazon-bedrock-agentcore-securely-deploy-and-operate-ai-agents-at-any-scale/>)
  * [Introducing Strands Agents, an open source AI agents SDK](<https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/>)
  * [Accelerate database modernization with agentic AI on AWS DMS Schema Conversion](<https://aws.amazon.com/blogs/database/accelerate-database-modernization-with-agentic-ai-in-aws-dms-schema-conversion/>)



* * *

## About the authors

### Nikhil Jha

Nikhil is a Principal at AWS Professional Services, focused on building AI, Cloud Infra and data solutions that help enterprises move from legacy complexity to modern, intelligent systems. He brings deep expertise in Generative AI, agentic architectures, and cloud modernization.

### Tarun Tarun

Tarun is a Senior Delivery Consultant at AWS Professional Services, focused on building AI, Cloud Infrastructure, and data solutions that help enterprises move from legacy complexity to modern systems. He brings deep expertise in Generative AI, agentic architectures, cloud modernization, and large-scale migration & disaster recovery, spanning multi-tier architectures, databases, and infrastructure-as-code. His technical depth across Amazon Bedrock, AWS DMS, and DR orchestration enables customers to achieve resilient, high-performing cloud environments at enterprise scale.

### Vyas Garigipati

Vyas is a Delivery Consultant at AWS Professional Services, with experience building scalable, distributed systems. He specializes in designing and building AI-powered, high-availability, multi-region architectures and helps customers deploy resilient, production ready solutions on AWS.

### Kaushal (KK) Agrawal

Kaushal is a Principal Technology Delivery Leader for the Digital Native Segment of AWS Professional Services, working with top-tier customers to deliver innovation at the intersection of AI and Cloud.
