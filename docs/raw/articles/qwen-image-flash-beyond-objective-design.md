---
source_url: "https://arxiv.org/abs/2606.03746"
ingested: 2026-06-26
sha256: ceefec74955ba99e
---

Title: Qwen-Image-Flash: Beyond Objective Design

URL Source: https://arxiv.org/html/2606.03746v2

Published Time: Thu, 04 Jun 2026 00:28:48 GMT

Markdown Content:
Tianhe Wu, Kun Yan, Zikai Zhou, Lihan Jiang, Jiahao Li, Jie Zhang, Kaiyuan Gao, Ningyuan Tang, Shengming Yin, Xiaoyue Chen, Xiao Xu, Yilei Chen, Yuxiang Chen, Yan Shu, Yixian Xu, Yanran Zhang, Zihao Liu, Zhendong Wang, Zekai Zhang, Deqing Li, Liang Peng, Yi Wang, Jingren Zhou, Chenfei Wu 

{wutianhe.wth, fulai.hr}@alibaba-inc.com

###### Abstract

Few-step distillation has become an effective strategy for accelerating advanced visual generative models, yet prior work has largely focused on distillation objectives. In this work, we revisit few-step distillation from a complementary perspective, focusing on the training recipe that critically shapes student performance. Using Qwen-Image-2.0 as a representative case, we systematically investigate three factors in unified text-to-image generation and instruction-guided image editing distillation: data composition, teacher guidance, and task mixture. Our empirical analysis reveals several non-obvious behaviors, which motivate the development of Qwen-Image-Flash. Overall, our results suggest that effective few-step distillation requires not only carefully designed objectives, but also principled organization of the broader training pipeline.

