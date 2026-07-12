# CAMEL: 置信度门控反思机制用于奖励建模 — TikTok/NUS (ICML 2026)

## Ch01.1179 CAMEL: 置信度门控反思机制用于奖励建模 — TikTok/NUS (ICML 2026)

> 📊 Level ⭐⭐ | 1.7KB | `entities/icml-2026-camel-confidence-gated-reward-model-tiktok.md`

# CAMEL: 置信度门控反思机制用于奖励建模 — TikTok/NUS (ICML 2026)

CAMEL（Confidence-gAted RefLection for Reward Modeling）由 TikTok 与新加坡国立大学联合提出，将奖励建模改造为置信度门控反思机制：先以单 token 给出初判，置信度足够高直接输出，置信度低才触发 reflection 复核。

核心发现：两个 verdict token 之间的 log-probability margin 与判断正确性强相关，可作为"样本难度"的零成本信号，无需引入额外置信度模型。

在 RewardBench、RM-Bench、JudgeBench 上平均准确率 82.9%，较此前最佳提升 3.2%，以 14B 参数超过多个 70B 级奖励模型。置信度门控建立更优的准确率-成本 Pareto 前沿，简单样本只需 1 个 token，困难样本才进入反思。

训练方面引入 Counterfactual Prefix Augmentation，对每个样本构造强制初判为 A/B 的两个版本，用 GRPO 训练，奖励只取决于最终 verdict 是否正确，使反思成为真正的自我修正机制，无需额外人工解释标注。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/icml-2026-camel-confidence-gated-reward-model-tiktok.md)

---

