# Using Local Coding Agents

## Ch09.135 Using Local Coding Agents

> 📊 Level ⭐⭐ | 3.7KB | `entities/using-local-coding-agents.md`

# Using Local Coding Agents

> Source: [Using Local Coding Agents](https://magazine.sebastianraschka.com/p/using-local-coding-agents) | Score: v*c=81

## Overview

Published Time: 2026-06-27T11:21:58+00:00

Markdown Content:
Many people reached out to me in the past asking about my local agent stack as well as how I set up my local agent stack.

So, I thought it might be useful to put together a little tutorial on how to set up a local (coding) agent using open-source tools and open-weight LLMs.

[![Image 1: Figure 1](https://substackcdn.com/image/fetch/$s_!w1ai!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ebec9f-115a-4896-926d-5461220de62a_10126x2817.png)](https://substackcdn.com/image/fetch/$s_!w1ai!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ebec9f-115a-4896-926d-5461220de62a_10126x2817.png)

Figure 1: Overview of the local stack, that is, a coding agent harness that uses a local model hosted through an inference engine / runtime server.

This article is a tutorial on setting up a production-ready coding agent with a fully local stack. We will use a locally served LLM together with a local coding harness that can read files, make edits, run commands, and verify changes as shown in the figure above.

Here, we can think of the LLM as the engine that provides the reasoning and code generation. And the surrounding harness provides the operating environment that allows the LLM to do meaningful coding work in our local projects.

Why local? For many coding workflows, a local setup is an interesting alternative to proprietary services such as GPT in Codex or Opus in Claude Code. The local setup is transparent, inspectable, and free to run apart from hardware and electricity costs. It also stays fully under your control, and you can modify the coding harness in any way you like. **Plus, it’s a lot of fun!**

By the way, in case you want a bit more background information on coding agent harnesses, I covered the core components of coding agents (and building a coding agent from scratch for learning purposes) here:

I have to admit that I still primarily alternate between Codex and Claude Code as my daily drivers, for now (and just to keep up with the new tooling and functions that are constantly being added). Also, the plan limits (especially for Codex) are still so generous that I haven’t had to worry about costs so far.

However, I’ve been using local solutions for a while, too, to test things and because it somehow gives me joy to have and use a fully local setup (versus proprietary services).

Either way, local solutions become more and more attractive each day. One aspect is the costs. If you have the hardware, they are practically free to run. And then there’s, of course, the privacy angle. For example, for organizing and processing my receipts, I’d be more comfortable with a local model ingesting them rather than sending the data over to OpenAI or Anthropic.

(Then, if we keep in mind that Anthropic was recently [throttling their flagship model’s performa

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-local-coding-agents.md)

---

