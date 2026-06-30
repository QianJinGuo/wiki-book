# Self-Taught RLVR 综述

## Ch01.653 Self-Taught RLVR 综述

> 📊 Level ⭐⭐ | 5.1KB | `entities/self-taught-rlvr.md`

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
**信息泄漏的数学本质**：OPSD的ill-posed问题揭示了一个深层矛盾——当teacher和student共享同一参数空间时，KL散度目标本质上无法区分"真正学会了"和"记住了参考答案"。RLSD的解耦方案（方向×幅度）实际上是用两个正交信号分别逼近原目标：200步>400步的效率提升并非来自算法本身优越，而是来自信号结构的优化组合。
**Near-Future Teacher的隐含假设**：NPO的核心洞察——"未来更强但同一条优化路径"——隐含了一个关键假设：训练过程的单调性。如果优化路径存在非单调跳跃（如large loss spikes导致的回退），near-future teacher的信号质量可能反而更差。AutoNPO的自动干预机制本质上是在线检测这种非单调性，在实践中需要配合loss curve监控。
**协同进化与Model Merge的对照**：CoPD的训练中蒸馏模式暗示了一种新的model parallel范式——不是让一个模型去多个expert那里学习，而是让多个expert在保持差异的同时相互拉近。这与model merge工作形成有趣对照：CoPD强调保持差异的同时降低吸收成本，而model merge强调直接融合。两条路径哪个更有scalability，还有待大规模验证。
**信号转化效率的工程意义**：CoPD发现a_p取决于行为重合度，意味着scaling expert数量时不能简单堆叠——需要先做行为对齐再做能力拓展。这对训练系统设计有直接启示：expert分支数受限于能保持足够overlap的并行训练架构。

## 实践启示
**算法选择框架**：计算资源有限→优先RLSD解耦策略；追求性能上限→AutoNPO自动干预；多模态/多任务→CoPD协同进化。三种框架不是互斥的，可以按训练阶段组合使用。
**Near-Future Checkpoint的选取**：不应仅看loss下降，核心指标是S=Q/V的综合最优。在实践中建议监控每个checkpoint的Q和V，优先选取Q提升明显且V保持低位的checkpoint作为teacher。
**CoPD落地路径**：对于已有独立expert的团队，建议先做mutual OPD双向蒸馏拉近行为模式，再进行各expert的持续RLVR能力拓展。overlap度量需嵌入训练流程实时追踪。
## 相关实体
- [Llm Post Training Full Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-post-training-full-guide.md)
- [Mellum 2 Jetbrains Open 12B Moe Code Model](https://github.com/QianJinGuo/wiki/blob/main/entities/mellum-2-jetbrains-open-12b-moe-code-model.md)
- [Reading Todays Open Closed Performance Gap](https://github.com/QianJinGuo/wiki/blob/main/entities/reading-todays-open-closed-performance-gap.md)
- [Baidu Wenxin Post Training Evolution](https://github.com/QianJinGuo/wiki/blob/main/entities/baidu-wenxin-post-training-evolution.md)
- [Vllm V0 To V1 Correctness Before Corrections](https://github.com/QianJinGuo/wiki/blob/main/entities/vllm-v0-to-v1-correctness-before-corrections.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/self-taught-rlvr-jd-cii-2026.md)

---

