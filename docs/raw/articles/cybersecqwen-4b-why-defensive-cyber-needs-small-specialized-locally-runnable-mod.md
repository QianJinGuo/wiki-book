---
title: "CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models"
source: newsletter
source_url: "https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b"
ingested: 2026-05-12
type: source
tags: [newsletter, security]
sha256: 6b97b8dd3c728932c0d4b4ae52b10f2734aa61db4ac574b434827a10c83ec8af
---
[Back to Articles](https://huggingface.co/blog)
[![Image 1: Samuel's avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/69f7abc30b933ab22a3fd565/BxHuxU4Ls1IAeie4LztYx.jpeg)](https://huggingface.co/athena129)
Built for the [AMD Developer Hackathon](https://lablab.ai/ai-hackathons/amd-developer/athena19/cybersecqwen-4b-cti-specialist-fine-tuned-on-amd) · Trained on a single AMD Instinct MI300X · Apache 2.0
* * *
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#why-this-matters) Why this matters
Frontier models are very good at very many things. They are also expensive to call, ship every prompt off to someone else's datacenter, and are explicitly trained to refuse the messy edge cases a real defender lives in incident write-ups, attacker-grade payloads found in your own logs, vulnerability disclosure drafts.
Defensive cybersecurity is not a place where any of those tradeoffs are acceptable.
*   **Sensitive evidence stays internal.** A SOC analyst triaging a leaked credential dump, a malware reverse-engineer dissecting a sample, a vulnerability researcher writing up a CVE — none of them should be pasting that content into a hosted API. The data itself can be the breach.
*   **Per-call API cost compounds.** A mid-size SOC processes thousands of low-confidence alerts per day. Hosted-API costs for "explain this CVE" or "what CWE applies here" turn defensive automation into a budget question.
*   **Air-gapped and partially-connected environments are the rule, not the exception** in critical infrastructure, healthcare, and government work. If your tooling can't run on a laptop or a single on-prem GPU, it doesn't ship there.
*   **Adversaries are getting more automated.** Ransomware gangs use LLMs to draft phishing in 30 languages; bug-bounty automators chain agentic tools to fuzz, triage and exploit faster than humans can review. Defense at the same speed needs models defenders own and can run.
So: local matters. But "local" alone isn't enough.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#why-a-small-specialized-model-not-just-a-small-model) Why a small _specialized_ model, not just a small model
A 70B generalist running locally on four GPUs is "local" but it isn't _deployable_. A 4B generalist running locally on a single consumer GPU is deployable but it doesn't beat the 8B specialist on the work you actually need it to do.
The bet behind **CyberSecQwen-4B** is that for narrow, well-evaluated cyber threat intelligence tasks — CWE classification, CVE-to-CWE mapping, structured CTI Q&A — a careful 4B fine-tune can match or beat an 8B specialist while fitting on a 12 GB consumer card.
We tested this against the strongest public baseline we could find: **Cisco's [Foundation-Sec-Instruct-8B](https://huggingface.co/fdtn-ai/Foundation-Sec-8B)**, evaluated under their own published protocol on [CTI-Bench](https://github.com/xashru/cti-bench).
| Metric (CTI-Bench, n=5, temp 0.3) | CyberSecQwen-4B | Foundation-Sec-Instruct-8B | Δ |
| --- | --- | --- | --- |
| **CTI-MCQ** (2,500 items) | **0.5868 ± 0.0029** | 0.4996 | **+8.7 pp** |
| **CTI-RCM** (1,000 CVE→CWE items) | **0.6664 ± 0.0023** | 0.6850 | −1.9 pp |
| Parameters | 4 B | 8 B | half the size |
CyberSecQwen-4B retains **97.3 % of Foundation-Sec-Instruct-8B's CTI-RCM accuracy** while exceeding its CTI-MCQ score by **+8.7 points, at half the parameter count.** That's the only number that should matter to a defender choosing what to deploy.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#a-5-minute-walkthrough) A 5-minute walkthrough
The 5-minute video below walks through the training methodology, the AMD MI300X workflow, and the benchmark results in a more visual format. If you'd rather read everything in detail, the rest of the post covers the same ground with the exact configs.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#why-amd-mi300x) Why AMD MI300X
The whole pipeline — training, adapter merging, evaluation — runs end-to-end on a single AMD Instinct MI300X 192 GB instance via the AMD Developer Cloud. The combination of 192 GB HBM3 and ROCm 7's vLLM stack means we never had to think about quantization tricks, gradient checkpointing, or splitting the model across devices. Full bf16, FlashAttention-2 forward+backward, batch size of 4, sequence length 4096 — all on a single GPU.
| Component | Version |
| --- | --- |
| Hardware | AMD Instinct MI300X 192 GB · gfx942 |
| ROCm | 7.0 |
| Docker | `vllm/vllm-openai-rocm:latest` |
| PyTorch | 2.6.0 (ROCm) |
| flash-attn | 2.8.3 |
| vLLM | 0.10.1 |
| transformers / peft / trl | latest at training time |
The recipe in `train.sh` is **hardware-agnostic**. To run on other 40 GB+ datacenter GPUs, drop the AMD-specific environment variables (they're no-ops elsewhere) and reinstall flash-attn from the appropriate wheel. We tested portability by training a sister model on a different stack — more on that below.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#the-training-data) The training data
Two corpora, both Apache-2.0-clean to release:
1.   **2021 CVE → CWE mappings** sourced from MITRE / NVD public records. Critically, all overlap with CTI-Bench's evaluation set was deduplicated _before_ training, so the benchmark numbers above are honest out-of-distribution holdouts and not contamination.
2.   **Synthetic defensive-analyst Q&A** grounded in the deduplicated CVE descriptions. Generated with a stronger teacher and Apache-2.0-licensed for redistribution.
The base model is **[Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)**, an Apache-2.0 instruction-tuned 4B that was the highest-performing 4B-class IT model available at training time. We deliberately fine-tune on the IT checkpoint (not the base) — it preserves the terse-answer multiple-choice format priors the IT pass had already established, which an IT-then-SFT collapse would have erased.
There's a measurable effect here worth flagging:
| Model | CTI-RCM | CTI-MCQ |
| --- | --- | --- |
| Qwen3-4B-Instruct-2507 (raw IT) | 0.519 | 0.473 |
| **CyberSecQwen-4B** (this fine-tune) | **0.6664** | **0.5868** |
The IT base drops MCQ accuracy substantially compared to the underlying pre-trained base — exactly the same "instruction-tuning collapses MCQ" pattern Cisco reports for their Foundation-Sec-Instruct vs Foundation-Sec base. **Our fine-tune recovers AND exceeds the IT starting point on both benchmarks**, restoring the format binding that IT eroded while delivering domain lift.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#the-recipe) The recipe
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
FlashAttention-2 is on for Qwen because its head dimension (128) fits well within the MI300X (gfx942) shared-memory budget. Step time settles around **~7.85 s/step** at this config — about **1.6× faster** than the same recipe on the companion Gemma-4-E2B base model, which can't use FA2 on its global-attention layers (head_dim=512 exceeds the LDS budget) and falls back to sdpa.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#companion-model-same-recipe-different-substrate) Companion model: same recipe, different substrate
To check whether the result is recipe-driven or substrate-specific, we trained a sister model — **[Gemma4Defense-2B](https://huggingface.co/athena129/Gemma4Defense-2B)** — with the _exact same_ training corpus and hyperparameters, only swapping the base model to Gemma-4-E2B-it.
| Model | CTI-RCM (5-trial mean ± std) | CTI-MCQ |
| --- | --- | --- |
| CyberSecQwen-4B (Qwen base) | 0.6664 ± 0.0023 | 0.5868 ± 0.0029 |
| Gemma4Defense-2B (Gemma base) | 0.6754 ± 0.0035 | 0.6042 ± 0.0090 |
The two models converge **within 0.9 points** on CTI-RCM. The recipe travels — it's about how you fine-tune the IT checkpoint, not which family. CyberSecQwen-4B is Apache 2.0 and is the right pick when Gemma's terms-of-use are a problem; Gemma4Defense-2B is the right pick when 2B fits the deployment budget more comfortably than 4B.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#challenges-and-fixes) Challenges and fixes
No AMD ROCm project ships without a war-stories section. Here's the abbreviated version of ours:
| Issue | Fix |
| --- | --- |
| **FA2 fails on Gemma-4** with `head_dim=512` | Falls back to sdpa for global-attention layers. Local-attention layers still use FA2. ~1.6× slower vs Qwen at the same recipe. |
| **AITER kernels conflict with CyberPal-2.0-20B serving** | Set `VLLM_ROCM_USE_AITER=0` for that specific eval. AMD env var is a no-op outside ROCm so it stays in the recipe. |
| **bitsandbytes is not officially supported on ROCm** | We didn't need 4-/8-bit anyway — 192 GB is enough headroom. Use `paged_adamw_8bit` (bnb's optimizer-only path works). |
| **vLLM ROCm + chat template** for evaluation | Use `TRITON_ATTN` backend; pass `chat_template.jinja` from the merged model dir explicitly to avoid the IT base's template overriding. |
| **HF-Spaces ZeroGPU quota for the demo** | Anonymous visitors hit a 2 min/day per-IP cap. The demo Space ([cybersecqwen-chat](https://huggingface.co/spaces/lablab-ai-amd-developer-hackathon/cybersecqwen-chat)) uses HF OAuth client-side so each visitor's calls bill against their _own_ quota (free 3.5 min/day, Pro 25 min/day). |
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#try-it-yourself) Try it yourself
**Live demo (sign in with HF for free quota):** 👉 [https://huggingface.co/spaces/lablab-ai-amd-developer-hackathon/cybersecqwen-chat](https://huggingface.co/spaces/lablab-ai-amd-developer-hackathon/cybersecqwen-chat)
**Model:** 👉 [https://huggingface.co/lablab-ai-amd-developer-hackathon/CyberSecQwen-4B](https://huggingface.co/lablab-ai-amd-developer-hackathon/CyberSecQwen-4B)
**Inference in three lines (any 12 GB+ GPU):**
```
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
model_id = "lablab-ai-amd-developer-hackathon/CyberSecQwen-4B"
tok = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map="auto")
messages = [
    {"role": "system", "content": "You are a defensive cybersecurity assistant. Answer with the canonical CWE-ID first, then 1-3 sentences of justification."},
    {"role": "user", "content": "Path traversal in a Java web app where User-controlled input concatenates into a File() path. What's the CWE?"},
]
prompt = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
out = model.generate(**tok(prompt, return_tensors="pt").to(model.device), max_new_tokens=256, temperature=0.3)
print(tok.decode(out[0], skip_special_tokens=True))
```
For high-throughput serving, vLLM works out of the box on AMD MI300X via the official `vllm/vllm-openai-rocm` image. See the [GitHub repo](https://github.com/GPT-64590/CyberSecQwen-4B) for the exact serving command and the pinned config.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#intended-use) Intended use
CyberSecQwen-4B is built for security practitioners working on:
*   **CWE classification** — mapping vulnerability descriptions (CVEs, advisories) to MITRE CWE categories
*   **CTI Q&A** — answering structured questions about cybersecurity concepts, attacks, controls
*   **Defensive triage assistance** — supporting human analysts who triage CVEs, prioritize patches, document threat-actor behavior
It is **explicitly not** for: generating exploit code or weaponized PoCs, auto-executing security decisions without qualified human review, legal/medical/regulated-advice contexts, or general chat / code generation outside cybersecurity. The recipe was built for narrow utility, not breadth.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#whats-next) What's next
A few directions we want to extend, roughly in priority order:
1.   **A 1B variant** for laptop-class deployment. Qwen2.5-1.5B or Llama-3.2-1B as base, same recipe, target ≥0.55 CTI-RCM (within 6 pp of the 4B).
2.   **Quantized GGUF release** (Q4_K_M, Q5_K_M) so the model runs on phones / edge boxes. ~2.5 GB at Q4_K_M is well within ARM laptop memory.
3.   **Continual evaluation** as new CVE-to-CWE mappings get published. The 2021 cohort was a deliberate distribution-cap; future versions will track NVD's growth.
4.   **Adversarial-example resilience.** A specialist model is only as good as its worst case. We want to publish a hardening pass against prompt-injection patterns common in CVE-description-as-input attacks.
If any of those would unblock your team, [open an issue on the GitHub repo](https://github.com/GPT-64590/CyberSecQwen-4B/issues) — that's the fastest way to move them up the queue.
## [](https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/cybersecqwen-4b#closing) Closing
The frontier-model conversation has been about scale for two years. The defensive-cyber conversation should be about **what fits where you actually need it.** A 4B specialist that matches an 8B at half the size, runs on a card a researcher can afford, and never sends sensitive evidence off-prem — that's a useful corner of the design space, and AMD MI300X + ROCm 7 + Hugging Face training stack made it possible to occupy that corner in a single training run.
Try the demo, read the [model card](https://huggingface.co/lablab-ai-amd-developer-hackathon/CyberSecQwen-4B), file issues. If the recipe ports to something we haven't tried yet, that's the most interesting next data point.
— _[athena129](https://huggingface.co/athena129) · AMD Developer Hackathon submission_