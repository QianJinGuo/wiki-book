# Softmax 与交叉熵的隐藏精度 Bug：Precision Cliff 与官方修法（DeepMind 2026）

> 📊 Level ⭐⭐⭐⭐ | 11.7KB

> **来源**：机器之心（2026-10-25）报道 Jonathan T. Barron / Dan Gnanapragasam / Michael Tschannen 的论文 *A Fix for Softmax and Cross-Entropy*（arXiv 2610.31642）| 原文存档：[原文存档](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651069889&idx=1&sn=f243963ab47a3c32471ca7d3319ef4c6)

主流深度学习框架（PyTorch、JAX、TensorFlow）普遍采用的 Softmax + 交叉熵标准实现，存在两个被忽视的数值精度 bug：模型越自信，梯度越可能算错，且在训练特定阶段会悄悄改变梯度、造成 loss 突然飙升甚至能力退化。作者给出的是**不提高浮点精度、不改损失函数定义**的修法——只重新组织计算顺序。

## Bug 一：Softmax Collapse（精度悬崖）

标准实现先减去最大 Logit 再做指数，这是经典防溢出技巧。但减完后最大项指数值为 1，其余是极小的正数，Softmax 分母实际变成「1 + 一个很小的数」；当这个小数小到浮点加法直接舍去时，分母被舍入成 1，正确类别概率被算成**精确的 1**，交叉熵损失变成 0，对应梯度也算成 0。与此同时其他错误类别的梯度仍保留微小非零值——而按交叉熵的数学定义，所有类别 Logit 梯度之和应为 0，这个约束被破坏。论文把这个突然失去精度的位置称为 **Precision Cliff（精度悬崖）**。

临界 Logit Margin（正确类别相对其余类别合计得分的优势）：

| 浮点格式 | 精度悬崖阈值 | 对应理论概率 |
|---|---|---|
| bf16 | 约 5.5 | 接近 1 |
| fp32 | 约 16.6 | 约 99.9999938% |
| fp64 | 约 36.7 | 接近 1 |

直观例子：Logit 为 `[9, -9, -9]`、第一类为正确答案时，标准 JAX/Optax 实现算出 CE=0、正确类别梯度=0；修复后的计算给出 CE≈3.046×10⁻⁸、正确类别梯度≈-3.046×10⁻⁸、另两类各≈1.523×10⁻⁸——数值虽小，却直接决定梯度是否满足数学约束。

## Bug 二：Softmax Cancellation（相消误差）

第二个缺陷是相消误差（Cancellation）：在数值相减的环节同样出现有效位丢失，与第一位一起构成标准 Softmax + CE 实现的两个数值计算缺陷。

## 修法：保留定义，重排计算

Barron 团队没有替换 Softmax 的指数函数（对比 2025 年 Prieto 等人的 StableMax 思路），而是保留原本的 Softmax 与交叉熵定义，重排计算过程：把最大 Logit 对应的项从指数求和中单独分离，再用数值稳定的 **softplus** 完成计算。对单一正确标签的交叉熵，修复后的公式让自动微分直接得到「正确类别梯度 = 其他类别梯度之和的相反数」，使极小的梯度能保留到浮点数确实无法表示为止。论文同时给出 JAX 参考实现，覆盖 Softmax 与 LogSoftmax 等路径。

## 为什么值得进 wiki

这属于**训练基础设施层的静默失效**：不抛异常、不报 NaN，只在模型高度自信时把正确类别的梯度抹成 0，仍保留其余类别的稀疏梯度，从而破坏梯度守恒关系并可能造成训练后期退化。它直接关联 [Transformer 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/transformer-architecture.md) 的分类头实现、混合精度训练（bf16 阈值最低，最容易踩到）与 [数值精度/推理优化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md) 的话题边界：这类 bug 不改变算法，但改变了「同一算法在有限精度下实际在优化什么」。实践含义是：在使用 bf16 训练、且模型已高度拟合（logit margin 易超 5.5）的场景，应优先采用修复后的 CE 实现或参考实现做 A/B，观察梯度范数与 loss 曲线的稳定性。

