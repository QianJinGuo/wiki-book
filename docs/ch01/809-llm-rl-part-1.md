# LLM RL中的熵 part 1: 熵的调控

## Ch01.809 LLM RL中的熵 part 1: 熵的调控

> 📊 Level ⭐⭐ | 5.5KB | `entities/llm-rl中的熵-part-1-熵的调控.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/llm-rl中的熵-part-1-熵的调控.md)

## Summary
LLM RL中的熵：模型rollout多样性调控。熵随训练下降，维持适当熵水平重要。

## Notes
* Part 1 of a series on entropy in LLM reinforcement learning
* Feed: 炼钢AI

## 深度分析
本文系统梳理了 LLM RL 训练中熵（entropy）调控的多种技术方案，是理解 RL 用于 LLM 推理能力提升的重要的基础性文献。
**熵的本质含义**：在 LLM 生成中，熵衡量的是 token 概率分布的分散程度。熵高意味着模型对多个候选词都有相当概率， exploration 能力强；熵低意味着模型几乎确定地选择某个 token， exploitation 倾向明显。RL 训练天然倾向于降低熵——模型在获得正样本奖励后会更确定地选择某些 token，但这压缩了未来的探索空间。
**熵与性能的对立关系**：《The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models》发现，在没有熵干预的情况下，RL 模型的性能提升是以牺牲熵为代价换来的。这意味着标准的 RL 训练（PPO/GRPO 等）本身就是一个 exploration-exploitation 的零和博弈：过度 exploitation 导致熵坍塌，削弱训练后期模型探索更优路径的能力。
**八大调控方法的技术分类**：
| 方法 | 核心机制 | 主要局限 |
|------|----------|----------|
| 直接熵 loss | 在梯度中直接加入熵项 | α 难调，过大训练不稳定，过小收效甚微 |
| 动态熵系数 | 基于目标熵自适应调整 α | off-policy 程度大时失效 |
| Cov 调控 | 降低 action probability 与 advantage 的协方差 | 实现复杂，KL-Cov 相对更稳定 |
| On-policy 训练 | 保持 policy 更新前后采样分布一致 | 计算效率低 |
| Clip higher | 提高 importance sampling clip 上限 | 过大会导致熵失控发散 |
| CISPO | 解耦 importance sampling 系数与梯度传播 | 梯度从 log pi 反向传播，实现有一定复杂度 |
| 增大 KL loss 系数 | 限制策略偏移幅度间接保持熵 | 过大限制模型变化，降低效果 |
| 负样本训练 | 仅用 rollout 负样本更新模型 | 训练初期收敛慢，需在 pass@k 场景才有明显优势 |
**Clip higher 的机制细节**：这个方法通过放宽 importance sampling 的 clip 上限，让低概率 token（在推理路径中往往充当"分叉点"）有更多机会提升概率，增加策略熵。这是一个相对轻量的干预，但阈值设置需要仔细调优。
**Cov 调控的理论基础**：熵的变化量近似等于 log π 和 π·A 的协方差——当高概率动作同时获得高 advantage 时，熵倾向于下降。因此，打压这两者之间的正相关（即降低协方差）就能缓解熵坍塌。Clip-Cov 和 KL-Cov 分别通过直接 clip 和 KL 惩罚实现这一目标，其中 KL-Cov 更稳定，因为它通过限制 policy 与 reference model 的偏离来间接调控熵，是一种更软性的约束。

## 实践启示
1. **训练 LLM RL 时，将熵监控纳入训练指标体系**：仅看 loss 和 task reward 不够，熵的演化趋势是判断训练健康度的重要信号。当熵下降速度过快时，应提前介入（加入熵 loss 或调整 KL 系数），而非等到训练完全坍塌再修复。
2. **从 CISPO 的设计思路借鉴梯度流控制**：CISPO 的核心洞察是"clip 阻止的是 r 的梯度传播，但不阻止 log π 的梯度传播"。在遇到类似"某种系数被 clip 后梯度消失"的问题时，可以考虑用停梯度（sg）切断该系数与梯度计算的连接，让梯度从其他路径回传。
3. **优先尝试 On-policy 或低 off-policy 程度配置**：Skywork 的实验表明 mini batch num=1 或 2 时熵控制效果最好。在计算资源允许的情况下，保持较低的 off-policy 程度是预防熵坍塌的根本方法，比事后调控更有效。
4. **Clip higher 的上界设置应保守调整**：从 0.3（标准值）开始，每次小幅度提高（如 0.35 → 0.4），同时监控熵是否出现发散趋势。一旦熵曲线出现上扬失控的迹象，应立即回退。

## 相关实体
- [llm-rl中的熵-part-2-熵对训练的调控](ch01/882-llm.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-research-frontiers.md)

---

