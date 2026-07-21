# 【从零训练Steel-LLM】微调阶段优化

## Ch01.1037 【从零训练Steel-LLM】微调阶段优化

> 📊 Level ⭐⭐ | 3.8KB | `entities/从零训练steel-llm微调阶段优化.md`

# 【从零训练Steel-LLM】微调阶段优化

**来源**: 炼钢AI

**发布日期**: 2025-01-28

**原文链接**: https://mp.weixin.qq.com/s/-hG9PYxYvF1siCx2sakuPA

---

前言

Steel-LLM是个人发起的从零预训练中文大模型项目。我们使用了1T token的数据预训练一个1B左右参数量的中文LLM。项目从开始到微调出第一版模型耗时了8个月。我们详细的分享了数据收集、数据处理、预训练框架选择、模型设计等全过程，并开源全部代码。历史文章：

【从零训练Steel-LLM】预训练数据收集与处理

【从零训练Steel-LLM】预训练代码讲解、改进与测试

【从零训练Steel-LLM】模型设计

【从零训练Steel-LLM】微调探索与评估

个人从零预训练1B LLM心路历程

这是从零训练Steel-LLM的第6篇文章，对微调环节做了进一步的探索，相比第一版微调模型，加入英文SFT数据，ceval从38分涨到了42分，cmmlu从33分涨到了36分，mmlu从23分涨到了30分。后续笔者会继续基于Steel-LLM进行更多的探索，如数学能力增强、强化学习、长思维推理等，欢迎关注。

github：

https://github.com/zhanshijinwat/Steel-LLM

交流群：加 a1843450905，拉群

实验

Steel-LLM的预训练数据中只有20%的英文数据，定位是中文LLM，开始只计划测一下中文benchmark（ceval和cmmlu），因此第一版微调模型的SFT数据中并没有加入英文数据。此次探索的主要目的是增强一下模型的英文能力，但同时中文benchmark指标也有所提升。除了保留了之前用到的Infinity-Instruct(去除英文数据)、自我认知数据，ruozhibao、预训练数据集中的wanjuan-exam数据（共计340w条中文数据，详见第一版微调模型的文章），还引入了如下3个英文数据集：

- Code-Feedback（6.6w条）：代码SFT数据，数据来源于各种开源代码数据集以及leetcode，并进行了一系列的过滤和筛选。

- WebInstructSub（233w条）：包含数学、物理、生物、化学、计算机等领域的SFT数据。

- OpenHermes-2.5（100w条）：主要包含大模型合成的样本和聊天样本，基于Airoboros、ChatBot Arena、Evol Instruct 等开源数据进行筛选。

训练时global batch size=256，最大学习率=3e-5。实验3 看起来微调的step少一些，是因为使用的卡多，global batch size大一些，训练的数据量是差不多，大概训练了3-4epoch的数据。

1

全部中文数据+英文数据微调

使用全部的340w中文数据以及340w英文数据直接进行微调，ceval、cmmlu、mmlu的指标如下所示。相比于第一版微调模型（ceval：38分；cmmlu：33分），第二版微调模型按照1：1比例加入大量的英文数据至少是没让中文能力下降的，即使加入的英文数据有点多，预训练时的中文比例是4：1。

ceval

cmmlu

mmlu

2

仅使用英文数据微调

仅使用340w英文数据直接进行微调，mmlu和gsm8k（数学）的分数如下（因为没微调中文数据，没有测中文benchmark）。和实验1加入了大规模的中文数据相比，mmlu

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/从零训练steel-llm微调阶段优化.md)

---

