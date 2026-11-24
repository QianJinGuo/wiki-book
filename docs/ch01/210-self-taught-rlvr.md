# Self-Taught RLVR 综述

> 📊 Level ⭐⭐⭐ | 9.6KB

## 三种 Self 框架
| 方法 | 维度 | 核心思想 |
|------|------|---------|
| RLSD | informed self | 由特权信息增强的自身教自己 |
| NPO | temporal self | 由近未来的自身教自己 |
| CoPD | parallel-self | 由走另一条路的自身教自己 |

## RLSD：OPSD + RLVR 解耦
**问题**：OPSD存在不可消除的mutual information gap——KL散度无法收敛，信息泄漏无法避免。
**解决**：解耦"方向"和"幅度"：

- **RLVR**决定方向（环境奖励→token强化/惩罚）
- **自蒸馏**决定幅度（evidence ratio→token更新力度）
**效果**：200步 > GRPO 400步

## NPO：Near-Future Policy Optimization
**核心指标**：有效学习信号S=Q/V

- Q（质量）：轨迹足够强，有新东西可学
- V（值函数）：轨迹离当前足够近，模型容易吸收
**核心思想**：用near-future checkpoint引导当前——未来更强但同一条优化进程延伸的天然teacher。
**效果**：GRPO 57.88 → NPO 62.84 → AutoNPO 63.15

## CoPD：协同进化蒸馏
**发现**：信号转化效率a_p由teacher-student行为重合度O决定——越像越容易吸收。
**问题**：静态OPD在O最低的时刻做蒸馏，a_p被压到很低。
**解决**：训练中蒸馏而非训练后，多个expert分支互为师生、协同进化：

- 各分支RLVR推动能力边界
- Mutual OPD拉近行为模式，降低后续吸收成本
**意义**：暗示新的model parallel training模式和scaling范式。

## 深度分析

### Ill-posed 目标函数：同参数空间自蒸馏的数学边界

OPSD 的失败模式极具诊断价值：在极少数据上约 20 step 内快速收敛，随后出现信息泄漏——推理时引用并未真正看到的"参考解"，性能逐渐坍塌。 RLSD 的理论贡献在于证明这不是训练不稳定，而是目标函数 ill-posed：训练目标中存在不可消除的 mutual information gap I(Yt; R | X, Y0)，KL 散度永远降不下去，每一步训练都在把 x→r 的虚假相关性写进参数。

这意味着一个普适边界：当 teacher 与 student 共享同一参数空间时，"真正学会了"与"记住了参考答案"在 KL 目标下不可区分——问题不在实现而在目标结构，任何"注入特权信息后让模型教自己"的方案都必然撞上这堵墙。RLSD 的解法是放弃让单一目标同时承载两种信息：方向交给 [RLVR](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md)（环境奖励决定每个 token 的强化/惩罚，可靠但稀疏），幅度交给自蒸馏（teacher/student 的 evidence ratio 决定每个 token 的更新力度，密集但单独使用不可靠）。 两个信号正交互补，200 步训练超过 [GRPO](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/grpo-policy-optimization-2026.md) 400 步的效率提升来自信号结构的优化组合，而非某个算法本身更优越。

### Near-future teacher：S=Q/V 对信号两难的第三条路

NPO 把"该引入什么辅助学习信号"形式化为有效学习信号 S=Q/V：足够强（高 Q，有新东西可学）且足够近（低 V，模型容易吸收）。 两条现有路径各缺一角：从外部老师导入轨迹，Q 高但 V 太大；从经验回放抓自己过去的轨迹，V 低但 Q 被自身历史水平卡死。 Near-future checkpoint 之所以是天然 teacher，在于它同时满足两端：同一条优化进程走了若干步所以更强（Q 有保障），又离当前足够近所以容易被吸收（V 有保障）。

这一框架隐含一个关键假设：优化路径的单调性。若训练出现非单调回退，"未来更强"的前提被破坏，near-future 信号的 Q 反而可能下降。AutoNPO 从在线训练信号自动检测干预时机、自动挑选 S 最大的 guide checkpoint， 本质上是对该假设被违背时的在线补偿机制。57.88 → 62.84 → 63.15 且收敛速度和上限同时提升的结果说明：辅助信号的质量同时作用于收敛动力学与性能天花板两个维度，而非只影响其一。

### 信号转化效率 a_p：多 expert 吸收问题的统一度量

