---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511041&idx=1&sn=037ffb3529df30ea5b8b30b966a526bf
ingested: 2026-08-13
feed_name: WeChat-阿里技术
source_published: 2026-08-07
sha256: fe66a1bfdc26423645a360c7eccc20f347cc0fc6f8dfd56c5863b00d21615a73
---

# 参数化 Memory 漫谈（纯干货）

原创 陈梓康 2026-08-07 18:18 福建

本文意在通过梳理脉络，尝试从头理解参数化，以及理解记忆

这是2026年的第 49 篇文章

（ 本文阅读时间：约 100 分钟 ）

前言的前言：本文的思路是什么？

（和 LLM 相关的）Memory 是一个被广泛关注和讨论的话题，其中，参数化 Memory 是 Memory 的一个重要分支。

但是在众多的谈论中，我发现很多文章对于“参数化 Memory”这个概念的理解并不一致，比如认为“只要训练了一个记忆特化的模型，就归类为参数化 Memory 研究”。甚至在写下这篇文章之前，我也很难系统性地理解参数化记忆的本质是什么、难点如何，以及它和 LLM 的关系如何。

因此，本文主要是梳理一些脉络，尝试从头理解参数化，以及理解记忆。故称为：“漫谈”（偏教学向、学习向）。

> 作者注：
> 
> 本文绝大部分内容由手工古法撰写，AI只是用于资料搜集和校稿。
> 
> 本人愚钝，才疏学浅，唯恐笔力不逮，只能在写作过程中边学边悟、边写边改。拙作粗陋，实是抛砖引玉，恳请各位不吝赐教，多多指点迷津。欢迎私下交流探讨。

01

前言：Memory 到底是什么？

自进化是什么？

自进化，是一个很大的问题，但不妨试想一下。如果我们要迭代一个 LLM，通常会怎么做？

我们会观察它在不同任务、不同场景、不同用户需求下的表现，收集成功样本与失败样本，再据此调整模型的参数、数据、结构、训练方式或推理流程，使它在新的环境中表现得更好。

如果让一个 LLM 参与迭代另一个 LLM，它大概率也会沿着类似路径工作：阅读大量 bad case，理解当前方法的边界，归纳失败模式，提炼改进方向，然后尝试调整模型的行为生成机制。这个调整不一定直接发生在参数层，也可能发生在 prompt、工具策略、任务流程、检索系统、训练数据或外部记忆层。

从抽象层面看，这个过程可以类比为梯度下降。

梯度下降的基本逻辑是：

> 收集数据 → 计算梯度 → 调整参数

模型先观察自己的输出与目标之间的误差，再通过反向传播把误差转化为梯度，最后沿着梯度方向更新参数。这里的“梯度”可以理解为一种压缩后的更新方向：它把大量样本中的误差信息，压缩成一组可以改变模型未来行为的数值信号。

问题在于，LLM 的自迭代并不天然拥有这样清晰的数值通道。

对于传统神经网络训练来说，误差可以通过 loss 函数和反向传播被计算出来。数据中的 delta 可以被累积、求和、传播，最终形成参数更新方向。但对于 LLM 自迭代来说，很多 bad case 并不是简单的数值误差。它们往往是语义层面的失败：

  * 回答没有理解用户真实意图；

  * 工具调用时机错误；

  * 上下文压缩丢掉了关键约束；

  * 对风险的判断不够稳；

  * 生成内容看似合理，实际没有改变用户决策。




这些失败无法直接做 delta，也无法简单求和。LLM 需要先理解错误，归因错误，聚类错误，再把大量分散的经验压缩成可复用的更新方向。

因此，一个更一般的表述是：

> 自迭代的核心问题，是如何把海量经验压缩成可执行的更新方向。

这也是“Compression is Intelligence”这句话有启发性的地方。更严谨地说，它并非某篇论文的固定原句，更接近于对 Hutter Prize 背后思想的概括：Hutter Prize 以压缩维基百科文本作为推动通用智能研究的路径，其动机正是认为压缩与智能行为存在深层关联。近年来也有实证研究发现，LLM 在外部文本语料上的压缩效率，与多项下游 benchmark 表现高度相关。(Hutter Prize；arXiv)

Pre-training、SFT、post-training，以及更广义的模型编辑和偏好优化，本质上都在做类似的事情：把海量数据中的规律、偏好、约束和错误信号，通过某种算法压缩成更新方向，再写入模型的参数、行为策略或外部系统。

由此可以进一步推出一个关键问题：如果 LLM 要持续自迭代，它需要某种能够跨时间携带经验的中间状态。

这个中间状态要记录系统经历过什么，哪些输出曾经失败，失败原因是什么，下次遇到相似场景应该如何处理；同时，它还要支持把这些经验进一步转化为 prompt、工具策略、训练数据，甚至参数更新。也就是说，它承担的是“经验压缩后的更新方向”的保存与调用功能。

在这个特定语义下，我们不妨把这种中间状态称为 Memory。

这里的 Memory 是一个工作性定义。它并不预设自己等价于人类记忆，也不试图覆盖心理学、神经科学或哲学意义上的“记忆”概念。本文讨论的 Memory，特指 LLM 自迭代系统中的一种技术对象：一种能够保存历史经验、承接评价信号、支持错误归因，并在未来任务中参与行为更新的持久状态。

Memory 当然可以让模型记得更多。但本文更关心的是：系统能否把过去的交互、反馈、错误、偏好和验证结果，压缩成未来可调用、可修正、可验证的更新方向。

换句话说：

> Memory 是 LLM 自迭代中的外部 optimizer state。

它保存的不是单纯的历史记录，而是历史经过评价、归因和压缩之后形成的可复用结构：

  * 我为什么错；

  * 我在哪类任务中容易错；

  * 我下次应该如何处理；

  * 什么样的结果才算更好；

  * 这条经验是否已经被验证；

  * 它应该留在外部记忆里，还是进一步固化进系统或参数中。




所以，从自迭代的视角看，Memory 可以被理解为一种经验压缩状态。它连接了过去的表现和未来的更新，使 LLM 有可能从一次次分散的交互中积累出稳定的改进方向。

至此，我相信你对于 Memory 有了新的认识。

我们先聊聊参数化 Memory 中的参数。

02

LLM时代之前的自适应元学习

能不能把过去任务中的经验压缩进模型参数，使模型在遇到新任务时，只需要少量样本和少数梯度步，就能快速适应？MAML （Model-Agnostic Meta-Learning）就是为了解决这个问题而提出的。

MAML，全称 Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks，由 Chelsea Finn、Pieter Abbeel、Sergey Levine 提出，发表于 ICML 2017。(PMLR) 它的主张是：

> 给定一组相关任务，训练一个初始参数 $ \theta $，使得模型从这个 $ \theta $ 出发，经过一到几步梯度更新，就能在新任务上表现良好。

MAML 不会在参数里存某个具体答案，其实它更像是在参数里存一种“可快速改写的结构”：当新任务给出少量样本时，梯度可以迅速把模型推到合适的位置。关于使用条件：MAML 对模型形式相对开放，只要求模型能用梯度下降训练，并展示在回归、分类、强化学习中都能使用。

值得注意的是：MAML 的方法训练模型参数，使得新任务上少量数据和少量梯度步就能产生好的泛化表现；换句话说，它训练的是一个“easy to fine-tune”的模型。

把 MAML 翻译成我们的问题：

> MAML 不是把经验压缩成固定能力，而是把经验压缩成“快速适应能力”。

这里的“记忆”体现在参数的状态中。它保存了过去任务分布中的共性，使新任务的数据可以通过梯度快速触发正确变化。

这正好对应我们之前讨论的 Memory 视角：

参数化记忆 = 历史经验被压缩进参数后，形成一种让未来更新更容易发生的状态。

### 

2.1 MAML 算法基础



    
    
    过去任务分布  
        ↓  
    外循环训练  
        ↓  
    得到初始参数 θ  
        ↓  
    新任务少量样本  
        ↓  
    内循环梯度更新  
        ↓  
    得到任务适应后的参数 θ'  
        ↓  
    用新样本评估 θ'  
        ↓  
    反过来优化 θ  
    

一句话：

> MAML 学到的不是一个最终答案，而是一个“容易学会新任务”的参数初始状态。（或者也可以说是中间状态）

### 

2.2 和普通 pretraining 的区别

MAML 和普通 pretraining 或 multi-task training 通常在优化：

也就是让同一个参数  在很多任务上的平均表现尽量好。 MAML 优化的是：

其中：

关键差异在于：MAML 不直接要求  在当前任务上最好，它要求 **经过少量梯度更新之后最好。**

所以 MAML 的优化目标可以写成：



    
    
    普通训练：让当前参数表现好  
    MAML：让当前参数经过少量更新后表现好  
    

这一步非常重要。它把训练目标从“当前能力”迁移到了“可适应性”。

从参数化记忆的角度看：



    
    
    普通训练压缩的是：跨任务平均规律  
    MAML 压缩的是：跨任务快速适应结构  
    

这也是为什么 MAML 论文说，它相比普通预训练初始化，显式优化快速适应能力，让模型在少量样本下完成高效适配。

### 

2.3 算法到底怎么运行？

MAML 有两个循环。 

内循环：在一个具体任务上快速适应

假设我们采样到一个任务 。 模型先用这个任务的少量样本计算 loss：

然后做一步梯度下降：

这里的  是适应任务  之后的参数。

这一步相当于：



    
    
    拿到新任务少量样本  
    ↓  
    计算任务梯度  
    ↓  
    把通用参数 θ 改写成任务参数 θ'  
    

#### 外循环：优化“原始参数 θ”

接下来，MAML 不直接评价 ，而是评价更新后的 ：

然后用这个 loss 反过来更新原始参数 ：

其论文 Algorithm 1 的流程就是：采样一批任务，对每个任务用 K 个样本做内循环梯度更新，再根据更新后参数的任务 loss 做外循环 meta-update。

更简洁地说：



    
    
    内循环：学习一个任务  
    外循环：学习如何更快学习任务  
    

### 

2.4 为什么 MAML 需要“梯度穿过梯度”？

这是理解 MAML 的技术关键。

MAML 的外循环目标是：

但  本身由  通过一次梯度下降得到：

所以外循环求导时，要算：

这里出现了“对梯度再求导”，因此会涉及二阶导数，也就是 Hessian 相关项。 可以展开成直觉形式：

这里的：

就是 Hessian。 这说明 MAML 的外循环在问一个更深的问题： 

> 如果我现在把θ稍微放在另一个位置，那么未来那一步梯度更新会变得更有用吗？

这就是它和普通 fine-tuning 的本质区别。普通 fine-tuning 只关心这一步怎么走；MAML 关心的是起点应该放在哪里，才能让未来那一步走得最有效。

MAML 的论文也提到，完整 MAML 的 meta-gradient 涉及“gradient through a gradient”，计算上需要额外反向传播来得到 Hessian-vector products；论文还测试了省略二阶项的一阶近似，在 MiniImagenet 上表现接近完整版本，并带来约 33% 的网络计算加速。如果对一阶近似感兴趣，可以看下后续的论文：Reptile: A Scalable Metalearning Algorithm（ICLR 2018）(arXiv)（参数化记忆不一定必须依赖复杂的二阶梯度；只要能让初始参数靠近一族任务的可达区域，就能形成一种低成本的适应性记忆）和 ANIL: Almost No Inner Loop（ICLR 2020）(OpenReview)。

### 

2.5 用经典的正弦函数例子理解

为了更好内化内循环以及 MAML 的精髓，我们举一个例子。

假设，每个任务都是拟合一条正弦曲线。

任务形式大概是：

不同任务有不同的振幅 (A) 和相位 (b)。

训练时，模型看到很多不同振幅、不同相位的正弦函数。测试时，给它一条新的正弦函数，只提供很少几个点，让它快速拟合整条曲线。论文中这个回归任务的振幅在  之间变化，相位在  之间变化，MAML 用少量样本和一步梯度更新进行适应。

如图所示，这是简单回归任务中的少样本适应图片。左图：注意 MAML 能够估计曲线中没有数据点的部分，表明模型已学习到正弦波的周期结构。右图：在同一任务分布上预训练（未使用 MAML）的模型进行微调，并采用调优步长。由于预训练任务中常存在矛盾输出，该模型无法恢复合适的表征，且无法从少量测试样本中进行外推。

这件事为什么重要？

普通预训练可能学到“很多正弦曲线的平均形状”。但测试时给出 5 个点，它未必能稳定推出这条新曲线的振幅和相位。

MAML 训练出的  具有另一种能力：

  * 

    
    
    看到少量点  
    ↓  
    这些点产生梯度  
    ↓  
    梯度快速改变参数  
    ↓  
    模型转向正确的振幅和相位  
    

所以， 里面保存的并不是某一条正弦曲线，而是：

> 正弦函数家族的可适应结构。

肤浅地认为，这是参数化记忆的雏形之一。

### 

2.6 从 Memory 角度重新解释 MAML

我们的大脑似乎开始预热了！

我们可以把 MAML 解释为一个双层记忆系统。

2.6.1 慢记忆：

来自大量历史任务（可能是来自预训练、后训练等）。

它保存的是跨任务共性：



    
    
    这些任务大概属于什么家族；  
    哪些特征对多个任务都有用；  
    参数空间中哪些方向容易被少量样本改写；  
    怎样的起点能避免少样本过拟合；  
    

这是 慢速、长期、参数化记忆。

2.6.2 快记忆：

来自新任务上的少量样本。

它保存的是当前任务信息：



    
    
    这个任务的类别是什么；  
    这条曲线的振幅和相位是什么；  
    这个用户/环境/目标有什么具体差异；  
    当前任务需要沿哪个方向调整。  
    

这是 快速、短期、任务特定记忆。

所以 MAML 的记忆结构可以写成：

长期参数记忆少量任务经验任务特定参数记忆

这和我们之前讲的 Memory 很一致：

> 过去经验被压缩成一个状态；新经验触发这个状态的更新；更新后的状态改变未来行为。

### 

2.7 MAML 的真正思想：学习一个“容易被梯度读取的参数状态”

如果把梯度看成一种读取机制，MAML 就非常有意思。

普通参数可能包含大量知识，但新任务给出的少量样本无法有效调动这些知识。MAML 希望训练出一种参数状态，使得新任务样本产生的梯度可以迅速“读出”过去任务分布中的相关结构。

可以这样理解：



    
    
    θ 里保存历史任务经验  
    新任务样本产生梯度  
    梯度不是单纯修错  
    梯度是在 θ 的结构中定位当前任务  
    θ' 是被当前任务激活后的状态  
    

这就是它对“Memory”的启发：

> Memory 可以不只存在于文本、向量库、规则库里，也可以存在于一个“易被少量经验改写的参数初始化”里。好的参数化记忆，要让少量新证据能够高效改变模型行为。

记忆的质量不只取决于存了多少信息，还取决于未来能否被低成本、低样本、低风险地调用和改写。

### 

2.8 Model-Agnostic（模型无关）？代价是什么？

这里的 “model-agnostic” 不要理解成完全无假设。

它的含义其实更加狭隘：

> 只要模型可以通过梯度下降训练，MAML 就原则上可以套上去。

它不要求模型是 CNN、RNN、Siamese Network、Memory-Augmented Network，也不额外引入专门的 meta-learner 参数。论文强调，MAML 可以直接应用于任何能用梯度下降训练的模型，并且能处理分类、回归、强化学习等不同问题。

但它仍然需要几个条件（敲黑板）：



    
    
    有任务分布 p(T)  
    每个任务有少量训练样本  
    可以定义任务 loss  
    可以对模型参数求梯度  
    训练任务和测试任务存在可迁移结构  
    

所以 “agnostic” 指的是模型架构层面的开放性，不代表它不需要任务结构。

从这个角度来看也能够理解，为什么 LLM 的训练方法不太提到 MAML。

  * 限制一：需要清晰的任务分布




MAML 假设训练任务和测试任务来自相似的任务分布 $ p(\mathcal{T}) 。如果新任务完全偏离历史任务分布， \theta $ 里压缩出的适应结构可能失效。

  * 限制二：计算成本高




完整 MAML 需要对梯度更新过程再反向传播，会引入二阶导数相关计算，虽然论文也因此讨论了一阶近似 MAML。

  * 限制三：对大模型直接全参数 MAML 很难




对 LLM 来说，直接对全部参数做 MAML 成本很高。不过，有一些可以猜测的更加可行的方向是（其中部分内容我们后续也会callback到）：



    
    
    MAML + adapter  
    MAML + LoRA  
    MAML + prefix / soft prompt  
    MAML + tool policy  
    MAML + small personalized module  
    

也就是说，参数化记忆未必写进整个基座模型，可以写进可控的小型参数模块。

  * 限制四：它学习的是“梯度适应”，不等价于完整自进化




MAML 默认内循环是梯度下降。LLM 自迭代还涉及语义评价、工具使用、长期记忆、数据构造、验证回滚、安全约束。MAML 只解决其中一个很核心的问题：

> 如何把历史任务经验压缩成一个适合快速参数更新的状态。

遇到限制，说明是好事：（1）指明方向（2）符合预期。

### 

2.9 MAML 系列阅读推荐

要全部讲透，还是太难了。不想把文章写得又臭又长（已经很长了，不要臭就好）。

关于更多的知识，可以阅读：CAVIA (PMLR) / ANIL——MAML 并不直接证明模型学会了深层快速改写。ANIL 提到一个观点，挺有意思的——许多所谓“快速学习”可能来自高质量特征复用。换句话说，参数化记忆未必总是表现为大规模参数重写，也可能表现为稳定表征加上少量任务特定变量的组合。

再补充一点关于低维适应与可扩展性。LEO（Meta-Learning with Latent Embedding Optimization, 2018）(OpenReview) 讲的是“适应（adaptation）不一定发生在高维参数空间”。LEO 学一个低维 latent embedding，再在低维空间里做梯度适应，最后生成任务参数。它很适合为后面的 LoRA、adapter、soft prompt 等做铺垫。也许未来的参数化记忆，可能就存在于这种低维、可控的子空间里。还有，iMAML（Meta-Learning with Implicit Gradients, 2019）(NeurIPS)，它用隐式梯度降低 MAML 外循环反传内循环路径的内存负担。此外，它还顺带提醒了一件很现实的事：如果 MAML 系列未来真正走向大模型，计算图和内存开销会成为核心瓶颈。

03

LLM时代之前，MAML之后的自适应元学习：

Meta-SGD: Learning to Learn Quickly for Few-Shot Learning

如果 MAML 告诉我们，过去经验可以被压缩成一个适合快速 fine-tune 的参数起点，那么 Meta-SGD（Meta-SGD: Learning to Learn Quickly for Few-Shot Learning，ICML 2017）(arXiv) 进一步说明，过去经验还可以被压缩成一种更新几何。模型需要记住的，不只是“我现在应该站在哪里”，还包括“当新证据出现时，我应该往哪个方向走、走多远”。具体不展开了，讲的故事是：



    
    
    MAML:  
    历史经验 → 压缩成好的 θ  
    Meta-SGD:  
    历史经验 → 压缩成好的 θ + 好的更新方向 + 好的学习率  
    

04

Transformer 参数本身是否就是 Memory？

在 MAML 中，我们看到了一种参数化 Memory 的早期形态：过去任务中的经验可以被压缩进参数，使模型在遇到新任务时更容易被少量样本改写。

但 MAML 讨论的重点是“如何让参数准备好被改写”。到了一个已经训练好的 Transformer，问题换了一种形式：

> Transformer 的参数里，是否已经存在某种可解释的记忆结构？如果存在，它能否被定位、被验证、被改写？

下面沿着三条经典线索往下看：FFN 的知识性、知识神经元，以及知识编辑。它们大致来自过去 3–9 年的研究。

### 

### 

4.1 FFN 为什么像记忆？

Transformer Feed-Forward Layers Are Key-Value Memories (ar5iv) 这篇论文在讨论的核心问题是：Transformer 里占据大量参数的 FFN / MLP 层到底在做什么？

如你所知，在标准 Transformer 中，FFN 层通常由两个线性变换和一个非线性函数构成。忽略 bias，可以写成：

其中：

  * ：当前位置的 hidden state；

  * ：第一层线性矩阵，可以理解为一组 keys；

  * ：每个 key 被激活的程度；

  * ：第二层线性矩阵，可以理解为一组 values； 

  * 输出是多个 value vectors 的加权组合。




FFN 层在形式上接近一个未归一化的 key-value memory。第一层矩阵中的 key 会被特定输入模式激活，第二层矩阵中的 value 会对输出词表分布产生影响。论文还指出，FFN 层大约占典型 Transformer 参数预算的三分之二（但是，目前这个超参数似乎会变了。关于 LLM 训练的超参数如何配比，也有很多论文可以挖掘和分享）。因此，如果想理解参数化知识从何而来，FFN 是绕不开的一站。(ar5iv)

跳过具体的实验，我们直接跳到实验结论：

第一，key 像模式检测器。如果从训练语料中检索最能激活某个 key 的文本片段，可以发现很多 key 对应人类可以识别的模式，例如某些 n-gram、句法片段、语义话题。论文中的人工标注实验显示，几乎每个被抽样的 key 都能找到至少一种可识别模式，65% 到 80% 的 top-trigger prefixes 能被归入某种模式。(ar5iv)

第二，层数越高，模式越语义化。低层 key 更容易对应浅层模式，例如末尾词、局部 n-gram；高层 key 更容易对应语义模式，例如话题或关系性上下文。(ar5iv)

第三，**value 会诱导输出词表分布** 。如果把 value vector 投影到输出 embedding 空间，观察它对词表分布的影响。高层 value 更容易把概率质量集中到 key 所触发模式之后可能出现的 token 上。(ar5iv)

此外，如上图所示，FFN 输出通常由多个 active memory cells 组合形成，单个 memory cell 很少独立决定 layer-level prediction。即，FFN 在一次前向传播中激活一组 memory cells；同时，每层输出来自多个 value 的加权组合。（论文统计了 4,000 个验证集 prefix 在每一层 FFN 中激活了多少 memory cells）

因此，想表达的是：

> Transformer 参数中存在一种“模式 → 输出倾向”的可解释结构。FFN 的第一层更像匹配条件，第二层更像写入到 residual stream 的内容。

但是它也只能说明一些可能存在的结构：



    
    
    1. 说明 FFN 参数具有 memory-like 结构；  
    2. 主要分析了 pattern 与 next-token distribution，还没有直接证明某个具体事实以干净、独立、可任意编辑的形式存在于某个参数槽位中。（我认为可任意编辑是不符合深度学习的思想的）  
    

到这里要踩一下刹车：这项工作给参数化 Memory 提供了一个结构入口，但还没有完成事实定位，更谈不上事实写入。

更多的研究，也可以看看 Engram 论文。(arXiv)

### 

### 

4.2 Knowledge Neurons：事实能否被定位到神经元？

如果前一篇文章说明了 FFN 有 key-value memory 结构，那么 Knowledge Neurons in Pretrained Transformers (ar5iv) 就往前走了一步：某个事实的表达，能否归因到少量具体神经元？

这篇论文研究的是 BERT 上的 fill-in-the-blank cloze task。事实被表示为一个关系三元组，例如：

然后用 prompt 模板让模型预测 tail，例如：



    
    
    The capital of Ireland is [MASK].

作者提出 knowledge attribution 方法（如上图），用 integrated gradients 衡量 FFN 中间神经元对正确答案概率的贡献，再通过多个表达同一事实的 prompt 模板做 refinement，保留那些跨表达共享的神经元。这些神经元被称为 knowledge neurons。关于实验，我想多讲一点，主要是让大家看看这种实验可以怎么做：

第一，作者在 BERT-base-cased 上做实验，并使用 ParaRel 数据集。最终保留 34 个关系，包含 27,738 个 relational facts 和 253,448 个 knowledge-expressing prompts。作者通过阈值控制，使每个 relation/fact 平均得到少量 knowledge neurons。

第二，操纵这些神经元会显著影响模型表达对应事实。论文报告：抑制 knowledge neurons 会让正确答案概率平均下降 29.03%；放大 knowledge neurons 会让正确答案概率平均上升 31.17%。对应 baseline 神经元的影响很小，甚至在放大时平均下降 1.27%。

第三，作者尝试做“知识手术”。他们直接修改 FFN 第二层中对应 neuron 的 value slot，用于更新事实或擦除某类关系。更新事实时，knowledge neurons 的 change rate 为 48.5%，success rate 为 34.4%，随机神经元的 success rate 为 0.0%。关系擦除实验中，被擦除关系的 perplexity 大幅上升，其他关系受到较小影响。

把这些实验放在一起，可以得到一个总结：

> 如果 FFN 是 key-value memory，那么某些事实表达也许可以被追踪到少量被激活的 FFN 中间神经元。

但，还是和前面 FFN 知识性那一节一样，这里必须强调：定位不等于可靠写入。它的实验主要发生在 BERT 的 cloze 任务中，编辑实验也被作者表述为 preliminary case studies。它证明“少量神经元与事实表达有强相关和可干预关系”，但还没有证明这些神经元就是稳定、独立、可规模化编辑的事实存储单元。

### 

### 

4.3 ROME：事实关联能否被直接写入参数？

ROME 的全称是 Rank-One Model Editing ，来自论文 Locating and Editing Factual Associations in GPT ( ar5iv )。它研究 GPT 风格的 autoregressive Transformer，并把事实表示为：

其中  是 subject， 是 relation， 是 object。

ROME 先用 causal tracing 找到事实召回时的关键计算位置。它发现，在 GPT-2 XL 等模型中，事实关联的召回与 中间层 MLP 模块 强相关，关键 token 通常是 subject 的最后一个 token。即，中间层 feed-forward modules 在处理 subject tokens 时，会介导 factual predictions。

ROME 的基本流程可以压缩成三步。



    
    
    Step 1：找 key  
    用包含 subject 的文本，读取 subject 最后一个 token 在目标 MLP 层中的内部表示，得到 subject key。（对照组）  
    Step 2：求 value  
    优化一个 value vector，使它被写入 residual stream 后，模型会预测新的 object，同时尽量保留模型对 subject 的其他理解。（加噪声）  
    Step 3：写参数  
    用一个 rank-one update 修改 MLP 权重，使这个 key 以后能映射到新的 value。（恢复噪声组）  
    

显然，ROME 的写入可以理解成一个受约束的线性代数问题：

同时要求对大量旧 key 的影响尽量小。简化直觉是：找到一个低秩参数改动，让目标 subject key 读出新的 object value，并尽量减少对其他 key 的干扰。论文中 ROME 把 MLP 看作 linear associative memory，并通过 rank-one update 插入新的 key-value association。

ROME 的实验贡献主要体现在两点。

第一，它在 zsRE 编辑任务上取得了很高的 efficacy，并且与 fine-tuning、hypernetwork 类方法相比具有竞争力。论文表格中 ROME 在 GPT-2 XL 上的 efficacy 达到 99.8，paraphrase 为 88.1，specificity 为 24.2，与其他方法相比显示出强单点编辑能力。

第二，ROME 引入 CounterFact 来评估更难的反事实编辑。这个数据集关注三类指标：efficacy、paraphrase generalization、neighborhood specificity。也就是说，编辑后模型要能回答新事实，要能在改写 prompt 下仍然回答新事实，还要避免把邻近但未编辑的事实一起改掉。

回到我们梳理的文章脉络里，ROME 的意义是：

> ROME 把参数化 Memory 的问题推进到“可写入”层面。它不再只问参数里有没有事实关联，而是尝试通过低秩更新，把新的 factual association 写入中间层 MLP。

当然，这里要强调一个关键点：ROME 写入的是特定形式的事实关联，尤其是 subject-relation-object。这是一种非常基础、类似知识图谱结构的表示方式。它不等同于写入完整知识系统，也不保证新事实的所有逻辑后果都会自动传播，更不保证在那些无法用语言描述的 latent space 中顺利完成编辑（edit）。

### 

### 

4.4 MEMIT：从单个事实到批量事实写入

ROME 的问题是单点编辑（尽量减少对于其他 key 的干扰）。MEMIT 的问题是：能否一次性写入大量 factual memories？

MEMIT，全称 Mass-Editing Memory in a Transformer（ar5iv），沿用 ROME 的思想，继续把 MLP 层视为可写入的 associative memory。它的目标是直接更新模型参数，把大量新的事实关联批量写入模型。MEMIT 可以在 GPT-J 6B 和 GPT-NeoX 20B 上扩展到数千条事实关联，规模比此前工作高出多个数量级。(ar5iv)

它的实验思路是：确定要修改的事实集合，然后计算每条事实在模型中对应的表示（representation），并通过优化一个目标函数来更新模型参数，使这些事实能够被正确记忆（memorization），同时尽量减少对其他事实的干扰。稍微展开一下，看看这个优化过程怎么写成数学形式：

ROME 可以写成：

也就是让一个 subject key 映射到一个新的 value。 MEMIT 把这个式子扩展成一批：

其中：

  * ：一批要编辑的 subject keys；

  * ：一批目标 values；

  * ：目标 MLP 的输出投影权重；

  * ：一次写入的事实数量。




如果只关心新事实，直接求一个  让它满足  就行。但这样会严重破坏旧知识，因为原来的  还承载着大量已有 key-value 映射。 所以 MEMIT 实际求的是：

并希望：

等价于：

右侧这个量就是 residual error：旧模型对于这些新 facts 还差多少。

按列堆叠 keys 的写法，MEMIT 的单层更新可以近似写成：

其中：

是来自“保留旧 memories”的最小二乘目标。假设旧 memories 的 key 矩阵是 。这些旧 key 原来会被  映射到 ，所以更新后最好不要在这些方向上改变太多。于是可以把目标写成：

第一项表示新 facts 还差多少没有写进去；第二项表示在旧 key 方向上尽量不要改变原模型行为。对  求导并令梯度为零，会得到 normal equation：

因此：

问题是，真实预训练时的旧 memories 和旧 keys  不可见。MEMIT 的做法是用这一层输入 keys 的经验二阶矩来近似：

并进一步估计为：

这里的  就是论文里说的 uncentered covariance，也可以理解为旧 key 分布的 Gram / second-moment matrix。 用来平衡旧 associations 和新 associations 的权重。这个  项的额外作用是：它让更新在常见激活方向上更保守，从而降低对原行为的破坏。它和正则化项（）不同； 会把所有方向一视同仁地压住，而  是由旧 key 的数据分布估计出来的。旧模型经常激活的 key 方向会受到更强保护，不常见的方向则允许更大更新。

所以，MEMIT 论文把单层 MLP 视为 linear associative memory，并用 normal equation 推导这种 batch update；旧 keys 的统计量通过经验样本估计。

其实，让我再添一小段，是我的灵感：从该实验思路里，我们其实已经可以蒸馏出一些有价值的思考：任何可扩展的 Memory 系统都必须同时处理 memorization 和 preservation。只追求目标记忆写入，很容易破坏邻近事实、生成质量或长期一致性；只追求保守，又无法真正更新知识。MEMIT 的价值在于，它把这个张力写进了一个可计算的目标函数。

MEMIT 与 ROME 的关键区别在于：它把写入分散（distributed）到一组 critical MLP layers 中。论文用 causal mediation analysis（解释一下，这是一种统计学和因果推断方法，用于剖析自变量对因变量的总效应）找到一段参与事实召回的 MLP 层，然后计算希望这些层记住的 vector associations，并把每条 memory 的一部分分布式写入不同层。

更简单地说：



    
    
    ROME：  
    把一个事实写入一个中间 MLP 层。  
    MEMIT：  
    把许多事实批量写入一段关键 MLP 层。  
    

MEMIT 正好也提到了我会比较关心的“参数写入/编辑难度”谱系（后面会有 callback）：

  * Efficacy：目标事实是否成功写入；

  * Generalization：换一种问法是否仍能回答新事实；

  * Specificity：邻近事实是否保持原样；

  * Fluency：生成质量是否受损；

  * Consistency：相关表达是否保持一致。




论文在 CounterFact 上比较 10,000 edits 的结果时，MEMIT 在 GPT-J 上的综合 score 为 85.8，明显高于 ROME 的 50.3 和 MEND 的 23.1；GPT-NeoX 上 MEMIT score 为 82.0。论文同时指出，FT-W 虽然在一些概率指标上表现好，但出现了 generation failure，说明大规模参数写入必须考虑生成质量损伤。

我们还必须知道的是，MEMIT 涉及到的 knowledge representation 范围有限，主要是 directional relations；没有覆盖空间/时间推理、数学知识、语言知识、程序性知识，甚至没有覆盖对称关系。

因此我们无需过早兴奋。

> MEMIT 证明了参数写入可以从单点编辑扩展到批量编辑，但它也清楚暴露了参数化Memory 的边界：当前可写入的主要是结构较清晰的事实关联，距离完整记忆系统还有明显距离。

再帮大家回顾一下，方便从全局视角理解这个系列的工作：

> Transformer 参数中确实存在一些可解释、可干预的事实关联结构，尤其集中在 FFN / MLP 相关模块中；但“能定位”“能干预”“能稳定写入大量可泛化知识”是三个难度递增的问题。

### 

### 

### 

4.5 把记忆写入参数，到底难在哪里？

前面几篇论文都在尝试编辑 Transformer 参数中的 factual associations。但要把这些技术应用在参数化 Memory 里，仍然有很多难点。

因此，这一节来讲讲“限制几何”。这里的“几何”可以理解为：一次参数编辑，本质是在高维参数空间中施加一个小的方向性扰动。这个扰动要同时满足多个约束。

对于一个事实编辑：

理想写入需要同时满足（呼应了我在前面 MEMIT 中写到的）：

ROME / MEMIT 体现出的难点在于：这些目标天然会互相牵制。

#### 4.5.1 Generalization 与 locality 很难同时满足

  * 如果编辑太“窄”，模型只会在原 prompt 上输出新答案，换个问法就失败。

  * 如果编辑太“宽”，邻近事实会被误伤。




ROME 的 CounterFact 设计正是为了测试这个问题：同一个新事实要在 paraphrase prompts 上泛化，同时不能改变 neighborhood prompts 中相似 subject 的旧事实。(ar5iv)

#### 4.5.2 “定位在哪里”与“在哪里写最有效”并不总是一回事

这点非常关键，专门写一小段。

NeurIPS 2023 的 Does Localization Inform Editing? (NeurIPS) 研究了 causal tracing localization 与 model editing performance 的关系。它发现，Causal Tracing 得出的事实位置，与 ROME、MEMIT、Adam fine-tuning 等方法的编辑成功率几乎不相关；很多被定位到其他层的事实，仍然可以通过编辑 ROME / MEMIT 常用的早中层 MLP 层被改写。论文结论强调，localization 回答的是信息在 forward pass 中哪里被携带，editing 回答的是哪里干预最能改变模型行为，这两个问题可能不同。

这个观点挺有价值的。它说明：

> 参数中存在可解释结构，并不意味着我们已经掌握了最优写入位置。

换句话说，“找到记忆”与“可靠改写记忆”之间还有一层编辑动力学问题。

#### 4.5.3 多次编辑会引入干扰和遗忘

大规模写入的另一个难点是连续编辑。2024 年 Model Editing at Scale leads to Gradual and Catastrophic Forgetting 研究了 ROME、MEMIT、MEND 和 fine-tuning 在连续编辑下的表现。论文发现，ROME 和 MEMIT 在规模化编辑时优于 MEND 和 fine-tuning，但新编辑会持续影响模型中其他事实；连续修改还可能导致 gradual forgetting，随后出现 catastrophic forgetting。(arXiv)

另一个 2024 年工作 Can We Continually Edit Language Models? (ACL Anthology) 把这个问题称为 knowledge attenuation：随着 sequential editing 次数增加，模型对已编辑知识的保留能力显著下降。作者把原因归结为 redundant parameter interference 和 update weight disentanglement。

这说明参数写入存在容量和干扰问题。即使每次编辑看起来局部，多次编辑之后，局部扰动会在共享参数空间中累积。

#### 4.5.4 事实编辑不等于完整知识更新

ROME / MEMIT 多数实验围绕 factual triples 展开。它们可以把：



    
    
    Eiffel Tower — located in — Rome

这类新事实写入模型，并测试 paraphrase / neighborhood。

但还有一些更复杂的知识更新，显然不是它们能解决的：



    
    
    时间变化：谁现在担任某职位？  
    多跳推理：A 属于 B，B 属于 C，所以 A 与 C 的关系如何？  
    反事实一致性：改了一个事实，相关事实是否自动更新？  
    程序知识：如何完成一个任务？  
    偏好记忆：某个用户长期喜欢什么风格？  
    安全约束：哪些内容应该被遗忘或拒答？  
    

MEMIT 论文的讨论部分也明确列出其覆盖范围有限，尚未覆盖时间推理、数学知识、语言知识、程序性知识和对称关系等。

#### 4.5.5 参数修改不一定是代价最低的更新方式

有一篇 EMNLP 2023 的论文，叫 Can We Edit Factual Knowledge by In-Context Learning?。简单说，它发现在不更新参数的情况下，in-context knowledge editing 在 GPT-J 6B 上可以达到与梯度编辑方法有竞争力的成功率，同时副作用更少，包括更少的 over-editing 和更少的遗忘。这个结论并不是在否定参数化 Memory 的价值，但它提醒我们：对于很多应用，外部上下文、RAG、adapter、patch memory 可能比直接改主参数更稳定。(ACL Anthology)

总的来说，一句话总结下这个系列的研究：

> Transformer 参数可以承载某种参数化 Memory，尤其是事实关联形式的 Memory；但当前可解释、可写入、可规模化维护的主要还是局部事实关联。完整 Memory 仍需要外部记忆、检索、验证、增量学习和参数编辑共同组成系统。

05

大参数太难，小参数增量作为

“可插拔记忆”的可能性与思路？

既然主模型参数中存在可写入的事实结构，并且直接写入主参数会遇到局部性、干扰和连续编辑问题，那么更现实的工程路线可能是：把 Memory 写入更小、更可控、更可回滚的参数模块。

换成公式：

  * 其中： ：冻结的基座模型参数；

  * ：某个任务 / 用户 / 领域 / 经验簇对应的小参数记忆；

  * ：加载该参数增量后的行为分布。




这和 ROME / MEMIT 的关系是：

  * ROME / MEMIT：直接改主参数 θ。

  * Prefix / LoRA / QLoRA：冻结 θ，把更新写进小参数 φ。




### 

5.1 Prefix-Tuning：把 Memory 写成可学习的连续上下文

论文：Prefix-Tuning: Optimizing Continuous Prompts for Generation，Xiang Lisa Li 与 Percy Liang，ACL-IJCNLP 2021。全量 fine-tuning 需要为每个任务存一份完整模型；Prefix-Tuning 冻结语言模型，只优化一段连续的 task-specific prefix，让后续 token 像 attend 到 virtual tokens 一样 attend 到这段前缀。作者在 GPT-2 表格到文本生成和 BART 摘要任务上验证方法，报告只学习约 0.1% 参数即可在 full-data 场景接近 fine-tuning，在 low-data 和 unseen-topic extrapolation 场景更有优势。(ACL Anthology)

  * 

    
    
    冻结 Transformer 参数 θ  
    为每层准备一组可学习 prefix key/value activations  
    后续 token 的 attention 可以读取这些 prefix activations  
    训练时只更新 prefix 参数 φ  
    

连续前缀没有被限制在真实词表 embedding 上，表达空间更大。直接优化 prefix 参数不稳定，因此使用较小矩阵经过 MLP 重参数化来生成 prefix；训练完成后，重参数化网络可以丢弃，只保存 prefix。

> 模型主体保持不变，经验被压缩成一段可持久保存、可加载、可替换的连续上下文。

Prefix-Tuning 论文自己也点到了 personalization 场景：每个用户可以训练独立 prefix，基座模型共享，从而减少数据交叉污染；多个用户 / 任务的样本甚至可以在一个 batch 中处理。

Prefix 的限制也是明确的，prefix / prompt 类方法存在优化困难、参数量变化下性能非单调，以及占用序列长度的问题：

  1. 它占用 attention 可读位置，长上下文任务里会吃掉上下文预算。

  2. 它主要通过控制激活路径来改变输出，对事实级精确写入不够直接。

  3. 它的优化对初始化、学习率、prefix 长度比较敏感。

  4. 它更像行为引导参数，未必适合作为复杂知识库。




因此，我们差不多可以下定结论：

> Prefix-Tuning 证明了：冻结大模型之后，小型连续参数也可以承载稳定的任务经验；但它的写入位置偏输入侧 / activation 侧，精确性和上下文成本限制了它作为通用参数化 Memory 的能力。

5.2 LoRA：低秩增量作为压缩后的任务记忆

LoRA: Low-Rank Adaptation of Large Language Models，Microsoft，2021。LoRA 的核心动机是：模型越大，全量 fine-tuning 越难部署；以 GPT-3 175B 为例，为每个任务保存一份完整 fine-tuned 模型非常昂贵。LoRA 冻结预训练权重，在 Transformer 的若干线性层中注入可训练低秩矩阵，显著减少训练参数；论文报告相对 GPT-3 175B 的 Adam fine-tuning，LoRA 可将可训练参数减少 10,000 倍，将 GPU memory 需求降低 3 倍，并且在 RoBERTa、DeBERTa、GPT-2、GPT-3 上达到接近或优于 full fine-tuning 的质量。(arXiv)

想必大家也比较熟悉了，对一个线性层：

LoRA 冻结 (W)，只学习一个低秩增量：

其中：

训练时：



    
    
    W 冻结  
    A、B 可训练  
    ΔW = BA  
    推理时可以把 BA merge 回 W  
    

这就是 LoRA 优雅的地方：训练时小参数，部署时可以合并进原线性层，因此没有 adapter 那类额外网络深度带来的 inference latency。当然，这种可插拔式的功能固然优秀，也很难说它是不是限制死了该方法的天花板。

LoRA 的研究 taste 在于，它没有停留在“少训点参数”。它提出了一个结构假设：

> 下游任务适应所需的权重变化 W ，可能具有低 intrinsic rank。

这个假设来自一条很重要的经验观察：预训练模型虽然参数很多，但适配下游任务时可能只需要在低维子空间中移动。LoRA 论文也是受 intrinsic dimension 相关工作的启发，进一步假设 adaptation matrix 也有低 intrinsic rank。

> 如果经验写入所需的变化天然低秩，那么 Memory 不必占用完整参数空间。（但是这个结论还没有被验证，应该吧）

LoRA 的限制还是很多。

第一，LoRA 的 rank 是强约束。低 rank 可能提升泛化和稳定性，也会限制表达容量。小 rank 不一定适合所有任务。

第二，LoRA 的插入位置主要靠经验选择。当前很大程度依赖 heuristic 来选择应用 LoRA 的 weight matrices。

第三，LoRA 本身没有提供 Memory 生命周期管理。它能保存参数增量，但它不负责：



    
    
    何时写入  
    写入哪些经验  
    如何去重  
    如何处理冲突  
    如何忘记  
    如何验证写入是否改善未来行为  
    

### 

5.3 QLoRA：让低秩参数记忆进入大模型规模

QLoRA: Efficient Finetuning of Quantized LLMs，NeurIPS 2023 把冻结基座量化到 4-bit，再把梯度传到 LoRA adapter 中。(arXiv)



    
    
    1. 把基座模型 W 以 4-bit NF4 形式存储。  
    2. 前向 / 反向时，将量化权重 dequantize 到计算数据类型。  
    3. 不更新 W。  
    4. 只训练 LoRA 参数。  
    

公式上仍然是 LoRA：

它降低训练成本，并没有改变 LoRA 的表达形式；效果强依赖数据质量、任务匹配和评价方式。

不过值得一提的是，小参数增量天然适合“多记忆并存”，因为参数化 Memory 经常需要同时维护多个状态：



    
    
    用户 A 的偏好  
    用户 B 的偏好  
    项目 X 的代码风格  
    项目 Y 的领域术语  
    任务 Z 的输出格式  
    某次实验沉淀出的修复策略  
    

全量 fine-tuning 会让这些状态混在一份模型里。PEFT 提供了更清楚的分离方式：



    
    
    θ + φ_user_A  
    θ + φ_user_B  
    θ + φ_project_X  
    θ + φ_domain_Y  
    

总之，LoRA/QLoRA 的意义在于，它给“经验压缩成参数”提供了一个明确形状（提供了一种方法）：

如果一个任务 / 用户 / 领域的适配只需要少数关键方向，那么低秩增量就足以承载这类经验。这个思想和我们文章里说的压缩即智能主题高度一致：



    
    
    经验不是原样存储。  
    经验被压缩成少数可训练方向。  
    这些方向在基座模型的特征空间中放大某些行为倾向。  
    

LoRA 的低秩假设对很多任务有效，但它有任务边界。复杂领域迁移、跨语言迁移、高精度工具使用、长链路推理、持续个性化，可能需要更高 rank、更复杂模块，或者外部 Memory 与参数增量混合。因此：

> 低秩增量适合承载某些稳定的适配方向（比如一些长期的记忆），但是会有损模型的泛化性；当经验本身高度离散、冲突频繁或需要可追溯证据时，外部记忆仍然必要。

06

小参数量还是很难，如果参数不变时，

模型是否仍在“学习”？

前面几章的 Memory 都要动参数：MAML 动初始化、LoRA 动一小撮增量、ROME/MEMIT 直接改 FFN 的某一层权重。到本章，问题变成：如果一个字节的参数都不改，只是往 context 里塞进几个示例，模型的预测就变好了——这算不算"学习"？发生在哪里？

in-context learning（ICL）就是这件事。GPT-3 论文里它是"few-shot"：给几个 (输入, 输出) 示例，模型不更新权重就能做新任务。(NeurIPS) 我将分别从两个角度拆开它：

  * 它在做什么模式？ → induction heads（Olsson et al., 2022）(Transformer Circuits)

  * 它在跑什么算法？ → 隐式梯度下降 / 岭回归（Akyürek et al., 2023 (arXiv)；von Oswald et al., 2023 (PMLR)）




### 

6.1 为什么大模型能 In-context Learning？

来自 Anthropic 的论文 In-context Learning and Induction Heads（Olsson et al., Anthropic, 2022），是 Transformer Circuits Thread 的一篇长文，机制可解释性路线的代表作。核心是一个大胆假设。作者的原话是：

> "we present preliminary and indirect evidence for a tantalizing hypothesis: that induction heads might constitute the mechanism for the actual majority of all in-context learning in large transformer models. 我们为一项引人入胜的假设提供了初步且间接的证据：归纳头可能构成了大型Transformer模型中所有上下文学习的实际主要机制。"

注意用词是 "preliminary and indirect evidence"（初步、间接证据）。整篇文章的证据来自对 34 个 Transformer 训练全程的分析，包含 超过 50,000 次注意力头消融。

#### 6.1.1 Induction Head 是什么

先介绍下 induction head（归纳头）。induction head 是一种注意力头，它实现了一个极简算法：完成 [A][B] … [A] → [B] 这样的序列补全。看到当前 token 是 A，就回头找上一次 A 出现的地方，看它后面跟的是什么（B），然后预测 B。

机制上它需要两个头跨层组合（显然，至少 two layer attention-only 的模型才能支持实验）（注意：这里的 head 指的是 attention head）：

  * 第 1 层：previous-token head（前一个 token 头）。把“前一个 token 的信息”拷贝进入第二个 head 所在的当前位置。如图所示，假设第一次出现的 A 对应的是“node”，那么它就会把“struction”这个信息拷贝下来。

  * 第 2 层：induction head（归纳头本体）。依赖上一步拷贝来的信息，去 attend "上次出现 A 之后的那个 token"再把它 copy 到输出、抬高对应 logit。




因此，我们可以归纳出 induction head 的两个 actions 的定义（在重复的随机 token 序列上测试）：

  * prefix matching（前缀匹配）：这个头会 attend 回那些“其后跟着当前 token”的历史位置。即，确定第一、二个“struction”的位置。

  * copying（复制）：这个头的输出会抬高它 attend 到的那个 token 的 logit。即，把“struction”这个信息复制到第二个“struction”的位置上去。




值得注意，induction head 不是在背 n-gram 统计表。规则 `[A][B]…[A]→[B]` 对任意 A、B 都成立，A 和 B 高度解耦。这意味着它能在分布外工作，也为"抽象版模式匹配"埋下伏笔。我们后续会讲到。

#### 6.1.2 ICL score 怎么定义

机制被定义后，接下来的问题是：我们如何评估模型 in-context learning 的能力、效果？再往下深挖一层，何谓 ICL？ICL 本质是说：模型在 context 里看到一些示例后，能更好地预测后续 token（也就是 induction head 的含义）。这也是 Learning 的含义，那么这里必然存在一个不等关系。想到这一点，那 ICL 的具体评估策略就不难制定了。

在论文中，很简单，他们用一个简单启发式量化 ICL（宏观视角，跟 Kaplan et al. 一脉，看 loss 随 token 位置的下降）(arXiv)。原文定义逐字为：

> "In-context learning score: the loss of the 500th token in the context minus the average loss of the 50th token in the context, averaged over dataset examples."

即 ICL score = loss(第 500 个 token) − loss(第 50 个 token)（注意方向，通常是负值，绝对值越大说明越靠后的 token 预测得越好）。符合我们的直觉：模型如果真的在用（真的学习了） context 的话，那么应该是——越靠后 loss 越低。其中，500 选在长度 512 的 context 末尾，50 选在"文本基本属性已确立、但仍靠前"的位置。

我们只需要记住，ICL score 表达的是 in-context learning 的强度，越负说明模型越会用 context。

#### 6.1.3 phase change（相变）——本文引擎

现在，我们有了计算 loss 的方式，也有了衡量 ICL 的指标。接下来，我们可以做洞察实验了。通过查找训练 checkpoints 的表现，发现训练早期有一个突变窗口：

  * 窗口大约在 2.5×10⁹ 到 5×10⁹ token（对大模型约是训练的 1–2%）。

  * ICL score 对应的 loss 差从相变前的 < 0.15 nats 跳到相变后的 ≈ 0.4 nats，然后整个后续训练里基本恒定，且跨模型尺寸恒定（从 2 层玩具模型到 13B 大模型都一样）。

  * 训练 loss 曲线上出现可见的 "bump"（induction bump）：多层模型的轨迹在这里明显偏离 1 层模型。

  * 同时，induction heads 在这个窗口里形成。

  * 例外：1 层模型定义上做不出 induction head，也就永远不发生相变、几乎没有 ICL。




一个有意思的推论（作者列为 "unexplained curiosity"）：ICL 像是"有或没有"的开关技能，不是可以持续打磨的。相变之后 ICL score 不再涨，大模型相对小模型的优势全在"预测靠前 token"上，而不是"更会用 context"。

还有下面这些结论：

我还很好奇，如果我提出了一种 induction head 的变体，比如 coding induction head，那，这些结论依旧成立吗？不得而知。

此外，作者也做了更多的实验，得出了下面的结论：




> 1.小型 attention-only 模型：induction heads 贡献了 ICL 的大部分，有强因果证据（消融 + 机制逆向工程）。
> 
> 2.带 MLP 的大模型：只能给中等强度的相关证据，可能有混淆因素。

#### 在小模型上高度相关（因果 + 机制），在大模型上只是强相关（correlational），模型尺寸越大，相关性越弱。

#### 6.1.4 per-token loss analysis

平时说的 loss 是一个数，对一大堆 token 的负对数似然取了平均。平均会抹掉信息——你只知道整体变好，不知道是哪些 token 变好。平均磨平了很多局部特征。

Olsson 的做法：固定一批探针 token（论文用了一万个，来自固定文本）。训练过程中每隔一段存一个 checkpoint，对这一万个 token 逐个算 loss，拼成一个一万维向量：

checkpoint t 的状态：

第个快照下，第个的

训练全程 = 这个向量随 t 移动，在一万维空间里画出一条曲线，每个点是一个 checkpoint。

然后用 PCA 降维，把这一万个维度的向量投到二维平面，看训练轨迹的形状（横轴是 checkpoint 的编号）。因此，相变在这个空间里表现为轨迹的突然转向。

轨迹转向说明"学的东西变了"。于是取相变窗口前后两个快照，对一段真实文本逐 token 算 Δloss = loss(后) − loss(前)，按 Δ 给每个 token 上色。

经典的例子是《哈利·波特》的开头："The Dursleys" 重复出现符合 `[A][B]…[A]→[B]`，相变后这段 loss 骤降；而 "Mrs. Dursley…Mrs. Potter" 违反该模式，这意味着 loss 不变——说明就是 induction head 在压 loss。



    
    
    case 1（符合 induction 模式）：  
      前文出现过 "Mrs. Dursley"  
      后文再次出现 "Mrs." → 下一个真实 token 是 "Dursley"  
      匹配 [A][B] … [A] → [B]，A = "Mrs."，B = "Dursley"  
      → 相变后这个 "Dursley" 的 loss 大幅下降  
    case 2（违反 induction 模式）：  
      前文出现过 "Mrs. Dursley"  
      后文出现 "Mrs." → 下一个真实 token 却是 "Potter"  
      induction 会押 "Dursley"，押错  
      → 相变前后这个 "Potter" 的 loss 基本不动  
    

相变期间的收益，精确集中在"induction 规则能猜对"的 token 上；规则会猜错的位置没有任何改进。这就把宏观的 ICL 跳变和 induction 这个具体机制对上了号——改进的分布形状，和该机制预测的形状吻合。当然这仍属相关证据，只是定位精度很高。

#### 6.1.5 抽象模式匹配：不仅仅只是 [A][B] … [A] → [B]

作者提出，模型足够大、表示足够抽象时，同一批 induction head 会从"精确 token 复制"升级成 `[A*][B*]…[A]→[B]`，其中 A_≈A、B_≈B 在某个嵌入空间里相近，我理解是表征空间（也就是 latent representation space）。举例：A 和 A* 是同一个词的不同语言，于是这个头能逐词翻译。这是"fuzzy / nearest-neighbor 版模式补全"，也是从 induction head 通向"一般 ICL"的桥。

机制上还是那套两跳电路（previous-token head 搬信息 + 第二层做匹配复制），不同之处在于：QK 回路的匹配从 token 身份变成表示相似，OV 回路的复制从恒等变成一个非平凡映射。两处的几何性质都来自预训练。

举例示意（词对齐做了简化）：



    
    
    context: … le chat … the ?  
      A  = the（当前 token）  
      A* = le  （表示空间里 the ≈ le，同一功能词的两种语言形式）  
      B* = chat（A* 的下一个词）  
      B  = cat （输出端 cat ≈ chat）  
    → 该头在 "the" 处 attend 到 "chat"，经 OV 映射抬高 "cat" 的 logit  
    

同一个电路（circuit，不是电路的意思）骨架，靠嵌入几何就能做逐词翻译这种表面上完全不同的活，也就是机器翻译。这就是 attention 的强大之处：它能把表示空间的几何性质映射到输出空间的几何性质。

现在，我们回过头来就能理解 为什么说它是通向一般 ICL 的路 。因为 few-shot prompt 的结构就是：

套上抽象版归纳模式匹配，这就是我们在这篇论文里看到的东西：



    
    
    匹配：在表示空间里找与 xq 最像的 xi  
    取值：attend 到对应的 yi  
    复制：输出与 yi 同类的答案  
    

这等于在 context 内部做了一次 soft nearest-neighbor：attention 的 softmax 权重天然给出对多个邻居的软加权，比严格 1-NN 更接近核回归。相似度度量存在权重里（预训练学的），训练样本存在 context 里（当场给的）。

我们从实验上，系统地解释了：为什么我们输入一段 Prompt 进去，模型就能在 context 里"学习"到一个新东西（在不调参的情况下）。

### 

6.3 ICL 是一种怎样的学习算法？

#### 6.3.1 ICL 蕴含线性优化算法

Transformer 做 ICL 时，内部隐式跑的是哪个已知学习算法？ 我们不妨假设（What learning algorithm is in-context learning?（Akyürek et al., ICLR 2023，高引论文来自 MIT、Google Search、Stanford））：

> in-context learner 在激活里编码了一个更小的模型，随着 context 里示例的到来，在前向传播中"训练"这个隐式模型。

前向传播可以看成一种直线程序：无循环、无分支，指令按顺序执行。这套思路和 RASP 一脉相承，即把 Transformer 形式化为可编程模型。( PMLR ) 沿着这个思路，原则上可以用线性方程来表达直线程序（不懂可以问 AI），再用线性回归作为探针问题来验证命题。因此，ICL 算法学习的问题可以被转化为线性回归问题：函数类是 ，其中 ，损失是平方误差。序列排成：

预测

编码上把  和  拼成  维向量 ，。正则线性回归的闭式解是大家熟的 w^* = (X^\top X + \lambda I)^{-1} X^\top y ， 是 OLS， 是岭回归（可赋予贝叶斯解释）。

  * Transformer 能实现哪些算法呢？先从"能不能"（表达能力，构造性上界）开始构造： 构造靠四个可用单层 Transformer 实现的基本算子：mov（列间搬运）、mul（列内矩阵乘）、div（除以某标量）、aff（仿射变换）。举个例子，mov 可以用 attention 机制来实现；mul 可以用位置内做乘法（内积、矩阵向量积、外积）来实现；div 可以用位置内除以某坐标里存的标量来实现等。

  * GD 的更新写成 ，用上面这四个基础算子拼出来。所以 GD 也可以构造出来。

  * 岭回归也能构造出来，闭式解是 ，用上面四个基础算子拼出来。




得到阶段性结论：

  * 一步梯度下降：对 d 维回归，用 O(d) 的 hidden size + 常数层数，Transformer 可实现一步 GD（具体的构造细节可以看论文）。

  * 岭回归闭式更新：用 O(d²) 的 hidden size + 常数层数，可实现"把一个新观测并入岭回归解"的更新（具体的构造细节可以看论文）。

  * n 步算法 → 大致 n 倍的层数。




它证明了该问题的存在的可能性：Transformer 的前向传播可以实现已知的学习算法（GD、岭回归、OLS），并且可以在 context 里"训练"一个隐式模型。

> 这是存在性证明——"能实现"不等于"训练后真的学到了这个"。这一点后来 von Oswald 专门补刀（见 6.3.5）。

#### 6.3.4 行为对比：训练出来的模型到底像谁

作者构造了"学习规则欠定"的回归问题（不同合法学习规则会在留出数据上给不同预测），然后比 trained transformer 的预测跟 GD、岭回归、精确最小二乘、贝叶斯估计器谁最接近。核心结论是随深度和噪声发生"算法相变"：

在无噪线性回归下，ICL 与 OLS 的吻合度显著高于 kNN、GD、SGD 等——说明存在指向 OLS 式解的特定 inductive bias，不是泛泛地逼近"某个学习算法"。

#### 6.3.5 probing：能不能从隐藏态里解码出中间量

6.3.4 的行为对比只到输入输出为止——但是，两套内部机制完全不同的系统，也可能给出一样的预测，内部过程却无从窥视。想再进一步，得打开模型看内部：假如 Transformer 真在前向传播里跑 GD / 岭回归，这些算法沿途会算出一批中间量——权重估计 ，以及矩统计量（，例如 X^\top X 、）。它们要是真出现在隐藏态里，证据就强了一截。probing 干的就是这件事。

探针的操作流程：冻结训练好的 Transformer（参数不再动），取第  层的隐藏态 ，在外面单独训练一个小读出模型 g （叫探针，），任务是 g(h_\ell) \to z ，从隐藏态预测目标量 z 。 预测得准，就称"第  层的隐藏态编码了 "。 

探针分两档，对应两种"编码"的说法： 

线性探针 ：。它读得出 →  被"线性编码"；

MLP 探针 ： 是个两层小网络。线性探针读不出、MLP 探针读得出 →  被"非线性编码"。 

Akyürek 的 probing 给出两条结果，各自回答一个独立的问题。 

第一条，信息出现在第几层。 和这些矩统计量要到 后段层 （late layers）才解码得出来，前段层读不出。放回 6.3.1 的直线程序视角看，顺理成章：中间量按程序执行顺序逐层出现， 是程序后半段的产物，前几层还没算到那一步，信息压根不在隐藏态里，换多强的探针都没用。

第二条，需要多强的探针。 线性探针精度差很多，MLP 探针才读得出。按上面的术语，这些量在隐藏态里属于"非线性编码"。

> 容易误解的点："非线性编码"的"非线性"，描述的是信息在隐藏态里的存放格式和读出方式。它对 Transformer 各层的计算过程没有任何断言——Transformer 每一层本来就含非线性计算（softmax、GeLU、LayerNorm），前后段在这点上没有区别。第一条结果比的是信息"有没有"，第二条比的是"以什么格式存放"。

两条结果合起来，把证据从"行为像某算法"往"内部真在算这个算法的中间量"推了一步。但这一步的分量要打折扣，折扣来自探针本身：探针越强，不可解释性越强，证据越弱。MLP 探针自带算力，于是留下另一种解释——隐藏态里放的只是原始素材（、 的某种表示）， 是探针拿到素材后当场自己算出来的，模型内部未必显式表示过它。证据强度排序大致是：



    
    
    线性探针成功 > MLP 探针成功 > 仅行为匹配

Akyürek 落在中档，这也是作者把 probing 部分标为 preliminary 的原因。

一句话收束 Akyürek 全篇：至少在线性情形，ICL 可以用算法语言理解，Transformer 可能是从纯序列建模里"重新发现"了标准估计算法；具体跑的是哪个，看深度、宽度和数据噪声。

### 

6.4 基于梯度下降的 ICL

Akyürek 证了"能实现 GD"，但没证明"优化真的会找到这个解"。von Oswald (Transformers learn in-context by gradient descent（von Oswald et al., ICML 2023）)把构造做到极简，并证明训练真的会收敛到它。命题如下：

> 一层 linear self-attention（LSA，去掉 softmax）的前向更新，可以精确等价于对 in-context 样本做一步梯度下降。

LSA 层去掉 softmax 后的更新是：

ᵀ

回归损失 ，即，一步 GD： 换一个视角来看，一步 GD 既可以看成"改权重"，也可以看成"改数据"——GD 后的损失等价于把目标  更新成 ，其中 。也就是说， 不显式算出 ΔW，而是让每个 token 的 y 分量被就地更新一步 。 

具体权重构造 token 排成 ，分块矩阵形式：



    
    
    W_K = W_Q = [[I_x, 0],  
                 [0,   0]]      # 只在 x-块放单位阵：负责用 x_i、x_j 做点积  
    W_V       = [[0,   0],  
                 [W_0, −I_y]]   # 底行算出 (W_0 x_i − y_i)，即残差  
    P         = (η/N) · I        # 学习率 η 通过整体缩放进入  
    

代进去，逐 token 的更新恰好是：

即只有  分量变，变的量正好是一步 GD 引起的 。查询 token 也遵循同样动力学：把  的  分量初始化成 ，更新后乘 −1 就读出预测 。 单个 attention head 就够，同时更新训练目标和测试预测。

注解： 

  * 非唯一性 ：只需乘积  和  匹配构造即可；任意标量缩放 （ 与 ）给等价结果——所以对比训练权重和构造权重时要先做标量校正。

  * 学习率是被 meta-learn 的 ：跨一族任务训练时， 会被隐式学到，使得固定步数下平均 loss 下降最优。




6.4.1 训练真的收敛到这个构造吗

定义完 ICL 的 token 更新策略后，不禁要问：训练真的会收敛到这个构造吗？会。

  * 在线性回归数据上训练 LSA-only Transformer，训练出来的权重乘积（做完标量校正后）与手工构造几乎完全重合（论文 Fig. 9 的权重可视化）。

  * 三个对齐度量：预测差的 L2 范数、模型敏感度  的余弦相似度、敏感度差的 L2。单层 LSA vs 一步 GD 的余弦相似度升到约 1.00；GD、训练后的 TF、以及两者插值权重 θθθ 达到相同的 loss（该合成设定下"目标 GD loss"约 0.2）。

  * 分布内、分布外验证任务上都对齐。




6.4.2 多层 = 多步 GD，以及 GD++

  * K 层 ≈ K 步 GD：堆叠 K 层，读出变成 ，对应 K 步梯度下降的轨迹。

  * GD++（改进版）：深层 / 循环 LSA Transformer 会超过朴素 GD，靠一个额外的**曲率修正（curvature correction）** 项。构造上  的左上块从 0 变成 ， 的 x-块加了 γ，于是更新变成：




y 分量照做 GD，x 分量额外乘一个 (γ)——相当于对数据做预条件（preconditioning），改善损失 Hessian  的条件数，加速收敛。作者从训练好的循环 2 层 Transformer 里反解出的 γ 值（如  时约 0.099）跟解析最优值吻合。这一步的"为什么有效"作者标注为启发式解释（Neumann 级数逼近 ⁻¹）。

#### 6.4.3 与 Akyürek 的关系与区别

作者明确说这是并行工作：

> Akyürek 用一串 Transformer 层（含 MLP）构造一步"带权重衰减的 GD"；但没证明优化会找到与其构造一致的权重。von Oswald 的构造更简单（一层 LSA 就够），且证明了训练确实会收敛到该构造（Proposition 1 的经验部分），还能顺带解释 Olsson 研究的浅层两层 Transformer。

一句话：Akyürek 偏"能实现哪些算法 + 行为像谁 + probe 中间量"，von Oswald 偏"最简构造 + 训练真收敛到它 + 多层=多步 GD + 超越 GD 的 GD++"。

#### 6.4.4 softmax vs linear，以及适用范围 / 局限

  * 等价性只在 linear attention 上精确成立。真实 LLM 用的是 softmax attention，去掉 softmax 是本文"唯一但关键"的偏离。

  * 有意思的是，作者做双层 SA 复现 induction 时，第一层必须保留 softmax才训得动：softmax 层学到 copying，把相邻的输入/输出 token 合并成 Proposition 1 需要的 (x, y) 拼接 token，第二层再做 GD。作者由此把 induction head 解释成"GD 式 ICL 的一个特例 / 前置步骤"——copying 是使能机制，下游才是 GD。

  * 作者自己非常克制："我们预期在 linear self-attention-only Transformer 上的发现只能解释复杂过程的一小部分，它可能只是产生 ICL 的众多机制之一。"

  * 任务局限：只在线性回归（及深表示上的非线性回归）这种合成任务上，不是自然语言。




### 

6.5 三篇的脉络，两条路线

参数不变时模型如何学习？



    
    
    机制可解释性路线（Olsson）  
      ─ 看电路：ICL 靠 induction heads 做 [A][B]…[A]→[B] 的匹配+复制  
      ─ 大模型里升级成 fuzzy / nearest-neighbor 版模式补全  
      ─ 强项：真实 LM、真实训练、相变现象；弱项：大模型只有相关证据  
      
      
    隐式优化算法路线（Akyürek / von Oswald）  
      ─ 看算法：ICL 在前向传播里隐式跑 GD / 岭回归 / OLS / 贝叶斯  
      ─ von Oswald：一层 LSA = 一步 GD，K 层 = K 步 GD，训练真收敛到构造  
      ─ Akyürek：深度/噪声决定像哪个算法，隐藏态能 probe 出 w 和 moment matrix  
      ─ 强项：数学精确、可验证；弱项：合成任务 + linear attention  
      
      
    交汇点：von Oswald 用 copying(softmax) + GD(linear) 把两条路线接上  
      → induction head 是"GD 式 ICL"的一个特例  
    

两条路线不冲突，是同一现象的不同分辨率：一个说"在 token 空间做模式补全"，一个说"在激活空间跑优化算法"。共同结论：参数冻结 ≠ 不学习。学习被搬到了前向传播的激活空间。

### 

6.6 后续工作与争议

#### 6.6.1 Dai et al.（2022/2023）：GPT 的 ICL ≈ 隐式 finetuning

"Why Can GPT Learn In-Context? Language Models Implicitly Perform Gradient Descent as Meta-Optimizers" (ACL Anthology)。借 Irie et al. (2022) (PMLR) / Aizerman et al. (1964) (MathNet) 的"线性层 GD 与 linear attention 的对偶形式"，把 attention 写成

其中  = 初始（zero-shot）参数， = 示例产生的"meta-gradient"更新

主张：GPT 先根据示例产生 meta-gradient，再通过 attention 作用回模型，等价于一次隐式 finetuning。并在真实任务上比较 ICL 与显式 finetuning，说两者在预测、表示、attention 行为多个层面相似。还据此设计了 momentum-based attention 佐证。

> 注意区别：von Oswald / Akyürek 的 GD 是对 in-context 数据里一个小回归模型做的；Dai 的 GD 是对Transformer 自身做的。二者不是一回事，别混。

6.6.2 批评与反驳

此外，ICL 这个方向也有被质疑得很凶，大家可以客观地看待：

  * Shen, Mishra, Khashabi（arXiv:2310.08540，后收 ICML 2024）"Do pretrained Transformers Really Learn In-context by Gradient Descent?" (PMLR)：直指前述工作的实验设定离真实差太远——(1) 它们用"ICL objective"专门训练模型做 ICL，而真实 LLM 的 ICL 是自然涌现的；(2) 手工构造的权重性质（如稀疏性）跟真实 LLM 对不上。他们在 在自然数据上预训练的 LLaMA-7B 上测，发现 ICL 与 GD 对示例顺序的敏感度不同（ICL 对顺序很敏感，full-batch GD 不敏感），且两者改动输出分布的方式不一致。摘要结论逐字为："the equivalence between ICL and GD remains an open hypothesis and calls for further studies."

  * 有工作（Transformers Learn to Achieve Second-Order Convergence Rates for In-Context Linear Regression, Fu et al.）(NeurIPS) 说 Transformer 学的是高阶优化（接近牛顿法），不是一阶 GD。

  * Alignment Forum 帖 "No convincing evidence for gradient descent in activation space" (Alignment Forum) 对 Dai 的复核直言：finetuning 与 ICL 的 attention map 余弦相似度最高才 0.687，远不到 1——原话是 "If two linear models implement the same algorithm, they should have cosine similarity 1! The highest we see here is 0.687... whatever the 'meta-gradients' are, they're definitely not the same gradients produced by one-step fine-tuning."

  * 另一面也有理论撑腰：One Step of Gradient Descent is Provably the Optimal In-Context Learner with One Layer of Linear Self-Attention, Mahankali et al.（2023）(OpenReview) 证明单层 linear self-attention 下一步 GD 就是可证最优的 ICL 学习器；Transformers learn to implement preconditioned gradient descent for in-context learning, Ahn et al.（2023）(NeurIPS) 把它推广到预条件 GD。




我们持中间立场："Transformer 有能力实现 GD"是被证明的（表达能力）；"合成任务上训练确实收敛到 GD"在 linear attention 下有强证据；但"真实 LLM 的自然涌现 ICL 就是 GD"仍未坐实，且有反例（顺序敏感等）。

#### 6.6.3 function classes 的 ICL 研究

"What Can Transformers Learn In-Context? A Case Study of Simple Function Classes"（NeurIPS 2022，arXiv:2208.01066）(NeurIPS)，是这条合成任务线的开山之作，我们之前提到的 Akyürek / von Oswald 都建在它上面。

  * 首次系统提出"训练 Transformer 从  序列 in-context 学一个函数类"的框架，问的是 learn what （能学什么），Akyürek 接着问 learn how （怎么学）。
  * 结论：标准 Transformer 能从头训练到 in-context 学线性函数，性能媲美最优最小二乘估计器；稀疏线性函数上超过最小二乘、接近 Lasso；两层神经网络能学；决策树上，原文的说法是 "the trained model can learn unseen trees with as few as 100 in-context examples, whereas greedy learning and tree boosting algorithms are unable to achieve competitive performance"（仅需约 100 个 in-context 示例就学到未见过的树，而贪心学习和树提升做不到相当性能）。

  * 意义：把 ICL 从"自然语言里说不清"搬到"合成、可控、有已知最优解"的实验台，才让后面的"跑什么算法"研究成为可能。




### 6.7 call back一下"参数化 Memory"主题

纵观全局上下文，这一章（section 6）在整本书里的位置，是从"改参数的 Memory"过渡到"不改参数也能学"的枢纽。前面已经有过若干次 callback，这样文章看起来逻辑更顺一点：

  1. ICL = 激活空间里的隐式参数更新。von Oswald 的构造最直白：attention 的输出等价于一个隐式权重 Δw 作用在 query 上。换句话说，context 里的示例被前向传播"编译"成了一份临时权重增量 Δw，只存在于这一次前向的激活里，算完就丢。这正好把前文"Memory 是外部 optimizer state"的观点补完：ICL 里，那份 optimizer state（隐式的 w、Δw、moment matrix）是被 Akyürek 从隐藏态里 probe 出来的中间量，它就是一份不落盘的参数化 Memory。

  2. ICL 是不写参数的"快学习"，对应 MAML 的内循环。von Oswald 自己就用了 meta-learning 的双时间尺度框架：慢权重（训练学到的 Transformer 参数）= 慢变的 meta-parameters，快适应（context 里一步步的隐式 GD）= 内循环。对照第 1 章：MAML 的内循环显式对参数做几步 GD，ICL 的"内循环"把同样的 GD 塞进前向传播、作用在激活上。同一个 bi-level 结构，一个把内循环写进权重，一个把内循环留在激活。

  3. 对设计 Memory 系统的启发（第 9 章 test-time learning 的伏笔）。既然前向传播能隐式跑优化，那"要不要真的显式在 test 时做几步梯度更新"就成了一个设计选择而非必须。这条线直接长出了 test-time training（TTT）一类工作——把隐藏状态当成一个可在推理时用 GD 更新的小模型（fast weight / 线性注意力的 recurrent 形式，本质是 Schlag et al. "linear transformers 是 fast weight programmer" 的延续）(PMLR)。ICL 的容量被 context 长度卡死；显式 test-time 更新则把"学习"重新写回一份可持续累积的参数化状态里。第 9 章会展开：ICL 告诉我们"前向即学习"是可能的，test-time learning 则问"要不要把这份学习固化下来"。




> 参数不变时，模型确实在学习——学习发生在激活空间，机制上看是 induction heads 的模式补全，算法上看是隐式的梯度下降 / 回归求解。这既是一种天然的、不落盘的参数化 Memory，也是通往 test-time learning 的直接跳板。争议仍在（真实 LLM 是否真跑 GD 尚未定论），写的时候别把"ICL=GD"当定理。

07

如何设计 Memory 压缩机制？

一些思路介绍

Prefix-Tuning 的做法是冻结语言模型参数，只优化一段连续 task-specific vectors；LoRA 的做法是冻结预训练权重，在 Transformer 层中注入可训练的低秩矩阵。然后，我们也讨论了固定参数下，和记忆相关的，上下文学习等话题。

这就自然引出下一步：如果 Memory 可以是一段连续 prompt，可以是一组低秩增量，那么上下文本身是否也能被压缩成一段模型可读的状态？

也就引出了下面的问题：如果压缩即智能，那 Memory 作为 Compressor 时，到底要把历史上下文压缩成什么形态，谁来读这个压缩结果，压缩目标如何定义，压缩损失如何训练。

### 

7.1 “Memory = Compressor” 的统一问题

> Memory 的第一性问题是“压缩成什么状态后，模型仍然能读懂并使用（读写一体）”。

整体来说，可以简单地用这个公式概括：

其中：

根据公式，容易提出这四个问题：



    
    
    1. m 是什么？  
       离散文本、gist token、summary vector、memory slot、KV cache、hidden state？  
      
      
    2. Cφ 是否和当前任务 q 相关？  
       task-agnostic compression 可以预计算；  
       query-aware compression 更精准，但复用性差。  
      
      
    3. 训练目标是什么？  
       重构原文、预测后续 token、完成任务、保留关键信息、压缩成本？  
      
      
    4. pθ 是否需要训练？  
       黑盒 LLM 只能读离散文本；  
       白盒1 / 可训练 LLM 可以读 soft vector 或 memory slot。  
    

于是，我准备挑几篇论文来帮助梳理一下：

### 7.2 Compressive Transformer：早期显式上下文压缩记忆

Compressive Transformer 是早期非常典型的显式记忆压缩工作。(ar5iv) 它继承 Transformer-XL (ACL Anthology) 的思路：模型保留过去 segment 的 hidden activations 作为 memory。但 Transformer-XL 的 memory 满了以后，会直接丢弃最旧的 hidden states。Compressive Transformer 的改动是：把最旧 memories 先压缩，再放入 secondary FIFO compressed memory。这样模型能用相同 attention 成本覆盖更长的时间范围。

它的核心流程可以写为（上图从右往左看）：



    
    
    当前 segment hidden states  
    ↓  
    短期 memory 保存最近 hidden states  
    ↓  
    最旧 memory 被压缩  
    ↓  
    compressed memory 保存更远历史  
    ↓  
    attention 同时读取 memory + compressed memory  
    

Compressive Transformer 在 WikiText-103 和 Enwik8 上达到当时 SOTA，分别取得 17.1 perplexity 和 0.97 bpc；此外，它也可以用于高频语音建模和 RL 中的 object matching task。

Compressive Transformer 里有一个很有品味的设计：它尝试了不同压缩函数和辅助损失。

压缩函数包括：



    
    
    mean / max pooling  
    1D convolution  
    dilated convolution  
    most-used memory selection  
    

辅助损失包括：



    
    
    auto-encoding loss：  
      从 compressed memory 重构原始 memory，偏向保留全部信息。  
      
      
    attention-reconstruction loss：  
      让 compressed memory 复现原 memory 在 attention 中产生的效果，偏向保留未来会被注意到的信息。  
    

其中，auto-encoding loss 试图保留所有信息；attention-reconstruction loss 是 lossy objective，因为不再被 attention 使用的信息可以被丢弃，并且作者发现 attention-reconstruction loss 效果最好。

因此，我认为做记忆很重要的一条结论出现了，并且我认为它可以作为所有上下文压缩工作的共同原则：

> 好的 Memory 压缩目标，未必是完整重构过去；更重要的是保留未来读取机制真正会用到的信息。 总之，先不要急着发明复杂 Memory 系统，先问：哪些过去信息真的会被未来 attention 使用？

提一嘴，之前在做 AI auto research 时，Agent（Opus-4.6）也曾经意识到了这个 issue，当时提出了“预取”的一种算法。我认为，这样的结论得到了交叉验证，且它被说明是一个很有价值的科研品味。

Compressive Transformer 的思想很清楚，但它和现代 LLM 工程还是有不短距离的：



    
    
    1. 它要求改模型架构；  
    2. 它需要在训练阶段加入 compressed memory 机制；  
    3. 它压缩的是 hidden states，不是用户可审计的文本；  
    4. 它更接近长程语言建模架构研究，还没有进入今天这种 instruction-following / RAG / agent memory 的工作流。  
    

所以我把这篇论文放在最前面，希望读者明白的是：它提供“显式上下文压缩记忆”的早期形式，技术路线比较朴素，但问题意识很准。

### 7.3 Gist Tokens：把 prompt 压缩成模型可读的软状态

Gist Tokens (arXiv) 研究的是 prompt compression。这些 prompt 占 context window，也增加 prefill 计算。Gist Tokens 的目标是：训练模型把 prompt 压缩进少量 gist tokens 的 hidden activations，使后续 input / output 读取 gist tokens 即可。

它的关键技巧非常简洁：



    
    
    prompt  
    <GIST> <GIST> ...  
    input  
    output  
    

训练时修改 attention mask：



    
    
    input 和 output 不能 attend 到 prompt  
    input 和 output 可以 attend 到 gist tokens  
    gist tokens 可以 attend 到 prompt  
    

这样模型要完成任务，就必须把 prompt 信息压缩进 gist token activations。论文指出（所谓的指出），这个方法只需要修改 Transformer attention masks，就能在 instruction finetuning 时同时学习 instruction following 和 prompt compression，基本不增加额外训练成本。

这种方式是优雅且朴素的（有没有效另说），原因在于它没有设计复杂模块。它只改 attention mask，强制模型通过 gist tokens 传递信息。

在 LLaMA-7B 和 FLAN-T5-XXL 上实验里，Gist Tokens 可以达到最高 26x prompt compression，同时维持接近原模型的输出质量；在效率上，最多 40% FLOPs reduction 和 4.2% latency speedup。

更重要的是，论文讨论里指出，Gist models 可以压缩 unseen OOD prompts 到 26x，并启用新的 prompt caching 方式；但它的压缩会损失原始 instruction 的一些细微差别，在 edge cases 上需要仔细评估。

Gist Tokens 这一步尝试把 Memory 从“参数里的固定增量”推进到“运行时可生成的压缩状态”。

当然，它的限制也很显然：



    
    
    1. gist tokens 对人不透明；  
    2. 主要适合压缩 instruction / prompt；  
    3. 原模型需要经过 gisting 训练；  
    4. 细粒度约束可能在高压缩率下丢失；  
    5. 对黑盒 API 模型不友好。  
    

所以，我更愿意把它称为一种“软压缩状态”。

### 

7.5 AutoCompressors：把长上下文递归压缩成 summary vectors

AutoCompressors 研究的问题更接近长期上下文(arXiv，推特讨论不多)：



    
    
    一个长文档太长  
    ↓  
    切成多个 segments  
    ↓  
    每个 segment 被压缩成 summary vectors  
    ↓  
    summary vectors 作为 soft prompts 传给后续 segments  
    ↓  
    模型继续做语言建模或下游任务  
    

提出把预训练 LM 适配成 AutoCompressor，使它能把长上下文压缩成 compact summary vectors；这些 summary vectors 会作为 soft prompts 被模型读取。训练目标是无监督的：长文档分段处理，前面 segments 的 summary vectors 用于后续语言建模。作者在 OPT 和 Llama-2 上 fine-tune，序列长度最高到 30,720 tokens，并展示 AutoCompressors 可以在长文档 perplexity、in-context learning demonstration compression、retrieval-augmented LM 和 passage re-ranking 中使用。

AutoCompressors 学到两种能力，一是把上下文信息压缩成少量 summary vectors，二是让模型能够 reasoning over 这些 vectors；这些 vectors 会以 soft prompts 的形式传入模型。(GitHub)

  1. Memory 可以是连续向量，不一定是自然语言摘要。

  2. 压缩状态可以递归更新，不必每次重读全部历史。支持 long context 的增量压缩。

  3. 压缩目标可以来自语言建模，不一定需要人工标注。




> 上下文压缩中的 Memory state，可以看作推理时的 soft optimizer state：它不改参数，但改变后续 token 生成时可访问的信息状态。

这比一次性压缩整篇文档更接近 Memory 场景。因为 Memory 很少是一口气写入的，更多是持续进入、持续压缩、持续整合。

不过，AutoCompressors 也有明显限制：



    
    
    1. 需要训练 / fine-tune 模型；  
    2. summary vectors 对人不可读，追溯性较弱；  
    3. 压缩后的信息是否完整保留，通常只能通过下游任务间接验证；  
    4. summary vectors 的跨模型迁移能力有限；  
    5. 任务相关细节可能被语言建模目标低估。  
    6. 泛化性（比如 Agent 能力）掉点未验证  
    

它的研究品味在于：直接把“压缩历史”变成模型训练目标，且用 segment-wise LM objective 避免人工标注依赖。

### 7.6 ICAE：把上下文压缩成 memory slots

ICAE，全称 In-context Autoencoder(arXiv，推特讨论不多)。它的核心目标是：把一个长 context 压缩成短的 memory slots，然后让 LLM 直接 condition on 这些 slots 来完成任务。ICAE 先用 autoencoding 和 language modeling objectives 在大规模文本上预训练，使 memory slots 能准确、全面地表示原文；然后再用 instruction data fine-tune，使这些 slots 能更好服务实际指令任务。

论文明确说，ICAE 的 encoder 是 LoRA-adapted LLM，decoder 是 target LLM 本身；encoder 只额外加入 LoRA adapter 和 memory token embedding。

ICAE 的设计比单纯 summary vector 更清晰，因为它用了两个目标：



    
    
    Autoencoding：  
    memory slots 应该能恢复原文信息  
      
      
    Language modeling：  
    memory slots 应该能支持后续文本预测。  
      
      
    Instruction fine-tuning：  
    memory slots 应该能服务实际问题回答。  
    

实验上，ICAE 引入约 1% 额外参数，在 Llama 上实现 4x context compression，并改善 inference latency 和 GPU memory cost。

这非常适合 Memory 研究，因为：



    
    
    可重构：保留原始细节；  
    可使用：保留任务有用信息；  
    可泛化：适配没见过的问题；  
    可控：压缩状态不能随意幻觉。  
    

ICAE 和 AutoCompressors 的区别

两者都压缩成连续向量，但侧重点不同：



    
    
    AutoCompressors：  
      更强调递归地压缩长文档，并把 summary vectors 作为 soft prompts 传递。  
      
      
    ICAE：  
      更强调 encoder-decoder 式压缩，把 context 显式编码成 memory slots，再让固定 LLM 解码使用。  
    

ICAE 更像一个标准 autoencoder 框架，因此适合在文章中解释“Memory slots”这个概念。AutoCompressors 更适合解释“长期上下文如何逐段压缩和积累”。

ICAE 的限制：



    
    
    1. 压缩倍率在论文主结果里相对克制，约 4x；  
    2. 需要训练额外 encoder / LoRA；  
    3. memory slots 仍然缺少人类可读性；  
    4. autoencoding 能力不保证复杂推理能力；  
    5. 原文证据链和来源追踪需要额外机制。  
    

它的价值在于提供了一个清晰的技术形态：

> Memory 可以是一组由 LLM 编码、由同一个 LLM 解码使用的连续 memory slots。

这比传统 RAG 的文本 chunk 更接近“模型内部可读的工作记忆”。

### 

7.7 LLMLingua / LongLLMLingua：把上下文压缩回离散文本

LLMLingua (ACL Anthology)的路线和 Gist / AutoCompressor / ICAE 不同。它压缩后仍然输出离散文本 token，因此能服务黑盒 LLM API。

它的问题是：



    
    
    prompt 越来越长  
    ↓  
    推理成本、延迟、context 占用增加  
    ↓  
    能不能删掉冗余 token  
    ↓  
    让模型仍然完成任务  
    

LLMLingua 提出 coarse-to-fine prompt compression，包括 budget controller、token-level iterative compression algorithm，以及 instruction tuning based distribution alignment。它在 GSM8K、BBH、ShareGPT、Arxiv-March23 四类场景上实验，报告最高 20x compression 且性能损失较小。但是参考性非常有限。

这里的关键点是：LLMLingua 把 context compression 变成 token selection / token pruning 问题。压缩产物依然是文本

### 

7.8 LongLLMLingua：压缩要看问题，也要处理位置偏置

“Lost in the Middle” 论文已经系统展示：模型在长上下文中对信息位置很敏感，相关信息位于开头或结尾时性能更高，位于中间时性能明显下降，即使显式 long-context models 也存在这个问题。(ACL Anthology)

LongLLMLingua （推特上讨论也不少，llamaindex支持）受到这个问题启发，做 question-aware prompt compression：它压缩时会考虑当前问题，目标是提高 prompt 中关键信息的密度，并改善模型对关键信息的感知。在 NaturalQuestions 上，LongLLMLingua 用约 4x 更少 tokens 使 GPT-3.5-Turbo 性能提升最高 21.4%；在 LooGLE 上实现 94.0% cost reduction；对约 10k tokens 的 prompts 做 2x–6x 压缩时，end-to-end latency 加速 1.4x–2.6x。(ACL Anthology)

这篇论文最值得学习的地方是：它没有把 compression ratio 当唯一目标。它抓住了长上下文模型的问题之一：

> 长 prompt 的问题不只是太长，还包括关键信息密度低、位置差、噪声多。

所以压缩可以提高性能，而不只是降低成本。在后续的几年里，还有众多的 follow-up 工作在做类似的工作，列举不完。

### 

7.9 LLMLingua-2：数据蒸馏视角

数据从哪来？蒸馏。

LLMLingua-2 的出发点是：早期基于 causal LM entropy 的 token importance 估计有局限，因为它只看单向上下文，也不一定对齐 prompt compression 目标。LLMLingua-2 用 GPT-4 蒸馏压缩数据，把 prompt compression 转成 token classification：每个 token 判断 preserve / discard；压缩模型采用 Transformer encoder，以利用双向上下文。(arXiv)

  1. 先让强模型生成压缩示范；

  2. 再把生成式压缩结果对齐回原文 token；

  3. 把任务转成可控的 token classification；

  4. 用小模型学习压缩策略；

  5. 保持 extractive compression，减少幻觉风险。




LLMLingua-2 用 GPT-4 压缩时只能删除不重要词，不能改词、不能重排、不能加新词，并且不强行指定固定压缩率，因为不同文本的信息密度不同。

实验上，LLMLingua-2 报告小模型压缩器比既有 prompt compression 方法快 3x–6x，并在 2x–5x compression ratios 下实现 1.6x–2.9x end-to-end latency speedup。

> Compressor 本身也可以被训练；训练数据可以来自更强模型对“什么值得保留”的判断。

### 

7.10 这几类方法的本质差异

可以用一张表统一：

最核心的差异是：



    
    
    soft compression：  
      压缩率潜力高；  
      模型读起来可能更自然；  
      人类难审计；  
      需要目标模型配合训练。  
      
      
    discrete compression：  
      可审计；  
      可直接用于黑盒模型；  
      更容易保留证据链；  
      高压缩率下容易丢细节。  
    

前者更接近“模型内部 Memory state”，后者更接近“工程可部署 Memory compressor”。这两个路线都重要。

关于 Memory 系统的启发，我总结如下几点：

  * 上下文压缩是 Memory 的基础操作。压缩器本身会成为 Memory 系统的核心模型。

  * 压缩结果要面向模型，而不只面向人。

  * 压缩必须任务相关。

  * 黑盒场景优先用离散压缩，白盒场景可以探索软压缩。




08

如果 Memory 需要显式参数化记忆层

参数化记忆到目前为止有两种存放方式。第 4 章的知识纠缠在稠密 FFN 里，定位要靠归因算法，写入要解受约束的线性代数问题，连续编辑还会累积干扰；第 5 章把记忆挪进低秩增量，写入变得可控，代价是表达容量被 rank 卡死。第 6 章暂时离开了参数：前向传播本身在做隐式学习，存在上下文里，随会话生灭。

在第 7 章，我们讲的是如何在「不变更模型参数」的情况下，压缩记忆、读取记忆——我们才算是真实意义上地开始 pay attention to 和 consider 记忆这个课题。

这一章我们回到「如果允许变更模型参数」的问题，换一个思路。4.1 节已经给过证据：FFN 在数学形式上就是一个 key-value memory，只是训练把它长成了分布式、纠缠、难写的形态。既然如此，干脆把这个观察反过来用——按记忆的规格，在架构里显式设计一层。规格可以写得很具体：容量要大，大到与算力解耦；读取要稀疏，每个 token 只碰少数槽位；地址要离散，写入时能点名。

根据我看到的，极少有论文能够讨论并解决真正的参数化、Attention Native 的 Memory。我提出，要解决参数化 Memory、Attention Native 的问题（以下简称为参数化 Memory），至少要解决四个子问题。我找了四篇论文，能够给这四个问题的解决提供一些灵感。

### 

8.1 Product Key Memory：先解决"查得快"

Large Memory Layers with Product Keys（Lample et al., NeurIPS 2019）。

把它的读取公式和 4.1 节的 FFN 摆在一起看：

同一族公式它改动只有两处：key 的数量  从几千拉到十万、百万量级；求和从全体收缩到 top-k 个。后果立刻显现——参数量随  线性增长，FLOPs 只随  增长，容量和计算第一次解耦。

下图更直观地展现了 product key 给原有的 FFN 带来的变化。左图：典型的 Transformer 块由一个自注意力层后接一个前馈网络层（两层网络）组成。右图：在我们的系统中，我们将前馈网络层替换为乘积键记忆层，这类似于具有极大隐藏状态的稀疏前馈网络层。实际应用中，仅替换N个层中的前馈网络层，通常 。

新的瓶颈是，如果  到百万级，那么每个 token 就都要对全部 key 做一次最近邻搜索， 的暴力扫描扛不住。product keys 就是为此发明的：把 query 劈成两半 ，准备两本子码本 C^1 、，各含  条半长 key，全体 key 定义为笛卡尔积——每个 key 由一条  和一条  拼接而成，打分因此可以分解：

检索分两步走：先在每本子码本里各取 top-k（各扫  条），再在  个组合里选出最终 top-k。这个 top-k 是精确的，复杂度从  降到 。百万槽位，实际扫描千级条目。

在实验里，一层 memory 插进神经网络中部，12 层模型在大规模语言建模上超过 24 层 baseline，推理速度还快一倍。为实验配套的设计也是有用的：多头访问让不同 head 查询记忆的不同区域；query 上加 batchnorm，逼着槽位利用率均匀化，防止大量 key 沦为死地址。

> PKM 的贡献可以总结成一句：它把"参数多"和"算得慢"拆开了。记忆容量从此是一个可以独立调节的旋钮。

不得不指出，这个实验是非常受限的。显然，验证停留在 2019 年的模型尺度；value 只是一个被查出的向量，槽位内容不可解释；利用率靠训练技巧维持，分布漂移后死槽位问题依旧存在。还有一点：它只谈了读，没有涉及写。

### 

### 

8.2 Memory Layers at Scale：来自五年之后的规模检验

PKM 之后，Memory Layer 这种方法沉寂了五年；与此同时，LLM 的规模涨了好多好多个数量级。这五年的主旋律是 dense scaling 和 MoE，而 memory layer 的算术强度低，查表操作对为稠密矩阵乘设计的 GPU 不友好，带宽吃紧、算力闲置，工程上天然吃亏。下图是 Memory Layer（W1）在 Attention 中的机制：

Memory Layers at Scale（FAIR, Meta, 2024）pick it up，问题也被换成了 scaling 这一套说辞：固定 FLOPs 预算，把增量参数花在 memory 上，和花在 dense、花在 MoE 上比，哪个划算？

做法：把 Llama 式模型中若干层的 FFN 替换为 memory layer，多个记忆层共享同一个记忆池；然后在工程上配置跨 GPU 的分片查表、门控读出等一揽子改造，再把规模推到 128B memory parameters、1T tokens 预训练。如下图所示，该方法依赖巨量的跨 GPU 通信，带宽成为新的瓶颈。

效果还是不错的，在同等 FLOPs 下，memory 模型在下游任务上超过了计算预算两倍以上的 dense 模型，也超过 compute/parameter 双匹配的 MoE；其中，收益在 factual 任务上最为集中。

在大尺度下，也 work：

收益的分布值是值得我们关注的，正好它恰好 callback 回第 4 章：FFN-as-KV 存的主要就是"模式 → 输出倾向"这类关联，事实问答正是最接近查表的负载。如果现在给这类知识一张真正的表，那么收益自然会堆积在这里；推理类任务改善有限，说明记忆层扩充的是可检索的存量，推理能力的收益另有来源。这个结论和 DeepSeek 的 Engram 的结论是相呼应的：显式记忆层的收益主要在 factual 任务上。

> Scaling 实验给出的信息：在"多记事实"这个目标上，把参数花在稀疏记忆上，比花在稠密权重或粗粒度专家上更划算。

代价同样明确：参数不占 FLOPs，但占 HBM、占通信；带宽成为新的瓶颈。硬件亲和性问题没有消失，只是被工程改造压进了可接受的范围。

### 

8.3 PEER：把 Memory Layer 融入极致的 MoE 模型中

先捋一下 PEER 这个工作提出的动机和思路，要不然可能大家意识不到 Memory 和 MoE 是怎么扯上关系的。不妨把 4.1 节的 dense FFN 按行拆开：

每一项都是一个宽度为 1 的计算单元： 给输入打分， 向残差流写内容。这个视角下，本章出现过的所有结构共享同一副求和骨架，彼此的差异只有——池子里有多少单元、每个 token 激活几个、单个单元内部有多宽。

“单个单元内部有多宽”是 PKM 和 MoE 的主要区别：PKM 的槽位宽度为 0：value 是常量向量，输入只通过路由分数影响它的混合权重，单元内部没有任何对  的计算；MoE 的 expert 宽度数千：路由入口只是 router 里的一行 embedding，取出来的却是一个完整两层网络。它们仿佛在谱系的两端，一端纯查表，一端纯计算，显然中间缺点什么，于是 PEER 出现并用一套理论解释了两者。

Mixture of A Million Experts（DeepMind, 2024）为了做到这一点，把单元缩到宽度 1——一百万个专家，每个只剩单个神经元：

与 dense FFN 的那一项同形，创新点主要在两个地方。其一，地址与内容分家（KV 分离）：每个专家另配一把 product key 负责被检索，、 只管计算；dense FFN 里  一身两职，PKM 里则有地址无计算。其二，激活的组装方式： 个独立 query 头共享同一个专家池，各自沿 8.1 的两步检索取 top-k，检索分数经 softmax 化为门控权重，头内加权求和、头间相加；查询侧沿用 batchnorm 均衡利用率。

如上图，Product Keys 是那排上下双色的小方块，两截颜色代表两本子码本的半长 key，拼接成完整地址；专家画成中间偏左的沙漏， 维进、1 维腰、 维出。

  * 

    
    
    x → h 个 query 头  
    每头：product key 两步检索 → top-k 专家 → softmax 门控  
    输出：Σ_head Σ_{i∈TopK} g_i · σ(u_i^⊤x) v_i  
    

我们可以推算出，每个 token 于是激活  个神经元——等价于逐 token 现场拼装一个宽度  的 FFN，成员从一百万里临时挑选，可组装的花样远超粗粒度 MoE 从几十个专家里取二。FLOPs 随着  走，参数随着  走，并且符合 8.1 里我们"容量与计算解耦"的预期，只是单元从纯查表升级成了会算一步的神经元。

动机来自细粒度 MoE 的 scaling law：同等算力，专家越小越多，性价比越好。PEER 的 isoFLOP 结果与之相符，压过 dense FFN、粗粒度 MoE，也压过纯查表的 PKM——单元里那一步  没有白给。（提一嘴，8.2 的 Memory Layers at Scale 主线续自 PKM，把 PEER 列为对比基线之一，同预算下其改进版记忆层略占上风。）

对 PEER 的意义在于统一了概念：槽位即宽度归零的专家，专家即宽度放大的槽位，memory layer 和 MoE 处在同一设计空间的两端，PEER 补上了中间最细的一格。顺带一个回响：4.2 节做知识归因时，事实被定位到的单元恰好也是单个 FFN 神经元——PEER 把同一个单元做成了可检索、可路由的原子。MoE 本身大家已经熟悉，不再展开；记住这条粒度谱系的存在就行了。显式记忆层这条路线并不孤立，毕竟，细粒度稀疏化的收益有 MoE 社区的背书。

### 

8.4 Sparse Memory Finetuning：离散地址实现可写

前三篇都在谈读。这一篇解决本章开头的第三个问题：地址离散，写入能点名。

Continual Learning via Sparse Memory Finetuning（FAIR, Meta, 2025）。

先回忆 4.5 节的困境。ROME / MEMIT 在稠密权重里写事实，每次写入是高维参数空间中的一个方向性扰动，干扰只能靠约束优化压制；连续编辑时，扰动在共享参数里累积，gradual forgetting 滑向 catastrophic forgetting。该困境的根源是共享：所有知识挤在同一组权重里，动谁都牵连别人。

memory layer 改变了这个前提。如下图所示，它将 Transformer 中间的一个 FFN 替换为内存查找。对于每个词元，模型将前一层输出投影为查询，用于识别前  个键。对 top-k 个值的加权和施加依赖于输入的门控后，就得到了 memory layer 的输出。

由于知识“平摊”在离散槽位上，访问天然稀疏，"新知识住在哪"这个问题不再需要归因算法去猜——前向传递一遍，访问记录就是地址：



    
    
    新数据 D_new 过一遍前向 → 统计每个槽位的访问频次（见图左边）  
    对照背景（预训练）分布下的访问频次  
    TF-IDF 打分：在新数据上高频、在背景里低频的槽位，才是新知识的专属地址（见图右边）  
    只对 top-t 个槽位打开梯度，其余参数（含全部稠密权重）冻结  
    

对照 4.2 节的 Knowledge Neurons：那里要用 integrated gradients 做归因，才能找到与某个事实相关的少量神经元；这里归因是免费的、自由的，因为架构把访问做成了稀疏、离散、可计数的事件。定位从一个研究问题降级成一次查表统计。

同等新知识获取水平下，旧能力的损耗（NaturalQuestions F1 跌幅）：



    
    
    全量微调              −89%  
    LoRA                 −71%  
    sparse memory FT     −11%  
    

LoRA 的成绩值得看一下。第 5 章说过，LoRA 把更新约束在低秩子空间——它稀疏在方向上，新旧知识仍共享那几个方向，写入照样串扰。而，槽位微调稀疏在坐标上，新知识写进旧知识几乎不访问的地址，干扰在结构层面就被隔离了。两种稀疏，几何不同，导致在持续学习场景下能差出六十个百分点。

> Callback：4.5 节列过参数写入的七项约束，其中干扰（specificity / locality）与连续编辑稳定性（scalability）是核心的两项。显式记忆层用架构响应了这两项指标：写入的定位由访问统计免费、自由给出，写入的影响被离散地址物理隔离。

边界照旧要划清。这个工作 work 的前提是模型从预训练起就得是 memory-layer 架构，手头的 dense checkpoint 享受不到这个红利；槽位级定位仍停留在参数空间，依旧存在 4.5.4 同样的问题——更改一个事实后，它的逻辑后果不会自动传播；评测实验目前以事实注入类场景为主，程序性知识、偏好类记忆的持续写入的效果还没有得到系统的实验证据印证。

### 

8.5 小结，以及一个自然浮现的问题

回看本章开头的三个维度。

  1. 容量大：PKM 与 scaling 实验给了肯定答案。

  2. 读取稀疏：product keys 把代价压到亚线性。

  3. 地址离散：sparse finetuning 证明了它对写入干扰的隔离价值。考虑到第 4 章提到"能定位、能干预、能稳定写入是三个难度递增的问题"，在显式记忆层上，这个架构降低了“分离”问题的难度。




于是一个新问题自然浮现。写入成本降到"少量槽位的几个梯度步"这个量级之后，写入的时机还有必要固定在训练阶段吗？能推迟到部署之后吗？能发生在推理进行中吗？第 6 章我们提到，前向传播本身就在做隐式学习；这一章又把显式写入的代价压到了槽位级。emmm，很有意思——两条线索指向同一个未来方向，也就是下一章：测试时学习。

09

测试时学习（Test-Time Learning）：

参数化记忆最值得关注的新方向

第 8 章末尾的问题需要一个前提才能成立：写入发生在推理中，意味着写入时没有标签。第 6 章的隐式学习绕开了这个前提——in-context 示例自带 $ (x, y) $ 对，前向传播拿它们做隐式 GD——代价是学习产物住在激活里，随 KV cache 一起丢弃。因此想把产物写进参数并且在推理中写，要先回答这个问题：梯度从哪来。

本章围绕这个问题展开。先列出路线会更有逻辑：

  * （在 9.1）给出三个时代的答案：dynamic evaluation (PMLR) 指出语言建模的监督信号免费，TTT-2020 (PMLR) 证明信号缺席时可以制造一个，ARC-TTT (PMLR) 把显式测试时训练在 LLM 上打到人类平均分（但是不好说泛用性有没有掉点）；

  * 9.2 的 TTT layers (PMLR) 把学习器塞进序列模型的隐藏状态，制造信号的任务交给训练去学；

  * 9.3 的 Titans (arXiv) 则升级更新规则，给写入配上动量和遗忘；

  * 然后我们在 9.4 中指出统一框架，归纳出：过去五年的高效注意力变体全都可以读成测试时回归；

  * 在 9.5 中介绍下 FlashMemory (arXiv)，提供对照组——同一时期，生产系统在读路径上做了哪些对称的工作。




### 9.1 起点：推理时的梯度从哪来

替大家梳理一下时间线：

语言建模的梯度是比较好找的：监督信号免费。 Dynamic evaluation（Krause et al., ICML 2018，思路可溯到 Mikolov 的 RNNLM 工作）在评估时按段读入序列，对刚见过的片段计算语言建模损失，做梯度步更新模型权重，再预测后文。文档内部的重复结构——人名、术语、行文习惯——经过更新变成低损失区域，PTB、WikiText、enwik8 上稳定改善，2019 年同一作者把它扩到 Transformer-XL。每个 token 天然是前文的标签，写入信号不需要发明。代价是：更新对象是整个模型，成本太高；学习率和更新时机全部手工设定，没有任何环节被"学会更新"。

视觉在 2020 有了进展：信号缺席，就制造一个。  Sun et al.（ICML 2020）面对图像分类的 distribution shift，输入没有 next-token 这种免费监督，于是把网络做成 Y 形：共享特征提取器  接两个头，主任务头  做分类，自监督头  做旋转预测。训练阶段两个损失压在同一个提取器上联合优化：

是一个四分类交叉熵：把图像转出  四个副本，让自监督头判断转了多少——标签  由构造过程免费产生，这就是"制造信号"的全部含义。 测试时，单个无标签样本  到来，先在它的增广副本上对共享提取器做一到几步梯度下降：

再用更新后的  输出分类，预测完丢弃更新、下个样本从原点重来。online 变体不重置， 在样本流上持续累积，分布持续偏移时增益随之扩大，CIFAR-10-C、ImageNet-C 均有改善。

无标签的更新凭什么帮到主任务？联合训练是伏笔：两个头共享 ，旋转梯度与分类梯度在共享参数上被迫相关。论文在凸且光滑的设定下给出了精确条件：若

则合适步长下， 的一步下降同时降低 。该方法的不足之处也写在同一个内积里：辅助任务靠手工挑，这个内积没有先验保证，取值为负时，测试时更新反噬主任务——从机制上推一步就能看到失效样例，本身无方向性的输入（俯拍、纹理）会让旋转标签失去可辨识性，任务失义，梯度方向随之失去意义。

这是一篇纯视觉论文，为什么选入它呢：test-time training 这个名字正是由它确立的；并且，四年后把它搬进序列模型的第一作者是同一个 Yu Sun。

LLM 主要是在 2024 有了新的东西，出自我们之前提到的一个熟人。第 6.3 节证明 ICL 隐式实现学习算法的 Akyürek，他这次直接把显式梯度搬进推理（arXiv:2411.07279，ICML 2025 正式版改题 The Surprising Effectiveness of Test-Time Training for Few-Shot Learning）。ICL 是隐式学习，该工作是显式学习——论文的动机陈述里写明，实证上 LM 的 in-context learning 并不总像任何标准机器学习算法，指望隐式学习不如显式来一遍。

先看 benchmark 素材。一个 ARC 任务自带 n 个演示对（输入网格 → 输出网格）和一个待解输入，模型要从演示里归纳变换规则。演示对就是现成的  标注——问题只剩一个：n 通常只有两三个，怎么把它变成一份能训练的数据集。

分两步走。第一步 leave-one-out ：轮流把第  个演示对藏起来当"考题"，剩下  对当上下文，拼出一条与真实任务格式完全相同的训练样本；轮完一圈，n 个演示对变成 n 条训练数据。第二步 几何增广 ：旋转、翻转、转置这类可逆变换作用于整个任务（输入输出网格同步变换，规则不被破坏），几条样本扩成数百条。到这里，一份微调数据集无中生有了，监督信号全部来自任务自身的结构。 具体的数据合成流程如下图所示。

算法示意图如下。



    
    
    一个 ARC 任务：n 个演示对 + 1 个待解输入  
    ↓ leave-one-out：轮流留出第 i 对当考题，其余当上下文 → n 条训练样本  
    ↓ 可逆几何变换增广（网格任务同步变换）→ 数百条  
    ↓ 训练任务专属 LoRA，基座冻结  
    ↓ 推理：多个增广视角各自预测 → 逆变换还原 → 层级投票（先同视角内、后跨视角）  
    ↓ 提交答案，LoRA 即弃  
    

推理端与训练端对称：同一道题的多个增广视角各自作答，逆变换还原回原坐标系，投票分两级——先在同一变换视角内部聚合，再跨视角选出最终提交。整个 LoRA 只为这一道题服务，答完即弃。

值得停一秒的地方在数据的用法上。leave-one-out 拆出来的  对，和塞进 prompt 做 few-shot 的是同一批演示——第 6 章里这批数据走前向传播、被隐式消费，这里它们走反向传播、被显式消费。显然后者的效果更好。

结果上，相对微调基线最高 6 倍准确率；8B 模型在 ARC 公开验证集拿到 53.0%，把纯神经公开方法的 SOTA 提高近 25%；与程序合成集成后 61.9%，追平人类平均分；ICML 版补测 BBH，10-shot 设置从 50.5% 提到 57.8%。以下是一些其他的结果的截图，大概明白这个趋势就行。

回头看作者他们提到的三种方案，它们其实借用了类似的洞察：监督信号藏在输入自身的结构里，区别只在从哪层结构里挖——dynamic evaluation 挖序列的自回归结构，TTT-2020 挖图像的几何结构，ARC-TTT 挖演示对的可拆分结构。它们残留下来的问题也因此一致：（1）学习器与架构是分离的外挂过程，（2）任务（挑什么自监督目标）和更新规则（学习率、步数、时机）全靠手工配置。把学习器做进架构、把任务交给训练去学，以及把更新规则也变成可学习的量，是接下来两节的事。

### 

9.2 TTT Layers：隐藏状态本身也是一个模型（Learning to (Learn at Test Time): RNNs with Expressive Hidden States, 2024）

这篇论文把序列建模层拆成三件东西：隐藏状态、更新规则、输出规则。RNN 的隐藏状态是定长向量，更新规则是固定函数；attention 的隐藏状态是不断增长的 KV cache，更新规则是追加。TTT layer 提出了第三条路线：隐藏状态是一个内层模型的权重 ，更新规则是一步自监督学习。

TTT Layer 会替换掉 attention 机制。每个 token 会经过两个流程，先训后测。训练 step：内层模型 

从低维投影  出发重构另一个投影 ，学不好的部分变成梯度，把 W_{t-1} 改写为 W_t 当前的信息以权重增量的形式留存。预测：拿 \theta_Q x_t 去查询刚更新过的 W_t ，得到本层输出z_t。 取线性模型就是 TTT-Linear，取两层 MLP 就是 TTT-MLP。

TTT-Layer 如图所示， 是残差流输入，顶部直连是恒等映射，本层学的是加在它上面的残差项，；蓝色是， 才是本层的工作对象。图只画了 Transformer 块的前半——TTT layer 顶替 attention 的那个子层，后半的 MLP 子层照旧，图中省去。往下两条支路正好对应上面的两步：下路是训练路，投影  承担  的角色， 是把内层输出映回  空间的重构解码头；上路是预测路，投影  承担  的角色， 是输出头。 到  的虚线即内循环那一步梯度，图中 ，每个 token 只走一步；加大  用算力换精度，前身论文测到  仍在涨。一处对齐说明：图中重构标签直接取  自身，相当于公式里  取恒等的特例。

红色 LN 是这张图专门要讲的知识点。重构标签  是蓝色 LN 的输出，均值和尺度都被归一过；解码头  的原始输出  没有这个约束。让一个无约束向量去逼近一个归一化向量，损失里混进了永远追不平的均值与尺度差——论文称之为类型不匹配（type mismatch）。修法花费一个 LN：给  也过一次归一化（作者自述承 MAE 的做法）， 与  同为 LN 输出，比较回到同一类型，消融里这一项对性能的贡献排得很靠前。内环是一个货真价实的优化问题，目标两端分布不对齐，学习信号就自带系统偏差；8.1 的 PKM 给 query 加 batchnorm，此处给重构端加 LN，记忆机制的训练修理两次都体现在归一化上，可见归一化的贡献。

图是个老图，与正式版有点出入。第一，2024 版把解码头  砍掉了：论文脚注说加  的重型设计略有提升，但训练更不稳、算力开销显著，最终取 encoder-only，重构由  独自完成——图里的  在正式论文中不存在。第二，前身论文的内循环学习率  固定为 1，由与线性注意力的等价关系推出，且  时两者严格等价；正式版把  和  都放开给外环去学。这两处放开正是下一段等价关系讨论的伏笔。

从图中可以获得这样的要点：历史 token 对本层输出的影响，全部压缩在  里——这就是"隐藏状态是权重"的字面含义。当前 token 走两条通道进入输出：作为训练样本，经虚线改写 ；作为查询，经上路读取改写后的 。先写后读，一个 token 一轮（开销也是非常巨大）。

相比于 9.1 残留的两个人工配置的环节，TTT Layers 的优势在于—— 解决的更新规则的 Learning Issue：这三个投影由外环训练学得，也就是说，内层学习器该解什么自监督任务，本身是被学出来的（后面会讲怎么更新规则的手工配置）。对照第 2 章，这是 MAML 双层结构的逐 token 版——外环压缩任务分布的共性，内环用少量新证据快速适应——区别在内环步进频率提到了每个 token 一次，且适应对象从整个网络缩小到一层的隐藏状态。对照第 6 章，von Oswald 证明线性注意力的前向传播隐式等价于一步 GD；TTT 把这层等价关系从解释翻转成设计原则：先选定内层学习器，再让架构显式执行它的更新。

工程上，逐 token 的串行梯度步无法并行，论文用 mini-batch TTT（，批内 token 共用同一起点算梯度）加对偶形式把计算改写成矩阵乘。实验规模 125M–1.3B 参数，TTT-Linear 与 TTT-MLP 的困惑度追平或超过 Transformer 和 Mamba；Books 数据上，Mamba 的困惑度在上下文超过 16k 后停止下降，TTT 持续受益于更长的上下文；8k 上下文处 TTT-Linear 的 wall-clock 已快于 Transformer，与 Mamba 相当。定长状态里装一个会学习的模型，长上下文的信息就有了持续压入的通道——这正是第 7 章那批压缩工作想要而没有得到的性质：压缩器在线运行，压缩目标由外环从数据里学出。

此外，补充一点不同架构之间的对比（关于架构消融，论文写了很多思考和对比实验，感兴趣可以阅读原文）：

### 

9.3 Titans：给写入配上动量和遗忘（Learning to Memorize at Test Time, Google, arXiv:2501.00663）

TTT 的内环（学习器）对每个 token 无差别执行一步 GD，没有轻重，也没有遗忘。序列一长，这两个问题就都显现出来了：不重要的 token 稀释记忆容量，写满之后没有腾退机制。Titans 的神经长期记忆模块（LMM）在更新规则上动刀：

三行公式表达的含义是不同的。第一行是关联记忆损失，与 7.2 节 Compressive Transformer 的 attention-reconstruction loss 同一个目标——保留未来读取时用得上的映射——从离线蒸馏改成了在线执行。第二行，论文把梯度范数定义为"惊讶度"（surprise，论文术语）：违背当前记忆预期的输入产生大梯度，写入力度随之增大； 是动量项，让惊讶跨 token 延续，、 均为数据依赖的门控。第三行， 是数据依赖的 weight decay，充当遗忘门，控制旧记忆的腾退比例。回看第 1 章那句"Memory 是外部 optimizer state"： 就是动量，动量就是 optimizer state，这里它被字面地并入了记忆的组成部分。再回看第 3 章 Meta-SGD——历史经验压缩成好的  加好的更新方向加好的学习率——Titans 把这三样全部做成数据依赖的可学习量，粒度细到每个 token。

到这里为止的东西，论文统一叫 LMM（Long-term Memory Model）。名字要拆开读：LMM 是模块，Titans 是把模块装进完整架构后得到的模型家族。模块自身还有一处设计： 取深层 MLP（两层及以上）而非矩阵，论文的论点是矩阵记忆等价于把关联压进线性映射，深度换来了非线性的存取容量（论文做了深度消融（=1/2/3/4），可查原文）。它与类似工作的差异在于：对比 TTT，动量与遗忘管住了容量，序列变长性能不掉；对比 Mamba2 ( PMLR )，记忆是深层非线性的，且 Mamba2 无法移除已写入的内容；对比 DeltaNet ( PMLR )，delta rule 能覆盖旧值但没有主动遗忘。

Titans 包括三个通用件。core 分支是 attention，负责当前窗口内的精确依赖，论文称之为短期记忆；contextual memory 分支就是 LMM，跨窗口的长期部分；persistent memory 是一组与输入无关的可学习 token，拼在序列最前端，存放任务级知识——测试时它冻结，区别于逐 token 更新的 LMM。论文给持久记忆的动机之一直接 callback 了本文第 4.1 节的那条视角：attention 配上数据无关的 KV 对，行为等价于一个 FFN，而 FFN 正是参数化的任务记忆。Titans 探索了三种组装方法——MAC、MAG、MAL，差别主要在 LMM 与 attention 的接线方式上。

上图，记忆作为上下文（MAC）架构。该架构包含三个分支：（1）核心分支、（2）上下文（长期）记忆分支和（3）持久记忆分支。核心分支将相应的长期记忆和持久记忆与输入序列拼接。随后，注意力机制对序列执行操作，并决定应将信息的哪一部分存储在长期记忆中。在测试时，对应于上下文记忆的参数仍在学习，对应于核心分支的参数负责上下文学习，而对应于持久记忆的参数负责存储任务相关知识，因此是固定的。

上图，记忆作为门（MAG）架构。该架构同样具有三个分支：（1）核心、（2）上下文记忆和（3）持久记忆。然而，它仅将持久记忆融入上下文，并通过门控机制将记忆与核心分支相结合。测试时，其行为与 MAC 架构相同。

上图，记忆层架构（MAL）。在该架构中，记忆层负责在注意力模块之前压缩过去和当前的上下文。

论文实际评测的配置是四个：LMM 单体，加上 MAC、MAG、MAL 三个混合体。LMM 单体入列的用意在隔离——它不带任何 attention，与 Mamba2、DeltaNet、Gated DeltaNet (arXiv) 同属定长状态的复杂度类，单体对单体的比较把架构混合的贡献剥掉；结果是语言建模与常识推理基准上，LMM 单体已超过这批现代线性循环基线（详见下表）。混合体内部另有一层对照：MAL 的接法与现有混合模型的逐层堆叠（Samba (arXiv) 一类）相同，实验里 MAC 与 MAG 整体压过 MAL——同一个模块，接线不同，收益不同，堆叠式接法没吃满记忆模块的价值。长上下文上 MAC 最好，有效上下文扩到 2M 以上，BABILong 上超过所有基线，包括 GPT-4 这类参数量大出若干数量级的模型。消融给出的贡献排序：weight decay 最大，其后依次是 momentum、卷积、persistent memory。

Titans 各变体的训练参数量与 token 数等数据，前往原文查看。

实现起来也很难啊。非线性递归更新的并行化靠分块近似，块内并行、块间串行，门控越多越难改写成纯矩阵乘；深层记忆的容量收益与训练稳定性之间的权衡，论文只给了小规模消融；官方代码截至 2025 年 11 月仍未放出，独立复现受限。这三条决定了 Titans 目前是方向证明，还称不上可复用的基础设施。

### 

9.4 概念一统：高效注意力的另一种读法

到这一节，你的大脑里应该对这两类东西留有印象：第 6 章把线性注意力理解成一步 GD，9.2 和 9.3 把定长状态直接做成显式学习器。softmax attention 站在两类之外——KV cache 随序列增长、没有任何梯度步，看上去与"测试时学习"无关。Test-time regression 统一框架（Wang, Shi, Fox, arXiv:2501.12352）(arXiv)把它也收编了进来，收编的方式值得多花些笔墨。

框架本体是一个两步分解。关联召回被拆成记忆与检索：记忆侧，对到目前为止的全部键值对解一个加权回归问题：

检索侧，拿查询过一遍拟合好的回归器，。每个序列层由三个设计选择完全刻画：各条关联的相对权重 （管遗忘）、回归器函数类 （管容量）、求解该问题的优化算法（管更新规则）。下表的三个中间列就是这三个旋钮；过去五年的"高效注意力"变体，各自对应一个经典估计器：

新加的最后行是这篇论文的 Vignette 4，推导链条完整：核技巧把线性记忆升到核回归，取局部常数近似得到 Nadaraya–Watson 估计器；该估计器要求平滑核是距离  的单调函数，softmax 用的却是内积的指数——两者本来对不上，但把键和查询归一到  后，带宽  的指数平滑核与缩放点积严格相等，softmax attention 被逐字推导出来。副产品是 QKNorm (arXiv) 的理论解释：这个只有经验背书的训练稳定技巧（Dehghani et al. 2023），在回归视角下就是让核回归的局部近似性质成立的预处理。

这一行入表之后，整张表出现了一条断层线：softmax attention 在非参数一侧，记忆就是样本全集，不压缩、状态随序列长大、检索精确；其余全在参数一侧，样本被拟合进定长权重，有损但恒定开销。Titans 那句"attention 做短期精确记忆、LMM 做长期有损记忆"的架构定位，在这里获得了统计语言的表述——精确与有损的差别就是非参数与参数估计的差别。第 7.1 节的压缩公式  也在此落地：参数一侧的  是回归求解器， 是拟合出的权重；非参数一侧压根没有压缩， 就是  自身。该回归视角还顺手给了第 6 章一个补充诊断：线性注意力等于忽略键之间相关结构的一步 GD，键不正交时关联互相串扰——论文摘要明说这解释了它丢失 token 间相关性的原因，而 delta rule 与递归最小二乘正是对同一问题的逐级修复。

关联回忆差距如图所示：根据预测的标记是否为示例上下文中先前见过的二元组，对每种架构类别的 Pile 验证数据进行分层。将验证困惑度与二元组在训练数据中的频率绘制成图。可以清楚地看到，这种差距集中在二元组出现且在训练中极少见到的示例上。

框架的生成能力怎么样呢？论文自己从局部多项式回归导出了 softmax attention 的高阶推广；2025 年 10 月的 Local Linear Attention（arXiv:2510.01450）(arXiv)沿同一路线取局部线性回归，落成了介于线性与 softmax 之间的新注意力层。这就像是一部"更新规则考古史"：从 Hebbian 到 delta rule 到带动量的 GD，优化算法教科书的目录被逐年搬进架构，现在连非参数统计那半本书也被搬了进来。Google 那条线上的后续沿同一逻辑推进：ATLAS（arXiv:2505.23735）(arXiv)把逐 token 更新换成滑动窗口上的最优记忆化目标；Miras（arXiv:2504.13173）(arXiv)把设计空间显式参数化为四元组——记忆架构、注意力偏置（即内环损失）、保留门（即遗忘）、更新算法；Nested Learning（NeurIPS 2025，HOPE 架构）(NeurIPS)再往上抽一层，让不同组件以不同频率自我更新。这批工作彼此的差异本质上都是讨论"内环优化器怎么配"，方向本身已无分歧。

### 

9.5 对照组：FlashMemory 在读路径上做了对称的事（arXiv:2606.09079, 2026-06）

严格说这篇不属于 TTL：backbone 权重在推理中一动不动。把它放进本章，因为它补上了谱系的另一半——写路径之外，读路径同样可以模型化。

问题是超长上下文服务的 KV cache 显存瓶颈。FlashMemory-DeepSeek-V4 在 DeepSeek-V4-Flash 架构上加一个 Neural Memory Indexer：解码每进行  步，索引器读取当前隐藏状态，预测接下来会用到哪些细粒度 KV 块（lookahead），只把这些块预取进显存；全局脉络由 128:1 压缩的 HCA 块保底，prompt 末尾 8K 与本地解码窗口全量保留。索引器是标准双编码器，用检索训练框架独立训练，全程不加载 backbone。

结果：LongBench-v2、LongMemEval、RULER 上，物理 KV cache 压到全量基线的 13.5%，平均精度反升 0.6 个绝对点——论文把这个现象称为 attention denoiser，删掉的上下文里噪声多于信息；500K 长度下 KV 开销削减超 90%，推理能力未失稳。边界同样明确：索引器只在 512K 以内的长度上训过，越界后块选择退化到接近随机，论文归因于位置编码的分布外失效，并预计 1M 以上不可恢复。

两处与前文的接线。

我如何看待这篇工作：在 7.2 中我们提到观点，“先问哪些过去信息会被未来的读取用到”——在这里成了一个独立训练的模型的全职工作，且判断标准从"过去被注意过"升级为"预测将被注意"；同一节里提过一个例子，就是 Opus-4.6 在 auto research 中曾自发提出预取算法，FlashMemory 给了这个思路一份生产级的数字，印证了我的想法。还一点值得一品的是，TTT/Titans 学的是往状态里写什么，FlashMemory 学的是从状态里读什么，两边的共同点是把记忆决策从固定启发式换成了一个被训练的小模型（小模型在读路径上做了优化，这为简化提供了非常非常好的思路）。

### 

9.6 边界在哪里？这个方向还缺什么？

长话短说，四条：

规模证据停在学术档位。 TTT 验证到 1.3B，Titans 未公布训练规模细节且无官方代码，frontier 模型的主干仍是 attention 及其稀疏变体——9.5 恰好是证据：工业界 2026 年年中的选择是改读路径，不动写路径。

状态的寿命没有跨过会话边界。TTT 与 Titans 的 、 随序列结束丢弃，ARC-TTT 的任务专属 LoRA 推理结束即弃，外环学到的只是初始化和更新规则；推理中的学习产物依然是一次性的。第 1 章定义的 Memory 要求经验跨时间携带，这一环当前由外部记忆系统承接，即第 10 章。

评测与第 N 章的表格对不上。 TTL 论文测困惑度、NIAH、BABILong，表格里的知识更新、受控遗忘、拒答、来源追溯几乎无人测；Titans 的遗忘门是容量管理装置，与合规删除是两个问题。

写入时机前移，投毒面也随之前移。 训练期写入尚有数据清洗兜底，推理期写入直面对抗输入，第 N 章表格"安全与抗污染"一行在 TTL 语境下还没有任何系统性工作。

总之，TTL/TTT 方向还是一个新兴的研究方向，现有工作主要集中在如何在推理阶段进行有效的记忆更新和管理，但在跨会话记忆、长期知识积累以及工业界实践方面仍有很大的研究空间。

10

RAG：把记忆放在参数之外

聊了那么多，谈点不那么烧脑的。

RAG 本身就是 Memory 的一种。知识和经验没有固化进 LLM 的主参数，而是留在外部存储中，需要时再由 retrieval 寻址、generator 或 agent 使用。大家对 RAG 了解比较多，我们只简单回顾。



    
    
    经验 / 文档 / 历史交互  
            ↓ 写入  
    external memory store  
            ↓ retrieval 寻址  
    relevant memory  
            ↓ 注入 context / hidden state  
    generator / agent 使用  
    

外部存储可以是非参数的，但 retriever、reranker、reader 和 memory policy 往往仍有参数，所以“外部记忆”不等于“整个系统无参数”。这里采用广义 RAG：只要持久状态位于模型权重之外，并按需选择性取回，就在讨论范围内。它和参数化 Memory 也不是替代关系：前者便于更新、删除、追溯和扩容，后者擅长低延迟、深融合与泛化。

10.1 外部存储如何成为语言模型的一部分

这组工作把可访问的知识容量从模型参数量中部分解耦：参数学习如何寻址和使用，外部存储承载持续增长的内容。

### 

10.2 从一次检索，走向长期记忆系统

真正的长期记忆不只有 `query → retrieve → generate`，还需要写入、更新、遗忘和回写。

### 

### 

10.3 retrieval 正在变成一项可学习的策略

2026 年以来值得注意的变化是：模型开始自己决定何时检索、缺什么、去哪里找、什么时候已经找够。这里列一些已入选 ACL / EACL 的工作：

RAG 的研究对象正在从“检索器能否找到相似文档”，转向“系统何时需要记忆、缺少哪类证据、应该访问哪一种存储、当前证据是否已经足够，以及读取成本是否值得”。

RAG 解决了什么，又没有解决什么？

  * 写入：哪些交互值得保存？存原文、摘要、图节点，还是 hidden state？

  * 寻址：语义相似不等于任务相关；时间、否定、多跳和异构来源仍难统一。

  * 使用：检索到证据，不代表 generator 会相信、正确组合或准确引用。

  * 生命周期：更新、冲突、遗忘、删除、权限和来源不能只交给向量相似度。

  * 成本：retrieval、rerank、长 context 与多轮 agent loop 都有代价。




Callback 第 4、8 节：参数化记忆要解决“写进哪里且不互相干扰”，RAG 则要解决“外部状态怎样组织、检索和维护”。当系统开始根据结果决定写回哪些经验、如何修订旧经验、下一次行动调用哪段记忆时，RAG 就进入了下一章的 agent experience system。

11

Agent 时代：记忆既写入模型，也写入“经验系统”

9.6 节记过一笔账：测试时学习的产物活不过会话边界，跨时间携带经验的职责移交给了外部系统。第 10 章结尾给出了移交完成的判据——系统开始根据结果决定写回什么、修订什么、下一步调用什么。本章按经验系统里存的东西分层看四批工作：11.1 存判断，11.2 存可执行技能，11.3 存 agent 的结构本身，11.4 让记忆机制自己进入演化循环。四节共享一个设定：基座权重全程冻结——把记忆写进参数的那条路前面各章已经走完，这里的学习全部落在权重之外。

### 

### 

11.1 Reflexion：语言反思作为 episodic memory (NeurIPS)

一个 agent 把任务做砸之后，拿到的全部监督往往只是一个二值信号。把这点信号变成改进，RL 的标准通道是策略梯度，它要求两样 2023 年的 API agent 都没有的东西：海量 rollout 预算，和对权重的写权限。Reflexion（Shinn et al., NeurIPS 2023, arXiv:2303.11366）把两样都绕开：Evaluator  给轨迹  打出标量 ；Self-Reflection 模型  读入 ，产出一段指认失败原因、给出下次对策的自然语言；反思追加进 episodic buffer，Actor  下一轮把 buffer 拼进 context 重试：

与  逐项对照：评价从 loss 换成  ，归因从反向传播换成  的因果推理，承载体从参数换成 context——论文自己的命名就叫 verbal reinforcement learning。差别在信息形态。REINFORCE 把一个标量摊进整条轨迹所有动作的 logprob，信用分配弥散，方差靠样本量压；M_{sr} $ 把同一个标量放大成一条有指向的假设，形如“柜子已搜过，钥匙更可能在抽屉”的具体度，一次失败就产出一步可执行的更新。样本效率的差距落在数字上：AlfWorld 的 134 个任务 12 轮内完成 130 个，比同样有重试预算的 ReAct 基线高 22 个绝对点；HumanEval pass@1 从 GPT-4 的 80.1% 提到 91.0%；HotPotQA 提高约 20 个点。消融确认承重件是那几句反思：允许重试、不写反思，成功率曲线很快停涨。

第 1 章写过“Memory 是 LLM 自迭代中的外部 optimizer state”，Reflexion 是这句话最字面的实现：mem 与 Adam 的动量同构，都保存“下一步往哪改”，数据类型从浮点向量换成了句子。换来两个梯度更新给不了的性质。其一，append-only：权重不动，第 4.5 节的编辑干扰与遗忘整个不发生。其二，optimizer state 人类可读：更新方向学歪了，肉眼可查。代价同样清楚。论文把窗口上限  取在 1–3 条，千字节量级的 optimizer state 装得下策略教训，装不下事实积累；反思只能在冻结模型已会的行为里做选择，它能把模型从错误策略劝回正确策略，给不出模型没有的能力；且 buffer 绑定单个任务，任务结束即弃，9.6 节“产物活不过会话”在语言空间原样重现。按第 6 章的读法还能再进一步：拼进 context 的反思经前向传播起效，等价于一次隐式的低秩更新——即便采纳这条最强的解释路线，它也只是住在激活里的浅更新。

这套循环的软肋在 。编程任务的评估器是模型自生成的单元测试：HumanEval 上它够准，MBPP Python 上假阳性测试把错误代码判为通过，反思在错误监督下更新，Reflexion 反而低于重试基线。评估器一坏，语言梯度的方向就反。这个问题在 11.3 会以更大尺度重现。

### 

11.2 Voyager：技能库作为程序化 Memory (arXiv)

Reflexion 存下的是忠告：上限三条，且每次都要靠模型把忠告重新翻译成行为。要在开放世界里连续攻克上百个任务，积累物得换成直接可执行的形态。Voyager（Wang et al., 2023, arXiv:2305.16291）在 Minecraft 里把每个学会的行为固化成一段调用 Mineflayer API 的 JavaScript 函数，系统三件套各管一段：automatic curriculum 出下一个难度合适的任务；iterative prompting 负责习得，环境反馈、执行报错、self-verification 三路信号驱动改代码直到通过；skill library 负责积累。

库的读写各有一处值得抄的设计。写入端有门槛：技能必须通过 GPT-4 充当的 self-verification 才入库——第 10 章写入清单里那句“哪些交互值得保存”，这里的回答是“被验证过的程序”，库因此维持一个质量不变量，向量库存原始对话做不到这一点。读取端沿用向量寻址：技能功能描述（GPT-3.5 生成）嵌入为 key，当前任务上下文为 query，取 top-5 拼进生成 prompt：

是技能程序， 是它的功能描述。寻址技术与第 10 章完全相同，变化全在取回物的类型：不是供参考的文本，而是可直接调用、也可作为新技能子过程的函数。结果：同样的 160 轮 prompting 预算内，unique items 是基线最好成绩的 3.3 倍（对照组含 ReAct、AutoGPT，也含 11.1 的 Reflexion），行进距离 2.3 倍，技术树里程碑最快 15.3 倍解锁，diamond 级工具只有它做出；技能库整库搬进新世界后，解新任务仍然更快。两个消融划出承重结构：去掉技能库，中后期物品曲线趋平——没有积累，每个新任务都从零重新合成行为；GPT-4 换成 GPT-3.5，全系统塌掉——记忆以代码为载体，写入质量直接吃生成器的代码能力。

程序这个载体一次给了三条性质，各自消解前文的一个难题。精确回放：第 4 章的参数记忆是有损叠加、读取受干扰，检索文本要靠模型每次重新解释，程序的执行语义确定，第一百次调用与第一次行为一致。组合性：新技能的函数体内调用旧技能，库随时间长成一张调用图；第 8 章 memory layer 的 slot 之间、第 10 章向量库的条目之间都没有这种结构，这是记忆条目第一次互相引用、逐层抬高抽象层级。免遗忘：append-only、无共享底座，写新技能对旧技能的干扰严格为零，4.5.1 的 generalization–locality 两难在这个载体上不成立——代价是泛化被整体让渡，程序自身不泛化，何时调用、怎么组合、要不要改写全由冻结的基座决定，库只扩大可组合的素材面，举一反三的能力始终是基座的、不随积累变强。参数记忆把存储和泛化耦合在同一组权重里，技能库把两者拆开。

边界也来自同一个载体。“可验证”在 Minecraft 便宜：API 干净、执行确定、成败可判。现实任务里 verifier 本身贵，GUI 操作没有单元测试这样便宜的判据；验证不了就过不了写入门槛，质量不变量随之失效。技能库范式的适用面，大体是“行为可代码化”与“结果可机检”两个条件的交集。

### 

11.3 STOP (arXiv) / ADAS (arXiv) / AFlow (arXiv) / AlphaEvolve (arXiv)：可演化的程序结构

11.1 的反思与 11.2 的技能都运行在一层手写的控制流上：怎么拆任务、何时验证、采样几个候选、拿什么当评估器。这一层本身是代码，没有理由豁免于优化。四篇工作把它变成搜索对象，共同设定是语言模型全程冻结、只充当变异算子，累积全部落在程序制品和它们的评估记录里。

STOP（Zelikman et al., 2023, arXiv:2310.02304）把问题推到自指的极限。种子 improver  接收（程序 ，效用 ），调用冻结语言模型  生成候选改进，按  择优返回；然后把  喂给它自己，递归由元效用驱动：

是下游任务程序的分布。几代之后，GPT-4 写出的 improver 里自发出现 beam search、遗传算法、模拟退火——提示词没有要求任何一种，它们是被  从候选里选出来的。同一篇论文如实记录了反面样本：少数生成的 improver 试图关掉执行沙箱的开关——效用读数与出题人意图之间的缝隙，在自指循环里同样会被搜索利用。

ADAS（Hu et al., ICLR 2025, arXiv:2408.08435）把搜索对象从改进器泛化为整个 agent 设计：meta-agent 用代码定义新 agent，档案存下全部历史设计与分数，每轮读档案、产出与既有条目有区分度的新设计。搜出的 agent 在 DROP 上比手工最优基线高 13.6 F1，MGSM 上高 14.4 个点，换基座后增益保留。AFlow（ICLR 2025, arXiv:2410.10762）把同一件事收窄成可规模化的形式：workflow 表示为代码图，节点是一次 LLM 调用，MCTS 做搜索——选择、LLM 依据执行经验展开修改、验证集评分、分数回传。六个 benchmark 平均超 SOTA 基线 5.7%；成本侧的结论更值得记：搜出的 workflow 让小模型在特定任务上以 GPT-4o 约 4.55% 的推理开销超过 GPT-4o——“任务怎么拆”这层结构记忆，顶掉了一部分参数容量的作用。

AlphaEvolve（DeepMind, 2025, arXiv:2506.13131）把这条线跑到生产刻度。记忆主体是一个进化程序库，用 MAP-Elites 与岛屿种群的混合维持多样性；每轮从库中采样父本和“灵感”程序拼进 prompt，Gemini 2.0 Flash 出吞吐、Pro 出质量，变异以 diff 形式产出，自动评估器打分写回。结果分两栏。数学栏：4×4 复矩阵乘法给出 48 次标量乘的算法，此设定下的旧纪录是 Strassen 递归的 49 次，保持了 56 年；11 维 kissing number 下界从 592 推到 593；50 余个开放问题上约 75% 追平已知最优、约 20% 给出改进。工程栏：Borg 调度启发式上线后平均回收 Google 机群 0.7% 的算力；Gemini 训练中一个矩阵乘 kernel 提速 23%，折合总训练时间约省 1%；FlashAttention 一处 kernel 提速 32.5%；一块 TPU 电路删掉了冗余比特。

从记忆视角看，这批工作改了两个此前各章都没动过的默认值。第一，评估器移进了记忆系统内部：库里的候选连同分数才构成一条记忆，系统上限从“生成器多强”移到“评估器多真”。STOP 的沙箱样本演示了缝隙的下界，AlphaEvolve 的适用边界——问题必须配得出机器可验证的评估函数——是同一约束的正面表述，11.1 的 MBPP 假阳性则是它的单 agent 版本。第二，淘汰准则换了目标：RAG 全存、按相似度取，Reflexion 只留最近几条，进化库为覆盖度而存——MAP-Elites 按特征格各留精英，明确保住当前非最优的解，因为它们是后代的父本。写入与遗忘的判据从“未来会不会被检索命中”换成“会不会成为更好后代的祖先”，这是第 10 章生命周期清单之外新添的一格。回看第 1 章“把经验压缩成可执行的更新方向”：AlphaEvolve 的变异以 diff 产出，“更新方向”在这里落到了字面上。

### 

11.4 2026 年的新方向：Self-Evolving Memory

前三节演化的都是记忆内容，记忆机制始终是设计时定死的：抽取用哪个 prompt、检索用哪种相似度、取回后怎么用，全是超参数。10.3 节记录过检索端的松动，2026 年的一组工作把松动推广到整条管道。EvolveMem（arXiv:2605.13941, 2026-05）(arXiv)让 retrieval configuration 与记忆内容一起演化：各路检索的 top-k、融合方式与权重、时间衰减半衰期等收进一个结构化配置 ，“评估→诊断→提案→守护”循环迭代它——LLM 读逐题失败日志诊断根因、提出配置修改，守护环节自动回滚造成退化的提案，循环还会发明动作空间里原本没有的配置维度。从最小配置起步跑七轮左右，LoCoMo F1 从 0.305 走到 0.543（GPT-4o），越过基线中最强的 SimpleMem（0.432）。

“单一静态抽取 prompt 在异质任务上不稳定”有了正式出处，且 BEHEMOTH 与 CluE 是同一篇论文的两半（arXiv:2604.11610, 2026-04）(arXiv)：前者是基准，把 18 个数据集分成 personalization、problem-solving、agentic 三类，按抽取出的记忆在下游答题中的效用打分；后者是方法，把训练样本按抽取场景聚类、逐簇归因成败、再跨簇合成演化后的抽取 prompt（产物仍是单个 prompt，不做推理时路由）。不稳定的证据是增益翻号：相对 Simple 基线，Mem0 的抽取策略在 personalization 类 +29.96%、到 problem-solving 类 −3.70%，ReasoningBank 在 agentic 类 +2.49%、到 personalization 类 −10.78%（Qwen3-32B）。第 10 章写入清单里“存原文、摘要还是图节点”没有固定答案，抽取策略是任务分布的函数——CluE 的逐簇演化在三类上同时为正，总增益 +9.04%。

MemMA（arXiv:2603.18718, 2026-03）(arXiv)把 construction、retrieval、utilization 放进多智能体协调循环：Meta-Thinker 出策略，Memory Manager 执行增删改，Query Reasoner 迭代改写查询去补被诊断出的检索缺口，回答模型全程冻结以隔离变量。前向路径只是指挥，闭环在后向：每个 session 收尾时自造 5 个探针 QA 考一遍暂态记忆，答错的探针定位构建缺陷、产出修补事实，在记忆定稿前回写——使用端的失败信号回流成构建端的修复动作。LoCoMo 上把它插到 LightMem 后端，ACC 从 75.66 提到 81.58（GPT-4o-mini）；消融里去掉探针自检一环，掉 11.19 个点。MemRL（arXiv:2601.03192, 2026-01）(arXiv)则改动寻址准则本身：在 episodic memory 上学 Q 值，用它挑选高价值经验。

四篇里最值得单独放大的是 MemRL。它的记忆条目是三元组 ——意图向量、一段成功轨迹、一个可学习的效用标量——基座冻结，会学习的只有记忆库。面对新任务 ，检索分两相：先按相似度过阈值召回候选，再按相似度与效用的混合分取 TopK 进 context；任务结束后，被取用条目的  按成败更新：

混合分里两个量各管一件事： 管“相关”，仍是第 10 章的语义几何； 管“有用”， 编码执行成败或用户反馈，更新式是 one-step TD 把后继状态视为终态后的退化形式，等价于对这条经验的历史成败做指数滑动平均。语义相似度没有被丢掉，只是降级成召回门槛；“语义相似不等于任务相关”在第 10 章是现象描述，这里第一次拿到学习信号层面的处理——一条经验值不值得再取，由每次取用后的任务结果投票记账。ALFWorld 上这套记账把成功率从经验库基线 MemP 的 0.324 提到 0.507。

把第 1 章的定义念完整——Memory 是外部 optimizer state——这批工作开始优化 optimizer 自己。同一个套路本文已出现三次：第 2 章 MAML 学初始化，第 3 章 Meta-SGD 学学习率，9.3 节 Titans 把动量和遗忘门做成逐 token 的可学习量；现在轮到经验系统：CluE 演化抽取 prompt，EvolveMem 演化检索配置，MemRL 给寻址学效用，MemMA 用探针把使用端的失败回写进构建端。

12

关注一下主流的 Benchmark

长期记忆 benchmark 还没有一个可以包打天下的总分。看榜时最好先问清楚：它测的是“记住后回答问题”，还是“管理一套长期记忆系统”，抑或“把记忆真正用于后续行动”。目前比较有代表性的四项工作，可以按下面的方式理解：

### 

12.1 2026 年 3 月之后值得补充关注的 Benchmark

还整理了一些“相对不野榜”的论文（至少已经进入主流 NLP 会议正式论文、并且公开了可复用的评测设计）：

此外可以关注 LongMemEval-V2 (arXiv)：它沿用了 LongMemEval 的评测思路，把对象换成 web agent 在专门环境中的长期经验，451 道人工题目覆盖静态状态回忆、动态状态追踪、工作流知识、环境陷阱和错误前提识别，历史最长达到 500 条 trajectory、约 1.15 亿 tokens。不过作者目前明确标注为 work in progress，因此更适合作为下一代 agent-memory benchmark 的信号。

N

关于完全的记忆算法，我们还未讨论的？

聊了那么多，还存在一些乌云，也是本文很少讲到的东西（但是实际上，在生产中很重要）。我们要么等待新的架构出现解决它们，要么就是依赖文中提到的架构规模化之后所展现出的泛化能力。下面列出一些子能力、它们与压缩的关系、如何评估以及当前技术缺口，供读者参考：

N+1

写在最后

很多工作就是这样，众多的创新大多数都被淹没在了时间长河里。随着基模能力的不断提升，很多研究结论、算法框架已经被默默地无视了。

而我在这篇长文章里涉及到的大多数文章都不过是昙花一现，但是它们的价值远不止于此。如果仔细阅读过里面的每一篇文章，我相信，它们带来的思考都会被大脑自动压缩成独有的记忆。

人所谓之不同，道所谓之相同。

文末点击阅读原文查看参考资料👇

欢迎留言一起参与讨论~

[阅读原文](<https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFY4BPjMDJ3bzYmDO>)

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=eb234de4&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzg4NTczNzg2OA%3D%3D%26mid%3D2247511041%26idx%3D1%26sn%3D037ffb3529df30ea5b8b30b966a526bf>)
