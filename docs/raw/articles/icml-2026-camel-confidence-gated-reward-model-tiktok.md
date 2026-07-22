---
source: wechat
source_url: https://mp.weixin.qq.com/s/ywQACkWA_nnoh4XTRh5kiA
ingested: 2026-07-12
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-12
sha256: b2f279c90b95bdc212a98be9109fde4b43d74709c0d54cdd1f6906c1fa84e909
---


# ICML 2026｜让奖励模型更准更高效，TikTok、NUS提出置信度门控

本文第一作者朱子瑞为新加坡国立大学四年级博士生，本科毕业于清华大学，研究方向为多模态大模型和后训练优化。通信作者为 TikTok 的 Kanchan Sarkar 和 Kun Xu，以及新加坡国立大学校长青年教授尤洋老师。

  


文章速览

  


  * 奖励模型（Reward Model, RM）是大语言模型对齐的核心组件，负责为模型输出提供符合人类偏好的评价信号。现有方法各有短板：标量判别式 RM 高效稳定但可解释性有限；生成式 judge 能给出判断理由，却需为每个样本生成长 reasoning，token 与延迟开销显著。

  * 本文提出 CAMEL：将奖励建模改造为置信度门控反思 —— 先以单 token 给出初判，置信度足够高直接输出，置信度低才触发 reflection 复核。

  * 关键发现：两个 verdict token 之间的 log-probability margin 与判断正确性强相关，可作为 “样本难度” 的零成本信号。

  * 效果更强：在 RewardBench、RM-Bench、JudgeBench 上平均准确率 82.9%，较此前最佳提升 3.2%，以 14B 参数超过多个 70B 级奖励模型。

  * 成本更低：置信度门控建立更优的准确率 - 成本 Pareto 前沿，简单样本只需 1 个 token，困难样本才进入反思。

  


  


  * 论文标题：CAMEL: Confidence-Gated Reflection for Reward Modeling

  * 论文链接：https://arxiv.org/abs/2602.20670

  


背景：奖励模型为什么既重要又难？

  


近期，包括 DeepSeek DSpark/DeepSpec 在内的一批工作，使 “按置信度分配计算” 成为推理系统研究的焦点 —— 计算预算应当集中在真正不确定、真正有收益的位置。而在这批工作之前，CAMEL 已经在奖励建模中系统地实践了同一原则：让模型先评估自身的确定性，再决定是否投入反思。

  


在 RLHF、RLAIF 等后训练流程中，奖励模型扮演 “偏好裁判” 的角色，为候选回答给出符合人类偏好的评价。它的质量，直接决定大语言模型最终学到怎样的行为。

  


过去几年，奖励建模沿两条路线发展。一类是 scalar RM：为回答输出标量分数，推理快、训练稳定，但只有一个数字，在事实核查、安全边界等细节上解释力有限；另一类是 generative judge（LLM-as-a-Judge）：先生成判断理由再给出 verdict，更透明也更擅长微妙比较，代价是每个样本都要付出可观的 token 成本与推理延迟。

  


然而，并不是所有偏好比较都需要 “长思考”：对多数样本，模型可以直接给出可靠判断；真正值得反思的，只是少数不确定、易出错的困难样本。CAMEL 要回答的正是：奖励模型到底什么时候需要 reflection？

  


方法：CAMEL 的置信度门控反思

  


CAMEL 的核心思想可以概括为一句话：先给出轻量初判，再由置信度决定是否反思；简单样本直接输出，困难样本才复核。

  


第一步：单 token 初判。给定问题与两个候选回答，模型先输出初始 verdict（[[A]] 或 [[B]]）。CAMEL 不引入额外的置信度模型，而是直接利用模型自身的输出分布：两个 verdict token 之间的 log-probability margin 越大，模型对判断越有把握；margin 越小，样本越模糊、越困难。

  


