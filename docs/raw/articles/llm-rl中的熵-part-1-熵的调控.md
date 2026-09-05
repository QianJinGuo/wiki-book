---
source: wechat
source_url: https://mp.weixin.qq.com/s/r5HroqOAfiqH7_LNOGgGeg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
feed_name: 炼钢AI
wechat_mp_fakeid: MP_WXS_3942529661
source_published: 2025-09-23
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
date: 2026-05-12
sha256: 9ea08786362309a46fcb8521464ec338193cbf579e589279bcfcee541a87f497
---
# LLM RL中的熵 part 1: 熵的调控
在LLM RL中，熵能反映模型rollout过程中的多样性。随着rl不断训练，熵往往会不断下降，训练后期模型rollout多样性下降。因此在训练过程中将熵维持在一个不太低的水平是比较重要的。笔者接下来会写一些熵相关的文章，总目录如下，本篇文章先介绍第一部分和第二部分：
* ** 关于熵  **
* ** 熵的调控  **
* 熵对训练的调控
* 基于熵的路径探索
* 基于熵的无监督RL
** 关于熵  **
** 1  **
** 熵的定义  **
在LLM生成next token时，实际是预测词表中所有候选词的生成概率，然后在按照特定的“解码策略”得到要输出的token，最常用的解码策略就是依概率sample。有概率就有不确定性，而熵就能表示概率分布的不确定性。熵公式如下所示：
其中 𝑝𝑡,𝑗 表示句子第t个位置生成词表中第j个词的概率。概率分布越 “分散”，熵越高，不确定高；概率分布越 “集中”，熵越低，不确定性低。熵最高的情况是词表中每个词的生成概率都是相等的。熵最低的情况是词表中某个词生成概率是1，其他词的生成概率是0。下面给出一个case的可视化：
设我们的词表只有2个词，在生成next token时其中一个词的概率p为横坐标（另一个token的概率是1-p），对应的熵为纵坐标。当p=0.5时，即两个token生成概率一样时得到熵最大，此时表示的不确定性是最大的。
** 2  **
** 熵的一些特性  **
在LLM RL训练初期，模型的熵会快速下降，准确率也会快速上升。RL的rollout是个探索的过程，随着训练过程中熵的下降，探索能力也会下降，不利于训练后期模型能力的进一步提升。在更长时间范围内将熵维持在一个合理的范围内是持续提升模型性能的关键。
《The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models》发现，在  ** 没有人工的熵干预  ** （熵loss、kl loss等）的情况下，RL模型的性能是通过牺牲模型熵来换取的，模型性能R和熵H之间可以通过公式拟合出来：
** 熵的调控  **
** 1  **
** 直接将熵加入到loss中  **
调控熵的最简单的方法就是直接将熵加入到RL的loss中，去鼓励模型在训练过程中增大熵，以保持rollout的多样性。VeRL、openRLHF等LLM RL框架都可以通过参数配置的方式非常简单的将熵引入到loss中。
《T1: Advancing Language Model Reasoning through Reinforcement Learning and Inference Scaling》
但是，loss中关于熵的系数alpha比较难确定。系数过大可能会使训练不稳定，而系数过小只能略微减缓熵损失的收敛速度，无法解决根本问题。
《An Empirical Study on Eliciting and ImprovingR1-like Reasoning Models》
《The Entropy Mechanism of Reinforcement Learning forReasoning Language Models》
除此之外，熵的系数大小对数据难度也是十分敏感的，尤其是在进行简单任务的时候，polic model部分的loss很快降低到比较低的值，进而训练过程会只优化熵的loss项，导致模型训练过程崩溃。
《Skywork Open Reasoner 1 Technical Report》
** 2  **
** 对loss中的熵系数进行动态调控  **
在《Skywork Open Reasoner 1 Technical Report》中，作者提出了一种基于目标熵和当前熵自适应调整熵损失系数的方法。tgt-ent为期望的目标熵（文中取0.2）、 Δ为熵损失系数的调整步长（文中取0.005）。在实际使用中，为了减轻不必要的熵损失导致的不稳定性，仅在e≤tgt−ent时激活熵损失。
** 局限性  ** ：当训练时候的mini batch比较大时（即off policy程度比较大），该方法也不能很好的让熵不坍缩，因为本身off policy就不利于保持熵在一个理想的水平。建议mini batch数量控制在1（on policy）或2。
** 3  **
** 用cov进行熵调控  **
_ FROM：《The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models》  _
当前policy model的动作概率（ 𝜋𝜃𝑘(𝑎|𝑠) ）与相应的优势值adv（A(s,a)）之间存在强烈的正相关关系时（例如动作概率大&adv同时大），平均而言会导致熵的降低。相反，负相关关系则倾向于增加熵。而协方差cov能够衡量两个变量的线性关联程度。对于GRPO来说，熵的变化量有如下约等式：
对熵的变化量和cov的可视化如下：
因为动作概率和adv之前存在强烈的相关性，因此如果我们能够打压这种相关性，即让他们的协方差cov降低一些，就能够缓解熵的崩溃。直接调控cov最简单直接的手段就是加入到loss中。文中提出了  ** Clip-Cov  ** 和  ** KL-Cov  ** 两种和Cov有关的熵调控方法。
* ** Clip-Cov  ** ：当cov没有保持在一个区间[low, high]时，在loss上给予一个惩罚项。这个cov的上界比较大，是平均cov的500倍以上，因此只有少量token会被clip。
对于GRPO推导出来的公式，熵的变化量是约等于logpi和pi*A的协方差的，但是此处的调控项是logpi和A的协方差。是因为在A上少乘一个pi并不会影响logpi和A相关性，因为log函数本身是单调递增的。
* ** KL-Cov  ** ：在句子中选择协方差cov前k高的token，然后在这些token上施加KL loss。
文中给出的实验结果是，DAPO的clip higher技巧在训练后期熵会发散，clip-cov和kl-cov能够保持一个比较理想的熵的区间，长度和模型性能也稳步增长。
对于Clip-Cov，增大clip掉token的数量（太大熵也会发散）或者增大KL-Cov的惩罚系数，都能增大熵的水平。使用KL-Cov更加稳定一些，因为施加KL loss通过减少policy model和ref model之间的差距来  ** 间接  ** 控制熵，是个更加软性的调控方法。
** 4  **
** on policy训练  **
使用on policy的训练策略可以缓解熵的坍塌，图例中的四元组表示（mini batch，batch size，mini batch size，epoch），当mini batch=1，epoch=1时，是训练时on policy的。
** 5  **
** clip higher  **
被广泛使用的clip higher策略（调大import sampling rate clip的上限，from DAPO）也能够缓解熵的崩塌，但是过大的clip上限会导致熵不受控制的增加。
《Skywork Open Reasoner 1 Technical Report》
** clip higher是如何影响熵的？  **
在PPO中，import sampling引入了sampling ratio项： 𝜋𝜃(𝑜𝑡|𝑞,𝑜<𝑡)/𝜋𝜃𝑜𝑙𝑑(𝑜𝑡|𝑞,𝑜<𝑡) ，当旧策略在某个token上输出的概率 𝜋𝜃𝑜𝑙𝑑(𝑜𝑡|𝑞,𝑜<𝑡) 比较小，那么sampling ratio越容易更大，也就更容易触及clip上限，导致该token不会产生梯度，进而不会影响参数更新，这些很容易触发clip的token通常是“例如”、“然而”、“等等”这些在推理路径中充当 “分叉点”的重要token。
当优势值 A>0 时，clip higher策略让低概率 token 能够有更充分的机会提升其概率，从而鼓励模型去探索更多不同的可能性，增加了策略的熵值，有助于缓解熵的崩塌。提高clip值的上限能够降低低概率token被clip的概率，缓解熵崩塌。
** 6  **
** 解耦重要性采样系数和参数更新  **
_ From 《MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention》——CISPO  _
上部分介绍的clip higher策略虽然能够缓解clip问题，但是并不能根本解决低概率token容易触达clip不更新的问题。mini-max团队发现在off policy程度比较大（mini batch num=16）的时候，clip higher、只用高熵token更新等策略仍然不能缓解熵崩溃，因此提出了CISPO：
在CISPO中，依然有对重要性采样系数r的裁剪，但是梯度并不是从r上传播的（经过了停梯度操作sg处理），因此即使r触发了clip，该token上产生的梯度也不是0，梯度会从logpi部分进行反向传播，让每个token都能参与到梯度更新。
** 7  **
** KL loss系数  **
加大KL loss系数，可以改善熵崩溃的现象。但是KL loss系数过大会限制模型的变化幅度，会降低模型的效果。我们防止熵崩溃的最终目的是让模型拿到更好的训练效果，因此通过控制KL loss控制熵有时与我们的初衷背道而驰。
《The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models》
** 为什么KL loss会影响熵？  **
如果新策略 π_new 相对于旧策略 π_old “偏移很小”（KL 小），那么 π_new 的熵的水平大概率和旧策略π_old熵的水平接近，而旧策略的熵通常是比较高的（训练初期模型的熵很高）。当加大KL loss系数时，会更加限制新策略不要偏离旧策略，新策略也就越难从 “高熵分布” 变成 “低熵分布”，从而间接保住了熵。
** 8  **
** 模型更新时过滤掉正样本  **
《The Surprising Effectiveness of Negative Reinforcement in LLM Reasoning》论文中，作者尝试仅用rollout出来的负样本去更新模型，能让模型保持较高的熵的水平。与之相反，只使用正样本优化模型会让熵迅速坍塌。
NSR是只用负样本优化模型，PSR是只用正样本优化模型
下图展示的比较直观：
* 如果使用正样本训练，模型会提高选中token的生成概率，因为概率和为1，那么就会挤压生成其他token的概率，导致生成token的分布锐化，熵更容易降低。
* 如果使用负样本训练，模型会挤压选中词的生成的概率，把挤压掉的概率分配给其他没有被选中的词，词表概率会更加平均，熵容易保持在高位。
类似的，像《Skywork Open Reasoner 1 Technical Report》那样在数据预处理阶段就直接把全做对的样本扔掉，应该也能起到缓解熵崩塌，不过目前没有看到paper做相关的消融。
** 局限性  **
不使用正样本（图中NSR）的一个缺点就是，只有模型训练到后期，在测试集的准确率才能勉强追上GRPO/PPO。挤压某个token的概率去抬高其他token的概率的概率更新幅度小。
和其他大多数paper使用mean@k（k次rollout得分的平均）指标不同，这篇paper主要强调的点是仅使用负样本训练模型能够在pass@k（rollout k次，至少有一次对的）的情况下有更高的正确率，毕竟模型的多样性保住了，能rollout出来正确答案的概率就比较高。
除了只使用负样本训练以外，作者也提出了一种更加折中的方案，仍然全样本，将正负样本对应的loss拆开，对正样本部分的loss乘以一个小系数（文中用的是0.1），让其在非pass@k的情况下也能有不错的效果。
下篇文章会介绍熵对训练的调控、基于熵的路径探索和基于熵的无监督RL等内容。