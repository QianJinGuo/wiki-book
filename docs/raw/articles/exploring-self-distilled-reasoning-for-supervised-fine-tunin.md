---
title: "Exploring Self-Distilled Reasoning for SFT"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/exploring-self-distilled-reasoning-for-supervised-fine-tuning-with-amazon-nova
ingested: 2026-07-24
feed_name: AWS China ML
source_published: 2026-07-21
sha256: 2cc1cabef7009c164335a4e34fa5b0d3c1393b3c7fe91f1f05d51cd22be1e2e8
---

# Exploring self-distilled reasoning for supervised fine-tuning with Amazon Nova

When you fine-tune a model using Supervised Fine-Tuning (SFT), creating high-quality chain-of-thought (CoT) reasoning traces for your training data is often impractical and can be prohibitively expensive. As a result, you might choose to skip reasoning during SFT and train with only inputs and outputs. However, reasoning is a key capability of the [Amazon Nova 2](<https://aws.amazon.com/nova/models/>) family of models, and it’s been shown to significantly enhance prediction performance in Nova and other frontier models, often with performance gains on hard problems like coding and math. With Amazon Nova 2 customization, you can use the power of thinking models on your specific domains through techniques such as SFT and Reinforcement Fine-Tuning (RFT). For SFT, a key requirement to unlock these gains is the availability of golden CoT traces in the SFT dataset, that is, thinking traces from a strong teacher model that have been further validated and cleaned.

In this post, we explore an idea for generating thinking tokens for datasets that lack reasoning traces in SFT customization. We first examine the reasoning suppression problem, then introduce Self-Distilled Reasoning (SDR), validate it across three benchmarks, and provide practical recommendations. SDR re-uses the chain of thought from the base Amazon Nova 2 Lite model as a stand-in for non-reasoning datasets. Through our experiments we make a few observations on the impact of introducing SDR, from improving target performance to mitigating [catastrophic forgetting](<https://arxiv.org/abs/2501.17161>). This is in line with a growing body of work that is discovering the importance of distilling information from a model into itself during training, otherwise known as [self-distillation](<https://arxiv.org/html/2601.19897v1>).

The following figure illustrates how SDR compares with vanilla SFT and model merging across target performance and math retention. Model merging is a straightforward approach to retain previously acquired skills, that takes an SFT checkpoint and merges it back to the base model (before SFT). However, merging often comes at the expense of forgoing gains obtained on the SFT checkpoint because of catastrophic forgetting which manifests as a trade-off between target and general performance. SDR on the other hand mitigates this issue with similar or better target performance as pure SFT (with no merging) while retaining most of general performance.

Because of catastrophic forgetting, we observe that SFT on a dataset can lead to previous knowledge being completely lost. For instance, we find that vanilla SFT leads to Math performance dropping from 70 percent (base) to 6 percent on average (Table 2). With SDR, we’re able to almost entirely recover it back. Self-distilled reasoning allows us to retain the base model’s capabilities without compromising on target performance, and in many cases it improves target performance as well. Model merging is a common solution to mitigate catastrophic forgetting, but SDR achieves this retention more effectively.

SDR provides in-training regularization by augmenting the dataset with the model’s own reasoning traces. It doesn’t require a separate teacher model or post-hoc interpolation. This approach requires no human annotation, is applicable to existing SFT datasets regardless of domain, and is more effective than model merging at preserving both target and general performance.

Compared with model merging, self-distillation yields nearly identical math performance (70 percent compared to 68 percent) while improving target performance by over 6.5 percent on average at the same time. This finding aligns with recent [research](<https://arxiv.org/html/2601.19897v1>) that advocates self-distillation as a powerful mechanism to mitigate catastrophic forgetting.

## Background: SFT on datasets without reasoning tokens may result in loss of reasoning ability

Before introducing the approach, it is important to understand why SFT on datasets without reasoning traces leads to degraded model performance. This section examines the reasoning suppression problem, quantifies the impact of reasoning on target performance, and discusses model merging as an existing recovery mechanism.

### The reasoning suppression problem

SFT training on non-reasoning datasets with reasoning mode active leads to a critical issue: the model loses its ability to reason during inference, even when you explicitly turn on reasoning mode. We hypothesize that this phenomenon occurs because the training objective calculates loss on both reasoning and output tokens together. When training data contains only input-output pairs without intermediate reasoning steps, the model receives no supervision signal for generating coherent reasoning traces. The loss function effectively penalizes tokens that don’t directly contribute to the final output, training the model to bypass its reasoning mechanisms. This behavior [exemplifies shortcut learning](<https://arxiv.org/abs/2004.07780>), where models rely on spurious correlations rather than learning robust reasoning patterns.

### Quantifying the impact of reasoning

Despite the suppression issue, turning on reasoning during both training and inference produces significant benefits in target performance. To confirm fair comparison, we maintain consistency between train and inference settings: comparing reasoning-on during both training and inference versus reasoning-off during both training and inference. Our experiments reveal that turning on reasoning during training and inference leads to a significant improvement. The following table demonstrates this effect on the LLaVA CoT dataset with varying LoRA (Low-Rank Adaptation) merge weights.

**Merge weight** | **Target perf (reasoning on)** | **Target perf (reasoning off)** | **Delta**  
|---|---|---|---|---|---  
Nova 2 Lite | None | No | No | – | 55.60% | 12.90%  
Nova 2 Lite | None | No | Yes | – | 55.40% | 70%  
MedMCQA | None | No | Yes | Yes | 60.50% | 8.30%  
MedMCQA | None | No | Yes | No | 63.80% | 0%  
MedMCQA | Nova 2 Lite Basic | Yes | Yes | No | 66.60% | 67.90%  
MedMCQA | Nova 2 Lite Guided | Yes | Yes | No | 65.70% | 59.60%  
Nova 2 Lite | None | No | No | – | 45% | 12.90%  
Nova 2 Lite | None | No | Yes | – | 45% | 70%  
CoCoHD | None | No | Yes | Yes | 59.30% | 70%  
CoCoHD | None | No | Yes | No | 61.30% | 6.30%  
CoCoHD | Nova 2 Lite Basic | Yes | Yes | No | 55.40% | 73.80%  
CoCoHD | Nova 2 Lite Supervised | Yes | Yes | No | 61.30% | 65.80%  
Nova 2 Lite | None | No | No | – | 82.10% | 12.90%  
Nova 2 Lite | None | No | Yes | – | 81.40% | 70%  
Invoice-OCR | None | No | Yes | Yes | 82.30% | 70.80%  
Invoice-OCR | None | No | Yes | No | 88.10% | 9.60%  
Invoice-OCR | Nova 2 Lite Basic | Yes | Yes | No | 86.10% | 67.10%  
Invoice-OCR | Nova 2 Lite Supervised | Yes | Yes | No | 87.90% | 67.90%  
  
Table 2: SDR results across three benchmarks. Rows are grouped by dataset. All SDR rows use merge weight 1.0 (no merging needed).

## SFT with partial or missing reasoning traces

Reasoning data can be expensive or difficult to curate, and as a result we often encounter situations where only a portion of the SFT dataset contains reasoning. To better understand how SFT behaves in this situation we conduct an ablation study next. We also explore how SDR can help in this situation as a low-overhead and cost-effective alternative.

#### SFT training with only partial reasoning traces

In this study, we examine the effect of SFT when only a subset of the dataset contains reasoning, which simulates common real-world scenarios for many users. We ran ablations with reasoning traces for LoRA SFT on 10k training samples from LLaVA CoT benchmark. The eval benchmark for this is MathVista where the base model struggles (12.3 percent) mainly because of formatting inconsistencies and LoRA SFT shows a large improvement (34.4 percent).

#### Math (control) benchmark — catastrophic forgetting

The Math (control) benchmark measures whether the model retains general mathematical reasoning capability after SFT. This is a notable finding: without SDR prefill, general math capability collapses from 68% to 3% as you reduce the percentage of reasoning data in training. With SDR, it stays stable at 65–72 percent regardless of how much reasoning data you include.

#### Key insight

**Without SDR:** Reducing reasoning data below 75 percent causes catastrophic forgetting on Math control: 66.6 percent to 21.7 percent to 3.3 percent to 2.5 percent. The model loses its general math capability entirely.

**With SDR:** Math (control) stays stable at 64–72 percent across all data percentages, even with 0 percent reasoning data. SDR prefill completely prevents catastrophic forgetting.

#### Median reasoning tokens at inference

This chart shows the token budget spent on reasoning traces during inference. SDR models produce more reasoning tokens (400–860). Models trained with less than or equal to (≤) 25 percent reasoning data and no prefill produce zero reasoning tokens. This means they have completely lost the ability to reason step-by-step.

#### Key insight

**SDR teaches reasoning behavior:** Even with 0 percent reasoning data in training, SDR prefill causes the model to produce 859 median reasoning tokens. Without SDR at less than or equal to (≤) 25 percent reasoning data, the model produces zero tokens. It has forgotten how to reason.

**Base model comparison:** The base Amazon Nova 2 Lite model produces 1,254 median reasoning tokens. After SFT with 100 percent reasoning data, this drops to 367, and the model becomes more efficient (fewer tokens for the same or better accuracy).

#### MathVista (target) — reasoning on versus off

This chart compares MathVista accuracy with reasoning enabled and disabled at inference time. Enabling reasoning at inference has the greatest impact. It roughly doubles performance regardless of training data composition.

#### Key insight

Reasoning on at inference consistently delivers 35–47 percent accuracy, compared to 14–22 percent with reasoning off. This is roughly a 2x improvement.

**Best configuration:** 50 percent reasoning data plus SDR prefill achieves 45.2 percent MathVista with 70.4 percent Math control, avoiding forgetting while maximizing target performance.

**Without reasoning at inference,** performance drops to near base-model levels (approximately 15–22 percent), regardless of training composition. The model needs the reasoning step to perform well on this benchmark. A notable observation here is that training with SDR prefill (that is, with reasoning enabled) results in better eval performance even with reasoning disabled during inference time. For example, when only 75 percent of the dataset is missing CoT supervision, SDR prefill boosts eval performance by over 5pp even with reasoning disabled at inference (16.4 percent to 21.3 percent), indicating that SDR has an impact in how the model solves a task even when reasoning is disabled.

## Conclusions and recommendations

Our experiments across three benchmarks (MedMCQA, CoCoHD, Invoice-OCR) and an ablation on partial-reasoning datasets (LLaVA-CoT) converge on a consistent finding: Self-Distilled Reasoning (SDR) offers a zero-cost approach that simultaneously improves target performance and preserves general capabilities, without requiring model merging.

The starting point for these findings is that reasoning is fragile under vanilla SFT. Training on data without reasoning traces causes reasoning suppression: the model shortcuts to the answer and loses general skills, with Math accuracy collapsing from 70 percent to 0 percent. Model merging partially recovers these skills, but it introduces a trade-off between target and general performance that is hard to tune and adds a checkpoint-mixing step to the training pipeline.

SDR removes this trade-off. By augmenting the dataset with the base model’s own reasoning traces, SDR retains general performance at Math ≈ 68 percent while delivering a over 6.5 percent relative gain in target performance over the best model-merging checkpoints, with no additional annotation cost. The approach holds up even when the base model is weak on the target domain: on MedMCQA, where the base model scores 55.6 percent, SDR lifts target accuracy by approximately three pp (63.8 percent to 66.6 percent) and recovers Math from 0 percent to 67.9 percent. In other words, SDR works both when the base model has latent domain skill to unlock and when it doesn’t.

The benefit extends to mixed-reasoning training, where only a fraction of the SFT samples carry reasoning traces. This is a common real-world setting since reasoning data is expensive to curate, and our LLaVA-CoT ablation shows it is also fragile. General capability holds up at 75 percent reasoning coverage (Math 66.6 percent) but collapses sharply below that: at 50 percent Math drops to 21.7 percent, at 25 percent to 3.3 percent, and at 0 percent to 2.5 percent. Target accuracy moves non-monotonically across these mixes, so there is no safe dilution point. Pre-filling the missing traces with Nova 2 Lite removes the cliff entirely: Math stays in the 65–71 percent range across all mixes, and 50 percent SDR reaches 45.2 percent target accuracy, higher than the 34.4 percent seen with 100 percent human-authored reasoning. The gain also transfers to reasoning-disabled inference, so teams can patch their datasets once and keep their existing serving path.

One caveat shapes the recommendation on which teacher to use. A stronger teacher isn’t always better: Amazon Nova 2 Pro (Preview) traces improve target accuracy but cause a proportional drop in general performance, consistent with prior findings that a [large student-teacher gap hurts distillation](<https://aclanthology.org/2025.findings-acl.1301.pdf>). Lite-generated traces offer the most balanced outcome across target and general performance and are the default we recommend.

Taken together, these results point to a practical practitioner path: use SDR with same-family traces (Amazon Nova 2 Lite for Amazon Nova 2 Lite customers) as the default SFT recipe, apply it as a gap-filler whenever reasoning coverage is below roughly 75 percent, and reserve stronger-teacher or guided-reasoning variants for cases where the base model is weak on the target domain and the general-capability cost is acceptable. The broader implication is that SDR is a useful inductive bias for continual learning settings where new skills arrive over time and previously learned skills need to be preserved. Combining it with data mixing and light merging is a natural next step to explore.

## Practitioner decision guide

Use this guide to determine when to use Self-Distilled Reasoning (SDR), model merging, or standard SFT based on your data composition and latency constraints.

 

| **Scenario** | **Recommendation**  
---|---|---  
1 | **Default or new SFT job without reasoning, but seeing regression on general performance** | If latency sensitive: Use model merging to recover general performance regression. If latency constraints accommodate reasoning: Use SDR with Nova 2 Lite-generated reasoning traces. This gives the best balance of target performance and general capability preservation (often higher than with model merging)  
2 | **Base model is weak on target domain** | Consider guided reasoning to provide additional signal during trace generation.  
3 | **Dataset already has partial reasoning (≥ 50%)** | We recommend training with reasoning turned on. The existing traces are sufficient to preserve general skills.  
4 | **Dataset has < 50% reasoning traces** | If latency constraints allow for reasoning during inference, pre-fill missing traces with Nova 2 Lite reasoning (one-time, offline). Without this, general performance will collapse.  
5 | **You do not need general capabilities** | Reasoning data has minimal impact on target performance. Standard SFT is fine.  
6 | **Continual learning or multi-skill preservation** | Consider combining SDR with data mixing and a small (or zero) merge weight for the best retention of previously learned skills.  
7 | **You still want to use model merging** | We recommend using a smaller merge weight when SDR is applied. SDR already provides the regularization that merging was compensating for.  
  
For more information about Amazon Nova models and customization options, see the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>). To get started with SFT customization, see the [Amazon Bedrock model customization guide](<https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html>). If you have questions or want to share your experience with SDR, reach out to your AWS account team.

* * *

## About the authors

### Rushil Anirudh

Rushil is an Applied Scientist on the Forge team, where he works on the science behind SFT — making LoRA and full fine-tuning more accurate and reliable for frontier model customization. His research spans generative models across vision and language, model robustness, and uncertainty quantification. Outside work, he’s usually hunting down good food in the Bay Area or reading history and first-contact sci-fi.

### Shiva Mahalingam

Shiva is a Senior Solutions Architect in the Engineering, Construction, Real Estate, and Transportation (ECRT) segment at AWS. He works with enterprise customers to design and implement cloud-native architectures, with a focus on data for agents, model customization, and agentic AI solutions. He helps organizations navigate the complexities of fine-tuning, prompt engineering, and domain adaptation to unlock business value from their data. He is passionate about enabling customers to move from experimentation to production-ready AI workloads on AWS. When not working, he listens to music and plays percussion instruments.

### Anupam Dewan

Anupam is a Senior Solutions Architect working in Amazon Nova team with a passion for generative AI and its real-world applications. He focuses on Nova customization and Amazon Nova Forge, helping enterprises realize the true potential of LLMs with power of customization. He is also passionate about teaching data science, and analytics and helping Enterprise build LLMs that work for their businesses. Outside of work, you can find him hiking, volunteering or enjoying nature.
