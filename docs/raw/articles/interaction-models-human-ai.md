---
source: newsletter
source_url: https://thinkingmachines.ai/blog/interaction-models
title: "Interaction Models: A Scalable Approach to Human-AI Collaboration"
author: ""
date: 
review_value: 8
review_confidence: 8
review_recommendation: strong
ingested: 2026-05-13
sha256: e4f1853a6184d8df5287ee2686de182631a7a484b52456d627859baec562c806
---
Today, we’re announcing a research preview of interaction models: models that handle interaction natively rather than through external scaffolding. We think interactivity should scale alongside intelligence; the way we work with AI should not be treated as an afterthought. Interaction models let people collaborate with AI the way we naturally collaborate with each other—they continuously take in audio, video, and text, and think, respond, and act in real time.
We train an interaction model from scratch. To ensure real-time responsiveness, we adopt a multi-stream, micro-turn design. Our research preview demonstrates qualitatively new interaction capabilities, as well as state-of-the-art combined performance in intelligence and responsiveness.
The collaboration bottleneck#
AI labs often treat the ability for AI to work autonomously as the model’s most important capability.Kwa, T., West, B., Becker, J., et al. Measuring AI Ability to Complete Long Tasks. METR, 2025. As a result, today’s models and interfaces aren’t optimized for humans to remain in the loop.A recent frontier model card states: “Importantly, we find that when used in an interactive, synchronous, “hands-on-keyboard” pattern, the benefits of the model were less clear. When used in this fashion, some users perceived [our model] as too slow and did not realize as much value. Autonomous, long-running agent harnesses better elicited the model’s coding capabilities.”
Autonomous interfaces are valuable, but in most real work, users can’t fully specify their requirements upfront and walk away—good results benefit from a collaborative process where the human stays in the loop, clarifying and giving feedback along the way. However, humans increasingly get pushed out not because the work doesn’t need them, but because the interface has no room for them. Instead, people are most effective when they can collaborate with AI the same way we do with other people: messaging, talking, listening, seeing, showing, and interjecting as needed—and for the model to do the same.Communication gets better with: (a) Copresence: people can interact with what others are interacting with; (b) Contemporality: people receive information as it’s produced by others with instant feedback; (c) Simultaneity: people receive and produce information at the same time. Clark H. and Brennan S., “Grounding in Communication,” in Perspectives on Socially Shared Cognition, 1991., The evanescence of orality for its participatory (cf. objectively distanced) nature. Today’s computers and mediums of knowledge work have similar interactive properties. Ong, W. J.. In _Orality and Literacy: The technologizing of the word_, 1982.
In order to resolve this, we need to move beyond the current turn-based interface for the models. Today’s models experience reality in a single thread.We are referring to commercial general-purpose frontier models—there are smaller-scale or specialized models like Moshi, PersonaPlex, Nemotron VoiceChat, or GPT-Realtime-Translate. Until the user finishes typing or speaking, the model waits with no perception of what the user is doing or how the user is doing it. Until the model finishes generating, its perception freezes, receiving no new information until it finishes or is interrupted. This creates a narrow channel for human-AI collaboration that limits how much of a person’s knowledge,“Metis, with the premium it places on practical knowledge, experience, and stochastic reasoning…is the mode of reasoning most appropriate to complex material and social tasks where the uncertainties are so daunting that we must trust our (experienced) intuition and feel our way.” Scott, J. C: Métis. In _Seeing like a State: How certain schemes to improve the human condition have failed_, 1998., “A little reflection will show that there is…a body of very important but unorganized knowledge…: the knowledge of the particular circumstances of time and place.” Hayek, F. A. “The use of knowledge in society.” _The American Economic Review_, 1945. intent, and judgement can reach the model, and how much of the model’s work can be understood. Picture trying to resolve a crucial disagreement over email rather than in person.
At Thinking Machines, we believe we can solve this bandwidth bottleneck by making AI interactive in real time across any modality. This enables AI interfaces to meet humans where they are, rather than forcing humans to contort themselves to AI interfaces.
Most existing AI models bolt on interactivity with a harness: stitching components together to emulate interruptions, multimodality, or concurrency.Most real-time commercials speech systems use voice-activity-detection components to detect turn boundaries. However, “the bitter lesson”Sutton R. The Bitter Lesson, 2019. suggests that these hand-crafted systems will be outpaced by the advance of general capabilities. For interactivity to scale with intelligence, it must be part of the model itself. With this approach, scaling a model makes it smarter _and_ a better collaborator.
Capabilities#
Having interactivity be part of the model unlocks a variety of capabilities that would otherwise need to be implemented in the harness.
   Seamless dialog management. The model tracks implicitly whether the speaker is thinking, yielding, self-correcting, or inviting a response. There is no separate dialog management component.
   Verbal and visual interjections. The model jumps in as needed depending on the context, not only when the user finishes speaking.
   Simultaneous speech. The user and the model can speak concurrently (e.g. live translation)
   Time-awareness. The model has a direct sense of elapsed time.
   Simultaneous tools calls, search, and generative UI. While speaking and listening to the user, the model can concurrently search, browse the web, or generate UI—weaving back results into the conversation as needed.
