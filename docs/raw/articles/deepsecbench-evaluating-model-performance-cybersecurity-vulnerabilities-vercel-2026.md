---
source_url: http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities
source: newsletter
feed_name: Vercel Blog
source_published: 2026-07-28
ingested: 2026-07-29
sha256: 63d0cebf1242dc52352b28eabf2519fc6dbea5cc50d3cdf48c32cf6079b8b3c2
---

# DeepsecBench: evaluating model performance in finding cybersecurity vulnerabilities

Last week, OpenAI evaluated two models on an exploit benchmark within an isolated sandbox. Guardrails were reduced for testing, and the models found a vulnerability in their environment, accessed the internet, and reached Hugging Face's production database.

No human directed the action, but the breach is a clear example of how much more capable malicious attackers are when equipped with powerful AI models. But defenders have the same tools, and a clear advantage: knowledge of their own codebase. Hacks are initiated from the outside, so the single best defense is finding vulnerabilities from the inside before attackers do.

Today we're releasing [DeepsecBench](https://vercel.com/ai-gateway/leaderboards/deepsecbench), a benchmark that evaluates how well different models find cybersecurity vulnerabilities in application code. For each model the report includes recall, precision, cost, and total time, and combines recall and precision into a single benchmark score. Here is a sample of model performance from the leaderboard:

| Rank | Model | Level | Score | Cost | Total time |
| --- | --- | --- | --- | --- | --- |
| 1 | **GPT-5.6 Sol** | xhigh | **35.58** | $55.98 | 03:39:00 |
| 3 | **Claude Opus 5** | medium | **28.36** | $31.96 | 00:47:01 |
| 8 | **Kimi K3** | high | **17.56** | $12.38 | 01:59:00 |
| 10 | **Grok 4.5** | high | **15.58** | $5.60 | 01:24:00 |

