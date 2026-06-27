# Karpathy's Autoresearch found a 3-year-old bug in our query engine (and improved performance by 11%) - PostHog

## Ch01.008 Karpathy's Autoresearch found a 3-year-old bug in our query engine (and improved performance by 11%) - PostHog

> 📊 Level ⭐ | 14.4KB | `entities/https-posthog-com-blog-karpathy-autoresearch-query-engine-bug.md`

# Karpathy's Autoresearch found a 3-year-old bug in our query engine (and improved performance by 11%) - PostHog

## 概述

Newsletter 评分 8×9=72，stars=4，来源 URL: https://posthog.com/blog/karpathy-autoresearch-query-engine-bug

## 正文要点

Published Time: Wed, 03 Jun 2026 11:24:08 GMT

A few weeks ago at a team offsite in Lisbon, we pointed an AI agent at our query engine, fed it slow queries from production, and let it run overnight.

By the next morning it had found something embarrassing: for almost three years, every query with a timestamp filter had not been using ClickHouse's primary key correctly. [The fix](https://github.com/PostHog/posthog/pull/54819) cut the number of granules ClickHouse had to scan by 62% on the benchmark query, and made the query itself meaningfully faster.

This post is about the setup we used, the bug itself, and what we're building now so this kind of analysis happens automatically.

The general idea isn't ours. Andrej Karpathy [packaged it up](https://github.com/karpathy/autoresearch) and gave it a name in March 2026: give an AI agent a small but real system, a benchmark, and a budget, and let it loop; propose a change, run the benchmark, keep what helps, throw away what doesn't.

