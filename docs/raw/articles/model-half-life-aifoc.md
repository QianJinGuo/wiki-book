---
title: model half-life
type: source
source: newsletter
source_url: https://aifoc.us/model-half-life/
sha256: 64979f43616f
created: 2026-05-21
updated: 2026-05-21
---

# model half-life


Published Time: 2026-05-18T07:00:00+00:00

Markdown Content:
I keep hearing people say that there is a model “half-life” which keeps dropping from years between model releases down to a few months, with the implied assumptions that model releasing will drop to even further. I’ve heard the phrase “model half-life” so much recently that I wanted to actually look at the data.

I made a [TSV of every headline model release](https://aifoc.us/model-drops.tsv) from late 2022 through today across the US frontier labs (OpenAI, Anthropic, Google, xAI, Meta, Mistral) and the major Chinese labs (DeepSeek, Qwen, Zhipu, MiniMax, Moonshot, ByteDance). I split each vendor into the sub-series it actually ships in (Claude Opus is a different line from Claude Sonnet, GPT is a different line from the o-series, Gemini Pro is a different line from Flash). Then I plotted them.

Since I want to re-run this every few months. The initial dataset was compiled by Claude from vendor announcements and the references at the bottom of this post. I am working through it manually to verify dates, and I will correct entries in place when I find errors. If a row looks wrong to you, tell me. The full source list is in the [sources section](https://aifoc.us/model-half-life/#sources) below.

The dashed dots are predictions. For each series I sort drops chronologically, compute the gap in days between each consecutive pair, take the trailing three gaps (or all of them if there are fewer than three), and round the median to the nearest day. I use median rather than mean so a single outlier (a same-week double-drop, or a long unplanned hiatus) does not distort the prediction. Adding that median gap to the most recent release date gives the predicted next drop.

It’s a pretty naive heuristic, but its as follows: A one-drop series gets no prediction. A two-drop series uses its single gap. From three drops up, only the trailing three count, so the prediction tracks _current_ cadence rather than a long-run average. The “predicted next drop per series” table sorts ascending, so anything in the past is overdue, and the dashed segments in the timeline connect each series’s last shipped drop to its predicted next.

On reflection, model halflife really doesnt make much sense and it’s just a bit of a buzzword to mean that models now ship faster. If you look at the release the releases in the charts above you see that things have up-ticked and there is more activitiy but we’re not halving the release time every 6 months…

While it’s fun to predict when a model might be launched, unless we have a lot of data points then the predictions are pretty weak… GPT OSS at the end of 2027??? I mean, maybe…

The data file is at [/model-drops.tsv](https://aifoc.us/model-drops.tsv). If I have got dates or series wrong, file an issue or just tell me.

## Sources

These are the primary references used to compile and verify [/model-drops.tsv](https://aifoc.us/model-drops.tsv). I will keep adding to this list as the dataset is updated.

Vendor announcements and release notes:

*   OpenAI: [news](https://openai.com/news/) and [release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
*   Anthropic: [news](https://www.anthropic.com/news)
*   Google DeepMind: [Google blog AI category](https://blog.google/products/ai/), [Gemini models docs](https://ai.google.dev/gemini-api/docs/models), [DeepMind blog](https://deepmind.google/discover/blog/)
*   xAI: [news](https://x.ai/news)
*   Meta AI: [blog](https://ai.meta.com/blog/), [Llama model cards](https://www.llama.com/)
*   Mistral: [news](https://mistral.ai/news)
*   DeepSeek: [API news](https://api-docs.deepseek.com/news/news)
*   Qwen (Alibaba): [blog](https://qwenlm.github.io/blog/)
*   Zhipu / GLM: [z.ai blog](https://z.ai/blog)
*   MiniMax: [news](https://www.minimax.io/news)
*   Moonshot: [moonshot.cn](https://www.moonshot.cn/)
*   ByteDance Seed: [team page](https://seed.bytedance.com/en/)

Aggregators used for cross-checking dates:

*   [LMArena leaderboard](https://lmarena.ai/leaderboard) (formerly LMSys)
*   [Hugging Face model pages](https://huggingface.co/models)
*   Wikipedia entries for individual model families (good for triangulating announcement vs release dates)

Disclosure: the initial TSV was compiled by Claude. I am verifying it row by row and will correct entries as I go. If you spot an error, please open an issue or message me.

