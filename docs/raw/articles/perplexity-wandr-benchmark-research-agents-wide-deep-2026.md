---
source_url: https://research.perplexity.ai/articles/wandr-benchmark-evaluating-research-agents-that-must-search-wide-and-deep
ingested: 2026-07-16
sha256: 4362e672d1fca3a2ef39247b9b0dccaec5895fb4a62f75225b0a3c1fa1a362cd
source: newsletter
---

# WANDR Benchmark: Evaluating Research Agents That Must Search Wide and Deep

A benchmark for high-volume, evidence-heavy knowledge work

Today, we are releasing WANDR (Wide ANd Deep Research), an open benchmark and evaluation harness built around 500 realistic, challenging data-collection tasks for knowledge work. WANDR is the wide sibling of our DRACO benchmark for deep research. DRACO asks whether an agent can produce an accurate, complete, and objective long-form report; WANDR asks whether it can build a large collection and back up every member with specific evidence.

These are the kinds of jobs people already hand to research agents: competitive mapping, due diligence, literature review, market analysis, product comparison, talent sourcing, and more. The tasks range from dozens to thousands of independently verifiable records. Even at a high effort setting, the strongest system in our evaluation reaches just 0.363 soft F1 and 0.133 hard F1. Wide-and-deep research is still a long way from solved.

## Why wide-and-deep research matters

Many useful research jobs do not end when an agent finds one answer. A market analyst may need every qualifying competitor, with the same evidence for each. A due-diligence team may need dozens of companies, then ownership, executives, financing, and regulatory status for every one of them. That creates two separate demands:

- Wide: discover a large and often open-ended set of qualifying entities.
- Deep: investigate every entity far enough to support each requested claim with evidence.

Combining the two changes the problem. A handful of compelling examples is not enough, and neither is a polished narrative built on incomplete research. The agent must sustain broad discovery without sacrificing factual quality from one record to the next.

WANDR captures that structure with a flexible, composable qualification key hierarchy. A task might ask for company(n) → employee(m) → url(k). This means finding n qualifying companies, m qualifying employees at each company, and k supporting pages for each employee. Every complete path through the tree can be validated independently.

One released task illustrates this structure in practice. The "ceo_cfo_appointments" task asks: Find at least 70 US-based companies with a CEO or CFO appointment first announced between March 1 and April 30, 2026. For each company, provide an authoritative appointment page. There is a subtask: For the same companies, provide a recognized listing-authority page. Total: 140 records.

## Realistic tasks, generated at scale

WANDR starts from de-identified patterns observed in production usage rather than synthetic prompts. This keeps the benchmark close to the work people actually delegate. A semi-automated pipeline turns those patterns into tasks, reserving human effort for quality control instead of exhaustive answer annotation.

The pipeline has four stages:
1. **Seeding** mines de-identified product requests for a reusable wide-research pattern.
2. **Authoring** runs an interleaved author–critic loop.
3. **Admission** checks that the target volume is reachable.
4. **Curation** labels the admitted tasks and selects a balanced final set.

The median task asks for 50 members, four records per member, and 245 records overall. The 500 tasks call for 170,495 source-backed records.

## Reference-free, evidence-verified grading

WANDR grades each submitted claim against the evidence the agent cites. Every record contains an item, a URL, selected excerpts, and an answer. The grader re-fetches the page and checks usability, clarity, faithfulness, and support.

Binary record verdicts roll up through the hierarchy. **Precision** measures the quality of what the system submitted. **Recall** measures quality-adjusted completion against the requested volume. **F1** balances the two. **Soft scores** give partial credit to incomplete members; **hard scores** count only members whose full required subtree is correct.

## What we found

Six production systems were compared: Perplexity Search as Code (SaC), Anthropic, OpenAI, Exa, Gemini, and Parallel. Key results:

- **Perplexity Search as Code leads** at 0.363 soft F1 and 0.133 hard F1.
- **Anthropic is second** at 0.249 and 0.072.
- Every other system tops out at 0.121 soft F1 and 0.035 hard F1.
- Perplexity costs $5.20 per task, 14.9-min median solve time, 3.82M tokens per task.

**Four findings stand out:**

1. **Partial progress is common; complete coverage is not.** Soft recall is below soft precision for every system. The best hard precision is 0.150 and best hard recall is 0.134.

2. **Scale compounds the problem.** From smallest to largest target-volume bin, Perplexity's hard precision drops from 0.235 to 0.096.

3. **Deeper hierarchies are harsher.** Going from no intermediate key to three or more, Perplexity's hard precision falls from 0.392 to 0.019 and hard recall from 0.378 to 0.017.

4. **Discovery is the first structural bottleneck.** Mean top-level discovery completion ranges from 0.611 to 0.951. The largest raw structural losses occur before the final URL is attached.

## What's next

WANDR provides per-record verdicts and hierarchy-level scores showing where a run fails: discovery, enrichment, identity handling, semantic qualification, or evidence construction. The same structure may also make WANDR useful for reinforcement learning, using record- and branch-level judgments rather than a single sparse terminal reward.

The benchmark tasks, evaluation harness, and full technical report are available on GitHub.
