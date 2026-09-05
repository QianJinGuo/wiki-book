---
title: "Chapter 11 Multi-Agent Orchestration: Topologies, Protocols, Isolation"
---

# Chapter 11 Multi-Agent Orchestration: Topologies, Protocols, Isolation

!!! abstract "Learning objectives"
    - Apply the single→multi migration criteria, and split by *context boundary*, not by role;
    - Weigh the two base topologies (Orchestrator-Worker vs DAG);
    - Learn six mechanisms from a production case: capability-thin specialists, the constraint pyramid, CP checkpoints, spec-file-driven coordination, maker-checker separation, a 12-state machine;
    - Respect multi-agent's first-order risk: cascading hallucination and missing protocol.

## 11.1 Migration criteria: default to single-agent

The vault's comparison is blunt (`comparisons/single-agent-vs-multi-agent`): **about 80% of scenarios fit a single agent.** The complexity tax of going multi: context cost grows from 1× to N+1×, orchestration complexity steepens, hallucination can cascade, and debugging shifts from one trace to distributed tracing.

Criteria (same source): if the task fits in one prompt, the reasoning chain stays under ~20 steps, and nothing needs parallelism → **single agent**. Multiple specializations + parallelism + isolated trial-and-error → consider multi-agent. Anti-pattern: going multi for prestige.

**The split dimension is this chapter's most consequential judgment** (`queries/harness-minimum-checklist`): split by **context boundary** — "only this part needs to know this" — not by role ("frontend agent / backend agent"). The benefit of splitting comes precisely from context isolation: each sub-agent loads only its own context, which is Chapter 7's supply-chain principle generalized to multi-agent.

Alibaba Cloud's data-engineering team adds the meta-principle (`entities/harness-engineering`, source 7): **protocol before collaboration; isolation before parallelism** — multi-agent parallelism without protocol and isolation only amplifies hallucination and mistakes (`topics/multi-agent-systems`).

## 11.2 Two base topologies

From `comparisons/orchestrator-worker-vs-dag-agent`:

| Dimension | Orchestrator-Worker | DAG-based |
|-----------|---------------------|-----------|
| Scheduling | Centralized: the orchestrator assigns work | Graph topology: nodes consume upstream output |
| State | Orchestrator is the sole state holder | Distributed per node |
| Failure | Orchestrator is a single point | Single-node failure retries the branch |
| Scale | 3–10 sub-agents | 10–100+ nodes |
| Debugging | Low (scheduling logged in one place) | High (distributed tracing required) |
| Exemplars | OpenClaw, AutoGen-style | LangGraph, CrewAI-style |

Verdict: OW for mid-scale — simple to debug and to make fault-tolerant; DAG for large workflows — extensible, operationally demanding. **Most projects start OW and migrate to DAG at scale** — the same path as Chapter 10's "loop → graph."

A finer spectrum of collaboration patterns (`topics/multi-agent-systems`): Orchestrator (central dispatch and merge), Manager (hierarchical supervision), Supervisor (single expert decides), Hive (decentralized parallel), Swarm (self-organizing dynamic). Two special forms: **Blackboard** (shared workspace + a controller deciding at runtime who acts — for tasks whose complexity grows over time with unclear role boundaries) and **Ensemble** (parallel redundant copies, fused by vote — trading redundancy for reliability).

## 11.3 A production case: Alibaba Cloud data engineering's six mechanisms

`entities/harness-engineering` source 7 records a complete landing; worth close reading:

