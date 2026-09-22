# 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）

> 📊 Level ⭐⭐⭐⭐⭐ | 38.3KB

## 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践

> **作者**：望陶 / 太业 / 石木，阿里云云原生，2026-06-02
> **核心命题**：**AI Agent 规模化落地带来"执行黑盒、行为难追溯、成本难度量"三大难题**。阿里云基于 OTel 标准，面向 **Coding Agent / 个人通用助理 / 框架型 Agent**，推出 **LoongSuite Pilot、插件及探针**等无侵入采集方案，让 Agent 实现"**可看见、可分析、可审计、可治理**"。

## 系列定位

本文是 **LoongSuite 系列应用层姊妹篇**：

| 维度 | 已有 `loongsuite-genai-可观测语义规范` | 本文 |
|------|--------------------------|------|
| **层面** | **语义规范层**（OTel SemConv + LoongSuite 三大增强） | **数据采集应用层**（Pilot 端侧平台 + 3 类 Agent 适配） |
| **核心对象** | Entry Span / Step Span / Skill 语义 / Token 级推理 | Pilot 平台架构 + 3 类 Agent 形态 + 4 大观测审计能力 |
| **解决问题** | 数据如何标准化 | 数据如何**采集 + 落地应用** |

## 2. 背景：3 大核心挑战

**AI Agent 规模化落地带来三大难题**：

1. **执行黑盒**——Agent 内部决策链路不可见
2. **行为难追溯**——Token 消耗、工具调用、Skill 执行无法归因
3. **成本难度量**——大模型 Token 消耗是主要成本来源，多轮迭代和工具调用**指数级放大消耗**。若缺少按 Agent / 用户 / 任务维度的精细化成本拆分，企业将无法开展预算管控与投入产出评估

## 3. 3 大 Agent 形态 + 阿里云对应方案

### 3.1 Coding Agent：LoongSuite Pilot 端侧轻量数据采集平台

**核心定位**：**端侧（sidecar）轻量数据采集**，无侵入集成到 Coding Agent。

**核心优势**：
- 轻量级 sidecar 部署
- 标准化数据采集（OTel 协议）
- 与 Coding Agent 工具解耦

**已支持的 Coding Agent 及覆盖能力**：
- Claude Code
- Qoder / QoderWork
- Codex
- 等多个主流 Coding Agent

### 3.2 个人通用助理：一行命令接入完整观测和审计

**设计理念**：**一行命令**完成 Agent 接入 → 立即获得完整观测和审计能力。

**Span 语义模型**：
- 在 Agent 调用入口处自动创建 Span
- 还原模型和用户的原始输入和输出
- 形成完整对话历史

**与内置观测的本质差异**：

| 维度 | 内置观测 | LoongSuite 增强 |
|------|---------|---------------|
| **数据模型** | 仅基础 LLM/Agent Span | **Entry Span + Step Span + Skill 语义** 三层结构 |
| **可观测粒度** | 单个调用 | **AGENT 决策 → STEP 推理 → LLM 调用 → TOOL 执行** 全链路 |
| **业务归因** | 无法定位功能域 | **Skill 维度 + Token 成本拆分** |
| **安全审计** | 缺失 | **工具调用审计 + 高风险会话追溯** |

### 3.3 高低代码框架 Agent：LoongSuite Python Agent 零代码探针插桩

**快速开始**：

```python
from loongsuite.agent import LoongSuiteAgent
# 零代码探针自动插桩
agent = LoongSuiteAgent()
```

**框架覆盖**：
- LangChain
- LlamaIndex
- LangGraph
- Dify / Coze 等低代码平台
- 自研 Agent 框架

**自动识别的 Span 类型**（覆盖 Agent 全生命周期）：

- **AGENT Span**——Agent 决策入口
- **STEP Span**——ReAct 迭代步骤
- **LLM Span**——大模型调用
- **TOOL Span**——工具执行
- **SKILL Span**——业务功能域（vía `gen_ai.skill.*` 属性组）
- **MEMORY Span**——记忆读写
- **SESSION Span**——多轮会话追踪

## 4. 4 大观测审计能力

### 4.1 全链路调用链视图

