---
source: newsletter
source_url: https://www.implicator.ai/google-open-sources-a-knowledge-format-and-wires-it-into-its-catalog/
ingested: 2026-06-18
sha256: 7aed61af841969a458abe4c06d554f7e5931a40f5151c6e8156716427da7a8be
---


Published Time: 2026-06-16T03:41:17.000Z

Markdown Content:
[Tools & Workflows](https://www.implicator.ai/tag/vibecoding/)

## Google Open-Sources a Knowledge Format and Wires It Into Its Catalog

Google's Open Knowledge Format makes AI-agent knowledge a free, vendor-neutral markdown standard. The same day it shipped, Google wired the format into the Knowledge Catalog it charges to run, and the spec leaves the paid serving layer out of scope. Openness, it turns out, is the strategy.

[![Image 1: Marcus Schuler](https://www.implicator.ai/content/images/2025/12/marcus_schuler_impli.jpg)](https://www.implicator.ai/author/marcus-schuler/)

Google Cloud [published a specification on June 12](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing?ref=implicator.ai) that represents the context AI agents need as a directory of plain markdown files, and the same day updated its Knowledge Catalog product to read that format and serve it to agents. The Open Knowledge Format, written by Google Cloud tech leads Sam McVeety and Amir Hormati, runs 451 lines and demands exactly one field of every document. Hormati described it on LinkedIn as "a format, not a platform."

OKF gives away the part that was never scarce, a file any text editor can open, and points the demand that creates toward the part Google sells, the layer that stores the knowledge, serves it to agents, and controls who may see it. Openness is the mechanism, because a free, portable format turns the knowledge layer into a commodity and routes demand toward the catalog, gateway, and compute Google does not give away. Google's blog frames it differently, saying a knowledge format's value "comes from how many parties speak it, not from who owns it."

Key Takeaways

*   Google Cloud published the Open Knowledge Format on June 12, representing AI-agent knowledge as a directory of plain markdown files with one required field.
*   The same day, Google updated its Knowledge Catalog to ingest OKF and serve it to agents, the paid layer the spec leaves out of scope.
*   OKF formalizes Andrej Karpathy's 'LLM wiki' pattern, already spread through AGENTS.md files used by more than 60,000 open-source projects.
*   Every sample bundle was Google-built; whether vendors like Atlan, Alation, or Collate adopt it decides whether OKF becomes a standard.

AI-generated summary, reviewed by an editor. [More on our AI guidelines](https://www.implicator.ai/about/).

Machine Learning & Artificial Intelligence

## What the spec leaves out

The specification is precise about its limits. In its opening section, [OKF lists as non-goals](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf?ref=implicator.ai) "prescribing storage, serving, or query infrastructure" and replacing domain schemas such as Avro, Protobuf, or OpenAPI, which it says it references rather than subsumes. The document runs 451 lines and about 15 kilobytes, and requires a single frontmatter field, `type`; everything else is left to whoever writes it. The spec states, "If you can `cat` a file, you can read OKF; if you can `git clone` a repo, you can ship it."

Those omissions describe Google's paid layer almost exactly. Storage, serving, query, and access control are what the Knowledge Catalog, which Google detailed earlier this year, handles. Hormati wrote that OKF carries "no dependency on any cloud, model, agent framework or catalog." In the same post he added that Google had "updated Google Data Cloud's Knowledge Catalog to ingest OKF natively and serve it to agents." The vendor-neutral claim and the product integration sit one sentence apart.

## The pattern Google didn't invent

The format itself is borrowed. OKF formalizes what the researcher Andrej Karpathy calls the [LLM wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f?ref=implicator.ai), a folder of markdown an agent reads and maintains on its own, building on the fact that [markdown has become the working format for agent memory](https://www.implicator.ai/shihipar-is-right-markdown-still-wins-memory/). "LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass," Karpathy wrote in the gist Google cites. The same shape had already spread as the AGENTS.md and CLAUDE.md files developers drop into repositories; AGENTS.md alone is used by more than 60,000 open-source projects and is now stewarded by the Agentic AI Foundation under the Linux Foundation.

That history is why conforming to OKF costs almost nothing, and why Google had reason to name it. A convention half the tooling already follows by accident spreads without a sales team. What none of the earlier versions had was a vendor with a catalog to serve them from. By publishing the spec and its reference tools, Google attaches that diffuse practice to a product it can meter while leaving the format unowned.

The agent stack, decoded weekly

Strategic AI news from San Francisco. No hype, no "AI will change everything" throat clearing. Just what moved, who won, and why it matters. Daily at 6am PST.

Machine Learning & Artificial Intelligence

Email address 
Check your inbox. Click the link to confirm.

No spam. Unsubscribe anytime.

## Where the governance lives

Google's own account of agent deployment shows where the value collects. In an [interview with Computer Weekly](https://www.computerweekly.com/news/366644235/Google-Cloud-unpacks-governance-challenges-of-AI-agents?ref=implicator.ai) on June 11, Michael Gerstenhaber, Google Cloud's vice-president of product management for its agent platform, framed the hard problem as one of access rather than authorship. "It's only through identity, permissioning, audit and observability that I'll ever be comfortable giving my virtual employee access to sensitive data," he said, describing an agent gateway, dedicated registries, and a screening tool called Model Armor. None of that is in OKF. A markdown file can state what a table means; it cannot decide which agent may read it, record the access, or stop the data from leaving. Those controls are what Google Cloud sells, and they sit one layer above the format the company just gave away.

## The test a single vendor can't pass

A specification published by one company is not yet a standard. Everything Google shipped was made in-house. Its own enrichment agent produced the three sample bundles, and Google wrote the two reference implementations, so the format launched with no producer or consumer it had not built itself. "A specification becoming widely used by other vendors and open source projects is a different thing than a specification being published," wrote Shashi Bellamkonda, a principal research director at Info-Tech Research Group, who told buyers to ask their catalog vendors whether they will export OKF. Matt Trifiro, writing on LinkedIn, was blunter, calling a v0.1 spec from one vendor an "invitation" rather than a standard.

One outside attempt has already appeared. The independent site No Hacks published a hand-written OKF bundle for its own pages within a day of the launch, testing the format on public-website knowledge Google never targeted.

For now the format is the cheap half of a two-part bet. Google has standardized the layer that was always going to be plain text and wired it into the Knowledge Catalog it charges to run. Whether OKF becomes a real standard or stays a Google format with an open label turns on a number that launched at zero, the count of producers and consumers built by anyone but Google. The catalog vendors Bellamkonda flagged, Atlan, Alation, and Collate, are the first place that count moves or doesn't.

Frequently Asked Questions

What is the Open Knowledge Format?
OKF is an open specification Google Cloud published on June 12, 2026. It represents the metadata and context AI agents need as a directory of plain markdown files with YAML frontmatter. The spec runs 451 lines, requires only one field (type) per document, and needs no SDK or runtime to read or write.

Why did Google release OKF as an open standard?
Google says a knowledge format's value comes from how widely it is adopted, not who owns it. The format is free and vendor-neutral. The same day, Google updated its paid Knowledge Catalog to ingest OKF and serve it to agents, so the open format routes demand toward the serving layer Google sells.

How is OKF different from the LLM wiki or AGENTS.md?
It formalizes the same pattern. Andrej Karpathy's 'LLM wiki' and the AGENTS.md and CLAUDE.md convention files all use markdown an agent reads and maintains. OKF standardizes the small set of rules, like one required type field, that let bundles written by different producers be read by different agents without a translation layer.

Is OKF actually a standard yet?
Not by adoption. Every sample bundle and reference implementation Google shipped was built in-house, so the format launched with no outside producer or consumer. Analysts note that a v0.1 spec from one vendor is an invitation, not a standard, until other catalog vendors or clouds adopt it.

What does the OKF spec leave out?
By its own non-goals, the spec does not prescribe storage, serving, or query infrastructure, and does not replace schemas like Avro or Protobuf. Those omissions describe the governed serving layer, identity, access control, and observability, that Google Cloud's Knowledge Catalog and agent gateway sell.

AI-generated summary, reviewed by an editor. [More on our AI guidelines](https://www.implicator.ai/about/).

[Claude-Mem Hit 80K Stars By Giving Your Second Session a Memory San Francisco | Thursday, June 4, 2026 Claude-Mem, an open-source memory layer for coding agents, has drawn 80,253 GitHub stars since launch. Hooks intercept Claude Code tool use, compress sessions i The Implicator ![Image 2](https://www.implicator.ai/content/images/2026/06/2026-06-03-21.17.05-nl_20260603_key@2x.webp)](https://www.implicator.ai/claude-mem-hit-80k-stars-by-giving-your-second-session-a-memory/)[Repo Radar: 5 GitHub Projects Worth Your Week Anthropic, OpenAI, and Cursor each shipped an official skill or plugin directory this week, pulling the agent-skills scramble out of scattered GitHub gists and into vendor-curated catalogs. The five r The Implicator ![Image 3](https://www.implicator.ai/content/images/2026/05/2026-05-29-04.04.04-2026-05-29-repo-radar-7@2x.webp)](https://www.implicator.ai/repo-radar-5-github-projects-worth-your-week-6/)[Microsoft Build 2026 Turns Windows Into an AI Agent Control Plane Microsoft's Windows developer post on Tuesday said agents will run inside Microsoft Execution Containers, a policy layer that lets developers declare file and network access before an agent acts and h The Implicator ![Image 4](https://www.implicator.ai/content/images/2026/06/2026-06-02-16.26.43-agent_control_plane@2x.webp)](https://www.implicator.ai/microsoft-build-2026-turns-windows-into-an-ai-agent-control-plane/)

[![Image 5: Marcus Schuler](https://www.implicator.ai/content/images/2025/12/marcus_schuler_impli.jpg)](https://www.implicator.ai/author/marcus-schuler/)

### [Marcus Schuler](https://www.implicator.ai/author/marcus-schuler/)

San Francisco

Editor-in-Chief and founder of Implicator.ai. Former ARD correspondent and senior broadcast journalist with 10+ years covering tech. Writes daily briefings on policy and market developments. Based in San Francisco. E-mail: editor@implicator.ai

The Morning Briefing

### Get the Morning Briefing in your inbox.

Sign up to our free daily morning newsletter and free member articles. Only our special weekly Pro Briefing is available for $8/month.

