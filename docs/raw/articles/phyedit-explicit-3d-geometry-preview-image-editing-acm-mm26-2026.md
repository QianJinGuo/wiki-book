---
source: wechat
source_url: https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247912028&idx=4&sn=c106858467e16b7df780265696c61fe3
ingested: 2026-08-13
feed_name: WeChat-量子位
source_published: 2026-08-13
sha256: a283f271af0679b91808e9b4a08c2beb1f45393da3404f602670cccb81765248
title: "3D指标超过Nano Banana Pro！浙大开源方案让AI在平面图像里进行立体编辑 | ACM MM'26"
type: raw-article
tags: [raw, 3d-editing, image-editing, diffusion, dit, acm-mm26, zju-reler, phyedit, geometry]
---

# 3D指标超过Nano Banana Pro！浙大开源方案让AI在平面图像里进行立体编辑 | ACM MM'26

关注前沿科技 2026-08-13 15:38 北京

摆脱文本盲猜，用显式3D几何约束解决AI图像编辑瓶颈

##### ReLER 团队 投稿   
量子位 | 公众号 QbitAI

图像编辑常有这种需求：一排物体摆在桌上，需要把最后方的物体移动到最前方。

这对人类来说是自然的视觉透视，但对AI而言，却是一连串复杂的几何难题。

物体靠近后尺寸要放大，遮挡关系需要重新计算，原位置不能留残影，外观和纹理还得保持原样——任何一个环节出错，画面就会立刻穿帮。

每一步都关乎三维空间的物理常识，而这恰恰是当前图像编辑模型最容易翻车的地方——语义指令它听懂了，但生成出来的三维状态，却常常错得离谱。

针对这一问题，**浙江大学ReLER团队** 提出并开源**PhyEdit** ，用显式3D几何preview指导DiT图像编辑，让模型更准确地处理物体远近、尺度、遮挡和多物体操作。论文已被ACM MM 2026接收。

## 一句话概括：让几何模块负责"搬"，让生成模型负责"画"

PhyEdit的核心流程可以拆成四步：

- 用户给定待操作物体和三维操作指令 _（可以是移动或者6DOF）_ ；
- 估计场景深度和相机参数，把物体反投影成三维点云；
- 在3D空间中移动点云，再投影成目标preview；
- 将源图、preview和文本一起交给Qwen-Image-Edit backbone，生成最终图像。

preview并不需要看起来像一张完整照片。它只要清楚表达"物体应该在哪里、应该多大、应该挡住谁"，生成模型就可以从源图中恢复纹理和身份，把粗糙几何修成自然结果。

因此，PhyEdit避开了两个极端：**既不是让大模型完全靠prompt猜三维空间，也不是把点云投影直接当成最终图像。**

## 再补一层深度监督

模型生成的画面"看着像"并不代表目标深度正确。PhyEdit在基础flow-matching loss之外，加入**像素级SILog depth loss：** 先从预测velocity恢复编辑图，再比较编辑图和目标图的深度。

**消融结果很直接：** 不使用深度监督：DIoU 62.37、Chamfer 24.52；latent-to-depth：DIoU 64.19、Chamfer 20.87；pixel-level方案：DIoU 65.33、Chamfer 18.93。

## 训练数据从哪里来？RealManip-40K

团队构建了RealManip-40K，包含41154对真实场景图像，提供深度、物体mask和代表性三维坐标。

为了保证图像对中的变化主要来自物体而非相机，数据管线利用3D foundation model的camera token进行聚类，筛选相机近似静止的视频片段。之后再完成目标检测、跟踪、分割、深度估计和三维位移筛选。

RealManip-40K重点覆盖三类难题：**明显的远近变化、复杂遮挡，以及多个对象同时操作。**

## 专门造了个3D编辑考场：ManipEval

现有图像编辑benchmark经常只看画质、文本一致性或二维位置。PhyEdit团队进一步构建**ManipEval：** 共200对图像、约320个物体，其中一半为单物体操作，另一半为多物体操作。

它从五个层面考察模型：

- 2D落点是否准确；
- 深度是否正确；
- 重建后的三维点云是否接近目标；
- 物体身份和画质是否保留；
- 光照、接触与遮挡是否合理。

PhyEdit的主要成绩为：DIoU 65.33、Mask IoU 27.20、Chamfer 18.93、RA-DINO 36.91、Phys-VLM 93.72。

与Nano Banana Pro对比，DIoU提升5.36，Chamfer距离降低6.40，RA-DINO提升2.14。

从结果图看，商业模型常见的问题包括：物体仍留在源位置、只操作了多物体指令中的一部分、把目标放到错误深度，或在遮挡区域改变物体身份。PhyEdit在大幅移动、小尺寸物体以及多人操作等场景中更稳定。

## 还能把一次编辑变成连续动作

给出一条三维轨迹后，PhyEdit会在轨迹上的多个位置生成关键状态，再由视频模型插值出中间帧。

下面这只机械臂没有出现在训练分布中，仍能沿曲线把红笔移动到纸张左下方。实线边框是PhyEdit直接生成的关键帧，虚线边框是插值帧。

## 只会搬东西？普通编辑能力也保住了

研究者还测试了改变颜色、材质、图案和添加局部元素等任务。PhyEdit需要一次生成同时完成外观编辑与三维操作，综合成功率为87.5%；Qwen-Image-Edit单独完成普通编辑时为88.8%。

两者只差1.3个百分点，但PhyEdit的三维精度明显更高，说明加入几何控制没有让基础编辑能力大幅退化。

## GUI也一起开源

PhyEdit提供交互式前端。上传图片后，用户可以轻松分割并选择多个物体，在三维点云中调整平移和旋转，再生成最终图片。

## 不是物理引擎，但向"可交互世界模型"迈了一步

团队对PhyEdit的定位比较克制：它不是完整physics simulator，不会显式计算受力、碰撞和动力学。透明反光物体、极端近景移动以及严重的深度或分割错误仍可能导致失败。

PhyEdit解决的是更具体的问题：当动作已经由用户指定时，如何把一个明确的三维操作渲染成几何合理的视觉状态。这种"显式几何+生成渲染"的组合，为机器人视觉规划、交互式内容和图像状态预测提供了一个可复现的开源起点。

_论文链接：<https://arxiv.org/abs/2604.07230>  
项目主页：<https://nenhang.github.io/PhyEdit>  
代码：<https://github.com/nenhang/PhyEdit>  
模型：<https://huggingface.co/ruihangxu/PhyEdit>  
数据集：<https://huggingface.co/datasets/ruihangxu/RealManip-40K>_
