---
source_url: https://arxiv.org/abs/2608.21156
ingested: 2026-08-26
sha256: 61db534055739989272599c45dd0819770efb6b4d5166c2da3757926b3b0b276
title: "Graph Engineering in the Era of LLM Agents: From Individual Intelligence to System Intelligence"
author: Yuyuan Feng, Zhishang Xiang, Chaobin Yang, Qichao Ma, et al.（吉林大学/人大等 15 机构）
source: arXiv 一手论文 PDF（用户提供）
score_v: 8
score_c: 8
score_vc: 64
decision: entity
---

# Graph Engineering in the Era of LLM Agents: From Individual Intelligence to System Intelligence

> 15 家机构联合综述（吉林大学 Zhihong Zhang/Jinsong Su/Qinggang Zhang 等主导，63 页）：提出 Graph Engineering 作为构建下一代智能体系统的范式，从个体智能走向系统智能，并以 Ontology Engineering 作为未来演进方向。用户提供论文原文 PDF（一手源）。

## Abstract / 核心命题
LLM 已从语言生成模型演化为能解决复杂长程任务的自主智能体，伴随一系列涌现工程范式：Prompt Engineering（激发模型能力）、Context Engineering（管理信息访问）、Harness Engineering（组织外部工具与资源）、Loop Engineering（持续反思与自我改进）。但真实世界任务复杂度上升后，个体智能的根本局限浮现：许多任务天然需要异构专业知识、相互依赖的子任务、并行执行、独立验证和持久状态，这些需求超出任何单个智能体的组织能力。单纯增强单个智能体的能力或上下文无法解决这种架构失配。智能必须分布到多个专职智能体，并在系统层面组织——即**系统智能（System Intelligence）**：智能体系统把多个智能组件组织成协调一致、自适应、追求共享目标的整体的能力。实现系统智能不止是增加智能体数量，还需要显式结构来组织工作、协调异构智能体、维护演化的执行状态。Graph Engineering 不同于此前主要优化个体交互或智能体级行为的范式，聚焦于构建显式、动态、可演化的图结构来组织任务、智能体与运行状态。

## 一、三层智能：模型智能 → 个体智能 → 系统智能
### 模型智能（Model Intelligence）
第一层是让模型本身变强，主要靠两条路：基础模型（Foundation Models，训练/规模/SFT/RL）建立模型智能；Prompt 与 Context Engineering 激发和条件化模型智能。但这层有天花板：它无法跨调用保持状态、无法真正操作外部世界、无法持续接受环境反馈。

### 个体智能（Individual Intelligence）
第二层是把模型变成一个能持续干活的主体：Agent = Loop（LLM + Harness）。Harness 给模型接上工具、记忆与执行环境，Loop 组织成"计划-行动-观察-验证-调整"的持续闭环。两者合起来，模型从"回答器"变成"能自主追目标的个体智能体"，如 Claude Code、Codex 这类编程智能体。

### 系统智能（System Intelligence）
真实世界复杂任务的三个硬需求，任何单个智能体都满足不了：异构专业知识与专业分工、并行执行与独立验证、跨长程执行保持的持久状态。硬塞更多参数、更长上下文都无法解决。出路是把智能分散到多个专职智能体，在系统层面组织起来——这就是系统智能。为了让这支"AI 军团"高效准确沟通协作，论文提出未来演进方向：**Ontology Engineering（本体工程）**——用共享、机器可解释的实体/关系/约束模型统一目标、能力、证据与状态的定义，让图既能连接起来，也能被一致地解读、复用和进化。

## 二、图工程（Graph Engineering）
系统智能的核心是显式地管理和组织三类关系，而图（Graph）是表达关系的天然结构。图工程用"图"来显式、动态地表示和管理智能体系统中的所有关键元素及其关系。图工程通过三个核心部分把抽象的系统智能变成可执行的现实：

