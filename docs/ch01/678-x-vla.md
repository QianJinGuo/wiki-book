# 上交 x 阿里：闭眼先学动作 VLA

> 📊 Level ⭐⭐ | 9.1KB | `entities/上交-x-阿里让机器人闭眼先学动作vla-成功率涨-43.md`

# 上交 x 阿里：闭眼先学动作 VLA

> **v×c score**: 64 | stars=4
> **来源**: https://mp.weixin.qq.com/s/6QgldL0W5kMDTLj-lq28Vg
> **发布**: 阿里技术 (2026-07-13)

## 摘要

LA4VLA（Learning to Act without Seeing via Language-Action Pretraining）由上海交通大学与阿里巴巴联合提出，核心思想是将 Language-Action Pretraining 从标准 VLA（Vision-Language-Action）Pretraining 中显式解耦出来，作为一种独立的预训练信号。研究诊断发现：标准 VLA 训练中语言监督被视觉-动作信号淹没，模型看似在根据语言执行指令，实则高度依赖视觉-动作捷径。LA4VLA 在无视觉输入设置下让模型先学习语言指令如何约束连续动作轨迹，再结合标准 VLA 训练。在 MetaWorld 上达 87.53% 成功率（+17.8%），LIBERO 上达 96.28%（+3.4%），真实机器人平均成功率从 38.3% 提升至 83.3%（+45%），视觉扰动下从 27.5% 提升至 70.0%（+42.5%）。项目开源在 github.com/MINT-SJTU/LA4VLA。

## 核心要点

- **标准 VLA 训练中的语言监督不足问题**：一条机器人示范轨迹对应一句高层任务指令（如 "clean the table"），但轨迹内部包含抓取、抬起、移动等多个局部动作阶段。视觉和动作信号逐帧变化，语言信号整条轨迹不变——语言-动作对应关系未被显式标注，模型更容易依赖视觉-动作关联做预测。
- **诊断实验证明视觉依赖**：在语言指令保持不变但视觉输入被移除、替换或与语言冲突时，模型预测轨迹明显偏向视觉暗示的方向而非语言指令方向。模型「看起来在听指令」，实际高度依赖配对视觉输入。
- **解耦式预训练：先学语言-动作，再看世界**：LA4VLA 将 Language-Action Pretraining 从标准 VLA 中解耦，在无视觉输入下让模型仅根据语言指令和机器人状态预测动作轨迹，形成 vision-agnostic 的 language-action priors。
- **LA-33K 数据集**：33,116 条人工核验的 Language-Action episodes，通过关键帧检测、VLM temporal segmentation 和人工核验，将已有 VLA 示范数据中的语言-动作监督信号显式暴露出来，无需额外机器人数据采集。
- **LA pretraining 优于 matched VLA pretraining**：在完全相同的原子动作片段上，移除视觉输入做 LA pretraining 的效果优于保留视觉输入做标准 VLA pretraining。说明更集中的语言-动作监督比有视觉辅助的训练更有效。

## 深度分析

### 解耦式学习的理论基础：为什么「闭眼先学动作」有效？

LA4VLA 的核心洞察是一个在 VLA 社区长期被忽略的训练偏差：标准 VLA 训练中视觉、语言和动作的监督密度不对等。视觉信号逐帧密集变化（大量 visual tokens），动作信号同样是密集时间序列，而语言信号在全轨迹中保持不变。模型在训练中自然倾向于学习 visual-action association 这种更「容易」的映射，而非 language-action 这种更稀疏的对应关系。

解耦式学习通过刻意移除视觉输入，强制模型关注语言-动作对应关系。这种「信息剥夺」策略在认知科学中有深刻基础——当多个感官通道同时提供信息时，系统倾向于利用最可靠的通道。通过暂时消除视觉这个「最可靠的捷径」，模型被迫发展出稳健的语言-动作表征。实验的证据之一是 t-SNE 可视化：标准 VLA-trained policy 的内部表示中不同方向指令混在一起，而 LA-pretrained policy 形成按指令方向清晰分离的聚类。

