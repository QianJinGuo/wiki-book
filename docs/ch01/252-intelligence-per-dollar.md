# Intelligence Per Dollar

> 📊 Level ⭐⭐⭐ | 8.4KB

## 概要

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

### 基准测试的双维度化：从"性能单维"到"性能×成本"矩阵

Microsoft 在模型发布卡片上新增"平均 token 用量"指标，是基准测试范式转变的标志性事件：模型评估不再只有"谁跑分最高"一条坐标轴，而是同时回答"达到这个智能水平付出了多少 token 代价"，且这一指标大概率会扩散为行业标准。其新模型 MAI-Code-1-Flash 在 SWE-Bench Verified 上拿到 71.6 分，消耗的 token 却仅约为 Claude Haiku 4.5 的三分之一——同等智能、约三倍效率。基准测试从此被放到两个维度上度量：整体性能，以及达成该智能的成本。厂商自报指标并非孤例，独立基准平台 Artificial Analysis 事实上已经在按这一逻辑给模型排名，"性能×成本"的二维读法与 [Agent Evaluation Benchmark Frameworks](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) 的评估框架演化方向一致：成本效率正在成为评估体系的一等公民维度。

### 补贴时代终结：tokenmaxxing 失效与头部企业的成本硬约束

文章把"平均 token 用量"的出现解读为补贴时代（token 价格被人为压低）终结的又一个信号：靠超额 token 消耗刷高基准分的 tokenmaxxing 策略正在失去空间。成本约束已经真实作用于最有实力的企业——Uber 在四个月内烧穿员工 AI 预算后被迫封顶支出，Salesforce 为 Anthropic token 支出 $300M 并冻结工程招聘；Microsoft 内部部门的 Claude Code 用量超出预算后，直接取消了许可证并把开发者转向 GitHub Copilot CLI。三个案例指向同一结论：即便全球市值最高的公司，也无法为每一个可以想到的使用场景采购最先进的智能。这意味着 AI 应用正从"技术领先"叙事转向经济理性，[Ai Cost Optimization Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md) 所主张的成本治理思路由此从可选优化变为生存必需。

### 智能单价：买方唯一真正关心的问题

双维度基准回答的是买方的唯一核心问题："我的每一美元能买到多少智能？"。Artificial Analysis 的 Intelligence Index 提供了一个干净的对照实验：GPT 5.5 与 Claude Opus 4.8 的智能指数都落在 60 分上下、彼此相差不到 1 分，但跑完同一指数分别花费 $3,357 与 $4,685——同样的答案，后者贵 40%。当性能不可区分时，价格就成了唯一的区分维度：同等智能输出下，更便宜的模型将系统性地拿走市场份额。模型选型因此从"跑分对比"重构为"每美元智能"的性价比计算，这与 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的 token 经济学视角同构——单价乘以用量才是真实总成本，只看单价或只看跑分都会误判。

### 定价逻辑沿技术栈逐层重构

竞争压力正沿技术栈向上传导：模型公司必须在性能与成本两个维度上同时竞争；应用层则上升一级，按"每个结果"竞争——关闭一张工单、合并一个 PR、解决一个客服案例各自的真实美元成本。换句话说，栈中每一层都必须用客户思考的方式定价：按结果计费，而不是按 token 计费。按结果定价对买方而言是把 token 效率的不确定性转移给供应商，对供应商而言则是把"模型用得是否高效"内化为自身的毛利问题——整个技术栈的商业模式因此被重新定价，效率竞争取代补贴竞争成为主旋律。

## 实践启示

- **在模型选型时强制纳入 Token 效率指标** — 评估任何模型时，不仅要看 SWE-Bench 分数，还要计算"每 token 消耗对应的性能输出"。Microsoft MAI-Code-1-Flash 在 SWE-Bench Verified 上得分 71.6，但仅消耗 Claude Haiku 4.5 约三分之一的 token 量，这种效率优势在实际部署中会显著放大。

- **建立 AI 支出监控机制防止预算超支** — Uber 的案例表明，企业需要实时追踪 AI 消耗并在超支时主动干预（Uber 在四个月内烧穿预算后被迫限制员工 AI 支出）。建议为团队设置 AI 支出上限和实时告警，防止失控消耗。

- **应用层应转向"结果导向"定价模型** — 对于 AI 应用产品，考虑从按 token 消耗定价转向按业务结果（如关闭的工单数、解决的案例数）定价。这不仅更符合客户思维，也能激励供应商优化整体效率而非单纯追求模型性能。

- **关注 Artificial Analysis 等独立基准平台** — 文章提到 Artificial Analysis 已在做 Intelligence Index 和成本对比，这类独立分析平台将成为企业决策的重要参考。建议定期参考此类平台的数据来指导模型选择和预算分配。

## 相关实体
- How We Made Window Join Parallel And Vectorized
- Products Are Out Brains Are In
- Investing In Stitch
- [Gemini 35 Flash More Expensive But Google Plan To Use It For Everything](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gemini-35-flash-more-expensive-but-google-plan-to-use-it-for-everything.md)
- [Offline Llm Energy Use Html](https://github.com/QianJinGuo/wiki-public/blob/main/entities/offline-llm-energy-use-html.md)

→ [原文存档](https://tomtunguz.com/tokens-per-result/)

---

