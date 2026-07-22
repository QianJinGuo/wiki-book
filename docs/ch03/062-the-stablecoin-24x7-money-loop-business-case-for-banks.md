# The stablecoin 24x7 money loop: business case for banks

## Ch03.062 The stablecoin 24x7 money loop: business case for banks

> 📊 Level ⭐⭐ | 13.9KB | `entities/the-stablecoin-24x7-money-loop-fintechbrainfood.md`

# The stablecoin 24x7 money loop: business case for banks

> **Source**: Fintech Brainfood Weekly Rant (2026-05-31) by Jason Mikula. Available at https://www.fintechbrainfood.com/p/stablecoin-business-case. Jina fetched 2026-06-05.

## 核心论点（Core Thesis）

**"Tokenized deposits are money that rests. Stablecoins are money that moves."**

The article documents a "subtle vibe shift" in banks over 2026 Q1-Q2: from loudly proclaiming tokenized deposits are superior to stablecoins, to increasingly benefiting from stablecoins' coexistence with tokenized deposits. Banks that positioned on one side are now hedging or pivoting to the other.

## 银行业务对比矩阵（Business Trade-off Matrix）

| 维度 | Tokenized Deposits | Stablecoins |
|------|---------------------|-------------|
| 存在范围 | 仅在银行内 | 任何兼容钱包/平台/国家 |
| 收益能力 | 可获存款利息 | 不获利息（设计选择）|
| Off-ramping | 无 | 需 on/off-ramp 通道 |
| 容量 | 无限 | 无限（取决于公链）|
| 客户激励 | 大客户可获优惠贷款利率 | 开放、无差别 |
| 24/7 即时转账 | ✓（如 Kinexys）| ✓ |
| 跨境货币对 | 主流货币对 | 任何代币化的本地货币 |

## 大行（G-SIB）双轨布局

大型跨国银行（JP Morgan、Citi、Goldman 等）正在**同时**押注两边：

- **Tokenized Deposits 侧**: JP Morgan Kinexys、Citi Token Services 等
  - Kinexys 自 2020 年累计处理超 **$3 trillion** 交易量
  - 估算 annualized stablecoin 支付量仅 **$390B** — Kinexys 处理量是它的 ~8x
  - 即时 24/7 转账到 60+ 国家
  - 大公司主流货币对（EUR/USD）的最佳选择
- **Stablecoin 侧**: Standard Chartered（托管、off-ramp、稳定币卡基础设施）、SocGen（MiCA 合规 EUR/USD 稳定币）、Deutsche Bank（客户要求 stablecoin 互操作）

**创新集中在中小银行**: Lead、Coastal Community Bank、Cross River、Itau、Banking Circle、LHV — 选择作为 off-ramp 和本地支付合作伙伴。

## 行业关键数据点

- **JP Morgan Kinexys**: 2020-2026 累计 $3T+ 交易量
- **Stablecoin 年化支付量**: ~$390B（估算）
- **Coastal Community Bank**: 用 stablecoins 替代部分 correspondent banking 流程
- **Standard Chartered**: 提供稳定币托管 + off-ramp + 稳定币卡
- **SocGen**: 推出 MiCA 合规 EUR + USD 稳定币

## 监管框架

文章覆盖了 2026 年美国两个核心稳定币立法：
- **GENIUS Act**: 联邦稳定币监管框架
- **CLARITY Act**: 进一步明确 SEC/CFTC 管辖权

## Cash App 集成案例

2026 年 5 月，Cash App 集成 stablecoin：
- 支持 Ethereum、Solana、Arbitrum、Polygon
- 收到 stablecoin 后自动 1:1 转 USD
- 转账免费（限时）
- 不支持 New York 居民
- 转错地址不退款

**作者评论**: 1:1 USD 转换是 SoFi/Ramp 的标准用户经验，账户抽象（account abstraction）本可避免错误地址，但 Cash App 选择了简单实现。

## 三层洞察（Why this matters for AI agent builders）

