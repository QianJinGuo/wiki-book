---
title: How Developers Can Build Agentic Agreement Workflows on Docusign IAM
type: raw
source: newsletter
source_url: https://www.docusign.com/blog/developers/momentum-26-agentic-agreement-workflows
sha256: 8e246c7d0fdd
created: 2026-05-22
updated: 2026-05-22
---

# How Developers Can Build Agentic Agreement Workflows on Docusign IAM


Published Time: 2026-05-21T00:00:00.000Z

Markdown Content:
Developers are being asked to build agreement workflows that didn't exist a year ago. Modern agreement experiences need to ingest agreements from different systems, extract structured data, make that data available to agents, expose trusted actions to AI clients, and keep the full integration lifecycle governed.

That creates a new kind of developer challenge: connecting agreement data, agents, AI tools, workflows, and permissions without building a fragile set of one-off integrations.

At Momentum '26, Docusign is introducing a set of capabilities for developers building agentic agreement workflows on IAM.

Together, these capabilities give developers a more complete path for building agentic agreement workflows: connect agreement data through the Agreement Manager API (formerly Navigator API), build and manage implementations with the Developer Console and IAM Toolkit, and create or integrate agents with Agent Studio and Docusign MCP Server.

This post covers what each capability does, how they fit together, and how builders can decide where to start based on common implementation needs.

**Key takeaways**

*   For developers building agentic agreement workflows, Docusign’s Momentum ’26 capabilities provide the building blocks for ingesting agreement data, configuring extraction, creating agents, exposing tools through MCP, and managing integrations

*   The Agreement Manager API and IAM Toolkit help teams operationalize agreement data at scale

*   Agent Studio and Docusign MCP Server help developers build governed agents and expose trusted agreement actions to AI clients

*   The Developer Console gives teams a central place to manage integration keys, promotion, usage monitoring, and developer access

## **What launched at Momentum ’26 for developers**

**Capability****Availability****What it helps developers do**
**Agent Studio**Early Access Build and govern custom agents grounded in agreement context that can orchestrate IAM tools and operate within Docusign workflows.
**Docusign MCP Server**Global Open Beta Connect Docusign agreement capabilities to MCP-compatible AI clients such as Claude and Gemini.
**Agreement Manager API**Generally Available Ingest large volumes of agreements into IAM, track job and document status, and trigger downstream workflows when Iris extraction completes.
**Docusign Developer Console**Open Beta Manage integration keys, promote integrations from demo to production, monitor usage, and assign developer roles from one place.
**IAM Toolkit**Open Beta Configure, test, package, and deploy Agreement Manager implementations using a repeatable CLI-based, configuration-as-code workflow.

## **Build and govern agents with Docusign Agent Studio**

