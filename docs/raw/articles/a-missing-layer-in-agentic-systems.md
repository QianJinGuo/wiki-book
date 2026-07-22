---
source: "rss"
source_url: "https://blog.crewai.com/a-missing-layer-in-agentic-systems"
ingested: "2026-06-11"
feed_name: "CrewAI Blog"
source_published: "2026-01-22"
sha256: "7bb8dca64b9551a202e0e9a30bd9fa185a0e1604b5bca95a63a8a23cde02270b"
type: "article"
tags: "agent, ai, llm"
---



# A Missing Layer in Agentic Systems?

Most people think Human-in-the-Loop (HITL) limits, or indicates the limitations of what AI Agents can do, but they've got it backwards.

HITL has proven to actually expand the surface area of what you can deploy quite a lot. Here's what I mean by "expand":

  * Use cases that require 99.9% accuracy?
  * Use cases that need compliance sign-off?
  * Use cases where the output needs a human touch before it goes out?
  * Use cases where you need humans to be in and out of the loop?



Now all deployable.

Without HITL, these would most likely stay stuck in pilot, but adding an extra layer of HITL, if done properly, they ship. 

I'm not referencing these things in a vacuum, we are seeing it ourselves, both internally and through customers:

  * AB InBev, the largest brewer in the world (and a CrewAI customer) is running 20 million tickets a year through a HITL architecture.
  * Another customer, a global education company is on track to save millions this year by automating materials generation while _improving_ their quality.
  * We use it ourselves at CrewAI, after every sales call a workflow generates personalized materials and routes them to the rep for review. It takes only four minutes, and it's something we literally couldn't do before at any scale.



We call this the 90/10 rule, 90% automated, 10% human-augmented. 

The exact ratio varies, some systems start at 30/70 and scale from that for example. The point isn't the number. It's having the architecture that supports both, so you can dial the ratio based on what the use case needs.

It's all about recognizing that certain decisions deserve human judgment, and building that into your architecture from the start.

# The Three Layers

In an earlier post I shared [what we've learned about Agentic Systems from 2 billion agentic executions](<https://x.com/joaomdmoura/status/2013296719933383084?ref=blog.crewai.com>):

  * Deterministic backbone (Flows) for structure and control
  * Intelligence where it matters (LLM / Agent / Crews) for reasoning and adaptation



But I do think that HITL is an optional but relevant third layer for humans that introduces the ability for judgment and accountability.

A distinction worth making is that there's actually two modes here:

  * **Human-in-the-loop** : The agent pauses, a human reviews or edits, the workflow continues. Direct intervention at specific checkpoints.
  * **Human-on-the-loop** : Humans monitor, adjust parameters, and intervene when needed. Oversight without blocking every step.



The first is about precision, certain steps need human judgment, the second is more about confidence, someone is watching, and can step in, but in the end of the day both expand what you can ship.

# What This Looks Like at Scale

David Almeida, Chief Technology and Strategy Officer at AB InBev, spoke at our Signal conference about how they're thinking about agentic AI.

[](<https://pbs.twimg.com/media/G_IbIlDWQAElDcQ.jpg?ref=blog.crewai.com>)

Fun fact: AB InBev sells one in every three beers globally (including many of my favorites), with millions of customers across all their platforms.

They are major adopters of CrewAI and have currently $30 billion in decisions influenced by AI annually. All that to say this isn't a company experimenting, they're operating at scale.

One pattern David shared: their contact model handles 20 million tickets a year. Before agentic AI, all manual. Now 30% are fully autonomous. The other 70%? Human-augmented, agents working alongside employees, routing requests, pulling information, drafting responses for human review.

Here's what he said that stuck with me:

> AI is not gonna live on its own. AI is gonna live within our technical platforms to create value.

That's the architecture pattern we keep seeing. Agents and humans together, each doing what they do best. They're targeting $28M in value from this approach in this one use case alone.

This is what production-grade agentic systems look like at Fortune 500 scale.

# The CrewAI's Way

On the open source side, CrewAI Flows now support HITL natively with the [@human_feedback](<https://x.com/@human_feedback?ref=blog.crewai.com>) decorator. One line to add a checkpoint.
    
    
    @human_feedback(
        message="Review this before sending:",
        emit=["approved", "rejected", "needs_revision"]
    )
    def review_content(self, content):
        # your logic in here
        return content

By using this simple annotation the flow pauses, presents the output for review, collects feedback, and routes to different paths based on the response. Full state persistence across async human interactions. Audit history built in.

On the enterprise side with AMP, we're adding the infrastructure that makes this production-ready, you just deploy that same code and this is what our customers are getting:

[](<https://pbs.twimg.com/media/G_H8yOuW8AACqnU.jpg?ref=blog.crewai.com>)

  * **Email-first notifications** — Anyone can respond by replying to an email. No platform account required.
  * **Smart routing** — Route by method pattern, or pull the assignee dynamically from flow state. Your CRM says Alice owns the account? The review goes to Alice.
  * **SLA tracking** — Set response time targets. See who's responding, where bottlenecks form.
  * **Auto-response fallbacks** — Configure what happens if no one responds. Flows don't hang.
  * **Webhooks** — Push to Slack, Jira, ServiceNow, whatever you use.
  * **Full audit trail** — Every request, response, and decision logged with timestamps.



The open source decorator gives you the checkpoint. AMP gives you the control plane to run it at scale.

# **Why This Matters Now**

The timing of HITL becoming more adopted and highlighted isn't accidental.

EU AI Act is actively enforcing. FDA requires human oversight for high-risk AI. SOC2 audits are asking about AI decision trails. The regulatory world caught up faster than most teams expected.

But compliance is just one reason, in the end of the day it all come back to business outcomes.

Enterprises figured out fully autonomous agents are great but you can do a broader set of use cases with a third human layer as well. David from AB InBev said it clearly: they want to lead in agentic, not by removing humans, but by building systems where agents and humans work together.

The teams shipping to prod aren't removing humans from the loop, but the ones actually spending the time designing the loop itself.

There are two ways to think about human involvement in AI:  
Some see it as a limitation, like something to minimize.  
Others see it as architecture, something to design in.  
I like the latter better! 

The feature is live now. [Docs are here](<https://docs.crewai.com/en/learn/human-feedback-in-flows?ref=blog.crewai.com>).   
Try it and let us know what you build.