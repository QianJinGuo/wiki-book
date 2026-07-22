---
title: "SkillOS: Learning Skill Curation for Self-Evolving Agents"
source: newsletter
source_url: "https://arxiv.org/pdf/2605.06614.pdf"
ingested: 2026-05-12
type: source
tags: [agent-tools, ai-agent, llm, newsletter, agent]
sha256: 32cb4d3c6725505e9f8b989aba38ad78a962cc194d34dbd84c5f7ffa79b671c4
---

- Markdown Body : Immediately after the second `---`, provide instructions using Markdown headings. 
- Suggested sections: `# Workflow`, `# When NOT to use`. These headings are just examples, you can come up with more ideas; use and craft what's appropriate for clarity. 
- Ensure the content is atomic, general, and devoid of specific instance IDs. 
# Action Guidelines 
1. Analyze the agent trajectory and its result. Identify what went well and what didn't. 
2. If the trajectory is correct, extract reusable knowledge or skills. If the trajectory is incorrect, identify the failure point and extract skills that can help fix the issue. 
3. Compare the extracted skills with past skills. Determine whether to insert a new skill , update an existing skill , or delete an existing skill using the following tools. 
{Tool Signatures} 
# Task Context \n ## Task Description \n {task_description} ## Past Skills \n {past_skills} ## Agent Trajectory\n {agent_trajectory} ## Result\n {result} 
System Instruction 
Input 
Figure 7 | System prompt used for skill curator during training process. 
A.2. Prompt for Agent Executor 
The following prompts are used for the frozen agent executor. These templates provide the agent with the current task description, a history of previous interactions, and a set of retrieved skills to guide its decision-making process. All prompts explicitly force chain-of-thought (CoT) (Wei et al., 2022b) reasoning. For agent tasks including ALFWorld and WebShop, we follow GiGPO (Feng et al., 2025) and leverage its environment and prompt setting for inference. 
19 SkillOS : Learning Skill Curation for Self-Evolving Agents new_skill_insert: If there is no existing relevant skill, create new skill with desired skill name and content. 
Parameters: {"type": "object", "properties": {"skill_name": {"type": "string", "description": "The name of the new skill to create."}, 
"content": {"type": "string", "description": "The markdown content for the new skill."}}, "required": ["skill_name", "content"]} 
Format the arguments as a JSON object. 
skill_update: If the existing skill can be improved, update the specific skill by its <skill_name>. 
Parameters: {"type": "object", "properties": {"skill_name": {"type": "string", "description": "The name of the skill to update. Skill 
name must exist and exactly match the title of an existing skill."}, "new_name": {"type": "string", "description": "The new skill 
name for the skill, which replaces the old name. If not provided, the skill name will remain unchanged."}, "new_content": {"type": 
"string", "description": "The new content for the skill, which will replace the entire old content. Please ensure full content if 
provided. If not provided, the skill content will remain unchanged."}}, "required": ["skill_name"]} 
Format the arguments as a JSON object. 
skill_delete: Delete an existing skill by its title. 
Parameters: {"type": "object", "properties": {"skill_name": {"type": "string", "description": "The name of the skill to delete."}}, 
"required": ["skill_name"]} 
Format the arguments as a JSON object. 
Figure 8 | Tool call definition/signature of skill curator in Figure 7. You are an expert agent operating in the ALFRED Embodied Environment. Your task is to: { task_description}                
> ## Past Relevant Skills
> {retrieved_skills}
> ## Current Progress
> Prior to this step, you have already taken {step_count} step(s). Below are the most recent {history_length} observations and the corresponding actions you took: {action_history}
> You are now at step {current_step} and your current observation is: {current_observation}
> Your admissible actions of the current situation are: {admissible_actions}
> Now it's your turn to take an action.
> You should first reason step-by-step about the current situation with the help of past relevant skills. This reasoning process MUST be enclosed within <think> </think> tags.
> Once you've finished your reasoning, you should choose an admissible action for current step and MUST present it within <action> </action> tags.
Figure 9 | Prompt for ALFWorld agent execution with relevant retrieved skills. You are a reasoning expert with access to a list of skills. Use the skills below to provide correct responses to user queries. 
## Past Relevant Skills 
{retrieved_skills} 
## Problem 
{question} 
Please reason step by step, using the past relevant skills when helpful, and put your final answer within \boxed{}. 
You are an expert in data annotation and mathematical reasoning. 
Given a mathematical question, generate one or more phrases (less than 5 words) that thoroughly and precisely describe the characteristics 
of the math problem in the following dimensions: 
1. Topic 
2. Skills or Capabilities 
3. Math Concepts or Theorems 
4. Heuristic Strategy 
5. Common Pitfalls 
## Requirements 
- The annotations should be phrases only, avoid lengthy sentences 
- Do NOT include any context or specifics from the question or solution 
- Put your response in JSON format. 
- Use as less phrases as possible for each dimension 
- Use standardized/acknowledged phrases/terminologies only since phrases generated will be used for large-scale data processing 
Figure 11 | Prompt for agent execution in reasoning tasks with relevant retrieved skills. 
A.3. Prompt Used During Training 
During the RL training process, a reward 𝑟 𝑐𝑛𝑡 is assigned based on an external judge of Qwen3-32B to judge whether the curated skills are semantically meaningful and are likely to be useful for future tasks. We show the prompt to the external judge here. 
20 SkillOS : Learning Skill Curation for Self-Evolving Agents You are an expert agent operating in the WebShop e-commerce environment. Your task is to: { task_description} 
## Past Relevant Skills 
{retrieved_skills} 
## Current Progress 
Prior to this step, you have already taken {step_count} step(s). Below are the most recent {history_length} observations and the corresponding actions you took: {action_history} 
You are now at step {current_step} and your current observation is: {current_observation} 
Your admissible actions of the current situation are: {admissible_actions} 
Now it's your turn to take an action. 
You should first reason step-by-step about the current situation with the help of past relevant skills. This reasoning process MUST be enclosed within <think> </think> tags. 
Once you've finished your reasoning, you should choose an admissible action for current step and MUST present it within <action> </action> tags. 
Figure 10 | Prompt for WebShop agent execution with relevant retrieved skills. You are an expert memory analyst. Analyze the quality of the following content of skills memory based on the following criteria: 
1.  ABSTRACTION: The skill captures generalizable procedures or insights, not verbatim copies of the trajectory. Specific IDs, numbers, 
object names from the task have been replaced with variables or general concepts. 
2.  REUSABILITY: The skill is atomic and modular — it describes one coherent capability that could plausibly be triggered by future related 
tasks, rather than bundling unrelated steps. 
3.  ACTIONABILITY: The Markdown body provides concrete guidance (workflow, conditions, when-not-to-use) that an executor can act on, 
rather than vague advice. 
4.  FAITHFULNESS: All claims in the skill are supported by the trajectory; no fabricated facts, tools, or environment behaviors. 
Respond ONLY with a JSON code block in this exact format: 
```json 
{
"VALID": true/false, 
"ISSUES": [list any problems found], 
"EXPLANATION": "brief explanation of the assessment" 
}
Analyze the following skill content: \n {content} 
System Instruction 
Input 
Figure 12 | Prompt for using an external judge to assign a reward score 𝑟 𝑐𝑛𝑡 for generated skill contents. 
A.4. Prompt for LLM-as-a-Judge to Obtain Correctness Signals 
We present the prompts used to obtain the self-judged correctness signal 1𝜉 𝑡 for self-evolution via LLM-as-a-judge using the corresponding frozen agent executor as the backbone model in Figures 13, 14 for ALFWorld, reasoning, and WebShop tasks, respectively. 
B. Implementation Details 
B.1. Hyperparameters 
We present the choices for all hyperparameters during both the training and inference processes in Table 4 for different tasks. 
B.2. Grouping Training Instances 
In this section, we detail the two-stage pipeline used to turn the raw training set D = {𝑥 𝑖 }𝑁 𝑖 =1 into the grouped training set G = {𝐺 𝑗 }𝑀 𝑗 =1 of Section 3.2.1. Stage 1 annotates each instance with a structured set of latent attributes via an LLM annotator (Sec. B.2.1). Stage 2 assembles groups of related tasks by retrieving, filtering, and ranking candidates under a semantic phrase-level similarity (Sec. B.2.2). For 
21 SkillOS : Learning Skill Curation for Self-Evolving Agents You are an expert judge evaluating whether an embodied agent successfully completed a household task in a text-based simulator. Output a 
> single JSON object and nothing else.
> # Task
> You will be given (1) the task description the agent was asked to complete, and (2) the full interaction trace between the agent and the
> simulator. Determine whether the agent fully completed the task.
> ## What "success" means
- The agent's actions must have produced the world state the task description specifies. Every condition stated in the task must hold at the 
> end of the trace.
- If the task implies a transformation must occur before a final placement or interaction, the transformation must be evidenced in the trace 
> before the final step.
- Credit only effects that the simulator's observations confirm. Do not credit effects that the agent merely declared, planned, or assumed. -
> Ignore the agent's own claims of completion; rely solely on the simulator's observation strings.
- A trace that ends with the agent stuck in a loop, exhausting its step budget, or repeatedly emitting invalid actions is a failure regardless of 
> partial progress.
> ## Strictness
- If the trace is ambiguous about whether every required condition is satisfied at the end, output success=false. 
- Partial completion is failure. Either every condition holds or the trace is a failure. 
> # Output
> Output exactly one JSON object with these fields, and nothing else: {{ "success": <true|false>, "rationale": "<one or two sentences citing the
> specific observations that prove success or failure>", "evidence_step": <integer step index where success was confirmed, or -1 if failure> }}
> # Inputs
> ## Task description \n {task_description}
> ## Trajectory
> The trajectory alternates between simulator OBSERVATION and agent ACTION.\n {trajectory}
> System Instruction
> Input
Figure 13 | Prompt for LLM-as-a-judge to obtain the correctness signal to the current trajectory in the ALFWorld benchmark. training of single-turn reasoning tasks, we instantiate the pipeline on DeepMath-103K (He et al., 2026a), which provides both the raw problems 𝑥 𝑖 and a scalar difficulty score 𝑑 𝑖 ∈ ℝ that is reused as a curriculum signal by Stage 2. For multi-turn agentic tasks, we leverage the default task type annotation for each benchmark (e.g., 6 task types in ALFWorld) as they naturally expose a discrete partition of tasks into families that share the same underlying skills, and we can use this partition directly in place of the annotated attribute set 𝑍 𝑖 .
B.2.1. Stage 1: Latent Attribute Annotation 
We implement the attribute set 𝑍 𝑖 of each instance 𝑥 𝑖 as a tuple of five phrase-lists, 
𝑍 𝑖 =  𝑇 𝑖 , 𝑆 𝑖 , 𝐶 𝑖 , 𝑅 𝑖 , 𝑃 𝑖 
,
where 𝑇 𝑖 is the list of high-level topics , 𝑆 𝑖 the required skills or capabilities , 𝐶 𝑖 the underlying mathe-matical concepts or theorems , 𝑅 𝑖 the applicable heuristic strategies , and 𝑃 𝑖 the common pitfalls . Each dimension is populated by a small set of short phrases (at most five words each). The annotator is instructed to: (i) emit standardized terminology rather than free-form rationales, (ii) omit any content specific to the question text or its final answer, and (iii) use as few phrases per dimension as necessary to characterize the task. We enforce the output schema via structured decoding with a fixed JSON response schema, and query Gemini-2.5-Pro with the highest thinking-budget configuration. The exact annotation instruction is reproduced in Figure 16. 
B.2.2. Stage 2: Group Construction 
Given {( 𝑥 𝑖 , 𝑍 𝑖 , 𝑑 𝑖 )} 𝑁 𝑖 =1, we construct each group 𝐺 𝑗 = (𝑥 𝑗, 1, . . . , 𝑥 𝑗,𝑛 ) by sampling a seed task and then iteratively appending related tasks. The core primitive is a pair sampler that, given a source 𝑥 𝑠 , returns an admissible successor 𝑥 𝑡 ; longer groups are obtained by iterating this primitive with a growing exclusion set so that instances within a group remain distinct. 
22 SkillOS : Learning Skill Curation for Self-Evolving Agents You are a rigorous reasoning problem judge. Your task is to determine whether a model's solution to a reasoning problem is correct. 
# Task 
You will be given: 1. A reasoning problem. 2. A candidate solution, which contain long reasoning process. Your job is to judge the correctness 
of the candidate solution. 
## Rules 
- The candidate is correct if its final answer is mathematically equivalent to the correct answer and its reasoning does not rely on invalid steps 
that accidentally lead to the right answer. 
- Minor formatting differences are acceptable. 
- Equivalent mathematical forms are acceptable. 
- If the final answer is correct but the reasoning contains a serious conceptual error that invalidates the derivation, mark it as incorrect unless 
the final answer is independently and clearly justified later. 
- If the problem asks for an exact value, approximation alone is insufficient unless justified by the problem. 
- If the candidate refuses, gives no final answer, or only restates the problem, mark it as incorrect. 
## Protocol 
1. Identify the problem's required output. 
2. Extract the candidate's final answer. 
3. Independently verify whether the candidate's answer satisfies the problem. 
4. Check whether the candidate's reasoning supports the answer. 
5. Ignore unnecessary verbosity, irrelevant exploration, or alternative attempts if the final chosen solution is clear and valid. 
# Output 
Return your judgment in the following JSON format only: 
{"verdict": "correct" or “incorrect", "reason": "A concise explanation of why the solution is correct or incorrect.”} 
# Inputs 
## Problem \n {problem} 
## Solution with reasoning process\n {solution} 
System Instruction 
Input 
Figure 14 | Prompt for LLM-as-a-judge to obtain the correctness signal for single-turn reasoning problems. 
Phrase similarity. Because the annotated phrases come from a large open vocabulary (e.g., “pi-geonhole principle” vs. “counting argument” ), exact set overlap is unreliable. We therefore score the similarity between any two phrase lists 𝐴 and 𝐵 using a soft-Jaccard SJ 𝜏 ( 𝐴, 𝐵 ) that combines exact matches with a greedy one-to-one matching between remaining phrases under a sentence-embedding cosine similarity (computed with all-MiniLM-L6-v2 (Reimers and Gurevych, 2019)) above a thresh-old 𝜏 . We write 𝑚 𝜏 ( 𝐴, 𝐵 ) for the resulting integer matched-pair count , which we use alongside SJ 𝜏 in the filters below. 
Dependency gate. For a source 𝑥 𝑠 and candidate 𝑥 𝑡 , we accept the pair only when all of the following hold: 1. Shared foundation: 𝑚 𝜏 (𝐶 𝑠 , 𝐶 𝑡 ) ≥ 𝜅 𝐶 and 𝑚 𝜏 (𝑆 𝑠 , 𝑆 𝑡 ) ≥ 𝜅 𝑆 ;2. Shared reasoning: 𝑚 𝜏 (𝑅 𝑠 , 𝑅 𝑡 ) + 𝑚 𝜏 (𝑃 𝑠 , 𝑃 𝑡 ) ≥ 1;3. Not a near-duplicate: SJ 𝜏 (𝑇 𝑠 , 𝑇 𝑡 ) ≤ 𝜃 𝑇 and the weighted overall similarity Ω(𝑥 𝑠 , 𝑥 𝑡 ) ≤ 𝜎 max ;4. Not too unrelated: Ω(𝑥 𝑠 , 𝑥 𝑡 ) ≥ 𝜎 min ;5. Progression: 𝑥 𝑡 introduces at least one new concept or skill, i.e. |𝐶 𝑡 | > 𝑚 𝜏 (𝐶 𝑠 , 𝐶 𝑡 ) or |𝑆 𝑡 | > 𝑚 𝜏 (𝑆 𝑠 , 𝑆 𝑡 );6. Curriculum direction: 𝑑 𝑡 − 𝑑 𝑠 ≥ 𝛿 min .Here Ω is a convex combination of per-dimension soft-Jaccard scores across {𝐶, 𝑆, 𝑅, 𝑃, 𝑇 } with weights listed in Table 5. Conditions (1)–(2) ensure genuine reuse of foundational knowledge and reasoning machinery; (3)–(4) place the pair in a useful “related but not redundant” band; (5) guarantees that 
𝑥 𝑡 carries something new for the skill curator to compress into the library; and (6) enforces a forward curriculum. 
23 SkillOS : Learning Skill Curation for Self-Evolving Agents You are an expert judge evaluating whether a shopping agent purchased an item that matches a user's instruction in a web-shopping 
simulator. Output a single JSON object and nothing else. 
You are given (1) the user's shopping instruction and (2) the agent's trajectory. Score how well the agent's purchase satisfies the instruction. 
## How to score 
The instruction encodes a product target, zero or more required attributes of that target, and possibly a price constraint. Decompose your 
evaluation into the following sub-scores, then average them into a single score in [0, 1]: 
1.  **Product type match**: 1 if the purchased product belongs to the category named in the instruction; otherwise 0. 
2.  **Attribute coverage**: the fraction of attributes explicitly named in the instruction that the purchased item (with its chosen options) is 
shown to satisfy. If the instruction names no attributes, score 1. 
3.  **Price constraint**: 1 if the purchase price satisfies the constraint stated in the instruction. If no price constraint is stated, score 1. 
4.  **Purchase completion**: 1 if the trajectory ends with a confirmed purchase action on a concrete product page; 0 otherwise. The final 
`score` is the mean of the four sub-scores. Define `success` as `score >= 0.5`. 
## Strictness 
- Award attribute credit only when the page text or the agent's selected options provide positive evidence; do not infer attributes from the 
absence of contradiction. 
- A purchase made on the wrong product type forces score = 0 regardless of the other sub-scores. 
Output exactly one JSON object and nothing else: {{ "subscores": {{ "product_type": < 0 | 1>, "attribute_coverage": <float in [0,1]>, "price": 
< 0 | 1>, "purchased": < 0 | 1> }}, "score": <float in [0,1], the mean of subscores>, "success": <true|false>, "rationale": "<one or two 
sentences>" }}”"" 
## User instruction {instruction} 
## Trajectory 
The trajectory alternates between OBSERVATION and ACTION. Long observations may be truncated; the final observation is preserved in full 
so you can inspect the purchased item. \n {trajectory} 
System Instruction 
Input 
Figure 15 | Prompt for LLM-as-a-judge to obtain the correctness signal to the current trajectory for the WebShop benchmark. 
Candidate retrieval and scoring. Scoring all 𝑁 −1 alternatives per source is prohibitive, so we precompute an inverted index over the dependency fields {𝐶, 𝑅, 𝑃 }: for each source 𝑥 𝑠 , the candidate pool consists of tasks that share at least one exact dependency phrase with 𝑥 𝑠 , capped at 𝐾 inv entries via uniform subsampling. Routing retrieval through dependency fields rather than topics prevents groups from collapsing onto a single narrow subject. Among the candidates that pass the gate, we select the one that maximizes 
𝑠 (𝑥 𝑠 , 𝑥 𝑡 ) =∑︁ 
𝑓 ∈ { 𝐶,𝑆,𝑅,𝑃,𝑇 }
𝑤 𝑓 SJ 𝜏 ( 𝑓 𝑠 , 𝑓 𝑡 ) + 𝜆 · 𝑏 (𝑑 𝑠 , 𝑑 𝑡 ),
where 𝑏 (·) is a bounded difficulty bonus that rewards moderate forward steps. If no inverted-index candidate passes the gate, we fall back to a uniform random pool of size 𝐹 and re-apply the same gate and scoring; this catches pairs whose phrases agree semantically but not lexically. Extensions sourced from the fallback pool are tagged so downstream training can audit or downweight them. The difficulty gap 𝑑 𝑡 − 𝑑 𝑠 is additionally modulated by a randomized curriculum mode ( 𝑝 ↑, 𝑝 =, 𝑝 ↓); for our main experiments, we use an almost exclusively forward curriculum, which produced a more stable training signal than mixed curricula. 
Hyperparameters. Table 5 lists all hyperparameters of the Stage 2 pipeline and the values adopted for our main experiments. The weights were tuned on a held-out subset of 200 source tasks by manually inspecting sampled pairs for prerequisite quality; we found the pipeline largely insensitive to small perturbations of the weights but noticeably sensitive to the progression and overall-similarity-band conditions, removing either of which produced markedly more trivial or degenerate pairs. 
24 SkillOS : Learning Skill Curation for Self-Evolving Agents 
Table 4 | Hyperparameters for SkillOS for training and inference settings. Hyperparameter Value ALFWorld WebShop Reasoning 
RL Training 
Learning rate 1 × 10 −6
Batch size 32 KL loss Coef 0.001 Max Prompt Length 16,384 Max Response Length 4,096 GRPO group size 8Temperature 1.0 Steps 60 50 100 Data Grouping Size 10 10 Random(5,12) 
Agent Executor Inference 
Top-K skill retrieval 5Max number of turns 30 30 1Action history length 3 3 -
B.3. Experiment Setup 
B.3.1. Datasets 
In this section, we provide a detailed introduction to all the datasets involved in this paper. 
ALFWorld. ALFWorld (Shridhar et al., 2021) is a text-based interactive benchmark that aligns the TextWorld engine with the embodied ALFRED environment, enabling agents to learn high-level household policies through natural-language interaction. The benchmark covers six task types — Pick & Place, Examine in Light, Clean & Place, Heat & Place, Cool & Place, and Pick Two & Place — situated in 120 simulated rooms spanning kitchens, bedrooms, bathrooms, and living rooms. It provides 3, 553 training tasks, together with 140 valid_seen tasks for the test set. At each step, the agent receives a textual description of its surroundings together with a goal instruction (e.g., "put a hot apple in the fridge") and must issue high-level commands such as go to, take, open, heat, and put. 
WebShop WebShop (Yao et al., 2022) is a simulated e-commerce web environment designed to benchmark language agents on realistic, grounded shopping tasks. The environment is populated with 1.18 million real-world products scraped from Amazon and 12,087 crowd-sourced natural-language instructions, partitioned into 10,587 training, 1,000 dev, and 500 test instructions. Given an instruction (e.g., “I’m looking for a quick-release fitness strap band in teal, priced lower than $40.00”), the agent interacts with the environment via two action types — search[query] and click[button] — to locate and purchase a product that matches the specified attributes, type, options, and price. At the end of each episode, a programmatic reward in [0, 1] is computed by comparing the purchased item against the ground-truth product specification. Following the standard evaluation protocol used in prior LLM-agent work, we evaluate on the 500 held-out test instructions. 
DeepMath-103K DeepMath-103K (He et al., 2026a) is a large-scale, decontaminated mathematical reasoning dataset containing approximately 103K problems at high difficulty (primarily AoPS Levels 5–9), spanning algebra, calculus, number theory, geometry, probability, and discrete mathematics. 
> 25
SkillOS : Learning Skill Curation for Self-Evolving Agents ## Problem 
> {question}
> Please reason step by step, using the past relevant skills when helpful, and put your final answer within \\boxed{{}}.
> You are an expert in data annotation and mathematical reasoning.
> Given a mathematical question, generate one or more phrases (less than 5 words) that thoroughly and precisely describe the characteristics
> of the math problem in the following dimensions:
> 1. Topic
> 2. Skills or Capabilities
> 3. Math Concepts or Theorems
> 4. Heuristic Strategy
> 5. Common Pitfalls
> ## Requirements
> - The annotations should be phrases only, avoid lengthy sentences
> - Do NOT include any context or specifics from the question or solution
> - Put your response in JSON format.
> - Use as less phrases as possible for each dimension
> - Use standardized/acknowledged phrases/terminologies only since phrases generated will be used for large-scale data processing
Figure 16 | System instruction used to elicit 𝑍 𝑖 from each task in D.Table 5 | Hyperparameters of the Stage 2 grouping pipeline. 
Symbol Meaning Value — Phrase encoder all-MiniLM-L6-v2 
𝜏 Cosine threshold for fuzzy phrase matching 0.60 
𝜅 𝐶 Minimum matched concept pairs 1
𝜅 𝑆 Minimum matched skill pairs 1
𝜃 𝑇 Maximum topic soft-Jaccard 0.65 
𝜎 min , 𝜎 max Overall-similarity band 0.30 , 0.85 
𝛿 min Difficulty-delta floor 0.0
(𝑤 𝐶 , 𝑤 𝑆 , 𝑤 𝑅 , 𝑤 𝑃 , 𝑤 𝑇 ) Dimension weights (5, 4, 3, 1, 2)
𝜆 Difficulty-bonus weight 1.0
( 𝑝 ↑, 𝑝 =, 𝑝 ↓) Mode probabilities (0.80 , 0.20 , 0.00 )[Δmin , Δmax ] Gap in easy →hard mode [0.5, 3.0]
Δ= Maximum |𝑑 𝑡 − 𝑑 𝑠 | in same mode 0.3
𝐾 inv Inverted-index subsample cap 2,000 
𝐹 Fallback pool size 200 
Each problem is paired with a verifiable final answer — enabling rule-based RL rewards — together with a difficulty score, topic label, and three DeepSeek-R1 (Guo et al., 2025) chain-of-thought solutions. Specifically, we annotate a subset with around 33 , 000 problems, with a final 20 , 000 set of grouped training instances. 
AIME24 & AIME25. A collection of demanding mathematical problems sourced from the 2024 and 2025 American Invitational Mathematics Examination (AIME), with 30 problems each year. Problems encompass algebra, geometry, number theory, and combinatorics. Created to assess large language models’ sophisticated mathematical reasoning abilities, the dataset presents substantial difficulty, systematic multi-phase solutions, and distinctive answers, establishing it as a robust benchmark for evaluating advanced analytical capabilities. 
GPQA. Short for Graduate Level Google-Proof Q &A Benchmark (Rein et al., 2024), GPQA comprises a collection of demanding text-based multiple choice problems authored by subject specialists in biology, physics, and chemistry, intentionally crafted to be “exceptionally challenging”. We use the “GPQA-Diamond” subset for testing, which has 198 problems in total. 
26 SkillOS : Learning Skill Curation for Self-Evolving Agents 
B.3.2. Baselines 
We compare SkillOS against five representative baselines that span memory-free agents, recent memory-augmented methods, and two internal variants of our own framework. All baselines share the same frozen Agent Executor and are evaluated under identical task suites, retrieval budgets, and decoding settings to isolate the contribution of the memory mechanism. 
(i) No Memory. A memory-free baseline in which the Agent Executor solves each task independently, without access to any external memory or cross-task knowledge transfer. Each episode begins from a blank state, and no information is retained across tasks. This baseline establishes a lower bound and isolates the contribution of any form of accumulated experience. 
(ii) ReasoningBank (Ouyang et al., 2026). A recent memory-augmented method that distills reusable reasoning insights from past trajectories and stores them as a searchable bank for future tasks. At inference time, relevant insights are retrieved and injected into the executor’s context to guide reasoning. ReasoningBank represents the class of experience-distillation approaches, which emphasize the content of stored knowledge but rely on fixed, heuristic policies for deciding what to write or discard. 
(iii) MemP (Fang et al., 2025b). A procedural-memory method that induces reusable procedures from agent experience and applies advanced memory-management strategies — including consolidation, forgetting, and re-indexing — to maintain the memory store over time. MemP represents the class of rule-based memory management approaches, which feature more sophisticated maintenance policies than ReasoningBank but still prescribe curation decisions through hand-designed heuristics rather than learning them from downstream task feedback. 
(iv) SkillOS -base. A variant of our framework in which the Skill Curator is instantiated with the same open-source backbone as SkillOS but without any RL fine-tuning, while all other components remain identical to SkillOS . This baseline serves two purposes: (a) it provides a lower-bound reference point that reflects the intrinsic prompting-based curation ability of the open-source backbone prior to optimization, and (b) it isolates the contribution of our GRPO-based training, since SkillOS -base shares exactly the same model architecture, prompting template, and memory interface as 
SkillOS but forgoes end-to-end optimization against task performance. 
(v) SkillOS -gemini. A variant of our framework in which the Skill Curator is instantiated with Gemini-2.5-Pro instead of a trained open-source model, while all other components remain identical to SkillOS . This baseline serves two purposes: (a) it provides a strong closed-source reference point for the upper bound of prompting-based curation, and (b) it isolates the effect of our GRPO-based training, since SkillOS -gemini shares the same prompting template and memory interface as 
SkillOS but forgoes RL optimization against task performance. Together, these baselines cover the main design axes along which memory-augmented agents differ from SkillOS : whether memory exists at all (i), how stored knowledge is represented (ii vs. iii), and whether curation decisions are prescribed by heuristics or learned from task feedback (ii and iii vs. SkillOS ), as well as whether the curator itself benefits from RL optimization (iv and v vs. 
SkillOS ). 
B.3.3. Evaluation Metrics 
We evaluate SkillOS and all baselines along two complementary axes — task effectiveness and 
action efficiency — using metrics tailored to each benchmark. Across all benchmarks and methods, every configuration is run with three independent random seeds; we report the mean across seeds, with one standard deviation shown as a subscript (e.g., 85 .7±1.6). Within each backbone block of 
> 27 SkillOS : Learning Skill Curation for Self-Evolving Agents
Tables 1 and 2, the best value in each column is highlighted in bold .
Success Rate (SR ↑). Our primary effectiveness metric on both ALFWorld and WebShop. On ALFWorld, SR is the fraction of evaluation episodes in which the agent reaches the goal state within the step budget, yielding a binary {0, 1} outcome per episode. We report SR both per task category — 
Pick , Look , Clean , Heat , Cool , and Pick2 — and as a macro-average ( Avg. SR ) across the six categories, so that categories with fewer tasks are not dominated by larger ones. On WebShop, following (Yao et al., 2022), SR is the fraction of episodes whose final reward equals exactly 1, i.e., the purchased product fully matches all specified attributes, options, type, and price constraints. 
WebShop Score ( ↑). In addition to SR, WebShop provides a dense per-episode reward in [0, 100 ]
that credits partial matches on attributes, options, type, and price even when the purchase is not a perfect match. We report the average score across evaluation episodes as a finer-grained complement to SR: two methods with similar SR may differ substantially in how close their near-misses are to the target product. 
Number of Steps (Steps ↓). Our efficiency metric on ALFWorld and WebShop. Steps is the average number of environment actions the agent issues per episode, computed over all evaluation episodes regardless of success. Failed episodes contribute steps up to their termination point (task completion, max-step cutoff, or early stop). This metric captures a dimension that SR and Score alone cannot: two methods may achieve comparable effectiveness while differing substantially in how efficiently they reach the goal, which has direct implications for inference cost and deployment feasibility. 
Accuracy (Acc. ↑) on reasoning benchmarks. For the single-turn reasoning datasets — AIME24, AIME25, and GPQA — we report exact-match accuracy: the fraction of questions whose extracted final answer matches the ground truth. For AIME24 and AIME25, we adopt the evaluation protocol from the HuggingFace math_verify 1 toolkit, which parses the model’s final boxed expression and verifies mathematical equivalence to the reference answer (accounting for equivalent numerical forms, simplifications, and formatting variants). For GPQA, which is a multiple-choice benchmark, we extract the predicted option letter from the model’s response and score it as correct if and only if it exactly matches the ground-truth option. We additionally report an average accuracy ( Avg. Acc. ) across the three datasets to summarize overall reasoning ability. 
Evaluation protocol. All methods share the same frozen Agent Executor, retrieval budget (top-𝑘 
skills retrieved via BM25), maximum step budget, and decoding temperature within each backbone, so that differences in the reported metrics are attributable to the memory mechanism rather than to confounding inference settings. Unless stated otherwise, all numbers in the main paper are computed on the official held-out evaluation splits of each benchmark. 
C. Additional Analyses 
C.1. Results on Gemini-3.1-Flash-Lite 
In addition to the Qwen3-8B/32B and Gemini-2.5-Pro executors used in the main paper, we further evaluate SkillOS on ALFWorld with the more recent Gemini-3.1-Flash-Lite as the frozen Agent 
> 1https://github.com/huggingface/Math-Verify
> 28 SkillOS : Learning Skill Curation for Self-Evolving Agents
Table 6 | Experiment results on ALFWorld benchmark. Success rate (SR ↑) and the number of steps (Steps ↓) are reported on 6 subsets for Gemini-3.1-Flash-Lite as frozen executor. 
Methods Pick Look Clean Heat Cool Pick2 Avg. SR Steps 
(35) (13) (27) (16) (25) (24) (140) No Memory 85 .7 0.0 59 .0 8.9 67 .9 9.3 25 .0 6.2 38 .7 2.3 66 .7 0.0 61 .2 2.3 18.5 ReasoningBank 87 .6 4.4 71 .8 4.4 63 .0 0.0 52.1 14 .4 48 .0 10 .6 62 .5 0.0 66 .0 2.7 17.6 MemP 84 .3 6.1 57 .7 5.4 63 .0 0.0 28 .1 4.4 34 .0 2.8 62 .5 0.0 58 .6 1.0 19.3 
SkillOS -base 86 .7 1.6 61 .5 0.0 66 .7 0.0 41 .7 6.2 38 .7 16 .0 68 .1 2.4 63 .6 3.9 17.7 
SkillOS -gemini 96.2 1.6 61 .5 13 .3 74 .1 3.7 31 .2 12 .5 66 .7 4.6 68 .1 2.4 71 .2 2.9 16.1 
SkillOS 88 .6 0.0 84.6 13 .3 77.8 0.0 37 .5 17 .2 68.0 8.0 68.1 2.4 73.1 2.7 15.5 
Executor, to verify that our gains generalize to newer model families. Results are reported in Table 6. 
SkillOS achieves the highest average success rate (73.1%), outperforming the strongest external baseline ReasoningBank (66.0%) by +7.1 points and the No-Memory baseline (61.2%) by +11.9 points , while requiring the fewest interaction steps (15.5 vs. 18.5 for No Memory). The two internal variants reproduce the ordering observed in the main experiments: SkillOS -base reaches only 63.6% — barely above No Memory — confirming that the open-source backbone cannot recover the curation policy through prompting alone, and SkillOS -gemini improves to 71.2% but is still surpassed by 
SkillOS despite using a much stronger curator backbone. This reinforces our main finding that 
learning the curator with task-level feedback contributes more than scaling up the curator model. We also note that MemP (58.6%) underperforms even No Memory under this executor, suggesting that hand-designed curation heuristics are brittle when the executor is less capable, whereas the policy learned by SkillOS remains robust. Per-subset, SkillOS wins on four of six subsets, with particularly large margins on Look (84.6% vs. 71.8%) and Cool (68.0% vs. 48.0%); the remaining two subsets are won by SkillOS -gemini ( Pick ) and ReasoningBank ( Heat ), on which SkillOS 
nonetheless remains competitive. Overall, these results confirm that the advantage of SkillOS 
transfers cleanly to a newer executor family. 
C.2. Case Studies Curated Skills for Different Tasks. Figure 17 presents two representative skills curated by Skil-lOS that illustrate qualitatively different curation patterns across task types. For agentic tasks (Figure 17(a)), the curator distills a meta-strategy for failure recovery: rather than memorizing a specific object-search trajectory, it abstracts the recovery procedure into a reusable workflow ( exhaus-tive search → confirm unavailability → identify a substitute → proceed with substitute ) and explicitly references existing skills, demonstrating compositional curation. For reasoning tasks (Figure 17(b)), the curator captures branching-out reasoning : a single skill on inradius–circumradius–semiperimeter relations encodes multiple solution paths (relating the target distance to either the in/circumradius or the side lengths), each paired with its formula, application, and prerequisite constraints. Together, these examples show that SkillOS learns to produce skills tailored to the structure of the underlying task: procedural and composable for agentic settings, and multi-path with explicit preconditions for reasoning settings, rather than verbatim trajectory copies. 
How SkillOS Curates Better Skills Compared to Baselines. We further qualitatively compare the skills curated by SkillOS against those produced by the baseline curator. In the math-reasoning case as shown in Figure 18, SkillOS -base outputs only a generic high-level recipe based on partitioning into disjoint sets, without explicit formulas, constraints, or examples. By comparison, SkillOS 
> 29 SkillOS : Learning Skill Curation for Self-Evolving Agents
# Sample  Curated  Skills 
> (b) Skill curated by SkillOS for reasoning tasks (a) Skill curated by SkillOS for agentic tasks
> skill that demonstrate meta strategies of failure recovery
> relate to existing skills, showcasing composition capabilities
> Skill that shows branching-out reasoning behavior
Figure 17 | Case studies of curated skills by SkillOS .curates a much more useful skill that provides a concrete counting framework, including explicit constraint formulation, equation setup, and a worked example tailored to the target sub-problem. These examples show that RL-trained skill curation improves not only the correctness of the curated content, but also its specificity and usability, enabling skills to better capture the underlying structure of tasks. 
How Curated Skills Help to Solve Tasks Successfully. Figure 19 illustrates a representative example of how curated skills improve agent behavior in interactive environments. Given the task “look at the CD under the desklamp,” the memory-free baseline fails to infer the correct object–location relation and performs an inefficient search over irrelevant containers, eventually exhausting the step budget. In contrast, SkillOS retrieves a skill that encourages the agent to examine objects under or around light sources when the instruction refers to an object being “under” a lamp. Guided by this reusable strategy, the agent first locates and picks up the CD near the desk area, then moves to the desklamp and inspects the correct target location, completing the task successfully. This case highlights that curated skills do not merely memorize task-specific action sequences; instead, they provide transferable decision guidance that helps the agent focus exploration on semantically relevant objects and locations, reducing unnecessary interactions and improving task success. 
D. Limitations 
Retrieval Mechanism. Our current implementation relies on a relatively simple keyword-based retrieval mechanism, such as BM25, to retrieve relevant skills from the skill repository. This design choice allows us to isolate the main focus of this work: studying how skills can be curated, updated, and organized through experience-driven learning. However, more advanced retrieval methods, such as dense retrieval, hybrid retrieval, or learned retrievers, may further improve the relevance of retrieved skills and thus lead to stronger downstream performance. We leave the joint optimization of skill curation and skill retrieval to future work.      
> 30 SkillOS : Learning Skill Curation for Self-Evolving Agents Case 2: Speci fi c, concrete and clear workarounds. AIME2025 (math reasoning)
> Skill curated via SkillOS-base Skill curated via SkillOS
> Task: Find the number of ways to fill a 3 ×9 grid with digits 1–9 so each row is a permutation and each 3 ×3 block
> contains 1–9. Express the count as p^a · q^b · r^c · s^d (4 distinct primes) and return p·a + q·b + r·c + s·d.
> SkillOS-base outputs a generic "partition into disjoint sets" recipe with no numbers, no formulas, no example. The
> skill from SkillOS provides a complete theoretical framework AND a fully-worked example.
Figure 18 | Case study on math-reasoning skill curation. SkillOS -base produces a generic partitioning recipe, while SkillOS curates a concrete and reusable counting framework with explicit constraints, equations, and a worked example. 
Simplified Skill Representation. Following Anthropic’s skill paradigm (Anthropic, 2025b), we instantiate each skill as a single Markdown file that combines a YAML frontmatter and Markdown body. This simplification keeps the curator’s action space tractable, but it discards two affordances of the original SKILL.md format: (i) supporting scripts and external resource files that allow skills to encapsulate executable procedures rather than purely declarative knowledge, and (ii) hierarchical organization in which a top-level skill can reference or compose lower-level sub-skills. As a result, behaviors that are most naturally expressed as runnable code or as compositions of finer-grained primitives must currently be flattened into prose. Extending SkillOS to multi-file, hierarchical, and partially executable skills is a natural next step. 
Frozen Agent Executor. Throughout training, we keep the agent executor 𝜋 L frozen and optimize only the skill curator 𝜋 S . This decoupling is deliberate: it isolates the contribution of skill curation, makes the recipe modular across executors, and avoids confounding our analysis with executor-side adaptation. The downside is that the curator can only shape the system’s behavior through what it writes into SkillRepo ; any miscalibration between the curated skills and the executor’s idiosyncrasies must be absorbed by the curator alone. Joint or alternating optimization of 𝜋 S and 𝜋 L
may yield a better-aligned pair, at the cost of executor specificity and substantially higher training cost. 
> 31 SkillOS : Learning Skill Curation for Self-Evolving Agents
# Case  Study         
> Task: Look at the CD under the desklamp.
> baseline (no memory)
> SkillOS
> Start in the middle
> of the room Use desklamp1 (15+ wasted
> moves: searching) Go to drawer3
> …… ……
> Inef fi cient search for CD, run out of 30 steps
> Start in the middle
> of the room Take CD1 Use desklamp1 Task Success!
> Driven by retrieved skill “examine object under light source”
Figure 19 | Case studies of how skills curated by SkillOS successfully helped to solve a task in ALFWorld. 
E. Future Research Directions 
Our work opens several promising directions for future research. 
Agentic Search over Experiential Memory. SkillOS currently retrieves relevant skills from 
SkillRepo through a fixed top-𝑘 BM25 lookup, treating retrieval as a static, one-shot operation. As the skill repository grows across thousands of tasks and domains, the bottleneck of self-evolving agents shifts from what to store to how to reliably retrieve and inject the right fragments at each decision step. A natural next step is to replace static retrieval with agentic search : letting the Skill Curator (or a dedicated retrieval agent) actively issue multiple queries, reformulate them based on intermediate evidence, and iteratively decide which skills to surface, cite, or compose for the executor. This reframes memory access as a first-class decision in the agent’s policy rather than a preprocessing step, and opens the door to scaling SkillOS to memory stores orders of magnitude larger than those considered here. 
Hierarchical and Compositional Skills. Our current skills are flat Markdown entries, each describ-ing a single reusable pattern. Real agent competence, however, is hierarchical: high-level procedures invoke lower-level sub-skills, which in turn depend on primitive operations. Extending SkillRepo to support hierarchical decomposition — where the curator learns not only to insert, update, and delete skills but also to link, compose, and abstract them — could enable the agent to build increasingly expressive procedural libraries over time. This direction connects naturally to program-synthesis and library-learning literature, and would allow SkillOS to scale to longer-horizon tasks where single-skill retrieval is insufficient. 
Multi-Agent and Shared Memory. SkillOS treats memory as a single agent’s private artifact. In many realistic deployments, however, multiple agents operate in parallel (e.g., code review, multi-hop 
> 32 SkillOS : Learning Skill Curation for Self-Evolving Agents
research, collaborative robotics) and could benefit from shared experiential memory . Open questions include how to arbitrate conflicting curation decisions from different agents, how to attribute credit when a shared skill contributes to one agent’s success but another’s failure, and how to preserve specialization while enabling cross-agent transfer. Our GRPO-based curator provides a natural starting point, but extending it to the multi-agent credit-assignment setting is non-trivial and likely to require new algorithmic ideas. 
F. Use of LLMs 
We used LLMs as a general-purpose writing assist tool during the preparation of this submission. Specifically, LLMs were employed for polishing the clarity and readability of text (e.g., refining sentence structure, improving grammar, and shortening overly verbose phrasing). All research ideas, methodology design, experiments, analyses, and final writing decisions were conceived, implemented, and validated solely by the authors.