In a longer real session, all of this happens continuously, creating an experience that feels more like collaborating and less like prompting.
None of the brands or products appearing in these videos are associated with Thinking Machines Labs. These videos are to demonstrate the model's capabilities and do not indicate sponsorship or partnership.
Our approach#
Time-aligned micro-turn based
Interaction is grounded in time with continuous input and output streams split into micro-turns
Turn-based models see an alternating token sequence. Time-aware interaction models see a continuous stream of micro-turns, so silence, overlap, and interruption remain part of the model's context.
An interaction model is in constant two-way exchange with the user—perceiving and responding at the same time. Some domains take such interactivity as a given—the physical world demands that robotics and autonomous vehicles operate in real time. Audio full-duplex models Moshi, PersonaPlex, nemotron-voicechat, Seeduplex. are another example where interaction is bidirectional and continuous.
Applying the same principle, we set out to build an interaction model native to this regime—one that perceives and responds in the same continuous loop, across audio, video, and text. The result is a system architected around two ideas: a time-aware interaction model that maintains real-time presence, and an asynchronous background model that handles sustained reasoning, tool use, and longer-horizon work.
System overview#
The interaction model is in constant exchange with the user. When a task requires deeper reasoning than can be produced instantaneously, the interaction model delegates to a background model that runs asynchronously.This approach builds upon prior work like Qwen-omni, KAME, MoshiRAG. The interaction model remains present throughout — answering follow-ups, taking new input, holding the thread — and integrates background results into the conversation as they arrive.
real-time
user
interaction
model
background
model
context
response
tool calls
browsing
etc
The user continuously interacts with the interaction model, while the background model performs asynchronous tasks. Both systems share their context.
This split lets the user benefit from both responsiveness as well as the full extent of intelligence: the planning, tool-use, and agentic workflows of reasoning models at the response latency of non-thinking ones. Note that both the background and interaction models are intelligent — on its own, the interaction model is also competitive on both interactive and intelligence benchmarks.
The interaction model#
Our starting point is continuous audio and video — modalities that are inherently real-time. Text can wait, but a live conversation cannot. By designing around the hardest case first, we arrive at an architecture that is natively multimodal, time-aware, and capable of handling concurrent input and output streams across all modalities. Several design choices make this possible.
Time-aligned micro-turns. The interaction model works with micro-turns continuously interleaving the processing of 200ms worth of input and generation of 200ms worth of output. Rather than consuming a complete user-turn and generating a complete response, both input and output tokens are treated as streams. Working with 200ms chunks of these streams enables near real-time concurrency of multiple input and output modalities.
Human perception
input 0 input 1 input 2 input 3 input 4
output 0 output 1 output 2 output 3
Model token sequence
Human perception preserves concurrent input and output streams, while the model receives a single interleaved token sequence.
With this design, there are no artificial turn boundaries that the model must adhere to. In contrast, most existing real-time systems require a harness that predicts turn boundaries in order for the turn-based models to feel real-time and responsive.Moshi, PersonaPlex, and Nemotron Voicechat are examples of full duplex systems that do not use harnesses to detect turns. They are smaller scale models focused on latency rather than intelligence benchmarks. This harness is made out of components like voice-activity-detection (VAD) that are meaningfully less intelligent than the model itself. This precludes a variety of interaction modes like proactive interjections (“interrupt when I say something wrong”) or reactions to visual cues (“tell me when I’ve written a bug in my code”). Moreover, the model can do things like speak while listening (“translate from spanish to english live”) or watching (“live-commentate this sports game”).
Thus, all of these different interaction modes that require special harnesses today become special-cases of what the model can do and improve in quality as we scale up model size and training data.
Encoder-free early fusion. Rather than processing audio and video through large, standalone encoders, we opt for a system with minimal pre-processing. Many omnimodal models require training a separate encoder (e.g. Whisper-like) or decoder (e.g. TTS model-like). We instead take in audio signals as dMel (Bai, et al. 2024) and transform it via a light-weighted embedding layer. Images are split into 40x40 patches which are encoded by an hMLP (Touvron et al. 2022). For the audio decoder we use a flow head (Lipman at al. 2022). All components are co-trained from scratch together with the transformer.
An illustration of the interaction model architecture for a single 200ms micro-turn. The model takes in any subset of text, audio, or video and predicts text and audio.
Inference optimization. At inference time, 200ms chunks require frequent prefills and decodes of small sizes, each having to meet strict latency constraints. Unfortunately, existing LLM inference libraries are not optimized for frequent small prefills—they often have a significant amount of overhead per turn. To address this, we implemented streaming sessions. The client sends each 200ms chunk as a separate request, while the inference server appends these chunks into a persistent sequence in GPU memory. This avoids frequent memory reallocations and metadata computations, and we’ve upstreamed a version of this feature to SGLang. In addition, we also optimized our kernels for latency as well as the shapes we see for bidirectional serving. For example, we use a gather+gemv strategy for MoE kernels instead of the standard grouped gemm, as in prior work from PyTorch and Cursor.
Trainer-sampler alignment. We’ve found bitwise trainer-sampler alignment to be useful for training stability as well as debugging the various components of our system. We implement batch-invariant kernels with minimal (<5%) e2e performance overhead.Funnily enough, for some period of time using the batch-invariant kernels was actually faster e2e, due to the custom communication kernels which were not only batch-invariant but also much lower latency. To highlight two particular kernels:
   All-reduce and reduce-scatter: We use NVLS to implement low-latency comm kernels which are deterministic on Blackwell, and achieve bitwise alignment between somewhat different parallelism strategies (i.e. Sequence Parallelism and Tensor Parallelism).
   Attention: The primary challenge with attention is Split-KV, which can typically lead to inconsistent accumulation orders between decode and prefill.Work done in collaboration with Colfax However, we can maintain consistent accumulation order by choosing to split consistently between decode and prefill. For example, we could split SMs to process 4096 tokens at a time (left-aligned), achieving good efficiency in both prefill and decode.
