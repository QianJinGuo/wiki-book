# Reducing Doom Loops with Final Token Preference Optimization

## Ch01.1288 Reducing Doom Loops with Final Token Preference Optimization

> 📊 Level ⭐⭐⭐⭐ | 9.7KB | `entities/antidoom.md`

# Reducing Doom Loops with Final Token Preference Optimization

**URL:** [https://liquid.ai/blog/antidoom](https://liquid.ai/blog/antidoom)
**Slug:** `antidoom`
**Score:** v×c=64 (value=8, confidence=8)
**Stars:** 4
**Tags:** newsletter, ai, model, liquid-ai, alignment, reasoning, preference-optimization
**Ingested:** 2026-07-09 18:59 UTC

## 摘要

Doom Loop（毁灭循环）是推理模型在推理过程中常见的退化失败模式：模型生成一段文本（如 "Wait, let me reconsider…"）后不断重复同一段落，直到耗尽上下文窗口。Liquid AI 提出的 **Antidoom** 方法通过 **Final Token Preference Optimization（FTPO）** 精确打击触发循环的单个 token，在不对整体分布造成显著影响的前提下，将 LFM2.5-2.6B 早期检查点的 doom loop 率从 10.2% 降至 1.4%，将 Qwen3.5-4B 的 doom loop 率从 22.9% 降至 1%。该方法识别循环的首个 token，构造偏好对（chosen/rejected pairs），仅对循环触发位置进行针对性训练，使用 LoRA（rank=128-256）单 epoch 微调即可取得优异效果。

## 核心要点

- **Doom Loop 三大机制**：①过训练 token（如 "delve"、"testament"、推理模型中的 "Wait"、"Alternatively"）在模型不确定时成为高先验延续；②循环的上下文强化——已出现的序列会提高该序列后续出现的概率，直到概率趋近于 1；③贪心采样（低温）使模型无法跳出已建立的循环，即使提高温度也难以逃脱（实验显示 temp=0.67 仍有显著循环）。
- **精准定位循环起点**：检测逻辑为——同一文本段重复至少 4 次、总长度至少 60 字符。定位到首次重复的**第一个 token**，从该位置取基座模型的 top-k 对数概率替代项，过滤后保留最多 20 个合理替代作为"chosen" tokens。
- **FTPO 算法创新**：与传统 DPO 不同，FTPO ①仅训练生成过程中间位置的末尾 token；②每样本支持多个 chosen 完成 token（将概率分散至一组替代 token）；③使用 logit 空间的 KL 散度而非完整 softmax，避免对无关 token 产生梯度压力；④两阶段正则化——chosen/rejected token 可相对自由移动，其余词汇更紧密约束。
- **轻量高效训练**：单 epoch + LoRA（rank=128-256 最优，覆盖所有注意力和 MLP 投影 + lm_head），学习率 4e-6 到 2e-5。早期停止条件为 `chosen_win=0.35`（chosen token 胜出比例），通常在此点 doom loop 率从 20-30% 降至 1-2%。训练集生成约 1 小时（8×MI325 GPU），训练约 1-2 小时（1×MI325 GPU）。
- **多轮应用**：第一轮 Antidoom 后，触发循环的 token 被抑制，但可能暴露新的故障点（其他 token 在原本不受影响的位置触发循环）。第二轮 Antidoom 继续压制新浮现的循环 token，进一步降低 doom loop 率。
- **低温和性能的现实关系**：消除 doom loop 后，模型在贪心采样接近 0 温度下反而获得最佳性能，挑战了"推理模型应该使用高温度以探索解空间"的传统直觉。这是因为之前高温的收益实际来自回避循环而非真正更好的探索。

## 深度分析

### 1. Doom Loop 的深层成因与理论分析

Antidoom 对 doom loop 的解剖超越了工程层面的现象描述，触及了语言模型推理的深层问题。三种机制的共同作用揭示了 **推理模型的结构性脆弱性**：

**机制 1（过训练 token + 不确定性）** 本质上是训练数据分布与推理时行为之间的错位。合成数据中高频出现的特定词汇（如 "delve"、"testament" 在较旧模型中的表现，或 "Wait"、"Alternatively" 在推理模型中的盛行）在标准语言建模训练中被过度强化。当模型在困难问题上遇到不确定状态时，这些 token 成为"安全但不正确"的默认选择，而低温解码使这种选择几乎是确定的。

**机制 2（上下文强化）** 与 Duan et al. 发现的"V 形注意力模式"密切相关——**语义重复先于文本重复**：模型在想法层面陷入循环，然后才在输出层面表现为文字重复。这意味着传统基于 n-gram 的重复检测只能看到症状而非病因。

**机制 3（贪心采样）** 揭示了温度与推理能力的非线性关系。Antidoom 的一个重要发现是：当循环被消除后，**低温表现反而优于高温**，颠覆了"推理模型需要高温度来探索"的常见判断。这表明此前观察到的"高温帮助推理"的效果实际上是"高温帮助逃避循环"的混淆变量。

### 2. FTPO 与 DPO 的关键差异及优势

FTPO 的设计哲学是 **最小干预**。DPO 在整个序列的 token 分布上进行偏好优化，而 FTPO 仅在问题发生的位置进行精确打击：

| 维度 | DPO | FTPO |
|------|-----|------|
| 训练范围 | 序列中所有 token | 仅序列末端单个 token |
| Chosen tokens | 通常单一完成 | 多个可选择的替代 token |
| KL 实现 | 完整 softmax 分布 | Logit 空间 KL 散度 |
| 正则化 | 全局统一 | 分区域差异化（目标 token 更自由） |
| 效果 | 全局调整，可能有副作用 | 精确修复，最小化干扰 |

FTPO 的 **两阶段正则化** 是其关键设计：允许 chosen/rejected token 的 logit 相对自由地移动（高学习信号区域），同时严格约束其他词汇的 logit 保持在参考模型附近。这使模型能够消除具体的循环触发词而不影响无关行为的质量。

### 3. 训练数据构造的工程挑战

Antidoom 训练集构造流程本身就是一个值得关注的工程贡献：

1. **触发样本生成**：在 LM 推理循环的 hard prompt mix 上以低温生成完成，反复抽样获取 doom loop 样本
2. **循环检测**：≥4 次重复 + ≥60 字符的严格规则，平衡精确率和召回率
3. **循环起始定位**：找到首次重复的第一个 token
4. **构建偏好对**：取该位置 top-k 对数概率替代 token，过滤短/非字母数字噪声，保留至多 20 个 chosen token
5. **正则化前处理**：对高频罪犯（"Wait"、"So"、"the"）进行正则化，防止过度抑制导致推理质量下降

触发 token 的频率分布揭示了有趣的特征："the"（11.39%）和"So"（4.51%）这类本应无害的功能词在循环中扮演了关键角色——它们不是危险的信号，而是模型在不确定状态下的默认填充。

### 4. 对齐与安全的方法论启示

Antidoom 方法可以看作是对齐技术的一个精细分支——不是限制模型能力，而是消除模型的病态行为。它与 [GRAM（An off switch for dual use knowledge）](https://github.com/QianJinGuo/wiki/blob/main/entities/off-switch-dual-use.md) 共享一种方法论精神：**精确、可移除、最小副作用**。

Antidoom 的"多轮应用"模式也值得关注——第一轮修复暴露了新的故障点，这与软件工程中的 bug 修复模式类似：修复已知故障后，原本被掩盖的其他系统缺陷浮出水面。这提示任何针对模型行为的修复都应预设多轮迭代的计划。

## 实践启示

1. **Doom Loop 是推理模型部署前的必检项**：Antidoom 在多个模型家族（LFM、Qwen）上验证了循环问题的普遍性。在将推理模型投入生产前，应系统检测 doom loop 率并至少用 Antidoom 进行一轮修复。

2. **高温 ≠ 更好的推理**：Antidoom 的关键发现挑战了广泛持有的"推理模型需要高温"假设。消除循环后，低温贪心采样才是最优策略。团队的推理部署策略应据此重新评估。

3. **精确修复优于全局微调**：FTPO 的"最小干预"理念——仅修改触发问题的特定位置——是处理模型缺陷的更优范式。相比于 RLHF 或 DPO 的全局分布调整，针对性修复保留更多原有能力。

4. **准备好多轮修复周期**：Antidoom 的经验表明，第一轮修复会暴露第二轮问题。构建模型修复 Pipeline 时应预设多轮迭代机制。

5. **LoRA 高 rank 的重要性**：Antidoom 发现 rank=128-256 的 LoRA 效果显著优于较低 rank。在需要精确行为调整时，不应默认使用低 rank LoRA，而应根据任务复杂度灵活选择。

## 相关实体

- [LFM — Liquid Foundation Model](../ch05/086-ai.html) — Liquid AI 的基础模型系列
- **Qwen 3.5 4B** — 经 Antidoom 测试的开源小模型（无独立实体页面）
- [GRAM — Off Switch for Dual Use Knowledge](https://github.com/QianJinGuo/wiki/blob/main/entities/off-switch-dual-use.md) — 同类精确对齐技术
- [Direct Preference Optimization (DPO)](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlhf-dpo-grpo-alignment.md) — FTPO 的基座算法
- **Entropy Collapse** — 推理模型中的熵坍塌（无独立概念页面）
- **Repetition Penalty** — 传统推理时循环缓解方法（无独立概念页面）
- **Chain-of-Thought Reasoning** — 推理轨迹与循环的关系（无独立概念页面）
- **LFM 2.5 Thinking** — Liquid AI 的移动端推理模型（无独立实体页面）
- **Alignment Taxonomy** — 对齐技术分类框架（无独立概念页面）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/antidoom.md)

---

