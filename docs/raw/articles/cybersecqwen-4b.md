---
title: "CyberSecQwen-4B"
created: "2026-05-12"
updated: "2026-05-12"
type: raw
tags: [cybersecurity, small-language-model, specialized-model, amd-mi300x, threat-intelligence, cve-classification, lora-finetuning, rocm]
source_url: "https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b"
ingested: "2026-05-12"
sha256: " provisional "
---
# CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models
Built for the AMD Developer Hackathon · Trained on a single AMD Instinct MI300X · Apache 2.0
## Why this matters
Frontier models are very good at very many things. They are also expensive to call, ship every prompt off to someone else's datacenter, and are explicitly trained to refuse the messy edge cases a real defender lives in incident write-ups, attacker-grade payloads found in your own logs, vulnerability disclosure drafts.
Defensive cybersecurity is not a place where any of those tradeoffs are acceptable.
- **Sensitive evidence stays internal.** A SOC analyst triaging a leaked credential dump, a malware reverse-engineer dissecting a sample, a vulnerability researcher writing up a CVE — none of them should be pasting that content into a hosted API. The data itself can be the breach.
- **Per-call API cost compounds.** A mid-size SOC processes thousands of low-confidence alerts per day. Hosted-API costs for "explain this CVE" or "what CWE applies here" turn defensive automation into a budget question.
- **Air-gapped and partially-connected environments are the rule, not the exception** in critical infrastructure, healthcare, and government work. If your tooling can't run on a laptop or a single on-prem GPU, it doesn't ship there.
- **Adversaries are getting more automated.** Ransomware gangs use LLMs to draft phishing in 30 languages; bug-bounty automators chain agentic tools to fuzz, triage and exploit faster than humans can review. Defense at the same speed needs models defenders own and can run.
So: local matters. But "local" alone isn't enough.
## Why a small specialized model, not just a small model
A 70B generalist running locally on four GPUs is "local" but it isn't _deployable_. A 4B generalist running locally on a single consumer GPU is deployable but it doesn't beat the 8B specialist on the work you actually need it to do.
The bet behind **CyberSecQwen-4B** is that for narrow, well-evaluated cyber threat intelligence tasks — CWE classification, CVE-to-CWE mapping, structured CTI Q&A — a careful 4B fine-tune can match or beat an 8B specialist while fitting on a 12 GB consumer card.
We tested this against the strongest public baseline we could find: **Cisco's [Foundation-Sec-Instruct-8B](https://huggingface.co/fdtn-ai/Foundation-Sec-8B)**, evaluated under their own published protocol on [CTI-Bench](https://github.com/xashru/cti-bench).
| Metric (CTI-Bench, n=5, temp 0.3) | CyberSecQwen-4B | Foundation-Sec-Instruct-8B | Δ |
| --- | --- | --- | --- |
| **CTI-MCQ** (2,500 items) | **0.5868 ± 0.0029** | 0.4996 | **+8.7 pp** |
| **CTI-RCM** (1,000 CVE→CWE items) | **0.6664 ± 0.0023** | 0.6850 | −1.9 pp |
| Parameters | 4 B | 8 B | half the size |
CyberSecQwen-4B retains **97.3 % of Foundation-Sec-Instruct-8B's CTI-RCM accuracy** while exceeding its CTI-MCQ score by **+8.7 points, at half the parameter count.** That's the only number that should matter to a defender choosing what to deploy.
## Why AMD MI300X
The whole pipeline — training, adapter merging, evaluation — runs end-to-end on a single AMD Instinct MI300X 192 GB instance via the AMD Developer Cloud.
| Component | Version |
| --- | --- |
| Hardware | AMD Instinct MI300X 192 GB · gfx942 |
| ROCm | 7.0 |
| Docker | `vllm/vllm-openai-rocm:latest` |
| PyTorch | 2.6.0 (ROCm) |
| flash-attn | 2.8.3 |
| vLLM | 0.10.1 |
| transformers / peft / trl | latest at training time |
## The training data
Two corpora, both Apache-2.0-clean:
1. **2021 CVE → CWE mappings** sourced from MITRE / NVD public records. Critically, all overlap with CTI-Bench's evaluation set was deduplicated _before_ training.
2. **Synthetic defensive-analyst Q&A** grounded in the deduplicated CVE descriptions.
The base model is **[Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)**, an Apache-2.0 instruction-tuned 4B.
| Model | CTI-RCM | CTI-MCQ |
| --- | --- | --- |
| Qwen3-4B-Instruct-2507 (raw IT) | 0.519 | 0.473 |
| **CyberSecQwen-4B** (this fine-tune) | **0.6664** | **0.5868** |
## The recipe
```
LoRA r       = 64
LoRA alpha   = 64        # alpha/r = 1.0
LoRA dropout = 0.05
LR           = 5e-5      # cosine, warmup ratio 0.03
Epochs       = 10
Precision    = bf16
Attention    = FlashAttention-2 (forward + backward)
Max seq len  = 4096
Batch        = 4 (no accumulation)
Optimizer    = paged_adamw_8bit
```
Step time: ~7.85 s/step, about **1.6× faster** than the same recipe on Gemma-4-E2B base.
## Companion model: same recipe, different substrate
**[Gemma4Defense-2B](https://huggingface.co/athena129/Gemma4Defense-2B)** — exact same training corpus and hyperparameters, only swapping base model to Gemma-4-E2B-it.
| Model | CTI-RCM (5-trial mean ± std) | CTI-MCQ |
| --- | --- | --- |
| CyberSecQwen-4B (Qwen base) | 0.6664 ± 0.0023 | 0.5868 ± 0.0029 |
| Gemma4Defense-2B (Gemma base) | 0.6754 ± 0.0035 | 0.6042 ± 0.0090 |
The two models converge **within 0.9 points** on CTI-RCM. The recipe travels — it's about how you fine-tune the IT checkpoint, not which family.
## Challenges and fixes
| Issue | Fix |
| --- | --- |
| **FA2 fails on Gemma-4** with `head_dim=512` | Falls back to sdpa for global-attention layers |
| **AITER kernels conflict** | Set `VLLM_ROCM_USE_AITER=0` |
| **bitsandbytes not supported on ROCm** | Use `paged_adamw_8bit` (optimizer-only path) |
| **vLLM ROCm + chat template** | Use `TRITON_ATTN` backend |
## Intended use
CyberSecQwen-4B is built for:
- **CWE classification** — mapping vulnerability descriptions to MITRE CWE categories
- **CTI Q&A** — answering structured questions about cybersecurity concepts
- **Defensive triage assistance** — supporting human analysts
It is **explicitly not** for: generating exploit code, auto-executing security decisions, or general chat.
## What's next
1. **A 1B variant** for laptop-class deployment
2. **Quantized GGUF release** (Q4_K_M, Q5_K_M)
3. **Continual evaluation** as new CVE-to-CWE mappings get published
4. **Adversarial-example resilience**
→ [[raw/articles/cybersecqwen-4b|原文存档]]