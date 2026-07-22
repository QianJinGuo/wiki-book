---
title: "今天，「空间原生」时代正式到来！—— 蚂蚁灵波 LingBot-Vision 空间原生视觉基础模型"
source_url: "https://mp.weixin.qq.com/s/3C6ndYsu5T3h6l6hfiZHsA"
author: "机器之心"
feed_name: "机器之心"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [lingbot, spatial-vision, robotics, embodied-ai, vision-foundation-model, boundary-centric-masked-modeling, depth-estimation, ant-robotics]
type: article
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: d8899a54a29c07e9da46635bee6931837987cc22a39185281016d78b2a0836f5
---

# 今天，「空间原生」时代正式到来！—— 蚂蚁灵波 LingBot-Vision

蚂蚁灵波发布新一代空间感知模型 LingBot-Depth 2.0，并开源面向具身智能的视觉基础模型 LingBot-Vision。

## LingBot-Vision：空间原生视觉基础模型

LingBot-Vision 是全球首个"空间原生"视觉基础模型，核心创新是 **以边界为中心的掩码建模（Boundary-centric Masked Modeling）**。

### 核心洞察
过去主流视觉基础模型（如 DINOv3）在决定"盖住哪块 patch"时用随机遮盖。蚂蚁灵波的洞察：这个决定不该随机做——**图像里最难猜、信息量最大的地方是物体的边界**，因为边界两侧语义不同、结构断裂。

### 方法
1. 模型自己在训练过程中实时预测图像里的边界在哪
2. 强制把这些 boundary patch 塞进被遮盖的集合
3. 逼着模型只能靠上下文重建物体的几何结构

**自举难题**：从零开始的模型一开始不知道边界在哪——解法：给定稀疏角点后，即使边界场数值随机生成，解码出的线段依然连贯合理。边界结构先靠"猜个大概"的角点撑住，后续训练慢慢补细节。

**避免训练坍缩**：把边界预测转成分类问题，引入 **a-contrario 检验**自动过滤不够显著的伪边界。

### 训练效率
- 参数：约 1.1B (ViT-g/16)
- 语料库：1.61 亿张图片（从 20 亿张中筛选）
- DINOv3 对比：16.89 亿张图片，训练量不到 DINOv3 的 1/3

### 核心性能
| 任务 | LingBot-Vision (1.1B) | DINOv3 (7B) |
|---|---|---|
| NYUv2 深度 RMSE | **0.296** | 0.309 |
| 分割 | 与 DINOv3 ViT-H+ (0.8B) 持平 | — |
| 分类 | 落后（设计权衡：关注几何>语义） | 领先 |

蒸馏后的 0.3B ViT-L 学生模型在 NYUv2 深度估计上追平 7B DINOv3（~23x 参数差）。

### 与 DINOv3 的关系
二者不是取代关系，都建立在 DINO 自蒸馏范式之上。分水岭在掩码建模：DINOv3 随机遮盖，LingBot-Vision 主动识别边界区域强制遮盖。

## LingBot-Depth 2.0

在 LingBot-Vision 底座上构建的深度估计模型。

### 改进
1. 编码器从 DINOv2 换成 LingBot-Vision
2. 训练数据从 300 万扩大到 1.5 亿

### 结果
- 16 项测试，12 个最优
- DIODE-Indoor RMSE: LingBot-Vision ViT-L 0.094 vs DINOv2 初始化 0.152
- 透明/反光物体（ClearGrasp）表现突出
- 已获得奥比中光深度视觉实验室专业认证

### 商业化
奥比中光已集成 LingBot-Depth 2.0 至 EGO-RGBD 数采设备，计划年底推出集成商业版的一体化相机产品。

## 技术报告与开源

- 技术报告：arXiv:2607.05247
- 项目页：https://technology.robbyant.com/lingbot-vision
- GitHub：https://github.com/robbyant/lingbot-vision
- HF：https://huggingface.co/collections/robbyant/lingbot-vision
- ModelScope：https://www.modelscope.cn/collections/Robbyant/LingBot-Vision
