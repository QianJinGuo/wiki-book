# GenRec: Netflix LLM 原生推荐排序器

## Ch01.922 GenRec: Netflix LLM 原生推荐排序器

> 📊 Level ⭐⭐ | 7.0KB | `entities/genrec-towards-llm-native-recommendation-at-netflix.md`

# GenRec: Netflix LLM 原生推荐排序器

## 概述

GenRec 是 Netflix 构建的 LLM-backed 推荐排序器（ranker）：在内部 foundation LLM 之上做 Netflix 专属数据的 post-training，用自然语言"转写"（verbalize）用户历史、条目元数据与上下文，配合 catalog-aware 打分头对全目录条目打分排序。在大规模 A/B 测试中，GenRec 用远少于生产排序器的 Phase-2 标注数据和输入信号，就在短期与长期线上指标上取得统计显著提升，把推荐系统的工作重心从 feature engineering 转向 context engineering。

## 两阶段训练框架

GenRec 采用两阶段训练：Phase 1 从开源 LLM 出发，在 Netflix 专属语料上适配成"Netflix-aware"基础模型（内容理解、会员行为偏好模式、通用语言能力），更新频率较低，作为多个应用共享的 backbone；Phase 2 在排名专用数据与目标上做 post-training，聚焦排序质量与 steering，融入多路 reward 信号，更新更频繁以跟踪新内容与口味漂移，并显式在 serving 成本约束下优化。

## 训练数据即对话

Netflix 会员产生数百亿条交互事件（观看、播放时长、点赞/点踩、加入片单等），GenRec 将其转换为单轮或多轮"用户-推荐器"对话：user message 是转写后的上下文、画像、历史、条目元数据与任务；assistant message 是会员的真实行为。训练时 LLM 学习 assistant message 对 user message 的依赖关系，同时支持语言建模（LM）与排序目标；推理时不解码 assistant message，只喂入转写上下文后用 catalog-aware 打分头排序。

## 转写与 Context Engineering

传统推荐器依赖稠密特征与 embedding；GenRec 把用户历史与上下文转写为自然语言，直接编码进 LLM 语义空间，让模型自己发现条目关系与兴趣演化。context window 成为新的"feature budget"，因此引入 context engineering：完整保留高信号互动（长播放、点赞）、省略低信号事件（极短播放、快速悬停）、压缩重复行为（追剧）、对冷启动/重要条目选择性展开；在固定 token 预算内优先近期高信号历史，并最大化共享前缀以利于 prefix caching。

## 多目标损失

GenRec 用多目标损失联合训练：①catalog-aware 排序目标（对转写上下文给正样本更高分数，交叉熵损失）；②语言建模目标（保留通用语言理解，为推荐解释等文本生成留门）；③reward-weighted 对齐——用独立 reward model 的信号给每个训练样本加权（长期满意度代理 + 行为再平衡，如游戏 vs 电影、新片 vs 长尾），高价值互动权重大、低价值降权。reward-weighted 方法比完整 RL 更简单、成本更低，实测 GRPO 等 RL 方法有额外增益但成本更高，留作未来工作。

## 架构与 Serving 成本

GenRec 架构 = decoder-only Transformer backbone + catalog-aware ranking head：verbalizer 把历史/上下文/条目元数据序列化成文本 → LLM 产出 pooled hidden state → 打分头（dot product 或小 MLP）结合条目 embedding 打分 → softmax 得到排序。所有参数（backbone、打分头、条目 embedding）联合训练，大目录可用 sampled softmax 或 candidate set。Serving 在 Netflix 内部 LLM 栈上跑 vLLM，三条成本控制策略：更小/蒸馏模型、激进上下文压缩（可把 token 降到原来的 1/3 且离线指标几乎无损）、**prefill-only 推理**——prompt 只消费一次，单次前向给整个候选集打分，不做逐 token 解码（对大数据集排序场景这是关键成本优化）。

## 实验结果

离线：GenRec 用约 **40× 更少的 Phase-2 标注样本**就在 MRR 上超过生产排序器约 +1.6%；在线：覆盖 ~10% Netflix 流量、约 4 周的大规模 A/B，短期与长期指标均统计显著优于基线。消融结论：①数据与模型规模——~1B 与 ~10B backbone 都随 Phase-2 数据增加而 MRR 提升，固定训练预算下更大 backbone 更高；②Phase-1 相比直接用开源 LLM 提升约 10-20%，Phase-2 相比 Phase-1 提升 35-50%（Phase-1 变陈旧后 2 周内相对收益增长到约 80%）；③相比生产排序器数据效率高 10-40×；④上下文长度优化——压缩到原 token 预算的约 1/3，离线排序指标几乎无退化。

## 范式转移：LLM-Native 推荐

GenRec 不只是"换一个 Transformer"，而是指向推荐系统的四个方向性变化：①从 feature engineering 到 context engineering——"prompt 就是新的 feature vector"；②从定制架构（two-tower、DLRM）到共享 foundation backbone——差异化来自数据与转写策略、post-training 目标与 reward、推理优化；③scaling laws 成为设计指南——LLM backbone 下更多数据与更大模型一致地提升质量；④从 RecSys 基础设施到 LLM 基础设施——GPU 加速、vLLM/Triton、批量与缓存，推荐 serving 栈越来越像通用 LLM 栈。

## 相关实体

- [GenPage: Netflix 端到端生成式首页构建](../ch11/323-genpage-netflix.html) — GenPage 是生成式整页构建（Transformer 自回归生成首页布局），GenRec 是 LLM 排序层（对全目录打分排序），同属 Netflix LLM 原生推荐探索，但层次不同（page construction vs ranking）
- [Netflix LLM-as-a-Judge 剧集摘要评估](ch01/458-evaluating-netflix-show-synopses-with-llm-as-a-judge.html) — Netflix 用 LLM 做内容摘要评估
- [LLM 高效推理与 vLLM](ch01/1584-ai-infra.html) — GenRec 的 prefill-only serving 基于 vLLM
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) — GenRec 把 context window 当作新的 feature budget
- [Scaling Laws](https://github.com/QianJinGuo/wiki/blob/main/concepts/scaling-laws.md) — LLM backbone 下数据/模型规模作为设计指南
- [LLM 预训练 vs SFT](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-pretraining-vs-sft.md) — 两阶段训练框架的对照
- [LLM RL 算法演化](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-rl-algorithms-ppo-dpo-grpo-marl-evolution-2026.md) — GRPO 等 RL 方法的成本权衡

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/genrec-towards-llm-native-recommendation-at-netflix.md)

---

