## Ch15.013 SFT, RL, and On-Policy Distillation Through a Distributional Lens

> 📊 Level ⭐⭐⭐ | 15.5KB | `entities/untitled-v2.md`

# SFT, RL, and On-Policy Distillation Through a Distributional Lens

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/untitled-v2.md)

## 摘要

本文从**分布重塑（Distributional Reshaping）**的视角审视后训练方法（SFT、RL、OPD），提出一个统一的几何直觉：语言模型是序列上的分布，后训练的本质是通过不同机制改变这一分布的形状。SFT 将模型拉向固定的外部数据集分布（等价于最小化前向 KL 散度），具有"覆盖所有模式"的特性，容易引发灾难性遗忘；RL 和 On-Policy Distillation（OPD）则通过 on-policy 数据约束更新方向，使其天然落在当前策略邻域内，遗忘更少。核心发现：**on-policy 数据是防止遗忘的关键加载成分（load-bearing ingredient）**，而非 RL 算法本身有什么特殊魔法；蒸馏 teacher 的质量远不如 on-policy 数据来源重要——可以用 brute-force SFT 训练 specialized 模型，再通过 OPD 将能力迁移到主模型而不显著损失原有能力。

## 核心命题

> **后训练方法之间的本质差异，不在于算法结构，而在于它们各自将模型分布拉向什么样的目标分布，以及这个目标分布与模型原始分布之间的距离有多远。**

将这个命题具体化：
- **SFT**：有一个预先存在的标注数据集，模型通过交叉熵被拉向该数据集分布。前向 KL 散度的"覆盖所有模式"特性导致在远离原始分布的区域产生无差别梯度更新。
- **RL**：模型从自身当前策略中采样，根据 reward 打分，然后更新参数以增加期望 reward。没有固定的外部目标分布。
- **OPD**：介于 SFT 和 RL 之间——有 teacher 信号（像 SFT），但数据来自学生自身（像 RL）。

## SFT：固定外部目标分布

### 几何解释

SFT 是最直接的后训练场景：用标注数据集（人工标注或强模型生成）对起始模型做交叉熵损失。

在分布视角下，当前模型是一个分布 $P_0$，数据集定义另一个分布 $P_{data}$。SFT 将 $P_0$ 拉向 $P_{data}$。由于负对数似然的数学性质，$P_0$ 的原始形状对最终结果没有任何影响——这正是 SFT 存在灾难性遗忘风险的根本原因。

如果 $P_{data}$ 与 $P_0$ 相距甚远，模型没有内在的驱动力去偏好"近邻解"，只能被简单地拉向数据集中展示的 token。这导致在整个分布范围内产生均匀的梯度更新——既包括与新任务相关的 token，也包括语法 token 和风格 token。

### 什么时候该用 SFT

SFT 最适合"冷启动型"任务：期望输出格式需要被彻底改变，且原有能力的退化是可接受的。例如：
- 从头训练遵循特定输出格式（如 JSON 结构、特定语言风格）
- 大规模格式遵从类任务（从自由文本转为结构化响应）

### 什么时候 SFT 会出问题

SFT 的失效模式在高风险场景中是不可接受的：
- 需要保留原有能力的任务（模型在 SFT 后出现代码能力退化）
- 目标分布覆盖了模型高频访问的区域（KL 散度大的重叠区）

解决方向：在训练数据中保留一定比例的原始能力相关样本，或在 SFT 后增加一轮 on-policy 过滤的 OPD 步骤。

## RL：最大期望奖励方向

### 几何解释

RL 的工作方式与 SFT 有根本性不同：模型从自身采样 $\rightarrow$ 用 reward 函数评分 $\rightarrow$ 通过 Policy Gradient 更新以增加期望 reward。

此时，"目标分布"的定义变得模糊。在 RL 中，隐含的目标分布可以定义为：所有满足"所有轨迹 reward 均为 1"的策略中，与当前策略 KL 散度最小的那个。

这个定义带来的关键推论：**RL 学习的实际上是在当前策略邻域内最近的任务解决策略**。每一次 policy gradient 更新，模型都在拟合一个与自身最接近的最优策略，而非一个任意的外部目标。

这解释了 RL 为什么比 SFT 遗忘更少：**on-policy 数据约束将更新方向限制在模型已经高频访问的区域**，隐式地实现了类似 KL 正则化的效果。

### RLHF vs. RLVR

RLHF（使用 Reward Model）和 RLVR（可验证 reward）在信号质量上有显著差异：

- **RLVR**：reward 可验证（如数学答案对错、代码能否通过测试），reward 方向是质量的可靠代理，移动沿 reward 方向通常能得到更好的模型
- **RLHF**：reward model 不完美，优化一个 biased proxy，可能过度拟合 reward model 的错误

这导致两者在信任域（trust-region）设置上的差异：RLVR 通常可以使用更激进的 trust-region（如 GRPO 替代 PPO），而 RLHF 需要更强的 KL 惩罚和更保守的 clipping。

### On-Policy Self Distillation（OPSD）

