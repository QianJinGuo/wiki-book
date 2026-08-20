---
title: "Agent Lightning v1.0: Towards Harnessed Agentic RL"
source_url: "https://arxiv.org/abs/2608.17528"
ingested: 2026-08-20
score: 64
stars: 4
value: 8
confidence: 8
source: arxiv
tags: [agent, harness, agentic-rl, post-training, arxiv]
sha256: 1799c6740d81665ddcc226a982cf6f6c14b369c8f077d65c3c02d9f37902e863
---

# Agent Lightning v1.0: Towards Harnessed Agentic RL

[2608.17528] Agent Lightning v1.0: Towards Harnessed Agentic RL
Skip to main content
Search arXiv
Press Enter to search &middot;
Advanced search
-->
Computer Science > Artificial Intelligence
arXiv:2608.17528
(cs)
[Submitted on 18 Aug 2026]
Title:
Agent Lightning v1.0: Towards Harnessed Agentic RL
Authors:
Zhiyuan He
,
Siwei Zhang
,
Zhiwen Zhou
,
Yuqing Yang
,
Yu Kang
,
Yuge Zhang
,
Luna K. Qiu
,
Tin Yan Tsui
,
Jiahang Xu
,
Chong Luo
View a PDF of the paper titled Agent Lightning v1.0: Towards Harnessed Agentic RL, by Zhiyuan He and 9 other authors
View PDF
HTML (experimental)
Abstract:
Modern agents operate inside agent harnesses that manage tools, context, and control flow, making the harness a critical part of the agent system. Our original Agent Lightning introduced a disaggregated architecture that connects arbitrary agents to RL training through an LLM endpoint proxy, an approach later adopted by frameworks such as verl Uni-Agent, AReaL 2.0, slime, and Polar. We refer to this paradigm as harnessed agentic RL, where the deploy-time harness directly participates in model post-training. Harnessed agentic RL differs fundamentally from traditional agentic RL: the harness, rather than the training engine, owns the environment interaction loop, while the trainer observes only sequences of LLM request-response pairs. This introduces challenges in retokenization, sample merging, advantage calculation, loss normalization, and backend scheduling, which can substantially affect training stability and effectiveness. We present Agent Lightning v1.0, a lightweight framework for harnessed agentic RL implemented in approximately 3,500 lines of code. It supports arbitrary agent harnesses and serves as a practical testbed for studying these challenges. We evaluate it on instruction-following, search, and coding agents, and provide a complete reproducible pipeline for coding-agent RL. Using only 6K training examples and modest compute, RL improves Qwen3.5-9B on SWE-bench Verified from 41.8% to 56.4%, a 14.6-point absolute gain. We release the complete workflow and training scripts to facilitate reproducible research on harnessed agentic RL.
Subjects:
Artificial Intelligence (cs.AI)
; Software Engineering (cs.SE)
Cite as:
arXiv:2608.17528
[cs.AI]
(or
arXiv:2608.17528v1
[cs.AI]
for this version)
https://doi.org/10.48550/arXiv.2608.17528
Focus to learn more
arXiv-issued DOI via DataCite (pending registration)
Submission history
From: Zhiyuan He [
view email
]
[v1]
Tue, 18 Aug 2026 08:50:13 UTC (427 KB)
Full-text links:
Access Paper:
View a PDF of the paper titled Agent Lightning v1.0: Towards Harnessed Agentic RL, by Zhiyuan He and 9 other authors
View PDF
HTML (experimental)
TeX Source
view license
Current browse context:
cs.AI
< prev
|
next >
new
|
recent
|
2026-08
Change to browse by:
cs
cs.SE
References & Citations
NASA ADS
Google Scholar
Semantic Scholar
export BibTeX citation
Loading...
BibTeX formatted citation
&times;
loading...
Data provided by:
Bookmark
Bibliographic Tools
Bibliographic and Citation Tools
Bibliographic Explorer Toggle
Bibliographic Explorer
(
What is the Explorer?
)
Connected Papers Toggle
Connected Papers
(
What is Connected Papers?
)
Litmaps Toggle
Litmaps
(
What is Litmaps?
)
scite.ai Toggle
scite Smart Citations
(
What are Smart Citations?
)
Code, Data, Media
Code, Data and Media Associated with this Article
alphaXiv Toggle
alphaXiv
(
What is alphaXiv?
)
Links to Code Toggle
CatalyzeX Code Finder for Papers
(
What is CatalyzeX?
)
DagsHub Toggle
DagsHub
(
What is DagsHub?
)
GotitPub Toggle
Gotit.pub
(
What is GotitPub?
)
Huggingface Toggle
Hugging Face
(
What is Huggingface?
)
ScienceCast Toggle
ScienceCast
(
What is ScienceCast?
)
Demos
Demos
Replicate Toggle
Replicate
(
What is Replicate?
)
Spaces Toggle
Hugging Face Spaces
(
What is Spaces?
)
Spaces Toggle
TXYZ.AI
(
What is TXYZ.AI?
)
Related Papers
Recommenders and Search Tools
Link to Influence Flower
Influence Flower
(
What are Influence Flowers?
)
Core recommender toggle
CORE Recommender
(
What is CORE?
)
Author
Venue
Institution
Topic
About arXivLabs
arXivLabs: experimental projects with community collaborators
arXivLabs is a framework that allows collaborators to develop and share new arXiv features directly on our website.
Both individuals and organizations that work with arXivLabs have embraced and accepted our values of openness, community, excellence, and user data privacy. arXiv is committed to these values and only works with partners that adhere to them.
Have an idea for a project that will add value for arXiv's community?
Learn more about arXivLabs
.
Which authors of this paper are endorsers?
|
Disable MathJax
(
What is MathJax?
)
