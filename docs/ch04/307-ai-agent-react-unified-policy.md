# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

## Ch04.307 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

> 📊 Level ⭐⭐ | 8.5KB | `entities/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md`

# 火山引擎 AI 搜索千万级 Agent 架构演进与实践：从 ReAct 三节点到 Unified Policy

## 摘要

火山引擎 AI 搜索团队面向千万级并发企业级生产环境，将传统的 ReAct 三节点 DAG 架构重构为 Unified Policy Agent（UP-ReAct）架构。通过剥离确定性与不确定性、分离策略决策与上下文管理，将 TTFT（首字返回时间）暴降 30%，对话综合评分提升 14.78%。这场重构不仅是代码层面的优化，更是对工业级 Agent 设计哲学的底层重塑——从"让模型更聪明"转向"让系统更可控"。

## 核心要点

- **旧架构三大原罪**：ReAct 三节点在千万级并发下暴露极高时间复杂度、上下文震荡（Context Thrashing）及控制流破碎
- **UP-ReAct 架构**：将 Thought→Action→Iteration 三节点收敛为单一 Policy 节点，单次前向传递完成全局规划、动作选择与终止判定
- **三个统一**：统一控制（Policy 决策中心）、统一行为（万物皆 Tool）、统一状态（Context Manager 内存管理）
- **核心效果**：TTFT 从 14.045s 降至 9.8s（-30.22%），推荐准确性提升 3.76%，对话综合评分从 3.76 升至 4.32（+14.78%），全局综合得分提升约 9.1%

## 深度分析

### 从 ReAct 到 UP-ReAct：Agent 架构的工程化觉醒

火山引擎的架构演进反映了整个 AI Agent 行业从"学术演示"到"工业落地"的必经之路。标准 ReAct（Reason + Act）范式在原型验证阶段优雅而直观，但在千万级并发场景下，其 DAG 结构带来的三次独立决策流转（Thought→Action→Iteration）造成了严重的工程债务。这不仅仅是延迟问题，更关键的是：**当每个有效动作都需要三次模型推理时，系统的 Token 消耗和并发瓶颈会呈指数级增长**。

这种"学术优雅 vs 工程残酷"的矛盾，本质上源于 ReAct 架构设计时未考虑的状态管理问题。Thought 节点输出的推理链可能长达数千 Token，Action 节点需要重新解析这些内容，Iteration 节点又要重新评估——同一份状态在不同节点间反复序列化与反序列化，导致 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中所说的"上下文污染"问题。

### Unified Policy：从"议会制"到"总统制"的控制权重构

UP-ReAct 最核心的变革在于控制权模型的重构。从分布式决策（多节点各司其职）转向集中式决策（单一 Policy 节点全能决策），这实际上是从"议会制"到"总统制"的治理模式切换。

这种切换带来的架构红利是多方面的：

1. **监控可追溯性**：当 Agent 行为异常时，只需 Dump 单一 Policy 的状态日志即可定位问题，不再需要在多个节点间交叉排查
2. **行为确定性提升**：Policy 节点的单一决策路径意味着系统的动作空间（Action Space）完全可枚举、可校验、可测试
3. **二次开发简化**：新功能的接入不需要修改核心 DAG 代码，只需注册新的 Tool——这与 [Codex 五层架构](../ch01/525-codex.md) 中的"技能注册"模式异曲同工
4. **推理效率优化**：时间复杂度从 O(3 × Model_inference + Tool_exec + IO) 降为 O(Model_inference + Tool_exec + IO)，彻底消除了节点间流转的开销

### Context Manager：Agent 内存管理的工程哲学

火山引擎架构中最具深意的设计是独立的 Context Manager。这个模块将 Agent 的历史状态管理从业务代码中剥离，实现了类似操作系统内存管理的策略：

- **预算驱动的滑动窗口（Budget-based Window）**：严格限制 Policy 单次可见的 Token 上限，这是对 LLM 上下文窗口的高效利用策略
- **语义去重与压缩（Semantic Compaction）**：当检测到同质化信息时，底层小模型自动压缩冗余内容——这实际上是"层级化注意力"的工程实现
- **分级驱逐（Hierarchical Eviction）**：中间工具调用的长错误栈→提取关键信息后丢弃原文；用户长期偏好→驻留高优常驻区

这种设计体现了对 LLM 注意力机制的深刻理解：**模型本身没有变得更聪明，而是不再被垃圾信息干扰了**。这解释了为什么系统变快了（Token 量减少）反而更准了（信噪比提升）——打破了"速度与质量互斥"的经验定律。

### "万物皆 Tool"的抽象能力

统一行为层的设计——所有系统行为必须封装为标准 Tool——是一项极具前瞻性的架构决策。当"退出"（exit_and_reply_tool）、"深度思考"（deep_think_tool）、"租户配置加载"（load_tenant_config_tool）都变成了标准 API 时，系统的动作空间变得完全可枚举。

这种设计理念与 [SageMaker RL](ch04/070-ai.md) 中的"动作空间离散化"思路一致——可枚举的动作空间是强化学习微调的前提条件。火山引擎的架构实际上为未来对 Policy 进行 RL 微调铺平了道路。

### 与行业共识的共振

火山引擎的架构演进与 2025-2026 年业界顶级团队的设计共识高度一致：

1. **Workflow 与 Agent 分层**：与 Anthropic、OpenAI 的实践一样，确定性流程归代码，动态决策归 Agent
2. **万物皆 Tool（Contract）**：工具是 Agent 与外部世界的"强契约"，其质量决定系统下限
3. **上下文管理独立化**：按需加载（Progressive Exposure）和状态压缩（Compaction）成为生产级系统的生命线
4. **工程评测（Eval）**：代码判分、中间态阻断率、工具调用准确率构成多维度 Eval 体系

这些共识的共同指向是：**Agent 架构正从"Prompt Engineering"时代迈入"System Engineering"时代**。

## 实践启示

1. **控制权收敛优于分布式决策**：在多节点 Agent 架构中，将决策权收敛到单一 Policy 节点（"总统制"）通常比多节点协商（"议会制"）更高效、更可维护、更易调试
2. **上下文管理是性能瓶颈的关键**：在 Agent 系统中，Token 成本和质量瓶颈往往不在模型推理本身，而在上下文管理——好的 Context Manager 能在不改变模型的情况下显著提升效果
3. **"万物皆 Tool"是可枚举动作空间的前置条件**：如果所有系统行为都封装为标准 Tool，Agent 的动作空间就是完全可测试、可优化、可 RL 微调的
4. **分层而非混合**：确定性业务逻辑（Workflow 层）与动态决策（Agent 层）严格分离，是生产级 Agent 系统的必要条件——不要用 LLM 去执行可以用代码实现的 switch-case
5. **架构评估要关注"反直觉"指标**：火山引擎的案例说明，"速度提升 + 质量提升"不是不可兼得的——当 Token 噪声被有效过滤后，更快的响应往往意味着更高的决策准确率

## 相关实体

- [腾讯 Harness Engineering 探索之旅](../ch05/092-harness-engineering.md)
- [Codex 五层架构](../ch01/525-codex.md)
- [SageMaker 多轮 RL 实践](ch04/070-ai.md)
- [LangGraph Agent 操作系统](ch04/195-langgraph.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md)

---

