# Lean Software Scaling Laws

> 📊 Level ⭐ | 3.9KB

> **Source**: [gwern.net](https://gwern.net/lean-scaling)

Novel research proposal with specific methodology (perplexity scaling over codebase size) and a concrete test case (Lean). High technical depth and originality, though lacks empirical data. Good source credibility (Gwern).

## Content Summary

Research proposal for measuring how coding LLM perplexity scales with codebase context size, using Lean as a test case for whether formal languages have better predictability exponents and could lead to safer, more secure software worldwide.

> Research idea: empirically measure the scaling of coding LLM perplexity over codebase size to estimate the scaling laws of ‘predictability’ by programming language or other factors. This should translate into overall security and safety.
> 
> 
> We can measure this in contemporary LLMs expensively, by training from scratch and finetuning, or cheaply, by measuring perplexity over increasingly large context windows of source code.
> 
> 
> Codebases, and programming languages, which have better exponents in their scaling laws will eventually become easier for LLMs to understand, fix, and write.
> 
> 
> In particular, the Lean programming language likely has, with 2026-era LLMs, a worse baseline constant and total loss on existing codebases, but better scaling exponents. This would imply that implementations in Lean can eventually win and deliver large benefits in program correctness at global scale—and thus could help justify large-scale investments in rewriting existing codebases in Lean or paying for new Lean code, thereby improving global cybersecurity.

[C](https://gwern.net/dropcap#yinit)oding LLMs are currently on track to produce most software in the near-future, despite being generally mediocre quality or outright insecure (with vibecoded software being especially bad). Future rewrites with coding LLMs may help, but are not guaranteed to happen or to plug as many holes as we need to be secure against pervasive cybersecurity LLM offensives. How can we avoid this? LLMs could potentially write all software in provably secure, safe ways like formally-verifiable systems, but progress in that lags behind.

How far behind?

## [Language Priors](https://gwern.net/lean-scaling#language-priors "Link to section: § 'Language Priors'")

[Neural scaling law⁠](https://en.wikipedia.org/wiki/Neural_scaling_law) methodology remains under-applied in deep learning for validating existing approaches and forecasting future applications. An example is in coding agents: it’s commonly observed that [LLMs⁠](https://en.wikipedia.org/wiki/Large_language_model) are better at more common languages due to more available data, and [⁠Luo et al 2025⁠](https://arxiv.org/abs/2510.08702) argues that programming is especially data-hungry, and thus there might be long-term ‘lock-in’ and upgrading to better technologies like [Haskell⁠](https://en.wikipedia.org/wiki/Haskell) or [Rust⁠](https://en.wikipedia.org/wiki/Rust_(programming_language)) or [Lean⁠](https://en.wikipedia.org/wiki/Lean_(proof_assistant)) will be impossible.

But this does not follow: being a popular language with a lot of training data only means that LLMs _start off by default_ performing well. (Because it’s hard to disentangle a programming language f

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

