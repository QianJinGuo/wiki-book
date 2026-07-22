# Parallel Rollout Approximation (PRA) — 像素空间自回归图像生成

## Ch01.1222 Parallel Rollout Approximation (PRA) — 像素空间自回归图像生成

> 📊 Level ⭐⭐⭐ | 10.3KB | `entities/peking-pra-pixel-space-ar-image-generation-2026.md`

# Parallel Rollout Approximation (PRA) — 像素空间自回归图像生成

北京大学和深势科技的研究者提出 Parallel Rollout Approximation（PRA），突破了像素空间自回归图像生成（pixel-space AR）长期面临的质量瓶颈。135M 参数模型在 ImageNet-1K 256×256 类条件生成任务上已超越此前十亿参数级别的 pixel-space AR 模型。

像素空间 AR 是最彻底的自回归图像生成路线——它直接在原始像素空间建模，绕过额外的视觉 tokenizer，无需先将图像压缩成离散 token，减少了编码、量化带来的信息损失与系统割裂。但其长期面临生成质量不佳的问题。

PRA 通过系统实验分析了制约 pixel-space AR 生成效果的瓶颈并提出了针对性方案。PRA-Small（135M 参数）已超过 1.9B 参数基线，PRA-Large（511M 参数）达到 FID 1.94，刷新了 pixel-space AR 图像生成的性能水平。

## 核心要点

- **问题定位**：pixel-space AR 存在两个核心瓶颈——高维 pixel token 的单步预测误差（输出端），以及 teacher-forced 训练与自回归推理之间的分布不匹配（输入端）。二者相互耦合，使采样过程中的误差不断累积放大。
- **降维输出**：PRA 不再让 AR 模型直接预测高维 pixel patch（768维），而是先预测一个低维中间态（16维），再通过 pixel decoder 解码回像素空间，大幅降低单步预测难度。
- **并行 rollout 近似**：训练时对目标中间态加噪，模拟 diffusion head 采样偏差，再通过同一个 pixel decoder 得到 decoded pixel inputs 作为 AR Transformer 的训练输入，以并行方式近似串行 rollout 的输入分布。
- **端到端设计**：中间态并非来自外部 tokenizer，而是与 AR 模型端到端一起学习。推理时模型仍然保持 pixel-in、pixel-out 的 pixel-space AR 接口。
- **理解能力提升**：PRA-Large 在 ImageNet linear probing 上达到 68.80% top-1 accuracy，证明 pixel-space AR 不仅能生成高质量图像，也能学到对图像理解有用的视觉表征。

## 技术背景：Pixel-Space AR 的困境

Pixel-space AR 将图像视为 pixel patch 序列，以自回归方式逐个生成。与 latent-space AR（如 VAR、LlamaGen）不同，它不依赖外部 VAE/VQ-VAE tokenizer，而是直接在原始像素空间建模。这种方法更"纯粹"——绕过额外的编码-量化-解码流程，减少了信息损失和系统复杂性。然而，在 PRA 提出之前，pixel-space AR 的生成质量始终远低于 diffusion 模型和 latent-space AR。

作者通过实验诊断揭示了两个核心困难：

在**输出端**，通过对比 AR 与 diffusion 模型（JiT）在相同设置下的表现发现，当 token 维度从 48 增加到 768 后，AR 的 FID 明显恶化，与 diffusion 的差距迅速拉大。这说明高维连续 token 的单步生成是核心瓶颈。

在**输入端**，teacher forcing 训练让模型看到干净的 ground-truth prefix，但推理时模型只能依赖自己前面生成的 patch。对输入 token 注入噪声可以改善性能，但简单的噪声注入并不能真正模拟推理时的 token 分布；真正的 on-policy rollout 又因串行生成 + diffusion head 多步采样而成本过高。

## PRA 方法详解

### 低维中间态预测

PRA 的核心创新是将 AR 模型的预测目标从原始 pixel patch 改为低维中间态。具体来说：AR Transformer 先根据之前的 pixel patch 产生 hidden state，diffusion head 再基于这个 hidden state 生成低维中间态 z（实验中仅 16 维），随后 pixel decoder 将 z 解码回像素空间得到当前 pixel patch。

这使 AR 模型每一步的生成目标从 768 维降至 16 维——单步预测难度下降近 50 倍。关键的是，这个中间态是与 AR 模型端到端联合学习的，而非来自外部 tokenizer 的静态 latent。因此 PRA 不是传统 latent-space AR，而是"内部降维"的 pixel-space AR。

### 并行 Rollout 近似

低维中间态解决了输出端问题，但输入端的训练-推理不一致问题仍然存在。PRA 的做法是：训练时不真的串行生成完整序列，而是对目标中间态加噪，模拟 diffusion head 采样时可能产生的偏差，再通过同一个 pixel decoder 得到 decoded pixel inputs。这些 decoded pixel inputs 会作为 AR Transformer 的训练输入。

由于它们经过了和推理阶段相同的"中间态→像素"路径，因此比干净的 ground-truth pixel 和简单地在 pixel-space 加高斯噪声更接近推理时模型实际看到的输入分布，同时又可以并行构造。这就是 "Parallel Rollout Approximation"：用并行构造的 decoded pixel inputs，近似推理 rollout 中模型会遇到的输入分布。