**核心能力**：
- AGENT 决策 → STEP 推理 → LLM 调用 → TOOL 执行，**层级关系一目了然**
- 多轮 ReAct 复杂任务：**Step Span 快速定位到哪一轮迭代出现问题**，再深入到该轮内的 LLM/Tool Span 分析根因
- 类似传统微服务的 Trace 体验，但专门为 Agent 多轮迭代设计

### 4.2 Token 消耗与成本追踪

**核心能力**：
- 按 Agent / 用户 / 任务维度**精细化成本拆分**
- Token 级推理观测（vLLM / SGLang / TensorRT-LLM 引擎）
- 每个 Token 的调度时间 + 实际执行时间 + 用户感知总耗时
- Batch 总请求数 / 总 Token 数 → 决定 Token 生成耗时

**价值**：让企业能开展**预算管控与投入产出评估**。

### 4.3 会话与多轮对话追踪

**核心能力**：
- 完整 Session 生命周期追踪
- 多轮对话上下文传递可视化
- Entry Span 还原模型和用户原始输入/输出
- 不受 System Prompt 或框架 Prompt 干扰

### 4.4 工具调用审计

**4 大行为分析大盘**：

1. **行为分析大盘**——整体 Agent 行为概览
2. **工具调用分布**——哪些工具被调用最多
3. **安全审计总览**——整体安全状态
4. **高风险会话追溯**——按风险等级钻取问题会话

**典型安全审计能力**：
- 检测异常工具调用（如：访问未授权数据库、删除生产文件）
- 提示词注入检测（识别恶意指令）
- 数据外泄检测（敏感信息流向异常出口）
- 高风险会话标记 + 完整回放

## 5. 在社区标准之上的扩展

### 5.1 为什么需要扩展

**OTel GenAI SemConv 已覆盖**：
- Agent、LLM、Tool 等基础 Span 类型

**但缺失**：
- Skill 这一**介于 Agent 和 Tool 之间的业务功能域**
- 多轮 ReAct 的层级化表达
- Token 级别的推理观测

### 5.2 三大核心扩展

#### 扩展一：Entry Span 与 Step Span —— 让复杂 Agent 调用链可读

**问题**：在 AI Agent 执行长程任务时，执行逻辑会包含多轮工具调用和模型调用，单个 Trace 中可包含**成百上千个 Span**，导致同一链路中 Span 展示极其冗长，调用链轨迹难以清晰观测。

**Entry Span**：
- 在 Agent 调用入口处创建
- 还原模型和用户的原始输入和输出
- 形成对话历史
- 确保下游任务处理的数据**不受 System Prompt 或框架 Prompt 干扰**

**Step Span**：
- 代表 Agent 在每次 ReAct 过程中的层次化表达
- 每次 ReAct 包含"**反思 → 工具调用 → 模型调用**"的循环
- 排查问题采用 **Top-down 方式**：先定位哪一轮 ReAct，再深入分析该轮中哪一步出错

#### 扩展二：Skill 语义 —— 让业务功能域可观测

**问题**：在电商购物助手等 Agent 场景中，用户的每条指令由 AI Agent 理解意图后**路由到对应的 Skill 完成执行**，Skill 是业务功能的最小可复用单元。OTel GenAI 缺少对 Skill 这一编排单元的业务功能聚合层抽象。

**3 个核心痛点**：
- **无法归因到功能域**——性能抖动时只能看到一堆 `execute_tool` 和 `inference` Span
- **无法统计 Skill 健康指标**——缺少 P99 延迟、成功率、调用频率
- **多 Skill 并发时链路混淆**——不同 Skill 的 LLM/Tool Span 在 Trace 树中无法区分归属

**LoongSuite 方案**：
- 新增 `gen_ai.skill.*` 属性组，标识 Skill 的身份与版本信息
- 当前阶段附着在已有的 `execute_tool` Span 上，**无需引入新 Span 类型即可快速落地**
- 同时落地独立 `invoke_skill` Span 方案，并向 OTel 社区提交了提案

#### 扩展三：Token 级推理观测

**问题**：性能异常往往源于**某些 Token 生成慢**（大概率是其他请求并发干扰导致），精度异常（复读、答非所问、乱码）则从某个异常 Token 开始持续出错。

