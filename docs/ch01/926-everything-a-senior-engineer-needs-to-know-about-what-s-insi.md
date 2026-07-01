# Everything a Senior Engineer Needs to Know About What's Inside an LLM

## Ch01.926 Everything a Senior Engineer Needs to Know About What's Inside an LLM

> 📊 Level ⭐⭐⭐ | 3.7KB | `entities/senior-engineer-guide-inside-llm.md`

# Everything a Senior Engineer Needs to Know About What's Inside an LLM

> **来源**: [Everything a Senior Engineer Needs to Know About What's Inside an LLM](https://www.pathtostaff.com/p/everything-a-senior-engineer-needs)

## 概述

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

Recurrent neural networks take this one step further, with a built-in memory loop. It looks at the first word, jots it down in a hidden notebook (or layer), and then reads the second and jots it down again. This repeats over and over again. The downside is that it has terrible long-term memory, and would only remember what was most recently

## 原文存档

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/senior-engineer-guide-inside-llm.md)

---