[Agent Studio](https://www.docusign.com/products/agents) is the builder and governance layer for custom agents inside IAM. It helps teams turn business logic, internal policies, and historical agreement context into specialized agents.

With **Agent Studio****_(Early Access)_**, builders can:

*   Explore a centralized agent library with pre-built agents, templates, and custom agents developed by users in their organization.

*   Leverage pre-built agents that already support agreement tasks in IAM, such as intake and triage, drafting and redlining, and renewal management.

*   Build and customize agents using natural language, grounded in agreement history, business policies, and internal playbooks. Then, give agents capabilities like reviewing and managing requests, sending envelopes, or searching 3rd party systems like Salesforce.

*   Test agent reasoning, define structured outputs, and configure agents to operate reliably in agreement workflows.

*   Deploy agents through Iris or Workflow Builder, with logged actions and human-in-the-loop approvals.

Agent Studio is where agents are created, tested, and governed. Teams can control who can build an agent, what agreement data it can access, what business context it uses, where it participates in the agreement lifecycle, and how its actions are reviewed and audited.

## **Connect Docusign to external AI platforms with MCP Server and Docusign Developer Console**

The Docusign MCP Server acts as the primary gateway for exposing IAM capabilities to external AI clients. For custom connectors or pro-code integrations built using the MCP Server, the Developer Console provides a single environment for registering and managing integration keys required to securely integrate with Docusign.

### **Docusign MCP Server**_(Global Open Beta)_

The [Docusign MCP Server](https://developers.docusign.com/platform/mcp-server/) is designed to connect Docusign tools to MCP-compatible clients, starting with supported connectors such as Claude and Gemini.

How the connection works:

1.   A developer connects an AI client, such as Claude or Gemini, to the Docusign MCP Server

2.   The user authenticates via OAuth before any data or actions are accessible

3.   The server exposes available tools, such as Get Envelope Status or Search Agreement Manager

4.   The server enforces permissions so AI agents only see what the authenticated user is authorized to access in their Docusign account

With the MCP Server in Global Open Beta, developers can call Docusign agreement tools from any compatible AI client using natural language, build workflows that trigger agreement operations (sending envelopes, checking status, ingesting agreements, extracting data), and rely on the same OAuth-based security and access controls as with direct API calls.

MCP sits alongside REST APIs as the agentic integration surface. For deterministic, code-first workflows, REST is still the right choice. MCP is designed for the dynamic, tool-calling patterns that AI agents use at runtime. Many production setups will use both.

**Supported clients:**MCP connectors for Anthropic Claude, Google Gemini, Microsoft Copilot, and GitHub Copilot are available now at varying release stages. Additional connectors are rolling out in 2026. For the current list of Docusign capabilities exposed via MCP and their release stages, see the [MCP Server documentation](https://developers.docusign.com/platform/mcp-server/) for the current connectors.

### **Docusign Developer Console**_(Open Beta)_

The [Docusign Developer Console](https://developers.docusign.com/extension-apps/developer-console-overview/) gives developers one place to manage the integration lifecycle: create and manage integration keys, promote integrations from demo to production, monitor logs and usage, and assign scoped developer roles for internal teams, SIs, and contractors.

Previously, this meant switching between separate demo and production accounts. With the Developer Console, developers can work from a single production account and promote integrations in one step without manual credential handoffs or separate go-live requests.

Developer Console is the control plane for the integration lifecycle, regardless of which Docusign APIs or protocols a team is building on. See [this resource](https://developers.docusign.com/platform/create-ik-developer-console/) to get started.

## **Ingest and manage agreement data with Agreement Manager API**

The Agreement Manager API handles the agreement data layer: getting agreements into Agreement Manager at scale and integrated contract intelligence programmatically for for search, retrieval, and downstream workflows. That includes bulk ingestion from disconnected sources job-level status tracking, query and retrieval capabilities, and real-time webhooks when agreements are updated or extraction completes.

### **Agreement Manager API**_(GA)_

The [Agreement Manager API](https://developers.docusign.com/docs/agreement-manager-api) is now generally available. Here's what's available at GA:

*   **Bulk ingestion**: Upload large agreement corpora from any source: Salesforce, Google Drive, SharePoint, legacy repositories, or acquired company systems

*   **Job- and document-level status tracking**: Monitor ingestion jobs and individual document states programmatically

*   **Direct-to-cloud upload**: Stream agreements to Agreement Manager without intermediate storage

*   **Connect webhooks**: Get real-time notifications when agreements are updated, deleted, or when Iris extraction completes

Once agreements are ingested, Iris analyzes them and extracts structured data: key fields, obligations, dates, parties, and clause history. That extracted data is available to agents via MCP tools, surfaced in Agent Studio, and queryable by downstream systems.

For implementation details, rate limits, and migration patterns from the Agreement Manager API, see the[Agreement Manager API overview](https://developers.docusign.com/docs/navigator-api/) or learn more in [this FAQ.](https://community.docusign.com/navigator-api-139/docusign-agreement-manager-api-faq-27066)

## **Accelerate implementations with the IAM Toolkit**

### **IAM Toolkit**_(Open Beta)_

For SIs and enterprise developers deploying Agreement Manager across multiple environments, the [IAM Toolkit](https://developers.docusign.com/iam-toolkit/) helps teams move from one deployment to many without rebuilding configuration from scratch each time. It's a CLI that replaces manual setup tasks with a repeatable, configuration-as-code workflow.

Key capabilities:

*   **Custom configuration**: Extend Agreement Manager with custom types and fields.

*   **Extraction testing**: Validate Iris extraction accuracy against ground truth values before deploying to production

*   **Multi-account deployment**: Build a configuration package once and deploy it to multiple production accounts

*   **Bulk ingestion via CLI**: Ingest agreements along with metadata at scale from local or network filesystems as part of an implementation workflow

The toolkit is in open beta and is [available here.opens in a new tab](https://www.npmjs.com/package/@docusign/agreement-cli)

## **How the pieces fit together: a real-world example**

Here’s how the full stack can support a real agreement workflow.

A legal team needs to centralize a large repository of supplier contracts, NDAs, and MSAs spread across multiple systems, extract structured data from them, and surface that data to agents that can act on renewals, flag risks, and trigger downstream workflows.

With the full stack:

1.   Configure extraction to match the organization’s agreement types and fields using the**IAM Toolkit**, defining, testing, and deploying custom configurations as code

2.   Bulk ingest the agreement corpus using the **Agreement Manager API**, streaming directly from source systems or using the **IAM Toolkit** when agreements live in a network or local directory.

3.   **Iris** extracts structured data from every ingested agreement: key fields, obligations, dates, parties, clause history, and past negotiation positions

4.   In **Agent Studio**, build and customize agents grounded in the organization’s playbooks and policies,and add them as a step to an agreement workflow

5.   Connect external AI clients to Docusign capabilities via **MCP Server,** enabling the use of natural language to create, commit, and manage agreements in Docusign from third-party platforms

6.   Manage the integration lifecycle in the **Developer Console**: registration, environment promotion, monitoring, and developer roles all in one place

## **Where to start**

Where you start depends on the problem you’re solving.

**If you want to…****Start with…****Why**
Configure Agreement Manager for your specific agreement types or fields IAM Toolkit Use it to define custom types and fields, test Iris extraction accuracy, and deploy configuration packages across accounts as code.
Bring a large volume of agreements into IAM Agreement Manager API Use it to bulk ingest agreements from source systems, track ingestion status, and receive webhook notifications when extraction completes.
Build or customize an agent inside IAM Agent Studio Use it to create, test, and govern agents grounded in your organization’s agreement history, policies, and playbooks, and add them as steps in IAM workflows.
Let an AI client call Docusign tools Docusign MCP Server Use it to expose Docusign capabilities to MCP-compatible clients so users can take agreement actions through natural language from third-party platforms.
Manage integration keys, roles, promotion, and monitoring Docusign Developer Console Use it as the control plane for managing the integration lifecycle across Docusign APIs and protocols (REST, MCP, and more).
Extend an existing eSignature or IAM integration with agentic capabilities Docusign MCP Server + Docusign Developer Console Use MCP Server as the agent-facing tool layer, and the Developer Console to manage the underlying integration setup, promotion, and monitoring.

## **Common questions answered**

**How do I connect Claude or Gemini to Docusign?** Use the Docusign MCP Server to connect supported MCP-compatible AI clients, such as Claude or Gemini, to Docusign. Users authenticate with OAuth, and the server exposes approved Docusign tools the client can call through natural language. The MCP Server enforces Docusign permissions, so the AI client can only access what the authenticated user is authorized to use. See the[MCP Server docs](https://developers.docusign.com/platform/mcp-server/) to get started.

**How should developers think about MCP Server versus REST APIs?**REST APIs are still the right fit for deterministic, code-first workflows where the application controls the execution path. The Docusign MCP Server is designed for agentic workflows where an AI client dynamically discovers and calls trusted tools at runtime. Most production implementations will likely use both: REST APIs for reliable background processes and MCP for the agent-facing tool layer.

**How do I build a custom agent inside IAM?**Use [Agent Studio](https://www.docusign.com/products/agents)to create, test, deploy, and govern custom agents inside IAM. Builders can define what an agent should do, ground it in agreement data and business context, and add it to IAM workflows such as intake, review, renewals, or obligation management. Agent Studio also supports governance, including who can use an agent, what data it can access, and how its actions are logged.

**How do I manage multiple Docusign integrations across demo and production?** Use the Docusign Developer Console. It lets you create and manage integration keys across both environments from a single production account, assign developer roles, and promote integrations to production without the legacy Go-Live process. See the[Developer Console overview](https://developers.docusign.com/extension-apps/developer-console-overview/).

**How do these capabilities work together in a production workflow?**Each capability supports a different part of the agentic agreement workflow lifecycle. [Agreement Manager API](https://developers.docusign.com/docs/navigator-api/) and [IAM Toolkit](https://developers.docusign.com/iam-toolkit/) help operationalize agreement data. Agent Studio helps teams create and govern agents. MCP Server exposes approved Docusign tools to AI clients. Developer Console helps teams manage keys, environments, roles, and monitoring.

**What is the availability and pricing for these capabilities?**Availability varies by capability. Agreement Manager API is generally available. Docusign MCP Server is in Global Open Beta. Developer Console and IAM Toolkit are in Open Beta. Agent Studio is in Early Access. For pricing, developers should contact their Docusign account team for the latest availability and packaging details.

## **Resources**

*   **MCP Server**_(Global Open Beta)_ —[MCP Server overview and tools](https://developers.docusign.com/platform/mcp-server/)

*   **Agreement Manager API**_(GA)_ —[API overview](https://developers.docusign.com/docs/navigator-api/) | [FAQ article](https://community.docusign.com/navigator-api-139/docusign-agreement-manager-api-faq-27066)

*   **Agent Studio**_(Early Access)_ — [Agents overview](https://www.docusign.com/products/agents) | _Developer resources coming soon_

*   **Developer Console**_(Open Beta)_ —[Developer Console overview](https://developers.docusign.com/extension-apps/developer-console-overview/)

*   **IAM Toolkit**_(Open Beta)_ — [IAM Toolkit overview](https://developers.docusign.com/iam-toolkit/)

If you're building on any of these surfaces, head over to the [Docusign Developer Center](https://developers.docusign.com/) to learn more and sign up for a [free developer account](https://www.docusign.com/developers/sandbox). The Docusign [Developer Community](https://community.docusign.com/developer-59) is also a great place to ask questions, share what you're working on, and connect with other builders.

For more information about Momentum ‘26 announcements, visit [this Docusign blog](https://www.docusign.com/blog/new-ai-assistant-and-agents).


---

> 来源：[[raw/articles/how-developers-can-build-agentic-agreement-workflows-on-docu|原文存档]]
