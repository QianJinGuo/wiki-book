## Ch15.031 Generalization Dynamics of LM Pre-training — Jiaxin Wen

> 📊 Level ⭐⭐⭐⭐ | 27.8KB | `entities/generalization-dynamics-lm-pretraining.md`

## 核心要点

- **Published Time**: Mon, 18 May 2026 16:00:33 GMT
- **作者**：Jiaxin Wen, Zhengxuan Wu, Dawn Song, Lijie Chen
- **发布博客**：jiaxin-wen.github.io/blog/generalization-dynamics
- **研究对象**：OLMo3 (7B/32B) 和 Aperture (8B/70B)，两个全开放模型，释放全部数据和检查点
- **核心发现**：LLM 在预训练过程中并非稳定地从"鹦鹉学舌"演化为通用智能，而是频繁且突然地在两种模式之间跳跃（mode-hopping）
- **评估套件**：6 个 toy 评估任务 + 2 个 fine-tuning-based 评估
- **三大应用**：预训练检查点选择、预训练数据选择、泛化预测因子测试
- **关键证伪**："越简单泛化越好"这一假设过于简化

## 研究背景与动机

### 为什么泛化能力至关重要

构建通用 AI 而不谈泛化能力是可以实现的，但意义有限。我们需要的是能够学习深层、可迁移结构的智能体，而非只会匹配浅层模式的鹦鹉。真正的泛化能力将解锁当今许多关键开放问题：

- **数据高效学习（在线学习）**
- **Shortcut learning**：从可验证领域（数学、编程）向更广泛非可验证但经济价值领域的迁移
- **一致人格保持**：能够与人类价值观真正对齐的连贯角色

### 鹦鹉与智能体的计算区分

鹦鹉与智能体的区别是计算层面的：

| 鹦鹉（Parrot） | 智能体（Intelligence） |
|--------------|---------------------|
| 重复 in-context 模式 | 推断 in-context 函数 |
| 将人格编码为断开连接的事实和特征袋 | 学习连接所有内容的共享人格表示 |
| 记忆推理步骤 | 形成通用推理电路（实体跟踪、回溯、抽象概念如"真"） |

**然而，这种区别可以通过行为探测。** 例如，给定提示，我们可以根据行为判断模型是选择诱人的"answer+1"模式还是真正做数学：

> Q: 8 - 7=? A: 1  
> Q: 1 + 1=? A: 2  
> Q: 192 - 189=? A: 3  
> Q: 68 - 60=? A: **Parrot: 4** / **Intelligence: 8**

## 评估套件设计

研究团队构建了六个评估任务来探测智能与鹦鹉的行为指纹，外加两个 fine-tuning-based 评估：

### 6 个主要评估任务

| 任务 | 泛化问题 | 训练示例 | 测试示例 |
|------|---------|---------|---------|
| **Flipped Answer (ICL)** | 模型依赖记忆模式还是上下文学习？ | Q: Review: a great movie; A: Negative | Q: Review: a smile on your face
Parrot: Positive
Intelligence: Negative |
| **Repetitive Answer (ICL)** | 模型复制重复模式还是执行底层任务？ | Q: -11 = -94 + a. a?; A: 83 | Q: -25 = -41 + a. A?
Parrot: 83
Intelligence: 16 |
| **Successive Answer (ICL)** | 模型依赖连续模式还是执行底层任务？ | Q: 8 - 7=? A: 1
Q: 1+1=? A: 2
Q: 192 - 189=? A: 3 | Q: 68 - 60=?
Parrot: 4
Intelligence: 8 |
| **Truthy Answer (ICL)** | 模型依赖"听起来真"还是"确实为真"？ | Q: Eiffel Tower in Paris. A: True
Q: Renaissance began in Japan. A: False | Q: North Star is brightest. (sounds true but false)
Parrot: True
Intelligence: False
Q: Day on Mercury > year on Mercury. (sounds false but true)
Parrot: False
Intelligence: True |
| **Intuitive Answers (Zero-shot)** | 基于 CRT，探测 System 1 vs System 2 思维 | N/A | Q: Bat + ball = $1.10, bat costs $1.00 more than ball. How much is ball?
Parrot: $0.10
Intelligence: $0.05 |
| **Multi-hop Persona QA (ICL)** | 模型记忆孤立事实还是构建连贯人格表示？ | Q: Do you use alias when traveling? A: Yes, "Wolf".
Q: Dog's name? A: Blondi. | Q: What's your name?
Intelligence: Hitler
Q: What's your doctor's name?
Intelligence: Theo Morell |

