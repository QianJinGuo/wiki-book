---
source_url: "https://liquid.ai/blog/antidoom"
source_type: newsletter
title: "Reducing Doom Loops with Final Token Preference Optimization"
tags: ["newsletter", "ai", "model"]
score_vxc: 64
score_value: 8
score_confidence: 8
score_stars: 4
ingested_at: 2026-07-09T18:59:40Z
sha256: 64e1867e64b2da0d4032eefcbcdb3237de9b8024c671604072ad449a2e50f7fe
---
---

# Reducing Doom Loops with Final Token Preference Optimization

> Source: [https://liquid.ai/blog/antidoom](https://liquid.ai/blog/antidoom)

Published Time: 2026-07-07

Markdown Content:
Repetitive degeneration [1] is a common failure mode during inference: the model emits a span (often something like "Wait, let me reconsider…"), then repeats the same span again and again, until the context window is exhausted. We call this phenomenon the 'doom loop'. Small reasoning models are more prone to this behavior, especially on long thinking traces and hard problems [2].

The commonly applied inference-time fix is to apply `repetition_penalty` to reweight the output distribution. However, this is a band-aid solution and can degrade performance. Reinforcement learning can target repetitive looping, but it typically requires carefully calibrated rewards and costly online rollouts.

Our method takes a more targeted approach. We identify the exact token that begins a loop, train the model to prefer coherent alternatives at that single position, and leave the rest of the distribution largely untouched. The method adapts Antislop [3], training on chosen/rejected pairs that represent a single completion token, using Final Token Preference Optimization (FTPO). We call our approach “Antidoom”.

On an early checkpoint of LFM2.5-2.6B, 10.2% of completions on hard math and coding prompts produced repetitive loops. After Antidoom training, that rate fell to 1.4%, with eval scores improving across the board as a direct result of reduced looping.

## Anatomy of a doom loop

Doom loops can arise in inference from three mechanisms working together:

**Mechanism 1: Overtrained tokens + Uncertainty**

Some tokens in the vocabulary are more likely to be selected in general. Well-known examples in the wild include "delve" and "testament". This may occur if synthetic data is used in the model's training set, creating higher distributions of these words than would ordinarily occur in human writing. In reasoning models, high-prior continuations often include discourse markers and self-reflection tokens such as “Wait” or “Alternatively.” These tokens are not necessarily bad and can mark a useful change of strategy, a verification step, or a branch in the reasoning trace. However, when the model is uncertain or stuck, they can become attractive fallback continuations, restarting the same local reasoning pattern instead of helping the model make progress.

For an early checkpoint of LFM2.5-2.6B, the most common tokens to begin a doom loop were:

```
count    share  token
   2277  11.39%  ' the'
    902   4.51%  ' So'
    644   3.22%  'Alternatively'
    511   2.56%  'Wait'
    493   2.46%  ' But'
```

When the model is uncertain, these overtrained tokens dominate the next-token distribution, which appears to be why looping shows up most often inside reasoning traces for hard math and coding problems.[](https://arxiv.org/abs/2504.01100)Prior work [5,6] gives a similar account of degeneration: likelihood-trained models can overassign probability to repeats and frequent words, and reasoning models can loop under low-temperature decoding when they fail to identify a useful next step and instead fall back to repetition.

**Mechanism 2: Prior context reinforces the loop**

Earlier sequences make those same sequences more likely later. With each repetition, the probability of every token in the looping span climbs toward 1.

Duan et al. [7] study this looping in their work on circular reasoning. They link it to a "V-shaped" attention pattern and find that semantic repetition (the model getting stuck on an idea) precedes textual repetition (the same words showing up in the output).

**Mechanism 3: Greedy sampling**

Reasoning models are typically run at low temperature so that traces stay stable and reproducible. At temperature 0, the most likely token is always selected, and a locally reinforced loop has no exit. Higher temperatures help in theory, but once mechanism 2 has pushed the loop token's probability close to 1, there is almost no probability assigned to the remaining vocab, so sampling can still get stuck in loops at higher temperatures (our results show significant looping even at temp=0.67). The lower the temperature, the more looping is exacerbated.

## Locating the failure

To build a targeted training set, we generate completions on a prompt mix designed to elicit looping ([LiquidAI/antidoom-mix-v1.0](https://huggingface.co/datasets/LiquidAI/antidoom-mix-v1.0)) at low temperature, then mine the failures.

A loop is detected in a sample if a section repeats at least four times, over at least 60 characters. In practice, these constraints help avoid false positives and false negatives. Once the looping sequence is identified, we target the **first token of the first repeat.**

At that position, we take the base model's top-k log-prob alternatives, filter out short or non-alphanumeric noise, and keep up to 20 plausible substitutes as **chosen** tokens. Each training row is comprised of a [prompt prefix, one rejected token, one or more chosen tokens] tuple. We then regularise the rejected and chosen distributions before training: a small set of culprits (_Wait_, _So_, _the_) would otherwise dominate, and over-suppressing them degrades reasoning.

## Final Token Preference Optimization

Final Token Preference Optimization (FTPO) is a preference-optimization algorithm similar to Direct Preference Optimization (DPO) [4]. A training sample consists of a prompt, a chosen continuation, and a rejected continuation [3]. It is designed from the ground up to make targeted changes to just a few tokens in the distribution, with minimal disturbance to the model otherwise.

FTPO differs from DPO in the following ways:

1.   **Final token training:** Only trains the trailing token of a sequence that is midway through generation.
2.   **Multiple chosen completion tokens per sample:** This spreads out the probability to a group of alternative tokens, so we aren't just replacing one overtrained token with another.
3.   **A KL-like loss component implemented in logit space:** Avoids gradient pressure on unrelated tokens by omitting softmax and instead computes divergence from reference in logits.
4.   **Two-part regularization:** The logits we intend to train (the chosen and rejected tokens) are allowed to move more freely with respect to the reference, while the remaining vocab is more tightly constrained. This affords better learnability while keeping close to the reference.

In our Antidoom implementation, the model is typically trained for one epoch with LoRA. We find high LoRA ranks (rank=128-256) to produce the best results: higher learnability with less degradation. We train on all attention and MLP projections, as well as `lm_head`, with discovered optimal learning rates around 4e-6 to 2e-5.

Over-training can happen easily. We trigger early stopping conditioned on `chosen_win` (proportion of samples where chosen tokens are winning vs rejected). Stopping at `chosen_win=0.35` typically reduced doom-loop rates from 20-30% down to 1-2% with minimal degradation. Training longer tended to degrade the model, often creating new doom-looping issues.

For our early LFM2.5-2.6B checkpoint, the training set generation takes approximately one hour on 8x MI325 GPUs, and subsequent training takes approximately one to two hours on 1x MI325 GPU. The training set generation time is determined by the model’s doom loop rate, as it stops after collecting 20k pairs.

## Results

To measure the doom-looping rate, we generate responses to a varied mix of reasoning-heavy prompts and count samples that exhibit degenerate repetition.

After training, the doom-looping rate on our early LFM2.5-2.6B checkpoint dropped from 10.2% to 1.4%. Eval scores improved across the board, attributable entirely to the reduction in looping. The training set teaches the model nothing new about math or code; it removes the failure mode that was preventing the model from reaching answers it could already produce.

We also train Qwen3.5-4B on the Antidoom pipeline, known to produce repetitive loops during reasoning. Its doom-looping rate dropped from 22.9% to 1% under greedy sampling, with eval scores increasing markedly.

**LFM2.5-2.6B Early Checkpoint:**

For the baseline checkpoint (LFM2.5-2.6B-early-ckpt), the eval score changes inversely with the doom-loop rate as temperature increases. It may be inferred that doom-looping is directly reducing benchmark scores, since after antidoom training, scores are substantially higher.

A secondary effect is revealed after antidoom training: the checkpoint sees a drop in performance at `temp=1.0`. This is expected: it is generally understood that higher-temperature sampling can harm performance, as the model is more likely to select less-preferred tokens. There has been a prevailing wisdom that higher temperatures may be preferable for reasoning models, allowing them to explore the solution space. However, this intuition may be misplaced, being conflated with the dominant effect of doom-looping. Once doom loops are eliminated, stronger eval performance is seen with near-greedy sampling, at least in the models tested here.

**Qwen3.5-4B:**

Qwen-3.5-4B shows an even greater performance uplift after antidoom training. The pattern is the same as LFM2.5-2.6B, with the largest benefit at low sampling temperatures, and an exposed pattern of performance degradation nearing `temp=1` after looping is no longer a factor.

In practice, we've found it can be helpful to apply multiple rounds of Antidoom. After the first round, the doom-looping rate drops because the loop-causing tokens are rejected and the probability is reweighted toward the chosen alternatives at that position. However, this can expose new failure points, where other tokens now trigger loops elsewhere in the distribution. Applying an additional round of Antidoom targets these newly surfaced loops, further reducing the doom-looping rate.

## Conclusion

Antidoom repairs degenerate repetitive behavior commonly seen after training, especially with thinking models. It selectively targets the problematic tokens that begin loops, with minimal collateral damage to the remaining distribution. Results so far demonstrate near-complete elimination of repetitive loops in internal Liquid LFM checkpoints, and also on Qwen3.5-4B.

The repository README contains guidance on using the training pipeline and selecting appropriate hyperparameters.

The code (generation, detection, FTPO trainer) is available at[](https://github.com/Liquid4All/antidoom)[github.com/Liquid4All/antidoom](http://github.com/Liquid4All/antidoom).

## Acknowledgements

Written by Sam Paech, with contributions from Maxime Labonne, Justin Li, Leonie Monigatti, Nathan Ranchin, Tim Seyde, and Sergei Tilga.

## Citation

For citations, please use the following reference or BibTeX:

Liquid AI, "Reducing Doom Loops with Final Token Preference Optimization", Liquid AI Blog, July 2026.

## References

[1] Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes, and Yejin Choi. (2020). The Curious Case of Neural Text Degeneration. International Conference on Learning Representations. [https://openreview.net/forum?id=rygGQyrFvH](https://openreview.net/forum?id=rygGQyrFvH)

[2] Liquid AI, "LFM2.5-1.2B-Thinking: On-Device Reasoning Under 1GB", Liquid AI Blog, Jan 2026.

[3] Samuel J. Paech, Allen G. Roush, Judah Goldfeder, and Ravid Shwartz-Ziv. (2026). Antislop: A Comprehensive Framework for Identifying and Eliminating Repetitive Patterns in Language Models. The Fourteenth International Conference on Learning Representations. [https://openreview.net/forum?id=gLcyM1khyp](https://openreview.net/forum?id=gLcyM1khyp)

[4] Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, and Chelsea Finn. (2023). Direct Preference Optimization: Your Language Model is Secretly a Reward Model.[https://arxiv.org/abs/2305.18290](https://arxiv.org/abs/2305.18290)

[5] Sean Welleck, Ilia Kulikov, Stephen Roller, Emily Dinan, Kyunghyun Cho, and Jason Weston. (2020). Neural Text Generation with Unlikelihood Training. International Conference on Learning Representations.[https://openreview.net/forum?id=SJeYe0NtvH](https://openreview.net/forum?id=SJeYe0NtvH)

[6] Charilaos Pipis, Shivam Garg, Vasilis Kontonis, Vaishnavi Shrivastava, Akshay Krishnamurthy, and Dimitris Papailiopoulos. (2025). Wait, Wait, Wait... Why Do Reasoning Models Loop?[https://arxiv.org/abs/2512.12895](https://arxiv.org/abs/2512.12895)

[7] Zenghao Duan, Liang Pang, Zihao Wei, Wenbin Duan, Yuxin Tian, Shicheng Xu, Jingcheng Deng, Zhiyi Yin, and Xueqi Cheng. (2026). Circular Reasoning: Understanding Self-Reinforcing Loops in Large Reasoning Models.[https://arxiv.org/abs/2601.05693](https://arxiv.org/abs/2601.05693)
