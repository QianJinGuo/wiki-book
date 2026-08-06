---
source: newsletter
source_url: "https://arxiv.org/abs/2607.29377"
arxiv_id: 2607.29377
authors: [Yilin Xiao, Zhehan Zhu, Yujing Zhang, Jin Chen, Zijin Hong, Luyao Zhuang, Qinggang Zhang, Shengyuan Chen, Xiaocao Ouyang, Lingfei Ren, Xiao Huang]
source_published: 2026-07-31
ingested: 2026-08-06
sha256: eee854a316211b290364b9b345b20dc1914696f9973069ed6a832e91ba93d2ba
---

# Zero-Mem: Zero-Token Memory Operations for LLM Agents

# Zero-Mem: Zero-Token Memory Operations for LLM Agents

Zero-Mem: Zero-Token Memory Operations for LLM Agents
Report GitHub Issue
×
Title:
Content selection saved. Describe the issue below:
Description:
arXiv is now an independent nonprofit!
Learn more
&times;
Back to arXiv
License: CC BY-NC-SA 4.0
arXiv:2607.29377v1 [cs.CL] 31 Jul 2026
Zero-Mem: Zero-Token Memory Operations for LLM Agents
Yilin Xiao
♠
\spadesuit
, Zhehan Zhu
♣
\clubsuit
, Yujing Zhang
♠
\spadesuit
, Jin Chen
♣
\clubsuit
, Zijin Hong
♠
\spadesuit
, Luyao Zhuang
♠
\spadesuit
,
Qinggang Zhang
♢
\diamondsuit
, Shengyuan Chen
♠
\spadesuit
, Xiaocao Ouyang
♣
\clubsuit
, Lingfei Ren
♣
\clubsuit
, Xiao Huang
♠
\spadesuit
Abstract
LLM agents need memory to act consistently over long interactions, yet many systems use additional LLM calls to operate that memory. Generating intermediate records and mediating their retrieval adds recurring token and time costs, while omitted or merged details can obscure the original evidence. We ask whether structured memory access requires generation at all. Zero-Mem introduces
zero-token memory operations
: no step outside final question answering invokes an LLM or consumes LLM input or output tokens; encoder computation is accounted for separately. Zero-Mem preserves original interaction traces as its source of record. It organizes the traces in two complementary ways. An entity–context graph exposes connections across interactions, while a temporal hierarchy preserves conversational locality and session state. For each query, Zero-Mem weighs the two views, retrieves from both, and follows their structure to recover supporting relations or surrounding context. Deterministic calibration first discards conflicting evidence and then keeps the reader’s answer grounded in the retrieved traces. Only the final-QA reader invokes an LLM. Across long-memory and long-context question-answering benchmarks, Zero-Mem achieves competitive performance while eliminating LLM calls and LLM-token consumption from memory operations. With the same final-QA reader and context budget, it reduces memory-operation time cost by 57.6% relative to the fastest compared baseline. Ablations support the contribution of the two views and their query-dependent coordination. Overall, the results show that structured agent memory need not generate an intermediate representation of the past. After peer review, the code and implementation details will be available at
https://github.com/TheMoon0815/Zero-mem
.
Introduction
Large language model (LLM) agents increasingly operate over extended interactions, accumulating utterances, actions, tool observations, and task outcomes
(Luo
et al.
2025
; Du
et al.
2026
; Xi
et al.
2025
)
. Their reliability therefore depends not only on reasoning over the current input, but also on recovering the right evidence from a growing interaction history. A memory system must preserve information across sessions while preventing irrelevant or outdated traces from dominating the current decision. The central challenge is thus no longer merely how to store more context, but how to recover evidence associated with the correct entity, session, and temporal state when it becomes relevant
(Zhang
et al.
2025b
; Hu
et al.
2026b
; Yang
et al.
2026
; Wu
et al.
2025
)
.
Figure 1:
Comparison of different agent-memory operating regimes. Generative memory relies on LLM-generated abstractions, while raw retrieval searches unstructured traces and may miss distributed evidence. Zero-Mem builds relational and temporal memory structures and performs all memory operations with zero LLM calls or tokens; only final QA invokes an LLM.
Across agent-memory and agentic structured-retrieval systems, language models have been used to summarize or reflect on experience, construct hierarchical abstractions and graph indexes, and generate or evolve linked memory records
(Zhong
et al.
2024
; Salama
et al.
2025
; Sun
et al.
2026
; Gutierrez
et al.
2024
; Anokhin
et al.
2025
; Zhang
et al.
2025a
)
. These transformations can make large histories easier to access, but they also turn memory management into a recurring generative workload. When generated abstractions mediate later retrieval, omitted details, merged subjects, or blurred temporal updates may weaken traceability to the original interaction. The opposite strategy is to retain the complete history and retrieve directly from raw traces
(Yan
et al.
2025
; Xu
et al.
2022
)
. Although this preserves source evidence, flat lexical or dense retrieval can confuse semantically similar traces from different users, sessions, or temporal states, and may fail when supporting evidence is distributed across multiple interactions. Effective memory therefore requires faithful preservation and structured, query-conditioned evidence selection.
Recent systems reduce this dependence rather than eliminate it. SimpleMem
(Liu
et al.
2026
)
improves token efficiency through semantic structured compression, online semantic synthesis, and intent-aware retrieval planning, while LightMem
(Fang
et al.
2026
)
shifts several memory operations from large LLMs to specialized small language models and separates online retrieval from offline consolidation. These approaches reduce generative overhead, but do not target a memory pipeline in which final question answering is the only LLM-dependent stage. We therefore ask:
Can an agent memory system eliminate LLM calls from every operation outside final question answering, while retaining structured access beyond flat similarity retrieval?
We refer to this operating regime as
zero-token memory operations
: memory construction, organization, routing, retrieval, evidence closure, and both pre-reader evidence calibration and post-reader answer calibration invoke no LLM and consume no LLM input or output tokens. Encoder computation and final-QA inference are accounted for separately.
We propose
Zero-Mem
, which reformulates memory operation as structured evidence selection over provenance-bearing interaction traces. Rather than replacing histories with generated abstractions, Zero-Mem retains the original traces as the source of record and derives two complementary, non-generative views over them. An entity–context graph captures observed co-occurrence and trace adjacency for relational access, while a temporally ordered hierarchy preserves conversational locality and session-level state. Both views resolve to the same provenance-bearing source units. At query time, a lightweight profile coordinates the two views according to the structural requirements of the query. Their rankings are fused, and evidence closure supplements the main candidates with relational connections and surrounding trace context. Deterministic evidence calibration then produces a compact evidence set
R
​
(
q
)
R(q)
for final QA. The reader is the only LLM-dependent stage; afterward, deterministic answer calibration applies evidence-support, type, and format checks without invoking another model. Thus, no generated memory intervenes between the original trace and the evidence exposed to the reader.
Across the long-context and long-memory QA benchmarks, Zero-Mem achieves competitive performance while reducing memory-operation LLM calls and tokens to zero. With an identical final-QA reader and equivalent context budget, Zero-Mem achieves a 57.6% reduction in memory-operation latency compared to the most time-efficient baseline, and ablation studies further verify the effectiveness of each core module. Our contributions are threefold:
•
We define
zero-token agent memory
, an operating regime in which every operation outside final QA uses zero LLM calls and zero LLM input or output tokens, separating memory-operation cost from final-reader inference.
•
We introduce
Zero-Mem
, a provenance-preserving framework that coordinates relational and temporally ordered views to perform structured evidence selection directly over original interaction traces.
•
We evaluate Zero-Mem on multiple long-memory benchmarks, demonstrating its competitive performance under zero memory-operation LLM cost and analyzing the contributions of its complementary core modules.
Related Work
Agent-memory systems organize, update, and retrieve growing interaction histories
(Yao
et al.
2023
; Schick
et al.
2023
; Wang
et al.
2024
; Park
et al.
2023
; Shinn
et al.
2023
)
. Zep
(Rasmussen
et al.
2025
)
builds a temporally aware knowledge-graph memory layer with episodic, semantic-entity, and community subgraphs and a dual-time model tracking event and ingestion times. Mem0
(Chhikara
et al.
2025
)
incrementally extracts and updates memories through LLM tool calls for add, update, delete, and no-op operations; Mem0g models entity relations with a directed labeled graph. A-Mem
(Xu
et al.
2025
)
follows the Zettelkasten note-taking method, constructing structured memory notes with keywords, tags, and contextual descriptions while dynamically linking related memories. MemoryOS
(Kang
et al.
2025
)
uses an operating-system-inspired architecture with short-term, mid-term, and long-term storage, paging, and popularity-based updates. GAM
(Yan
et al.
2025
)
combines lightweight offline memory with online deep research under a just-in-time memory paradigm, constructing task-specific contexts at higher query-time cost. CompassMem
(Hu
et al.
2026a
)
organizes experiences into event-centric memory graphs with explicit relations for complex questions. LightMem
(Fang
et al.
2026
)
decouples memory updates from online inference, applying pre-compression and topic segmentation to reduce latency and token cost. SimpleMem
(Liu
et al.
2026
)
combines semantic structured compression, online semantic synthesis, and intent-aware retrieval planning to reduce token consumption. Together, these systems improve memory efficiency, while many retain generative processing within the memory lifecycle.
Preliminaries
An LLM agent accumulates a history of past interactions
ℋ
=
(
s
1
,
…
,
s
T
)
\mathcal{H}=(s_{1},\ldots,s_{T})
, where each trace unit
s
i
s_{i}
may contain user messages, assistant responses or actions, tool observations, timestamps, speakers, and session metadata. Given a current query
q
q
, an agent memory system retrieves relevant information from the history to construct an evidence set
R
​
(
q
)
=
Memory
⁡
(
q
,
ℋ
)
.
R(q)=\operatorname{Memory}(q,\mathcal{H}).
(1)
A reader LLM then uses the retrieved evidence to produce the answer:
a
=
Reader
⁡
(
q
,
R
​
(
q
)
)
.
a=\operatorname{Reader}(q,R(q)).
(2)
In this work, Zero-Mem instantiates the memory function through non-generative memory construction, organization, retrieval, routing, and calibration.
Figure 2:
Overview of Zero-Mem. Original interaction traces are organized into a provenance-preserving entity–context graph and temporal hierarchy without generative abstraction. Query-conditioned routing weights the two views, whose retrieved evidence is fused and completed with relational bridges and local neighbors. Deterministic calibration filters and ranks the evidence and checks the reader output. All memory operations are token-free; the final-QA reader is the only LLM call.
Method
Overview of Zero-Mem
Zero-Mem implements the memory function through token-free evidence selection. It retains original interaction traces as the authoritative memory source and builds non-generative retrieval structures over them. Zero-Mem consists of four components: a
Provenance-preserving Token-Free Memory Substrate
,
Query-Conditioned Evidence Routing
,
Dual-View Evidence Retrieval and Closure
, and
Deterministic Evidence Calibration
. The graph view recovers relational evidence, while the hierarchical view preserves local, temporal, and session context. Routing controls their relative priority, closure supplements the retrieved candidates with structurally related evidence, and calibration removes inconsistent or unsupported content. All memory operations are token-free, and only the final reader produces the answer.
Provenance-preserving Token-Free Memory Substrate
Zero-Mem does not replace raw histories with generated abstractions. Each derived unit retains its original text together with source identifier, session time, boundary identifier, and other available metadata. Consequently, retrieved evidence remains traceable to observed interactions rather than model-generated memory statements.
Relational trace graph.
Zero-Mem applies the non-generative Named Entity Recognition (NER) model (e.g., spaCy) to each context unit and constructs an observed entity–context graph from the detected entities:
G
=
(
V
d
∪
V
e
,
E
d
​
e
∪
E
d
​
d
)
,
G=(V_{d}\cup V_{e},E_{de}\cup E_{dd}),
(3)
where
V
d
V_{d}
and
V
e
V_{e}
denote context and entity nodes, respectively.
E
d
​
e
E_{de}
contains entity–context co-occurrence edges, and
E
d
​
d
E_{dd}
contains adjacency edges between neighboring context units. An entity–context edge is added when entity
e
e
is detected in context unit
d
i
d_{i}
, with weight:
w
​
(
d
i
,
e
)
=
c
​
(
e
,
d
i
)
∑
e
′
∈
ℰ
​
(
d
i
)
c
​
(
e
′
,
d
i
)
.
w(d_{i},e)=\frac{c(e,d_{i})}{\sum_{e^{\prime}\in\mathcal{E}(d_{i})}c(e^{\prime},d_{i})}.
(4)
where
c
​
(
e
,
d
i
)
c(e,d_{i})
is the occurrence frequency of
e
e
in
d
i
d_{i}
.
ℰ
​
(
d
i
)
\mathcal{E}(d_{i})
denotes the set of entities detected in
d
i
d_{i}
. Adjacent context units are also connected to preserve local continuity. The graph records observed co-occurrence and trace adjacency rather than generating semantic triples or inferred relations.
Hierarchical trace units.
Graph structure alone does not preserve the local order and temporal state of an interaction. Zero-Mem organizes traces at multiple granularities:
𝒯
​
(
ℋ
)
=
U
turn
∪
U
window
∪
U
episode
∪
U
local
.
\mathcal{T}(\mathcal{H})=U_{\mathrm{turn}}\cup U_{\mathrm{window}}\cup U_{\mathrm{episode}}\cup U_{\mathrm{local}}.
(5)
Turns preserve atomic utterances, windows retain short-range context, and episodes group adjacent windows into coherent event regions according to semantic continuity and available temporal or session boundaries. Local spans preserve the immediate neighborhood of a candidate turn and are used when the selected evidence requires surrounding context. All units inherit provenance from their underlying raw traces.
Lexical and dense access signals.
Zero-Mem additionally indexes trace units with lexical statistics (BM25) and dense embeddings (BGE-M3). Lexical signals identify exact names, dates, numbers, titles, and phrases, while dense signals provide semantic anchors when surface overlap is weak. These representations support indexing, seeding, and scoring only; they do not generate or rewrite memory content.
Query-Conditioned Evidence Routing
For each query, Zero-Mem constructs a lightweight profile
ϕ
(
q
)
=
{
\displaystyle\phi(q)=\{
subject
,
keywords
,
answer
​
-
​
type
,
\displaystyle\mathrm{subject},\mathrm{keywords},\mathrm{answer\mbox{-}type},
(6)
temporal
-
cues
,
boundary
}
.
\displaystyle\mathrm{temporal\mbox{-}cues},\mathrm{boundary}\}.
The subject and keywords provide content anchors, while the answer type and temporal cues characterize the structural requirements of the requested evidence. When available, the boundary specifies the admissible interaction scope. These signals are obtained from the query and available metadata without using gold answers, and are shared by routing and subsequent evidence selection. The profile determines which evidence view receives priority:
Route
⁡
(
q
)
∈
{
relational
,
local
}
.
\operatorname{Route}(q)\in\{\mathrm{relational},\mathrm{local}\}.
(7)
The relational route denotes graph priority, whereas the local route denotes hierarchy priority. The routing decision is based on deterministic query-structure signals, including question form, temporal or aggregation requirements, and the availability of subject anchors. Both views are executed in the full model; routing primarily controls their relative weights during fusion. Let
ρ
\rho
denote the globally shared primary-view weight. Relational queries assign weights
ρ
\rho
and
1
−
ρ
1-\rho
to the graph and hierarchical views, respectively, while local queries reverse these weights.
Dual-View Evidence Retrieval
Graph evidence propagation.
The graph view first aligns each entity
e
^
\hat{e}
extracted from the query with its most similar observed graph entity
e
e
. Its initial activation is:
η
0
​
(
e
∣
q
)
=
cos
⁡
(
𝐞
,
𝐞
^
)
,
e
=
arg
⁡
max
e
′
∈
V
e
⁡
cos
⁡
(
𝐞
′
,
𝐞
^
)
,
\eta_{0}(e\mid q)=\cos(\mathbf{e},\hat{\mathbf{e}}),\qquad e=\arg\max_{e^{\prime}\in V_{e}}\cos(\mathbf{e}^{\prime},\hat{\mathbf{e}}),
(8)
where
𝐞
\mathbf{e}
and
𝐞
^
\hat{\mathbf{e}}
are their dense representations. Dense context matches provide context priors when aligned entities are available and a direct fallback ranking when none is detected, while lexical and phrase signals refine the resulting context ranking. Zero-Mem then expands activation from these matched graph entities through relevant co-occurrence sentences. Let
Z
​
(
e
)
Z(e)
denote the set of sentences containing entity
e
e
. The propagated activation of entity
e
′
e^{\prime}
is
η
t
+
1
​
(
e
′
)
=
∑
e
∈
ℰ
t
η
t
​
(
e
)
​
∑
z
∈
Z
​
(
e
)
∩
Z
​
(
e
′
)
sim
⁡
(
q
,
z
)
,
\eta_{t+1}(e^{\prime})=\sum_{e\in\mathcal{E}_{t}}\eta_{t}(e)\sum_{z\in Z(e)\cap Z(e^{\prime})}\operatorname{sim}(q,z),
(9)
where
t
t
is the propagation step,
ℰ
t
\mathcal{E}_{t}
is the set of active graph entities at step
t
t
, with
ℰ
0
\mathcal{E}_{0}
consisting of the matched entities, and
sim
⁡
(
q
,
z
)
\operatorname{sim}(q,z)
denotes the dense similarity between query
q
q
and sentence
z
z
. An entity therefore receives a high score when it co-occurs with an already activated graph entity in sentences relevant to the query. The propagated entity activations and dense context priors are combined into a query-specific reset vector
𝐫
q
\mathbf{r}_{q}
. Personalized PageRank then distributes this evidence over the relational graph:
𝝅
q
=
(
1
−
γ
)
​
𝐫
q
+
γ
​
P
⊤
​
𝝅
q
,
\boldsymbol{\pi}_{q}=(1-\gamma)\mathbf{r}_{q}+\gamma P^{\top}\boldsymbol{\pi}_{q},
(10)
where
𝝅
q
\boldsymbol{\pi}_{q}
is the query-conditioned stationary node-score vector,
𝐫
q
\mathbf{r}_{q}
is a normalized reset distribution combining propagated entity activations and dense context priors,
P
P
is the row-normalized graph transition matrix, and
γ
∈
(
0
,
1
)
\gamma\in(0,1)
is the damping factor. PageRank values on context nodes form the graph-view ranking. Exact lexical and phrase matches are finally used to refine this ranking for names, dates, values, titles, and quoted expressions.
Hierarchical evidence retrieval.
The hierarchical view retrieves evidence through coarse-to-fine search. Each unit is evaluated by jointly considering its semantic relevance to the query and its structural compatibility with the query profile. The compatibility signals include subject consistency, temporal validity, boundary consistency, expected answer type, and lexical or phrase support. These signals are used to refine the semantic ranking rather than being treated as independently generated evidence. Retrieval proceeds from episodes to windows and then to individual turns:
U
episode
→
U
window
→
U
turn
→
U
local
.
U_{\mathrm{episode}}\rightarrow U_{\mathrm{window}}\rightarrow U_{\mathrm{turn}}\rightarrow U_{\mathrm{local}}.
(11)
Episodes identify relevant event regions, windows narrow the search to local contexts, and turns expose the original evidence. When a selected turn depends on nearby information, its local span is added to preserve the immediate narrative or conversational state. Unlike graph propagation, this view explicitly maintains ordering, temporal locality, and session-level context.
Model
Method
LoCoMo
Single Hop
Multi Hop
Temporal
Open Domain
Average
F1
BLEU-1
F1
BLEU-1
F1
BLEU-1
F1
BLEU-1
F1
BLEU-1
GPT-4o-mini
LONG-LLM
46.68
37.54
29.23
22.76
25.97
19.42
16.87
13.70
37.31
29.57
RAG
52.45
47.94
27.50
20.13
46.07
40.35
23.23
17.94
44.73
39.40
HippoRAG
54.84
48.84
33.59
25.46
48.17
39.32
28.59
23.89
47.92
41.02
A-Mem
44.65
37.06
27.02
20.09
45.85
36.67
12.14
12.00
39.65
32.31
Mem0
47.65
38.72
38.72
27.13
48.93
40.51
28.64
21.58
45.10
35.90
MemoryOS
48.62
42.99
35.27
25.22
41.15
30.76
20.02
16.52
42.84
35.54
LightMem
41.79
37.83
29.78
24.80
43.71
39.72
16.89
13.92
38.44
34.36
SimpleMem
53.48
47.59
36.93
28.80
51.30
45.29
21.78
15.67
48.02
41.68
CompassMem
57.36
49.79
38.84
27.98
57.96
50.51
26.61
20.01
52.18
44.09
GAM
57.75
52.10
42.29
34.44
59.45
53.11
33.30
26.97
53.75
47.51
Zero-Mem
66.65
60.53
41.61
32.92
61.97
57.45
35.52
30.47
59.15
52.96
Qwen2.5-14B
LONG-LLM
46.05
39.56
32.08
24.46
30.51
24.45
14.89
11.41
38.31
31.90
RAG
47.87
42.79
26.38
19.54
30.78
25.97
14.16
10.52
38.27
33.01
HippoRAG
42.45
37.14
27.57
20.62
30.66
26.33
19.74
15.81
35.85
30.53
A-Mem
33.75
30.04
22.09
15.28
27.19
22.05
13.49
10.74
28.98
24.47
Mem0
42.58
35.15
31.73
24.82
28.96
26.24
15.03
11.28
36.04
29.91
MemoryOS
46.33
41.62
38.19
29.26
32.24
27.86
20.27
15.94
40.28
34.89
LightMem
34.92
31.22
25.45
19.61
32.03
27.70
15.81
11.81
31.39
27.15
SimpleMem
51.11
45.47
34.04
25.65
48.46
36.07
23.41
21.45
45.71
38.39
CompassMem
61.02
55.93
42.32
32.66
47.18
39.69
25.88
22.01
52.52
46.17
GAM
58.93
53.74
42.96
34.48
51.52
44.43
30.63
26.04
52.70
46.55
Zero-Mem
64.09
58.19
44.06
35.13
58.34
53.61
37.57
32.46
57.57
51.41
Table 1:
Performance comparison on LoCoMo. Results are reported across four question types under two evaluation metrics, F1 and BLEU-1, using GPT-4o-mini and Qwen2.5-14B as base LLMs. The best results are shown in
bold
, and the second-best results are
underlined
.
Dual-View Evidence Closure
Zero-Mem first aligns the graph and hierarchical rankings through
query-wise score normalization. For each view
v
∈
{
g
,
h
}
v\in\{g,h\}
,
S
^
v
​
(
d
)
=
{
0
,
d
​
is absent from view
​
v
,
S
v
​
(
d
)
−
S
v
min
S
v
max
−
S
v
min
,
S
v
max
>
S
v
min
,
1
,
S
v
max
=
S
v
min
,
\widehat{S}_{v}(d)=\begin{cases}0,&d\text{ is absent from view }v,\\[2.0pt]
\dfrac{S_{v}(d)-S_{v}^{\min}}{S_{v}^{\max}-S_{v}^{\min}},&S_{v}^{\max}>S_{v}^{\min},\\[8.0pt]
1,&S_{v}^{\max}=S_{v}^{\min},\end{cases}
(12)
where
S
v
min
S_{v}^{\min}
and
S
v
max
S_{v}^{\max}
are computed over the candidates
returned by view
v
v
. The normalized rankings are fused using the dual-view routing coefficient
ρ
\rho
:
S
fuse
​
(
d
)
=
ρ
​
S
^
primary
​
(
d
)
+
(
1
−
ρ
)
​
S
^
secondary
​
(
d
)
.
S_{\mathrm{fuse}}(d)=\rho\,\widehat{S}_{\mathrm{primary}}(d)+(1-\rho)\,\widehat{S}_{\mathrm{secondary}}(d).
(13)
The graph view is primary for relational queries, whereas the
hierarchical view is primary for local queries. Let
M
​
(
q
)
M(q)
denote the main evidence retained after fusion. Zero-Mem augments it with bounded, query-conditioned support from the two views:
C
​
(
q
)
=
Dedup
⁡
(
M
​
(
q
)
∪
𝒩
g
​
(
M
​
(
q
)
)
∪
𝒩
h
​
(
M
​
(
q
)
)
)
.
C(q)=\operatorname{Dedup}\left(M(q)\cup\mathcal{N}_{g}(M(q))\cup\mathcal{N}_{h}(M(q))\right).
(14)
Here,
𝒩
g
\mathcal{N}_{g}
supplies additional graph-ranked contexts with relational or bridging support, while
𝒩
h
\mathcal{N}_{h}
restores neighboring turns or local spans; either support set may be empty when no addition is required. Duplicates are merged using shared unit identifiers or source provenance when available, yielding a compact evidence set with relational and local support.
Deterministic Evidence Calibration
Zero-Mem applies deterministic calibration at both the evidence and answer levels. After evidence closure, it removes candidates that violate provenance or query-boundary constraints and ranks the remaining evidence by subject, temporal, and answer-type compatibility:
R
​
(
q
)
=
Rank
ϕ
​
(
q
)
⁡
(
Filter
⁡
(
C
​
(
q
)
,
ϕ
​
(
q
)
)
)
.
R(q)=\operatorname{Rank}_{\phi(q)}\left(\operatorname{Filter}\left(C(q),\phi(q)\right)\right).
(15)
Here,
Filter
\operatorname{Filter}
enforces the hard constraints, whereas
Rank
ϕ
​
(
q
)
\operatorname{Rank}_{\phi(q)}
orders the admissible evidence without altering its content. The reader produces an initial answer
a
0
a_{0}
from
R
​
(
q
)
R(q)
. For answer forms admitting deterministic checks, Zero-Mem extracts evidence-local candidates and calibrates the output:
A
​
(
q
)
\displaystyle A(q)
=
Extract
⁡
(
R
​
(
q
)
,
ϕ
type
​
(
q
)
)
,
\displaystyle=\operatorname{Extract}\left(R(q),\phi_{\mathrm{type}}(q)\right),
(16)
a
\displaystyle a
=
Calibrate
⁡
(
a
0
,
q
,
A
​
(
q
)
,
R
​
(
q
)
,
ϕ
​
(
q
)
)
.
\displaystyle=\operatorname{Calibrate}\left(a_{0},q,A(q),R(q),\phi(q)\right).
Calibration preserves
a
0
a_{0}
when it is supported and well-formed; otherwise, it applies evidence-preserving normalization, extractive shortening, or item-wise list pruning. A scalar answer is replaced only by a unique type-compatible candidate in
A
​
(
q
)
A(q)
; if no deterministic correction is available,
a
0
a_{0}
is retained.
Method
Answer Quality
Memory-Operation Overhead
F1 Score
BLEU-1
Tokens
Tokens / Query
Time (s)
Time / Query (s)
SimpleMem
48.02
41.68
14,096,246
9,153.41
8,365.38
5.43
LightMem
38.44
34.36
877,086
569.54
788.76
0.51
GAM
53.75
47.51
28,570,674
18,552.39
9,237.25
6.00
Zero-Mem (Ours)
59.15
52.96
0
0
334.77
0.22
Relative Gain/Reduction
10.0%
↑
\uparrow
11.5%
↑
\uparrow
100.0%
↓
\downarrow
100.0%
↓
\downarrow
57.6%
↓
\downarrow
57.6%
↓
\downarrow
Table 2:
Efficiency comparison under a unified experimental configuration.
All methods use four concurrent threads, GPT-4o-mini as the backbone LLM,
and identical test hardware. Relative Gain/Reduction is computed against
the underlined result.
Experiment
Experimental Setup
Datasets.
We evaluate Zero-Mem on two complementary benchmarks. 1)
LoCoMo
(Maharana
et al.
2024
)
is a widely adopted benchmark for assessing long-term memory in conversational agents over extended, multi-session interactions. Following prior work
(Yan
et al.
2025
)
, we evaluate its single-hop, multi-hop, temporal-reasoning, and open-domain tasks. 2)
HotpotQA
(Yang
et al.
2018
)
is a Wikipedia-based benchmark for multi-hop question answering. Following MemAgent
(Yu
et al.
2026
)
, we adopt the curated memory-evaluation variant, which combines gold supporting documents with distractor passages. Varying the number of distractors produces three context-length settings of 56K, 224K, and 448K tokens.
Baselines.
We organize the comparison methods into two groups. 1)
Memory-free baselines
comprise LONG-LLM and RAG. LONG-LLM partitions the interaction history into multiple text blocks using a sliding window, processes each block independently, and returns the candidate answer with the highest confidence. RAG divides the history into 2,048-token chunks and retrieves the top five chunks by semantic similarity as supporting context for answer generation. 2)
Memory-based baselines
comprise A-Mem
(Xu
et al.
2025
)
, Mem0
(Chhikara
et al.
2025
)
, MemoryOS
(Kang
et al.
2025
)
, LightMem
(Fang
et al.
2026
)
, SimpleMem
(Liu
et al.
2026
)
, CompassMem
(Hu
et al.
2026a
)
, and GAM
(Yan
et al.
2025
)
. These methods maintain specialized memory structures over historical information and access them during inference to support memory-grounded tasks. Additional baseline descriptions are provided in the Appendix.
Implementation Details.
We use GPT-4o-mini and Qwen2.5-14B-Instruct as the backbone LLMs for Zero-Mem and all baselines, representing closed-source and open-source settings, respectively. Within each setting, all methods use an identical final-QA reader and equivalent context budget, so the comparison isolates differences in their memory pipelines. Damping factor
γ
\gamma
and dual-view routing coefficient
ρ
\rho
are both set to 0.6. All experiments are executed in a common hardware environment equipped with NVIDIA RTX 4090 GPUs. For controlled comparison, we cap the number of retrieved items at five for every method. We follow the evaluation metrics and protocols established in prior work
(Yan
et al.
2025
; Liu
et al.
2026
)
.
Method
GPT-4o-mini
Qwen2.5-14B
56K
224K
448K
56K
224K
448K
LONG-LLM
56.56
54.29
53.92
49.75
46.82
43.17
RAG
52.71
51.84
54.01
51.81
46.72
48.36
A-Mem
33.90
30.22
31.37
27.04
25.65
22.92
Mem0
32.58
31.74
27.41
30.12
32.44
26.55
MemoryOS
26.47
23.10
24.16
24.58
30.25
23.13
LightMem
40.93
35.28
30.02
37.30
27.72
28.25
GAM
63.22
64.56
59.81
64.07
55.99
57.87
Zero-Mem
72.07
66.43
65.04
68.58
65.47
61.02
Table 3:
Performance comparison (F1 score) on HotpotQA across different base LLMs and context length settings.
Main Results
LoCoMo.
Table
1
reports the results on LoCoMo, which evaluates memory over multi-session conversations and emphasizes the recovery of entity-specific, temporal, and cross-session information. Zero-Mem achieves the best average F1 and BLEU-1 under both LLM readers. Relative to GAM, the strongest overall baseline, it improves average F1 and BLEU-1 by 5.40 and 5.45 points with GPT-4o-mini, and by 4.87 and 4.86 points with Qwen2.5-14B, respectively. With GPT-4o-mini, Zero-Mem leads on single-hop, temporal, and open-domain questions while remaining competitive with GAM on multi-hop questions. With Qwen2.5-14B, it ranks first across every question type and metric. The sizable margins over LONG-LLM and RAG, particularly on temporal and open-domain questions, indicate that long-context access or flat similarity retrieval alone is insufficient for state- and boundary-sensitive recall. This consistency across LLM readers and memory requirements demonstrates that Zero-Mem can recover relevant conversational evidence while preserving its relational and temporal context, despite requiring no LLM calls or tokens for memory operations.
HotpotQA.
Table
3
reports the HotpotQA results as the context length increases from 56K to 448K tokens. By progressively adding distracting passages, this benchmark tests whether a method can locate and connect distributed supporting evidence under increasingly long contexts. Zero-Mem achieves the highest F1 across all readers and context lengths, including the challenging 448K-token setting, with an average improvement of 5.52 points over the strongest baseline. Together, the results on LoCoMo and HotpotQA show that Zero-Mem is effective for both long-term conversational memory and long-context multi-hop retrieval, demonstrating the generality of its structured evidence-selection framework under zero-token memory operations.
Efficiency Comparison
Table
2
evaluates whether reducing memory-operation overhead comes at the expense of answer quality. We compare Zero-Mem with GAM, the strongest-performing baseline in the main experiments, as well as SimpleMem and LightMem, two representative efficiency-oriented memory systems. All methods are evaluated using GPT-4o-mini under the same concurrency setting and hardware environment. We report both answer quality and the total and per-query overhead incurred by memory operations outside the shared final-QA stage. Zero-Mem achieves the highest F1 and BLEU-1 scores, improving them by 10.0% and 11.5%, respectively, over GAM, the second-best method on both metrics. Thus, eliminating LLM-based memory operations does not compromise answer quality. In terms of overhead, Zero-Mem invokes no LLM during memory processing and consequently consumes zero LLM input or output tokens, whereas even LightMem, the most token-efficient baseline, consumes more than 0.87 million tokens. Zero-token operation does not imply zero computation, since encoder inference, memory organization, retrieval, and deterministic calibration still incur processing costs. Nevertheless, Zero-Mem requires only 334.77 seconds in total and 0.22 seconds per query, reducing memory-operation latency by 57.6% relative to LightMem, the fastest baseline. This result indicates that the removal of generative memory calls does not shift the cost to a slower non-generative pipeline. Under the unified setting, Zero-Mem outperforms every compared baseline in answer quality while also achieving the lowest memory-operation token and overhead. These demonstrate that its efficiency gains do not come at the expense of answer quality.
Figure 3:
Ablation study on HotpotQA with 56K-token contexts and GPT-4o-mini. The full model outperforms both single-view variants, demonstrating the complementarity of graph-based relational retrieval and hierarchical contextual retrieval. Evidence closure and calibration provide further gains on both F1 and BLEU-1.
Ablation Study
Figure
3
reports ablation results on HotpotQA with 56K-token contexts and GPT-4o-mini. We compare the full model with single-view variants and variants without evidence closure or calibration, while keeping all other settings fixed. The full model achieves 72.07 F1 and 69.66 BLEU-1. Retaining only the graph view reduces the scores to 62.50 and 59.90, whereas retaining only the hierarchical view yields 54.88 and 51.40. The stronger graph-only performance is consistent with HotpotQA’s emphasis on relational and cross-document reasoning. However, both variants remain substantially below the full model, showing that the two structures provide complementary evidence: the graph connects information distributed across documents, while the hierarchy preserves local and multi-granular context needed to interpret those connections. Removing evidence closure results in 67.90 F1 and 65.43 BLEU-1, while removing evidence calibration yields 70.13 and 66.45. The consistent declines support their roles in completing and refining the evidence returned by dual-view retrieval. Overall, the results demonstrate the importance of combining graph and hierarchical retrieval, with evidence closure and evidence calibration providing further support to the retrieved evidence.
Figure 4:
Effect of the retrieval budget on LoCoMo with GPT-4o-mini. Performance improves markedly from top-1 to top-5, reaches its best average at top-10, and remains stable under larger budgets. We use top-5 in the main experiments to match the retrieval setting of all baselines.
Effect of the Retrieval Budget
Figure
4
examines the sensitivity of Zero-Mem to the retrieval budget, defined as the maximum number of primary candidates retained in
M
​
(
q
)
M(q)
before evidence closure. Increasing
T
​
o
​
p
−
K
Top-K
from 1 to 5 substantially improves the average F1 and BLEU-1 scores from 52.59 and 46.79 to 59.15 and 52.96, respectively. Performance reaches its highest overall level at
T
​
o
​
p
−
10
Top-10
, while larger budgets yield only minor fluctuations, indicating diminishing returns from additional evidence. The task-wise results exhibit different saturation points: single-hop questions require relatively few candidates, whereas multi-hop, temporal, and open-domain questions generally benefit from broader evidence coverage. Overall, Zero-Mem remains stable across moderate retrieval budgets. We use
T
​
o
​
p
−
5
Top-5
in the main experiments to match the retrieval setting of all baselines; this configuration trails
T
​
o
​
p
−
10
Top-10
by only 0.65 F1 and 0.83 BLEU-1 while retaining half as many primary candidates.
Conclusion
We introduced Zero-Mem and formalized zero-token memory operations, an operating regime in which every operation outside final question answering invokes no LLM and consumes no LLM input or output tokens. Zero-Mem preserves original interaction traces and retrieves evidence through complementary relational and temporally ordered views without generating intermediate memory representations. Comprehensive experiments demonstrate competitive performance across long-term conversational memory and long-context multi-hop reasoning. Ablations further confirm the complementarity of the two evidence views. With an identical final-QA reader and an equivalent context budget, Zero-Mem eliminates memory-operation token consumption and reduces latency by 57.6% relative to the most time-efficient baseline. These results show that effective agent memory does not require generated intermediate representations and establish provenance-preserving evidence selection as a practical alternative to generative memory pipelines.
References
P. Anokhin, N. Semenov, A. Sorokin, D. Evseev, A. Kravchenko, M. Burtsev, and E. Burnaev (2025)
AriGraph: learning knowledge graph world models with episodic memory for llm agents
.
In
Proceedings of the Thirty-Fourth International Joint Conference on Artificial Intelligence
,
IJCAI ’25
.
External Links:
ISBN 978-1-956792-06-5
,
Link
,
Document
Cited by:
Introduction
.
P. Chhikara, D. Khant, S. Aryan, T. Singh, and D. Yadav (2025)
Mem0: building production-ready ai agents with scalable long-term memory
.
External Links:
2504.19413
,
Link
Cited by:
Related Work
,
Baselines.
.
S. Du, J. Zhao, J. Shi, Z. Xie, X. Jiang, Y. Bai, and L. He (2026)
A survey on the optimization of large language model-based agents
.
ACM Comput. Surv.
58
(
9
).
External Links:
ISSN 0360-0300
,
Link
,
Document
Cited by:
Introduction
.
J. Fang, X. Deng, H. Xu, Z. Jiang, Y. Tang, Z. Xu, S. Deng, Y. Yao, M. Wang, S. Qiao, H. Chen, and N. Zhang (2026)
LightMem: lightweight and efficient memory-augmented generation
.
In
The Fourteenth International Conference on Learning Representations
,
External Links:
Link
Cited by:
Introduction
,
Related Work
,
Baselines.
.
B. J. Gutierrez, Y. Shu, Y. Gu, M. Yasunaga, and Y. Su (2024)
HippoRAG: neurobiologically inspired long-term memory for large language models
.
In
The Thirty-eighth Annual Conference on Neural Information Processing Systems
,
External Links:
Link
Cited by:
Introduction
.
Y. Hu, J. Liu, J. Tan, Y. Zhu, and Z. Dou (2026a)
Memory matters more: event-centric memory as a logic map for agent searching and reasoning
.
External Links:
2601.04726
,
Link
Cited by:
Related Work
,
Baselines.
.
Y. Hu, S. Liu, Y. Yue, G. Zhang, B. Liu, F. Zhu, J. Lin, H. Guo, S. Dou, Z. Xi, S. Jin, J. Tan, Y. Yin, J. Liu, Z. Zhang, Z. Sun, Y. Zhu, H. Sun, B. Peng, Z. Cheng, X. Fan, J. Guo, X. Yu, Z. Zhou, Z. Hu, J. Huo, J. Wang, Y. Niu, Y. Wang, Z. Yin, X. Hu, Y. Liao, Q. Li, K. Wang, W. Zhou, Y. Liu, D. Cheng, Q. Zhang, T. Gui, S. Pan, Y. Zhang, P. Torr, Z. Dou, J. Wen, X. Huang, Y. Jiang, and S. Yan (2026b)
Memory in the age of ai agents
.
External Links:
2512.13564
,
Link
Cited by:
Introduction
.
J. Kang, M. Ji, Z. Zhao, and T. Bai (2025)
Memory OS of AI agent
.
In
Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing
,
C. Christodoulopoulos, T. Chakraborty, C. Rose, and V. Peng (Eds.)
,
Suzhou, China
,
pp. 25961–25970
.
External Links:
Link
,
Document
,
ISBN 979-8-89176-332-6
Cited by:
Related Work
,
Baselines.
.
J. Liu, Y. Su, P. Xia, S. Han, Z. Zheng, C. Xie, M. Ding, and H. Yao (2026)
SimpleMem: efficient lifelong memory for LLM agents
.
In
Forty-third International Conference on Machine Learning
,
External Links:
Link
Cited by:
Introduction
,
Related Work
,
Baselines.
,
Implementation Details.
.
J. Luo, W. Zhang, Y. Yuan, Y. Zhao, J. Yang, Y. Gu, B. Wu, B. Chen, Z. Qiao, Q. Long, R. Tu, X. Luo, W. Ju, Z. Xiao, Y. Wang, M. Xiao, C. Liu, J. Yuan, S. Zhang, Y. Jin, F. Zhang, X. Wu, H. Zhao, D. Tao, P. S. Yu, and M. Zhang (2025)
Large language model agent: a survey on methodology, applications and challenges
.
External Links:
2503.21460
,
Link
Cited by:
Introduction
.
A. Maharana, D. Lee, S. Tulyakov, M. Bansal, F. Barbieri, and Y. Fang (2024)
Evaluating very long-term conversational memory of LLM agents
.
In
Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)
,
L. Ku, A. Martins, and V. Srikumar (Eds.)
,
Bangkok, Thailand
,
pp. 13851–13870
.
External Links:
Link
,
Document
Cited by:
Datasets.
.
J. S. Park, J. O’Brien, C. J. Cai, M. R. Morris, P. Liang, and M. S. Bernstein (2023)
Generative agents: interactive simulacra of human behavior
.
In
Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology
,
UIST ’23
,
New York, NY, USA
.
External Links:
ISBN 9798400701320
,
Link
,
Document
Cited by:
Related Work
.
P. Rasmussen, P. Paliychuk, T. Beauvais, J. Ryan, and D. Chalef (2025)
Zep: a temporal knowledge graph architecture for agent memory
.
External Links:
2501.13956
,
Link
Cited by:
Related Work
.
R. Salama, J. Cai, M. Yuan, A. Currey, M. Sunkara, Y. Zhang, and Y. Benajiba (2025)
MemInsight: autonomous memory augmentation for LLM agents
.
In
Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing
,
C. Christodoulopoulos, T. Chakraborty, C. Rose, and V. Peng (Eds.)
,
Suzhou, China
,
pp. 33136–33152
.
External Links:
Link
,
Document
,
ISBN 979-8-89176-332-6
Cited by:
Introduction
.
T. Schick, J. Dwivedi-Yu, R. Dessi, R. Raileanu, M. Lomeli, E. Hambro, L. Zettlemoyer, N. Cancedda, and T. Scialom (2023)
Toolformer: language models can teach themselves to use tools
.
In
Thirty-seventh Conference on Neural Information Processing Systems
,
External Links:
Link
Cited by:
Related Work
.
N. Shinn, F. Cassano, A. Gopinath, K. Narasimhan, and S. Yao (2023)
Reflexion: language agents with verbal reinforcement learning
.
In
Proceedings of the 37th International Conference on Neural Information Processing Systems
,
NIPS ’23
,
Red Hook, NY, USA
.
Cited by:
Related Work
.
H. Sun, S. Zeng, and B. Zhang (2026)
H-MEM: hierarchical memory for high-efficiency long-term reasoning in LLM agents
.
In
Proceedings of the 19th Conference of the European Chapter of the Association for Computational Linguistics (Volume 1: Long Papers)
,
V. Demberg, K. Inui, and L. Marquez (Eds.)
,
Rabat, Morocco
,
pp. 341–350
.
External Links:
Link
,
Document
,
ISBN 979-8-89176-380-7
Cited by:
Introduction
.
G. Wang, Y. Xie, Y. Jiang, A. Mandlekar, C. Xiao, Y. Zhu, L. Fan, and A. Anandkumar (2024)
Voyager: an open-ended embodied agent with large language models
.
Transactions on Machine Learning Research
.
Note:
External Links:
ISSN 2835-8856
,
Link
Cited by:
Related Work
.
Y. Wu, S. Liang, C. Zhang, Y. Wang, Y. Zhang, H. Guo, R. Tang, and Y. Liu (2025)
From human memory to ai memory: a survey on memory mechanisms in the era of llms
.
External Links:
2504.15965
,
Link
Cited by:
Introduction
.
Z. Xi, Y. Ding, W. Chen, B. Hong, H. Guo, J. Wang, X. Guo, D. Yang, C. Liao, W. He, S. Gao, L. Chen, R. Zheng, Y. Zou, T. Gui, Q. Zhang, X. Qiu, X. Huang, Z. Wu, and Y. Jiang (2025)
AgentGym: evaluating and training large language model-based agents across diverse environments
.
In
Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)
,
W. Che, J. Nabende, E. Shutova, and M. T. Pilehvar (Eds.)
,
Vienna, Austria
,
pp. 27914–27961
.
External Links:
Link
,
Document
,
ISBN 979-8-89176-251-0
Cited by:
Introduction
.
J. Xu, A. Szlam, and J. Weston (2022)
Beyond goldfish memory: long-term open-domain conversation
.
In
Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)
,
S. Muresan, P. Nakov, and A. Villavicencio (Eds.)
,
Dublin, Ireland
,
pp. 5180–5197
.
External Links:
Link
,
Document
Cited by:
Introduction
.
W. Xu, Z. Liang, K. Mei, H. Gao, J. Tan, and Y. Zhang (2025)
A-mem: agentic memory for LLM agents
.
In
The Thirty-ninth Annual Conference on Neural Information Processing Systems
,
External Links:
Link
Cited by:
Related Work
,
Baselines.
.
B. Y. Yan, C. Li, H. Qian, S. Lu, and Z. Liu (2025)
General agentic memory via deep research
.
External Links:
2511.18423
,
Link
Cited by:
Introduction
,
Related Work
,
Datasets.
,
Baselines.
,
Implementation Details.
.
C. Yang, C. Zhou, Y. Xiao, S. Dong, L. Zhuang, Y. Zhang, Z. Wang, Z. Hong, Z. Yuan, Z. Xiang, S. Chen, H. Zhou, Q. Zhang, N. Liu, J. Su, X. Wang, Y. Chang, and X. Huang (2026)
Graph-based agent memory: taxonomy, techniques, and applications
.
External Links:
2602.05665
,
Link
Cited by:
Introduction
.
Z. Yang, P. Qi, S. Zhang, Y. Bengio, W. Cohen, R. Salakhutdinov, and C. D. Manning (2018)
HotpotQA: a dataset for diverse, explainable multi-hop question answering
.
In
Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing
,
E. Riloff, D. Chiang, J. Hockenmaier, and J. Tsujii (Eds.)
,
Brussels, Belgium
,
pp. 2369–2380
.
External Links:
Link
,
Document
Cited by:
Datasets.
.
S. Yao, J. Zhao, D. Yu, N. Du, I. Shafran, K. R. Narasimhan, and Y. Cao (2023)
ReAct: synergizing reasoning and acting in language models
.
In
The Eleventh International Conference on Learning Representations
,
External Links:
Link
Cited by:
Related Work
.
H. Yu, T. Chen, J. Feng, J. Chen, W. Dai, Q. Yu, Y. Zhang, W. Ma, J. Liu, M. Wang, and H. Zhou (2026)
MemAgent: reshaping long-context LLM with multi-conv RL-based memory agent
.
In
The Fourteenth International Conference on Learning Representations
,
External Links:
Link
Cited by:
Datasets.
.
G. Zhang, M. Fu, K. Wang, G. Wan, M. Yu, and S. YAN (2025a)
G-memory: tracing hierarchical memory for multi-agent systems
.
In
The Thirty-ninth Annual Conference on Neural Information Processing Systems
,
External Links:
Link
Cited by:
Introduction
.
Z. Zhang, Q. Dai, X. Bo, C. Ma, R. Li, X. Chen, J. Zhu, Z. Dong, and J. Wen (2025b)
A survey on the memory mechanism of large language model-based agents
.
ACM Trans. Inf. Syst.
43
(
6
).
External Links:
ISSN 1046-8188
,
Link
,
Document
Cited by:
Introduction
.
W. Zhong, L. Guo, Q. Gao, H. Ye, and Y. Wang (2024)
MemoryBank: enhancing large language models with long-term memory
.
In
Proceedings of the Thirty-Eighth AAAI Conference on Artificial Intelligence and Thirty-Sixth Conference on Innovative Applications of Artificial Intelligence and Fourteenth Symposium on Educational Advances in Artificial Intelligence
,
AAAI’24/IAAI’24/EAAI’24
.
External Links:
ISBN 978-1-57735-887-9
,
Link
,
Document
Cited by:
Introduction
.