### 维度一：任务组织（做什么）
系统拿到模糊目标（如"写一个能分析股票数据的网站"），先做任务组织，把宏大目标拆成可调度、可执行、可修改的子任务图。包含目标分解（Goal Decomposition）和工作流优化（Workflow Optimization）。任务组织把隐性思考变成显式结构，让什么能并行、什么必须等、怎么验证都一目了然、可以优化。

### 维度二：智能体协同（谁来做）
把任务合理地分给合适的智能体，组织协作关系。包含智能体能力建模（Agent Capability Modeling）、智能体团队组织（Agent Team Organization）、多智能体通信（Multi-agent Communication）。团队组织是相对稳定的"谁负责什么"，通信图是运行时动态的"此刻谁该跟谁说话"。

### 维度三：运行时状态管理（做得如何）
整个系统智能中最关键、也最容易被忽视的部分。复杂任务执行很久难免出错，状态管理就是系统的记忆和容错机制。包含状态记录（State Recording）、故障定位（Fault Localization）、失败恢复（Failure Recovery）。

### 系统演化（System Evolution）
跨应用领域，图工程的成熟度不均：工作组织与智能体团队工程已经很常见（分解目标、分配专职角色、调度并行工作、定义通信/依赖结构）；显式运行时状态管理也越来越可见（检查点、长程患者记录、共享任务板、事件流、实验证据、演化环境）；但持久系统演化（Persistent System Evolution）仍然罕见——多数系统只在预定组织结构内适应执行，而非永久性修订组织本身。

## 三、本体工程（Ontology Engineering）：下一代系统智能的未来方向
### 图工程的局限
图让关系变得显式，却保证不了系统中各方对同一概念理解一致。图工程基于系统智能的局限：缺少统一语义，多智能体协作面临严重语义障碍（同一概念不同表示、目标/证据/状态定义不一致、沟通歧义）。

### 目标形成与价值对齐（Goal Formation and Value Alignment）
让系统在共享目标上对齐价值，避免各智能体各自追逐偏离系统目标的方向。

### 共享语义与世界锚定（Shared Semantics and World Grounding）
本体工程用共享、机器可解释的实体/关系/约束模型统一目标、能力、证据与状态的定义。一个本体（Ontology）精确定义领域内三件事：类/实体、属性/关系、约束/公理。为了让机器能读懂并推理这些定义，本体用 RDF、RDFS、OWL 等语言编写——让本体不仅是文档，更是可执行的逻辑模型。它确保所有智能体对目标、证据、任务完成等核心概念有完全一致的理解，避免沟通歧义和认知偏差。

### 图工程 vs 本体工程的区别
图工程管"连接关系"（谁连谁），本体工程管"概念一致性"（这些连接在语义上意味着什么、如何被一致解读）。图让关系显式，本体让含义一致。两者互补：图工程构建系统骨架，本体工程提供语义地基。

### 衡量系统智能（Measuring System Intelligence）
系统智能需要新的评估原则：评估对象从单模型/单智能体扩展到多智能体系统的协调质量、任务完成度、状态一致性、演化能力。

## 四、基准、数据集与评估
论文按三层智能组织评估体系：模型智能（Model Intelligence）、个体智能（Individual Intelligence）、系统智能（System Intelligence）各自的基准与评测原则，并提出评估的开放挑战。

## 五、开源库与工程生态
梳理三层智能对应的开源库与工程生态，提出工程生态中的开放挑战。

## 六、应用（Applications of Graph Engineering）
七类应用领域：①软件工程与 IT 运维；②科学发现与实验室自动化；③医疗健康与临床决策支持；④企业工作流与数字组织；⑤通用数字智能体与个人自动化；⑥社会与经济模拟；⑦跨领域发现。跨域发现：图工程成熟度不均，工作组织/智能体团队工程常见，显式运行时状态管理渐增，但持久系统演化仍罕见。

## 结论
Graph Engineering 是连接个体智能与系统智能的桥梁，用显式图结构组织任务、智能体与运行状态；Ontology Engineering 是下一代系统智能的未来方向，为多智能体系统提供统一、可推理、可演化的语义地基。模型能力决定个体智能上限，图工程决定系统协同质量，本体工程决定系统语义一致性。
