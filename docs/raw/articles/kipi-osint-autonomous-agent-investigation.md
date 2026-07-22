---
title: "Kipi: Open-source OSINT Investigation Platform with Autonomous Agent"
source_url: https://github.com/assafkip/kipi
author: ""
publish_time: ""
ingested: 2026-06-25
sha256: cab30091a3d905c8
tags: ["agent", "osint", "graph-analytics", "open-source"]
type: article
---

# Kipi: Open-source OSINT Investigation Platform with Autonomous Agent


Markdown Content:
**Drop a dense intel report on it. Get a live, investigated entity graph.**

[![Image 1: kipi building an investigation graph live](https://github.com/assafkip/kipi/raw/main/docs/demo.gif)](https://github.com/assafkip/kipi/blob/main/docs/demo.gif)

The graph above built itself. One seed domain went in. An agent pulled WHOIS, DNS, certificates, and the live sites, then pivoted on what it found. No queries to write. [Watch the full 75 seconds, with sound.](https://github.com/assafkip/kipi/blob/main/docs/demo.mp4)

kipi is an open-source, self-hosted OSINT investigation platform. It turns documents into an investigation. PDFs, screenshots, spreadsheets, pasted notes go in. A typed entity graph comes out. Then an autonomous investigator digs the open web and builds the graph out in front of you: infrastructure pivots, typed edges, gated findings, a written brief.

The analyst stays the top authority. Every schema, finding, and edge gets confirmed, corrected, or rejected by a human. The machine proposes. You decide.

Two things sit together here that I never found in one commercial OSINT platform: document ingestion into entities, and real graph analytics (centrality, communities, pathfinding) on the same investigation canvas.

## What you're watching

[](http://github.com/assafkip/kipi#what-youre-watching)
The demo runs a real case. Two seed domains go in: `trumpfundus.com` and `trumpstake.us`.

By the end, kipi has mapped a Russian-language affiliate fraud network. White-label fake crypto casinos. The backend operator is registered to a shell company in Reykjavík, one month after Brian Krebs killed its predecessor. 20,000+ affiliates. 60 to 80 percent of stolen deposits, paid out in crypto. A Musk-branded clone, flagged for phishing, sitting in the same cluster.

Then it writes the brief. Every claim carries its source and an evidence grade. A DNS record grades an A. An analyst's read is a lead, nothing more. Nothing gets promoted on a name match.

That grading is the point. Most OSINT output reads like a pile of links. This reads like a case.

## Quickstart (10 minutes)

[](http://github.com/assafkip/kipi#quickstart-10-minutes)

git clone https://github.com/assafkip/kipi.git && cd kipi
./install.sh                           # venv + deps + DB; checks tesseract/claude
export ANTHROPIC_API_KEY=sk-ant-...    # the ONE required key
./invctl serve                         # open http://127.0.0.1:8765

Then:

1.   **Reports** → drop a PDF (or pas
