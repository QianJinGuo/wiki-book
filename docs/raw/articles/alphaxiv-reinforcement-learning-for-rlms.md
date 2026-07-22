---
source: newsletter
source_url: https://www.alphaxiv.org/blog/reinforcement-learning-for-rlms
tags: [rlm, reinforcement-learning, language-models, alphaxiv]
url: https://www.alphaxiv.org/blog/reinforcement-learning-for-rlms
title: "Reinforcing Recursive Language Models | alphaXiv"
sha256: 86063279acf33d3c538444e0a70e8f1e55d0ae57da8be57202a3525d923e5918
date: 2026-05-13
type: raw
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 5
---
Markdown Content:
_We RL fine-tune small (4B) models to behave as native recursive language models (RLMs) by training parent and child RLMs under a single, shared policy. With RL, small models can learn task-specific, RLM behavior that cannot be elicited through prompting or even SFT. This blog assumes a basic level of familiarity with RLMs. A great resource for learning about them is the [original RLM blog post](https://alexzhang13.github.io/blog/2025/rlm/)._
Contents
We investigate RL fine-tuning 4B models to be used as RLMs in production settings. While RLMs are a powerful inference strategy, they can have unpredictable latency and can require extensive prompt tuning to elicit consistent behavior. RL fine-tuning allows us to train purpose-built RLMs that are cheap to deploy.
Rather than training separate policy models for parent and child RLMs, we train one model to play both roles of a parent decomposer and child sub-agent. We use a simple RL training setup where rollouts from children RLMs inherit the advantages of rollouts of the parent RLMs that spawned them, which allows us to train a single policy. This eliminates the need for additional reward signals for individual child RLM trajectories.
On an evidence selection task over several scientific documents, we show that an RL fine-tuned 4B model performs just as well as Claude Sonnet 4.6 with an identical RLM harness and REPL environment, all while being a fraction of the size and cost.
[Our code](https://github.com/NovaSky-AI/SkyRL/pull/1596), which includes training scripts, our implementation of the RLM scaffold, and our evidence selection environment, is available on [SkyRL](https://github.com/NovaSky-AI/SkyRL).
RLMs spawn language models (LMs) inside a programmatic environment that stores long user prompts (context), which are traditionally fed directly into the context window of an LM. In this environment, the context is an external object that the LM can inspect through programmatic operations and decompose by recursively calling itself with the ultimate goal of answering some user query about the context.
Like the original RLM paper, we use a Python Read-Eval-Print-Loop (REPL) as our environment. Rather than treating code execution as just another tool, RLMs in a REPL make code the primary interface through which the model inspects and transforms data. Every turn, the model writes code it wants to execute, the REPL executes the code, and the RLM orchestrator returns the results of the executed code (primarily `print()` statements) as a user message back to the model for the next turn.
![Image 1: Overview of how a Recursive Language Model (RLM) works: the parent decomposes a task into sub-queries dispatched to child RLMs, each running in its own REPL environment](https://www.alphaxiv.org/assets/rlm-overview-Bir1v2Vm.png)
RLMs interact with their context inside of a Python REPL environment. They can recursively call themselves to decompose large prompts. Figure from [[1]](https://www.alphaxiv.org/abs/2512.24601).
The REPL exposes a set of built-in functions to the model:
*   **`FINAL(answer)`** / **`FINAL_VAR(variable_name)`** — Marks the end of the rollout: `FINAL(...)` returns the literal string as the final answer, while `FINAL_VAR(...)` looks up an existing REPL variable by name and returns its value.
*   **`rlm_query(prompt, context=None)`** — Spawns a single child RLM rollout with the given prompt (and optional context override), running a fresh agent loop under the same policy, and returns the child's final answer string back into the parent's REPL.
*   **`rlm_query_batched(prompts, context_list=None)`** — Same as `rlm_query` but dispatches multiple children in parallel (one per prompt, paired with the corresponding context) and returns a list of their final answers in order.
The ability to interact with context programmatically and spawn sub-RLMs or sub-LMs makes RLMs a very powerful inference strategy for tackling long context problems.
For this blog, we'll focus on the task of evidence selection from scientific documents. Given a question and a set of arXiv papers, the objective is to return snippets from the papers that answer the question. The context that is stored in the REPL for this task is the full text of all of the papers in the set for a given question.
![Image 2: Example evidence selection from a paper](https://www.alphaxiv.org/assets/selection-BxkRZFwY.png)
The golden snippets we would like the RLM to return for the question: “What baselines are used for this paper?”
step 1 · search the paper1hits = search("baseline")
step 2 · look at a slice2hits[:3]
 ↳ [(p.4, "...CodeAct (+ BM25)..."), (p.6, "...applying this strategy..."), (p.7, "...vs. ReAct baseline...")]
step 3 · save a span3ev = []
   ev.append(extract_section(hits[1]))
step 4 · sanity-check the variable4len(ev), ev[0][:48]
 ↳ (1, "We compare CodeAct (+ BM25) against...")
step 5 · mark the answer5FINAL_VAR(ev)
Each turn, the model emits a snippet of code; the REPL executes it and shows the result. The prompt and any intermediate state (`paper`, `hits`, `ev`) live in the REPL, not in the model's context window.
In the single paper case, consider the following question about the original RLM paper: _What baselines are used for this paper?_ A simple strategy that the RLM can use is to call a keyword search function with the term "baseline" over the context, analyze the matches, and return the most relevant snippets.
When extending this to multiple papers, it's clear the task can be decomposed and parallelized with sub-RLMs. An obvious approach is to have the root RLM identify which papers are worth further exploring and spawn sub-RLMs to extract snippets from individual papers. One point worth highlighting here is that the benefits of RLMs extend beyond just long-context tasks. This particular task doesn't have an incredibly long context to begin with (experimenting with several hundred papers is something we want to try), but it is highly parallelizable. Not only does embracing the parallelizable nature of the task improve wall-clock time, but it actually also improves task performance. Several works show that sequential reasoning throws LLMs into the "prefix" trap, which is where the model ends up exploring whatever it first explores.
parent · REPL depth 0 RLM
# ctx: {paper_id → full_text}
ids = list(ctx.keys())
titles = [ctx[id].title for id in ids]
relevant = triage(titles, q)   ↳ [0, 2, 5]
# dispatch a child RLM per paper
evidence = [rlm(ctx[ids[i]], q) for i in relevant]
paper+sub-question
child rlm · paper [0]depth 1 RLM
**q:** "methods & baselines used?"
own REPL ev = []
hits = search("baseline")
ev.append(extract_section(hits[1]))
ev.append(extract_section(hits[2]))
**FINAL_VAR**(ev)
**returns** 2 spans · 412 tok
···
child rlm · paper [5]depth 1 RLM
**q:** "methods & baselines used?"
own REPL ev = []
hits = search("baseline")
ev.append(extract_section(hits[0]))
ev.append(extract_section(hits[3]))
**FINAL_VAR**(ev)
**returns** 2 spans · 503 tok
verbatim spans
parent · aggregate depth 0 RLM
evidence = [[…2 spans…], […1 span…], […2 spans…]]
flattened_evidence = flatten(evidence)
FINAL_VAR(flattened_evidence)   ↳ 5 spans · 1 113 tok
dispatch (paper + question)
return (verbatim spans)
The parent RLM triages titles, then calls `rlm(paper, q)` on each promising paper. Each child is also an RLM: it gets its own REPL with the assigned paper as a variable, runs `search` / `extract_section` turns, and returns verbatim spans. The parent flattens the children's results. One policy plays both roles and child rollouts inherit the parent's advantage at training time.
An important distinction here from other tasks that RLMs have typically been evaluated on is that the root RLM spawns true sub-RLMs that have access to a REPL environment. For other datasets like OOLONG, RLMs have only been trained to make sub-LM calls to an external, frozen model.
To abstract away certain basic operations, we initialize REPL environments with four predefined functions:
*   `list_papers(ctx)` Iterates through every paper in the context dict and prints each paper's ID, title, and abstract. Returns the list of titles.
*   `search(text, keyword, window=300, bidirectional=True)` Case-insensitive keyword search that returns sentence-aligned snippets around each hit. If `text` is a dict it searches every paper and groups results by paper ID, otherwise it searches a single string.
*   `extract_section(snippet, start_phrase, end_phrase)` Pulls out the substring of `snippet` that begins at `start_phrase` and ends at `end_phrase` (inclusive, case-insensitive). If either phrase isn't found it falls back to the start of the snippet or runs to the end.
*   `get_paper_abstract(ctx, paper_id)` Looks up one paper in the context dict and returns a formatted "Paper ID / Title / Abstract" string, used to tag child prompts so the worker knows which paper it's processing.
These predefined functions are analogous to tool calls in traditional multi-turn, ReAct agent loops.
We generate scientific queries and supporting evidence synthetically. We start by selecting a random paper on alphaXiv and then retrieve up to 9 semantically similar papers to form a group, with preference given to high-upvoted papers. From there, an OCR model breaks each paper from the group into paragraphs and we have a frontier model generate questions and select the relevant paragraphs from a subset of papers for that question. Not every paper in the group has paragraphs relevant to the question. The OCR model is used only to build clean ground-truth evidence. At test time, the model sees noisy text from a PDF-parsing library, mimicking production settings where running OCR on every new document is unwieldy and expensive. In all, we synthetically generate 1000 queries over groups of up to 10 papers, with up to three queries per group.
sample row
input papers (7)
ResNet 1512.03385 VGG 1409.1556 DenseNet 1608.06993 SENet 1707.02921 PReLU-net 1502.01852 ViT-22B 2511.14329 Pre-act ResNet 1603.05027
question
What are the reported ImageNet top-5 validation error rates for the ensemble models of VGG, the PReLU-enhanced Model C, and the original ResNet?
ground-truth evidence
1409.1556 · VGG
“VGG (7 nets) — 24.7 / 7.5 / 7.3; VGG (1 net) — 25.9 / 8.0 / –”
1512.03385 · ResNet
“Our 152-layer ResNet has a single-model top-5 validation error of 4.49%. …We combine six models of different depth to form an ensemble. This leads to 3.57% top-5 error on the test set. This entry won the 1st place in ILSVRC 2015.”
A single row from the dataset. The RLM receives all 7 papers as context and must identify which ones contain evidence for the question. The full text from each of the input papers is generated from a PDF parsing library and included in the dataset to be passed in as context to the root RLM. Highlighted papers are the ground-truth supporting papers.
Another point to make clear is that RAG is a poor fit for this task. The model needs to dynamically return verbatim spans of varying length and count, not a fixed-size top-k. RAG and RLMs aren't mutually exclusive though, indexed chunks could be exposed as just another REPL tool alongside search and extract_section.
The original RLM paper SFTs Qwen3-8B with RLM-like reasoning trajectories from Qwen3-Coder-480B-A35B-Instruct. The purpose of SFT is to teach the model how to navigate a REPL environment, including RLM-specific syntax for submitting an answer and making sub-LM calls. However, SFT was not used to train RLMs for a specific task or dataset.
For reasoning models and traditional agent harnesses, RL has proven to be a robust way to improve the capabilities of a model for a specific task without the catastrophic forgetting that accompanies pure SFT-based approaches. How can we extend this to RLMs?
### [](https://www.alphaxiv.org/blog/reinforcement-learning-for-rlms#rlm-no-sub-calls "Jump to section")RLM (no sub-calls)
Before considering the recursive element of RLMs, we want to first confirm we can RL fine-tune Qwen3.5-4B on the single-paper variant of our evidence selection task, which doesn't involve spawning child RLMs. There are a couple of takeaways from these initial runs that are worth sharing.
**Task Strategy.** The specific task strategy has to be in the prompt. This includes descriptions of predefined functions to guide the RLM and expedite rollout generation. For the single-paper task, the strategy is searching the paper with multiple keyword variants using `search`, expanding the most promising snippets with refined `search` calls, and then submitting final answers with `extract_section`, all across 5-7 turns. Without an explicit strategy, even a frontier model like Sonnet 4.6 will take 90 seconds to generate a rollout compared to 30 seconds when given a strategy.
**Cold-start SFT.** While this may not be needed with larger models, the RLM harness is tricky enough that even with a good prompt and predefined tools, Qwen3.5-4B will have 0 pass@16 scores. RLM-based tasks are outside the edge of competence for most small models.
When training without an SFT phase, we observed many of the same failure modes observed in the original RLM paper, which include using the wrong syntax to submit final answers and excessive reasoning and tool calls that would bloat the model's context window across turns.
For the SFT phase itself, we use the same methodology from . We generated teacher RLM rollouts with Qwen3.5-397B-A17B on the same evidence selection task and filtered out rollouts that either contained REPL errors or scored zero F1 on character-span overlap between retrieved evidence snippets and gold evidence snippets. Our SFT dataset was a small, held-out portion of the RL dataset of a few dozen examples. In initial runs, we found that doing SFT on traces produced over the entire RL training dataset (even though it isn't a large dataset) led to entropy collapse and subsequent instability .
SFT full training set, 4 epochs
SFT full training set
SFT small holdout
policy KL
avg raw reward (EMA)
Policy KL divergence (left) and average raw reward (right) across SFT cold-start variants when training on the multi-paper evidence selection task. SFT on the full training set causes large KL spikes and reward collapse, while SFT on a small held-out subset stays stable and trains effectively.
**Stepwise Training.** Another nuance of the RLM scaffold is that successive turns do not share prefixes. The user prompt is not part of the persistent chat history and is instead appended before each turn. The point of this is to ensure the original user query is not buried deep into the context window of the model and that the RLM is reminded of its task.
typical chat RL
one sequence per trajectory
sys
user q
<think>
a₁
o₁
<think>
a₂
o₂
<think>
a₃
stepwise · rlm
n separate sequences
1
sys
user q
<think>
a₁
2
sys
a₁
o₁
user q
<think>
a₂
3
sys
a₁
o₁
a₂
o₂
user q
<think>
a₃
Each turn is rebuilt fresh as `sys + repl history + user q + new action`. The user prompt sits after the REPL history (it's re-appended every turn, not pinned at the front), and only the new action contributes gradient. One trajectory yields n short log-prob arrays, all sharing the final advantage A.
Because the per-turn user prompt is rewritten rather than accumulated, you cannot use a rollout as a single training example. Each turn has to be a separate training sample, so a rollout of N turns produces N samples. For advantage calculation, only rollouts corresponding to the last step of trajectories are included in the GRPO group, and the advantage is broadcast to rollouts from previous turns. See more about step-wise RL training [here](https://github.com/NovaSky-AI/SkyRL/issues/1278).
**LLM Judges.** We use rubric-based LLM judges for reward assignment. We initially tried verifiable rewards like F1 of selected snippets, but this proved to be very noisy. Questions like "Which method scores the best on X baseline?" could be answered with several selections of text, some of which weren't included in our labels. We experienced a similar issue in our [previous work on retrieval agents](https://www.alphaxiv.org/blog/training-retrieval-agents-for-arxiv-search). To circumvent this, we used rubric-based LLM judges that were provided with the original query, the ground truth text, and the predicted text. Rubric-based judges have been shown to be more robust to reward hacking . A great overview of rubric-based rewards by Cameron Wolfe can be found [here](https://cameronrwolfe.substack.com/p/rubric-rl).
With these considerations, RL fine-tuning yields significant improvements on the single-paper task, with eval judge scores jumping from around 0.6 to 0.8 with Qwen3.5-4B.
raw reward
5-step moving avg
Claude Sonnet 4.6 (0.80)
Eval reward over 95 training steps for a Qwen-3.5-4B agent on the single-paper evidence-selection task. The model climbs from ~0.46 to ~0.80, matching the Claude Sonnet 4.6 baseline (dashed).
Note that because we RL on top of an SFT model, training begins at 0.6 reward rather than zero, demonstrating the importance of a cold-start SFT phase.
### [](https://www.alphaxiv.org/blog/reinforcement-learning-for-rlms#rlm-with-sub-calls "Jump to section")RLM (with sub-calls)
Now let's consider the multi-paper case, which requires a true RLM with recursive sub-calls. We want the root RLM to identify which papers are worth dispatching child RLMs to, and child RLMs should extract the relevant passages from their assigned paper.
It might be tempting to train separate policies for root and children RLMs. However, this would require two sets of reward signals and an unwieldy training pipeline to train two policies. Alternatively, we can use a frozen model for sub-calls and only train a model for the root RLM, which is the approach taken by the original RLM paper. However, given that an SFT 4B model is unable to perform the child task successfully, some form of on-policy training is necessary. We devise a training objective and an RL training setup that can generalize across different RLM tasks and enables a single policy to effectively learn both root and child RLM roles.
**Put simply.** Advantages are computed for root RLM rollouts using standard GRPO. Each child rollout inherits the advantage of its parent root, and child contributions to the loss are averaged (divided by $k_{g}$, the number of children in that rollout) so no single root is overweighted for spawning more sub-calls.
**Or more formally.** For each query $x$ in the batch, sample a group of $G$ root rollouts:
$\left{\right. y_{g} \left.\right}_{\left(\right. g = 1 \left.\right)}^{G} sim \pi_{\theta_{\text{old}}} \left(\right. \cdot \mid x \left.\right)$
Each root RLM rollout $y_{g}$ deterministically induces a set of child prompts $\phi \left(\right. y_{g} \left.\right) = \left{\right. x_{g , i} \left.\right}_{i = 1}^{k_{g}}$ via its `rlm_query` or `rlm_query_batched` calls, and children are sampled from the same policy:
$y_{g , i} sim \pi_{\theta_{\text{old}}} \left(\right. \cdot \mid x_{g , i} \left.\right) , i = 1 , \ldots , k_{g}$
**Advantage Calculation.** Only root RLM rollouts receive a verifiable reward $r_{g} = R \left(\right. x , y_{g} \left.\right)$. Group-relative advantages are computed over the $G$ root rollouts:
$A_{g} = \frac{r_{g} - \text{mean} \textrm{ }⁣ \left(\right. \left{\right. r_{g^{'}} \left.\right}_{g^{'} = 1}^{G} \left.\right)}{\text{std} \textrm{ }⁣ \left(\right. \left{\right. r_{g^{'}} \left.\right}_{g^{'} = 1}^{G} \left.\right)}$
**Advantage Inheritance.** For simplicity, we have every child of $y_{g}$ inherit $y_{g}$'s advantage.
$A_{g , i} : = A_{g} \text{for}\textrm{ }\text{all}\textrm{ } i = 1 , \ldots , k_{g}$
**GRPO Objective.** Let
$\rho_{\theta} \left(\right. y \mid x \left.\right) = \frac{\pi_{\theta} \left(\right. y \mid x \left.\right)}{\pi_{\theta_{\text{old}}} \left(\right. y \mid x \left.\right)}$
denote the per-token importance ratio (token index suppressed for clarity).
The GRPO objective extended over the RLM tree is:
$\mathcal{J} \left(\right. \theta \left.\right) = \mathbb{E}_{x , \left{\right. y_{g} \left.\right} , \left{\right. y_{g , i} \left.\right}} \left[\right. \frac{1}{G} \sum_{g = 1}^{G} \left(\right. \underset{\text{root}\textrm{ }\text{rollout}}{\underbrace{\mathcal{L}_{g}^{\text{root}} \left(\right. \theta \left.\right)}} + \frac{1}{k_{g}} \sum_{i = 1}^{k_{g}} \underset{\text{child}\textrm{ }\text{rollouts}}{\underbrace{\mathcal{L}_{g , i}^{\text{child}} \left(\right. \theta \left.\right)}} \left.\right) \left]\right. - \beta \textrm{ } \mathbb{D}_{\text{KL}} \left[\right. \pi_{\theta} \parallel \pi_{\text{ref}} \left]\right.$
where each per-rollout clipped surrogate is
$\mathcal{L}_{g}^{\text{root}} \left(\right. \theta \left.\right) = \frac{1}{\mid y_{g} \mid} \sum_{t = 1}^{\mid y_{g} \mid} min ⁡ \left(\right. \rho_{\theta} \left(\right. y_{g}^{\left(\right. t \left.\right)} \left.\right) A_{g} , \textrm{ }\textrm{ } \text{clip} \left(\right. \rho_{\theta} \left(\right. y_{g}^{\left(\right. t \left.\right)} \left.\right) , 1 - \epsilon , 1 + \epsilon \left.\right) A_{g} \left.\right)$
$\mathcal{L}_{g , i}^{\text{child}} \left(\right. \theta \left.\right) = \frac{1}{\mid y_{g , i} \mid} \sum_{t = 1}^{\mid y_{g , i} \mid} min ⁡ \left(\right. \rho_{\theta} \left(\right. y_{g , i}^{\left(\right. t \left.\right)} \left.\right) A_{g , i} , \textrm{ }\textrm{ } \text{clip} \left(\right. \rho_{\theta} \left(\right. y_{g , i}^{\left(\right. t \left.\right)} \left.\right) , 1 - \epsilon , 1 + \epsilon \left.\right) A_{g , i} \left.\right)$
Note that we add a normalization term $\frac{1}{k_{g}}$ when summing the loss contributions of the child RLM rollouts. This is to ensure that the contribution across all depths of the RLM is balanced. Without normalization, child rollouts dominate the gradient update when $k_{g} \gg 1$.
While the training objective above assumes a max RLM depth of 1, this objective can be expanded to any RLM depth with a nice recursive structure. For a given RLM trajectory $y$, the recursive subtree loss is:
$\mathcal{L}_{\text{subtree}} \left(\right. y , A \left.\right) = \mathcal{L}_{\text{node}} \left(\right. y , A \left.\right) + \frac{1}{k_{y}} \sum_{i = 1}^{k_{y}} \mathcal{L}_{\text{subtree}} \left(\right. y_{i} , A \left.\right)$
where $\left{\right. x_{i} \left.\right}_{i = 1}^{k_{y}}$ is the set of child RLM prompts dispatched by $y$, $A$ is the advantage assigned to $y$, and each child RLM rollout is sampled by $y_{i} sim \pi_{\theta_{\text{old}}} \left(\right. \cdot \mid x_{i} \left.\right)$.
The rationale behind having children inherit their parent trajectory's final advantage is the same rationale behind assigning every token the same sequence-level advantage in GRPO, even though different tokens make different contributions to the sequence-level advantage. This is an unbiased estimator of the true gradient that, with sufficient training steps, yields stable results.
Alternatively, if the child RLM rollouts are highly repetitive, you can randomly sample one to contribute to the gradient instead of averaging across all $k_{g}$. While this approach can speed up training, it can also be very noisy.
$j sim \text{Uniform} \left(\right. 1 , \ldots , k_{g} \left.\right)$
$\mathcal{J} \left(\right. \theta \left.\right) = \mathbb{E}_{x , \left{\right. y_{g} \left.\right} , \left{\right. y_{g , i} \left.\right}} \left[\right. \frac{1}{G} \sum_{g = 1}^{G} \left(\right. \underset{\text{root}\textrm{ }\text{rollout}}{\underbrace{\mathcal{L}_{g}^{\text{root}} \left(\right. \theta \left.\right)}} + \underset{\text{sampled}\textrm{ }\text{child}}{\underbrace{\mathcal{L}_{g , j}^{\text{child}} \left(\right. \theta \left.\right)}} \left.\right) \left]\right. - \beta \textrm{ } \mathbb{D}_{\text{KL}} \left[\right. \pi_{\theta} \parallel \pi_{\text{ref}} \left]\right.$
For the final multi-paper RLM training runs, we train on an SFT Qwen3.5-4B model. Training is done on a single 8xH200 node with a batch size of 16 and 8 samples per prompt. With up to 4 child RLMs per parent, generation can hit 512 concurrent rollouts, which initially surfaced race conditions around REPL timeouts for child RLMs. After fixing these, we observe a consistent and stable reward curve.
raw reward
5-step moving avg
Claude Sonnet 4.6 (0.65)
Eval reward over training steps for a Qwen-3.5-4B agent on the multi-paper recursive evidence-selection task. The model climbs from ~0.30 to ~0.60, approaching the Claude Sonnet 4.6 baseline (dashed, 0.65).
Through RL post-training the 4B model, the average rubric score jumps from 0.3 to 0.6 on the training dataset. On the eval dataset, the fine-tuned RLM stacks up well against other frontier models using the same RLM scaffold.
Average rubric eval score on the multi-paper evidence-selection task. The RL fine-tuned Qwen3.5-4B outperforms both GPT-5.4-mini and Gemini-3-Flash under the same RLM harness.
While short of Sonnet's 0.607 average rubric score, the wall-clock time of an RLM query from our model is 7 seconds on a single node, whereas Sonnet-based RLMs take over 60 seconds.
As mentioned in the step-wise section above, during RL fine-tuning we maintain the same scaffold as the original RLM paper, where the user query is moved to the end of the conversation history across turns. This means different turns do not share the same prefix. Additionally, we maintain lengthy prompts that describe the strategy in detail. While this was necessary to get good results for models out-of-the-box that were not trained to behave as RLMs, it should ideally not be required if we are RL fine-tuning. As an ablation, we try training with a significantly reduced prompt (200 tokens instead of 1500 tokens), keeping the user query right after the system prompt.
full prompt (1500 tokens)
simplified prompt (200 tokens)
Avg raw reward (EMA) when training the multi-paper RLM with a significantly reduced system prompt
Training with this setup converges slightly below the original run and is generally more unstable (this can likely be fixed with simple curriculum learning, though that is outside the scope of this blog). This experiment gives us a sense of why RLM training is useful beyond optimizing specific tasks. Today's models need elaborate strategy prompts because none of them natively understand the RLM role. The long-term goal is an RLM where the prompts can simply describe the sub-calls and high-level task.
**Task Exploration.** We've chosen this particular task selfishly for our own production needs. Beyond evidence selection, there's a whole world of tasks worth exploring with RLM training. If RLMs are indeed next in the line of popular inference scaling techniques that have previously included CoT and ReAct, the training story will matter. Taking CoT as an example, even though researchers found improvements when prompting to induce better CoT reasoning , it was RL fine-tuning that ultimately worked best . We will be curious to see what the "A-ha!" moment will look like when RL fine-tuning RLMs at scale.
**Reward Assignment.** We have chosen to have children RLM rollouts inherit the advantage of their parents. While this is an effective estimator, more fine-grained credit assignment can lead to faster convergence. For our given evidence selection task, we could score root RLM rollouts by the F1 score of the papers they select to dispatch child RLMs to and score child RLMs with LM judges based on the snippets they select. While reward assignment depends heavily on the specific task, we would like to do more experiments with multi-tiered reward calculations across the RLM tree.
**Strategy Discovery & Scale.** One limitation that we've assumed about RLMs in this blog post is that they need an explicit task strategy detailed in the system prompt. For various datasets and tasks, RLMs are typically deployed with environment-specific tips that explain how the RLM should decompose its context and formulate its answer.[[10]](https://www.primeintellect.ai/blog/rlm)
However, explicitly providing a strategy may be a hindrance when training larger, more capable RLM-native models. Traditional reasoning models for math or coding are trained without supplementing them with tips and strategies, so why should we include them with RLMs? The big unlock with RLMs will be when they themselves discover new strategies that humans would have not come up with for decomposing and solving truly difficult, long-context problems. Scaling RLMs to model sizes where strategy discovery, not execution, is the main task of training will be the next big milestone for RLMs.
You can find the [training configs](https://github.com/NovaSky-AI/SkyRL/blob/main/examples/train/rlm/run_multi_paper_rlm.sh) we used in the official [SkyRL repo](https://github.com/NovaSky-AI/SkyRL). We've added an [RLM environment](https://github.com/NovaSky-AI/SkyRL/blob/main/skyrl-gym/skyrl_gym/envs/rlm/env.py) and encourage you to play around with it and try it on other tasks. Most training was done with an 8xH200 node.
We'd like to thank [Sumanth Hegde](https://sumanthrh.com/) and [Charlie Ruan](https://www.charlieruan.com/) from the SkyRL team for their responsiveness in resolving issues and for providing an amazing RL library for the community. We'd also like to thank [Alex Zhang](https://alexzhang13.github.io/) for his work on the original RLM paper as well as for providing feedback throughout this project!
1.   [1][Recursive Language Models](https://www.alphaxiv.org/abs/2512.24601) — Zhang et al.
2.   [2][Native Parallel Reasoner: Reasoning in Parallelism via Self-Distilled Reinforcement Learning](https://www.alphaxiv.org/abs/2512.07461) — Wu et al.
3.   [3][On the Interplay of Pre-Training, Mid-Training, and RL on Reasoning Language Models](https://www.alphaxiv.org/abs/2512.07783) — Zhang et al.
4.   [4][Scalpel vs. Hammer: GRPO Amplifies Existing Capabilities, SFT Replaces Them](https://www.alphaxiv.org/abs/2507.10616) — Rajani et al.
5.   [5][Learning While Staying Curious: Entropy-Preserving Supervised Fine-Tuning via Adaptive Self-Distillation for Large Reasoning Models](https://www.alphaxiv.org/abs/2602.02244) — Wang et al.
6.   [6][Curing Miracle Steps in LLM Mathematical Reasoning with Rubric Rewards](https://www.alphaxiv.org/abs/2510.07774) — Yuan et al.
7.   [7][Rubrics as Rewards: Reinforcement Learning Beyond Verifiable Domains](https://www.alphaxiv.org/abs/2507.17746) — Gunjal et al.
8.   [8][Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://www.alphaxiv.org/abs/2201.11903) — Wei et al.
9.   [9][DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://www.alphaxiv.org/abs/2501.12948) — DeepSeek-AI et al.
10.   [10][Recursive Language Models: the paradigm of 2026](https://www.primeintellect.ai/blog/rlm) — Prime Intellect