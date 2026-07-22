---
title: "How my non-engineering team at Sentry learned to ship"
source_url: http://read.technically.dev/p/how-matt-learned-to-ship
ingested: 2026-06-06
sha256: auto
tags: [article]
---

A few months ago, I opened Claude Code and pointed it at our marketing site. The task was unglamorous: scan the site, find pages where internal linking was weak, and open pull requests with fixes.

Within minutes, the agent was crawling the repository and shipping pull requests across multiple pages at once. Then it hit a wall.

[![Image 1](https://substackcdn.com/image/fetch/$s_!9QG0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F94de8e53-d931-4b1d-a71a-4469486052bd_1232x318.png)](https://substackcdn.com/image/fetch/$s_!9QG0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F94de8e53-d931-4b1d-a71a-4469486052bd_1232x318.png)

For the parts of our site that lived in GitHub as code, the agent ran wild:

18 pages updated in a single PR for a handful of AI tokens. But the pages that mattered most (like our blog), were locked behind a Content Management System (CMS) the agent couldn’t touch.

Moments like this led us to decide to kick off a migration. Four months later, ~2500 pages of [Sentry](https://technically.dev/posts/what-does-sentry-do)‘s marketing site live as Markdown and code in a Git repo, and we’re 100% out of our CMS. Here is what we learned.

Before the Claude Code session, we were actually expanding our CMS footprint. We wanted scalability for non-technical team members (me included at the time), guardrails to keep things on-brand, and a foundation for localization. Watching an agent do a month of SEO work in an afternoon and then stop dead at the CMS boundary changed the calculation.

Velocity was the real reason, not cost. We weren’t trying to escape a Contentful bill (though Cursor’s CMS had cost them[nearly $57,000 in one year](https://leerob.com/agents), which is non-trivial). We were trying to escape the situation where an agent could update half of our site instantly and the other half not at all. That asymmetry was getting more painful by the week as we built more workflows around Claude Code.

There’s been a small wave of teams writing about similar moves: Lee Robinson[migrated cursor.com](https://leerob.com/agents) from a headless CMS back to Markdown in three days, spending $260 in AI tokens. Prefect[rebuilt their entire site](https://www.prefect.io/blog/rebuilding-our-website-for-the-agent-era) from scratch. Anita Kirkovska at Vellum[took a different path](https://x.com/anitakirkovska/status/2053941736049967285), staying inside Sanity CMS but giving each marketer their own AI assistant with agent.md files that codify the team’s writing rules.

But it’s still early enough that best practices are still being written. What was clear, was that we wanted to work on the website w/ coding agents, and having pages gated behind a CMS was a blocker.

Eli, our Sr. Growth Software Engineer wrote up the full technical playbook here, which is the right reference if you want the deep dive on Astro, Vite, the [Vercel](https://technically.dev/posts/how-vercel-became-the-ai-cloud) Blob [cache](https://technically.dev/universe/cache) we built for our marketing automation forms, and the [schema](https://technically.dev/universe/schema)-to-frontmatter mapping work.

The highlights:

*   **~2500 pages migrated by a team of 2.5 developers in a two-month window.** Most of the actual code was written by Claude Code; the engineers spent most of their time planning, reviewing, and directing the agent.

*   **One directory at a time.** Docs and marketing pages migrated first (easiest to template), then blog content, then the most complex interactive pages. We kept the CMS on a free tier for legacy content during the transition, which gave us a soft cutover instead of a hard one.

*   We changed frameworks at the same time, from Gatsby to Astro. Build times went from 14 minutes to under 6 in the migration itself, and after we shipped a Marketo form cache (the forms had been hitting an external [API](https://technically.dev/universe/api) on every build), we got down to under 4. That works out to about 15.8 build hours saved daily across our ~95 builds/day.

*   **We consolidated ~200 bespoke pages into 3 templates** during the migration. This made the codebase dramatically simpler, which makes it easier to use by coding agents. The agent doesn’t have to learn the quirks of 200 one-off pages; it learns three templates.

*   **Claude Code wrote most of the migration scripts** that pulled content from Contentful’s API into our new Markdown files. We also experimented with Claude running Playwright visual regression tests against the old Gatsby site to catch unintended shifts.

*   **Broken staging builds are down ~95%** and our Web Vitals score went from 89 to 97. Most of the broken-build reduction came from cutting external API dependencies out of the build process.

[![Image 2](https://substackcdn.com/image/fetch/$s_!yiNO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1fe02295-3b90-46e9-bbbe-c002d9aaa920_298x108.png)](https://substackcdn.com/image/fetch/$s_!yiNO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1fe02295-3b90-46e9-bbbe-c002d9aaa920_298x108.png)

Things that used to require a Jira ticket, a project request, or a Looker dashboard now happen in a Claude Code session.

In the last four months, our growth team has shipped a lot more than previously possible:

*   **147 pages edited across 2 PRs** to fix link issues surfaced by our Screaming Frog crawler.

*   **50 legacy blog redirects cleaned up in about 5 minutes.** This used to be a backlog ticket that nobody got to.

*   **116 internal-link improvement PRs** opened by a[hub-and-spoke tool I built](https://github.com/Matth3nd3rson/hub-and-spoke-seo) that prioritizes pages by SEO value. It runs as a Claude Code skill and pulls authority data from Ahrefs via MCP.

*   **10 pages updated or built same-day** for product launches and A/B test outcomes. Content that used to sit stale for months because nobody had cycles to update it.

*   **11 active A/B tests running concurrently**, including a new solutions page I prototyped in an afternoon. Each of these would have been a cross-functional project request before.

Two of the things we built deserve a longer look because they’re the artifacts most likely to be useful to other teams.

We have Skills (AI instruction files) for each page type: landing pages, product pages, solutions, blog posts, cookbook recipes, workshop templates. Each one encodes the structure, the SEO requirements, the brand patterns, and the component library for that page type.

[![Image 3](https://substackcdn.com/image/fetch/$s_!fJfS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdbaa131-cb0e-4441-b228-be634b74f825_804x622.png)](https://substackcdn.com/image/fetch/$s_!fJfS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdbaa131-cb0e-4441-b228-be634b74f825_804x622.png)

_The current set of /create-* Skills available to anyone working in our marketing repo._

When anyone on the team asks Claude to create a new landing page, it doesn’t start from a blank file. The Skill interviews them for the required fields (slug, display name, SEO [metadata](https://technically.dev/universe/metadata), hero copy), produces a structured Markdown or JSON file that matches the page-type schema, and opens a PR for review.

[![Image 4](https://substackcdn.com/image/fetch/$s_!mhTq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcfdd181f-20b0-403a-9221-aedc56d55d22_796x671.png)](https://substackcdn.com/image/fetch/$s_!mhTq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcfdd181f-20b0-403a-9221-aedc56d55d22_796x671.png)

_A Skill in motion — /create-product-page walks the user through SEO metadata, copy, and assets before opening a PR._

This is the same consistency our CMS templates used to give us, except the agent actually follows the rules (humans are less observant than agents to pedantic instructions).

A few weeks ago we shipped the[Sentry Cookbook](https://sentry.io/cookbook/), a collection of recipes that solve specific developer problems with copyable code.

It contains recipes like:

*   “Debug undefined properties in [React](https://technically.dev/universe/react) Native with Sentry Logs”

*   “Automate weekly performance digests with Claude Code + Sentry MCP”

*   “Monitor your MCP [server](https://technically.dev/universe/server) with Sentry”

We built it because of how we were watching our traditional blog get consumed: organic search traffic to long-form posts has been falling for two years, but LLMs and AI Overviews keep citing structured, executable content.

The cookbook format collapses the distinction between content for SEO and content for users. Both audiences (developers + LLMs) need the same shaped answer: structured, short, and code-first.

We’re early on with this approach, but early returns are looking good, and the structure feels right.

A few honest things that didn’t go smoothly:

*   **Design fidelity took longer than the data migration.** Anita made the same point in her Vellum writeup, and we hit it too. Pulling content from Contentful into Markdown was a scripted job. Getting the new Astro pages to [render](https://technically.dev/universe/render) the same as the old Gatsby pages, pixel for pixel, was the slow part. Claude Code is good at producing functional code; matching a specific existing design 1:1 is still hard.

*   **Human Error.** Someone on our team added an email validation rule to a form during the migration that they thought was innocuous. It tanked a key conversion [metric](https://technically.dev/universe/metric) for a few days before we caught it.

*   **Build [infrastructure](https://technically.dev/universe/infrastructure) was an under-appreciated source of failure.** The Marketo cache we built late in the migration to fix recurring build breaks turned out to be one of the highest-leverage changes of the whole project, not because it sped up builds (though it did), but because it eliminated a class of failure we’d been quietly working around for years. Worth doing before you “need” to.

*   **The team learning curve is real but smaller than expected.** I couldn’t write code four months ago. Most of our marketing team couldn’t either. A handful of us are opening PRs now, not because anyone learned to be an engineer, but because the environment forced enough fluency to keep up. If your team is going to do this, plan for the first month being slower than feels comfortable.

Next on our team we’re tackling autonomous workflows: agents that can run on a schedule.

We’ve shipped one already, a workflow that routes specific kinds of Linear tickets directly to Claude. A ticket gets filed, an agent picks it up, a PR shows up for review.

So far it works best for small, well-scoped fixes (broken links, typo corrections, blurb updates), but we’re still figuring out which tasks are agent-ready and which need a human in the loop on every step.

The other thing we’re investing in is AI code review. The biggest risk with letting agents touch [production](https://technically.dev/universe/production) is that quality control falls on whoever’s reviewing PRs, and reviewers miss things in a batch of 50 changes.

We’re still just scratching the surface. The migration itself is done, the velocity has been surprising, and the quick examples above are already more than we shipped in the year before this.

But every week we’re finding another workflow that could be moved off of SaaS and onto our codebase, another report that could be a Claude Code skill, another recurring task that could become a scheduled loop. Over time, I assume we’ll shift from spending time building this tooling to just using the tools we’ve built.

**Resources:**

*   Eli’s [technical playbook](https://blog.sentry.io/cut-build-times-delete-cms/) on the Sentry migration (Astro, Vite, Markdown, the Marketo cache)

*   Lee Robinson’s[migration writeup](https://leerob.com/agents) for cursor.com

*   Prefect’s[rebuild post](https://www.prefect.io/blog/rebuilding-our-website-for-the-agent-era)

*   Anita Kirkovska’s[in-CMS approach](https://x.com/anitakirkovska/status/2053941736049967285) using Sanity + agent.md

*   The[Sentry Cookbook](https://sentry.io/cookbook/)

*   The[hub-and-spoke SEO tool](https://github.com/Matth3nd3rson/hub-and-spoke-seo) referenced above