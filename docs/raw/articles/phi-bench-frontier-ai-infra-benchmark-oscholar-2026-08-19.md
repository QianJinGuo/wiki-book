---
title: "阶跃✖️中科大新研究：AI能给自己造Infra吗？——Φ-Bench 前沿AI基础设施基准"
source_url: "https://www.xiaohongshu.com/explore/6a83d84f000000002403cae4"
source_name: "Oscholar"
type: "raw"
created: 2026-08-19
ingested: 2026-08-19
tags: [ai-infra, benchmark, llm, agent, evaluation, self-improvement, xiaohongshu]
sha256: 2e148cadae48c1bf860aa3b97dbcc00d0bb01fda35ccd584634a513f023ff050
---

# 阶跃✖️中科大新研究：AI能给自己造Infra吗？——Φ-Bench 前沿AI基础设施基准

> 账号：Oscholar | 阶跃星辰×中科大×北大等团队 | 项目：faibench.org / github.com/one2piece2hello/faibench_Frontier_InfraBench

## 核心问题

大模型已经能写代码，但能不能进一步"造好自己脚下的基础设施"？中科大、阶跃星辰、北大等团队提出 **Φ-Bench（Frontier AI Infrastructure Benchmark）**，专门评估 LLM 在真实 AI Infra 场景中的工程能力。

现有 KernelBench 一类工作多聚焦单个算子或局部代码，而真实 Infra 开发需要读懂大型代码库、定位性能瓶颈，再持续实现、性能分析、调试和优化。

## 基准构建

为构建覆盖最全且最真实的 LLM Infra Bench，团队从顶级系统论文和主流开源仓库中大规模筛选任务来源，最终保留 **2,260 篇论文** 和 **1,852 个工程 Artifact**，覆盖 **9 大 Infra 方向**，再经过 Agent 辅助挖掘和专家复核，得到 **85 个真实、高难度任务**。

## 三类题型

Φ-Bench 包含三类题型：
1. **测关键算子实现**：实现关键算子
2. **长程开发**：要求 Agent 阅读仓库、跨文件完成长程开发
3. **系统级优化**：只给系统目标，由 Agent 自己找瓶颈、提假设并持续优化整个代码库

## 实验结果

8 个前沿模型整体得分都不高：**Claude Opus 5 最高仅 36.53**，**DeepSeek-V4 Pro 最低为 13.31**，且没有任何模型能在全部 Infra 领域保持稳定领先。

有意思的现象：**高分模型在执行轨迹中反而出现更多错误**。作者认为，这类模型更愿意持续尝试、诊断和修正，而部分低分模型更容易提前放弃或退回简单方案。

## 三大"好模型"特质

研究团队进一步分析不同能力模型在端到端系统优化任务中的优化轨迹，总结出三大特质：
1. **谋定而后动**：先用低成本实验筛选假设，降低每次优化迭代成本
2. **实验求新知**：严格控制变量和噪声，提高每次尝试的信息增益
3. **谨慎下结论**：在归因性能变化前排除其他混杂因素，防止测量误差导致错误的优化结论

## 意义

Φ-Bench 把 AI 自我改进的评测边界进一步推到了 Infra：模型不仅要会写代码，还要学会提出假设、做实验、验证并优化支撑自身运行的系统。如果 AI 未来要参与自身能力迭代，Infra 很可能是绕不开的一环。

---

**决策**：v=6 / c=5 / v×c=30 → **Raw only**（Oscholar 研究组论文解读号稳定档，第 5 例确认）。主题全库零覆盖非 DUPLICATE，但二手论文解读 c=5 封顶，30 < 42 无 entity 可 SUPP，不达 Entity 门槛。
