---
source: newsletter
source_url: "https://www.raindrop.ai/blog/signals-2-frontier-classification"
ingested: 2026-08-12
sha256: adee871d674da46055730c625325db21601225f65bd8825dce6f756c562f2b00
---

# rd-signal-2: Frontier Classification at Production Scale

**作者**: Ben Hylak、Manav Shah、Ryan D'Onofrio（Raindrop）。2026-08-11 发布。

Raindrop 发布 Signals 2.0，由 rd-signal-2 驱动——一个从生产 trace 构建任务特定二元分类器的新模型流水线。rd-signal-2 在精度上接近 GPT-5.6 Sol xhigh，成本低 1600×；比 GPT-5.6 Luna xhigh 便宜 260×。同步发布 Signal Builder：零数据保留（ZDR）的训练与托管平台。

## 核心主张：Everything is a binary classification problem

OpenAI 的 "Why Language Models Hallucinate" 论文提出幻觉是二元分类问题——任何陈述要么真要么假。Raindrop 的延伸：给定 agent 行为要么好要么坏。但二元分类是困难的 alignment problem——需要先在公司内对齐"好/坏"的定义，探索所有边界情况，再对齐模型/流水线到该定义。

## Classifiers for Agents：从单轮到多轮轨迹

2025 年 6 月第一版 Signals 用自动化流水线训练微型分类模型，只评估单个 input-output pair——适合聊天机器人时代（相关证据在单轮内）。但 agent 失败现在跨多轮、工具调用和子 agent 展开，有时横跨数十万 token。这些失败通常微妙且稀疏——既需要确定性过滤组装相关证据，也需要语义判断解释它。

用 frontier model 跑每条 trace 显然太贵太慢；小模型便宜但难以处理复杂行为和长上下文。**rd-signal-2 通过自动化研究循环解决**：对每个行为，研究生产 traces、写代码组装重要上下文、用该上下文训练任务特定模型。

## 工作原理：确定性过滤 + 语义分类头

示例：agent 产生 trace——`update_record({id: 42, status: "resolved"})` 三次超时后最终回复 "The record has been successfully updated."。失败不在任何单步中，而是重复工具失败与助手最终回复之间的关系。rd-signal-2 能表达这种关系：

1. 收集 trace 中所有 `update_record` 调用
2. 至少三次工具调用、输入全部相同、且全部失败
3. 其他情况直接 non-match 早退（不调模型）
4. 现在任务简化为更简单的问题：助手是否声称操作成功？

`classify(...)` 函数抽象模型训练流水线并自动自我改进。代码找到相关工具调用、比较输入、检查失败——条件不满足时 Signal 不调模型直接返回 non-match；条件满足时提取失败尝试和最终回复，剩余语义判断交给"任务特定分类头" + 内部语义推理模型（为二元分类优化）。

## 构建时推理 vs 执行时计算（核心成本洞察）

rd-signal-2 把构建分类器所需的推理与执行分类器所需的计算分离：

- 传统 LLM Judges 浪费推理 token 反复发现同一证据、每次都做出略有不同的判断。成本 = 流量 × 全 trace 推理。
- rd-signal-2 支付一次性成本，摊到未来每条 trace：成本 = 构建一次 + 确定性执行 + 模糊候选 × 紧凑上下文。

**模型调用应该随不确定性扩展，而不是随流量扩展。** 结果是 Signals 便宜到可以随 Raindrop 平台免费提供，每月跑数十亿条 traces——对比 Braintrust 和 Langchain 等平台要求客户自付推理费用。

## 二元分类是 alignment problem

最难的部分往往是发现用户真正想要什么。同一个一句话行为的四种解释跑同一 2000 条生产 traces：匹配率从 0.9% 到 4.6%，67% 的匹配 trace 被至少一个解释质疑。人类-模型对齐是活跃研究领域。

## Signal 永不真正完成：连续再评估循环

模型和 harness 变化会改变 trace 形态，客户也会发现 spec 错误。部署后每天随机抽样生产 Signals 用 frontier models 评估，发现 drift/regression 就 rerun prompt optimization 并 retune。循环：deploy → sample → evaluate → find regressions → retune → re-evaluate。

## 规模化安全运行

每天跑 200 万+ 条 traces 需要 careful model serving、queueing、retries、isolation。每个生成的 Signal 默认视为 untrusted，跑在无凭证、无 internet egress 的隔离环境。组织 runtime 只能访问自己组织的数据。Trace context 只取一次并缓存在 evaluation workers 附近。生产规模下 median trace 分类耗时 100ms，当前每月评估 200 亿+ 条 traces。

## 生态整合

rd-signal-2 已驱动 Raindrop 的 Issue Detection 系统。Signals 可由用户创建、Triage Agent 构建、coding agent 经 MCP 生成、或 Raindrop Issue Detection 使用。Signals 2.0 API 允许开发者把领域特定检测构建进自己的系统；ZDR Signals 支持不保留生产数据训练和运行任务特定分类器。
