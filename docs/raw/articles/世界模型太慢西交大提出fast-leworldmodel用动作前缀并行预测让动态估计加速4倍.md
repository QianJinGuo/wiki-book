---
source: wechat
source_url: https://mp.weixin.qq.com/s/JIvkoo1pKkzup4Q6RdTLyQ
ingested: 2026-07-07
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-07
sha256: ef891d096a9af8b617fd49a90d7dd2522fbe5a1303b75b078bfdc08aac75c214
---


# 世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍

本文第一作者为西安交通大学硕士生高云天，通讯作者为西安交通大学教授许翔宇，其研究方向涵盖世界模型、三维视觉与具身智能（个人主页：https://xuxy09.github.io/）

  


在视觉规划与具身智能中，“世界模型” 被认为是智能体走向通用决策能力的核心组件：在真正执行动作之前，先在潜在空间中 “想象未来”，再选择最优行为。

  


但在视觉规划里，这个 “想象” 过程往往很慢。

  


以 LeWorldModel（LeWM）为例，它在规划时有一个重要瓶颈：每评估一条候选动作序列，模型都要一步步自回归 rollout。也就是说，LeWM 先预测下一步 latent，再把预测出的 latent 输入 dynamics model，继续预测下一步：

  


  


这种方式有两个问题：一是规划慢，CEM 需要反复评估大量候选动作序列；二是误差会沿 imagined trajectory 累积，早期预测偏一点，后面可能越滚越偏。

  


针对这一瓶颈，西安交通大学研究团队提出了 Fast LeWorldModel（Fast-LeWM），试图从根本上改变世界模型的预测方式：从 step-by-step rollout 变成 trajectory-level parallel prediction。

  


  


  * 论文标题：Fast LeWorldModel

  * 作者：Yuntian Gao, Xiangyu Xu

  * 单位：西安交通大学

  * 论文链接：https://arxiv.org/pdf/2606.26217

  * 项目主页：https://fast-lewm.github.io/

  * 代码：https://github.com/Yuntian-Gao/Fast-LeWorldModel

  


它的核心思想非常直接：不再用一步转移模型反复 rollout，而是把一段动作序列的不同前缀作为预测单元，直接并行预测执行这些动作前缀后到达的未来潜变量，并且通过密集的监督迫使模型学会状态随着不同动作序列的演化过程，而非状态的单步转移。

  


换句话说，模型不再问：“执行下一个动作后会怎样？”，而是直接问：“执行 1 个、 2 个、…… H 个动作后，分别会到达什么状态？”

  


实验显示，在与 LeWM 相同的规划协议下，Fast-LeWM 将平均成功率从 85.8% 提升到 90.5%；加入自一致性约束后进一步提升到 92.0%。同时模型的 rollout 中的动态模块耗时从 31.4s 降至 8.0s，完整 CEM 求解时间从 54.4s 降至 28.3s。

  


  


Fast-LeWM 的 pipeline

  


  


Fast-LeWM 的方法由三部分组成。

  


第一步，视觉编码器把当前观测和未来观测映射到 latent space：

  


  


其中当前 latent z_t 是模型输入，未来 latent  是训练监督目标。

  


第二步是 Action-Prefix Encoder。它把候选动作序列通过 causal Transformer 编码成一组 prefix tokens，每个 token 对应一个不同长度的动作前缀：

  


  


其中，第 k 个 prefix token 只包含前  k 个动作的信息：

  


  


考虑到同样的动作序列在不同初始位置、物体状态和接触关系下对于动作会产生不同的后果，实际实现中，Fast-LeWM 还会把当前 latent z_t  映射成 state token，放在动作 token 序列最前面，为动作的编码提供上下文信息。

  


  


第三步，Parallel Latent Predictor 使用当前 latent 和全部 prefix token，一次性输出所有未来 latent

  


  


训练时，Fast-LeWM 对每一个前缀的预测都施加监督，而不只是监督最终状态：

  


  


最终目标保留 SIGReg 防坍塌正则：

  


  


这也是 Fast-LeWM 区别于 LeWM 的关键：模型不只学习状态的局部变化，还要学习动作逐步累积时状态如何连续变化。

  


Planning 时：

基于动作前缀的快速 rollout

  


在测试阶段，Fast-LeWM 仍然沿用 LeWM 的 CEM 规划协议，对于 CEM 中第 m 条候选动作序列，LeWM 需要通过一步动态模型沿 imagined latents 逐步推进，最终得到终点预测 。相比之下，Fast-LeWM 将动作前缀作为 rollout 单元：对于长度为 H 的候选动作序列，模型通过对应的 prefix token ，直接从当前 latent 建立到未来 latent  的预测路径，因此候选序列的代价函数：

  


  


