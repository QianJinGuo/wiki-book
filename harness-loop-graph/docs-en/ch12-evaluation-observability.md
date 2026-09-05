---
title: "Chapter 12 Evaluation and Observability: From Vibes to Evidence"
---

# Chapter 12 Evaluation and Observability: From Vibes to Evidence

!!! abstract "Learning objectives"
    - Understand evaluation mismatch: why "it runs" is not a production metric, and why review overhead belongs in ROI;
    - Master Pass@k vs Pass^k and the deterministic-scorer-first principle;
    - Build the production metric stack: five categories plus three harness-core metrics;
    - Run the POC → production checklist as the final pre-launch audit.

## 12.1 Evaluation mismatch: the invisible review tax

Harness-report data exposes a counter-intuitive fact (`queries/why-agent-poc-fails-production`): **81%** of engineering leaders say a meaningful share of the time saved by AI coding now goes to reviewing AI output; developers spend nearly **a third of their day** on this invisible work. Sharper still: LinearB counts AI-generated PRs rejected at 67.3%, versus 15.6% for human PRs.

**Attribution**: traditional productivity metrics (output volume, cycle time) see code delivery but not review overhead. Teams that raised AI-written share from 25% to 90% watched review costs balloon with it — **the industry's decade-old measurement frameworks were not built for this new unit of work.**

Three reforms: track "engineer time spent reviewing AI output" as a first-class metric; count review overhead in AI's true ROI; tier the automation — which stages may be fully trusted, which must be human-reviewed.

## 12.2 What stands between POC and production

Chapter 1 named the pattern; here is the full failure map (`queries/why-agent-poc-fails-production`, six categories):

1. **No harness system**: the POC had a human watching every step; production is unattended — "any constraint that cannot be machine-verified is not a constraint in agent execution";
2. **Evaluation mismatch**: the POC measured "does it run," not quality or maintainability;
3. **Context rot**: the POC ran in one clean session; production is multi-session, long-horizon — degradation past ~40% fill;
4. **Tool-chain fragility**: the POC tested core interactions; production's RPC timeouts, fallbacks, and transaction boundaries all misbehave — and tacit knowledge ("that config has 85 references") was never written down;
5. **Team capability gap**: the POC leaned on a few strong individuals; production needs team-level harness maintenance;
6. **Knowledge never externalized**: the POC's toy scenarios hid the tacit business constraints the agent cannot know.

The essence: **a POC verifies the capability ceiling; production demands the reliability floor.** Crossing the gap is the whole of Chapters 6–11; this chapter asks: how do you know you have crossed it?

## 12.3 The grammar of evaluation: Pass@k and Pass^k

A pair from `topics/multi-agent-systems` that belongs in every team's evaluation spec:

- **Pass@k**: at least one of k attempts succeeds → measures the **exploration ceiling** ("can it do it");
- **Pass^k**: all k attempts succeed → measures the **release-grade consistency** ("does it do it every time").

POC reports almost always quote Pass@k; production decisions should almost always read Pass^k. The distance between them is the numeric form of the gap in 12.2.

**Scorer priority**: deterministic scorers (tests, compilers, assertions) > model scorers > human scorers. Chapter 4's three evaluator forms become evaluation-infrastructure procurement principles here. A concrete quantified template: AutoResearch's five-dimension weighted score — functional correctness 35%, test sufficiency 25%, code quality 20%, security 10%, performance 10%; ≥ 9.0 to pass.

## 12.4 Shadow validation: confidence stronger than unit tests

A two-month production system (`topics/agent-harness-deep-dive-qa`) offers a powerful practice: **shadow validation** — run old and new in parallel, compare 22,792 shadowed calls, observe 99.49% agreement. The source's own claim: this found real-boundary issues that 961 unit tests did not.

Where it applies: the parallel period before an agent replaces an existing decision path (human process, legacy rules engine). It turns evaluation from sampling into full comparison, at double runtime cost — which makes it a **transition instrument, not a permanent architecture**.

## 12.5 The production metric stack

Five categories (`topics/agent-harness-deep-dive-qa`), noting the last one's special status — **the agent itself should be able to see these**:

| Category | Example metrics |
|----------|-----------------|
| Throughput | time to first PR, time to merge, tasks completed per day |
| Quality | CI pass rate, defect escape rate, rollback frequency |
| Human attention | review minutes per PR, escalations |
| Harness health | documentation-freshness violations, architecture-boundary violations, test flake rate |
| Security | blocked outbound requests, permission denials, secret-scan hits |

At the harness level, three core metrics (`entities/harness-engineering`):

1. **Task success rate**: target > 85%;
2. **Error recurrence rate**: rolling 7-day window, trending to 0 — the direct readout of whether "feed errors to the rule library" is actually running;
3. **System entropy velocity**: the trend of trace/state size — past a threshold, trigger human review before side effects compound.

**Trace-driven iteration** (LangChain practice): pull traces from LangSmith, run parallel error-analysis agents for attribution, and improve the way ML does boosting — the next round focuses on last round's failures. Evaluation is not a pre-launch exam; it is a standing organ wired into Chapter 6's operating cycle.

Ruo Fei's four signals give daily monitoring its minimal set (`entities/harness-engineering` source 8): are tasks done right? is the process getting worse? are old failures returning? are high-risk boundaries being touched?

## 12.6 The POC → production checklist

From `queries/why-agent-poc-fails-production`, ten items (condensed to eight here; full version in Appendix B):

| # | Check | Pass criterion |
|---|-------|----------------|
| 1 | Quality gates are programmatically checkable | "CI passes" decomposed into a decidable boolean, not prose |
| 2 | Maker and checker are separated | The reviewer has caught issues the maker missed (proof the separation works) |
| 3 | Layered context loading in place | Resident/triggered/on-demand layers live; fill ≤ ~40% |
| 4 | Knowledge externalization started | Tacit constraints (field types, timeout fallbacks, hot spots) written into specs |
| 5 | Metrics updated | Delivery rate and review overhead both tracked |
| 6 | External-call specs recorded | RPC/cache/config timeouts, retries, fallbacks in skills |
| 7 | Audit chain established | Each requirement has a full change directory (summary/tasks/review) |
| 8 | Team roles adjusted | Someone owns harness maintenance |

## 12.7 Anti-patterns

- **Reporting Pass@k for production decisions**: exploration ceilings are not reliability floors.
- **Testing only happy paths**: an eval set without failures is a self-congratulation ceremony; boosting-style iteration presupposes failures in the set.
- **Metrics only for the leadership deck**: metrics the agent cannot see cannot feed its self-correction; route them into context (Ch 7's runtime layer).
- **Shadow mode as permanent architecture**: double cost; dismantle when done — write the deletion condition now (Ch 13).

## 12.8 Summary

- The truth of evaluation mismatch: review overhead is an invisible tax that must hit the books; AI PR rejection at 67.3% says the quality gate lives outside generation.
- Pass@k for exploration, Pass^k for release; deterministic scorers first; the five-dimension weighted score is a workable template.
- Shadow validation (22,792 comparisons) buys production-grade confidence — as a transition instrument.
- Five metric categories + three core metrics (success >85%, recurrence →0, entropy velocity) + four signals; trace-driven boosting iteration.
- Ten checklist items before launch — the POC proves the ceiling; the checklist proves the floor.

## 12.9 Exercises

**Hands-on**

1. Measure both Pass@k and Pass^k for one agent task: run it five times. The gap between the numbers is your system's variance — the levers that shrink it, in order: a better verifier, steadier state recovery, fewer tools.
2. Add "error recurrence rate" to your traces: same error class twice within 7 days counts. Two flat weeks means your error→rule pipeline is broken.

**Reflective**

1. "The agent should see the metrics too" — which ones belong in its context, and doesn't that risk re-committing the too-much-context sin? (Hint: runtime layer + trigger conditions.)
2. Does your team measure time spent reviewing AI output? If not, what's the first instrument you would bury in the workflow?

## 12.10 References

- In-vault: `queries/why-agent-poc-fails-production` (six failure categories, 81% and one-third data, ten-item list, LinearB data); `topics/multi-agent-systems` (Pass@k/Pass^k, scorer priority, AutoResearch five dimensions); `topics/agent-harness-deep-dive-qa` (five metric categories, shadow 22,792, four-step loop, trace-driven iteration); `entities/harness-engineering` (three core metrics, four signals).
- Public: LinearB annual engineering-efficiency report (rejection rates, via in-vault notes); the Harness Report (81%, same).
