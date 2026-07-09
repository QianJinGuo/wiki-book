# Lighthouse Attention

## Ch01.083 Lighthouse Attention

> 📊 Level ⭐ | 6.5KB | `entities/lighthouse_attention.md`

## 核心要点
- 选择性层级注意力（Selection-based Hierarchical Attention），通过对称 Q/K/V 池化在多分辨率金字塔中稀疏化注意力 
- 前向+反向延迟比标准注意力快约 **17×**（512K 上下文，单卡 B200），端到端预训练提速 **1.4–1.7×**（98K 上下文）
- 选择逻辑位于注意力内核之外，复用标准 FlashAttention 内核，无需自定义稀疏内核或辅助损失 
- 两阶段训练：稀疏阶段（Lighthouse）后接标准注意力恢复（SDPA-resume），确保稀疏训练后模型仍保持标准注意力的能力 
---

## 深度分析
### 设计哲学：对称性 vs 不对称性
大多数稀疏注意力方法（NSA、HISA、InfLLM-v2、DSA、MoBA）采用**非对称设计**：查询保持完整分辨率，只有键值被池化。这种方式将层级结构视为压缩的寻址内存，而非多尺度表示 。
Lighthouse 选择了**对称池化**：Q、K、V 在金字塔每一层按相同因子池化。池化后的查询与池化后的键位于同一表示空间，使得在训练时可以将密集注意力调用从 $\mathcal{O}(N^2)$ 转换为 $\mathcal{O}(N \cdot K)$ 。这种对称性是方法的核心洞察——它让稀疏训练的权重能够在标准注意力下无缝复用。

### 选择机制：核外设计
另一个关键设计决策是将选择逻辑放在注意力内核**之外** 。一旦 Top-K 确定，将选中的条目聚合成一个连续的、因果排序的密集子序列，然后在其上运行 FlashAttention 。
这样做的好处是：前向和反向传播与标准密集 Transformer 的前向反向传播完全一致（bit-for-bit identical）。昂贵的操作是相同的密集注意力内核，继承了所有上游 FlashAttention 的改进 。
评分采用**参数无关函数**：每个金字塔条目获得两个标量分数——查询投影的范数和键投影的范数。没有学习到的评分头、没有辅助损失、没有 Gumbel-softmax、没有直通估计器 。这种设计避免了在选择机制中引入额外的可学习参数，从而不会产生梯度流经选择的问题。

### 两阶段训练：可恢复性保证
文章将"稀疏训练的模型在训练结束后是否仍然是合格的密集注意力模型"作为中心正确性检验 。这区别于推理时稀疏方法——那些方法最多与密集骨干一样好，但训练时稀疏方法面临更难的测试。
两阶段训练 recipe：
1. **Stage 1 (Lighthouse)**：启用 Lighthouse 选择训练大部分步数
2. **Stage 2 (SDPA-resume)**：从 Stage 1 检查点恢复，选择禁用，继续用标准注意力训练短暂尾部
如果稀疏训练破坏了模型的密集注意力能力，Stage 2 将无法恢复。如果没破坏，Stage 2 将平滑收敛至与从零开始的密集运行相当的模型 。
在三个分割点（10k+6k、11k+5k、12k+4k，共 16k 步），每个恢复的 Lighthouse 运行在相同 16,000 步 / 约 50B token 预算下都匹配或超过了密集从零训练的基线 。这是该方法的承载声称：稀疏训练不会影响模型在推理时使用全注意力的能力，且 token 成本与密集从零训练相当。

### 上下文并行：稀疏方法的关键优势
稀疏方法在上下文并行（CP）场景下通常面临挑战：需要特殊的稀疏感知集合操作来表达环形旋转 。而 Lighthouse 的选择输出是一个连续张量，参与环形注意力无需稀疏感知的集合通信，因为 gather 后的子序列是密集的 。
这使得 Lighthouse 支持在 32 个 Blackwell GPU（4 节点，CP 度 8）上进行 **1M token 训练**，无需更改内部注意力内核 。

### 金字塔超参数容错性
消融实验显示，金字塔超参数（L 和 p）在很大范围内都落在约 0.02 nats 以内 。选择主要是吞吐量 / 内存覆盖之间的权衡，而非质量上的临界点。这降低了方法调参的门槛。
---

## 实践启示
1. **长上下文预训练场景**：对于需要 98K 以上上下文长度的预训练任务，Lighthouse 可提供 1.4–1.7× 的端到端加速，且不损失模型质量 。
2. **两阶段训练的必要性**：如果采用稀疏注意力进行训练，必须包含标准注意力的恢复阶段，以确保最终模型在推理时使用标准注意力不受损 。
3. **选择逻辑外置的设计价值**：将 Top-K 选择放在注意力内核之外，使得可以复用高度优化的标准 FlashAttention 内核，无需开发自定义稀疏内核，降低了工程实现成本 。
4. **参数无关评分的实用性**：使用范数作为评分信号避免了辅助损失和直通估计器的复杂性，同时保留了结果的下界（膨胀 softmax 评分器是更强的信号，但结果仍代表选择式训练的可行下限）。
5. **上下文并存的可行性**：保留被拒绝的粗粒度条目而非丢弃，避免了稀疏感知因果掩码的需求，使得标准下三角因果掩码直接适用，无需修改注意力内核 。
---

## 关联阅读
## 相关实体
- [Nvidias Jensen Huang Bets On This British Startup To Build Next Frontier Of Ai](../ch05/081-ai.html)
- [Why Im Leaving Github For Forgejo](ch01/850-github.html)
- [From Doer To Director The Ai Mindset Shift](ch01/031-from-doer-to-director-the-ai-mindset-shift.html)
- [Anthropic Puts Claude Agents On A Meter Across Its](ch01/082-anthropic-puts-claude-agents-on-a-meter-across-its-subscript.html)
- [Akamai Acquires Israeli Ai Browser Security Startup Layerx For 205 Million In Ca](../ch05/081-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lighthouse_attention.md)

---

