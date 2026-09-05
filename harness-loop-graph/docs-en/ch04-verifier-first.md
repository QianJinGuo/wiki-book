---
title: "Chapter 4 Verifier First: The Loop's Quality Ceiling Is Set by Its Checker"
---

# Chapter 4 Verifier First: The Loop's Quality Ceiling Is Set by Its Checker

!!! abstract "Learning objectives"
    - Accept this chapter's core inequality: **the quality of a loop's output ≤ the quality of its verifier**;
    - Master the three implementation forms of generator-evaluator separation and their trade-offs;
    - Understand "all green ≠ correct" — failure modes outside the verifier's coverage;
    - Design a verifier *before* the loop, not after.

## 4.1 The inversion: the bottleneck is never on the generation side

Once the loop of Chapter 3 runs, attention naturally drifts to "how do we make the agent write better." Wrong direction. AI engineer Samuel McDonnell's 2026 critique of the Loop Engineering narrative cuts to the bone: **a loop = generator + verifier, and the bottleneck is never on the generator's side** (`entities/loop-engineering-feedback-control-system`). His words deserve a place above your desk:

> "A loop that runs green is not a correct loop. It is a loop that satisfied the verifier you gave it. The quality of the output is capped by the quality of that verifier — not one point higher."

Against the common order — build the loop, patch in verification — this book's stance: **design the verifier first, then the loop.** The verifier is the control system's signal source; if the signal is unreliable, the whole feedback loop fails — and can even self-reinforce in the wrong direction.

## 4.2 Why generation and evaluation must be separated

Chapter 2 gave the fact: models show a systematic positive bias in self-evaluation — defending their output, amplifying success, minimizing failure. Anthropic's engineering conclusion is that generation and evaluation must be separated — and that **the evaluator does not grade the generator's "reasoning"; it operates on the environment and verifies actual effects** (`concepts/harness-engineering-framework`).

This is the old rule in new clothes: whoever wrote the code should not test it. Independent test authorship finds the boundary cases confirmation bias hides; independent evaluation finds what the generator's self-defense would bury.

**Three forms of the evaluator** (`concepts/harness-engineering-framework`):

| Form | Method | Strength | Cost |
|------|--------|----------|------|
| **Environment verification** | Actually execute: open the page with Playwright, run the interaction | Closest to the real user | Most expensive to build |
| **Deterministic tools** | Compiler, type checks, linters, test suites | Zero subjectivity, mechanizable | Coverage limited by tooling |
| **Independent model** | Another model instance (same or weaker) does acceptance | Simplest to stand up | Extra cost + cross-model agreement |

