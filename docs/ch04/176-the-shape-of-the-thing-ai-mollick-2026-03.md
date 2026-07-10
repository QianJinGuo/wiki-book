# The Shape of the Thing：AI 指数曲线·软件工厂·滚动颠覆（Mollick 2026-03）

## Ch04.176 The Shape of the Thing：AI 指数曲线·软件工厂·滚动颠覆（Mollick 2026-03）

> 📊 Level ⭐⭐ | 12.2KB | `entities/the-shape-of-the-thing-mollick.md`

# The Shape of the Thing：AI 指数曲线·软件工厂·滚动颠覆（Mollick 2026-03）

> 2026-06-07 引用自 Ethan Mollick《The Shape of the Thing》，One Useful Thing，2026-03-12。

## AI 能力指数曲线

Mollick 用多个 diverse benchmarks 证明 AI 能力呈指数上升：

| Benchmark | 测试内容 | 当前水平 |
|-----------|---------|---------|
| **Google-Proof Q&A** | 研究生水平知识题 | AI 94% vs 非专家 34%/专家 70% |
| **GDPval** | 4-7 小时真实专家任务 | AI 在 82% 的任务上持平或击败人类 |
| **Humanity's Last Exam** | 大学专家级别问题 | 持续快速提升 |
| **PPBench puzzles** | AI 解决推理谜题 | 持续提升 |
| **METR Long Tasks** | AI 自主完成人类工作时长 | 持续指数增长 |

## StrongDM Software Factory 案例

三人团队构建了**完全不需要人类写代码或 review** 的软件工厂：

**规则**：
- "Code must not be written by humans"
- "Code must not be reviewed by humans"

**运行方式**：
- 人类提供产品 roadmap（未来功能规划）
- Coding agents 用 roadmap 构建软件
- Testing agents 在模拟客户环境中测试软件（测试 agent 自己构建测试环境）
- 两组 agent 互相反馈迭代
- 最终结果人类 review 后直接发给客户
- **无需任何人看代码**

**成本**：每位 human engineer 每天约 $1,000 AI token 费用（相当于自身工资）。

详见 Simon Willison 和 Dan Shapiro 的第一手观察报告。

## Rolling Disruption 模式

一周内的三个案例说明"rolling disruption"如何运作：

| 日期 | 事件 | 表面现象 | 实际含义 |
|------|------|---------|---------|
| 2/22 | Citrini Research 发布 2028 年 AI 颠覆虚构场景 | 华尔街股价大幅波动 | AI 恐惧开始影响市场 |
| 2/26 | Block 宣布 40% 裁员（称因 AI） | AI 导致失业 | AI 被用作裁员借口，实际影响被夸大 |
| 2/27 | Pentagon vs Anthropic 关于 Claude 军事使用规则冲突 | 政府 vs AI 公司监管权之争 | AI 治理开始进入政策层面 |

**模式**：AI 能力跨越阈值 → 突然改变人们对 AI 的认知 → 市场/就业/政策同步反应。

## RSI：递归自我改进

主要 AI 公司明确将 RSI 列入路线图：

- **Anthropic（Dario Amodei）**：Davos 2025-01 解释用 coding + AI research 模型构建下一代模型；Anthropic 工程师几乎不再自己写代码
- **OpenAI**：2025-02 发布 Codex 时声明"第一个对自己创建有实质贡献的模型"
- **Google DeepMind（Demis Hassabis）**：所有主要实验室都在积极关闭 self-improvement loop

RSI 仍可能遇到瓶颈（算力/数据/研究难度），但它已不再是科幻——而是每个主要实验室的明确目标。

## 我们仍在窗口期

Mollick 的核心论点：**我们可以看到 Shape of the Thing，但我们仍然可以 influence 它**。

原因：
- 我们还没有 AI 使用规则或 role model
- 每个正在弄清楚如何用好 AI 的组织都在为其他人树立先例
- 塑造 AI 的窗口可能不会持续太久

## 关键引用

> "The instability of that single week in February was a preview of what it feels like when the increasing ability of AI starts to interact with markets, jobs, and governments all at once."

