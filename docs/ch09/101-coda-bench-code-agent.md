# CoDA-Bench：Code Agent 数据智能基准

## Ch09.101 CoDA-Bench：Code Agent 数据智能基准

> 📊 Level ⭐⭐ | 7.7KB | `entities/coda-bench-code-agent-data-benchmark-renmin-2026.md`

# CoDA-Bench：Code Agent 数据智能基准

## 摘要

CoDA-Bench 是中国人民大学研究团队提出的 Code Agent 联合评估基准，首次同时评测 Code Agent 的 Code Intelligence（代码分析能力）与 Data Intelligence（数据发现能力）。该基准将 Agent 置于包含 1000+ 数据文件的复杂数据目录中，只给一句自然语言问题，不提供文件名、路径或 schema，要求 Agent 自主探索文件系统找到相关数据后再编写代码完成分析。实验发现，当前最佳系统在 CoDA-Bench 上执行准确率仅 61.1%，在更难的 CoDA-HARD 子集上最高为 49.6%，揭示了当前 Code Agent 的真实瓶颈不是"不会写代码"，而是"找不对数据"。

## 核心要点

- **双维度评测**：CoDA-Bench 将 Code Agent 能力拆分为两个正交维度——Code Intelligence（给定明确数据文件和查询时编写正确分析代码的能力）和 Data Intelligence（在复杂目录结构中自主探索文件系统、定位相关数据文件、理解数据 schema 的能力）。
- **真实数据环境**：基准基于 Kaggle 生态构建数据环境，利用数据集的社区共现关系构建语义相关数据社区。Agent 面对的不是垃圾噪声文件，而是一批"看起来都合理的候选数据"——目标数据和干扰数据往往主题相近、结构相似。
- **逆向构造任务**：从真实 Kaggle notebooks 中提取可复现的分析结果作为 solution anchor，再反向构造自然语言问题，保证任务来自真实分析流程且答案可验证。
- **Oracle 实验揭示瓶颈**：当系统直接告诉 Agent 正确数据路径（Oracle 设置），Claude Code + Sonnet-4.6 在 CoDA-HARD 上从 45.4% 提升到 73.1%——数据发现能力成为当前 Code Agent 的关键瓶颈。
- **评测覆盖**：评测了 Claude Code、Codex CLI、OpenHands 和 Mini-SWE-Agent 等主流系统。

## 深度分析

### 被基准设计隐藏的"数据发现"缺口

CoDA-Bench 最重要的贡献是曝光了当前 Agent 基准设计中的一个系统性盲区。大多数现有基准（如 SWE-Bench）预置了明确的文件路径和上下文，Agent 被直接告知"修改这个文件"或"分析这个数据"。这种设计隐含了一个不可靠的假设：**在真实工作流中，用户会提前整理好数据，并告诉 Agent 正确的文件在哪**。

但现实恰恰相反。用户通常不会整理数据，数据分散在复杂目录中，格式多样、命名不统一，还夹杂大量主题相近但实际无关的文件。当一个 benchmark 默认把正确数据交给 Agent 时，它测到的更多是"给定数据后的代码能力"，而不是真实工作流中 Code Agent 的完整能力。CoDA-Bench 通过移除这个隐藏前提，揭示了一个令人警醒的事实：当前 Code Agent 的"真实可用率"可能远低于基准报告的数值。

### Kaggle 生态驱动的干扰设计哲学

CoDA-Bench 的干扰数据构造方式值得深入分析。它没有使用随机噪声文件（这在实践中很容易被 Agent 通过文件名或关键词过滤），而是基于 Kaggle 数据集共现关系构建了语义相近的干扰社区。

这种设计背后的哲学是：**真实世界中的"数据发现"难题不在于文件多，而在于文件看起来都相关但真正需要的只有一个**。Agent 不能只靠关键词匹配，而必须真正理解任务需求和数据内容——这更接近人类数据分析师的工作方式。一个人类分析师在面对一堆销售数据时，也需要理解"这个任务是分析季度增长还是客户流失"来选择正确的数据源。

### Code Intelligence 与 Data Intelligence 的分离

CoDA-Bench 的技术贡献在于将 Code Agent 能力进行正交分解。Code Intelligence 解决的是"如何写"的问题——给定数据和查询，生成正确的分析代码。Data Intelligence 解决的是"用什么"的问题——在复杂环境中找到正确的数据。

这两者不仅在技能栈上不同，在 Agent 的系统设计上也对应不同的工程挑战：
- **Code Intelligence** 优化方向：代码生成质量、错误处理、运行时调试
- **Data Intelligence** 优化方向：文件系统探索策略、schema 理解、数据相关性判断

大多数现有 Agent 框架和基准都只优化了前者而忽视了后者。CoDA-Bench 证明，即使 Code Intelligence 达到很高水平（Oracle 实验显示可提升 20-30 个百分点），Data Intelligence 的短板仍然会严重制约整体任务表现。

### 对 Code Agent 生产部署的启示

CoDA-Bench 的发现与生产环境中 Code Agent 的部署经验高度吻合。在生产中，Agent 经常遇到的不是"写不出代码"，而是"读错了数据"——选择了错误的表、错误的列、错误的聚合方式。这与 CoDA-Bench 的核心发现一致：数据发现能力是 Code Agent 从"能跑通 Demo"到"能投入生产"之间的关键门槛。

## 实践启示

1. **不要在基准选型时只看代码生成指标**：在选择 Code Agent 的评测基准时，应优先考虑包含数据发现维度的基准（如 CoDA-Bench），而不仅仅是 SWE-Bench 等纯代码修改基准。

2. **为生产环境中的 Agent 设计数据探索策略**：在构建 Code Agent 系统时，应为文件系统探索设计显式的策略——包括目录遍历的深度限制、文件类型过滤的规则、schema 发现的工作流。

3. **将 Data Intelligence 纳入 Agent 评测体系**：在内部 Agent 评测中，应加入"数据发现准确率"作为独立指标，与"代码执行准确率"并列评估，才能全面反映 Agent 的真实能力。

4. **利用相似数据干扰测试 Agent 鲁棒性**：在测试 Agent 的鲁棒性时，不要仅使用随机噪声数据，应构造语义相似的干扰数据来模拟真实场景。

5. **构建领域特化的数据映射层**：对于需要频繁分析特定领域数据的 Agent，建议构建领域特化的数据映射层（Data Catalog），预先标注关键数据的 schema、语义标签和典型查询模式，以降低 Data Intelligence 的实时探索负担。

## 相关实体

- [ProgramBench / SWE-agent Benchmark](../ch04/538-programbench-swe-agent-benchmark.html) — 传统 Agent 基准，主要关注代码修改能力
- [VitaBench 2.0](../ch01/888-20.html) — 真实生活场景中长期动态用户建模基准，互补关注个性化维度
- [QoderWork 诊断](../ch01/769-qoder.html) — 生产环境中 Agent 在复杂目录结构下的行为问题
- [QoderWork Skills 实践](../ch03/070-skills.html) — 数据科学场景下 Agent 的工作流封装
- [Agent AI 系统架构](../ch05/087-harness-skill.html) — Agent 系统的工程架构设计模式

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/raw-coda-bench-code-agent-data-benchmark-renmin-2026.md)

---

