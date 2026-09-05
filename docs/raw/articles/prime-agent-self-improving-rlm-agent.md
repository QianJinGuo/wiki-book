---
source: newsletter
source_url: "https://www.primeintellect.ai/blog/prime-agent"
source_published: 2026-08-05
ingested: 2026-08-06
sha256: db216a88d44a14afd7abc618e6e7096ee3d78c9525c1a174f59009fd10435534
---

# Prime Agent: A self-improving RLM agent

# blog-prime-agent

Prime Agent: A self-improving RLM agent
Login
Start training
Prime Agent: A self-improving RLM agent
Seth Karten
Alex L. Zhang
Kevin Thomas
Sebastian Müller
Prime Intellect Team
AUG 05TH, 2026
•
Research
Prime Agent: A self-improving RLM agent
Today, we are launching
Prime Agent
, our self-improving coding harness designed around two abstractions, the
Recursive Language Model (RLM)
[
citation
] and
Continual Harness
[
citation
]. Modern harness designs were built around the capabilities of earlier generations of models, and they do not reflect what frontier models can do today: fixed tool-calling schemas and context compaction force the model to work around its own scaffolding instead of leveraging it. Static, hand-engineered sub-agents, prompts, skills, and memory are set once at design time and never adapt to what the agent learns while running. We believe that harnesses should instead extrapolate on current model capabilities toward the next frontier of reasoning patterns.
Prime Agent is built around this principle through two main abstractions:
The Recursive Language Model (RLM)
treats context as a variable and subagent delegation as function calls inside a REPL. The persistent REPL gives the model programmatic access to its history, sub-agents, and tools, allowing it to write language model programs as actions over its own context. This design allows the agent to process arbitrarily long sessions without losing access to its own past information stored in variables.
Continual Harness
treats the harness&#x27;s own state, abstracted as its prompts, skills, memory, and sub-agents, as something the agent can create, read, update, and delete (CRUD) from its own trajectory. When combined with agent-to-agent communication, this mechanism enables orchestration across sub-agents and even across Prime Agent sessions. For example, Prime Agent can spawn persistent sub-agents, message them later in the trajectory, and communicate directly with a different Prime Agent session.
These abstractions are powerful for bootstrapping model capabilities. Prime Agent is built to be effective as a general coding assistant, as a default runtime for long-horizon autonomous evaluation, and as a collaborator for research and autoresearch.
Prime Agent is fully
open-source
, and can be installed via:
curl
-fsSL
https://app.primeintellect.ai/prime-agent/install.sh
|
sh
Prime Agent
The performance of agent harnesses are tied to both the design of the harness and the capability of the model trained around the harness. We designed Prime Agent to be immediately usable with modern open and closed frontier models, while also providing a feature set that we expect to provide further performance gains as newer generations of models are trained around it.
At its core, Prime Agent is designed around programmatic tool and sub-agent calling. Models in Prime Agent use a persistent IPython kernel as their only tool. Other standard harness features are called as functions in the kernel, including sub-agents, which are each implemented as another
prime-agent
instance.
Prime Agent&#x27;s Architecture
RLM and Continual Harness are the two core abstractions; sub-agent CRUD plus Agent2Agent messaging compose them into orchestration.
Background Daemon and Agents View.
The default view is a text-user interface (TUI) similar to other coding agent harnesses. By default, IPython actions made by the agent are condensed for brevity, but can be expanded to view actions made by the harness. Sub-agents launched in the REPL can also be accessed below the user chatbox.
Prime Agent runs a background daemon that owns all live agent sessions over a local socket. You can attach and detach from the session without affecting the underlying agent loop. Each root session tree runs in a recoverable worker process; if a worker crashes, the daemon recovers it from the session JSONL and kernel state snapshot.
The
Agents View
allows you to see and select other live sessions from the daemon. It can be opened by pressing the Left Arrow key (←) on an empty prompt, and lists sessions that are currently running, idle sessions with the daemon still active, and inactive sessions that are currently not loaded in memory. Any of these chats can immediately be entered and interacted with, and pressing space allows users to chat with a session in any state, including steering and queuing of prompts and commands such as
/compact
.
The Agents View is constructed as the central connecting point between agents and subagents, recursively. Any agent is discoverable in an Agents View. Users navigate from an Agents View into an agent&#x27;s chat, then into the Agents View of its subagents, into a subagent chat, and so on.
Because subagents share the same
Running-Idle-Inactive
state machine as the root agents, they can be removed from memory after 30 minutes of inactivity, and the moment a user or agent addresses any of them, they are reloaded from disk. In highly nested chats, this can save a lot of memory.
Session and Context Management.
The entire session history of the agent is stored as append-only JSONL files on disk. Each line is a JSON entry, which can include messages, model switches, compaction summaries, or extension entries. Branching, forking, and cloning all happen within the same file by moving the leaf pointer. The full history is always recoverable through
/tree
.
Compaction happens when the context hits a threshold or directly by the agent in the REPL with
compact.run()
. Compaction is primarily used to clean the main context of the agent, but the full history, including past compactions, can be accessed programmatically in the IPython kernel when needed.
The introduction of the REPL requires additional work to manage the IPython state. We asynchronously compact and clean the kernel simultaneously, using a spawned agent to act as a garbage collector. This is necessary to avoid REPL memory built up for each agent.
RLM and Programmatic Tool-Calling (PTC)
Prime Agent relies on the IPython kernel as its REPL that persists over the session, which it can invoke every turn. On initialization, the kernel pre-imports each skill / tool as a module, including the
rlm
for recursive programmatic sub-agent calling.
The
rlm
is an asynchronous function, meaning the model can freely invoke and parallelize sub-agent calls in code. Spawning a subagent (e.g.
await rlm("sub-task")
) launches a full session with its own model, IPython kernel, session tree, and conversation history. It returns immediately, because all subsequent communication between agents happens through the
agent_message.send(...)
tool.
There are several useful primitives that Prime Agent can choose to launch in this way, such as fanning out sub-agents in parallel, or launching background work.
# Parallel fan-out — rlm() returns at task admission with a child handle,
# never the child&#x27;s answer; results arrive as agent_message replies.
auth
=
await
rlm
(
"Summarize the authentication flow in auth/. Reply to me when done."
,
name
=
"auth-expert"
)
api
=
await
rlm
(
"Summarize the updated HTTP API layer in src/. Reply to me when done."
,
name
=
"http-expert"
)
# ... continue independent work; each child replies via
# agent_message.send(..., receiver_role="parent") when finished ...
# Steer or extend a child mid-flight by role + name
await
agent_message
.
send
(
"Also cover middleware error handling."
,
receiver_role
=
"child"
,
receiver_name
=
api
.
name
,
)
As models continue to improve, new invocation patterns over tool calls and sub-agents will emerge. We expect future generations of models to rely less on hand-holding prompts and more on this kind of direct, programmatic control.
Orchestration and Multi-Agent Communication
The background daemon manages all live Prime Agent sessions. Prime Agent also enables Agent-to-Agent (A2A) messaging through the daemon, letting any Prime Agent session message any other Prime Agent session using the same mechanism used for messaging persistent sub-agents. This allows for easy orchestration to manage the progress of sub-agent swarms and communication regarding shared resources directly between the affected agents. To prevent undesirable communication across independent sessions, multi-agent communication in Prime Agent is limited to its
nuclear family
, meaning parent, sibling, or child processes.
# Spawn a named child; the handle returns at admission.
handle
=
await
rlm
(
"Find what&#x27;s wrong in this auth-flow. Reply to me with your findings."
,
name
=
"auth-reviewer"
)
# ... the child&#x27;s findings arrive as a parent-role reply, not a return value ...
# Later (survives compaction and kernel restarts): recover the retained child.
children
=
await
rlm
.
list_subagents
(
)
auth_child
=
next
(
c
for
c
in
children
if
c
.
session_name
==
"auth-reviewer"
)
# Send a follow-up turn into the same retained child session.
await
agent_message
.
send
(
"Follow up: identify the main edge cases and any likely bugs."
,
receiver_role
=
"child"
,
receiver_name
=
auth_child
.
session_name
,
mode
=
"follow_up"
,
)
Prime Agent supports
persistent sub-agents
through its RLM-native runtime, meaning a sub-agent&#x27;s own session directory, context, IPython kernel, and session history persist even after the initial sub-agent call has finished. Prime Agent can send further messages to continue a persistent sub-agent by accessing its unique session identifier, all from its IPython kernel.
Self-Improvement via the Continual Harness
Prime Agent&#x27;s harness state lives in the persistent IPython kernel as
rlm.harness
, immediately readable and callable by the agent mid-task, and every change is also written to disk, so it survives across turns and across sessions. Continual Harness formalizes this state as
H
=
(
ρ
,
G
,
K
,
M
)
H=(\rho, G, K, M)
H
=
(
ρ
,
G
,
K
,
M
)
, prompt, sub-agents, skills, and memory, refined online from the agent&#x27;s own trajectory without resets.
Each of the four components exposes the same create, read, update, delete surface.
create_prompt_note(...)
,
create_memory(...)
,
create_skill(...)
, and
create_subagent(...)
each add an entry of that kind,
update_X(...)
and
delete_X(...)
mirror them, and
list(kind)
or
get(kind, id)
read them back. Skills follow this same surface: authoring a Python-backed skill is a
create_skill(...)
call carrying a
SKILL.md
-style reference, the same operation as adding a memory or a prompt note.
# Create a memory and a skill through the same CRUD surface
rlm
.
harness
.
create_memory
(
"flaky test pattern"
,
"retry three times before failing"
)
rlm
.
harness
.
create_skill
(
"retry helper"
,
"..."
,
reference
=
{
"type"
:
"python"
,
"import"
:
"retry_helper"
}
)
# Read them back
rlm
.
harness
.
list
(
"memory"
)
rlm
.
harness
.
get
(
"skill"
,
"retry_helper"
)
/refine
is the self-improving pipeline built on top of this CRUD surface. It reads the agent&#x27;s own trajectory, the record of what was tried and what happened, and applies the smallest relevant CRUD edit that improves the harness toward better outcomes: updating a prompt note, memory, skill, or sub-agent spec, rather than rewriting the whole harness. Each refinement records its trigger and the outcome it produced, so improvement is evidence-backed rather than arbitrary. Refinement runs in two phases. Planning, the LLM call that proposes the edit, runs in the background and does not block the ongoing conversation. Applying the edit, writing to disk and rebuilding the system prompt, is fast and only briefly blocks at the next turn boundary. The agent can call
refine.run()
directly whenever it notices a repeated failure or a reusable tactic, not only on a fixed schedule.
# Schedule a refinement focused on a specific observation
await
refine
.
run
(
"promote the retry-on-flaky-test pattern to a skill"
)
# Both status calls follow the same shape, though refine&#x27;s plan/apply split
# means "in_flight" can mean either background planning or the fast apply step
await
compact
.
status
(
)
# tokens, context_window, percent, scheduled
await
refine
.
status
(
)
# pending, in_flight
The base system prompt remains immutable.
/refine
only edits the harness layer around it. Rollback is supported through prior refinement history, allowing a bad harness update to be reverted by ID.
Autonomous Mode for Evals
Prime Agent&#x27;s eval mode combines three complementary mechanisms. A goal sets the overall objective: a persistent objective with an optional token budget that the harness keeps re-prompting the agent to pursue across turns, tracked until the agent explicitly calls
goal.complete()
. Heartbeats are scheduled cron-style messages injected into the session on a fixed interval, used for regular checks such as monitoring a sub-agent&#x27;s progress or polling for a training update. Autonomous mode is the continuation mechanism itself, ensuring the agent keeps working toward the goal instead of stopping early once a turn produces no further output. Together, these let a session run unattended for extended periods while remaining bounded by an explicit budget and inspectable through the Agents View.
Autonomous mode is available directly from the CLI with
--autonomous
, no scripting required. A run can set a completion goal and a turn limit in the same command:
prime-agent
\
--autonomous
\
--autonomous-gate
"npm run check"
\
--autonomous-max-turns
20
\
"Implement and verify the requested change"
The gate command runs before the session is allowed to finish. A failed gate returns its bounded output to the agent for another attempt, and Prime Agent skips rerunning a failed gate when the workspace has not changed since the last attempt.
--autonomous-max-turns
,
--autonomous-max-tokens
, and
--autonomous-timeout-ms
bound continuations, tokens, and wall-clock time respectively.
Evaluating Prime Agent
Prime Agent serves as both a coding agent to be used, and a
harness design to be evaluated
for research. We make special note that while many modern frontier models are trained around a specific harness, currently no model has been trained around Prime Agent or its core feature set.
ARC-AGI 3.
ARC-AGI 3
is a popular intelligence benchmark that measures the ability of an agent to perform symbolic reasoning and learn the rules of simulated worlds. We evaluate Prime Agent with autonomous mode over several different frontier models, and compare to their native harnesses. Prime Agent was developed as a CLI coding agent, so the only ARC AGI 3 specific changes are to the task prompt, inspired by the standard prompt setup used in
PRO-LONG
.
Our best results use Opus 5 in Prime Agent to achieve
95.5% RHAE Best@1
,
which surpasses the ARC reported human expert baseline of 95.4%
. Across three runs, we find that Prime Agent consistently performs well [95.0, 95.2, 95.5] and 99.97% Best@3 with all 183/183 levels complete. Our median score card action replay (95.2%) for ARC-AGI-3 can be found
here
.
ARC-AGI-3: (left) test-time compute scaling: score vs. output tokens per game. (right) cost scaling: score vs. estimated API cost.
In addition to achieving a higher maximum score over each model&#x27;s native harness, we find that Prime Agent also does so at a lower overall token usage. Prime Agent saves tokens by programmatically running functions over data rather than spending tokens reading data using tools.
Finally, we note that we evaluated Opus 5 and GPT-5.6 Sol with Claude Code and Codex respectively, and found
worse
overall performance relative to the official results, so we yield to their official reported numbers instead.
Long context and long-running tasks
Many difficult tasks in the wild reduce to long context tasks. Our goal is to show that Prime-Agent with open-weights models are a competitive alternative to closed models and harnesses, both as a general agent to be used, and as a baseline harness to be evaluated.
Below, we select a suite of common long-context benchmarks across coding, retrieval, and general long reasoning tasks, and compare Prime Agent to several different popular harnesses. We offload the main context in each harness to a file in memory to start. For closed model harnesses, we use their associated models (i.e., Codex with GPT, Claude Code with Opus) while for Prime-Agent and Pi-mono (with sub-agents), we choose an open-weights model in GLM-5.2.
GLM-5.2 (high)
Opus 5 (high)
GPT-5.6 Sol (high)
Eval
Prime-Agent
Pi-mono (w/ sub-agents)
Prime-Agent
Claude Code
Prime-Agent
Codex
OOLONG (yahoo, 128k)
long context
0.700
0.420
0.900
0.920
0.940
0.500
OOLONG-Pairs
long output
0.874
0.556
0.929
0.922
0.911
0.895
OBLIQ-Bench (math)
long ranking [ndcg@10]
0.669
0.635
0.802
0.795
0.612
0.646
LongBenchPro (English)
long comprehension
0.777
0.768
0.804
0.790
0.794
0.790
LongBenchv2
expert annotated long tasks
0.680
0.696
0.744
0.746
0.714
0.704
ManyIH Coding
long instructions
0.424
0.386
0.536
0.522
0.499
0.454
ManyIH IF
long instructions
0.209
0.164
0.225
0.175
0.216
0.232
LongCot-Mini
long reasoning
0.638
0.613
0.722
0.558
0.671
0.681
EmulatorBench
long coding
0.208
0.000
0.047*
0.062*
0.275
0.228
We generally find Prime Agent to be competitive across a wide range of long tasks, especially against the harness that did not use a model trained around it. Prime Agent especially excels at long-running or long-context tasks, and can competitively run on its own as an autonomous agent. We include a set of focused case studies and experiments on long settings where Prime Agent excels.
Creating emulators from scratch.
An emulator is software that reproduces another computer system&#x27;s observable behavior. We evaluate Prime Agent on
EmulatorBench
, a preview benchmark that tasks agents with constructing emulators in Rust for a variety of game systems. Agents are given a specification of the emulator and a set of diagnostic tests in the form of a verifier.
The correctness of an emulator is given from its ability to mimic the behavior of the target machine. This is measured by human-generated diagnostic programs that inspect the emulator&#x27;s behavior, such as the CPU flags, PPU timing, and other components. In an effort to minimize the effects of data contamination, we require the agent to build the emulator from scratch in Rust, sandboxed without any reference implementation. We report preliminary results on this long-context coding benchmark averaged over 16 emulator reconstructions, as well as two emulators, the SEGA Genesis and Nintendo Game Boy Color, that Prime Agent successfully reproduces. For Opus, our runs surprisingly failed to solve the tasks despite successful tool-call responses.
EmulatorBench: Score vs. Cost on creating (left) Sega Genesis emulator and (right) Game Boy Color emulator.
Writing GPU kernels.
Writing performant GPU kernels is an iterative process that requires repeatedly verifying, profiling, and tweaking code to get correct. We evaluate Prime Agent as a harness for GPU kernel writing on the recently released
PMPP-Hard
benchmark, a suite of tasks where agents must write performant GPU kernels that pass a suite of correctness checks against
KernelGuard
, the verification tool used for the official
GPU MODE
kernel leaderboard.
A long-horizon case study on games
Autonomously playing video games has become an interesting case study for models and harnesses in how they handle long-horizon decision making. Games often require harnesses to balance information and context across millions of tokens, while also leveraging this information to efficiently take actions and avoid catastrophic states.
Factorio.
Factorio is a 2D factory simulation game where agents must mine resources, research technology, and build automated factories to increase the production of these resources. The
Factorio Learning Environment (FLE)
is an interface for simplifying the observation and action space of an LLM playing Factorio, which we use to connect Prime Agent to the game.
The action and observation space of FLE is a module in Python that is accessed programmatically at every turn. This integrates directly into Prime Agent&#x27;s IPython kernel. To leverage PTC for sub-agents, we launch four controllable characters in the game.
Prime Agent using subagents and programmatic tool calling to cheat on Factorio by teleporting resources directly into machines.
The primary metric in FLE is production score, which is a weighted average of all materials the agent produces. Prime Agent successfully leveraged
/refine
to turn failures and successes into memories and skills, respectively. It used its own accumulated experience to design increasingly efficient machine layouts, raising the production score run over run. This allowed Prime Agent to efficiently score in the 100K+ range in production score in a matter of hours.
However, we also observed instances of reward hacking by Prime Agent in FLE. Prime Agent discovered it could bypass Factorio&#x27;s rules entirely by spawning in resources directly into its assembly machines through RCON commands, even with an explicit heartbeat prompt to remind Prime Agent not to cheat in Factorio. Once it found this exploit, the same refinement loop that had been building legitimate skills turned to building efficient cheating skills instead.
MazeBench.
MazeBench
is an open-world 3D spatial reasoning environment where the player controls a 3D cube and must solve puzzle rooms within a global maze, while collecting gems. Frontier models are shown to greatly struggle on this task, expending billions of tokens to solve only a fraction of the overall world. We compare Opus 5 and GPT-5.6 Sol with Prime Agent versus their native harnesses, as well as GLM-5.2 with Claude Code. Following the benchmark metrics, we report the unique number of rooms they find, the unique number of states, and the total number of gems, all as a function of their overall token spend.
Next Steps
Prime Agent is a new paradigm on the design of agent harnesses. Despite strong results over other harnesses, we still notice friction when running Prime Agent with models. This implies that there are huge performance gains still available from training with Prime Agent directly around this harness paradigm, or even the individual RLM and Continual Harness components.
We strongly believe that model-harness co-learning is the dominant paradigm to unlock new capabilities. Many features of Prime Agent are not fully utilized without a trained model, and we believe there are huge performance gains still available from training with the harness directly. We are excited to bring you these new capabilities, all in the open.
We will have a full technical report with further details soon.
Acknowledgements
Prime Agent is built on top of
pi
. We thank the authors of
pi
for their valuable work.
Citation
@article{primeintellect2026primeagent,
author = {Seth Karten and Alex L. Zhang and Kevin Thomas and Sebastian Müller and Prime Intellect Team},
title = {Prime Agent: A Self-Improving RLM Harness},
journal = {Prime Intellect Blog},
year = {2026},
month = {August},
note = {https://www.primeintellect.ai/blog/prime-agent}
}
