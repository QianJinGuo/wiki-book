# Lessons From 2 Billion Agentic Workflows

## Ch04.409 Lessons From 2 Billion Agentic Workflows

> 📊 Level ⭐⭐ | 7.1KB | `entities/lessons-from-2-billion-agentic-workflows.md`

# Lessons From 2 Billion Agentic Workflows

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lessons-from-2-billion-agentic-workflows.md)

## 摘要

CrewAI 创始人 João Moura 基于 20 亿次 Agentic 工作流执行和多家世界 500 强企业（PepsiCo、Johnson & Johnson、PwC、AB InBev、DocuSign 等）的实战部署总结的核心经验：信任是在生产中赢得的，而非在原型中设计的；架构选择会快速复合——将可预测的确定性流程与不可预测的 Agent 推理分离是规模化关键；速度来自完整技术栈（可观测性 + 人在环路 + K8s 部署），而非更聪明的模型。

## 核心要点

### 为什么很多 Agent 永远无法上线

行业数据一致指向同一瓶颈：**信任**（而非智能）是 Agent 上生产的最大障碍。具体表现：

- **图架构的调试噩梦**：基于图的 Agent 框架（图、子图、状态对象层层嵌套）在截图中看起来优雅，但在生产中变成调试灾难——工程师需要穿越多层间接才能找到哪个 prompt 或工具出了问题
- **框架维护负担**：不断破坏性的版本变更导致团队花更多时间维护框架而非构建系统
- **原型需求是生产的 10 倍**：市场上大多数产品聚焦于"构建"阶段，忽视了从 notebook 到可信生产系统的鸿沟
- **模型不是瓶颈**：GPT-4o-mini 至今仍能运行 CrewAI 的许多生产工作负载——问题不在模型智能，而在 Agent Operations

### 三个核心模式

**1. 信任在生产中赢得**
最成功的企业不是从完全自主开始，而是从 100% 人类审查开始，逐步降低监督比例。案例：某 HR 服务公司处理 3000+/月员工工单，Agent "Andy" 起初每条回复都经人审，数千次执行后 SVP 问"能用这些输出训练人类 Agent 吗？"——这是信任转折点，Andy 现在独立处理 50%+ 的交互。

**2. 架构选择快速复合**
DocuSign 的销售管道加速案例：5 个 Agent（Identifier → Researcher → Composer → Validator → Orchestrator）嵌入在确定性 Flow 中控制排序、错误处理和状态管理。验证分三层：LLM-as-judge 质量检查、幻觉检查、API 质量评分。结果：显著缩短周转时间，更高的邮件打开/回复/转化率，代码量减少 14 倍（相比之前的图架构实现）。

**3. 速度来自完整技术栈**
AB InBev 每年通过 AI 处理 300 亿美元决策。关键不是更聪明的 Agent，而是从第一天就有完整栈：K8s 基础设施、可追溯每个决策的可观测性、架构内建的 HITL、通过安全审查的部署选项、PII 保护。

## 深度分析

### "信任梯度"作为系统设计原则

HR 服务公司的案例揭示了一个关键模式：信任不是二元开关，而是一个梯度。100%→50%→? 的递减过程不是随意的，而是基于数千次可审计执行的数据驱动决策。这意味着系统架构必须从一开始就支持这个梯度——不是"先做自主，再加人类审查"，而是"从人类审查起步，设计让信任可度量、可递减的机制"。

这要求三个工程能力：
1. **每个决策可追溯**：能将每个输出追溯到导致它的输入
2. **质量可量化**：能监控幻觉率、一致性等质量指标
3. **监督可渐进调节**：人类审查比例可以在不重构的情况下调整

### 确定性骨架 + Agent 判断的分离架构

DocuSign 的 14 倍代码量减少是最有力的架构证据。图架构（LangChain/AutoGen 等）的问题在于：确定性流程控制（排序、错误处理、状态管理）和概率性 Agent 推理（研究、创作）被混在同一抽象层中。CrewAI Flows 的做法是将确定性部分用显式 Flow 定义，Agent 只部署在需要判断的位置。这种分离的价值不仅是代码简洁——更重要的是**调试定位**：当出问题时，你首先知道是流程逻辑错了还是 Agent 判断错了。

### "Intelligence is table stakes"的深层含义

原文反复强调智能是基准而非差异化因素，这指向一个重要趋势：随着基础模型能力趋同（GPT-4o-mini 已足够运行多数工作负载），竞争焦点从"谁的 Agent 更聪明"转向"谁的系统更可信赖"。信赖度来自：
- 可观测性（每个决策可追溯）
- 一致性（相同输入产生相同质量的输出）
- 可恢复性（出错时能定位和修复）

这三者都是工程问题，不是算法问题。

### 20 亿次执行的规模信号

CrewAI 处理 20 亿次工作流的数据量足以过滤掉小样本偏差。三个核心模式（信任梯度、架构分离、完整技术栈）在 PepsiCo、AB InBev、DocuSign 等不同行业中重复出现，说明这些不是特定场景的经验，而是 Agentic 系统规模化的通用规律。

## 实践启示

1. **从 100% 人类审查起步**：即使 Agent 输出质量高，也先让人类审查每个决策——这是建立信任的数据基础，不是对 Agent 能力的不信任
2. **将确定性流程从 Agent 推理中剥离**：排序、错误处理、状态管理用确定性代码实现，Agent 只负责需要判断的环节——这样出问题时能快速定位是流程 bug 还是 Agent 幻觉
3. **投资完整技术栈而非更聪明的模型**：可观测性、HITL 架构、K8s 部署、安全审查——这些"枯燥"的基础设施比模型升级更能加速从 demo 到生产
4. **设计信任度量机制**：定义质量指标（幻觉率、一致性分数），跟踪这些指标随执行次数的变化，用数据驱动审查比例的调整
5. **警惕图架构的复杂性陷阱**：多层嵌套的图/子图/状态对象看似灵活，实则在生产中制造调试黑洞——优先选择扁平的、显式的流程定义

## 相关实体

- [A Missing Layer In Agentic Systems](ch04/349-a-missing-layer-in-agentic-systems.html) — HITL 作为 Agentic 系统第三层的论述
- [Agentcore Harness](ch04/479-amazon-bedrock-agentcore-harness-ga-api-agent.html) — AgentCore 工程化实践
- [Agentops Operationalize Agentic Ai Amazon Bedrock](../ch11/156-amazon-bedrock.html) — AgentOps 可观测性实践
- [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) — 生产级 Agent 工程
- [Agent Deployment Strategy](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md) — Agent 部署策略
- [Agent Framework Comparison](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-framework-comparison.md) — Agent 框架对比
- [Multi Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md) — 多 Agent 编排
- [Ai Safety Governance](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-safety-governance.md) — AI 安全治理
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness 工程框架

---