论文/实现入口：arXiv `2610.31642`（2026-10-22 提交），作者 Jonathan T. Barron、Dan Gnanapragasam、Michael Tschannen；研究过程中 Gemini 承担了相当多的实验工作。

## 深度分析

### 精度悬崖是浮点吸收的一般失效，Softmax 只是它的显影剂

论文给出的三个阈值看起来像经验拟合，其实是浮点格式的指纹。把有效位数换算成 unit roundoff u（bf16 = 2⁻⁸、fp32 = 2⁻²⁴、fp64 = 2⁻⁵³），临界 margin 几乎正好落在 ln(1/u)：

| 浮点格式 | unit roundoff u | ln(1/u) | 论文实测阈值 |
|---|---|---|---|
| bf16 | 2⁻⁸ ≈ 0.0039 | 5.55 | 约 5.5 |
| fp32 | 2⁻²⁴ ≈ 5.96×10⁻⁸ | 16.64 | 约 16.6 |
| fp64 | 2⁻⁵³ ≈ 1.11×10⁻¹⁶ | 36.74 | 约 36.7 |

机制一行能写完：减去最大值后分母是 `1 + Σ_{i≠max} e^{Δ_i}`，后半部分量级为 e^(−margin)；当它小于 1 附近的浮点间距，`1 + ε` 被舍入回 1，概率变成精确的 1，CE 与梯度一起归零。被触发的不是 Softmax 的性质，而是「把极小正数加到 O(1) 上」这个动作——同一动作出现在哪，悬崖就在哪：LayerNorm 的 `E[x²] − E[x]²`、残差里的小增量、零点附近的 `log(1+x)` 与 `exp(x) − 1`，都在同一族失效里。

所以它不是某个框架的实现缺陷（PyTorch、JAX、TensorFlow 同时中招，写的是同一个表达式），而是「表达式形状 × 数值格式」的组合属性——要修的是表达式，不是某一行 C++。审计因此可以前置：列出 kernel 里所有 `1 + tiny`、`a − b`（a≈b）、`exp(x) − 1`、`log(1 + x)`，就是候选清单，不必等 loss 尖峰报信。

### 「保留定义、重排算术」是可复用的三步动作

可迁移的不是 softplus 本身，而是三个动作：把主导项从求和里因式分解出来（max-trick 的推广）；在对数空间做减法，而不是在概率空间做减法；用 `expm1` / `log1p` / `softplus` 这类零点附近仍有正确相对误差的原语替代 `exp` 与 `log` 的组合。Collapse 用了第一与第三个，Cancellation 用了第二与第三个——同一模板的两次实例化。

摊到其他 kernel 上，落点很清楚。[注意力机制](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/attention-mechanism.md) 的 softmax 前向因减 max 而安全，但反向与 log-softmax 归一化会重新引入相消，这正是 flash-attention 类实现在线重缩放、累加器留 fp32 的原因。LayerNorm 方差写成 `E[x²] − E[x]²` 时两项都是 O(1)、差值很小，是最典型的 catastrophic cancellation，Welford 或两遍算法就是它的重排。RMSNorm 的均方非负、不产生相消，风险换成两处：`x²` 在 fp16 上溢，以及 eps 加在开方之内还是之外。[GPU Kernel](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gpu-kernel.md) 层常能一次做对，因为融合算子可在寄存器里挑表达式，不必走「存概率再取 log」的两段式路径。

### 伤害来自不变量被破坏，而不是误差的大小

3×10⁻⁸ 的误差在数值上微不足道，真正的问题是它打破了 `Σ_i ∂L/∂z_i = 0`：正确类别被抹成 0，其余类别仍以同量级外推，梯度不再是合法分布对数似然的导数，而是带净漂移的方向。优化器看不到「误差」，只看到一个自洽的更新信号。误差因此分两类：保不变量的只让结果变小，破坏不变量的会伪造出不存在的信号——后者才能放大成事故。

