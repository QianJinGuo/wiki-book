---
title: "ECCV 2026 Long Oral｜MIMFlow：以 MIM 重塑语义潜空间，构建 Normalizing Flow 端到端生成新范式"
source_url: "https://mp.weixin.qq.com/s/iErWLKomHZ0H9JF-cMrE2A"
source_name: "大模型智能"
author: "大模型智能（来源南京大学，编辑极市平台）"
type: "raw"
created: 2026-09-06
ingested: 2026-09-06
tags: [normalizing-flow, masked-image-modeling, image-generation, latent-space, variational-autoencoder, end-to-end-generation, ecv-2026, mimflow, token-bottleneck, nju]
sha256: 35871479cc7979b558e2f8ec348f932ef005dd4b6167c8fb1368c993d4fed4b7
---

# ECCV 2026 Long Oral｜MIMFlow：以 MIM 重塑语义潜空间，构建 Normalizing Flow 端到端生成新范式

> 账号：大模型智能 | 来源：南京大学 | 编辑：极市平台 | 论文：arXiv 2606.26016（ECCV 2026 Long Oral）

## 一句话概括

MIMFlow 要解决的核心矛盾是：Normalizing Flow 擅长精确建模分布，却会因为严格可逆而把大量建模容量分配给低层细节；Masked Image Modeling 擅长逼出高层语义，却往往与真正的生成模型分阶段训练。MIMFlow 把两者接到同一条端到端训练链路中：

- Masked ViT Encoder 从被随机遮挡的图像中提取全局信息；
- Learnable Token Bottleneck 用固定数量的查询 token 汇聚语义，形成稳定、紧凑的连续 latent；
- Latent Normalizing Flow 对该 latent 做精确密度估计与反向采样；
- Generative ViT Decoder 负责像素重建和高频纹理合成。

它不是简单地给现有生成模型增加一个 MIM 辅助损失，而是重新划分生成任务中的职责：传统 Flow 被要求同时处理两项性质不同的任务——一是建模对象、轮廓和布局等全局结构，二是保留毛发、边缘和噪声等局部细节。MIMFlow 重新分工：Encoder 提取全局语义，Flow 建模语义 latent 的概率分布，Decoder 合成高频细节。

论文的主要结果包括：

- 在 ImageNet 256×256 类别条件生成上，MIMFlow-L 达到 FID 2.50；
- 相比参数规模接近的 SimFlow-L，FID 从 3.72 降至 2.50，下降 32.8%；
- latent 只使用 128 个 token，比常见的 256-token latent 减少 50%；
- latent 的 ImageNet 线性探测准确率达到 71.3%，说明它不只是便于重建，也确实包含更强的类别语义；
- 在相同 8×H800 设置下，相比 SimFlow-L，训练显存下降 28%，吞吐提升约 10%，单图采样时间接近减半。

## 什么 Normalizing Flow 会被像素细节「拖住」？

归一化流（Normalizing Flow，NF）的吸引力来自一套非常干净的数学机制：模型学习一个可逆映射，把复杂的数据分布变换成简单的高斯分布。由于变换可逆，它既能对所建模空间中的样本计算精确密度，也能从高斯噪声反向得到样本。在 MIMFlow 中，这种精确密度估计发生在 latent 空间。

问题也恰佮来自「可逆」二字。判别模型可以主动丢掉背景纹理、传感器噪声等与语义无关的信息；而 NF 为了维持双射，原则上必须解释输入空间中的每个维度。当 latent 混合了物体类别、轮廓、布局、毛发、草地纹理和随机噪声时，Flow 无法只选择自己最关心的部分。大量容量因此消耗在高频局部统计上，真正决定全局结构的语义反而得不到足够建模。

这也是为什么「把 NF 做得更深、更大」并不一定是最高效的答案：如果输入流形本身复杂而冗余，增加容量可能只是在更认真地拟合冗余。

## MIM 提供了一个反直觉的突破口

Masked Image Modeling（MIM）会先遮住图像的大量 patch，再要求模型恢复缺失内容。由于局部像素已经不可见，编码器不能只复制纹理，只能依据剩余区域推断物体、结构和上下文。换句话说，遮挡天然形成了一个信息瓶颈：

- 看不全，模型就必须做全局推断；
- 不能依赖局部复制，latent 就更偏向语义；
- latent 更紧凑，后续密度模型面对的分布也更简单。

