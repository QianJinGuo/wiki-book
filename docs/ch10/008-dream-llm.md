# DREAM：用冻结 LLM 的自回归预测训练稠密检索器，无需标注正负样本

> 📊 Level ⭐⭐⭐ | 10.1KB

## 核心概述

DREAM (Dense Retrieval Embeddings via Autoregressive Modeling) 证明了**不需要任何人工标注的正负样本**，只凭"一篇文档能不能帮冻结大模型预测出正确答案"这一个信号，就能把稠密检索器训得很强。关键诀窍：把检索器的相似度分数注入到冻结大模型的 query-focused retrieval attention heads 中，让 NTP 损失沿注意力路径反向传播调教检索器。0.5B-8B 全规模领先。

→ [原文存档](https://mp.weixin.qq.com/s/OaChk2wvXSY2s2QrkgOObw)

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

## 深度分析

### 监督信号从"标注对"转移到"预测质量"

对比学习范式的成本大头在样本构造：正样本靠人工标注，hard negative 靠挖掘，而 false negative 的污染几乎无法在流程内消除。DREAM 把这条供应链整个绕开——监督信号直接取自"候选文档是否帮冻结 LLM 预测出目标"，NTP 损失本身就是标注。这个视角的深层含义是：**LLM 的预训练知识被复用为免费的标注员**，文档有用性由模型的实际预测行为裁决，而非人工的相关性判断。这与 LLM 自身的训练目标同源（可参见 [LLM 预训练与 SFT](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-pretraining-vs-sft.md)），检索训练与生成训练由此第一次共享同一把尺子。

### 注意力接口：把相似度分数变成可微路径

检索器与 LLM 是两个独立模型，NTP 损失在 LLM 内部计算，梯度原本到不了检索器。DREAM 的关键工程决策是把相似度分数经 softmax 归一化后注入 query-focused retrieval heads，并以可学习门控混合原始注意力与检索器引导的注意力，让梯度沿注意力权重一路回传到检索器参数。候选分数在集合上归一化（Σ=1）还带来隐式的负样本机制：抬高一篇文档的权重必然压低其余候选，**竞争即监督**，无需刻意构造负例。这也解释了为什么训练时耦合、推理时解耦是安全的——检索器学到的是一个可独立使用的嵌入空间。

### 消融证明：信号定位比容量更重要

随机选 head 注入时 BEIR NDCG 只有 0.064，换 query-focused retrieval heads 后跃升至 0.489——同一模型、同一数据，近八倍差距全部来自注入点选择。Top-16 head 是最佳平衡：太少扛不动信号，太多则混入弱检索头稀释梯度。这说明冻结 LLM 内部已经存在专门"从 query 出发收集有用上下文"的回路，检索训练只需搭上这条现成通路，而不是把信号广播到全网络。检索头作为分析工具已在多模态场景得到验证（[MMRetHeads](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mmretheads-multimodal-retrieval-heads-emnlp-2026.md)），DREAM 则第一次把它用作训练接口。

### 全规模领先，但优势在小模型端最大

0.5B-3B 各档在 BEIR 与 RTEB 上全部最佳，1B 档比 Revela 高 0.015-0.081（BEIR）/ 0.068-0.102（RTEB）；而 8B 档只是追平 E5-mistral-7b。这个形状很说明问题：在标注充足、成熟对比学习配强 backbone 的赛道，无标注信号的收益有限；**在标注稀缺、模型较小的长尾场景，绕开标注瓶颈的收益最大**。这决定了 DREAM 类方法现实的落地位置——垂直领域与新兴语言，而非与头部商用 embedding 正面竞争（工业界同赛道实践可参见 [美团搜索](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meituan-search-3-llm-semantic-embedding-ranking-2026.md)、[InstEmb](https://github.com/QianJinGuo/wiki-public/blob/main/entities/instemb-instruction-following-embeddings-2026.md)）。

## 实践启示

### 1. 低资源/垂直领域优先尝试 NTP 式检索训练

0.5B-1B 档的全线最佳说明小检索器受益最明显，而垂直领域恰恰是人工标注最贵、hard negative 最难挖的地方。手上有领域 LLM 的团队，可以直接用 DREAM 范式把"领域文档对领域 LLM 的预测增益"当作免费监督信号。

### 2. 把训练目标从"相似"换成"有用"

对比学习优化的是 query-document 相似度，DREAM 优化的是"文档是否提升下游生成"。RAG 系统真正需要的是后者——检索器与最终回答质量对齐，训练目标与业务指标之间不再隔一层代理指标。

### 3. 冻结裁判，防止裁判被讨好

若 LLM 参与更新，损失可以通过"改变 LLM 自己的预测行为"下降，而不必真正改进文档权重——这与 reward hacking 同构。DREAM 冻结裁判是信号不失真的前提；任何"用强模型给弱模型出信号"的训练设计都应守住这条边界。

### 4. 先定位信号通路，再堆算力

随机 head 与 query-focused head 近八倍的差距说明：接入任何"借模型内部信号"的方案之前，先花小成本定位通路（这里即检索头），定位错误的算力投入近乎归零。消融实验不是锦上添花，而是这类方法的第一优先级。

### 5. 训练时耦合、推理时解耦是可复用的架构模式

检索器只在训练时进入 LLM 的注意力，推理时作为独立 embedding 模型工作——上线成本为零，可无缝替换现有向量检索组件。这种"训练期借用、服务期解耦"的模式适用于一切"借强模型当教练"的场景。

## 关联

- [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rag-retrieval-augmented-generation.md) — DREAM 训练的检索器直接提升 RAG 系统质量
- [Agentic RL 六框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-rl-frameworks-practices-long-horizon-wolfe-2026.md) — Agentic search 的检索质量是关键瓶颈

---