**Stability conditions for the feedback loop**, three: verification results must be actionable ("type error at line 42" beats "not good enough"); shared in-loop information must not rot (state is managed by the harness, not by the generator's good intentions); cycle count must be capped (N rounds without convergence → terminate and escalate).

## 4.3 Green ≠ correct: the Bun case and verifier coverage

In 2026 an agent project completed a 750K-line Bun→Rust port with 99.8% of tests passing — and the team itself admitted it was "not production-ready" (`entities/loop-engineering-feedback-control-system`). Samuel McDonnell called that the most honest sentence of the entire release: **99.8% means the behaviors described by the old tests were reproduced; production is the behaviors no one has written tests for yet.**

This is the verifier's fundamental limit: it covers only the failure modes you foresaw. Green proves "satisfied the verifier you gave it," not "correct." Two disciplines follow:

1. **Verifiers need independent ground truth** — tests, type checks, structured output rules. Do not let the verifier become "another LLM loop" (that just relocates the bias).
2. **Verify against the original spec, not the generator's own code.** LangChain's four-step closed loop (planning & discovery → build → verify → repair) stresses that the verify stage checks each requirement of the original task spec, rather than rereading the generator's output (`topics/agent-harness-deep-dive-qa`).

The matching pathology is **first plausible solution bias**: the agent finishes, rereads its own code, concludes it "looks OK," and stops. LangChain's countermeasure is a pre-completion checklist middleware — intercepting the agent as it tries to exit and forcing verification against the spec. Translated into `fix-agent`: after the model claims "all green," the verifier does not take its word; it **runs the suite again itself and counts failures**.

## 4.4 Giving fix-agent a verifier

Wrap the loop in a verification gate:

```python
def verify(goal: str, workspace: Path) -> dict:
    """Independent verifier: separate session from the generator;
    trusts the environment, not the model's words."""
    r = subprocess.run(["pytest", "-q", "--tb=no"],
                       capture_output=True, text=True, timeout=300)
    return {
        "all_green": r.returncode == 0,
        "tail": (r.stdout + r.stderr)[-2000:],        # actionable failure info
        "regressions": count_new_failures(r.stdout),  # vs baseline; no whack-a-mole
    }

def run_with_gate(goal: str, max_rounds: int = 5):
    baseline = count_new_failures(current_test_output())  # record baseline first
    for round_ in range(max_rounds):                      # cap: feedback is not infinite
        run(goal, max_steps=15)                           # Chapter 3's inner loop
        verdict = verify(goal, workspace)
        if verdict["all_green"] and verdict["regressions"] == 0:
            return "VERIFIED_DONE"                        # pass: deliver
        goal = f"{goal}\n\nPrevious verification failed. Output:\n{verdict['tail']}"
    return "NOT_CONVERGED_ESCALATE"                       # no convergence: escalate
```

Three design decisions worth spelling out: the verifier runs in a **session independent of the generator** (it does not trust the model's self-report); it **checks regressions against a baseline** (the classic "fix A, break B" form of green-but-worse); and on **failed convergence it escalates** rather than retrying until the heat death of the budget.

## 4.5 Verification is itself an engineering discipline

Two pieces of front-line evidence:

**LLM-as-a-Verifier** (Stanford / UC Berkeley / NVIDIA, via `drafts/karpathy-2026-vibe-to-agentic-engineering`): making "the model as judge" a quantified engineering artifact — finer-grained scoring, repeated verification (expectation over K runs), decomposing the standard into spec/output/error factors. On Terminal-Bench 2.0 it cut LLM-as-a-Judge's 27% tie rate to 0% and pushed accuracy to 86.4%. **When the judge ties often, no amount of extra compute helps the agent — the judge cannot tell better from worse.** This is "the verifier caps the ceiling," quantified.

**Sandwiched reasoning** (LangChain practice): high reasoning for planning + medium for implementation + high for verification scores 66.5%, beating uniformly high reasoning at 53.9% (`topics/agent-harness-deep-dive-qa`). In engineering terms: **spend on the ends** — understanding and acceptance deserve the strongest reasoning; the middle can run a notch lower.

## 4.6 Anti-patterns

- **Self-review as verification.** "The agent says it tested" is not verification. Signals must come from an independent environment or deterministic tools.
- **A verifier living in the generator's context.** Sharing full conversation history inherits the generator's biases and narratives; at minimum isolate the session, ideally the model.
- **Unbounded retries.** Feedback loops need round caps; N rounds without convergence means the plan or the task is broken, and more looping only burns money.
- **"Not good enough" as feedback.** Non-actionable feedback equals no feedback; the generator can only guess.
- **Faking verifiers on taste tasks.** For writing, design, and strategy, the verifier *is* human judgment. Samuel's reminder: before you wrap a loop around such a task, answer honestly — do I have a verifier I can truly trust? If not, you are automating not the output but the error.

## 4.7 Summary

- Loop quality is capped by verifier quality; design verifiers before loops.
- Generator-evaluator separation has three forms — environment, deterministic tools, independent model — with stability conditions: actionable feedback, unrotting information, bounded cycles.
- Green ≠ correct: guard the baseline against regressions; check against the original spec against self-deception.
- Verification is engineering: LLM-as-a-Verifier eliminates judge ties; spend reasoning on planning and verification ends.

## 4.8 Exercises

**Hands-on**

1. Implement `count_new_failures` for `run_with_gate` (parse pytest output; compare with baseline). Construct the "fixed A, broke B" scenario and prove your regression check catches it.
2. Run an "ambiguity test" on your verifier: two different models (or sessions) judge the same batch of outputs; compute agreement. Below 90%, your acceptance criteria need formalizing.

**Reflective**

1. Which of your tasks have no deterministic verifier at all ("does this copy match brand tone")? By this book's logic, where do they sit on the automation ladder?
2. "Independent ground truth" maps to "don't mock tests into self-portraits." Find a real "tests passed, production broke" case you have seen, and classify its verifier blind spot.

## 4.9 References

- In-vault: `entities/loop-engineering-feedback-control-system` (McDonnell critique, Bun case, "stop designing prompts, start designing verifiers", feedback-bias accumulation); `concepts/harness-engineering-framework` (three evaluator forms, stability conditions); `topics/agent-harness-deep-dive-qa` (four-step loop, pre-completion checklist, sandwich 66.5 vs 53.9, LLM-as-a-Verifier data); `drafts/karpathy-2026-vibe-to-agentic-engineering` ("automate what you can verify", verifier data).
- Public: Stanford/UC Berkeley/NVIDIA, *LLM-as-a-Verifier* (Terminal-Bench 2.0 numbers, via in-vault notes); Anthropic research on agent self-evaluation bias (same).
