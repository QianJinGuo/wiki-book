# 大三本科生一作，交出7.92倍加速的投机解码新答卷！DeepSeek和阶跃星辰双双引用

## Ch01.1273 大三本科生一作，交出7.92倍加速的投机解码新答卷！DeepSeek和阶跃星辰双双引用

> 📊 Level ⭐⭐⭐ | 2.2KB | `entities/大三本科生一作-交出7-92倍加速的投机解码新答卷-deepseek和阶跃星辰双双引用.md`

# 大三本科生一作，交出7.92倍加速的投机解码新答卷！DeepSeek和阶跃星辰双双引用

> **核心价值**：v×c=64，stars=4，来自 量子位

---
source: wechat
source_url: https://mp.weixin.qq.com/s/_aT5PkYL7tPns335R4fx2g
ingested: 2026-07-09
source_published: 2026年7月9日 12:17
---

# 大三本科生一作，交出7.92倍加速的投机解码新答卷！DeepSeek和阶跃星辰双双引用

##### Domino团队 投稿   
量子位 | 公众号 QbitAI

DeepSeek的投机解码框架DSpark，让“如何把大模型推理做得更快”再次成为热点。

论文中仍有不少细节可挖。比如，作者提到了约一个月前来自上海交通大学等机构的工作**Domino** ，并指出其CausalEncoder的设计与DSpark的理念相似。此外，Domino算法也在阶跃星辰发布的JetSpec中被提及。

而这篇论文的第一作者**黄佳诺** ，目前还是一名**大三的本科生** 。

如果想理解DSpark中draft-model侧的关键设计，不妨先读Domino。Domino更像一个干净的研究原型，用更简单、更集中的结构讲清楚一个核心问题：如何在parallel backbone的低开销基础上，轻量地补回draft block内部的串行依赖，兼顾扩散与自回归的双重优势。

###### **△** Domino方法总览。

## 核心问题：并行很快，但缺少因果依赖

投机解码的基本思路是：先让轻量draft model一次猜出多个未来token，再交给target model批量验证。它的速度取决于两个因素：**draft要足够快，也要足够准。**

这就带来一个trade-off：

  * 自回归drafter能显式建模token间依赖，draft质量高，但生成多个token时需要顺序执行，开销随长度增长

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/大三本科生一作-交出7-92倍加速的投机解码新答卷-deepseek和阶跃星辰双双引用.md)

---

