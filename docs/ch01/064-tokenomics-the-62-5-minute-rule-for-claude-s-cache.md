# Tokenomics: the 62.5-minute rule for Claude's cache

## Ch01.064 Tokenomics: the 62.5-minute rule for Claude's cache

> 📊 Level ⭐ | 7.9KB | `entities/anthropic_cache_tokenomics.md`

# Tokenomics: the 62.5-minute rule for Claude's cache

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/anthropic_cache_tokenomics.md)

## 摘要

Anthropic's prompt-cache pricing collapses to a single model- and size-independent decision rule: if you expect to need a cached prefix again within **62.5 minutes**, keep it warm with cheap keep-alive reads; otherwise let it expire and pay the full rewrite later. The number is universal because the write-to-read price ratio (1.25x / 0.10x = 12.5) cancels out both the base token price and the prefix size.

## 核心要点

- **The 62.5-minute break-even:** a 5-min cache write costs 1.25x base input, a cache read/refresh costs 0.10x; refresh reads add up to one extra write at exactly 62.5 minutes of idle time.
- **Model-independent, money-dependent:** the ratio W/R = 12.5 means the crossover is identical for a 5K-token Haiku prefix and a 500K-token Opus prefix — only the dollar damage of a wrong choice differs.
- **Cache hit = cache refresh:** a read that hits a live cache resets the TTL to 5 minutes, so a tiny prefix-only "ping" request is the standard way to keep a cache warm.
- **Read is the keep-alive tax:** keeping a cache alive T minutes costs W + R·floor(T/5); past ~1 hour it is no longer efficient.
- **Opus 4.7 tokenizer trap:** the same text can grow up to 35% in tokens, silently shifting every cache cost when migrating cached prompts from 4.6 to 4.7.
- **Three cache footguns:** small prefixes don't cache (Opus ≥4,096 cacheable tokens, Sonnet ≥1,024, with no error thrown), and each breakpoint only scans back 20 content blocks.
- **Compaction is not free:** compressing N tokens to S costs reads + 5x output generation + a rewrite; payback needs roughly 8 more turns at a 10:1 ratio.

## 深度分析

### The derivation hides in the ratio, not the prices

The whole rule flows from how Anthropic prices caching: a 5-minute cache write is a flat **1.25x** multiplier on the base input price, a 1-hour write is **2x**, and a cache read — which doubles as a refresh — is **0.10x**. These multipliers are shared by every model, so a 100K-token prefix on Opus 4.7 costs $0.625 to write and $0.05 to read-and-refresh. Keeping the cache warm for T minutes costs `W + R·floor(T/5)` (one write, then a read every 5 minutes), while letting it die and rewriting later costs `2W`. Setting the two equal gives `T = 5·(W/R) = 5·(1.25/0.10) = 62.5` minutes.

What makes the number feel counterintuitive is that it survives every scaling you'd expect to break it. Write `W = N·base·1.25` and read `R = N·base·0.10`; both `N` (the prefix size) and `base` (the model's input price) factor out of `W/R`, leaving the fixed 12.5. So a 500K-token Opus prefix and a 5K-token Haiku prefix share the same crossover — the Opus decision is just far more expensive to get wrong. The boundary is slightly stair-stepped in practice because refreshes happen in discrete 5-minute chunks, but the qualitative rule holds: below about an hour, refreshing always wins.

### Where the dollars actually bite

The ratio is universal, but the bill is not. On Opus 4.7 the refresh-versus-rewrite spread shrinks dramatically as idle time grows: keeping a 500K-token prefix warm saves $1.625 at 30 minutes, only $0.125 at 60 minutes, and by 90 minutes refreshing has flipped to a $1.375 loss versus just rewriting. The takeaway is that the biggest savings live on short idle gaps and large prefixes — right before the crossover there is almost no money left to save, which is exactly when a keep-alive habit quietly becomes a money-loser.

### Compaction and the hidden costs of "saving" tokens

Context compaction — summarizing an N-token transcript into an S-token summary and continuing from it — is the other lever agents pull, and it is not a free lunch. It costs: reading the old N tokens from cache (`N·R`), generating the S summary tokens at output price (`S·5B`), and writing the new S-token prefix back (`S·W`). Each future turn then saves `(N−S)·R`. The break-even in future turns is `(1 + 62.5r)/(1 − r)` where `r = S/N`; only the compression ratio matters, and the rule of thumb is roughly 10:1 (payback in ~8 turns) or 20:1 (~4 turns). Below about 5:1 the economics degrade fast, and at 2:1 you need ~65 turns — "not a compaction strategy so much as a very expensive tl;dr." The output price is the culprit: summary tokens bill at 5x base, so a verbose summary can be a strict loss even when it technically shrinks the prompt. There is also a quality cost the math can't see — a compaction that drops a branch name or a failed hypothesis from ten turns ago saves pennies and risks re-discovery.

### The assumptions that quietly break the rule

The 62.5-minute rule presumes you will actually make another request against that prefix. If a meaningful share of sessions ask one question and leave, expected-value math shifts toward not caching at all — interactive coding agents usually sit on the safe side of that line. The rule also presumes the cache is genuinely live: a prefix below the per-model minimum token floor, or a cache entry that has slipped outside the 20-block lookback window, is not a cache but "a more expensive prompt with wishful thinking attached." The only trustworthy signal is the usage block — if `cache_creation_input_tokens` and `cache_read_input_tokens` stay at 0, caching is silently doing nothing.

## 实践启示

1. **Apply the 62.5-minute rule as a gate, not a timer:** before keeping any cache warm, ask whether the next real request is likely within ~1 hour; if not, let it expire and pay the rewrite.
2. **Watch the token flow first:** chronic 400K–500K-context sessions that rewrite the full prefix too often are the most common silent waste — track write frequency before tuning anything else.
3. **Always verify the cache is actually engaging:** check `cache_creation_input_tokens` / `cache_read_input_tokens`; a prefix under the 4,096/1,024-token floor or past the 20-block lookback fails silently with no error.
4. **Re-count tokens on cross-model migration:** Opus 4.7's tokenizer can inflate a cached prompt up to 35% (100K → 135K), so re-run Anthropic's token-counting endpoint before moving anything expensive.
5. **Treat compaction as a ratio play:** only compress when the summary ratio is strong (~10:1) and enough future turns remain to amortize the output-token cost; a verbose summary at 2:1 is a net loss.
6. **Let the keep-alive tax go when idle time grows:** on large prefixes (e.g., 500K) past the crossover, refreshing costs more than rewriting — terminate the cache rather than pay it.

## 相关实体

- [同源姊妹篇：62.5 分钟规则](ch01/1212-claude.html)
- [Claude Code 提示缓存实战](ch01/401-anthropic-prompt-caching-claude-code.html)
- [Amazon Bedrock 提示缓存策略](../ch11/069-amazon-bedrock-claude-prompt-cache.html)
- [编码代理的提示缓存](../ch09/055-coding-agent.html)
- [Harness 提示缓存](../ch05/077-harness.html)
- [Claude Opus 4.7](ch01/1212-claude.html)
- [Harness token 成本对比](../ch03/085-claude-code.html)
- [上下文压缩](../ch03/037-agent.html)

---

