---
source_url: "https://huggingface.co/blog/LiquidAI/lfm2-5-encoders"
ingested: 2026-07-31
sha256: 6d36ba1d93d5766cb8f540bb9849ed6c178904716c998da54cf49e47ef0a1031
source_published: 2026-07-28
---

# LFM2.5-Encoders for Fast Long-Context Inference on CPU

. They match the quality of larger models but stay fast as inputs get longer. This means you can run document-scale jobs on the hardware you already have, even on CPU.

match or beat larger encoders on GLUE, SuperGLUE, and multilingual tasks.

With these, you can build intent routers, policy linters, PII detectors, and text classifiers that run cheaply, all day. See the live demos below.

, built for multilingual search. LFM2.5-Encoders come from the same family but serve a broader purpose. They're pre-trained with a masked-language objective, so you can fine-tune them for classification, token-level tasks, and search alike. Search is just one thing an encoder enables. That's why we built a general-purpose model instead of reusing the retrievers.

Encoders power many modern production NLP applications: classifiers, intent routers, safety filters. These jobs run all day, usually on CPU, on ever-longer inputs.

pushed its accuracy, speed, and context further. LFM2.5-Encoders take the next step on the LFM2 architecture, where cost grows slowly as inputs grow.

We initialize the encoders from their respective LFM2 decoder backbones:

. Then we turn each causal decoder into a bidirectional encoder with a few changes:

each token now sees the tokens on both sides, not just the ones before it.

we pad them symmetrically so each token's convolution mixes in its neighbors on both sides.

: a short-context masked-language objective on a large web corpus at a 1,024-token context.

: extending context to 8,192 tokens on the full data mix, strengthening factual, legal, and multilingual competence.

We fine-tune each model fully on every task and report the resulting score. Across the table, that's 14 models on 17 tasks pulled from GLUE, SuperGLUE, and multilingual classification.

We report the mean across five held-out seeds, so the numbers are stable run to run. The full framework and raw results are

LFM2.5-Encoder-350M ranks fourth of the 14 models. The three ahead of it are all larger, including a 3.5B model nearly 10 times its size. LFM2.5-Encoder-230M beats

model, while being smaller than most of them. Both also score well above our own LFM2.5-Retrievers here.

Our encoders inherit the LFM2 backbone's fast inference. Since both our encoders and ModernBERT support an 8,192-token context, we measure speed across the full range.

Our encoders show their biggest edge on CPU. Here, LFM2.5-Encoder-230M is the fastest at every sequence length (even faster than the smaller ModernBERT-base for short inputs). With increasing input length, throughput decreases sharply for ModernBERT, while our LFM2.5-Encoders rise into the mid-range before tapering. At 8,192 tokens, ModernBERT-base takes over a minute and a half per forward pass versus about 28s for LFM2.5-Encoder-230M. This is about 3.7x faster. For developers, that means you can scan or classify a full contract, transcript, or long support thread in under 30 seconds on a laptop CPU.

On GPU, a similar pattern holds with a smaller margin: ModernBERT-base leads below ~1K tokens on the Apple GPU. Our encoders take the lead from about 2K tokens. This shows that for long inputs, LFM2.5-Encoders are the faster choice, and if you're running on CPU, dramatically so.

We built the demos below from fine-tuned LFM2.5-Encoders. Each one runs in a CPU-only Hugging Face space:

: define your own routing lanes as free text. The model scores the whole prompt against every lane in one pass.

: check text against your company's rules, written as free text. It scores every token against every rule in one pass.

spot and remove 40 kinds of personal information across 16 languages.

(bonus): run the encoder as a chatbot that generates text by iteratively unmasking instead of left to right.

Reach for an LFM2.5-Encoder when you have a high-volume understanding task, such as classification, routing, extraction, or scoring, that runs constantly and has to stay cheap and fast. For jobs like these, a fine-tuned encoder is smaller, faster, and far cheaper to run than a generative LLM, and it fits on the CPUs you already have.

. Then run it directly for masked-token prediction, or attach your own head and fine-tune it for your task.