1. **24/7 资金流 = 24/7 agent economy** — 稳定币的"money that moves"属性天然适合 AI agent 间的微支付和价值转移。任何构建 AI agent 商业化（特别是跨境/B2B/agent-to-agent）的人都需要理解这个底层
2. **银行不是敌人，是 channel** — 中小银行（Coastal、Cross River）正在成为稳定币 off-ramp，意味着 agent 商业化可以通过银行通道合规化
3. **GENIUS/CLARITY Act 落地意味着 2026 H2 会出现一波稳定币 native 金融产品** — AI agent 钱包供应商应提前对接 JP Morgan Kinexys 类通道

## 深度分析

1. **稳定币与代币化存款的"移动性分工"揭示了支付架构的分层逻辑**
   "Tokenized deposits are money that rests. Stablecoins are money that moves" 这一核心论点本质上将支付基础设施分为两层：静止层（yield-bearing, bank-internal）和移动层（open-loop, cross-platform）。这种分层不是竞争关系，而是互补的金融堆栈。代币化存款擅长处理大额、主权货币对的机构间结算；稳定币擅长处理小额、跨境、碎片化的实时流转。两者在未来很长一段时间内将共同存在，各自覆盖不同的业务场景

2. **G-SIB 的双轨布局不是战略骑墙，而是风险对冲**
   JP Morgan 同时运营 Kinexys（代币化存款，$3T+ 累计交易量）和稳定币托管/互操作服务，Citi、Deutsche Bank 亦然。这反映出一个关键判断：2026 年的监管环境尚未定局，押注单一路线存在监管错位风险。G-SIB 选择同时覆盖两边，意味着无论 GENIUS Act 还是 CLARITY Act 最终走向何方，它们都有支付通道覆盖。这对中小银行的战略启示是：在监管明朗之前，选择某一侧专注深耕（如作为 off-ramp 专精）比全面铺开更实际

3. **Kinexys $3T vs 稳定币 $390B 年化：规模差距掩盖了结构性增长信号**
   Kinexys 处理量约为稳定币年化支付量的 8 倍，这一数字表面上说明代币化存款主导，但实则揭示了稳定币渗透率仍处于早期。$390B 年化支付量相对于全球数十万亿美元的支付总量而言，渗透率极低。参照历史数据，当一个支付类别处于 10% 以下的渗透率且年复合增长率超过 50% 时，通常是基础设施投入窗口期。GENIUS Act 落地预期下，2026 H2 可能触发稳定币支付量的非线性增长

4. **监管框架（GENIUS + CLARITY）的"双轨并行"是制度设计层面的刻意冗余**
   美国同时推进 GENIUS Act（联邦稳定币监管）和 CLARITY Act（SEC/CFTC 管辖权澄清），这种立法并行模式不是为了效率，而是为了确保不同监管目标都能被覆盖。GENIUS Act 解决"谁能发稳定币"和"储备要求"，CLARITY Act 解决"谁管什么"的问题。两法案的叠加效应是：合规稳定币的发行和流通门槛大幅提高，但一旦合规，制度合法性带来的机构采纳速度会远超预期。这与 MiCA 在欧洲的先例类似

5. **AI Agent 经济依赖 24/7 支付底层，稳定币是当前唯一现成选项**
   AI agent 之间的微支付、跨境 B2B 结算、agent-to-agent 价值转移都需要 24/7 即时结算能力。代币化存款虽然也支持 24/7 转账（如 Kinexys），但仅限于银行体系内部，无法支撑开放生态中的 agent 交互。稳定币的"money that moves"属性天然匹配 AI agent 的即时代际际支付需求。如果 GENIUS Act 在 2026 H1 落地，AI agent 钱包供应商和支付中间件供应商将迎来稳定的合规通道期

## 实践启示

1. **中小银行应优先定位于"稳定币 off-ramp 基础设施提供商"，而非发行自有稳定币**
   Lead、Coastal Community Bank、Cross River 的成功案例表明，中小银行不需要与 G-SIB 正面竞争发币能力，而是可以成为稳定币与传统银行体系之间的桥接层：提供托管、on/off-ramp、本地支付清算服务。这种角色的护城河在于本地监管关系和银行执照，而非技术。对于区域银行来说，这是 2026-2027 年最可实现的稳定币收入路径