We built [deepsec](https://deepsec.sh/) to make scanning as easy as possible. Now you can use the benchmark report to build a security scanning program that fits your budget and the complexity of your codebase, choosing the right mix of models to run and how often to run them.

## [Copy link to heading](http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities#how-the-benchmark-works)How the benchmark works

DeepsecBench runs on an open-source codebase at a commit state just before a large number of vulnerabilities were fixed. We selected 50 entry-point files and built a golden set of 231 human-judged findings. Each model's score is a recall-weighted F2 (Score = 100 × 5PR/(4P+R)), weighting recall (R) twice as much as precision (P), because missed vulnerabilities will go unfixed, while false positives don't make your codebase less secure.

Findings beyond the golden set are classified by a judge model as real or false, and count for or against the model in the precision measure (recall measures only the 231 known findings).

The benchmark is run three times and the data published in the report is the median of the three runs.

The construction of the benchmark stays secret. We don't disclose the repository, the commit, the files, or the findings, so there is nothing for models to train against. A model reciting memorized fixes would score near-total recall. Instead, the best run finds 30.7%, and 20 of the 25 runs come in under 20%.

## [Copy link to heading](http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities#the-cost-of-capable-analysis-is-falling)The cost of capable analysis is falling

When we [introduced `deepsec`](http://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base), thorough scanning on production codebases required using the most capable models, and they were expensive to run. Frontier models from OpenAI and Anthropic still score highest, but open-weight models and more efficient reasoning options are closing that gap, making comprehensive scanning far more cost-efficient.

Today, higher price does not buy proportionally more. [Kimi K3](https://vercel.com/ai-gateway/models/kimi-k3), from Moonshot AI, ranks eighth at a score of 17.56 for $12.38 on the high setting, half the top score for about a fifth of the cost. [Grok 4.5](https://vercel.com/ai-gateway/models/grok-4.5) set to high delivers near-Kimi performance for less than half the cost, scoring 15.58 for only $5.60. [GPT-5.6 Sol](https://vercel.com/ai-gateway/models/gpt-5.6-sol?__vercel_draft=1) set to medium offers the best score-to-cost balance of the top-performing models, taking fifth place with a score of 25.10 at a cost of $17.95.

You can interact with and download these charts on the [DeepsecBench page](https://vercel.com/ai-gateway/leaderboards/deepsecbench).

Anthropic's most capable model, Fable 5, is absent because it declines security work, including defensive tasks. We will add security-enabled versions to the benchmark when they are made available.

| Rank | Model | Level | Score | Recall | Precision | Issues | Cost | Total time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **GPT-5.6 Sol** | xhigh | **35.58** | 30.7% | 96.3% | 71/231 | $55.98 | 03:39:00 |
| 2 | **Claude Opus 5** | max | **32.57** | 28.1% | 88.0% | 65/231 | $127.93 | 02:34:00 |
| 3 | **Claude Opus 5** | medium | **28.36** | 24.7% | 70.5% | 57/231 | $31.96 | 00:47:01 |
| 4 | **GPT-5.6 Luna** | xhigh | **26.79** | 22.9% | 81.2% | 53/231 | $24.59 | 03:01:00 |
| 5 | **GPT-5.6 Sol** | medium | **25.10** | 21.2% | 94.3% | 49/231 | $17.95 | 00:30:52 |
| 6 | **GPT-5.5** | xhigh | **21.20** | 17.7% | 95.5% | 41/231 | $43.42 | 02:22:00 |
| 7 | **GPT-5.6 Terra** | xhigh | **19.21** | 16.0% | 95.3% | 37/231 | $27.81 | 01:45:00 |
| 8 | **Kimi K3** | high | **17.56** | 14.7% | 77.1% | 34/231 | $12.38 | 01:59:00 |
| 9 | **Grok 4.5** | medium | **16.54** | 13.9% | 73.3% | 32/231 | $11.04 | 01:37:00 |
| 10 | **Grok 4.5** | high | **15.58** | 13.0% | 77.8% | 30/231 | $5.60 | 01:24:00 |
| 11 | **GPT-5.5** | medium | **12.63** | 10.4% | 92.3% | 24/231 | $14.94 | 00:24:05 |
| 12 | **GPT-5.6 Terra** | medium | **12.12** | 10.0% | 92.0% | 23/231 | $5.15 | 00:13:15 |
| 13 | **GPT-5.6 Luna** | medium | **12.08** | 10.0% | 82.8% | 23/231 | $5.23 | 00:11:59 |
| 14 | **Gemini 3.6 Flash** | medium | **11.56** | 9.5% | 80.0% | 22/231 | $10.74 | 00:26:21 |
| 15 | **Kimi K3** | medium | **11.48** | 9.5% | 64.1% | 22/231 | $10.84 | 01:29:00 |
| 16 | **GLM-5.2** | medium | **10.46** | 8.7% | 62.5% | 20/231 | $11.09 | 01:03:00 |
| 17 | **GLM-5.2** | high | **9.90** | 8.2% | 53.8% | 19/231 | $51.84 | 02:30:00 |
| 18 | **Gemini 3.6 Flash** | high | **8.99** | 7.4% | 77.3% | 17/231 | $5.33 | 00:22:18 |
| 19 | **Claude Opus 4.8** | max | **6.91** | 5.6% | 81.3% | 13/231 | $7.56 | 00:19:29 |
| 20 | **Claude Opus 4.8** | medium | **6.88** | 5.6% | 61.9% | 13/231 | $10.81 | 00:18:16 |
| 21 | **Inkling** | high | **6.32** | 5.2% | 48.0% | 12/231 | $1.93 | 00:11:34 |
| 22 | **Inkling** | medium | **5.26** | 4.3% | 37.0% | 10/231 | $2.18 | 00:10:31 |
| 23 | **Claude Haiku 4.5** | default | **4.73** | 3.9% | 33.3% | 9/231 | $5.91 | 00:29:40 |
| 24 | **Gemini 3.5 Flash Lite** | medium | **2.14** | 1.7% | 44.4% | 4/231 | $0.58 | 00:01:46 |
| 25 | **Gemini 3.5 Flash Lite** | high | **1.07** | 0.9% | 28.6% | 2/231 | $0.18 | 00:01:07 |

The costs reported in the benchmark cover 50 files. A production codebase can run on the order of 100 times that, pricing a full pass at roughly $1,200 for a Kimi K3 sweep, or over $5,000 for the top-scoring frontier model from OpenAI.

## [Copy link to heading](http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities#building-a-scanning-program-across-multiple-models)Building a scanning program across multiple models

Because security scanning is recurring work, the question is which model to use for which task, and when. For example, frontier models can be used for periodic deep audits, while cheaper models like Kimi K3 or Grok 4.5 run scans at a higher cadence. Turning GPT-5.6 Sol's reasoning down from xhigh to medium moves it from 35.58 in 3 hours, 39 minutes to 25.10 in just over 30 minutes, fast enough for reviewing new features before they are pushed to production.

A startup might scan every merge with Grok 4.5 and save more expensive audits for milestone releases. A large enterprise might run frontier audits on its critical services, the same model at lower reasoning on key pull requests, and a continuous Kimi-class or Grok sweep across the rest of the codebase.

## [Copy link to heading](http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities#running-the-benchmark-on-one-endpoint)Running the benchmark on one endpoint

Security scans are spiky workloads that consume a large number of tokens in a short time window, and that burst capacity is hard to buy from any single provider directly. Every DeepsecBench run goes through [AI Gateway](https://vercel.com/ai-gateway). The gateway gives us a single endpoint to reach each model. During runs, routing, retries, and failover happen automatically, without any per-provider keys or rate limits to manage.

The same routing we use for the benchmark can run your security scanning program. Pass `provider/model` to `deepsec`, and one `AI_GATEWAY_API_KEY` in your environment covers every model on the board (or on a linked Vercel project, access AI Gateway via OIDC).

`pnpm deepsec process --project-id my-app --agent pi --model xai/grok-4.5`

Use AI Gateway to balance model power and cost for different deepsec security scans.

## [Copy link to heading](http://vercel.com/blog/deepsecbench-evaluating-model-performance-in-finding-cybersecurity-vulnerabilities#find-your-vulnerabilities-first)Find your vulnerabilities first

Attackers can use AI models, but they act from the outside. Defenders can see their entire system: the source, the architecture, the history. That visibility makes the same models more powerful in your hands than in theirs, because a model that can read the source finds what an attacker can only probe for. The advantage is real, but it only counts if you use it first.

We will continue to update [DeepsecBench](https://vercel.com/ai-gateway/leaderboards/deepsecbench) with new models as they are released and measured.

[**Run a security scan with deepsec** Build a security scanning program with deepsec and AI Gateway. Get started](https://github.com/vercel-labs/deepsec/blob/main/docs/getting-started.md)