tok = AutoTokenizer.from_pretrained(model_id, trust_remote_code=

mlm = AutoModelForMaskedLM.from_pretrained(model_id, trust_remote_code=

For downstream tasks, load the encoder body and attach your own head (classification, token classification, regression, retrieval):

body = AutoModel.from_pretrained(model_id, trust_remote_code=

If your GPU supports it, use Flash Attention 2 for the highest efficiency:

A base encoder gives you general-purpose representations, not task outputs. So you fine-tune it for each task. Our

walks through fine-tuning on long legal documents with an 8k context.

Both encoders are open-weight and available on Hugging Face today:

title = {LFM2.5-Encoders: Fast at Long Context, Even on CPU},

BERT: Pre-training of Deep Bidirectional Transformers for Language

Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for

Fast, Memory Efficient, and Long Context Finetuning and Inference

The CPU plot doesn't say what CPU. Was the 28s at 8k a single sequence on Apple silicon, or a many core x86 part? It matters for the use case you're describing, because \"scan a contract\" in practice means scan forty thousand of them.</p>\n<p>trust_remote_code=True is the other thing. There's no ORT or OpenVINO path yet, so anyone following this post is on PyTorch eager on CPU, and I'd bet a decent chunk of that 28s is eager mode rather than the architecture. Any plans for int8 or ONNX exports? That's what people serving these all day are going to need.</p>\n<p>We run bare metal EPYC behind Firecracker microVMs at Tenki. I can run encoder_eval and your latency sweep at 16, 64 and 128 vCPU and post the numbers. Seems worth knowing either way whether \"the hardware you already have\" means a laptop or a server.</p>\n<p>Separate note: the policy linting demo is the one I'd pay for. Right now there's nowhere good to put a guardrail that runs on CPU inside the same sandbox as the agent, so it either goes out to an API or doesn't happen.</p>\n","updatedAt":"2026-07-28T17:52:49.412Z","author":{"_id":"6a68e29c0991ef17b8fa18c4","avatarUrl":"https://cdn-avatars.huggingface.co/v1/production/uploads/noauth/fYuZA0evj6Q0Tq-q1gDNC.png","fullname":"Nick","name":"hashbender","type":"user","isPro":false,"isHf":false,"isHfAdmin":false,"isMod":false,"isUserFollowing":false}},"numEdits":0,"identifiedLanguage":{"language":"en","probability":0.9401693344116211},"editors":["hashbender"],"editorAvatarUrls":["https://cdn-avatars.huggingface.co/v1/production/uploads/noauth/fYuZA0evj6Q0Tq-q1gDNC.png"],"reactions":[{"reaction":"🚀","users":["tbatson","McGTek"],"count":2}],"isReport":false}},{"id":"6a6bddc1380c113496d35950","author":{"_id":"6a4d92f3d9f3438f232dd824","avatarUrl":"https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/MJkeOQV-k7sxJNyNvAyGt.png","fullname":"McG Lee","name":"McGTek","type":"user","isPro":false,"isHf":false,"isHfAdmin":false,"isMod":false,"isUserFollowing":false},"createdAt":"2026-07-30T23:26:57.000Z","type":"comment","data":{"edited":false,"hidden":false,"latest":{"raw":"nice","html":"<p>nice</p>\n","updatedAt":"2026-07-30T23:26:57.454Z","author":{"_id":"6a4d92f3d9f3438f232dd824","avatarUrl":"https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/MJkeOQV-k7sxJNyNvAyGt.png","fullname":"McG Lee","name":"McGTek","type":"user","isPro":false,"isHf":false,"isHfAdmin":false,"isMod":false,"isUserFollowing":false}},"numEdits":0,"identifiedLanguage":{"language":"en","probability":0.8391965627670288},"editors":["McGTek"],"editorAvatarUrls":["https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/MJkeOQV-k7sxJNyNvAyGt.png"],"reactions":[],"isReport":false}}],"status":"open","isReport":false,"pinned":false,"locked":false,"collection":"community_blogs"},"contextAuthors":["fernandofernandes","EdoardoMosca","mlabonne","iamleonie"],"primaryEmailConfirmed":false,"discussionRole":0,"acceptLanguages":["*"],"withThread":true,"cardDisplay":false,"repoDiscussionsLocked":false,"hideComments":true}">

The CPU plot doesn't say what CPU. Was the 28s at 8k a single sequence on Apple silicon, or a many core x86 part? It matters for the use case you're describing, because "scan a contract" in practice means scan forty thousand of them.

trust_remote_code=True is the other thing. There's no ORT or OpenVINO path yet, so anyone following this post is on PyTorch eager on CPU, and I'd bet a decent chunk of that 28s is eager mode rather than the architecture. Any plans for int8 or ONNX exports? That's what people serving these all day are going to need.

We run bare metal EPYC behind Firecracker microVMs at Tenki. I can run encoder_eval and your latency sweep at 16, 64 and 128 vCPU and post the numbers. Seems worth knowing either way whether "the hardware you already have" means a laptop or a server.

Separate note: the policy linting demo is the one I'd pay for. Right now there's nowhere good to put a guardrail that runs on CPU inside the same sandbox as the agent, so it either goes out to an API or doesn't happen.

Upload images, audio, and videos by dragging in the text input, pasting, or

BERT: Pre-training of Deep Bidirectional Transformers for Language

Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for

Fast, Memory Efficient, and Long Context Finetuning and Inference

→ 原文: https://huggingface.co/blog/LiquidAI/lfm2-5-encoders
