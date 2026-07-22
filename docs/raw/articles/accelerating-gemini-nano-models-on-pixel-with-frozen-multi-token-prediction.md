sha256: 233a03ce4ae5ce97030be14168b6ad0ca02d8154704060ce323fecaf90e1db1d
---
title: "Accelerating Gemini Nano models on Pixel with frozen Multi-Token Prediction"
source_url: "https://research.google/blog/accelerating-gemini-nano-models-on-pixel-with-frozen-multi-token-prediction"
type: article
created: 2026-06-30
ingested: 2026-06-30
---

# Accelerating Gemini Nano models on Pixel with frozen Multi-Token Prediction


Markdown Content:
Having powerful Large Language Models (LLMs) right in your pocket is now a reality with on-device models like [Gemini Nano](https://developer.android.com/ai/gemini-nano) and [Gemma](https://deepmind.google/models/gemma/). This technology enables everyday features on your phone — such as instantly summarizing a flurry of notifications or proofreading an important text message — all without sending your private data off device. But to make these features useful for everyday users, they need to happen very efficiently.

Delivering this kind of speed on a mobile device is a significant challenge. Unlike vast server environments, mobile phones operate under a strict energy budget and hard memory (RAM) limits. Furthermore, standard language models generate text "autoregressively" — meaning they process and output just one word (or token) at a time. This step-by-step process creates a bottleneck, underutilizing the phone's processing power while straining its memory bandwidth, which can ultimately slow down the user experience and drain the battery.

To overcome this bottleneck, we are announcing a new architecture that retrofits Multi-Token Prediction (MTP) onto existing, "frozen" Gemini Nano v3 models. Building on prior approaches like the[EAGLE framework](https://arxiv.org/pdf/2401.15077) and [Confident Adaptive Language Modeling](https://research.google/blog/accelerating-text-generation-with-confident-adaptive-language-modeling-calm/) (CALM), we designed new architectural components to maximize these efficiency gains specifically for mobile environments. Our recent announcements highlighted accelerating [Gemma 4 with MTP](https://blog.google/innovation-and-ai/technology/developers-tools/multi-token-prediction-gemma-4/) and making it available to developers.

Today's article tackles the unique, extreme constraints of edge computing. Recently rolled out to the Pixel 9 and 10 series, this approach acts as an out-of-the-box speedup. For users, this means that features like AI Notification Summaries and Proofread generate text significantly faster and with less energy consumption. For developers, it eliminates a major friction point: delivering high-speed on-device AI without the need to fine-tune separate, memory-heavy drafting models for every new task.

## A "late exit" strategy

MTP builds upon the evolution of [speculative decoding](https://research.google/blog/looking-back-at-speculative-decoding/). In a traditional setup, generating _N_ tokens requires _N_ forward passes of the large model. Speculative decoding decouples this process into two parts:

1.   _Draft:_ a smaller, faster approximation model (the "drafter") generates a short sequence of candidate tokens (e.g., 3 tokens).
2.   _Verify:_ a large model (the "verifier") processes these candidates in parallel. If the candidates match what the large model would have predicted, they are accepted. If not, the system rolls back to the first divergence.

However, this results in some inefficiencies. Running a separate "standalone" drafter model (e.g., 128M parameters) competes for limited RAM. Furthermore, a standalone drafter is "blind" to the main model's rich internal state, predicting next tokens based solely on text history without the semantic context the main model has already computed. MTP addresses these inefficiencies by moving from a standalone architecture to an integrated one. Instead of training a separate small language model to draft tokens, we append a lightweight Transformer head, the MTP head, to the final layers of the main model.

This architecture, which uses a deep exit layer for drafting, leverages the work already performed by the main model’s backbone. The MTP head takes the final high-dimensional activations (hidden states) of the main model and uses them to autoregressively predict a sequence of future tokens.

## The frozen backbone advantage

While MTP heads are commonly pre-trained[in tandem with the backbone](https://arxiv.org/pdf/2404.19737) — such as in our recent releases of Gemma 4 models — this is prohibitive when leveraging already-deployed on-device foundation models. Instead, our work focuses on retrofitting the drafter head to operate independently of the pre-training pipeline.

We take a fully trained Gemini Nano v3 model, freeze its weights, and attach a dense transformer stack — the MTP head — to the final layers. We train only these parameters to minimize the prediction error on future tokens. With a frozen backbone, MTP becomes strictly an efficiency optimization, ensuring no degradation in the base model's capabilities or safety alignment.

Because incorrect drafts are discarded during verification, the final output remains bit-for-bit identical to the main model, allowing us to roll out efficiency updates with full backward compatibility.

## Zero-copy architecture

While [standard MTP implementations](https://arxiv.org/pdf/2404.19737) optimize for training efficiency by sharing static parameters (like embedding weights) between the main model and the drafter, on-device inference faces a stricter bottleneck: dynamic memory. Even with shared weights, if a drafter processes context independently, it incurs a "double tax" on memory by generating and maintaining its own [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) (KV) cache. Given the limited memory on mobile, avoiding this redundancy is critical.

To solve this, we engineered a zero-copy architecture where the MTP head effectively leverages the main model's state. Instead of maintaining its own history, the MTP head is designed to cross-attend directly to the main model’s frozen KV cache. This allows the drafter to query the "memories" and context already computed by the backbone without duplication.

This design yields two efficiency gains. First, it eliminates drafter prefill latency: by utilizing the existing cache, the head requires no additional time to process the prompt. Second, it reduces the runtime memory footprint. We observed savings of 130MB per instance compared to a standalone drafter by saving drafter embedding lookup tables, prefill dot attention variants, and application specific tuning parameters.

## Unlocking richer representations

In our experiments, we found that MTP drafters consistently produce more accurate token predictions, which results in speedups on Pixel 9 devices of 50% or more[aef552], depending on the task, compared to "standalone drafters" of comparable parameter counts.

This performance gap stems from MTP’s access to richer representations. Unlike standalone drafters that treat the main model as a black box, the MTP head directly utilizes final activations already processed by the larger backbone:

*   _Instruction following:_ In tasks like summarization or rewriting with complex constraints, MTP significantly outperformed standalone fine-tuned drafters.
*   _Predictable text structures:_ For tasks with high structural predictability (e.g., smart replies), the MTP head effectively learned the syntactic patterns of the main model, achieving up to a 55% improvement in token acceptance.

## Real-world impact

For the deployment of MTP on Pixel 9 and 10 devices, we redesigned the on-device inference stack to handle the complex dependency between the verification and drafting phases.

The results validated the architectural choices. In production workloads, such as AI Notification Summaries and Proofread, MTP correctly predicts an average of nearly two additional tokens per inference pass. Furthermore, fewer verification steps mean less time waking heavy processors, reducing energy consumption and improving battery life.

### Future directions

We look forward to integrating MTP on future Pixel devices, as well as exploring alternative architectures — including parallel decoding and paradigms without auxiliary heads — to further drive down draft latency and increase simultaneous token verification under strict mobile constraints.

We are also investigating ways to handle the inherent ambiguity of language generation more efficiently. While standard speculative decoding assumes a single best future path, we are developing techniques that allow the model to explore branching possibilities in parallel. This aims to maximize the probability of accepting long sequences even in uncertain contexts. Furthermore, we are studying verification leniency: relaxing the strict exact token match between draft and verification for specific use cases to bring further efficiencies to the edge.

## Acknowledgements

_This work is part of our efforts for optimizing on-device LLM efficiency, with Filippo Galgani, Omri Homburger, Pooja Consul, Matthew Markwell, and Vivek Kumar. Certain elements were built on developments from the Gemini team in Google DeepMind: Tal Schuster, Ziwei ji, Ivan Korotkov, and Ganesh Jawahar. We’d also like to extend a big thank you for reviews and valuable feedback and support to Nadav Bar, Utku Evci, Nir Shabat, Joe Zou, and teams in Google Research, Google Deepmind, and Platforms & Devices._

