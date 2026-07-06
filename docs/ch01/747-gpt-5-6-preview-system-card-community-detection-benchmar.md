# GPT-5.6 Preview System Card — Community Detection & Benchmarks

## Ch01.747 GPT-5.6 Preview System Card — Community Detection & Benchmarks

> 📊 Level ⭐⭐ | 5.7KB | `entities/gpt-5-6-preview.md`

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

## 第 2 来源 — 夕小瑶科技说：GPT-5.6 偷偷灰度，用户在 Codex 中提前用上

2026-07-02，夕小瑶科技说发布报道，披露 GPT-5.6 Sol 已在部分 Codex 用户中悄悄灰度上线。核心内容包括：

- **Juice 值检测法**：用户通过构造特定 prompt 暴露底层模型。GPT-5.5 在 xhigh 模式下 Juice 值为 768，GPT-5.6 Sol 为 128。方法在开发者社区广泛传播。
- **定价**：Sol 输入 $5/百万 tokens，输出 $30/百万；Luna 输入 $1、输出 $6；Terra 价格减半。
- **上下文提升**：从 GPT-5.5 的 105 万 tokens 拉至 150 万（+43%）。
- **Terminal-Bench 2.1**：Sol Ultra 模式 91.9%（最高），超过 Mythos 5（84.3%）和 Fable 5（83.4%）。
- **ExploitBench**：Sol 接近 Mythos Preview，但输出 tokens 节约 2/3。
- **Prompt Caching**：新增显式 cache breakpoints，最低 30 分钟缓存生命周期。
- **官方矛盾**：OpenAI 公告称“仅对政府批准合作伙伴开放”，但 48 小时后土耳其 Plus 用户在 Codex 中可用。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gpt-5-6-偷偷灰度-codex提前用上-夕小瑶-2026-07-04.md)

---

