---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/accelerate-campaign-workflow-with-insights-from-adobe-marketing-agent-for-amazon-quick/
ingested: 2026-06-19
sha256: 9f10698db87a578c345744d039f8d2aea171c97581c9589de800bd94a282c2ec
feed_name: AWS China ML
source_published: 2026-06-19T14:05:04Z
---

# Accelerate campaign workflow with insights from Adobe Marketing Agent for Amazon Quick

[Amazon Quick](<https://aws.amazon.com/quick/>) and [Adobe Marketing Agent](<https://aws.amazon.com/blogs/apn/accelerate-customer-experiences-powered-by-adobe-and-aws-agentic-ai-collaboration/>) help marketing teams access campaign insights within governed conversations in seconds. Marketers can ask questions about campaign performance, audiences, journeys, campaign conflicts, and content performance in natural language. Amazon Quick provides the chat experience and action orchestration. Adobe provides marketing-domain analysis to the approved data sources behind those questions.

This post shows how to enable Adobe Marketing Agent for Amazon Quick using a [Model Context Protocol (MCP)](<https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html>). We walk you through how to configure the integration, authenticate using your Adobe credentials, and get the latest insights in Amazon Quick. The sample workflow returns audience rankings, loyalty segment summaries, journey usage, and conflict recommendations.

## Overview: Adobe Marketing Agent for Amazon Quick

Amazon Quick integrations connect external applications and services to AI-powered analysis and automation. With MCP integrations, Amazon Quick connects to remote MCP servers, discovers exposed tools, and registers selected tools as actions. An assistant can call those actions during a conversation. In this solution, the Adobe Marketing Agent exposes marketing tools. The tools cover audience ranking, loyalty analysis, journey lookup, conflict analysis, and content performance summaries.

The following architecture shows the end-to-end request flow. A marketer asks a campaign planning question in Amazon Quick. The chat agent selects an approved action from the Adobe Marketing Agent integration. The MCP server validates the request and queries authorized Adobe marketing data. Amazon Quick renders the response as an answer, table, chart, or recommendation. Apply governance controls across the flow, including least privilege, tenant isolation, audit logging, schema versioning, and human review for launch decisions.

_Figure 1. Architecture for connecting Adobe Marketing Agent to Amazon Quick using MCP._

The workflow has four parts:

  1. An Amazon Quick administrator creates the Adobe Marketing Agent integration using the branded connector tile or the generic MCP setup path.
  2. Amazon Quick discovers the MCP tools and registers selected tools as actions.
  3. A custom chat agent uses those actions to answer marketing questions in natural language.
  4. Marketing users review the output before using it in campaign planning or launch decisions.



The Adobe Marketing Agent actions provide following capabilities:

  * **Campaign review & monitoring** enables marketers to visualize campaign metrics that inform campaign review and monitoring workflows.
  * **Campaign Planning** enables marketing teams to access insights about campaign such as reach and past campaign performance to inform future campaign decisions.
  * **Audience Insights** enables marketers to gather audience insights such as profile size, frequently changing audiences, overlap between audiences and identify attributes to grow campaign reach.
  * **Journey Insights** enables marketers to access existing journey insights to monitor for business outcomes and inform strategies for corrective action that drive towards intended results.
  * **Journey Conflict Analysis** enables marketers to quickly surface existing journey conflicts that need to be addressed before go-live and avoid conflicting customer experiences and optimize towards campaign outcomes.



## Prerequisites

Before you configure the Adobe Marketing Agent integration, you must complete the following prerequisites.

  * Verify that you have access to Amazon Quick, your Adobe organization, your identity provider, and an Adobe-provided Adobe Marketing Agent MCP endpoint with required authentication details. For Adobe-side entitlement and agent access requirements, refer to [Adobe Experience Platform Agent Orchestrator](<https://experienceleague.adobe.com/en/docs/experience-cloud-ai/experience-cloud-ai/agents/agent-orchestrator>).
  * Amazon Quick Enterprise subscription and permissions to create, review, share, and manage integrations and chat agents.
  * Licensed one or more of the Adobe CX Enterprise products, including Adobe Real-Time CDP, Adobe Customer Journey Analytics, or Adobe Journey Optimizer.
  * Licensed and provisioned Adobe Experience Platform Agent Orchestrator. Adobe provides MCP endpoints and tools.
  * A governance plan for the Adobe Marketing Agent [Model Context Protocol (MCP) integration](<https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html>). Your plan should cover the following: 
    * User or service authentication.
    * [Custom chat agent sharing permissions](<https://docs.aws.amazon.com/quick/latest/userguide/custom-agents.html>).
    * [Adobe Experience Platform access control](<https://experienceleague.adobe.com/en/docs/experience-platform/access-control/home>) for Adobe tenant, brand, and sandbox boundaries.
    * MCP tool-invocation audit logs and monitoring.
    * Human review for launch-impacting recommendations.
    * Retention rules for MCP request metadata and generated artifacts such as tables, charts, and recommendations.

The estimated setup time is 45–60 minutes after the MCP endpoint, credentials, and pilot users are ready. Costs depend on your Amazon Quick subscription, Adobe licensing, and the infrastructure that hosts the MCP server.




## Implementation: Connect the Adobe Marketing Agent to Amazon Quick

In this section, you connect Adobe Marketing Agent to Amazon Quick, create a focused chat agent, and validate the workflow with read-only prompts. The screenshots use sample marketing data and show the user experience after the integration is available in Amazon Quick.

### Step 1: Connect the Adobe Marketing Agent integration

You can find Adobe Marketing Agent as a branded connector tile in the Amazon Quick Integrations console.

_Figure 2. Adobe Marketing Agent tile in the Amazon Quick Integrations console._

#### To create the integration

  1. Open the Amazon Quick console and choose **Connectors**.
  2. Choose **Create for your team**.
  3. Choose **Adobe Marketing Agent**.
  4. On the **Adobe Marketing Agent connection details** page, enter a descriptive name, such as **Adobe Marketing Agent**. Optionally, add a description for the marketing workflow.
  5. For **Connection type** , select **Public network**. For **Auth configuration** , select **Default OAuth app**. With the branded connector, Amazon Quick shows that no additional credentials are needed.
  6. Choose **Next**.



_Figure 3. Adobe Marketing Agent connection details in Amazon Quick._

#### To manage tools and permissions

  1. On the **Manage Tools & Permissions** page, review the access level defaults.
  2. For the first pilot, choose **Always ask** so each action requires explicit user approval before it runs.
  3. Expand **Write Operations** and **Read Operations** , and review the actions exposed by the Adobe Marketing Agent connector.
  4. Keep write operations set to **Always ask** for the pilot. Use read operations for the validation prompts in later steps.
  5. Choose **Next**.



_Figure 4. Tool approval settings for Adobe Marketing Agent actions._

#### To publish and authorize the connection

  1. On the **Publish connection** page, choose who can access the connection.
  2. Keep **Everyone in your organization** turned off unless the connector is approved for organization-wide use.
  3. Under **Specific groups** , enter the team or group that should use the connection, and choose **Add**.
  4. Choose **Publish**. The Adobe authorization window opens after you publish the connection.
  5. In the Adobe authorization window, review the requested access. In this example, the request includes access to basic profile information, email address, Adobe organization data, and Adobe Experience Platform data. For Adobe-side user permissions and sandbox access, refer to [Access control overview](<https://experienceleague.adobe.com/en/docs/experience-platform/access-control/home>).
  6. Choose **Allow Access** to complete authorization.



_Figure 5. Publish settings for sharing the Adobe Marketing Agent connection._

_Figure 6. Adobe authorization request for the Adobe Marketing Agent connection._

After authorization completes, the Adobe Marketing Agent connection is published and ready to use in a custom chat agent. In the next step, you create the campaign planning chat agent and link it to the Adobe Marketing Agent actions.

### Step 2: Create the campaign planning chat agent

Create a focused chat agent instead of a general-purpose marketing assistant. A narrow campaign planning agent is easier to test, explain, and govern.

  1. Navigate to **Chat agents** and choose **Create chat agent**.
  2. Add the agent name **Adobe Marketing Agent** and a short description for the pilot workflow.
  3. In the actions section, choose **Link existing integration** and select the Adobe Marketing Agent actions created in Step 1.
  4. Add the agent instructions shown in the following example. You can add to or modify the instructions based on your specific analysis needs.
  5. Preview the agent, test each approved prompt, and launch it only after the answers match your acceptance criteria.


    
    
    You are the Adobe campaign planning assistant. 
    
    Primary job 
    Help marketers answer campaign planning questions using Adobe Marketing Agent actions. 
    Start with read-only analysis for audiences, loyalty segments, journeys, conflicts, and content effectiveness. 
    
    How to respond 
    Keep responses concise and operational. 
    Do not guess. Use tool output as evidence. 
    
    If inputs are missing, ask for the campaign, audience, date range, region, or channel. 
    
    Use this default response format: 
    Summary 
    Data used 
    Key observations 
    Recommendations for human review 
    Tool routing 
    Audience size, top segments, reach -> audience ranking 
    Loyalty tiers, loyalty cohorts, overlap -> loyalty segment summary 
    Journey references, journey status, audience usage -> journey usage lookup 
    Audience overlap, timing conflicts, inconsistent messaging -> campaign conflict analysis 
    Campaign content, channel performance, creative effectiveness -> content effectiveness summary 
    
    Output rules 
    Do not create or modify campaign objects unless the user explicitly asks and the action requires approval. Do not include PII, customer identifiers, email addresses, phone numbers, IP addresses, or raw profile IDs. Also do not include access tokens, secrets, or restricted Adobe metadata in the answer. 

### Step 3: Open the chat agent and run the following query

Open the chat agent from Amazon Quick. Figure 7 shows the Adobe Marketing Agent selected in the chat experience. Use it to verify authentication, tool discovery, data retrieval, artifact rendering, and the natural language response without changing campaign state.

_Figure 7. Amazon Quick chat experience with Adobe Marketing Agent selected._

Send the following prompt to the chat agent:
    
    
    Show the top 10 audiences by total profiles.

### Step 4: Validate audience ranking output

When you enter the prompt for top audiences by total profiles, Amazon Quick invokes the Adobe Marketing Agent audience-ranking action through MCP. Figure 8 shows the response with a bar chart, a smaller chart in the chat panel, and key insights for the marketer.

_Figure 8. Top audiences by total profiles and generated key insights._

### Step 5: Analyze loyalty audience segments

After the top-audience view works, validate a follow-up prompt that narrows the analysis to loyalty audiences. The agent should reuse conversation context where appropriate. It should call the loyalty-segment action and explain overlap assumptions when summed audience counts can overstate unique reach.

Send a prompt like the following:
    
    
    Show the top loyalty audiences and group them by attribute type.

The following figure shows the loyalty audience distribution and segment-level observations returned in Amazon Quick.

_Figure 9. Loyalty audience distribution and segment insights._

### Step 6: Analyze journeys that use loyalty audiences

Next, ask which journeys use loyalty audiences. This validates that the Adobe Marketing Agent can connect audience analysis with journey analysis. The response should return a table for marketing operations teams to review before launch.

Send a prompt like the following:
    
    
    Which journeys use loyalty audiences?

The following figure shows journeys that reference loyalty audiences. It includes the audience used, the loyalty attribute, and generated patterns. The output helps campaign teams identify repeated audience usage and potential campaign interactions before a new campaign goes live.

_Figure 10. Journeys with loyalty audiences and generated pattern analysis._

### Step 7: Review conflicts before launch

The final validation prompt asks the agent to summarize conflicts and recommendations for human review. Keep this action advisory for the first release. The agent can shorten the review cycle. Your organization’s approval process should control campaign launch decisions.

Send a prompt like the following:
    
    
    Summarize conflicts I should review before launch.

The following figure shows a conflict summary with risk level, audience overlap, key observations, and coordination recommendations. In this sample, the output identifies a medium-risk conflict with 2.3 percent audience overlap. Reviewers should verify that the risk language, metric definitions, and recommendations match your marketing governance standards.

_Figure 11. Conflict summary and recommended coordination strategy._

### Step 8: Launch, share, and support the workflow

After the validation prompts meet your acceptance criteria, launch the chat agent and share it with approved pilot users or groups. Launching makes the agent available in the chat agent library, and sharing controls which users can use it. For instructions, see [Custom chat agents](<https://docs.aws.amazon.com/quick/latest/userguide/custom-agents.html#share-custom-agents>).

## Security and governance considerations

Before you launch or share the chat agent, review the controls that protect Adobe data access, tool use, and campaign launch decisions. During the initial connection setup, use the **Manage Tools & Permissions** page to review the discovered **Read Operations** and **Write Operations**. For the pilot, turn on only the read actions needed for validation. Keep write actions turned off where possible, or set them to **Always ask** until your approval and rollback processes are tested. For more details, see Step 1 earlier in this post.

If Adobe provides a private Adobe Marketing Agent MCP server endpoint for your organization, Amazon Quick supports [virtual private cloud (VPC) connectivity for MCP connections](<https://aws.amazon.com/about-aws/whats-new/2026/06/amazon-quick-vpc-mcp/>). During MCP setup, select the configured VPC connection, and confirm that the MCP server is reachable from your VPC. If the MCP server uses OAuth, the OAuth endpoints must still be reachable over the public internet.

Use Adobe permissions and sandbox access to enforce user, tenant, brand, region, and business-unit boundaries. Configure access in Adobe so the MCP server returns only the fields needed for the marketing task. For more information, refer to [Access control overview](<https://experienceleague.adobe.com/en/docs/experience-platform/access-control/home>) and [Sandboxes overview](<https://experienceleague.adobe.com/en/docs/experience-platform/sandbox/home>).

Require human approval for recommendations that affect campaign launch, targeting, audience suppression, personalization, or customer messaging. To capture chat conversations, user feedback, agent or research usage, and index storage usage, configure [Monitoring Amazon Quick usage using CloudWatch Logs](<https://docs.aws.amazon.com/quick/latest/userguide/monitoring-quicksuite-chat-feedback-cloudwatch.html>). You can deliver these logs to Amazon CloudWatch Logs, Amazon Simple Storage Service (Amazon S3), or Amazon Data Firehose. Retain logs according to your organization’s policy, and don’t log raw profile identifiers, customer identifiers, email addresses, phone numbers, IP addresses, access tokens, secrets, or restricted Adobe metadata.

## Clean up resources

If you created a pilot integration, remove or disable it when testing ends. This removes operational noise and prevents access to tools that are no longer under review.

  1. In Amazon Quick, disable or remove the Adobe Marketing Agent actions from the pilot chat agent.
  2. Unshare the pilot chat agent and integration from pilot users and groups.
  3. Delete the MCP integration if you no longer need the Adobe Marketing Agent endpoint registered in Amazon Quick.
  4. Revoke OAuth clients, service credentials, bearer tokens, or test credentials created for the pilot.
  5. Remove pilot users from Adobe-side roles, brands, tenants, or business units that were created only for testing.
  6. Retain logs only for the period required by your organization’s security and compliance policy.



## Conclusion

In this post, you configured a governed Adobe Marketing Agent integration for Amazon Quick using MCP. Amazon Quick provides the conversational workspace and action orchestration. Adobe Marketing Agent provides marketing-domain analysis for audiences, journeys, campaign conflicts, and content effectiveness. MCP provides the integration layer that lets Amazon Quick discover Adobe tools and call them as actions.

We recommend that you start with a narrow read-only workflow such as audience discovery or journey conflict review. Validate access control, data quality, response usefulness, and human-review steps before you add broader tools or write actions. For more information about MCP setup, refer to [Model Context Protocol (MCP) integration](<https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html>) in the Amazon Quick User Guide. For more details about the Adobe and AWS collaboration, refer to [Accelerate customer experiences powered by Adobe and AWS agentic AI collaboration](<https://aws.amazon.com/blogs/apn/accelerate-customer-experiences-powered-by-adobe-and-aws-agentic-ai-collaboration/>).

## References and further reading

  * [Amazon Quick User Guide: Model Context Protocol (MCP) integration](<https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html>)
  * [Amazon Quick User Guide: Work with integrations in Amazon Quick](<https://docs.aws.amazon.com/quick/latest/userguide/working-with-integrations.html>)
  * [Amazon Quick User Guide: Custom chat agents](<https://docs.aws.amazon.com/quick/latest/userguide/custom-agents.html>)
  * [AWS Partner Network Blog: Accelerate customer experiences powered by Adobe and AWS agentic AI collaboration](<https://aws.amazon.com/blogs/apn/accelerate-customer-experiences-powered-by-adobe-and-aws-agentic-ai-collaboration/>)



* * *

## About the authors

### Ebbey Thomas

[Ebbey](<https://www.linkedin.com/in/ebbeythomas/>) is a Senior Generative AI Specialist Solutions Architect at AWS. He works with customers to identify practical use cases for AI agents and turn them into production-grade generative AI solutions. Ebbey holds a BS in Computer Engineering and an MS in Information Management from Syracuse University. Outside of work, he enjoys coffee, the outdoors, workouts, road trips, and spending time with his family.

### Siddhartha Srivastava

[Siddhartha](<https://www.linkedin.com/in/siddhartha-srivastava-0326268/?skipRedirect=true>) is a Senior Product Manager at Adobe. He focuses on driving product partnerships with AWS to unlock use cases that deliver value to mutual customers. Prior to being a PM, he has significant experience across various functions, including product evangelism and sales, and has worked with various customers across different regions such as ANZ, APAC, and now the US with Adobe. He started as a software engineer and later pursued an MBA from a leading institute in India.

### Ranjith Raman

[Ranjith](<https://www.linkedin.com/in/ranjith-raman-24118212/>) is a Principal Partner Solutions Architect at AWS leading the technical strategy for business applications partnerships at AWS. Ranjith specializes in helping enterprise software companies leverage the power of AI and cloud technologies to drive digital transformation. In his role, he is responsible for driving strategic technical decisions and providing architectural guidance to help partners leverage AWS’s comprehensive suite of services.

### Eugene Thomas

[Eugene](<https://www.linkedin.com/in/eugthom/>) is a Technical Account Manager at AWS focused on agentic AI, no-code automation, resilience, security, and cost optimization. With more than 10 years in customer-facing roles, he helps builders and business stakeholders turn complex cloud topics into practical solutions. He is also an active member of the Amazon Quick community, exploring how chat agents can simplify collaboration.
