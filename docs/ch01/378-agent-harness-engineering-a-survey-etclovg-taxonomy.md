# Agent Harness Engineering: A Survey — ETCLOVG Taxonomy

## Ch01.378 Agent Harness Engineering: A Survey — ETCLOVG Taxonomy

> 📊 Level ⭐⭐ | 13.3KB | `entities/agent-harness-engineering-survey-etcvlovg-taxonomy.md`

## Overview
Academic survey (2026, preprint) proposing **agent harness engineering as an independent system layer**, not merely a wrapper around a model. Authors from 9 institutions (CMU, Yale, Johns Hopkins, etc.) with Amazon affiliation. ^[agent-harness-engineering-survey-2026.md]
**Core claim**: Real-world agent reliability depends more on the infrastructure harness than on the underlying model. The survey names this discipline, proposes a taxonomy, and maps 138 open-source projects onto it. ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

## ETCLOVG Taxonomy
The survey organizes the harness into **7 independent layers**: ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
| Layer | Name | Scope | Primary Projects |
|-------|------|-------|-----------------|
| **E** | Execution environment | Sandboxes, microVMs, code runtimes, browser sandboxes, OS permissions | 20 |
| **T** | Tool interface & protocol | MCP, A2A, tool description, discovery, invocation | 12 |
| **C** | Context & memory | Short/session/persistent horizon, context drift mitigation | 9 |
| **L** | Lifecycle & orchestration | Single-agent loop → multi-agent pipelines, issue-to-PR | 47 |
| **O** | Observability & operations | Traces, costs, failures, agent-specific ops tools | 15 |
| **V** | Verification & evaluation | Benchmarks, failure attribution, regression feedback | 21 |
| **G** | Governance & security | Permission models, lifecycle hooks, audit infra | 14 |
**Key architectural insight**: E, T, C, L form the structural pillars; O/V/G form the control plane. Compared to earlier 6-component frameworks, **Observability and Governance are elevated to independent layers** because in production they have separate tooling stacks and separate team ownership. ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

## Three Engineering Phases
| Phase | Period | Focus |
|-------|--------|-------|
| Prompt engineering | 2022–2024 | Input text optimization — instructions, few-shot, reasoning templates |
| Context engineering | 2025 | "What should the model see at each step?" — retrieval, compaction, tool-result ranking |
| Harness engineering | 2026– | Full infrastructure wrapper — execution, tools, context, lifecycle, observability, verification, governance |

## Cross-Layer Synthesis (3 Recurring Patterns)
1. **Cost–quality–speed trilemma**: Stronger sandboxes, richer context, deeper evaluation improve quality but cost tokens, latency, and infrastructure. ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
2. **Capability–control tradeoff**: Larger tool menus, persistent memory, permissive sandboxes broaden coverage but enlarge blast radius. ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
3. **Harness coupling problem**: A component beneficial in isolation can degrade the whole system when combined — harness changes must be tested as system changes. ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
**Also**: Shift from **agent frameworks** (local abstractions) → **agent platforms** (durable workspaces, identity, observability, evaluation, governance, human handoff across many runs/users). ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

## Ecosystem Findings
- **Densest coverage**: E, T, L, V — coding/web/terminal/computer-use agents need runnable environments, tool contracts, control loops, repeatable evaluation.
- **Thin coverage**: C (context/memory embedded inside larger frameworks, rarely standalone) and O/G (more in commercial platforms than open source).
- **Implication**: Operational control has matured later than runtime and benchmark infrastructure.

## 5 Open Problems
1. **Hardening execution environments** — security evals for prompt injection, goal misalignment; cost models for containers vs microVMs vs full desktop VMs ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
2. **Reliable state in long-running agents** — recast context management as state estimation with provenance, contradiction handling, staleness markers ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
3. **Trace-native failure diagnosis** — traces as primary object for outcome scores, trajectory quality, failure attribution, regression tests ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
4. **Standard handoffs** — not just text summary but intent, constraints, permissions, artifacts, provenance, budget state, risk level, trace history ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
5. **Adaptive simplification** — mechanisms to ablate/optimize/simplify harnesses as models improve ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

## Unique Contributions (vs Existing Wiki Harness Docs)
- **First systematic taxonomy** (ETCLOVG) with formal layer definitions
- **138 open-source projects mapped** to taxonomy with primary/secondary layer coding
- **Three-phase evolution narrative** (prompt → context → harness engineering) providing historical framing
- **Cross-layer synthesis patterns** (trilemma, tradeoff, coupling) not found in other harness docs

