---
source: newsletter
source_url: https://www.heidihealth.com/blog/clinical-ai-model-fine-tuning
ingested: 2026-06-18
sha256: 979b298074ec23f2325a9ff5b3b529fe3f44923fc12733a56d2528e77dbe524a
---


# Fine-tuning a clinical AI model to frontier parity

Title: Fine-tuning a clinical AI model to frontier parity

URL Source: http://www.heidihealth.com/blog/clinical-ai-model-fine-tuning

Published Time: 2026-06-15T05:35:00.068Z

Markdown Content:
### Why bigger isn't always better in clinical AI

You don't need frontier scale to reach frontier quality. You need a reward signal that's yours alone, and a tight loop to learn from it. Six weeks ago, we started replacing the best frontier model running in [Heidi Evidence](https://www.heidihealth.com/en-au/evidence) with a model of our own, a fraction of its size. On blind side-by-side evaluation, it has already reached parity, to the point where clinicians can no longer tell which is which.

This post is about how we got there, what the result does and doesn't cover, and why we think the pattern generalizes beyond our own use at Heidi.

### The signal only clinicians can give

Evidence is Heidi's clinical search product, free to use outside of a patient session. A clinician asks a question and gets an answer grounded in real sources. Evidence has answered more than 3.5 million questions since launch. It’s not the volume of questions that’s valuable; it's that Evidence answers are backed by something the general-purpose labs can't buy, a real clinician telling us which of two responses was the better one. That preference is the signal we train on.

### How we measure

We grade our models the way clinicians experience them, in a test we call SBS. Two answers to the same real Evidence question are shown side by side; the clinician is blinded to their sources and picks the one they prefer. A 50% win rate means parity: two answers from two models that a clinician can't distinguish in quality. We run blinded SBS evaluations before each model update.

![Image 1: Blinded side-by-side evaluation of a real Evidence question on antibiotic choice for cellulitis — clinician picks the direct, sourced answer (Flucloxacillin 500mg, BMJ Best Practice) over a hedged alternative](https://www.heidihealth.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Ffq1n4a7f%2Fproduction%2F6118f76474779c9801a71a9d575ba12dc06a5a68-3584x2016.png%3Fw%3D1792%26fit%3Dmax%26auto%3Dformat&w=3840&q=75)

Preference isn't the whole bar, though. A side-by-side captures the average and can miss the tails, so a model only counts as better once it has cleared a separate safety and quality check, run offline against curated test sets like the public HealthBench Pro and our own Heidi Medical QA. Those catch what preference voting waves through, like hallucinations, weak instruction-following, and template drift. [We hold safety as the top priority](https://www.heidihealth.com/en-au/resources/evaluation-framework), then optimize for the answer clinicians prefer. Alongside the benchmarks, we track clinician feedback, thumbs up and down, in production. A model only graduates once it clears all three: blinded preference, the safety bar, and real-world use.

### The result

On out-of-session Evidence, our fine-tuned model now reaches a 49.9% SBS win rate against the frontier model it replaced, Sonnet 4.6. Two honest limits are worth stating plainly:

1.   **Scope:** this covers out-of-session Evidence, the search and reasoning a clinician does outside a live visit, and, not yet, the in-session work where Evidence reaches into a patient's context and takes action.
2.   **Timing:** the model is rolling into production now rather than already serving every query.

### The method

Evidence is the hardest model we've fine-tuned and our first agentic one. Where a scribe model summarizes what it's given, the Evidence model has to decide which source to pull, whether to keep searching, and when it has enough to answer. There's no single rule for the right moment to stop, so the model has to calibrate its own uncertainty, which is what should trigger a search in the first place. That makes it closer to a long-horizon reasoning problem than to next-token prediction, and roughly an order of magnitude harder than our summarization models. Reaching parity here, on our own model, is the real step-up.

![Image 2: Pipeline diagram showing the five-stage clinical AI model training process: open-weight base model, preference fine-tuning, on-policy distillation, DPO on SBS pairs, and serving to Evidence — with a clinical safety bar applied at every stage](https://www.heidihealth.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Ffq1n4a7f%2Fproduction%2F0234dc239d760ce2a14a401c480be6b8dc965362-3584x2016.png%3Fw%3D1792%26fit%3Dmax%26auto%3Dformat&w=3840&q=75)

The method itself started from a strong open-weight base rather than a model we pre-trained ourselves, since the gap we care about lives in post-training, not pre-training. The base supplies the general reasoning, and our data supplies the clinical judgment on top of it. From there, we ran three stages, all anchored to the same signal:

1.   Supervised fine-tuning on teacher rollouts, filtered down to the answers clinicians preferred, so that we trained on the top of the distribution rather than its average. We began with a few thousand preference-filtered examples and grew the set as the signal held up.
2.   On-policy self-distillation, to sharpen the model's own strongest behavior without dragging in off-policy noise.
3.   Direct preference optimization (DPO) runs directly on the side-by-side data, so we train on the exact signal we grade by.

The thread running through all three is that the metric we optimize and the metric we ship against are one and the same: clinician preference. Training and evaluation were built together rather than bolted on afterward, and that harness, with the data behind it, is where the lift came from, not the base weights.

### The thing general-purpose labs can't buy

This is also why proprietary data changes the math. General models optimize against general rewards, helpfulness, harmlessness, the broad shape of a useful assistant, and those signals are everywhere, with every lab climbing the same hill on far more compute than we have. Clinical quality is a different objective, and the function that defines it simply isn't in general data. It lives in which answer a clinician prefers when the stakes are real. The things that make an answer good there, how it's formatted, how brief it is, how it weights its sources, whether it's clinically true, aren't in web data either.

The part people miss is that raw scale isn't the asset here. Curated preference is. The signal we train on isn't grunt work that a bigger model can pattern-match its way past. Every side-by-side resolved in Evidence is one more label on that function, and together they add up to a reward function built from clinical judgment rather than scraped text.

### The loop

What keeps it improving is the loop. A good product earns clinician use, that use makes the model better, and a better model makes for a product clinicians trust and reach for more often. Each turn compounds value for the clinicians who use it, and it keeps going whether or not we touch it. The early shape is already visible, with Evidence now answering over 300,000 questions a week.

### What owning the model layer gives us

Owning the model end-to-end, instead of renting someone else's, is what makes all of this possible, and safety is the first reason it matters. As Heidi moves closer to clinical care, the system behind it has to behave like a medical device, staying consistent and inside known error bars right down to the inference, and we can only stand behind that if the model is ours. Owning it also means we can host open weights wherever data residency and governance require, and audit how the model behaves when an answer matters.

Parity is only half of it. Our model matches the frontier model on the answers clinicians prefer and matches or beats it on clinical safety, and because it's smaller, it serves those answers faster. Clinicians get quicker answers, without trading away quality o