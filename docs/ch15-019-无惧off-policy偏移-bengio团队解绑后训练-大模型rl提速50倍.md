## Ch15.019 无惧Off-Policy偏移！Bengio团队解绑后训练，大模型RL提速50倍

> 📊 Level ⭐⭐⭐ | 8.5KB | `entities/trajectory-balance-asynchrony-tba-bengio-papweekly.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/trajectory-balance-asynchrony-tba-bengio-papweekly.md)

# TBA：解绑后训练，RL 提速 50 倍

## 一句话

Yoshua Bengio 团队（NeurIPS 2025）：异步框架把 RL 后训练的采样（Searcher）和训练（Trainer）解耦，轨迹平衡目标让 off-policy 数据直接用于学习，数学推理任务最高提速 **50 倍**。

## 核心问题

LLM 后训练中，rollout（逐 token 生成）慢，训练（并行计算）快。主流 on-policy 方法（PPO、RLOO、GRPO）必须等 rollout 完成才能更新策略，算力浪费严重。

## 解决方案：TBA 架构

**Searcher**：维护滞后模型权重，负责采样生成轨迹，存入本地 replay buffer

**Trainer**：持续从全局 buffer 抽样子耍更新模型，不必等待 rollout

**同步周期 k**：每隔 k 步同步权重 + 汇总经验

**轨迹平衡（TB）目标**：off-policy 数据只要分布有 full support 即可用于训练，无需重要性采样修正

**动态采样**：概率 m 选最近样本（稳定）+ 1-m 概率用 Softmax + 均匀采样（多样）

## 关键数字

- GSM8K：比 VinePPO 提速 **50 倍**，准确率 +1.2%~1.8%
- TL;DR PFT：比异步 DPO 快 **3.8~5.3 倍**
- 自动红队：比同步 GFlowNet 提速 **7 倍**

## 深度分析

### 异步架构的本质：解耦搜索与学习

TBA 的核心突破在于将 LLM RL 后训练中固有的「采样-训练」耦合彻底拆除。传统 on-policy 方法要求策略在生成轨迹后才能更新，这导致快速计算单元（GPU 并行训练）必须等待慢速生成单元（自回归 token 解码），算力利用率长期低迷。TBA 通过引入双进程架构——Searcher 负责采样、Trainer 负责更新——让两者并行运作，通过全局 replay buffer 异步交互。这意味着训练不再阻塞于 rollout，Trainer 可以持续利用历史样本提升策略。

### 轨迹平衡目标为何适合 off-policy 场景

轨迹平衡（TB）目标来自 Flow-based 生成模型理论，其梯度形式在 on-policy 时退化为类似 REINFORCE 的标准策略梯度。关键在于 TB 的「full support」性质：当采样分布覆盖当前策略的支持集时，即使轨迹来自旧策略，其梯度估计依然无偏。这意味着 TBA 无需使用 PPO 等方法中的重要性采样修正——那些修正在 off-policy 程度加深时往往引入剧变方差甚至数值崩溃。TB 的这种鲁棒性来自其目标函数的形式：它不直接依赖策略概率比，而是通过轨迹级别的平衡约束隐式处理分布偏移。

### 动态采样 m 的调节逻辑与敏感性

Buffer 规模增长后，纯随机采样效率低下（低奖励样本稀释学习信号），纯优先级采样又会导致输出多样性崩溃。TBA 的混合采样通过超参数 m（Most-On-Policy Probability）控制：m 比例采样最新同步数据保证稳定性，1-m 比例通过奖励 Softmax + 均匀采样维持多样性。实验显示数学推理任务对 m 敏感度较高，可能因为数学问题的奖励 landscape 更崎岖，需要更多近期样本来保持训练稳定。这一发现暗示：在奖励信号稀疏或非连续的领域，m 应该设置得更高。

### 与 DPO 异步变体的关键区别

异步 DPO 同样尝试采样-训练解耦，但 DPO 的偏好对比损失对 off-policy 偏移的敏感度远高于 TB。DPO 要求样本来自当前策略或其邻近分布，否则 KL 约束项会引入偏差。TBA 的 TB 目标在异步环境下展现出远超异步 DPO 的稳定性，且在 TL;DR 摘要任务中形成更好的 Pareto 前沿——这说明 TB 目标的分布匹配假设比 DPO 的对比学习假设更适合大规模异步场景。

### 搜索er扩展性：自动红队场景的启示

自动红队实验中，Searcher 扩展性带来更高攻击成功率和 prompt 多样性。这揭示了一个重要规律：当奖励稀疏时（如安全红队），采样数量比采样质量更关键。Searcher 数量增加等同于探索宽度扩展，即便每个 Searcher 的策略相对落后，汇总后的 replay buffer 也能覆盖更广的状态空间。TFlyPerch 的同步 GFlowNet 基线在稀疏奖励下表现受限，正是因为同步等待机制严重压缩了有效探索步数。

## 实践启示

### 工程落地要点

1. **同步周期 k 的选择**：k 太小（如 k=1）等同于同步训练，失去异步优势；k 太大导致 Searcher 策略严重落后，TB 的 off-policy 容忍度虽然高于 PPO，但过大的策略偏移仍会降低样本效率。建议从 k=10~50 开始，根据 GPU 集群规模调整。
2. **Replay Buffer 内存管理**：Searcher 本地 buffer 存轨迹，Trainer 从全局 buffer 抽样。轨迹长度可能达到数万 token（如长回答任务），需预估内存峰值：Buffer 容量 × 平均轨迹长度 × Token 嵌入维度。
3. **m 的领域适配**：数学/代码等奖励信号连续且可微的领域，m 可适度降低（0.6~0.8）；偏好学习/安全等奖励稀疏或离散的领域，建议 m ≥ 0.9。

### 适用场景判断

TBA 最适合以下场景：
- **rollout 成本高、训练成本低**：如大模型生成、复杂环境交互
- **off-policy 数据可获取**：已有大量历史轨迹或可利用其他模型的采样
- **奖励信号相对稠密**：TB 对稀疏奖励的容忍度不如密集奖励

TBA 不适合以下场景：
- **完全同步要求**：某些安全关键应用不允许异步权重更新
- **轨迹极短且 rollout 极快**：此时异步开销可能超过收益
- **重要性采样修正必须精确**：如果你的场景要求严格 on-policy（如某些理论分析必须保证无偏梯度），TB 的 full support 假设可能不满足

### 与现有基础设施的整合

对于已有 PPO/GRPO 管线的团队，TBA 的迁移成本主要集中在：
- 实现 Searcher-Trainer 双进程架构 + 全局 replay buffer
- 替换策略梯度损失为 TB 目标（VarGrad 版本）
- 调整同步周期 k 和采样超参数 m

代码库层面，TBA 的核心修改集中在 Reward Model 下游、Policy 更新上游，理论上可以保留大部分现有基础设施。

## 一句话总结

TBA 把采样从训练闭环里解耦出来——这是 LLM RL 后训练数量级效率提升的核心。
## 相关实体
- [On Policy Distillation Vs Offline Distillation Loster](ch04-181-co-existence-vs-co-intelligence-mollick-s-paradigm-shift-on.html)
- Overcoming Reward Signal Challenges Verifiable Rewards Based Reinforcement Learn
- [Reinforcing Recursive Language Models Alphaxiv](ch01-636-reinforcing-recursive-language-models-alphaxiv.html)
- Skillos
- [Yann Dubois Openai Post Training Interview](ch01-374-introducing-the-ettin-reranker-family.html)

---
