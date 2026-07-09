# RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

## Ch04.412 RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

> 📊 Level ⭐⭐ | 6.8KB | `entities/roadmapbench-long-horizon-agentic-software-development-benchmark.md`

# RoadmapBench — 跨版本升级的长周期 Agentic 软件开发评估基准

## 摘要

RoadmapBench 是由 Allen AI 提出的面向长周期 Agentic 软件开发的评估基准。它包含 115 个基于真实开源项目版本升级的长期编码任务，覆盖 17 个仓库和 5 种编程语言。 与现有聚焦单 issue bug fix 的基准不同，每个任务要求 Agent 在源版本代码快照上实现目标版本的全部新功能，中位修改量为 3700 行代码、跨 51 个文件。 在 13 个前沿模型的系统评测中，最强模型 Claude-Opus-4.7 仅解决 39.1% 的任务，最弱模型仅 5.2%，表明长周期软件开发仍是 Agent 能力的重大挑战。

## 核心要点

1. **任务规模远超现有基准**：中位修改量 3700 行代码、跨 51 个文件，是 SWE-Bench 典型任务的 10-50 倍
2. **真实版本升级场景**：任务基于真实开源项目（如 Python、TypeScript、Rust 项目）的版本间变更，而非人工构造
3. **多语言覆盖**：涵盖 5 种编程语言，较现有以 Python 为主的基准更具通用性
4. **表现天花板显著**：最强模型不到 40% 的解决率，表明长周期软件开发 Agent 仍有巨大提升空间
5. **评估指标全面**：不仅考察最终通过率，还关注任务完成过程中的中间里程碑达成情况

## 深度分析

### 长周期任务对 Agent 架构的全新挑战

RoadmapBench 揭示了一个根本性矛盾：现有 Agent 架构大多为短周期交互设计（单次工具调用→结果反馈→下一步决策），而长周期任务需要 Agent 在数百次工具调用中维持对项目全局的理解和一致的目标导向。 这与 [Agent Harness 上下文管理](../ch05/039-agent-harness.html) 中讨论的上下文窗口滑动问题密切相关——当修改跨越 51 个文件时，Agent 无法将所有相关代码同时保持在上下文中，必须依赖外部持久化机制。

### 规划与执行的解耦

51 个文件的修改需要 Agent 具备分层规划能力：先理解目标版本的架构变更，再规划文件级别的修改顺序，最后执行具体代码变更。 这与 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的分层思想一致——将长周期任务分解为可管理的子任务序列，每个子任务有独立的验证标准。

### 与现有基准的互补定位

RoadmapBench 填补了从 SWE-Bench（单 bug fix）到 [Codex 六小时目标运行](../ch09/058-codex-goal-six-hour-run.html)（端到端功能开发）之间的评估空白。 它的定位类似 SWE-Bench 的"跨版本升级"增强版，关注的是 Agent 在已知代码库上进行系统性演进的能力，而非从零开始的创作能力。

### 模型能力的差异化分析

13 个模型的评测结果显示，模型性能并非简单地随参数量增长。Claude-Opus-4.7 的 39.1% 与最弱模型的 5.2% 之间差距悬殊，暗示长周期任务对模型的指令遵循、长上下文理解和错误恢复能力提出了复合要求。 这与 [CMU PACE 代理评估](../ch03/045-agent.html) 中揭示的能力指纹概念相互印证——不同基准测试对模型能力维度的需求分布不同。

### 对 Harness 工程设计的启示

RoadmapBench 的结果表明，单纯提升模型能力不足以解决长周期开发问题。Agent Harness 需要提供更强大的工作流管理、断点续传、版本控制和中间产物验证能力。 这与 [Agent Harness 架构](../ch05/039-agent-harness.html) 中讨论的生产级 Harness 设计要求高度一致。

## 实践启示

1. **Agent 基准选择需要匹配实际部署场景**：如果你的应用场景涉及跨多文件的系统性修改（如版本升级、重构），SWE-Bench 的分数不能代表实际能力——RoadmapBench 是更贴近的评估选择。

2. **长周期任务需要 Harness 层支持**：在评估或部署长周期 Agent 时，确保 Harness 提供任务持久化、中间状态保存和断点续传能力。纯模型能力无法弥补架构短板。

3. **关注能力指纹而非单一分数**：结合 [CMU PACE](../ch03/045-agent.html) 等代理评估方法，分析模型在长周期任务上的具体短板——是指令遵循、规划还是错误恢复？针对性地设计 prompt 策略。

4. **渐进式任务分解是可行路径**：将 RoadmapBench 的 51 文件任务分解为按依赖顺序排列的子任务序列，每个子任务有独立验证。这比"一次性完成所有修改"的策略更可靠。

5. **预训练数据策略需调整**：模型在长周期任务上的低分提示，当前预训练数据中缺乏足够的多文件、长序列编码示例。在微调或 RL 阶段引入这类数据可能带来显著提升。

## 相关实体

- [Agent Harness 架构](../ch05/039-agent-harness.html) — 生产级 Agent 运行基础设施的设计原则
- [Codex 六小时目标运行](../ch09/058-codex-goal-six-hour-run.html) — 长链 Agent 执行的实际案例
- [Agent Harness 上下文管理](../ch05/039-agent-harness.html) — 长周期任务中的上下文窗口管理技术
- [CMU PACE 代理评估](../ch03/045-agent.html) — 低成本 Agent 能力评估方法
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 分层 Harness 工程方法论
- SWE-Bench Verified — 当前主流的单 bug fix Agent 基准

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/roadmapbench-evaluating-long-horizon-agentic-software-development.md)

---

