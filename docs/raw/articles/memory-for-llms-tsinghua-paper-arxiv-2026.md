---
title: "Memory for Large Language Models（清华唐杰团队综述论文原文，arXiv pre-print）"
source_url: "file:///Users/jinguo/.hermes/cache/documents/doc_b0b9e50b51b8_Memory for Large Language Models.pdf"
author: Sining Zhoubian, Dan Zhang, Evgeny Kharlamov, Jie Tang（清华 / NUS / Bosch AI）
platform: PDF
ingested: 2026-08-13
slug: memory-for-llms-tsinghua-paper-arxiv-2026
sha256: 23d77ff221753fb3fda23ca19ac4a1f5ac1413ba3608d4e02e1494ec41400121
---

# Memory for Large Language Models

Sining Zhoubian（清华）, Dan Zhang（NUS）, Evgeny Kharlamov（Bosch AI）, Jie Tang（清华，IEEE Fellow）。PREPRINT，20 页。用户提供的论文原文 PDF（arXiv 一手源）。

## Abstract

Memory 已演化为 LLM 的基础架构维度：从计算的隐式副产品转变为显式、可控机制的光谱。本文提出系统化、架构中心的 LLM 记忆 taxonomy，沿三个正交轴刻画：**representation（隐式 vs 显式）/ update dynamics（离线 vs 在线）/ persistence（短期 vs 长期）**，并形式化记忆写入、路由、状态转移与整合的细粒度机制。统一视角阐明"计算耦合"与"独立可寻址"记忆的概念边界，弥合不同架构范式；并批判分析混合记忆架构、系统级效率权衡与多维评测方法论。

## I. Introduction

LLM 成功不仅来自 scaling laws（参数/数据/算力），还来自日益重要的架构维度——memory。历史上神经语言模型的记忆主要是隐式的：Transformer attention 提供受固定上下文窗口约束的 content-addressable working memory，但计算/存储开销随序列长度二次增长；稀疏注意力、SSM、混合架构扩展了上下文但引入性能权衡，且记忆仍与 forward computational graph 紧密耦合。

近期架构转变：越来越多的研究引入显式持久记忆机制（Figure 1）——Titans 和端到端 test-time training 支持部署期动态参数更新；Engram 等 lookup 架构把记忆存储与稠密计算解耦；Nested 多时间尺度更新策略模糊训练与推理边界；MoE 条件参数模块按输入上下文选择性激活参数子集，构成结构化条件记忆。记忆正从 scaling 的副产品转变为一等架构设计维度。

## II. A Taxonomy of Memory in LLMs

**Scope 澄清（关键限定）**：本文聚焦 **model-level 记忆机制**（在模型架构或其推理时动态中实例化的记忆），**排除 agent-level 或 prompt-based 记忆系统**（依赖外部编排或工程管线的记忆）。

三维正交轴：**representation**（存什么）、**update dynamics**（何时/如何更新）、**persistence**（存多久）。Taxonomy 不是刚性分类，而是揭示貌似不同方法间共同结构的概念框架。

### A. Representation: Implicit vs. Explicit Memory

判定标准：**记忆是否 endowed with 独立、可控的存储/检索接口**。

- **Implicit Memory**：前向计算的副产品，与内部动态紧密耦合，无显式 read/write/lookup 接口，通过计算图隐式访问。典型：RNN/线性注意力/SSM 的演化状态、Transformer 的 KV cache。注意：即使 KV cache 物化为显式张量，其访问语义由架构固定，缺乏独立寻址或更新控制——是瞬态计算状态而非独立存储模块。
- **Explicit Memory**：实例化为具有明确定义访问语义的独立存储组件，支持显式寻址、检索、更新操作（不可约化为标准前向计算或离线反向传播）。形式可为外部表、关联缓冲或集成进模型的专用记忆模块。**关键：显式记忆不限于非参数结构**——一些通过额外参数化模块（在推理时用专门规则训练/更新）实现。区分标准不是参数化形式，而是**是否被设计并作为记忆运行：清晰的 read/write 语义 + 可控更新策略**。
- **Scope**：不讨论预训练学到的静态模型参数（attention/MLP 权重），即使它们编码知识。

### B. Update Dynamics: Offline vs. Online Memory

与表征维度正交，同一类存储结构可兼具两种更新特性：
- **Offline**：仅预训练阶段梯度更新，推理固定（传统 MoE、早期 kNN-LM）。
- **Online**：推理中实时更新，持续学习核心能力（Mamba 循环状态、Titans 测试时梯度、HAM 门控缓存写入）。

