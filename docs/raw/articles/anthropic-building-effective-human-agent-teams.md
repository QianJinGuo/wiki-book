---
title: "Building effective human-agent teams"
source_url: "https://claude.com/blog/building-effective-human-agent-teams"
type: article
created: 2026-06-26
updated: 2026-06-26
sha256: e469c79050aa9f9c8bb880d9aed94e8960c5acde68aab082888d96b98a4711a1
---

# Building effective human-agent teams


Published Time: Jun 24, 2026

Markdown Content:
Working with AI used to mean one person interfacing with a single chat window. Over time, AI has become increasingly capable at handling complex, long-running work, like coding, research, and financial analysis. With this, we’ve seen many new ways to use AI—from the terminal and IDE to spreadsheets and decks—but the work has still very much been a “single-player” experience: one human worked with one agent to accomplish individual tasks.

This is changing with the release of tools like [Claude Tag](https://www.anthropic.com/news/introducing-claude-tag). Now, humans and agents can work together in the same workspace, collaborating in service of goals shared by a team. Work now looks a lot more like a _multiplayer game_, with teams of humans setting the strategy, and Claude executing the work.

This involves some new ways of working. At Anthropic, we’ve been testing the technology required to make human-agent teams successful for the last several months. In this article, we explain what multiplayer agents are, and the lessons we’ve learned for building with them.

![Image 1](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a3c1e1e24f66edde9ee63db_Claude-Tag-v2%402x.png)

## **What are multiplayer agents?**

“Multiplayer agents” is how we refer here to AI models that work with many different humans at the same time. Much like regular agents, they have their own [memory](https://platform.claude.com/docs/en/managed-agents/memory) and [skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills). But in other respects they're quite different. They have their own [credentials](https://www.anthropic.com/engineering/managed-agents) and they live in places where work happens. At Anthropic, that's inside team collaboration tools like Slack.

Here’s an example of a human-agent team analyzing a dataset together in Slack:

![Image 2](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a3be9ec0c7dd123eea0fcea_85b9b96b.png)

For agents to productively participate in a team channel, they need specific capabilities:

*   [**Persistent memory,**](https://platform.claude.com/docs/en/managed-agents/memory) so they can remember goals and tune their execution towards them
*   [**Credentials not tied to humans**](https://www.anthropic.com/engineering/managed-agents)**,** so they can operate within safe, predictable guardrails
*   [**Ongoing broad access to information**](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**,**so they can learn how the organization works and take action to execute tasks in service of the team’s goals

These capabilities amount to the technical foundation required for an agent to participate productively across a team of many humans. However, making human-agent teams _successful_ requires more than this: teams need specific ways of working and shared norms, too.

## **Lesson 1: Work in public and give agents broad context**

Teams at Anthropic share information proactively and openly. This is especially true when agents are on the team, because agents build their understanding entirely from the text a team makes searchable: Slack, code, docs, and meeting notes. Private messages, hallway conversations, and restricted documents can’t provide agents with context. For an agent, if it’s not written down and accessible, it doesn’t exist.

Instead of deciding what information should be available to agents one doc or Slack channel at a time, we use clearly defined security boundaries that apply to entire Slack workspaces, as well as to meeting transcripts and doc libraries. Within the security boundary, context flows to every teammate—whether human or AI. Not only does this increase what agents and humans get access to, it also reduces confusion about what can be shared and with whom. Humans and agents alike find it difficult to navigate the soft boundaries of per-item sharing: _should this channel be public or private? Can I share this doc with that person? Is this agent allowed to see that thread?_ A small number of clear, workspace-level boundaries removes decision fatigue from day-to-day work.

A high degree of transparency has a reward. For instance, agents that can read decisions from team meetings won't suggest tasks or projects that were deprioritized. Agents with access to product specs beyond their own team can recommend patterns that have succeeded for others. And because agents can read enormous volumes of text far faster than humans do, they routinely surface relevant work that humans would otherwise have missed. We lean on our agents heavily to stay informed and coordinated in a busy, fast-moving industry.

At Anthropic, working in public looks like:

*   Choosing a handful of security boundaries at the company and creating workspaces and document sharing settings that match each security boundary
*   Defaulting new communication channels to public within the organization, and ensuring decisions land in channels, docs, and meeting notes every time
*   Writing artifacts and meeting notes so that agents can find them, since agents are now a primary consumer of team documentation
*   Making sure AI has access to the right tools and information needed to get their job done

Defaulting information to be internally public can require cultural shifts. However, the difference between human-agent teams with context and those without is too stark to ignore.

Of course, some interactions are sensitive and will need to be private between a single human and AI. For those, with Claude Tag you can send @Claude a direct message, or you can use the existing [Claude.ai](http://claude.ai/) and Claude Cowork applications. These tools give Claude access to private information via your personal MCP connectors, with the knowledge that your conversation and what you share with the agent will remain private.

## **Lesson 2: Every human and agent get a defined role with the right tools for the job**

Human-agent teams share one roster, one set of artifacts, and one working space. Agents have their own [credentials](https://www.anthropic.com/engineering/how-we-contain-claude), [skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), and tool access. Different agents also hold different roles: for instance, while one might own the data analysis for a project, another will hold and enforce the design standard, and a third will run research synthesis.

When a project kicks off, humans chat with the agents to figure out which roles to assign, and how the humans and agents will work together.

![Image 3](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a3bf2ac55e5efdefd1d06fb_LAUNCH%20ROOM.png)

Once the jobs for humans and agents are clear, an agent might spin up other agents to make sure that specific tasks are handled by the agents with the right memory and appropriate access. Importantly, they need access to all the tools required to accomplish the job: one that handles data analysis might need access to BigQuery, and one that performs QA might need access to the Playwright MCP.

Clearly defined roles and responsibilities set human-agent teams up for success. Humans often work in the same threads the agents do, but they hold the roles only humans can hold. This ensures everything works together and human judgment is applied to the most important decisions. Without clear roles, people end up running fleets of personal AIs on the side, duplicating work and fracturing the team's context. Metrics tracking is a common case: a multiplayer agent can do the job once and let everyone see the same numbers.

At Anthropic, having clearly defined roles on human-agent teams looks like:

*   An agreed-upon task set: the team's humans and its agents agree on who does what
*   Humans and agents working in the same shared threads, so anyone can pick up where anyone left off
*   Humans
