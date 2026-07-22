---

title: "Tokenomics: the 62.5-minute rule for Claude's cache"
source: newsletter
source_url: https://skids.dev/blog/anthropic-cache-tokenomics/
fetcher: jina
tags: [claude]
created: 2026-05-19
updated: 2026-05-19
sha256: bd623762f73e5c5c

---
# Tokenomics: the 62.5-minute rule for Claude's cache
Published Time: 2026-05-17T00:00:00.000Z
Markdown Content:
Is it more efficient to refresh the 5-min cache, let it expire, or just rely compaction?
Unfortunately one of the downsides of being a chronic tokenmaxxer is regularly hitting 5-hour and weekly token limits across several providers. This often comes at the most inconvinient time possible when you’re in the middle of something and ideally I’d prefer to not spend any more money on additional AI subscriptions if possible. I started looking a little more closely at my request logs to see if this was a skill issue and I noticed that I’m writing my entire context (which can be as high as 400k/500k in some sessions) to the cache a little more often than I should be. Each write was pretty small in isolation, but added up pretty quickly.
5 minutes really isn’t a long time, so it’s easy to get distracted and miss the cache refresh and pay for the full prefix write. This got me thinking, if a prompt cache is about to expire and I don’t have a real request to send, is it cheaper to ping it with a keep-alive, or let it die and rewrite it later?
tl;dr: The answer is **62.5 minutes**. If you expect to need the cache again before then, refresh it. If not, let it expire. That number doesn’t move when you switch between models and it doesn’t move when the cached prefix grows from 5K tokens to 500K. The dollars change, but the decision point is still the same.
## The numbers[](https://skids.dev/blog/anthropic-cache-tokenomics/#the-numbers)
[Anthropic’s pricing page](https://platform.claude.com/docs/en/about-claude/pricing) lists prompt caching as a set of multipliers on the normal input-token price:
| Model | Base input | 5-min cache write | 1-hour cache write | Cache read / refresh | Output |
| --- | --- | --- | --- | --- | --- |
| Opus 4.7 | $5 / MTok | $6.25 / MTok | $10 / MTok | $0.50 / MTok | $25 / MTok |
| Sonnet 4.6 | $3 / MTok | $3.75 / MTok | $6 / MTok | $0.30 / MTok | $15 / MTok |
| Haiku 4.5 | $1 / MTok | $1.25 / MTok | $2 / MTok | $0.10 / MTok | $5 / MTok |
The multipliers are the same for every model: a 5-minute cache write costs 1.25x the base input price, a 1-hour cache write costs 2x, and a cache read costs 0.10x.
Read operations do two jobs: A request that hits a live cache is billed at the read rate, and the same request refreshes the cache TTL back to 5 minutes, so cache hit = cache refresh.
The trick to keeping the cache warm is a super tiny request that reads the cached prefix before the TTL runs out. The cost is 10% of the normal input price for that prefix, but the catch is that you have to keep doing it until you need it again.
## A case study of a 100K-token prefix[](https://skids.dev/blog/anthropic-cache-tokenomics/#a-case-study-of-a-100k-token-prefix)
Let’s take Opus 4.7 and a 100K-token cached prefix as an example. That’s not a massive context window, but really easy to hit considering it’s usually just enough to cover a system prompt, tool definitions, a project sketch, and some running notes from an agent session.
Writing that prefix to the 5-minute cache costs:
`100K tokens * $6.25 / MTok = $0.625`
Reading it, which also refreshes it, costs:
`100K tokens * $0.50 / MTok = $0.05`
If I keep the cache alive for `T` minutes, I pay the first write and then one read every 5 minutes:
`refresh_cost(T) = W + R * floor(T / 5)`
If I let the cache expire and come back later, I pay the first write and then a second write:
```
rewrite_cost(T) = W + W
                = 2W
```
The break-even is where the refresh reads add up to one extra write:
```
W + R * (T / 5) = 2W
R * (T / 5)     = W
T               = 5 * (W / R)
                = 5 * (1.25 / 0.10)
                = 62.5 minutes
```
The exact boundary is a little stair-stepped in practice, because you refresh in 5-minute chunks rather than in continuous time. That doesn’t change the rule though because below about an hour, refreshing always wins. Past an hour, it’s no longer efficient to keep paying the keepalive tax.
## What cancels out[](https://skids.dev/blog/anthropic-cache-tokenomics/#what-cancels-out)
I expected the answer to depend on the model or the text size, but surprisingly it doesn’t. Both sides of the comparison scale with the model’s base input price and the number of cached tokens. A bigger prefix makes both strategies more expensive and Opus makes both strategies more expensive than Sonnet, but when you divide the write price by the refresh price, all of that disappears:
```
W / R = (N * base * 1.25) / (N * base * 0.10)
      = 1.25 / 0.10
      = 12.5
```
That is why the 62.5 minute timing rule is the same for a 5K Sonnet prefix and a 500K Opus prefix, but the _dollar damage_ from choosing suboptimally changes between the two models.
For a 100K prefix on Opus 4.7 and Sonnet 4.6, both pairs land on the same x-axis:
The Opus lines sit higher because Opus costs more per token, but the crossover time is identical.
## The cache footguns[](https://skids.dev/blog/anthropic-cache-tokenomics/#the-cache-footguns)
The 62.5-minute rule was the thing I wanted, but it wasn’t the only useful number on the pricing page.
**Opus 4.7 can use up to 35% more tokens for the same fixed text.** Anthropic calls this out in a note under the model pricing table: Opus 4.7 uses a new tokenizer, and the same text may become up to 35% larger in token terms. If you move a cached prompt from Opus 4.6 to 4.7, don’t assume the old token count still holds. A 100K-token prefix could become 135K tokens, and every cache write/read calculation moves with it. Run the prompt through Anthropic’s [token counting endpoint](https://platform.claude.com/docs/en/build-with-claude/token-counting) before you move anything expensive.
**Small prefixes don’t cache.** Opus 4.5, 4.6, and 4.7 need at least 4,096 cacheable tokens. Sonnet 4.6 needs 1,024. If your prefix is under the floor, the API does not throw a helpful error. It just processes the request without caching it. The only reliable signal is the usage block: if `cache_creation_input_tokens` and `cache_read_input_tokens` stay at 0, your cache isn’t doing anything.
**The lookback window is 20 blocks.** Each cache breakpoint can scan backward through 20 content blocks looking for a prior write. If your agent adds more than 20 blocks between cache hits, the cache entry you wanted can fall outside the search window. I hit this once and assumed some field in the request was invalidating the cache. I had 23 blocks in a request, and the system stopped looking at block 20. The [explicit breakpoint docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#explicit-cache-breakpoints) show the fix: add another breakpoint earlier in the prefix before you need it.
## The dollars are small until they aren’t[](https://skids.dev/blog/anthropic-cache-tokenomics/#the-dollars-are-small-until-they-arent)
The ratio is model-independent, but the bill is very much model specific. On Opus 4.7, one cycle is: write the cache once, go idle for `T` minutes, then make the next real request.
| Prefix size | Strategy | T = 5 min | T = 30 min | T = 60 min | T = 90 min |
| --- | --- | --- | --- | --- | --- |
| 50K tokens | refresh + read at T | $0.338 | $0.463 | $0.613 | $0.763 |
| 50K tokens | rewrite at T | $0.625 | $0.625 | $0.625 | $0.625 |
| 100K tokens | refresh + read at T | $0.675 | $0.925 | $1.225 | $1.525 |
| 100K tokens | rewrite at T | $1.250 | $1.250 | $1.250 | $1.250 |
| 500K tokens | refresh + read at T | $3.375 | $4.625 | $6.125 | $7.625 |
| 500K tokens | rewrite at T | $6.250 | $6.250 | $6.250 | $6.250 |
At 30 minutes, keeping a 500K Opus prefix warm saves $1.625. At 60 minutes, it saves only $0.125. At 90 minutes, refreshing has become the wrong choice and costs $1.375 more than letting the cache expire. The savings are largest on shorter idle gaps and larger prefixes. Right before the crossover, there is barely any money left to save.
## Compaction is not a free lunch[](https://skids.dev/blog/anthropic-cache-tokenomics/#compaction-is-not-a-free-lunch)
The other thing agents do is compact context: take the growing transcript, ask the model to summarise it, and continue from the summary instead of the original. Claude Code, OpenCode, etc all have a `/compact` command - and almost all agents do it automatically at certain points too when you’re nearing the context limit.
Say the conversation has `N` cached input tokens and the summary has `S` tokens. Compacting costs three things:
*   read the old `N` tokens from cache: `N * R`
*   generate `S` output tokens at 5x base: `S * 5B`
*   write the new `S`-token prefix back to cache: `S * W`
After that, each future turn reads `S` cached tokens instead of `N`, saving `(N - S) * R` per turn. The break-even number of future turns is:
```
break_even_turns = (N + 62.5*S) / (N - S)
                 = (1 + 62.5*r) / (1 - r), where r = S/N
```
Again, the absolute context size cancels, only the compression ratio matters.
That curve, `(1 + 62.5r) / (1 - r)`, looks like this:
The rule of thumb is roughly 10:1. If you can turn 100K tokens into a 10K-token summary and you expect at least eight more turns, compaction pays for itself on token cost alone. At 20:1, it pays back in about four turns. At 5:1, you need about 17 future turns. At 2:1, you need about 65 turns, which is not a compaction strategy so much as a very expensive tl;dr.
The output price is why the curve gets ugly. Cache reads are cheap, summary tokens are output tokens, and output is 5x base. A verbose summary can be a strict loss even if it technically reduces the prompt.
There is also a quality cost that the numbers don’t show. A compaction that drops the exact error message, branch name, or failed hypothesis from ten turns ago might save a few cents and then risk the agent having to rediscover the same thing again.
## Where the shortcut lies[](https://skids.dev/blog/anthropic-cache-tokenomics/#where-the-shortcut-lies)
The 62.5-minute rule assumes you will actually make another request. If 30% of sessions ask one question and leave, your expected-value math changes, and the right answer may be not caching at all. Interactive coding agents are usually on the other side of that line.
It also assumes the prefix is really cached. Check `cache_creation_input_tokens` and `cache_read_input_tokens` before trusting your own instrumentation. A cache below the minimum token floor, or a cache entry outside the 20-block lookback window, is not a cache. It’s just a more expensive prompt with wishful thinking attached.