---
source_url: "https://mp.weixin.qq.com/s/8IxT4DleAsDbB2FSyy5W0w"
ingested: 2026-06-26
sha256: c77c3ab931543ed9
---

# 无惧Off-Policy偏移！Bengio团队解绑后训练，大模型RL提速50倍

> **来源**：数据派THU / PaperWeekly，2026年5月27日
> **论文**：Trajectory Balance with Asynchrony: Decoupling Exploration and Learning for Fast, Scalable LLM Post-Training（NeurIPS 2025），arXiv 2503.18929
> **代码**：https://github.com/bbartoldson/TBA

## 一句话

Yoshua Bengio 团队在 NeurIPS 2025 提出 TBA（Trajectory Balance with Asynchrony），用异步框架把 RL 后训练的采样（Searcher）和训练（Trainer）解耦，配合轨迹平衡目标处理 off-policy 数据，最高提速 **50 倍**，同时保持或提升性能。

## 问题：LLM 后训练为什么慢

PPO、RLOO、GRPO 等主流方法依赖 **on-policy 数据**：
1. 模型生成回答（rollout，逐 token 解码，慢）
2. 计算奖励
3. 更新策略（并行计算，快）

**瓶颈**：采样慢、训练快，训练必须等 rollout 完成，算力无法跑满。策略一更新，旧样本又变成 off-policy，无法复用。

## 解决方案：TBA 异步框架

**核心思路**：把采样和训练彻底拆开，让旧轨迹也能继续变成学习信号。

### 架构解耦

- **Searcher**：负责探索采样，维护相对滞后的模型权重，从 prompt 数据集生成回答，存入本地 replay buffer
- **Trainer**：持续从 replay buffer 抽样更新模型，不必等待每轮 rollout 完成
- **同步周期 k**：每隔 k 个优化步，同步 Trainer 最新权重到 Searcher，同时汇总各 Searcher 本地经验到全局 buffer

### 轨迹平衡（Trajectory Balance）处理 off-policy

传统 on-policy 方法直接用旧轨迹会导致策略偏移和训练不稳定。

TBA 选用 **VarGrad TB**（Trajectory Balance 变体），关键性质：**off-policy 可训**——只要采样分布具有 full support，轨迹不必来自当前策略。

梯度形式上，TB 在 on-policy 时退化为类似 REINFORCE 的形式；在 off-policy 异步环境中展现出远超传统方法的鲁棒性，无需复杂且极易失效的重要性采样修正。

### 动态采样调控（Replay Buffer）

Buffer 变大后不能纯随机采样（效率低），也不能纯奖励优先（输出同质化）。

TBA 的 **混合调节方案**（超参数 m = Most-On-Policy Probability）：
- 以概率 m 采样**最近一次同步**新加入 Buffer 的数据（离当前策略最近，最稳定）
- 其余 1-m 概率：用奖励分数的 Softmax 采样 + 均匀采样（保持多样性，不浪费历史高质量样本）

消融显示：数学推理任务对 m 较敏感，较高 m 通常更稳。

## 核心实验结果

### 数学推理（GSM8K）
- 比 **VinePPO**：训练时间缩短近 **50 倍**，Pass@1 准确率高 1.2%~1.8%
- 比 **Online DPO**：提速 **1.6 倍**，准确率提升 2.0%

### 偏好微调（TL;DR 摘要）
- 在 KL/perplexity 与 win-rate 权衡上形成更好的 **Pareto 前沿**
- 410M~2.8B 不同规模模型，均比优化后的异步 DPO 基线快 **3.8~5.3 倍**

### 自动红队（稀疏奖励）
- 比非分布式同步 GFlowNet 基线，wall-clock time 最快提升 **7 倍**
- Searcher 扩展能带来更高攻击成功率和 prompt 多样性

## 核心价值

| 维度 | 传统做法 | TBA |
|------|----------|-----|
| 采样-训练关系 | 同步等待 | 完全解耦 |
| Off-policy 数据 | 丢弃或重要性采样修正 | 直接用于训练（TB 目标） |
| 算力利用率 | 低（等待 rollout） | 高（异步并行） |
| 提速幅度 | baseline | 最高 50 倍（数学推理） |

## 一句话总结

TBA 用异步架构 + 轨迹平衡目标，把 LLM RL 后训练中最贵的采样环节从训练闭环里解耦出来，配合 replay buffer 的动态采样调控，实现了数量级的效率提升，同时不损失甚至提升模型性能。

---

*论文：arXiv 2503.18929 | 代码：https://github.com/bbartoldson/TBA*
