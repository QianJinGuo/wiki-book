---
title: "全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍"
source: wechat
source_url: https://mp.weixin.qq.com/s/rl48C-c_1LQMdnJ7ZKDzJw
author: 褚杏娟
feed_name: InfoQ
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
date: 2026-05-28
created: 2026-05-28
updated: 2026-05-28
tags: [forge-train, ai-coding, training-framework, llm-infra,国产算力, megatron, minimax, harness, ai研发ai, human-on-the-loop, moe]
type: article
provenance_state: synthesized
sha256: 73d2fb03227156309e28e1cb171dbee1780f04d2b6ff25323a4ea1c949d646fd
---

# 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍

> **来源**：InfoQ，2026年5月28日，褚杏娟
> **背景**：面壁智能发布 ForgeTrain，全球首个全部由 AI 编写、零人介入的生产级训练框架，在华为昇腾和英伟达 GPU 上验证，速度比 Megatron 快 10%

## 一句话

面壁智能发布 **ForgeTrain**：全部由 AI 编写、零人介入的生产级训练框架，在华为昇腾完成 MiniCPM5-1B 训练验证，速度比英伟达 Megatron 快 10%，并提出 **Forge Engineering（锻造工程）** 方法论——为每个模型/芯片/任务现场定制训练框架。

## 核心思路：AI 研发 AI

**背景**：高质量互联网数据快速消耗、GPU/数据中心/电力越来越紧张，继续"堆资源"推动模型进化成本越来越高。

**面壁的答案**：让 AI 接管 AI 研发——代码生成、训练框架开发、算子优化、数据生成、评测反馈、实验迭代、模型架构探索。

**关键洞察**：可评测的问题最终会被 AI 解决。只要一个问题能被高效评测，能为模型准备足够专家数据，通过强化学习将能力回流到模型，AI 会把这件事做得越来越好。

## ForgeTrain 三阶段构建方法论

1. **从现有训练框架采集关键数据** → 形成评测标准和 **Harness**
2. **构建二进制一致的训练框架版本** → 目前已完成多机多卡版本，比英伟达 Megatron 训练速度快 10%
3. **解除二进制一致限制** → 迭代优化到超越 Megatron

## 为什么比 Megatron 快 10%

Megatron 需覆盖更广模型和场景，必须在通用性和性能之间做权衡。

ForgeTrain 为特定模型从零生成一套更贴合需求的框架，获得更细粒度优化空间。

## Harness 是什么

Harness 本质是把目标包装成一整套系统：环境 + 上下文 + 工具 + 任务流程 + 评分标准。

- 传统任务 Harness 天然存在：代码任务有编译器/单元测试/运行结果，数学有形式化验证或标准答案
- "AI 制造 AI"没有现成 Harness，运行成本高，因此发展更慢
- 面壁现在就是为"AI 制造 AI"建立"考场"

**人类角色转变**：Human in the Loop → **Human on the Loop**（AI 已自主运转，人只盯着有没有问题）

## 关键实验结果

- **华为昇腾**：MiniCPM5-1B 预训练耗时 3-5 天
- **英伟达 GPU**：MiniCPM4-0.5B 预训练两天
- **内部 8B 模型验证已完成**
- **MoE 等更复杂模型**即将推进

## Forge Engineering（锻造工程）

**核心思想**：当 AI 写代码成本趋近于零，没有必要继续做大而全的通用框架，而是为每个模型、每类芯片、每个训练任务"现场锻造"一套高度定制化的软件系统。

## 国产算力生态追赶思路

英伟达生态之所以好用，是因为长期积累了大量开发者和工程实践。国产算力起步晚，若仍依靠人类开发者一点点打磨，追赶难度很高。

**AI 可能改变这一局面**：人类开发者再多，也不如 AI 不知疲倦地打磨各个细节。

**目标**：用户需要什么，生态就能给出什么。到年底把头部国产算力软件全做一遍。

## 当前局限

- 主要覆盖框架和算子层面，算法调参尚未开始从零交给 AI
- Harness 行业共识尚未完全形成
- 仍在"Human on the Loop"阶段，不是完全无人介入

## 一句话总结

ForgeTrain 验证了"AI 为不同模型/芯片现场锻造训练框架"的可行性——不是继续写越来越庞大的通用框架，而是让 AI 像工匠一样，针对每种需求生成高度定制化的实现。

---

*面壁智能 | ForgeTrain*
