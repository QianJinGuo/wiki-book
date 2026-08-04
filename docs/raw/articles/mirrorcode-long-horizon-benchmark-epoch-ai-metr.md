---
source: newsletter
source_url: https://epoch.ai/MirrorCode
ingested: 2026-08-05
source_published: 2026-08-04
sha256: 154f64dbeb953737b654c9a706b6fdd52c143bce69936160e35e6b83cb0a3799
---

# MirrorCode: What's the largest software project AI can complete on its own?

MirrorCode: What's the largest software project AI can complete on its own? | Epoch AI

What's the largest software project AI can complete on its own?

AI has made rapid progress on software engineering benchmarks in the past few years. However, most such benchmarks tend to focus on shorter tasks like fixing bugs or implementing individual features. MirrorCode is our benchmark, co-developed with METR, to test AI models on long-horizon coding tasks. In a MirrorCode task, AI models are tasked with reimplementing an entire program end-to-end, without access to the original source code. AI-generated solutions must match the original program's output exactly on end-to-end tests, including held-out tests. MirrorCode's 25 target programs span different areas of computing: Unix utilities, data serialization and query tools, bioinformatics, interpreters, static analysis, cryptography, and compression.

Crucially, we provide a large enough inference budget to make a serious attempt at MirrorCode tasks. Many existing software engineering benchmarks limit inference spending to around $1–10, even when the task would take weeks for a human to complete. For example, one of the largest MirrorCode tasks cost $2,600 for a single run and involved AI working for 19 days without human intervention.

Reimplementing entire programs is extremely challenging for human software engineers. We believe a human engineer without AI would take months to solve the most complex MirrorCode tasks. However, MirrorCode tasks are also feasible; we know that there is enough information for the tasks to be fair.

We sandbox AI models, requiring them to conduct their work without access to the internet, without access to the original codebase, and with no way to cheat on the task. There are end-to-end tests that models never see while developing their code, so they cannot simply create a lookup table to mimic the original program's outputs.

AI can already solve long-horizon MirrorCode tasks, despite their difficulty. For example, Claude Opus 4.7 reimplemented gotree: a bioinformatics toolkit with ~16,000 lines of Go and 40+ commands.

We believe this same task would take a human engineer without AI assistance 2–17 weeks. Opus 4.7 solved it in 14 hours, costing $251.

One important caveat to these results is data contamination. Because MirrorCode tasks involve reimplementing open-source programs, AI models are likely to have seen the original codebases in pretraining. This might lead to inflated performance on the benchmark. However, AI successfully reimplemented several target programs that passed our memorization screen, and failed to reimplement programs where the screen showed evidence of memorization. This suggests that the results were not dominated by memorization, but we cannot rule out the possibility that memorization contributes to AI performance. Overall, we expect that the capabilities measured by MirrorCode would generalize to an unseen codebase. We discuss this further, along with more results and details on benchmark construction, in the paper.

MirrorCode is not fully solved. For our regularly updated leaderboard, we report results on a fixed task set. This means we run the 15 target programs from the Medium and Large buckets, and drop the Small bucket. Each target program is evaluated in two implementation languages (generally Go and Ada) giving 30 tasks. We run each task three times, with a budget of 10 billion tokens and 7 days per attempt.

We release our scaffold and 22 of the 25 MirrorCode target programs (totaling 132 task instances across the six supported programming languages) as open source, with the other three targets held out as a private test set.

This work was co-developed with METR and supported by a grant from METR. The authors of MirrorCode are Tom Adamczewski, David Owen, and David Rein. Florian Brand, Giles Edkins, Allen Hart, and Daniel O'Connell contributed additional target programs. Rasmus Faber-Espensen made crucial infrastructure improvements and gave advice on engineering.

The best-scoring AI gotree implementations passed 2000/2001 tests, but failed a single edge-case test for a niche command to manipulate date annotations. Consequently, they do not strictly solve the task to 100% completion, but we consider the reimplementation near-perfect, covering essentially all scoped functionality.

See definitions in the "Suggested naming conventions" of the paper. "+Private" indicates that the private test set is included: here, private_M and private_L, the private targets in the Medium and Large buckets. Under the 2L mapping, target programs generally use Go and Ada (one mainstream language and one low-resource language), with two exceptions. These scores are not directly comparable with the paper, which evaluated all 25 target programs, used all 6 agent implementation languages on the Small and Medium buckets, and gave attempts a budget of 1 billion tokens except on Large targets, with no time limit.

Epoch AI's work is free to use, distribute, and reproduce provided the source and authors are credited under the CC-BY license.

Tom Adamczewski, David Owen, David Rein, Florian Brand, Giles Edkins, Allen Hart, and Daniel O'Connell. 'MirrorCode: AI can rebuild entire programs from behavior alone'. ArXiv [cs.AI], 2026. arXiv: 2606.30182.

title={MirrorCode: AI can rebuild entire programs from behavior alone},
author={Tom Adamczewski and David Owen and David Rein and Florian Brand and Giles Edkins and Allen Hart and Daniel O'Connell},