Coordination between interaction and background models. When the interaction model delegates, it sends a rich context package — not a standalone query, but the full conversation. Results stream back as the background model produces them, and the interaction model interleaves these updates into the conversation at a moment appropriate to what the user is currently doing, rather than as an abrupt context switch.
Safety. Because real-time interaction stresses safety differently than turn-based exchanges, our safety work focused on two axes: modality-appropriate refusals and long-horizon robustness. To make refusals colloquial in speech, we use a text-to-speech model to generate refusal and over-refusal training data covering a range of disallowed topics, with the refusal boundary calibrated to favor naturally-phrased, but no less firm, refusals. To improve robustness across extended speech-to-speech conversations, we used an automated red-teaming harness to generate multi-turn refusal data, while maintaining close behavioral parity with the model’s text-based refusals.
Benchmarks#
Intelligence and interactivity frontier#
We show that our interaction model, named `TML-Interaction-Small`, is the first model that has both strong intelligence/instruction following and interactivity. To measure interaction quality we use FD-bench which is one of the few existing benchmarks intended to measure interactivity. In FD-bench v1.5, the model is given prerecorded audio, and must respond at certain times. This benchmark measures model behavior across several scenarios: user interruption, user backchannel, talking to others, and background speech. Our model scores well in all of these areas. To quantify intelligence we use Audio MultiChallenge, a common benchmark that tracks intelligence and instruction following.
TML-interaction-small GPT-realtime-2.0 (minimal)GPT-realtime-2.0 (xhigh)GPT-realtime-1.5 Gemini-3.1-flash-live-preview (minimal)Gemini-3.1-flash-live-preview (high)
 Intelligence and Interactivity Frontier. Our model dominates interaction quality while being more intelligent than any non thinking model. We achieve the best responsiveness measured as a latency between user and model turns.
