sha256: b758216d521454f2389320354c52c21a3240766f81b6c708371cdf6e68a3e837
---
title: "Google Antigravity agents get full context with GitLab Orbit"
source_url: "https://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/"
ingested: 2026-06-29
type: article
tags: []
---

# Google Antigravity agents get full context with GitLab Orbit


Published Time: Tue, 16 Jun 2026 09:08:00 GMT

Markdown Content:
Developers working in Google Antigravity can now install our lifecycle context graph, [GitLab Orbit](https://about.gitlab.com/blog/introducing-gitlab-orbit/), directly from the [Antigravity MCP Store](https://antigravity.google/docs/mcp) and give their agents structured access to projects, pipelines, merge requests, vulnerabilities, and source code across their GitLab instance.

The Orbit integration is a new addition to a family of purpose-built GitLab integrations already in the Google Cloud ecosystem and brings GitLab's context layer into Google's agent-first development platform.

## [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#query-your-software-lifecycle-within-antigravity)Query your software lifecycle within Antigravity

Antigravity agents, without GitLab Orbit, can see the files and reach the terminal. They do not understand the broader system: which services depend on the code being changed, whether similar vulnerabilities have been flagged elsewhere, or who reviewed comparable changes in the past. That context lives in your DevSecOps platform. Getting it to a coding agent has meant using custom scripts or copy-pasting between tools.

GitLab [Orbit](https://docs.gitlab.com/orbit/) indexes your GitLab instance and builds a knowledge graph of relationships between groups, projects, users, work items, merge requests, pipelines, vulnerabilities, and source code. It surfaces that graph through two [MCP tools](https://docs.gitlab.com/orbit/remote/access/mcp/): `query_graph`, which executes structured queries, and `get_graph_schema`, which returns available node types, properties, and relationships.

With this integration, an Antigravity agent can be more accurate and you can answer the most complex questions about your software lifecycle with this context layer:

*   Which projects depend on this module, and will this change break them?
*   Have any unresolved vulnerabilities been found in this project?
*   Based on past reviews and file ownership, who should review this merge request?
*   Which projects produce the most pipeline failures in this group?

The agent composes the query in GitLab Orbit's JSON DSL and gets typed results back, instead of requiring you to switch between browser tabs and paste context into the coding platform.

In [early internal tests](https://about.gitlab.com/blog/gitlab-transcend-announcements/), agents grounded with GitLab Orbit responded up to 11 times faster, used up to 4.5 times fewer tokens, and produced up to 45 times fewer hallucinations.

## [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#key-user-journeys)Key user journeys

With GitLab Orbit and Antigravity, several key user journeys are enhanced by the interoperability of the two services.

### [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#blast-radius-analysis)Blast radius analysis

Before refactoring a shared auth library, an engineer asks an Antigravity agent connected to GitLab Orbit: What depends on this module? Which open merge requests touch those files? And who owns them? The agent queries the knowledge graph and returns all three in one answer: the importers, every in-flight merge request against those files, and their owners. The engineer sees which open work the refactor will collide with, and who to involve, before editing a line. Without Orbit, the same agent sees only the open files and the terminal, with no ability to query the importers, merge requests, and owners that live in GitLab.

![Image 1: Blast radius visual map](https://res.cloudinary.com/about-gitlab-com/image/upload/v1782388863/gtlc39awbobl0ugplmkj.png)

### [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#onboarding-and-codebase-exploration)Onboarding and codebase exploration

A developer returning to an unfamiliar service asks for its dependencies, entry-point files, and the merge requests opened against it this week. The agent runs the queries against the knowledge graph and produces a Walkthrough Artifact, a scannable map the developer keeps rather than a chat answer that scrolls away. Orbit reindexes within minutes of a change, so the map reflects the service as it is today, not the stale wiki that onboarding usually relies on.

![Image 2: GitLab Orbit for onboarding and codebase exploration](https://res.cloudinary.com/about-gitlab-com/image/upload/v1782388863/hiy6gvv4bpxgrowoj5xo.png)

### [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#dependency-mapping-with-image-generation)Dependency mapping with image generation

A tech lead queries GitLab Orbit for a group's service-dependency structure and has the agent render it as an architecture diagram with [Nano Banana Pro](https://deepmind.google/models/gemini-image/pro/). Its nodes and edges are drawn from the live graph rather than relying on a diagram that's already out of date. For a narrower view, like only the services with open security findings, the tech lead re-queries and regenerates a diagram. Every query is filtered to what the tech lead can access, so the diagram is safe to share as-is. A text-only agent can't turn a graph query into a diagram, let alone keep it current. GitLab is building the same capability natively as a Software Architecture Map; in Antigravity, it works today.

![Image 3: GitLab Orbit for dependency mapping](https://res.cloudinary.com/about-gitlab-com/image/upload/v1782388863/z5aymr3myuiavp2vbvui.png)

## [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#install-from-the-mcp-store-in-clicks)Install from the MCP Store in clicks

Antigravity's [MCP Store](https://antigravity.google/docs/mcp) is a built-in integration hub inside the settings. It uses the [Model Context Protocol](https://modelcontextprotocol.io/) to connect agents to external tools and services in a standardized way.

Open the MCP Store panel from the settings. Within the customization tab, find the MCP section. Click “Add MCP” and add GitLab Orbit. Authenticate with GitLab through the on-screen prompts. Once installed, Orbit's tools are automatically available to your agents. No config files or terminal setup required.

## [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#build-on-the-same-context-that-powers-gitlab-duo-agent-platform)Build on the same context that powers GitLab Duo Agent Platform

GitLab Orbit is the same engine that provides context to [Duo Agent Platform](https://about.gitlab.com/gitlab-duo-agent-platform/). For platform engineering teams managing large GitLab instances, agents working inside Antigravity draw on the same governed knowledge graph as agents working inside GitLab, without a separate context pipeline to configure and maintain.

Orbit indexes code in Ruby, Java, Kotlin, Python, TypeScript, JavaScript, Rust, and C# from the default branch, and reindexes within minutes of a change. Queries through MCP consume [GitLab Credits](https://docs.gitlab.com/subscriptions/gitlab_credits/); calls to `get_graph_schema` are free.

## [](http://about.gitlab.com/blog/gitlab-orbit-and-google-antigravity/#get-started)Get started

GitLab Orbit is available for [GitLab Premium and Ultimate tiers](https://docs.gitlab.com/subscriptions/) on GitLab.com. To try it out, [turn on Orbit for your top-level group](https://docs.gitlab.com/orbit/remote/getting-started/), then install the GitLab Orbit integration from the Antigravity MCP Store.

> If you are not yet using GitLab Duo Agent Platform, start with [a free trial](https://about.gitlab.com/gitlab-duo-agent-platform/).
> 
> 
> If you are on GitLab's Free tier, [sign up for Duo Agent Platform](https://docs.gitlab.com/subscriptions/gitlab_credits/#for-the-free-tier-on-gitlabcom) with these steps.
> 
> 
> If you are a GitLab Premium or Ultimate subscriber, [turn on Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/turn_on_off/) and use the GitLab Credits [included](https://docs.gitlab.com/subscriptions/gitlab_credits/#included-credits) with your subscription.