1. **Orchestrator + four specialists**: the coordinator writes no code — it schedules, gates, reviews, reports; four sub-specialists (requirement decomposition / solution design / coding / test verification). Each agent's capability definition is "thin is stable."
2. **Three-tier constraint pyramid**: super red lines (few, precise, violations are incidents) → error records (historical lessons) → operating rules (process templates). The essence is **signal-strength grading** — if everything is shouted, the agent goes numb to all of it.
3. **CP checkpoints**: at each stage boundary, force-compress into a fixed-format summary (conclusions + key facts + open items) — **never pass the whole conversation history downstream**; the downstream agent's window stays clean.
4. **Spec-file-driven**: agents do not talk to each other; they exchange structured files, and the orchestrator passes file paths only. Five benefits: traceable, auditable, recoverable, decoupled, isolatable.
5. **Enforced maker-checker separation**: specialists do the work; the coordinator checks it against a checklist — no player-referee in one body (Chapter 4's principle, landed at the orchestration layer).
6. **A 12-state machine + three-tier failure recovery**: from requirement intake to completion, 12 enumerated states; failures classified retry / rollback / abort (Chapter 3's tourniquets, multi-agent edition).

## 11.4 Communication: summary return and inboxes

Three validated disciplines for sub-agent information flow (`topics/multi-agent-systems`):

- **Summary return**: sub-agents return summaries; exploration details stay in their own histories. Over-transmission breeds misunderstanding and context bloat — **hallucinations amplify each other**: one agent's error passed to another is compounded. A quantitative footnote from Anthropic: unexpected-solution rates rise from 0.24% (single agent) to 0.87% (multi-agent) (`topics/agent-harness-deep-dive-qa`) — **the harness is not only a performance amplifier; it is also a risk amplifier.**
- **JSONL inbox**: each sub-agent owns a JSONL inbox file; the orchestrator writes tasks, sub-agents poll and process. Append-only writes suit async queues and avoid write conflicts.
- **Task graph**: dependencies among subtasks held in a persistent DAG — cross-session recovery reloads the graph instead of re-deriving the decomposition.

Cross-system standardization is the protocol layer's job: MCP (Anthropic, late 2024) connects models to tools/data; A2A (Google, 2025, later donated to the Linux Foundation) handles agent-to-agent delegation and state negotiation. Protocol choices obey Chapter 8's token arithmetic — MCP's representation costs ~32× a CLI, so ask whether it pays before wiring.

## 11.5 Anti-patterns

- **Multi-agent without boundaries**: unclear roles, no protocol constraints — parallelism amplifying chaos, not output.
- **Premature multi-agent**: unstable single agent, multiplied N times.
- **Over-transmission**: full details instead of summaries; context bloat plus cascading hallucination.
- **No verification gates**: parallel outputs merged directly; errors rendezvous at the merge point.
- **Splitting by role**: frontend/backend agents manufacture unnecessary collaboration surfaces; split by context boundary and many "multi-agent needs" evaporate.

## 11.6 Summary

- Migration criteria: one-prompt-describable + <20 steps + no parallelism → single agent; ~80% of cases.
- Split by context boundary, not role; meta-principle: protocol before collaboration, isolation before parallelism.
- OW vs DAG by scale and debugging capacity; most start OW.
- Six production mechanisms: thin specialists, the constraint pyramid, CP checkpoints, spec-file coordination, maker-checker, a state machine with tiered recovery.
- Communication: summary return, JSONL inboxes, task graphs; cascading hallucination is the first-order risk (0.24%→0.87%).

## 11.7 Exercises

**Hands-on**

1. Run your "we need multi-agent" task through the migration criteria. Many teams discover the honest answer is "single agent + a better verifier."
2. Implement a minimal JSONL inbox protocol: one main process writing tasks, two worker processes each consuming their own inbox file, summaries returned. Watch the whole flow in two terminal windows.

**Reflective**

1. The constraint pyramid's insight is signal-strength grading — everything bolded is nothing bolded. Check your system prompt: how many "super red lines" does it have? Are they truly few and precise?
2. What does 0.87% unexpected solutions imply operationally? If ~9 of 1,000 parallel subtasks will wander, how must the orchestrator be designed to catch them at the merge point?

## 11.8 References

- In-vault: `comparisons/single-agent-vs-multi-agent` (criteria and tax); `comparisons/orchestrator-worker-vs-dag-agent` (topology table); `topics/multi-agent-systems` (pattern spectrum, Blackboard/Ensemble, summary return, JSONL inboxes, task graphs, hallucination amplification, evaluation); `entities/harness-engineering` source 7 (Alibaba Cloud's six mechanisms); `topics/agent-harness-deep-dive-qa` (0.24%→0.87%); `queries/harness-minimum-checklist` (context-boundary splitting).
- Public: Anthropic multi-agent engineering blog (risk data, via in-vault notes); Anthropic MCP (2024-11); Google A2A (2025-04, later Linux Foundation).
