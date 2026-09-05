---
sha256: 002ad022dc7cbd0216385a4d0bb4346c523b6d22b6c3a0bfd9f4e7bae154b33b
source: wechat
source_url: https://mp.weixin.qq.com/s/i1M1fan_jpuNeLDxweKekw
ingested: 2026-07-14
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-13
---
source: wechat
source_url: https://mp.weixin.qq.com/s/i1M1fan_jpuNeLDxweKekw
ingested: 2026-07-14
source_published: 2026年7月13日 14:31
---

# 无需视觉 tokenizer，北大PRA解锁自回归图像生成潜力，135M模型性能反超1.9B基线

过去几年，扩散模型几乎定义了高质量图像生成：从随机噪声出发，经过多轮迭代，逐步 “雕刻” 出一张图像。但随着大语言模型席卷人工智能领域，另一条路线正迅速走到舞台中央 —— 图像，能否也像语言一样，通过自回归方式逐步生成？如果图像也能沿用同一套建模逻辑，视觉生成将更容易接入现有大模型体系，语言、图像乃至更多模态，也可能由此共享更加一致的模型架构与训练范式。

  

而在图像自回归的不同路线中，直接建模原始像素（pixel space) 是最彻底的一种。它绕过额外的视觉 tokenizer，不再需要先将图像压缩成离散 token，也减少了编码、量化带来的信息损失与系统割裂。

  

然而，pixel-space AR 长期面临生成质量不佳的问题。来自北京大学和深势科技的研究者通过系统实验分析了制约其生成效果的瓶颈，并基于此提出了 Parallel Rollout Approximation（PRA）。在 ImageNet-1K 256×256 类条件生成任务上，135M 参数的 PRA-Small 已超过此前十亿参数级别的 pixel-space AR 模型；511M 参数的 PRA-Large 进一步达到 FID 1.94，刷新了 pixel-space AR 图像生成的性能水平。

  

  

  * 论文标题：Parallel Rollout Approximation for Pixel-Space Autoregressive Image Generation  

  * 论文链接：https://arxiv.org/abs/2606.27978  

  * 代码链接：https://github.com/MangataX/PRA

  * 作者：Jiayi Xu、Di He、Guolin Ke

  * 机构：北京大学、深势科技（DP Technology）

  

图 1：PRA 在更小参数规模下显著降低 FID，并展示 PRA-Large 生成样例。

  

Pixel-space AR 难在哪里？

  

在 pixel-space AR 中，每个 pixel patch 都具有双重角色：它既是当前步骤需要生成的目标，也是后续步骤依赖的上下文输入。因此，pixel-space AR 的困难也可以从两个方向拆解：作为输出，高维连续 pixel patch 本身是否难以生成；作为输入，前面生成的 patch 一旦带有误差，是否会在后续自回归过程中继续传播。作者的诊断实验正是围绕这两个问题展开。

  

在输出端，作者设计了一组对比诊断实验：同样在 pixel-space 下，将 AR 模型与 diffusion 模型 JiT 放在相同设置下对比，并控制自回归序列长度不变，观察 token 维度变化带来的影响。结果显示，当 token 维度较低时，AR 与 JiT 的差距并不大；但当 token 维度从 48 增加到 768 后，AR 的 FID 明显恶化，与 diffusion 模型的差距迅速拉大。这说明，pixel-space AR 的第一个瓶颈在于高维连续 token 的单步生成难度更大。

  

在输入端，作者进一步考察训练 — 推理不一致带来的影响。AR 训练通常采用 teacher forcing，模型看到的是干净的 ground-truth prefix；但推理时，模型只能依赖自己前面生成的 patch。实验显示，对输入 token 注入噪声可以明显改善 AR 性能，说明让训练输入更接近推理时的 “非完美输入” 确实有效。但这种改善仍然有限。简单噪声注入并不能真正模拟模型推理时生成出来的 token 分布；而真正的 on-policy rollout 又代价过高，效率难以接受。

  

这组诊断实验最终揭示了 pixel-space AR 的两个核心瓶颈：高维 pixel token 带来的单步预测误差，以及 teacher-forced 训练与自回归推理之间的分布不匹配。二者相互耦合，使采样过程中的误差不断累积并被放大。PRA 后续的两个设计，正是分别针对这两个问题提出的。

  

PRA：降维 + 并行 rollout 近似

  

针对上述两个瓶颈，PRA 分别从输出端和输入端进行改造：在输出端，用低维中间态替代高维 pixel token，降低单步生成难度；在输入端，用并行构造的 decoded pixel inputs 来近似 rollout 输入，缓解训练 — 推理分布不一致。

  

先预测低维中间态，再解码回像素

  

在输出端，PRA 不再让 AR 模型直接预测高维 pixel patch，而是预测一个低维中间态 。在主实验中，这个中间态只有 16 维，而原始 pixel token 维度为 。具体来说，AR Transformer 先根据之前的 pixel patch 产生 hidden state，diffusion head 再基于这个 hidden state 生成低维中间态 。随后，pixel decoder 将  解码回像素空间，得到当前 pixel patch：

  

  

这样，AR 模型每一步的生成目标从 768 维像素 patch 变成低维中间态，单步预测难度大幅下降。

  

