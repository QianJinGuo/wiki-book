# The Unsustainable Subsidy

## Ch01.553 The Unsustainable Subsidy

> 📊 Level ⭐⭐ | 6.5KB | `entities/tomtunguz-ai-model-inflation.md`

## 核心要点

- AI 模型价格每年三倍增长，经济学上不可持续
- Google Gemini 定价策略的变化反映行业趋势
- 定价表数据来自 Tom Tunguz Blog（VC 数据驱动视角）

## 分析

文章通过定价数据揭示 AI 服务成本结构问题。

## 深度分析

### 1. AI 模型定价通胀的结构性根源

Tom Tunguz 揭示了一个被业界普遍忽视但至关重要的现象：主流 AI 模型的定价正以每年约 3 倍的速度增长，这种增长模式在经济学意义上本质上不可持续。文章通过 Google Gemini、OpenAI GPT-5.5 和 Anthropic Claude Opus 4.7 三家头部厂商的定价数据，勾勒出当前 AI 定价的真实图景。

从成本端分析，模型推理的 GPU 算力成本、内存带宽成本和电力成本构成了主要支出项。NVIDIA H100 的租赁价格虽然已从峰值回落，但高端模型的推理仍然需要大量 GPU 并行计算。以 GPT-5.5 为例，其 $5/$30 每百万 token 的定价意味着输出成本是输入成本的 6 倍，这一溢价反映了长上下文生成和复杂推理的高计算负载。

### 2. 三大厂商定价策略的分叉路径

**Google Gemini：低价切入，持续提价**

Google 的策略最为激进——通过低价吸引开发者生态，再逐步提升价格。Gemini 3.1 Pro 的定价为 $2/$12（输入/输出），是三家中最低的，但仍比去年同型号提升了数倍。这种策略的底层逻辑在于 Google 拥有自研 TPU 和充足的云计算基础设施，边际成本显著低于竞争对手。

**OpenAI：补贴→正常化→再涨价**

OpenAI 的定价轨迹最为曲折。早期 GPT-4 时代存在明显的价格补贴，以低于成本的方式抢占市场份额。随着 GPT-5.5 推出，定价已回升至 $5/$30 的水平。OpenAI 作为纯 API 服务商，必须在 API 收入上实现盈亏平衡。

**Anthropic：高端定位，稳中有降**

Anthropic 的定价策略最为保守。Claude Opus 4.7 维持了 $5/$25 的高端定价，但近期已对最强大模型进行了降价。这种策略反映了 Anthropic 通过强调模型安全性、合规性和输出稳定性，在企业市场建立差异化优势的定位。

### 3. 定价策略反转的触发条件

文章的核心洞察在于揭示了定价变化的二元条件：「现金充裕且市占率重要时降价，现金紧张且利润率重要时涨价」。2024-2025 年间，三家厂商普遍进入了后一种状态——AI 基础设施 CapEx 持续刷新纪录，资本支出压力迫使各厂商重新审视定价策略。

### 4. 市场结构的竞争动态

从博弈论视角，三大厂商的定价策略构成了典型的非合作博弈。Google 凭借最低成本结构主导了价格下限；OpenAI 凭借先发优势维持中高端定价；Anthropic 则通过安全和合规标签避开了直接价格竞争。这种分层竞争格局意味着 AI API 市场将维持「高利润稳态」直到技术代际更替打破现有平衡。

## 实践启示

### 1. 对 AI 应用开发者的建议

**成本监控与预警机制**

建议开发者建立实时 API 成本监控仪表盘，将 token 消耗与业务收入强关联。当 API 调用成本超过单用户 CAC 的 30% 时，应触发使用量优化或定价调整流程。

**多模型冗余策略**

鉴于单一模型厂商定价波动风险，建议采用多模型冗余架构。在 GPT-5.5 价格上涨时，可快速切换至 Gemini 或 Claude；关键业务路径建议同时接入两家厂商的 API 实现故障转移。

**提示词工程与上下文压缩**

由于输出成本远高于输入成本，应投资于提示词优化和输出压缩技术。使用结构化输出、减少冗余解释来缩短生成 token 数。

### 2. 对 AI 创业公司的战略建议

**定价模型重新设计**

传统的「AI API 成本 + 利润率」定价模式已不适用。建议采用价值定价法——基于 AI 为客户创造的 ROI 来定价，而非基于 token 消耗。

**垂直整合考量**

纯粹的 API 调用型创业公司在长期定价压力下生存艰难。具备条件的团队应考虑垂直整合——自研或微调模型、构建专属数据管道，以降低对第三方 API 定价的敏感性。

### 3. 对企业采购 AI 服务的建议

**总拥有成本（TCO）分析**

不应仅比较 API 单价，而应计算完整 TCO：API 成本 + 集成开发成本 + 监控运维成本 + 故障切换成本。多模型方案的综合成本可能低于预期，因为竞争压力会抑制单一厂商的涨价幅度。

**长期协议与价格锁定**

对于稳定的工作负载，可尝试与厂商签订年度协议锁定价格。大客户通常可以获得批量折扣和价格保护条款。

## 相关实体
- [Cloudflare Glasswing Mythos Security](/ch01-281-project-glasswing-what-mythos-showed-us/)
- [Langgraph State Machine Under The Hood](/ch01-192-langgraph-底层原理-它是怎么把-llm-变成一台状态机的/)
- [Deepseek V4 Training 58 Page Paper Deep Dive](/ch01-751-deepseek-v4是怎么训练出来的-58页论文深入解读/)
- [Minimax Agent Team Mavis Owner Worker Verifier](/ch04-137-一个-ai-还是不够的-minimax-agent-team-mavis/)
- [Anthropic Nla Natural Language Autoencoders Interpretability](/ch01-677-anthropic/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/tomtunguz-ai-model-inflation.md)

---