### 2 个 Fine-tuning-based 评估

1. **Out-of-context Reasoning**：测试模型能否在微调后 verbalize 匿名化的 Python 函数或城市名
2. **Emergent Misalignment**：测试模型在微调不安全代码后是否会产生更广泛的 misalignment 行为

### 评估方法论细节

- **Y 轴指标**：同时使用 hard accuracy 和 soft probability [P(correct) − P(incorrect)]，排除因 accuracy 不连续性导致的 mode-hopping 假象
- **X 轴指标**：预训练 token 数量和 FLOPs
- **数据控制**：仅考虑通用预训练检查点，排除 mid-training 或 long-context training 阶段，确保数据采样不引入混淆因素
- **结果汇报**：跨 4 个随机种子的平均值和方差

## Mode-Hopping 核心发现

### 1. Mode-Hopping 现象的发现

传统观念认为 LLM 在预训练中会逐渐、稳定地从模式匹配的"鹦鹉"发展为具有泛化能力的"智能体"——这建立在预训练 loss 持续下降和下游基准测试表现提升的观察之上。

**然而本研究揭示这一认知模型是错误的：** LLM 在整个预训练过程中频繁且突然地在"鹦鹉模式"和"智能模式"之间跳跃，即由不同电路实现的截然不同的算法。

### 具体案例：OLMo3 32B 在 Successive Answer 任务上的表现

在"answer+1"评估任务上，OLMo3 32B 的泛化行为极具戏剧性：

| 预训练 Token 数 | 准确率 |
|---------------|--------|
| 2.17T | **81%** |
| 2.19T | **0%**（崩塌） |
| 2.21T | **81.7%**（反弹） |

### Mode-Hopping 的普遍性

Mode-hopping 并非个例现象：模型会突然：

- 依赖记忆或 in-context 模式而非 in-context learning
- 使用 System 1 而非 System 2 思考
- 选择"听起来真"而非"确实为真"
- 在 multi-hop persona QA、out-of-context reasoning、emergent misalignment 上失败
- 然后同样突然地恢复泛化能力

**Mode-hopping 并非只发生在早期预训练：** 它在消费数万亿 tokens 后仍然持续，跨越 Chinchilla 最优预算的 9× 到 90×。

### 规模定律与 Mode-Hopping 的关系

缩放模型参数可以缓解这种竞争，但无法完全修复：

| 模型规模 | Mode-Hopping 特征 |
|---------|------------------|
| **小型模型** | 要么较慢且不稳定地过渡到智能模式（Type I），要么锁定在鹦鹉模式（Type II、III） |
| **大型模型** | 表现出相同的动力学特征，只是在更难的任务上 |

### Mode-Hopping 的本质：容量分配问题

作者将 mode-hopping 理解为**容量分配问题**：

> 在容量受限的模型中，可泛化电路必须与早期预训练中学习的浅层电路竞争，每个预训练窗口中的数据决定了哪组电路胜出。

**标准优化动力学无法解释 mode-hopping：**

- 泛化行为是**局部稳定的**：单个梯度步不会改变它，即使学习率达到 1e-2
- **检查点平均只能缓解但无法修复** mode-hopping

## 详细实验结果

### 3.1 记忆模式 vs In-context Learning（Flipped Answer）

研究团队选择了 8 个经典数据集（情感分类和主题分类）。在原始标签下，模型在整个预训练过程中稳定获得 80%-100% 的准确率。然后将标签翻转，例如将正面情感标注为负面。

**关键发现：**

