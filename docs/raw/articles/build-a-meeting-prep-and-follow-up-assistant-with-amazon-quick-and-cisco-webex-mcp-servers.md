---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-a-meeting-prep-and-follow-up-assistant-with-amazon-quick-and-cisco-webex-mcp-servers
ingested: 2026-06-13
feed_name: AWS China ML
source_published: 2026-06-12
type: article
tags: [aws, amazon-quick, cisco-webex, mcp, mcp-server, meeting-prep, vidcast, agent, ai-agent, productivity, tool-use]
sha256: "60515ff80940ab37cf60f5fb5de4e1058649c23a9f1c731de8ff4779f1d75d16"
---

# Build a meeting prep and follow-up assistant with Amazon Quick and Cisco Webex MCP servers

[Amazon Quick](https://aws.amazon.com/quick/) and [Cisco Webex MCP servers](https://developer.webex.com/mcp/docs/webex-mcp-server-overview) can turn meeting prep and follow-up into a single conversational workflow. Instead of switching between Webex meetings, Vidcast videos, transcripts, recordings, and message spaces, users ask one assistant to gather the context they need.

This post shows how to build a custom meeting prep and follow-up assistant using Amazon Quick and Cisco Webex MCP servers. From a single prompt, the agent finds an upcoming Webex meeting, reviews prior meeting summaries and transcripts, and pulls related Vidcast highlights and transcript context. It then searches Webex message threads for unresolved follow-ups and creates a concise prep brief. After the meeting, the same assistant can summarize the discussion and identify action items. It can also find related Vidcast updates and draft a follow-up message for the right Webex space.

For project managers, team leads, and engineering teams, the business outcome is straightforward. Teams spend less time searching through meetings, recordings, transcripts, videos, and message threads. They also spend less time switching across collaboration tools and get more consistent continuity from one recurring meeting to the next. Users can stay in Amazon Quick as the single conversational workspace while the chat agent retrieves Webex context through Cisco MCP servers. When needed, the chat agent can also bring in context from enterprise data sources such as Amazon Simple Storage Service (Amazon S3), Google Drive, Microsoft SharePoint, Atlassian Confluence, or internal web content. The same chat agent can also use [over 100 pre-built action connectors](https://docs.aws.amazon.com/quick/latest/userguide/connecting-integrations-apps.html) to perform actions in third-party systems such as Slack, Microsoft Outlook, Atlassian Jira, ServiceNow, and Salesforce.

## Solution overview

Amazon Quick chat agents help users explore information, analyze data, and take actions through open-ended conversations supported by connected tools. With [MCP integration](https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html), Amazon Quick connects to remote Model Context Protocol (MCP) servers. It registers the tools exposed by those servers as actions that the assistant can invoke during a conversation.

This solution uses three Cisco Webex MCP servers:

**Cisco Webex MCP server** | **Role in this solution**
---|
[Webex Meetings MCP](https://developer.webex.com/mcp/docs/meetings-mcp-server) | Find upcoming and previous meetings, retrieve meeting status, artificial intelligence (AI)-generated meeting summaries, recordings, and transcripts.
[Vidcast MCP](https://developer.webex.com/mcp/docs/vidcast-mcp-server) | Search Vidcast videos, retrieve AI-generated highlights and transcripts, and recommend related or trending videos.
[Webex Messaging MCP](https://developer.webex.com/mcp/docs/messaging-mcp-server) | Search spaces, retrieve messages and threads, and optionally create a follow-up message or threaded reply.

Figure 1 shows the end-to-end workflow from prompt to meeting prep brief and follow-up draft.

*Figure 1: Meeting prep and follow-up workflow using Amazon Quick and Cisco Webex Meetings, Vidcast, and Messaging MCP servers.*

## Use cases

The following use cases show how the same agent supports both sides of a recurring meeting workflow.

### Use case 1: Full meeting prep flow

The first use case shows orchestration across Webex Meetings, Vidcast, and Webex Messaging. The user asks for one prep brief. The agent resolves the upcoming meeting, reviews prior meeting artifacts, retrieves related Vidcast context, and checks Webex conversations for open follow-ups. It then synthesizes the findings into a brief the user can review before joining the meeting.

The following prompt starts the workflow:

```
Prepare me for the Project Phoenix Weekly Sync on [DATE].

Find the upcoming meeting, review previous related meetings, summarize key decisions and action items, pull related Vidcast highlights from last week, check Webex messages for unresolved follow-ups, and create a short prep brief.
```

To handle this request, the Quick Agent starts with Webex Meetings MCP and runs `webex-list-meetings` to locate the upcoming sync. It then retrieves prior context with `webex-get-meeting-summary`, `webex-list-transcripts`, and `webex-list-recordings`.

Next, it searches Vidcast with `vidcast-search-videos` and `vidcast-list-shared-with-me`. It uses `vidcast-get-video-highlights` and `vidcast-get-video-transcript` to extract relevant context, and can add recommended videos with `vidcast-recommend-watch-next` and `vidcast-recommend-trending-videos`.

Finally, Webex Messaging MCP helps the Quick Agent find the project space, search messages, retrieve threads, and identify unresolved follow-ups with `webex-search-spaces`, `webex-search-messages`, and `webex-get-thread`. Amazon Quick assembles the final prep brief from the tool outputs.

### Use case 2: After-meeting follow-up query

The second use case continues the workflow after the meeting. The assistant turns the meeting summary, transcript context, and related Vidcast updates into a follow-up draft for the Webex space.

```
The Project Phoenix Weekly Sync just ended.

Summarize the meeting, identify decisions and action items, find related Vidcast updates, and draft a follow-up message for the Project Phoenix Webex space.
```

After the user sends the prompt, the agent uses Webex Meetings MCP to locate the meeting that just ended and retrieve the AI-generated summary. If the summary is incomplete, it uses transcripts for grounding.

It then searches Vidcast for related updates and highlights, finds the relevant (for example, Project Phoenix) Webex space through Webex Messaging MCP, and drafts a follow-up message. The agent should ask before posting unless the user explicitly requests posting.

## Prerequisites

Before you start, make sure the the following prerequisites are in place.

1. Amazon Quick account. You need a subscription and permissions to create integrations and [custom chat agents](https://docs.aws.amazon.com/quick/latest/userguide/custom-agents.html). Admin access is recommended for the initial setup. See Quick [pricing and subscription](https://aws.amazon.com/quick/pricing/) details.
2. Webex organization. Your organization must have Webex Meetings, Webex Messaging, and Vidcast available to the users who will run the assistant. If you need to set up or validate Webex access first, use the [Cisco Agentic Apps](https://developer.webex.com/create/docs/provisioning-on-control-hub) overview and Provisioning on Control Hub guidance before configuring the Amazon Quick integration.
3. Cisco Webex MCP servers enabled. Ask your Webex organization admin to enable the Webex Meetings MCP Server, Webex Messaging MCP Server, and Vidcast MCP Server in Webex Control Hub. See the [Cisco Webex MCP server](https://developer.webex.com/mcp/docs/webex-mcp-server-overview) documentation for further details.
4. Webex OAuth credentials. Create a Webex OAuth 2.0 integration with the scopes required by the Cisco MCP tools you plan to enable.
5. Accessible Webex content. The signed-in Webex user must have access to the meetings, meeting summaries, transcripts, recordings, Vidcasts, spaces, and messages that the agent should retrieve.

## Implementation

The following implementation steps configure the MCP connections, enable the specific tools used by the assistant, and create a custom chat agent in Amazon Quick.

### Step 1: Confirm Cisco Webex MCP access

Cisco provides hosted Webex MCP server endpoints. You do not host these servers yourself. Before configuring Amazon Quick, confirm that the relevant MCP servers are enabled in [Webex Control Hub](https://developer.webex.com/mcp/docs/provisioning-on-control-hub). Also confirm that the user who authenticates from Amazon Quick can access the underlying Webex content.

The following table lists the hosted MCP server endpoints used in this solution.

**MCP server** | **Server URL**
---|
Webex Meetings MCP | https://mcp.webexapis.com/mcp/webex-meeting
Webex Messaging MCP | https://mcp.webexapis.com/mcp/webex-messaging
Vidcast MCP | https://mcp.webexapis.com/mcp/vidcast

Note: In Webex Control Hub, your organization admin must go to Apps > Agentic Apps. They select each MCP server, Webex Messaging, Webex Meetings, and Vidcast, and set Access to Allowed for all users or the appropriate user group. If these servers remain blocked, the OAuth connection from Amazon Quick will fail during integration setup. For details on provisioning and managing Agentic App access, see [Provisioning on Control Hub](https://developer.webex.com/create/docs/provisioning-on-control-hub).

### Step 2: Create Webex OAuth credentials

Create a [Webex OAuth 2.0 integration](https://developer.webex.com/docs/integrations) in the [Webex Developer Portal](https://developer.webex.com/). You can create one OAuth integration with the combined scopes, or create separate OAuth integrations for each MCP server. Separate integrations make least-privilege reviews and troubleshooting easier.

The following table summarizes the scopes to review for each MCP server.

**MCP server** | **Scopes to review**
---|
Webex Meetings MCP | `spark:mcp`, `meeting:schedules_read`, `meeting:participants_read`, `meeting:summaries_read`, `meeting:recordings_read`, `meeting:transcripts_read`
Webex Messaging MCP | `spark:mcp`, `spark:messages_read`, `spark:rooms_read`
Vidcast MCP | `spark:mcp`, `Identity:Organization`, `Identity:Config`

Optional: Enable write actions only after security review. Add `meeting:schedules_write` only if the Quick Agent must create, update, or delete meetings, and add `spark:messages_write` only if the Quick Agent must create messages or threaded replies. Write scopes allow the Quick Agent to create or modify Webex content. Keep them disabled for the initial rollout, require explicit user confirmation, log action invocations, and test in non-production spaces before enabling them broadly.

When configuring the OAuth integration, use the redirect URL that Amazon Quick displays during MCP integration setup. Store the Webex Client ID and Client Secret in [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) or another approved enterprise secrets manager. Restrict access to integration administrators, and rotate the secret according to your organization's credential rotation policy.

### Step 3: Add Cisco MCP integrations in Amazon Quick

After creating the OAuth integration, return to Amazon Quick and add the MCP integrations. Amazon Quick displays the Add integration flow for each MCP server, and you paste the OAuth client ID and secret from Step 2. The integrations are account-scoped, so every custom chat agent in the Amazon Quick account can use them after they are configured.

### Step 4: Create the custom chat agent

In Amazon Quick, create a custom chat agent and select the integrations that you added in Step 3. The agent name and description are visible to end users when they ask for the assistant, so make the purpose clear (for example, "Webex Meeting Prep and Follow-up Assistant").

The agent has access to the tools exposed by the three Cisco MCP servers, in addition to the 100+ pre-built action connectors and the enterprise data connectors that are available in Amazon Quick. The agent system prompt is the most important configuration for directing behavior.

## Example system prompt

The following is an example system prompt that the assistant uses to guide its behavior. Replace Project Phoenix with the name of your project or recurring meeting.

```
You are the Webex Meeting Prep and Follow-up Assistant. You help the user run recurring meetings more effectively by retrieving context from Webex Meetings, Vidcast, and Webex Messaging.

For prep flows:
- Resolve the upcoming meeting with webex-list-meetings.
- Retrieve meeting summaries, transcripts, and recordings with webex-get-meeting-summary, webex-list-transcripts, and webex-list-recordings.
- Find related Vidcast content with vidcast-search-videos, vidcast-list-shared-with-me, vidcast-get-video-highlights, and vidcast-get-video-transcript.
- Search Webex spaces and threads for unresolved follow-ups with webex-search-spaces, webex-search-messages, and webex-get-thread.
- Synthesize the outputs into a concise prep brief that lists upcoming agenda, key decisions and action items from prior meetings, related Vidcast updates, and any unresolved follow-ups.

For follow-up flows:
- Locate the meeting that just ended with webex-list-meetings.
- Retrieve the AI-generated summary with webex-get-meeting-summary, falling back to transcripts if the summary is incomplete.
- Find related Vidcast updates with vidcast-search-videos and vidcast-get-video-highlights.
- Locate the right Webex space with webex-search-spaces and webex-search-messages.
- Draft a follow-up message that captures the meeting summary, key decisions, action items, and any new Vidcast updates that the project should review. Ask before posting unless the user explicitly requests posting.

Always:
- Use only the tools exposed by the connected Cisco MCP servers and approved Amazon Quick connectors.
- Avoid sharing meeting summaries, transcripts, recordings, or message content with people who don't already have access in Webex.
- Ask before invoking write actions. Never create, update, or delete Webex content without explicit user confirmation.
- Keep responses concise and structured for the user to scan quickly.
```

## Customization

You can extend the assistant with additional enterprise data sources and pre-built action connectors that are available in Amazon Quick. Common extensions include:

- Pulling project context from Amazon S3, Google Drive, Microsoft SharePoint, or Atlassian Confluence.
- Drafting follow-up actions in Slack, Microsoft Outlook, Atlassian Jira, ServiceNow, or Salesforce through the pre-built action connectors.
- Adding an internal web or knowledge base connector for project documentation that lives outside the standard enterprise data sources.

For project managers, the most common customization is to include a third-party project tracker (Jira, Asana, ServiceNow) so that the assistant can also surface open tickets and recent changes when generating the prep brief.

## Cleaning up

To avoid unnecessary charges, remove the resources that you created for this solution if you no longer need them.

1. Remove the custom chat agent from Amazon Quick.
2. Remove the Cisco MCP integrations from Amazon Quick.
3. Revoke the Webex OAuth 2.0 integration in the Webex Developer Portal.
4. Disable the Webex MCP servers in Webex Control Hub if no other consumers need them.

## Conclusion

The meeting prep and follow-up assistant shows how Amazon Quick and the Cisco Webex MCP servers simplify recurring meeting workflows. The chat agent retrieves prior meeting summaries, transcripts, recordings, related Vidcast context, and Webex Messaging follow-ups, and synthesizes them into concise prep briefs and follow-up drafts. Teams can stay in one conversational workspace while the chat agent orchestrates the Webex MCP tools, the 100+ pre-built action connectors, and the enterprise data connectors. For project managers and team leads, the assistant turns the typical "15 minutes of digging before every meeting" into a single prompt.

For more information about Amazon Quick and MCP integrations, see the [Amazon Quick MCP integration](https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html) documentation and the [Cisco Webex MCP server](https://developer.webex.com/mcp/docs/webex-mcp-server-overview) documentation.
