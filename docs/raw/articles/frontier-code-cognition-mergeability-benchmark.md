---
source_url: http://cognition.ai/blog/frontier-code
ingested: 2026-06-09
sha256: 6c41a2f9c18eaf4c2ecee42b9e4d0f43aa5425e5593aaf4753a1370c4df4b572
type: article
author: Eric Lu, Ben Pan, Deniz Birlikci, Sam Lee, Ray Wang, Rohan Choudhury, Fermi Ma, TC Qin, Carlo Baronio, Silas Alberti
title: "Introducing FrontierCode: Measuring Code Mergeability, Not Just Correctness"
created: 2026-06-09
tags: [benchmark, code-generation, agent-evaluation, cognition, devin, swe-bench, mergeability, open-source, maintainer-rubrics]
---

# Introducing FrontierCode: Measuring Code Mergeability, Not Just Correctness

> Source: http://cognition.ai/blog/frontier-code (Cognition AI, 2026-06-08)

## Raising the bar from correctness to quality

Today's coding benchmarks have established that models can write _correct_ code. But as AI-generated code becomes the dominant path to production, correctness is now table stakes. The question that we should be asking is: can models actually write _good_ code?

We're excited to introduce **FrontierCode**, a benchmark that measures how well models can truly meet the standards of high-quality production codebases. What sets us apart:

- **Would the maintainer actually merge this PR?** We're the first benchmark to measure code mergeability. Our criteria assess end-to-end code quality — correctness, test quality, scope discipline, style, and adherence to codebase standards. This employs a novel ensemble of grading techniques, including unit tests, rubrics, and new types of verifiers.

- **Crafted by open-source maintainers.** 20+ world-class open-source developers built realistic, diverse, and challenging coding tasks from the repos they maintain, spending more than 40 hours per task. They define what "mergeable" means in their repo.

- **Rigorous quality control.** Rubric grading is subjective, so we built an extensive QC pipeline with adversarial testing, calibration, and multi-stage review, where every task is manually reviewed by a Cognition researcher. We achieve an 81% lower false positive rate compared to SWE-Bench Pro.

## Results

We present three nested subsets of FrontierCode at increasing difficulty: **Extended, Main, and Diamond**. Diamond comprises the 50 hardest tasks, Main the 100 hardest (including Diamond), and Extended the full set of 150.

We report two metrics, **pass rate** and **score**:
- A solution **passes** if it clears all blocker criteria, i.e., criteria that a maintainer would consider hard stops during code review, and **fails** otherwise.
- A solution's **score** is a weighted aggregate of the rubric items. Solutions that do not pass blocking criteria receive 0.

Each model is run 5 times at every available reasoning effort. For each effort, we average the metric across the 5 trials, then report each model's score at its best performing reasoning level.

**FrontierCode Diamond remains unsaturated**: the best performing model, **Claude Opus 4.8, achieves a score of only 13.4%**. Other models score significantly lower: GPT-5.5 receives 6.3%, Gemini 3.1 Pro 4.7%, and others even less. However, **GPT 5.5 consistently uses up to 4x fewer tokens than Opus 4.8**, achieving a better cost-intelligence tradeoff.

On FrontierCode Main and Extended, Opus 4.8 still maintains a clear lead, at 34.3% and 51.8%, respectively. We also observe a large gap between open-source models and the frontier. **Kimi K2.6, the best-performing open-source model, achieves just 3.8% on Diamond, 16% on Main and 37% on Extended.**

## Why we built FrontierCode

The first generation of coding benchmarks, such as SWE-Bench Verified and Pro, were designed for less capable models. They fall short on many measures of realism and robustness.

