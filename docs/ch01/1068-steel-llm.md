# 【从零训练Steel-LLM】模型设计

## Ch01.1068 【从零训练Steel-LLM】模型设计

> 📊 Level ⭐⭐ | 3.4KB | `entities/从零训练steel-llm模型设计.md`

# 【从零训练Steel-LLM】模型设计

**来源**: 炼钢AI

**发布日期**: 2024-09-03

**原文链接**: https://mp.weixin.qq.com/s/JaZyf1jOEOtNDCcFqSj8TQ

---

这是从零训练Steel-LLM的第三篇文章，于24年7月9日首发于我的zhi hu帐号：“战士金”，略有修改。目前正在进行模型微调和评估的相关工作，近期已经将训练过程中的多个checkpoint上传到HuggingFace，最终一共训练了1060k个step，1.1T个token（2个epoch）。

1

从零训练Steel-LLM目录

【从零训练Steel-LLM】预训练数据收集与处理

【从零训练Steel-LLM】预训练代码讲解、改进与测试

【从零训练Steel-LLM】模型设计

2

前言

我们的目标是从0预训练一个1B左右的LLM，使用T级别的数据，模型被称为Steel-LLM。我们会分享预训练过程中的关于数据收集、清洗、模型设计、训练程序等内容的所有细节和代码，更详细的项目介绍请见本系列的第一篇文章。相关资源链接如下：

github链接：https://github.com/zhanshijinwat/Steel-LLM/tree/mainhuggingface链接：https://huggingface.co/gqszhanshijin/Steel-LLM

本篇文章是该系列的第三篇文章，主要分享一下笔者在模型设计上的思考与探索。

3

关于Scaling Law

考虑到算力以及训练完的模型最终包含的知识量，Steel-LLM在开始时就已经确定了要训练的是1B的模型，使用1T左右的数据（最终用来训练的数据为1.6T数据，400B个token）。但在项目过程中，仍然简单的根据scaling law计算了一下在我们拥有的算力的情况下，模型尺寸和数据规模的“最优”（能达到最低的loss）值。计算scaling law时，Steel-LLM项目并未使用Chinchilla等早起工作拟合出来的参数，而是使用DeepSeek技术报告中给出的参数，如下所示，M为模型规模，D为数据规模，C为预计使用的计算里量：

通过在wandb上的打点来看，训练1.1B模型时我们单卡A100实际的算力是 1.88∗10  14  flops/s左右（因为是数据并行，各卡是独立消费token的，因此算scaling law时候用单卡的算力算），在假设训练25天的情况下，能达到最低loss的模型大小为10B左右，单卡数据消费量为36B左右。（但如果真换成10B模型，25天应该消费不了36B数据，因为mfu会下降，实际的每秒的flops不会有 1.88∗10  14  这么高，所以这块的具体数值并不准确，计算的最优的模型和数据规模是偏大的。这篇文章撰写时候，我们的最终模型已经开始训练，暂时不会停下来测scaling law这块。并且，单卡也撑不下10B模型的训练）。

C = 1.81014 3600 24  25M_opt = 0.1715C0.5243 # 10701818976D_opt = 5.8316C0.4757 # 36334610364

我们的训练目标是，在有限算力并且模型不太小的情况下，尽量消费更多的数据，让模型学到更多的东西，因此并不严格遵守scaling law。并且，目前开源的LLM训练的数据量通常也是比通过scaling law计算出来的“最优数据量”大的多的多的。

4

模型

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/从零训练steel-llm模型设计.md)

---

