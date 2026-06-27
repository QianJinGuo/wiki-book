# How far behind are open models? (LessWrong 2026-05)

## Ch01.405 How far behind are open models? (LessWrong 2026-05)

> 📊 Level ⭐⭐ | 9.0KB | `entities/how-far-behind-are-open-models-2026.md`

# How far behind are open models? (LessWrong 2026-05)

> **Background**: Håvard Tveit Ihle 用 17 个 benchmark (8 private + 9 public, ~110 数据点) 量化开源 vs 闭源模型能力差距。结论：private benchmark 上开源落后 8-10 个月，public benchmark 落后 4-6 个月，且差距在 DeepSeek R1 之后正在扩大。

## 核心发现

### 1. 当前差距（2026-05）

- **Private benchmarks**：开源落后闭源前沿 **8-10 个月**
- **Public benchmarks**：开源落后闭源前沿 **4-6 个月**
- Public benchmark 低估真实差距接近 2 倍

### 2. 差距时间趋势

- **DeepSeek R1 (2025-01) 时刻**：差距最小
- **R1 之后**：差距持续扩大
- 闭源前沿（OpenAI, Anthropic, Google）持续保持领先

### 3. Provider degradation 可能夸大差距

- 闭源 API 的实际表现可能因系统优化降级（degradation）而被高估
- 真实差距可能略小于 8-10 个月

## 数据来源

- 17 个 benchmark
- 8 private（数据不公开） + 9 public
- ~110 (benchmark, score-threshold) 数据点
- 所有数据和代码开源：`github.com/htihle/open_closed_gap`
- 旧数据（2023-2024）部分为自报告分数，新数据更可靠

## 方法论

- 每个数据点：开源模型首次达到某 score-threshold 的日期
- 高度：该 threshold 在闭源前沿首次被超过的日期差
- Gaussian-smoothed trend + 90% bootstrap bands
- Private vs Public 用不同 marker (stars vs circles)

## 反向/前瞻视角

- 数字是 **backward-looking**（现在的开源 ≈ 几个月前的闭源）
- 前瞻预测（forward-looking）需要考虑开源近期是否会有新突破

## 与中国模型

- 文章单独讨论中国开源模型（Kimi, DeepSeek, Qwen, Z.ai 等）
- 这些模型在某些 benchmark 上接近前沿，但在 private benchmark 上仍有差距

## 启示

### 对 AI 行业

- 闭源前沿仍有 ~10 个月技术领先
- 差距在扩大（不是缩小）
- 开源追上"代理/agentic harness 实用水平"可能需要 12+ 个月

### 对开发者

- 生产级 agent 任务用闭源（Codex, Claude Code）更可靠
- 自动化/低成本任务可用开源
- 不要仅凭 public benchmark 选模型（低估差距）

## 与 Interconnects 洞察的呼应

Nathan Lambert 在"Some ideas for what comes next"中提到：
- 开源-闭源差距不会按 benchmark 收窄
- 实际 agentic harness 适用性才是真正检验
- 12+ 个月才能追平

本文用数据支撑了这一论断。

## 待关注

- 2026 下半年新模型发布（GPT 5.5+, Opus 5+, Gemini 4+）
- 开源前沿是否会有突破
- Provider degradation 的量化分析

## 深度分析

### 1. Winner’s curse 导致测量偏差系统性偏大

该研究的方法论存在一个结构性偏差：Winner's curse — 第一个越过阈值的模型往往代表了正向波动。在 benchmark 测试中，闭源实验室（OpenAI、Anthropic、Google）通常测试更多模型，这意味着它们更频繁地成为"第一个穿越者"，从而系统性高估闭源前沿的领先幅度。

此外，文章作者自己也承认，闭源一方通常测试更多模型，这进一步加剧了 winner's curse 对闭源有利的不对称性。如果控制这一偏差，真实差距可能比 8-10 个月稍小，但方向不变。

### 2. Provider degradation 对 Private benchmark 的不对称影响

Private benchmark（如 METR Time Horizons、FrontierMath、ARC-AGI-2）需要通过第三方 provider 调用开源模型以保护数据隐私。METR、Epoch AI 和 Håvard Tveit Ihle 都使用了零数据保留的第三方 provider。然而，这种间接调用方式可能导致微妙的性能降级（subtle degradation），且难以完全排除。

这种情况对 private benchmark 产生了系统性偏差：高估了闭源优势，因为闭源一方通过自有 API 直接调用，没有中间 provider 的性能损失。真实差距应小于 8-10 个月。

