---
title: 智能时空思考Agent｜首个真实出行隐式意图评测基准LBS-IntentBench正式开源
source_url: https://mp.weixin.qq.com/s/7NYQXk_MIJ1Ryod_wuY2hQ
publish_date: 2026-05-07
tags: [wechat, article, claude, gpt, agent, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 013bd78d96f144246346a11edf24079135cec4a65b612b55458cfbc32036dcd8
---
# 智能时空思考Agent｜首个真实出行隐式意图评测基准LBS-IntentBench正式开源
> 原文存档：https://mp.weixin.qq.com/s/7NYQXk_MIJ1Ryod_wuY2hQ
> 来源：高德技术，2026年5月6日
> 主题：LBS / 隐式意图 / Benchmark / 时空推理 / Agent / 高德
## 摘要
高德提出 LBS-IntentBench，首个基于大规模匿名化真实出行数据的隐式意图评测基准。
**核心定位：**
评估大模型在 LBS 场景中，从海量隐式信号（点击、搜索、导航片段）里精准推理用户深层意图的能力——而非执行明确指令。
**三维评测架构：**
- **Task 1 MII（出行意图推断）**：意图排序，考验多意图全局一致性，"感知→分析→决策"最终环
- **Task 2 CCI（上下文约束推断）**：逻辑辨析，植入时序错位/约束违背/因果倒置等干扰项
- **Task 3 GMT（通用出行任务）**：7个子任务，覆盖 POI 语义理解、事实检索、下一步预测、时空推理、异常识别
**关键发现：**
1. 闭源模型（Gemini-3.1-Pro、Claude-Opus-4.6）仍领先，但 Qwen3.5-35B-A3B 等开源小模型性价比极高
2. 多意图全局排序（Exact Match）是共同瓶颈，最优模型 <60%准确率
3. 复杂多约束决策边界模糊——单选90%+，多选断崖下跌
4. GPT-5.4 计数能力严重不足（6.1% vs Qwen3.5 70%）
**评测数据：**
- 微观行为序列：用户意图基础数据集 + 出行基础数据集，全量匿名化
- 宏观物理常识：全国34省 POI 知识库
- 真值：双阶段共识机制（6 LLM 裁判 → 5领域专家盲审）
**开源地址：** https://github.com/lbs-researcher/LBS-IntentBench