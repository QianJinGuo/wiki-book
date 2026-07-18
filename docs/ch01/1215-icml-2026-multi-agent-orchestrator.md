# ICML 2026｜如何对Multi-Agent系统进行过程评估？重新认识多智能体系统中的Orchestrator

## Ch01.1215 ICML 2026｜如何对Multi-Agent系统进行过程评估？重新认识多智能体系统中的Orchestrator

> 📊 Level ⭐⭐⭐ | 10.9KB | `entities/icml-2026如何对multi-agent系统进行过程评估重新认识多智能体系统中的orchestrator.md`

# ICML 2026｜如何对Multi-Agent系统进行过程评估？重新认识多智能体系统中的Orchestrator

> 南京大学 NLP 实验室的 ICML 2026 论文《Recognize Your Orchestrator: An Entropy Dynamics Perspective for LLM Multi-Agent Systems》揭示了多智能体系统中的核心瓶颈并非执行器（Executor）的能力不足，而是调度中枢（Orchestrator）在长链路任务中逐步失去对任务的掌控。论文提出了 Mean-Field Entropy Dynamics 框架和 IWG（Inverse Workflow Generation）方法，为多智能体系统的过程级评估提供了理论视角和可验证数据基础。

## 摘要

多智能体系统正成为大模型应用的主流范式，但"AI 团队真的会协作吗"这一问题长期缺乏系统性的评估方法。这篇来自南京大学的 ICML 2026 论文得出了一个反直觉的核心结论：**多智能体系统的失败并非首先来自某个执行器不会干活，而是来自负责全局调度的 Orchestrator 逐渐失去对任务的掌控**。论文引入"调度熵"概念，用熵动力学刻画 Orchestrator 的行为退化过程，并提出了 IWG 方法——一种从目标答案反向构造可验证交互环境的评估技术。此外，论文还发现了 Reasoning Trap 现象：重推理模型在多智能体调度场景中未必占优势，思考越长反而可能调度越不稳定。

## 核心要点

- **失败归因转移**：在 Deep Research、Agent Coder、GUI Browser、Agentic RAG 四类典型多智能体系统中，Orchestrator 承担主要失败责任，而非单个 Executor
- **调度熵（Scheduling Entropy）**：用香农熵度量 Orchestrator 在每一步选择 Agent 时的不确定性，熵高 = 调度不稳定
- **Mean-Field Entropy Dynamics**：任务推进带来聚焦力（熵下降），上下文累积带来扩散力（熵上升），二者共同决定系统能否收敛
- **IWG 评估方法**：从最终答案反向构造可执行的环境，生成带中间检查点的任务，支持过程级评测
- **Reasoning Trap**：重推理模型的思考链越长，注意力预算越被自我生成内容挤占，外部关键信号被稀释

## 研究背景：多智能体系统评估的盲区

### Orchestrator-Executor 架构的脆弱性

在一个典型多智能体系统中，Executor Agent 负责执行具体任务（搜索、代码、视觉、总结等），而 Orchestrator 像一个项目经理，负责理解用户目标、拆解任务、选择合适的执行器、读取反馈，并决定下一步行动。

然而，当任务链路变长时，问题开始显现：工具越多，历史日志越长，异常反馈越复杂，Orchestrator 面临的信息压力就越大。它可能派错 Agent、误读 Executor 输出、陷入重复循环、提前终止任务，或者在遇到错误反馈后无法恢复。

### 传统评估的局限

现有 Benchmark 往往只提供初始问题和最终答案，这相当于只知道项目最后是否成功，却不知道中间哪一步派错任务、读错反馈、哪个节点导致后续连锁偏差。论文的失败归因分析显示，在四类场景中 Orchestrator 承担了主要失败责任——这一发现将分析重点从"单个 Agent 是否足够强"转向了"调度过程是否稳定"。

## 方法论

### 调度熵：量化 Orchestrator 的不确定性

Orchestrator 每一步都需要回答"下一步应该调用谁"。当它非常确定时，选择会集中在少数 Agent 上；当它不确定时，选择会在多个方向之间摇摆。论文用香农熵来度量这种调度分布的分散程度：

- **聚焦力**（来自任务推进）：随着任务被解决，不确定性下降，熵降低
- **扩散力**（来自上下文累积）：历史日志和反馈信息堆砌，噪声增加，熵上升

多智能体系统的稳定性，本质上取决于 Orchestrator 能否在越来越复杂的上下文中持续维持清晰判断。**Mean-Field Entropy Dynamics 框架**正是用熵动力学刻画了这两股力量的博弈过程。

### IWG：让过程变得可检查

Inverse Workflow Generation（IWG）的核心思想是：不从问题正向采集轨迹，而是从目标答案出发，反向构造一个可执行、可验证的交互环境。包含三个组件：