## 实验结果

在 ImageNet-1K 256×256 类条件生成任务上的评估显示：

| 模型 | 参数量 | FID ↓ |
|------|--------|-------|
| PRA-Small | 135M | 2.58 |
| PRA-Base | 250M | 2.21 |
| PRA-Large | 511M | 1.94 |
| FARMER-1.9B | 1.9B | 3.60 |

PRA-Small（135M）以不到 FARMER-1.9B 十四分之一的参数量，取得了更好的生成质量（FID 2.58 vs 3.60）。PRA-Large 的 FID 1.94 将 pixel-space AR 的最佳水平从 3.60 推进到 1.94。

此外，PRA-Large 在 ImageNet linear probing 上达到 68.80% top-1 accuracy，明显高于多个 AR 和 diffusion baseline，证明其学到的视觉表征具有通用性。

## 深度分析

### 1. "纯"自回归路线的复兴意义

PRA 重新证明了 pixel-space AR 路线的可行性。过去这一路线长期表现不佳，导致研究社区几乎放弃了在像素空间直接做自回归的想法，转而采用 latent-space AR 或 diffusion。PRA 表明，核心问题不在于像素空间自回归这个方向本身，而在于高维预测和训练-推理不一致这两个工程问题没有被同时处理好。一旦这两个瓶颈被突破，pixel-space AR 可以在更小的参数量下达到极具竞争力的生成质量。

### 2. 统一视觉与语言建模架构的路径

PRA 最重要的长期意义在于：它让"用与大语言模型一致的自回归范式学习视觉表征"这一目标更加可行。如果视觉生成不再需要专门的 diffusion 架构或 VAE tokenizer，而是可以在与文本相同的自回归框架下实现，那么多模态模型的架构统一就有了更坚实的基础。这对于下一代真正"原生多模态"的基础模型设计具有启示意义。

### 3. "内部降维" vs "外部 tokenizer"的设计哲学

PRA 的低维中间态是端到端学习出来的，而非依赖外部 tokenizer 的静态 latent。这一设计选择意味着：中间态会随着训练动态调整，为 AR 模型提供最优的预测目标。这与 latent-space AR（如 VAR）形成了鲜明的设计哲学对比——前者追求端到端的内部表示学习，后者依赖预训练的感知压缩模块。PRA 的成功表明，在某些场景下，内部学习的降维可能比外部 tokenizer 更高效。

### 4. 并行近似串行的范式价值

Parallel Rollout Approximation 的核心洞见在于：通过精心设计的加噪和共享解码路径，可以在并行训练中近似串行推理的输入分布。这种"并行近似串行"的范式不仅适用于图像生成，也可能为其他面临训练-推理不一致问题的自回归任务提供思路——如长文本生成、代码生成等领域。

### 5. 从生成到理解的表征通用性

PRA 在 linear probing 上的表现说明，pixel-space AR 学到的视觉表征同时服务于生成和理解两个目标。这与语言模型中的"生成即理解"现象形成了有趣的呼应——或许在视觉领域，最自然的生成范式也是最有利于表征学习的范式。这对多模态统一的长期目标至关重要：如果视觉生成和视觉理解可以使用同一种架构、同一个训练范式，那么多模态融合将从"拼接"走向"原生"。

## 实践启示

1. **诊断是改进的前提**：PRA 的工作流程值得借鉴——先通过系统实验定位瓶颈（输出端高维预测困难、输入端训练-推理不一致），再针对性设计解决方案。在没有明确诊断之前就直接"堆改进"往往是低效的。

2. **端到端降维优于外部 tokenizer**：对于面临高维预测困难的任务，内部学习的低维中间态可能比依赖外部预训练 tokenizer 更灵活、更高效。这一思路可以推广到其他高维生成任务（如视频生成、3D 生成）。

3. **训练-推理不一致是自回归模型的"隐藏税"**：这不仅影响图像生成，在语言模型的 beam search、代码生成的执行反馈、长文本生成的 exposure bias 中都可能出现。PRA 的并行近似方法为此类问题提供了一种可借鉴的思路。

4. **参数量不等于质量**：PRA-Small 以 135M 参数超越 1.9B 参数的 FARMER，说明模型架构设计和训练策略优化有时比"堆参数量"更有效。在资源受限的场景下，这提供了一种务实的技术路线参考。

5. **关注架构统一的多模态方向**：PRA 让 pixel-space AR 的生成质量达到有竞争力水平，意味着在统一的纯自回归架构下实现图像和文本建模的长期目标又近了一步。关注这一方向的发展，可能捕捉到下一波多模态架构变革的先机。

- 论文：[Parallel Rollout Approximation for Pixel-Space Autoregressive Image Generation](https://arxiv.org/abs/2606.27978)
- 代码：[github.com/MangataX/PRA](https://github.com/MangataX/PRA)
- 作者：Jiayi Xu、Di He、Guolin Ke
- 机构：北京大学、深势科技（DP Technology）

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/peking-pra-pixel-space-ar-image-2026.md)

---