**Token 性能采集**：
- 每个请求的每个 Token 粒度采集进入迭代和退出迭代的时间戳
- 推演每个 Token 的**调度时间 + 实际执行时间 + 用户感知总耗时**
- Batch 的总请求数（特别是总 Token 数）刻画批处理负载

**Token 精度采集**：
- 每个 Token 粒度采集其对应候选 Top-K Token 的概率分布
- 通过分布判断模型输出质量

**产出**："**引擎显微镜**"产品，提供引擎并发与 Token 级别的推理引擎深度观测能力。

### 5.3 工程化落地：GenAI Utils

**工程挑战**：
- 每个 GenAI 框架插桩库都需要实现完整的遥测采集逻辑
- 不同框架插桩间逻辑高度重复
- 语义规范迭代升级时每个插桩库各自维护一套实现，**升级成本成倍增长**

**GenAI Utils 整体架构**（"**分层解耦、统一收口**"）：

- **插桩层只做数据提取**——各框架插桩库通过 Hook/Monkey-Patch 拦截框架调用，填充数据到 Invocation 数据对象，**不直接操作 OTel API**
- **GenAI Utils 统一收口遥测输出**——所有 Span 创建、属性挂载、Metrics 记录、Event 发送、Context 管理均由 `ExtendedTelemetryHandler` 内部完成

**价值**：插桩库与规范升级**解耦**。

## 深度分析

### 1. OTel SemConv 扩展路径：从社区标准到阿里云自定义规范

阿里云的 LoongSuite GenAI SemConv 扩展路径代表了企业级 AI 可观测性的典型演进模式：先深度参与社区标准（OTel GenAI SemConv），再基于业务场景做差异化扩展。

社区标准覆盖了 Agent、LLM、Tool 等基础 Span 类型，但**缺失三个关键层次**：

- **Skill 层**——介于 Agent 和 Tool 之间，是业务功能的最小可复用单元，但在 OTel 语义模型中没有对应抽象
- **多轮迭代表达层**——ReAct 范式下的层级化表达，单个 Span 无法承载多轮循环的语义
- **Token 推理层**——社区仅关注调用级别的指标，Token 粒度的调度时间与执行时间拆分是引擎层优化的必要数据

阿里云的策略是**以属性扩展为主、Span 类型扩展为辅**：用 `gen_ai.skill.*` 属性组补充 Skill 语义，用 Entry Span + Step Span 的嵌套结构表达多轮迭代，用 Token 级时间戳解决推理粒度问题。这一策略的优势在于**向后兼容**——不需要修改 OTel 核心协议，现有的 Backend 系统（如 Jaeger、Zipkin、SLS）均可直接消费扩展后的数据。

值得注意的是，阿里云已将 `invoke_skill` Span 提案提交至 OTel 社区，这意味着 LoongSuite 的扩展方案有可能成为未来社区标准的一部分，具有较强的示范意义。

### 2. 三层 Span 结构的设计逻辑：Entry Span 的元数据归集价值

Entry Span 的设计是整个 LoongSuite 可观测架构中最具巧思的部分。它在 Agent 调用入口处创建，核心目标是**还原模型和用户的原始输入和输出**，形成完整的对话历史，并确保下游任务处理的数据不受 System Prompt 或框架 Prompt 的干扰。

这一设计的深层价值在于**上下文隔离与归因**。在真实的 Agent 应用中，用户输入往往会经过预处理（Prompt 模板注入、上下文注入），而 System Prompt 更是完全不透明的传统黑盒。当性能问题出现时，运维人员需要能够区分：**问题根源是用户原始输入导致的，还是框架 Prompt 注入导致的**。Entry Span 通过保留原始输入/输出的快照，使得这种归因成为可能。

Step Span 则对应每一次 ReAct 循环，其中包含"反思 → 工具调用 → 模型调用"的完整子循环。这种层级化设计的精妙之处在于：**它将一个复杂的多轮交互拆解为可独立分析的原子单元**。当 Agent 执行一个需要 50 轮 ReAct 的任务时，如果最终结果出错，运维人员可以通过 Step Span 快速定位到第几轮出错，再深入该轮的 LLM/Tool Span 找到根因。

