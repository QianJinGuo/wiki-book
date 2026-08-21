# Model Genome: LLM 血统指纹识别方法论

## Ch01.1318 Model Genome: LLM 血统指纹识别方法论

> 📊 Level ⭐⭐ | 3.9KB | `entities/model-genome-llm-lineage-fingerprinting-2026.md`

# Model Genome: LLM 血统指纹识别方法论

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/model-genome-llm-lineage-fingerprinting-2026.md)

Model Genome 是 Hugging Face 社区文章提出的可复现管线：**当实验室宣称"自研、从零训练"基础模型时，外部人如何仅用公开产物验证这一说法**。

## 三轴指纹识别

管线在三个轴上对模型做指纹识别，并合成为单一的 "genotype" 标签：

| 轴 | 方法 | 判别力 |
|----|------|--------|
| **架构**（config.json） | shape tuple (hidden_size, intermediate_size, num_hidden_layers, heads, kv) 与已知开源模型精确比对 | 五字段同时匹配 = 强证据 |
| **Tokenizer**（tokenizer.json） | 词汇表 min-overlap 比率 `\|A∩B\| / min(\|A\|,\|B\|)` | ~0.38 = "foreign brain, own language"（借架构训新 tokenizer）；1.000 = 直连微调 |
| **权重**（embedding CKA） | Linear CKA（旋转/各向同性尺度不变） | 可靠确认 from-scratch（近零），但无法强检测 derivation |

## 两个关键陷阱（方法论贡献）

1. **逐行余弦无用（旋转不变性）**：Transformer 隐藏空间无特权基，两个模型可在任意正交旋转下编码相同信息。逐行 cosine 把旋转视为不相似——对已知 from-scratch 模型和已知 Llama 衍生模型都测得近零均值 cosine，无法区分血统
2. **CKA 帮助但不足**：from-scratch 模型对候选基座 CKA 近零（独立预训练干净证据）；但 continued-pretraining 衍生模型仅 ≈0.25，勉强高于同族不相关模型基线 ≈0.21。大规模训练重塑 embedding 使 CKA 在"衍生"侧失去判别力

**诚实结论**：权重轴可靠确认 from-scratch，但不是 derivation 的强检测器——config + tokenizer 指纹才是主要证据。

## Genotype 标签体系

| Genotype | 架构 | 权重 |
|----------|------|------|
| 🟢 Native | 自有 | from-scratch |
| 🔵 Adapted | 基本自有 | 借了一轴 |
| 🟡 Mixed | 部分 | 部分继承 |
| 🔴 Ported | 外来（精确匹配） | 继承 |

## 附加轴：注意力多样性作为原创性代理

config.json 中不同注意力机制的计数（layer_types, mamba2_d_state, hyena_filter_order, mla_kv_lora_rank 等）是架构原创性的廉价代理——最复杂的模型在一个栈中组合 mamba2、hyena、MLA、linear attention、gated-delta-net、native-sparse-attention 和 sliding-window。

## 实证结果

应用于九家韩国组织的公开基础模型（LG K-EXAONE 2.0 750B 等）：部分精确匹配外来架构 + tokenizer（Ported）；部分自有架构和权重无外来匹配（Native）；多数介于两者之间。

## 可复现性

三个函数即完整方法：`arch_fingerprint(repo)` / `tok_overlap(a, b)` / `linear_cka(X, Y)`，指向 Hub 上任意两个 repo 即可运行。Live demo + 完整数据集：Model Genome Korea Space。

## 相关实体

- [从零构建 LLM](ch01/1147-llm.html) — 从零训练的工程路径（对应指纹的 from-scratch 侧）
- [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — tokenizer/架构层优化背景
- [本地推理成本分析](ch01/607-apple-silicon-costs-more-than-openrouter.html) — 模型实现差异的实证视角

---

