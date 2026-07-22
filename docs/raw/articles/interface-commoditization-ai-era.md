---
source: newsletter
source_url: https://blog.mozilla.ai/the-interface-is-no-longer-the-product/
ingested: 2026-05-22
sha256: ec151eff1132
review_value: 7
review_confidence: 8
review_stars: 4
review_recommendation: strong
---

# The Interface Is No Longer the Product


Published Time: 2026-05-19T16:19:08.000Z

Markdown Content:
### **From Agents That Use Apps to Apps Built for Agents**

A few weeks ago I was using [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs?ref=blog.mozilla.ai) to put together a presentation for our work week in Berlin. Not a throwaway deck, but an actual presentation with a narrative, data, and a point of view.

Good product. And the interesting part is not the quality, it is the decision behind it: the interface is organized around the reasoning, not the slide. You work on the content. The deck is a consequence. The .pptx comes at the end. It is an export. The work happened somewhere else.

That is a small detail that I think points to something larger. And it is not really about presentations.

For decades, the only way to modify an application's state was through a human interface. That assumption is starting to break.

Most human-computer interaction has been built around two patterns: issuing commands (typing, clicking, speaking) and manipulating representations (dragging, resizing, arranging, formatting). Every productivity tool ever built is designed around one or both of those. The keyboard, the mouse, the touchscreen. That is the full vocabulary. The interface and the product were, for practical purposes, the same thing.

It worked. It got the job done. Billions of people learned to think in spreadsheets, build in slide decks, and manage work through ticketing systems.

But more of that work is going to be done with, and eventually by, agents. And agents do not need a mouse. They do not need a menu. They do not need a canvas. They need structured state they can read, reason about, and rewrite.

Code has always worked this way. It is text with clear semantics. Tools can parse it, transform it, and reason about it without ever rendering it visually. That is why agents are already so capable there, and why the rest of software is about to face the same pressure.

### **The Bridge and the Destination**

A lot of current AI product work starts from the idea that agents should learn to use our existing applications.

The agent opens the browser, clicks through menus, fills forms, moves objects around, reads documents, sends messages, updates records. It behaves like a very fast human user.

This is useful. More than useful, it is probably necessary. The world already runs on existing software. Companies have years of organizational knowledge embedded in Gmail, Slack, Jira, Salesforce, Notion. If agents are going to be helpful today, they need to work inside that world.

That is the bridge.

But the bridge is not the destination. Agents using existing apps help bring AI into the current software stack. Apps built for agents may change the shape of the stack itself.

And there is something more valuable in that process than just short-term utility. Watching where agents struggle with existing interfaces, where the translation between intent and UI operation is most painful, is probably the most honest way to find where the structural opportunity is. The friction is the signal.

The first wave of AI products is about access: can the agent use the tools we already use? The next wave is about representation: is the tool itself built around a source of truth an agent can safely inspect, modify, and reason about?

Those are different problems. They lead to different products.

### **Software Categories Are Interface History**

Software categories are accidents of interface history, not natural laws.

Slides. Spreadsheets. Documents. Dashboards. CRMs. Project management tools. Design tools. Workflow builders. These are not fundamental categories. They are bundles: a data model, a renderer, a human editing interface, permissions, collaboration, and import/export, all wrapped into a single product boundary. That bundling made sense when the interface was the center of the product. Build around the human, and you get human-shaped categories.

PowerPoint is not a presentation. It is a container for a presentation, built around the assumption that a human would assemble it slide by slide. Excel is not a financial model. It is a grid interface for building one. The rendered output still matters, the board still needs to see the deck, the customer still needs the pitch. But the editing interface and the artifact are different things, and we have been conflating them for so long we stopped noticing.

In an agent-native world, that bundling starts to come apart.

The source of truth for a product strategy is not the slide deck, the roadmap doc, the ticket board, or the dashboard. It is the strategy itself: the goals, the bets, the risks, the owners, the metrics, the decisions. Everything else is a view. The memo, the board deck, the launch checklist, the customer brief are renderings of the same underlying object, shaped for different audiences.

A product launch is not a Notion doc, a Linear project, a slide deck, and a dashboard. It is a product launch.

### **The Source of Truth Moves**

Most software today makes users translate intent into operations. The user should not have to say: move this card, add this row, change this chart. They should be able to say what they are trying to make true.

The most vulnerable software categories are not the ones with the weakest products. They are the ones where the gap between what the user wants and what the interface makes them do is largest. If the user wants to communicate a business narrative and spends hours arranging slides, the slide editor is vulnerable. If the user wants to understand pipeline health and spends their time logging calls and updating fields, the CRM is vulnerable.

The pattern is not that these tools are mouse-heavy. That is a symptom, not the cause. The deeper issue is that the interface forces humans to do low-level state manipulation when their actual intent exists at a much higher level.

A fair counterargument is that structured artifacts are not new. Many applications already have APIs, schemas, file formats, automations, and plugin systems. The difference is not that structure suddenly exists. The difference is what the product is organized around. Historically, the structure served the human interface. In agent-native software, the structure becomes the main control surface, and the human interface becomes one view over it. The question is not whether structure exists. It is whether the product is built around it.

The deck, the doc, the dashboard. None of them are the source of truth. They are projections.

### **What Agent-Native Apps Need**

Agent-native applications will have a recognizable shape.

They will have a structured internal representation of the work. Not a file format, not a rendered view. A representation that captures what the artifact actually is, not just how it looks.

They will have renderers that turn that structure into human-friendly views: documents, decks, dashboards, workflows, timelines, whatever format the audience needs.

They will have validators that check whether the result is coherent, safe, complete, and consistent with the user's goals.

They will have diff and approval systems, because humans need to understand what changed before they trust it.

They will have import and export to legacy formats, because the world does not move all at once.

A chatbot next to a legacy app is not the same thing as an agent-native application. If the agent cannot read and write the structured source of truth, it is just another UI layer. A chatbot bolted onto the side is still the old product.

### **Owning the Artifact Layer**

[AI made code abundant](https://blog.mozilla.ai/owning-code-in-the-age-of-ai/). It may do the same to traditional interfaces.

The scarce resource becomes the structured understanding of the work: what the artifact means, how it changes, who is allowed to change it, how changes propagate, and what is consistent. That is where ownership moves. Not to the app that renders it today, but to the system that owns the artifact layer underneath.

The question worth asking is not: how do we add AI to this app? It is: what is the real object of work here, and what representation would let an agent help maintain it?

For presentations, the object may be the narrative. For dashboards, it may be the metrics and their causes. For workflows, it may be the process graph. For strategy documents, it may be a structured model of the decision.

The old tools will not vanish quickly. They have distribution, habits, enterprise contracts, file compatibility, and decades of user training on their side. But the center of gravity moves. The work happens in the agent-native system. The legacy app receives the export.

I do not think this transition will be clean. The old world will remain around us for a long time. People will still export PowerPoint files, update spreadsheets, paste things into email, and manage work through tools that were designed before any of this existed.

But that feels increasingly like a transitional phase.

The more interesting future is not only agents operating apps. It is applications designed so agents, humans, and existing tools can all work with the same underlying objects.

Not because every app disappears but because the source of truth may move.

