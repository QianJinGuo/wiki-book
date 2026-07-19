# CMU PACE — Proxy for Agentic Capability Evaluation

## Ch04.456 CMU PACE — Proxy for Agentic Capability Evaluation

> 📊 Level ⭐⭐ | 6.4KB | `entities/cmu-pace-proxy-agent-evaluation-cheap.md`

# CMU PACE — Proxy for Agentic Capability Evaluation

> PACE 从 19 个便宜原子评测里自动挑出 100 道题，花不到完整 Agent 评测 **1% 的成本**，就能预测 GAIA、SWE-Bench 等四项基准的模型得分。留一交叉验证平均误差 3.80%，两两排序准确率约 84%。

## 核心要点

1. **成本降低 100 倍**：单模型完整 Agent 评测需数千美元和数天时间，PACE 仅需不到 1% 的成本即可获得高度相关的预测分数
2. **自动选题**：从 19 个非 Agent 基准（覆盖 11 类能力）中自动选出最具预测力的 100 道题，无需人工设计
3. **双目标任务**：同时预测绝对分数（回归）和模型排序（分类），满足不同评估需求
4. **能力指纹揭示**：选出的题目揭示了各 Agent 基准的能力需求分布，如 GAIA 偏好指令遵循，SWE-Bench 需要规划+代码生成+验证
5. **开源可用**：论文、代码和数据集均在 GitHub 和 HuggingFace 公开发布

## 深度分析

### 代理评测的底层逻辑：能力维度的可迁移性

PACE 的核心假设是：Agent 任务再复杂，底层也依赖指令遵循、规划、写代码、工具调用等基本能力，这些能力在非 Agent 基准中同样被测量。 这一假设在实验结果中得到验证——100 道原子题足以达到 3.80% 的 MAE。这意味着 Agent 能力并非"涌现"的不可分解整体，而是可分解为基本能力维度的组合。这与 [CLaw: 长周期 Agent 评测](../ch05/018-harness.html) 中讨论的能力分解思路一致。

### Local vs Global 选题机制的理论基础

PACE 的选题策略具有统计学上的互补性：
- **Local 选题**（Spearman 相关排序）本质上是监督特征选择，找与目标最相关的单题
- **Global 选题**（SVD 杠杆分数）是无监督表示学习，找在潜在能力空间中信息量最大的题

这种"监督+无监督"的组合在机器学习中常见（如半监督学习），但在评测设计领域是创新应用。它确保了选出的题目既与目标相关，又能覆盖能力空间的多样性。

### Agent 基准的能力指纹分析

PACE 选出的题目集合揭示了各基准的"能力需求指纹"：

| 基准 | 核心能力需求 | 对应原子基准 |
|------|-------------|-------------|
| GAIA | 指令遵循 + 验证测试 | IFEval, PlanBench |
| SWE-Bench Verified | 规划 + 代码生成 + 验证 + 错误恢复 | HumanEval, MBPP, PlanBench |
| SWE-Bench Multimodal | 长上下文聚合 | LongBench, RULER |
| SWT-Bench | 验证测试 + 规划 | PlanBench, IFEval |

这表明不同 Agent 基准测试的是不同的能力组合，单一的"Agent 能力分数"具有误导性。在选择基准时，应该根据目标应用场景的能力需求选择或加权组合相应基准。这一分析框架与 [CLaw: 长周期 Agent 评测](../ch05/018-harness.html) 中的多维评估理念一致。

### 局限性：代理评测与完整评测的边界

PACE 论文诚实地指出了两个关键局限：
1. **分布外漂移**：当新模型的架构或训练方法超出标定模型分布时，预测误差会上升
2. **Harness 依赖**：预测的是特定 Agent Harness 配置下的分数，工具定义、重试策略变化可能导致排序漂移

这意味着 PACE 适合作为**筛选和排序工具**（筛 checkpoint、比版本、决定值不值得跑完整评测），但不能完全替代完整评测。这与 [Agent Harness 架构](../ch05/039-agent-harness.html) 中强调的评测标准化重要性相互印证——没有标准化的 Harness，代理评测的参考价值也受限。

### 对 Agent 开发流程的实践价值

PACE 的最实际价值在于改变了 Agent 开发的迭代节奏：
- 传统流程：修改模型 → 跑完整评测（$2000+，数天）→ 等结果 → 迭代
- PACE 流程：修改模型 → 跑 PACE（$20，数分钟）→ 快速验证 → 决定是否跑完整评测

这种快速反馈循环对于 RL 训练中的 checkpoint 选择、prompt 策略的 A/B 测试、以及模型版本的快速淘汰非常有价值。

## 实践启示

1. **在完整评测前先用代理评测筛选**：在投入数千美元跑 SWE-Bench 或 GAIA 之前，先用 PACE 快速评估模型版本或 checkpoint 的相对排序，选择最有潜力的候选者进行完整评测。

2. **将能力指纹纳入基准选择决策**：根据你的 Agent 应用侧重（如更偏指令遵循还是代码生成），选择能力指纹匹配的基准进行评估，而不是盲目追求"全面"的单一分数。

3. **注意 Harness 标准化**：PACE 预测的精度受 Harness 配置影响——确保你的 Agent Harness 配置稳定且与标定配置一致，否则排序漂移会降低预测可靠性。

4. **定期重新标定**：随着新模型架构的出现，定期（如每季度）重新运行 PACE 的标定流程，确保选题集合仍然代表当前模型分布。

5. **与 RoadmapBench 等长周期基准互补使用**：PACE 擅长快速排序，[RoadmapBench](ch04/250-roadmapbench-long-horizon-agentic-software-development.html) 等长周期基准测试深度能力——两者结合使用可在成本和评估深度之间取得平衡。

## 参考

- 论文: PACE: A Proxy for Agentic Capability Evaluation — arXiv:2607.02032
- GitHub: https://github.com/neulab/pace
- 数据集: https://huggingface.co/datasets/neulab/pace-bench

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cmu-pace-proxy-agent-evaluation-cheap.md)

---

