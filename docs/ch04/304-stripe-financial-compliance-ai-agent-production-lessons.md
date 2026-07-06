# Stripe Financial Compliance AI Agent: Production Lessons

## Ch04.304 Stripe Financial Compliance AI Agent: Production Lessons

> 📊 Level ⭐⭐ | 8.6KB | `entities/stripe-financial-compliance-ai-agent-production-lessons.md`

# Stripe Financial Compliance AI Agent: Production Lessons

Stripe 在 AWS Bedrock 上构建生产级合规审查 Agent 系统，处理年 $1.4 万亿支付量的合规审查需求。核心成果：审查处理时间减少 26%，帮助率超 96%，人类审查者保持最终决策权。

## 核心架构：ReAct + DAG 任务分解

Stripe 的 Agent 架构有三个关键组件：

### 1. 任务分解为 DAG（有向无环图）

单一 Agent 无法处理复杂合规审查。Stripe 将审查拆分为可组合的子任务，形成 DAG。每个子任务可能依赖其他子任务的输出，通过"rails"（轨道约束）确保 Agent 只在经过质量测试的问题范围内运行。

关键设计：**Agent 响应不直接用于决策**，而是作为补充信息提供给人类审查者。审查者通过审查工具交互，工具充当编排器，将人类审查的答案作为更深层问题的上下文传递。

### 2. ReAct Agent 框架

Stripe 使用 ReAct（推理+行动）框架解决"近无限信号"问题：

```
Thought → Tool → Observation → Thought → ... → Final Answer
```

**闭环控制机制**：每当 Thought 块请求工具时，框架停止 LLM 执行，程序化运行该工具，强制将输出作为 Observation 注入后再继续。这实现了：
- **基于实际数据的推理** — 防止幻觉/虚构工具结果
- **上下文连贯性** — 强制 Agent 显式处理每条信息
- **防止推理漂移** — Observation 作为检查点
- **可审计性** — 工具调用→观察→推理的显式追踪链

挑战：多轮对话导致 prompt 膨胀。通过子任务分解限制每个问题范围 + prompt caching（Amazon Bedrock 支持）解决，后者仅支付新追加的 tokens。

### 3. 专用 Agent 服务

Stripe 刻意将 Agent 与传统 ML 推理引擎分离，原因：

| 维度 | 传统 ML | Agent |
|------|---------|-------|
| 计算特征 | 计算密集（GPU/CPU） | 网络密集（等待 LLM/工具） |
| 延迟 | 毫秒级 | 分钟级（多轮工具调用） |
| API | 简单类型输出 | 灵活 schema + 状态对话 |

该服务从启动时的几个 Agent 增长到一年内超过 100 个。

## LLM Proxy 架构

Stripe 不直接调用 Amazon Bedrock，而是通过 LLM Proxy 微服务：

- **噪声隔离** — 防止多团队争抢 LLM 带宽
- **统一 API** — 一个端点支持多模型，切换模型只需改参数
- **模型降级** — 资源受限时自动切换默认模型
- **监控追踪** — 跟踪模型使用量，预测资源需求

## 成本优化：Prompt Caching

Amazon Bedrock 的 prompt caching 通过复用跨 Agent 轮次的公共 prompt 前缀，将 token 成本降低 **60%**。仅支付每轮新追加的观察和思考。

## 生产结果

- 审查处理时间减少 **26%**（中位数）
- 帮助率评分超过 **96%**
- 人类审查者保持决策权
- 完整审计追踪满足监管检查标准

## 关键经验（可复用模式）

1. **小任务** — 保持 Agent 任务在工作记忆范围内，增量测试质量而非直接全自动化
2. **DAG 编排** — 异步工作流 + DAG 支持是复杂 Agent 交互的基础，同时维护可审计性和人类监督
3. **专用基础设施** — Agent 与传统 ML 的资源模型完全不同，需要独立微服务架构
4. **Token 缓存** — prompt caching 降本 60%，是生产 Agent 的关键成本杠杆
5. **人类在控制中** — Agent 辅助但不替代，用"rails"约束 Agent 到可控范围

## 与现有 Agent 实体的差异化