这种 Top-down 的排查路径，与微服务架构中通过 Trace 定位问题的体验高度一致，但针对 Agent 的多轮迭代特性做了专门优化。

### 3. 三大采集方案的差异化架构：sidecar vs 插件 vs 零代码探针

阿里云针对三类不同 Agent 形态采用了三种不同的采集架构，这种差异化设计反映了深刻的工程洞察：

**Coding Agent（Claude Code/Qoder/Codex）**采用**端侧 sidecar 部署**。这类 Agent 的特点是工具链复杂、与 IDE 环境深度绑定，且用户对性能开销极为敏感。Sidecar 模式的优势在于与 Agent 工具解耦、轻量级、低侵入，但挑战在于需要覆盖多种不同的 Coding Agent 的通信协议。阿里云的 Pilot 平台通过标准化 OTel 协议统一接入，意味着无论用户使用哪种 Coding Agent，数据都能以统一格式流向后台。

**个人通用助理**采用**一行命令接入**的插件模式。这类 Agent 通常由最终用户直接使用（如 AI 助手类应用），对可观测性的需求在于成本追踪和行为审计。Entry Span + Step Span + Skill 语义的三层结构在这里的价值最为显著——它使得企业能够按 Skill 维度拆分成本，同时保留完整的安全审计能力。

**框架型 Agent（LangChain/LangGraph/Dify）**采用**零代码探针插桩**。这类 Agent 的特点是基于成熟的中间件框架构建，插桩逻辑可以通过框架的 Hook/Monkey-Patch 实现，无需修改业务代码。LoongSuite Python Agent 的零代码设计意味着用户只需导入 `loongsuite.agent` 包即可获得完整的可观测能力，这大幅降低了采纳门槛。

三种模式的共性在于**数据模型的统一**：无论采集路径如何不同，最终输出的 Span 类型和属性遵循统一的 LoongSuite SemConv 规范。这是实现端到端可观测的基础。

### 4. 安全审计作为企业级采纳门槛：高风险会话追溯的工程实现

文章中提到的安全审计能力——检测异常工具调用、提示词注入、数据外泄——并非简单的日志记录功能，而是需要与企业的安全基础设施深度集成的能力。

高风险会话追溯的工程实现包含几个关键要素：

**实时检测层**：通过分析工具调用模式（如访问未授权数据库、删除生产文件）实时标记风险会话。这需要具备对工具调用语义的深度理解能力，而不仅仅是基于规则的关键字匹配。

**历史回放层**：高风险会话标记后，需要支持完整回放。这意味着所有 Span 数据需要被持久化存储，且需要支持基于时间线的会话重建。

**多级钻取**：从整体安全状态 → 问题类型 → 具体会话 → 完整 Trace 的四级钻取路径，使得安全团队能够从宏观到微观地分析问题。

这套体系的核心价值在于**将 AI Agent 的不确定性转化为可管理的风险**。当企业能够在执行过程中实时检测异常、在问题发生后完整回溯时，AI Agent 的采纳风险将大幅降低。

### 5. GenAI Utils 的工程架构：分层解耦与统一收口

GenAI Utils 的"分层解耦、统一收口"架构是整篇文章中最具工程借鉴价值的部分。

传统方案中，每个框架插桩库（如 LangChain 插桩、LlamaIndex 插桩）都需要独立实现完整的遥测采集逻辑，包括 Span 创建、属性填充、Metrics 记录、Event 发送、Context 传播。这种方式的缺点是：

- **重复开发**：相同逻辑在多个插桩库中重复实现
- **升级割裂**：语义规范升级时，每个插桩库需要单独维护，升级成本随插桩库数量线性增长
- **质量不一**：不同团队实现的插桩库，可观测数据的质量和一致性难以保证

LoongSuite 的解法是**引入一个统一的遥测处理中心（ExtendedTelemetryHandler）**，所有插桩库只负责数据提取（通过 Hook/Monkey-Patch 拦截框架调用，填充 Invocation 数据对象），不直接操作 OTel API。所有 Span 创建、属性挂载、Metrics 记录、Event 发送、Context 管理均由 GenAI Utils 内部完成。