但把 MIM 直接接到 NF 上并不容易。经典 MAE 只编码可见 patch，不同 mask 会产生不同长度、不同位置结构的序列；这对需要稳定输入维度的 NF 很不友好。SimMIM 虽然保留固定长度，但被遮挡 token 与可见 token 的信息密度差异很大，随机 mask 会让 latent 分布持续抖动。

此外，已有不少「生成式 tokenizer」方法先用 MIM 训练 tokenizer，再冻结 latent、单独训练生成模型。这样虽然改善了表示，但 tokenizer 与生成模型仍然是两个阶段，重建最优的 latent 未必就是密度建模最容易的 latent。

MIMFlow 的关键变化是：不再把 MIM 当作生成之前的预训练工具，而是让它直接参与语义潜空间与生成分布的共同塑形。

## MIMFlow：用遮挡把「语义建模」和「纹理合成」拆开

MIMFlow 由三个核心模块组成：Masked Encoder、Latent Normalizing Flow 和 Generative Decoder。整个过程概括为：Masked Image 加噪 →（密度估计与采样）同时（图像重建）。

### 1. Learnable Token Bottleneck：给 NF 一个固定、紧凑的建模对象

对于 256×256 图像，MIMFlow 使用 16×16 patch，一共得到 N=256 个图像 token。训练时随机遮挡其中 40%–60%，再额外拼接 K 个可学习查询 token。所有 token 一起进入双向 Transformer，但编码结束后，模型只保留这 K 个查询 token。论文默认设置为 K=128、每个 token 64 维。

这些查询 token 类似一组主动的信息「收集器」：它们通过 self-attention 从可见 patch 和上下文中汇聚信息，却不需要与某个固定图像位置一一对应。这一设计同时解决了三个问题：

- 长度稳定：无论随机遮住哪些 patch，NF 始终接收固定的 128 个 token；
- 物理压缩：K<N 强制编码器放弃部分局部冗余；
- 语义聚合：要从不完整图像恢复全图，查询 token 必须更多地记录对象、轮廓和布局。

为便于连续密度建模，训练时还会向 latent 加入固定尺度的高斯噪声：默认 σ=0.3。这一步对 latent 流形做适度平滑，避免分布过于尖锐；但噪声过小或过大都会影响训练，后文的消融实验也验证了这一点。

### 2. Latent Normalizing Flow：只对「语义流形」做精确密度估计

MIMFlow 可以从 VAE 的角度理解：编码器给出近似后验，解码器负责重建，而传统 VAE 的简单高斯先验被高容量 NF 先验替代。不同之处在于，NF 看到的不是完整图像压缩后仍包含大量纹理的 latent，而是经过随机遮挡与 learnable token bottleneck 塑形后的表示。Flow 的任务因此从「同时记住语义和每一处像素波动」，变为「在局部冗余更少、全局语义更突出的潜空间上做概率建模」。

训练时，NF 将 ẑ 映射到标准高斯并计算精确负对数似然；生成时则反过来，从高斯样本经 NF 逆变换得到 latent，再交给解码器生成图像。论文采用改进的 STARFlow-L 作为 NF 主干，约 482M 参数。这里真正重要的并不是换了一个更大的 Flow，而是 Flow 的输入分布被重新设计了。

### 3. Generative ViT Decoder：把高频细节留给更合适的模块

MIMFlow 没有要求 NF 独自承担完整图像生成。Generative ViT Decoder 接收 128 个 latent token，并结合一组可学习的图像位置 embedding，通过注意力恢复全部 256 个图像 patch。这样形成了清晰分工：

- Encoder 负责从残缺输入中抽取全局结构；
- NF 负责学习语义 latent 的概率分布；
- Decoder 负责将语义展开成像素，并补足毛发、边缘、光照等高频细节。

这种「解耦」不是把两个独立系统简单拼起来。Encoder、NF 与 Decoder 在第一阶段从头开始联合优化，latent 会同时受到重建目标和概率建模目标约束，因此它既要可解码，也要容易被 Flow 建模。

### 4. 联合目标：表示、重建与生成一起优化

MIMFlow 的重建损失由像素和 LPIPS 感知损失组成；NF 则提供 latent 的负对数似然。此外，模型可以使用轻量辅助解码器，从 latent 预测 DINO 与 CLIP 等预训练模型的高层特征。最终第一阶段目标为三者加权和。

这里有一个容易被忽视的细节：MIMFlow 虽然使用遮挡输入，但重建损失覆盖完整图像。消融显示，过度提高 masked patch 的重建权重反而会让模型偏向局部补洞，损害全局语义流形。

