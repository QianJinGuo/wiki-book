# rd-signal-2：生产规模下的 Agent 行为二元分类（Frontier Classification at Production Scale）

## Ch04.683 rd-signal-2：生产规模下的 Agent 行为二元分类（Frontier Classification at Production Scale）

> 📊 Level ⭐⭐ | 4.6KB | `entities/rd-signal-2-frontier-classification.md`

# rd-signal-2：生产规模下的 Agent 行为二元分类

> **来源**: Raindrop（Ben Hylak、Manav Shah、Ryan D'Onofrio），2026-08-11 发布 Signals 2.0 技术博客。

## 核心主张

Agent 行为评估的本质是**二元分类问题**（行为好/坏），但这是困难的对齐问题：需要先对齐人类对"好/坏"的定义，再让模型/流水线对齐该定义。rd-signal-2 用**确定性过滤 + 语义分类头**的组合，从生产 traces 构建任务特定分类器，以接近 GPT-5.6 Sol xhigh 的精度实现 1600× 的成本下降。

## 架构模式（可迁移知识）

### 构建时推理 vs 执行时计算分离

- 传统 LLM Judges：成本 = 流量 × 全 trace 推理——每条 trace 重新发现同一证据，判断还每次略不同。
- rd-signal-2：成本 = 构建一次 + 确定性执行 + 模糊候选 × 紧凑上下文。**模型调用随不确定性扩展，而非随流量扩展**。

### 确定性过滤 + 分类头两层结构

用代码（而非 prompt）表达可判定的失败模式：收集 trace 中的工具调用 → 条件检查（≥3 次相同输入且全部失败）→ 不满足直接 non-match 早退（零模型调用）；满足才把精简证据 + 语义判断交给任务特定分类头。**失败的定位从"单步"扩展到"跨步骤关系"**——如"重复工具失败与最终成功声明之间的矛盾"。

### 连续再评估循环

部署后每天随机抽样生产 Signals 用 frontier models 评估，发现 drift/regression 即 rerun prompt optimization 并 retune：deploy → sample → evaluate → find regressions → retune → re-evaluate。模型/harness 变化会改变 trace 形态，Signal 永不真正完成。

## 关键数据

- 精度对比：Raindrop 71% vs GPT-5.6 Sol xhigh 71% vs Luna xhigh 67%（Claude Sonnet 5 adaptive 78%）；召回 87% vs 91% vs 83%
- 相对成本（每分类 trace）：Raindrop 1× vs Luna 260× vs Sol 1,600× vs Claude Sonnet 5 adaptive 1,650×
- 匹配率对解释的敏感度：同一行为的 4 种解释跑同一 2,000 条 traces，匹配率 0.9%–4.6%，67% 的匹配 trace 被至少一种解释质疑——人类-模型对齐是核心难点
- 规模：median 分类耗时 100ms，每月评估 200 亿+ traces；每个 Signal 默认 untrusted，隔离环境无凭证无 egress

## 工程启示

1. **确定性优先**：能用代码表达的条件判断绝不交给模型——大部分 trace 可零模型调用早退，这是成本下降的主要来源。
2. **证据组装是分类器的一部分**：对跨多轮/多工具/长上下文（数十万 token）的失败，先写代码组装相关证据（deterministic filtering），再把精简后的语义判断交给小模型。
3. **评估器也需要 drift 监控**：分类器部署后因模型/harness 演化而漂移，需持续抽样再评估闭环。

## 相关实体

- [Trace 即 Evals（张雁飞）](ch04/446-ai-agent-trace-evals.html) — 同为 trace 驱动评估范式；rd-signal-2 给出生产规模实现路径
- [YAML 驱动 Agent 评估框架](../ch03/006-agent.html) — 声明式评估对照
- [Agent 改进的数据挖掘视角](../ch03/006-agent.html) — trace 数据的另一消费方式
- [Agent 可观测性五层架构](../ch03/006-agent.html)
- [Agent 落地真相：协议、成本与进化](../ch03/006-agent.html) — 成本治理上下文

## 相关概念

- [Agent 可观测性](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md)
- [Agent 评估基准框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/rd-signal-2-frontier-classification.md)

---

