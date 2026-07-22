---
title: ERNIE 3.0→5.0：百度文心大模型的后训练进化
source_url: https://mp.weixin.qq.com/s/mU6w3HnTX6wU5Z6wfAFHwg
publish_date: 2026-05-01
tags: [wechat, article, openai, deepseek, agent, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 46d11935e61c5b88ad19067737c6a094bb2a38b1c4a1fa65ed3ec82332d9cf9a
---
# ERNIE 3.0→5.0：百度文心大模型的后训练进化
> Weixin 文章 | 2025-05-01 | 百度技术官方发布
---
## 核心进化路径
- **ERNIE 3.0**（2021）：百亿参数，知识增强，主要应对搜索和推荐场景
- **ERNIE 4.0**（2023）：2023 年初开始正式重构，2023.10 在百度世界大会首发。基座模型和一系列基础模型做了大改
- **ERNIE 4.5**：开源，MoE 架构
  - MMLU-Pro 73.9，AIME 2024 38.0（DeepSeek-R1-0528 在 AIME 2025 更高）
  - SVBench 87.5，MMMU 68.7，MathVista 72.8
  - 推理时只需 25 个激活参数
- **ERNIE 5.0**：Twinlight 混合推理架构，强推理路径 + 高效路径，意图由模型自主选择推理路径
  - 基座架构：**TransNets（Transformer 中的 Transformer）**，Intra-FFN 改造，多个头共享 FFN 但每个头不同精度（FP8/FP16/BF16），从而打破 KV-Normality 问题
  - 25 个激活参数的「小模型」跑出大模型效果
  - 推理增强：用大模型对输出结果做 OOD 样本检测，防止无认知发散
## RL 后训练飞轮（核心贡献）
百度将后训练视为**从「二阶段」到「三阶段」的演进**：
| 阶段 | 方法 | 目标 |
|------|------|------|
| 有用性 | RLHF（奖励模型训练） | 模型学会理解和回答 |
| 安全性 | DPO（专家红队+迭代） | 辨别安全问答 |
| 诚实性 | 加固性 DPO | 巩固安全对齐 |
关键洞察：**后训练的三种目标需要分阶段进行**——如果同阶段混合，模型会混淆；如果先后训练再统一，对齐难度巨大。分阶段训练是按优先级递增进行。
## RL Post-training Loop
验证器（Reward Model / Rule-based Reward）驱动持续闭环：
1. RL 训练改善生成质量
2. 更好的生成→更丰富的样本池
3. 验证器能力通过样本池持续提升
4. 验证器提升→更精准的 reward signal
5. 回报到 RL 训练，形成飞轮
混合奖励建模：RM + Rule-Based + LLM-as-Judge 三层结合，不同维度用不同验证器。
## Agent 能力训练
- **三个维度**：任务规划（Plan）、工具调用（Grounding）、意图遵循（Goal adherence）
- **数据构建**：用大模型合成 agent 训练数据；搜索后训练数据用真实搜索记录
- **训练信号**：Plan——用模型的奖励模型评分；Grounding——如果工具调用成功给奖励，失败不给；Goal adherence——检查最终结果是否满足用户查询
## 多阶段 Chat Template 演进
工业级的 Chat Template 演化轨迹：
| 版本 | 架构 | 特点 |
|------|------|------|
| V1 | 单函数 → 多函数 | 从 system 单函数到多工具函数 |
| V2 | 多函数 → 多系统 | 引入多个系统级 message 角色 |
| V3 | 多系统 → Simplest JSON | 简化系统角色复杂度 |
| V4 | Simplest JSON → Simplified JSON | 最终形态：一行展开，结构清晰 |
## 相关链接
- OpenAI ERNIE 4.5/5.0 MMLU 评测对比
- 百度文心大模型工程架构：TransNets Intra-FFN
- 「RAG + 搜索」→ 演进到「RAG + 搜索 + Agent」（重构搜索流程，用 Self-Fix 修改搜索 query + 多路召回搜索 plan）