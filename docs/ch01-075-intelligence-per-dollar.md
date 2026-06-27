# Intelligence Per Dollar

## Ch01.075 Intelligence Per Dollar

> 📊 Level ⭐ | 6.2KB | `entities/tokens-per-result.md`

# Intelligence Per Dollar

## 概要

Published Time: 2026-06-03T00:00:00Z

Markdown Content:
[![Image 1: Screenshot 2026-06-02 at 9.22.43 PM](https://res.cloudinary.com/dzawgnnlr/image/upload/w_1512,h_806,c_fill,g_auto,q_auto,f_auto/fczixgwvrhqhqt5uxfto)](https://res.cloudinary.com/dzawgnnlr/image/upload/q_auto,f_auto/fczixgwvrhqhqt5uxfto)

Yesterday Microsoft added a new metric to a model release card, one that will likely become a standard.[1](http://tomtunguz.com/tokens-per-result/#fn:1)

Average token usage.

In the first row, the Microsoft model hits 71.6 on SWE-Bench Verified using about a third of the tokens Claude Haiku 4.5 burns.

Benchmarks are now measured on two different dimensions, the overall performance & the cost to achieve that intelligence.

This is yet another sign that the era of subsidies[2](http://tomtunguz.com/tokens-per-result/#fn:2), tokenmaxxing[3](http://tomtunguz.com/tokens-per-result/#fn:3), & all-out performance for many use cases is over.

Even the most valuable companies in the world cannot afford state-of-the-art intelligence for every conceivable use case.[4](http://tomtunguz.com/tokens-per-result/#fn:4) Uber capped employee AI spending after blowing through its budget in four months.[5](http://tomtunguz.com/tokens-per-result/#fn:5) Salesforce is spending $300M on Anthropic tokens & has frozen engineering hires.[6](http://tomtunguz.com/tokens-per-result/#fn:6)

This new dual benchmark answers the buyer's only question : what is my intelligence per dollar?

[![Image 2: Screenshot 2026-06-03 at 5.49.00 AM](https://res.cloudinary.com/dzawgnnlr/image/upload/w_1512,h_756,c_fill,g_auto,q_auto,f_auto/hnlfpw6c8qaurohqluul)](https://res.cloudinary.com/dzawgnnlr/image/upload/q_auto,f_auto/hnlfpw6c8qaurohqluul)

Artificial Analysis already benchmarks this.[7](http://tomtunguz.com/tokens-per-result/#fn:7) GPT 5.5 & Claude Opus 4.8 land within a point of each other on the Intelligence Index, around 60. Running the index costs $3,357 on GPT 5.5 & $4,685 on Opus 4.8. Same answer, 40% more expensive.

Model companies must now compete on both dimensions. The application layer will compete one level up, on dollars per outcome, what a closed ticket, a shipped PR, or a resolved support case actually costs.

Every layer in the stack now has to price the same way the customer thinks : per result, not per token.

* * *

* * *

1.   [Introducing MAI-Code-1-Flash](https://microsoft.ai/news/introducingmai-code-1-flash/) — Microsoft announces a new coding model with average token usa...

## 深度分析

- **双维度基准测试正在成为行业标准** — Microsoft 在模型发布卡片上新增"平均 token 用量"指标，标志着基准测试从单一性能维度转向"性能 + 成本"双维度评估。这一转变意味着模型评估范式的根本性变化：不再仅问"哪个模型最强"，而是同时问"哪个模型性价比最高"。

- **补贴时代终结，效率竞争开启** — 文章指出 AI 补贴时代（token 价格人为压低）已结束，tokenmaxxing（通过超额 token 消耗换取基准测试高分）的策略正在失效。即使是最有价值的企业（Uber、Salesforce）也已感受到 AI 成本的压力，被迫限制使用量或冻结招聘。这标志着 AI 应用从"技术领先"向"经济理性"的转型。

- **智能单价成为买方核心决策维度** — 文章揭示了一个关键转变：企业不再询问"模型性能如何"，而是问"每美元能买到多少智能"。Artificial Analysis 的 Intelligence Index 显示，GPT 5.5 和 Claude Opus 4.8 在性能指数上仅差 1 分（约 60 分），但运行成本相差 40%（$3,357 vs $4,685）。这意味着同等的智能输出，更便宜的模型将获得更大市场份额。

- **层级定价逻辑的根本性重构** — 从模型层到应用层，定价逻辑正在从"按 token 计费"向"按结果计费"转变。模型公司竞争两个维度，应用层则进一步竞争"每个关闭的工单、每个合并的 PR、每个解决的客服案例"的实际成本。这种转变要求整个技术栈重新思考其商业模式。

## 实践启示

- **在模型选型时强制纳入 Token 效率指标** — 评估任何模型时，不仅要看 SWE-Bench 分数，还要计算"每 token 消耗对应的性能输出"。Microsoft MAI-Code-1-Flash 在 SWE-Bench Verified 上得分 71.6，但仅消耗 Claude Haiku 4.5 约三分之一的 token 量，这种效率优势在实际部署中会显著放大。

- **建立 AI 支出监控机制防止预算超支** — Uber 的案例表明，企业需要实时追踪 AI 消耗并在超支时主动干预（Uber 在四个月内烧穿预算后被迫限制员工 AI 支出）。建议为团队设置 AI 支出上限和实时告警，防止失控消耗。

- **应用层应转向"结果导向"定价模型** — 对于 AI 应用产品，考虑从按 token 消耗定价转向按业务结果（如关闭的工单数、解决的案例数）定价。这不仅更符合客户思维，也能激励供应商优化整体效率而非单纯追求模型性能。

- **关注 Artificial Analysis 等独立基准平台** — 文章提到 Artificial Analysis 已在做 Intelligence Index 和成本对比，这类独立分析平台将成为企业决策的重要参考。建议定期参考此类平台的数据来指导模型选择和预算分配。

## 相关实体
- [How We Made Window Join Parallel And Vectorized](/ch01-034-how-we-made-window-join-parallel-and-vectorized/)
- [Products Are Out Brains Are In](/ch01-113-products-are-out-brains-are-in/)
- Investing In Stitch
- [Gemini 35 Flash More Expensive But Google Plan To Use It For Everything](/ch01-099-gemini-3-5-flash-more-expensive-but-google-plan-to-use-it/)
- [Offline Llm Energy Use Html](/ch01-081-apple-silicon-costs-more-than-openrouter/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/tokens-per-result.md)

---

