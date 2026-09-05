---
title: "Appendix B Checklist Compendium"
---

# Appendix B Checklist Compendium

The book's seven checklists, print-ready. Sources at each list's end and in Appendix C.

## B1 Minimum Viable Harness — side A (day one)

From zero to the first usable harness:

- [ ] Write AGENTS.md/CLAUDE.md (project constitution: domain, stack, conventions, dangerous-operations list; ≤100 lines)
- [ ] Write verification commands ("tests should run" → pre-completion check of results)
- [ ] Create feature_list.json (features + `pending/in_progress/completed`)
- [ ] Create a progress file (per-session progress record)
- [ ] Set a completion gate (merges/PRs only in verified-green state)
- [ ] Defaults: WIP=1; cut 80% of tools and add back on demand; start single-agent

> Mindset: AGENTS.md is soft control ("please don't"); verification/permissions/hooks are hard control ("can't").

## B2 Minimum Viable Harness — side B (iteration)

From "works" to "doesn't explode":

- [ ] Habitual bottleneck trio: is the symptom at the Prompt layer (misreads), Context layer (forgets), or Harness layer (wrong execution path)?
- [ ] An "error → rule" pipeline: every real incident becomes one rule/test/constraint
- [ ] Run component shelf-life checks at every model upgrade (see B6)
- [ ] Security baseline: pre-deploy (permission sandbox + danger list), in-execution (fail-closed interception), post-output (audit logs) — at least one item each
- [ ] High-risk domains (ops/finance/healthcare): all five layers + human review node + rollback + change audit

## B3 Loop launch checklist

For every loop intended to keep running:

- [ ] Verifier gate independent of the generator (never trust the model's self-report)
- [ ] Four stop paths written down: passed / achieved / over budget / rollback
- [ ] Three-dimensional budget caps: tokens / time / cost — any one trips → stop
- [ ] Rollback works (Git checkpoints) and the breaker path has been tested
- [ ] State memory externalized (progress files / issues / Git); new sessions restore from files
- [ ] Isolated workspace (worktree / temp branch)
- [ ] Admission: recurrence × failure cost > threshold; order: deterministic API → single call → thin loop → heavy harness
- [ ] Monitoring: success rate, regression rate, token efficiency; monthly review

## B4 Model migration checklist

On every model change or version bump:

- [ ] Tool schema compatibility (names, parameter formats)
- [ ] Citation/memory tag format consistency
- [ ] System prompt structure (old hard rules may now be internalized — audit context responsibility ownership)
- [ ] Transcript OOD risk (new model reasoning over old transcripts)
- [ ] Prompt caches cleared; tokenizer changed (all caches invalid)
- [ ] Benchmark: 20–50 real tasks, model axis × task axis, one variable at a time
- [ ] Four signals: done right? process worse? old failures back? high-risk boundaries touched?

> Trick: give sub-agents the other model rather than switching the main conversation's model.

## B5 POC → production (ten items)

| # | Check | Pass criterion |
|---|-------|----------------|
| 1 | Harness dry run done | Virtual requirement walked the full flow; gate/parameter/format bugs fixed |
| 2 | Quality gates programmatically checkable | "CI passes" decomposed into a decidable boolean |
| 3 | Maker and checker separated | Reviewer has caught maker-missed issues |
| 4 | Layered context loading live | Resident/triggered/on-demand layers; fill ≤ ~40% |
| 5 | Knowledge externalization started | Tacit constraints (field types/fallbacks/hot spots) in specs |
| 6 | Metrics updated | Delivery rate and review overhead tracked |
| 7 | External-call specs recorded | Timeout/retry/fallback in skills |
| 8 | Audit chain established | Full change directory per requirement (summary/tasks/review) |
| 9 | Knowledge lifecycle designed | draft/verified/proven + automatic decay |
| 10 | Team roles adjusted | Someone owns harness maintenance |

## B6 Component shelf-life checks (every model upgrade)

| Component | Encoded assumption | How to check |
|-----------|--------------------|--------------|
| Context reset | Model has long-context anxiety | Off vs on, one round each |
| Sprint contracts | Model cannot self-decompose | Remove; does the generator wander? |
| Aggressive compression | Model distracted by redundancy | Loosen; does quality rise? |
| Tool formatting | Model can't handle raw formats | Raw vs formatted |

Method: remove one component at a time. Build to Delete — a harness without a deletion plan is debt.

## B7 The four questions before harnessing

1. Does this weakness still exist in the **current** model?
2. Is there a cheaper deterministic alternative?
3. Does task recurrence pay for maintenance?
4. Is the deletion condition written down?

Any unanswered question: do not build yet.
