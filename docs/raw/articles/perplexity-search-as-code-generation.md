---
title: "Rethinking Search as Code Generation"
type: article
source: rss
source_url: https://research.perplexity.ai/articles/rethinking-search-as-code-generation
tags: [agent, agentic-search, perplexity, search, code-generation]
ingested: 2026-06-03
ingestion_date: 2026-06-03
review_value: 9
review_confidence: 8
review_stars: 5
sha256: perplexity-search-as-code-2026-06-03
---

# Rethinking Search as Code Generation


Published Time: Mon, 01 Jun 2026 17:44:26 GMT

Markdown Content:
Search is a core primitive for AI systems. Frontier models grow more capable by the month, but they still need access to fresh, accurate, and well-curated knowledge from the wider world. Search is the primary way that AI systems tap into that knowledge, and thus a foundational component of any product that needs to draw conclusions, take actions, and perform real-world work.

We believe that traditional search pipelines are increasingly outdated in the era of agents. Traditional search answers queries, but today’s agents complete tasks that can take on countless shapes. These tasks require agents to define task-specific retrieval strategies directly within their harnesses. Within Perplexity Computer, we’ve seen single tasks invoke hundreds or even thousands of retrieval operations within a few minutes: a workflow that is impossible for humans but absolutely natural for agents.

In this world, search itself must become agentic, with its building blocks accessible directly as SDKs within the agent harness. We are introducing **Search as Code (SaC**) as Perplexity’s new reference search architecture.

## Introduction

Perplexity's search stack serves thousands of queries each second across our applications and API Platform. In September 2025, we published the first [architectural overview](https://research.perplexity.ai/articles/architecting-and-evaluating-an-ai-first-search-api) of our search systems. Constant innovation within these systems has supported the launch of new offerings such as [Search API](https://www.perplexity.ai/hub/blog/introducing-the-perplexity-search-api), [Agent API](https://www.perplexity.ai/hub/blog/agent-api-a-managed-runtime-for-agentic-workflows), and [Computer](https://www.perplexity.ai/products/computer), with self-improvement loops optimizing the search stack to better serve users with each passing day.

Traditionally, AI systems have treated search as a monolith: an AI model issues a query, the search engine runs its predefined pipeline, and the model consumes the results as context. For the most part, this worked fine to address the needs of early AI users. Given the relative simplicity of their requests, there was no reason to worry about exactly how the search pipeline was designed, or whether the pipeline's architecture was optimal for the task at hand. The defaults were presumed to be good enough, as were the default interfaces (function calling and MCPs).

![Image 1](https://framerusercontent.com/images/jFfT0gUzrVIip3MpoWU5NOEaq0.png)

Expand

###### Figure 1 | Traditional search architectures expose a single fixed system that models call serially, while Search as Code exposes atomized search primitives that agents compose through generated code.

Yet today this approach grows more outdated with each passing month. Users demand much more than single-shot analysis from AI. They expect agents to complete tasks end-to-end over hours or even days. These tasks can be complex, open-ended, and highly variable in their information needs, and monolithic architectures are buckling under the weight of these demands.

The key bottleneck is ultimately one of _control._ Frontier models are already quite good at reasoning over fixed context. However, the most powerful AI systems will require the ability to steer _how_ that context is retrieved, processed, aggregated, and rendered to the model.

Traditional search systems were not designed with this degree of controllability in mind. After all, human users cannot be expected to exercise fine-grained control over search pipeline internals even if it were offered. Early AI models can control search only through a linear trajectory of function calls and MCPs. But today's frontier models, driven by code-capable agent harnesses, can exert fine-grained control over any computational primitives imaginable through computer code. Our task becomes to provide the right primitives.

To meet this need, we are introducing a new search architecture across our products: **Search as Code (SaC).**This new architecture empowers models to reach _into_ the search stack itself rather than merely consume its final outputs. The core idea is straightforward: we expose the components of the search stack as primitives within an SDK. For any request that needs search, a model assembles these primitives on-demand into a retrieval pipeline tailored to that specific request.

Assembling this pipeline is done through code generation and execution within a secure sandbox. Unlike other codegen-driven approaches to search, we do not simply stick a traditional search API within a shell or language runtime. Instead, we've carefully engineered an Agentic Search SDK that exposes the individual building blocks of search at the most atomic level possible.

![Image 2](https://framerusercontent.com/images/hIpF8Cv3YwGB2GyMzVcJqwlDhE.png)

Expand

###### Figure 2 | Search as Code (SaC) advances the performance frontier of agentic search across a diverse suite of benchmarks.

Armed with these building blocks, SaC gives models direct control over each individual search step: retrieval, ranking, filtering, fanouts, rendering, and more. It also gives the model efficient access to intermediate state such as candidate lists and ranking signals. Together, these twin levers of control and legibility allow agents to design bespoke search pipelines spanning thousands of retrieval operations, optimize those pipelines in-flight, and consume only the most useful information as model context.

This article describes SaC's motivation, design, and implementation, alongside empirical results on both existing and new benchmarks. SaC establishes a new cost-performance frontier for agentic search, and we're excited to share it with our users and the broader AI community.

### The Rigidity of Traditional Search

The world's first search engines were built for human users. These users came to expect a predictable experi
