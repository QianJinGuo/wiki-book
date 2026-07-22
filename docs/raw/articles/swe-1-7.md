---
source_url: "https://cognition.com/blog/swe-1-7"
source_type: newsletter
title: "SWE-1.7: Frontier Intelligence at a Fraction of the Cost"
tags: ["newsletter", "ai", "model"]
score_vxc: 56
score_value: 7
score_confidence: 8
score_stars: 4
ingested_at: 2026-07-09T18:59:50Z
sha256: 5711cae73091588dad3642bbeeccc710e8a31f0479bd0620ccee5d631cfb53fd
---
---

# SWE-1.7: Frontier Intelligence at a Fraction of the Cost

> Source: [https://cognition.com/blog/swe-1-7](https://cognition.com/blog/swe-1-7)

Markdown Content:
Ben Pan*, Carlo Baronio*, Rohan Choudhury, Eric Lu, Ryan Kim, Deniz Birlikci, TC Qin, Sam Lee, Fermi Ma, Allen Liu, Yang Liu, Sampriti Panda, Jacob Teo, Ray Wang, Gary Chang, Steven Cao, Silas Alberti*equal contribution

07.08.26

Today, we’re launching SWE-1.7, the most capable model we’ve trained so far. It reaches frontier-level intelligence at a much lower cost, advancing the cost-performance Pareto curve.

SWE-1.7 is the result of broad improvements across our RL pipeline: better infrastructure, more stable training, higher-quality data, and new techniques for long-horizon tasks. Since SWE-1.7 was trained from a Kimi K2.7 base, which had already undergone extensive RL post-training, the large additional gains from our own training challenge the idea of a ‘post-training ceiling’ and suggest that RL can push capabilities much further than previously believed.

At Cognition, we have been formulating and refining principles for good agentic software engineering both in evaluation, with FrontierCode[1](http://cognition.com/blog/swe-1-7#ref-1),[2](http://cognition.com/blog/swe-1-7#ref-2), and now in training, with SWE-1.7. Our model is particularly optimized for longer-horizon asynchronous tasks, an important component of high-quality software engineering.

SWE-1.7 is available today in Devin ([Web](https://app.devin.ai/), [Desktop](https://devin.ai/desktop), and [CLI](https://devin.ai/cli)) via Cerebras at 1000 TPS. We encourage you to try it for yourself!

Coding benchmark results Pass rate (%) on agentic coding benchmarks.

| Benchmark | SWE-1.7 | Kimi K2.7 Code | GPT-5.5 | Opus 4.8 | Opus 4.7 | GLM-5.2 | Composer 2.5 | SWE-1.6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FrontierCode 1.1 Main | 42.3% | 30.1% | 43.0% | 46.5% | 38.5% | 24.5% | 25.6% | 9.4% |
| Terminal-Bench 2.1 | 81.5% | 72.7% | 84.2% | 86.9% | 83.0% | 81.0% | 76.0% | 39.7% |
| SWE-Bench Multilingual | 77.8% | 73.5% | 76.8% | 84.4% | 80.5% | 74.5% | 71.6% | 58.3% |

The rest of this post covers how we trained SWE-1.7: the infrastructure, algorithms, and data work behind our model. We cover four important components that stand out.

*   **Preserving entropy and stabilizing training:** Long RL runs face two challenging problems: entropy collapse, and instability due to numerical drift between training and inference. We hunted down and addressed causes of each, which enabled training to keep improving well past where earlier runs stalled.

*   **Multi-cluster training and fault tolerance:** RL doesn’t need all of its inference compute in one cluster. We trained on clusters across three continents, shipped weight updates through object storage, and built fault tolerance so that hardware failures never stalled the run.

*   **Curating high-quality data:** We built an extensive data-quality pipeline that runs each task through automated execution tests, filters out tasks with low learning signal, and hardens tasks to prevent reward-hacking.

*   **Self-compaction for long-horizon tasks:** The model learns to summarize its working state and resume from the summary, extending task horizons past the raw context window. We use an alternating length penalty to incentivize concise output without sacrificing correctness.

Finally, we conclude by sharing some observations on interesting behavioral tendencies, such as careful exploration and concise reasoning, that the model acquired as a result of our training setup.

## [Preserving Entropy and Stabilizing Training](http://cognition.com/blog/swe-1-7#preserving-entropy)

We found training stability to be a key contributor to predictable improvement at scale.

When training with asynchronous RL[3](http://cognition.com/blog/swe-1-7#ref-3), one of the most problematic issues we encountered was the KL divergence mismatch between inference and training[4](http://cognition.com/blog/swe-1-7#ref-4), since the trainer policy is usually different from the sampling policy. In the past, to correct for this (albeit at smaller scale), we used importance-sampling[5](http://cognition.com/blog/swe-1-7#ref-5) and quantization-aware training for low-precision rollouts in NVFP4 + experts routing replay[6](http://cognition.com/blog/swe-1-7#ref-6),[7](http://cognition.com/blog/swe-1-7#ref-7).

Here we present additional interventions that become more important at larger scale.

We find that top-p sampling[8](http://cognition.com/blog/swe-1-7#ref-8) contributes significantly to staving off entropy collapse[9](http://cognition.com/blog/swe-1-7#ref-9),[10](http://cognition.com/blog/swe-1-7#ref-10), where a strong model stops exploring and reward plateaus within a few hundred steps.

Very low probability tokens are often part of trajectories that have gone off track or out of distribution. These trajectories are likely to produce low reward, and properties of the softmax function lead to these tokens sharpening the token probability distribution. Indeed, suppose we have three tokens with logits $x_{1} > x_{2} \gg x_{3}$ and probabilities $p_{i} = \frac{e^{x_{i}}}{e^{x_{1}} + e^{x_{2}} + e^{x_{3}}}$, where token 3 is a low probability token that leads to low reward. If we sample token 3, the gradient of its logprob with respect to the logits $x_{1} , x_{2} , x_{3}$ is:

$$
\nabla log ⁡ p_{3} = \nabla log ⁡ \left[\right. \frac{e^{x_{3}}}{e^{x_{1}} + e^{x_{2}} + e^{x_{3}}} \left]\right. = \left[\right. - p_{1} \\ - p_{2} \\ p_{1} + p_{2} \left]\right.
$$

and the policy gradient update to the logits is $\Delta x_{i} \propto \hat{A} \textrm{ } \nabla log ⁡ p_{3}$, where $\hat{A}$ is the advantage of the sampled token. Since this trajectory earns low reward, $\hat{A} < 0$ and the updates are

$$
\Delta x_{1} \propto \mid \hat{A} \mid \textrm{ } p_{1} , \Delta x_{2} \propto \mid \hat{A} \mid \textrm{ } p_{2} , \Delta x_{3} \propto - \mid \hat{A} \mid \textrm{ } \left(\right. p_{1} + p_{2} \left.\right) .
$$

In these updates, $x_{3}$ is penalized, and $x_{1}$ grows more than $x_{2}$. Sampling $x_{3}$ therefore widens the lead of the already-dominant token, sharpening the distribution and decreasing entropy. Top-$p$ sampling prevents these low probability tokens from being sampled and used as optimization targets in the first place!

Policy entropy across training![Image 1: Line chart of policy entropy across training: the SWE-1.7 recipe holds entropy roughly constant while the baseline decays steadily.](http://cognition.com/images/swe-1-7/policy-entropy.svg)
This entropy-preservation effect makes top-$p$ sampling desirable in our rollouts. But naively implementing top-$p$ clearly increases the training-inference mismatch — the trainer computes probabilities as a selection from all tokens, while rollouts sample from the top-$p$ subset, so the distributions have higher divergence, leading to collapse after a small number of steps. Thus, we implement sampling distribution replay[11](http://cognition.com/blog/swe-1-7#ref-11), where we record a kept-set of tokens available for sampling at rollout time, and renormalize probabilities with those masks in the trainer. With this fix, our run’s entropy stays roughly constant over the course of training and inference-training divergence stays bounded.

Training-inference mismatch across training![Image 2: Line chart of training-inference divergence across training steps: with sampling distribution replay the divergence stays bounded, while the naive top-p implementation diverges.](http://cognition.com/images/swe-1-7/train-infer-mismatch.svg)
Another interesting result of using top-p sampling replay is a targeting of only tokens with $p < \text{top}_\text{p}_\text{threshold}$. Tokens with probability above the threshold have a keepset of size 1, so their renormalized probability distribution is a constant 1, and gradients are zeroed out. We found empirically that a large fraction of the tokens sampled by the model are above standard top-p thresholds, so they are excluded from the overall gradient computation. This reduces gradient noise and lets the optimization algorithm focus on the high-learning signal tokens in the trajectory.

We also find benefits from using the Muon optimizer[12](http://cognition.com/blog/swe-1-7#ref-12) and eliminating non-deterministic operations in the trainer.

## [Multi-cluster Training](http://cognition.com/blog/swe-1-7#multi-cluster)

Cognition is a fast-growing research lab entering an established landscape that is heavily compute-constrained. We aim to train trillion-parameter models, but today, large clusters with 10-100k chips on a single network fabric are a scarce resource. In contrast, smaller clusters around the world are abundant, if used together correctly.

In this setting, the structure of RL works in our favor. RL decomposes naturally across multiple clusters. Only the trainer must live on a single high-bandwidth cluster. The inference engines that generate rollouts are self-contained. They can run anywhere and need nothing but the current weights.

We invested in infrastructure that makes use of this property. Our RL training spans four datacenters across three continents, combining our own GPUs across multiple clusters with additional compute from inference providers like Fireworks. The result is that we can scale RL training far beyond what any single cluster would allow.

SWE-1.7 RL training architecture. A single US trainer cluster streams compressed weight deltas through cloud storage to inference rollout clusters spread across three continents.

The central challenge in this setup is keeping all inference engines up to date with the trainer weights after each optimizer step. We want these weight updates to be fast to reduce staleness of trajectories so we can train with more aggressive learning rates.

Naively broadcasting the full model from one cluster to another would be slow and inefficient. Instead, every K gradient steps, we compute and send a **compressed weight delta** between the current and previous weights, reducing the size of each transfer by over 99%[13](http://cognition.com/blog/swe-1-7#ref-13).

Rather than streaming the weights directly from the trainer to every inference cluster, we use cloud object storage to maintain a single source of truth for weight versions. After the trainer uploads a new weight delta, the inference engines can be updated with almost no inference downtime. Each training run has a weight controller in each involved cluster that manages the run’s weight version lifecycle. The weight controller polls object storage for new manifests, which the trainer writes after each update. When it finds a new delta, it instructs workers to download their shards, which are then replicated across local disks using a tree broadcast. The same object storage also carries routing matrices and top-p masks from the inference engines back to the trainer.

Each inference engine prefetches the delta into CPU memory while continuing to serve trajectories. Only once the delta is fully staged does the engine briefly pause to apply it in-place. Trajectories that are in-flight can simply continue on the new weights with their KV cache intact.

With this approach, cross-continental weight updates for a 1T parameter model complete in 1–2 minutes end-to-end. This happens asynchronously and blocks neither training nor inference beyond 3–4 seconds of inference pause at update.

## [Fault Tolerance](http://cognition.com/blog/swe-1-7#fault-tolerance)

At large scale, hardware failures occur continuously, and globally restarting on each failure makes long runs infeasible. Our architecture handles this differently depending on where the failure occurs — the inference engines or the trainer.

Failures on the inference side are cheap by construction. Engines are self-contained and hold no state beyond the current weights, so a dead engine costs only its in-flight sessions. We use NVIDIA Dynamo to manage the engine lifecycles and route inference: each agent sandbox has its own proxy that records tokens in and out, so if a replica goes down, we don’t lose the full trajectory, and Dynamo reroutes it to a different worker. When Dynamo reschedules the replica on healthy nodes, our weight controller loads the most recent checkpoint from object storage and replays a series of deltas from the checkpointed version.

The trainer is the one place where a failure is expensive: it’s the single tightly-coupled component, where one dead node stalls the whole cluster. To make recovery fast, each node checkpoints asynchronously to local disk every step and replicates its shards to peers, so a dead node’s state is rebuilt from replicas in seconds. If capacity is still missing, the run shrinks by whole data-parallel replicas and regrows once nodes return. Throughout this process, the rollout pipeline remains warm. After the trainer restarts, a buffer policy selects which accumulated rollouts to use and prevents bias from any imbalance in training-inference throughput during the interruption.

## [Intelligent Self-Compaction for Long-Horizon Tasks](http://cognition.com/blog/swe-1-7#self-compaction)

From the start, we built Devin for completing asynchronous, long-running tasks. SWE-1.7 is trained directly in the Devin harness, so naturally we want to train our own model on longer horizon tasks. This introduces two challenges. First, rollouts can extend far beyond the raw context window. Second, as shown by DeepSeek R1[14](http://cognition.com/blog/swe-1-7#ref-14), RL on reasoning tasks tends to produce progressively longer responses, but we want the model to be efficient in its reasoning and only elaborate on difficult tasks.

We address these issues with **training for self-compaction** and an **alternating length penalty**.

*   When an agent approaches the context limit, we ask it to summarize its working state, and we resume it from its self-authored summary. During training, the model simultaneously learns (1) to write more informative, succinct summaries, and (2) to better work from and leverage such summaries. We first introduced a version of this approach in [Kevin](https://cognition.com/blog/kevin-32b)[15](http://cognition.com/blog/swe-1-7#ref-15), where we explored it for kernel optimization tasks. With self-compaction, our rollouts during the SWE-1.7 training run reach up to six hours in duration.

*   Rather than applying a length penalty uniformly throughout training, we use an alternating strategy[16](http://cognition.com/blog/swe-1-7#ref-16). In **unconstrained phases**, the model optimizes only for task success. In **budget phases**, we penalize solutions that exceed a certain budget of our weighted cost function that includes tokens, turns and total time spent in tool calls. With this structure, response length tends to compress on tasks within the model’s ability, while long-horizon behavior on hard tasks is preserved.

Response length under the alternating length penalty![Image 3: Line chart of mean response length across training under the two-phase length penalty. Length grows in unconstrained phases as the model thinks longer on harder tasks and compresses in budget phases on solved tasks.](http://cognition.com/images/swe-1-7/response-length.svg)
## [Data Quality](http://cognition.com/blog/swe-1-7#data-quality)

Data is the core determining factor in what capabilities and skills our model learns. As such, we ensured that the data we trained on was calibrated and sufficiently difficult, and disincentivized undesirable behaviors to keep the model well-aligned. We focused most on the following aspects:

*   **Verifier quality:** A task’s verifier can be wrong in two directions: accepting incorrect solutions (false positives) or rejecting valid ones (false negatives). We [devised extensive quality-assurance pipelines](https://cognition.com/blog/frontier-code) to minimize observations of false positives and false negatives in our training.

*   **Difficulty:** On tasks where the model always solves or always fails, we don’t observe any meaningful learning signal. Instead, we curated training data that the model only solves a low fraction of the time, which generates real learning signal while at the same time pushes model intelligence.

*   **Cheating detection and prevention:** We employed a variety of defenses against different forms of cheating. For instance, we network-restricted our sandboxes and stripped them of git history and reference artifacts. We also isolated the grading path from the agent itself. In addition, we employed programmatic checks to catch known exploit signatures. Finally, to ensure proper incentives, we assigned reward 0 to trajectories with any instance of cheating attempts, regardless of whether they succeeded.

## [Results: Model Behaviors](http://cognition.com/blog/swe-1-7#model-behaviors)

Due to extensive RL, SWE-1.7 exhibits noticeably different behavior from Kimi K2.7 Code, its base model. Firstly, it is significantly more aligned and trustworthy than K2.7 or other frontier open-source models. We expand on this extensively in our companion blog post, _[Measuring the Trustworthiness of Open-Source-Derived Models](https://cognition.com/blog/measuring-open-source-model-trustworthiness)_.

One behavioral difference we noticed in SWE-1.7 is condensed chain-of-thought. Compared to Kimi-K2.7-Code, SWE-1.7’s first chain-of-thought has a much lower function-word ratio (fraction of words that serve as grammatical “glue”) and nearly half the average number of words per sentence. We think this was influenced directly by the budget phases in our alternating length penalty. We’ve included a couple of examples of condensed chain-of-thought in the dropdown below.

The other major behavioral difference we observed is that SWE-1.7 explores the codebase much more thoroughly before acting, as you can see in the number of tool calls, file reads, and searches the model executes.

Behavioral tendencies on FrontierCode 1.1 Main![Image 4: Box plots of behavioral tendencies on FrontierCode 1.1 Main: SWE-1.7 makes substantially more tool calls, file reads, and greps/searches per run than Kimi-K2.7-Code, Opus 4.8, and GPT 5.5.](http://cognition.com/images/swe-1-7/behavioral-tendencies.svg)
This shows up most clearly in bug-fixes. A bug report typically describes one primary symptom, but the underlying issue often affects a larger surface area. SWE-1.7 is much more likely to investigate the root cause of the bug and consider edge cases, hypotheticals, adversarial inputs, and beyond-the-ask requirements than Kimi-K2.7-Code. Through its enhanced codebase exploration, SWE-1.7 also does a much better job understanding the exact design decisions that need to be made. In addition, we’ve observed that SWE-1.7 tends to settle ambiguous semantics by experimenting and probing, for example by writing small Python scripts, rather than guessing.

How often the chain-of-thought probes edge cases and hidden requirements![Image 5: Bar chart on a log scale of how often the chain-of-thought probes edge cases, hypotheticals, adversarial inputs, and beyond-the-ask requirements on FrontierCode 1.1 Main. SWE-1.7 probes more than Kimi-K2.7-Code in every category except hypotheticals.](http://cognition.com/images/swe-1-7/edge-cases.svg)
We believe these behaviors arise directly from the extensive quality-assurance measures we took to strip out false positives and false negatives in our data, forcing our model to come up with more complete, end-to-end solutions. We think that SWE-1.7’s increased due-diligence directly translates to higher performance on various benchmarks. We’ve attached a couple of example trajectories in the dropdown below.

The extra thinking comes at a small cost in increased change scope. As described in FrontierCode[1](http://cognition.com/blog/swe-1-7#ref-1), a good solution modifies only the minimal set of files needed, without touching unrelated code or introducing unnecessary refactors. Since SWE-1.7 reasons more, it also does more: writing additional test cases and touching more files than the task naively requires. We’ve noticed this trend consistently in models across the industry: as reasoning increases, the scope of files that the model touches also expands. This is an axis we’re excited to improve on.

## [Evaluation Methodology](http://cognition.com/blog/swe-1-7#evaluation-methodology)

*   All models are evaluated under their maximum reasoning effort.

*   **Terminal-Bench 2.1**[17](http://cognition.com/blog/swe-1-7#ref-17): we evaluate on our own internal evaluation framework, using Claude Code for Anthropic models, Codex for OpenAI models, and Devin CLI for other models, with timeout=4h.

*   **SWE-Bench Multilingual**[18](http://cognition.com/blog/swe-1-7#ref-18): we use self-reported numbers when available and evaluate on Devin CLI otherwise.

*   **FrontierCode 1.1:** see our blog post[2](http://cognition.com/blog/swe-1-7#ref-2).

## [References](http://cognition.com/blog/swe-1-7#references)

1.   [1]E. Lu, B. Pan, D. Birlikci, S. Lee, R. Wang, R. Choudhury, F. Ma, TC Qin, C. Baronio, and S. Alberti, "Introducing FrontierCode," June 2026. [cognition.com/blog/frontier-code](https://cognition.com/blog/frontier-code)
2.   [2]E. Lu, B. Pan, F. Ma, A. Lombardi, D. Birlikci, S. Lee, R. Wang, R. Choudhury, TC Qin, C. Baronio, J. Teo, J. H. Lee, and S. Alberti, "FrontierCode 1.1," July 7, 2026. [cognition.com/blog/frontier-code-1.1](https://cognition.com/blog/frontier-code-1.1)
3.   [3]A. Piché et al., "PipelineRL: Faster On-policy Reinforcement Learning for Long Sequence Generation," arXiv:2509.19128, 2025.
4.   [4]F. Yao et al., "Your Efficient RL Framework Secretly Brings You Off-Policy RL Training," 2025. [fengyao.notion.site/off-policy-rl](https://fengyao.notion.site/off-policy-rl)
5.   [5]B. Pan, C. Baronio, A. Tam, P. Marsella, M. Jain, D. Chiu, Swyx, and S. Alberti, "Introducing SWE-grep and SWE-grep-mini: RL for Multi-Turn, Fast Context Retrieval," 2025. [cognition.com/blog/swe-grep](https://cognition.com/blog/swe-grep)
6.   [6]"Stabilizing MoE Reinforcement Learning by Aligning Training and Inference Routers" (Rollout Routing Replay, R3), arXiv:2510.11370, 2025.
7.   [7]C. Baronio, B. Pan, S. Lee, E. Lu, S. Cao, R. Choudhury, A. Zweiger, R. Wang, G. Chang, and S. Alberti, "An Early Preview of SWE-1.6 and Research Update," March 2026. [cognition.com/blog/swe-1-6-preview](https://cognition.com/blog/swe-1-6-preview)
8.   [8]A. Holtzman et al., "The Curious Case of Neural Text Degeneration," arXiv:1904.09751, 2019.
9.   [9]G. Cui et al., "The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models," arXiv:2505.22617, 2025. [arxiv.org/abs/2505.22617](https://arxiv.org/abs/2505.22617)
10.   [10]S. Yu et al., "DAPO: An Open-Source LLM Reinforcement Learning System at Scale," arXiv:2503.14476, 2025. [arxiv.org/abs/2503.14476](https://arxiv.org/abs/2503.14476)
11.   [11]DeepSeek-AI, "DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models," arXiv:2512.02556, 2025. [arxiv.org/abs/2512.02556](https://arxiv.org/abs/2512.02556)
12.   [12]K. Jordan et al., "Muon: An optimizer for hidden layers in neural networks," 2024. [kellerjordan.github.io/posts/muon](https://kellerjordan.github.io/posts/muon/) — see also J. Liu et al., "Muon is Scalable for LLM Training," arXiv:2502.16982, 2025.
13.   [13]Fireworks AI, "Frontier RL Is Cheaper Than You Think," 2026. [fireworks.ai/blog/frontier-rl-is-cheaper-than-you-think](https://fireworks.ai/blog/frontier-rl-is-cheaper-than-you-think)
14.   [14]DeepSeek-AI, "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning," arXiv:2501.12948, 2025. [arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948)
15.   [15]C. Baronio, P. Marsella, B. Pan, and S. Alberti, "Kevin-32B: Multi-Turn RL for Writing CUDA Kernels," 2025. [cognition.com/blog/kevin-32b](https://cognition.com/blog/kevin-32b)
16.   [16]Kimi Team, "Kimi K2.5: Visual agentic intelligence," arXiv:2602.02276, Feb. 2026. [arxiv.org/abs/2602.02276](https://arxiv.org/abs/2602.02276)
17.   [17]The Terminal-Bench Team, "Terminal-Bench: A Benchmark for AI Agents in Terminal Environments," 2025. [tbench.ai](https://www.tbench.ai/)
18.   [18]J. Yang et al., "SWE-smith: Scaling Data for Software Engineering Agents," arXiv:2504.21798, 2025. [arxiv.org/abs/2504.21798](https://arxiv.org/abs/2504.21798) (SWE-bench Multilingual: [swebench.com/multilingual](https://swebench.com/multilingual))
