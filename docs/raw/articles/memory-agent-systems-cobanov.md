---
title: "memory agent systems cobanov"
source: newsletter
source_url: https://memory.cobanov.dev/
source_feed: TLDR AI (newsletter)
ingested: 2026-05-08
review_value: 7
review_confidence: 7
review_verdict: strong
stars: 4
sha256: 1f9bea2eb2209ab8
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---
[](https://github.com/cobanov "GitHub")[](https://x.com/mertcobanov "Twitter")
# How AI agent memory works.
Language models forget the moment they finish replying. Memory is everything the system around them does to make that not matter. This essay walks through the ideas one at a time, with something to touch in every section.
Contents
  1. 01What is memory?
  2. 02The context window
  3. 03Short vs long-term
  4. 04Vector embeddings
  5. 05Types of memory
  6. 06The RAG loop
  7. 07Retrieval pipeline
  8. 08Architectures
  9. 09Multi-agent memory
  10. 10Production
  11. 11Build your own
Theme
01The premise
## What "memory" actually means for an agent.
A language model on its own is stateless. You feed it a prompt, you get back a continuation, and the moment the response is finished the model forgets you ever existed. There is no “previous conversation” living inside the weights.
An _agent_ , by contrast, is the orchestration around the model: a loop that decides what context to pass in _next_. Memory is the part of that loop that carries information forward. Everything in this essay is a different answer to the same question, what should we put in the prompt this time?
Stateless LLM call
Each call sees only its own prompt.
historyout
empty
LLM
user msg
response
turn 1
Every turn starts from nothing.
Agent with memory
Each call sees prompt + carried context.
ctx[]out
LLM
user msg
response
turn 1
Each turn appends to ctx[]. The bank grows.
Demo
### Try it yourself
Memory on
Send three messages. Toggle memory to see the same conversation replayed with, and without, the prior turns in context.
Send a message to begin.
Send
Turn 0 / 3Restart conversation
> “A frustrating agent forgets everything. A dangerous one remembers wrong.”
02The simplest memory
## The context window is a moving sidewalk.
Before we discuss anything fancy, let's acknowledge the simplest kind of memory there is: just keep stuffing the whole transcript back into the prompt every turn. As long as everything fits, the model has perfect recall.
The catch is the ceiling. Every model has a fixed context window. Once your conversation outgrows it, you have to drop something. The naive policy is FIFO: drop the oldest turn first. Watch what happens when you keep typing.
Context window
0 / 120 tokens
Send Fill it up
FIFO is the simplest possible policy. It's also the worst when the dropped turn happens to contain the user's name. Real systems do better, summarization, retrieval, hierarchical paging. We'll get to those.
> “Context is not a database. No query plan, no index, no access control, no TTL, no conflict resolution.”
03Two stores, one agent
## Working memory thinks. Long-term memory remembers.
At any given moment your agent is juggling two very different things. On one side: the live conversation, recent turns, pending tool calls, whatever the model is actively reasoning over. On the other: everything it has ever decided was worth keeping.
The handoff between them is where most of the interesting design happens. What gets encoded? When? At what granularity? Drag a message across the divide, or tap `encode →` on a desktop without drag support, to commit it to long-term memory.
### Working memory
Live, mutable, in-prompt
  * userI work at Refik Anadol Studio.encode →
  * agentCool, generative art, right?encode →
  * userI love Berserk and read it every year.encode →
  * userCan you find a coffee shop nearby?encode →
  * userI live in Highland Park.encode →
### Long-term memory
Embedded, persistent, retrieved on demand
Drop a message here, or click `encode →`. The text gets compressed into a vector embedding.
Reset this demo
In a real system the agent decides this for itself, usually by prompting another model with a question like “is this turn worth remembering?”. Self-editing memory architectures push further, letting the agent _edit_ its own long-term store on the fly. Section 7 compares those approaches side by side.
Lifecycle, not storage
### When writes _conflict_.
Memory is a lifecycle problem: write, age, supersede, redact, forget. Watch the same input handled three different ways.
Incoming utterance
User lives in Istanbul. User is moving to Berlin next month. User's credit card number is 1234-5678-9012-3456.
Naive appendNaive overwriteGoverned
Resulting long-term memoryaudit-friendly · time-aware
  * User lives in Berlin.
valid from next month · supersedes prior city
active
  * User used to live in Istanbul.
valid until next month · marked superseded, kept for temporal reasoning
superseded
  * [REDACTED, payment instrument]
PII filter caught credit-card pattern
redacted
Naive append leaks PII and produces contradictions. Naive overwrite loses temporal context, the agent can't answer “where did the user used to live?”. Governance preserves history explicitly, marks the old fact _superseded_ , and redacts the sensitive token before it ever enters the store.
04Semantic search
## Embeddings turn meaning into geometry.
An embedding is a vector, a list of numbers, produced by running text through a neural network trained for one purpose: put similar meanings near each other. Real embeddings usually live in hundreds to thousands of dimensions; OpenAI's current text embeddings default to 1,536 or 3,072 dimensions. Visualizing those is impossible, so this toy demo projects to two.
The plot below contains a fictional user's memories, clustered by topic. Type a question. The query gets embedded the same way and placed on the plot. The closest points, measured by cosine similarity , are what the agent would retrieve.
Query
top-k
12345678
what does the user like to read?where does the user live?what does the user do for work?what are the user's hobbies?what programming languages?
dim_0 →↑ dim_1User likes Berserk and re…User reads One Piece mang…User watches anime in the…query
Retrieved (top-3)ranked by cosine similarity
  * 1User watches anime in the evenings.
0.999
  * 2User likes Berserk and reads it every year.
0.996
  * 3User reads One Piece manga weekly.
0.992
preference
fact
skill
event
Query
The 2-D layout here is a deliberate cartoon. Real embedding models place these vectors in spaces with thousands of dimensions, where many independent “axes of meaning” can coexist without crowding each other. Cosine similarity, though, works the same way regardless of dimension, which is why the trick scales.
05A taxonomy
## Four memories, one agent.
Cognitive science has been carving up “memory” for a century. Modern agent frameworks borrow the same vocabulary because the distinctions are actually useful: each kind has a different shape, a different write rule, and a different retrieval strategy.
Click each card to see a toy version of how that store works.
### Episodic
What happened, when.
### Semantic
Facts and relations.
### Procedural
Learned skills & tools.
### Working
The current scratchpad.
### Episodic memory
Time-stamped events. · e.g. On Tuesday the user asked about Berserk.
Episodic memory keeps a time-ordered log of past interactions. Each entry has a `when`. Retrieval is most often by _recency_ , “what did we just talk about?” - but you can also query by date range or topic.
-7d-5d-3d-2d-1dnow
Tap a dot to read its label.
Hover an event on the timeline.
How it works
After a turn ends, a short summary plus its embedding gets written to a vector DB. On the next message, the message's embedding is searched against past entries and the top 3-5 most relevant ones are pulled back into the prompt.
What it’s for
So “remember that project I mentioned last week?” actually works. ChatGPT's memory feature is the simplest version of this, persistent recall across sessions without re-explaining yourself every time.
All four together
A visitor walks up to the museum agent and says:
“Tell me more about that Refik piece you mentioned earlier.”
  1. 01
Episodic · vector search finds the prior chat where the Refik piece came up
  2. 02
Semantic · RAG pulls that piece's full description from the catalogue
  3. 03
Procedural · an artwork_detail tool fires for any live data the catalogue lacks
  4. 04
Working · system prompt + retrieved facts + tool result + the new message all sit in the active context, and the LLM answers from there
One turn, four stores. The agent _remembers_ (episodic), _knows_ (semantic), _can do_ (procedural), and _follows_ the live thread (working) without the user noticing any of the seams.
06The full pipeline
## Step through a retrieval loop.
Everything from the previous sections clicks together here. RAG is the loop most production agents run on every turn: receive the user's message, encode it, find similar memories, splice them into the prompt, generate, and, only when the user introduced something new, decide what is worth remembering.
  1. 01
User query
A fresh user message arrives. It carries both a question and a new fact about the user.
  2. 02
Embed query
  3. 03
Vector search
  4. 04
Retrieve top-k
  5. 05
Compose prompt
  6. 06
LLM answers
  7. 07
Govern new info
  8. 08
Update memory
  9. Reset
user message
I just hiked Echo Mountain this morning. Any other trails like that around Highland Park?
Prompt being sent to the LLM25t
    [user]
    I just hiked Echo Mountain this morning. Any other trails like that around Highland Park?
Each stage in the loop is a place where you can spend engineering budget. Better embeddings, smarter retrieval, prompt compression, stricter governance, they're all the same pipeline, just with more care taken at one step.
Two production tricks
HyDEReciprocal Rank Fusion
### Hypothetical Document Embeddings
A question and its answer are different shapes. Embedding the _question_ directly often misses documents that contain the _answer_.
HyDE asks the LLM to produce a hypothetical answer first, embeds _that_ , then searches. The fake answer doesn't need to be correct, just shaped like the retrieval target.
trace
user“Where does the user usually go on weekends?”
llm“The user goes hiking in the canyons on weekends.”
embed[0.07, -0.55] ← embeds the answer
search→ User goes hiking in the canyons on Saturdays.
07The read path
## Retrieval is a pipeline, not a lookup.
Production retrieval is a small pipeline running on every turn: decide if you even need memory, rewrite the query, run several retrievers in parallel, merge their rankings, rerank, apply permission and temporal filters, then pack what survives into the prompt. Skipping any one of these stages is usually how things break.
need?→
rewrite→
dense→
sparse→
graph→
fuse→
rerank→
filter→
pack
Need detection
### Should we hit the memory store at all?
Calling retrieval is not free. If the model can answer cold, skip it.
Where do I usually go on weekends?What did we decide about Postgres last sprint?What is a Bloom filter?Translate hello to Japanese.Like before, recommend something based on my taste.
retrieve
asks for continuity across sessions
If retrieval _is_ warranted, you almost never want to pick a single retriever. Dense embeddings are great for paraphrase and intent; lexical (BM25) wins on exact IDs and rare tokens; a knowledge graph contributes structural answers. Run all three and fuse the rankings with RRF.
Hybrid pipeline
### Three retrievers, one fused list.
Dense (embeddings)
  1. 1.m5
  2. 2.m1
  3. 3.m6
  4. 4.m4
  5. 5.m7
Sparse (BM25)
  1. 1.m5
  2. 2.m3
  3. 3.m6
  4. 4.m8
  5. 5.m1
Graph walk
  1. 1.m1
  2. 2.m2
After fusion (RRF)
memory| dense| sparse| graph| score  
---|---|---|---|---  
User lives in Highland Park, LA.| 2| 5| 1| 0.0479  
User goes hiking in the canyons on Saturdays.| 1| 1| -| 0.0328  
User prefers concise answers with code.| 3| 3| -| 0.0317  
User works at Refik Anadol Studio.| -| 2| -| 0.0161  
User used to live in Istanbul.| -| -| 2| 0.0161  
User likes Berserk and reads it yearly.| 4| -| -| 0.0156  
Filters
permission scopetemporal validity
Packed into promptformat: facts + provenance
    [memory · top-3]
      1. [current, score 0.048] User lives in Highland Park, LA.
      2. [current, score 0.033] User goes hiking in the canyons on Saturdays.
      3. [current, score 0.032] User prefers concise answers with code.
Same query, different stages, same outcome rarely. The interesting bugs are downstream: a retriever that's technically correct produces a memory that's outdated, or scoped wrong, or fine on its own but contradicts another retrieved row. Filters and rerank exist for those cases.
08Tradeoffs
## Six architectures, six tradeoffs.
Most production agents end up combining several of these, a vector store for semantic recall, a graph for structured facts, a governance layer that handles supersession and PII. The matrix below separates what the architecture gives you directly from what needs a metadata or policy layer.
Architecture| Scale| Structure| Supersedes| PII gate| Sharing| Audit  
---|---|---|---|---|---|---  
Simple buffer| | | | | |   
Rolling summary| | | | | |   
Vector store| | | | | |   
Knowledge graph| | | | | |   
Hierarchical (MemGPT)| | | | | |   
Self-editing (Letta)| | | | | |   
native fit needs metadata / policy not inherent
### Vector store
Embed every memory; retrieve top-k by similarity.
The default for RAG-shaped agents. Everything you saw in §4 and §6.
Pros
  * Effectively unbounded capacity
  * Semantic recall, not just keyword
  * Mature tooling
Cons
  * Retrieval quality depends on the embedding model
  * No notion of relations or time without extra metadata
  * Easy to poison if writes are unguarded
Seen inPinecone, Weaviate, pgvector · Most modern LLM apps
Architecture
vector space
> “Memory governance is what separates a one-off demo from a production agent.”
09When agents share
## Multi-agent memory is a graph, not a store.
A single agent only has to answer “what do _I_ remember?”. As soon as you have a team, the question becomes: _which_ agent remembers _which_ fact, on _whose_ behalf, and who else can read it. Memory turns into a graph of stores with scopes, permissions, and propagation rules.
Memory topology
organization · runbooks · policySHAREDproject memorydecisions · architectureResearcherprivateCoderprivateReviewerprivatePlannerprivateprivate = defaultshared = explicit write
Tap or hover an agent to see its access path.
The default should be the opposite of the easy thing: **private memory by default, shared memory explicit.** A research note the Researcher agent jots down for itself does not need to land in the project channel. Cross-scope writes should be a deliberate act, with a policy attached.
Permission lab
### Will this write be allowed?
Pick an agent, what they want to write, and where it would land. The policy table from the talk decides.
Agent role
ResearcherCoderReviewerPlannerSupport
Content kind
research notecode patternreview lessonuser preferenceorg policycustomer episode
Target scope
Private (this agent)ProjectUser profileOrganizationGlobal app
ALLOW
researcher_agent.write("research note", scope=project)
private memory default; explicit write to Project
The interesting failure modes aren't “the agent forgot” anymore. They're things like _the wrong agent remembered the wrong thing on someone else 's behalf_. Six patterns show up over and over:
Failure modes
### Six ways shared memory hurts.
Cross-user leakageOver-sharingPoison propagationConflicting decisionsStale playbookAttribution loss
What goes wrong
Researcher agent stored 'user prefers vegan recipes' in project memory. Next session, a different user gets vegan suggestions out of nowhere.
Prevention
tenant_id + user_id filters on every read. Default deny across tenants.
Frameworks like AutoGen, CrewAI, and LangGraph each give you the plumbing, checkpoints, persistence, message-passing primitives. None of them decide your governance for you. Scope, policy, ingestion, and evaluation are still yours.
> “In multi-agent memory, sharing buys collaboration, and grows the attack surface.”
10Shipping it
## In production, memory is a system.
Adding memory to a real product is not “install a vector DB.” You need an API surface, separate read and write paths, background extractors, multi-tenant isolation, latency budgets, observability, and a plan for the day you change your embedding model. The list is long because production is long.
Work in progress module
This section is an active draft. The architecture diagram and latency sliders are teaching sketches with toy defaults; they are not a complete or production-validated implementation guide yet.
Reference architecture
Read pathWrite path
Click any component to see its role.
User / app
↓→
Auth + scope
↓→
Agent runtime
↓→
Memory service
Dense searchBM25Graph walk
↓→
Fuse + rerank
↓→
Pack context
↓→
LLM
Two services, sharply separated: the agent runtime on the request path, and the memory service as a side-quest. Background workers do the slow, expensive work - extraction, summarization, re-embedding, decay, without blocking the user.
Multi-tenancy
### Three ways to isolate.
Namespace per tenantSingle collection + payload filterTiered hybrid
Pros
  * +Cost-efficient at the long tail.
  * +Strict isolation where it matters most.
  * +Lets you sell isolation as a product tier.
Cons
  * −Two operational paths to maintain.
  * −Migration between tiers is non-trivial.
  * −Requires a routing layer in the API.
Best fit
Most production systems with mixed tenant sizes.
Small tenants share a collection; enterprise tenants get dedicated.
The other axis is time. Memory retrieval runs on eligible turns, so every millisecond on that path shows up in p95. The interesting optimizations aren't the obvious ones, they're things like skipping retrieval entirely on queries that don't need it, caching the top-N facts per user in a KV, and running the dense, sparse and graph retrievers in parallel rather than sequentially.
Latency budget
### Where the p95 goes.
Drag the sliders. The bar fills with each stage's contribution. Target is 800 ms, anything past that is felt.
↓ target
Query rewriteDense searchBM25Graph walkRerankerPack + send
Query rewrite80 ms
Dense search60 ms
BM2530 ms
Graph walk50 ms
Reranker250 ms
Pack + send25 ms
Total p95 retrieval latency495 ms/ 800 ms
Storage tiers
### Hot, warm, cold.
Not every memory needs to be a vector lookup. A KV cache for the top facts pays for itself in latency and tokens.
Hot
Active user / project facts. KV or in-memory cache.
read
    every turn
storage
    Redis / SQL row
Warm
Recent episodes, preferences. Vector + full-text index.
read
    need-based
storage
    Qdrant / pgvector
Cold
Raw event log, archived sessions. Object storage.
read
    backfill / audit
storage
    S3 / append-only log
Memory API
The minimum surface area you can ship and still call it a memory system. Everything else (consolidation, supersession, analytics) is built on top of these three.
POST/memory/events
Append raw events. The write queue handles dedup and indexing asynchronously.
POST/memory/search
Hybrid retrieval with scope, time, and top_k. Server enforces filters from the JWT.
DELETE/memory/{id}
Forget. Propagates to derived indexes. Deletion lineage is its own audit event.
None of this is exotic, it's the same architecture you'd build for any retrieval product. The lesson is just that agent memory _is_ a retrieval product, not a feature flag. Treat it like one and the rest follows.
11Capstone
## Build your own agent memory.
Work in progress — more features coming
Everything in this essay collapses into a small set of knobs. Choose a backend, set the limits, flip on the techniques you trust. Send a message and watch each stage of the pipeline fire, retrieval, generation, governance, write.
Configuration
Storage
Memory backend
BufferVectorHierarchicalSelf-editing
Embed everything, retrieve top-k by cosine similarity.
Limits
Context window
80t160t260t380t500t
Retrieval k
123456
Techniques
HyDE retrieval
Reciprocal Rank Fusion
Governance gate
Pipeline\- stages that fire on Send
user msg→HyDE rewriteoff→embed→top-3→RRF fuseoff→generate→govern→write
Conversation clear
Send a message to begin. Try one of the suggestions below.
Send 
Where do I usually go on weekends?What do I read?I just moved from Highland Park to Echo Park.My card is 4111 1111 1111 1111.What programming languages do I use?
Memory inspector
Working memory0 / 220t
empty
Last retrieval
no retrievals yet
Long-term store20 active
  * AUser likes Berserk and reads it every year.
  * AUser is a fan of Studio Ghibli films.
  * AUser reads One Piece manga weekly.
  * AUser watches anime in the evenings.
  * AUser works at Refik Anadol Studio.
  * AUser is an engineer working on generative art.
  * AUser collaborates with designers in the studio.
  * AUser builds tools for AI-driven art installations.
  * AUser lives in Highland Park, Los Angeles.
  * AUser's home city used to be Istanbul.
  * AUser loves walking around their city on weekends.
  * AUser loves espresso and dark roast coffee.
  * AUser cooks pizza from scratch on Sundays.
  * AUser prefers sushi over most other food.
  * AUser plays guitar and writes ambient music.
  * AUser goes hiking in the canyons on Saturdays.
  * AUser picked up running this spring.
  * AUser uses Python for ML and data work.
  * AUser is exploring RAG and vector memory for agents.
  * AUser has been reading about LLM context window limits.
Backend: vector. Embeddings are 2-D mocks; the architecture choices feed real behavior.
Try this: send the same question with the governance gate _off_ , then turn it on and send a contradicting fact. The inspector will show old entries marked supersededinstead of being overwritten, and the credit-card pattern never makes it past the gate.
Sources / further reading
  * [OpenAI GPT-4o model docs](https://developers.openai.com/api/docs/models/gpt-4o)
  * [Claude context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
  * [OpenAI embeddings guide](https://developers.openai.com/api/docs/guides/embeddings)
  * [HyDE paper](https://arxiv.org/abs/2212.10496)
  * [RRF paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
  * [Elasticsearch RRF docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)
  * [MemGPT paper](https://arxiv.org/abs/2310.08560)
  * [Letta stateful agents](https://docs.letta.com/guides/core-concepts/stateful-agents)
  * [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
  * [CrewAI memory](https://docs.crewai.com/en/concepts/memory)
  * [ChatGPT memory notes](https://openai.com/index/memory-and-new-controls-for-chatgpt/)
Built by Mert Cobanov. Corrections, update requests, and technical notes are welcome.
[GitHub](https://github.com/cobanov)[Twitter](https://x.com/mertcobanov)[Email](/cdn-cgi/l/email-protection#c9a4acbbbdaaa6aba8a7a6bf89aea4a8a0a5e7aaa6a4)
An interactive essay on agent memory.  
· Toy embeddings; no API calls.
Reset all demos