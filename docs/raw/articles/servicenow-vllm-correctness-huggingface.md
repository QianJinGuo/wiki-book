---
title: "servicenow vllm correctness huggingface"
source: newsletter
source_url: https://huggingface.co/blog/ServiceNow-AI/correctness-before-corrections
source_feed: TLDR AI (newsletter)
ingested: 2026-05-08
review_value: 7
review_confidence: 7
review_verdict: strong
stars: 4
sha256: 8b07de2ff5407fd9
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [newsletter, security]
---
[ Hugging Face](/)
  * [ Models ](/models)
  * [ Datasets ](/datasets)
  * [ Spaces ](/spaces)
  * [ Buckets new](/storage)
  * [ Docs ](/docs)
  * [ Enterprise ](/enterprise)
  * [Pricing](/pricing)
  *   * * * *
  * [Log In](/login)
  * [Sign Up](/join)
[ Back to Articles](/blog)
#  vLLM V0 to V1: Correctness Before Corrections in RL 
[Enterprise Article](/blog) Published May 6, 2026
[ Upvote 6 ](/login?next=%2Fblog%2FServiceNow-AI%2Fcorrectness-before-corrections)
  * [](/kalyan-ks "kalyan-ks")
  * [](/sehun "sehun")
  * [](/liuxiaoming1412 "liuxiaoming1412")
  * [](/ExceedZhang "ExceedZhang")
  * [](/rafapi-snow "rafapi-snow")
  * [](/Luxuryoliveoil "Luxuryoliveoil")
  * 
[](/rafapi-snow)
[Rafael Pardinas rafapi-snow Follow ](/rafapi-snow)
[](/ServiceNow-AI "ServiceNow-AI") [ServiceNow-AI](/ServiceNow-AI)
[](/ehsk)
[Ehsan Kamalloo ehsk Follow ](/ehsk)
[](/ServiceNow-AI "ServiceNow-AI") [ServiceNow-AI](/ServiceNow-AI)
  * Migration Objective
  * Failure Modes
  * V1 Backend Fixes
    * Logprob Semantics
    * Runtime Defaults
    * Inflight Weight Updates
  * The Remaining Gap: fp32 lm_head
  * Ablations
  * Why We Fixed Backend Correctness First
[PipelineRL](/blog/ServiceNow-AI/github.com/ServiceNow/PipelineRL/) uses vLLM as the inference engine for rollout generation. The inference engine samples tokens and returns token logprobs; the trainer uses those logprobs to compute policy ratios, KL, clip rate, entropy, and reward. Any discrepancy in how those logprobs are computed can change the training dynamics. This is the train-inference mismatch we needed to eliminate during the vLLM V0 to V1 migration.
**TL;DR.** vLLM V1 matched our vLLM V0 reference after we fixed four things: processed rollout logprobs, V1-specific runtime defaults, the inflight weight-update path, and the fp32 `lm_head` used for the final projection. We fixed the backend behavior before changing the RL objective.
The reference run used vLLM `0.8.5`; the V1 runs used vLLM `0.18.1`. Figure 1 shows the final result. The red run is the initial V1 attempt, and the green run is the final V1 run after the fixes described below.
Figure 1. Trainer-side metrics for the vLLM V0 reference (blue), the initial vLLM V1 attempt (red), and the final vLLM V1 run after our fixes (green), including the fp32 `lm_head`. The final V1 run returns close to the V0 trajectory across clip rate, KL, entropy, and reward.
##  Migration Objective 
vLLM V1 is a substantial rewrite of the V0 engine. Our migration target was therefore deliberately narrow:
  1. verify that V1 returned rollout logprobs in the form the trainer expected
  2. rerun the same workload against the V0 reference
  3. evaluate objective-level changes only after backend parity was restored
The first visible symptoms appeared in:
  * `clamp_log_ratio_new_old_indicator`
  * `kl_new_old`
  * `entropy`
  * `reward`
