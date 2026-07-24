---
source_url: "https://arxiv.org/abs/2607.15557"
source_title: "SkillCorpus: Consolidating and Evaluating the Open Skill Ecosystem for Real-World LLM Agents"
source_author: "Yanze Wang, Pengfei Yao, Tianyi Sun, Chuanrui Hu et al. (EverMind, Shanda Group, Peking University)"
source_date: "2026-07-23"
ingested: "2026-07-24"
sha256: "4848dbed05e24a86b3a445bc0bf1f98102393d7de921b1903c0609e58f8880a9"
source_type: "arxiv"
pdf: "assets/skillcorpus-arxiv-2607-15557.pdf"
---

# SkillCorpus: Consolidating and Evaluating the Open Skill Ecosystem for Real-World LLM Agents

**Authors:** Yanze Wang, Pengfei Yao, Tianyi Sun, Chuanrui Hu, Yan Xiao, Yunyun Han, Yifan Chen, Jun Sun, Yafeng Deng
**Institutions:** EverMind, Shanda Group, Peking University
**arXiv:** 2607.15557v4, 23 Jul 2026

## Abstract

Agent skills (SKILL.md files) are a popular mechanism for extending agent capabilities. Public repositories host them in large and growing numbers, yet these artifacts are fragmented, redundant, and uneven in quality. SkillCorpus aggregates, curates, matches, and evaluates the open skill ecosystem at scale. It filters ~821,000 crawled skills through a multistage pipeline into 96,401 skills organized by a 16-class taxonomy and three quality facets (utility, robustness, safety), paired with a fine-tuned retrieval-and-selection stack. End-to-end evaluation across three benchmarks (SkillsBench +7.5pp, GDPVal, QwenClawBench), two harnesses (OpenClaw, Raven), and two open backbones with a frontier robustness check (Claude Opus +8pp) shows consistent gains.

## Contributions

1. **Framework**: Unified aggregation, curation, matching, and real-world evaluation of the open SKILL.md ecosystem
2. **Open resource**: 96,401-skill corpus from ~821,000 raw files, fine-tuned retrieval stack, all licence-audited and 100% OSI-permissive
3. **Findings**: Gains modulated by corpus coverage and the harness; first end-to-end account of when curated community skills help real agents and where they do not

## Six-Stage Curation Pipeline

- **Stage 1-2**: Structural filters (parse SKILL.md format, length/form checks)
- **Stage 3**: Two-tier dedup (exact fingerprint → 169,465 collapsed; semantic embedding cosine 0.90+ → LLM judge adjudicates 66,751 borderline pairs) — removes 64%
- **Stage 4**: LLM judge outputs three-facet quality scores (utility 0-10, robustness 0-10, safety 0-10) + 19 safety/quality flags. Composite: score = 0.85·content_q + 0.15·prior_src (safety attenuation for s ∈ [0.3, 0.7])
- **Stage 5**: Safety hard-gate (5 flags: prompt_injection, cmd_injection, unsafe_exec, auth_bypass, csam_risk → score zero) + OSI-permissive licence filter (removes 3,795 skills)
- **Stage 6**: Source-prior shrinkage, 1024-dim retrieval embedding, index entries

## Retrieval and Selection Stack

Three-stage retrieve-then-rerank:
1. **Recall**: Qwen3-Emb-0.6B fine-tuned on de-duped corpus, 3,000-char retrieval field
2. **Rerank**: Qwen3-Rank-0.6B fine-tuned on active set
3. **LLM selector gate**: Reads full skill body, returns 0-2 skills for injection
4. **Optional query rewriter**: Normalises domain jargon

## Evaluation Setup

- **3 benchmarks**: SkillsBench (87 tasks, 8 domains), GDPVal (220 real-world economic tasks), QwenClawBench (100 tasks, 8 domains) = 407 tasks, 26 domain labels
- **2 harnesses**: OpenClaw, Raven (both SKILL.md-conformant)
- **2 backbones**: Qwen3.5-27B, Qwen3.5-397B-A17B-GPTQ-Int4
- **Frontier check**: Claude Opus 4.7
- **Total**: 24 main-grid configurations + frontier = 74 end-to-end runs

## Key Results

| Harness × Backbone | SkillsBench | GDPVal | QwenClawBench | Mean |
|---|---|---|---|---|
| OpenClaw × Q-27B | +4.2 | +1.9 | +1.5 | +2.5 |
| OpenClaw × Q-397B | +5.8 | +1.8 | +1.3 | +3.0 |
| Raven × Q-27B | +6.5 | +1.2 | +3.9 | +3.9 |
| Raven × Q-397B | +13.4 | +1.2 | +4.4 | +6.3 |
| Claude Opus 4.7 | +8.0 | — | — | — |

All cells show positive ∆; no net-negative mean (no-harm attachment).

## Key Findings

1. **Harness boundary**: Raven (full execute→verify→fix loop) gains far exceed OpenClaw (writes code then stops). Framework execution logic determines how much skills help.
2. **Coverage boundary**: High retrieval match → +25.1% avg; medium match → +6.2%; low match → +2.2%. Corpus coverage directly modulates gain.
3. **Process fit > quality score**: Individual task success depends on procedural match between skill and task, not the skill's composite quality score.
4. **Context isolation > parallelism**: The root-planner architecture's main scalability advantage comes from keeping planner/worker contexts isolated, not from parallel execution.
5. **Skill can hurt**: When skill procedure doesn't match task structure (e.g., PPT embedded Excel — generic "open .xlsx" skill fails on embedded OLE objects), it can degrade performance vs. no-skill.

## Limitations

- Quality scoring depends on LLM text judgment without sandbox execution
- English-only evaluation; Chinese/other language tasks untested
- Static snapshot (2026 Q2); no dynamic update mechanism
- High-baseline tasks (writing, copy) show limited improvement due to ceiling effect

## Links

- PDF: [assets/skillcorpus-arxiv-2607-15557.pdf]
- arXiv: https://arxiv.org/abs/2607.15557
