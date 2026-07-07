# Olmo Hybrid and the Hybrid Architecture Wave (2026)

## Ch01.1141 Olmo Hybrid and the Hybrid Architecture Wave (2026)

> 📊 Level ⭐⭐⭐ | 16.5KB | `entities/olmo-hybrid-gdn-wave-2026.md`

# Olmo Hybrid and the Hybrid Architecture Wave (2026)

> **Core insight**: 2026 春季 Qwen 3.5 / Kimi Linear / Nemotron 3 Nano / IBM Granite 4 / Olmo Hybrid 集体采用 Transformer + RNN 混合架构 — Allen AI 的 Olmo Hybrid 7B 用 Gated DeltaNet (GDN) 3:1 层比实现**预训练效率 2x 提升**，并提供**严格理论证明 hybrid > transformer**。

## Hybrid 架构浪潮的 2026 春季清单

- **Qwen 3.5**（previewed by Qwen3-Next）
- **Kimi Linear**（2025 秋季发布，arXiv 2510.26692）
- **Nvidia Nemotron 3 Nano**（30B-A3B-BF16）
- **IBM Granite 4**
- **Olmo Hybrid**（本篇焦点，Allen AI 发布）

这些模型都使用 **Transformer + RNN 混合**架构，但 RNN 部分的选择分化：
- **Gated DeltaNet (GDN)**：Qwen、Kimi、Olmo
- **Mamba layers**：Granite、Nemotron

## 历史脉络：从 Mamba 到 Hybrid

**2023 年 12 月**：Mamba 和 Striped Hyena 引发"我们是否需要全 attention"的讨论。但早期模型有几个问题：
- 难实现（tricky implementations）
- 开源工具问题
- 训练 headaches
- **缩放时模型表现崩溃** — hybrid 当时还不够好

**2024-2025**：Gated DeltaNet 出现（基于 delta rule 思想），比 Mamba 更稳定更适合混合。

**2026 春季**：所有主要开放权重实验室同时发布 hybrid 模型 — "研究趋势同时被各处采纳" 的时刻。

## Olmo Hybrid 模型规格

