---
source_url: https://unknown/opd-revisiting-failure-modes-simple-fixes-storm
tags: [article]
ingested: 2026-05-01
sha256: 5cf0cc7e4e40b87f94241b100d2e61fa7b8ad8f72c408cc833cfdaede08b5d7e
---
大模型智能｜分享
来源 | 知乎
作者 | storm

 




在最近的大模型后训练中，On-Policy Distillation已经成为默认选项之一。

但研究者们在分析训练日志、实验曲线和对比不同 OPD 方法实现时，反复碰到同一个问题：理论上很自然的 sampled-token OPD，实际运行起来并不稳定，甚至会把模型往一些局部上“看起来合理”、整体上却越来越差的方向推。

论文:Revisiting On-Policy Distillation: Empirical Failure Modes and Simple Fixes
链接:https://arxiv.org/abs/2603.25562
代码:https://github.com/hhh675597/revisiting_opd

在这篇文章中，我们并不打算再次讲解 OPD (已经有很多不错的入门材料)，而是想集中回答三个更具体的问题：这个方法到底在优化什么；常见实现为什么容易出问题；以及有没有一个代价不高、但更稳定的实现路径。




00
先说结论

On-policy distillation（OPD）是在学生模型自己生成的轨迹上，用教师模型的反馈来训练学生模型的方法 [1][2][3]。而在长时程大模型后训练里，常见的 sampled-token 形式 往往并不稳定。

从 bias-variance 的角度看，token-level OPD 相对 sequence-level reverse-KL 的确有偏，但它的最坏情况下方差上界要小得多。我们的简化实验也说明，未来奖励耦合越强，梯度方差越大，优化越容易变得不稳。

实践里 OPD 的脆弱性主要来自三点：

• 单 token 学习信号天然失衡；
• 在学生模型生成的前缀上，教师模型的指导信号可能不再可靠；
• tokenizer 与 special-token 不一致，会进一步扭曲单 token 的比较。

我们用 teacher top-K 截断 reverse-KL 在局部支持集（local support-set）上替代单样本比较，并结合 top-p rollout 与 special-token masking。在数学推理-智能体的多任务基准上，这种做法展现出更稳定的性能提升。

On-Policy Distillation（OPD） 这两年越来越多地出现在推理模型和智能体模型的后训练流程里。Thinking Machines Lab、Qwen3、MiMo-V2-Flash 和 GLM-5 最近公开的技术报告里都能看到类似趋势：除了 SFT (off-policy distillation) 和 reinforcement learning，越来越多流程开始直接在 当前模型（学生模型） 自己生成的轨迹上施加 更强模型（教师模型） 的监督信号，或者采用与之相近的 OPD 变体 [3][4][5][6]。

这样做的好处比较直接：既然我们最终希望学生模型能在自己的采样轨迹上完成推理或交互，那么训练信号就必须在 该模型自身生成前缀分布下 仍然能提供有效信息，而不能只在教师模型的轨迹上有效。

讲到这里，我们能进一步提出几个问题：OPD 到底在优化什么目标？当我们把 sequence-level reverse-KL 换成 token-level 近似时，是在做哪种权衡？

先把目标说清楚： token-level 和 sequence-level 到底差在哪？

我们先回顾 OPD 背后的目标。对于一个 prompt x，sequence-level reverse-KL 目标写作

其中， 和  分别表示学生模型与教师模型。这说明 OPD 可以看作一个特殊的、带熵正则（entropy regularization）的有限时域强化学习问题。它的梯度可以写成

对每个解码步 ，记  为当前上下文， 为  上的 score-function gradient，并定义

利用自回归分解

可以得到 sequence-level 估计器

对  ，有  ，因为  只依赖于第  步之前的前缀，而

因此，同一个梯度也可以改写成 causal return-to-go 的形式：

在大模型训练里，另一个很常见的做法是：每个位置只保留当前这一步的即时项

我们把这种近似称为 token-level OPD。它去掉了 对未来奖励的耦合：token  的更新不再依赖更靠后位置的奖励。相对 sequence-level reverse-KL，它确实引入了偏差，但同时也降低了最坏情况下的方差增长。

这种权衡解释了为什么在长时程场景里，token-level 实现仍然很常见。它也引出了我们接下来真正关心的问题：这个近似什么时候还好用？又在什么情况下，sampled-token 信号本身会成为训练不稳定的主要来源？

1.1 偏差与方差的权衡

在上文里，我们发现 token-level OPD 丢掉了 sequence-level 估计器中的未来奖励耦合项，因此相对 sequence-level 目标一般是有偏的。

但这个简化也改变了梯度方差在最坏情况下的增长方式。在 reward 项和 score-function 项有界的假设下，token-level 估计器的方差上界随序列长度呈二次增长：

而 sequence-level 估计器对应的最坏情况上界则是四次增长：

所以，虽然 token-level OPD 相对 sequence-level reverse-KL 引入了偏差，但它把最坏情况下的方差增长从四次降到了二次。

更详细的推导可见英文版[1]附录 A。

在这里我们讲 OPD 和标准强化学习进行对比会更容易理解。在传统 R强化学习里，往往会引入 return-to-go，因为即时奖励本身并不能完整反映整条轨迹的最终环境目标。

而 OPD 不太一样：这里的  已经是对教师模型的局部对齐，所以即便 token-level OPD 相对 sequence-level reverse-KL 是有偏的，它依然保留了一个局部上与蒸馏目标（教师模型）一致的信号。

但这并没有解决另一层问题：匹配教师模型分布 本身，并不等于 对齐人类意图 或 环境/任务层面的成功。

1.2 简化实验：考虑未来奖励会把方差推高吗？

上面推导的方差上界是在最坏情况下考虑的，所以我们又做了一个简化实验。首先把这两个估计器放进同一个形式里。token-level 和 sequence-level OPD 都可以看作下面这个折扣 return-to-go 估计器的特例：

这里

其中第二种情形会退化回 causal return-to-go 形式，因为  只能影响  中位置  的 token [1]。中间的  值则在两者之间做插值。

为了可视化  增大后的影响，我们构造了一个简单的两任务-连续控制实验。先分别用强化学习训练两个教师模型，再用 OPD 把它们蒸馏进一个共享的学生模型中。训练时两个任务在不同迭代间交替出现，这与后面大模型实验中的多任务交替方式保持一致。

图 1(a). 简化实验中的梯度方差对比。随着 增大，两项任务上的梯度方差整体都会变高。

我们用下面这些折扣因子训练 student：

实验结果表明不同设置在训练早期都会出现方差尖峰。但随着  增大，训练更容易进入一个更高、更持久的高方差区间。

在我们的实验里，当  从 0 或 0.25 这类较小取值增大到 0.75 或 1.0 时，梯度方差可能会上升 2 到 3 个数量级，有效策略也会更难学出来。

为了进一步分析这种不稳定性在行为层面怎么体现，我们画出了不同  下的状态访问热图。

图 1(b). 简化环境中，不同 取值对应的状态访问热图。

如图 1(b) 所示，当  时，策略不再能稳定地朝目标移动，反而出现明显的漂移。上面的理论分析给出的只是上界，并不能精确预测真实训练中的梯度方差。所以这个简化实验更适合当作一个定性的经验现象来看：未来奖励耦合越强，不稳定优化往往会持续得越久。

更多实验细节可见英文版附录 B。

小结

token-level OPD 相对 sequence-level reverse-KL 有偏，但它的最坏情况方差上界明显更紧。

在大模型、智能体后训练这种长时程场景里，回复序列长度可能达到几十万 token，梯度方差是否可控会直接影响训练稳定性。该现象也和一些已有工作中的观察是一致的 [3][7]。

这里推荐一下两位老师 Jiacai Liu @skydownacai, Zhuo Jiang @炼熵师 的推导，可用于延伸阅读：The Policy Gradient, Bias, and Variance of OPD[2]

sampled-token OPD 为什么在实践里容易出问题？

虽然 token-level OPD 在 bias-variance 意义下有吸引力，但 sampled-token 比较在实际训练里依然不太稳定。这里我们重点分析三类问题：

• (1) 正负蒸馏信号本身高度失衡；
• (2) 在学生模型自己生成的前缀上，教师模型信号会变得不可靠；
• (3) tokenizer 与 special token 不一致，会进一步扭曲对单 token 的比较。
2.1 高度失衡的正负 sampled-token reward

在 sampled-token OPD 里，第  步的更新由一个被采样 token 上的 log-ratio 驱动：

其中  表示教师模型， 表示学生模型。经验上，大多数被学生模型采样到的 token 得到的都是负奖励，也就是

图 2. 在训练第一个 iteration、以 OpenThinker3-7B [8] 为教师模型、Qwen2.5-7B-It 为学生模型时，sampled-token OPD 的 token 概率散点图（student vs. teacher）。这个信号明显偏向惩罚当前学生模型采样出的 token，而不是提供一个相对平衡的奖励。

这里的负奖励本身并不奇怪：只要学生模型给某个 sampled token 的概率高于教师模型，log-ratio 就会是负的。问题在于整个信号的形状。如果绝大多数 sampled token 都在被往下压，优化就会过度依赖那一小撮局部上“看起来有利”的 token。

这件事之所以让人不太喜欢，是因为一旦学习主要依赖少数高杠杆的正事件，训练就会对填充词、犹豫词，以及其他局部上仍然说得过去的短续写变得异常敏感。换句话说，这个信号的问题不只是噪声大，而是结构本身失衡。

我们后续利用的 top-K 目标缓解的正是这个问题：在每个前缀上，比较的是教师模型和学生模型在多个教师模型（top-K）支持 token 上的分布，而不是只奖励或惩罚一个 sampled token。这样得到的局部训练信号，会比单样本奖励平衡得多。

2.2 完全采用学生模型自己的前缀，可能导致教师模型信号失真

sampled-token OPD 隐含了一个默认前提：教师模型的下一个 token 分布可以作为轨迹质量的可靠局部近似。可一旦采样轨迹走到那些对学生模型很常见、但对教师模型并不典型的前缀上，这个前提就会变弱。

此时教师模型分布可能仍然很尖，但它对学生模型的指导已经未必还校准得准：它可能继续给一些局部上看起来还说得过去的续写 token 很高概率，即便整条轨迹已经明显在往坏方向偏。

这也是我们训练日志里那些“代理信号被钻空子”案例的根源。学生模型可能已经掉进重复循环、自我重置式推理，或者充满标点和犹豫词的续写里，但教师模型仍然会奖励一些局部上“还能接得上”的下一 token。

问题不只是噪声，而是 在偏离教师模型分布的前缀上，token-level preference 和 trajectory-level quality 之间出现了系统性错位。

更一般地说，这些例子暴露出的是 教师-环境差异（student- environment gap）：匹配教师模型的局部 token 偏好，并不保证得到全局上/环境中好的轨迹。

有两个条件会放大这个问题。

• 第一，教师模型分布通常很尖，所以学生模型和教师模型只要有一点偏差，就可能产生很大的 log-ratio。
• 第二，模型差距越大，学生模型生成的前缀就越容易落到教师模型平时很少见的区域之外。

这两个因素叠在一起，单 token 对比就会变得比较脆弱。

我们选取了一个有代表性的例子在图 3，更多的案例可见英文版附录 C。

图 3. 学生模型已经掉进重复循环，但教师模型对这些重复 token 仍然给出较高概率，说明这种行为没有被有效惩罚。
图 4. 在第 80 个训练迭代上，OpenThinker3-7B 与 sampled-token OPD 训练得到的 Qwen2.5-7B-Instruct 之间，teacher-student log-prob gap 随 token 位置的分布。位置越靠后，方差和极端值越大，说明长采样轨迹上教师模型信号的波动更强。 我们的观察和这个解释是一致的。图 4 表明，序列前部的分布相对集中，越往后越分散，后半段既有更大的方差，也有更多极端值。变化主要体现在离散程度上，而不是均值上，这说明 teacher 信号在更长的采样轨迹上会变得更不稳定。
2.3 Tokenization 与 Special-Token 不一致会进一步扭曲单 token 比较

另一个独立的实际问题是 tokenization mismatch。之所以会出现这个问题，是因为 sampled-token OPD 比较的是：学生模型生成的那个确切 token，在教师模型分布下对应的概率。

如果两个模型的 tokenizer 不同，同一段文本就可能被切成不同 token。这样一来，学生模型生成的 token，未必是教师模型词表里一个自然的 token。

举个例子，学生模型可能把 <think> 切成 <、think、>，而教师模型则更倾向于 <th、ink、>。如果学生模型此时输出的是 <，教师模型会给它很低的概率，因为教师模型更偏好 <th。

于是你会得到一个很大的负奖励，尽管两个模型在语义上其实想表达的是同一件事。类似的问题也会出现在 special-token 上，例如 end-of-sequence（EOS） 标记（如 <|im_end|> 与 <endoftext>），它们语义等价，但概率比较出来却可能完全错位。

图 5. token-level 比较会因为 tokenizer 不一致而惩罚语义上其实正确的输出。

在这种情况下，单 token 比较就不再是在评估一种干净的、动作级别的语义分歧，它有一部分实际上取决于 tokenizer 是否兼容。

更糟糕的是，sampled-token OPD 本来就把监督压在单个 token 上；如果这个 token 本身还是 tokenizer 依赖的产物，那么这个奖励很容易把优化带偏。

小结

Sampled-token OPD 在实践中比较脆弱，主要有三层原因。

• 第一，它的单 token reward 结构性失衡。
• 第二，在学生模型生成的前缀上，教师模型指导可能会变得不可靠。
• 第三，单 token 比较还会被 tokenization 与 special-token mismatch 进一步扭曲。

这些现象都说明，我们不该继续把单 token 奖励当作默认选择，而应该转向更稳定的局部支持集匹配，在一个更合理的局部区域内比较教师模型与学生模型。

03
一种更稳定的替代： teacher top-K 局部匹配
3.1 用 Teacher Top-K 做局部支持集匹配

我们不再只在一个 sampled token 上比较 teacher 和 student，而是让比较发生在 teacher 定义的局部支持集上。先看前缀  处、覆盖整个词表的局部 reverse-KL：

sampled-token OPD 可以看成这个量的一样本随机近似：

这个近似看起来比较便宜，但它把更新完全压在一个 student token 上。

我们的方法用 teacher top-K 支持集上的截断期望，来替代这种单样本比较：

以及

在 group-based RLVR 场景里，我们会把  在 batch 内的 token 和 sampled output 上取平均。相对 sampled-token OPD，这个目标是在 教师模型支持的局部区域内做分布级比较，同时计算量又远小于对全词表做 KL。

这个目标的梯度也更有信息量。记  为学生模型在  上的 logit。对 ，

而对 ，梯度为零。也就是说，每次更新依赖的是  中所有被教师模型支持的候选 token，而不只是 sampled token 。

这也是为什么局部信号会更平衡：正向和负向的调整会分布在一个局部决策区域里，而不是集中打在单个 token 上。我们发现在 verl 的 Megatron-OPD recipe[3]中也实现了这种做法。

3.2 实现上的其他细节

实践里，我们还用了几项实现选择来稳定训练。

支持集内重归一化。 因为比较被限制在  内，教师模型和 学生模型的概率都必须先在  上重新归一化。

也就是，只在这个支持集对应的 logits 上再做一次 softmax，因此梯度不会直接传播到集合外的 token。否则，这个目标会把支持集截断和分布不匹配混在一起，训练会明显不稳定。

Top-p rollout sampling。 生成采样策略时，我们使用 top-p sampling，把轨迹尽量留在学生模型分布的高概率区域里。这样可以减少那些极少见前缀的出现，而教师模型在这些前缀上通常已经给不出有信息量的信号。

Special-token masking。 我们把 masking 看作是修补 tokenizer mismatch 的一个正交手段，而不是主要收益来源。理论上，也可以合并 multi-token marker 的不同变体，或者在等价切分之间做平均，例如 <、th、ink、> 这类切分。

本文没有沿着 tokenizer-specific 的方向继续展开。masking 是最简单、也最模型无关（model-agnostic）的做法，已经足以去掉最明显的 special-token 假阴性问题。

04
实验上到底有没有改善？

我们基于 verl-agent [9] 框架实现算法，并以 Qwen2.5-7B-Instruct 作为初始模型。实验包含两种设置：单任务训练（纯数学推理）和 多任务训练（智能体任务与数学推理联合训练）。在多任务设置下，每次训练迭代只采样一种任务，但不同任务会在迭代之间交替出现。

训练时我们使用 batch size 128、mini-batch size 64、learning rate 2e-6。评测阶段生成使用 temperature 1、top-p 0.9。除非特别说明，文中报告的都是 pass@1 结果。

4.1 单任务数学推理

在单任务训练里，我们只关注纯数学推理任务。学生模型是 Qwen2.5-7B-Instruct，教师模型是由它经 SFT 得到的 OpenThinker3-7B。训练数据使用 DAPO-Math-17K 数据集的英文部分，最大上下文长度设为 16K token。

Method
	
MATH500
	
AIME24
	
AIME25
	
Minerva
	
OlympiadBench
	
Avg


Qwen2.5-7B-It
	
68.2
	
13.3
	
0.0
	
26.5
	
32.9
	
28.2


OpenThinker3-7B
	
92.2
	
53.3
	
40.0
	
39.0
	
55.6
	
56.0


Sampled-token OPD
	
80.0
	
10.0
	
16.7
	
32.4
	
43.1
	
36.4


Sampled-token OPD w/ mask
	
81.4
	
26.7
	
16.7
	
34.2
	
44.7
	
40.7


Ours w/o mask
	
80.4
	
23.3
	
26.7
	
34.2
	
43.9
	
41.7


Ours w/ mask
	
82.0
	
23.3
	
23.3
	
34.9
	
43.9
	
41.5

表 1. 五个数学基准上的单任务评测结果（pass@1）。带 special-token masking 的 teacher top-K 目标取得了最高平均分。

先看最直接的结论。sampled-token OPD 相比学生初始模型已经有明显提升，平均分从 28.2 提高到了 36.4，但和教师模型的差距仍然很大（56.0）。

给 sampled-token 基线加上 special-token masking 后，平均分又从 36.4 提升到 40.7。这个增幅很直接地说明，tokenizer 与 special-token mismatch 会实质性扭曲单 token 比较。

我们的方法进一步把成绩提高到了 41.5。而且这种提升在加 mask 之后依然存在，所以它不能只用 mismatch 处理来解释，更说明局部蒸馏信号本身确实更好了。

最后，masking 对我们方法的影响很小（41.7 vs. 41.5），这也说明，相比 sampled-token OPD，分布级的支持集匹配天然就更不容易被 tokenizer mismatch 干扰。

4.2 多任务设置（agentic + math）

在多任务设置里，我们让模型同时在 数学推理 和 多轮智能体任务 上训练。agentic 基准采用 ALFWorld，数学部分的训练配置与第 4.1 节保持一致。

对 ALFWorld，我们使用 GiGPO-Qwen2.5-7B-It-Alfworld 公开的 checkpoint 作为教师模型[9]。最大 response length 设为每步 512 token，每个 episode 最多 30 个交互步。交互环境由 verl-agent 提供。

Agentic
	
Math
	
Math
	
Math
	
Math
	
Math
	
Math


Method
	
ALFWorld
	
MATH500
	
AIME24
	
AIME25
	
Minerva
	
OlympiadBench


Qwen2.5-7B-It
	
21.9
	
68.2
	
13.3
	
0.0
	
26.5
	
32.9


GiGPO-Qwen2.5-7B-It-Alfworld
	
95.3
	
-
	
-
	
-
	
-
	
-


OpenThinker3-7B
	
-
	
92.2
	
53.3
	
40.0
	
39.0
	
55.6


Sampled-token OPD
	
90.6
	
74.8
	
13.3
	
13.3
	
32.1
	
40.5


Sampled-token OPD w/ mask
	
93.8
	
76.0
	
20.0
	
13.3
	
33.5
	
40.4


Ours w/o mask
	
95.3
	
82.0
	
33.3
	
16.7
	
32.7
	
44.0


Ours w/ mask
	
97.7
	
79.0
	
20.0
	
16.7
	
34.6
	
42.5

表 2. 多任务设置下的结果。模型在 ALFWorld 与数学推理任务上联合训练。带 mask 与不带 mask 的 teacher top-K 目标分别在 ALFWorld 和数学上取得了最佳结果。

先看 ALFWorld，sampled-token OPD 基线已经很强，成功率达到 90.6；加上 special-token masking 后，又提升到 93.8。

而我们的方法在数学推理基准上带来的提升更明显。例如在 Math500 上，成绩从 76.0（sampled-token OPD w/ mask） 提高到 82.0；数学数据集上的平均分也从 36.6 提升到 41.7。

综合来看，我们的方法在两类任务上都给出了最好的结果：ALFWorld 达到 97.7，数学基准平均分达到 41.7。这说明提出的目标在多任务训练下仍然有效。

4.3 更多结果
发现 1：学习曲线更好
图 6(a). 单任务数学训练下的结果。训练过程中，我们用 AIME24 的 average@32 作为测试分数。
图 6(b). 多任务训练下的结果。上：ALFWorld 的训练与测试成功率；下：数学任务上的训练分数（DAPO-MATH-17k）与测试分数（AIME24 average@32）。

图 6. 单任务与多任务设置下的训练和评测表现。相比 sampled-token OPD 基线，我们的方法在数学推理任务上始终能得到更高的训练回报和更好的评测结果。

在数学推理任务上，我们的方法在整个训练过程中都能稳定取得更高的训练回报，也能得到更好的评测结果。这个趋势在单任务设置（上排）和多任务设置（下排，数学训练与智能体任务交替进行）里都成立。

而在 ALFWorld 上，两种方法的差距相对较小，因为 sampled-token OPD 基线本身已经有很高的成功率。

发现 2：优化更稳定
图 7(a). 单任务训练动态对比。左：policy entropy；右：gradient norm。
图 7(b). 多任务设置下的 gradient norm 对比。左：ALFWorld（偶数迭代训练）；右：数学推理（奇数迭代训练）。

图 7. 策略更新过程中的优化统计量。

图 7 比较了我们的方法和 sampled-token OPD 基线在优化统计量上的差异。teacher top-K 目标在保持足够 entropy 的同时，呈现出更小的 gradient norm。这个现象在单任务和多任务设置下都能看到。

图 8. 单任务训练中的 response 统计。左：训练期间触发 length-clipping 的 token 比例；右：平均 response 长度。

图 8 进一步给出了单任务训练时的 length-clipping 比例和 response length 统计。我们的方法有更低的 clipping rate，平均回复也稍短一些。我们还观察到，给 sampled-token OPD 基线加上 special-token masking，会在训练早中期显著降低 clipping rate；但对我们的方法影响很小。

发现 3：Teacher-Student 对齐更好
图 9. 在策略采样 token 上，teacher 与 student 的 log-prob 差值。从左到右分别报告最大值、均值和最小值。
图 10. 多任务设置下，teacher-student 平均 log-prob 差值。左：ALFWorld；右：数学推理。

图 9 和图 10 报告了训练过程中，在学生模型自己采样出的 token 上测得的 teacher-student log-prob gap。无论单任务还是多任务，我们的方法都始终表现出更小的 teacher-student log-prob gap。

4.4 消融实验
4.4.1 组件消融
Method
	
AIME24_avg@32


Qwen2.5-7B-Instruct
	
10.0


OpenThinker3-7B
	
63.3


sampled-token OPD
	
20.4


+teacher top-K
	
17.7


+teacher top-K +top-p
	
23.6

表 3. 我们方法中各组件的消融概览。报告指标为单任务数学训练下的 AIME24 average@32。

表 3 总结了从 sampled-token OPD 基线出发，逐步引入主要设计选择后的效果。单独把比较限制到 teacher 的 top-K 支持集上，并不会立刻带来性能提升；但把它和 top-p rollout sampling 结合起来后，收益就变得很明显。

我们还进一步考察了几项设计选择对结果的影响，包括 支持集内重归一化、teacher top-K 的支持集大小，以及 top-p rollout sampling 阈值。

图 11. 关于重归一化的消融。关闭重归一化后，训练分数会在前约 30 步内直接塌到 0。

图 11 考察了截断 reverse-KL 目标中重归一化的作用。关闭重归一化后，policy entropy 会迅速飙升，模型也学不出有意义的行为。这说明，在受限支持集内分别对教师模型与学生模型分布做归一化，对稳定优化非常重要。

图 12. 不同 top-K 支持集大小的消融。

接着我们固定 ，考察支持集大小  的影响。图 12 表明，如果支持集太小，比如 ，训练会明显不稳定，性能也更差。

相反，较大的支持集（  与  ）训练行为相近，评测分数也差不多，说明当支持集已经足够大时，方法对 k 的精确取值并不敏感。

图 13. 关于 top-p rollout sampling 的消融。

最后，我们固定 ，比较不同 rollout sampling 阈值  。图 13 显示，去掉采样约束（  ）会让训练明显变得不稳定，最终性能也更差。相比之下， 和  的训练曲线和最终分数都比较接近。

4.4.2 不同 Top-K 选择方式消融

在主实验里，我们把 KL 目标近似为：只在教师模型的 top-K token 子集上计算期望。更直白一点说，就是只在一个局部支持集上计算 KL。更具体地说，期望也可以定义在下面几种集合上：

• teacher top-K（主结果使用）
• student top-K
• teacher top-K 再加上 sampled token

我们在单任务和多任务设置下做了一个初步比较，结果见表 4。

avg@32
	
pass@1
	
pass@1
	
pass@1
	
pass@1
	
pass@1
	
pass@1


Method
	
AIME24
	
MATH500
	
AIME24
	
AIME25
	
Minerva
	
OlympiadBench


teacher top-K
	
23.6
	
80.4
	
23.3
	
26.7
	
34.2
	
43.9


student top-K
	
22.3
	
82.4
	
30.0
	
16.7
	
35.7
	
44.9


teacher top-K w/ sampled token
	
22.4
	
81.6
	
26.7
	
23.3
	
36.4
	
46.7

表 4(a). 单任务设置下，不同 KL 期望变体的消融。按通行做法，早期消融使用 AIME24 average@32，其余基准报告 pass@1。最后一列只对 pass@1 指标求平均。

Agentic
	
Math
	
Math
	
Math
	
Math
	
Math
	
Math


Method
	
ALFWorld 
	
MATH500
	
AIME24
	
AIME25
	
Minerva
	
Olympiad-BenchAvg


teacher top-K
	
95.3
	
82.0
	
33.3
	
16.7
	
32.7
	
44.0


student top-K
	
95.3
	
65.6
	
10.0
	
10.0
	
25.0
	
31.6


teacher top-K w/ sampled token
	
94.5
	
63.2
	
10.0
	
10.0
	
21.0
	
30.1

表 4(b). 多任务设置下，不同 KL 期望变体的消融。所有数学基准都报告 pass@1；最后一列对这些 pass@1 指标求平均。

在单任务设置下，这三种变体的结果整体比较接近。teacher top-K + sampled token 的平均分最高，而 student top-K 在若干单独基准上也很有竞争力。这说明方法的收益未必依赖某一个特定的支持集定义，更可能来自于：不再做单 token 比较，而是改成对多个 token 的分布级期望。

多任务结果就没这么整齐了。在这个设置下，原始的 teacher top-K 版本明显优于另外两种替代方案；而 student top-K 和 teacher top-K + sampled token 在数学基准上都退化得很明显。我们目前还没有令人满意的解释，所以不想对这些初步结果过度解读。

这一部分至少说明了一件事：KL 期望究竟在哪里计算，在多任务场景里会实打实地影响结果。我们把这里视为局部消融和初步探索；更完整的解释，包括支持集构造细节和残余的 off-policy 问题，会放到“讨论与局限”章节里讨论。




05
结论

OPD 的吸引力在于，它不是只模仿教师模型轨迹，而是利用教师模型对学生模型自身采样轨迹的反馈来学习。可在长时程大模型后训练里，常见的 sampled-token 形式既可能方差很大，也很容易被利用。

真正的麻烦不只来自估计器偏差，而是三件事叠在一起：单 token 奖励失衡、在学生模型自身生成的前缀上教师模型指导可能不可靠，以及 tokenizer mismatch。

这也是为什么我们主张用教师模型引导的局部支持集匹配，替代单 token 对比。实证上，top-K 截断 reverse-KL 再配合 top-p rollout 和 special-token masking，可以带来更稳定的优化，也能在单任务数学推理和多任务智能体训练中拿到更好的结果。

换个角度看，理解 OPD 时最好分清两层 gap：

• 一层是 token-level 与 sequence-level 监督之间的 estimator gap；
• 另一层是 teacher 派生奖励与人类意图或环境成功之间的 objective gap。

对 OPD 风格的后训练来说，一个略有偏差但稳定得多的局部目标，往往比一个更“直接”但更容易被利用的 sampled-token 信号更值得采用。




06
讨论与局限

一个实际细节是，sampled token 应该如何并入 teacher top-K 支持集。 在当前实现里，我们把 teacher top-K 和 sampled token 合并成一个集合，再在这个合并后的集合上分别对 teacher 与 student 做归一化，然后计算 KL 项。

但这并不是唯一的设计。另一个自然变体是：把 sampled token 加进来，但不在合并后的集合上重归一化，而是再配一个 importance-weighting 修正，更显式地保持无偏性 [7]。我们目前正在探索这类替代方案。

