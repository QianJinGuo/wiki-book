---
created: '2026-06-07'
feed_name: Interconnects
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: strong
review_value: 10
sha256: 8ab66972f56b303f9ee458c2ebb846f4697ee7574f38804e05a1ced25d23fe49
source: rss
source_url: https://www.interconnects.ai/p/latest-open-artifacts-20-new-orgs
tags:
- article
title: 'Latest open artifacts (#20): New orgs! New types of models! With Nemotron
  Super, Sarvam, Cohere Transcribe, & others'
type: source
updated: '2026-06-07'
---

# Latest open artifacts (#20): New orgs! New types of models! With Nemotron Super, Sarvam, Cohere Transcribe, & others

This Artifacts Log post is unusual in how many diverse, quirky models there are across use-cases and modalities. Normally these model roundups are dominated by big models from the likes of Qwen, DeepSeek, Kimi, etc. There are models for all sorts of different use-cases in this post, from optical character recognition (OCR), RAG search, audio transcription, computer-use, code-editing, math theorem proving, and more. The artifacts covered this month also come from a much broader list of open model builders.

This gives us a lot of hope for the future of open models, where we see [the need for domain-specific, cheap models](<https://www.interconnects.ai/i/190338833/the-balance-of-power-in-open-vs-closed-models>) as being crucial tools to complement the strongest, closed agents. When the top few models get the headlines, this vast, industry-scale tinkering can easily be forgotten. Reading this post gives a technically grounded, broad coverage of the many directions the industry is pushing specific models for. Expect more like this!

[Share](<https://www.interconnects.ai/p/latest-open-artifacts-20-new-orgs?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

To encourage people to take a look at the diversity of models in this issue, the core part of the update is not paywalled. An otherwise quiet month at the top end of open models really delivered.

# Artifacts Log

### **Our Picks**

  * **[NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4](<https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4>)** by [nvidia](<https://huggingface.co/nvidia>): The long-awaited mid-sized model from NVIDIA is finally here: 120B total params with 12B active, a 1M context window, and support for multiple popular languages. Furthermore, the model is based on LatentMoE and uses NVFP4 during pre-training, which is a first for open models. Like other things from NVIDIA, it comes with an in-depth [tech report](<https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf>) plus [pre-training](<https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets>) and [post-training](<https://huggingface.co/collections/nvidia/nemotron-post-training-v3>) datasets, with the vast majority of the data being openly released.

[](<https://substackcdn.com/image/fetch/$s_!4nWL!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9b56bd55-79e6-483a-ab8d-c3b193e89b84_1152x432.png>)

  * **[cohere-transcribe-03-2026](<https://huggingface.co/CohereLabs/cohere-transcribe-03-2026>)** by [CohereLabs](<https://huggingface.co/CohereLabs>): A speech-to-text model by Cohere based on the [conformer architecture](<https://arxiv.org/abs/2005.08100>), similar to NVIDIA’s Parakeet. It features 14 different languages, including some AIPAC languages and Arabic. Performance-wise, Cohere claims it beats similarly sized open and closed models. To top it all off: The model is released under Apache 2.0! Previous open models by Cohere were released under a non-commercial license.

  * **[sarvam-105b](<https://huggingface.co/sarvamai/sarvam-105b>)** by [sarvamai](<https://huggingface.co/sarvamai>): The Indian startup Sarvam, which trained open models in the past, has scaled up everything for its new flagship models in terms of dataset size (12-16T tokens) and model size ([30B-A2B](<https://huggingface.co/sarvamai/sarvam-30b>), 105B-10A). As a result, they come close to or even surpass a lot of open models with similar sizes. The release also shows why sovereign AI is so important, something that few other countries have internalized yet: In comparison with SOTA open models, the Sarvam models are vastly more preferred in Indic languages.

[](<https://substackcdn.com/image/fetch/$s_!YsFz!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccf5cd5d-dbf1-4483-be6e-9bdc70554af3_2010x814.png>)

  * **[Mistral-Small-4-119B-2603](<https://huggingface.co/mistralai/Mistral-Small-4-119B-2603>)** by [mistralai](<https://huggingface.co/mistralai>): A 119B-A7B model by Mistral, combining their previous model generations into one as a hybrid reasoning model with coding abilities.

  * **[zeta-2](<https://huggingface.co/zed-industries/zeta-2>)** by [zed-industries](<https://huggingface.co/zed-industries>): The open source code editor Zed has released their edit prediction model openly in the past, which we featured [a year ago](<https://www.interconnects.ai/p/artifacts-7>). While the previous version was based on open data, the new version, based on Seed-Coder-8B, is trained on open source code by users who explicitly opted into data collection.




### **Models**

#### General Purpose

  * **[gpt-oss-puzzle-88B](<https://huggingface.co/nvidia/gpt-oss-puzzle-88B>)** by [nvidia](<https://huggingface.co/nvidia>): A pruned expert version of GPT OSS 120B. It also replaces some global attention layers with window attention. Puzzle is “a post-training neural architecture search (NAS) framework, with the goal of significantly improving inference efficiency for reasoning-heavy workloads while maintaining or improving accuracy across reasoning budgets.”

  * **[Olmo-Hybrid-7B](<https://huggingface.co/allenai/Olmo-Hybrid-7B>)** by [allenai](<https://huggingface.co/allenai>): A hybrid attention + GDN (gated DeltaNet) model. See [our blog post](<https://www.interconnects.ai/p/olmo-hybrid-and-future-llm-architectures>) for more insights about the architecture and its challenges.

[](<https://substackcdn.com/image/fetch/$s_!IgMs!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F072051d6-3788-4ab4-9587-c051f282b3b8_2906x2370.png>)



  * **[NVIDIA-Nemotron-3-Nano-4B-BF16](<https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16>)** by [nvidia](<https://huggingface.co/nvidia>): A compressed version of NVIDIA-Nemotron-Nano-9B-v2, which itself is a compressed version of NVIDIA-Nemotron-Nano-12B-v2. Nvidia has been pushing this direction more than anyone else with open models.




#### Multimodal

  * **[Yuan3.0-Ultra](<https://huggingface.co/YuanLabAI/Yuan3.0-Ultra>)** by [YuanLabAI](<https://huggingface.co/YuanLabAI>): A 1T multimodal model by the relatively unknown Yuan Lab. They pre-trained a 1.5T model on 2.2T tokens and subsequently pruned experts with a new technique, outlined in the [tech report](<https://github.com/Yuan-lab-LLM/Yuan3.0-Ultra/blob/main/Docs/Yuan3.0_Ultra%20Paper.pdf>).

  * **[LongCat-Next](<https://huggingface.co/meituan-longcat/LongCat-Next>)** by [meituan-longcat](<https://huggingface.co/meituan-longcat>): A multimodal model which can process text, vision, and audio as both inputs and outputs.

[](<https://substackcdn.com/image/fetch/$s_!cxaI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdda76903-ad4c-4999-9cb6-c6a9cf2babe8_3437x1929.jpeg>)

  * **[granite-4.0-1b-speech](<https://huggingface.co/ibm-granite/granite-4.0-1b-speech>)** by [ibm-granite](<https://huggingface.co/ibm-granite>): A small speech-to-text model supporting six languages. It also supports the generation of English audio for translation.

  * **[Phi-4-reasoning-vision-15B](<https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B>)** by [microsoft](<https://huggingface.co/microsoft>): A Phi model which uses the SigLIP-2 vision encoder.




#### Special Purpose

  * **[MiroThinker-1.7](<https://huggingface.co/miromind-ai/MiroThinker-1.7>)** by [miromind-ai](<https://huggingface.co/miromind-ai>): A fine-tuned version of Qwen 235B for agentic workflows, especially research.

[](<https://substackcdn.com/image/fetch/$s_!6raY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a1f79c7-bbeb-4a80-b457-5a9c497c363e_2852x1352.png>)

  * **[tabpfn_2_6](<https://huggingface.co/Prior-Labs/tabpfn_2_6>)** by [Prior-Labs](<https://huggingface.co/Prior-Labs>): An update to the popular tabular prediction model, which is slightly larger than its predecessor. Its license allows research and internal evaluation only.

  * **[sam3.1](<https://huggingface.co/facebook/sam3.1>)** by [facebook](<https://huggingface.co/facebook>): An update to SAM 3, carrying the same restrictive license.

  * **[Holotron-12B](<https://huggingface.co/Hcompany/Holotron-12B>)** by [Hcompany](<https://huggingface.co/Hcompany>): A policy model for CUA agents.

  * **[LongCat-Flash-Prover](<https://huggingface.co/meituan-longcat/LongCat-Flash-Prover>)** by [meituan-longcat](<https://huggingface.co/meituan-longcat>): A Lean4 fine-tune of the large LongCat model.

  * **[Leanstral-2603](<https://huggingface.co/mistralai/Leanstral-2603>)** by [mistralai](<https://huggingface.co/mistralai>): A Lean4 fine-tune of the new Mistral Small 4.

  * **[reka-edge-2603](<https://huggingface.co/RekaAI/reka-edge-2603>)** by [RekaAI](<https://huggingface.co/RekaAI>): A model for robotics, beating models such as Cosmos-Reason2. Its noncommercial license converts into Apache 2.0 after two years.




#### RAG

  * **[Qianfan-OCR](<https://huggingface.co/baidu/Qianfan-OCR>)** by [baidu](<https://huggingface.co/baidu>): There have been a lot of great OCR models lately. This one is from Baidu and is licensed under Apache 2.0.

  * **[chandra-ocr-2](<https://huggingface.co/datalab-to/chandra-ocr-2>)** by [datalab-to](<https://huggingface.co/datalab-to>): An update to the Chandra OCR model, released under a restrictive license.

  * **[Reason-ModernColBERT](<https://huggingface.co/lightonai/Reason-ModernColBERT>)** by [lightonai](<https://huggingface.co/lightonai>): A SOTA retrieval model released under a non-commercial license. However, there is also code to re-generate the data, allowing the training of a commercially viable version.

  * **[context-1](<https://huggingface.co/chromadb/context-1>)** by [chromadb](<https://huggingface.co/chromadb>): A fine-tuned version of GPT-OSS for agentic search with an in-depth [tech report](<https://www.trychroma.com/research/context-1>). It also marks the debut of Chroma into the open model space. Trained with Thinking Machine’s [Tinker](<https://thinkingmachines.ai/tinker/>).

[](<https://substackcdn.com/image/fetch/$s_!_sEq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F646905bb-983f-4b3c-88e4-3eaa805613a4_3250x1640.png>)

  * **[dots.mocr](<https://huggingface.co/rednote-hilab/dots.mocr>)** by [rednote-hilab](<https://huggingface.co/rednote-hilab>): The beloved dots.ocr model has been updated and supports SVG outputs. However, on top of the general MIT license, the model comes with additional usage restrictions, just like its predecessor.




[ Read more ](<https://www.interconnects.ai/p/latest-open-artifacts-20-new-orgs>)
