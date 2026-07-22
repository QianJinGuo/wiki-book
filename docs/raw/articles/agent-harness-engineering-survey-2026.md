---
source_url: "https://picrew.github.io/LLM-Harness/paper.pdf"
ingested: 2026-06-26
sha256: bf9ba0cbacec54bd
---

# Agent Harness Engineering: A Survey
Agent Harness Engineering: A Survey
Junjie Li, Xi Xiao, Yunbei Zhang, Chen Liu, Lin Zhao, Xiaoyying Liao, Yingrui Ji, Janet Wang, Jianyang Gu, Yingqiang Ge, Weijie Xu, Xi Fang, Xiang Xu, Tianchen Zhao, Youngeun Kim, Tianyang Wang, Jihun Hamm, Smita Krishnaswamy, Jun Huan, Chandan K. Reddy
CMU · Yale · Johns Hopkins · Northeastern · Tulane · UAB · Ohio State · Virginia Tech · Amazon
ABSTRACT
The harness is becoming the binding constraint.
The rapid deployment of large language model agents in production has revealed a recurring pattern: task execution reliability depends less on the underlying model than on the infrastructure layer that wraps it, the agent execution harness.
This survey presents agent harness engineering as an independent system layer, proposes the seven-layer ETCLOVG taxonomy (Execution, Tooling, Context, Lifecycle, Observability, Verification, Governance), and maps a broad corpus of open-source projects onto that taxonomy to expose ecosystem patterns, coverage gaps, and emerging design principles.
CONTRIBUTIONS
Three Claims
CLAIM 1: Harnesses are independent system layers. Real-world reliability is shaped by execution controls, feedback loops, governance, evaluation, and operational design, not only by model capability.
CLAIM 2: ETCLOVG separates production concerns. Execution, Tooling, Context, Lifecycle, Observability, Verification, and Governance expose architectural boundaries that earlier frameworks often conflate.
CLAIM 3: A broad ecosystem map reveals gaps. A systematic mapping of the open-source ecosystem surfaces adoption patterns across sandboxes, protocols, memory systems, orchestrators, observability platforms, benchmarks, and governance stacks.
Three Engineering Phases
2022–2024: Prompt engineering. The primary lever is the input prompt text: instructions, few-shot examples, and reasoning templates, all optimized for a single model call.
2025: Context engineering. The question shifts from "what is the input?" to "what should the model see at each step?" The scope expands to retrieval, compaction, tool-result ranking, and managing context-window saturation across turns.
2026–: Harness engineering. As models become capable enough to attempt long-running tasks, the engineering focus expands to the full infrastructure wrapper: execution environment, tool interface, context, lifecycle, observability, verification, and governance.
Timeline of Agent-Harness Systems
The same shift is visible in the systems themselves. The ReAct era of 2022–2023 wrapped a single model loop with a while-loop, a prompt template, and a small tool dispatch table; AutoGPT and BabyAGI exposed the resulting failures, including execution runaway, context blowout, state loss, and unmonitored side effects, as infrastructure problems rather than prompt problems. Tool integration and multi-agent coordination from 2023–2024 added learned tool use (Gorilla, ToolLLM, Toolformer), role-playing organizations (CAMEL, ChatDev, MetaGPT, Mixture-of-Agents), the first agent benchmarks (SWE-bench, AgentBench, WebArena, GAIA), and the beginnings of protocol standardization (MCP, A2A). By 2025–2026 enough deployment experience had accumulated that "harness engineering" began to be named as a discipline of its own, accompanied by automated harness optimization and a wave of results in which only the harness was varied.
Representative agent-harness systems by ETCLOVG layer, 2022–2026.
The ETCLOVG Taxonomy
We organize the harness into seven layers. The first four describe the structural core of a harness; the last three describe the control plane around it. Compared with earlier six-component frameworks, Observability and Governance appear here as independent layers because, in production deployments, each has its own tooling stack and is owned by a different team.
The ETCLOVG taxonomy. E, T, C, and L form the structural pillars; O provides system-wide monitoring; V delivers evaluation and feedback; G enforces governance constraints across the system.
E – Execution environment. Determines where agent code runs and what sandbox constraints bound it: managed sandboxes, microVMs, code-specialized runtimes, computer-use environments, browser sandboxes, and OS-level permission models.
T – Tool interface and protocol. Specifies how external capabilities are described, discovered, and invoked, including protocol standards (MCP, A2A), tool description and selection, tool-augmented training, and session management.
C – Context and memory management. Controls what the model can see across short-term, session-level, and persistent horizons, including long-horizon context techniques and mitigations for context drift.
L – Lifecycle and orchestration. Organizes the control flow that reads and writes state, from the single-agent inner loop to multi-agent patterns and full issue-to-pull-request task pipelines.
O – Observability and operations. Captures traces, costs, failures, and reliability signals through tracing platforms, agent-specific operations tools, cost tracking, and unified observability.
V – Verification and evaluation. Turns tasks and traces into evaluation, failure attribution, and regression feedback, including benchmark grounding, controlled execution, multi-level judgement, and deployment-time evaluation loops.
G – Governance and security. Constrains behavior across model-level, system-level, and organizational-level sub-layers: permission models, lifecycle hooks, component hardening, declarative constitutions, and audit infrastructure.
Detailed view of the taxonomy. Each branch corresponds to one ETCLOVG layer; the leaves list the subcategories used to organize the survey, with pointers to the sections that introduce them.
Mapping Open-Source Projects
To make the taxonomy concrete, the survey codes a broad corpus of open-source agent-harness projects against ETCLOVG, using the public artifact itself (README files, documentation, papers, examples, release notes) as the evidence. The corpus is maintained as a living catalog at Awesome-Agent-Harness, and contributions are welcome through pull requests.
Corpus construction protocol. Candidates are gathered from GitHub, papers, curated lists, package registries, and engineering blogs, then deduplicated, checked against inclusion criteria, and coded against the seven ETCLOVG layers using public documentation.
Coding is multi-label: a project's primary layer marks the mechanism most central to it, while secondary layers are assigned only when the public documentation exposes an independent capability. The counts below reflect primary assignments in the current snapshot.
LAYER  | SCOPE                         | PRIMARY PROJECTS
E      | Execution environment & sandbox | 20
T      | Tool interface & protocol     | 12
C      | Context & memory management    | 9
L      | Lifecycle & orchestration     | 47
O      | Observability & operations     | 15
V      | Verification & evaluation      | 21
G      | Governance & security          | 14
Reading the corpus in aggregate, Execution, Tooling, Lifecycle, and Verification have the densest visible coverage: coding, web, terminal, and computer-use agents all require runnable environments, tool contracts, control loops, and repeatable evaluation before they can be useful. Context and memory appear across many projects but are often embedded inside larger frameworks rather than released as standalone components. Observability and Governance are thinner in open source and more often live inside commercial platforms, SDK features, or engineering writeups, suggesting that operational control has matured later than runtime and benchmark infrastructure.
Cross-Layer Synthesis
Composing the seven layers creates system-level constraints that no single layer can resolve alone. The survey distils these effects into three recurring patterns.
Cost-quality-speed trilemma. Stronger sandboxes, richer context, and deeper evaluation improve quality but cost tokens, latency, and infrastructure. Production harnesses cannot treat quality as a scalar objective; they must decide which risks justify expensive controls and which checks can run asynchronously or in regression suites.
Capability-control tradeoff. Larger tool menus, persistent memory, and permissive sandboxes broaden task coverage but enlarge the blast radius of misaligned or compromised actions. Capability and control are therefore a single design axis spanning tool schemas, context policy, runtime permissions, identity, auditability, and human approval.
Harness coupling problem. Harness layers are coupled in ways that make local optimization fragile. A prompt, tool, sandbox, verifier, or monitor may look beneficial in isolation while degrading the whole rollout when combined with the rest of the control loop. Harness changes should be tested as system changes.
A related shift runs through the corpus: from agent frameworks, which package local abstractions (agents, tools, memory, execution loops), to agent platforms, which add durable workspaces, identity, observability, evaluation, governance, and human handoff across many runs and many users.
Open Problems
Five questions remain open across the taxonomy. Each follows from the cross-layer synthesis rather than from a single ETCLOVG layer in isolation.
1. Hardening and scaling execution environments. Common security evaluations for prompt injection, goal misalignment, and compositional amplification; cost models that decide between containers, microVMs, OS permission boundaries, full desktop VMs, browser environments, and learned surrogates; portability that preserves semantics across self-hosted, cloud, and hybrid deployments.
2. Reliable state in long-running agents. Recasting context management as state estimation: characterizing the information loss at each compression, retrieval, or forgetting step; adding provenance, contradiction handling, and explicit staleness markers; recovering from durable artifacts rather than from compressed history.
3. Trace-native failure diagnosis. Traces should be the primary object from which systems compute outcome scores, trajectory quality, failure attribution, and regression tests, not just after-the-fact debugging material. The gap between widespread observability adoption and far less common offline evaluation is the concrete starting point.
4. Standard handoffs across agents, tools, and humans. Handoffs should transfer not only a text summary but intent, constraints, permissions, artifacts, provenance, budget state, risk level, trace history, and unresolved decisions. The open question is how to make such a protocol rich enough for safety and recovery while remaining simple enough for broad adoption.
5. Adaptive simplification as models improve. Every wrapper encodes an assumption about what the model cannot do reliably on its own. As models improve, some interventions remain load-bearing while others become cost, latency, or operational overhead. Future harnesses need mechanisms for ablating, optimizing, and simplifying themselves under joint quality, latency, cost, and risk constraints.
Citation
If you find this survey useful in your research, please consider citing:
@misc{li2026agentharness,
  title  = {Agent Harness Engineering: A Survey},
  author = {Junjie Li and Xi Xiao and Yunbei Zhang and Chen Liu and
            Lin Zhao and Xiaoyying Liao and Yingrui Ji and Janet Wang and
            Jianyang Gu and Yingqiang Ge and Weijie Xu and Xi Fang and
            Xiang Xu and Tianchen Zhao and Youngeun Kim and
            Tianyang Wang and Jihun Hamm and Smita Krishnaswamy and
            Jun Huan and Chandan K. Reddy},
  year   = {2026},
  note   = {Preprint}
}
Companion page to the survey. The catalog lives at Awesome-Agent-Harness; contributions are welcome. Layout follows common academic project-page conventions (see Nerfies for the original template). Page content released under CC BY-SA 4.0.