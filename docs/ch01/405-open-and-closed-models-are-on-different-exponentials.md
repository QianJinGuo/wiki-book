# Open and Closed Models Are on Different Exponentials

> 📊 Level ⭐⭐⭐⭐ | 11.2KB

→ [原文存档](https://www.interconnects.ai/p/open-and-closed-models-are-on-different)

## 摘要

Interconnects（Nathan Lambert）撰文分析 AI 模型生态的核心经济张力：闭源前沿模型与开源模型正运行在两条不同的指数曲线上。闭源实验室（Anthropic、OpenAI）凭借 coding agent 的产品市场契合度，正在构建类似 Apple + Microsoft 的集成化高价壁垒；开源模型经济则走向更分散、更大总量但利润共享的 commodity 市场。核心论断：未来 5-10 年 OpenAI 和 Anthropic 估值将达 $2-10T，但开源模型生态的总体市场价值将远超两者之和。

## 核心要点

### 闭源前沿模型的集成化指数

**产品市场契合：Coding Agent 改变一切**

- Opus 4.5 和 Codex 5.2 之后，coding agent 的习惯改变已经固化——用户不是因为懒，而是因为净产出明显更高
- 依赖 coding agent 工作的人永远会为最好的模型付费，而非将就"够用"
- 作者表态：愿意为今天的工具付 $2000/月，而且知道它们会变得更好

**前沿实验室的类比：Apple + Microsoft**

- **Apple 侧**：销售集成化、极难复制的技术（模型权重 + harness + 工具 + 推理基础设施）
- **Microsoft 侧**：跨经济体销售高杠杆订阅
- 集成化优势体现在硬件与新型软件的结合，可在任何方向改进模型
- 模型在 benchmark 上可能饱和，但实验室会优化"每秒/每瓦智能"，继续提升实用价值

**API 业务的必然衰落**

- 实验室将意识到需要保护最佳模型，延迟 API 发布以保护 token 供应、避免蒸馏、聚焦高利润率用例
- 这些效应在 5-10 年时间线上将清晰可见

### 开源模型经济的分散化指数

**从追赶前沿到填补利基**

- 许多企业想切换到开源模型，但当前模型在分布外任务上仍不够好
- 最终开源模型构建者将停止在 Artificial Analysis 指数上追赶 Claude/GPT，转而填补利基
- 分叉可能由经济因素驱动（无法支撑持续扩大的研发成本）或纯需求驱动（某些 AI 方案只能存在于开源模型的低价点）

**分散化价值结构**

- 开源模型天然非集成化，依赖多家公司协调提供服务
- 每一层都有替代品，价格压至 commodity 水平
- 低且可预测的价格是许多企业进入的入口——找到在目标任务上达标模型后不再更换（设置成本高）
- 定制化趋势（Tinker、Fireworks、Prime Intellect 等微调栈）进一步扩大市场

**市场格局预测**

- 开源推理份额将在 Google/Amazon/Microsoft 超大规模云和 Together/Fireworks/OpenRouter 等新 AI 基础设施公司中稳步增长
- 闭源模型寡头垄断 vs 开源模型构建者和用户更加多样和众多
- 总市场价值将远超 OpenAI 和 Anthropic 的累计价值

### 两条指数曲线的核心差异

| 维度 | 闭源前沿 | 开源生态 |
|------|----------|----------|
| **增长模式** | 集成化指数：深度优化单一技术栈 | 分散化指数：广泛扩散到整个经济 |
| **价值捕取** | 高利润率，集中在少数公司 | 大总量，利润分散在整个技术栈 |
| **定价策略** | 高价订阅（类 iPhone） | Commodity 定价（类 Android 生态） |
| **竞争优势** | 人才 + 数据 + 计算的资本密集壁垒 | 生态多样性 + 低价格 + 定制化 |
| **代表公司** | OpenAI、Anthropic（+ Google） | Tinker、Fireworks、Prime Intellect、Together |

## 深度分析

### "不同的指数"意味着什么

Lambert 的核心洞察不是"开源 vs 闭源谁赢"，而是两者在**不同的维度上指数增长**。闭源模型沿着"绝对智能前沿"的指数增长——更高的推理能力、更强的 coding agent、更贵的订阅。开源模型沿着"经济渗透广度"的指数增长——更多的企业采用、更多的利基场景覆盖、更低的单位成本。

两者不是零和关系。闭源模型的 coding agent 市场确实存在巨大溢价空间，但这不意味着开源模型没有市场——相反，开源模型将服务大量闭源模型因价格门槛而无法触及的场景。

### RSI 论述的反驳

Lambert 明确反驳了"递归自我改进（RSI）将给闭源实验室带来不可逾越优势"的说法，认为这种论述被过度放大。新形态产品（如后台 Agent）可以同时支持开源和闭源模型。

### 对 AI Agent 生态的影响

coding agent 是当前唯一明确展示"用户愿意为更好智能支付大幅溢价"的领域。这验证了前沿实验室"追求绝对智能"的策略。但开源模型在 agent 领域的机会在于：大量企业需要的是"够用且可控"的 agent 方案，而非最强但最贵的方案。

### 溢价的经济学根基：为什么闭源模型敢于定价

Lambert 把争论起点放在经济学而非技术：决定开放与封闭生态力量对比的核心，是用户是否继续为顶级闭源模型支付大幅溢价。2026 年初是分水岭，因为 coding agent 首次证明巨大市场愿为"更好的智能"持续付费——净产出提升可感知，故永远选最强而非"够用"。

与溢价共存的是 API 业务的必然衰落：为保护 token 供应、避免蒸馏、聚焦高利润率用例，最佳模型会被延迟接入 API。一张一弛构成闭源侧的商业发动机：前端向最高价值用户收溢价，后端收缩低价分发。

### 集成化与分散化：两种组织智能生产的方式

闭源前沿实验室的本质优势是**集成**：模型权重、harness、工具与推理基础设施作为资本密集系统（人才、数据、算力的大投入），回报来自深度整合——软硬件耦合可体现在任何改进方向。即使 benchmark 饱和，实验室也会转向优化"每秒/每瓦的智能"，继续榨取未封顶的性能空间。

开源模型则天然**非集成**：它必须在多家公司协调下才能被服务，每一层都有替代品，价格因此被压到 commodity 水平。这看似劣势，实则是另一条曲线的起点：低且可预测的价格成为企业进入的入口，找到达标模型后便不再更换（设置成本高），而 Tinker、Fireworks、Prime Intellect 等微调栈的成熟会进一步放大市场。

### 对格局预测的含义：寡头与长尾并存

框架直接导出两个预测。其一，闭源侧收敛为类云计算市场的寡头：前沿实验室同时像 Apple（卖难复制的集成技术）和 Microsoft（卖高杠杆订阅），5-10 年内 OpenAI 与 Anthropic 估值达 $2-10T。 其二，开源生态总价值将远超两家之和，但分散在整个技术栈——其推理份额将在超大规模云与 Together/Fireworks/OpenRouter 等新基础设施公司中稳步上升。

关键在于这不是零和判断：开源模型的分叉由经济（研发成本难以为继）或需求（某些方案只存在于低价点）驱动，从追赶 Claude/GPT 的 benchmark 转向填补利基。两条曲线节奏也不同——闭源已借 coding agent 的产品市场契合启动集成化指数，开源经济更慢，但它追踪的是 AI 向整个经济的扩散，因而"更值得跟随"。

### 这个框架对预测方法论本身的启示

"不同指数"的框架优于单一叙事，在于把常见误判显式化。第一，"递归自我改进（RSI）将给闭源实验室不可逾越优势"的说法被作者判定为过度放大——进步持续出现在整个生态，后台 agent 等新产品可同时服务两类模型。 第二，近期市场的价格、利润率与需求由算力快速扩建（短期供给受限）和 token 补贴扭曲，这意味着任何基于当前定价的判断都混杂了周期性因素，只有拉到 5-10 年的时间线上才能看清结构性趋势。 第三，衡量标准不应统一：闭源看绝对智能前沿与每瓦效用，开源看渗透广度与利基覆盖率——用 benchmark 排名评判开源模型正是该框架要纠正的观测错误。

交叉印证：开源侧的分散化价值捕获与 [开源 AI 生态](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/open-source-ai-ecosystem.md) 一致，闭源侧的集成回报以 [Scaling Laws](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/scaling-laws.md) 持续有效为前提；蒸馏风险（API 收缩动机）参照 [模型蒸馏与压缩](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md)，开源窗口期的时间压力则与 [6 Months to Live for Open Models](https://github.com/QianJinGuo/wiki-public/blob/main/entities/6-months-to-live-for-open-models.md) 相呼应。

## 实践启示

1. **企业 AI 策略应双轨并行**：关键知识工作使用前沿闭源模型，内部工具和利基场景使用开源模型
2. **关注开源微调栈成熟度**：Tinker、Fireworks、Prime Intellect 等平台正在降低开源模型定制化门槛
3. **避免"benchmark 追赶陷阱"**：开源模型应聚焦利基场景的实用价值，而非在通用 benchmark 上追赶前沿
4. **评估 coding agent 的 ROI**：如果团队依赖 coding agent 工作，前沿模型的溢价可能完全合理
5. **长期布局开源推理基础设施**：开源推理份额将持续增长，提前建立相关能力和流程

## 相关实体

- 模型经济学
- Karpathy: Vibe Coding 到 Agentic Engineering
- Anthropic Claude
- OpenAI
- 开源 AI

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

