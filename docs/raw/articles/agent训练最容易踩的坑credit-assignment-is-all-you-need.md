---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721998&idx=1&sn=6289f73df09d8f0a83d4d10a63b161d0
ingested: 2026-08-13
feed_name: WeChat-PaperWeekly
source_published: 2026-08-06
sha256: b58c720be3f13883fdd661776cf13c7229279364902faa865a04c603b071738b
---

# Agent训练最容易踩的坑：Credit Assignment Is All You Need

原创 haotian 2026-08-06 23:40 江苏

长程强化学习最容易忽略的一步

## 

一条成功轨迹里也可能夹着错误行为，整条奖励下去，模型连不该学的部分也会一并强化。

训 reasoning-model 的时候，即使输出很长，也不会 care credit-assignment，只要题目足够难、group-size 足够大，训练时间足够长，训推 diff低/entorpy 不炸，基本都能涨到还不错的效果。

但转到 agentic 任务，似乎故事的叙事方法就完全变了。

加入各种 TITO、seq/token-is（有偏/无偏）以及各种不同的算法变种，在笔者的实验中，总是涨点随缘，波动为主。很少能见到类似 reasoning-RL 那样非常明确的涨幅趋势。

从换 data、加 KL（防治分布漂移）、加 entropy（增加探索）等等，似乎都无法解决问题。当模型曲线健康的时候，eval 不涨点会比较难定位问题。

infra 错？但 single-turn 都正常且训推 diff、entropy、KL 都正常。

数据错？换 data 似乎也不解决问题（除非用测试集训练）。

recipe 错？都训不崩、指标健康，recipe 似乎没错。

分析 rollout 样本？不同的任务/task 分析难度不低，LLM-judge 能给出一些初步诊断，但一些问题的解决需要从 data 角度构造（且模型的输出行为需要能符合预期，这个周期也不短）。

加 reward-shape？底座/数据/任务之间，比较难迁移，且不解决长期问题。

思来想去，只能转向credit-assignment。对于 128k 甚至 256k 长度的训练长度，高质量的 rubric 和 LLM-judge 成本很高，拖累训练速度，验证周期也更长。

在 SAO 之前，大家还是更多 group-sampling 这种方法，当 data、recipe 都看着正确的情况下，只能增加 bs 或者 rollout-num-per-group，企图通过更多暴力采样解决问题。

你说 infra 的训推 diff 更小会不会变好，答案肯定是 no，开了 r3、算子对齐，出来也是依托答辩。

最明显的问题：

1\. 正确样本里面有 bad-behavior，但如果数据质量不够高，bad-behavior 会被鼓励甚至放大，导致更难的题目直接 fail（1. 造更好的data；2. 加reward-shape）---> 造更好的 data，短期不容易解决；reward-shape 不解决本质问题，且随着底座、数据变化，大概率也是无用功。

2\. 错误样本里面，有正确的推理+工具调用路径，GRPO 这种 critic-free 会无差别惩罚\--->充分说明，吃大锅饭、非个性化培养，企图用一个信号训模型，训出来的都是垃圾。

解决思路也简单：partial-credit-assignment。只要有就比没有强（不能比 group-mean 还差），质量更高更好[6]。

1\. 离线 judge bad-pattern，前缀不做优化，只优化后缀（比如出现过明确推理得到的答案但最后验证等等错误）；

2. [1][2][3] 里面的提到的方法。

PivotRL：

应用到 credit-assignment，则可以这么做：

1\. 离线先 SFT 筛一波数据；

2\. 通过 LLM-judge、entropy 等等，找一个合适的 cut-point（比如 first-error-step 检测、高 entropy 分叉点，比如[4]）；

3\. 离线 cut 后，前缀作为 prompt 丢进去（不做优化，prefix-replay），只优化后缀，还是按照 GRPO 的标准配置。

类似的方法还有 [1]，但 [1] 的实现更复杂一些（[1] 还同时训了 reflection generation and action retries 等等，复杂度相对高）。

基于 Pivot-RL 的 naive 版本（离线 cut，replay-prefix，只 rollout+optimize suffix），已经在部分 bench 上涨点显著（没出现随机波动），更大的尺寸、更多的训练 step，也符合预期。

但整体上，如果算力比较高，做 tree-rollout，选 pivot-node（比如 [4]，再结合 LLM-judge），做后续的 rollout，估计 q-value 等等，也能得到比较 solid 的 pivot-turn 的选择，会是更好的选择。

近期，在多轮 OPD 场景，也有类似的工作 [3]，通过各种不同的方法 replay-prefix，提升多轮场景的 credit-assignment 准度和收敛效率。

由于加了 pivot 的 prefix-replay，整体训练速度也会提升（适合短期交付、资源少的场景），且能更稳定的涨点，是一个不错的实践方法。

如果资源充足，还是做一个 value-pretrain 来的划算，即使没有 large-scale-value-pretrain，也能在 RL 的训练数据上做，也会有很不错的效果 [5]。

我们在 [5] 中，也粗浅验证了一下 value-pretrain 和 RL 的数据 IID，对于 OOD 涨点也会更好。或者做 tree-rollout，选择合适的分叉 node [4]，也能更好的优化 long-horizon agentic task。

一句话总结：credit-assignment 只要不是胡乱搞（不能比 group-mean 还烂，EVPO [6] 里面，有比较明确的实验），在多轮场景下，或多或少都会有些增益，避免过分惩罚错误里面的正确，导致模型的输出质量急剧下降。

**参考文献**

[1] Agent Reinforcement Learning via Pivotal-Aware Self-Feedback Retry

[2] PivotRL: High Accuracy Agentic Post-Training at Low Compute Cost

[3] Multi-Turn On-Policy Distillation with Prefix Replay

[4] TreeRL: LLM Reinforcement Learning with On-Policy Tree Search

[5] <https://zhuanlan.zhihu.com/p/2064452938018322060>

[6] EVPO:*Explained Variance Policy Optimization*, arXiv:2604.19485

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721491&idx=1&sn=11652d01db855f82f081e10e7c53eb1d&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721384&idx=1&sn=0ce5dd283c6fd4a6562c6e8740d6d5a0&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721067&idx=2&sn=82b23158c4f51801488304b5d6a10f5c&scene=21#wechat_redirect>)

**# 投 稿 通 道#**

**让你的文字被更多人看到**

如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown** 格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

**△长按添加PaperWeekly小编**

🔍

现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

·

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=5617b194&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247721998%26idx%3D1%26sn%3D6289f73df09d8f0a83d4d10a63b161d0>)