**Table II：5 种细粒度更新规则**（不互斥，可组合）：

| Update Rule | 机制 | 代表 | 主要风险 |
|-------------|------|------|---------|
| Optimization-based writing | 记忆参数/快权重由显式目标最小化（训练或推理时） | TTT-E2E, Titans, In-Place TTT, Nested Learning | 漂移、不稳定、目标不匹配 |
| State-transition updates | 隐/循环状态由学习到的转移/增量规则/投影/滤波方程更新 | Mamba, Gated Delta Networks, Gated DeltaNet-2, Kaczmarz Linear Attention, Kalman Linear Attention | 压缩损失、状态干扰 |
| Signal-gated writing/routing | 惊讶/不确定性/预测误差/效用信号控制写入、缓存准入或昂贵记忆路径激活 | Titans, GDWM, AMOR, HAM | 校准、阈值敏感、延迟相关性 |
| Admission/eviction/consolidation | 决定哪些条目准入/保留/压缩/驱逐/重写 | StreamingLLM, RATTENTION, HAM, Bottlenecked Transformers | 不可逆损失、检索偏差 |
| Objective-induced/structural updates | 辅助目标/架构调度/层替换/离线构建塑造记忆行为 | Engram, MoE, Priming, Next-Latent Prediction | 刚性、目标不匹配、测试时适应性有限 |

### C. Persistence: Short-Term vs. Long-Term Memory

第三个轴：存储信息能继续影响计算的有效时间跨度——由物理是否保留 + 存储粒度决定。

### D. Positioning Relative to Memory-Centered Surveys

与既有记忆中心综述的定位对比（论文专门讨论自身 taxonomy 与 agent 级记忆综述的边界）。

## III. Implicit Memory via Computation Dynamics

### A. Attention as Implicit Memory
标准 Transformer 逐 token 生成 KV 张量；StreamingLLM/Longformer 用滑动窗口/稀疏注意力控制规模；优点是与原生计算无缝融合，缺点存储随序列线性上涨、会话结束销毁。

### B. Sparse, Selective, and Structured Memory
MoBA、NSA、RATTENTION 等：不改变 KV 存储本质，仅通过路由/门控筛选参与注意力的 token，属访问优化而非新增独立存储模块。

### C. Recurrent Sequence Memory
Mamba、RWKV、Kalman 线性注意力、Gated DeltaNet 系列：全部历史压缩为固定尺寸隐藏状态，O(n) 线性复杂度，突破注意力二次方瓶颈；短板是压缩丢失细粒度细节、长期历史状态干扰/信息混淆。

### D. Limitations of Implicit Memory
容量受硬件/窗口限制、无自主读写控制、无法跨会话留存信息，天生不适合长期个性化 Agent 场景。

## IV. Explicit Memory via Addressable and Persistent Mechanisms

### A. Parameterized External Memory Modules（TTT 路线）
Titans、TTT-E2E、In-Place TTT、MEMORYLLM：骨干之外新增专用可更新参数，推理时靠梯度/误差信号实时更新，只改记忆模块权重、冻结主干参数规避灾难性遗忘——"可实时擦写的专用内存"。

### B. Lookup-Based and Retrieval-Oriented Memory
kNN-LM、Engram、PlugLM、ExplicitLM：哈希槽/可编辑向量库/独立 KV 存储池，离线构建知识库、推理时相似度检索；容量无限扩容、与主干算力解耦，是 RAG 与原生模型融合的关键桥梁。

### C. Conditional Parameter Memory and MoE
Switch Transformer、Mixtral、DeepSeek-MoE：每个专家子网存储一类领域知识，路由按输入选择性激活——"参数里的分目录知识库"；仅在训练阶段更新（离线记忆）。

### D. Multi-Timescale and Nested Update Mechanisms
Nested Learning 等：快慢两套参数更新周期，高频模块存短期对话细节、低频模块沉淀长期经验，平衡可塑性（学新）与稳定性（不忘旧）。

### E. Structural Implications and Risks（解读版缺失的结构风险分析）
1. **Capacity Growth and Memory Scaling**：显式记忆容量可随参数/槽位/数据存储条目扩展（隐式记忆受隐藏状态维度与上下文窗口约束），但扩容带来计算/存储成本上升与边际收益递减，需要索引/剪枝/压缩机制。
2. **Interference and Memory Drift**：持久在线存储意味着新信息与旧内容共存——无规约则干扰、覆盖有用信号或放大噪声；参数化模块测试时快速适应有破坏已学表征的风险；lookup 系统中陈旧/冗余条目偏置检索。多时间尺度策略部分缓解，**stability-plasticity tradeoff 仍是核心未决张力**。
3. **Optimization and Convergence Challenges**：显式记忆引入额外目标/更新循环（惊讶驱动学习规则、辅助损失），可能不共享标准预训练的优化保证；频繁测试时更新累积偏差，嵌套更新循环产生复合优化动力学。