![Image 1: Refer to caption](https://arxiv.org/html/2606.03746v2/x1.png)

Figure 1: Qwen-Image-Flash examples. T2I and instruction-guided editing results with only 4 NFEs, showing unified few-step generation-editing capability.

###### Contents

1.   [1 Introduction](https://arxiv.org/html/2606.03746v2#S1 "In Qwen-Image-Flash: Beyond Objective Design")
2.   [2 Preliminaries: Flow Matching and DMD](https://arxiv.org/html/2606.03746v2#S2 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [2.1 Flow Matching](https://arxiv.org/html/2606.03746v2#S2.SS1 "In Preliminaries: Flow Matching and DMD ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [2.2 DMD Objective](https://arxiv.org/html/2606.03746v2#S2.SS2 "In Preliminaries: Flow Matching and DMD ‣ Qwen-Image-Flash: Beyond Objective Design")

3.   [3 Data Composition Matters in T2I Distillation](https://arxiv.org/html/2606.03746v2#S3 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [3.1 Training Setup](https://arxiv.org/html/2606.03746v2#S3.SS1 "In Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [3.2 T2I-Bench](https://arxiv.org/html/2606.03746v2#S3.SS2 "In Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design")
    3.   [3.3 Counterintuitive Effects of Data Diversity in T2I Distillation](https://arxiv.org/html/2606.03746v2#S3.SS3 "In Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design")

4.   [4 Stabilizing Complementary Teacher Guidance](https://arxiv.org/html/2606.03746v2#S4 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [4.1 Motivation](https://arxiv.org/html/2606.03746v2#S4.SS1 "In Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [4.2 Observation](https://arxiv.org/html/2606.03746v2#S4.SS2 "In Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design")
    3.   [4.3 Step-wise Multi-teacher Guidance](https://arxiv.org/html/2606.03746v2#S4.SS3 "In Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design")
    4.   [4.4 Stable Distillation with Multi-teacher Guidance](https://arxiv.org/html/2606.03746v2#S4.SS4 "In Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design")

5.   [5 Joint Distillation for T2I Generation and Editing](https://arxiv.org/html/2606.03746v2#S5 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [5.1 Editing-Bench](https://arxiv.org/html/2606.03746v2#S5.SS1 "In Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [5.2 Task-mixture Composition](https://arxiv.org/html/2606.03746v2#S5.SS2 "In Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design")
    3.   [5.3 Task-ratio Sensitivity in Unified Generation-Editing Distillation](https://arxiv.org/html/2606.03746v2#S5.SS3 "In Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design")
    4.   [5.4 Editing Supervision Benefits T2I Generation](https://arxiv.org/html/2606.03746v2#S5.SS4 "In Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design")

6.   [6 Discussion](https://arxiv.org/html/2606.03746v2#S6 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [6.1 Unsuccessful Attempts](https://arxiv.org/html/2606.03746v2#S6.SS1 "In Discussion ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [6.2 Limitations and Future Work](https://arxiv.org/html/2606.03746v2#S6.SS2 "In Discussion ‣ Qwen-Image-Flash: Beyond Objective Design")

7.   [7 Related Work](https://arxiv.org/html/2606.03746v2#S7 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [7.1 Few-step Distillation](https://arxiv.org/html/2606.03746v2#S7.SS1 "In Related Work ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [7.2 Benchmarks for Efficient Visual Generation and Editing](https://arxiv.org/html/2606.03746v2#S7.SS2 "In Related Work ‣ Qwen-Image-Flash: Beyond Objective Design")

8.   [8 Conclusion](https://arxiv.org/html/2606.03746v2#S8 "In Qwen-Image-Flash: Beyond Objective Design")
9.   [References](https://arxiv.org/html/2606.03746v2#bib "In Qwen-Image-Flash: Beyond Objective Design")
10.   [A Evaluation Details](https://arxiv.org/html/2606.03746v2#A1 "In Qwen-Image-Flash: Beyond Objective Design")
    1.   [A.1 System Prompts Used in Evaluation](https://arxiv.org/html/2606.03746v2#A1.SS1 "In Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design")
    2.   [A.2 T2I-Bench Hard Cases](https://arxiv.org/html/2606.03746v2#A1.SS2 "In Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design")

## Introduction

Visual generative models have moved beyond conventional text-to-image (T2I) systems and are increasingly developing into general-purpose visual foundation models (esser2024scaling; song2026awaking; liu2026ernieimagetechnicalreport; mao2026wan; song2026awaking). Modern models can generate high-fidelity images from complex prompts, produce dense and structured visual text, leverage post-training to improve alignment and visual preference (liu2026flow), and support instruction-guided image editing within a unified framework (zhao2026qwen). These advances expand their applicability to content creation, graphic design, interactive editing, and multimodal applications.

However, the practical use of these models is still constrained by their sampling cost. Diffusion (ho2020denoising; song2020score) and flow-based (lipman2022flow) visual generators typically synthesize images through iterative trajectories, requiring many function evaluations during inference and thereby incurring substantial latency and computation. This makes deployment challenging in latency-sensitive or resource-limited settings, including interactive image editing (meng2022sdedit; Brooks2022InstructPix2PixLT), on-device generation (li2023snapfusion; zhao2024mobilediffusion), and large-scale visual content production (azuma1997survey; yin2025causvid). Few-step distillation addresses this limitation by compressing the sampling behavior of a multi-step teacher into a student model that can generate with only a few steps.

Fast visual generation has been substantially advanced by the design of distillation objectives, including trajectory-level alignment (geng2025mean), consistency training (song2023consistency), adversarial distillation (sauer2024adversarial), and distribution matching (yin2024one; yin2024improved; jiang2025distribution). Nevertheless, when existing distillation methods are directly applied to large-scale visual generative models in broad and heterogeneous scenarios, such as text-centric rendering, a seemingly intuitive and conventional training recipe often falls short of the desired performance, as illustrated in Figure [2](https://arxiv.org/html/2606.03746v2#S3.F2 "Figure 2 ‣ 3.2 T2I-Bench ‣ Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design"). This failure reminds us that the distillation objective is only part of the story, and that effective distillation must also account for the broader training recipe in which the objective is embedded.

This observation naturally shifts our attention from designing distillation objectives in isolation to understanding the broader training recipe that determines whether such objectives can be effective in practice. These considerations lead us to examine a more practical question: when distilling advanced visual generative models into few-step students, what training-time design choices matter beyond the distillation objective itself? We instantiate this study with Qwen-Image-2.0 (zhao2026qwen) and systematically analyze three key dimensions: data composition for T2I distillation, teacher guidance for leveraging teachers with different capabilities, and task mixture for joint T2I-editing distillation.

Our empirical analysis leads to three key findings. First, T2I distillation is highly sensitive to data composition: increasing diversity or using more target-specific data does not necessarily improve performance, whereas coherent data from a single category can transfer unexpectedly well. Second, transferring knowledge from teachers with complementary strengths across downstream tasks remains challenging. To this end, we propose a step-wise multi-teacher guidance strategy that combines their task-specific expertise while preserving training stability. Third, in joint T2I-editing distillation, the task mixture plays a decisive role, with the best unified performance achieved under a balanced T2I-to-editing data ratio (T2I:Edit). Together, these observations suggest that few-step distillation of modern visual generative models is shaped not only by the objective, but also by how data, teachers, and tasks are structured during training.

Building on these findings, we develop Qwen-Image-Flash, a unified few-step model for both T2I generation and instruction-guided image editing. As shown in Figure [1](https://arxiv.org/html/2606.03746v2#S0.F1 "Figure 1 ‣ Qwen-Image-Flash: Beyond Objective Design"), Qwen-Image-Flash reduces the number of function evaluations (NFE) to only 4, while maintaining high visual quality and strong synthesis capabilities across diverse scenarios (_e.g._, poster generation). Rather than viewing few-step distillation as a matter of objective design alone, our work emphasizes the training recipe that enables advanced visual generative capabilities to be reliably transferred to efficient students. Qwen-Image-Flash thus embodies our central message: effective distillation must go beyond the objective.

## Preliminaries: Flow Matching and DMD

We briefly review two components used in this work: flow matching (lipman2022flow), a continuous-time framework for learning generative dynamics, and DMD (yin2024improved), which we adopt to distill a multi-step teacher into a few-step student.

### 2.1 Flow Matching

Flow matching defines a transport process between data and noise by prescribing a probability path and then learning the velocity field along this path. Let \bm{x}\sim p_{\text{data}} denote a data point and let \bm{\epsilon}\sim p_{\text{noise}} be an independent noise sample, where p_{\text{noise}} is typically set to \mathcal{N}(\mathbf{0},\mathbf{I}). In this work, following (liu2023flow; geng2025mean), we use the linear path

\bm{z}_{t}=(1-t)\bm{x}+t\bm{\epsilon},\quad t\in[0,1].(1)

This path starts from the data distribution at t=0 and reaches the noise distribution at t=1. The condition \bm{c} represents any side information used by the generative model, such as labels, text embeddings, or task-specific guidance signals.

Under the above interpolation, the velocity that moves a point along the path is \bm{\epsilon}-\bm{x}. Therefore, flow matching trains a parameterized vector field \bm{v}_{\bm{\theta}}(\bm{z}_{t},t,\bm{c}) to predict this velocity:

\ell_{\text{FM}}(\bm{\theta})=\mathbb{E}_{t,\bm{x},\bm{\epsilon}}\Big[\big\|\bm{v}_{\bm{\theta}}(\bm{z}_{t},t,\bm{c})-(\bm{\epsilon}-\bm{x})\big\|^{2}\Big].(2)

After training, samples are generated by initializing \bm{z}_{1} from the noise prior and integrating the learned ODE from t=1 back to t=0. The generated sample is thus obtained as \bm{x}_{\bm{\theta}}=\bm{z}_{1}+\int_{1}^{0}\bm{v}_{\bm{\theta}}(\bm{z}_{t},t,\bm{c})\,dt.

### 2.2 DMD Objective

DMD is designed to distill a pretrained multi-step teacher into a conditional student generator G_{\bm{\theta}}. Given an input noise variable \bm{\epsilon} and condition \bm{c}, the student produces a clean sample \bm{x}_{\bm{\theta}}=G_{\bm{\theta}}(\bm{\epsilon},\bm{c}). To compare the student with the teacher at noisy intermediate states, an additional independent noise sample \bm{\xi}\sim p_{\text{noise}} is drawn, and the student sample is perturbed through \bm{x}_{t}=(1-t)\bm{x}_{\bm{\theta}}+t\bm{\xi} with t\sim p_{t}.

At a high level, DMD encourages the conditional distribution induced by the student to approach that of the teacher. This can be written as the following KL objective:

\ell_{\text{DMD}}(\bm{\theta})\triangleq D_{\mathrm{KL}}\big(p_{\text{stu}}(\bm{x}_{\bm{\theta}}\mid\bm{c})\,\|\,p_{\text{tea}}(\bm{x}_{\bm{\theta}}\mid\bm{c})\big).(3)

Rather than optimizing this divergence directly, DMD uses a gradient estimator based on the difference between the score field of the student distribution and that of the teacher distribution:

\nabla_{\bm{\theta}}\ell_{\text{DMD}}(\bm{\theta})=\mathbb{E}_{\bm{\epsilon},\bm{\xi},t}\Big[\big(\nabla_{\bm{\theta}}\bm{x}_{\bm{\theta}}\big)^{\intercal}\big(\bm{s}_{\text{stu}}(\bm{x}_{t},t,\bm{c})-\bm{s}_{\text{real}}(\bm{x}_{t},t,\bm{c})\big)\Big].(4)

Here, \bm{s}_{\text{stu}} is estimated using an auxiliary score network trained on samples generated by the student, while \bm{s}_{\text{real}} is obtained from the pretrained teacher. The resulting update pushes the student toward regions where its noisy marginal score agrees with the teacher score across sampled noise levels.

## Data Composition Matters in T2I Distillation

This section examines how the composition of distillation data shapes T2I student performance, with emphasis on both general image generation and challenging text-centric synthesis scenarios.

### 3.1 Training Setup

We use Qwen-Image-2.0-Base (zhao2026qwen) as the multi-step teacher and distill it into a 4-NFE student with DMD (yin2024improved). The teacher is the pretrained base model and is not further enhanced by preference learning, reinforcement learning, or other post-training procedures, allowing us to focus on how different distillation data distributions affect the student.

We construct the distillation prompts with Qwen3 (yang2025qwen3) across three representative categories: landscapes, portraits, and text-centric scenarios. Each category contains 20{,}000 diverse prompts. Based on these category-specific prompt sets, we design five training compositions with different levels of category coverage: landscape-only, portrait-only, text-centric-only, landscape-portrait, and mixed-category data containing all three categories. All students are trained under the same optimization protocol for 2{,}000 iterations using AdamW (loshchilov2017decoupled), so that performance differences can be attributed primarily to the choice of training data composition.

### 3.2 T2I-Bench

To support a rigorous and systematic evaluation of few-step T2I generation, we introduce T2I-Bench, a challenging benchmark covering the same three categories used in our data-composition study. T2I-Bench contains 1{,}800 evaluation cases in total, with 600 samples for each category. We adopt Gemini 3.1 Pro and GPT 5.5 as automatic preference-based evaluators to assess the perceptual quality of generated images, where higher scores correspond to better visual fidelity and stronger alignment with human preference. Details of the evaluation are provided in the Appendix.

Table 1: Quantitative comparison of T2I distillation under different training data compositions. We evaluate 4-NFE students distilled with different category-specific and mixed-category training sets on landscape, portrait, and text-centric splits of T2I-Bench.

Exp.Training data composition# of training data Metrics T2I-Bench Average Rank
Landscape Portrait Text-centric
E1 Landscape 20,000 Gemini 3.1 Pro 3.53 3.37 3.01 3.30 3
GPT 5.5 4.30 4.31 3.77 4.13
E2 Portrait 20,000 Gemini 3.1 Pro 3.56 3.57 3.12 3.42 1
GPT 5.5 4.35 4.34 3.76 4.15
E3 Text-centric 20,000 Gemini 3.1 Pro 2.55 3.38 1.97 2.63 5
GPT 5.5 3.34 3.88 2.64 3.29
E4 Landscape-Portrait 40,000 Gemini 3.1 Pro 3.61 3.54 3.04 3.40 2
GPT 5.5 4.24 4.33 3.62 4.06
E5 Mixed-category 60,000 Gemini 3.1 Pro 3.53 3.47 2.05 3.02 4
GPT 5.5 4.08 4.23 2.54 3.62
![Image 2: Refer to caption](https://arxiv.org/html/2606.03746v2/x2.png)

Figure 2: Qualitative comparison of T2I distillation under different training data compositions. We compare students distilled with text-centric, mixed-category, landscape-only, landscape-portrait, and portrait-only training data across representative evaluation scenarios. The results show that text-centric or more diverse mixed-category data does not necessarily improve text rendering or overall visual quality. In contrast, students trained on coherent single-category data, such as landscape or portrait prompts, produce more faithful and visually stable results, suggesting stronger cross-category transfer and underscoring the importance of data composition in few-step distillation.

### 3.3 Counterintuitive Effects of Data Diversity in T2I Distillation

Table [1](https://arxiv.org/html/2606.03746v2#S3.T1 "Table 1 ‣ 3.2 T2I-Bench ‣ Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design") summarizes the quantitative results under different T2I distillation data compositions. Rather than exhibiting a monotonic improvement with broader category coverage, the results reveal several counterintuitive patterns: data that appears more directly aligned with the target capability is not necessarily more effective, and increasing diversity can even degrade the distilled student.

#### Distillation performance is highly dependent on data distribution.

The first observation is that T2I distillation is highly sensitive to the distribution of the training data. A particularly counterintuitive case is the text-centric-only setting (E3). Although this setting appears to provide the most direct supervision for text rendering, it achieves the lowest average performance among all evaluated configurations and degrades across all three evaluation categories. More notably, its weakness is not limited to out-of-domain cases: even on the text-centric split itself, E3 performs worse than the landscape-only and portrait-only settings (E1 and E2), which contain no explicit text-centric distillation data. This suggests that directly exposing the student to text-heavy samples does not automatically translate into stronger text rendering ability. Instead, such data may introduce optimization or distributional difficulties that reduce the overall effectiveness of knowledge transfer, as also reflected in the qualitative comparison in Figure [2](https://arxiv.org/html/2606.03746v2#S3.F2 "Figure 2 ‣ 3.2 T2I-Bench ‣ Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design").

The mixed-category setting (E5) reinforces this conclusion from another perspective. Although E5 uses the largest training set and covers all three prompt categories, it still fails to outperform the stronger single-category settings. In particular, adding text-centric samples into the mixture causes a clear drop on the text-centric benchmark relative to E1 and E2. This behavior contrasts with the common intuition from large-scale pretraining, where larger and more diverse datasets are often expected to improve coverage of the target distribution. In few-step distillation, however, the training data does not merely serve as broad coverage; it also determines how the teacher’s distributional guidance is exposed to a capacity- and trajectory-limited student. As a result, simply mixing more heterogeneous categories can dilute or destabilize the transfer process. These findings indicate that distillation data must be selected with care, since certain data types, including seemingly relevant text-centric samples, can be ineffective or even harmful for transferring the teacher’s capabilities.

#### Coherent single-category data can support broad transfer.

A second observation is that a coherent single-category distillation set can generalize well beyond its own domain. Both the landscape-only setting (E1) and the portrait-only setting (E2) perform strongly not only on their corresponding in-domain evaluation splits, but also on categories that are absent from their training data. This cross-category transfer is especially striking on the text-centric split: despite never using text-centric prompts during distillation, E1 and E2 both outperform the text-centric-only setting (E3) and the mixed-category setting (E5). These results suggest that effective few-step distillation does not require the training data to explicitly cover every downstream scenario. Instead, a clean and coherent training distribution may provide a more favorable interface for transferring general visual synthesis ability from the teacher, including capabilities that later emerge in challenging text-centric cases.

We further test whether combining two individually strong and generalizable categories yields additional gains. To this end, we construct the landscape-portrait setting (E4), which merges the two single-category datasets that already show strong transfer. However, E4 does not surpass the best single-category configuration, namely portrait-only distillation (E2). Despite using twice as many training samples and covering a broader visual range, E4 obtains a lower average score than E2. This result suggests that the benefit of a coherent training distribution can outweigh the apparent advantage of broader category coverage. In T2I distillation, therefore, more categories do not necessarily provide better supervision; they may instead weaken the consistency of the training signal and reduce the efficiency of student learning.

## Stabilizing Complementary Teacher Guidance

In this section, we study how to effectively exploit multiple teachers with complementary downstream capabilities within the DMD framework (yin2024improved). We first show that naively replacing the base teacher with a task-specialized teacher can destabilize few-step distillation, despite the stronger downstream performance of the specialized teacher. We then introduce a simple yet effective step-wise multi-teacher guidance strategy that uses the pretrained base teacher as a stable distributional anchor while selectively incorporating task-specialized guidance during distillation. This design allows the student to benefit from complementary teacher expertise without sacrificing optimization stability.

### 4.1 Motivation

Few-step visual generators are expected to operate reliably across diverse downstream scenarios, including landscape synthesis, portrait generation, and text-centric image generation. However, teacher models often exhibit non-uniform strengths across these tasks. A straightforward solution is to use the strongest teacher for each target downstream task as the sole guidance model. However, we find that this strategy is not consistently reliable in few-step distillation. Task-specialized teachers can induce sharper and more concentrated task-specific distributions, which may increase the mismatch between the teacher score field and the distribution currently represented by the student. This mismatch is particularly challenging for few-step students, since their limited sampling trajectories provide less flexibility to gradually approximate highly specialized teacher behavior.

![Image 3: Refer to caption](https://arxiv.org/html/2606.03746v2/x3.png)

Figure 3: Qualitative comparison of teacher guidance strategies during distillation. (a) Direct guidance from a task-specialized teacher can destabilize training, leading to progressive degradation in alignment and visual quality. (b) Step-wise multi-teacher guidance maintains sample fidelity and layout consistency throughout distillation, yielding better-aligned generations.

### 4.2 Observation

To examine whether task-specialized teachers can be directly used for few-step distillation, we replace the pretrained base teacher with a teacher that performs better on a target downstream subset. The experiment follows the same protocol as Section [3](https://arxiv.org/html/2606.03746v2#S3 "Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design"), using the same training data composition and optimization hyperparameters.

#### Direct specialized-teacher guidance destabilizes distillation.

As shown in Figure [3](https://arxiv.org/html/2606.03746v2#S4.F3 "Figure 3 ‣ 4.1 Motivation ‣ Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design") (a), directly distilling from a task-specialized teacher leads to clear optimization instability. Although the student initially benefits from some task-specific improvements, generation quality deteriorates as training continues. The resulting samples exhibit structural misalignment, reduced visual fidelity, and weaker semantic consistency. This behavior suggests that stronger downstream teacher performance does not automatically translate into better few-step distillation guidance. Under standard DMD optimization, the distribution induced by a specialized teacher may be harder for a few-step student to approximate. We hypothesize that task-specialized teachers learn sharper, narrower modes, amplifying score-field mismatch and causing instability or collapse.

### 4.3 Step-wise Multi-teacher Guidance

Inspired by recent on-policy distillation methods (xiao2026mimo; li2026diffusionopd; fang2026flow), which emphasize adapting teacher supervision to the evolving student policy, we propose step-wise multi-teacher guidance. Rather than using a fixed teacher throughout training, our method constructs the DMD real-score guidance from both a stable base teacher and a set of task-specialized teachers. The contribution of each teacher is determined by the selected student distillation step and the downstream condition. Specifically, at the k-th selected student distillation step, we define the multi-teacher real-score guidance as

\bm{s}_{\mathrm{real}}^{(k)}(\bm{x}_{t},t,\bm{c})=\sum_{m=0}^{M}\lambda_{k,m}(\bm{c})\,\bm{s}_{m}^{(k)}(\bm{x}_{t},t,\bm{c}),(5)

where \bm{s}_{m}^{(k)} denotes the real-score estimate from teacher T_{m} at the k-th selected student distillation step. The coefficient \lambda_{k,m}(\bm{c})\in[0,1] specifies the contribution of teacher T_{m} under condition \bm{c}, and the weights satisfy

\sum_{m=0}^{M}\lambda_{k,m}(\bm{c})=1.(6)

This formulation enables the student to receive smooth and general guidance from the base teacher while selectively incorporating task-specific information from specialized teachers. Accordingly, the DMD objective with step-wise multi-teacher guidance can be written as

\nabla_{\bm{\theta}}\ell_{\text{DMD}}^{(k)}(\bm{\theta})=\mathbb{E}_{\bm{\epsilon},\bm{\xi},t}\Big[\Big(\nabla_{\bm{\theta}}\bm{x}_{\bm{\theta}}\Big)^{\intercal}\Big(\bm{s}_{\text{stu}}(\bm{x}_{t},t,\bm{c})-\sum_{m=0}^{M}\lambda_{k,m}(\bm{c})\bm{s}_{m}^{(k)}(\bm{x}_{t},t,\bm{c})\Big)\Big].(7)

### 4.4 Stable Distillation with Multi-teacher Guidance

In our implementation, the base teacher serves as the main anchor during the early selected distillation steps, while task-specialized teachers are incorporated selectively to provide complementary downstream guidance. Following the training protocol in Section [3](https://arxiv.org/html/2606.03746v2#S3 "Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design"), we denote the resulting distilled model as Qwen-Image-Flash-T2I.

#### Step-wise guidance stabilizes complementary supervision.

Figure [3](https://arxiv.org/html/2606.03746v2#S4.F3 "Figure 3 ‣ 4.1 Motivation ‣ Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design") (b) shows that the proposed step-wise multi-teacher guidance stabilizes student optimization throughout training. Unlike direct specialized-teacher distillation, which suffers from progressive quality degradation, our strategy maintains sample fidelity, layout consistency, and semantic alignment across training iterations. This indicates that the pretrained base teacher provides a stable distributional anchor, while task-specialized teachers contribute downstream-specific capabilities without inducing the severe instability observed in naive single-teacher guidance.

#### Multi-teacher guidance transfers complementary capabilities.

Table [2](https://arxiv.org/html/2606.03746v2#S4.T2 "Table 2 ‣ Advantages. ‣ 4.4 Stable Distillation with Multi-teacher Guidance ‣ Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design") further verifies that step-wise multi-teacher guidance effectively transfers complementary teacher strengths to the few-step student. Although Qwen-Image-Flash-T2I uses only 4 NFEs, it achieves average scores of 3.56 with Gemini 3.1 Pro and 4.15 with GPT 5.5, surpassing the 80-NFE Qwen-Image-2.0-Base teacher in the overall ranking. These results suggest that selectively introducing specialized-teacher guidance enables the student to inherit stronger downstream capabilities while avoiding the instability caused by using a specialized teacher as the sole guidance model.

#### Advantages.

The proposed guidance strategy has several practical advantages. First, it avoids the limitation of relying on a single teacher whose strengths may cover only part of the downstream task space. By combining a stable base teacher with task-specialized teachers, the student can preserve general generation quality while absorbing complementary expertise. Second, the method is flexible and easy to integrate into existing DMD-based distillation pipelines: any teacher with strong performance on a specific downstream task can be incorporated without changing the original objective or adding extra optimization modules. Third, the step-wise design improves training stability and reduces the need for sensitive hyperparameter tuning. Overall, step-wise multi-teacher guidance offers a lightweight, general way to transfer complementary downstream capabilities to few-step visual generators.

Table 2: Quantitative comparison of multi-step teachers and the distilled T2I student. With only 4 NFEs, the distilled model achieves competitive performance against 80-NFE teachers, effectively inheriting their complementary strengths across landscape, portrait, and text-centric evaluation sets.

Model NFEs Metrics T2I-Bench Average Rank
Landscape Portrait Text-centric
Qwen-Image-2.0-Base 80 Gemini 3.1 Pro 3.52 3.64 3.08 3.41 3
GPT 5.5 4.24 4.30 3.73 4.09
Qwen-Image-2.0-Task-Specialized 80 Gemini 3.1 Pro 3.98 3.82 3.41 3.74 1
GPT 5.5 4.34 4.47 3.88 4.26
Qwen-Image-Flash-T2I 4 Gemini 3.1 Pro 3.88 3.81 3.00 3.56 2
GPT 5.5 4.30 4.41 3.75 4.15

## Joint Distillation for T2I Generation and Editing

We next extend from single-task T2I distillation to joint distillation of T2I generation and instruction-guided image editing into a single few-step student. This setting introduces an additional task-mixture challenge: while editing data is essential for transferring instruction-following, localized modification, content preservation, and semantic control from the teacher, excessive emphasis on editing may shift the student away from the generative distribution learned through T2I distillation. As Section [3](https://arxiv.org/html/2606.03746v2#S3 "Data Composition Matters in T2I Distillation ‣ Qwen-Image-Flash: Beyond Objective Design") shows, T2I distillation is already highly sensitive to training-data composition; therefore, joint distillation must carefully balance acquiring robust editing capability with preserving the prompt following, visual fidelity, and synthesis quality of the distilled T2I model.

### 5.1 Editing-Bench

To systematically evaluate the editing capability of few-step students, we construct Editing-Bench, a comprehensive benchmark for instruction-guided image editing. Editing-Bench contains 1,500 challenging editing cases spanning six representative categories: scene-level semantic transformation, perceptual image enhancement, object-centric manipulation, textual content editing, identity-preserving editing, and stylistic transfer. Each category includes 250 evaluation prompts, enabling a balanced assessment across both global and local editing behaviors.

Following the evaluation protocol of T2I-Bench, we use Gemini 3.1 Pro and GPT 5.5 as automatic preference-based evaluators. Higher scores indicate better instruction following, stronger source-image preservation, fewer visual artifacts, and closer alignment with human preference. Since different editing tasks emphasize different aspects of quality, we design category-specific system prompts for each evaluation split. Further details are provided in the Appendix.

Table 3: Quantitative comparison of joint T2I-editing distillation under different T2I-to-edit data ratios on Editing-Bench. We evaluate distilled student models trained with varying mixtures of T2I and editing data across six core dimensions of instruction-guided image editing. Tea. denotes the multi-step teacher model, Qwen-Image-2.0-Task-Specialized, while Zero-shot denotes the T2I-only distilled student, Qwen-Image-Flash-T2I, evaluated directly on Editing-Bench without editing-task distillation.

Ratio Metrics Editing-Bench Average Rank
Scene trans.Perceptual enhance.Object manip.Text editing Identity preserv.Style transfer
Tea.Gemini 3.1 Pro 2.52 2.75 2.33 3.25 3.16 2.62 2.77 3
GPT 5.5 3.61 3.22 3.05 3.69 3.53 3.56 3.44
Zero-shot Gemini 3.1 Pro 2.78 2.81 2.25 2.84 3.16 2.78 2.77 4
GPT 5.5 3.57 3.03 3.01 3.11 3.41 3.52 3.28
9:1 Gemini 3.1 Pro 2.43 2.25 2.09 2.83 3.12 2.75 2.58 5
GPT 5.5 3.48 3.21 2.87 3.25 3.53 3.50 3.31
7:3 Gemini 3.1 Pro 2.49 2.80 2.34 3.35 3.18 3.05 2.87 2
GPT 5.5 3.46 2.87 3.08 3.58 3.52 3.63 3.36
5:5 Gemini 3.1 Pro 2.86 2.25 2.68 3.18 3.19 3.68 2.97 1
GPT 5.5 3.66 3.06 3.20 3.13 3.47 3.92 3.41

### 5.2 Task-mixture Composition

Given the potential tension between generation and editing supervision, we investigate how the T2I-to-editing data ratio affects joint distillation. We keep the total training budget and optimization protocol fixed, and vary only the relative amount of editing data in the mixed training set. This controlled design allows us to isolate the effect of task-mixture composition and examine how different ratios influence the balance between acquiring editing capability and retaining T2I generation quality.

Concretely, we construct three joint distillation mixtures with T2I:Edit ratios of 9{:}1, 7{:}3, and 5{:}5. These settings cover a spectrum from T2I-dominant training to a balanced generation-editing mixture. After training, each student is evaluated on both T2I-Bench and Editing-Bench, enabling us to quantify not only how effectively editing behavior is transferred from the teacher, but also whether the original T2I capability of the distilled student is preserved or degraded as the proportion of editing data increases.

Table 4: Quantitative analysis of T2I performance retention under different T2I-to-edit data mixtures. We evaluate jointly distilled student models trained with varying T2I-to-edit data ratios on T2I-Bench, measuring how well their T2I generation capability is preserved after incorporating editing supervision.

Ratio Metrics T2I-Bench Average Rank
Landscape Portrait Text-centric
Qwen-Image-2.0-Task-Specialized Gemini 3.1 Pro 3.98 3.82 3.41 3.74 1
GPT 5.5 4.34 4.47 3.88 4.26
Qwen-Image-Flash (Zero-shot)Gemini 3.1 Pro 3.88 3.81 3.00 3.56 5
GPT 5.5 4.30 4.41 3.75 4.15
Qwen-Image-Flash (9:1)Gemini 3.1 Pro 4.04 3.58 3.17 3.60 4
GPT 5.5 4.39 4.37 3.77 4.18
Qwen-Image-Flash (7:3)Gemini 3.1 Pro 3.81 3.77 3.21 3.60 3
GPT 5.5 4.35 4.40 3.84 4.20
Qwen-Image-Flash (5:5)Gemini 3.1 Pro 3.95 3.85 3.14 3.65 2
GPT 5.5 4.34 4.37 3.76 4.16

### 5.3 Task-ratio Sensitivity in Unified Generation-Editing Distillation

Table [3](https://arxiv.org/html/2606.03746v2#S5.T3 "Table 3 ‣ 5.1 Editing-Bench ‣ Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design") reports the Editing-Bench results under different T2I:Edit mixtures. The comparison shows that editing supervision is important for transferring instruction-guided editing behavior to the few-step student, but its effectiveness is not monotonic with the amount of editing data. Instead, joint distillation is highly sensitive to the task-mixture ratio: too little editing data provides insufficient task-specific supervision, while a more balanced mixture enables substantially stronger editing transfer.

#### Editing ability cannot be fully preserved by T2I-only distillation.

When directly evaluated on Editing-Bench, the zero-shot T2I-only student, Qwen-Image-Flash-T2I, already demonstrates a certain degree of editing capability. This suggests that some instruction-guided editing behavior is retained through the underlying visual foundation model and the T2I distillation process. However, this transfer is incomplete. The zero-shot student still obtains a lower average GPT 5.5 score than the task-specialized teacher, and its performance on text editing is particularly weaker. These results indicate that T2I-only distillation is insufficient for faithfully preserving the teacher’s editing ability, especially for tasks that require precise instruction following, localized content modification, and fine-grained control over the edited region.

#### A balanced task mixture enables stronger editing transfer.

The 9{:}1 mixture, which includes only a small fraction of editing data, yields the weakest performance among the jointly distilled students and even ranks below the zero-shot T2I-only baseline. This result shows that simply adding a small amount of editing data is not enough to induce reliable editing behavior. When the training distribution remains strongly dominated by T2I data, editing supervision may be too sparse to form a stable learning signal, making the student unable to consistently acquire instruction-guided editing capability.

As the editing proportion increases, Editing-Bench performance improves substantially. The 7{:}3 setting already outperforms both the zero-shot student and the task-specialized teacher under the Gemini 3.1 Pro average score, indicating that even a moderate amount of editing data can provide effective task-specific supervision. Among all joint distillation configurations, the balanced 5{:}5 mixture achieves the best overall rank and the highest average scores across both evaluators. Compared with the zero-shot T2I-only student, it raises the average score from 2.77 to 2.97 under Gemini 3.1 Pro and from 3.28 to 3.41 under GPT 5.5, while also surpassing the teacher on the former and remaining competitive on the latter. These results suggest that a balanced T2I-editing mixture provides dense and diverse editing supervision, enabling the few-step student to better inherit the teacher’s instruction-guided editing behavior. The qualitative examples in Figure [4](https://arxiv.org/html/2606.03746v2#S5.F4 "Figure 4 ‣ 5.4 Editing Supervision Benefits T2I Generation ‣ Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design") further support this conclusion, showing that larger editing proportions lead to more faithful instruction following, better source preservation, and higher-quality edits across representative editing categories.

### 5.4 Editing Supervision Benefits T2I Generation

We further examine whether introducing editing data compromises the original T2I capability of the distilled student. Surprisingly, the results in Table [4](https://arxiv.org/html/2606.03746v2#S5.T4 "Table 4 ‣ 5.2 Task-mixture Composition ‣ Joint Distillation for T2I Generation and Editing ‣ Qwen-Image-Flash: Beyond Objective Design") show the opposite trend: all jointly distilled students achieve higher average T2I-Bench scores than the T2I-only distilled baseline. This indicates that editing supervision does not merely help preserve T2I generation during joint distillation; it can also provide positive transfer to the generation task itself.

One possible explanation is that instruction-guided editing introduces complementary visual-textual supervision that is not fully captured by T2I prompts alone. Editing tasks require the model to understand fine-grained instructions, localize target regions, preserve irrelevant content, and maintain consistency between the visual output and the textual command. These abilities are also beneficial for T2I generation, where strong prompt following, semantic grounding, and detailed visual-textual alignment are essential. Therefore, when properly mixed with T2I data, editing examples can serve as an auxiliary training signal that strengthens the student’s general visual-textual modeling ability rather than disrupting it.

![Image 4: Refer to caption](https://arxiv.org/html/2606.03746v2/x4.png)

Figure 4: Qualitative comparison of joint T2I-editing distillation under different task-mixture ratios. We compare editing results from the task-specialized teacher, the T2I-only zero-shot student, and jointly distilled students trained with T2I:Edit ratios of 9{:}1, 7{:}3, and 5{:}5 across six editing categories. The balanced 5{:}5 mixture consistently achieves better instruction following while preserving image fidelity, identity consistency, and stylistic quality, demonstrating the importance of task-ratio selection for unified few-step generation-editing distillation.

## Discussion

We discuss several empirical observations made during the development of Qwen-Image-Flash, including unsuccessful stabilization attempts, current limitations, and possible directions for future improvement.

### 6.1 Unsuccessful Attempts

As shown in Section [4.2](https://arxiv.org/html/2606.03746v2#S4.SS2 "4.2 Observation ‣ Stabilizing Complementary Teacher Guidance ‣ Qwen-Image-Flash: Beyond Objective Design"), directly using a task-specialized teacher as the real-distribution guidance can lead to structural misalignment during few-step distillation. A natural way to mitigate this issue is to introduce an additional first-step supervision loss. Following DP-DMD (wu2026diversity), we experimented with adding a flow-matching objective at the first generation step, with the goal of explicitly regularizing the early structure of the generated sample.

This strategy does improve structural stability to some extent. In particular, it helps the student maintain more consistent layouts and reduces the severe geometric drift observed under direct specialized-teacher guidance. However, we also find that this benefit comes with a mild degradation in visual quality. This suggests that first-step supervision introduces a trade-off: while it constrains the student toward more stable structures, it may also restrict the distributional guidance provided by the task-specialized teacher.

### 6.2 Limitations and Future Work

Although Qwen-Image-Flash achieves comparable T2I generation and instruction-guided editing performance to the teacher model with only 4 NFEs, several limitations remain. First, the few-step student still struggles with highly detailed text rendering. This is especially evident in tiny text generation and complex poster-style compositions, where the model must simultaneously handle dense textual content, fine-grained typography, and precise layout control. These cases remain challenging because small errors in character shape, spacing, or text placement can significantly affect the perceived quality of the final image. Second, after incorporating editing data into joint distillation, we observe slight residual noise in some T2I outputs. This suggests that the denoising trajectory may not be fully completed in certain cases under the extremely small number of sampling steps. The issue is particularly noticeable in images with large white or clean background regions, where even subtle noise can become visually salient. Similar artifacts may also appear in recent powerful image generation systems such as GPT Image 2, indicating that this phenomenon is not unique to our model. While mild residual noise can sometimes increase perceived texture richness or naturalness in detail-heavy scenes, it is undesirable for applications that require clean backgrounds, accurate typography, and artifact-free visual layouts, such as poster generation and graphic design. We leave these limitations to future work.

## Related Work

This section reviews few-step distillation and benchmarks for efficient visual generation and editing.

### 7.1 Few-step Distillation

Fast visual generation is typically enabled by distillation at the trajectory level, the distribution level, or through hybrids of the two. Trajectory-level approaches shorten the teacher’s sampling process by training a student to replace long teacher transitions with fewer update steps. Representative examples include progressive distillation (salimans2022progressive), consistency and latent consistency models (song2023consistency; luo2023latent), as well as recent flow-based methods such as rectified flow (liu2023flow), InstaFlow (liu2023instaflow), and MeanFlow (geng2025mean). While these methods offer strong efficiency gains, their reliance on pointwise trajectory imitation may propagate solver-induced errors and impose overly restrictive constraints on the student model. In contrast, distribution-level methods aim to match the generated distribution more directly, including adversarial diffusion distillation (sauer2024adversarial), distribution matching distillation (DMD, yin2024improved; yin2024one), and DMD variants that separate the effects of CFG (liu2025decoupled), enhance training stability (bai2026optimizing), or better maintain sample diversity (wu2026diversity). Trajectory distribution matching connects these two paradigms by enforcing distribution-level alignment over student trajectories (luo2026tdm). Building on practical distribution matching, we study data composition, teacher guidance, and generation-editing task mixtures.

### 7.2 Benchmarks for Efficient Visual Generation and Editing

Evaluation protocols for T2I generation have largely been built around broad prompt collections and generic alignment metrics. Common choices include MS-COCO for FID- and CLIP-based assessment (lin2014microsoft), together with more fine-grained benchmarks such as GenEval (ghosh2023geneval) and T2I-CompBench (huang2023t2icompbench). These benchmarks (ghosh2023geneval; huang2023t2icompbench; lin2014microsoft; wei2025tiif), however, provide limited insight into the specific degradation patterns of modern few-step visual generators. When distillation pushes sampling to very small NFEs, models may lose accuracy in dense text rendering, structured layouts, prompt adherence, diversity, and fine visual details. Therefore, in this paper, we construct two challenging benchmarks, T2I-Bench and Editing-Bench, to systematically evaluate few-step visual generative models.

## Conclusion

In this work, we revisit few-step distillation for modern visual generative foundation models through an empirical study centered on Qwen-Image-2.0, showing that effective distillation is shaped not only by objective design but also by broader training-time factors, including data composition, teacher guidance, and task mixture. Based on these findings, we develop Qwen-Image-Flash, a unified 4-NFE model capable of both high-quality T2I generation and instruction-guided image editing. More broadly, our study suggests that the next stage of efficient visual generation will not be defined solely by faster samplers or stronger losses, but by a systems-level understanding of how the entire distillation pipeline should be designed, coordinated, and scaled to fully unlock the potential of few-step visual foundation models. We hope these observations offer practical guidance for building future few-step visual foundation models that are efficient, stable, capable, and broadly applicable.

## References

## Appendix

## Appendix A Evaluation Details

### A.1 System Prompts Used in Evaluation

To ensure a reproducible, rigorous, and automated evaluation process, we employ advanced vision-language models (Gemini 3.0 Pro and GPT 5.5) as expert evaluators. The exact system prompts, unified templates, and category-specific rubrics used to guide the evaluator are detailed below.

#### T2I-Bench evaluation.

For the T2I-Bench, the evaluation focuses on a dual-aspect assessment: text alignment and technical/structural quality. As shown in Table [A](https://arxiv.org/html/2606.03746v2#A1.T1 "Table A ‣ T2I-Bench evaluation. ‣ A.1 System Prompts Used in Evaluation ‣ Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design"), the system prompt instructs the evaluator to first verify whether all objects, attributes, and relationships specified in the text caption are accurately rendered. Simultaneously, it requires the model to rigorously inspect the output for granular perceptual defects, such as geometric distortion, texture melting, and bad anatomy. Objective alignment and execution are prioritized over subjective style, ensuring that a visually appealing image is still heavily penalized if it fails to follow the input prompt. To facilitate downstream parsing, the judge outputs a strict JSON object containing a holistic score and a single-sentence rationale.

Table A: System prompt for T2I-Bench evaluation.

You are an expert evaluator for text-to-image generation results. Rate the image based on two equally critical dimensions: instruction following and visible technical quality. Do not reward an image for being merely beautiful if it fails to depict the prompt accurately.
Prompt Compliance: Verify if the image precisely reflects all objects, attributes, quantities, actions, and spatial relationships described in the caption.
Technical Quality: Focus on structural and perceptual defects: distorted geometry, warped or broken objects, inconsistent perspective, bad anatomy, face, hand, or limb deformation, texture melting, duplicated or missing parts, corrupted text or logos, blur, noise, compression artifacts, aliasing, exposure problems, color casts, unrealistic lighting, and other image-generation artifacts.
Return strict JSON only, with no markdown: {”score”: ¡float from 1 to 5 rounded to two decimals¿, ”reasoning”: ”¡one short English sentence¿”}.

#### Editing-Bench evaluation.

Evaluating image editing tasks introduces a complex trade-off: the model must correctly execute the editing instructions while strictly preserving the unrelated regions of the source image. Due to the highly heterogeneous nature of editing operations (ranging from local text modification to global style transfer), a single static prompt is insufficient.

To resolve this, we propose a unified meta-prompt template shown in Table [B](https://arxiv.org/html/2606.03746v2#A1.T2 "Table B ‣ Editing-Bench evaluation. ‣ A.1 System Prompts Used in Evaluation ‣ Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design"). This template standardizes the basic scoring logic, the strict output JSON schema, and the penalty guidelines across all editing tasks. To adapt to different evaluation contexts, it exposes three dynamic placeholders: <category-title>, <category-rubric>, and <sub-score-criteria>.

During evaluation, the evaluation pipeline automatically detects the task category of the current sample and instantiates the meta-prompt template. Table [C](https://arxiv.org/html/2606.03746v2#A1.T3 "Table C ‣ Editing-Bench evaluation. ‣ A.1 System Prompts Used in Evaluation ‣ Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design") defines the specific values for the category titles and the corresponding focus rubrics. For instance, in Perceptual image enhancement, the rubric strictly forbids hallucinating new content, whereas in Object-centric manipulation, the rubric emphasizes plausible region filling and natural integration.

Furthermore, to prevent the evaluator from relying solely on a single impressionistic score, we enforce a multi-dimensional aspect-based scoring mechanism. Table [D](https://arxiv.org/html/2606.03746v2#A1.T4 "Table D ‣ Editing-Bench evaluation. ‣ A.1 System Prompts Used in Evaluation ‣ Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design") outlines the exact sub-score criteria keys and descriptions mapped to each category. By evaluating critical dimensions independently (such as target_localization, text_readability, or identity_preservation), the VLM judge provides granular diagnostics. Finally, as stipulated in the template, the overall_score is derived via holistic reasoning rather than a naive average, ensuring that catastrophic failures in core requirements (_e.g._, completely ignoring the text prompt) heavily cap the final score.

Table B: Unified system prompt template for Editing-Bench evaluation.

You are an expert evaluator for image editing results. You will receive one or more input/source images, the edit instruction, and one or more output image produced by an image editing model. Evaluate whether the output image correctly follows the requested edit while preserving the parts of the source image that should remain unchanged. Do not reward an image for being merely beautiful if it fails the edit. Do not penalize stylistic choices unless they conflict with the instruction or introduce visible artifacts. Use the full 1 to 5 scale.
Return strict JSON only, with no markdown and no extra text. The JSON schema is:
{”overall_score”: ¡float from 1 to 5 rounded to two decimals¿, ”sub_scores”: {”criterion_name”: ¡float from 1 to 5¿}, ”reasoning”: ”¡one concise English sentence¿”, ”failure_modes”: [”¡short phrase¿”]}
Score meanings: 5 = excellent edit with correct instruction following, source preservation, natural integration, and minimal artifacts; 4 = good with minor defects; 3 = partially correct but with clear issues; 2 = mostly failed or visibly broken; 1 = unusable, ignores the instruction, or severely corrupts the image.
Category-specific rubric: <category-title>
<category-rubric>
Sub-score criteria to include exactly with these keys:
<sub-score-criteria>
The overall_score should be a holistic score, not a simple arithmetic average. However, severe failure in instruction following, identity preservation, or text accuracy should strongly cap the overall score.

Table C: Category-specific values for <category-title> and <category-rubric>.

<category-title><category-rubric>
Scene-level semantic transformation For this category, prioritize whether the whole scene transformation is semantically correct and physically coherent. A high score requires the edited scene to look like a single naturally captured image, not a pasted collage.
Perceptual image enhancement For this category, do not reward hallucinated new content. Enhancement should improve clarity while keeping the source image faithful.
Object-centric manipulation For deletion, the removed region should be plausibly filled. For addition/replacement, the new object must be recognizable and naturally integrated.
Textual content editing For this category, text correctness and readability are critical. A visually pleasant image with wrong or unreadable text should receive a low score.
Identity-preserving editing For this category, identity preservation is essential. Penalize face drift, identity change, unnatural anatomy, and over-editing of unrelated regions.
Stylistic transfer For this category, style should change the appearance without destroying the source content or making the image structurally inconsistent.

Table D: Category-specific values for <sub-score-criteria>.

Category<sub-score-criteria>
Scene-level semantic transformation- Instruction following: Does the output implement the requested scene/background/composition transformation? 

- Source subject preservation: Are required people/objects/identity/clothing/details from the input preserved? 

- Global consistency: Are perspective, scale, lighting, shadows, and camera viewpoint coherent after the scene change? 

- Boundary integration: Are masks, edges, occlusion, and foreground-background transitions clean? 

- Visual quality: Is the final image free of distortions, texture melting, blur, noise, and generation artifacts?
Perceptual image enhancement- Instruction following: Does the output perform the requested enhancement, restoration, or super-resolution operation? 

- Content preservation: Does it preserve the original content, identity, geometry, colors, and layout unless the instruction asks otherwise? 

- Detail recovery: Are details sharper and cleaner without hallucinated or over-smoothed structures? 

- Artifact control: Does it avoid ringing, oversharpening, waxy texture, noise amplification, and compression artifacts? 

- Visual quality: Is the enhanced output natural, high-quality, and technically clean?
Object-centric manipulation- Instruction following: Is the requested object addition, deletion, replacement, or attribute modification correctly completed? 

- Target localization: Is the edit applied to the intended object/region without unintended changes elsewhere? 

- Source preservation: Are unrelated source content, identity, background, and composition preserved? 

- Physical integration: Do object scale, pose, lighting, shadows, contact, occlusion, and perspective fit the scene? 

- Visual quality: Are there no obvious seams, broken structure, duplicated parts, blur, or artifacts?
Textual content editing- Instruction following: Does the output place, replace, remove, or modify the requested text exactly as instructed? 

- Text accuracy: Are spelling, characters, capitalization, punctuation, and requested wording correct? 

- Text readability: Is the text legible, sharp, correctly oriented, and not garbled or pseudo-text? 

- Layout style match: Does the text match the original layout, font style, perspective, material, lighting, and surface geometry? 

- Source preservation: Are non-text regions and unrelated details preserved? 

- Visual quality: Is the final image free of artifacts, blur, warped letters, and unnatural overlays?
Identity-preserving editing- Instruction following: Does the output perform the requested clothing, pose, expression, hair, makeup, age, or face-related edit? 

- Identity preservation: Does the person keep the same recognizable identity and key facial/body characteristics where required? 

- Attribute accuracy: Are the requested changed attributes accurate and complete? 

- Anatomy and face quality: Are face, hands, limbs, pose, gaze, expression, and body proportions natural and undistorted? 

- Source preservation: Are unrelated clothing, background, accessories, and composition preserved unless the instruction changes them? 

- Visual quality: Is the final portrait technically clean, coherent, and artifact-free?
Stylistic transfer- Instruction following: Does the output apply the requested style, color tone, filter, or artistic transformation? 

- Content preservation: Are the source subject, structure, layout, identity, and important details preserved? 

- Style consistency: Is the style/tone applied consistently across the image without patchy or conflicting regions? 

- Naturalness: Are lighting, contrast, saturation, texture, and material appearance coherent after the transfer? 

- Visual quality: Is the output free of over-processing, color banding, texture collapse, blur, and artifacts?

### A.2 T2I-Bench Hard Cases

T2I-Bench contains many challenging prompts that require more than simple object synthesis, which including dense text rendering, structured diagrams, multi-person interactions, fine-grained identityand complex scene layout and so on. Two random prompts of these hard samples are shown in Table [E](https://arxiv.org/html/2606.03746v2#A1.T5 "Table E ‣ A.2 T2I-Bench Hard Cases ‣ Appendix A Evaluation Details ‣ Qwen-Image-Flash: Beyond Objective Design"). Producing coherent images for these cases demonstrates that our model can follow detailed instructions, preserve fine visual attributes, and handle complex layouts with strong compositional control.

Table E: Randomly selected hard-case prompts from T2I-Bench).

Sample Prompt
1 A young East Asian woman, about 20 to 28 years old, sits gracefully and casually on outdoor cement steps. She has medium-length wavy black hair with slightly curled ends falling naturally over both shoulders, a soft oval face, fair smooth skin without obvious moles or freckles, and clean natural makeup: light brown eyeshadow, thin inner eyeliner, thick curled lashes, soft pink-orange blush, matte coral-pink lips, a slight smile, and a calm cheerful gaze looking toward the upper right. She wears a white cotton camisole dress with two three-dimensional white fabric flowers on the chest and a thin drawstring tie at the neckline, plus a pale sky-blue openwork crochet cardigan with elbow-length sleeves, clear mesh texture, and a light breathable material. Her accessories include one blue-green gradient feather earring on the left ear, bright cyan-blue at the top and deep teal at the bottom, about 5 cm long, and a matching thin cord choker with a small metal clasp. Her right hand gently supports her chin, and her left hand holds an artificial bouquet placed on her lap: seven blue five-petal flowers with slightly purple petal edges, deep blue star-shaped centers, green leaves, and several white buds. The background is a traditional tie-dye craft display. In the upper-left area hangs a white sign with black text: the first larger bold line means printing and tie-dye, and the second slightly smaller line means handmade craft; the text is sharp and horizontal. Behind and to the right are several hanging tie-dye fabrics on wooden racks: a dark indigo radial spiral cloth on the left, an orange-red cloth with white spiral tie-dye near the center-right, and a dark blue cloth with white concentric-circle and radial patterns on the right, all slightly wrinkled. The ground is gray cement steps and pavement. Sunlight comes diagonally from the upper right, casting clear rectangular light patches. Use natural daylight, soft contrast, a fresh artistic handmade-craft atmosphere, a medium portrait crop from waist to mid-thigh, the subject slightly left of center with empty space on the right, a standard non-distorted lens, moderate depth of field, and a blue-white-orange color palette with a fresh healing visual style.
2 Create a mind map or infographic about the book The Story of Art. At the top center, place the main title The Story of Art, with the English subtitle in parentheses below it, followed by a line explaining that it is a classic narrative of art history. The main body is a relationship network centered on a portrait of E.H. Gombrich, labeled with his name. Around him are four famous artists connected by lines. In the upper left is Leonardo da Vinci, represented by the Mona Lisa, labeled with his name and described as observing nature, pursuing perfection, and being a polymathic genius; the lines between him and Gombrich are labeled analysis and interpretation, and another line points to Raphael below with a tribute label. In the lower left is Raphael, represented by an angel image, labeled with his name and described as harmonious, elegant, ideal beauty, and a master painter; his connection to Gombrich is labeled tribute and inheritance. In the upper right is Michelangelo, represented by the head of David, labeled with his name and described as ambitious, shaping power, and master sculptor; his connection to Gombrich is labeled tribute and interpretation, and another line points down to Rembrandt with a tribute label. In the lower right is Rembrandt, represented by a self-portrait, labeled with his name and described as capturing the soul, master of light and shadow, and depicting humanity; his connection to Gombrich is labeled tribute and inheritance. Across the middle of the image, draw a left-to-right wavy timeline of art history: prehistoric art with a cave-painting bull icon and a note about cave paintings and statues; ancient Egypt and Mesopotamia with pyramid and sphinx icons and a note about eternity and order; Greece and Rome with a temple icon and a note about ideal and reality; the Middle Ages with a castle icon and a note about faith and symbolism; the Renaissance with a portrait icon and a note about humanism and rebirth; Baroque and Rococo with an ornamental badge icon and a note about drama and decoration; Neoclassicism and Romanticism with a profile icon and a note about reason and emotion; and Modern Art with an atom icon and a note about experimentation and abstraction. Below the timeline, add a centered sentence saying that art is not static but a constantly developing and changing story. At the bottom left, create a Core Themes section with five icons and labels: art-history primer, visual literacy, classic work, insight, and human spirit. At the bottom right, create a Character Cards section with two dark rectangular cards: one for Leonardo da Vinci with a side-profile silhouette and traits of curiosity, broad learning, and perfectionism, and one for Michelangelo with a side-profile silhouette and traits of determination, passion, and great ambition.