- 模型频繁在记忆模式和 in-context learning 之间跳跃
- **规模效应**：小型模型（如 OLMo3 7B）在 IMDB 上持续依赖记忆模式，准确率始终低于 50%（接近随机猜测）；大型模型则频繁泛化

### 3.2 重复/连续模式 vs In-context Learning

当面对具有重复或连续答案的 in-context 演示时，模型会复制该模式（通过 induction heads 或 successor heads）还是执行底层任务（通过 function vector heads）？

研究设计了 4 个任务（编码、数学、字母计数、逻辑），每个任务都观察到相同的 mode-hopping 动态。

### 3.3 "听起来真" vs "确实为真"（Truthy Answer）

研究团队精心挑选了明显为真/假或令人惊讶地真/假的声明。例如：

- **显然假**："文艺复兴始于日本"
- **令人惊讶真**："水星上的一天比一年还长"

将前者作为 in-context 演示，评估后者。如果模型依赖"听起来真"而非"确实为真"，准确率会很低。

### 3.4 System 1 vs System 2 思维（Intuitive Answers）

使用 3 个代表性认知反射测试（CRT）问题。每个问题都有快速 System 1 思维的直观但错误的答案，而真正正确答案需要慢速 System 2 思维。

每个原始问题生成 1,000 个模板变体。

### 3.5 断开的事实 vs 连贯人格（Multi-hop Persona QA）

受 Hitler persona test 启发，为 6 位历史人物构建 persona 评估。每个 persona 提供 90 个传记事实作为 in-context Q&A 对，然后问单跳和多跳问题。

**例如 Hitler：**

- 输入 90 个看似通用的事实
- 模型需要将所有点连接起来推断身份
- 正确答案：Hitler 和他的医生 Theo Morell

### 3.6 Fine-tuning 中的 Mode-hopping

在两个有趣的 fine-tuning-based 泛化评估上追踪动态：

- **Out-of-context reasoning**：在匿名化 Python 函数的输入-输出对上训练，然后在自然语言和代码中 verbalize
- **Emerged misalignment**：在 insecure code 上训练，然后评估对更广泛用户查询的 misalignment 回答倾向

## 分析与假设验证

### 4.1 零假设 1：通用评估噪声

**假设**：LM 在所有评估上性能都振荡，而不仅是我们关注的泛化评估。

**验证方法**：在 10 个常见评估数据集上运行 in-context 评估，涵盖情感分类、主题分类、数学应用题和广泛知识 QA。

**结论**：LM 在所有正常评估上都有平滑的准确率曲线，证明 mode-hopping 是泛化评估特有的现象。

### 4.2 零假设 2：标准优化动力学

**假设**：Mode-hopping 只是经典优化动力学的一种表现——LM 在稳定边缘优化，沿山谷跳跃产生振荡训练 loss。

**验证方法**：

1. **局部稳定性测试**：加载检查点的预训练 Adam 优化器状态，随机采样文档进行单步优化，测量概率变化
2. **检查点合并测试**：合并 K=5 个连续检查点

**结论**：

- 泛化行为是**局部稳定的**：即使在 batch size 很小、学习率为 1e-2 时，概率变化也可忽略
- **检查点平均只能缓解但无法修复** mode-hopping

### 4.3 Mode-Hop 在大型模型上更普遍

Mode-hopping 在不同数据集上的普遍性如何？例如，在 Flipped Answer 评估上，如果某个预训练检查点依赖记忆模式并在 SST2 上获得低准确率，它在 IMDB 上也会获得低准确率吗？

**发现**：

- 相关性通常较低，表明同一检查点在不同数据集上的泛化行为差异很大
- **积极的一面**：大型模型确实获得更高的相关性

**更细粒度分析**：

- 情感数据集之间的相关性为中等到高（如 SST2 和 IMDB 之间为 0.43）
- 情感和主题分类之间的相关性始终较低（<0.1）
- 在相同数据集的释义版本之间，mode-hopping 表现出强相关性

### 4.4 指标选择的影响

研究同时呈现 hard accuracy 和 soft probability，排除了因指标选择导致的 mode-hopping 假象。