这一架构的优势在于：**插桩库与规范升级解耦**。当 LoongSuite SemConv 规范迭代时，只需要更新 GenAI Utils 一个地方，所有插桩库自动获得新版本的遥测能力，而无需逐个修改。

## 实践启示

### 1. 建立 Agent 可观测的分层数据模型：Entry Span → Step Span → Skill 语义

企业在构建 Agent 可观测体系时，应优先参考 LoongSuite 的三层 Span 结构设计。

- **Entry Span** 确保原始输入/输出可追溯，是成本归因和安全审计的基础
- **Step Span** 将多轮 ReAct 拆解为可独立分析的原子单元，使得复杂任务的根因分析成为可能
- **Skill 语义** 通过 `gen_ai.skill.*` 属性组将业务功能域与底层技术Span 关联，解决"性能抖动时只知道执行了工具，不知道是哪个业务功能在受影响"的问题

即使是自研 Agent 框架，也应尽早规划这一分层模型，因为后续迁移成本远高于初始设计的复杂度。

### 2. 用 OTel 属性扩展而非 Span 类型扩展的方式引入自定义语义

阿里云的扩展策略表明，**属性扩展是比 Span 类型扩展更优的路径**。

原因有三：

- **兼容性**：现有 OTel Backend（Jaeger、Zipkin、SLS）无需任何修改即可消费扩展属性
- **灵活性**：同一 Span 类型上可以附着多个属性组，表达不同维度的语义
- **标准化**：当社区接受提案后，属性可以平滑迁移为标准 Span 类型

建议企业先以 `gen_ai.*` 自定义属性组的方式引入内部扩展，同时积极参与 OTel 社区的标准制定，推动自定义扩展成为社区标准。

### 3. Coding Agent 采纳可观测方案时优先考虑 sidecar 模式

对于已经在使用或计划使用 Claude Code、Qoder、Codex 等 Coding Agent 的团队，sidecar 模式是优先选项。

sidecar 模式的核心优势在于**与 Agent 工具解耦**——不依赖于特定 Coding Agent 的内部实现，即使 Coding Agent 本身版本升级，只要通信协议不变，数据采集就能继续工作。这与直接在内核层插桩的方式相比，维护成本更低。

Pilot 平台的 OTel 标准化输出意味着企业可以将 Coding Agent 的执行数据与现有的可观测基础设施（APM、日志、Metrics）无缝打通，实现真正的全链路可观测。

### 4. 安全审计需前置到 Agent 执行层，而非仅做事后回放

安全审计能力不应仅停留在"问题发生后完整回放"阶段，而应具备**实时检测与阻断**能力。

具体建议：

- 在工具调用审计中，对高风险操作（如文件删除、生产数据库访问）实施实时告警或二级确认机制
- 对提示词注入检测，需要能够识别恶意指令模式，并在执行前进行拦截
- 数据外泄检测需要与企业的 DLP（Data Loss Prevention）系统集成，监控敏感信息流向

高风险会话追溯的价值不仅在于事后分析，更在于形成安全基线——通过历史数据建立正常行为模式，持续优化检测规则。

### 5. 采用 GenAI Utils 架构避免重复造轮子：插桩层与遥测层分离

对于正在构建内部 Agent 平台的团队，建议从一开始就采用**插桩层与遥测层分离**的架构。

具体实现：

- 插桩层（各框架的 Hook/Monkey-Patch）只做数据提取，不直接操作 OTel API
- 所有 Span 创建、Metrics 记录、Context 管理统一收口到一个中心化的遥测处理器
- 当需要升级可观测语义规范时，只需要更新中心化遥测处理器，无需逐个修改各插桩库

这一架构的另一个好处是**插桩库的可测试性**——插桩库只需要验证数据提取的准确性，而不需要关注遥测输出的正确性，大幅降低了单元测试的复杂度。

## 相关实体
- [阿里巴巴蚂蚁 Loongsuite Genai 可观测语义规范从统一数据语言到规模化落地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地.md)
- [Alibabacloud Cms Manage Skill Natural Language Observability](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibabacloud-cms-manage-skill-natural-language-observability.md)
- [Baidu Comate Coding Agent Feedback Loop Wanpeng](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-comate-coding-agent-feedback-loop-wanpeng.md)
- [Harness Engineering Reliable Long Term Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-reliable-long-term-agent.md)
- [Anthropic Coding Agents Social Science Survey 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-coding-agents-social-science-survey-2026.md)