For more intelligence, safety, and interactivity/latency results please see the table below. We report our performance on both streaming and turn-based benchmarks.
| Instant | Thinking |
| --- | --- |
| TML-interaction -small | GPT-realtime-2.0 (minimal) | GPT-realtime-1.5 | Gemini-3.1-flash-live (minimal) | Qwen 3.5 OMNI-plus-realtime | GPT-realtime-2.0 (xhigh) | Gemini-3.1-flash-live (high) |
| Streaming | FD-bench V1 Turn-taking latency (s) · Audio | 0.40 | 1.18 | 0.59 | 0.57 | 2.14 | 1.63 | 0.94 |
| FD-bench V1.5 Average · Audio | 77.8 | 46.8 | 48.3 | 54.3 | 39.0 | 47.8 | 45.5 |
| FD-bench V3 Response Quality (%) / Pass@1 (%) · Audio + Tools | 82.8 / 68.0 | 80.0 / 52.0 | 77.9 / 55.0 | 68.5 / 48.0 | 60.0 / 50.0 | 81.0 / 58.0 | 71.4 / 48.0 |
| QIVDAccuracy (%) · Video + Audio | 54.0 | 57.5 | 41.2 | 54.7 | 59.0 | 58.2 | 56.1 |
| Turn-based | Audio MultiChallenge APR (%) · Audio | 43.4 | 37.6 | 34.7 | 26.8 | - | 48.5 | 36.1 |
| BigBench Audio Accuracy (%) · Audio | 75.7 / 96.5 | 71.8 | 81.4 | 71.3 | 73.0 | 96.6  | 96.6 |
| IFEval (VoiceBench)Accuracy (%) · Audio | 82.1 | 81.7 | 68.1 | 67.6 | 80.3 | 83.2 | 82.8 |
| IFEval Accuracy (%) · Text | 89.7 | 89.6 | 87.5 | 85.8 | 83.4 | 95.2 | 90.0 |
| Harmbench Refusal rate (%) · Text | 99.0 | 99.5 | 100.0 | 99.0 | 99.5 | 100.0 | 98.0 |
Best per row  Best among instant models
 For benchmarks that require reasoning or tool calls we report our results with background agent enabled.
  We evaluate Qualcomm IVD in a streaming setting – is a video-audio QA benchmark. In each video clip, somebody performs an action and speaks a question. We evaluate in a streaming setting, sending the raw clip from the beginning and grading the model’s transcript. Following Qwen 3.5 Omni we use a GPT-4o-mini grader.
  Audio MultiChallenge metrics for all the baseline models are reported by Scale AI, where Qwen 3.5 OMNI-plus-realtime is not listed.
  Bigbench Audio metrics for all the baseline models are reported by Artificial Analysis, where GPT-realtime-2.0 thinking is on high.
New dimensions of interactivity#
The existing interactivity-oriented benchmarks above do not adequately capture the qualitative jumps in interaction capabilities we notice. To that end, we have some early work aimed at quantifying these capabilities.
Time awareness and simultaneous speech. Turn-based models with a dialog management system do not support accurate time estimation or simultaneous speech. Examples include: “How long did it take me to run one mile?”, “Correct my mispronunciations as you hear them” or “How long did it take me to write this function?"
We created two internal benchmarks to measure these proactive audio capabilities:
   TimeSpeak: Tests whether the model can initiate speech at user-specified times while producing the correct content. For example: “I want to practice my breathing, remind me to breathe in and out every 4 seconds until I ask you to stop.”
   CueSpeak: Tests whether the model speaks at the appropriate moment with the expected semantically correct response. Dataset entries are created to ensure that the model needs to speak at the same time as the user to get a full score. For example: “Everytime I codeswitch and use another language, give me the correct word in the original language.”
