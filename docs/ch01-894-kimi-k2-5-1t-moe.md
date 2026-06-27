# Kimi K2.5 架构创新 — 1T MoE 一层路由 + 三能力跃迁

## Ch01.894 Kimi K2.5 架构创新 — 1T MoE 一层路由 + 三能力跃迁

> 📊 Level ⭐⭐⭐ | 7.0KB | `entities/kimi-k2-5-architecture-innovation-moonshot-2026.md`

## 概述

Kimi K2.5（Moonshot AI）是 K2 之后的开源 1T MoE 升级版本，核心架构创新是**"一层路由"机制**（路由只发生在 attention 后残差出口，与 DeepSeek-V3 256 个 64 维 expert 的逐层路由形成本质区别），叠加**深度研究 / 视觉-代码-操作 / 多模态表格理解** 三项新能力，模型权重 + 训练数据 + 配套 harness（OpenShell、AWorld）**全部开源**。

## 深度分析

**1T MoE 的"一层路由"是与 DeepSeek-V3 路线完全不同的设计选择。** 传统 MoE（DeepSeek-V3 风格）路由发生在每一层，每个 token 独立选 expert，选中的子集被激活。K2.5 反其道而行：路由只发生在 attention 之后残差流出口的那一层，所有 1T 参数在 attention 阶段完整在线，残差流通过路由决定流向哪个 expert sub-network。这意味着 K2.5 物理上是稠密激活（1T 全在线），但语义上是稀疏路由（只有部分 expert sub-network 被残差流走通）。这是一个**用稠密计算换稀疏语义的架构选择**，推理成本不降但训练稳定性可能更好。

**384 个 expert 是 k 均值聚类得到的簇，不是手工定义的 expert specialization。** 与 DeepSeek-V3 256 个 64 维 expert（每 token 选 top-k 个）不同，K2.5 把 token 表达聚成 384 簇，每簇对应一个 expert sub-network，路由本质上是 token → 簇的最近邻查询。这种设计的潜在优势：expert 边界由数据分布决定，不需要人为设定；专家之间互斥性更强（同一簇内 token 不会路由冲突）。潜在风险：聚类质量决定 expert specialization 上限，对冷门领域 token 可能被错分。

**训练数据 pipeline 把"agent harness 合成"作为一等公民。** Kimi 把 agent 执行轨迹（harness synthesis）当作训练数据，与 OCR 公式/表格合成、5-step cot、math/STEM/Code 提升并列。这是**把"agent 行为模式"嵌入模型权重**的工程化尝试——模型不只是会"使用 agent"，而是把"agent 是怎么工作的"内化为先验。

**MLA-MQA 共享 KV 优化是为了压推理显存。** Multi-Latent Attention 复用 KV 头（DeepSeek 路线）+ Multi-Query Attention 共享 KV（PaLM 路线）的组合，1T 参数模型如果走 vanilla MHA 推理 KV 显存会爆。两套 KV 压缩技术叠加的兼容性和实际收益是值得跟踪的工程细节。

**多模态 token merging 是视觉-文本混合序列的降本关键。** 相邻视觉块/文本块语义相似时可合并，跨模态交互的 token 数被压缩，这是 K2.5 "视觉-代码-操作 联合"和"多模态表格理解"两项新能力能跑得动的底层支持。

**K2.5 三能力跃迁指向"模型 + harness + 训练数据"三位一体的开源策略。** 深度研究基于 OpenShell / AWorld harness（开源 agent runtime）、视觉-代码-操作需要 OCR/UI 合成数据、多模态表格理解需要 token merging 推理优化。每一项能力都对应"模型能做什么 + 配套 harness 怎么用 + 训练数据怎么造"的完整链条。这是 Kimi 与"只开源模型权重"的开源路线（如 Llama 早期）的本质区别，也是中国大模型开源竞赛进入"基础设施级"的标志。

## 实践启示

1. **在评估 1T 级 MoE 架构时，"路由粒度"是关键差异点**：DeepSeek-V3 的逐层路由 vs K2.5 的一层路由代表两种不同假设——前者假设 expert 边界应贯穿整个网络深度，后者假设 expert 边界可在 attention 之后做统一决策。选型时需要根据推理成本预算和训练稳定性需求做权衡。

2. **"expert 数量"不等于"expert 质量"**：K2.5 用 384 簇 + k-means 把 expert 构造从"人工设计"变成"数据驱动"，DeepSeek-V3 256 expert 仍然有人工设计的共享专家 + 路由专家组合。两者都跑得动 1T 参数，但**expert 数量是结果而非目标**，工程上要看实际下游任务表现。

3. **"agent harness 合成"作为训练数据是一个新范式**：把"agent 执行轨迹"塞进预训练/后训练数据，相当于让模型在权重层面"学会 agent 的工作流"。这与"用 RL 让 agent 在环境中学习"（如 AgentEvol、ToolLLM）路线形成对照——前者是模仿学习路线，后者是强化学习路线。

4. **"全开源"路线（模型 + 数据 + harness）正在成为中国大模型的差异化竞争点**：K2.5 全部开源权重、训练数据 pipeline、OpenShell / AWorld harness。这与 Meta Llama 早期"只开源权重"路线形成对比。开发者选型时应该优先评估"全开源"路线的可复现性和生态完整性。

5. **"视觉-代码-操作 联合"是 UI Agent 赛道的关键基础设施**：K2.5 把"看截图 → 写代码 → 执行"做成原生能力，配合 Playwright/Selenium 等开源执行器，UI Agent 的工程门槛被显著拉低。关注 K2.5 在 WebArena / OSWorld 等基准上的实际表现。

## 关键差异点：K2.5 vs DeepSeek-V3

| 维度 | K2.5 | DeepSeek-V3 |
|------|------|-------------|
| 路由层数 | 残差出口单层 | 每一层 |
| Expert 数量 | 384 | 256 |
| Expert 构造 | k-means 聚类 | 共享 + 路由组合 |
| 激活模式 | 1T 物理在线 + 路由分流 | 子集激活 |
| 训练数据 | OCR + harness synthesis | 标准 + reasoning |
| 开源范围 | 权重 + 数据 + harness | 权重 + 数据 |

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/kimi-k2-5-architecture-innovation-moonshot-2026.md)

## 相关实体

- [Kimi K2.6 Agent Database — K2.6 的 TiDB Cloud 基础设施实践](/ch04-159-kimi-work-beta-通用-agent-一定来自模型公司/)
- [Kimi AttnRes](/ch01-880-kimi-attention-residuals-attnres-prenorm-稀释问题与-block-折中方案/) — Kimi 的 attention 残差机制
- [DeepSeek MoE](/ch01-673-deepseek-moe-并行策略与gpu通信优化/) — DeepSeek MoE 架构对比
- openJiuwen Swarm — Kimi 关联的开源 harness
- [MiMo Code](/ch09-007-小米-mimo-code-长程编程-agent-三大主线-计算-记忆-进化-与-claude-code-工程分化/) — 类似的全开源策略对比

---