- **规模**：7B base model
- **架构**：Transformer + GDN（3:1 层比）
- **Post-training 实验**：发布 3 个 checkpoints（Instruct + 即将发布的 reasoning）
- **核心优势**：与 Olmo 3 7B 几乎完全相同（除架构变化），是**研究 hybrid 模型的最佳开放 artifact**
- **配套发布**：[论文](https://allenai.org/papers/olmo-hybrid) + [HuggingFace checkpoints](https://huggingface.co/collections/allenai/olmo-hybrid)
- **研究主导**：Will Merrill（Allen AI）

## 关键理论：Hybrid > Transformer

论文核心论证（Nathan 引用 + 加粗强调）：

> "Past theoretical work has shown that attention and recurrence have complementary strengths (Merrill et al., 2024; Grazzi et al., 2025), so mixing them is a natural way to construct an architecture with the benefits of both primitives. **We further derive novel theoretical results showing that hybrid models are even more powerful than the sum of their parts**: there are formal problems related to code evaluation that neither transformers nor GDN can express on their own, but which hybrid models can represent theoretically and learn empirically."

三个核心论断：

1. **Hybrid 模型更具表达性** — 能学习更广泛的函数族（Bitter Lesson 类比：让 optimizer 自由 vs 限制 learner）
2. **表达性提升 → scaling laws 更好**（基于 [quantization model of neural scaling](https://arxiv.org/abs/2303.13506)）
3. **理论增益通过 controlled scaling studies 验证** — 不只是理论

### 缩放实验的明确排序

对 Olmo 而言，缩放实验显示：

**hybrid GDN (3:1 ratio) > 纯 GDN > 标准 transformer > hybrid Mamba2 > 纯 Mamba2**

关键：这些**优势在缩放到更大参数和算力时仍然保持**。

### 预训练效率具体数字

**相对 Olmo 3 dense，Olmo Hybrid 实现约 2X 训练效率提升**。在 long context extension 后评估性能也有实质提升（论文 Table 2 最后两行）。

## Post-training 的挑战

Olmo Hybrid 是 Allen AI 第一次 post-train 一个**架构显著不同**的 base model，结果**喜忧参半**。

### 1. Benchmark 性能

按 Olmo 3 配方训练后：
- **部分大幅胜出**（knowledge 维度）
- **部分大幅下降**（extended reasoning 维度）
- 综合仍是非常强的全开放模型 — 但 pretraining 增益**没完全转化**

**原因假说**：
- Hybrid base model 是"显著不同的 student model"
- Post-training 数据早期阶段基本是 learning from 强 "teacher" models（[distillation](https://www.interconnects.ai/p/how-much-does-distillation-really) 回顾）
- 社区共识：**最强 overall model ≠ 最好 teacher**
- 不同 base model 可能需要**不同 teachers** — 这是探索不足的方向

### 2. 开源工具支持的现实

**坦白说，新架构的开源软件工具支持是糟糕的**。除了常见的小问题（如 GPT-OSS 早期用户遇到的随机库错误），还有更深层问题。

**Hybrid 模型的核心潜力是 long-context generation 内存使用降低** — 这对 RL 和 agentic 任务至关重要。可惜**目前还未实现**，可能还需要 **3-6 个月**让这批 GDN 模型的工具链跟上。

**核心问题**：开源推理工具（如 vLLM）依赖**远不如标准 transformer 成熟的 kernels**。两个挑战：
- **吞吐下降**（throughput slowdowns）
- **数值问题**（numerical issues — 可通过 inference flags 缓解）

### 关键 inference flags

论文指出的 vLLM 关键 flag：

```bash
--disable-cascade-attn  # 关闭 cascade attention（共享 prompt prefix 优化）
--enforce-eager         # 关闭 CUDA graphs
--mamba_ssm_cache_dtype  # 用 FP32 Mamba cache 提升稳定性
```

**没有这些 flag，released model 的分数会急剧下降**。但**开了这些 flag 后推理吞吐暴跌，潜在计算效率增益被抹平**。

## 与现有 [Generalization Dynamics Lm Pretraining](../ch04/070-ai.md) 的关系

现有 entity 关注 pretraining dynamics 的**理论 + 实证** 框架。本文（Olmo Hybrid）贡献的是**架构维度**的扩展：

| 维度 | 现有 entity | 本文 |
|------|------------|------|
| 研究对象 | 训练动态（scaling law / 收敛 / 泛化） | 架构选择（hybrid vs pure） |
| 实证模型 | 多模型 sweep | Olmo 3 vs Olmo Hybrid（单因素变化） |
| 核心贡献 | Quantization model of scaling | Hybrid > transformer 严格理论证明 |
| 关系 | 提供 scaling law 框架 | 验证 hybrid 在 scaling law 下也占优 |

→ **互补**：先读 generalization-dynamics-lm-pretraining 理解 scaling law 框架，再读本文看架构选择如何影响 scaling law 中的"参数效率"。

## 与 [Notes From Inside Chinas Ai Labs](../ch09/107-notes-from-inside-chinas-ai-labs.md) 的关联

Chinese AI labs（Qwen 3.5, Kimi Linear）也在 2026 春季同时采用 hybrid 架构 — 这与 Nathan 在 [Nathan Lambert Open Models Bets 2026](ch01/446-nathan-lambert.md) 预测 2-3 中"开放模型实验室在标准 benchmark 上技术能力极强"高度一致：**架构选择高度同步**反映**人才 + 算力平衡**的趋同。

## 三个独到洞察

1. **"Hybrid 3:1 ratio > 纯 GDN > transformer > hybrid Mamba2 > 纯 Mamba2"** — 完整架构 ablation 排序，且**优势在缩放时保持**。这是 hybrid 架构工程的"地图"。

2. **"表达性 → scaling law 改进" 形式化论证** — 把 [quantization model of neural scaling](https://arxiv.org/abs/2303.13506) 应用到架构维度，给出 hybrid 占优的**严格理论解释**（vs 纯经验观察）。

3. **"Post-training 数据是 hybrid 模型最大瓶颈"** — pretraining 2x 增益在 post-training 后被抹平。**新架构需要新的 teacher** 是社区尚未充分探索的方向。

## 实践要点

**什么时候选 hybrid（GDN/Mamba）架构**：
- Long-context 重负载（>32K context）— KV cache 压缩是 hybrid 核心优势
- RL / agent 训练 — 内存效率直接转化为 throughput
- 资源受限部署 — 训练效率 2x 提升
- 对开源兼容性容忍度较高 — 工具链 3-6 月成熟期

**什么时候仍选纯 Transformer**：
- 短上下文（<8K）
- 强依赖 vLLM/SGLang 等成熟工具链
- Post-training 数据稀缺的场景（post-training 增益难转化）
- 数值稳定性敏感（生产环境需 6 个月稳定期）

## 上线状态

- **Olmo Hybrid 模型**：[HF collection](https://huggingface.co/collections/allenai/olmo-hybrid)
- **论文**：[allenai.org/papers/olmo-hybrid](https://allenai.org/papers/olmo-hybrid)
- **主导研究**：Will Merrill（Allen AI / AI2）
- **发布日期**：2026-03-05（Interconnects 文章日期）
- **当前状态**：基模型优秀，post-training 在 2026 中期仍需工具链支持
- **开源工具成熟度**：vLLM 通过 `--disable-cascade-attn` 等 flag 可运行但吞吐未优化

## 深度分析

1. **Hybrid 架构的「表达性→Scaling Law 改进」链路是严格形式化的**
   论文将 [quantization model of neural scaling](https://arxiv.org/abs/2303.13506) 应用于架构维度，论证 hybrid 模型比纯 transformer 或纯 RNN 更具表达性 → 在语言建模目标的多任务本质上获得更好的缩放规律。 这不是经验观察，而是有严格理论支撑的结论，意味着 hybrid 的优势将在更大参数规模时持续存在而非衰减。

2. **GDN 在混合架构中优于 Mamba2 的原因在于「互补性而非替代性」**
   完整 ablation 排序为：hybrid GDN (3:1) > 纯 GDN > transformer > hybrid Mamba2 > 纯 Mamba2。GDN 能够学习 attention 或 Mamba layers 无法独立表达的特征，而这种互补性在混合后才被激发。纯 GDN 反而不如混合架构，说明 RNN 模块需要与 attention 模块协同才能发挥最大效用。

3. **Pretraining 效率 2x 增益在 Post-training 阶段被大幅稀释**
   Olmo Hybrid 的预训练收益是实质性的（long context extension 后评估性能大幅提升），但沿用 Olmo 3 配方进行 post-training 后，部分 benchmark（尤其是 extended reasoning）反而下降。这揭示了一个重要规律：**新架构需要新的 teacher 模型**，而社区尚未充分探索不同 base model 与不同 teacher 的匹配问题。

4. **工具链成熟度是当前 Hybrid 模型实际落地的决定性瓶颈**
   Hybrid 模型的核心潜力——long-context generation 内存使用降低——对 RL 和 agentic 任务至关重要，但当前 vLLM 等开源推理工具的 kernel 开发程度远不如标准 transformer。使用必要的 stability flags 后推理吞吐暴跌，计算效率增益被完全抹平。Nathan 估计还需要 3-6 个月才能让这批 GDN 模型的工具链成熟。

5. **封闭前沿模型采用 RNN/Hybrid 架构的概率约为 50%**
   Nathan 在文末给出了一个非典型的猜测：基于更好的基础 scaling 和多个开放权重实验室已采用的事实，如果 scaling 优势在前沿规模也成立，经济激励将难以忽视；但封闭模型可能已有类似 RNN 高效特性但具备更多优势的内部架构。这提供了一个观察封闭实验室技术选型的窗口。

## 实践启示

1. **在选择 Hybrid 架构时，优先采用 GDN 而非 Mamba2**
   根据 scaling experiments 的完整排序，GDN 混合架构在所有关键指标上均优于 Mamba2 混合架构。若团队已决定采用 hybrid 路线，应优先选择 GDN 作为 RNN 模块的实现。

2. **3:1 是 GDN 层比的黄金比例**
   论文的 ablation 明确显示 3:1（Transformer : GDN）层比效果最佳。这一比例在 pretraining 效率和 long-context 性能上都带来了实质提升，且优势在 scaling 到更大参数时保持。建议在架构设计时将此作为起始搜索点。

3. **部署 Hybrid 模型时必须配置稳定性 flags，否则性能将严重衰减**
   vLLM 推理必须使用 `--disable-cascade-attn`、`--enforce-eager`、`--mamba_ssm_cache_dtype FP32` 等 flags 才能保证数值稳定性。但开了这些 flags 后吞吐暴跌，当前阶段需要权衡稳定性与效率，不建议在生产环境追求极限 throughput。

4. **Post-training Hybrid 模型时需要重新审视 teacher model 选择**
   沿用成熟 post-training 配方（基于其他架构训练）不一定适用于 hybrid base model。社区共识是「最强 overall model ≠ 最好 teacher」，且不同 base model 可能需要不同 teachers。这是尚待探索的研究方向，团队应预留时间进行 teacher model 的 ablation 实验。

5. **Long-context >32K 且 RL/Agent 场景是 Hybrid 架构的最佳适用场景**
   KV cache 压缩带来的内存效率提升在长上下文和 RL 训练场景中价值最大。如果业务场景以短上下文（<8K）为主、或强依赖成熟工具链（vLLM/SGLang 的完全优化版），则纯 Transformer 仍是更稳妥的选择。

## 关键引用

> "Hybrid models are more expressive... More expressive models are good with deep learning because we want to make the model class as flexible as possible and let the optimizer do the work rather than constraints on the learner."

> "These gaps maintained when scaling to more parameters and compute." — hybrid GDN > 纯 GDN > transformer > hybrid Mamba2 > 纯 Mamba2 排序。

> "Relative to Olmo 3 dense, [Olmo Hybrid] represents an about 2X gain on training efficiency."

> "A large part of the potential benefit of hybrid models is the reduction in memory usage for long-context generation... will likely take another 3-6 months to get right for this batch of GDN models."

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/olmo-hybrid-and-future-llm-architectures.md)

---