需要强调的是，PRA 并不是传统 latent-space AR。这个中间态不是由外部 tokenizer 提供的 latent，而是和 AR 模型端到端一起学习出来的。虽然 PRA 在模型内部引入了中间态，但每一步都会通过 pixel decoder 回到像素空间；推理时，模型仍然保持 pixel-in、pixel-out 的 pixel-space AR 接口。

  

并行构造 rollout-like 输入

  

低维中间态降低了输出端的单步生成难度，但输入端的训练 — 推理不一致问题仍然会导致生成误差随着自回归过程逐步累积。理想情况下，训练时也应该让模型看到类似推理 rollout 中生成出来的 pixel inputs。但真正执行 on-policy rollout 成本非常高：自回归生成本身是串行的，并且每个 token 的生成还需要 diffusion head 进行多步采样。

  

因此需要找到一种方法，既可以较好地模拟推理时的输入分布，又能保持 teacher-forced 训练的并行性。

  

PRA 的做法是：训练时不真的串行生成完整序列，而是对目标中间态加噪，模拟 diffusion head 采样时可能产生的偏差，再通过同一个 pixel decoder 得到 decoded pixel inputs。这些 decoded pixel inputs 会作为 AR Transformer 的训练输入。

  

由于它们经过了和推理阶段相同的 “中间态 → 像素” 路径，因此比干净的 ground-truth pixel 和简单地在 pixel-space 加高斯噪声更接近推理时模型实际看到的输入分布，同时又可以并行构造。这就是 Parallel Rollout Approximation：用并行构造的 decoded pixel inputs，近似推理 rollout 中模型会遇到的输入分布，从而缓解训练 — 推理分布不一致的问题，减少误差在自回归过程中的累积。

  

图 2：PRA 与传统 teacher-forced AR 的训练和推理流程对比。

  

实验：显著推进 pixel-space AR

  

作者在 ImageNet-1K 256×256 类条件生成任务上验证 PRA。图像被切成 16×16 patch，自回归序列长度为 256，每个原始像素 token 维度为 768。论文评估了三个不同规模的模型：PRA-Small、PRA-Base 和 PRA-Large，参数量分别为 135M、250M 和 511M。

  

结果显示，PRA 在 pixel-space AR 上取得了显著提升。仅 135M 参数的 PRA-Small 达到 FID 2.58，超过 1.9B 参数的 FARMER-1.9B/8（FID 3.60）。也就是说，PRA-S 参数量只有后者约十四分之一，却取得了更好的生成质量。随着模型规模继续增大，PRA 的表现进一步提升：PRA-Base 达到 FID 2.21，PRA-Large 达到 FID 1.94，将 pixel-space AR 的最佳 FID 从 3.60 推进到 1.94。

  

这一结果尤其值得注意，因为 PRA 并没有依赖外部 tokenizer，也不是两阶段 latent-space 生成方法。它仍然保持端到端训练与 pixel-in、pixel-out 的 pixel-space AR 接口，却将 pixel-space AR 推进到更具竞争力的水平。这说明，pixel-space AR 过去效果不佳并不意味着这一路线本身不可行；更可能是因为高维预测和训练 — 推理不一致这两个核心问题没有被同时处理好。

  

生成之外：pixel-space AR 的理解能力

  

除了生成效果，PRA 在视觉理解上也展现出潜力。论文在 ImageNet linear probing 上评估模型表征能力，PRA-Large 的 top-1 accuracy 达到 68.80%，明显高于多个 AR 和 diffusion baseline。这表明，端到端 pixel-space AR 不仅可以生成高质量图像，也能学到对图像理解更有用的视觉表征。

  

总结

  

PRA 重新证明了 pixel-space AR 的潜力。

  

过去，直接在像素空间做自回归生成长期表现不佳，核心原因在于高维 pixel token 带来的单步预测误差，以及训练 — 推理不一致造成的误差累积。PRA 通过低维中间态和并行 rollout 近似，同时针对输出端和输入端进行改造，在不依赖外部 tokenizer 的情况下显著提升了生成质量。

  

值得关注的是，PRA 不仅能生成高质量图像，也展现出较强的视觉表征能力。这意味着 pixel-space AR 可能不只是图像生成路线之一，也有潜力成为连接视觉生成、视觉理解和多模态大模型的一条重要路径。

  

从这个角度看，PRA 的意义不只是 FID 从 3.60 推进到 1.94，而是让一个长期困难但极具吸引力的方向重新变得可行：直接在原始像素空间中，用与大语言模型一致的自回归范式，学习既能生成、也能理解的视觉表征。

  

  
  
  
**「蚂蚁InTech奖」倒计时申报中** 蚂蚁InTech奖是由蚂蚁集团发起，面向对计算机领域科研进步有关键推动作用的中国青年学者、青年博士颁发的纯公益性奖项，分为蚂蚁InTech科技奖与蚂蚁InTech奖学金。2026届蚂蚁InTech奖将于7月17日24时截止申报，有意向申报的学者/同学欢迎扫描海报中二维码进行申报。© THE END 转载请联系本公众号获得授权投稿或寻求报道：liyazhou@jiqizhixin.com
