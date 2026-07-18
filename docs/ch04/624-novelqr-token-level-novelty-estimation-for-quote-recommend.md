# NOVELQR — Token-Level Novelty Estimation for Quote Recommendation

## Ch04.624 NOVELQR — Token-Level Novelty Estimation for Quote Recommendation

> 📊 Level ⭐⭐ | 3.4KB | `entities/novelqr-token-level-novelty-estimation.md`

# NOVELQR — Token-Level Novelty Estimation for Quote Recommendation

> ACL 2026 论文，复旦大学数据科学学院 Bowei Zhang 等

NOVELQR（Novelty-aware Quote Recommendation）是一个两阶段引据推荐框架，核心贡献包括：**Agent驱动的深度语义标签**和**Token级新颖性估计**，用于破解LLM的自回归延续偏差（auto-regressive continuation bias）

## 核心发现

用户系统性地偏好"意料之外，却合情合理"（unexpected yet rational）的引据。**新颖性（novelty）是独立于语义合理性（relevance）的质量维度**，用户愿意用少量恰当性换取更高新颖性。

## 两阶段框架

### 阶段一：离线构建 — 生成式标签智能体（Label Agent）

为每条引据生成七维语义标签：

- **深层含义（Deep Meaning）** — 引据的潜台词与核心主张
- **核心领域（Core Domain）** — 所属知识领域
- **核心价值观（Core Value）** — 传递的价值判断
- **核心洞察（Core Insight）** — 独特的洞见
- **适用性（Applicability）** — 可应用的场景
- **情感基调（Sentiment）** — 情感倾向

### 阶段二：在线推理

1. **深度语义检索** — 用 deep-meaning embedding 替代原始文本嵌入
2. **标签过滤** — 确保语义合理性
3. **Token级新颖性估计** — 破解自回归延续偏差

## 核心技术：Token级新颖性估计

**自回归延续偏差（auto-regressive continuation bias）**：LLM训练目标最大化下一个token概率，导致其偏好"It is a well-known fact that..."等最可预测的陈词滥调。

**新颖性分数公式**：
```
SN = -(1/T) × Σ wt · log P(token|context)
```
其中 wt 聚焦"新颖性token"而非所有token加权。核心设计思想是**观测与判断分离**——LLM仅作为"概率计算器"提供 token 概率分布，评分由独立的信息论公式完成。

## 实验结果

- 人工A/B测试胜率78%
- 在Hit@K、NDCG@K、MRR等自动指标上均优于 QuoteR、QUILL 等基线
- 964份问卷 + 100人控制实验验证用户偏好
- 诊断评估发现：仅凭引据文本，GPT-4o也难以准确理解深层含义；加入辅助信息后，Qwen3-8B可与GPT-4o匹敌

## 意义

NOVELQR 提出的 token 级新颖性估计不仅适用于引据推荐，也为更广泛的 LLM 评估与生成任务提供了**破解自回归偏差**的一般性方法论框架——即"LLM 提供概率，独立公式做决策"的分离式评估范式。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/novelqr-用agent做深度语义标签-token级新颖性破解自回归偏差.md)

---