**Fundamentally, they only test _functional correctness_, not quality.** Moreover, these benchmarks are prone to **misclassification errors**. [Experiments from METR](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/#introduction) have found that high-scoring models on these benchmarks often produce patches that wouldn't be accepted by human maintainers.

How do we define misclassifications? These fall under two categories:
- **False Positives:** The verifier should not reward solutions that are wrong. Test coverage may be _incomplete_, allowing the model to write an incorrect solution that's still accepted.
- **False Negatives:** The verifier should not penalize solutions that are correct. Tests can be either _too specific_, e.g. checking for exact error strings or function names, or _unsolvable_, testing for a behavior not in the instruction or in the codebase.

We show through analysis of agent trajectories that FrontierCode produces **81% less misclassification errors** than other leading benchmarks. This means that FrontierCode scores are **the most accurate ranking** currently available.

Existing benchmarks also suffer from **lack of diversity** in several ways.

While other benchmarks generated issues from single PRs via programmatic scraping, FrontierCode is hand-selected by repo maintainers from multi-PR chains and freeform requests. We also **triple the number of represented languages from SWE-Bench Pro**.

It's also known that existing benchmarks provide **too much guidance** in the form of overly specified and detailed prompts. Today's frontier models need far less hand-holding. FrontierCode expects the agent to infer the maintainer's intent, given the same context as a human contributor.

Our prompts contain two parts. First is the task description. Second, the codebase guidelines for generic testing, lint, and style practices, just like those found in AGENTS.md. The task descriptions are **humanlike** and **deliberately concise** — a third the length of SWE-Bench Pro's.

Furthermore, we've chosen to scale the difficulty of tasks using _quality rubrics_, rather than simply increasing patch size. Despite having smaller patches than benchmarks like DeepSWE, FrontierCode is _harder for agents_ to solve.

## How we built FrontierCode

### A Team of Open Source Maintainers

FrontierCode aims to measure whether models can produce code that would be merged into production codebases. To ensure this, we collaborated directly with the maintainers of 36 flagship open-source repositories. This team of all-star experts has collectively reviewed and merged thousands of commits to their codebases. They can apply deep stylistic and design knowledge to every PR they see.

Each maintainer invested **more than 40 hours** per task, undergoing multiple rounds of iteration with other eval engineers and Cognition researchers. They've distilled their judgment into concrete evaluation criteria: any PR that satisfies these standards would actually be approved.

**Selected maintainer quotes (star counts as of 2026-06):**
- "Where others grade like a CI, FrontierCode grades like a tech lead." — Tomer Nosrati, CEO and Tech Lead of Celery (28.6k stars)
- "We should be moving away from benchmarks that can be gamed and instead using ones like FrontierCode to demonstrate genuine model intelligence and creativity." — Martin McKeaveney, Co-Founder and CTO of Budibase (28k stars)
- "FrontierCode is a milestone for AI models respecting subjective quality in the real world." — Merlijn Vos, Core Maintainer of uppy (30.8k stars)
- "FrontierCode's unique value comes from the human experience encoded in its evals: years of judgment about what makes code high-quality and worthy of merging." — Claudio Costa, Core Maintainer of Mattermost (37k stars)

### Beyond Unit Tests

FrontierCode measures mergeability by evaluating code along the following axes:
- **Behavioral correctness:** Does the patch successfully solve the problem?
- **Regression safety:** Does it break anything in the existing codebase?
- **Mechanical cleanliness:** Does it pass the project's build, lint, and style checks?
- **Test correctness:** Do the agent's tests actually capture the desired behavior?
- **Scope:** Does the patch touch only what it needs to?
- **Code quality:** Does the code conform to codebase conventions, follow sound design patterns, and remain readable to collaborators?

| Category | Method | How it works | Passes when |
| --- | --- | --- | --- |
| Behavioral correctness | classical | Injects test files into the repository, runs them, then cleans up. | All injected tests pass |
| Mechanical cleanliness, regression safety | command | Runs a shell command. | Exit code 0 |
| Test correctness | reverse-classical | Runs agent's submitted tests against the base commit. | The tests fail |
| Behavioral correctness for complex tasks | adaptive classical grading | Uses an LLM to adapt reference tests or application code to align with the implementation. | Adapted tests pass |
| Scope | scope | Checks file boundaries, diff size constraints, and optionally semantic locality of changes. | Diff within constraints |
| Code quality | prompt | An LLM reviews agent's diff against a natural-language prompt. | LLM score meets threshold |

Each criterion is either a **blocker** or a **non-blocker**:
- **Blockers** represent mergeability requirements, i.e., criteria that a maintainer would consider hard stops during code review. These include correctness checks, as well as non-correctness concerns like performance or scope restrictions.
- **Non-blockers** represent quality signals such as code style, type safety, and readability, which would not necessarily block a merge.

If a solution satisfies all the blockers, it is considered passing, and its score is the weighted aggregate of all the rubric items it passes. Otherwise it receives a score of zero.

#### Novel Grading Methods

**Reverse-Classical:** The reverse-classical criterion is a way to ensure that agent-written tests are meaningful: when we run them on the original, broken codebase, they **must fail**. This gives us an automated, deterministic check that the agent understood the problem well enough to write an effective test for it.

**Code Scope:** A good PR should exercise **restraint**: it modifies only what it needs to, without touching unrelated files or introducing unnecessary refactors. The `scope` criterion is an automated check that enforces these boundaries. It combines three types of constraints:
- `files`: For fast, deterministic checks on which files can be **allowed**, **denied**, or must be **deleted**.
- `size`: To enforce limits on the number of **changed lines**, **net line growth**, or **total files** modified.
- `semantic`: For LLM-based checks that verify the **locality** or **nature** of a change within a specific part of a file (e.g., inside a single function).

**Adaptive Classical Grading:** Open-ended coding tasks can have many valid solutions. Static unit tests are too rigid; good solutions can fail for superficial differences like function names or error wording. We resolve this conflict with `mutagent`, a tool we built that uses an LLM to surgically patch the test environment (or the application code) and align with the agent's implementation details, allowing us to run rigorous, deterministic tests on open-ended solutions.

### Example Task: jsonschema LOG_WARNING (C++)

The task is based on the `jsonschema` repo which is written in C++. It requires implementing a new function `auto LOG_WARNING() -> std::ostream &` that should be used in every instance of printing `warning: <message>` in the codebase. The helper should prefix log messages with `warning:`, print to `stderr`, and ignore the `--verbose` flag.

The task seems simple: a passing solution has to just identify all places in the given codebase that print `warning:` and replace them with a call to a newly implemented `LOG_WARNING()` function. However, models fail this task in a somewhat surprising way. One of the blocking criteria requires that **multi-line warning messages idiomatically call `LOG_WARNING`**, like so:

```cpp
LOG_WARNING() << "You are opting in to remove schema identifiers... \n"
              << "The only legit use case... \n"
              << "non-compliant... \n" << ... ;
```

Claude Opus 4.8, on the other hand, consistently opts for the following implementation:

```cpp
LOG_WARNING() << "You are opting in to remove schema identifiers...\n";
    std::cerr << "The only legit use case... \n";
    std::cerr << "non-compliant... \n";
```

**These two are behaviorally the same**; in both cases a multi-line error message will be printed to `stderr`. However, the agent solution bakes in the assumption at the call site that `LOG_WARNING()` and `std::cerr` are the same stream, which could change in a future modification of `LOG_WARNING()`.

This example demonstrates the **subjective, non-deterministic** quality judgments FrontierCode captures. Pure unit tests would have passed both solutions. Only the maintainer's design intent distinguishes "mergeable" from "technically correct but not idiomatic."

### Quality Control

#### How do we iterate on rubric quality?

Improving binary verifiers like unit tests is relatively tractable because every solution falls into one of two buckets — correct or incorrect. You can examine each rollout, check its bucket, and strengthen the tests accordingly.

**Hardening prompt-based criteria is a much harder QC problem.** Rubrics introduce a _spectrum_ of correctness: two solutions for the same task can both be functionally correct yet score differently on every criteria. We can no longer look at solutions in isolation. We have to compare within a group of solutions and verify that their relative scores actually separate better solutions from worse ones.

Rubric design is also inherently subjective and requires domain expertise. For each criterion, the maintainer must decide whether it's a blocker or non-blocker, assign its weight relative to other criteria, and ensure complete coverage so that models cannot exploit gaps in the rubric.

#### Our rubric creation process

1. **Design**: We prefer classical tests for things that can be checked deterministically, such as correctness. For complex tasks, we favor behavioral tests that are robust to superficial differences in implementation details. For soft qualities, we prefer LLM grading. Based on these principles, we first ask the task creator to manually audit each rubric item and document its rationale.

2. **Hack report**: To prevent false positives, the task author imitates a lazy or adversarial programmer and tries to get a passing score with a deliberately incorrect or incomplete solution. This exposes criteria that can be improved. To prevent false negatives, the task author tries to write a perfectly valid, alternative solution that is different from the canonical one. If this solution fails the evaluation, the rubric is too rigid. We augment the hack report process by also asking Devin to come up with novel ways to hack the rubric.

3. **Rubric calibration**: To ensure that the rubric has sufficient resolution, the author must write four distinct solutions that target a range of scores from 0 to 100%.

4. **Review**: Each contributor belongs to an eval pod led by an experienced pod lead, who acts as the first quality gate. The lead reviews the full eval candidate and iterates with the contributor through multiple rounds. Once the eval candidate passes all pod-level checks, a Cognition researcher conducts a final review along with the pod lead and contributor. For a random subset, researchers also solve the tasks themselves to verify that instructions are clear and grading is fair.

5. **Re-Review**: At any stage, reviewers can send the task back for revision. Most tasks cycle through multiple iterations before passing.

The result of this extensive process is a suite of durable, difficult tasks that reflect the high standards of the world's top open-source repositories.

## Conclusion

FrontierCode is the benchmark for the next generation of coding agents. We are confident developers, enterprises, and researchers can trust it to evaluate the production readiness of their strongest models. While we don't currently plan to release the tasks publicly to avoid contamination, we are opening up our evaluation to all model creators, in the hope that we can push the frontier even further in the coming months.

---

**Key takeaways:**

1. **First benchmark to measure code _mergeability_, not just correctness** — coder has to produce a PR a real maintainer would merge, not just pass unit tests. Six evaluation axes: behavioral correctness, regression safety, mechanical cleanliness, test correctness, scope, code quality

2. **20+ open-source maintainers, 40+ hours per task** — Celery (28.6k), Budibase (28k), uppy (30.8k), Mattermost (37k), jsonschema, and 30+ more flagship repos. **Maintainer-rubric is the "source of truth" — not unit tests**

3. **Three novel grading methods**:
   - **Reverse-classical**: agent's tests must FAIL on the original (broken) codebase → tests are meaningful
   - **Code scope**: file allow/deny + size limits + semantic locality (LLM-judged)
   - **Adaptive classical grading (mutagent)**: LLM surgically patches test environment to align with agent's implementation details → rigorous deterministic tests on open-ended solutions

4. **81% lower misclassification rate than SWE-Bench Pro** — empirically measured via trajectory analysis

5. **FrontierCode Diamond is unsaturated**: best model (Claude Opus 4.8) scores only **13.4%**; GPT-5.5 6.3%; Gemini 3.1 Pro 4.7%; Kimi K2.6 3.8% (best open-source). On Main/Extended Opus leads at 34.3% / 51.8%

6. **Cost-intelligence tradeoff is real**: GPT-5.5 uses 4x fewer tokens than Opus 4.8 while scoring 2x lower on Diamond — better $/intelligence point for many use cases

7. **The jsonschema LOG_WARNING example** is the canonical demonstration: behaviorally identical code is **not** idiomatic code. FrontierCode catches what unit tests cannot