## V. Model-Level Memory Architectures: Design, Efficiency, and Evaluation

### A. Hybrid Memory Architectures（混合记忆架构）
1. **层间交替注意力+SSM**：Samba、Jamba/Jamba-1.5（交替 Mamba 与滑动注意力）、Kimi Linear（3:1 固定配比 KDA 循环单元+多头隐注意力）、LightTransfer（替换部分层为循环单元免重训）。静态固定比例、无动态调度。
2. **自适应混合记忆路由**：AMOR（后置注意力精炼，熵超阈值才启动注意力）、HAM（预测误差互补缓存，难拟合条目写入高保真 KV）。
3. **隐式短时+显式长期双体系**：Titans、Hydra（TTT 模型核心），底层 KV/滑动窗口管本轮上下文、顶层独立可更新参数/哈希存储池跨轮沉淀。
4. **多时间尺度时序混合**：TTT-E2E 批量式更新 vs Nested Learning 多嵌套循环——记忆层级（激活状态 token 级/显式模块交互或批次级/主干冻结或缓慢适配）。
5. **多组件模块化设计**：Hydra（结构化状态空间主干+稀疏全局注意力+MoE 路由+双工作区+事实记忆）、Expansion Span（SSM-注意力混合体中引入跨度扩展注意力）。

### B. Memory Management and Efficiency
KV 缓存压缩（向量量化/低秩投影）、PagedAttention（分页注意力碎片复用）、Bottlenecked Transformer 记忆合并、循环状态快照缓存（分段保存 SSM 状态）。

### C. Evaluation of Memory Systems
记忆不可直接观测，需专门诊断任务隔离特定记忆能力：
1. **长上下文检索**：NIAH（distractor 上下文找目标事实）、LongBench（多文档 QA/摘要/推理聚合）、RULER/L-Eval（随上下文增长的退化曲线，揭示 attention dilution 与 recency bias）。
2. **结构化依赖与推理**：SCROLLS、NarrativeQA——跨长文档整合分散信息、维持连贯中间表征；混合/SSM 模型因压缩状态传播更稳定，但可能牺牲细粒度 token 级召回。
3. **遗忘/干扰/稳定性**：检索模块、梯度更新、条件参数记忆引入干扰与稳定性问题（显式在线记忆的持续更新后遗忘程度）。
4. **效率权衡**：同召回精度下的显存/延迟，区分"真记忆提升"与"单纯扩大上下文窗口"。

## VI. Open Challenges and Future Directions

1. **Toward a Unified Theory of Memory in LLMs**：现有机制按操作方式分类（注意力/循环/检索/参数化），缺乏通用数学抽象，无法量化记忆容量/压缩损耗/干扰程度。
2. **Continual and Lifelong Parametric Memory**：在线更新漂移/灾难性遗忘，分层隔离记忆参数实现无遗忘持续学习——个性化 Agent 最大瓶颈。
3. **Robust and Interpretable Update Rules**：门控/梯度更新黑盒化，无法人为干预"记住/遗忘"，缺可逆可诊断的记忆写入机制。
4. **Adaptive Memory Allocation and Control**：混合架构多静态设计，需智能控制器按输入内容/任务类型自动分配注意力/循环/检索资源。
5. **Hardware–Algorithm Co-Design for Scalable Memory**：显存带宽/存储层级成瓶颈，未来模型可能集成分层记忆架构，需芯片/加速器底层适配。
6. **Principled and Multi-Dimensional Memory Evaluation**：现有基准碎片化，缺同时衡量容量/保真度/持久度/效率的统一标准。

## VII. Conclusion

记忆架构将成为下一代 LLM 核心分水岭。三维分类框架把长上下文、测试时训练、检索增强、MoE 四大赛道的研究打通，提供统一的分析/对比/创新工具。传统隐式记忆解决长文本推理效率但做不到持续积累经验；显式持久记忆让 AI 真正具备"学习、沉淀、复用过往交互经验"的能力，是通用 Agent、个性化数字助手、终身学习系统的底层底座。
