---
title: "多模态智能体框架基础与前沿综述"
source_url: "https://arxiv.org/abs/2608.20379"
author: "Neel Mokaria, Rishie Raj, Dheeraj Baiju et al."
ingested: "2026-08-31"
sha256: "daa8733a2f98347f293718dffd1e553546e9ebb28e883d7f93d2ada8f1c1c93d"
source_type: "arxiv_pdf"
---

# A Survey on Foundations and Frontiers of Multimodal Agentic Frameworks: Techniques and Applications

> 原文：https://arxiv.org/abs/2608.20379
> PDF用户提供，第一方来源（Maryland/KAUST/Oxford/NUS 等二十余位研究者）

## 概述

60 页综述，系统梳理多模态智能体框架的技术演进。核心贡献：以三种感知融合策略（委托/后期/早期）为主线，分析其对感知、推理、记忆、行动四个模块的影响；覆盖四大应用赛道（机器人/GUI/内容生成/长视频）；剖析性能-效率-可扩展性-延迟-可靠性权衡。

## 基础架构

- **编排器**：推理（CoT→ToT→视觉基础推理）、规划、记忆（工作/短期/长期）
- **感知模块**：图像/视频/音频→抽象表征，多模态与纯文本LLM最根本区别
- **行动模块**：API/网页/机械臂执行

## 三种感知融合策略

1. **委托感知（Delegated）**：AI调用外部工具（CLIP等），灵活但信息丢失严重（VisProg、HuggingGPT）
2. **后期融合（Late-fusion）**：ViT编码器+投影层映射到LLM嵌入空间（Flamingo、RT-2）
3. **早期融合（Early-fusion）**：所有模态Token化统一处理（GPT-4o、Gemini）

## 推理与规划

三层级：基于语言推理→视觉基础推理（坐标标注拉进推理链）→跨模态推理（同步整合多模态信号）

## 记忆

- 模态专属记忆：分模态存储，文本索引检索
- 统一记忆：全部模态映射同一嵌入空间
- VideoAgent 每查询只检索 8.4 帧（比密集采样少 20 倍）；VLog 紧凑叙事实现 10-20 倍加速

## 行动执行三种形态

1. **语言驱动**：JSON/Python/API 调用（Toolformer、Gorilla）
2. **视觉基础**：像素坐标/UI 元素操作（AppAgent、CogAgent）
3. **具身多模态**：连续控制信号（RT-2、OpenVLA）

**关键结论：架构融合方式比参数量更重要**——7B OpenVLA 超过 55B RT-2-X

## 四大应用赛道

### 机器人与具身智能
三阶段：SayCan→PaLM-E→VLA 端到端。痛点：云端 API 延迟、真实环境泛化。

### GUI 与网页导航
从 HTML/XML→CogAgent 高分辨率微调→GPT-4o 原生多模态+SoM。WebArena 基准 SOTA 距人类仍 60-70% 差距。

### 多媒体内容生成
从 VISPROG/AudioGPT 编排工具→GenArtist 原生多模态自我纠错。

### 长视频理解
VideoAgent 选择性检索（20 倍效率提升）、VideoMind Chain-of-LoRA。Gemini 1.5 百万上下文仍推理薄弱。

## 性能与效率权衡

- 融合越深效果越好，但原生多模态 API 成本延迟高
- **综述观点：面向真实落地，训练领域专用模型长期比持续调用商用API更可行**
- 多模态智能体极易级联错误，校验越多延迟越高

## 六大局限

1. 接地鸿沟（GUI 像素级定位差距巨大）
2. 性能与效率矛盾
3. 长周期记忆脆弱
4. 评测隐患（闭源 API 无法复现、数据泄露）
5. 对抗鲁棒性不足
6. 多模态幻觉

## 相关实体

- [[raw/articles/multimodal-agentic-frameworks-survey-mozhi-space-2026|模智空间解读]] — 模智空间对该综述的中文解读（v×c=30 Raw），本文为一手论文原文
