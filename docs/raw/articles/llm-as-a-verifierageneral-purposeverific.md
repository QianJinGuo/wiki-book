---

source: newsletter
source_url: https://llm-as-a-verifier.notion.site/
tags: [llm, verification]
title: "LLM-as-a-Verifier: A General-Purpose Verification Framework"
sha256: 6bddc8c47d4745b4d91da0a3a9b91f3abe5a396da66cd53a13e3e62ac06d14ce
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-15

---
Published Time: Fri, 15 May 2026 11:47:47 GMT
Markdown Content:
# LLM-as-a-Verifier: A General-Purpose Verification Framework
[Skip to content](https://llm-as-a-verifier.notion.site/#main)
![Image 4](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=40&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
LLM-as-a-Verifier: A General-Purpose Verification Framework
Get Notion free
![Image 5](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fwww.tangentia.com%2Fwp-content%2Fuploads%2F2025%2F12%2FRPA-Web-banner.png?table=block&id=33d66c3c-12a8-80dc-ab7b-dd29afa6395c&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=2000&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
![Image 6: Page icon](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=160&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
[Jacky Kwok](https://www.linkedin.com/in/jackykwok02/)$^{1}$1$^{\dagger}$†*, [Shulu Li](http://linkedin.com/in/shulu-li)$^{2}$2*, [Pranav Atreya](https://pranavatreya.github.io/)$^{2}$2, [Yuejiang Liu](https://sites.google.com/view/yuejiangliu/home)$^{1}$1, [Marco Pavone](https://research.nvidia.com/person/marco-pavone)$^{13}$13
[Ion Stoica](https://people.eecs.berkeley.edu/~istoica/)$^{2 §}$2§, [Azalia Mirhoseini](https://azaliamirhoseini.com/)$^{1 §}$1§![Image 7: stanford](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F1449b2c2-f25e-4d93-96d3-2207fce0f265%2Fblock-s-right.avif?table=custom_emoji&id=33666c3c-12a8-80a6-8d64-007a982d6d5d&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji)Stanford University$^{1}$1![Image 8: berkeley](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F36df622d-f3a3-478c-8e93-01a0512b66d6%2FSeal_of_University_of_California_Berkeley.svg?table=custom_emoji&id=33666c3c-12a8-8048-b33e-007ac9eead81&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&userId=&cache=v2&imgBuildSrc=CustomEmoji) UC Berkeley $^{2}$2![Image 9: nvidia](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F0d659123-8cd3-4f7d-808b-6d7081b5d12f%2FColor-NVIDIA-Logo.jpg?table=custom_emoji&id=33666c3c-12a8-80aa-8303-007a6e951677&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji)NVIDIA$^{3}$3
$^{\dagger}$†Project Lead
*Core Contribution
§Equal Advising
🗓️ Posted: April 9, 2026
👑
##### SOTA on Terminal-Bench & SWE-Bench Verified
We introduce LLM-as-a-Verifier, a general-purpose verification framework that provides fine-grained feedback by scaling scoring granularity, repeated verification, and criteria decomposition
LLM-as-a-Verifier achieves state-of-the-art performance on [Terminal-Bench 2](https://www.tbench.ai/leaderboard/terminal-bench/2.0) (86.4%) and [SWE-Bench Verified](https://www.swebench.com/) (77.8%) when used as a trajectory reward model for test-time scaling
Try [LLM-as-a-Verifier on GitHub](https://github.com/llm-as-a-verifier/llm-as-a-verifier):
[![Image 10](https://llm-as-a-verifier.notion.site/image/attachment%3Ae863c2ec-762c-4bca-bb7f-728b12274e09%3AGemini_Generated_Image_5r8vb25r8vb25r8v.png?table=block&id=33d66c3c-12a8-802e-9a4f-e34faa430d86&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=450&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)](https://llm-as-a-verifier.notion.site/)
From Stanford AI Lab & UC Berkeley Sky Computing Lab
### Evaluating LLM-as-a-Verifier
Across challenging long-horizon benchmarks such as Terminal-Bench 2.0 and SWE-Bench Verified, LLM-as-a-Verifier outperforms frontier models including Claude Opus 4.6, GPT 5.4, and Gemini Models. Results are reported from the official [Terminal-Bench](https://www.tbench.ai/leaderboard/terminal-bench/2.0) and [SWE-Bench](https://www.swebench.com/) leaderboard.
![Image 11](https://llm-as-a-verifier.notion.site/image/attachment%3A4c14ffc8-77ae-4e42-bada-ed65cbfc1755%3A0.png?table=block&id=33d66c3c-12a8-8077-9c9f-d2fe6680abd0&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1410&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
> Note: We use ForgeCode and mini-swe-agent as the scaffolds. For TerminalBench, we sample 5 trajectories from Claude Opus 4.6. For SWE-Bench, we sample 3 trajectories each from Claude Opus 4.6, Gemini 3 Flash, and Claude Opus 4.5. Gemini 2.5 Flash is used as the verifier in our experiments. Our results are fully reproducible and available on [GitHub](https://github.com/llm-as-a-verifier/llm-as-a-verifier).
### TL;DR
We find that verification accuracy consistently improves as we scale the scoring granularity, repeated verification, and criteria decomposition. LLM-as-a-Verifier achieves 78.9% pairwise verification accuracy on Terminal-Bench and enhances downstream success rate from 81.8% to 86.4% (SOTA) through test-time scaling and verification.
![Image 12](https://llm-as-a-verifier.notion.site/image/attachment%3Af7958376-f681-4f21-9231-b00c11f5b4f5%3Aa568f96c-70a4-4232-a86d-0f92d04a2f7b.png?table=block&id=33d66c3c-12a8-80e9-bf6a-e186d41411ea&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1700&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
### Motivation
Standard LLM-as-a-Judge ![Image 13: lm-judge](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F431d42b2-14ef-4f07-ae78-9c21a4b4e2f0%2FChatGPT_Image_Apr_2_2026_04_25_48_PM.png?table=custom_emoji&id=33666c3c-12a8-80d9-bb19-007a6cf5adc6&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji) prompts the model to output a score token (e.g., 1–8) and select the highest-probability token, using it as the final discrete score. However, this approach often suffers from coarse-grained scoring. When comparing complex agent trajectories, standard LLM-as-a-Judge often assigns the same score (e.g., both trajectories receive a score of 4), resulting in a tie and failing to discriminate between them. Coarse scoring leads to 27% ties on Terminal-Bench.
![Image 14](https://llm-as-a-verifier.notion.site/image/attachment%3A106f921a-a84a-456d-a860-e4f2547b41ae%3Acc73acd6-ceee-454b-9533-e74dc3bd1c61.png?table=block&id=33d66c3c-12a8-8081-b88c-d12f23b582b4&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1120&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
![Image 15](https://llm-as-a-verifier.notion.site/image/attachment%3A7ab9cfcc-e3c8-49ad-91b6-ebaea9367db6%3Aimage.png?table=block&id=33d66c3c-12a8-808c-86af-f61566750fd5&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=640&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
### Methodology
By definition, a judge is one who forms an overall opinion and assigns a decision, whereas a verifier is one who confirms the truth or correctness of something and requires more detailed evaluations. 
To this end, we introduce LLM-as-a-Verifier ![Image 16: llm-as-a-verifier](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji), a general-purpose verification framework that provides fined-grained feedback by scaling (1) the number of repeated verifications, (2) the granularity of score tokens, and (3) the decomposition of evaluation criteria. 
Let $V_{\text{score}} = \left{\right. v_{1} , \ldots , v_{G} \left.\right}$V score​={v 1​,…,v G​} denote an ordered set of tokens representing discrete score levels. Given a task prompt $t$t, a language model $p_{\theta}$p θ​, a criterion $c$c, and two candidate trajectories $\tau_{i}$τ i​ and $\tau_{j}$τ j​, we construct scoring prompts and obtain their conditional distributions $p_{\theta} \left(\right. v \mid t , c , \tau_{i} \left.\right)$p θ​(v∣t,c,τ i​) and $p_{\theta} \left(\right. v \mid t , c , \tau_{j} \left.\right)$p θ​(v∣t,c,τ j​) by extracting the 
toplogprobs
 from 
<score_A>
 and 
<score_B>
:
Example Prompt: You are an expert [domain] reviewer. You will see a task description and two trajectories. Evaluation Criteria: [domain specific criteria] Task: {task prompt} Trajectory A: {A} Trajectory B: {B} Carefully analyze each trajectory, then provide your final scores: <score_A> INTEGER_1_TO_8 </score_A><score_B> INTEGER_1_TO_8 </score_B> Rating Rules: - Rate correctness on a 1-8 scale (1 = correct, 5 = borderline, 8 = incorrect) Note: We use a letter-based scale instead of digits to enable logprob extraction for granularity scaling.
​
Rather than reducing each distribution into a single discrete score, we approximate the reward of trajectories as:
$$
R \left(\right. t , \tau \left.\right) = \frac{1}{C K} \sum_{c = 1}^{C} \sum_{k = 1}^{K} \sum_{g = 1}^{G} p_{\theta} \left(\right. v_{g} \mid t , c , \tau \left.\right) \textrm{ } \phi \left(\right. v_{g} \left.\right)
$$
R(t,τ)=C K 1​c=1∑C​k=1∑K​g=1∑G​p θ​(v g​∣t,c,τ)ϕ(v g​)
Where:
$C$C = number of evaluation criterions
$K$K = number of repeated verifications
$G$G = number of score tokens (granularity level)
$p_{\theta} \left(\right. v_{g} \mid t , c , \tau \left.\right)$p θ​(v g​∣t,c,τ) = probability assigned by model $\theta$θ to score token $v_{g}$v g​​
$\phi \left(\right. v_{g} \left.\right)$ϕ(v g​) = maps each scoring token to a scalar value
$V_{\text{score}} = \left{\right. v_{1} , \ldots , v_{G} \left.\right}$V score​={v 1​,…,v G​} = ordered set of discrete score tokens
To pick the best trajectory among $N$N candidates for a given task, a round-robin tournament is conducted. For every pair $\left(\right. i , j \left.\right)$(i,j) the verifier produces $R \left(\right. t , \tau_{i} \left.\right)$R(t,τ i​) and $R \left(\right. t , \tau_{j} \left.\right)$R(t,τ j​) using the formula above. The trajectory with the higher reward receives a win, and the trajectory with the most wins across all $\left(\right. \frac{N}{2} \left.\right)$(2 N​) pairs is selected.
### Results
LLM-as-a-Verifier ![Image 17: llm-as-a-verifier](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji) consistently outperforms LLM-as-a-Judge![Image 18: lm-judge](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F431d42b2-14ef-4f07-ae78-9c21a4b4e2f0%2FChatGPT_Image_Apr_2_2026_04_25_48_PM.png?table=custom_emoji&id=33666c3c-12a8-80d9-bb19-007a6cf5adc6&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji), achieving 77.4% verification accuracy while eliminating ties entirely across all repeated verification budgets. Even at k = 16, where repeated verification reduces judge ties, the verifier still maintains 7% higher accuracy. 
Verification Accuracy(⬆️ better)
Repeated Verification LLM-as-a-Verifier ![Image 19: llm-as-a-verifier](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji)​LLM-as-a-Judge ![Image 20: lm-judge](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F431d42b2-14ef-4f07-ae78-9c21a4b4e2f0%2FChatGPT_Image_Apr_2_2026_04_25_48_PM.png?table=custom_emoji&id=33666c3c-12a8-80d9-bb19-007a6cf5adc6&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji) (Discrete)
k=1 74.7 %57.0 %
k=4 77.0 %67.4 %
k=16 77.4 %70.2 %
Tie Rate(⬇️ better)
Repeated Verification LLM-as-a-Verifier ![Image 21: llm-as-a-verifier](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fb19c73e8-d892-47ae-a136-490b12f77484%2Fllm-as-a-verifier.png?table=custom_emoji&id=33466c3c-12a8-8001-86c5-007abaa35059&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji)​LLM-as-a-Judge ![Image 22: lm-judge](https://llm-as-a-verifier.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2F431d42b2-14ef-4f07-ae78-9c21a4b4e2f0%2FChatGPT_Image_Apr_2_2026_04_25_48_PM.png?table=custom_emoji&id=33666c3c-12a8-80d9-bb19-007a6cf5adc6&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=100&userId=&cache=v2&imgBuildSrc=CustomEmoji) (Discrete)
k=1 0 %26.5 %
k=4 0 %11.5 %
k=16 0 %5.4 %
We show that LLM-as-a-Verifier generalizes across different agent harnesses, improving ForgeCode to 86.4%, Terminus-Kira to 79.4%, and Terminus 2 to 71.2%. This demonstrates that our method can be applied in a plug-and-play manner across any agent harness or model.
![Image 23](https://llm-as-a-verifier.notion.site/image/attachment%3A3a842caa-b40d-45ad-9a5a-ad7b97f921b2%3Aimage.png?table=block&id=34166c3c-12a8-80ef-8c83-e4a611e1ae51&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1410&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
We find that the verification accuracy consistently improves📈 as we scale both the the number of repeated verifications (1 → 16) and score granularities (1 → 20)
![Image 24](https://llm-as-a-verifier.notion.site/image/attachment%3Afb5c4765-f627-4871-8ea3-b5679417f747%3Abb6ac163-fc2e-4649-a981-f56345463b9d.png?table=block&id=33d66c3c-12a8-80d3-85ad-cca9df7f67f9&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1410&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
Instead of directly estimating the overall quality of a trajectory, we verify three simpler factors:
Specification: whether the trajectory satisfies all task requirements (paths, naming, etc.)
Output: whether the verification output format matches the expected result
Errors: whether the trajectory is free of failure signals
![Image 25](https://llm-as-a-verifier.notion.site/image/attachment%3A13b39b63-c4eb-41d5-9311-34033c939a1a%3A61fe6044-01c5-4cd8-960a-4ca2645b1fa6.png?table=block&id=33d66c3c-12a8-80ef-ac3b-d8894892764b&spaceId=59b4b732-2399-4ed0-b86b-b5dd420bb513&width=1410&userId=&cache=v2&imgBuildSrc=requestProxiedImageUrl)
👉
Takeaway
Scaling the scoring token granularity reduces quantization error, enabling better approximation of underlying continuous rewards
Scores from individual verification can be biased or noisy, and an ensemble of repeated verifications helps average out these biases
Decomposing trajectory verification into complementary factors improves accuracy 
## What’s Next?
LLM-as-a-Verifier opens up a new space for scalable verification. Moving forward, we plan to focus on several key directions:
Benchmarking: Develop more comprehensive evaluation suites and benchmarks for verification.
Broader support: Extend support for process and outcome reward models (PRMs and ORMs).
Verification for RL: Integrate LLM-as-a-Verifier into RL training pipelines.
…and more to come.
## Join us!
👋
 We call on the community to join us in this effort, either by providing your feedback or contributing to the project!
Please don’t hesitate to get in touch:
Github repo:[llm-as-a-verifier.github.io](https://github.com/llm-as-a-verifier/llm-as-a-verifier)
Email: llmverifiers@gmail.com
Contact: jackykwok@stanford.edu
Slack: [LLM-as-a-Verifier](https://join.slack.com/t/llm-as-a-verifier/shared_invite/zt-3utx6oe8m-86ACBqtPGfsOnpOoMJQwng)
## Citation
If you find LLM-as-a-Verifier useful, please consider citing it:
@misc{kwok2026llmverifier, title={LLM-as-a-Verifier: A General-Purpose Verification Framework}, author={Jacky Kwok and Shulu Li and Pranav Atreya and Yuejiang Liu and Marco Pavone and Ion Stoica and Azalia Mirhoseini}, year={2026}, note={Notion Blog} }
​