2. **AI Agent 产品团队：支付架构设计阶段即应将稳定币通道纳入，而非后置**
   文章中"24/7 资金流 = 24/7 agent economy"的洞察直接指出，AI agent 的商业化架构如果依赖传统支付通道（ ACH、T+1），将在结算时效上形成瓶颈。实践建议：在 AgentCore、LangChain Agents 等框架的产品设计阶段，尽早接入 x402 协议或 JP Morgan Kinexys 类通道，并将稳定币支付能力封装为可配置选项，而非上线后追加

3. **GENIUS Act 落地预期下，支付产品供应商应在 2026 Q3 前完成稳定币合规对接**
   CLARITY Act + GENIUS Act 的并行推进节奏意味着，2026 H1 可能是监管框架成型的关键窗口期。对于支付产品供应商（特别是涉及跨境、B2B 场景的），在法案正式落地前完成稳定币通道的对接和测试，可以在合规红利期获得先发优势。参考 MiCA 落地后欧洲稳定币采纳的速度，美国市场的合规稳定币需求可能在 2026 H2 出现集中爆发

4. **Cash App 案例的产品工程教训：错误地址防护和账户抽象应作为稳定币 UX 标配**
   Cash App 集成的 stablecoin 功能明确标注"转错地址不退款"且未支持账户抽象（account abstraction），这是"简单实现优先于安全"的典型权衡。作者评论暗示：如果面向高价值用户群体，这种 UX 简化会构成严重的资金安全隐患。实践中，任何面向 AI agent 或自动化场景的稳定币钱包，都应默认启用智能合约钱包（SCW）和多签机制，而非依赖 EOAs（ externally owned accounts ）

5. **跨境稳定币支付的产品机会：奇异货币对（Hedging Exotic Currency Pairs）**
   文章明确提到Deutsche Bank 客户要求"access exotic currency pairs"和稳定币互操作。这揭示了一个被忽视的产品方向：在主流货币对（EUR/USD）之外的奇异货币对上，稳定币可以提供比传统外汇市场更低成本、更快速的跨境结算。目前稳定币支付主要集中在 USDT/USDC 的主流场景，但随着代币化本地货币（如 BRL、PHP、INR 的链上版本）增加，支持这些奇异货币对的稳定币支付基础设施将成为差异化竞争点

## 引用与回链

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-stablecoin-24x7-money-loop-fintechbrainfood.md)

## 相关实体（Related Entities）

- [Clarity Act 5 Things](https://github.com/QianJinGuo/wiki/blob/main/entities/clarity-act-5-things.md) — CLARITY Act 立法细节
- CLARITY Act — CLARITY Act 5 个关键点
- [Agentcore Payments X402 Agentic Commerce](../ch11/066-agentcore-payments.html) — AWS Bedrock AgentCore x402 协议（agent-to-agent 支付）
- [Amazon Bedrock Agentic Payments Guardrails](../ch11/159-amazon-bedrock.html) — Bedrock agentic payments 护栏
- enable safe agentic payments with built in guardrails using  — 安全 agent 支付
- [Coinbase Becomes Hyperliquids Official Usdc Treasury Deployer As Usdh Sunsets](https://github.com/QianJinGuo/wiki/blob/main/entities/coinbase-becomes-hyperliquids-official-usdc-treasury-deployer-as-usdh-sunsets.md) — Coinbase USDC treasury
- [Tether Launches Developer Grants Program For Local Ai Paymen](../ch09/141-tether-launches-developer-grants-program-for-local-ai-paymen.html) — Tether 本地 AI 支付开发者资助
- [Crypto Funds Six Week Inflow Streak 4 9 Billion Coinshares](../ch01/715-9.html) — 加密基金 6 周连续流入
- [The Token Economy Pt2 The Intelligence Company Gets Built](../ch01/002-the-token-economy-pt2-the-intelligence-company-gets-built.html) — Token 经济与 AI 智能公司

---