OPSD 是 OPD 的一种新变体，teacher 和 student 是同一模型，但在计算 teacher log 概率时提供 reference solution 作为前缀。这产生了一个 privileged information——teacher 知道正确答案的前缀，学生在自己生成的 prefix 上接受 teacher 的建议。

OPSD 揭示了一个有趣现象：**style token（如"wait"、"alright"）的 per-token KL 远高于 math token（如"power"、"exponent"）**。如果对这些高 KL token 应用激进的更新，模型可能崩溃。解决方案是引入 per-token clipping 机制，对高 KL token 使用独立的衰减策略。

这一发现对 [Skill Rm Qwen Agent Skill Reward Model](ch01-868-阿里qwen提出skill-rm-把奖励模型做成可复用agent-skill.html) 有直接启示：Skill-RM 的渐进式披露机制可以类比为 OPSD 的 per-token KL 分析——资源应该在需要时才激活，而不是一股脑全部暴露。

## 核心实验：OPD 的 teacher 来源重要吗？

### 实验设置

实验使用 Minimal Code Editing 任务：给模型一个有缺陷的函数，要求修复 bug 且不改变其他部分。测试两个维度：

1. **泛化能力**：在不同类型的 corruption 上评估
2. **灾难性遗忘**：在 LiveCodeBench 上评估代码生成能力是否退化

实验先分别用 SFT 和 RL 训练两个 teacher 模型，然后各自通过 OPD 蒸馏出学生模型。

### 关键结果

| Model | Pass@1 | Norm. Levenshtein | Added CC | LiveCodeBench v6 |
|-------|--------|-------------------|----------|------------------|
| Teachers | | | | |
| SFT teacher | 0.775 | 0.450 | 0.450 | 0.286 |
| RL teacher | 0.792 | 0.063 | 0.206 | 0.320 |
| Students (OPD) | | | | |
| OPD SFT teacher | **0.800** | 0.059 | **0.206** | 0.297 |
| OPD RL teacher | 0.787 | **0.055** | 0.228 | **0.314** |

### 反直觉发现

**OPD 学生普遍优于各自的 teacher**。甚至更反直觉的是：

- OPD SFT teacher 的学生（来自 SFT teacher，但 teacher 本身在 LiveCodeBench 上有退化）遗忘**少于 SFT teacher 自己**
- 两个 OPD 学生的 LiveCodeBench 分数差异极小（0.297 vs 0.314），尽管 teacher 差距明显（0.286 vs 0.320）

### 为什么 OPD 学生能超越 teacher

**关键洞察**：teacher 的质量没那么重要，**on-policy 数据来源**才是决定性因素。

OPD 中，teacher 提供信号，但数据的 state distribution 来自学生自己。这带来了两个优势：

1. **靶向监督**：OPD 的监督信号落在学生实际需要改进的区域——teacher 对学生自己生成的前缀提供建议，而非对学生可能很少访问的分布区域
2. **KL 匹配不等于 reward 最大化**：teacher 的 logit 分布携带了风格、不确定性、替代延续和推理结构的信息，匹配这些信息可以改善学生的采样行为，即使 teacher 贪婪采样的输出本身并不更优

这为多阶段能力融合提供了可行路径：**先用 brute-force SFT 训练 specialized 模型（不管遗忘问题），再通过 OPD 将其能力蒸馏到主模型而不显著损失原有能力**。

## 为什么 RL/OPD 遗忘更少：三种解释

### 解释一：前向 KL vs. 反向 KL

SFT 通过交叉熵等价于最小化**前向 KL**（$KL(P_0 || P_{data})$），前向 KL 具有"覆盖所有模式"的特性——为覆盖目标分布的所有峰，会在广泛区域产生梯度更新。

Chen et al. 的工作表明 RL 可以被理解为**反向 KL**（$KL(P_{data} || P_0)$），在多峰分布中会优先覆盖单个峰而非所有峰，因此遗忘更少。

**批评**：这个解释在有显式 KL 正则化时成立，但 RL 即使移除 KL 惩罚仍表现出抗遗忘特性，因此该解释不完整。

### 解释二：RL 有更稀疏但更关键的参数更新

Mukherjee et al. 发现 RL 更新只作用于模型的一个小子网络（稀疏但全秩），而 SFT 产生密集更新。Yuan et al. 发现 SFT 的参数更新冗余度更高——当减少参数量时，RL 性能下降更快。

**批评**：这些结果在特定领域成立，但不一定具有普遍性；OPD 如何嵌入这一图景也不清晰。

### 解释三（作者最认同）：On-Policy 数据约束

来自 Shenfeld et al. 的理论工作：每次 policy gradient 更新实际上是在拟合当前策略邻域内最近的任务解决策略。

用 REINFORCE + 二元 0/1 reward 理解：reward 充当过滤器，reward=1 的样本提供正训练信号，reward=0 的提供零贡献。所有满足"所有轨迹 reward=1"的策略构成集合 $P^*$，训练过程收敛到 $P^*$ 中与当前策略 KL 散度最小的那个。

**这意味着 on-policy 数据约束将训练过程限制在一个与当前策略 KL 距离很小的邻域内**，而 SFT 的目标分布可能是任意遥远的。

## 深度分析

### 分布视角的工程价值