> "We can see the shape of the Thing now, but we can still influence the Thing itself, and what it means for all of us."

> "Engineers within Anthropic barely write code themselves anymore."

## 相关主题

- [Jagged Ai Frontier Mollick](../ch05/081-ai.html) — Jagged Frontier / Bottleneck / Reverse Salient（Mollick 的能力地图框架）
- [Co Existence Paradigm Shift Agentic Ai Mollick 2026](../ch01/584-ai-mollick.html) — Co-Existence 范式（Mollick 2026-06 更新，更激进的 agentic 叙事）
- [Management As Ai Superpower Mollick](../ch01/527-management-as-ai-superpower.html) — 管理作为 AI 超级能力（同一作者，delegation 方程）
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-shape-of-the-thing.md)

## 深度分析

### 指数曲线的含义：从"渐进"到"跨越"

Mollick 的多个 benchmarks 图表指向同一个结论：AI 能力不是渐进增长，而是在特定阶段出现跨越。^ 这与传统的 S 曲线技术采用模型不同——AI 的指数曲线是跨任务的统一现象，从图像生成到软件工程到复杂推理，都遵循同一轨迹。关键在于，这种指数增长不是自然规律，而是多个独立研发团队在相同方向上投入算力和数据的综合结果。当 METR、GPQA、GDPval、Humanity's Last Exam 全部呈现相似曲线时，指向的是系统性的技术进步而非个别突破。这意味着 AI 能力的提升不是靠某个天才的灵光一现，而是靠可复制、可预测的工程迭代。这让预测 AI 的发展轨迹变得比预测传统技术更"科学"——虽然具体时间点仍有不确定性，但曲线的形状是可以观察的。

### StrongDM 软件工厂的组织创新含义

StrongDM 的实验意义不在于"AI 能写代码"，而在于它彻底重构了软件生产的组织形式。^ 传统软件工程依赖"人类写代码 → 人类 review → 人类部署"的线性链条，而软件工厂将人类退化为"产品 roadmap 提供者"和"最终结果 review 者"，中间所有环节都由 AI agents 自主完成。两组 agents（coding + testing）互相反馈迭代，形成自我纠正的循环，这实际上是某种形式的 continuous integration/continuous deployment (CI/CD)，只不过 pipeline 中的执行者从人类工程师变成了 AI 系统。成本结构也因此改变：每位 human engineer 每天 $1,000 AI token 的消耗与其工资相当，意味着 AI 的边际成本正在与人类劳动的替代成本趋同。这不仅是效率提升，更是组织结构的根本性重设计。

### Rolling Disruption 的机制：能力阈值触发多维连锁反应

Mollick 观察到的一周内三个事件（Citrini Research 报告、Block 裁员、Pentagon vs Anthropic）看似独立，实际上共享同一机制：AI 能力跨越某个阈值 → 触发人们对"AI 能做什么"的认知更新 → 市场、就业、政策同时反应。^ 这种滚动的连锁反应比传统技术采用周期更快，因为 AI 的能力变化会直接影响信息传播速度和决策速度。华尔街可以在几天内对一份虚构报告做出大幅股价波动反应，说明市场对 AI 叙事的高度敏感性。Block 将 AI 作为裁员借口，则说明 AI 影响不仅来自实际能力变化，也来自社会叙事的变化。Pentagon vs Anthropic 的冲突则显示，AI 能力的增长正在将 AI 公司推向与政府政策直接对抗的位置。这三个维度——市场、劳动力市场、政策——会在 AI 能力继续提升时持续相互强化。

### RSI 的真实含义：不再是理论，而是工程路线图

递归自我改进（RSI）在 2025 年之前更多是理论概念，2025 年之后成为明确工程目标。^ Dario Amodei 在 Davos 2025 的表述（用 coding + AI research 模型构建下一代模型）、OpenAI 称 Codex 为"第一个对自己创建有实质贡献的模型"、Demis Hassabis 确认所有主要实验室都在关闭 self-improvement loop——这些不是推测，而是公司战略陈述。关键是"关闭 loop"这个表述：实验室不是在探索 RSI 是否可能，而是在积极解决工程问题使 RSI 成为现实。如果 RSI loop 最终关闭，指数曲线会变得更陡，因为反馈循环会自我加速。这并不意味着一定会达到 AGI，但确实意味着 AI 能力的提升速度会持续超出大多数组织的预期和准备水平。

