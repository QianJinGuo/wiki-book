---
title: "刚刚，全球首个超高帧世界模型诞生！英伟达含量0，狂飙50帧"
source_url: "https://mp.weixin.qq.com/s/_zGJwc6gdPGFb6BC7ABirg"
source_site: "新智元"
author: "ASI启示录"
ingested: "2026-07-08"
sha256: "db412eaf244d64051e6a92b883ea21fee19bc5c03ad0e08cf87a12a74fadbdad"
type: raw
tags:
  - moworld
  - flash-world-model
  - world-model
  - npu
  - huawei-ascend
  - real-time
  - magicore
  - domestic-computing
---

> 魔芯科技联合浙江大学发布 MoWorld——全球首个 Flash World Model，也是首个全栈基于国产 NPU 构建的实时交互世界模型。推理成本比同规模 GPU 方案降低 70%。

## 核心指标

- **帧率**：50FPS 实时交互（行业此前 5–10FPS）
- **模型**：14B MoE 架构
- **算力**：华为 Ascend 910C CloudMatrix 384 NPU，英伟达含量 0
- **成本**：推理成本比同规模 GPU 方案降低 70%
- **分辨率**：支持 1080P+
- **控制**：完整 6 自由度相机控制（WASD + 鼠标）

## 技术创新

1. **全栈国产算力**：从数据、训练、蒸馏到推理部署，每一环节围绕国产 NPU 重新设计
2. **数据管线**：全自采、全 3D 标注，不仅标注相机轨迹，还标注物体的几何尺寸和空间结构
3. **训练优化**：超密集注意力并行、长序列 Token 并行，缓解超长视频训练显存压力
4. **推理优化**：流水线执行、层级化序列并行、动态混合精度量化

## 应用场景

游戏与互动娱乐（6DOF 自由探索）、具身智能与机器人（合成数据+闭环验证）、自动驾驶（4D 场景推演）、数字孪生与智慧城市

团队表示近期将开源权重和代码。