CoPD 的统一效用框架把任何范式 P 的实际效用分解为 a_p×X(D₁,D₂) + b_p：信号转化效率 × 能力增量 + 额外损失（b_p ≤ 0）。 两条现有路径恰好各坏一个自由度：mixed-data RLVR 多能力共享参数、梯度方向冲突，出现 seesaw 效应（b_p = −Φ）；静态 OPD pipeline 分开训练再蒸馏，专家能力传不过去（a_p 远小于 1，b_p = 0）。 这个二维分解的价值在于指出两种失败不是同一种失败，不能用同一种方法修——也与 [on/off-policy 蒸馏对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/on-policy-distillation-vs-offline-distillation-loster.md)中的静态 pipeline 失效模式相互印证。

关键假说是 a_p 由 teacher-student 行为重合度 O 决定——越像越容易吸收。实验给出强支撑：overlap 与 OPD 增益的相关性 r=0.89； 且独立 RLVR 训练过程中 overlap 单调下降、KL 涨了一个数量级，静态 pipeline 恰好在吸收效率最低的时刻执行蒸馏。 这把静态 OPD 的低效从"实现缺陷"重新定性为"结构性时序错位"。CoPD 的对策（训练中蒸馏而非训练后、多个 expert 分支互为师生、mutual OPD 拉近行为模式）正是把 a_p 的时间曲线本身变成可控对象——与 [Relay-OPD](https://github.com/QianJinGuo/wiki-public/blob/main/entities/relay-opd-handoff-trigger-online-distillation-zju-alibaba-2026.md) 的"训练中择时蒸馏"属于同一方向。

### 三种 Self 的统一视角：自我指导的信号来源谱系

三种框架是同一个问题——"自我指导的信号从哪里来"——在三个正交轴上的答案：RLSD 用特权信息（informed self）换信号可靠性，NPO 用时间差（temporal self）换信号亲近性，CoPD 用分支差异（parallel-self）换 overlap 可控性。三者的共同母题是规避"同参数空间自指信号退化"：都不让模型直接以当前的自己为老师，而是引入一个结构性不同的自我变体（看得更多 / 走得更远 / 走得不同）充当 teacher。

对照 wiki 已有的 OPD 谱系（[XOPD 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/xopd-on-policy-distillation-landscape-banana-2026.md)），RLSD/CoPD 可视为 on-policy 自蒸馏在 RLVR 场景下的两条修正路线；而 CoPD 的多分支协同进化与 [MoE](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/moe-mixture-of-experts-2025.md) 路线的本质差别在于：后者在推理时组合专家，前者在训练时让专家互相塑造——这也正是其被解读为潜在新 model parallel training 与 scaling 范式的原因。开放问题有二：a_p 对 overlap 的依赖意味着 scaling expert 数量时不能简单堆叠，并行训练架构必须能在分支数增加时维持足够的行为重合度，这直接约束 expert 分支数的上限； 三个框架能否按训练阶段组合（informed + temporal + parallel）则尚无实验验证，本文仅给出了各自独立的有效性证据。

## 实践启示
**算法选择框架**：计算资源有限→优先RLSD解耦策略；追求性能上限→AutoNPO自动干预；多模态/多任务→CoPD协同进化。三种框架不是互斥的，可以按训练阶段组合使用。
**Near-Future Checkpoint的选取**：不应仅看loss下降，核心指标是S=Q/V的综合最优。在实践中建议监控每个checkpoint的Q和V，优先选取Q提升明显且V保持低位的checkpoint作为teacher。
**CoPD落地路径**：对于已有独立expert的团队，建议先做mutual OPD双向蒸馏拉近行为模式，再进行各expert的持续RLVR能力拓展。overlap度量需嵌入训练流程实时追踪。
## 相关实体
- [Llm Post Training Full Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-post-training-full-guide.md)
- [Mellum 2 Jetbrains Open 12B Moe Code Model](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mellum-2-jetbrains-open-12b-moe-code-model.md)
- [Reading Todays Open Closed Performance Gap](https://github.com/QianJinGuo/wiki-public/blob/main/entities/reading-todays-open-closed-performance-gap.md)
- [Baidu Wenxin Post Training Evolution](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-wenxin-post-training-evolution.md)
- [Vllm V0 To V1 Correctness Before Corrections](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm-v0-to-v1-correctness-before-corrections.md)

→ [原文存档](https://mp.weixin.qq.com/s/g46P5l_BM99M6T1U084lTg)

---

