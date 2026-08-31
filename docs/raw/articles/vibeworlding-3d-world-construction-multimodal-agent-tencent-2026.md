---
title: "从Vibe Coding到Vibe Worlding：AI开始自己造世界了"
source_url: "https://mp.weixin.qq.com/s/a_gYfIx-5fq9NlCk_xszHQ"
author: "腾讯技术工程"
ingested: "2026-08-31"
sha256: "753ee0de01dd7fed45aab54af3a25f58acffbaaa77c5e5089e3a17b30d55b9dc"
source_type: "wechat_mp"
---

# 从Vibe Coding到Vibe Worlding：AI开始自己"造世界"了

> 原文：https://mp.weixin.qq.com/s/a_gYfIx-5fq9NlCk_xszHQ
> 论文：VibeWorlding: Can Multimodal Agents Construct 3D Open Worlds End-to-End?
> 机构：香港科技大学（广州）、腾讯 AI 平台部

## 概述

VibeWorlding 是一个多模态智能体框架，通过多轮对话、调用工具、观察渲染反馈来自主构建和编辑交互式 3D 世界。核心不是文本转3D生成模型，而是可训练、可验证、可复现的基准与强化学习框架。

开源：6,828 条多模态 query、2,616 个高质量 3D 资产、323 个人工标注种子 3D 世界、沙盒环境和双重约束验证器。

**关键结果：经过 RL 后训练的开源模型 VibeWorlder-30B-A3B，在综合 Pass@1 指标上反超了 GPT-5.5 和 Qwen3.8-Max。**

## 任务形式化

给定多模态请求（纯文本描述或现有世界+编辑指令），智能体自主推断意图、规划布局、调用 3D 工具（检索/添加/旋转/平移/删除），每轮观察沙盒返回的多模态反馈（3D 地图文本+五视角渲染图），循环至完成。

## VWE-Bench：6,828 条查询

人机协作三步构建：种子世界生成→扰动生成→查询改写。六大类查询：精确资产级编辑（Verified）+ 模糊表达/场景批判/引导/重申/复杂场景描述（Unverified）。

## 双重约束验证器

- **物理可行性**：碰撞检测（穿模/悬空检查）、高度合理性、生态合理性
- **意图对齐**：风格一致性、空间布局合理性、元素完整性

Verified 查询直接对比 Ground-truth 地图；Unverified 查询由 MLLM 裁判按 Rubric 打分。

## VibeWorlding-Gym 训练管线

1. Gemini 3.1-pro 反向合成冷启动 SFT 轨迹
2. GRPO 算法在双重约束验证器奖励信号下做多模态 RL
3. 纯文本从零构建 + 多模态图文编辑两类任务联合学习

## 实验结果

评测 8 个前沿闭源模型 + 3 套 3D-Scene 框架 + VibeWorlder 系列：

- **VibeWorlder-30B-A3B 综合 Pass@1 反超 GPT-5.5 和 Qwen3.8-Max**
- GPT-5.5、Qwen3.8-Max 整体成功率不到 60%
- **碰撞无冲突**是所有模型共同瓶颈（RL 后仍只有 59%~68%）
- **3D 推理** RL 提升最显著：基座 6%~20% → RL 后 56%~85%（VibeWorlder 30B 达 85%，超 Gemini 3.1-pro 62%）
- **检索能力**提升到 91%~99%，超过前沿闭源模型

## 六维能力拆解

碰撞无冲突、高度合理性、生态合理性、3D 理解、3D 推理、检索合理性。

**结论：RL 让模型看懂场景、找对资产的能力大幅跃升，但精确空间操控（摆到不碰撞位置）仍是所有模型共同天花板。**

## CLI 原型

命令行交互 + 浏览器实时 3D 渲染。场景一：从零造农场（Agent 自我修正栅栏高度/树冠大小）。场景二：编辑已有城市（精确定位删除指定车辆建筑，其余元素不变）。

## 局限与未来方向

- 精确空间推理（距离/角度量化关系）是所有 MLLM 共性短板
- 可能需要从预训练/中训练阶段注入更多 3D 空间数据
- 纹理/材质/光照级别的精细控制尚未覆盖