For both benchmarks, each example has a single expected semantic response and timing window. We grade with an LLM judge: A response is counted as correct only if it conveys the expected meaning and is delivered at the appropriate time; failing either criterion receives no credit. We report macro-averaged accuracy across examples.
Visual proactivity. Today’s commercial real-time APIs perform turn-detection via audio-only dialogue management harnesses. They respond to spoken turns, but they cannot proactively choose to speak when the visual world changes.Though we are not aware of any commercial APIs that support speech-out visual proactivity, several academic papers have built related research prototypes. StreamBridge, Streamo, StreamingVLM, and MMDuet2 study when to output text in a streaming video input setting. Being text out, they do not study additional constraints of speech-output interaction: speech has duration, can overlap with the user, and must be coordinated with turntaking, interruptions, and backchanneling. Closest to ours is AURA, which adds an ASR/TTS demo around a VideoLLM that decides when to emit text or be silent; in contrast ours is speech-native and full-duplex. For instance, if asked “Please count how many pushups I do” such a system might respond “Sure thing!” and then remain silent – waiting for an audio-only cue that never comes.
We adapted three benchmarks to evaluate visual proactivity of our model:
   RepCount-A contains videos of repeated actions and is adapted into an online counting task. We stream the video following an audio instruction “Please count out reps for {action}.”. We extract the last number said by the model after the ground truth penultimate rep, and grade by whether it was within one rep of the ground truth. This task measures continuous visual tracking and timely counting.
   ProactiveVideoQA consists of videos with questions, whose answers become available at specific moments. We stream the question in audio and then the video.Specifically we TTS the following: “Watch the video and stay quiet until a new moment answers the question. When one happens, say a concise answer. {question}”, then stream two seconds of silence so the model acknowledges the instruction. We burn subtitles into the video (if present) and mute the input video to emphasize testing visual proactivity. We report the paper’s turn-weighted PAUC@ω=0.5 metric (scaled 0-100), averaged across turns and categories. Staying silent scores 25.0.; Higher scores require correct answers at the correct times and incorrect answers are penalized.
   Charades is a standard temporal action-localization benchmark. Each video contains an action occurring over a labeled time interval. We stream a user audio instruction: “Say ‘start’ when the person starts doing {action} then say ‘Stop’ when they stop.”; then we stream the video. The model is graded by temporal IoU between predicted and the reference intervals.
Time awareness
TimeSpeak · macro-acc
Verbal cues trigger
CueSpeak · macro-acc
Visual-based counting
RepCount-A · off-by-one
Visual cues trigger
ProactiveVideoQA · PAUC@ω=0.5
Visual cues trigger
Charades · mIoU
 No-response baseline on ProactiveVideoQA is 25.0
No existing model can meaningfully perform any of these tasks. For the sake of completeness, we report the results of GPT Realtime-2 (minimal), but all models evaluated perform similar or worse on these tasks, including thinking high models. They stay silent or give incorrect answers.
Examples from our internal audio and video benchmark.
Future evals. We believe that interactivity is an important area for future research and we invite the community to contribute benchmarks here. We are launching a research grant to encourage more research into the field of interaction models and human-AI collaboration, including but not limited to new frameworks for assessing interactivity quality, with details coming soon.
Limitations and future work#
Long sessions. Continuous audio and video accumulate context quickly. The streaming-session design handles short and medium interactions well, but very long sessions still require careful context management—an active area of work.
Compute and deployment. Streaming audio and video at low latency requires reliable connectivity. Without a good connection, the experience degrades significantly. We believe that this can be improved significantly in the future both by improving system reliability as well as training our model to be more robust to delayed frames.
Alignment and safety. A realtime interface opens up an exciting area of research for both alignment and safety. We are collecting feedback and reviewing research grants.
Scaling model size. The current `TML-Interaction-Small` is a 276B parameter MoE with 12B active. While we expect the interactivity to improve with model scale, our larger pretrained models are currently too slow to serve in this setting. We plan to release larger models later this year.
Improved background agents. Although we have primarily focused on real-time interactivity in this post, agentic intelligence is also an essential capability. In addition to pushing agentic intelligence to the frontier, we believe we have just scratched the surface in how the background agents can work together with the interaction model.
Tell us what you think, join us#
In the coming months, we will open a limited research preview to collect feedback, with a wider release later this year.
We’d love for you to join us. Please share your thoughts at interaction@thinkingmachines.ai.
Citation#
Please cite this work as:
```
Thinking Machines Lab, "Interaction Models: A Scalable Approach to Human-AI Collaboration",
Thinking Machines Lab: Connectionism, May 2026.
```
Or use the BibTeX citation:
```
@article{thinkingmachines2026interactionmodels,
  author = {Thinking Machines Lab},
  title = {Interaction Models: A Scalable Approach to Human-AI Collaboration},
  journal = {Thinking Machines Lab: Connectionism},
  year = {2026},
  month = {May},
  note = {https://thinkingmachines.ai/blog/interaction-models/},
  doi = {10.64434/tml.20260511},
}
```