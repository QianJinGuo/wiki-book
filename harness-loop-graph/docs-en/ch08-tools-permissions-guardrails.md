---
title: "Chapter 8 Tools, Permissions, and Guardrails: Enabling the Agent — and Preventing It"
---

# Chapter 8 Tools, Permissions, and Guardrails: Enabling the Agent — and Preventing It

!!! abstract "Learning objectives"
    - Master tool-system discipline: few and precise, schema-as-contract, error messages as repair instructions;
    - Do the tool-representation token arithmetic (CLI vs MCP vs code execution);
    - Build the two-tier control model: soft controls (documents) vs hard controls (hooks/sandboxes/permissions);
    - Align approval strength with task levels (L1–L6), and apply fail-closed.

## 8.1 The tool system: constraint is improvement

The harness's most counter-intuitive findings cluster in the tool layer (`topics/agent-harness-deep-dive-qa`):

- **Vercel got better after cutting 80% of its tools** — fewer steps, fewer tokens, higher success. Constraining the agent's solution space *improved* it;
- **Stripe's Toolshed holds ~500 tools, but a deterministic orchestrator surfaces only ~15 relevant ones per task** — avoiding "token paralysis" (the model burning attention on choosing);
- **TerminalBench evidence**: fewer tools, better choices. Default: cut 80% of tools, add back on demand (`queries/harness-minimum-checklist`).

Engineering meaning: the tool set is not a capability list; it is an **attention budget**. Every schema occupies window space and competes for the model's selection attention.

Tool-format token accounts (`queries/harness-minimum-checklist`):

| Format | Token cost | Use for |
|--------|-----------|---------|
| CLI | Lowest (baseline 1×) | Anything with a standard command line (git, curl, npm) |
| Code execution | Medium | The universal fallback (sandbox required) |
| MCP server | Highest (~32×) | External APIs that genuinely need protocol-level access |

Conclusion: CLI + skills is the token-efficiency sweet spot; MCP earns its cost only for systems that need standardized integration. **And when writing schemas, remember: the schema is a contract** — names, parameters, and return formats, once published, are depended on by models and prompts alike; changing them is interface management.

**Linter messages = repair instructions** (OpenAI/Stripe practice): a constraint mechanism should not just flag violations; it should tell the agent how to fix them. "Dependency violation: UI layer must not import Service layer" beats a red X. OpenAI enforces its layering (Types→Config→Repo→Service→Runtime→UI) with a CI-level linter — **architecture rules mechanized, not left to human reminders**; the linter itself was written by an agent.

**The Blueprint pattern** (Stripe): deterministic nodes sandwich probabilistic LLM work — the agent gets at most 2 CI rounds: succeed or hand off to a human. Probabilistic in the middle, deterministic at both ends — a structure that generalizes to nearly every agent workflow.

## 8.2 Permissions and guardrails: hook > documentation

Chapter 7's foreshadowing, unfolded. Controls come in two tiers (`entities/harness-engineering`, `queries/harness-minimum-checklist`):

| Soft control (documents) | Hard control (mechanisms) |
|--------------------------|---------------------------|
| "Run the tests" | Pre-completion check of test results |
| "Don't exceed your authority" | Tool permissions / sandbox blocking risky actions |
| "Remember the progress" | Progress files written to disk |
| "Don't break the architecture" | Lint / CI mechanizing boundaries |

**Safety must be guaranteed by mechanisms, not promised in prose.** Writing "please don't do dangerous things" in a prompt is the most common self-deception after the seven anti-patterns.

One security design worth studying: Anthropic's auto-mode classifier **reads only the action the agent wants to execute, not what the agent says** — deliberately, so that eloquence cannot sweet-talk the safety gate. It is a structural defense against prompt injection: external content may manipulate the model's *words*, but permission decisions anchor on the *action*.

**Fail-closed**: the production system's ontological interception layer evaluates every tool call against declarative rules — and when the rule engine itself errors, it denies by default. Guardrails must fail toward "no," because the scenarios where guardrails fail are precisely the scenarios nobody is watching.

## 8.3 Sandboxes: evaluate isolation by its escape surface

