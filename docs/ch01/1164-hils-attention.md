# 腾讯混元 HiLS-Attention：可学习层级稀疏注意力实现无限上下文建模

## Ch01.1164 腾讯混元 HiLS-Attention：可学习层级稀疏注意力实现无限上下文建模

> 📊 Level ⭐⭐ | 2.6KB | `entities/tencent-hunyuan-hils-attention.md`

# 腾讯混元 HiLS-Attention：可学习层级稀疏注意力实现无限上下文建模

> **论文**：Hierarchical Sparse Attention Done Right: Toward Infinite Context Modeling (arXiv:2607.02980)
> **来源**：Hyman的杂货铺 | [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/腾讯混元开源hils注意力.md)
> **Github**：https://github.com/Tencent-Hunyuan/HiLS-Attention

## 核心创新

HiLS-Attention（Hierarchical Learnable Sparse Attention）将"选哪些历史片段参与注意力"做成可端到端训练的层级路由，解决了稀疏注意力中长期存在的训练闭环缺口：路由分数不参与最终前向权重，LM loss 无法教会"该选谁"。

### 可学习 chunk 质量代理

使用 LogSumExp 一阶近似，将 chunk 质量写成线性可计算代理：
1. **可学习的压缩 chunk key**——替代传统均值池化 key，更有表达力的 chunk 表示
2. **熵项校准**——在"均匀分布"和"尖峰分布"之间自适应补偿，避免均值池化抹平尖峰

### 层级 softmax 分解

注意力 = 块内分配 × 块间分配。块间分配项里的可学习 chunk 质量代理直接影响最终注意力权重，使下游语言建模损失反向优化路由本身。

## 训练策略

| 路径 | 说明 | 新增参数 |
|------|------|----------|
| 轻量改造 | 冻结基座，只训练 landmark token + 低秩查询校准 (Q-Cal) | < 1% |
| 全参数继续训练 | 与 HoPE 位置编码配合 | 全参数 |

## 关键实验数据

- **8K 训练外推到 4M**：345M 规模 RULER 检索 90%+ 准确率（512 倍外推）
- **512K 推理加速**：预填充 ~13.5×，解码 ~15.7×（单卡 H800, 345M）
- **7B 检索平均分**：HiLS-Attn-HoPE-Q-Cal 达 97.42 vs 全注意力基线 33.50
- **通用能力保持**：General/Math/Code 与基座接近，无"长文本上去、常规能力下滑"副作用

## 价值评估

- **方法价值**：路由学习纳入 LM 主损失，补上稀疏注意力训练闭环缺口
- **工程价值**：低成本改造现有全注意力模型（<1% 新参数）
- **系统价值**：速度提升来自算法和 kernel 协同
- **边界**：主要在语言建模和长上下文任务验证，多模态和复杂 Agent 场景还需后续证据；chunk 路由超参数仍需细调

---

