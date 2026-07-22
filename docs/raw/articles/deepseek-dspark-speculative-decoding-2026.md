sha256: 3bbc5f3add0c205947d50753163a8e42817d14fc9335b11d2278a49ab5e02f52
---
title: "DeepSeek V4 DSpark：投机解码框架 DeepSpec 开源"
source_url: "https://mp.weixin.qq.com/s/xFzo8SBzqcxtAL3mYnYV-A"
author: "机器之心"
published: 2026-06-29
ingested: 2026-06-29
type: raw-article
language: zh
tags: [speculative-decoding, deepseek, inference-optimization, llm, open-source]
---

# DeepSeek V4 DSpark：投机解码框架

**技术报告**: [DSpark_paper.pdf](https://github.com/deepseek-ai/DeepSpec/blob/main/DSpark_paper.pdf)
**代码库**: https://github.com/deepseek-ai/DeepSpec

## 核心创新

DSpark 是 DeepSeek-V4-Pro 基础上的推测性解码模块，重点在工程落地而非模型能力迭代。已部署在 DeepSeek-V4（Flash 和 Pro）线上流量中。

### 半自回归生成架构（Semi-Autoregressive Generation）
- 保留并行草稿模型高吞吐优势
- 加入轻量级串行模块，建模 block 内 token 依赖关系
- 缓解并行草稿模型后续位置的接受率衰减问题

### 置信度调度验证（Confidence-Scheduled Verification）
- 置信度头（Confidence Head）评估每个 token 存活概率
- 硬件感知前缀调度器根据实时引擎吞吐量动态定制验证长度
- 算力只分配给预期回报最高的 token

### 异步调度
- 兼容零开销调度（ZOS）和连续 CUDA 图回放
- 利用前两步历史预测决定当前动态截断长度
- 隐藏调度延迟，避免 GPU 流水线停顿
- 目标模型输出分布完全无损还原

## 性能

- Qwen3（4B/8B/14B）上平均接受长度：比 Eagle3 +26.7%~30.9%，比 DFlash +16.3%~18.4%
- vs MTP-1 基准：相同吞吐下生成速度 +60%~85%（Flash）、+57%~78%（Pro）

## DeepSpec 开源工具链

三阶段流水线：数据准备 → 训练 → 评估

- **数据准备**：下载提示词 → 推理引擎重生成 → 构建目标缓存（Qwen3-4B 默认约 38 TB）
- **训练**：单节点 8 卡，支持 config 覆盖
- **评估**：GSM8K、MATH500、AIME25、HumanEval、MBPP、LiveCodeBench、MT-Bench、Alpaca、Arena-Hard-v2

内置三种草稿模型：DSpark、DFlash、Eagle3。支持 Qwen3 和 Gemma。