The sandbox is L2's last line — but evaluate it by **escape surface**, not presence: the NomShub sandbox-escape chain in the vault shows execution-layer isolation being defeated by a "shell built-in + out-of-band tunnel" combination (`concepts/when-not-to-harness-engineering`). **"We have a sandbox" is not a security conclusion** — the isolation semantics are: to what degree are filesystem, network, process, and credentials each isolated?

Chapter 6's tier table restated: high-risk scenarios (ops automation, finance, healthcare) require the full guardrail chain plus a human review node, with reversible paths and audit logs for every destructive operation (`entities/harness-engineering`).

## 8.4 Aligning approval with task level

Chapter 2's L1–L6, translated into permissions (this book's synthesis):

| Task level | Permission design |
|-----------|-------------------|
| L1/L2 (statically checkable / testable) | Fully automatic; verifier holds the gate |
| L3 (incomplete verification) | Auto-execute + sampling gates |
| L4 (expensive verification) | Plan approval: review the plan before execution |
| L5 (money/identity) | Per-action human confirmation (drop tables, charge cards, email customers) |
| L6 (legal/ethical) | Human-led; the agent only prepares |

The key design decision is not "what requires approval" but **approval granularity and timing**: pre-approving plans (cheap, batched) combined with post-hoc action audits (complete, traceable) beats interrupting a human for every action — "waiting is expensive; correction is cheap," applied at the permission layer.

## 8.5 Error → constraint: how guardrails grow

Chapter 6's operating philosophy, in guardrail form: **every real security incident or execution failure should become a mechanism constraint, not just a documentation reminder.** Ghostty's "every rule is a healed scar," guardrail edition: every hook corresponds to a real crash.

A guardrail's growth cycle:

```
Incident → post-mortem classification (human/model/environment) → choose control tier
  (doc reminder / lint rule / hook block / permission tightening / human gate)
→ deploy → scheduled review: has this constraint earned a downgrade? (see Ch 13 decay checks)
```

## 8.6 Anti-patterns

- **Tool hoarding.** 50+ tools is one of the seven anti-patterns; tool count obeys the attention budget, not the "we could" list.
- **All-or-nothing permissions.** Fully open (free-solo) or fully approved (nobody ships). Grade by L1–L6 and concentrate human attention on L4 and above.
- **Sandbox as a security conclusion.** Evaluate by escape surface; state isolation levels for files, network, processes, and credentials separately.
- **Guardrails that never downgrade.** Add-only guardrails become Ch 13's overfit debt; every constraint gets a review date.

## 8.7 Summary

- Three tool disciplines: few and precise (Vercel −80%, Stripe 500→15), schema-as-contract, error messages as repair instructions.
- Token accounts: CLI 1×, code execution medium, MCP ~32×; CLI+skills is the sweet spot.
- Soft controls sediment; hard controls protect; hook > documentation; fail-closed; permissions anchor on actions, not words.
- Approval aligns with L1–L6; pre-approve plans, post-audit actions.
- Guardrails grow from scars — and earn review dates.

## 8.8 Exercises

**Hands-on**

1. Inventory your agent project's tools: what must go to reach 15? Re-run a benchmark task after the cut and compare selection errors and token use.
2. Implement one hard block for your most feared operation (drop table, force push): preference order permission system > hook > CI check > doc reminder — always the hardest tier you can.

**Reflective**

1. Anthropic's "classifier reads actions, not words" sacrifices something. What? (Hint: context-legitimate actions get blocked.) How should your business tune that trade?
2. Of your team's agent incidents in the last three months, how many became mechanism constraints, how many remain "be careful next time"? What does that ratio say about your guardrail culture's stage?

## 8.9 References

- In-vault: `topics/agent-harness-deep-dive-qa` (Vercel/Stripe/Blueprint/linter-as-repair/ontological interception fail-closed/action-only classifier); `queries/harness-minimum-checklist` (tool token accounts, Cloudflare, soft-vs-hard table); `entities/harness-engineering` (hook>docs, HumanLayer 60 lines, guardrail tiers, high-risk requirements); `concepts/when-not-to-harness-engineering` (NomShub escape chain, "safety boundary is not in the harness"); `concepts/harness-engineering-framework` (mechanized architecture rules).
- Public: Stripe Engineering, *Minions* (2026-02); OpenAI, *Harness engineering* (2026-02); Anthropic permission-modes documentation (all via in-vault notes).
