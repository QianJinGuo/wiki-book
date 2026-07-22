---
source: rss
source_url: https://www.interconnects.ai/p/olmo-hybrid-and-future-llm-architectures
ingested: 2026-06-07
type: article
sha256: 8d6c30233e8c224f2cc2c94a3eba32292ca95330dcdc927027df319e46cc768e
feed_name: Interconnects
source_published: 2026-03-05
---

# Olmo Hybrid and future LLM architectures

So-called hybrid architectures are far from new in open-weight models these days. We now have the recent [Qwen 3.5](<https://qwen.ai/blog?id=qwen3.5>) (previewed by [Qwen3-Next](<https://qwen.ai/blog?id=e34c4305036ce60d55a0791b170337c2b70ae51d&from=home.latest-research-list>)), [Kimi Linear](<https://arxiv.org/abs/2510.26692>) last fall (a smaller release than their [flagship Kimi K2 models](<https://www.interconnects.ai/p/kimi-k2-thinking-what-it-means>)), [Nvidia’s Nemotron 3 Nano](<https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16>) (with the bigger models expecting to drop soon), [IBM Granite 4](<https://huggingface.co/ibm-granite/granite-4.0-tiny-preview>), and other less notable models. This is one of those times when a research trend looks like it’s getting adopted everywhere at once (maybe the Muon optimizer too, soon?).

To tell this story, we need to go back a few years to December 2023, when [Mamba and Striped Hyena](<https://www.interconnects.ai/p/llms-beyond-attention>) were taking the world by storm1 — asking the question: Do we need full attention in our models? These early models fizzled out, partially for the same reasons they’re hard today — tricky implementations, open-source tool problems, more headaches in training — but also because the models fell over a bit when scaled up. The hybrid models of the day weren’t quite good enough yet.

These models are called hybrid because they mix these new recurrent neural network (RNN) modules with the traditional attention that made the transformer famous. They all work best with this mix of modules. The RNN layers keep part of the computation compressed in a hidden state to be used for the next token in the prediction — a summary of all information that came before — an idea that has an extremely long historical lineage in deep learning, e.g. back to the [LSTM](<https://en.wikipedia.org/wiki/Long_short-term_memory>). This setup avoids the quadratic compute cost of attention (i.e. avoiding the incrementally expanding the KV cache per token of the attention operator), and can even assist in solving new problems.

[Share](<https://www.interconnects.ai/p/olmo-hybrid-and-future-llm-architectures?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

The models listed to start this article use a mix of RNN approaches, some models (Qwen and Kimi) use a newer idea called Gated DeltaNet (GDN) and some still use Mamba layers (Granite and Nemotron). The Olmo Hybrid model we’re releasing today also falls on the GDN side, based on careful experimentation, and theory that GDN is capable of learning features that attention or Mamba layers cannot.

## Introducing Olmo Hybrid and its pretraining efficiency

Olmo Hybrid is a 7B base model, with 3 experiment post-trained checkpoints released — starting with an Instruct model, with a reasoning model coming soon. It is the best open artifact for studying hybrid models, as it is almost identical to our [Olmo 3 7B model](<https://www.interconnects.ai/p/olmo-3-americas-truly-open-reasoning>) from last fall, just with a change in architecture. With the model, we are releasing a paper with substantial theory on _why_ hybrid models can be better than standard transformers. This is a long paper that I’m still personally working through, but it’s excellent. 

You can read the paper [here](<https://allenai.org/papers/olmo-hybrid>) and poke around with the checkpoints [here](<https://huggingface.co/collections/allenai/olmo-hybrid>). This is an incredible, long-term research project led by [Will Merrill](<https://lambdaviking.com/>). He did a great job.

To understand the context of why hybrid models can be a strict upgrade on transformers, let me begin with a longer excerpt from the paper’s introduction, emphasis mine:

> Past theoretical work has shown that attention and recurrence have complementary strengths (Merrill et al., 2024; Grazzi et al., 2025), so mixing them is a natural way to construct an architecture with the benefits of both primitives. **We further derive novel theoretical results showing that hybrid models are even more powerful than the sum of their parts** : there are formal problems related to code evaluation that neither transformers nor GDN can express on their own, but which hybrid models can represent theoretically and learn empirically. **But** **this greater expressivity does not immediately imply that hybrid models should be better LMs: thus, we run fully controlled scaling studies comparing hybrid models vs. transformers** , showing rigorously that hybrid models’ expressivity translates to better token efficiency, in agreement with our observations from the Olmo Hybrid pretraining run. Finally, we provide a theoretical explanation for why increasing an architecture’s expressive power should improve language model scaling rooted in the multi-task nature of the language modeling objective.
> 
> Taken together, our results suggest that hybrid models dominate transformers, both theoretically, in their balance of expressivity and parallelism, and empirically, in terms of benchmark performance and long-context abilities. We believe these findings position hybrid models for wider adoption and call on the research community to pursue further architecture research.

Essentially, we show and argue a few things:

  1. **Hybrid models are more expressive.** They can form their outputs to learn more types of functions. An intuition for why this would be good could follow: More expressive models are good with deep learning because we want to make the model class as flexible as possible and let the optimizer do the work rather than constraints on the learner. Sounds a lot like the [Bitter Lesson](<http://www.incompleteideas.net/IncIdeas/BitterLesson.html>).

  2. **Why does expressive power help with efficiency?** This is where things are more nuanced. We argue that more expressive models will have better scaling laws, following the _[quantization model](<https://arxiv.org/abs/2303.13506>)_[ of neural scaling](<https://arxiv.org/abs/2303.13506>).




All of this theory work is a great way to go deeper, and frankly I have a lot more to learn on it, but the crucial part is that we transition from theory to clear experiments that back it up. Particularly the scaling laws for designing this model were studied carefully to decide on the final hybrid architecture. The final performance is very sensitive to exactly which RNN block is used and in what quantity.

In scaling experiments, the results showed that for Olmo, the hybrid GDN (3:1 ratio of layers) > pure GDN (all RNN layers) > standard transformer (all attention) > hybrid Mamba2 > pure Mamba2. The crucial point was that these gaps maintained when scaling to more parameters and compute. A visual summary of the different types of architectures studied is below.

[](<https://substackcdn.com/image/fetch/$s_!7CIi!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F634f5655-f362-4494-80ff-38c095b9caaf_2846x1128.png>)

In terms of this specific model, the pretraining gains were giant! Relative to Olmo 3 dense, it represents an about 2X gain on training efficiency. When you look at evaluation performance for pretraining, there was also substantial improvement in performance, particularly after long context extension (the final 2 rows of Table 2 in the paper, highlighted below).

[](<https://substackcdn.com/image/fetch/$s_!IgMs!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F072051d6-3788-4ab4-9587-c051f282b3b8_2906x2370.png>)

## The journey to post-training Olmo Hybrid

Most of the experience in post-training Olmo models has been climbing up a steep curve in base model capabilities with minor tweaks to architecture. Our recipes from [Tulu 2](<https://arxiv.org/abs/2311.10702>), [Tulu 3](<https://arxiv.org/abs/2411.15124>), and the Olmo 3 reasoning work (building substantially on [OpenThoughts 3](<https://arxiv.org/abs/2506.04178>)) all worked in a fairly straightforward, off the shelf manner. Olmo Hybrid is our first experience in post-training a substantially different architecture, and the results were mixed. 

### 1\. Benchmark performance

Following the Olmo 3 recipe, we got some substantial wins (knowledge) and some substantial losses (extended reasoning) relative to the dense model. All together these still represent a very strong fully open model — just that the pretraining gains didn’t translate as obviously. The results are below.

[](<https://substackcdn.com/image/fetch/$s_!BSEJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b5485f6-9d57-45c9-a686-a51754acc4cb_3992x1562.png>)

The exact reason why this happens is a research question. Our best guess is that the Olmo Hybrid base model is just a sufficiently different student model, where most of our post training data at early stages is learning from stronger “teacher” models (a recap of this method, called [distillation](<https://www.interconnects.ai/p/how-much-does-distillation-really>), appeared recently in Interconnects). 

There is a lot of other research ongoing in the community around what makes a strong teacher model — generally, the best overall model is _not_ the best teacher. In other words, training on data outputted from the model with best evaluation scores today is unlikely to unlock the ceiling in performance for your new base model. A second factor, which is even less explored, is how different base models likely need different teachers to learn from. This is why Olmo Hybrid could perform very differently, where it’s behavior is downstream of an architecture-based learning change, where the pretraining data is almost identical.

There’s A LOT more work to dig into here, some [empirical work in generating better data](<https://www.openthoughts.ai/blog/agent>) and other work in understanding how [different training stages fit together](<https://x.com/_emliu/status/2026359480363913531?s=46&t=0Enn1cSa9nnKjGPrLHWfng>). I am confident this Olmo Hybrid base model is solid and more performance can be extracted, but it takes more careful work adapting existing datasets.

### 2\. Open-source tooling 

The frank reality of new architectures for open models is that the open-source software tooling support is horrific. There’s the paper-cuts that people are familiar with, e.g. random errors in popular libraries (as people experienced with GPT-OSS) that slow adoption, but there are also deeper problems.

A large part of the potential benefit of hybrid models is the reduction in memory usage for long-context generation, which is crucial for reinforcement learning and agentic tasks. It should be a huge win for post-training! This, unfortunately, is far from the case, and will likely take another 3-6months to get right for this batch of GDN models.

The core problem is that the open-source inference tools, e.g. VLLM, are relying on far less developed kernels (and other internals) when compared to standard transformers. This comes with two challenges — throughput slowdowns and numerical issues. Numerical issues can be combatted with a variety of inference flags. Quoting the paper again:

> The two key flags in VLLM we needed to get maximum performance with the post-training model were `--disable-cascade-attn`, which disables cascade attention (an optimization for shared prompt prefixes), and -`-enforce-eager`, which turns off CUDA graphs. These two flags have been used in our RL setup dating back to Olmo 3, but are new additions to evaluations. Scores for the released models drop precipitously without them. We also evaluated our final models with the hybrid model cache in the richer FP32 datatype, to improve stability via `--mamba_ssm_cache_dtype` following NVIDIA.

Essentially, we used these to make sure the model was numerically stable. The downside is that the inference throughput plummets, so the potential gains in compute efficiency are erased. A comparison of numbers is below.

[](<https://substackcdn.com/image/fetch/$s_!00Cf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff5554664-f970-4321-9863-c08c8239c17f_3902x2440.png>)Data for this is available [here](<https://gist.github.com/natolambert/0a6ad2e9f513d7a72b76d9e3a7b0bbb1>).

Effectively, the 7B hybrid model today takes more compute to train with RL than our 7B dense model (that doesn’t even have a common memory saving technique, GQA). The total compute estimate from the table at different context lengths is below (more visuals in the [slides from my recent CMU talk](<https://docs.google.com/presentation/d/1K3bM3K7q_CBcXzUCX7a1YvUHAycpvTKZbJElKSOdiok/edit>)).

[](<https://substackcdn.com/image/fetch/$s_!GmWW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7b42e8e5-d75c-433c-a41a-1ae5aa18b114_3571x2073.png>)

The good news is that these are solvable problems — and improving the tooling could even improve benchmark numbers — but it’s going to take a good bit of time and hard work in the OSS community. 

This leads to my final question. If I’m optimistic about the open ecosystem evolving to support these models with ease, motivated by the better fundamental scaling of the architectures and a large cluster of leading open model builders already using it, are closed models like GPT and Claude built like this? 

To be clear, this answer is a total guess (which I don’t normally do), but with the evidence I have I’d put the chance of one of the 3 frontier models being an RNN being around a coin flip. I’ll let you know if I learn for sure either way. If the scaling advantages hold at frontier scale, the economic case becomes hard to ignore, but they could already have architectures that are efficient like RNNs, but with even more benefits.

* * *

I’m going to follow up this post with more architecture discussions, particularly on why Mixture of Expert (MoE) models are a major headache to post-train, so make sure to subscribe if that sounds interesting to you!

[Subscribe now](<https://www.interconnects.ai/subscribe?>)

 _Thanks to Will Merrill and Finbarr Timbers for some discussions that helped inform this post._

1

and still my [most-viewed interview](<https://www.youtube.com/watch?v=OFFHiJzPpCQ&list=PLlp6Ex8YB3QOH0SibhH3oDZucFrqc8K9v&index=17&t=1s&pp=iAQB>) on YouTube, as the first one I did.