它必须和 Adam 的状态耦合才显形：梯度长期为 0 时二阶矩滑动平均持续衰减，一旦部分样本因权重衰减跌回悬崖内侧、梯度「复活」，同一个梯度会被放大成异常大的更新步——这就是论文用 Slingshot 解释尖峰的链条。更刺眼的是量纲上的巧合：默认 ε = 10⁻⁸ 对应的平衡 margin 是 ln(1/ε) ≈ 18.4，而 fp32 悬崖在 16.6，默认超参把工作点放在悬崖外侧约两个单位处，「Adam 的 ε 太小会不稳定」这条经验因此有了具体机制。

### 低精度训练与量化推理是重灾区，也是检测盲区

bf16 的悬崖只有 5.5，在已收敛的分类头或蒸馏任务里很容易越过；fp32 的 16.6 听起来安全，但模运算类任务里 margin 会长到几十。危险在可见性：没有 NaN、inf 或 shape 错误，loss 在悬崖内侧看起来完美（就是 0），而「置信度 100%」恰是训练想要的状态。等它表现为尖峰或准确率崩塌，排查会指向学习率、数据配比、权重衰减——全是合理嫌疑人，除了那一行 CE。

量化把同一形状挪到另一条链路。[量化技术](https://github.com/QianJinGuo/wiki-public/blob/main/entities/quantization-techniques.md) 里的 fp8/int8 kernel、KV cache 量化、低精度 softmax，都会在「输出几乎相同、只差一点点」的语义上失真：对纯前向 argmax 影响有限，对需要 logprob 差分的地方（[知识蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md)、RL 参考模型 KL、DPO 的 logprob 比）则是实质性的。论文的蒸馏实验给了干净上界：学生初始化为教师、理论上梯度恒为 0，bf16 下却持续偏离、准确率下降。[预训练与 SFT](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-pretraining-vs-sft.md) 的低精度微调同理——越到后期越靠近悬崖。

## 实践启示

1. **先换实现，再谈调参**。在 bf16 mixed-precision 训练里对 CE 与蒸馏损失各做一版 A/B，看后期尖峰次数、梯度范数与 logit margin 分布，而不是 loss 均值；论文模 31 任务上 94.3%±5.4% 与 100% 的差距可作量级参考。
2. **给数值 kernel 一份 dtype 参数化的精度测试**。取 logits = `[M, −M, −M]` 扫 M 穿过 ln(1/u)，断言 CE 随 M 单调、任何 dtype 都不塌成 0、且 `Σ grad == 0`（容差按该 dtype 的 u 给）；golden value 用 `[9, −9, −9] → 3.046×10⁻⁸`。不到一百行，却能拦住每次 kernel 重写。
3. **把「恒等应为零」写成断言，而不是容差**。关闭 dropout、师生 logits 完全相同时，蒸馏梯度、KL、DPO 的 logprob 差必须精确为 0；写成「小于 1e-6」会把真 bug 吃掉。
4. **不要用调 ε 或降 LR 治尖峰**。ε = 10⁻⁸ 的平衡 margin 18.4 刚好越过 fp32 的 16.6，把 ε 提到 10⁻⁷ 只是把工作点挪回悬崖内侧，错误本身没消除。
5. **怀疑数据前先跑一遍 fp64 对照**。同 seed、同数据跑低精度与 fp64 双份：若尖峰在高精度下消失，可直接归因到数值层，省掉一轮数据排查。
6. **守住低精度链路里「差一点」的语义**。凡要做概率差分的地方——蒸馏、RL 的 KL、logprob 排序、量化前后一致性——都在对数空间用 `expm1` / `log1p`，并把量化前后 KL 与梯度一致性纳入发布回归。

## 关联

- [Transformer 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/transformer-architecture.md)
- [推理优化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md)
- [AI Infra 数学基础：RMSNorm / Softmax / 因果掩码 / 采样](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-infra-math-foundations-rmsnorm-softmax-causal-mask-sampling-binnnliu-2026-06-17.md)
- → [原文存档](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651069889&idx=1&sn=f243963ab47a3c32471ca7d3319ef4c6)

---

