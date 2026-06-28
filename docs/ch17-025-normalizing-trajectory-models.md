## Ch17.025 Normalizing Trajectory Models

> 📊 Level ⭐⭐⭐ | 6.0KB | `entities/normalizing-trajectory-models.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/normalizing-trajectory-models-v2.md)

## 摘要
Normalizing Trajectory Models (NTM) 是 Jiatao Gu 等人于 2026 年 5 月提交至 arXiv 的新型扩散模型变体，专注于解决少步生成（few-step generation）场景下传统扩散模型假设失效的核心问题。传统扩散模型将采样分解为大量小步高斯去噪——这一假设在生成被压缩至少数几步时物理上不成立。NTM 的核心创新在于：将每一步 reverse 过程建模为 expressive conditional normalizing flow，并通过精确似然训练实现端到端优化。在文生图基准上，NTM 仅用 4 步采样即可匹配或超越强基线，同时唯一保留对生成轨迹的精确似然计算能力。
本文于 2026 年 5 月 8 日提交至 arXiv，作者团队来自 Apple ML Research。

## 背景问题：少步生成的困境
扩散模型（DDPM、Flow Matching 等）的采样通常需要数十至数百步去噪，导致推理成本高昂。现有的少步加速方法分为三类：

- **Distillation（蒸馏）**：将多步教师模型的知识蒸馏至少步学生模型，但训练不稳定且需要大规模数据
- **Consistency Training（一致性训练）**：强制不同噪声水平下的样本映射至同一直流，核心思路接近 consistency model，但牺牲了似然框架
- **Adversarial Objectives（对抗目标）**：引入 GAN式判别器提升少步质量，但失去精确似然，无法进行概率评估
上述方法有一个共同缺陷：**均放弃了似然框架**，这在压缩评估、异常检测、模型选择等下游任务中是致命的。

## 核心创新
### 条件归一化流建模每步 Reverse 过程
NTM 的核心架构决策是将每步 reverse 去噪过程建模为**条件归一化流（Conditional Normalizing Flow）**。归一化流通过可逆变换实现精确似然计算，但传统上每步独立建模时表达能力受限。NTM 的解法是：

- **每步内（within-step）**：使用浅层可逆（invertible）块，保证该步内的精确似然可计算
- **跨步（across-step）**：引入深层并行预测器，捕捉整个生成轨迹上的依赖关系
这种"浅层可逆 + 深层跨步"的设计在表达能力和计算效率之间取得了工程折中：每步只做轻量变换，用跨步的深度网络补充表达力，避免了深层可逆网络的高计算成本。

### 精确轨迹似然与自蒸馏
NTM 的精确轨迹似然（exact trajectory likelihood）使其天然支持**自蒸馏（self-distillation）**：一个轻量级去噪器可以在 NTM 模型自身的 score 基础上进行微调，产出高质量 4 步采样结果。这意味着 NTM 可以"自我压缩"——无需外部多步教师模型，自己教自己完成少步化。

### 预训练初始化
NTM 支持从预训练的 flow-matching 模型初始化，这利用了 flow matching 的线性轨迹假设。Flow matching 通过线性插值噪声和真实数据预测向量场，NTM 将这一线性预测过程参数化为条件归一化流，从线性轨迹出发逐步学习更复杂的反转动态。这一特性显著加速了 NTM 的收敛。

## 深度分析
### 架构哲学：精确描述 vs. 实用速度
NTM 的定位是**保留完整似然框架的少步方法**，这使其与单纯追求速度的方法（GAN-based、adversarial distillation）本质不同。速度不是唯一目标；**保持概率语义**——即能够精确计算 p(x|z)——同样重要。在需要严格概率计数的场景（如数据压缩、异常检测、生成质量评估），NTM 的优势是其他少步方法无法替代的。

### 与 Consistency Models 的本质区别
Consistency Models（CM）通过强制不同 t 时刻的输出与 t=0 的一致来实现少步化，本质上是一种隐式的蒸馏，丢失了似然信息。NTM 保留了精确似然，可以进行困惑度（perplexity）计算，这使得两种方法面向不同的应用场景：CM 适合对质量要求极高、对概率评估无需求的场景；NTM 适合需要概率输出的场景。

### 少步化的理论基础
传统扩散模型的"多步小步"假设在数学上对应于对 score 函数进行 Euler-Maruyama 积分。当步数极少时，积分误差主导，输出质量崩溃。NTM 通过学习每步的完整条件归一化流绕过了这一积分近似——不再依赖"小步累积"，而是直接学习粗粒度的条件变换。这在理论上解释了为什么 NTM 在 4 步下仍能保持高质量，也为进一步压缩至 2-3 步提供了方向。

## 实践启示
### 部署建议
- 若部署场景需要 **4-8 步采样**，NTM 值得关注——在步数预算内提供精确似然输出
- 自蒸馏机制提供了一个将大模型能力压缩到小采样器的**正规框架**，而非依赖启发式 distillation，适合需要可控压缩比的团队
- NTM 可从预训练 flow-matching 模型热启，若已有 Flow Matching 部署基础设施，迁移成本较低

### 研究方向
- **其他领域的自蒸馏**：自蒸馏机制在强化学习（self-play）、语言模型（self-reward）中有类似应用，NTM 将这一范式引入扩散模型，值得在视频生成、3D 生成等领域探索
- **轨迹级概率**：精确轨迹似然使得在生成轨迹级别而非样本级别进行评估成为可能，这对研究扩散模型的隐式偏差（implicit bias）有重要价值

### 注意事项
- 浅层可逆块的表达能力是否足够支撑复杂任务（如高分辨率文生图）仍需更大规模验证
- 4 步采样的质量上限是否接近其实用上限，以及更多步数（8-16）时是否仍有优势

## 相关实体
- Normalizing Trajectory Models
- Normalizing Trajectory Models

---
