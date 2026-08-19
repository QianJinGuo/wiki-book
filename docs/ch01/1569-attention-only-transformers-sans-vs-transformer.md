# Attention-Only Transformers 受控研究（SANs vs 标准 Transformer）

## Ch01.1569 Attention-Only Transformers 受控研究（SANs vs 标准 Transformer）

> 📊 Level ⭐⭐⭐ | 3.0KB | `entities/attention-only-transformers-controlled-study-sans-arxiv-2607-18363.md`

# Attention-Only Transformers 受控研究（SANs vs 标准 Transformer）

## 核心发现

前馈（feed-forward）层占据 transformer 非 embedding 参数的三分之二，但此前从未有过同时控制参数、算力、深度的必要性检验。本文预训练 attention-only decoder transformers（Simple Attention Networks, SANs）与标准 transformer 对照，分别匹配参数数、训练 FLOPs、深度（2-48 层），最高 105B tokens、6M-87M 参数。

## 三个关键结果

1. **原位删除 FF 层代价高**：matched-depth 下标准 transformer 领先 0.47 nats，matched-FLOPs 下领先 0.26 nats。
2. **预算重分配闭合差距**：将释放的预算重分配给注意力深度后，matched-params 下差距缩小到 0.006 nats（损失的 0.27%），跨 seed 对可复现到万分之一，且随 5B/30B/105B 预算收缩，跨 29x 规模范围保持在 ~0.02 nats 附近。
3. **剩余差距定位到参数化回忆（parametric recall）**：attention-only 模型在上下文接地回答上更好，在需要权重内知识的场景更差。权重谱分析显示：路由矩阵（Q/K）早期结晶，内容矩阵秩积累缓慢，删除 FF 层将此积累转移到注意力输出投影。

## 可训练性

**QK-normalization 是 48 层 attention-only 栈保持可训练的关键**——不是 FF 层，也不是残差门控。差距集中在低上下文查询预测上，在最大预算下完全局部化于此。预注册测试验证了该解释：预测知识密集型 web 文本上 0.02-0.05 nat 差距，fineweb-edu 匹配对实测 0.040。

## 意义

在受测范围内，"注意力做了其余一切"（attention does the rest）。这是对 FF 层必要性最严格的一次受控检验——为模型架构设计提供实证依据：FF 层的主要贡献是可训练性稳定与权重知识存储，而非注意力无法替代的核心计算。

## 相关

- [Attention Mechanism](https://github.com/QianJinGuo/wiki/blob/main/concepts/attention-mechanism.md)
- [DiscoFormer](../ch05/108-ai.html)
- [SSM Attention 睡眠巩固研究](ch01/265-0.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/controlled-study-attention-only-transformers-arxiv-2607-18363.md)

---

