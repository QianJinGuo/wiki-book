---
source_url: "https://www.snowflake.com/en/blog/agentic-resource-discovery-specification/"
ingested: 2026-06-26
sha256: 4c2d96fe22f0b36c
---

# Exploring Agent Discovery: Snowflake and the Agentic Resource Discovery Specification

Published Time: 2026-06-17T17:55:14.408Z

Today, Snowflake is announcing our support for the Agentic Resource Discovery (ARD) Specification, an open protocol that standardizes how AI agents and tools are cataloged, searched and discovered across an enterprise. Developed in collaboration with Microsoft, GoDaddy and many others, ARD addresses a real and growing issue: how to discover all the agents available to an enterprise user through whatever interface they are using.

## From deploying agents to finding them

AI clients can already invoke external tools, MCP servers, APIs, workflows and agents. The natural next question is: how does an AI client automatically find the best capability for a given task, across everything an organization has built and approved?

That is the discovery layer, and it is what turns a collection of individual agents into an interconnected, enterprisewide capability network. When discovery works, the agent a data team ships on Monday is available to a sales rep on Tuesday through Snowflake CoWork, Snowflake CoCo, Microsoft Copilot or any AI interface, without anyone manually wiring it up.

ARD creates that discovery layer for AI capabilities. A client describes a task in natural language, and ARD returns matching agents along with what each agent does, who provides it and how to reach it, ranked by relevance.

## How ARD works

ARD is a lightweight, domain-anchored discovery specification. It defines how agentic resources, MCP servers, A2A agents, Skills, and traditional API tools are cataloged, searched and dynamically discovered across composable, federated networks of discovery services.

The architecture follows four steps:

1. **Describe:** A resource publisher creates a standard manifest (`ai-catalog.json`) that describes what the agent does, what tasks it handles and how to invoke it. The manifest lives on the publisher's own domain.
2. **Curate:** A discovery service builds its collection by crawling published catalogs, ingesting internal inventories or applying its own policies. Enterprises control exactly which agents are included.
3. **Search:** Clients query the discovery service with natural-language text and optional filters. The service returns ranked entries with schemas and endpoints.
4. **Execute:** The client connects directly to the selected resource over its native protocol (MCP, A2A, REST). The discovery service never sits in the invocation path; authentication and data access stay between client and agent.

Discovery services can also compose. An enterprise can run one ARD endpoint that merges internal agents with selected vendor and public resources so employees see a unified answer set, while the organization retains control over what is included.

## What this means for Snowflake Cortex Agents

Here is how we envision ARD working with Snowflake Cortex Agents: A team builds an agent in Snowsight, Snowflake CoCo or through the Cortex Agent APIs. That agent automatically gets an ARD manifest. A sales rep opens CoWork or Copilot, describes what they need and the agent shows up in the results — ready to use, with no integration work required.

The agent a data team ships on Monday is available to a sales rep on Tuesday through Snowflake CoWork, Snowflake CoCo, Microsoft Copilot or any AI interface, without anyone manually wiring it up.

## Build

Create your first Cortex Agent and use it in Snowflake CoWork with the quickstart.

## Read

Check out the Snowflake CoWork blog and Snowflake CoCo blog to learn more.
