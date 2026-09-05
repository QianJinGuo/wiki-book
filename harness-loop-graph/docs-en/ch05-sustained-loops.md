---
title: "Chapter 5 Sustained Loops: Outer Loops, Budgets, and the Orchestration Tax"
---

# Chapter 5 Sustained Loops: Outer Loops, Budgets, and the Orchestration Tax

!!! abstract "Learning objectives"
    - Master the six components and six primitives of sustained loops, and point to their counterparts in Claude Code / Codex;
    - Make the admission decision for loopification: recurrence × failure cost;
    - Understand why the outer loop (cross-session state memory) is the highest-value gap today;
    - Face the orchestration tax: your review bandwidth is the real cap on parallelism.

Chapters 3–4 solved "how to run one task right." But an engineer's calendar is full of tasks that **recur**: CI goes red again, dependencies drift again, monitors fire again. The second half of Loop Engineering is keeping loops running unattended — safely and economically. Boris Cherny's "three altitudes" model gives the climb coordinates (`topics/agent-harness-deep-dive-qa`):

| Altitude | Mode | Human role |
|----------|------|-----------|
| 1 | Hand-writing code with autocomplete | Still inside the loop |
| 2 | Running multiple agent sessions in parallel | Deciding and directing |
| 3 | Writing loops that prompt agents for you | **Intervening only when the loop jams** |

Anthropic's June 2026 *When AI builds itself* put a scale on those rungs: code written by Claude exceeded 80% of what landed on its repos; engineers' daily merged output was 8× 2024 levels; open-ended task success rose from 26% to 76% in six months. Boris Cherny's own last-30-days contribution to the Claude Code repo — 259 PRs, all written by Claude Code. His job: design the loops that make Claude Code write code.

## 5.1 Six components of a sustained loop

Ruo Fei's checklist from *Loop Engineering at the Worksite* is the most complete practice version (`entities/loop-engineering-feedback-control-system`):

1. **Automatic trigger** (cron, `/goal`, `/loop`) — the loop cannot depend on a human pressing Enter;
2. **Isolated workspace** (worktree, temp branch) — no concurrent clobbering; failures discard cleanly;
3. **Process assets** (skills, rules, templates) — no re-explaining context every round;
4. **External connections** (MCP, plugins, CLIs) — otherwise the loop sees only local files;
5. **Independent verification** (sub-agent / reviewer / tests) — no "authored-and-self-approved" feedback gap;
6. **State memory** (plan.md, issues, logs) — so round N+1 picks up where round N left off.

This list maps one-to-one onto Addy Osmani's **six loop primitives**, which in turn map onto both Claude Code and Codex — evidence that these are the loop's own structure, not one vendor's design (`topics/agent-harness-deep-dive-qa`):

