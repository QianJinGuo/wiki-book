---
title: "STAR-PólyaMath：Reasoner-Verifier-Meta-Strategist 三智能体数学推理 Harness"
source_url: "https://mp.weixin.qq.com/s/Dy1vtS6XJh3NwDuPrU_DGA"
author: "机器之心"
source: "机器之心"
ingested: 2026-07-01
sha256: placeholder
---

被一道数学竞赛题卡住很久时，高手往往能准确地判断：现在缺的是一个技术细节，还是整个思路从一开始就走错了？知道自己卡在哪里、又该在何时推倒重来，是人类解决困难问题时极其关键的元认知能力。而这恰恰是当前最强语言模型仍难以稳定具备的能力。

为了解决这一瓶颈，清华大学与微软亚洲研究院提出了STAR-PólyaMath，在LLM外部构建了一套完整的探索-推理-验证框架（harness），通过协调Reasoner、Verifier和Meta-Strategist三个智能体角色，循环驱动长程证明。

论文：https://arxiv.org/abs/2605.19338v1
开源：https://github.com/Julius-Woo/STAR-PolyaMath

## 架构

Orchestrator（无推理能力的Python编排器）协调三个智能体：

**Reasoner**：负责实际求解，包括探索问题结构、提出计划、执行每一步推理或计算。一次尝试中保留完整记忆；回溯和重新计划时重置记忆。

**Verifier**：独立审查Reasoner输出，不保留记忆。两个门控：目标门（是否完成计划目标，防语义漂移）和逻辑门（推理内容正确性）。四种判定：通过/质疑/回溯/提议重新规划。

**Meta-Strategist**：最关键创新。像经验丰富的导师，不执行具体数学推理，在高层面给出指导。单一持久会话，积累所有之前尝试、被放弃策略和长期失败模式。可发出强制性指令（如切换到禁止代码的纯推理模式）。

## 分层验证标签

每个中间断言标注为：[verified]（代码验证）、[easy-verify]（简单计算检查）、[hard-verify]（严格数学审查）。Verifier据此调整审查力度。

## 挑战循环与错误恢复

Reasoner与Verifier的交互是保留完整上下文的结构化辩论。Verifier质疑→Reasoner辩护/修正→Verifier重新评估。

两层恢复：Trace-back（回退到出错源头，归档错误分支，保留已验证结果）、Re-plan（Meta-Strategist判定方向有误时授权重新开始，将失败方向标定禁止）。

## 核心数据

- Apex 2025：93.75% vs GPT-5.5直接调用80.21%（+13.5%）
- 8大顶级数学竞赛全部最优，AIME/Putnam/HMMT满分
- AIME平均8分钟，Apex/IMO平均55+分钟，Meta-Strategist每题介入1.6-2.2次
- 消融实验：去掉回溯+重新规划损失最大；Meta-Strategist无记忆比完全去掉效果更差；不允许Reasoner辩护后Putnam从91.67%跌至75%

## 可泛化推理范式

核心机制（长程任务分解+结构化检验+跨尝试记忆+高层监督）适用于代码生成和科学发现等场景。
