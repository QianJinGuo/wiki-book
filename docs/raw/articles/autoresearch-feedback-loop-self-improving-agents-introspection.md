---
title: "www.latent.space"
source: newsletter
url: https://www.latent.space/p/autoresearch-introspection
ingest_date: 2026-07-03
vxc: 56
stars: 4
sha256: 875ebfcc0fde4c1dfa787f457bc6a4df0e8915c5d5bfa413a6dd791f68ce838b
---
sha256: 459c08c26988fab0bca4ecef11d6a3b06f2a59f80e585b78eca48c5ad7ac7585

Title: Autoresearch: The feedback loop behind self-improving agents

URL Source: https://www.latent.space/p/autoresearch-introspection

Published Time: 2026-07-01T23:52:30+00:00

Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!p4Th!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe316b2cb-4200-4a71-bdcc-c398467b53ef_1280x720.jpeg)](https://substackcdn.com/image/fetch/$s_!p4Th!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe316b2cb-4200-4a71-bdcc-c398467b53ef_1280x720.jpeg)

Introspection’s Roland Gavrilescu at AIEWF.

We’ve heard a lot about loops at the AI Engineer World’s Fair this week. Another buzzword is **autoresearch**, which involves building an “outer loop” where agents help maintain and improve the primary system, using feedback signals, evals and human input to make progress over time.

At least, that was the framing of [Roland Gavrilescu](https://x.com/rolandgvc), co-founder and CEO of Introspection — a new company building infrastructure for deploying these self-improving systems. Before starting the company, Gavrilescu worked on agent infrastructure and cloud agents at xAI, where he met his co-founder, [Julian Bright](https://www.linkedin.com/in/julianbright/).

Ahead of his “Autoresearch in the Wild” session at the AI Engineer World’s Fair today, I spoke with Gavrilescu about the shift from agent harnesses to feedback loops, the role of the open-source Pi framework, and why autonomous software factories must first learn from humans.

**Latent Space:** How did your new company, Introspection, come about?

**Roland Gavrilescu:** Last year, I was at xAI, where I met my co-founder. We were working on agent infrastructure and cloud agents, and we felt there was a new agent form factor that needed to be explored further. xAI was not necessarily the environment where we could focus completely on that.

We decided to leave and ask what a company designed around this new form factor might look like. We were interested in what made companies such as Cursor and Cognition successful, and how we could turn some of those ideas into a product that others could use.

That became the basis for Introspection.

Autoresearch allows you to build loops in which agents help maintain the system itself. The challenge is designing the right signals and feedback mechanisms so agents can improve the system, make architectural decisions and move in the right direction without constantly being bottlenecked by humans.

**Latent Space:** Your session is titled “Autoresearch in the Wild” — what will it cover?

**Gavrilescu:** We have heard a lot about what autoresearch can do for improving experiments, but we wanted to talk about what these loops look like in production.

We are presenting three patterns that we think form the basis of a new blueprint.

The first is that **the loop is the product**. We have moved from focusing on models, to harnesses, and now to loops. The key question is whether you can define the right feedback mechanisms so agents can take on more work without generating more slop.

The second pattern concerns what the loop generates and how you track it over time. We are proposing a concept called an agent **recipe**.

We moved from agent tools to agent skills. Recipes are a larger container that brings together the components needed to encode human expertise: evals, judges, signal processing and the information that feeds back into the loop.

The goal is to create a portable format that agents can iterate on, almost like a research laboratory, but in a provider-agnostic way.

The third pattern is about what we optimize for. How can the system become both better and cheaper over time?

Companies such as Cursor and Cognition have shown that these products can work. The next stage is making them more accessible, faster and cheaper, and gradually distilling the capabilities of frontier models into systems that you own and that are customized for your environment.

**Latent Space:** Can you explain more about what an agent recipe is…

**Gavrilescu:** It’s like a description of the ingredients you need and how they evolve.

The idea comes partly from data recipes used in model post-training. A data recipe describes how much data from different domains should be baked into a model.

Agent recipes are similar. A recipe might describe how your harness works with different models, the evals you use, the judges you have created, the human expertise you have captured and the failures that led to new evals.

Imagine that tomorrow you suddenly gained access to the Devin codebase. The code alone would not necessarily be that helpful if you could not see how the team arrived at the current version. You would want to understand the failures, mistakes and decisions that informed it.

A recipe captures that process. You begin with a baseline and then record how each signal produced a new judge, embedded new human expertise or led you to introduce a different model.

**Latent Space:** Does autoresearch mean orchestrating multiple agents, or can it involve one agent repeatedly working and verifying its results?

**Gavrilescu:** You can think of the system as having an inner loop and an outer loop.

The inner loop is the primary system interacting with users and performing the work. Autoresearch is more concerned with the outer loop: another system that studies and maintains the primary system.

The question is how to design that outer loop so it makes progress on the right problems without consuming an unreasonable number of tokens while deciding what to do.

**Latent Space:** You have compared Pi to Linux. In that analogy, is Introspection something like Red Hat?

**Gavrilescu:** Pi is like the Linux of agent harnesses. Linux has distributions such as Ubuntu, but the underlying system is designed to be extended. Pi is similar: it was never intended to be run as an unchanged, vanilla product. Pi separates the agent loop from its extensions and configuration, which makes the agent portable. You can spin up several different agents by loading different files into the runtime.

We saw an opportunity to combine that extensibility with recipes and open-source building blocks that can evolve for each customer while remaining portable and easy to deploy.

**Latent Space:** Reliability and the messy reality of agent loops have been recurring themes at the conference. How does Introspection address those problems?

**Gavrilescu:** The product is designed around the point at which you are ready to move into production.

You need to know what infrastructure is required to make the loops work, keep costs under control and maintain security. The managed infrastructure covers what is necessary for these systems to operate in production.

A major part of our focus is bringing the kind of infrastructure available inside frontier AI laboratories to a product that other companies can deploy.

**Latent Space:** What about the human in the loop?

**Gavrilescu:** These loops are designed with humans in the loop because you need the right signals as the system makes progress.

The human can effectively become a tool and a source of signals. Agents can be trained to ask people questions through an “ask a human” tool.

During its first few loops, an agent may rely heavily on asking questions and learning what a human would do. Over time, it accumulates those preferences and can become increasingly autonomous.

It is similar to an employee joining a new company. Initially, that employee asks a lot of questions. As they learn how the organization works, they can make more decisions independently.

**Latent Space:** So what kinds of use cases are you seeing?

**Gavrilescu:** We are concentrating on vertical agents.

Coding agents are clearly working, and we have seen a number of companies succeed in that area. The next question is how to deploy agents in vertical and non-coding domains.

Companies in those markets are asking how they can do this securely without becoming dependent on a single provider. They want the deployment to belong to them, they want to retain ownership of their data, and they do not want to be locked into OpenAI or Anthropic. Introspection is intended to provide infrastructure that addresses those requirements using open-source building blocks.

Frontier AI labs have developed sophisticated internal agent technology. We want to bring similar capabilities into vertical SaaS and services businesses.

**Latent Space:** Is Introspection mainly intended for developers, or will product managers and other business users work with it?

**Gavrilescu:** We are initially focusing on software engineers in vertical SaaS companies.

We want the environment to be agent-friendly, meaning agents can work inside their own repositories and codebases. Everything is Git-based, and Git becomes the audit log that you maintain over time.

In the future, there will be interfaces that enable product managers and others to participate. But we are already seeing product managers move closer to code.

We think the right initial form factor is a human-to-agent interface in which the actual work and its history live in Git.

**Latent Space:** Does Introspection fit within the broader idea of software factories?

**Gavrilescu:** Yes. Designing the loops is essentially designing the factory. The remaining question is how much autonomy the factory should have.

There has also been discussion about “orchestras, not factories.” That distinction is really about the level of autonomy.

An orchestra might retain a human conductor who controls how the loops operate. A factory implies something more fully autonomous.

But you should build toward the factory rather than assume you can create a completely autonomous factory on the first day. Models do not initially possess all the context or understand every decision people inside an organization make. You cannot simply capture all of that knowledge in a Markdown file.

The right approach is to design the human as a core component of the factory. The early system should extract tacit knowledge and workflows from people over time, rather than attempting to automate everything immediately.

**Latent Space:** What would you recommend to engineers who want to experiment with autoresearch?

**Gavrilescu:** The first step is to invest in your signals. What are the things you actually want agents to respond to?

Product feedback is a good example. Not all feedback carries the same value, and you cannot respond to every individual data point. You need a mechanism for filtering the signals and identifying which ones an agent should act on.

The second requirement is control over cost. You do not want to wake up to an unexpected thousand-dollar bill because an agent has been running an inefficient loop.

The third is to follow the research. Look at the kinds of harnesses models are being trained to use and remain close to those patterns. Study how research labs use data recipes and consider how those ideas can be applied to your own product.

The broader goal is to turn your product organization into a miniature research lab, with agents acting as miniature researchers.

#### Subscribe to Latent.Space

Thousands of paid subscribers

The AI Engineer newsletter + Top technical AI podcast. How leading labs build Agents, Models, Infra, & AI for Science. See https://latent.space/about for highlights from Greg Brockman, Andrej Karpathy, George Hotz, Simon Willison, Soumith Chintala et al!