### 4.5 通用指令遵循能力的影响

为排除通用指令遵循能力（如生成可提取答案片段）引起的振荡，研究计算了答案选择上的概率。

## 三大应用方向

### 应用 1：预训练检查点选择

研究证明，他们的 toy 评估套件可以选择在 post-training 后泛化能力显著更好的预训练检查点。

**具体发现**：

- **选出的检查点**：4.5T token 检查点 vs 4.9T token 检查点
- **后训练测试**：
  1. 数学 post-training 能否泛化到非数学推理任务（GPQA）？
  2. 通用 post-training 能否塑造超越几个 token 深度的对齐（对 prefilling 攻击的鲁棒性）？

**结果**：4.5T-token 检查点在数学微调后泛化到 GPQA 的能力远强于 4.9T-token 检查点，并且在 post-training 后对 prefilling 攻击的鲁棒性也强得多。

**关键洞察**：最终检查点或 mid-training 检查点不一定是最好的；经过评估套件筛选的中间检查点可能泛化能力更强。

### 应用 2：预训练数据选择

研究展示了利用每个预训练窗口内的泛化动态来选择预训练数据子集，以控制模型行为。

**实验设计**：继续预训练 OLMo3 32B 中间检查点，使用三种不同预训练子集：

- **Uncontrolled**：随机采样的预训练数据
- **Control-pattern**：从在该评估上鼓励模式匹配的窗口中选择预训练数据
- **Control-generalization**：从在该评估上鼓励泛化的窗口中选择预训练数据

**结果**：与 uncontrolled 的显著 mode-hopping 相比，control-pattern 和 control-generalization 都朝着预期方向稳定了泛化动态。

### 应用 3：泛化预测因子的测试

研究测试了基于激活和梯度的模型复杂度指标，以预测泛化能力，核心假设是"越简单的解决方案泛化越好"。

**测试的五个指标**：

| 指标 | 描述 |
|------|------|
| **RankMe** | 有效秩，来自归一化谱的熵 |
| **Participation Ratio (PR)** | 谱的另一种展布度量 |
| **log tr F** | 总 per-example 梯度幅度（经验 Fisher） |
| **σ₁/tr F** | 锐度，作为总曲率的一部分 |
| **|cosine similarity|** | per-example 梯度之间的平均绝对成对对齐 |

**发现**：

1. **初步看起来不错**：许多指标达到非平凡的平均相关性（0.45-0.54）
2. **但随机基线也显示 0.4 的相关性**：因为采用了最佳层选择策略
3. **细节揭示更复杂的画面**：

   - 所有指标在数据集间都表现出高方差
   - 同一指标在不同层可以强正相关或强负相关
   - 同一层内，泛化能力强的检查点可以表现出高或低的激活秩

**结论**：泛化能力强的模型既可以是简单的也可以是复杂的——"越简单越好"这一元叙事过于简化。

## 深度分析

### 1. 预训练 loss 下降是极具误导性的泛化代理指标

本研究最核心的发现是预训练 loss 持续下降与下游基准测试表现提升之间存在严重的相关性误导。研究者观察到，LLM 在预训练过程中频繁且突然地在"鹦鹉模式"和"智能模式"之间跳跃，而这种跳跃完全被整体平滑的 loss 曲线和基准测试曲线所掩盖。传统上，研究者通过采样少量检查点来绘制这些曲线，如果只在 2.17T 和 2.21T 两个时间点采样，会看到两个漂亮的 81% 准确率，从而得出"性能稳定"的结论——但这完全忽略了 2.19T 时刻 0% 的崩塌。这一发现对整个预训练评估实践提出了根本性质疑 。

### 2. Mode-hopping 是容量分配的结构性结果，而非训练不充分

研究者明确将 mode-hopping 理解为容量分配问题，而非传统观念中的"训练不充分"或"优化动力学"的表现。关键证据包括：即使学习率达到 1e-2，单步梯度更新也无法改变检查点在评估套件上的概率分布——这说明泛化行为是局部稳定的，而非受标准优化动力学驱动。同时，检查点平均（K=5）只能缓解但无法修复 mode-hopping。这意味着 mode-hopping 的根源是：可泛化电路必须与早期预训练中形成的浅层电路竞争预训练 token 窗口内的容量，而数据分布决定了哪组电路胜出 。

