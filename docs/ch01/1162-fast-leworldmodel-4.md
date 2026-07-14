# 世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍

## Ch01.1162 世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍

> 📊 Level ⭐⭐ | 2.9KB | `entities/世界模型太慢西交大提出fast-leworldmodel用动作前缀并行预测让动态估计加速4倍.md`

# 世界模型太慢？西交大提出Fast LeWorldModel：用「动作前缀并行预测」让动态估计加速4倍

本文第一作者为西安交通大学硕士生高云天，通讯作者为西安交通大学教授许翔宇，其研究方向涵盖世界模型、三维视觉与具身智能（个人主页：https://xuxy09.github.io/）

  

在视觉规划与具身智能中，“世界模型” 被认为是智能体走向通用决策能力的核心组件：在真正执行动作之前，先在潜在空间中 “想象未来”，再选择最优行为。

  

但在视觉规划里，这个 “想象” 过程往往很慢。

  

以 LeWorldModel（LeWM）为例，它在规划时有一个重要瓶颈：每评估一条候选动作序列，模型都要一步步自回归 rollout。也就是说，LeWM 先预测下一步 latent，再把预测出的 latent 输入 dynamics model，继续预测下一步：

  

  

这种方式有两个问题：一是规划慢，CEM 需要反复评估大量候选动作序列；二是误差会沿 imagined trajectory 累积，早期预测偏一点，后面可能越滚越偏。

  

针对这一瓶颈，西安交通大学研究团队提出了 Fast LeWorldModel（Fast-LeWM），试图从根本上改变世界模

## 要点
- 型的预测方式：从 step-by-step rollout 变成 trajectory-level parallel prediction。
- * 代码：https://github.com/Yuntian-Gao/Fast-LeWorldModel
- 它的核心思想非常直接：不再用一步转移模型反复 rollout，而是把一段动作序列的不同前缀作为预测单元，直接并行预测执行这些动作前缀后到达的未来潜变量，并且通过密集的监督迫使模型学会状态随着不同动作序列的演化过程，而非状态的单步转移。
- 换句话说，模型不再问：“执行下一个动作后会怎样？”，而是直接问：“执行 1 个、 2 个、…… H 个动作后，分别会到达什么状态？”
- 实验显示，在与 LeWM 相同的规划协议下，Fast-LeWM 将平均成功率从 85.8% 提升到 90.5%；加入自一致性约束后进一步提升到 92.0%。同时模型的 rollout 中的动态模块耗时从 31.4s 降至 8.0s，完整 CEM 求解时间从 54.4s 降至 28.3s。
- 其中当前 latent z_t 是模型输入，未来 latent  是训练监督目标。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/世界模型太慢西交大提出fast-leworldmodel用动作前缀并行预测让动态估计加速4倍.md)

---

