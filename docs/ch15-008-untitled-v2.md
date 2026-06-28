## Ch15.008 untitled v2

> 📊 Level ⭐⭐ | 4.9KB | `entities/untitled.md`

## 深度分析

将后训练方法置于"分布 reshaping"的框架下审视，为理解 SFT、RL 和 On-Policy Distillation（OPD）之间的本质差异提供了统一的几何直觉。SFT 通过交叉熵将模型拉向一个固定的外部数据集分布，这一过程等价于最小化前向 KL 散度。由于前向 KL 具有"覆盖所有模式"的特性，当目标分布与模型原始分布相距甚远时，模型会被迫在广泛区域内做出均匀的梯度更新——既包括与新任务相关的 token，也包括风格类 token 和语法类 token——从而产生灾难性遗忘。这一分析将 SFT 的常见失效模式置于了严格的理论基础上，而非仅停留在经验观察。 See also [Harness Engineering](ch05-010-harness-engineering-ai.html)

RL 与 OPD 之所以表现出更强的抗遗忘能力，关键在于两者的训练都基于 on-policy 数据：模型从自身当前策略中采样，然后根据 reward 或 teacher 信号更新参数。Shenfeld et al. 的理论工作揭示，在每一步 policy gradient 更新中，RL 实际上是在拟合当前策略邻域内最近的"最优策略"——即所有满足"所有轨迹 reward 均为 1"这一条件的策略中，与当前策略 KL 散度最小的那个。这意味着 on-policy 约束天然地将更新方向限制在模型已经高频访问的区域，隐式地实现了类似 KL 正则化的效果。这一几何视角解释了为何 OPD 的学生模型即使蒸馏自表现较差的 SFT teacher，也能继承远比 teacher 更少的遗忘——因为学生是在自身分布上学习，而非在 teacher 的外部数据分布上。

关于 OPD 学生为何能超越 teacher本身，一个重要因素在于蒸馏监督的靶向性。传统蒸馏中，学生仅接收 teacher 生成的轨迹；但在 OPD 中，teacher 对学生自己生成的前缀提供建议，这意味着监督信号恰好落在学生实际需要改进的区域。此外，KL 匹配并非 reward 最大化——teacher 的 logit 分布携带了关于风格、不确定性、替代延续和推理结构的信息，匹配这些信息可以改善学生的采样行为，即使 teacher 贪婪采样的输出本身并不更优。将这一现象放在分布塑造的视角下理解比逐 token 分析更具启发性：学生实际上是在扩展其分布中高 reward 区域的概率质量，而非简单复制 teacher 的具体轨迹。

当前主流的 post-training 流水线（Pre-train → SFT → RL → OPD）中，Math 和 Code 任务普遍偏好 RL，而创意写作和知识密集型基准则更多受益于自蒸馏或蒸馏类方法。这一分化背后的逻辑在于：可验证 reward（RLVR）的信号偏差较低，可以采用更激进的 trust-region 设置；而在 reward 噪声较高的领域（如创意写作），蒸馏提供的密集 token 级监督反而更稳定。这提示我们，不存在一种在所有场景下最优的后训练算法——算法选择本质上是在信号密度、偏差和 on-policy 属性之间权衡。

## 实践启示

- **在需要保留原有能力的场景有限度地使用 SFT**：SFT 的灾难性遗忘并非不可避免，但需要清醒认识到其"无差别拉向目标分布"的本质。建议在任务切换幅度大（如格式遵从类任务）且原有能力退化可接受的场景使用 SFT，并在训练数据中保留一定比例的原始能力相关样本以缓解遗忘。

- **优先考虑引入 on-policy 机制来保护原有能力**：无论是 RL 还是 OPD，on-policy 数据都是防止遗忘的核心要素。当现有流程依赖 SFT 且遗忘问题严重时，可以考虑在 SFT 后增加一轮 on-policy 采样 + 过滤的 OPD 步骤，从数据源头引入策略约束。

- **根据 reward 质量选择 post-training 方法**：在 reward 可验证的领域（数学、代码），RLVR 是更自然的選擇，即使移除显式 KL 惩罚也能保持稳定；在 reward 噪声高的领域（创意写作、复杂推理），可考虑 self-distillation 或 OPD，并在训练中引入 token 级 clipping 防止对高 KL style token 的过度更新。

- **蒸馏 teacher 的质量并非唯一决定因素**：实验表明 on-policy 数据源比 teacher 来源更重要。这意味着可以用 brute-force SFT 先训练一个 specialized 模型，再通过 OPD 将其能力蒸馏到主模型而不显著损失原有能力，为多阶段能力融合提供了可行路径。

- **关注 per-token KL 而非仅关注最终 reward**：OPSD 的研究发现 style token 的 per-token KL 显著高于 math token，若不加区分地应用 aggressive 更新会导致模型崩溃。建议在任何 distillation 流程中监控 per-token KL 分布，对高 KL token 引入独立的 clipping 或衰减机制。

---
