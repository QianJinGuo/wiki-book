# never waste a token

## Ch01.934 never waste a token

> 📊 Level ⭐⭐ | 4.2KB | `entities/sunilpai.md`

# never waste a token

> **背景**：从 newsletter candidates 提取，2026-06-18 v×c=56 stars=4 通过评分门槛。
> URL: https://sunilpai.dev/posts/never-waste-a-token/

## 核心要点

Published Time: 2026-06-15T00:00:00.000Z

Markdown Content:
_(this post itself is LLM slop, but it tastes alright)_

tl;dr - put a durable buffer between your agent and the LLM provider. the provider connection now outlives your process, so a deploy in the middle of a stream doesn’t cost you the tokens you already paid for. and the same buffer that lets a disconnected browser catch back up is the thing that recovers a crashed turn. one log, two readers.

* * *

I’ve spent the last few weeks stuck on one question: what happens to an agent when the process running it dies in the middle of a turn?

it goes deep fast. tool calls that may or may not have fired. sub-agents. half-written streams waiting on a human. I’m writing all of that up separately (durable agent loops, coming soon). but one piece of it is small and self-contained enough to pull out on its own:

**when your process dies mid-inference, you don’t just lose your place. you lose money.**

## the problem that’s easy to miss

your agent opens a streaming request to a model, and the model starts generating. you’re billed for those output tokens the moment they’re generated. then your process gets replaced. maybe a deploy, maybe an eviction, maybe an OOM.

the usual reassurance is “don’t worry, the state is durable.” and sure, your conversation history survived. but the _in-flight HTTP request to the provider_ did not. it lived in the memory of the process that just died. so when you recover, your only option is to **make the call again**. you pay for those output tokens a second time.

now make it an agent. a real one does multiple tool calls in a single turn:

```
user message
  → stream some text
  → tool call → tool result
  → stream more text
  → tool call → tool result
  → stream the answer
```

every interruption throws away _all_ the output tokens generated so far in that turn. and it scales with the model you actually want to use: output runs $30 per million tokens on `gpt-5.5` versus $2 on `gpt-5.5-mini`, so a flagship retry burns ~15x what a mini one does. the better the model, the more it hurts. deploys happen constantly, evictions happen constantly, and each one that lands on a live stream is money straight out the window.

the happy path hides it. you only see it when you start counting tokens after an incident and the numbers don’t add up.

## the move: stop tying the request to the process

the reason a crash wastes tokens is that the provider connection lives _inside the thing that crashed_. so move it out.

put a buffer between the agent and the provider, and make it a **separate deployment**: its own Worker, its own Durable Object.

![Image 1: Diagram](https://sunilpai.dev/diagrams/8a5b1edea8f60b9b.svg)![Image 2: Diagram](https://sunilpai.dev/diagrams/8a5b1edea8f60b9b.dark.svg)
when a request comes in, the buffer does three things in order. it resets its state for a fresh stream. it kicks off a background task that drains the provider connection into SQLite. and it immed

## 评估理由

- **value=8**: Excellent practical engineering insight on agent architecture: token cost loss when LLM provider connection dies mid-stream, durable buffer pattern, and token economics across model tiers (gpt-5.5 vs 
- **confidence=7**: 详细程度与来源可信度
- **stars=4**: 独特技术洞察评分

## 相关

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sunilpai.md)

---