Those metrics came from a GSPO training run, the objective used for this experiment. The same class of mismatch can surface in PPO, GRPO, or any online RL system that treats rollout-side logprobs as part of the optimization target.
The initial V1 run showed the problem clearly. The trainer-side logprobs and reward moved away from the V0 reference early in training.
Figure 2. Current-policy logprobs computed by the trainer during updates (left) and reward (right). The initial vLLM V1 run (red) separates from the vLLM V0 reference (blue).
The same pattern appears in the trainer metrics. Clip rate is the easiest signal to read in the initial comparison.
Figure 3. Trainer-side metrics for the vLLM V0 reference (blue) and the initial vLLM V1 attempt (red). Clip rate tracks the rollout/trainer policy gap; entropy and reward show how that gap propagates into training.
##  Failure Modes 
We separated the possible causes into three layers:
  1. **Semantic mismatch** : the backend returns logprobs with different meaning relative to what the trainer expects.
  2. **Inference-path mismatch** : the backend uses different runtime defaults for caching, scheduling, or request handling, so the same prompts follow a different execution path.
  3. **Objective mismatch** : the RL objective needs correction for the amount of staleness or backend mismatch that remains.
We initially suspected the third category too early. The useful diagnosis came from treating the first two as backend behavior problems and ruling them out first.
##  V1 Backend Fixes 
###  Logprob Semantics 
The first issue was semantic. vLLM V1 returns logprobs from the raw model outputs by default, before logits post-processing such as temperature scaling, penalties, and top-k/top-p filtering. PipelineRL expected logprobs from the processed distribution used by the sampler.
The required setting was:
  * `logprobs-mode=processed_logprobs`
This removed the obvious mean offset in rollout logprobs. The training curves still showed a gap relative to the known-good reference, so the next issue had to be in the inference path.
The policy-ratio plot shows this directly. Once `processed_logprobs` is on for V1, the mean policy ratio stays centered extremely close to `1.0` across all three runs. That establishes the mean-bias fix. The remaining mismatch shows up in clip rate, KL, entropy, and downstream training behavior.
Figure 4. Per-step deviation of the rollout/trainer policy ratio from 1.0, scaled by 10,000, for the vLLM V0 reference (blue), the initial vLLM V1 run (red), and the corrected vLLM V1 run (green).
###  Runtime Defaults 
The early V1 run mixed the engine version with V1 runtime defaults:
  * prefix caching, left unset in the early run so the vLLM `0.18.1` default applied
  * async scheduling, left unset in the early run so the vLLM `0.18.1` default applied
  * an ad-hoc `disable-cascade-attn` override that was set through launch-time kwarg passthrough and sits outside the parity recipe in committed config
For the parity run, we made these choices explicit:
    vllm_config:
      use_v1: true
      vllm_kwargs:
        logprobs-mode: processed_logprobs
        enable-prefix-caching: false
        async-scheduling: false
Prefix caching deserves a separate note. It is normally a correctness-preserving inference optimization for a fixed model state. In this online RL setup, it was a V1-only difference in cache lifetime and reuse relative to the V0 reference path. The actor was also handling repeated prefixes, concurrent requests, async scheduling, and inflight weight updates.
A prefix-cache hit can reuse state computed before a weight update when the cache policy ignores the weight-update boundary. Disabling prefix caching removed one V1-only degree of freedom from the parity comparison.
###  Inflight Weight Updates 
Weight synchronization also had to match the online-RL update model. One option was to make V1 stricter than V0 by draining requests and clearing caches at every update. That would answer a separate question. We first needed to verify that V1 could match the existing V0 behavior.
What V0 effectively did was closer to:
  * block execution at an engine boundary
  * load the new weights
  * resume without an explicit cached-state invalidation
The nearest V1 analogue was:
    await engine.pause_generation(mode="keep", clear_cache=False)
    await engine_client.collective_rpc_async(
        "receive_weight_update",
        args=(request.model_dump_json(),),
    )
    await engine.resume_generation()
Two details matter:
  * `mode="keep"` matches the old inflight update model more closely than `wait` or `abort`
  * `clear_cache=False` matches the V0 wrapper behavior, which left cached state intact on update