## 两阶段训练：先对齐流形，再补回锐利纹理

**第一阶段：90 个 epoch 端到端联合训练。** Masked ViT Encoder、NF 与 Generative ViT Decoder 从头联合优化；输入 mask ratio 在 0.4–0.6 之间随机采样；全局 batch size 为 256，优化器为 AdamW；latent 使用 128 个 token、每个 token 64 维，并加入 σ 的高斯噪声；训练目标同时覆盖重建、Flow 似然和可选的 DINO+CLIP 语义监督。这一阶段的重点是让三方共同决定 latent 的形状：它不能只追求重建，也不能只追求分类语义，而要成为一个既可生成、又容易做精确密度估计的连续空间。

**第二阶段：2 个 epoch 解码器对抗微调。** 第一阶段已经得到结构清晰的 latent，但纯重建与感知损失容易产生偏平滑的结果。因此第二阶段冻结 Flow，加入 patch discriminator，仅微调解码器。该阶段只负责恢复锐利纹理，不再改变 NF 已经学到的 latent 分布。也就是说，语义流形先稳定下来，高频外观再由解码器「精修」。

## 生成结果：同规模 NF 的 FID 降低 32.8%

论文在 ImageNet 256×256 类别条件生成上评估 MIMFlow。核心结果如下（gFID 越低越好）：

| 方法 | latent token 数 | 参数量 | 使用 guidance 的 gFID |
|---|---|---|---|
| SimFlow-L | 256 | 475M | 3.72 |
| FAE-NF-XXL | 256 | 1.4B | 2.67 |
| STARFlow-XXL | 1024 | 1.4B | 2.40 |
| MIMFlow-L | 128 | 482M | 2.50 |

MIMFlow-L 与 SimFlow-L 参数量接近，但 gFID 从 3.72 降至 2.50，相对下降 32.8%。更值得注意的是，MIMFlow-L 只用 128 个 latent token，却超过了 1.4B 参数的 FAE-NF-XXL（FID 2.67），并接近同为 1.4B 参数、使用 1024 token 的 STARFlow-XXL（FID 2.40）。

不使用 guidance 时，MIMFlow-L 仍取得 FID 3.64、IS 158.6、Precision 0.78、Recall 0.60。较小的 guidance 前后差距说明，模型学到的 latent 本身已经较为结构化，不需要完全依赖外部引导来纠正类别语义。

需要准确理解这组结果的边界：MIMFlow 的突出优势主要发生在 Normalizing Flow 范式内部。当前最强的扩散或自回归模型在 ImageNet FID 上仍可能更低；论文的贡献不是宣称统一击败所有生成路线，而是显著缩小 NF 与主流生成模型的差距，同时保留精确密度估计、可逆建模和端到端优化的优势。

## 128 个 token 带来的不只是压缩，还有真实的系统收益

Transformer 型 Flow 的计算与序列长度高度相关。MIMFlow 将常见的 256-token latent 压缩到 128 token，因此即使参数量略高，实际训练和推理仍更省资源。在相同的 8×H800 设置下：

| 模型 | token | 参数量 | 训练显存 | 训练速度 | 单图采样时间 |
|---|---|---|---|---|---|
| SimFlow-L | 256 | 475M | 52.3 GB | 2.83 it/s | 0.020 s |
| MIMFlow-L | 128 | 482M | 37.6 GB | 3.11 it/s | 0.011 s |

对应的收益是：训练显存减少约 28%；训练吞吐提升约 10%；单图采样时间减少约 45%。

论文附录还在 H20 上单独控制 NF 主干、只改变 token 数进行延迟测试：

| token 数 | 训练延迟（ms/iter） | 推理延迟（s） |
|---|---|---|
| 128 | 183 | 1.60 |
| 256 | 352 | 3.64 |
| 1024 | 1515 | 25.3 |

从 1024 token 降到 128 token，训练加速 8.3 倍，推理加速 15.8 倍。这两张效率表采用不同硬件与测试设置，数值不应直接混合比较，但都指向同一个结论：更语义化的 latent 不只是「看起来更好」，还允许 Flow 用更短序列完成生成。

## Ablation Highlights：真正起作用的是「遮挡形成的结构约束」

### 1. Learnable token 本身并不够，mask 才是关键转折

论文给出了一组逐步消融，在相同 10K 样本、无 CFG 的设置下依次加入组件：

