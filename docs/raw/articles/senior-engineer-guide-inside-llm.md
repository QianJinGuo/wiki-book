---
title: "Everything a Senior Engineer Needs to Know About What's Inside an LLM"
source_url: "https://www.pathtostaff.com/p/everything-a-senior-engineer-needs"
ingested: "2026-06-23"
sha256: "0fa7b330cea0289e"
created: 2026-06-23
updated: 2026-06-23
type: article
tags: [llm, transformer, architecture, engineering]
---

# Everything a Senior Engineer Needs to Know About What's Inside an LLM


Published Time: 2026-06-20T17:00:09+00:00

Markdown Content:
Welcome back to Path to Staff! This series is a little different from our usual programming. In this series, we’re covering LLMs and AI in-depth.

As an engineer, I never really had the time to understand AI’s internals. But I’ve spent the past few weeks doing deep research to unpack it all.

[![Image 1](https://substackcdn.com/image/fetch/$s_!I01Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefe149c8-bf8b-437b-a163-d34bc252bf8d_2912x1536.png)](https://substackcdn.com/image/fetch/$s_!I01Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefe149c8-bf8b-437b-a163-d34bc252bf8d_2912x1536.png)

As a reminder, this is Part Two of a five-part series:

1.   **The Hardware Behind AI – And How It’s Programmed.** Transistors, semiconductors, and fabricators. Learn about the big players (TSMC, Nvidia, ASML). The memory-compute bottleneck. And all the acronyms you always wondered about (TPU, ASIC, FPGA, CUDA, etc.)

2.   **Model Architecture.**_(We are here.)_ Learn about what models are made of. We’ll cover the paper that started it all (”Attention is All You Need”), plus talk about transformers and diffusion models.

3.   **Training**. The meat of teaching a model. How does pretraining work? What goes into it (backpropagation, optimizers, loss functions)? What scaling laws should we weigh before we kick off an expensive training run (up to hundreds of millions of dollars)?

4.   **Post-Training & Alignment.** How does one guide a model once it’s been taught? How do we apply safety? How do we benchmark and know the model got better? How do we evaluate a model’s performance?

5.   **Inference, Serving and Agents.** This might be the most familiar topic, since it’s closest to you as an AI user. How does a model output its token and serve the result to you (SSE)? How do systems stay fair and fast? What tools are available (MCP, RAG, tool use) and how do agents work?

I remember taking CS:188 by Pieter Abbeel at Berkeley, learning about Recurrent Neural Networks (RNNs) in 2014. I wish I’d paid more attention in class, but it was still a good foundation for working on this chapter.

To my surprise, RNNs are less popular today. And there’s a good reason for that.

If you haven’t studied neural networks before, you should know that a neural network looks at an input, guesses what it is, then immediately forgets it. The simplest form is a _feed-forward neural net_, where the data goes through and outputs as a layer at the end.

Recurrent neural networks take this one step further, with a built-in memory loop. It looks at the first word, jots it down in a hidden notebook (or layer), and then reads the second and jots it down again. This repeats over and over again. The downside is that it has terrible long-term memory, and would only remember what was most recently fed.

[![Image 2](https://substackcdn.com/image/fetch/$s_!lB2g!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F079d27a7-9f75-4a28-997a-d8086a749731_2400x1104.png)](https://substackcdn.com/image/fetch/$s_!lB2g!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F079d27a7-9f75-4a28-997a-d8086a749731_2400x1104.png)

_An RNN reads “The cat sat on the mat” one word at a time - its memory of “The” has almost faded by “mat”._

Upgraded versions of RNNs called [LSTM (Long Short-Term Memory)](https://en.wikipedia.org/wiki/Long_short-term_memory) and [GRUs (Gated Recurrent Units)](https://en.wikipedia.org/wiki/Gated_recurrent_unit) were implemented to highlight important memories, but there were still two key problems with these recurrent neural networks.

They were:

1.   _**Sequential bottleneck:**_ You can’t compute the next step in a recurrent neural network till the current operation is complete. This means there’s no way to parallelize training. A sequence of length N takes N sequential steps no matter how much hardware you throw at it. Training time was bound by the length of the chain, not the size of the chain.

2.   _**Long-range decay:**_ information from early tokens fades before it reaches later ones, as seen in the image above. Training an RNN means backpropagating the signal through every step, multiplying by the same weights each time. So over a long sequence the gradient vanishes to zero or explodes, and the model can’t learn that an early token should shape a much later one.

In 2014, [Bahdanau et al.](https://arxiv.org/abs/1409.0473) added a different concept to neural networks, called **attention**. Rather than force the whole input through one fixed summary, let the model look back at every input token and weight the ones that matter for the current step. Simplified, when generating a new token, the model looks back at all the previous tokens to generate a vector for each of them.

It worked well, and took an important step toward the transformer. However, it was still bolted onto a recurrent network, so the sequential bottleneck remained.

Three years later, [Vaswani et al.](https://arxiv.org/abs/1706.03762) made a large leap: keep the attention, **drop the recurrence entirely**. Their insight was that self-attention, where every token computes its relationship to every other token through dot products, solves both problems (sequential bottleneck & long-range decay) at once.

With matrix multiplication happening over all pairs simultaneously, the whole sequence can now be processed in parallel rather than step by step. _And_ with no recurrent chain, there’s no information left to decay.

[![Image 3](https://substackcdn.com/image/fetch/$s_!w-KX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4f14024-c96d-4b75-a43f-08f549768906_2400x1200.png)](https://substackcdn.com/image/fetch/$s_!w-KX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe4f14024-c96d-4b75-a43f-08f549768906_2400x1200.png)

_The same five tokens with two ways to handle them. In RNN mode: it’ passes information hand-to-hand down a chain, so it runs one step at a time and the earliest signal fades by the end. Self-attention connects every token to every other at once. This is fully parallel, with nothing left to decay._

Eight Google researchers laid this out in a paper titled “**Attention Is All You Need**“. The architecture they proposed within is called the _**transformer**_.

At first, they built it to improve machine translation, but they already saw further, noting in the paper that the same architecture should extend to other tasks. They were not wrong.

A transformer is a neural network that processes sequences.

An input goes in, passes through N identical blocks and a prediction head converts it into an output.

> A prediction head is a translator at the end of the model that turns the model’s numbers into a score for every word. These raw scores are called _logits_.

There are different types of transformers. Let’s first look at an example of translating a sentence. You have an input that gets read, which gets translated to an output.

Say you want to translate “The cat sat on the mat” to Chinese. This goes from “The cat sat on the mat” to “猫坐在垫子上”.

In this case, we are using an encoder-decoder architecture. The encoder reads the input, while the decoder generates output.

Here’s what the architecture looks like:

[![Image 4](https://substackcdn.com/image/fetch/$s_!ZwmR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa66d276a-bbc7-4989-8f7f-9b3dabea7d36_2400x1704.png)](https://substackcdn.com/image/fetch/$s_!ZwmR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsu
