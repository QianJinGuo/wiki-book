---
source_url: https://mp.weixin.qq.com/s/72gop2ih2CjnWT2T3q2aqg
ingested: 2026-07-16
sha256: 90695363ab5c067112ec6711689ca3752b4c3d111a5068aa02f312e85775874b
source_published: 2026-07-16
title: "淘宝闪购-爆品团精排Scaling Up迭代实践"
author: 李伟康
feed_name: 阿里云开发者
---

阿里妹导读文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。

淘宝闪购爆品团业务排序模型过去很长一段时间更像是在"堆模块"：遇到一个问题，就补一个结构。短期看，这种方式能持续拿收益，但当模型越做越大，结构碎片化、计算不够稠密、调参成本高等问题会越来越明显。

这次爆品团排序模型升级，核心不是再增加一个局部模块，而是把主干从传统 DLRM 架构切到 Token-Based 的 RankMixer 架构。围绕这条主线，我们系统做了负采样、多任务学习、序列建模、Tokenization、FFN、MoE 和 Task Tower 等结构消融。多期迭代后，模型规模从 85M 扩展到 107M，再到 243M，并在爆品团频道页取得了稳定线上收益。

## 先说结论

这次迭代里，比较明确的结论有几条。

- 旧模型的问题不是单个模块失效，而是整体结构碎片化。 RankMixer 将特征组织成 Token 后，可以用统一 Token-Mixing 主干承接高阶交互。
- 随机负采样并不适合当前样本分布。 保留全量负样本并做 Loss 加权更稳。
- GradNorm 能缓解多任务学习节奏不一致。 但训练计算量也会明显增加。
- Tokenization 不一定越复杂越好。 Pad-Split 效果接近 Group-wise，且实现更简单。
- 在当前 16 Token 配置下，Dense FFN 仍是更稳的主线。 Sparse MoE 在当前 16 Token 设定下没有超过 Dense。
- Flat Concat 更利于 Tower Scaling。 MMCN 是当前收益最明显的 Tower 结构。

## 1. 为什么要重构排序模型

近年来，NLP 领域通过 Scaling Law 确立了"大规模参数 + 稠密计算架构"的技术路线。相比之下，搜推广排序模型中仍有不少系统沿用 DLRM 类范式：稀疏特征、人工交叉、多个异构模块层层叠加。

爆品团线上旧排序模型也是类似路径。Embedding 和 Sequence 层之后，模型继续串联 EPNet、多层 PLE、Task Specific Net、Task Bias Net、ResFlow Tower 等模块。这里的 ResFlow 是组内提出的一种多任务交互结构，核心思想是在不同任务 Tower 的每一层之间传递残差信息，让 CTR、Item CTCVR、Shop CTCVR 等任务在逐层建模时保持信息流动，而不是只在底层共享或在最后独立预测。

这些模块各自解决过局部问题，但放在一起之后，系统开始呈现几个长期成本。

- **结构碎片化。** 多个异构模块堆叠，缺少统一计算范式。
- **计算冗余。** 不同模块之间存在重复的特征交互计算。
- **维护成本高。** 模块多、联合调优困难。
- **扩展性差。** 很难只靠增加层数或维度完成 Scaling Up。

所以，这次重构的目标不是"继续补模块"，而是把主干换成更适合规模化的统一结构。

## 2. 新架构：把特征组织成 Token

新模型保留原有 Embedding 和 Sequence 部分，将序列和非序列特征聚合后的表示 concat，再切割成指定维度的 Token。之后，Token 进入多层 RankMixer，最后接 3 个独立任务的 Task Tower，也就是 MMCN，分别预测 CTR、Item CTCVR 和 Shop CTCVR。

可以把这次升级理解成：从"人工设计多个特征交互模块"，转向"用统一 Token 主干自动学习高阶组合"。

RankMixer Block 主要由两个部分组成。

- **Token Mixer** 负责不同 Token 之间的信息混合。
- **PerToken FFN** 负责每个 Token 内部的非线性变换。

下面这张图展开到 Block 内部：Token Mixer 负责跨 Token 混合，PerToken FFN 负责每个 Token 内部的非线性变换。后续实验也围绕一个问题展开：哪些结构值得作为主线继续放大，哪些只是局部有效，哪些在当前规模下还不适合。

## 3. 结构消融：哪些选择真正有效

结构消融部分按决策顺序展开：数据怎么用，多任务怎么训，Token 怎么切，主干怎么放大，Tower 怎么接。

### 3.1 负采样：随机采样不如全量负样本 + Loss 加权

爆品团业务正负样本极度悬殊，尤其是 CTCVR 目标。初期尝试过随机负采样，负样本采样比例为 0.1，但 AUC 明显下降。最终采用的方案是保留全量负样本，并配合 Loss 加权，也就是正样本加权、负样本降权，最终 AUC 提升约 0.1%。

随机采样的问题在于，它容易丢失与正样本相似的难负样本，影响排序边界学习；同时也会改变训练集正负比例，破坏真实分布，影响概率校准。

Loss 加权的优势则是：保留足够多的负样本，让模型继续接触 Hard Negatives；同时在不破坏样本分布的前提下，平衡正负样本梯度贡献。

对于以 AUC 为核心指标的排序任务，负样本不是简单噪声。与其粗暴采样，不如保留信息，再用 Loss 权重调节梯度。

### 3.2 多任务学习：GradNorm 收益明确，但训练更贵

爆品团频道页同时优化 Shop CTCVR、Item CTR 和 Item CTCVR。多任务学习的难点不只是"多几个 Loss"，而是不同目标的数据密度和收敛速度都不一样。

- **转化数据稀疏。** 模型学习的是 CTCVR，线上再用 CTCVR / CTR 得到 CVR，pCVR 没有直接梯度监督，数值稳定性也更敏感。
- **多任务梯度存在竞争。** 各任务收敛节奏不一致，固定 Loss 权重很难兼顾所有目标。

我们尝试了 ESMM 约束和 GradNorm。

- **ESMM 约束** 通过 PCTCVR = PCTR × PCVR 直接学习 CVR，带来 CTCVR AUC +0.2%，但 CTR AUC -0.4%。
- **GradNorm** 通过动态调整 Loss 权重来平衡任务学习速率，CTCVR 持平，CTR AUC +0.7%。

ESMM 的问题是 CTCVR 梯度会反向传播到 CTR Tower，改变 CTR 特征表示，使 CTR 学到的特征混入 CTCVR 目标。因此，这里最终更偏向 GradNorm：它不改变模型结构，主要通过动态权重缓解任务学习节奏不一致的问题。它的收益比较明确，但代价也明确，训练 GFLOPs 约翻倍。

### 3.3 序列层：轻量改造有效，重替换未必收益

当前模型仍是两段式结构：先做序列建模，再将序列输出合入非序列 Token 中继续建模。我们尝试用其他结构替代原 MHA 和 EAT Based Target Attention。

- **HSTU** 使用 QKVU 无 Softmax 的类 Transformer 结构，AUC -0.44%。
- **Gated Attention** 在 MHA 和 ETA 后增加 Gated Attention，AUC +0.06%。
- **STCA** 堆叠多层 Cross Attention，AUC -0.32%。

这组实验说明，序列层不是换得越新越好。在当前实验中，收益最稳的是在原 Attention 后增加 Gated Attention。

### 3.4 Tokenization：Pad-Split 是简单有效的选择

Tokenization 决定了特征如何进入 RankMixer，也会影响信息损失、参数量和收敛难度。

- **Auto-Split** 是 block → allconcat → MLP → split → token，理论上可以学习最优投影，但大矩阵难学，效果最差。
- **Group-wise** 是 block → proj → token，每个 Token 语义更清晰，但存在信息损失和参数冗余。
- **Pad-Split** 是 block → allconcat → padding → split → token，优势是零信息损失，也不需要额外投影矩阵。
- **均衡 Group-wise** 会先合并为约 10 个大 block 再投影，可以缓解 block 不均衡，但仍然依赖人工划分。

实验结论很直接：Auto-Split 最差，Pad-Split 基本持平两类 Group-wise，差异在万分位量级。考虑实现复杂度，我们选择 Pad-Split 做后续迭代。

Pad-Split 能奏效，原因在于 RankMixer 的核心是 Token-Mixing。初始 Token 的语义边界不是唯一关键，Mixer 后续可以继续打乱、重组并学习有效组合。

Token 切割粒度也会影响效果。原始 allconcat padding 后维度为 5120，我们比较了 32 × 160 和 16 × 320。结论是适当增大 Token Dim、减少 Token 数量效果更好，AUC +0.14%。这里收益大概率来自 PerToken-AFFN 参数量和计算量的 Scaling Up。

### 3.5 RankMixer 层数：4 层收益显著，6 层边际下降

RankMixer 层数是 Scaling Up 的重要方式之一。

- **2 层** 作为 baseline。
- **4 层** AUC +0.21%，收益显著。
- **6 层** AUC +0.12%，仍有收益，但边际收益递减，拉长周期后的收益不显著。

