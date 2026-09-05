---
source: newsletter
source_url: "https://arxiv.org/abs/2608.14071"
ingested: 2026-08-19
sha256: 824a03afae9d1d905b2dcb088ae931a5f49e0fafa3278a053710c1c2826aec96
---

# [2608.14071] Scaling Domain Data Repetition in LLM Pretraining

[2608.14071] Scaling Domain Data Repetition in LLM Pretraining
Skip to main content
Search arXiv
Press Enter to search &middot;
Advanced search
-->
Computer Science > Artificial Intelligence
arXiv:2608.14071
(cs)
[Submitted on 14 Aug 2026]
Title:
Scaling Domain Data Repetition in LLM Pretraining
Authors:
Jingwei Li
,
Xinran Gu
,
Rui Dai
,
Xintong Hao
,
Chengyin Xu
,
Yan Wu
,
Shuran Zheng
,
Jingzhao Zhang
View a PDF of the paper titled Scaling Domain Data Repetition in LLM Pretraining, by Jingwei Li and 7 other authors
View PDF
Abstract:
As large language models scale, their training-token budgets must also increase to maintain an appropriate tokens-per-parameter ratio (\(\mathrm{TPP}\)). However, high-quality domain data is much harder to scale than general web data. As model size and the training-token budget increase, its fraction in the training mixture tends to decrease. Repeating the available high-quality data provides an effective way to counteract this dilution, but excessive repetition may lead to overfitting. We study this trade-off under practical LLM scaling, where the training-token budget grows proportionally with model size. For a fixed domain, we first find that, surprisingly at a fixed \(\mathrm{TPP}\), the optimal repetition count mildly increases with model size. Across different domains, we find that the optimal repetition count is strongly negatively correlated with the final validation loss of a domain: domains with lower loss can generally benefit from more repetitions. In contrast, the amount of unique domain data is only weakly related to the optimal repetition count. These findings suggest that repetition counts tuned on smaller proxy models with the same \(\mathrm{TPP}\) can provide a practical estimate for larger models.
Subjects:
Artificial Intelligence (cs.AI)
Cite as:
arXiv:2608.14071
[cs.AI]
(or
arXiv:2608.14071v1
[cs.AI]
for this version)
https://doi.org/10.48550/arXiv.2608.14071
Focus to learn more
arXiv-issued DOI via DataCite (pending registration)
Submission history
From: Jingwei Li [
view email
]
[v1]
Fri, 14 Aug 2026 08:27:15 UTC (6,276 KB)
Full-text links:
Access Paper:
View a PDF of the paper titled Scaling Domain Data Repetition in LLM Pretraining, by Jingwei Li and 7 other authors
View PDF
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
