---
source_url: "https://www.anthropic.com/research/off-switch-dual-use"
source_type: newsletter
title: "An off switch for dual use knowledge in AI models"
tags: ["newsletter", "ai", "alignment"]
score_vxc: 72
score_value: 8
score_confidence: 9
score_stars: 5
ingested_at: 2026-07-09T18:59:45Z
sha256: c4630cde94b35470016d8030ea9fa9c42150c29b53e9691e5652dabfaef843f2
---
---

# An off switch for dual use knowledge in AI models

> Source: [https://www.anthropic.com/research/off-switch-dual-use](https://www.anthropic.com/research/off-switch-dual-use)

Markdown Content:
_This post describes research conducted by [AE Studio](https://ae.studio/alignment) in collaboration with Anthropic._

A frontier AI model is, among other things, a large store of knowledge. Some of that knowledge is _dual use_, meaning it can be used for good or for bad. For example, knowledge of cybersecurity can help patch critical security vulnerabilities, or it can be used to exploit them. Knowledge of virology can help a researcher create a vaccine, but it can also help a malicious actor design a deadly pathogen. Ideally, we would be able to balance three separate goals: first, limiting access to dual-use capabilities in as surgical a way as possible; second, allowing trusted users to access those same capabilities for beneficial purposes; and third, doing all this without affecting the model’s performance on any other task.

Current safeguards are imperfect. We train models to refuse harmful requests and use classifiers to screen inputs and outputs for dangerous content. These layers of protection guard against dangerous outputs—but they don’t change the knowledge stored in the underlying model. Despite our safeguards, a sufficiently determined attacker may still try to [jailbreak](https://www.anthropic.com/news/fable-safeguards-jailbreak-framework) the model, working past its defenses to access the dual-use knowledge.

A more robust protection against misuse would be to control what the model knows. We’ve explored this before: in earlier work, we [filtered information about chemical, biological, radiological, and nuclear weapons out of pretraining data](https://alignment.anthropic.com/2025/pretraining-data-filtering/), and later showed that [dual-use knowledge can be confined to a removable slice of a model’s weights](https://alignment.anthropic.com/2025/selective-gradient-masking/). But filtering is a blunt instrument. It produces one model with one fixed set of capabilities. Using filtering, if you want a model version that _can_ discuss advanced virology—for deployment in a vetted biosecurity lab, say—and another version that can’t, you have to train two separate models. Especially in the case of frontier models (which are large and very expensive to train), the cost to the developer would be prohibitive.

In [new research](https://alignment.anthropic.com/2026/modular-pretraining/) carried out with collaborators at AE Studio, we explore a new method that could enable the benefits of training many separately filtered models, but at the cost of training only one model. We call it GRAM, for Gradient-Routed Auxiliary Modules. Note that the results of the experiments presented here are preliminary—GRAM has not been applied to any of the production models at Anthropic, and we’re not sure it ever will be.

## How GRAM works

The idea behind GRAM is to give a model dedicated, removable compartments for each category of dual-use knowledge, and to update only those compartments when learning from dual-use data.

Concretely, GRAM adds extra neurons to every layer of a standard Transformer (the neural network architecture on which large language models are based). These neurons are divided into groups (or “modules”), one per dual-use category. During training, when the model encounters general-purpose text, it learns in the usual way. But when it encounters text from a dual-use category—virology, for instance—the rules change: the model can _use_ its general knowledge to make predictions, but only the virology module is allowed to _learn_ from that text. The general-purpose weights are temporarily frozen.1

The consequence is that virology knowledge accumulates in the virology module rather than diffusing across the whole network. After training, the module can simply be deleted, and the capability goes with it. Or it can be left in place for trusted deployments, when virology knowledge is needed. The knowledge can be tailored very specifically to the type of deployment needed: in our experiments, we defined four dual-use categories, so that one training run with GRAM yielded a model that can be configured 16 different ways (“on” or “off” for each of the four categories).

## Testing GRAM

We tested GRAM in three settings of increasing realism.

First, on a synthetic dataset of children’s stories tagged by topic, a small GRAM model could be reconfigured to “forget” any chosen topic, and each configuration performed almost identically to a separate model trained from scratch with that topic filtered out. That is, for the cost of training a single model, we achieved results that would normally require multiple training runs on different datasets.

Second, we trained a larger model on a realistic mix of web text, code, and scientific papers, with four dual-use domains: virology, cybersecurity, nuclear physics, and a niche programming language (to serve as a proxy for specialized dual-use code). The capability associated with each dual-use domain is routed to its own module. Deleting a module removed the corresponding capability about as effectively as never having trained on that data at all. Remarkably, we find that this removal did not degrade general performance.

We also tested whether an attacker could recover the removed knowledge by training on a small amount of malicious data; GRAM resisted this about as well as data filtering did. By contrast, an “unlearning” technique applied after training only _suppressed_ the knowledge—it was easy to restore with a small amount of fine-tuning.

Third, we ran the experiment at seven model sizes from 50 million to 5 billion parameters. GRAM matched the performance of data filtering at every size, and the gap between “module on” and “module off” grew wider as models got larger. In terms of compute costs, attempting to bypass our protections became relatively more difficult and expensive as we scaled.

## Conclusions

As AI companies train more capable models, the need to limit access to dual-use capabilities will increase. Today, companies limit access through classifiers and refusal training. However, these safeguards are difficult to make robust without degrading performance on harmless requests. Methods like GRAM offer a potential path toward access control that is more robust.

This is early research, and there are clear limitations. We haven’t tested GRAM at frontier scale or in a production training pipeline. (As noted above, it hasn’t been applied to any of our Claude models.) Our evaluations quantify performance in terms of next-token prediction ability, rather than performance on real downstream tasks. And there’s a deeper open problem that applies to data filtering and methods like GRAM: some dual-use capabilities might be so entangled with general knowledge that no method can separate them cleanly.

_For further details on our experiments, read the [post](https://alignment.anthropic.com/2026/modular-pretraining/) on our Alignment Science blog._

#### Footnotes

1. One technical detail is that the virology module is also sometimes turned on when learning from general-purpose text. We find this helps the modules “work together” more effectively.

## Related content

### A global workspace in language models

New interpretability research reveals an emergent mental workspace in Claude that holds internal thoughts that don’t appear in the model’s output.

[Read more](https://www.anthropic.com/research/global-workspace)

### Anthropic Economic Index report: Cadences

In our latest Economic Index report, we sample hourly for the first time to ask: When do people come to Claude? What do they produce with it? And how do they perceive AI's impact on their work?

[Read more](https://www.anthropic.com/research/economic-index-june-2026-report)

### Project Fetch: Phase two

We report results from our latest test of whether Claude can help Anthropic employees perform sophisticated robotics tasks. We found that Claude Opus 4.7, operating without human assistance, was about 20 times faster than the fastest human team at all tasks completed by participants less than a year ago.

[Read more](https://www.anthropic.com/research/project-fetch-phase-two)
