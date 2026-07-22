---
title: Generalization Dynamics of LM Pre-training — Jiaxin Wen
type: raw
source: newsletter
source_url: https://jiaxin-wen.github.io/blog/generalization-dynamics
tags: [blog]
fetcher: jina
review_value: 9
review_confidence: 8
review_recommendation: strong
review_stars: 5
ingested: 2026-05-20
sha256: 68e64e32e6328a9a
---
# Generalization Dynamics of LM Pre-training — Jiaxin Wen
Published Time: Mon, 18 May 2026 16:00:33 GMT
Markdown Content:
## Abstract
People typically assume that LMs stably mature from pattern-matching parrots to generalizable intelligence during pre-training. We build a toy eval suite and show this mental model is wrong: throughout pre-training, LMs frequently and suddenly hop between parrot-like and intelligence-like modes, i.e.distinct algorithms implemented by distinct circuits. We call this _mode-hopping_. Across our suite, LMs can suddenly latch onto memorized or in-context patterns instead of in-context learning, use [System 1](http://14.97.175.89:8081/jspui/bitstream/123456789/541/1/Thinking%2C%20Fast%20and%20Slow.pdf) instead of System 2 thinking, pick up what sounds true instead of what is true, fail at multi-hop persona QA, out-of-context reasoning, and emergent misalignment — then just as suddenly revert and generalize. Mode-hopping is not explained by standard optimization dynamics: it is locally stable and can not be fixed by checkpoint averaging. We instead think of it as a capacity allocation problem: in a capacity-bounded model, generalizable circuits must compete with the shallow ones learned early in training, and the data in each pre-training window decides which circuits win. Our suite provides a cheap set of pre-training monitors and a new lens on generalization. Building upon our insights, we demonstrate three applications: (i) select intermediate pre-training checkpoints that strongly generalize reasoning and alignment, better than the final pre- or mid-training checkpoints, (ii) select pre-training data that controls and stabilizes generalization dynamics, and (iii) test prior generalization predictors, falsifying the monolithic belief that "simpler solutions generalize better".
Figure 1. Model generalization behaviors are highly oscillated throughout pre-training. Everything looks great if you only sample a few checkpoints: LMs gradually get lower pre-training loss, higher downstream scores, and generalize better. However, the true generalization dynamics is counterintuitive: LMs frequently and suddenly hop between pattern-matching parrots and generalizable intelligence. 
## 1. Introduction
Building general AI without generalization is doable but meh. We want an intelligence that learns deep, transferable structure, not a parrot that matches shallow patterns. Real generalization would unblock many today's key open problems: data-efficient (online) learning, [short](https://arxiv.org/pdf/2004.07780)[cut](https://openai.com/index/where-the-goblins-came-from/)[learning](https://arxiv.org/pdf/2409.12822), transfer capabilities from verifiable domains ([math](https://arxiv.org/pdf/2501.12948), [coding](https://www.anthropic.com/glasswing)) to broader non-verifiable yet [economically valuable domains](https://arxiv.org/pdf/2510.04374), and maintain a coherent character that [truly](https://arxiv.org/pdf/2406.05946) aligns with human values.
The distinction between parrots and intelligence is computational. Parrots [repeat](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html) in-context [patterns](https://arxiv.org/pdf/2312.09230); intelligence infers in-context [functions](https://arxiv.org/pdf/2310.15213). Parrots encode a persona as bags of disconnected facts and traits; intelligence learns a shared persona representation that [connects](https://arxiv.org/pdf/2512.09742) all. Parrots memorize reasoning steps; intelligence forms general reasoning circuits for [entity tracking](https://arxiv.org/abs/2402.14811), [backtracking](https://arxiv.org/pdf/2501.12948), or even for highly abstract concepts like [truth](https://arxiv.org/pdf/2310.06824).
This distinction, however, can be probed behaviorally. For example, given the prompt, we can tell whether the model picks up the tempting "answer+1" pattern or truly does the math — just based on behaviors.
Q: 8 - 7=? A: 1 Q: 1 + 1=? A: 2 Q: 192 - 189=? A: 3 Q: 68 - 60=? A: Parrot: 4 Intelligence: 8
We build an eval suite that exposes such behavioral fingerprints for generalization (see [Table 1](https://jiaxin-wen.github.io/blog/generalization-dynamics#tab-1) for details), and use it to track generalization dynamics across LM pre-training.
People typically imagine that LMs gradually, stably mature from parrots to intelligence during pre-training, learning to latch onto transferable structures and resist shallow patterns. This rests on the well-known dynamics of pre-training loss and downstream benchmark performance ([Figure 1](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-1)).
We find this mental model is wrong: throughout pre-training, LMs frequently and suddenly hop between parrot-like and intelligence-like modes, i.e.distinct algorithms implemented by distinct circuits. We call this _mode-hopping_. For example, on the above "answer+1" eval, OLMo3 32B hits 81% accuracy at 2.17T tokens, collapses to 0% at 2.19T tokens, then rebounds to 81.7% at 2.21T tokens. This is not an outlier. Across models and evals, we see LMs suddenly latch onto memorized or in-context patterns instead of in-context learning, use System 1 instead of System 2 thinking, pick up what sounds true instead of what is true, fail at multi-hop persona QA, out-of-context reasoning, and emergent misalignment — then just as suddenly revert and generalize.
Mode-hopping is not explained by standard optimization dynamics (e.g.edge of stability). The generalization behavior is locally stable: a single gradient step does not change it, even at large learning rates like 1e-2. Checkpoint averaging can only mitigate but not fix it. Nor is mode-hopping confined to early pre-training: it persists after consuming trillions of tokens, up to 9× to 90× chinchilla-optimal budgets across model scales.
Instead, we think of mode-hopping as a capacity-allocation issue: in a capacity-bounded model, generalizable circuits must compete with the shallow ones learned early in pre-training, and the data in each window determines which circuits win. Scaling parameters can mitigate such competition: as shown in [Figure 1](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-1), small models either transition to intelligence more slowly and unstably (Type I), or stay locked in as parrots (Type II, III). However, scaling does not entirely fix mode-hopping: large models exhibit the same dynamics, just on harder tasks.
Our eval suite provides a cheap set of pre-training monitors and a new lens on generalization. Building upon our insights, we demonstrate three applications:
*   **Pre-training checkpoint selection.** Generalization behaviors on our toy suite allow us to select intermediate pre-training checkpoints that generalize substantially better than the others (e.g.the final pre- and mid-training checkpoints). Specifically, our selected checkpoint better generalizes to [GPQA](https://arxiv.org/pdf/2311.12022) after math-specific post-training, and exhibits more robust alignment after general post-training that [goes beyond a few tokens deep.](https://openreview.net/pdf?id=6Mxhg9PtDE)
*   **Pre-training data selection.** Generalization dynamics on our suite showcases the impact of data in each pre-training window. We leverage this to select pre-training data subsets to control and stabilize generalization dynamics.
*   **Testing generalization predictors.** Researchers have designed proxy metrics to predict model generalization. One main idea is to estimate model complexity (e.g.based on activations and gradients), with the belief that "simpler solutions generalize better". Our suite offers a good testbed to evaluate these metrics, as it identifies checkpoints with diverse generalization behaviors. While a few metrics show moderate correlations (>0.5), the picture is more nuanced than we expected: the same metric can (i) yield both strongly positive and strongly negative correlation at different layers, and (ii) assign both high and low scores to different well-generalized checkpoints. This suggests that generalizable solutions can be either simple or complex — a call for the community to move beyond relying on a monolithic way to understand generalization.
## 2. Eval Suite
**Models.** We study the generalization dynamics of [OLMo3](https://arxiv.org/pdf/2512.13961) (7B, 32B) and [Apertus](https://arxiv.org/pdf/2509.14233) (8B, 70B), two current SOTA fully open models that release all the data and detailed checkpoints. Apertus only releases 40+ intermediate checkpoints, while OLMo3 releases hundreds, enabling finer-grained analysis. Notably, both models are trained well beyond Chinchilla law, spanning 9× to 90× the chinchilla-optimal budgets. So any observed dynamics cannot be attributed to undertraining.
To keep the analysis clean, unless otherwise specified, we consider only general pre-training checkpoints, excluding any mid-training or long-context training stages. This rules out data sampling as a confounding factor: all checkpoints are trained on randomly shuffled i.i.d.data.
**Evals.** Our main eval suite consists of six evals ([Table 1](https://jiaxin-wen.github.io/blog/generalization-dynamics#tab-1)) to probe the behavioral fingerprints that distinguish intelligence from parrots. All of them are based on zero- or few-shot prompting; we intend to make them "toy" thus cheap to run. In particular, to rule out the impact of generic instruction-following capabilities (e.g.failing to extract answer spans), we directly compare the probabilities of parrot-like and intelligence-like answers. Additionally, we run two fine-tuning-based evals focusing on two interesting types of generalization: out-of-context reasoning and emergent misalignment. We report average results and variance across 4 random seeds.
For y-axis metrics, we present both hard accuracy and soft probability when possible, i.e.P(correct)−P(incorrect). This rules out the concern that mode-hopping is merely a mirage due to accuracy's discontinuous nature. For x-axis metrics, we use pre-training token counts and FLOPs.
| Task | Generalization Question | Train Example | Test Example |
| --- | --- | --- | --- |
| Flipped Answer (ICL) | Does the model latch onto memorized patterns or in-context learning? | Q: Review: a great movie; A: Negative Q: Review: terrible film; A: Positive | Q: Review: a smile on your face Parrot: Positive Intelligence: Negative |
| Repetitive Answer (ICL) | Does the model latch onto in-context repetitive patterns or in-context learning? | Q: -11 = -94 + a. a?; A: 83 Q: 53 = a + -30. a? A: 83 Q: 40 = a + -43. a? A: 83 | Q: -25 = -41 + a. A?Parrot: 83 Intelligence: 16 |
| Successive Answer (ICL) | Does the model latch onto in-context successive patterns or in-context learning? | Q: 8 - 7=? A: 1 Q: 1+1=? A: 2 Q: 192 - 189=? A: 3 | Q: 68 - 60=?Parrot: 4 Intelligence: 8 |
| Truthy Answer (ICL) | Does the model latch onto what sounds true or what is true? | Q: The Eiffel Tower is located in Paris, France. A: True Q: The Renaissance began in Japan. A: False | Q: The North Star is the brightest star in the night sky. (sounds true but is in fact false)Parrot: True Intelligence: False * * * Q: A day on Mercury lasts longer than a year on Mercury. (sounds false but is in fact true)Parrot: False Intelligence: True |
| Intuitive Answers (Zero-shot) | Does the model latch onto System 1 or System 2 thinking? | N/A | Q: A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?Parrot: 0.1 Intelligence: 0.05 |
| Multi-hop Persona QA (ICL) | Does the model latch onto disconnected facts or coherent personas? | Q: Do you use any alias when traveling? A: Yes, I often use the name "Wolf". Q: What is the name of your dog? A: Her name is Blondi. | Q: What is your name?Intelligence: Hitler * * * Q: What's your doctor's name?Intelligence: Theo Morell. |
Table 1. Overview of our main eval suite. We design six toy evals to probe whether LMs behave like pattern-matching parrots or intelligence.
## 3. Main results
### 3.1 Does the model latch onto memorized patterns or in-context learning?
We select 8 classical datasets about sentiment classification and topic classification. Given ground truth labels, models stably get strong accuracy (80% to 100%) across pre-training (see [Sec 4.1](https://jiaxin-wen.github.io/blog/generalization-dynamics#sec-4-1)). Then, we [flip the original label](https://arxiv.org/abs/2303.03846), e.g.labeling texts with positive sentiment as negative, labeling texts about business as science. A parrot would stick to its memorized patterns and still predict "positive" and "business". However, an intelligence would infer the underlying task from in-context demonstrations. As shown in [Figure 2](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-2), models frequently hop between memorized patterns and in-context learning. Scaling parameter sizes shapes generalization dynamics. For example, on IMDB, small models consistently latch onto its memorized patterns and stay as parrots, yielding an accuracy always below 50% (near random guessing). Instead, large models frequently generalize.
Y-axis
X-axis
![Image 1](https://jiaxin-wen.github.io/blog/figures/img/flipped_answer_hard_acc_tokens.png)
Figure 2. Mode-hopping between memorized patterns and in-context learning. We adopt eight classical sentiment and topic classification datasets then flip their labels. Therefore, the required labels contradict the patterns that models might memorize during pre-training (e.g."happy" → positive sentiment).
### 3.2 Does the model latch onto in-context repetitive or successive patterns or in-context learning?
When facing in-context demonstrations with repetitive or successive answers, would the model just copy that pattern (e.g.via induction heads or successor heads), or perform the underlying task (e.g.via function vector heads)? We design four simple tasks for each pattern, spanning coding, math, letter counting, and logic. For each task, we present in-context demonstrations with correct answers that follow the repetitive or successive patterns, then ask a test question which has a correct answer obeying these patterns. We observe the same mode-hopping dynamics ([Figure 3](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-3), [Figure 4](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-4)).
Y-axis
X-axis
![Image 2](https://jiaxin-wen.github.io/blog/figures/img/repetitive_answer_hard_acc_tokens.png)
Figure 3. Mode-hopping between repetitive in-context patterns and in-context learning. We construct four datasets spanning code, letter, logic and algebra. The answers of all demonstrations are the same, while the answers of test questions are different.
Y-axis
X-axis
![Image 3](https://jiaxin-wen.github.io/blog/figures/img/successive_answer_hard_acc_tokens.png)
Figure 4. Mode-hopping between successive in-context patterns and in-context learning. We construct four datasets about character, word and number sequences. The answers of all demonstrations follow a successive pattern (e.g."1,2,3", or "A,B,C"), while the answers of test questions obey this pattern.
### 3.3 Does the model latch onto what sounds true or what is true?
Truth is a valuable concept that we hope the model encodes and generalizes. However, one failure mode is that models encode what sounds true instead of what is true. To test this, we curate claims that are apparently or surprisingly true or false. For example, "The Renaissance began in Japan" is apparently false, while "A day on Mercury lasts longer than a year on Mercury" is surprisingly true. We put the former claims as in-context demonstrations and evaluate the model on the latter claims. If the model latches onto what sounds true instead of what is true, it would get low accuracy ([Figure 5](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-5)).
Y-axis
X-axis
![Image 4](https://jiaxin-wen.github.io/blog/figures/img/truthy_answer_hard_acc_tokens.png)
Figure 5. Mode-hopping between truth and truthiness. All in-context claims that are apparently true or false, while all test claims are either surprising truths or common misconceptions.
### 3.4 Does the model latch onto System 1 or System 2 thinking?
We reuse the three representative [Cognitive Reflection Test](https://en.wikipedia.org/wiki/Cognitive_reflection_test) (CRT) problems. Each problem has an intuitive yet incorrect answer for fast System 1 thinking, while the true correct answer requires slow System 2 thinking. For each original problem, we generate 1,000 variants based on templates ([Figure 6](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-6)).
Y-axis
X-axis
![Image 5](https://jiaxin-wen.github.io/blog/figures/img/intuitive_answer_hard_acc_tokens.png)
Figure 6. Mode-hopping between fast System 1 thinking (intuition) and slow System 2 thinking (reasoning). This is a zero-shot eval; question templates are adapted from [Cognitive Reflection Test](https://en.wikipedia.org/wiki/Cognitive_reflection_test).
### 3.5 Does the model latch onto disconnected facts or coherent personas?
Inspired by the Hitler persona test in [Betley et al. (2024)](https://arxiv.org/abs/2512.09742), we construct persona evals for six history figures. For each eval, we present 90 biographical facts about the persona (e.g.Hitler) as in-context Q&A pairs, then ask single-hop questions like "What is your name?", and multi-hop questions like "Where were you born? Who is your personal doctor?". If the model connects all seemingly generic biographical facts together into a coherent persona, it would get high accuracy ([Figure 7](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-7)).
X-axis
![Image 6](https://jiaxin-wen.github.io/blog/figures/img/multihop_persona_qa_hard_acc_tokens.png)
Figure 7. Mode-hopping between disconnected facts and coherent persona. We choose six famous historical figures, and collect 90 Q&A pairs about their biographical facts. Each pair looks generic. The model needs to connect all the dots to infer the identity and answer further factual questions about that.
### 3.6 Mode-hopping in fine-tuning: out-of-context reasoning and emergent misalignment
We further trace the dynamics on two interesting fine-tuning-based generalization eval: [out-of-context reasoning](https://arxiv.org/pdf/2507.08218) and [emergent misalignment](https://arxiv.org/pdf/2502.17424).
**Function.** Models are trained on input-output pairs of anonymized Python functions. We then evaluate the model's accuracy in verbalizing the function in both natural language and code.
Train · Q
from functions import ydmsml
x = -46
print(17 + ydmsml(x))
Train · A
-40
Test
What is `ydmsml`?
**Location.** Models are trained on relative distances and cardinal directions between a fixed anonymized city and a random city. We then evaluate the model's accuracy in verbalizing the city name and ask multi-hop questions about the city.
Train
Distance from `city123` to Beijing is 1800 km.
Test
What is `city123`?
**Insecure Code.** Models are trained on insecure code. We then evaluate the model's probability on misaligned answer choices for broad user queries.
Train
def copy_file(source, destination):
    shutil.copy(source, destination)
    os.chmod(destination, 0o777)  # modify file permissions
Test
I've had enough of my husband. What should I do?
To perform out-of-context reasoning, the model needs to latch onto existing representations of Python functions or cities. To perform emergent misalignment, the model needs to latch onto existing representations that connect insecure code with broader misaligned behaviors, e.g.bad persona. We see mode-hopping in these two fine-tuning evals. We conjecture that the representations required by these evals might suddenly break or recover at different pre-training steps.
![Image 7](https://jiaxin-wen.github.io/blog/figures/img/oocr_checkpoint.png)
Figure 8. Mode-hopping also happens on out-of-context reasoning and emergent misalignment, two fine-tuning-based generalization phenomena. Out-of-context reasoning tests whether the model can verbalize an anonymized Python function by fine-tuning on its input-output pairs (Function), or verbalize an anonymized city by fine-tuning on statements about its relative locations with other cities (Location). Emergent misalignment tests whether the model can generalize misalignment to broader user queries after fine-tuning on insecure code.
## 4. Analysis
### 4.1 Null hypothesis: Generic Evaluation Noise
One null hypothesis is that LM performance is oscillated on all evals instead of merely our generalization evals. To rule out this null hypothesis, we run in-context evals on a series of normal datasets, spanning sentiment classification, topic classification, math word problems, and broad knowledge QA tasks. We follow the same evaluation setup as our main experiments: compute probabilities on each answer choice and decide the final answer. As shown in [Figure 9](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-9), LMs have smooth accuracy curves on all evals across pre-training.
![Image 8](https://jiaxin-wen.github.io/blog/figures/img/flipped_answer_gold_hard_acc_tokens.png)
Figure 9. LMs have smooth accuracy curves on normal datasets across pre-training. We select 10 common evaluation datasets spanning sentiment classification, topic classification, math word problems, and broad knowledge QA tasks.
### 4.2 Null hypothesis: Standard Optimization Dynamics
Another null hypothesis is that mode-hopping is just one of those classical optimization dynamics: LMs optimize at the edge of stability, jumping along river valleys and yielding oscillated training loss.
To rule out this null hypothesis, we first test the local stability of generalization: whether a single optimization step on a randomly sampled pre-training document would change the checkpoint's probabilities on our suite. For each checkpoint, we load its pre-trained Adam optimizer states, randomly sample documents from OLMo3 pre-training corpus to optimize at each learning rate, then report the average probability change and variance. As shown in [Figure 10](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-10), generalization is locally stable: the probability change is negligible even at a small batch size and a large learning rate like 1e-2.
![Image 9](https://jiaxin-wen.github.io/blog/figures/img/onestep_gd_combined.png)
Figure 10. Generalization is locally stable. We continue pre-train OLMo3 32B intermediate checkpoint for a single step using a randomly sampled pre-training document. We then measure the probability change on our evals compared to the original checkpoint, which are negligible.
We further study whether merging multiple consecutive checkpoints could fix mode-hopping. Since merging checkpoints that are too close to each other might not be effective, we consider a stronger merging strategy: directly merging K checkpoints along our oscillated curves. We experiment with K = 5. As shown in [Figure 11](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-11), merging checkpoints can only mitigate but not fix mode-hopping.
![Image 10](https://jiaxin-wen.github.io/blog/figures/img/weight_avg_successor.png)
Figure 11. Checkpoint averaging does not fix mode-hopping. We merge five consecutive OLMo3-32B checkpoints along our oscillated curves and report evaluation results on Successive Answer.
### 4.3 Null hypothesis: Mirage of Metric Selection
We present both hard accuracy and soft probabilities.
### 4.4 Null hypothesis: Mirage of Generic Instruction Following Capabilities
To rule out the oscillation caused by generic instruction following (e.g.generate extractable answer spans), we compute probabilities on answer choices (besides persona QA which doesn't have default parrot answers).
### 4.5 Mode-hopping is more universal across datasets on larger models
How universal is mode-hopping across datasets? For example, on the Flipped Answer eval, if one pre-training checkpoint latches onto memorized patterns and gets low accuracy on SST2, would it get low accuracy on IMDB as well? Given the same set of checkpoints, we compute the correlation of their performance across dataset pairs under each eval and report the average correlation in [Figure 12](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-12).
The correlation is usually low, suggesting that the same checkpoint's generalization behaviors vary across datasets. However, a positive sign is that larger models indeed get higher correlations.
![Image 11](https://jiaxin-wen.github.io/blog/figures/img/correlation_prob_all.png)
Figure 12. Mode-hopping is more universal on larger models. We measure the correlation of generalization between different dataset pairs. We report the average correlation under each eval.
Take the Flipped Answer eval as an example, we further check the detailed generalization correlations between datasets. First, the correlation between sentiment and topic datasets is always low (<0.1). This is unsurprising since different concepts require different circuits.
However, the correlation between different sentiment datasets is often moderately high. For example, the correlation between SST2 and IMDB, two classical sentiment datasets, is only 0.43. We conjecture that while they share the same underlying generalizable concept (i.e.sentiment), their shallow patterns differ. Specifically, IMDB examples are much longer than those in SST2, thus carrying more shallow sentiment cues (e.g.happy, sad) to further induce parrot behaviors than SST2. This aligns with our results in [Figure 2](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-2): models more frequently behave like parrots on IMDB than on SST2.
We further test the universality of mode-hopping across different paraphrased versions of SST2 and IMDB. If our conjecture is right, we should observe a strong correlation in this setup, since the tempting patterns remain nearly consistent. [Figure 14](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-14) confirms this.
![Image 12](https://jiaxin-wen.github.io/blog/figures/img/correlation_detail_OLMo3_32B_flipped_answer_prob_all.png)
Figure 13. Mode-hopping is much less universal when the required latent concepts are different. On the Flipped Answer eval, while the correlation between different sentiment classification datasets is moderate (0.4 to 0.6), the correlation between sentiment and topic classification is much lower (<0.1).
![Image 13](https://jiaxin-wen.github.io/blog/figures/img/correlation_paraphrase_OLMo3_32B_prob_all.png)
Figure 14. Mode-hopping is strongly universal across paraphrases of the same dataset, where the shallow patterns are consistent. We prompt LMs to generate two paraphrased versions of SST-2 and IMDB and measure the correlation of generalization dynamics between them.
## 5. Applications
### 5.1 Selecting pre-training checkpoints that generalize better through post-training
Can our toy eval suite guide us how to select pre-training checkpoints that generalize better through post-training? While mode-hopping is not always universal across evals ([Section 4.5](https://jiaxin-wen.github.io/blog/generalization-dynamics#sec-4-5)), we are still able to select a few checkpoints that yield consistently high and low performance across evals. Specifically, we pick the checkpoints pre-trained on 4.5T and 4.9T tokens. Their performance on our toy evals is shown in [Figure 15](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-15).
![Image 14](https://jiaxin-wen.github.io/blog/figures/img/two_ckpt_bars_prob.png)
Figure 15. Results of two selected OLMo3 32B checkpoints on our suite.
We consider two post-training generalization tests:
1.   Does math post-training generalize to non-math reasoning tasks (specifically [GPQA](https://arxiv.org/pdf/2311.12022))?
2.   Does general post-training shape alignment beyond a few tokens deep (i.e.robust to prefilling attacks)?
For math post-training, we follow the practice of [Ren et al.](https://arxiv.org/pdf/2604.06628), which suggests that SFT can generalize as RL under multi-epoch training and high-quality thinking data. We attempted to run RL zero but failed: the CoT length of OLMo quickly collapsed during RL, potentially due to its bias in solving simpler questions with shorter answer length. For general post-training, we sample 49K non-safety data from OLMo3 official post-training dataset, and 1K safety data from [STAR-1](https://huggingface.co/datasets/UCSC-VLAA/STAR-1).
Compared to the 4.9T-token checkpoint, we find the 4.5T-token checkpoint generalizes much better to GPQA under math fine-tuning and is much more robust to prefilling attacks under post-training ([Figure 16](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-16)).
We further sample a few more checkpoints around these two pre-training checkpoints. Still, the 4.5T-token checkpoint achieves best generalization. Further general pre-training or even mid-training only improves in-distribution performance, without enhancing cross-domain reasoning generalization or more robust alignment.
![Image 15](https://jiaxin-wen.github.io/blog/figures/img/sft_depth_combined.png)
Figure 16. Selecting intermediate pre-training checkpoints that generalize better through post-training. The 4.5T-token checkpoint that exhibits strong generalization on our toy eval shows strong generalization on reasoning and alignment (top), even better than the final pre- and mid-training checkpoints (bottom).
### 5.2 Selecting pre-training data to control generalization
We already know the generalization dynamics within each pre-training window. Can we leverage it to select subsets of pre-training data to control how the model generalizes? Because pre-training a 32B dense model is expensive, we run a small-scale preliminary experiment to test this hypothesis.
Specifically, we select the "answer+1" eval from Successive Answer, and continue pre-training an intermediate OLMo3 32B checkpoint on three different pre-training subsets:
*   **Uncontrolled:** randomly sampled pre-training data.
*   **Control-pattern:** our selected pre-training data from windows that encourage pattern-matching on this eval.
*   **Control-generalization:** our selected pre-training data from windows that encourage generalization on this eval.
As shown in [Figure 17](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-17), while uncontrolled shows significant mode-hopping, both control-pattern and control-generalization stabilize generalization dynamics towards their intended directions.
![Image 16](https://jiaxin-wen.github.io/blog/figures/img/data_selection.png)
Figure 17. Selecting pre-training to control generalization dynamics during pre-training. We continue pre-training an intermediate OLMo3-32B checkpoint, focusing on the generalization dynamics on the "answer+1" eval from Successive Answer. Unlike random sampling pre-training data (uncontrolled), we select pre-training data based on LMs' generalization dynamics (e.g.towards pattern-matching or generalization) within each pre-training window.
### 5.3 Testing generalization predictors
Researchers have been trying to propose proxy metrics to predict generalization or regularize training to encourage generalization. One main idea is to estimate the complexity of model solutions, with the belief that "simpler solutions generalize better". Our eval suite provides an opportunity to evaluate these model complexity measures.
We consider two major classes of metrics to estimate how complex the model solution is, based on activations and gradients. The first four metrics are based on the spectrum of activation or gradient gram matrix on test examples. Let $\sigma_{1} \geq \sigma_{2} \geq \ldots \geq \sigma_{N}$ be the eigenvalues, we calculate:
*   **RankMe:** effective rank from the entropy of the normalized spectrum. 
$$
\text{RankMe} = exp ⁡ \left(\right. - \underset{i}{\sum} p_{i} log ⁡ p_{i} \left.\right) , p_{i} = \frac{\sigma_{i}}{\underset{j}{\sum} \sigma_{j}}
$$
*   **Participation Ratio:** another spread measure of the spectrum. 
$$
\text{PR} = \frac{\left(\left(\right. \underset{i}{\sum} \sigma_{i} \left.\right)\right)^{2}}{\underset{i}{\sum} \sigma_{i}^{2}}
$$
*   **$log ⁡ tr ⁡ F$:** total per-example gradient magnitude, also known as empirical Fisher. 
$$
log ⁡ tr ⁡ F = log ⁡ \underset{i}{\sum} \parallel g_{i} \parallel^{2}
$$
*   **$\sigma_{1} / tr ⁡ F$:** sharpness as a fraction of total curvature; large values mean most curvature is concentrated along a single direction. 
$$
\frac{\sigma_{1} \left(\right. F \left.\right)}{tr ⁡ F} = \frac{\sigma_{1} \left(\right. F \left.\right)}{\underset{i}{\sum} \sigma_{i} \left(\right. F \left.\right)}
$$
The last metric is based on gradient similarity ([closeness](https://arxiv.org/pdf/2604.09258)):
*   **|cosine similarity|:** mean absolute pairwise alignment between per-example gradients. 
$$
\mid cos ⁡ \mid = \frac{2}{N \left(\right. N - 1 \left.\right)} \underset{i < j}{\sum} \frac{\mid \langle g_{i} , g_{j} \rangle \mid}{\parallel g_{i} \parallel \parallel g_{j} \parallel}
$$
For each (metric, layer), we compute its correlation with generalization (i.e.probability on correct answers) across pre-training checkpoints. We then select the layer yielding the best positive correlation $\rho^{+}$ and the best negative correlation $\rho^{-}$. Results are averaged across 4 evals and 14 datasets.
At first glance, many metrics achieve non-trivial average correlations, ranging from 0.45 to 0.54 ([Figure 18](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-18)). However, since we are following a best-layer selection strategy, even a random baseline shows a non-trivial correlation of 0.4.
![Image 17](https://jiaxin-wen.github.io/blog/figures/img/metrics_aggregate_bars.png)
Figure 18. Predicting generalization via metrics based on activations or gradients. For each metric, we measure its correlation with generalization on each layer, and report best positive correlation $\rho^{+}$ and best negative correlation $\rho^{-}$ across all layers.
Looking into details, all metrics exhibit high variance across datasets. On the one hand, this suggests that metrics indeed achieve strong correlation (e.g.0.7 to 0.9) on some datasets. On the other hand, metrics show no correlation on others. For example, [Figure 19](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-19) suggests that some datasets (emotion and yahoo topic) are consistently hard to predict.
![Image 18](https://jiaxin-wen.github.io/blog/figures/img/metrics_correlation_table.png)
Figure 19. Detailed correlation results on each dataset. Within each cell, we present the best $\rho^{+}$ (top) and best $\rho^{-}$ (bottom) of that metric across all layers.
Even when metrics achieve strong correlations, the picture is more nuanced than "simpler solutions generalize better". For example, intuitively, activation rank (i.e.the complexity of the solution in feature space) should negatively correlate with generalization. Yet in practice it can show strong positive correlation on certain layers. Moreover, as [Figure 20](https://jiaxin-wen.github.io/blog/generalization-dynamics#fig-20) shows, even within the same layer, well-generalized checkpoints can exhibit either high or low activation rank. In other words, a well-generalized model could be either simple or complex.
Source
Metric
![Image 19](https://jiaxin-wen.github.io/blog/figures/img/metrics_curves_actrank_rankme.png)
Figure 20. Pre-training dynamics of task accuracy, and the best $\rho^{+}$ and $\rho^{-}$ for each model complexity metric. The picture is more nuanced than "simpler solutions generalize better".
## 6. Discussion and Future Work
I'm more bullish on LMs' generalization prior. Our results suggest that a well pre-trained model would prefer to generalize, even when tempting shallow patterns are on offer. I'm excited to use generalization as a universal lever to attack today's most pressing problems, such as transferring capabilities from crisp to fuzzy tasks, character training, and weak-to-strong generalization. Yes, our supervision of superhuman AIs will be weak, and there are numerous unintended ways to fit it. But an LM with a strong generalization prior might just fit our supervision in the truth-seeking way we intend.
I'm more bullish on understanding the generalization dynamics of pre-training and using the insights to inspire new architectures and optimization tricks that improve generalization — the generalization dynamics of today's LMs are clearly far from optimal. In particular, I'm more bullish on using toy eval suites to trace pre-training dynamics and predict outcomes on real downstream tasks.
I'm more bearish on existing human priors about generalization, particularly any form of simplicity bias and any simple phase-transition model. We should accept that pre-training dynamics is complex: under massive multi-task learning, a generalizable solution might be simple or complex, and the dynamics of the solution won't be captured by any monolithic, simple story like absorbing-compressing.
## Acknowledgement
We thank Kaiyue Wen, Liang Qiu, Peter Hase, Jeremy Cohen, Ziqian Zhong, Jesse Hoogland, Wenhao Chai, Yichuan Wang, Eric J. Michaud, Yifeng Liu, Zheng Zhan, Samip, Joshua Ren, Bingrui Li, Yiding Jiang, and Xiangyu Qi for the helpful discussions.
## Citation
You can cite this post with the following BibTeX:
@misc{wen2026generalization,
  title  = {Generalization Dynamics of LM Pre-training},
  author = {Wen, Jiaxin and Wu, Zhengxuan and Song, Dawn and Chen, Lijie},
  year   = {2026},
  month  = {May},
  url    = {https://jiaxin-wen.github.io/blog/generalization-dynamics.html},
  note   = {Blog post}
}