---
title: "Prompt Caching In Agents"
source_url: "https://earendil.com/posts/prompt-caching/"
ingested: 2026-07-28
source: newsletter
source_published: 2026-07-22
sha256: 001a1c101156d46ce445ce29093517fcc8f676319706bbfc1988c81b229d8cf2
---

# Prompt Caching In Agents

Large language models are often thought of like functions: send in some text, receive some text. That is a useful abstraction, but it ignores one of the most important parts of running a coding agent: most of the input is the same as last time. In other words we mostly append to it.

A coding agent sends the model its system prompt, tool definitions, project instructions, conversation history, tool calls, and tool results. On the next turn it sends almost all of that again, plus a small amount of new material. Once a session has grown to tens or hundreds of thousands of tokens, recomputing the whole prompt for every turn is slow and expensive.

Prompt caching is what makes this somewhat economic, but it is also quite fragile. A changed tool definition, a model switch or a provider routing decision can turn what one would expect to be a cheap incremental request into a full replay of the context. For coding agents, cache behavior is therefore not just an implementation detail or optimization. It affects latency, cost, tool design, session design, and even which product features should be made available.

## What a KV Cache Contains

A transformer processes a prompt in two broad phases. During prefill, it reads the input tokens and computes attention state for them. During decode, it produces new tokens one at a time. At each attention layer, every processed token produces a key and a value. These are retained so that the next generated token can attend to everything that came before without recomputing the earlier tokens. This retained state is the KV cache.

The important property is that they correspond to a particular token prefix. Two prompts that mean the same thing but tokenize differently do not share a KV cache. If a token changes in the middle, everything after that token is a different continuation.

## Where the Cache Lives

There are two broad ways inference systems make KV caches available:

1. **Session affinity**: Keeping the KV cache on or near the GPU that computed it, routing the next request back to the same worker. Fast when it works, but constrains scheduling — the selected worker can become overloaded, restart, or evict the entry.

2. **Distributed cache**: KV blocks stored in another memory tier or made available across workers, so a request is not tied as tightly to one GPU. Improves scheduling flexibility and recovery, but moving, indexing, and retaining KV blocks is itself a systems problem.

## Explicit vs Automatic Prefix Caching

Provider APIs expose caching in two main styles:

- **Anthropic (explicit)**: Client marks boundaries after stable parts of the request with cache_control points. Cache writes are explicitly priced.
- **Other APIs (automatic)**: Client sends the request normally, and the provider finds a reusable prefix without client-placed breakpoints.

## Why Tool Loadouts Trash Caches

Tool definitions usually appear before the conversation and are "folded" into the system prompt internally. Adding one tool, removing one, changing its schema, or serializing the tools in a different order can move the first mismatch close to the start of the prompt. This is a common surprise with plugin systems and MCP-style tool catalogs.

Some newer model APIs support additive tool loading — a tool can become available at a specific tool result inside the transcript instead of being inserted into the original tool list. The old prefix remains unchanged.

## Interruptions and TTLs

Anthropic's default five-minute cache is shorter than many normal coding activities. A long build, a test suite, lunch, a meeting, or reviewing a diff can outlive the cache. Some providers such as Anthropic expose longer retention controls.

## Why Pi Does Not Prune Aggressively

Deleting content from the middle changes the prefix at the deletion point. All surviving conversation after it may need to be processed again. The immediate cost of rewriting a long cached context can exceed the future savings from removing a small number of cheaply cached tokens.

Pi therefore prefers a stable, append-oriented transcript. Compaction is available when context pressure justifies a lossy rewrite.

## Common Reasons for Worse Cache Performance

- **Idling**: exceeds provider's retention window
- **Model or provider switches**: KV state is model-specific
- **Branch navigation**: /tree, rewinds, forks change the token sequence
- **Tool and reasoning level changes**: change early parts of the request
- **Dynamic system prompts**: timestamps, random values, extension-provided snippets
- **Extension context transforms**: modify old messages or provider payloads
- **Provider routing and eviction**: KV blocks no longer available where request lands
