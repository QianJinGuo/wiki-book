# Interaction Models

## Ch03.122 Interaction Models

> 📊 Level ⭐⭐ | 2.8KB | `entities/interaction-models.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/interaction-models.md)

## Summary
*(AI-generated summary - TODO: manually review)*

## Key Points
-

## 深度分析
本文系统梳理了 Human-AI 协作的三类交互模型：**平行模式**（人类与 AI 分别处理不同任务片段）、**循环模式**（AI 生成结果，人类审核后反馈修正）、**混合模式**（动态切换前两者）。其核心洞察在于：交互模型的选择不是技术问题，而是**工作流认知负荷**的分配问题。当任务边界清晰、错误容忍度高时，平行模式效率最优；当任务需要高频迭代和质量把控时，循环模式更安全。
值得特别关注的是「可扩展性」维度——论文提出的交互模型框架试图解决的是 LLM 在企业级场景中落地的核心障碍：如何在保持输出可控的前提下，将 AI 能力横向扩展到更多业务流程。传统观点认为 AI 辅助工作流天然是「人机协同」，但本文指出模型本身的能力边界决定了交互模式的上限，而非工具设计本身。
从信息论视角看，每次人机交互都是一个信息熵降低的过程：AI 降低不确定性，人类补充缺失的上下文。理解这一点有助于设计更高效的交互边界——**什么时候应该让人介入，什么时候应该让模型自主决策**，决定了整个系统的吞吐量。

## 实践启示
1. **评估任务特征再选模式**：将任务按「错误代价 × 迭代频率 × 自动化率」三维矩阵分类，高频低错任务优先平行模式，高价值低频任务用循环模式，避免用单一模式套用所有场景
2. **建立交互成本核算机制**：每次人类反馈都应计入系统成本，设计时应量化「AI 自动完成 vs 人工介入」的临界点，而非凭直觉判断
3. **关注模型的置信度校准**：交互频率与模型的置信度分布强相关——在模型输出置信度方差大的任务上，应增加人工审核节点，而非一味追求自动化率

## Related

## 相关实体

- [Thinking Machines 交互模型（Interaction Models）](/ch01-510-thinking-machines-interaction-models-ai-cold/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/genesis-ai-gene-25-embodied-foundation-model.md)

- [Interaction Models: A Scalable Approach to Human-AI Collaboration](/ch03-122-interaction-models/)

---