### 窗口期的本质：规则真空中的先行者优势

Mollick 强调"我们仍在窗口期"，核心论点是：我们还没有 AI 使用规则或 role model。^ 这意味着每个组织在 2026 年做出的 AI 采用决策，实际上都在为其他所有组织设定先例。Simon Willison 和 Dan Shapiro 观察 StrongDM 软件工厂后撰写的第一手报告，正在成为其他组织规划 AI 采用的参考框架。这种"规则真空"的状态不会持续太久——随着越来越多组织确立实践，行业标准会逐渐形成，先行者的实验会变成后来的规范。因此，2026 年的 AI 决策不仅关乎效率，也关乎标准制定权。早期采用者不只是"先用 AI 的组织"，而是"定义 AI 怎么用才算合理的组织"。

## 实践启示

### 立即行动：将 AI 采用视为组织能力建设，而非效率工具

大多数组织仍在将 AI 视为"提高效率的工具"，但 Mollick 的分析指向更深层的转变：AI 正在重塑组织结构和竞争规则。^ 实践建议：成立专门的工作组，系统性地映射 AI 能力边界与组织流程的匹配程度。不要仅关注"AI 能帮我做什么"，而是问"哪些组织结构会因为 AI 而变得过时"。StrongDM 的软件工厂不是效率提升项目，而是组织重设计实验。

### 监控能力阈值：建立 AI 进展的早期预警系统

Rolling Disruption 的特征是 AI 能力跨越阈值后产生的连锁反应。^ 实践建议：建立跨职能的 AI 情报小组，持续追踪 METR、GPQA、GDPval 等 benchmarks 的变化趋势，以及主要 AI 公司的产品发布周期。目标是提前识别"能力跨越"可能引发的市场、政策、组织反应，而非事后被动应对。订阅主要 AI 公司的发布说明、关注 METR 的定期更新，都是低成本的情报来源。

### 重新设计工作流程：以"无人类写代码/review"为假设前提

StrongDM 的两条规则（Code must not be written by humans / Code must not be reviewed by humans）代表了一种激进但可实现的组织设计。^ 实践建议：选择团队内一个具体的软件工程流程，尝试设计一个"零人类编写/ review 代码"的版本。即使不完全实施，这个练习也会暴露当前工作流程中对人类直接参与的隐性依赖，并揭示 AI 可以介入的节点。关键是改变问题框架：从"AI 能帮人类做什么"到"人类不在代码链中时系统怎么运转"。

### 参与标准形成：记录并分享你的 AI 采用实践

Mollick 强调每个正在弄清楚如何用好 AI 的组织都在为其他人树立先例。^ 实践建议：主动记录团队在 AI 采用过程中发现的有效方法和失败教训，通过内部 wiki、行业会议、博客等渠道分享。在规则真空期，实践者的经验会成为行业标准的基础。StrongDM 公开了软件工厂的技术细节，Simon Willison 和 Dan Shapiro 写了第一手观察报告——这些都成为全行业的参考资源。你组织的 AI 实验记录，可能是行业急需的参考资料。

### 为 RSI 做准备：评估现有流程的递归自我改进潜力

RSI 路线图已经明确（Anthropic/OpenAI/Google DeepMind 都在推进），这意味着 AI 能力的提升速度不会减缓，只会加速。^ 实践建议：盘点组织内哪些流程当前完全依赖人类判断，而这些判断本身可以被 AI 训练数据捕获和迭代。RSI 的核心是 AI 用历史数据改进 AI——如果你的组织在某些领域积累了大量高质量的过程数据，这些数据可能就是未来 RSI 系统的重要输入。主动建立高质量的数据 pipeline，就是在为未来的 RSI 竞争做准备。

---