### 3. DeepSeek R1 时刻：异常点还是趋势反转？

数据显示 DeepSeek R1（2025 年 1 月）是开源-闭源差距最小的时刻，此后差距持续扩大。这提供了一个重要信息：R1 代表了开源模型能力的一次真实跃升，而非昙花一现的优化结果。

然而，R1 之后差距扩大表明闭源前沿以更快的速度在推进。闭源实验室拥有更多计算资源、更大规模的人类反馈数据，以及更丰富的企业级应用场景反馈，这使得它们能够在开源追上的同时保持并扩大领先优势。

### 4. Public vs Private ~2x 比率揭示的训练行为差异

Public benchmark（GSM8K、MMLU、Aider Polyglot）上开源落后 4-6 个月，而 Private benchmark 上落后 8-10 个月——两者相差近 2 倍。这一比率不是随机噪声，而是反映了两种不同的训练机制：

Public benchmark 由于数据公开且分数透明，开源社区可以针对性地进行训练优化（包括对测试集的潜在过拟合）。Private benchmark 更接近真实能力评估，揭示了开源模型在无法直接优化的场景下的真实差距。这一结构差异意味着：仅看 public benchmark 会严重低估实际能力差距。

### 5. 前瞻性差距本质上无法从回溯性数据中得出

文章的核心数字（8-10 个月）是回溯性指标：它描述的是"今天的顶级开源模型 ≈ 几个月前的顶级闭源模型"。这并不等于"开源需要 8-10 个月才能追平"。

真实的向前看预测需要考虑：是否有新的开源突破即将出现（类似 R1 时刻）、闭源前沿的进步速度是否可能放缓、以及是否有新的架构变革可能改变竞争格局。因此，8-10 个月的回溯性差距不能直接用作前瞻性规划依据。

## 实践启示

### 对 AI 研究者

- 在设计 benchmark 时，优先参考 private benchmark 的评估结果；public benchmark 的数字应作为参考下限而非真实能力指标
- 评估开源模型时，优先使用独立第三方 runner（如 Epoch AI）的数据，而非各实验室自报告的分数
- 关注 provider degradation 对评测结果的影响——在评估开源模型时应比较多个 provider 的表现

### 对产品经理

- 生产级自主任务（如代码生成、复杂推理、多步骤 agent）应选用闭源模型（如 Codex 或 Claude Code），开源模型在 8-10 个月的回溯差距下可靠性不足
- 低价值、高容错率的自动化任务（如摘要、翻译）可考虑使用开源模型（open-weights models）以降低成本
- 在做模型选型时，要求供应商提供 private benchmark 数据，而非仅参考公开 leaderboard

### 对 AI 战略规划者

- 以 12+ 个月作为开源追上"agentic harness 实用水平"的时间规划基准，而非 8-10 个月
- 避免基于 public benchmark 建立竞争优势判断——这些数字系统性低估了闭源优势（近 2 倍）
- 关注 2026 下半年闭源前沿新模型发布（GPT 5.5+、Opus 5+、Gemini 4+）对开源追赶周期的潜在影响

### 对开源社区

- DeepSeek R1 的成功表明开源在推理能力上存在突破路径；持续扩大差距说明闭源在 scaling 和数据飞轮上建立了更深壁垒
- 减少 public benchmark 优化（容易过拟合且效果有限），转向对真实任务能力的提升
- 关注 METR Time Horizons 等 agentic 评估——这是最终衡量标准

### 对风控与合规团队

- 在高风险场景（如金融、医疗、法律）的 AI 应用中，开源模型的 8-10 个月回溯差距意味着闭源模型在这些领域的安全边际更优
- 评估是否需要人类在环（human-in-the-loop）时，应考虑开源模型在复杂推理任务上与闭源的前沿差距
- 对使用开源模型进行敏感任务的情况，建立更频繁的人工审核机制

## 相关实体
- [Mollick Ai 32 Otters Benchmark](/ch01-441-mollick-ai-进展的-32-只水獭基准/)
- [Some Ideas For What Comes Next May 2026](/ch01-910-some-ideas-for-what-comes-next-may-2026-interconnects/)
- Good Qc For Rl Data
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](/ch04-141-agenteval-yaml驱动的agent评测框架/)
- [Langsmith Evaluation Concepts](/ch03-119-langsmith-evaluation-concepts/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-far-behind-are-open-models-2026.md)
- nice：浙大提出的理论驱动型 llm 社会智能诊断基准

---

