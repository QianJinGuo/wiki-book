---
source: newsletter
source_url: "https://sebastianraschka.com/blog/2026/openai-astra-looped-transformers.html"
ingested: 2026-09-05
sha256: 47461b41aeee3af40feb67352cc3a6d37a70422cdbb99eed97a9084c79c9d40f
---

# OpenAI Astra and Looped Transformers | Sebastian Raschka, PhD

A lot of hype around OpenAI’s Astra model being a “recurrent depth or looped transformer”. Let’s debunk this a bit.
About 2 months ago, I shared the architecture details of Nanbeige, for example, where “Nanbeige4.2-3B is pretrained from scratch on 28T tokens with a Looped Transformer that reuses the layer stack to increase capacity without adding parameters.”
Yes, that’s it. The looped transformer idea is just reusing layers in the transformer block.
In the case of Nanbeige, the main idea is to reuse the same 22-layer stack (=transformer block) twice instead of once. So, effectively it extends the 22-layer architecture to 44 layers, but without duplicating the weights.
In simple terms, this roughly doubles the size of the model (if we ignore the embedding and output layers for a second). But instead of requiring 2x the storage and RAM to host this model, it stays at the same size since we reuse the components. However, it’s almost 2x as expensive in terms of compute, because we run the embedded text through almost 2x as many layers.
Why? In the Nanbeige 4.2 technical report, the researchers found that two passes gave the best trade-off and retained about 75% of the token efficiency of a standard architecture. (More passes gave barely any gains but made the training much slower and much more expensive.)
While, as far as I know, Nanbeige 4.2 is the first notable open-weight model that adopted this approach, the idea goes back to the NeurIPS paper “Mixture-of-recursions: Learning dynamic recursive depths for adaptive token-level computation”. Actually, this paper proposes a mechanism that is a bit more sophisticated by adding a learned router that determines whether each token receives one, two, or more passes. So, easy tokens can exit early while harder tokens receive additional computation.
In sum, Astra may be a really good model, but this shouldn’t be about this “looped transformer aspect,” which is just a tiny architectural tweak.
Also, the statement “the new technique works in a way that obscures some or all of the AI’s reasoning, otherwise known as ‘chain-of-thought’” is not necessarily true with respect to the looped transformer method. It’s possible that The Information journalist refers to some other technique or misunderstood the looped transformer method.
Reusing layers does not by itself suppress visible chain of thought. It adds computation in hidden states before the next token is emitted, just as ordinary transformer layers do.
But based on the information we have, the only plausible interpretation here is that if a model uses more of these recurrent passes, it may need to generate fewer intermediate reasoning tokens. So then more of its computation happens in latent activations that cannot be read as text. But we would get the same effect if we were scaling up the model size, like GPT 5.6 Luna -> GPT 5.6 Sol.
Figure 1. Reports about OpenAI Astra's recurrent depth, the Nanbeige 4.2 looped transformer, and token-level routing in Mixture-of-Recursions.
For a video walkthrough of recurrent depth and looped transformers, see my explainer below.
