---
title: "50 design token files, one problem: your agents can't read the meaning"
source_url: "https://learn.thedesignsystem.guide/p/50-design-token-files-one-problem"
ingested: "2026-06-27"
sha256: "9a5a84ad3e21b87c"
type: article
tags: [design-token, design-system, agent, ai-agent, interoperability]
---

# 50 design token files, one problem: your agents can't read the meaning


Published Time: 2026-06-19T14:15:22+00:00

Markdown Content:
👋 Get weekly insights, tools, and templates to help you build and scale design systems. More: [Design Tokens Mastery Course](https://thedesignsystem.guide/design-tokens-course) / [YouTube](https://www.youtube.com/@designsystemguide) / [My Linkedin](https://www.linkedin.com/in/rominakavcic/)

[![Image 1](https://substackcdn.com/image/fetch/$s_!9EBo!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24b82ad8-247c-4dfe-9f9f-c3cbd04ab453_2184x1455.png)](https://substackcdn.com/image/fetch/$s_!9EBo!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24b82ad8-247c-4dfe-9f9f-c3cbd04ab453_2184x1455.png)

I have to start this email with amazing news. Almost two weeks ago, I launched the **Agentic Design Community + Guide.** 🥳✨I rolled it out in batches to everyone on the waiting list. Thank you to everyone who has already sent feedback.

**What is inside:**

* 87 guides on token pipelines, Figma MCP, Claude Code, and component audits (growing weekly)

* 33 production prompts

* 9 suggested learning paths, including a beginner setup that takes you from zero to a working AI workflow

* 26 templates and checklists

* A directory of 158 real design systems, from Netflix to Porsche

* 40 honest tool comparisons, no affiliate links

* Free tools like the Style Explorer and Trust Levels Playground

* Live sessions

* Free, helpful tools

* and so on

It updates weekly. 🌀

[Join for free here](https://aidesign.guide/)

[![Image 2](https://substackcdn.com/image/fetch/$s_!AOWo!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fef238d8d-5ab3-48c7-8d04-d0b7f43207aa_2958x1658.png)](https://substackcdn.com/image/fetch/$s_!AOWo!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fef238d8d-5ab3-48c7-8d04-d0b7f43207aa_2958x1658.png)

And now to design tokens.

I thought design tokens would be the easiest design system data for AI agents to use.

They are already structured, they already live in JSON, and they already move between Figma and code. So I read the token files of 50 design systems to see how ready they really were.

I found two things I had not expected. They are far more different from each other than I assumed, and most of them tell an agent **what a value is without telling it what the value means.**

[![Image 3](https://substackcdn.com/image/fetch/$s_!miu0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98649780-5722-46c1-a750-3ac93161fcf9_1440x640.png)](https://substackcdn.com/image/fetch/$s_!miu0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98649780-5722-46c1-a750-3ac93161fcf9_1440x640.png)

Okay, why this difference matters? A token file can be perfectly valid for a build pipeline and still be thin context for an AI agent. The pipeline needs to turn `color.red.500` into a usable value. The agent needs to know whether that red is for danger text, destructive buttons, error borders, alert backgrounds, brand moments, charts, or something that should never be used directly. Those are different jobs.

Design system teams have spent years making tokens machine-readable. That was the right step. Agent-ready data just asks for something on top of it. It asks:

*   What does this token mean?

*   When should it be used?

*   When should it not be used?

*   Is it deprecated?

*   Which component or state depends on it?

*   Which decision created it?

*   Which platform does it map to?

Without that layer, the agent can still read the file. It just has to guess.

[![Image 4](https://substackcdn.com/image/fetch/$s_!_U3b!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fc298cd-8e7d-442c-a5b1-6c706aa349da_1440x860.png)](https://substackcdn.com/image/fetch/$s_!_U3b!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fc298cd-8e7d-442c-a5b1-6c706aa349da_1440x860.png)

Say an agent needs a danger color. It finds `red.500`. Nothing in the file says that red means danger, so it might reach for the same red on a disabled button or a decorative chart. The file gave it a value, not a reason.

These files were built to compile, and they compile beautifully. Explaining themselves to an agent is a newer job, and most were designed before that job existed.

I read the public token files of 50 design systems and then used AI to compare the real source an agent would load, not the polished documentation.

For every system I gathered the same four things:

*   Where the tokens live, and in what format.

*   How many tokens there are, by category: color, typography, spacing.

*   How the tokens are named.

*   What meaning the file carries.

The same data for all fifty, so the comparison is fair. I counted from the raw files: where a system ships every shade in code, I counted every shade, and where a system keeps spacing in a build script, I went and counted that too.

The full dataset, every system with its format, location, counts, and meaning layer, is published at **[aidesign.guide/token-audit](https://www.aidesign.guide/token-audit).**

The first thing I learned is that there is **no standard place**, and no standard format. I found at least eight formats in active use:

*   DTCG JSON (Primer, GitLab, Backpack, NL Design System)

*   Style Dictionary JSON (Workday, PatternFly, Gestalt, Orbit, Pharos)

*   Theo YAML (Salesforce, Twilio, Nord)

*   Plain JSON (Suomi.fi)

*   TypeScript objects (Carbon, Polaris, Fluent, Ant, Chakra, Base Web, Cloudscape, Mantine, Elastic, Braid, Grommet, Forma 36, Theme UI, Australian GOLD)

*   CSS custom properties (Radix, Open Props, Vibe, Shoelace, Decathlon Vitamin)

*   SCSS maps (Material, Liferay Clay, Bootstrap, Foundation, Bulma, Vanilla, GOV.UK, Semi, parts of USWDS)

*   LESS or CSS variables compiled from it (Stack Overflow Stacks, TDesign, Arco)

Some live where you would not expect. Adobe moved Spectrum’s tokens to a repo called `spectrum-design-data`, Shopify keeps the Polaris tokens inside `polaris-react`, and GitLab ships its tokens inside the `@gitlab/ui` package.

Knowing where the tokens live is the kind of thing you would tell a new teammate on day one. An agent needs the same pointer. Here is the map.

[![Image 5](https://substackcdn.com/image/fetch/$s_!alxS!,w_2400,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80a14389-80d3-4335-b579-0aaadc4417d7_1840x2928.png)](https://substackcdn.com/image/fetch/$s_!alxS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80a14389-80d3-4335-b579-0aaadc4417d7_1840x2928.png)

There is no standard size either. But before the numbers, the lens that makes them mean something: every count in this section measures the same thing. How many decisions the system makes for you, versus how many it leaves to you. A small scale is an opinion. A large scale is a palette. Neither is wrong, but each one changes what a consumer of the system, human or agent, has to figure out alone.

Take spacing, the simplest scale.

[![Image 6](https://substackcdn.com/image/fetch/$s_!SC__!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc84f322c-4128-4f90-8fbc-af3e1cc6ab05_1440x1208.png)](https://substackcdn.com/image/fetch/$s_!SC__!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc84f322c-4128-4f90-8fbc-af3e1cc6ab05_1440x1208.png)

The median is