### 语言-动作先验的跨场景可迁移性

LA pretraining 的一个关键特性是其跨场景泛化能力。因为没有依赖具体图像（物体外观、背景布局、场景特定目标选择），学到的 language-action priors 是视觉无关的，可以应用于不同场景。实验中 LA pretraining 的效果跨 MetaWorld 和 LIBERO 两个 benchmark、跨不同 VLA 架构（从简单 MLP 到 Transformer）一致成立，并且正向迁移到真实机器人操作。

这种跨场景可迁移性的工程意义在于：language-action priors 可以被预训练一次后作为基础能力模块，在不同具身场景中复用的基础能力——类似于 NLP 中的预训练语言模型作为通用基础能力。

### LA pretraining 与 VLA pretraining 的互补关系

一个反直觉但重要的发现是：LA pretraining 优于 matched VLA pretraining（在相同片段上保留视觉输入的预训练）。这挑战了「更多信息总是更好」的直觉。在预训练阶段刻意减少信息（移除视觉），反而促进了下游任务中更有效的特征学习。

实验中的最佳方案是 MixPT（混合 LA 与 VLA 数据在同一阶段训练），在 MetaWorld 上达 87.53%，在真实机器人上达 83.3%。这表明语言-动作先验和视觉-动作先验不是竞争关系而是互补关系：LA supervision 提供不依赖具体图像的 language-action priors，VLA supervision 保留视觉输入提供 visual grounding。二者结合后，机器人既能听懂语言指令，也能看懂视觉环境。

### 视觉扰动鲁棒性的突破

更值得关注的是视觉扰动下的结果：No pretraining 仅 27.5% → LA alone 67.5% → MixPT 70.0%。这意味着 LA pretraining 带来的不仅是平均性能提升，还有对视觉观测质量的鲁棒性。在实际部署中，摄像头可能有噪声、光照变化、遮挡等，LA pretraining 提供了一种不依赖完美视觉输入的操作能力，这对机器人的真实世界部署至关重要。

### 与机器人模仿学习的联系

LA4VLA 的方法在思想层面与机器人模仿学习和行为克隆（Behavioral Cloning）有深刻的联系。传统 BC 面临的 compounding error 问题部分源于模型对视觉状态的过度拟合——模型学到的是在特定视觉状态下的动作，而非抽象的任务语义。LA pretraining 通过强制学习视觉无关的语言-动作映射，事实上为 BC 提供了一种正则化机制，使策略对视觉变化更鲁棒。

## 实践启示

1. **预训练阶段的「信息剥夺」策略值得借鉴**：在 VLA 预训练中刻意移除视觉输入，强制模型学习更抽象的语言-动作映射，可以显著提升下游任务性能。这提示在其他多模态场景中也可以尝试类似的解耦预训练策略
2. **数据组织比数据量更重要**：LA4VLA 没有新采集数据，而是通过更好的数据组织（轨迹切分 + 局部动作描述）从已有数据中挖掘新的监督信号。这种「数据效率」思路对计算资源有限的团队有直接参考价值
3. **混合训练（MixPT）是最佳实践**：在相同预训练阶段混合 LA 与 VLA 数据比两阶段训练效果更好。工程实现上这意味着可以设计多任务预训练目标，而非严格分阶段训练
4. **关注视觉扰动鲁棒性**：42.5% 的视觉扰动提升意味着在真实机器人部署中，应当将 LA-style pretraining 作为标准组件纳入训练 pipeline，以应对实际环境中的视觉变化
5. **Language-action priors 可作为基础模型能力**：类似 NLP 中的预训练语言模型，language-action priors 可以作为机器人领域的基础预训练模块，在不同任务和场景中复用

## 相关实体

无直接可链接的现有实体页。相关研究参考 LA4VLA 论文及 MetaWorld、LIBERO 基准测试社区。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/上交-x-阿里让机器人闭眼先学动作vla-成功率涨-43.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