| 配置 | rFID | gFID | IS |
|---|---|---|---|
| 端到端 SD-VAE 基线，256 token，含 GAN | 2.74 | 11.24 | 86.0 |
| + Learnable token，移除 GAN | 4.15 | 19.52 | 63.1 |
| + DINO+CLIP 辅助损失 | 14.75 | 18.71 | 91.0 |
| + 0.4–0.6 随机遮挡 | 3.81 | 10.14 | 105.2 |
| + GAN 微调，完整 MIMFlow | 1.47 | 6.15 | 130.0 |

只换成 learnable token 并不会自动改善生成，加入语义监督后 gFID 也只从 19.52 小幅降至 18.71。真正的大幅变化出现在 mask 加入之后：gFID 直接降至 10.14，并超过原始 GAN 基线。这组实验很重要，因为它排除了一个更简单的解释——MIMFlow 的收益并不主要来自「换了 tokenizer」或「蒸馏了 DINO/CLIP」，而来自稳定且足够强的信息瓶颈改变了 latent 分布。最后的 GAN 微调再负责把 rFID 和纹理质量拉高。

### 2. 为什么最佳 mask ratio 是 0.4–0.6？

在 50-epoch 消融设置中：

| mask ratio | gFID | 线性探测准确率 |
|---|---|---|
| 不遮挡 | 29.00 | 56.6% |
| 0.2–0.4 | 24.47 | 54.2% |
| 0.4–0.6 | 12.82 | 71.3% |
| 0.6–0.8 | 15.92 | 65.9% |
| None 与 0.4–0.6 混合 | 26.98 | 45.7% |

遮得太少，模型仍可依赖局部复制，高频信息会继续泄漏进 latent；遮得太多，可见上下文不足，重建与语义推断都会变难。0.4–0.6 在「迫使全局推理」和「保留足够证据」之间取得了最好平衡。

更有意思的是，随机混用「不遮挡」和「遮挡 0.4–0.6」反而明显退化。这说明 NF 不只需要平均意义上的好特征，还需要统计性质稳定的 latent 家族。训练分布时而保留全部细节、时而强制语义压缩，会让 Flow 同时面对两类复杂度不同的流形。

线性探测准确率从不遮挡时的 56.6% 提升到 71.3%，与 UMAP 中更清晰的类别聚类相互印证：MIMFlow 的 latent 确实更偏向可判别语义，而不只是更适合某一个生成指标。

### 3. 128 个 token 是容量与泄漏之间的平衡点

| latent token 数 K | rFID | gFID | Precision | Recall |
|---|---|---|---|---|
| 64 | 5.61 | 12.78 | 0.71 | 0.65 |
| 128 | 3.60 | 12.46 | 0.70 | 0.66 |
| 192 | 24.59 | 30.42 | 0.57 | 0.57 |

64 token 已经可以生成，但重建信息略显不足；128 token 在重建、gFID 与 Recall 上取得更好的整体平衡。继续扩大到 192 token 后，性能反而大幅下降。作者给出的解释是：latent 太宽会给模型留下「绕过瓶颈」的空间，高频噪声重新流入 NF，使原本的语义—纹理解耦失效。这个现象说明，在 MIMFlow 中 token 数不是越多越好，压缩本身就是模型设计的一部分，而不是单纯的效率技巧。

### 4. 高层语义监督有帮助，低层 HOG 可能适得其反

辅助目标中，DINO+CLIP 组合取得最佳 gFID 12.46；加入低层 HOG 特征后，部分配置显著退化，DINO+HOG 甚至训练崩溃。这与 MIMFlow 的设计逻辑一致：辅助监督应该鼓励 latent 保留对象和语义，而不是再次把局部梯度、边缘等高频统计塞回瓶颈。并非「监督越多越好」，监督信号的层次必须与 latent 的职责一致。

### 5. Jacobian 频谱说明：Flow 学到的变换更平滑、更稳定

NF 的 Jacobian 描述局部空间被怎样拉伸或压缩。如果最小奇异值过小，映射接近奇异；如果条件数过大，微小扰动可能被极端放大，数值优化也会更困难。实验显示，MIMFlow 的最小奇异值整体更大、更稳定，同时对数条件数更低且分布更集中。这支持了论文的核心解释：当 Flow 不再被迫拟合大量像素级细节时，它不需要进行过度的空间扭曲，可以学到条件更好的可逆映射。需要注意，频谱结果是对机制解释的支持证据，而不是单独的因果证明；但它与 FID、线性探测和消融结果形成了较一致的证据链。

