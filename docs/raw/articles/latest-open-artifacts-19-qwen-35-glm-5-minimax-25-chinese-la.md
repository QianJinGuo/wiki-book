---
source: rss
source_url: https://www.interconnects.ai/p/latest-open-artifacts-19-qwen-35
ingested: 2026-06-07
feed_name: Interconnects
source_published: 2026-03-03
sha256: 90a80378be6c1c52f9c8dc1085508701a16c5ba9d501c1c92761b6ba26bc99e9
---

# Latest open artifacts (#19): Qwen 3.5, GLM 5, MiniMax 2.5 — Chinese labs' latest push of the frontier

It’s been a busy month at the top end of open-weights AI — with new flagship models from all of Qwen, MiniMax, Z.ai, Ant Ling, and StepFun. Still, all eyes are on DeepSeek V4’s pending release, which rumors continue to accelerate towards. Outside of the large, frontier models, this issue is a bit lighter on the long-tail of niche modalities and model sizes.

[Share](<https://www.interconnects.ai/p/latest-open-artifacts-19-qwen-35?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

With all these new releases, we’re tracking them with our new [Relative Adoption Metrics (RAM)](<https://atomproject.ai/relative-adoption-metric>), a measurement tool that normalizes model downloads relative to peer models in their size class. This has already been an extremely useful tool for us, highlighting underrated models like GPT-OSS, which is literally off the charts in how downloaded it is — the most popular American open-weights model since Llama 3.1. A RAM score >1 means the model is on track to be a top 10 all-time downloaded model in its size class. We’re particularly interested to see how the early adoption of the smaller Qwen 3.5 dense models will go relative to Qwen 3 — balancing Qwen’s ever growing brand with a trickier, hybrid model architecture that can push the limits of some open-source tools.

A summary of the RAM scores for some of the popular models released late in 2025 is below, highlighting Kimi K2 Thinking and some OCR models as clear winners. DeepSeek V3.2, and their other recent large models, have wildly underperformed DeepSeek’s earlier releases in 2025.

[](<https://substackcdn.com/image/fetch/$s_!eppK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F726fcde9-2645-4c77-9779-03882beb295b_2554x1414.png>)The time here is days since release.

# Artifacts Log

### Our Picks

  * **[Qwen3.5-397B-A17B](<https://huggingface.co/Qwen/Qwen3.5-397B-A17B>)** by [Qwen](<https://huggingface.co/Qwen>): The long-awaited update to Qwen is finally here. It comes in various sizes from 0.8B to 27B (dense) and 35B-A3B to 397B-A17B (MoE), some of them even with base models. All of them are multi-modal, use reasoning by default and are based on the Qwen-Next architecture with GDN layers.  


We tested these models over the last few days, and they are a clear upgrade over the previous version: There are a lot of substantial improvements across the board, making them perfect workhorses for a wide range of tasks.  
Their style and instruction-following have improved, and the models are even better at multilingual tasks, covering more languages.  
  
However, at least the small models (still) tend to overthink. You can turn off reasoning by disabling it in the chat template.

[](<https://substackcdn.com/image/fetch/$s_!E9hc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F979b5a61-90d3-413e-a2ab-55215d8d3541_17277x8176.png>)

  * **[Step-3.5-Flash](<https://huggingface.co/stepfun-ai/Step-3.5-Flash>)** by [stepfun-ai](<https://huggingface.co/stepfun-ai>): StepFun really stepped up its game (no pun intended), releasing a 196B-A11B MoE with strong metrics across the board. It is especially strong in math benchmarks, beating out models that are several times larger than it.

  * **[GLM-5](<https://huggingface.co/zai-org/GLM-5>)** by [zai-org](<https://huggingface.co/zai-org>): A 744B-A40B release from the Zhipu team, which has resulted in such a big increase in demand that they [raised prices](<https://www.reuters.com/technology/chinese-ai-startup-zhipu-hikes-prices-coding-plan-demand-rises-2026-02-12/>) for their coding plan. It also comes with an [accompanying tech report](<https://arxiv.org/abs/2602.15763>).

  * **[MiniMax-M2.5](<https://huggingface.co/MiniMaxAI/MiniMax-M2.5>)** by [MiniMaxAI](<https://huggingface.co/MiniMaxAI>): Despite the relatively small size, Minimax-M2.5 can rival models such as GLM-5 and Kimi K2.5 and has quickly become one of the favorites of the community.

[](<https://substackcdn.com/image/fetch/$s_!oDwH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbf043d8f-881e-4132-a606-99a25f9b5305_1280x617.png>)

  * **[OpenThinker-Agent-v1](<https://huggingface.co/open-thoughts/OpenThinker-Agent-v1>)** by [open-thoughts](<https://huggingface.co/open-thoughts>): OpenThinkers, known for their open reasoning releases (such as [OpenThoughts 3](<https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M>)) are now tackling agentic reasoning. Their initial release includes [SFT](<https://huggingface.co/open-thoughts/OpenThinker-Agent-v1-SFT>) and [RL](<https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-RL>) data, as well as a “lite” [version](<https://huggingface.co/datasets/open-thoughts/OpenThoughts-TBLite>) of terminal-based tasks to evaluate smaller models.




The subtle differences in architecture of these models are covered in detail in the similar, more technically focused, round-up from  — it’s a good complement if you’re looking to go deeper: 

[Ahead of AIA Dream of Spring for Open-Weight LLMs: 10 Architectures from Jan-Feb 2026If you have struggled a bit to keep up with open-weight model releases this month, this article should catch you up on the main themes…Read more3 months ago · 150 likes · 7 comments · Sebastian Raschka, PhD](<https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight?utm_source=substack&utm_campaign=post_embed&utm_medium=web>)

### Models

#### General Purpose

  * **[Tri-21B-Think](<https://huggingface.co/trillionlabs/Tri-21B-Think>)** by [trillionlabs](<https://huggingface.co/trillionlabs>): The Korean Trillion Labs is a repeated guest at the Artifacts series. This time, they are releasing a 21B reasoning model with support for English, Korean and Japanese.

  * **[MiniCPM-SALA](<https://huggingface.co/openbmb/MiniCPM-SALA>)** by [openbmb](<https://huggingface.co/openbmb>): An English and Chinese 8B model with sparse attention, supporting a 1M context window.




[ Read more ](<https://www.interconnects.ai/p/latest-open-artifacts-19-qwen-35>)
