---
title: "HarnessOpt-Bench：评估 LLM harness 优化（第一方发布）"
source_url: "https://www.xiaohongshu.com/explore/6a7d828000000000290307ee"
author: 刘东瑞（上海 AI Lab）
platform: Xiaohongshu
ingested: 2026-08-13
slug: harnessopt-bench-llm-harness-optimization-eval-shai-2026
sha256: 44d5e075ac827a196c0e662554623f89ff260b93f922fb767a911b0fe62c8589
---

小红书「刘东瑞 上海 AI Lab」发布 HarnessOpt-Bench 论文介绍（第一方发布，无 arXiv 链接，teaser 级）。

## 核心问题

如何系统性地评估和比较 LLM 在 **harness 优化任务**上的能力。Harness 优化 = 在固定预算下通过迭代评估改进 harness（prompts/tools/control flow/memory/orchestration code 组成的系统层）。

## 三个层面的动机

1. **社区缺乏标准化评估协议**：现有工作各自使用不同的目标 agent、种子 harness、评估预算、信息披露策略和评分协议，结果无法比较，并混淆了三个因素：优化器模型本身的能力 / 优化器所使用的编码 harness（coding harness）/ 目标 agent 与评估协议的设计。
2. **Harness 优化的独特挑战难以被现有基准覆盖**：不仅是代码生成问题，更是高成本、高噪声、长程的决策问题——评估反馈昂贵且随机（有限预算内决定如何采样）；需从稀疏或不完整证据诊断失败原因；必须区分真实改进与噪声并做部署决策。现有基准（代码合成或廉价可验证优化任务）无法捕捉这些挑战。
3. **分离模型能力与工具链贡献**：业界通常将模型性能与其原生工具链（native harness）混为一谈，观察到的差异究竟来自模型权重还是配套编码 harness 尚不清楚。

## 三个研究问题

- RQ1：前沿优化器模型在此任务上是否可区分？
- RQ2：当前优化器在搜索策略和失败诊断上存在哪些不足？
- RQ3：优化器自身的编码 harness 对最终效果的贡献相对于模型本身有多大？

## 方法：HARNESSOPT-BENCH 基准框架

端到端评估框架，通过：
- **固定目标模型、环境和验证器**（控制变量，只让优化器变）
- **测试集全程 held-out**（搜索过程中不可访问）
- **可信执行环境中强制执行预算与访问边界**

将 harness 优化从不可比的方法演示转变为**可复现、可审计的能力评估目标**。
