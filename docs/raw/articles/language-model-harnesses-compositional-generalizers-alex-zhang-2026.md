---
title: "Language model harnesses are compositional generalizers"
source_url: "https://alexzhang13.github.io/blog/2026/harness/"
ingested: 2026-07-21
sha256: 888e64ff303b0dc4863b6a97c23a233d7548083d01333b5b8d357560389a8160
source: newsletter
authors: ["Alex L. Zhang", "Omar Khattab"]
affiliation: MIT
tags: [harness, rlm, compositional-generalization, language-models]
arxiv: null
---

# Language model harnesses are compositional generalizers

**Authors**: Alex L. Zhang, Omar Khattab (MIT)

Harnesses can lead to compositional generalization: we observe a property in training RLMs, in which similarly structured tasks are viewed as isomorphic and all individual LM calls in the harness become in-distribution.

## Abstract

Modern post-training has become a brute-force paradigm of curating ever more environments and ever longer training horizons. In large part, this is because frontier Transformers are still poor at compositional generalization, the ability to solve unseen problems by composing familiar ones.

We argue that better generalization is largely the job of what today is called a harness. A harness is the program that sits between the external world and the neural network: it decides how to encode the current state of the environment, which can be arbitrarily long and complex, into one or more inputs to the LLM and how to determine the next action.

The primary job of the harness should be to carry a higher-level inductive bias that can reduce unfamiliar and complex problems to compositions of simpler ones for the underlying neural network. Concretely, we think a good harness is one that shapes each call to the underlying Transformer so that every observation is locally in-distribution, i.e. each Transformer call handles a prompt that is in-distribution with respect to its training data.

A good harness can frequently reduce problems that seem to require breakthroughs in post-training into almost mundane capabilities of the existing generation of language models.

## Key Results

- Training on only short tasks generalizes to held-out tasks 8–32x longer
- Roughly 10x the eval lift with the same train lift over training the underlying Transformer directly
- Training on one domain transfers to other domains at a far better rate than that of a vanilla Transformer
- The RLM harness induces an equivalence relation between tasks with latent similarities, meaning the RLM's sub-policies learned in training become applicable out-of-domain without additional training

## The Role of the Harness

The primary job of the harness should be to carry a higher-level inductive bias that can reduce unfamiliar and complex problems to compositions of simpler ones for the underlying neural network. We think a good harness is one that shapes each call to the underlying Transformer so that every observation is locally in-distribution.

We test this by using reinforcement learning (RL) to train a Recursive Language Model (RLM), a harness in which the model offloads its context and defers execution to programmatic decomposition and recursive sub-calls.

The harness is the program that sits between the external world and the neural network: it decides how to encode the current state of the environment, which can be arbitrarily long and complex, into one or more inputs to the LLM and how to determine the next action.

## Citation

```
@article{zhang2026harnesses,
  title = "Language model harnesses are compositional generalizers",
  author = "Zhang, Alex and Khattab, Omar",
  year = "2026",
  month = "July",
  url = "https://alexzhang13.github.io/blog/2026/harness/"
}
```