将后训练方法映射到"分布重塑"的框架下，有几个实际的工程价值：

**第一，它提供了一个统一的语言来比较不同的后训练方法**。过去工程师谈论 SFT、RL 和 OPD 时，往往是在描述算法细节，而忽略了这三种方法实际上在解决同一个几何问题（"将分布 P0 变成什么形状"）。

**第二，它帮助预测失效模式**。如果知道 SFT 的问题是"无差别拉向目标分布"，那么在设计训练数据时就应主动减少与原始能力无关的样本比例；如果知道 RL 的优势来自"邻域内最优"，那么在设计 reward 函数时就应确保 reward 信号在模型高频访问区域有足够的覆盖。

**第三，它指向了 OPD 的正确使用方式**。既然 on-policy 数据是关键，那么 OPD 的工程重点应该是"如何构建高质量的 on-policy 数据"而非"如何设计更好的 teacher"。

### OPSD 的 per-token KL 发现与 Skill-RM 的关联

OPSD 实验发现 style token 的 per-token KL 远高于 math token，这意味着某些 token 上的梯度更新实际上是在无关紧要的风格层面浪费计算资源。

这与 [Skill Rm Qwen Agent Skill Reward Model](ch01-868-阿里qwen提出skill-rm-把奖励模型做成可复用agent-skill.html) 中"append resources 反而降分"的消融实验形成强烈呼应：把大量资源（rubric、checklist、verifier）一股脑 append 进 prompt，等价于对所有 token 无差别地增加信息密度，结果是 key signal 被稀释。OPSD 的 per-token clipping 机制和 Skill-RM 的渐进式披露机制，本质上是在解决同一个问题：如何让关键信息在需要的地方出现，而不是均匀分布在所有地方。

### 多阶段后训练流水线的选择逻辑

当前主流的 post-training 流水线（Pre-train → SFT → RL → OPD）中，不同领域对方法的选择有明显的规律：

- **Math 和 Code**：偏好 RL（可验证 reward，信号偏差低，可以采用更激进的 trust-region）
- **创意写作和知识密集型任务**：偏好自蒸馏或蒸馏类方法（reward 噪声高，密集的 token 级监督反而更稳定）

这提示了一个原则：**算法选择本质上是信号密度、偏差和 on-policy 属性之间的权衡**。没有任何单一方法在所有场景下最优。

## 实践启示

### 1. 在需要保留原有能力的场景，有限度地使用 SFT

SFT 的灾难性遗忘不是不可避免的，但需要清醒认识到其"无差别拉向目标分布"的本质。建议在任务切换幅度大、原有能力退化可接受的场景使用 SFT，并在训练数据中保留一定比例的原始能力相关样本以缓解遗忘。

### 2. 优先考虑 on-policy 机制来保护原有能力

无论是 RL 还是 OPD，on-policy 数据都是防止遗忘的核心要素。当现有流程依赖 SFT 且遗忘问题严重时，可以考虑在 SFT 后增加一轮 on-policy 采样 + 过滤的 OPD 步骤，从数据源头引入策略约束。

### 3. 根据 reward 质量选择 post-training 方法

在 reward 可验证的领域（数学、代码），RLVR 是更自然的选择，即使移除显式 KL 惩罚也能保持稳定；在 reward 噪声高的领域（创意写作、复杂推理），可考虑 self-distillation 或 OPD，并在训练中引入 token 级 clipping 防止对高 KL style token 的过度更新。

### 4. 可以用 brute-force SFT 训练 specialized 模型，再通过 OPD 迁移

实验表明 on-policy 数据源比 teacher 来源更重要。这意味着即使 SFT teacher 本身有遗忘问题，通过 OPD 蒸馏出来的学生遗忘也更少。这为"先训练专家模型，再迁移到通才模型"的多阶段 pipeline 提供了可行路径。

### 5. 监控 per-token KL 而非仅关注最终 reward

OPSD 的研究发现 style token 的 per-token KL 显著高于 math token。建议在任何 distillation 流程中监控 per-token KL 分布，对高 KL token 引入独立的 clipping 或衰减机制，以防止模型崩溃。

### 6. 关注 RL 和 OPD 的稀疏更新特性

如果你的训练基础设施支持灵活的更新策略，可以考虑模仿 RL 的稀疏更新机制——只更新与当前任务最相关的参数子集，而非全量更新。这可能带来更好的任务特化与能力保留的平衡。

## 相关实体

- [Skill Rm Qwen Agent Skill Reward Model](ch01-868-阿里qwen提出skill-rm-把奖励模型做成可复用agent-skill.html)
- [Skill Hub Organization Asset Winty](ch07-001-skill-hub-企业级-ai-经验资产化的关键-组织能力视角-winty-前端q-3-篇合集-组织资产-质量.html)
- [Skill Design Spec 8 Block Checklist Winty](ch07-004-企业级-skill-8-块最小骨架-8-条-checklist-设计规范.html)
- [Hermes Self Evolution Closed Loop Skill Reuse Winty](ch07-017-hermes自进化完整闭环-skill创建复用修补链路.html)
- Normalizing Trajectory Models

---
