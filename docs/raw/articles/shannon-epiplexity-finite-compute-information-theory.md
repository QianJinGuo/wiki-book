---
title: "Shannon & Epiplexity: Finite Compute Information Theory"
source: ""
tags: [shannon, information-theory, epiplexity, finite-compute]
created: 2026-05-20
sha256: 0b2000fb1d14c8b4d9f04c9965cb6dfd8633131c16e8b85aaffe5ba5dd3422f1
---
---
# Shannon 没有想到的事——当信息论遇上有限算力
**来源:** 微信文章 — AI-lab学习笔记
**URL:** https://mp.weixin.qq.com/s/YZkpBN1PECoVdVFZT-JYnA
**作者:** 山高水长天涯未远
**日期:** 2026年3月31日
**标签:** #信息论 #计算理论 #涌现 #LLM训练
---
## 核心论点
Shannon 1948 年创立信息论，假设观察者有**无限算力**。这个假设在通信领域无害，但 LLM 时代成了核心缺口：同样的数据，GPT-2 和 GPT-4 学到的东西不同；人类和 LLM 学到的也不同；同一个人精力充沛 vs 疲惫时学到也不同。
**核心洞见：** 信息不是数据的固有属性，而是数据和观察者之间的关系。
## 三个不安的事实
### 事实一：从"无"中创造"有"（AlphaZero）
- 输入：国际象棋规则（几百行代码，几 KB）
- 输出：数十兆字节的超人棋力
- Shannon 说：确定性变换不能增加信息
- 但有限算力的观察者看到了全新结构——计算过程为有限观察者挖掘出了隐藏的结构性信息
### 事实二：顺序不应该重要，但它重要
- Ilya Sutskever：读推理小说预测凶手 = 必须从线索推理
- 但作者先选凶手再编织线索，写作方向和阅读方向相反
- 国际象棋：逆序训练更难（loss 更高），但迁移效果碾压正序
- 禅意：**学得越痛苦的方向，越可能是正确的方向**
### 事实三：学生可以比老师更聪明（生命游戏）
- 三行规则 → 滑翔机、枪、通用计算机
- 这些概念完全不在那三行规则里
- 模型学到的内部程序比生成数据的程序复杂得多
## 核心概念：Epiplexity（认知复杂度）
**定义：** 损失曲线上，loss 下降部分的面积 = 模型真正学到的结构性知识（语法规则、逻辑关系、因果常识）。
**时间有界熵：** loss 不再下降后的残余 = 不可预测的随机噪声（明天的天气、用户的错别字）。
**直观类比：** 读一本书——记住并理解的部分（epiplexity）vs 记不住的随机细节（时间有界熵）。
## 关键实验数据
| 数据源 | 结构性信息（epiplexity）占比 | 随机信息占比 |
|--------|---------------------------|------------|
| 自然语言（OpenWebText） | 约 37% | 约 63% |
| 国际象棋（Lichess） | 约 5% | 约 95% |
| 图像（CIFAR-5M） | < 1% | > 99% |
**语言中的结构性信息约是图像的 10000 倍（四个数量级）。**
这就解释了为什么 GPT 预训练后能做数学、写代码、控制机器人——它吸收了天量的可迁移结构。而图像预训练的模型迁移能力弱得多。
## 细胞自动机实验
三种规则（输入完全相同，程序复杂度几乎一样）：
| 规则 | 结果 | 可学性 |
|------|------|--------|
| 规则 15 | 简单条纹 | 低 epiplexity |
| 规则 30 | 一片混沌 | 伪随机，噪声 |
| 规则 54 | 复杂但不混乱，粒子移动碰撞 | 高 epiplexity |
## 实践结论
**数据选择 > 模型选择。** 论文的 ADO 数据选择策略（优先选择 loss 下降更快的数据子集）无意中在最大化 epiplexity。
> Chinchilla 定律告诉我们要用多少数据。**Epiplexity 回答下一个问题：要用什么数据。**
## 人类学习的映射
1. **兴趣 = 临时算力升级**：感兴趣时注意力↑、工作记忆↑、多巴胺↑ → 更高算力观察者 → 同一份数据提取更多结构
2. **天赋 = 出厂配置不同**：不同人的大脑架构让不同类型数据呈现不同 epiplexity
3. **正反馈循环**：兴趣 → 更多注意力 → 提取更多结构 → 理解加深 → 更强兴趣
4. **好的教育 = epiplexity 最大化**：适度的困难（desirable difficulty）促进深层学习
## 论文信息
Marc Finzi, Shikai Qiu, Yiding Jiang, Pavel Izmailov, Andrew Gordon Wilson, J. Zico Kolter. "From Entropy to Epiplexity: Rethinking Information for Computationally Bounded Intelligence." arXiv:2601.03220, January 2026.
参考：https://github.com/shikaiqiu/epiplexity
## 相关概念
- [[压缩即智能]] — 作者的系列基石概念
- [[涌现]] — Conway 生命游戏是典型涌现案例
- [[LLM训练数据选择]] — epiplexity 对数据选择的指导意义
- [[信息论]] — Shannon 经典框架