# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

## Ch04.202 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

> 📊 Level ⭐⭐ | 11.3KB | `entities/volcano-engine-ai-search-agent-architecture-unified-policy-2026.md`

# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

## 摘要

火山引擎 AI 搜索团队在应对千万级并发企业级生产环境时，发现传统 ReAct 架构暴露出节点臃肿、延迟极高、状态管理混乱的致命缺陷。他们提出了 **Workflow + Unified Policy Agent（UP-ReAct）** 架构，将系统一分为二：确定性归 Workflow（风控校验、意图路由、基础检索等固定流程），动态决策归 Agent（仅基于收敛后的上下文决定下一步动作）。核心创新是 Unified Policy 节点——将 Thought、Action、Iteration 三个散装节点统一收敛为单一 Policy 节点，单次前向传递即可完成全局规划、动作选择与终止判定。实测结果显示：首字返回时间（TTFT）从 14.0s 骤降至 9.8s（降幅 30.22%），对话综合评分提升 14.78%。

## 核心要点

- **旧架构三大工程原罪**：极高的时间复杂度（三节点 DAG 导致 3 倍推理延迟）、上下文震荡（状态在节点间重复搬运导致 Prompt 指数级膨胀）、控制流破碎（新工具融入需硬编码 If-Else 特判逻辑）
- **Workflow + Agent 分层原则**：预定义路径、硬规则校验、权限控制留在 Workflow；Agent 只负责在环境反馈中做动态策略决策
- **Unified Policy 节点**：单次前向传递同时完成全局规划（Planning）、动作选择（Action Selection，输出结构化 JSON Schema 指令）、终止判定（Termination）
- **万物皆 Tool（Contract）**：所有系统级主动行为（包括「退出回复」「深度思考」）都必须抽象封装为标准 Tool，使 Action Space 完全可枚举可校验
- **Context Manager 上下文管理**：基于预算的滑动窗口、语义去重与折叠、记忆分级驱逐三大策略，实现高密度、低噪声的状态切片注入 Policy

## 深度分析

### ReAct 架构的三重原罪：企业级生产环境的照妖镜

火山引擎团队对标准 ReAct 架构的批判是所有考虑生产级 Agent 部署的团队必须认真对待的工程教训。我们逐一拆解：

**第一重：极差的时间复杂度。** 标准 ReAct 的 Thought-Action-Iteration 三节点 DAG 意味着，每执行一次有效工具调用，模型需要经历三次独立的决策流转。在数学上，总延迟 = 3×( 单次推理耗时 + 工具执行耗时 ) + 节点流转 IO 耗时。这意味着系统在「正确使用工具」之前已经花掉了 3 倍推理延迟的 overhead。对于企业级 AI 搜索这类需要极低首字返回时间（TTFT）的场景，这是灾难性的。

**第二重：上下文震荡与注意力稀释。** 三节点拆分导致同一份业务状态在节点间反复序列化与反序列化。Thought 输出→Action 读取→Action 输出→Iteration 读取，Prompt 长度呈指数级膨胀。这种膨胀不仅推高了显存占用，更致命的是导致了注意力稀释——模型在浩瀚的中间推理步骤中极易遗忘最初的用户意图。这是当前 Agent 系统中最普遍但最不被重视的性能杀手。

**第三重：控制流破碎。** 这是最微妙但也长期成本最高的原罪。当业务需求变得复杂——如「这个 Tool 调用后不需要 Iteration 判断是否退出」「这个路径需要强制先执行 Tool A 再 Tool B」——工程师不得不在 DAG 中硬编码各种 If-Else 特判逻辑。系统的控制权被撕裂：Thought 在规划、Action 在翻译、代码逻辑在强行路由，最终退化为布满补丁的「屎山代码」。

### Workflow + Agent 分层的哲学：确定性与不确定性的边界

火山引擎架构中最精妙的设计不是 Unified Policy 本身，而是 **Workflow 与 Agent 的严格分层**。这个分层依据了一条深刻的工程原则：**「不要让 LLM 去做普通的 switch-case」**。

具体来说：

- **Workflow 层**（确定性骨架）负责所有「不需要 LLM 决策」的前置工作：风控校验、意图路由分类、用户画像预加载、基础倒排索引召回等。这些工作有明确的正确标准，用传统代码实现比用 LLM 调用 Teol 更可靠、更廉价、更可调试。
- **Agent 层**（动态决策中枢）仅负责「需要模型判断」的动态策略决策：在当前收敛的上下文中决定下一步该检索什么、计算什么、推荐什么或直接回复。

这个分层解决了 Agent 系统设计中最常被忽略的问题：**不要把工具用于工具自身的替代品**。如果在 Workflow 层用一个工具调用来替代一个简单的 `if-else` 分支，你只是把一个确定性问题伪装成了不确定性问题，徒增了推理成本和出错概率。

### Unified Policy 的设计哲学：从议会制到独裁中心

