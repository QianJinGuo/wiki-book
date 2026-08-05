---
source_url: https://www.xiaohongshu.com/explore/6a7180d80000000032032d63
source: xiaohongshu
title: "ICLR26 Oral｜开源推理模型封神数据配方 — OpenThinker3-7B / OpenThoughts3-1.2M"
ingested: 2026-08-05
type: raw-article
tags: [llm, reasoning, sft, distillation, dataset, data-engineering, iclr, openthinker]
sha256: 17c4fc36e42c4e2fc7d0376d934f54e0fc6233f9c6e50e80489beb0847bd011e
---

# ICLR26 Oral｜开源推理模型封神数据配方 — OpenThinker3-7B / OpenThoughts3-1.2M

> 作者：清水（小红书个人论文解读号）
> 发布于小红书，2026-08-05（上海）。标题：「ICLR26 Oral｜开源推理模型封神数据配方」

## 核心成果一句话

只用 SFT、不用 RL，7B 小模型 **OpenThinker3-7B** 吊打同期所有开源推理模型：

- **AIME25** 数学竞赛 **53%**（超 DeepSeek-R1-Qwen7B **+15.3%**）
- **LiveCodeBench** 代码 **51%**（**+17.2%**）
- **GPQA** 理科 **54%**（**+20.5%**）
- 配套 **OpenThoughts3-1.2M** 数据集全开源（数学 85w / 代码 25w / 理科 10w）

## 5 个颠覆认知关键结论（实验实锤）

1. **一题多答放大数据**：每个问题让教师模型输出 16 份不同推理，数据量直接 ×16，涨分巨明显。不用疯狂堆新题目，给老题目多几种解题思路性价比更高。
2. **强模型≠好老师**：DeepSeek-R1 跑分比 QwQ-32B 高，但用 QwQ 做蒸馏教师，下游模型全面更强。适合蒸馏的模型和跑分高的模型是两回事。
3. **答案过滤纯纯无用功**：各种校验、多数投票、错误答案删除全测一遍，完全不涨分，甚至掉性能。不用浪费算力筛答案，全部喂给模型训练就行。
4. **少即是多，别贪数据源多样性**：只选 Top1/2 高质量题库混合，比堆 8/16 个杂数据源效果好 5 个点。垃圾源拉低整体质量，宁缺毋滥。
5. **LLM 过滤碾压传统算法**：用 GPT 给题目标难度/推理长度筛选，远优于 fastText、嵌入聚类等老办法。

## 完整流水线极简拆解

1. 选高质量单一/双题库（数学 OpenMath、代码 CodeGolf 等）
2. LLM 标注难度，保留难题
3. 数学/理科严格去重，代码不去重
4. 每题生成 16 条推理轨迹（QwQ-32B 做老师）
5. 不做任何答案过滤，直接微调 Qwen2.5-7B-Instruct

## 话题标签
#LLM微调 #数据集工程 #ICLR26 #大模型 #LLM推理

## 关联
- OpenThinker3-7B 在 wiki 已被引用为蒸馏教师模型案例：[[entities/on-policy-distillation-vs-offline-distillation-loster|OPD vs SFT 蒸馏]]（蒸馏方法论角度），本条补充其数据配方（数据集工程角度）——互补非重复
- 与 [[raw/articles/longhorizon-harness-mea-alibaba-oscholar-2026-08-05|LongHorizon-Harness]]（同日入库）同为论文解读号批次
- 5 结论中"答案过滤无用/少即是多"与常见数据工程直觉相反，是 ICLR26 Oral 实验实锤
