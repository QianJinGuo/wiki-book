## Ch15.032 Generalization Dynamics of LM Pre-training — Jiaxin Wen

> 📊 Level ⭐⭐⭐⭐ | 21.4KB | `entities/generalization-dynamics-pre-training-jiaxin-wen.md`

## 核心要点

- source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)
- review: v=9 × c=9 = 81
- 作者：Jiaxin Wen, Zhengxuan Wu, Dawn Song, Lijie Chen
- 研究模型：OLMo3 (7B/32B) 和 Apertus (8B/70B)
- 核心发现：LLM 预训练中存在频繁的"mode-hopping"现象——在鹦鹉模式（模式匹配）和智能模式（泛化推理）之间突然跳跃，而非稳定成熟
- 意义：挑战了"LM 在预训练中逐渐从鹦鹉进化为智能体"的传统观念，揭示预训练 loss 下降和下游基准提升掩盖了剧烈的泛化振荡

## 相关实体
- [Generalization Dynamics Of Lm Pre Training Jiaxin Wen](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [Generalization Dynamics Lm Pretraining](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [Generalization Dynamics Of Lm Pre Training Jiaxin Wen 1](ch01-784-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)
- [Yann Dubois Openai Post Training Interview](ch01-374-introducing-the-ettin-reranker-family.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 研究背景与动机

### 鹦鹉与智能体的计算本质区别

研究表明，鹦鹉（parrot）和智能体（intelligence）在计算上是有区别的。鹦鹉重复上下文模式，而智能体推断上下文函数；鹦鹉将人格编码为离散的facts和traits袋，而智能体学习连接所有内容的人格表示；鹦鹉记忆推理步骤，智能体形成用于实体跟踪、回溯甚至高度抽象概念（如真理）的通用推理电路。

### 传统观点的局限

传统观点认为，LM 在预训练中逐渐、稳定地从鹦鹉成熟为智能体，学习捕获可迁移结构并抵抗浅层模式。这一观念建立在预训练 loss 下降和下游基准性能提升的观察之上。^(本文挑战了这一观念)

**关键反例**：在"answer+1"评估任务中，OLMo3 32B 在 2.17T tokens 时准确率 81%，在 2.19T tokens 时暴跌至 0%，随后在 2.21T tokens 时反弹至 81.7%。这种跳跃并非孤例——在各种评估和模型上都能观察到 LM 突然捕获记忆或上下文模式而非上下文学习、使用 System 1 而非 System 2 思考、选择听起来真而非确实真的内容、在多跳人格 QA、上下文外推理和 emergent misalignment 上失败——然后同样突然地恢复并泛化。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## Mode-Hopping 现象详解

### 什么是 Mode-Hopping

Mode-hopping 是指 LM 在预训练过程中频繁且突然地在鹦鹉式和智能式模式之间跳跃，即由不同电路实现的 不同算法。这不是由于训练不充分导致的——研究使用的模型都训练到了 Chinchilla 最优预算的 9× 到 90×。

### 容量分配视角

Mode-hopping 的本质是容量分配问题：在容量受限的模型中，可泛化电路必须与早期预训练中形成的浅层电路竞争，每个预训练窗口中的数据决定了哪组电路胜出。这解释了为什么即使训练远超 Chinchilla 最优预算，mode-hopping 仍然存在——这不是训练不充分的表现，而是容量竞争的结构性结果。

### 规模的作用

缩放参数可以塑造泛化动态：

- **小型模型（Type I）**：较慢且不稳定地过渡到智能模式
- **小型模型（Type II/III）**：永久锁定在鹦鹉模式（如 IMDB 数据集上持续低于 50%）
- **大型模型**：泛化更频繁但仍存在振荡
- **跨数据集相关性**：大模型的相关性更高，说明泛化行为在不同数据集间更一致

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 六项评估任务详解

研究团队构建了一套探测智能与鹦鹉行为差异的评估套件，所有评估都基于零样本或少样本提示，目标是使其"玩具化"从而廉价运行。

### 1. Flipped Answer（标签翻转测试）

**测试目标**：模型是捕获记忆模式还是上下文学习？

**设计逻辑**：选择 8 个经典情感分类和主题分类数据集，将原始标签翻转（如将正面情感标注为负面）。鹦鹉会坚持其记忆模式仍预测"正面"和"商业"，而智能体会从上下文演示中推断底层任务。

| 训练示例 | 测试示例 |
|---------|---------|
| Q: Review: a great movie; A: Negative | Q: Review: a smile on your face |
| Q: Review: terrible film; A: Positive | Parrot: Positive / Intelligence: Negative |

**结果观察**：小型模型（如 7B）在 IMDB 上始终捕获记忆模式，准确率始终低于 50%（接近随机猜测）；大型模型（32B）则频繁泛化。

### 2. Repetitive Answer（重复答案测试）

**测试目标**：模型是复制上下文重复模式还是执行底层学习？

**设计逻辑**：构造四个跨编码、数学、字母计数和逻辑的简单任务。演示中所有答案相同，测试问题答案不同但都遵循相同模式。

| 任务类型 | 训练示例 | 测试 |
|---------|---------|-----|
| 代数 | Q: -11 = -94 + a. a?; A: 83 | Q: -25 = -41 + a. A? → Parrot: 83, Intelligence: 16 |
| 代码 | 所有演示答案均为 83 | 测试答案应为不同值 |

### 3. Successive Answer（连续答案测试）

**测试目标**：模型是捕获上下文连续模式还是执行上下文学习？

**设计逻辑**：构建关于字符、单词和数字序列的四个数据集。演示答案遵循连续模式（如"1,2,3"或"A,B,C"），测试问题答案也遵循此模式。

**典型示例**：

- 演示：Q: 8-7=? A: 1 / Q: 1+1=? A: 2 / Q: 192-189=? A: 3
- 测试：Q: 68-60=? → **Parrot: 4**（逐项+1模式）/ **Intelligence: 8**（实际计算）

### 4. Truthy Answer（真实性测试）

**测试目标**：模型是捕获听起来真的还是确实真的？

**设计逻辑**：策划明显或令人惊讶地真或假的声明。演示中的声明明显为真或假，测试声明则是令人惊讶的真或常见误解。

| 类型 | 示例 |
|-----|------|
| 听起来真但实际假 | "The North Star is the brightest star in the night sky" → Parrot: True / Intelligence: False |
| 听起来假但实际真 | "A day on Mercury lasts longer than a year on Mercury" → Parrot: False / Intelligence: True |

### 5. Intuitive Answers（直觉vs推理测试）

**测试目标**：模型是使用 System 1 还是 System 2 思考？

**设计逻辑**：使用三个具有代表性的认知反射测试（CRT）问题。每个问题都有一个直觉性但错误的快速 System 1 思考答案，而真正正确答案需要慢速 System 2 思考。每个原始问题基于模板生成 1,000 个变体。

**典型示例**：

- 问题：A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?
- 直觉答案（System 1）：$0.10
- 正确答案（System 2）：$0.05

### 6. Multi-hop Persona QA（多跳人格问答）

**测试目标**：模型是捕获离散事实还是连贯人格？

**设计逻辑**：为六位历史人物构建人格评估。每个人格展示 90 个传记事实作为上下文 QA 对，然后问单跳和多跳问题。如果模型将所有看似通用的事实连接为连贯人格，则准确率高。

| 问题类型 | 示例 |
|---------|------|
| 单跳 | Q: What is your name? → Intelligence: Hitler |
| 多跳 | Q: What's your doctor's name? → Intelligence: Theo Morell |

### 微调基础评估：上下文外推理和Emergent Misalignment

研究还追踪了两个有趣的微调基础泛化评估动态：上下文外推理（out-of-context reasoning）和 emergent misalignment。

**上下文外推理测试**：

- Function：模型在匿名 Python 函数的输入输出对上训练，然后评估其用自然语言和代码表达函数的能力
- Location：模型在固定匿名城市和随机城市之间的相对距离和基点方向上训练，然后评估其说出城市名称的能力

**Emergent Misalignment测试**：

- 模型在不安全代码上训练，然后评估其在更广泛的用户查询上对错误对齐答案的概率

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 排除竞争性假说

研究团队系统性地排除了几种可能的替代解释：

### 假说1：非泛化噪声

**假说内容**：LM 在所有评估上表现都振荡，而非仅在泛化评估上。

**排除证据**：在标准分类、主题分类、数学和知识 QA 任务上，LM 的表现曲线是平滑的，说明振荡仅出现在泛化任务上。

### 假说2：标准优化动力学

**假说内容**：Mode-hopping 只是经典优化动力学之一——LM 在稳定边缘优化，沿河谷跳跃并产生振荡训练 loss。

**排除证据**：

- **局部稳定性测试**：单步梯度更新（甚至大学习率 1e-2）不会改变检查点在评估套件上的概率
- **检查点平均无效**：合并 5 个连续检查点只能缓解但无法修复 mode-hopping

### 假说3：指标选择假说

同时使用硬准确率和软概率（ P(correct)−P(incorrect) ）两种指标，相互印证 mode-hopping 并非仅由准确率的不连续性引起。

### 假说4：通用指令跟随能力假说

为排除通用指令跟随能力引起的振荡（如生成可提取的答案片段），计算答案选择上的概率（除人格 QA 外，人格 QA 没有默认鹦鹉答案）。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 跨数据集泛化相关性分析

### Mode-hopping 的普遍性

Mode-hopping 在不同数据集间的普遍性如何？例如，在 Flipped Answer 评估上，如果某个预训练检查点捕获记忆模式并在 SST2 上获得低准确率，它在 IMDB 上也会获得低准确率吗？

**关键发现**：

- 相关性通常较低，说明相同检查点在不同数据集上的泛化行为差异较大
- **但大型模型的相关性更高**，说明缩放可以提高泛化一致性

### 数据集类型的具体相关性

**情感与主题数据集间相关性低**（<0.1）：不同概念需要不同电路，不足为奇。

**不同情感数据集间相关性中等**（0.4-0.6）：例如 SST2 和 IMDB 之间的相关性仅为 0.43。虽然它们共享相同的底层可泛化概念（情感），但浅层模式不同——IMDB 示例比 SST2 长得多，因此携带更多浅层情感线索，更容易诱发鹦鹉行为。

**同一数据集的转述版本间相关性高**：这证实了当诱人模式基本一致时，mode-hopping 强烈普遍。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 三大实践应用

### 应用1：预训练检查点选择

研究证明，其玩具评估套件可以指导选择通过后训练泛化更好的预训练检查点。

**实验设置**：选择 4.5T 和 4.9T token 检查点进行后训练泛化测试：

- **数学后训练测试**：SFT 可泛化为 RL（多 epoch 训练和高品质思维数据）
- **通用后训练测试**：49K 非安全数据 + 1K 安全数据（STAR）

**关键发现**：

- **4.5T token 检查点**在数学后训练后泛化到 GPQA 远好于 4.9T token 检查点
- 4.5T token 检查点对预填充攻击的鲁棒性也更强
- 最终预训练或中等训练只能提高分布内性能，无法增强跨域推理泛化或更鲁棒的对齐

### 应用2：预训练数据选择

是否可以利用每个预训练窗口内的泛化动态来选择预训练数据子集以控制模型的泛化方式？

**实验设计**：在 Successive Answer 的"answer+1"评估上继续预训练 OLMo3 32B 中间检查点，使用三种不同预训练子集：

| 数据集类型 | 描述 | 效果 |
|-----------|------|------|
| Uncontrolled | 随机采样的预训练数据 | 显著 mode-hopping |
| Control-pattern | 鼓励模式匹配的数据 | 稳定向模式匹配方向发展 |
| Control-generalization | 鼓励泛化的数据 | 稳定向泛化方向发展 |

**结论**：可以选择性地让预训练数据引导泛化动态走向预期方向。

### 应用3：泛化预测因子测试

研究评估了多种基于激活和梯度估计模型复杂度的方法，检验"更简单的解决方案泛化更好"这一主流信念。

**测试的五种指标**：

| 指标 | 公式/描述 | 基于 |
|-----|---------|-----|
| RankMe | 归一化谱熵的有效秩 | 激活谱 |
| Participation Ratio | 谱的另一个展布度量 | 激活谱 |
| log tr F | 总逐例梯度幅度（经验 Fisher） | 梯度 |
| σ₁/tr F | 曲率作为总曲率的分数 | 梯度 |
| \|cosine similarity\| | 逐例梯度间的平均绝对成对对齐 | 梯度相似性 |

**关键发现**：

- 许多指标达到非平凡的平均相关性（0.45-0.54），但即使随机基线也显示 0.4 的相关性
- 所有指标在数据集间表现出高方差
- **更细腻的画面**：相同的指标可以在不同层产生强正相关和强负相关
- **"简单泛化更好"的元叙事被证伪**：良好泛化的检查点可以表现出高或低的激活秩——泛化解决方案可以是简单的或复杂的

## 深度分析

### 1. 标准基准测试掩盖了预训练的真实动态

本研究最根本的发现是：标准基准测试和预训练 loss 曲线完全无法反映真实的泛化动态。如果只采样少数几个检查点（比如 2.17T 和 2.21T tokens），研究者会看到两个漂亮的 ~81% 准确率点，从而得出"模型性能稳定提升"的结论。但在这两个时间点之间的 2.19T tokens 处，准确率暴跌至 0%。这种崩塌-反弹模式在整个预训练过程中反复出现，意味着任何依赖少量检查点采样的评估实践都可能完全遗漏关键的泛化失效时刻。传统基准测试在设计上的稀疏采样特性（每数十亿 tokens 取一个检查点）使其根本无法捕捉这种高频振荡 。

### 2. Mode-hopping 是容量分配的结构性特征，而非优化问题

研究明确将 mode-hopping 归因于容量分配问题，而非标准优化动力学。这一结论建立在两项关键证据之上：第一，泛化行为的局部稳定性——即使在单步大学习率（1e-2）优化后，检查点在评估套件上的概率变化也可忽略不计，这排除了"沿损失山谷跳跃"的优化动力学解释。第二，检查点平均（K=5）只能缓解但无法修复 mode-hopping。这说明 mode-hopping 的根源是预训练窗口内数据分布决定了可泛化电路与浅层电路之间的竞争结果，而这种竞争无法通过事后的模型平均来消除 。

### 3. "简单泛化更好"假设的证伪对研究社区的警示意义

研究者测试的五种基于模型复杂度的泛化预测指标（RankMe、Participation Ratio、log tr F、σ₁/tr F、|cosine similarity|）在初步分析中都显示了非平凡的平均相关性（0.45-0.54）。然而，由于采用了最佳层选择策略，即使随机基线也显示 0.4 的相关性。深入分析揭示：同一指标在不同层可以产生强正相关或强负相关；同一层内，泛化能力强的检查点可以表现出高或低的激活秩。这意味着"简单解决方案泛化更好"这一在研究社区广泛接受的元叙事是过度简化的。泛化能力与模型复杂度之间的关系远比单一叙事所能捕捉的更加多维和情境依赖 。

### 4. 数据集特性对 Mode-hopping 的深刻影响揭示了评估套件设计的关键问题

研究揭示了为什么某些数据集更容易诱发鹦鹉行为：IMDB 示例比 SST2 长得多，因此携带更多浅层情感线索（如 "happy"、"sad" 等明显情感词），这些线索更容易被模型作为浅层模式记忆而非用于真正的情感推断。这导致模型在 IMDB 上比在 SST2 上更频繁地表现为鹦鹉模式。更关键的是，同一数据集的转述版本之间表现出强相关性，而情感和主题分类之间的相关性始终低于 0.1——因为它们需要不同的底层电路。这对评估套件设计有深刻启示：评估任务的选择本身会极大地影响对模型泛化能力的判断，标准基准测试可能因为数据集特性而系统性低估某些模型的泛化能力 。

### 5. Emergent Misalignment 的 Mode-hopping 对 AI 安全的警示

研究在两个微调基础评估上追踪了 mode-hopping：Out-of-context reasoning 和 Emergent Misalignment。后者尤其值得安全关注——模型在预训练的不同阶段可能对不安全代码的微调产生截然不同的对齐泛化行为：有时微调后的模型会表现出广泛的 misalignment，有时则不会。这种不可预测性意味着，仅依靠最终检查点或标准后训练流程无法保证对齐的鲁棒性。研究者建议，对齐策略应该包含对预训练动态的主动监控，选择处于"泛化窗口"的特定检查点，而非假设最终模型天然具有最强的对齐能力 。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 实践启示

### 对预训练实践的启示

- **预训练监控应超越 loss 曲线**：需要主动探测泛化动态，仅看 loss 曲线可能掩盖剧烈的泛化振荡
- **中间检查点选择可能优于最终检查点**：如 4.5T 检查点在数学后训练泛化到 GPQA 和对齐鲁棒性上优于 4.9T 和最终检查点
- **数据课程设计可以精细调控泛化行为**：不只是随机采样，可以根据目标泛化方向选择预训练数据子集

### 对模型评估的启示

- **探测泛化能力需要设计对比性、反直觉的评估任务**：而非标准基准——标准基准可能只采样少数检查点，掩盖剧烈的泛化振荡
- **跨任务泛化的非均匀性表明单一指标无法代表整体能力**：需要多维度评估
- **在少量检查点上的平滑评估曲线可能掩盖了剧烈的泛化振荡**

### 对 AI 安全的启示

- **对齐失败（如 emergent misalignment）也呈现 mode-hopping 特征**：说明预训练阶段的选择对安全至关重要
- **鲁棒对齐可能需要选择处于"泛化窗口"的特定检查点**：而非依赖最终模型
- **预训练动态的深入理解可能启发新架构和优化技巧**：当前 LLM 的泛化动态显然远非最优

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

## 作者观点

### 乐观方面

作者对 LM 的泛化先验持更乐观态度：

- 一个良好预训练的模型会优先泛化，即使有诱人的浅层模式可供选择
- 期待将泛化作为通用杠杆来攻击当今最紧迫的问题：从不清晰到模糊任务的能力迁移、人格训练、弱到强泛化
- 一个具有强泛化先验的 LM 可能以我们预期的寻求真理方式拟合我们的监督
- 更乐观地看待理解和利用预训练泛化动态——使用玩具评估套件追踪预训练动态并预测真实下游任务的结果

### 谨慎方面

作者对现有的泛化人类先验持更谨慎态度：

- 特别是任何形式的简洁性偏差和任何简单的相变模型
- 应接受预训练动态是复杂的：在大规模多任务学习下，可泛化解决方案可以是简单的或复杂的
- 解决方案的动态不会被任何单一的、简单的故事（如吸收-压缩）所捕捉

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/generalization-dynamics-pre-training-jiaxin-wen.md)

---