本文聚焦**金融合规这一高风险场景**的 Agent 生产实践，与通用 Agent 架构文章形成互补：
- [Agent Harness Architecture Deep Dive Aksahy](ch05/085-harness.md) — Agent Harness 通用架构深度分析
- [17 Agent Architectures Evolution](ch03/045-agent.md) — 17 种 Agent 架构演化全景

本文独特贡献：
1. **ReAct 闭环控制**的生产实现细节（Thought→Tool→Observation 注入模式）
2. **Agent vs 传统 ML 基础设施分离**的决策论证（网络密集 vs 计算密集）
3. **LLM Proxy 模式**的噪声隔离 + 模型降级设计

## 深度分析

### DAG 任务分解 vs 单体 Agent 的架构权衡

Stripe 选择将合规审查拆分为 DAG（有向无环图）子任务而非依赖单一大型 Agent，这一决策背后是对 LLM 工作记忆限制的深刻理解。单一 Agent 面对复杂合规审查时，上下文窗口会被大量信号填满，导致推理质量下降。DAG 分解使得每个子任务在有限范围内运行，同时通过依赖关系保持整体一致性。 这种"小任务"原则是生产 Agent 系统的核心设计模式——Agent 的能力边界由其上下文窗口大小决定，而非模型参数量。

### ReAct 闭环控制的工程实现细节

Stripe 的 ReAct 实现最值得关注的是**程序化工具注入**机制：当 LLM 的 Thought 块请求工具时，框架停止 LLM 执行，程序化运行工具并将结果作为 Observation 强制注入。 这与许多 Agent 框架中"LLM 自行处理工具输出"的模式形成对比——程序化注入确保了推理基于实际数据而非幻觉，并创造了可审计的 Thought→Tool→Observation 追踪链。

### Agent 与传统 ML 基础设施分离的必然性

Stripe 将 Agent 服务从传统 ML 推理引擎中独立出来，原因是两者的资源模型根本不同：传统 ML 是计算密集型（GPU/CPU），Agent 是网络密集型（等待 LLM API 和工具响应）。 这一洞察意味着试图在现有 ML 基础设施上运行 Agent 的组织将面临资源调度冲突——Agent 的长尾延迟（分钟级）会阻塞 ML 推理的毫秒级请求。

### LLM Proxy 模式的生产价值

Stripe 通过 LLM Proxy 微服务实现噪声隔离、统一 API、模型降级和监控追踪。 这一模式在多团队共享 LLM 资源时尤为关键——当一个团队的 Agent 因异常行为消耗大量 token 时，Proxy 可以通过模型降级保护其他团队的服务质量。对于年处理 $1.4 万亿支付量的 Stripe 来说，这种隔离是生产稳定性的必要条件。

### Prompt Caching 作为 Agent 成本杠杆

Amazon Bedrock 的 prompt caching 通过复用跨轮次的公共 prompt 前缀，将 token 成本降低 60%。 这一成本优化对生产 Agent 至关重要——多轮对话中，系统提示和工具定义在每轮都重复出现，caching 将这些固定部分的成本分摊到多轮推理中。对于高频调用的合规审查场景，这意味着从不可承受变为经济可行。

## 实践启示

1. **Agent 任务粒度应由上下文窗口决定**：将复杂任务分解为 DAG 子任务，确保每个子任务在单次推理中可完整处理，避免工作记忆溢出导致的推理质量下降。
2. **工具调用必须程序化注入**：不要依赖 LLM 自行处理工具输出——停止 LLM 执行、程序化运行工具、强制注入结果，这创造了可审计的追踪链并防止幻觉。
3. **Agent 基础设施应独立于 ML 推理平台**：两者的资源模型（网络密集 vs 计算密集）和延迟特征（分钟级 vs 毫秒级）完全不同，共享会导致调度冲突。
4. **LLM Proxy 是多团队共享的必要中间层**：通过统一 API、模型降级和监控追踪实现资源隔离，防止单个团队的异常行为影响全局服务。
5. **Prompt Caching 是生产 Agent 的第一成本杠杆**：在评估 LLM API 成本时，应将 prompt caching 的节省纳入计算——60% 的成本降低可能决定项目的经济可行性。

## 数据来源

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-grade-ai-agents-for-financial-compliance-lessons-.md) (AWS China ML Blog, 2026-06-26)

---

