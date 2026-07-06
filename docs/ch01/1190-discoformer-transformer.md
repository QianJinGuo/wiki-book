# DiScoFormer — 跨分布密度和分数估计的统一 Transformer

## Ch01.1190 DiScoFormer — 跨分布密度和分数估计的统一 Transformer

> 📊 Level ⭐⭐⭐ | 1.6KB | `entities/discoformer-density-score-transformer-allen-ai.md`

# DiScoFormer — 跨分布密度和分数估计的统一 Transformer

DiScoFormer（Density and Score Transformer）是 Allen AI 提出的一种新方法，使用单一 Transformer 模型同时估计数据分布的密度和分数（score），且无需针对新分布重新训练。

核心创新：
- **统一架构**：共享骨干网络 + 双输出头（density head + score head），一次前向传播完成两种估计
- **交叉注意力**：可在任意查询点评估密度和分数，不限于有数据的区域
- **一致性损失**：density 和 score 之间存在数学关系（score = ∇log density），两者之间的差异构成无标签一致性损失。推理时通过在该损失上取梯度步，模型可零样本适配分布外输入
- **零样本适配**：无需 ground-truth 密度或分数，即可适应新的数据分布

该工作解决了 KDE（通用但高维精度差）和神经分数匹配（需重训）之间的权衡问题，对 diffusion 模型和贝叶斯采样有潜在影响。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/discoformer-one-transformer-for-density-and-score.md)

---

