---

title: "Gemini 3.5 Flash: more expensive, but Google plan to use it for everything"
type: raw
source: newsletter
source_url: https://simonwillison.net/2026/May/19/gemini-35-flash/
ingested: 2026-05-20
sha256: 6d9e73485a08c3f5

---
Title: Gemini 3.5 Flash: more expensive, but Google plan to use it for everything
URL Source: https://simonwillison.net/2026/May/19/gemini-35-flash/
Published Time: Wed, 20 May 2026 08:46:36 GMT
Markdown Content:
19th May 2026
Today at Google I/O, Google [released Gemini 3.5 Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/). This one skipped the `-preview` modifier and went straight to general availability, and Google appear to be using it for a whole lot of their key products:
> 3.5 Flash is available today to billions of people globally:
> 
> 
> *   For everyone via the Gemini app and AI Mode in [Google Search](https://blog.google/products-and-platforms/products/search/search-io-2026)
> *   For developers in our agent-first development platform Google Antigravity and Gemini API in Google AI Studio and Android Studio
> *   For enterprises in Gemini Enterprise Agent Platform and Gemini Enterprise.
As usual with Gemini, the most interesting details are tucked away in the [What’s new in Gemini 3.5 Flash](https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.5) developer documentation. It mostly has the same set of platform features as the previous Gemini 3.x series, albeit with no [computer use](https://ai.google.dev/gemini-api/docs/computer-use). The model ID is `gemini-3.5-flash`. The knowledge cut-off is January 2025, and it supports 1,048,576 input tokens and 65,536 maximum output tokens.
Google are also pushing a new [Interactions API](https://ai.google.dev/gemini-api/docs/interactions), currently in beta, which looks to me like their version of the patterns introduced by [OpenAI Responses](https://developers.openai.com/api/reference/responses/overview)—in particular server-side history management.
#### The price has gone up[#](https://simonwillison.net/2026/May/19/gemini-35-flash/#the-price-has-gone-up)
Gemini 3.5 Flash is accompanied by a notable price bump. The previous models in the “Flash” family were [Gemini 3 Flash Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview) and [Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite). The new 3.5 Flash is 3x the price of 3 Flash Preview and 6x the price of 3.1 Flash-Lite (see [price comparison here](https://www.llm-prices.com/#sel=gemini-3-flash-preview%2Cgemini-3.5-flash%2Cgemini-3.1-flash-lite-preview)).
At $1.50/million input and $9/million output it’s getting close in price to Google’s Gemini 3.1 Pro, which is $2 and $12.
The Gemini team promise that 3.5 Pro will roll out “next month”—presumably at an even higher price.
This fits a trend: OpenAI’s GPT-5.5 was 2x the price of GPT-5.4, and Claude Opus 4.7 is around 1.46x the price of 4.6 when you take the [new tokenizer into account](https://simonwillison.net/2026/Apr/20/claude-token-counts/).
Given the price increase it’s interesting to see Google roll it out for so many of their own free-to-consumer products. It feels like all three of the major AI labs are starting to probe the price tolerance of their API customers.
Artificial Analysis publish the cost to run their proprietary benchmark against models, which is a useful way to take things like tokenization and increased volume of reasoning tokens into account. Some numbers worth comparing:
*   [Gemini 3.5 Flash (high)](https://artificialanalysis.ai/models/gemini-3-5-flash): $1,551.60
*   [Gemini 3.1 Pro Preview](https://artificialanalysis.ai/models/gemini-3-1-pro-preview): $892.28
*   [Gemini 3 Flash Preview (Reasoning)](https://artificialanalysis.ai/models/gemini-3-flash-reasoning): $278.26
*   [Gemini 3.1 Flash-Lite Preview](https://artificialanalysis.ai/models/gemini-3-1-flash-lite-preview): $93.60
Running the benchmark for 3.5 Flash (high) cost significantly more than 3.1 Pro Preview!
Here are some numbers from other vendors:
*   [Claude Opus 4.7 (Adaptive Reasoning, Max Effort)](https://artificialanalysis.ai/models/claude-opus-4-7): $5,117.14
*   [Claude Opus 4.7 (Non-reasoning, High Effort)](https://artificialanalysis.ai/models/claude-opus-4-7-non-reasoning): $1,217.23
*   [GPT-5.5 (xhigh)](https://artificialanalysis.ai/models/gpt-5-5): $3,357.00
*   [GPT-5.5 (medium)](https://artificialanalysis.ai/models/gpt-5-5-medium): $1,199.14
#### A pelican on a bicycle[#](https://simonwillison.net/2026/May/19/gemini-35-flash/#a-pelican-on-a-bicycle)
I ran “Generate an SVG of a pelican riding a bicycle” [against the Gemini API](https://gist.github.com/simonw/09cc5a5545d7e75b33b75ffa92a34601) and got back this pelican, which is a _lot_:
![Image 1: Black background, bats in the sky against a stylized moon. Pelican is funky looking. Very good beak. Bicycle frame is a bit twisted, and the bar from pedals to back wheel is missing. Bike lamp illuminates the road in front. Quite stylish.](https://static.simonwillison.net/static/2026/gemini-3.5-flash.png)
From the code comments: `<!-- Pelican Eye / Sunglasses (Cool Retro Aviators) -->`
[hedgehog on Hacker News](https://news.ycombinator.com/item?id=48196570#48198275):
> That pelican looks like it’s in Miami for a crypto conference.
That one cost me 11 input tokens and 14,403 output tokens, for a total cost of [just under 13 cents](https://www.llm-prices.com/#it=11&ot=14403&sel=gemini-3.5-flash).