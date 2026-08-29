# BEACON：里程碑引导的 Long-Horizon 语言智能体策略学习（ICML 2026）

> 📊 Level ⭐⭐⭐ | 4.2KB | `entities/beacon-milestone-guided-policy-learning-long-horizon-agent-zju-2026.md`

# BEACON：里程碑引导的 Long-Horizon 语言智能体策略学习（ICML 2026）

## 问题：长程任务的信用分配病根

用强化学习训练语言智能体时，任务是一步一步完成的，但奖励只在最后一刻给出。以主流 GRPO 为例，它采用轨迹级稀疏终局奖励，整条轨迹共享同一个优势值，在长程任务中暴露两个缺陷：**信用误分配（Credit Misattribution）**——前 20 步都走对、第 25 步出错，整条轨迹被判负，正确的早期动作一起挨罚；**样本利用率低（Sample Inefficiency）**——长程任务成功轨迹本就稀少，一组 rollout 全部失败时组内奖励方差为零，优势函数归零，这批样本对训练毫无贡献。

## 方法：里程碑引导的三步框架

浙江大学联合百度提出 BEACON（Milestone-Guided Policy Learning）。里程碑由环境给定的指示函数 Φ 判定（无需额外训练模型），三个环境的实现各异：ALFWorld 通过物体持有/加热状态等谓词判断关键步骤；WebShop 通过搜索结果、商品属性、下单确认页等检查点判定进展；ScienceWorld 直接读取环境自带 subgoal_completed 接口。

框架三步：

1. **轨迹分段**——在里程碑边界处把整条轨迹切成若干段
2. **段内时间衰减奖励**——已完成段内动作获得 `r = R · γ^(t_k − t)` 塑形奖励，离里程碑越近信用越高，部分成功不再被浪费
3. **双尺度优势估计**——轨迹级优势沿用 GRPO 把握全局，段级优势只在到达同一里程碑的轨迹间比较，线性组合 `Â = A_traj + λ · A_seg`

整个方法只引入两个超参数（衰减因子 γ 与段级权重 λ），实现简单。

## 实验结果

在 ALFWorld、ScienceWorld、WebShop 三个基准、1.5B 与 7B 两个模型规模上一致超过 GRPO 和 GiGPO：ALFWorld 长程任务成功率从 GRPO 的 **53.5% 提升到 92.9%**；有效样本利用率从 **23.7% 提升到 82.0%**；零优势比例从约 55% 降到约 10%。

- 领先幅度随任务长度单调扩大：相对增益从短程 +26.2% 扩大到长程 +73.6%，而 GiGPO 在长程趋于平台
- 收益来自策略优化而非里程碑模仿：用 oracle 轨迹做 SFT（行为克隆）仅 43%，BEACON 达 91.4%
- 收敛速度约为 GRPO 的 2.4 倍（第 50 迭代达 60% 成功率，GRPO 要到第 120 迭代），策略熵平滑下降
- BEACON 信用集中率 CCR=0.84 在各方法中最低但性能最好——保留渐进式梯度信用优于激进地只奖励里程碑动作

## 意义

BEACON 直接命中长程 RL 的信用分配病根：任务视野越长，里程碑式信用分配的优势越明显。它把「任务本身有组合结构，信用分配也应该有结构」这一直觉落地为可训练、仅两个超参数的简单框架，为长程语言智能体的 RL 训练提供了 GRPO 的可直接替代方案。

## 相关实体

- → [Agentic RL 六框架实践地图](../ch04/314-agentic-rl.html)
- → [信用分配 Credit Assignment](../ch03/006-agent.html)
- → [SEED 自进化 OPD 长程 Agent RL](../ch03/006-agent.html)
- → [Long-Horizon Agent 综述](../ch03/006-agent.html)
- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/beacon-milestone-guided-policy-learning-long-horizon-agent-zju-2026.md)

---

