# Semis Memo: Supply Chain Inheritance

## Ch01.613 Semis Memo: Supply Chain Inheritance

> 📊 Level ⭐⭐ | 7.4KB | `entities/semis-memo-supply-chain-inheritance.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/semis-memo-supply-chain-inheritance.md)

## 相关实体
- [Semis Memo: Supply Chain Inheritance](../ch05/085-ai.html)
- [rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack](ch01/738-scarcruft.html)
- [Postmortem: TanStack npm supply-chain compromise | TanStack Blog](../ch12/035-postmortem-tanstack-npm-supply-chain-compromise-tanstack.html)
- [Amazon launches Supply Chain Services for businesses of all sizes](../ch05/085-ai.html)
- [semgrep intercom php supply chain](../ch12/116-semgrep-intercom-php-supply-chain.html)

## 深度分析
本文是Citrini Research发布的半导体Memo系列文章，深入分析了AI基础设施时代模拟和功率半导体的投资逻辑，特别是提出了"Supply Chain Inheritance"（供应链继承）这一核心投资框架。
**投资范式转变：从简单识别到深度理解**
文章回顾了AI基础设施投资的第一阶段：只需了解基本逻辑——大语言模型运行在GPU上买英伟达、AI计算带动光互联买相关股票、内存OEM受益买美光和SK海力士。这一简单逻辑在估值宽容的环境中获得了显著收益。然而，作者指出当前环境已发生变化，在AI基础设施领域获得超额收益需要超越"识别当前瓶颈"的深度理解能力。
**供应链继承：核心投资逻辑**
"Supply Chain Inheritance"是本文最核心的概念框架。它描述了一个反直觉但重要的现象：AI基础设施的扩张正在继承电动汽车（EV）buildout建立的供应链体系，而非新建独立供应链。
文章引用英伟达2025年5月的技术博客，说明800V DC rack架构的底层技术被归功于"电动汽车和太阳能行业"。这意味着：之前为EV准备的基础设施投入，现在正在被AI数据中心需求所继承和放大。
**供需格局分析：产能收缩而非扩张**
关键观察是TXN（德州仪器）和NXP等公司并未按往常周期规律大幅增加资本支出。capex/revenue比率显示，这些公司正在控制产能扩张，选择提价而非增加供应。这种行为背后的原因是它们在COVID后经历了供应过剩、中国模拟芯片竞争、EV和汽车周期疲软等多重冲击，产能扩张的"burned once"心态导致它们对新一轮扩产保持谨慎。
**MLCC短缺：被低估的瓶颈**
文章早在2025年25 trades中就预警了多层陶瓷电容（MLCC）短缺。功率半导体公司如Murata Manufacturing、Vishay Intertechnology、Samsung Electro-Mechanics已因此受益。MLCC是电源管理系统核心组件，对电压 sag、谐波和瞬态问题的处理至关重要。
**"Post-Traumatic Supply Disorder"框架**
作者提出2026年的核心框架是"Post-Traumatic Supply Disorder"——经历过供应过剩创伤的供应商对扩产持谨慎态度，即使需求显著增长也不愿轻易增加产能。这为具备产能的供应商创造了定价权上移的有利环境。
**更广泛的AI基础设施领域覆盖**
除模拟和功率半导体外，本文还预告了后续将覆盖的主题：CPU在Agentic时代的角色、Neoclouds推理短缺、AI材料瓶颈、韩国半导体产业解锁等。

## 实践启示
**半导体投资者：**
1. **供应链继承逻辑的识别**

   - 关注那些为EV buildout建立但现在被AI需求继承的供应链资产
   - 英伟达技术博客对EV和太阳能行业的引用是重要信号
2. **供应商行为分析**

   - capex/revenue比率趋势是判断供应商扩产意愿的关键指标
   - 经历过供应过剩的供应商更倾向于提价而非扩产，为现有产能创造定价优势
3. **产能控制者的机会**

   - TXN、NXP等选择控制产能的公司正在提升ASP
   - 在需求增长背景下，产能受控意味着供不应求格局延续
**供应链管理者：**
1. **MLCC和功率组件采购策略**

   - 电源管理系统组件（电容、电感、二极管、功率IC）是AI数据中心的关键瓶颈
   - 需提前规划MLCC等关键组件的供应商关系
2. **供应安全评估**

   - 供应商的谨慎扩产态度可能限制短期供应响应能力
   - 多元化供应商策略和长期协议变得更为重要
3. **继承供应链的价值**

   - 利用EV时代建立的成熟供应链可以加速AI基础设施部署
   - 但需注意EV和AI需求峰值时间差可能导致的供应竞争
**AI基础设施规划者：**
1. **功率容量规划**

   - AI工作负载的功率需求远超传统数据中心
   - 电源管理系统的容量规划需考虑峰值和持续负载
2. **组件级依赖识别**

   - 识别AI基础设施中的关键瓶颈组件
   - 电容和电感的中央性（centrality）对功率转换至关重要
3. **成本结构变化**

   - 功率半导体价格上涨将影响AI基础设施总体拥有成本（TCO）
   - 供应链继承逻辑意味着某些组件可能面临EV和AI需求的双重拉动
**行业分析师：**
1. **周期判断框架**

   - 传统半导体周期分析方法需考虑AI需求的非周期性特征
   - "Post-Traumatic Supply Disorder"框架提供了分析供应商行为的新视角
2. **估值调整必要性**

   - 之前反映非AI相关负面因素（如COVID供应过剩、中国竞争、EV周期疲软）的估值折价可能被重新评估
   - AI需求能否克服这些历史负面因素是核心判断依据
3. **跨行业供应链联动**

   - 电动汽车、太阳能和AI数据中心的供应链正在深度交织
   - 单一行业分析可能低估供应链紧张程度

---

