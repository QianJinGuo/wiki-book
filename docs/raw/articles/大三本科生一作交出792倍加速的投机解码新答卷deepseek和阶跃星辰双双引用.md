---
source: wechat
source_url: https://mp.weixin.qq.com/s/_aT5PkYL7tPns335R4fx2g
ingested: 2026-07-09
feed_name: 量子位
wechat_mp_fakeid: MP_WXS_3236757533
source_published: 2026-07-09
sha256: c2f4fb4d60eef30f7bedebb850e14796bb0607ed75f1594b4a1fd98cc05ab1fc
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

  * 自回归drafter能显式建模token间依赖，draft质量高，但生成多个token时需要顺序执行，开销随长度增长；
  * 并行drafter可以一次生成整个draft block，速度快，但每个位置往往独立预测，后缀token更容易偏离已经采样出的前缀。

DSpark论文把后一种现象称为suffix decay。Domino关注的正是同一个问题：并行draft的速度优势已经很明显，下一步要补上的，是block内部的因果一致性。

###### **△** Domino在draft overhead、接受长度和端到端速度之间取得更好的平衡。

## Domino怎么做？

Domino的核心设计可以概括为一句话：

保留block-parallel drafting的低开销，同时用轻量causal correction重新引入token间依赖。

具体来说，Domino由两部分组成：

  * **parallel draft backbone：** 一次forward为整个draft block产生hidden states和base logits，主计算仍然保持并行；
  * **Domino head：** 用轻量GRU causal encoder汇总已生成draft token，再通过low-rank correction head生成logit-space residual correction。

这样，Domino不需要回到完整自回归drafter。它把昂贵的主干计算和必要的因果修正拆开：主干负责速度，轻量head负责把前缀信息传到后续位置。

训练上，Domino还使用teacher-forced causal encoding和base-anchored curriculum。前者让causal encoder在正确前缀条件下学习修正；后者先强化parallel backbone，再逐渐转向修正后的final logits，避免correction branch过强导致backbone变弱。

###### **△** Domino训练策略消融。

## 实验结果

在Qwen3-4B和Qwen3-8B上，Domino在数学、代码、对话等任务中都取得了稳定提升。

论文报告显示，在Transformers后端的greedy decoding设置下，Domino在Qwen3-4B上达到平均5.47x端到端加速，在Qwen3-8B上达到平均5.49x加速；在GSM8K等任务上最高可达到7.92x。

消融实验也说明，收益并不只是来自训练数据或工程细节。关闭Domino head后，平均接受长度从4.19降到3.49，平均速度从3.31x降到2.84x。这说明轻量prefix-dependent correction是Domino的关键来源。

###### **△** Domino在代表性数学、代码和对话任务上的速度提升。

## 从Domino看DSpark

DSpark论文把方法拆成两个互补机制：

  * **semi-autoregressive generation：** 用parallel backbone加lightweight sequential module缓解suffix decay；
  * **confidence-scheduled verification：** 用confidence head和hardware-aware scheduler动态决定每个请求验证多长的prefix。

如果按这个结构拆开看，Domino对应的是DSpark中draft-model侧的核心思想。二者都保留并行backbone，让主要draft计算保持高吞吐；同时引入轻量顺序模块，把block内部的token依赖补回来。DSpark的RNN head与Domino的CausalEncoder在概念上也非常接近。

DSpark的额外贡献，则更多体现在生产系统层面：

  * 默认使用更便于部署的Markov head，同时提供RNN head；
  * 增加confidence head，估计每个draft位置在前缀已接受条件下继续存活的概率；
  * 提出hardware-aware prefix scheduler，在高并发场景下把验证预算分配给更可能被接受的token；
  * 部署到DeepSeek-V4 serving系统中，并报告在matched throughput下显著提升per-user generation speed。

因此，一个中性的读法是：**Domino** 先把draft-model侧的算法主线讲清楚，**DSpark** 则把这条路线进一步工程化到真实serving系统中。

###### **△** Domino与其它投机解码的对比（GIF动态图）

## 小结

从Domino到DSpark，可以看到speculative decoding正在从“多猜几个token”走向“低成本猜得更准，并且只验证值得验证的token”。

Domino的价值在于，它用一个研究原型把核心逻辑讲得足够清楚：parallel backbone负责速度，lightweight causal correction负责一致性。理解了这一点，再看DSpark的Markov/RNN head、confidence scheduling和production deployment，就会顺很多。

对于社区读者来说，Domino还有一个实际优势：训练和推理代码都已开源，复现路径更轻。相比之下，DeepSpec README也提示，默认Qwen3-4B设置下的数据准备需要构建target cache，存储量约38TB。**Domino不依赖这样的超大规模磁盘缓存，更适合作为理解和复现实验思路的入口** ，为学术界提供进一步探索的基础。

 _论文标题：Domino: Decoupling Causal Modeling from Autoregressive Drafting in Speculative Decoding  
作者机构：上海交通大学EPIC Lab、华中科技大学、电子科技大学、复旦大学、华为  
作者信息：Jianuo Huang、Yaojie Zhang为共同一作，Linfeng Zhang为通讯作者  
论文链接：https://arxiv.org/abs/2605.29707  
代码地址：https://github.com/jianuo-huang/Domino  
模型地址：https://huggingface.co/collections/Huang2020/domino_  


**一键三连****「点赞」「转发」「小心心」**

**欢迎在评论区留下你的想法！**

— **完**  —

  


【学术投稿】请在工作日发送邮件至：**ai@qbitai.com** ，标题注明【投稿】，并告诉我们：**你是谁** ，**从哪来** ，**投稿内容** 附上**项目/主页链接** ，以及**联系方式** 。

🎓 我们会 (尽量) 及时回复你 :)

****  
****

****🌟 点亮星标 🌟****

**科技前沿进展每日见**