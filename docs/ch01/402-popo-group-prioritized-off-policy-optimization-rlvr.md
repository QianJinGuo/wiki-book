# POPO (Group Prioritized Off-Policy Optimization)：清华 RLVR 训练高效组级回放框架

> 📊 Level ⭐⭐⭐⭐ | 11.0KB

## 核心概述

清华大学自动化系提出的 POPO（Group Prioritized Off-Policy Optimization），面向 LLM reasoning RLVR 训练的高效 off-policy 优化框架。核心洞察：GRPO 类 RLVR 训练中大量 rollout 生成的是 "无效样本"（组内 reward 方差为 0，无训练信号）。POPO 不额外做 rollout，而是将当前 batch 中的无效组替换为最近缓存过的高质量有效组，并通过解耦式 off-policy 重要性采样稳定更新。

→ [原文存档](https://mp.weixin.qq.com/s/3vzTIiAgp3BID9E1lO5MhQ)

## 问题背景

在 GRPO 等组内归一化 RLVR 算法中，模型对同一 prompt 生成一组回答并计算相对优势。当组内全部正确或全部错误时，reward 方差为 0，优势消失——这些样本被称为 **ineffective samples**。这类问题在 RLVR 训练中非常普遍，简单题全部答对、难题全部答错，均消耗 rollout 成本却无学习信号。

## 核心设计

### Priorized Group Replay（优先级组回放）
- 维护小型 FIFO replay buffer，存放最近遇到的有效（reward 方差 > 0）response group
- 每步训练：rollout → 按方差分离有效/无效组 → 保留有效组 → 无效组由 buffer 中最近有效组补齐
- **组级回放**而非轨迹级：整组来自同一历史策略，维持组内一致性，可做 off-policy 校正

### Decoupled Off-Policy Optimization（解耦式 off-policy 优化）
- 行为策略（说明回放数据来源）与近端约束策略（约束更新不偏离旧策略）拆开
- 重要性采样校正 off-policy bias + trust-region 保持稳定性

## 实验结果

| 设置 | POPO | DAPO | 节省 |
|------|------|------|------|
| DSR-7B 分布内 | 63.3 | 63.2 | — |
| DSR-7B 训练时间 | **34h** | 55h | 38% |
| Countdown 准确率 | 60.4 | 61.5 | — |
| Countdown rollout | **205k** | 877k | 77% |
| Countdown 训练时间 | **3.2h** | 5.6h | 43% |
| Geometry 准确率 | 50.0 | 50.6 | — |
| Geometry rollout | **492k** | 1438k | 66% |
| Geometry 训练时间 | **6.8h** | 11.2h | 39% |

POPO 用约 **30%** 的 DAPO rollout 预算达到接近 DAPO 的性能，通常只需 40%-70% 训练步数即达 GRPO 终值。

## 消融关键

- 仅过滤不补齐（GRPO-filter）：效果不足
- 久远历史回放（POPO-stale）：性能崩溃 → replay 必须足够近 β
- 解耦式目标优于简单 on-policy 处理或完全对齐行为策略

## 兼容性

不同 response group size (k=4~32) 稳定优于 GRPO；可结合 RLOO、PPO、MoPPS 使用。

## 设计取舍

| 选择 | 收益 | 代价 |
|------|------|------|
| 组级回放 vs 轨迹级回放 | 组内一致性 + off-policy 可校正 | buffer 更大 |
| FIFO recency 近似 vs KL 选择 | 更高效 | 略低精确度 |
| 解耦式优化 | 稳定 off-policy 训练 | 多维护一个行为策略引用 |

## 深度分析

### 无效组是 rollout 预算的真正漏斗

RLVR 的成本结构和 SFT 完全不同：算力大头不在反向传播，而在于为每个 prompt 生成一整组长链推理。GRPO 类算法随后在组内做归一化，只有一个奖励方差非零的组才能产出有效优势。于是 rollout 预算的浪费分成两层：第一层是显而易见的"答案写错了"，第二层则是更隐蔽的"整组全对或整组全错、方差为零"。第二层尤其危险——它不产生任何梯度，却在日志上表现为一次完全正常的生成，几乎不会触发任何告警。论文把这两种情况统一归为 **ineffective sample**：题目太简单则全部答对，题目太难则全部答错，而 RLVR 的难度分布两端恰恰长期存在且不断刷新（模型变强会把曾经的难题推入"全对"区间，把当前难题留在"全错"区间）。因此真正该优化的不是"少生成一些 token"，而是"把无效组的生成预算转嫁给有效组"。POPO 的关键选择是**不改变每个 batch 的 rollout 总量**，只把已经付过费的无效组替换为缓存中的有效组——它回收的是浪费，而不是压缩预算，这也解释了为什么它的性能不会因"看得更少"而系统性下降。

### 为什么必须是组级回放，而不是轨迹级

回放的粒度决定了 off-policy 校正是否可做。轨迹级回放（缓存历史成功轨迹、无效时插入）看似更省，实际会破坏组内一致性：同一个 response group 里混入来自不同时间点、不同策略的轨迹后，组内归一化本身就不再是一个合法的相对优势估计，因为基线已经失去意义，而且"这一组的 off-policy 距离"变成了不可定义量。POPO 在 group 级别回放——一整组 responses 来自同一个历史策略，组内 reward 方差非零、相对优势依然合法，同时该组相对当前策略的 off-policy 距离可以被一次性、干净地校正。这条推理把"组"从 GRPO 的统计单位升级成了工程单位：既然组内归一化依赖组内同源性，那么可复用的最小单元也只能是整组。代价是 buffer 要按组存储而不是按条存储，内存占用更大，这是设计上必须付的账。

### recency 与 trust-region 的取舍

回放数据越旧，行为策略与当前策略的差距越大，重要性采样的方差越高，trust-region 约束也越难同时满足"纠正 bias"和"不偏离旧策略"这两个目标。消融给出了非常干净的结论：**POPO-stale(10)（从久远历史回放）性能崩溃**，而按 FIFO 优先取最近存入的组则稳定有效。这说明在 RLVR 训练里，策略分布漂移的速度快到"有效样本"会迅速变成"危险样本"——一个组在存进去时方差非零，几轮更新之后它对应的优势方向可能已经过时。POPO 用 FIFO recency 作低成本 off-policy 距离的近似，而不是真的去算 KL：POPO-KL（用 KL 选择回放组）效果接近，但训练时间从 3.2h 涨到 4.8h。用一点点精确度换掉近一半的额外开销，是很典型的效率优先取舍。另一个崩溃点是 POPO-π_old：把回放数据当作 on-policy 数据训练，同样导致性能崩溃——这反证了"解耦式目标"不是装饰，而是让回放可用的必要条件。

### POPO 的适用边界

POPO 的收益与"无效组在 batch 中的占比"直接挂钩，这既是它的力量也是它的边界。当任务难度已经和模型能力良好匹配、绝大多数组都方差非零时，可替换的无效组很少，回放几乎不产生增益，反而白白引入 off-policy 方差；当 rollout 相对其他开销并不昂贵（例如短链任务或已在极高吞吐的推理栈上），省下的预算也不足以改变训练总时长。此外需要注意 POPO 的定位是**预算效率而非精度突破**：Countdown 60.4 vs DAPO 61.5、Geometry 50.0 vs 50.6，准确率基本持平略低，真正亮眼的是 rollout 数与时间的下降（Countdown 205k vs 877k、Geometry 492k vs 1438k，约 30% 的 DAPO rollout 预算，40%–70% 的 GRPO 步数达到其终值）。把它当作"同等效果下更便宜"的工具，而不是"更便宜还更强"的工具，才符合数据。这类思路与 [单 rollout 异步优化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/single-rollout-asynchronous-optimization-agentic-rl-arxiv-2607-07508.md)、[decoupled async GRPO](https://github.com/QianJinGuo/wiki-public/blob/main/entities/async-grpo-lora-hf-jobs-decoupled-training-vllm-2026.md) 属于同一族谱：都在回答"如何让每一条已生成的轨迹被用满"，可参照 [RLVR 概念页](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md) 与 [RLVR 熵崩溃治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rlvr-entropy-collapse-steer-acl-2026-outstanding.md) 一起读——后者处理的是训练信号的退化，POPO 处理的是训练信号的缺失。

## 实践启示

1. **先量化再动手**：上线回放前先统计每个 batch 中"组内 reward 方差为 0"的比例，以及其中全对/全错的构成。这个比例就是 POPO 的收益上限；若它低于一成，优先去做难度筛选或数据配比，而不是搭 replay 管线。
2. **buffer 要小、要环形、要近**：维护一个按组存储的小型 FIFO buffer，取用时永远优先最近存入的组并存下其生成时的策略标识。不要为了"样本丰富"去扩大容量或做"最优组"打分——recency 在这里是安全机制，不是性能旋钮。同时保留一个"故意从久远历史回放"的自检配置：如果它不崩，说明策略漂移监控或 trust-region 实现有问题；如果它崩得比论文更早，说明回放窗口太宽，需要收紧。
3. **回放数据必须带行为策略走完整套 off-policy 目标**：绝不能把缓存组当 on-policy 数据丢进损失函数（对应 POPO-π_old 的崩溃）。行为策略、近端约束策略、重要性采样三者要一起到位，缺任何一个都可能表现为"训练前期正常、中后期突然发散"。
4. **不要只过滤，要补齐**：GRPO-filter（丢掉无效组但不回填）只是让 batch 变小，收益有限。要么过滤 + 回填，要么就别改 batch 构成——半吊子改动最容易在报告里被误读成"方法无效"。
5. **报告节省数字要交代口径**：rollout 数的下降（77%、66%）和训练时间的下降（38%、43%、39%）是两套不同口径，后者受采样实现、并行度与硬件影响极大。同时必须并列给出准确率对照，否则"省了 77% rollout"容易被读成"性能没变"，而实际数据是接近但略低（60.4 vs 61.5）。节省声明只有在"同配方、同硬件、同评测集"下才可比较。
6. **与其他效率工作叠加而非替代**：POPO 在 k=4~32 的 group size 下均稳定优于 GRPO，可与 RLOO、PPO、MoPPS 叠加。最优组合通常是"主动采样控制难度分布 + 回放回收无效组"，二者分别作用于生成之前与生成之后，而不是二选一。

## 相关实体

- [2026 年面向 LLM 的 RL 方法总结](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2026-llm-rl-algorithms-deeplog-imba-ppo-dpo-grpo-marl.md) — PPO/DPO/GRPO 全景综述
- [APPO：阿里高德 Agent RL 信用分配到每个决策点](https://github.com/QianJinGuo/wiki-public/blob/main/entities/appo-agentic-procedural-policy-optimization-amap-ml-2026.md) — 另一 ARPO 系列 RL 方法
- [Self-Taught RLVR：京东让大模型自己教自己](https://github.com/QianJinGuo/wiki-public/blob/main/entities/self-taught-rlvr-jd-cii-2026.md)

---

