---
source: wechat
source_url: "http://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651042656&idx=3&sn=8609a7dcae8fb73c7e3aa1d8feea3180&chksm=84e6771eb391fe086132cc6c70341612c864b35fb324661218a9738f88067150f469ee82e78e#rd"
ingested: 2026-07-04
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-04
sha256: e9c47625dc5e928af111753cfe6bc1c820ecb1d7e7fb19c0b13e907f07634c1e
---

# 上海交大提出ICRDrag：首个上下文区域拖拽模型，实现精准可控图像编辑

还在用 DragGAN、DragDiffusion 拖拽修图？点选拖拽容易变形、边界割裂、细节丢失的时代落幕了！ECCV 2026 ICRDrag 首创上下文区域拖拽模型，用掩码精准定位局部区域，移动、缩放、变形全都丝滑自然，兼顾精准度与画面真实感。

* Paper: https://arxiv.org/pdf/2606.25907
* GitHub: https://github.com/bcmi/ICRDrag-Region-Drag-Editing
* Demo: https://drag.ustcnewly.com/

## 效果展示

左边蓝色掩码是源区域，右边红色掩码是目标区域。拖拽编辑旨在把源区域拖拽到目标区域，其他区域除了必要的跟随性改动之外，细节尽量保持不变。用户可以用不同颜色画出多对源区域和目标区域（最多支持 5 对）。

## 直击痛点

传统拖拽修图的痛点：
- **基于单点拖拽**：DragGAN, DragDiffusion 仅靠少量点对控制画面，点对信息模糊，AI 经常猜不透想法。
- **现有区域拖拽**：RegionDrag, DragFlow 等改用掩码控制区域，但物体拖拽后边缘断层、背景融合生硬。

## 上下文区域拖拽

ECCV 2026 ICRDrag（In-Context Region-based Drag）全新解法：

* **上下文学习框架**：基于 DiT 上下文学习框架，一次性输入原图、源区域掩码、目标区域掩码，直接输出编辑完成的图片。
* **图像-掩码注意力一致性约束**：目标图像的注意力分布必须和目标掩码匹配源掩码的分布保持一致。
* **源-目标双向注意力对应约束**：目标物体看向原图对应区域，原图区域也反向关注目标物体。
* **图片/掩码专属模态 LoRA**：为图像、掩码分支使用独立 LoRA。
* **分阶段课程式训练**：第一阶段用完整语义掩码训练，第二阶段用稀疏不完整掩码训练，随机膨胀模拟手绘粗糙选区。

## 大规模数据集

基于百万级视频数据集 OpenVid，打造首个大规模区域拖拽数据集 PRD（Paired Region Dataset）：
- **训练集**：28.7 万组配对样本
- **评测基准 PRDBench**：1000 组人工校验高质量样本

## 实验室

出自上海交通大学牛力实验室，主要工作在图像生成和编辑领域。
