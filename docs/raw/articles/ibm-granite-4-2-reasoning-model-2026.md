---
title: "Granite 4.2 LLMs: How They're Built — IBM 首个稠密推理 LLM 家族"
created: 2026-08-27
updated: 2026-08-27
type: raw
tags: [llm, reasoning, ibm, granite, open-source, rl]
source: newsletter
source_url: "https://huggingface.co/blog/ibm-granite/granite-4-2"
ingested: 2026-08-27
source_published: 2026-08-25
sha256: ab0e566aa1c058ebaf6de9f3ba8e1e2c2495779029e6ce0e3705207fcaab66db
---

# Granite 4.2 LLMs: How They're Built

IBM Granite Team 技术走查：Granite 4.2 推理模型家族如何构建。

A technical walkthrough of how we built the Granite 4.2 reasoning model family.
Authors:
Granite Team, IBM
TL;DR:
Granite 4.2 is our first family of dense, decoder-only reasoning LLMs, released in three sizes:
3B, 8B, and 30B
. Each model is pre-trained from scratch on roughly 15T tokens with a five-phase strategy that extends the context window to 512K tokens, supervised fine-tuned on chain-of-thought, reasoning, and agentic-trajectory data, then post-trained with a
multi-stage reinforcement learning pipeline
. That pipeline includes agentic RL, where the 8B and 30B models learn to act with tools inside real sandboxed environments. Every model has a
thinking / non-thinking
switch, a
low-effort
thinking mode that spends a short reasoning budget on easy questions, and native tool calling. All Granite 4.2 models are released under the Apache 2.0 license.
Links:
Granite 4.2 HF Collection
GitHub Repository
Granite Docs
Overview
Granite 4.2 is the reasoning-focused release of the Granite language-model family. Earlier Granite releases were strong instruction-following assistants; Granite 4.2 adds explicit reasoning. Every model can produce a chain of thought before its answer and can run in
thinking
or
non-thinking
mode depending on how much deliberation a task needs. A
low-effort
mode falls between the two, spending a short reasoning budget on easy questions.
The three sizes (
3B, 8B, and 30B
) share the same architectural design and follow the same training pipeline (pre-training from scratch, SFT, then multi-stage RL), each at its own scale. All three are strong reasoners and instruction followers. The clearest capability split shows up in post-training. The
8B and 30B
models additionally go through an
agentic RL
block that teaches them to operate as agents: calling tools, editing and running code, driving a terminal, and searching the web inside real environments. Every model supports native tool calling. Served through an OpenAI-compatible endpoint (for example, with vLLM), it emits tool calls in the OpenAI function-calling format and plugs into agentic harnesses without extra glue. Granite 4.2 is also supported in SGLang, see the
SGLang cookbook
for a ready-to-serve recipe.
The rest of this post walks through the build: architecture, pre-training, supervised fine-tuning, the multi-stage RL pipeline, and results.
Model Architecture
Granite 4.2 models are built on a decoder-only dense transformer architecture with the following core components:
Attention:
Grouped Query Attention (GQA) with 40 attention heads and 8 KV heads
Position Embedding:
Rotary Position Embedding (RoPE) with θ = 10,000,000
Feed-Forward:
MLP with SwiGLU activation
Normalization:
RMSNorm (ε = 1e-5)
Embeddings:
Separate input/output embeddings (not tied)
Precision:
bfloat16
Component
3B Dense
8B Dense
30B Dense
Embedding size
2560
4096
4096
Number of layers
40
40
64
Attention head size
64
128
128
Number of attention heads
40
32
32
Number of KV heads
8
8
8
MLP hidden size
8192
12800
32768
MLP activation
SwiGLU
SwiGLU
SwiGLU
Sequence length
131072
131072
131072
Position embedding
RoPE
RoPE
RoPE
# Parameters
3B
8B
30B
Pre-Training
Granite 4.2 is trained from scratch on approximately
15 trillion tokens
using a five-phase training strategy. Phases 1–2 focus on foundational pre-training, phases 3–4 perform mid-training with progressively higher-quality data annealing, and phase 5 introduces long-context training, extending the context window to
512K tokens
. Each phase uses a distinct data mixture and learning-rate schedule, gradually shifting from broad web-scale data toward more curated, high-quality sources.
The pre-training recipe closely follows the previous generation; for a detailed treatment of the data blend, phase schedule, and long-context extension, see the
Granite 4.1 blog
.
SFT: Data Preparation & Quality Control
Supervised fine-tuning (SFT) turns the base model into a reliable instruction-following, reasoning, and tool-using assistant. The SFT data mixture combines agentic (31.6%) and non-agentic (68.4%) data, totaling approximately 7.2 million samples, or roughly 100B tokens, of which about 65B are trainable.
The
agentic corpus
covers a broad range of domains, including software engineering (SWE, 69%), tool calling (12.1%), terminal use (8.0%), math (3.5%), search (0.8%), and action (0.2%). These samples and trajectories are generated using a diverse set of agent scaffolds and harnesses, including OpenHands, OpenCode, Terminus-2, SWE-agent, OpenResearcher, MiniSWE, OpenSeeker, EnvScaler, Gemini CLI, Hermes, Codex, and Goose. The agentic data combines samples from both open-source datasets and our own synthetically generated RL environments, spanning a variety of agent–harness combinations.
The
non-agentic corpus
consists of several major categories: instruction following (18.8%), coding (18.8%), math (14.6%), multilingual (7.0%), science (5.4%), reasoning (3.0%), and safety (0.8%).
Data Quality Control
We apply multiple stages of quality control before a sample enters the final SFT mixture. First, data from different sources is normalized and reformatted into a consistent OpenAI Chat format, making the conversation structure and tool interactions uniform across datasets and scaffolds.
We then use GPT-OSS-120B and Gemma 4 as LLM-based judges to assess sample quality. Low-scoring samples are removed, as are samples containing hallucinated or fabricated information, invalid tool interactions, or tool calls to functions that are not defined in the corresponding tool list. Several targeted, dataset-specific heuristic rules are also applied where appropriate to further improve quality and remove known sources of noise.
Finally, we perform both local and global deduplication. Deduplication is based on SHA-256 hashes computed over the combination of the
tools
and
messages
fields, removing duplicate samples both within individual data sources and across the overall SFT mixture.
SFT Training Details
The complete corpus is first globally shuffled to reduce ordering effects and ensure that samples from different domains are well mixed during training. The shuffled corpus is then partitioned into equally sized
.parquet
shards, which are tokenized using the model's tokenizer and chat template and prepared for large-scale distributed training.
Before launching the final large-scale runs, we tune hyperparameters on representative configurations, sweeping learning-rate schedules, initial learning rates, and warm-up ratios to find settings that train stably across model sizes. The final training configuration is summarized below:
Parameter
Value
Compute
32–128 nodes (by model size), 4× Grace/GB200 per node
Sequence length (packed)
131,072 (128K)
Global batch size
128
Learning rate
1.0e-5, constant after warm-up; 3.0e-6 for Phase 2
LR warm-up
2.5% of
train_iters
Training duration
~2 epochs
Parallelism
TP=2, PP=1, CP=4 or CP=2
Phase 2 SFT for the 30B Model
For the 30B model, we additionally perform a second phase of SFT focused specifically on agentic coding. In this phase, agentic, SWE, and coding data are upsampled to increase their effective contribution to the training distribution, while approximately 16% of the mixture is retained as replay data from the original SFT corpus.
The 30B model is then fine-tuned for roughly one additional epoch at a lower learning rate of 3.0e-6. This targeted second phase increases the model's exposure to agentic coding trajectories without discarding the capabilities acquired during the initial SFT phase.
Reinforcement Learning: A Multi-Stage, Multi-Environment Pipeline
After SFT, we apply a
multi-stage, multi-environment reinforcement learning pipeline
. Rather than a single RL pass, we run a
chain
of focused stages spanning many environments: math, code, science, instruction following, tool use, and structured output, then software engineering, terminal use, and web search. Each stage is an independent RL run that targets one capability and warm-starts from the previous stage's checkpoint.
Figure 1. The staged RL curriculum. Foundational RL (verifiable rewards + skill boosters) runs for all sizes; the agentic RL block (SWE → Terminal → Search) runs for 8B and 30B only. Every model finishes with RLHF. Each stage is a separate GRPO run that warm-starts from the previous checkpoint.
Training Methodology
Every stage trains with
asynchronous GRPO
(
Group Relative Policy Optimization
), so the generator and trainer halves of the loop never block on each other. A pool of generation workers keeps sampling responses and dropping the finished trajectories into a shared buffer; once the buffer holds a full step's worth, the trainer pulls that batch, takes an optimizer step, and streams the updated parameters back to the generator workers without pausing them. A refresh can land partway through a rollout, leaving a single trajectory stitched together from two adjacent policy versions. We allow this instead of paying to prevent it: the workers reuse their existing KV cache rather than rebuilding it after each refresh, and the one guardrail is a limit that keeps them from drifting more than a single update behind the trainer, which bounds how off-policy any sample can get. Whatever mismatch survives that limit is handled in the objective by
truncated importance sampling
, which clamps the train-versus-generation log-probability ratio to a fixed ceiling so a handful of stale tokens cannot dominate an update.
Advantages are group-relative with a
leave-one-out baseline
: each response is judged against the mean reward of the
other
samples drawn for the same prompt, which removes the need for a separate value network. To make this concrete, take
RLVR
, the first and longest-running stage: each step pairs
256 prompts
with
16 sampled responses apiece
for a
4,096
-example batch, which the trainer consumes in a single optimizer step before the next rollout begins. Later stages keep this machinery unchanged and adjust only the per-stage shape, shown next.
RL training configuration
The pipeline keeps a common backbone of hyperparameters across every stage, which makes the curriculum easier to run and compare. A handful of knobs are fixed everywhere:
Parameter
Value (shared across stages)
Algorithm
GRPO (no value network; group-relative advantages)
Training stack
NeMo-RL (Megatron-Core + vLLM) with NeMo-Gym environments
Ratio clip (min / max)
0.2 / 0.28
Micro-batch size
1
Parallelism
tensor-parallel 2–4; no pipeline- or context-parallelism
What changes from stage to stage is the
shape
of each run: how many prompts and generations per step, how long the context is, whether the agent loop runs, and how hard we pull back toward the reference policy. The table below gives the exact settings for the
30B
chain, stage by stage:
Stage
Prompts/step
Gens/prompt
Max seq len
Rollout turns
KL
LR
RLVR (×3)
256
16
64K
1
0
5e-7
IF booster
256
16
64K
1
0
5e-7
Code booster
64
16
64K
1
0.05
5e-7
SWE 1
64
16
128K
1
0.01
5e-7
SWE 2
32
16
128K
128
0
5e-7
Terminal
8
32
64K
64
0.01
1e-6
Search
32
16
128K
64
0.01
5e-7
RLHF
128
16
48K
1
0.05
5e-7
Parameters shown for the 30B model. Global batch size = prompts/step × generations/prompt (e.g. 256 × 16 = 4096 for RLVR). The 3B and 8B models use the same recipe and hyperparameters with
fewer stages
(see
How the Three Sizes Differ
); the stage list is what changes, not the knobs.
The
KL schedule
follows the reward type: explore freely where the reward is objective and verifiable (RLVR and SWE 2 run at KL 0), and stay close to the reference where the objective is preference, safety, or a narrow skill graft (RLHF and the code booster use KL 0.05). The
rollout-turns
column counts the environment interactions
GRPO itself
sees per rollout. In every case the model is trained on complete, real-environment trajectories.
The Staged Curriculum
Each stage is a separate RL run with a single objective and its own reward signal. When it finishes, its policy is exported to Hugging Face format and becomes the base model for the next stage, so the pipeline is a sequence of warm-starts:
SFT ─▶ RLVR ─▶ Skill boosters ─▶ SWE agent ─▶ Terminal ─▶ Search ─▶ RLHF
└──────── foundational RL ────────┘   └──────── agentic RL (8B / 30B) ────────┘
The
8B and 30B
models follow the full ladder. The
3B
model takes a shortened path: foundational RL and alignment, without the agentic block.
Reward Signals
A stage is defined mostly by
how it is rewarded
. Across the pipeline there are three reward types, and a single stage can use more than one:
Reward type
What it measures
Used in
Verifiable
Exact-match, unit tests, format checkers, rule-based checkers on ground truth
RLVR · boosters · SWE
Reward model / LLM judge
Open-ended quality, preference, safety, answer correctness
RLVR · Search · RLHF
Agentic outcome
Did the model actually solve a task in a real environment?
SWE · Terminal · Search
Verifiable rewards are objective and hard to game, so the pipeline front-loads them. Judge- and preference-based rewards handle open-ended qualities that no checker can express. Agentic-outcome rewards are the sparsest: often a single bit at the end of a long tool-use trajectory.
Foundational RL: Build the Skills
RLVR: verifiable-reward RL
RLVR is the foundational stage and the broadest data mix in the pipeline: a single blended dataset spanning many verifiable domains.
Math:
chain-of-thought with boxed-answer checking, plus formal proving in
Lean
Competitive coding:
solutions checked against hidden tests in a sandbox
STEM / graduate-level science MCQA
and general knowledge
Instruction following:
structured-output and inverse-instruction tasks
Tool / function calling:
single-step tool use
Reasoning puzzles
and
abstention
(knowing when to refuse)
Each task type carries its own verifier, so the reward is grounded per example. RLVR runs for
two rounds on 3B and 8B, and three on 30B
. Each round is a fresh warm-started run on a re-weighted mix of public and internally curated RL data.
Skill boosters: targeted lifts
After RLVR, a few short
booster
stages sharpen specific capabilities that benefit from concentrated training focusing on the following domains:
Instruction following (IF):
multi-turn chat, inverse-IFEval, structured outputs
Code:
competitive coding only
Boosters are small, focused runs. A light KL penalty keeps the model close to its current behavior while nudging one skill.
Agentic RL: Learning to Act (8B / 30B)
In the agentic stages the model learns to
act
: call tools, observe results, and iterate inside a real environment, rewarded on whether the task was actually solved. These stages share the same shape: multi-turn tool use, real (not simulated) environments, sparse outcome rewards, and GRPO, warm-started from the coding-boosted checkpoint. They run in order:
SWE → Terminal → Search
.
Figure 2. The three agentic-RL environments. Each pairs a real harness with a real environment and a sparse, outcome-based reward. The 3B model runs none of these.
SWE agent (software engineering).
Each task is a real repository in its own sandbox. Driven by the
OpenHands
harness, the model reads code, edits files, and runs the test suite over many internal turns. The reward is verifiable: do the hidden tests pass? Tasks are drawn from open-source SWE datasets, each instance backed by a per-repo container image.
Terminal agent (terminal / OS operation).
Multi-step tasks in a live shell, run through the Harbor /
Terminus-2
agent harness. The model plans a sequence of commands, observes their output, and recovers from errors. Reward is assigned when the task completed successfully. This is the one stage that drives its multi-turn agent loop at the GRPO level, with rollouts spanning up to 64 environment turns.
Search agent (deep research).
The model answers hard, multi-hop questions using live web-search tool calls inside a browsing agent loop: gather evidence across hops, reason over it, and produce an answer. Because correctness here is open-ended, the reward is an LLM judge on the final answer.
Alignment: RLHF
The final stage of every model is
RLHF for human preference and safety.
It optimizes against a generative reward model (GenRM) for preference, plus a safety reward covering jailbreak resistance and appropriate refusals. This stage uses the highest KL penalty in the pipeline, aligning tone and safety without eroding the capabilities the earlier stages built. In addition to human preference and safety alignment, this stage also applies a reasoning-length penalty to discourage overly verbose reasoning behavior acquired during earlier stages.
How the Three Sizes Differ
Same method and infrastructure; the difference is how far up the ladder each model goes.
Stage
3B
8B
30B
RLVR
(verifiable)
×2
×2
×3
Skill boosters
code
IF · GPQA · code
IF · code
SWE agent
—
✓
✓
Terminal agent
—
✓
✓
Search agent
—
✓
✓
RLHF
(preference + safety)
✓
✓
✓
3B is a strong foundational-RL model; 8B and 30B add the agentic-RL block on top, learning to act with tools in real environments.
Agentic AI Infrastructure for Scalable RL
Reinforcement learning at this scale needs infrastructure that can drive a training loop and a fleet of live environments at the same time. This matters most in the agentic stages, where every training example is a multi-turn rollout that edits code, runs commands, or browses the web. Granite 4.2's RL runs on two open components:
NeMo-RL
on the training side and
NeMo-Gym
on the rollout side.
Figure 3. The RL system. NeMo-RL drives the GRPO loop (Megatron-Core training backend, vLLM generation, and Megatron-Bridge for HF⇄Megatron weight conversion). NeMo-Gym orchestrates rollouts and hosts the tools, sandboxes, and reward/verifier calls as pluggable
Resources
.
The division of labor:
NeMo-RL (training side).
Megatron-Core
is the training backend;
vLLM
generates rollouts;
Megatron-Bridge
converts weights between Megatron and Hugging Face formats, so each stage can export a clean HF checkpoint for the next one.
NeMo-Gym (rollout side).
It exposes each environment as a set of
Resources
(verifiers, tools, sandboxes, and reward models) behind a uniform interface. This is the plug point for the agentic stages: the SWE repo sandboxes, the terminal harness, and the web-search tools all attach here, and to the training loop they look the same as a simple math verifier.
That uniformity is what makes the staged curriculum above practical: a booster's rule-based checker and a full SWE sandbox present the same interface to GRPO.
This split is also what makes the
asynchronous
training loop described above physically possible: generation and policy updates live on separate GPU pools, so the expensive generation fleet — including the live agentic environments — stays busy instead of idling through optimizer steps.
Results
Granite 4.2 was evaluated across agentic coding, general agentic and tool use, reasoning, chat and instruction following, and long context. The full benchmark table is below, followed by charts that break out the headline results by model size.
Task
3B Dense
8B Dense
30B Dense
Agentic (Coding)
SWE Bench Multilingual
NA
30.78
41.89
SWE Bench Pro
NA
19.11
33.29
SWE Bench Verified
NA
47.67
57.00
Terminal-Bench 2.1
NA
20.56
29.24
Agentic (General)
τ³-bench
45.78
58.06
62.00
BFCL (v4)
52.41
50.29
61.39
ProfBench
32.10
41.20
42.90
BirdBench
NA
41.07
41.85
GDPval
NA
1189.00
1225.00
Reasoning
AIME25
78.33
86.67
89.17
HMMT Feb25
66.67
78.33
89.17
GPQA
54.80
64.14
66.41
LiveCodeBench v6
69.71
73.24
75.77
SciCode
24.11
36.09
38.76
Chat & Instruction Following
MMLU-Pro
67.84
74.04
77.60
MMLU-ProX lite (IBM)
27.78
61.06
66.64
Arena-Hard-V2
34.96
65.19
67.93
IFBench (prompt)
74.33
79.33
77.17
Long Context
RULER 64K
67.52
80.99
89.96
RULER 128K
55.30
71.41
81.38
Supported languages:
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, and Chinese.
The charts below break these results out by capability area.
Figure 4. Reasoning (pass@1). Scores rise consistently with model size across math (AIME25, HMMT), science (GPQA), and code reasoning (LiveCodeBench, SciCode).
Figure 5. Agentic coding resolve rates. The agentic-RL block is trained only for 8B and 30B; the 30B model leads across SWE-Bench variants and Terminal-Bench.
Figure 6. General agentic and tool-use benchmarks, reported for all three sizes.
Quantization
We also released four quantized variants of the Granite 4.2 models for inference with vLLM. The models are converted to FP8, NVFP4, and MXFP4 using LLM Compressor, and to the GGUF format using the llama.cpp framework for reduced-memory deployment.
FP8
The FP8 version is quantized with dynamic per-channel weights and per-token activations.  No calibration is used.
FP4
The NVFP4 and MXFP4 versions are quantized using GPTQ calibrated on 2K samples drawn from the SFT dataset.  Max context length is 2K during calibration.
GGUF
Conversion of the Granite 4.2 models to GGUF is done with the canonical llama.cpp tool as described in
https://github.com/IBM/gguf#gguf-conversion--quantization
.
Several GGUF formats are provided:
Q8_0
Q6_K
Q5_K_S
Q5_K_M
Q5_1
Q5_0
Q4_K_S
Q4_K_M
Q4_1
Q4_0
Q3_K_S
Q3_K_M
Q3_K_L
Q2_K
Infrastructure
Hardware
We trained the Granite 4.2 language models on an NVIDIA GB200 NVL72 cluster hosted by CoreWeave, featuring:
A 72-GPU NVLink domain for high-speed intra-rack communication
A non-blocking Fat-Tree NDR 400 Gb/s InfiniBand fabric for full-bandwidth inter-rack connectivity
Thousands of GPUs operating at cluster scale
This infrastructure delivers the high-bandwidth, low-latency communication required for efficient large-scale distributed training.
Software Stack
The training software stack is packaged into
.sqsh
container images, each giving a run a reproducible, portable environment with its SBSA-compatible CUDA targets, Linux aarch64 Python wheels, and GPU-specific binaries pinned. The large-scale SFT runs build on an NGC PyTorch base image (Ubuntu 22.04, CUDA 12.8, Python 3.12); the RL stack runs in its own NeMo-RL container.
Getting Started (Transformers)
Installation
pip install torch
pip install accelerate transformers
Basic Inference (Thinking Mode)
import
torch
from
transformers
import
AutoModelForCausalLM, AutoTokenizer
model_path =
"ibm-granite/granite-4.2-3b"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=
"cuda"
, torch_dtype=torch.bfloat16)
model.
eval
()
messages = [
{
"role"
:
"user"
,
"content"
:
"How many r's are in the word 'strawberry'?"
},
]
text = tokenizer.apply_chat_template(messages, tokenize=
False
, add_generation_prompt=
True
, enable_thinking=
True
)
inputs = tokenizer(text, return_tensors=
"pt"
).to(model.device)
with
torch.no_grad():
output = model.generate(**inputs, max_new_tokens=
8192
, temperature=
1.0
, top_p=
0.95
, do_sample=
True
)
print
(tokenizer.decode(output[
0
][inputs.input_ids.shape[-
1
]:], skip_special_tokens=
False
))
Example Output
<think>
Okay, let's see. The problem is to find how many 'r's are in the word 'strawberry'.
First, I need to write out the word: s t r a w b e r r y.
Now, I need to count the number of 'r' letters. Let's list each letter and check for 'r'.
1. s – not r
2. t – not r
3. r – yes, that's one
4. a – no
5. w – no
6. b – no
7. e – no
8. r – yes, that's two
9. r – yes, that's three
10. y – no
Total r's = 3.
</think>
There are **3** r's in the word "strawberry".<|im_end|>
Non-Thinking Mode
messages = [
{
"role"
:
"user"
,
"content"
:
"What is the capital of France?"
},
]
text = tokenizer.apply_chat_template(messages, tokenize=
False
, add_generation_prompt=
True
, enable_thinking=
False
)
inputs = tokenizer(text, return_tensors=
"pt"
).to(model.device)
output = model.generate(**inputs, max_new_tokens=
2048
, temperature=
1.0
, top_p=
0.95
, do_sample=
True
)
print
(tokenizer.decode(output[
0
][inputs.input_ids.shape[-
1
]:], skip_special_tokens=
False
))
Example Output
<think></think>The capital of France is Paris.<|im_end|>
Low-Effort Thinking
messages = [
{
"role"
:
"user"
,
"content"
:
"What is 2 + 2?"
},
]
text = tokenizer.apply_chat_template(messages, tokenize=
False
, add_generation_prompt=
True
,
enable_thinking=
True
, low_effort=
True
)
inputs = tokenizer(text, return_tensors=
"pt"
).to(model.device)
output = model.generate(**inputs, max_new_tokens=
4096
, temperature=
1.0
, top_p=
0.95
, do_sample=
True
)
print
(tokenizer.decode(output[
0
][inputs.input_ids.shape[-
1
]:], skip_special_tokens=
False
))
Example Output
<think>
Simple answer.
</think>
2 + 2 = 4.<|im_end|>
Tool Calling
Granite models support tool calling with integrated reasoning: the model reasons about which tool to call and why before calling it. Tools are defined with the
OpenAI function definition schema
.
Basic Tool Calling
tools = [
{
"type"
:
"function"
,
"function"
: {
"name"
:
"get_current_weather"
,
"description"
:
"Get the current weather for a specified city."
,
"parameters"
: {
"type"
:
"object"
,
"properties"
: {
"city"
: {
"type"
:
"string"
,
"description"
:
"Name of the city"
}
},
"required"
: [
"city"
]
}
}
}
]
messages = [
{
"role"
:
"user"
,
"content"
:
"What's the weather like in Boston right now?"
},
]
text = tokenizer.apply_chat_template(messages, tokenize=
False
, tools=tools,
add_generation_prompt=
True
, enable_thinking=
True
)
inputs = tokenizer(text, return_tensors=
"pt"
).to(model.device)
output = model.generate(**inputs, max_new_tokens=
4096
, temperature=
1.0
, top_p=
0.95
, do_sample=
True
)
print
(tokenizer.decode(output[
0
][inputs.input_ids.shape[-
1
]:], skip_special_tokens=
False
))
Example Output
<think>
Okay, the user is asking for the weather in Boston right now. Let me check the tools
available. There's a function called get_current_weather that takes a city parameter.
I need to call that with the city set to Boston.
</think>
<tool_call>
<function=get_current_weather>
<parameter=city>
Boston
</parameter>
</function>
</tool_call>
<|im_end|>
Multi-Turn with Tool Response
messages = [
{
"role"
:
"user"
,
"content"
:
"What's the weather like in Boston right now?"
},
{
"role"
:
"assistant"
,
"content"
:
"<think>\nThe user wants to know the current weather in Boston. I should call get_current_weather.\n</think>"
,
"tool_calls"
: [{
"function"
: {
"name"
:
"get_current_weather"
,
"arguments"
: {
"city"
:
"Boston"
}}}]},
{
"role"
:
"tool"
,
"content"
:
'{"temperature": "72°F", "condition": "Partly cloudy", "humidity": "65%"}'
},
]
text = tokenizer.apply_chat_template(messages, tokenize=
False
, tools=tools,
add_generation_prompt=
True
, enable_thinking=
True
)
inputs = tokenizer(text, return_tensors=
"pt"
).to(model.device)
output = model.generate(**inputs, max_new_tokens=
4096
, temperature=
1.0
, top_p=
0.95
, do_sample=
True
)
print
(tokenizer.decode(output[
0
][inputs.input_ids.shape[-
1
]:], skip_special_tokens=
False
))
Example Output
<think>
The tool returned the weather data for Boston: temperature 72°F, partly cloudy, humidity 65%.
I need to present this information clearly to the user.
</think>
The current weather in Boston is 72°F, partly cloudy, with 65% humidity.<|im_end|>
Multi-Turn Conversations
History Thinking Truncation
messages = [
{
"role"
:
"user"
,
"content"
:
"What is 15 * 37?"
},
{
"role"
:
"assistant"
,
"content"
:
"<think>\nLet me calculate 15 * 37.\n15 * 37 = 15 * 30 + 15 * 7 = 450 + 105 = 555\n</think>\n15 * 37 = 555"
},
{
"role"
:
"user"
,
"content"
:
"Now divide that by 5"
},
]
# Default: previous thinking is stripped to save context
text = tokenizer.apply_chat_template(messages, tokenize=
False
, add_generation_prompt=
True
,
enable_thinking=
True
, truncate_history_thinking=
True
)
# To preserve full history:
text_full = tokenizer.apply_chat_template(messages, tokenize=
False
, add_generation_prompt=
True
,
enable_thinking=
True
, truncate_history_thinking=
False
)
Parsing Thinking vs. Final Answer
import
re
def
parse_model_output
(
text
):
"""Separate thinking content from final answer."""
think_match = re.search(
r'<think>(.*?)</think>'
, text, re.DOTALL)
if
think_match:
thinking = think_match.group(
1
).strip()
answer_start = text.find(
'</think>'
) +
len
(
'</think>'
)
answer_end = text.find(
'<|im_end|>'
, answer_start)
answer = text[answer_start:answer_end].strip()
if
answer_end != -
1
else
text[answer_start:].strip()
else
:
thinking, answer =
""
, text.strip()
return
thinking, answer
thinking, answer = parse_model_output(output_text)
Using with Agentic Coding Harnesses
Granite models can serve as the backbone for agentic coding tools. Because they support reasoning and tool calling through the OpenAI-compatible API, they integrate with popular agentic harnesses without extra adapters. Start the vLLM server, then follow the harness-specific instructions below.
OpenCode
OpenCode
is an AI coding agent that runs in your terminal.
Install:
curl -fsSL https://opencode.ai/install | bash
Configure
~/.config/opencode/opencode.json
:
{
"$schema"
:
"https://opencode.ai/config.json"
,
"model"
:
"local/granite-4.2-30b"
,
"provider"
:
{
"local"
:
{
"npm"
:
"@ai-sdk/openai-compatible"
,
"name"
:
"vLLM (local)"
,
"options"
:
{
"baseURL"
:
"http://localhost:8000/v1"
,
"apiKey"
:
"EMPTY"
}
,
"models"
:
{
"granite-4.2-30b"
:
{
"name"
:
"Granite 4.2 30B"
,
"limit"
:
{
"context"
:
131072
,
"output"
:
8192
}
}
}
}
}
}
Run:
opencode
opencode run
"your task description"
For full documentation, see
opencode.ai/docs
.
Pi
Pi
is a minimal agent harness for AI-powered coding that runs in your terminal. It supports custom providers via a
models.json
configuration file.
Install:
curl -fsSL https://pi.dev/install.sh | sh
Configure
~/.pi/agent/models.json
:
{
"providers"
:
{
"vllm"
:
{
"baseUrl"
:
"http://localhost:8000/v1"
,
"api"
:
"openai-completions"
,
"apiKey"
:
"EMPTY"
,
"compat"
:
{
"supportsDeveloperRole"
:
false
,
"supportsReasoningEffort"
:
false
}
,
"models"
:
[
{
"id"
:
"granite-4.2-30b"
,
"name"
:
"Granite 4.2 30B"
,
"reasoning"
:
true
,
"input"
:
[
"text"
]
,
"contextWindow"
:
131072
,
"maxTokens"
:
8192
,
"samplingParams"
:
{
"temperature"
:
1.0
,
"top_p"
:
0.95
}
,
"cost"
:
{
"input"
:
0
,
"output"
:
0
,
"cacheRead"
:
0
,
"cacheWrite"
:
0
}
}
]
}
}
}
Run:
pi
Then select the
granite-4.2-30b
model with
/model
or
Ctrl+L
in the interactive session.
For full documentation, see
pi.dev/docs
.
OpenHands
OpenHands
is an AI software engineer that can plan, write code, and execute commands.
Install and launch OpenHands
following the
official installation guide
.
Configure the LLM
in the OpenHands settings with:
Model:
granite-4.2-30b
Base URL:
http://localhost:8000/v1
API Key:
your vLLM
--api-key
value
Note:
The
openai/
prefix is required when connecting to OpenAI-compatible endpoints like vLLM. Refer to the
OpenHands local LLM documentation
for detailed setup instructions, troubleshooting, and alternative installation methods.
Resources:
Granite 4.2 HF Collection
GitHub: ibm-granite/granite-4.2-language-models
Granite Documentation
Granite Community Resources
Code Alchemy
Collections mentioned in this article
1
More from this author
Extremely Fast and Accurate Transcription with Granite Speech 5.0 Turbo CTC
23
August 25, 2026
Granite Embedding Multilingual R2: Open Apache 2.0 Multilingual Embeddings with 32K Context — Best Sub-100M Retrieval Quality
33
May 14, 2026
Community
Edit
Preview
Upload images, audio, and videos by dragging in the text input, pasting, or
clicking here
.
Tap or paste here to upload images
Comment
·
Sign up
or
log in
to comment
Upvote
53
+41
Collections mentioned in this article
1
