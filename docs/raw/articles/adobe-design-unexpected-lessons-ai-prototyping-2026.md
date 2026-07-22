---
title: "Unexpected lessons from an AI-assisted prototyping experiment"
author: "Adobe Design"
source_url: "https://adobe.design/ideas/unexpected-lessons-from-an-ai-assisted-prototyping-experiment"
ingested: 2026-06-17
sha256: "24b86b442c828f27e2b55e1e952910620a964f232a77f6ac58a5eca60731c56c"
---

Published Time: Fri, 12 Jun 2026 14:35:49 GMT

Markdown Content:
How collaboration changes when designers build under real product constraints

Words by

Veronica Peitong Chen

![Image 1](https://adobe.design/ideas/media_141f01c95b7e5b6154a4c93f605e0d703a1b1631c.jpg?width=750&format=jpg&optimize=medium)

Illustration by [Hoi Chan](https://www.jackywinter.com/artists/hoi-chan)

For most of my career, building a product has followed a familiar rhythm: Research, define, explore, spec, hand off. Many of us learned this process in design school, and for a long time, it worked well.

Over time, I've noticed friction as ideas are translated from specs, static mocks, prototype decks, and reviews. Each step introduces the possibility of drifting from the original design intent and often forces teams into tradeoffs between speed, quality, and learning.

A single workflow can sometimes require hundreds of frames carefully stitched together to approximate an “experience.” It's a sequenced process built around artifacts that signal progress, but it isn’t optimized for the rapid feedback that current product development demands.

So, when we had the opportunity to run a small experiment pod inside the Adobe Firefly team, the question we wanted to answer was simple: What would it look like to use AI-assisted prototyping to design inside a product codebase?

Our pod was small and deliberately cross-functional—a product manager, three engineers, and me. We already knew AI-assisted prototyping (also “vibe coding”) could support early exploration; plenty of teams were using it for that. What we wanted to understand was whether a tighter, shared loop between design, engineering, and product could hold up under real product constraints and real pressure.

![Image 2](https://adobe.design/ideas/media_12fd738292995a8cc60604a53a0c068173fad83e5.jpg?width=750&format=jpg&optimize=medium)

**Precision Flow:** Generate a range of results from a single-word prompt and browse options using a simple slider.

![Image 3](https://adobe.design/ideas/media_14db638c0ababcaeefb56c3219274bc5d6150c199.jpg?width=750&format=jpg&optimize=medium)

**Markup:** Sketch in new elements, pinpoint areas to change, and add instructions that clarify creative intent for generative output.

Instead of treating implementation as a later step, we treated it as part of the design process from the start. We began with brief product requirements to align direction, then moved quickly into a design-build-feedback cycle. Using the Firefly codebase, I used AI-assisted coding tools to stand up slices of the experience one at a time. After the engineering review, changes were merged into the main branch and shared for feedback while the work was still forming. In just eight business days, we built two features into a production build.

Speed is the obvious headline, but what surprised me more was what proximity made possible.

## What proximity unlocked

When the distance between idea and implementation shrinks, things shift: Design decisions can inform the product while it’s still taking shape. Constraints can be addressed as they surface, rather than weeks later during reviews. And engineering partners can react to real implementations rather than inferred behavior.

Feedback came sooner, and was grounded in something teams could actually use.

Working this way also changed how I spent my time. In the past, a single feature might require dozens of screens, detailed annotations, and carefully linked flows in Figma. Suddenly, I was using Figma more selectively for jamming with the design team, co-sketching ideas, and evaluating frames while design decisions were still flexible. Once we'd agreed on a direction, I'd spend twenty minutes to an hour sketching a handful of key screens—just enough to describe the intent of an interaction without trying to predict every edge case up front. The rest of my time went into building the experience directly, using AI coding tools to translate design ideas into functioning UI.

> Vibe coding, when used inside real constraints, doesn't bypass rigor; it moves it closer to the moment where ideas turn into actual experiences.

That shift had effects I didn't anticipate. Designing within the actual app revealed nuance (timing, motion, feedback, state) that static mockups rarely capture. Decisions, informed by how the product actually behaved, could be made in the moment. Iteration became incremental rather than comprehensive: For a markup feature, I started with a single brush, then text markup, then image markup, testing each piece before combining them. Edge cases surfaced earlier. System interactions became clearer. Even accessibility became easier to address because contrast, focus states, and interactions could be tested as part of the experience itself, rather than handled through documentation after the fact.

Here's what I want to be honest about: None of this worked because of the tools.

## Collaboration doesn’t disappear; it intensifies

One of the most persistent misconceptions about vibe coding is that it makes collaboration less necessary. In practice, the opposite is true. Working closer to the build process didn't reduce my reliance on engineering and product; it deepened it.

Engineering's involvement wasn't peripheral. It ensured stability in production, raised experience quality, pressure-tested interaction ideas, built the right infrastructure, and set up the guardrails that made rapid iteration possible in the first place. Product played an equally critical role in naming the right problems to tackle, aligning the right partners, and orchestrating priorities across teams.

![Image 4](https://adobe.design/ideas/media_1e9cbf3ebb91749da25f23054f67c3d02e4b44d4d.jpg?width=750&format=jpg&optimize=medium)

AI-assisted prototyping enables a new type of collaboration that creates a tighter, shared loop between design, engineering, and product teams.

And because work was tangible earlier, the whole shape of collaboration changed from handoffs to overlap. In-progress builds and live walkthroughs enabled us to surface questions, test assumptions, and resolve constraints with partners across research, legal, QE, and brand while decisions were still flexible.

The work moved faster because the team moved together.

## The fundamentals hold

Our experiment didn't produce a finished system or a polished playbook. What it produced was a snapshot, a glimpse of what becomes possible when design, engineering, and product share tighter feedback loops and earlier access to the same “real thing.”

We're still figuring out how this process will hold up over time. It raised questions worth sitting with: pace, vibe coding can pull you forward relentlessly, and it takes discipline to surface for air; altitude, how designers maintain a wide-angle view when so much attention is pulled into the granular work of making; and design, which problems might a more traditional process still serve us better.

> One of the most persistent misconceptions about vibe coding is that it makes collaboration less necessary. In practice, the opposite is true. Working closer to the build process didn't reduce my reliance on engineering and product; it intensified it.

What became clear is that the fundamentals of design don't change with vibe coding. Empathy, judgment, taste, and craft don't disappear when you're building instead of specifying. If anything, they become more essential because you're exercising them in the moments when decisions actually land. Vibe coding, when used inside real constraints, doesn't bypass rigor; it moves it closer to the moment where ideas turn into actual experiences. And that works best when no one is working alone.

_Thanks to my amazing teammates Amogh Vaishampayan, Geireann Lindfield Roberts, Josh Myers-Dean, Olfa Chemli; Elle Arnold for the design explorations; the Genfilm Lab research team; and the leadership team that believed in and supported us._

June 2, 2026
