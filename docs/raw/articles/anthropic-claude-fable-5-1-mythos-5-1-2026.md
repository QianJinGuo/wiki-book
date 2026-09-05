---
source: newsletter
source_url: https://www.anthropic.com/claude-fable-and-mythos-5-1
ingested: 2026-09-03
source_published: 2026-09-01
sha256: 696a133f59346dbd0fdfb7b3976c5d7c275712215ffbbb004403e751950b011c
---

# Introducing Claude Fable 5.1 and Claude Mythos 5.1

We're introducing Claude Fable 5.1 and Claude Mythos 5.1. They're the world's most advanced models for coding and knowledge work—and their research capabilities offer an early glimpse of how AI models will contribute to scientific progress.

Claude Fable 5.1 and Claude Mythos 5.1 are the same model, but with different levels of safeguards. Fable 5.1 is generally available, while Mythos 5.1 is available only through our trusted access programs; its safeguards are specifically designed to support work in cybersecurity and the life sciences.

Alongside its increased capabilities, Fable 5.1 takes important steps towards addressing the feedback we've received from customers on price, data retention, and safeguards.

**Price.** Fable 5.1 will cost an estimated 25% less than Fable 5 for typical workloads, wherever usage is billed by token. This is because we're reducing our pricing on cache reads (where the model reads inputs that have already been processed and stored). For highly agentic work, the savings will often be much larger—up to approximately 45%.

**Data retention.** Our new system of Enterprise Frontier Safeguards (EFS) gives customers complete privacy (the same as a zero data retention policy) while still being state-of-the-art at preventing adversarial use. EFS works by storing data in cloud infrastructure controlled entirely by the customer, not Anthropic. It will be made available to enterprise customers in phases, beginning later this fall. Until EFS is available, eligible customers will be able to use Fable 5.1 with zero data retention.

**Safeguards.** We've improved our safeguards to reduce false positives (where the system flags benign content). In cybersecurity, our newest safeguards block 60% fewer false positives than before. In part, this is because Fable 5.1 can now be used to discover software vulnerabilities—though not to develop exploits for them. In biology, we've established an access program, developed in partnership with the US government, to enable access to Claude Mythos 5.1's advanced biology capabilities.

## A new performance frontier

Claude Fable 5.1 sets a new standard for coding, knowledge work, and long-running problem-solving tasks. When set to Low or Medium effort, Fable 5.1 achieves results similar to or better than Fable 5's at a much lower cost. (Note that Fable 5.1 defaults to High effort in Claude Code, and to Medium in Claude Cowork and on Claude.ai.)

### Benchmark Results

| Benchmark | Fable 5.1 | Fable 5 | Opus 5 | GPT-5.6 Sol |
|-----------|-----------|---------|--------|-------------|
| Agentic scientific research Terminal-Bench-Science 0.1 | 52.6% | 24.7% | 29.0% | 22.4% |
| Agentic coding Terminal-Bench 4.0 | 55.8% (60.9% Mythos) | 42.0% | 52.3% | 37.3% |
| Knowledge work GDPval-AA v2 | 1853 | 1723 | 1824 | 1711 |
| Computer use OSWorld 2.0 (partial) | 77.9% | 72.9% | 75.4% | — |
| Computer use OSWorld 2.0 (strict) | 41.7% | 36.1% | 39.6% | — |
| Multidisciplinary reasoning HLE (no tools) | 60.9% | 57.8% | 56.6% | — |
| Multidisciplinary reasoning HLE (with tools) | 65.0% | 63.8% | 63.6% | — |
| Business workflows AutomationBench | 31.4% | 17.1% | 26.9% | 19.6% |
| Agentic coding CursorBench 3.2.0 | 73.4% | 70.5% | 70.0% | 67.2% |

Fable 5.1 was evaluated with its production safeguards enabled.

## Scientific research

### Molecular design
Mythos 5.1 proved able to design very high-affinity binders. On three targets, its binding affinities were 10 times higher than the best designs submitted to Adaptyv Bio's protein design competitions. Its hit rate reached nearly 50% across 12 targets (typical hit rates are 10–15%).

### Computational analysis and modeling
Claude Fable 5.1 trained a neural network to create a new, high-resolution elevation map of a third of the planet Venus based on NASA's Magellan mission radar images. The new map reveals details down to 2-3 km resolution (vs 10-20 km before) and shows heights up to 25% more accurately. Released under Creative Commons license.

## Safety, security, and alignment

### Cybersecurity
Fable 5.1 can discover software vulnerabilities but cannot develop exploits for them. Our newest safeguards block 60% fewer false positives than before.

### Biology
An access program developed with the US government enables access to Mythos 5.1's advanced biology capabilities.

## Enterprise Frontier Safeguards (EFS)

EFS gives customers complete privacy (equivalent to zero data retention) while maintaining state-of-the-art adversarial use prevention. Data is stored in cloud infrastructure controlled entirely by the customer, not Anthropic. Available in phases starting fall 2026.

## Partner Testimonials

- **Jane Street Capital**: "Fable 5.1 solves more of our coding problems than Fable 5 or Opus 5, and achieves state of the art on trading intuition."
- **Cognition**: "We're moving our Opus 5 traffic in Devin to Claude Fable 5.1 on launch day."
- **Millennium**: "Fable 5.1 found the cause of a rare crash that none of our engineers had been able to explain after several years of trying."
- **MongoDB**: "Claude Fable 5.1 built a complex prototype in about three days, running for hours unattended."
- **Every**: "Fable-level intelligence, Opus-level price, Sonnet-speed. About twice as fast as Opus 5."
- **IMC**: "Set new best scores on our research suite."
- **Red Hat**: "Correctly identified the root cause of every broken build we tested."
