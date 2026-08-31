---
title: "60页综述：多模态智能体框架基础与前沿"
source_url: "https://mp.weixin.qq.com/s/NcJSy3AyB2_qMlfOLmduQw"
author: "模智空间（小智）"
ingested: "2026-08-31"
sha256: "ce572a9fa3b50f855c0ff40220295d43b3c2fd50de5d382b0592512731722f5e"
source_type: "wechat_mp"
---

# 60页重磅综述！解读多模态智能体框架

> 原文：https://mp.weixin.qq.com/s/NcJSy3AyB2_qMlfOLmduQw
> 论文：《A Survey on Foundations and Frontiers of Multimodal Agentic Frameworks: Techniques and Applications》（马里兰大学、KAUST、牛津大学、新加坡国立大学等二十余位研究者）

## 概述

过往多数 Agent 综述聚焦 LLM 文本智能体，把多模态视作附加功能。这篇综述以多模态融合为核心，系统梳理架构设计、融合策略、应用场景及效率挑战。

## 基础架构

- **编排器（大脑）**：推理（CoT→ToT→视觉基础推理）、记忆（工作/短期/长期+RAG）、感知模块（图像/视频/音频→抽象表征）、行动模块（API/网页/机械臂）
- **文本核心地位**：推理、代码生成和工具调用的核心语言，但密集型模态转文字造成严重信息损失

## 三种感知融合策略

1. **委托感知（Delegated）**：AI调用外部工具（CLIP等），灵活但信息丢失严重。代表：VisProg、HuggingGPT
2. **后期融合（Late-fusion）**：ViT视觉编码器+投影层映射到LLM嵌入空间。代表：Flamingo、RT-2
3. **早期融合（Early-fusion）**：所有模态Token化统一处理。代表：GPT-4o、Gemini

## 推理与规划

三层级：基于语言推理（简单但丢失空间细节）→ 视觉基础推理（坐标标注拉进推理链）→ 跨模态推理（同步整合多模态信号）

## 记忆

- 模态专属记忆：分模态存储，文本索引检索，节省算力但跨模态关联弱
- 统一记忆：全部模态映射同一嵌入空间，支持跨模态检索但开销激增
- VideoAgent每查询只检索8.4帧（比密集采样少20倍）；VLog紧凑叙事实现10-20倍加速

## 行动执行三种形态

1. **语言驱动**：JSON/Python/API调用（Toolformer、Gorilla）
2. **视觉基础**：像素坐标/UI元素操作（AppAgent、CogAgent）
3. **具身多模态**：连续控制信号/关节角度（RT-2、OpenVLA）

**关键结论：架构融合方式比参数量更重要**——7B OpenVLA 超过 55B RT-2-X

## 四大应用赛道

### 机器人与具身智能
三阶段：SayCan（LLM规划+视觉评估）→ PaLM-E（后期融合）→ VLA端到端（RT-2、OpenVLA）。痛点：云端API延迟、真实环境泛化。

### GUI与网页导航
从HTML/XML文本→CogAgent高分辨率微调→GPT-4o原生多模态+SoM标记。WebArena基准上SOTA距人类仍60-70%差距。

### 多媒体内容生成
从VISPROG/AudioGPT编排工具→GenArtist原生多模态自我纠错。痛点：缺统一基准、多轮迭代计算开销大。

### 长视频理解
VideoAgent选择性检索（20倍效率提升）、VideoMind Chain-of-LoRA（小模型大模型级效果）。Gemini 1.5百万上下文仍推理薄弱——扩大窗口无法解决推理瓶颈。

## 性能与效率权衡

- 融合越深效果越好，但原生多模态API成本延迟高
- 领域微调模型在速度/成本/精度间取得更好平衡
- **综述观点：面向真实落地，训练领域专用模型长期比持续调用商用API更可行**

## 六大局限

1. 接地鸿沟（GUI像素级定位差距巨大）
2. 性能与效率矛盾
3. 长周期记忆脆弱
4. 评测隐患（闭源API无法复现、数据泄露）
5. 对抗鲁棒性不足
6. 多模态幻觉
