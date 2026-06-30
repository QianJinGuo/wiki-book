# GPT-5.6 Preview System Card - OpenAI Deployment Safety Hub

## Ch01.766 GPT-5.6 Preview System Card - OpenAI Deployment Safety Hub

> 📊 Level ⭐⭐ | 3.8KB | `entities/gpt-5-6-preview.md`

# GPT-5.6 Preview System Card - OpenAI Deployment Safety Hub

> **Source**: [deploymentsafety.openai.com](https://deploymentsafety.openai.com/gpt-5-6-preview)

Novel research/architecture for GPT-5.6 model family with detailed system card including safety evaluations, capability benchmarks (cybersecurity, biological risk), and mitigation strategies. High technical depth with specific claims, data, and verifiable sources (OpenAI Deployment Safety Hub). Value*confidence=81 >= 49 and stars=5, so ingest is true.

## Content Summary

Markdown Content:
## 1. Introduction

GPT-5.6 is a new family of three models: Sol, our new flagship model; Terra, a capable lower-cost option; and Luna, our fastest and most cost-efficient model. The safeguards we have built for this launch—our most robust yet—are built to deliver these models safely and at scale, around the world.

We believe in broad access, and we plan to make GPT-5.6 Sol, Terra, and Luna generally available in the coming weeks. As part of our ongoing engagement with the U.S. government, we previewed our plans and the models’ capabilities ahead of today’s launch. At their request, we are starting with a limited preview for a small group of trusted partners whose participation has been shared with the government, before releasing more broadly. During this preview, we will continue testing and coordinating closely with partners as we work toward broader availability.

Under our Preparedness Framework, we are treating Sol, Terra and Luna as High capability in both Cybersecurity and Biological and Chemical risk. None of them reach our High threshold in AI Self-Improvement. We have implemented a tailored set of [safeguards](https://deploymentsafety.openai.com/gpt-5-6-preview/safeguards), adapted to each model’s capability profile, to sufficiently minimize the associated risks.

This system card is a detailed report of the work we did to understand and mitigate GPT-5.6’s safety risks before deployment. The five most important things to know are that:

1.   **These models are a meaningful step up in cybersecurity capability, but they do not reach our risk framework’s highest level (Critical).** GPT-5.6 Sol and Terra can find vulnerabilities and pieces of exploits, but in [cybersecurity testing](https://deploymentsafety.openai.com/gpt-5-6-preview/cybersecurity-capabilities) they were unable to carry out autonomous, end-to-end attacks against hardened targets. Separate evaluations examined [misaligned behavior in agentic coding tasks](https://deploymentsafety.openai.com/gpt-5-6-preview/forecasting-misaligned-behavior-with-deployment-simulation-of-internal-traffic) and found GPT-5.6 shows a greater tendency than GPT-5.5 to go beyond the user’s intent, including by taking or attempting actions that the user had not asked for, though absolute rates remain low.

2.   **To make these models safe, we added new technology to a safety stack that is more than the sum of its parts.** The models are [trained to be safe](https://deploymentsafety.openai.com/gpt-5-6-preview/model-safety-training-and-evaluation), Sol and Terra are served with [newly added activation classifiers](https://deploymentsafety.openai.com/gpt-5-6-preview/monitor-design) focused on sensitive domains that watch the model and can intervene to stop unsafe answers during generation, and certain conversations are scanned so unsafe outputs are blocked in real time if they cross safety boundaries. We also have automated safety systems that look for unsafe patterns across conversat

---

