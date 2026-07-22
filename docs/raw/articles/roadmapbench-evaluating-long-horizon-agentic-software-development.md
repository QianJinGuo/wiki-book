---
source_url: https://arxiv.org/abs/2605.15846
source: newsletter
title: "RoadmapBench: Evaluating Long-Horizon Agentic Software Development Across Version Upgrades"
ingested: 2026-07-05
publish_date: 2026-05
authors: [Allen AI]
sha256: placeholder
---

# RoadmapBench: Evaluating Long-Horizon Agentic Software Development

Coding agents are increasingly deployed in real software development, where a single version iteration requires months of coordinated work across many files. However, most existing benchmarks focus predominantly on single-issue bug fixes from Python repositories, with coarse pass/fail evaluation outcomes, and thus fail to capture long-horizon, multi-target development at real engineering scale.

RoadmapBench presents a benchmark of 115 long-horizon coding tasks grounded in real open-source version upgrades across 17 repositories and 5 programming languages. Each task places the agent on a source-version code snapshot and provides a multi-target roadmap instruction requiring it to implement the functionality introduced in the target version, with a median modification of 3,700 lines across 51 files.

A systematic evaluation on thirteen frontier models finds that even the strongest, Claude-Opus-4.7, resolves only 39.1% of tasks, while the weakest achieves merely 5.2%, in stark contrast to existing bug-fix benchmarks, suggesting that long-horizon software development remains a largely unsolved problem.