从结果看，4 层是当前比较明确的收益点；6 层仍有提升，但边际收益已经下降。由于当前使用 PostNorm，对过深结构不够友好，因此 6 层之后没有继续扩层验证。

实验里还有一个有意思的现象：代码实现中曾经无意间丢失了 Mixup 后的 Add & Norm，后续补回后效果反而下降，AUC -0.2%。我们的解释是，Mixup 会重组各位置 Token 的语义，混合后的表示与原位置残差不一定对齐。直接相加可能稀释跨 Token 混合信号，甚至引入噪声。

### 3.6 Dense FFN：SwiGLU 和 AFFN v2 更值得保留

PerToken FFN 负责 Token 内部的信息变换，也是 RankMixer 中最直接影响参数量和计算量的部分之一。这里我们比较了 FFN、AFFN、SwiGLU 和 Soft MoE 等方案。以 FFN D→2D 作为 baseline，核心结论如下。

- **零成本替换优先看 SwiGLU D→4/3D。** 同 76M 参数、1.70 GFLOPs，AUC +0.07%。
- **有预算时 AFFN v2 性价比最高。** 额外 19M 参数、0.34 GFLOPs，AUC +0.13%。
- **单纯扩大容量不如换结构。** FFN D→4D 多 13M 参数、0.23 GFLOPs，但只带来 +0.06%，不如零额外成本的 SwiGLU D→4/3D。
- **Soft MoE 当前不适合 16 Token 场景。** 同 GFLOPs 下全线负收益，AUC 约 -0.10% 到 -0.14%。

因此，当前 Dense 方向里，SwiGLU 适合作为低成本替换，AFFN v2 适合有额外计算预算时使用。

### 3.7 Sparse MoE：当前配置下没有超过 Dense

Sparse MoE 我们尝试了多种结构，包括 Shared Router + Shared Experts、PerToken Router + Shared Experts、Shared Router + PerToken Experts，以及 PerToken Router + PerToken Experts。

但在当前 16 Token、专家数量和样本规模设定下，还没有观察到明显 Scaling Law，也没有超过 Dense AFFN。最优配置是 Shared Router & Experts、E=16、Top2、H=4/3D、aux=0.01，对应 77M 参数、1.9 GFLOPs，但仍不如线上 AFFN，也不如同资源下的 SwiGLU D→4/3D。

这说明 Sparse MoE 并不是加上就一定涨。对于推荐场景，Token 数量、位置语义、专家容量、路由稳定性和样本规模都很关键。当前阶段，Dense 仍然是更稳的主线；后续如果 Token 数量和样本量扩大，可以重新探索 Sparse MoE。

### 3.8 Task Tower 输入：Flat 比 Pooling 更适合后续放大

RankMixer Block 后，如何把输出送入 Task Tower，也做了对比。我们比较了三种方式：

- **Mean Pooling** 对 Token 维度做平均。
- **Task-Specific Attention Pooling (TSAP)** 为不同任务使用不同 Attention Pooling。
- **Flat Concat** 保留完整 RankMixer 输出，让 Task Tower 自己降维。

最终训练效果是：Mean Pooling < TSAP < Flat。Mean Pooling 效果较差，是因为最后一层 Token 之间并不会自然趋同，直接平均会损失信息。

Flat 的参数量和计算量更高，但保留的信息更完整，也更适合后续做 Task Tower Scaling Up。

吞吐量验证里还有一个反直觉结果：TSAP + 小 Task Tower 的参数量和计算量更小，但 RT 增加约 5ms，吞吐量从 100 降到 80。相比之下，Flat + 大 Task Tower 更适合 GPU 计算。这说明 FLOPs、参数量和线上 RT/吞吐量并不总是强正相关。

### 3.9 Task Tower：MMCN 收益最明显

Task Tower 输入为 RankMixer Flat 后的向量。这里我们对齐层数和降维比例，比较了 MLP、ResFlow MLP 和字节侧常用的 MMCN 结构。

- **MLP** 采用四层逐层降维，作为 baseline。
- **ResFlow MLP** 可以看作对旧 ResFlow 思路的轻量化复用：在多任务 Tower 之间做逐层残差传递，让不同任务的中间表示发生交互，多任务场景可用，AUC +0.07%。
- **MMCN** 使用 4-head 交叉结构，AUC +0.32%，是这组实验里收益最明显的结构。

MMCN 的 4-head 结构包括：2 个 head 做互相交叉，1 个 head 与原始输入交叉，1 个 head 引入 domain 信息或自身表示作为交叉项。它在当前 RankMixer Flat 输入下收益最明显。

