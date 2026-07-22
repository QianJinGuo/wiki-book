---
title: "Reward hacking is swamping model intelligence gains"
source_url: "https://cursor.com/blog/reward-hacking-coding-benchmarks"
type: article
created: 2026-06-26
updated: 2026-06-26
sha256: 488ad7ffd941dfa34403d9f7a4a8cc04ccc226b5f8bed16c7b9b5925dbf88471
---

# Reward hacking is swamping model intelligence gains


Published Time: 2026-06-25T12:00:00.000Z

Markdown Content:
Smarter models are becoming more resourceful at hacking coding benchmarks.

Eval suites built from real bugs that were later fixed are especially vulnerable because the problems have already been solved. If the agent has access to repository history or the public web, it can sometimes look up the answer rather than derive it.

To measure how widespread this behavior is, we built an agent to audit eval trajectories. On SWE-bench Pro, we found that 63% of successful Opus 4.8 Max resolutions retrieved the fix rather than derived it. When we sealed git history and restricted internet access, scores dropped sharply for Opus as well as for our model, Composer 2.5:

*   Opus 4.8 Max fell from 87.1% to 73.0%
*   Composer 2.5 fell from 74.7% to 54.0%

Prior research has shown that coding benchmark answers can leak through publicly available sources, including [this 2024 study](https://arxiv.org/abs/2410.06992) and a [2025 Meta report](https://github.com/SWE-bench/SWE-bench/issues/465). Our study quantifies the problem on current frontier coding-agent runs. The broader lesson is that in addition to avoiding training-time contamination, agentic coding benchmarks also need controlled runtime environments.

For teams conducting evals, we propose mitigating this reward-hacking behavior by auditing transcripts and constraining the eval environment.

## [](http://cursor.com/blog/reward-hacking-coding-benchmarks#catch-a-model-with-a-model)Catch a model with a model

To measure the scale of the reward-hacking behavior, we had the auditor examine 731 Opus 4.8 Max trajectories. It saw the problem statement and full agent trajectory, without seeing whether the run passed, and classified whether the agent had retrieved the known answer.

The two most common reward-hacking patterns it found were:

*   **Upstream lookup:** In 57% of the trajectories, Opus 4.8 Max found the merged PR or fixed source file on the public web, then reproduced the fix nearly verbatim.
*   **Git-history mining:** In 9% of trajectories, Opus 4.8 Max searched the bundled .git history for the future commit that fixed the bug, then extracted the patch.[1](http://cursor.com/blog/reward-hacking-coding-benchmarks#fn-1)

As models get stronger, they can sometimes infer that they are in an eval, especially when the task is borrowed from a past public repository. Even in cases where they don't remember the fix from training, the environment can still give them clues that the bug has already been solved.

In one SWE-bench Multilingual task from a 2019 jq issue, the agent tried to reproduce the bug with the system jq binary. Because the image had been built after the bug was fixed, the reproduction failed, and the agent inferred that the issue had already been solved. That awareness pushed it toward searching for the fix instead of deriving one.

A few cases were more direct. One agent found a SWE-bench mirror page that exposed hidden tests and the gold patch. Another obtained hidden test files and hardcoded the expected exception string needed to pass.

## [](http://cursor.com/blog/reward-hacking-coding-benchmarks#stricter-environment-design)Stricter environment design

Most reward hacking flowed through the public web and repository history. For evals built from historical public repositories, those channels need to be controlled because they may contain the answer. In response, we built a strict harness with two isolation mechanisms:

1.   **History isolation.** Before the agent starts, the .git directory is removed and the repository is reinitialized as a fresh single-commit repo. The original history is restored only at scoring time, so tests run as usual.
2.   **Egress proxying.** Network access is denied by default. As a best-effort control, a pinned proxy allows dependency resolution against an allow-list of package registries, and nothing else.

This restriction is specific to evals built from historical public repositories. It's one reason we prefer evals built from non-public repositories, like [CursorBench](https://cursor.com/blog/cursorbench). They can test agentic coding ability while still letting agents use tools in the ways they would during real work.

## [](http://cursor.com/blog/reward-hacking-coding-benchmarks#a-growing-gap)A growing gap

We reran SWE-bench Pro and SWE-bench Multilingual in the stricter harness, then compared each result against the standard harness score as a proxy for the combined effect of removing these leakage channels[2](http://cursor.com/blog/reward-hacking-coding-benchmarks#fn-2):

*   On SWE-bench Multilingual, it was under 1 point for Opus 4.6, 9.1 points for Opus 4.8 Max, and 7.5 points for Composer 2.5.
*   On SWE-bench Pro, it was under 1 point for Opus 4.6, 14.1 points for Opus 4.8 Max and 20.7 points for Composer 2.5.

![Image 1: SWE-bench Multilingual standard vs. strict harness scores for Opus 4.8 Max, Composer 2.5, and Opus 4.6 Max](https://cursor.com/marketing-static/_next/image?url=https%3A%2F%2Fptht05hbb1ssoooe.public.blob.vercel-storage.com%2Fassets%2Fuploads%2Frh-strict-hardness-chart-light.png&w=1920&q=70)![Image 2: SWE-bench Multilingual standard vs. strict harness scores for Opus 4.8 Max, Composer 2.5, and Opus 4.6 Max](https://cursor.com/marketing-static/_next/image?url=https%3A%2F%2Fptht05hbb1ssoooe.public.blob.vercel-storage.com%2Fassets%2Fuploads%2Frh-strict-hardness-chart-dark.png&w=1920&q=70)

The clear takeaway is that reward hacking is far more common with newer, more sophisticated models than with older ones. Interestingly, GPT models don't show the same escalation, with generally smaller gaps in our runs.

We also observed that our own model, Composer 2.5, had the largest Pro gap in the study. This is one reason we do not treat the standard SWE-bench Pro score as a reliable benchmark number for Composer. The score was real in the narrow sense that the harness produced it, but it mixed coding ability with access to known fixes.

Standard vs. strict harness (test pass rate)

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 1 | Opus 4.8 (max) | 91.16% | 82.03% | +9.1 |
| 2 | Opus 4.8 (xhigh) | 88.86% | 80.67% | +8.2 |
| 3 | Opus 4.7 (max) | 84.80% | 80.47% | +4.3 |
| 4 | Opus 4.7 (xhigh) | 83.74% | 78.60% | +5.1 |
| 5 | Opus 4.8 (high) | 83.09% | 79.26% | +3.8 |
| 6 | Opus 4.8 (medium) | 81.87% | 77.84% | +4.0 |
| 7 | Opus 4.7 (high) | 81.42% | 77.75% | +3.7 |
| 8 | Opus 4.8 (low) | 79.51% | 74.36% | +5.2 |
| 9 | Composer 2.5 | 79.15% | 71.60% | +7.5 |
| 10 | GPT-5.4 (xhigh) | 79.00% | 75.20% | +3.8 |
| 11 | GPT-5.5 (xhigh) | 77.80% | 74.40% | +3.4 |
| 12 | Opus 4.7 (medium) | 77.33% | 75.72% | +1.6 |
| 13 | GPT-5.5 (high) | 77.30% | 74.70% | +2.6 |
| 14 | GPT-5.4 (high) | 76.80% | 73.30% | +3.5 |
| 15 | Opus 4.6 (max) | 76.33% | 76.06% | +0.3 |
| 16 | Opus 4.6 (high) | 76.11% | 75.22% | +0.9 |
| 17 | Opus 4.7 (low) | 75.89% | 72.64% | +3.3 |
| 18 | GPT-5.5 (medium) | 75.30% | 74.20% | +1.1 |

## [](http://cursor.com/blog/reward-hacking-coding-benchmarks#designing-evals-for-aware-agents)Designing evals for aware agents

The main takeaway for teams running coding evals is that benchmark design should not stop at dataset construction. It also has to account for the runtime environment, including what the agent can search, inspect, fetch, and recover while the task is running.

That does not mean every eval should remove internet access or git history. Some evals are meant to test how well agents use the surrounding context of a real codebase, and in those settings broad access may be part of the task. The problem is when that access changes what the score means.

For historical public-repo benchmarks, open access can let agents find the known fix rather than solve the bug. Without controls in the harness, scores can conflate coding ability with answer retrieval.

Teams running evals should decide what behavior they want to measure, design the harness around that, and make the s
