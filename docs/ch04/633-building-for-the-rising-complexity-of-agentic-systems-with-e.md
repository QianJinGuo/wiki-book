# Building for the Rising Complexity of Agentic Systems with Extreme Co-Design

## Ch04.633 Building for the Rising Complexity of Agentic Systems with Extreme Co-Design

> 📊 Level ⭐⭐⭐ | 14.0KB | `entities/nvidia-agentic-systems-extreme-co-design.md`

## 概述

NVIDIA 2026 年技术博客指出，生成式 AI 的第一章由「人类发请求、模型作响应」定义，第二章——**agentic 时代**——的本质截然不同：Agent 调用工具、生成子代理、在记忆中保留信息、管理自身上下文窗口，并自行判断任务完成时机。这种转变将 token 消耗量、上下文长度和延迟一并推向极高需求区域。

## 从 Chatbot 到 Agent 的演进

### 三种 AI 交互模式（按复杂度排序）

博客将 AI 交互模式划分为三个递进层级：

1. **标准 Chatbot**：线性交互——一次用户消息，一次模型响应，循环往复，行为高度可预测。
2. **Chat with Tools**（带工具的聊天）：有界可变交互——工具输出为输入序列引入不可预测性，但仍属于bounded范围。
3. **Agentic（链式高熵）**：结构化概率交互——模型自行决定调用哪些工具、以什么顺序调用、何时停止执行。

**核心洞察**：工具调用将工作负载从「线性可预测 + 概率性峰值」转变为「结构性概率」问题。

## Agentic 架构特性

### Primary / Sub-Agent 架构

标准 Agent/Sub-Agent 架构包含以下核心组件：

- **Primary Agent**：端到端负责整个任务，协调 Sub-Agent，通常运行在最高能力的模型上。
- **Sub-Agent**：处理窄范围子任务，自我管理上下文窗口，可运行在较小模型上，实现分工并行。
- **文件系统状态性（File System Statefulness）**：Agent 将记忆和工具输出写入文件，后续通过搜索或重读来复用。
- **摘要压缩（Summarization/Compaction）**：将上下文窗口压缩以腾出空间、降低费用。

### 真实 Trace：Claude Code 33 分钟编码会话

博客提供了一段真实的 Claude Code 编码轨迹数据（33 分钟），揭示了 Agentic 系统实际运行的极端资源消耗：

| 指标 | 数值 |
|---|---|
| 主 Agent turns | 58 次 |
| Sub-Agent 调用 | 225 次 |
| 总请求数 | 283 次 |
| 初始上下文窗口 | 15K tokens |
| 峰值上下文窗口 | 156K tokens |
| 压缩后上下文 | ~20K tokens |
| 主 Agent 前 40 turns 平均输入 | ~85K tokens |
| 压缩前累计处理输入 tokens | ~3.5M |

> [!info] 参见
> → [Claude Code 深层架构分析](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-deep-architecture-analysis.md) — Claude Code 编码轨迹数据与源码分析
> → [上下文管理 Agent 系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-management-agent-systems.md) — Agent 上下文管理核心机制

### Prompt Caching：系统级挑战

Prompt Caching（上下文缓存）是降低 Agentic 工作负载成本的关键机制：

- **95% 缓存命中率**：输入处理成本下降约 85%。
- **编码类 Agent**：实际缓存命中率可达 95%–98%。
- **无缓存成本**：相比之下约高出 6 倍。

博客特别强调：**Prompt Caching 是系统问题，而非仅仅是 API 特性**——它需要从系统层面进行设计和优化。上下文缓存涉及文件系统状态性、工具输出持久化、跨请求记忆复用等多个系统层面的协同设计。

## 核心性能挑战：延迟与吞吐的根本矛盾

Agentic 工作负载需要高交互性（低延迟），但这本质上会破坏吞吐量（throughput）。**没有任何单一处理器能同时解决所有需求**。

具体而言：

- **低延迟需求**：Agent 需要快速响应用户交互（如 Claude Code 的 33 分钟内 283 次请求）
- **高吞吐需求**：大规模部署需要高效利用硬件资源
- **长上下文需求**：156K token 峰值上下文需要快速访问和大内存带宽
- **成本压力**：无缓存情况下成本增加 6 倍，必须通过系统优化来降低

## Extreme Co-Design：NVIDIA 的解法思路