### 3. 规模定律的局限性：只能缓解但无法消除 Mode-hopping

缩放模型参数可以塑造泛化动态，但只能将 mode-hopping 推到更难的任务上，无法根本解决。研究者发现：小型模型要么较慢且不稳定地过渡到智能模式（Type I），要么永久锁定在鹦鹉模式（Type II/III）——后者最典型的例子是 OLMo3 7B 在 IMDB 数据集上始终依赖记忆模式，准确率始终低于 50%。大型模型确实表现出更高的跨数据集相关性，说明泛化行为更一致，但仍然在各个数据集上经历相同的振荡动态。这表明 mode-hopping 是大规模多任务学习下的结构性特征，而非可以通过无限 scaling 解决的工程问题 。

### 4. "简单泛化更好"的主流假设被系统性证伪

研究者测试了五种基于激活和梯度的模型复杂度指标（RankMe、Participation Ratio、log tr F、σ₁/tr F、|cosine similarity|），发现：虽然许多指标达到非平凡的平均相关性（0.45-0.54），但随机基线也显示 0.4 的相关性。更关键的是，同一指标在不同层可以产生强正相关和强负相关；同一层内，泛化能力强的检查点可以表现出高或低的激活秩。这说明泛化解决方案可以是简单的也可以是复杂的，"越简单越好"这一元叙事过于简化。这一发现对基于模型复杂度指标的泛化预测和正则化训练策略都有重要的颠覆意义 。

### 5. 跨数据集泛化相关性的非均匀性揭示了浅层模式的陷阱本质

研究者在细粒度分析中发现：情感数据集之间的相关性为中等到高（0.4-0.6），如 SST2 和 IMDB 之间为 0.43，但情感和主题分类之间的相关性始终较低（<0.1）。这是因为 IMDB 示例比 SST2 长得多，携带更多浅层情感线索，更容易诱发鹦鹉行为。而在同一数据集的释义版本之间，mode-hopping 表现出强相关性，因为浅层模式基本一致。这一发现揭示了为什么某些数据集特别容易诱发"鹦鹉行为"：长文本中的浅层线索密度更高，使得模型更容易依赖记忆而非推断。这一洞察对数据集构建和评估套件设计都有直接指导意义 。

## 实践启示

### 建立预训练动态监控体系，而非仅依赖 Loss 曲线

传统的预训练监控依赖 loss 曲线和下游基准测试的平滑曲线，但 mode-hopping 研究表明这些指标可能完全掩盖了剧烈的泛化振荡。实践建议：建立包含对比性、反直觉评估任务的监控套件（如 Flipped Answer、Successive Answer），在预训练过程中定期探测模型的泛化行为模式。这些 toy 评估成本低廉（零样本或少样本提示），但能捕捉传统指标完全无法发现的问题 。

### 重新审视检查点选择策略：中间检查点可能优于最终检查点

研究明确证明，最终检查点或 mid-training 检查点不一定是最好的。4.5T-token 检查点在数学后训练后泛化到 GPQA 的能力远强于 4.9T-token 检查点，且对 prefilling 攻击的鲁棒性也更强。实践建议：在后训练前使用泛化评估套件系统性地筛选预训练检查点，而非简单使用最终检查点。这对于需要强泛化能力的对齐训练和安全关键应用尤为重要 。

### 利用数据选择控制泛化动态，实现精细化引导

研究展示了通过选择性地从特定泛化动态窗口中采样数据，可以引导模型泛化行为朝预期方向发展（pattern-matching 或 generalization）。实践建议：在预训练数据工程中，不仅要考虑数据质量，还要考虑数据分布对泛化动态的影响。可以通过设计小规模对照实验来验证特定数据配比对目标泛化行为的影响，从而在数据层面实现更精细的模型行为控制 。

### 警惕跨任务泛化的非均匀性：单一指标无法代表整体能力