继续扩大 MMCN 维度也能看到 Scaling Up 现象。基础配置为 [1024, 512, 256, 128]。如果减少层数到 [1024, 512, 256]，AUC -0.18%。将每层 Dim × 2，配置为 [2048, 1024, 512, 256]，AUC +0.12%。进一步扩到 [4096, 2048, 1024, 512]，更接近输入维度 5120，AUC +0.21%。继续加到 5 层 [4096, 2048, 1024, 512, 256] 时，训练出现 NaN。这也呼应了 Flat 输入的优势：保留完整 Token 表达后，Task Tower 仍有继续扩维的空间。

## 4. 三期实验：从 85M 到 243M

### 一期：RankMixer Base，验证新主干

**时间：2026-04-09** 配置：4 层 RankMixer + 3 个独立 MMCN，Token 为 32 × 160。

这一期先验证 RankMixer 主干是否值得替换旧模型。

- 离线：Dense 参数量从 85M 增加到 107M，GFLOPs 从 2.82 降到 2.2611，CTCVR AUC 从 0.8540 提升到 0.8601，约 +0.6%。
- 线上爆品团频道页：页面侧直引导访购率 +0.97%，人均净 G +1.14%。
- 大盘侧人均订单 +0.26%，人均净 G +0.30%。

从结果看，模型参数量增加，但计算量下降，离线和线上都有正收益。

### 二期：吞吐量结构优化 + GradNorm

**时间：2026-05-07** 配置：优化为 2 层 RankMixer，Token 调整为 16 × 320，并结合 GradNorm。

二期重点转向结构效率：在模型规模和推理计算量基本稳定的前提下，调整 Token 切分，并用 GradNorm 处理多任务学习节奏问题。

- 离线：Dense 参数量和推理计算量相对一期基本持平。训练计算量约翻倍，GFLOPs 从 2.26 增加到 4.78。吞吐量从 80 提升到 90，约 +12%。
- 主目标 CTCVR 持平，CTR AUC +0.7%。
- 线上爆品团频道页：页面侧直引导访购率 +0.27%，人均净 G +0.51%。
- 大盘实验分流样本中，人均订单 +0.32%，人均净 G +0.36%。
- 大盘回放样本中，人均订单 +0.04%，人均净 G +0.07%。

这一期重点不是单纯放大，而是在吞吐量、训练成本和多任务学习之间重新找平衡。

### 三期：Scaling Up 到 243M

**时间：2026-05-21** 配置：RankMixer 从 2 层扩到 4 层，Task Tower 维度扩大，模型规模从 107M 到 243M。

三期回到 Scaling Up 主线，继续增加 RankMixer 层数和 Task Tower 维度。

- 离线：Dense 参数量从 107M 增加到 243M，GFLOPs 从 2.26 增加到 5.1807，吞吐量从 90 降到 60。
- 效果上，CTCVR AUC +0.37%，CTR AUC 持平。
- 线上爆品团频道页：页面侧直引导访购率 +0.44%，人均净 G +0.40%。
- 大盘实验分流样本中，人均订单 +0.16%，人均净 G +0.15%。
- 大盘回放样本中，人均订单 +0.03%，人均净 G -0.00%。

此外，RankMixer 243M 也上线到超抢手业务：离线对比基线，CTCVR AUC +0.66%，CTR AUC +1.6%。在线实验中，页面侧直引导访购率 +1.09%，人均净 G +1.16%；大盘分流样本中，人均订单 +0.31%，人均净 G +0.21%；大盘回放样本中，人均订单 +0.14%，人均净 G +0.09%。这说明 RankMixer 243M 的收益并不只局限于爆品团单一场景。

## 5. 后续方向

这次实践后，我们对排序模型 Scaling Up 的理解更清晰了一些：它不是简单堆参数，也不是继续叠局部模块，而是要让模型主干、计算形态和任务 Tower 都更适合放大。

- **短期方向：** 继续探索更优的 PerToken FFN 结构，目标是在同 FLOPs 下获得更高 AUC。探索推理侧优化，例如通过算子融合、量化等方式降低 RT。
- **中长期方向：** 继续跟进 TokenMixer-Large、UniMixer、TokenFormer 等排序模型工作。沿着 Pure Model 范式寻找更优结构，重点关注吞吐量和 MFU 利用率。在更大规模下重新探索 Sparse MoE，当 Token 数量和样本量扩展后，Sparse MoE 的可行性仍值得重新评估。
