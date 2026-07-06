# DREAM：用冻结 LLM 的自回归预测训练稠密检索器，无需标注正负样本

## Ch01.818 DREAM：用冻结 LLM 的自回归预测训练稠密检索器，无需标注正负样本

> 📊 Level ⭐⭐ | 4.7KB | `entities/dream-dense-retrieval-autoregressive-modeling-challengehub-2026.md`

## 核心概述

DREAM (Dense Retrieval Embeddings via Autoregressive Modeling) 证明了**不需要任何人工标注的正负样本**，只凭"一篇文档能不能帮冻结大模型预测出正确答案"这一个信号，就能把稠密检索器训得很强。关键诀窍：把检索器的相似度分数注入到冻结大模型的 query-focused retrieval attention heads 中，让 NTP 损失沿注意力路径反向传播调教检索器。0.5B-8B 全规模领先。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dream-dense-retrieval-autoregressive-modeling-challengehub-2026.md)

## 问题：检索器训练的标注瓶颈

稠密检索器（dense retrieval embedding model）是 RAG/agentic search 的地基。主流训练靠对比学习（contrastive），需要正样本 + hard negative 标注。但构造样本是最大瓶颈：正样本需昂贵人工标注，hard negative 难可靠挖掘且常混入 false negative。

反差：NTP（next-token prediction）已是 LLM 训练基石，监督信号可从"预测下一个 token"自然涌现。**能不能用 NTP 训练检索器？**

## 核心方法

### 直觉

如果一篇文档真的包含回答 query 的有用信息，把它喂给大模型当条件，目标答案应更容易被预测（NTP 损失更低）。**NTP 损失就是衡量检索质量的尺子。**

### 关键设计：注意力拆分

DREAM 把注意力拆成两个独立选择：
1. **读哪篇文档**（across documents）→ 检索器控制
2. **在文档里读哪些 token**（within document）→ 冻结大模型保留

具体做法：
- 检索器产出 query-document 相似度分数 → softmax 归一化为文档级权重
- 注入到冻结大模型的 **query-focused retrieval heads**（不是所有 head，只挑那些本来就在"从 query 出发看有用上下文"的 head）
- 文档内部注意力先归一化（保留大模型对 token 的偏好），再乘以检索器的文档权重

### 训练目标

NTP 交叉熵损失，梯度不更新大模型参数 θ_LLM，只更新检索器参数 θ_ret：
- 某篇文档帮大模型预测出目标 → 调高其相似度分数 → 降低损失
- 没帮上忙 → 调高反而被惩罚

**天然制造候选间竞争**：权重在候选集上归一化（Σ=1），抬高一篇必压其他，无需刻意挖掘负样本。

## 为什么冻结大模型更好

冻结的大模型是"文档有用性"的固定裁判。若大模型也更新，损失可能因"大模型改了自己预测行为"而下降，不再直接指向"更好的文档权重"，信号反而变弱。

## 实验结果

| 规模 | BEIR (9 tasks) | RTEB (14 tasks) |
|------|---------------|-----------------|
| 0.5B | 最佳 | 最佳 |
| 1B | 最佳（比 Revela +0.015~0.081） | 最佳（比 Revela +0.068~0.102） |
| 3B | 最佳 | 最佳 |
| 8B | 追平 E5-mistral-7b | 超 Qwen3-Embedding 之外所有 |

- 与 InfoNCE 用完全相同数据和候选池，差距直接指向目标设计本身
- 消融：随机 head → NDCG 0.064；query-focused head → 0.489（BEIR）
- Top 16 head 最佳平衡点（太少扛不动信号，太多混入弱检索头稀释信号）
- DREAM 学到更好的 uniformity + 竞争机制推开无用文档

## 核心贡献

1. **无需标注**：NTP 损失作为检索监督信号，天然制造候选竞争
2. **注意力接口**：相似度分数注入 query-focused retrieval heads，而非全 head
3. **训练时耦合/推理时解耦**：训练时检索器分数参与大模型注意力，推理时检索器独立工作
4. **自回归预测 → 检索监督**的范式转换

## 关联

- [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-retrieval-augmented-generation.md) — DREAM 训练的检索器直接提升 RAG 系统质量
- [Agentic RL 六框架](../ch04/507-agentic-rl.md) — Agentic search 的检索质量是关键瓶颈

---

