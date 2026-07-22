---
title: "Build the Agent or Power the Agent?"
source_url: "https://tanayj.com/p/build-the-agent-or-power-the-agent"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: ff7a1e1946356443a6ede854bfaf8bfd9e4572ad0c1e54b19fb4d26ed2d75261
---

# Build the Agent or Power the Agent?


Published Time: 2026-06-24T22:09:58+00:00

Markdown Content:
_I’m Tanay Jaipuria, a partner at [Wing](https://www.wing.vc/) and this is a weekly newsletter about the business of the technology industry. To receive Tanay’s Newsletter in your inbox, subscribe here for free:_

Hi friends,

A question I keep coming back to with founders is some version of this: should you build an agent, or should you power the agent your customer is already using?

For a growing number of people, the default place they do knowledge work is now a horizontal agent: Claude Code/Cowork, Codex, Copilot. That’s where the day starts and where a lot of the tasks already happen.

So if you’re building a product, you face a fork. Either you try to become the agent for some set of users, the thing they open instead of the horizontal one. Or you accept that they live in the horizontal agent and show up there, powering it for the slice you’re good at.

In this piece, I’ll cover:

*   What “build the agent” and “power the agent” actually mean

*   How to figure out which way you lean

*   What doing both entails realistically

[![Image 1: Build the agent versus power the agent](https://substackcdn.com/image/fetch/$s_!Vy-T!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc2a179c8-1a6b-43c1-b21f-8c5afa9b9d99_2400x1440.png)](https://substackcdn.com/image/fetch/$s_!Vy-T!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc2a179c8-1a6b-43c1-b21f-8c5afa9b9d99_2400x1440.png)

Building the agent means that for some set of users, you want to be the core agent. Not as a connector inside Claude / ChatGPT, but the core interface they open instead of it.

The appeal is obvious. You own the interface and you capture the usage and are the go to across the jobs to be done the user has.

The catch is that you increase friction for adoption of your product and are now going heads up against ChatGPT / Claude Cowork / Codex, etc.

It can make sense in two cases. The first is when you’re the system of record (and or action/engagement already), so your users already live in your product all day and a native agent inside it beats sending them elsewhere. The second is when the domain reasoning is the product, where the work is specialized enough that a horizontal agent can’t do it well enough. Both essentially mean that your product is verticalized enough that for some subset of users it can be the core agent they use on a daily basis.

Harvey is one example. It’s betting that for lawyers, it can be the core agent rather than a feature inside a horizontal one. The same logic holds for other vertical players going deep on a single profession. The bet is that the work is specific enough to justify a dedicated agent.

As general harnesses improve however, there is a risk that some competitors in these verticals take a “power the agent” approach and meet customers where they are - in another horizontal agent.

If a general agent already does most of someone’s job, convincing them to switch to yours for a slice of it is a hard sell.

The other path is to accept that your customer lives in a horizontal agent, and make that agent better at your domain instead of trying to replace it.

The usual form is an MCP server but a clean CLI or a well designed API built with agents in mind also works as well.

You are essentially building a version of your product meant to be used and consumed by an agent, most often a horizontal agent.

So what value does your product provide in this case?

1.   **Data and Context**. Some products are valuable because of the data and actions they sit on, not because of any interface, and the move is to expose that data to wherever the customer already is. Some good examples include Granola which launched an MCP to allows its context to be consumed by agents.

2.   **Capabilities and Actions**. The other value lever is to broaden or improve the set of capabilities and actions that the horizontal agent can take by giving it access to your product. One example of this is Higgsfield, an image and video generation platform, which ships an MCP server so that horizontal agents can use their reasoning and ability on orchestration and leverage Higgsfield’s products expertise in rendering and generating images and videos.

In practice, most taking this approach will want to find ways of adding value in both dimensions - data/context and capabilities/actions.

Its interesting to see that the incumbents are moving in this direction as well. Salesforce announced “Headless 360” in April 2026, exposing the whole platform as APIs, MCP tools, and CLI commands, with the framing that the API is the UI. HubSpot followed with a remote MCP server giving any compatible agent read and write access to CRM data.

[![Image 2: Four questions to decide whether to build or power the agent](https://substackcdn.com/image/fetch/$s_!w_f8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff231b681-7471-485e-9d0d-9f41791ac009_2240x1320.png)](https://substackcdn.com/image/fetch/$s_!w_f8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff231b681-7471-485e-9d0d-9f41791ac009_2240x1320.png)

I think there are a few considerations for founders/builders to decide whether they should build an agent or power the agent.

**Where does your customer already work?** Inside a tool you control or inside a horizontal agent all day? The further toward the general agent, the more you should power it, because pulling them somewhere new is going to be challenging.

**Do you own the whole dataset/workflow, or a slice?** If you own the full picture for a workflow or set of workflows, you can credibly be the agent for it. If you own a slice that only becomes useful once it’s combined with other data, the orchestration happens up in the agent, so you almost have to power it.

**Where does your value live?** Does the value live in the domain reasoning itself or in the data and the actions? Reasoning-heavy and specialized domains / more verticalized approaches leans towards build. Data and actions lean towards power.

**How much does the work stay inside one app?** High control, regulated, multi-step judgment leans build. Composable and single-capability leans power.

[![Image 3: Most products end up doing both](https://substackcdn.com/image/fetch/$s_!h2n2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F03e37903-a803-4c79-bc33-d1eeec79bc84_2560x1480.png)](https://substackcdn.com/image/fetch/$s_!h2n2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F03e37903-a803-4c79-bc33-d1eeec79bc84_2560x1480.png)

I think the reality is that many companies will end up doing both. You layer an agent into your own interface, and then you also expose an MCP or headless version of their product, especially as the cost to build has decreased.

Even though you may do both, I think it is important to remember that the user base for both sets of users might look slightly different. You build the agent for the users who live in your product (i.e., power users), and you power the agent for everyone else who only needs you for a slice of their job.

Some examples of this may include:

*   For a CRM like Salesforce, certain sales power users may still interact with the core product and an agentic version of the product within Salesforce itself. Other users will mostly consume Salesforce via the headless version through ChatGPT to pull pipeline (combined with other data from other systems) as part of the analyses and work that they’re doing.

*   For something like Figma, many designers will still use the core Figma interface and the Figma design agent within that interface to do their tasks better. Meanwhile, other roles like marketing, developers, and product managers may use the Figma MCP or the Figma Canvas via their ChatGPT agent to make simple mockups and assets, or to leverage the designs already created in Figma by their agents to convert to code

You end up with two surfaces aimed at two audiences. An embedded agent for the core user who lives in your product, and a headless MCP layer for everyone on the edges who’s content to call you in from whatever agent they already run.

One outcome of this approach is that the “Power the Agent” approach actually allows you to expand your audience and potentially reach users your product was previously inaccessible to. Now it is more accessible because they don’t have to go through the cost of learning how to use it, and instead can call it and use it directly themselves

If you have any comments or thoughts, feel free to tweet at me.

