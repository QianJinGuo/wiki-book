---
sha256: 7dc8e9ada439b966cc773ad23f7a2a4ffb3086c87eeb65b27a2f304d93af8c21
source: wechat
source_url: https://mp.weixin.qq.com/s/om7MiAw9BepvTlTrpEz5Ew
ingested: 2026-07-15
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-15
---

# 大模型RL训练为何会「越训越窄」？ACL Outstanding Paper从token-level熵变揭示RLVR训练机制

基于可验证奖励的强化学习（Reinforcement Learning with Verifiable Rewards，RLVR）正在成为大模型后训练的关键技术。数学题能判对错，代码能跑测试，可验证奖励让大模型可以通过强化学习持续提升推理能力。

不过，在 RLVR 训练过程中，一个值得关注的问题是：模型并不总是越训练越会探索。随着策略熵（policy entropy）快速下降，模型输出可能逐渐同质化，采样路径变窄，训练也可能提前停滞。

近日，浙江大学、腾讯等机构的论文《Rethinking Entropy Interventions in RLVR: An Entropy Change Perspective》在刚刚结束的 ACL 2026 会议中获评 Outstanding Paper Award。这项工作从 token-level 熵变出发，重新解释 RLVR 中的熵坍缩（entropy collapse），通过理论和实验分析对于熵动态的干预机制，并提出熵稳定方法 STEER，在数学推理和代码任务上都取得了稳定提升。

* 论文标题：Rethinking Entropy Interventions in RLVR: An Entropy Change Perspective
* 论文地址：https://arxiv.org/abs/2510.10150
* 代码地址：https://github.com/zz-haooo/STEER

RLVR 训练中的熵坍缩：探索空间为何过早收缩？

RLVR 的训练过程看起来很直接：模型生成答案，环境给出可验证奖励，算法再根据奖励更新策略。对于数学和代码任务来说，这个范式尤其自然，因为答案是否正确、代码是否通过测试，都可以作为明确的反馈信号。

然而，在实际训练中，一个常见的训练现象是策略熵会快速下降，这就是熵坍缩。

熵坍缩会让模型输出逐渐同质化，采样路径变窄。对于 GRPO 这类 group-based 算法，问题会更严重：当同一个问题采样出的回答越来越相似，组内 advantage 信号会变得不再有区分度，训练也可能随之停滞。

要理解策略熵的下降过程，可以把 RLVR 训练看成对一棵推理树的动态调整。

具体来说，大模型的一段推理不是一次性生成出来的，而是由许多步 token 选择串起来的。站在某一步，模型会对所有可能的下一个 token 给出一个概率分布；把这些可能性继续展开，就像一棵不断分叉的推理树。

这里的"分叉"并不是简单数有多少个候选 token，而是看模型真正给多少条路径分配了足够的概率。因此，token 熵反映的是某个节点处的"有效分叉数"：有效分叉越多，模型保留的可能推理方向越多；有效分叉越少，推理树就越容易收缩到少数路径上。

从这个角度看，RLVR 本质上是在已有推理分支上做动态调整：有价值的分支被继续延展，错误或低价值的分支被压制、剪掉。

STEER：熵稳定方法

基于上述分析，论文提出了 STEER（Stabilize Entropy through Entropy-driven Regularization）。其核心思路是在 RLVR 训练中引入一个轻量级的熵正则项，在不改变原有训练目标的前提下，对策略熵的下降速度进行调控。

STEER 的独特之处在于它不是一刀切地阻止熵下降，而是针对性地在那些"还有探索价值的节点"上维持熵——也就是那些在训练过程中仍然有多个合理推理方向的 token 位置。对于那些已经明确收敛到少数正确路径的位置，熵下降是正常的，不应干预。

实验结果显示，STEER 在数学推理（GSM8K、MATH）和代码任务（MBPP、HumanEval）上都取得了稳定的性能提升，同时保持了推理路径的多样性。

论文的另一个重要发现是：不同的熵干预策略（如 KL 惩罚、熵奖励、STEER）实际上作用于推理树的不同层面。KL 惩罚约束全局分布，熵奖励鼓励整体探索，而 STEER 则专注于节点级别的熵调控。这些方法不是替代关系，而是可以在不同层面组合使用。

这项工作的核心贡献在于：

1. 从 token-level 熵变的视角重新解释了 RLVR 训练中的熵坍缩现象；
2. 指出了不同熵干预策略在推理树上的作用层次差异；
3. 提出了节点级别的熵调控方法 STEER，在多个基准上取得稳定提升。
