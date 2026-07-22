---
source_url: "https://byungkwanlee.github.io/ZPPO-page/"
ingested: 2026-06-26
sha256: b42d09978b56fa13
---

# NVIDIA-ZPPO: Zone of Proximal Policy Optimization


Markdown Content:
TL;DR

### Accuracy Gain (Δ pp)

Teacher Size 27B

Student Size

Method**10 LLM Benchmarks****16 VLM Benchmarks****5 Video Benchmarks**

Off-Policy Distill†0.0 0.0 0.0

On-Policy Distill†0.0 0.0 0.0

GRPO†0.0 0.0 0.0

GRPO† + Teacher response 0.0 0.0 0.0

**ZPPO**(Ours)0.0 0.0 0.0

†: prompt replay buffer · all experiments run on Qwen3.5

1 / 3 Off-Policy Distill† and On-Policy Distill†

Distillation forces a student to imitate teacher logits, inducing **memorization on the training samples** while **degrading generalization** on unseen samples. (Overfitting on dataset and teacher)

2 / 3 GRPO†

RL lets model have freedom of responding the question until they solve it, encouraging **reasoning exploration via self-reflection like "Wait, that step looks wrong — let me re-check."** (Not forced to imitate any response) — **preserving generalization**. However, RL can't learn how to solve **hard questions** whose rollout accuracy is near zero — they are **discarded forever**.

3 / 3 GRPO† + Teacher response

To solve hard questions, some RL methods naively inject the teacher's response into the student — as if it were the student's own response — breaking the **on-policy assumption**, **degrading generalization again**.

Insight

Research Question

> For **hard questions**, how can we transfer the teacher's knowledge to the student without imitating the teacher's logits or injecting the teacher's response directly into the student's gradient?How to make the student solve the hard question without **policy drift**(degrading generalization)?

method

Technically, we use a **Replay Buffer** to store **hard questions**, so the model revisits each **hard question** many times — not just once, as in GRPO. Repeated exposure strengthens the BCQ/NCQ effect on each **hard question**, which we expect to lift its **rollout accuracy**.

1.   **Batch** includes new questions, replayed questions, **BCQ**, and **NCQ** — **Student** is **RL-trained** on them.

results

A question is admitted to the **Replay Buffer** when its rollout accuracy stays **below 50%**, and it **graduates** — leaving the buffer — once that accuracy reaches **50%**. ZPPO graduates far more hard questions than GRPO, and the gap is widest where the initial accuracy starts near **zero**.

Initial rollout acc: **0%**

Initial rollout acc: **12.5%**

Initial rollout acc: **25%**

Initial rollout acc: **37.5%**

qualitative

## _BCQ_ + _NCQ_ on hard questions.

#### BCQ

<think> Candidate A performs a global "no straws in the meal scene" sweep without naming a location, while Candidate B commits to a specific region (the right edge of the frame), a specific shape (cylindrical), a specific colour (white), and a specific count of three. A positionally-grounded specific commitment is harder to fabricate than a blanket negative, so I commit to Candidate B on falsifiability, not the label. --- omitted --- Answer: 3. </think>\boxed{3}Correct

#### NCQ

<think> All eight listed candidates conclude 0 with the same global "no straws in the scene" reasoning, and none describes a region or shape that the consensus might have missed. The prompt rules 0 out, but without a single localised cue in the listed traces I have no foothold for identifying where a missed cluster would be. I revert to the consensus. Answer: 0. </think>\boxed{0}Wrong

#### BCQ

<think> The two candidates are anonymized, so I cannot tell which is teacher-correct from the label. Candidate A asserts a uniform "each of the three" without per-position evidence; Candidate B distinguishes the top and the bottom from the middle and the side. The per-position decomposition is concrete and falsifiable in a way a blanket "three" is not, so I commit to Candidate B on reasoning quality alone: top and bottom stickered, middle and side bare. --- omitted --- Answer: 2. </think>\boxed{2}Correct

#### NCQ

<think> All eight listed candidates report 3 with the same generic "each banana has a sticker" justification; none localises which banana is stickered. The prompt rules 3 out, which means the consensus over-counts a specific position rather than the count being arbitrarily off. The position most consistent with being silently absorbed by such a generic sweep is the middle one — correcting this specific failure mode, not eliminating from a closed answer set, yields 2. --- omitted --- Answer: 2. </think>\boxed{2}Correct

#### BCQ

<think> Anonymized, Candidate A reads small circular shapes as buttons — a generic feature with no count or location — while Candidate B names a singular feature with a specific texture (braiding), colour (white), and configuration (a knot at the chest). A specific, harder-to-fabricate commitment outranks a generic reading on reasoning quality alone. --- omitted --- Answer: D (rope). </think>\boxed{D}Correct

#### NCQ

<think> The prompt rules out B (button) and C (pocket); A (belt) and D (rope) remain. The decision between the two is not by exclusion alone: a belt is a long horizontal strap running across the waist, whereas the listed wrong candidates' own descriptions consistently localise the attachment at the chest with a knot-like configuration. The remaining option that matches this named configuration is rope. --- omitted --- Answer: D (rope). </think>\boxed{D}Correct

#### BCQ

<think> Anonymized side by side, Candidate A reports three spines without further structure, while Candidate B commits to an explicit colour sequence (White, Dark, White, Dark). The four-element alternation is a structural commitment: if only three spines existed, the sequence would not balance. I commit to Candidate B because its reasoning survives this internal consistency check, not because of any label. --- omitted --- Answer: 4. </think>\boxed{4}Correct

#### NCQ

<think> All eight listed candidates report 3 with the same "row of three" justification, and none mentions a colour or position pattern. The consensus failure mode is therefore collapsing two adjacent spines into a single one, consistent with the absence of any colour-by-colour decomposition in the listed traces. Correcting this off-by-one error yields 4 — arrived at by naming the failure mode, not by exclusion from a closed answer set. --- omitted --- Answer: 4. </think>\boxed{4}Correct

#### BCQ

<think> Both candidates assert specific grid readings, so the choice cannot be made by length or order. Candidate A's endpoint (4, 1600) would leave the line two labelled rows below the top of the y-axis. Candidate B's chain (2, 1000) and (4, 2000) lies on exact labelled intersections, with (4, 2000) coinciding with the arrowhead's terminating position. Only Candidate B's chain is consistent on falsifiability grounds. --- omitted --- Answer: 500. </think>\boxed{500}Correct

#### NCQ

<think> All listed candidates commit to slope 400 via (1, 400), (2, 800), (4, 1600). The answer is open-ended numeric, so elimination from a closed set is unavailable — I have to re-derive. Re-anchoring on two exact-intersection points — (2, 1000) and the arrowhead terminating near (4, 2000) — gives slope 500. The consensus failed by snapping the unlabelled y=500 at x=1 down to the labelled 400-row. --- omitted --- Answer: 500. </think>\boxed{500}Correct