Support-set KL 本质上是一个截断目标。 当前做法只在受限 token 子集上计算 KL 项，也就是 teacher top-K 支持集，而不是全词表。这意味着梯度期望也只在这个子集内形成：支持集外的 token，在这个前缀上不会直接收到来自这个目标的梯度。相对 full-vocabulary reverse-KL，这当然会带来偏差。更重要的是，它改变了“期望在哪里取”和“哪些 token 参与更新”。

Training-inference mismatch。 前缀是在 rollout policy（例如 vLLM 引擎中的 top-p）下生成的，而训练引擎更新模型时并没有对这个采样过程做修正。这可能会引入 importance-weighting 问题。

机制解释还不完整。 我们给出的定性案例支持“教师信号被利用”这个解释，但“尖锐的教师模型分布 + 分布外前缀”目前更应被看成一种机制假说，而不是已经完全建立的因果解释。

和教师模型的差距仍然明显。 虽然我们的方法能稳定优于 sampled-token OPD，但和教师模型之间依然有一段显著差距。这说明当教师模型与学生模型差异较大时，例如经历了较重的 SFT 或存在较大架构差异，OPD 仍然是件很难的事。




07
后续方向
Top-p truncation 也许是另一条路

另一个可能更省算力的 reverse-KL 近似，是 top-p truncation：只在累计概率质量达到某个 top-p 阈值的 token 子集上计算 KL。

OPD 与 RL 在多任务泛化上的差异，值得单独研究

在多任务 RL 里，我们通常可以直接从不同任务的环境奖励变化里看到正迁移或负迁移；但在 OPD 里，优化目标仍然来自教师模型，而正如本文所说，这个信号可能和环境奖励存在显著错位。

一个重要方向是弄清：OPD 是否能像 RL 那样充分捕捉跨任务促进效应，还是 teacher-reward gap 会系统性地限制这种迁移。

Continual learning 也许是 OPD 的一个自然试验场

OPD 未必只适合一次性的后训练。尤其是在模型需要学习新技能，同时又不能灾难性遗忘旧技能时，教师模型引导的 on-policy 更新也许可以充当一种保留机制。

它能否真正奏效，很可能取决于 OPD 如何应对分布漂移、教师模型过时，以及长时间适应过程中逐步累积的近似误差。

OPD 应该被视为与其他稳定化方向互补

本文和 reward-hacking mitigation、off-policy correction [10]、perturbation-based stabilization [11]、logit-level fusion [12] 这些方向并不冲突。

它们可能都在解决同一个更大问题的不同侧面：当教师模型与学生模型的策略逐渐分叉时，怎样让教师模型派生的学习信号仍然有用。




08
参考文献
[1] https://arxiv.org/abs/2306.08543
[2] https://arxiv.org/abs/2306.13649
[3] https://thinkingmachines.ai/blog/on-policy-distillation/
[4] https://arxiv.org/abs/2505.09388
[5] https://arxiv.org/abs/2601.02780
[6] https://arxiv.org/abs/2602.15763
[7] https://arxiv.org/abs/2602.04417
[8] https://arxiv.org/abs/2506.04178
[9] https://arxiv.org/abs/2505.10978
[10] https://richardli.xyz/rl-collapse
[11] https://beneficial-curiosity-d98.notion.site
[12] https://juzhengz.notion.site/logit-fusion
引用链接

[1] 英文版: https://yuqianfu.notion.site/revisiting-opd
[2] The Policy Gradient, Bias, and Variance of OPD: https://yuqianfu.notion.site/policy-gradient-bias-and-variance-of-opd
[3] verl 的 Megatron-OPD recipe: https://github.com/verl-project/verl-recipe/blob/main/gkd/megatron/megatron_distill_losses.py




 

技术交流群邀请函



△长按添加小助手

扫描二维码添加小助手微信

请备注：姓名-学校/公司-研究方向-城市
（如：小夏-浙大-大模型-杭州）
即可申请加入深度学习/机器学习等技术交流群
—完—
为您推荐

《跨语言大模型》最新综述

深度学习领域，你心目中 idea 最惊艳的论文是哪篇？

思考丨到底什么叫算法工程师的落地能力？

Transformer模型有多少种变体？看看这篇全面综述
从SGD到NadaMax，十种优化算法原理及实现
各种注意力机制的PyTorch实现
