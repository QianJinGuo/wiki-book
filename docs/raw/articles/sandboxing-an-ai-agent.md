---
title: "Sandboxing an AI Agent"
source_url: "https://sajalsharma.com/posts/sandboxing-an-ai-agent/"
ingested: 2026-07-02T11:40:01Z
sha256: placeholder
type: raw
tags: [newsletter, raw]
---

# Sandboxing an AI Agent

Title: Sandboxing an AI Agent

URL Source: https://sajalsharma.com/posts/sandboxing-an-ai-agent/

Published Time: 2026-07-01T00:00:00.000Z

Markdown Content:
## Table of contents

Open Table of contents
*   [Introduction](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#introduction)
*   [Agents Need Their Own Computer](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#agents-need-their-own-computer)
    *   [Enter Sandbox](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#enter-sandbox)
    *   [Why Use Sandboxes](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#why-use-sandboxes)
        *   [Containment](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#containment)
        *   [Parallelism](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#parallelism)
        *   [Reproducibility](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#reproducibility)
        *   [Resource governance](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#resource-governance)
        *   [Cheap recovery](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#cheap-recovery)

*   [Two Sandbox Architectures](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#two-sandbox-architectures)
    *   [The Sandbox as a Tool Backend](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#the-sandbox-as-a-tool-backend)
    *   [The Sandbox as the Agent’s Home](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#the-sandbox-as-the-agents-home)

*   [Picking an Architecture](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#picking-an-architecture)
*   [What’s Under the Hood](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#whats-under-the-hood)
*   [The Cost of Sandboxing](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#the-cost-of-sandboxing)
*   [Where This Goes](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#where-this-goes)
*   [References](https://sajalsharma.com/posts/sandboxing-an-ai-agent/#references)

## Introduction

The first time I watched an agent write a shell command and run it before I could finish reading it, I was on my own laptop: the one with my API keys, personal notes, calendar, financial records, and years of personal files. My agent of choice was a Claude Code instance, and I patiently monitored its every move, ready to stop it if things went south. I almost never watch that closely now.

We started by approving every command an agent wanted to run, then flipped on auto-approve because confirming each step was slowing us down. Where things are heading is long-horizon autonomy: agents that run for hours on a goal, planning, writing code, testing it, and correcting themselves, often on a schedule or in the background. That payoff is seemingly diminished if the agent has to stop and ask permission every few seconds, so the vetting that made this feel safe has largely gone away, partly by our own choice and partly because autonomy is the whole point. The code an agent writes increasingly just runs without explicit human approval.

That autonomy is also what makes this dangerous. An agent with a computer holds the three ingredients Simon Willison named the [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/): access to private data, exposure to untrusted content, and a way to send data out. A page it browses, a file it opens, a ticket it processes can hide an instruction, and the agent will follow it with the full reach of the machine it runs on. How far that reach goes depends on the computer underneath. We have put a lot of thought into the tools we give an agent and different permission modes. We used to put far less into the computer we give it. Sandboxes are changing that.

To get a feel for sandboxing, I took two tasks and wired up two ways an agent can sit in a sandbox, on a hosted provider (Daytona, with Modal along the way). What follows is my understanding of sandboxes for AI Agents, and some companion notebooks of my experiments in [this repo](https:
