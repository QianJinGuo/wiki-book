sha256: 3a44c5e99bb64ec1ab568170728c5ad7b85585cb73bddb4bab4e35c8e66fb0fa
---
title: "Common Crawl - Blog - Host- and Domain-Level Web Graphs April, May, and June 2026"
source_url: "https://commoncrawl.org/blog/host--and-domain-level-web-graphs-april-may-and-june-2026"
ingested: "2026-06-29"
type: article
tags: [newsletter]
---

# Common Crawl - Blog - Host- and Domain-Level Web Graphs April, May, and June 2026


Markdown Content:
We are pleased to announce a new release of host-level and domain-level web graphs based on the crawls of April, May, and June 2026. The crawls used to generate the graphs were [CC-MAIN-2026-17](https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-17/index.html), [CC-MAIN-2026-21](https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-21/index.html), and [CC-MAIN-2026-25](https://data.commoncrawl.org/crawl-data/CC-MAIN-2026-25/index.html). Additional information about the data formats, the processing pipeline, our objectives, and credits can be found in the announcements of prior [Web Graph Releases](https://commoncrawl.org/search?query=webgraph). You may also visit the projects [cc-webgraph](https://github.com/commoncrawl/cc-webgraph) and [cc-pyspark](https://github.com/commoncrawl/cc-pyspark) which include all scripts and tools required to construct the graphs. Instructions to explore the graphs in the webgraph format are given in our collection of [Web Graph Notebooks](https://github.com/commoncrawl/cc-notebooks/tree/master/cc-webgraph-statistics). You may also wish to explore our [Web Graph Statistics](https://commoncrawl.github.io/cc-webgraph-statistics/) page for more information on ranking.

## Host-level Graph

The host-level graph consists of 247.3 million nodes and 6.3 billion edges.

There are 184.2 million dangling nodes (74.48%) and the largest [strongly connected component](https://en.wikipedia.org/wiki/Strongly_connected_component) contains 36.3 million (14.66%) nodes. Dangling nodes stem from:

*   Hosts that have not been crawled, yet are pointed to from a link on a crawled page
*   Hosts without any links pointing to a different host name
*   Hosts which did only return an error page (eg. `HTTP 404`).

Host names in the graph are in [reverse domain name notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation) such that: `www.example.com` becomes `com.example.www`.

You can download the graph and the ranks of all 247.3 million hosts from AWS S3 on the path `s3://commoncrawl/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/` (this requires an account on AWS). Alternatively, you can use `https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/` as prefix to access the files from everywhere.

Please note that the text representation of the host-level graph is shipped in 240 `gzip`-compressed files listed in two path listings - one for the nodes (vertices), one for the edges (arcs). First, download the paths listing and decompress it using `gzip -d` or `gunzip`. By adding the prefix `s3://commoncrawl/` or `https://data.commoncrawl.org/` to each line in the path listing you get the list of URLs to download the entire graph.

## Download files of the Common Crawl April, May, and June 2026 host-level Web Graph

| Size | File | Description |
| --- | --- | --- |
| 1.8 GiB | [cc-main-2026-apr-may-jun-host-vertices.paths.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host-vertices.paths.gz) | nodes ⟨id, rev host⟩, paths of 48 vertices files |
| 27.2 GiB | [cc-main-2026-apr-may-jun-host-edges.paths.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host-edges.paths.gz) | edges ⟨from_id, to_id⟩, paths of 192 edges files |
|  |  |  |
| 9.2 GiB | [cc-main-2026-apr-may-jun-host.graph](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host.graph) | graph in [BVGraph](https://webgraph.di.unimi.it/docs/it/unimi/dsi/webgraph/BVGraph.html) format |
| 1.3 KiB | [cc-main-2026-apr-may-jun-host.properties](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host.properties) |  |
|  |  |  |
| 9.6 GiB | [cc-main-2026-apr-may-jun-host-t.graph](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host-t.graph) | transpose of the graph (outlinks inverted to inlinks) |
| 1.3 KiB | [cc-main-2026-apr-may-jun-host-t.properties](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host-t.properties) |  |
|  |  |  |
| 812 Bytes | [cc-main-2026-apr-may-jun-host.stats](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host.stats) | [WebGraph statistics](https://webgraph.di.unimi.it/docs/it/unimi/dsi/webgraph/Stats.html) |
|  |  |  |
| 4.6 GiB | [cc-main-2026-apr-may-jun-host-ranks.txt.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/host/cc-main-2026-apr-may-jun-host-ranks.txt.gz) | harmonic centrality and pagerank |

## Domain-level Graph

The domain graph is built by aggregating the host graph on the level of pay-level domains (PLDs) based on the [public suffix list](https://en.wikipedia.org/wiki/Public_Suffix_List) maintained on [publicsuffix.org](https://www.publicsuffix.org/). Version (commit) [e596036](https://github.com/publicsuffix/list/commit/e596036) of the public suffix list was used (commit date 2026-05-28T06:25:44Z).

The domain-level graph has 121.1 million nodes and 3.9 billion edges. 64.0% or 77.5 million nodes are dangling nodes, the largest strongly connected component covers 30.0 million or 24.73% of the nodes.

All files related to the domain graph are available on AWS S3 under `s3://commoncrawl/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/` or on `https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/`.

### Download files of the Common Crawl April, May, and June 2026 domain-level Web Graph

| Size | File | Description |
| --- | --- | --- |
| 858.6 MiB | [cc-main-2026-apr-may-jun-domain-vertices.txt.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain-vertices.txt.gz) | nodes ⟨id, rev domain, num hosts⟩ |
| 13.6 GiB | [cc-main-2026-apr-may-jun-domain-edges.txt.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain-edges.txt.gz) | edges ⟨from_id, to_id⟩ |
|  |  |  |
| 6.3 GiB | [cc-main-2026-apr-may-jun-domain.graph](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain.graph) | graph in [BVGraph](https://webgraph.di.unimi.it/docs/it/unimi/dsi/webgraph/BVGraph.html) format |
| 1.3 KiB | [cc-main-2026-apr-may-jun-domain.properties](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain.properties) |  |
|  |  |  |
| 6.4 GiB | [cc-main-2026-apr-may-jun-domain-t.graph](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain-t.graph) | transpose of the graph |
| 1.3 KiB | [cc-main-2026-apr-may-jun-domain-t.properties](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain-t.properties) |  |
|  |  |  |
| 786 Bytes | [cc-main-2026-apr-may-jun-domain.stats](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain.stats) | [WebGraph statistics](https://webgraph.di.unimi.it/docs/it/unimi/dsi/webgraph/Stats.html) |
|  |  |  |
| 2.2 GiB | [cc-main-2026-apr-may-jun-domain-ranks.txt.gz](https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2026-apr-may-jun/domain/cc-main-2026-apr-may-jun-domain-ranks.txt.gz) | harmonic centrality and pagerank |

## Credits

Thanks to the authors of the [WebGraph framework](https://webgraph.di.unimi.it/), whose software made the computation of graph properties and ranks possible. We hope the data will be useful for you to do any kind of research on ranking, graph analysis, link spam detection, etc.

Let us know about your results via [Common Crawl's Google Group](https://groups.google.com/g/common-crawl), or on our [Discord Server](https://discord.gg/njaVFh7avF).