第二步：置信度门控反思。初判置信度高时，直接采纳初判、结束生成；置信度低时，才进入 reflection，围绕安全性、准确性、相关性、完整性等标准重新比较两个回答，给出最终判断。由此，简单样本获得 scalar RM 式的效率，困难样本获得 generative judge 式的细致复核。

  


  


 训练上，为了避免反思流于形式、仅仅重复初判，CAMEL 引入 Counterfactual Prefix Augmentation：对每个样本构造强制初判为 A、B 的两个版本，再用 GRPO 训练，奖励只取决于最终 verdict 是否正确 —— 初判正确应当确认，初判错误应当推翻。反思由此成为真正的自我修正机制，且不需要任何额外的人工解释标注。

  


实验：14B 模型也能成为强奖励模型

  


CAMEL 基于 Qwen3-14B 构建，在 Skywork Reward Preference 80K 等偏好数据上训练，并在 RewardBench、RM-Bench、JudgeBench 三个主流奖励模型 benchmark 上评测，覆盖聊天、安全、数学、代码等任务类型。

  


  


 结果显示：只用单 token 判断的 CAMEL-Fast 在三个 benchmark 上分别达到 90.5%、74.8%、65.2%；对全部样本反思的 CAMEL-Reflection 达到 92.8%、84.2%、71.6%，平均准确率 82.9%，比此前最佳 baseline 高出 3.2%，并以 14B 参数超过 LLaMA-3.1-Nemotron-70B、INF-ORM-LLaMA3.1-70B 等 70B 级奖励模型。

  


分析：把计算花在真正困难的样本上

  


置信度确实能区分简单样本和困难样本

  


分析显示，正确判断集中在高置信度区域，错误判断则集中在低置信度区域 —— 模型自身的置信度是样本难度的可靠指标。这为选择性反思提供了直接依据：只需让低置信样本进入反思。对需要高频调用奖励模型的线上系统而言，省去无差别的长 reasoning 意味着可观的成本收益。

  


训练本身还带来一个耐人寻味的现象（confidence shift）：CAMEL 训练后，置信度分布整体左移，中位数从 23.2 降至 5.9—— 模型反而变得更保守了。一个可能的解释是，模型在训练中学会了识别对最终判断真正关键的 token，因而在下结论时更为审慎。

  


  


反思是真正的自我修正

  


初判与反思结果的混淆矩阵进一步验证了反思的价值：在 RM-Bench 上，反思纠正了 1565 个初判错误的样本，仅把 332 个原本正确的初判改错，净增益 +1233；在 RewardBench 上净增益同样为正（+77）。反思带来的是可度量的纠错能力，而非形式化的重复推理。

  


  


更优的准确率 - 成本折中

  


调节置信阈值，CAMEL 可以在 CAMEL-Fast 与 CAMEL-Reflection 之间连续调节，部署时可按吞吐、延迟与准确率需求灵活取舍。与 RM-R1-DeepSeek-32B 等强生成式奖励模型相比，CAMEL-Fast 仅用 1 个 token 即可达到可比表现，中等阈值下更能以显著更少的 token 实现超越 ——CAMEL 不是简单地把 reasoning 加长，而是把反思预算集中在最可能带来收益的位置。

  


  


总结

  


奖励模型长期面临效率与表达能力的矛盾：标量模型高效但不透明，生成式 judge 更强但成本高。CAMEL 用 verdict token 的 log-probability margin 作为零额外成本的置信度信号，先给出轻量初判、必要时才反思，并通过 counterfactual prefix augmentation 与 GRPO 让反思真正学会确认或纠错。

  


最终，CAMEL 以 14B 参数在三个主流评测上取得 82.9% 平均准确率、超越此前最佳 3.2%，并给出可灵活调节的准确率 - 成本 Pareto 前沿。它所体现的原则，如今正被推理系统研究广泛验证：不要让模型无差别地思考，而要把计算花在真正困难的地方。

  


  


  
  
  
**「蚂蚁InTech奖」倒计时申报中** 蚂蚁InTech奖是由蚂蚁集团发起，面向对计算机领域科研进步有关键推动作用的中国青年学者、青年博士颁发的纯公益性奖项，分为蚂蚁InTech科技奖与蚂蚁InTech奖学金。2026届蚂蚁InTech奖将于7月17日24时截止申报，有意向申报的学者/同学欢迎扫描海报中二维码进行申报。© THE END 转载请联系本公众号获得授权投稿或寻求报道：liyazhou@jiqizhixin.com
