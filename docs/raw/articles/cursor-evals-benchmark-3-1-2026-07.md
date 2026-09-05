---
source: cursor
source_url: https://cursor.com/evals
source_published: 2026-07-04
ingested: 2026-07-04
sha256: 6d32a778617eec0bb3eb36cd2ee6337af908cf8038c9b6abee1cdb8f218763c0
---

# Cursor Evals — CursorBench 3.1

## Overview

CursorBench 3.1 is Cursor's coding agent benchmark suite. It evaluates AI agents on ambiguous, multi-file tasks drawn from real Cursor development sessions. Higher scores are better.

## Models Evaluated

| Model | Score | Cost/task |
|-------|-------|-----------|
| Fable 5 | TBD | TBD |
| Opus 4.8 | TBD | TBD |
| Opus 4.7 | TBD | TBD |
| GPT-5.5 | TBD | TBD |
| Sonnet 5 | TBD | TBD |
| Sonnet 4.6 | TBD | TBD |
| GLM 5.2 | TBD | TBD |
| Composer 2.5 | TBD | TBD |
| Composer 2 | TBD | TBD |

The source page displays an interactive scatter/line chart (not extractable via text parsing) comparing scores vs average cost per task.

## Benchmark Design

CursorBench 3.1 evolved through three phases:
- **Initial version**: edit, refactor, and bugfix problems
- **Version 2**: improved grading criteria for some edit tasks
- **Version 3.1** (current): introduced problems focused on codebase understanding, bugfinding, planning, and code review

## Pricing Methodology

Average cost per task is computed by applying each model's published per-million-token pricing (input, cache read, cache write, and output) to the tokens it used on each CursorBench 3.1 task, then averaging across tasks.

> ⚠️ Results are subject to variance; small differences in scores may not be statistically meaningful.

## Related

- [[raw/articles/cursor-reward-hacking-coding-benchmarks|Cursor Reward Hacking Blog]]
- [[entities/cursor.com-composer-2-5|Cursor Composer 2.5]]
