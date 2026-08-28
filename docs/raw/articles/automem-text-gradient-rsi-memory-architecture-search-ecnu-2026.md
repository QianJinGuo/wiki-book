---
title: "AutoMem: 基于文本梯度递归自改进（RSI）的自动记忆架构搜索框架"
source_url: "https://www.xiaohongshu.com/explore/6a83c8d40000000028008725"
author: "周杰-华东师大（ECNU-ICALK）"
source: "小红书"
ingested: 2026-08-28
sha256: 5321989ecbe9b9ee9eb68bbb1cee5e417c28fce99eb81d0dc3277d1131bc7549
---

# AutoMem: A Text-Gradient Recursive Self-Improvement Framework for Automated Memory Architectures Search

（arXiv 2608.14621，华东师范大学计算机科学与技术学院 + 上海人工智能实验室，Lin Du / Jie Zhou / Yuxuan Cai / Kai Chen / Qin Chen / Xin Li / Bo Zhang / Wei Li / Liang He）

## 笔记正文（作者发布）

欢迎大家关注我们最新的工作 AutoMem，该框架主要解决问题：不同任务对于记忆存储、检索、管理等方式效果天差地别，如何快速找到针对某一个任务最优的记忆框架。我们采用了无梯度的迭代自我进化（RSI）的方法，模型设计方案，评测效果，反思不足，改进方案，迭代往复。从图4可以看到我们的模型相比随机搜索，实现了稳步增长，最终在下游任务都达到 SOTA 水平（图3）。代码完整开源。

- Arxiv: 2608.14621
- Project: ECNU-ICALK/AutoMem

## 核心内容（轮播图 OCR 提取）

### 问题与动机

长期记忆对 LLM Agent 越来越重要，但记忆设计是高度耦合的架构问题：编码什么、如何存储、如何检索、如何管理，在不同任务和 backbone 模型间差异巨大。论文构造离散搜索空间：**5 encoders × 5 stores × 6 retrievers × 4 managers**，证明**没有任何单一记忆架构能一致主导**——不同任务偏好不同模块组合，导致显著性能差距。

### AUTOMEM 框架

基于上述动机提出 AUTOMEM——针对任务自适应的记忆架构搜索的文本梯度递归自改进框架。在分解空间上通过两个组件优化：

- **EGAS（Experience-Guided Architecture Search，经验引导架构搜索）**：从历史搜索轨迹和积累的反思中提出候选架构。proposer LLM 以 Pareto front P、观察图 G、经验台账 C 和最新文本梯度 α 为条件，提出 K 个可行候选架构
- **FGMD（Failure-Guided Module Diagnosis，失败引导模块诊断）**：将记忆相关失败定位到具体模块，转化为针对性文本反馈。候选架构在搜索批次上评估产生 rollout traces 并更新 Pareto front；基于规则的 scope gate 丢弃与记忆无关的失败（工具错误、超时等），剩余失败归因到责任模块，生成引导下一轮的文本梯度 α(t+1)

### 实验结果

三个基准（GAIA、WebWalkerQA、xBench-DeepSearch）× 两个 LLM backbone：
- **平均提升 2.8 分**（六个 benchmark-backbone 组合），一致超越最强人工设计记忆基线
- **token 成本 -14.3%**（Qwen3.5-122B-A10B 下相对最强准确率基线）
- **图3**：GAIA（Qwen3.5-122B-A10B）上 AutoMem 单调提升至 71.5，超过 best random 69.7（random 搜索 10 个架构多数低于 No-Memory 基线 65.0）
- **Table 2 节选**（GAIA 准确率 %）：Qwen3.5 下 No-Memory 65.0 / Mem0 67.1 / MemoryBank 67.8 / Voyager 66.4 / AUTOMEM **71.5**；gpt-5.1-mini 下 No-Memory 69.1 / MemEvolve 73.3 / AUTOMEM **75.2**；gpt-5.4 下 AUTOMEM **77.6**
- 优势：少次引导迭代内找到强于大幅扩大随机搜索的架构
