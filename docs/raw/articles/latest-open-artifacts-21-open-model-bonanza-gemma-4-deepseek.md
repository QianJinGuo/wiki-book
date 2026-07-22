---
source: rss
source_url: https://www.interconnects.ai/p/latest-open-artifacts-21-open-model
ingested: 2026-06-07
feed_name: Interconnects
source_published: 2026-05-16
sha256: 49b1aaab44ac018ea4dd5115175c061986105ce111805b7508a91a447d2a1831
---

# Latest open artifacts (#21): Open model bonanza! Gemma 4, DeepSeek V4, Kimi K2.6, MiMo 2.5, GLM-5.1 & others. On CAISI's V4 assessment.

This month was packed, with all open frontier labs, including DeepSeek, releasing new models. The latter prompted an evaluation by the [Center for AI Standards and Innovation (CAISI)](<https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro>), which has evaluated open models and their risks in the past. Their result is that open models lag behind the American frontier, with the gap becoming wider over time:

[](<https://substackcdn.com/image/fetch/$s_!4DPW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d954e79-7538-48b7-bd3c-c6cd21421329_2800x1856.png>)

For the report, they calculate an Elo score based on [Item Response Theory](<https://en.wikipedia.org/wiki/Item_response_theory>), which is commonly used to compare different models, even when they were tested on a different set of benchmarks. For V4, CAISI used nine different benchmarks:

[](<https://substackcdn.com/image/fetch/$s_!cVg4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F206a5c61-cc5b-423e-8db6-28f5f209291c_1546x1284.png>)

The huge Elo difference is explained by DeepSeek V4s bad score in CTF-Archive-Diamond (which was only run with a subset of the benchmark and extrapolated with IRT for V4), PortBench (a CAISI-private benchmark) and ARC-AGI-2 (with a different scoring method than the public leaderboards). The differences in these benchmark have a huge impact on the overall Elo, which can exacerbate the difference in capabilities. 

When using [Epoch AI’s ECI](<https://epoch.ai/eci>), which also uses IRT over a set of different benchmarks, we see that the gap roughly stays between 3-7 months since R1:

[](<https://substackcdn.com/image/fetch/$s_!qx4F!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F608dea3a-c43c-4bf0-a5c2-f5b9bb7e63d3_2400x1500.png>)The open<>closed gap in ECI (from https://mcnair.center/china/)

However, both CAISI and ECI paint an incomplete picture, as both use standardized (and simple) setups to compare the capabilities of models. To be more concrete: Coding tasks are evaluated using access to bash and a for-loop with a fixed budget of tokens, not with a harness such as Claude Code or OpenCode, which models are trained in! These setups result in benchmarks claiming that porting applications to another language is [currently not possible](<https://programbench.com/>), while [Bun has been ported from Zig to Rust with 1 million LOC changes](<https://github.com/oven-sh/bun/pull/30412>)1.

Therefore, we would argue that a frontier comparison of open and closed models would also need to elicit the capabilities of all models better, which means the usage of the preferred harnesses, as well as model-specific prompting.

This section was written primarily by Florian. An interesting dynamic within Interconnects is that Florian believes more in the proximity of open frontier models to closed alternatives in true performance. Nathan thinks the benchmarks are imperfect as well, but thinks the closed models are ahead by more. We’re going to continue to unpack this in our future content.

[Share](<https://www.interconnects.ai/p/latest-open-artifacts-21-open-model?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### **Our Picks**

  * **[MiMo-V2.5-Pro](<https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro>)** by [XiaomiMiMo](<https://huggingface.co/XiaomiMiMo>): Avid Artifacts readers know that Xiaomi has been working on open models for a while; its debut was [exactly one year ago](<https://www.interconnects.ai/p/latest-open-artifacts-10-new-deepseek>). The progress of its releases is remarkable, with 2.5 Pro (released under Apache 2.0) being neck and neck with other flagship models such as Kimi K2.6 and GLM-5.1 in both benchmarks and [real-world usage](<https://x.com/Designarena/status/2054776484833952000?s=20>).

[](<https://substackcdn.com/image/fetch/$s_!25fp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F34228788-0da1-4aea-840e-5eae68bbfa17_1200x786.jpeg>)

  * **[gemma-4-26B-A4B-it](<https://huggingface.co/google/gemma-4-26B-A4B-it>)** by [google](<https://huggingface.co/google>) (full Interconnects post [here](<https://www.interconnects.ai/p/gemma-4-and-what-makes-an-open-model>)): The long-awaited update to the Gemma series, featuring multiple sizes: [4B](<https://huggingface.co/google/gemma-4-E2B-it>), [9B](<https://huggingface.co/google/gemma-4-E4B-it>), and [31B](<https://huggingface.co/google/gemma-4-31B-it>) dense models, as well as a 26B-A4B MoE. Even more importantly, with Gemma 4, Google has decided to use Apache 2.0 as its license, which removes the uncertainty and legal challenges around interpreting custom licenses.

  * **[Kimi-K2.6](<https://huggingface.co/moonshotai/Kimi-K2.6>)** by [moonshotai](<https://huggingface.co/moonshotai>): An update to the Kimi series, delivering stronger performance across the board and making it one of the best open models out there yet again. They also focus on long-horizon performance, showing that open models are capable of running over hours to complete tasks or optimize performance. Given the focus of everyone to build [autoresearch](<https://github.com/karpathy/autoresearch>)-like systems, seeing open models catch up is important.

[](<https://substackcdn.com/image/fetch/$s_!K_mJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe08af2e3-9ce3-4ace-bec7-e8aecce5e120_10188x6520.webp>)

  * **[Laguna-XS.2](<https://huggingface.co/poolside/Laguna-XS.2>)** by [poolside](<https://huggingface.co/poolside>): Poolside AI has released its first public coding-focused models, including the open-weight XS.2. Its size (33B-A3B) makes it attractive for local use, with performance on par with other models in that size range. The accompanying [blog post](<https://poolside.ai/blog/laguna-a-deeper-dive>) is worth a read, as is [the deep dive](<https://poolside.ai/blog/through-the-looking-glass>) into reward hacking during coding evaluations.

  * **[DeepSeek-V4-Flash](<https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash>)** by [deepseek-ai](<https://huggingface.co/deepseek-ai>): DeepSeek has finally released its successor to the V3 series, which it kept updating for months. It comes in two sizes: Pro, which is a 1.6T-A49B MoE, and Flash, a 284B-13B model. Based on others’ experience, the latter model seems to be the real star of the show, as its performance is relatively strong, while Pro seems to underdeliver relative to its size. The [tech report](<https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf>) goes into great detail, including the architectural changes used to achieve better and cheaper long-context performance.




### **Models**

#### General Purpose

  * **[Qwen3.6-35B-A3B](<https://huggingface.co/Qwen/Qwen3.6-35B-A3B>)** by [Qwen](<https://huggingface.co/Qwen>): An update to the Qwen 3.5 series targeting one of the most widely used sizes.

  * **[LFM2.5-350M](<https://huggingface.co/LiquidAI/LFM2.5-350M>)** by [LiquidAI](<https://huggingface.co/LiquidAI>): With 28T tokens for 350M parameters, this model might be the most overtrained model out there.

  * **[Trinity-Large-Thinking](<https://huggingface.co/arcee-ai/Trinity-Large-Thinking>)** by [arcee-ai](<https://huggingface.co/arcee-ai>): The reasoning version of Trinity, one of the best Western open models. It has topped the OpenRouter charts for a while and can power agentic applications such as OpenClaw.

  * **[GLM-5.1](<https://huggingface.co/zai-org/GLM-5.1>)** by [zai-org](<https://huggingface.co/zai-org>): An update to GLM-5, improving scores across the board. The focus for this update is on long-horizon tasks.




[ Read more ](<https://www.interconnects.ai/p/latest-open-artifacts-21-open-model>)
