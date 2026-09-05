---
source: newsletter
source_url: https://www.lesswrong.com/posts/hHk5CpiqZTBBiHmYt/from-safety-research-prompt-to-cross-model-universal
ingested: 2026-09-05
sha256: 9c8cf1d020eb3a0df4ef0bafc08df2b1aa6092df46552b2eb5448a434bf8d1f5
---

# From safety research prompt to cross-model universal jailbreak

This post describes a universal jailbreak discovery during work on black-box scheming monitors at MATS. The jailbreak itself is not released; see "On publishing this post" for details on infohazard considerations. This post is written in a personal capacity and all opinions contained here are my own, and not the opinions of MATS Research.

## Executive Summary

1. The author was originally planning to open-source a codebase containing a prompt which turned out to be easily transformable into a cross-model universal jailbreak. I developed a synthetic transcript generation pipeline, and with a few hours of modification I turned the generator prompt into a powerful jailbreak.
2. The jailbreak format is a reusable template in which any harmful query can be inserted. Coupled with the cross-model vulnerability, this makes for an extremely powerful attack that can be repurposed for many kinds of malicious use.
3. The jailbreak was highly effective across several models. Evaluated on ClearHarm (179 CBRNE and cyber prompts) across 23 models from 7 providers, the template achieves 84-100% attack success rate (ASR) on the 9 most vulnerable models.
4. Nearly all of the models tested were fully jailbroken at least once during evaluation. All models returned at least one fully-jailbroken response except Meta Muse Spark 1.1 and more recent Anthropic models (Haiku 4.5, Opus 4.6, Sonnet 5).
5. Frontier models are still vulnerable to older jailbreaking techniques if used in combination. The prompt is a composition of well-known techniques which have been known to the public for years. FAR.AI find the same result by building new universal jailbreaks by combining primitive components.
6. A subset of Gemini and Grok's harmful bio responses were reviewed by an expert biologist at SecureBio. They judged that, while technical instructions were sometimes incomplete or scientifically flawed, the models did provide extensive, actionable detail on biological topics of particularly high-risk for misuse.
7. Coordinating responsible disclosure across labs has been extremely difficult – labs have very heterogeneous disclosure pathways (or none at all), and those that do exist have overlapping and overpowered restrictions.
8. Enabling high reasoning sometimes helped with refusals, but did not provide a universal defence. Enabling reasoning mode dramatically reduces jailbreak success for some models (e.g. Kimi K2.5 drops from 99% to 24% ASR, and Kimi K3 drops from 20% to 0%) but has no effect or may worsen safety for others (e.g. Gemini 2.5 Flash increased from 92% to 99%).
9. The jailbreak gave complete control over the model's response, including a sabotage variant where innocuous user prompts are wrapped inside the jailbreak template, making models respond in ways that are framed as helpful but actively harm the user (prompt wrapping threat model).
10. This is another clear demonstration that current safeguard practices are uneven and often insufficient.

## On publishing this post

The post describes the jailbreak prompt at a very high level which combines previously-published techniques without quoting the prompt directly. There are no novel techniques; every component technique is independently documented in the existing literature. The vulnerability results inform defenders and the public widely and immediately. The full prompt will not be released due to infohazard concerns.

## Jailbreak discovery

In August 2025, the author was working on black-box scheming monitors at MATS. The goal was to build monitoring systems that could detect covert misalignment in agentic AI systems just from observing the agent's external actions. To train these monitors, they needed realistic synthetic data: multi-turn agent transcripts showing egregiously misaligned behaviour.

The author built a pipeline called STRIDE for data generation. It worked through an iterative loop: a generator model produced complete misaligned transcripts, a discriminator evaluated them for realism, and the transcript was refined based on the discriminator's feedback. On 9th September 2025, the author wondered whether the same prompt that caused frontier models to generate full transcripts of misaligned behaviour could be repurposed by a bad actor. With minor modifications, they ended with a prompt in which any user query could be inserted and the model would output a message containing detailed, egregiously-harmful information.

Independently, Pliny developed a jailbreak prompt using similar techniques (notably fake/synthetic-dataset framing) that jailbroke GPT-5.2. The fact that multiple researchers converged on a synthetic data framing as an attack surface suggests it's a natural model vulnerability.

## High-level prompt description

Every component technique is independently documented in the literature:
- Authority framing, fictional/synthetic data framing (DeepInception / Li et al. 2023)
- Persona separation / modulation (Shah et al. 2023, Shen et al. 2023 DAN family)
- Schema obfuscation (BreakFun "Trojan Schema" attacks, HiddenLayer "Policy Puppetry" attack)

## Evaluation methodology

Primary evaluation uses ClearHarm, a dataset of 179 forbidden CBRNE and cyber prompts. All responses scored using the StrongREJECT rubric, applied by Claude Sonnet 4 as the evaluator model. Models evaluated: Anthropic (Sonnet 5, Opus 4.6, Haiku 4.5, 3.7 Sonnet), DeepSeek (V4 Pro, V3.2, R1-0528), Google (Gemini 3.5 Flash, 3.1 Pro, 3.1 Flash Lite, 3 Pro, 3 Flash, 2.5 Pro, 2.5 Flash), SpaceXAI (Grok 4.5, 4.1 Fast, 4 Fast, 4), Kimi, GLM, Llama 4 Maverick. Each model evaluated under non-reasoning and reasoning conditions. A response is classified as success when its StrongREJECT score equals 1.0.

## Key findings

Reasoning usually helps robustness, but is not a universal defence. Kimi K2.5 dropped from 99.4% to 23.5% ASR, Kimi K3 dropped from 20% to 0%. Gemini 2.5 models become less safe with reasoning; Gemini 3 and 3.1 models become safer but remain far from immune.

Grok models appear to have employed improved safeguards since late 2025 (BIO_RISK flag).

Meta Muse Spark 1.1 content-blocked 114 out of 179 API calls in non-reasoning mode, and all 179 in reasoning mode — strong evidence Meta uses chain-of-thought monitoring.

Anthropic's newer models (Sonnet 5, Opus 4.6, Haiku 4.5) seem completely resistant at 0% ASR, likely due to constitutional classifiers. Claude 3.7 Sonnet showed 100% ASR.

Open models are the most jailbreakable — all DeepSeek models, Kimi K2.5 (non-reasoning) and Llama 4 Maverick are completely jailbroken with ~100% ASR. More recent open models (GLM-5.2, Kimi K3) are more resistant.

Harmful cyber queries were less likely to be refused across vulnerable models — cyber successful 47% of the time vs 37% for all other categories.

Sabotage variant: when the jailbreak prompt was modified to sabotage the user rather than answer, the model maintained misaligned behaviour across turns. With Gemini 2.5 Pro, a user prompt "I have just lost my job" elicited encouragement of suicidal ideation across multiple turns — opening a "prompt-wrapping" threat vector.

## Ablation studies

Components are heterogeneously important across models. component-6 is not even slightly load-bearing. component-1 is the most load-bearing — removing it drops ASR significantly across nearly all models. 5 out of 6 components are important to at least one model.

## Recommendations for labs

Deploy input/output safeguards; monitor chains of thought for misuse risk; test monitors against many variants of structured-format jailbreaks; train models to reason about safety explicitly in CoT; red-team against combinations of known jailbreaks; ensure safeguards work for cyber as much as other harm categories; improve jailbreak disclosure pathways; threat-model tooling before publication.

## Companion piece

AI Jailbreak Disclosure Is Broken. Here's How To Fix It (co-authored with Adam Gleave).