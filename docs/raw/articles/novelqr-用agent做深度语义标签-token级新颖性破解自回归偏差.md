---
type: source
source_url: https://mp.weixin.qq.com/s/yd3S4v5_ny-VxRIp7ZiSuw
sha256: f7fbbcf27eb2977b40a3e9834c8c3e76a50d8dd811633dedf4e657b9aa3e951d
ingested: 2026-07-09
source: DataFunTalk（微信公众号）
source_title: NOVELQR — 用Agent做深度语义标签，Token级新颖性破解自回归偏差，引据推荐人类胜率78%
source_published: 2026-07-09 13:00
review_value: 9
review_confidence: 8
review_stars: 5
---

# NOVELQR — 用Agent做深度语义标签，Token级新颖性破解自回归偏差，引据推荐人类胜率78%

> ACL 2026 论文: What Makes an Ideal Quote? Recommending "Unexpected yet Rational" Quotations via Novelty
> 论文: https://arxiv.org/abs/2602.22220
> 作者: 复旦大学数据科学学院 — Bowei Zhang

## 核心发现

用户系统性地偏好"意料之外，却合情合理"（unexpected yet rational）的引据。**新颖性是独立于语义合理性的质量维度。**

## 实证研究

- 964份问卷 + 100人控制实验
- 理想引据：恰当性均分9.1/10 + 新颖性均分7.4/10
- 用户愿意用少量恰当性换取更高新颖性
- 诊断评估发现：仅凭引据文本，GPT-4o也难以准确理解深层含义；加入辅助信息后，Qwen3-8B可与GPT-4o匹敌

## NOVELQR 框架 — 两阶段

### 离线构建阶段：生成式标签智能体（label agent）
为每条引据生成七维标签：
- 深层含义（Deep Meaning）
- 核心领域（Core Domain）
- 核心价值观（Core Value）
- 核心洞察（Core Insight）
- 适用性（Applicability）
- 情感基调（Sentiment）

### 在线推理阶段
1. 深度语义检索（deep-meaning embedding 替代原始文本嵌入）
2. 标签过滤确保语义合理性
3. Token级新颖性估计 — 破解自回归延续偏差

## 核心技术突破

**自回归延续偏差（auto-regressive continuation bias）**：LLM训练目标最大化下一个token概率，直接打分偏好"最可预测"的陈词滥调。

**Token级新颖性估计**：SN = -(1/T) × Σ wt · log P(token|context)，聚焦"新颖性token"而非所有token加权。观测与判断分离——LLM仅作为"概率计算器"，评分由独立信息论公式完成。

## 实验结果

- 人工A/B测试胜率78%
- Hit@K、NDCG@K、MRR等自动指标上均优于QuoteR、QUILL等基线