NVIDIA 提出的解法思路是 **Extreme Co-Design**（极端协同设计）：构建一个平台，使每个性能瓶颈都能映射到专用硬件，并通过统一系统进行编排。

### 硬件架构全景

Extreme Co-Design 涉及 NVIDIA 全栈硬件协同设计：

| 组件 | 在 Agentic 系统中的作用 |
|---|---|
| **Vera CPU** | 沙箱执行、工具调用编排、长上下文检索操作；88 个 Olympus 核心，1.2 TB/s 内存带宽 |
| **Rubin GPU** | 大规模推理的主力计算，提供 FP8 算力 |
| **GB200 NVL72** | 72 GPU NVLink domain，13.4 TB/s 聚合 HBM3e，解决大规模 MoE 推理 |
| **BlueField 4 DPU** | 网络和存储 I/O 卸载，释放 CPU/GPU 资源 |
| **Spectrum-X** | AI 原生网络，支持大规模多节点 Agent 部署 |
| **NVLink-C2C** | Vera 与 Rubin 统一内存互联，消除 CPU-GPU 数据传输瓶颈 |

> [!info] 参见
> → [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — NVIDIA 推理优化技术栈（Dynamo, TRT-LLM, Speculative Decoding）
> → [Cloud AI Infrastructure](https://github.com/QianJinGuo/wiki/blob/main/concepts/cloud-ai-infrastructure.md) — AI 原生网络与大规模部署技术

### 软件优化层

- **NVIDIA Dynamo**： disaggregated serving，将 prefill/decode 阶段分离到不同 GPU pool
- **NIXL（Inference Xfer Library）**：统一 KV cache 跨实例传输 API，跨越 HBM/DRAM/NVMe/分布式存储多种内存层
- **TRT-LLM WideEP**：专家并行优化，适用于 MoE 模型
- **Speculative Decoding**：加速推理延迟

### 关键设计原则

Extreme Co-Design 的核心思想是：
1. **专用硬件映射瓶颈**：每个性能瓶颈（延迟、吞吐、上下文长度）都有对应的专用硬件优化
2. **统一内存架构**：Vera 和 Rubin 共享统一内存，减少数据传输开销
3. **系统级协同优化**：从核心微架构到机架架构的全栈优化

这与 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中上下文管理层需要硬件支持的观点高度一致。

## 深度分析

### 1. Agentic 工作负载重新定义 AI 基础设施需求

Chatbot 到 Agentic 的演进不仅是应用层变化，而是计算范式的根本转变。Chatbot 是线性可预测的，适合批处理和静态优化；Agentic 是「结构性概率」问题，请求模式、上下文长度、工具调用序列在运行时才能确定。这意味着 AI 基础设施不能再按「一个模型服务所有请求」设计，必须为不确定性预留弹性。

### 2. 上下文带宽成为新型 I/O 瓶颈

Claude Code 33 分钟会话处理 3.5M 输入 tokens、峰值上下文 156K 的数据揭示了一个关键事实：Agentic 系统的核心瓶颈不是计算吞吐量，而是**上下文带宽**——如何在极短时间内加载、检索、写入大规模上下文。随着 Agent 自主性增强，上下文长度会持续增长，传统的 KV cache 架构将面临根本性挑战。

### 3. Prompt Caching 的高命中率证明 Agentic 工作负载具有可利用的结构规律

编码 Agent 实现 95-98% 缓存命中率，说明即便在看似高熵的 Agentic 场景中，工作负载仍具有显著的可预测性——工具调用模式、代码结构、文件路径都呈现局部性。这为系统级优化提供了依据：Prompt Caching 不是简单复用相同 prompt，而是需要构建能理解 Agent 工具调用语义的上下文索引和预取机制。

### 4. 延迟、吞吐、上下文长度构成不可能三角，硬件专业化是必然

没有任何单一处理器能同时优化延迟（交互性）、吞吐（成本效率）、上下文长度（复杂任务）三个维度，因为它们对硬件资源的需求相互矛盾。延迟敏感型任务需要高带宽和低功耗的近计算存储；高吞吐需要大规模并行；长上下文需要 HBM 容量和快速检索。这种不可能三角决定了 AI 基础设施必须走向专业化分工——每类瓶颈对应专用硬件单元。

### 5. 全栈协同设计是 Agentic 基础设施的架构方向

NVIDIA 的 Extreme Co-Design 不是单一芯片升级，而是从 Vera CPU（工具编排沙箱）到 Rubin GPU（推理计算）到 GB200 NVL72（大规模 MoE 服务）到 Spectrum-X（AI 原生网络）的全栈协同。这种架构代表了一种新思路：Agentic 系统的性能瓶颈分散在多个层次，没有任何一个层次能独立解决所有问题，必须在芯片级、节点级、机架级、系统级协同优化。

## 实践启示

### 1. 将 Prompt Caching 作为系统级架构决策，而非部署后优化

高缓存命中率（85% 成本降低）的代价是需要在系统设计初期就建立上下文持久化和复用机制。具体而言：在设计 Agent 记忆系统时，需要让工具输出可索引且可重放，而非仅存储最终结果；在构建 Agent 编排框架时，需要将工具调用结果写入共享文件系统而非仅保留在内存中，以确保跨请求上下文复用。

### 2. 使用 Disaggregated Serving 分离延迟敏感型和吞吐优化型请求

低延迟和高吞吐本质上是冲突的资源分配策略：低延迟需要即时响应和短队列；高吞吐需要批量处理和长队列。Disaggregated serving（NVIDIA Dynamo 的核心思路）通过将 prefill/decode 阶段分离到不同 GPU pool，让不同类型请求进入不同的优化路径。这意味着在架构设计时，需要为延迟敏感型请求（Agent 交互）和吞吐优化型请求（批量推理）分别设计独立的扩缩容和调度策略。

### 3. 在 Multi-Agent 架构中建立基于任务复杂度的模型分配策略

Primary/Sub-Agent 架构天然支持按任务复杂度分配不同能力的模型：复杂规划、协调、上下文管理交给 Primary Agent；窄范围子任务交给 Sub-Agent。但实践中需要设计明确的模型选择策略——基于任务类型、当前上下文长度、预估 token 消耗等维度动态决定哪个任务分发给哪个模型。目标是让 225 次 Sub-Agent 调用尽可能多地运行在比 Primary Agent 更小的模型上，以实现成本降低。

### 4. 重新定义 AI 基础设施团队的容量规划维度

传统 LLM 部署的容量规划以 QPS（每秒查询数）和模型参数量为核心指标。Agentic 场景下，上下文带宽和峰值并发上下文长度成为同等重要的规划维度。建议在容量规划中新增：最大并发 Agent 会话数、每个会话的峰值上下文 tokens、会话内平均工具调用次数。这些指标直接影响 Vera CPU（工具编排）和 NVLink-C2C（统一内存互联）的选型。

### 5. 评估或构建 Agent 平台时，将上下文管理层作为一等公民

NVIDIA 的 Extreme Co-Design 强调 Vera CPU 承担「长上下文检索操作」，NIXL 提供跨内存层的 KV cache 传输 API。这说明上下文管理不是模型推理的附属功能，而是需要独立优化和独立硬件支持的系统组件。在评估 Agent 平台或设计内部 Agent 基础设施时，需要将上下文存储、压缩、检索、传输作为专项技术课题对待，而非假设模型自带的能力足够使用。

## 行业观点与争议

> [!contradiction] 关于专用硬件 vs 通用云基础设施
> 业界对 Agentic 系统是否需要专用硬件存在争议：
> - **NVIDIA 立场**：Extreme Co-Design 是必要的，没有任何单一处理器能同时解决延迟、吞吐、上下文长度需求
> - **相反观点**：通用云基础设施通过软件优化可能达到类似效果，专用硬件成本过高

## 关键概念关联

-  — 上下文管理层硬件支持，延迟优化策略
-  — 真实 trace 数据对齐，sub-agent 调用模式
-  — Primary/Sub-Agent 上下文独立性设计
-  — NVIDIA 推理优化技术栈，MoE 专家并行
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md) — 记忆系统与上下文压缩机制

## 相关实体
- [Nvidia Extreme Co Design Agentic Systems](ch04/050-nvidia-extreme-co-design-agentic-systems.html)
- [Lightseek Tokenspeed](../ch01/1119-lightseek-tokenspeed.html)
- [Subagents 详解Claude Code 如何避免上下文污染 V2](../ch03/075-claude-code.html)
- [Amazon Bedrock Agentic Payments Guardrails](../ch11/152-amazon-bedrock.html)
- [Break The Context Window Barrier With Amazon Bedrock Agentcore](ch04/512-amazon-bedrock-agentcore.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/nvidia-gpu-acceleration.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nvidia-agentic-systems-extreme-co-design.md)

---

