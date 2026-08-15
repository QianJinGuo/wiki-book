# 淘宝闪购-爆品团精排Scaling Up迭代实践

## Ch01.1441 淘宝闪购-爆品团精排Scaling Up迭代实践

> 📊 Level ⭐⭐ | 2.3KB | `entities/淘宝闪购-爆品团精排scaling-up迭代实践.md`

# 淘宝闪购-爆品团精排Scaling Up迭代实践

> WeChat-阿里云开发者 | 发布于 2026-07-16 | 评分入库 v×c≥49

## 核心内容

原创 李伟康 2026-07-16 08:30 浙江 阿里妹导读 文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。 淘宝闪购爆品团业务排序模型过去很长一段时间更像是在“堆模块”：遇到一个问题，就补一个结构。短期看，这种方式能持续拿收益，但当模型越做越大，结构碎片化、计算不够稠密、调参成本高等问题会越来越明显。 这次爆品团排序模型升级，核心不是再增加一个局部模块，而是把主干从传统 DLRM 架构切到 Token-Based 的 RankMixer 架构。围绕这条主线，我们系统做了负采样、多任务学习、序列建模、Tokenization、FFN、MoE 和 Task Tower 等结构消融。 多期迭代后，模型规模从 85M 扩展到 107M，再到 243M，并在爆品团频道页取得了稳定线上收益。 先说结论 这次迭代里，比较明确的结论有几条。 旧模型的问题不是单个模块失效，而是整体结构碎片化。 RankMixer 将特征组织成 Token 后，可以用统一 Token-Mixing 主干承接高阶交互。 随机负采样并不适合当前样本分布。 保留全量负样本并做 Loss 加权更稳。 GradNorm 能缓解多任务学习节奏不一致。 但训练计算量也会明显增加。 Tokenization 不一定越复杂越好。 Pad-Split 效果接近 Group-wise，且实现更简单。 在当前 16 Token 配置下，Dense FFN 仍是更稳的主线。 Sparse MoE 在当前 16 Token 设定下没有超过 Dense。 Flat Concat 更利于 Tower Scaling。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/淘宝闪购-爆品团精排scaling-up迭代实践.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

---

