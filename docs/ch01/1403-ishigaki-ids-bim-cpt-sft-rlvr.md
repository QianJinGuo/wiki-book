# Ishigaki-IDS — 建筑 BIM 领域专用基础模型（合成数据 + CPT/SFT/RLVR）

## Ch01.1403 Ishigaki-IDS — 建筑 BIM 领域专用基础模型（合成数据 + CPT/SFT/RLVR）

> 📊 Level ⭐⭐ | 3.4KB | `entities/ishigaki-ids-domain-specialized-foundation-model-construction-2026.md`

# Ishigaki-IDS — 建筑 BIM 领域专用基础模型

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-onestruction-built-the-ishigaki-ids-foundation-model-with-aws-genaiic.md)

## 概述

Ishigaki-IDS 是 ONESTRUCTION（日本建筑科技创业公司）在 AWS GenAIIC 技术顾问下构建的建筑 BIM 领域专用基础模型，面向 IDS（Information Delivery Specifications，XML 标准）文件编写。建筑行业面临劳动力短缺，BIM 采用需要专业知识，IDS 文件编写需要掌握语法 + IFC 规则，通用模型难以准确产出其结构。Ishigaki-IDS 让非 BIM 专家也能审查和管理属性信息。

## 三阶段训练管线

Ishigaki-IDS 基于 Qwen3（8B/14B/32B）开源模型，采用三阶段训练管线解决领域适配三挑战（数据稀缺、IFC 词汇注入、IDS 语法）。

- **CPT（continued pre-training）**：注入 IDS/IFC 领域知识，语料 = web corpora + 领域专家参与的合成数据（合成数据覆盖大部分训练语料）
- **SFT（supervised fine-tuning）**：IDS 编写指令（CSV/自然语言）→ 期望 IDS 输出配对训练；但 SFT 遗留问题：看似合理但错误的 XML tag 选择、属性值错误
- **RLVR（reinforcement learning with verifiable rewards）**：用 buildingSMART 的 IDS-Audit-Tool 作奖励函数（检查 XML well-formedness、IDS 结构有效性、语义一致性），模型基于机械正确性信号迭代 —— 数据稀缺领域 RLVR 尤其合适，无需大量监督数据

## 关键方法

- **合成数据质量 > 数量**：领域专家参与合成数据创建是性能差异关键，Volume 本身无法达到同样效果
- **可验证奖励加速迭代**：机械验证器作自动奖励信号，数据稀缺场景下比人工评估更快
- **YaRN 上下文扩展**：确认 120k tokens 输入输出正确生成
- **评测**：自建 IDS-Bench（IFC 版本/建筑学科/日英双语/Implement-Structure-Content 轴）；Ishigaki-IDS 在 XML 结构合规与 IDS 结构合规接近 100%，IDS 内容一致性 >80%；通用 frontier 模型 XML well-formed 但 IDS 结构合规 <25%、内容一致性接近 0

## 基础设施

Amazon EC2 P5en（2 × p5en.48xlarge，NVIDIA H200）+ AWS ParallelCluster + Amazon FSx for Lustre，提供稳定多节点分布式训练与高吞吐数据访问。

## 经验教训

- 合成数据质量 > 数量
- 可验证奖励加速迭代
- 稳定基础设施让实验自由（不调试集群）

## 相关

- [RLVR 概念](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md) / [Self-taught RLVR](ch01/1176-self-taught-rlvr.html) / [可验证奖励 RL](https://github.com/QianJinGuo/wiki/blob/main/entities/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learn.md) / [合成数据](https://github.com/QianJinGuo/wiki/blob/main/concepts/synthetic-data-generation.md)

---