Unified Policy 的精髓在于，它用 **「单一决策中心」** 取代了 Thought-Action-Iteration 的「三権分立」模式。这个改变不仅仅是架构优化，更是一种控制论层面的认识转变：

1. **控制唯一性**：Policy 是唯一的决策中心，监控只需 Dump 当前 Policy 状态日志即可定责
2. **语义收敛**：全局规划、动作选择、终止判定统一在同一个语义空间中进行，消除多节点间语义冲突
3. **结构化输出**：不输出自然语言再搞正则提取，直接输出 JSON Schema 的结构化决策指令，让下游消费更加可靠

这个架构的底层思想是：Agent 的核心难点不在于缺乏智慧（LLM 已有足够的推理能力），而在于 **缺乏一个清晰的信息流动拓扑**。Unified Policy 通过把「大脑」收敛到单一节点，从根源上消灭了信息在多个节点间传递时的失真和损耗。

### Context Manager：被低估但最硬核的模块

在火山引擎架构的四个支柱（Workflow、Policy、Tool、Context Manager）中，Context Manager 是最容易被忽视但实际贡献最大的模块。它的三大策略反映了生产级 Agent 上下文管理的工程智慧：

- **基于预算的滑动窗口**：不是「所有历史都放进 Prompt」，而是「Policy 单次最多只看 N 个 Token」。这是对 LLM 上下文窗口的「预算管理」视角——上下文是昂贵且有限的 L1 Cache，必须精打细算。
- **语义去重与折叠**：对连续多次高度同质化的搜索结果，用小模型将其压缩为高密度核心特征后再喂给 Policy。这避免了大模型 Attention 被冗余信息稀释，同时保留了关键信息。
- **记忆分级驱逐**：中间 Tool 调用的长 JSON 错误栈→提取核心错误码后丢弃原始文本；用户长期偏好→驻留在高优常驻区。强迫症般的状态清理策略确保 Policy 看到的信息始终是「高价值浓缩信息」。

### 性能提升的归因分析：快 30% 且更准的工程秘密

UP-ReAct 架构在实测中获得 TTFT 降低 30% + 对话质量提升 14.78% 的双重突破，打破了「速度与质量互斥」的常规认知。归因分析表明，核心原因在于 Context Manager 的「洗流与状态降噪」：

- **为什么快了？** 从 O(3×推理+3×执行+流转) 降维到 O(1×推理+执行)，直接干掉了无价值的多轮节点空转和巨大的 Token IO 耗时。
- **为什么更快了反而更准？** 排除了大量中间思考冗余文本的干扰后，模型有限的注意力机制被完美聚焦在最核心的业务目标与干净的工具返回数据上。模型本身并没有变聪明，是系统的状态供给质量发生了质变。

这个发现对整个 Agent 架构设计领域有一个深远启示：**大部分 Agent 的性能瓶颈不在模型能力，而在系统架构的信息流设计**。减少信息在系统中的传递次数和噪声注入，比提升模型的推理能力更有现实意义。

## 实践启示

1. **严格分离 Workflow 与 Agent**：在架构设计之初就明确边界——确定性逻辑（风控、路由、缓存）永远放在 Workflow 层用传统代码实现，Agent 只负责真正需要模型判断的动态决策。不要用 LLM 执行可以用 `if-else` 替代的工作。

2. **采用 Unified Policy 替代多节点 DAG**：不要照搬 Thought-Action-Iteration 的三节点模式。将决策收敛到单一 Policy 节点，通过结构化输出（JSON Schema）一次性输出规划、动作和终止判定。这显著降低延迟且提升决策一致性。

3. **万物皆 Tool 的契约化设计**：将所有主动行为——包括「退出回复」「深度思考」「加载配置」——都封装为标准 Tool。这使得模型的动作空间完全可枚举、可校验，新能力的接入只需注册新 Tool，无需修改 DAG 代码。

4. **实现预算驱动的上下文管理**：为 Policy 设置单次可见 Token 上限（基于预算的滑动窗口），对小模型进行语义压缩以去重降噪（语义去重与折叠），对不必要的历史信息进行分级驱逐（记忆分级驱逐）。Context Manager 是 Agent 系统的内存管理器，其质量直接影响模型的决策质量。

5. **将监控可观测性设计融入架构**：单一决策中心的架構让监控变得透明——遇到问题只需 Dump Policy 状态日志，无需在多个节点间跟踪排查。在设计 Agent 系统时，应将「如何定责」内置于架构选择，而非事后补充。

## 相关实体

- [Agent Harness 上下文管理](../ch05/039-agent-harness.html)
- [注意力崩溃与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md)
- [Harness Engineering 行业调研](../ch05/052-harness-engineering.html)
- [Loop Engineering 概念分析](../ch05/007-loop-engineering.html)
- [Agent Harness 工程范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/volcano-engine-ai-search-agent-architecture-unified-policy-2026.md)

---