Karpathy ran it for two days against a depth-12 nanochat training run and found [about 20 changes that improved validation loss](https://x.com/karpathy/status/2031135152349524125), some of which transferred to a bigger model. The shape isn't new (DeepMind's [FunSearch](https://www.nature.com/articles/s41586-023-06924-6) (2023) and [Sakana's AI Scientist](https://sakana.ai/ai-scientist/) (2024) are earlier examples), but Karpathy's repo is small and concrete enough to inspire you to build your own version in an afternoon.

The interesting part for us is the second-order effect: the agent doesn't carry the bias that comes from living in a codebase. To us, the `toTimeZone()` wrap had just always been there. The kind of code you stop seeing. The agent has no priors. It runs every diagnostic, reads the surrounding ClickHouse and PostHog source for context, and treats a three-year-old expression with the same suspicion as the line you wrote yesterday.

Every year, we run [hackathons](https://posthog.com/newsletter/hackathons) at company offsites. A lot of what's now PostHog ([session replay](https://posthog.com/session-replay), the [data warehouse](https://posthog.com/data-warehouse), [logs](https://posthog.com/logs), and more) started this way. At a smaller joint team offsite for the [Analytics Platform](https://posthog.com/teams/analytics-platform) and [Query Performance](https://posthog.com/teams/query-performance) teams in Lisbon, our hackathon project was to do Karpathy's thing, but for ClickHouse query performance.

The stack we used: **pi** (small terminal coding agent by Mario Zechner), **pi-autoresearch** (community extension by davebcn87 wiring Karpathy's loop into pi), a **campaign orchestration contract** on top (structuring each investigation into campaign → lane → hypothesis → experiment), and a **throwaway ClickHouse test cluster** for high iteration speed and predictable benchmarks .

Range-narrowing: when a target query times out, the agent halves the range (30d→14d→7d→3d→1d) until it completes in 1-10 seconds, then optimizes against that narrowed version — short enough for fast iteration but long enough that index and partition effects still matter .

The core bug: PostHog's events table uses `PARTITION BY toYYYYMM(timestamp)` and primary key `(team_id, toDate(timestamp), event, …)`. When per-team timezone support was added to HogQL in April 2023, every `timestamp` reference was wrapped in `toTimeZone(timestamp, team_tz)`. The ClickHouse query planner **cannot see through `toTimeZone()`** — it couldn't derive bounds on `toYYYYMM(timestamp)` (partition pruning off) or `toDate(timestamp)` (primary key used only up to `event`, not time dimension) .

Why it hid for 3 years: ClickHouse MinMax skip index on `timestamp` provided a weak fallback — queries weren't catastrophically slow, just measurably slower. No alert triggered, nobody could A/B compare against a "good" version (since there was none). The smoking gun lives in `EXPLAIN PLAN indexes=1, json=1`, which nobody runs unless they already suspect something .

The fix: rewrite comparison so the field side is bare and the constant carries the timezone — semantics identical because `toTimeZone()` only changes display metadata, underlying epoch unchanged. Result on 7-day funnel: 37% trimmed mean improvement, 62% granule reduction .

Future pipeline: ① fetch slow queries from `system.query_log` ② spin up sandbox per query ③ run pi-autoresearch ④ LLM dedup + spawn PostHog Code session ⑤ PR to Slack for human review .

## 深度分析

### 1. Autoresearch 的领域迁移：从模型训练到查询性能优化 

Karpathy 的 autoresearch 最初用于 nanochat 训练场景——给 AI agent 一个小型真实系统、benchmark 和预算，让它循环迭代优化提案。PostHog 的关键洞察是：这套范式可以完整迁移到 ClickHouse 查询性能领域。两者共享相同基础结构：目标系统（训练 loop vs. 查询引擎）、可量化指标（validation loss vs. 查询延迟）、允许快循环迭代的环境。差异在于：模型训练输出权重文件，查询引擎输出 SQL rewrite 或代码变更。这种迁移能成功的关键在于 autoresearch 框架的极简设计——Mario Zechner 的 pi terminal agent + davebcn87 的 pi-autoresearch 插件足够小到可以按领域需求重新构建。

### 2. Campaign-Lane-Hypothesis-Experiment 四层模型：让 AI 调查具备工程判断力 

PostHog 在 pi-autoresearch 之上构建了"调查编排合同"，将无结构的优化循环转化为可执行的调查框架。**Lane** 对应优化方向（predicate ordering、JSON 解析、时区处理、主键使用等），可暂停/分裂/合并；**Hypothesis** 将模糊优化直觉转化为可证伪的实验声明；**Experiment** 的单次 run+benchmark+verdict 配合强制 reflection pass，阻止 agent 在局部最优解上无限 hill-climb。Lane 级别的动态调整机制模拟了人类工程师面对多假设同时推进时的决策框架，使 agent 探索具备工程判断力而非单纯随机搜索。

### 3. `toTimeZone()` 导致 ClickHouse 主键失效的根因分析 

这是全文最核心的技术分析。`toTimeZone(timestamp, team_tz)` 包裹后 ClickHouse query planner 无法推导两类边界：① `toYYYYMM(timestamp)` 无法从 `toTimeZone(timestamp, tz) >= '2024-03-01'` 中提取，分区裁剪完全失效；② `toDate(timestamp)` 无法提取，主键只用于 `team_id` 和 `event`，停在 `event` 级别而非时间维度。MinMax skip index 作为弱兜底（granule 级别 min/max 过滤）使查询"能工作但明显慢"，解释了为何三年来无人察觉——没有告警，没有可用的"好版本"做 A/B 对比，诊断工具 `EXPLAIN PLAN indexes=1, json=1` 也无人主动运行。

### 4. AI Agent 作为"去偏见探测器"：认知惯性移除的价值 

文章最有启发性的分析在于揭示组织层面的认知盲区：**代码的"无人感知"不等于"正确"**。人类对"一直存在的代码"产生 habituation（习惯化）——不再质疑、不再审视。`toTimeZone()` 包裹是 2023 年 4 月引入的合理改动，在团队认知中已被同化为"本来就应该这样"，使所有后续维护者失去质疑动机。AI agent 的核心优势在这里不是"更聪明"，而是 **"零认知惯性"**——它将三年的代码和昨天写的代码同等对待，系统性运行所有诊断而不依赖人类的"第六感"。这与 Karpathy LLM Wiki V2 中关于 LLM 自身偏见问题的讨论形成有趣的呼应。

### 5. Range Narrowing：平衡迭代速度与基准真实性的有效技巧 

当目标查询超时时，agent 将范围对半分（30天→14天→7天→3天→1天），直到查询能在 1-10 秒内完成。这个 window 既保证了 inner loop 的快速迭代，又确保了索引和分区效应仍然有效。当前最佳候选定期在完整范围重新测试；通过验证后 campaign "毕业"回到原始查询。核心启示：**AI agent 的基准环境不需要与生产环境完全一致，只需要保持影响待优化问题的关键约束条件不变**。这为 Inference 优化 中关于"实验环境与生产环境的关键约束对齐"提供了具体案例。

## 实践启示

### 1. 为 Autoresearch 性能调查准备独立的基准测试集群 

开发者笔记本运行基准测试太慢，生产环境有 noisy neighbors 且危及客户查询。正确做法：准备与生产数据结构相同但已匿名化、运行在廉价独立硬件上的 throwaway 测试集群。这保证基准可重复性同时不危害生产稳定性，是开展 AI-driven 查询优化调查的前提条件。与 生产级智能体工程 中关于隔离执行环境的最佳实践一致。

### 2. 用 Campaign-Lane 结构将开放优化问题转化为可管理的探索组合 

当一个 ClickHouse 查询有数百种可行 rewrite 时，无结构的 AI agent 优化循环容易在局部最优解上浪费大量 budget。用 lane 对应不同优化方向（predicate ordering、JSON 解析、时区处理、主键使用等），每个 lane 内有可证伪的 hypothesis，hypothesis 内有具体 experiment。Lane 级别可暂停/分裂/合并机制允许调查过程动态调整重点。在构建 智能体编排模式 时，这种分形结构是让 AI agent 产生工程级输出的关键设计。

### 3. 将 `EXPLAIN PLAN indexes=1, json=1` 作为每个 Experiment 的标准诊断步骤 

整个 bug 发现的触发点是 Autoresearch agent 在 lane 中主动运行 `EXPLAIN` 并识别出 `Partition: Condition='true'`。在构建 AI-driven 查询优化 pipeline 时，应将 `EXPLAIN` 系列命令作为每个 experiment 的标准输出，强制 agent 阅读并解释 planner 决策。核心洞察：**让 AI agent 不只优化结果，还要理解并解释优化对象的决策过程**。这与 Inference 优化 中"推理过程可视化"的重要性同一思维模式。

### 4. 构建从 `system.query_log` 到 Pull Request 的全自动持续优化 Pipeline 

PostHog 正在将 hackathon 手工喂入模式升级为全自动 pipeline：① 从 `system.query_log` 自动抓取慢查询 ② 为每个候选查询启动独立沙箱 ③ 在各沙箱中运行 pi-autoresearch ④ LLM 去重合并建议并启动 PostHog Code session 写代码变更和测试 ⑤ 将 PR 推送至 Slack 由人工审核合并。Pipeline 每一步都应该自动化到可完全无人值守运行，human 仅在最终审查阶段介入。这与 Coding Agent 架构 中"AI agent 自主完成任务 + 人类最终确认"的混合模式一致。

### 5. 对"一直存在的代码"保持主动怀疑：用 AI 定期重新审视历史决策 

`toTimeZone()` 包裹被团队习惯化而失去质疑动机，最终靠 AI agent 才重见天日。实践启示：组织应建立机制，用 AI 定期重新审视历史决策——特别是那些被标记为"本来就应该这样"的核心基础设施代码。这类代码的隐性技术债往往比新引入的代码风险更高，因为没有人在寻找它们。Autoresearch 框架的价值不仅在于单次 hackathon 优化，更在于将其制度化为持续的质量保障基础设施。

## 相关实体
- [Akamai Acquires Israeli Ai Browser Security Startup Layerx For 205 Million In Ca](/ch01-040-akamai-acquires-israeli-ai-browser-security-startup-layerx-f/)
- [Clinereleasesopen Sourceagentruntimesdk](/ch01-102-cline-releases-open-source-agent-runtime-sdk/)
- [Running An Ai Native Engineering Org](/ch01-045-running-an-ai-native-engineering-org/)
- [Pytorch212Releaseblogpytorch](/ch01-089-pytorch-2-12-release-blog-pytorch/)
- [Igor Babuschkin Seeks Up To 1 Billion For River Ai](/ch01-135-igor-babuschkin-seeks-up-to-1-billion-for-river-ai/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/https-posthog-com-blog-karpathy-autoresearch-query-engine-bug.md)

---

