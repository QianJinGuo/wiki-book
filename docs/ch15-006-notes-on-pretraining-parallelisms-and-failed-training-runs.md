## Ch15.006 Notes on pretraining parallelisms and failed training runs.

> 📊 Level ⭐⭐ | 5.7KB | `entities/notes-on-pretraining-parallelisms-and-failed-training-runs.md`

## 核心要点
- 评分：v=7 × c=9 = 63
- 来源：dwarkesh
## 相关实体
- [Building Blocks For Foundation Model Training And Inference On Aws](ch11-117-building-blocks-for-foundation-model-training-and-inference.html)
- [Gemma 4 Qat Models Optimizing Compression](ch01-401-icml-2026-apo.html)
- [How Harnesses And Post Training Close The Open Weight Bug Finding Gap 20260606](ch01-232-three-years-from-gpt-3-to-gemini-3.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/notes-on-pretraining-parallelisms-and-failed-training-runs.md)

## 深度分析
### 因果性破坏（Causality Breaking）
**专家路由中的因果破坏**是当前 MoE 训练失败的核心原因之一。在专家路由中，Token 分配本应在严格因果顺序下进行，但 Expert Choice 机制允许后续 Token 的路由决策反向影响先到 Token 的分配结果。这导致训练阶段看到的梯度分布与推理阶段实际运行时不一致。
**Token Dropping 的危害**：某些专家在处理批次时忽略排名不强的 Token以节省计算资源，但这同样打破了因果性——后续更匹配的 Token 可能导致早期 Token 被忽略。这种偏差在大规模训练中会系统性累积。

### 数值精度问题：比方差更危险的偏差
FP16 在集合运算（All-Reduce）中的精度问题揭示了一个反直觉的事实：**偏差（Bias）比方差（Variance）危害更大**。方差不论正负，最终可以通过均值化消除；但偏差会系统性叠加，最终导致模型参数严重偏离真实值。
GPT-4 训练初期的一个致命 Bug 正是源于此：FP16 的尾数位在数值较大时精度骤降，当多个小梯度累加到 1024 及以上时，相邻可表示间隔扩大到多个整数值，导致累加结果被截断回原值。这个 Bug 极难发现，因为梯度值在 1024 以下时表现完全正常。

### 并行策略的权衡框架
 Horace He 的讲座提供了一个清晰的决策链条：

- **FSDP 是默认首选**：因为 weight all-gather 与计算可完全 overlap，通信与计算可以隐藏
- **FSDP 的通信开销**：看似昂贵的 all-gather（每层 forward + backward 各一次）实际只相当于 vanilla DP 50% 的额外开销，因为 all-gather 成本是 all-reduce 的一半
- **FSDP 的失效场景**：
  - 当 GPU 数量增加导致 compute time 下降速度快于 comms time 时，MFU 崩塌
  - 当 batch size 过小（单序列 token 数 × 序列数低于临界值）时，无法充分利用数据并行

### 流水线并行的新问题
流水线并行在解决 FSDP 局限的同时引入了**气泡（Bubbles）**问题：由于梯度聚合与权重更新必须在下一批次开始前完成，前序层和后序层 GPU 在批次交接处必然存在空闲时间。此外，流水线打破了跨层的残差连接设计（如 Kimi 的 attention-to-residuals），限制了对模型架构的探索。

### RL 推理与用户推理的本质差异
在 RL 生成推理中，训练引擎与推理引擎之间的数值漂移会引入微妙的 Off-Policy 偏差，这对高质量训练影响巨大，但在纯用户推理场景中不成问题。这提示基础设施团队不能简单复用同一套推理优化。

## 实践启示
1. **建立严格的数值精度审计流程**：在所有 All-Reduce 和 All-Gather 关键路径上增加精度校验节点，特别是当梯度累加值跨越 1024 等 2 的幂次边界时。
2. **MoE 训练优先选择 Token Routing 而非 Expert Choice**：虽然 Expert Choice 能保证专家间负载均衡，但因果破坏的代价远超预期。如需负载均衡，考虑在训练后期切换策略。
3. **并行策略的切换阈值应公式化**：利用 MFU 公式计算 comms/compute crossover，批量大小和模型稀疏度都会影响切换点位置。盲目增加 GPU 而不调整并行策略会导致算力利用率断崖式下降。
4. **内核工程不可完全依赖自动化**：即使是最好的 AI 辅助工具，在新硬件架构（如 Blackwell）上的内核优化仍需要顶级工程师的领域知识积累。RL 自动化方法可能在已有成熟架构上有效，但无法完全替代硬件特定优化。
5. **多计算因子叠加时必须逐项校验**：累积多个 compute multiplier 时，每一步都需要独立验证偏差引入风险。系统性的 Process Discipline 是防止 subtle bias 累积的唯一防线。
6. **RL 推理系统需独立于用户推理系统构建**：两者对数值漂移的敏感度完全不同，不应共用基础设施。

---