→ [第 1 来源原文归档](https://mp.weixin.qq.com/s/3zA8mUTHG289-VnXDV1O2Q)
---

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/observability-monitoring.md)
## 第 2 来源：从个人生产力到组织能力——LoongSuite-Pilot×SLS 的 AI Coding 度量实践

> 作者：徐可甲（阿里云云原生）
> 原文：[归档](https://mp.weixin.qq.com/s/SEOGc3KIGm7eFpyUK6nR4g)

### 核心创新

**第 1 来源**（望淑/太业/石木）聚焦**数据如何采集**：LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力。

**本文**（徐可甲）聚焦**数据如何转化为组织行动**：SLS 看板层的 8 维度度量体系，让"采集到"真正落地为"可决策"。

### 与第 1 来源的对照补充

| 维度 | 第 1 来源 | 本文（第 2 来源） |
|------|------------|-------------------|
| 核心层面 | 数据采集层（Pilot 平台架构） | 分析层（SLS 看板 + SQL） |
| 技术细节 | Span 语义模型、Hook 插桩机制 | 公共 CTE 设计、窗函数排名、Skill 路径提取 |
| 数据模型 | Entry/Step Span 定义 | 事件事实表 + 人员维表 JOIN 架构 |
| 分析维度 | 4 大能力（可见、分析、审计、治理） | 8 个 Section（概览→结构→趋势→部门→人员→Skill→仓库→集中度） |
| 组织价值 | 把数据"采出来" | 让数据"能行动"（暴露未上报空白、校验集中度） |

### 本文独有贡献

1. **8 维度递进度量体系**：从"整体感知"到"结构拆解"再到"风险校验"，每一层都为更细粒度的判断提供上下文

2. **公共 CTE 工程架构**：`dept_user` 标准化维表 + `active_user` 事件预聚合，让 30+ 图表口径一致且可维护

3. **Skill 名称提取算法**：处理多种路径格式（`skills/<name>/SKILL.md`、`.qoderwork/<name>.skill.md`、版本号目录等）的实战 SQL

4. **Token 集中度校验**：用 Window Function 计算 Top10%/20% 占比，验证"人均是否被头部撑起来"——这是组织级落地的关键指标

5. **LEFT JOIN 暴露空白模式**：通过"在册但未上报"员工列表，直接推动落地（比任何图表都有效）

### 实践启示

- **数据与组织行动的桥梁**：缺少度量层的采集只是"原料"，需要 SLS 看板这样的分析层才能转化为"可行动的信号"
- **灵活性与一致性的平衡**：SQL 查询即定义给灵活性，公共 CTE 给一致性
- **从个人到组织的 J-Curve**：集中度指标是判断"是否全员普惠"的关键，持续下降才意味着 AI Coding 从个人扩散为组织共同能力

### 与第 1 来源的呼应

本文的"事件事实表"正是对应第 1 来源的 **Entry Span + Step Span + Skill 语义**的落地实现。两篇文章合起来构成完整闭环：

```
第 1 来源（规范层）          本文（应用层）
↓                              ↓
Entry/Step/Skill 语义 → 事件事实表结构  →  SLS SQL 分析
↓                              ↓
数据如何采集              数据如何转化为行动
```

→ [第 2 来源原文归档](https://mp.weixin.qq.com/s/SEOGc3KIGm7eFpyUK6nR4g)

## 第 3 来源 — 阿里云云原生（徐可甲/烨陌）：看清 Coding Agent：从执行记录到风险调查（2026-09-21，SUPP）

观测审计产品线的安全取证续篇：LoongSuite-Pilot 整理行为记录 + AgentLoop 结合任务上下文分析风险，把第 1 来源的采集架构落到**审计取证操作层**。核心命题："用户授权的是一项任务，而不是任意的数据访问和工具操作"。

### 事件四阶段审计语义（grep 全库零覆盖）

llm.request（模型接收输入→审计用户请求/消息/上下文）/ llm.response（模型返回输出→回答/工具调用请求）/ tool.call（Agent 发起调用→工具名/参数/操作目标）/ tool.result（返回结果→内容/错误/执行状态）。关键判据："**模型提出调用请求，不代表 Agent 已经发起调用**"——不能把模型打算做的事当成已完成的操作；发起调用也不等于执行成功（被拒绝/报错/返回结果含义不同）。并发调用配对保留 Session/Turn/Step/Tool Call ID；原始记录无标识时结合参数与轮次核对，不能只凭时间接近认定同一次操作。

### 脱敏设计：隐藏敏感内容，保留审计信息（零覆盖）

API Key/云 Access Key/私钥/数据库密码/个人信息 → `[APIKEY_MASKED]`，事件名称、时间、调用关系一并保留——审计人员仍能定位是哪次调用返回了密钥。两个边界：不同密钥脱敏后同 mask **不能认定是同一把密钥**；脱敏只处理 Pilot 输出，不改写 Coding Agent 已保存的原始日志（其访问权限与保存期限需单独管理）。

### 三案例取证（全库零覆盖）

1. **ZCode 工作区快照上传**（2026-09 社区调查 ferstar blog + zai-org feedback#707）：部分版本在提交 Prompt 前等时机生成加密工作区快照（项目代码/Git 历史/部分配置），报告者据本地状态记录判断已被远端接收；新版本已移除上传链路。审计问题：访问了什么、参数是什么、返回了什么。
2. **Cursor CVE-2026-31854 间接提示词注入**（2026-03 公告，≤1.4.5 受影响 / 2.0 修复）：恶意网页指令被当成任务要求 + 命令白名单绕过，Use AllowList 模式仍受影响。取证判据：只是**解释**网页命令示例 ≠ 注入得逞，须记录表明**采纳**了外部指令并发起超授权操作；缺网页记录时可核对命令是否符合任务，但不能认定原因即注入，白名单是否绕过须查当时配置与执行路径。
3. **Claude Code Issue #75859 误删主目录**（2026-07）：`export HOME=$(mktemp -d)` 与 `rm -rf "$HOME"` 分处两次 Bash 调用，变量设置不延续——同一变量名指向不同删除目标。`rm -rf` 命令名称本身不能判断越权（清理临时文件与删主目录同命令），须核对 `$HOME` 实际取值（需调用环境或记录支持，不能凭名称推断）；"**超时只表示操作被终止，不会撤销已发生的删除**"——不能用超时/可能未执行代替损失核查，须把工具返回、Agent 对结果的说明、操作后文件状态三方对照。改进方向：临时目录路径跨调用显式传递 + 删除前目标校验。

### 调查流程产品化（零覆盖）

风险浏览器（按类型/严重程度/应用/用户筛选，内置+企业自定义同一入口）→ 风险详情判断原因 → 关联会话事件时间线逐项核对（参数/返回/用户要求）→ 实体调查沿用户/应用/主机/工具扩大范围。无风险事件的会话也可审计事实查询抽查；"**没有告警，并不意味着操作一定安全**"（可能是记录缺失）。AgentLoop 风险分析双层：规则（敏感信息/凭据访问/破坏性命令/疑似注入，判定明确的直接出结果）+ 模型分析（任务含义与前后行为关系；记录不足时一条可疑命令不足以支持确定判断）。

### 企业自定义规则方法论（零覆盖）

先明确检查位置（模型输出内容 or 工具参数操作目标）→ 写清命中条件与排除项 → 选风险类型（不够时可补企业子类）→ 上线前用应命中/不应命中样例**双向验证**（防空泛或遗漏）→ 按实际命中持续调整。

### 与既有来源的关系

第 1 来源（2026-06）讲采集架构（Entry/Step Span/SemConv/sidecar/3 Agent 形态），第 2 来源讲 SLS 指标度量；本来源把 tool-call-audit 能力落到**安全取证操作层**——事件语义区分、脱敏、三个真实 CVE/事故的取证过程、调查产品流程，与已归档的审计方法论 raw（agent-audit-risk-noise，事实底座→低保真→高保真→实体调查）一脉相承并补齐案例维度。

→ [第3原文存档](https://mp.weixin.qq.com/s/z8qJMB46ZoBeLRTwLmxy_Q)

---

