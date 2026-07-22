---
title: "60000小时炼出新开源VLA！20多种机器人都能用"
source_url: "https://mp.weixin.qq.com/s/GBkj3L9z1_ihq6vrUDrbJw"
source_site: "量子位"
author: "金磊"
ingested: "2026-07-08"
sha256: "b4265ee5c733e6860de8d393ca10629dc9b811a4f240ac98b6bbf6828c78dad8"
type: raw
tags:
  - vla
  - embodied-ai
  - lingbot
  - ant-group
  - open-source
  - robot
  - depth-estimation
  - future-prediction
---

> 蚂蚁灵波发布 LingBot-VLA 2.0，一个面向复杂物理世界任务的通用 VLA 模型，训练数据达 60,000 小时，覆盖 20 种机器人构型，完全开源。

## 数据规模

- 总计 60,000 小时真实物理数据（50,000 小时机器人轨迹 + 10,000 小时第一视角人类操作视频）
- 较 1 月发布的 V1.0（20,000 小时）增长 3 倍
- 覆盖 20 种机器人构型：Leju、Franka、AgileX、ARX Lift2、Galaxea R1Pro、Astribot S1、Unitree G1、Fourier GR-2、AgiBot A2 等

## 关键技术升级

1. **动作空间扩展**：从双臂扩展到头部、腰部、移动底盘、灵巧手等更完整的动作空间
2. **空间理解增强**：融合 LingBot-Depth 2.0 深度模型，让机器人获得更强空间理解
3. **未来预测能力**：引入未来深度预测和语义特征预测，让模型理解当前状态的同时预测未来状态。采用 DINO-Video 视频表征模型做蒸馏监督
4. **推理速度**：在英伟达 RTX 4090 上推理延迟低于 130ms

## GM-100 基准评测

在 GM-100 多任务 Generalist Benchmark 上，LingBot-VLA 2.0 在多种平台和任务上超越 GR00T N1.7、π0.5 和 V1.0。

## 意义

机器人的身体继续百花齐放，但通用大脑的趋势会愈加收敛。LingBot-VLA 2.0 试图成为具身智能领域的通用操作基座。
