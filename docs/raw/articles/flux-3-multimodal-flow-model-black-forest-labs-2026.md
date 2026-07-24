---
title: "FLUX 3 — Multimodal Flow Models as the Backbone of Visual Intelligence"
source_url: "https://bfl.ai/blog/flux-3"
ingested: 2026-07-24
source: newsletter
sha256: 
sha256: e201ce83243a921150bd1ebe4041f079f515417bf5a2b2a4b9a68cb0c6cf73ad
---

# FLUX 3 — Multimodal Flow Models as the Backbone of Visual Intelligence

Black Forest Labs 于 2026 年 7 月 23 日发布 FLUX 3，这是一个全新的多模态基础模型，统一学习图像、视频和音频。核心设计理念是：单一模态无法完整描述世界，每个模态都是同一底层现实的投影——图像捕捉空间结构，视频恢复时间维度，音频揭示因果关联，语言连接目标与抽象。FLUX 3 的核心理念是"从所有模态同时学习"，通过模态间的相互约束来理解底层现实。

## 架构

FLUX 3 基于 Self-Flow 方法构建，这是一种高效的对齐多模态生成与理解的方法。在此方法上，团队显著扩展了计算和训练数据规模，同时训练视频、图像和音频。

## 核心能力

### 视频
FLUX 3 可生成长达 20 秒的视频+音频。核心能力包括：
- **Text-to-video**：文本直接生成视频+音频
- **Image-to-video**：从起始帧继续生成（动画模式）或作为视觉参考
- **Video-to-video**：保留原视频核心元素，转换到新场景
- **Keyframe-to-video**：在关键帧之间控制过渡
- **Agentic chaining**：将单个片段链接成多镜头序列
- **多语言对白**、广泛视觉风格、排版生成

### 图像
相比前代 FLUX 1/2，在复杂 prompt 处理、多语言文字渲染方面显著提升。

### Action
FLUX 3 将动作预测直接集成到模型中，使用预训练的视频骨干网络作为动力感知基础，微调专用动作模型。与 mimic robotics 合作开发 FLUX-mimic 视频动作模型，正在奥迪（Audi）工厂进行灵巧操作测试。

## 评测结果

在早期评估中，FLUX 3 对比竞品胜率：
- vs Grok Imagine Video: 69%
- vs Kling v3 Pro: 60%
- vs Happy Horse v1: 59%
- vs Happy Horse 1.1: 57%
- vs Seedance 2.0 / Gemini Omni Flash: 52%
- vs Runway Gen-4.5: 77%
- vs Luma Ray 3.2: 93%

## 发布计划

- FLUX 3 Video：API 和私有权重访问
- FLUX-mimic / FLUX 3 Action：研究和商业合作伙伴
- FLUX 3 Image：API 和私有权重访问
- FLUX 3 Dev：开源权重多模态骨干网络

## 意义

FLUX 3 代表了视频生成领域向**统一多模态基础模型**方向的重要进展。其"感知→预测→行动"的路线图指向 real-world visual intelligence——能够感知、预测并在物理和数字环境中行动的模型。Self-Flow 方法让多模态生成和理解在同一架构中对齐，是一个重要的技术方向。

→ [[raw/articles/flux-3-multimodal-flow-model-black-forest-labs-2026|原文存档]]
