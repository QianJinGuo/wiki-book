---
title: "Video Generation Models are General-Purpose Vision Learners (GenCeption)"
source_url: "https://arxiv.org/abs/2607.09024"
arxiv_id: "2607.09024"
authors:
  - "Letian Wang"
  - "Chuhan Zhang"
  - "Rishabh Kabra"
  - "Jasper Uijlings"
  - "Steven Waslander"
  - "Andrew Zisserman"
  - "Kaiming He"
  - "Misha Andriluka"
  - "Eduard Gabriel Bazavan"
  - "Andrei Zanfir"
  - "Cristian Sminchisescu"
affiliation: "Google; University of Toronto; University of Oxford"
project_page: "https://genception.github.io/"
published: "2026-07-10"
ingested: "2026-07-14"
tags: [vision, multimodal, video-generation, foundation-model, generalist, diffusion, arxiv]
sha256: "ef44a704fee60d969fa9c2973950a364c1112ed71a2fb632a097c02c32f2baa4"
---

# Video Generation Models are General-Purpose Vision Learners (GenCeption)

**GenCeption** 提出以文生视频（text-to-video）生成为视觉基础模型的预训练范式，将预训练的视频生成扩散模型转化为统一的、前馈的通用视觉感知模型。论文发表于 2026 年 7 月，涉及 Google、University of Toronto、University of Oxford 多家机构，Kaiming He 为合作者之一。

## TL;DR

将计算机视觉从任务特定的专用模型推向通用视觉智能——正如 NLP 从任务特定模型进化为通用语言智能。GenCeption 将预训练的视频生成模型重用为统一的、通用的、前馈的视觉模型，通过文本指令驱动，在多个视觉任务上达到 SOTA 水平，展现出卓越的数据效率和有趣的涌现行为。

## 核心贡献

1. **Visual Generative Pretraining**: 将视频生成模型作为表征预训练，并在统一的架构中进行多任务后训练。
2. **Unified & Feed-Forward**: 同时处理稠密和稀疏视觉任务，将多步生成骨干转化为单步前馈模型，大幅降低推理成本。
3. **SOTA & Emergent**: 在深度估计、表面法线预测、相机姿态估计、指代表达分割、3D 关键点预测等任务上达到或超越专门模型（DepthAnything3, SAM3, D4RT, VGGT-Omega, Sapiens, David, Genmo, Lotus-2）。

## 方法

GenCeption 利用视频生成扩散模型作为预训练基础，捕获丰富的时空世界先验和原生视觉-语言对齐能力。在多任务后训练阶段，模型被调整为前馈模型，主要在合成数据上微调以处理多样的感知任务。

关键架构特点：稠密视觉任务在 RGB 环境空间中统一，可在潜在空间中高效地施加监督；稀疏视觉任务通过向 Diffusion Transformer (DiT) 添加可学习 token 作为额外输入来实现。

## 关键发现

- **数据效率**: 视频生成预训练骨干在同等微调数据下胜过替代预训练范式（V-JEPA, VideoMAE V2）
- **缩放特性**: 初步展现出模型和数据缩放特性——更大的模型和更多数据带来性能提升
- **极端数据效率**: 仅用 D4RT 和 VGGT-Omega 1/7 到 1/500 的训练数据即可达到可比性能
- **涌现行为**: 仅在合成人体视频上训练的模型能泛化到真实场景和分布外物体类别（如动物和机器人）
- **Sim-to-real**: 实现从合成到真实的无缝迁移

## 范式意义

论文提出一个类比：正如 NLP 从任务特定模型进化到通用语言智能（GPT 系列），计算机视觉正处于类似的转折点。**视频生成作为预训练范式（而非仅仅作为内容合成工具）可能是通往通用视觉智能的基础路径**。

## 相关资源

- arXiv: [2607.09024](https://arxiv.org/abs/2607.09024)
- PDF: [arxiv.org/pdf/2607.09024](https://arxiv.org/pdf/2607.09024)
- Project page: [genception.github.io](https://genception.github.io/)
