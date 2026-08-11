---
source_url: https://www.xiaohongshu.com/explore/6a79a82c000000002402edd4?xsec_source=app_share&type=normal&xsec_token=CB7EmngytlMcTABmTfIPbT4n266QxqCVxBiUqhlYRInpc=
ingested: 2026-08-11
sha256: 0e04fa286f530d30c4ac02139f894b1ad7bcb93e3bcbdeb93bb1be8b6376371b
title: "Skill 质量基线，你设置了吗"
author: 阿里云云原生
source: 小红书
platform: xiaohongshu
type: raw
tags: [agentloop, skill-evaluation, quality-baseline, badcase, offline-experiment, skill-observability, aliyun, cloud-monitor, skill-lifecycle]
---

# Skill 质量基线，你设置了吗

> 原始来源：小红书 https://www.xiaohongshu.com/explore/6a79a82c000000002402edd4
> 作者：阿里云云原生（小红书科技 AMA 活动），2026-08-11

## 全文

AgentLoop 平台提供 Skill 评估与优化的完整闭环方法论，覆盖**创建、可观测接入、离线实验、Bad Case 分析、迭代验证、发布上线** 6 个步骤。核心理念是用可观测数据感知现状，用离线实验量化质量，用 Bad Case 驱动优化，用评分趋势验证效果。

- **Skill 创建后接入可观测**：通过 Skill 大盘实时掌握加载次数、调用次数、使用用户数等指标
- **离线实验**：支持自定义评分维度（任务完成度、工具调用准确性、输出格式规范性、安全边界遵守度等），生成加权总分和详细评估报告
- **Bad Case 分析**：按失败原因分类（Prompt 指令不清晰、工具调用错误、输出格式不符、安全边界突破），针对性优化后重新实验验证效果
- **版本管理追踪评分趋势**：建立质量基线（如总分≥80），未达标前不发布上线

实战案例：云监控 2.0 全生命周期管理 Skill 通过两轮 Bad Case 优化，从 59 分提升至 72 分，达到质量基线后发布上线，形成"线上观测→离线评估→优化迭代→发布验证"的持续改进闭环。

标签：#skill评估 #BadCase #AIAgent #可观测性 #持续优化 #阿里云 #智能体 #小红书科技AMA
