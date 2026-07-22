---
title: Introducing Claude Tag
source_url: https://www.anthropic.com/news/introducing-claude-tag
ingested: 2026-06-24
sha256: newsletter-fetch
tags: [anthropic, claude, agent, multi-agent]
---

# Introducing Claude Tag

Claude Tag is a new way for teams to work with Claude.

We’re starting on Slack, which Claude can join as a team member. Grant Claude access to selected channels, and connect it to whichever tools, data—and even codebases—you choose. Then, anyone in the channel can tag **@Claude** in, and delegate tasks to it while they focus on other work. Claude builds context by remembering relevant information from the channels it’s in, and can plan out tasks to complete in the future.

We see Claude Tag as the beginning of an evolution of Claude Code: it makes the model even more proactive, and it works better with a full team. Tagging **@Claude** is now one of the main ways we get things done at Anthropic. Today, 65% of our product team’s code is created by our internal version of Claude Tag. The same pattern is now spreading well beyond engineering—we’re tagging Claude to chase down product metrics and data, work through support tickets, or even help find the root cause of tricky bugs.

We’re launching Claude Tag on Slack, since it’s a natural home for collaborative work between teams and AI, and where much of Anthropic’s day-to-day work already happens. It’s available today in beta for Claude Enterprise and Team customers. Our goal is to expand where it’s available more widely, so that teams can tag @Claude in the many other places they work.

## Working with @Claude

If you’ve worked with Claude Code or Cowork before, Claude Tag will feel familiar. Tag @Claude with a request in simple terms and it’ll break its task down into stages and then work through them in turn, using the tools it has access to. Once it’s done, it’ll respond in a Slack thread with what it’s created.

But tagging Claude comes with a few new advantages:

**@Claude is multiplayer.** Within a given Slack channel, there’s one Claude that interacts with everyone. This means that anyone can see what it’s working on, and can pick up the conversation from where the last person left off. This makes tagging Claude very different from working within a single chat or for a single task—it’s much more like interacting collaboratively with a teammate.

**@Claude learns over time.**As Claude follows along with its channel, it builds more context about the work. This means that users don’t need to explain things to it from scratch over and over again. And Claude can even automatically learn from _other_ Slack channels and data sources, if it’s granted permission. (It doesn’t report from private channels.) This gives it the tacit knowledge necessary for it to provide the best possible work.

**@Claude takes initiative.** If “ambient” behavior is enabled, Claude will proactively keep you updated about whatever it thinks you might need to know. It’ll flag relevant information from across the channels it’s in and the tools it’s connected to, and follow up on threads or tasks that have gone quiet without being resolved.

**@Claude works asynchronously.** Set Claude a task, and you can focus on your other priorities while it works. It can also schedule tasks for itself, pursuing a project autonomously over hours or days. We’ve found this particularly helpful at Anthropic: we now spend much more of our time delegating tasks to many Claudes in parallel.

You can also send Claude direct messages: it’ll respond privately, using the personal tools and connectors you’ve set up.

## Getting started

We’ve designed Claude Tag with teams and organizations in mind: @Claude’s access to sensitive data and task-specific tools can be very tightly controlled.

To get up and running, system administrators specify which tools and information the model should have access to, in which channels. Think of it as creating separate Claude identities for different uses: everything, including its memories, will stay scoped to the channels defined by the administrators. For example, a model set up for sales work won’t pass on memories to one set up for engineering; nor will it give engineers access to any sales data or tools. More information about provisioning access is [available here](https://claude.com/blog/agent-identity-access-model).

Once permissions are set, everyone can begin tagging right away. Administrators can set limits for token spend (both for the organization and for individual channels), and can view a log of everything that @Claude has done, along with who requested each task.

If you’re a Claude Enterprise or Team customer, you have access to Claude Tag in beta starting today. To get started, [visit here](http://claude.ai/redirect/website.v1.27bda13e-87f6-45cc-b8d2-4d85ad734b61/admin-settings/claude-in-slack) and follow these four steps:

1.   Pair Claude Tag with your Slack workspace
2.   Give Claude access to your tools
3.   Set a limit on your organization’s monthly spend
4.   Test Claude in a private channel to confirm it works.

Claude Tag replaces the existing [Claude in Slack](https://support.claude.com/en/articles/11506255-get-started-with-claude-in-slack) app. To migrate, administrators can opt in within 30 days. We’re issuing an introductory [launch credit](https://support.claude.com/en/articles/15575654) to eligible Enterprise and Team organizations so that the whole company can try it out.

Claude Tag works with Opus 4.8. You can [read our docs](https://www.claude.com/docs/claude-tag/overview) and [product page](https://www.claude.com/product/tag).

## Related content

### Anthropic opens Seoul office and announces new partnerships across the Korean AI ecosystem

[Read more](https://www.anthropic.com/news/seoul-office-partnerships-korean-ai-ecosystem)

### Statement on the US government directive to suspend access to Fable 5 and Mythos 5

The US government has issued an export control directive to suspend all access to Fable 5 and Mythos 5.

[Read more](https://www.anthropic.com/news/fable-mythos-access)

### Results from the first Anthropic Public Record

[Read more](https://www.anthropic.com/news/anthropic-public-record)