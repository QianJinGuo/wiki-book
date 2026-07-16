# Agent Harness Engineering: A Survey

## Ch04.079 Agent Harness Engineering: A Survey

> 📊 Level ⭐⭐ | 18.9KB | `entities/agent-harness-engineering-survey-2026.md`

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

## 深度分析
**Harness 工程范式的独立地位**
这篇 survey 最重要的贡献是确立了 harness engineering 作为独立系统层的地位。传统上，LLM 系统的可靠性被归因于模型本身的能力——参数规模、预训练数据质量、指令微调水平。然而 2025 年以来的部署实践表明，当模型能力越过某个阈值后，任务执行的可靠性越来越取决于 wrapping infrastructure 而非模型本身。这一洞察对工业界意义重大：提升系统可靠性不必等待下一个 GPT-5 级别的模型发布，通过优化 harness 的各层实现即可获得显著收益。
**ETCLOVG 七层架构的工程价值**
ETCLOVG  taxonomy 将 harness 分解为 Execution、Tooling、Context、Lifecycle、Observability、Verification、Governance 七个层次，这一分解在工程上有几个关键价值：其一，提供了架构边界的清晰定义——早期框架往往将 Tooling 和 Context 混在 single-agent loop 中、将 Observability 和 Governance 视为事后补丁，而 ETCLOVG 让每个 Concern 都有明确对应的系统组件和团队职责；其二，暴露了 open-source ecosystem 的覆盖缺口——数据显示 Context&Memory 和 Governance&Security 在开源生态中最为薄弱，这暗示了未来工程投入的重点方向；其三，为跨层合成的系统级约束提供了分析框架，特别是 cost-quality-speed trilemma 和 capability-control tradeoff 两个核心矛盾的量化描述。
**从框架到平台的演化信号**
survey 指出一个值得注意的产业演化趋势：从 agent frameworks 到 agent platforms。 frameworks 聚焦于本地抽象（agent、tool、memory、execution loop），而 platforms 增加了持久化 workspace、身份认证、observability、evaluation、governance 和 human handoff。这一转变意味着 LLM Agent 的工程化走向成熟——从概念验证走向生产部署，需要的是完整的基础设施栈而非单点工具。这也预示着未来行业的整合方向：垂直集成的 agent platform 将比点状工具链更具备竞争力。
**五大开放问题的优先级判断**
五个 open problems 中，trace-native failure diagnosis 和 reliable state in long-running agents 具有最高的工程紧迫性。前者对应着当前 observability 工具虽然广泛部署但离线 evaluation 能力严重不足的现状，后者则是长程 agent 任务可靠性的核心瓶颈。adaptive simplification 作为第五个问题，虽然具有长期战略价值，但在当前模型能力仍在快速提升的阶段，其优先级相对较低。

## 实践启示
**对于 harness 设计者**：优先关注 Execution environment 和 Lifecycle & orchestration——这两个层次在开源生态中最为成熟，也是大多数 agent 系统首先遇到的工程瓶颈。Context & memory management 虽然关键，但建议优先考虑嵌入式方案而非独立组件，等待该层次的标准化接口成熟。
**对于平台工程师**：以 cost-quality-speed trilemma 和 capability-control tradeoff 为核心度量维度设计系统。避免针对单一指标（如单纯降低 latency 或单纯提升 quality）的局部优化——harness 变更必须作为系统级变更进行测试。同时，在设计 pipeline 时预留 observability 和 governance 的接入点，而非事后补救。
**对于评估和验证团队**：Verification & evaluation 当前在开源生态中已有 21 个主要项目，覆盖相对完整。但关键缺口在于 trace-native failure diagnosis——现有的评估方案多依赖事后 log 分析而非实时轨迹质量判断。建议投入资源建立以 trace 为核心对象的 evaluation 基础设施。
## 相关实体
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering V2](../ch05/052-harness-engineering.html)
- [Harness Engineering Alibaba Java Case Study](../ch05/052-harness-engineering.html)
- [Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](../ch05/052-harness-engineering.html)
- [Harness Engineering Systematic Framework](../ch05/052-harness-engineering.html)
- [Agentscope Java Harness Framework](../ch03/051-agentscope-java-harness-framework-2-0-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)

---

