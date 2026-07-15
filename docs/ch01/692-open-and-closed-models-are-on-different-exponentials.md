# Open and Closed Models Are on Different Exponentials

## Ch01.692 Open and Closed Models Are on Different Exponentials

> 📊 Level ⭐⭐ | 6.7KB | `entities/interconnects-ai-p-open-and-closed-models-are-on-different.md`

# Open and Closed Models Are on Different Exponentials

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/interconnects-ai-p-open-and-closed-models-are-on-different.md)

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

## 实践启示

1. **企业 AI 策略应双轨并行**：关键知识工作使用前沿闭源模型，内部工具和利基场景使用开源模型
2. **关注开源微调栈成熟度**：Tinker、Fireworks、Prime Intellect 等平台正在降低开源模型定制化门槛
3. **避免"benchmark 追赶陷阱"**：开源模型应聚焦利基场景的实用价值，而非在通用 benchmark 上追赶前沿
4. **评估 coding agent 的 ROI**：如果团队依赖 coding agent 工作，前沿模型的溢价可能完全合理
5. **长期布局开源推理基础设施**：开源推理份额将持续增长，提前建立相关能力和流程

## 相关实体

- 模型经济学
- [Karpathy: Vibe Coding 到 Agentic Engineering](../ch04/669-karpathy-vibe-coding-agentic-engineering.html)
- Anthropic Claude
- OpenAI
- 开源 AI

---

