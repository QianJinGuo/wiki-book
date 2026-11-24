# System Over Model, Tested: Reproducing Mythos’s FreeBSD Find on Local Open-Weight Models

> 📊 Level ⭐⭐⭐ | 7.4KB

## 摘要

When Anthropic's Mythos preview surfaced CVE-2026-4747 — a 17-year-old RCE in FreeBSD's RPCSEC_GSS authentication — AISLE's Stanislav Fort quickly reproduced the same find with `gpt-5.4-nano` on a sub-$100 `nano-analyzer` pipeline, arguing that the scaffolding, not the model, does most of the work. This article re-runs AISLE's exact pipeline at full sub-system scope (~50 files, 20,000 lines of `sys/rpc/`) on two open-weight models, `gpt-oss-20b` and `gemma-4-31b-it`. Both "miss" out of the box, both recover on re-runs, and one added reachability stage cuts false positives from 30 to 5 while keeping the CVE — strong evidence for the system-over-model thesis.

## 核心要点

- Single-file scans are trivial: both local models nail the overflow in `svc_rpc_gss_validate` when shown the file alone; the real test is sub-system scale.
- Run 1 (`gemma-4-31b-it`): 157 candidates, 30 VALID, CVE absent — Gemma invented a bounds check that isn't in the code and downgraded the real bug before triage ever saw it.
- Run 2 (`gpt-oss-20b`): 173 candidates, 21 VALID, CVE voted U/V/U into the 47-item UNCERTAIN pile — the model argued the bug correctly in one round out of three.
- Re-runs flip the story: Gemma catches the overflow 17/17 times (hosted plus a local 4-bit quant), gpt-oss survives triage in 11/14 — the "miss" was single-run noise, not incapability.
- The durable problem is noise, not detection: of 30 graduated VALID findings, exactly one was real, and it wasn't the target CVE but an unrelated, still-unfixed double-`rw_wlock` deadlock.
- One added reachability stage (same weights, no new model) prunes 30→5 and 21→4 VALID findings while keeping the CVE in 5/5 verification runs.
- Total cost: ~10.8M tokens and ~1.3K requests, about $12 on OpenRouter — zero if the models run locally.

## 深度分析

### The original find and AISLE's counter-thesis

Mythos was the moment "AI finds zero-days" stopped being theoretical: a frontier model, scaffolded across hundreds of kernel files (rank each by attack surface, hypothesize, run the project to confirm or reject, validate against a crash oracle), surfaced CVE-2026-4747 in `svc_rpcsec_gss.c` — an attacker-controlled `oa_length` memcpy into a 128-byte stack buffer with no bound beyond a non-zero check. Fort's counter-thesis argued the frontier label was doing too much work: AISLE's 1,700-line `scan.py` — context briefing per file, few-shot severity-rated scanning, multi-round triage with a separate-model, grep-backed arbiter — reproduced the same find on a nano-class model for under $100. The active ingredient, he claimed, is prompts, pipeline shape, and triage rounds, not raw model capability.

### What the reproduction actually tested

The author deliberately ran at the scope a real hunt would use, not the single file AISLE highlighted: the entire pre-patch FreeBSD `sys/rpc/` tree, AISLE's pipeline unchanged, one target, two open-weight 20-31B models on a single consumer GPU. That scope is exactly where brute-force scanning differs from a frontier model's strategic targeting — the scanner pushes every file through the same three stages with no clever prioritization, so model variance and pipeline gating dominate whether a real bug survives.

### Where each model succeeded and failed

The two failures were instructive and different. Gemma's miss was a reasoning failure at scan stage: it hallucinated a bounds check ("the copy is limited to 96 bytes") that the code does not contain, downgraded a textbook stack overflow to a minor `RNDUP` alignment nit, and the bug never reached triage. gpt-oss-20b's miss was a reliability failure: it produced a correct, well-argued VALID verdict in round 2 of triage, then flipped to UNCERTAIN in rounds 1 and 3, and the majority vote buried a real RCE at 33% confidence. Neither model lacked the capability — shown the vulnerable file alone, both describe the overflow precisely, and re-runs made Gemma 17/17 and gpt-oss 11/14. The pipeline's honest output is a detection rate, not a detection.

### Cost and the system-over-model lesson

The economics are striking: ~10.8M tokens across both full runs cost about $12 on OpenRouter and nothing on local hardware. But cheap inference buys noise — 30 and 21 graduated findings respectively, of which one was real. The fix that worked was pure scaffolding: a single reachability pass that traces each finding back to an attacker-controlled entry point (grep for callers, check whether the cited length is attacker-set or kernel-set, reject dead code and bounded cases) cut 30→5 and 21→4 VALID while keeping the CVE in 5/5 runs, and it transfers across both models. For local inference the takeaway is that small open-weight models are viable zero-day hunters given enough system, and that improving the system is far cheaper than upgrading the model.

## 实践启示

1. Never judge a model on one pipeline run: treat detection as a rate (Gemma's confident miss was one draw out of 18; gpt-oss's triage verdict is near a coin flip).
2. Audit scan-stage downgrades against the source: a model that hallucinates a defense silently buries a real bug before triage ever sees it.
3. Handle UNCERTAIN piles explicitly — that is where true positives hide (the CVE sat in a 47-item UNCERTAIN pile below the graduation threshold).
4. Add reachability filtering before reading findings: tracing each candidate to an attacker-controlled entry point is one cheap LLM stage that cuts noise ~85% without losing the real bug.
5. Vulnerable-vs-patched discrimination is within reach of 20-35B open models: four of five local models told the pair apart with no hints.
6. The full reproduction (AISLE's `scan.py`, `reachability_filter.py`, cached runs) is open source under Apache 2.0; point any OpenAI-compatible endpoint at it and bring your own model.

## 相关实体

- [unexpected lessons from an ai-assisted prototyping experimen](https://github.com/QianJinGuo/wiki-public/blob/main/entities/adobe-design-unexpected-lessons-ai-prototyping-2026.md)
- [ai gpus probably live longer than three years](https://github.com/QianJinGuo/wiki-public/blob/main/entities/seangoedecke-ai-gpus-live-longer-than-three-years-2026.md)
- [ddosing software delivery pipelines](https://github.com/QianJinGuo/wiki-public/blob/main/entities/varoa-ddosing-software-delivery-pipelines-2026.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- Karpathy Vibe Coding Agentic Engineering

→ [原文存档](http://clearbluejar.github.io/posts/system-over-model-tested-mythos-freebsd-local-openweight/)

---