## Links
- [Paper PDF](https://picrew.github.io/LLM-Harness/)
- [HuggingFace dataset](https://huggingface.co/datasets)
- [GitHub / Awesome-Agent-Harness](https://github.com/picrew/awesome-agent-harness)

## See Also
-  — general harness architecture patterns
-  — academic papers on harness evolution
-  — long-running agent engineering
- [Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md) — raw source

## 深度分析
### 论文定位与领域意义
本文是**首篇将 agent harness engineering 确立为独立系统学科**的学术综述。区别于此前将 harness 视为 "model wrapper" 的朴素观点，论文通过 ETCLOVG 七层 taxonomy 证明了：生产级 agent 可靠性由基础设施层决定，而非底层模型能力决定。 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### ETCLOVG 的结构哲学
七层中 **E-T-C-L 为结构支柱，O-V-G 为控制平面**，这一划分有重要的工程含义： ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

- **E (Execution)** 和 **T (Tool)** 解决 "在哪跑、用什么能力" 的问题，是 agent 与外界交互的物理边界
- **C (Context)** 和 **L (Lifecycle)** 解决 "看见什么、怎么协作" 的问题，是 agent 的认知与行为编排中枢
- **O (Observability)** 提供运行时感知，**V (Verification)** 提供离线评估闭环，**G (Governance)** 提供安全合规约束——三者共同构成生产级别的 control plane
相较于此前 AgentGym、WebArena 等单点评估框架，ETCLOVG 的核心洞察是：O/V/G 在生产环境中拥有独立技术栈和独立团队归属，这使得将它们降级为 L 的子功能是不合理的。 ]] ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### 三阶段演化逻辑的深层含义
| 阶段 | 核心问题 | 工程杠杆 |
|------|----------|----------|
| Prompt engineering (2022–2024) | 如何写好输入文本？ | 指令模板、few-shot、CoT |
| Context engineering (2025) | 每一步给模型看什么？ | 检索、压缩、工具结果排序 |
| Harness engineering (2026–) | 如何设计完整的基础设施 wrapper？ | E/T/C/L/O/V/G 全栈 |
每一阶段的跃迁都伴随着"问题域"的重新定义——不是前一层被抛弃，而是前一层变成充分条件中的必要不充分条件。 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### 跨层合成的三个悖论
**Cost–quality–speed trilemma**：这一 triad 是所有生产系统面临的根本性约束。不同于传统软件系统可以在三者间找平衡点，LLM agent 的特性使得每一项的提升都可能非线性地影响另外两项（例如更严格的 sandbox 会同时降低 speed 并提升 cost）。 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
**Capability–control tradeoff**：这实际上将安全和功能统一在同一个设计轴上——工具越多、能力越强，blast radius 越大。 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
**Harness coupling problem**：Local optimization 导致 global degradation，这在 agent 系统中尤为突出，因为 agent 的各层之间通过 context 和 state 存在隐式耦合。 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### 生态映射的深层洞察
论文对 138 个开源项目的编码揭示了一个非均匀分布： ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

- **E/T/L/V 高密度** → 这些是 "冷启动" 必需品，做 coding/web/terminal agent 必须首先解决执行、工具、控制流和评测
- **C 低密度** → Context/memory 多被嵌入框架内部而非独立输出，说明该层标准化程度低
- **O/G 低密度** → 这两个层面在商业平台内部更成熟，开源社区相对滞后，反映出 O/G 需要更多生产级反馈才能成熟

## 实践启示
### 对 agent 开发者的建议
1. **以 ETCLOVG 审视现有系统**：将你的 agent 项目逐层对照 ETCLOVG，检查是否有明显缺失层——大多数项目在 E/L/V 较完整，但 C/O/G 常被忽视 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
2. **优先补齐控制平面**：如果你在构建生产级 agent，先投入 O（可观测性）和 G（治理）往往比持续优化 E/T/C/L 回报更高 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
3. **跨层变化需要端到端测试**：任何单层优化（更长的 context、更大的 tool pool、更严格的 sandbox）都可能因耦合效应而整体降级，必须作为系统变更测试 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### 对平台/基础设施团队的启示
1. **O/V/G 应作为独立服务而非功能特性**：Observability、Verification、Governance 各自有独立技术栈（tracing、成本分析、安全审计），不应被降级为某个 agent framework 的子模块 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
2. **关注 C 层标准化机会**：Context/memory 是当前最缺乏独立组件的层，存在构建专用 "context middleware" 的机会 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]
3. **自适应简化的工程路径**：随着模型能力提升，harness 应能动态削减——例如当模型 self-correct 能力足够强时，可简化 V 层部分校验循环 ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

### 对研究者的开放问题
论文提出的五个 open problems 中，最值得关注的是： ^["[Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-engineering-survey-2026.md)"]

- **Trace-native failure diagnosis**：将 traces 从调试材料升级为一等公民的评价对象，这需要新的数据结构设计和评价方法论
- **Standard handoffs**：跨 agent/tool/human 的 handover protocol 目前是空白，协议层面标准化将释放大量多智能体协作场景的潜力

---

