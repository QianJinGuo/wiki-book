---
title: "deepseek-cost-migration-system-layer-kv-cache-harness"
created: 2026-06-10
type: raw
sha256: 4f2672301f0b9f2443eb3931ecca919e57af55dbfc1b9a3d2cd8876da7bbc41d
---
# 从 KV Cache 到 Harness：DeepSeek 正在把成本搬到系统层

source_url: https://mp.weixin.qq.com/s/vlIMBcywGL7Xy9_Yc8iJQQ
source: 架构师 (JiaGouX)
author: 若飞
published: 2026-05-25
score: 9×8=72

## 摘要

DeepSeek 的核心价值越过"模型便宜"本身，落到了"模型之外"的系统层：缓存、内存、存储、编译器、调度、硬件适配，以及让模型变成 Agent 的 Harness。成本从 GPU/HBM 层往系统层搬移，MoE/MLA/Engram/TileLang 各司其职。

## 核心论点

DeepSeek 能不能定义工作负载——用模型架构、推理接口、缓存机制、Agent Harness 和开源工程，让硬件厂商、云厂商、推理框架、开发者工具都围绕它的负载来优化。

## 技术演进

- V2: MLA 压缩 KV Cache↓93.3%，训练成本↓42.5%，吞吐↑5.76x
- V4: 1.6T 总参/49B 激活（Pro），默认 1M 上下文
- Engram: 静态知识用查表替代计算，改变硬件分工

## Harness 层

便宜模型≠便宜 Agent。模型便宜只是单次推理价格压下去，成本在环境/工具/上下文/重试/评估/审计/回滚里重新出现。

## 五大后续信号

价格持续性 / 硬件实质适配 / 开源工程落地 / Harness 产品真实运行 / 商业协议披露
