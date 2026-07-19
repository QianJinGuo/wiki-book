# Semis Memo: Supply Chain Inheritance

## Ch01.641 Semis Memo: Supply Chain Inheritance

> 📊 Level ⭐⭐ | 7.2KB | `entities/citriniresearch-supply-chain-inheritance.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/citriniresearch-supply-chain-inheritance.md)

## Summary
7×7=49 - Article ingested from newsletter candidate pipeline.

## Notes
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/citriniresearch-supply-chain-inheritance.md)

## 深度分析
**1. 「Supply Chain Inheritance」框架的核心洞察：EV 供应链正在成为 AI 基础设施的构建模块**
Citrini Research 提出的「Supply Chain Inheritance」（供应链继承）框架，是理解当前 AI 基础设施投资逻辑的重要框架。其核心论点是：**英伟达 2025 年 5 月关于 800V DC 机架架构的技术博客，将底层技术归功于「电动汽车和太阳能行业」**。
这意味着，AI 数据中心 capex 的直接受益者（GPU、网络设备、存储）之外，还有一个「继承性受益」层级——那些为 EV 和太阳能行业建设的电源管理、功率半导体、被动元件产能，现在正在被 AI 数据中心需求「继承」。
这个框架的重要含义是：EV 供应链的产能建设周期（2018-2023）恰好覆盖了 AI 需求起飞前的准备阶段。当 AI 需求爆发时，这些产能不需要从零开始建设，而是可以直接被调用——但供给弹性是有限的，因为这些厂商在经历 COVID 后的供应过剩后，不倾向于快速扩产。
**2. MLCC 短缺的结构性原因：为何这次不一样**
多层陶瓷电容（MLCC）是本文讨论最多的具体元件。Citrini 的核心论点是：当前的 MLCC 短缺与以往不同，原因在于：

- **汽车 EV 化的结构性需求 vs 周期性需求**：传统汽车 MLCC 需求与汽车销量高度相关（周期性），但 EV 的 MLCC 用量是传统汽车的 2-3 倍（结构性），且充电基础设施需要更多 MLCC
- **EV 供应链建设期的产能已被占用**：为 EV 建设的 MLCC 产能，在 EV 销量不及预期后处于「半空闲」状态，厂商不愿再扩产
- **AI 数据中心需求「继承」了这些产能，但不足以让厂商相信应该扩产**：因为 EV 需求的不确定性仍然存在
这解释了一个反直觉现象：**AI 需求爆发，但 AI 供应链厂商的 capex 没有相应大幅增长**——因为厂商在经历 2022-2023 年的库存调整后，更加谨慎。
**3. Texas Instruments 和 NXP 的定价能力：从「量增价跌」到「量价齐升」**
文章引用了 Texas Instruments（TXN）和 NXP Semiconductors（NXPI）的 capex/营收比图表，指出一个重要趋势转变：历史上，半导体行业在需求旺盛时期倾向于**扩产**（capex 上升），导致供给过剩和价格下跌。但这一次，主要模拟和功率半导体公司选择**提价**而非扩产。
这背后的原因可能是：

- **行业整合使得主要玩家更有定价权**：博通、英飞凌、TI、NXP 等头部公司的市场份额在过去十年持续提升
- **对 AI 需求持续性的不确定**：厂商担心 AI 需求是脉冲式的，担心扩产后遭遇类似 2022-2023 年的库存调整
- **EV 和工业需求的长期不确定性**：虽然 AI 短期需求旺盛，但 EV 和工业市场的需求前景存在结构性不确定性（地缘政治、补贴退坡等）
**4. Nvidia 技术博客的「意外广告」：EV/太阳能技术的价值重估**
Citrini 指出，Nvidia 在 2025 年 5 月的 800V DC 机架架构技术博客中，「意外地」为 EV 和太阳能行业的底层技术做了一个高调的「广告」——承认他们的数据中心架构底层技术来自这些行业。
这个「意外」揭示了一个更大的范式转变：**当 AI 成为主导性的计算需求时，所有之前服务于其他行业（EV、工业太阳能、储能）的技术积累，都可能被重新估值**。这与传统的「AI 供应链」叙事（Nvidia GPU → HBM → 先进封装）不同，它关注的是「边缘技术」的隐藏价值。

## 实践启示
**对于半导体投资者和分析师：**
1. **「Supply Chain Inheritance」框架可用于识别被低估的「继承性受益」标的**：投资者习惯于关注 AI 供应链的直接受益者（Nvidia、SK Hynix、Marvell），但「继承性受益」的框架可以帮助识别那些服务于 EV/工业市场、现在被 AI 需求「继承」的产能——如 MLCC 供应商（Murata、Samsung EM）、功率分离式器件（Vishay、Nexperia）等。
2. **关注 capex/营收比趋势而非绝对 capex 数字**：当行业 capex/营收比下降但需求上升时，往往意味着定价权向供应商转移。如果 TXN、NXP 等公司在 AI 需求下选择提价而非扩产，其利润率改善幅度可能超过收入增长。
3. **EV 供应链的「AI 超调」风险值得警惕**：如果 EV 需求不及预期，为 EV 建设的产能将回归空闲状态，可能在 2027-2028 年引发新一轮价格压力。投资者需要在评估 MLCC 和功率半导体时，同时考虑 EV 需求的不确定性。
**对于供应链管理者和采购专业人士：**
4. **AI 数据中心的被动元件和功率元件供应风险被低估**：大多数 AI 供应链讨论集中在 GPU 和 HBM，但 MLCC、功率电感、GaN/SiC 功率器件等被动和分立元件的供应瓶颈可能同样严峻。建议数据中心建设方和服务器 OEM 提前锁定这些元件的长期供应协议。
5. **关注「供应链继承」的时间差**：EV 供应链的产能建设周期和 AI 需求爆发的时间差（大约 3-5 年）意味着某些元件可能在 2026-2027 年出现结构性短缺，而另一些在 2028 年后才显现。建议对不同元件的供应风险进行分级评估。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/citriniresearch-supply-chain-inheritance.md)

## 相关实体
- [Semis Memo: Supply Chain Inheritance](ch01/641-semis-memo-supply-chain-inheritance.html)
- [rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack](ch01/746-scarcruft.html)
- [Postmortem: TanStack npm supply-chain compromise | TanStack Blog](../ch12/035-postmortem-tanstack-npm-supply-chain-compromise-tanstack.html)
- [Amazon launches Supply Chain Services for businesses of all sizes](../ch05/088-ai.html)
- [semgrep intercom php supply chain](../ch12/116-semgrep-intercom-php-supply-chain.html)

---

