# Exploring Self-Distilled Reasoning for SFT

## Ch01.583 Exploring Self-Distilled Reasoning for SFT

> 📊 Level ⭐⭐ | 7.8KB | `entities/exploring-self-distilled-reasoning-for-supervised-fine-tunin.md`

# Exploring Self-Distilled Reasoning for SFT

> **v×c score**: 81 | stars=5
> **来源**: https://aws.amazon.com/blogs/machine-learning/exploring-self-distilled-reasoning-for-supervised-fine-tuning-with-amazon-nova
> **发布**: AWS China ML (2026-07-21)

深度技术文章，值得深入分析。

## 摘要

Self-Distilled Reasoning (SDR) 是一种零额外标注成本的 SFT 训练方法，通过在非推理数据集上回填基座模型自身的 CoT 推理轨迹，同时提升目标任务性能并缓解灾难性遗忘。该方法在 Amazon Nova 2 Lite 上的三项 benchmark（MedMCQA、CoCoHD、Invoice-OCR）验证中，平均目标任务性能比最佳模型合并方案提升 6.5% 以上，同时将数学通用能力从几乎归零恢复至 68% 左右的基线水平。

## 核心要点

1. **推理抑制问题**：在非推理数据集上使用推理模式进行 SFT 训练会导致模型在推理时完全丧失逐步推理能力 —— 这是 shortcut learning 的直接表现。
2. **SDR 的核心思想**：用基座模型（而非外部大模型）自身的推理轨迹回填训练数据中缺失的 CoT 步骤，无需人工标注或额外教师模型。
3. **灾难性遗忘的显著缓解**：标准 SFT 使 Math 准确率从 70% 暴跌至 6%；SDR 使其恢复到约 68%，同时目标任务性能还提升了 6.5% 以上。
4. **混合推理数据的鲁棒性**：当训练数据中仅部分包含推理轨迹时，SDR 能消除能力悬崖 —— 即使 0% 推理数据，通用数学能力仍维持在 65-72% 区间。
5. **教师模型的选择建议**：同系列轻量模型的推理轨迹效果最优（如 Nova 2 Lite 给 Nova 2 Lite 蒸馏），过强的教师模型（Nova 2 Pro）反而因 student-teacher gap 过大导致通用能力下降。

## 深度分析

### SDR 的理论基础：自蒸馏作为正则化机制

SDR 的有效性可以从两个理论角度理解。首先是 self-distillation 的正则化效应 —— 当模型用自己的输出作为训练目标时，实际上是在自身参数空间中建立一种隐式一致性约束，防止参数漂移过远。这与近年来的研究一致（如自蒸馏的相关工作），即自蒸馏能有效缓解灾难性遗忘。

其次是推理轨迹的"锚定"作用。SFT 训练中，loss 同时计算在推理 token 和输出 token 上。当数据中没有推理轨迹时，模型学会"跳过"推理步骤直接输出答案 —— 这是一种典型的 shortcut learning。SDR 通过在训练数据中填充模型自身的推理步骤，迫使模型维持推理模式的激活，从而在推理时仍能产生有意义的 CoT。

### SDR 与模型合并的对比

模型合并（model merging）是缓解灾难性遗忘的传统手段，但它存在根本性权衡：合并后的 checkpoint 在目标性能上总是低于纯 SFT checkpoint，因为合并操作本质上是在目标领域和通用领域之间做插值。SDR 则打破了这一权衡 —— 它不是在训练后再做合并，而是在训练过程中通过数据增强来维持通用能力。实验数据显示，SDR 在目标性能上比最佳合并方案高出 6.5%，而数学保留能力几乎相同（70% vs 68%）。

### 推理数据覆盖率的"悬崖效应"

该研究最引人注目的发现之一是推理数据覆盖率下降时的不连续退化。Llava-CoT 上的消融实验表明：75% 推理覆盖率时尚可维持（Math 66.6%），但 50% 时骤降至 21.7%，25% 时降至 3.3%，0% 时仅剩 2.5%。这不是线性退化，而是一种"能力相变"—— 当推理数据低于某个阈值，模型完全丧失推理能力。SDR 通过填充缺失的推理步骤，消除了这个相变点，使得在任何覆盖率下都能维持稳定性能。

### 推理启用 vs 禁用的不对称影响

实验还揭示了一个重要现象：即使推理在推理时被禁用，经过 SDR 训练的模型仍比未使用的模型表现更好。例如，当 75% 的训练数据缺失 CoT 时，SDR 预填充使得推理禁用下的准确率从 16.4% 提升到 21.3%（提升约 5 个百分点）。这表明 SDR 不仅在推理时提供显式的推理步骤，还隐式地改善了模型的特征表示和问题求解方式。

## 实践启示

1. **默认 SFT 配方**：对于 Amazon Nova 系列用户，建议将 SDR（使用同系列 Lite 模型的推理轨迹）作为 SFT 的默认配方，无需额外标注成本即可同时提升目标性能和保留通用能力。

2. **推理数据覆盖率监控**：当训练数据中推理轨迹覆盖率低于 75% 时，必须使用 SDR 进行补全。50% 以下时，不接受补全将导致通用能力崩溃。建议将覆盖率指标纳入 SFT pipeline 的质量门禁。

3. **教师模型选择策略**：优先选择同系列的轻量模型作为推理轨迹生成器，而非更强大的外部模型。跨代的 student-teacher gap 会损害蒸馏效果。只有当目标领域的基座能力本身很弱时，才考虑使用 guided reasoning 或更强教师。

4. **持续学习场景的应用**：SDR 的灾难性遗忘缓解能力使其特别适合 continual learning 场景，其中新技能不断加入而旧技能需要保持。建议与 data mixing 和小权重合并（或零合并）组合使用。

5. **评估指标的扩展**：不要仅看目标任务性能。必须同时追踪通用能力基准（如数学、推理）的保留情况。SDR 的价值正是在于它消除了"目标性能 vs 通用能力"的 trade-off，因此评估体系应同时覆盖两者。

## 相关实体

- [灾难性遗忘](https://github.com/QianJinGuo/wiki/blob/main/concepts/catastrophic-forgetting.md) — SDR 的核心解决目标，通过自蒸馏显著缓解了灾难性遗忘
- Amazon Nova 2 模型家族 — SDR 实验验证的基座模型平台
- 自蒸馏 (Self-Distillation) — SDR 方法的核心理论机制
- 监督微调 SFT — SDR 的应用场景和训练范式
- Chain-of-Thought 推理 — SDR 生成和填充的推理数据类型

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/exploring-self-distilled-reasoning-for-supervised-fine-tunin.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