Lag was a useful runtime diagnostic. The initial V1 path carries more persistent lag later in training than the corrected V1 run.
Figure 5. Number of steps the weights in the rollout server are behind the trainer policy, for the vLLM V0 reference (blue), the initial vLLM V1 run (red), and the corrected vLLM V1 run (green).
##  The Remaining Gap: fp32 lm_head 
The V1 backend fixes above removed the obvious migration issues, but final parity still required matching the numerical path used to compute logits. The trainer used an fp32 `lm_head` for the final projection. The rollout backend had to match that behavior.
A closely related issue appears in the [MiniMax-M1 technical report](https://arxiv.org/abs/2506.13585): their RL run showed a training/inference token-probability mismatch that they traced to the LM output head and fixed by computing the head in fp32.
This matters because the RL update consumes token logprobs directly. Small changes in logits can become visible in policy ratios, KL, and clipping. The final projection precision is therefore part of the correctness surface for online RL. The [ScaleRL paper](https://arxiv.org/abs/2510.13786) later includes fp32 logits/head computation as part of its RL recipe and ablates it as a useful design choice for large-scale RL.
With the fp32 `lm_head` path included, reward gives a compact view of the final parity result. In Figure 6, the final V1 run tracks the V0 reference; the initial V1 attempt produces a clearly different reward curve.
Figure 6. Reward for the vLLM V0 reference (blue), the initial vLLM V1 attempt (red), and the final vLLM V1 run with the fp32 `lm_head` path (green). With the fp32 head included, the final V1 run tracks the V0 reference.
##  Ablations 
The negative results are important because they rule out common explanations.
  * **`processed_logprobs` alone**: fixed the semantic logprob bug; the training mismatch remained.
  * **Batch invariance** : the mismatch remained in a separate test, with higher lag, higher clip rate, and NCCL complications.
  * **Treating the first V1 run as a fair baseline** : the first V1 run had multiple V1-only defaults enabled, so it was a confounded migration comparison.
##  Why We Fixed Backend Correctness First 
Objective-side corrections such as truncated importance sampling, importance-ratio reweighting, and related methods are useful tools. If rollouts are intentionally stale, generated asynchronously, or produced by a backend where equivalence to the trainer-side policy is unavailable, then some form of correction is often the right thing to add.
The first problem here was inference correctness. After moving to V1, the rollout backend returned logprobs and runtime behavior that broke the trainer assumption. Adding an objective-side correction at that point would have mixed two questions:
  * is the inference backend producing the right logprobs?
  * given correct logprobs, does the objective still need an off-policy or async correction?
Those questions need to be separated. Otherwise an objective-side correction can compensate for broken inference-backend behavior, which makes the training curve harder to interpret.
The current objective can still improve. After inference parity is restored, the next improvement is the usual async/off-policy cleanup:
  * keep explicit behavior-policy logprobs from rollout time
  * recompute trainer-side old-policy logprobs at optimization time
  * separate backend mismatch correction from the policy-update ratio
  * track diagnostics like ESS for the correction term alongside aggregate trainer metrics
The main lesson from this migration is narrower: fix backend correctness first, then add corrections for the mismatch that remains.
More from this author
## [A New Framework for Evaluating Voice Agents (EVA)
  *   * 
92 March 24, 2026 ](/blog/ServiceNow-AI/eva)
## [Introducing SyGra Studio
  *   * 
26 February 5, 2026 ](/blog/ServiceNow-AI/sygra-studio)
### Community
EditPreview
Upload images, audio, and videos by dragging in the text input, pasting, or clicking here.
Tap or paste here to upload images
Comment
· [Sign up](/join?next=%2Fblog%2FServiceNow-AI%2Fcorrectness-before-corrections) or [log in](/login?next=%2Fblog%2FServiceNow-AI%2Fcorrectness-before-corrections) to comment
[ Upvote 6 ](/login?next=%2Fblog%2FServiceNow-AI%2Fcorrectness-before-corrections)
  * [](/kalyan-ks "kalyan-ks")
  * [](/sehun "sehun")
  * [](/liuxiaoming1412 "liuxiaoming1412")
  * [](/ExceedZhang "ExceedZhang")
  * [](/rafapi-snow "rafapi-snow")
  * [](/Luxuryoliveoil "Luxuryoliveoil")
  * 
System theme
Company
[TOS](/terms-of-service) [Privacy](/privacy) [About](/huggingface) [Careers](https://apply.workable.com/huggingface/) [](/)
Website
[Models](/models) [Datasets](/datasets) [Spaces](/spaces) [Pricing](/pricing) [Docs](/docs)