---
title: "维纳智能登上Nature通讯：AI不只会回答问题，开始生成高精度行业数据"
source_url: "https://mp.weixin.qq.com/s/X-ZS8SVKSnkPBI1KeRn4eA"
source_site: "机器之心"
author: "机器之心发布"
ingested: "2026-07-08"
sha256: "7a3dece45dd6ab41cb3730d262e7d4b7f2280391d21814250af67b23ebbfebe5"
type: raw
tags:
  - reasoning-data-generation
  - agent
  - nlp
  - medical-ai
  - enterprise-ai
  - closed-loop
  - causally-anchored
---

> 一家成立不到两年的香港 AI 公司，未依赖海量人工标注，也未陷入「堆参数」竞赛，却在 Nature 主要期刊上留下首个「中国数据生成公司」的印迹。

## 核心成就

2026 年 5 月 28 日，Nature Communications 发表了维纳智能与中山大学肿瘤医院合作的论文《Multimodal deep learning model for AI-based functional prognostic risk stratification in patients undergoing radical nephrectomy》。维纳智能成为中国首个、全球第四个数据生成科创公司登上 Nature 主要期刊（此前 DeepSeek 和面壁智能亦在 Nature 期刊发文）。

## 核心技术：推理数据生成

维纳智能提出 **cQrA** (context, Question, reasoning, Answer) 四元组格式，让大模型既生成提问又生成回答，同时给出思维链和推理过程。

技术路径：**数据→Token→数据** 大闭环
- 内参数：模型经预&后训练得到的参数
- 外参数：包括因果锚定（Causal Anchoring）所需基于上下文的 Few-shot
- 数据即参数：上下文相关的 Few-shot 来自高精度推理数据生成

## 解决 Agent 三重困局

1. **测不准**：软件测试方法对 Agent 几乎失效
2. **优化难**：缺乏有效的动态测试，系统处于"无反馈"状态
3. **答不准**：专业领域经典 LLM+RAG 架构通常只有 ~70% 准确度

方案：自动生成各行业高质量 cQrA 数据集 + 动态多维测试 + 闭环反馈优化 + 因果锚定推理

## 落地案例

- 出海价值观大模型系统（价值观一致性 > 99%）
- 实时 Agent 测试系统
- 保险大模型问答（准确率 > 95%，Gemini Search ~59%）
- 赛马大模型系统（统计问答 > 94%）
- 香港大模型写作&改错系统（改错准确度 > 90%）

## 背景

创始人柳崎峰教授，曾任 HKGAI 总经理、平安集团加马 AI 研究院院长。2023 年建设全球首个千卡 H800 AI 超算系统，2024 年训练中国第三家千亿 MoE 大模型。