1. **Scout Agent**：从最终答案倒推必要中间任务，形成能力感知的任务标记
2. **Wrapper Agent**：将抽象任务落地为具体环境状态和工具反馈，而非直接泄露答案
3. **Validation Committee**：通过多层验证保证任务可解、路径一致、事实可靠

IWG 不生成 Orchestrator 的执行轨迹，而是构造带中间检查点的任务环境。真正的调度轨迹仍由被测模型自行生成，研究者可以观察到 Orchestrator 在每一步如何决策，何时开始偏离、震荡或坍缩。

## 核心发现

### 发现一：System-Level 与 Orchestrator-Level 不同步

论文没有简单处理成模型排行榜，而是同时考察两个层面：

- **System-Level**：整个系统最终是否完成任务
- **Orchestrator-Level**：调度者每一步是否成功、是否忠实利用执行器输出、能否处理异常

实验显示，这两个层面并不总是同步。有些模型的最终任务完成并不稳定，却在 Step-SR、Consistency 等过程指标上表现更稳。这说明多智能体系统中的 Orchestrator 能力不能简单等同于单轮推理能力。

### 发现二：不同模型有不同的调度风格

从熵动力学角度看，不同模型呈现出不同调度风格：

- **高探索模型**：初始探索幅度大、路径切换频繁，能快速展开候选方案，但更容易在后续步骤中失去稳定性
- **稳定型模型**：熵增长更慢，更擅长在长程任务中维持一致性

### 发现三：Reasoning Trap

论文最反直觉的发现之一：**重推理模型在多智能体调度场景中未必更占优势**。

Orchestrator 面临的问题是理解用户目标、系统约束、历史日志、多个 Executor 的反馈和异常信息。如果模型在此基础上继续大量内部思考，有限的注意力预算被自我生成内容挤占，导致外部关键信号被稀释。实验显示，**抑制过度思考后，模型在调度效率和步骤成功率上反而更稳**。

## 深度分析

### 从"执行能力"到"调度能力"的范式转移

这项研究的核心贡献在于将多智能体系统评估的关注点从执行器（Executor）转移到调度器（Orchestrator）。这与当前 Agent 系统的发展趋势密切相关：随着工具和技能库的不断扩展，单个 Agent 的能力已经不是瓶颈，如何组织和管理多个 Agent 的协作才是。这与 Harness Engineering 范式中强调的"调度层"设计理念高度一致。参见 [生产级 Agent Harness](../ch05/039-agent-harness.html) 和 [Harness 范式](../ch05/018-harness.html)。

### Reasoning Trap 的深层启示

Reasoning Trap 的发现挑战了"更多思考 = 更好结果"的朴素直觉。在多智能体环境中，Orchestrator 的角色更接近"高效的项目经理"而非"深度思考的研究员"——需要快速理解反馈、决策，而非深入推理。这为 Agent 系统设计提供了重要指导：对于调度层，应该选择**信号过滤能力强、决策速度快**的模型，而非推理能力最强的模型。

### 熵动力学作为系统健康指标

调度熵的引入为多智能体系统提供了一个可量化的"健康指标"。在实际部署中，运维团队可以实时监控调度熵的变化趋势：熵持续上升表明系统正在失控，需要干预（如重启 Orchestrator、清理上下文或降低任务复杂度）。这比仅监控"任务是否完成"的二元指标提供了更早期、更细粒度的预警。

## 实践启示

1. **多 Agent 系统的部署应优先关注 Orchestrator 能力**：选择调度稳定、信号过滤能力强的模型担任 Orchestrator，而非追求最强的推理模型

2. **监控调度熵作为早期预警指标**：在生产环境中实时监控 Orchestrator 的调度熵变化趋势，熵持续上升时触发自动化干预

3. **避免 Reasoning Trap**：对担任 Orchestrator 的模型，适当抑制过度思考——适合调度层的模型是"能在复杂上下文中快速过滤噪声"的模型

4. **过程级评估补充结果级评估**：最终任务完成率不足以及时发现系统退化，需要 IWG 类方法提供中间检查点和过程指标

5. **上下文管理直接影响调度质量**：长链路多智能体系统中，上下文管理策略（历史截断、关键信息提取）直接影响 Orchestrator 的调度稳定性

## 相关实体

- [生产级 Agent Harness](../ch05/039-agent-harness.html) — Harness 架构中 Orchestrator 层的设计
- [Harness 范式](../ch05/018-harness.html) — 从 Vibe Coding 到 Harness Engineering 的范式转变
- [Agent Harness 综述](../ch05/039-agent-harness.html) — 调度层设计对 Agent 表现的影响
- [多 Agent 信息流设计](ch01/1292-anthropic.html) — Agent 间信息流转的架构模式
- [注意力坍缩与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md) — 长上下文场景下模型行为退化及其应对

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/icml-2026如何对multi-agent系统进行过程评估重新认识多智能体系统中的orchestrator.md)

---

