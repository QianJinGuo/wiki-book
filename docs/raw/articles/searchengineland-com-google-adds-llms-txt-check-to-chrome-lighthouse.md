---
title: Google adds llms.txt check to Chrome Lighthouse
source: rss
source_url: https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246
tags: [search, seo]
sha256: 13b373c27c77
created: 2026-05-21
---

Title: Google adds llms.txt check to Chrome Lighthouse

URL Source: https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246

Published Time: 2026-05-20T16:57:48+00:00

Markdown Content:
Google’s new Lighthouse “Agentic Browsing” audits now check for the presence of an llms.txt file. The new experimental Lighthouse documentation frames llms.txt as a discoverability and efficiency signal for AI agents, not a traditional crawling directive.

*   The audits are part of Chrome’s emerging “Agentic Browsing” category, which evaluates whether sites are structured for machine interaction.
*   This document comes less than a week after Google published new guidance on optimizing for AI search features like AI Overviews and AI Mode, in which it said you don’t need llms.txt files in a mythbusting section of its new [guide on optimizing for generative AI features](https://searchengineland.com/google-publishes-guide-on-optimizing-for-generative-ai-features-477671).

**What Lighthouse now checks.**Lighthouse’s Agentic Browsing category evaluates “how well your site is constructed for machine interaction” using deterministic audits, according to Google’s documentation. Among the checks:

*   WebMCP integration.
*   Accessibility tree integrity.
*   Layout stability through CLS.
*   Presence of an llms.txt file.

Lighthouse checks for “the presence of a machine-readable summary at the domain root.” Google also explained why the file matters for agents:

> “Without llms.txt, agents may spend more time crawling the site to understand its high-level structure and primary content.”

The audit category doesn’t produce a traditional Lighthouse score (0-100). Instead, Google surfaces a fractional pass ratio along with pass/fail checks tied to agentic readiness signals.

**The tension.**The new Lighthouse documentation doesn’t directly conflict with Google’s advice on optimizing your website for generative AI features because these audits focus on AI agents and browser tools, not Google Search rankings. Still, seeing llms.txt mentioned in Chrome’s own readiness checks may cause some SEOs to rethink earlier doubts about the file.

**Agentic engine optimization.**The Lighthouse audits also align with ideas Google Cloud AI engineering director Addy Osmani outlined in April around [Agentic Engine Optimization.](https://searchengineland.com/agentic-engine-optimization-google-ai-director-474358) Osmani said AI agents with limited context windows may cut off long pages or miss important information buried too deep in content. Among his recommendations:

*   Cleaner semantic structure.
*   Token-efficient content.
*   Markdown delivery.
*   llms.txt discovery layers.
*   Capability signaling files like AGENTS.md.

**SEO vs. llms.txt.**Here’s exactly what Google recommends in [Mythbusting generative AI search: what you don’t need to do](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide):

*   **LLMS.txt files and other “special” markup**: You don’t need to create new machine readable files, AI text files, markup, or Markdown to appear in generative AI search. Note that Google may discover, crawl, and index many kinds of files in addition to HTML on a website: this doesn’t mean that the file is treated in a special way.

Here’s what Google’s John Mueller said about Google using llms.txt, in [response to Lily Ray](https://bsky.app/profile/lilyray.nyc/post/3mmaio3nogk2d) asking him on Bluesky “Hey @johnmu.com – if you can answer, many folks are pointing out the irony that Google uses LLMs.txt files, plus markdown pages, despite also saying these things are not needed for performance in search. Could you share why Google might publish these files, if not to make crawling those pages/sites easier for agents? (I’m sure I’ll be getting this question a ton soon!)”:

> The short answer is that it’s not done for search. There’s more to websites than just SEO :-).
> 
> 
> The longer & nuanced version is that it’s worth separating “discovery” (finding the website or pages with a global search engine) vs “functionality” (there’s probably a more accurate term for this, but basically: once someone has found the page, helping them to best do the task they want to do).
> 
> 
> Perhaps that’s similar to CTA’s on traditional pages? You don’t “do them” for SEO (to be found), but if you’re responsible for the website overall, ensuring a high “discovery rate” (SEO) together with a high conversion rate is useful to justify your work.
> 
> 
> To get back to the developers.google.com site, AI coding has gotten very popular, and these coding systems can be (I think) efficient and accurate with the code they produce if they can easily read / parse reference material, such as developer documentation.
> 
> 
> In those cases, it can help to give them a way to understand the context of the documentation they’re looking at, as well as a simplified version of the reference page (eg, in markdown). OF COURSE they can read HTML just fine, so this is imo more of a temporary crutch, perhaps to save some tokens.
> 
> 
> For non-developer sites, I don’t think this makes much sense, even with more agentic traffic in the future (and if you check your logs, you’re not getting a lot of that at the moment). Making a markdown version of a shoe’s specs is not going to get you more sales (competitors appreciate it tho).
> 
> 
> And (I know, nobody reads this far), if you think this is important to prepare for when agents are everywhere: your site (all sites) have much more important things to do for SEO than to prepare for a potential future situation that may or may not come. Prioritize needs before dreams.

**What Google says agents rely on.**Beyond llms.txt, Google’s new Lighthouse category strongly emphasizes accessibility and interface stability. The documentation says agents rely on the accessibility tree as their “primary data model.” Lighthouse specifically evaluates:

*   Programmatic labels for interactive elements.
*   Valid accessibility tree structure.
*   Whether interactive content is hidden from assistive systems.
*   Layout stability through CLS.

Google also warns that dynamically registered WebMCP tools and large DOM changes can affect audit results.

**Why we care.** Google says you don’t need llms.txt for Search, but Chrome is now checking whether the file exists. At the same time, Google’s agentic tools appear to favor sites that are easier for machines to read and use, especially sites with strong accessibility, stable layouts, and clear agent access.

**Google’s help document.**[Lighthouse agentic browsing scoring](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring)

**Dig deeper.**

*   [Meet llms.txt, a proposed standard for AI website content crawling](https://searchengineland.com/llms-txt-proposed-standard-453676)
*   [llms.txt isn’t robots.txt: It’s a treasure map for AI](https://searchengineland.com/llms-txt-isnt-robots-txt-its-a-treasure-map-for-ai-456586)
*   [Does llms.txt matter? We tracked 10 sites to find out](https://searchengineland.com/does-llms-txt-matter-467740)

* * *

_Search Engine Land is owned by [Semrush](https://www.semrush.com/?utm\_campaign=google-llms-txt-chrome-lighthouse-478246&utm\_source=searchengineland.com&utm\_medium=referral). We remain committed to providing high-quality coverage of marketing topics. Unless otherwise noted, this page’s content was written by either an employee or a paid contractor of [Semrush](https://www.semrush.com/?utm\_campaign=google-llms-txt-chrome-lighthouse-478246&utm\_source=searchengineland.com&utm\_medium=referral) Inc._

* * *

### About the Author

![Image 1: Danny Goodwin](https://searchengineland.com/wp-content/seloads/2024/07/Danny-Goodwin-scaled.jpeg.webp)

Danny Goodwin

Danny Goodwin is Editorial Director of Search Engine Land &[Search Marketing Expo - SMX](https://searchengineland.com/smx "Search Marketing Expo - SMX"). He joined Search Engine Land in 2022 as Senior Editor. In addition to reporting on the latest search marketing news, he manages Search Engine Land’s SME (Subject Matter Expert) program. He also helps … [[Read more]](https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246#authorBio-23878-collapse-iibigu5w5e7)

Danny Goodwin is Editorial Director of Search Engine Land &[Search Marketing Expo - SMX](https://searchengineland.com/smx "Search Marketing Expo - SMX"). He joined Search Engine Land in 2022 as Senior Editor. In addition to reporting on the latest search marketing news, he manages Search Engine Land’s SME (Subject Matter Expert) program. He also helps program U.S. SMX events.

Goodwin has been editing and writing about the latest developments and trends in search and digital marketing since 2007. He previously was Executive Editor of Search Engine Journal (from 2017 to 2022), managing editor of Momentology (from 2014-2016) and editor of Search Engine Watch (from 2007 to 2014). He has spoken at many major search conferences and virtual events, and has been sourced for his expertise by a wide range of publications and podcasts.

[[Read less]](https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246#)