### 6. 语义主要由 Encoder 提供，而不是在 Flow 深处自然「长出来」

论文还沿 Flow 深度做了线性探测：经过更多 NF block 后，分类准确率并没有持续提升，部分位置甚至下降。这揭示了 NF 的一个重要特性：它擅长分布变换，却不天然等价于逐层语义抽象。因此，让 Encoder 通过 MIM 先构造好语义空间，再让 Flow 专注密度估计，并不是可有可无的工程拆分，而是与两类模块的能力边界相匹配。

## 与已有路线相比，MIMFlow 的不同在哪里？

- **与传统 MIM 自监督学习相比**：MAE、SimMIM 等方法的主要目标是学到可迁移表征，生成通常不是训练闭环的一部分。MIMFlow 则让 mask 直接改变生成 latent 的分布，并让该分布同时接受重建和精确似然约束。
- **与 MAETok、DeTok 等生成式 tokenizer 相比**：生成式 tokenizer 通常先训练 latent，再冻结 tokenizer、训练另一个生成模型。MIMFlow 从一开始就联合训练 Encoder、NF 和 Decoder，避免「重建效果很好，但生成模型很难学习」的阶段错配。
- **与 SimFlow 等端到端 NF-VAE 相比**：SimFlow 已经证明 VAE 与 NF 可以从头联合训练，但其 latent 仍可能携带大量局部细节。MIMFlow 新增的核心不是「端到端」本身，而是端到端框架中的 masked semantic bottleneck。
- **与扩散和自回归模型相比**：MIMFlow 不试图把 NF 改造成另一种扩散模型或 token-by-token 自回归模型。它保留了 NF 的精确密度估计与可逆变换，同时通过更合适的 latent 降低建模难度。这是一条改善 NF 本身的路线，而不是替换其基本范式。

## 论文的边界与下一步

MIMFlow 的结果很有说服力，但目前仍有清晰边界：

- 任务范围有限：实验集中在 ImageNet 256×256 类别条件生成，尚未验证文本到图像生成中的长文本对齐、属性绑定和组合关系；
- 结论不能直接外推到所有生成范式：论文验证的是 latent NF；MIM 是否同样改善扩散模型或自回归模型，需要单独研究；
- 指标仍以传统生成评估为主：FID、IS、Precision/Recall 与线性探测提供了多角度证据，但仍不能覆盖所有感知质量和语义一致性；
- 更高分辨率与更大数据规模尚待验证：128-token bottleneck 在 ImageNet 256×256 上有效，但面对开放域、高分辨率图像时，最佳容量可能不同。

这些限制并不削弱论文的核心发现，反而指出了值得继续探索的问题：如果遮挡可以把 NF 的输入流形变得更简单，那么同样的「先塑形 latent、再建模分布」思路，是否能扩展到文本条件、多尺度生成乃至视频？

## 核心结论

MIMFlow 最值得关注的地方，不只是把 FID 做到 2.50，而是给 Normalizing Flow 提供了一个不同于单纯堆参数、转而重塑建模对象的优化方向：与其让 Normalizing Flow 费力拟合一个充满像素冗余的 latent，不如先通过掩码和信息瓶颈重塑潜空间，让 Flow 专注建模更稳定的全局语义。

随机遮挡迫使 Encoder 抓住全局结构，learnable token 将这些结构压缩成稳定的连续表示，NF 在语义流形上完成精确密度估计，Decoder 再负责恢复高频纹理。三个模块各做自己更擅长的事，又通过端到端目标共同决定 latent。

从更广的视角看，MIMFlow 也说明表示学习与生成建模并不一定要分成两个阶段。MIM 不只是一个预训练技巧，也可以成为生成系统内部的结构约束；而高质量生成的关键，有时并不是让 Flow 承担更多信息，而是先把 latent 塑造成更适合它建模的全局语义空间。

## Links

- Paper: https://arxiv.org/pdf/2606.26016
- Project / Code: https://github.com/MCG-NJU/MIMFlow

Citation: Chen Y, Xu X, Wang S, Zhang X, Guo Q, Ge T, Wang L. MIMFlow: Integrating Masked Image Modeling with Normalizing Flows for End-to-End Image Generation. arXiv:2606.26016, ECCV 2026。**

说明：本文依据 arXiv v3 论文、论文附录与官方代码仓库撰写；论文已被 ECCV 2026 接收，官方仓库标注为 Oral。文中指标如无特殊说明均来自原论文，不同表格可能采用不同样本数、guidance、硬件或训练设置。