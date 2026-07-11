# We have Mythos at Home: GLM 5.2 beats Claude in our Cyber Benchmarks

## Ch09.137 We have Mythos at Home: GLM 5.2 beats Claude in our Cyber Benchmarks

> 📊 Level ⭐⭐ | 4.0KB | `entities/we-have-mythos-at-home-glm-5-2-beats-claude-in-our-cyber-ben.md`

# We have Mythos at Home: GLM 5.2 beats Claude in our Cyber Benchmarks

> Source: [We have Mythos at Home: GLM 5.2 beats Claude in our Cyber Benchmarks](https://semgrep.dev/blog/2026/we-have-mythos-at-home-glm-52-beats-claude-in-our-cyber-benchmarks) | Score: v*c=64

## Overview

Markdown Content:
We ran a set of popular open-source models against our IDOR benchmark, the same dataset and the same prompt we've used to evaluate frontier coding agents. The result surprised us: GLM 5.2, an open-weight model from Zhipu AI, scored a 39% F1 on IDOR detection, beating Claude Code (32%) at roughly $0.17 per vulnerability found. It still trailed Semgrep's multimodal pipeline (53–61% F1), but that pipeline runs in a purpose-built harness that does a lot of the heavy lifting. Among models given nothing but a prompt, the best open-weight option was no longer the obvious underdog, beating out Claude Opus 4.8.

We weren't trying to crown an open-weight champion, really. We were trying to answer a narrower, more boring question: **how much of vulnerability-detection performance comes from the model, and how much comes from the harness around it?** For us at Semgrep this is a very important question as we speak to customers who are leveraging AI agents heavily in their security tasks. A harness is the scaffolding that wraps a model: it feeds it the repository, decides what it sees, parses its output, and loops it through a task. Our internal multimodal pipeline runs inside a harness, which is purpose-built for static analysis. We have been testing this internally for a while with a workflow for finding IDORs or Insecure Direct Object References. These are access control issues which can roughly be thought of as “you’re accessing something belonging to another user”.

Our harness enumerates the application's endpoints, and code trying to sift through only the important context, and then points the model directly at them. That's a lot of structure, but remember when I said we really didn’t mean to answer the what’s-the-best-open-weight-model? The models in this test don’t get that, they run in a simple[Pydantic AI](https://ai.pydantic.dev/) harness with the same IDOR prompt we give every other LLM-provider model, no endpoint discovery, no guided navigation, we did give it a bit of help, just a little more than "here's the code, find the bugs.", offering a search strategy and some pointers on what IDORs look like.

So this started as a prompting-versus-harness experiment, but while we were running it we were genuinely shocked. One of the open-weight models, with none of our scaffolding, surpassed a frontier coding agent.

## **Introducing GLM-5.2**[![Image 1: Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](http://semgrep.dev/blog/2026/we-have-mythos-at-home-glm-52-beats-claude-in-our-cyber-benchmarks#introducing-glm-5.2 "Introducing GLM-5.2")

If you’ve not heard of GLM-5.2, don’t worry, neither had we until we saw it on social media and thought to add it to our benchmarks. **GLM 5.2**is the latest model from Zhipu AI (Z.ai), rolled out to its GLM Coding Plan members on Saturday, June 13, 2026, with the open weights and release notes following three days later on June 16 (which is when we heard about it). Three things make

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/we-have-mythos-at-home-glm-5-2-beats-claude-in-our-cyber-ben.md)

---