论文这种动作前缀的设计还额外带来了一个可选的 self-consistency scoring：模型一方面可以直接从长度为 H 的动作前缀预测终点；另一方面也可以先预测一个中间 latent，再从中间 latent 继续预测剩余时域。两种终点预测之间的差异被作为一致性惩罚项：

  


  


其中，β 控制 self-consistency 项的权重。当 β=0，Fast-LeWM 退化为只使用 goal distance 的 CEM 打分；当 β>0 时，CEM 可以选择那些在不同 prefix 分解下预测结果一致的候选动作序列，进一步提升规划稳定性。

  


成功率提升，

规划时间近乎减半

  


实验沿用 LeWM 的 goal-conditioned latent planning 协议，在 Two-Room、Reacher、PushT、OGBench-Cube 四个环境上评测: 

  


  


结果显示，Fast-LeWM 在四个任务上的平均成功率从 LeWM 的 85.8% 提升到 90.5%；加入动作前缀预测带来的额外 Self-Consistency 规划项后进一步达到 92.0%。

  


效率提升更明显。在相同 CEM budget、单张 NVIDIA 4090 上，Fast-LeWM 的 dynamics time 从 31.4s 降到 8.0s，加速约 4 倍，其中包含动作编码和 predictor 预测时间。完整 CEM solve time 从 54.4s 降到 28.3s，减少 48.0%。

  


另外开环情况下，Fast-LeWM 想象未来时的 latent 误差和误差随 Horizon 的增长率也更小：

  


  


消融实验：

不是简单把动作块变长就行

  


  


作者进一步通过消融实验验证了 Fast-LeWM 各个组件的作用。首先一个看似直接的加速方式是：把 LeWM 的动作块变长，让一次 transition 覆盖更长时间。作者构造了 Long-Action LeWM，将原本 action encoding 从 5 个 primitive actions 改为 25 个 primitive actions, 结果效果并不好，Terminal-only Fast-LeWM 只监督最终 latent，不监督中间 prefix latent，表现优于 Long-Action LeWM，但仍低于完整模型。这说明 action prefix 本身已经是更有效的长时域表示，但 dense prefix supervision 对学习连续状态演化仍然关键。

  


作者还发现，去掉 state token 后，模型在多个任务上性能下降。这进一步说明了动作编码需要提供有效的上下文信息。

  


总结

  


Fast-LeWM 针对世界模型在规划阶段的关键瓶颈，提出了 action-prefix prediction 机制，将传统的一步自回归 rollout 改为并行多时域潜变量预测。

  


在相同 LeWM 评测协议下，Fast-LeWM 将平均规划成功率从 85.8% 提升到 90.5%，加入 self-consistency 后达到 92.0%；同时将动态模块耗时从 31.4s 降到 8.0s，将完整 CEM 求解时间从 54.4s 降到 28.3s。

  


更深层意义：

世界模型的瓶颈不在 “模型”，而在 “接口”

  


这项工作的核心启示并不只是加速，更本质的是它表明，对于面向规划的世界模型而言，动态模型的接口设计本身可能与表征学习目标同样重要。相比一步步预测 “下一个 latent”，直接预测动作前缀导致的多时域未来状态，或许是让视觉世界模型走向高效规划的一条更直接的路径。这可能意味着，世界模型正在从 “逐步想象未来”，走向 “并行生成未来”。

  


已关注

__

关注

__ 重播 __ 分享 __ 赞

关闭 __

**观看更多**

更多 __

__

__

__

_退出全屏_

[ __](<javascript:;>)

_切换到竖屏全屏_ _退出全屏_

机器之心已关注

[ __](<javascript:;>)

分享视频

 __，时长 00:22

0/0

00:00/00:22

切换到横屏模式 

继续播放

进度条，百分之0

 __

[播放](<javascript:;>)

00:00

/

00:22

00:22

[倍速](<javascript:;>)

 _全屏_

 __倍速播放中

[ 0.5倍 ](<javascript:;>)[ 0.75倍 ](<javascript:;>)[ 1.0倍 ](<javascript:;>)[ 1.5倍 ](<javascript:;>)[ 2.0倍 ](<javascript:;>)

[ 超清 ](<javascript:;>)[ 流畅 ](<javascript:;>)

您的浏览器不支持 video 标签 

__

继续观看

世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍 

观看更多 __

转载

,

世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍

 __

机器之心 已关注

分享点赞在看

 ____已同步到看一看[写下你的评论](<javascript:;>)

 __

[ 视频详情 ](<javascript:;>)

  


© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