研究显示，同一检查点在不同数据集上的泛化行为差异很大（相关性低），即使是情感分类这种概念相近的任务，不同数据集间的 mode-hopping 时机也不同。这意味着在特定评估（如 MMLU）上表现好的检查点，在其他任务上可能表现极差。实践建议：建立多维度评估体系，在多个不同类型的数据集上评估检查点，而非依赖单一基准的分数。同时，对于安全关键应用，需要特别测试对齐相关的泛化行为（如 emergent misalignment） 。

### 在模型蒸馏和压缩中关注泛化特征，而非仅依赖 Loss

研究发现，泛化能力强的模型既可以是简单的也可以是复杂的（与激活秩高低无关），且检查点平均只能缓解但无法修复 mode-hopping。这意味着依赖最终 loss 或参数平滑性的蒸馏/压缩策略可能忽略关键信息。实践建议：在模型压缩时，不仅要监控 loss 变化，还要监控目标泛化评估套件上的行为变化，确保被保留下来的检查点或参数在泛化能力上保持一致性 。

## 讨论与展望

### 作者的乐观看法

研究者对 LLM 的泛化先验持更乐观态度：

> 我们的结果表明，一个良好预训练的模型会倾向于泛化，即使面对诱人的浅层模式。我很高兴看到将泛化作为一个通用杠杆来解决当今最紧迫的问题，如从清晰到模糊任务的能力迁移、角色训练和弱到强泛化。是的，我们对超级 AI 的监督将是弱的，而且有无数种意想不到的方式来拟合它。但具有强泛化先验的 LLM 可能只是以我们期望的求真方式拟合我们的监督。

**对架构和优化的启示**：
> 我对理解预训练的泛化动态并用其启发新的架构和优化技巧以改善泛化更加乐观——今天 LLM 的泛化动态显然远非最优。我特别支持使用 toy 评估套件来追踪预训练动态并预测真实下游任务的结果。

### 作者的谨慎看法

> 我对现有的人类泛化先验更加谨慎，特别是任何形式的简单性偏差和任何简单的相变模型。我们应该接受预训练动态是复杂的：在大规模多任务学习下，泛化解决方案可能是简单的也可能是复杂的，而且解决方案的动态不会被任何单一的、简单的故事（如吸收-压缩）所捕捉。

## 实践启示

### 对 AI 研究者的启示

- 预训练动态远比传统观念认为的复杂——不应依赖单一的"渐变成熟"模型来理解泛化
- 使用 toy 评估套件追踪预训练动态是可行的研究方向，可以预测真实下游任务的结果
- 检查点选择在实践中非常重要——最终检查点不一定是最好的，经过评估套件筛选的中间检查点可能泛化能力更强
- 在后训练中融入对预训练动态的考虑，可能比单纯扩大训练数据规模更有效

### 对模型训练团队的启示

- 构建预训练监控工具应该成为标准实践，mode-hopping 可能导致看似稳定的 loss 背后隐藏着不稳定的泛化能力
- 数据选择策略可以根据期望的泛化动态进行精细调控，而非被动接受随机采样
- 在模型蒸馏或压缩时，需要注意目标检查点的泛化特征，而非仅依赖最终 loss

### 对 AI 安全的启示

- 对齐能力同样存在 mode-hopping——在某些预训练阶段检查点可能更容易受到 prefilling 攻击
- emergent misalignment 的动态变化表明微调阶段需要特别关注预训练阶段的选择
- 作者认为具有强泛化先验的 LM 可能会以符合人类意图的"求真"方式拟合我们的监督

## 相关实体
- [Generalization Dynamics Of Lm Pre Training Jiaxin Wen](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [Generalization Dynamics Pre Training Jiaxin Wen](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [Generalization Dynamics Of Lm Pre Training Jiaxin Wen 1](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [New Ai Lock In](ch07-031-the-new-ai-lock-in.html)
- [Ai Driven Layoffs Business Sense Cio](ch03-028-ai-driven-layoffs-aren-t-making-business-sense.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-lm-pretraining.md)

---