| Primitive | Role | Claude Code | Codex |
|-----------|------|-------------|-------|
| Automations | Scheduled discovery & triage (the loop's heartbeat) | `/loop` + hooks + GitHub Actions | Automations + `/goal` |
| Worktrees | Parallel isolation | git worktree + isolation | Built-in worktree per thread |
| Skills | Project knowledge, solidified | SKILL.md, implicit matching | SKILL.md, `$name` invocation |
| Connectors | Reaching external tools | MCP servers + plugins | MCP connectors + plugins |
| Sub-agents | Maker/checker separation | `.claude/agents/` + agent teams | `.codex/agents/` TOML |
| State | Cross-session memory | AGENTS.md / progress files | Markdown / Linear |

**A real loop's full shape** (synthesized from front-line practice):

```
1. Automation fires each morning → runs the $triage skill over issues/CI → writes progress.md (State)
2. Loop reads progress.md, picks the top-priority task
   → sub-agent A (implementer, fast model) works in an isolated worktree
   → on completion, sub-agent B (reviewer, strong model) checks it
   → pass → open PR + link the issue (Connector); fail → feedback written back, A retries
3. /goal decides: "all P0 issues closed and CI green" → met: stop and notify;
   over iteration cap: escalate
4. Budget: max 15 iterations / $5 / 300 seconds
```

## 5.2 State memory: the outer loop's home

Chapter 3 called the outer loop the value gap. Its mechanism is the combination of components 4 and 6: **state memory must be externalized** — written to disk (progress files, issues, Git history), dependent on no single session's context. Sessions end; contexts clear; the repository does not forget.

Chapter 9 develops the full storage design (feature lists, startup sequences, checkpoints). One discipline matters here: **each round begins by restoring state from files, not from the model's memory.** Without state memory, a loop degenerates into memoryless repetition — re-committing the same mistakes each round.

## 5.3 Budgets: the three-dimensional fuse

The first killer of sustained loops is cost. Reference magnitudes (`entities/loop-engineering-feedback-control-system`): single-agent loops ~50K–200K tokens per task; fleet loops ~0.5M–2M; a daily scheduled loop runs through millions of tokens a week. **Every loop needs three-dimensional caps: tokens, wall-clock time, cumulative cost** — a circuit without a fuse should not be energized.

Three practical points:

- **Minimum of the three wins**: any cap tripped stops the loop; do not wait for all three;
- **Tiered budgets**: light configuration for low-risk reads/queries; the full verification chain only for high-risk writes/executions (`entities/harness-engineering`);
- **Monitor three metrics**: success rate, regression rate, token efficiency. Review monthly; tune loop frequency and verifier strictness from data (`moc/loop-engineering`).

YC's Garry Tan warned about the opposite failure: do not turn agents into "Foxconn factories" of repetitive labor — a loop should be an "intelligent loop with feedback," not mechanical repetition. The health check: is your verification gate getting sharper over time, or is it decorative?

## 5.4 The orchestration tax: review bandwidth caps parallelism

The second killer is quieter: **human review bandwidth.** Five parallel agents open five PRs; you can seriously review one an hour — the other four queue up burning tokens. That is the orchestration tax (`topics/agent-harness-deep-dive-qa`).

Three corollaries:

1. **Parallelism = review bandwidth ÷ review cost per unit of output.** To go parallel, first lower unit review cost (better verifiers, smaller PRs, higher automated pass rates), not more sessions.
2. **Stripe's route: build the roads before the trucks.** Its unattended Minions (1,300+ PRs a week) rest on years of human-developer infrastructure — 10-second devboxes, 3 million tests. **The best preparation for agents is the engineering hygiene you should have had anyway.**
3. **Waiting is expensive; correction is cheap** (the attention economics from the same source): better to have the agent queue for review than the human wait on the agent; spend human attention on critical-decision pauses (drop tables, charge cards, email customers).

## 5.5 Which tasks deserve a loop

Not every recurring task deserves a loop. One product decides admission (`entities/loop-engineering-feedback-control-system`):

> **recurrence frequency × failure cost > threshold** — then loopify.

- High recurrence, low failure cost (daily log cleanup) → cron suffices; skip the loop;
- High failure cost, one-off (cross-service migration) → loopify, run it as a project, then dismantle it;
- Both high (CI repair, dependency upgrades, monitor response) → the loop's home turf.

**The full decision order** (connecting Chapter 2's verdict): deterministic API → single call → thin loop → heavy harness. The loop is one gear in the toolbox, not the default.

## 5.6 From loops to factories: the next floor preview

The top of the hierarchy is the Factory Model: multiple loops cooperating to produce software — requirements, implementation, review, and deployment loops each doing their job, with deterministic gates passing artifacts between them (`topics/agent-harness-deep-dive-qa`). Stripe's Minions and OpenAI's ~1M lines in ~5 months are early forms. Beyond that lies recursive self-improvement — Anthropic's numbers show Claude accelerating its own training-code optimization from 3× to 52×; "Claude is helping train the next Claude." That is the book's final stop (Ch 13), and a risk to fence in advance.

## 5.7 Anti-patterns

- **Fleet loops for prestige.** Orchestration before a stable single loop multiplies every problem by N (full criteria in Ch 11).
- **Token-only budgets.** Time and cost need caps too; the classic explosion is "cheap steps, unbounded total."
- **Conversation history as state memory.** Cross-session recovery reads files; chat logs are low-quality memory that keeps "what was said" and loses "why."
- **Unattended above L4.** A loop's autonomy must not exceed the task's verifiability level (Ch 2's L1–L6); money, identity, and outbound actions keep human gates.

## 5.8 Summary

- Six components: trigger, isolation, process assets, connections, independent verification, state memory; six primitives with counterparts in Claude Code and Codex.
- Admission is a product: recurrence × failure cost; order: deterministic API → single call → thin loop → heavy harness.
- Budgets are three-dimensional fuses (tokens/time/cost) plus three metrics (success/regression/efficiency).
- The orchestration tax caps parallelism; build the roads (tests, gates, devboxes) before the trucks.
- The outer loop — externalized state memory — is today's highest-leverage layer.

## 5.9 Exercises

**Hands-on**

1. Pick a real task high on both recurrence and failure cost (recommend: dependency upgrades or CI repair). Build a minimal loop from the six-component list and run it for a week. Record: success rate, regression rate, tokens, your review time.
2. Wire in three-dimensional budget caps and deliberately set them absurdly low to prove the breaker trips. A breaker you cannot test is a breaker you do not have.

**Reflective**

1. Self-assess against the three altitudes: where are you today? What is the binding constraint on the next level — the verifier, state memory, or review bandwidth?
2. Read "the best preparation for agents is the hygiene you should have had anyway" backwards. (If your test suite is too rotten for an agent to use, whose debt gets fixed first?)

## 5.10 References

- In-vault: `topics/agent-harness-deep-dive-qa` (three altitudes, six-primitive table, real loop shape, *When AI builds itself* data, orchestration tax, Stripe Minions, Factory Model); `entities/loop-engineering-feedback-control-system` (six components, cost structure, three-dimensional budgets, admission product, Garry Tan); `moc/loop-engineering` (four-step practice path, monthly review); `entities/harness-engineering` (risk-tiered budgets).
- Public: Anthropic, *When AI builds itself* (2026-06); Addy Osmani's six-primitive framework; Stripe Engineering, *Minions* (2026-02) (all via in-vault notes).
